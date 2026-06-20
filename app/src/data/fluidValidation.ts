// Fluid Validation & Temperature Correction Engine
// Based on: ASTM D341, Vogel-Cameron equation, thermal expansion theory

import type { LiquidData } from "./liquids";

// ============================================
// TEMPERATURE-DEPENDENT VISCOSITY CALCULATION
// ============================================

// Vogel-Cameron equation: μ = A * exp(B / (T + C))
// Where T is in °C, μ is in cP
// Constants fitted for common fluid categories
interface ViscosityConstants {
  A: number;
  B: number;
  C: number;
}

// Vogel-Cameron constants fitted from reference data at 20°C
const VOGEL_CONSTANTS: Record<string, ViscosityConstants> = {
  Water:            { A: 0.02939, B: 521.89,  C: -137.37 },
  "Light Oil":      { A: 0.0102,  B: 1023.5,  C: -140.0 },
  "Medium Oil":     { A: 0.0085,  B: 1350.0,  C: -135.0 },
  "Heavy Oil":      { A: 0.0062,  B: 1850.0,  C: -125.0 },
  "Glycerine":      { A: 0.00018, B: 3800.0,  C: -100.0 },
  "Ethylene Glycol":{ A: 0.0158,  B: 1085.0,  C: -135.0 },
  "Sulfuric Acid":  { A: 0.0235,  B: 850.0,   C: -140.0 },
  "Caustic Soda":   { A: 0.0185,  B: 1100.0,  C: -135.0 },
  "Hydraulic Oil":  { A: 0.0092,  B: 1280.0,  C: -138.0 },
  "Diesel":         { A: 0.0125,  B: 980.0,   C: -142.0 },
  "Milk":           { A: 0.0220,  B: 680.0,   C: -130.0 },
  "Sugar Syrup":    { A: 0.0045,  B: 2200.0,  C: -110.0 },
  "Slurry (Low)":   { A: 0.0250,  B: 600.0,   C: -125.0 },
  "Slurry (Med)":   { A: 0.0180,  B: 950.0,   C: -115.0 },
  "Slurry (High)":  { A: 0.0080,  B: 1600.0,  C: -105.0 },
  "Acid (Dilute)":  { A: 0.0280,  B: 550.0,   C: -140.0 },
  "Acid (Conc.)":   { A: 0.0160,  B: 1050.0,  C: -130.0 },
  "Solvent":        { A: 0.0350,  B: 420.0,   C: -145.0 },
  "Alcohol":        { A: 0.0400,  B: 380.0,   C: -148.0 },
  "Ketchup":        { A: 0.0012,  B: 3200.0,  C: -95.0 },
  "Molasses":       { A: 0.0008,  B: 3500.0,  C: -90.0 },
};

// Map liquid category to Vogel constants
function getVogelConstants(liquid: LiquidData): ViscosityConstants | null {
  const name = liquid.name.toLowerCase();
  const cat = liquid.category;
  const visc = liquid.viscosity;

  // Exact name matches
  if (name.includes("water")) return VOGEL_CONSTANTS["Water"];
  if (name.includes("glycerin") || name.includes("glycerol")) return VOGEL_CONSTANTS["Glycerine"];
  if (name.includes("ethylene glycol")) return VOGEL_CONSTANTS["Ethylene Glycol"];
  if (name.includes("sulfuric acid")) return VOGEL_CONSTANTS["Sulfuric Acid"];
  if (name.includes("caustic soda") || name.includes("naoh")) return VOGEL_CONSTANTS["Caustic Soda"];
  if (name.includes("diesel")) return VOGEL_CONSTANTS["Diesel"];
  if (name.includes("milk")) return VOGEL_CONSTANTS["Milk"];
  if (name.includes("sugar syrup")) return VOGEL_CONSTANTS["Sugar Syrup"];
  if (name.includes("hydraulic oil")) return VOGEL_CONSTANTS["Hydraulic Oil"];
  if (name.includes("tomato ketchup")) return VOGEL_CONSTANTS["Ketchup"];
  if (name.includes("molasses")) return VOGEL_CONSTANTS["Molasses"];

  // Category + viscosity based matching
  if (cat === "Oil" || cat === "Fuel") {
    if (visc < 5) return VOGEL_CONSTANTS["Light Oil"];
    if (visc < 50) return VOGEL_CONSTANTS["Medium Oil"];
    return VOGEL_CONSTANTS["Heavy Oil"];
  }
  if (cat === "Slurry") {
    if (visc < 50) return VOGEL_CONSTANTS["Slurry (Low)"];
    if (visc < 200) return VOGEL_CONSTANTS["Slurry (Med)"];
    return VOGEL_CONSTANTS["Slurry (High)"];
  }
  if (cat === "Acid") {
    if (visc < 5) return VOGEL_CONSTANTS["Acid (Dilute)"];
    return VOGEL_CONSTANTS["Acid (Conc.)"];
  }
  if (cat === "Solvent" || cat === "Pharmaceutical") {
    if (name.includes("alcohol") || name.includes("ethanol") || name.includes("methanol"))
      return VOGEL_CONSTANTS["Alcohol"];
    return VOGEL_CONSTANTS["Solvent"];
  }

  // Default based on viscosity magnitude
  if (visc < 5) return VOGEL_CONSTANTS["Water"];
  if (visc < 100) return VOGEL_CONSTANTS["Medium Oil"];
  if (visc < 1000) return VOGEL_CONSTANTS["Heavy Oil"];
  return VOGEL_CONSTANTS["Glycerine"];
}

// Maximum exponent magnitude before Math.exp() underflows/overflows
const MAX_EXP_ARG = 700;  // ln(Number.MAX_VALUE) ≈ 709, use 700 for safety

// Fallback: simple Andrade (Arrhenius-type) model when Vogel-Cameron breaks down
// Andrade: μ = μ_ref * exp(Ea/R * (1/T - 1/T_ref))
// Simplified: μ = μ_ref * exp(k * (1/(T+273) - 1/(T_ref+273)))
function andradeViscosity(viscRef: number, tempC: number, tempRef: number = 20): number {
  const tK = tempC + 273.15;
  const tRefK = tempRef + 273.15;
  // Typical activation energy for viscous liquids ≈ 15-25 kJ/mol
  // Using a calibrated factor that gives ~90% viscosity drop per 100°C rise
  const k = 1800; // Calibrated constant
  const exponent = k * (1 / tK - 1 / tRefK);
  // Clamp exponent to prevent overflow/underflow
  const clampedExp = Math.max(-MAX_EXP_ARG, Math.min(MAX_EXP_ARG, exponent));
  return viscRef * Math.exp(clampedExp);
}

// Calculate viscosity at a given temperature (°C) using Vogel-Cameron
// Falls back to Andrade model when Vogel-Cameron constants are outside their valid range
export function calculateViscosityAtTemp(
  liquid: LiquidData,
  tempC: number
): { viscosity: number; method: string; confidence: "high" | "medium" | "low" } {
  // Clamp to valid range for liquid phase
  if (tempC < -40 || tempC > 350) {
    return { viscosity: liquid.viscosity, method: "reference (out of range)", confidence: "low" };
  }

  const consts = getVogelConstants(liquid);
  if (!consts) {
    return { viscosity: liquid.viscosity, method: "reference", confidence: "medium" };
  }

  const denominator = tempC + consts.C;

  // === SAFETY CHECK 1: Vogel-Cameron requires T + C > 0 ===
  // If denominator is <= 0, the model is outside its valid range
  // → Fall back to Andrade (Arrhenius-type) model
  if (denominator <= 0.5) {
    const mu = andradeViscosity(liquid.viscosity, tempC);
    return {
      viscosity: Math.max(0.01, parseFloat(mu.toFixed(3))),
      method: "Andrade (Arrhenius) — Vogel-Cameron outside valid range",
      confidence: "medium",
    };
  }

  const exponent = consts.B / denominator;

  // === SAFETY CHECK 2: Exponent magnitude check ===
  // If |exponent| is too large, Math.exp() will overflow/underflow
  if (Math.abs(exponent) > MAX_EXP_ARG) {
    const mu = andradeViscosity(liquid.viscosity, tempC);
    return {
      viscosity: Math.max(0.01, parseFloat(mu.toFixed(3))),
      method: "Andrade (Arrhenius) — exponent overflow safeguard",
      confidence: "medium",
    };
  }

  // Vogel-Cameron: μ = A * exp(B / (T + C))
  const mu = consts.A * Math.exp(exponent);

  // Sanity check: viscosity should be positive and within physical bounds
  // Viscosity always DECREASES with rising temperature (except water anomaly near 0°C)
  // If Vogel-Cameron gives a value higher than reference or absurdly high, it's broken
  const MAX_REASONABLE_MULTIPLIER = 5; // Vogel-Cameron should not exceed 5x reference
  if (!isFinite(mu) || mu <= 0 || mu > liquid.viscosity * MAX_REASONABLE_MULTIPLIER) {
    const muAndrade = andradeViscosity(liquid.viscosity, tempC);
    return {
      viscosity: Math.max(0.01, parseFloat(muAndrade.toFixed(3))),
      method: "Andrade (Arrhenius) — numerical safeguard",
      confidence: "medium",
    };
  }

  // Water special case: non-monotonic behavior near 0°C (anomaly)
  if (liquid.name.toLowerCase().includes("water") && tempC >= 0 && tempC <= 30) {
    // Water has minimum viscosity at ~30°C, increases below that
    const waterCorr = 1 + 0.15 * Math.exp(-Math.pow(tempC - 30, 2) / 200);
    return {
      viscosity: Math.max(0.01, parseFloat((mu * waterCorr).toFixed(3))),
      method: "Vogel-Cameron + water anomaly correction",
      confidence: "high",
    };
  }

  return {
    viscosity: Math.max(0.01, parseFloat(mu.toFixed(3))),
    method: "Vogel-Cameron",
    confidence: consts.A > 0.001 ? "high" : "medium",
  };
}

// ============================================
// TEMPERATURE-DEPENDENT DENSITY CALCULATION
// ============================================

// Volume thermal expansion coefficient β (1/°C) by category
const EXPANSION_COEFFS: Record<string, number> = {
  Water: 0.000207,
  Acid: 0.00055,
  Alkali: 0.00050,
  Solvent: 0.00110,
  Oil: 0.00072,
  Fuel: 0.00095,
  Chemical: 0.00060,
  "Food & Beverage": 0.00045,
  Pharmaceutical: 0.00070,
  Slurry: 0.00035,
  "Gas (Liquid state)": 0.00150,
  Cryogenic: 0.00200,
};

// Calculate density at a given temperature
// Uses volume expansion: ρ(T) = ρ_ref / (1 + β * (T - T_ref))
export function calculateDensityAtTemp(
  liquid: LiquidData,
  tempC: number
): { density: number; method: string; confidence: "high" | "medium" | "low" } {
  if (tempC < -50 || tempC > 200) {
    return { density: liquid.density, method: "reference (out of range)", confidence: "low" };
  }

  const beta = EXPANSION_COEFFS[liquid.category] ?? 0.0007;
  const tRef = 20; // Reference temperature for our database
  const rho = liquid.density / (1 + beta * (tempC - tRef));

  return {
    density: Math.round(rho),
    method: "thermal expansion model (β = " + beta.toFixed(4) + "/°C)",
    confidence: "high",
  };
}

// ============================================
// FLUID VALIDATION & MISMATCH DETECTION
// ============================================

export interface FluidValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  info: string[];
  suggestedDensity?: number;
  suggestedViscosity?: number;
  confidence: "high" | "medium" | "low";
}

// Known density ranges by category (kg/m³ at 20°C)
const DENSITY_RANGES: Record<string, [number, number]> = {
  Water: [900, 1100],
  Acid: [1000, 1850],
  Alkali: [1000, 1600],
  Solvent: [680, 1600],
  Oil: [800, 990],
  Fuel: [400, 1000],
  Chemical: [500, 1600],
  "Food & Beverage": [900, 1450],
  Pharmaceutical: [780, 1300],
  Slurry: [1000, 2000],
  "Gas (Liquid state)": [60, 1500],
  Cryogenic: [60, 1400],
};

// Known viscosity ranges by category (cP at 20°C)
const VISCOSITY_RANGES: Record<string, [number, number]> = {
  Water: [0.3, 100],
  Acid: [0.5, 2000],
  Alkali: [1, 100000],
  Solvent: [0.2, 1500],
  Oil: [1.5, 20000],
  Fuel: [0.3, 500],
  Chemical: [0.2, 1200],
  "Food & Beverage": [1, 120000],
  Pharmaceutical: [1, 1500],
  Slurry: [10, 100000],
  "Gas (Liquid state)": [0.05, 0.3],
  Cryogenic: [0.003, 0.3],
};

export function validateFluidProperties(
  liquid: LiquidData | null,
  userDensity: number,
  userViscosity: number,
  userTemp: number
): FluidValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const info: string[] = [];
  let confidence: "high" | "medium" | "low" = "high";

  if (!liquid) {
    return { isValid: true, warnings: [], errors: [], info: ["No fluid selected - manual entry mode"], confidence: "low" };
  }

  // === DENSITY VALIDATION ===
  const catRange = DENSITY_RANGES[liquid.category];
  if (catRange) {
    if (userDensity < catRange[0] * 0.7 || userDensity > catRange[1] * 1.3) {
      errors.push(
        `Density ${userDensity} kg/m³ is way outside typical range for ${liquid.category} (${catRange[0]}-${catRange[1]} kg/m³). Please verify.`
      );
      confidence = "low";
    } else if (userDensity < catRange[0] || userDensity > catRange[1]) {
      warnings.push(
        `Density ${userDensity} kg/m³ is outside typical range for ${liquid.category} (${catRange[0]}-${catRange[1]} kg/m³)`
      );
      confidence = "medium";
    }
  }

  // Check if density matches the selected liquid at reference temp
  const densityDiff = Math.abs(userDensity - liquid.density);
  if (densityDiff > liquid.density * 0.1) {
    warnings.push(
      `Entered density (${userDensity}) differs by ${densityDiff} kg/m³ from reference value for ${liquid.name} (${liquid.density} kg/m³ at 20°C)`
    );
  }

  // Temperature-corrected density check
  if (userTemp !== 20) {
    const tempCorrected = calculateDensityAtTemp(liquid, userTemp);
    const diffFromCorrected = Math.abs(userDensity - tempCorrected.density);
    if (diffFromCorrected > tempCorrected.density * 0.05) {
      warnings.push(
        `At ${userTemp}°C, expected density for ${liquid.name} is ~${tempCorrected.density} kg/m³ (thermal expansion). Your value: ${userDensity} kg/m³`
      );
    } else {
      info.push(`Density at ${userTemp}°C is consistent with ${liquid.name} (${tempCorrected.method})`);
    }
  }

  // === VISCOSITY VALIDATION ===
  const viscRange = VISCOSITY_RANGES[liquid.category];
  if (viscRange) {
    if (userViscosity < viscRange[0] * 0.3 || userViscosity > viscRange[1] * 3) {
      errors.push(
        `Viscosity ${userViscosity} cP is way outside typical range for ${liquid.category} (${viscRange[0]}-${viscRange[1]} cP)`
      );
      confidence = "low";
    } else if (userViscosity < viscRange[0] || userViscosity > viscRange[1]) {
      warnings.push(
        `Viscosity ${userViscosity} cP is outside typical range for ${liquid.category} (${viscRange[0]}-${viscRange[1]} cP)`
      );
      confidence = "medium";
    }
  }

  // Check if viscosity matches at temperature
  if (userTemp !== 20) {
    const viscCorrected = calculateViscosityAtTemp(liquid, userTemp);
    const diffFromCorrected = Math.abs(userViscosity - viscCorrected.viscosity);
    if (diffFromCorrected > viscCorrected.viscosity * 0.2 && viscCorrected.confidence === "high") {
      warnings.push(
        `At ${userTemp}°C, expected viscosity for ${liquid.name} is ~${viscCorrected.viscosity} cP (${viscCorrected.method}). Your value: ${userViscosity} cP`
      );
    }
  }

  // === SPECIAL FLUID WARNINGS ===
  if (liquid.nonNewtonian) {
    warnings.push(
      `${liquid.name} is a NON-NEWTONIAN fluid. Viscosity varies with shear rate. The entered value is only a reference. For accurate sizing, provide viscosity at actual operating shear rate or use a viscometer on-site.`
    );
    confidence = "low";
  }

  if (liquid.concentration) {
    warnings.push(
      `${liquid.name} properties are CONCENTRATION-DEPENDENT. The reference values are for a standard concentration. Please verify actual concentration and adjust density/viscosity accordingly.`
    );
    confidence = "medium";
  }

  // Conductivity check
  if (liquid.conductivity === false) {
    info.push(`${liquid.name} is non-conductive. Electromagnetic flowmeter will be rejected.`);
  } else if (liquid.conductivity === true) {
    info.push(`${liquid.name} is conductive. Electromagnetic flowmeter is suitable.`);
  }

  // Very high viscosity warning
  if (userViscosity > 1000) {
    warnings.push(`Very high viscosity (${userViscosity} cP). Only Oval Gear and Ultrasonic flowmeters may be suitable. Verify with factory for extreme viscosities.`);
  }

  // Very low viscosity warning
  if (userViscosity < 0.5) {
    warnings.push(`Very low viscosity (${userViscosity} cP). Turbulence and cavitation risk. Verify minimum Reynolds number requirements.`);
  }

  // Temperature vs reference mismatch
  if (userTemp < 0 && !liquid.name.toLowerCase().includes("chilled") && liquid.category !== "Cryogenic") {
    warnings.push(`Operating temperature ${userTemp}°C is below 0°C. Risk of freezing for many liquids. Verify freezing point.`);
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    info,
    suggestedDensity: userTemp !== 20 ? calculateDensityAtTemp(liquid, userTemp).density : undefined,
    suggestedViscosity: userTemp !== 20 ? calculateViscosityAtTemp(liquid, userTemp).viscosity : undefined,
    confidence,
  };
}

// ============================================
// REYNOLDS NUMBER CALCULATION
// ============================================

// Calculate Reynolds number for pipe flow
// Re = (ρ * v * D) / μ
// Where ρ = density (kg/m³), v = velocity (m/s), D = pipe diameter (m), μ = dynamic viscosity (Pa·s)
export function calculateReynoldsNumber(
  density: number,    // kg/m³
  viscosity: number,  // cP (dynamic)
  velocity: number,   // m/s
  pipeDiaMm: number   // mm
): number {
  const muPaS = viscosity * 0.001; // Convert cP to Pa·s
  const dM = pipeDiaMm / 1000;     // Convert mm to m
  const re = (density * velocity * dM) / muPaS;
  return Math.round(re);
}

// Flow regime classification
export function getFlowRegime(re: number): { regime: string; color: string } {
  if (re < 2300) return { regime: "Laminar (Re < 2300)", color: "green" };
  if (re < 4000) return { regime: "Transitional (2300 < Re < 4000)", color: "amber" };
  return { regime: "Turbulent (Re > 4000)", color: "blue" };
}
