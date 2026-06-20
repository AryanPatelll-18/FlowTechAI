// ============================================================
// GA Drawing Lookup — Smart matching + Manual selection
// Uses shared productMatchers for single source of truth
// ============================================================

import { getAllDrawings, getFileDataUrl } from "../data/gaDrawingStorage";
import type { GaDrawingEntry } from "../data/gaDrawingTypes";
import { detectProductFamily, getProductLabel } from "./productMatchers";

// Re-export for backward compatibility
export { getProductLabel };
export function getProductFamily(instrumentType: string): string | null {
  return detectProductFamily(instrumentType);
}

// ─── Cache ─────────────────────────────────────────────────
let drawingCache: GaDrawingEntry[] | null = null;

async function getCachedDrawings(): Promise<GaDrawingEntry[]> {
  if (drawingCache) return drawingCache;
  drawingCache = await getAllDrawings();
  return drawingCache;
}

export function clearDrawingCache(): void {
  drawingCache = null;
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
  if (!family) return { best: null, allOptions: [] };

  try {
    const drawings = await getCachedDrawings();
    const familyDrawings = drawings.filter((d) => d.productFamily === family);
    if (familyDrawings.length === 0) return { best: null, allOptions: [] };

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
    const drawings = await getCachedDrawings();
    const familyDrawings = drawings.filter((d) => d.productFamily === family);
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
