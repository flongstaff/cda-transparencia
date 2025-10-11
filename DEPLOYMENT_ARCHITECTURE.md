# Carmen de Areco Transparency Portal - Deployment Architecture

## Overview

This document describes the complete deployment architecture for the Carmen de Areco Transparency Portal, which enables zero-cost hosting with global CDN performance through GitHub Pages and CloudFlare integration.

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

- **Technology**: React 18 + TypeScript + Vite
- **Location**: `/frontend/` directory
- **Features**: 
  - Responsive design with Tailwind CSS
  - Interactive charts with Recharts, D3.js, and Nivo
  - Multi-language support with i18next
  - Service worker for offline access
  - PWA capabilities for mobile installation

### 2. Backend API Proxy (Node.js Express)

- **Technology**: Node.js + Express.js
- **Location**: `/backend/` directory
- **Functions**:
  - Handles CORS issues for external data sources
  - Caches responses for improved performance
  - Processes PDF documents with OCR
  - Transforms data for frontend consumption
  - Provides REST API endpoints

### 3. CloudFlare Worker (API Proxy)

- **Technology**: CloudFlare Workers (JavaScript)
- **Location**: `/worker.js`
- **Functions**:
  - Acts as CORS proxy for API requests
  - Serves static files from GitHub Pages
  - Adds proper headers to all responses
  - Handles rate limiting and error responses

### 4. Data Processing Pipeline

- **Technology**: Node.js + Python
- **Location**: `/scripts/` and `/backend/scripts/`
- **Functions**:
  - Extracts data from official sources
  - Processes PDFs with OCR using docstrange
  - Transforms CSVs for chart-ready consumption
  - Organizes data for frontend access

### 5. GitHub Pages Hosting

- **Platform**: GitHub Pages (Free)
- **Features**:
  - Zero-cost static file hosting
  - Global CDN through CloudFlare
  - Automatic HTTPS
  - Custom domain support

## Deployment Process

### Automated Deployment via GitHub Actions

The portal is automatically deployed through GitHub Actions workflows:

1. **On Push to Main Branch**:
   - Triggers `pages.yml` workflow
   - Builds and validates frontend
   - Deploys to GitHub Pages

2. **Weekly Data Updates**:
   - Triggers `update-data.yml` workflow
   - Runs data extraction and processing scripts
   - Updates processed data files
   - Commits changes to repository

3. **CloudFlare Deployment**:
   - Triggers `cloudflare-deploy.yml` workflow
   - Deploys to CloudFlare Pages
   - Updates CloudFlare Worker

### Manual Deployment

For manual deployment, use the provided scripts:

```bash
# Run complete deployment process
./deploy-full.sh

# Or run individual deployment steps
node scripts/deploy-complete.js              # Complete deployment
node scripts/deploy-complete.js --data-only   # Process data sources only
node scripts/deploy-complete.js --build-only  # Build frontend only
node scripts/deploy-complete.js --deploy-only # Deploy to GitHub Pages only
```

## Environment Configuration

### Development

```bash
# Start development servers
cd frontend && npm run dev:full

# This runs:
# 1. Frontend development server (port 5173)
# 2. Backend proxy server (port 3001)
```

Environment variables in `.env.development`:
```
VITE_API_URL=http://localhost:3001
VITE_USE_API=false
```

### Production (GitHub Pages + CloudFlare)

Environment variables in `.env.github`:
```
VITE_API_URL=https://cda-transparencia.franco-longstaff.workers.dev
VITE_USE_API=true
```

## Data Organization

Processed data is organized in `frontend/public/data/`:

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

The system provides consistent API endpoints:

### Frontend Data Access
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
```

### Backend API Proxy
```
# Carmen de Areco data
GET /api/carmen/official
GET /api/carmen/transparency
GET /api/carmen/boletin
GET /api/carmen/licitaciones
GET /api/carmen/declaraciones

# HCD data
GET /api/hcd/blog

# National data
GET /api/national/datos
GET /api/national/georef

# Provincial data
GET /api/provincial/gba
GET /api/provincial/fiscal
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

### Automated Monitoring

- **GitHub Actions**: Monitor build and deployment success
- **CloudFlare Analytics**: Track request volume and error rates
- **Uptime Monitoring**: External services monitor site availability

### Scheduled Updates

Weekly data updates are handled through GitHub Actions:
- Runs every Sunday at 2 AM UTC
- Processes new data from official sources
- Updates processed data files
- Commits changes to repository

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

The Carmen de Areco Transparency Portal deployment architecture provides:

1. **Zero Ongoing Costs**: Except for optional domain registration
2. **Global Performance**: Through CloudFlare CDN
3. **Automatic Scaling**: GitHub Pages handles traffic increases
4. **Robust Security**: CloudFlare DDoS protection and HTTPS
5. **Easy Maintenance**: Automated updates through GitHub Actions
6. **High Availability**: Redundant systems for resilience

The combination of GitHub Pages for static hosting and CloudFlare for API proxying creates a powerful, cost-effective solution that can handle significant traffic while remaining completely free to operate.