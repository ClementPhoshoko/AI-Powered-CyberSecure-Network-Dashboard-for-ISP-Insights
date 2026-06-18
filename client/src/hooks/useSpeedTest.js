import { useState, useCallback, useRef } from 'react';
import {
  streamDownloadTest,
  submitDownloadResults,
  streamUploadTest,
  submitUploadResults
} from '../services/speedService';
import { runPingTest } from '../services/pingService';
import api from '../services/api';

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
const PING_COUNT = 5;

export function useSpeedTest() {
  const [phase, setPhase] = useState(TEST_PHASES.IDLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [testResult, setTestResult] = useState(null);
  const abortControllerRef = useRef(null);

  const resetTest = useCallback(() => {
    setPhase(TEST_PHASES.IDLE);
    setLoading(false);
    setError(null);
    setCurrentSpeed(0);
    setProgress(0);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const runPingTests = useCallback(async () => {
    setPhase(TEST_PHASES.PING);
    setProgress(20);

    const pings = [];
    const startTotal = performance.now();

    for (let i = 0; i < PING_COUNT; i++) {
      const start = performance.now();
      try {
        await api.get('/api/ping/health'); // Simple health check for ping
        const end = performance.now();
        pings.push({
          sequence_number: i,
          latency_ms: Math.max(1, end - start)
        });
      } catch {
        pings.push({
          sequence_number: i,
          latency_ms: 0
        });
      }
      setProgress(20 + ((i + 1) / PING_COUNT) * 10);
    }

    const totalDuration = (performance.now() - startTotal) / 1000;
    const packetLossPercent = ((PING_COUNT - pings.filter(p => p.latency_ms > 0).length) / PING_COUNT) * 100;

    const pingResult = await runPingTest({
      pings,
      packet_loss_percent: packetLossPercent,
      test_duration_seconds: totalDuration
    });

    return pingResult.data;
  }, []);

  const runDownloadTest = useCallback(async (testResultId) => {
    setPhase(TEST_PHASES.DOWNLOAD);
    setProgress(30);

    const measurements = [];
    let finalResult = null;

    for (let i = 0; i < DOWNLOAD_SIZES.length; i++) {
      const sizeMb = DOWNLOAD_SIZES[i];
      const start = performance.now();
      
      try {
        abortControllerRef.current = new AbortController();
        await streamDownloadTest(sizeMb, abortControllerRef.current.signal);
        const end = performance.now();
        const durationSeconds = (end - start) / 1000;
        const speedMbps = (sizeMb * 8) / durationSeconds;

        const measurement = {
          file_size_mb: sizeMb,
          download_speed_mbps: speedMbps,
          test_duration_seconds: durationSeconds
        };

        measurements.push(measurement);
        finalResult = measurement;
        setCurrentSpeed(speedMbps);
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        console.error('Download test failed:', err);
      }

      setProgress(30 + ((i + 1) / DOWNLOAD_SIZES.length) * 30);
    }

    if (measurements.length > 0) {
      await submitDownloadResults({
        test_result_id: testResultId,
        final_result: finalResult,
        all_measurements: measurements
      });
    }

    return { measurements, finalResult };
  }, []);

  const runUploadTest = useCallback(async (testResultId) => {
    setPhase(TEST_PHASES.UPLOAD);
    setProgress(60);

    const measurements = [];
    let finalUploadSpeed = 0;

    for (let i = 0; i < UPLOAD_SIZES.length; i++) {
      const sizeMb = UPLOAD_SIZES[i];
      const sizeBytes = sizeMb * 1024 * 1024;
      const data = new Blob([new ArrayBuffer(sizeBytes)]);
      const start = performance.now();

      try {
        abortControllerRef.current = new AbortController();
        await streamUploadTest(sizeMb, data, abortControllerRef.current.signal);
        const end = performance.now();
        const durationSeconds = (end - start) / 1000;
        const speedMbps = (sizeMb * 8) / durationSeconds;

        const measurement = {
          size_mb: sizeMb,
          duration_seconds: durationSeconds,
          upload_speed_mbps: speedMbps
        };

        measurements.push(measurement);
        finalUploadSpeed = speedMbps;
        setCurrentSpeed(speedMbps);
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        console.error('Upload test failed:', err);
      }

      setProgress(60 + ((i + 1) / UPLOAD_SIZES.length) * 25);
    }

    if (measurements.length > 0) {
      await submitUploadResults({
        test_result_id: testResultId,
        measurements,
        final_upload_speed_mbps: finalUploadSpeed
      });
    }

    return { measurements, finalUploadSpeed };
  }, []);

  const calculateNetworkScores = useCallback(async (testResultId) => {
    setPhase(TEST_PHASES.CALCULATING);
    setProgress(90);

    const response = await api.post('/api/network/score', {
      test_result_id: testResultId
    });

    setProgress(100);
    return response.data.data;
  }, []);

  const startTest = useCallback(async () => {
    try {
      resetTest();
      setLoading(true);
      setPhase(TEST_PHASES.INITIALIZING);

      // 1. Run ping test (this creates the test result in the database)
      const pingData = await runPingTests();
      const testResultId = pingData.id;

      // 2. Run download test
      const downloadData = await runDownloadTest(testResultId);

      // 3. Run upload test
      const uploadData = await runUploadTest(testResultId);

      // 4. Calculate network scores
      const scores = await calculateNetworkScores(testResultId);

      // 5. Combine all data into the format expected by components
      const completeResult = {
        download_speed_mbps: downloadData.finalResult?.download_speed_mbps || 0,
        upload_speed_mbps: uploadData.finalUploadSpeed || 0,
        ping_avg_ms: pingData.ping_avg_ms || 0,
        jitter_ms: pingData.jitter_ms || 0,
        packet_loss_percent: pingData.packet_loss_percent || 0,
        network_health_score: scores.network_health_score || 0,
        gaming_score: scores.gaming_score || 0,
        streaming_score: scores.streaming_score || 0,
        video_call_score: scores.video_call_score || 0,
        browsing_score: scores.browsing_score || 0,
        download_measurements: downloadData.measurements || [],
        upload_measurements: uploadData.measurements || [],
        ping_measurements: pingData.ping_measurements || []
      };

      setTestResult(completeResult);
      setPhase(TEST_PHASES.COMPLETE);
      setCurrentSpeed(0);

      return completeResult;
    } catch (err) {
      console.error('Speed test failed:', err);
      setError(err.message || 'Speed test failed');
      setPhase(TEST_PHASES.ERROR);
      return null;
    } finally {
      setLoading(false);
    }
  }, [resetTest, runPingTests, runDownloadTest, runUploadTest, calculateNetworkScores]);

  return {
    startTest,
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
