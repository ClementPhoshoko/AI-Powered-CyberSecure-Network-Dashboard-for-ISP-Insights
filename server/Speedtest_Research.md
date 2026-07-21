# Research Notes: AI-Powered AkovoLabs Speedtest

## Table of Contents

- [Project Vision](#project-vision)
- [Project Feasibility](#project-feasibility)
- [Backend Measurements](#backend-measurements)
- [Recommended Backend Stack (Zero Budget)](#recommended-backend-stack-zero-budget)
- [How Speed Analysis Works](#how-speed-analysis-works)
- [Limitations of a Zero-Budget Speed Test](#limitations-of-a-zero-budget-speed-test)
- [Better Architecture](#better-architecture)
- [Project Assessment](#project-assessment)
- [Key Challenges](#key-challenges)
- [Backend Structure (Planned)](#backend-structure-planned)
- [Making Results More Reliable](#making-results-more-reliable)
- [The Biggest Limitation](#the-biggest-limitation)
- [Marketing Note](#marketing-note)

---

## Project Vision
"A smart network dashboard that leverages artificial intelligence and cybersecurity analytics to track patterns, detect anomalies, and provide actionable suggestions for Internet Service Providers."

### Feature Additions
- Allow users to choose between "soft" and "hard" speedtests
  - **Soft Speedtest**: Download + Upload + Ping
  - **Hard Speedtest**: Comprehensive network diagnostics (all metrics)

---

## Project Feasibility
It is absolutely possible to build a custom Speedtest platform on a zero budget. Many network monitoring tools start by implementing their own bandwidth, latency, and quality measurements rather than relying on third-party speed test APIs.

### Why This Idea Is Solid
Most public speed tests only provide:
- Download speed
- Upload speed
- Ping

They rarely explain:
- Why the network is slow
- Packet loss
- Jitter
- DNS latency
- Server response delays
- Route instability
- Historical trends
- ISP performance over time
- WiFi quality indicators

A more advanced network diagnostic platform can provide actual network health rather than just speed.

---

## Backend Measurements

### 1. Latency (Ping)
Measures client → server → client responsiveness.

**Metrics:**
- Average latency
- Min latency
- Max latency
- Median latency
- Jitter (variation in consecutive ping times)
- Packet loss (HTTP request success rate)

Pings fire sequentially (not concurrently) to avoid event-loop queuing from concurrent requests, which would inflate individual RTT measurements. Sequential ordering also makes the consecutive-sample jitter calculation meaningful. The health endpoint is used instead of ICMP, which is unavailable from the browser.

---

### 2. Download Speed
**Implementation (current):** Adaptive parallel HTTP GET streams (2–8 connections based on measured RTT). Each connection downloads an independent chunk of random binary data. Speed per connection is measured as bytes transferred / connection active time. The slowest 25% of connections are discarded (TCP congestion outliers), and the remaining connections' speeds are averaged.

**Timer-based sampling:** A 50ms interval timer (20 Hz) snapshots total bytes loaded across all connections for real-time progress display. The timer decouples measurement from Axios callback frequency, providing consistent sampling granularity on both fast and slow connections.

**Adaptive sizing:** Pass file sizes are chosen adaptively based on measured speed: 2 MB, 5 MB, 0 MB, 20 MB, 50 MB. Slow connections (RTT >100ms, 2 connections) start at 2 MB; fast connections (RTT <20ms, 8 connections) start at 20 MB. The test stops early when measurements stabilise, a single sustained pass (≥8 seconds) is completed, or the max phase duration (15 seconds) is reached. After 2 consecutive same-size attempts, size is forced upward to break out of the overhead-dominated feedback loop. Compression middleware is excluded from the speed download endpoint.

**Final result selection:** The longest-duration pass is selected as the authoritative result (not median, not max). Longer passes have more throughput samples, less overhead contamination, and are most representative of steady-state throughput.

---

### 3. Upload Speed
**Implementation (current):** Adaptive parallel HTTP POST streams (2–8 connections based on measured RTT). Each connection uploads an independent slice of a pre-allocated random-data blob (`crypto.getRandomValues`). Random data prevents transparent compression from inflating measurements (unlike zero-filled blobs which compress to near-zero). Speed is computed identically to download: per-connection throughput, discard slowest 25%, average the rest.

**Adaptive sizing:** Pass file sizes: 2 MB, 5 MB, 10 MB, 20 MB, 50 MB, 100 MB. Target phase duration is 10 seconds. Max phase duration is 25 seconds. Same stability and force-escalation logic as download.

---

### 4. DNS Lookup Time
Measure how long DNS takes. Useful because slow websites ≠ slow internet. Sometimes DNS is the bottleneck.

---

### 5. Server Response Time
Measure request → API → response. Shows backend responsiveness.

---

### 6. Connection Stability Score
Create your own score.

**Example Weighting:**
- 40% Speed
- 30% Latency
- 20% Jitter
- 10% Packet Loss

**Output:**
```text
92/100 - Excellent
```

---

## Recommended Backend Stack (Zero Budget)

### Backend: Express.js (Node.js)
Advantages:
- Fast and lightweight
- Easy REST APIs
- Good documentation
- Large ecosystem

### Core Dependencies
- express
- cors
- helmet
- compression
- dotenv
- morgan

### Database
PostgreSQL + Supabase (free tier sufficient initially)
Stores:
- Test history
- ISP data
- Locations
- Statistics
- User profiles

### Documentation
- swagger-ui-express
- swagger-jsdoc

### Validation
- zod

### Security
- jsonwebtoken
- bcryptjs
- helmet

### Logging
- winston

### Analytics
- simple-statistics (for mean, median, standard deviation, percentiles)

---

## How Speed Analysis Works
Most people think: `speed = file size / time`

But a good speed test should:

### Warm-Up Phase
TCP slow start means connections ramp up gradually. Our per-connection trimming (discard slowest 25%) naturally removes connections that are still in slow start.

### Connection Count (RTT-Adaptive)
The number of parallel HTTP streams is chosen based on measured RTT from the ping phase:

| RTT | Connections | Rationale |
|---|---|---|
| < 20ms | 8 | Fiber/low-latency — many streams saturate the link |
| < 50ms | 6 | Moderate latency — balanced parallelism |
| < 100ms | 4 | Typical broadband |
| ≥ 100ms | 2 | High latency — fewer streams reduce head-of-line blocking |

This matches Ookla's approach of using 2–8 connections based on network conditions.

### Download Phase
2–8 parallel streams (RTT-adaptive). A 50ms timer samples throughput at 20 Hz for real-time progress. Per-connection speed is computed from each connection's own start→end window. The slowest 25% of connections are discarded. Adaptive file sizes (2–50 MB) ramp up based on measured speed. The longest-duration pass is selected as the final result.

### Upload Phase
2–8 parallel streams (RTT-adaptive). Upload data is random bytes (`crypto.getRandomValues`) to prevent compression from inflating results. Same per-connection trimming and adaptive sizing as download. Target phase duration is 10 seconds.

### Ping Phase
Run 10 sequential HTTP pings (raw `fetch()` via the browser, bypassing Axios to avoid interceptor overhead). Sequential firing ensures each measurement reflects true RTT without event-loop queuing. Calculate:
- Average
- Min
- Max
- Jitter

### Quality Analysis
Generate:
- Gaming Score
- Streaming Score
- Video Call Score
- General Browsing Score
- **Connection Stability Flag**: Compares max/min speed across adaptive passes — flags as unstable when ratio > ~2.5×
- **AI-powered summary** explaining connection quality in plain language

**Example:**
```json
{
  "gaming": 95,
  "streaming": 88,
  "video_call": 91
}
```

---

## Limitations of a Zero-Budget Speed Test

### Problem 1: Server Location
Speedtest.net has servers worldwide. You have 1 server. Users far away see lower speeds.

### Problem 2: Shared Hosting
Free hosting means:
- CPU sharing
- Memory limits
- Network throttling

Measurements won't be perfect.

### Problem 3: No ISP-Level Visibility
You cannot directly know:
- ISP congestion
- Tower congestion
- Fiber issues

Only infer them.

### Problem 4: Browser Restrictions
JavaScript cannot access:
- Raw ICMP ping
- Network drivers
- Router information

Need alternatives using HTTP/WebSocket timing.

### Problem 5: Mobile Networks
4G/5G fluctuate constantly. Results vary significantly between tests.

---

## Better Architecture
Instead of competing with Speedtest.net, build a **Network Intelligence Platform**.

### Features
- Speed testing
- Latency testing
- Jitter testing
- Packet loss estimation
- Historical trends
- ISP comparisons
- Regional comparisons
- Network health score
- AI-generated explanations

**Example Explanation:**
```text
Your download speed is good (85 Mbps), but packet loss is 4.2%.

This may affect Zoom calls and gaming.
Possible causes:
- WiFi interference
- Congested network
- Weak signal strength
```

This is far more useful than simply displaying "85 Mbps".

---

## Project Assessment
For your stack:
- React Frontend
- Express.js Backend
- PostgreSQL/Supabase
- Swagger
- GitHub

The project is technically feasible, realistic on a zero budget, and strong enough for a portfolio or even a startup MVP.

The strongest differentiator is not the speed test itself, but the analytics layer: network quality scoring, trend analysis, ISP insights, and AI-powered explanations of what the results actually mean. That is where the real value lies.

---

## Key Challenges
The challenge is network analysis, not backend complexity.

The hard part of this project is:
- Measuring download speed accurately (solved: RTT-adaptive 2–8 parallel streams + timer-based 20Hz sampling + per-connection outlier trimming + longest-pass selection)
- Measuring upload speed accurately (solved: same approach with random data blobs to prevent compression inflation)
- Handling both slow (1 Mbps) and fast (1 Gbps+) connections (solved: adaptive sizing from 2–50 MB + max phase duration safety valve + sustained-pass detection)
- Calculating jitter
- Calculating packet loss
- Designing health scores
- Building analytics dashboards
- Historical reporting

The challenge is not CRUD APIs or enterprise architecture.

---

## Backend Structure (Current)
```
server/src/
├── routes/
│   ├── analytics.js
│   ├── devAuth.js
│   ├── network.js
│   ├── otp.js
│   ├── ping.js
│   ├── portRisk.js
│   ├── profiles.js
│   ├── speed.js
│   ├── subscribers.js
│   └── systemMetrics.js
├── controllers/
│   ├── ...
├── services/
│   ├── speed.service.js
│   ├── ping.service.js
│   ├── networkScoring.service.js
│   ├── aiSummary.service.js
│   ├── portRisk.service.js
│   └── ...
├── models/
│   └── ...
├── middleware/
│   ├── errorHandler.js
│   ├── validateSupabaseJWT.js
│   └── optionalAuth.js
└── server.js
```

---

## Making Results More Reliable

### RTT-Adaptive Connection Count
Connection count (2–8) is determined by the measured RTT from the ping phase. Low-latency connections use more parallel streams to saturate the link; high-latency connections use fewer to avoid head-of-line blocking.

### Timer-Based Throughput Sampling
A 50ms `setInterval` timer snapshots bytes loaded across all connections at a consistent 20 Hz rate. This decouples measurement from Axios callback frequency, which varies by browser and connection speed. The timer provides consistent sampling granularity whether the connection is 1 Mbps or 1 Gbps.

### Per-Connection Outlier Trimming
After all connections complete, each connection's throughput is computed from its own start→end window. The slowest 25% of connections are discarded (typically those still in TCP slow start or affected by congestion). The remaining connections' speeds are averaged.

### Adaptive File Sizes
The client adaptively chooses sizes based on the previous pass speed:
- **Download:** 2 MB, 5 MB, 10 MB, 20 MB, 50 MB
- **Upload:** 2 MB, 5 MB, 10 MB, 20 MB, 50 MB, 100 MB

Slow connections (2 streams) start at 2 MB; fast connections (8 streams) start at 20 MB. Force escalation bumps the size after 2 consecutive same-size attempts.

### Longest-Duration Pass Selection
The final result is the longest-duration pass (not median, not max). Longer passes have more throughput samples, less overhead contamination, and better represent steady-state throughput. Passes under 2 seconds are deprioritised.

---

## The Biggest Limitation
With a zero-budget setup, you will have only one backend server.

For example:
- South Africa User
- ↓
- US Render Server

Distance affects results. The system may report "Latency = 250ms" not because the internet is bad, but because the server is far away.

---

## Ookla / Google Speedtest Comparison

### What matches Ookla's methodology

| Aspect | Ookla | Ours |
|---|---|---|
| Parallel connections | 2–8 adaptive to RTT | 2–8 adaptive to RTT |
| Upload data | Random bytes | Random bytes (`crypto.getRandomValues`) |
| Multi-pass testing | Multiple passes, median result | Multiple passes, longest-duration selection |
| Outlier trimming | Discard top 10% + bottom 30% of time slices | Discard slowest 25% of connections |
| Cache busting | Yes | Yes (random `cb` query param) |
| Compression bypass | Yes | Yes (`shouldCompress` returns false for speed endpoints) |
| Adaptive file sizes | Fixed-duration passes (~10s each) | Fixed-size passes with adaptive sizing (2–100 MB) |
| Connection count selection | Based on RTT | Based on RTT (same thresholds) |

### Key differences (and why they're acceptable)

1. **Fixed-size vs fixed-duration passes**: Ookla runs each pass for a fixed duration (e.g., 10 seconds) and measures how much data transfers. We run each pass for a fixed file size and measure how long it takes. Both approaches converge to the same throughput measurement. Our approach is better suited for browser environments where we cannot precisely control transfer duration.

2. **Connection-level vs slice-level trimming**: Ookla discards the fastest 10% and slowest 30% of time slices within each pass. We discard the slowest 25% of connections across a pass. Both remove outliers — Ookla removes transient spikes/dips within a connection, we remove underperforming connections (TCP congestion, slow start). The effect is similar.

3. **Longest-pass vs median selection**: Ookla takes the median across same-duration passes (homogeneous conditions). We take the longest-duration pass because our passes have different file sizes (heterogeneous conditions). The longest pass is the most representative of steady-state throughput.

4. **Server infrastructure**: Ookla has 10,000+ servers worldwide with 10–100 Gbps dedicated links. We run on a single VPS. Results reflect the VPS's network capacity to the user, which is the correct behavior for an ISP-focused dashboard. This is the biggest factor in absolute speed differences.

5. **Native vs browser**: Ookla uses native apps with raw TCP control and precise timers. We use browser JavaScript with Axios, which has inherent event-loop jitter. The 50ms timer-based sampling (20 Hz) mitigates this significantly.

### Google Speedtest comparison

Google Speedtest uses a single HTTP connection with no parallelism. Our implementation is more aggressive (2–8 parallel connections), which better saturates the link and provides a more accurate measure of maximum available bandwidth. Google's approach measures single-stream throughput; ours measures aggregate link capacity.

### Browser limitations (unavoidable)

JavaScript cannot access:
- Raw ICMP ping (we use HTTP probe as alternative)
- Raw TCP sockets (we use HTTP/XHR via Axios)
- Network drivers or router information
- Precise sub-millisecond timers (`performance.now()` has ~μs resolution, but event-loop jitter adds ms-level variance)

These limitations affect all browser-based speed tests equally, including Ookla's web version.

---

## Marketing Note
Don't market it as "Another Speedtest".

Market it as a **Network Insight Platform** with features:
- Download Speed
- Upload Speed
- Latency
- Jitter
- Packet Loss
- DNS Analysis
- Historical Trends
- Network Health Score
- ISP Analytics
- **Connection Stability Detection**
- **Port Risk Security**
- **AI Explanations**

This makes the project much stronger and more unique.
