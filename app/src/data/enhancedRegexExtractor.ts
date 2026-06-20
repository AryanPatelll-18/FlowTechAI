/**
 * Enhanced Regex Extractor v3 — Target: ~90% field accuracy
 * Multi-pass pipeline: table detection → field extraction → cross-field inference → validation
 *
 * Architecture:
 *   PASS 1: Detect document structure (tabular vs free-form, find line-item boundaries)
 *   PASS 2: Extract all possible fields with multi-pattern matching
 *   PASS 3: Cross-field inference (fill gaps using related fields)
 *   PASS 4: Normalize and validate (unit conversion, range checks, service inference)
 *   PASS 5: Confidence scoring based on data completeness and consistency
 */

import type { ExtractedLineItem, ProcessConditions } from "../types/shared";
import { matchCanonicalProduct, detectByModelCode } from "./canonicalProductMatcher";
import { ALL_MODELS } from "./allModelData";

// ═══════════════════════════════════════════════════════════════════
// Model Name Policy:
// - Model Name comes ONLY from "MODEL NO." field in the SO
// - If not specified in SO, show "Not Specified"
// - NEVER derive/invent model names from de-codification
// ═══════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════════════════════
// PASS 0: CONFIGURATION — Field pattern definitions
// ═════════════════════════════════════════════════════════════════════════════

/** Multi-pattern field extractor — tries many patterns, returns best match */
interface FieldPattern {
  patterns: RegExp[];
  cleaner?: (val: string) => string;
  validator?: (val: string) => boolean;
}

const FIELD_PATTERNS: Record<string, FieldPattern> = {
  // ── Tag Number ──
  tagNumber: {
    patterns: [
      /Tag\s*(?:No\.?|Number)?\s*[:.\-]+\s*([A-Z]{1,3}[\-]?\d{2,6}[A-Z0-9\-]*)/i,
      /(?:Tag|Instrument)\s*[:.\-]+\s*([A-Z]{1,3}[\-]?\d{2,6}[A-Z0-9\-]*)/i,
      /([A-Z]{2}[\-]\d{3,5})\s*(?:\||\n|$)/,
      /(?:Sr\.?\s*No\.?\s*\d+\s*[|.]\s*)([A-Z]{2}[\-]?\d{2,5})/i,
      /\b(FT[\-]?\d{2,5}|FE[\-]?\d{2,5}|LG[\-]?\d{2,5}|PT[\-]?\d{2,5}|LI[\-]?\d{2,5}|FI[\-]?\d{2,5}|FT\d{3,4})\b/i,
    ],
    cleaner: (v) => v.trim().toUpperCase().replace(/\s+/g, "-"),
  },

  // ── Product Type / Family ──
  productType: {
    patterns: [
      /(Electromagnetic Flowmeter|Electro Magnetic Flow Meter|EM Flow Meter|Mag Flow Meter)/i,
      /(Vortex Flowmeter|Vortex Flow Meter|Swirl Flowmeter)/i,
      /(Turbine Flowmeter|Turbine Flow Meter)/i,
      /(Oval Gear Flowmeter|Oval Gear Flow Meter|Positive Displacement Flowmeter)/i,
      /(Ultrasonic Flowmeter|Ultrasonic Flow Meter|Clamp[-\s]On Flowmeter)/i,
      /(Glass Tube Rotameter|GTRM|Glass Rotameter)/i,
      /(By[-\s]?Pass Glass Tube Rotameter|BPGTRM|Bypass Rotameter)/i,
      /(Metal Tube Rotameter|MTRM|Metal Rotameter)/i,
      /(Acrylic Body Rotameter|ABR|Acrylic Rotameter)/i,
      /(Magnetic Level Indicator|MLI|Magnetic Level Gauge|MLG)/i,
      /(Side Mounted Magnetic Level|SMMLI)/i,
      /(Top Mounted Magnetic Level|TMMLI)/i,
      /(Radar Level Transmitter|Radar Level)/i,
      /(Hydrostatic Level Transmitter|Hydrostatic Level)/i,
      /(Displacer Level Switch)/i,
      /(Float Switch|Level Switch)/i,
      /(Sight Glass|Reflex Level Gauge|Tubular Level Gauge)/i,
      /(Float & Board Level Gauge|Float Board Level Gauge)/i,
      /(Pressure Transmitter|Smart Pressure Transmitter)/i,
      /(Differential Pressure Transmitter|DP Transmitter)/i,
      /(Orifice Plate|Orifice Flange Assembly)/i,
      /(Rotameter|Flowmeter|Flow Meter|Level Gauge|Level Indicator)/i,
    ],
    cleaner: (v) => v.trim().replace(/\s+/g, " "),
  },

  // ── Model Code (FMIPL-XXX-...) ──
  modelCode: {
    patterns: [
      /\b(FMIPL-[A-Z0-9\-]{5,60})\b/i,
      /Model\s*(?:No\.?|Code)?\s*[:.\-]+\s*([A-Z0-9\-]{5,40})/i,
      /Decodification\s*[:.\-]+\s*([A-Z0-9\-]{5,60})/i,
    ],
    cleaner: (v) => v.trim().toUpperCase(),
  },

  // ── Size ──
  size: {
    patterns: [
      /\b(\d{2,4})\s*(NB)\b/i,
      /\b(\d{2,4})\s*(MM)\b/i,
      /Size\s*[:.\-]+\s*(\d{2,4}\s*(?:NB|MM|\"|INCH)?)/i,
      /Line Size\s*[:.\-]+\s*(\d{2,4}\s*(?:NB|MM)?)/i,
      /Pipe Size\s*[:.\-]+\s*(\d{2,4}\s*(?:NB|MM)?)/i,
    ],
    cleaner: (v) => {
      const m = v.match(/(\d{2,4})/);
      return m ? m[1] + "NB" : v.trim().toUpperCase();
    },
  },

  // ── Quantity ──
  quantity: {
    patterns: [
      /(?:Qty|Quantity)\s*[:.\-]+\s*(\d+)/i,
      /\bQty\s*[:.\-]+\s*(\d+)/i,
      /(\d+)\s*(?:Nos?\.?|No\.?|EA|Sets?| pcs)/i,
    ],
  },

  // ── Application / Service ──
  application: {
    patterns: [
      /Application\s*Name\s*[:.\-]+\s*([^\n|]{3,50}?)(?=\s*(?:Operating|Flow|Pressure|Temp|Size|$))/i,
      /Application\s*[:.\-]+\s*([^\n|]{3,50}?)(?=\s*(?:Operating|Flow|Pressure|Temp|Size|$))/i,
      /Service\s*[:.\-]+\s*([^\n|]{2,40}?)(?=\s*(?:Fluid|Flow|Temp|Pressure|$))/i,
      /Process\s*Fluid\s*[:.\-]+\s*([^\n|]{2,40}?)(?=\s*(?:Temp|Pressure|Density|$))/i,
    ],
    cleaner: (v) => v.trim().replace(/\s+/g, " "),
  },

  // ── Process Medium / Fluid ──
  fluid: {
    patterns: [
      /Process\s*Fluid\s*[:.\-]+\s*([^\n|@]{2,30}?)(?=\s*(?:@|Temp|°|Density|SG|Pressure|$|\n))/i,
      /Fluid\s*(?:Name)?\s*[:.\-]+\s*([^\n|@]{2,30}?)(?=\s*(?:@|Temp|°|Density|SG|$))/i,
      /Liquid\s*[:.\-]+\s*([^\n|]{2,30}?)(?=\s*(?:Temp|°|Density|$))/i,
      /Medium\s*[:.\-]+\s*([^\n|]{2,30}?)(?=\s*(?:Temp|°|Density|$))/i,
    ],
    cleaner: (v) => v.trim().replace(/\s+/g, " "),
  },

  // ── Flow Rate Min ──
  flowMin: {
    patterns: [
      /Min(?:imum)?\s*Flow\s*[:.\-]+\s*([\d,.]+)/i,
      /Flow\s*(?:Range|Min)\s*[:.\-]+\s*([\d,.]+)\s*[~-]\s*[\d,.]+/i,
      /Operating\s*Flow\s*[:.\-]+\s*([\d,.]+)\s*[~-]\s*[\d,.]+/i,
      /Flow\s*Rate\s*[:.\-]+\s*([\d,.]+)\s*[~-]\s*[\d,.]+/i,
      /(\d{1,6}(?:\.\d+)?)\s*[~-]\s*\d{1,6}(?:\.\d+)?\s*(?:LPH|m³\/h|m3\/h|Nm³\/h|Nm3\/h|GPM|LPM|kg\/h)/i,
    ],
  },

  // ── Flow Rate Max ──
  flowMax: {
    patterns: [
      /Max(?:imum)?\s*Flow\s*[:.\-]+\s*([\d,.]+)/i,
      /Flow\s*(?:Range|Max)\s*[:.\-]+\s*[\d,.]+\s*[~-]\s*([\d,.]+)/i,
      /Operating\s*Flow\s*[:.\-]+\s*[\d,.]+\s*[~-]\s*([\d,.]+)/i,
      /Flow\s*Rate\s*[:.\-]+\s*[\d,.]+\s*[~-]\s*([\d,.]+)/i,
      /\d{1,6}(?:\.\d+)?\s*[~-]\s*([\d,.]+)\s*(?:LPH|m³\/h|m3\/h|Nm³\/h|Nm3\/h|GPM|LPM|kg\/h)/i,
    ],
  },

  // ── Flow Rate Normal ──
  flowNormal: {
    patterns: [
      /Normal\s*Flow\s*[:.\-]+\s*([\d,.]+)/i,
      /Rated\s*Flow\s*[:.\-]+\s*([\d,.]+)/i,
      /Design\s*Flow\s*[:.\-]+\s*([\d,.]+)/i,
      /Flow\s*Rate\s*[:.\-]+\s*([\d,.]+)\s*(?:LPH|m³\/h|m3\/h)/i,
    ],
  },

  // ── Flow Unit ──
  flowUnit: {
    patterns: [
      /\d+\.?\d*\s*(LPH|LPM|m³\/hr|m3\/hr|m³\/h|m3\/h|Nm³\/h|Nm3\/h|Nm³\/hr|Nm3\/hr|GPM|kg\/hr|kg\/h|SCFH|SLPM|NLPM)\b/i,
      /Flow\s*[:.\-]+\s*[\d,.]+\s*[~-]\s*[\d,.]+\s*(LPH|LPM|m³\/hr|m3\/hr|GPM|kg\/hr)/i,
    ],
    cleaner: (v) => {
      const u = v.toUpperCase().trim();
      if (u.includes("M3/H") || u.includes("M³/H")) return "m3/hr";
      if (u.includes("NM3/H") || u.includes("NM³/H")) return "Nm3/hr";
      if (u.includes("LPH")) return "LPH";
      if (u.includes("LPM")) return "LPM";
      if (u.includes("GPM")) return "GPM";
      if (u.includes("KG/H")) return "kg/hr";
      return u;
    },
  },

  // ── Operating Temperature ──
  temperature: {
    patterns: [
      /Op(?:erating)?\.?\s*Temp(?:erature)?\s*[:.\-]+\s*([\d.]+)\s*°?\s*[CF]?/i,
      /Working\s*Temp(?:erature)?\s*[:.\-]+\s*([\d.]+)\s*°?\s*[CF]?/i,
      /Temp(?:erature)?\s*[:.\-]+\s*([\d.]+)\s*°?\s*[CF]?/i,
      /@\s*([\d.]+)\s*°?\s*[CF]/i,
      /Temp\s*Range\s*[:.\-]+\s*[\d.]+\s*[~-]\s*([\d.]+)\s*°?\s*[CF]?/i,
    ],
  },

  // ── Operating Pressure ──
  pressure: {
    patterns: [
      /Op(?:erating)?\.?\s*Press(?:ure)?\s*[:.\-]+\s*([\d.]+)\s*(?:bara?|barg?|kg\/cm²|kg\/cm2|psi|MPa|bar)?/i,
      /Working\s*Press(?:ure)?\s*[:.\-]+\s*([\d.]+)\s*(?:bara?|barg?|kg\/cm²|kg\/cm2|psi|MPa|bar)?/i,
      /Press(?:ure)?\s*[:.\-]+\s*([\d.]+)\s*(?:bara?|barg?|kg\/cm²|kg\/cm2|psi|MPa|bar)?/i,
      /Line\s*Press(?:ure)?\s*[:.\-]+\s*([\d.]+)\s*(?:bara?|barg?|kg\/cm²|kg\/cm2|psi|MPa|bar)?/i,
    ],
  },

  // ── Density ──
  density: {
    patterns: [
      /Density\s*[:.\-]+\s*([\d.]+)\s*(?:kg\/m³|kg\/m3|g\/cc|g\/cm³)?/i,
      /Sp\.?\s*Gr(?:avity)?\s*[:.\-]+\s*([\d.]+)/i,
      /Specific\s*Gravity\s*[:.\-]+\s*([\d.]+)/i,
      /SG\s*[:.\-]+\s*([\d.]+)/i,
    ],
  },

  // ── Viscosity ──
  viscosity: {
    patterns: [
      /Viscosity\s*[:.\-]+\s*([\d.]+)\s*(?:cP|cSt|Pa\.?s?|centipoise)?/i,
    ],
  },

  // ── MOC / Material ──
  moc: {
    patterns: [
      /MOC\s*[:.\-]+\s*([^\n|]{2,30})/i,
      /Material\s*[:.\-]+\s*([^\n|]{2,30})/i,
      /Body\s*MOC\s*[:.\-]+\s*([^\n|]{2,30})/i,
      /Wetted\s*Parts\s*[:.\-]+\s*([^\n|]{2,30})/i,
      /Flow\s*Tube\s*[:.\-]+\s*([^\n|]{2,30})/i,
    ],
    cleaner: (v) => v.trim(),
  },

  // ── Float MOC (for Rotameters) ──
  floatMoc: {
    patterns: [
      /Float\s*(?:MOC|Material)\s*[:.\-]+\s*([^\n|]{2,30})/i,
      /Float\s*(?:Material\s*of\s*Construction)\s*[:.\-]+\s*([^\n|]{2,30})/i,
      /Float[:.\-]+\s*(SS\s*316L?|Hastelloy\s*C?|Hastalloy\s*C?|Titanium|PTFE|Teflon|PVDF|SS\s*304|PP|Polypropylene|Aluminium|Aluminum)/i,
      /Float\s*MOC\s*[:.\-]+\s*(SS\s*316L?|Hastelloy\s*C?|Hastalloy\s*C?|Titanium|PTFE|Teflon|PVDF|SS\s*304|PP|Polypropylene|Aluminium|Aluminum)/i,
    ],
    cleaner: (v) => v.trim().replace(/\s+/g, " "),
  },

  // ── Process Connection ──
  connection: {
    patterns: [
      /Process\s*Connection\s*[:.\-]+\s*([^\n|]{2,30})/i,
      /Connection\s*[:.\-]+\s*([^\n|]{2,30})/i,
      /End\s*Connection\s*[:.\-]+\s*([^\n|]{2,30})/i,
      /Flange\s*[:.\-]+\s*([^\n|]{2,30})/i,
    ],
    cleaner: (v) => v.trim(),
  },

  // ── Output Signal ──
  output: {
    patterns: [
      /Output\s*(?:Signal)?\s*[:.\-]+\s*([^\n|]{2,30})/i,
      /Output\s*[:.\-]+\s*([^\n|]{2,30})/i,
    ],
    cleaner: (v) => v.trim(),
  },

  // ── Certification ──
  certification: {
    patterns: [
      /Certification\s*[:.\-]+\s*([^\n|]{2,50})/i,
      /Certificate\s*[:.\-]+\s*([^\n|]{2,50})/i,
      /TPI\s*[:.\-]+\s*([^\n|]{2,30})/i,
      /Calibration\s*Cert\s*[:.\-]+\s*([^\n|]{2,30})/i,
    ],
    cleaner: (v) => v.trim(),
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// PASS 1: LINE-ITEM BOUNDARY DETECTION
// ═════════════════════════════════════════════════════════════════════════════

/** Detect boundaries between instrument line items in SO/QTN text */
function detectLineItemBoundaries(text: string): string[] {
  const lines = text.split("\n").map((l) => l.trim());
  const chunks: string[] = [];
  let currentChunk: string[] = [];

  // Keywords that indicate a new instrument line item
  const INSTRUMENT_TYPES = [
    "flowmeter", "flow meter", "rotameter",
    "level gauge", "level indicator", "level switch",
    "magnetic level", "radar level", "hydrostatic level",
    "pressure transmitter", "differential pressure",
    "sight glass", "float & board", "float board",
    "orifice plate", "orifice flange",
    "turbine flow", "vortex flow", "ultrasonic flow", "oval gear flow",
    "displacer level", "float switch",
  ];

  const isInstrumentLine = (line: string): boolean => {
    const lower = line.toLowerCase();
    // Match numbered instrument lines: "1. Electromagnetic Flowmeter 100NB" or "1. | Electromagnetic Flowmeter | 100NB"
    const hasNumber = /^\d+\s*[.\)]?\s*(?:\||\s)/.test(line) || /^\d+\s+[A-Za-z]/.test(line);
    const hasInstrument = INSTRUMENT_TYPES.some((t) => lower.includes(t));
    const hasSize = /\d{2,4}\s*(NB|MM)\b/i.test(line);
    const hasModelCode = /\bFMIPL-[A-Z]{2,6}-/i.test(line);
    return (hasNumber && hasInstrument) || (hasModelCode && hasInstrument) || (hasInstrument && hasSize);
  };

  // Try to find explicit section markers first
  const sectionMarkers: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (isInstrumentLine(lines[i])) {
      sectionMarkers.push(i);
    }
  }

  if (sectionMarkers.length >= 2) {
    // We found clear boundaries — chunk between markers
    for (let m = 0; m < sectionMarkers.length; m++) {
      const start = sectionMarkers[m];
      const end = m + 1 < sectionMarkers.length ? sectionMarkers[m + 1] : lines.length;
      const chunk = lines.slice(start, end).join("\n");
      if (chunk.length > 20) chunks.push(chunk);
    }
  } else {
    // No clear boundaries — try to split on double newlines or page breaks
    const pageChunks = text.split(/(?:Page \d+ of \d+|_{10,}|={10,}|\n{3,})/i);
    for (const pc of pageChunks) {
      const trimmed = pc.trim();
      if (trimmed.length > 50) chunks.push(trimmed);
    }
  }

  return chunks.length > 0 ? chunks : [text];
}

// ═════════════════════════════════════════════════════════════════════════════
// PASS 2: MULTI-PATTERN FIELD EXTRACTION
// ═════════════════════════════════════════════════════════════════════════════

/** Extract a single field using multiple regex patterns, returns best match */
function extractField(text: string, fieldName: string): string | null {
  const def = FIELD_PATTERNS[fieldName];
  if (!def) return null;

  for (const pattern of def.patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let value = match[1].trim();
      if (def.cleaner) value = def.cleaner(value);
      if (def.validator && !def.validator(value)) continue;
      if (value && value.length > 0 && value.length < 200) {
        return value;
      }
    }
  }
  return null;
}

/** Extract all fields from a text chunk */
function extractAllFields(text: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const key of Object.keys(FIELD_PATTERNS)) {
    const val = extractField(text, key);
    if (val) fields[key] = val;
  }
  return fields;
}

// ═════════════════════════════════════════════════════════════════════════════
// PASS 3: TABLE DETECTION & ROW EXTRACTION
// ═════════════════════════════════════════════════════════════════════════════

interface TableRow {
  lineItemNo: string;
  tagNumber: string;
  productFamily: string;
  modelNumber: string;
  size: string;
  quantity: string;
  flowMin: string;
  flowMax: string;
  flowUnit: string;
  pressure: string;
  temperature: string;
  moc: string;
  processConnection: string;
  output: string;
  certification: string;
  application: string;
  fluid: string;
}

/** Detect pipe-delimited or columnar tables and extract instrument rows */
function detectInstrumentTable(text: string): TableRow[] {
  const rows: TableRow[] = [];
  const lines = text.split("\n");

  // Find table header lines
  const headerPatterns = [
    /Sr\.?\s*No\.?\s*\|\s*Tag\s*No\.?\s*\|\s*Description\s*\|/i,
    /Item\s*No\.?\s*\|\s*Instrument\s*\|\s*Size\s*\|/i,
    /Line\s*Item\s*\|\s*Tag\s*\|\s*Product\s*\|/i,
    /Sr\.?\s*No\.?\s*Tag\s*No\.?\s*Description/i,
  ];

  let tableStart = -1;
  for (let i = 0; i < lines.length; i++) {
    for (const hp of headerPatterns) {
      if (hp.test(lines[i])) { tableStart = i + 1; break; }
    }
    if (tableStart >= 0) break;
  }

  if (tableStart < 0) return rows;

  // Extract pipe-delimited rows
  for (let i = tableStart; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.length < 10) continue;
    if (/^(Total|Grand|Subtotal|Tax|GST|Amount)/i.test(line)) break;

    const parts = line.split("|").map((p) => p.trim()).filter((p) => p.length > 0);
    if (parts.length >= 4) {
      const row: Partial<TableRow> = {};
      row.lineItemNo = parts[0]?.match(/^\d+/) ? parts[0].match(/^\d+/)![0] : "";
      row.tagNumber = parts[1] || "";
      row.productFamily = parts[2] || "";
      row.size = parts.find((p) => /^\d{2,4}\s*(NB|MM)$/i.test(p)) || "";
      row.modelNumber = parts.find((p) => /FMIPL-/i.test(p)) || "";
      row.quantity = parts.find((p) => /^\d+$/.test(p)) || "1";
      row.flowMin = extractField(parts.join(" "), "flowMin") || "";
      row.flowMax = extractField(parts.join(" "), "flowMax") || "";
      row.flowUnit = extractField(parts.join(" "), "flowUnit") || "";
      rows.push(row as TableRow);
    }
  }

  return rows;
}

// ═════════════════════════════════════════════════════════════════════════════
// PASS 4: CROSS-FIELD INFERENCE
// ═════════════════════════════════════════════════════════════════════════════

/** Infer service type from fluid name */
function inferServiceFromFluid(fluidName: string): "liquid" | "gas" | "steam" | null {
  if (!fluidName) return null;
  const f = fluidName.toLowerCase();
  const gasKeywords = ["air", "nitrogen", "n2", "oxygen", "o2", "co2", "argon", "natural gas", "lpg", "cng", "lng", "biogas", "propane", "butane", "helium", "hydrogen", "ammonia", "chlorine"];
  const steamKeywords = ["steam", "condensate", "vapour", "vapor"];
  const liquidKeywords = ["water", "dm water", "bfw", "boiler feed", "effluent", "sewage", "slurry", "chemical", "acid", "caustic", "diesel", "fuel oil", "lube oil", "raw water", "clear water", "process water", "hot water", "cold water", "demi water"];

  for (const kw of steamKeywords) if (f.includes(kw)) return "steam";
  for (const kw of gasKeywords) if (f.includes(kw)) return "gas";
  for (const kw of liquidKeywords) if (f.includes(kw)) return "liquid";
  return "liquid"; // default
}

/** Infer density from fluid name */
function inferDensity(fluidName: string): number | null {
  const f = fluidName.toLowerCase();
  const densityMap: Record<string, number> = {
    "water": 998, "dm water": 997, "raw water": 998, "clear water": 998,
    "process water": 995, "hot water": 970, "cold water": 999,
    "demi water": 997, "boiler feed water": 960, "bfw": 960,
    "condensate": 950, "sewage": 1020, "effluent": 1010,
    "slurry": 1200, "acid": 1050, "caustic": 1350,
    "diesel": 840, "fuel oil": 890, "lube oil": 860,
    "air": 1.225, "nitrogen": 1.165, "n2": 1.165,
    "oxygen": 1.331, "o2": 1.331, "co2": 1.842,
    "argon": 1.661, "natural gas": 0.717, "lpg": 2.0,
    "cng": 0.8, "steam": 0.6, "vapour": 0.6,
  };
  for (const [key, val] of Object.entries(densityMap)) {
    if (f.includes(key)) return val;
  }
  return null;
}

/** Infer viscosity from fluid name */
function inferViscosity(fluidName: string): number | null {
  const f = fluidName.toLowerCase();
  const viscMap: Record<string, number> = {
    "water": 1.0, "dm water": 0.9, "raw water": 1.0,
    "hot water": 0.4, "cold water": 1.5, "bfw": 0.3,
    "condensate": 0.3, "sewage": 1.5, "effluent": 1.1,
    "diesel": 3.0, "fuel oil": 5.0, "lube oil": 40,
    "acid": 1.5, "caustic": 5.0, "slurry": 10,
    "air": 0.018, "nitrogen": 0.017, "n2": 0.017,
    "oxygen": 0.02, "o2": 0.02, "co2": 0.015,
    "steam": 0.013, "vapour": 0.013, "natural gas": 0.011,
  };
  for (const [key, val] of Object.entries(viscMap)) {
    if (f.includes(key)) return val;
  }
  return null;
}

/** Normalize flow unit string */
function normalizeFlowUnit(unit: string): string {
  const u = (unit || "").toUpperCase().trim();
  if (u.includes("M3/H") || u.includes("M³/H")) return "m3/hr";
  if (u.includes("NM3/H") || u.includes("NM³/H")) return "Nm3/hr";
  if (u.includes("LPH")) return "LPH";
  if (u.includes("LPM")) return "LPM";
  if (u.includes("GPM")) return "GPM";
  if (u.includes("KG/H")) return "kg/hr";
  if (u.includes("SCFH")) return "SCFH";
  return "m3/hr";
}

/** Parse numeric value, handling commas */
function parseNum(v: string): number | null {
  if (!v) return null;
  const n = parseFloat(v.replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

// ═════════════════════════════════════════════════════════════════════════════
// PASS 5: CONFIDENCE SCORING
// ═════════════════════════════════════════════════════════════════════════════

interface ConfidenceBreakdown {
  overall: number;
  tagNumber: number;
  productFamily: number;
  modelNumber: number;
  processData: number;
  sizingData: number;
}

function calculateConfidence(
  fields: Record<string, string>,
  processConditions: ProcessConditions | undefined
): ConfidenceBreakdown {
  const c: ConfidenceBreakdown = { overall: 0, tagNumber: 0, productFamily: 0, modelNumber: 0, processData: 0, sizingData: 0 };

  // Tag number confidence (20 points)
  if (fields.tagNumber) c.tagNumber = 20;

  // Product family confidence (20 points)
  if (fields.modelCode) c.productFamily = 20;
  else if (fields.productType) c.productFamily = 15;

  // Model number confidence (15 points)
  if (fields.modelCode) c.modelNumber = 15;

  // Process data confidence (30 points)
  let procScore = 0;
  if (processConditions) {
    if (processConditions.fluidName) procScore += 5;
    if (processConditions.flowRateMin > 0) procScore += 5;
    if (processConditions.flowRateMax > 0) procScore += 5;
    if (processConditions.operatingTemp !== 0) procScore += 5;
    if (processConditions.operatingPressure !== 0) procScore += 5;
    if (processConditions.density > 0) procScore += 5;
  } else {
    if (fields.fluid) procScore += 5;
    if (fields.flowMin) procScore += 5;
    if (fields.flowMax) procScore += 5;
    if (fields.temperature) procScore += 5;
    if (fields.pressure) procScore += 5;
    if (fields.density) procScore += 5;
  }
  c.processData = procScore;

  // Sizing data confidence (15 points)
  if (fields.size) c.sizingData += 5;
  if (fields.moc) c.sizingData += 5;
  if (fields.connection) c.sizingData += 5;

  c.overall = Math.min(100, c.tagNumber + c.productFamily + c.modelNumber + c.processData + c.sizingData);
  return c;
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═════════════════════════════════════════════════════════════════════════════

export interface EnhancedExtractionResult {
  items: ExtractedLineItem[];
  metadata: any;
  confidence: number;
  mode: "regex";
}

/**
 * Enhanced regex extraction — multi-pass pipeline targeting ~90% field accuracy.
 * Call this when AI extraction is not available.
 */
export function extractWithEnhancedRegex(pdfText: string, fileName: string): EnhancedExtractionResult {
  const text = pdfText;
  const items: ExtractedLineItem[] = [];

  // STEP 1: Detect line-item boundaries
  const chunks = detectLineItemBoundaries(text);

  // STEP 2: Try table detection for summary tables
  const tableRows = detectInstrumentTable(text);

  // STEP 3: Process each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const tableRow = tableRows[i] || {};

    // Extract all possible fields
    const fields = extractAllFields(chunk);

    // Merge table data if available
    if (tableRow.productFamily) fields.productType = tableRow.productFamily;
    if (tableRow.size) fields.size = tableRow.size;
    if (tableRow.quantity) fields.quantity = tableRow.quantity;
    if (tableRow.tagNumber) fields.tagNumber = tableRow.tagNumber;
    if (tableRow.modelNumber) fields.modelCode = tableRow.modelNumber;

    // Product family detection — model code first, then canonical, then regex
    let productFamily = fields.productType || "";
    let modelNumber = fields.modelCode || "";

    const modelDetection = detectByModelCode(chunk);
    if (modelDetection) {
      productFamily = modelDetection.matchedName;
      if (!modelNumber) modelNumber = "FMIPL-" + modelDetection.modelCode + "-...";
    } else {
      const canonical = matchCanonicalProduct(productFamily || chunk.slice(0, 200));
      if (canonical) productFamily = canonical.matchedName;
    }

    // Find model from allModelData
    const modelMatch = ALL_MODELS.find((m) =>
      modelNumber.toLowerCase().includes(m.modelNo.toLowerCase())
    );

    // Service inference
    const fluidName = fields.fluid || fields.application || "";
    const service = inferServiceFromFluid(fluidName);

    // Build ProcessConditions
    const density = parseNum(fields.density) || inferDensity(fluidName) || (service === "liquid" ? 998 : service === "gas" ? 1.2 : service === "steam" ? 0.6 : 998);
    const viscosity = parseNum(fields.viscosity) || inferViscosity(fluidName) || (service === "liquid" ? 1.0 : service === "gas" ? 0.018 : 0.015);
    const opTemp = parseNum(fields.temperature) || 20;
    const opPress = parseNum(fields.pressure) || 1.013;
    const fMin = parseNum(fields.flowMin) || 0;
    const fMax = parseNum(fields.flowMax) || parseNum(fields.flowNormal) || 0;
    const fUnit = normalizeFlowUnit(fields.flowUnit || "m3/hr");
    const pSize = (fields.size || "").match(/(\d+)/)?.[1] + "NB" || "50NB";

    const processConditions: ProcessConditions = {
      service: service || "liquid",
      fluidName: fluidName || (service === "gas" ? "Air" : service === "steam" ? "Steam" : "Water"),
      density,
      viscosity,
      operatingTemp: opTemp,
      operatingPressure: opPress,
      flowRateMin: fMin,
      flowRateMax: fMax,
      flowUnit: fUnit,
      pipeSize: pSize,
      meterCategory: "both",
    };

    if (service === "gas") {
      processConditions.gasPressureBarAbs = opPress;
      processConditions.selectedGasName = fluidName || "Air";
    } else if (service === "liquid") {
      processConditions.liquidPressureBarAbs = opPress;
      processConditions.selectedLiquidName = fluidName || "Water";
    } else if (service === "steam") {
      processConditions.steamPressureBarAbs = opPress;
      processConditions.steamTempC = opTemp;
    }

    // Confidence scoring
    const confidence = calculateConfidence(fields, processConditions);

    // Build ExtractedLineItem
    const item: ExtractedLineItem = {
      id: "li-" + Date.now() + "-" + i,
      lineItemNo: fields.quantity ? String(i + 1) : String(i + 1),
      tagNumber: fields.tagNumber || "TAG-" + (i + 1),
      productFamily: productFamily || fields.productType || "Unknown",
      modelNumber: modelNumber || "",        // De-Codification No. (FMIPL-...)
      modelName: fields.modelName || "",      // Flowtech Model Name (from SO only)
      floatMoc: fields.floatMoc || "",
      size: fields.size || "",
      quantity: parseInt(fields.quantity || "1") || 1,
      application: fields.application || "",
      processMedium: fluidName,
      flowMin: String(fMin),
      flowMax: String(fMax),
      flowUnit: fUnit,
      pressure: String(opPress),
      temperature: String(opTemp),
      moc: fields.moc || "",
      processConnection: fields.connection || "",
      output: fields.output || "",
      certification: fields.certification || "",
      notes: "",
      specs: {},
      processConditions,
      extractionConfidence: confidence.overall,
      lowConfidenceFields: confidence.overall < 70
        ? ["incomplete_process_data"]
        : [],
      status: "extracted",
    };

    items.push(item);
  }

  // STEP 4: Extract metadata
  const customerMatch = text.match(/(?:Customer|Client|To\s*:?)\s*[:]\s*([A-Z][A-Za-z0-9\s&.]+)/i);
  const soMatch = text.match(/(?:SO\s*(?:No\.?|Number)?\s*[:#]?\s*)([A-Z0-9\-/]+)/i);
  const qtnMatch = text.match(/(?:QTN|Quotation|Quote)\s*(?:No\.?|Number)?\s*[:#]?\s*([A-Z0-9\-/]+)/i);

  const metadata = {
    customer_name: customerMatch?.[1]?.trim() || null,
    so_number: soMatch?.[1]?.trim() || null,
    qtn_number: qtnMatch?.[1]?.trim() || null,
    project_name: fileName.replace(/\.[^.]+$/, ""),
    date: new Date().toISOString().split("T")[0],
    revision: "1",
    reference: "",
  };

  const avgConfidence = items.length > 0
    ? Math.round(items.reduce((s, it) => s + it.extractionConfidence, 0) / items.length)
    : 0;

  return { items, metadata, confidence: avgConfidence, mode: "regex" };
}

// ═════════════════════════════════════════════════════════════════════════════
// UTILITY: Post-process extracted items for additional accuracy
// ═════════════════════════════════════════════════════════════════════════════

/** Cross-validate and fill gaps between related items */
export function postProcessExtraction(items: ExtractedLineItem[]): ExtractedLineItem[] {
  // Find the most common values across all items
  const commonValues: Record<string, string> = {};
  const valueCounts: Record<string, Record<string, number>> = {};

  const fieldsToCheck = ["flowUnit", "moc", "processConnection", "output"] as const;

  for (const item of items) {
    for (const field of fieldsToCheck) {
      const val = item[field];
      if (!val) continue;
      if (!valueCounts[field]) valueCounts[field] = {};
      valueCounts[field][val] = (valueCounts[field][val] || 0) + 1;
    }
  }

  for (const field of fieldsToCheck) {
    const counts = valueCounts[field];
    if (!counts) continue;
    let best = "";
    let bestCount = 0;
    for (const [val, count] of Object.entries(counts)) {
      if (count > bestCount) { best = val; bestCount = count; }
    }
    if (bestCount >= 2) commonValues[field] = best;
  }

  // Fill missing values from common values
  for (const item of items) {
    for (const field of fieldsToCheck) {
      if (!item[field] && commonValues[field]) {
        (item as any)[field] = commonValues[field];
      }
    }

    // If flowMax is 0 but flowMin > 0, estimate flowMax = flowMin * 5 (typical turndown)
    if (item.processConditions) {
      const pc = item.processConditions;
      if (pc.flowRateMax <= 0 && pc.flowRateMin > 0) {
        pc.flowRateMax = pc.flowRateMin * 5;
        item.flowMax = String(pc.flowRateMax);
      }
    }
  }

  return items;
}
