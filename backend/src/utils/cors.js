/**
 * CORS utilities for Cloudflare Workers
 */

/**
 * Handle CORS preflight requests
 */
export function handleCORS(request) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
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
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
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
