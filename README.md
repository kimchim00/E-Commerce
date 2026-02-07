# E-Commerce Platform

A full-stack e-commerce web application built with Django REST Framework, FastAPI, and React. The system follows an API gateway architecture where a FastAPI service sits between the React frontend and the Django backend, handling request proxying and structured action logging for every user interaction.

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [First-Time Setup](#first-time-setup)
  - [Running All Services](#running-all-services)
  - [Running Services Individually](#running-services-individually)
- [Services Overview](#services-overview)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Products and Categories](#products-and-categories)
  - [Cart](#cart)
  - [Orders](#orders)
  - [Reviews and Ratings](#reviews-and-ratings)
  - [Wishlist](#wishlist)
- [Project Structure](#project-structure)
- [Logging and Monitoring](#logging-and-monitoring)
- [Configuration](#configuration)

## Architecture

```
+-------------------+        +-------------------+        +-------------------+
|                   |  HTTP  |                   |  HTTP  |                   |
|  React Frontend   +------->+  FastAPI Gateway   +------->+  Django Backend   |
|  (Port 3000)      |        |  (Port 8001)      |        |  (Port 8000)      |
|                   |        |                   |        |                   |
+-------------------+        +--------+----------+        +--------+----------+
                                      |                            |
                                      v                            v
                             +--------+----------+        +--------+----------+
                             |  logs/             |        |  db.sqlite3       |
                             |  ecommerce.jsonl   |        |  media/           |
                             +-------------------+        +-------------------+
```

The frontend sends all requests to the FastAPI gateway. The gateway logs every request as structured JSONL, then proxies it to Django where the actual business logic runs. Django handles data persistence, authentication, and all domain operations. Responses flow back through the same path.

## Tech Stack

**Backend** -- Python 3.10+
- Django 5.x with Django REST Framework
- SQLite (development)
- Pillow for image handling

**API Gateway** -- Python 3.10+
- FastAPI with Uvicorn
- httpx for async HTTP proxying
- Custom middleware for JSONL action logging

**Frontend** -- Node.js 18+
- React 18 with React Router 6
- Ant Design 5 component library
- Axios HTTP client

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher (with npm)
- Git

## Getting Started

### First-Time Setup

Clone the repository and run the setup script. This installs all dependencies for the backend, API gateway, and frontend.

**Windows:**
```
setup.bat
```

**Linux / macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

The setup script will:
1. Create a Python virtual environment in `backend/venv/`
2. Install Django and API gateway dependencies
3. Run database migrations
4. Install frontend npm packages

### Running All Services

After setup is complete, use the run script to start all three services at once.

**Windows:**
```
run.bat
```
This opens three separate terminal windows -- one for each service. To stop everything, close each terminal window or press `Ctrl+C` in each.

**Linux / macOS:**
```bash
chmod +x run.sh
./run.sh
```
This starts all services as background processes and writes their output to log files in the `logs/` directory. Press `Ctrl+C` to stop all services at once.

Once running:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8001 (and interactive docs at http://localhost:8001/docs)
- Django Backend: http://localhost:8000

### Running Services Individually

If you prefer to start each service in its own terminal:

**1. Django Backend** (must start first)
```bash
cd backend
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/macOS
python manage.py runserver
```

**2. FastAPI Gateway**
```bash
cd api
..\backend\venv\Scripts\activate        # Windows
# source ../backend/venv/bin/activate   # Linux/macOS
uvicorn main:app --reload --port 8001
```

**3. React Frontend**
```bash
cd frontend
npm start
```

## Services Overview

| Service | Port | Role |
|---|---|---|
| Django Backend | 8000 | Business logic, database, authentication, REST API |
| FastAPI Gateway | 8001 | Request proxying, action logging, CORS handling |
| React Frontend | 3000 | User interface, SPA |

The FastAPI gateway is not optional. The frontend is configured to send requests to port 8001, and the gateway adds structured logging to every request before forwarding it to Django. This separation keeps the logging concern out of the Django codebase entirely.

## API Reference

All endpoints below are exposed through the FastAPI gateway at `http://localhost:8001`.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login and receive auth token |

**Register** -- `POST /auth/register`
```json
{ "username": "john", "email": "john@example.com", "password": "securepass" }
```

**Login** -- `POST /auth/login`
```json
{ "username": "john", "password": "securepass" }
```

### Products and Categories

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/categories` | No | List all categories |
| GET | `/categories/{slug}` | No | Get a single category |
| GET | `/products` | No | List products (supports filters) |
| GET | `/products/{id}` | No | Get product details |

**Product filters** -- all optional query parameters on `GET /products`:
`category`, `search`, `featured`, `flash_sale`, `min_price`, `max_price`, `min_rating`, `in_stock`, `has_discount`, `sort_by`

### Cart

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/cart` | Yes | View cart items |
| POST | `/cart` | Yes | Add item to cart |
| PUT | `/cart/{id}` | Yes | Update item quantity |
| DELETE | `/cart/{id}` | Yes | Remove item from cart |
| DELETE | `/cart` | Yes | Clear entire cart |

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/orders` | Yes | List user's orders |
| GET | `/orders/{id}` | Yes | Get order details |
| POST | `/orders` | Yes | Place a new order |

### Reviews and Ratings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/reviews?product_id={id}` | No | List reviews for a product |
| POST | `/reviews` | Yes | Submit or update a review |
| PUT | `/reviews/{id}` | Yes | Update an existing review |
| DELETE | `/reviews/{id}` | Yes | Delete a review |
| GET | `/reviews/my_reviews` | Yes | List current user's reviews |
| GET | `/reviews/user_product_review?product_id={id}` | Yes | Check if user reviewed a product |

Each user can submit one review per product (1-5 star rating with optional comment). Submitting a review for a product you have already reviewed will update the existing review. Product rating averages are recalculated automatically.

### Wishlist

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/wishlist/products` | Yes | List wishlist items |
| POST | `/wishlist/add` | Yes | Add product to wishlist |
| DELETE | `/wishlist/remove` | Yes | Remove product from wishlist |

`POST /wishlist/add` and `DELETE /wishlist/remove` both accept `{ "product_id": <int> }` in the request body.

## Project Structure

```
E-Commerce/
├── backend/                    # Django REST Framework
│   ├── ecommerce/              #   Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── store/                  #   Main application
│   │   ├── models.py           #     Product, Order, Cart, Review, Wishlist
│   │   ├── views.py            #     Product and category endpoints
│   │   ├── serializers.py      #     DRF serializers
│   │   ├── auth_views.py       #     Register and login
│   │   ├── review_views.py     #     Review CRUD
│   │   ├── wishlist_views.py   #     Wishlist management
│   │   └── urls.py             #     URL routing
│   ├── manage.py
│   └── requirements.txt
│
├── api/                        # FastAPI Gateway
│   ├── main.py                 #   All gateway endpoints
│   ├── logging_middleware.py   #   Request/response logging
│   ├── logging_config.py       #   JSONL file handler with rotation
│   ├── action_mapper.py        #   Maps paths to business actions
│   └── requirements.txt
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── pages/              #   Page components
│   │   ├── components/         #   Reusable UI components
│   │   └── services/api.js     #   API client (Axios)
│   └── package.json
│
├── logs/                       # Generated at runtime
│   └── ecommerce.jsonl         #   Structured action logs
│
├── setup.bat                   # Windows dependency installer
├── setup.sh                    # Linux/macOS dependency installer
├── run.bat                     # Windows service launcher
└── run.sh                      # Linux/macOS service launcher
```

## Logging and Monitoring

Every request that passes through the FastAPI gateway is logged to `logs/ecommerce.jsonl` in JSON Lines format. Each log entry captures:

- Timestamp, HTTP method, path, status code, and response time
- Mapped business action (e.g., `add_to_cart`, `submit_review`, `search_products`)
- User identity (session ID, user ID if authenticated)
- Client metadata (IP address, user agent)
- Business context (product ID, rating value, search query, applied filters)

Log files rotate automatically at 50 MB, keeping 10 backups.

These logs are consumed by the companion [Monitoring Dashboard](../Monitoring_Dashboard/) project, which provides real-time analytics, per-endpoint latency percentiles, error tracking, and traffic analysis.

## Configuration

### Django Backend (`backend/ecommerce/settings.py`)

| Setting | Value | Notes |
|---|---|---|
| `DEBUG` | `True` | Set to `False` in production |
| `ALLOWED_HOSTS` | `['*']` | Restrict in production |
| `DATABASES` | SQLite | Swap to PostgreSQL for production |
| `CORS_ALLOWED_ORIGINS` | `localhost:3000, localhost:8001` | Frontend and gateway origins |

### FastAPI Gateway (`api/main.py`)

| Setting | Value | Notes |
|---|---|---|
| `DJANGO_BASE_URL` | `http://localhost:8000/api` | Django backend address |
| CORS origins | `localhost:3000` | Frontend origin |
| Client timeout | 30 seconds | For proxied requests |

### React Frontend (`frontend/src/services/api.js`)

| Setting | Value | Notes |
|---|---|---|
| `API_BASE_URL` | `http://localhost:8001` | Points to FastAPI gateway |
