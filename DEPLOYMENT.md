# Deployment Guide - Carmen de Areco Transparency Portal

## 🌐 Production Deployment Configuration

### GitHub Pages + Cloudflare Setup

#### 1. GitHub Repository Configuration
- Repository: `yourusername/cda-transparencia`
- Branch: `main`
- GitHub Pages enabled with custom domain

#### 2. Cloudflare DNS Configuration
Add these DNS records in your Cloudflare dashboard for **cda-transparencia.org**:

```
Type: CNAME
Name: @
Target: yourusername.github.io
Proxy: Enabled (Orange Cloud)
```

```
Type: CNAME  
Name: www
Target: cda-transparencia.org
Proxy: Enabled (Orange Cloud)
```

#### 3. Custom Domain Setup
1. In GitHub repo settings → Pages
2. Set custom domain: `cda-transparencia.org`
3. Enable "Enforce HTTPS"

### 🚀 Automated Deployment Process

The project uses GitHub Actions for CI/CD:

**Workflow File:** `.github/workflows/deploy.yml`

**Deployment Steps:**
1. **Test Phase**: Runs on every push/PR
   - Sets up PostgreSQL test database
   - Installs Node.js and Python dependencies
   - Populates test database with sample data
   - Verifies all API endpoints are working
   - Builds frontend application

2. **Deploy Phase**: Runs only on main branch
   - Builds optimized frontend
   - Deploys to GitHub Pages
   - Updates custom domain configuration

### 🗄️ Database Configuration for Production

**Local Development:**
```bash
# Start PostgreSQL container
docker-compose up postgres -d

# Populate database
cd backend && node src/populate-db.js
```

**Production Database Options:**

1. **Heroku Postgres** (Recommended)
   ```bash
   # Add Heroku remote
   heroku git:remote -a your-app-name
   
   # Provision database
   heroku addons:create heroku-postgresql:mini
   ```

2. **Railway PostgreSQL**
   ```bash
   # Deploy to Railway
   railway login
   railway init
   railway add postgresql
   ```

3. **Supabase**
   - Create project at supabase.com
   - Copy connection string
   - Update environment variables

### 📊 Multi-Source Data Integration

**Active Data Sources:**
1. **Carmen de Areco Official Portal** ✅
   - URL: https://carmendeareco.gob.ar/transparencia/
   - Status: Active (645 documents)
   - Update frequency: Real-time scraping

2. **Web Archive (Wayback Machine)** ✅
   - URL: https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/
   - Status: Active (708 documents)
   - Update frequency: Historical archives

3. **Provincial Buenos Aires** ⚠️
   - URL: https://www.gba.gob.ar/transparencia_institucional
   - Status: Monitored (28 documents)
   - Update frequency: Manual verification

### 🔧 Environment Variables

**Production Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# API Configuration  
NODE_ENV=production
API_URL=https://your-backend-domain.com/api

# Frontend
VITE_API_URL=https://your-backend-domain.com/api
VITE_BASE_URL=https://transparency.carmendeareco.gov.ar
```

### 📈 System Monitoring

**Current System Status:**
- **Working Endpoints:** 4/6 (Salaries, Contracts, Budget, Revenue)
- **Total Records:** 433+ active records
- **Data Coverage:** 2009-2025 (17 years)
- **Frontend Integration:** Operational with real-time charts

**API Health Check:**
```bash
curl https://your-backend-domain.com/api/data-integrity
```

### 🔍 Troubleshooting

**Common Issues:**

1. **Database Connection Error:**
   ```bash
   # Check PostgreSQL container
   docker ps | grep postgres
   
   # Restart if needed
   docker-compose restart postgres
   ```

2. **API 500 Errors:**
   ```bash
   # Check backend logs
   cd backend && npm start
   
   # Verify database population
   node src/populate-db.js
   ```

3. **Frontend Build Errors:**
   ```bash
   # Clear node_modules and reinstall
   cd frontend && rm -rf node_modules && npm install
   
   # Build with verbose output
   npm run build -- --verbose
   ```

### 📞 Domain Configuration

**Cloudflare Settings:**
- SSL/TLS: Full (strict)
- Always Use HTTPS: On
- Automatic HTTPS Rewrites: On
- Brotli Compression: On
- Minify CSS/JS/HTML: On

**Custom Domain Verification:**
```bash
# Test DNS resolution
nslookup transparency.carmendeareco.gov.ar

# Verify SSL certificate
curl -I https://transparency.carmendeareco.gov.ar
```

---

**Next Steps:**
1. Configure Cloudflare DNS records
2. Update GitHub repository settings
3. Test deployment pipeline
4. Monitor system health post-deployment