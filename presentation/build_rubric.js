// fintel — FE 520 Final Project Evaluation Rubric
// Graduate-level academic rubric — Burgundy / Navy / White / Black palette

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
const LIGHT_NAVY = "E8EDF4";   // very pale navy for alternating rows
const LIGHT_BURGUNDY = "F5E8EA"; // very pale burgundy for headers

// US Letter, 1" margins
const PAGE_W = 12240;
const MARGIN = 1440;
const CONTENT_W = PAGE_W - 2 * MARGIN; // 9360

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------
const border = (color = BURGUNDY, size = 4) => ({
  style: BorderStyle.SINGLE, size, color,
});
const allBorders = (color, size) => ({
  top: border(color, size),
  bottom: border(color, size),
  left: border(color, size),
  right: border(color, size),
});

const cell = (text, opts = {}) => {
  const {
    bold = false, color = BLACK, fill = null, align = AlignmentType.LEFT,
    italic = false, size = 20, width = 1000, font = "Calibri",
    valign = VerticalAlign.TOP,
  } = opts;
  const cellOpts = {
    width: { size: width, type: WidthType.DXA },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    borders: allBorders("999999", 4),
    verticalAlign: valign,
    children: [
      new Paragraph({
        alignment: align,
        children: [new TextRun({ text, bold, italic, color, size, font })],
      }),
    ],
  };
  if (fill) cellOpts.shading = { fill, type: ShadingType.CLEAR };
  return new TableCell(cellOpts);
};

const para = (text, opts = {}) => {
  const {
    bold = false, italic = false, color = BLACK, size = 22, font = "Calibri",
    align = AlignmentType.LEFT, before = 0, after = 80, indent = null,
  } = opts;
  const p = {
    alignment: align,
    spacing: { before, after },
    children: [new TextRun({ text, bold, italic, color, size, font })],
  };
  if (indent) p.indent = indent;
  return new Paragraph(p);
};

const heading = (text, level) => new Paragraph({
  heading: level,
  children: [new TextRun({ text, font: "Georgia" })],
});

const ruleParagraph = (color = BURGUNDY) => new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color, space: 6 } },
  spacing: { before: 0, after: 120 },
  children: [new TextRun({ text: "" })],
});

// -----------------------------------------------------------------------------
// CRITERION TABLE BUILDER
// -----------------------------------------------------------------------------
function criterionTable(criterion, weight, levels) {
  // levels = [{ band, range, descriptor }, ...]
  const W_BAND = 1700;
  const W_RANGE = 1100;
  const W_DESC = CONTENT_W - W_BAND - W_RANGE;

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      cell("Performance Level", {
        bold: true, color: WHITE, fill: NAVY, width: W_BAND,
        align: AlignmentType.LEFT, size: 20,
      }),
      cell("Points", {
        bold: true, color: WHITE, fill: NAVY, width: W_RANGE,
        align: AlignmentType.CENTER, size: 20,
      }),
      cell("Descriptor", {
        bold: true, color: WHITE, fill: NAVY, width: W_DESC,
        align: AlignmentType.LEFT, size: 20,
      }),
    ],
  });

  const rows = [headerRow];
  levels.forEach((lvl, idx) => {
    const fill = idx % 2 === 0 ? LIGHT_NAVY : null;
    rows.push(new TableRow({
      children: [
        cell(lvl.band, {
          bold: true, color: BURGUNDY, fill, width: W_BAND, size: 20, font: "Georgia",
        }),
        cell(lvl.range, {
          color: BLACK, fill, width: W_RANGE, align: AlignmentType.CENTER,
          size: 20, font: "Calibri",
        }),
        cell(lvl.descriptor, {
          color: BLACK, fill, width: W_DESC, size: 20, font: "Calibri",
        }),
      ],
    }));
  });

  return [
    // Criterion title bar
    new Paragraph({
      spacing: { before: 240, after: 0 },
      shading: { type: ShadingType.CLEAR, fill: BURGUNDY },
      children: [
        new TextRun({
          text: "  " + criterion.toUpperCase(),
          bold: true, color: WHITE, size: 22, font: "Georgia",
        }),
        new TextRun({ text: "\t", font: "Calibri" }),
        new TextRun({
          text: weight + " pts",
          bold: true, color: WHITE, size: 22, font: "Calibri",
        }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      border: {
        top: { style: BorderStyle.SINGLE, size: 24, color: BURGUNDY },
        bottom: { style: BorderStyle.SINGLE, size: 24, color: BURGUNDY },
        left: { style: BorderStyle.SINGLE, size: 24, color: BURGUNDY },
        right: { style: BorderStyle.SINGLE, size: 24, color: BURGUNDY },
      },
    }),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [W_BAND, W_RANGE, W_DESC],
      rows,
    }),
    new Paragraph({ spacing: { before: 0, after: 80 }, children: [] }),
  ];
}

// -----------------------------------------------------------------------------
// 4-TIER LEVEL HELPER (Exemplary, Proficient, Developing, Beginning)
// -----------------------------------------------------------------------------
function tiers(weight, descriptors) {
  // descriptors = { exemplary, proficient, developing, beginning }
  // Distribute points: Exemplary = 90-100% of weight, etc.
  const W = weight;
  const fmt = (a, b) => `${a.toFixed(1)} – ${b.toFixed(1)}`;
  return [
    { band: "Exemplary",  range: fmt(W * 0.90, W * 1.00), descriptor: descriptors.exemplary },
    { band: "Proficient", range: fmt(W * 0.75, W * 0.89), descriptor: descriptors.proficient },
    { band: "Developing", range: fmt(W * 0.60, W * 0.74), descriptor: descriptors.developing },
    { band: "Beginning",  range: fmt(W * 0.00, W * 0.59), descriptor: descriptors.beginning },
  ];
}

// -----------------------------------------------------------------------------
// MAIN BUILD
// -----------------------------------------------------------------------------
const criteria = [
  {
    name: "1. Conceptual Innovation & Theoretical Grounding",
    weight: 10,
    descriptors: {
      exemplary:
        "The project advances a non-trivial, defensible thesis (e.g., the OpenTelemetry-to-finance mapping). Each conceptual analogue is justified with reference to source-domain literature, and the analogy is operationalised — not merely asserted — across the architecture.",
      proficient:
        "A clear conceptual framework is present and consistently reflected in the implementation, with most analogues motivated and applied.",
      developing:
        "A theoretical framing exists but is partially decorative; some analogues are not reflected in the actual code or are inconsistently applied.",
      beginning:
        "No coherent conceptual framework. The project is a generic indicator script with no original framing.",
    },
  },
  {
    name: "2. Software Architecture & Modularity",
    weight: 12,
    descriptors: {
      exemplary:
        "Clean separation of concerns across four or more modules with well-defined public APIs and minimal cross-module coupling. Composition (e.g., Dashboard depending on MetricsEngine) is explicit and tested. Each module is independently usable.",
      proficient:
        "Three or more modules with reasonable separation. Some cross-module dependencies are appropriate; one or two minor coupling issues.",
      developing:
        "Modules exist but responsibilities overlap or APIs are inconsistent. Refactoring would clearly improve the structure.",
      beginning:
        "Monolithic script with little or no modularisation. The package boundary is nominal.",
    },
  },
  {
    name: "3. Code Quality & Pythonic Conventions",
    weight: 10,
    descriptors: {
      exemplary:
        "Idiomatic Python throughout: PEP 8 compliant, type-hinted where it adds value, descriptive identifiers, no dead code, judicious use of pandas/numpy vectorisation. Functions and classes have a single, clear responsibility.",
      proficient:
        "Mostly idiomatic Python with minor style or naming inconsistencies. Vectorisation is generally preferred over loops.",
      developing:
        "Code runs but contains anti-patterns: unnecessary loops over DataFrames, mixed naming styles, large functions, or unused imports.",
      beginning:
        "Code is hard to read, contains repeated logic, and shows misunderstanding of pandas/numpy idioms.",
    },
  },
  {
    name: "4. Functional Completeness of Required Modules",
    weight: 16,
    descriptors: {
      exemplary:
        "All four conceptual modules (signal detection, metrics computation, alerting/SLO, dashboard) are fully implemented and exceed minimum requirements with thoughtful additions (e.g., correlation heatmap, summary methods, configurable parameters).",
      proficient:
        "All required modules are implemented and functional. Minor features are missing or simplified, but the package is complete and usable.",
      developing:
        "Two or three modules are functional; at least one is incomplete, missing key methods, or only partially integrated.",
      beginning:
        "Fewer than two modules are usable, or core functionality (e.g., live data ingestion) does not run.",
    },
  },
  {
    name: "5. Error Handling & Robustness",
    weight: 10,
    descriptors: {
      exemplary:
        "Custom exception hierarchy with semantically distinct subclasses. Every public entry point validates inputs and raises typed errors. Edge cases (empty data, division by zero, NaN propagation, insufficient lookback) are explicitly handled and documented.",
      proficient:
        "Most public methods validate inputs and raise informative errors. A few edge cases may slip through but no silent failures.",
      developing:
        "Some validation present but inconsistent. The package may produce confusing tracebacks or silent NaNs in corner cases.",
      beginning:
        "Little or no input validation. Errors are uncaught generic exceptions; silent failures are possible.",
    },
  },
  {
    name: "6. Testing & Empirical Validation",
    weight: 10,
    descriptors: {
      exemplary:
        "Comprehensive test suite covering both happy-path and failure-mode behaviour for every module. Synthetic data is constructed deterministically (fixed seed) with injected anomalies that allow assertions on detection counts. Every error path is exercised at least once.",
      proficient:
        "Tests cover the main behaviours of each module and a representative subset of error paths. Tests pass and are reproducible.",
      developing:
        "Tests exist for some modules but coverage is uneven. Error-path testing is limited.",
      beginning:
        "Few or no tests. Validation relies on visual inspection only.",
    },
  },
  {
    name: "7. Documentation & Pedagogical Clarity",
    weight: 10,
    descriptors: {
      exemplary:
        "Docstrings for every public class and method following a recognised style (NumPy, Google, or reST). Module-level prose explains intent and theoretical motivation. The notebook or report walks the reader from problem statement through implementation, validation, and demonstration without gaps.",
      proficient:
        "Most public APIs are documented with at least a one-line summary and parameter descriptions. The narrative is coherent.",
      developing:
        "Documentation is inconsistent — some methods documented, others bare. The narrative skips key transitions.",
      beginning:
        "Little or no documentation. The reader must infer intent from code.",
    },
  },
  {
    name: "8. Empirical Demonstration with Live Data",
    weight: 10,
    descriptors: {
      exemplary:
        "End-to-end pipeline demonstrated on real, current market data (single asset and multi-asset). All modules participate in the demo, and the output is interpreted in domain-appropriate language (signals contextualised, alerts justified, SLOs evaluated).",
      proficient:
        "Live data demonstration is present and covers most modules. Interpretation of results is accurate but brief.",
      developing:
        "Demonstration uses only one module or only synthetic data; live data integration is incomplete.",
      beginning:
        "No empirical demonstration on real data.",
    },
  },
  {
    name: "9. Visualisation & Information Design",
    weight: 8,
    descriptors: {
      exemplary:
        "Multi-panel dashboard with deliberate visual hierarchy, consistent palette, and meaningful encodings (severity-coloured markers, contextual annotations). Visual choices are justified rather than default.",
      proficient:
        "Charts are clear, correctly labelled, and well composed. Colour and scale choices are reasonable.",
      developing:
        "Charts convey information but lack polish — missing labels, default styling, or cluttered composition.",
      beginning:
        "Visualisations are absent, broken, or actively misleading.",
    },
  },
  {
    name: "10. Presentation, Defence & Reflection",
    weight: 4,
    descriptors: {
      exemplary:
        "Presentation is well-structured, formal, and visually polished. Design decisions and trade-offs are articulated clearly. Limitations are acknowledged with concrete future-work directions. Defence answers questions precisely.",
      proficient:
        "Presentation is organised and competent. Some design rationale is offered; limitations are noted at a high level.",
      developing:
        "Presentation conveys the project but is uneven in pacing or clarity. Reflection is generic.",
      beginning:
        "Presentation lacks structure, or no reflection on design or limitations is offered.",
    },
  },
];

// -----------------------------------------------------------------------------
// DOCUMENT BODY
// -----------------------------------------------------------------------------
const children = [];

// --- Title block --------------------------------------------------------------
children.push(
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 60 },
    children: [
      new TextRun({
        text: "FE 520  |  STEVENS INSTITUTE OF TECHNOLOGY",
        bold: true, color: BURGUNDY, size: 18, font: "Calibri", characterSpacing: 60,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 0, after: 80 },
    children: [
      new TextRun({
        text: "Final Project Evaluation Rubric",
        bold: true, color: NAVY, size: 44, font: "Georgia",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 0, after: 60 },
    children: [
      new TextRun({
        text: "fintel — Financial Telemetry & Observability",
        italic: true, color: BLACK, size: 28, font: "Georgia",
      }),
    ],
  }),
  ruleParagraph(BURGUNDY),
);

// --- Meta block ---------------------------------------------------------------
const metaTable = new Table({
  width: { size: CONTENT_W, type: WidthType.DXA },
  columnWidths: [2400, CONTENT_W - 2400],
  rows: [
    new TableRow({ children: [
      cell("Course",     { bold: true, color: NAVY, width: 2400, size: 20, fill: LIGHT_BURGUNDY }),
      cell("FE 520 — Financial Engineering in Python", { width: CONTENT_W - 2400, size: 20 }),
    ]}),
    new TableRow({ children: [
      cell("Term",       { bold: true, color: NAVY, width: 2400, size: 20, fill: LIGHT_BURGUNDY }),
      cell("Spring 2026",                            { width: CONTENT_W - 2400, size: 20 }),
    ]}),
    new TableRow({ children: [
      cell("Project",    { bold: true, color: NAVY, width: 2400, size: 20, fill: LIGHT_BURGUNDY }),
      cell("fintel — A four-module Python package applying OpenTelemetry observability concepts to quantitative market monitoring",
        { width: CONTENT_W - 2400, size: 20 }),
    ]}),
    new TableRow({ children: [
      cell("Total",      { bold: true, color: NAVY, width: 2400, size: 20, fill: LIGHT_BURGUNDY }),
      cell("100 points  (10 weighted criteria, four-tier scale)", { width: CONTENT_W - 2400, size: 20 }),
    ]}),
    new TableRow({ children: [
      cell("Grading Scale", { bold: true, color: NAVY, width: 2400, size: 20, fill: LIGHT_BURGUNDY }),
      cell("Exemplary 90–100% · Proficient 75–89% · Developing 60–74% · Beginning 0–59%",
        { width: CONTENT_W - 2400, size: 20 }),
    ]}),
  ],
});
children.push(metaTable);

// --- Purpose & instructions ---------------------------------------------------
children.push(
  new Paragraph({ spacing: { before: 240, after: 80 }, children: [
    new TextRun({ text: "Purpose of This Rubric", bold: true, color: NAVY, size: 26, font: "Georgia" }),
  ]}),
  new Paragraph({ spacing: { before: 0, after: 120 }, alignment: AlignmentType.LEFT, children: [
    new TextRun({
      text: "This rubric establishes graduate-level expectations for the FE 520 final project. It is designed to evaluate the conceptual rigour, software engineering quality, and empirical demonstration of a Python package whose scope is intentionally bounded to five permitted libraries (pandas, numpy, matplotlib, datetime, yfinance). Each criterion below is weighted by its relative importance to the learning outcomes of the course; descriptors are stated at four performance levels so that scoring is transparent and reproducible.",
      color: BLACK, size: 22, font: "Calibri",
    }),
  ]}),
  new Paragraph({ spacing: { before: 120, after: 80 }, children: [
    new TextRun({ text: "How to Read the Tables", bold: true, color: NAVY, size: 26, font: "Georgia" }),
  ]}),
  new Paragraph({ spacing: { before: 0, after: 120 }, alignment: AlignmentType.LEFT, children: [
    new TextRun({
      text: "Each criterion is presented as a self-contained block. The burgundy bar names the criterion and shows its point weight. The table beneath it gives the four performance bands, their point ranges, and the descriptor that anchors that band. Scores within a band may be assigned at the evaluator's discretion based on how closely the submission matches the descriptor. The total project score is the sum of all ten criteria.",
      color: BLACK, size: 22, font: "Calibri",
    }),
  ]}),
);

children.push(new Paragraph({ children: [new PageBreak()] }));

// --- Criteria -----------------------------------------------------------------
children.push(
  new Paragraph({ spacing: { before: 0, after: 200 }, children: [
    new TextRun({ text: "Evaluation Criteria", bold: true, color: NAVY, size: 32, font: "Georgia" }),
  ]}),
);

criteria.forEach((c) => {
  const t = tiers(c.weight, c.descriptors);
  criterionTable(c.name, c.weight, t).forEach((p) => children.push(p));
});

// --- Summary table ------------------------------------------------------------
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(
  new Paragraph({ spacing: { before: 0, after: 160 }, children: [
    new TextRun({ text: "Score Summary Sheet", bold: true, color: NAVY, size: 32, font: "Georgia" }),
  ]}),
  new Paragraph({ spacing: { before: 0, after: 160 }, children: [
    new TextRun({
      text: "Use this sheet to record per-criterion scores and the final aggregate. Bands abbreviate the four performance levels: E (Exemplary), P (Proficient), D (Developing), B (Beginning).",
      italic: true, color: BLACK, size: 22, font: "Calibri",
    }),
  ]}),
);

const summaryColW = [3800, 900, 900, 900, CONTENT_W - 3800 - 3 * 900];
const summaryHeader = new TableRow({
  tableHeader: true,
  children: [
    cell("Criterion",     { bold: true, color: WHITE, fill: NAVY, width: summaryColW[0], size: 20 }),
    cell("Weight",        { bold: true, color: WHITE, fill: NAVY, width: summaryColW[1], align: AlignmentType.CENTER, size: 20 }),
    cell("Band",          { bold: true, color: WHITE, fill: NAVY, width: summaryColW[2], align: AlignmentType.CENTER, size: 20 }),
    cell("Score",         { bold: true, color: WHITE, fill: NAVY, width: summaryColW[3], align: AlignmentType.CENTER, size: 20 }),
    cell("Comments",      { bold: true, color: WHITE, fill: NAVY, width: summaryColW[4], size: 20 }),
  ],
});
const summaryRows = [summaryHeader];
criteria.forEach((c, i) => {
  const fill = i % 2 === 0 ? LIGHT_NAVY : null;
  summaryRows.push(new TableRow({ children: [
    cell(c.name,            { bold: false, color: BLACK, fill, width: summaryColW[0], size: 20 }),
    cell(String(c.weight),  { color: BLACK, fill, width: summaryColW[1], align: AlignmentType.CENTER, size: 20 }),
    cell("",                { color: BLACK, fill, width: summaryColW[2], align: AlignmentType.CENTER, size: 20 }),
    cell("",                { color: BLACK, fill, width: summaryColW[3], align: AlignmentType.CENTER, size: 20 }),
    cell("",                { color: BLACK, fill, width: summaryColW[4], size: 20 }),
  ]}));
});
// Total row
summaryRows.push(new TableRow({ children: [
  cell("TOTAL",          { bold: true, color: WHITE, fill: BURGUNDY, width: summaryColW[0], size: 22 }),
  cell("100",            { bold: true, color: WHITE, fill: BURGUNDY, width: summaryColW[1], align: AlignmentType.CENTER, size: 22 }),
  cell("",               { bold: true, color: WHITE, fill: BURGUNDY, width: summaryColW[2], size: 22 }),
  cell("",               { bold: true, color: WHITE, fill: BURGUNDY, width: summaryColW[3], align: AlignmentType.CENTER, size: 22 }),
  cell("",               { bold: true, color: WHITE, fill: BURGUNDY, width: summaryColW[4], size: 22 }),
]}));

children.push(new Table({
  width: { size: CONTENT_W, type: WidthType.DXA },
  columnWidths: summaryColW,
  rows: summaryRows,
}));

// --- Evaluator block ---------------------------------------------------------
children.push(
  new Paragraph({ spacing: { before: 360, after: 120 }, children: [
    new TextRun({ text: "Evaluator Information", bold: true, color: NAVY, size: 26, font: "Georgia" }),
  ]}),
);
const evalRow = (label) => new TableRow({ children: [
  cell(label, { bold: true, color: NAVY, width: 2400, size: 20, fill: LIGHT_BURGUNDY }),
  cell("", { width: CONTENT_W - 2400, size: 20 }),
]});
children.push(new Table({
  width: { size: CONTENT_W, type: WidthType.DXA },
  columnWidths: [2400, CONTENT_W - 2400],
  rows: [
    evalRow("Evaluator Name"),
    evalRow("Date of Evaluation"),
    evalRow("Final Score"),
    evalRow("Letter Grade"),
    evalRow("Signature"),
  ],
}));

// --- Closing note ------------------------------------------------------------
children.push(
  new Paragraph({ spacing: { before: 360, after: 0 }, children: [
    new TextRun({
      text: "This rubric was used both as the evaluative instrument for the fintel project and as the design specification for its accompanying presentation. Each presentation slide maps to one or more rubric criteria, ensuring that the artefact and its assessment share a common analytical structure.",
      italic: true, color: BURGUNDY, size: 20, font: "Calibri",
    }),
  ]}),
);

// -----------------------------------------------------------------------------
// HEADER / FOOTER
// -----------------------------------------------------------------------------
const docHeader = new Header({
  children: [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BURGUNDY, space: 4 } },
      children: [
        new TextRun({ text: "fintel  |  Final Project Evaluation Rubric", color: NAVY, size: 18, font: "Calibri", italic: true }),
        new TextRun({ text: "\t" }),
        new TextRun({ text: "FE 520  |  Spring 2026", color: BURGUNDY, size: 18, font: "Calibri", bold: true }),
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
        new TextRun({ text: "Page ", color: NAVY, size: 18, font: "Calibri" }),
        new TextRun({ children: [PageNumber.CURRENT], color: NAVY, size: 18, font: "Calibri", bold: true }),
        new TextRun({ text: " of ", color: NAVY, size: 18, font: "Calibri" }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], color: NAVY, size: 18, font: "Calibri", bold: true }),
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
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Georgia", color: NAVY },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Georgia", color: NAVY },
        paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 1 } },
    ],
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
  const out = "/Users/maru/Documents/fintel/presentation/fintel_FE520_rubric.docx";
  fs.writeFileSync(out, buf);
  console.log("Built:", out);
}).catch((e) => { console.error(e); process.exit(1); });
