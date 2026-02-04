# E-Commerce Logging System Documentation

This directory contains JSONL (JSON Lines) log files that record all user actions and system events in the e-commerce application.

## Log Files

- **ecommerce.jsonl** - Main log file (rotates at 50MB)
- **ecommerce.jsonl.1** through **ecommerce.jsonl.10** - Rotated backup files

## Log Format

Each line in the JSONL file represents a single event in JSON format. All logs follow this schema:

## Log Schema Reference

### Core Fields (Always Present)

| Field | Type | Description | Example Values |
|-------|------|-------------|----------------|
| `timestamp` | string | ISO 8601 UTC timestamp when the event occurred | `"2026-02-04T23:13:37.956916Z"` |
| `level` | string | Log severity level | `"INFO"`, `"WARNING"`, `"ERROR"`, `"CRITICAL"` |
| `event_type` | string | Category of the event | `"user_action"`, `"request"`, `"error"` |
| `action` | string | Specific user action performed (see Actions table below) | `"view_products"`, `"add_to_cart"`, `"auth_login"` |
| `request_id` | string | Unique UUID for this request, useful for tracing | `"731238c4-85bc-4041-8cf2-037ca4f35a1b"` |
| `path` | string | URL path that was accessed | `"/products"`, `"/cart"`, `"/auth/login"` |
| `method` | string | HTTP method used | `"GET"`, `"POST"`, `"PUT"`, `"PATCH"`, `"DELETE"` |
| `status_code` | integer | HTTP response status code | `200`, `404`, `500` |
| `duration_ms` | float | Time taken to process the request in milliseconds | `45.23`, `125.45` |
| `is_authenticated` | boolean | Whether the user was logged in | `true`, `false` |
| `client_ip` | string | IP address of the client making the request | `"127.0.0.1"`, `"192.168.1.100"`, `"203.0.113.42"` |

### Optional Fields (May Be Present)

| Field | Type | Description | Example Values |
|-------|------|-------------|----------------|
| `session_id` | string | Truncated session ID for privacy (first 8 chars + ...) | `"abc12345..."`, `null` |
| `user_id` | integer | Database ID of the authenticated user | `123`, `42`, `null` |
| `user_agent` | string | Browser/client user agent string | `"Mozilla/5.0..."`, `"curl/7.68.0"` |
| `query_params` | object | URL query parameters if any were provided | `{"category": "electronics"}`, `{"search": "phone"}` |
| `context` | object | Business context extracted from the request (see Context Fields below) | `{"product_id": 456}` |
| `error_type` | string | Type of error if one occurred | `"ValidationError"`, `"AuthenticationError"`, `"NotFound"` |
| `error_message` | string | Human-readable error message | `"Product not found"`, `"Authentication required"` |

### Context Fields (Nested in `context` object)

These fields provide business-specific information about what the user was interacting with:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `product_id` | integer | ID of the product being viewed/added to cart | `456` |
| `category_slug` | string | URL slug of the category being browsed | `"electronics"`, `"clothing"` |
| `cart_item_id` | integer | ID of the cart item being updated/removed | `789` |
| `order_id` | integer | ID of the order being viewed/created | `1001` |
| `search_query` | string | Search term the user entered | `"phone"`, `"laptop"` |
| `filter_category` | string | Category filter applied to product search | `"electronics"` |
| `filters_applied` | object | Additional filters used in product search | `{"min_price": "500", "in_stock": "true"}` |

## Log Levels

| Level | Usage | Meaning |
|-------|-------|---------|
| `INFO` | Status code 2xx-3xx | Successful request, normal operation |
| `WARNING` | Status code 4xx | Client error (e.g., 404 Not Found, 401 Unauthorized) |
| `ERROR` | Status code 5xx | Server error, something went wrong on the backend |
| `CRITICAL` | Severe failures | System-critical errors (rarely used) |

## Event Types

| Event Type | Description | When It Occurs |
|------------|-------------|----------------|
| `user_action` | A recognized user action from the action map | When path matches a known endpoint pattern |
| `request` | Generic HTTP request | When path doesn't match any known action |
| `error` | An error occurred during request processing | When an exception is raised |

## User Actions

All possible `action` values and what they represent:

### Authentication Actions

| Action | Path | Method | Description |
|--------|------|--------|-------------|
| `auth_register` | `/auth/register` | POST | User created a new account |
| `auth_login` | `/auth/login` | POST | User logged into their account |

### Category Actions

| Action | Path | Method | Description |
|--------|------|--------|-------------|
| `view_categories` | `/categories` | GET | User viewed the list of all categories |
| `view_category` | `/categories/{slug}` | GET | User viewed a specific category |

### Product Actions

| Action | Path | Method | Description |
|--------|------|--------|-------------|
| `view_products` | `/products` | GET | User viewed the product catalog (no filters) |
| `search_products` | `/products?search=...` | GET | User searched/filtered products with query parameters |
| `view_product_detail` | `/products/{id}` | GET | User viewed details of a specific product |

### Cart Actions

| Action | Path | Method | Description |
|--------|------|--------|-------------|
| `view_cart` | `/cart` | GET | User viewed their shopping cart |
| `add_to_cart` | `/cart` | POST | User added an item to their cart |
| `update_cart_item` | `/cart/{id}` | PUT/PATCH | User changed the quantity of a cart item |
| `remove_from_cart` | `/cart/{id}` | DELETE | User removed an item from their cart |
| `clear_cart` | `/cart` | DELETE | User cleared all items from their cart |

### Order Actions

| Action | Path | Method | Description |
|--------|------|--------|-------------|
| `view_orders` | `/orders` | GET | User viewed their order history |
| `view_order_detail` | `/orders/{id}` | GET | User viewed details of a specific order |
| `create_order` | `/orders` | POST | User completed checkout and created an order |

### Wishlist Actions

| Action | Path | Method | Description |
|--------|------|--------|-------------|
| `view_wishlist` | `/wishlist` | GET | User viewed their wishlist |
| `add_to_wishlist` | `/wishlist/add` | POST | User added a product to their wishlist |
| `remove_from_wishlist` | `/wishlist/remove` | DELETE | User removed a product from their wishlist |

### System Actions

| Action | Path | Method | Description |
|--------|------|--------|-------------|
| `health_check` | `/health` | GET | System health check endpoint was called |
| `api_root` | `/` | GET | API root endpoint was accessed |
| `unknown` | Any unmatched path | Any | Request to an unknown or unrecognized endpoint |

## Example Log Entries

### Successful Product View
```json
{
  "timestamp": "2026-02-04T14:30:05.456Z",
  "level": "INFO",
  "event_type": "user_action",
  "action": "view_products",
  "request_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "path": "/products",
  "method": "GET",
  "query_params": {"category": "electronics"},
  "status_code": 200,
  "duration_ms": 45.23,
  "session_id": "abc12345...",
  "is_authenticated": true,
  "client_ip": "192.168.1.50",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "context": {"filter_category": "electronics"}
}
```

### User Login
```json
{
  "timestamp": "2026-02-04T14:30:00.123Z",
  "level": "INFO",
  "event_type": "user_action",
  "action": "auth_login",
  "request_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "path": "/auth/login",
  "method": "POST",
  "status_code": 200,
  "duration_ms": 125.45,
  "user_id": 42,
  "session_id": "abc12345...",
  "is_authenticated": true,
  "client_ip": "192.168.1.50",
  "user_agent": "Mozilla/5.0..."
}
```

### Failed Authentication (401 Error)
```json
{
  "timestamp": "2026-02-04T14:30:25.345Z",
  "level": "WARNING",
  "event_type": "user_action",
  "action": "add_to_cart",
  "request_id": "e5f6a7b8-c9d0-1234-ef01-345678901234",
  "path": "/cart",
  "method": "POST",
  "status_code": 401,
  "duration_ms": 15.23,
  "is_authenticated": false,
  "client_ip": "192.168.1.75",
  "user_agent": "curl/7.68.0",
  "error_type": "AuthenticationError",
  "error_message": "Authentication required"
}
```

### Product Search with Filters
```json
{
  "timestamp": "2026-02-04T14:32:10.789Z",
  "level": "INFO",
  "event_type": "user_action",
  "action": "search_products",
  "request_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "path": "/products",
  "method": "GET",
  "query_params": {
    "search": "laptop",
    "min_price": "500",
    "max_price": "2000",
    "in_stock": "true"
  },
  "status_code": 200,
  "duration_ms": 78.56,
  "session_id": "xyz98765...",
  "is_authenticated": true,
  "client_ip": "192.168.1.100",
  "context": {
    "search_query": "laptop",
    "filters_applied": {
      "min_price": "500",
      "max_price": "2000",
      "in_stock": "true"
    }
  }
}
```

### Order Creation
```json
{
  "timestamp": "2026-02-04T14:30:30.678Z",
  "level": "INFO",
  "event_type": "user_action",
  "action": "create_order",
  "request_id": "f6a7b8c9-d0e1-2345-f012-456789012345",
  "path": "/orders",
  "method": "POST",
  "status_code": 201,
  "duration_ms": 234.89,
  "user_id": 42,
  "session_id": "abc12345...",
  "is_authenticated": true,
  "client_ip": "192.168.1.50",
  "context": {"order_id": 1001}
}
```

### 404 Not Found
```json
{
  "timestamp": "2026-02-04T23:13:37.956916Z",
  "level": "WARNING",
  "event_type": "request",
  "action": "unknown",
  "request_id": "731238c4-85bc-4041-8cf2-037ca4f35a1b",
  "path": "/api/products",
  "method": "GET",
  "status_code": 404,
  "duration_ms": 0.28,
  "is_authenticated": false,
  "client_ip": "127.0.0.1",
  "user_agent": "Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705"
}
```

## Reading the Logs

### Using Command Line

View recent logs:
```bash
tail -f E-Commerce/logs/ecommerce.jsonl
```

Count entries by action:
```bash
grep -o '"action":"[^"]*"' ecommerce.jsonl | sort | uniq -c
```

Find all errors:
```bash
grep '"level":"ERROR"' ecommerce.jsonl
```

View logs from a specific user:
```bash
grep '"user_id":42' ecommerce.jsonl
```

### Using Python

```python
import json

# Read and parse JSONL
with open('ecommerce.jsonl', 'r') as f:
    for line in f:
        log = json.loads(line)
        print(f"{log['timestamp']} - {log['action']} - {log['status_code']}")
```

### Using jq (JSON processor)

```bash
# Pretty print a log entry
cat ecommerce.jsonl | jq '.'

# Filter by action
cat ecommerce.jsonl | jq 'select(.action == "add_to_cart")'

# Get average response time
cat ecommerce.jsonl | jq -s 'map(.duration_ms) | add/length'
```

## Privacy & Security Notes

- **Session IDs** are truncated to first 8 characters for privacy
- **User IDs** are logged but can be anonymized if needed
- **IP addresses** are logged for security and analytics
- **Passwords** and sensitive POST data are NEVER logged
- Log files should be protected with appropriate file permissions
- Consider encrypting logs at rest in production environments

## Log Rotation

Logs automatically rotate when reaching 50MB with the following settings:
- **Max file size:** 50MB
- **Backup count:** 10 files
- **Naming pattern:** `ecommerce.jsonl`, `ecommerce.jsonl.1`, ..., `ecommerce.jsonl.10`
- **Oldest file:** Automatically deleted when limit is reached

## Integration with Monitoring Dashboard

These logs serve as the data source for the monitoring dashboard. The dashboard can:
- Read logs in real-time or batch
- Aggregate metrics (request counts, error rates, response times)
- Visualize user behavior patterns
- Alert on anomalies

The log format is intentionally system-agnostic - as long as the log schema remains consistent, the e-commerce system and monitoring dashboard can evolve independently.
