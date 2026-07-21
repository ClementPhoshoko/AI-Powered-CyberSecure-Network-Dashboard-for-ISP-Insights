# Speed Test Implementation Notes

---

## Endpoints

### GET /api/speed/download?sizeMb=X&cb=Y
- **Purpose**: Stream random binary data for the frontend to download and measure
- **sizeMb**: Any positive number (validated by Zod, coerced from query string)
- **cb**: Cache-buster (ignored server-side, prevents CDN/proxy caching)
- **Response**: `application/octet-stream` with `Cache-Control: no-store, no-cache`
- **Compression**: Explicitly excluded from gzip/deflate middleware

### POST /api/speed/upload?sizeMb=X&cb=Y
- **Purpose**: Receive uploaded binary data for speed testing (consumed, not persisted)
- **sizeMb**: Any positive number
- **cb**: Cache-buster
- **Compression**: Explicitly excluded from gzip/deflate middleware

### POST /api/speed/tests/download
- **Purpose**: Save final download result + all individual pass measurements

### POST /api/speed/tests/upload
- **Purpose**: Save final upload result + all individual pass measurements
- **Optional field**: `was_unstable` (boolean) — set when max/min speed ratio > ~2.5×

---

## Client-Side Measurement Pipeline

### 1. Ping Phase (determines connection count)
- 10 sequential HTTP pings to `/api/ping/health` using raw `fetch()`
- Average RTT determines parallel connection count:

| RTT | Connections |
|---|---|
| < 20ms | 8 |
| < 50ms | 6 |
| < 100ms | 4 |
| ≥ 100ms | 2 |

### 2. Download Phase
- **Initial file size** depends on connection count:
  - 8 connections → start at 20 MB
  - 6 connections → start at 10 MB
  - 2 connections → start at 2 MB (slow links need small passes)
  - 4 connections → start at 5 MB
- **Per pass**: N parallel GET requests, each downloading `sizeMb / N` MB
- **Timer sampler**: 50ms `setInterval` snapshots total bytes loaded → computes instantaneous Mbps → EMA smoothed (0.4/0.6 weights)
- **After pass completes**: `aggregateConnections()` computes per-connection speed, discards slowest 25%, averages rest
- **Adaptive sizing**: Speed from previous pass determines next file size
- **Stop conditions** (first true wins):
  1. Max attempts reached (5)
  2. Max phase duration (15s) with ≥1 measurement
  3. Single sustained pass (≥8s) with ≥`minAttempts` (2) measurements
  4. Target duration (5s) with ≥`minAttempts` (2) measurements
  5. Stability: last two passes within 12% relative delta, after 3s elapsed
- **Force escalation**: After 2 consecutive same-size attempts, size is forced upward
- **Final result**: Longest-duration pass (not median, not max)

### 3. Upload Phase
- Same pipeline as download, with these differences:
  - Upload data is `crypto.getRandomValues` (not zeros) to prevent compression inflation
  - File sizes: 2, 5, 10, 20, 50, 100 MB
  - Target phase duration: 10 seconds
  - Max phase duration: 25 seconds
  - Stability threshold: 15% (vs 12% for download)

### 4. Speed Calculation Formula
```
Per-connection speed = (bytesLoaded / 1024 / 1024 * 8) / durationSeconds
Aggregate speed = mean(connection speeds after discarding slowest 25%)
```

### 5. Real-Time Progress
```
Timer tick → totalBytes = sum(conn.bytesLoaded)
           → deltaTime = (now - prevTime) / 1000
           → instantMbps = (deltaBytes / 1024 / 1024 * 8) / deltaTime
           → smoothedSpeed = smoothedSpeed * 0.4 + instantMbps * 0.6
           → onProgress(smoothedSpeed, percentComplete)
```

---

## Adaptive Size Selection

### Download
| Measured Speed | Next Size |
|---|---|
| < 8 Mbps | 2 MB |
| < 25 Mbps | 5 MB |
| < 80 Mbps | 10 MB |
| < 250 Mbps | 20 MB |
| ≥ 250 Mbps | 50 MB |

Force escalation (after 2 same-size attempts):
| Measured Speed | Forced Size |
|---|---|
| < 10 Mbps | 5 MB |
| < 40 Mbps | 10 MB |
| < 150 Mbps | 20 MB |
| ≥ 150 Mbps | 50 MB |

### Upload
| Measured Speed | Next Size |
|---|---|
| < 5 Mbps | 2 MB |
| < 15 Mbps | 5 MB |
| < 50 Mbps | 10 MB |
| < 150 Mbps | 20 MB |
| < 350 Mbps | 50 MB |
| ≥ 350 Mbps | 100 MB |

---

## Server-Side Streaming

The download endpoint uses an async generator (`generateRandomDataStream`) that yields 64 KB chunks from a pre-cached 1 MB random buffer (`crypto.randomBytes`). The buffer is generated once at server startup and sliced/wrapped for each chunk, avoiding per-request crypto overhead. Backpressure is handled via the `drain` event on `res.write()`.

The upload endpoint consumes the incoming stream without persisting it — the request body is read and discarded.

---

## Ookla Methodology Comparison

| Aspect | Ookla | Ours |
|---|---|---|
| Connections | 2–8 adaptive to RTT | 2–8 adaptive to RTT |
| Pass structure | Fixed duration (~10s) | Fixed file size, adaptive |
| Sampling | ~30 Hz per connection | 20 Hz timer (50ms) |
| Outlier trimming | Top 10% + bottom 30% of time slices | Slowest 25% of connections |
| Result selection | Median across passes | Longest-duration pass |
| Upload data | Random | Random |
| Cache busting | Yes | Yes |
| Compression bypass | Yes | Yes |

The algorithm is structurally equivalent to Ookla. The remaining accuracy gap is server infrastructure (Ookla: 10,000+ dedicated servers; ours: single VPS).
