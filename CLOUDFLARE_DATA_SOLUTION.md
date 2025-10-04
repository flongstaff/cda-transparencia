# Cloudflare Pages Data Size Solution

## Problem

Cloudflare Pages has file size limitations:
- **Maximum file size:** 25 MB per file
- **Your data directory:** 293 MB total
- **Largest file:** `pdf_165_ORDENANZA-FISCAL-3198-23.pdf` (42.6 MB)

This prevents deploying the full `data/` directory to Cloudflare Pages.

## Solution

### Option 1: Deploy Without Data (Current)

Deploy the app without the data directory:

```bash
# Temporarily remove data
mv frontend/dist/data frontend/dist-data-backup

# Deploy
npx wrangler pages deploy frontend/dist --project-name=cda-transparencia --commit-dirty=true

# Restore data
mv frontend/dist-data-backup frontend/dist/data
```

**Pros:**
- Fast deployment
- No size limits

**Cons:**
- Data not available on Cloudflare Pages
- Need external hosting for data

### Option 2: Use External Data Hosting (Recommended)

Host large files externally and load them via API:

1. **Upload large files to:**
   - R2 (Cloudflare Object Storage)
   - S3 (Amazon)
   - GitHub Releases
   - Google Cloud Storage

2. **Update app to fetch data from external URLs**

3. **Keep small JSON files in Pages deployment**

### Option 3: Split Data by Size

Only deploy files under 25 MB:

```bash
# Find and remove large files before build
find frontend/dist/data -type f -size +25M -delete

# Deploy
npx wrangler pages deploy frontend/dist --project-name=cda-transparencia
```

### Option 4: Use Cloudflare R2 for PDFs

Store PDFs in Cloudflare R2 (object storage):

1. Create R2 bucket: `cda-transparencia-data`
2. Upload PDFs to R2
3. Serve via R2 public URL or custom domain
4. Update app to load PDFs from R2

## Recommended Approach

**Use Cloudflare R2** for PDF storage:

```bash
# Create R2 bucket
npx wrangler r2 bucket create cda-transparencia-data

# Upload PDFs
npx wrangler r2 object put cda-transparencia-data/pdfs/file.pdf --file=./data/pdfs/file.pdf

# Access via URL
https://pub-xxxxx.r2.dev/pdfs/file.pdf
```

Then update your app to load PDFs from R2 instead of local files.

## Current Deployment

✅ **Deployed successfully:** https://16b42e57.cda-transparencia.pages.dev
⚠️ **Without data directory** (293 MB excluded)

## Next Steps

1. Decide on data hosting strategy
2. Implement external data loading
3. Update build process to exclude large files
4. Re-deploy with full functionality
