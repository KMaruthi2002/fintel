"""Core utilities and custom exception hierarchy for fintel."""

import pandas as pd
import numpy as np


# =============================================================================
# Custom Exception Hierarchy
# =============================================================================

class FintelError(Exception):
    """Base exception for all fintel package errors."""
    pass


class DataValidationError(FintelError):
    """Raised when input data does not meet expected schema."""
    pass


class InsufficientDataError(FintelError):
    """Raised when there are not enough data points for the requested computation."""
    pass


class InvalidParameterError(FintelError):
    """Raised when a function parameter is out of valid range."""
    pass


# =============================================================================
# Data Validation Utilities
# =============================================================================

REQUIRED_COLUMNS = ["Open", "High", "Low", "Close", "Volume"]


def validate_ohlcv(data):
    """Validate that input is a DataFrame with required OHLCV columns.

    Parameters
    ----------
    data : pd.DataFrame
        DataFrame to validate.

    Raises
    ------
    DataValidationError
        If data is not a DataFrame, is empty, or lacks required columns.
    """
    if not isinstance(data, pd.DataFrame):
        raise DataValidationError(
            f"Expected pd.DataFrame, got {type(data).__name__}"
        )
    if data.empty:
        raise DataValidationError("DataFrame is empty. Cannot perform analysis on empty data.")

    if isinstance(data.columns, pd.MultiIndex):
        data.columns = data.columns.get_level_values(0)

    missing = [col for col in REQUIRED_COLUMNS if col not in data.columns]
    if missing:
        raise DataValidationError(
            f"Missing required columns: {missing}. "
            f"Expected OHLCV columns: {REQUIRED_COLUMNS}"
        )

    for col in REQUIRED_COLUMNS:
        if not np.issubdtype(data[col].dtype, np.number):
            raise DataValidationError(
                f"Column '{col}' must be numeric, got {data[col].dtype}"
            )


def validate_positive_int(value, name):
    """Validate that a parameter is a positive integer."""
    if not isinstance(value, (int, np.integer)):
        raise InvalidParameterError(f"{name} must be an integer, got {type(value).__name__}")
    if value <= 0:
        raise InvalidParameterError(f"{name} must be positive, got {value}")


def validate_positive_float(value, name):
    """Validate that a parameter is a positive number."""
    if not isinstance(value, (int, float, np.integer, np.floating)):
        raise InvalidParameterError(f"{name} must be a number, got {type(value).__name__}")
    if value <= 0:
        raise InvalidParameterError(f"{name} must be positive, got {value}")
