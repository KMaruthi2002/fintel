import numpy as np
import pytest

from fintel.core import (
    InvalidParameterError,
    validate_positive_float,
    validate_positive_int,
)


@pytest.mark.parametrize("value", [float("nan"), float("inf"), float("-inf"), np.float64("nan")])
def test_positive_float_rejects_non_finite(value):
    with pytest.raises(InvalidParameterError, match="finite"):
        validate_positive_float(value, "num_std")


@pytest.mark.parametrize("value", [True, False, np.bool_(True)])
def test_bool_is_not_a_number_or_integer(value):
    with pytest.raises(InvalidParameterError):
        validate_positive_float(value, "x")
    with pytest.raises(InvalidParameterError):
        validate_positive_int(value, "window")


@pytest.mark.parametrize("value", [1, 2.5, np.float32(1.5), np.int64(3)])
def test_positive_float_accepts_valid_numbers(value):
    validate_positive_float(value, "x")


def test_positive_int_still_accepts_numpy_ints():
    validate_positive_int(np.int64(5), "window")
