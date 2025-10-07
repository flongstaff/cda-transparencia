/**
 * CARMEN DE ARECO TRANSPARENCY PORTAL - UNIFIED API SERVER
 *
 * Unified server that works for both local development and Cloudflare Workers
 * Automatically detects environment and uses appropriate runtime
 */

// Check if running in Cloudflare Workers environment
const isCloudflareWorkers = typeof WebSocketPair !== 'undefined' || (globalThis && globalThis.constructor && globalThis.constructor.name === 'DedicatedWorkerGlobalScope');

// Global variables for modules
let handleCORS, createResponse, cacheManager, rateLimiter, externalDataService;

if (isCloudflareWorkers) {
  // Dynamic imports for Cloudflare Workers are handled in the fetch handler
} else {
  // For local development, we'll set up the Express server later
  // Initialize variables to null for Express environment
  handleCORS = null;
  createResponse = null;
  cacheManager = null;
  rateLimiter = null;
  externalDataService = null;
}

/**
 * Main fetch handler for Cloudflare Workers
 */
export default {
  async fetch(request, env, ctx) {
    if (!isCloudflareWorkers) {
      throw new Error('This should only be called in Cloudflare Workers environment');
    }

    // Ensure modules are loaded before using them
    if (!handleCORS || !createResponse || !cacheManager || !rateLimiter || !externalDataService) {
      const modules = await Promise.all([
        import('./utils/cors.js'),
        import('./utils/cache.js'),
        import('./utils/rateLimit.js'),
        import('./services/externalDataService.js')
      ]);

      const { handleCORS: corsHandler, createResponse: responseCreator } = modules[0];
      const { cacheManager: cacheMgr } = modules[1];
      const { rateLimiter: rateLimiterMgr } = modules[2];
      const { externalDataService: extDataService } = modules[3];

      handleCORS = corsHandler;
      createResponse = responseCreator;
      cacheManager = cacheMgr;
      rateLimiter = rateLimiterMgr;
      externalDataService = extDataService;
    }

    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }

    // Rate limiting
    const rateLimitResult = await rateLimiter.check(request);
    if (!rateLimitResult.allowed) {
      return createResponse({
        status: 429,
        data: { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter }
      });
    }

    try {
      // Route handling
      switch (url.pathname) {
        case '/health':
          return handleHealthCheck();

        case '/api/external/all-external-data':
          return handleAllExternalData(request);

        case '/api/external/carmen-de-areco':
          return handleCarmenDeArecoData(request);

        case '/api/external/buenos-aires':
          return handleBuenosAiresData(request);

        case '/api/external/national':
          return handleNationalData(request);

        case '/api/cache/clear':
          if (request.method === 'DELETE') {
            return handleCacheClear();
          }
          break;

        case '/api/cache/stats':
          return handleCacheStats();

        default:
          return createResponse({
            status: 404,
            data: { error: 'Endpoint not found', path: url.pathname }
          });
      }

      return createResponse({
        status: 404,
        data: { error: 'Endpoint not found' }
      });

    } catch (error) {
      console.error('Server error:', error);
      return createResponse({
        status: 500,
        data: {
          error: 'Internal server error',
          message: env.NODE_ENV === 'development' ? error.message : 'Contact administrator'
        }
      });
    }
  }
};

/**
 * Health check endpoint
 */
async function handleHealthCheck() {
  if (!cacheManager) {
    const { cacheManager: loadedCacheManager } = await import('./utils/cache.js');
    cacheManager = loadedCacheManager;
  }

  const cacheStats = cacheManager.getStats();

  return createResponse({
    status: 200,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Carmen de Areco Transparency API (Cloudflare Workers)',
      cache_stats: cacheStats,
      version: '2.0.0'
    }
  });
}

/**
 * Handle all external data aggregation
 */
async function handleAllExternalData(request) {
  if (!externalDataService) {
    const { externalDataService: loadedExternalDataService } = await import('./services/externalDataService.js');
    externalDataService = loadedExternalDataService;
  }

  try {
    const data = await externalDataService.loadAllExternalData();

    return createResponse({
      status: 200,
      data: data
    });
  } catch (error) {
    console.error('Error loading all external data:', error);
    return createResponse({
      status: 500,
      data: { error: 'Failed to load external data', message: error.message }
    });
  }
}

/**
 * Handle Carmen de Areco specific data
 */
async function handleCarmenDeArecoData(request) {
  if (!externalDataService) {
    const { externalDataService: loadedExternalDataService } = await import('./services/externalDataService.js');
    externalDataService = loadedExternalDataService;
  }

  try {
    const data = await externalDataService.getCarmenDeArecoData();

    return createResponse({
      status: 200,
      data: data
    });
  } catch (error) {
    console.error('Error loading Carmen de Areco data:', error);
    return createResponse({
      status: 500,
      data: { error: 'Failed to load Carmen de Areco data', message: error.message }
    });
  }
}

/**
 * Handle Buenos Aires Province data
 */
async function handleBuenosAiresData(request) {
  if (!externalDataService) {
    const { externalDataService: loadedExternalDataService } = await import('./services/externalDataService.js');
    externalDataService = loadedExternalDataService;
  }

  try {
    const data = await externalDataService.getBuenosAiresTransparencyData();

    return createResponse({
      status: 200,
      data: data
    });
  } catch (error) {
    console.error('Error loading Buenos Aires data:', error);
    return createResponse({
      status: 500,
      data: { error: 'Failed to load Buenos Aires data', message: error.message }
    });
  }
}

/**
 * Handle national data
 */
async function handleNationalData(request) {
  if (!externalDataService) {
    const { externalDataService: loadedExternalDataService } = await import('./services/externalDataService.js');
    externalDataService = loadedExternalDataService;
  }

  try {
    const data = await externalDataService.getNationalBudgetData();

    return createResponse({
      status: 200,
      data: data
    });
  } catch (error) {
    console.error('Error loading national data:', error);
    return createResponse({
      status: 500,
      data: { error: 'Failed to load national data', message: error.message }
    });
  }
}

/**
 * Handle cache clear
 */
async function handleCacheClear() {
  if (!cacheManager) {
    const { cacheManager: loadedCacheManager } = await import('./utils/cache.js');
    cacheManager = loadedCacheManager;
  }

  cacheManager.clear();

  return createResponse({
    status: 200,
    data: { message: 'Cache cleared successfully' }
  });
}

/**
 * Handle cache statistics
 */
async function handleCacheStats() {
  if (!cacheManager) {
    const { cacheManager: loadedCacheManager } = await import('./utils/cache.js');
    cacheManager = loadedCacheManager;
  }

  const stats = cacheManager.getStats();

  return createResponse({
    status: 200,
    data: stats
  });
}

/**
 * Express server for local development
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Initializing Carmen de Areco Comprehensive Transparency API...');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting - Increased for development
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: {
    success: false,
    error: {
      type: 'RateLimitError',
      message: 'Too many requests',
      details: 'Rate limit exceeded, please try again later.',
      timestamp: new Date().toISOString()
    }
  }
});
app.use(limiter);

// Express routes for local development
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Carmen de Areco Transparency API (Local Development)',
    version: '2.0.0'
  });
});

// For local development, import the external data service
let localExternalDataService = null;
if (!isCloudflareWorkers) {
  try {
    const externalDataModule = require('./services/externalDataService.js');
    localExternalDataService = externalDataModule.externalDataService;
  } catch (error) {
    console.error('Failed to load external data service for local development:', error.message);
  }
}

app.get('/api/external/all-external-data', async (req, res) => {
  try {
    if (!localExternalDataService) {
      return res.status(500).json({ error: 'External data service not available' });
    }
    const data = await localExternalDataService.loadAllExternalData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load external data', message: error.message });
  }
});

app.get('/api/external/carmen-de-areco', async (req, res) => {
  try {
    if (!localExternalDataService) {
      return res.status(500).json({ error: 'External data service not available' });
    }
    const data = await localExternalDataService.getCarmenDeArecoData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load Carmen de Areco data', message: error.message });
  }
});

app.get('/api/external/buenos-aires', async (req, res) => {
  try {
    if (!localExternalDataService) {
      return res.status(500).json({ error: 'External data service not available' });
    }
    const data = await localExternalDataService.getBuenosAiresTransparencyData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load Buenos Aires data', message: error.message });
  }
});

app.get('/api/external/national', async (req, res) => {
  try {
    if (!localExternalDataService) {
      return res.status(500).json({ error: 'External data service not available' });
    }
    const data = await localExternalDataService.getNationalBudgetData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load national data', message: error.message });
  }
});

let localCacheManager = null;
if (!isCloudflareWorkers) {
  try {
    const cacheModule = require('./utils/cache.js');
    localCacheManager = cacheModule.cacheManager;
  } catch (error) {
    console.error('Failed to load cache manager for local development:', error.message);
  }
}

// Cache management endpoints for local development
app.delete('/api/cache/clear', (req, res) => {
  if (!localCacheManager) {
    return res.status(500).json({ error: 'Cache manager not available' });
  }
  localCacheManager.clear();
  res.json({ message: 'Cache cleared successfully' });
});

app.get('/api/cache/stats', (req, res) => {
  if (!localCacheManager) {
    return res.status(500).json({ error: 'Cache manager not available' });
  }
  const stats = localCacheManager.getStats();
  res.json(stats);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Contact administrator'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server only if not in Cloudflare Workers environment
if (!isCloudflareWorkers) {
  app.listen(PORT, () => {
    console.log(`🚀 Carmen de Areco Comprehensive Transparency API running on port ${PORT}`);
    console.log(`📊 Using comprehensive transparency system`);
    console.log(`🔗 API available at http://localhost:${PORT}/api/external/`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    console.log(`🏛️  Citizen portal: Full municipal transparency with document access`);
  });
}

module.exports = app;
