#!/bin/bash
# Setup script for new developers

echo "🚀 Setting up Carmen de Areco Transparency Portal Development Environment"

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Please run this script from the root of the repository"
    exit 1
fi

echo "📦 Installing dependencies..."

# Install frontend dependencies
if [ -d "frontend" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Install backend dependencies
if [ -d "backend" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Install Python dependencies
if [ -f "requirements.txt" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Install development dependencies
if [ -f "requirements-dev.txt" ]; then
    echo "Installing development dependencies..."
    pip install -r requirements-dev.txt
fi

echo "🔧 Setting up database (if needed)..."
if [ -d "backend" ] && [ -f "backend/docker-compose.yml" ]; then
    echo "Starting database with Docker..."
    cd backend
    docker-compose up -d
    cd ..
fi

echo "🧪 Running verification..."
./verify-setup.sh

echo "✅ Setup complete!"
echo ""
echo "You can now start developing:"
echo "  ./dev.sh frontend    # Start frontend development server"
echo "  ./dev.sh backend     # Start backend API server"
echo "  ./dev.sh scraper     # Run data scraper"