# AI-Powered AkovoLabs Speedtest - Backend

A Node.js and Express backend API for the AI-Powered AkovoLabs Speedtest, providing network testing, analytics, and AI-powered insights for Internet Service Providers.

## Table of Contents

- [About](#about)
- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
  - [Auth & Email Verification Endpoints](#auth--email-verification-endpoints)
  - [Ping Endpoints](#ping-endpoints)
  - [Speed Endpoints](#speed-endpoints)
  - [Network Scoring Endpoints](#network-scoring-endpoints)
  - [Analytics Endpoints](#analytics-endpoints)
  - [Port Risk Detection Endpoints](#port-risk-detection-endpoints)
  - [Profile Endpoints](#profile-endpoints)
  - [Subscriber Endpoints](#subscriber-endpoints)
  - [System Metrics Endpoints](#system-metrics-endpoints)
- [Email Verification & Auth Flow](#email-verification--auth-flow)
- [AI Summary Fallback System](#ai-summary-fallback-system)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Dependencies](#dependencies)
- [Collaboration Guidelines](#collaboration-guidelines)
- [Related Links](#related-links)

## About

This is the backend API for the AI-Powered AkovoLabs Speedtest. It provides:

- Network test execution and result storage
- AI-powered network performance summaries
- Advanced analytics and anomaly detection
- Network health scoring for various use cases
- Port risk detection and security analysis
- Secure authentication via Supabase, with EmailJS-driven email verification and OTP password reset
- Newsletter subscriber management and public system metrics

## Architecture Overview

```
User Browser (Client)
    |
    |-- Ping test
    |-- Download test
    |-- Upload test
    |
    V
Backend API (Server)
    |
    |-- Calculate metrics
    |-- Store results
    |-- Analytics
    V
Supabase Database
```

## Features

- **Network Speed Testing**: Comprehensive ping, download, and upload test handling with public/anonymous access support
- **Cloudflare CDN-Backed Downloads** (optional): Pre-randomised static test files served with `Cache-Control: public, max-age=86400` so Cloudflare caches them at the edge. Download traffic bypasses the VPS bandwidth cap entirely — the client fetches byte ranges of a cached file via HTTP Range headers across N parallel connections.
- **RTT-Adaptive Parallel Streams**: Connection count (2–8) is chosen based on measured RTT. Low-latency links use more streams to saturate the link; high-latency links use fewer to avoid head-of-line blocking. Matches Ookla's adaptive connection strategy.
- **Timer-Based Throughput Sampling**: A 50ms interval timer (20 Hz) snapshots bytes loaded across all connections for real-time progress, decoupling measurement from Axios callback frequency. Provides consistent sampling on both 1 Mbps and 1 Gbps+ connections.
- **Per-Connection Outlier Trimming**: Each connection's throughput is computed from its own start→end window. The slowest 25% of connections are discarded (TCP congestion outliers), and the remaining speeds are averaged.
- **Longest-Duration Pass Selection**: The final result is the longest-duration pass (not median, not max), as it has the most throughput samples and best represents steady-state throughput.
- **Random Upload Data**: Upload blobs use `crypto.getRandomValues` instead of zero-filled buffers, preventing transparent compression from inflating measurements.
- **Sequential Ping Measurement**: Pings fire one at a time (not concurrently) to avoid event-loop queuing inflating RTT. Uses raw `fetch()` to bypass Axios interceptor overhead. Compression middleware is excluded from the ping health endpoint.
- **Connection Stability Detection**: Flags erratic connections when max/min speed ratio across adaptive passes exceeds ~2.5×
- **Data Storage**: Persistent test result storage in Supabase PostgreSQL
- **Network Scoring**: Automated health, gaming, streaming, video call, and browsing scores
- **Port Risk Detection**: TCP port scanning, risk scoring, and security recommendations with:
  - Unencrypted protocol detection
  - Dangerous port combination alerts
  - Common exploit target warnings
  - Scan timing anomaly detection
  - Historical scan comparison
- **AI-Powered Insights**: Google Gemini API integration for intelligent summaries (with rule-based fallback)
- **Analytics Engine**: Time-series data and anomaly detection
- **Email Verification & Auth**: Server-side account creation via the Supabase Admin API (no duplicate native email), branded EmailJS verification links, and OTP-based password reset
- **Newsletter Subscribers**: Subscribe, update, and unsubscribe management
- **System Metrics**: Public statistics (user count, countries, uptime, founded year)
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Security**: Helmet security headers with CSP, restricted CORS, JWT validation, and per-route + global rate limiting

## Tech Stack

- **Node.js**: Runtime environment
- **Express 5**: Web application framework
- **Supabase**: Database and authentication
- **PostgreSQL**: Relational database
- **Swagger/OpenAPI**: API documentation
- **Google Gemini AI**: AI-powered insights
- **EmailJS REST API**: Server-side transactional email delivery (verification links & OTP codes)
- **Zod**: Data validation
- **Winston**: Logging
- **express-rate-limit**: Brute-force and abuse protection
- **Nodemon**: Development auto-reload

## Project Structure

```
server/
├── src/
│   ├── config/         # Database and environment configuration
│   │   └── db.js
│   ├── controllers/    # Request handlers (connect routes to services)
│   │   ├── aiSummary.controller.js
│   │   ├── analytics.controller.js
│   │   ├── devAuthController.js
│   │   ├── networkScoringController.js
│   │   ├── otpController.js          # Register, send/verify OTP, reset, verify-link
│   │   ├── pingController.js
│   │   ├── portRiskController.js
│   │   ├── profileController.js
│   │   ├── speedController.js
│   │   ├── subscriberController.js
│   │   └── systemMetricsController.js
│   ├── docs/         # SQL schemas, setup guides, ER diagrams, migrations
│   │   ├── migrations/
│   │   │   └── 004_add_was_unstable.sql
│   │   ├── deletion_stepsAndPlan.txt
│   │   ├── empty_db_schema.sql
│   │   ├── phase_one_schema.md
│   │   ├── phase_one_schema.sql
│   │   └── testing_guide.md
│   ├── middleware/   # Custom middleware
│   │   ├── errorHandler.js
│   │   ├── optionalAuth.js             # Tries JWT, falls back to anonymous ID header
│   │   └── validateSupabaseJWT.js
│   ├── models/       # Database models
│   │   ├── AnomalyLog.js
│   │   ├── DownloadMeasurement.js
│   │   ├── PingMeasurement.js
│   │   ├── PortKnowledgeBase.js
│   │   ├── PortRiskAssessment.js
│   │   ├── PortScanResult.js
│   │   ├── Profile.js
│   │   ├── SecurityRecommendation.js
│   │   ├── Subscriber.js
│   │   ├── SystemMetric.js
│   │   ├── TestResult.js
│   │   └── UploadMeasurement.js
│   ├── routes/       # API routes
│   │   ├── analytics.js
│   │   ├── devAuth.js
│   │   ├── network.js
│   │   ├── otp.js                    # Auth & email verification routes
│   │   ├── ping.js
│   │   ├── portRisk.js
│   │   ├── profiles.js
│   │   ├── speed.js
│   │   ├── subscribers.js
│   │   └── systemMetrics.js
│   ├── services/    # Business logic
│   │   ├── aiSummary.service.js
│   │   ├── analytics.service.js
│   │   ├── emailService.js           # EmailJS server-side delivery
│   │   ├── networkScoring.service.js
│   │   ├── network_scoring.md
│   │   ├── ping.service.js
│   │   ├── ping_formulas.md
│   │   ├── portRisk.service.js
│   │   ├── speed.service.js
│   │   ├── speed_notes.md
│   │   ├── template_reset.html       # Password reset email template (OTP)
│   │   └── template_verify.html      # Verification email template (link)
│   ├── utils/        # Helper functions
│   │   ├── networkMetrics.js
│   │   └── testResultPresentation.js
│   └── server.js  # Express server entry point
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── Speedtest_Research.md
├── Port_Risk_Research.md
└── SETUP.md
```

## API Endpoints

> Most data endpoints require a Supabase JWT in the `Authorization: Bearer <token>` header. Speed test submission endpoints (ping, download, upload, network score/summary) accept anonymous access via an `X-Anonymous-Id` header, rate limited to 20 requests / 15 min (~4 full test runs). Authenticated users (Bearer token present) bypass the speedtest rate limiter entirely. When the anonymous limit is hit, the response suggests signing in for unlimited tests and security insights. Auth/OTP, system metrics, and the port knowledge base are public. Auth endpoints are rate limited (10 requests / 15 min). Global rate limit is 100 requests / minute.

### Auth & Email Verification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/otp/register | Create a new user via the Supabase Admin API (no native Supabase email) and send an EmailJS verification link |
| POST | /api/otp/send | Send an OTP/link (`purpose`: `verify` or `reset`) via EmailJS |
| POST | /api/otp/verify | Verify a 6-digit OTP code (returns a reset token when `purpose` is `reset`) |
| POST | /api/otp/reset-password | Reset the password using a verified reset token |
| GET | /api/otp/verify-link | Confirm an email from a clickable verification link (`?token=&email=`) |

### Ping Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ping/tests | Run a new ping test |
| GET | /api/ping/tests/:id | Get a specific ping test |
| GET | /api/ping/history | Get ping test history |
| GET | /api/ping/summary | Get ping summary stats |

### Speed Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
 | GET | /api/speed/download | Stream random binary data for download speed testing (`sizeMb` query param, any positive number) |
 | POST | /api/speed/tests/download | Submit client-measured download test results (final + all individual measurements from parallel connections) |
 | POST | /api/speed/upload | Receive upload binary stream for speed testing (`sizeMb` query param, any positive number) |
 | POST | /api/speed/tests/upload | Submit client-measured upload test results (final + all individual measurements from parallel connections) |

### Network Scoring Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/network/score | Calculate and save network health, gaming, streaming, video call, and browsing scores for a test result |
| POST | /api/network/summary | Generate and save AI-powered summary of network performance (with rule-based fallback) |

### Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/overview | Get high-level summary of user network performance |
| GET | /api/analytics/history | Get time-series data for graphs (supports ?range=7d|30d|90d) |
| GET | /api/analytics/test/:test_result_id | Get full detailed breakdown of a single test |
| GET | /api/analytics/anomalies | Detect and return network issues automatically |

### Port Risk Detection Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/port-risk/assess | Run a full port risk assessment (scan, score, and recommendations) |
| POST | /api/port-risk/standalone | Run standalone port risk assessment (no speed test required) |
| GET | /api/port-risk/assessment/:id | Get a specific port risk assessment by ID |
| GET | /api/port-risk/test-result/:testResultId | Get port risk assessment for a specific test result |
| GET | /api/port-risk/assessments | Get all port risk assessments for the current user |
| GET | /api/port-risk/knowledge-base | Get the port knowledge base (public) |

### Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/profile | Get the current user's profile |
| PUT | /api/profile | Update the current user's profile (username, first/last name) |

### Subscriber Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/subscriber | Get the current user's newsletter subscription |
| POST | /api/subscriber | Subscribe the current user |
| PUT | /api/subscriber | Update the current user's subscription |
| DELETE | /api/subscriber | Unsubscribe the current user |

### System Metrics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/system/metrics | Get public system metrics (users, countries, uptime, founded year) |
| POST | /api/system/metrics/refresh | Refresh metrics from the database and return updated values |

> A health check is also available at `GET /` and a database connectivity check at `GET /api/health/db`. In development mode only, `POST /dev/auth/login` issues a JWT for testing.

## Email Verification & Auth Flow

Account verification is handled entirely through EmailJS while Supabase Auth remains the source of truth. This avoids duplicate emails and keeps sign-in blocked until an account is verified:

1. **Register** — `POST /api/otp/register` creates the user via the Supabase Admin API with `email_confirm: false`. Because the account is created server-side, Supabase does **not** send its own native confirmation email.
2. **Send link** — a signed verification token is stored on the user and a branded verification link is emailed via EmailJS (`template_verify.html`).
3. **Blocked sign-in** — while unconfirmed, Supabase rejects login with "Email not confirmed" (requires "Enable email confirmations" to remain ON in the Supabase dashboard).
4. **Confirm** — clicking the link hits `GET /api/otp/verify-link`, which validates the token and confirms the email via the Admin API. Already-verified links are treated as success.
5. **Password reset** — `POST /api/otp/send` with `purpose: reset` emails a 6-digit OTP (`template_reset.html`); `POST /api/otp/verify` validates it and returns a short-lived reset token used by `POST /api/otp/reset-password`.

If EmailJS environment variables are missing, the service logs the intended email and skips sending (non-fatal in development).

## AI Summary Fallback System

The AI summary endpoint includes a robust fallback system to ensure 100% uptime:

1. **Primary Provider**: Google Gemini API (requires `GEMINI_API_KEY` in `.env`)
2. **Fallback**: Rule-based summary generator (always available, no external dependencies)

The rule-based system uses network_health_score to categorize connection quality (excellent/good/fair/poor) and evaluates suitability for gaming, streaming, and video calls based on their respective scores. If the `was_unstable` flag is set, the fallback adds connection stability advice.

## Requirements

- [Node.js](https://nodejs.org/) installed on your system
- A [Supabase](https://supabase.com/) account and project (free tier works)
- (Optional) Google Gemini API key for AI-powered summaries

## Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install the required packages:
   ```bash
   npm install
   ```

## Environment Configuration

1. Copy the environment example file into `server/src/`:
   ```bash
   cp .env.example src/.env
   ```

2. Edit the `.env` file in `server/src/` and fill in your configuration:

   ```env
   # Server
   PORT=5000
   NODE_ENV=development
   USE_HTTPS=false

   # Supabase
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AI (optional — falls back to rule-based summaries if unset)
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash       # Change when a model is overloaded

   # OTP / CORS
   OTP_SECRET=your_otp_hmac_secret
   ALLOWED_ORIGINS=http://localhost:5173

   # EmailJS (server-side email delivery)
   EMAILJS_SERVICE_ID=your_emailjs_service_id
   EMAILJS_TEMPLATE_VERIFY_ID=your_verify_template_id
   EMAILJS_TEMPLATE_RESET_ID=your_reset_template_id
   EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   EMAILJS_PRIVATE_KEY=your_emailjs_private_key
   ```

   > EmailJS requires "API access from non-browser environments" to be enabled in your EmailJS dashboard (Account → Security) for server-side sending to work. Keep Supabase "Enable email confirmations" ON so unverified accounts cannot sign in.

## Database Setup

1. Log in to your Supabase project → **SQL Editor**
2. Open `server/src/docs/phase_one_schema.sql` (complete schema including all features)
3. Copy and paste the contents into the SQL Editor and run it

For more detailed setup instructions, see `server/SETUP.md`

## Running the Server

### Development Mode

Start the server with automatic restart on file changes:
```bash
npm run dev
```

### Production Mode

Start the server in production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (by default).

## Cloudflare CDN Setup (Optional)

A single VPS has limited outbound bandwidth (~5–100 Mbps depending on provider). For users with high-speed connections (300+ Mbps), the download test measures the VPS bottleneck instead of the real line speed. Cloudflare's free CDN sidesteps this by caching static test files at hundreds of edge nodes worldwide.

### Prerequisites

- Your domain is behind Cloudflare proxy (orange cloud enabled on the DNS A record)
- The VPS is accessible through the Cloudflare-proxied domain

### How It Works

1. The server generates pre-randomised test files (2, 5, 10, 20, 50, 100 MB) on startup at `server/public/speedtest/download/`
2. Files are served with `Cache-Control: public, max-age=86400` — Cloudflare caches them at the edge after the first request from each region
3. The client fetches byte ranges of the cached file using HTTP Range headers across N parallel connections
4. Subsequent download tests hit the Cloudflare edge (unmetered bandwidth) instead of the VPS

Uploads still go directly to the VPS (Cloudflare can't proxy upload data).

### Setup

1. **Enable Cloudflare proxy on your domain** — In Cloudflare DNS settings, ensure your domain's A record has the orange cloud (proxy) enabled
2. **Set the client environment variable** — Add to your client `.env.production`:
   ```
   VITE_CDN_BASE_URL=https://yourdomain.com
   ```
3. **Deploy the server** — The `generate-test-files.js` script runs automatically on startup. File generation takes ~30 seconds for all sizes and skips existing files on subsequent restarts.
4. **First test warms the cache** — The first download request from each Cloudflare region hits the VPS. Subsequent requests from that region are served from the edge.

### Verify

Run a speed test twice. The first test may show VPS-capped download speeds; the second should show your real line speed. Check Cloudflare dashboard → **Caching** → **Cache Analytics** for hit rates on `/speedtest/download/*`.

## API Documentation

Once the server is running, you can access the interactive Swagger documentation at:
`http://localhost:5000/api-docs`

## Dependencies

### Core Dependencies

- **express**: Fast, unopinionated, minimalist web framework for Node.js
- **cors**: Middleware to enable Cross-Origin Resource Sharing
- **helmet**: Adds security HTTP headers
- **compression**: Compresses HTTP responses to improve performance
- **morgan**: HTTP request logging middleware
- **dotenv**: Loads environment variables from a `.env` file into `process.env`
- **@supabase/supabase-js**: Supabase SDK for interacting with the Supabase database and auth
- **swagger-ui-express**: Serves auto-generated swagger-ui generated API docs from express
- **swagger-jsdoc**: Generates swagger specifications from JSDoc comments in your code
- **@google/generative-ai**: Google Gemini AI API integration
- **express-rate-limit**: Rate limiting for auth and global API abuse protection
- **node-fetch**: HTTP client used for EmailJS delivery and outbound requests
- **pg**: PostgreSQL client
- **zod**: TypeScript-first schema declaration and validation
- **winston**: Logging library
- **simple-statistics**: Statistical functions
- **jsonwebtoken**: JWT handling
- **bcryptjs**: Password hashing

### Development Dependencies

- **nodemon**: Automatically restarts the node application when file changes in the directory are detected

## Collaboration Guidelines

- Use feature branches for new tasks: `git checkout -b feature/your-feature-name`
- Open a Pull Request (PR) for code review before merging into `main`
- Refer to `server/src/docs/phase_one_schema.md` for database schema and ER diagram
- Refer to `server/SETUP.md` for detailed Supabase setup guide

## Related Links

- [Frontend Client](../client/)
- [Supabase Documentation](https://supabase.com/docs)
- [Express Documentation](https://expressjs.com/)
- [Swagger Documentation](https://swagger.io/docs/)
