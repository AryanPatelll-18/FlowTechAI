/**
 * Engineering Validator — Smart Application Engine Logic
 * Validates extracted SO/QTN data against engineering principles.
 * Behaves like a Flowtech application engineer, not a dumb text extractor.
 *
 * Sections implemented:
 *   1. Unit Reading Accuracy
 *   2. Unit Classification by Application
 *   3. Smart Engineering Assumption Logic
 *   4. Assumption Restriction Rule
 *   5. Basic Engineering Principle Check
 *   6. Technical Query Generation
 *   7. Query Severity Classification
 *   8. Unit Conversion and Display Rule
 *   9. Application-Wise Mandatory Data Check
 *   10. Engineering Review Output
 */

import type { ExtractedLineItem, ProcessConditions } from "../types/shared";

// ═════════════════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════════════════

export type Severity = "critical" | "major" | "minor" | "info";
export type ReviewStatus = "ready" | "ready_with_assumptions" | "query_raised" | "hold" | "cannot_proceed";

export interface UnitConversion {
  field: string;
  originalValue: string;
  convertedValue: string;
  conversionBasis: string;
}

export interface TechnicalQuery {
  lineItemNo: string;
  tagNumber: string;
  productName: string;
  modelNumber: string;
  fieldName: string;
  extractedValue: string;
  issue: string;
  whyConcern: string;
  requiredClarification: string;
  severity: Severity;
  blocksSizing: boolean;
  blocksReport: boolean;
}

export interface SmartAssumption {
  field: string;
  assumedValue: string;
  basis: string;
  safe: boolean; // true = allowed, false = restricted
  needsConfirmation: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  queries: TechnicalQuery[];
  assumptions: SmartAssumption[];
  conversions: UnitConversion[];
  missingMandatoryFields: string[];
  reviewStatus: ReviewStatus;
  reviewSummary: ReviewSummary;
}

export interface ReviewSummary {
  extractionStatus: string;
  unitReadingStatus: string;
  applicationUnitMatch: string;
  missingDataStatus: string;
  assumptionsUsed: number;
  queriesRaised: number;
  criticalQueries: number;
  productSelectionReady: boolean;
  sizingReady: boolean;
  reportReady: boolean;
  overallStatus: ReviewStatus;
}

// ═════════════════════════════════════════════════════════════════════════════
// NON-FLOW DEVICE DETECTION
// Level switches, level gauges, level transmitters, and sight glasses
// do NOT require flow range for sizing/selection.
// ═════════════════════════════════════════════════════════════════════════════

const NON_FLOW_PRODUCTS = [
  "level switch", "displacer", "side mounted level", "top mounted level", "float switch",
  "level gauge", "magnetic level", "reflex level", "transparent level", "tubular level",
  "float board level", "float & board level", "radar level", "hydrostatic level",
  "level transmitter", "sight glass", "double window sight glass", "full view sight glass",
  "allen bolt sight glass", "level indicator",
];

export function isNonFlowDevice(productFamily: string): boolean {
  const pf = (productFamily || "").toLowerCase();
  return NON_FLOW_PRODUCTS.some((nfp) => pf.includes(nfp));
}

// Level GAUGES have two flanges (top + bottom) → C-C distance is relevant
// Level SWITCHES have a single probe → Length/Probe Length is relevant
const LEVEL_GAUGE_PRODUCTS = [
  "level gauge", "magnetic level", "reflex level", "transparent level", "tubular level",
  "float board level", "float & board level",
];

const LEVEL_SWITCH_PRODUCTS = [
  "level switch", "displacer", "float switch", "side mounted level", "top mounted level",
];

export function isLevelGauge(productFamily: string): boolean {
  return LEVEL_GAUGE_PRODUCTS.some((p) => productFamily.toLowerCase().includes(p));
}

export function isLevelSwitch(productFamily: string): boolean {
  return LEVEL_SWITCH_PRODUCTS.some((p) => productFamily.toLowerCase().includes(p));
}

/** Find a value from technical specs by label (case-insensitive partial match) */
function getFromSpecs(item: ExtractedLineItem, labelPattern: string): string | undefined {
  const specs = item.specs || {};
  for (const [label, value] of Object.entries(specs)) {
    if (new RegExp(labelPattern, "i").test(label)) return value;
  }
  return undefined;
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 1 & 2: UNIT DETECTION AND APPLICATION MATCHING
// ═════════════════════════════════════════════════════════════════════════════

const FLOW_UNITS_LIQUID = new Set(["LPH", "LPM", "m3/hr", "m3/h", "GPM", "GPH"]);
const FLOW_UNITS_GAS = new Set(["Nm3/hr", "Nm3/h", "Sm3/hr", "m3/hr", "SCFH", "SCFM", "kg/hr"]);
const FLOW_UNITS_STEAM = new Set(["kg/hr", "TPH", "T/H", "t/hr"]);
const FLOW_UNITS_LEVEL = new Set(["mm", "meter", "m", "inch"]);

const PRESSURE_UNITS = new Set(["bar", "bara", "barg", "kg/cm2", "kg/cm²", "psi", "MPa", "mmWC", "mbar"]);
const TEMP_UNITS = new Set(["°C", "deg C", "degC", "°F", "deg F", "degF", "K"]);

const VALID_UNITS: Record<string, string[]> = {
  flow: ["LPH", "LPM", "m3/hr", "m3/h", "Nm3/hr", "Nm3/h", "Sm3/hr", "SCFH", "SCFM", "GPM", "GPH", "kg/hr", "TPH", "T/H", "t/hr"],
  pressure: ["bar", "bara", "barg", "kg/cm2", "kg/cm²", "psi", "MPa", "mmWC", "mbar", "Atmospheric", "Ambient"],
  temperature: ["°C", "deg C", "degC", "°F", "deg F", "degF", "K", "Ambient", "Atmospheric"],
  size: ["NB", "mm", "inch", '"', "DN"],
  density: ["kg/m3", "kg/m³", "g/cc", "g/cm³", "SG"],
  viscosity: ["cP", "centipoise", "cSt", "Pa.s", "mPa.s"],
};

/** Detect and normalize a unit string */
export function detectUnit(value: string, fieldType: string): { unit: string; normalized: string } | null {
  if (!value) return null;
  const v = value.toString().trim();

  // Check for known units
  for (const unit of VALID_UNITS[fieldType] || []) {
    const pattern = new RegExp("\\b" + unit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
    if (pattern.test(v)) {
      return { unit, normalized: normalizeUnit(unit) };
    }
  }

  // Check for "After Confirmation" or "Pending"
  if (/after\s*confirmation|pending|tbd|tbc/i.test(v)) {
    return { unit: "PENDING", normalized: "PENDING" };
  }

  // Check for special text values
  if (fieldType === "pressure" && /atmospheric|atm/i.test(v)) {
    return { unit: "Atmospheric", normalized: "bara" };
  }
  if (fieldType === "temperature" && /ambient|room/i.test(v)) {
    return { unit: "Ambient", normalized: "°C" };
  }

  return null;
}

function normalizeUnit(unit: string): string {
  const u = unit.toLowerCase();
  if (u.includes("m3/h") || u.includes("m³/h")) return "m3/hr";
  if (u.includes("nm3/h") || u.includes("nm³/h")) return "Nm3/hr";
  if (u.includes("sm3/h")) return "Sm3/hr";
  if (u.includes("lph")) return "LPH";
  if (u.includes("lpm")) return "LPM";
  if (u.includes("gpm")) return "GPM";
  if (u.includes("kg/h")) return "kg/hr";
  if (u.includes("tph") || u.includes("t/h")) return "TPH";
  if (u.includes("bara")) return "bara";
  if (u.includes("barg")) return "barg";
  if (u.includes("kg/cm") || u.includes("kg/cm²")) return "kg/cm2";
  if (u.includes("mpa")) return "MPa";
  if (u.includes("nb")) return "NB";
  if (u.includes("°c") || u.includes("deg c")) return "°C";
  if (u.includes("°f") || u.includes("deg f")) return "°F";
  return unit;
}

/** Check if flow unit matches the service type */
function validateUnitForApplication(flowUnit: string, service: string): { valid: boolean; issue?: string } {
  const u = (flowUnit || "").toUpperCase();
  if (!u || u === "PENDING") return { valid: false, issue: "Flow unit not detected" };

  if (service === "liquid") {
    const validLiquid = Array.from(FLOW_UNITS_LIQUID).some((vu) => u.includes(vu));
    if (validLiquid) return { valid: true };
    if (Array.from(FLOW_UNITS_GAS).some((vu) => u.includes(vu))) {
      return { valid: false, issue: `Gas unit "${flowUnit}" used for liquid application. Please verify.` };
    }
    return { valid: true }; // accept unknown for flexibility
  }

  if (service === "gas") {
    const validGas = Array.from(FLOW_UNITS_GAS).some((vu) => u.includes(vu));
    if (validGas) return { valid: true };
    if (Array.from(FLOW_UNITS_LIQUID).some((vu) => u.includes(vu)) && !u.includes("M3/HR")) {
      return { valid: false, issue: `Liquid unit "${flowUnit}" used for gas application. Please verify.` };
    }
    return { valid: true };
  }

  if (service === "steam") {
    const validSteam = Array.from(FLOW_UNITS_STEAM).some((vu) => u.includes(vu));
    if (validSteam) return { valid: true };
    if (u.includes("NM3/HR")) {
      return { valid: false, issue: `Nm3/hr is unusual for steam. Please confirm unit is correct.` };
    }
    return { valid: true };
  }

  return { valid: true };
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 3: SMART ENGINEERING ASSUMPTIONS
// ═════════════════════════════════════════════════════════════════════════════

const SAFE_ASSUMPTIONS: Array<{
  field: string;
  condition: (item: ExtractedLineItem, pc?: ProcessConditions) => boolean;
  value: string | ((item: ExtractedLineItem, pc?: ProcessConditions) => string);
  basis: string;
}> = [
  {
    field: "operatingPressure",
    condition: (item, pc) => {
      const p = item.pressure || "";
      return /atmospheric|atm/i.test(p) || (!p && pc?.service === "liquid");
    },
    value: "1.013",
    basis: "Atmospheric pressure assumed for liquid at atmospheric conditions",
  },
  {
    field: "operatingTemp",
    condition: (item, pc) => {
      const t = item.temperature || "";
      return /ambient|room/i.test(t) || (!t && !!pc);
    },
    value: "30",
    basis: "Ambient temperature assumed as 30°C for preliminary verification",
  },
  {
    field: "density",
    condition: (item, pc) => {
      const fluid = (pc?.fluidName || item.processMedium || "").toLowerCase();
      return fluid.includes("water") && (!pc?.density || pc.density <= 0);
    },
    value: "998",
    basis: "Water density = 998 kg/m³ (SG = 1.0) — standard assumption for water service",
  },
  {
    field: "viscosity",
    condition: (item, pc) => {
      const fluid = (pc?.fluidName || item.processMedium || "").toLowerCase();
      return fluid.includes("water") && (!pc?.viscosity || pc.viscosity <= 0);
    },
    value: "1.0",
    basis: "Water viscosity = 1.0 cP — standard assumption for water service",
  },
  {
    field: "fluidName",
    condition: (item, pc) => !pc?.fluidName && !item.processMedium,
    value: (item, pc) => pc?.service === "gas" ? "Air" : pc?.service === "steam" ? "Steam" : "Water",
    basis: "Default fluid assigned based on service type",
  },
];

function generateAssumptions(item: ExtractedLineItem): SmartAssumption[] {
  const assumptions: SmartAssumption[] = [];
  const pc = item.processConditions;

  for (const rule of SAFE_ASSUMPTIONS) {
    if (rule.condition(item, pc)) {
      const val = typeof rule.value === "function" ? rule.value(item, pc) : rule.value;
      assumptions.push({
        field: rule.field,
        assumedValue: val,
        basis: rule.basis,
        safe: true,
        needsConfirmation: true,
      });
    }
  }

  // Flow range parsing: "500 - 5000 LPH" → min=500, max=5000
  // SKIPPED for non-flow devices (level switches, gauges, transmitters, sight glasses)
  if (!isNonFlowDevice(item.productFamily)) {
    const flowRange = item.flowMin && item.flowMax;
    if (!flowRange && item.flowMin) {
      const minVal = parseFloat(item.flowMin);
      if (!isNaN(minVal) && minVal > 0) {
        assumptions.push({
          field: "flowMax",
          assumedValue: String(minVal * 5),
          basis: "Flow max estimated as 5× flow min (typical turndown ratio). Please confirm actual range.",
          safe: true,
          needsConfirmation: true,
        });
      }
    }
  }

  return assumptions;
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 5: ENGINEERING PRINCIPLE CHECKS
// ═════════════════════════════════════════════════════════════════════════════

function checkEngineeringPrinciples(item: ExtractedLineItem): TechnicalQuery[] {
  const queries: TechnicalQuery[] = [];
  const pc = item.processConditions;

  // ═══ NON-FLOW DEVICE: Skip all flow-related checks ═══
  const nonFlow = isNonFlowDevice(item.productFamily);

  // 1. Max flow < Min flow (only for flow devices)
  const fMin = parseFloat(item.flowMin);
  const fMax = parseFloat(item.flowMax);
  if (!nonFlow && fMin > 0 && fMax > 0 && fMax < fMin) {
    queries.push(makeQuery(item, "Flow Range", `${item.flowMin} - ${item.flowMax} ${item.flowUnit}`,
      "Maximum flow is less than minimum flow.",
      "This is physically impossible. Please verify the flow range values.",
      "Confirm correct min and max flow values. Swap if reversed.", "critical", true, true));
  }

  // 2. Normal flow outside range (if normal flow is present in extraction)
  const flowNormalMatch = item.notes?.match(/normal\s*flow[:\s]*(\d+\.?\d*)/i);
  if (!nonFlow && flowNormalMatch) {
    const fn = parseFloat(flowNormalMatch[1]);
    if (!isNaN(fn) && fMin > 0 && fMax > 0 && (fn < fMin || fn > fMax)) {
      queries.push(makeQuery(item, "Normal Flow", String(fn),
        "Normal flow is outside the min-max flow range.",
        "Normal flow should be between minimum and maximum flow.",
        "Confirm normal flow value or correct the flow range.", "major", true, false));
    }
  }

  // 3. Flow unit doesn't match application (only for flow devices)
  if (!nonFlow && pc?.service && item.flowUnit) {
    const unitCheck = validateUnitForApplication(item.flowUnit, pc.service);
    if (!unitCheck.valid) {
      queries.push(makeQuery(item, "Flow Unit", item.flowUnit,
        unitCheck.issue || "Flow unit may not match application type.",
        "Wrong unit can lead to incorrect sizing by orders of magnitude.",
        "Verify the flow unit is correct for the stated service type.", "critical", true, true));
    }
  }

  // 4. Temperature exceeds typical product limits
  const temp = pc?.operatingTemp || parseFloat(item.temperature);
  if (temp > 200) {
    queries.push(makeQuery(item, "Operating Temperature", `${temp}°C`,
      "Operating temperature exceeds 200°C — may exceed standard product rating.",
      "Most standard flowmeters are rated to 150-200°C. High temp may require special construction.",
      "Confirm temperature and verify product temperature rating.", "major", true, false));
  }
  if (temp > 400) {
    queries.push(makeQuery(item, "Operating Temperature", `${temp}°C`,
      "Operating temperature exceeds 400°C.",
      "This is beyond the range of most standard instrumentation. Special high-temp design required.",
      "Confirm temperature. If correct, special product selection is needed.", "critical", true, true));
  }

  // 5. Pressure exceeds typical product limits
  const press = pc?.operatingPressure || parseFloat(item.pressure);
  if (press > 40) {
    queries.push(makeQuery(item, "Operating Pressure", `${press} bar`,
      "Operating pressure exceeds 40 bar — high pressure application.",
      "Standard products are rated to PN40/Class 300. Higher pressure requires special construction.",
      "Confirm pressure rating and verify flange/product rating is adequate.", "major", true, false));
  }
  if (press > 100) {
    queries.push(makeQuery(item, "Operating Pressure", `${press} bar`,
      "Operating pressure exceeds 100 bar.",
      "Very high pressure application. Special design and certifications required.",
      "Confirm pressure. Special product selection needed.", "critical", true, true));
  }

  // 6. Density missing for liquid sizing
  if (pc?.service === "liquid" && (!pc.density || pc.density <= 0)) {
    const fluid = (pc.fluidName || "").toLowerCase();
    if (!fluid.includes("water")) {
      queries.push(makeQuery(item, "Density/Specific Gravity", "Missing",
        "Density or specific gravity is missing for non-water liquid.",
        "Liquid sizing requires density for accurate flow calculation. Cannot size without this data.",
        "Provide density at operating conditions or specific gravity of the liquid.", "critical", true, true));
    }
  }

  // 7. Gas sizing data incomplete
  if (pc?.service === "gas") {
    if (!pc.operatingPressure || pc.operatingPressure <= 0) {
      queries.push(makeQuery(item, "Operating Pressure", "Missing",
        "Operating pressure is missing for gas application.",
        "Gas flowmeter sizing requires operating pressure for density calculation.",
        "Provide operating pressure (absolute or gauge with reference).", "critical", true, true));
    }
    if (!pc.operatingTemp || pc.operatingTemp === 0) {
      queries.push(makeQuery(item, "Operating Temperature", "Missing",
        "Operating temperature is missing for gas application.",
        "Gas density calculation requires operating temperature.",
        "Provide operating temperature.", "critical", true, true));
    }
  }

  // 8. Steam data incomplete
  if (pc?.service === "steam") {
    if (!pc.operatingPressure || pc.operatingPressure <= 0) {
      queries.push(makeQuery(item, "Steam Pressure", "Missing",
        "Steam pressure is missing.",
        "Steam sizing requires pressure to determine steam density and condition.",
        "Provide steam operating pressure.", "critical", true, true));
    }
    if (!item.processMedium || !item.processMedium.toLowerCase().includes("steam")) {
      queries.push(makeQuery(item, "Steam Type", "Not confirmed",
        "Steam type (saturated/superheated) not specified.",
        "Saturated and superheated steam have very different densities.",
        "Confirm whether steam is saturated or superheated.", "major", true, false));
    }
  }

  // 9. "After Confirmation" / "Pending" in sizing-critical fields
  const criticalFields = [item.flowMin, item.flowMax, item.pressure, item.temperature, item.size];
  const criticalLabels = ["Min Flow", "Max Flow", "Operating Pressure", "Operating Temperature", "Size"];
  for (let i = 0; i < criticalFields.length; i++) {
    if (/after\s*confirmation|pending|tbd|tbc/i.test(criticalFields[i] || "")) {
      queries.push(makeQuery(item, criticalLabels[i], criticalFields[i],
        `"After Confirmation" in sizing-critical field: ${criticalLabels[i]}.`,
        "Sizing cannot proceed with unconfirmed values.",
        `Provide confirmed ${criticalLabels[i]} value for sizing and report generation.`, "critical", true, true));
    }
  }

  // 10. Product family vs model number mismatch
  if (item.modelNumber && item.productFamily) {
    const pf = item.productFamily.toLowerCase();
    const mn = item.modelNumber.toLowerCase();
    // EFM model code but not EMF product
    if (mn.includes("efm") && !pf.includes("electromagnetic") && !pf.includes("mag flow")) {
      queries.push(makeQuery(item, "Product/Model Match", `${item.productFamily} / ${item.modelNumber}`,
        "Model code suggests Electromagnetic Flowmeter but product family differs.",
        "FMIPL-EFM code is for electromagnetic flowmeters only.",
        "Verify product family or model number is correct.", "critical", true, true));
    }
    if (mn.includes("gtrm") && !pf.includes("glass") && !pf.includes("rotameter")) {
      queries.push(makeQuery(item, "Product/Model Match", `${item.productFamily} / ${item.modelNumber}`,
        "Model code suggests Glass Tube Rotameter but product family differs.",
        "FMIPL-GTRM code is for glass tube rotameters only.",
        "Verify product family or model number is correct.", "critical", true, true));
    }
  }

  return queries;
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 6 & 7: QUERY BUILDER + SEVERITY CLASSIFICATION
// ═════════════════════════════════════════════════════════════════════════════

function makeQuery(
  item: ExtractedLineItem,
  fieldName: string,
  extractedValue: string,
  issue: string,
  whyConcern: string,
  requiredClarification: string,
  severity: Severity,
  blocksSizing: boolean,
  blocksReport: boolean,
): TechnicalQuery {
  return {
    lineItemNo: item.lineItemNo,
    tagNumber: item.tagNumber,
    productName: item.productFamily,
    modelNumber: item.modelNumber,
    fieldName,
    extractedValue: extractedValue || "Missing",
    issue,
    whyConcern,
    requiredClarification,
    severity,
    blocksSizing,
    blocksReport,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 8: UNIT CONVERSION TRACKING
// ═════════════════════════════════════════════════════════════════════════════

function trackConversions(item: ExtractedLineItem, pc?: ProcessConditions): UnitConversion[] {
  const conversions: UnitConversion[] = [];

  // Flow unit conversion
  if (item.flowUnit) {
    const u = item.flowUnit.toUpperCase();
    if (u.includes("LPH")) {
      const minM3 = parseFloat(item.flowMin) / 1000;
      const maxM3 = parseFloat(item.flowMax) / 1000;
      if (!isNaN(minM3) && !isNaN(maxM3)) {
        conversions.push({
          field: "Flow Range",
          originalValue: `${item.flowMin} - ${item.flowMax} LPH`,
          convertedValue: `${minM3.toFixed(3)} - ${maxM3.toFixed(3)} m3/hr`,
          conversionBasis: "1 m3/hr = 1000 LPH",
        });
      }
    }
    if (u.includes("KG/H")) {
      // Would need density for volume conversion — flag as info
      conversions.push({
        field: "Flow Range",
        originalValue: `${item.flowMin} - ${item.flowMax} kg/hr`,
        convertedValue: "Requires density for volume conversion",
        conversionBasis: "Mass flow → volumetric flow needs fluid density at operating conditions",
      });
    }
  }

  // Pressure conversion
  const pVal = parseFloat(item.pressure);
  const pText = item.pressure || "";
  if (!isNaN(pVal) && pText.toLowerCase().includes("kg/cm")) {
    conversions.push({
      field: "Pressure",
      originalValue: `${pVal} kg/cm²`,
      convertedValue: `${(pVal * 0.980665).toFixed(2)} bar`,
      conversionBasis: "1 kg/cm² = 0.980665 bar",
    });
  }
  if (!isNaN(pVal) && pText.toLowerCase().includes("psi")) {
    conversions.push({
      field: "Pressure",
      originalValue: `${pVal} psi`,
      convertedValue: `${(pVal * 0.0689476).toFixed(2)} bar`,
      conversionBasis: "1 psi = 0.0689476 bar",
    });
  }

  // Temperature
  if (/ambient|room/i.test(item.temperature || "")) {
    conversions.push({
      field: "Temperature",
      originalValue: item.temperature || "Ambient",
      convertedValue: "Assumed 30°C",
      conversionBasis: "Ambient temperature assumption for preliminary check only",
    });
  }

  return conversions;
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 9: MANDATORY FIELD CHECKS PER APPLICATION
// ═════════════════════════════════════════════════════════════════════════════

const MANDATORY_FIELDS: Record<string, Array<{ field: string; getter: (item: ExtractedLineItem, pc?: ProcessConditions) => any }>> = {
  liquid: [
    { field: "Fluid name", getter: (i, pc) => pc?.fluidName || i.processMedium },
    { field: "Flow range (min)", getter: (i) => parseFloat(i.flowMin) > 0 ? i.flowMin : null },
    { field: "Flow range (max)", getter: (i) => parseFloat(i.flowMax) > 0 ? i.flowMax : null },
    { field: "Flow unit", getter: (i) => i.flowUnit },
    { field: "Operating pressure", getter: (i, pc) => pc?.operatingPressure || parseFloat(i.pressure) },
    { field: "Operating temperature", getter: (i, pc) => pc?.operatingTemp || parseFloat(i.temperature) },
    { field: "Density / Specific Gravity", getter: (i, pc) => pc?.density },
    { field: "Line size", getter: (i, pc) => i.size || pc?.pipeSize },
    // MOC removed — not required for sizing
    { field: "Process connection", getter: (i, pc) => i.processConnection || i.size || pc?.pipeSize },
  ],
  gas: [
    { field: "Gas name", getter: (i, pc) => pc?.fluidName || i.processMedium },
    { field: "Flow range (min)", getter: (i) => parseFloat(i.flowMin) > 0 ? i.flowMin : null },
    { field: "Flow range (max)", getter: (i) => parseFloat(i.flowMax) > 0 ? i.flowMax : null },
    { field: "Flow unit", getter: (i) => i.flowUnit },
    { field: "Operating pressure", getter: (i, pc) => pc?.operatingPressure || parseFloat(i.pressure) },
    { field: "Operating temperature", getter: (i, pc) => pc?.operatingTemp || parseFloat(i.temperature) },
    { field: "Density / Molecular weight", getter: (i, pc) => pc?.density },
    { field: "Line size", getter: (i) => i.size },
    // MOC removed — not required for sizing
    { field: "Process connection", getter: (i, pc) => i.processConnection || i.size || pc?.pipeSize },
  ],
  steam: [
    { field: "Steam type", getter: (i) => i.processMedium },
    { field: "Flow range (min)", getter: (i) => parseFloat(i.flowMin) > 0 ? i.flowMin : null },
    { field: "Flow range (max)", getter: (i) => parseFloat(i.flowMax) > 0 ? i.flowMax : null },
    { field: "Flow unit", getter: (i) => i.flowUnit },
    { field: "Operating pressure", getter: (i, pc) => pc?.operatingPressure || parseFloat(i.pressure) },
    { field: "Operating temperature", getter: (i, pc) => pc?.operatingTemp || parseFloat(i.temperature) },
    { field: "Line size", getter: (i) => i.size },
    { field: "Pressure rating", getter: (i, pc) => i.processConnection || i.size || pc?.pipeSize },
    // MOC removed — not required for sizing
    { field: "Process connection", getter: (i, pc) => i.processConnection || i.size || pc?.pipeSize },
  ],
  // Level GAUGES: C-C distance (center-to-center between top and bottom flanges)
  level_gauge: [
    { field: "Fluid name", getter: (i, pc) => pc?.fluidName || i.processMedium },
    { field: "C-C distance / Level range", getter: (i) => i.size },
    { field: "Operating pressure", getter: (i, pc) => pc?.operatingPressure || parseFloat(i.pressure) },
    { field: "Operating temperature", getter: (i, pc) => pc?.operatingTemp || parseFloat(i.temperature) },
    { field: "Specific gravity", getter: (i, pc) => pc?.density },
    { field: "Mounting type", getter: (i) => i.application },
    { field: "Connection size", getter: (i, pc) => i.processConnection || i.size || pc?.pipeSize },
    // MOC removed — not required for sizing
  ],
  // Level SWITCHES: Probe Length (not C-C distance)
  level_switch: [
    { field: "Fluid name", getter: (i, pc) => pc?.fluidName || i.processMedium },
    { field: "Probe length / Insertion length", getter: (i) => getFromSpecs(i, "Length") || i.size },
    { field: "Operating pressure", getter: (i, pc) => pc?.operatingPressure || parseFloat(i.pressure) },
    { field: "Operating temperature", getter: (i, pc) => pc?.operatingTemp || parseFloat(i.temperature) },
    { field: "Specific gravity", getter: (i, pc) => pc?.density },
    { field: "Mounting type", getter: (i) => i.application },
    { field: "Connection size", getter: (i, pc) => i.processConnection || getFromSpecs(i, "Flange Size") || i.size || pc?.pipeSize },
    { field: "No. of contact points", getter: (i) => getFromSpecs(i, "No\\. of Contact Points|Contact Points") },
    // MOC removed — not required for sizing
  ],
};

function checkMandatoryFields(item: ExtractedLineItem): { missing: string[]; service: string } {
  const pc = item.processConditions;

  // NON-FLOW DEVICES: use appropriate mandatory fields based on product type
  if (isNonFlowDevice(item.productFamily)) {
    let checks;
    if (isLevelSwitch(item.productFamily)) {
      checks = MANDATORY_FIELDS.level_switch;
    } else if (isLevelGauge(item.productFamily)) {
      checks = MANDATORY_FIELDS.level_gauge;
    } else {
      // Level transmitters, sight glasses, etc. — use level_gauge as generic fallback
      checks = MANDATORY_FIELDS.level_gauge;
    }
    const missing: string[] = [];
    for (const check of checks) {
      const val = check.getter(item, pc);
      if (val === null || val === undefined || val === "" || val === 0 || val === "PENDING") {
        // Auto-resolve Mounting Type from product family name
        if (check.field === "Mounting type") {
          const family = item.productFamily.toLowerCase();
          if (family.includes("side mounted")) continue; // resolved
          if (family.includes("top mounted")) continue; // resolved
          if (family.includes("bottom mounted")) continue; // resolved
          if (family.includes("displacer")) continue; // Displacer Level Switch = Top Mounted
          if (family.includes("tubular")) continue; // Tubular Level Indicator = Side Mounted
          if (family.includes("transmitter")) continue; // Level Transmitter = Top Mounted
          if (family.includes("radar")) continue; // Radar Level = Top Mounted
          if (family.includes("hydrostatic")) continue; // Hydrostatic Level = Top Mounted
        }
        missing.push(check.field);
      }
    }
    return { missing, service: isLevelSwitch(item.productFamily) ? "level_switch" : "level_gauge" };
  }

  const svc = pc?.service || "liquid";
  const appType = svc === "liquid" ? "liquid" : svc === "gas" ? "gas" : svc === "steam" ? "steam" : "level";
  const checks = MANDATORY_FIELDS[appType] || MANDATORY_FIELDS.liquid;
  const missing: string[] = [];

  for (const check of checks) {
    const val = check.getter(item, pc);
    if (val === null || val === undefined || val === "" || val === 0 || val === "PENDING") {
      missing.push(check.field);
    }
  }

  return { missing, service: appType };
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION 10: MAIN VALIDATION ENTRY POINT
// ═════════════════════════════════════════════════════════════════════════════

export function validateEngineering(item: ExtractedLineItem): ValidationResult {
  // Step 1: Generate smart assumptions
  const assumptions = generateAssumptions(item);

  // Step 2: Track unit conversions
  const conversions = trackConversions(item, item.processConditions);

  // Step 3: Check engineering principles
  const queries = checkEngineeringPrinciples(item);

  // Step 4: Check mandatory fields
  const mandatory = checkMandatoryFields(item);

  // Step 5: Add queries for missing mandatory fields
  for (const field of mandatory.missing) {
    const isSizingCritical = ["Flow range", "Operating pressure", "Operating temperature", "Density", "Gas name", "Steam type", "MOC"].some((k) => field.includes(k));
    queries.push(makeQuery(
      item, field, "Missing",
      `Mandatory field "${field}" is missing for ${mandatory.service} application.`,
      `${field} is required for ${mandatory.service} product sizing and selection.`,
      `Provide ${field} to proceed with sizing and report generation.`,
      isSizingCritical ? "critical" : "major",
      isSizingCritical, isSizingCritical,
    ));
  }

  // Step 6: Determine review status
  const criticalCount = queries.filter((q) => q.severity === "critical").length;
  const majorCount = queries.filter((q) => q.severity === "major").length;
  const hasAssumptions = assumptions.length > 0;

  let reviewStatus: ReviewStatus;
  if (criticalCount > 0) {
    reviewStatus = "cannot_proceed";
  } else if (majorCount > 0) {
    reviewStatus = "query_raised";
  } else if (hasAssumptions) {
    reviewStatus = "ready_with_assumptions";
  } else if (queries.length > 0) {
    reviewStatus = "query_raised";
  } else {
    reviewStatus = "ready";
  }

  // Step 7: Build review summary
  const summary: ReviewSummary = {
    extractionStatus: item.extractionConfidence >= 85 ? "Good" : item.extractionConfidence >= 60 ? "Fair" : "Poor",
    unitReadingStatus: item.flowUnit ? "Detected" : "Missing",
    applicationUnitMatch: mandatory.service,
    missingDataStatus: mandatory.missing.length === 0 ? "Complete" : `${mandatory.missing.length} fields missing`,
    assumptionsUsed: assumptions.length,
    queriesRaised: queries.length,
    criticalQueries: criticalCount,
    productSelectionReady: criticalCount === 0,
    sizingReady: criticalCount === 0 && mandatory.missing.filter((m) => m.includes("Flow") || m.includes("Pressure") || m.includes("Density")).length === 0,
    reportReady: criticalCount === 0 && queries.filter((q) => q.blocksReport).length === 0,
    overallStatus: reviewStatus,
  };

  return {
    isValid: criticalCount === 0 && majorCount === 0,
    queries,
    assumptions,
    conversions,
    missingMandatoryFields: mandatory.missing,
    reviewStatus,
    reviewSummary: summary,
  };
}

/** Validate all line items and return aggregate results */
export function validateAllLineItems(items: ExtractedLineItem[]): {
  validations: Map<string, ValidationResult>;
  totalQueries: number;
  criticalQueries: number;
  canProceed: boolean;
} {
  const validations = new Map<string, ValidationResult>();
  let totalQueries = 0;
  let criticalQueries = 0;

  for (const item of items) {
    const v = validateEngineering(item);
    validations.set(item.id, v);
    totalQueries += v.queries.length;
    criticalQueries += v.queries.filter((q) => q.severity === "critical").length;
  }

  return {
    validations,
    totalQueries,
    criticalQueries,
    canProceed: criticalQueries === 0,
  };
}
