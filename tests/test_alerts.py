import pandas as pd
import pytest

from fintel.alerts import SLO, AlertEngine
from fintel.core import DataValidationError, FintelError, InvalidParameterError
from fintel.metrics import MetricsEngine


def _engine(closes):
    idx = pd.date_range("2024-01-01", periods=len(closes))
    df = pd.DataFrame(
        {"Open": closes, "High": closes, "Low": closes, "Close": closes, "Volume": [1000] * len(closes)},
        index=idx,
    )
    return MetricsEngine(df)


def _rising(n=30, start=100.0):
    return _engine([start + i for i in range(n)])


def test_rule_fires_when_value_is_above_threshold():
    engine = AlertEngine()
    engine.add_rule("high_price", "latest_close", "above", 120, severity="critical")
    alerts = engine.evaluate(_rising())  # latest close is 129
    assert [a.rule.name for a in alerts] == ["high_price"]
    assert alerts[0].current_value == pytest.approx(129.0)
    assert "above threshold" in alerts[0].message


def test_rule_fires_when_value_is_below_threshold():
    engine = AlertEngine()
    engine.add_rule("low_price", "latest_close", "below", 200)
    assert len(engine.evaluate(_rising())) == 1


def test_rule_does_not_fire_when_condition_is_not_met():
    engine = AlertEngine()
    engine.add_rule("high_price", "latest_close", "above", 500)
    engine.add_rule("low_price", "latest_close", "below", 0)
    assert engine.evaluate(_rising()) == []
    assert engine.summary() == "No alerts triggered. All systems nominal."


def test_threshold_equal_to_value_does_not_fire():
    engine = AlertEngine()
    engine.add_rule("exact_above", "latest_close", "above", 129)
    engine.add_rule("exact_below", "latest_close", "below", 129)
    assert engine.evaluate(_rising()) == []


def test_evaluate_resets_previous_results():
    engine = AlertEngine()
    engine.add_rule("high_price", "latest_close", "above", 120)
    assert len(engine.evaluate(_rising())) == 1
    assert engine.evaluate(_engine([50.0] * 30)) == []
    assert engine.summary() == "No alerts triggered. All systems nominal."


def test_rule_with_insufficient_history_is_skipped_not_raised():
    engine = AlertEngine()
    engine.add_rule("needs_rsi", "rsi", "above", 10)
    engine.add_rule("always", "latest_close", "above", 0)
    alerts = engine.evaluate(_engine([100.0, 101.0, 102.0]))
    assert [a.rule.name for a in alerts] == ["always"]


def test_summary_lists_each_triggered_alert_with_severity_icon():
    engine = AlertEngine()
    engine.add_rule("crit", "latest_close", "above", 120, severity="critical")
    engine.add_rule("info", "total_return", "above", 0.1, severity="info")
    engine.evaluate(_rising())
    summary = engine.summary()
    assert summary.startswith("=== ALERT SUMMARY (2 triggered) ===")
    assert "[!!!] crit:" in summary
    assert "[i] info:" in summary


def test_add_rule_rejects_duplicates_and_unknown_metrics():
    engine = AlertEngine()
    engine.add_rule("r", "latest_close", "above", 1)
    with pytest.raises(InvalidParameterError, match="already exists"):
        engine.add_rule("r", "latest_close", "above", 1)
    with pytest.raises(InvalidParameterError, match="Unknown metric"):
        engine.add_rule("other", "not_a_metric", "above", 1)


@pytest.mark.parametrize(
    "kwargs",
    [
        {"name": "  "},
        {"condition": "equal"},
        {"severity": "fatal"},
        {"threshold": "high"},
    ],
)
def test_add_rule_validates_rule_fields(kwargs):
    args = {"name": "r", "metric_name": "latest_close", "condition": "above", "threshold": 1}
    args.update(kwargs)
    with pytest.raises(InvalidParameterError):
        AlertEngine().add_rule(**args)


def test_remove_rule():
    engine = AlertEngine()
    engine.add_rule("r", "latest_close", "above", 1)
    engine.remove_rule("r")
    assert engine.get_rules() == []
    with pytest.raises(InvalidParameterError, match="not found"):
        engine.remove_rule("r")


def test_evaluate_requires_a_metrics_engine():
    with pytest.raises(DataValidationError):
        AlertEngine().evaluate(pd.DataFrame())


def test_slo_above_reports_pass_and_margin():
    result = SLO("price floor", "latest_close", "above", 100).check(_rising())
    assert result["met"] is True
    assert result["status"] == "PASS"
    assert result["margin"] == pytest.approx(29.0)


def test_slo_below_reports_fail_and_negative_margin():
    result = SLO("price cap", "latest_close", "below", 100).check(_rising())
    assert result["met"] is False
    assert result["status"] == "FAIL"
    assert result["margin"] == pytest.approx(-29.0)


def test_slo_target_is_inclusive():
    assert SLO("edge", "latest_close", "above", 129).check(_rising())["met"] is True
    assert SLO("edge", "latest_close", "below", 129).check(_rising())["met"] is True


def test_slo_wraps_metric_failures_in_fintel_error():
    with pytest.raises(FintelError, match="Could not evaluate SLO"):
        SLO("rsi", "rsi", "above", 50).check(_engine([100.0, 101.0, 102.0]))


def test_slo_validates_constructor_arguments():
    with pytest.raises(InvalidParameterError):
        SLO("", "latest_close", "above", 1)
    with pytest.raises(InvalidParameterError):
        SLO("s", "latest_close", "equal", 1)
    with pytest.raises(InvalidParameterError, match="Unknown metric"):
        SLO("s", "nope", "above", 1)
    with pytest.raises(InvalidParameterError):
        SLO("s", "latest_close", "above", "1")
