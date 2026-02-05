"""
Tests for the logging_middleware module.

Tests the ActionLoggingMiddleware functionality.
"""

import pytest
import asyncio
from unittest.mock import Mock, MagicMock, AsyncMock, patch
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from logging_middleware import ActionLoggingMiddleware


class TestActionLoggingMiddleware:
    """Test the ActionLoggingMiddleware class."""

    @pytest.fixture
    def middleware(self):
        """Create a middleware instance."""
        app = MagicMock()
        return ActionLoggingMiddleware(app)

    @pytest.fixture
    def mock_request(self):
        """Create a mock FastAPI request."""
        request = Mock(spec=Request)
        request.url.path = "/products/123"
        request.method = "GET"
        request.query_params = {}
        request.cookies.get.return_value = None
        request.headers.get.return_value = ""
        request.client.host = "127.0.0.1"
        return request

    @pytest.mark.asyncio
    async def test_dispatch_logs_successful_request(self, middleware, mock_request):
        """Test that successful requests are logged."""
        # Mock call_next to return a response
        async def call_next(request):
            response = Response()
            response.status_code = 200
            return response

        with patch('logging_middleware.action_logger') as mock_logger:
            response = await middleware.dispatch(mock_request, call_next)

            assert response.status_code == 200
            mock_logger.info.assert_called_once()

            # Verify the logged data structure
            call_args = mock_logger.info.call_args
            extra_data = call_args[1]['extra']

            assert extra_data['action'] == 'view_product_detail'
            assert extra_data['path'] == '/products/123'
            assert extra_data['method'] == 'GET'
            assert extra_data['status_code'] == 200
            assert 'duration_ms' in extra_data
            assert 'request_id' in extra_data

    @pytest.mark.asyncio
    async def test_dispatch_logs_error_request(self, middleware, mock_request):
        """Test that error requests are logged with ERROR level."""
        # Mock call_next to return an error response
        async def call_next(request):
            response = Response()
            response.status_code = 500
            return response

        with patch('logging_middleware.action_logger') as mock_logger:
            response = await middleware.dispatch(mock_request, call_next)

            assert response.status_code == 500
            mock_logger.error.assert_called_once()

            call_args = mock_logger.error.call_args
            extra_data = call_args[1]['extra']
            assert extra_data['status_code'] == 500

    @pytest.mark.asyncio
    async def test_dispatch_logs_warning_for_client_errors(self, middleware, mock_request):
        """Test that 4xx errors are logged with WARNING level."""
        async def call_next(request):
            response = Response()
            response.status_code = 404
            return response

        with patch('logging_middleware.action_logger') as mock_logger:
            response = await middleware.dispatch(mock_request, call_next)

            assert response.status_code == 404
            mock_logger.warning.assert_called_once()

    @pytest.mark.asyncio
    async def test_dispatch_handles_exceptions(self, middleware, mock_request):
        """Test that exceptions during request processing are handled."""
        async def call_next(request):
            raise ValueError("Test error")

        with patch('logging_middleware.action_logger') as mock_logger:
            with pytest.raises(ValueError):
                await middleware.dispatch(mock_request, call_next)

            # Verify error was logged
            call_args = mock_logger.error.call_args
            extra_data = call_args[1]['extra']

            assert extra_data['error_type'] == 'ValueError'
            assert extra_data['error_message'] == 'Test error'
            assert extra_data['event_type'] == 'error'

    @pytest.mark.asyncio
    async def test_dispatch_extracts_query_params(self, middleware):
        """Test that query parameters are extracted and logged."""
        request = Mock(spec=Request)
        request.url.path = "/products"
        request.method = "GET"
        request.query_params = {"search": "laptop", "category": "electronics"}
        request.cookies.get.return_value = None
        request.headers.get.return_value = ""
        request.client.host = "127.0.0.1"

        async def call_next(req):
            response = Response()
            response.status_code = 200
            return response

        with patch('logging_middleware.action_logger') as mock_logger:
            await middleware.dispatch(request, call_next)

            call_args = mock_logger.info.call_args
            extra_data = call_args[1]['extra']

            assert extra_data['query_params'] == {"search": "laptop", "category": "electronics"}
            assert extra_data['action'] == 'search_products'

    @pytest.mark.asyncio
    async def test_dispatch_extracts_session_info(self, middleware):
        """Test that session information is extracted."""
        request = Mock(spec=Request)
        request.url.path = "/cart"
        request.method = "GET"
        request.query_params = {}
        request.cookies.get.return_value = "session123456789"
        request.headers.get.return_value = ""
        request.client.host = "127.0.0.1"

        async def call_next(req):
            response = Response()
            response.status_code = 200
            return response

        with patch('logging_middleware.action_logger') as mock_logger:
            await middleware.dispatch(request, call_next)

            call_args = mock_logger.info.call_args
            extra_data = call_args[1]['extra']

            assert extra_data['session_id'] == 'session1...'
            assert extra_data['is_authenticated'] is True

    @pytest.mark.asyncio
    async def test_dispatch_captures_request_body(self, middleware):
        """Test that request body is captured for POST requests."""
        request = Mock(spec=Request)
        request.url.path = "/reviews"
        request.method = "POST"
        request.query_params = {}
        request.cookies.get.return_value = None
        request.headers.get.return_value = ""
        request.client.host = "127.0.0.1"

        body_data = b'{"product_id": 123, "rating": 5}'

        async def mock_body():
            return body_data

        request.body = mock_body
        request.scope = {"type": "http"}

        async def call_next(req):
            response = Response()
            response.status_code = 201
            return response

        with patch('logging_middleware.action_logger') as mock_logger:
            await middleware.dispatch(request, call_next)

            call_args = mock_logger.info.call_args
            extra_data = call_args[1]['extra']

            assert extra_data['action'] == 'submit_review'
            assert extra_data['context']['product_id'] == 123
            assert extra_data['context']['rating_value'] == 5

    @pytest.mark.asyncio
    async def test_dispatch_generates_unique_request_id(self, middleware, mock_request):
        """Test that each request gets a unique request ID."""
        async def call_next(request):
            response = Response()
            response.status_code = 200
            return response

        with patch('logging_middleware.action_logger') as mock_logger:
            await middleware.dispatch(mock_request, call_next)
            first_call_args = mock_logger.info.call_args
            first_request_id = first_call_args[1]['extra']['request_id']

            await middleware.dispatch(mock_request, call_next)
            second_call_args = mock_logger.info.call_args
            second_request_id = second_call_args[1]['extra']['request_id']

            assert first_request_id != second_request_id

    @pytest.mark.asyncio
    async def test_dispatch_measures_duration(self, middleware, mock_request):
        """Test that request duration is measured."""
        async def call_next(request):
            await asyncio.sleep(0.01)  # Simulate some processing time
            response = Response()
            response.status_code = 200
            return response

        with patch('logging_middleware.action_logger') as mock_logger:
            await middleware.dispatch(mock_request, call_next)

            call_args = mock_logger.info.call_args
            extra_data = call_args[1]['extra']

            assert 'duration_ms' in extra_data
            assert extra_data['duration_ms'] > 0

    def test_get_client_ip_from_x_forwarded_for(self, middleware):
        """Test extracting client IP from X-Forwarded-For header."""
        request = Mock()
        def get_header(key, default=None):
            headers = {"x-forwarded-for": "203.0.113.1, 198.51.100.1"}
            return headers.get(key, default)
        request.headers.get = get_header
        request.client = None

        ip = middleware._get_client_ip(request)
        assert ip == "203.0.113.1"

    def test_get_client_ip_from_x_real_ip(self, middleware):
        """Test extracting client IP from X-Real-IP header."""
        request = Mock()
        def get_header(key, default=None):
            headers = {"x-real-ip": "203.0.113.5"}
            return headers.get(key, default)
        request.headers.get = get_header
        request.client = None

        ip = middleware._get_client_ip(request)
        assert ip == "203.0.113.5"

    def test_get_client_ip_from_client_host(self, middleware):
        """Test extracting client IP from request.client."""
        request = Mock()
        request.headers.get.return_value = None
        request.client.host = "192.168.1.100"

        ip = middleware._get_client_ip(request)
        assert ip == "192.168.1.100"

    def test_get_client_ip_unknown(self, middleware):
        """Test that 'unknown' is returned when IP cannot be determined."""
        request = Mock()
        request.headers.get.return_value = None
        request.client = None

        ip = middleware._get_client_ip(request)
        assert ip == "unknown"

    def test_determine_log_level_info(self, middleware):
        """Test log level determination for successful requests."""
        assert middleware._determine_log_level(200) == "INFO"
        assert middleware._determine_log_level(201) == "INFO"
        assert middleware._determine_log_level(204) == "INFO"
        assert middleware._determine_log_level(301) == "INFO"

    def test_determine_log_level_warning(self, middleware):
        """Test log level determination for client errors."""
        assert middleware._determine_log_level(400) == "WARNING"
        assert middleware._determine_log_level(401) == "WARNING"
        assert middleware._determine_log_level(403) == "WARNING"
        assert middleware._determine_log_level(404) == "WARNING"
        assert middleware._determine_log_level(422) == "WARNING"

    def test_determine_log_level_error(self, middleware):
        """Test log level determination for server errors."""
        assert middleware._determine_log_level(500) == "ERROR"
        assert middleware._determine_log_level(502) == "ERROR"
        assert middleware._determine_log_level(503) == "ERROR"

    @pytest.mark.asyncio
    async def test_dispatch_identifies_user_actions(self, middleware):
        """Test that user actions are correctly identified."""
        test_cases = [
            ("/products", "GET", None, "view_products", "user_action"),
            ("/products", "GET", {"search": "laptop"}, "search_products", "user_action"),
            ("/cart", "POST", None, "add_to_cart", "user_action"),
            ("/wishlist/add", "POST", None, "add_to_wishlist", "user_action"),
            ("/reviews", "POST", None, "submit_review", "user_action"),
            ("/unknown", "GET", None, "unknown", "request"),
        ]

        for path, method, query_params, expected_action, expected_event_type in test_cases:
            request = Mock(spec=Request)
            request.url.path = path
            request.method = method
            request.query_params = query_params or {}
            request.cookies.get.return_value = None
            request.headers.get.return_value = ""
            request.client.host = "127.0.0.1"

            async def call_next(req):
                response = Response()
                response.status_code = 200
                return response

            with patch('logging_middleware.action_logger') as mock_logger:
                await middleware.dispatch(request, call_next)

                call_args = mock_logger.info.call_args
                extra_data = call_args[1]['extra']

                assert extra_data['action'] == expected_action
                assert extra_data['event_type'] == expected_event_type

    @pytest.mark.asyncio
    async def test_dispatch_extracts_context(self, middleware):
        """Test that business context is extracted from requests."""
        request = Mock(spec=Request)
        request.url.path = "/products/456"
        request.method = "GET"
        request.query_params = {}
        request.cookies.get.return_value = None
        request.headers.get.return_value = ""
        request.client.host = "127.0.0.1"

        async def call_next(req):
            response = Response()
            response.status_code = 200
            return response

        with patch('logging_middleware.action_logger') as mock_logger:
            await middleware.dispatch(request, call_next)

            call_args = mock_logger.info.call_args
            extra_data = call_args[1]['extra']

            assert extra_data['context'] is not None
            assert extra_data['context']['product_id'] == 456

    @pytest.mark.asyncio
    async def test_dispatch_extracts_user_agent(self, middleware):
        """Test that user agent is extracted and logged."""
        request = Mock(spec=Request)
        request.url.path = "/products"
        request.method = "GET"
        request.query_params = {}
        request.cookies.get.return_value = None
        def get_header(key, default=""):
            headers = {"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            return headers.get(key, default)
        request.headers.get = get_header
        request.client.host = "127.0.0.1"

        async def call_next(req):
            response = Response()
            response.status_code = 200
            return response

        with patch('logging_middleware.action_logger') as mock_logger:
            await middleware.dispatch(request, call_next)

            call_args = mock_logger.info.call_args
            extra_data = call_args[1]['extra']

            assert extra_data['user_agent'] == "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"

    def test_log_action_with_different_levels(self, middleware):
        """Test that _log_action uses correct logging method for each level."""
        with patch('logging_middleware.action_logger') as mock_logger:
            record = {
                "action": "test_action",
                "status_code": 200,
                "path": "/test"
            }

            # Test INFO level
            middleware._log_action("INFO", record)
            mock_logger.info.assert_called_once()

            # Test WARNING level
            middleware._log_action("WARNING", record)
            mock_logger.warning.assert_called_once()

            # Test ERROR level
            middleware._log_action("ERROR", record)
            mock_logger.error.assert_called_once()