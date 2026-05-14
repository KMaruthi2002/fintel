"""
fintel: Financial Telemetry & Observability.

A Python package that applies OpenTelemetry-style observability concepts
(spans, metrics, alerts, dashboards, SLOs) to stock-market monitoring.

Quick start
-----------
>>> import yfinance as yf
>>> from fintel import SignalDetector, MetricsEngine, AlertEngine, Dashboard
>>> data = yf.download("AAPL", period="1y", progress=False)
>>> me = MetricsEngine(data)
>>> signals = SignalDetector(data, "AAPL").get_all_signals()
>>> print(me.compute_summary())
>>> Dashboard("AAPL", data, me, signals=signals).render()
"""

__version__ = "1.0.0"
__author__ = "Maruthi Kunchala"
__license__ = "MIT"

from fintel.core import (
    FintelError,
    DataValidationError,
    InsufficientDataError,
    InvalidParameterError,
    validate_ohlcv,
    REQUIRED_COLUMNS,
)
from fintel.signals import Signal, SignalDetector
from fintel.metrics import MetricsEngine
from fintel.alerts import AlertRule, Alert, AlertEngine, SLO
from fintel.dashboard import Dashboard

__all__ = [
    # Version metadata
    "__version__",
    # Modules
    "Signal", "SignalDetector",
    "MetricsEngine",
    "AlertRule", "Alert", "AlertEngine", "SLO",
    "Dashboard",
    # Exceptions
    "FintelError",
    "DataValidationError",
    "InsufficientDataError",
    "InvalidParameterError",
    # Utilities
    "validate_ohlcv",
    "REQUIRED_COLUMNS",
]
