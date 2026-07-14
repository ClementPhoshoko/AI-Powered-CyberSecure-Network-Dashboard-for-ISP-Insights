import { useState, useCallback, useRef } from 'react';
import {
  streamDownloadTest,
  submitDownloadResults,
  streamUploadTest,
  submitUploadResults
} from '../services/speedService';
import { pingHealthCheck, runPingTest } from '../services/pingService';
import { calculateNetworkScores as calculateNetworkScoresService, generateAISummary } from '../services/networkService';
import api from '../services/api';
import { getFriendlyErrorMessage } from '../services/errorUtils';

const TEST_PHASES = {
  IDLE: 'idle',
  INITIALIZING: 'initializing',
  PING: 'ping',
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
  CALCULATING: 'calculating',
  COMPLETE: 'complete',
  ERROR: 'error'
};

const DOWNLOAD_SIZES = [1, 5, 10, 20]; // MB
const UPLOAD_SIZES = [0.5, 1, 5, 10, 20]; // MB
const PING_COUNT = 10;
const DOWNLOAD_PHASE_TARGET_SECONDS = 5;
const UPLOAD_PHASE_TARGET_SECONDS = 4;
const DOWNLOAD_MIN_ATTEMPTS = 2;
const UPLOAD_MIN_ATTEMPTS = 2;
const DOWNLOAD_MAX_ATTEMPTS = 4;
const UPLOAD_MAX_ATTEMPTS = 4;
const DOWNLOAD_STABILITY_THRESHOLD = 0.12;
const UPLOAD_STABILITY_THRESHOLD = 0.15;
const DOWNLOAD_STABLE_AFTER_SECONDS = 3;
const UPLOAD_STABLE_AFTER_SECONDS = 2.5;
// If max-pass-speed is more than this × min-pass-speed, flag unstable
const STABILITY_RATIO_THRESHOLD = 2.5;
const DEFAULT_MEASUREMENT_CONTEXT = {
  probe_method: 'http-health',
  probe_method_label: 'HTTP health endpoint probe',
  latency_label: 'HTTP probe latency',
  latency_summary_label: 'HTTP probe latency (avg)',
  jitter_label: 'HTTP probe jitter',
  packet_loss_label: 'HTTP probe failure rate estimate',
  transport_level: false,
  description: 'Latency and jitter are measured with repeated HTTP requests to the backend health endpoint, not ICMP.'
};
const DEFAULT_SCORE_CONTEXT = {
  score_label: 'Derived suitability score',
  score_method: 'derived-http-probe-estimate',
  score_method_label: 'Derived estimate from throughput + HTTP probes',
  score_confidence_label: 'medium',
  score_confidence_value: 60,
  score_explanation:
    'Scores are derived estimates from measured throughput plus HTTP probe latency and HTTP probe jitter. They are directional and should not be treated like true ICMP or transport-layer measurements.'
};

function getRelativeDelta(currentValue, previousValue) {
  if (!Number.isFinite(currentValue) || !Number.isFinite(previousValue)) {
    return Number.POSITIVE_INFINITY;
  }

  const baseline = Math.max(Math.abs(previousValue), 1);
  return Math.abs(currentValue - previousValue) / baseline;
}

function shouldStopAdaptivePhase({
  measurements,
  elapsedSeconds,
  minAttempts,
  maxAttempts,
  targetSeconds,
  stabilityThreshold,
  stableAfterSeconds
}) {
  if (measurements.length >= maxAttempts) {
    return true;
  }

  if (elapsedSeconds >= targetSeconds && measurements.length >= minAttempts) {
    return true;
  }

  if (measurements.length < minAttempts) {
    return false;
  }

  if (measurements.length < minAttempts + 1) {
    return false;
  }

  if (elapsedSeconds < stableAfterSeconds) {
    return false;
  }

  const lastMeasurement = measurements[measurements.length - 1];
  const previousMeasurement = measurements[measurements.length - 2];
  const currentSpeed =
    lastMeasurement.download_speed_mbps ?? lastMeasurement.upload_speed_mbps ?? 0;
  const previousSpeed =
    previousMeasurement.download_speed_mbps ?? previousMeasurement.upload_speed_mbps ?? 0;

  return getRelativeDelta(currentSpeed, previousSpeed) <= stabilityThreshold;
}

function chooseAdaptiveDownloadSize(lastSpeedMbps) {
  if (!Number.isFinite(lastSpeedMbps) || lastSpeedMbps <= 0) {
    return DOWNLOAD_SIZES[0];
  }

  if (lastSpeedMbps < 15) return 1;
  if (lastSpeedMbps < 80) return 5;
  if (lastSpeedMbps < 250) return 10;
  return 20;
}

function chooseAdaptiveUploadSize(lastSpeedMbps) {
  if (!Number.isFinite(lastSpeedMbps) || lastSpeedMbps <= 0) {
    return UPLOAD_SIZES[0];
  }

  if (lastSpeedMbps < 8) return 0.5;
  if (lastSpeedMbps < 25) return 1;
  if (lastSpeedMbps < 120) return 5;
  if (lastSpeedMbps < 250) return 10;
  return 20;
}

export function useSpeedTest() {
  const [phase, setPhase] = useState(TEST_PHASES.IDLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [testResult, setTestResult] = useState(null);
  const abortControllerRef = useRef(null);
  const isStoppedRef = useRef(false);

  const stopTest = useCallback(() => {
    isStoppedRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setPhase(TEST_PHASES.IDLE);
    setLoading(false);
    setError(null);
    setCurrentSpeed(0);
    setProgress(0);
    setTestResult(null);
  }, []);

  const resetTest = useCallback(() => {
    isStoppedRef.current = false;
    setPhase(TEST_PHASES.IDLE);
    setLoading(false);
    setError(null);
    setCurrentSpeed(0);
    setProgress(0);
    setTestResult(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const runPingTests = useCallback(async () => {
    if (isStoppedRef.current) return null;
    setPhase(TEST_PHASES.PING);
    setProgress(20);

    let probeTarget = '/ping/health';
    if (api.defaults.baseURL) {
      try {
        probeTarget = new URL('/ping/health', api.defaults.baseURL).toString();
      } catch {
        probeTarget = `${api.defaults.baseURL}/ping/health`;
      }
    }

    // Fire all pings concurrently — 1×RTT instead of 10×RTT, same accuracy
    const startTotal = performance.now();
    let completedCount = 0;

    const pingPromises = Array.from({ length: PING_COUNT }, async (_, i) => {
      const start = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15_000);
      try {
        await pingHealthCheck(controller.signal);
        clearTimeout(timeoutId);
        const latency = Math.max(1, performance.now() - start);
        completedCount++;
        setProgress(20 + (completedCount / PING_COUNT) * 10);
        return { sequence_number: i, latency_ms: latency, success: true, failure_reason: null };
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          completedCount++;
          setProgress(20 + (completedCount / PING_COUNT) * 10);
          return { sequence_number: i, latency_ms: null, success: false, failure_reason: 'timeout' };
        }
        completedCount++;
        setProgress(20 + (completedCount / PING_COUNT) * 10);
        return { sequence_number: i, latency_ms: null, success: false, failure_reason: err?.code || err?.name || 'request_failed' };
      }
    });

    const pings = await Promise.all(pingPromises);

    if (isStoppedRef.current) return null;
    const totalDuration = (performance.now() - startTotal) / 1000;
    const packetLossPercent = ((PING_COUNT - pings.filter((ping) => ping.success).length) / PING_COUNT) * 100;

    const pingResult = await runPingTest({
      pings,
      packet_loss_percent: packetLossPercent,
      test_duration_seconds: totalDuration,
      probe_method: 'http-health',
      probe_target: probeTarget
    });

    return pingResult.data;
  }, []);

  const runDownloadTest = useCallback(async (testResultId) => {
    if (isStoppedRef.current) return null;
    setPhase(TEST_PHASES.DOWNLOAD);
    setCurrentSpeed(0);
    setProgress(30);

    const measurements = [];
    let finalResult = null;
    const phaseStart = performance.now();
    let lastSpeedMbps = 0;
    let lastError = null;
    let maxSpeed = 0;
    let minSpeed = Infinity;
    let bestMeasurement = null;

    for (let i = 0; i < DOWNLOAD_MAX_ATTEMPTS; i++) {
      if (isStoppedRef.current) return null;
      const sizeMb =
        i === 0
          ? DOWNLOAD_SIZES[0]
          : chooseAdaptiveDownloadSize(lastSpeedMbps);
      const start = performance.now();

      // Collect per-chunk speed samples for steady-state averaging
      const speedSamples = [];

      try {
        abortControllerRef.current = new AbortController();
        const timeoutId = setTimeout(() => abortControllerRef.current.abort(), 30_000);

        const onDownloadProgress = (_smoothMbps, instantMbps, fileProgress) => {
          speedSamples.push(instantMbps);
          setCurrentSpeed(_smoothMbps);
          const phaseProgress = 30 + ((i + (fileProgress / 100)) / DOWNLOAD_MAX_ATTEMPTS) * 30;
          setProgress(phaseProgress);
        };

        await streamDownloadTest(sizeMb, abortControllerRef.current.signal, onDownloadProgress);
        clearTimeout(timeoutId);

        const durationSeconds = (performance.now() - start) / 1000;

        // Use steady-state speed (average of second half of samples) instead of
        // total-bytes/total-time, which is pulled down by TCP slow-start at the
        // beginning of each pass.
        const steadySamples = speedSamples.slice(Math.floor(speedSamples.length / 2));
        const steadySpeed = steadySamples.length > 1
          ? steadySamples.reduce((a, b) => a + b, 0) / steadySamples.length
          : (sizeMb * 8) / durationSeconds;

        const measurement = {
          file_size_mb: sizeMb,
          download_speed_mbps: steadySpeed,
          test_duration_seconds: durationSeconds
        };

        measurements.push(measurement);
        if (!bestMeasurement || steadySpeed > maxSpeed) {
          maxSpeed = steadySpeed;
          bestMeasurement = measurement;
        }
        if (steadySpeed < minSpeed) minSpeed = steadySpeed;
        finalResult = bestMeasurement;
        lastSpeedMbps = steadySpeed;
        setCurrentSpeed(steadySpeed);
        setProgress(30 + ((i + 1) / DOWNLOAD_MAX_ATTEMPTS) * 30);

        const elapsedSeconds = (performance.now() - phaseStart) / 1000;
        if (
          shouldStopAdaptivePhase({
            measurements,
            elapsedSeconds,
            minAttempts: DOWNLOAD_MIN_ATTEMPTS,
            maxAttempts: DOWNLOAD_MAX_ATTEMPTS,
            targetSeconds: DOWNLOAD_PHASE_TARGET_SECONDS,
            stabilityThreshold: DOWNLOAD_STABILITY_THRESHOLD,
            stableAfterSeconds: DOWNLOAD_STABLE_AFTER_SECONDS
          })
        ) {
          break;
        }
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        lastError = err;
        console.error('Download test failed:', err);
      }
    }

    if (isStoppedRef.current) return null;
    if (measurements.length === 0 || !finalResult) {
      throw lastError || new Error('Download test failed before a valid measurement could be captured.');
    }
    if (measurements.length > 0) {
      await submitDownloadResults({
        test_result_id: testResultId,
        final_result: finalResult,
        all_measurements: measurements
      });
    }

    const wasUnstable = minSpeed < Infinity && maxSpeed > 0
      && (maxSpeed / minSpeed) > STABILITY_RATIO_THRESHOLD;

    return { measurements, finalResult, wasUnstable };
  }, []);

  const runUploadTest = useCallback(async (testResultId, downloadWasUnstable = false) => {
    if (isStoppedRef.current) return null;
    setPhase(TEST_PHASES.UPLOAD);
    setCurrentSpeed(0);
    setProgress(60);

    const measurements = [];
    let finalUploadSpeed = 0;
    let finalResult = null;
    const phaseStart = performance.now();
    let lastError = null;
    let maxSpeed = 0;
    let minSpeed = Infinity;
    let bestMeasurement = null;

    for (let i = 0; i < UPLOAD_MAX_ATTEMPTS; i++) {
      if (isStoppedRef.current) return null;
      const sizeMb =
        i === 0
          ? UPLOAD_SIZES[0]
          : chooseAdaptiveUploadSize(finalUploadSpeed);
      const sizeBytes = sizeMb * 1024 * 1024;

      // Build upload data in chunks instead of one large ArrayBuffer
      const CHUNK_SIZE = 256 * 1024; // 256 KB
      const chunks = [];
      let remaining = sizeBytes;
      while (remaining > 0) {
        const size = Math.min(CHUNK_SIZE, remaining);
        chunks.push(new Blob([new Uint8Array(size)]));
        remaining -= size;
      }
      const data = new Blob(chunks);

      const speedSamples = [];
      const start = performance.now();

      try {
        abortControllerRef.current = new AbortController();
        const timeoutId = setTimeout(() => abortControllerRef.current.abort(), 30_000);

        const onUploadProgress = (_smoothMbps, instantMbps, fileProgress) => {
          speedSamples.push(instantMbps);
          setCurrentSpeed(_smoothMbps);
          const phaseProgress = 60 + ((i + (fileProgress / 100)) / UPLOAD_MAX_ATTEMPTS) * 25;
          setProgress(phaseProgress);
        };

        await streamUploadTest(sizeMb, data, abortControllerRef.current.signal, onUploadProgress);
        clearTimeout(timeoutId);

        const durationSeconds = (performance.now() - start) / 1000;

        const steadySamples = speedSamples.slice(Math.floor(speedSamples.length / 2));
        const steadySpeed = steadySamples.length > 1
          ? steadySamples.reduce((a, b) => a + b, 0) / steadySamples.length
          : (sizeMb * 8) / durationSeconds;

        const measurement = {
          size_mb: sizeMb,
          duration_seconds: durationSeconds,
          upload_speed_mbps: steadySpeed
        };

        measurements.push(measurement);
        if (!bestMeasurement || steadySpeed > maxSpeed) {
          maxSpeed = steadySpeed;
          bestMeasurement = measurement;
        }
        if (steadySpeed < minSpeed) minSpeed = steadySpeed;
        finalResult = bestMeasurement;
        finalUploadSpeed = steadySpeed;
        setCurrentSpeed(steadySpeed);
        setProgress(60 + ((i + 1) / UPLOAD_MAX_ATTEMPTS) * 25);

        const elapsedSeconds = (performance.now() - phaseStart) / 1000;
        if (
          shouldStopAdaptivePhase({
            measurements,
            elapsedSeconds,
            minAttempts: UPLOAD_MIN_ATTEMPTS,
            maxAttempts: UPLOAD_MAX_ATTEMPTS,
            targetSeconds: UPLOAD_PHASE_TARGET_SECONDS,
            stabilityThreshold: UPLOAD_STABILITY_THRESHOLD,
            stableAfterSeconds: UPLOAD_STABLE_AFTER_SECONDS
          })
        ) {
          break;
        }
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        lastError = err;
        console.error('Upload test failed:', err);
      }
    }

    if (isStoppedRef.current) return null;
    if (measurements.length === 0 || !finalResult) {
      throw lastError || new Error('Upload test failed before a valid measurement could be captured.');
    }

    const wasUnstable = downloadWasUnstable || (minSpeed < Infinity && maxSpeed > 0
      && (maxSpeed / minSpeed) > STABILITY_RATIO_THRESHOLD);

    if (measurements.length > 0) {
      await submitUploadResults({
        test_result_id: testResultId,
        measurements,
        final_upload_speed_mbps: maxSpeed,
        was_unstable: wasUnstable
      });
    }

    return { measurements, finalResult, wasUnstable };
  }, []);

  const calculateNetworkScores = useCallback(async (testResultId) => {
    if (isStoppedRef.current) return null;
    setPhase(TEST_PHASES.CALCULATING);
    setProgress(90);

    const response = await calculateNetworkScoresService(testResultId);

    if (isStoppedRef.current) return null;
    setProgress(100);
    return response.data;
  }, []);

  const createAISummary = useCallback(async (testResultId) => {
    if (isStoppedRef.current) return null;
    const response = await generateAISummary(testResultId);
    return response.data;
  }, []);

  const startTest = useCallback(async () => {
    try {
      resetTest();
      setLoading(true);
      setPhase(TEST_PHASES.INITIALIZING);

      if (isStoppedRef.current) return null;

      // 1. Run ping test (this creates the test result in the database)
      const pingData = await runPingTests();
      if (isStoppedRef.current || !pingData) return null;
      const testResultId = pingData.id;

      // 2. Run download test
      const downloadData = await runDownloadTest(testResultId);
      if (isStoppedRef.current || !downloadData) return null;

      // 3. Run upload test
      const uploadData = await runUploadTest(testResultId, downloadData.wasUnstable);
      if (isStoppedRef.current || !uploadData) return null;

      // 4. Calculate network scores
      const scores = await calculateNetworkScores(testResultId);
      if (isStoppedRef.current || !scores) return null;

      // 5. Combine all data (without AI summary first) and show results immediately!
      const completeResult = {
        download_speed_mbps: downloadData.finalResult?.download_speed_mbps || 0,
        upload_speed_mbps: uploadData.finalResult?.upload_speed_mbps || 0,
        ping_avg_ms: pingData.ping_avg_ms || 0,
        ping_median_ms: pingData.ping_median_ms || 0,
        jitter_ms: pingData.jitter_ms || 0,
        packet_loss_percent: pingData.packet_loss_percent || 0,
        probe_method: pingData.probe_method || 'http-health',
        probe_target: pingData.probe_target || null,
        probe_sample_count: pingData.probe_sample_count || PING_COUNT,
        successful_probe_count: pingData.successful_probe_count || 0,
        failed_probe_count: pingData.failed_probe_count || 0,
        network_health_score: scores.network_health_score || 0,
        gaming_score: scores.gaming_score || 0,
        streaming_score: scores.streaming_score || 0,
        video_call_score: scores.video_call_score || 0,
        browsing_score: scores.browsing_score || 0,
        score_method: scores.score_method || DEFAULT_SCORE_CONTEXT.score_method,
        score_confidence_label:
          scores.score_confidence_label || DEFAULT_SCORE_CONTEXT.score_confidence_label,
        score_confidence_value:
          scores.score_confidence_value ?? DEFAULT_SCORE_CONTEXT.score_confidence_value,
        score_explanation: scores.score_explanation || DEFAULT_SCORE_CONTEXT.score_explanation,
        score_context: scores.score_context || DEFAULT_SCORE_CONTEXT,
        raw_weighted_scores: scores.raw_weighted_scores || null,
        measurement_context: pingData.measurement_context || DEFAULT_MEASUREMENT_CONTEXT,
        ai_summary: '', // Start with empty, will update later
        download_measurements: downloadData.measurements || [],
        upload_measurements: uploadData.measurements || [],
        ping_measurements: pingData.ping_measurements || [],
        was_unstable: downloadData.wasUnstable || uploadData.wasUnstable || false
      };

      // Show results immediately!
      setTestResult(completeResult);
      setPhase(TEST_PHASES.COMPLETE);
      setCurrentSpeed(0);

      // 6. Generate AI summary in the background, don't wait for it!
      (async () => {
        try {
          const aiSummaryResult = await createAISummary(testResultId);
          // Update test result with AI summary once it's ready
          setTestResult(prevResult => prevResult ? {
            ...prevResult,
            ai_summary: aiSummaryResult?.ai_summary || prevResult.ai_summary
          } : null);
        } catch (summaryError) {
          console.error('AI summary generation failed:', summaryError);
        }
      })();

      return completeResult;
    } catch (err) {
      if (err.name === 'AbortError') {
        // Test was intentionally stopped - don't show an error
        console.log('Speed test was stopped');
        return null;
      }
      console.error('Speed test failed:', err);
      
      // User-friendly error messages
      setError(getFriendlyErrorMessage(err));
      setPhase(TEST_PHASES.ERROR);
      return null;
    } finally {
      setLoading(false);
    }
  }, [resetTest, runPingTests, runDownloadTest, runUploadTest, calculateNetworkScores, createAISummary]);

  return {
    startTest,
    stopTest,
    resetTest,
    phase,
    loading,
    error,
    currentSpeed,
    progress,
    testResult,
    isIdle: phase === TEST_PHASES.IDLE,
    isRunning: phase !== TEST_PHASES.IDLE && phase !== TEST_PHASES.COMPLETE && phase !== TEST_PHASES.ERROR,
    isComplete: phase === TEST_PHASES.COMPLETE,
    hasError: phase === TEST_PHASES.ERROR
  };
}

export default useSpeedTest;
