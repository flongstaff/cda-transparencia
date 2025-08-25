# 🚀 Carmen de Areco Transparency Portal - Free Deployment Guide

## Overview

This guide provides complete instructions for deploying the Carmen de Areco Transparency Portal using **100% free infrastructure**:

- 🌐 **Cloudflare Workers** (Free: 100,000 requests/day)
- ⚡ **GitHub Actions** (Free: 2,000 minutes/month)
- 📊 **GitHub Pages** (Free hosting)
- 🔒 **Free SSL certificates** (via Cloudflare)
- 🌍 **Global CDN** (via Cloudflare)

**Total Cost: $0/month** ✨

## 🏗️ Architecture

```
GitHub Repository → GitHub Actions → Cloudflare Workers → Global CDN
     ↓                    ↓               ↓                ↓
  Code Push        Build & Test     Deploy & Serve    Users Worldwide
```

## 📋 Prerequisites

1. **GitHub Account** (free)
2. **Cloudflare Account** (free)
3. **Domain name** (optional - can use `*.workers.dev` subdomain for free)

## 🚀 Step-by-Step Setup

### Step 1: Cloudflare Setup

1. **Create Cloudflare Account**
   ```bash
   # Go to https://cloudflare.com and sign up (free)
   ```

2. **Get API Token**
   - Go to `My Profile` → `API Tokens`
   - Click `Create Token`
   - Use `Custom Token` template with these permissions:
     ```
     Zone: Zone Settings:Read, Zone:Read
     Account: Cloudflare Workers:Edit
     ```
   - Save the token securely

3. **Get Account ID**
   - Go to your Cloudflare dashboard
   - Copy your `Account ID` from the right sidebar

### Step 2: GitHub Repository Setup

1. **Fork/Clone Repository**
   ```bash
   git clone https://github.com/your-org/cda-transparencia.git
   cd cda-transparencia
   ```

2. **Add GitHub Secrets**
   - Go to your repository → `Settings` → `Secrets and variables` → `Actions`
   - Add these secrets:
     ```
     CLOUDFLARE_API_TOKEN: [your_api_token_from_step_1]
     CLOUDFLARE_ACCOUNT_ID: [your_account_id_from_step_1]
     ```

### Step 3: Configure Deployment

1. **Update wrangler.toml** (if using custom domain)
   ```toml
   # Edit wrangler.toml
   [env.production]
   name = "carmen-de-areco-transparency-prod"
   routes = [
     { pattern = "your-domain.com/*", zone_name = "your-domain.com" }
   ]
   ```

2. **Verify GitHub Actions**
   ```bash
   # The workflow file is already configured at:
   .github/workflows/deploy.yml
   ```

### Step 4: Deploy

1. **Push to Main Branch**
   ```bash
   git add .
   git commit -m "🚀 Initial deployment setup"
   git push origin main
   ```

2. **Monitor Deployment**
   - Go to your repository → `Actions` tab
   - Watch the deployment progress
   - All steps should complete successfully ✅

## 🌐 Environments

The setup includes three environments:

### 🔴 Production (`main` branch)
- **URL**: `https://carmen-de-areco-transparency-prod.workers.dev`
- **Custom Domain**: Your production domain
- **Auto-deploys**: On push to `main`

### 🟡 Staging (`staging` branch)
- **URL**: `https://carmen-de-areco-transparency-staging.workers.dev`
- **Auto-deploys**: On push to `staging`

### 🟢 Development (`development` branch)
- **URL**: `https://carmen-de-areco-transparency-dev.workers.dev`
- **Auto-deploys**: On push to `development`

## 📊 Features Included

### ✅ **Automatic Deployments**
- Build and test on every push
- Deploy to environment based on branch
- Zero-downtime deployments

### ✅ **Security**
- HTTPS by default (free SSL)
- Security headers configured
- Vulnerability scanning with Trivy
- Content Security Policy

### ✅ **Performance**
- Global CDN (190+ locations)
- Static asset caching
- Lighthouse performance audits
- Progressive Web App support

### ✅ **Monitoring**
- Deployment status notifications
- Performance audits on production
- Error tracking and logging

## 🔧 Configuration

### Environment Variables

Configure these in your Cloudflare Worker dashboard:

```toml
[vars]
ENVIRONMENT = "production"
API_BASE_URL = "https://api.cda-transparencia.org"
CONTACT_EMAIL = "transparencia@cda-transparencia.org"
SITE_URL = "https://cda-transparencia.org"
ANALYTICS_ID = "" # Optional Google Analytics ID
```

### Custom Domain Setup - cda-transparencia.org

1. **Add Domain to Cloudflare**
   - Go to Cloudflare dashboard
   - Click `Add Site`
   - Enter `cda-transparencia.org`
   - Follow the instructions to update nameservers at your domain registrar

2. **Configure DNS Records**
   ```
   Type: CNAME
   Name: @ (root domain)
   Target: carmen-de-areco-transparency-prod.workers.dev
   Proxied: Yes (orange cloud enabled)
   TTL: Auto
   
   Type: CNAME  
   Name: www
   Target: cda-transparencia.org
   Proxied: Yes (orange cloud enabled)
   TTL: Auto
   ```

3. **Update wrangler.toml**
   ```toml
   [env.production]
   name = "carmen-de-areco-transparency-prod"
   routes = [
     { pattern = "cda-transparencia.org/*", zone_name = "cda-transparencia.org" },
     { pattern = "www.cda-transparencia.org/*", zone_name = "cda-transparencia.org" }
   ]
   ```

4. **SSL Configuration**
   - Cloudflare automatically provides free SSL certificates
   - Go to `SSL/TLS` → `Overview` 
   - Set encryption mode to `Full (strict)` for maximum security
   - Enable `Always Use HTTPS` in `SSL/TLS` → `Edge Certificates`

5. **Additional Security Settings**
   - Go to `Security` → `Settings`
   - Set Security Level to `Medium` or `High`
   - Enable `Browser Integrity Check`
   - Configure `Firewall Rules` if needed for geographic restrictions

6. **Performance Optimization**
   - Go to `Speed` → `Optimization`
   - Enable `Auto Minify` for HTML, CSS, and JavaScript
   - Enable `Brotli` compression
   - Set appropriate `Browser Cache TTL` (4 hours recommended)

7. **Verify Domain Setup**
   ```bash
   # Test domain resolution
   nslookup cda-transparencia.org
   
   # Test SSL certificate
   curl -I https://cda-transparencia.org
   
   # Test redirect from www
   curl -I https://www.cda-transparencia.org
   ```

## 🚨 Monitoring & Maintenance

### Performance Monitoring
- **Lighthouse CI**: Runs on every production deployment
- **Web Vitals**: Core performance metrics tracked
- **Uptime**: 99.9% SLA with Cloudflare

### Cost Monitoring
```
Cloudflare Workers Free Tier:
✅ 100,000 requests/day (3M/month)
✅ 10ms CPU time per request
✅ Global CDN included

GitHub Actions Free Tier:
✅ 2,000 minutes/month
✅ Unlimited public repositories
```

### Scaling Options

**When you exceed free limits:**

1. **Cloudflare Workers Paid ($5/month)**
   - 10 million requests/month
   - 50ms CPU time per request
   - Additional features

2. **GitHub Actions ($0.008/minute)**
   - Only charged for usage beyond free tier

## 🛠️ Local Development

```bash
# Install dependencies
cd frontend
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Test Cloudflare Worker locally
wrangler dev
```

## 📞 Support & Troubleshooting

### Common Issues

**Deployment fails with "Wrangler not found"**
```bash
# Solution: Check wrangler.toml configuration
wrangler whoami
```

**SSL Certificate errors**
```bash
# Solution: Ensure domain is proxied through Cloudflare
# Check DNS settings in Cloudflare dashboard
```

**Build fails on GitHub Actions**
```bash
# Solution: Check Node.js version compatibility
# Verify package.json dependencies
```

### Get Help

1. **GitHub Issues**: Report bugs and feature requests
2. **Documentation**: Check `/docs` directory
3. **Community**: Join discussions in repository

## 🔄 Update Process

### Automated Updates
```bash
# 1. Make changes locally
git add .
git commit -m "✨ New feature"

# 2. Push to appropriate branch
git push origin staging  # Test in staging first
git push origin main     # Deploy to production
```

### Manual Updates
```bash
# Deploy directly using Wrangler CLI
wrangler deploy --env production
```

## 🎯 Best Practices

### Security
- ✅ Keep secrets in GitHub repository settings
- ✅ Use environment-specific configurations
- ✅ Enable Cloudflare security features
- ✅ Regular dependency updates

### Performance
- ✅ Optimize images and assets
- ✅ Enable compression
- ✅ Use appropriate caching headers
- ✅ Monitor Core Web Vitals

### Maintenance
- ✅ Monitor deployment notifications
- ✅ Review Lighthouse reports
- ✅ Update dependencies regularly
- ✅ Test in staging before production

## 🌟 Advanced Features

### Coming Soon
- 🗄️ **Cloudflare D1** (Free SQLite database)
- 📧 **Email Workers** (Contact form processing)
- 🔐 **KV Storage** (Caching and sessions)
- 📊 **Analytics** (Visitor tracking)

---

## ✅ Deployment Checklist

- [ ] Cloudflare account created
- [ ] API tokens configured
- [ ] GitHub secrets added
- [ ] Repository forked/cloned
- [ ] Domain configured (optional)
- [ ] First deployment successful
- [ ] SSL certificate active
- [ ] Performance audit passed
- [ ] Custom domain working (if applicable)

**🎉 Your Carmen de Areco Transparency Portal is now live and completely free!**

For support or questions, please open an issue in the GitHub repository.