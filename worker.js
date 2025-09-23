addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // For local development, forward to local backend
  // In production, this should point to your deployed backend server
  url.hostname = 'localhost'; 
  url.port = '3001'; 
  url.protocol = 'http:';
  url.pathname = url.pathname.replace('/api', ''); // Remove /api prefix if your backend doesn't use it

  const newRequest = new Request(url.toString(), request);

  return fetch(newRequest);
}