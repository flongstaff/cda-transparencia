#!/bin/bash

# Startup script for the Carmen de Areco Transparency Portal with Power BI Integration

echo "🚀 Starting Carmen de Areco Transparency Portal"
echo "=============================================="

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    if [[ -n $BACKEND_PID ]]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [[ -n $FRONTEND_PID ]]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Start backend server
echo "🔧 Starting backend server..."
cd backend
npm start > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server started (PID: $BACKEND_PID)"
else
    echo "❌ Backend server failed to start"
    echo "Check backend.log for details:"
    tail backend.log
    exit 1
fi

# Start frontend server
echo "🖥️  Starting frontend server..."
cd frontend
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend server started (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend server failed to start"
    echo "Check frontend.log for details:"
    tail frontend.log
    exit 1
fi

echo ""
echo "🎉 Servers are running!"
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo "   Power BI Analysis: http://localhost:5173/financial-analysis"
echo ""
echo "Press Ctrl+C to stop all servers"

# Display server logs in real-time (optional)
# Uncomment the following lines if you want to see logs in real-time
# echo ""
# echo "📋 Server Logs (Ctrl+C to exit):"
# tail -f backend.log frontend.log &

# Wait indefinitely
while true; do
    sleep 1
    
    # Check if processes are still running
    if ! ps -p $BACKEND_PID > /dev/null; then
        echo "❌ Backend server stopped unexpectedly"
        exit 1
    fi
    
    if ! ps -p $FRONTEND_PID > /dev/null; then
        echo "❌ Frontend server stopped unexpectedly"
        exit 1
    fi
done