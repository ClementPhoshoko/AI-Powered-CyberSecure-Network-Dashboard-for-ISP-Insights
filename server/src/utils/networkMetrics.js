const getSuccessfulLatencies = (pings) => pings
  .filter((ping) => ping?.success !== false && Number.isFinite(Number(ping?.latency_ms)))
  .map((ping) => Number(ping.latency_ms))
  .filter((latency) => latency > 0);

const calculatePingAverage = (pings) => {
  const latencies = getSuccessfulLatencies(pings);
  if (latencies.length === 0) return 0;
  const total = latencies.reduce((sum, latency) => sum + latency, 0);
  return total / latencies.length;
};

const calculatePingMin = (pings) => {
  const latencies = getSuccessfulLatencies(pings);
  if (latencies.length === 0) return 0;
  return Math.min(...latencies);
};

const calculatePingMax = (pings) => {
  const latencies = getSuccessfulLatencies(pings);
  if (latencies.length === 0) return 0;
  return Math.max(...latencies);
};

const calculatePingMedian = (pings) => {
  const latencies = getSuccessfulLatencies(pings).sort((a, b) => a - b);
  if (latencies.length === 0) return 0;
  const mid = Math.floor(latencies.length / 2);
  if (latencies.length % 2 === 0) {
    return (latencies[mid - 1] + latencies[mid]) / 2;
  }
  return latencies[mid];
};

const calculateJitter = (pings) => {
  const latencies = getSuccessfulLatencies(pings);
  if (latencies.length < 2) return 0;
  let totalDiff = 0;
  for (let i = 1; i < latencies.length; i++) {
    const diff = Math.abs(latencies[i] - latencies[i - 1]);
    totalDiff += diff;
  }
  return totalDiff / (latencies.length - 1);
};

module.exports = {
  calculatePingAverage,
  calculatePingMin,
  calculatePingMax,
  calculatePingMedian,
  calculateJitter
};
