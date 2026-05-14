"""Signal Detection Engine — analogous to OpenTelemetry Traces & Spans."""

import pandas as pd
import numpy as np
from fintel.core import (
    validate_ohlcv, validate_positive_int, validate_positive_float,
    DataValidationError, InsufficientDataError, InvalidParameterError,
)


class Signal:
    """Represents a detected market event, analogous to an OpenTelemetry Span."""

    VALID_SEVERITIES = ("info", "warning", "critical")

    def __init__(self, ticker, signal_type, timestamp, severity, value, threshold, metadata=None):
        if severity not in self.VALID_SEVERITIES:
            raise InvalidParameterError(
                f"severity must be one of {self.VALID_SEVERITIES}, got '{severity}'"
            )
        self.ticker = str(ticker)
        self.signal_type = str(signal_type)
        self.timestamp = timestamp
        self.severity = severity
        self.value = float(value)
        self.threshold = float(threshold)
        self.metadata = metadata or {}

    def __repr__(self):
        return (
            f"Signal({self.ticker} | {self.signal_type} | "
            f"{self.severity.upper()} | {self.timestamp.strftime('%Y-%m-%d')} | "
            f"value={self.value:.4f}, threshold={self.threshold:.4f})"
        )

    def to_dict(self):
        """Convert signal to a dictionary for DataFrame creation."""
        return {
            "ticker": self.ticker,
            "signal_type": self.signal_type,
            "timestamp": self.timestamp,
            "severity": self.severity,
            "value": self.value,
            "threshold": self.threshold,
            "metadata": str(self.metadata),
        }


class SignalDetector:
    """Scans OHLCV data for market anomalies and emits Signal objects."""

    def __init__(self, data, ticker="UNKNOWN"):
        try:
            validate_ohlcv(data)
        except DataValidationError:
            raise
        except Exception as e:
            raise DataValidationError(f"Unexpected error validating data: {e}")

        self.data = data.copy()
        self.ticker = str(ticker)
        self._signals = []

    def detect_volatility_spikes(self, window=20, threshold_std=2.0):
        """Detect periods where rolling volatility exceeds a threshold."""
        validate_positive_int(window, "window")
        validate_positive_float(threshold_std, "threshold_std")

        if len(self.data) < window:
            raise InsufficientDataError(
                f"Need at least {window} data points, have {len(self.data)}"
            )

        returns = self.data["Close"].pct_change().dropna()
        rolling_vol = returns.rolling(window=window).std()
        mean_vol = rolling_vol.mean()
        std_vol = rolling_vol.std()
        threshold = mean_vol + threshold_std * std_vol

        signals = []
        spike_mask = rolling_vol > threshold

        for date in rolling_vol[spike_mask].index:
            vol_val = rolling_vol.loc[date]
            severity = "critical" if vol_val > mean_vol + 3 * std_vol else "warning"
            sig = Signal(
                ticker=self.ticker,
                signal_type="volatility_spike",
                timestamp=date,
                severity=severity,
                value=vol_val,
                threshold=threshold,
                metadata={"window": window, "mean_vol": round(mean_vol, 6)},
            )
            signals.append(sig)

        self._signals.extend(signals)
        return signals

    def detect_volume_surges(self, window=20, threshold_multiplier=2.0):
        """Detect days where volume exceeds a multiple of the rolling average."""
        validate_positive_int(window, "window")
        validate_positive_float(threshold_multiplier, "threshold_multiplier")

        if len(self.data) < window:
            raise InsufficientDataError(
                f"Need at least {window} data points, have {len(self.data)}"
            )

        avg_volume = self.data["Volume"].rolling(window=window).mean()
        threshold = avg_volume * threshold_multiplier

        signals = []
        surge_mask = (self.data["Volume"] > threshold) & avg_volume.notna()

        for date in self.data[surge_mask].index:
            vol = self.data.loc[date, "Volume"]
            avg = avg_volume.loc[date]
            multiplier = vol / avg if avg > 0 else 0
            severity = "critical" if multiplier > 3.0 else "warning"

            sig = Signal(
                ticker=self.ticker,
                signal_type="volume_surge",
                timestamp=date,
                severity=severity,
                value=vol,
                threshold=threshold.loc[date],
                metadata={"multiplier": round(multiplier, 2), "avg_volume": round(avg, 0)},
            )
            signals.append(sig)

        self._signals.extend(signals)
        return signals

    def detect_price_breakouts(self, window=20, num_std=2.0):
        """Detect when price breaks above/below Bollinger Bands."""
        validate_positive_int(window, "window")
        validate_positive_float(num_std, "num_std")

        if len(self.data) < window:
            raise InsufficientDataError(
                f"Need at least {window} data points, have {len(self.data)}"
            )

        close = self.data["Close"]
        sma = close.rolling(window=window).mean()
        std = close.rolling(window=window).std()
        upper = sma + num_std * std
        lower = sma - num_std * std

        signals = []
        valid_idx = sma.dropna().index

        for date in valid_idx:
            price = close.loc[date]
            if price > upper.loc[date]:
                sig = Signal(
                    ticker=self.ticker, signal_type="breakout_upper",
                    timestamp=date, severity="warning",
                    value=price, threshold=upper.loc[date],
                    metadata={"band": "upper", "sma": round(sma.loc[date], 2)},
                )
                signals.append(sig)
            elif price < lower.loc[date]:
                sig = Signal(
                    ticker=self.ticker, signal_type="breakout_lower",
                    timestamp=date, severity="critical",
                    value=price, threshold=lower.loc[date],
                    metadata={"band": "lower", "sma": round(sma.loc[date], 2)},
                )
                signals.append(sig)

        self._signals.extend(signals)
        return signals

    def detect_gap_events(self, min_gap_pct=2.0):
        """Detect opening gaps between previous close and current open."""
        validate_positive_float(min_gap_pct, "min_gap_pct")

        if len(self.data) < 2:
            raise InsufficientDataError("Need at least 2 data points to detect gaps.")

        prev_close = self.data["Close"].shift(1)
        current_open = self.data["Open"]
        gap_pct = ((current_open - prev_close) / prev_close * 100).dropna()

        signals = []
        for date in gap_pct.index:
            gap = gap_pct.loc[date]
            if abs(gap) >= min_gap_pct:
                direction = "gap_up" if gap > 0 else "gap_down"
                severity = "critical" if abs(gap) >= 2 * min_gap_pct else "warning"
                sig = Signal(
                    ticker=self.ticker, signal_type=direction,
                    timestamp=date, severity=severity,
                    value=abs(gap), threshold=min_gap_pct,
                    metadata={"gap_pct": round(gap, 2), "direction": direction},
                )
                signals.append(sig)

        self._signals.extend(signals)
        return signals

    def get_all_signals(self, window=20, threshold_std=2.0, threshold_multiplier=2.0,
                        num_std=2.0, min_gap_pct=2.0):
        """Run all detection methods and return combined, time-sorted signals."""
        self._signals = []
        self.detect_volatility_spikes(window=window, threshold_std=threshold_std)
        self.detect_volume_surges(window=window, threshold_multiplier=threshold_multiplier)
        self.detect_price_breakouts(window=window, num_std=num_std)
        self.detect_gap_events(min_gap_pct=min_gap_pct)
        self._signals.sort(key=lambda s: s.timestamp)
        return self._signals

    def signals_to_dataframe(self):
        """Convert all detected signals to a pandas DataFrame."""
        if not self._signals:
            return pd.DataFrame(columns=["ticker", "signal_type", "timestamp",
                                          "severity", "value", "threshold", "metadata"])
        return pd.DataFrame([s.to_dict() for s in self._signals])
