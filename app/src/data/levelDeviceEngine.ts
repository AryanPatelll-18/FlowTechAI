// ============================================================
// Level Device Selection Engine (Phase III)
// Matches process conditions to Flowtech level device specs
// ============================================================

import {
  ALL_LEVEL_DEVICES,
  type LevelDeviceData,
  type LevelOutputType,
} from "./levelDeviceDatabase";

// ─── Input Parameters ────────────────────────────────────────────────────
export interface LevelSelectionInput {
  measuringRangeMm: number;     // Centre distance / tank height (mm)
  processPressureBar: number;   // Operating pressure (bar)
  processTempC: number;         // Operating temperature (°C)
  fluidDensityKgM3: number;     // Fluid density (kg/m³)
  fluidViscosityCp: number;     // Fluid viscosity (cP)
  // Fluid property flags
  isDirty: boolean;
  isViscous: boolean;
  isCorrosive: boolean;
  isFoamy: boolean;
  isTurbulent: boolean;
  isSlurry: boolean;
  isCryogenic: boolean;
  hasFerrousParticles: boolean;
  containsHydrocarbons: boolean;
  isColored: boolean;           // Colored or dark fluid
  // User preferences
  requiredOutput: LevelOutputType | "any";
  mountingPreference: "side" | "top" | "external" | "any";
  needsVisualIndication: boolean;
}

// ─── Selection Result ────────────────────────────────────────────────────
export interface LevelDeviceRecommendation {
  device: LevelDeviceData;
  status: "best" | "suitable" | "marginal" | "rejected";
  score: number;           // 0-100 match score
  reason: string;          // Why this device was selected/rejected
  rejectionReasons: string[]; // Specific reasons if rejected
  warnings: string[];      // Application warnings
  mocRecommendation: {
    bodyMoc: string;       // Primary recommended body MOC
    floatMoc: string;      // Primary recommended float MOC (or "N/A")
    gasketMoc: string;     // Primary recommended gasket
  };
}

// ─── Main Selection Function ─────────────────────────────────────────────
export function selectLevelDevices(
  input: LevelSelectionInput
): LevelDeviceRecommendation[] {
  const results: LevelDeviceRecommendation[] = [];

  for (const device of ALL_LEVEL_DEVICES) {
    const rec = evaluateDevice(device, input);
    results.push(rec);
  }

  // Sort: best first, then suitable, then marginal, then rejected
  const statusOrder = { best: 0, suitable: 1, marginal: 2, rejected: 3 };
  return results.sort(
    (a, b) =>
      statusOrder[a.status] - statusOrder[b.status] || b.score - a.score
  );
}

// ─── Evaluate Single Device ──────────────────────────────────────────────
function evaluateDevice(
  device: LevelDeviceData,
  input: LevelSelectionInput
): LevelDeviceRecommendation {
  const rejectionReasons: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // ─── HARD LIMIT CHECKS ───────────────────────────────────────────

  // 0. Centre-to-Centre (C-C) distance — HARD REJECT below minimum
  // This is the physical distance between process connections. Below this,
  // the product cannot be manufactured or will not function.
  if (input.measuringRangeMm < device.minCCDistance) {
    rejectionReasons.push(
      `C-C distance ${input.measuringRangeMm}mm is below minimum ${device.minCCDistance}mm for ${device.shortName}`
    );
    score -= 75; // Hard reject — C-C below minimum is a manufacturing impossibility
  }

  // 1. Measuring range
  if (input.measuringRangeMm < device.minMeasuringRange) {
    rejectionReasons.push(
      `Measuring range ${input.measuringRangeMm}mm is below minimum ${device.minMeasuringRange}mm`
    );
    score -= 30;
  }
  if (input.measuringRangeMm > device.maxMeasuringRange) {
    rejectionReasons.push(
      `Measuring range ${input.measuringRangeMm}mm exceeds maximum ${device.maxMeasuringRange}mm`
    );
    score -= 30;
  }

  // 2. Process pressure
  if (input.processPressureBar > device.maxPressure) {
    rejectionReasons.push(
      `Process pressure ${input.processPressureBar} bar exceeds maximum ${device.maxPressure} bar`
    );
    score -= 30;
  }
  // Float & Board is for NON-PRESSURIZED tanks
  if (device.type === "float_board_gauge" && input.processPressureBar > 1) {
    rejectionReasons.push(
      `Float & Board Level Gauge is for NON-PRESSURIZED tanks only (process is ${input.processPressureBar} bar)`
    );
    score -= 40;
  }

  // 3. Process temperature
  if (input.processTempC < device.minTemperature) {
    rejectionReasons.push(
      `Temperature ${input.processTempC}°C is below minimum ${device.minTemperature}°C`
    );
    score -= 30;
  }
  if (input.processTempC > device.maxTemperature) {
    rejectionReasons.push(
      `Temperature ${input.processTempC}°C exceeds maximum ${device.maxTemperature}°C`
    );
    score -= 30;
  }

  // 4. Fluid density (for float-based devices)
  if (input.fluidDensityKgM3 < device.minDensity) {
    rejectionReasons.push(
      `Fluid density ${input.fluidDensityKgM3} kg/m³ is below minimum ${device.minDensity} kg/m³`
    );
    score -= 25;
  }

  // 5. Viscosity check
  if (
    device.maxViscosity &&
    input.fluidViscosityCp > device.maxViscosity
  ) {
    rejectionReasons.push(
      `Viscosity ${input.fluidViscosityCp} cP exceeds maximum ${device.maxViscosity} cP`
    );
    score -= 20;
  }

  // 6. Ferrous particles — affect MAGNETIC devices (Side, Top mounted)
  if (input.hasFerrousParticles &&
    (device.type === "side_mounted_magnetic" || device.type === "top_mounted_magnetic")) {
    rejectionReasons.push(
      `Ferrous particles interfere with magnetic coupling`
    );
    warnings.push(
      "CRITICAL: Ferrous particles cause false readings in magnetic level gauges — consider Radar (non-contact) instead"
    );
    score -= 25;
  }

  // 7. Corrosive with CS body (Reflex/Transparent) — need SS
  if (input.isCorrosive &&
    (device.type === "reflex_gauge" || device.type === "transparent_gauge") &&
    input.processPressureBar > 16) {
    warnings.push(
      "For corrosive + high pressure: use SS 316 body construction"
    );
  }

  // 8. Colored liquid — Reflex gauge can't read colored fluids well
  if (input.isColored && device.type === "reflex_gauge") {
    rejectionReasons.push(
      "Reflex gauge cannot read colored/dark liquids — prismatic effect hidden"
    );
    warnings.push("Use Transparent Level Gauge for colored/dark liquids");
    score -= 35;
  }

  // 9. Tubular Level Indicator — HARD 5 bar limit (independent of maxPressure check)
  if (device.type === "tubular_indicator" && input.processPressureBar > 5) {
    rejectionReasons.push(
      `Tubular Level Indicator hard limit: 5 bar exceeded (process is ${input.processPressureBar} bar)`
    );
    score -= 40;
  }

  // 10. Low density float MOC — density < 800 kg/m³ requires Titanium or PP float
  const isFloatDevice = device.type === "side_mounted_magnetic" ||
                        device.type === "top_mounted_magnetic" ||
                        device.type === "float_board_gauge";
  if (isFloatDevice && input.fluidDensityKgM3 < 800) {
    warnings.push(
      `Fluid density ${input.fluidDensityKgM3} kg/m³ < 800 kg/m³ — Float MOC must be Titanium or PP (standard SS float too heavy)`
    );
  }

  // 11. Slurry with glass devices (Reflex/Transparent/Tubular)
  if (input.isSlurry &&
    (device.type === "reflex_gauge" || device.type === "transparent_gauge" || device.type === "tubular_indicator")) {
    rejectionReasons.push(
      "Slurry will scratch glass windows or coat the tubular glass — use magnetic devices instead"
    );
    score -= 30;
  }

  // 10. Turbulent/agitated with Float & Board
  if (input.isTurbulent && device.type === "float_board_gauge") {
    warnings.push("Turbulent/agitated tanks require guide wires for Float & Board");
    score -= 10;
  }

  // 11. Closed/pressurized with Float & Board
  if (device.type === "float_board_gauge" && input.processPressureBar > 0.5) {
    rejectionReasons.push(
      "Float & Board is for OPEN/ATMOSPHERIC tanks only"
    );
    score -= 35;
  }

  // ─── OUTPUT TYPE MATCH ───────────────────────────────────────────
  if (input.requiredOutput !== "any") {
    const hasTransmitter = device.output === "transmitter_4_20mA" ||
                           device.output === "visual_and_transmitter";
    const hasSwitch = device.output === "switch" ||
                      device.output === "visual_and_switch";
    const hasVisual = device.output === "visual" ||
                      device.output === "visual_and_switch" ||
                      device.output === "visual_and_transmitter";

    if (input.requiredOutput === "transmitter_4_20mA" && !hasTransmitter) {
      score -= 20;
    }
    if (input.requiredOutput === "switch" && !hasSwitch) {
      score -= 20;
    }
    // Visual only preference penalizes transmitters
    if (input.requiredOutput === "visual" && !hasVisual) {
      score -= 15;
    }
  }

  // ─── MOUNTING PREFERENCE ─────────────────────────────────────────
  if (
    input.mountingPreference !== "any" &&
    device.mountingType !== input.mountingPreference
  ) {
    // "external" matches "side" for non-contact devices
    const compatible =
      (input.mountingPreference === "external" && device.category === "level_transmitter") ||
      (input.mountingPreference === "side" && device.mountingType === "side") ||
      (input.mountingPreference === "top" && device.mountingType === "top");
    if (!compatible) {
      score -= 15;
    }
  }

  // ─── APPLICATION SUITABILITY ─────────────────────────────────────
  const s = device.suitableFor;

  if (input.isDirty && !s.dirtyLiquids) {
    warnings.push("Dirty fluid — may affect reliability");
    score -= 10;
  }
  if (input.isViscous && !s.viscousLiquids) {
    warnings.push("Viscous fluid — may cause float drag or coating");
    score -= 10;
  }
  if (input.isCorrosive && !s.corrosiveLiquids) {
    rejectionReasons.push("Device is NOT suitable for corrosive fluids");
    score -= 20;
  }
  if (input.isFoamy && !s.foamyLiquids) {
    warnings.push("Foamy liquid — may cause false reading");
    score -= 10;
  }
  if (input.isTurbulent && !s.turbulentLiquids) {
    warnings.push("Turbulent surface — float may oscillate");
    score -= 5;
  }
  if (input.isSlurry && !s.slurries) {
    rejectionReasons.push("Device is NOT suitable for slurry service");
    score -= 15;
  }
  if (input.isCryogenic && !s.cryogenic) {
    rejectionReasons.push("Device is NOT rated for cryogenic service");
    score -= 20;
  }

  // ─── VISUAL INDICATION REQUIREMENT ───────────────────────────────
  if (input.needsVisualIndication && device.category === "level_transmitter") {
    score -= 5; // Transmitters don't have visual indication
  }

  // ─── BONUS SCORES ────────────────────────────────────────────────
  // Bonus for devices that perfectly match
  if (score >= 90) {
    // Best match bonuses
    if (device.type === "side_mounted_magnetic" && input.mountingPreference === "side") {
      score += 3;
    }
    if (device.type === "top_mounted_magnetic" && input.mountingPreference === "top") {
      score += 3;
    }
    if (device.type === "radar_transmitter" && input.isFoamy) {
      score += 5; // Radar is best for foam
    }
    if (device.type === "reflex_gauge" && !input.isColored && input.processPressureBar > 10) {
      score += 3; // Reflex is excellent for high pressure clear liquids
    }
    if (device.type === "transparent_gauge" && input.isColored && input.processPressureBar > 10) {
      score += 3; // Transparent is excellent for high pressure colored liquids
    }
  }

  // ─── DETERMINE STATUS ────────────────────────────────────────────
  let status: LevelDeviceRecommendation["status"];
  let reason: string;

  if (score >= 85) {
    status = "best";
    reason = `Excellent match — all process conditions within rated limits`;
  } else if (score >= 60) {
    status = "suitable";
    reason = `Suitable with minor considerations — ${warnings.length} warning${warnings.length > 1 ? "s" : ""}`;
  } else if (score >= 30) {
    status = "marginal";
    reason = `Marginal match — ${rejectionReasons.length} concern${rejectionReasons.length > 1 ? "s" : ""}`;
  } else {
    status = "rejected";
    reason = `NOT recommended — ${rejectionReasons[0] || "Process conditions exceed device limits"}`;
  }

  // ─── MOC RECOMMENDATION ──────────────────────────────────────────
  const mocRec = recommendMoc(device, input);

  return {
    device,
    status,
    score: Math.max(0, Math.min(100, score)),
    reason,
    rejectionReasons,
    warnings,
    mocRecommendation: mocRec,
  };
}

// ─── MOC Recommendation Logic ────────────────────────────────────────────
function recommendMoc(
  device: LevelDeviceData,
  input: LevelSelectionInput
): LevelDeviceRecommendation["mocRecommendation"] {
  // Body MOC selection
  let bodyMoc = device.bodyMoc[0]; // Default: first option

  if (input.isCorrosive) {
    // For corrosive service, pick the most corrosion-resistant MOC
    if (device.bodyMoc.includes("SS 316 with PTFE lining")) {
      bodyMoc = "SS 316 with PTFE lining";
    } else if (device.bodyMoc.includes("SS 316")) {
      bodyMoc = "SS 316";
    } else if (device.bodyMoc.includes("PVDF")) {
      bodyMoc = "PVDF";
    } else if (device.bodyMoc.includes("PP")) {
      bodyMoc = "PP";
    }
  }

  if (input.processTempC > 150) {
    // High temp: SS 316 preferred, avoid PP/PVC
    if (device.bodyMoc.includes("SS 316")) bodyMoc = "SS 316";
    else if (device.bodyMoc.includes("SS 304")) bodyMoc = "SS 304";
  }

  // Float MOC selection (for float-based devices)
  let floatMoc = device.floatMoc ? device.floatMoc[0] : "N/A";
  if (device.floatMoc) {
    // LOW DENSITY RULE: density < 800 kg/m³ → float MUST be Titanium or PP
    if (input.fluidDensityKgM3 < 800) {
      if (device.floatMoc.includes("Titanium")) {
        floatMoc = "Titanium";
      } else if (device.floatMoc.includes("PP")) {
        floatMoc = "PP";
      } else if (device.floatMoc.includes("PTFE")) {
        floatMoc = "PTFE";
      }
      // If none available, keep default but warn
    } else if (input.isCorrosive) {
      if (device.floatMoc.includes("PTFE")) floatMoc = "PTFE";
      else if (device.floatMoc.includes("Titanium")) floatMoc = "Titanium";
      else if (device.floatMoc.includes("SS 316L")) floatMoc = "SS 316L";
      else if (device.floatMoc.includes("SS 316")) floatMoc = "SS 316";
    }
    if (input.containsHydrocarbons && input.fluidDensityKgM3 >= 800) {
      if (device.floatMoc.includes("SS 316")) floatMoc = "SS 316";
    }
  }

  // Gasket selection
  let gasketMoc = device.gasketMoc[0];
  if (device.type === "reflex_gauge" || device.type === "transparent_gauge") {
    if (input.processTempC > 200) {
      gasketMoc = "Graphoil";
    } else if (input.isCorrosive) {
      gasketMoc = "PTFE";
    } else {
      gasketMoc = "CAF";
    }
  } else if (input.processTempC > 150) {
    gasketMoc = "Graphoil";
  } else if (input.isCorrosive) {
    gasketMoc = "PTFE";
  }

  return { bodyMoc, floatMoc, gasketMoc };
}

// ─── Quick Validation Helper ─────────────────────────────────────────────
export interface LevelValidationResult {
  isValid: boolean;
  message: string;
  warnings: string[];
}

export function validateLevelInputs(
  input: Partial<LevelSelectionInput>
): LevelValidationResult {
  const warnings: string[] = [];

  if (!input.measuringRangeMm || input.measuringRangeMm <= 0) {
    return {
      isValid: false,
      message: "Measuring range (centre distance) must be greater than 0 mm",
      warnings: [],
    };
  }
  if (input.measuringRangeMm < 250) {
    warnings.push("C-C distance below 250mm — only Tubular Level Indicator (min 100mm) can be offered");
  }
  if (input.measuringRangeMm >= 250 && input.measuringRangeMm < 500) {
    warnings.push("C-C distance 250–499mm — Float & Board (min 1000mm) and Level Transmitters (min 500mm) cannot be offered");
  }
  if (input.measuringRangeMm >= 500 && input.measuringRangeMm < 1000) {
    warnings.push("C-C distance 500–999mm — Float & Board Level Gauge (min 1000mm) cannot be offered");
  }
  if (input.measuringRangeMm > 15000) {
    warnings.push(
      "Ranges above 15000mm require special design — consult factory"
    );
  }

  if (
    input.processTempC !== undefined &&
    (input.processTempC < -200 || input.processTempC > 500)
  ) {
    return {
      isValid: false,
      message: "Temperature must be between -200°C and 500°C",
      warnings: [],
    };
  }

  if (
    input.processPressureBar !== undefined &&
    input.processPressureBar < -1
  ) {
    return {
      isValid: false,
      message: "Pressure cannot be below -1 bar (full vacuum)",
      warnings: [],
    };
  }
  if (
    input.processPressureBar !== undefined &&
    input.processPressureBar > 100
  ) {
    warnings.push(
      "Pressure above 100 bar may require special design"
    );
  }

  if (
    input.fluidDensityKgM3 !== undefined &&
    input.fluidDensityKgM3 < 100
  ) {
    return {
      isValid: false,
      message:
        "Fluid density below 100 kg/m³ is too low",
      warnings: [],
    };
  }

  return {
    isValid: true,
    message: "Inputs valid",
    warnings,
  };
}
