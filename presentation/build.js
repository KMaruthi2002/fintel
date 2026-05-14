// fintel — FE 520 Final Project Presentation
// Formal academic deck — Burgundy / Navy / White / Black palette

const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaChartLine, FaBell, FaBolt, FaTachometerAlt, FaShieldAlt, FaCheckCircle,
  FaExclamationTriangle, FaCogs, FaDatabase, FaLayerGroup, FaSearch,
  FaCode, FaBookOpen, FaFlask, FaProjectDiagram, FaQuestion,
} = require("react-icons/fa");

// =============================================================================
// PALETTE — Burgundy / Navy / White / Black ONLY
// =============================================================================
const BURGUNDY = "7B1E2D";
const BURGUNDY_DEEP = "5C1521";
const NAVY = "0B2545";
const NAVY_DEEP = "06182E";
const WHITE = "FFFFFF";
const OFFWHITE = "F4F2EE";
const BLACK = "111111";
const RULE = "C9B79C00"; // unused — kept palette strict
const PAPER = "FAF7F2"; // very subtle warm white for content
const INK = "1A1A1A"; // softened black for body text

// Fonts
const HEADER_FONT = "Georgia";
const BODY_FONT = "Calibri";

// =============================================================================
// ICON HELPERS
// =============================================================================
function renderIconSvg(IconComponent, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}
async function iconPng(IconComponent, hex, size = 256) {
  const svg = renderIconSvg(IconComponent, "#" + hex, size);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// =============================================================================
// LAYOUT HELPERS
// =============================================================================
function pageNumber(slide, n, total) {
  slide.addText(`${n} / ${total}`, {
    x: 12.0, y: 7.15, w: 1.0, h: 0.25,
    fontSize: 9, fontFace: BODY_FONT, color: NAVY,
    align: "right", margin: 0,
  });
}

function footer(slide) {
  // Hairline rule near the bottom
  slide.addShape("line", {
    x: 0.6, y: 7.05, w: 12.1, h: 0,
    line: { color: BURGUNDY, width: 0.75 },
  });
  slide.addText("fintel  |  Financial Telemetry & Observability", {
    x: 0.6, y: 7.15, w: 8.0, h: 0.25,
    fontSize: 9, fontFace: BODY_FONT, color: NAVY, italic: true, margin: 0,
  });
}

function sectionLabel(slide, text) {
  slide.addText(text, {
    x: 0.6, y: 0.35, w: 6.0, h: 0.3,
    fontSize: 11, fontFace: BODY_FONT, color: BURGUNDY,
    bold: true, charSpacing: 6, margin: 0,
  });
}

function slideTitle(slide, text) {
  // Title with enough height for either 1- or 2-line wraps at 32pt Georgia
  slide.addText(text, {
    x: 0.6, y: 0.65, w: 12.1, h: 1.15,
    fontSize: 30, fontFace: HEADER_FONT, color: NAVY,
    bold: true, margin: 0, valign: "top",
  });
  // Burgundy rule placed below the wrap zone — never overlaps text
  slide.addShape("rect", {
    x: 0.6, y: 1.88, w: 0.5, h: 0.05,
    fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
  });
}

// =============================================================================
// MAIN
// =============================================================================
async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
  pres.author = "FE 520 Final Project";
  pres.title = "fintel: Financial Telemetry & Observability";
  pres.company = "FE 520 — Spring 2026";

  // Pre-render icons
  const ic = {
    chart: await iconPng(FaChartLine, BURGUNDY),
    bell: await iconPng(FaBell, BURGUNDY),
    bolt: await iconPng(FaBolt, BURGUNDY),
    gauge: await iconPng(FaTachometerAlt, BURGUNDY),
    shield: await iconPng(FaShieldAlt, BURGUNDY),
    check: await iconPng(FaCheckCircle, BURGUNDY),
    warn: await iconPng(FaExclamationTriangle, BURGUNDY),
    cogs: await iconPng(FaCogs, BURGUNDY),
    db: await iconPng(FaDatabase, BURGUNDY),
    layer: await iconPng(FaLayerGroup, BURGUNDY),
    search: await iconPng(FaSearch, BURGUNDY),
    code: await iconPng(FaCode, BURGUNDY),
    book: await iconPng(FaBookOpen, BURGUNDY),
    flask: await iconPng(FaFlask, BURGUNDY),
    proj: await iconPng(FaProjectDiagram, BURGUNDY),
    q: await iconPng(FaQuestion, BURGUNDY),
    chartW: await iconPng(FaChartLine, "FFFFFF"),
    bellW: await iconPng(FaBell, "FFFFFF"),
    boltW: await iconPng(FaBolt, "FFFFFF"),
    gaugeW: await iconPng(FaTachometerAlt, "FFFFFF"),
  };

  const TOTAL = 16;
  let n = 0;

  // ---------------------------------------------------------------------------
  // SLIDE 1 — TITLE
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: NAVY_DEEP };

    // Burgundy left bar
    s.addShape("rect", {
      x: 0, y: 0, w: 0.45, h: 7.5,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });

    // Top section label
    s.addText("FE 520  |  FINANCIAL ENGINEERING IN PYTHON", {
      x: 1.0, y: 1.2, w: 11, h: 0.4,
      fontSize: 12, fontFace: BODY_FONT, color: WHITE,
      bold: true, charSpacing: 8, margin: 0,
    });

    // Title
    s.addText("fintel", {
      x: 1.0, y: 1.7, w: 11, h: 1.4,
      fontSize: 88, fontFace: HEADER_FONT, color: WHITE,
      bold: true, italic: true, margin: 0,
    });

    // Subtitle
    s.addText("Financial Telemetry & Observability", {
      x: 1.0, y: 3.05, w: 11, h: 0.6,
      fontSize: 28, fontFace: HEADER_FONT, color: WHITE, margin: 0,
    });

    // Tagline rule
    s.addShape("rect", {
      x: 1.0, y: 3.85, w: 1.2, h: 0.05,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });

    s.addText(
      "An OpenTelemetry-Inspired Python Package for Quantitative Market Monitoring",
      {
        x: 1.0, y: 4.0, w: 11, h: 0.5,
        fontSize: 16, fontFace: BODY_FONT, color: WHITE, italic: true, margin: 0,
      }
    );

    // Author block
    s.addText(
      [
        { text: "Author:  ", options: { bold: true } },
        { text: "Maruthi Kunchala", options: { breakLine: true } },
        { text: "Course:  ", options: { bold: true } },
        { text: "FE 520 — Stevens Institute of Technology", options: { breakLine: true } },
        { text: "Term:    ", options: { bold: true } },
        { text: "Spring 2026", options: {} },
      ],
      {
        x: 1.0, y: 5.4, w: 7, h: 1.4,
        fontSize: 13, fontFace: BODY_FONT, color: WHITE, margin: 0,
      }
    );

    // Date stamp
    s.addText("April 26, 2026", {
      x: 9.5, y: 6.55, w: 3.3, h: 0.4,
      fontSize: 11, fontFace: BODY_FONT, color: WHITE,
      align: "right", italic: true, margin: 0,
    });
  }

  // ---------------------------------------------------------------------------
  // SLIDE 2 — AGENDA
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    sectionLabel(s, "AGENDA");
    slideTitle(s, "Outline of Discussion");

    const items = [
      ["I.",   "Problem Statement & Motivation"],
      ["II.",  "Theoretical Foundation: The Three Pillars of Observability"],
      ["III.", "System Architecture & Data Flow"],
      ["IV.",  "Module Walkthrough — Signals, Metrics, Alerts, Dashboard"],
      ["V.",   "Engineering Practices — Error Handling, Testing, Documentation"],
      ["VI.",  "Empirical Demonstration on Live Market Data"],
      ["VII.", "Design Decisions, Limitations, and Future Work"],
    ];

    let y = 2.0;
    items.forEach(([num, label], i) => {
      // Roman numeral in burgundy
      s.addText(num, {
        x: 1.0, y: y, w: 0.8, h: 0.5,
        fontSize: 18, fontFace: HEADER_FONT, color: BURGUNDY,
        bold: true, italic: true, margin: 0,
      });
      // Label
      s.addText(label, {
        x: 1.85, y: y, w: 10.5, h: 0.5,
        fontSize: 17, fontFace: BODY_FONT, color: NAVY, margin: 0,
      });
      // Hairline divider
      if (i < items.length - 1) {
        s.addShape("line", {
          x: 1.0, y: y + 0.55, w: 11.3, h: 0,
          line: { color: BURGUNDY, width: 0.5, transparency: 70 },
        });
      }
      y += 0.65;
    });

    footer(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 3 — PROBLEM STATEMENT & MOTIVATION
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    sectionLabel(s, "I.  PROBLEM STATEMENT");
    slideTitle(s, "Why Should We Monitor Stocks Like Production Systems?");

    // Left column — Problem
    s.addText("THE GAP", {
      x: 0.6, y: 2.15, w: 6.0, h: 0.3,
      fontSize: 11, fontFace: BODY_FONT, color: BURGUNDY,
      bold: true, charSpacing: 4, margin: 0,
    });
    s.addText(
      [
        { text: "Traditional financial analysis tools treat market data as flat numerical streams.", options: { breakLine: true } },
        { text: "", options: { breakLine: true } },
        { text: "Modern software engineering — through ", options: {} },
        { text: "OpenTelemetry", options: { bold: true, italic: true } },
        { text: " — has solved the same fundamental problem for distributed systems: ", options: {} },
        { text: "structured detection, aggregation, and alerting on time-series anomalies.", options: { italic: true } },
      ],
      {
        x: 0.6, y: 2.5, w: 6.0, h: 3.5,
        fontSize: 14, fontFace: BODY_FONT, color: INK,
        valign: "top", margin: 0, paraSpaceAfter: 6,
      }
    );

    // Vertical divider rule
    s.addShape("line", {
      x: 6.85, y: 2.15, w: 0, h: 4.7,
      line: { color: BURGUNDY, width: 0.75 },
    });

    // Right column — Thesis
    s.addText("THE THESIS", {
      x: 7.1, y: 2.15, w: 5.6, h: 0.3,
      fontSize: 11, fontFace: BODY_FONT, color: BURGUNDY,
      bold: true, charSpacing: 4, margin: 0,
    });
    s.addText(
      [
        { text: "Financial markets are ", options: {} },
        { text: "distributed systems", options: { bold: true } },
        { text: " of capital flow. Every observability primitive — traces, metrics, alerts, dashboards — has a direct, useful analogue in quantitative finance.", options: { breakLine: true } },
        { text: "", options: { breakLine: true } },
        { text: "fintel", options: { bold: true, italic: true } },
        { text: " operationalises this analogy as a ", options: {} },
        { text: "four-module Python package", options: { bold: true } },
        { text: " for event-driven, threshold-aware market monitoring.", options: {} },
      ],
      {
        x: 7.1, y: 2.5, w: 5.6, h: 4.3,
        fontSize: 14, fontFace: BODY_FONT, color: INK,
        valign: "top", margin: 0, paraSpaceAfter: 6,
      }
    );

    footer(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 4 — THEORETICAL FOUNDATION
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    sectionLabel(s, "II.  THEORETICAL FOUNDATION");
    slideTitle(s, "The Three Pillars of Observability — Mapped to Finance");

    // Three columns
    const cols = [
      {
        title: "TRACES & SPANS",
        otel: "Discrete events with start, end, severity, and metadata that record what happened in a system.",
        fin: "Detected market anomalies — volatility spikes, volume surges, price breakouts, opening gaps — as time-stamped Signal objects.",
        icon: ic.boltW,
      },
      {
        title: "METRICS",
        otel: "Numerical measurements aggregated over configurable time windows (counters, gauges, histograms).",
        fin: "Technical indicators with rolling-window aggregation: SMA, EMA, RSI, Bollinger Bands, Sharpe Ratio, Maximum Drawdown.",
        icon: ic.gaugeW,
      },
      {
        title: "ALERTING & SLOs",
        otel: "Threshold-based rules that fire when service-level objectives are breached.",
        fin: "Portfolio risk rules and SLOs — e.g. 'Sharpe ≥ 1.0' or 'Drawdown ≤ 15%' — evaluated against the live MetricsEngine.",
        icon: ic.bellW,
      },
    ];

    const cardW = 3.95;
    const startX = 0.6;
    const gap = 0.25;
    cols.forEach((c, i) => {
      const x = startX + i * (cardW + gap);
      // Navy header band
      s.addShape("rect", {
        x: x, y: 2.2, w: cardW, h: 0.85,
        fill: { color: NAVY }, line: { color: NAVY, width: 0 },
      });
      // Icon
      s.addImage({ data: c.icon, x: x + 0.25, y: 2.32, w: 0.5, h: 0.5 });
      // Title
      s.addText(c.title, {
        x: x + 0.85, y: 2.25, w: cardW - 1.0, h: 0.65,
        fontSize: 14, fontFace: HEADER_FONT, color: WHITE,
        bold: true, charSpacing: 3, valign: "middle", margin: 0,
      });
      // Body card
      s.addShape("rect", {
        x: x, y: 3.0, w: cardW, h: 3.85,
        fill: { color: WHITE }, line: { color: NAVY, width: 0.75 },
      });
      // Burgundy left accent
      s.addShape("rect", {
        x: x, y: 3.0, w: 0.08, h: 3.85,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
      });
      // OTel meaning
      s.addText("In OpenTelemetry", {
        x: x + 0.25, y: 3.15, w: cardW - 0.4, h: 0.3,
        fontSize: 10, fontFace: BODY_FONT, color: BURGUNDY,
        bold: true, italic: true, margin: 0,
      });
      s.addText(c.otel, {
        x: x + 0.25, y: 3.45, w: cardW - 0.4, h: 1.4,
        fontSize: 12, fontFace: BODY_FONT, color: INK, margin: 0,
      });
      // Divider
      s.addShape("line", {
        x: x + 0.25, y: 4.85, w: cardW - 0.5, h: 0,
        line: { color: BURGUNDY, width: 0.5, transparency: 50 },
      });
      // Financial meaning
      s.addText("In fintel", {
        x: x + 0.25, y: 4.95, w: cardW - 0.4, h: 0.3,
        fontSize: 10, fontFace: BODY_FONT, color: BURGUNDY,
        bold: true, italic: true, margin: 0,
      });
      s.addText(c.fin, {
        x: x + 0.25, y: 5.25, w: cardW - 0.4, h: 1.55,
        fontSize: 12, fontFace: BODY_FONT, color: INK, margin: 0,
      });
    });

    footer(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 5 — SYSTEM ARCHITECTURE
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    sectionLabel(s, "III.  ARCHITECTURE");
    slideTitle(s, "Data Flow & Component Composition");

    // Source
    const drawNode = (x, y, w, h, title, sub, fill, textColor) => {
      s.addShape("rect", {
        x, y, w, h,
        fill: { color: fill }, line: { color: NAVY, width: 1 },
      });
      s.addText(title, {
        x: x + 0.1, y: y + 0.1, w: w - 0.2, h: 0.4,
        fontSize: 14, fontFace: HEADER_FONT, color: textColor,
        bold: true, align: "center", valign: "middle", margin: 0,
      });
      if (sub) {
        s.addText(sub, {
          x: x + 0.1, y: y + 0.55, w: w - 0.2, h: 0.4,
          fontSize: 10, fontFace: BODY_FONT, color: textColor,
          align: "center", italic: true, margin: 0,
        });
      }
    };

    const drawArrow = (x1, y1, x2, y2) => {
      s.addShape("line", {
        x: x1, y: y1, w: x2 - x1, h: y2 - y1,
        line: { color: BURGUNDY, width: 1.75, endArrowType: "triangle" },
      });
    };

    // Data source (top)
    drawNode(5.4, 2.15, 2.5, 0.85, "yfinance", "OHLCV DataFrame", NAVY, WHITE);

    // Three modules in middle row
    drawNode(0.8, 3.55, 2.6, 0.9, "SignalDetector", "Module 1 — Spans", WHITE, NAVY);
    drawNode(5.4, 3.55, 2.5, 0.9, "MetricsEngine", "Module 2 — Metrics", WHITE, NAVY);
    drawNode(9.9, 3.55, 2.6, 0.9, "AlertEngine + SLO", "Module 3 — Alerting", WHITE, NAVY);

    // Bottom — Dashboard
    drawNode(4.65, 5.45, 4.0, 0.95, "Dashboard", "Module 4 — Multi-panel observability", BURGUNDY, WHITE);

    // Arrows from data source
    drawArrow(6.65, 3.0, 2.1, 3.55);     // to SignalDetector
    drawArrow(6.65, 3.0, 6.65, 3.55);    // to MetricsEngine
    drawArrow(6.65, 3.0, 11.2, 3.55);    // to AlertEngine area

    // Metrics -> Alerts
    drawArrow(7.9, 4.0, 9.9, 4.0);

    // All three -> Dashboard
    drawArrow(2.1, 4.45, 5.4, 5.45);
    drawArrow(6.65, 4.45, 6.65, 5.45);
    drawArrow(11.2, 4.45, 7.9, 5.45);

    // Caption
    s.addText(
      "Each module is independently testable and composable. The Dashboard depends on the other three; the others depend only on a validated OHLCV input.",
      {
        x: 0.6, y: 6.6, w: 12.1, h: 0.4,
        fontSize: 11, fontFace: BODY_FONT, color: INK,
        italic: true, align: "center", margin: 0,
      }
    );

    footer(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // Helper: module-detail slide
  // ---------------------------------------------------------------------------
  const moduleSlide = (sectionLbl, title, subtitle, leftHeader, leftBullets, rightHeader, rightBullets, iconImg) => {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    sectionLabel(s, sectionLbl);
    slideTitle(s, title);

    s.addText(subtitle, {
      x: 0.6, y: 2.05, w: 12.1, h: 0.4,
      fontSize: 13, fontFace: BODY_FONT, color: BURGUNDY,
      italic: true, margin: 0,
    });

    // Left card
    s.addShape("rect", {
      x: 0.6, y: 2.6, w: 5.95, h: 4.25,
      fill: { color: WHITE }, line: { color: NAVY, width: 0.75 },
    });
    s.addShape("rect", {
      x: 0.6, y: 2.6, w: 0.08, h: 4.25,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });
    s.addImage({ data: iconImg, x: 0.85, y: 2.78, w: 0.4, h: 0.4 });
    s.addText(leftHeader, {
      x: 1.35, y: 2.78, w: 5.0, h: 0.4,
      fontSize: 13, fontFace: HEADER_FONT, color: NAVY,
      bold: true, valign: "middle", margin: 0,
    });
    s.addText(
      leftBullets.map((b, i) => ({
        text: b,
        options: { bullet: { code: "25A0" }, breakLine: i < leftBullets.length - 1 },
      })),
      {
        x: 0.85, y: 3.3, w: 5.5, h: 3.4,
        fontSize: 12, fontFace: BODY_FONT, color: INK,
        paraSpaceAfter: 6, margin: 0,
      }
    );

    // Right card
    s.addShape("rect", {
      x: 6.75, y: 2.6, w: 5.95, h: 4.25,
      fill: { color: WHITE }, line: { color: NAVY, width: 0.75 },
    });
    s.addShape("rect", {
      x: 6.75, y: 2.6, w: 0.08, h: 4.25,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });
    s.addText(rightHeader, {
      x: 7.0, y: 2.78, w: 5.5, h: 0.4,
      fontSize: 13, fontFace: HEADER_FONT, color: NAVY,
      bold: true, valign: "middle", margin: 0,
    });
    s.addText(
      rightBullets.map((b, i) => ({
        text: b,
        options: { bullet: { code: "25A0" }, breakLine: i < rightBullets.length - 1 },
      })),
      {
        x: 7.0, y: 3.3, w: 5.5, h: 3.4,
        fontSize: 12, fontFace: BODY_FONT, color: INK,
        paraSpaceAfter: 6, margin: 0,
      }
    );

    footer(s);
    pageNumber(s, n, TOTAL);
  };

  // ---------------------------------------------------------------------------
  // SLIDE 6 — SIGNAL DETECTOR
  // ---------------------------------------------------------------------------
  moduleSlide(
    "IV.  MODULE I — SIGNALS",
    "SignalDetector: Market Anomalies as Spans",
    "Each detected event is a structured object with timing, severity, and metadata — analogous to an OpenTelemetry Span.",
    "Detection Methods",
    [
      "detect_volatility_spikes() — rolling σ above n-std threshold",
      "detect_volume_surges() — volume above multiplier of rolling mean",
      "detect_price_breakouts() — price exceeding Bollinger Band envelope",
      "detect_gap_events() — opening gaps beyond percentage threshold",
      "get_all_signals() — composite detection, time-sorted output",
    ],
    "Signal Object Schema",
    [
      "ticker — instrument identifier",
      "signal_type — categorical event class",
      "timestamp — pandas DatetimeIndex value",
      "severity — info / warning / critical (OTel convention)",
      "value & threshold — observed magnitude vs. trigger level",
      "metadata — contextual dictionary (window size, multiplier, …)",
    ],
    ic.bolt
  );

  // ---------------------------------------------------------------------------
  // SLIDE 7 — METRICS ENGINE
  // ---------------------------------------------------------------------------
  moduleSlide(
    "IV.  MODULE II — METRICS",
    "MetricsEngine: Indicators as Metric Instruments",
    "Lazy-evaluated, internally cached technical indicators with configurable rolling-window aggregation.",
    "Supported Metrics",
    [
      "Simple Moving Average (SMA) and Exponential Moving Average (EMA)",
      "Bollinger Bands — upper, middle, lower envelopes",
      "Relative Strength Index (RSI) with safe zero-loss handling",
      "Annualised Sharpe Ratio with configurable risk-free rate",
      "Maximum Drawdown with peak/trough date attribution",
      "Rolling annualised volatility, daily returns, summary report",
    ],
    "Engineering Properties",
    [
      "Internal _cache dict prevents redundant recomputation",
      "_check_window() validates window ≤ len(data)",
      "Numeric parameter validation via shared core utilities",
      "Returns native pandas Series — composable with downstream code",
      "Numerical safeguards: NaN handling and division-by-zero guards",
    ],
    ic.gauge
  );

  // ---------------------------------------------------------------------------
  // SLIDE 8 — ALERT ENGINE
  // ---------------------------------------------------------------------------
  moduleSlide(
    "IV.  MODULE III — ALERTS",
    "AlertEngine & SLO: Risk Rules as Reliability Targets",
    "Threshold-based evaluation of MetricsEngine output, modelled on production SRE alerting and Service-Level Objectives.",
    "AlertEngine — Triggered Notifications",
    [
      "add_rule(name, metric, condition, threshold, severity)",
      "Nine registered metric extractors (RSI, Sharpe, drawdown, …)",
      "evaluate(metrics_engine) → list of Alert objects",
      "summary() — human-readable, severity-grouped report",
      "Defensive duplicate-name and unknown-metric guards",
    ],
    "SLO — Service-Level Objectives",
    [
      "Defines a measurable performance target for a portfolio",
      "check() returns met-status, current value, target, and margin",
      "Applies SRE error-budget thinking to risk management",
      "Example: 'Sharpe ≥ 1.0' or 'Drawdown ≤ -15%'",
      "Composable with AlertEngine for layered governance",
    ],
    ic.bell
  );

  // ---------------------------------------------------------------------------
  // SLIDE 9 — DASHBOARD
  // ---------------------------------------------------------------------------
  moduleSlide(
    "IV.  MODULE IV — DASHBOARD",
    "Dashboard: A Single-Pane-of-Glass for Risk",
    "Multi-panel matplotlib composition modelled on Grafana — uniting price, indicators, volume, health, and alerts.",
    "Five Panels in One Figure",
    [
      "Price panel — close-price line with severity-coloured signal markers",
      "Technical panel — SMA, EMA, and Bollinger Band overlay",
      "Volume panel — bars coloured up/down with surge highlights",
      "Health panel — Sharpe, RSI, drawdown, return, volatility readouts",
      "Alert timeline — horizontal bar view of triggered rules",
    ],
    "Cross-Asset Capability",
    [
      "plot_correlation_heatmap() — multi-ticker return correlation matrix",
      "Static method enables ad-hoc portfolio-level analysis",
      "Annotated cells with diverging RdYlGn colormap",
      "Validates each ticker's OHLCV schema before computation",
      "Output is a returned matplotlib Figure for further export",
    ],
    ic.chart
  );

  // ---------------------------------------------------------------------------
  // SLIDE 10 — ERROR HANDLING
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    sectionLabel(s, "V.  ENGINEERING PRACTICES");
    slideTitle(s, "Defensive Design: A Custom Exception Hierarchy");

    // Hierarchy diagram (left)
    s.addText("Exception Hierarchy", {
      x: 0.6, y: 2.15, w: 6.0, h: 0.3,
      fontSize: 12, fontFace: BODY_FONT, color: BURGUNDY,
      bold: true, charSpacing: 3, margin: 0,
    });

    // Root
    s.addShape("rect", {
      x: 0.6, y: 2.55, w: 5.7, h: 0.7,
      fill: { color: NAVY }, line: { color: NAVY, width: 0 },
    });
    s.addText("FintelError  (base)", {
      x: 0.6, y: 2.55, w: 5.7, h: 0.7,
      fontSize: 16, fontFace: HEADER_FONT, color: WHITE,
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Connector lines
    const childY = 3.7;
    [1.0, 2.95, 4.85].forEach((cx) => {
      s.addShape("line", {
        x: 3.45, y: 3.25, w: cx + 0.6 - 3.45, h: childY - 3.25,
        line: { color: BURGUNDY, width: 1 },
      });
    });

    // Children
    const children = [
      ["DataValidationError", 0.6],
      ["InsufficientDataError", 2.55],
      ["InvalidParameterError", 4.45],
    ];
    children.forEach(([nm, x]) => {
      s.addShape("rect", {
        x: x, y: childY, w: 1.85, h: 0.65,
        fill: { color: WHITE }, line: { color: BURGUNDY, width: 0.75 },
      });
      s.addText(nm, {
        x: x, y: childY, w: 1.85, h: 0.65,
        fontSize: 9, fontFace: BODY_FONT, color: NAVY,
        bold: true, align: "center", valign: "middle", margin: 0,
      });
    });

    // Notes under the tree
    s.addText(
      [
        { text: "DataValidationError", options: { bold: true } },
        { text: " — schema, type, or shape violations on the input DataFrame.", options: { breakLine: true } },
        { text: "InsufficientDataError", options: { bold: true } },
        { text: " — request exceeds available history (e.g. window > len).", options: { breakLine: true } },
        { text: "InvalidParameterError", options: { bold: true } },
        { text: " — out-of-range or wrong-type function arguments.", options: {} },
      ],
      {
        x: 0.6, y: 4.35, w: 5.7, h: 2.4,
        fontSize: 12, fontFace: BODY_FONT, color: INK,
        paraSpaceAfter: 6, margin: 0,
      }
    );

    // Right column — Why it matters
    s.addText("Why a Hierarchy?", {
      x: 6.95, y: 2.15, w: 5.8, h: 0.3,
      fontSize: 12, fontFace: BODY_FONT, color: BURGUNDY,
      bold: true, charSpacing: 3, margin: 0,
    });

    s.addText(
      [
        { text: "1.  Granular catching.  ", options: { bold: true } },
        { text: "Callers can handle a missing column differently than an out-of-range parameter.", options: { breakLine: true } },
        { text: "", options: { breakLine: true } },
        { text: "2.  Contract clarity.  ", options: { bold: true } },
        { text: "Each public method's docstring names the exact exception it raises.", options: { breakLine: true } },
        { text: "", options: { breakLine: true } },
        { text: "3.  Inheritance benefits.  ", options: { bold: true } },
        { text: "except FintelError catches the entire family — convenient for top-level orchestration code.", options: { breakLine: true } },
        { text: "", options: { breakLine: true } },
        { text: "4.  Tested.  ", options: { bold: true } },
        { text: "Every error path is exercised in the validation suite — zero silent failures.", options: {} },
      ],
      {
        x: 6.95, y: 2.55, w: 5.8, h: 4.3,
        fontSize: 12, fontFace: BODY_FONT, color: INK,
        paraSpaceAfter: 6, margin: 0,
      }
    );

    footer(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 11 — TESTING
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    sectionLabel(s, "V.  ENGINEERING PRACTICES");
    slideTitle(s, "Validation Strategy & Test Coverage");

    // Stat callouts row
    const stats = [
      { num: "9", lbl: "Test Suites" },
      { num: "30+", lbl: "Assertions" },
      { num: "100%", lbl: "Error Paths" },
      { num: "4 / 4", lbl: "Modules Covered" },
    ];

    const cardW = 2.85;
    const startX = 0.6;
    const gap = 0.25;
    stats.forEach((st, i) => {
      const x = startX + i * (cardW + gap);
      s.addShape("rect", {
        x: x, y: 2.2, w: cardW, h: 1.45,
        fill: { color: NAVY }, line: { color: NAVY, width: 0 },
      });
      s.addText(st.num, {
        x: x, y: 2.25, w: cardW, h: 0.9,
        fontSize: 44, fontFace: HEADER_FONT, color: WHITE,
        bold: true, align: "center", valign: "middle", margin: 0,
      });
      s.addText(st.lbl, {
        x: x, y: 3.15, w: cardW, h: 0.4,
        fontSize: 12, fontFace: BODY_FONT, color: WHITE,
        bold: true, charSpacing: 3, align: "center", valign: "middle", margin: 0,
      });
    });

    // Categories block
    s.addText("Two-Tier Testing Approach", {
      x: 0.6, y: 3.9, w: 12.1, h: 0.3,
      fontSize: 12, fontFace: BODY_FONT, color: BURGUNDY,
      bold: true, charSpacing: 3, margin: 0,
    });

    // Two-column
    s.addShape("rect", {
      x: 0.6, y: 4.3, w: 5.95, h: 2.55,
      fill: { color: WHITE }, line: { color: NAVY, width: 0.75 },
    });
    s.addShape("rect", {
      x: 0.6, y: 4.3, w: 0.08, h: 2.55,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });
    s.addText("Happy-Path Verification", {
      x: 0.85, y: 4.45, w: 5.5, h: 0.4,
      fontSize: 13, fontFace: HEADER_FONT, color: NAVY,
      bold: true, margin: 0,
    });
    s.addText(
      [
        { text: "Synthetic, seed-controlled OHLCV data with known patterns", options: { bullet: { code: "25A0" }, breakLine: true } },
        { text: "Injected anomalies (volatility, volume, gap) for deterministic detection", options: { bullet: { code: "25A0" }, breakLine: true } },
        { text: "Signal counts, metric values, and SLO outcomes asserted explicitly", options: { bullet: { code: "25A0" } } },
      ],
      {
        x: 0.85, y: 4.9, w: 5.55, h: 1.85,
        fontSize: 11, fontFace: BODY_FONT, color: INK,
        paraSpaceAfter: 4, margin: 0,
      }
    );

    s.addShape("rect", {
      x: 6.75, y: 4.3, w: 5.95, h: 2.55,
      fill: { color: WHITE }, line: { color: NAVY, width: 0.75 },
    });
    s.addShape("rect", {
      x: 6.75, y: 4.3, w: 0.08, h: 2.55,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });
    s.addText("Failure-Mode Verification", {
      x: 7.0, y: 4.45, w: 5.5, h: 0.4,
      fontSize: 13, fontFace: HEADER_FONT, color: NAVY,
      bold: true, margin: 0,
    });
    s.addText(
      [
        { text: "Wrong types (string DataFrame, non-numeric columns)", options: { bullet: { code: "25A0" }, breakLine: true } },
        { text: "Empty / missing columns / insufficient observations", options: { bullet: { code: "25A0" }, breakLine: true } },
        { text: "Negative or non-integer windows, invalid severity / condition", options: { bullet: { code: "25A0" }, breakLine: true } },
        { text: "Duplicate alert names, unknown metric, evaluate() with wrong type", options: { bullet: { code: "25A0" } } },
      ],
      {
        x: 7.0, y: 4.9, w: 5.55, h: 1.85,
        fontSize: 11, fontFace: BODY_FONT, color: INK,
        paraSpaceAfter: 4, margin: 0,
      }
    );

    footer(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 12 — EMPIRICAL DEMONSTRATION
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    sectionLabel(s, "VI.  EMPIRICAL DEMONSTRATION");
    slideTitle(s, "Live Pipeline on AAPL — One Year of Trading Data");

    s.addText(
      "End-to-end execution against twelve months of yfinance OHLCV data. The same code path that powers tests is run unmodified on production-shape input.",
      {
        x: 0.6, y: 2.05, w: 12.1, h: 0.5,
        fontSize: 13, fontFace: BODY_FONT, color: BURGUNDY,
        italic: true, margin: 0,
      }
    );

    // Process timeline — five steps
    const steps = [
      { t: "1", h: "Ingest",      d: "yfinance.download() — 1 yr OHLCV" },
      { t: "2", h: "Detect",      d: "SignalDetector.get_all_signals()" },
      { t: "3", h: "Measure",     d: "MetricsEngine.compute_summary()" },
      { t: "4", h: "Govern",      d: "AlertEngine.evaluate() + SLO.check()" },
      { t: "5", h: "Visualise",   d: "Dashboard.render()" },
    ];

    const stepW = 2.35;
    const startX = 0.6;
    const stepGap = 0.18;
    steps.forEach((st, i) => {
      const x = startX + i * (stepW + stepGap);
      // Number circle in burgundy
      s.addShape("oval", {
        x: x + 0.85, y: 2.75, w: 0.65, h: 0.65,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
      });
      s.addText(st.t, {
        x: x + 0.85, y: 2.75, w: 0.65, h: 0.65,
        fontSize: 22, fontFace: HEADER_FONT, color: WHITE,
        bold: true, align: "center", valign: "middle", margin: 0,
      });
      // Heading
      s.addText(st.h, {
        x: x, y: 3.5, w: stepW, h: 0.4,
        fontSize: 14, fontFace: HEADER_FONT, color: NAVY,
        bold: true, align: "center", margin: 0,
      });
      // Description
      s.addText(st.d, {
        x: x, y: 3.9, w: stepW, h: 0.7,
        fontSize: 10, fontFace: BODY_FONT, color: INK,
        align: "center", italic: true, margin: 0,
      });
    });

    // Arrows between steps
    for (let i = 0; i < steps.length - 1; i++) {
      const x1 = startX + (i + 1) * stepW + i * stepGap;
      const x2 = x1 + stepGap;
      s.addShape("line", {
        x: x1, y: 3.07, w: x2 - x1, h: 0,
        line: { color: BURGUNDY, width: 1.5, endArrowType: "triangle" },
      });
    }

    // Outcome row — summary stats
    s.addText("Representative Outcomes (illustrative, regenerated each run)", {
      x: 0.6, y: 4.85, w: 12.1, h: 0.3,
      fontSize: 12, fontFace: BODY_FONT, color: BURGUNDY,
      bold: true, charSpacing: 3, margin: 0,
    });

    const outcomes = [
      { num: "30+", lbl: "Signals Detected", sub: "across four detectors" },
      { num: "5", lbl: "Alert Rules Evaluated", sub: "RSI, σ, drawdown, …" },
      { num: "3", lbl: "SLOs Checked", sub: "Sharpe, DD, RSI floor" },
      { num: "5", lbl: "Dashboard Panels", sub: "single-figure render" },
    ];
    outcomes.forEach((o, i) => {
      const x = 0.6 + i * 3.1;
      s.addShape("rect", {
        x: x, y: 5.25, w: 2.95, h: 1.6,
        fill: { color: WHITE }, line: { color: NAVY, width: 0.75 },
      });
      s.addShape("rect", {
        x: x, y: 5.25, w: 2.95, h: 0.08,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
      });
      s.addText(o.num, {
        x: x, y: 5.4, w: 2.95, h: 0.65,
        fontSize: 32, fontFace: HEADER_FONT, color: NAVY,
        bold: true, align: "center", valign: "middle", margin: 0,
      });
      s.addText(o.lbl, {
        x: x, y: 6.05, w: 2.95, h: 0.35,
        fontSize: 12, fontFace: BODY_FONT, color: BURGUNDY,
        bold: true, align: "center", margin: 0,
      });
      s.addText(o.sub, {
        x: x, y: 6.4, w: 2.95, h: 0.3,
        fontSize: 9, fontFace: BODY_FONT, color: INK,
        italic: true, align: "center", margin: 0,
      });
    });

    footer(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 13 — DASHBOARD COMPOSITION (visual layout)
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    sectionLabel(s, "VI.  EMPIRICAL DEMONSTRATION");
    slideTitle(s, "Dashboard Composition — Five Coordinated Panels");

    // Mini wireframe of dashboard on the left
    s.addShape("rect", {
      x: 0.6, y: 2.15, w: 6.6, h: 4.7,
      fill: { color: NAVY_DEEP }, line: { color: NAVY, width: 1 },
    });

    // Panel boxes inside
    const panels = [
      { x: 0.8, y: 2.35, w: 3.1, h: 1.45, label: "PRICE + SIGNAL ANNOTATIONS" },
      { x: 3.95, y: 2.35, w: 3.1, h: 1.45, label: "TECHNICAL INDICATORS" },
      { x: 0.8, y: 3.9, w: 3.1, h: 1.45, label: "VOLUME (UP / DOWN / SURGE)" },
      { x: 3.95, y: 3.9, w: 3.1, h: 1.45, label: "HEALTH STATUS" },
      { x: 0.8, y: 5.45, w: 6.25, h: 1.2, label: "ALERT TIMELINE" },
    ];
    panels.forEach((p) => {
      s.addShape("rect", {
        x: p.x, y: p.y, w: p.w, h: p.h,
        fill: { color: NAVY }, line: { color: BURGUNDY, width: 0.75 },
      });
      s.addText(p.label, {
        x: p.x, y: p.y, w: p.w, h: p.h,
        fontSize: 9, fontFace: BODY_FONT, color: WHITE,
        bold: true, charSpacing: 3, align: "center", valign: "middle", margin: 0,
      });
    });

    // Right-side legend
    s.addText("Panel Reading Order", {
      x: 7.5, y: 2.15, w: 5.2, h: 0.4,
      fontSize: 12, fontFace: BODY_FONT, color: BURGUNDY,
      bold: true, charSpacing: 3, margin: 0,
    });

    s.addText(
      [
        { text: "①  Price.  ", options: { bold: true } },
        { text: "Closing line with severity-coloured anomaly markers.", options: { breakLine: true } },
        { text: "", options: { breakLine: true } },
        { text: "②  Indicators.  ", options: { bold: true } },
        { text: "SMA, EMA, and Bollinger envelope on a single axis.", options: { breakLine: true } },
        { text: "", options: { breakLine: true } },
        { text: "③  Volume.  ", options: { bold: true } },
        { text: "Up/down colouring with volume-surge highlights.", options: { breakLine: true } },
        { text: "", options: { breakLine: true } },
        { text: "④  Health.  ", options: { bold: true } },
        { text: "Sharpe, RSI band, drawdown, return — colour-coded.", options: { breakLine: true } },
        { text: "", options: { breakLine: true } },
        { text: "⑤  Alert Timeline.  ", options: { bold: true } },
        { text: "Triggered rules sorted by severity for triage.", options: {} },
      ],
      {
        x: 7.5, y: 2.6, w: 5.2, h: 4.2,
        fontSize: 12, fontFace: BODY_FONT, color: INK,
        paraSpaceAfter: 4, margin: 0,
      }
    );

    footer(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 14 — DESIGN DECISIONS
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    sectionLabel(s, "VII.  DESIGN DECISIONS");
    slideTitle(s, "Trade-offs and Engineering Rationale");

    const decisions = [
      {
        h: "Object-oriented over functional",
        b: "Each module owns mutable state — cached metrics, accumulated signals, registered rules — making OOP the more honest abstraction.",
      },
      {
        h: "Lazy evaluation with caching",
        b: "Indicators are computed on first request and stored. SMA used by Bollinger Bands and the dashboard is therefore calculated once.",
      },
      {
        h: "Fail-loud, not fail-quiet",
        b: "Every public method validates inputs up front and raises a typed FintelError subclass — silent NaNs would compromise downstream alerting.",
      },
      {
        h: "Composability over a god-object",
        b: "Dashboard accepts an external MetricsEngine and pre-computed signals/alerts rather than reconstructing them — testable in isolation.",
      },
      {
        h: "OTel mapping made explicit",
        b: "Severity strings (info / warning / critical) and the SLO terminology are imported deliberately to make the analogy reviewable, not implicit.",
      },
    ];

    let y = 2.15;
    decisions.forEach((d) => {
      // Burgundy bullet square
      s.addShape("rect", {
        x: 0.6, y: y + 0.08, w: 0.18, h: 0.18,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
      });
      s.addText(d.h, {
        x: 0.95, y: y, w: 11.7, h: 0.4,
        fontSize: 14, fontFace: HEADER_FONT, color: NAVY,
        bold: true, margin: 0,
      });
      s.addText(d.b, {
        x: 0.95, y: y + 0.42, w: 11.7, h: 0.55,
        fontSize: 12, fontFace: BODY_FONT, color: INK, margin: 0,
      });
      y += 1.0;
    });

    footer(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 15 — LIMITATIONS & FUTURE WORK
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    sectionLabel(s, "VII.  LIMITATIONS & FUTURE WORK");
    slideTitle(s, "What We Did Not Solve — Yet");

    // Two columns
    s.addShape("rect", {
      x: 0.6, y: 2.15, w: 5.95, h: 4.7,
      fill: { color: WHITE }, line: { color: NAVY, width: 0.75 },
    });
    s.addShape("rect", {
      x: 0.6, y: 2.15, w: 0.08, h: 4.7,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });
    s.addText("Acknowledged Limitations", {
      x: 0.85, y: 2.35, w: 5.5, h: 0.4,
      fontSize: 16, fontFace: HEADER_FONT, color: NAVY,
      bold: true, margin: 0,
    });
    s.addText(
      [
        { text: "Backward-looking signal detection — no forecasting layer is included by design.", options: { bullet: { code: "25A0" }, breakLine: true } },
        { text: "Single-frequency analysis — daily bars only; intraday tick data would require streaming refactor.", options: { bullet: { code: "25A0" }, breakLine: true } },
        { text: "Static thresholds — alert rules are user-set rather than statistically learned.", options: { bullet: { code: "25A0" }, breakLine: true } },
        { text: "yfinance dependency — survivorship bias and free-tier rate limits are inherited.", options: { bullet: { code: "25A0" }, breakLine: true } },
        { text: "No persistence layer — signals/alerts live for the lifetime of a process.", options: { bullet: { code: "25A0" } } },
      ],
      {
        x: 0.85, y: 2.85, w: 5.55, h: 3.85,
        fontSize: 12, fontFace: BODY_FONT, color: INK,
        paraSpaceAfter: 6, margin: 0,
      }
    );

    s.addShape("rect", {
      x: 6.75, y: 2.15, w: 5.95, h: 4.7,
      fill: { color: WHITE }, line: { color: NAVY, width: 0.75 },
    });
    s.addShape("rect", {
      x: 6.75, y: 2.15, w: 0.08, h: 4.7,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });
    s.addText("Roadmap for Future Iterations", {
      x: 7.0, y: 2.35, w: 5.5, h: 0.4,
      fontSize: 16, fontFace: HEADER_FONT, color: NAVY,
      bold: true, margin: 0,
    });
    s.addText(
      [
        { text: "Adaptive thresholds — replace fixed σ multipliers with rolling-window quantile estimators.", options: { bullet: { code: "25A0" }, breakLine: true } },
        { text: "Streaming mode — push-based signal emission via Python asyncio for live tick feeds.", options: { bullet: { code: "25A0" }, breakLine: true } },
        { text: "Persistence — write signals and alerts to a SQLite store for historical replay.", options: { bullet: { code: "25A0" }, breakLine: true } },
        { text: "Native OTel exporter — emit fintel signals as actual OpenTelemetry spans for SRE tooling.", options: { bullet: { code: "25A0" }, breakLine: true } },
        { text: "Portfolio-level SLOs — multi-asset reliability targets with weighting.", options: { bullet: { code: "25A0" } } },
      ],
      {
        x: 7.0, y: 2.85, w: 5.55, h: 3.85,
        fontSize: 12, fontFace: BODY_FONT, color: INK,
        paraSpaceAfter: 6, margin: 0,
      }
    );

    footer(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 16 — CONCLUSION & Q&A
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: NAVY_DEEP };

    // Left burgundy bar
    s.addShape("rect", {
      x: 0, y: 0, w: 0.45, h: 7.5,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });

    s.addText("CONCLUSION", {
      x: 1.0, y: 0.9, w: 11, h: 0.5,
      fontSize: 13, fontFace: BODY_FONT, color: WHITE,
      bold: true, charSpacing: 8, margin: 0,
    });

    s.addText("Markets are systems. Treat them that way.", {
      x: 1.0, y: 1.5, w: 11.5, h: 1.7,
      fontSize: 38, fontFace: HEADER_FONT, color: WHITE,
      bold: true, italic: true, margin: 0, valign: "top",
    });

    s.addShape("rect", {
      x: 1.0, y: 3.3, w: 1.0, h: 0.05,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });

    s.addText(
      [
        { text: "fintel", options: { bold: true, italic: true } },
        { text: " demonstrates that the engineering vocabulary of modern observability — spans, metrics, alerts, dashboards, SLOs — is not metaphor but ", options: {} },
        { text: "directly applicable", options: { bold: true } },
        { text: " infrastructure for quantitative finance.", options: {} },
      ],
      {
        x: 1.0, y: 3.5, w: 11.3, h: 1.5,
        fontSize: 16, fontFace: BODY_FONT, color: WHITE, margin: 0,
      }
    );

    // Stat strip
    const closing = [
      { num: "4", lbl: "MODULES" },
      { num: "9", lbl: "TEST SUITES" },
      { num: "5", lbl: "ALLOWED LIBRARIES" },
      { num: "0", lbl: "EXTERNAL DEPENDENCIES BEYOND SCOPE" },
    ];
    closing.forEach((c, i) => {
      const x = 1.0 + i * 3.0;
      // Top burgundy line
      s.addShape("rect", {
        x: x, y: 5.3, w: 2.7, h: 0.04,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
      });
      s.addText(c.num, {
        x: x, y: 5.4, w: 2.7, h: 0.7,
        fontSize: 36, fontFace: HEADER_FONT, color: WHITE,
        bold: true, margin: 0,
      });
      s.addText(c.lbl, {
        x: x, y: 6.1, w: 2.7, h: 0.4,
        fontSize: 9, fontFace: BODY_FONT, color: WHITE,
        bold: true, charSpacing: 4, margin: 0,
      });
    });

    // Q&A line
    s.addText("Thank you.  |  Questions are welcome.", {
      x: 1.0, y: 6.7, w: 11.3, h: 0.4,
      fontSize: 14, fontFace: HEADER_FONT, color: WHITE,
      italic: true, margin: 0,
    });

    s.addText("16 / 16", {
      x: 11.5, y: 6.7, w: 1.3, h: 0.4,
      fontSize: 10, fontFace: BODY_FONT, color: WHITE,
      align: "right", margin: 0,
    });
  }

  await pres.writeFile({ fileName: "/Users/maru/Documents/fintel/presentation/fintel_FE520_presentation.pptx" });
  console.log("Built: /Users/maru/Documents/fintel/presentation/fintel_FE520_presentation.pptx");
}

build().catch((e) => { console.error(e); process.exit(1); });
