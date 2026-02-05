"""
Tests for the main FastAPI application.

Tests all API endpoints including categories, products, cart, orders,
wishlist, authentication, and reviews.
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from fastapi.testclient import TestClient
from httpx import AsyncClient, Response as HttpxResponse
import httpx

# Import the FastAPI app
from main import app, get_django_client, get_current_user


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def mock_django_response():
    """Create a mock httpx response."""
    def _create_response(status_code=200, json_data=None, headers=None):
        response = Mock(spec=HttpxResponse)
        response.status_code = status_code
        response.json.return_value = json_data or {}
        response.headers = headers or {}
        response.text = ""
        return response
    return _create_response


class TestRootEndpoint:
    """Test the root endpoint."""

    def test_root_endpoint(self, client):
        """Test GET / returns API information."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "E-commerce API"
        assert data["version"] == "1.0.0"
        assert data["docs"] == "/docs"


class TestHealthCheck:
    """Test the health check endpoint."""

    @pytest.mark.asyncio
    async def test_health_check_success(self, client):
        """Test health check when Django is available."""
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_response = Mock()
            mock_response.status_code = 200
            mock_client.get.return_value = mock_response
            mock_client_class.return_value.__aenter__.return_value = mock_client

            response = client.get("/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "ok"
            assert data["fastapi"] == "running"

    @pytest.mark.asyncio
    async def test_health_check_django_down(self, client):
        """Test health check when Django is down."""
        with patch('httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_client.get.side_effect = Exception("Connection refused")
            mock_client_class.return_value.__aenter__.return_value = mock_client

            response = client.get("/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "ok"
            assert data["fastapi"] == "running"
            assert "disconnected" in data["django"]


class TestCategoriesEndpoints:
    """Test category-related endpoints."""

    def test_get_categories_success(self, client, mock_django_response):
        """Test GET /categories returns list of categories."""
        mock_data = {
            "results": [
                {"id": 1, "name": "Electronics", "slug": "electronics", "description": "Electronic items"},
                {"id": 2, "name": "Clothing", "slug": "clothing", "description": "Clothing items"}
            ]
        }

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.get.return_value = mock_django_response(200, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.get("/categories")
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["name"] == "Electronics"
            assert data[1]["name"] == "Clothing"

    def test_get_categories_django_down(self, client):
        """Test GET /categories when Django is unavailable."""
        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.get.side_effect = httpx.ConnectError("Connection failed")

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.get("/categories")
            app.dependency_overrides = {}

            assert response.status_code == 503

    def test_get_category_by_slug(self, client, mock_django_response):
        """Test GET /categories/{slug} returns specific category."""
        mock_data = {
            "results": [
                {"id": 1, "name": "Electronics", "slug": "electronics", "description": "Electronic items"},
                {"id": 2, "name": "Clothing", "slug": "clothing", "description": "Clothing items"}
            ]
        }

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.get.return_value = mock_django_response(200, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.get("/categories/electronics")
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert data["slug"] == "electronics"
            assert data["name"] == "Electronics"

    def test_get_category_not_found(self, client, mock_django_response):
        """Test GET /categories/{slug} with non-existent category."""
        mock_data = {"results": []}

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.get.return_value = mock_django_response(200, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.get("/categories/nonexistent")
            app.dependency_overrides = {}

            assert response.status_code == 404


class TestProductsEndpoints:
    """Test product-related endpoints."""

    def test_get_products_success(self, client, mock_django_response):
        """Test GET /products returns list of products."""
        mock_data = {
            "results": [
                {
                    "id": 1,
                    "name": "Laptop",
                    "slug": "laptop",
                    "description": "A laptop",
                    "price": 999.99,
                    "image": None,
                    "category": {"id": 1, "name": "Electronics"},
                    "stock": 10,
                    "available": True,
                    "created_at": "2024-01-01T00:00:00Z",
                    "updated_at": "2024-01-01T00:00:00Z"
                }
            ]
        }

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.get.return_value = mock_django_response(200, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.get("/products")
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["name"] == "Laptop"

    def test_get_products_with_filters(self, client, mock_django_response):
        """Test GET /products with query parameters."""
        mock_data = {"results": []}

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.get.return_value = mock_django_response(200, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.get("/products?category=electronics&search=laptop&min_price=500")
            app.dependency_overrides = {}

            assert response.status_code == 200
            # Verify that the mock was called with correct params
            mock_client.get.assert_called_once()

    def test_get_product_by_id(self, client, mock_django_response):
        """Test GET /products/{id} returns specific product."""
        mock_data = {
            "id": 123,
            "name": "Laptop",
            "slug": "laptop",
            "description": "A laptop",
            "price": 999.99,
            "image": None,
            "category": {"id": 1, "name": "Electronics"},
            "stock": 10,
            "available": True,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.get.return_value = mock_django_response(200, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.get("/products/123")
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == 123
            assert data["name"] == "Laptop"


class TestCartEndpoints:
    """Test cart-related endpoints."""

    def test_get_cart_success(self, client, mock_django_response):
        """Test GET /cart returns user's cart items."""
        mock_data = {
            "results": [
                {
                    "id": 1,
                    "product": {
                        "id": 123,
                        "name": "Laptop",
                        "price": 999.99
                    },
                    "quantity": 2,
                    "total_price": 1999.98
                }
            ]
        }

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.get.return_value = mock_django_response(200, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.get("/cart", cookies={"sessionid": "test_session"})
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["quantity"] == 2

    def test_get_cart_unauthorized_returns_empty(self, client):
        """Test GET /cart returns empty list for unauthorized users."""
        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_response = Mock()
            mock_response.status_code = 401
            mock_client.get.side_effect = httpx.HTTPStatusError("Unauthorized", request=Mock(), response=mock_response)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.get("/cart")
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert data == []

    def test_add_to_cart_success(self, client, mock_django_response):
        """Test POST /cart adds item to cart."""
        mock_data = {
            "id": 1,
            "product": {"id": 123, "name": "Laptop"},
            "quantity": 1,
            "total_price": 999.99
        }

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.post.return_value = mock_django_response(201, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.post(
                "/cart",
                json={"product_id": 123, "quantity": 1},
                cookies={"sessionid": "test_session"}
            )
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert data["product"]["id"] == 123

    def test_update_cart_item(self, client, mock_django_response):
        """Test PUT /cart/{item_id} updates cart item quantity."""
        mock_data = {
            "id": 1,
            "product": {"id": 123, "name": "Laptop"},
            "quantity": 3,
            "total_price": 2999.97
        }

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.patch.return_value = mock_django_response(200, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.put(
                "/cart/1?quantity=3",
                cookies={"sessionid": "test_session"}
            )
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert data["quantity"] == 3

    def test_remove_from_cart(self, client, mock_django_response):
        """Test DELETE /cart/{item_id} removes item from cart."""
        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.delete.return_value = mock_django_response(204)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.delete("/cart/1", cookies={"sessionid": "test_session"})
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert "message" in data

    def test_clear_cart(self, client, mock_django_response):
        """Test DELETE /cart clears all cart items."""
        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.delete.return_value = mock_django_response(204)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.delete("/cart", cookies={"sessionid": "test_session"})
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Cart cleared"


class TestReviewEndpoints:
    """Test review-related endpoints."""

    def test_get_reviews_for_product(self, client, mock_django_response):
        """Test GET /reviews with product_id returns product reviews."""
        mock_data = {
            "results": [
                {
                    "id": 1,
                    "user": {"id": 1, "username": "testuser"},
                    "rating": 5,
                    "comment": "Great product!",
                    "created_at": "2024-01-01T00:00:00Z",
                    "updated_at": "2024-01-01T00:00:00Z"
                }
            ]
        }

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.get.return_value = mock_django_response(200, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.get("/reviews?product_id=123")
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["rating"] == 5

    def test_submit_review_success(self, client, mock_django_response):
        """Test POST /reviews submits a product review."""
        mock_data = {
            "id": 1,
            "user": {"id": 1, "username": "testuser"},
            "rating": 5,
            "comment": "Excellent!",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.post.return_value = mock_django_response(201, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.post(
                "/reviews",
                json={"product_id": 123, "rating": 5, "comment": "Excellent!"},
                cookies={"sessionid": "test_session"}
            )
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert data["rating"] == 5
            assert data["comment"] == "Excellent!"

    def test_submit_review_authentication_required(self, client):
        """Test POST /reviews requires authentication."""
        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_response = Mock()
            mock_response.status_code = 401
            mock_response.headers.get.return_value = "application/json"
            mock_response.json.return_value = {"detail": "Authentication required"}
            mock_client.post.return_value = mock_response

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.post(
                "/reviews",
                json={"product_id": 123, "rating": 5}
            )
            app.dependency_overrides = {}

            assert response.status_code == 401

    def test_get_my_reviews(self, client, mock_django_response):
        """Test GET /reviews/my_reviews returns user's reviews."""
        mock_data = {
            "results": [
                {
                    "id": 1,
                    "user": {"id": 1, "username": "testuser"},
                    "rating": 5,
                    "comment": "Great!",
                    "created_at": "2024-01-01T00:00:00Z",
                    "updated_at": "2024-01-01T00:00:00Z"
                }
            ]
        }

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.get.return_value = mock_django_response(200, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.get("/reviews/my_reviews", cookies={"sessionid": "test_session"})
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1

    def test_get_user_product_review(self, client, mock_django_response):
        """Test GET /reviews/user_product_review checks if user reviewed product."""
        mock_data = {
            "id": 1,
            "user": {"id": 1, "username": "testuser"},
            "rating": 4,
            "comment": "Good product",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.get.return_value = mock_django_response(200, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.get("/reviews/user_product_review?product_id=123", cookies={"sessionid": "test_session"})
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert data["rating"] == 4

    def test_get_user_product_review_not_found(self, client):
        """Test GET /reviews/user_product_review when no review exists."""
        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_response = Mock()
            mock_response.status_code = 404
            mock_client.get.return_value = mock_response

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.get("/reviews/user_product_review?product_id=123", cookies={"sessionid": "test_session"})
            app.dependency_overrides = {}

            assert response.status_code == 404


class TestAuthenticationEndpoints:
    """Test authentication endpoints."""

    def test_register_success(self, client, mock_django_response):
        """Test POST /auth/register creates new user."""
        mock_data = {"id": 1, "username": "newuser", "email": "new@example.com"}

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.post.return_value = mock_django_response(201, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.post(
                "/auth/register",
                json={"username": "newuser", "email": "new@example.com", "password": "password123"}
            )
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert data["username"] == "newuser"

    def test_login_success(self, client, mock_django_response):
        """Test POST /auth/login authenticates user."""
        mock_data = {"token": "test_token", "user": {"id": 1, "username": "testuser"}}

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = mock_data
            mock_response.headers.get_list.return_value = [
                "sessionid=abc123; Path=/; HttpOnly"
            ]
            mock_client.post.return_value = mock_response

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.post(
                "/auth/login",
                json={"username": "testuser", "password": "password123"}
            )
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert "user" in data


class TestWishlistEndpoints:
    """Test wishlist-related endpoints."""

    def test_get_wishlist(self, client, mock_django_response):
        """Test GET /wishlist returns user's wishlist."""
        mock_data = {
            "results": [
                {
                    "id": 123,
                    "name": "Laptop",
                    "price": 999.99,
                    "stock": 10
                }
            ]
        }

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.get.return_value = mock_django_response(200, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.get("/wishlist", cookies={"sessionid": "test_session"})
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1

    def test_add_to_wishlist(self, client, mock_django_response):
        """Test POST /wishlist/add adds product to wishlist."""
        mock_data = {"message": "Product added to wishlist"}

        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.post.return_value = mock_django_response(201, mock_data)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.post(
                "/wishlist/add",
                json={"product_id": 123},
                cookies={"sessionid": "test_session"}
            )
            app.dependency_overrides = {}

            assert response.status_code == 200

    def test_remove_from_wishlist(self, client, mock_django_response):
        """Test DELETE /wishlist/remove removes product from wishlist."""
        with patch('main.get_django_client') as mock_client_dep:
            mock_client = AsyncMock(spec=AsyncClient)
            mock_client.delete.return_value = mock_django_response(204)

            async def mock_get_client():
                yield mock_client

            app.dependency_overrides[get_django_client] = mock_get_client

            response = client.delete(
                "/wishlist/remove?product_id=123",
                cookies={"sessionid": "test_session"}
            )
            app.dependency_overrides = {}

            assert response.status_code == 200
            data = response.json()
            assert "message" in data