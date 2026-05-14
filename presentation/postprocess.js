// postprocess.js
// Reads a pptxgenjs-built pptx, adds slide transitions and entrance animations
// via direct XML manipulation, then writes a new file.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SRC = "/Users/maru/Documents/fintel/presentation/fintel_FE520_v2_raw.pptx";
const DEST = "/Users/maru/Documents/fintel/presentation/fintel_FE520_presentation_v2.pptx";
const WORK = "/Users/maru/Documents/fintel/presentation/_unpacked";

// -----------------------------------------------------------------------------
// Per-slide transition assignment.
// Variety keeps the deck dynamic without being chaotic.
// -----------------------------------------------------------------------------
const TRANSITIONS = [
  null,                                          // (0 unused — slides are 1-indexed below)
  '<p:fade/>',                                   // 1 — title fades in
  '<p:push dir="r"/>',                           // 2 — agenda pushes from right
  '<p:split orient="vert" dir="out"/>',          // 3 — problem/thesis split
  '<p:cover dir="d"/>',                          // 4 — three pillars
  '<p:zoom/>',                                   // 5 — architecture zoom in
  '<p:push dir="l"/>',                           // 6 — module 1
  '<p:push dir="l"/>',                           // 7 — module 2
  '<p:push dir="l"/>',                           // 8 — module 3
  '<p:push dir="l"/>',                           // 9 — module 4
  '<p:wipe dir="r"/>',                           // 10 — error hierarchy
  '<p:cover dir="u"/>',                          // 11 — testing
  '<p:split orient="horz" dir="out"/>',          // 12 — empirical
  '<p:zoom/>',                                   // 13 — dashboard mockup
  '<p:wipe dir="l"/>',                           // 14 — design decisions
  '<p:cover dir="d"/>',                          // 15 — limitations
  '<p:fade/>',                                   // 16 — conclusion fades in
];

// Transition speed: med (default), slow, fast.
const SPEED = "med";

// -----------------------------------------------------------------------------
// Animation timing block for the title slide and the conclusion slide.
// Generates a staged fade-in for shape-tree children so the slide feels alive.
// -----------------------------------------------------------------------------
function timingBlock(shapeIds) {
  // shapeIds — array of integer shape ids to animate sequentially
  const childTnLst = shapeIds
    .map((spid, i) => `
      <p:par>
        <p:cTn id="${5 + i * 4}" fill="hold">
          <p:stCondLst><p:cond delay="${i === 0 ? "0" : "indefinite"}"/></p:stCondLst>
          <p:childTnLst>
            <p:par>
              <p:cTn id="${6 + i * 4}" fill="hold">
                <p:stCondLst><p:cond delay="0"/></p:stCondLst>
                <p:childTnLst>
                  <p:par>
                    <p:cTn id="${7 + i * 4}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="${i === 0 ? "afterEffect" : "withEffect"}">
                      <p:stCondLst><p:cond delay="0"/></p:stCondLst>
                      <p:childTnLst>
                        <p:set>
                          <p:cBhvr>
                            <p:cTn id="${8 + i * 4}" dur="1" fill="hold">
                              <p:stCondLst><p:cond delay="0"/></p:stCondLst>
                            </p:cTn>
                            <p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl>
                            <p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst>
                          </p:cBhvr>
                          <p:to><p:strVal val="visible"/></p:to>
                        </p:set>
                        <p:anim calcmode="lin" valueType="num">
                          <p:cBhvr additive="base">
                            <p:cTn id="${9 + i * 4}" dur="500" fill="hold"/>
                            <p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl>
                            <p:attrNameLst><p:attrName>style.opacity</p:attrName></p:attrNameLst>
                          </p:cBhvr>
                          <p:tavLst>
                            <p:tav tm="0"><p:val><p:fltVal val="0"/></p:val></p:tav>
                            <p:tav tm="100000"><p:val><p:fltVal val="1"/></p:val></p:tav>
                          </p:tavLst>
                        </p:anim>
                      </p:childTnLst>
                    </p:cTn>
                  </p:par>
                </p:childTnLst>
              </p:cTn>
            </p:par>
          </p:childTnLst>
        </p:cTn>
      </p:par>`)
    .join("");

  return `
  <p:timing>
    <p:tnLst>
      <p:par>
        <p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot">
          <p:childTnLst>
            <p:seq concurrent="1" nextAc="seek">
              <p:cTn id="2" dur="indefinite" nodeType="mainSeq">
                <p:childTnLst>
                  ${childTnLst}
                </p:childTnLst>
              </p:cTn>
              <p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>
              <p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst>
            </p:seq>
          </p:childTnLst>
        </p:cTn>
      </p:par>
    </p:tnLst>
  </p:timing>`;
}

// -----------------------------------------------------------------------------
// XML manipulation helpers
// -----------------------------------------------------------------------------
function injectTransition(xml, transitionXml) {
  // Insert <p:transition> just before </p:sld> (and before any <p:timing>).
  // The OOXML schema mandates: cSld → clrMapOvr → transition → timing.
  if (!xml.includes("</p:sld>")) return xml;

  const transitionEl = `<p:transition spd="${SPEED}">${transitionXml}</p:transition>`;

  // If a transition already exists, replace it. Otherwise insert before </p:sld>.
  if (xml.includes("<p:transition")) {
    return xml.replace(/<p:transition[\s\S]*?<\/p:transition>/, transitionEl);
  }
  return xml.replace("</p:sld>", `${transitionEl}</p:sld>`);
}

function injectTiming(xml, timingXml) {
  // Replace any existing timing with our block, or insert before </p:sld>.
  if (xml.includes("<p:timing")) {
    return xml.replace(/<p:timing[\s\S]*?<\/p:timing>/, timingXml);
  }
  return xml.replace("</p:sld>", `${timingXml}</p:sld>`);
}

// Find the shape ids on a slide so we can target the title/heading shape for animation.
// For our deck the first three shapes on the title slide are good candidates for staggered fade-in.
function findFirstShapeIds(xml, count = 3) {
  const ids = [];
  const re = /<p:nvSpPr>[\s\S]*?<p:cNvPr id="(\d+)"/g;
  let m;
  while ((m = re.exec(xml)) !== null && ids.length < count) {
    ids.push(parseInt(m[1], 10));
  }
  return ids;
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------
function run() {
  if (!fs.existsSync(SRC)) {
    console.error("Source file not found:", SRC);
    process.exit(1);
  }
  // Clean work dir
  if (fs.existsSync(WORK)) execSync(`rm -rf "${WORK}"`);
  fs.mkdirSync(WORK, { recursive: true });

  // Unzip with system unzip
  execSync(`cd "${WORK}" && unzip -q "${SRC}"`);

  const slidesDir = path.join(WORK, "ppt/slides");
  const slideFiles = fs.readdirSync(slidesDir)
    .filter((f) => /^slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const an = parseInt(a.match(/(\d+)/)[1], 10);
      const bn = parseInt(b.match(/(\d+)/)[1], 10);
      return an - bn;
    });

  console.log(`Found ${slideFiles.length} slides`);

  slideFiles.forEach((f, idx) => {
    const slideNum = idx + 1;
    const filePath = path.join(slidesDir, f);
    let xml = fs.readFileSync(filePath, "utf8");

    // Inject transition
    const trans = TRANSITIONS[slideNum];
    if (trans) {
      xml = injectTransition(xml, trans);
    }

    // For slides 1 and 16, add a staged fade-in animation on the first few shapes.
    if (slideNum === 1 || slideNum === 16) {
      const ids = findFirstShapeIds(xml, 4);
      if (ids.length > 0) {
        xml = injectTiming(xml, timingBlock(ids));
      }
    }

    fs.writeFileSync(filePath, xml);
    console.log(`  slide ${slideNum}: ${trans || "(no transition)"}${(slideNum === 1 || slideNum === 16) ? "  +animation" : ""}`);
  });

  // Repack — must preserve [Content_Types].xml at the start of the zip
  if (fs.existsSync(DEST)) fs.unlinkSync(DEST);
  execSync(`cd "${WORK}" && zip -qr "${DEST}" . -x "*.DS_Store"`);

  // Cleanup
  execSync(`rm -rf "${WORK}"`);

  console.log("Wrote:", DEST);
}

run();
