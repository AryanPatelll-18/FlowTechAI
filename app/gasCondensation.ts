/**
 * Gas Condensation / Saturation Data
 * ===================================
 * Saturation temperature (°C) at various pressures (bar abs) for gases
 * that can condense at industrial operating conditions.
 *
 * Source: NIST REFPROP, IUPAC tables, ASHRAE — extracted from
 * "Flow Dynamics of Industrial Gases: Chlorine, Ammonia, and LNG"
 *
 * For each gas: if operating temp (°C) <= saturation temp at operating pressure,
 * the gas is AT or BELOW its dew point → wetness/condensation risk exists.
 *
 * Vortex Flowmeter requires single-phase flow → must be rejected.
 */

export interface SaturationPoint {
  pressureBar: number; // bar abs
  tempC: number; // saturation temperature °C
}

/** Chlorine (Cl₂) saturation data — critical temp 143.8°C */
export const CHLORINE_SATURATION: SaturationPoint[] = [
  { pressureBar: 1.01, tempC: -34.0 },
  { pressureBar: 2.0, tempC: -22.0 },
  { pressureBar: 3.0, tempC: -14.0 },
  { pressureBar: 4.0, tempC: -7.5 },
  { pressureBar: 5.0, tempC: -2.5 },
  { pressureBar: 6.0, tempC: +2.0 },
  { pressureBar: 7.0, tempC: +5.5 },
  { pressureBar: 8.0, tempC: +9.0 },
  { pressureBar: 9.0, tempC: +12.0 },
  { pressureBar: 10.0, tempC: +15.0 },
  { pressureBar: 12.0, tempC: +20.0 },
  { pressureBar: 15.0, tempC: +27.0 },
  { pressureBar: 20.0, tempC: +37.0 },
  { pressureBar: 25.0, tempC: +44.5 },
  { pressureBar: 30.0, tempC: +51.0 },
  { pressureBar: 40.0, tempC: +62.0 },
  { pressureBar: 50.0, tempC: +71.0 },
  { pressureBar: 79.9, tempC: +143.8 }, // critical point
];

/** Ammonia (NH₃) saturation data — critical temp 132.25°C */
export const AMMONIA_SATURATION: SaturationPoint[] = [
  { pressureBar: 1.01, tempC: -33.3 },
  { pressureBar: 2.0, tempC: -18.0 },
  { pressureBar: 3.0, tempC: -8.0 },
  { pressureBar: 4.0, tempC: -1.0 },
  { pressureBar: 4.29, tempC: +0.0 }, // 0°C reference
  { pressureBar: 5.0, tempC: +3.5 },
  { pressureBar: 6.0, tempC: +8.0 },
  { pressureBar: 7.0, tempC: +12.0 },
  { pressureBar: 8.0, tempC: +15.5 },
  { pressureBar: 8.57, tempC: +17.5 }, // 20°C reference
  { pressureBar: 10.0, tempC: +22.0 },
  { pressureBar: 12.0, tempC: +29.0 },
  { pressureBar: 15.0, tempC: +37.0 },
  { pressureBar: 15.55, tempC: +38.0 }, // 40°C reference
  { pressureBar: 20.0, tempC: +48.0 },
  { pressureBar: 25.0, tempC: +57.0 },
  { pressureBar: 30.0, tempC: +64.0 },
  { pressureBar: 40.0, tempC: +77.0 },
  { pressureBar: 50.0, tempC: +87.0 },
  { pressureBar: 62.55, tempC: +100.0 },
  { pressureBar: 113.4, tempC: +132.25 }, // critical point
];

/** Methane/LNG (CH₄) saturation data — critical temp -82.59°C */
export const METHANE_SATURATION: SaturationPoint[] = [
  { pressureBar: 1.01, tempC: -161.6 },
  { pressureBar: 2.0, tempC: -155.0 },
  { pressureBar: 3.0, tempC: -150.5 },
  { pressureBar: 4.0, tempC: -147.0 },
  { pressureBar: 5.0, tempC: -144.0 },
  { pressureBar: 6.0, tempC: -141.5 },
  { pressureBar: 8.0, tempC: -137.0 },
  { pressureBar: 10.0, tempC: -133.5 },
  { pressureBar: 15.0, tempC: -126.0 },
  { pressureBar: 20.0, tempC: -120.0 },
  { pressureBar: 30.0, tempC: -110.0 },
  { pressureBar: 45.99, tempC: -82.59 }, // critical point
];

// ─── Map gas names to their saturation curves ─────────────────────────
export const GAS_SATURATION_MAP: Record<string, SaturationPoint[]> = {
  "Chlorine": CHLORINE_SATURATION,
  "Chlorine (Cl2)": CHLORINE_SATURATION,
  "Ammonia": AMMONIA_SATURATION,
  "Ammonia (NH3)": AMMONIA_SATURATION,
  "Methane": METHANE_SATURATION,
  "Methane (LNG)": METHANE_SATURATION,
  "LNG": METHANE_SATURATION,
  "Natural Gas": METHANE_SATURATION,
  "Liquefied Natural Gas": METHANE_SATURATION,
};

/**
 * Linear interpolation: find saturation temperature at given pressure.
 * Returns the saturation temperature (°C) at the given pressure (bar abs).
 */
export function getSaturationTemp(
  saturationData: SaturationPoint[],
  pressureBar: number
): number | null {
  if (saturationData.length === 0) return null;
  if (pressureBar <= saturationData[0].pressureBar) return saturationData[0].tempC;
  if (pressureBar >= saturationData[saturationData.length - 1].pressureBar)
    return saturationData[saturationData.length - 1].tempC;

  for (let i = 0; i < saturationData.length - 1; i++) {
    const lo = saturationData[i];
    const hi = saturationData[i + 1];
    if (pressureBar >= lo.pressureBar && pressureBar <= hi.pressureBar) {
      const frac =
        (pressureBar - lo.pressureBar) / (hi.pressureBar - lo.pressureBar);
      return lo.tempC + frac * (hi.tempC - lo.tempC);
    }
  }
  return null;
}

/**
 * Check if a gas at given temperature and pressure is at risk of condensation.
 *
 * @param gasName — name of the gas (must match GAS_SATURATION_MAP key)
 * @param tempC — operating temperature in °C
 * @param pressureBar — operating pressure in bar abs
 * @returns { isWet: boolean, satTempC: number | null, marginC: number | null }
 *   isWet = true if operating temp is at or below saturation temp
 *   marginC = how many °C above saturation (negative = below, wet)
 */
export function checkGasWetness(
  gasName: string,
  tempC: number,
  pressureBar: number
): {
  isWet: boolean;
  satTempC: number | null;
  marginC: number | null;
  message: string;
} {
  const saturationData = GAS_SATURATION_MAP[gasName];
  if (!saturationData) {
    // No saturation data for this gas → assume no wetness risk
    return {
      isWet: false,
      satTempC: null,
      marginC: null,
      message: "",
    };
  }

  const satTempC = getSaturationTemp(saturationData, pressureBar);
  if (satTempC === null) {
    return {
      isWet: false,
      satTempC: null,
      marginC: null,
      message: "",
    };
  }

  const marginC = tempC - satTempC;

  // Safety margin: 10°C for Chlorine, 15°C for Ammonia
  const safetyMargin = gasName.toLowerCase().includes("chlorine") ? 10 : 15;

  if (marginC <= 0) {
    return {
      isWet: true,
      satTempC,
      marginC,
      message: `${gasName} at ${tempC}°C / ${pressureBar.toFixed(
        1
      )} bar abs is AT or BELOW its dew point (${satTempC.toFixed(
        1
      )}°C). Condensation WILL occur. Vortex Flowmeter NOT recommended.`,
    };
  }

  if (marginC < safetyMargin) {
    return {
      isWet: false,
      satTempC,
      marginC,
      message: `WARNING: ${gasName} at ${tempC}°C is only ${marginC.toFixed(
        1
      )}°C above its dew point (${satTempC.toFixed(
        1
      )}°C at ${pressureBar.toFixed(
        1
      )} bar abs). Recommended: keep >${safetyMargin}°C above dew point.`,
    };
  }

  // Safe — above dew point with adequate margin
  return {
    isWet: false,
    satTempC,
    marginC,
    message: `Safe: ${tempC}°C is ${marginC.toFixed(
      1
    )}°C above dew point (${satTempC.toFixed(1)}°C).`,
  };
}
