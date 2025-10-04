# Cloudflare Pages - Quick Configuration Reference

## ⚠️ IMPORTANT: Manual Configuration Required

The build failed because Cloudflare Pages needs manual configuration in the dashboard.

## Steps to Fix

### 1. Go to Cloudflare Dashboard
Navigate to: **Workers & Pages** → **cda-transparencia** → **Settings** → **Builds & deployments**

### 2. Set Build Configuration

Click "Configure Production deployments" and set:

| Setting | Value |
|---------|-------|
| **Framework preset** | None |
| **Build command** | `./build.sh` |
| **Build output directory** | `frontend/dist` |
| **Root directory** | (leave empty) |

### 3. Add Environment Variables

Go to **Settings** → **Environment variables** → **Production**

Click "Add variable" for each:

| Variable Name | Value |
|---------------|-------|
| `NODE_VERSION` | `18` |
| `PYTHON_VERSION` | `3.9` |

### 4. Retry Deployment

After saving the configuration:
- Go to **Deployments** tab
- Find the failed build
- Click "Retry deployment"

OR simply push a new commit:
```bash
git commit --allow-empty -m "Trigger Cloudflare rebuild"
git push origin main
```

## Why This Is Needed

- ❌ **wrangler.toml** is for Cloudflare **Workers** (removed)
- ✅ **Cloudflare Pages** uses dashboard configuration
- ✅ **build.sh** handles the actual build process

## Verification

After configuration:
1. Push should trigger automatic build
2. Build should complete in ~2-3 minutes
3. Site updates at https://cda-transparencia.org

## Current Build Error

The error you're seeing:
```
Failed: error occurred while running deploy command
```

This happens because Cloudflare tried to use wrangler (Workers tool) instead of the Pages build system. Now that wrangler.toml is removed, you just need to set the dashboard configuration above.
