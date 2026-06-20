// ============================================================
// SMART SO/QTN PARSER -- Multi-format document understanding
// PURE TECHNICAL DATA ONLY -- No commercial, delivery, payment info
// Supports:
//   1. S35750 format: INSTRUMENT SUMMARY table + per-instrument pages
//   2. Flowtech SO Acknowledgement: numbered items + pipe-delimited specs
// ============================================================

import { detectProductFamily, getProductLabel } from "./productMatchers";
import { matchCanonicalProduct, detectByModelCode } from "./canonicalProductMatcher";
import { detectProcessConnection, type DetectedConnection } from "./flangeDimensions";

// ═══════════════════════════════════════════════════════════════════
// FMIPL Model Code → Flowtech Model Name lookup
// Used to derive Model Name from De-Codification when not explicitly stated
// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// Model Name Policy:
// - Model Name comes ONLY from "MODEL NO." field in the SO
// - If not specified in SO, show "Not Specified"
// - NEVER derive/invent model names from de-codification
// - By-Pass Rotameters have NO model names — will show "Not Specified"
// ═══════════════════════════════════════════════════════════════════

// Keyword regex for instrument detection — used in boundary detection & format detection
const INSTRUMENT_KEYWORDS = /(flowmeter|flow meter|rotameter|level gauge|level indicator|level switch|magnetic level|turbine flow|vortex flow|ultrasonic flow|oval gear|pressure transmitter|sight glass|float & board|float board|float switch|hydrostatic|radar level|displacer)/i;

export interface SectionData {
  title: string;
  rows: [string, string][];
}

/** Process data extracted from SO text for sizing calculations */
export interface ExtractedProcessData {
  flowRateMin: number | null;
  flowRateMax: number | null;
  flowRateNormal: number | null;
  flowUnit: string | null;
  fluidName: string | null;
  fluidDensity: number | null;     // kg/m³
  fluidViscosity: number | null;   // cP
  fluidSG: number | null;
  operatingTemp: number | null;    // °C
  operatingPressure: number | null;// bara or kg/cm²
  pressureUnit: string | null;
  lineSize: string | null;
  service: "liquid" | "gas" | null;
}

export interface ParsedInstrument {
  srNo: number;
  tagNo: string;
  type: string;
  service: string;
  size: string;
  qty: number;
  model: string;        // Full de-codification (e.g. FMIPL-DLS-...)
  modelName: string;     // Model name only (e.g. FlowDLS L270FT)
  decodNo: string; // De-Codification No. extracted separately
  sections: SectionData[];
  gadNote: string;
  processConnection: DetectedConnection | null; // Auto-detected flange info
  customDimensions: Array<{ label: string; value: string }>; // Editable custom dimensions
  processData: ExtractedProcessData; // Extracted sizing parameters
}

export interface ParsedSO {
  header: {
    soNo: string;
    poNo: string;
    project: string;
    client: string;
    endUser: string;
    contractor: string;
    supplier: string;
    date: string;
    rev: string;
    revDescription: string;
    totalQty: string;
    totalLineItems: number;
  };
  instruments: ParsedInstrument[];
}

// ─── COMMERCIAL/DELIVERY TERMS TO EXCLUDE ────────────────────
const COMMERCIAL_TERMS = [
  "delivery", "payment", "gst", "price", "amount", "total", "subtotal",
  "tax", "grand total", "basic rate", "rate", "charges", "cost",
  "freight", "transport", "insurance", "p&f", "p and f", "packing forwarding",
  "excise", "duty", "vat", "bank", "account", "ifsc", "pan", "iec",
  "inco terms", "inco-terms", "delivery terms", "payment terms",
  "terms & conditions", "terms and conditions", "warranty",
  "delivery schedule", "lead time", "dispatch", "shipment",
  "transit", "validity", "quote validity", "currency", "inr", "usd",
  "fob", "cif", "exw", "ddp", "cfr",
];

function isCommercialTerm(label: string): boolean {
  const lower = label.toLowerCase();
  return COMMERCIAL_TERMS.some(term => lower.includes(term));
}

// ─── TECHNICAL LABEL ALIASES ─────────────────────────────────
const LABEL_ALIASES: Record<string, string> = {
  "type": "Type", "make": "Make", "model": "Model", "modelname": "Model Name", "model name": "Model Name", "size": "Size",
  "qty": "Qty", "quantity": "Qty", "service": "Service",
  "accuracy": "Accuracy", "modelcode": "De-Codification No.", "model no": "Model No", "modelno": "Model No",
  "decodification": "De-Codification No.", "de-codification": "De-Codification No.", "de codification": "De-Codification No.",
  "decodificationno": "De-Codification No.", "de-codificationno": "De-Codification No.",
  "de-codificationno.": "De-Codification No.", "decodificationno.": "De-Codification No.",
  "connection": "Connection", "packing": "Packing", "mounting": "Mounting",
  "applicationname": "Application Name", "application": "Application",
  "oppressure": "Op. Pressure", "op.pressure": "Op. Pressure",
  "operatingpressure": "Op. Pressure", "operating pressure": "Op. Pressure",
  "optemperature": "Op. Temperature", "op.temperature": "Op. Temperature",
  "op.temp": "Op. Temperature", "optemp": "Op. Temperature",
  "operatingtemperature": "Op. Temperature", "operating temperature": "Op. Temperature",
  "temperature": "Op. Temperature",
  "density": "Density", "flowrange": "Flow Range", "flow range": "Flow Range",
  "operatingflow": "Operating Flow",
  "minflow": "Min Flow", "min flow": "Min Flow", "minimumflow": "Min Flow",
  "maxflow": "Max Flow", "max flow": "Max Flow", "maximumflow": "Max Flow",
  "conductivity": "Conductivity", "viscosity": "Viscosity",
  "temprange": "Temp Range", "temp range": "Temp Range",
  "pressurerating": "Press Rating", "pressure rating": "Press Rating",
  "pressurerange": "Pressure Range", "pressure range": "Pressure Range",
  "pipemoc": "Pipe MOC", "pipe moc": "Pipe MOC",
  "flowtube": "Flow Tube MOC", "flow tube moc": "Flow Tube MOC",
  "bodymoc": "Body MOC", "body moc": "Body MOC",
  "electrode": "Electrode", "lining": "Lining",
  "flange": "Flange", "earthing": "Earthing",
  "enclosure": "Enclosure", "wiring": "Wiring",
  "comm": "Comm", "communication": "Communication",
  "output": "Output", "outputsignal": "Output", "output signal": "Output",
  "protection": "Protection", "power": "Power",
  "powersupply": "Power Supply", "power supply": "Power Supply",
  "cableentry": "Cable Entry", "cable entry": "Cable Entry",
  "cablegland": "Cable Gland", "cable gland": "Cable Gland",
  "cablelength": "Cable Length", "cable length": "Cable Length",
  "display": "Display",
  "approveddrawing": "Approved Drawing", "approved drawing": "Approved Drawing",
  "datasheet": "Data Sheet / QAP", "data sheet": "Data Sheet / QAP", "qap": "Data Sheet / QAP",
  "data sheet / qap": "Data Sheet / QAP",
  "thirdpartyinspection": "Third-Party Inspection",
  "third-party inspection": "Third-Party Inspection",
  "tpi": "TPI", "mtc": "MTC",
  "calibrationcert": "Calibration Cert", "calibration cert": "Calibration Cert",
  "omanual": "O&M Manual", "o&m manual": "O&M Manual",
  "branding": "Branding",
  "impellertype": "Impeller Type", "impeller type": "Impeller Type",
  "wiretype": "Wire Type", "wire type": "Wire Type",
  "bearing": "Bearing", "bearings": "Bearings",
  "rotormoc": "Rotor MOC", "rotor moc": "Rotor MOC",
  "shaft": "Shaft",
  "scale": "Scale", "scalelength": "Scale Length", "scale length": "Scale Length",
  "rangeability": "Rangeability",
  "float": "Float", "floatmoc": "Float MOC", "float moc": "Float MOC",
  "retainer": "Retainer",
  "wettedparts": "Wetted Parts", "wetted parts": "Wetted Parts",
  "glasstube": "Glass Tube", "glass tube": "Glass Tube", "cover": "Cover",
  "inducedpipe": "Induced Pipe", "induced pipe": "Induced Pipe",
  "isovalve": "Iso Valve", "iso valve": "Iso Valve",
  "isolationvalve": "Iso Valve", "isolation valve": "Iso Valve",
  "orifice": "Orifice", "carrier ring": "Carrier Ring", "carrierring": "Carrier Ring",
  "fasteners": "Fasteners",
  "flowdir": "Flow Dir", "flow dir": "Flow Dir",
  "flowdirection": "Flow Dir", "flow direction": "Flow Dir",
  "ffheight": "F/F Height", "f/fheight": "F/F Height", "f/f height": "F/F Height",
  "waterequiv": "Water Equiv", "water equiv": "Water Equiv",
  "tubetype": "Tube Type", "tube type": "Tube Type",
  "range": "Range",
  "orificebore": "Orifice Bore", "orifice bore": "Orifice Bore",
  "orificeborediameter": "Orifice Bore Diameter", "orifice bore diameter": "Orifice Bore Diameter",
  "dpbeta": "DP / Beta", "dp / beta": "DP / Beta",
  "pressloss": "Press Loss", "press loss": "Press Loss",
  "reynoldsno": "Reynolds No", "reynolds no": "Reynolds No",
  "turndown": "Turndown", "turndownratio": "Turndown Ratio", "turndown ratio": "Turndown Ratio",
  "responsetime": "Response Time", "response time": "Response Time",
  "repeatability": "Repeatability",
  "lowflowcutoff": "Low Flow Cut-off", "low flowcutoff": "Low Flow Cut-off",
  "low flow cutoff": "Low Flow Cut-off", "lowflow cutoff": "Low Flow Cut-off",
  "performance": "Performance",
  "glandpkg": "Gland Pkg", "gland pkg": "Gland Pkg",
  "length": "Length", "probe length": "Length", "probelength": "Length",
  "insertion length": "Length", "insertionlength": "Length",
  "flangesize": "Flange Size", "flange size": "Flange Size",
  "noofcontactpoints": "No. of Contact Points", "no. of contact points": "No. of Contact Points",
  "contactpoints": "No. of Contact Points", "contact points": "No. of Contact Points",
};

const KNOWN_LABELS = new Set(Object.keys(LABEL_ALIASES));
function norm(s: string): string { return s.toLowerCase().replace(/[^a-z0-9]/g, "").trim(); }

/** De-Codification short-code → full-form label mapping */
const DECOD_LABEL_MAP: Record<string, string> = {
  "FT 1": "Flow Tube MOC", "FT 2": "Flow Tube MOC", "FT 3": "Flow Tube MOC",
  "F": "Process Connection Type",
  "S1": "Process Connection MOC", "S2": "Process Connection MOC", "S3": "Process Connection MOC",
  "F1": "Process Connection Standard",
  "IR": "Impeller Type", "IL": "Impeller Type",
  "W1": "Wire Type", "W2": "Wire Type", "W3": "Wire Type",
  "WP": "Protection Type", "IP": "Protection Type",
  "M": "Output",
  "CR": "Communication", "CH": "Communication",
  "PS": "Power Supply",
  "I": "Mounting",
  "NA": "Accessories",
};
function cleanValue(v: string, maxLen = 200): string {
  if (!v) return "";
  let s = v.trim().replace(/\s+/g, " ").trim();
  if (s.length > maxLen) s = s.substring(0, maxLen).trim();
  return s;
}

// ══════════════════════════════════════════════════════════════
// PROCESS DATA EXTRACTION — sizing parameters from SO text
// Extracts flow rates, fluid properties, temp, pressure, etc.
// ══════════════════════════════════════════════════════════════

/** Extract numeric value with unit from text */
function extractNumber(text: string, pattern: RegExp): { value: number; unit: string } | null {
  const m = text.match(pattern);
  if (!m) return null;
  const num = parseFloat(m[1].replace(/,/g, ""));
  if (isNaN(num)) return null;
  const unit = (m[2] || "").trim().toUpperCase();
  return { value: num, unit };
}

/** Convert various flow units to consistent numeric values */
function normalizeFlowUnit(unit: string): string {
  if (!unit) return "LPH";
  const u = unit.toUpperCase();
  if (u.includes("M3/HR") || u.includes("M³/HR") || u.includes("M3/H")) return "m³/h";
  if (u.includes("NM3/HR") || u.includes("NM³/HR")) return "Nm³/h";
  if (u.includes("SCFH")) return "SCFH";
  if (u.includes("GPM") || u.includes("GAL")) return "GPM";
  if (u.includes("LPM")) return "LPM";
  if (u.includes("KG/HR") || u.includes("KG/H")) return "kg/h";
  if (u.includes("LPH") || u.includes("L/H")) return "LPH";
  return unit;
}

/** Detect if service is liquid or gas */
function detectService(text: string): "liquid" | "gas" | null {
  const t = text.toLowerCase();
  const gasKeywords = ["air", "nitrogen", "n2", "oxygen", "o2", "co2", "argon", "natural gas", "lpg", "cng", "steam", "vapour", "vapor", "compressed air", "instrument air", "plant air"];
  const liquidKeywords = ["water", "dm water", "bfw", "boiler feed", "condensate", "effluent", "sewage", "slurry", "chemical", "acid", "caustic", "diesel", "fuel oil", "lube oil", "raw water", "clear water", "process water"];
  for (const kw of gasKeywords) if (t.includes(kw)) return "gas";
  for (const kw of liquidKeywords) if (t.includes(kw)) return "liquid";
  return null;
}

/** Extract TEXT-BASED operating conditions from chunk for DISPLAY.
 *  Returns key-value pairs like ["Service", "Water"], ["Op. Pressure", "Atmospheric"]
 *  This is SEPARATE from extractProcessData() which extracts numeric values for sizing.
 */
/** Keywords that mark the end of a process-data value in SO text */
const PD_STOP_WORDS = "Op\\.|Operating|Density|Flow|Size|Qty|Model|De[-\\s]?Codification|Decodification|Sp\\.\\s*Gr|Viscosity|Temp|Press|Gland|Glass|Protection|Scale|Main|Connection|Enclosure|Output|Power|Cable|Display|Communication|Accuracy|Repeatability|Response|Material|MOC|Wetted|Float|Cover|Induced|Iso|Flange|Orifice|Carrier|Fasteners|Tube|Body|Electrode|Lining|Earthing|Impeller|Wire|Bearing|Rotor|Shaft|Retainer|Mounting|Entry|Length|Third|Calibration|Manual|Branding|Pipe|Product|Make|Application|Client|Tag";

export function extractOperatingConditions(chunkText: string): [string, string][] {
  const rows: [string, string][] = [];
  const seen = new Set<string>();
  const text = chunkText.replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ");

  function add(label: string, pattern: RegExp, maxLen = 45) {
    const key = norm(label);
    if (seen.has(key)) return;
    const m = text.match(pattern);
    if (m) {
      let value = m[1].trim();
      // Hard truncate at maxLen — prevents regex over-capture from eating entire chunk
      if (value.length > maxLen) {
        const truncated = value.substring(0, maxLen);
        const lastSpace = truncated.lastIndexOf(" ");
        value = lastSpace > 8 ? truncated.substring(0, lastSpace) : truncated;
      }
      value = cleanValue(value);
      if (value) {
        seen.add(key);
        rows.push([label, value]);
      }
    }
  }

  // Build stop-word lookahead from PD_STOP_WORDS
  const SW = PD_STOP_WORDS;

  // ── Service / Application Name ──
  add("Service", new RegExp(`Application\\s*Name\\s*[:.\\-]\\s*([^\\n|]{1,40}?)(?:\\s*(?:${SW}|$))`, "i"));
  add("Service", new RegExp(`Service\\s*[:.\\-]\\s*([A-Za-z][A-Za-z0-9\\s/()+-]{1,30}?)(?:\\s*(?:${SW}|$))`, "i"));

  // ── Operating Pressure ──
  add("Op. Pressure", new RegExp(`Op\\.?\\s*(?:erating)?\\s*Press(?:ure)?\\s*[:.\\-]\\s*([^\\n|]{1,40}?)(?:\\s*(?:${SW}|$))`, "i"));
  add("Op. Pressure", new RegExp(`(?:Working|Line)\\s*Press(?:ure)?\\s*[:.\\-]\\s*([^\\n|]{1,40}?)(?:\\s*(?:${SW}|$))`, "i"));

  // ── Operating Temperature ──
  add("Op. Temperature", new RegExp(`Op\\.?\\s*(?:erating)?\\s*Temp(?:erature)?\\s*[:.\\-]\\s*([^\\n|]{1,40}?)(?:\\s*(?:${SW}|$))`, "i"));
  add("Op. Temperature", new RegExp(`(?:Working|Line)\\s*Temp(?:erature)?\\s*[:.\\-]\\s*([^\\n|]{1,40}?)(?:\\s*(?:${SW}|$))`, "i"));

  // ── Density / Sp.Gr ──
  add("Density", new RegExp(`(?:Density|Sp\\.?\\s*Gr(?:avity)?|Specific\\s*Gravity|SG)\\s*[:.\\-]\\s*([^\\n|]{1,25}?)(?:\\s*(?:${SW}|$))`, "i"));

  // ── Flow Range ──
  add("Flow Range", new RegExp(`(?:Client\\s*)?Flow\\s*Range\\s*[:.\\-]\\s*([^\\n|]{1,40}?)(?:\\s*(?:${SW}|$))`, "i"));
  add("Min Flow",   new RegExp(`Min(?:imum)?\\s*Flow\\s*[:.\\-]\\s*([^\\n|]{1,30}?)(?:\\s*(?:${SW}|$))`, "i"));
  add("Max Flow",   new RegExp(`Max(?:imum)?\\s*Flow\\s*[:.\\-]\\s*([^\\n|]{1,30}?)(?:\\s*(?:${SW}|$))`, "i"));

  // ── Viscosity ──
  add("Viscosity", new RegExp(`Viscosity\\s*[:.\\-]\\s*([^\\n|]{1,25}?)(?:\\s*(?:${SW}|$))`, "i"));

  // ── Conductivity ──
  add("Conductivity", new RegExp(`Conductivity\\s*[:.\\-]\\s*([^\\n|]{1,25}?)(?:\\s*(?:${SW}|$))`, "i"));

  return rows;
}
/** Convert ExtractedProcessData numeric fields into display rows */
function processDataToRows(pd: ExtractedProcessData): [string, string][] {
  const rows: [string, string][] = [];
  if (pd.fluidName) rows.push(["Service", pd.fluidName]);
  if (pd.operatingPressure !== null) {
    const unit = pd.pressureUnit || "bara";
    rows.push(["Op. Pressure", `${pd.operatingPressure.toFixed(2)} ${unit}`]);
  }
  if (pd.operatingTemp !== null) {
    rows.push(["Op. Temperature", `${pd.operatingTemp.toFixed(1)} °C`]);
  }
  if (pd.fluidSG !== null) rows.push(["Specific Gravity", String(pd.fluidSG)]);
  if (pd.fluidDensity !== null) rows.push(["Density", `${pd.fluidDensity.toFixed(1)} kg/m³`]);
  if (pd.fluidViscosity !== null) rows.push(["Viscosity", `${pd.fluidViscosity.toFixed(2)} cP`]);
  if (pd.flowRateMin !== null && pd.flowRateMax !== null) {
    rows.push(["Flow Range", `${pd.flowRateMin} - ${pd.flowRateMax} ${pd.flowUnit || ""}`]);
  } else if (pd.flowRateNormal !== null) {
    rows.push(["Flow Rate", `${pd.flowRateNormal} ${pd.flowUnit || ""}`]);
  }
  if (pd.lineSize) rows.push(["Line Size", pd.lineSize]);
  return rows;
}

/** Main process data extraction — scans instrument chunk text */
export function extractProcessData(chunkText: string): ExtractedProcessData {
  // ═══════════════════════════════════════════════════════════════════
  // STEP 1: Extract pipe-delimited key-value pairs from 7-column tables
  // BEFORE stripping pipes. Format: | - Label | | : Value | | | | |
  // ═══════════════════════════════════════════════════════════════════
  const pipeLabels = [
    "Service", "Application", "Fluid", "Op\\.\\s*Press", "Operating\\s*Press",
    "Op\\.\\s*Temp", "Operating\\s*Temp", "Sp\\.Gr", "Sp\\s*Gr", "Density",
    "Flow\\s*Range", "Flow\\s*Rate"
  ];
  const pipeRegex = new RegExp(
    "\\|\\s*[-\\s]*(?:" + pipeLabels.join("|") + ")\\s*[-\\s]*\\|\\s*\\|\\s*[:]\\s*([^|]+?)\\s*\\|",
    "gi"
  );
  // Build a "Label: Value\n" appendix from all pipe table rows
  const pipeExtracted = chunkText.replace(pipeRegex,
    (match: string, val: string) => {
      const labelMatch = match.match(/[-\s]*([^|:\-]+?)[-\s]*\|/);
      const label = labelMatch ? labelMatch[1].replace(/^[-\s]+/, "").trim() : "";
      return " " + label + ": " + val.trim() + "\n";
    }
  );
  // Keep only the newly-generated "Label: Value\n" lines (everything before was original)
  const pipeAppended = pipeExtracted.replace(/^[^\n]*\|[^\n]*$/gm, "");

  // ═══════════════════════════════════════════════════════════════════
  // STEP 2: Normalize all pipes to spaces for traditional regex matching
  // ═══════════════════════════════════════════════════════════════════
  const text = chunkText.replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ");

  // searchText = pipe-extracted lines + normalized text (pipe lines come FIRST
  // so they take priority in regex matching)
  const searchText = pipeAppended + "\n" + text;

  const d: ExtractedProcessData = {
    flowRateMin: null, flowRateMax: null, flowRateNormal: null, flowUnit: null,
    fluidName: null, fluidDensity: null, fluidViscosity: null, fluidSG: null,
    operatingTemp: null, operatingPressure: null, pressureUnit: null,
    lineSize: null, service: null,
  };

  // ── Flow Rate ──
  // Unit regex: must include digits for "m3/hr", "nm3/hr", "kg/hr" etc.
  const FU = String.raw`[A-Za-z0-9/³²°.%\s]*`;
  // Range separator: ~, -, or "To"/"to"
  const RS = String.raw`[\s~\-]*(?:To|to|TO)?[\s~\-]*`;
  // Min Flow: "100 LPH", "Min Flow: 100", "Minimum Flow 100 LPH"
  const minFlow = extractNumber(text, /(?:Min\s*(?:imum)?\s*Flow|Flow\s*Min)\s*[\s:.-]*\s*([\d,.]+)\s*([A-Za-z0-9/³²°.%\s]*)/i) ||
                  extractNumber(text, /(?:Client\s*)?Flow\s*Range\s*[\s:.-]*\s*([\d,.]+)\s*(?:[\s~\-]*(?:To|to|TO)?[\s~\-]*)\s*[\d,.]+\s*([A-Za-z0-9/³²°.%\s]*)/i);
  if (minFlow) { d.flowRateMin = minFlow.value; d.flowUnit = normalizeFlowUnit(minFlow.unit); }

  // Max Flow
  const maxFlow = extractNumber(text, /(?:Max\s*(?:imum)?\s*Flow|Flow\s*Max)\s*[\s:.-]*\s*([\d,.]+)\s*([A-Za-z0-9/³²°.%\s]*)/i) ||
                  extractNumber(text, /(?:Client\s*)?Flow\s*Range\s*[\s:.-]*\s*[\d,.]+\s*(?:[\s~\-]*(?:To|to|TO)?[\s~\-]*)\s*([\d,.]+)\s*([A-Za-z0-9/³²°.%\s]*)/i);
  if (maxFlow) { d.flowRateMax = maxFlow.value; if (!d.flowUnit) d.flowUnit = normalizeFlowUnit(maxFlow.unit); }

  // Normal Flow
  const normFlow = extractNumber(text, /(?:Normal\s*Flow|Flow\s*Normal|Rated\s*Flow|Design\s*Flow)\s*[\s:.-]*\s*([\d,.]+)\s*([A-Za-z0-9/³²°.%\s]*)/i);
  if (normFlow) { d.flowRateNormal = normFlow.value; if (!d.flowUnit) d.flowUnit = normalizeFlowUnit(normFlow.unit); }

  // Single flow value: "Flow Rate: 500 LPH" → use as normal
  if (!d.flowRateMin && !d.flowRateMax && !d.flowRateNormal) {
    const singleFlow = extractNumber(text, /(?:Flow\s*(?:Rate)?|Operating\s*Flow)\s*[\s:.-]*\s*([\d,.]+)\s*([A-Za-z0-9/³²°.%\s]*)/i);
    if (singleFlow) { d.flowRateNormal = singleFlow.value; d.flowUnit = normalizeFlowUnit(singleFlow.unit); }
  }

  // ── Fluid Name ──
  // searchText already includes pipe-extracted "Label: Value" lines from STEP 1 above
  const fluidMatch = searchText.match(/(?:Fluid|Liquid|Medium|Service|Application\s*Name)\s*[\s:.-]*\s*([A-Za-z][A-Za-z0-9\s/()+-]{2,40}?)(?:\s*(?:@|at|Temp|°|Density|SG|Viscosity|Pressure|\n|$))/i) ||
                     searchText.match(/(?:Fluid|Liquid|Medium|Service)\s*Name\s*[\s:.-]*\s*([A-Za-z][A-Za-z0-9\s/()+-]{2,40}?)(?:\s*(?:@|at|Temp|°|Density|SG|\n|$))/i);
  if (fluidMatch) {
    d.fluidName = cleanValue(fluidMatch[1], 30);
    // Clean up: remove trailing artifacts
    d.fluidName = d.fluidName.replace(/\s+(Temp|°|Density|SG|Viscosity|Pressure|@).*$/i, "").trim();
  }
  // Fallback: service field (single word often)
  if (!d.fluidName) {
    const svcMatch = searchText.match(/(?:Service|Application)\s*[\s:.-]*\s*([A-Za-z][A-Za-z0-9\s]{2,30}?)(?:\s*(?:\n|Size|Qty|Type|Model|Op\.?|Press|Temp|Density|₹|$))/i);
    if (svcMatch) d.fluidName = cleanValue(svcMatch[1], 30);
  }

  // ── Density ── (use pipe-normalized text)
  const densityMatch = extractNumber(searchText, /(?:Density|Sp\.\s*Gravity|Specific\s*Gravity|SG)\s*(?:@\s*\d+°?[CF]?)?\s*[\s:.-]*\s*([\d,.]+)\s*([A-Za-z/³²°.%\s]*)/i);
  if (densityMatch) {
    const unit = densityMatch.unit.toLowerCase();
    if (unit.includes("kg/m") || unit.includes("kgm")) d.fluidDensity = densityMatch.value;
    else if (unit.includes("g/cm") || unit.includes("gcc")) d.fluidDensity = densityMatch.value * 1000;
    else if (densityMatch.value < 5 && !unit.includes("kg")) {
      // Likely SG (specific gravity) — water = 1.0
      d.fluidSG = densityMatch.value;
      d.fluidDensity = densityMatch.value * 1000;
    } else {
      d.fluidDensity = densityMatch.value;
    }
  }

  // ── Viscosity ── (use pipe-normalized text)
  const viscMatch = extractNumber(searchText, /(?:Viscosity)\s*(?:@\s*\d+°?[CF]?)?\s*[\s:.-]*\s*([\d,.]+)\s*([A-Za-z/³²°.%\s]*)/i);
  if (viscMatch) {
    const unit = viscMatch.unit.toLowerCase();
    if (unit.includes("cp") || unit.includes("centipoise")) d.fluidViscosity = viscMatch.value;
    else if (unit.includes("pa.s") || unit.includes("pas")) d.fluidViscosity = viscMatch.value * 1000;
    else if (unit.includes("cst")) {
      // Approximate: cSt ≈ cP for water-like fluids (SG ~1)
      d.fluidViscosity = viscMatch.value * (d.fluidSG || 1.0);
    } else {
      d.fluidViscosity = viscMatch.value;
    }
  }

  // ── Operating Temperature ── (use pipe-normalized text)
  const tempMatch = extractNumber(searchText, /(?:Op\.?\s*(?:erating)?\s*Temp|Operating\s*Temp|Temp\.?|Temperature)\s*[\s:.-]*\s*([\d,.]+)\s*°?\s*([CF]?)/i);
  if (tempMatch) {
    d.operatingTemp = tempMatch.value;
    if (tempMatch.unit.toUpperCase() === "F") d.operatingTemp = (tempMatch.value - 32) * 5 / 9;
  }
  // Temperature range — use max as operating
  if (!d.operatingTemp) {
    const tempRange = searchText.match(/(?:Temp|Temperature)\s*[\s:.-]*\s*[\d.]+\s*[~-]\s*([\d.]+)\s*°?\s*[CF]?/i);
    if (tempRange) d.operatingTemp = parseFloat(tempRange[1]);
  }
  // Text fallback: "Ambient" → 30°C (standard ambient for India/industrial)
  if (!d.operatingTemp) {
    const ambientMatch = searchText.match(/(?:Op\.?\s*(?:erating)?\s*Temp|Operating\s*Temp|Temp)[:.\s-]*\s*(Ambient)/i);
    if (ambientMatch) d.operatingTemp = 30.0;
  }

  // ── Operating Pressure ── (use pipe-normalized text)
  const pressMatch = extractNumber(searchText, /(?:Op\.?\s*(?:erating)?\s*Press|Operating\s*Press|Working\s*Press|Press\.?|Pressure)\s*[\s:.-]*\s*([\d,.]+)\s*([A-Za-z/³²°.%\s]*)/i);
  if (pressMatch) {
    const unit = pressMatch.unit.toLowerCase();
    d.pressureUnit = unit;
    if (unit.includes("bara")) d.operatingPressure = pressMatch.value;
    else if (unit.includes("barg")) d.operatingPressure = pressMatch.value + 1.013;
    else if (unit.includes("kg/cm") || unit.includes("kgcm")) d.operatingPressure = pressMatch.value * 0.980665 + 1.013;
    else if (unit.includes("psi")) d.operatingPressure = pressMatch.value * 0.0689476;
    else if (unit.includes("mpa")) d.operatingPressure = pressMatch.value * 10;
    else if (unit.includes("bar")) d.operatingPressure = pressMatch.value; // assume bara
    else d.operatingPressure = pressMatch.value; // assume bara
  }
  // Pressure rating — not the same as operating pressure, but can be a fallback
  if (!d.operatingPressure) {
    const pressRating = extractNumber(searchText, /(?:Press\s*Rating|Pressure\s*Rating|Rating)\s*[\s:.-]*\s*(?:ANSI|DIN|PN)?\s*#?\s*([\d,.]+)/i);
    if (pressRating) d.operatingPressure = pressRating.value * 0.980665 + 1.013; // rough estimate from class rating
  }
  // Text fallback: "Atmospheric" → 1.013 bara (standard atmospheric)
  if (!d.operatingPressure) {
    const atmosMatch = searchText.match(/(?:Op\.?\s*(?:erating)?\s*Press|Operating\s*Press|Press|Pressure)[:.\s-]*\s*(Atmospheric|Atm|ATM)/i);
    if (atmosMatch) { d.operatingPressure = 1.013; d.pressureUnit = "bara"; }
  }

  // ── Line Size ──
  const lineSizeMatch = text.match(/(?:Line\s*Size|Pipe\s*Size)\s*[\s:.-]*\s*(\d+)\s*(NB|MM| inch|\"|\')/i) ||
                        text.match(/(\d+)\s*(NB|MM)\s*(?:Pipe|Line)/i);
  if (lineSizeMatch) d.lineSize = lineSizeMatch[1] + lineSizeMatch[2].toUpperCase();

  // ── Service Type (liquid/gas) ──
  d.service = detectService(text);

  return d;
}

function isKnownLabel(line: string): string | null {
  const n = norm(line);
  if (KNOWN_LABELS.has(n)) return LABEL_ALIASES[n];
  return null;
}

/** Extract DESIGN SPECIFICATIONS key-value pairs from a chunk.
 *  Handles:
 *    Water Equivalent          : After Confirmation
 *    Glass Tube Type           : After Confirmation
 *  Returns empty array if no DESIGN SPECIFICATIONS section found.
 *  "After Confirmation" and empty values are replaced with "Pending".
 */
function extractDesignSpecs(chunkLines: string[]): [string, string][] {
  const DESIGN_FIELDS = [
    "WATER EQUIVALENT",
    "GLASS TUBE TYPE",
    "BODY RANGE DIAMETER",
    "RANGEABILITY",
    "F/F HT",
    "F/F HEIGHT",
    "ACCURACY",
    "BRANDING",
    "PACKING",
    "END CONNECTION",
    "MOC BODY",
    "MOC WETTED PARTS",
    "SCALE LENGTH",
    "MINIMUM FLOW",
    "MAXIMUM FLOW",
    "FLOW RANGE",
    "PROCESS CONNECTION",
    "MOUNTING",
    "FLUID",
    "DISPLAY TYPE",
    "OUTPUT",
    "CABLE ENTRY",
    "ENCLOSURE",
    "MEASURING TUBE",
    "MOC TUBE",
    "MOC FLOAT",
    "MOC END FITTING",
    "MOC CENTER BUSH",
    "MOC SHAFT",
    "MOC GLASS",
    "MOC GASKET",
    "TYPE OF SWITCH",
    "NO. OF SWITCH",
  ];

  const rows: [string, string][] = [];
  let inSection = false;
  for (const rawLine of chunkLines) {
    const line = rawLine.replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();

    // Detect section header
    if (/^DESIGN\s*SPECIFICATIONS?/i.test(line)) {
      inSection = true;
      continue;
    }
    // End section when we hit another known section header
    if (inSection && /^(ORIFICE\s*PLATE\s*CALCULATION|TECHNICAL\s*SPECIFICATIONS?|MODEL\s*NO|DE[-\s]?CODIFICATION|OPERATING|INSTRUMENT\s*DATASHEET)/i.test(line)) {
      inSection = false;
      continue;
    }
    if (!inSection) continue;

    // Try each known field pattern
    for (const field of DESIGN_FIELDS) {
      const pattern = new RegExp(
        "^[-\\s]*" + field.replace(/\s+/g, "\\s+") + "\\s*[:.=-]\\s*(.*)",
        "i"
      );
      const m = line.match(pattern);
      if (m) {
        const value = normaliseValue(m[1]);
        rows.push([field.replace(/\b\w/g, c => c.toUpperCase()).replace(/F\/f Ht/i, "F/F Ht"), value]);
        break;
      }
    }
  }
  return rows;
}

/** Extract ORIFICE PLATE CALCULATION key-value pairs from a chunk.
 *  Handles:
 *    Orifice Bore    : After Confirmation
 *    DP              : After Confirmation
 *  "After Confirmation" and empty values are replaced with "Pending".
 */
function extractOrificeCalculations(chunkLines: string[]): [string, string][] {
  const ORIFICE_FIELDS = [
    "ORIFICE BORE",
    "DP",
    "BETA RATIO",
    "PRESSURE LOSS",
    "REYNOLDS NO",
    "REYNOLDS NUMBER",
    "FLOW RATE",
    "PIPE ID",
    "PIPE OD",
    "FLANGE RATING",
    "FLANGE STANDARD",
    "BETA",
    "CD",
    "DISCHARGE COEFFICIENT",
    "MATERIAL",
    "MOC ORIFICE",
    "MOC PLATE",
    "TYPE OF TAP",
    "CORNER TAP",
    "FLANGE TAP",
    "PIPE TAP",
    "MANOMETER RANGE",
  ];

  const rows: [string, string][] = [];
  let inSection = false;
  for (const rawLine of chunkLines) {
    const line = rawLine.replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();

    // Detect section header
    if (/^ORIFICE\s*PLATE\s*CALCULATION/i.test(line)) {
      inSection = true;
      continue;
    }
    // End section when we hit another known section header
    if (inSection && /^(DESIGN\s*SPECIFICATIONS?|TECHNICAL\s*SPECIFICATIONS?|MODEL\s*NO|DE[-\s]?CODIFICATION|INSTRUMENT\s*DATASHEET)/i.test(line)) {
      inSection = false;
      continue;
    }
    if (!inSection) continue;

    // Try each known field pattern
    for (const field of ORIFICE_FIELDS) {
      const pattern = new RegExp(
        "^[-\\s]*" + field.replace(/\s+/g, "\\s+") + "\\s*[:.=-]\\s*(.*)",
        "i"
      );
      const m = line.match(pattern);
      if (m) {
        const value = normaliseValue(m[1]);
        rows.push([field, value]);
        break;
      }
    }
  }
  return rows;
}

/** Normalise extracted values: blank / "After Confirmation" → "Pending" */
function normaliseValue(raw: string): string {
  const v = raw.trim();
  if (!v || v === "" || /^after\s*confirmation$/i.test(v)) return "Pending";
  return v;
}

// ══════════════════════════════════════════════════════════════
// FORMAT 2: Flowtech SO Acknowledgement (S35834 style)
// ══════════════════════════════════════════════════════════════

/** Detect if a line contains a Flowtech model code that identifies an instrument */
function hasModelCode(line: string): boolean {
  // Match FMIPL-XXX-... model codes where XXX is a product family code
  const m = line.match(/\bFMIPL-([A-Z]{2,6})-/i);
  if (!m) return false;
  const code = m[1].toUpperCase();
  // Known product family codes in Flowtech model numbers
  const knownCodes = [
    "EMF", "FT", "FI", "VG", "SMMLI", "TMMLI", "MLI", "MLG",
    "RLG", "TLI", "OG", "DP", "SP", "MP", "DLS", "SLS", "TLS",
    "FBG", "RB", "TB", "FB",
  ];
  return knownCodes.includes(code);
}

function parseSOAcknowledgement(text: string): ParsedSO {
  const lines = text.split(/\n/).map(l => l.trim());
  const instruments: ParsedInstrument[] = [];
  const header = extractHeader(text);

  // Find item boundaries:
  // Pattern A: "1. Turbine Flowmeter 80NB" or "1Electromagnetic Flowmeter 100NB"
  //            → size on same line
  // Pattern B: "1Side Mounted Magnetic Level Indicator" (next line: "- 25NB")
  //            → size on NEXT line — two-line lookahead
  // Must ALSO contain an instrument keyword — prevents model number lines like "1-CE2-CP1-100NB"
  const itemPositions: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Strip pipe delimiters (added by PDF extractor for column gaps) for regex matching
    const lineClean = line.replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
    const line2Clean = (lines[i + 1] || "").replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
    const line3Clean = (lines[i + 2] || "").replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();

    // Pattern A: size on same line
    const sizeOnSameLine = (/^\d+\b.*?\d+\s*(NB|MM)\b/i.test(lineClean) || /^\d+[A-Z].*?\d+\s*(NB|MM)/i.test(lineClean));
    // Pattern B: item start on this line, size on next line(s)
    //   This line: starts with digit+letter (or digit + space/pipe + letter), contains instrument keyword
    //   Next 1-2 lines: contain size like "25NB", "- 25NB", "25NB-680MM"
    const isItemStart = /^\d+\.?\s*[A-Z]/i.test(lineClean) && INSTRUMENT_KEYWORDS.test(lineClean);
    const sizeOnNextLine = /^[-\s]*\d+\s*(NB|MM)\b/i.test(line2Clean);
    const sizeOnNextNextLine = /^[-\s]*\d+\s*(NB|MM)\b/i.test(line3Clean);
    // Also match "25NB-680MM" pattern (size + range)
    const sizeRangePattern = /^[-\s]*\d+\s*(NB|MM)[-\/]/i.test(line2Clean) || /^[-\s]*\d+\s*(NB|MM)[-\/]/i.test(line3Clean);

    // Pattern B2: For SOs where size appears later in the chunk (e.g. in decodification or "Flange Size:" line)
    // Look ahead up to 15 lines for size indicators when we have a strong item start
    let sizeInChunk = false;
    if (isItemStart && !sizeOnSameLine && !sizeOnNextLine && !sizeOnNextNextLine && !sizeRangePattern) {
      const chunkAhead = lines.slice(i + 1, Math.min(i + 20, lines.length)).join("\n");
      sizeInChunk = /\b\d+\s*(NB|MM)\b/i.test(chunkAhead) || /(?:flange\s*)?size\s*[:.-]\s*\d+\s*(NB|MM)/i.test(chunkAhead);
    }

    // Pattern C: FMIPL model code on this line (e.g. "FMIPL-SMMLI-CU-CU-...") + size nearby
    const hasCode = hasModelCode(lineClean);
    const sizeNearby = sizeOnSameLine || sizeOnNextLine || sizeOnNextNextLine || sizeRangePattern || sizeInChunk;

    if ((sizeOnSameLine || (isItemStart && (sizeOnNextLine || sizeOnNextNextLine || sizeRangePattern || sizeInChunk)) || (hasCode && sizeNearby)) && INSTRUMENT_KEYWORDS.test(lineClean)) {
      itemPositions.push(i);
    }
  }

  for (let idx = 0; idx < itemPositions.length; idx++) {
    const start = itemPositions[idx];
    const end = idx + 1 < itemPositions.length ? itemPositions[idx + 1] : lines.length;
    const chunkLines = lines.slice(start, end);
    const chunkText = chunkLines.join("\n");

    const headerLine = lines[start];
    const nextLine = start + 1 < lines.length ? lines[start + 1] : "";

    // Handle: "1. Turbine Flowmeter 80NB" OR "1Electromagnetic Flowmeter 100NB"
    // Pattern A: size on same line
    const headerLineClean = headerLine.replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
    const nextLineClean = nextLine.replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
    let itemMatch = headerLineClean.match(/^(\d+)\.?\s*(.*?)(\d+)\s*(NB|MM)/i) ||
                    headerLineClean.match(/^(\d+)([A-Z].*?)(\d+)\s*(NB|MM)/i);

    // Pattern B: size on next line (e.g. "1Side Mounted Magnetic Level Indicator" + "- 25NB")
    if (!itemMatch) {
      const sizeNextMatch = nextLineClean.match(/^[-\s]*(\d+)\s*(NB|MM)/i);
      const headerMatch = headerLineClean.match(/^(\d+)\.?\s*(.*)/i) || headerLineClean.match(/^(\d+)([A-Z].*)/i);
      if (sizeNextMatch && headerMatch) {
        itemMatch = [headerMatch[0], headerMatch[1], headerMatch[2], sizeNextMatch[1], sizeNextMatch[2]];
      }
    }

    const srNo = itemMatch ? parseInt(itemMatch[1]) : idx + 1;
    const size = itemMatch ? itemMatch[3] + " " + itemMatch[4] : "";
    // Extract type using synonym-based detection for robustness
    let rawType = itemMatch ? cleanValue(itemMatch[2]).replace(/^[-\s|]+/, "").replace(/\s*-\s*$/, "").trim() : "";
    // Strip commercial data that appears on the same line (HSN code, qty, price, discount, amount)
    // e.g. "Side Mounted Magnetic Level Indicator  90261020 18 Nos.  20.000  29500.00 12.00%  519200.00"
    const commercialStrip = rawType.match(/^(.*?)(?:\s{2,}\d{6,}\s+\d+\s*Nos?\.?|\s+\d+\s*Nos?\.?|\s{2,}\d{5,}\.\d{2})/i);
    if (commercialStrip) rawType = commercialStrip[1].trim();
    // Guard: if rawType is garbage (starts with dash/pipe, too short, or all uppercase codes),
    // try to detect from chunk text alone instead
    const isGarbageType = rawType.length < 5 || /^[-|]/.test(rawType) || /^[A-Z0-9\-]+$/.test(rawType);
    if (isGarbageType || !rawType) {
      // Try to find type from chunk text (look for instrument keywords)
      const chunkClean = chunkText.replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ");
      const chunkTypeMatch = chunkClean.match(/(Electromagnetic Flowmeter|Vortex Flowmeter|Turbine Flowmeter|Rotameter|Magnetic Level Gauge|Magnetic Level Indicator|Side Mounted Magnetic Level|Displacer Type Level Switch|Level Switch|Level Gauge|Level Indicator|Pressure Transmitter|Sight Glass)/i);
      if (chunkTypeMatch) {
        rawType = chunkTypeMatch[1];
      }
    }
    // Fallback: "Type : Double Window Type" in chunk → use for type detection
    if (!rawType || rawType.length < 5) {
      const typeLineMatch = chunkText.match(/\bType\s*[:\-]\s*(.+?)(?:\n|$)/i);
      if (typeLineMatch) {
        const typeVal = cleanValue(typeLineMatch[1]);
        if (typeVal.length >= 3) rawType = typeVal;
      }
    }
    // ═══ MODEL-CODE FIRST DETECTION (most reliable) ═══
    // FMIPL-EFM-... → Electromagnetic Flow Meter
    let type: string;
    const modelCodeDetection = detectByModelCode(chunkText);
    if (modelCodeDetection) {
      type = modelCodeDetection.matchedName;
    } else {
      // ═══ HEADER-ONLY CANONICAL MATCHING ═══
      // ONLY use rawType + size, NEVER the full chunk text.
      // The chunk contains material specs that contaminate matching.
      const canonicalMatch = matchCanonicalProduct(rawType + " " + size);
      if (canonicalMatch) {
        type = canonicalMatch.matchedName;
      } else {
        // Fallback: synonym-based detection on header + chunk
        const detectedFamily = detectProductFamily(rawType + " " + size + " " + chunkText);
        type = detectedFamily ? getProductLabel(detectedFamily) : rawType;
      }
    }

    // ════════════════════════════════════════════════════════════
    // PERMANENT QUALIFIER PRESERVATION (product-family-agnostic)
    // ════════════════════════════════════════════════════════════
    // SO header lines often contain qualifying adjectives that are
    // critical for GAD matching (e.g. "By-Pass Glass Tube Rotameter"
    // must stay as "By-Pass ... Rotameter").  We detect ANY qualifier
    // that appears in the header line (rawType) but is missing from
    // the canonical label, and prepend it automatically.
    //
    // CRITICAL: We ONLY check rawType (the header line), NOT the full
    // chunk text.  The chunk contains material specs like "Transparent
    // Acrylic" which are NOT product qualifiers.
    const QUALIFIER_PREFIXES = [
      "by-pass", "bypass",           // By-Pass Rotameter
      "side mounted",                 // Side Mounted Magnetic Level Gauge
      "top mounted",                  // Top Mounted Magnetic Level Gauge
      "acrylic body",                 // Acrylic Body Rotameter
      "metal tube",                   // Metal Tube Rotameter
      "double window",                // Double Window Sight Glass
      "full view",                    // Full View Sight Glass
      "allen bolt",                   // Allen Bolt Sight Glass
      "smart",                        // Smart Pressure Transmitter
      "differential pressure",        // Differential Pressure Transmitter
      "miniature",                    // Miniature Pressure Transmitter
      "reflex",                       // Reflex Level Gauge
      "tubular",                      // Tubular Level Gauge
      "float & board", "float board", // Float & Board Level Gauge
      "radar",                        // Radar Level Transmitter
      "hydrostatic",                  // Hydrostatic Level Transmitter
      "displacer",                    // Displacer Level Switch
      "oval gear",                    // Oval Gear Flow Meter
      "ultrasonic",                   // Ultrasonic Flow Meter
      "orifice flange",               // Orifice Flange Assembly
    ];
    // ═══ ONLY check rawType (header line), NEVER the full chunk ═══
    const rawLower = rawType.toLowerCase();
    const typeLower = type.toLowerCase();
    for (const qualifier of QUALIFIER_PREFIXES) {
      if (rawLower.includes(qualifier) && !typeLower.includes(qualifier)) {
        const capitalised = qualifier
          .split(/\s+/)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        type = capitalised + " " + type;
        break;
      }
    }

    // Model-code detection is now handled FIRST in detectProductFamily
    // via detectByModelCode(). No override needed here.

    let qty = 1;
    // Pattern 1: Labeled qty field (Qty: 2)
    const qtyMatch = chunkText.match(/(?:Qty|Quantity)\s*[:.]\s*(\d+)/i) ||
                     chunkText.match(/Total Quantity\s*[:.]\s*(\d+)/i);
    if (qtyMatch) qty = parseInt(qtyMatch[1]);
    // Pattern 2: Qty embedded in commercial data on item line
    // e.g. "1Displacer Type Level Switch 85365090 18 Nos.  2.000  16200.00 15.00%  27540.00"
    // The qty is a decimal number after "Nos." and before the rate (large number with decimal)
    if (qty === 1) {
      const commercialQtyMatch = headerLineClean.match(/\bNos?\.?\s+(\d+\.\d+)\s+\d{3,}\.\d{2}/) ||
                                  headerLineClean.match(/\bUOM\s+\S+\s+(\d+\.\d+)\s+\d{3,}\.\d{2}/);
      if (commercialQtyMatch) qty = parseInt(parseFloat(commercialQtyMatch[1]).toString());
    }
    // Pattern 3: Qty on Total line in delivery schedule
    // e.g. "Total Quantity : 2.000"
    if (qty === 1) {
      const totalQtyMatch = chunkText.match(/Total Quantity\s*[:.]\s*(\d+(?:\.\d+)?)/i);
      if (totalQtyMatch) qty = parseInt(parseFloat(totalQtyMatch[1]).toString());
    }

    let service = "";
    const svcMatch = chunkText.match(/Application Name\s*[:.]\s*(.+)/i) ||
                     chunkText.match(/Application\s*[:.]\s*(.+)/i);
    if (svcMatch) service = cleanValue(svcMatch[1], 60);

    // Extract Model No. (multi-line: "Model No.:" followed by value on next lines)
    let model = "";
    for (let ci = 0; ci < chunkLines.length; ci++) {
      if (/^MODEL\s*NO\.?\s*[:]?\s*$/i.test(chunkLines[ci])) {
        // Multi-line model: collect subsequent lines until break
        const parts: string[] = [];
        for (let mi = ci + 1; mi < chunkLines.length; mi++) {
          const ml = chunkLines[mi].trim();
          if (!ml) break;
          // Stop at known section headers
          if (/^(DE[-\s]?CODIFICATION|DELIVERY|DOCUMENTS|TECHNICAL|OPERATING|PROCESS|LINE\s*SIZE|C\/C\s*HEIGHT|DESIGN\s*TYPE|OTHER\s*DETAILS|No\.\s*Item|Page\s+\d+)/i.test(ml)) break;
          // Stop at key-value lines that are clearly NOT model names
          // e.g. "Length: 1350 mm", "Flange Size: 50 NB", "Size: 50NB"
          if (/^(Length|Flange\s*Size|Size|Qty|Quantity|Tag|Application|Make|Service|Op\.|Operating|Pressure|Temp|Flow|Density|Decodification|HSN|GST|UOM|Rate|Amount|Discount|No\.\s*of)\s*[:.]/i.test(ml)) break;
          // Stop at pipe-delimited rows
          if (/^[-\s]*[A-Za-z0-9\s/.\-]+?\s*[|]\s*[:]\s*(.+)/i.test(ml)) break;
          // Stop at page markers
          if (/^Page\s+\d+\s+of/i.test(ml)) break;
          parts.push(ml);
        }
        if (parts.length > 0) {
          model = parts.join("-").replace(/[-]{2,}/g, "-");
        }
        break;
      }
    }
    // Fallback: line-by-line search for MODEL NO. → extract value from same line
    // Handles: "MODEL NO.: :FlowGT RS180" (double colons) and "MODEL NO.: FlowMag S900"
    if (!model) {
      for (const cl of chunkLines) {
        const clTrim = cl.trim();
        // Match "MODEL NO.: :Value" or "MODEL NO.: Value" or "MODEL: Value"
        const m = clTrim.match(/^MODEL\s*NO\.?\s*[:.\-]+\s*:?\s*(.+)/i) ||
                  clTrim.match(/\bMODEL\s*[:.]+\s*(.+)/i);
        if (m) {
          const val = cleanValue(m[1], 80);
          // Only accept if it looks like a model name (starts with letter/number, reasonable length)
          if (val.length >= 2 && /^[A-Z0-9]/i.test(val)) {
            model = val;
            break;
          }
        }
      }
    }
    // Fallback: any FMIPL- pattern in the chunk
    if (!model) {
      const fmMatch = chunkText.match(/\b(FMIPL-[A-Z0-9\-/]+)/i);
      if (fmMatch) model = cleanValue(fmMatch[1], 80);
    }

    // Extract De-Codification No. (multi-line with same-line start)
    // Handles: "DECODIFICATION:FMIPL-GTRM-WP2-F-S2-F1-" + "FS-RS-SA-BP-BT-25NB"
    // Handles: "De-Codification No.:" label on one line, value on next line(s)
    // Handles: continuation lines with leading dashes: "-CU-CU-40NB-1160MM"
    // CRITICAL: Must NOT capture process data lines (e.g. "Line Size: 40NB", "C/C Height: 1160mm")
    let decodNo = "";
    const decodLines: string[] = [];

    /** Validate a candidate de-codification continuation line.
     *  A valid de-cod part contains ONLY: A-Z, 0-9, hyphens (and optional trailing period)
     *  It must NOT contain: colons, descriptive labels, spaces, slashes, etc.
     */
    function isDecodPart(s: string): boolean {
      // Strip optional trailing period (e.g. "1160MM.")
      const cleaned = s.replace(/\.$/, "");
      // Must be at least 2 chars, start and end with alphanumeric
      // Contains only: A-Z, a-z, 0-9, hyphens
      return cleaned.length >= 2 && /^[A-Z0-9][A-Z0-9\-]*[A-Z0-9]$/i.test(cleaned);
    }

    /** Strong stop-word detection for process data lines that appear after de-codification */
    function isDecodStopLine(s: string): boolean {
      // Known section headers that always end de-cod collection
      if (/^(MODEL|MIN FLOW|MAX FLOW|DELIVERY|OPERATING|PRESSURE|TEMP|ACCURACY|MAKE|TYPE|TAG|No\.|Page\s*\d+)/i.test(s)) return true;
      // Pipe-delimited key-value rows (e.g. "| Line Size | : | 40NB |")
      if (/^[-\s]*[A-Za-z0-9\s/.\-]+?\s*[|]\s*[:]\s*(.+)/i.test(s)) return true;
      // Date lines
      if (/^\d+\s+\d{2}\/\d{2}\/\d{4}/.test(s)) return true;
      // ANY line with a colon followed by a value (e.g. "Line Size: 40NB", "C/C Height: 1160mm")
      // These are process data labels, NEVER de-codification parts
      if (/^[A-Za-z][A-Za-z\s/()\-]+\s*[:\-]\s*\S+/i.test(s)) return true;
      // Lines that are too long to be de-cod parts (>60 chars is almost certainly process data)
      if (s.length > 60) return true;
      return false;
    }

    for (let ci = 0; ci < chunkLines.length; ci++) {
      const line = chunkLines[ci].trim();
      // Pattern A: "DECODIFICATION:FMIPL-..." — value starts on same line
      // Also matches "De-Codification No.: FMIPL-..." with optional "No."
      const sameLineMatch = line.match(/^DE[-\s]?CODIFICATION\s*(?:NO\.?)?\s*[:]\s*(FMIPL-[A-Z0-9\-]+)/i);
      if (sameLineMatch) {
        decodLines.push(sameLineMatch[1]);
        // Continue collecting continuation lines
        for (let di = ci + 1; di < chunkLines.length; di++) {
          const dl = chunkLines[di].trim();
          if (!dl) break;
          if (isDecodStopLine(dl)) break;
          // Strip leading dash from continuation lines
          const cleanDl = dl.replace(/^[-\s]+/, "").replace(/\.$/, "");
          if (isDecodPart(cleanDl)) {
            decodLines.push(cleanDl);
          } else break;
        }
        break;
      }
      // Pattern B: "De-Codification No.:" or "De-Codification:" label alone, values on following lines
      // This handles the case where the label is on one line and FMIPL code starts on the NEXT line
      if (/^DE[-\s]?CODIFICATION\s*(?:NO\.?)?\s*[:]\s*$/i.test(line)) {
        for (let di = ci + 1; di < chunkLines.length; di++) {
          const dl = chunkLines[di].trim();
          if (!dl) break;
          if (isDecodStopLine(dl)) break;
          // Strip leading dash from continuation lines (e.g. "-CU-CU-40NB-1160MM")
          const cleanDl = dl.replace(/^[-\s]+/, "").replace(/\.$/, "");
          if (isDecodPart(cleanDl)) {
            decodLines.push(cleanDl);
          } else break;
        }
        break;
      }
    }
    if (decodLines.length > 0) {
      decodNo = decodLines.join("-").replace(/[-]{2,}/g, "-").replace(/[-]$/g, "").replace(/^[-]/g, "");
    } else {
      // Fallback: single-line extraction with optional "No."
      const decod = chunkText.match(/DE[-\s]?CODIFICATION\s*(?:NO\.?)?\s*[:.]\s*([A-Z0-9\-]+)/i);
      if (decod) decodNo = decod[1];
    }
    // ═══════════════════════════════════════════════════════════════
    // SEPARATE: Model Name (e.g. "FlowGT RS180") vs De-Codification (e.g. "FMIPL-GTRM-...")
    // CRITICAL: These are TWO DIFFERENT FIELDS and must never be merged
    // ═══════════════════════════════════════════════════════════════
    let modelName = model;

    // Case A: Model No. field CONTAINS the FMIPL de-codification
    // → model field IS the de-codification, model name must come from elsewhere
    if (model && model.startsWith("FMIPL-")) {
      decodNo = model; // The model field IS the de-codification
      modelName = "";  // Will be derived from FMIPL code lookup below
    }

    // Case B: Model No. field is the actual model name (e.g. "FlowGT RS180")
    // AND separate DE-CODIFICATION was also extracted
    // → model = modelName, decodNo already set from extraction above
    // Nothing to do — modelName already = model

    // Case C: No explicit DE-CODIFICATION found, but model IS an FMIPL code
    if (!decodNo && model && model.startsWith("FMIPL-")) {
      decodNo = model;
      modelName = ""; // Will be derived from lookup
    }

    // Derive Model Name from de-codification lookup table when not explicitly stated
    if (!modelName && decodNo) {
      modelName = ""; // Not specified in SO — will show "Not Specified"
    }

    // Final fallback: if modelName still empty but we have a non-FMIPL model
    // that looks like a model name (has letters and numbers), use it
    if (!modelName && model && !model.startsWith("FMIPL-") && /[A-Za-z]/.test(model) && model.length > 2) {
      modelName = model;
    }

    // Extract Tag No. from chunk text (overrides auto-generated tag)
    // Handles: "Tag No.: LG-001", "- Tag No. | : LG-001", pipe-delimited, etc.
    let tagNo = "";
    const tagPatterns = [
      /Tag\s*No\.?\s*[\s|:\-.]*\s*([A-Z0-9][A-Z0-9\-]+)/i,
      /Tag\s*No\.?\s*[:.\-]\s*([A-Z0-9][A-Z0-9\-]+)/i,
    ];
    for (const tp of tagPatterns) {
      const tagMatch = chunkText.match(tp);
      if (tagMatch) { tagNo = tagMatch[1].trim(); break; }
    }
    // Fallback: generate from decodNo size code
    if (!tagNo && decodNo) {
      const sizeCode = decodNo.match(/(\d+)NB/i);
      tagNo = sizeCode ? "FT-" + sizeCode[1] : "ITEM-" + srNo;
    }
    if (!tagNo) {
      tagNo = "ITEM-" + srNo;
    }

    // ── All technical data into ONE flat row list ──
    const allRows: [string, string][] = [];
    const seenKeys = new Set<string>();
    function addRow(label: string, value: string) {
      const key = norm(label);
      if (!key || seenKeys.has(key) || isCommercialTerm(label)) return;
      seenKeys.add(key);
      allRows.push([label, value]);
    }

    if (type) addRow("Type", type);
    if (model) addRow("Model", model);
    if (size) addRow("Size", size);
    if (service) addRow("Service", service);
    if (decodNo) addRow("De-Codification No.", decodNo);

    const extractors: [RegExp, string][] = [
      [/Operating Pressure\s*[:.]\s*(.+)/i, "Op. Pressure"],
      [/Op\.?\s*Press(?:ure)?\s*[:.]\s*(.+)/i, "Op. Pressure"],
      [/Operating Temperature\s*[:.]\s*(.+)/i, "Op. Temperature"],
      [/Op\.?\s*Temp(?:erature)?\s*[:.]\s*(.+)/i, "Op. Temperature"],
      [/Density\s*[:.]\s*(.+)/i, "Density"],
      [/Sp\.?\s*Gr(?:avity)?\s*[:.]\s*(.+)/i, "Sp. Gravity"],
      [/Specific\s*Gravity\s*[:.]\s*(.+)/i, "Sp. Gravity"],
      [/Operating Flow\s*[:.]\s*(.+)/i, "Operating Flow"],
      [/Client\s*Flow\s*Range\s*[:.]\s*(.+)/i, "Flow Range"],
      [/Flow\s*Range\s*[:.]\s*(.+)/i, "Flow Range"],
      [/Min Flow\s*[:.]\s*(.+)/i, "Min Flow"],
      [/Max Flow\s*[:.]\s*(.+)/i, "Max Flow"],
      [/Pressure Range\s*[:.]\s*(.+)/i, "Pressure Range"],
      [/Temperature Range\s*[:.]\s*(.+)/i, "Temperature Range"],
      [/Viscosity(?:\s*Range)?\s*[:.]\s*(.+)/i, "Viscosity"],
      [/Conductivity\s*[:.]\s*(.+)/i, "Conductivity"],
    ];
    for (const [pattern, label] of extractors) {
      const m = chunkText.match(pattern);
      if (m) addRow(label, cleanValue(m[1]));
    }

    const make = chunkText.match(/Make\s*[:.]\s*(.+)/i);
    if (make) addRow("Make", cleanValue(make[1]));
    const hsn = chunkText.match(/HSN\s*[:\/]*\s*(\d+)/i);
    if (hsn) addRow("HSN Code", hsn[1]);

    // Pipe-delimited technical specs with FULL-FORM section headers
    let lastSectionHeader = "";
    for (let li = 0; li < chunkLines.length; li++) {
      const line = chunkLines[li].trim();

      // Track section headers (ALL CAPS lines without pipes that precede pipe rows)
      if (/^[A-Z][A-Z\s/.()]+$/.test(line) && line.length > 3 && line.length < 60 && !line.includes("|")) {
        lastSectionHeader = line.replace(/\s+/g, " ").trim();
        continue;
      }

      // Also catch "TECHNICAL SPECIFICATIONS" / "OTHER DETAILS" etc.
      if (/^(TECHNICAL\s*SPECIFICATIONS?|OTHER\s*DETAILS?|ACCESSORIES|DOCUMENTS\s*REQUIRED|VARIABLE\s*COMPONENTS)/i.test(line)) {
        lastSectionHeader = "";
        continue;
      }

      const pipeMatch = line.match(/^[-\s]*([A-Za-z0-9\s/.\-]+?)\s*[|]\s*[:]\s*(.+)/i);
      if (pipeMatch) {
        const shortCode = pipeMatch[1].trim();
        const value = cleanValue(pipeMatch[2]);
        // Use section header as full-form label; fall back to short code with lookup
        const fullLabel = lastSectionHeader || isKnownLabel(shortCode) || DECOD_LABEL_MAP[shortCode] || shortCode;
        if (value && fullLabel.length > 0 && fullLabel.length < 60) {
          addRow(fullLabel, value);
        }
      }
    }

    const accMatch = chunkText.match(/[-\s]*ACCURACY\s*[|]\s*[:]\s*(.+)/i);
    if (accMatch) addRow("Accuracy", cleanValue(accMatch[1]));

    // Extract process data for sizing calculations (needed before section building)
    const processData = extractProcessData(chunkText);

    // ════════════════════════════════════════════════════════════
    // PROCESS DATA / OPERATING CONDITIONS section
    // Extract text-based process data AND numeric process data
    // ════════════════════════════════════════════════════════════
    const processDataRows: [string, string][] = [];
    const pdSeen = new Set<string>();

    // 1. Text-based operating conditions (e.g. "Op. Pressure: Atmospheric")
    const opConds = extractOperatingConditions(chunkText);
    for (const [label, value] of opConds) {
      const key = norm(label);
      if (!pdSeen.has(key)) {
        pdSeen.add(key);
        processDataRows.push([label, value]);
      }
    }

    // 2. Numeric process data converted to display rows
    const numericPdRows = processDataToRows(processData);
    for (const [label, value] of numericPdRows) {
      const key = norm(label);
      if (!pdSeen.has(key)) {
        pdSeen.add(key);
        processDataRows.push([label, value]);
      }
    }

    // ── DEDUPLICATION: Remove process-data fields from technical specs
    // so they only appear in PROCESS DATA section, not both
    const PROCESS_DATA_KEYS = new Set([
      "service", "oppressure", "optemperature", "oppress", "optemp",
      "density", "spgravity", "spgr", "specificgravity",
      "flowrange", "clientflowrange", "minflow", "maxflow",
      "operatingflow", "viscosity", "conductivity",
      "pressurerange", "temperaturerange", "viscosityrange",
    ]);
    const filteredAllRows = allRows.filter(([label]) => !PROCESS_DATA_KEYS.has(norm(label)));

    const sections: SectionData[] = [];

    // Insert PROCESS DATA section FIRST if we have any rows
    if (processDataRows.length > 0) {
      sections.push({ title: "PROCESS DATA", rows: processDataRows });
    }

    if (filteredAllRows.length > 0) {
      sections.push({ title: "TECHNICAL SPECIFICATIONS", rows: filteredAllRows });
    }

    // ════════════════════════════════════════════════════════════
    // DESIGN SPECIFICATIONS & ORIFICE CALCULATIONS extraction
    // ════════════════════════════════════════════════════════════
    const designSpecsRows = extractDesignSpecs(chunkLines);
    if (designSpecsRows.length > 0) {
      sections.push({ title: "DESIGN SPECIFICATIONS", rows: designSpecsRows });
    }
    const orificeCalcRows = extractOrificeCalculations(chunkLines);
    if (orificeCalcRows.length > 0) {
      sections.push({ title: "ORIFICE PLATE CALCULATION", rows: orificeCalcRows });
    }

    // Auto-detect process connection size & standard from instrument text
    const processConnection = detectProcessConnection(chunkText) ||
                              detectProcessConnection(headerLine + " " + size) || null;

    instruments.push({ srNo, tagNo, type, service, size, qty, model, modelName, decodNo, sections, gadNote: "", processConnection, customDimensions: [], processData });
  }

  // Global safety-net: normalise "After Confirmation" → "Pending" in ALL values
  for (const inst of instruments) {
    for (const section of inst.sections) {
      for (const row of section.rows) {
        const v = row[1].trim();
        if (!v || /^after\s*confirmation$/i.test(v)) row[1] = "Pending";
      }
    }
  }

  header.totalLineItems = instruments.length;
  if (!header.totalQty && instruments.length > 0) {
    const total = instruments.reduce((s, i) => s + i.qty, 0);
    header.totalQty = total > 0 ? `${total} Nos.` : "";
  }

  return { header, instruments };
}

// ══════════════════════════════════════════════════════════════
// FORMAT 1: S35750 style with INSTRUMENT SUMMARY table
// ══════════════════════════════════════════════════════════════
function parseS35750Format(text: string): ParsedSO {
  const header = extractHeader(text);
  const lines = text.split(/\n/);

  const summaryItems = parseInstrumentSummary(text);

  // Parse per-instrument pages — store raw text too for fallback extraction
  const pageDetails = new Map<string, { sections: SectionData[]; gadNote: string; rawText: string }>();

  for (let i = 0; i < lines.length - 2; i++) {
    const line = lines[i].trim();
    if (!/^(EMF|FI|FT|VG|LI|SMMLI|TMMLI|MLI|MLG)-[A-Z0-9]/i.test(line)) continue;

    let hasDatasheet = false;
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      if (/INSTRUMENT\s*DATASHEET/i.test(lines[j])) { hasDatasheet = true; break; }
    }
    if (!hasDatasheet) continue;

    let endIdx = lines.length;
    for (let j = i + 1; j < lines.length; j++) {
      const nextLine = lines[j].trim();
      if (!/^(EMF|FI|FT|VG|LI|SMMLI|TMMLI|MLI|MLG)-[A-Z0-9]/i.test(nextLine)) continue;
      let nextHasDatasheet = false;
      for (let k = j + 1; k < Math.min(j + 10, lines.length); k++) {
        if (/INSTRUMENT\s*DATASHEET/i.test(lines[k])) { nextHasDatasheet = true; break; }
      }
      if (nextHasDatasheet) { endIdx = j; break; }
    }

    const pageText = lines.slice(i, endIdx).join("\n");
    const { sections, gadNote } = parseInstrumentPage(pageText);

    // Flatten into ONE section with commercial filtering
    const flatRows: [string, string][] = [];
    const seen = new Set<string>();
    for (const sec of sections) {
      for (const [l, v] of sec.rows) {
        const key = norm(l);
        if (!seen.has(key) && !isCommercialTerm(l)) {
          seen.add(key);
          flatRows.push([l, v]);
        }
      }
    }

    const flatSections: SectionData[] = [];
    if (flatRows.length > 0) {
      flatSections.push({ title: "TECHNICAL SPECIFICATIONS", rows: flatRows });
    }

    let firstTag = line.split(",")[0].trim().toUpperCase().replace(/\s+/g, "");
    firstTag = firstTag.replace(/\s+[A-Z]\/\w+$/, "").replace(/\s+[A-Z]$/, "").replace(/\s+/g, "");
    if (!pageDetails.has(firstTag)) {
      pageDetails.set(firstTag, { sections: flatSections, gadNote, rawText: pageText });
    }
  }

  // ═── Helper: extract model or decod from raw page text ───
  function extractFromRawText(rawText: string): { decodNo: string; modelCode: string } {
    let decodNo = "";
    let modelCode = "";
    if (!rawText) return { decodNo, modelCode };

    // 1. Multi-line DECODIFICATION: "DECODIFICATION:\nCODE\nCODE"
    const lines = rawText.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (/^DE[-\s]?CODIFICATION\s*(?:NO\.?|NUM|NUMBER)?\s*:?\s*$/i.test(lines[i].trim())) {
        const parts: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
          const dl = lines[j].trim();
          if (!dl) break;
          if (/^(MODEL|MIN FLOW|MAX FLOW|DELIVERY|OPERATING|PRESSURE|TEMP|ACCURACY|MAKE|SIZE|TYPE|TAG|INSTRUMENT\s*DATASHEET)/i.test(dl)) break;
          if (/^[-\s]*[A-Za-z0-9\s/.\-]+?\s*\|\s*:\s*(.+)/i.test(dl)) break;
          parts.push(dl);
        }
        if (parts.length > 0) decodNo = parts.join("-").replace(/[-]{2,}/g, "-");
        break;
      }
    }

    // 2. Single-line: "DE-CODIFICATION: XXXX" or "DE-CODIFICATION NO.: XXXX"
    if (!decodNo) {
      const m = rawText.match(/DE[-\s]?CODIFICATION\s*(?:NO\.?|NUM|NUMBER)?\s*[:.\s]\s*([A-Z0-9][A-Z0-9\-]+)/i);
      if (m) decodNo = m[1];
    }

    // 3. Pipe-delimited: "DE-CODIFICATION NO. | : XXXX"
    if (!decodNo) {
      const m = rawText.match(/DE[-\s]?CODIFICATION\s*(?:NO\.?|NUM|NUMBER)?\s*\|\s*:\s*([A-Z0-9][A-Z0-9\-]+)/i);
      if (m) decodNo = m[1];
    }

    // 4. MODEL CODE: "MODEL CODE: FMIPL-XXXX"
    if (!decodNo) {
      const m = rawText.match(/MODEL\s*(?:CODE|NO\.?)?\s*[:\-|]\s*(FMIPL-[A-Z0-9\-]+)/i);
      if (m) decodNo = m[1];
    }

    // 5. MODEL NAME extraction — look for "MODEL" followed by a code on next line
    for (let i = 0; i < lines.length; i++) {
      if (/^MODEL\s*(?:NO\.?|CODE|NAME)?\s*[:]?\s*$/i.test(lines[i].trim())) {
        const nextLine = lines[i + 1]?.trim() || "";
        if (nextLine && nextLine.length > 2 && nextLine.length < 50 && !/^(EMF|FI|FT|VG|LI|SMMLI|TMMLI|MLI|MLG)-/i.test(nextLine)) {
          modelCode = nextLine;
        }
        break;
      }
    }

    // 6. Inline MODEL: "Model: FMIPL-XXX" or "Model No.: FMTE-XXX"
    if (!modelCode) {
      const m = rawText.match(/\bMODEL\s*(?:NO\.?|CODE|NAME)?\s*[:.\-|]\s*([A-Z][A-Z0-9\-]+)/i);
      if (m) modelCode = m[1];
    }

    // 7. Any FMIPL- or FMT- or FT- pattern in the text
    if (!modelCode) {
      const m = rawText.match(/\b(FMIPL-[A-Z0-9\-]+)/i);
      if (m) modelCode = m[1];
    }
    if (!modelCode) {
      const m = rawText.match(/\b(FMT-[A-Z0-9\-]+)/i);
      if (m) modelCode = m[1];
    }

    return { decodNo, modelCode };
  }

  // Combine
  const instruments: ParsedInstrument[] = [];
  for (const item of summaryItems) {
    let sections: SectionData[] = [];
    let gadNote = "";
    let rawText = "";

    let detail = pageDetails.get(item.tagNo);
    if (!detail) {
      const firstTag = item.tagNo.split("/")[0].trim().toUpperCase().replace(/\s+/g, "");
      detail = pageDetails.get(firstTag);
      if (!detail) detail = pageDetails.get(firstTag + "A/B");
      if (!detail) detail = pageDetails.get(firstTag + "A");
    }

    if (detail) {
      sections = detail.sections;
      gadNote = detail.gadNote;
      rawText = detail.rawText;
    }

    // Extract decodNo from sections
    let itemDecod = "";
    for (const sec of sections) {
      for (const [label, value] of sec.rows) {
        if (/De-Codification/i.test(label) && value?.trim()) { itemDecod = value.trim(); break; }
      }
      if (itemDecod) break;
    }

    // Extract model from sections
    let itemModel = item.model;
    if (!itemModel) {
      for (const sec of sections) {
        for (const [label, value] of sec.rows) {
          if (/^Model\s*(?:Code|No|Name)?$/i.test(label) && value?.trim()) { itemModel = value.trim(); break; }
        }
        if (itemModel) break;
      }
    }

    // AGGRESSIVE FALLBACK: extract from raw page text
    if (!itemDecod || !itemModel) {
      const extracted = extractFromRawText(rawText);
      if (!itemDecod && extracted.decodNo) itemDecod = extracted.decodNo;
      if (!itemModel && extracted.modelCode) itemModel = extracted.modelCode;
    }

    // CRITICAL FIX: If no explicit DE-CODIFICATION found, use Model No. as de-codification
    // For Flowtech products, the model code IS the de-codification number
    if (!itemDecod && itemModel && itemModel.startsWith("FMIPL-")) {
      itemDecod = itemModel;
    }

    // Auto-detect process connection from raw instrument page text
    const instrumentFullText = detail?.rawText || "";
    const processConnection = detectProcessConnection(instrumentFullText) ||
                              detectProcessConnection(item.size + " " + item.type) || null;

    // Extract process data for sizing calculations
    const processData = extractProcessData(instrumentFullText || item.size + " " + item.type + " " + item.service);

    // ════════════════════════════════════════════════════════════
    // PROCESS DATA / OPERATING CONDITIONS section (S35750 format)
    // ════════════════════════════════════════════════════════════
    const processDataRows: [string, string][] = [];
    const pdSeen = new Set<string>();

    // 1. Text-based operating conditions from raw page text
    if (instrumentFullText) {
      const opConds = extractOperatingConditions(instrumentFullText);
      for (const [label, value] of opConds) {
        const key = norm(label);
        if (!pdSeen.has(key)) {
          pdSeen.add(key);
          processDataRows.push([label, value]);
        }
      }
    }

    // 2. Numeric process data converted to display rows
    const numericPdRows = processDataToRows(processData);
    for (const [label, value] of numericPdRows) {
      const key = norm(label);
      if (!pdSeen.has(key)) {
        pdSeen.add(key);
        processDataRows.push([label, value]);
      }
    }

    // Insert PROCESS DATA section at the BEGINNING if we have rows
    // BUT skip if the document already has an Operating Conditions section
    const hasExistingOpConditions = sections.some(s =>
      /OPERATING\s*CONDITIONS|MODEL\s*&\s*OPERATING|PROCESS\s*DATA/i.test(s.title)
    );
    if (processDataRows.length > 0 && !hasExistingOpConditions) {
      sections.unshift({ title: "PROCESS DATA", rows: processDataRows });
    }

    // Extract Design Specs / Orifice Calc from raw text if not already in sections
    const hasDesignSpecs = sections.some(s => /DESIGN\s*SPECIFICATIONS?/i.test(s.title));
    const hasOrificeCalc = sections.some(s => /ORIFICE\s*PLATE\s*CALCULATION/i.test(s.title));
    if (instrumentFullText && !hasDesignSpecs) {
      const dsRows = extractDesignSpecs(instrumentFullText.split("\n"));
      if (dsRows.length > 0) sections.push({ title: "DESIGN SPECIFICATIONS", rows: dsRows });
    }
    if (instrumentFullText && !hasOrificeCalc) {
      const ocRows = extractOrificeCalculations(instrumentFullText.split("\n"));
      if (ocRows.length > 0) sections.push({ title: "ORIFICE PLATE CALCULATION", rows: ocRows });
    }

    // Derive model name from de-codification lookup
    instruments.push({ srNo: item.srNo, tagNo: item.tagNo, type: item.type,
      service: item.service, size: item.size, qty: item.qty, model: itemModel,
      modelName: "", decodNo: itemDecod, sections, gadNote, processConnection, customDimensions: [], processData });
  }

  // ═══════════════════════════════════════════
  // FINAL PASS: scan full document for missing model/de-cod
  // This catches any model/de-cod that the summary/page parsers missed
  // ═══════════════════════════════════════════
  function fillMissingFromFullText(allInstruments: ParsedInstrument[], fullText: string) {
    const allLines = fullText.split("\n");

    for (const inst of allInstruments) {
      if (!inst.model || !inst.decodNo) {
        // Find the line containing this tag number
        let tagLineIdx = -1;
        const tagVariants = [
          inst.tagNo,
          inst.tagNo.replace(/\//g, ""),
          inst.tagNo.split("/")[0],
        ];
        for (let i = 0; i < allLines.length; i++) {
          if (tagVariants.some(v => allLines[i].includes(v))) {
            tagLineIdx = i;
            break;
          }
        }

        if (tagLineIdx >= 0) {
          // Scan surrounding lines (50 lines around the tag)
          const start = Math.max(0, tagLineIdx - 5);
          const end = Math.min(allLines.length, tagLineIdx + 50);
          const context = allLines.slice(start, end).join("\n");

          // Look for MODEL if missing
          if (!inst.model) {
            const modelPatterns = [
              /MODEL\s*(?:NO\.?|CODE|NAME)?\s*[:\-|]\s*([A-Z][A-Z0-9\-]+)/i,
              /\b(FMIPL-[A-Z0-9\-]+)/i,
              /\b(FMT-[A-Z0-9\-]+)/i,
              /\b(FMTE-[A-Z0-9\-]+)/i,
              /\b(FMVG-[A-Z0-9\-]+)/i,
            ];
            for (const pat of modelPatterns) {
              const m = context.match(pat);
              if (m && m[1].length > 3) {
                inst.model = cleanValue(m[1], 40);
                break;
              }
            }
          }

          // Look for DE-CODIFICATION if missing
          if (!inst.decodNo) {
            const decodLineIdx = allLines.slice(start, end).findIndex(l =>
              /^DE[-\s]?CODIFICATION\s*(?:NO\.?|NUM|NUMBER)?\s*:?\s*$/i.test(l.trim())
            );
            if (decodLineIdx >= 0) {
              const absoluteIdx = start + decodLineIdx;
              const parts: string[] = [];
              for (let di = absoluteIdx + 1; di < Math.min(allLines.length, absoluteIdx + 5); di++) {
                const dl = allLines[di].trim();
                if (!dl) break;
                if (/^(MODEL|MIN FLOW|MAX FLOW|DELIVERY|OPERATING|PRESSURE|TEMP|ACCURACY|MAKE|SIZE|TYPE|TAG|INSTRUMENT\s*DATASHEET)/i.test(dl)) break;
                parts.push(dl);
              }
              if (parts.length > 0) {
                inst.decodNo = parts.join("-").replace(/[-]{2,}/g, "-");
              }
            }
            if (!inst.decodNo) {
              const m = context.match(/DE[-\s]?CODIFICATION\s*(?:NO\.?|NUM|NUMBER)?\s*[:.\s]\s*([A-Z0-9][A-Z0-9\-]+)/i);
              if (m) inst.decodNo = m[1];
            }
            if (!inst.decodNo) {
              const m = context.match(/DE[-\s]?CODIFICATION\s*(?:NO\.?|NUM|NUMBER)?\s*\|\s*:\s*([A-Z0-9][A-Z0-9\-]+)/i);
              if (m) inst.decodNo = m[1];
            }
            if (!inst.decodNo) {
              const m = context.match(/MODEL\s*(?:CODE|NO\.?)?\s*[:\-|]\s*(FMIPL-[A-Z0-9\-]+)/i);
              if (m) inst.decodNo = m[1];
            }
          }
        }
      }

      // If model field contains FMIPL code, store as decodNo
      if (inst.model && inst.model.startsWith("FMIPL-") && !inst.decodNo) {
        inst.decodNo = inst.model;
      }
    }
  }

  fillMissingFromFullText(instruments, text);

  // Global safety-net: normalise "After Confirmation" → "Pending" in ALL values
  for (const inst of instruments) {
    for (const section of inst.sections) {
      for (const row of section.rows) {
        const v = row[1].trim();
        if (!v || /^after\s*confirmation$/i.test(v)) row[1] = "Pending";
      }
    }
  }

  header.totalLineItems = instruments.length;
  if (!header.totalQty && instruments.length > 0) {
    const total = instruments.reduce((s, i) => s + i.qty, 0);
    header.totalQty = total > 0 ? `${total} Nos.` : "";
  }

  return { header, instruments };
}

// ══════════════════════════════════════════════════════════════
// HEADER EXTRACTION — Line-by-line scanner with look-ahead
// Handles PDF-extracted text where labels/values span lines
// ══════════════════════════════════════════════════════════════

/** Strip document refs, address suffix, and repeated phrases from company name */
function truncateCompany(name: string): string {
  if (!name) return "";
  // Strip Quotation No. / SO No. / QTN No. and everything after it
  let cleaned = name.replace(/\s+(?:Quotation|QTN|Quote|Sales Order|SO)\s*(?:No\.?|Num|#)?\s*[:=\-]\s*[A-Z0-9\-\/]+.*$/i, "").trim();
  // Strip standalone "Quotation No." prefix
  cleaned = cleaned.replace(/^(?:Quotation|QTN|Quote)\s*(?:No\.?)?\s*[:=\-]?\s*[A-Z0-9]*\s*/i, "").trim();
  // Strip address markers
  const addrMarkers = /\s*[,\-]\s*(?:plot|street|road|block|sector|industrial|area|zone|city|dist|district|gujarat|maharashtra|tamil|karnataka|telangana|andhra|rajasthan|delhi|mumbai|pune|chennai|bangalore|hyderabad|ahmedabad|baroda|vadodara|surat|kolkata|nagpur|india|pin\s*\d)/i;
  cleaned = cleaned.replace(addrMarkers, "").trim();
  // Remove duplicated text caused by PDF extraction (e.g. "ABC ABC" → "ABC")
  cleaned = dedupeRepeated(cleaned);
  if (cleaned.length > 50) cleaned = cleaned.substring(0, 50).trim();
  return cleaned;
}

/** Check if extracted text contains a doc reference suffix */
function hasDocRefSuffix(name: string): boolean {
  return /\b(?:Quotation|QTN|Quote|Sales Order|SO)\s*(?:No\.?|Num|#)?\s*[:=\-]/i.test(name);
}

/** Aggressively detect and remove repeated phrases from PDF text duplication.
 *  Handles: "ABC ABC", "ABCABC", "ABC DEF ABC DEF", "ABC DEFABC DEF" */
function dedupeRepeated(text: string): string {
  if (!text || text.length < 4) return text;
  const trimmed = text.trim();
  if (trimmed.length < 4) return trimmed;

  // Method 1: Character-level — try all split points from 30% to 70%
  for (let splitLen = Math.floor(trimmed.length * 0.3); splitLen <= Math.floor(trimmed.length * 0.7); splitLen++) {
    const part1 = trimmed.substring(0, splitLen).trim();
    const part2 = trimmed.substring(splitLen).trim();
    // Normalize: collapse multiple spaces
    const n1 = part1.replace(/\s+/g, " ").trim().toLowerCase();
    const n2 = part2.replace(/\s+/g, " ").trim().toLowerCase();
    if (n1 === n2 && n1.length > 2) return part1;
    // Also check: part2 starts with part1 (no space between duplications)
    if (n2.startsWith(n1) && n1.length > 2) return part1;
    if (n1.startsWith(n2) && n2.length > 2) return part2;
  }

  // Method 2: Word-level — find smallest repeating word sequence
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length >= 4) {
    // Try repeating units of 1 to words.length/2 words
    for (let unitLen = 1; unitLen <= Math.floor(words.length / 2); unitLen++) {
      if (words.length % unitLen !== 0) continue;
      const unit = words.slice(0, unitLen).join(" ");
      let isRepeat = true;
      for (let i = unitLen; i < words.length; i += unitLen) {
        const chunk = words.slice(i, i + unitLen).join(" ");
        if (chunk !== unit) { isRepeat = false; break; }
      }
      if (isRepeat && unit.length > 2) return unit;
    }
  }

  // Method 3: Sliding window — find longest prefix that is also a suffix
  if (trimmed.length >= 6) {
    for (let len = Math.floor(trimmed.length / 2); len >= 3; len--) {
      const prefix = trimmed.substring(0, len);
      const suffix = trimmed.substring(trimmed.length - len);
      if (prefix.replace(/\s+/g, " ").trim().toLowerCase() ===
          suffix.replace(/\s+/g, " ").trim().toLowerCase()) {
        return prefix.trim();
      }
    }
  }

  return trimmed;
}

/** Clean a line — remove pipe delimiters, extra spaces */
function cleanLine(line: string): string {
  return line.replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
}

function extractHeader(text: string): ParsedSO["header"] {
  const h: ParsedSO["header"] = {
    soNo: "", poNo: "", project: "", client: "", endUser: "",
    contractor: "", supplier: "FLOWTECH Measuring Instruments Pvt. Ltd.",
    date: "", rev: "0", revDescription: "Initial Issue",
    totalQty: "", totalLineItems: 0,
  };

  // Work with cleaned lines (remove | delimiters that PDF.js inserts)
  const allLines = text.split("\n").map(cleanLine).filter(l => l.length > 0);
  // Header info is almost always in first 80 lines
  const lines = allLines.slice(0, 80);
  const flatText = lines.join(" ");

  // ═══════════════════════════════════════════
  // DETECT: Quotation vs Sales Order (needed for PO No. logic)
  // ═══════════════════════════════════════════
  const headerText = flatText.substring(0, 2000);
  const hasQuotationKeywords = /\b(QTN|Quotation|Quote|Enquiry|Enq)\b/i.test(headerText);
  const hasSOKeywords = /\b(Sales Order|S\.O\.|SO\s*No|Order Confirmation|Order Acknowledgement)\b/i.test(headerText);
  // Check if doc ID starts with Q (quotation) vs S (sales order)
  const qIdMatch = headerText.match(/\b(Q\d{3,})\b/);
  const sIdMatch = headerText.match(/\b(S\d{3,})\b/);

  const isQuotation = hasQuotationKeywords || (qIdMatch && !hasSOKeywords);
  const isSalesOrder = hasSOKeywords || (sIdMatch && !hasQuotationKeywords);

  // ═══════════════════════════════════════════
  // SO / QTN NUMBER — line-by-line + multi-line + standalone
  // ═══════════════════════════════════════════
  // Try 1: SO/QTN No. and value on same line
  for (const line of lines) {
    const m = line.match(/\b(?:SO|Sales Order|S\.O\.|QTN|Quotation|Quote|Enquiry|Ref)\s*(?:No\.?|Num|#|Num\.?|Number)?\s*[:\-\.]?\s*([A-Z]\d{3,}[A-Z0-9\-\/]*|\d{4,}[A-Z0-9\-\/]*)/i);
    if (m) { h.soNo = cleanValue(m[1], 25); break; }
  }
  // Try 2: "SO" or "QTN" on one line, value on next line
  if (!h.soNo) {
    for (let i = 0; i < lines.length - 1; i++) {
      if (/^(SO|S\.O\.|Sales Order|QTN|Quotation|Quote|Enq|Ref|Order No)\s*[:\-\.]?\s*$/i.test(lines[i])) {
        const next = lines[i + 1];
        if (/^[A-Z]\d{3,}[A-Z0-9\-\/]*$/i.test(next) || /^\d{4,}[A-Z0-9\-\/]*$/i.test(next)) {
          h.soNo = cleanValue(next, 25); break;
        }
      }
    }
  }
  // Try 3: Standalone doc ID like "S35750" or "Q1234" at top of document
  if (!h.soNo) {
    for (const line of lines.slice(0, 15)) {
      const m = line.match(/\b(S\d{4,})\b/);
      if (m) { h.soNo = m[1]; break; }
      const m2 = line.match(/\b(Q\d{3,})\b/);
      if (m2) { h.soNo = m2[1]; break; }
    }
  }
  // Try 4: Anywhere in header "Ref: S35750" or "Our Ref S35750"
  if (!h.soNo) {
    const m = flatText.match(/\b(?:Ref(?:erence)?|Our)\s*[:\-\.]?\s*([SQ]\d{4,})\b/i);
    if (m) h.soNo = m[1];
  }

  // ═══════════════════════════════════════════
  // DATE — line-by-line + next-line look-ahead
  // ═══════════════════════════════════════════
  for (const line of lines) {
    // Same line: "Date: 25-09-2024" or "Date 25/09/2024"
    const m = line.match(/\b(?:Date|Dt\.?)\s*[:\-\.]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    if (m) { h.date = m[1]; break; }
    const m2 = line.match(/\b(?:Date|Dt\.?)\s*[:\-\.]?\s*(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i);
    if (m2) { h.date = m2[1]; break; }
  }
  // Next-line look-ahead: "Date" alone on one line, value on next
  if (!h.date) {
    for (let i = 0; i < lines.length - 1; i++) {
      if (/^(Date|Dt)\s*[:\-\.]?\s*$/i.test(lines[i])) {
        const m = lines[i + 1].match(/^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})$/);
        if (m) { h.date = m[1]; break; }
      }
    }
  }
  // Any date pattern in first 10 lines
  if (!h.date) {
    for (const line of lines.slice(0, 10)) {
      const m = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/);
      if (m) { h.date = m[1]; break; }
    }
  }

  // ═══════════════════════════════════════════
  // PO NUMBER — STRICT extraction, reject garbage
  // ═══════════════════════════════════════════
  /** Validate that a captured string looks like a real PO number */
  function looksLikePONumber(v: string): boolean {
    if (!v || v.length < 3 || v.length > 25) return false;
    // Must contain at least one digit (real PO numbers always have digits)
    if (!/\d/.test(v)) return false;
    // Must not be a common dictionary word
    const lower = v.toLowerCase();
    const commonWords = /^(the|and|for|are|but|not|you|all|any|can|had|her|was|one|our|out|day|get|has|him|his|how|man|new|now|old|see|two|way|who|boy|did|its|let|put|say|she|too|use|end|per|qty|mm|cm|kg|ft|in|to|of|is|it|at|be|by|on|do|go|if|no|up|we|me|my|as|or|an|so|do|go|he|us|am)$/;
    if (commonWords.test(lower)) return false;
    // Must contain at least one uppercase letter or be all digits with separators
    if (!/[A-Z0-9]/.test(v)) return false;
    // Not just random lowercase letters
    if (/^[a-z]+$/.test(v)) return false;
    return true;
  }

  // Try 1: "PO No. XXXXX" on same line — STRICT value pattern
  for (const line of lines) {
    const m = line.match(/\b(?:PO|P\.O\.|Purchase Order)\s*(?:No\.?|Num|#)?\s*[:\-\.]\s*([A-Z0-9][A-Z0-9\-\/]*)/i);
    if (m && looksLikePONumber(m[1])) { h.poNo = cleanValue(m[1], 25); break; }
  }
  // Try 2: Next-line look-ahead — "PO No." on line N, value on line N+1
  if (!h.poNo) {
    for (let i = 0; i < lines.length - 1; i++) {
      if (/^(PO|P\.O\.|Purchase Order)\s*(?:No\.?|Num|#)?\s*[:\-\.]?\s*$/i.test(lines[i])) {
        const next = lines[i + 1];
        if (looksLikePONumber(next)) {
          h.poNo = cleanValue(next, 25); break;
        }
      }
    }
  }
  // Try 3: Flat text search with strict value pattern (letter + 3+ digits)
  if (!h.poNo) {
    const m = flatText.match(/\b(?:PO|Purchase Order)\s*(?:No\.?|Num|#)?\s*[:\-\.]\s*([A-Z]\d{3,}[A-Z0-9\-\/]*)/i);
    if (m && looksLikePONumber(m[1])) h.poNo = cleanValue(m[1], 25);
  }
  // Smart defaults ONLY if nothing was found
  if (!h.poNo) {
    if (isQuotation) h.poNo = "Pending";
    else if (isSalesOrder) h.poNo = "Not Provided";
    else h.poNo = "Pending";
  }

  // ═══════════════════════════════════════════
  // CLIENT — aggressive multi-strategy extraction
  // ═══════════════════════════════════════════
  /** Reject values that are document references, not company names */
  function isValidClient(name: string): boolean {
    const trimmed = name.trim();
    if (trimmed.length < 3) return false;
    if (/Flowtech/i.test(trimmed)) return false;
    // Reject standalone doc IDs like "S35750", "Q1234", "PO-4567"
    if (/^[A-Z]\d{3,}$/i.test(trimmed)) return false;
    if (/^(PO|SO|QTN)[\-\.]?\d+$/i.test(trimmed)) return false;
    // Reject dates
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(trimmed)) return false;
    // Reject email/phone/website
    if (/^[@\d\+\(]|\.|@.*\./.test(trimmed) && !/[A-Za-z]{3,}/.test(trimmed)) return false;
    // Reject if it contains "Quotation No." or "Sales Order" references
    if (hasDocRefSuffix(trimmed)) return false;
    return true;
  }

  // Strategy A: "Client:" / "M/s" — clean value first
  for (const line of lines) {
    const cm = line.match(/\b(?:Client|M\/s\.?|Messrs)\s*[:\-\.]?\s*(.+)/i);
    if (cm && isValidClient(cm[1])) {
      h.client = truncateCompany(cm[1]); break;
    }
  }
  // Strategy A1: "Client:" / "M/s" — strip doc refs and retry
  if (!h.client) {
    for (const line of lines) {
      const cm = line.match(/\b(?:Client|M\/s\.?|Messrs)\s*[:\-\.]?\s*(.+)/i);
      if (cm) {
        const cleaned = truncateCompany(cm[1]);
        if (cleaned.length > 2 && isValidClient(cleaned)) {
          h.client = cleaned; break;
        }
      }
    }
  }
  // Strategy A2: "To:" — clean value, no doc refs
  if (!h.client) {
    for (const line of lines) {
      const cm = line.match(/\bTo\s*[:\-\.]?\s*(.+)/i);
      if (cm && isValidClient(cm[1])) {
        h.client = truncateCompany(cm[1]); break;
      }
    }
  }
  // Strategy A3: "To:" value HAS doc ref — strip it and extract company
  if (!h.client) {
    for (const line of lines) {
      const cm = line.match(/\bTo\s*[:\-\.]?\s*(.+)/i);
      if (cm) {
        const cleaned = truncateCompany(cm[1]);
        if (cleaned.length > 2 && isValidClient(cleaned)) {
          h.client = cleaned; break;
        }
      }
    }
  }
  // Strategy B: "Kind Attn:" + next line is company name
  if (!h.client) {
    for (let i = 0; i < lines.length - 1; i++) {
      if (/Kind\s*Attn/i.test(lines[i])) {
        const next = lines[i + 1];
        if (isValidClient(next) && next.length < 100) {
          h.client = truncateCompany(next); break;
        }
      }
    }
  }
  // Strategy C: "Buyer:" or "Customer:" or "Consignee:"
  if (!h.client) {
    for (const line of lines) {
      const cm = line.match(/\b(?:Buyer|Customer|Consignee|Party|Company)\s*[:\-\.]?\s*(.+)/i);
      if (cm && isValidClient(cm[1])) {
        h.client = truncateCompany(cm[1]); break;
      }
    }
  }
  // Strategy D: "From: Flowtech" → nearby "To:" line = client
  if (!h.client) {
    for (let i = 0; i < lines.length; i++) {
      if (/\bFrom\s*[:\-\.]?\s*.*Flowtech/i.test(lines[i])) {
        for (let j = Math.max(0, i - 3); j < Math.min(lines.length, i + 6); j++) {
          const tm = lines[j].match(/\bTo\s*[:\-\.]?\s*(.+)/i);
          if (tm && isValidClient(tm[1])) {
            h.client = truncateCompany(tm[1]); break;
          }
        }
        break;
      }
    }
  }

  // ═══════════════════════════════════════════
  // END USER (copy client if not found)
  // ═══════════════════════════════════════════
  for (const line of lines) {
    const em = line.match(/\b(?:End\s*User|End-?User|User)\s*[:\-\.]?\s*(.+)/i);
    if (em && em[1].length > 2) { h.endUser = truncateCompany(em[1]); break; }
  }
  if (!h.endUser && h.client) h.endUser = h.client;

  // ═══════════════════════════════════════════
  // PROJECT — strict: must have separator after keyword
  // ═══════════════════════════════════════════
  for (const line of lines) {
    // Require ':' '=' or '-' separator — prevents "Projects" in company names matching
    const pm = line.match(/\b(?:Project|Job Name|Work Name)\b\s*[:\=\-]\s*(.+)/i);
    if (pm && pm[1].length > 2 && pm[1].length < 100 &&
        !/\b(date|so|po|client|buyer)/i.test(pm[1]) &&
        !hasDocRefSuffix(pm[1])) {
      h.project = cleanValue(pm[1], 80); break;
    }
  }

  // ═══════════════════════════════════════════
  // CONTRACTOR
  // ═══════════════════════════════════════════
  for (const line of lines) {
    const cm = line.match(/\b(?:Contractor|Consultant|EPCM|EPC)\s*[:\-\.]?\s*(.+)/i);
    if (cm && cm[1].length > 2) { h.contractor = truncateCompany(cm[1]); break; }
  }

  // ═══════════════════════════════════════════
  // SUPPLIER
  // ═══════════════════════════════════════════
  for (const line of lines) {
    const sm = line.match(/\b(?:Supplier|Vendor|Seller|From)\s*[:\-\.]?\s*(.+)/i);
    if (sm && sm[1].length > 2 && /Flowtech/i.test(sm[1])) {
      h.supplier = cleanValue(sm[1], 80); break;
    }
  }

  // ═══════════════════════════════════════════
  // FINAL SAFETY: dedupe client / end user / contractor
  // PDF text extraction often duplicates names — catch any that slipped through
  // ═══════════════════════════════════════════
  if (h.client) h.client = dedupeRepeated(h.client);
  if (h.endUser) h.endUser = dedupeRepeated(h.endUser);
  if (h.contractor) h.contractor = dedupeRepeated(h.contractor);

  return h;
}

// ══════════════════════════════════════════════════════════════
// INSTRUMENT SUMMARY TABLE PARSER (S35750 format)
// ══════════════════════════════════════════════════════════════
function parseInstrumentSummary(text: string): Array<{
  srNo: number; tagNo: string; type: string; service: string;
  size: string; qty: number; model: string;
}> {
  const items: Array<{
    srNo: number; tagNo: string; type: string; service: string;
    size: string; qty: number; model: string;
  }> = [];

  const summaryMatch = text.match(/INSTRUMENT\s*SUMMARY[\s\S]*?(?=INSTRUMENT\s*DATASHEET|$)/i);
  if (!summaryMatch) return items;

  const summaryText = summaryMatch[0];
  const lines = summaryText.split("\n").map(l => l.trim()).filter(l => l.length > 0);

  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/SR\.?\s*NO|TAG\s*NO|TYPE|SERVICE|SIZE|QTY|MODEL/i.test(lines[i]) &&
        lines[i].split(/\s{2,}|\t/).length >= 4) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    for (const line of lines) {
      const m = line.match(/^(\d+)\s+(EMF|FI|FT|VG|LI|SMMLI|TMMLI|MLI|MLG)-[^\s]+\s+(.*)/i);
      if (m) {
        const parts = line.split(/\s{2,}|\t/);
        if (parts.length >= 4) {
          const srNo = parseInt(parts[0]) || items.length + 1;
          const tagNo = parts.find(p => /^(EMF|FI|FT|VG|LI|SMMLI|TMMLI|MLI|MLG)-/i.test(p)) || `ITEM-${srNo}`;
          const typeParts = parts.slice(2).filter(p =>
            /turbine|electromagnetic|vortex|by-pass|oval|metal|glass|rotameter|flowmeter/i.test(p)
          );
          const type = typeParts.length > 0 ? cleanValue(typeParts[0], 60) : "";
          const qty = parseInt(parts.find(p => /^\d+$/.test(p)) || "1");
          const modelParts = parts.filter(p =>
            /FTE?-\d+/i.test(p) || /FTO?-\d+/i.test(p) || /FTV?-\d+/i.test(p) || /FTB?-\d+/i.test(p)
          );
          const model = modelParts.length > 0 ? cleanValue(modelParts[0], 40) : "";
          items.push({ srNo, tagNo, type, service: "", size: "", qty, model });
        }
      }
    }
    return items;
  }

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!/^\d+/.test(line)) continue;
    if (line.match(/^(SR\.?\s*NO|TAG\s*NO|INSTRUMENT\s*DATASHEET)/i)) continue;

    const parts = line.split(/\s{2,}|\t/).filter(p => p.trim().length > 0);
    if (parts.length < 3) continue;

    const srNo = parseInt(parts[0]) || items.length + 1;
    let tagNo = "";
    let type = "";
    let service = "";
    let size = "";
    let qty = 1;
    let model = "";

    for (const part of parts) {
      const p = part.trim();
      if (/^(EMF|FI|FT|VG|LI|SMMLI|TMMLI|MLI|MLG)-[A-Z0-9\/\-]+/i.test(p)) {
        tagNo = p.toUpperCase().replace(/\s+/g, "");
      } else if (/^\d+\s*(NB|MM)$/i.test(p)) {
        size = p;
      } else if (/^\d+$/ .test(p) && parseInt(p) < 1000) {
        qty = parseInt(p);
      } else if (/\b(FMIPL|FMT|FTE?|FTO?|FTV?|FTB?|FTT|EMF|FTVG|FTT)-[A-Z0-9\-]+/i.test(p)) {
        model = cleanValue(p, 40);
      } else if (!type && !service && !size && p.length > 2 && p.length < 40 && /[A-Z]/.test(p) && /\d/.test(p) && !/^(EMF|FI|FT|VG|LI|SMMLI|TMMLI|MLI|MLG)-/i.test(p)) {
        // Fallback: any remaining alphanumeric code with both letters and digits
        model = cleanValue(p, 40);
      }
    }

    // Detect type using canonical product name matching
    if (!type && tagNo) {
      const canonical = matchCanonicalProduct(line + " " + tagNo);
      if (canonical) {
        type = canonical.matchedName;
      } else {
        const family = detectProductFamily(line + " " + tagNo);
        if (family) type = getProductLabel(family);
      }
    }

    // Tag prefix fallback (reliable)
    if (!type && tagNo) {
      if (/^EMF-/i.test(tagNo)) type = "Electromagnetic Flowmeter";
      else if (/^FI-/i.test(tagNo)) type = "By-Pass Rotameter";
      else if (/^FT-/i.test(tagNo)) type = "Turbine Flowmeter";
      else if (/^VG-/i.test(tagNo)) type = "Vortex Flowmeter";
      else if (/^LI-/i.test(tagNo)) type = "Magnetic Level Indicator";
    }

    items.push({ srNo, tagNo, type, service, size, qty, model });
  }

  return items;
}

// ══════════════════════════════════════════════════════════════
// INDIVIDUAL INSTRUMENT PAGE PARSER (S35750 format)
// ══════════════════════════════════════════════════════════════
function parseInstrumentPage(pageText: string): {
  sections: SectionData[]; gadNote: string;
} {
  const sections: SectionData[] = [];
  let gadNote = "";

  const gadMatch = pageText.match(/(?:G\.?A\.?\s*DRAWING|GENERAL\s*ARRANGEMENT)[\s\S]*?(NOTE[:\s]*.*?)(?=\n\n|\n[A-Z]|$)/i) ||
                   pageText.match(/(NOTE[:\s]*.*?G\.?A\.?\s*DRAWING.*?)(?=\n\n|$)/i);
  if (gadMatch) gadNote = cleanValue(gadMatch[1], 200);

  const noteMatch = pageText.match(/NOTE[:\s]*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*\n|\n[A-Z][A-Z\s]+[:\s]*\n|$)/i);
  if (noteMatch && noteMatch[1].includes("G.A.D")) {
    gadNote = cleanValue(noteMatch[1], 200);
  }

  const sectionPatterns = [
    { name: "PRODUCT DETAILS", patterns: [/PRODUCT\s*DETAILS?/i, /PRODUCT\s*INFORMATION/i] },
    { name: "MODEL & OPERATING CONDITIONS", patterns: [/MODEL\s*&?\s*OPERATING/i, /OPERATING\s*CONDITIONS/i, /MODEL\s*CODE/i] },
    { name: "DESIGN SPECIFICATIONS", patterns: [/DESIGN\s*SPECIFICATIONS?/i] },
    { name: "ORIFICE PLATE CALCULATION", patterns: [/ORIFICE\s*PLATE\s*CALCULATION/i, /ORIFICE\s*CALCULATION/i, /ORIFICE\s*DETAILS/i] },
    { name: "TECHNICAL SPECIFICATIONS", patterns: [/TECHNICAL\s*SPECIFICATIONS?/i, /SPECIFICATIONS?/i, /TECHNICAL\s*DETAILS/i] },
    { name: "OTHER DETAILS", patterns: [/OTHER\s*DETAILS?/i, /ADDITIONAL\s*DETAILS?/i, /OTHER\s*INFORMATION/i] },
    { name: "MECHANICAL SPECIFICATIONS", patterns: [/MECHANICAL\s*SPECIFICATIONS?/i] },
    { name: "ELECTRICAL SPECIFICATIONS", patterns: [/ELECTRICAL\s*SPECIFICATIONS?/i] },
    { name: "PERFORMANCE SPECIFICATIONS", patterns: [/PERFORMANCE\s*SPECIFICATIONS?/i] },
  ];

  const foundSections: Array<{ title: string; startIdx: number; endIdx: number }> = [];
  const lines = pageText.split("\n");

  for (const sp of sectionPatterns) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      for (const pattern of sp.patterns) {
        if (pattern.test(line) && line.length < 50) {
          let endIdx = lines.length;
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j].trim();
            for (const otherSp of sectionPatterns) {
              for (const otherPattern of otherSp.patterns) {
                if (otherPattern.test(nextLine) && nextLine.length < 50 && j > i) {
                  endIdx = j;
                  break;
                }
              }
              if (endIdx !== lines.length) break;
            }
            if (/^(EMF|FI|FT|VG|LI|SMMLI|TMMLI|MLI|MLG)-[A-Z0-9]/i.test(nextLine)) {
              endIdx = j;
              break;
            }
            if (endIdx !== lines.length) break;
          }

          const overlaps = foundSections.some(fs =>
            fs.title === sp.name && Math.abs(fs.startIdx - i) < 3
          );
          if (!overlaps) {
            foundSections.push({ title: sp.name, startIdx: i, endIdx });
          }
          break;
        }
      }
    }
  }

  foundSections.sort((a, b) => a.startIdx - b.startIdx);

  for (const fs of foundSections) {
    const sectionLines = lines.slice(fs.startIdx + 1, fs.endIdx);
    const rows: [string, string][] = [];
    const seen = new Set<string>();

    for (let i = 0; i < sectionLines.length - 1; i++) {
      const line = sectionLines[i].trim();
      const nextLine = sectionLines[i + 1].trim();

      if (!line || isCommercialTerm(line)) continue;
      if (sectionPatterns.some(sp => sp.patterns.some(p => p.test(line)))) continue;

      if (line.length < 60 && nextLine.length > 0 && nextLine.length < 150 &&
          !/^\d+\s*(NB|MM|PSI|BAR|DEG|KG|HZ|V|A|M)/i.test(line) &&
          !/^(EMF|FI|FT|VG|LI|SMMLI|TMMLI|MLI|MLG)-/i.test(line)) {
        const label = isKnownLabel(line) || line;
        const key = norm(label);
        if (!seen.has(key) && !isCommercialTerm(label)) {
          seen.add(key);
          rows.push([label, cleanValue(nextLine)]);
        }
        i++;
      }
    }

    for (const line of sectionLines) {
      const inlineMatch = line.match(/^([^:]+):\s*(.+)/);
      if (inlineMatch) {
        const label = isKnownLabel(inlineMatch[1]) || inlineMatch[1].trim();
        const value = cleanValue(inlineMatch[2]);
        const key = norm(label);
        if (!seen.has(key) && label.length < 60 && value && !isCommercialTerm(label)) {
          seen.add(key);
          rows.push([label, value]);
        }
      }
    }

    // Normalise "After Confirmation" → "Pending" in extracted values
    for (let r = 0; r < rows.length; r++) {
      const v = rows[r][1].trim();
      if (!v || /^after\s*confirmation$/i.test(v)) {
        rows[r][1] = "Pending";
      }
    }

    if (rows.length > 0) {
      sections.push({ title: fs.title, rows });
    }
  }

  // Ensure De-Codification No. is extracted explicitly if present (multi-line)
  const pageLines = pageText.split("\n");
  const decodLines2: string[] = [];
  for (let pi = 0; pi < pageLines.length; pi++) {
    // Match: DE-CODIFICATION, DE CODIFICATION, DECODIFICATION, DE-CODIFICATION NO., etc.
    if (/^DE[-\s]?CODIFICATION\s*(?:NO\.?|NUM|NUMBER)?\s*[:]?\s*$/i.test(pageLines[pi].trim())) {
      for (let di = pi + 1; di < pageLines.length; di++) {
        const dl = pageLines[di].trim();
        if (!dl) break;
        if (/^(MODEL|MIN FLOW|MAX FLOW|DELIVERY|OPERATING|PRESSURE|TEMP|ACCURACY|MAKE|SIZE|TYPE|TAG|INSTRUMENT\s*DATASHEET|DOCUMENTS)/i.test(dl)) break;
        decodLines2.push(dl);
      }
      break;
    }
  }
  let decodValue = "";
  if (decodLines2.length > 0) {
    decodValue = decodLines2.join("-").replace(/[-]{2,}/g, "-");
  } else {
    // Fallback 1: single-line match "DE-CODIFICATION: XXXX"
    const decodMatch = pageText.match(/DE[-\s]?CODIFICATION\s*(?:NO\.?|NUM|NUMBER)?\s*[:.\s]\s*([A-Z0-9\-]+)/i);
    if (decodMatch) decodValue = decodMatch[1];
  }
  // Fallback 2: pipe-delimited "DE-CODIFICATION NO. | : XXXX"
  if (!decodValue) {
    const pipeDecod = pageText.match(/DE[-\s]?CODIFICATION\s*(?:NO\.?|NUM|NUMBER)?\s*\|\s*:\s*([A-Z0-9\-]+)/i);
    if (pipeDecod) decodValue = pipeDecod[1];
  }
  // Fallback 3: MODEL CODE contains the de-codification
  if (!decodValue) {
    const modelCodeMatch = pageText.match(/MODEL\s*(?:CODE|NO\.?)?\s*[:\-|]\s*(FMIPL-[A-Z0-9\-]+)/i);
    if (modelCodeMatch) decodValue = modelCodeMatch[1];
  }
  if (decodValue) {
    const decodRow: [string, string] = ["De-Codification No.", cleanValue(decodValue)];
    if (sections.length > 0) {
      const firstSec = sections[0];
      const hasDecod = firstSec.rows.some(([l]) => norm(l) === "decodificationno");
      if (!hasDecod) firstSec.rows.unshift(decodRow);
    } else {
      sections.push({ title: "TECHNICAL SPECIFICATIONS", rows: [decodRow] });
    }
  }

  if (sections.length === 0) {
    const flatRows: [string, string][] = [];
    const seen = new Set<string>();

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      const nextLine = lines[i + 1].trim();

      if (!line || line.length > 60 || isCommercialTerm(line)) continue;
      if (/^(EMF|FI|FT|VG|LI|SMMLI|TMMLI|MLI|MLG)-/i.test(line)) continue;
      if (/INSTRUMENT\s*DATASHEET/i.test(line)) continue;

      if (nextLine.length > 0 && nextLine.length < 150 &&
          !/^\d+\s*(NB|MM)/i.test(line)) {
        const label = isKnownLabel(line) || line;
        const key = norm(label);
        if (!seen.has(key) && !isCommercialTerm(label)) {
          seen.add(key);
          flatRows.push([label, cleanValue(nextLine)]);
        }
        i++;
      }
    }

    if (flatRows.length > 0) {
      sections.push({ title: "TECHNICAL SPECIFICATIONS", rows: flatRows });
    }
  }

  return { sections, gadNote };
}

// ══════════════════════════════════════════════════════════════
// FORMAT DETECTION
// ══════════════════════════════════════════════════════════════
function detectFormat(text: string): "s35750" | "so_ack" | "unknown" {
  const t = text.substring(0, 15000).toUpperCase();

  // Format 1: S35750 style with INSTRUMENT SUMMARY table
  if (t.includes("INSTRUMENT SUMMARY") && t.includes("INSTRUMENT DATASHEET")) {
    return "s35750";
  }

  // Count pipe-delimited spec lines (lines with | : pattern)
  // Handles both "| - Label | : Value" and "Label | : Value" formats
  const pipeMatches = (text.match(/^\s*(?:\||[-\s]*[A-Za-z]).*\|.*:/gm) || []).length;

  // Count item headers — Pattern A (size on same line) + Pattern B (size on next line)
  // CRITICAL: Strip pipes before regex matching (PDF extractor adds | for column gaps)
  const lines = text.split(/\n/);
  let itemHeaderMatches = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineClean = lines[i].replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
    // Pattern A: size on same line (e.g. "1. Turbine Flowmeter 80NB")
    const sizeOnSameLine = /^\d+\b.*?\d+\s*(NB|MM)\b/i.test(lineClean) || /^\d+[A-Z].*?\d+\s*(NB|MM)/i.test(lineClean);
    // Pattern B: item start on this line, size on next 1-2 lines
    const isItemStart = /^\d+\.?\s*[A-Z]/i.test(lineClean) && INSTRUMENT_KEYWORDS.test(lineClean);
    const line2Clean = (lines[i + 1] || "").replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
    const line3Clean = (lines[i + 2] || "").replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
    const sizeOnNextLine = /^[-\s]*\d+\s*(NB|MM)\b/i.test(line2Clean);
    const sizeOnNextNextLine = /^[-\s]*\d+\s*(NB|MM)\b/i.test(line3Clean);
    const sizeRangePattern = /^[-\s]*\d+\s*(NB|MM)[-\/]/i.test(line2Clean) || /^[-\s]*\d+\s*(NB|MM)[-\/]/i.test(line3Clean);
    // Pattern B2: size appears later in chunk (e.g. decodification or "Flange Size:")
    let sizeInChunk = false;
    if (isItemStart && !sizeOnSameLine && !sizeOnNextLine && !sizeOnNextNextLine && !sizeRangePattern) {
      const chunkAhead = lines.slice(i + 1, Math.min(i + 20, lines.length)).join("\n");
      sizeInChunk = /\b\d+\s*(NB|MM)\b/i.test(chunkAhead) || /(?:flange\s*)?size\s*[:.-]\s*\d+\s*(NB|MM)/i.test(chunkAhead);
    }
    // Pattern C: FMIPL model code on this line + size nearby
    const hasCode = /\bFMIPL-[A-Z]{2,6}-/i.test(lineClean);
    const sizeNearby = sizeOnSameLine || sizeOnNextLine || sizeOnNextNextLine || sizeRangePattern || sizeInChunk;
    if ((sizeOnSameLine || (isItemStart && (sizeOnNextLine || sizeOnNextNextLine || sizeRangePattern || sizeInChunk)) || (hasCode && sizeNearby)) && INSTRUMENT_KEYWORDS.test(lineClean)) {
      itemHeaderMatches++;
    }
  }

  // Format 2: SO Acknowledgement — has item headers + pipe specs + model/de-cod
  // Lower thresholds: single-item SOs are valid (1 item, 1+ pipe lines)
  if ((pipeMatches >= 1 || itemHeaderMatches >= 1) &&
      (t.includes("DE-CODIFICATION") || t.includes("MODEL NO.")) &&
      itemHeaderMatches >= 1) {
    return "so_ack";
  }

  // Format 2b: Flowtech SO with FMIPL model codes — strong signal even without de-codification header
  const modelCodeMatches = (text.match(/\bFMIPL-[A-Z]{2,6}-/gi) || []).length;
  if (modelCodeMatches >= 1 && itemHeaderMatches >= 1) {
    return "so_ack";
  }

  // Format 2c: Quotation with Type: line + Make: Flowtech + instrument keywords
  // Handles: "Type : Double Window Type", "Make : Flowtech" without FMIPL codes
  const hasTypeLine = /\bType\s*[:\-]\s*[A-Z]/i.test(text);
  const hasMakeFlowtech = /Make\s*[:\-].*Flowtech/i.test(text);
  if (hasTypeLine && hasMakeFlowtech && itemHeaderMatches >= 1) {
    return "so_ack";
  }

  // Format 1 fallback: tag-based detection
  const tagMatches = (text.match(/^(EMF|FI|FT|VG|LI|SMMLI|TMMLI|MLI|MLG)-[A-Z0-9]/gm) || []).length;
  if (tagMatches >= 2 && t.includes("INSTRUMENT DATASHEET")) {
    return "s35750";
  }

  // FINAL FALLBACK: If we see FMIPL model codes + instrument keywords anywhere, try so_ack
  if (modelCodeMatches >= 1 && INSTRUMENT_KEYWORDS.test(text)) {
    return "so_ack";
  }

  return "unknown";
}

// ══════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ══════════════════════════════════════════════════════════════
export function parseSmart(text: string): ParsedSO {
  const format = detectFormat(text);

  if (format === "so_ack") {
    return parseSOAcknowledgement(text);
  }

  return parseS35750Format(text);
}
