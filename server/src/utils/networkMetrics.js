const calculatePingAverage = (pings) => {
  if (pings.length === 0) return 0;
  const total = pings.reduce((sum, ping) => sum + Number(ping.latency_ms), 0);
  return total / pings.length;
};

const calculatePingMin = (pings) => {
  if (pings.length === 0) return 0;
  return Math.min(...pings.map(ping => Number(ping.latency_ms)));
};

const calculatePingMax = (pings) => {
  if (pings.length === 0) return 0;
  return Math.max(...pings.map(ping => Number(ping.latency_ms)));
};

const calculatePingMedian = (pings) => {
  if (pings.length === 0) return 0;
  const latencies = pings.map(ping => Number(ping.latency_ms)).sort((a, b) => a - b);
  const mid = Math.floor(latencies.length / 2);
  if (latencies.length % 2 === 0) {
    return (latencies[mid - 1] + latencies[mid]) / 2;
  }
  return latencies[mid];
};

const calculateJitter = (pings) => {
  if (pings.length < 2) return 0;
  let totalDiff = 0;
  for (let i = 1; i < pings.length; i++) {
    const diff = Math.abs(Number(pings[i].latency_ms) - Number(pings[i - 1].latency_ms));
    totalDiff += diff;
  }
  return totalDiff / (pings.length - 1);
};

module.exports = {
  calculatePingAverage,
  calculatePingMin,
  calculatePingMax,
  calculatePingMedian,
  calculateJitter
};
