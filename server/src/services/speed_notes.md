# Speed Test Endpoint Usage Guide

---

## Endpoints Summary

### GET /api/speed/download?sizeMb=X
- **Purpose**: Stream test data for the frontend to download and measure
- **Allowed sizes**: 1, 5, 10, 20 (MB)
- **When to use it**: When you want to run an actual download speed test (used in the adaptive sequence below)
- **Pro Tip for Real-Time Graph**: Track download progress (bytes downloaded over time) during this request to update a speed graph in real-time!

### POST /api/speed/tests/download
- **Purpose**: Save final download test result + all individual size measurements
- **When to use it**: Always use this (for debugging/analytics, Grafana insights, etc.)

### POST /api/speed/upload?sizeMb=X
- **Purpose**: Receive uploaded data from client for speed testing (no storage, just confirms receipt)
- **Allowed sizes**: 0.5, 1, 5, 10, 20 (MB)
- **When to use it**: When you want to run an actual upload speed test (used in the adaptive sequence below)
- **Pro Tip for Real-Time Graph**: Track upload progress (bytes uploaded over time) during this request to update a speed graph in real-time!

### POST /api/speed/tests/upload
- **Purpose**: Save final upload test result + all individual size measurements
- **When to use it**: Always use this (for debugging/analytics, Grafana insights, etc.)

---

## Recommended Approach: Adaptive Sequence (Faster for Users!)

### Download Adaptive Sequence
- Start small, adjust based on initial speed (saves time!)
- Use for both simple speed meters AND Speedtest.net-style real-time graphs
- Frontend flow:
  1. **Step 1: Run 1MB test** (GET /api/speed/download?sizeMb=1)
     - Track download progress for real-time graph
     - Measure total time, calculate speed
  2. **Step 2: Decide next steps** based on measured speed:
     - If speed > 50 Mbps → skip to 10MB → 20MB
     - If speed is 10-50 Mbps → run 5MB → 10MB → 20MB
     - If speed < 10 Mbps → stop at 5MB (no need for larger sizes)
  3. For each subsequent test size, continue tracking progress for the real-time graph
  4. Pick best/average result from the sizes you did run
  5. POST /api/speed/tests/download with all measurements you collected + final result

### Upload Adaptive Sequence
- Start small, adjust based on initial speed (saves time!)
- Use for both simple speed meters AND Speedtest.net-style real-time graphs
- Frontend flow:
  1. **Step 1: Run 0.5MB test** (POST /api/speed/upload?sizeMb=0.5)
     - Track upload progress for real-time graph
     - Measure total time, calculate speed
  2. **Step 2: Decide next steps** based on measured speed:
     - If speed > 50 Mbps → skip to 5MB → 10MB → 20MB
     - If speed is 10-50 Mbps → run 1MB → 5MB → 10MB → 20MB
     - If speed < 10 Mbps → stop at 1MB (no need for larger sizes)
  3. For each subsequent test size, continue tracking progress for the real-time graph
  4. Pick best/average result from the sizes you did run
  5. POST /api/speed/tests/upload with all measurements you collected + final result

---

## Example Adaptive Sequence Flows

### Fast Connection (>50 Mbps)
- Download: 1MB → 10MB → 20MB → POST /api/speed/tests/download
- Upload: 0.5MB → 5MB → 10MB → 20MB → POST /api/speed/tests/upload

### Medium Connection (10-50 Mbps)
- Download: 1MB →5MB →10MB →20MB → POST /api/speed/tests/download
- Upload: 0.5MB →1MB →5MB →10MB →20MB → POST /api/speed/tests/upload

### Slow Connection (<10 Mbps)
- Download: 1MB →5MB → POST /api/speed/tests/download
- Upload: 0.5MB →1MB → POST /api/speed/tests/upload

---

## Frontend UI Notes
- **For Simple Speed Meter**: Just show the final best/average speed
- **For Speedtest.net-Style Graph**: Track bytes downloaded/uploaded over time during each test request, then combine all data into a single continuous graph!
- **No Backend Changes Needed**: Our current backend already supports everything you need for either UI!
