const express = require('express');
const { testUnifiedService } = require('./unifiedServiceTest');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// Test endpoint
app.get('/test-unified-service', async (req, res) => {
    try {
        await testUnifiedService();
        res.json({ 
            success: true, 
            message: 'Unified service test completed successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        service: 'unified-transparency-test-server',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Unified Transparency Test Server running on port ${PORT}`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/test-unified-service`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});