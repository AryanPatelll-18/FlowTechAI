// ============================================================
// CANONICAL PRODUCT NAME MATCHER — v2
// PERMANENT FIX for product detection errors.
//
// Architecture:
//   1. MODEL CODE is the HIGHEST priority — FMIPL-XXX is extracted
//      first and mapped directly to product family. This is the
//      absolute truth and overrides everything else.
//   2. HEADER-ONLY canonical matching — the full chunk text is
//      NEVER scanned for product detection. Only the header line
//      (the item's type description from the SO) is used.
//   3. Proper substring matching — "meter" correctly matches
//      inside "flowmeter", not just prefix matching.
//   4. Higher confidence threshold — 70% minimum.
//   5. Weighted scoring — direct matches score higher than partial.
// ============================================================

import { DECODE_PRODUCT_LABELS } from "./decodeDatasheetData";

// ─── Noise words that appear in client text but carry zero product meaning ──
const NOISE_WORDS = new Set([
  "the", "and", "of", "with", "for", "to", "in", "on", "at", "by",
  "from", "as", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "can", "shall", "a", "an", "this", "that",
  "these", "those", "it", "its", "qty", "quantity", "size", "no",
  "number", "sr", "srl", "set", "sets", "ea", "each", "nos", "nr",
  "supply", "supplied", "make", "mfg", "manufacture", "manufacturer",
  "scope", "work", "item", "line", "serial", "ref", "reference",
  "job", "project", "site", "location", "tag", "tagged", "as",
  "per", "according", "including", "inclusive", "along", "complete",
  "assembly", "unit", "system", "panel", "skid", "package",
  "type", "model", "series", "class", "category", "kind", "sort",
  "range", "rated", "standard", "regular", "normal", "general",
  "purpose", "industrial", "commercial", "process", "industry",
  "digital", "electronic", "electrical", "mechanical", "manual",
  "automatic", "auto", "semi", "fully", "complete", "partial",
  "optional", "additional", "extra", "spare", "backup", "standby",
  "new", "old", "existing", "replacement", "replaced", "alternate",
  "primary", "secondary", "main", "auxiliary", "local", "remote",
  "field", "control", "room", "mounted", "mounting", "installed",
  "installation", "erection", "commissioning", "testing", "supply",
  "fabrication", "construction", "design", "engineering", "procurement",
  "delivery", "shipping", "transport", "handling", "storage",
  "foundation", "civil", "structural", "piping", "electrical",
  "instrumentation", "instrument", "device", "equipment", "machine",
  "apparatus", "tool", "appliance", "gadget", "metering", "measuring",
  "measurement", "indicator", "indicating", "gauging", "transmitting",
  "transmitter", "sensor", "switch", "switches", "gauge", "gages",
  "gage", "nb", "mm", "inch", "cm", "mtr", "meter", "meters",
  "dia", "diameter", "od", "id", "length", "width", "height",
  "sch", "schedule", "class", "rating", "suitable", "compatible",
  "matching", "equivalent", "similar", "required", "needed",
  "necessary", "essential", "mandatory", "specified", "selected",
  "chosen", "preferred", "recommended", "including", "excl",
  "excluding", "incl", "inclusive", "exclusive", "with", "without",
  "note", "remark", "specification", "detail", "information", "info",
  "data", "doc", "document", "drawing", "ga", "gad", "general",
  "arrangement", "sketch", "sketches", "diagram", "diagrams",
  "figure", "figures", "photo", "photos", "picture", "pictures",
  "etc", "et", "al", "approx", "approximately", "about", "client",
  "product", "make", "application", "tag",
]);

/** Product-critical words that should NEVER be treated as noise */
const PRODUCT_CRITICAL_WORDS = new Set([
  "rotameter", "flowmeter", "electromagnetic", "turbine", "vortex",
  "oval", "gear", "ultrasonic", "magnetic", "radar", "hydrostatic",
  "pressure", "transmitter", "level", "gauge", "indicator",
  "sight", "glass", "reflex", "transparent", "tubular", "float",
  "board", "displacer", "switch", "orifice", "flange", "assembly",
  "smart", "differential", "miniature", "acrylic", "metal", "tube",
  "by", "pass", "bypass", "side", "mounted", "top", "double",
  "window", "full", "view", "allen", "bolt",
]);

/** Tokenise: lowercase, remove punctuation, split, filter noise */
function productTokenize(text: string): string[] {
  const raw = text
    .toLowerCase()
    .replace(/[^a-z0-9\s&-]/g, " ")
    .replace(/&/g, " and ")
    .replace(/-/g, " ");
  const words = raw.split(/\s+/).filter((w) => w.length > 1);
  return words.filter((w) => PRODUCT_CRITICAL_WORDS.has(w) || !NOISE_WORDS.has(w));
}

interface CanonicalEntry {
  family: string;
  name: string;
  tokens: string[];
}

function buildCanonicalList(): CanonicalEntry[] {
  const entries: CanonicalEntry[] = [];
  for (const [family, name] of Object.entries(DECODE_PRODUCT_LABELS)) {
    const tokens = productTokenize(name);
    if (tokens.length === 0) continue;
    entries.push({ family, name, tokens });
  }
  return entries;
}

const CANONICAL_ENTRIES: CanonicalEntry[] = buildCanonicalList();

/** Minimum confidence to accept a match (0-1) */
const CONFIDENCE_THRESHOLD = 0.70;

/** Weight for direct token matches vs partial matches */
const DIRECT_MATCH_WEIGHT = 1.0;
const PARTIAL_MATCH_WEIGHT = 0.4;

/** Check if two tokens match (direct, substring, or compound-word) */
function tokensMatch(canonicalTok: string, inputTok: string): boolean {
  // Direct equality
  if (canonicalTok === inputTok) return true;
  // Substring: "meter" inside "flowmeter"
  if (inputTok.includes(canonicalTok)) return true;
  if (canonicalTok.includes(inputTok)) return true;
  return false;
}

/** Score a canonical entry against input tokens */
function scoreEntry(entry: CanonicalEntry, inputSet: Set<string>): {
  score: number;
  confidence: number;
  weightedScore: number;
} {
  let weightedMatched = 0;
  let rawMatched = 0;

  for (const ctok of entry.tokens) {
    let found = false;
    // Direct match
    if (inputSet.has(ctok)) {
      weightedMatched += DIRECT_MATCH_WEIGHT;
      rawMatched += 1;
      found = true;
    } else {
      // Partial/substring match
      for (const itok of inputSet) {
        if (tokensMatch(ctok, itok)) {
          weightedMatched += PARTIAL_MATCH_WEIGHT;
          rawMatched += 1;
          found = true;
          break;
        }
      }
    }
    if (!found) {
      // No match at all for this canonical token
      // Penalize slightly so entries with unmatched tokens score lower
    }
  }

  const confidence = rawMatched / entry.tokens.length;
  // Weighted score gives bonus for direct matches, penalty for partial-only
  const weightedScore =
    weightedMatched * 10 + // Weighted match score (direct=10, partial=4)
    entry.tokens.length * 0.5; // Prefer longer/more-specific names

  return { score: weightedScore, confidence, weightedScore };
}

// ─── Public API ──────────────────────────────────────────────

/** Model code → product family mapping. This is the HIGHEST priority. */
export const MODEL_CODE_TO_FAMILY: Record<string, string> = {
  "EFM": "emf",                    // Electromagnetic Flow Meter
  "GTRM": "glass_tube_rotameter",  // Glass Tube Rotameter
  "BPGTRM": "bypass_rotameter",    // By-Pass Glass Tube Rotameter
  "MTRM": "metal_tube_rotameter",  // Metal Tube Rotameter
  "ABR": "acrylic_body_rotameter", // Acrylic Body Rotameter
  "SMMLI": "magnetic_level",       // Side Mounted Magnetic Level Indicator
  "TMMLI": "top_mounted_magnetic", // Top Mounted Magnetic Level Indicator
  "MLI": "magnetic_level",         // Magnetic Level Indicator
  "MLG": "magnetic_level",         // Magnetic Level Gauge
  "DLS": "displacer_level_switch",       // Displacer Level Switch
  "SMLS": "side_mounted_level_switch",   // Side Mounted Level Switch
  "TMLS": "top_mounted_level_switch",    // Top Mounted Level Switch
};

export const MODEL_CODE_TO_LABEL: Record<string, string> = {
  "EFM": "Electromagnetic Flow Meter",
  "GTRM": "Glass Tube Rotameter",
  "BPGTRM": "By-Pass Glass Tube Rotameter",
  "MTRM": "Metal Tube Rotameter",
  "ABR": "Acrylic Body Rotameter",
  "SMMLI": "Side Mounted Magnetic Level Indicator",
  "TMMLI": "Top Mounted Magnetic Level Indicator",
  "MLI": "Magnetic Level Indicator",
  "MLG": "Magnetic Level Gauge",
  "DLS": "Displacer Level Switch",
  "SMLS": "Side Mounted Level Switch",
  "TMLS": "Top Mounted Level Switch",
};

/** Extract model code from text and map to product family.
 *  This is the MOST RELIABLE detection method.
 */
export function detectByModelCode(text: string): {
  family: string;
  matchedName: string;
  modelCode: string;
} | null {
  const match = text.match(/FMIPL-([A-Z]{2,6})-/i);
  if (!match) return null;
  const code = match[1].toUpperCase();
  const family = MODEL_CODE_TO_FAMILY[code];
  if (!family) return null;
  const label = MODEL_CODE_TO_LABEL[code] || DECODE_PRODUCT_LABELS[family as keyof typeof DECODE_PRODUCT_LABELS] || code;
  return { family, matchedName: label, modelCode: code };
}

/** Match header-line text against canonical product names.
 *  ONLY scans the header line, NOT the full chunk.
 *  Returns the best-matching family key, or null.
 */
export function matchCanonicalProduct(inputText: string): {
  family: string;
  confidence: number;
  matchedName: string;
} | null {
  if (!inputText || inputText.trim().length < 3) return null;

  const inputTokens = productTokenize(inputText);
  const inputSet = new Set(inputTokens);
  if (inputSet.size === 0) return null;

  let best: {
    family: string;
    confidence: number;
    matchedName: string;
    score: number;
  } | null = null;

  for (const entry of CANONICAL_ENTRIES) {
    const { confidence, score } = scoreEntry(entry, inputSet);

    if (confidence < CONFIDENCE_THRESHOLD) continue;

    if (!best || score > best.score) {
      best = {
        family: entry.family,
        confidence: Math.round(confidence * 100) / 100,
        matchedName: entry.name,
        score,
      };
    }
  }

  return best;
}

/** Get all canonical entries (for UI / debugging) */
export function getCanonicalProducts(): Array<{ family: string; name: string }> {
  return CANONICAL_ENTRIES.map((e) => ({ family: e.family, name: e.name }));
}

/** Count of registered canonical products */
export function getCanonicalProductCount(): number {
  return CANONICAL_ENTRIES.length;
}
