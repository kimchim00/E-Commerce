@echo off
echo Starting E-Commerce Platform...
echo.

REM Check that setup has been run
if not exist "backend\venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found. Run setup.bat first.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo ERROR: Frontend dependencies not installed. Run setup.bat first.
    pause
    exit /b 1
)

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

echo Starting Django Backend on port 8000...
start "Django Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate.bat && python manage.py runserver"

REM Wait a moment for Django to start before launching the gateway
timeout /t 3 /nobreak > nul

echo Starting FastAPI Gateway on port 8001...
start "FastAPI Gateway" cmd /k "cd /d %~dp0api && ..\backend\venv\Scripts\activate.bat && uvicorn main:app --reload --port 8001"

echo Starting React Frontend on port 3000...
start "React Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo All services starting in separate windows.
echo.
echo   Django Backend:   http://localhost:8000
echo   FastAPI Gateway:  http://localhost:8001
echo   React Frontend:   http://localhost:3000
echo   API Docs:         http://localhost:8001/docs
echo.
echo Close each terminal window to stop its service.
