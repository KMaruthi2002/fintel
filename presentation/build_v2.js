// fintel — FE 520 Final Project Presentation (v2)
// Improved: floating decoratives, dynamic layouts, depth via shadows.
// Palette: Burgundy / Navy / White / Black ONLY.

const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaChartLine, FaBell, FaBolt, FaTachometerAlt, FaShieldAlt, FaCheckCircle,
  FaExclamationTriangle, FaCogs, FaDatabase, FaLayerGroup, FaSearch,
  FaCode, FaBookOpen, FaFlask, FaProjectDiagram, FaQuoteLeft,
  FaArrowRight, FaCircle, FaDotCircle, FaWaveSquare, FaSitemap,
  FaPython, FaCubes, FaStream, FaHeartbeat, FaCrosshairs,
} = require("react-icons/fa");

// =============================================================================
// PALETTE
// =============================================================================
const BURGUNDY = "7B1E2D";
const BURGUNDY_DEEP = "5C1521";
const NAVY = "0B2545";
const NAVY_DEEP = "06182E";
const WHITE = "FFFFFF";
const PAPER = "FAF7F2";
const INK = "1A1A1A";

const HEADER_FONT = "Georgia";
const BODY_FONT = "Calibri";

// Reusable shadow factories — pptxgenjs mutates shadow objects in place,
// so each call must return a fresh object.
const softShadow = () => ({
  type: "outer", color: "000000", blur: 12, offset: 4, angle: 90, opacity: 0.18,
});
const sharpShadow = () => ({
  type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.22,
});
const liftedShadow = () => ({
  type: "outer", color: "000000", blur: 18, offset: 6, angle: 90, opacity: 0.20,
});

// =============================================================================
// ICON RENDERING
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

// Render a custom decorative SVG (sparkline, dots, etc.) to PNG
async function customSvgPng(svgString) {
  const buf = await sharp(Buffer.from(svgString)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// =============================================================================
// FLOATING DECORATIVES
// =============================================================================
function floatingCircle(slide, x, y, d, color, opacity) {
  slide.addShape("ellipse", {
    x, y, w: d, h: d,
    fill: { color, transparency: Math.round((1 - opacity) * 100) },
    line: { color, width: 0, transparency: 100 },
  });
}

function floatingDots(slide, points, color, opacity = 0.5) {
  points.forEach(([x, y, d]) => floatingCircle(slide, x, y, d, color, opacity));
}

function diagonalAccent(slide, x1, y1, x2, y2, color, weight = 1.5, opacity = 0.6) {
  slide.addShape("line", {
    x: x1, y: y1, w: x2 - x1, h: y2 - y1,
    line: { color, width: weight, transparency: Math.round((1 - opacity) * 100) },
  });
}

// =============================================================================
// COMMON SLIDE FURNITURE
// =============================================================================
function pageNumber(slide, n, total) {
  slide.addText(`${String(n).padStart(2, "0")} ⁄ ${String(total).padStart(2, "0")}`, {
    x: 11.6, y: 7.15, w: 1.4, h: 0.25,
    fontSize: 9, fontFace: BODY_FONT, color: NAVY,
    align: "right", margin: 0,
  });
}

function footerBar(slide) {
  slide.addShape("rect", {
    x: 0, y: 7.35, w: 13.3, h: 0.15,
    fill: { color: NAVY }, line: { color: NAVY, width: 0 },
  });
  slide.addShape("rect", {
    x: 0, y: 7.35, w: 1.6, h: 0.15,
    fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
  });
  slide.addText("fintel  ·  Financial Telemetry & Observability", {
    x: 0.6, y: 7.05, w: 8.0, h: 0.25,
    fontSize: 9, fontFace: BODY_FONT, color: NAVY, italic: true, margin: 0,
  });
}

function sectionLabel(slide, text) {
  slide.addText(text, {
    x: 0.6, y: 0.4, w: 8.0, h: 0.3,
    fontSize: 11, fontFace: BODY_FONT, color: BURGUNDY,
    bold: true, charSpacing: 6, margin: 0,
  });
  // Tiny burgundy square next to label
  slide.addShape("rect", {
    x: 0.4, y: 0.5, w: 0.1, h: 0.1,
    fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
  });
}

function slideTitle(slide, text, subtitle = null) {
  slide.addText(text, {
    x: 0.6, y: 0.75, w: 12.1, h: 1.1,
    fontSize: 30, fontFace: HEADER_FONT, color: NAVY,
    bold: true, margin: 0, valign: "top",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6, y: 1.85, w: 12.1, h: 0.4,
      fontSize: 13, fontFace: BODY_FONT, color: BURGUNDY,
      italic: true, margin: 0,
    });
  }
  // Burgundy short rule
  slide.addShape("rect", {
    x: 0.6, y: subtitle ? 2.3 : 1.95, w: 0.6, h: 0.05,
    fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
  });
}

// Frosted card with shadow (used widely)
function card(slide, x, y, w, h, fill = WHITE, accent = BURGUNDY) {
  slide.addShape("rect", {
    x, y, w, h,
    fill: { color: fill },
    line: { color: "DDDDDD", width: 0.5 },
    shadow: softShadow(),
  });
  slide.addShape("rect", {
    x, y, w: 0.08, h,
    fill: { color: accent }, line: { color: accent, width: 0 },
  });
}

// =============================================================================
// MAIN BUILD
// =============================================================================
async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
  pres.author = "FE 520 Final Project";
  pres.title = "fintel: Financial Telemetry & Observability";
  pres.company = "FE 520 · Spring 2026";

  // Pre-render icon set
  const ic = {
    chart:    await iconPng(FaChartLine,         BURGUNDY),
    chartW:   await iconPng(FaChartLine,         WHITE),
    bell:     await iconPng(FaBell,              BURGUNDY),
    bellW:    await iconPng(FaBell,              WHITE),
    bolt:     await iconPng(FaBolt,              BURGUNDY),
    boltW:    await iconPng(FaBolt,              WHITE),
    gauge:    await iconPng(FaTachometerAlt,     BURGUNDY),
    gaugeW:   await iconPng(FaTachometerAlt,     WHITE),
    shield:   await iconPng(FaShieldAlt,         BURGUNDY),
    shieldW:  await iconPng(FaShieldAlt,         WHITE),
    check:    await iconPng(FaCheckCircle,       BURGUNDY),
    cogs:     await iconPng(FaCogs,              WHITE),
    db:       await iconPng(FaDatabase,          WHITE),
    layer:    await iconPng(FaLayerGroup,        WHITE),
    code:     await iconPng(FaCode,              WHITE),
    flask:    await iconPng(FaFlask,             WHITE),
    proj:     await iconPng(FaProjectDiagram,    WHITE),
    quote:    await iconPng(FaQuoteLeft,         BURGUNDY),
    quoteW:   await iconPng(FaQuoteLeft,         WHITE),
    arrow:    await iconPng(FaArrowRight,        BURGUNDY),
    wave:     await iconPng(FaWaveSquare,        BURGUNDY),
    waveW:    await iconPng(FaWaveSquare,        WHITE),
    sitemap:  await iconPng(FaSitemap,           BURGUNDY),
    sitemapW: await iconPng(FaSitemap,           WHITE),
    cubes:    await iconPng(FaCubes,             WHITE),
    stream:   await iconPng(FaStream,            WHITE),
    heart:    await iconPng(FaHeartbeat,         BURGUNDY),
    heartW:   await iconPng(FaHeartbeat,         WHITE),
    cross:    await iconPng(FaCrosshairs,        WHITE),
    python:   await iconPng(FaPython,            WHITE),
  };

  // Decorative SVGs — sparkline, scatter, ring
  const sparklineSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="200" viewBox="0 0 600 200">
    <polyline points="0,150 40,140 80,120 120,135 160,90 200,110 240,70 280,95 320,55 360,80 400,40 440,70 480,30 520,55 560,20 600,40"
      fill="none" stroke="#7B1E2D" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" opacity="0.85"/>
    <polyline points="0,150 40,140 80,120 120,135 160,90 200,110 240,70 280,95 320,55 360,80 400,40 440,70 480,30 520,55 560,20 600,40 600,200 0,200"
      fill="#7B1E2D" opacity="0.10"/>
  </svg>`;
  const sparklineLight = `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="200" viewBox="0 0 600 200">
    <polyline points="0,150 40,140 80,120 120,135 160,90 200,110 240,70 280,95 320,55 360,80 400,40 440,70 480,30 520,55 560,20 600,40"
      fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>
  </svg>`;
  const scatterSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    ${[...Array(40)].map(() => {
      const cx = Math.random() * 380 + 10;
      const cy = Math.random() * 380 + 10;
      const r = 2 + Math.random() * 4;
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="#FFFFFF" opacity="${(0.15 + Math.random() * 0.35).toFixed(2)}"/>`;
    }).join("")}
  </svg>`;
  const ringSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <circle cx="200" cy="200" r="180" fill="none" stroke="#7B1E2D" stroke-width="2" opacity="0.55"/>
    <circle cx="200" cy="200" r="140" fill="none" stroke="#7B1E2D" stroke-width="1.5" opacity="0.40" stroke-dasharray="6 4"/>
    <circle cx="200" cy="200" r="100" fill="none" stroke="#7B1E2D" stroke-width="1" opacity="0.30"/>
  </svg>`;

  const dec = {
    sparkline:      await customSvgPng(sparklineSvg),
    sparklineLight: await customSvgPng(sparklineLight),
    scatter:        await customSvgPng(scatterSvg),
    ring:           await customSvgPng(ringSvg),
  };

  const TOTAL = 16;
  let n = 0;

  // ---------------------------------------------------------------------------
  // SLIDE 1 — TITLE HERO (full bleed navy with floating decoratives)
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: NAVY_DEEP };

    // Floating ring graphic — top right
    s.addImage({ data: dec.ring, x: 9.5, y: -1.0, w: 5.0, h: 5.0, transparency: 30 });
    // Floating ring graphic — bottom left small
    s.addImage({ data: dec.ring, x: -1.5, y: 4.5, w: 3.5, h: 3.5, transparency: 50 });
    // Scatter dots overlay
    s.addImage({ data: dec.scatter, x: 7.5, y: 0.5, w: 5.0, h: 5.0, transparency: 60 });
    // Sparkline at bottom
    s.addImage({ data: dec.sparklineLight, x: 0.5, y: 6.0, w: 12.5, h: 1.0, transparency: 25 });

    // Decorative floating burgundy circle (moved higher to avoid date stamp)
    floatingCircle(s, 10.8, 4.7, 1.4, BURGUNDY, 0.85);
    floatingCircle(s, 11.9, 5.6, 0.4, WHITE, 0.55);
    floatingCircle(s, 0.3, 0.5, 0.7, BURGUNDY, 0.8);

    // Diagonal burgundy stripe
    s.addShape("rect", {
      x: -1, y: 6.5, w: 16, h: 0.05,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 }, rotate: -3,
    });

    // Left burgundy bar
    s.addShape("rect", {
      x: 0, y: 0, w: 0.4, h: 7.5,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });

    // Section label
    s.addText("FE 520  ·  FINANCIAL ENGINEERING IN PYTHON", {
      x: 1.0, y: 1.1, w: 11, h: 0.4,
      fontSize: 12, fontFace: BODY_FONT, color: WHITE,
      bold: true, charSpacing: 8, margin: 0,
    });

    // Burgundy accent line under section label
    s.addShape("rect", {
      x: 1.0, y: 1.5, w: 0.8, h: 0.04,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });

    // fintel wordmark
    s.addText("fintel", {
      x: 1.0, y: 1.8, w: 11, h: 1.6,
      fontSize: 110, fontFace: HEADER_FONT, color: WHITE,
      bold: true, italic: true, margin: 0,
    });

    // Subtitle
    s.addText("Financial Telemetry & Observability", {
      x: 1.0, y: 3.45, w: 11, h: 0.6,
      fontSize: 30, fontFace: HEADER_FONT, color: WHITE, margin: 0,
    });

    // Decorative line
    s.addShape("rect", {
      x: 1.0, y: 4.3, w: 1.4, h: 0.05,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });

    s.addText(
      "An OpenTelemetry-Inspired Python Package for Quantitative Market Monitoring",
      {
        x: 1.0, y: 4.45, w: 11, h: 0.5,
        fontSize: 16, fontFace: BODY_FONT, color: WHITE, italic: true, margin: 0,
      }
    );

    // Author / course block in card
    s.addShape("rect", {
      x: 1.0, y: 5.55, w: 5.6, h: 1.3,
      fill: { color: NAVY }, line: { color: BURGUNDY, width: 1.25 },
    });
    s.addText(
      [
        { text: "AUTHOR    ", options: { bold: true, color: BURGUNDY } },
        { text: "Maruthi Kunchala", options: { breakLine: true } },
        { text: "COURSE    ", options: { bold: true, color: BURGUNDY } },
        { text: "FE 520 · Stevens Institute of Technology", options: { breakLine: true } },
        { text: "TERM      ", options: { bold: true, color: BURGUNDY } },
        { text: "Spring 2026", options: {} },
      ],
      {
        x: 1.2, y: 5.65, w: 5.4, h: 1.1,
        fontSize: 12, fontFace: BODY_FONT, color: WHITE, margin: 0,
        paraSpaceAfter: 4,
      }
    );

    // Date stamp lower right
    s.addText("APRIL 26, 2026", {
      x: 9.0, y: 6.55, w: 3.8, h: 0.4,
      fontSize: 11, fontFace: BODY_FONT, color: WHITE,
      align: "right", italic: true, margin: 0, charSpacing: 4,
    });
  }

  // ---------------------------------------------------------------------------
  // SLIDE 2 — AGENDA (numbered floating chips)
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    sectionLabel(s, "AGENDA");
    slideTitle(s, "Outline of Discussion");

    // Decorative sparkline floating bottom right
    s.addImage({ data: dec.sparkline, x: 8.5, y: 5.6, w: 4.5, h: 1.6, transparency: 60 });
    // Floating circles right side
    floatingCircle(s, 12.4, 1.0, 0.7, BURGUNDY, 0.15);
    floatingCircle(s, 11.8, 6.5, 0.4, NAVY, 0.10);

    const items = [
      { num: "I",   label: "Problem Statement & Motivation" },
      { num: "II",  label: "Theoretical Foundation · The Three Pillars" },
      { num: "III", label: "System Architecture & Data Flow" },
      { num: "IV",  label: "Module Walkthrough · Signals, Metrics, Alerts, Dashboard" },
      { num: "V",   label: "Engineering Practices · Errors, Tests, Documentation" },
      { num: "VI",  label: "Empirical Demonstration on Live Market Data" },
      { num: "VII", label: "Design Decisions, Limitations, and Future Work" },
    ];

    let y = 2.65;
    items.forEach((it, i) => {
      // Chip — burgundy circle with roman numeral
      s.addShape("ellipse", {
        x: 0.7, y: y, w: 0.6, h: 0.6,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
        shadow: sharpShadow(),
      });
      s.addText(it.num, {
        x: 0.7, y: y, w: 0.6, h: 0.6,
        fontSize: 12, fontFace: HEADER_FONT, color: WHITE,
        bold: true, italic: true, align: "center", valign: "middle", margin: 0,
      });
      // White card
      s.addShape("rect", {
        x: 1.55, y: y + 0.05, w: 10.5, h: 0.5,
        fill: { color: WHITE }, line: { color: "DDDDDD", width: 0.5 },
        shadow: softShadow(),
      });
      // Burgundy left accent on card
      s.addShape("rect", {
        x: 1.55, y: y + 0.05, w: 0.06, h: 0.5,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
      });
      s.addText(it.label, {
        x: 1.75, y: y + 0.05, w: 10.2, h: 0.5,
        fontSize: 13, fontFace: BODY_FONT, color: NAVY,
        valign: "middle", margin: 0,
      });
      y += 0.6;
    });

    footerBar(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 3 — PROBLEM & THESIS (split with floating quote mark)
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };

    // Floating decoratives
    floatingCircle(s, 11.5, 0.3, 1.4, BURGUNDY, 0.10);
    floatingCircle(s, 12.5, 6.2, 0.8, NAVY, 0.08);

    sectionLabel(s, "I.  PROBLEM STATEMENT");
    slideTitle(s, "Why Should We Monitor Markets Like Production Systems?");

    // Big floating quote mark — burgundy, semi-transparent
    s.addImage({ data: ic.quote, x: 0.5, y: 2.3, w: 1.2, h: 1.2, transparency: 75 });

    // Left card — THE GAP (navy fill, white text)
    s.addShape("rect", {
      x: 0.6, y: 2.6, w: 5.95, h: 4.0,
      fill: { color: NAVY }, line: { color: NAVY, width: 0 },
      shadow: liftedShadow(),
    });
    // Burgundy corner accent
    s.addShape("rect", {
      x: 0.6, y: 2.6, w: 1.5, h: 0.06,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });
    s.addText("THE GAP", {
      x: 1.0, y: 2.85, w: 5.5, h: 0.35,
      fontSize: 12, fontFace: BODY_FONT, color: BURGUNDY,
      bold: true, charSpacing: 5, margin: 0,
    });
    s.addText(
      [
        { text: "Traditional financial analysis tools treat market data as flat numerical streams.", options: { breakLine: true } },
        { text: "", options: { breakLine: true } },
        { text: "Modern software engineering, through ", options: {} },
        { text: "OpenTelemetry", options: { bold: true, italic: true, color: "FFC9D2" } },
        { text: ", has solved the same fundamental problem for distributed systems: structured detection, aggregation, and alerting on time-series anomalies.", options: {} },
      ],
      {
        x: 1.0, y: 3.3, w: 5.3, h: 3.1,
        fontSize: 13, fontFace: BODY_FONT, color: WHITE,
        valign: "top", margin: 0, paraSpaceAfter: 6,
      }
    );

    // Right card — THE THESIS (white fill, dark text)
    s.addShape("rect", {
      x: 6.75, y: 2.6, w: 5.95, h: 4.0,
      fill: { color: WHITE }, line: { color: BURGUNDY, width: 1.25 },
      shadow: liftedShadow(),
    });
    s.addShape("rect", {
      x: 6.75, y: 2.6, w: 1.5, h: 0.06,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });
    s.addText("THE THESIS", {
      x: 7.15, y: 2.85, w: 5.5, h: 0.35,
      fontSize: 12, fontFace: BODY_FONT, color: BURGUNDY,
      bold: true, charSpacing: 5, margin: 0,
    });
    s.addText(
      [
        { text: "Financial markets are ", options: {} },
        { text: "distributed systems", options: { bold: true, color: NAVY } },
        { text: " of capital flow. Every observability primitive (traces, metrics, alerts, dashboards) has a direct, useful analogue in quantitative finance.", options: { breakLine: true } },
        { text: "", options: { breakLine: true } },
        { text: "fintel", options: { bold: true, italic: true, color: BURGUNDY } },
        { text: " operationalises this analogy as a ", options: {} },
        { text: "four-module Python package", options: { bold: true, color: NAVY } },
        { text: " for event-driven, threshold-aware market monitoring.", options: {} },
      ],
      {
        x: 7.15, y: 3.3, w: 5.3, h: 3.1,
        fontSize: 13, fontFace: BODY_FONT, color: INK,
        valign: "top", margin: 0, paraSpaceAfter: 6,
      }
    );

    // Connector arrow between cards
    s.addImage({ data: ic.arrow, x: 6.32, y: 4.4, w: 0.4, h: 0.4 });

    footerBar(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 4 — THREE PILLARS (offset cards with depth)
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };

    floatingCircle(s, -0.5, 6.0, 1.5, NAVY, 0.05);
    floatingCircle(s, 12.5, 0.2, 1.0, BURGUNDY, 0.10);

    sectionLabel(s, "II.  THEORETICAL FOUNDATION");
    slideTitle(s, "The Three Pillars of Observability, Mapped to Finance");

    const cols = [
      { title: "TRACES & SPANS", icon: ic.boltW,
        otel: "Discrete events with start, end, severity, and metadata that record what happened in a system.",
        fin: "Detected market anomalies (volatility spikes, volume surges, breakouts, gaps) as time-stamped Signal objects." },
      { title: "METRICS",         icon: ic.gaugeW,
        otel: "Numerical measurements aggregated over configurable time windows (counters, gauges, histograms).",
        fin: "Technical indicators with rolling-window aggregation: SMA, EMA, RSI, Bollinger Bands, Sharpe, Drawdown." },
      { title: "ALERTING & SLOs", icon: ic.bellW,
        otel: "Threshold-based rules that fire when service-level objectives are breached.",
        fin: "Portfolio risk rules and SLOs (e.g. 'Sharpe ≥ 1.0' or 'Drawdown ≤ 15%') evaluated against the live MetricsEngine." },
    ];

    const cardW = 3.95, gap = 0.25, startX = 0.6;
    cols.forEach((c, i) => {
      const x = startX + i * (cardW + gap);
      const yOffset = i === 1 ? -0.06 : i === 2 ? 0.03 : 0.0; // subtler stagger
      const cardY = 2.55 + yOffset;

      // Card body
      s.addShape("rect", {
        x: x, y: cardY + 0.85, w: cardW, h: 3.5,
        fill: { color: WHITE }, line: { color: "DDDDDD", width: 0.5 },
        shadow: liftedShadow(),
      });
      // Burgundy left accent
      s.addShape("rect", {
        x: x, y: cardY + 0.85, w: 0.08, h: 3.5,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
      });
      // Header band — navy
      s.addShape("rect", {
        x: x, y: cardY, w: cardW, h: 0.85,
        fill: { color: NAVY }, line: { color: NAVY, width: 0 },
        shadow: sharpShadow(),
      });
      // Floating icon circle (burgundy outline ring on header)
      s.addShape("ellipse", {
        x: x + 0.25, y: cardY + 0.18, w: 0.5, h: 0.5,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
      });
      s.addImage({ data: c.icon, x: x + 0.32, y: cardY + 0.25, w: 0.36, h: 0.36 });
      // Title
      s.addText(c.title, {
        x: x + 0.85, y: cardY, w: cardW - 1.0, h: 0.85,
        fontSize: 14, fontFace: HEADER_FONT, color: WHITE,
        bold: true, charSpacing: 3, valign: "middle", margin: 0,
      });

      // Body — In OpenTelemetry
      s.addText("IN OPENTELEMETRY", {
        x: x + 0.25, y: cardY + 1.0, w: cardW - 0.4, h: 0.3,
        fontSize: 9, fontFace: BODY_FONT, color: BURGUNDY,
        bold: true, charSpacing: 4, margin: 0,
      });
      s.addText(c.otel, {
        x: x + 0.25, y: cardY + 1.3, w: cardW - 0.4, h: 1.3,
        fontSize: 12, fontFace: BODY_FONT, color: INK, margin: 0,
      });
      // Divider line
      s.addShape("line", {
        x: x + 0.25, y: cardY + 2.7, w: cardW - 0.5, h: 0,
        line: { color: BURGUNDY, width: 0.6, transparency: 50 },
      });
      // Body — In fintel
      s.addText("IN FINTEL", {
        x: x + 0.25, y: cardY + 2.8, w: cardW - 0.4, h: 0.3,
        fontSize: 9, fontFace: BODY_FONT, color: BURGUNDY,
        bold: true, charSpacing: 4, margin: 0,
      });
      s.addText(c.fin, {
        x: x + 0.25, y: cardY + 3.1, w: cardW - 0.4, h: 1.2,
        fontSize: 12, fontFace: BODY_FONT, color: INK, margin: 0,
      });
    });

    footerBar(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 5 — ARCHITECTURE (improved diagram with shadows + decoratives)
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };

    floatingCircle(s, 12.0, 1.5, 0.8, BURGUNDY, 0.08);
    floatingCircle(s, -0.3, 4.0, 1.2, NAVY, 0.06);
    s.addImage({ data: dec.sparkline, x: 8.0, y: 6.4, w: 5.0, h: 0.7, transparency: 75 });

    sectionLabel(s, "III.  ARCHITECTURE");
    slideTitle(s, "Data Flow & Component Composition");

    const drawNode = (x, y, w, h, title, sub, fill, textColor, isBurgundy = false) => {
      s.addShape("roundRect", {
        x, y, w, h,
        fill: { color: fill }, line: { color: isBurgundy ? BURGUNDY : NAVY, width: 1.25 },
        rectRadius: 0.08, shadow: liftedShadow(),
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

    // Source node
    drawNode(5.4, 2.4, 2.5, 0.85, "yfinance", "OHLCV DataFrame", NAVY, WHITE);

    // Three module nodes
    drawNode(0.8, 3.85, 2.6, 0.9, "SignalDetector", "Module 1 · Spans", WHITE, NAVY);
    drawNode(5.4, 3.85, 2.5, 0.9, "MetricsEngine", "Module 2 · Metrics", WHITE, NAVY);
    drawNode(9.9, 3.85, 2.6, 0.9, "AlertEngine + SLO", "Module 3 · Alerting", WHITE, NAVY);

    // Bottom dashboard node — burgundy
    drawNode(4.65, 5.7, 4.0, 0.95, "Dashboard", "Module 4 · Multi-panel observability", BURGUNDY, WHITE, true);

    // Arrows from source
    drawArrow(6.65, 3.25, 2.1, 3.85);
    drawArrow(6.65, 3.25, 6.65, 3.85);
    drawArrow(6.65, 3.25, 11.2, 3.85);

    // Metrics → Alerts
    drawArrow(7.9, 4.3, 9.9, 4.3);

    // To dashboard
    drawArrow(2.1, 4.75, 5.4, 5.7);
    drawArrow(6.65, 4.75, 6.65, 5.7);
    drawArrow(11.2, 4.75, 7.9, 5.7);

    // Caption
    s.addText(
      "Each module is independently testable and composable. The Dashboard depends on the other three; the others depend only on a validated OHLCV input.",
      {
        x: 0.6, y: 6.85, w: 12.1, h: 0.35,
        fontSize: 10, fontFace: BODY_FONT, color: INK,
        italic: true, align: "center", margin: 0,
      }
    );

    footerBar(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // Module slide helper (refreshed) — used for slides 6–9
  // ---------------------------------------------------------------------------
  const moduleSlide = (sectionLbl, title, subtitle, leftHeader, leftBullets,
                       rightHeader, rightBullets, iconImg, accentNum) => {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };

    floatingCircle(s, 12.4, 0.4, 0.9, BURGUNDY, 0.08);
    floatingCircle(s, -0.4, 5.5, 1.5, NAVY, 0.06);

    sectionLabel(s, sectionLbl);
    slideTitle(s, title, subtitle);

    // Big floating module number on right (very faint)
    s.addText(accentNum, {
      x: 11.0, y: 1.0, w: 2.0, h: 1.6,
      fontSize: 130, fontFace: HEADER_FONT, color: BURGUNDY,
      bold: true, italic: true, align: "right", margin: 0,
      transparency: 88,
    });

    // Left card
    s.addShape("rect", {
      x: 0.6, y: 2.6, w: 5.95, h: 4.25,
      fill: { color: WHITE }, line: { color: "DDDDDD", width: 0.5 },
      shadow: liftedShadow(),
    });
    s.addShape("rect", {
      x: 0.6, y: 2.6, w: 0.08, h: 4.25,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });
    // Floating icon circle on card
    s.addShape("ellipse", {
      x: 0.85, y: 2.78, w: 0.5, h: 0.5,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
      shadow: sharpShadow(),
    });
    s.addImage({ data: iconImg, x: 0.92, y: 2.85, w: 0.36, h: 0.36, transparency: 0 });
    // Recolor — actually re-render iconImg at white isn't in `iconImg` param; instead we'll leave burgundy icon on burgundy circle (loses contrast).
    // To make the icon visible against the burgundy circle, we use a white version of the icon if available.
    // The caller passes a white icon variant when intended; we accept iconImg as-is.

    s.addText(leftHeader, {
      x: 1.5, y: 2.78, w: 4.85, h: 0.5,
      fontSize: 14, fontFace: HEADER_FONT, color: NAVY,
      bold: true, valign: "middle", margin: 0,
    });
    s.addText(
      leftBullets.map((b, i) => ({
        text: b,
        options: { bullet: { code: "25A0" }, breakLine: i < leftBullets.length - 1 },
      })),
      {
        x: 0.85, y: 3.4, w: 5.5, h: 3.3,
        fontSize: 12, fontFace: BODY_FONT, color: INK,
        paraSpaceAfter: 6, margin: 0,
      }
    );

    // Right card
    s.addShape("rect", {
      x: 6.75, y: 2.6, w: 5.95, h: 4.25,
      fill: { color: WHITE }, line: { color: "DDDDDD", width: 0.5 },
      shadow: liftedShadow(),
    });
    s.addShape("rect", {
      x: 6.75, y: 2.6, w: 0.08, h: 4.25,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });
    s.addText(rightHeader, {
      x: 7.0, y: 2.78, w: 5.5, h: 0.5,
      fontSize: 14, fontFace: HEADER_FONT, color: NAVY,
      bold: true, valign: "middle", margin: 0,
    });
    s.addText(
      rightBullets.map((b, i) => ({
        text: b,
        options: { bullet: { code: "25A0" }, breakLine: i < rightBullets.length - 1 },
      })),
      {
        x: 7.0, y: 3.4, w: 5.5, h: 3.3,
        fontSize: 12, fontFace: BODY_FONT, color: INK,
        paraSpaceAfter: 6, margin: 0,
      }
    );

    footerBar(s);
    pageNumber(s, n, TOTAL);
  };

  // We need a white variant of icons for the burgundy circles — make small white versions
  const icW = {
    bolt:  await iconPng(FaBolt,           WHITE),
    gauge: await iconPng(FaTachometerAlt,  WHITE),
    bell:  await iconPng(FaBell,           WHITE),
    chart: await iconPng(FaChartLine,      WHITE),
  };

  // SLIDE 6 — SignalDetector
  moduleSlide(
    "IV.  MODULE I  ·  SIGNALS",
    "SignalDetector: Market Anomalies as Spans",
    "Each detected event is a structured object with timing, severity, and metadata, analogous to an OpenTelemetry Span.",
    "Detection Methods",
    [
      "detect_volatility_spikes(): rolling σ above n-std threshold",
      "detect_volume_surges(): volume above multiplier of rolling mean",
      "detect_price_breakouts(): price exceeding Bollinger Band envelope",
      "detect_gap_events(): opening gaps beyond percentage threshold",
      "get_all_signals(): composite detection, time-sorted output",
    ],
    "Signal Object Schema",
    [
      "ticker: instrument identifier",
      "signal_type: categorical event class",
      "timestamp: pandas DatetimeIndex value",
      "severity: info, warning, or critical (OTel convention)",
      "value and threshold: observed magnitude vs. trigger level",
      "metadata: contextual dictionary (window size, multiplier, etc.)",
    ],
    icW.bolt, "I"
  );

  // SLIDE 7 — MetricsEngine
  moduleSlide(
    "IV.  MODULE II  ·  METRICS",
    "MetricsEngine: Indicators as Metric Instruments",
    "Lazy-evaluated, internally cached technical indicators with configurable rolling-window aggregation.",
    "Supported Metrics",
    [
      "Simple Moving Average (SMA) and Exponential Moving Average (EMA)",
      "Bollinger Bands: upper, middle, lower envelopes",
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
      "Returns native pandas Series, composable with downstream code",
      "Numerical safeguards: NaN handling and division-by-zero guards",
    ],
    icW.gauge, "II"
  );

  // SLIDE 8 — AlertEngine
  moduleSlide(
    "IV.  MODULE III  ·  ALERTS",
    "AlertEngine & SLO: Risk Rules as Reliability Targets",
    "Threshold-based evaluation of MetricsEngine output, modelled on production SRE alerting and Service-Level Objectives.",
    "AlertEngine · Triggered Notifications",
    [
      "add_rule(name, metric, condition, threshold, severity)",
      "Nine registered metric extractors (RSI, Sharpe, drawdown, etc.)",
      "evaluate(metrics_engine) returns a list of Alert objects",
      "summary(): human-readable, severity-grouped report",
      "Defensive duplicate-name and unknown-metric guards",
    ],
    "SLO · Service-Level Objectives",
    [
      "Defines a measurable performance target for a portfolio",
      "check() returns met-status, current value, target, and margin",
      "Applies SRE error-budget thinking to risk management",
      "Example targets: 'Sharpe ≥ 1.0' or 'Drawdown ≤ -15%'",
      "Composable with AlertEngine for layered governance",
    ],
    icW.bell, "III"
  );

  // SLIDE 9 — Dashboard
  moduleSlide(
    "IV.  MODULE IV  ·  DASHBOARD",
    "Dashboard: A Single-Pane-of-Glass for Risk",
    "Multi-panel matplotlib composition modelled on Grafana, uniting price, indicators, volume, health, and alerts.",
    "Five Panels in One Figure",
    [
      "Price panel: close-price line with severity-coloured signal markers",
      "Technical panel: SMA, EMA, and Bollinger Band overlay",
      "Volume panel: bars coloured up/down with surge highlights",
      "Health panel: Sharpe, RSI, drawdown, return, volatility readouts",
      "Alert timeline: horizontal bar view of triggered rules",
    ],
    "Cross-Asset Capability",
    [
      "plot_correlation_heatmap(): multi-ticker return correlation matrix",
      "Static method enables ad-hoc portfolio-level analysis",
      "Annotated cells with diverging RdYlGn colormap",
      "Validates each ticker's OHLCV schema before computation",
      "Output is a returned matplotlib Figure for further export",
    ],
    icW.chart, "IV"
  );

  // ---------------------------------------------------------------------------
  // SLIDE 10 — ERROR HIERARCHY (improved tree with floating shield)
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };

    floatingCircle(s, 12.5, 0.5, 0.8, BURGUNDY, 0.10);
    floatingCircle(s, -0.3, 6.0, 1.4, NAVY, 0.06);

    sectionLabel(s, "V.  ENGINEERING PRACTICES");
    slideTitle(s, "Defensive Design: A Custom Exception Hierarchy");

    // Floating shield icon top-right behind content
    s.addImage({ data: ic.shield, x: 11.6, y: 1.3, w: 1.2, h: 1.2, transparency: 80 });

    s.addText("EXCEPTION HIERARCHY", {
      x: 0.6, y: 2.55, w: 6.0, h: 0.3,
      fontSize: 11, fontFace: BODY_FONT, color: BURGUNDY,
      bold: true, charSpacing: 4, margin: 0,
    });

    // Root navy box
    s.addShape("roundRect", {
      x: 0.6, y: 2.95, w: 5.7, h: 0.75,
      fill: { color: NAVY }, line: { color: NAVY, width: 0 },
      rectRadius: 0.06, shadow: liftedShadow(),
    });
    s.addText("FintelError  (base)", {
      x: 0.6, y: 2.95, w: 5.7, h: 0.75,
      fontSize: 16, fontFace: HEADER_FONT, color: WHITE,
      bold: true, align: "center", valign: "middle", margin: 0,
    });

    // Connectors (curved-look using single line each)
    [1.0, 2.95, 4.85].forEach((cx) => {
      s.addShape("line", {
        x: 3.45, y: 3.7, w: cx + 0.6 - 3.45, h: 0.45,
        line: { color: BURGUNDY, width: 1.25 },
      });
    });

    const children = [
      ["DataValidationError", 0.6],
      ["InsufficientDataError", 2.55],
      ["InvalidParameterError", 4.45],
    ];
    children.forEach(([nm, x]) => {
      s.addShape("roundRect", {
        x: x, y: 4.15, w: 1.85, h: 0.75,
        fill: { color: WHITE }, line: { color: BURGUNDY, width: 1.0 },
        rectRadius: 0.06, shadow: sharpShadow(),
      });
      s.addText(nm, {
        x: x, y: 4.15, w: 1.85, h: 0.75,
        fontSize: 10, fontFace: BODY_FONT, color: NAVY,
        bold: true, align: "center", valign: "middle", margin: 0,
      });
    });

    // Notes
    s.addText(
      [
        { text: "DataValidationError", options: { bold: true, color: BURGUNDY } },
        { text: ": schema, type, or shape violations on the input DataFrame.", options: { breakLine: true } },
        { text: "InsufficientDataError", options: { bold: true, color: BURGUNDY } },
        { text: ": request exceeds available history (e.g. window > len).", options: { breakLine: true } },
        { text: "InvalidParameterError", options: { bold: true, color: BURGUNDY } },
        { text: ": out-of-range or wrong-type function arguments.", options: {} },
      ],
      {
        x: 0.6, y: 5.2, w: 5.95, h: 1.7,
        fontSize: 11, fontFace: BODY_FONT, color: INK,
        paraSpaceAfter: 5, margin: 0,
      }
    );

    // Right column — Why a hierarchy
    s.addText("WHY A HIERARCHY?", {
      x: 6.75, y: 2.55, w: 6.0, h: 0.3,
      fontSize: 11, fontFace: BODY_FONT, color: BURGUNDY,
      bold: true, charSpacing: 4, margin: 0,
    });

    const reasons = [
      ["1", "Granular catching", "Callers can handle a missing column differently from an out-of-range parameter."],
      ["2", "Contract clarity", "Each public method's docstring names the exact exception it raises."],
      ["3", "Inheritance benefits", "except FintelError catches the entire family, convenient for orchestration."],
      ["4", "Tested", "Every error path is exercised in the validation suite, with zero silent failures."],
    ];
    let ry = 2.95;
    reasons.forEach((r) => {
      // Numbered chip
      s.addShape("ellipse", {
        x: 6.75, y: ry, w: 0.5, h: 0.5,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
        shadow: sharpShadow(),
      });
      s.addText(r[0], {
        x: 6.75, y: ry, w: 0.5, h: 0.5,
        fontSize: 14, fontFace: HEADER_FONT, color: WHITE,
        bold: true, align: "center", valign: "middle", margin: 0,
      });
      // Heading + description
      s.addText(r[1], {
        x: 7.4, y: ry, w: 5.4, h: 0.3,
        fontSize: 13, fontFace: HEADER_FONT, color: NAVY,
        bold: true, margin: 0,
      });
      s.addText(r[2], {
        x: 7.4, y: ry + 0.3, w: 5.4, h: 0.6,
        fontSize: 11, fontFace: BODY_FONT, color: INK, margin: 0,
      });
      ry += 1.0;
    });

    footerBar(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 11 — VALIDATION (floating stat cards with depth)
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };

    floatingCircle(s, 12.4, 0.4, 1.0, BURGUNDY, 0.08);
    s.addImage({ data: dec.sparkline, x: -0.5, y: 6.4, w: 5.0, h: 0.7, transparency: 75 });

    sectionLabel(s, "V.  ENGINEERING PRACTICES");
    slideTitle(s, "Validation Strategy & Test Coverage");

    const stats = [
      { num: "9",     lbl: "Test Suites" },
      { num: "30+",   lbl: "Assertions" },
      { num: "100%",  lbl: "Error Paths" },
      { num: "4 / 4", lbl: "Modules Covered" },
    ];

    const cardW = 2.85, gap = 0.25;
    stats.forEach((st, i) => {
      const x = 0.6 + i * (cardW + gap);
      // Navy card with shadow
      s.addShape("roundRect", {
        x: x, y: 2.55, w: cardW, h: 1.5,
        fill: { color: NAVY }, line: { color: NAVY, width: 0 },
        rectRadius: 0.08, shadow: liftedShadow(),
      });
      // Burgundy top stripe
      s.addShape("rect", {
        x: x, y: 2.55, w: cardW, h: 0.1,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
      });
      s.addText(st.num, {
        x: x, y: 2.7, w: cardW, h: 0.85,
        fontSize: 44, fontFace: HEADER_FONT, color: WHITE,
        bold: true, align: "center", valign: "middle", margin: 0,
      });
      s.addText(st.lbl, {
        x: x, y: 3.55, w: cardW, h: 0.4,
        fontSize: 11, fontFace: BODY_FONT, color: WHITE,
        bold: true, charSpacing: 3, align: "center", valign: "middle", margin: 0,
      });
    });

    // Two test categories
    s.addText("TWO-TIER TESTING APPROACH", {
      x: 0.6, y: 4.3, w: 12.1, h: 0.3,
      fontSize: 11, fontFace: BODY_FONT, color: BURGUNDY,
      bold: true, charSpacing: 4, margin: 0,
    });

    const drawTestCard = (x, y, w, h, title, bullets) => {
      s.addShape("rect", {
        x, y, w, h,
        fill: { color: WHITE }, line: { color: "DDDDDD", width: 0.5 },
        shadow: liftedShadow(),
      });
      s.addShape("rect", {
        x, y, w: 0.08, h,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
      });
      s.addText(title, {
        x: x + 0.25, y: y + 0.15, w: w - 0.4, h: 0.4,
        fontSize: 13, fontFace: HEADER_FONT, color: NAVY,
        bold: true, margin: 0,
      });
      s.addText(
        bullets.map((b, i) => ({
          text: b,
          options: { bullet: { code: "25A0" }, breakLine: i < bullets.length - 1 },
        })),
        {
          x: x + 0.25, y: y + 0.6, w: w - 0.4, h: h - 0.7,
          fontSize: 11, fontFace: BODY_FONT, color: INK,
          paraSpaceAfter: 4, margin: 0,
        }
      );
    };

    drawTestCard(0.6, 4.65, 5.95, 2.2, "Happy-Path Verification", [
      "Synthetic, seed-controlled OHLCV data with known patterns",
      "Injected anomalies (volatility, volume, gap) for deterministic detection",
      "Signal counts, metric values, and SLO outcomes asserted explicitly",
    ]);
    drawTestCard(6.75, 4.65, 5.95, 2.2, "Failure-Mode Verification", [
      "Wrong types (string DataFrame, non-numeric columns)",
      "Empty / missing columns / insufficient observations",
      "Negative or non-integer windows, invalid severity or condition",
      "Duplicate alert names, unknown metrics, evaluate() with wrong type",
    ]);

    footerBar(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 12 — LIVE DEMO (floating chips, process flow, outcome cards)
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };

    floatingCircle(s, 12.4, 0.4, 1.0, NAVY, 0.06);
    s.addImage({ data: dec.sparkline, x: 8.0, y: 0.2, w: 5.0, h: 0.8, transparency: 70 });

    sectionLabel(s, "VI.  EMPIRICAL DEMONSTRATION");
    slideTitle(s, "Live Pipeline on AAPL: One Year of Trading Data",
      "End-to-end execution against twelve months of yfinance OHLCV data, run on the same code path as the test suite.");

    const steps = [
      { t: "1", h: "Ingest",    d: "yfinance.download(): 1 yr OHLCV" },
      { t: "2", h: "Detect",    d: "SignalDetector.get_all_signals()" },
      { t: "3", h: "Measure",   d: "MetricsEngine.compute_summary()" },
      { t: "4", h: "Govern",    d: "AlertEngine.evaluate() + SLO.check()" },
      { t: "5", h: "Visualise", d: "Dashboard.render()" },
    ];

    const stepW = 2.35, stepGap = 0.18, startX = 0.6;
    steps.forEach((st, i) => {
      const x = startX + i * (stepW + stepGap);
      // Outer glow ring
      s.addShape("ellipse", {
        x: x + 0.78, y: 2.7, w: 0.8, h: 0.8,
        fill: { color: BURGUNDY, transparency: 80 },
        line: { color: BURGUNDY, width: 0, transparency: 100 },
      });
      // Inner chip
      s.addShape("ellipse", {
        x: x + 0.85, y: 2.77, w: 0.65, h: 0.65,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
        shadow: liftedShadow(),
      });
      s.addText(st.t, {
        x: x + 0.85, y: 2.77, w: 0.65, h: 0.65,
        fontSize: 22, fontFace: HEADER_FONT, color: WHITE,
        bold: true, align: "center", valign: "middle", margin: 0,
      });
      s.addText(st.h, {
        x: x, y: 3.55, w: stepW, h: 0.4,
        fontSize: 14, fontFace: HEADER_FONT, color: NAVY,
        bold: true, align: "center", margin: 0,
      });
      s.addText(st.d, {
        x: x, y: 3.95, w: stepW, h: 0.7,
        fontSize: 10, fontFace: BODY_FONT, color: INK,
        align: "center", italic: true, margin: 0,
      });
    });

    for (let i = 0; i < steps.length - 1; i++) {
      const x1 = startX + (i + 1) * stepW + i * stepGap;
      const x2 = x1 + stepGap;
      s.addShape("line", {
        x: x1, y: 3.1, w: x2 - x1, h: 0,
        line: { color: BURGUNDY, width: 1.5, endArrowType: "triangle" },
      });
    }

    // Outcomes header
    s.addText("REPRESENTATIVE OUTCOMES (illustrative, regenerated each run)", {
      x: 0.6, y: 4.95, w: 12.1, h: 0.3,
      fontSize: 11, fontFace: BODY_FONT, color: BURGUNDY,
      bold: true, charSpacing: 3, margin: 0,
    });

    const outcomes = [
      { num: "30+", lbl: "Signals Detected", sub: "across four detectors" },
      { num: "5",   lbl: "Alert Rules Evaluated", sub: "RSI, σ, drawdown, etc." },
      { num: "3",   lbl: "SLOs Checked", sub: "Sharpe, DD, RSI floor" },
      { num: "5",   lbl: "Dashboard Panels", sub: "single-figure render" },
    ];
    outcomes.forEach((o, i) => {
      const x = 0.6 + i * 3.1;
      s.addShape("rect", {
        x: x, y: 5.35, w: 2.95, h: 1.55,
        fill: { color: WHITE }, line: { color: "DDDDDD", width: 0.5 },
        shadow: liftedShadow(),
      });
      s.addShape("rect", {
        x: x, y: 5.35, w: 2.95, h: 0.08,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
      });
      s.addText(o.num, {
        x: x, y: 5.5, w: 2.95, h: 0.6,
        fontSize: 30, fontFace: HEADER_FONT, color: NAVY,
        bold: true, align: "center", valign: "middle", margin: 0,
      });
      s.addText(o.lbl, {
        x: x, y: 6.1, w: 2.95, h: 0.35,
        fontSize: 12, fontFace: BODY_FONT, color: BURGUNDY,
        bold: true, align: "center", margin: 0,
      });
      s.addText(o.sub, {
        x: x, y: 6.45, w: 2.95, h: 0.3,
        fontSize: 9, fontFace: BODY_FONT, color: INK,
        italic: true, align: "center", margin: 0,
      });
    });

    footerBar(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 13 — DASHBOARD MOCKUP (browser-frame style)
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };

    floatingCircle(s, -0.4, 6.5, 1.5, BURGUNDY, 0.06);
    floatingCircle(s, 12.7, 1.0, 1.0, NAVY, 0.05);

    sectionLabel(s, "VI.  EMPIRICAL DEMONSTRATION");
    slideTitle(s, "Dashboard Composition: Five Coordinated Panels");

    // "Browser" frame — outer card
    s.addShape("rect", {
      x: 0.6, y: 2.55, w: 7.4, h: 4.45,
      fill: { color: WHITE }, line: { color: "BBBBBB", width: 1 },
      shadow: liftedShadow(),
    });
    // Title bar
    s.addShape("rect", {
      x: 0.6, y: 2.55, w: 7.4, h: 0.4,
      fill: { color: NAVY }, line: { color: NAVY, width: 0 },
    });
    // Three "window" dots
    s.addShape("ellipse", { x: 0.78, y: 2.65, w: 0.18, h: 0.18,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 } });
    s.addShape("ellipse", { x: 1.02, y: 2.65, w: 0.18, h: 0.18,
      fill: { color: WHITE, transparency: 65 }, line: { color: WHITE, width: 0 } });
    s.addShape("ellipse", { x: 1.26, y: 2.65, w: 0.18, h: 0.18,
      fill: { color: WHITE, transparency: 65 }, line: { color: WHITE, width: 0 } });
    s.addText("fintel · AAPL · 1Y", {
      x: 1.6, y: 2.55, w: 6.2, h: 0.4,
      fontSize: 10, fontFace: BODY_FONT, color: WHITE,
      italic: true, valign: "middle", margin: 0,
    });

    // Inner dashboard area (dark navy)
    s.addShape("rect", {
      x: 0.7, y: 3.05, w: 7.2, h: 3.85,
      fill: { color: NAVY_DEEP }, line: { color: NAVY_DEEP, width: 0 },
    });

    // Panels inside
    const panels = [
      { x: 0.85, y: 3.2, w: 3.45, h: 1.45, label: "PRICE  +  SIGNAL ANNOTATIONS" },
      { x: 4.35, y: 3.2, w: 3.45, h: 1.45, label: "TECHNICAL INDICATORS" },
      { x: 0.85, y: 4.7, w: 3.45, h: 1.4,  label: "VOLUME  ·  UP / DOWN / SURGE" },
      { x: 4.35, y: 4.7, w: 3.45, h: 1.4,  label: "HEALTH STATUS" },
      { x: 0.85, y: 6.15, w: 6.95, h: 0.65, label: "ALERT TIMELINE" },
    ];
    panels.forEach((p) => {
      s.addShape("rect", {
        x: p.x, y: p.y, w: p.w, h: p.h,
        fill: { color: NAVY }, line: { color: BURGUNDY, width: 0.75 },
      });
      s.addText(p.label, {
        x: p.x, y: p.y, w: p.w, h: p.h,
        fontSize: 8, fontFace: BODY_FONT, color: WHITE,
        bold: true, charSpacing: 3, align: "center", valign: "middle", margin: 0,
      });
    });

    // Decorative sparkline inside price panel
    s.addImage({ data: dec.sparklineLight, x: 0.85, y: 3.55, w: 3.45, h: 0.95, transparency: 0 });
    // Mini scatter inside indicators panel
    s.addImage({ data: dec.scatter, x: 4.35, y: 3.2, w: 3.45, h: 1.45, transparency: 60 });

    // Right-side legend panel
    s.addShape("rect", {
      x: 8.3, y: 2.55, w: 4.4, h: 4.45,
      fill: { color: WHITE }, line: { color: "DDDDDD", width: 0.5 },
      shadow: liftedShadow(),
    });
    s.addShape("rect", {
      x: 8.3, y: 2.55, w: 0.08, h: 4.45,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });
    s.addText("PANEL READING ORDER", {
      x: 8.5, y: 2.7, w: 4.1, h: 0.3,
      fontSize: 11, fontFace: BODY_FONT, color: BURGUNDY,
      bold: true, charSpacing: 4, margin: 0,
    });

    const legend = [
      ["①", "Price", "Closing line with severity-coloured anomaly markers."],
      ["②", "Indicators", "SMA, EMA, and Bollinger envelope on a single axis."],
      ["③", "Volume", "Up/down colouring with volume-surge highlights."],
      ["④", "Health", "Sharpe, RSI, drawdown, return, all colour-coded."],
      ["⑤", "Alert Timeline", "Triggered rules sorted by severity for triage."],
    ];
    let ly = 3.15;
    legend.forEach((l) => {
      s.addText(l[0], {
        x: 8.5, y: ly, w: 0.4, h: 0.4,
        fontSize: 14, fontFace: HEADER_FONT, color: BURGUNDY,
        bold: true, valign: "middle", margin: 0,
      });
      s.addText(l[1], {
        x: 8.95, y: ly, w: 3.7, h: 0.3,
        fontSize: 12, fontFace: HEADER_FONT, color: NAVY,
        bold: true, margin: 0,
      });
      s.addText(l[2], {
        x: 8.95, y: ly + 0.3, w: 3.7, h: 0.4,
        fontSize: 10, fontFace: BODY_FONT, color: INK, margin: 0,
      });
      ly += 0.75;
    });

    footerBar(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 14 — DESIGN DECISIONS (icon-led rows)
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };

    floatingCircle(s, 12.5, 0.4, 0.9, BURGUNDY, 0.08);
    floatingCircle(s, -0.3, 6.4, 1.4, NAVY, 0.05);

    sectionLabel(s, "VII.  DESIGN DECISIONS");
    slideTitle(s, "Trade-offs and Engineering Rationale");

    const decisions = [
      { ic: ic.cubes,  h: "Object-oriented over functional",
        b: "Each module owns mutable state (cached metrics, accumulated signals, registered rules), so OOP is the more honest abstraction." },
      { ic: ic.layer,  h: "Lazy evaluation with caching",
        b: "Indicators are computed on first request and stored. SMA used by Bollinger Bands and the dashboard is therefore calculated once." },
      { ic: ic.shieldW, h: "Fail-loud, not fail-quiet",
        b: "Every public method validates inputs up front and raises a typed FintelError subclass. Silent NaNs would compromise downstream alerting." },
      { ic: ic.proj,   h: "Composability over a god-object",
        b: "Dashboard accepts an external MetricsEngine and pre-computed signals/alerts rather than reconstructing them, which keeps it testable in isolation." },
      { ic: ic.cross,  h: "OTel mapping made explicit",
        b: "Severity strings (info, warning, critical) and SLO terminology are imported deliberately so the analogy is reviewable, not implicit." },
    ];

    let y = 2.55;
    decisions.forEach((d) => {
      // Burgundy circle with icon
      s.addShape("ellipse", {
        x: 0.6, y: y, w: 0.6, h: 0.6,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
        shadow: sharpShadow(),
      });
      s.addImage({ data: d.ic, x: 0.7, y: y + 0.1, w: 0.4, h: 0.4 });
      // Heading + body
      s.addText(d.h, {
        x: 1.4, y: y, w: 11.3, h: 0.35,
        fontSize: 14, fontFace: HEADER_FONT, color: NAVY,
        bold: true, margin: 0,
      });
      s.addText(d.b, {
        x: 1.4, y: y + 0.35, w: 11.3, h: 0.5,
        fontSize: 11, fontFace: BODY_FONT, color: INK, margin: 0,
      });
      y += 0.95;
    });

    footerBar(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 15 — LIMITATIONS & FUTURE WORK
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: PAPER };

    floatingCircle(s, -0.3, -0.3, 1.5, BURGUNDY, 0.05);
    floatingCircle(s, 12.5, 6.6, 1.0, NAVY, 0.06);

    sectionLabel(s, "VII.  LIMITATIONS & FUTURE WORK");
    slideTitle(s, "What We Did Not Solve, Yet");

    const drawColumn = (x, header, items, accentColor) => {
      // Card
      s.addShape("rect", {
        x: x, y: 2.55, w: 5.95, h: 4.35,
        fill: { color: WHITE }, line: { color: "DDDDDD", width: 0.5 },
        shadow: liftedShadow(),
      });
      // Header strip — burgundy or navy
      s.addShape("rect", {
        x: x, y: 2.55, w: 5.95, h: 0.65,
        fill: { color: accentColor }, line: { color: accentColor, width: 0 },
      });
      s.addText(header, {
        x: x + 0.25, y: 2.55, w: 5.7, h: 0.65,
        fontSize: 14, fontFace: HEADER_FONT, color: WHITE,
        bold: true, valign: "middle", charSpacing: 2, margin: 0,
      });
      s.addText(
        items.map((it, i) => ({
          text: it,
          options: { bullet: { code: "25A0" }, breakLine: i < items.length - 1 },
        })),
        {
          x: x + 0.25, y: 3.4, w: 5.5, h: 3.3,
          fontSize: 12, fontFace: BODY_FONT, color: INK,
          paraSpaceAfter: 6, margin: 0,
        }
      );
    };

    drawColumn(0.6, "ACKNOWLEDGED LIMITATIONS", [
      "Backward-looking signal detection. No forecasting layer, by design.",
      "Single-frequency analysis. Daily bars only; intraday tick data would need a streaming refactor.",
      "Static thresholds. Alert rules are user-set rather than statistically learned.",
      "yfinance dependency. Survivorship bias and free-tier rate limits are inherited.",
      "No persistence layer. Signals and alerts live only for the lifetime of the process.",
    ], NAVY);

    drawColumn(6.75, "ROADMAP FOR FUTURE ITERATIONS", [
      "Adaptive thresholds. Replace fixed σ multipliers with rolling-window quantile estimators.",
      "Streaming mode. Push-based signal emission via Python asyncio for live tick feeds.",
      "Persistence. Write signals and alerts to a SQLite store for historical replay.",
      "Native OTel exporter. Emit fintel signals as actual OpenTelemetry spans for SRE tooling.",
      "Portfolio-level SLOs. Multi-asset reliability targets with weighting.",
    ], BURGUNDY);

    footerBar(s);
    pageNumber(s, n, TOTAL);
  }

  // ---------------------------------------------------------------------------
  // SLIDE 16 — CONCLUSION (mirror of title with stat strip)
  // ---------------------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide();
    s.background = { color: NAVY_DEEP };

    s.addImage({ data: dec.ring, x: -1.5, y: -1.5, w: 5.5, h: 5.5, transparency: 50 });
    s.addImage({ data: dec.scatter, x: 8.0, y: 2.0, w: 5.0, h: 5.0, transparency: 60 });
    s.addImage({ data: dec.sparklineLight, x: 0.5, y: 6.0, w: 12.5, h: 1.0, transparency: 25 });

    floatingCircle(s, 11.5, 0.5, 1.4, BURGUNDY, 0.85);
    floatingCircle(s, 12.6, 1.7, 0.4, WHITE, 0.5);

    s.addShape("rect", {
      x: 0, y: 0, w: 0.4, h: 7.5,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });
    s.addShape("rect", {
      x: 12.9, y: 0, w: 0.4, h: 7.5,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });

    s.addText("CONCLUSION", {
      x: 1.0, y: 0.85, w: 11, h: 0.5,
      fontSize: 13, fontFace: BODY_FONT, color: WHITE,
      bold: true, charSpacing: 8, margin: 0,
    });
    s.addShape("rect", {
      x: 1.0, y: 1.3, w: 1.0, h: 0.05,
      fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
    });

    s.addText("Markets are systems.", {
      x: 1.0, y: 1.55, w: 11.5, h: 1.0,
      fontSize: 50, fontFace: HEADER_FONT, color: WHITE,
      bold: true, italic: true, margin: 0,
    });
    s.addText("Treat them that way.", {
      x: 1.0, y: 2.55, w: 11.5, h: 1.0,
      fontSize: 50, fontFace: HEADER_FONT, color: BURGUNDY,
      bold: true, italic: true, margin: 0,
    });

    s.addText(
      [
        { text: "fintel", options: { bold: true, italic: true } },
        { text: " demonstrates that the engineering vocabulary of modern observability (spans, metrics, alerts, dashboards, SLOs) is not metaphor but ", options: {} },
        { text: "directly applicable", options: { bold: true } },
        { text: " infrastructure for quantitative finance.", options: {} },
      ],
      {
        x: 1.0, y: 3.85, w: 11.3, h: 1.0,
        fontSize: 16, fontFace: BODY_FONT, color: WHITE, margin: 0,
      }
    );

    // Stat strip with depth
    const closing = [
      { num: "4", lbl: "MODULES" },
      { num: "9", lbl: "TEST SUITES" },
      { num: "5", lbl: "ALLOWED LIBRARIES" },
      { num: "0", lbl: "EXTERNAL DEPENDENCIES" },
    ];
    closing.forEach((c, i) => {
      const x = 1.0 + i * 3.0;
      s.addShape("rect", {
        x: x, y: 5.4, w: 2.7, h: 0.06,
        fill: { color: BURGUNDY }, line: { color: BURGUNDY, width: 0 },
      });
      s.addText(c.num, {
        x: x, y: 5.5, w: 2.7, h: 0.7,
        fontSize: 36, fontFace: HEADER_FONT, color: WHITE,
        bold: true, margin: 0,
      });
      s.addText(c.lbl, {
        x: x, y: 6.2, w: 2.7, h: 0.4,
        fontSize: 9, fontFace: BODY_FONT, color: WHITE,
        bold: true, charSpacing: 4, margin: 0,
      });
    });

    s.addText("Thank you.   ·   Questions are welcome.", {
      x: 1.0, y: 6.85, w: 11.3, h: 0.4,
      fontSize: 14, fontFace: HEADER_FONT, color: WHITE,
      italic: true, margin: 0,
    });
  }

  await pres.writeFile({
    fileName: "/Users/maru/Documents/fintel/presentation/fintel_FE520_v2_raw.pptx",
  });
  console.log("Built raw v2 deck");
}

build().catch((e) => { console.error(e); process.exit(1); });
