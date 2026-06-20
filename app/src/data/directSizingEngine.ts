/**
 * Direct Sizing Engine — Pure synchronous function that replicates
 * the EXACT behavior of useCalculator().calculate()
 *
 * This is the fix for the ProjectSizingRunner architecture problem:
 * useCalculator() is a React UI hook with useState — calling it from
 * a wrapper component causes stale state closures. This pure function
 * bypasses React state entirely and produces identical output.
 */

import { ALL_PRODUCTS, ROTAMETER_PRODUCTS } from "./factoryTables";
import type { ProductData, SizeData } from "./factoryTables";
import { calculateSteamDensity, getSaturationTemp, interpolateSteamFlow, STEAM_SIZES } from "./steamTable";
import { calculateGasDensity, calculateGasViscosity } from "./gases";
import { validateFluidProperties } from "./fluidValidation";
import type { FluidValidationResult } from "./fluidValidation";
import { convertFlowRate, convertToDisplayUnit } from "./unitConversions";
import type { UnitConversionResult } from "./unitConversions";
import { calculateVelocity } from "./pipeDimensions";
import { toBar } from "./pressureUnits";
import { checkGasWetness } from "./gasCondensation";
import { calculateWE } from "./waterEquivalentEngine";

export type ServiceType = "liquid" | "gas" | "steam";
export type MeterCategory = "inline" | "rotameter" | "both";

// ─── Connection Range Validation ───────────────────────────────────────
// For rotameters, the SO "size" is the CONNECTION size (e.g. 50NB).
// Each tube (PG-XX) has a min-max connection range from the factory table.
// We validate the SO connection against the selected tube's supported range.

function parseConnectionRange(processConnection: string): { min: number; max: number } | null {
  // Format: "15NB to 100NB" or "25NB to 100NB"
  const match = processConnection.match(/(\d+)NB\s+to\s+(\d+)NB/i);
  if (match) {
    return { min: parseInt(match[1], 10), max: parseInt(match[2], 10) };
  }
  return null;
}

function extractNbNumber(sizeStr: string): number | null {
  // Extracts the numeric part from "50 NB", "50NB", "DN50", etc.
  const match = sizeStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export interface ConnectionValidationResult {
  soConnectionSize: string;       // e.g. "50 NB"
  soConnectionNb: number;         // e.g. 50
  tubeConnectionRange: string;    // e.g. "15NB to 100NB"
  tubeConnectionMin: number;      // e.g. 15
  tubeConnectionMax: number;      // e.g. 100
  isConnectionValid: boolean;     // true if SO connection falls within tube range
  status: "valid" | "invalid" | "na";
  message: string;
}

/** Validate an SO connection size against a selected rotameter tube's connection range */
export function validateRotameterConnection(
  soConnectionSize: string,
  selectedTubeSize: string,
  rotameterResult: RotameterResult | null,
): ConnectionValidationResult {
  // Default: not applicable (not a rotameter or no result)
  const defaultResult: ConnectionValidationResult = {
    soConnectionSize, soConnectionNb: extractNbNumber(soConnectionSize) || 0,
    tubeConnectionRange: "", tubeConnectionMin: 0, tubeConnectionMax: 0,
    isConnectionValid: true, status: "na", message: "Connection validation not applicable",
  };

  if (!rotameterResult || !rotameterResult.bestSize) return defaultResult;

  // Find the selected tube's size detail
  const tubeDetail = rotameterResult.sizes.find((s) => s.size === selectedTubeSize);
  if (!tubeDetail) return defaultResult;

  const connRange = parseConnectionRange(tubeDetail.processConnection);
  if (!connRange) return defaultResult;

  const soNb = extractNbNumber(soConnectionSize);
  if (!soNb) {
    return {
      ...defaultResult,
      tubeConnectionRange: tubeDetail.processConnection,
      tubeConnectionMin: connRange.min, tubeConnectionMax: connRange.max,
      isConnectionValid: false, status: "invalid",
      message: `Cannot parse connection size "${soConnectionSize}"`,
    };
  }

  const isValid = soNb >= connRange.min && soNb <= connRange.max;

  return {
    soConnectionSize, soConnectionNb: soNb,
    tubeConnectionRange: tubeDetail.processConnection,
    tubeConnectionMin: connRange.min, tubeConnectionMax: connRange.max,
    isConnectionValid: isValid,
    status: isValid ? "valid" : "invalid",
    message: isValid
      ? `Connection ${soNb}NB is within ${tubeDetail.processConnection} range for ${selectedTubeSize}`
      : `Connection ${soNb}NB is OUTSIDE ${tubeDetail.processConnection} range for ${selectedTubeSize}`,
  };
}

// ─── Unit Normalization ────────────────────────────────────────────────
// Extracted data often uses ASCII units (e.g. "m3/hr") but the converter
// expects Unicode (e.g. "m³/hr"). Normalize before conversion.
function normalizeFlowUnit(unit: string): string {
  const u = unit.toLowerCase().trim();
  // m3/hr variations → m³/hr
  if (u === "m3/hr" || u === "m3/h" || u === "m^3/hr" || u === "m^3/h" || u === "cum/hr" || u === "cbm/hr") return "m³/hr";
  // lph variations
  if (u === "lph" || u === "l/hr" || u === "l/h" || u === "liters/hr" || u === "litres/hr") return "lph";
  // lpm variations
  if (u === "lpm" || u === "l/min" || u === "liters/min" || u === "litres/min") return "lpm";
  // kg/hr variations
  if (u === "kg/hr" || u === "kg/h" || u === "kgph") return "kg/hr";
  // Nm3/hr variations → Nm³/hr
  if (u === "nm3/hr" || u === "nm3/h" || u === "nm^3/hr" || u === "nm^3/h" || u === "nm³/hr" || u === "nm³/h" || u.startsWith("nm")) return "Nm³/hr";
  // CFM
  if (u === "cfm" || u === "ft³/min" || u === "ft3/min" || u === "scfm") return "CFM";
  // Already normalized
  if (u === "m³/hr" || u === "m³/h") return "m³/hr";
  return unit;
}

export interface MultiConditionCoverage {
  minCovers: boolean;
  normCovers: boolean;
  maxCovers: boolean;
  allCovered: boolean;
}

export interface SizeResult {
  size: string;
  qMin: number;
  qMax: number;
  unit: string;
  status: "optimal" | "valid" | "too-low" | "too-high" | "partial-low" | "partial-high";
  percentage: number;
  isOddSize: boolean;
  median: number;
  distanceFromMedian: number;
  accuracy: string;
  uncertaintyPercent: number;
  uncertaintyAtQmin: number;
  uncertaintyAtQmax: number;
  dpMax: number;
  dpAtInput: number;
  velocityAtQmin: number;
  velocityAtQmax: number;
  meterVmin: number;
  meterVmax: number;
  velocityStatus: "too-low" | "optimal" | "valid" | "too-high";
}

export interface RotameterSizeResult {
  size: string;
  qMin: number;
  qMax: number;
  unit: string;
  status: "optimal" | "valid" | "too-low" | "too-high" | "partial-low" | "partial-high";
  median: number;
  distanceFromMedian: number;
  accuracy: string;
  uncertaintyPercent: number;
  uncertaintyAtQmin: number;
  uncertaintyAtQmax: number;
  dpMax: number;
  dpAtInput: number;
  isOddSize: boolean;
  processConnection: string;
}

export interface CalculationResult {
  product: ProductData;
  status: "best" | "suitable" | "caution" | "rejected";
  score: number;
  reason: string;
  sizes: SizeResult[];
  bestSize?: string;
  multiConditionCoverage?: Record<string, MultiConditionCoverage>;
  allConditionsCovered?: boolean;
}

export interface RotameterResult {
  product: ProductData;
  sizes: RotameterSizeResult[];
  bestSize: string | null;
  status: "best" | "suitable" | "caution" | "rejected";
  reason: string;
  weInfo?: { weNorm: number; fcf: number; gcf: number };
}

export interface DirectSizingResult {
  inlineResults: CalculationResult[];
  rotameterResults: RotameterResult[];
  fluidValidation: FluidValidationResult | null;
  unitConversion: UnitConversionResult | null;
  gasWetness: {
    isWet: boolean;
    gasName: string;
    satTempC: number | null;
    marginC: number | null;
    message: string;
  } | null;
  flowConvertedMin: number;
  flowConvertedMax: number;
  error?: string;
}

export interface DirectSizingInput {
  service: ServiceType;
  meterCategory: MeterCategory;
  flowRateMin: number;
  flowRateMax: number;
  flowUnit: string;
  density: number;
  viscosity: number;
  operatingTemp: number;
  // Liquid
  liquidPressureBarAbs: number;
  selectedLiquidName?: string;
  selectedLiquidConductivity?: boolean;
  specificGravity: number;
  // Gas
  gasPressureBarAbs: number;
  selectedGasName?: string;
  selectedGasMolecularWeight?: number;
  selectedGasSpecificGravity?: number;
  selectedGasCategory?: string;
  selectedGasNotes?: string;
  // Steam
  steamPressureBarAbs: number;
  steamTempC: number;
  steamDensity: number;
  steamState: string;
  // Multi-condition
  useMultiCondition?: boolean;
  normFlowRateMin?: number;
  normFlowRateMax?: number;
  maxFlowRateMin?: number;
  maxFlowRateMax?: number;
  // Rotameter: Float MOC from SO (affects WE calculation)
  floatMoc?: string;
}

const ODD_SIZES = new Set(["32NB", "65NB", "125NB"]);

// ─── Float Material resolver (maps extracted Float MOC to canonical name) ─
function resolveFloatMaterial(floatMoc?: string): string {
  if (!floatMoc) return "SS 316";
  const fm = floatMoc.toLowerCase().trim();
  if (fm.includes("316l")) return "SS 316L";
  if (fm.includes("316")) return "SS 316";
  if (fm.includes("304")) return "SS 304";
  if (fm.includes("hast") && fm.includes("c")) return "Hastelloy C";
  if (fm.includes("hastelloy") || fm.includes("hastalloy")) return "Hastelloy C";
  if (fm.includes("titanium") || fm === "ti") return "Titanium";
  if (fm.includes("ptfe") || fm.includes("teflon")) return "PTFE";
  if (fm.includes("pvdf")) return "PVDF";
  if (fm.includes("alumin") || fm === "al") return "Aluminium";
  if (fm.includes("pp") || fm.includes("polyprop")) return "PP";
  if (fm.includes("carbology")) return "Carbology";
  return "SS 316";
}

// ─── Uncertainty Calculation (exact copy from useCalculator) ───────────
function calculateUncertainty(
  baseAccuracy: number,
  qMin: number,
  qMax: number,
  isRotameter: boolean,
): { uncertaintyPercent: number; uncertaintyAtQmin: number; uncertaintyAtQmax: number } {
  if (isRotameter) {
    const fsd = qMax;
    const absUncertainty = (baseAccuracy / 100) * fsd;
    return {
      uncertaintyPercent: baseAccuracy,
      uncertaintyAtQmin: absUncertainty,
      uncertaintyAtQmax: absUncertainty,
    };
  }
  const reynoldsEffect = 0.15;
  const installEffect = 0.1;
  const totalUncertainty = baseAccuracy + installEffect;
  return {
    uncertaintyPercent: totalUncertainty,
    uncertaintyAtQmin: (totalUncertainty + reynoldsEffect) / 100 * qMin,
    uncertaintyAtQmax: totalUncertainty / 100 * qMax,
  };
}

// ─── Main Sizing Function ──────────────────────────────────────────────

export function runDirectSizing(input: DirectSizingInput): DirectSizingResult {
  const {
    service, meterCategory, flowRateMin, flowRateMax, flowUnit: rawFlowUnit,
    density, viscosity, operatingTemp,
    liquidPressureBarAbs, gasPressureBarAbs, steamPressureBarAbs,
    steamTempC, steamDensity, steamState,
    selectedGasName, selectedGasMolecularWeight, selectedGasSpecificGravity,
    specificGravity,
    useMultiCondition, normFlowRateMin, normFlowRateMax, maxFlowRateMin, maxFlowRateMax,
  } = input;

  // Normalize flow unit: extracted data often uses ASCII ("m3/hr") but converter expects Unicode ("m³/hr")
  const flowUnit = normalizeFlowUnit(rawFlowUnit);

  const result: DirectSizingResult = {
    inlineResults: [],
    rotameterResults: [],
    fluidValidation: null,
    unitConversion: null,
    gasWetness: null,
    flowConvertedMin: 0,
    flowConvertedMax: 0,
  };

  // ─── 1. Validate flow range ─────────────────────────────────────────
  if (flowRateMin <= 0 || flowRateMax <= 0) {
    result.error = "Flow rates must be greater than 0";
    return result;
  }
  if (flowRateMin > flowRateMax) {
    result.error = `DATA INPUT ERROR: Minimum flow (${flowRateMin} ${flowUnit}) cannot be greater than Maximum flow (${flowRateMax} ${flowUnit}).`;
    result.fluidValidation = {
      isValid: false,
      message: result.error,
      warnings: ["Qmin must be less than or equal to Qmax"],
      errors: [`Flow range is inverted: ${flowRateMin} ${flowUnit} > ${flowRateMax} ${flowUnit}`],
      info: ["Ensure Qmin ≤ Qmax for valid sizing"],
      confidence: "high",
    } as FluidValidationResult;
    return result;
  }

  // ─── 2. Convert flow rates ──────────────────────────────────────────
  let pConv = 0;
  if (service === "gas") pConv = gasPressureBarAbs;
  else if (service === "steam") pConv = steamPressureBarAbs;
  else pConv = liquidPressureBarAbs;

  const unitConvMin = convertFlowRate(flowRateMin, flowUnit, service, density, pConv, operatingTemp);
  const unitConvMax = convertFlowRate(flowRateMax, flowUnit, service, density, pConv, operatingTemp);

  result.unitConversion = unitConvMax;

  if (!unitConvMin.canConvert || !unitConvMax.canConvert) {
    result.error = `Cannot convert flow unit "${flowUnit}" for ${service} service. ${unitConvMax.warnings.join("; ")}`;
    return result;
  }

  const cfrMin = unitConvMin.convertedValue;
  const cfrMax = unitConvMax.convertedValue;
  result.flowConvertedMin = cfrMin;
  result.flowConvertedMax = cfrMax;

  // ─── 3. Inline-specific validations ─────────────────────────────────
  let validation: FluidValidationResult | null = null;
  let gasWetness: DirectSizingResult["gasWetness"] = null;

  if (meterCategory !== "rotameter") {
    // We don't have the full liquid/gas object here, so skip validation
    // (the main Sizing section's UI will do this; for project sizing,
    // the validation was already done during extraction)

    // Gas wetness detection
    if (service === "gas" && selectedGasName) {
      const wetness = checkGasWetness(selectedGasName, operatingTemp, gasPressureBarAbs);
      gasWetness = {
        isWet: wetness.isWet,
        gasName: selectedGasName,
        satTempC: wetness.satTempC,
        marginC: wetness.marginC,
        message: wetness.message,
      };
    }
  }

  result.fluidValidation = validation;
  result.gasWetness = gasWetness;

  // ═══════════════════════════════════════════════════════════════════
  // INLINE FLOWMETER SIZING
  // ═══════════════════════════════════════════════════════════════════
  const inlineResults: CalculationResult[] = [];

  if (meterCategory !== "rotameter") {
    for (const product of ALL_PRODUCTS) {
      if (product.service !== service) continue;

      if (product.status === "pending") {
        inlineResults.push({ product, status: "rejected", score: 0, reason: "Data Pending", sizes: [] });
        continue;
      }
      if (product.status === "rd") {
        inlineResults.push({ product, status: "caution", score: 50, reason: "R&D - awaiting factory data", sizes: [] });
        continue;
      }

      const reasons: string[] = [];
      let rejected = false;

      // Product-level hard filters
      if (product.requiresConductivity && input.selectedLiquidConductivity === false) {
        rejected = true; reasons.push("Non-conductive fluid - EM requires conductive liquid");
      }
      if (product.minViscosity !== undefined && viscosity < product.minViscosity) {
        rejected = true; reasons.push(`Viscosity ${viscosity} cP < min ${product.minViscosity} cP`);
      }
      if (product.maxViscosity !== undefined && viscosity > product.maxViscosity) {
        rejected = true; reasons.push(`Viscosity ${viscosity} cP > max ${product.maxViscosity} cP`);
      }
      if (service === "liquid" && product.minDensity && density < product.minDensity) {
        rejected = true; reasons.push(`Density ${density} kg/m³ < min ${product.minDensity} kg/m³`);
      }
      if (product.minPressure !== undefined) {
        let pAbs = 0;
        if (service === "gas") pAbs = gasPressureBarAbs;
        else if (service === "steam") pAbs = steamPressureBarAbs;
        else pAbs = liquidPressureBarAbs;
        if (pAbs < product.minPressure) {
          rejected = true; reasons.push(`Pressure ${pAbs.toFixed(2)} bar abs < min ${product.minPressure} bar abs`);
        }
      }
      if (product.minTemp !== undefined && operatingTemp < product.minTemp) {
        rejected = true; reasons.push(`Temp ${operatingTemp}°C < min ${product.minTemp}°C`);
      }
      if (product.maxTemp !== undefined && operatingTemp > product.maxTemp) {
        rejected = true; reasons.push(`Temp ${operatingTemp}°C > max ${product.maxTemp}°C`);
      }

      // Wet steam rejection
      if (service === "steam" && steamState === "wet" && product.name.includes("Vortex")) {
        rejected = true; reasons.push("Wet steam — Vortex requires single-phase flow (dry saturated or superheated only)");
      }

      // Gas wetness rejection
      if (service === "gas" && product.name.includes("Vortex") && gasWetness?.isWet) {
        rejected = true; reasons.push(`${gasWetness.gasName} at or below dew point (${gasWetness.satTempC?.toFixed(1)}°C) — Vortex requires single-phase flow only`);
      }

      if (rejected) {
        inlineResults.push({ product, status: "rejected", score: 0, reason: reasons.join("; "), sizes: [] });
        continue;
      }

      const sizeResults: SizeResult[] = [];
      let validSizes = 0, optimalSizes = 0;
      const accStr = product.accuracy ? `±${product.accuracy}% MV` : "—";

      if (service === "steam") {
        for (const size of STEAM_SIZES) {
          const flow = interpolateSteamFlow(size, steamPressureBarAbs);
          if (!flow) continue;
          const vss = product.sizes.find((s) => s.size === size);
          const dpMax = vss?.dpMax ?? 0.3;
          const median = (flow.qmin + flow.qmax) / 2;
          const processCenter = (cfrMin + cfrMax) / 2;
          const distMed = Math.abs(processCenter - median) / (flow.qmax - flow.qmin);
          const pctMax = ((cfrMax - flow.qmin) / (flow.qmax - flow.qmin)) * 100;

          let st: SizeResult["status"];
          if (cfrMax < flow.qmin) { st = "too-low"; }
          else if (cfrMin > flow.qmax) { st = "too-high"; }
          else if (cfrMin < flow.qmin && cfrMax <= flow.qmax) { st = "partial-low"; validSizes++; }
          else if (cfrMax > flow.qmax && cfrMin >= flow.qmin) { st = "partial-high"; validSizes++; }
          else if (distMed <= 0.25) { st = "optimal"; validSizes++; optimalSizes++; }
          else { st = "valid"; validSizes++; }

          const vIMax = calculateVelocity(cfrMax / density, size);
          const dpAtInputMax = dpMax * Math.pow(cfrMax / flow.qmax, 2);
          const vIMin = calculateVelocity(cfrMin / density, size);
          const unc = calculateUncertainty(product.accuracy || 1, flow.qmin, flow.qmax, false);

          sizeResults.push({
            size, qMin: flow.qmin, qMax: flow.qmax, unit: "kg/hr", status: st,
            percentage: Math.max(0, Math.min(100, pctMax)),
            isOddSize: ODD_SIZES.has(size),
            median, distanceFromMedian: distMed, accuracy: accStr,
            uncertaintyPercent: unc.uncertaintyPercent,
            uncertaintyAtQmin: unc.uncertaintyAtQmin,
            uncertaintyAtQmax: unc.uncertaintyAtQmax,
            dpMax, dpAtInput: dpAtInputMax,
            velocityAtQmin: vIMin, velocityAtQmax: vIMax,
            meterVmin: 0, meterVmax: 0, velocityStatus: "valid",
          });
        }
      } else {
        for (const sz of product.sizes) {
          const median = (sz.qMin + sz.qMax) / 2;
          const processCenter = (cfrMin + cfrMax) / 2;
          const distMed = Math.abs(processCenter - median) / (sz.qMax - sz.qMin);
          const pctMax = ((cfrMax - sz.qMin) / (sz.qMax - sz.qMin)) * 100;

          let st: SizeResult["status"];
          if (cfrMax < sz.qMin) { st = "too-low"; }
          else if (cfrMin > sz.qMax) { st = "too-high"; }
          else if (cfrMin < sz.qMin && cfrMax <= sz.qMax) { st = "partial-low"; validSizes++; }
          else if (cfrMax > sz.qMax && cfrMin >= sz.qMin) { st = "partial-high"; validSizes++; }
          else if (distMed <= 0.25) { st = "optimal"; validSizes++; optimalSizes++; }
          else { st = "valid"; validSizes++; }

          const vIMax = calculateVelocity(cfrMax, sz.size);
          const dpAtInputMax = sz.dpMax * Math.pow(cfrMax / sz.qMax, 2);
          const vIMin = calculateVelocity(cfrMin, sz.size);
          const unc = calculateUncertainty(product.accuracy || 1, sz.qMin, sz.qMax, false);

          sizeResults.push({
            size: sz.size, qMin: sz.qMin, qMax: sz.qMax, unit: sz.unit, status: st,
            percentage: Math.max(0, Math.min(100, pctMax)),
            isOddSize: ODD_SIZES.has(sz.size),
            median, distanceFromMedian: distMed, accuracy: accStr,
            uncertaintyPercent: unc.uncertaintyPercent,
            uncertaintyAtQmin: unc.uncertaintyAtQmin,
            uncertaintyAtQmax: unc.uncertaintyAtQmax,
            dpMax: sz.dpMax, dpAtInput: dpAtInputMax,
            velocityAtQmin: vIMin, velocityAtQmax: vIMax,
            meterVmin: sz.vMin || 0, meterVmax: sz.vMax || 0, velocityStatus: "valid",
          });
        }
      }

      // Hard filters: accuracy > 40%, Qmin process >= Qmin meter
      const accuracyFiltered = sizeResults.filter((s) => {
        const accuracyPct = (1 - s.distanceFromMedian) * 100;
        const passesAccuracy = accuracyPct > 40;
        const passesQmin = cfrMin >= s.qMin;
        return passesAccuracy && passesQmin;
      });

      // Pick best size
      const allRanked = accuracyFiltered
        .filter((s) => s.status === "optimal" || s.status === "valid")
        .sort((a, b) => a.distanceFromMedian - b.distanceFromMedian);
      const standardSizes = allRanked.filter((s) => !s.isOddSize);
      const chosen = standardSizes.length > 0 ? standardSizes[0] : allRanked[0];
      const bestSize = chosen ? chosen.size : undefined;

      // Multi-condition coverage
      let multiCoverage: Record<string, MultiConditionCoverage> = {};
      let allConditionsCovered = false;
      if (useMultiCondition && normFlowRateMin !== undefined && normFlowRateMax !== undefined && maxFlowRateMin !== undefined && maxFlowRateMax !== undefined) {
        const normCfrMin = convertFlowRate(normFlowRateMin, flowUnit, service, density, pConv, operatingTemp).convertedValue;
        const normCfrMax = convertFlowRate(normFlowRateMax, flowUnit, service, density, pConv, operatingTemp).convertedValue;
        const maxCfrMin = convertFlowRate(maxFlowRateMin, flowUnit, service, density, pConv, operatingTemp).convertedValue;
        const maxCfrMax = convertFlowRate(maxFlowRateMax, flowUnit, service, density, pConv, operatingTemp).convertedValue;

        for (const s of accuracyFiltered) {
          const cov: MultiConditionCoverage = {
            minCovers: cfrMin >= s.qMin && cfrMax <= s.qMax,
            normCovers: normCfrMin >= s.qMin && normCfrMax <= s.qMax,
            maxCovers: maxCfrMin >= s.qMin && maxCfrMax <= s.qMax,
            allCovered: false,
          };
          cov.allCovered = cov.minCovers && cov.normCovers && cov.maxCovers;
          multiCoverage[s.size] = cov;
          if (cov.allCovered && (s.status === "optimal" || s.status === "valid")) {
            allConditionsCovered = true;
          }
        }
      }

      const filteredOptimal = accuracyFiltered.filter((s) => s.status === "optimal").length;
      const filteredValid = accuracyFiltered.filter((s) => s.status === "optimal" || s.status === "valid").length;

      let ps: CalculationResult["status"], sc: number, re: string;
      if (filteredValid === 0) {
        ps = "caution"; sc = 20;
        re = `No size meets accuracy (>40%) and Qmin≥${cfrMin.toFixed(1)} criteria for ${flowRateMin}–${flowRateMax}`;
      } else if (useMultiCondition && allConditionsCovered) {
        ps = "best"; sc = 98;
        re = `ONE meter covers MIN/NORM/MAX for ${flowRateMin}–${maxFlowRateMax} ${flowUnit}. Best: ${bestSize}`;
      } else if (filteredOptimal > 0) {
        ps = "best"; sc = 95;
        re = `${filteredOptimal} size(s) optimal for ${flowRateMin}–${flowRateMax}. Best: ${bestSize}`;
      } else {
        ps = "suitable"; sc = 75;
        re = `${filteredValid} size(s) valid for ${flowRateMin}–${flowRateMax}. Recommended: ${bestSize}`;
      }

      inlineResults.push({
        product, status: ps, score: sc, reason: re,
        sizes: accuracyFiltered, bestSize,
        multiConditionCoverage: useMultiCondition ? multiCoverage : undefined,
        allConditionsCovered: useMultiCondition ? allConditionsCovered : undefined,
      });
    }

    // Sort results
    inlineResults.sort((a, b) => {
      const o = { best: 0, suitable: 1, caution: 2, rejected: 3 };
      const statusDiff = o[a.status] - o[b.status];
      if (statusDiff !== 0) return statusDiff;
      const accA = a.product.accuracy ?? 999;
      const accB = b.product.accuracy ?? 999;
      return accA - accB;
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // ROTAMETER SIZING (Variable Area)
  // ═══════════════════════════════════════════════════════════════════
  const rotameterResults: RotameterResult[] = [];

  if (meterCategory !== "inline" && (service === "liquid" || service === "gas")) {
    let flowMinCorr = cfrMin;
    let flowMaxCorr = cfrMax;
    let sgCorrection = 1.0;
    let weInfo: { weNorm: number; fcf: number; gcf: number } | null = null;

    // Resolve Float MOC for WE calculation (liquid and gas)
    const floatMaterial = resolveFloatMaterial(input.floatMoc);

    if (service === "liquid") {
      // SG correction: factory tables calibrated for water SG=1.0
      const sgFluid = specificGravity > 0 ? specificGravity : density / 1000;
      sgCorrection = sgFluid > 0 ? 1 / Math.sqrt(sgFluid) : 1.0;
      // Calculate WE for liquid using Float MOC from SO
      const weMinResult = calculateWE({
        service: "liquid",
        actualFlowRate: flowRateMin,
        flowUnit,
        floatMaterial,
        processFluidDensity: density,
        processFluidSG: specificGravity || (density / 1000),
        processTempC: operatingTemp,
        processPressureBara: liquidPressureBarAbs,
        liquidViscosity_cP: viscosity,
      });
      const weMaxResult = calculateWE({
        service: "liquid",
        actualFlowRate: flowRateMax,
        flowUnit,
        floatMaterial,
        processFluidDensity: density,
        processFluidSG: specificGravity || (density / 1000),
        processTempC: operatingTemp,
        processPressureBara: liquidPressureBarAbs,
        liquidViscosity_cP: viscosity,
      });
      if (weMinResult && weMaxResult) {
        weInfo = { weNorm: (weMinResult.we_LPH + weMaxResult.we_LPH) / 2, fcf: weMinResult.fcf ?? 0, gcf: weMinResult.correctionFactor };
      }
    } else if (service === "gas" && selectedGasName) {
      // Gas: Calculate Water Equivalent using Float MOC from SO (default SS 316)
      const floatMaterial = resolveFloatMaterial(input.floatMoc);
      const weMinResult = calculateWE({
        service: "gas",
        actualFlowRate: flowRateMin,
        flowUnit,
        floatMaterial,
        processFluidDensity: density,
        processFluidSG: density / 1000,
        processTempC: operatingTemp,
        processPressureBara: gasPressureBarAbs,
        gasName: selectedGasName,
      });
      const weMaxResult = calculateWE({
        service: "gas",
        actualFlowRate: flowRateMax,
        flowUnit,
        floatMaterial,
        processFluidDensity: density,
        processFluidSG: density / 1000,
        processTempC: operatingTemp,
        processPressureBara: gasPressureBarAbs,
        gasName: selectedGasName,
      });
      if (weMinResult && weMaxResult) {
        flowMinCorr = weMinResult.we_LPH;
        flowMaxCorr = weMaxResult.we_LPH;
        weInfo = { weNorm: (flowMinCorr + flowMaxCorr) / 2, fcf: weMinResult.fcf ?? 0, gcf: weMinResult.correctionFactor };
      }
    }

    for (const product of ROTAMETER_PRODUCTS) {
      // Hard limit: temperature
      if (product.maxTemp !== undefined && operatingTemp > product.maxTemp) {
        rotameterResults.push({ product, sizes: [], bestSize: null, status: "rejected", reason: `Temp ${operatingTemp}°C > max ${product.maxTemp}°C`, weInfo: weInfo ?? undefined });
        continue;
      }

      const accStr = product.accuracy ? `±${product.accuracy}% FSD` : "—";
      const rtSizes: RotameterSizeResult[] = [];

      for (const sz of product.sizes) {
        // For liquid: apply SG correction to factory Qmin/Qmax (both in m³/hr)
        // For gas: WE is in LPH — convert factory m³/hr to LPH (*1000)
        const qMinCorr = service === "liquid" ? sz.qMin / sgCorrection : sz.qMin * 1000;
        const qMaxCorr = service === "liquid" ? sz.qMax / sgCorrection : sz.qMax * 1000;
        const median = (qMinCorr + qMaxCorr) / 2;
        const processCenter = (flowMinCorr + flowMaxCorr) / 2;
        const distMed = Math.abs(processCenter - median) / (qMaxCorr - qMinCorr);

        let st: RotameterSizeResult["status"];
        if (flowMaxCorr < qMinCorr) { st = "too-low"; }
        else if (flowMinCorr > qMaxCorr) { st = "too-high"; }
        else if (flowMinCorr < qMinCorr && flowMaxCorr <= qMaxCorr) { st = "partial-low"; }
        else if (flowMaxCorr > qMaxCorr && flowMinCorr >= qMinCorr) { st = "partial-high"; }
        else if (distMed <= 0.25) { st = "optimal"; }
        else { st = "valid"; }

        const dpAtInputMax = sz.dpMax * Math.pow(flowMaxCorr / qMaxCorr, 2);
        const unc = calculateUncertainty(product.accuracy || 2, qMinCorr, qMaxCorr, true);

        rtSizes.push({
          size: sz.size, qMin: qMinCorr, qMax: qMaxCorr, unit: sz.unit,
          status: st, median, distanceFromMedian: distMed,
          accuracy: accStr,
          uncertaintyPercent: unc.uncertaintyPercent,
          uncertaintyAtQmin: unc.uncertaintyAtQmin,
          uncertaintyAtQmax: unc.uncertaintyAtQmax,
          dpMax: sz.dpMax, dpAtInput: dpAtInputMax,
          isOddSize: ODD_SIZES.has(sz.size),
          processConnection: sz.processConnection || "",
        });
      }

      // Hard filters
      const rtFiltered = rtSizes.filter((s) => {
        const accuracyPct = (1 - s.distanceFromMedian) * 100;
        const passesAccuracy = accuracyPct > 40;
        const passesQmin = flowMinCorr >= s.qMin;
        return passesAccuracy && passesQmin;
      });

      const goodRt = rtFiltered
        .filter((s) => s.status === "optimal" || s.status === "valid" || s.status === "partial-low" || s.status === "partial-high")
        .sort((a, b) => a.distanceFromMedian - b.distanceFromMedian);
      const bestRt = goodRt.length > 0
        ? goodRt.filter((s) => !s.isOddSize)[0] || goodRt[0]
        : null;

      // Determine status
      let rtStatus: RotameterResult["status"] = "rejected";
      let rtReason = "No suitable sizes";
      if (bestRt) {
        if (rtFiltered.some((s) => s.status === "optimal")) {
          rtStatus = "best"; rtReason = `${rtFiltered.length} size(s) optimal. Best: ${bestRt.size}`;
        } else {
          rtStatus = "suitable"; rtReason = `${rtFiltered.length} size(s) valid. Best: ${bestRt.size}`;
        }
      }

      rotameterResults.push({
        product, sizes: rtFiltered,
        bestSize: bestRt?.size || null,
        status: rtStatus,
        reason: rtReason,
        weInfo: weInfo ?? undefined,
      });
    }
  }

  result.inlineResults = inlineResults;
  result.rotameterResults = rotameterResults;
  return result;
}

// ─── Helper: Detect meter category from product family name ────────────

export function detectMeterCategory(productFamily: string): MeterCategory {
  const pf = productFamily.toLowerCase();
  if (pf.includes("rotameter") || pf.includes("rotometer")) return "rotameter";
  if (pf.includes("flowmeter") || pf.includes("flow meter") || pf.includes("turbine") || pf.includes("vortex") || pf.includes("oval gear") || pf.includes("electromagnetic")) return "inline";
  return "both";
}

// ─── Helper: Build a sizing result summary from direct sizing output ───

export interface SizingSummary {
  bestSize: string;
  bestProduct: string;
  qMin: number;
  qMax: number;
  qMinUnit: string;
  velocityMin?: number;
  velocityMax?: number;
  velocityStatus?: string;
  accuracy: string;
  turndown: number;
  status: "optimal" | "valid" | "caution" | "rejected" | "no_data";
  reason: string;
  waterEquivalent?: { weNorm: number; fcf: number; gcf: number };
  sizedAt: number;
}

export function buildSizingSummary(
  result: DirectSizingResult,
  service: ServiceType,
  flowUnit: string,
): SizingSummary {
  const summary: SizingSummary = {
    bestSize: "", bestProduct: "", qMin: 0, qMax: 0, qMinUnit: flowUnit,
    accuracy: "", turndown: 0, status: "no_data", reason: "", sizedAt: Date.now(),
  };

  // Get first inline result with a bestSize
  const inlineResult = result.inlineResults.find((r) => r.bestSize);
  // Get first rotameter result with a bestSize
  const rotameterResult = result.rotameterResults.find((r) => r.bestSize);

  const targetResult = inlineResult || rotameterResult;

  if (!targetResult) {
    summary.status = "no_data";
    summary.reason = result.error || "No valid sizing result found.";
    return summary;
  }

  summary.bestSize = targetResult.bestSize || "";
  summary.bestProduct = targetResult.product.name;

  // Find the best size details
  const sizesArr = (targetResult as any).sizes || [];
  const bestSizeDetail = sizesArr.find((s: any) => s.size === summary.bestSize);

  if (bestSizeDetail) {
    summary.qMin = bestSizeDetail.qMin;
    summary.qMax = bestSizeDetail.qMax;
    summary.qMinUnit = bestSizeDetail.unit || flowUnit;
    if (bestSizeDetail.velocityAtQmin !== undefined) {
      summary.velocityMin = bestSizeDetail.velocityAtQmin;
      summary.velocityMax = bestSizeDetail.velocityAtQmax;
    }
    summary.accuracy = bestSizeDetail.accuracy || "—";
  }

  summary.turndown = summary.qMin > 0 ? summary.qMax / summary.qMin : 0;
  summary.status = targetResult.status === "best" || targetResult.status === "suitable"
    ? "valid"
    : targetResult.status === "caution" ? "caution" : "valid";
  summary.reason = targetResult.reason;

  // Water equivalent info for rotameters
  if (rotameterResult?.weInfo) {
    summary.waterEquivalent = rotameterResult.weInfo;
  }

  return summary;
}
