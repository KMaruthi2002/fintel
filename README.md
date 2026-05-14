# fintel

**Financial Telemetry & Observability.** A Python package that applies the engineering discipline of [OpenTelemetry](https://opentelemetry.io/) to stock-market monitoring. Spans become detected market anomalies. Metrics become technical indicators. Alerting rules and SLOs become portfolio governance. Dashboards compose everything into one figure.

If you can monitor a production system, you can monitor a portfolio the same way. fintel is built around that thesis.

```bash
pip install fintel
```

## Table of contents

- [Why fintel](#why-fintel)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Modules](#modules)
- [Worked examples](#worked-examples)
- [Error handling](#error-handling)
- [Design philosophy](#design-philosophy)
- [Project status](#project-status)
- [License](#license)
- [Citation](#citation)

## Why fintel

Site Reliability Engineers and quantitative analysts solve a structurally identical problem. Both watch a noisy, time-evolving system and want to know when something is going wrong, how bad it is, and whether a stated reliability target is still being met. The software industry has converged on a vocabulary for this called observability, captured by the OpenTelemetry standard. Quantitative finance has not.

fintel imports that vocabulary directly. The four-module package layout mirrors the three pillars of observability:

| OpenTelemetry concept    | fintel counterpart                                              |
|--------------------------|------------------------------------------------------------------|
| Traces and spans         | `SignalDetector`: anomalies emitted as structured Signal objects |
| Metrics                  | `MetricsEngine`: technical indicators over rolling windows       |
| Alerts and SLOs          | `AlertEngine` and `SLO`: threshold rules and reliability targets |
| Dashboards               | `Dashboard`: multi-panel matplotlib figure                       |

## Installation

The package depends only on the standard scientific Python stack.

```bash
# Latest stable release from PyPI
pip install fintel

# With notebook helpers
pip install "fintel[notebook]"

# From source
git clone https://github.com/KMaruthi2002/fintel.git
cd fintel
pip install -e .
```

Minimum supported Python is 3.8. Runtime dependencies: `pandas>=1.5`, `numpy>=1.22`, `matplotlib>=3.5`, `yfinance>=0.2`.

## Quick start

```python
import yfinance as yf
from fintel import SignalDetector, MetricsEngine, AlertEngine, Dashboard

# 1. Pull a year of OHLCV data
data = yf.download("AAPL", period="1y", progress=False)

# 2. Detect anomalies
signals = SignalDetector(data, ticker="AAPL").get_all_signals()

# 3. Compute metrics
metrics = MetricsEngine(data)
print(metrics.compute_summary())

# 4. Define and evaluate alert rules
alerts = AlertEngine()
alerts.add_rule("RSI Oversold", "rsi", "below", 30, "critical")
alerts.add_rule("Severe Drawdown", "max_drawdown", "below", -0.15, "critical")
triggered = alerts.evaluate(metrics)
print(alerts.summary())

# 5. Render the full dashboard
Dashboard("AAPL", data, metrics, signals=signals, alerts=triggered).render()
```

## Modules

### `SignalDetector` — spans for market anomalies

Each detection method scans the OHLCV DataFrame and returns a list of `Signal` objects carrying ticker, timestamp, severity (`info` / `warning` / `critical`), observed value, threshold, and metadata.

```python
detector = SignalDetector(data, ticker="AAPL")
detector.detect_volatility_spikes(window=20, threshold_std=2.0)
detector.detect_volume_surges(window=20, threshold_multiplier=2.0)
detector.detect_price_breakouts(window=20, num_std=2.0)
detector.detect_gap_events(min_gap_pct=2.0)
detector.get_all_signals()  # composite, time-sorted
```

### `MetricsEngine` — technical indicators as metric instruments

Lazy-evaluated, internally cached indicators returned as native pandas Series.

```python
me = MetricsEngine(data)
me.sma(window=20)
me.ema(window=20)
me.bollinger_bands(window=20, num_std=2.0)
me.rsi(window=14)
me.rolling_volatility(window=20)
me.sharpe_ratio(risk_free_rate=0.02)
me.max_drawdown()
me.compute_summary()  # one-shot dict of every metric
```

### `AlertEngine` and `SLO` — alerting rules and reliability targets

```python
ae = AlertEngine()
ae.add_rule(name, metric_name, condition, threshold, severity)
triggered = ae.evaluate(metrics_engine)  # list of Alert objects
print(ae.summary())

slo = SLO("Min Sharpe", target_metric="sharpe_ratio", condition="above", target_value=1.0)
result = slo.check(metrics_engine)
# {'slo_name': ..., 'met': True/False, 'current_value': ..., 'target': ..., 'margin': ...}
```

Valid metric names for rules and SLOs: `rsi`, `sharpe_ratio`, `max_drawdown`, `volatility`, `sma_20`, `ema_20`, `daily_return`, `total_return`, `latest_close`.

### `Dashboard` — single-pane-of-glass visualization

Composes five matplotlib panels into one figure styled after Grafana's dark theme.

```python
dash = Dashboard(ticker="AAPL", data=data, metrics_engine=me,
                 signals=signals, alerts=triggered)
fig = dash.render(save_path="aapl_dashboard.png")

# Multi-asset comparison
Dashboard.plot_correlation_heatmap({"AAPL": aapl_data,
                                    "GOOGL": googl_data,
                                    "MSFT": msft_data})
```

## Worked examples

### 1. Single-asset anomaly detection

```python
from fintel import SignalDetector

detector = SignalDetector(data, ticker="TSLA")
signals = detector.get_all_signals(
    window=20,
    threshold_std=2.0,
    threshold_multiplier=2.0,
    num_std=2.0,
    min_gap_pct=2.0,
)
critical = [s for s in signals if s.severity == "critical"]
print(f"Total: {len(signals)}  Critical: {len(critical)}")
```

### 2. Service-Level Objectives on a portfolio

```python
from fintel import SLO, MetricsEngine

me = MetricsEngine(portfolio_returns)
slos = [
    SLO("Min Sharpe",         "sharpe_ratio", "above", 1.0),
    SLO("Drawdown budget",    "max_drawdown", "above", -0.15),
    SLO("RSI health floor",   "rsi",          "above", 25),
]
for slo in slos:
    r = slo.check(me)
    status = "PASS" if r["met"] else "FAIL"
    print(f"{status}  {r['slo_name']}: margin = {r['margin']:+.4f}")
```

### 3. Multi-asset correlation heatmap

```python
from fintel import Dashboard
import yfinance as yf

tickers = ["AAPL", "GOOGL", "MSFT", "AMZN", "NVDA"]
basket = {t: yf.download(t, period="1y", progress=False) for t in tickers}
Dashboard.plot_correlation_heatmap(basket, save_path="basket_corr.png")
```

## Error handling

Every public method validates its inputs and raises a typed exception:

```text
FintelError                  base class — catch this for anything fintel-originated
├── DataValidationError      bad input shape: missing OHLCV columns, wrong dtype, empty DataFrame
├── InsufficientDataError    request needs more observations than the data has
└── InvalidParameterError    out-of-range or wrong-type argument, unknown metric name, duplicate rule
```

```python
from fintel import MetricsEngine, InsufficientDataError

try:
    me = MetricsEngine(tiny_data)
    me.sma(window=100)
except InsufficientDataError as e:
    print(f"Skipping: {e}")
```

## Design philosophy

- **Composability over a god-object.** Each module is independently testable. `Dashboard` accepts a pre-built `MetricsEngine` rather than reconstructing one. Nothing reaches inside another module's private members.
- **Lazy evaluation with caching.** Indicators are computed on first request and stored. SMA used by both the Bollinger envelope and the dashboard is calculated only once.
- **Fail loud, not fail quiet.** Every public method validates inputs and raises a typed `FintelError` subclass. Silent NaNs would propagate through downstream alerting and produce wrong, confident answers.
- **OpenTelemetry mapping is made explicit.** Severity strings (`info`, `warning`, `critical`) and SLO terminology are imported deliberately so the analogy is reviewable in the code.

## Project status

| Item | Status |
|---|---|
| Stable public API | Yes (v1.0.0) |
| Test suite | 9 groups, 30+ assertions, all error paths exercised |
| Python versions tested | 3.8, 3.9, 3.10, 3.11, 3.12 |
| Active development | Yes |
| Production deployments | Academic project; treat as beta for production use |

### Roadmap

- Adaptive thresholds via rolling-window quantile estimators
- Streaming mode via `asyncio` for live tick feeds
- SQLite persistence for historical signal and alert replay
- Native OpenTelemetry exporter that emits fintel signals as actual OTel spans, ingestable by Grafana, Datadog, or any compliant backend
- Portfolio-level SLOs with multi-asset weighting

## License

Released under the MIT License. See [`LICENSE`](LICENSE) for the full text.

## Citation

If you use fintel in academic work, please cite:

```
Kunchala, M. (2026). fintel: Financial Telemetry and Observability.
Final project, FE 520 (Financial Engineering in Python),
Stevens Institute of Technology, Spring 2026.
```

---

Made for FE 520 at Stevens Institute of Technology. Built with pandas, numpy, matplotlib, and yfinance, intentionally and only.
