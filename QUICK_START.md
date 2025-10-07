# Quick Start Guide - Carmen de Areco Transparency Portal

**Status**: ✅ Production Ready
**Last Updated**: 2025-10-03

---

## 🚀 Quick Commands

### Development

```bash
# Start frontend dev server
cd frontend && npm run dev
# Opens: http://localhost:5175

# Start backend proxy server
cd backend && node proxy-server.js
# Runs on: http://localhost:3001

# Sync external data
cd scripts && node sync-external-data.js
# Updates: frontend/public/data/external/*.json

# Run tests
cd scripts && node test-data-integration.js
# Tests: All pages and data sources
```

### Production

```bash
# Build frontend
cd frontend && npm run build
# Output: frontend/dist/

# Preview production build
cd frontend && npm run preview
# Opens: http://localhost:4173

# Deploy (example with PM2)
pm2 start backend/proxy-server.js --name cda-backend
pm2 startup
pm2 save
```

---

## 📁 Project Structure

```
cda-transparencia/
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/              # 44 page components
│   │   ├── components/
│   │   │   ├── charts/         # 63 chart components
│   │   │   └── common/         # Shared components
│   │   ├── services/           # Data services
│   │   ├── hooks/              # React hooks
│   │   └── utils/              # Utilities
│   ├── public/
│   │   └── data/
│   │       ├── *.csv           # Local CSV files
│   │       ├── *.json          # Local JSON files
│   │       └── external/       # Cached external data (12 files)
│   └── dist/                   # Build output
├── backend/
│   └── proxy-server.js         # Express.js API proxy
├── scripts/
│   ├── sync-external-data.js   # Data sync script
│   ├── test-data-integration.js # Integration tests
│   └── audit-charts.js         # Chart analysis
└── docs/
    ├── SESSION_COMPLETE_SUMMARY.md
    ├── PRODUCTION_READINESS_CHECKLIST.md
    ├── DATA_SERVICE_ARCHITECTURE.md
    ├── CHARTS_INTEGRATION_STATUS.md
    └── CACHED_DATA_MIGRATION.md
```

---

## 🔑 Key Concepts

### Data Flow

```
PAGE → HOOK → SERVICE → DATA SOURCES
```

**Example**:
```typescript
// 1. Page uses hook
const { data, loading, error } = useBudgetData(2024);

// 2. Hook calls service
const pageData = await unifiedDataService.getPageData('budget', 2024);

// 3. Service loads from multiple sources
const data = {
  csv: await loadCSV(),
  json: await loadJSON(),
  pdf: await loadPDF(),
  external: await externalAPIsService.getRAFAMData() // ← Loads from cache
};
```

### Data Sources

1. **Local CSV** - Historical municipal data (20+ files)
2. **Local JSON** - Structured exports (15+ files)
3. **PDF Documents** - Official reports (299 files)
4. **Cached External** - Provincial/National data (12 files)

### External Data Sources (Cached)

- ✅ RAFAM Provincial (7 years: 2019-2025)
- ✅ Carmen Official (municipal data)
- ✅ Georef API (geographic data)
- ✅ BCRA (economic indicators)
- ✅ Datos Argentina (national datasets)
- ✅ Boletín Municipal (municipal bulletin)

---

## 🧪 Testing

### Run All Tests
```bash
cd scripts
node test-data-integration.js
```

### Expected Output
```
🧪 DATA INTEGRATION TEST SUITE
✅ Dev server is running
✅ All pages accessible (200 OK)
✅ All cached data files valid
🎉 All tests passed!
```

### Manual Testing
```bash
# Start dev server
cd frontend && npm run dev

# Open pages
open http://localhost:5175/completo        # Comprehensive dashboard
open http://localhost:5175/budget          # Budget page
open http://localhost:5175/treasury        # Treasury page
open http://localhost:5175/contracts       # Contracts page
```

---

## 🔧 Maintenance

### Daily Data Sync (Automated)

Set up cron job:
```bash
crontab -e

# Add this line (runs daily at 3 AM):
0 3 * * * cd /path/to/cda-transparencia/scripts && node sync-external-data.js >> /var/log/cda-sync.log 2>&1
```

### Manual Data Sync
```bash
cd scripts
node sync-external-data.js
```

**Output**:
```
📡 Syncing external data sources...
✅ RAFAM: 7 files synced (14.1 KB)
✅ Carmen Official: 1 file synced (3.5 KB)
✅ Georef: 1 file synced (0.6 KB)
✅ BCRA: 1 file synced (0.7 KB)
✅ Datos Argentina: 1 file synced (0.5 KB)
✅ Boletín Municipal: 1 file synced (0.8 KB)
📊 Total: 12 files, 20.1 KB
```

### Check Cache Health
```bash
curl http://localhost:5175/data/external/cache_manifest.json | python3 -m json.tool
```

**Check**:
- `last_sync` should be within 24 hours
- `successful_sources` should be 6
- `total_files` should be 12

---

## 🐛 Troubleshooting

### Frontend won't start
```bash
# Check if port is in use
lsof -ti:5175 | xargs kill -9

# Reinstall dependencies
cd frontend && rm -rf node_modules && npm install

# Try again
npm run dev
```

### Backend won't start
```bash
# Check if port is in use
lsof -ti:3001 | xargs kill -9

# Reinstall dependencies
cd backend && rm -rf node_modules && npm install

# Try again
node proxy-server.js
```

### Charts not displaying data
```bash
# Check if data files exist
ls -lh frontend/public/data/external/

# Re-sync data
cd scripts && node sync-external-data.js

# Restart frontend
cd frontend && npm run dev
```

### Cache is stale
```bash
# Check cache age
curl http://localhost:5175/data/external/cache_manifest.json | grep last_sync

# Re-sync
cd scripts && node sync-external-data.js
```

---

## 📖 Documentation

### Main Guides

1. **[SESSION_COMPLETE_SUMMARY.md](docs/SESSION_COMPLETE_SUMMARY.md)** - What was accomplished
2. **[PRODUCTION_READINESS_CHECKLIST.md](docs/PRODUCTION_READINESS_CHECKLIST.md)** - Deployment guide
3. **[DATA_SERVICE_ARCHITECTURE.md](docs/DATA_SERVICE_ARCHITECTURE.md)** - Architecture deep dive
4. **[CHARTS_INTEGRATION_STATUS.md](docs/CHARTS_INTEGRATION_STATUS.md)** - All 63 charts analyzed
5. **[CACHED_DATA_MIGRATION.md](docs/CACHED_DATA_MIGRATION.md)** - How caching works

### Quick References

- **Pages**: 44 total ([src/pages/](frontend/src/pages/))
- **Charts**: 63 total ([src/components/charts/](frontend/src/components/charts/))
- **Hooks**: 15+ ([src/hooks/](frontend/src/hooks/))
- **Services**: 20+ ([src/services/](frontend/src/services/))

---

## 🚀 Deployment

### For Custom Domain Deployment

When deploying with a custom domain to GitHub Pages, use production mode to ensure proper routing:

```bash
# Build for custom domain (uses base path "/")
cd frontend && npm run build:production

# Alternative custom domain build command
cd frontend && npm run build:custom-domain
```

This ensures the site is built with the correct base path for custom domains.

## 🚀 Deployment

### Option 1: Traditional Server

1. **Build frontend**:
   ```bash
   cd frontend && npm run build
   ```

2. **Copy to web server**:
   ```bash
   scp -r frontend/dist/* user@server:/var/www/html/
   ```

3. **Start backend**:
   ```bash
   ssh user@server
   cd /path/to/cda-transparencia/backend
   pm2 start proxy-server.js --name cda-backend
   ```

4. **Set up cron**:
   ```bash
   crontab -e
   # Add: 0 3 * * * cd /path/to/scripts && node sync-external-data.js
   ```

### Option 2: Vercel/Netlify

1. **Connect Git repository**
2. **Set build command**: `cd frontend && npm run build`
3. **Set output directory**: `frontend/dist`
4. **Deploy backend separately** (Railway/Render)

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| **Page Load** | 1-2s |
| **Year Switch** | <100ms |
| **API Errors** | 0 |
| **Offline Mode** | ✅ Works |
| **Data Freshness** | Daily sync |
| **Bundle Size** | Optimized |

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Frontend loads at http://localhost:5175
- [ ] Backend responds at http://localhost:3001
- [ ] All pages accessible (no 404s)
- [ ] Charts display data
- [ ] No console errors
- [ ] Cache files exist in `/data/external/`
- [ ] Tests pass: `node scripts/test-data-integration.js`

---

## 🆘 Support

### Common Issues

1. **"Module not found"** → Run `npm install` in frontend/backend
2. **"Port already in use"** → Kill process: `lsof -ti:PORT | xargs kill -9`
3. **"No data displayed"** → Run sync: `node scripts/sync-external-data.js`
4. **"Build failed"** → Clear cache: `rm -rf node_modules dist && npm install`

### Debug Mode

Enable verbose logging:
```bash
# Frontend
DEBUG=* npm run dev

# Backend
NODE_ENV=development node proxy-server.js
```

---

## 🎯 Quick Links

- **Frontend Dev**: http://localhost:5175
- **Backend API**: http://localhost:3001
- **Comprehensive Dashboard**: http://localhost:5175/completo
- **Data Connectivity Test**: http://localhost:5175/data-connectivity-test
- **All Charts Test**: http://localhost:5175/all-charts

---

**Status**: ✅ Everything working
**Deployment**: Ready for production
**Next Step**: Run `cd frontend && npm run dev` to start

---

*Need help? Check [docs/](docs/) for detailed guides.*
