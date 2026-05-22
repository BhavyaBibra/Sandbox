#!/bin/bash
echo "🚀 Starting DSA Visualizer Sandbox..."

# Setup and run backend
echo "📦 Setting up backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Created virtual environment."
fi
source venv/bin/activate
pip install -r requirements.txt -q
echo "🏃‍♂️ Starting backend server on port 8000..."
# Using lsof to clear the port just in case it's in use
lsof -ti:8000 | xargs kill -9 2>/dev/null
uvicorn main:app --reload --port 8000 > /dev/null 2>&1 &
BACKEND_PID=$!
cd ..

# Setup and run frontend
echo "📦 Setting up frontend..."
cd frontend
npm install --silent
echo "🏃‍♂️ Starting frontend server..."
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
cd ..

echo "================================================="
echo "✅ Sandbox is running! Both servers are up."
echo "🌐 Frontend URL: http://localhost:5173 (or check your terminal for the exact Vite port)"
echo "⚙️  Backend URL:  http://localhost:8000"
echo "================================================="
echo "Press Ctrl+C to stop both servers gracefully."
echo "================================================="

# Trap Ctrl+C to kill both processes
trap "echo -e '\n🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait indefinitely until interrupted
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
