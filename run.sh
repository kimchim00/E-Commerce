#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Check that setup has been run
if [ ! -d "backend/venv" ]; then
    echo "ERROR: Virtual environment not found. Run ./setup.sh first."
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "ERROR: Frontend dependencies not installed. Run ./setup.sh first."
    exit 1
fi

# Create logs directory
mkdir -p logs

# Track background PIDs for cleanup
PIDS=()

cleanup() {
    echo ""
    echo "Stopping all services..."
    for pid in "${PIDS[@]}"; do
        kill "$pid" 2>/dev/null || true
    done
    wait 2>/dev/null
    echo "All services stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "Starting E-Commerce Platform..."
echo ""

# Start Django Backend
echo "Starting Django Backend on port 8000..."
(cd backend && source venv/bin/activate && python manage.py runserver) &
PIDS+=($!)

# Give Django a moment to start
sleep 3

# Start FastAPI Gateway
echo "Starting FastAPI Gateway on port 8001..."
(cd api && source ../backend/venv/bin/activate && uvicorn main:app --reload --port 8001) &
PIDS+=($!)

# Start React Frontend
echo "Starting React Frontend on port 3000..."
(cd frontend && npm start) &
PIDS+=($!)

echo ""
echo "All services running."
echo ""
echo "  Django Backend:   http://localhost:8000"
echo "  FastAPI Gateway:  http://localhost:8001"
echo "  React Frontend:   http://localhost:3000"
echo "  API Docs:         http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop all services."

# Wait for all background processes
wait
