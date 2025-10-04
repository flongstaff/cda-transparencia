# Deployment Flow

## Overview
This project deploys to **GitHub Pages** which is accessible via the custom domain `cda-transparencia.org` (DNS managed by Cloudflare).

## Active Workflow
- **[.github/workflows/deploy.yml](.github/workflows/deploy.yml)** - Primary deployment workflow

## Deployment Process

### When you push to `main`:

1. **[deploy.yml](.github/workflows/deploy.yml)** workflow triggers automatically
2. Runs Python data preprocessing scripts (`generate-data-index.py`, `transform-processed-data.py`)
3. Builds the frontend with the GitHub Pages configuration (`npm run build:github`)
4. Deploys the built files to GitHub Pages
5. Site becomes available at https://cda-transparencia.org (via Cloudflare DNS)

### Manual Deployment

You can also trigger deployments manually:
```bash
gh workflow run deploy.yml
```

## Disabled Workflows

The following workflows are disabled to prevent conflicts:

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
# GitHub Pages deployments
gh run list --workflow=deploy.yml

# View latest deployment
gh run view
```

## Troubleshooting

### Site not accessible at cda-transparencia.org
1. Check GitHub Pages deployment succeeded: `gh run list --workflow=deploy.yml`
2. Verify DNS settings in Cloudflare dashboard
3. Check GitHub Pages custom domain is set to `cda-transparencia.org` in repository settings

### Build failures
1. Check workflow logs: `gh run view --log`
2. Verify all dependencies are in `requirements_complete.txt`
3. Ensure Python and Node.js versions match workflow requirements

## GitHub Pages Settings

Ensure the following settings are configured in your GitHub repository:
1. Go to Settings → Pages
2. Source: Deploy from a branch → `gh-pages` branch
3. Custom domain: `cda-transparencia.org`
4. Enforce HTTPS: ✓ Enabled
