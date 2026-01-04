# E-commerce Application

A complete E-commerce solution with React + Ant Design frontend, Django backend, and FastAPI API layer.

## 🚀 New to This Project?

**Start here:** Read **[START_HERE.md](./START_HERE.md)** for a complete overview and quick start guide!

**Other helpful guides:**
- **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes
- **[STEP_BY_STEP_GUIDE.md](./STEP_BY_STEP_GUIDE.md)** - Detailed explanations (perfect for React developers learning backend)
- **[ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)** - Visual architecture overview
- **[LEARNING_PATH.md](./LEARNING_PATH.md)** - Structured 5-week learning path

## Project Structure

```
.
├── backend/          # Django backend application
│   ├── ecommerce/    # Django project settings
│   ├── store/        # Main app with models, views, serializers
│   └── manage.py
├── api/              # FastAPI REST API
│   ├── main.py       # FastAPI application
│   └── requirements.txt
├── frontend/         # React + Ant Design frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   └── App.js
│   └── package.json
└── README.md
```

## Features

### Core Features
- ✅ User Authentication (Register, Login, Logout)
- ✅ Product Catalog with Categories
- ✅ Advanced Product Search with Autocomplete
- ✅ Shopping Cart Management
- ✅ Wishlist Functionality
- ✅ Order Management
- ✅ User Dashboard
- ✅ Admin Panel (Django)
- ✅ Responsive Design with Ant Design

### Digikala-Style Features
- 🎯 **Hero Banner Carousel** - Promotional banners with smooth transitions
- ⚡ **Flash Sales Section** - Time-limited deals with countdown timer
- 🔍 **Enhanced Search Bar** - Prominent search with autocomplete suggestions
- ⭐ **Product Ratings & Reviews** - Display ratings and review counts
- 💰 **Discount System** - Show original and discounted prices with percentage badges
- ❤️ **Wishlist** - Save favorite products for later
- 🏷️ **Product Badges** - Visual indicators for discounts, stock status
- 📱 **Mobile-First Design** - Fully responsive like Digikala
- 🎨 **Modern UI** - Clean, professional interface inspired by Digikala

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

### 1. Backend (Django)

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional, for admin panel)
python manage.py createsuperuser

# Run Django server
python manage.py runserver
```

Django will run on **http://localhost:8000**

### 2. API (FastAPI)

Open a new terminal:

```bash
cd api

# Activate virtual environment (if using one)
source ../backend/venv/bin/activate  # On Windows: ..\backend\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn main:app --reload --port 8001
```

FastAPI will run on **http://localhost:8001**

### 3. Frontend (React)

Open another new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

React will run on **http://localhost:3000**

## Default Ports

- Django Backend: http://localhost:8000
- FastAPI: http://localhost:8001
- React Frontend: http://localhost:3000

## API Endpoints

### FastAPI Endpoints (http://localhost:8001)

- `GET /categories` - Get all categories
- `GET /products` - Get all products (with optional `category` and `search` params)
- `GET /products/{id}` - Get product details
- `GET /cart` - Get user's cart
- `POST /cart` - Add item to cart
- `PUT /cart/{item_id}` - Update cart item quantity
- `DELETE /cart/{item_id}` - Remove item from cart
- `GET /orders` - Get user's orders
- `POST /orders` - Create new order

### Django Admin

Access Django admin panel at: http://localhost:8000/admin

## Usage

1. Start all three servers (Django, FastAPI, React)
2. Visit http://localhost:3000 in your browser
3. Register a new account or login
4. Browse products, add to cart, and place orders
5. Use Django admin to manage products, categories, and orders

## Development Notes

- The FastAPI layer acts as a proxy to Django REST API
- Authentication uses Django sessions (cookies)
- Product images are stored in `backend/media/products/`
- Database is SQLite by default (change in `backend/ecommerce/settings.py` for production)

## Production Considerations

- Change `SECRET_KEY` in Django settings
- Set `DEBUG = False` in production
- Use PostgreSQL or MySQL instead of SQLite
- Configure proper CORS settings
- Set up proper authentication (JWT tokens)
- Use environment variables for sensitive data
- Set up proper static file serving

