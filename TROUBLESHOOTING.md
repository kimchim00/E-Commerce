# Troubleshooting: Frontend Cannot Fetch from Backend

## Step 1: Verify All Servers Are Running

### Check Django (Port 8000)
Open browser: http://localhost:8000/api/products/

**Expected:** JSON array of products (can be empty `[]`)

**If error:**
- Start Django: `cd backend` → `py manage.py runserver`

### Check FastAPI (Port 8001)
Open browser: http://localhost:8001/docs

**Expected:** FastAPI interactive documentation

**If error:**
- Start FastAPI: `cd api` → `py -m uvicorn main:app --reload --port 8001`

### Check React (Port 3000)
Open browser: http://localhost:3000

**Expected:** Your website loads

**If error:**
- Start React: `cd frontend` → `npm start`

---

## Step 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors like:
   - `Failed to fetch`
   - `Network Error`
   - `CORS policy`
   - `404 Not Found`
   - `500 Internal Server Error`

---

## Step 3: Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for requests to `http://localhost:8001`
5. Click on a failed request to see details

---

## Step 4: Common Issues & Solutions

### Issue 1: "Failed to fetch" or "Network Error"

**Cause:** FastAPI server not running

**Solution:**
```cmd
cd api
py -m uvicorn main:app --reload --port 8001
```

---

### Issue 2: CORS Error

**Error:** `Access to fetch at 'http://localhost:8001/...' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution:**
1. Check `api/main.py` - CORS should allow `http://localhost:3000`
2. Check `backend/ecommerce/settings.py` - CORS should allow `http://localhost:3000`
3. Restart both servers

---

### Issue 3: 404 Not Found

**Error:** `GET http://localhost:8001/products 404`

**Cause:** FastAPI route doesn't exist or Django endpoint doesn't exist

**Solution:**
- Check `api/main.py` for `/products` route
- Check `backend/store/urls.py` for Django routes
- Verify Django is running

---

### Issue 4: 500 Internal Server Error

**Error:** `GET http://localhost:8001/products 500`

**Cause:** Django or FastAPI has an error

**Solution:**
1. Check Django terminal for Python errors
2. Check FastAPI terminal for Python errors
3. Look at the error message in browser Network tab

---

### Issue 5: Empty Response or No Data

**Cause:** No products in database

**Solution:**
1. Go to Django admin: http://localhost:8000/admin/
2. Add some products and categories
3. Refresh the frontend

---

## Step 5: Test Endpoints Directly

### Test Django Directly:
```
http://localhost:8000/api/products/
http://localhost:8000/api/categories/
```

### Test FastAPI:
```
http://localhost:8001/products
http://localhost:8001/categories
http://localhost:8001/docs (Interactive API docs)
```

---

## Step 6: Verify Configuration

### Frontend API URL
Check `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8001';  // Should be 8001
```

### FastAPI Django URL
Check `api/main.py`:
```python
DJANGO_BASE_URL = "http://localhost:8000/api"  # Should be 8000/api
```

### CORS Settings
Check both:
- `api/main.py` - should allow `http://localhost:3000`
- `backend/ecommerce/settings.py` - should allow `http://localhost:3000`

---

## Quick Fix Checklist

- [ ] Django running on port 8000
- [ ] FastAPI running on port 8001
- [ ] React running on port 3000
- [ ] No CORS errors in browser console
- [ ] Products exist in database (check Django admin)
- [ ] API endpoints return data when tested directly
- [ ] Browser console shows no errors

---

## Still Not Working?

1. **Check all terminal windows** - make sure all 3 servers are running
2. **Check browser console** - look for specific error messages
3. **Check Network tab** - see what requests are failing
4. **Restart all servers** - sometimes a restart fixes connection issues
5. **Clear browser cache** - Ctrl+Shift+Delete → Clear cache



