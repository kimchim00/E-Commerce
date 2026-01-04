# Testing Backend Connection

## Quick Test Steps

### 1. Check if Django is running
Open browser: http://localhost:8000/api/products/

Should see JSON response with products (or empty array [])

### 2. Check if FastAPI is running
Open browser: http://localhost:8001/docs

Should see FastAPI interactive documentation

### 3. Test FastAPI endpoint
Open browser: http://localhost:8001/products

Should see products from Django

### 4. Check browser console
Open browser DevTools (F12) → Console tab
Look for any CORS errors or connection errors

## Common Issues

### Issue: "Network Error" or "Failed to fetch"
**Solution:**
- Make sure FastAPI is running on port 8001
- Make sure Django is running on port 8000
- Check browser console for specific error

### Issue: CORS Error
**Solution:**
- Check CORS settings in `backend/ecommerce/settings.py`
- Check CORS settings in `api/main.py`
- Make sure both allow `http://localhost:3000`

### Issue: 404 Not Found
**Solution:**
- Check Django URLs in `backend/store/urls.py`
- Check FastAPI routes in `api/main.py`
- Verify endpoint paths match

### Issue: 500 Internal Server Error
**Solution:**
- Check Django server logs
- Check FastAPI server logs
- Look for Python errors in terminal

## Debug Commands

### Test Django API directly:
```cmd
curl http://localhost:8000/api/products/
```

### Test FastAPI:
```cmd
curl http://localhost:8001/products
```

### Check if servers are running:
```cmd
# Check Django
netstat -an | findstr :8000

# Check FastAPI  
netstat -an | findstr :8001
```



