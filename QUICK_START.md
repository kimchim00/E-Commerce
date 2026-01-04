# 🚀 Quick Start Guide

## Prerequisites Check

Before starting, make sure you have:
- ✅ Python 3.8+ installed
- ✅ Node.js 14+ installed
- ✅ All dependencies installed

## One-Command Setup (Windows)

Run this in PowerShell from the project root:

```powershell
.\setup.bat
```

Or manually follow the steps below.

---

## Manual Setup (3 Steps)

### Step 1: Start Django Backend

Open PowerShell and run:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

**✅ Django running on http://localhost:8000**

### Step 2: Start FastAPI

Open a **NEW** PowerShell window:

```powershell
cd api
..\backend\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8001
```

**✅ FastAPI running on http://localhost:8001**

### Step 3: Start React Frontend

Open **ANOTHER** PowerShell window:

```powershell
cd frontend
npm start
```

**✅ React running on http://localhost:3000**

---

## Verify Everything Works

1. **Django Admin:** http://localhost:8000/admin
   - Login with your superuser account
   - Add some products and categories

2. **FastAPI Docs:** http://localhost:8001/docs
   - See all available API endpoints
   - Test endpoints directly

3. **React App:** http://localhost:3000
   - Browse the website
   - Register/Login
   - Add products to cart

---

## Troubleshooting

### Port Already in Use?
```powershell
# Django on different port
python manage.py runserver 8002

# FastAPI on different port
uvicorn main:app --reload --port 8002
```

### Virtual Environment Not Found?
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### npm Packages Not Installed?
```powershell
cd frontend
npm install
```

---

## Next Steps

1. Read `STEP_BY_STEP_GUIDE.md` for detailed explanations
2. Explore the codebase
3. Customize and add features!




