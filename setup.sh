#!/bin/bash

# 🚀 Carmen de Areco Transparency Portal - Quick Setup Script
# This script helps you set up the deployment pipeline quickly

set -e  # Exit on any error

echo "🏛️ Carmen de Areco Transparency Portal Setup"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
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

# Check if Node.js is installed
check_nodejs() {
    print_step "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        echo "Download from: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION is installed"
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    # Root dependencies
    npm install
    
    # Frontend dependencies
    cd frontend
    npm install
    cd ..
    
    print_success "All dependencies installed"
}

# Build the project
build_project() {
    print_step "Building the project..."
    cd frontend
    npm run build
    cd ..
    print_success "Project built successfully"
}

# Check for Wrangler CLI
check_wrangler() {
    print_step "Checking Wrangler CLI..."
    if ! command -v wrangler &> /dev/null; then
        print_warning "Wrangler CLI not found. Installing..."
        npm install -g wrangler
    fi
    
    WRANGLER_VERSION=$(wrangler --version)
    print_success "Wrangler $WRANGLER_VERSION is ready"
}

# Setup environment file
setup_env_file() {
    print_step "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_warning "Created .env file from template"
        print_warning "Please edit .env file with your Cloudflare credentials"
        echo ""
        echo "You need to:"
        echo "1. Get your Cloudflare API Token: https://dash.cloudflare.com/profile/api-tokens"
        echo "2. Get your Account ID from your Cloudflare dashboard"
        echo "3. Update the .env file with these values"
    else
        print_success "Environment file already exists"
    fi
}

# Cloudflare login
cloudflare_login() {
    print_step "Checking Cloudflare authentication..."
    
    if ! wrangler whoami &> /dev/null; then
        print_warning "Not logged into Cloudflare"
        echo "Run: wrangler login"
        echo "Or set CLOUDFLARE_API_TOKEN in your .env file"
    else
        WHOAMI=$(wrangler whoami)
        print_success "Logged into Cloudflare: $WHOAMI"
    fi
}

# Test local development
test_local() {
    print_step "Testing local development server..."
    echo ""
    echo "To test locally:"
    echo "💻 Frontend: npm run dev"
    echo "🌐 Worker:   npm run preview"
    echo ""
}

# Deployment instructions
deployment_instructions() {
    print_step "Deployment Instructions"
    echo ""
    echo "🚀 Deploy Commands:"
    echo "   Development: npm run deploy:dev"
    echo "   Staging:     npm run deploy:staging"
    echo "   Production:  npm run deploy:prod"
    echo ""
    echo "📖 For complete setup guide, see: DEPLOYMENT_GUIDE.md"
    echo ""
    echo "🔧 GitHub Actions Setup:"
    echo "   1. Add CLOUDFLARE_API_TOKEN to GitHub Secrets"
    echo "   2. Add CLOUDFLARE_ACCOUNT_ID to GitHub Secrets"
    echo "   3. Push to main branch for automatic deployment"
    echo ""
}

# Main setup process
main() {
    echo "Starting setup process..."
    echo ""
    
    check_nodejs
    install_dependencies
    build_project
    check_wrangler
    setup_env_file
    cloudflare_login
    test_local
    deployment_instructions
    
    echo ""
    print_success "Setup completed successfully! 🎉"
    echo ""
    echo "Next steps:"
    echo "1. Configure your .env file with Cloudflare credentials"
    echo "2. Run 'npm run preview' to test locally"
    echo "3. Set up GitHub Secrets for automatic deployment"
    echo "4. Push to your repository to trigger deployment"
    echo ""
    echo "For help, see DEPLOYMENT_GUIDE.md or open an issue on GitHub."
}

# Run main function
main