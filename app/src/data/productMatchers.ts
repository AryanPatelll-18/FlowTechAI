// ============================================================
// Product Matcher — Fuzzy synonym-based instrument detection
// Handles different client nomenclature, abbreviations, typos
//
// ═══ NEW: Canonical product name matching (primary strategy) ═══
// When an SO is uploaded, the "Type" field is matched against
// official De-Codification master product names using strict
// token-based scoring.  If the match confidence is below the
// threshold, NO product family is returned (null).
//
// This prevents wording errors like "Transparent Glass Tube"
// from being mis-detected as "Transparent Level Gauge" instead
// of "Glass Tube Rotameter".
// ============================================================

import { matchCanonicalProduct, detectByModelCode } from "./canonicalProductMatcher";

/** Product family key → list of synonyms clients actually use */
const PRODUCT_SYNONYMS: Record<string, string[]> = {
  // Flow Meters
  emf: [
    "electromagnetic flowmeter", "electromagnetic flow meter", "electromagnetic",
    "emf", "mag flow meter", "mag flowmeter", "magmeter", "mag meter",
    "full bore magnetic", "full bore mag", "fullbore mag",
    "magnetic flow meter", "magnetic flowmeter", "inline magnetic",
  ],
  turbine: [
    "turbine flowmeter", "turbine flow meter", "turbine meter",
    "turbine", "turbine type flowmeter", "turbine type",
  ],
  vortex: [
    "vortex flowmeter", "vortex flow meter", "vortex meter",
    "vortex shedding flowmeter", "vortex shedding",
  ],
  rotameter: [
    "glass tube rotameter", "glass tube flowmeter", "glass tube flow meter",
    "glass rotameter", "rotameter", "rotammeter",
    "glass tube rotametre", "glass tube",
  ],
  metal_tube_rotameter: [
    "metal tube rotameter", "metal tube flowmeter", "metal tube flow meter",
    "metal tube", "metal rotameter", "ss rotameter", "ss tube rotameter",
  ],
  acrylic_body_rotameter: [
    "acrylic body rotameter", "acrylic rotameter", "acrylic tube rotameter",
    "acrylic body flowmeter", "acrylic flowmeter",
  ],
  bypass_rotameter: [
    // By-Pass Glass Tube Rotameter (must be BEFORE rotameter family so it wins)
    "by-pass glass tube rotameter", "bypass glass tube rotameter",
    "by pass glass tube rotameter", "by-pass glass tube",
    "bypass glass tube", "by pass glass tube",
    // Generic by-pass rotameter
    "by-pass rotameter", "bypass rotameter", "bypass flowmeter",
    "bypass flow meter", "by-pass flowmeter", "by pass rotameter",
    "online rotameter", "on-line rotameter", "online flowmeter",
    "digital rotameter", "electronic rotameter",
  ],
  oval_gear: [
    "oval gear flowmeter", "oval gear flow meter", "oval gear meter",
    "oval gear", "og flowmeter", "pd flowmeter",
  ],
  ultrasonic: [
    "ultrasonic flowmeter", "ultrasonic flow meter", "ultrasonic meter",
    "ultrasonic", "clamp on flowmeter", "clamp-on flowmeter",
  ],
  // Level Devices
  magnetic_level: [
    "magnetic level gauge", "magnetic level indicator",
    "side mounted magnetic level gauge", "side mounted magnetic level indicator",
    "side mount magnetic level gauge", "side mount magnetic level indicator",
    "side-mounted magnetic level gauge", "side-mounted magnetic level indicator",
    "magnetic level", "mag level gauge", "mlg",
    "magnetic float level", "float level gauge",
    "chamber level gauge", "chamber type level gauge",
  ],
  top_mounted_magnetic: [
    "top mounted magnetic level gauge", "top mounted magnetic level indicator",
    "top mount magnetic level gauge", "top mount magnetic level indicator",
    "top-mounted magnetic level gauge", "top-mounted magnetic level indicator",
    "top magnetic level gauge", "top magnetic level indicator",
  ],
  reflex_level: [
    "reflex level gauge", "reflex glass level gauge",
    "reflex level indicator", "reflex gauge",
  ],
  transparent_level: [
    "transparent level gauge", "transparent glass level gauge",
    "transparent level indicator", "transparent gauge",
  ],
  tubular_level: [
    "tubular level gauge", "tubular glass level gauge",
    "tubular level indicator", "tubular gauge",
  ],
  float_board_level: [
    "float & board level gauge", "float and board level gauge",
    "float board level gauge", "float board",
  ],
  radar_level: [
    "radar level transmitter", "radar level sensor",
    "radar level", "radar type level", "non-contact radar",
  ],
  hydrostatic_level: [
    "hydrostatic level transmitter", "hydrostatic level sensor",
    "hydrostatic level", "differential level transmitter",
  ],
  // Pressure Transmitters
  smart_pressure: [
    "smart pressure transmitter", "smart pressure",
    "pressure transmitter", "pressure transducer",
    "electronic pressure transmitter", "digital pressure transmitter",
    "gauge pressure transmitter",
  ],
  dp_pressure: [
    "differential pressure transmitter", "dp pressure transmitter",
    "dp transmitter", "differential pressure",
    "diaphragm pressure transmitter",
  ],
  miniature_pressure: [
    "miniature pressure transmitter", "mini pressure transmitter",
    "compact pressure transmitter", "low range pressure transmitter",
  ],
  // Level Switches
  displacer_level_switch: [
    "displacer level switch", "displacer switch",
    "level displacer switch", "float displacer switch",
    "displacer type level switch", "displacer type switch",
    "buoyancy level switch", "buoyancy switch",
    "torque tube level switch", "torque tube switch",
  ],
  side_mounted_level_switch: [
    "side mounted level switch", "side mount level switch",
    "side-mounted level switch", "side level switch",
    "horizontal level switch", "horizontal mount level switch",
    "flange mounted level switch", "flange mount level switch",
  ],
  top_mounted_level_switch: [
    "top mounted level switch", "top mount level switch",
    "top-mounted level switch", "top level switch",
    "vertical level switch", "vertical mount level switch",
    "threaded level switch", "screw in level switch",
  ],
  // Sight Glasses
  double_window_sight_glass: [
    "double window sight glass", "double window sightglass",
    "double sight glass", "double glazed sight glass",
    "dual window sight glass", "sight glass double window",
  ],
  full_view_sight_glass: [
    "full view sight glass", "full view sightglass",
    "fullview sight glass", "full view glass",
    "sight glass full view", "full vision sight glass",
    "cylindrical sight glass", "tube sight glass",
  ],
  allen_bolt_sight_glass: [
    "allen bolt sight glass", "allen bolt sightglass",
    "allen type sight glass", "bolt sight glass",
    "allen sight glass",
  ],
  orifice_flange_assembly: [
    "orifice flange assembly", "orifice flange set",
    "orifice flange", "orifice plate assembly",
    "orifice plate flange", "of assembly",
    "orifice fitting", "orifice meter run",
  ],
};

// ─── Tag prefix / model code → product family (most reliable method) ─────
// Includes model code prefixes from Flowtech de-codification numbers (FMIPL-XXX-...)
const TAG_PREFIX_TO_FAMILY: Record<string, string> = {
  // Flow Meters
  "emf": "emf",
  "ft": "turbine",
  "vg": "vortex",
  "og": "oval_gear",
  // Rotameters
  "fi": "bypass_rotameter",        // By-Pass Rotameter (legacy)
  "bpgtrm": "bypass_rotameter",    // By-Pass Glass Tube Rotameter (FMIPL-BPGTRM-...)
  "gtrm": "acrylic_body_rotameter", // Glass Tube Rotameter (FMIPL-GTRM-...)
  "mtrm": "metal_tube_rotameter",   // Metal Tube Rotameter (FMIPL-MTRM-...)
  "abr": "acrylic_body_rotameter", // Acrylic Body Rotameter (FMIPL-ABR-...)
  // Level Gauges
  "li": "magnetic_level",
  "smmli": "magnetic_level",       // Side Mounted Magnetic Level Indicator
  "tmmli": "top_mounted_magnetic", // Top Mounted Magnetic Level Indicator
  "mli": "magnetic_level",
  "mlg": "magnetic_level",
  "rlg": "reflex_level",           // Reflex Level Gauge
  "tlg": "tubular_level",          // Tubular Level Gauge
  "trlg": "transparent_level",     // Transparent Level Gauge
  "fblg": "float_board_level",     // Float & Board Level Gauge
  // Sight Glasses
  "dws": "double_window_sight_glass", // Double Window Sight Glass
  "fvs": "full_view_sight_glass",     // Full View Sight Glass
  "abs": "allen_bolt_sight_glass",    // Allen Bolt Sight Glass
  // Level Switches
  "dls": "displacer_level_switch",    // Displacer Level Switch
  "smls": "side_mounted_level_switch", // Side Mounted Level Switch
  "tmls": "top_mounted_level_switch",  // Top Mounted Level Switch
  // Pressure
  "sp": "smart_pressure",           // Smart Pressure
  "dp": "dp_pressure",              // Differential Pressure
  "mp": "miniature_pressure",       // Miniature Pressure
  // Radar / Hydrostatic
  "rlt": "radar_level",             // Radar Level Transmitter
  "hlt": "hydrostatic_level",       // Hydrostatic Level Transmitter
  // Orifice
  "ofa": "orifice_flange_assembly", // Orifice Flange Assembly
};

/** Normalize text for comparison — lowercase, remove extra spaces */
function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

// ─── Main detection: find best-matching product family ──────
export function detectProductFamily(text: string): string | null {
  if (!text) return null;

  // ════════════════════════════════════════════════════════════
  // STRATEGY 0: Model-code detection (HIGHEST PRIORITY)
  // FMIPL-EFM-... → Electromagnetic Flow Meter.
  // This is the most reliable signal and overrides everything.
  // ════════════════════════════════════════════════════════════
  const modelCode = detectByModelCode(text);
  if (modelCode) {
    console.log("[ProductMatch] Model-code match:", modelCode.modelCode, "->", modelCode.matchedName);
    return modelCode.family;
  }

  const normalized = norm(text);

  // ════════════════════════════════════════════════════════════
  // STRATEGY 1: Canonical product name matching (HEADER ONLY)
  // Match against official De-Codification master product names.
  // Uses ONLY the header line, NOT the full chunk text.
  // Requires confidence >= 0.70.
  // ════════════════════════════════════════════════════════════
  const canonical = matchCanonicalProduct(text);
  if (canonical) {
    console.log("[ProductMatch] Canonical match:", canonical.matchedName,
                "confidence:", canonical.confidence, "for input:", text.slice(0, 60));
    return canonical.family;
  }

  // ════════════════════════════════════════════════════════════
  // STRATEGY 2: Exact synonym match (substring inclusion)
  // Fallback for non-standard client wording not in canonical list.
  // ════════════════════════════════════════════════════════════
  let bestFamily: string | null = null;
  let bestMatchLen = 0;

  for (const [family, synonyms] of Object.entries(PRODUCT_SYNONYMS)) {
    for (const syn of synonyms) {
      if (normalized.includes(syn)) {
        // Prefer longer matches to avoid "magnetic" matching before "magnetic level gauge"
        if (syn.length > bestMatchLen) {
          bestMatchLen = syn.length;
          bestFamily = family;
        }
      }
    }
  }
  if (bestFamily) {
    console.log("[ProductMatch] Synonym match:", bestFamily, "for input:", text.slice(0, 60));
    return bestFamily;
  }

  // ════════════════════════════════════════════════════════════
  // STRATEGY 3: Tag number prefix detection (EMF-123 → emf)
  // ════════════════════════════════════════════════════════════
  const tagMatch = text.match(/\b(EMF|FT|FI|VG|LI)-\d/i);
  if (tagMatch) {
    const prefix = tagMatch[1].toLowerCase();
    if (TAG_PREFIX_TO_FAMILY[prefix]) return TAG_PREFIX_TO_FAMILY[prefix];
  }

  // ════════════════════════════════════════════════════════════
  // STRATEGY 4: Word-level keyword matching (lowest priority)
  // ════════════════════════════════════════════════════════════
  const words = normalized.split(/\s+/);
  const familyScores: Record<string, number> = {};

  for (const [family, synonyms] of Object.entries(PRODUCT_SYNONYMS)) {
    for (const syn of synonyms) {
      const synWords = syn.split(" ");
      // Count how many synonym words appear in the text
      let matchCount = 0;
      for (const sw of synWords) {
        if (sw.length > 2 && words.some(w => w.includes(sw) || sw.includes(w))) {
          matchCount++;
        }
      }
      // If most words match, it's a hit
      if (matchCount >= synWords.length * 0.6) {
        familyScores[family] = (familyScores[family] || 0) + matchCount;
      }
    }
  }

  // Return highest scoring family
  const sorted = Object.entries(familyScores).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0 && sorted[0][1] > 0) return sorted[0][0];

  console.log("[ProductMatch] NO MATCH for input:", text.slice(0, 80));
  return null;
}

// ─── Get display label for a product family ─────────────────
export function getProductLabel(family: string): string {
  const labels: Record<string, string> = {
    emf: "Electromagnetic Flow Meter",
    turbine: "Turbine Flow Meter",
    vortex: "Vortex Flow Meter",
    rotameter: "Glass Tube Rotameter",
    glass_tube_rotameter: "Glass Tube Rotameter",
    metal_tube_rotameter: "Metal Tube Rotameter",
    acrylic_body_rotameter: "Acrylic Body Rotameter",
    bypass_rotameter: "By-Pass Glass Tube Rotameter",
    oval_gear: "Oval Gear Flow Meter",
    ultrasonic: "Ultrasonic Flow Meter",
    magnetic_level: "Magnetic Level Gauge",
    top_mounted_magnetic: "Top Mounted Magnetic Level Gauge",
    reflex_level: "Reflex Level Gauge",
    transparent_level: "Transparent Level Gauge",
    tubular_level: "Tubular Level Gauge",
    float_board_level: "Float & Board Level Gauge",
    radar_level: "Radar Level Transmitter",
    hydrostatic_level: "Hydrostatic Level Transmitter",
    smart_pressure: "Smart Pressure Transmitter",
    dp_pressure: "Differential Pressure Transmitter",
    miniature_pressure: "Miniature Pressure Transmitter",
    double_window_sight_glass: "Double Window Sight Glass",
    full_view_sight_glass: "Full View Sight Glass",
    allen_bolt_sight_glass: "Allen Bolt Sight Glass",
    orifice_flange_assembly: "Orifice Flange Assembly",
    displacer_level_switch: "Displacer Level Switch",
    side_mounted_level_switch: "Side Mounted Level Switch",
    top_mounted_level_switch: "Top Mounted Level Switch",
  };
  return labels[family] || family;
}

// ─── Check if text indicates an instrument line item ───────
export function isInstrumentHeader(text: string): boolean {
  if (!text) return false;
  const n = norm(text);
  // Has a tag number pattern (expanded to include level instrument prefixes)
  if (/\b(EMF|FT|FI|VG|LI|SMMLI|TMMLI|MLI|MLG)-\d/i.test(text)) return true;
  // Has a Flowtech model code (e.g. FMIPL-SMMLI-...)
  if (/\bFMIPL-[A-Z]{2,6}-/i.test(text)) return true;
  // Has a size
  if (/\d+\s*(NB|MM)\b/i.test(text) && n.length > 5) return true;
  // Contains instrument keywords (expanded for level instruments)
  const keywords = [
    "flowmeter", "flow meter", "rotameter",
    "level gauge", "level indicator", "magnetic level",
    "pressure transmitter", "sight glass", "sightglass",
    "float board", "float & board", "radar level",
    "hydrostatic level", "displacer level",
  ];
  for (const kw of keywords) {
    if (n.includes(kw)) return true;
  }
  return false;
}
