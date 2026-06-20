/**
 * Product Validation Engine — Automated product family verification
 * Compares extracted product family against model code, application, and
 * Flowtech's product database to detect mismatches and suggest corrections.
 */

import { MODEL_CODE_TO_FAMILY, MODEL_CODE_TO_LABEL } from "./canonicalProductMatcher";
import { ALL_MODELS } from "./allModelData";

export interface ProductValidationResult {
  status: "correct" | "warning" | "wrong" | "insufficient_data";
  reason: string;
  extractedFamily: string;
  detectedFromModelCode: string | null;
  detectedFromModelCodeLabel: string | null;
  applicationMatch: "suitable" | "unsuitable" | "unknown";
  suggestions: string[];
  checks: { name: string; pass: boolean; detail: string }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MODEL CODE → PRODUCT FAMILY VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

function extractModelCodePrefix(modelNumber: string): string | null {
  const match = modelNumber.match(/\bFMIPL-([A-Z]{2,6})-/i);
  return match ? match[1].toUpperCase() : null;
}

function getFamilyFromModelCode(modelNumber: string): { key: string; label: string } | null {
  const prefix = extractModelCodePrefix(modelNumber);
  if (!prefix) return null;
  const familyKey = MODEL_CODE_TO_FAMILY[prefix];
  const label = MODEL_CODE_TO_LABEL[prefix];
  if (!familyKey || !label) return null;
  return { key: familyKey, label };
}

// ═══════════════════════════════════════════════════════════════════════════
// APPLICATION → PRODUCT FAMILY SUITABILITY
// ═══════════════════════════════════════════════════════════════════════════

const APPLICATION_TO_PRODUCT: Record<string, string[]> = {
  "water": ["emf", "vortex", "turbine", "rotameter", "bypass_rotameter", "magnetic_level", "hydrostatic_level", "displacer_level_switch"],
  "hot water": ["vortex", "rotameter", "metal_tube_rotameter", "magnetic_level", "hydrostatic_level", "displacer_level_switch"],
  "steam": ["vortex", "metal_tube_rotameter"],
  "saturated steam": ["vortex", "metal_tube_rotameter"],
  "superheated steam": ["vortex", "metal_tube_rotameter"],
  "chemical": ["emf", "metal_tube_rotameter", "oval_gear", "magnetic_level", "reflex_level", "transparent_level"],
  "corrosive": ["emf", "metal_tube_rotameter", "reflex_level", "transparent_level"],
  "acid": ["emf", "reflex_level", "transparent_level"],
  "oil": ["turbine", "oval_gear", "metal_tube_rotameter"],
  "fuel": ["turbine", "oval_gear"],
  "gas": ["vortex", "rotameter", "metal_tube_rotameter"],
  "natural gas": ["vortex", "rotameter", "metal_tube_rotameter"],
  "compressed air": ["vortex", "rotameter"],
  "air": ["vortex", "rotameter"],
  "slurry": ["emf"],
  "sewage": ["emf"],
  "effluent": ["emf", "bypass_rotameter"],
  "cooling water": ["bypass_rotameter", "emf"],
  "pulp": ["emf"],
  "food": ["emf", "oval_gear"],
  "pharma": ["emf", "oval_gear"],
  "dairy": ["emf", "oval_gear"],
  "level": ["magnetic_level", "radar_level", "hydrostatic_level", "displacer_level_switch", "reflex_level", "transparent_level", "tubular_level", "float_board_level"],
  "tank level": ["magnetic_level", "radar_level", "hydrostatic_level", "displacer_level_switch"],
  "interface": ["displacer_level_switch", "magnetic_level"],
  "condensate": ["vortex"],
  "boiler feed water": ["emf", "vortex"],
  "lpg": ["vortex", "rotameter"],
  "solvent": ["emf", "oval_gear"],
  "resin": ["oval_gear"],
  "adhesive": ["oval_gear"],
};

function getProductFamilyKey(extractedFamily: string): string | null {
  const ef = extractedFamily.toLowerCase();
  if (ef.includes("electromagnetic")) return "emf";
  if (ef.includes("vortex")) return "vortex";
  if (ef.includes("turbine")) return "turbine";
  if (ef.includes("oval gear")) return "oval_gear";
  if (ef.includes("glass tube rotameter") && !ef.includes("bypass")) return "rotameter";
  if (ef.includes("bypass") && ef.includes("rotameter")) return "bypass_rotameter";
  if (ef.includes("metal tube")) return "metal_tube_rotameter";
  if (ef.includes("acrylic")) return "acrylic_body_rotameter";
  if (ef.includes("ultrasonic")) return "ultrasonic";
  if (ef.includes("magnetic level gauge") || ef.includes("side mounted magnetic")) return "magnetic_level";
  if (ef.includes("top mounted magnetic")) return "top_mounted_magnetic";
  if (ef.includes("reflex")) return "reflex_level";
  if (ef.includes("transparent")) return "transparent_level";
  if (ef.includes("tubular")) return "tubular_level";
  if (ef.includes("float") && ef.includes("board")) return "float_board_level";
  if (ef.includes("radar")) return "radar_level";
  if (ef.includes("hydrostatic")) return "hydrostatic_level";
  if (ef.includes("displacer") || ef.includes("level switch")) return "displacer_level_switch";
  if (ef.includes("sight glass")) return "double_window_sight_glass";
  if (ef.includes("smart pressure")) return "smart_pressure";
  if (ef.includes("differential pressure") || ef.includes("dp ")) return "dp_pressure";
  return null;
}

function checkApplicationSuitability(productFamilyKey: string, application: string): "suitable" | "unsuitable" | "unknown" {
  if (!application || application === "N/A") return "unknown";
  const appLower = application.toLowerCase();

  // Find matching application patterns
  const suitableFamilies: string[] = [];
  for (const [appPattern, families] of Object.entries(APPLICATION_TO_PRODUCT)) {
    if (appLower.includes(appPattern)) {
      suitableFamilies.push(...families);
    }
  }

  if (suitableFamilies.length === 0) return "unknown";

  return suitableFamilies.includes(productFamilyKey) ? "suitable" : "unsuitable";
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMON MISMATCH PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

function findMismatchPatterns(
  extractedFamily: string,
  modelCodeFamily: string | null,
  application: string,
): { status: "correct" | "warning" | "wrong" | "insufficient_data"; reason: string; suggestions: string[] } {
  const ef = extractedFamily.toLowerCase();
  const suggestions: string[] = [];

  // Pattern 1: Glass Tube Rotameter but model code is By-Pass
  if (ef.includes("glass tube rotameter") && modelCodeFamily === "bypass_rotameter") {
    suggestions.push("Product family should be 'By-Pass Glass Tube Rotameter' — model code confirms bypass type");
    return { status: "wrong", reason: "Extracted as Glass Tube Rotameter but model code indicates By-Pass type", suggestions };
  }

  // Pattern 2: Generic "Rotameter" without glass/metal specification
  if ((ef === "rotameter" || ef === "flowtech rotameter") && !modelCodeFamily) {
    suggestions.push("Specify whether Glass Tube, Metal Tube, By-Pass, or Acrylic Body Rotameter");
    return { status: "insufficient_data", reason: "Product family is too generic — cannot determine rotameter type", suggestions };
  }

  // Pattern 3: Model code says DLS but extracted family doesn't mention level switch
  if (modelCodeFamily === "displacer_level_switch" && !ef.includes("level switch") && !ef.includes("displacer")) {
    suggestions.push("Model code (DLS) indicates Displacer Level Switch — verify product family");
    return { status: "wrong", reason: `Extracted as "${extractedFamily}" but model code (DLS) indicates Displacer Level Switch`, suggestions };
  }

  // Pattern 4: Model code says SMMLI but family doesn't mention magnetic level
  if (modelCodeFamily === "magnetic_level" && !ef.includes("magnetic") && !ef.includes("level")) {
    suggestions.push("Model code indicates Magnetic Level Indicator/Gauge");
    return { status: "wrong", reason: `Model code indicates Magnetic Level but extracted family is "${extractedFamily}"`, suggestions };
  }

  // Pattern 5: Application is flow but product is level device
  const appLower = (application || "").toLowerCase();
  const isFlowApp = ["water", "steam", "gas", "air", "oil", "fuel", "chemical"].some((a) => appLower.includes(a));
  const isLevelProduct = ef.includes("level") || ef.includes("sight glass");
  const isFlowProduct = ef.includes("flow") || ef.includes("rotameter");

  if (isFlowApp && isLevelProduct && !appLower.includes("level") && !appLower.includes("tank")) {
    suggestions.push("Application suggests flow measurement — verify if level device is correct");
    return { status: "warning", reason: `Application "${application}" suggests flow measurement but product is a level device`, suggestions };
  }

  // Pattern 6: Application is level but product is flowmeter
  if (appLower.includes("level") && appLower.includes("tank") && isFlowProduct) {
    suggestions.push("Application is tank level measurement — consider Magnetic Level Gauge or Radar Level Transmitter");
    return { status: "warning", reason: `Application is level measurement but product is a flowmeter`, suggestions };
  }

  return { status: "correct", reason: "No obvious mismatch detected", suggestions };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN VALIDATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export function validateProductSelection(
  extractedFamily: string,
  modelNumber: string,
  application: string,
  tagNumber: string,
): ProductValidationResult {
  const checks: { name: string; pass: boolean; detail: string }[] = [];
  const suggestions: string[] = [];

  // ─── Check 1: Has model code? ─────────────────────────────────────
  const modelCodeFamily = modelNumber ? getFamilyFromModelCode(modelNumber) : null;
  checks.push({
    name: "Model Code Decodification",
    pass: !!modelCodeFamily,
    detail: modelCodeFamily
      ? `Model code prefix "${extractModelCodePrefix(modelNumber)}" → ${modelCodeFamily.label}`
      : modelNumber
        ? `Model code "${modelNumber}" — prefix not recognized (may be non-standard or incomplete)`
        : "No model code / decodification extracted",
  });

  // ─── Check 2: Product family vs model code match ──────────────────
  const extractedKey = getProductFamilyKey(extractedFamily);
  let familyMatch = false;
  if (modelCodeFamily && extractedKey) {
    familyMatch = modelCodeFamily.key === extractedKey ||
      (modelCodeFamily.key === "magnetic_level" && extractedKey === "magnetic_level");
    checks.push({
      name: "Family vs Model Code",
      pass: familyMatch,
      detail: familyMatch
        ? `Extracted family "${extractedFamily}" matches model code family "${modelCodeFamily.label}"`
        : `MISMATCH: Extracted "${extractedFamily}" (${extractedKey}) vs Model code "${modelCodeFamily.label}" (${modelCodeFamily.key})`,
    });
    if (!familyMatch) {
      suggestions.push(`Product family should be "${modelCodeFamily.label}" based on model code`);
    }
  } else {
    checks.push({
      name: "Family vs Model Code",
      pass: !modelCodeFamily || !extractedKey ? true : false,
      detail: !extractedKey
        ? `Cannot map extracted family "${extractedFamily}" to internal key`
        : "Model code not available for comparison",
    });
  }

  // ─── Check 3: Application suitability ─────────────────────────────
  const appSuitability = checkApplicationSuitability(extractedKey || "", application);
  checks.push({
    name: "Application Suitability",
    pass: appSuitability !== "unsuitable",
    detail: appSuitability === "suitable"
      ? `Application "${application}" is suitable for ${extractedFamily}`
      : appSuitability === "unsuitable"
        ? `Application "${application}" may NOT be suitable for ${extractedFamily}`
        : `Cannot verify application suitability (no match in database)`,
  });
  if (appSuitability === "unsuitable") {
    suggestions.push(`Verify application "${application}" is compatible with ${extractedFamily}`);
  }

  // ─── Check 4: Product family specificity ──────────────────────────
  const ef = extractedFamily.toLowerCase();
  const isGeneric = ef === "rotameter" || ef === "flowmeter" || ef === "level gauge" || ef === "level switch";
  checks.push({
    name: "Family Specificity",
    pass: !isGeneric,
    detail: isGeneric
      ? `Product family "${extractedFamily}" is generic — needs to be more specific`
      : `Product family "${extractedFamily}" is sufficiently specific`,
  });
  if (isGeneric) {
    suggestions.push(`Specify exact product type (e.g. "Glass Tube Rotameter" instead of "Rotameter")`);
  }

  // ─── Check 5: Common mismatch patterns ────────────────────────────
  const mismatchResult = findMismatchPatterns(extractedFamily, modelCodeFamily?.key || null, application);
  checks.push({
    name: "Mismatch Patterns",
    pass: mismatchResult.status === "correct",
    detail: mismatchResult.reason,
  });
  suggestions.push(...mismatchResult.suggestions);

  // ─── Determine overall status ─────────────────────────────────────
  let overallStatus: ProductValidationResult["status"];
  const passCount = checks.filter((c) => c.pass).length;
  const mismatchStatus: string = mismatchResult.status;

  if (mismatchStatus === "wrong") {
    overallStatus = "wrong";
  } else if (passCount === checks.length) {
    overallStatus = "correct";
  } else if (passCount >= checks.length - 1) {
    overallStatus = "warning";
  } else {
    overallStatus = (mismatchStatus === "insufficient_data") ? "insufficient_data" : "warning";
  }

  return {
    status: overallStatus,
    reason: mismatchResult.reason !== "No obvious mismatch detected"
      ? mismatchResult.reason
      : `${passCount}/${checks.length} checks passed`,
    extractedFamily,
    detectedFromModelCode: modelCodeFamily?.key || null,
    detectedFromModelCodeLabel: modelCodeFamily?.label || null,
    applicationMatch: appSuitability,
    suggestions: [...new Set(suggestions)],
    checks,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export interface LineItemForValidation {
  id: string;
  tagNumber: string;
  productFamily: string;
  modelNumber: string;
  application: string;
}

export function validateAllProducts(lineItems: LineItemForValidation[]): Record<string, ProductValidationResult> {
  const results: Record<string, ProductValidationResult> = {};
  for (const li of lineItems) {
    results[li.id] = validateProductSelection(li.productFamily, li.modelNumber, li.application, li.tagNumber);
  }
  return results;
}
