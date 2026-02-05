"""
Tests for the action_mapper module.

Tests the UserAction enum, path pattern matching, session extraction,
and context extraction functionality.
"""

import pytest
from unittest.mock import Mock, MagicMock
from action_mapper import (
    UserAction,
    map_path_to_action,
    extract_session_info,
    extract_context_from_request
)


class TestUserAction:
    """Test the UserAction enum."""

    def test_user_action_values(self):
        """Test that UserAction enum has expected values."""
        assert UserAction.AUTH_REGISTER.value == "auth_register"
        assert UserAction.AUTH_LOGIN.value == "auth_login"
        assert UserAction.VIEW_PRODUCTS.value == "view_products"
        assert UserAction.ADD_TO_CART.value == "add_to_cart"
        assert UserAction.VIEW_WISHLIST.value == "view_wishlist"
        assert UserAction.SUBMIT_REVIEW.value == "submit_review"
        assert UserAction.UNKNOWN.value == "unknown"


class TestMapPathToAction:
    """Test the map_path_to_action function."""

    def test_auth_register(self):
        """Test registration action mapping."""
        assert map_path_to_action("/auth/register", "POST") == "auth_register"
        assert map_path_to_action("/auth/register/", "POST") == "auth_register"

    def test_auth_login(self):
        """Test login action mapping."""
        assert map_path_to_action("/auth/login", "POST") == "auth_login"
        assert map_path_to_action("/auth/login/", "POST") == "auth_login"

    def test_view_categories(self):
        """Test view categories action mapping."""
        assert map_path_to_action("/categories", "GET") == "view_categories"
        assert map_path_to_action("/categories/", "GET") == "view_categories"

    def test_view_category(self):
        """Test view single category action mapping."""
        assert map_path_to_action("/categories/electronics", "GET") == "view_category"
        assert map_path_to_action("/categories/clothing/", "GET") == "view_category"

    def test_view_products(self):
        """Test view products action mapping."""
        assert map_path_to_action("/products", "GET") == "view_products"
        assert map_path_to_action("/products/", "GET") == "view_products"

    def test_search_products(self):
        """Test search products action mapping with query params."""
        assert map_path_to_action("/products", "GET", {"search": "laptop"}) == "search_products"
        assert map_path_to_action("/products/", "GET", {"category": "electronics"}) == "search_products"
        assert map_path_to_action("/products", "GET", {"min_price": "100"}) == "search_products"
        assert map_path_to_action("/products", "GET", {"max_price": "500"}) == "search_products"
        assert map_path_to_action("/products", "GET", {"featured": "true"}) == "search_products"
        assert map_path_to_action("/products", "GET", {"flash_sale": "true"}) == "search_products"

    def test_view_product_detail(self):
        """Test view product detail action mapping."""
        assert map_path_to_action("/products/123", "GET") == "view_product_detail"
        assert map_path_to_action("/products/456/", "GET") == "view_product_detail"

    def test_cart_operations(self):
        """Test cart-related action mappings."""
        assert map_path_to_action("/cart", "GET") == "view_cart"
        assert map_path_to_action("/cart/", "GET") == "view_cart"
        assert map_path_to_action("/cart", "POST") == "add_to_cart"
        assert map_path_to_action("/cart/123", "PUT") == "update_cart_item"
        assert map_path_to_action("/cart/123", "PATCH") == "update_cart_item"
        assert map_path_to_action("/cart/123", "DELETE") == "remove_from_cart"
        assert map_path_to_action("/cart", "DELETE") == "clear_cart"

    def test_order_operations(self):
        """Test order-related action mappings."""
        assert map_path_to_action("/orders", "GET") == "view_orders"
        assert map_path_to_action("/orders/", "GET") == "view_orders"
        assert map_path_to_action("/orders", "POST") == "create_order"
        assert map_path_to_action("/orders/123", "GET") == "view_order_detail"

    def test_wishlist_operations(self):
        """Test wishlist-related action mappings."""
        assert map_path_to_action("/wishlist", "GET") == "view_wishlist"
        assert map_path_to_action("/wishlist/products", "GET") == "view_wishlist"
        assert map_path_to_action("/wishlist/add", "POST") == "add_to_wishlist"
        assert map_path_to_action("/wishlist/remove", "DELETE") == "remove_from_wishlist"

    def test_review_operations(self):
        """Test review-related action mappings."""
        assert map_path_to_action("/reviews", "GET") == "view_reviews"
        assert map_path_to_action("/reviews/", "GET") == "view_reviews"
        assert map_path_to_action("/reviews", "POST") == "submit_review"
        assert map_path_to_action("/reviews/my_reviews", "GET") == "view_my_reviews"
        assert map_path_to_action("/reviews/user_product_review", "GET") == "view_user_product_review"

    def test_system_operations(self):
        """Test system-related action mappings."""
        assert map_path_to_action("/health", "GET") == "health_check"
        assert map_path_to_action("/", "GET") == "api_root"

    def test_unknown_path(self):
        """Test unknown path returns UNKNOWN action."""
        assert map_path_to_action("/unknown/path", "GET") == "unknown"
        assert map_path_to_action("/products", "DELETE") == "unknown"

    def test_wrong_method(self):
        """Test wrong HTTP method returns UNKNOWN action."""
        assert map_path_to_action("/auth/register", "GET") == "unknown"
        assert map_path_to_action("/cart", "PUT") == "unknown"


class TestExtractSessionInfo:
    """Test the extract_session_info function."""

    def test_no_session_no_auth(self):
        """Test with no session or authorization."""
        request = Mock()
        request.cookies.get.return_value = None
        request.headers.get.return_value = ""

        result = extract_session_info(request)

        assert result["session_id"] is None
        assert result["is_authenticated"] is False
        assert "user_id" not in result

    def test_with_session_id(self):
        """Test with session ID in cookies."""
        request = Mock()
        request.cookies.get.return_value = "abc123session456"
        request.headers.get.return_value = ""

        result = extract_session_info(request)

        assert result["session_id"] == "abc123se..."
        assert result["is_authenticated"] is True

    def test_with_short_session_id(self):
        """Test with short session ID (less than 8 chars)."""
        request = Mock()
        request.cookies.get.return_value = "short"
        request.headers.get.return_value = ""

        result = extract_session_info(request)

        assert result["session_id"] == "short"
        assert result["is_authenticated"] is True

    def test_with_jwt_token(self):
        """Test with JWT token in Authorization header."""
        import base64
        import json

        # Create a mock JWT token
        payload = {"user_id": 42}
        encoded_payload = base64.urlsafe_b64encode(
            json.dumps(payload).encode()
        ).decode().rstrip("=")
        token = f"header.{encoded_payload}.signature"

        request = Mock()
        request.cookies.get.return_value = None
        request.headers.get.return_value = f"Bearer {token}"

        result = extract_session_info(request)

        assert result["user_id"] == 42
        assert result["is_authenticated"] is True

    def test_with_jwt_token_sub_field(self):
        """Test with JWT token using 'sub' field for user ID."""
        import base64
        import json

        payload = {"sub": 99}
        encoded_payload = base64.urlsafe_b64encode(
            json.dumps(payload).encode()
        ).decode().rstrip("=")
        token = f"header.{encoded_payload}.signature"

        request = Mock()
        request.cookies.get.return_value = None
        request.headers.get.return_value = f"Bearer {token}"

        result = extract_session_info(request)

        assert result["user_id"] == 99
        assert result["is_authenticated"] is True

    def test_with_invalid_jwt_token(self):
        """Test with invalid JWT token (should not crash)."""
        request = Mock()
        request.cookies.get.return_value = None
        request.headers.get.return_value = "Bearer invalid_token"

        result = extract_session_info(request)

        assert result["is_authenticated"] is False

    def test_with_both_session_and_token(self):
        """Test with both session and JWT token."""
        import base64
        import json

        payload = {"user_id": 123}
        encoded_payload = base64.urlsafe_b64encode(
            json.dumps(payload).encode()
        ).decode().rstrip("=")
        token = f"header.{encoded_payload}.signature"

        request = Mock()
        request.cookies.get.return_value = "session123456789"
        request.headers.get.return_value = f"Bearer {token}"

        result = extract_session_info(request)

        assert result["user_id"] == 123
        assert result["session_id"] == "session1..."
        assert result["is_authenticated"] is True


class TestExtractContextFromRequest:
    """Test the extract_context_from_request function."""

    def test_extract_product_id_from_path(self):
        """Test extracting product ID from path."""
        context = extract_context_from_request("/products/123", "GET")
        assert context["product_id"] == 123

    def test_extract_category_slug_from_path(self):
        """Test extracting category slug from path."""
        context = extract_context_from_request("/categories/electronics", "GET")
        assert context["category_slug"] == "electronics"

    def test_extract_cart_item_id_from_path(self):
        """Test extracting cart item ID from path."""
        context = extract_context_from_request("/cart/456", "DELETE")
        assert context["cart_item_id"] == 456

    def test_extract_order_id_from_path(self):
        """Test extracting order ID from path."""
        context = extract_context_from_request("/orders/789", "GET")
        assert context["order_id"] == 789

    def test_extract_product_id_from_review_query(self):
        """Test extracting product ID from review query params."""
        context = extract_context_from_request(
            "/reviews", "GET", query_params={"product_id": "123"}
        )
        assert context["product_id"] == "123"

    def test_extract_review_context_from_post_body(self):
        """Test extracting review context from POST body."""
        request_body = {
            "product_id": 456,
            "rating": 5,
            "comment": "Great product!"
        }
        context = extract_context_from_request(
            "/reviews", "POST", request_body=request_body
        )
        assert context["product_id"] == 456
        assert context["rating_value"] == 5
        assert context["has_comment"] is True

    def test_extract_review_without_comment(self):
        """Test extracting review context without comment."""
        request_body = {
            "product_id": 456,
            "rating": 5,
            "comment": ""
        }
        context = extract_context_from_request(
            "/reviews", "POST", request_body=request_body
        )
        assert "has_comment" not in context

    def test_extract_search_query(self):
        """Test extracting search query from params."""
        context = extract_context_from_request(
            "/products", "GET", query_params={"search": "laptop"}
        )
        assert context["search_query"] == "laptop"

    def test_extract_filter_category(self):
        """Test extracting category filter from params."""
        context = extract_context_from_request(
            "/products", "GET", query_params={"category": "electronics"}
        )
        assert context["filter_category"] == "electronics"

    def test_extract_multiple_filters(self):
        """Test extracting multiple filter parameters."""
        query_params = {
            "min_price": "100",
            "max_price": "500",
            "min_rating": "4",
            "in_stock": "true",
            "featured": "true",
            "sort_by": "price"
        }
        context = extract_context_from_request("/products", "GET", query_params=query_params)

        assert "filters_applied" in context
        assert context["filters_applied"]["min_price"] == "100"
        assert context["filters_applied"]["max_price"] == "500"
        assert context["filters_applied"]["min_rating"] == "4"
        assert context["filters_applied"]["in_stock"] == "true"
        assert context["filters_applied"]["featured"] == "true"
        assert context["filters_applied"]["sort_by"] == "price"

    def test_no_context_to_extract(self):
        """Test when there's no context to extract."""
        context = extract_context_from_request("/unknown", "GET")
        assert context is None

    def test_multiple_context_sources(self):
        """Test extracting context from multiple sources."""
        query_params = {"search": "phone"}
        context = extract_context_from_request(
            "/products/123", "GET", query_params=query_params
        )
        assert context["product_id"] == 123
        assert context["search_query"] == "phone"