// src/cf-worker/index.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle API requests by forwarding to your backend
    if (url.pathname.startsWith('/api/')) {
      // In a real implementation, you would forward to your actual backend
      // For now, we'll return a simple response
      return new Response(JSON.stringify({ 
        message: "API request received",
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Serve static assets from Workers KV or redirect to your frontend
    return new Response("Carmen de Areco Transparency Portal - Cloudflare Worker", {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};