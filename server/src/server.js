const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { supabase } = require('./config/db');
const profilesRouter = require('./routes/profiles');
const devAuthRouter = require('./routes/devAuth');
const pingRouter = require('./routes/ping');
const speedRouter = require('./routes/speed');
const networkRouter = require('./routes/network');
const analyticsRouter = require('./routes/analytics');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config({ path: './src/.env' });

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(compression()); // Compress responses
app.use(express.json({ limit: '50mb' }));
app.use(morgan('combined')); // Logging

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AI-Powered CyberSecure Network Dashboard API',
            version: '1.0.0',
            description: 'API documentation for the ISP Insights Dashboard',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check Route
app.get('/', (req, res) => {
    res.send('AI-Powered CyberSecure Network Dashboard API is running...');
});

// Test Database Connection
app.get('/api/health/db', async (req, res) => {
    try {
        // Note: This query will fail until you run your phase_one_schema.sql in Supabase!
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Database connection failed',
                error: error.message
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Database connected successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
});

// Mount Routes
if (NODE_ENV === 'development') {
    console.warn('⚠️ Development mode: Dev Auth endpoints enabled!');
    app.use('/dev/auth', devAuthRouter);
}
app.use('/api/profile', profilesRouter);
app.use('/api/ping', pingRouter);
app.use('/api/speed', speedRouter);
app.use('/api/network', networkRouter);
app.use('/api/analytics', analyticsRouter);

// Error Handler Middleware (must be last middleware)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    console.log('Database configuration loaded');
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
