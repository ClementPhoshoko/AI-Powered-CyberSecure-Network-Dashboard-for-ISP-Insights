# AI-Powered AkovoLabs Speedtest - Frontend

A React-based frontend dashboard for the AI-Powered AkovoLabs Speedtest, providing ISP insights, network testing, and cybersecurity analytics.

## Table of Contents

- [About](#about)
- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Dependencies](#dependencies)
- [Related Links](#related-links)

## About

This is the frontend client for the AI-Powered AkovoLabs Speedtest. It provides a user interface for:

- Running network speed tests (download, upload, ping)
- Viewing test history and analytics
- Port risk detection and security analysis (scan, insights, knowledge)
- AI-powered network performance and security summaries
- User authentication with EmailJS email verification and OTP password reset
- Account management and newsletter subscription
- Light/dark theme support
- Real-time network health monitoring

## Architecture Overview

```
User Browser (Client)
    |
    |-- React Dashboard UI
    |-- Speed Test Execution
    |-- Data Visualization
    |
    V
Backend API (Server)
    |
    |-- REST API Endpoints
    |-- Supabase Authentication
    |-- Data Storage & Processing
    V
Supabase Database
```

## Features

- **Network Speed Testing**: Real-time ping, download, and upload speed tests (anonymous/public access supported)
- **Parallel Connection Speed Test**: Download and upload each use 4 parallel HTTP streams with steady-state averaging for accurate results
- **Connection Stability Warning**: Visual badge on test results when connection speed fluctuates significantly across passes; amber dot markers on history chart data points
- **Test History**: Complete historical record of all network tests
- **Port Risk Security**: Interactive scan wheel, risk scoring, open-port breakdown, recommendations, and a security knowledge base
- **Analytics Dashboard**: Visual data representation using Recharts
- **AI-Powered Insights**: AI-generated network performance and security summaries
- **User Authentication**: Login/signup with Supabase Auth, EmailJS-based email verification links, and OTP password reset
- **Account Management**: Update profile details and manage newsletter subscription
- **Theming**: Light/dark theme via a theme context
- **Protected & Public Routes**: Route guards based on authentication status; anonymous users can run speed tests without signing in
- **Automatic Session Invalidation**: When the server returns a 401 (expired/invalid token), the axios response interceptor clears the session cache, signs out via Supabase, and shows a "Your session has expired" modal that redirects the user to the login page
- **Content Pages**: About, Services, News (blog), and Download pages
- **Responsive Design**: Modern, mobile-friendly UI

## Tech Stack

- **React 19**: Frontend framework
- **Vite**: Build tool and dev server
- **React Router 7**: Client-side routing
- **Supabase**: Authentication and database integration
- **EmailJS**: Client-side email integration support
- **Axios**: HTTP client for API requests
- **Recharts**: Data visualization library
- **Framer Motion**: Animation library
- **Heroicons**: Icon set
- **React Datepicker**: Date selection component

## Project Structure

```
client/
├── public/                  # Static assets
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/             # Images and media assets
│   │   ├── avatars/        # Avatar images
│   │   └── hero/           # Hero/section images
│   ├── components/         # Reusable React components
│   │   ├── ai_summary_snippet/       # AI summary snippet
│   │   ├── error_modal/              # Error modal
│   │   ├── footer/                   # Footer (+ skeleton)
│   │   ├── insights_history_section/ # Security insights history
│   │   ├── insights_metrics_section/ # Security insights metrics
│   │   ├── insights_summary_section/ # Security insights summary
│   │   ├── loading/                  # Loading spinner
│   │   ├── modal/                    # General modal
│   │   ├── nav/                      # Navigation bar
│   │   ├── network_score_badge/      # Network/risk score badge
│   │   ├── notice_modal/             # Notice modal
│   │   ├── port_risk_status_chip/    # Port risk status chip
│   │   ├── protected_route/          # Protected route wrapper
│   │   ├── public_route/             # Public route wrapper
│   │   ├── recommendations_summary_section/
│   │   ├── scan_empty_state/         # Scan empty state
│   │   ├── scan_error_state/         # Scan error state
│   │   ├── scan_highlights_section/  # Scan highlights
│   │   ├── scan_loading_skeleton/    # Scan skeleton loader
│   │   ├── scan_metric_grid/         # Scan metric grid
│   │   ├── scan_metric_tile/         # Scan metric tile
│   │   ├── scan_overview_card/       # Scan overview card
│   │   ├── scan_phase_stepper/       # Scan phase stepper
│   │   ├── scan_progress_bar/        # Scan progress bar
│   │   ├── scan_wheel/               # Interactive scan wheel
│   │   ├── speech_bubble/            # Speech bubble
│   │   ├── speedmeter/               # Speed meter visualization
│   │   ├── stats_cards/              # Statistics cards
│   │   ├── time_series/              # Time series graphs
│   │   ├── top_open_ports_list/      # Top open ports list
│   │   ├── top_recommendations_list/ # Top recommendations list
│   │   └── AnimatedNumber.jsx        # Animated number component
│   ├── context/            # React Context providers
│   │   ├── AuthContext.jsx  # Authentication state management
│   │   └── ThemeContext.jsx # Light/dark theme management
│   ├── global_styles/      # Global CSS styles
│   │   ├── App.css
│   │   ├── global_tokens.css
│   │   └── index.css
│   ├── hooks/              # Custom React hooks
│   │   ├── usePortRisk.js
│   │   ├── useProfile.js
│   │   ├── useSpeedTest.js
│   │   ├── useSpeedTestHistory.js
│   │   ├── useSubscriber.js
│   │   └── useSystemMetrics.js
│   ├── pages/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   │   ├── forms/      # Login, Register, Forgot, Verify forms
│   │   │   └── AuthLayout.jsx
│   │   ├── auth_required/  # Auth required page
│   │   ├── about/          # About page (+ contact)
│   │   ├── download/       # Download page
│   │   ├── history/        # Test history page
│   │   ├── home/           # Home/dashboard page
│   │   ├── manage_account/ # Account management page (Account.jsx)
│   │   ├── news/           # News page (+ blogs)
│   │   ├── not_found/      # 404 page
│   │   ├── security/       # Port Risk Security (scan/insights/knowledge tabs)
│   │   └── services/       # Services page
│   ├── services/           # API service layer
│   │   ├── analyticsService.js
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── errorUtils.js
│   │   ├── networkService.js
│   │   ├── pingService.js
│   │   ├── portRiskService.js
│   │   ├── profileService.js
│   │   ├── sessionCache.js
│   │   ├── speedService.js
│   │   ├── subscriberService.js
│   │   ├── supabase.js
│   │   └── systemMetricsService.js
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Root application component
│   └── main.jsx            # Application entry point
├── .env.example            # Environment variables example
├── .gitignore
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── package.json
├── vite.config.js          # Vite configuration
└── README.md
```

## Application Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home / dashboard |
| `/about` | Public | About page |
| `/services` | Public | Services page |
| `/news` | Public | News / blog |
| `/download` | Public | Download page |
| `/login` | Public only | Sign in (redirects if already authenticated) |
| `/signup` | Public only | Create account (triggers EmailJS verification) |
| `/forgot-password` | Public | Request an OTP to reset the password |
| `/verify-email` | Public | Confirm an email from the verification link |
| `/tests` | Protected | Speed test history |
| `/security` | Protected | Port Risk Security (scan / insights / knowledge) |
| `/account` | Protected | Manage account and subscription |
| `/auth-required` | Public | Prompt shown when auth is required |
| `*` | Public | 404 Not Found |

## Requirements

- Node.js (version compatible with React 19)
- npm or yarn package manager
- Access to the backend server (running at http://localhost:5000 by default)
- A Supabase project with configured database and authentication

## Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Configuration

1. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and fill in your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_API_URL=http://localhost:5000
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   - `VITE_API_BASE_URL` — base URL for REST API calls (includes `/api` path)
   - `VITE_API_URL` — server origin used for binary speed test streams, auth/OTP, and CORS (no `/api` suffix)

## Running the Application

### Development Mode

Start the development server with hot module replacement:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Preview

Preview the production build locally:
```bash
npm run preview
```

## Building for Production

Create an optimized production build:
```bash
npm run build
```

The built files will be output to the `dist/` directory.

## Linting

Run ESLint to check code quality:
```bash
npm run lint
```

## Dependencies

### Core Dependencies
- `react`: Frontend framework
- `react-dom`: DOM rendering
- `react-router-dom`: Client-side routing
- `@supabase/supabase-js`: Supabase SDK
- `@emailjs/browser`: EmailJS integration
- `@heroicons/react`: Icon set
- `axios`: HTTP client
- `framer-motion`: Animations
- `recharts`: Data visualization
- `react-datepicker`: Date picker component
- `uuid`: UUID generation

### Development Dependencies
- `vite`: Build tool
- `@vitejs/plugin-react`: React plugin for Vite
- `eslint`: Linting
- `@eslint/js`: ESLint JavaScript rules
- `eslint-plugin-react-hooks`: React hooks linting
- `eslint-plugin-react-refresh`: React refresh linting
- `globals`: Global variables configuration

## Related Links

- [Backend Server](../server/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
