# Quick Fix for CORS Errors

## The Issue
CORS errors mean FastAPI server is either:
1. **Not running** (most likely)
2. CORS middleware not working

## Immediate Solution

### Option 1: Make Sure FastAPI is Running

**Open a NEW PowerShell window and run:**
```cmd
cd "C:\Users\kimia\Desktop\New folder\api"
py -m uvicorn main:app --reload --port 8001
```

**You MUST see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8001
```

If you don't see this, FastAPI is NOT running!

### Option 2: Use Django Directly (Temporary Workaround)

If FastAPI keeps having issues, you can bypass it temporarily:

**Edit `frontend/src/services/api.js`:**
Change line 3 from:
```javascript
const API_BASE_URL = 'http://localhost:8001';
```
To:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

**Then restart React:**
```cmd
cd frontend
npm start
```

This will connect directly to Django (bypassing FastAPI).

---

## Verify Servers Are Running

### Check Django:
Open: http://localhost:8000/api/products/
Should show: JSON array (can be empty `[]`)

### Check FastAPI:
Open: http://localhost:8001/docs
Should show: FastAPI documentation page

### Check React:
Open: http://localhost:3000
Should show: Your website

---

## Most Common Issue

**FastAPI is NOT running!**

Make sure you have 3 separate terminal windows:
1. **Window 1:** Django (`py manage.py runserver`)
2. **Window 2:** FastAPI (`py -m uvicorn main:app --reload --port 8001`)
3. **Window 3:** React (`npm start`)

If FastAPI window is missing or closed, that's your problem!



