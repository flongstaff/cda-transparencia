export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Extract the path and remove the /api prefix
  const apiPath = url.pathname.replace('/api', '');
  
  // For now, we'll just return a placeholder response
  // In a real implementation, this would proxy to the backend
  return new Response(JSON.stringify({
    message: "API proxy endpoint",
    path: apiPath,
    timestamp: new Date().toISOString()
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
}