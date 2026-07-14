# Research Notes: AI-Powered AkovoLabs Speedtest

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

**Example:**
```json
{
  "avg": 18,
  "min": 15,
  "max": 30
}
```

---

### 2. Jitter
Measures variation in latency. Useful for gaming, video calls, and VoIP.

**Example:**
```text
Ping 1 = 15ms
Ping 2 = 18ms
Ping 3 = 45ms
Ping 4 = 17ms
```

**Formula:**
Average difference between consecutive pings.

---

### 3. Packet Loss
Measures sent packets vs received packets.

**Example:**
```text
100 sent
95 received
Loss: 5%
```

Anything above 1–2% is usually noticeable.

---

### 4. Download Speed
Backend sends a large stream. Client measures bytes received / time. Convert to Mbps.

---

### 5. Upload Speed
Client uploads large chunks. Backend measures bytes received / time.

---

### 6. DNS Lookup Time
Measure how long DNS takes. Useful because slow websites ≠ slow internet. Sometimes DNS is the bottleneck.

---

### 7. Server Response Time
Measure request → API → response. Shows backend responsiveness.

---

### 8. Connection Stability Score
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
- zod (preferred)
- or express-validator

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
Example: 5 seconds, 10 parallel streams. Measure throughput.

### Upload Phase
Example: 10 MB upload chunks. Measure upload throughput.

### Ping Phase
Run 20 pings. Calculate:
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
- React Frontend (Coming Soon)
- Express.js Backend
- PostgreSQL/Supabase
- Swagger
- GitHub
- Render
- Vercel

The project is technically feasible, realistic on a zero budget, and strong enough for a portfolio or even a startup MVP.

The strongest differentiator is not the speed test itself, but the analytics layer: network quality scoring, trend analysis, ISP insights, and AI-powered explanations of what the results actually mean. That is where the real value lies.

---

## Key Challenges
The challenge is network analysis, not backend complexity.

The hard part of this project is:
- Measuring download speed accurately
- Measuring upload speed accurately
- Calculating jitter
- Calculating packet loss
- Designing health scores
- Building analytics dashboards
- Historical reporting

The challenge is not CRUD APIs or enterprise architecture.

---

## Backend Structure (Planned)
```
server/src/
├── routes/
│   ├── speedtest.routes.js
│   ├── analytics.routes.js
│   └── history.routes.js
├── controllers/
│   ├── speedtest.controller.js
│   ├── analytics.controller.js
│   └── history.controller.js
├── services/
│   ├── download.service.js
│   ├── upload.service.js
│   ├── ping.service.js
│   ├── jitter.service.js
│   ├── packetloss.service.js
│   ├── healthscore.service.js
│   └── analytics.service.js
├── models/
│   ├── TestResult.js
│   └── User.js
├── middleware/
│   ├── auth.js
│   ├── logger.js
│   └── errorHandler.js
├── utils/
│   ├── speedCalculator.js
│   ├── networkMetrics.js
│   └── scoreCalculator.js
├── config/
│   ├── db.js
│   └── swagger.js
└── server.js
```

---

## Making Results More Reliable

### Run Multiple Tests
Instead of 1 download test, run 5 download tests. Then calculate:
- Average
- Median
- Best
- Worst

### Use Multiple File Sizes
- 1 MB
- 5 MB
- 10 MB
- 25 MB
- 50 MB

This helps account for TCP Slow Start, where connections begin slowly and ramp up.

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
- AI Explanations

This makes the project much stronger and more unique.
