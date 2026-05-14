"""Alert & SLO Engine — analogous to OpenTelemetry Alerting Rules & SLOs."""

from datetime import datetime
from fintel.core import (
    DataValidationError, InvalidParameterError, FintelError,
)
from fintel.metrics import MetricsEngine


class AlertRule:
    """Defines a threshold-based alert condition."""

    VALID_CONDITIONS = ("above", "below")
    VALID_SEVERITIES = ("info", "warning", "critical")

    def __init__(self, name, metric_name, condition, threshold, severity="warning"):
        if not isinstance(name, str) or not name.strip():
            raise InvalidParameterError("Rule name must be a non-empty string.")
        if condition not in self.VALID_CONDITIONS:
            raise InvalidParameterError(
                f"condition must be one of {self.VALID_CONDITIONS}, got '{condition}'"
            )
        if severity not in self.VALID_SEVERITIES:
            raise InvalidParameterError(
                f"severity must be one of {self.VALID_SEVERITIES}, got '{severity}'"
            )
        if not isinstance(threshold, (int, float)):
            raise InvalidParameterError(
                f"threshold must be a number, got {type(threshold).__name__}"
            )

        self.name = name.strip()
        self.metric_name = str(metric_name)
        self.condition = condition
        self.threshold = float(threshold)
        self.severity = severity

    def __repr__(self):
        return f"AlertRule('{self.name}': {self.metric_name} {self.condition} {self.threshold})"


class Alert:
    """A triggered alert — the result of evaluating an AlertRule."""

    def __init__(self, rule, triggered_at, current_value, message):
        self.rule = rule
        self.triggered_at = triggered_at
        self.current_value = current_value
        self.message = message

    def __repr__(self):
        return (
            f"Alert [{self.rule.severity.upper()}] {self.rule.name}: "
            f"{self.message} (value={self.current_value:.4f})"
        )


class AlertEngine:
    """Evaluates alert rules against a MetricsEngine and produces triggered alerts."""

    METRIC_EXTRACTORS = {
        "rsi": lambda me: float(me.rsi().dropna().iloc[-1]),
        "sharpe_ratio": lambda me: me.sharpe_ratio(),
        "max_drawdown": lambda me: me.max_drawdown()["max_drawdown"],
        "volatility": lambda me: float(me.rolling_volatility().dropna().iloc[-1]),
        "sma_20": lambda me: float(me.sma(20).dropna().iloc[-1]),
        "ema_20": lambda me: float(me.ema(20).dropna().iloc[-1]),
        "daily_return": lambda me: float(me.daily_returns().iloc[-1]),
        "total_return": lambda me: float(
            (me.data["Close"].iloc[-1] / me.data["Close"].iloc[0]) - 1
        ),
        "latest_close": lambda me: float(me.data["Close"].iloc[-1]),
    }

    def __init__(self):
        self._rules = {}
        self._triggered = []

    def add_rule(self, name, metric_name, condition, threshold, severity="warning"):
        """Register an alert rule."""
        if name in self._rules:
            raise InvalidParameterError(f"Rule '{name}' already exists. Use remove_rule() first.")
        if metric_name not in self.METRIC_EXTRACTORS:
            raise InvalidParameterError(
                f"Unknown metric '{metric_name}'. "
                f"Valid metrics: {list(self.METRIC_EXTRACTORS.keys())}"
            )

        rule = AlertRule(name, metric_name, condition, threshold, severity)
        self._rules[name] = rule
        return rule

    def remove_rule(self, name):
        """Remove a rule by name."""
        if name not in self._rules:
            raise InvalidParameterError(
                f"Rule '{name}' not found. Existing rules: {list(self._rules.keys())}"
            )
        del self._rules[name]

    def evaluate(self, metrics_engine):
        """Evaluate all rules against a MetricsEngine."""
        if not isinstance(metrics_engine, MetricsEngine):
            raise DataValidationError(
                f"Expected MetricsEngine, got {type(metrics_engine).__name__}"
            )

        self._triggered = []
        now = datetime.now()

        for name, rule in self._rules.items():
            try:
                extractor = self.METRIC_EXTRACTORS[rule.metric_name]
                current_value = extractor(metrics_engine)
            except Exception:
                continue

            triggered = False
            if rule.condition == "above" and current_value > rule.threshold:
                triggered = True
            elif rule.condition == "below" and current_value < rule.threshold:
                triggered = True

            if triggered:
                msg = (
                    f"{rule.metric_name} is {current_value:.4f}, "
                    f"which is {rule.condition} threshold {rule.threshold}"
                )
                alert = Alert(rule, now, current_value, msg)
                self._triggered.append(alert)

        return self._triggered

    def summary(self):
        """Return a formatted summary of all triggered alerts."""
        if not self._triggered:
            return "No alerts triggered. All systems nominal."

        lines = [f"=== ALERT SUMMARY ({len(self._triggered)} triggered) ==="]
        for alert in self._triggered:
            icon = {"critical": "[!!!]", "warning": "[!!]", "info": "[i]"}[alert.rule.severity]
            lines.append(f"  {icon} {alert.rule.name}: {alert.message}")
        return "\n".join(lines)

    def get_rules(self):
        """Return a list of all registered rules."""
        return list(self._rules.values())


class SLO:
    """Service Level Objective for a financial portfolio."""

    def __init__(self, name, target_metric, condition, target_value):
        if not isinstance(name, str) or not name.strip():
            raise InvalidParameterError("SLO name must be a non-empty string.")
        if condition not in ("above", "below"):
            raise InvalidParameterError(f"condition must be 'above' or 'below', got '{condition}'")
        if target_metric not in AlertEngine.METRIC_EXTRACTORS:
            raise InvalidParameterError(
                f"Unknown metric '{target_metric}'. "
                f"Valid: {list(AlertEngine.METRIC_EXTRACTORS.keys())}"
            )
        if not isinstance(target_value, (int, float)):
            raise InvalidParameterError(
                f"target_value must be a number, got {type(target_value).__name__}"
            )

        self.name = name.strip()
        self.target_metric = target_metric
        self.condition = condition
        self.target_value = float(target_value)

    def check(self, metrics_engine):
        """Check if the SLO is met."""
        if not isinstance(metrics_engine, MetricsEngine):
            raise DataValidationError(
                f"Expected MetricsEngine, got {type(metrics_engine).__name__}"
            )

        try:
            extractor = AlertEngine.METRIC_EXTRACTORS[self.target_metric]
            current = extractor(metrics_engine)
        except Exception as e:
            raise FintelError(f"Could not evaluate SLO '{self.name}': {e}")

        if self.condition == "above":
            met = current >= self.target_value
            margin = current - self.target_value
        else:
            met = current <= self.target_value
            margin = self.target_value - current

        return {
            "slo_name": self.name,
            "met": met,
            "current_value": current,
            "target": self.target_value,
            "margin": margin,
            "status": "PASS" if met else "FAIL",
        }

    def __repr__(self):
        return f"SLO('{self.name}': {self.target_metric} {self.condition} {self.target_value})"
