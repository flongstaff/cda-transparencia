addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Serve static files from the dist directory
  if (url.pathname.startsWith('/api/')) {
    // For API endpoints, we'll serve static JSON files
    const apiPath = url.pathname.replace('/api/', '');
    
    // Map API endpoints to static JSON files
    const endpointMap = {
      'health': 'data_index_2025-B9Kr8ozV.js',
      'transparency/available-years': 'data_index_2025-B9Kr8ozV.js',
      'transparency/year-data/2025': 'data_index_2025-B9Kr8ozV.js',
      'transparency/year-data/2024': 'data_index_2024-D-NFkPKh.js',
      'transparency/year-data/2023': 'data_index_2023-BBtGVX_f.js',
      'transparency/year-data/2022': 'data_index_2022-eHNTmUsm.js',
      'transparency/documents': 'comprehensive_data_index-Cgb3DIQx.js'
    };
    
    const filePath = endpointMap[apiPath];
    if (filePath) {
      // Redirect to the static file
      url.pathname = `/assets/${filePath}`;
      const newRequest = new Request(url.toString(), request);
      return fetch(newRequest);
    }
  }
  
  // For all other requests, serve static files from dist
  const newRequest = new Request(url.toString(), request);
  return fetch(newRequest);
}