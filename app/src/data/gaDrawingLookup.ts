// ============================================================
// GA Drawing Lookup — Smart matching + Manual selection
// Uses shared productMatchers for single source of truth
// ============================================================

import { getAllDrawings, getFileDataUrl } from "../data/gaDrawingStorage";
import type { GaDrawingEntry } from "../data/gaDrawingTypes";
import { detectProductFamily, getProductLabel } from "./productMatchers";

// Product family → display label mapping (mirrors DocumentMasterPanel)
const FAMILY_LABELS: Record<string, string> = {
  "emf": "Electromagnetic Flow Meter",
  "turbine": "Turbine Flow Meter",
  "vortex": "Vortex Flow Meter",
  "glass_tube_rotameter": "Glass Tube Rotameter",
  "metal_tube_rotameter": "Metal Tube Rotameter",
  "acrylic_body_rotameter": "Acrylic Body Rotameter",
  "bypass_rotameter": "By-Pass Glass Tube Rotameter",
  "oval_gear": "Oval Gear Flow Meter",
  "ultrasonic": "Ultrasonic Flow Meter",
  "magnetic_level": "Side Mounted Magnetic Level Gauge",
  "top_mounted_magnetic": "Top Mounted Magnetic Level Gauge",
  "reflex_level": "Reflex Level Gauge",
  "transparent_level": "Transparent Level Gauge",
  "tubular_level": "Tubular Level Gauge",
  "float_board_level": "Float & Board Level Gauge",
  "radar_level": "Radar Level Transmitter",
  "hydrostatic_level": "Hydrostatic Level Transmitter",
  "smart_pressure": "Smart Pressure Transmitter",
  "dp_pressure": "Differential Pressure Transmitter",
  "miniature_pressure": "Miniature Pressure Transmitter",
  "displacer_level_switch": "Displacer Level Switch",
  "side_mounted_level_switch": "Side Mounted Level Switch",
  "top_mounted_level_switch": "Top Mounted Level Switch",
  "double_window_sight_glass": "Double Window Sight Glass",
  "full_view_sight_glass": "Full View Sight Glass",
  "allen_bolt_sight_glass": "Allen Bolt Sight Glass",
  "orifice_flange_assembly": "Orifice Flange Assembly",
};

/** Critical qualifiers that MUST be present in drawing productName if they
 *  appear in the instrument type.  E.g. "By-Pass" in the instrument type
 *  means we must NEVER show a drawing that does NOT also contain "By-Pass".
 *  This prevents "Glass Tube Rotameter" drawings from matching a
 *  "By-Pass Glass Tube Rotameter" instrument.
 */
const CRITICAL_QUALIFIERS = [
  "by-pass", "bypass",
  "side mounted",
  "top mounted",
  "acrylic body",
  "glass tube",
  "metal tube",
  "double window",
  "full view",
  "allen bolt",
  "smart",
  "differential pressure",
  "miniature",
  "displacer",
  "radar",
  "hydrostatic",
  "oval gear",
  "orifice flange",
  "reflex",
  "transparent",
  "tubular",
  "float & board", "float board",
];



/** Returns the first critical qualifier found in instrumentType, or null. */
function extractCriticalQualifier(instrumentType: string): string | null {
  const lower = instrumentType.toLowerCase();
  for (const q of CRITICAL_QUALIFIERS) {
    if (lower.includes(q)) return q;
  }
  return null;
}

/** Filters drawings to only those whose productName / productFamily / title /
 *  description / drawingNo contains the given qualifier.
 *  If qualifier is null, returns drawings unchanged.
 *  CRITICAL: Also checks productFamily with underscore→space normalization,
 *  so "bypass_rotameter" is treated as containing "bypass".
 */
/** Normalise qualifier for matching — collapses "by-pass", "by pass", "bypass" into one */
function normaliseQualifier(q: string): string {
  return q.toLowerCase().replace(/by[-\s]pass/g, "bypass");
}

function enforceQualifier(
  drawings: GaDrawingEntry[],
  qualifier: string | null
): GaDrawingEntry[] {
  if (!qualifier || drawings.length === 0) return drawings;
  const qNormalised = normaliseQualifier(qualifier);

  const filtered = drawings.filter((d) => {
    const prodName = normaliseQualifier(d.productName || "");
    const prodFamily = normaliseQualifier((d.productFamily || "").replace(/_/g, " "));
    const title = normaliseQualifier(d.title || "");
    const desc = normaliseQualifier(d.description || "");
    const drawingNo = normaliseQualifier(d.drawingNo || "");
    return prodName.includes(qNormalised) ||
           prodFamily.includes(qNormalised) ||
           title.includes(qNormalised) ||
           desc.includes(qNormalised) ||
           drawingNo.includes(qNormalised);
  });
  if (filtered.length === 0) {
    console.log("[GAD] Qualifier filter '" + qualifier + "' removed ALL", drawings.length, "drawings — returning empty (correct behaviour)");
  } else {
    console.log("[GAD] Qualifier filter '" + qualifier + "' kept", filtered.length, "of", drawings.length, "drawings");
  }
  return filtered;
}

// Re-export for backward compatibility
export { getProductLabel };
export function getProductFamily(instrumentType: string): string | null {
  return detectProductFamily(instrumentType);
}



// ─── Extract size info for matching ────────────────────────
function extractSizeParts(size: string): { num: string; full: string } {
  if (!size) return { num: "", full: "" };
  const clean = size.replace(/\s+/g, "").toLowerCase();
  const m = clean.match(/(\d+(?:\.\d+)?)/);
  return { num: m ? m[1] : "", full: clean };
}

// ─── Score a drawing with detailed breakdown ───────────────
export interface ScoreBreakdown {
  sizeMatch: number;
  decodMatch: number;
  titleBonus: number;
  dateBonus: number;
  total: number;
}

export function scoreDrawingWithBreakdown(
  drawing: GaDrawingEntry,
  size: string,
  decodNo?: string
): ScoreBreakdown {
  const searchText = (drawing.title + " " + drawing.drawingNo + " " + drawing.description).toLowerCase();
  const { num: sizeNum, full: sizeFull } = extractSizeParts(size);

  let sizeScore = 0;
  if (sizeNum) {
    // Exact size with unit: "80nb" in title
    if (searchText.includes(sizeFull)) sizeScore += 200;
    // Size number with word boundary: "80 nb", "80nb", "80-mm"
    else if (new RegExp(`\\b${sizeNum}\\s*(nb|mm|inch|\\")?\\b`, "i").test(searchText)) sizeScore += 150;
    // Size number appears anywhere
    else if (searchText.includes(sizeNum)) sizeScore += 75;
  }

  let decodScore = 0;
  if (decodNo) {
    const cleanDecod = decodNo.toLowerCase().replace(/\s+/g, "");
    // Full de-codification match
    if (searchText.includes(cleanDecod)) decodScore += 200;
    // Individual parts match
    const parts = cleanDecod.split("-").filter(p => p.length > 1);
    for (const part of parts) {
      if (searchText.includes(part)) decodScore += 40;
    }
  }

  // Title contains GA/Drawing
  const titleScore = /GAD|GA|DRAWING/i.test(drawing.title) ? 10 : 0;

  // Date tiebreaker
  let dateScore = 0;
  const dp = drawing.date.split("/");
  if (dp.length === 3) {
    dateScore = new Date(`${dp[2]}-${dp[1]}-${dp[0]}`).getTime() / 1e12;
  }

  return {
    sizeMatch: sizeScore,
    decodMatch: decodScore,
    titleBonus: titleScore,
    dateBonus: dateScore,
    total: sizeScore + decodScore + titleScore + dateScore,
  };
}

// ═══════════════════════════════════════════════════════════
// MAIN INTERFACE
// ═══════════════════════════════════════════════════════════

export interface GADrawingMatch {
  drawing: GaDrawingEntry;
  dataUrl: string;
  totalInFamily: number;
  score: ScoreBreakdown;
}

/** Find the best GA Drawing + return ALL scored options */
export async function findGADrawing(
  instrumentType: string,
  size: string,
  decodNo?: string
): Promise<{ best: GADrawingMatch | null; allOptions: GADrawingMatch[] }> {
  const family = getProductFamily(instrumentType);
  if (!family) {
    console.warn("[GAD] No product family found for:", instrumentType);
    return { best: null, allOptions: [] };
  }
  console.log("[GAD] Looking up family:", family, "for instrument:", instrumentType, "size:", size);

  try {
    // Always get fresh data (bypass stale cache)
    const drawings = await getAllDrawings();
    console.log("[GAD] Total drawings in DB:", drawings.length);

    // Strategy 1: Match by productFamily (exact)
    let familyDrawings = drawings.filter((d) => d.productFamily === family);
    console.log("[GAD] Drawings matching productFamily '" + family + "':", familyDrawings.length);

    // Strategy 2: Token-based matching — split family label into words and
    // match individually.  Handles "By-Pass Rotameter" vs "By-Pass Glass Tube
    // Rotameter" where the naive includes() would fail because "glass tube"
    // sits between "by-pass" and "rotameter".
    if (familyDrawings.length === 0) {
      const familyLabel = (FAMILY_LABELS[family] || "").toLowerCase();
      const familyTokens = familyLabel.split(/\s+/).filter(t => t.length > 1);
      console.log("[GAD] Fallback: token search, label:", familyLabel, "tokens:", familyTokens);
      familyDrawings = drawings.filter((d) => {
        const prodName = (d.productName || "").toLowerCase();
        const prodFamily = (d.productFamily || "").toLowerCase();
        // 2a: Naive substring match (fast path)
        if (prodName.includes(familyLabel)) return true;
        // 2b: Token match — at least 60% of family tokens must appear in productName,
        // AND the first (most distinctive) token must match to prevent cross-family
        // contamination (e.g. "Metal Tube" from matching "Glass Tube" tokens)
        if (familyTokens.length > 0) {
          const matchedTokens = familyTokens.filter(t => prodName.includes(t));
          const firstTokenMatches = familyTokens[0] && prodName.includes(familyTokens[0]);
          if (firstTokenMatches && matchedTokens.length / familyTokens.length >= 0.6) return true;
        }
        // 2c: productFamily partial match
        if (prodFamily.includes(family)) return true;
        // 2d: Special cases for known family patterns
        if (family === "magnetic_level" && (prodName.includes("magnetic level") || prodFamily.includes("magnetic_level"))) return true;
        if (family === "top_mounted_magnetic" && (prodName.includes("top mounted") || prodFamily.includes("top_mounted"))) return true;
        if (family === "bypass_rotameter" && (prodName.includes("by-pass") || prodName.includes("by pass") || prodName.includes("bypass")) && prodName.includes("rotameter")) return true;
        if ((family === "glass_tube_rotameter" || family === "acrylic_body_rotameter") && prodName.includes("glass tube") && prodName.includes("rotameter") && !prodName.includes("by-pass") && !prodName.includes("by pass") && !prodName.includes("bypass") && !prodName.includes("metal")) return true;
        return false;
      });
      console.log("[GAD] Fallback drawings found:", familyDrawings.length);
    }

    // Strategy 3: Model-code fallback — extract the model-code prefix from the
    // de-codification number (e.g. FMIPL-BPGTRM-... → "BPGTRM") and search
    // drawings whose drawingNo / title / description contains that prefix.
    if (familyDrawings.length === 0 && decodNo) {
      const modelCodeMatch = decodNo.match(/FMIPL-([A-Z]{2,6})-/i);
      if (modelCodeMatch) {
        const modelCode = modelCodeMatch[1].toUpperCase();
        console.log("[GAD] Model-code fallback searching for:", modelCode);
        familyDrawings = drawings.filter((d) => {
          const searchText = (d.drawingNo + " " + d.title + " " + d.description).toLowerCase().replace(/\s+/g, "");
          return searchText.includes(modelCode.toLowerCase());
        });
        console.log("[GAD] Model-code fallback drawings found:", familyDrawings.length);
      }
    }

    // Strategy 4: Broad keyword search — last resort
    if (familyDrawings.length === 0) {
      const searchTerms = instrumentType.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      console.log("[GAD] Broad search with terms:", searchTerms);
      familyDrawings = drawings.filter((d) => {
        const prodName = (d.productName || "").toLowerCase();
        const matchCount = searchTerms.filter(term => prodName.includes(term)).length;
        return matchCount >= 2;
      });
      console.log("[GAD] Broad search drawings found:", familyDrawings.length);
    }

    // ════════════════════════════════════════════════════════════
    // QUALIFIER ENFORCEMENT — critical post-filter
    // If the instrument type says "By-Pass", we must NEVER show a
    // drawing without "By-Pass".  This prevents cross-family
    // contamination from broad keyword searches.
    // ════════════════════════════════════════════════════════════
    const qualifier = extractCriticalQualifier(instrumentType);
    if (qualifier) {
      console.log("[GAD] Instrument has qualifier '" + qualifier + "' — enforcing");
      familyDrawings = enforceQualifier(familyDrawings, qualifier);
    }

    if (familyDrawings.length === 0) {
      console.warn("[GAD] No drawings found for family:", family, "qualifier:", qualifier);
      return { best: null, allOptions: [] };
    }

    // Score all and sort
    const scored: Array<{ drawing: GaDrawingEntry; score: ScoreBreakdown }> = [];
    for (const d of familyDrawings) {
      scored.push({ drawing: d, score: scoreDrawingWithBreakdown(d, size, decodNo) });
    }
    scored.sort((a, b) => b.score.total - a.score.total);

    // Fetch data URLs for top 5 (or all if less than 5)
    const toFetch = scored.slice(0, Math.max(5, scored.length));
    const options: GADrawingMatch[] = [];
    for (const s of toFetch) {
      const dataUrl = await getFileDataUrl(s.drawing.id);
      if (dataUrl) {
        options.push({
          drawing: s.drawing,
          dataUrl,
          totalInFamily: familyDrawings.length,
          score: s.score,
        });
      }
    }

    console.log("[GAD] Options with data URLs:", options.length);
    return {
      best: options.length > 0 ? options[0] : null,
      allOptions: options,
    };
  } catch (e) {
    console.error("[GAD Lookup] Failed:", e);
    return { best: null, allOptions: [] };
  }
}

/** Get ALL drawings for a product family (for manual selector) */
export async function getDrawingsForFamily(
  instrumentType: string
): Promise<Array<{ drawing: GaDrawingEntry; dataUrl: string }>> {
  const family = getProductFamily(instrumentType);
  if (!family) return [];

  try {
    // Always get fresh data
    const drawings = await getAllDrawings();

    // Strategy 1: Match by productFamily (exact)
    let familyDrawings = drawings.filter((d) => d.productFamily === family);

    // Strategy 2: Token-based matching (same logic as findGADrawing)
    if (familyDrawings.length === 0) {
      const familyLabel = (FAMILY_LABELS[family] || "").toLowerCase();
      const familyTokens = familyLabel.split(/\s+/).filter(t => t.length > 1);
      familyDrawings = drawings.filter((d) => {
        const prodName = (d.productName || "").toLowerCase();
        const prodFamily = (d.productFamily || "").toLowerCase();
        if (prodName.includes(familyLabel)) return true;
        // 2b: Token match — first token must match to prevent cross-family contamination
        if (familyTokens.length > 0) {
          const matchedTokens = familyTokens.filter(t => prodName.includes(t));
          const firstTokenMatches = familyTokens[0] && prodName.includes(familyTokens[0]);
          if (firstTokenMatches && matchedTokens.length / familyTokens.length >= 0.6) return true;
        }
        if (prodFamily.includes(family)) return true;
        if (family === "magnetic_level" && (prodName.includes("magnetic level") || prodFamily.includes("magnetic_level"))) return true;
        if (family === "top_mounted_magnetic" && (prodName.includes("top mounted") || prodFamily.includes("top_mounted"))) return true;
        if (family === "bypass_rotameter" && (prodName.includes("by-pass") || prodName.includes("by pass") || prodName.includes("bypass")) && prodName.includes("rotameter")) return true;
        if ((family === "glass_tube_rotameter" || family === "acrylic_body_rotameter") && prodName.includes("glass tube") && prodName.includes("rotameter") && !prodName.includes("by-pass") && !prodName.includes("by pass") && !prodName.includes("bypass") && !prodName.includes("metal")) return true;
        return false;
      });
    }

    // Strategy 3: Broad keyword search
    if (familyDrawings.length === 0) {
      const searchTerms = instrumentType.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      familyDrawings = drawings.filter((d) => {
        const prodName = (d.productName || "").toLowerCase();
        const matchCount = searchTerms.filter(term => prodName.includes(term)).length;
        return matchCount >= 2;
      });
    }

    // Qualifier enforcement (same as findGADrawing)
    const qualifier = extractCriticalQualifier(instrumentType);
    if (qualifier) {
      familyDrawings = enforceQualifier(familyDrawings, qualifier);
    }

    const result: Array<{ drawing: GaDrawingEntry; dataUrl: string }> = [];
    for (const d of familyDrawings) {
      const dataUrl = await getFileDataUrl(d.id);
      if (dataUrl) result.push({ drawing: d, dataUrl });
    }
    return result;
  } catch {
    return [];
  }
}

/** Get drawing data URL by ID */
export async function getDrawingUrlById(id: string): Promise<string | null> {
  return getFileDataUrl(id);
}
