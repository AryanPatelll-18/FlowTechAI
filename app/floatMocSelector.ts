// ============================================================
// FLOAT MOC SELECTOR — Application-Based Verification
// For Side Mounted & Top Mounted Magnetic Level Gauge ONLY
// ============================================================
// Source: Flowtech Float MOC Selection Matrix
// Determines suitable Float MOC + Indicator Type based on fluid density (SG)

export type FloatMOC = "SS 316" | "Titanium" | "PP / PTFE";
export type IndicatorType = "Capsule" | "Roller" | "Flapper";

export interface FloatMocRule {
  densityMin: number;
  densityMax: number;
  densityLabel: string;
  combinations: Record<FloatMOC, Record<IndicatorType, boolean>>;
}

export const FLOAT_MOC_RULES: FloatMocRule[] = [
  {
    densityMin: 0.75,
    densityMax: 0.8,
    densityLabel: "0.75 to 0.80",
    combinations: {
      "SS 316":   { Capsule: true,  Roller: false, Flapper: false },
      "Titanium": { Capsule: true,  Roller: true,  Flapper: true  },
      "PP / PTFE":{ Capsule: false, Roller: false, Flapper: false },
    },
  },
  {
    densityMin: 0.8,
    densityMax: 0.9,
    densityLabel: "0.80 to 0.90",
    combinations: {
      "SS 316":   { Capsule: true,  Roller: false, Flapper: false },
      "Titanium": { Capsule: true,  Roller: true,  Flapper: true  },
      "PP / PTFE":{ Capsule: false, Roller: false, Flapper: false },
    },
  },
  {
    densityMin: 0.9,
    densityMax: 1.0,
    densityLabel: "0.90 to 1.00",
    combinations: {
      "SS 316":   { Capsule: true,  Roller: true,  Flapper: true  },
      "Titanium": { Capsule: true,  Roller: true,  Flapper: true  },
      "PP / PTFE":{ Capsule: false, Roller: false, Flapper: false },
    },
  },
  {
    densityMin: 1.0,
    densityMax: 1.1,
    densityLabel: "1.00 to 1.10",
    combinations: {
      "SS 316":   { Capsule: true,  Roller: true,  Flapper: true  },
      "Titanium": { Capsule: true,  Roller: true,  Flapper: true  },
      "PP / PTFE":{ Capsule: true,  Roller: true,  Flapper: true  },
    },
  },
  {
    densityMin: 1.1,
    densityMax: 999.0,
    densityLabel: "1.10 and above",
    combinations: {
      "SS 316":   { Capsule: true,  Roller: true,  Flapper: true  },
      "Titanium": { Capsule: true,  Roller: true,  Flapper: true  },
      "PP / PTFE":{ Capsule: true,  Roller: true,  Flapper: true  },
    },
  },
];

export const FLOAT_MOCS: FloatMOC[] = ["SS 316", "Titanium", "PP / PTFE"];
export const INDICATOR_TYPES: IndicatorType[] = ["Capsule", "Roller", "Flapper"];

/** Find the matching rule for a given specific gravity */
export function findFloatMocRule(sg: number): FloatMocRule | null {
  for (const rule of FLOAT_MOC_RULES) {
    if (sg >= rule.densityMin && sg < rule.densityMax) return rule;
  }
  // Special case: exact boundary at 1.1
  if (sg >= 1.1) return FLOAT_MOC_RULES[FLOAT_MOC_RULES.length - 1];
  return null;
}

/** Get all valid (Float MOC, Indicator) combinations for a given SG */
export function getValidCombinations(sg: number): Array<{ floatMoc: FloatMOC; indicator: IndicatorType; notes?: string }> {
  const rule = findFloatMocRule(sg);
  if (!rule) return [];

  const valid: Array<{ floatMoc: FloatMOC; indicator: IndicatorType; notes?: string }> = [];
  for (const fm of FLOAT_MOCS) {
    for (const ind of INDICATOR_TYPES) {
      if (rule.combinations[fm][ind]) {
        let notes = "";
        if (fm === "Titanium") notes = "Premium option — highest corrosion resistance";
        if (fm === "PP / PTFE" && sg < 1.0) notes = "Not recommended — float buoyancy insufficient";
        if (ind === "Capsule" && sg < 0.9) notes = "Toughened glass tube — suitable for low SG";
        if (ind === "Flapper") notes = "SS flags — durable, visible from 50+ meters";
        valid.push({ floatMoc: fm, indicator: ind, notes });
      }
    }
  }
  return valid;
}

/** Get the BEST recommended combination (single recommendation) */
export function getBestRecommendation(sg: number): { floatMoc: FloatMOC; indicator: IndicatorType; reason: string } | null {
  const rule = findFloatMocRule(sg);
  if (!rule) return null;

  // Priority: SS 316 > Titanium > PP/PTFE
  // Priority: Capsule > Roller > Flapper
  for (const fm of FLOAT_MOCS) {
    for (const ind of INDICATOR_TYPES) {
      if (rule.combinations[fm][ind]) {
        let reason = "";
        if (sg >= 0.75 && sg < 0.9) {
          if (fm === "SS 316" && ind === "Capsule") reason = `Fluid SG ${sg.toFixed(2)} is low (0.75-0.9). SS 316 Capsule is the standard cost-effective choice. Titanium is available for corrosive media.`;
          if (fm === "Titanium") reason = `Fluid SG ${sg.toFixed(2)} is low (0.75-0.9). Titanium float is required for corrosive applications (acids, chlorides).`;
        } else if (sg >= 0.9 && sg < 1.0) {
          reason = `Fluid SG ${sg.toFixed(2)} (0.9-1.0). SS 316 with Capsule/Roller/Flapper all suitable. Capsule is standard for chemical applications.`;
        } else if (sg >= 1.0 && sg < 1.1) {
          if (fm === "PP / PTFE") reason = `Fluid SG ${sg.toFixed(2)} (1.0-1.1). PP/PTFE float is now viable — ideal for highly corrosive applications where SS 316 is insufficient.`;
          else reason = `Fluid SG ${sg.toFixed(2)} (1.0-1.1). All combinations valid. SS 316 Capsule is the standard recommendation.`;
        } else {
          reason = `Fluid SG ${sg.toFixed(2)} ≥ 1.1. All Float MOC and Indicator combinations are valid. SS 316 Capsule is the standard; PP/PTFE for extreme corrosion.`;
        }
        return { floatMoc: fm, indicator: ind, reason };
      }
    }
  }
  return null;
}

/** Get recommendation note for why certain combinations are NOT valid */
export function getInvalidReason(sg: number, floatMoc: FloatMOC, indicator: IndicatorType): string {
  if (sg < 0.75) return `Fluid SG ${sg.toFixed(2)} is below 0.75 — no standard float will work. Special low-density float required (contact Flowtech).`;
  if (floatMoc === "PP / PTFE" && sg < 1.0) return `PP/PTFE float density is too close to fluid SG ${sg.toFixed(2)} — insufficient buoyancy. Need SG ≥ 1.0 for PP/PTFE.`;
  if (floatMoc === "SS 316" && (indicator === "Roller" || indicator === "Flapper") && sg < 0.9) return `SS 316 Roller/Flapper not suitable for SG ${sg.toFixed(2)} < 0.9. Use Capsule design instead.`;
  if (floatMoc === "Titanium" && (indicator === "Roller" || indicator === "Flapper") && sg < 0.75) return `Titanium Roller/Flapper not suitable for SG ${sg.toFixed(2)} < 0.75.`;
  return `Not recommended for SG ${sg.toFixed(2)} with ${floatMoc} float + ${indicator} indicator.`;
}

/** Get a human-readable summary for a given SG */
export function getSelectionSummary(sg: number): string {
  if (sg < 0.45) return `SG ${sg.toFixed(2)} is extremely low. No standard float works. Contact Flowtech for special low-density float design.`;
  if (sg < 0.75) return `SG ${sg.toFixed(2)} is below the standard range (0.75+). Special low-density float required — consult Flowtech.`;

  const rule = findFloatMocRule(sg);
  if (!rule) return `SG ${sg.toFixed(2)}: No matching rule found.`;

  const valid = getValidCombinations(sg);
  const groups: Record<string, string[]> = {};
  for (const v of valid) {
    if (!groups[v.floatMoc]) groups[v.floatMoc] = [];
    groups[v.floatMoc].push(v.indicator);
  }

  let summary = `**Fluid SG: ${sg.toFixed(2)}** (Range: ${rule.densityLabel})\n\n**Suitable Combinations:**\n`;
  for (const fm of FLOAT_MOCS) {
    if (groups[fm]) {
      summary += `- **${fm}**: ${groups[fm].join(", ")}\n`;
    } else {
      summary += `- **${fm}**: Not suitable\n`;
    }
  }

  const best = getBestRecommendation(sg);
  if (best) {
    summary += `\n**Best Recommendation:** ${best.floatMoc} + ${best.indicator}\n*${best.reason}*`;
  }

  return summary;
}
