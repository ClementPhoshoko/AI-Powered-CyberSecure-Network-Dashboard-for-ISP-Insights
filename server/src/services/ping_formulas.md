# Ping Calculation Formulas

> **Note:** Pings are fired sequentially on the client (not concurrently) to avoid event-loop queuing inflating individual RTT measurements. This also ensures the consecutive-sample jitter formula below produces meaningful results.

## 1. Average Ping
```
Formula: Sum of all latency_ms values / Number of pings
JavaScript: pings.reduce((sum, ping) => sum + Number(ping.latency_ms), 0) / pings.length
```

## 2. Minimum Ping
```
Formula: Minimum value in the pings array
JavaScript: Math.min(...pings.map(ping => Number(ping.latency_ms))
```

## 3. Maximum Ping
```
Formula: Maximum value in the pings array
JavaScript: Math.max(...pings.map(ping => Number(ping.latency_ms))
```

## 4. Median Ping
```
Formula: Middle value after sorting
JavaScript: 
  const latencies = pings.map(ping => Number(ping.latency_ms)).sort((a, b) => a - b);
  const mid = Math.floor(latencies.length / 2);
  if (latencies.length % 2 === 0) ? (latencies[mid - 1] + latencies[mid]) / 2 : latencies[mid];
```

## 5. Jitter
```
Formula: Average of absolute differences between consecutive pings
JavaScript:
  let totalDiff = 0;
  for (let i = 1; i < pings.length; i++) {
    const diff = Math.abs(Number(pings[i].latency_ms) - Number(pings[i - 1].latency_ms));
    totalDiff += diff;
  }
  jitter = totalDiff / (pings.length - 1);
```
