"""
Action Logging Middleware for E-Commerce API

This middleware logs all user actions in JSONL format for the monitoring dashboard.
"""

import time
import uuid
import logging
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from logging_config import action_logger
from action_mapper import (
    map_path_to_action,
    extract_session_info,
    extract_context_from_request
)


class ActionLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all user actions in JSONL format.

    Captures request/response data and logs it with timing information,
    user session data, and business context.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate unique request ID
        request_id = str(uuid.uuid4())

        # Capture start time
        start_time = time.perf_counter()

        # Extract pre-request information
        path = request.url.path
        method = request.method
        query_params = dict(request.query_params) if request.query_params else None
        client_ip = self._get_client_ip(request)
        user_agent = request.headers.get("user-agent")

        # Extract session info (includes user_id if available)
        session_info = extract_session_info(request)

        # Determine action from path and method
        action = map_path_to_action(path, method, query_params)

        # Try to capture request body for POST/PUT/PATCH requests (for context)
        request_body = None
        if method in ["POST", "PUT", "PATCH"]:
            try:
                # Store the body for logging context
                body_bytes = await request.body()
                if body_bytes:
                    import json
                    request_body = json.loads(body_bytes)
                # Create a new request with the body for the next handler
                from starlette.requests import Request as StarletteRequest
                async def receive():
                    return {"type": "http.request", "body": body_bytes}
                request = StarletteRequest(request.scope, receive)
            except Exception:
                pass

        # Initialize response variables
        status_code = 500
        error_type = None
        error_message = None

        try:
            # Process the request
            response = await call_next(request)
            status_code = response.status_code

        except Exception as e:
            error_type = type(e).__name__
            error_message = str(e)
            raise

        finally:
            # Calculate duration
            duration_ms = (time.perf_counter() - start_time) * 1000

            # Determine log level based on status code
            level = self._determine_log_level(status_code)

            # Extract request context (product_id, etc. from path and body)
            request_context = extract_context_from_request(path, method, query_params, request_body)

            # Determine event type
            event_type = "error" if error_type else ("user_action" if action != "unknown" else "request")

            # Build log record
            log_record = {
                "event_type": event_type,
                "action": action,
                "request_id": request_id,
                "path": path,
                "method": method,
                "query_params": query_params,
                "status_code": status_code,
                "duration_ms": round(duration_ms, 2),
                "client_ip": client_ip,
                "user_agent": user_agent,
                "context": request_context,
                "error_type": error_type,
                "error_message": error_message,
                **session_info
            }

            # Log the action
            self._log_action(level, log_record)

        return response

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request."""
        # Check for forwarded headers (proxy/load balancer)
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()

        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip

        # Fall back to direct client
        if request.client:
            return request.client.host

        return "unknown"

    def _determine_log_level(self, status_code: int) -> str:
        """Determine log level based on HTTP status code."""
        if status_code >= 500:
            return "ERROR"
        elif status_code >= 400:
            return "WARNING"
        else:
            return "INFO"

    def _log_action(self, level: str, record: dict):
        """Log the action with appropriate level."""
        # Get the appropriate logging method
        log_method = getattr(action_logger, level.lower(), action_logger.info)

        # Create a LogRecord with extra fields
        # We use the extra parameter to pass custom fields to the handler
        log_method(
            f"{record['action']}",
            extra=record
        )
