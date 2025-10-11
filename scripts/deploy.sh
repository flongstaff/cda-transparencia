#!/bin/bash
# deploy.sh - Deployment script for Carmen de Areco Transparency Portal

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Function to check dependencies
check_dependencies() {
    echo "🔍 Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is required but not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is required but not installed"
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 is required but not installed"
        exit 1
    fi
    
    echo "✅ All dependencies found"
}

# Function to install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    # Install Python dependencies
    if [ -f "requirements_complete.txt" ]; then
        pip install -r requirements_complete.txt || echo "⚠️ Warning: Could not install Python dependencies"
    fi
    
    # Install frontend dependencies
    if [ -d "frontend" ]; then
        cd frontend
        npm ci --legacy-peer-deps
        cd ..
    fi
    
    echo "✅ Dependencies installed"
}

# Function to run data preprocessing
preprocess_data() {
    echo "🔄 Running data preprocessing..."
    
    # Run data scripts
    if [ -f "scripts/generate-data-index.js" ]; then
        node scripts/generate-data-index.js || echo "⚠️ Warning: Could not generate data index"
    fi
    
    if [ -f "scripts/transform-processed-data.js" ]; then
        node scripts/transform-processed-data.js || echo "⚠️ Warning: Could not transform processed data"
    fi
    
    echo "✅ Data preprocessing completed"
}

# Function to build for GitHub Pages
build_github() {
    echo "🏗️ Building for GitHub Pages..."
    
    if [ -d "frontend" ]; then
        cd frontend
        npm run build:github
        cd ..
    else
        echo "❌ Frontend directory not found"
        exit 1
    fi
    
    echo "✅ GitHub Pages build completed"
}

# Function to build for custom domain
build_custom() {
    echo "🏗️ Building for custom domain..."
    
    if [ -d "frontend" ]; then
        cd frontend
        npm run build:custom-domain
        cd ..
    else
        echo "❌ Frontend directory not found"
        exit 1
    fi
    
    echo "✅ Custom domain build completed"
}

# Function to start development server
start_dev() {
    echo "🚀 Starting development servers..."
    
    # Start backend proxy server in background
    cd backend
    node proxy-server.js &
    BACKEND_PID=$!
    cd ..
    
    echo "✅ Backend proxy server started (PID: $BACKEND_PID)"
    
    # Start frontend development server
    cd frontend
    npm run dev
}

# Function to deploy to GitHub Pages
deploy_github() {
    echo "📤 Deploying to GitHub Pages..."
    
    if [ -d "frontend" ]; then
        cd frontend
        npm run deploy
        cd ..
    else
        echo "❌ Frontend directory not found"
        exit 1
    fi
    
    echo "✅ Deployed to GitHub Pages"
}

# Function to deploy to Cloudflare
deploy_cloudflare() {
    echo "⛅ Deploying to Cloudflare..."
    
    # This would typically be done through GitHub Actions
    echo "ℹ️ Cloudflare deployment is handled through GitHub Actions"
    echo "   See .github/workflows/cloudflare-deploy.yml"
}

# Main execution
main() {
    case "$1" in
        "install")
            check_dependencies
            install_dependencies
            ;;
        "preprocess")
            preprocess_data
            ;;
        "build")
            build_github
            ;;
        "build:custom")
            build_custom
            ;;
        "dev")
            start_dev
            ;;
        "deploy")
            check_dependencies
            install_dependencies
            preprocess_data
            build_github
            deploy_github
            ;;
        "deploy:custom")
            check_dependencies
            install_dependencies
            preprocess_data
            build_custom
            ;;
        "deploy:cloudflare")
            deploy_cloudflare
            ;;
        *)
            echo "Usage: $0 {install|preprocess|build|build:custom|dev|deploy|deploy:custom|deploy:cloudflare}"
            echo ""
            echo "Commands:"
            echo "  install              Install all dependencies"
            echo "  preprocess           Run data preprocessing scripts"
            echo "  build                Build for GitHub Pages"
            echo "  build:custom         Build for custom domain"
            echo "  dev                  Start development servers"
            echo "  deploy               Full deployment to GitHub Pages"
            echo "  deploy:custom        Build for custom domain deployment"
            echo "  deploy:cloudflare    Deploy to Cloudflare (via GitHub Actions)"
            echo ""
            echo "Environment Variables:"
            echo "  VITE_API_URL         API endpoint URL"
            echo "  VITE_USE_API         Whether to use API (true/false)"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"