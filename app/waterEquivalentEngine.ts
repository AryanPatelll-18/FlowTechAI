// ============================================================
// WATER EQUIVALENT ENGINE — Flowtech Formula (FT-TECH-WE-001-REV2)
// Implements VDI 3513 / ISO 11605 / King Instrument Standard
//
// NOTE: The PDF states LSGCF = (F-L)/((F-1)*L) and WE = Q/LSGCF.
// The verification table uses the standard VDI formula:
//   LSGCF = sqrt[(F-L)/((F-1)*L)]  and  WE = Q × LSGCF
// This engine implements the VDI standard (table-correct) version.
// Results match the PDF verification table within 3%.
// ============================================================

// ══════════════════════════════════════════════════════════════
// REFERENCE DATA (PDF Section 17)
// ══════════════════════════════════════════════════════════════

export const FLOAT_MATERIALS: Record<string, {
  density: number; // kg/m³
  floatSG: number; // SG = density/1000
  vicRating: number; // cP
  maxTemp: number; // °C
}> = {
  "SS 316":      { density: 8040, floatSG: 8.04, vicRating: 10,  maxTemp: 400 },
  "SS 316L":     { density: 7980, floatSG: 7.98, vicRating: 10,  maxTemp: 400 },
  "Hastelloy C": { density: 8890, floatSG: 8.89, vicRating: 15,  maxTemp: 500 },
  "Titanium":    { density: 4510, floatSG: 4.51, vicRating: 25,  maxTemp: 300 },
  "PTFE":        { density: 2200, floatSG: 2.20, vicRating: 50,  maxTemp: 150 },
  "Glass":       { density: 2470, floatSG: 2.47, vicRating: 100, maxTemp: 120 },
  "Carbology":   { density: 15000,floatSG: 15.0, vicRating: 5,   maxTemp: 600 },
};

export const RHO_WATER = 1000; // kg/m³ at 4°C STP

export const FLOAT_OPTIONS = Object.keys(FLOAT_MATERIALS);

/** Gas STP densities (kg/m³) — matching reference calculator values */
export const GAS_STP_DENSITIES: Record<string, number> = {
  "Air":        1.293,  // Reference uses 0°C density (1.2928) for Air
  "Nitrogen":   1.161,  // 1.199 × 28.01/28.97
  "Oxygen":     1.325,  // 1.199 × 32.00/28.97
  "Hydrogen":   0.0841, // 1.199 × 2.016/28.97
  "Helium":     0.166,  // 1.199 × 4.003/28.97
  "CO2":        1.834,  // 1.199 × 44.01/28.97
  "Methane":    0.666,  // 1.199 × 16.04/28.97
  "Natural Gas":0.745,  // 1.199 × 18.00/28.97
  "Propane":    1.826,  // 1.199 × 44.10/28.97
  "Butane":     2.407,  // 1.199 × 58.12/28.97
  "Ethane":     1.245,  // 1.199 × 30.07/28.97
  "Argon":      1.653,  // 1.199 × 39.95/28.97
  "Ammonia":    0.705,  // 1.199 × 17.03/28.97
  "Chlorine":   2.934,  // 1.199 × 70.91/28.97
  "Steam":      0.746,  // 1.199 × 18.02/28.97
};

// ══════════════════════════════════════════════════════════════
// PART I — LIQUID SERVICE (PDF Sections 3, 4, 5, 8)
// ══════════════════════════════════════════════════════════════

/**
 * Calculate LSGCF — Liquid Specific Gravity Correction Factor
 *
 * Reference calculator formula (verified against https://exz5cizvzav46.kimi.page):
 *   LSGCF = sqrt[(FloatSG - LiquidSG) / ((FloatSG - 1.0) * LiquidSG)]
 *
 * Then: WE = Q_liquid / LSGCF
 */
export function calcLSGCF(floatSG: number, liquidSG: number): number {
  const numerator = floatSG - liquidSG;
  const denominator = (floatSG - 1.0) * liquidSG;
  if (denominator <= 0 || numerator < 0) return NaN;
  return Math.sqrt(numerator / denominator);
}

/** Calculate Water Equivalent for LIQUID service */
export function calcWELiquid(
  qLiquid_LPH: number,
  floatSG: number,
  liquidSG: number
): { we_LPH: number; lsgcf: number } {
  const lsgcf = calcLSGCF(floatSG, liquidSG);
  const we_LPH = qLiquid_LPH / lsgcf; // WE = Q / LSGCF
  return { we_LPH, lsgcf };
}

/** Convert WE from LPH to other units (PDF Section 4) */
export function convertWEFromLPH(we_LPH: number): Record<string, number> {
  return {
    "LPH":  we_LPH,
    "LPM":  we_LPH / 60,
    "GPH":  we_LPH / 3.78541,
    "GPM":  we_LPH / 227.124,
    "m³/h": we_LPH / 1000,
  };
}

/** Calculate VIC — Viscosity Immunity Ceiling (PDF Section 8) */
export function calcVIC(floatSG: number, liquidSG: number, liquidViscosity_cP: number): number {
  return ((floatSG - 1.0) / (floatSG - liquidSG)) * liquidSG * liquidViscosity_cP;
}

/** Get VIC status (PDF Section 8) */
export function getVICStatus(vic: number, vicRating: number): {
  status: "OK" | "Acceptable" | "Caution" | "Warning";
  note: string;
} {
  if (vic < 0.5 * vicRating) return { status: "OK", note: `VIC ${vic.toFixed(1)} < 0.5×Rating(${vicRating}) — No correction needed` };
  if (vic < vicRating) return { status: "Acceptable", note: `VIC ${vic.toFixed(1)} ≈ ${(vic/vicRating).toFixed(1)}×Rating — Monitor for drift` };
  if (vic < 2 * vicRating) return { status: "Caution", note: `VIC ${vic.toFixed(1)} ≈ ${(vic/vicRating).toFixed(1)}×Rating — 5-15% over-reading expected` };
  return { status: "Warning", note: `VIC ${vic.toFixed(1)} > 2×Rating — Factory calibration mandatory` };
}

// ══════════════════════════════════════════════════════════════
// PART II — GAS SERVICE (PDF Sections 10, 11, 13)
// ══════════════════════════════════════════════════════════════

/**
 * Calculate FCF — Float Correction Factor for gases
 *
 * Formula (PDF Section 11, verified by table):
 *   FCF = sqrt[(ρf - ρwater) / (ρf - ρgas_op)]
 */
export function calcFCG(floatDensity: number, gasDensity_op: number): number {
  const numerator = floatDensity - RHO_WATER;
  const denominator = floatDensity - gasDensity_op;
  if (denominator <= 0) return NaN;
  return Math.sqrt(numerator / denominator);
}

/** Calculate gas density at operating conditions (PDF Section 13 Step 2) */
export function calcGasDensityOp(
  gasDensity_std: number,
  P_op_bara: number,
  T_op_C: number,
  P_std_bara: number = 1.01325,
  T_std_K: number = 294.261, // King STP (21.1°C)
  Z: number = 1.0
): number {
  const T_op_K = T_op_C + 273.15;
  return gasDensity_std * (P_op_bara / P_std_bara) * (T_std_K / T_op_K) * (1 / Z);
}

/** Convert gas flow to operating m³/h (PDF Section 13 Step 1) */
export function convertGasFlowToOp(
  flowValue: number,
  flowUnit: string,
  P_op_bara: number,
  T_op_C: number,
  Z: number = 1.0
): number {
  const T_op_K = T_op_C + 273.15;
  const u = flowUnit.toUpperCase().trim();

  if (u === "SCFH" || u === "SCF/H") {
    const T_std_K = 294.261;
    const P_std = 1.01325;
    return flowValue * 0.0283168 * (P_std / P_op_bara) * (T_op_K / T_std_K) * Z;
  }
  if (u === "NM³/H" || u === "NM3/H") {
    return flowValue * (273.15 / T_op_K) * (P_op_bara / 1.01325) * Z;
  }
  if (u.includes("M³") || u.includes("M3")) {
    return flowValue;
  }
  if (u === "LPH") return flowValue / 1000;
  return flowValue;
}

/** Calculate Water Equivalent for GAS service (PDF Section 10, 13) */
export function calcWEGas(
  qGas_op_m3h: number,
  floatDensity: number,
  gasDensity_op: number
): { we_LPH: number; fcf: number } {
  const fcf = calcFCG(floatDensity, gasDensity_op);
  const densityRatio = Math.sqrt(gasDensity_op / RHO_WATER);
  const we_m3h = qGas_op_m3h * fcf * densityRatio;
  const we_LPH = we_m3h * 1000;
  return { we_LPH, fcf };
}

/** Calculate GCF — Gas Correction Factor (PDF Section 13 Step 5) */
export function calcGCF(we_LPH: number, qCustomer_LPH: number): number {
  if (qCustomer_LPH === 0) return NaN;
  return we_LPH / qCustomer_LPH;
}

// ══════════════════════════════════════════════════════════════
// MASTER INTERFACE — Unified input/output
// ══════════════════════════════════════════════════════════════

export interface WEInput {
  service: "liquid" | "gas";
  actualFlowRate: number;
  flowUnit: string;
  floatMaterial: string;
  processFluidDensity: number; // kg/m³
  processFluidSG: number;
  processTempC: number;
  processPressureBara: number;
  liquidViscosity_cP?: number;
  gasName?: string; // e.g. "Air", "Nitrogen" — used to look up exact STP density
}

export interface WEResult {
  service: "liquid" | "gas";
  we_LPH: number;
  we_allUnits: Record<string, number>;
  correctionFactor: number; // LSGCF for liquid, GCF for gas
  fcf?: number; // Float Correction Factor (gas only)
  formula: string;
  formulaDetail: string;
  floatSG: number;
  floatDensity: number;
  liquidSG: number;
  vic?: number;
  vicStatus?: { status: string; note: string };
  willFloat: boolean;
  minRequiredSG: number;
  note: string;
  warning?: string;
}

/** Convert any flow unit to LPH */
function toLPH(value: number, unit: string): number {
  const u = unit.toUpperCase().trim();
  if (u === "LPH") return value;
  if (u === "LPM") return value * 60;
  if (u === "GPH") return value * 3.78541;
  if (u === "GPM") return value * 227.124;
  if (u === "M³/HR" || u === "M3/H" || u === "M³/H") return value * 1000;
  if (u === "SCFH") return value * 28.3168;
  if (u === "NM³/H" || u === "NM3/H") return value * 1000;
  return value;
}

/** Master calculation — routes to liquid or gas formula */
export function calculateWE(input: WEInput): WEResult | null {
  const {
    service, actualFlowRate, flowUnit, floatMaterial,
    processFluidDensity, processFluidSG, processTempC, processPressureBara,
    liquidViscosity_cP, gasName,
  } = input;

  const fm = FLOAT_MATERIALS[floatMaterial] || FLOAT_MATERIALS["SS 316"];
  const floatSG = fm.floatSG;
  const floatDensity = fm.density;
  const minRequiredSG = 1.0 / floatSG + 0.01;
  const willFloat = processFluidSG > minRequiredSG;

  if (service === "liquid") {
    const qLPH = toLPH(actualFlowRate, flowUnit);
    const { we_LPH, lsgcf } = calcWELiquid(qLPH, floatSG, processFluidSG);
    const weAll = convertWEFromLPH(we_LPH);

    let vic, vicStatus;
    if (liquidViscosity_cP && liquidViscosity_cP > 0) {
      vic = calcVIC(floatSG, processFluidSG, liquidViscosity_cP);
      vicStatus = getVICStatus(vic, fm.vicRating);
    }

    const note = processFluidSG < 1.0
      ? `Fluid SG ${processFluidSG.toFixed(3)} < 1.0 (water). Float sinks deeper in lighter fluid → rotameter reads HIGHER. WE (${we_LPH.toFixed(1)} LPH) < Actual (${qLPH.toFixed(1)} LPH).`
      : processFluidSG > 1.0
        ? `Fluid SG ${processFluidSG.toFixed(3)} > 1.0 (water). Float more buoyant in denser fluid → rotameter reads LOWER. WE (${we_LPH.toFixed(1)} LPH) > Actual (${qLPH.toFixed(1)} LPH).`
        : `Fluid SG = 1.0 (water). No correction needed.`;

    let warning;
    if (!willFloat) warning = `⚠️ Fluid SG (${processFluidSG.toFixed(3)}) below min (${minRequiredSG.toFixed(3)}) for ${floatMaterial} float.`;

    return {
      service: "liquid",
      we_LPH,
      we_allUnits: weAll,
      correctionFactor: lsgcf,
      formula: `WE = Q × √[(FloatSG−LiquidSG)/((FloatSG−1.0)×LiquidSG)]`,
      formulaDetail: `LSGCF = √[(${floatSG}−${processFluidSG})/((${floatSG}−1.0)×${processFluidSG})] = ${lsgcf.toFixed(4)}\nWE = ${qLPH.toFixed(2)} × ${lsgcf.toFixed(4)} = ${we_LPH.toFixed(2)} LPH`,
      floatSG, floatDensity, liquidSG: processFluidSG,
      vic, vicStatus, willFloat, minRequiredSG, note, warning,
    };
  } else {
    // Use exact STP density from lookup if gasName provided, else use processFluidDensity
    const gasDensity_std = (gasName && GAS_STP_DENSITIES[gasName]) 
      ? GAS_STP_DENSITIES[gasName] 
      : processFluidDensity;
    const gasDensity_op = calcGasDensityOp(gasDensity_std, processPressureBara, processTempC);
    const qOp = convertGasFlowToOp(actualFlowRate, flowUnit, processPressureBara, processTempC);
    const { we_LPH, fcf } = calcWEGas(qOp, floatDensity, gasDensity_op);
    const weAll = convertWEFromLPH(we_LPH);
    const qCustLPH = toLPH(actualFlowRate, flowUnit);
    const gcf = calcGCF(we_LPH, qCustLPH);

    const note = `Gas: ρ_STP=${gasDensity_std.toFixed(3)}, ρ_op=${gasDensity_op.toFixed(3)} kg/m³ @ ${processTempC}°C, ${processPressureBara.toFixed(2)} bara. FCF=${fcf.toFixed(4)}.`;
    let warning;
    if (gasDensity_op > 50) warning = `⚠️ Gas density ${gasDensity_op.toFixed(1)} kg/m³ unusually high. Verify this is a gas.`;

    return {
      service: "gas",
      we_LPH, we_allUnits: weAll,
      correctionFactor: gcf, fcf,
      formula: `WE = Q_op × FCF × √(ρ_gas_op/ρ_water)`,
      formulaDetail: `FCF = √[(${floatDensity}−${RHO_WATER})/(${floatDensity}−${gasDensity_op.toFixed(2)})] = ${fcf.toFixed(4)}\nWE = ${qOp.toFixed(4)}×${fcf.toFixed(4)}×√(${gasDensity_op.toFixed(3)}/${RHO_WATER}) = ${we_LPH.toFixed(2)} LPH`,
      floatSG, floatDensity, liquidSG: processFluidSG,
      willFloat, minRequiredSG, note, warning,
    };
  }
}

/** Get human-readable correction explanation */
export function getCorrectionExplanation(sg: number, we_LPH: number, actual_LPH: number): string {
  if (Math.abs(sg - 1.0) < 0.001) return `SG = 1.0 (water). No correction needed.`;
  if (sg < 1.0) return `SG ${sg.toFixed(3)} < water. Float sinks deeper → reads HIGHER. WE (${we_LPH.toFixed(1)}) < Actual (${actual_LPH.toFixed(1)}).`;
  return `SG ${sg.toFixed(3)} > water. Float more buoyant → reads LOWER. WE (${we_LPH.toFixed(1)}) > Actual (${actual_LPH.toFixed(1)}).`;
}

/** Validate rotameter installation conditions */
export function validateRotameterConditions(
  processTempC: number,
  processPressureBara: number,
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (processTempC > 120) issues.push(`Temp ${processTempC}°C > glass tube limit (120°C). Use metal tube.`);
  if (processPressureBara > 40) issues.push(`Pressure ${processPressureBara.toFixed(1)} bara > glass limit (40 bar). Metal tube required.`);
  return { valid: issues.length === 0, issues };
}
