# Network Scoring Engine Documentation

## Overview

The Network Scoring Engine transforms raw network metrics into actionable, user-friendly scores between 0 and 100. The engine uses deterministic, rule-based algorithms (no AI) for full transparency and reproducibility.

---

## Metric Normalization

Each raw network metric is first normalized to a 0-100 score.

### Download Speed Score ($S_{download}$)

| Speed (Mbps) | Score |
|--------------|-------|
| ≥ 100        | 100   |
| 50-99        | Linear interpolation between 80-100 |
| 25-49        | Linear interpolation between 60-80 |
| 10-24        | Linear interpolation between 40-60 |
| 5-9          | Linear interpolation between 20-40 |
| < 5          | 20    |

**Mathematical Equations:**

```
If D ≥ 100:
    S_download = 100

If 50 ≤ D < 100:
    S_download = 80 + ((D - 50) × (20 / 50))

If 25 ≤ D < 50:
    S_download = 60 + ((D - 25) × (20 / 25))

If 10 ≤ D < 25:
    S_download = 40 + ((D - 10) × (20 / 15))

If 5 ≤ D < 10:
    S_download = 20 + ((D - 5) × (20 / 5))

If D < 5:
    S_download = 20
```

---

### Upload Speed Score ($S_{upload}$)

| Speed (Mbps) | Score |
|--------------|-------|
| ≥ 50         | 100   |
| 20-49        | Linear interpolation between 80-100 |
| 10-19        | Linear interpolation between 60-80 |
| 5-9          | Linear interpolation between 40-60 |
| 2-4          | Linear interpolation between 20-40 |
| < 2          | 20    |

**Mathematical Equations:**

```
If U ≥ 50:
    S_upload = 100

If 20 ≤ U < 50:
    S_upload = 80 + ((U - 20) × (20 / 30))

If 10 ≤ U < 20:
    S_upload = 60 + ((U - 10) × (20 / 10))

If 5 ≤ U < 10:
    S_upload = 40 + ((U - 5) × (20 / 5))

If 2 ≤ U < 5:
    S_upload = 20 + ((U - 2) × (20 / 3))

If U < 2:
    S_upload = 20
```

---

### Ping (Latency) Score ($S_{ping}$)

**Note:** Lower ping is better!

| Ping (ms) | Score |
|-----------|-------|
| ≤ 20      | 100   |
| 21-50     | Linear interpolation between 80-100 |
| 51-100    | Linear interpolation between 60-80 |
| 101-150   | Linear interpolation between 40-60 |
| 151-200   | Linear interpolation between 20-40 |
| > 200     | 20    |

**Mathematical Equations:**

```
If P ≤ 20:
    S_ping = 100

If 20 < P ≤ 50:
    S_ping = 80 + ((50 - P) × (20 / 30))

If 50 < P ≤ 100:
    S_ping = 60 + ((100 - P) × (20 / 50))

If 100 < P ≤ 150:
    S_ping = 40 + ((150 - P) × (20 / 50))

If 150 < P ≤ 200:
    S_ping = 20 + ((200 - P) × (20 / 50))

If P > 200:
    S_ping = 20
```

---

### Jitter Score ($S_{jitter}$)

| Jitter (ms) | Score |
|-------------|-------|
| ≤ 5         | 100   |
| 6-10        | Linear interpolation between 80-100 |
| 11-20       | Linear interpolation between 60-80 |
| 21-30       | Linear interpolation between 40-60 |
| 31-50       | Linear interpolation between 20-40 |
| > 50        | 20    |

**Mathematical Equations:**

```
If J ≤ 5:
    S_jitter = 100

If 5 < J ≤ 10:
    S_jitter = 80 + ((10 - J) × (20 / 5))

If 10 < J ≤ 20:
    S_jitter = 60 + ((20 - J) × (20 / 10))

If 20 < J ≤ 30:
    S_jitter = 40 + ((30 - J) × (20 / 10))

If 30 < J ≤ 50:
    S_jitter = 20 + ((50 - J) × (20 / 20))

If J > 50:
    S_jitter = 20
```

---

### Packet Loss Score ($S_{loss}$)

| Packet Loss (%) | Score |
|-----------------|-------|
| 0               | 100   |
| 0 < L ≤ 1       | Linear interpolation between 90-100 |
| 1 < L ≤ 3       | Linear interpolation between 70-90 |
| 3 < L ≤ 5       | Linear interpolation between 50-70 |
| 5 < L ≤ 10      | Linear interpolation between 20-50 |
| > 10            | 20    |

**Mathematical Equations:**

```
If L ≤ 0:
    S_loss = 100

If 0 < L ≤ 1:
    S_loss = 90 + ((1 - L) × (10 / 1))

If 1 < L ≤ 3:
    S_loss = 70 + ((3 - L) × (20 / 2))

If 3 < L ≤ 5:
    S_loss = 50 + ((5 - L) × (20 / 2))

If 5 < L ≤ 10:
    S_loss = 20 + ((10 - L) × (30 / 5))

If L > 10:
    S_loss = 20
```

---

## Composite Score Calculation

All composite scores are weighted sums of the normalized metric scores, then clamped to 0-100.

### Network Health Score ($Score_{health}$)

```
Score_health = Round(
    (S_download × 0.35) +
    (S_upload × 0.20) +
    (S_ping × 0.20) +
    (S_jitter × 0.15) +
    (S_loss × 0.10)
)
```

**Weights:**
- Download: 35%
- Upload: 20%
- Ping: 20%
- Jitter: 15%
- Packet Loss: 10%

---

### Gaming Score ($Score_{gaming}$)

```
Score_gaming = Round(
    (S_ping × 0.45) +
    (S_jitter × 0.30) +
    (S_loss × 0.20) +
    (S_download × 0.05)
)
```

**Weights:**
- Ping: 45%
- Jitter: 30%
- Packet Loss: 20%
- Download: 5%

---

### Streaming Score ($Score_{streaming}$)

```
Score_streaming = Round(
    (S_download × 0.60) +
    (S_upload × 0.10) +
    (S_ping × 0.10) +
    (S_jitter × 0.10) +
    (S_loss × 0.10)
)
```

**Weights:**
- Download: 60%
- Upload: 10%
- Ping: 10%
- Jitter: 10%
- Packet Loss: 10%

---

### Video Call Score ($Score_{video}$)

```
Score_video = Round(
    (S_upload × 0.30) +
    (S_ping × 0.25) +
    (S_jitter × 0.25) +
    (S_loss × 0.15) +
    (S_download × 0.05)
)
```

**Weights:**
- Upload: 30%
- Ping: 25%
- Jitter: 25%
- Packet Loss: 15%
- Download: 5%

---

### Browsing Score ($Score_{browsing}$)

```
Score_browsing = Round(
    (S_download × 0.40) +
    (S_ping × 0.30) +
    (S_upload × 0.10) +
    (S_jitter × 0.10) +
    (S_loss × 0.10)
)
```

**Weights:**
- Download: 40%
- Ping: 30%
- Upload: 10%
- Jitter: 10%
- Packet Loss: 10%

---

## Clamping

All final scores are clamped to ensure they stay within the 0-100 range:

```
Final Score = Max(0, Min(100, Calculated Score))
```
