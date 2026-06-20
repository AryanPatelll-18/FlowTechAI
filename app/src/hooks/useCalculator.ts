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
import { calculateWE } from "../data/waterEquivalentEngine";
import { runDirectSizing } from "../data/directSizingEngine";
import type { DirectSizingInput, DirectSizingResult } from "../data/directSizingEngine";

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
  /** Gas service only: WE, FCF, GCF values for display */
  weInfo?: { weNorm: number; fcf: number; gcf: number };
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
  // UNIFIED: Delegates to runDirectSizing() so Main and Project sizing use the same engine.
  // Any future calculation changes should be made ONLY in directSizingEngine.ts.
  const calculate = useCallback(() => {
    const { service, density, viscosity, operatingTemp, flowRateMin, flowRateMax, flowUnit } = state;

    let pConv = 0;
    if (service === "gas") pConv = state.gasPressureBarAbs;
    else if (service === "steam") pConv = state.steamPressureBarAbs;
    else pConv = state.liquidPressureBarAbs;

    // Convert both Qmin and Qmax flow rates (needed for state.unitConversion)
    const unitConvMin = convertFlowRate(flowRateMin, flowUnit, service, density, pConv, operatingTemp);
    const unitConvMax = convertFlowRate(flowRateMax, flowUnit, service, density, pConv, operatingTemp);
    setState((p) => ({ ...p, unitConversion: unitConvMax }));
    if (!unitConvMin.canConvert || !unitConvMax.canConvert) { setState((p) => ({ ...p, calculated: true, results: [] })); return; }

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

    // ─── Inline-specific validations (UI feedback only, not sizing logic) ───
    let validation: any = null;
    let gasWetness: any = null;
    if (state.meterCategory !== "rotameter") {
      validation = validateFluidProperties(state.selectedLiquid, density, viscosity, operatingTemp);
      if (service === "gas" && state.selectedGas) {
        const wetness = checkGasWetness(state.selectedGas.name, operatingTemp, state.gasPressureBarAbs);
        gasWetness = { isWet: wetness.isWet, gasName: state.selectedGas.name, satTempC: wetness.satTempC, marginC: wetness.marginC, message: wetness.message };
      }
    }
    setState((p) => ({ ...p, fluidValidation: validation }));

    // ═══════════════════════════════════════════════════════════════════
    // UNIFIED SIZING — delegates to runDirectSizing() for both inline
    // and rotameter. Any future calc changes go in directSizingEngine.ts.
    // ═══════════════════════════════════════════════════════════════════
    const sizingInput: DirectSizingInput = {
      service,
      meterCategory: state.meterCategory,
      flowRateMin,
      flowRateMax,
      flowUnit,
      density,
      viscosity,
      operatingTemp,
      liquidPressureBarAbs: state.liquidPressureBarAbs,
      selectedLiquidName: state.selectedLiquid?.name,
      selectedLiquidConductivity: state.selectedLiquid?.conductivity,
      specificGravity: state.specificGravity,
      gasPressureBarAbs: state.gasPressureBarAbs,
      selectedGasName: state.selectedGas?.name,
      selectedGasMolecularWeight: state.selectedGas?.molecularWeight,
      selectedGasSpecificGravity: state.selectedGas?.specificGravity,
      selectedGasCategory: state.selectedGas?.category,
      selectedGasNotes: state.selectedGas?.notes,
      steamPressureBarAbs: state.steamPressureBarAbs,
      steamTempC: state.steamTempC,
      steamDensity: state.steamDensity,
      steamState: state.steamState,
      useMultiCondition: state.useMultiCondition,
      normFlowRateMin: state.normFlowRateMin,
      normFlowRateMax: state.normFlowRateMax,
      maxFlowRateMin: state.maxFlowRateMin,
      maxFlowRateMax: state.maxFlowRateMax,
      floatMoc: undefined, // Main sizing uses default SS 316; user can override via specs
    };

    const sizingResult = runDirectSizing(sizingInput);

    // Map DirectSizingResult back to CalculatorState
    const results: CalculationResult[] = sizingResult.inlineResults;
    const rotameterResults: RotameterResult[] = sizingResult.rotameterResults;

    // Preserve gasWetness from earlier detection (runDirectSizing also computes it)
    if (sizingResult.gasWetness && !gasWetness) {
      gasWetness = sizingResult.gasWetness;
    }

    // Preserve fluidValidation from earlier (runDirectSizing returns its own)
    if (sizingResult.fluidValidation) {
      validation = sizingResult.fluidValidation;
    }

    setState((p) => ({ ...p, results, gasWetness, rotameterResults, fluidValidation: validation, calculated: true }));
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
