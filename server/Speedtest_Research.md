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

All pings fire concurrently (not sequentially) to measure the same RTT as a single ping while gathering 10 samples. The health endpoint is used instead of ICMP, which is unavailable from the browser.

---

### 2. Download Speed
**Implementation (current):** 4 parallel HTTP GET streams. Speed is measured as total bytes transferred divided by total elapsed time (from the first connection's start to the last connection's end). The server generates random byte streams of arbitrary size (any positive `sizeMb`) using a cached 1 MB random buffer for fast streaming.

**Adaptive sizing:** The client starts with a small size and increases progressively based on measured speed, stopping early when measurements stabilise (relative delta between consecutive passes falls below a threshold). Compression middleware is excluded from speed endpoints to avoid interfering with binary payloads.

---

### 3. Upload Speed
**Implementation (current):** 4 parallel HTTP POST streams. Each connection uploads an independent slice of a pre-allocated zero-filled blob. Speed is measured as total bytes transferred / total elapsed time. The server consumes the incoming stream without persisting it.

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
Ignore first seconds. Reason: TCP slow start - connection ramps up gradually.

### Download Phase
4 parallel streams. Speed is total bytes transferred / total elapsed time (global start to global end). Adaptive sizing ramps up file sizes (1–20 MB) based on measured speed, with early termination once consecutive passes stabilise.

### Upload Phase
4 parallel upload streams. Same measurement approach. Adaptive sizing ramps from2–50 MB based on connection speed.

### Ping Phase
Run 10 concurrent HTTP pings. Calculate:
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
- Measuring download speed accurately (solved: 4 parallel streams + adaptive sizing + global elapsed timing)
- Measuring upload speed accurately (solved: 4 parallel streams + adaptive sizing + global elapsed timing)
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

### Run Multiple Tests
Instead of 1 download test, run multiple passes with adaptive sizing. Each pass uses 4 parallel streams. Speed is measured as totalBytes/globalElapsed. The test terminates early when consecutive passes stabilise (relative delta below threshold) or when the target duration / max attempts is reached.

### Use Multiple File Sizes
The client adaptively chooses sizes based on the previous pass speed:
- **Download:** 1 MB, 5 MB, 10 MB, 20 MB
- **Upload:** 2 MB, 5 MB, 10 MB, 20 MB, 50 MB

This helps account for TCP Slow Start, where connections begin slowly and ramp up, while ensuring fast connections transfer enough data for accurate measurement.

---

## The Biggest Limitation
With a zero-budget setup, you will have only one backend server.

For example:
- South Africa User
- ↓
- US Render Server

Distance affects results. The system may report "Latency = 250ms" not because the internet is bad, but because the server is far away.

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
