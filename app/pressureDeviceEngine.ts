// ============================================================
// Pressure Device Selection Engine (Phase IV)
// Matches process conditions to Flowtech pressure device specs
// ============================================================

import {
  ALL_PRESSURE_DEVICES,
  type PressureDeviceData,
  type PressureMeasurementType,
} from "./pressureDeviceDatabase";

// ─── Input Parameters ────────────────────────────────────────────────────
export interface PressureSelectionInput {
  processPressureBar: number;       // Operating pressure (bar)
  processPressureType: PressureMeasurementType;  // gauge / absolute / differential
  processTempC: number;             // Process media temperature (°C)
  ambientTempC: number;             // Ambient temperature (°C)
  fluidType: "liquid" | "gas" | "steam";
  // Fluid property flags
  isCorrosive: boolean;
  isViscous: boolean;
  isCrystallizing: boolean;
  isPulsating: boolean;
  isHazardousArea: boolean;
  // Application
  application: "pressure" | "flow_dp" | "level_dp" | "filter_monitoring" | "general";
  // Preferences
  requiredAccuracy: "standard" | "high" | "very_high";  // ±0.25% / ±0.1% / ±0.075%
  outputPreference: "4_20mA" | "hart" | "fieldbus" | "any";
  needsDisplay: boolean;
}

// ─── Selection Result ────────────────────────────────────────────────────
export interface PressureDeviceRecommendation {
  device: PressureDeviceData;
  status: "best" | "suitable" | "marginal" | "rejected";
  score: number;
  reason: string;
  rejectionReasons: string[];
  warnings: string[];
  mocRecommendation: {
    bodyMoc: string;
    diaphragmMoc: string;
    fillFluid: string;
  };
}

// ─── Main Selection Function ─────────────────────────────────────────────
export function selectPressureDevices(
  input: PressureSelectionInput
): PressureDeviceRecommendation[] {
  const results: PressureDeviceRecommendation[] = [];

  for (const device of ALL_PRESSURE_DEVICES) {
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
  device: PressureDeviceData,
  input: PressureSelectionInput
): PressureDeviceRecommendation {
  const rejectionReasons: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Convert pressure to mbar for comparison
  const pressureMbar = input.processPressureBar * 1000;

  // ─── HARD LIMIT CHECKS ───────────────────────────────────────────

  // 1. Pressure range
  if (pressureMbar > device.maxPressureRange) {
    rejectionReasons.push(
      `Process pressure ${input.processPressureBar} bar (${pressureMbar} mbar) exceeds maximum range ${device.maxPressureRange / 1000} bar`
    );
    score -= 30;
  }
  if (pressureMbar < device.minPressureRange) {
    rejectionReasons.push(
      `Process pressure ${input.processPressureBar} bar is below minimum range ${device.minPressureRange / 1000} bar`
    );
    score -= 20;
  }

  // 2. Process media temperature
  if (input.processTempC > device.maxMediaTemp) {
    rejectionReasons.push(
      `Process temperature ${input.processTempC}°C exceeds maximum media temp ${device.maxMediaTemp}°C`
    );
    score -= 25;
  }
  if (input.processTempC < device.minMediaTemp) {
    rejectionReasons.push(
      `Process temperature ${input.processTempC}°C is below minimum media temp ${device.minMediaTemp}°C`
    );
    score -= 25;
  }

  // 3. Ambient temperature
  if (input.ambientTempC > device.maxTemperature) {
    rejectionReasons.push(
      `Ambient temperature ${input.ambientTempC}°C exceeds maximum ${device.maxTemperature}°C`
    );
    score -= 20;
  }
  if (input.ambientTempC < device.minTemperature) {
    rejectionReasons.push(
      `Ambient temperature ${input.ambientTempC}°C is below minimum ${device.minTemperature}°C`
    );
    score -= 20;
  }

  // 4. Steam service check
  if (input.fluidType === "steam" && !device.suitableFor.steam) {
    rejectionReasons.push(
      "Device is NOT suitable for steam service"
    );
    score -= 35;
  }

  // 5. Corrosive media — only Smart and DP have exotic MOC options
  if (input.isCorrosive && !device.suitableFor.corrosiveMedia) {
    rejectionReasons.push(
      "Device does not offer corrosion-resistant wetted parts (only SS 316L)"
    );
    score -= 25;
  }

  // 6. Viscous/crystallizing media — need remote seal (Smart/DP only)
  if ((input.isViscous || input.isCrystallizing) && !device.suitableFor.viscousMedia) {
    rejectionReasons.push(
      "Device cannot handle viscous or crystallizing media (no remote seal option)"
    );
    score -= 25;
  }

  // 7. Measurement type match
  if (!device.measurementType.includes(input.processPressureType)) {
    rejectionReasons.push(
      `Device does not support ${input.processPressureType} pressure measurement`
    );
    score -= 30;
  }

  // 8. Application-specific checks
  if (input.application === "flow_dp" || input.application === "level_dp") {
    if (device.type !== "differential_pressure_transmitter") {
      score -= 15;
      warnings.push("For flow/level via differential pressure: Differential Pressure Transmitter is optimal");
    }
  }

  // 9. Hazardous area
  if (input.isHazardousArea && !device.suitableFor.hazardousArea) {
    rejectionReasons.push("Device is not certified for hazardous areas");
    score -= 20;
  }

  // ─── ACCURACY MATCH ──────────────────────────────────────────────
  if (input.requiredAccuracy === "very_high" && device.type === "miniature_pressure_transmitter") {
    score -= 15; // Miniature max is ±0.1%, not ±0.075%
  }
  if (input.requiredAccuracy === "high" && device.type === "miniature_pressure_transmitter") {
    // Miniature standard is ±0.25%, high option ±0.1%
    if (!device.accuracy.includes("0.1%")) {
      score -= 10;
    }
  }

  // ─── OUTPUT PREFERENCE ───────────────────────────────────────────
  if (input.outputPreference === "hart" && !device.outputSignal.some(o => o.includes("HART"))) {
    score -= 10;
  }
  if (input.outputPreference === "fieldbus" && !device.outputSignal.some(o => o.includes("Fieldbus") || o.includes("Profibus"))) {
    score -= 15;
  }

  // ─── DISPLAY REQUIREMENT ─────────────────────────────────────────
  if (input.needsDisplay && device.display === "N/A") {
    score -= 5;
  }

  // ─── PULSATING PRESSURE ──────────────────────────────────────────
  if (input.isPulsating && !device.suitableFor.pulsatingPressure) {
    warnings.push("Pulsating pressure — add snubber or damping");
    score -= 10;
  }

  // ─── BONUS SCORES ────────────────────────────────────────────────
  if (score >= 85) {
    // Best match bonuses
    if (device.type === "smart_pressure_transmitter" && input.requiredAccuracy === "very_high") {
      score += 3; // Smart has best accuracy
    }
    if (device.type === "differential_pressure_transmitter" &&
        (input.application === "flow_dp" || input.application === "level_dp")) {
      score += 5; // DP is optimal for flow/level DP apps
    }
    if (device.type === "miniature_pressure_transmitter" && input.ambientTempC <= 50) {
      score += 2; // Miniature is great for moderate ambient
    }
  }

  // ─── DETERMINE STATUS ────────────────────────────────────────────
  let status: PressureDeviceRecommendation["status"];
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
  device: PressureDeviceData,
  input: PressureSelectionInput
): PressureDeviceRecommendation["mocRecommendation"] {
  // Diaphragm MOC selection
  let diaphragmMoc = device.diaphragmMoc[0];
  if (input.isCorrosive) {
    if (device.diaphragmMoc.includes("Tantalum")) {
      diaphragmMoc = "Tantalum";
    } else if (device.diaphragmMoc.includes("Hastelloy C")) {
      diaphragmMoc = "Hastelloy C";
    } else if (device.diaphragmMoc.includes("Monel")) {
      diaphragmMoc = "Monel";
    }
  }

  // Body MOC selection
  let bodyMoc = device.wettedPartsMoc[0];
  if (input.isCorrosive && device.wettedPartsMoc.includes("Hastelloy C")) {
    bodyMoc = "Hastelloy C";
  } else if (input.isCorrosive && device.wettedPartsMoc.includes("SS 316L")) {
    bodyMoc = "SS 316L";
  }

  // Fill fluid selection
  let fillFluid = device.fillFluid[0];
  if (input.fluidType === "gas" && device.fillFluid.includes("Fluorinated oil (oxygen safe)")) {
    // Check if oxygen present
    fillFluid = "Fluorinated oil (oxygen safe)";
  }
  if (input.processTempC > 100 && device.fillFluid.includes("Fluorinated oil (oxygen safe)")) {
    fillFluid = "Fluorinated oil (oxygen safe)"; // Higher temp rating
  }

  return { bodyMoc, diaphragmMoc, fillFluid };
}

// ─── Quick Validation Helper ─────────────────────────────────────────────
export interface PressureValidationResult {
  isValid: boolean;
  message: string;
  warnings: string[];
}

export function validatePressureInputs(
  input: Partial<PressureSelectionInput>
): PressureValidationResult {
  const warnings: string[] = [];

  if (input.processPressureBar === undefined || input.processPressureBar === null) {
    return {
      isValid: false,
      message: "Process pressure is required",
      warnings: [],
    };
  }

  if (input.processTempC !== undefined && (input.processTempC < -200 || input.processTempC > 500)) {
    return {
      isValid: false,
      message: "Process temperature must be between -200°C and 500°C",
      warnings: [],
    };
  }

  if (input.ambientTempC !== undefined && (input.ambientTempC < -50 || input.ambientTempC > 100)) {
    return {
      isValid: false,
      message: "Ambient temperature must be between -50°C and 100°C",
      warnings: [],
    };
  }

  if (input.processPressureBar !== undefined && input.processPressureBar < 0) {
    warnings.push("Negative pressure (vacuum) — ensure device supports vacuum");
  }

  if (input.processPressureBar !== undefined && input.processPressureBar > 1000) {
    warnings.push("Pressure above 1000 bar requires special design");
  }

  return {
    isValid: true,
    message: "Inputs valid",
    warnings,
  };
}
