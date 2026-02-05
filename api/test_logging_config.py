"""
Tests for the logging_config module.

Tests the JSONLFileHandler and logging setup functionality.
"""

import pytest
import json
import logging
import tempfile
from pathlib import Path
from datetime import datetime, timezone
from logging_config import JSONLFileHandler, setup_logging


class TestJSONLFileHandler:
    """Test the JSONLFileHandler class."""

    def test_handler_initialization(self):
        """Test that handler initializes correctly."""
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp_path = tmp.name

        handler = JSONLFileHandler(filename=tmp_path, max_bytes=1024, backup_count=3)

        assert handler.maxBytes == 1024
        assert handler.backupCount == 3
        assert Path(tmp_path).exists()

        handler.close()
        Path(tmp_path).unlink()

    def test_handler_creates_directory(self):
        """Test that handler creates parent directory if it doesn't exist."""
        with tempfile.TemporaryDirectory() as tmpdir:
            log_file = Path(tmpdir) / "logs" / "test.jsonl"

            handler = JSONLFileHandler(filename=str(log_file))

            assert log_file.parent.exists()
            assert log_file.exists()

            handler.close()

    def test_format_as_json_basic_record(self):
        """Test formatting a basic log record as JSON."""
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp_path = tmp.name

        handler = JSONLFileHandler(filename=tmp_path)

        # Create a log record
        record = logging.LogRecord(
            name="test",
            level=logging.INFO,
            pathname="",
            lineno=0,
            msg="Test message",
            args=(),
            exc_info=None
        )

        # Set custom attributes
        record.event_type = "request"
        record.action = "test_action"
        record.path = "/test/path"
        record.method = "GET"
        record.status_code = 200

        json_str = handler.format_as_json(record)
        data = json.loads(json_str)

        assert data["level"] == "INFO"
        assert data["event_type"] == "request"
        assert data["action"] == "test_action"
        assert data["path"] == "/test/path"
        assert data["method"] == "GET"
        assert data["status_code"] == 200
        assert "timestamp" in data

        handler.close()
        Path(tmp_path).unlink()

    def test_format_as_json_with_all_fields(self):
        """Test formatting a log record with all possible fields."""
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp_path = tmp.name

        handler = JSONLFileHandler(filename=tmp_path)

        record = logging.LogRecord(
            name="test",
            level=logging.ERROR,
            pathname="",
            lineno=0,
            msg="Error message",
            args=(),
            exc_info=None
        )

        # Set all custom attributes
        record.event_type = "error"
        record.action = "submit_review"
        record.request_id = "req-123"
        record.path = "/reviews"
        record.method = "POST"
        record.query_params = {"product_id": "456"}
        record.status_code = 500
        record.duration_ms = 123.45
        record.user_id = 42
        record.session_id = "sess-abc"
        record.is_authenticated = True
        record.client_ip = "192.168.1.1"
        record.user_agent = "Mozilla/5.0"
        record.context = {"product_id": 456}
        record.error_type = "ValueError"
        record.error_message = "Invalid rating"

        json_str = handler.format_as_json(record)
        data = json.loads(json_str)

        assert data["level"] == "ERROR"
        assert data["event_type"] == "error"
        assert data["action"] == "submit_review"
        assert data["request_id"] == "req-123"
        assert data["path"] == "/reviews"
        assert data["method"] == "POST"
        assert data["query_params"] == {"product_id": "456"}
        assert data["status_code"] == 500
        assert data["duration_ms"] == 123.45
        assert data["user_id"] == 42
        assert data["session_id"] == "sess-abc"
        assert data["is_authenticated"] is True
        assert data["client_ip"] == "192.168.1.1"
        assert data["user_agent"] == "Mozilla/5.0"
        assert data["context"] == {"product_id": 456}
        assert data["error_type"] == "ValueError"
        assert data["error_message"] == "Invalid rating"

        handler.close()
        Path(tmp_path).unlink()

    def test_format_as_json_removes_none_values(self):
        """Test that None values are removed from JSON output."""
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp_path = tmp.name

        handler = JSONLFileHandler(filename=tmp_path)

        record = logging.LogRecord(
            name="test",
            level=logging.INFO,
            pathname="",
            lineno=0,
            msg="Test message",
            args=(),
            exc_info=None
        )

        # Only set a few attributes
        record.action = "view_products"
        record.status_code = 200

        json_str = handler.format_as_json(record)
        data = json.loads(json_str)

        # None values should not be present
        assert "request_id" not in data
        assert "user_id" not in data
        assert "error_type" not in data

        # Set values should be present
        assert data["action"] == "view_products"
        assert data["status_code"] == 200

        handler.close()
        Path(tmp_path).unlink()

    def test_emit_writes_json_line(self):
        """Test that emit writes a JSON line to the file."""
        with tempfile.NamedTemporaryFile(mode='w+', delete=False) as tmp:
            tmp_path = tmp.name

        handler = JSONLFileHandler(filename=tmp_path)

        record = logging.LogRecord(
            name="test",
            level=logging.INFO,
            pathname="",
            lineno=0,
            msg="Test message",
            args=(),
            exc_info=None
        )
        record.action = "test_action"
        record.status_code = 200

        handler.emit(record)
        handler.close()

        # Read the file and verify content
        with open(tmp_path, 'r') as f:
            line = f.readline()
            data = json.loads(line)

            assert data["action"] == "test_action"
            assert data["status_code"] == 200

        Path(tmp_path).unlink()

    def test_emit_writes_multiple_lines(self):
        """Test that emit writes multiple JSON lines correctly."""
        with tempfile.NamedTemporaryFile(mode='w+', delete=False) as tmp:
            tmp_path = tmp.name

        handler = JSONLFileHandler(filename=tmp_path)

        # Write multiple records
        for i in range(3):
            record = logging.LogRecord(
                name="test",
                level=logging.INFO,
                pathname="",
                lineno=0,
                msg=f"Message {i}",
                args=(),
                exc_info=None
            )
            record.action = f"action_{i}"
            record.status_code = 200 + i
            handler.emit(record)

        handler.close()

        # Read the file and verify content
        with open(tmp_path, 'r') as f:
            lines = f.readlines()
            assert len(lines) == 3

            for i, line in enumerate(lines):
                data = json.loads(line)
                assert data["action"] == f"action_{i}"
                assert data["status_code"] == 200 + i

        Path(tmp_path).unlink()

    def test_timestamp_format(self):
        """Test that timestamp is in correct ISO format with Z suffix."""
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp_path = tmp.name

        handler = JSONLFileHandler(filename=tmp_path)

        record = logging.LogRecord(
            name="test",
            level=logging.INFO,
            pathname="",
            lineno=0,
            msg="Test message",
            args=(),
            exc_info=None
        )

        json_str = handler.format_as_json(record)
        data = json.loads(json_str)

        # Verify timestamp format
        timestamp = data["timestamp"]
        assert timestamp.endswith("Z")
        # Verify it can be parsed
        parsed = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        assert parsed.tzinfo is not None

        handler.close()
        Path(tmp_path).unlink()


class TestSetupLogging:
    """Test the setup_logging function."""

    def test_setup_logging_returns_logger(self):
        """Test that setup_logging returns a logger instance."""
        logger = setup_logging()
        assert isinstance(logger, logging.Logger)
        assert logger.name == "ecommerce.actions"

    def test_setup_logging_sets_level(self):
        """Test that setup_logging sets correct log level."""
        logger = setup_logging()
        assert logger.level == logging.INFO

    def test_setup_logging_adds_handler(self):
        """Test that setup_logging adds JSONLFileHandler."""
        logger = setup_logging()
        assert len(logger.handlers) > 0
        assert any(isinstance(h, JSONLFileHandler) for h in logger.handlers)

    def test_setup_logging_prevents_propagation(self):
        """Test that logger doesn't propagate to root logger."""
        logger = setup_logging()
        assert logger.propagate is False

    def test_setup_logging_is_idempotent(self):
        """Test that calling setup_logging multiple times doesn't add duplicate handlers."""
        logger1 = setup_logging()
        handler_count = len(logger1.handlers)

        logger2 = setup_logging()
        assert len(logger2.handlers) == handler_count
        assert logger1 is logger2


class TestIntegration:
    """Integration tests for the logging system."""

    def test_log_message_end_to_end(self):
        """Test logging a message end-to-end."""
        with tempfile.TemporaryDirectory() as tmpdir:
            log_file = Path(tmpdir) / "test.jsonl"

            # Create logger with custom handler
            logger = logging.getLogger("test_integration")
            logger.setLevel(logging.INFO)
            handler = JSONLFileHandler(filename=str(log_file))
            logger.addHandler(handler)

            # Log a message with extra fields
            logger.info(
                "Test action",
                extra={
                    "event_type": "user_action",
                    "action": "view_product_detail",
                    "path": "/products/123",
                    "method": "GET",
                    "status_code": 200,
                    "duration_ms": 45.67,
                    "user_id": 42,
                    "is_authenticated": True,
                    "context": {"product_id": 123}
                }
            )

            handler.close()

            # Verify the logged data
            with open(log_file, 'r') as f:
                line = f.readline()
                data = json.loads(line)

                assert data["level"] == "INFO"
                assert data["event_type"] == "user_action"
                assert data["action"] == "view_product_detail"
                assert data["path"] == "/products/123"
                assert data["method"] == "GET"
                assert data["status_code"] == 200
                assert data["duration_ms"] == 45.67
                assert data["user_id"] == 42
                assert data["is_authenticated"] is True
                assert data["context"] == {"product_id": 123}