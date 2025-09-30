# Carmen de Areco Transparency Portal - Cloudflare Deployment

This directory contains the optimized deployment files for Cloudflare Pages.

## 🌐 Live Demo

- **Portal**: [https://cda-transparencia.org](https://cda-transparencia.org)

## Features

- **Optimized for Cloudflare Pages**: Lightweight deployment with minimal assets
- **Static Site Generation**: Pre-rendered pages for fast loading
- **Edge Network**: Global distribution through Cloudflare's CDN
- **Automatic HTTPS**: Free SSL certificates
- **Custom Domain**: cda-transparencia.org

## Deployment Process

1. GitHub Actions builds the frontend in the main workflow
2. Built files are copied to this directory
3. Cloudflare Pages automatically deploys from this directory

## Files Structure

```
├── public/              # Built static files
│   ├── index.html       # Main entry point
│   ├── assets/          # Bundled CSS/JS
│   ├── data/            # Processed data files
│   └── ...
├── _routes.json         # Routing configuration
└── deployment-manifest.json # Deployment metadata
```

## Optimization

- Reduced asset size by excluding heavy data files
- Optimized for edge delivery
- SPA routing support
- Custom domain configuration

## Manual Deployment

```bash
# From the root directory
cd cloudflare-deploy
# Deploy using Wrangler CLI
npx wrangler pages deploy public --project-name=cda-transparencia
```