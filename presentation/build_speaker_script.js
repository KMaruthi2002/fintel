// Speaker script for the fintel presentation.
// Four speakers, 16 slides, 15-minute target.
// Palette: Burgundy / Navy / White / Black (consistent with other artefacts).

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak,
  TabStopType, TabStopPosition,
} = require("docx");

const BURGUNDY = "7B1E2D";
const NAVY = "0B2545";
const WHITE = "FFFFFF";
const BLACK = "111111";
const LIGHT_NAVY = "E8EDF4";
const LIGHT_BURGUNDY = "F5E8EA";
const SOFT_BG = "FAF7F2";

const PAGE_W = 12240;
const MARGIN = 1440;
const CONTENT_W = PAGE_W - 2 * MARGIN;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
const r = (opts) => new TextRun({
  font: opts.font || "Calibri",
  size: opts.size || 22,
  color: opts.color || BLACK,
  bold: !!opts.bold,
  italic: !!opts.italic,
  text: opts.text,
});

const border = (color = "CCCCCC", size = 4) => ({
  style: BorderStyle.SINGLE, size, color,
});
const cellBorders = { top: border(), bottom: border(), left: border(), right: border() };

const cell = (children, opts = {}) => {
  const co = {
    width: { size: opts.width || 1000, type: WidthType.DXA },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    borders: cellBorders,
    verticalAlign: opts.valign || VerticalAlign.TOP,
    children: Array.isArray(children) ? children : [children],
  };
  if (opts.fill) co.shading = { fill: opts.fill, type: ShadingType.CLEAR };
  return new TableCell(co);
};

const textCell = (str, opts = {}) => cell(new Paragraph({
  alignment: opts.align || AlignmentType.LEFT,
  spacing: { before: 0, after: 0 },
  children: [r({ text: str, size: opts.size || 20, bold: opts.bold, italic: opts.italic, color: opts.color || BLACK, font: opts.font || "Calibri" })],
}), opts);

const h1 = (str) => new Paragraph({
  spacing: { before: 360, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BURGUNDY, space: 6 } },
  children: [r({ text: str, font: "Georgia", size: 32, color: NAVY, bold: true })],
});

const para = (str, opts = {}) => new Paragraph({
  spacing: { before: 0, after: 160, line: 320 },
  alignment: opts.align || AlignmentType.LEFT,
  children: [r({ text: str, size: 22, color: opts.color || BLACK, italic: opts.italic })],
});

// -----------------------------------------------------------------------------
// Slide entry helper
// -----------------------------------------------------------------------------
const slideEntry = ({ num, title, speaker, duration, opener, points, handoff }) => {
  const out = [];

  // Slide header strip
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
      r({ text: `${speaker} · ~${duration}  `, color: WHITE, italic: true, size: 20 }),
    ],
  }));

  // Opener
  out.push(new Paragraph({
    spacing: { before: 160, after: 80 },
    children: [r({ text: "Opening line", bold: true, color: BURGUNDY, size: 20, font: "Georgia" })],
  }));
  out.push(new Paragraph({
    spacing: { before: 0, after: 160, line: 320 },
    children: [r({ text: `"${opener}"`, italic: true, size: 22 })],
  }));

  // Key points
  out.push(new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [r({ text: "Key talking points", bold: true, color: BURGUNDY, size: 20, font: "Georgia" })],
  }));
  points.forEach((pt) => {
    out.push(new Paragraph({
      spacing: { before: 0, after: 80, line: 300 },
      numbering: { reference: "bullets", level: 0 },
      children: [r({ text: pt, size: 21 })],
    }));
  });

  // Handoff
  if (handoff) {
    out.push(new Paragraph({
      spacing: { before: 120, after: 80 },
      children: [r({ text: "Handoff / closing line", bold: true, color: BURGUNDY, size: 20, font: "Georgia" })],
    }));
    out.push(new Paragraph({
      spacing: { before: 0, after: 160, line: 320 },
      children: [r({ text: `"${handoff}"`, italic: true, size: 22 })],
    }));
  }

  return out;
};

// -----------------------------------------------------------------------------
// Body
// -----------------------------------------------------------------------------
const children = [];

// Cover
children.push(
  new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [r({ text: "FE 520  ·  STEVENS INSTITUTE OF TECHNOLOGY", bold: true, color: BURGUNDY, size: 18 })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [r({ text: "Presentation Speaker Script", font: "Georgia", size: 44, color: NAVY, bold: true })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 200 },
    children: [r({ text: "fintel: Financial Telemetry & Observability", italic: true, font: "Georgia", size: 26, color: BLACK })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: BURGUNDY, space: 6 } },
    children: [r({ text: "", size: 2 })],
  }),
);

// Speaker roster
children.push(new Paragraph({
  spacing: { before: 0, after: 120 },
  children: [r({ text: "Speaker Roster", font: "Georgia", size: 26, color: NAVY, bold: true })],
}));

const rosterRow = (name, role, slides, mins) => new TableRow({ children: [
  textCell(name,   { width: 2200, bold: true, color: NAVY, fill: LIGHT_BURGUNDY }),
  textCell(role,   { width: 4200 }),
  textCell(slides, { width: 1800, align: AlignmentType.CENTER }),
  textCell(mins,   { width: CONTENT_W - 2200 - 4200 - 1800, align: AlignmentType.CENTER }),
]});

children.push(new Table({
  width: { size: CONTENT_W, type: WidthType.DXA },
  columnWidths: [2200, 4200, 1800, CONTENT_W - 2200 - 4200 - 1800],
  rows: [
    new TableRow({ tableHeader: true, children: [
      textCell("Speaker", { width: 2200, bold: true, color: WHITE, fill: NAVY }),
      textCell("Role",    { width: 4200, bold: true, color: WHITE, fill: NAVY }),
      textCell("Slides",  { width: 1800, bold: true, color: WHITE, fill: NAVY, align: AlignmentType.CENTER }),
      textCell("Target time", { width: CONTENT_W - 2200 - 4200 - 1800, bold: true, color: WHITE, fill: NAVY, align: AlignmentType.CENTER }),
    ]}),
    rosterRow("Maruthi",   "Opens the deck. Problem, theory, architecture.",                                    "1, 2, 3, 4, 5",  "~4:30"),
    rosterRow("Sid",       "First info block. The three feeder modules: signals, metrics, alerts.",             "6, 7, 8",        "~2:30"),
    rosterRow("Yashashri", "Second info block. Dashboard module, error handling, testing.",                     "9, 10, 11",      "~2:30"),
    rosterRow("Prakhar",   "Closes the deck. Live demo, design decisions, limitations, conclusion.",            "12, 13, 14, 15, 16", "~4:30"),
  ],
}));

children.push(new Paragraph({
  spacing: { before: 200, after: 80 },
  children: [r({ text: "Total target time: ", bold: true, size: 22 }), r({ text: "14:00 spoken, leaving ~1 minute of buffer for natural pauses and a cushion before Q&A.", size: 22 })],
}));

children.push(new Paragraph({
  spacing: { before: 200, after: 80 },
  children: [r({ text: "How to read this script", bold: true, color: NAVY, size: 24, font: "Georgia" })],
}));
children.push(para(
  "Each slide has an opening line you can use as written (it gets the first sentence past nerves), a short list of talking points you should know but not read verbatim, and a handoff line that signals the next speaker to take over. The points are deliberately conversational rather than scripted, because reading kills delivery. Aim to look at the audience, glance at the slide for cues, and use the points as anchors rather than a transcript."
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// -----------------------------------------------------------------------------
// SLIDE-BY-SLIDE SCRIPT
// -----------------------------------------------------------------------------
children.push(h1("Slide-by-Slide Script"));

// =============================================================================
// MARUTHI — slides 1, 2, 3
// =============================================================================
children.push(new Paragraph({
  spacing: { before: 200, after: 80 },
  shading: { type: ShadingType.CLEAR, fill: LIGHT_BURGUNDY },
  border: {
    top: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
    left: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
    right: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
  },
  children: [r({ text: "  PART I  ·  MARUTHI  ·  Opening, problem, theory, architecture (~4 min 30 sec)", color: BURGUNDY, bold: true, size: 22, font: "Georgia" })],
}));

slideEntry({
  num: 1, title: "Title", speaker: "Maruthi", duration: "30 sec",
  opener: "Good afternoon everyone. We're going to walk you through fintel, a Python package we built for this course that takes an unusual angle on stock-market monitoring.",
  points: [
    "Introduce the team by name: Maruthi, Sid, Yashashri, and Prakhar.",
    "State the project name (fintel) and the subtitle (Financial Telemetry and Observability).",
    "One-sentence pitch: 'We took the ideas behind OpenTelemetry, which is how engineers monitor production systems, and applied them to monitoring stocks.'",
    "Mention the constraint up front: only five libraries allowed (pandas, numpy, matplotlib, datetime, yfinance).",
  ],
  handoff: "Before we get to the code, let me show you the structure of what we're about to cover.",
}).forEach((c) => children.push(c));

slideEntry({
  num: 2, title: "Agenda", speaker: "Maruthi", duration: "30 sec",
  opener: "Here's the path. Seven sections.",
  points: [
    "Walk through the seven sections quickly, gesture to each one as you read it.",
    "Don't read every word. Group them: 'Sections one through three set up the problem and the design. Sections four and five are the deep dive on each module. Six and seven are the demo and the conclusions.'",
    "Mention that each of the four of you will speak. 'I'm taking the first three slides, then Sid takes over, then Yashashri, then Prakhar closes us out.'",
  ],
  handoff: "So why does this project exist? Let me explain the gap we noticed.",
}).forEach((c) => children.push(c));

slideEntry({
  num: 3, title: "Problem Statement: Why monitor stocks like production systems", speaker: "Maruthi", duration: "75 sec",
  opener: "There's a question we kept coming back to while planning this project. Why do quants and SREs solve the same problem in completely different ways?",
  points: [
    "Read out the left card briefly: traditional financial tools treat market data as flat numbers. They tell you what happened, but not in a structured, alertable way.",
    "Read the right card: financial markets behave like distributed systems. Volatility spikes are events. Drawdowns breach thresholds. A portfolio has reliability characteristics.",
    "Make the parallel concrete with one example: 'An alert that fires when a service exceeds 500 milliseconds of latency is structurally identical to an alert that fires when a stock breaches 15% drawdown. Same shape, same machinery, different domain.'",
    "Land the thesis: 'fintel makes that parallel into actual tooling.'",
  ],
  handoff: "Before we get to the modules, let me show you the theoretical foundation we built on.",
}).forEach((c) => children.push(c));

slideEntry({
  num: 4, title: "Three Pillars of Observability, Mapped to Finance", speaker: "Maruthi", duration: "75 sec",
  opener: "OpenTelemetry organises observability into three pillars, and we mapped each one to a financial counterpart.",
  points: [
    "Walk through the three cards left to right. For each, name the OpenTelemetry concept first, then the financial mapping.",
    "Card 1, Traces and Spans: 'A span is a timed event with metadata. In fintel, a span is a market anomaly. A volatility spike, a volume surge, a breakout, or a gap.'",
    "Card 2, Metrics: 'Metrics are measurements aggregated over time windows. In fintel, those are technical indicators. SMA, EMA, Bollinger, RSI, Sharpe, drawdown.'",
    "Card 3, Alerting and SLOs: 'Threshold rules and reliability targets. In fintel, portfolio risk rules and service-level objectives.'",
    "Don't read every word in the cards. Use them as a visual aid. The audience can read on their own.",
  ],
  handoff: "Once you accept that mapping, the architecture writes itself. Here's how the package is laid out.",
}).forEach((c) => children.push(c));

slideEntry({
  num: 5, title: "Architecture and Data Flow", speaker: "Maruthi", duration: "60 sec",
  opener: "This is the whole package on one slide.",
  points: [
    "Point at the top node: 'Everything starts from a yfinance download. One DataFrame in, four modules consume it.'",
    "Trace the arrows: 'Three modules sit in the middle layer, all independent of each other. SignalDetector finds events. MetricsEngine computes numbers. AlertEngine evaluates rules against the metrics.'",
    "Point to the Dashboard node at the bottom: 'Dashboard is downstream of everything else. It composes the outputs into one figure.'",
    "Emphasise composability: 'Anyone can use just the MetricsEngine on its own. Nothing reaches inside another module.'",
  ],
  handoff: "Sid will take you through the three feeder modules, starting with SignalDetector.",
}).forEach((c) => children.push(c));

// =============================================================================
// SID — slides 6, 7, 8
// =============================================================================
children.push(new Paragraph({
  spacing: { before: 320, after: 80 },
  shading: { type: ShadingType.CLEAR, fill: LIGHT_BURGUNDY },
  border: {
    top: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
    left: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
    right: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
  },
  children: [r({ text: "  PART II  ·  SID  ·  The three feeder modules: signals, metrics, alerts (~2 min 30 sec)", color: BURGUNDY, bold: true, size: 22, font: "Georgia" })],
}));

slideEntry({
  num: 6, title: "Module I: SignalDetector", speaker: "Sid", duration: "50 sec",
  opener: "Thanks Maruthi. SignalDetector is the spans layer. It scans OHLCV data and emits structured objects for anything statistically unusual.",
  points: [
    "Walk through the four detectors on the left: volatility spikes, volume surges, Bollinger breakouts, and opening gaps. Mention that each has a sensible default threshold but is configurable.",
    "Mention get_all_signals: one call to run them all, time-sorted output.",
    "On the right, point to the Signal object schema. 'Each detection is an object with severity, value, threshold, and a metadata dict. The severity uses OTel conventions: info, warning, critical.'",
    "Why structured objects rather than rows in a DataFrame: 'It means downstream code can use attribute access, and we can add fields later without breaking anyone.'",
  ],
  handoff: "If SignalDetector emits the events, MetricsEngine produces the numbers.",
}).forEach((c) => children.push(c));

slideEntry({
  num: 7, title: "Module II: MetricsEngine", speaker: "Sid", duration: "50 sec",
  opener: "MetricsEngine is the technical-indicator suite. Same OHLCV input, but it returns numbers instead of events.",
  points: [
    "Quickly run through the supported metrics on the left. You don't need to define each one. 'The classic toolkit: moving averages, Bollinger Bands, RSI, Sharpe, drawdown, rolling volatility.'",
    "Point to the engineering properties on the right. Spend a moment on caching: 'We memoise by metric and window, so SMA used by both Bollinger Bands and the dashboard is calculated once.'",
    "Mention numerical safeguards: 'RSI can blow up on consecutive up-days because the average loss goes to zero. We handle that with numpy.where instead of letting it return NaN.'",
    "Important closing point: 'Everything returns native pandas Series, so users can compose with the rest of the pandas ecosystem.'",
  ],
  handoff: "And once you have signals and metrics, the third module decides what to do about them.",
}).forEach((c) => children.push(c));

slideEntry({
  num: 8, title: "Module III: AlertEngine and SLO", speaker: "Sid", duration: "50 sec",
  opener: "If MetricsEngine produces numbers, AlertEngine and SLO decide whether those numbers are okay or not.",
  points: [
    "Point to the left card: 'AlertEngine works exactly like a production alerting system. You register rules. Each rule has a name, a target metric, a condition above or below a threshold, and a severity.'",
    "Give one concrete example: 'You might say RSI below 30 is critical, or drawdown below minus 15% is critical.'",
    "Mention defensive features: 'It rejects duplicate rule names, unknown metric names, and bad evaluate calls.'",
    "Move to the right card on SLOs: 'SLO is borrowed from SRE. It expresses a target the portfolio is supposed to meet over time, like Sharpe above 1.0. The check method tells you whether you're meeting the target and by how much margin.'",
    "Why two classes instead of one: 'Alerts are immediate. SLOs are long-horizon reliability targets. Same data, different conceptual role.'",
  ],
  handoff: "Yashashri will take you through the visualisation layer and the engineering practices that hold it all together.",
}).forEach((c) => children.push(c));

// =============================================================================
// YASHASHRI — slides 9, 10, 11
// =============================================================================
children.push(new Paragraph({
  spacing: { before: 320, after: 80 },
  shading: { type: ShadingType.CLEAR, fill: LIGHT_BURGUNDY },
  border: {
    top: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
    left: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
    right: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
  },
  children: [r({ text: "  PART III  ·  YASHASHRI  ·  Dashboard, error handling, testing (~2 min 30 sec)", color: BURGUNDY, bold: true, size: 22, font: "Georgia" })],
}));

slideEntry({
  num: 9, title: "Module IV: Dashboard", speaker: "Yashashri", duration: "50 sec",
  opener: "Thanks Sid. Dashboard is the visualisation layer. Five panels, one figure, modelled on what a Grafana board looks like.",
  points: [
    "Walk through the five panels on the left: price with signal annotations, technical indicators, volume bars, the health readout, and the alert timeline.",
    "Emphasise that the dashboard does not recompute anything. 'It accepts a MetricsEngine and a list of signals as inputs. That keeps the visualisation layer thin.'",
    "Point to the right card: 'There's also a static method for correlation analysis across multiple tickers. That's how we handle portfolio-level questions.'",
    "Mention the dark theme briefly: 'It's not decorative. Severity-coloured markers stand out much better on a dark background.'",
  ],
  handoff: "Beyond the modules, robustness was a big part of the grading. Let me show you how we handle errors.",
}).forEach((c) => children.push(c));

slideEntry({
  num: 10, title: "Defensive Design: Custom Exception Hierarchy", speaker: "Yashashri", duration: "55 sec",
  opener: "Every public method in fintel validates its inputs and raises a typed exception when something is wrong. Here's the hierarchy.",
  points: [
    "Point to the navy box at the top: 'FintelError is the base class. Catch this and you catch everything we throw.'",
    "Then point to the three subclasses: 'DataValidationError for bad input shapes. InsufficientDataError when the user asks for a window bigger than the data. InvalidParameterError for everything else, like a negative threshold or an unknown metric name.'",
    "On the right, walk through the four reasons quickly. Don't read all the text. 'Granular catching means the caller can handle a missing column differently from a bad parameter. The hierarchy doubles as API documentation, because every docstring names which exceptions can be raised. And every one of these error paths is exercised in the test suite.'",
  ],
  handoff: "Speaking of the test suite, here's how it's structured.",
}).forEach((c) => children.push(c));

slideEntry({
  num: 11, title: "Validation Strategy and Test Coverage", speaker: "Yashashri", duration: "50 sec",
  opener: "Nine test suites, thirty-plus assertions, and we cover every error path. Coverage is two-tier.",
  points: [
    "Read the four headline numbers across the top cards: 9, 30+, 100%, 4 of 4. Don't dwell.",
    "Move to the bottom row, left card: 'Happy-path tier. We generate synthetic OHLCV with a fixed seed, inject anomalies on known dates, and assert the detectors find them. Deterministic and repeatable.'",
    "Right card: 'Failure-mode tier. Every documented exception is triggered at least once. Wrong types, empty data, bad windows, duplicate rule names, you name it.'",
    "Why both: 'The happy-path tests catch algorithmic regressions. The failure-mode tests catch API-contract regressions. You need both.'",
  ],
  handoff: "Prakhar will walk you through the live pipeline and take us home from there.",
}).forEach((c) => children.push(c));

// =============================================================================
// PRAKHAR — slides 12, 13, 14, 15, 16
// =============================================================================
children.push(new Paragraph({
  spacing: { before: 320, after: 80 },
  shading: { type: ShadingType.CLEAR, fill: LIGHT_BURGUNDY },
  border: {
    top: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
    left: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
    right: { style: BorderStyle.SINGLE, size: 8, color: BURGUNDY },
  },
  children: [r({ text: "  PART IV  ·  PRAKHAR  ·  Live demo, design decisions, limitations, conclusion (~4 min 30 sec)", color: BURGUNDY, bold: true, size: 22, font: "Georgia" })],
}));

slideEntry({
  num: 12, title: "Live Pipeline on AAPL: One Year of Trading Data", speaker: "Prakhar", duration: "65 sec",
  opener: "Thanks Yashashri. Same code path that powers the tests, run on twelve months of real AAPL data.",
  points: [
    "Walk through the five numbered steps left to right. Each step is one function call. 'Ingest, detect, measure, govern, visualise.'",
    "Drop in the example for emphasis: 'We download AAPL, run all four detectors, compute the full metric summary, evaluate five alert rules and three SLOs, and render the dashboard. That's the whole pipeline.'",
    "Move to the outcomes row: 'Roughly thirty signals get detected across all four detectors. Five rules and three SLOs are evaluated. One figure is rendered.'",
    "Reinforce: 'The interesting thing is the same package handles synthetic test data and a year of live AAPL with no changes.'",
  ],
  handoff: "And here's what the dashboard the pipeline produces actually looks like.",
}).forEach((c) => children.push(c));

slideEntry({
  num: 13, title: "Dashboard Composition: Five Coordinated Panels", speaker: "Prakhar", duration: "55 sec",
  opener: "Two rows of two panels each on top, and one full-width panel at the bottom. The reading order is on the right.",
  points: [
    "Walk through the reading order on the right card, numbered one through five.",
    "One: price with signal markers. 'Severity-coloured dots overlay the closing line.'",
    "Two: technical indicators. 'SMA, EMA, and the Bollinger envelope.'",
    "Three: volume. 'Up days and down days coloured differently, with surge highlights in a third colour.'",
    "Four: health. 'Sharpe, RSI, drawdown, and return as a status readout.'",
    "Five: alert timeline. 'Triggered rules ranked by severity for triage.'",
    "Close: 'Everything you need to triage one ticker is on a single figure.'",
  ],
  handoff: "Behind these features, every design decision came with a trade-off. Here are the big ones.",
}).forEach((c) => children.push(c));

slideEntry({
  num: 14, title: "Trade-offs and Engineering Rationale", speaker: "Prakhar", duration: "55 sec",
  opener: "Five design calls we made, and one sentence of reasoning behind each one.",
  points: [
    "Object-oriented over functional: 'Modules own state. Cached metrics, accumulated signals, registered rules. OOP fits.'",
    "Lazy evaluation with caching: 'Indicators are computed once. SMA used by Bollinger and the dashboard runs only the first time.'",
    "Fail loud, not fail quiet: 'A silent NaN would propagate through alerting and produce wrong, confident answers. We refuse to allow that.'",
    "Composability over a god-object: 'Dashboard takes a MetricsEngine as input rather than rebuilding one. That keeps it testable in isolation.'",
    "OTel mapping made explicit: 'Severity strings and SLO terminology are imported on purpose. The analogy should be reviewable in the code, not just claimed in slides.'",
  ],
  handoff: "Of course, the project has limits. We were honest about them.",
}).forEach((c) => children.push(c));

slideEntry({
  num: 15, title: "What We Did Not Solve, Yet", speaker: "Prakhar", duration: "55 sec",
  opener: "Two columns. On the left, what we did not build. On the right, what we'd build next.",
  points: [
    "Left card, briefly. 'No forecasting layer. Daily bars only. Static thresholds. yfinance is the only data source. No persistence between runs.'",
    "Frame it positively: 'These are scope choices, not blind spots. We documented every one in the design report.'",
    "Move to the right column. 'Where we go from here. Adaptive thresholds learned from data. Streaming via asyncio. SQLite persistence. A real OTel exporter that emits fintel signals as actual OpenTelemetry spans. And portfolio-level SLOs.'",
    "Pause on the OTel exporter point: 'That last one closes the loop. Real OTel spans, ingestable by Grafana or Datadog. The analogy becomes infrastructure.'",
  ],
  handoff: "To bring this together, here's what fintel demonstrates.",
}).forEach((c) => children.push(c));

slideEntry({
  num: 16, title: "Conclusion", speaker: "Prakhar", duration: "45 sec",
  opener: "Markets are systems. Treat them that way.",
  points: [
    "Read the quote on the slide aloud, deliberately. Two short sentences.",
    "Reinforce the thesis once more: 'The engineering vocabulary of modern observability is not metaphor for finance. It's directly applicable infrastructure.'",
    "Hit the closing numbers, one by one. 'Four modules. Nine test suites. Five allowed libraries. Zero external dependencies beyond scope.'",
    "End with the invitation: 'Thank you. We're happy to take questions.'",
    "Stand still after you finish. Resist the urge to keep talking. Let the question come.",
  ],
  handoff: null,
}).forEach((c) => children.push(c));

// =============================================================================
// APPENDIX — delivery notes
// =============================================================================
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1("Delivery Notes for the Whole Team"));

children.push(new Paragraph({
  spacing: { before: 0, after: 80 },
  children: [r({ text: "Pacing", bold: true, color: NAVY, font: "Georgia", size: 24 })],
}));
children.push(para(
  "Aim for a steady cadence around 130 words per minute. Faster than that and the audience stops following. Slower than that and you'll lose them to their phones. Watch your handoff cues so the four of you do not all speed up under pressure."
));

children.push(new Paragraph({
  spacing: { before: 160, after: 80 },
  children: [r({ text: "Handoffs", bold: true, color: NAVY, font: "Georgia", size: 24 })],
}));
children.push(para(
  "Each scripted handoff line names the next speaker. Use them. Naming each other on stage makes the team look prepared and gives the audience a moment to refocus. When you finish your part, step back half a pace so the next speaker has the floor visibly."
));

children.push(new Paragraph({
  spacing: { before: 160, after: 80 },
  children: [r({ text: "Pointing at slides", bold: true, color: NAVY, font: "Georgia", size: 24 })],
}));
children.push(para(
  "Use the slide as a visual aid, not a script. Glance at it, point at the element you are about to explain, and then turn back to the audience. Reading the slide bullet by bullet is the fastest way to lose them."
));

children.push(new Paragraph({
  spacing: { before: 160, after: 80 },
  children: [r({ text: "Numbers and acronyms", bold: true, color: NAVY, font: "Georgia", size: 24 })],
}));
children.push(para(
  "Say 'OTel' as O-Tel (two syllables), not 'oh-tee-eee-ell'. Say 'SLO' as ess-el-oh. Say 'Sharpe' as 'sharp', the e is silent. When you read percentages off the slide, say 'fifteen percent', not 'one five percent' or 'point one five'."
));

children.push(new Paragraph({
  spacing: { before: 160, after: 80 },
  children: [r({ text: "If a question comes during the talk", bold: true, color: NAVY, font: "Georgia", size: 24 })],
}));
children.push(para(
  "Politely defer to the end. 'Great question, can I take that at the end so we don't run over time?' is fine. If it's a clarification you can answer in one sentence, do that and move on."
));

children.push(new Paragraph({
  spacing: { before: 160, after: 80 },
  children: [r({ text: "Likely questions and short answers", bold: true, color: NAVY, font: "Georgia", size: 24 })],
}));

const qaRow = (q, a) => new TableRow({ children: [
  textCell(q, { width: 4400, bold: true, color: NAVY, fill: LIGHT_BURGUNDY, valign: VerticalAlign.TOP }),
  textCell(a, { width: CONTENT_W - 4400, valign: VerticalAlign.TOP }),
]});

children.push(new Table({
  width: { size: CONTENT_W, type: WidthType.DXA },
  columnWidths: [4400, CONTENT_W - 4400],
  rows: [
    qaRow("Why OpenTelemetry specifically? Why not just call this 'a monitoring package'?",
          "Because OpenTelemetry is the formal vocabulary the software industry settled on for this problem. We didn't invent the words 'span', 'metric', and 'SLO'. We just imported them so the package fits into the broader observability conversation."),
    qaRow("Why only five libraries?",
          "That's the course constraint. We treated it as part of the assignment rather than as something to work around. The dashboard would render more crisply with seaborn, but the constraint is the point."),
    qaRow("Does this actually trade?",
          "No. fintel is a monitoring package. It detects, measures, alerts, and visualises. It does not execute. Adding an execution layer is future work."),
    qaRow("How is this different from TA-Lib or pandas-ta?",
          "Those are pure indicator libraries. fintel adds structured signals, an alerting layer, SLOs, and an observability dashboard on top of indicators. The indicators are a means, not the end."),
    qaRow("Why not use machine learning for thresholds?",
          "ML thresholds would require scikit-learn, which is outside the five permitted libraries. It's on the roadmap. For this submission, thresholds are user-set with sensible defaults."),
    qaRow("Have you tested with multiple tickers?",
          "Yes. Slide 12 covers single-asset AAPL. The correlation heatmap demo runs across AAPL, GOOGL, and MSFT simultaneously."),
  ],
}));

// -----------------------------------------------------------------------------
// HEADER / FOOTER
// -----------------------------------------------------------------------------
const docHeader = new Header({
  children: [
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BURGUNDY, space: 4 } },
      children: [
        r({ text: "fintel  ·  Speaker Script", italic: true, color: NAVY, size: 18 }),
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
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    }],
  },
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
  const out = "/Users/maru/Documents/fintel/presentation/fintel_FE520_speaker_script.docx";
  fs.writeFileSync(out, buf);
  console.log("Built:", out);
}).catch((e) => { console.error(e); process.exit(1); });
