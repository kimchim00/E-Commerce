# Fix CORS Issues

## The Problem
CORS errors mean FastAPI is not sending the proper headers, or FastAPI isn't running.

## Solution

### Step 1: Make Sure FastAPI is Running

Open a new terminal/PowerShell window:

```cmd
cd api
py -m uvicorn main:app --reload --port 8001
```

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 2: Test FastAPI Directly

Open browser: http://localhost:8001/health

**Expected:** JSON response showing FastAPI and Django status

### Step 3: Test CORS

Open browser console (F12) and run:
```javascript
fetch('http://localhost:8001/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**If you see CORS error:** FastAPI CORS middleware isn't working
**If you see data:** CORS is working, check other issues

### Step 4: Restart FastAPI

If CORS still doesn't work:
1. Stop FastAPI (Ctrl+C)
2. Restart it:
```cmd
cd api
py -m uvicorn main:app --reload --port 8001 --host 0.0.0.0
```

### Step 5: Check Firewall

Windows Firewall might be blocking port 8001:
1. Open Windows Defender Firewall
2. Check if port 8001 is allowed
3. Or temporarily disable firewall to test

## Alternative: Use Django Directly (Bypass FastAPI)

If FastAPI keeps having issues, you can temporarily point frontend directly to Django:

**Change in `frontend/src/services/api.js`:**
```javascript
const API_BASE_URL = 'http://localhost:8000/api';  // Changed from 8001 to 8000/api
```

**Note:** This bypasses FastAPI, but will work for testing.



