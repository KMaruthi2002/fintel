import numpy as np
import pandas as pd
import pytest

from fintel.metrics import MetricsEngine


def _engine(closes):
    idx = pd.date_range("2024-01-01", periods=len(closes))
    df = pd.DataFrame(
        {"Open": closes, "High": closes, "Low": closes, "Close": closes, "Volume": [1000] * len(closes)},
        index=idx,
    )
    return MetricsEngine(df)


def test_rsi_is_100_when_price_only_rises():
    rsi = _engine(list(np.arange(100.0, 130.0))).rsi()
    assert rsi.iloc[-1] == pytest.approx(100.0)


def test_rsi_is_50_when_price_is_flat():
    rsi = _engine([100.0] * 30).rsi()
    assert rsi.iloc[-1] == pytest.approx(50.0)


def test_rsi_is_0_when_price_only_falls():
    rsi = _engine(list(np.arange(130.0, 100.0, -1.0))).rsi()
    assert rsi.iloc[-1] == pytest.approx(0.0)


def test_rsi_warmup_is_nan_and_values_stay_in_range():
    rng = np.random.default_rng(0)
    rsi = _engine(list(100 + rng.normal(0, 1, 60).cumsum())).rsi()
    assert rsi.iloc[:13].isna().all()
    valid = rsi.dropna()
    assert ((valid >= 0) & (valid <= 100)).all()
