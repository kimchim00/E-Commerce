"""
Action Mapper for E-Commerce API Logging

Maps request paths and methods to user action names for the logging system.
"""

import re
from enum import Enum
from typing import Optional
from fastapi import Request


class UserAction(str, Enum):
    """Enumeration of all user actions in the e-commerce system."""

    # Authentication
    AUTH_REGISTER = "auth_register"
    AUTH_LOGIN = "auth_login"

    # Categories
    VIEW_CATEGORIES = "view_categories"
    VIEW_CATEGORY = "view_category"

    # Products
    VIEW_PRODUCTS = "view_products"
    VIEW_PRODUCT_DETAIL = "view_product_detail"
    SEARCH_PRODUCTS = "search_products"

    # Cart
    VIEW_CART = "view_cart"
    ADD_TO_CART = "add_to_cart"
    UPDATE_CART_ITEM = "update_cart_item"
    REMOVE_FROM_CART = "remove_from_cart"
    CLEAR_CART = "clear_cart"

    # Orders
    VIEW_ORDERS = "view_orders"
    VIEW_ORDER_DETAIL = "view_order_detail"
    CREATE_ORDER = "create_order"

    # Wishlist
    VIEW_WISHLIST = "view_wishlist"
    ADD_TO_WISHLIST = "add_to_wishlist"
    REMOVE_FROM_WISHLIST = "remove_from_wishlist"

    # Reviews
    VIEW_REVIEWS = "view_reviews"
    SUBMIT_REVIEW = "submit_review"
    VIEW_MY_REVIEWS = "view_my_reviews"
    VIEW_USER_PRODUCT_REVIEW = "view_user_product_review"

    # System
    HEALTH_CHECK = "health_check"
    API_ROOT = "api_root"
    UNKNOWN = "unknown"


# Path patterns for matching (pattern, methods, action)
PATH_PATTERNS = [
    # Authentication
    (r"^/auth/register/?$", ["POST"], UserAction.AUTH_REGISTER),
    (r"^/auth/login/?$", ["POST"], UserAction.AUTH_LOGIN),

    # Categories
    (r"^/categories/?$", ["GET"], UserAction.VIEW_CATEGORIES),
    (r"^/categories/[^/]+/?$", ["GET"], UserAction.VIEW_CATEGORY),

    # Products
    (r"^/products/?$", ["GET"], UserAction.VIEW_PRODUCTS),
    (r"^/products/\d+/?$", ["GET"], UserAction.VIEW_PRODUCT_DETAIL),

    # Cart
    (r"^/cart/?$", ["GET"], UserAction.VIEW_CART),
    (r"^/cart/?$", ["POST"], UserAction.ADD_TO_CART),
    (r"^/cart/\d+/?$", ["PUT", "PATCH"], UserAction.UPDATE_CART_ITEM),
    (r"^/cart/\d+/?$", ["DELETE"], UserAction.REMOVE_FROM_CART),
    (r"^/cart/?$", ["DELETE"], UserAction.CLEAR_CART),

    # Orders
    (r"^/orders/?$", ["GET"], UserAction.VIEW_ORDERS),
    (r"^/orders/\d+/?$", ["GET"], UserAction.VIEW_ORDER_DETAIL),
    (r"^/orders/?$", ["POST"], UserAction.CREATE_ORDER),

    # Wishlist
    (r"^/wishlist/?$", ["GET"], UserAction.VIEW_WISHLIST),
    (r"^/wishlist/products/?$", ["GET"], UserAction.VIEW_WISHLIST),
    (r"^/wishlist/add/?$", ["POST"], UserAction.ADD_TO_WISHLIST),
    (r"^/wishlist/remove/?$", ["DELETE"], UserAction.REMOVE_FROM_WISHLIST),

    # Reviews
    (r"^/reviews/?$", ["GET"], UserAction.VIEW_REVIEWS),
    (r"^/reviews/?$", ["POST"], UserAction.SUBMIT_REVIEW),
    (r"^/reviews/my_reviews/?$", ["GET"], UserAction.VIEW_MY_REVIEWS),
    (r"^/reviews/user_product_review/?$", ["GET"], UserAction.VIEW_USER_PRODUCT_REVIEW),

    # System
    (r"^/health/?$", ["GET"], UserAction.HEALTH_CHECK),
    (r"^/?$", ["GET"], UserAction.API_ROOT),
]


def map_path_to_action(path: str, method: str, query_params: Optional[dict] = None) -> str:
    """
    Map request path and method to a user action.

    Args:
        path: The request URL path
        method: The HTTP method (GET, POST, etc.)
        query_params: Optional query parameters

    Returns:
        The action name as a string
    """
    # Check for search action (products with search/filter params)
    if path.rstrip('/') == '/products' and method == 'GET':
        if query_params:
            search_keys = {'search', 'category', 'min_price', 'max_price',
                          'min_rating', 'featured', 'flash_sale', 'has_discount', 'in_stock'}
            if any(key in query_params for key in search_keys):
                return UserAction.SEARCH_PRODUCTS.value

    # Match against patterns
    for pattern, methods, action in PATH_PATTERNS:
        if re.match(pattern, path) and method in methods:
            return action.value

    return UserAction.UNKNOWN.value


def extract_session_info(request: Request) -> dict:
    """
    Extract session and authentication info from request.

    Args:
        request: The FastAPI request object

    Returns:
        Dictionary with session_id, user_id, and is_authenticated
    """
    import base64
    import json

    session_id = request.cookies.get("sessionid")
    user_id = None

    # Try to extract user_id from JWT token in Authorization header
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]  # Remove "Bearer " prefix
        try:
            # Try to decode JWT without verification (just to read payload)
            # Split token and decode the payload part
            parts = token.split('.')
            if len(parts) == 3:
                # Decode the payload (second part)
                payload = parts[1]
                # Add padding if needed
                payload += '=' * (4 - len(payload) % 4)
                decoded = base64.urlsafe_b64decode(payload)
                token_data = json.loads(decoded)
                user_id = token_data.get('user_id') or token_data.get('sub') or token_data.get('id')
        except Exception:
            # If token decode fails, we'll try other methods
            pass

    # Try to extract user_id from session cookie
    if not user_id and session_id:
        # Session ID format might contain user info - implementation specific
        # For Django sessions, we'd need to query Django directly
        # For now, we'll leave it to be populated from response data
        pass

    # Truncate session ID for privacy (show first 8 chars)
    session_display = session_id[:8] + "..." if session_id and len(session_id) > 8 else session_id

    result = {
        "session_id": session_display,
        "is_authenticated": bool(session_id or user_id)
    }

    if user_id:
        result["user_id"] = user_id

    return result


def extract_context_from_request(path: str, method: str, query_params: Optional[dict] = None, request_body: Optional[dict] = None) -> Optional[dict]:
    """
    Extract business context from request path, parameters, and body.

    Args:
        path: The request URL path
        method: The HTTP method
        query_params: Optional query parameters
        request_body: Optional request body data

    Returns:
        Dictionary with extracted context or None
    """
    context = {}

    # Extract product ID from path
    product_match = re.search(r'/products/(\d+)', path)
    if product_match:
        context['product_id'] = int(product_match.group(1))

    # Extract category slug from path
    category_match = re.search(r'/categories/([^/]+)/?$', path)
    if category_match:
        context['category_slug'] = category_match.group(1)

    # Extract cart item ID from path
    cart_match = re.search(r'/cart/(\d+)', path)
    if cart_match:
        context['cart_item_id'] = int(cart_match.group(1))

    # Extract order ID from path
    order_match = re.search(r'/orders/(\d+)', path)
    if order_match:
        context['order_id'] = int(order_match.group(1))

    # Extract review context from query params (product_id for reviews)
    if path.startswith('/reviews'):
        if query_params and 'product_id' in query_params:
            context['product_id'] = query_params['product_id']

        # Extract rating and product_id from POST body
        if method == 'POST' and request_body:
            if 'product_id' in request_body:
                context['product_id'] = request_body['product_id']
            if 'rating' in request_body:
                context['rating_value'] = request_body['rating']
            if 'comment' in request_body and request_body['comment']:
                context['has_comment'] = True

    # Extract search/filter context from query params
    if query_params:
        if 'search' in query_params:
            context['search_query'] = query_params['search']

        if 'category' in query_params:
            context['filter_category'] = query_params['category']

        # Capture applied filters
        filter_keys = ['min_price', 'max_price', 'min_rating', 'in_stock',
                       'featured', 'flash_sale', 'has_discount', 'sort_by']
        filters = {key: query_params[key] for key in filter_keys if key in query_params}

        if filters:
            context['filters_applied'] = filters

    return context if context else None
