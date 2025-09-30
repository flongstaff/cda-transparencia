const express = require('express');
const request = require('supertest');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes without importing the main server that starts listening
const routes = require('../routes');

// Create a separate app instance just for testing
const createTestApp = () => {
    const app = express();
    
    // Middleware (same as the main server)
    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000,
        message: { error: 'Too many requests, please try again later.' }
    });
    app.use(limiter);
    
    // Use the same routes as the main server
    app.use('/api', routes);
    
    // 404 handler (same as the main server)
    app.use((req, res) => {
        res.status(404).json({ error: 'Endpoint not found' });
    });
    
    return app;
};

describe('API Server Endpoints', () => {
    let app;

    beforeAll(() => {
        app = createTestApp();
    });

    test('should handle 404 for invalid routes', async () => {
        const response = await request(app).get('/invalid-endpoint');
        
        expect(response.status).toBe(404);
        expect(response.body).toBeDefined();
        expect(response.body.error).toBe('Endpoint not found');
    });

    test('should respond to API health check', async () => {
        const response = await request(app).get('/api/health');
        
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.status).toBe('success');
        expect(response.body.message).toContain('Carmen de Areco Comprehensive Transparency API');
        expect(response.body.services).toBeDefined();
    });
});