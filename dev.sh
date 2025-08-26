#!/bin/bash
# Development script for Carmen de Areco Transparency Portal

echo "🚀 Starting Carmen de Areco Transparency Portal Development Environment"

# Function to start frontend development server
start_frontend() {
    echo "🌐 Starting frontend development server..."
    cd frontend
    npm run dev &
    cd ..
}

# Function to start backend API
start_backend() {
    echo "⚙️ Starting backend API server..."
    cd backend
    npm start &
    cd ..
}

# Function to run data scraper
run_scraper() {
    echo "🔍 Running data scraper..."
    python src/live_scrape.py
}

# Function to build frontend for production
build_frontend() {
    echo "🏗️ Building frontend for production..."
    cd frontend
    npx vite build
    cd ..
}

# Function to test frontend build
test_build() {
    echo "✅ Testing frontend build..."
    cd frontend
    npx vite build
    if [ $? -eq 0 ]; then
        echo "✅ Frontend build successful"
    else
        echo "❌ Frontend build failed"
    fi
    cd ..
}

# Display help
show_help() {
    echo "Carmen de Areco Transparency Portal - Development Script"
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  frontend    - Start frontend development server"
    echo "  backend     - Start backend API server"
    echo "  scraper     - Run data scraper"
    echo "  build       - Build frontend for production"
    echo "  test        - Test frontend build"
    echo "  help        - Show this help message"
}

# Main script logic
case "$1" in
    frontend)
        start_frontend
        ;;
    backend)
        start_backend
        ;;
    scraper)
        run_scraper
        ;;
    build)
        build_frontend
        ;;
    test)
        test_build
        ;;
    help)
        show_help
        ;;
    *)
        show_help
        ;;
esac