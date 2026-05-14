"""Financial Metrics Engine — analogous to OpenTelemetry Metric Instruments."""

import pandas as pd
import numpy as np
from fintel.core import (
    validate_ohlcv, validate_positive_int, validate_positive_float,
    DataValidationError, InsufficientDataError, InvalidParameterError,
)


class MetricsEngine:
    """Compute and cache financial metrics over configurable time windows."""

    def __init__(self, data):
        try:
            validate_ohlcv(data)
        except DataValidationError:
            raise
        except Exception as e:
            raise DataValidationError(f"Unexpected error validating data: {e}")

        self.data = data.copy()
        self._cache = {}

    def _check_window(self, window, name="window"):
        """Validate window size against available data."""
        validate_positive_int(window, name)
        if len(self.data) < window:
            raise InsufficientDataError(
                f"Need at least {window} data points for {name}={window}, "
                f"have {len(self.data)}"
            )

    def daily_returns(self):
        """Compute daily percentage returns."""
        if "daily_returns" not in self._cache:
            self._cache["daily_returns"] = self.data["Close"].pct_change().dropna()
        return self._cache["daily_returns"]

    def sma(self, window=20):
        """Simple Moving Average."""
        self._check_window(window)
        key = f"sma_{window}"
        if key not in self._cache:
            self._cache[key] = self.data["Close"].rolling(window=window).mean()
        return self._cache[key]

    def ema(self, window=20):
        """Exponential Moving Average."""
        self._check_window(window)
        key = f"ema_{window}"
        if key not in self._cache:
            self._cache[key] = self.data["Close"].ewm(span=window, adjust=False).mean()
        return self._cache[key]

    def bollinger_bands(self, window=20, num_std=2.0):
        """Bollinger Bands (upper, middle, lower)."""
        self._check_window(window)
        validate_positive_float(num_std, "num_std")

        middle = self.sma(window)
        std = self.data["Close"].rolling(window=window).std()
        upper = middle + num_std * std
        lower = middle - num_std * std
        return upper, middle, lower

    def rsi(self, window=14):
        """Relative Strength Index."""
        self._check_window(window)
        key = f"rsi_{window}"
        if key not in self._cache:
            delta = self.data["Close"].diff()
            gain = delta.where(delta > 0, 0.0)
            loss = (-delta).where(delta < 0, 0.0)

            avg_gain = gain.rolling(window=window).mean()
            avg_loss = loss.rolling(window=window).mean()

            rs = np.where(avg_loss != 0, avg_gain / avg_loss, 100.0)
            rsi_values = 100 - (100 / (1 + rs))
            self._cache[key] = pd.Series(rsi_values, index=self.data.index, name="RSI")
        return self._cache[key]

    def rolling_volatility(self, window=20):
        """Rolling annualized volatility."""
        self._check_window(window)
        key = f"vol_{window}"
        if key not in self._cache:
            returns = self.daily_returns()
            self._cache[key] = returns.rolling(window=window).std() * np.sqrt(252)
        return self._cache[key]

    def sharpe_ratio(self, risk_free_rate=0.02, period=252):
        """Annualized Sharpe Ratio."""
        if not isinstance(risk_free_rate, (int, float)):
            raise InvalidParameterError(
                f"risk_free_rate must be a number, got {type(risk_free_rate).__name__}"
            )

        returns = self.daily_returns()
        if len(returns) == 0:
            raise InsufficientDataError("No return data available for Sharpe ratio.")

        excess_returns = returns - risk_free_rate / period
        std = excess_returns.std()

        if std == 0:
            return 0.0
        return float((excess_returns.mean() / std) * np.sqrt(period))

    def max_drawdown(self):
        """Maximum Drawdown — the largest peak-to-trough decline."""
        close = self.data["Close"]
        cumulative_max = close.cummax()
        drawdown = (close - cumulative_max) / cumulative_max

        max_dd = drawdown.min()
        trough_date = drawdown.idxmin()
        peak_date = close.loc[:trough_date].idxmax()

        return {
            "max_drawdown": float(max_dd),
            "peak_date": peak_date,
            "trough_date": trough_date,
        }

    def compute_summary(self):
        """Compute a summary dictionary of key metrics."""
        dd = self.max_drawdown()
        latest_rsi = self.rsi().dropna()
        latest_rsi_val = float(latest_rsi.iloc[-1]) if len(latest_rsi) > 0 else None

        return {
            "latest_close": float(self.data["Close"].iloc[-1]),
            "sma_20": float(self.sma(20).iloc[-1]) if len(self.data) >= 20 else None,
            "ema_20": float(self.ema(20).iloc[-1]) if len(self.data) >= 20 else None,
            "rsi_14": latest_rsi_val,
            "sharpe_ratio": self.sharpe_ratio(),
            "max_drawdown": dd["max_drawdown"],
            "max_drawdown_peak": str(dd["peak_date"].date()) if hasattr(dd["peak_date"], "date") else str(dd["peak_date"]),
            "max_drawdown_trough": str(dd["trough_date"].date()) if hasattr(dd["trough_date"], "date") else str(dd["trough_date"]),
            "annualized_volatility": float(self.rolling_volatility(20).iloc[-1]) if len(self.data) >= 20 else None,
            "total_return": float((self.data["Close"].iloc[-1] / self.data["Close"].iloc[0]) - 1),
        }
