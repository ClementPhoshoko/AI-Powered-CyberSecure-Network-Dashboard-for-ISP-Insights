const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { supabase } = require('./config/db');
require('dotenv').config({ path: './src/.env' });

const app = express();
const PORT = process.env.PORT || 5000;

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

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📚 Swagger documentation available at http://localhost:${PORT}/api-docs`);
    console.log('🔗 Database configuration loaded');
});

/*
 * Server.js Notes:
 * - Entry point for the Express.js backend API
 * - Sets up middleware: security (helmet), CORS, compression, logging (morgan)
 * - Configures Swagger for interactive API documentation at /api-docs
 * - Includes health check endpoints to verify server and DB status
 * - Will load route handlers from ./src/routes/ once they are added
 * - Uses Supabase SDK for database interactions with RLS policies
 */
