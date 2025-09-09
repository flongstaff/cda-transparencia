#!/bin/bash

# Deployment script for Carmen de Areco Transparency Portal

echo "🚀 Deploying Carmen de Areco Transparency Portal..."

# Build the frontend
echo "🔨 Building frontend..."
cd frontend
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Deploy to GitHub Pages
echo "📦 Deploying to GitHub Pages..."
npx gh-pages -d dist

# Check if deployment was successful
if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Site is available at: https://flongstaff.github.io/cda-transparencia/"