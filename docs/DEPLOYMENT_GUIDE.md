# Carmen de Areco Transparency Portal - Deployment Guide

## Overview

This document explains the complete deployment architecture for the Carmen de Areco Transparency Portal, covering all deployment options and explaining how the system handles CORS issues, data processing, and API access.

## System Architecture

The portal is composed of several interconnected components:

1. **Frontend Application** (React + TypeScript + Vite)
2. **Backend API Proxy** (Node.js Express server)
3. **Cloudflare Worker** (CORS proxy)
4. **GitHub Pages** (Static file hosting)
5. **Data Processing Pipeline** (Python/Node.js scripts)

## Deployment Architecture

### GitHub Pages + Cloudflare (Recommended)

```
┌─────────────────────┐    ┌──────────────────────┐
│   Internet Users    │    │   GitHub Repository  │
└──────────┬──────────┘    └──────────┬───────────┘
           │                          │
           ▼                          ▼
┌─────────────────────┐    ┌──────────────────────┐
│   Custom Domain     │    │   GitHub Actions     │
│ cda-transparencia.org│    │ (Auto Deployment)   │
└─────────────────────┘    └──────────────────────┘
           │                          │
           ▼                          ▼
┌─────────────────────┐    ┌──────────────────────┐
│   Cloudflare CDN    │◄──►│   GitHub Pages       │
│                     │    │ (Static Files)       │
│  ┌──────────────┐   │    └──────────────────────┘
│  │ Cloudflare   │   │               │
│  │ Worker       │   │               ▼
│  │ (CORS Proxy) │   │    ┌──────────────────────┐
│  └──────────────┘   │    │ Data Files (JSON/CSV)│
└─────────────────────┘    └──────────────────────┘
           │                          │
           ▼                          ▼
┌─────────────────────┐    ┌──────────────────────┐
│ External Data       │    │ Data Processing      │
│ Sources             │◄──►│ Pipeline             │
│ (Carmen de Areco,   │    │ (Python/Node.js)     │
│ GBA, National)      │    └──────────────────────┘
└─────────────────────┘
```

### Component Responsibilities

1. **Frontend Application**
   - Serves static HTML/CSS/JS files
   - Makes API requests to Cloudflare Worker
   - Displays data in charts and tables
   - Handles routing and user interactions

2. **GitHub Pages**
   - Hosts compiled frontend application
   - Stores pre-processed data files (JSON/CSV)
   - Provides fast global CDN delivery

3. **Cloudflare Worker**
   - Acts as CORS proxy for API requests
   - Handles requests to external data sources
   - Caches responses for performance
   - Adds proper CORS headers to all responses

4. **Backend API Proxy**
   - Processes external data sources
   - Scrapes government websites
   - Extracts data from PDFs and PowerBI dashboards
   - Validates and normalizes data

5. **Data Processing Pipeline**
   - Runs nightly to update data
   - Processes new documents from official sources
   - Generates JSON files for frontend consumption

## GitHub Pages Deployment

### Automated Deployment Process

1. **GitHub Actions Workflow**
   - Triggered on push to `main` branch
   - Runs data preprocessing scripts
   - Builds frontend for GitHub Pages
   - Deploys to GitHub Pages

2. **Data Processing**
   - Python/Node.js scripts run to fetch latest data
   - Data is processed and converted to JSON/CSV
   - Files are copied to `frontend/public/data/`

3. **Frontend Build**
   - Vite builds optimized production version
   - Assets are minified and fingerprinted
   - Output goes to `frontend/dist/`

4. **Deployment**
   - GitHub Actions deploys `frontend/dist/` to GitHub Pages
   - Site becomes available at `username.github.io/cda-transparencia/`

### Manual Deployment

```bash
# 1. Install dependencies
cd frontend && npm install

# 2. Run data processing (if needed)
cd .. && node scripts/generate-data-index.js

# 3. Build for GitHub Pages
cd frontend && npm run build:github

# 4. Deploy to GitHub Pages
npm run deploy
```

## Cloudflare Worker Deployment

### Automatic Deployment

The Cloudflare Worker is automatically deployed through GitHub Actions when the GitHub Pages deployment succeeds.

### Manual Deployment

```bash
# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Deploy worker
wrangler deploy
```

### Worker Configuration

The worker (`worker.js`) handles:

1. **CORS Headers**: Adds proper CORS headers to all responses
2. **API Proxying**: Forwards API requests to appropriate endpoints
3. **Caching**: Caches responses for better performance
4. **Error Handling**: Returns proper error responses

## Custom Domain Deployment

### GitHub Pages with Custom Domain

1. **Configure Custom Domain in GitHub**
   - Go to Repository Settings → Pages
   - Set Custom Domain to `cda-transparencia.org`
   - Enable Enforce HTTPS

2. **DNS Configuration**
   - Add CNAME record pointing to `username.github.io`
   - Add TXT record for domain verification (if required)

3. **Build Configuration**
   ```bash
   cd frontend && npm run build:custom-domain
   ```

### Cloudflare with Custom Domain

1. **Configure DNS**
   - Point domain to Cloudflare nameservers
   - Add CNAME record for `cda-transparencia.org` → `username.github.io`

2. **SSL/TLS Settings**
   - Set SSL/TLS to "Full" or "Full (strict)"
   - Enable Always Use HTTPS
   - Enable HTTP/2 and HTTP/3

3. **Page Rules** (optional)
   - Add redirect from www to non-www
   - Set caching level to "Standard"

## Traditional Server Deployment

### Prerequisites

- Node.js 16+
- Python 3.8+
- Web server (nginx/Apache)
- Reverse proxy configuration

### Deployment Steps

1. **Install Dependencies**
   ```bash
   # Python dependencies
   pip install -r requirements_complete.txt
   
   # Node.js dependencies
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Build Frontend**
   ```bash
   cd frontend && npm run build
   ```

3. **Configure Web Server**
   Example nginx configuration:
   ```nginx
   server {
       listen 80;
       server_name cda-transparencia.org;
       
       # Frontend static files
       location / {
           root /path/to/cda-transparencia/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # API proxy
       location /api/ {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. **Start Services**
   ```bash
   # Start backend API proxy
   cd backend && npm run proxy
   
   # Or with PM2 for production
   pm2 start proxy-server.js --name cda-proxy
   ```

5. **Set Up Cron Jobs**
   ```bash
   # Add to crontab for daily data updates
   crontab -e
   # Add: 0 3 * * * cd /path/to/cda-transparencia/scripts && node sync-external-data.js
   ```

## Vercel/Netlify Deployment

### Frontend Deployment

1. **Connect Repository**
   - Connect your GitHub repository to Vercel/Netlify
   - Select the root directory

2. **Configure Build Settings**
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install` (auto-detected)

3. **Environment Variables**
   ```
   VITE_API_URL=https://your-worker.your-account.workers.dev
   VITE_USE_API=true
   ```

### Backend Deployment

Deploy the backend proxy server to platforms like:

- **Railway**: Easy deployment with automatic scaling
- **Render**: Simple deployment with custom domains
- **Heroku**: Traditional PaaS platform
- **Fly.io**: Global deployment platform

Example Railway deployment:

1. Create `railway.json`:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "node proxy-server.js",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. Connect to Railway and deploy

## Environment Variables

### Frontend Variables

```
VITE_API_URL=https://cda-transparencia.franco-longstaff.workers.dev
VITE_CHARTS_DATA_URL=https://cda-transparencia.franco-longstaff.workers.dev/data/charts
VITE_USE_API=true
```

### Backend Variables

```
PORT=3001
NODE_ENV=production
CACHE_TTL=3600
```

## Monitoring and Maintenance

### Health Checks

1. **Frontend Health**
   - `GET /health` endpoint returns status information
   - Monitor page load times and JS errors

2. **Backend Health**
   - `GET /health` endpoint in proxy server
   - Monitor cache hit rates and error rates

3. **Data Freshness**
   - Check `lastUpdated` timestamps in data files
   - Monitor external source availability

### Performance Optimization

1. **Caching Strategy**
   - Cloudflare CDN caches static assets
   - Worker caches API responses
   - Browser caches with service workers

2. **Bundle Optimization**
   - Code splitting reduces initial load
   - Asset compression minimizes transfer size
   - Lazy loading improves perceived performance

3. **Data Processing**
   - Incremental updates reduce processing time
   - Parallel processing speeds up data extraction
   - Efficient data structures minimize memory usage

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

### Performance Issues

1. **Optimize Images**
   - Compress images before deployment
   - Use appropriate formats (WebP, AVIF)

2. **Reduce Bundle Size**
   - Remove unused dependencies
   - Implement code splitting

## Security Considerations

### API Security

1. **Rate Limiting**
   - Proxy server implements rate limiting
   - Cloudflare provides additional protection

2. **Input Validation**
   - All API endpoints validate inputs
   - Sanitize user-provided data

### Data Privacy

1. **No Personal Data**
   - Portal only displays public government data
   - No user accounts or personal information collected

2. **Secure Connections**
   - All connections use HTTPS
   - Data传输 is encrypted

## Backup and Recovery

### Data Backup

1. **Version Control**
   - All code and configuration in Git
   - Regular commits ensure history retention

2. **Data Archiving**
   - Processed data files versioned in repository
   - External data cached locally for redundancy

### Recovery Procedures

1. **Rollback Deployment**
   - Use Git to rollback to previous version
   - GitHub Pages supports rollback through interface

2. **Restore Data**
   - Use cached data files for recovery
   - Re-run data processing scripts if needed

## Scaling Considerations

### Traffic Scaling

1. **GitHub Pages**
   - Automatically scales with traffic
   - Global CDN ensures fast delivery

2. **Cloudflare Worker**
   - Scales automatically with demand
   - Edge computing reduces latency

### Data Processing Scaling

1. **Parallel Processing**
   - Data scripts can run in parallel
   - Queue systems can handle large volumes

2. **Caching Layer**
   - Multiple cache layers reduce load
   - Intelligent cache invalidation strategies

## Conclusion

The Carmen de Areco Transparency Portal is designed for flexible deployment across multiple platforms. The recommended approach uses GitHub Pages for static file hosting and Cloudflare for API proxying, providing a cost-effective, scalable solution that handles CORS issues while maintaining excellent performance.

For organizations requiring more control, traditional server deployment offers full customization. For modern deployment workflows, platforms like Vercel/Netlify combined with Railway/Render provide excellent developer experience with automatic scaling.