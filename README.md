# AI-Powered CyberSecure Network Dashboard for ISP Insights

A smart network dashboard that leverages artificial intelligence and cybersecurity analytics to track patterns, detect anomalies, and provide actionable suggestions for Internet Service Providers.

## Architecture Overview
```
User Browser (client)
    |
    |-- Ping test
    |-- Download test
    |-- Upload test
    |
    V
Backend API (server)
    |
    |-- Calculate metrics
    |-- Store results
    |-- Analytics
```

## Project Structure

This repository is organized into a client-server architecture:

- `/server`: The backend API built with Node.js and Express.
- `/client`: (Coming Soon) The frontend dashboard.

---

## Ping Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ping/tests | Run a new ping test |
| GET | /api/ping/tests/:id | Get a specific ping test |
| GET | /api/ping/history | Get ping test history |
| GET | /api/ping/summary | Get ping summary stats |

---

## Speed Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/speed/download | Stream test data for download speed testing (requires `sizeMb` query param, allowed: 1,5,10,20) |
| POST | /api/speed/tests/download | Submit client-measured download test results (final + all individual measurements) |
| POST | /api/speed/upload | Receive upload data for speed testing (requires `sizeMb` query param, allowed: 0.5,1,5,10,20) |
| POST | /api/speed/tests/upload | Submit client-measured upload test results (final + all individual measurements) |

---

## Network Scoring Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/network/score | Calculate and save network health, gaming, streaming, video call, and browsing scores for a test result |
| POST | /api/network/summary | Generate and save AI-powered summary of network performance (with rule-based fallback) |

---

## AI Summary Fallback System
The AI summary endpoint includes a robust fallback system to ensure 100% uptime:

1. **Primary Provider**: Google Gemini API (requires `GEMINI_API_KEY` in `.env`)
2. **Fallback**: Rule-based summary generator (always available, no external dependencies)

The rule-based system uses network_health_score to categorize connection quality (excellent/good/fair/poor) and evaluates suitability for gaming, streaming, and video calls based on their respective scores.

---

## Backend Setup (Server)

The backend follows a modular structure (Controllers, Models, Routes, etc.) to ensure scalability and clean code.

### Server Folder Structure
```
server/
├── src/
│   ├── config/         # Database and environment configuration
│   ├── controllers/    # Request handlers (connect routes to services)
│   ├── docs/         # SQL schemas, setup guides, ER diagrams
│   ├── middleware/   # Custom middleware (authentication, error handling)
│   ├── models/       # Database models (Profile, TestResult, etc.)
│   ├── routes/       # API routes and Swagger docs comments
│   ├── services/    # Business logic (score calculations, etc.)
│   ├── utils/        # Helper functions
│   └── server.js  # Express server entry point
├── .env.example
├── package.json
└── SETUP.md
```

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your system.
- A [Supabase](https://supabase.com/) account and project (free tier works!)

### Installation
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install the required packages:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   - Copy `.env.example` → `.env` in `server/src/`
   - Fill in your Supabase project URL, anon key, and service role key
4. Set up your database schema:
   - Log in to your Supabase project → **SQL Editor**
   - Open `server/src/docs/phase_one_schema.sql` (base schema)
   - Copy and paste the contents into the SQL Editor and run it
   - (Important) If you already have the schema set up and need to fix the size columns:
     - Open `server/src/docs/speed_module_schema_fix.sql` and run it
5. (Optional) Check out `server/SETUP.md` for more detailed setup

### Running the Server
- **Development Mode** (with automatic restart):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

The server will start on `http://localhost:5000` (by default).

### API Documentation
Once the server is running, you can access the interactive Swagger documentation at:
`http://localhost:5000/api-docs`

---

## Packages Used

### Core Dependencies
- **express**: Fast, unopinionated, minimalist web framework for Node.js.
- **cors**: Middleware to enable Cross-Origin Resource Sharing.
- **helmet**: Adds security HTTP headers.
- **compression**: Compresses HTTP responses to improve performance.
- **morgan**: HTTP request logging middleware.
- **dotenv**: Loads environment variables from a `.env` file into `process.env`.
- **@supabase/supabase-js**: Supabase SDK for interacting with the Supabase database and auth.
- **swagger-ui-express**: Serves auto-generated swagger-ui generated API docs from express.
- **swagger-jsdoc**: Generates swagger specifications from JSDoc comments in your code.

### Development Dependencies
- **nodemon**: Automatically restarts the node application when file changes in the directory are detected.

---

## Collaboration Guidelines
- Use feature branches for new tasks: `git checkout -b feature/your-feature-name`
- Open a Pull Request (PR) for code review before merging into `main`.
- Refer to `server/src/docs/phase_one_schema.md` for database schema and ER diagram
- Refer to `server/SETUP.md` for detailed Supabase setup guide
