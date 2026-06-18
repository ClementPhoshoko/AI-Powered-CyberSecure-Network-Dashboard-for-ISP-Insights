const DEFAULT_HTTP_PROBE_METHOD = 'http-health';
const DEFAULT_HTTP_SCORE_METHOD = 'derived-http-probe-estimate';
const DEFAULT_HTTP_SCORE_CONFIDENCE_VALUE = 60;
const DEFAULT_HTTP_SCORE_EXPLANATION =
  'Scores are derived estimates from measured throughput plus HTTP probe latency and HTTP probe jitter. They are directional and should not be treated like true ICMP or transport-layer measurements.';

function isHttpProbeMethod(probeMethod) {
  return typeof probeMethod === 'string' && probeMethod.toLowerCase().startsWith('http');
}

function getMeasurementContext(probeMethod = DEFAULT_HTTP_PROBE_METHOD, probeTarget = null) {
  const httpProbe = isHttpProbeMethod(probeMethod) || !probeMethod;

  if (httpProbe) {
    return {
      probe_method: probeMethod || DEFAULT_HTTP_PROBE_METHOD,
      probe_method_label: 'HTTP health endpoint probe',
      probe_target: probeTarget || null,
      latency_label: 'HTTP probe latency',
      latency_summary_label: 'HTTP probe latency (avg)',
      jitter_label: 'HTTP probe jitter',
      packet_loss_label: 'HTTP probe failure rate estimate',
      transport_level: false,
      description: 'Latency and jitter are measured with repeated HTTP requests to the backend health endpoint, not ICMP.'
    };
  }

  return {
    probe_method: probeMethod,
    probe_method_label: 'Application probe',
    probe_target: probeTarget || null,
    latency_label: 'Probe latency',
    latency_summary_label: 'Probe latency (avg)',
    jitter_label: 'Probe jitter',
    packet_loss_label: 'Probe failure rate estimate',
    transport_level: false,
    description: 'Latency and jitter are derived from application-level probes rather than transport-level packets.'
  };
}

function getScoreContext(source = {}) {
  const probeMethod = source.probe_method || DEFAULT_HTTP_PROBE_METHOD;
  const httpProbe = isHttpProbeMethod(probeMethod) || !source.probe_method;
  const scoreMethod =
    source.score_method || (httpProbe ? DEFAULT_HTTP_SCORE_METHOD : 'derived-estimate');
  const scoreConfidenceValue = Number(
    source.score_confidence_value ??
      (httpProbe ? DEFAULT_HTTP_SCORE_CONFIDENCE_VALUE : DEFAULT_HTTP_SCORE_CONFIDENCE_VALUE)
  );
  const scoreConfidenceLabel =
    source.score_confidence_label ||
    (scoreConfidenceValue >= 75 ? 'high' : scoreConfidenceValue >= 50 ? 'medium' : 'low');
  const scoreExplanation =
    source.score_explanation ||
    (httpProbe
      ? DEFAULT_HTTP_SCORE_EXPLANATION
      : 'Scores are derived estimates rather than direct transport-layer measurements.');

  return {
    score_label: 'Derived suitability score',
    score_method: scoreMethod,
    score_method_label: httpProbe ? 'Derived estimate from throughput + HTTP probes' : 'Derived estimate',
    score_confidence_label: scoreConfidenceLabel,
    score_confidence_value: scoreConfidenceValue,
    score_explanation: scoreExplanation
  };
}

function annotateTestResult(testResult) {
  if (!testResult) {
    return testResult;
  }

  return {
    ...testResult,
    measurement_context: getMeasurementContext(testResult.probe_method, testResult.probe_target),
    score_context: getScoreContext(testResult)
  };
}

function annotateTestResults(testResults = []) {
  return testResults.map(annotateTestResult);
}

module.exports = {
  DEFAULT_HTTP_PROBE_METHOD,
  DEFAULT_HTTP_SCORE_METHOD,
  DEFAULT_HTTP_SCORE_CONFIDENCE_VALUE,
  DEFAULT_HTTP_SCORE_EXPLANATION,
  getMeasurementContext,
  getScoreContext,
  annotateTestResult,
  annotateTestResults
};
