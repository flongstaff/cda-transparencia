# Carmen de Areco Transparency Portal - Backend Proxy Server

## Quick Start

```bash
cd backend
npm install
npm run proxy
```

Server starts on `http://localhost:3001`

## Available Endpoints

- `GET  /health` - Health check
- `GET  /api/carmen/official` - Carmen de Areco official site
- `GET  /api/carmen/transparency` - Transparency portal
- `GET  /api/national/datos` - datos.gob.ar API
- `GET  /api/national/georef` - Geographic data
- `GET  /api/provincial/gba` - Buenos Aires open data
- `GET  /api/powerbi/extract?url=<url>` - Extract PowerBI data
- `POST /api/pdf/extract` - Extract PDF data
- `POST /api/validate` - Validate data

## Usage with Frontend

```bash
# Terminal 1: Start proxy
cd backend && npm run proxy

# Terminal 2: Start frontend
cd frontend && npm run dev

# Or use dev:full to start both:
cd frontend && npm run dev:full
```

## Features

- CORS bypass for external APIs
- Response caching (5-30 minutes)
- Web scraping with Cheerio
- PowerBI extraction with Puppeteer
- PDF processing
- Data validation
- Rate limiting (100 req/15min)

See `proxy-server.js` for full implementation.
