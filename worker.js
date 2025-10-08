/**
 * Cloudflare Worker for Carmen de Areco Transparency Portal
 * Properly handles CORS for all API requests
 */

// CORS headers configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, X-API-Key',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Access-Control-Allow-Credentials': 'true'
};

// Handle CORS preflight requests
function handleCors() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

// Add CORS headers to response
function addCorsHeaders(response) {
  const headers = new Headers(response.headers);
  
  // Add CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

// Main fetch handler
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCors();
    }

    try {
      // Proxy requests to the backend API
      const url = new URL(request.url);
      
      // If requesting API endpoints, proxy to backend
      if (url.pathname.startsWith('/api/')) {
        // Construct backend URL - using the Fly.io backend
        const backendUrl = `https://cda-transparency-api.fly.dev${url.pathname}${url.search}`;
        
        // Create new request with proper headers
        const newRequest = new Request(backendUrl, {
          method: request.method,
          headers: {
            ...Object.fromEntries(request.headers),
            'X-Forwarded-For': request.headers.get('cf-connecting-ip') || '',
            'X-Original-Host': url.host,
            'Host': 'cda-transparency-api.fly.dev'
          },
          body: ['GET', 'HEAD'].includes(request.method) ? null : await request.blob(),
        });

        // Fetch from backend
        const response = await fetch(newRequest);
        
        // Add CORS headers to response
        return addCorsHeaders(response);
      }
      
      // Special handling for /health endpoint
      if (url.pathname === '/health') {
        return addCorsHeaders(new Response(
          JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'Carmen de Areco Transparency API Proxy',
            version: '1.0.0'
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS
            }
          }
        ));
      }
      
      // For all other paths, return 404
      return addCorsHeaders(new Response('Not Found', { 
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
          ...CORS_HEADERS
        }
      }));
      
    } catch (error) {
      console.error('Worker error:', error);
      
      return addCorsHeaders(new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error.message
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
          }
        }
      ));
    }
  }
};