# Deployment Status & Configuration

**Last Updated:** October 4, 2025
**Status:** ✅ Cloudflare Pages Active

## Current Deployment Setup

### Primary Deployment: Cloudflare Pages

Your site is deployed via **Cloudflare Pages**, NOT GitHub Pages.

- **Source:** `main` branch (automatic builds on push)
- **Build Command:** `./build.sh`
- **Output Directory:** `frontend/dist`
- **Production URL:** https://cda-transparencia.org
- **Pages URL:** https://cda-transparencia.pages.dev
- **Preview URLs:** `[commit].cda-transparencia.pages.dev`

### Build Process

Cloudflare Pages automatically builds when you push to `main`:

```bash
git push origin main
→ Cloudflare detects push
→ Runs ./build.sh
→ Deploys to production
```

The [build.sh](build.sh) script:
1. Installs Python dependencies
2. Runs data preprocessing scripts
3. Installs frontend dependencies
4. Builds frontend for production
5. Outputs to `frontend/dist`

### Secondary Deployment: GitHub Pages (Inactive for custom domain)

You also have GitHub Pages configured, but it's **NOT** serving `cda-transparencia.org`:

- **Source:** `gh-pages` branch
- **URL:** https://flongstaff.github.io/cda-transparencia/
- **Custom Domain:** Configured but overridden by Cloudflare DNS
- **Workflow:** `pages-build-deployment` (automatic)

## Which Deployment is Serving Your Site?

**Answer:** Cloudflare Pages

Evidence:
```bash
$ curl -I https://cda-transparencia.org
server: cloudflare
cf-cache-status: DYNAMIC
```

Your DNS is pointing to Cloudflare Pages, so that's what users see.

## Recent Deployments (Cloudflare Pages)

| Commit | Message | Status | Age |
|--------|---------|--------|-----|
| `c4ffa370` | Fix treasury data field names | ✅ Deployed | 3 days ago |
| `4bbb909d` | Multi-year data preloading | ✅ Deployed | 3 days ago |
| `0cd4aad3` | Update data files | ✅ Deployed | 5 days ago |
| `ca4f585` | Configure Cloudflare Pages build | ⏳ Building | Just now |

## Latest Build Status

**Current build:** `ca4f585` - Configure Cloudflare Pages build process
**Status:** 🔨 In Progress (31 seconds so far)
**Expected:** Should complete in ~2-3 minutes

### What's Building

The latest commits include:
1. Cloudflare Pages build configuration (`build.sh`, `wrangler.toml`)
2. Deployment documentation
3. App.tsx syntax fixes
4. GitHub Pages workflow configuration

## How to Deploy

### Option 1: Automatic (Recommended)
Just push to main:
```bash
git push origin main
```
Cloudflare Pages will automatically build and deploy.

### Option 2: Manual via Frontend
Build and push to gh-pages (for GitHub Pages):
```bash
cd frontend
npm run deploy
```
This updates GitHub Pages but **NOT** your custom domain.

## Monitoring Deployments

### Cloudflare Pages
1. Go to Cloudflare dashboard → Workers & Pages → cda-transparencia
2. Click "Deployments" tab
3. View build logs and status

### GitHub Pages
```bash
gh run list --workflow="pages-build-deployment"
gh run view --log
```

## Recommendation

**Choose ONE deployment method:**

### Keep Cloudflare Pages (Current)
✅ **Pros:**
- Faster edge network
- Better analytics
- Edge functions available
- Automatic builds from main

❌ **Cons:**
- Longer build times (~2-3 min)
- Requires Python + Node.js in build

**Current Status:** ✅ This is what's active

### Switch to GitHub Pages
✅ **Pros:**
- Faster builds (~30 sec)
- Simpler configuration
- No build setup needed

❌ **Cons:**
- No edge functions
- No built-in analytics
- Need to run `npm run deploy` manually

## Next Steps

1. ⏳ **Wait** for current Cloudflare build to complete
2. ✅ **Verify** site shows latest version at cda-transparencia.org
3. 🎯 **Decide:** Keep Cloudflare Pages or switch to GitHub Pages?
4. 📝 **Update** DNS and disable unused deployment method

## Cloudflare Pages Settings

To ensure builds work correctly, verify these settings in Cloudflare Dashboard:

**Build settings:**
- Build command: `./build.sh`
- Build output directory: `frontend/dist`
- Root directory: `/` (or leave empty)

**Environment variables:**
- `NODE_VERSION`: `18`
- `PYTHON_VERSION`: `3.9`
- `VITE_API_URL`: `https://api.cda-transparencia.org`
- `VITE_USE_API`: `true`

---

## Summary

- ✅ Your site IS deploying to Cloudflare Pages
- ✅ Custom domain `cda-transparencia.org` is working
- ⏳ Latest build is in progress (should complete soon)
- ❓ GitHub Pages is configured but not serving the custom domain
- 🎯 Decision needed: Use only Cloudflare OR only GitHub Pages
