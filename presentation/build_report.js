// fintel — FE 520 Final Project Design Report
// A professional report detailing design decisions and challenges faced.
// Palette: Burgundy / Navy / White / Black (consistent with deck and rubric).

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, VerticalAlign,
  PageNumber, PageBreak, TabStopType, TabStopPosition,
} = require("docx");

// -----------------------------------------------------------------------------
// PALETTE
// -----------------------------------------------------------------------------
const BURGUNDY = "7B1E2D";
const NAVY = "0B2545";
const WHITE = "FFFFFF";
const BLACK = "111111";
const LIGHT_NAVY = "E8EDF4";
const LIGHT_BURGUNDY = "F5E8EA";

const PAGE_W = 12240;
const MARGIN = 1440;
const CONTENT_W = PAGE_W - 2 * MARGIN;

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------
const r = (opts) => new TextRun({
  font: opts.font || "Calibri",
  size: opts.size || 22,
  color: opts.color || BLACK,
  bold: !!opts.bold,
  italic: !!opts.italic,
  text: opts.text,
  break: opts.break || 0,
});

const p = (children, opts = {}) => new Paragraph({
  alignment: opts.align || AlignmentType.LEFT,
  spacing: { before: opts.before || 0, after: opts.after === undefined ? 120 : opts.after, line: opts.line || 320 },
  indent: opts.indent,
  numbering: opts.numbering,
  border: opts.border,
  children: Array.isArray(children) ? children : [children],
});

const text = (str, opts = {}) =>
  p([r({ text: str, ...opts })], { after: opts.after === undefined ? 160 : opts.after });

const h1 = (str) => new Paragraph({
  spacing: { before: 320, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BURGUNDY, space: 6 } },
  children: [r({ text: str, font: "Georgia", size: 32, color: NAVY, bold: true })],
});

const h2 = (str) => new Paragraph({
  spacing: { before: 280, after: 120 },
  children: [r({ text: str, font: "Georgia", size: 26, color: NAVY, bold: true })],
});

const h3 = (str) => new Paragraph({
  spacing: { before: 200, after: 80 },
  children: [r({ text: str, font: "Georgia", size: 22, color: BURGUNDY, bold: true })],
});

const para = (str) => new Paragraph({
  spacing: { before: 0, after: 160, line: 320 },
  alignment: AlignmentType.JUSTIFIED,
  children: [r({ text: str, size: 22 })],
});

const richPara = (runs) => new Paragraph({
  spacing: { before: 0, after: 160, line: 320 },
  alignment: AlignmentType.JUSTIFIED,
  children: runs,
});

const bullet = (str) => new Paragraph({
  spacing: { before: 0, after: 80, line: 300 },
  numbering: { reference: "bullets", level: 0 },
  children: [r({ text: str, size: 21 })],
});

const richBullet = (runs) => new Paragraph({
  spacing: { before: 0, after: 80, line: 300 },
  numbering: { reference: "bullets", level: 0 },
  children: runs,
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

// -----------------------------------------------------------------------------
// REPORT BODY
// -----------------------------------------------------------------------------
const children = [];

// --- Cover block ---
children.push(
  new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [r({ text: "FE 520  ·  STEVENS INSTITUTE OF TECHNOLOGY", bold: true, color: BURGUNDY, size: 18, font: "Calibri" })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [r({ text: "Final Project Design Report", font: "Georgia", size: 48, color: NAVY, bold: true })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 120 },
    children: [r({ text: "fintel: Financial Telemetry & Observability", italic: true, font: "Georgia", size: 28, color: BLACK })],
  }),
  new Paragraph({
    spacing: { before: 0, after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: BURGUNDY, space: 6 } },
    children: [r({ text: "", size: 2 })],
  }),
);

// --- Submission metadata table ---
const metaRow = (label, val) => new TableRow({ children: [
  textCell(label, { width: 2400, bold: true, color: NAVY, fill: LIGHT_BURGUNDY }),
  textCell(val,   { width: CONTENT_W - 2400 }),
]});
children.push(new Table({
  width: { size: CONTENT_W, type: WidthType.DXA },
  columnWidths: [2400, CONTENT_W - 2400],
  rows: [
    metaRow("Author", "Maruthi Kunchala"),
    metaRow("Course", "FE 520, Financial Engineering in Python"),
    metaRow("Term", "Spring 2026"),
    metaRow("Submission Date", "April 26, 2026"),
    metaRow("Package", "fintel v1.0.0"),
    metaRow("Permitted Libraries", "pandas, numpy, matplotlib, datetime, yfinance"),
  ],
}));

// -----------------------------------------------------------------------------
// 1. EXECUTIVE SUMMARY
// -----------------------------------------------------------------------------
children.push(h1("1. Executive Summary"));

children.push(richPara([
  r({ text: "This report accompanies the submission of ", size: 22 }),
  r({ text: "fintel", bold: true, italic: true, size: 22 }),
  r({ text: ", a Python package developed for the FE 520 final project. The package operationalises a fairly unconventional thesis: the engineering discipline of observability, codified by the OpenTelemetry standard for distributed systems, has a direct and useful analogue in quantitative finance. Where production engineers track latency, error rates, and service-level objectives, portfolio managers track volatility, drawdown, and risk tolerances. fintel makes the parallel explicit and builds tooling around it.", size: 22 }),
]));

children.push(para(
  "The package is composed of four loosely coupled modules (SignalDetector, MetricsEngine, AlertEngine with SLOs, and Dashboard) on top of a shared utility layer that defines a custom exception hierarchy and input-validation primitives. The implementation is constrained to five permitted libraries: pandas, numpy, matplotlib, datetime, and yfinance. The public surface is exercised by a two-tier test suite that covers both nominal usage and every documented failure mode."
));

children.push(para(
  "This document records the architectural decisions that shaped the package, the trade-offs accepted in service of those decisions, and the technical challenges encountered during implementation. It is intended as a complement to the source code and the demonstration notebook. The goal is to make the project's engineering reasoning auditable rather than implicit."
));

// -----------------------------------------------------------------------------
// 2. DESIGN PHILOSOPHY
// -----------------------------------------------------------------------------
children.push(h1("2. Design Philosophy"));

children.push(h2("2.1  The Observability Analogy"));
children.push(para(
  "OpenTelemetry organises observability into three pillars: traces (timed events with metadata), metrics (numerical measurements aggregated over windows), and logs and alerts (threshold-based notifications, often guarded by Service-Level Objectives). Each of these has a direct mapping in financial-market monitoring."
));
children.push(richPara([
  r({ text: "A volatility spike is a span. It has a timestamp, a duration, a severity, and contextual metadata. A rolling Sharpe ratio is a metric, a numerical measurement aggregated over a configurable window. An alert that fires when drawdown breaches fifteen percent is functionally identical to one that fires when p99 latency breaches five hundred milliseconds. ", size: 22 }),
  r({ text: "The vocabulary transfers directly, and so does the engineering rigour that surrounds it.", italic: true, size: 22 }),
]));
children.push(para(
  "This mapping is the principal design commitment of the project. Every module name, class hierarchy, severity convention, and method signature was chosen to make the analogy reviewable in code, not merely asserted in prose. A reader fluent in either domain (quantitative finance or site reliability engineering) should recognise the patterns immediately."
));

children.push(h2("2.2  Guiding Principles"));
children.push(richBullet([
  r({ text: "Composability over monolith. ", bold: true, size: 21 }),
  r({ text: "Modules accept pre-computed objects from one another rather than reconstructing internal state. Dashboard is given a MetricsEngine; AlertEngine evaluates against a MetricsEngine; nothing reaches inside another module's private members.", size: 21 }),
]));
children.push(richBullet([
  r({ text: "Fail loud, not quiet. ", bold: true, size: 21 }),
  r({ text: "Silent NaNs or implicit defaults would propagate through downstream alerting and produce wrong, confident answers. The package raises typed exceptions at every public entry point.", size: 21 }),
]));
children.push(richBullet([
  r({ text: "Constraints respected, not circumvented. ", bold: true, size: 21 }),
  r({ text: "The course specifies five permitted libraries. Several conveniences (e.g. ta-lib for indicators, plotly for dashboards) were forgone deliberately; the implementation builds on raw pandas and matplotlib.", size: 21 }),
]));
children.push(richBullet([
  r({ text: "Lazy evaluation with caching. ", bold: true, size: 21 }),
  r({ text: "Indicators are computed on first request and stored in an internal dictionary. A Simple Moving Average used by both the Bollinger Band envelope and the dashboard's overlay panel is therefore calculated once.", size: 21 }),
]));

// -----------------------------------------------------------------------------
// 3. ARCHITECTURE
// -----------------------------------------------------------------------------
children.push(h1("3. Architecture & Module Decisions"));

children.push(h2("3.1  Overall Topology"));
children.push(para(
  "The package adopts a hub-and-spoke topology in which a validated OHLCV DataFrame is the single point of input. From there, three independent modules (SignalDetector, MetricsEngine, and AlertEngine) operate in parallel, each producing structured outputs that the Dashboard module composes into a unified visualisation. This decision was made over the alternative monolithic-pipeline design because it permits each module to be tested and used in isolation; a user who needs only the MetricsEngine never has to instantiate the rest."
));

children.push(h2("3.2  Module I: SignalDetector"));
children.push(richPara([
  r({ text: "SignalDetector exposes four detection methods (volatility spikes, volume surges, Bollinger Band breakouts, and opening gaps) and a composite ", size: 22 }),
  r({ text: "get_all_signals()", font: "Consolas", size: 21 }),
  r({ text: " method that returns a time-sorted list. Each detected event is materialised as a ", size: 22 }),
  r({ text: "Signal", font: "Consolas", size: 21 }),
  r({ text: " object carrying ticker, timestamp, severity (using the OTel info / warning / critical convention), observed value, threshold, and a metadata dictionary.", size: 22 }),
]));
children.push(para(
  "Two design decisions warrant explanation. First, severity is computed inside the detector itself rather than left to the caller. A volatility spike at three sigma is mechanically more severe than one at two sigma, so embedding this judgement in the detector keeps the alerting layer thin. Second, signals are returned as plain Python objects rather than raw DataFrames. This lets downstream consumers use object attribute access and means that adding fields later is non-breaking."
));

children.push(h2("3.3  Module II: MetricsEngine"));
children.push(richPara([
  r({ text: "MetricsEngine implements the technical-indicator suite (SMA, EMA, Bollinger Bands, RSI, rolling volatility, Sharpe ratio, maximum drawdown, daily returns, and a summary report). All numeric outputs are returned as native pandas Series so that downstream code can compose them with the rest of the pandas ecosystem without further conversion. A private ", size: 22 }),
  r({ text: "_cache", font: "Consolas", size: 21 }),
  r({ text: " dictionary memoises results keyed by ", size: 22 }),
  r({ text: "(metric, window)", font: "Consolas", size: 21 }),
  r({ text: " so repeated reads are free.", size: 22 }),
]));
children.push(para(
  "Numerical safeguards were a focal area. The RSI calculation, for instance, divides by an average loss that can equal zero during strong unidirectional trends. The implementation uses numpy.where to substitute a sentinel relative-strength value rather than allow a NaN to propagate. Similarly, the Sharpe ratio short-circuits to zero when the excess-return standard deviation is exactly zero, a degenerate but possible edge case in synthetic test data."
));

children.push(h2("3.4  Module III: AlertEngine and SLO"));
children.push(richPara([
  r({ text: "AlertEngine accepts user-defined rules. Each rule has a name, a target metric, a condition (above or below), a threshold, and a severity. The engine evaluates these rules against a supplied MetricsEngine to produce a list of ", size: 22 }),
  r({ text: "Alert", font: "Consolas", size: 21 }),
  r({ text: " objects. A separate ", size: 22 }),
  r({ text: "SLO", font: "Consolas", size: 21 }),
  r({ text: " class encodes Service-Level Objectives, which are portfolio-level performance targets such as 'Sharpe ratio must remain above 1.0'. It reports met-status along with the current margin of compliance.", size: 22 }),
]));
children.push(para(
  "The choice to keep AlertEngine separate from SLO, rather than merging them into one class, follows the OTel reference architecture: alerts are immediate threshold breaches, while SLOs are longer-horizon reliability targets evaluated against an error budget. The conceptual distinction matters even though both classes happen to consume the same MetricsEngine internally."
));

children.push(h2("3.5  Module IV: Dashboard"));
children.push(para(
  "Dashboard composes five matplotlib panels into a single figure styled after Grafana's dark theme. The five panels are: price with signal annotations, technical-indicator overlays, volume bars, a health-status readout, and an alert timeline. The dark theme is not decorative. It reinforces the observability narrative and provides higher contrast for the marker-laden price panel. A separate static method, plot_correlation_heatmap, supports multi-ticker portfolio analysis."
));
children.push(para(
  "Dashboard depends on the other three modules but is never depended upon by them, preserving the directed acyclic structure of the package. It accepts pre-computed engines and signal lists as constructor arguments rather than rebuilding them internally. This keeps the visualisation layer thin and exclusively concerned with rendering."
));

// -----------------------------------------------------------------------------
// 4. ERROR HANDLING
// -----------------------------------------------------------------------------
children.push(h1("4. Error Handling Strategy"));

children.push(para(
  "Robustness was a stated evaluation criterion, and the package treats it as a first-class concern. A custom exception hierarchy was defined rather than relying on Python's built-in exceptions, for three reasons: it lets callers catch errors at the right granularity, it produces self-describing tracebacks that point to fintel rather than to pandas or numpy, and it serves as a soft form of API documentation. Every public method's docstring names the exact exception it can raise."
));

const errRow = (name, desc) => new TableRow({ children: [
  textCell(name, { width: 3200, bold: true, color: BURGUNDY, font: "Consolas", size: 19 }),
  textCell(desc, { width: CONTENT_W - 3200, size: 20 }),
]});
children.push(new Table({
  width: { size: CONTENT_W, type: WidthType.DXA },
  columnWidths: [3200, CONTENT_W - 3200],
  rows: [
    new TableRow({ tableHeader: true, children: [
      textCell("Exception Class", { width: 3200, bold: true, color: WHITE, fill: NAVY, size: 20 }),
      textCell("When Raised", { width: CONTENT_W - 3200, bold: true, color: WHITE, fill: NAVY, size: 20 }),
    ]}),
    errRow("FintelError", "Base class. Catch this to handle any fintel-originated error."),
    errRow("DataValidationError", "Input is not a DataFrame, is empty, lacks required OHLCV columns, or contains non-numeric data."),
    errRow("InsufficientDataError", "A windowed calculation was requested with fewer observations than the window size requires."),
    errRow("InvalidParameterError", "A function argument is out of valid range, has the wrong type, or violates a documented constraint (for example, duplicate rule names, unknown metric names, or invalid severity strings)."),
  ],
}));

children.push(text("", { after: 80 }));
children.push(para(
  "Every public method validates its arguments before performing computation. Validation is centralised in three helper functions (validate_ohlcv, validate_positive_int, and validate_positive_float) so that error messages remain consistent across modules. The test suite explicitly exercises each error path."
));

// -----------------------------------------------------------------------------
// 5. TESTING
// -----------------------------------------------------------------------------
children.push(h1("5. Testing & Validation"));

children.push(para(
  "Testing follows a two-tier structure. The first tier verifies nominal behaviour: synthetic OHLCV data is generated with a fixed numpy seed, anomalies are deliberately injected (a volatility regime change around day 100, volume spikes on specific dates, an opening gap), and the test asserts that the detectors return the expected counts and characteristics. The second tier verifies failure-mode behaviour: every documented exception class is triggered at least once by a targeted bad input."
));

children.push(richPara([
  r({ text: "The test suite comprises nine groups containing more than thirty assertions, and covers all four modules. Empirically, the synthetic-data tier catches algorithmic regressions (e.g. an RSI miscalculation when all returns are positive), while the failure-mode tier catches API-contract regressions (e.g. forgetting to validate a window argument after refactoring).", size: 22 }),
]));

// -----------------------------------------------------------------------------
// 6. CHALLENGES FACED
// -----------------------------------------------------------------------------
children.push(h1("6. Challenges Faced"));

children.push(para(
  "Several technical challenges surfaced during development. Each is recorded below alongside the resolution adopted, since the resolutions themselves are part of the package's design."
));

children.push(h3("6.1  Inconsistent Column Schema from yfinance"));
children.push(richPara([
  r({ text: "When downloaded for a single ticker, yfinance returns OHLCV columns either as a flat Index or as a MultiIndex with the ticker as the second level, depending on version and call style. Downstream code that assumed a flat Index broke silently: the columns were technically present, but lookups by name returned KeyErrors. ", size: 22 }),
  r({ text: "Resolution. ", bold: true, size: 22 }),
  r({ text: "The validate_ohlcv utility now detects a MultiIndex and flattens it in place before any other validation runs, so the rest of the package can rely on a single column-shape invariant.", size: 22 }),
]));

children.push(h3("6.2  RSI Division by Zero"));
children.push(richPara([
  r({ text: "On the synthetic test fixture, a stretch of consecutive up-days drove the rolling average-loss to exactly zero, which yielded a NaN RSI rather than the mathematically correct value of one hundred. ", size: 22 }),
  r({ text: "Resolution. ", bold: true, size: 22 }),
  r({ text: "The relative-strength calculation uses numpy.where to substitute a sentinel value when average-loss is zero, so the RSI saturates at one hundred (or zero for the symmetric case) rather than collapsing to NaN.", size: 22 }),
]));

children.push(h3("6.3  Rolling-Window NaN Boundaries"));
children.push(richPara([
  r({ text: "Pandas rolling-window operations produce NaN values for the first window-minus-one observations, which then propagate through downstream comparisons and produce spurious False values in boolean masks. Early versions of the volume-surge detector emitted signals on rows where the rolling-average volume was still undefined. ", size: 22 }),
  r({ text: "Resolution. ", bold: true, size: 22 }),
  r({ text: "Every detector explicitly combines its trigger mask with a notna() mask over the rolling baseline, so signals are only ever emitted on rows where the underlying calculation is fully defined.", size: 22 }),
]));

children.push(h3("6.4  Matplotlib Dark-Theme Consistency"));
children.push(richPara([
  r({ text: "Theming a single matplotlib axis is straightforward. Theming five axes, their legends, tick marks, spines, colourbars, and annotation text consistently across a multi-panel figure is not. Early versions of the dashboard had visible light-mode artefacts (default tick colour, legend frame colour, and the like) in two or three panels. ", size: 22 }),
  r({ text: "Resolution. ", bold: true, size: 22 }),
  r({ text: "A private _style_ax helper method was added to Dashboard and called from every panel method. The helper sets background, tick colour, grid, and spine colour in one place, making the theme self-consistent and trivial to change.", size: 22 }),
]));

children.push(h3("6.5  Signal Severity Calibration"));
children.push(richPara([
  r({ text: "Choosing the boundary between warning and critical severity for each detector was not algorithmically obvious. A two-sigma volatility move is a warning under one convention and routine under another. ", size: 22 }),
  r({ text: "Resolution. ", bold: true, size: 22 }),
  r({ text: "Thresholds are exposed as constructor arguments rather than hard-coded, and severity rules are documented in each detector's docstring. The defaults reflect standard quant-finance heuristics (two-sigma for warning, three-sigma for critical), but no user is forced to accept them.", size: 22 }),
]));

children.push(h3("6.6  Library Discipline Under Pressure"));
children.push(richPara([
  r({ text: "The five-library constraint was occasionally inconvenient. The dashboard would have rendered more crisply with seaborn-style helpers, the correlation heatmap was easier to implement in plotly than in matplotlib, and statistical learning of alert thresholds tempted scikit-learn imports. ", size: 22 }),
  r({ text: "Resolution. ", bold: true, size: 22 }),
  r({ text: "Each temptation was rejected and the equivalent functionality re-implemented on top of matplotlib and numpy. The constraint was treated as part of the assignment's pedagogical intent rather than an obstacle to engineer around.", size: 22 }),
]));

// -----------------------------------------------------------------------------
// 7. TRADE-OFFS ACCEPTED
// -----------------------------------------------------------------------------
children.push(h1("7. Trade-offs Accepted"));

children.push(para(
  "No design comes without compromises. The principal trade-offs of fintel are recorded below explicitly so that reviewers can evaluate whether they were the right ones to accept."
));

const tradeoffRow = (decision, instead, why) => new TableRow({ children: [
  textCell(decision, { width: 3000, bold: true, color: NAVY, size: 19 }),
  textCell(instead,  { width: 3000, size: 19 }),
  textCell(why,      { width: CONTENT_W - 6000, size: 19 }),
]});
children.push(new Table({
  width: { size: CONTENT_W, type: WidthType.DXA },
  columnWidths: [3000, 3000, CONTENT_W - 6000],
  rows: [
    new TableRow({ tableHeader: true, children: [
      textCell("Chosen", { width: 3000, bold: true, color: WHITE, fill: NAVY, size: 20 }),
      textCell("Rejected Alternative", { width: 3000, bold: true, color: WHITE, fill: NAVY, size: 20 }),
      textCell("Rationale", { width: CONTENT_W - 6000, bold: true, color: WHITE, fill: NAVY, size: 20 }),
    ]}),
    tradeoffRow(
      "Object-oriented modules with mutable state",
      "Pure-functional pipeline",
      "Caching, accumulated signals, and registered alert rules are inherently stateful; OOP is the more honest abstraction."
    ),
    tradeoffRow(
      "Static, user-set alert thresholds",
      "Statistically learned thresholds",
      "Learned thresholds would require scikit-learn or hand-rolled fitting; static thresholds remain inside the permitted-library envelope."
    ),
    tradeoffRow(
      "Daily-frequency analysis",
      "Intraday tick streaming",
      "Streaming would require asyncio and persistence; the project's scope is end-of-day monitoring, which yfinance already supports."
    ),
    tradeoffRow(
      "In-memory signals and alerts",
      "Database persistence",
      "Persistence is a non-trivial subsystem; the package is designed as a library, not a service."
    ),
    tradeoffRow(
      "Custom exception hierarchy",
      "Reusing built-in exceptions",
      "Built-in exceptions cannot be caught at the fintel-specific granularity that the API contract requires."
    ),
  ],
}));

// -----------------------------------------------------------------------------
// 8. LIMITATIONS & FUTURE WORK
// -----------------------------------------------------------------------------
children.push(h1("8. Limitations and Future Work"));

children.push(para(
  "The package's limitations are acknowledged frankly and treated as roadmap items rather than concealed issues."
));
children.push(bullet("Signal detection is strictly backward-looking. No forecasting model is included by design."));
children.push(bullet("Only daily bars are supported. Intraday tick data would require a streaming refactor and a different concurrency model."));
children.push(bullet("Alert thresholds are user-set rather than statistically learned, which limits cross-asset generalisation."));
children.push(bullet("yfinance is the sole data source, so survivorship bias and free-tier rate limits are inherited."));
children.push(bullet("There is no persistence layer. Signals and alerts live only for the lifetime of the process."));

children.push(h3("Roadmap"));
children.push(bullet("Adaptive thresholds via rolling-window quantile estimators."));
children.push(bullet("Streaming mode via Python asyncio for live tick feeds."));
children.push(bullet("SQLite persistence for historical signal and alert replay."));
children.push(bullet("Native OpenTelemetry exporter that emits fintel signals as actual OTel spans, so they can be ingested by Grafana, Datadog, or any compliant backend."));
children.push(bullet("Portfolio-level SLOs with multi-asset weighting."));

// -----------------------------------------------------------------------------
// 9. CONCLUSION
// -----------------------------------------------------------------------------
children.push(h1("9. Conclusion"));

children.push(para(
  "The fintel project began with a thesis: that the engineering discipline of observability (spans, metrics, alerts, dashboards, and service-level objectives) is not a metaphor for financial monitoring but directly applicable infrastructure. The submission demonstrates that thesis end-to-end. Four independently testable modules, a custom exception hierarchy, a two-tier test suite, and a multi-panel observability dashboard cooperate to produce a single, coherent answer to a question that the financial-tooling ecosystem has not yet asked: what happens when we monitor portfolios the way Site Reliability Engineers monitor production systems?"
));
children.push(richPara([
  r({ text: "The answer offered here is concrete, constrained to the assignment's five permitted libraries, defensible at every layer, and, most importantly for an academic deliverable, ", size: 22 }),
  r({ text: "auditable", italic: true, size: 22 }),
  r({ text: " by anyone with a copy of the source.", size: 22 }),
]));

children.push(new Paragraph({ spacing: { before: 360, after: 0 }, alignment: AlignmentType.CENTER, children: [
  r({ text: "end of report", italic: true, color: BURGUNDY, size: 20 }),
]}));

// -----------------------------------------------------------------------------
// HEADER / FOOTER
// -----------------------------------------------------------------------------
const docHeader = new Header({
  children: [
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BURGUNDY, space: 4 } },
      children: [
        r({ text: "fintel  ·  Design Report", italic: true, color: NAVY, size: 18 }),
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

// -----------------------------------------------------------------------------
// ASSEMBLE
// -----------------------------------------------------------------------------
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
  },
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
  const out = "/Users/maru/Documents/fintel/presentation/fintel_FE520_design_report.docx";
  fs.writeFileSync(out, buf);
  console.log("Built:", out);
}).catch((e) => { console.error(e); process.exit(1); });
