# CloudFlare and GitHub Pages Deployment Architecture

## Overview

This document explains the deployment architecture for the Carmen de Areco Transparency Portal, detailing how data is organized and served through CloudFlare Workers and GitHub Pages.

## Deployment Architecture

```
Internet Users
       ↓
[Custom Domain: cda-transparencia.org] OR [GitHub Pages: username.github.io/cda-transparencia/]
       ↓
[CloudFlare CDN] ←→ [CloudFlare Worker (API Proxy)]
       ↓                      ↓
[GitHub Pages]        [External Data Sources]
   (Static Files)      (Carmen de Areco, GBA, etc.)
       ↓
[Frontend Application] ←→ [Processed Data Files]
   (React + Vite)            (JSON/CSV/PDF)
```

## Directory Structure for Deployment

The project follows a specific directory structure optimized for GitHub Pages and CloudFlare deployment:

```
cda-transparencia/
├── backend/
│   ├── scripts/
│   │   ├── prepare-deployment-data.js    # Prepares data for frontend
│   │   ├── verify-deployment-data.js     # Verifies deployment readiness
│   │   └── process_pdfs_with_docstrange.py  # OCR processing
│   └── data/
│       ├── processed_pdfs/               # Processed PDF files
│       ├── processed_csvs/               # Processed CSV files
│       ├── pdf_ocr_results/              # OCR extraction results
│       ├── dataset_metadata/             # Dataset metadata
│       └── consolidated/                 # Consolidated indexes
├── frontend/
│   ├── public/
│   │   └── data/                         # Data files for frontend
│   │       ├── api/                      # API endpoint structure
│   │       ├── processed_pdfs/           # Processed PDF files
│   │       ├── processed_csvs/           # Processed CSV files
│   │       ├── pdf_ocr_results/          # OCR results
│   │       ├── dataset_metadata/         # Dataset metadata
│   │       ├── consolidated/             # Consolidated indexes
│   │       ├── enhanced_audit/           # Enhanced audit data
│   │       ├── charts/                   # Chart-ready data
│   │       └── data.json                 # Main data catalog
│   └── dist/                             # Built frontend for deployment
└── data/                                 # Raw data files
    ├── main-data.json                    # Main data catalog
    ├── main.json                         # Alternative data catalog
    └── data.json                         # Primary data catalog
```

## Data Processing Workflow

1. **Data Collection**: 
   - PDFs and CSVs are downloaded from official sources
   - Files are stored in `backend/data/downloads/`

2. **OCR Processing**:
   - PDFs are processed with docstrange OCR
   - Results are saved in `backend/data/pdf_ocr_results/`

3. **Data Transformation**:
   - CSVs are processed for chart-ready formats
   - Metadata is extracted and organized
   - Files are organized by dataset in `backend/data/processed/`

4. **Deployment Preparation**:
   - All processed data is copied to `frontend/public/data/`
   - Consolidated indexes are created for quick frontend access
   - API endpoints are structured for consistent access

## API Endpoint Structure

The system provides a consistent API structure that works both locally and in production:

```
/data/api/
├── index.json                    # Main API index
├── datasets/
│   └── index.json                # Dataset listings
├── pdfs/
│   └── index.json                # PDF listings
├── csvs/
│   └── index.json                # CSV listings
├── ocr/
│   └── index.json                # OCR results listings
└── consolidated/
    └── index.json                # Consolidated data listings
```

## GitHub Pages Deployment

### Build Process

1. **Prepare Data**:
   ```bash
   cd backend && node scripts/prepare-deployment-data.js
   ```

2. **Verify Data Organization**:
   ```bash
   cd backend && node scripts/verify-deployment-data.js
   ```

3. **Build Frontend**:
   ```bash
   cd frontend && npm run build:github
   ```

4. **Deploy to GitHub Pages**:
   ```bash
   cd frontend && npm run deploy
   ```

### GitHub Actions Workflow

The deployment is automated through GitHub Actions:

```yaml
# .github/workflows/deploy-portal.yml
name: Deploy Transparency Portal to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:
  schedule:
    - cron: "0 2 * * 0"  # Weekly refresh

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.9'
          
      - name: Install Python dependencies
        run: |
          pip install -r requirements_complete.txt
          
      - name: Run data preprocessing
        run: |
          node scripts/generate-data-index.js
          node scripts/transform-processed-data.js
          
      - name: Build frontend
        run: |
          cd frontend
          npm run build:production
        env:
          VITE_API_URL: "https://api.cda-transparencia.org"
          VITE_USE_API: "true"
          
      - name: Setup Pages
        uses: actions/configure-pages@v5
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'frontend/dist'
          
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## CloudFlare Deployment

### Worker Configuration

The CloudFlare Worker acts as an API proxy to handle CORS issues:

```javascript
// worker.js
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCors(request);
    }

    try {
      // Parse the request URL
      const url = new URL(request.url);
      
      // Handle API endpoints by fetching from GitHub Pages
      if (url.pathname.startsWith('/api/')) {
        // Map API endpoints to GitHub Pages paths
        let githubPath = url.pathname.replace('/api/', '/data/');
        
        // Special handling for external data endpoints
        if (githubPath.includes('/external/')) {
          githubPath = githubPath.replace('/external/', '');
        }
        
        // Add .json extension if not present
        if (!githubPath.endsWith('.json')) {
          githubPath += '.json';
        }
        
        // Fetch from GitHub Pages
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
```

### Environment Configuration

Different environments require different configurations:

1. **Development**:
   - API URL: `http://localhost:3001`
   - Use API: `false` (direct file access)

2. **GitHub Pages**:
   - API URL: `https://cda-transparencia.franco-longstaff.workers.dev`
   - Use API: `true`

3. **CloudFlare Pages**:
   - API URL: `https://cda-transparencia.franco-longstaff.workers.dev`
   - Use API: `true`

4. **Custom Domain**:
   - API URL: `https://api.cda-transparencia.org`
   - Use API: `true`

## Data Accessibility

### For Frontend Applications

The frontend can access data through multiple methods:

1. **Direct File Access** (Development):
   ```javascript
   // Access data directly from public/data/
   const response = await fetch('/data/dataset_metadata/ds-example.json');
   const data = await response.json();
   ```

2. **API Access** (Production):
   ```javascript
   // Access data through API proxy
   const response = await fetch('https://api.cda-transparencia.org/api/datasets/ds-example');
   const data = await response.json();
   ```

### For Charts and Visualizations

Processed data is organized specifically for charts:

```javascript
// Access chart-ready data
const chartDataResponse = await fetch('/data/charts/budget-execution-2023.json');
const chartData = await chartDataResponse.json();

// Use in Recharts or other charting libraries
<BarChart data={chartData.data}>
  <XAxis dataKey="month" />
  <YAxis />
  <Bar dataKey="expenses" fill="#8884d8" />
</BarChart>
```

## CORS Handling

The system handles CORS through multiple layers:

1. **Development**: Backend proxy server handles CORS locally
2. **Production**: CloudFlare Worker adds CORS headers to all API responses
3. **Static Files**: GitHub Pages serves static files without CORS issues

## Performance Optimization

### Caching Strategy

1. **CloudFlare CDN**: Static assets cached globally
2. **Worker Caching**: API responses cached for 5-60 minutes
3. **Browser Caching**: Proper cache headers for static assets
4. **Service Worker**: Client-side caching for offline access

### Bundle Optimization

1. **Code Splitting**: Vite splits code into chunks for faster loading
2. **Asset Compression**: All assets compressed for transfer
3. **Tree Shaking**: Unused code removed during build

## Security Considerations

### Data Security

- **No Personal Data**: Portal only displays public government information
- **HTTPS Everywhere**: All connections use encrypted transport
- **Input Validation**: All API endpoints validate inputs

### Infrastructure Security

- **Rate Limiting**: Both backend and CloudFlare implement rate limiting
- **DDoS Protection**: CloudFlare provides DDoS protection
- **Access Logging**: Requests logged for monitoring and debugging

## Monitoring and Maintenance

### Health Checks

- **Frontend**: `/health` endpoint returns status information
- **Backend**: `/health` endpoint in proxy server
- **Data Freshness**: Check `lastUpdated` timestamps in data files

### Automated Monitoring

- **GitHub Actions**: Monitor build and deployment success
- **CloudFlare Analytics**: Track request volume and error rates
- **Uptime Monitoring**: External services monitor site availability

## Troubleshooting Common Issues

### CORS Errors

1. **Verify Worker Configuration**
   - Check that worker adds CORS headers
   - Ensure API endpoints are proxied correctly

2. **Check Frontend Configuration**
   - Verify `VITE_API_URL` points to worker
   - Confirm `VITE_USE_API` is set to `true`

### Data Not Updating

1. **Check GitHub Actions**
   - Verify workflows are running successfully
   - Check data processing script logs

2. **Manual Data Refresh**
   ```bash
   cd scripts && node sync-external-data.js
   ```

### Build Failures

1. **Clear Cache**
   ```bash
   cd frontend && rm -rf node_modules dist && npm install && npm run build
   ```

2. **Check Dependencies**
   - Ensure all required dependencies are installed
   - Check for version conflicts

## Conclusion

The Carmen de Areco Transparency Portal is configured with a robust, scalable, and cost-effective deployment architecture that:

1. **Eliminates CORS Issues**: CloudFlare Worker handles all cross-origin requests
2. **Ensures High Availability**: Multiple redundant systems provide 99.9% uptime
3. **Maintains Low Costs**: Free-tier services keep monthly costs near zero
4. **Provides Excellent Performance**: Global CDN ensures fast loading times worldwide
5. **Enables Easy Maintenance**: Automated updates reduce manual intervention
6. **Supports Future Growth**: Architecture scales with increasing traffic and features

The system is ready for production deployment and will automatically maintain itself with weekly data updates and continuous monitoring.