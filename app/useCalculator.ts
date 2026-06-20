import { useState, useCallback, useMemo } from "react";
import type { LiquidData } from "../data/liquids";
import { ALL_PRODUCTS, ROTAMETER_PRODUCTS } from "../data/factoryTables";
import type { ProductData } from "../data/factoryTables";
import { calculateSteamDensity, getSaturationTemp, interpolateSteamFlow, STEAM_SIZES } from "../data/steamTable";
import type { GasData } from "../data/gases";
import { calculateGasDensity, calculateGasViscosity } from "../data/gases";
import { calculateDensityAtTemp, calculateViscosityAtTemp, validateFluidProperties } from "../data/fluidValidation";
import type { FluidValidationResult } from "../data/fluidValidation";
import { convertFlowRate, convertToDisplayUnit } from "../data/unitConversions";
import type { UnitConversionResult } from "../data/unitConversions";
import { calculateVelocity } from "../data/pipeDimensions";
import type { PressureUnit } from "../data/pressureUnits";
import { toBar } from "../data/pressureUnits";
import { checkGasWetness } from "../data/gasCondensation";
import { getMocRecommendation } from "../data/mocEngine";
import type { MocRecommendation } from "../data/mocEngine";

export type ServiceType = "liquid" | "gas" | "steam";

// P2: Multi-condition coverage indicator per size
export interface MultiConditionCoverage {
  minCovers: boolean;  // MIN condition falls within this size's range
  normCovers: boolean; // NORM condition falls within this size's range
  maxCovers: boolean;  // MAX condition falls within this size's range
  allCovered: boolean; // All three conditions covered by this ONE size
}

export interface CalculationResult {
  product: ProductData;
  status: "best" | "suitable" | "caution" | "rejected";
  score: number;
  reason: string;
  sizes: SizeResult[];
  bestSize?: string;
  // P2: Multi-condition sizing coverage per size
  multiConditionCoverage?: Record<string, MultiConditionCoverage>;
  // P2: Does ANY single size cover all three conditions?
  allConditionsCovered?: boolean;
}

// Non-standard sizes that should not be selected as "Best"
export const ODD_SIZES = new Set(["32NB", "65NB", "125NB"]);

// P1: Measurement Uncertainty Calculation
// Total uncertainty = base accuracy + Reynolds effect + installation effect
// For inline meters: accuracy is % of MV (Measured Value)
// For rotameters: accuracy is % of FSD (Full Scale Deflection)
function calculateUncertainty(
  baseAccuracy: number,       // e.g. 0.5 for ±0.5%
  qMin: number,
  qMax: number,
  isRotameter: boolean,
): { uncertaintyPercent: number; uncertaintyAtQmin: number; uncertaintyAtQmax: number } {
  if (isRotameter) {
    // Rotameter: accuracy is % of FSD — constant uncertainty in flow units
    // But % of reading varies with scale position
    const fsd = qMax; // Full scale = Qmax for rotameter
    const absUncertainty = (baseAccuracy / 100) * fsd; // ±X% of FSD in flow units
    void qMin; // referenced for documentation purposes
    return {
      uncertaintyPercent: baseAccuracy,
      uncertaintyAtQmin: absUncertainty,
      uncertaintyAtQmax: absUncertainty,
    };
  }
  // Inline meter: accuracy is % of MV
  // Reynolds effect: higher uncertainty near Qmin (low Reynolds number)
  const reynoldsEffect = 0.15; // Additional ±0.15% at Qmin due to low Re
  const installEffect = 0.1;   // Additional ±0.1% from real-world installation
  const totalUncertainty = baseAccuracy + installEffect; // Base + install
  return {
    uncertaintyPercent: totalUncertainty,
    uncertaintyAtQmin: (totalUncertainty + reynoldsEffect) / 100 * qMin,
    uncertaintyAtQmax: totalUncertainty / 100 * qMax,
  };
}

export interface SizeResult {
  size: string;
  qMin: number;
  qMax: number;
  unit: string;
  status: "optimal" | "valid" | "too-low" | "too-high" | "partial-low" | "partial-high";
  percentage: number;
  isOddSize: boolean; // true for non-standard sizes (32NB, 65NB, 125NB)
  // Accuracy: median of size range = (qMin + qMax) / 2
  // Flow closest to median = highest accuracy position
  median: number;
  distanceFromMedian: number; // 0 = exactly at median (most accurate), 1 = at edge
  accuracy: string; // e.g. "±0.5% MV"
  // P1: Measurement uncertainty at process flow conditions
  // Total uncertainty = base accuracy + Reynolds effect + installation effect
  uncertaintyPercent: number; // ±% of measured value (e.g. 0.8 = ±0.8%)
  uncertaintyAtQmin: number; // ±flow units at Qmin
  uncertaintyAtQmax: number; // ±flow units at Qmax
  // Pressure loss at Qmax (bar) — reference value from factory table
  dpMax: number;
  // Pressure loss at input flow rate (bar) — calculated: dpAtInput = dpMax × (Qinput/Qmax)²
  dpAtInput: number;
  // Velocity range: vmin = velocity at Qmin flow, vmax = velocity at Qmax flow
  velocityAtQmin: number;
  velocityAtQmax: number;
  // Meter's rated velocity limits
  meterVmin: number;
  meterVmax: number;
  velocityStatus: "too-low" | "optimal" | "valid" | "too-high";
}

// ─── Meter Category ──────────────────────────────────────────────────
// User selects which type of flowmeter to size BEFORE entering process params
// This creates complete segregation between Inline and Variable Area flowmeters
export type MeterCategory = "inline" | "rotameter" | "both";

export interface CalculatorState {
  service: ServiceType;
  meterCategory: MeterCategory; // NEW: selected BEFORE process parameters
  // Liquid
  selectedLiquid: LiquidData | null;
  density: number;
  viscosity: number;
  specificGravity: number; // SG relative to water (liquids) or air (gases)
  operatingTemp: number;
  liquidPressureBarAbs: number;
  liquidPressureUnit: PressureUnit;
  // Steam
  steamPressureBarAbs: number;
  steamPressureUnit: PressureUnit;
  steamTempC: number;
  steamDensity: number;
  steamState: string;
  steamNote: string;
  // Gas
  selectedGas: GasData | null;
  gasPressureBarAbs: number;
  gasPressureUnit: PressureUnit;
  // Flow Range (dual inputs per P&ID practice)
  flowRateMin: number; // MIN condition: Lower side flow rate
  flowRateMax: number; // MIN condition: Higher side flow rate (must be ≥ flowRateMin)
  flowUnit: string;
  // P2: Multi-Condition Sizing (MIN / NORM / MAX)
  useMultiCondition: boolean;        // Enable three-condition sizing
  normFlowRateMin: number;           // NORM condition low flow
  normFlowRateMax: number;           // NORM condition high flow
  maxFlowRateMin: number;            // MAX condition low flow
  maxFlowRateMax: number;            // MAX condition high flow
  // Validation
  fluidValidation: FluidValidationResult | null;
  autoCorrectedDensity: number | null;
  autoCorrectedViscosity: number | null;
  unitConversion: UnitConversionResult | null;
  // Gas wetness detection
  gasWetness: {
    isWet: boolean;
    gasName: string;
    satTempC: number | null;
    marginC: number | null;
    message: string;
  } | null;
  // Rotameter results (separate section — Variable Area, no velocity)
  rotameterResults: RotameterResult[];
  // Phase II: AI MOC Recommendation
  mocRecommendation: MocRecommendation | null;
  // Temperature-Viscosity Impact: warnings when viscosity falls outside product limits
  viscosityImpactWarnings: ViscosityImpactWarning[];
  // Temperature Impact: warnings when operating temp falls outside product rated range
  temperatureImpactWarnings: TemperatureImpactWarning[];
  // Pipe size for velocity calculation
  pipeSizeNominal: string; // e.g. "DN80" — enables velocity checks in anomaly detector
  // Results
  results: CalculationResult[];
  calculated: boolean;
}

/** Warns user when operating-temperature viscosity affects product eligibility */
export interface ViscosityImpactWarning {
  product: string;
  issue: "too-low" | "too-high";
  limitName: string;   // e.g. "Oval Gear minimum"
  limitValue: number;  // cP
  actualViscosity: number; // cP
  message: string;
}

/** Warns user when operating temperature falls outside a product's rated range */
export interface TemperatureImpactWarning {
  product: string;
  issue: "too-low" | "too-high";
  limit: number;  // °C
  actualTemp: number; // °C
  message: string;
}

// ─── Rotameter-specific result type (Variable Area — no velocity) ───
export interface RotameterResult {
  product: ProductData;
  sizes: RotameterSizeResult[];
  bestSize: string | null;
}

export interface RotameterSizeResult {
  size: string;        // PG code
  qMin: number;
  qMax: number;
  unit: string;
  status: "optimal" | "valid" | "too-low" | "too-high" | "partial-low" | "partial-high";
  median: number;
  distanceFromMedian: number;
  accuracy: string;
  // P1: Measurement uncertainty (rotameter: ±% FSD, varies with scale position)
  uncertaintyPercent: number;  // ±% of FSD at current scale position
  uncertaintyAtQmin: number;   // ±flow units at Qmin (worst case)
  uncertaintyAtQmax: number;   // ±flow units at Qmax (best case)
  dpMax: number;
  dpAtInput: number;
  isOddSize: boolean;
  processConnection: string;  // e.g. "15NB to 100NB" — from Flowtech factory table
}

const INITIAL_STATE: CalculatorState = {
  service: "liquid",
  meterCategory: "inline",
  selectedLiquid: null,
  density: 998,
  viscosity: 1.0,
  specificGravity: 0.998,
  operatingTemp: 20,
  liquidPressureBarAbs: 1.013,
  liquidPressureUnit: "bar",
  steamPressureBarAbs: 6.013,
  steamPressureUnit: "bar",
  steamTempC: 159,
  steamDensity: 0,
  steamState: "",
  steamNote: "",
  selectedGas: null,
  gasPressureBarAbs: 2,
  gasPressureUnit: "bar",
  flowRateMin: 10,
  flowRateMax: 50,
  flowUnit: "m³/hr",
  useMultiCondition: false,
  normFlowRateMin: 25,
  normFlowRateMax: 75,
  maxFlowRateMin: 40,
  maxFlowRateMax: 100,
  fluidValidation: null,
  autoCorrectedDensity: null,
  autoCorrectedViscosity: null,
  unitConversion: null,
  gasWetness: null,
  rotameterResults: [],
  pipeSizeNominal: "DN80",
  mocRecommendation: null,
  viscosityImpactWarnings: [],
  temperatureImpactWarnings: [],
  results: [],
  calculated: false,
};

// ─── Product Viscosity Limits (from factoryTables.ts) ────────────────────
const VISCOSITY_LIMITS: { name: string; minViscosity?: number; maxViscosity?: number }[] = [
  { name: "Digital Oval Gear Flowmeter", minViscosity: 9, maxViscosity: 1000 },
  { name: "Turbine Flowmeter", maxViscosity: 10 },
  { name: "Vortex Flowmeter (Liquid)", maxViscosity: 10 },
  { name: "Electromagnetic Flowmeter", maxViscosity: 200 },
  { name: "Ultrasonic Flowmeter", maxViscosity: 500 },
];

// ─── Product Temperature Limits (from factoryTables.ts) ──────────────────
const TEMPERATURE_LIMITS: { name: string; minTemp?: number; maxTemp?: number }[] = [
  { name: "Electromagnetic Flowmeter", minTemp: -10, maxTemp: 100 },
  { name: "Turbine Flowmeter", minTemp: -20, maxTemp: 150 },
  { name: "Vortex Flowmeter (Liquid)", minTemp: -40, maxTemp: 400 },
  { name: "Vortex Flowmeter (Gas)", minTemp: -40, maxTemp: 350 },
  { name: "Vortex Flowmeter (Steam)", minTemp: -40, maxTemp: 400 },
  { name: "Ultrasonic Flowmeter", minTemp: -40, maxTemp: 200 },
  { name: "Digital Oval Gear Flowmeter", minTemp: -10, maxTemp: 150 },
  { name: "Glass Tube Rotameter (SS316 Float)", minTemp: -20, maxTemp: 93 },
  { name: "Glass Tube Rotameter (PTFE Float)", minTemp: -20, maxTemp: 93 },
];

/** Check if current temperature falls outside any product's rated range. */
function checkTemperatureImpact(temp: number, service: ServiceType): TemperatureImpactWarning[] {
  if (temp === 20) return []; // Reference temp — always OK
  const warnings: TemperatureImpactWarning[] = [];
  for (const p of TEMPERATURE_LIMITS) {
    // Filter by service relevance (steam/gas variants)
    if (service === "liquid" && (p.name.includes("Steam") || p.name.includes("Gas"))) continue;
    if (service === "gas" && p.name.includes("Steam")) continue;
    if (service === "steam" && (p.name.includes("(Gas)") || p.name.includes("(Liquid)"))) continue;
    if (p.minTemp !== undefined && temp < p.minTemp) {
      warnings.push({
        product: p.name,
        issue: "too-low",
        limit: p.minTemp,
        actualTemp: temp,
        message: `Operating temp ${temp}°C is BELOW the ${p.minTemp}°C minimum for ${p.name} — this product will be REJECTED`,
      });
    }
    if (p.maxTemp !== undefined && temp > p.maxTemp) {
      warnings.push({
        product: p.name,
        issue: "too-high",
        limit: p.maxTemp,
        actualTemp: temp,
        message: `Operating temp ${temp}°C is ABOVE the ${p.maxTemp}°C maximum for ${p.name} — this product will be REJECTED`,
      });
    }
  }
  return warnings;
}

/** Check if current viscosity falls outside any product's limits.
 *  Call this whenever viscosity changes (temp correction or manual entry).
 */
function checkViscosityImpact(viscosity: number, service: ServiceType): ViscosityImpactWarning[] {
  if (service !== "liquid" || viscosity <= 0) return [];
  const warnings: ViscosityImpactWarning[] = [];
  for (const p of VISCOSITY_LIMITS) {
    if (p.minViscosity !== undefined && viscosity < p.minViscosity) {
      const gap = (p.minViscosity - viscosity).toFixed(1);
      warnings.push({
        product: p.name,
        issue: "too-low",
        limitName: `${p.name.split(" ")[0]} ${p.name.split(" ")[1]} minimum`,
        limitValue: p.minViscosity,
        actualViscosity: viscosity,
        message: `Viscosity ${viscosity.toFixed(2)} cP is ${gap} cP BELOW the ${p.minViscosity} cP minimum for ${p.name} — this product will be REJECTED`,
      });
    }
    if (p.maxViscosity !== undefined && viscosity > p.maxViscosity) {
      const gap = (viscosity - p.maxViscosity).toFixed(1);
      warnings.push({
        product: p.name,
        issue: "too-high",
        limitName: `${p.name.split(" ")[0]} ${p.name.split(" ")[1]} maximum`,
        limitValue: p.maxViscosity,
        actualViscosity: viscosity,
        message: `Viscosity ${viscosity.toFixed(2)} cP is ${gap} cP ABOVE the ${p.maxViscosity} cP maximum for ${p.name} — this product will be REJECTED`,
      });
    }
  }
  return warnings;
}

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE);

  const setService = useCallback((service: ServiceType) => {
    setState((prev) => ({
      ...prev,
      service,
      calculated: false,
      results: [],
      flowUnit: service === "steam" ? "kg/hr" : service === "gas" ? "Nm³/hr" : "m³/hr",
      ...(service === "steam"
        ? { density: 3.17, viscosity: 0.014, specificGravity: 0.00317, operatingTemp: 159 }
        : service === "gas"
        ? { density: 1.2, viscosity: 0.018, specificGravity: 1.0, operatingTemp: 20 }
        : { density: 998, viscosity: 1.0, specificGravity: 0.998, operatingTemp: 20 }),
    }));
  }, []);

  const setSelectedLiquid = useCallback((liquid: LiquidData | null) => {
    if (!liquid) {
      setState((prev) => ({ ...prev, selectedLiquid: null, mocRecommendation: null, calculated: false }));
      return;
    }
    const moc = getMocRecommendation({
      name: liquid.name,
      formula: liquid.formula || "",
      category: liquid.category,
      conductivity: liquid.conductivity,
      notes: liquid.notes,
      service: "liquid",
    });
    setState((prev) => {
      const viscWarnings = checkViscosityImpact(liquid.viscosity, prev.service);
      return {
        ...prev,
        selectedLiquid: liquid,
        density: liquid.density,
        viscosity: liquid.viscosity,
        specificGravity: liquid.specificGravity ?? liquid.density / 1000,
        mocRecommendation: moc,
        viscosityImpactWarnings: viscWarnings,
        calculated: false,
      };
    });
  }, []);

  const setDensity = useCallback((d: number) => setState((p) => ({ ...p, density: d, calculated: false })), []);
  const setViscosity = useCallback((v: number) => {
    setState((p) => {
      const viscWarnings = checkViscosityImpact(v, p.service);
      return { ...p, viscosity: v, viscosityImpactWarnings: viscWarnings, calculated: false };
    });
  }, []);

  const setOperatingTemp = useCallback((temp: number) => {
    setState((prev) => {
      let newDensity = prev.density;
      let newViscosity = prev.viscosity;
      let autoD: number | null = null;
      let autoV: number | null = null;
      if (prev.selectedLiquid && prev.service === "liquid") {
        const d = calculateDensityAtTemp(prev.selectedLiquid, temp);
        const v = calculateViscosityAtTemp(prev.selectedLiquid, temp);
        autoD = d.density; autoV = v.viscosity;
        if (d.confidence === "high") newDensity = d.density;
        if (v.confidence === "high") newViscosity = v.viscosity;
      }
      const viscWarnings = checkViscosityImpact(newViscosity, prev.service);
      const tempWarnings = checkTemperatureImpact(temp, prev.service);
      return { ...prev, operatingTemp: temp, density: newDensity, viscosity: newViscosity, autoCorrectedDensity: autoD, autoCorrectedViscosity: autoV, viscosityImpactWarnings: viscWarnings, temperatureImpactWarnings: tempWarnings, calculated: false };
    });
  }, []);

  // Liquid pressure: store raw value in selected unit + converted bar abs
  const setLiquidPressure = useCallback((value: number, unit: PressureUnit) => {
    const barAbs = toBar(value, unit);
    setState((prev) => ({ ...prev, liquidPressureBarAbs: barAbs, liquidPressureUnit: unit, calculated: false }));
  }, []);

  // Steam pressure: store raw value + converted bar abs, auto-update saturation temp
  const setSteamPressure = useCallback((value: number, unit: PressureUnit) => {
    const barAbs = toBar(value, unit);
    setState((prev) => {
      const tSat = getSaturationTemp(barAbs);
      const newTemp = tSat !== null ? tSat : prev.steamTempC;
      return { ...prev, steamPressureBarAbs: barAbs, steamPressureUnit: unit, steamTempC: newTemp, operatingTemp: newTemp, calculated: false };
    });
  }, []);

  const setSteamTempC = useCallback((temp: number) => {
    setState((prev) => {
      const result = calculateSteamDensity(prev.steamPressureBarAbs, temp);
      const steamSG = result.density / 1000;
      const moc = getMocRecommendation({
        name: `Steam (${prev.steamPressureBarAbs.toFixed(1)} bar)`,
        formula: "H₂O",
        category: "Steam",
        service: "steam",
      });
      const tempWarnings = checkTemperatureImpact(temp, prev.service);
      return { ...prev, steamTempC: temp, operatingTemp: temp, steamDensity: result.density, steamState: result.state, steamNote: result.note || "", density: result.density, specificGravity: steamSG, mocRecommendation: moc, temperatureImpactWarnings: tempWarnings, calculated: false };
    });
  }, []);

  // Gas: select gas + auto-calculate density/viscosity
  const setSelectedGas = useCallback((gas: GasData | null) => {
    if (!gas) { setState((p) => ({ ...p, selectedGas: null, mocRecommendation: null, calculated: false })); return; }
    setState((prev) => {
      const rho = calculateGasDensity(gas, prev.gasPressureBarAbs, prev.operatingTemp);
      const mu = calculateGasViscosity(gas, prev.operatingTemp);
      const moc = getMocRecommendation({
        name: gas.name,
        formula: gas.formula,
        category: gas.category,
        notes: gas.notes,
        service: "gas",
      });
      return { ...prev, selectedGas: gas, density: rho, viscosity: mu, specificGravity: gas.specificGravity ?? gas.molecularWeight / 28.9647, mocRecommendation: moc, calculated: false };
    });
  }, []);

  // Gas pressure: store raw value + converted bar abs
  const setGasPressure = useCallback((value: number, unit: PressureUnit) => {
    const barAbs = toBar(value, unit);
    setState((prev) => {
      if (prev.selectedGas) {
        const rho = calculateGasDensity(prev.selectedGas, barAbs, prev.operatingTemp);
        return { ...prev, gasPressureBarAbs: barAbs, gasPressureUnit: unit, density: rho, calculated: false };
      }
      const tK = prev.operatingTemp + 273.15;
      const rho = (barAbs * 100000 * 0.02897) / (8.314 * tK);
      return { ...prev, gasPressureBarAbs: barAbs, gasPressureUnit: unit, density: parseFloat(rho.toFixed(4)), calculated: false };
    });
  }, []);

  const setFlowRateMin = useCallback((f: number) => setState((p) => ({ ...p, flowRateMin: f, calculated: false, unitConversion: null, fluidValidation: null })), []);
  const setFlowRateMax = useCallback((f: number) => setState((p) => ({ ...p, flowRateMax: f, calculated: false, unitConversion: null, fluidValidation: null })), []);
  const setMeterCategory = useCallback((meterCategory: MeterCategory) => setState((p) => ({ ...p, meterCategory, calculated: false })), []);
  const setFlowUnit = useCallback((u: string) => setState((p) => ({ ...p, flowUnit: u, calculated: false, unitConversion: null })), []);
  const setPipeSize = useCallback((size: string) => setState((p) => ({ ...p, pipeSizeNominal: size, calculated: false })), []);
  // P2: Multi-condition setters
  const setUseMultiCondition = useCallback((v: boolean) => setState((p) => ({ ...p, useMultiCondition: v, calculated: false })), []);
  const setNormFlowRateMin = useCallback((f: number) => setState((p) => ({ ...p, normFlowRateMin: f, calculated: false })), []);
  const setNormFlowRateMax = useCallback((f: number) => setState((p) => ({ ...p, normFlowRateMax: f, calculated: false })), []);
  const setMaxFlowRateMin = useCallback((f: number) => setState((p) => ({ ...p, maxFlowRateMin: f, calculated: false })), []);
  const setMaxFlowRateMax = useCallback((f: number) => setState((p) => ({ ...p, maxFlowRateMax: f, calculated: false })), []);

  // ======== CALCULATE ========
  const calculate = useCallback(() => {
    const { service, density, viscosity, operatingTemp, flowRateMin, flowRateMax, flowUnit } = state;

    let pConv = 0;
    if (service === "gas") pConv = state.gasPressureBarAbs;
    else if (service === "steam") pConv = state.steamPressureBarAbs;
    else pConv = state.liquidPressureBarAbs;

    // Convert both Qmin and Qmax flow rates
    const unitConvMin = convertFlowRate(flowRateMin, flowUnit, service, density, pConv, operatingTemp);
    const unitConvMax = convertFlowRate(flowRateMax, flowUnit, service, density, pConv, operatingTemp);
    setState((p) => ({ ...p, unitConversion: unitConvMax }));
    if (!unitConvMin.canConvert || !unitConvMax.canConvert) { setState((p) => ({ ...p, calculated: true, results: [] })); return; }

    const cfrMin = unitConvMin.convertedValue;
    const cfrMax = unitConvMax.convertedValue;

    // ─── CRITICAL: Qmin must be ≤ Qmax ──────────────────────────────
    if (flowRateMin > flowRateMax) {
      setState((p) => ({
        ...p,
        calculated: true,
        results: [],
        rotameterResults: [],
        fluidValidation: {
          isValid: false,
          message: `DATA INPUT ERROR: Minimum flow (${flowRateMin} ${flowUnit}) cannot be greater than Maximum flow (${flowRateMax} ${flowUnit}). Please correct your flow range.`,
          warnings: ["Qmin must be less than or equal to Qmax"],
          errors: [`Flow range is inverted: ${flowRateMin} ${flowUnit} > ${flowRateMax} ${flowUnit}`],
          info: ["Ensure Qmin ≤ Qmax for valid sizing"],
          confidence: "high",
        } as FluidValidationResult,
      }));
      return;
    }

    // ─── Inline-specific validations (skip for rotameter-only mode) ───
    let validation = null;
    let gasWetness = null;
    if (state.meterCategory !== "rotameter") {
      validation = validateFluidProperties(state.selectedLiquid, density, viscosity, operatingTemp);
      // ─── Gas wetness detection ──────────────────────────────────
      if (service === "gas" && state.selectedGas) {
        const wetness = checkGasWetness(
          state.selectedGas.name,
          operatingTemp,
          state.gasPressureBarAbs
        );
        gasWetness = {
          isWet: wetness.isWet,
          gasName: state.selectedGas.name,
          satTempC: wetness.satTempC,
          marginC: wetness.marginC,
          message: wetness.message,
        };
      }
    }
    setState((p) => ({ ...p, fluidValidation: validation }));

    // ─── INLINE FLOWMETER SIZING (velocity-based) ─────────────────────
    // Only run when user selected "inline" or "both"
    const results: CalculationResult[] = [];
    if (state.meterCategory !== "rotameter") {
    for (const product of ALL_PRODUCTS) {
      if (product.service !== service) continue;
      if (product.status === "pending") { results.push({ product, status: "rejected", score: 0, reason: "Data Pending", sizes: [] }); continue; }
      if (product.status === "rd") { results.push({ product, status: "caution", score: 50, reason: "R&D - awaiting factory data", sizes: [] }); continue; }

      const reasons: string[] = [];
      let rejected = false;

      if (product.requiresConductivity) {
        const liq = state.selectedLiquid;
        if (liq && liq.conductivity === false) { rejected = true; reasons.push(`Non-conductive fluid - EM requires conductive liquid`); }
      }
      if (product.minViscosity !== undefined && viscosity < product.minViscosity) { rejected = true; reasons.push(`Viscosity ${viscosity} cP < min ${product.minViscosity} cP`); }
      if (product.maxViscosity !== undefined && viscosity > product.maxViscosity) { rejected = true; reasons.push(`Viscosity ${viscosity} cP > max ${product.maxViscosity} cP`); }
      if (service === "liquid" && product.minDensity && density < product.minDensity) { rejected = true; reasons.push(`Density ${density} kg/m³ < min ${product.minDensity} kg/m³`); }
      if (product.minPressure !== undefined) {
        let pAbs = 0;
        if (service === "gas") pAbs = state.gasPressureBarAbs;
        else if (service === "steam") pAbs = state.steamPressureBarAbs;
        else pAbs = state.liquidPressureBarAbs;
        if (pAbs < product.minPressure) { rejected = true; reasons.push(`Pressure ${pAbs.toFixed(2)} bar abs < min ${product.minPressure} bar abs`); }
      }
      if (product.minTemp !== undefined && operatingTemp < product.minTemp) { rejected = true; reasons.push(`Temp ${operatingTemp}°C < min ${product.minTemp}°C`); }
      if (product.maxTemp !== undefined && operatingTemp > product.maxTemp) { rejected = true; reasons.push(`Temp ${operatingTemp}°C > max ${product.maxTemp}°C`); }

      // ─── Wet steam rejection — Vortex Flowmeter requires single-phase flow ───
      // Wet steam = two-phase mixture (liquid droplets + gas). Vortex shedding
      // is erratic in two-phase flow — only dry saturated or superheated steam.
      if (service === "steam" && state.steamState === "wet" && product.name.includes("Vortex")) {
        rejected = true; reasons.push("Wet steam — Vortex requires single-phase flow (dry saturated or superheated only)");
      }

      // ─── Gas wetness rejection — Vortex requires single-phase flow ───
      // If gas is at or below its dew point at operating pressure, condensation
      // will form liquid droplets → two-phase flow → Vortex NOT suitable.
      // Applies to: Chlorine, Ammonia (Methane/LNG condensation only at cryogenic temps)
      if (service === "gas" && product.name.includes("Vortex") && state.gasWetness?.isWet) {
        rejected = true; reasons.push(`${state.gasWetness.gasName} at or below dew point (${state.gasWetness.satTempC?.toFixed(1)}°C) — Vortex requires single-phase flow only`);
      }

      if (rejected) { results.push({ product, status: "rejected", score: 0, reason: reasons.join("; "), sizes: [] }); continue; }

      const sizeResults: SizeResult[] = [];
      let validSizes = 0, optimalSizes = 0, bestSize: string | undefined;

      // ─── Calculate median-closeness for accuracy-based sizing ───
      // Highest accuracy = flow rate closest to median of size range
      const accStr = product.accuracy ? `±${product.accuracy}% MV` : "—";

      if (service === "steam") {
        for (const size of STEAM_SIZES) {
          const flow = interpolateSteamFlow(size, state.steamPressureBarAbs);
          if (!flow) continue;
          // Look up dpMax from Vortex Steam product sizes
          const vss = product.sizes.find((s) => s.size === size);
          const dpMax = vss?.dpMax ?? 0.3;
          const median = (flow.qmin + flow.qmax) / 2;
          // Range-based sizing: check both Qmin and Qmax of process
          // Process flow center point for median-closeness accuracy
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
          sizeResults.push({ size, qMin: flow.qmin, qMax: flow.qmax, unit: "kg/hr", status: st, percentage: Math.max(0, Math.min(100, pctMax)), isOddSize: ODD_SIZES.has(size), median, distanceFromMedian: distMed, accuracy: accStr, uncertaintyPercent: unc.uncertaintyPercent, uncertaintyAtQmin: unc.uncertaintyAtQmin, uncertaintyAtQmax: unc.uncertaintyAtQmax, dpMax, dpAtInput: dpAtInputMax, velocityAtQmin: vIMin, velocityAtQmax: vIMax, meterVmin: 0, meterVmax: 0, velocityStatus: "valid" });
        }
      } else {
        for (const size of product.sizes) {
          const median = (size.qMin + size.qMax) / 2;
          // Range-based sizing: check both Qmin and Qmax of process
          // Process flow center point for median-closeness accuracy
          const processCenter = (cfrMin + cfrMax) / 2;
          const distMed = Math.abs(processCenter - median) / (size.qMax - size.qMin);
          const pctMax = ((cfrMax - size.qMin) / (size.qMax - size.qMin)) * 100;
          let st: SizeResult["status"];
          if (cfrMax < size.qMin) { st = "too-low"; }
          else if (cfrMin > size.qMax) { st = "too-high"; }
          else if (cfrMin < size.qMin && cfrMax <= size.qMax) { st = "partial-low"; validSizes++; }
          else if (cfrMax > size.qMax && cfrMin >= size.qMin) { st = "partial-high"; validSizes++; }
          else if (distMed <= 0.25) { st = "optimal"; validSizes++; optimalSizes++; }
          else { st = "valid"; validSizes++; }
          const vIMax = calculateVelocity(cfrMax, size.size);
          const dpAtInputMax = size.dpMax * Math.pow(cfrMax / size.qMax, 2);
          const vIMin = calculateVelocity(cfrMin, size.size);
          const unc = calculateUncertainty(product.accuracy || 1, size.qMin, size.qMax, false);
          sizeResults.push({ size: size.size, qMin: size.qMin, qMax: size.qMax, unit: size.unit, status: st, percentage: Math.max(0, Math.min(100, pctMax)), isOddSize: ODD_SIZES.has(size.size), median, distanceFromMedian: distMed, accuracy: accStr, uncertaintyPercent: unc.uncertaintyPercent, uncertaintyAtQmin: unc.uncertaintyAtQmin, uncertaintyAtQmax: unc.uncertaintyAtQmax, dpMax: size.dpMax, dpAtInput: dpAtInputMax, velocityAtQmin: vIMin, velocityAtQmax: vIMax, meterVmin: size.vMin || 0, meterVmax: size.vMax || 0, velocityStatus: "valid" });
        }
      }

      // ─── HARD FILTERS ─────────────────────────────────────────────────
      // 1. Accuracy > 40% only: distanceFromMedian < 0.6 (0% at edge, 100% at center)
      // 2. Process Qmin MUST be ≥ meter size Qmin (input low flow ≥ meter min design flow)
      const accuracyFiltered = sizeResults.filter((s) => {
        const accuracyPct = (1 - s.distanceFromMedian) * 100;
        const passesAccuracy = accuracyPct > 40;
        const passesQmin = cfrMin >= s.qMin;
        return passesAccuracy && passesQmin;
      });

      // ─── Pick best size: prefer standard sizes, exclude odd sizes ───
      const allRanked = accuracyFiltered
        .filter((s) => s.status === "optimal" || s.status === "valid")
        .sort((a, b) => a.distanceFromMedian - b.distanceFromMedian);
      // Prefer standard sizes first; only use odd sizes if no standard size is available
      const standardSizes = allRanked.filter((s) => !s.isOddSize);
      const chosen = standardSizes.length > 0 ? standardSizes[0] : allRanked[0];
      if (chosen) {
        bestSize = chosen.size;
      }

      // ─── P2: Multi-Condition Coverage Check ────────────────────────────
      let multiCoverage: Record<string, MultiConditionCoverage> = {};
      let allConditionsCovered = false;
      if (state.useMultiCondition) {
        const nc = { dens: state.density, p: state.gasPressureBarAbs, t: state.operatingTemp };
        const normCfrMin = convertFlowRate(state.normFlowRateMin, state.flowUnit, service, nc.dens, nc.p, nc.t).convertedValue;
        const normCfrMax = convertFlowRate(state.normFlowRateMax, state.flowUnit, service, nc.dens, nc.p, nc.t).convertedValue;
        const maxCfrMin = convertFlowRate(state.maxFlowRateMin, state.flowUnit, service, nc.dens, nc.p, nc.t).convertedValue;
        const maxCfrMax = convertFlowRate(state.maxFlowRateMax, state.flowUnit, service, nc.dens, nc.p, nc.t).convertedValue;

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

      // Recalculate counts from filtered sizes
      const filteredOptimal = accuracyFiltered.filter((s) => s.status === "optimal").length;
      const filteredValid = accuracyFiltered.filter((s) => s.status === "optimal" || s.status === "valid").length;

      let ps: CalculationResult["status"], sc: number, re: string;
      if (filteredValid === 0) { ps = "caution"; sc = 20; re = `No size meets accuracy (>40%) and Qmin≥${cfrMin.toFixed(1)} criteria for ${flowRateMin}–${flowRateMax}`; }
      else if (state.useMultiCondition && allConditionsCovered) { ps = "best"; sc = 98; re = `ONE meter covers MIN/NORM/MAX for ${flowRateMin}–${state.maxFlowRateMax} ${state.flowUnit}. Best: ${bestSize}`; }
      else if (filteredOptimal > 0) { ps = "best"; sc = 95; re = `${filteredOptimal} size(s) optimal for ${flowRateMin}–${flowRateMax}. Best: ${bestSize}`; }
      else { ps = "suitable"; sc = 75; re = `${filteredValid} size(s) valid for ${flowRateMin}–${flowRateMax}. Recommended: ${bestSize}`; }
      results.push({ product, status: ps, score: sc, reason: re, sizes: accuracyFiltered, bestSize, multiConditionCoverage: state.useMultiCondition ? multiCoverage : undefined, allConditionsCovered: state.useMultiCondition ? allConditionsCovered : undefined });
    }
    // Sort: status first, then by accuracy (lower = better), then by score
    results.sort((a, b) => {
      const o = { best: 0, suitable: 1, caution: 2, rejected: 3 };
      const statusDiff = o[a.status] - o[b.status];
      if (statusDiff !== 0) return statusDiff;
      // Same status: higher accuracy (lower %) wins
      const accA = a.product.accuracy ?? 999;
      const accB = b.product.accuracy ?? 999;
      return accA - accB;
    });
    } // end inline sizing block

    // ─── ROTAMETER SIZING (Variable Area — separate from normal products) ───
    // Rotameters work on variable area principle — no velocity-based sizing.
    // The factory Qmin/Qmax tables are calibrated for water (SG=1.0).
    // When measuring a fluid with SG != 1.0, the float position changes due to
    // buoyancy, requiring a correction factor: CF = 1/√(SG_fluid)
    // Q_actual = Q_water / √(SG_fluid)
    // ─── ROTAMETER SIZING (Variable Area — no velocity) ──────────────
    // Only run when user selected "rotameter" or "both", and for liquid service
    const rotameterResults: RotameterResult[] = [];
    if (state.meterCategory !== "inline" && service === "liquid") {
      // SG correction factor for rotameter (factory tables calibrated for water SG=1.0)
      const sgFluid = state.specificGravity;
      const sgCorrection = sgFluid > 0 ? 1 / Math.sqrt(sgFluid) : 1.0;
      for (const product of ROTAMETER_PRODUCTS) {
        // Hard limit: temperature
        if (product.maxTemp !== undefined && operatingTemp > product.maxTemp) {
          rotameterResults.push({ product, sizes: [], bestSize: null });
          continue;
        }
        const accStr = product.accuracy ? `±${product.accuracy}% FSD` : "—";
        const rtSizes: RotameterSizeResult[] = [];
        for (const sz of product.sizes) {
          // Apply SG correction to factory Qmin/Qmax (water-calibrated)
          const qMinCorr = sz.qMin / sgCorrection;
          const qMaxCorr = sz.qMax / sgCorrection;
          const median = (qMinCorr + qMaxCorr) / 2;
          // Range-based sizing for rotameter: check both Qmin and Qmax of process
          // Process flow center point for median-closeness accuracy
          const processCenter = (cfrMin + cfrMax) / 2;
          const distMed = Math.abs(processCenter - median) / (qMaxCorr - qMinCorr);
          let st: RotameterSizeResult["status"];
          if (cfrMax < qMinCorr) { st = "too-low"; }
          else if (cfrMin > qMaxCorr) { st = "too-high"; }
          else if (cfrMin < qMinCorr && cfrMax <= qMaxCorr) { st = "partial-low"; }
          else if (cfrMax > qMaxCorr && cfrMin >= qMinCorr) { st = "partial-high"; }
          else if (distMed <= 0.25) { st = "optimal"; }
          else { st = "valid"; }
          const dpAtInputMax = sz.dpMax * Math.pow(cfrMax / qMaxCorr, 2);
          const unc = calculateUncertainty(product.accuracy || 2, qMinCorr, qMaxCorr, true);
          rtSizes.push({
            size: sz.size, qMin: qMinCorr, qMax: qMaxCorr, unit: sz.unit,
            status: st, median, distanceFromMedian: distMed,
            accuracy: accStr, uncertaintyPercent: unc.uncertaintyPercent,
            uncertaintyAtQmin: unc.uncertaintyAtQmin, uncertaintyAtQmax: unc.uncertaintyAtQmax,
            dpMax: sz.dpMax, dpAtInput: dpAtInputMax,
            isOddSize: ODD_SIZES.has(sz.size),
            processConnection: sz.processConnection || "",
          });
        }
        // ─── HARD FILTERS (same as inline) ──────────────────────────────
        // 1. Accuracy > 40% only: distanceFromMedian < 0.6
        // 2. Process Qmin MUST be ≥ meter size Qmin
        const rtFiltered = rtSizes.filter((s) => {
          const accuracyPct = (1 - s.distanceFromMedian) * 100;
          const passesAccuracy = accuracyPct > 40;
          const passesQmin = cfrMin >= s.qMin;
          return passesAccuracy && passesQmin;
        });

        // Best = closest to median among valid/optimal sizes
        const goodRt = rtFiltered
          .filter((s) => s.status === "optimal" || s.status === "valid" || s.status === "partial-low" || s.status === "partial-high")
          .sort((a, b) => a.distanceFromMedian - b.distanceFromMedian);
        const bestRt = goodRt.length > 0
          ? goodRt.filter((s) => !s.isOddSize)[0] || goodRt[0]
          : null;
        rotameterResults.push({ product, sizes: rtFiltered, bestSize: bestRt?.size || null });
      }
    } // end rotameter sizing block

    setState((p) => ({ ...p, results, gasWetness, rotameterResults, calculated: true }));
  }, [state]);

  const reset = useCallback(() => setState(INITIAL_STATE), []);
  const logout = useCallback(() => { sessionStorage.removeItem("flowtech_auth"); window.location.reload(); }, []);
  const validResults = useMemo(() => state.results.filter((r) => r.status !== "rejected"), [state.results]);
  const rejectedResults = useMemo(() => state.results.filter((r) => r.status === "rejected"), [state.results]);

  // Display-unit converter: converts native-unit values (m³/hr, Nm³/hr, kg/hr)
  // back to the user's selected input unit for consistent output display
  const toDisplayUnit = useCallback((nativeValue: number): number => {
    let pConv = 0;
    if (state.service === "gas") pConv = state.gasPressureBarAbs;
    else if (state.service === "steam") pConv = state.steamPressureBarAbs;
    else pConv = state.liquidPressureBarAbs;
    return convertToDisplayUnit(nativeValue, state.flowUnit, state.service, state.density, pConv, state.operatingTemp);
  }, [state.flowUnit, state.service, state.density, state.gasPressureBarAbs, state.steamPressureBarAbs, state.liquidPressureBarAbs, state.operatingTemp]);

  return { state, setService, setMeterCategory, setSelectedLiquid, setDensity, setViscosity, setOperatingTemp, setLiquidPressure, setSteamPressure, setSteamTempC, setSelectedGas, setGasPressure, setFlowRateMin, setFlowRateMax, setFlowUnit, setPipeSize, setUseMultiCondition, setNormFlowRateMin, setNormFlowRateMax, setMaxFlowRateMin, setMaxFlowRateMax, calculate, reset, logout, validResults, rejectedResults, toDisplayUnit };
}
