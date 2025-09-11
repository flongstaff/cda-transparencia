addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Rewrite the URL to point to the backend API
  url.hostname = 'api.cda-transparencia.org'; 
  url.port = '443'; 
  url.protocol = 'https:';
  url.pathname = url.pathname.replace('/api', ''); // Remove /api prefix if your backend doesn't use it

  const newRequest = new Request(url.toString(), request);

  return fetch(newRequest);
}