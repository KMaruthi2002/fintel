"""Observability Dashboard — analogous to Grafana-style multi-panel dashboards."""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec
from datetime import datetime

from fintel.core import (
    validate_ohlcv, DataValidationError, InvalidParameterError,
    InsufficientDataError, FintelError,
)
from fintel.metrics import MetricsEngine


COLORS = {
    "bg": "#1a1a2e",
    "panel_bg": "#16213e",
    "text": "#e0e0e0",
    "grid": "#2a2a4a",
    "price": "#00d4ff",
    "sma": "#ff6b6b",
    "ema": "#ffd93d",
    "bb_fill": "#4a4a8a",
    "bb_line": "#8888cc",
    "volume_up": "#00c853",
    "volume_down": "#ff1744",
    "volume_surge": "#ffab00",
    "critical": "#ff1744",
    "warning": "#ffab00",
    "info": "#00d4ff",
    "pass": "#00c853",
    "fail": "#ff1744",
}


class Dashboard:
    """Multi-panel observability dashboard for a financial instrument."""

    def __init__(self, ticker, data, metrics_engine, signals=None, alerts=None):
        if not isinstance(ticker, str) or not ticker.strip():
            raise InvalidParameterError("ticker must be a non-empty string.")
        if not isinstance(metrics_engine, MetricsEngine):
            raise DataValidationError(
                f"Expected MetricsEngine, got {type(metrics_engine).__name__}"
            )
        validate_ohlcv(data)

        self.ticker = ticker.strip().upper()
        self.data = data.copy()
        self.me = metrics_engine
        self.signals = signals or []
        self.alerts = alerts or []

    def _style_ax(self, ax, title):
        """Apply consistent dark theme styling to an axis."""
        ax.set_facecolor(COLORS["panel_bg"])
        ax.set_title(title, color=COLORS["text"], fontsize=11, fontweight="bold", loc="left")
        ax.tick_params(colors=COLORS["text"], labelsize=8)
        ax.grid(True, color=COLORS["grid"], alpha=0.3, linestyle="--")
        for spine in ax.spines.values():
            spine.set_color(COLORS["grid"])

    def plot_price_panel(self, ax):
        """Plot price line with signal annotations."""
        self._style_ax(ax, f"{self.ticker} Price")

        ax.plot(self.data.index, self.data["Close"], color=COLORS["price"],
                linewidth=1.2, label="Close")

        severity_colors = {
            "critical": COLORS["critical"],
            "warning": COLORS["warning"],
            "info": COLORS["info"],
        }
        signal_markers = {
            "volatility_spike": "v", "volume_surge": "D",
            "breakout_upper": "^", "breakout_lower": "v",
            "gap_up": "^", "gap_down": "v",
        }

        for sig in self.signals:
            if sig.timestamp in self.data.index:
                price = self.data.loc[sig.timestamp, "Close"]
                marker = signal_markers.get(sig.signal_type, "o")
                color = severity_colors.get(sig.severity, COLORS["info"])
                ax.scatter(sig.timestamp, price, color=color, marker=marker,
                          s=40, zorder=5, alpha=0.8)

        ax.set_ylabel("Price ($)", color=COLORS["text"], fontsize=9)
        ax.legend(loc="upper left", fontsize=7, facecolor=COLORS["panel_bg"],
                  edgecolor=COLORS["grid"], labelcolor=COLORS["text"])

    def plot_metrics_panel(self, ax):
        """Plot technical indicators — SMA, EMA, Bollinger Bands."""
        self._style_ax(ax, "Technical Indicators")

        ax.plot(self.data.index, self.data["Close"], color=COLORS["price"],
                linewidth=0.8, alpha=0.5, label="Close")

        try:
            sma_20 = self.me.sma(20)
            ax.plot(self.data.index, sma_20, color=COLORS["sma"],
                    linewidth=1.0, label="SMA(20)")
        except (InsufficientDataError, InvalidParameterError):
            pass

        try:
            ema_20 = self.me.ema(20)
            ax.plot(self.data.index, ema_20, color=COLORS["ema"],
                    linewidth=1.0, label="EMA(20)")
        except (InsufficientDataError, InvalidParameterError):
            pass

        try:
            upper, middle, lower = self.me.bollinger_bands(20, 2.0)
            ax.plot(self.data.index, upper, color=COLORS["bb_line"],
                    linewidth=0.7, linestyle="--", alpha=0.7)
            ax.plot(self.data.index, lower, color=COLORS["bb_line"],
                    linewidth=0.7, linestyle="--", alpha=0.7)
            ax.fill_between(self.data.index, upper, lower,
                           color=COLORS["bb_fill"], alpha=0.15, label="BB(20,2)")
        except (InsufficientDataError, InvalidParameterError):
            pass

        ax.set_ylabel("Price ($)", color=COLORS["text"], fontsize=9)
        ax.legend(loc="upper left", fontsize=7, facecolor=COLORS["panel_bg"],
                  edgecolor=COLORS["grid"], labelcolor=COLORS["text"])

    def plot_volume_panel(self, ax):
        """Plot volume bars colored by up/down days, with surge highlights."""
        self._style_ax(ax, "Volume")

        close = self.data["Close"]
        volume = self.data["Volume"]

        colors = np.where(close >= close.shift(1), COLORS["volume_up"], COLORS["volume_down"])

        surge_dates = set()
        for sig in self.signals:
            if sig.signal_type == "volume_surge":
                surge_dates.add(sig.timestamp)

        for i, date in enumerate(self.data.index):
            if date in surge_dates:
                colors[i] = COLORS["volume_surge"]

        ax.bar(self.data.index, volume, color=colors, width=0.8, alpha=0.7)
        ax.set_ylabel("Volume", color=COLORS["text"], fontsize=9)

    def plot_health_panel(self, ax):
        """Plot a health summary table with key metrics and status indicators."""
        self._style_ax(ax, "Health Status")
        ax.axis("off")

        try:
            summary = self.me.compute_summary()
        except Exception:
            ax.text(0.5, 0.5, "Insufficient data", ha="center", va="center",
                    color=COLORS["text"], fontsize=12, transform=ax.transAxes)
            return

        rsi_val = summary.get("rsi_14")
        if rsi_val is not None:
            if rsi_val < 30:
                rsi_status = ("OVERSOLD", COLORS["critical"])
            elif rsi_val > 70:
                rsi_status = ("OVERBOUGHT", COLORS["warning"])
            else:
                rsi_status = ("NEUTRAL", COLORS["pass"])
        else:
            rsi_status = ("N/A", COLORS["text"])

        sharpe = summary.get("sharpe_ratio", 0)
        if sharpe >= 1.0:
            sharpe_status = ("GOOD", COLORS["pass"])
        elif sharpe >= 0:
            sharpe_status = ("MODERATE", COLORS["warning"])
        else:
            sharpe_status = ("POOR", COLORS["critical"])

        metrics_display = [
            ("Latest Close", f"${summary['latest_close']:.2f}", COLORS["price"]),
            ("Sharpe Ratio", f"{sharpe:.2f} ({sharpe_status[0]})", sharpe_status[1]),
            ("RSI(14)", f"{rsi_val:.1f} ({rsi_status[0]})" if rsi_val else "N/A", rsi_status[1]),
            ("Max Drawdown", f"{summary['max_drawdown']:.2%}",
             COLORS["critical"] if summary["max_drawdown"] < -0.1 else COLORS["pass"]),
            ("Total Return", f"{summary['total_return']:.2%}",
             COLORS["pass"] if summary["total_return"] > 0 else COLORS["critical"]),
            ("Ann. Volatility",
             f"{summary['annualized_volatility']:.2%}" if summary.get("annualized_volatility") else "N/A",
             COLORS["text"]),
        ]

        y_start = 0.92
        for i, (label, value, color) in enumerate(metrics_display):
            y = y_start - i * 0.155
            ax.text(0.05, y, label, ha="left", va="center",
                    color=COLORS["text"], fontsize=9, fontweight="bold",
                    transform=ax.transAxes)
            ax.text(0.95, y, value, ha="right", va="center",
                    color=color, fontsize=9, fontfamily="monospace",
                    transform=ax.transAxes)

    def plot_alert_timeline(self, ax):
        """Plot triggered alerts as a horizontal timeline."""
        self._style_ax(ax, "Alert Timeline")

        if not self.alerts:
            ax.text(0.5, 0.5, "No alerts triggered", ha="center", va="center",
                    color=COLORS["pass"], fontsize=11, transform=ax.transAxes)
            ax.axis("off")
            return

        severity_colors = {
            "critical": COLORS["critical"],
            "warning": COLORS["warning"],
            "info": COLORS["info"],
        }

        y_positions = np.arange(len(self.alerts))
        colors = [severity_colors.get(a.rule.severity, COLORS["info"]) for a in self.alerts]
        labels = [a.rule.name for a in self.alerts]
        values = [a.current_value for a in self.alerts]

        ax.barh(y_positions, values, color=colors, height=0.5, alpha=0.8)
        ax.set_yticks(y_positions)
        ax.set_yticklabels(labels, color=COLORS["text"], fontsize=8)
        ax.set_xlabel("Metric Value", color=COLORS["text"], fontsize=8)
        ax.invert_yaxis()

    def render(self, save_path=None, figsize=(18, 14)):
        """Render the full multi-panel dashboard."""
        fig = plt.figure(figsize=figsize, facecolor=COLORS["bg"])
        fig.suptitle(
            f"fintel Observability Dashboard \u2014 {self.ticker}",
            color=COLORS["text"], fontsize=16, fontweight="bold", y=0.98,
        )

        gs = GridSpec(3, 2, figure=fig, hspace=0.35, wspace=0.25,
                      left=0.06, right=0.97, top=0.93, bottom=0.05)

        ax_price = fig.add_subplot(gs[0, 0])
        ax_metrics = fig.add_subplot(gs[0, 1])
        ax_volume = fig.add_subplot(gs[1, 0])
        ax_health = fig.add_subplot(gs[1, 1])
        ax_alerts = fig.add_subplot(gs[2, :])

        self.plot_price_panel(ax_price)
        self.plot_metrics_panel(ax_metrics)
        self.plot_volume_panel(ax_volume)
        self.plot_health_panel(ax_health)
        self.plot_alert_timeline(ax_alerts)

        fig.text(0.99, 0.01, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                 ha="right", va="bottom", color=COLORS["text"], fontsize=7, alpha=0.5)

        if save_path:
            try:
                fig.savefig(save_path, dpi=150, facecolor=COLORS["bg"])
            except Exception as e:
                raise FintelError(f"Failed to save dashboard: {e}")

        plt.show()
        return fig

    @staticmethod
    def plot_correlation_heatmap(data_dict, save_path=None):
        """Plot a correlation heatmap across multiple tickers."""
        if not isinstance(data_dict, dict) or len(data_dict) < 2:
            raise InvalidParameterError(
                "data_dict must be a dict with at least 2 tickers."
            )

        returns = pd.DataFrame()
        for ticker, df in data_dict.items():
            try:
                validate_ohlcv(df)
                returns[ticker] = df["Close"].pct_change().dropna()
            except DataValidationError as e:
                raise DataValidationError(f"Error with ticker '{ticker}': {e}")

        corr = returns.corr()

        fig, ax = plt.subplots(figsize=(8, 6), facecolor=COLORS["bg"])
        ax.set_facecolor(COLORS["panel_bg"])

        im = ax.imshow(corr.values, cmap="RdYlGn", vmin=-1, vmax=1, aspect="auto")

        tickers = list(corr.columns)
        ax.set_xticks(range(len(tickers)))
        ax.set_yticks(range(len(tickers)))
        ax.set_xticklabels(tickers, color=COLORS["text"], fontsize=9, rotation=45)
        ax.set_yticklabels(tickers, color=COLORS["text"], fontsize=9)

        for i in range(len(tickers)):
            for j in range(len(tickers)):
                val = corr.values[i, j]
                text_color = "black" if abs(val) > 0.5 else COLORS["text"]
                ax.text(j, i, f"{val:.2f}", ha="center", va="center",
                        color=text_color, fontsize=9, fontweight="bold")

        cbar = fig.colorbar(im, ax=ax, shrink=0.8)
        cbar.ax.tick_params(colors=COLORS["text"])

        ax.set_title("Return Correlation Heatmap", color=COLORS["text"],
                     fontsize=13, fontweight="bold", pad=15)

        fig.tight_layout()

        if save_path:
            fig.savefig(save_path, dpi=150, facecolor=COLORS["bg"])

        plt.show()
        return fig
