#!/bin/bash

# Script to set up GitHub Pages deployment for the frontend

# Get the project root directory (parent of scripts directory)
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

echo "Setting up GitHub Pages deployment..."

# Navigate to frontend directory
cd "$PROJECT_ROOT/frontend"

# Check if gh-pages is already installed
if ! npm list gh-pages --depth=0 | grep -q "gh-pages"; then
  echo "Installing gh-pages package..."
  npm install gh-pages --save-dev
else
  echo "gh-pages package already installed."
fi

# Check if deploy script exists in package.json
if ! grep -q "\"deploy\":" package.json; then
  echo "Adding deploy script to package.json..."
  
  # Create a temporary file with the updated package.json
  jq '.scripts.deploy = "gh-pages -d dist"' package.json > package.json.tmp && mv package.json.tmp package.json
  
  # If jq is not available, we'll manually add it
  if [ $? -ne 0 ]; then
    echo "Manually adding deploy script to package.json..."
    # Read the current package.json and add the deploy script
    sed '/"scripts": {/a \    "deploy": "gh-pages -d dist",' package.json > package.json.tmp && mv package.json.tmp package.json
  fi
else
  echo "Deploy script already exists in package.json."
fi

# Check if homepage is set in package.json
if ! grep -q "\"homepage\":" package.json; then
  echo "Setting homepage in package.json..."
  echo "Please enter your GitHub username:"
  read github_username
  
  # Create a temporary file with the updated package.json
  jq ".homepage = \"https://$github_username.github.io/cda-transparencia\"" package.json > package.json.tmp && mv package.json.tmp package.json
  
  # If jq is not available, we'll manually add it
  if [ $? -ne 0 ]; then
    echo "Manually adding homepage to package.json..."
    # Read the current package.json and add the homepage
    sed "/\"name\": \"carmen-de-areco-transparency\",/a \  \"homepage\": \"https://$github_username.github.io/cda-transparencia\"," package.json > package.json.tmp && mv package.json.tmp package.json
  fi
else
  echo "Homepage already set in package.json."
fi

echo "GitHub Pages setup complete!"
echo "To deploy your site:"
echo "1. Build your app: npm run build"
echo "2. Deploy to GitHub Pages: npm run deploy"
echo ""
echo "After deploying, remember to:"
echo "1. Go to your repository Settings"
echo "2. Navigate to Pages section"
echo "3. Select 'gh-pages' branch as source"
echo "4. Enable HTTPS"