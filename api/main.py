from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import httpx

from logging_middleware import ActionLoggingMiddleware

app = FastAPI(title="E-commerce API", version="1.0.0")

# Add action logging middleware (must be added before CORS)
app.add_middleware(ActionLoggingMiddleware)

# Global exception handler for connection errors
@app.exception_handler(httpx.ConnectError)
async def connect_error_handler(request: Request, exc: httpx.ConnectError):
    return JSONResponse(
        status_code=503,
        content={
            "detail": "Django backend is not available. Please ensure Django is running on http://localhost:8000",
            "error": str(exc)
        }
    )

# CORS middleware - MUST be added before routes
# For development, allow specific origins with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3000/",
        "http://127.0.0.1:3000/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Django backend URL
DJANGO_BASE_URL = "http://localhost:8000/api"

security = HTTPBearer(auto_error=False)


# Pydantic models
class Product(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    price: float
    image: Optional[str] = None
    category: dict
    stock: int
    available: bool
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class Category(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class CartItem(BaseModel):
    id: int
    product: Product
    quantity: int
    total_price: float

    class Config:
        from_attributes = True


class OrderItem(BaseModel):
    id: int
    product: Product
    quantity: int
    price: float
    total_price: float

    class Config:
        from_attributes = True


class Order(BaseModel):
    id: int
    user: dict
    total_amount: float
    status: str
    shipping_address: str
    items: List[OrderItem]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class OrderCreate(BaseModel):
    shipping_address: str


class RegisterRequest(BaseModel):
    username: str
    email: Optional[str] = None
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


# Helper function to get Django API client
async def get_django_client():
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        yield client


# Helper function to get authenticated user
async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    # In a real app, you'd validate the token here
    # For now, we'll pass it through to Django
    # Token can come from Authorization header or session cookies
    token = credentials.credentials if credentials else None
    return token


# Categories endpoints
@app.get("/categories", response_model=List[Category])
async def get_categories(client: httpx.AsyncClient = Depends(get_django_client)):
    try:
        response = await client.get(f"{DJANGO_BASE_URL}/categories/")
        response.raise_for_status()
        data = response.json()
        # Django REST Framework returns paginated response, extract results
        if isinstance(data, dict) and "results" in data:
            return data["results"]
        return data if isinstance(data, list) else []
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Django backend is not available. Please ensure Django is running on http://localhost:8000"
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/categories/{category_slug}", response_model=Category)
async def get_category(
    category_slug: str,
    client: httpx.AsyncClient = Depends(get_django_client)
):
    try:
        response = await client.get(f"{DJANGO_BASE_URL}/categories/")
        response.raise_for_status()
        data = response.json()
        # Django REST Framework returns paginated response, extract results
        categories = data["results"] if isinstance(data, dict) and "results" in data else (data if isinstance(data, list) else [])
        category = next((c for c in categories if c.get("slug") == category_slug), None)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Django backend is not available. Please ensure Django is running on http://localhost:8000"
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Products endpoints
@app.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    flash_sale: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    in_stock: Optional[bool] = None,
    has_discount: Optional[bool] = None,
    sort_by: Optional[str] = None,
    client: httpx.AsyncClient = Depends(get_django_client)
):
    try:
        params = {}
        if category:
            params["category"] = category
        if search:
            params["search"] = search
        if featured:
            params["featured"] = "true"
        if flash_sale:
            params["flash_sale"] = "true"
        if min_price is not None:
            params["min_price"] = str(min_price)
        if max_price is not None:
            params["max_price"] = str(max_price)
        if min_rating is not None:
            params["min_rating"] = str(min_rating)
        if in_stock:
            params["in_stock"] = "true"
        if has_discount:
            params["has_discount"] = "true"
        if sort_by:
            params["sort_by"] = sort_by
        
        response = await client.get(f"{DJANGO_BASE_URL}/products/", params=params)
        response.raise_for_status()
        data = response.json()
        # Django REST Framework returns paginated response, extract results
        if isinstance(data, dict) and "results" in data:
            return data["results"]
        return data if isinstance(data, list) else []
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Django backend is not available. Please ensure Django is running on http://localhost:8000"
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/products/{product_id}", response_model=Product)
async def get_product(
    product_id: int,
    client: httpx.AsyncClient = Depends(get_django_client)
):
    try:
        response = await client.get(f"{DJANGO_BASE_URL}/products/{product_id}/")
        response.raise_for_status()
        return response.json()
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Django backend is not available. Please ensure Django is running on http://localhost:8000"
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Cart endpoints
@app.get("/cart", response_model=List[CartItem])
async def get_cart(
    request: Request,
    token: Optional[str] = Depends(get_current_user),
    client: httpx.AsyncClient = Depends(get_django_client)
):
    try:
        # Forward cookies for session authentication
        cookies = dict(request.cookies)
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = await client.get(
            f"{DJANGO_BASE_URL}/cart/",
            headers=headers,
            cookies=cookies
        )
        response.raise_for_status()
        data = response.json()
        # Django REST Framework returns paginated response, extract results
        if isinstance(data, dict) and "results" in data:
            return data["results"]
        return data if isinstance(data, list) else []
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Django backend is not available. Please ensure Django is running on http://localhost:8000"
        )
    except httpx.HTTPStatusError as e:
        # If 403 or 401, return empty list instead of error (user not authenticated)
        if e.response.status_code in [401, 403]:
            return []
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/cart", response_model=CartItem)
async def add_to_cart(
    item: CartItemCreate,
    request: Request,
    token: Optional[str] = Depends(get_current_user),
    client: httpx.AsyncClient = Depends(get_django_client)
):
    try:
        # Forward all cookies from the client request to Django
        cookies = dict(request.cookies)
        # Also get cookies from Cookie header
        cookie_header = request.headers.get("cookie", "")
        if cookie_header:
            # Parse cookies from header and merge with request.cookies
            for cookie_pair in cookie_header.split(";"):
                if "=" in cookie_pair:
                    key, value = cookie_pair.strip().split("=", 1)
                    cookies[key.strip()] = value.strip()
        
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        data = {
            "product_id": item.product_id,
            "quantity": item.quantity
        }
        
        response = await client.post(
            f"{DJANGO_BASE_URL}/cart/",
            json=data,
            headers=headers,
            cookies=cookies
        )
        
        # Check if response indicates authentication failure
        if response.status_code == 401 or response.status_code == 403:
            error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}
            error_detail = error_data.get("detail", error_data.get("error", "Authentication required"))
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Authentication error: {error_detail}. Please log in first."
            )
        
        response.raise_for_status()
        return response.json()
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Django backend is not available. Please ensure Django is running on http://localhost:8000"
        )
    except httpx.HTTPStatusError as e:
        # Log the actual error from Django
        error_detail = "Unknown error"
        try:
            if e.response.headers.get("content-type", "").startswith("application/json"):
                error_data = e.response.json()
                error_detail = error_data.get("detail", error_data.get("error", str(e)))
            else:
                error_detail = e.response.text[:200] if e.response.text else str(e)
        except:
            error_detail = str(e)
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Django error: {error_detail}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.put("/cart/{item_id}", response_model=CartItem)
@app.patch("/cart/{item_id}", response_model=CartItem)
async def update_cart_item(
    item_id: int,
    request: Request,
    quantity: Optional[int] = None,
    token: Optional[str] = Depends(get_current_user),
    client: httpx.AsyncClient = Depends(get_django_client)
):
    cookies = dict(request.cookies)
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    # Get quantity from query params or request body
    if quantity is None:
        try:
            body = await request.json()
            quantity = body.get('quantity')
        except:
            quantity = None
    
    if quantity is None:
        raise HTTPException(status_code=400, detail="Quantity is required")
    
    data = {"quantity": quantity}
    response = await client.patch(
        f"{DJANGO_BASE_URL}/cart/{item_id}/",
        json=data,
        headers=headers,
        cookies=cookies
    )
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Cart item not found")
    response.raise_for_status()
    return response.json()


@app.delete("/cart/{item_id}")
async def remove_from_cart(
    item_id: int,
    request: Request,
    token: Optional[str] = Depends(get_current_user),
    client: httpx.AsyncClient = Depends(get_django_client)
):
    cookies = dict(request.cookies)
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    response = await client.delete(
        f"{DJANGO_BASE_URL}/cart/{item_id}/",
        headers=headers,
        cookies=cookies
    )
    response.raise_for_status()
    return {"message": "Item removed from cart"}


@app.delete("/cart")
async def clear_cart(
    request: Request,
    token: Optional[str] = Depends(get_current_user),
    client: httpx.AsyncClient = Depends(get_django_client)
):
    cookies = dict(request.cookies)
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    response = await client.delete(
        f"{DJANGO_BASE_URL}/cart/clear/",
        headers=headers,
        cookies=cookies
    )
    response.raise_for_status()
    return {"message": "Cart cleared"}


# Orders endpoints
@app.get("/orders", response_model=List[Order])
async def get_orders(
    request: Request,
    token: Optional[str] = Depends(get_current_user),
    client: httpx.AsyncClient = Depends(get_django_client)
):
    try:
        cookies = dict(request.cookies)
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = await client.get(
            f"{DJANGO_BASE_URL}/orders/",
            headers=headers,
            cookies=cookies
        )
        response.raise_for_status()
        data = response.json()
        # Django REST Framework returns paginated response, extract results
        if isinstance(data, dict) and "results" in data:
            return data["results"]
        return data if isinstance(data, list) else []
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Django backend is not available. Please ensure Django is running on http://localhost:8000"
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/orders/{order_id}", response_model=Order)
async def get_order(
    order_id: int,
    request: Request,
    token: Optional[str] = Depends(get_current_user),
    client: httpx.AsyncClient = Depends(get_django_client)
):
    cookies = dict(request.cookies)
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    response = await client.get(
        f"{DJANGO_BASE_URL}/orders/{order_id}/",
        headers=headers,
        cookies=cookies
    )
    response.raise_for_status()
    return response.json()


@app.post("/orders", response_model=Order)
async def create_order(
    order: OrderCreate,
    request: Request,
    token: Optional[str] = Depends(get_current_user),
    client: httpx.AsyncClient = Depends(get_django_client)
):
    cookies = dict(request.cookies)
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    data = {"shipping_address": order.shipping_address}
    response = await client.post(
        f"{DJANGO_BASE_URL}/orders/",
        json=data,
        headers=headers,
        cookies=cookies
    )
    response.raise_for_status()
    return response.json()


# Wishlist endpoints
@app.get("/wishlist", response_model=List[Product])
async def get_wishlist(
    request: Request,
    token: Optional[str] = Depends(get_current_user),
    client: httpx.AsyncClient = Depends(get_django_client)
):
    try:
        cookies = dict(request.cookies)
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = await client.get(
            f"{DJANGO_BASE_URL}/wishlist/products/",
            headers=headers,
            cookies=cookies
        )
        response.raise_for_status()
        data = response.json()
        # Django REST Framework returns paginated response, extract results
        if isinstance(data, dict) and "results" in data:
            return data["results"]
        return data if isinstance(data, list) else []
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Django backend is not available. Please ensure Django is running on http://localhost:8000"
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/wishlist/add")
async def add_to_wishlist(
    request: Request,
    product_id: Optional[int] = None,
    token: Optional[str] = Depends(get_current_user),
    client: httpx.AsyncClient = Depends(get_django_client)
):
    cookies = dict(request.cookies)
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    # Get product_id from query params or request body
    if product_id is None:
        try:
            body = await request.json()
            product_id = body.get('product_id')
        except:
            # Try query params
            product_id = request.query_params.get('product_id')
            if product_id:
                product_id = int(product_id)
    
    if product_id is None:
        raise HTTPException(status_code=400, detail="product_id is required")
    
    data = {"product_id": product_id}
    response = await client.post(
        f"{DJANGO_BASE_URL}/wishlist/add/",
        json=data,
        headers=headers,
        cookies=cookies
    )
    response.raise_for_status()
    return response.json()


@app.delete("/wishlist/remove")
async def remove_from_wishlist(
    product_id: int,
    request: Request,
    token: Optional[str] = Depends(get_current_user),
    client: httpx.AsyncClient = Depends(get_django_client)
):
    cookies = dict(request.cookies)
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    data = {"product_id": product_id}
    response = await client.delete(
        f"{DJANGO_BASE_URL}/wishlist/remove/",
        json=data,
        headers=headers,
        cookies=cookies
    )
    response.raise_for_status()
    return {"message": "Product removed from wishlist"}


# Authentication endpoints
@app.post("/auth/register")
async def register(
    register_data: RegisterRequest,
    client: httpx.AsyncClient = Depends(get_django_client)
):
    data = {
        "username": register_data.username,
        "password": register_data.password
    }
    if register_data.email:
        data["email"] = register_data.email
    response = await client.post(f"{DJANGO_BASE_URL}/auth/register/", json=data)
    response.raise_for_status()
    return response.json()


@app.post("/auth/login")
async def login(
    request: Request,
    login_data: LoginRequest,
    client: httpx.AsyncClient = Depends(get_django_client)
):
    try:
        data = {
            "username": login_data.username,
            "password": login_data.password
        }
        response = await client.post(
            f"{DJANGO_BASE_URL}/auth/login/",
            json=data,
            cookies=dict(request.cookies)
        )
        response.raise_for_status()
        result = response.json()
        
        # Create response with cookies from Django
        fastapi_response = JSONResponse(content=result)
        
        # Forward all Set-Cookie headers from Django to the client
        for cookie_header in response.headers.get_list("Set-Cookie"):
            # Parse the Set-Cookie header
            parts = cookie_header.split(";")
            cookie_name_value = parts[0].split("=", 1)
            if len(cookie_name_value) == 2:
                cookie_name = cookie_name_value[0].strip()
                cookie_value = cookie_name_value[1].strip()
                
                # Extract cookie attributes
                cookie_attrs = {}
                for part in parts[1:]:
                    part = part.strip()
                    if "=" in part:
                        key, value = part.split("=", 1)
                        cookie_attrs[key.lower()] = value
                    else:
                        cookie_attrs[part.lower()] = True
                
                # Set cookie with appropriate attributes for browser
                # Use None for domain to allow browser to set it automatically
                fastapi_response.set_cookie(
                    key=cookie_name,
                    value=cookie_value,
                    domain=None,  # Let browser handle domain
                    path=cookie_attrs.get("path", "/"),
                    secure="secure" in cookie_attrs,
                    httponly="httponly" in cookie_attrs,
                    samesite=cookie_attrs.get("samesite", "lax")
                )
        
        return fastapi_response
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Django backend is not available. Please ensure Django is running on http://localhost:8000"
        )
    except httpx.HTTPStatusError as e:
        error_detail = "Unknown error"
        try:
            if e.response.headers.get("content-type", "").startswith("application/json"):
                error_data = e.response.json()
                error_detail = error_data.get("detail", error_data.get("error", str(e)))
            else:
                error_detail = e.response.text[:200] if e.response.text else str(e)
        except:
            error_detail = str(e)
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Django error: {error_detail}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/")
async def root():
    return {
        "message": "E-commerce API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test Django connection
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{DJANGO_BASE_URL}/categories/")
            django_status = "connected" if response.status_code == 200 else "error"
    except Exception as e:
        django_status = f"disconnected: {str(e)}"
    
    return {
        "status": "ok",
        "fastapi": "running",
        "django": django_status,
        "django_url": DJANGO_BASE_URL
    }

