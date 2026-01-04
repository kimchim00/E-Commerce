# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                    (http://localhost:3000)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests (GET, POST, PUT, DELETE)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      REACT FRONTEND                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Components:                                              │   │
│  │  - DigikalaHeader (Navigation, Search)                   │   │
│  │  - ProductCard (Product Display)                         │   │
│  │  - FlashSale (Time-limited Deals)                       │   │
│  │  - HeroCarousel (Banner Slider)                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Pages:                                                   │   │
│  │  - DigikalaHome (Homepage)                               │   │
│  │  - Products (Product Listing)                            │   │
│  │  - ProductDetail (Single Product)                        │   │
│  │  - Cart (Shopping Cart)                                  │   │
│  │  - Checkout (Order Placement)                            │   │
│  │  - Login/Register (Authentication)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Services:                                                 │   │
│  │  - api.js (All API calls)                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ API Calls via axios
                             │ (withCredentials: true for cookies)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      FASTAPI API LAYER                          │
│                    (http://localhost:8001)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Endpoints:                                                │   │
│  │  - GET    /products          → Get all products          │   │
│  │  - GET    /products/{id}     → Get single product        │   │
│  │  - GET    /categories        → Get categories            │   │
│  │  - GET    /cart              → Get user's cart          │   │
│  │  - POST   /cart              → Add to cart               │   │
│  │  - PUT    /cart/{id}         → Update cart item          │   │
│  │  - DELETE /cart/{id}        → Remove from cart          │   │
│  │  - GET    /orders            → Get user's orders         │   │
│  │  - POST   /orders            → Create order              │   │
│  │  - GET    /wishlist          → Get wishlist              │   │
│  │  - POST   /wishlist/add      → Add to wishlist           │   │
│  │  - DELETE /wishlist/remove   → Remove from wishlist      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Purpose:                                                        │
│  - API Gateway / Proxy                                          │
│  - Request forwarding to Django                                 │
│  - CORS handling                                                │
│  - Can add caching, rate limiting, etc.                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             │ (httpx.AsyncClient)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      DJANGO BACKEND                             │
│                    (http://localhost:8000)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Views (API Logic):                                       │   │
│  │  - CategoryViewSet    → Category CRUD                     │   │
│  │  - ProductViewSet     → Product CRUD                      │   │
│  │  - CartViewSet        → Cart management                   │   │
│  │  - OrderViewSet       → Order management                  │   │
│  │  - WishlistViewSet    → Wishlist management               │   │
│  │  - register/login     → Authentication                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Models (Database Structure):                             │   │
│  │  - User (Django built-in)                                 │   │
│  │  - Category (Product categories)                          │   │
│  │  - Product (Products with prices, images)                 │   │
│  │  - Cart (User shopping cart items)                       │   │
│  │  - Wishlist (User saved products)                        │   │
│  │  - Order (User orders)                                   │   │
│  │  - OrderItem (Items in each order)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Serializers (Data Conversion):                           │   │
│  │  - Convert Python objects → JSON                         │   │
│  │  - Convert JSON → Python objects                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Admin Panel:                                             │   │
│  │  - http://localhost:8000/admin                            │   │
│  │  - Manage products, categories, orders                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ ORM Queries
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      SQLITE DATABASE                            │
│                    (backend/db.sqlite3)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Tables:                                                  │   │
│  │  - auth_user (Users)                                      │   │
│  │  - store_category (Categories)                            │   │
│  │  - store_product (Products)                               │   │
│  │  - store_cart (Cart items)                                │   │
│  │  - store_wishlist (Wishlist items)                       │   │
│  │  - store_order (Orders)                                  │   │
│  │  - store_orderitem (Order items)                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Adding Product to Cart

### Step-by-Step Flow

```
1. USER ACTION
   User clicks "Add to Cart" button on ProductCard component
   ↓

2. REACT COMPONENT
   onClick handler calls: addToCart(productId, quantity)
   ↓

3. API SERVICE (frontend/src/services/api.js)
   api.post('/cart', { product_id: productId, quantity })
   → Sends POST request to http://localhost:8001/cart
   → Includes session cookie (withCredentials: true)
   ↓

4. FASTAPI (api/main.py)
   @app.post("/cart")
   → Receives request
   → Forwards to Django: POST http://localhost:8000/api/cart/
   → Includes cookies and headers
   ↓

5. DJANGO VIEW (backend/store/views.py)
   CartViewSet.create()
   → Validates user is authenticated
   → Gets product from database
   → Creates Cart object: Cart(user=request.user, product=product, quantity=quantity)
   → Saves to database
   ↓

6. DJANGO SERIALIZER (backend/store/serializers.py)
   CartSerializer
   → Converts Cart object to JSON
   → Includes product details, total_price
   ↓

7. RESPONSE FLOW (Reverse)
   Django → FastAPI → React → Component
   ↓

8. REACT UPDATE
   Component receives response
   → Updates cart state
   → Shows success message
   → Updates cart icon count
```

## Authentication Flow

```
1. USER REGISTRATION
   React: POST /auth/register {username, email, password}
   ↓
   FastAPI: Forwards to Django /api/auth/register/
   ↓
   Django: Creates User object, returns user data
   ↓
   React: Stores user info, redirects to login

2. USER LOGIN
   React: POST /auth/login {username, password}
   ↓
   FastAPI: Forwards to Django /api/auth/login/
   ↓
   Django: Authenticates user, creates session
   ↓
   Django: Returns session cookie
   ↓
   Browser: Stores cookie automatically
   ↓
   React: User is now logged in

3. AUTHENTICATED REQUESTS
   React: Any API call includes cookie (automatic)
   ↓
   FastAPI: Forwards cookie to Django
   ↓
   Django: Validates session, identifies user
   ↓
   Django: Returns user-specific data
```

## Technology Stack

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Ant Design** - UI components
- **Axios** - HTTP client

### API Layer
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **httpx** - Async HTTP client

### Backend
- **Django 6.0** - Web framework
- **Django REST Framework** - API toolkit
- **SQLite** - Database (development)
- **Pillow** - Image processing

## Port Configuration

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| React | 3000 | http://localhost:3000 | Frontend application |
| FastAPI | 8001 | http://localhost:8001 | API gateway |
| Django | 8000 | http://localhost:8000 | Backend server |
| Django Admin | 8000 | http://localhost:8000/admin | Admin panel |

## Key Concepts

### 1. Session-Based Authentication
- Django creates a session when user logs in
- Session ID stored in cookie
- Cookie sent automatically with each request
- No need to manually handle tokens

### 2. CORS (Cross-Origin Resource Sharing)
- React (port 3000) → FastAPI (port 8001) → Django (port 8000)
- Different origins, so CORS must be configured
- Configured in both Django and FastAPI

### 3. API Proxy Pattern
- FastAPI doesn't have its own database
- Acts as a proxy/gateway to Django
- Can add features like:
  - Rate limiting
  - Caching
  - Request transformation
  - Analytics

### 4. RESTful API Design
- GET - Retrieve data
- POST - Create new resource
- PUT/PATCH - Update resource
- DELETE - Remove resource

## File Structure Mapping

```
Frontend Request Flow:
frontend/src/pages/Products.js
  → frontend/src/services/api.js
    → api/main.py (FastAPI)
      → backend/store/views.py (Django)
        → backend/store/models.py (Database)
```

## Common Patterns

### Pattern 1: Fetching Data
```javascript
// React Component
useEffect(() => {
  getProducts().then(response => {
    setProducts(response.data);
  });
}, []);
```

### Pattern 2: Creating Data
```javascript
// React Component
const handleAddToCart = async () => {
  try {
    await addToCart(productId, quantity);
    message.success('Added to cart!');
    loadCart(); // Refresh cart
  } catch (error) {
    message.error('Failed to add to cart');
  }
};
```

### Pattern 3: Updating State
```javascript
// React Component
const [cart, setCart] = useState([]);

const loadCart = async () => {
  const response = await getCart();
  setCart(response.data);
};
```

## Security Considerations

1. **Authentication**: Session-based (cookies)
2. **CORS**: Configured for localhost only
3. **CSRF**: Django handles CSRF protection
4. **SQL Injection**: Django ORM prevents SQL injection
5. **XSS**: React escapes content by default

## Performance Optimizations

1. **Database Queries**: Django ORM optimizes queries
2. **Caching**: Can add Redis/Memcached
3. **Image Optimization**: Pillow for image processing
4. **Pagination**: DRF pagination for large datasets
5. **Async**: FastAPI uses async for better performance




