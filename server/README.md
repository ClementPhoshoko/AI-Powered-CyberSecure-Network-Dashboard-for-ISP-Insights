# AI-Powered AkovoLabs Speedtest - Backend

A Node.js and Express backend API for the AI-Powered AkovoLabs Speedtest, providing network testing, analytics, and AI-powered insights for Internet Service Providers.

## Table of Contents

- [About](#about)
- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
  - [Ping Endpoints](#ping-endpoints)
  - [Speed Endpoints](#speed-endpoints)
  - [Network Scoring Endpoints](#network-scoring-endpoints)
  - [Analytics Endpoints](#analytics-endpoints)
  - [Port Risk Detection Endpoints](#port-risk-detection-endpoints)
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
- Secure authentication via Supabase

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

- **Network Speed Testing**: Comprehensive ping, download, and upload test handling
- **Data Storage**: Persistent test result storage in Supabase PostgreSQL
- **Network Scoring**: Automated health, gaming, streaming, video call, and browsing scores
- **Port Risk Detection**: TCP port scanning, risk scoring, and security recommendations
- **AI-Powered Insights**: Google Gemini API integration for intelligent summaries
- **Analytics Engine**: Time-series data and anomaly detection
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Security**: Helmet for security headers, CORS configuration, JWT validation

## Tech Stack

- **Node.js**: Runtime environment
- **Express 5**: Web application framework
- **Supabase**: Database and authentication
- **PostgreSQL**: Relational database
- **Swagger/OpenAPI**: API documentation
- **Google Gemini AI**: AI-powered insights
- **Zod**: Data validation
- **Winston**: Logging
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
│   │   ├── pingController.js
│   │   ├── portRiskController.js
│   │   ├── profileController.js
│   │   └── speedController.js
│   ├── docs/         # SQL schemas, setup guides, ER diagrams
│   │   ├── phase_one_schema.md
│   │   ├── phase_one_schema.sql
│   │   └── testing_guide.md
│   ├── middleware/   # Custom middleware
│   │   ├── errorHandler.js
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
│   │   ├── TestResult.js
│   │   └── UploadMeasurement.js
│   ├── routes/       # API routes
│   │   ├── analytics.js
│   │   ├── devAuth.js
│   │   ├── network.js
│   │   ├── ping.js
│   │   ├── portRisk.js
│   │   ├── profiles.js
│   │   └── speed.js
│   ├── services/    # Business logic
│   │   ├── aiSummary.service.js
│   │   ├── analytics.service.js
│   │   ├── networkScoring.service.js
│   │   ├── network_scoring.md
│   │   ├── ping.service.js
│   │   ├── ping_formulas.md
│   │   ├── portRisk.service.js
│   │   ├── speed.service.js
│   │   └── speed_notes.md
│   ├── utils/        # Helper functions
│   │   ├── networkMetrics.js
│   │   └── testResultPresentation.js
│   └── server.js  # Express server entry point
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── Research.md
├── Port_Risk_Research.md
└── SETUP.md
```

## API Endpoints

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
| GET | /api/speed/download | Stream test data for download speed testing (requires `sizeMb` query param, allowed: 1,5,10,20) |
| POST | /api/speed/tests/download | Submit client-measured download test results (final + all individual measurements) |
| POST | /api/speed/upload | Receive upload data for speed testing (requires `sizeMb` query param, allowed: 0.5,1,5,10,20) |
| POST | /api/speed/tests/upload | Submit client-measured upload test results (final + all individual measurements) |

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

## AI Summary Fallback System

The AI summary endpoint includes a robust fallback system to ensure 100% uptime:

1. **Primary Provider**: Google Gemini API (requires `GEMINI_API_KEY` in `.env`)
2. **Fallback**: Rule-based summary generator (always available, no external dependencies)

The rule-based system uses network_health_score to categorize connection quality (excellent/good/fair/poor) and evaluates suitability for gaming, streaming, and video calls based on their respective scores.

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

1. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file in `server/src/` and fill in your configuration

## Database Setup

1. Log in to your Supabase project → **SQL Editor**
2. Open `server/src/docs/phase_one_schema.sql` (base schema)
3. Copy and paste the contents into the SQL Editor and run it
4. (Important) If you already have the schema set up and need to fix the size columns:
   - Open `server/src/docs/speed_module_schema_fix.sql` and run it
5. (New) To add Port Risk Detection functionality, open `server/src/docs/phase_two_port_risk_schema.sql` and run it

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
