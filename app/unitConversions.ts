// Flow Rate Unit Conversion Engine
// Converts user-entered flow from any unit to the factory table's native unit

import type { ServiceType } from "../hooks/useCalculator";

export type FlowUnit = "m³/hr" | "lph" | "lpm" | "kg/hr" | "CFM";
export type GasFlowUnit = FlowUnit | "Nm³/hr";

export interface UnitConversionResult {
  convertedValue: number;       // Flow in native unit
  nativeUnit: string;           // Unit of factory table
  canConvert: boolean;          // Whether conversion was possible
  missingParams: string[];      // Which parameters are missing
  warnings: string[];           // Human-readable warnings
}

// Available units per service
export const LIQUID_UNITS: string[] = ["m³/hr", "lph", "lpm", "kg/hr", "CFM"];
export const GAS_UNITS: string[] = ["Nm³/hr", "m³/hr", "lph", "lpm", "kg/hr", "CFM"];
export const STEAM_UNITS: string[] = ["kg/hr", "m³/hr", "lph", "lpm", "CFM"];

// Get available units for a service
export function getUnitsForService(service: ServiceType): string[] {
  switch (service) {
    case "liquid":
      return [...LIQUID_UNITS];
    case "gas":
      return [...GAS_UNITS];
    case "steam":
      return [...STEAM_UNITS];
  }
}

// ============================================
// CONVERSION TO NATIVE UNITS
// ============================================

// LIQUIDS: native unit = m³/hr
function convertToM3hr(
  value: number,
  unit: FlowUnit,
  density: number
): UnitConversionResult {
  const missingParams: string[] = [];
  const warnings: string[] = [];
  let converted = value;

  switch (unit) {
    case "m³/hr":
      // No conversion needed
      converted = value;
      break;

    case "lph":
      // Liters per hour → m³/hr: divide by 1000
      converted = value / 1000;
      break;

    case "lpm":
      // Liters per minute → m³/hr: multiply by 60 / 1000 = 0.06
      converted = value * 0.06;
      break;

    case "kg/hr":
      // Mass flow → volumetric flow: divide by density
      if (!density || density <= 0) {
        missingParams.push("density");
        warnings.push(`kg/hr requires density to convert to m³/hr. Please enter a valid density (> 0 kg/m³).`);
        return { convertedValue: 0, nativeUnit: "m³/hr", canConvert: false, missingParams, warnings };
      }
      converted = value / density;
      break;

    case "CFM":
      // Cubic feet per minute → m³/hr: 1 CFM = 0.0283168 m³/min × 60 min/hr = 1.699 m³/hr
      converted = value * 1.699;
      warnings.push("CFM is unusual for liquids. Verify this is the intended unit.");
      break;

    default:
      warnings.push(`Unit "${unit}" is not supported for liquid service.`);
      return { convertedValue: 0, nativeUnit: "m³/hr", canConvert: false, missingParams: ["unit"], warnings };
  }

  return {
    convertedValue: parseFloat(converted.toFixed(4)),
    nativeUnit: "m³/hr",
    canConvert: missingParams.length === 0,
    missingParams,
    warnings,
  };
}

// GAS: native unit = Nm³/hr (Normal cubic meters per hour)
function convertToNm3hr(
  value: number,
  unit: string,
  density: number,
  pressureBarAbs: number,
  tempC: number
): UnitConversionResult {
  const missingParams: string[] = [];
  const warnings: string[] = [];
  let converted = value;

  switch (unit) {
    case "Nm³/hr":
      // No conversion needed
      converted = value;
      break;

    case "m³/hr":
      // Operating m³/hr → Nm³/hr: need P and T
      // Nm³/hr = m³/hr × (P_abs / 1.01325) × (273.15 / T_K)
      if (!pressureBarAbs || pressureBarAbs <= 0) {
        missingParams.push("pressure");
        warnings.push("m³/hr (operating) requires absolute pressure to convert to Nm³/hr.");
      }
      if (tempC === undefined || tempC === null) {
        missingParams.push("temperature");
        warnings.push("m³/hr (operating) requires temperature to convert to Nm³/hr.");
      }
      if (missingParams.length > 0) {
        return { convertedValue: 0, nativeUnit: "Nm³/hr", canConvert: false, missingParams, warnings };
      }
      {
        const tK = tempC + 273.15;
        converted = value * (pressureBarAbs / 1.01325) * (273.15 / tK);
      }
      break;

    case "lph":
      // Liters per hour → first to m³/hr, then to Nm³/hr (same at standard conditions)
      converted = value / 1000;
      // lph at standard conditions is effectively Nm³/hr × 1000
      // But lph is such a small unit for gas that it's impractical
      warnings.push("lph is an extremely small unit for gas service. Results may show all sizes as too-high.");
      break;

    case "lpm":
      // Liters per minute → m³/hr
      converted = value * 0.06;
      warnings.push("lpm is an extremely small unit for gas service. Results may show all sizes as too-high.");
      break;

    case "kg/hr":
      // Mass flow → volumetric flow at normal conditions
      // Nm³/hr = kg/hr / ρ_normal where ρ_normal = density at STP
      // Use the selected gas's STP density
      if (!density || density <= 0) {
        missingParams.push("density");
        warnings.push("kg/hr requires gas density to convert to Nm³/hr. Select a gas or enter density.");
        return { convertedValue: 0, nativeUnit: "Nm³/hr", canConvert: false, missingParams, warnings };
      }
      converted = value / density;
      break;

    case "CFM":
      // CFM (standard cubic feet per minute) → Nm³/hr
      // 1 SCFM ≈ 1.699 Nm³/hr (at standard conditions: 15°C, 1 atm)
      converted = value * 1.699;
      break;

    default:
      warnings.push(`Unit "${unit}" is not supported for gas service.`);
      return { convertedValue: 0, nativeUnit: "Nm³/hr", canConvert: false, missingParams: ["unit"], warnings };
  }

  return {
    convertedValue: parseFloat(converted.toFixed(4)),
    nativeUnit: "Nm³/hr",
    canConvert: missingParams.length === 0,
    missingParams,
    warnings,
  };
}

// STEAM: native unit = kg/hr
function convertToKghr(
  value: number,
  unit: FlowUnit,
  density: number
): UnitConversionResult {
  const missingParams: string[] = [];
  const warnings: string[] = [];
  let converted = value;

  switch (unit) {
    case "kg/hr":
      // No conversion needed
      converted = value;
      break;

    case "m³/hr":
      // Volumetric flow → mass flow: multiply by density
      if (!density || density <= 0) {
        missingParams.push("density");
        warnings.push("m³/hr requires steam density to convert to kg/hr. Enter pressure & temperature to auto-calculate density.");
        return { convertedValue: 0, nativeUnit: "kg/hr", canConvert: false, missingParams, warnings };
      }
      converted = value * density;
      break;

    case "lph":
      // lph → m³/hr → kg/hr
      if (!density || density <= 0) {
        missingParams.push("density");
        warnings.push("lph requires steam density to convert to kg/hr. Enter pressure & temperature to auto-calculate density.");
        return { convertedValue: 0, nativeUnit: "kg/hr", canConvert: false, missingParams, warnings };
      }
      converted = (value / 1000) * density;
      break;

    case "lpm":
      // lpm → m³/hr → kg/hr
      if (!density || density <= 0) {
        missingParams.push("density");
        warnings.push("lpm requires steam density to convert to kg/hr. Enter pressure & temperature to auto-calculate density.");
        return { convertedValue: 0, nativeUnit: "kg/hr", canConvert: false, missingParams, warnings };
      }
      converted = (value * 0.06) * density;
      break;

    case "CFM":
      // CFM → m³/hr → kg/hr
      if (!density || density <= 0) {
        missingParams.push("density");
        warnings.push("CFM requires steam density to convert to kg/hr. Enter pressure & temperature to auto-calculate density.");
        return { convertedValue: 0, nativeUnit: "kg/hr", canConvert: false, missingParams, warnings };
      }
      converted = (value * 1.699) * density;
      break;

    default:
      warnings.push(`Unit "${unit}" is not supported for steam service.`);
      return { convertedValue: 0, nativeUnit: "kg/hr", canConvert: false, missingParams: ["unit"], warnings };
  }

  return {
    convertedValue: parseFloat(converted.toFixed(4)),
    nativeUnit: "kg/hr",
    canConvert: missingParams.length === 0,
    missingParams,
    warnings,
  };
}

// ============================================
// MAIN CONVERSION FUNCTION
// ============================================

export function convertFlowRate(
  value: number,
  unit: string,
  service: ServiceType,
  density: number,          // kg/m³ (STP density for gas, operating density for steam)
  pressureBarAbs: number,   // Absolute pressure (for gas m³/hr → Nm³/hr)
  tempC: number             // Temperature in °C (for gas conversion)
): UnitConversionResult {
  switch (service) {
    case "liquid":
      return convertToM3hr(value, unit as FlowUnit, density);
    case "gas":
      return convertToNm3hr(value, unit as FlowUnit | "Nm³/hr", density, pressureBarAbs, tempC);
    case "steam":
      return convertToKghr(value, unit as FlowUnit, density);
  }
}

// ============================================
// REVERSE CONVERSION: Native unit → User's input unit (for display)
// ============================================

/** Convert a value FROM the native unit TO the user's display unit.
 *  This is the inverse of convertFlowRate — used for displaying sizing results
 *  in the same unit the user entered their flow rate in.
 */
export function convertToDisplayUnit(
  nativeValue: number,    // Value in native unit (m³/hr, Nm³/hr, or kg/hr)
  displayUnit: string,    // User's selected unit (e.g., "lph", "kg/hr")
  service: ServiceType,
  density: number,        // kg/m³
  pressureBarAbs: number, // For gas m³/hr conversion
  tempC: number
): number {
  switch (service) {
    case "liquid": {
      // Native = m³/hr
      switch (displayUnit) {
        case "m³/hr": return nativeValue;
        case "lph":   return nativeValue * 1000;
        case "lpm":   return nativeValue / 0.06;
        case "kg/hr": return nativeValue * density;
        case "CFM":   return nativeValue / 1.699;
        default:      return nativeValue;
      }
    }
    case "gas": {
      // Native = Nm³/hr
      switch (displayUnit) {
        case "Nm³/hr": return nativeValue;
        case "m³/hr":  {
          // Nm³/hr → m³/hr: inverse of operating conversion
          const tK = tempC + 273.15;
          return nativeValue / ((pressureBarAbs / 1.01325) * (273.15 / tK));
        }
        case "lph":    return nativeValue * 1000;
        case "lpm":    return nativeValue / 0.06;
        case "kg/hr":  return nativeValue * density;
        case "CFM":    return nativeValue / 1.699;
        default:       return nativeValue;
      }
    }
    case "steam": {
      // Native = kg/hr
      switch (displayUnit) {
        case "kg/hr": return nativeValue;
        case "m³/hr": return nativeValue / density;
        case "lph":   return (nativeValue / density) * 1000;
        case "lpm":   return (nativeValue / density) / 0.06;
        case "CFM":   return (nativeValue / density) / 1.699;
        default:      return nativeValue;
      }
    }
  }
}

// Check if a unit requires specific parameters for the given service
export function getUnitRequirements(
  unit: string,
  service: ServiceType
): { requiresDensity: boolean; requiresPressure: boolean; requiresTemperature: boolean; notes?: string } {
  switch (service) {
    case "liquid":
      switch (unit) {
        case "m³/hr": return { requiresDensity: false, requiresPressure: false, requiresTemperature: false };
        case "lph": return { requiresDensity: false, requiresPressure: false, requiresTemperature: false };
        case "lpm": return { requiresDensity: false, requiresPressure: false, requiresTemperature: false };
        case "kg/hr": return { requiresDensity: true, requiresPressure: false, requiresTemperature: false, notes: "Requires density > 0" };
        case "CFM": return { requiresDensity: false, requiresPressure: false, requiresTemperature: false, notes: "Unusual for liquids" };
        default: return { requiresDensity: false, requiresPressure: false, requiresTemperature: false };
      }
    case "gas":
      switch (unit) {
        case "Nm³/hr": return { requiresDensity: false, requiresPressure: false, requiresTemperature: false };
        case "m³/hr": return { requiresDensity: false, requiresPressure: true, requiresTemperature: true, notes: "Requires P, T to convert to Nm³/hr" };
        case "lph": return { requiresDensity: false, requiresPressure: false, requiresTemperature: false, notes: "Very small unit for gas" };
        case "lpm": return { requiresDensity: false, requiresPressure: false, requiresTemperature: false, notes: "Very small unit for gas" };
        case "kg/hr": return { requiresDensity: true, requiresPressure: false, requiresTemperature: false, notes: "Requires gas density (STP)" };
        case "CFM": return { requiresDensity: false, requiresPressure: false, requiresTemperature: false };
        default: return { requiresDensity: false, requiresPressure: false, requiresTemperature: false };
      }
    case "steam":
      switch (unit) {
        case "kg/hr": return { requiresDensity: false, requiresPressure: false, requiresTemperature: false };
        case "m³/hr": return { requiresDensity: true, requiresPressure: false, requiresTemperature: false, notes: "Requires steam density" };
        case "lph": return { requiresDensity: true, requiresPressure: false, requiresTemperature: false, notes: "Requires steam density" };
        case "lpm": return { requiresDensity: true, requiresPressure: false, requiresTemperature: false, notes: "Requires steam density" };
        case "CFM": return { requiresDensity: true, requiresPressure: false, requiresTemperature: false, notes: "Requires steam density" };
        default: return { requiresDensity: false, requiresPressure: false, requiresTemperature: false };
      }
  }
}
