const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const fs = require('fs');
require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : './src/.env'
});
const { supabase } = require('./config/db');
const profilesRouter = require('./routes/profiles');
const subscribersRouter = require('./routes/subscribers');
const devAuthRouter = require('./routes/devAuth');
const pingRouter = require('./routes/ping');
const speedRouter = require('./routes/speed');
const networkRouter = require('./routes/network');
const analyticsRouter = require('./routes/analytics');
const systemMetricsRouter = require('./routes/systemMetrics');
const portRiskRouter = require('./routes/portRisk');
const otpRouter = require('./routes/otp');
const turnstileRouter = require('./routes/turnstile');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

function shouldCompress(req, res) {
  // Speed-test and ping endpoints must stay uncompressed to avoid skewed
  // measurements and gzip backpressure/listener buildup on large streamed
  // binary payloads.
  if (
    req.path === '/api/speed/download' ||
    req.path === '/api/speed/upload' ||
    req.path === '/api/ping/health' ||
    req.path.startsWith('/speedtest/')
  ) {
    return false;
  }

  return compression.filter(req, res);
}

// Trust proxy headers (for X-Forwarded-For to get real client IP)
app.set('trust proxy', '127.0.0.1'); // Trust only localhost Nginx

// Security headers — always active
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"]
    }
  }
}));

// CORS — restrict to known origins
const allowedOrigins = NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Anonymous-Id'],
}));

app.use(compression({ filter: shouldCompress })); // Compress responses except speed-test endpoints
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined')); // Logging

// Generate pre-randomised static test files for CDN-backed speed tests.
// Cloudflare caches these at the edge so download traffic bypasses the VPS.
// Files are generated synchronously at startup so they exist before any
// requests arrive (avoids HTTP 416 Range-Not-Satisfiable on partial files).
const SPEEDTEST_STATIC_DIR = path.join(__dirname, '..', 'public', 'speedtest', 'download');
fs.mkdirSync(SPEEDTEST_STATIC_DIR, { recursive: true });
try {
  const { generateAll } = require('../scripts/generate-test-files');
  generateAll();
} catch (err) {
  console.error('[server] Test file generation failed — server will start without CDN files:', err.message);
}
// Serve cached test files with headers that tell Cloudflare to cache
app.use('/speedtest/download', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=86400, no-transform');
  res.setHeader('CDN-Cache-Control', 'public, max-age=86400');
  next();
}, express.static(SPEEDTEST_STATIC_DIR, {
  acceptRanges: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.bin')) {
      res.setHeader('Content-Type', 'application/octet-stream');
    }
  }
}));

// Rate limiting — auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many attempts, try again later' },
});

// Rate limiting — global API (abuse protection)
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 100,                  // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests. Sign in for higher limits and full access.' },
});

// Rate limiting — speedtest submission endpoints (abuse protection)
// Anonymous: 20 requests per 15 minutes (~4 full test runs)
// Authenticated (has Bearer token): unlimited
const speedtestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const auth = req.headers.authorization;
    return !!(auth && auth.startsWith('Bearer '));
  },
  keyGenerator: (req) => req.anonymousId || ipKeyGenerator(req),
  message: { status: 'error', message: 'Speedtest limit reached. Sign in to run unlimited tests and access security insights.' },
});

app.use('/dev/auth', authLimiter);
app.use('/api/speed/tests', speedtestLimiter);
app.use('/api/ping/tests', speedtestLimiter);
app.use('/api/network/score', speedtestLimiter);
app.use('/api/network/summary', speedtestLimiter);
app.use('/api', globalLimiter);

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AI-Powered AkovoLabs Speedtest API',
            version: '1.0.0',
            description: 'Comprehensive API for the AkovoLabs Speedtest platform — internet speed testing, port security risk assessments, AI-generated network performance summaries, network scoring, and ISP analytics. Built for the ISP Insights Dashboard.',
        },
        servers: [
            {
                url: '/', // Relative path - works with any host/protocol
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your Supabase JWT token here'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  // Force Swagger UI to use relative paths and current protocol
  swaggerOptions: {
    url: '', // Use the spec we're serving, no external URL
    tryItOutEnabled: true,
    persistAuthorization: true
  },
  // Explicitly set Swagger UI to load assets relative
  customCss: '',
  customJs: '',
  customCssUrl: '',
  customSiteTitle: 'ISP Speedtest API Docs'
}));

// Health Check Routes
app.get('/', (req, res) => {
    res.send('AI-Powered AkovoLabs Speedtest API is running...');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Test Database Connection
app.get('/api/health/db', async (req, res) => {
    try {
        // Note: This query will fail until you run your phase_one_schema.sql in Supabase!
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Database connection failed'
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Database connected successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    }
});

// Mount Routes
if (NODE_ENV === 'development') {
    console.warn('⚠️ Development mode: Dev Auth endpoints enabled!');
    app.use('/dev/auth', devAuthRouter);
}
app.use('/api/profile', profilesRouter);
app.use('/api/subscriber', subscribersRouter);
app.use('/api/ping', pingRouter);
app.use('/api/speed', speedRouter);
app.use('/api/network', networkRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/system', systemMetricsRouter);
app.use('/api/port-risk', portRiskRouter);
app.use('/api/otp', otpRouter);
app.use('/api/turnstile', turnstileRouter);

// Error Handler Middleware (must be last middleware)
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    console.log('Database configuration loaded');
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received — shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received — shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

/*
 * Server.js Notes:
 * - Entry point for the Express.js backend API
 * - Sets up middleware: security (helmet), CORS, compression, logging (morgan)
 * - Configures Swagger for interactive API documentation at /api-docs (with JWT auth support)
 * - Includes health check endpoints to verify server and DB status
 * - Mounts route handlers from ./src/routes/
 * - Uses Supabase SDK for database interactions with RLS policies
 * - Uses centralized errorHandler middleware for consistent error responses
 */
