#!/bin/bash

# Complete System Startup Script
# Starts backend, frontend, and opens the financial analysis dashboard

echo "🚀 Starting Complete Carmen de Areco Transparency Portal"
echo "======================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +%H:%M:%S)]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +%H:%M:%S)]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

print_step() {
    echo -e "${CYAN}→${NC} $1"
}

# Function to clean up background processes on exit
cleanup() {
    echo ""
    print_status "Shutting down servers..."
    if [[ -n $BACKEND_PID ]]; then
        kill $BACKEND_PID 2>/dev/null
        print_success "Backend server stopped"
    fi
    if [[ -n $FRONTEND_PID ]]; then
        kill $FRONTEND_PID 2>/dev/null
        print_success "Frontend server stopped"
    fi
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM EXIT

# Check if we're in the right directory
if [[ ! -d "backend" ]] || [[ ! -d "frontend" ]]; then
    print_error "Error: Could not find backend or frontend directories"
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Checking system requirements..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    print_error "Please install Node.js v16+ and try again"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    print_error "Please install npm and try again"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed"
    print_error "Please install Python 3 and try again"
    exit 1
fi

print_success "System requirements satisfied"

# Check if data exists
if [[ ! -d "data/powerbi_extraction" ]] || [[ -z "$(ls -A data/powerbi_extraction)" ]]; then
    print_warning "No Power BI data found. You may need to run data extraction first."
    print_warning "Run: python scripts/run_powerbi_extraction.py"
fi

print_status "Starting backend server..."

# Start backend server
cd backend
npm start > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    print_success "Backend server started successfully (PID: $BACKEND_PID)"
else
    print_error "Backend server failed to start"
    print_error "Check backend.log for details:"
    tail backend.log
    exit 1
fi

print_status "Starting frontend development server..."

# Start frontend server
cd frontend
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    print_success "Frontend server started successfully (PID: $FRONTEND_PID)"
else
    print_error "Frontend server failed to start"
    print_error "Check frontend.log for details:"
    tail frontend.log
    exit 1
fi

# Wait a bit more for servers to be fully ready
sleep 3

print_success "🎉 All servers are running!"
echo ""
print_header "📱 Access the portal at:"
echo "   Main Portal:      http://localhost:5173"
echo "   Financial Analysis: http://localhost:5173/financial-analysis"
echo "   Power BI Data:    http://localhost:5173/powerbi-data"
echo "   API Documentation: http://localhost:3000/api-docs"
echo ""
print_header "💾 Data Location:"
echo "   Power BI Data: $(pwd)/data/powerbi_extraction/"
echo ""
print_header "🛑 To stop all servers, press Ctrl+C"
echo ""

# Display server status periodically
while true; do
    # Check if processes are still running
    if ! ps -p $BACKEND_PID > /dev/null; then
        print_error "❌ Backend server stopped unexpectedly"
        exit 1
    fi
    
    if ! ps -p $FRONTEND_PID > /dev/null; then
        print_error "❌ Frontend server stopped unexpectedly"
        exit 1
    fi
    
    # Show status every 30 seconds
    print_status "Servers are running (Backend PID: $BACKEND_PID, Frontend PID: $FRONTEND_PID)"
    
    # Wait before next check
    sleep 30
done