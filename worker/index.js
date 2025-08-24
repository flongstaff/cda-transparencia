/**
 * Cloudflare Worker for Carmen de Areco Transparency Portal
 * Serves static React SPA with proper routing, caching, and security headers
 * Domain: cda-transparencia.org
 */

// Security headers for all responses
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https:",
    "connect-src 'self' https://api.cda-transparencia.org https://cda-transparencia.org",
    "frame-ancestors 'none'",
    "base-uri 'self'"
  ].join('; ')
};

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.avif': 'image/avif'
};

// SPA routes that should serve index.html
const SPA_ROUTES = [
  '/',
  '/about',
  '/budget',
  '/spending',
  '/revenue',
  '/contracts',
  '/salaries',
  '/database',
  '/reports',
  '/contact',
  '/whistleblower'
];

/**
 * Get MIME type from file extension
 */
function getMimeType(url) {
  const pathname = url.pathname || '';
  const ext = pathname.split('.').pop()?.toLowerCase();
  return ext ? MIME_TYPES[`.${ext}`] || 'application/octet-stream' : 'text/html';
}

/**
 * Add security and caching headers
 */
function addHeaders(response, url, isHTML = false) {
  const headers = new Headers(response.headers);
  
  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });

  // Cache headers based on file type
  const pathname = url.pathname || '';
  
  if (isHTML || SPA_ROUTES.includes(pathname) || pathname.endsWith('.html')) {
    // Don't cache HTML files - always serve fresh
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  } else if (pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/)) {
    // Cache JS/CSS/fonts for 1 year (immutable assets with hashes)
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (pathname.match(/\.(png|jpg|jpeg|gif|ico|svg|webp|avif)$/)) {
    // Cache images for 1 month
    headers.set('Cache-Control', 'public, max-age=2592000');
  } else {
    // Default caching for other assets
    headers.set('Cache-Control', 'public, max-age=86400');
  }

  // Set correct content type
  headers.set('Content-Type', getMimeType(url));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

/**
 * Handle API requests (proxy to backend)
 */
async function handleAPI(request, url) {
  // For now, we'll return a placeholder response
  // In production, you would proxy this to your actual backend
  const response = new Response(JSON.stringify({
    message: "API endpoint - connect to your backend here",
    path: url.pathname,
    method: request.method,
    timestamp: new Date().toISOString(),
    environment: globalThis.ENVIRONMENT || 'production'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...SECURITY_HEADERS
    }
  });
  
  return response;
}

/**
 * Handle health check
 */
async function handleHealth() {
  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'Carmen de Areco Transparency Portal',
    version: '1.0.0',
    domain: 'cda-transparencia.org',
    timestamp: new Date().toISOString(),
    environment: globalThis.ENVIRONMENT || 'production'
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...SECURITY_HEADERS
    }
  });
}

/**
 * Get fallback HTML for SPA routing
 */
function getDefaultHTML() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal de Transparencia - Carmen de Areco</title>
    <meta name="description" content="Portal oficial de transparencia de la Municipalidad de Carmen de Areco">
    <meta name="keywords" content="transparencia, gobierno, Carmen de Areco, presupuesto, gastos públicos">
    <link rel="icon" href="/favicon.ico">
    <style>
      body { 
        font-family: system-ui, -apple-system, sans-serif; 
        margin: 0; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .container { 
        text-align: center; 
        padding: 2rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 1rem;
        backdrop-filter: blur(10px);
      }
      h1 { font-size: 2.5rem; margin: 0; }
      h2 { font-size: 1.5rem; opacity: 0.9; margin: 0.5rem 0; }
      p { opacity: 0.8; margin: 1rem 0; }
      .status { 
        background: #10b981; 
        padding: 0.5rem 1rem; 
        border-radius: 2rem; 
        display: inline-block; 
        margin-top: 1rem;
        font-weight: bold;
      }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏛️ Portal de Transparencia</h1>
        <h2>Carmen de Areco</h2>
        <p>Sistema de transparencia gubernamental</p>
        <div class="status">✅ Servicio Activo</div>
        <p><small>Cloudflare Workers • cda-transparencia.org</small></p>
    </div>
    <script>
      console.log('🏛️ Portal de Transparencia - Carmen de Areco');
      console.log('Domain: cda-transparencia.org');
      console.log('Powered by Cloudflare Workers');
    </script>
</body>
</html>`;
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // Health check endpoint
      if (url.pathname === '/health' || url.pathname === '/api/health') {
        return handleHealth();
      }

      // API routes (proxy to backend in production)
      if (url.pathname.startsWith('/api/')) {
        return handleAPI(request, url);
      }

      // Handle static assets and SPA routing
      let assetPath = url.pathname;
      let isHTML = false;
      
      // For SPA routing, serve index.html for app routes
      if (SPA_ROUTES.includes(assetPath) || (!assetPath.includes('.') && assetPath !== '/')) {
        assetPath = '/index.html';
        isHTML = true;
      }
      
      let response;
      
      try {
        // Try to get the asset from static content (when properly deployed)
        if (env.ASSETS) {
          const assetRequest = new Request(new URL(assetPath, request.url), request);
          response = await env.ASSETS.fetch(assetRequest);
          
          if (response.status === 404 && isHTML) {
            // Fallback to default HTML for SPA routes
            response = new Response(getDefaultHTML(), {
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          }
        } else {
          // Fallback when ASSETS binding is not available
          if (isHTML || assetPath === '/index.html') {
            response = new Response(getDefaultHTML(), {
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          } else {
            response = new Response('Asset not found', { status: 404 });
          }
        }
      } catch (error) {
        console.error('Asset fetch error:', error);
        
        // Fallback for SPA routes
        if (isHTML || assetPath === '/index.html') {
          response = new Response(getDefaultHTML(), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        } else {
          response = new Response('Not Found', { status: 404 });
        }
      }

      // Add headers and return response
      return addHeaders(response, url, isHTML);

    } catch (error) {
      // Error handling
      console.error('Worker error:', error);
      
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString(),
        domain: 'cda-transparencia.org'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...SECURITY_HEADERS
        }
      });
    }
  }
};