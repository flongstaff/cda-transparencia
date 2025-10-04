# Deployment Flow

## Overview
This project uses GitHub's **automatic Pages deployment** workflow (`pages-build-deployment`) which deploys from the `gh-pages` branch to the custom domain `cda-transparencia.org` (DNS managed by Cloudflare).

## Active Workflow
- **pages-build-deployment** - GitHub's automatic deployment workflow (deploys from `gh-pages` branch)

## Deployment Process

### Automatic Deployment

When you push to the `gh-pages` branch, GitHub automatically:
1. Detects the push
2. Runs the `pages-build-deployment` workflow
3. Deploys the built files to GitHub Pages
4. Site becomes available at https://cda-transparencia.org (via Cloudflare DNS)

### How to Deploy

To deploy, you need to build locally and push to `gh-pages`:

```bash
# Build the frontend
cd frontend
npm run build:github

# Deploy using gh-pages
npm run deploy
```

Or use the package.json script:
```bash
cd frontend
npm run deploy
```

This will:
1. Build the frontend with GitHub Pages configuration
2. Push the `dist` folder to the `gh-pages` branch
3. Trigger the automatic `pages-build-deployment` workflow

## Disabled Workflows

The following workflows are disabled to prevent conflicts and allow the automatic GitHub Pages deployment:

- **[.github/workflows/deploy.yml](.github/workflows/deploy.yml)** - Disabled (manual only)
- **[.github/workflows/pages.yml](.github/workflows/pages.yml)** - Disabled (manual only)
- **[.github/workflows/cloudflare-deploy.yml](.github/workflows/cloudflare-deploy.yml)** - Disabled (manual only)
- **[.github/workflows/release.yml](.github/workflows/release.yml)** - Disabled (manual only)

## DNS Configuration

The custom domain `cda-transparencia.org` is configured in Cloudflare DNS to point to GitHub Pages:
- GitHub Pages URL: `https://flongstaff.github.io/cda-transparencia/`
- Custom domain: `https://cda-transparencia.org`

## Monitoring Deployments

Check deployment status:
```bash
# GitHub Pages automatic deployments
gh run list --workflow="pages-build-deployment"

# View latest deployment
gh run view
```

## Troubleshooting

### Site not accessible at cda-transparencia.org
1. Check GitHub Pages deployment succeeded: `gh run list --workflow="pages-build-deployment"`
2. Verify DNS settings in Cloudflare dashboard
3. Check GitHub Pages custom domain is set to `cda-transparencia.org` in repository settings
4. Ensure `gh-pages` branch exists and has content

### Deploy script fails
1. Make sure you're in the frontend directory
2. Run `npm install` to ensure gh-pages is installed
3. Try `npm run deploy:force` to force push

## GitHub Pages Settings

Ensure the following settings are configured in your GitHub repository:
1. Go to Settings → Pages
2. Source: Deploy from a branch → `gh-pages` branch → `/ (root)`
3. Custom domain: `cda-transparencia.org`
4. Enforce HTTPS: ✓ Enabled

## Build Configuration

The project uses different build configurations:
- `npm run build:github` - Builds with base path `/cda-transparencia/` for GitHub Pages
- `npm run build:production` - Builds with base path `/` for production
- `npm run build` - Builds with production settings
