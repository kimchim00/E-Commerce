"""
JSONL Logging Configuration for E-Commerce API

This module provides a custom logging handler that writes logs in JSON Lines format
for consumption by the monitoring dashboard.
"""

import json
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime, timezone
from pathlib import Path


# Configuration constants
BASE_DIR = Path(__file__).resolve().parent.parent
LOG_DIR = BASE_DIR / "logs"
LOG_FILE = LOG_DIR / "ecommerce.jsonl"
MAX_LOG_SIZE = 50 * 1024 * 1024  # 50MB per file
BACKUP_COUNT = 10  # Keep 10 backup files


class JSONLFileHandler(RotatingFileHandler):
    """
    Custom handler that writes JSON Lines format to a rotating file.
    Each log record is written as a single JSON line.
    """

    def __init__(
        self,
        filename: str,
        max_bytes: int = MAX_LOG_SIZE,
        backup_count: int = BACKUP_COUNT,
        encoding: str = "utf-8"
    ):
        # Ensure directory exists
        Path(filename).parent.mkdir(parents=True, exist_ok=True)

        super().__init__(
            filename=filename,
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding=encoding
        )

    def emit(self, record: logging.LogRecord):
        """Write a single JSON line to the log file."""
        try:
            log_entry = self.format_as_json(record)
            self.stream.write(log_entry + '\n')
            self.flush()
        except Exception:
            self.handleError(record)

    def format_as_json(self, record: logging.LogRecord) -> str:
        """Convert log record to JSON string."""
        # Build log data from record attributes
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "level": record.levelname,
            "event_type": getattr(record, "event_type", "request"),
            "action": getattr(record, "action", "unknown"),
            "request_id": getattr(record, "request_id", None),
            "path": getattr(record, "path", None),
            "method": getattr(record, "method", None),
            "query_params": getattr(record, "query_params", None),
            "status_code": getattr(record, "status_code", None),
            "duration_ms": getattr(record, "duration_ms", None),
            "user_id": getattr(record, "user_id", None),
            "session_id": getattr(record, "session_id", None),
            "is_authenticated": getattr(record, "is_authenticated", False),
            "client_ip": getattr(record, "client_ip", None),
            "user_agent": getattr(record, "user_agent", None),
            "context": getattr(record, "context", None),
            "error_type": getattr(record, "error_type", None),
            "error_message": getattr(record, "error_message", None),
        }

        # Remove None values for cleaner output
        log_data = {k: v for k, v in log_data.items() if v is not None}

        return json.dumps(log_data, ensure_ascii=False, separators=(',', ':'))


def setup_logging() -> logging.Logger:
    """Configure and return the e-commerce action logger."""
    logger = logging.getLogger("ecommerce.actions")
    logger.setLevel(logging.INFO)

    # Prevent duplicate handlers
    if not logger.handlers:
        handler = JSONLFileHandler(
            filename=str(LOG_FILE),
            max_bytes=MAX_LOG_SIZE,
            backup_count=BACKUP_COUNT
        )
        logger.addHandler(handler)

    # Prevent propagation to root logger
    logger.propagate = False

    return logger


# Singleton logger instance
action_logger = setup_logging()
