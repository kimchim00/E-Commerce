#!/bin/bash

echo "Setting up E-commerce Application..."
echo ""

# Backend setup
echo "Setting up Django backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
echo "Django backend setup complete!"
echo ""

# API setup
echo "Setting up FastAPI..."
cd ../api
pip install -r requirements.txt
echo "FastAPI setup complete!"
echo ""

# Frontend setup
echo "Setting up React frontend..."
cd ../frontend
npm install
echo "Frontend setup complete!"
echo ""

echo "Setup complete!"
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && source venv/bin/activate && python manage.py runserver"
echo "2. API: cd api && source ../backend/venv/bin/activate && uvicorn main:app --reload --port 8001"
echo "3. Frontend: cd frontend && npm start"





