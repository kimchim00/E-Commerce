# 🚀 START HERE - Your Complete Guide

Welcome! This guide will help you understand and run your e-commerce website step by step.

---

## 📋 Quick Navigation

1. **[QUICK_START.md](./QUICK_START.md)** - Get up and running in 5 minutes
2. **[STEP_BY_STEP_GUIDE.md](./STEP_BY_STEP_GUIDE.md)** - Detailed explanations for everything
3. **[ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)** - Visual architecture overview
4. **[LEARNING_PATH.md](./LEARNING_PATH.md)** - Structured learning path for React developers

---

## ⚡ Quick Start (3 Commands)

Open **3 separate PowerShell windows** and run:

### Window 1: Django Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

### Window 2: FastAPI
```powershell
cd api
..\backend\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8001
```

### Window 3: React Frontend
```powershell
cd frontend
npm start
```

**✅ All servers running! Visit http://localhost:3000**

---

## 🎯 What You Have

### ✅ Complete E-commerce Platform

**Features:**
- ✅ User Registration & Login
- ✅ Product Catalog with Categories
- ✅ Product Search & Filtering
- ✅ Shopping Cart
- ✅ Wishlist
- ✅ Order Management
- ✅ Admin Panel (Django)
- ✅ Responsive Design (Digikala-style)

**Tech Stack:**
- **Frontend:** React 18 + Ant Design
- **API Layer:** FastAPI
- **Backend:** Django 6.0 + Django REST Framework
- **Database:** SQLite (development)

---

## 📚 Understanding the Architecture

```
React (Port 3000) → FastAPI (Port 8001) → Django (Port 8000) → SQLite Database
```

**Simple Explanation:**
- **React** = What users see (like a storefront)
- **FastAPI** = The cashier (takes orders, communicates)
- **Django** = The warehouse (stores data, manages inventory)
- **SQLite** = The storage room (database)

**For detailed architecture, see [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)**

---

## 🗂️ Project Structure

```
.
├── frontend/          # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Full pages
│   │   └── services/     # API calls
│   └── package.json
│
├── api/               # FastAPI application
│   ├── main.py        # All API endpoints
│   └── requirements.txt
│
├── backend/           # Django application
│   ├── ecommerce/     # Project settings
│   ├── store/         # Main app
│   │   ├── models.py      # Database structure
│   │   ├── views.py       # API logic
│   │   └── serializers.py # Data conversion
│   └── manage.py
│
└── Documentation/
    ├── START_HERE.md (you are here!)
    ├── QUICK_START.md
    ├── STEP_BY_STEP_GUIDE.md
    ├── ARCHITECTURE_DIAGRAM.md
    └── LEARNING_PATH.md
```

---

## 🎓 Learning Path

Since you know React, here's how to learn the backend:

### Week 1: Django Basics
- Understand models (database structure)
- Understand views (API endpoints)
- Understand serializers (data conversion)

### Week 2: FastAPI
- Understand routes (API endpoints)
- Understand Pydantic (data validation)
- Understand async/await

### Week 3: Integration
- Connect React to backend
- Handle authentication
- Manage state

**For detailed learning path, see [LEARNING_PATH.md](./LEARNING_PATH.md)**

---

## 🔧 Common Tasks

### Add a New Product Field

1. **Update Model** (`backend/store/models.py`)
   ```python
   class Product(models.Model):
       brand = models.CharField(max_length=100)  # Add this
   ```

2. **Create Migration**
   ```powershell
   cd backend
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Update Serializer** (`backend/store/serializers.py`)
   ```python
   fields = [..., 'brand']  # Add 'brand'
   ```

4. **Use in React**
   ```javascript
   {product.brand && <p>Brand: {product.brand}</p>}
   ```

### Add a New Page

1. **Create Component** (`frontend/src/pages/NewPage.js`)
   ```javascript
   function NewPage() {
     return <div>My New Page</div>;
   }
   ```

2. **Add Route** (`frontend/src/App.js`)
   ```javascript
   <Route path="/new-page" element={<NewPage />} />
   ```

### Add a New API Endpoint

1. **Django View** (`backend/store/views.py`)
2. **FastAPI Route** (`api/main.py`)
3. **React API Call** (`frontend/src/services/api.js`)
4. **Use in Component**

**For detailed examples, see [STEP_BY_STEP_GUIDE.md](./STEP_BY_STEP_GUIDE.md)**

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Use different port
python manage.py runserver 8002
```

### CORS Errors
- Check `backend/ecommerce/settings.py` has correct CORS settings
- Check `api/main.py` has CORS middleware

### Database Errors
```powershell
cd backend
python manage.py migrate
```

### npm Packages Not Installed
```powershell
cd frontend
npm install
```

### Virtual Environment Not Found
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

## 📖 Key Files to Understand

### Frontend
- `frontend/src/App.js` - Main app, routing
- `frontend/src/services/api.js` - All API calls
- `frontend/src/pages/Products.js` - Example page component

### Backend
- `backend/store/models.py` - Database structure
- `backend/store/views.py` - API endpoints
- `backend/store/serializers.py` - Data conversion

### API
- `api/main.py` - All API routes

---

## 🎯 Next Steps

1. ✅ **Read [QUICK_START.md](./QUICK_START.md)** - Get everything running
2. ✅ **Read [STEP_BY_STEP_GUIDE.md](./STEP_BY_STEP_GUIDE.md)** - Understand how everything works
3. ✅ **Read [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)** - See the big picture
4. ✅ **Follow [LEARNING_PATH.md](./LEARNING_PATH.md)** - Learn systematically
5. ✅ **Experiment** - Try adding features, changing things
6. ✅ **Build** - Create your own features

---

## 💡 Tips

1. **Start Small** - Don't try to understand everything at once
2. **Read Code** - Study the existing codebase
3. **Experiment** - Try changing things and see what happens
4. **Use Docs** - FastAPI docs at http://localhost:8001/docs
5. **Use Admin** - Django admin at http://localhost:8000/admin
6. **Practice** - Build features to reinforce learning

---

## 📞 Getting Help

1. **Check Documentation** - Read the guide files
2. **Check Error Messages** - They usually tell you what's wrong
3. **Check Server Logs** - Look at PowerShell windows
4. **Check Browser Console** - F12 → Console tab
5. **Check Network Tab** - F12 → Network tab to see API calls

---

## 🎉 You're Ready!

You have everything you need to:
- ✅ Run the application
- ✅ Understand the architecture
- ✅ Learn Django and FastAPI
- ✅ Build new features
- ✅ Deploy your application

**Start with [QUICK_START.md](./QUICK_START.md) and get everything running!**

Good luck! 🚀




