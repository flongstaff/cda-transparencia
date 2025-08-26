#!/bin/bash
# Verification script for Carmen de Areco Transparency Portal

echo "🔍 Verifying Carmen de Areco Transparency Portal Setup"

# Check if required tools are installed
echo "Checking required tools..."

# Check Node.js
if command -v node &> /dev/null
then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js: Not found"
    exit 1
fi

# Check Python
if command -v python3 &> /dev/null
then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python: $PYTHON_VERSION"
else
    echo "❌ Python: Not found"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null
then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm: Not found"
    exit 1
fi

# Check frontend directory
if [ -d "frontend" ]; then
    echo "✅ Frontend directory exists"
else
    echo "❌ Frontend directory not found"
    exit 1
fi

# Check backend directory
if [ -d "backend" ]; then
    echo "✅ Backend directory exists"
else
    echo "❌ Backend directory not found"
    exit 1
fi

# Check if frontend can be built
echo "Testing frontend build..."
cd frontend
if npx vite build &> /dev/null; then
    echo "✅ Frontend builds successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

# Check if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "✅ requirements.txt exists"
else
    echo "❌ requirements.txt not found"
    exit 1
fi

# Check if data directory exists
if [ -d "data" ]; then
    echo "✅ Data directory exists"
else
    echo "❌ Data directory not found"
    exit 1
fi

echo "🎉 All verification checks passed!"
echo ""
echo "🚀 You're ready to develop the Carmen de Areco Transparency Portal!"
echo ""
echo "To start development:"
echo "  ./dev.sh frontend    # Start frontend development server"
echo "  ./dev.sh backend     # Start backend API server"
echo "  ./dev.sh scraper     # Run data scraper"
echo ""
echo "To build for production:"
echo "  ./dev.sh build       # Build frontend for production"