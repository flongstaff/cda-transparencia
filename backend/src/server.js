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
          // Handle static files for consolidated data and other static assets
          if (url.pathname.startsWith('/data/')) {
            return handleStaticFile(request, url.pathname);
          }
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
 * Handle static file serving for Cloudflare Workers
 */
async function handleStaticFile(request, pathname) {
  // In Cloudflare Workers, static files should be served through the Workers assets
  // This function is a placeholder since in actual deployment, static files would be handled by Cloudflare's CDN
  // For the purpose of this application, static files are expected to be served from a different origin (GitHub Pages, CDN, etc.)
  // This function will return a 404 in the Workers environment as static files aren't handled here
  return new Response(`Static files are not served through the API in Cloudflare Workers. File: ${pathname}`, {
    status: 404,
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    }
  });
}

/**
 * Express server for local development - async initialization
 */
async function initializeExpressServer() {
  const express = (await import('express')).default;
  const cors = (await import('cors')).default;
  const helmet = (await import('helmet')).default;
  const dotenv = (await import('dotenv')).default;
  const path = (await import('path')).default;
  const { fileURLToPath } = await import('url');
  const rateLimit = (await import('express-rate-limit')).default;

  // Load environment variables
  dotenv.config();

  // Get the directory name for ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Create Express app
  const app = express();
  const PORT = process.env.PORT || 3001;

  console.log('🚀 Initializing Carmen de Areco Comprehensive Transparency API...');

  // Enhanced CORS middleware to handle all routes
  const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Origin'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD']
  };

  // Apply helmet for security
  app.use(helmet());

  // Apply CORS middleware for all routes
  app.use(cors(corsOptions));

  // Handle preflight requests for all routes
  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  });

  app.use(express.json({ limit: '10mb' }));

  // Serve static files from the data directory with CORS headers
  app.use('/data', express.static(path.join(__dirname, '../../data'), {
    maxAge: '1d', // Cache for 1 day
    etag: true,   // Enable ETag
    setHeaders: (res, filepath) => {
      res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Content-Type', filepath.endsWith('.json') ? 'application/json' : 'text/plain');
    }
  }));

  // Also serve external data files from the frontend public directory
  app.use('/data/external', express.static(path.join(__dirname, '../../frontend/public/data/external'), {
    maxAge: '1d', // Cache for 1 day
    etag: true,   // Enable ETag
    setHeaders: (res, filepath) => {
      res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Content-Type', filepath.endsWith('.json') ? 'application/json' : 'text/plain');
    }
  }));

  // Rate limiting - Increased for development
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

  // For local development, import the external data service
  let localExternalDataService = null;
  try {
    const externalDataModule = await import('./services/externalDataService.js');
    localExternalDataService = externalDataModule.externalDataService;
  } catch (error) {
    console.error('Failed to load external data service for local development:', error.message);
  }

  // Express routes for local development
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Carmen de Areco Transparency API (Local Development)',
      version: '2.0.0'
    });
  });

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

  // For local development, import the cache module
  let localCacheManager = null;
  try {
    const cacheModule = await import('./utils/cache.js');
    localCacheManager = cacheModule.cacheManager;
  } catch (error) {
    console.error('Failed to load cache manager for local development:', error.message);
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

  return app;
}

// Initialize Express server only if not in Cloudflare Workers environment
let app;
if (!isCloudflareWorkers) {
  initializeExpressServer().then(server => {
    app = server;
  }).catch(console.error);
}

export { app };