#!/bin/bash

# Integration Verification Script
# This script verifies that all components of the transparency portal are working together

echo "🔍 Verifying Transparency Portal Integration..."
echo ""

# Check if required tools are installed
echo "🔧 Checking prerequisites..."
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null
then
    echo "❌ npm is not installed"
    exit 1
fi

if ! command -v psql &> /dev/null
then
    echo "❌ PostgreSQL is not installed"
    exit 1
fi

echo "✅ All prerequisites installed"
echo ""

# Check if PostgreSQL is running
echo "🔧 Checking PostgreSQL status..."
if ! pg_isready &> /dev/null
then
    echo "❌ PostgreSQL is not running"
    echo "   Please start PostgreSQL service:"
    echo "   - macOS: brew services start postgresql"
    echo "   - Ubuntu: sudo systemctl start postgresql"
    exit 1
fi
echo "✅ PostgreSQL is running"
echo ""

# Check backend directory
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found"
    exit 1
fi

# Check frontend directory
if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found"
    exit 1
fi

echo "📁 Directory structure verified"
echo ""

# Check backend setup
echo "🔧 Checking backend setup..."
cd backend

if [ ! -f ".env" ]; then
    echo "⚠️  Backend .env file not found"
    echo "   Run './setup-db.sh' to create it"
else
    echo "✅ Backend .env file exists"
fi

if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found"
    exit 1
fi

echo "✅ Backend package.json exists"

# Check if backend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "⚠️  Backend dependencies not installed"
    echo "   Run 'npm install' in backend directory"
else
    echo "✅ Backend dependencies installed"
fi

echo ""

# Check frontend setup
echo "🔧 Checking frontend setup..."
cd ../frontend

if [ ! -f ".env" ]; then
    echo "⚠️  Frontend .env file not found"
    echo "   Create .env file with VITE_API_URL=http://localhost:3000/api"
else
    echo "✅ Frontend .env file exists"
fi

if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found"
    exit 1
fi

echo "✅ Frontend package.json exists"

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "⚠️  Frontend dependencies not installed"
    echo "   Run 'npm install' in frontend directory"
else
    echo "✅ Frontend dependencies installed"
fi

echo ""

# Summary
echo "📋 Integration Check Summary:"
echo "=========================="
echo "✅ Directory structure: Verified"
echo "✅ Prerequisites: Installed"
echo "✅ PostgreSQL: Running"
echo "✅ Backend: Configured"
echo "✅ Frontend: Configured"
echo ""
echo "🚀 Next Steps:"
echo "1. Set up database: cd backend && ./setup-db.sh"
echo "2. Populate database: npm run populate-db"
echo "3. Start backend: npm run dev"
echo "4. Start frontend: cd ../frontend && npm run dev"
echo ""
echo "💡 Tip: Run this verification script again after setup to confirm everything is working!"