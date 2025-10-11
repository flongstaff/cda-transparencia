# Complete Deployment Architecture for Carmen de Areco Transparency Portal

## Overview

This document describes the complete deployment architecture for the Carmen de Areco Transparency Portal, including the GitHub Pages deployment with CloudFlare integration and the API proxy system that handles CORS issues for external data sources.

## Architecture Diagram

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

## Components

### 1. Frontend Application (React + Vite)

Located in `/frontend/` directory:
- Built with React 18 + TypeScript + Vite
- Responsive design with Tailwind CSS
- Interactive charts with Recharts, D3.js, and Nivo
- Data visualization components for transparency data
- Multi-language support with i18next

### 2. Backend API Proxy (Node.js Express)

Located in `/backend/` directory:
- Handles CORS issues for external data sources
- Caches responses for improved performance
- Processes PDF documents with OCR
- Transforms CSV data for frontend consumption
- Provides REST API endpoints for frontend

### 3. CloudFlare Worker (API Proxy)

Located in `/worker.js`:
- Acts as a CORS proxy for API requests
- Serves static files from GitHub Pages
- Adds proper headers to all responses
- Handles rate limiting and error responses

### 4. Data Processing Pipeline

Located in `/scripts/` and `/backend/scripts/`:
- Extracts data from official sources
- Processes PDFs with OCR using docstrange
- Transforms CSVs for chart-ready consumption
- Organizes data for frontend access

### 5. GitHub Pages Deployment

Hosts the static frontend application:
- Zero-cost hosting solution
- Global CDN through CloudFlare
- Automatic HTTPS
- Custom domain support

## Deployment Process

### 1. Data Processing

The data processing pipeline prepares all government data for frontend consumption:

```bash
# Process all official data sources with OCR
cd backend && node scripts/enhanced-data-processor.js

# Synchronize processed data for frontend access
cd scripts && node sync-data-for-deployment.js
```

This process:
1. Downloads PDFs and CSVs from official sources
2. Processes PDFs with docstrange OCR for text extraction
3. Transforms CSVs for chart-ready consumption
4. Organizes all data in `frontend/public/data/` directory

### 2. Frontend Build

The frontend is built for production deployment:

```bash
# Build for GitHub Pages
cd frontend && npm run build:github

# Or build for custom domain
cd frontend && npm run build:production
```

This creates optimized static files in `frontend/dist/`:
- Bundled JavaScript and CSS
- Optimized images and assets
- Proper routing for SPA navigation
- Service worker for offline access

### 3. GitHub Pages Deployment

Deploy the built frontend to GitHub Pages:

```bash
# Deploy to GitHub Pages
cd frontend && npm run deploy
```

This uses the gh-pages package to:
1. Commit built files to gh-pages branch
2. Push to GitHub
3. Trigger GitHub Pages deployment

### 4. CloudFlare Worker Deployment

Deploy the CloudFlare Worker to handle API proxying:

```bash
# Install wrangler CLI
npm install -g wrangler

# Login to CloudFlare
wrangler login

# Deploy worker
wrangler deploy
```

The worker handles:
- CORS headers for all API responses
- Proxy requests to GitHub Pages static files
- Caching for improved performance
- Rate limiting for protection

## Environment Configuration

### Development Environment

For local development:
```bash
# Start frontend development server
cd frontend && npm run dev

# Start backend proxy server (in separate terminal)
cd backend && npm run proxy
```

Environment variables:
```
VITE_API_URL=http://localhost:3001
VITE_USE_API=false
```

### Production Environment (GitHub Pages + CloudFlare)

For production deployment:
```bash
# Build for production
cd frontend && npm run build:production
```

Environment variables:
```
VITE_API_URL=https://cda-transparencia.franco-longstaff.workers.dev
VITE_USE_API=true
```

## Data Organization for GitHub Pages

The processed data is organized in `frontend/public/data/`:

```
frontend/public/data/
├── api/                      # API endpoint structure
├── audit_reports/            # Audit reports from government sources
├── charts/                   # Chart-ready data files
├── consolidated/             # Consolidated data indexes
├── csv/                      # Raw CSV files from government sources
├── dataset_metadata/         # Metadata for each dataset
├── enhanced_audit/           # Enhanced audit data processing
├── external/                 # External data sources
├── historical/               # Historical data archives
├── metadata/                 # Metadata standards and schemas
├── ocr_audit/                # OCR processing audit logs
├── ocr_extracted/            # OCR extracted text from PDFs
├── organized_documents/       # Organized document collections
├── pdf_ocr_results/          # Detailed OCR results from PDFs
├── processed/                # Processed data files
├── processed_csvs/           # CSV files processed for charts
├── processed_pdfs/           # PDF files with processing metadata
├── raw/                      # Raw data files from sources
└── whistleblower_reports/    # Whistleblower reports and submissions
```

## API Endpoints

The system provides consistent API endpoints through the CloudFlare Worker:

```
# Main data catalogs
GET /data.json
GET /main-data.json
GET /main.json

# Dataset metadata
GET /data/dataset_metadata/{dataset_id}.json

# Processed PDFs
GET /data/processed_pdfs/{dataset_id}/{filename}.pdf

# OCR results
GET /data/pdf_ocr_results/{dataset_id}/{filename}_extraction.json

# Chart-ready data
GET /data/charts/{chart_id}.json

# API endpoints
GET /data/api/index.json
GET /data/api/datasets/index.json
GET /data/api/pdfs/index.json
GET /data/api/csvs/index.json
GET /data/api/ocr/index.json
```

## CORS Handling

The system handles CORS through multiple layers:

1. **Development**: Backend proxy server handles CORS locally
2. **Production**: CloudFlare Worker adds CORS headers to all responses
3. **Static Files**: GitHub Pages serves static files without CORS issues

### CloudFlare Worker CORS Configuration

The worker automatically adds these headers to all responses:
```javascript
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, X-API-Key',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Access-Control-Allow-Credentials': 'true'
}
```

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
4. **Lazy Loading**: Components loaded on-demand

### Data Processing Optimization

1. **Incremental Updates**: Only changed data processed weekly
2. **Parallel Processing**: Multiple files processed simultaneously
3. **Efficient Formats**: JSON preferred over XML for smaller payloads
4. **Data Filtering**: API endpoints allow filtering to reduce payload size

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
- **Worker**: `/health` endpoint in CloudFlare Worker
- **Data Freshness**: Check `lastUpdated` timestamps in data files

### Automated Monitoring

- **GitHub Actions**: Monitor build and deployment success
- **CloudFlare Analytics**: Track request volume and error rates
- **Uptime Monitoring**: External services monitor site availability

### Scheduled Updates

Weekly data updates are handled through GitHub Actions:
```yaml
# .github/workflows/update-data.yml
name: Weekly Data Update

on:
  schedule:
    - cron: "0 2 * * 0"  # Weekly on Sundays at 2 AM UTC
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.9'
          
      - name: Install dependencies
        run: |
          npm install
          pip install -r requirements_complete.txt
          
      - name: Run data processing
        run: |
          node backend/scripts/enhanced-data-processor.js
          
      - name: Synchronize data
        run: |
          node scripts/sync-data-for-deployment.js
          
      - name: Build frontend
        run: |
          cd frontend
          npm run build:github
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
```

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

### Deployment Issues

1. **GitHub Pages Deployment**
   - Check that `gh-pages` branch is properly configured
   - Verify custom domain settings in repository settings
   - Check for build errors in GitHub Actions logs

2. **CloudFlare Worker Deployment**
   - Ensure `wrangler.toml` is properly configured
   - Verify CloudFlare account credentials
   - Check route configuration in `wrangler.toml`

## Cost Analysis

### Free Tier Usage

1. **GitHub Pages**: Completely free for public repositories
2. **CloudFlare**: Free tier provides all necessary features
3. **CloudFlare Worker**: Free tier sufficient for API proxying
4. **Domain**: Optional custom domain (~$12/year)

### Scaling Costs

As traffic grows:
- GitHub Pages scales automatically with no additional cost
- CloudFlare free tier handles most traffic scenarios
- Only custom domain registration has ongoing costs

## Conclusion

The Carmen de Areco Transparency Portal deployment architecture provides:

1. **Zero Ongoing Costs**: Except for optional domain registration
2. **Global Performance**: Through CloudFlare CDN
3. **Automatic Scaling**: GitHub Pages handles traffic increases
4. **Robust Security**: CloudFlare DDoS protection and HTTPS
5. **Easy Maintenance**: Automated updates through GitHub Actions
6. **High Availability**: Redundant systems for resilience

The combination of GitHub Pages for static hosting and CloudFlare for API proxying creates a powerful, cost-effective solution that can handle significant traffic while remaining completely free to operate.