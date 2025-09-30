/**
 * Cloudflare Worker for Carmen de Areco Transparency Portal
 * Handles API requests for the frontend
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Handle API routes with mock data for transparency portal
    if (path.startsWith('/api/')) {
      if (path === '/api/external/all-external-data') {
        return new Response(JSON.stringify({
          "results": [
            {
              "name": "Municipalidad de Carmen de Areco",
              "type": "municipal",
              "success": true,
              "data": {
                "budget": [
                  {"jurisdiccion": "Municipio", "entidad": "Carmen de Areco", "monto": 2150670000, "year": 2024}
                ]
              },
              "status": 200,
              "url": "https://carmendeareco.gob.ar/transparencia"
            },
            {
              "name": "Carmen de Areco Official Site",
              "type": "municipal",
              "success": true,
              "data": {
                "info": "Municipalidad de Carmen de Areco - Provincia de Buenos Aires"
              },
              "status": 200,
              "url": "https://carmendeareco.gob.ar"
            },
            {
              "name": "GeoRef Argentina",
              "type": "national",
              "success": true,
              "data": {
                "cantidad": 1,
                "inicio": 0,
                "municipios": [
                  {
                    "centroide": {
                      "lat": -34.4067977840705,
                      "lon": -59.884413320764
                    },
                    "id": "060161",
                    "nombre": "Carmen de Areco",
                    "provincia": {
                      "id": "06",
                      "nombre": "Buenos Aires"
                    }
                  }
                ],
                "parametros": {
                  "nombre": "carmen-de-areco",
                  "provincia": "buenos-aires"
                },
                "total": 1
              },
              "status": 200,
              "url": "https://apis.datos.gob.ar/georef/api/municipios"
            }
          ],
          "summary": {
            "total_sources": 3,
            "successful_sources": 3,
            "failed_sources": 0,
            "last_updated": new Date().toISOString()
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
        });
      } 
      else if (path === '/api/data/budget') {
        return new Response(JSON.stringify({
          "data": [
            {"year": 2024, "budget": 2150670000, "executed": 1950000000, "percentage": 90.7},
            {"year": 2023, "budget": 1850000000, "executed": 1820000000, "percentage": 98.4},
            {"year": 2022, "budget": 1680000000, "executed": 1650000000, "percentage": 98.2}
          ]
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
        });
      } 
      else if (path === '/api/data/personnel') {
        return new Response(JSON.stringify({
          "data": [
            {"name": "Intendente", "position": "Intendente Municipal", "salary": 1151404.8, "year": 2024, "employees": 1},
            {"name": "Concejales", "position": "Concejales/As", "salary": 239876, "year": 2024, "employees": 10},
            {"name": "Directores", "position": "Director", "salary": 467758.2, "year": 2024, "employees": 15}
          ]
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
        });
      } 
      else if (path === '/api/data/contracts') {
        return new Response(JSON.stringify({
          "data": [
            {"contract_id": "CT-2024-001", "description": "Mantenimiento de espacios verdes", "amount": 15000000, "supplier": "Jardines del Pueblo S.A.", "date": "2024-01-15"},
            {"contract_id": "CT-2024-002", "description": "Reparación red cloacal", "amount": 45000000, "supplier": "Obras Sanitarias del Estado", "date": "2024-02-20"},
            {"contract_id": "CT-2024-003", "description": "Adquisición mobiliario escolar", "amount": 8500000, "supplier": "Muebles Educativos S.R.L.", "date": "2024-03-10"},
            {"contract_id": "CT-2024-004", "description": "Servicio de limpieza", "amount": 12000000, "supplier": "Limpieza Integral Municipal", "date": "2024-04-05"}
          ]
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
        });
      } 
      else {
        // For other API endpoints, return a mock response
        return new Response(JSON.stringify({
          "data": [],
          "message": `Mock data for ${path}`,
          "status": 200
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
        });
      }
    }
    
    // For non-API routes, return 404 since this worker only handles API requests
    return new Response('Not Found', { status: 404 });
  },
};