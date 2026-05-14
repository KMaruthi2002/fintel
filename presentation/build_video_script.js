// Read-aloud video script for the fintel presentation recording.
// Verbatim prose. 5 / 4 / 3 / 4 split across Maruthi, Sid, Yashashri, Prakhar.
// Target: ~14 minutes spoken at a relaxed cadence (~140 wpm).
// Palette: Burgundy / Navy / White / Black.

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak,
  TabStopType, TabStopPosition,
} = require("docx");

// -----------------------------------------------------------------------------
// PALETTE
// -----------------------------------------------------------------------------
const BURGUNDY = "7B1E2D";
const NAVY = "0B2545";
const WHITE = "FFFFFF";
const BLACK = "111111";
const LIGHT_BURGUNDY = "F5E8EA";

const PAGE_W = 12240;
const MARGIN = 1440;
const CONTENT_W = PAGE_W - 2 * MARGIN;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
const r = (opts) => new TextRun({
  font: opts.font || "Calibri",
  size: opts.size || 24,
  color: opts.color || BLACK,
  bold: !!opts.bold,
  italic: !!opts.italic,
  text: opts.text,
});

const cell = (children, opts = {}) => {
  const co = {
    width: { size: opts.width || 1000, type: WidthType.DXA },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
    },
    verticalAlign: opts.valign || VerticalAlign.TOP,
    children: Array.isArray(children) ? children : [children],
  };
  if (opts.fill) co.shading = { fill: opts.fill, type: ShadingType.CLEAR };
  return new TableCell(co);
};

const textCell = (str, opts = {}) => cell(new Paragraph({
  alignment: opts.align || AlignmentType.LEFT,
  spacing: { before: 0, after: 0 },
  children: [r({ text: str, size: opts.size || 22, bold: opts.bold, italic: opts.italic, color: opts.color || BLACK, font: opts.font || "Calibri" })],
}), opts);

const h1 = (str) => new Paragraph({
  spacing: { before: 360, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BURGUNDY, space: 6 } },
  children: [r({ text: str, font: "Georgia", size: 36, color: NAVY, bold: true })],
});

const para = (str) => new Paragraph({
  spacing: { before: 0, after: 160, line: 320 },
  alignment: AlignmentType.JUSTIFIED,
  children: [r({ text: str, size: 22 })],
});

// Speaker block banner
const partBanner = (label) => new Paragraph({
  spacing: { before: 320, after: 80 },
  shading: { type: ShadingType.CLEAR, fill: BURGUNDY },
  border: {
    top: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
    left: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
    right: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
  },
  children: [r({ text: "  " + label, color: WHITE, bold: true, size: 24, font: "Georgia" })],
});

// Slide entry — header + verbatim script block
const slideBlock = ({ num, title, speaker, words, secs, script }) => {
  const out = [];

  // Slide-header strip
  out.push(new Paragraph({
    spacing: { before: 280, after: 0 },
    shading: { type: ShadingType.CLEAR, fill: NAVY },
    border: {
      top: { style: BorderStyle.SINGLE, size: 6, color: NAVY },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY },
      left: { style: BorderStyle.SINGLE, size: 6, color: NAVY },
      right: { style: BorderStyle.SINGLE, size: 6, color: NAVY },
    },
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [
      r({ text: "  ", size: 22 }),
      r({ text: `SLIDE ${String(num).padStart(2, "0")}`, color: BURGUNDY, bold: true, size: 22, font: "Georgia" }),
      r({ text: "   ", size: 22 }),
      r({ text: title, color: WHITE, bold: true, size: 22, font: "Georgia" }),
      new TextRun({ text: "\t" }),
      r({ text: `${speaker} · ${words} words · ~${secs}s  `, color: WHITE, italic: true, size: 20 }),
    ],
  }));

  // Verbatim prose — generously spaced for easy reading on camera
  out.push(new Paragraph({
    spacing: { before: 200, after: 240, line: 380 },
    alignment: AlignmentType.LEFT,
    children: [r({ text: script, size: 26, font: "Calibri" })],
  }));

  return out;
};

// -----------------------------------------------------------------------------
// BODY
// -----------------------------------------------------------------------------
const children = [];

// --- Cover -------------------------------------------------------------------
children.push(
  new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [r({ text: "FE 520  ·  STEVENS INSTITUTE OF TECHNOLOGY", bold: true, color: BURGUNDY, size: 18 })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [r({ text: "Video Recording Script", font: "Georgia", size: 48, color: NAVY, bold: true })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 200 },
    children: [r({ text: "fintel: Financial Telemetry & Observability", italic: true, font: "Georgia", size: 28, color: BLACK })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: BURGUNDY, space: 6 } },
    children: [r({ text: "", size: 2 })],
  }),
);

// --- Speaker assignments -----------------------------------------------------
children.push(new Paragraph({
  spacing: { before: 0, after: 120 },
  children: [r({ text: "Speaker Assignments", font: "Georgia", size: 28, color: NAVY, bold: true })],
}));

const rosterRow = (name, slides, words, time, topics) => new TableRow({ children: [
  textCell(name,   { width: 1800, bold: true, color: NAVY, fill: LIGHT_BURGUNDY }),
  textCell(slides, { width: 1700, align: AlignmentType.CENTER }),
  textCell(words,  { width: 1500, align: AlignmentType.CENTER }),
  textCell(time,   { width: 1500, align: AlignmentType.CENTER }),
  textCell(topics, { width: CONTENT_W - 1800 - 1700 - 1500 - 1500 }),
]});

children.push(new Table({
  width: { size: CONTENT_W, type: WidthType.DXA },
  columnWidths: [1800, 1700, 1500, 1500, CONTENT_W - 1800 - 1700 - 1500 - 1500],
  rows: [
    new TableRow({ tableHeader: true, children: [
      textCell("Speaker", { width: 1800, bold: true, color: WHITE, fill: NAVY }),
      textCell("Slides",  { width: 1700, bold: true, color: WHITE, fill: NAVY, align: AlignmentType.CENTER }),
      textCell("Words",   { width: 1500, bold: true, color: WHITE, fill: NAVY, align: AlignmentType.CENTER }),
      textCell("Run time",{ width: 1500, bold: true, color: WHITE, fill: NAVY, align: AlignmentType.CENTER }),
      textCell("Coverage",{ width: CONTENT_W - 1800 - 1700 - 1500 - 1500, bold: true, color: WHITE, fill: NAVY }),
    ]}),
    rosterRow("Maruthi",   "1, 2, 3, 4, 5",      "~495", "~3:40", "Opening, problem framing, theoretical foundation, architecture."),
    rosterRow("Sid",       "6, 7, 8, 9",         "~520", "~3:50", "The four modules of the package, in order."),
    rosterRow("Yashashri", "10, 11, 12",         "~400", "~3:00", "Error handling, testing, live empirical demonstration."),
    rosterRow("Prakhar",   "13, 14, 15, 16",     "~500", "~3:40", "Dashboard composition, design decisions, limitations, conclusion."),
  ],
}));

children.push(new Paragraph({
  spacing: { before: 200, after: 80 },
  children: [r({ text: "Total estimated run time: ~14:10  ·  Total word count: ~1,915  ·  Target cadence: ~140 words per minute", italic: true, size: 22 })],
}));

// --- Recording instructions --------------------------------------------------
children.push(new Paragraph({
  spacing: { before: 240, after: 80 },
  children: [r({ text: "Recording Instructions", font: "Georgia", size: 26, color: NAVY, bold: true })],
}));
children.push(para(
  "Read your section verbatim. The prose has been written to sound natural when spoken aloud, with full sentences, contractions where appropriate, and no awkward phrasing. Record at a relaxed cadence around 140 words per minute. If you finish your section noticeably faster than the listed run time, slow down. If you're consistently over, trim where you can but do not skip sentences entirely, since each one is load-bearing."
));
children.push(para(
  "Each speaker records their own segment. If you are joining your part to someone else's footage, the opening sentence of each speaker block already includes a thank-you to the previous person and an introduction of who you are. That makes the cuts feel natural rather than abrupt. Keep your slide visible on screen behind you while you speak, and glance at it occasionally so the viewer sees you engaging with the visual rather than reading a teleprompter."
));
children.push(para(
  "If you stumble on a word, pause, breathe, and re-do the sentence. Cleaner cuts beat continuous takes for a recording like this. The script is also written without em dashes or stiff academic phrasing so that it reads naturally on the first try."
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// --- Header for the script section ------------------------------------------
children.push(h1("Verbatim Script"));

// =============================================================================
// MARUTHI — SLIDES 1, 2, 3, 4, 5
// =============================================================================
children.push(partBanner("PART I  ·  MARUTHI  ·  Slides 1 to 5  ·  ~3:40"));

slideBlock({
  num: 1, title: "Title", speaker: "Maruthi", words: 28, secs: 14,
  script: "Hi everyone. I'm Maruthi. Today my team and I are going to walk you through fintel, our final project for FE 520. With me are Sid, Yashashri, and Prakhar.",
}).forEach((c) => children.push(c));

slideBlock({
  num: 2, title: "Agenda", speaker: "Maruthi", words: 84, secs: 38,
  script: "Here is how we will structure the next fifteen minutes. We start with the problem we set out to solve and the theoretical foundation behind our approach. Then we cover the system architecture and walk through each of the four modules in turn. Yashashri will take you through the engineering practices that hold the package together and through a live demonstration on real market data. Prakhar will close out with our design decisions, limitations, and what we want to build next.",
}).forEach((c) => children.push(c));

slideBlock({
  num: 3, title: "Problem Statement", speaker: "Maruthi", words: 145, secs: 62,
  script: "So why does this project exist. There is a question we kept coming back to while planning it. Why do quantitative analysts and Site Reliability Engineers solve the same fundamental problem in completely different ways. Traditional financial tools treat market data as flat numerical streams. They tell you what happened, but not in a structured, alertable way. Now look at the other side. Modern software engineering, through the OpenTelemetry standard, has already solved this. It gives engineers a vocabulary for detecting, aggregating, and alerting on anomalies in distributed systems. The thesis of fintel is straightforward. Financial markets are themselves distributed systems of capital flow. Every observability primitive, whether it is traces, metrics, alerts, or dashboards, has a direct and useful analogue in quantitative finance. fintel turns that parallel into actual working tooling.",
}).forEach((c) => children.push(c));

slideBlock({
  num: 4, title: "Three Pillars of Observability, Mapped to Finance", speaker: "Maruthi", words: 140, secs: 60,
  script: "OpenTelemetry organises observability into three pillars, and we mapped each one to a financial counterpart. The first pillar is traces and spans. A span is a discrete event with a timestamp, a duration, a severity, and contextual metadata. In fintel, a span is a detected market anomaly. A volatility spike, a volume surge, a price breakout, or a gap. The second pillar is metrics. These are numerical measurements aggregated over configurable time windows. In fintel, those become technical indicators like SMA, EMA, RSI, Sharpe ratio, and maximum drawdown. The third pillar is alerting and service-level objectives. Threshold-based rules that fire when reliability targets are breached. In fintel, those become portfolio risk rules and SLOs evaluated against the live metrics layer.",
}).forEach((c) => children.push(c));

slideBlock({
  num: 5, title: "Architecture and Data Flow", speaker: "Maruthi", words: 118, secs: 50,
  script: "Here is the whole package on a single slide. Everything starts from a yfinance download. One DataFrame goes in, and four modules consume it. Three of them sit in the middle layer and operate independently of each other. SignalDetector finds events. MetricsEngine computes numbers. AlertEngine evaluates rules against the metrics. Below them, the Dashboard module composes all those outputs into a unified visualisation. The important property of this layout is composability. Anyone can use just the MetricsEngine on its own. Nothing reaches inside another module. That keeps each piece independently testable and individually useful. Sid will take you through the four modules, starting with SignalDetector.",
}).forEach((c) => children.push(c));

// =============================================================================
// SID — SLIDES 6, 7, 8, 9
// =============================================================================
children.push(partBanner("PART II  ·  SID  ·  Slides 6 to 9  ·  ~3:50"));

slideBlock({
  num: 6, title: "Module I: SignalDetector", speaker: "Sid", words: 138, secs: 60,
  script: "Thanks Maruthi. I'm Sid, and I'll walk you through the four modules in the package. We start with SignalDetector. SignalDetector is the spans layer. It scans the OHLCV data and emits structured objects for anything statistically unusual. There are four detection methods. detect_volatility_spikes flags rolling sigma above a configurable threshold. detect_volume_surges flags volume above a multiplier of the rolling mean. detect_price_breakouts catches the close exceeding the Bollinger Band envelope. And detect_gap_events flags opening gaps beyond a percentage threshold. A composite call, get_all_signals, runs them all and returns a time-sorted list. Each detection is materialised as a Signal object carrying ticker, timestamp, severity, the observed value, the threshold, and a metadata dictionary. Severities follow the OTel convention: info, warning, and critical.",
}).forEach((c) => children.push(c));

slideBlock({
  num: 7, title: "Module II: MetricsEngine", speaker: "Sid", words: 132, secs: 56,
  script: "Next is MetricsEngine, which is the technical-indicator suite. Same OHLCV input, but instead of events it returns numbers. The supported metrics cover the classic toolkit. Simple Moving Average, Exponential Moving Average, Bollinger Bands, RSI, annualised Sharpe ratio, maximum drawdown, rolling volatility, and a one-shot summary report. Two engineering choices are worth noting. First, results are cached in a private dictionary keyed by metric and window. That means an SMA used by both Bollinger Bands and the dashboard is calculated only once. Second, every method validates its inputs and includes numerical safeguards. The RSI calculation, for instance, can divide by zero on a stretch of consecutive up-days, so we substitute a sentinel value rather than letting a NaN propagate downstream.",
}).forEach((c) => children.push(c));

slideBlock({
  num: 8, title: "Module III: AlertEngine and SLO", speaker: "Sid", words: 145, secs: 62,
  script: "If MetricsEngine produces numbers, AlertEngine and SLO decide whether those numbers are acceptable. AlertEngine works exactly like a production alerting system. You register rules. Each rule has a name, a target metric, a condition above or below a threshold, and a severity. So you might say RSI below thirty is critical, or drawdown below minus fifteen percent is critical. The engine also rejects duplicate rule names, unknown metric names, and bad evaluate calls, which keeps the API safe to use. The SLO class is borrowed from SRE practice. It expresses a longer-horizon performance target the portfolio is supposed to meet. The check method tells you whether you are meeting the target and how much margin you have left. Two classes instead of one, because alerts are immediate breaches and SLOs are reliability targets.",
}).forEach((c) => children.push(c));

slideBlock({
  num: 9, title: "Module IV: Dashboard", speaker: "Sid", words: 130, secs: 56,
  script: "The fourth module is Dashboard. This is the visualisation layer. Five matplotlib panels, one figure, modelled on what a Grafana board looks like. The five panels are price with signal annotations, the technical-indicator overlay, the volume bar chart, a health-status readout, and the alert timeline. Importantly, the Dashboard does not recompute anything. It accepts a MetricsEngine and a list of signals as constructor arguments. That keeps the visualisation layer thin and exclusively concerned with rendering. There is also a static method on Dashboard, plot_correlation_heatmap, which compares returns across multiple tickers in a single annotated heatmap. That is how we handle portfolio-level analysis across assets. Yashashri will take you through the engineering practices that keep all of this safe to use.",
}).forEach((c) => children.push(c));

// =============================================================================
// YASHASHRI — SLIDES 10, 11, 12
// =============================================================================
children.push(partBanner("PART III  ·  YASHASHRI  ·  Slides 10 to 12  ·  ~3:00"));

slideBlock({
  num: 10, title: "Defensive Design and Exception Hierarchy", speaker: "Yashashri", words: 138, secs: 60,
  script: "Thanks Sid. I'm Yashashri, and I'll cover the engineering practices that make fintel safe to use in real applications. We start with errors. Every public method validates its inputs and raises a typed exception when something is wrong. We defined a custom hierarchy. FintelError is the base class. Catch this and you catch everything we throw. Underneath, three subclasses give callers finer-grained control. DataValidationError covers bad input shapes. InsufficientDataError fires when you ask for a window larger than the available data. InvalidParameterError covers everything else, like a negative threshold or an unknown metric name. Three reasons for the hierarchy. It lets callers handle different failures differently. It doubles as API documentation, because every docstring names exactly which exception it can raise. And every error path is exercised in the test suite.",
}).forEach((c) => children.push(c));

slideBlock({
  num: 11, title: "Validation Strategy and Test Coverage", speaker: "Yashashri", words: 132, secs: 56,
  script: "Speaking of the test suite, here is how it is structured. Nine test groups, more than thirty assertions, and we cover all four modules with one hundred percent of documented error paths exercised. Coverage is two-tier. The first tier verifies nominal behaviour. We generate synthetic OHLCV data with a fixed numpy seed, inject anomalies on known dates, and assert that the detectors find them. That is deterministic and repeatable. The second tier verifies failure-mode behaviour. Every documented exception is triggered at least once with targeted bad inputs. Wrong types, empty data, bad windows, duplicate rule names, and so on. Why both tiers. The happy-path tests catch algorithmic regressions. The failure-mode tests catch API-contract regressions. You need both to refactor confidently.",
}).forEach((c) => children.push(c));

slideBlock({
  num: 12, title: "Live Pipeline on AAPL: One Year of Trading Data", speaker: "Yashashri", words: 145, secs: 62,
  script: "All of that machinery is only useful if it works on real data. So here is the live pipeline on twelve months of Apple stock. Five steps, each one a single function call. Ingest, where yfinance downloads a year of OHLCV. Detect, where SignalDetector runs all four detectors. Measure, where MetricsEngine computes the full summary. Govern, where AlertEngine evaluates the rules and the SLOs check their targets. And finally Visualise, where Dashboard renders the figure. Representative outcomes from a recent run. Roughly thirty signals are detected across the four detectors. Five alert rules and three SLOs are evaluated. One dashboard figure is rendered. The most interesting property is that the same code path that powers the test suite handles a year of real Apple data without modification. Prakhar will take it from here.",
}).forEach((c) => children.push(c));

// =============================================================================
// PRAKHAR — SLIDES 13, 14, 15, 16
// =============================================================================
children.push(partBanner("PART IV  ·  PRAKHAR  ·  Slides 13 to 16  ·  ~3:40"));

slideBlock({
  num: 13, title: "Dashboard Composition: Five Coordinated Panels", speaker: "Prakhar", words: 135, secs: 58,
  script: "Thanks Yashashri. I'm Prakhar, and I'm closing out the presentation. This slide shows what the dashboard the pipeline produces actually looks like. Five coordinated panels in a single figure. Two rows of two panels each on top, and one full-width panel at the bottom. Reading order from one to five. Price with signal markers, where severity-coloured dots overlay the closing line. Technical indicators, with SMA, EMA, and the Bollinger envelope drawn on one axis. Volume, where up days and down days are coloured differently and surges receive a third colour. Health status, which reads out Sharpe, RSI, drawdown, and total return in colour-coded form. And the alert timeline, where triggered rules are ranked by severity. Everything you need to triage one ticker is visible on a single figure.",
}).forEach((c) => children.push(c));

slideBlock({
  num: 14, title: "Trade-offs and Engineering Rationale", speaker: "Prakhar", words: 145, secs: 62,
  script: "Behind those features, every design decision came with a trade-off. Here are the five that mattered most. First, object-oriented modules over a functional pipeline. The modules own state, so OOP is the more honest abstraction. Second, lazy evaluation with caching, so indicators used by multiple consumers are computed only once. Third, fail loud, not fail quiet. Silent NaNs would propagate through alerting and produce wrong, confident answers. We refuse to allow that. Fourth, composability over a god-object. Dashboard takes a MetricsEngine as input rather than rebuilding one internally, which keeps it testable in isolation. And fifth, the OpenTelemetry mapping is made explicit. Severity strings and SLO terminology are imported on purpose, so the analogy is reviewable in the code rather than just claimed in slides.",
}).forEach((c) => children.push(c));

slideBlock({
  num: 15, title: "Limitations and Future Work", speaker: "Prakhar", words: 142, secs: 60,
  script: "Of course, the project has limits. On the left, what we did not build. Signal detection is strictly backward-looking, with no forecasting layer. Daily bars only, with no intraday tick data. Static thresholds rather than statistically learned ones. yfinance is the sole data source, so survivorship bias and rate limits are inherited. And there is no persistence layer. Signals and alerts live only for the lifetime of the process. These are scope choices, not blind spots, and we documented every one in the design report. On the right, where we go next. Adaptive thresholds learned from data. Streaming mode via asyncio for tick feeds. SQLite persistence for replay. A real OpenTelemetry exporter that emits fintel signals as actual OTel spans. And portfolio-level SLOs with multi-asset weighting.",
}).forEach((c) => children.push(c));

slideBlock({
  num: 16, title: "Conclusion", speaker: "Prakhar", words: 95, secs: 42,
  script: "To bring this together. Markets are systems. Treat them that way. fintel demonstrates that the engineering vocabulary of modern observability, the language of spans and metrics and alerts and SLOs, is not a metaphor for finance. It is directly applicable infrastructure. Four modules. Nine test suites. Five allowed libraries. Zero external dependencies beyond scope. On behalf of Maruthi, Sid, Yashashri, and myself, thank you for watching this presentation. We are happy to take any questions.",
}).forEach((c) => children.push(c));

// -----------------------------------------------------------------------------
// HEADER / FOOTER
// -----------------------------------------------------------------------------
const docHeader = new Header({
  children: [
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BURGUNDY, space: 4 } },
      children: [
        r({ text: "fintel  ·  Video Script", italic: true, color: NAVY, size: 18 }),
        new TextRun({ text: "\t" }),
        r({ text: "FE 520  ·  Spring 2026", bold: true, color: BURGUNDY, size: 18 }),
      ],
    }),
  ],
});

const docFooter = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: BURGUNDY, space: 4 } },
      children: [
        r({ text: "Page ", color: NAVY, size: 18 }),
        new TextRun({ children: [PageNumber.CURRENT], color: NAVY, size: 18, bold: true }),
        r({ text: " of ", color: NAVY, size: 18 }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], color: NAVY, size: 18, bold: true }),
      ],
    }),
  ],
});

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_W, height: 15840 },
        margin: { top: 1440, right: MARGIN, bottom: 1440, left: MARGIN },
      },
    },
    headers: { default: docHeader },
    footers: { default: docFooter },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = "/Users/maru/Documents/fintel/presentation/fintel_FE520_video_script.docx";
  fs.writeFileSync(out, buf);
  console.log("Built:", out);
}).catch((e) => { console.error(e); process.exit(1); });
