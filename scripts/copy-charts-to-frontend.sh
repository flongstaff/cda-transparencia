#!/bin/bash
# Copy generated charts to frontend public directory

echo "Copying generated charts to frontend public directory..."

# Create directories if they don't exist
mkdir -p frontend/public/charts

# Copy all generated charts
cp -r public/charts/* frontend/public/charts/ 2>/dev/null || echo "No charts to copy"

# Copy index page
cp public/index.html frontend/public/ 2>/dev/null || echo "No index page to copy"

echo "✅ Charts copied successfully!"