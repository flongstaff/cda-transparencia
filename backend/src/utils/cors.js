/**
 * CORS utilities for Cloudflare Workers and Express
 */

// CORS configuration
const CORS_CONFIG = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept',
    'X-API-Key',
    'X-CSRF-Token',
    'X-Forwarded-For',
    'X-Original-Host'
  ],
  exposedHeaders: [],
  credentials: false,
  maxAge: 86400 // 24 hours
};

/**
 * Handle CORS preflight requests
 */
export function handleCORS(request) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': CORS_CONFIG.origin,
    'Access-Control-Allow-Methods': CORS_CONFIG.methods.join(', '),
    'Access-Control-Allow-Headers': CORS_CONFIG.allowedHeaders.join(', '),
    'Access-Control-Max-Age': CORS_CONFIG.maxAge.toString(),
    'Access-Control-Allow-Credentials': 'true'
  });

  return new Response(null, {
    status: 204,
    headers
  });
}

/**
 * Create a JSON response with CORS headers
 */
export function createResponse({ status = 200, data = null, headers = {} }) {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': CORS_CONFIG.origin,
    'Access-Control-Allow-Methods': CORS_CONFIG.methods.join(', '),
    'Access-Control-Allow-Headers': CORS_CONFIG.allowedHeaders.join(', '),
    'Access-Control-Allow-Credentials': 'true',
    ...headers
  });

  return new Response(JSON.stringify(data), {
    status,
    headers: responseHeaders
  });
}

/**
 * Create an error response
 */
export function createErrorResponse(error, status = 500) {
  return createResponse({
    status,
    data: {
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Express CORS middleware
 */
export function expressCORSMiddleware(req, res, next) {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', CORS_CONFIG.origin);
  res.header('Access-Control-Allow-Methods', CORS_CONFIG.methods.join(', '));
  res.header('Access-Control-Allow-Headers', CORS_CONFIG.allowedHeaders.join(', '));
  res.header('Access-Control-Max-Age', CORS_CONFIG.maxAge.toString());
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  next();
}

// Export CORS configuration
export { CORS_CONFIG };
