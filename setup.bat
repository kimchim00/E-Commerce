@echo off
echo Setting up E-commerce Application...
echo.

REM Backend setup
echo Setting up Django backend...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
python manage.py migrate
echo Django backend setup complete!
echo.

REM API setup
echo Setting up FastAPI...
cd ..\api
pip install -r requirements.txt
echo FastAPI setup complete!
echo.

REM Frontend setup
echo Setting up React frontend...
cd ..\frontend
call npm install
echo Frontend setup complete!
echo.

echo Setup complete!
echo.
echo To start the application:
echo 1. Backend: cd backend ^&^& venv\Scripts\activate ^&^& python manage.py runserver
echo 2. API: cd api ^&^& ..\backend\venv\Scripts\activate ^&^& uvicorn main:app --reload --port 8001
echo 3. Frontend: cd frontend ^&^& npm start





