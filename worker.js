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
function handleCors(request) {
  const origin = request.headers.get('Origin') || '*';
  const corsHeaders = {
    ...CORS_HEADERS,
    'Access-Control-Allow-Origin': origin
  };
  
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

// Add CORS headers to response
function addCorsHeaders(response, request) {
  const headers = new Headers(response.headers);
  const origin = request.headers.get('Origin') || '*';
  
  // Add CORS headers
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', CORS_HEADERS['Access-Control-Allow-Methods']);
  headers.set('Access-Control-Allow-Headers', CORS_HEADERS['Access-Control-Allow-Headers']);
  headers.set('Access-Control-Max-Age', CORS_HEADERS['Access-Control-Max-Age']);
  headers.set('Access-Control-Allow-Credentials', CORS_HEADERS['Access-Control-Allow-Credentials']);
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

// Fetch data from GitHub repository
async function fetchFromGitHub(path) {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // For external data, fetch from GitHub raw URL
  if (cleanPath.startsWith('data/external/')) {
    const dataUrl = `https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/${cleanPath}`;
    
    console.log(`[Worker] Fetching external data from GitHub raw: ${dataUrl}`);
    
    // Fetch with proper headers
    const response = await fetch(dataUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Carmen-de-Areco-Transparency-Portal/1.0 (Cloudflare Workers)'
      }
    });
    
    console.log(`[Worker] GitHub raw response status: ${response.status}`);
    
    return response;
  }
  
  // For chart data, fetch from GitHub raw URL
  if (cleanPath.startsWith('data/charts/')) {
    const dataUrl = `https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/frontend/public/${cleanPath}`;
    
    console.log(`[Worker] Fetching chart data from GitHub raw: ${dataUrl}`);
    
    // Fetch with proper headers
    const response = await fetch(dataUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv',
        'User-Agent': 'Carmen-de-Areco-Transparency-Portal/1.0 (Cloudflare Workers)'
      }
    });
    
    console.log(`[Worker] GitHub raw response status: ${response.status}`);
    
    return response;
  }
  
  // For consolidated data, fetch from GitHub raw URL
  if (cleanPath.startsWith('data/consolidated/') || cleanPath.startsWith('data/')) {
    const dataUrl = `https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/frontend/public/${cleanPath}`;
    
    console.log(`[Worker] Fetching data from GitHub raw: ${dataUrl}`);
    
    // Fetch with proper headers
    const response = await fetch(dataUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Carmen-de-Areco-Transparency-Portal/1.0 (Cloudflare Workers)'
      }
    });
    
    console.log(`[Worker] GitHub raw response status: ${response.status}`);
    
    return response;
  }
  
  // For other paths, construct the full GitHub Pages URL
  const dataUrl = `https://flongstaff.github.io/cda-transparencia/${cleanPath}`;
  
  console.log(`[Worker] Fetching from GitHub Pages: ${dataUrl}`);
  
  // Fetch with proper headers
  const response = await fetch(dataUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Carmen-de-Areco-Transparency-Portal/1.0 (Cloudflare Workers)'
    }
  });
  
  console.log(`[Worker] GitHub Pages response status: ${response.status}`);
  
  return response;
}

// Main fetch handler
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCors(request);
    }

    try {
      // Parse the request URL
      const url = new URL(request.url);
      
      // Handle API endpoints by fetching from GitHub
      if (url.pathname.startsWith('/api/')) {
        // Map API endpoints to GitHub paths
        let githubPath = url.pathname.replace('/api/', '/data/');
        
        // Special handling for external data endpoints
        if (url.pathname === '/api/external/carmen-de-areco') {
          // For this endpoint, we return the consolidated Carmen de Areco official data
          githubPath = '/data/carmen_official.json';
        }
        
        // Special handling for chart data endpoints
        if (url.pathname.startsWith('/api/charts/')) {
          // Map chart data endpoints to the correct chart data path
          githubPath = url.pathname.replace('/api/charts/', '/data/charts/');
        }
        
        // Special handling for consolidated data endpoints
        if (url.pathname.startsWith('/api/external/consolidated/')) {
          // Map to the correct consolidated data path
          githubPath = url.pathname.replace('/api/external/', '/data/');
        }
        
        // Add appropriate file extension based on path
        if (githubPath.startsWith('/data/charts/') && !githubPath.endsWith('.csv')) {
          githubPath += '.csv';
        } else if (!githubPath.endsWith('.json') && !githubPath.endsWith('/')) {
          githubPath += '.json';
        }
        
        // Fetch from GitHub
        const response = await fetchFromGitHub(githubPath);
        
        // Add CORS headers to response
        return addCorsHeaders(response, request);
      }
      
      // Special handling for /health endpoint
      if (url.pathname === '/health') {
        const response = new Response(
          JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'Carmen de Areco Transparency API Proxy',
            version: '1.0.0'
          }),
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        return addCorsHeaders(response, request);
      }
      
      // For all other paths, return 404
      const response = new Response('Not Found', { 
        status: 404,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      return addCorsHeaders(response, request);
      
    } catch (error) {
      console.error('Worker error:', error);
      
      const response = new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error.message
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return addCorsHeaders(response, request);
    }
  }
};