# 🚀 How to Run the Backend

## Quick Steps to Run Django Backend

### Step 1: Open PowerShell
Open PowerShell in your project folder.

### Step 2: Navigate to Backend Folder
```powershell
cd backend
```

### Step 3: Activate Virtual Environment
```powershell
.\venv\Scripts\Activate.ps1
```

**Note:** If you see an error about execution policy, run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 4: Run the Server
```powershell
python manage.py runserver
```

**✅ Backend is now running on http://localhost:8000**

---

## First Time Setup (If Virtual Environment Doesn't Exist)

If you haven't set up the backend yet, follow these steps:

### 1. Create Virtual Environment
```powershell
cd backend
python -m venv venv
```

### 2. Activate Virtual Environment
```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 4. Create Database Tables
```powershell
python manage.py migrate
```

### 5. Create Admin User (Optional)
```powershell
python manage.py createsuperuser
```
Follow the prompts to create an admin account.

### 6. Run the Server
```powershell
python manage.py runserver
```

---

## Verify Backend is Running

1. **Check the terminal** - You should see:
   ```
   Starting development server at http://127.0.0.1:8000/
   ```

2. **Visit in browser:**
   - Django Admin: http://localhost:8000/admin
   - API: http://localhost:8000/api/products/

---

## Common Issues & Solutions

### Issue: "venv\Scripts\Activate.ps1 cannot be loaded"
**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: "Port 8000 already in use"
**Solution:** Use a different port:
```powershell
python manage.py runserver 8002
```

### Issue: "No module named 'django'"
**Solution:** Make sure virtual environment is activated and dependencies are installed:
```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Issue: "ModuleNotFoundError"
**Solution:** Install missing packages:
```powershell
pip install -r requirements.txt
```

---

## What You'll See When It's Running

```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
Django version X.X.X, using settings 'ecommerce.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

---

## Stopping the Server

Press `CTRL + C` in the PowerShell window to stop the server.

---

## Next Steps

Once the backend is running:
1. ✅ Backend is ready at http://localhost:8000
2. Start FastAPI (optional): `cd api` → `uvicorn main:app --reload --port 8001`
3. Start React Frontend: `cd frontend` → `npm start`

---

## Quick Reference

```powershell
# Navigate to backend
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run server
python manage.py runserver

# Stop server: Press CTRL + C
```



