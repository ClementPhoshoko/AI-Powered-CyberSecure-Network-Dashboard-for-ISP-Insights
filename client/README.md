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
- AI-powered network performance summaries
- User authentication and account management
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

- **Network Speed Testing**: Real-time ping, download, and upload speed tests
- **Test History**: Complete historical record of all network tests
- **Analytics Dashboard**: Visual data representation using Recharts
- **AI-Powered Insights**: AI-generated network performance summaries
- **User Authentication**: Secure login/signup with Supabase Auth
- **Protected Routes**: Route protection based on authentication status
- **Responsive Design**: Modern, mobile-friendly UI

## Tech Stack

- **React 19**: Frontend framework
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Supabase**: Authentication and database integration
- **Axios**: HTTP client for API requests
- **Recharts**: Data visualization library
- **Framer Motion**: Animation library
- **React Datepicker**: Date selection component

## Project Structure

```
client/
├── public/                  # Static assets
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/             # Images and media assets
│   │   └── avatars/        # Avatar images
│   ├── components/         # Reusable React components
│   │   ├── error_modal/    # Error modal component
│   │   ├── footer/         # Footer component
│   │   ├── loading/        # Loading spinner
│   │   ├── modal/          # General modal component
│   │   ├── nav/            # Navigation bar
│   │   ├── notice_modal/   # Notice modal component
│   │   ├── protected_route/ # Protected route wrapper
│   │   ├── public_route/   # Public route wrapper (redirects logged-in users)
│   │   ├── speedmeter/     # Speed meter visualization
│   │   ├── stats_cards/    # Statistics cards
│   │   └── time_series/    # Time series graphs
│   ├── context/            # React Context providers
│   │   └── AuthContext.jsx # Authentication state management
│   ├── global_styles/      # Global CSS styles
│   │   ├── App.css
│   │   ├── global_tokens.css
│   │   └── index.css
│   ├── hooks/              # Custom React hooks
│   │   ├── useProfile.js
│   │   ├── useSpeedTest.js
│   │   └── useSpeedTestHistory.js
│   ├── pages/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   │   ├── forms/      # Login and signup forms
│   │   │   └── AuthLayout.jsx
│   │   ├── auth_required/  # Auth required page
│   │   ├── history/        # Test history page
│   │   ├── home/           # Home/dashboard page
│   │   ├── manage_account/ # Account management page
│   │   └── not_found/      # 404 page
│   ├── services/           # API service layer
│   │   ├── analyticsService.js
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── errorUtils.js
│   │   ├── networkService.js
│   │   ├── pingService.js
│   │   ├── profileService.js
│   │   ├── speedService.js
│   │   └── supabase.js
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
   VITE_API_BASE_URL=http://localhost:5000
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

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
