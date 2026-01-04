# Complete Step-by-Step Guide: Building an E-commerce Website

## 🎯 Overview: How Everything Works Together

Since you know React, let's start with what you're familiar with and then explain how the backend connects.

### The Architecture (Simple Explanation)

```
┌─────────────────┐
│   React App     │  ← You know this! (Frontend - what users see)
│  (Port 3000)    │
└────────┬────────┘
         │ HTTP Requests (GET, POST, etc.)
         │
┌────────▼────────┐
│   FastAPI       │  ← API Gateway (Port 8001)
│  (API Layer)    │  Acts like a middleman
└────────┬────────┘
         │ Forwards requests
         │
┌────────▼────────┐
│   Django        │  ← Backend (Port 8000)
│  (Database)     │  Stores data, handles business logic
└─────────────────┘
```

**Think of it like this:**
- **React** = The storefront (what customers see)
- **FastAPI** = The cashier (takes orders, communicates)
- **Django** = The warehouse (stores products, manages inventory)

---

## 📚 Part 1: Understanding the Project Structure

### Frontend (React) - `frontend/` folder
```
frontend/
├── src/
│   ├── components/     # Reusable UI components (like buttons, cards)
│   ├── pages/          # Full pages (Home, Products, Cart, etc.)
│   ├── services/       # API calls (how React talks to backend)
│   └── App.js          # Main app file (routing)
```

**Key Files:**
- `src/services/api.js` - All API calls (like `getProducts()`, `addToCart()`)
- `src/pages/` - Each page is a React component
- `src/components/` - Reusable pieces (Header, Footer, ProductCard)

### Backend (Django) - `backend/` folder
```
backend/
├── ecommerce/          # Django project settings
│   └── settings.py     # Configuration (database, installed apps)
├── store/              # Main app (like a module)
│   ├── models.py       # Database structure (Product, User, Order)
│   ├── views.py        # API endpoints logic
│   ├── serializers.py  # Converts data to JSON
│   └── urls.py         # URL routing
└── manage.py           # Django management script
```

**Key Concepts:**
- **Models** = Database tables (like a Product table, User table)
- **Views** = Functions that handle requests (like "get all products")
- **Serializers** = Convert database objects to JSON (so React can read them)

### API (FastAPI) - `api/` folder
```
api/
└── main.py             # All API endpoints (routes)
```

**Purpose:** FastAPI acts as a proxy - it receives requests from React and forwards them to Django, then returns the response.

---

## 🚀 Part 2: Setting Up and Running the Project

### Step 1: Install Prerequisites

**For Windows (PowerShell):**

1. **Python 3.8+** - Check if installed:
   ```powershell
   python --version
   ```
   If not installed, download from [python.org](https://www.python.org/downloads/)

2. **Node.js 14+** - Check if installed:
   ```powershell
   node --version
   npm --version
   ```
   If not installed, download from [nodejs.org](https://nodejs.org/)

### Step 2: Set Up Backend (Django)

Open PowerShell in the project folder:

```powershell
# Navigate to backend folder
cd backend

# Activate virtual environment (if not already activated)
.\venv\Scripts\Activate.ps1

# If virtual environment doesn't exist, create it:
# python -m venv venv
# .\venv\Scripts\Activate.ps1

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Create database tables
python manage.py migrate

# Create a superuser (admin account) - follow prompts
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```

**✅ Django should now be running on http://localhost:8000**

**What just happened?**
- `migrate` creates database tables based on your models
- `createsuperuser` lets you access the admin panel
- `runserver` starts the Django server

### Step 3: Set Up API (FastAPI)

Open a **NEW** PowerShell window:

```powershell
# Navigate to project root, then to api folder
cd "C:\Users\kimia\Desktop\New folder\api"

# Activate the same virtual environment
..\backend\venv\Scripts\Activate.ps1

# Install FastAPI dependencies (if not already installed)
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --port 8001
```

**✅ FastAPI should now be running on http://localhost:8001**

**What just happened?**
- FastAPI is now listening for requests
- `--reload` means it auto-restarts when you change code
- You can visit http://localhost:8001/docs to see the API documentation

### Step 4: Set Up Frontend (React)

Open **ANOTHER** PowerShell window:

```powershell
# Navigate to frontend folder
cd "C:\Users\kimia\Desktop\New folder\frontend"

# Install dependencies (if not already installed)
npm install

# Start React development server
npm start
```

**✅ React should now be running on http://localhost:3000**

**What just happened?**
- `npm install` downloads all React packages
- `npm start` starts the development server
- Your browser should automatically open to http://localhost:3000

---

## 🔍 Part 3: Understanding How Data Flows

### Example: Loading Products on the Home Page

Let's trace what happens when a user visits the home page:

#### 1. React Component (Frontend)
```javascript
// In DigikalaHome.js or Products.js
import { getProducts } from '../services/api';

// When component loads:
useEffect(() => {
  getProducts().then(response => {
    setProducts(response.data); // Store products in state
  });
}, []);
```

#### 2. API Service (Frontend)
```javascript
// In services/api.js
export const getProducts = (params) => 
  api.get('/products', { params });
// This makes a GET request to http://localhost:8001/products
```

#### 3. FastAPI (API Layer)
```python
# In api/main.py
@app.get("/products")
async def get_products(...):
    # Forward request to Django
    response = await client.get("http://localhost:8000/api/products/")
    return response.json()  # Return to React
```

#### 4. Django (Backend)
```python
# In store/views.py
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(available=True)
    # Gets products from database
    # Serializes to JSON
    # Returns to FastAPI
```

#### 5. Database
- Django queries SQLite database
- Returns product data

**Flow Summary:**
```
User clicks → React → FastAPI → Django → Database
                                    ↓
User sees products ← React ← FastAPI ← Django ← Database
```

---

## 🛠️ Part 4: Understanding Key Concepts

### A. Django Models (Database Structure)

**Think of models as blueprints for database tables:**

```python
# In backend/store/models.py
class Product(models.Model):
    name = models.CharField(max_length=200)      # Product name
    price = models.DecimalField(...)            # Price
    description = models.TextField()            # Description
    # ... more fields
```

**This creates a table like:**
| id | name | price | description |
|----|------|-------|-------------|
| 1  | Laptop | 999.99 | Great laptop |
| 2  | Phone | 599.99 | Smartphone |

### B. Django Views (API Endpoints)

**Views handle HTTP requests:**

```python
# In backend/store/views.py
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(available=True)
    # This automatically creates:
    # GET /api/products/ - Get all products
    # GET /api/products/1/ - Get product with id=1
```

**In React, you call:**
```javascript
getProducts()  // Calls GET /api/products/
```

### C. FastAPI Endpoints

**FastAPI routes forward requests:**

```python
# In api/main.py
@app.get("/products")
async def get_products(...):
    # Calls Django's /api/products/
    response = await client.get("http://localhost:8000/api/products/")
    return response.json()
```

**Why use FastAPI?**
- Can add extra logic (caching, rate limiting)
- Can combine multiple Django endpoints
- Better for high-performance features

### D. React API Service

**Centralized API calls:**

```javascript
// In frontend/src/services/api.js
export const getProducts = (params) => 
  api.get('/products', { params });

// In your component:
import { getProducts } from '../services/api';
const products = await getProducts();
```

---

## 📝 Part 5: Common Tasks

### Task 1: Add a New Product Field

**Step 1: Update Django Model**
```python
# In backend/store/models.py
class Product(models.Model):
    # ... existing fields ...
    brand = models.CharField(max_length=100)  # Add this
```

**Step 2: Create Migration**
```powershell
cd backend
python manage.py makemigrations
python manage.py migrate
```

**Step 3: Update Serializer**
```python
# In backend/store/serializers.py
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'brand', ...]  # Add 'brand'
```

**Step 4: Update React Component**
```javascript
// In your React component
{product.brand && <p>Brand: {product.brand}</p>}
```

### Task 2: Add a New API Endpoint

**Step 1: Add Django View**
```python
# In backend/store/views.py
@action(detail=True, methods=['get'])
def reviews(self, request, pk=None):
    product = self.get_object()
    # Get reviews logic
    return Response(reviews_data)
```

**Step 2: Add FastAPI Route**
```python
# In api/main.py
@app.get("/products/{product_id}/reviews")
async def get_product_reviews(product_id: int, ...):
    response = await client.get(f"{DJANGO_BASE_URL}/products/{product_id}/reviews/")
    return response.json()
```

**Step 3: Add React API Call**
```javascript
// In frontend/src/services/api.js
export const getProductReviews = (productId) => 
  api.get(`/products/${productId}/reviews`);
```

**Step 4: Use in Component**
```javascript
import { getProductReviews } from '../services/api';
const reviews = await getProductReviews(productId);
```

### Task 3: Add a New Page

**Step 1: Create React Component**
```javascript
// In frontend/src/pages/NewPage.js
import React from 'react';

function NewPage() {
  return <div>My New Page</div>;
}

export default NewPage;
```

**Step 2: Add Route**
```javascript
// In frontend/src/App.js
import NewPage from './pages/NewPage';

// In Routes:
<Route path="/new-page" element={<NewPage />} />
```

**Step 3: Add Link**
```javascript
// In any component
import { Link } from 'react-router-dom';
<Link to="/new-page">Go to New Page</Link>
```

---

## 🎨 Part 6: Understanding React Components

### Component Structure

```javascript
import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/api';

function Products() {
  // State - stores data that can change
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect - runs when component loads
  useEffect(() => {
    loadProducts();
  }, []);

  // Function to load products
  const loadProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Render UI
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}

export default Products;
```

**Key Concepts:**
- `useState` - Store data that changes
- `useEffect` - Run code when component loads
- `async/await` - Handle API calls
- `map` - Loop through arrays

---

## 🔐 Part 7: Authentication Flow

### How Login Works

1. **User enters credentials in React**
2. **React sends to FastAPI**
3. **FastAPI forwards to Django**
4. **Django validates and creates session**
5. **Session cookie sent back to React**
6. **Future requests include cookie automatically**

**In React:**
```javascript
// Login component
const handleLogin = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  // Cookie is automatically stored
  // Redirect to home page
};
```

**In Django:**
```python
# Django handles authentication automatically
# Uses session-based auth (cookies)
```

---

## 🐛 Part 8: Debugging Tips

### Common Issues

**1. CORS Errors**
- **Problem:** "Access-Control-Allow-Origin" error
- **Solution:** Check `backend/ecommerce/settings.py` has correct CORS settings

**2. 404 Errors**
- **Problem:** API endpoint not found
- **Solution:** Check URL in `api/main.py` matches Django URL in `backend/store/urls.py`

**3. Database Errors**
- **Problem:** "Table doesn't exist"
- **Solution:** Run `python manage.py migrate`

**4. Port Already in Use**
- **Problem:** "Port 8000 already in use"
- **Solution:** Kill the process or use a different port:
  ```powershell
  python manage.py runserver 8002
  ```

### Debugging Steps

1. **Check all servers are running:**
   - Django: http://localhost:8000/admin
   - FastAPI: http://localhost:8001/docs
   - React: http://localhost:3000

2. **Check browser console** (F12) for errors

3. **Check network tab** (F12 → Network) to see API calls

4. **Check server logs** in PowerShell windows

---

## 📚 Part 9: Learning Resources

### For React (You Already Know This!)
- [React Docs](https://react.dev/)
- [React Router](https://reactrouter.com/)

### For Django (Backend)
- [Django Tutorial](https://docs.djangoproject.com/en/stable/intro/tutorial01/)
- [Django REST Framework](https://www.django-rest-framework.org/tutorial/quickstart/)

### For FastAPI (API Layer)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)

### For Understanding the Project
- Read `backend/store/models.py` - See database structure
- Read `backend/store/views.py` - See API logic
- Read `api/main.py` - See API routing
- Read `frontend/src/services/api.js` - See how React calls APIs

---

## 🎯 Part 10: Next Steps

### Immediate Actions:
1. ✅ Make sure all 3 servers are running
2. ✅ Visit http://localhost:3000
3. ✅ Try registering a user
4. ✅ Browse products
5. ✅ Add items to cart
6. ✅ Visit Django admin: http://localhost:8000/admin

### To Customize:
1. **Change styling** - Edit CSS files in `frontend/src/`
2. **Add products** - Use Django admin or create a management command
3. **Modify models** - Edit `backend/store/models.py`, then migrate
4. **Add features** - Follow Task examples in Part 5

### To Deploy:
1. Build React: `npm run build`
2. Configure production settings in Django
3. Use PostgreSQL instead of SQLite
4. Set up proper authentication (JWT tokens)
5. Deploy to services like Heroku, AWS, or DigitalOcean

---

## 💡 Quick Reference

### Starting All Servers (3 PowerShell Windows)

**Window 1 - Django:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

**Window 2 - FastAPI:**
```powershell
cd api
..\backend\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8001
```

**Window 3 - React:**
```powershell
cd frontend
npm start
```

### Common Commands

**Django:**
- `python manage.py migrate` - Update database
- `python manage.py createsuperuser` - Create admin
- `python manage.py runserver` - Start server

**React:**
- `npm install` - Install packages
- `npm start` - Start dev server
- `npm run build` - Build for production

**FastAPI:**
- `uvicorn main:app --reload` - Start server
- Visit `/docs` for API documentation

---

## ❓ Questions?

If you get stuck:
1. Check the error message carefully
2. Check all servers are running
3. Check browser console (F12)
4. Check server logs in PowerShell
5. Review this guide's relevant section

**Remember:** This is a learning project. Don't worry about making mistakes - that's how you learn! 🚀




