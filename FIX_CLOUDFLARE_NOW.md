# 🚨 FIX CLOUDFLARE PAGES BUILD - DO THIS NOW

## Problem
All Cloudflare Pages builds are failing because the build settings are incorrect.

**Current (WRONG) settings:**
- Build command: (empty)
- Deploy command: `npx wrangler deploy` ← This is for Workers, not Pages!

## Solution - Update Cloudflare Dashboard Settings

### Step 1: Go to Cloudflare Dashboard

1. Open: https://dash.cloudflare.com
2. Navigate to: **Workers & Pages** → **cda-transparencia**
3. Click: **Settings** tab
4. Click: **Builds & deployments**

### Step 2: Update Production Build Settings

Click **"Edit configuration"** next to Production deployments and set:

```
Framework preset: None
Build command: ./build.sh
Build output directory: frontend/dist
Root directory: (leave empty)
```

### Step 3: Add Environment Variables

Still in Settings, go to **Environment variables** → **Production**

Add these variables:

| Variable Name | Value |
|---------------|-------|
| `NODE_VERSION` | `18` |
| `PYTHON_VERSION` | `3.9` |

Click **Save** after adding each one.

### Step 4: Trigger Retry

Option A - In Cloudflare Dashboard:
1. Go to **Deployments** tab
2. Find the latest failed build
3. Click **"Retry deployment"**

Option B - Push a new commit:
```bash
git commit --allow-empty -m "Trigger Cloudflare rebuild"
git push origin main
```

## Why It's Failing

The build log shows:
```
Deploy command: npx wrangler deploy
```

This command is for **Cloudflare Workers**, not **Cloudflare Pages**.

For Pages, you don't use `wrangler deploy` - you use the build settings in the dashboard.

## Expected Result

After fixing the settings, the build should:
1. ✅ Run `./build.sh`
2. ✅ Install Python deps
3. ✅ Run data preprocessing
4. ✅ Build frontend
5. ✅ Deploy to Pages

## Alternative: Use GitHub Pages Instead

If Cloudflare Pages continues to have issues, you can use GitHub Pages (which is already working):

```bash
cd frontend
npm run deploy
```

This deploys to GitHub Pages at https://cda-transparencia.org (already configured).

## Quick Test

After fixing Cloudflare settings, test manually:

```bash
cd frontend
npm run build:production
cd ..
npx wrangler pages deploy frontend/dist --project-name=cda-transparencia --commit-dirty=true
```

This bypasses the automatic build and deploys directly.
