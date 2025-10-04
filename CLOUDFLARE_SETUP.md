# Cloudflare Pages Setup Guide

## Current Status
Your Cloudflare Workers & Pages project is connected to: `flongstaff/cda-transparencia`

## Build Configuration

### In Cloudflare Dashboard (Settings → Builds & deployments):

Set the following build settings:

```
Framework preset: None
Build command: ./build.sh
Build output directory: frontend/dist
Root directory: (leave empty)
```

### Environment Variables

Add these in Cloudflare Dashboard (Settings → Environment variables):

| Variable | Value | Note |
|----------|-------|------|
| `NODE_VERSION` | `18` | Required for npm/node |
| `PYTHON_VERSION` | `3.9` | Required for data preprocessing |
| `VITE_API_URL` | `https://api.cda-transparencia.org` | API endpoint |
| `VITE_USE_API` | `true` | Enable API usage |

## Build Process

The [build.sh](build.sh) script runs the following steps:

1. **Install Python dependencies** from `requirements_complete.txt`
2. **Run data preprocessing:**
   - `scripts/generate-data-index.py`
   - `scripts/transform-processed-data.py`
3. **Install frontend dependencies:** `npm install`
4. **Build frontend:** `npm run build:production`
5. **Output:** Built files in `frontend/dist`

## Deployment Flow

```
Push to main → Cloudflare detects change → Runs build.sh → Deploys to Workers
```

## Custom Domain

Your site is accessible at:
- **Workers URL:** https://cda-transparencia.franco-longstaff.workers.dev
- **Custom domain:** https://cda-transparencia.org (configured in Cloudflare DNS)

## Monitoring Deployments

In Cloudflare Dashboard:
1. Go to **Workers & Pages** → **cda-transparencia**
2. Click **Deployments** tab
3. View build logs for each deployment

## Troubleshooting

### Build fails with "command not found: ./build.sh"
- Ensure `build.sh` is executable: `chmod +x build.sh`
- Commit and push: `git add build.sh && git commit -m "Make build.sh executable" && git push`

### Build fails with "pip: command not found"
- Add `PYTHON_VERSION=3.9` environment variable in Cloudflare dashboard
- Python should be automatically available in build environment

### Build fails with "npm: command not found"
- Add `NODE_VERSION=18` environment variable in Cloudflare dashboard
- Node.js should be automatically available in build environment

### Build succeeds but site shows old version
- Check the deployment is marked as "Active" in Cloudflare
- Clear Cloudflare cache
- Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)

### Data preprocessing scripts fail
- Check that `requirements_complete.txt` exists in repository root
- Verify Python scripts are in `scripts/` directory
- Check build logs for specific error messages

## Comparison with GitHub Pages

| Feature | Cloudflare Pages | GitHub Pages |
|---------|------------------|--------------|
| CDN | ✅ Global | ✅ Global |
| HTTPS | ✅ Automatic | ✅ Automatic |
| Build time | ~2-3 minutes | ~30-40 seconds |
| Custom domains | ✅ Unlimited | ✅ 1 per repo |
| Edge functions | ✅ Yes | ❌ No |
| Analytics | ✅ Built-in | ❌ Requires integration |

## Current Setup

You currently have **both** GitHub Pages and Cloudflare Pages deploying:

- **GitHub Pages:** Deploys from `gh-pages` branch to https://cda-transparencia.org
- **Cloudflare Pages:** Builds from `main` branch to Workers

### Recommendation

**Use Cloudflare Pages only** for better performance and features:

1. Disable GitHub Pages deployment
2. Point DNS directly to Cloudflare Workers
3. Use Cloudflare's edge functions and analytics

## Next Steps

1. ✅ Configure build settings in Cloudflare dashboard
2. ✅ Add environment variables
3. ✅ Test deployment
4. ⚠️ Decide: Keep both or use only Cloudflare?
