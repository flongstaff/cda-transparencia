#!/bin/bash
# deploy-full.sh - Full deployment script for Carmen de Areco Transparency Portal
# This script coordinates the complete deployment process to GitHub Pages with CloudFlare integration

set -e  # Exit on any error

echo "🚀 Starting full deployment process for Carmen de Areco Transparency Portal..."
echo "📅 Timestamp: $(date)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}📊 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Must run from project root directory (where package.json, frontend/, and backend/ exist)"
    exit 1
fi

print_status "Verifying project structure..."
if [ ! -f "frontend/package.json" ]; then
    print_error "Frontend package.json not found"
    exit 1
fi

if [ ! -f "backend/package.json" ]; then
    print_error "Backend package.json not found"
    exit 1
fi

print_success "Project structure verified"

# Step 1: Process all data sources
print_status "Step 1: Processing all data sources..."
cd backend
if [ -f "scripts/enhanced-data-processor.js" ]; then
    node scripts/enhanced-data-processor.js
    print_success "Data processing completed"
else
    print_warning "Enhanced data processor not found, skipping data processing"
fi
cd ..

# Step 2: Synchronize data for deployment
print_status "Step 2: Synchronizing data for deployment..."
if [ -f "scripts/sync-data-for-deployment.js" ]; then
    node scripts/sync-data-for-deployment.js
    print_success "Data synchronization completed"
else
    print_warning "Data synchronization script not found, skipping"
fi

# Step 3: Verify deployment readiness
print_status "Step 3: Verifying deployment readiness..."
if [ -f "scripts/verify-deployment-readiness.js" ]; then
    node scripts/verify-deployment-readiness.js
    print_success "Deployment readiness verification completed"
else
    print_warning "Deployment verification script not found, skipping"
fi

# Step 4: Build frontend for GitHub Pages
print_status "Step 4: Building frontend for GitHub Pages..."
cd frontend
if [ -f "package.json" ]; then
    npm run build:github
    print_success "Frontend build completed"
else
    print_error "Frontend package.json not found"
    exit 1
fi
cd ..

# Step 5: Deploy to GitHub Pages
print_status "Step 5: Deploying to GitHub Pages..."
cd frontend
if [ -f "package.json" ] && [ -d "dist" ]; then
    # Check if there are files to deploy
    if [ "$(ls -A dist)" ]; then
        npm run deploy
        print_success "GitHub Pages deployment completed"
    else
        print_error "No files found in dist directory for deployment"
        exit 1
    fi
else
    print_error "Frontend build directory not found or empty"
    exit 1
fi
cd ..

# Step 6: Deploy CloudFlare Worker (if configured)
print_status "Step 6: Deploying CloudFlare Worker..."
if [ -f "worker.js" ] && command -v wrangler &> /dev/null; then
    wrangler deploy
    print_success "CloudFlare Worker deployment completed"
elif [ -f "worker.js" ]; then
    print_warning "Wrangler CLI not found. To deploy CloudFlare Worker, install with: npm install -g wrangler"
    print_warning "Then authenticate with: wrangler login"
    print_warning "Finally deploy with: wrangler deploy"
else
    print_warning "CloudFlare Worker script not found, skipping worker deployment"
fi

# Step 7: Final verification
print_status "Step 7: Performing final verification..."
if [ -f "scripts/verify-deployment-readiness.js" ]; then
    node scripts/verify-deployment-readiness.js
    print_success "Final verification completed"
else
    print_warning "Final verification script not found, skipping"
fi

# Completion message
echo ""
print_success "🎉 Full deployment process completed successfully!"
echo ""
print_status "Deployment Summary:"
echo "  - Data processing: Completed"
echo "  - Data synchronization: Completed" 
echo "  - Frontend build: Completed ($(du -sh frontend/dist | cut -f1) bytes)"
echo "  - GitHub Pages deployment: Completed"
echo "  - CloudFlare Worker deployment: Attempted"
echo ""
print_status "Next steps:"
echo "  - Visit your GitHub Pages site at: https://$(git config --get remote.origin.url | sed 's/.*://' | sed 's/\.git$//' | cut -d'/' -f1).github.io/$(basename $(git rev-parse --show-toplevel))"
echo "  - Monitor deployment status in GitHub Actions"
echo "  - Verify CloudFlare Worker deployment in CloudFlare dashboard"
echo ""
print_success "Deployment completed at: $(date)"