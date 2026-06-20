// Flowtech Vortex Steam Mass Flow Range Table (kg/h)
// Extracted from Flowtech Master Metal Table pages 9-10
// Basis: Qmin/Qmax values are mass-flow ranges in kg/h, calculated with saturated steam density

export interface SteamPoint {
  pressureAbs: number;    // bar absolute
  tempC: number;          // saturation temperature °C
  density: number;        // kg/m³
  specificGravity: number; // SG relative to water at 4°C (density/1000)
}

// Saturated steam properties at each tabulated pressure point
export const STEAM_POINTS: SteamPoint[] = [
  { pressureAbs: 2,  tempC: 120.2, density: 1.129, specificGravity: 0.00113 },
  { pressureAbs: 3,  tempC: 133.5, density: 1.651, specificGravity: 0.00165 },
  { pressureAbs: 4,  tempC: 143.6, density: 2.163, specificGravity: 0.00216 },
  { pressureAbs: 5,  tempC: 151.8, density: 2.669, specificGravity: 0.00267 },
  { pressureAbs: 6,  tempC: 158.9, density: 3.170, specificGravity: 0.00317 },
  { pressureAbs: 7,  tempC: 165.0, density: 3.667, specificGravity: 0.00367 },
  { pressureAbs: 8,  tempC: 170.4, density: 4.162, specificGravity: 0.00416 },
  { pressureAbs: 9,  tempC: 175.4, density: 4.665, specificGravity: 0.00466 },
  { pressureAbs: 10, tempC: 179.7, density: 5.147, specificGravity: 0.00515 },
  { pressureAbs: 12, tempC: 188.0, density: 6.127, specificGravity: 0.00613 },
  { pressureAbs: 14, tempC: 195.0, density: 7.106, specificGravity: 0.00711 },
  { pressureAbs: 16, tempC: 201.4, density: 8.085, specificGravity: 0.00809 },
  { pressureAbs: 18, tempC: 207.1, density: 9.065, specificGravity: 0.00907 },
  { pressureAbs: 20, tempC: 212.7, density: 10.05, specificGravity: 0.01005 },
];

// Qmin and Qmax values for each line size at each pressure point
// Index corresponds to STEAM_POINTS index
export const STEAM_SIZE_TABLE: Record<string, { qmin: number[]; qmax: number[] }> = {
  "DN15":  { qmin: [5.645, 8.255, 10.815, 13.345, 15.85, 18.335, 20.81, 23.325, 25.735, 30.635, 35.53, 40.425, 45.325, 50.25],    qmax: [56.45, 82.55, 108.2, 133.4, 158.5, 183.3, 208.1, 233.2, 257.4, 306.4, 355.3, 404.2, 453.2, 502.5] },
  "DN20":  { qmin: [6.774, 9.906, 12.978, 16.014, 19.02, 22.002, 24.972, 27.99, 30.882, 36.762, 42.636, 48.51, 54.39, 60.3],      qmax: [67.74, 99.06, 129.8, 160.1, 190.2, 220, 249.7, 279.9, 308.8, 367.6, 426.4, 485.1, 543.9, 603] },
  "DN25":  { qmin: [9.032, 13.208, 17.304, 21.352, 25.36, 29.336, 33.296, 37.32, 41.176, 49.016, 56.848, 64.68, 72.52, 80.4],      qmax: [135.5, 198.1, 259.6, 320.3, 380.4, 440, 499.4, 559.8, 617.6, 735.2, 852.7, 970.2, 1088, 1206] },
  "DN32":  { qmin: [20.322, 29.718, 38.934, 48.042, 57.06, 66.06, 74.916, 83.97, 92.646, 110.3, 127.9, 145.5, 163.2, 180.9],      qmax: [203.2, 297.2, 389.3, 480.4, 570.6, 660.1, 749.2, 839.7, 926.5, 1103, 1279, 1455, 1614, 1809] },
  "DN40":  { qmin: [22.58, 33.02, 43.26, 53.38, 63.4, 73.34, 83.24, 93.3, 102.9, 122.5, 142.1, 161.7, 181.3, 201],                qmax: [338.7, 495.3, 648.9, 800.7, 951, 1100, 1249, 1400, 1544, 1838, 2132, 2426, 2720, 3015] },
  "DN50":  { qmin: [28.25, 41.275, 54.075, 66.725, 79.25, 91.675, 104, 116.6, 128.7, 153.2, 177.7, 202.1, 226.2, 251.2],         qmax: [564.5, 825.5, 1082, 1334, 1585, 1834, 2081, 2332, 2574, 3064, 3553, 4042, 4532, 5025] },
  "DN65":  { qmin: [45.16, 66.04, 86.52, 106.8, 126.8, 146.7, 166.5, 186.6, 205.9, 245.1, 284.2, 323.4, 362.6, 402],              qmax: [903.2, 1321, 1730, 2135, 2536, 2934, 3330, 3732, 4118, 4902, 5685, 6468, 7252, 8040] },
  "DN80":  { qmin: [67.74, 99.06, 129.8, 160.1, 190.2, 220, 249.7, 279.9, 308.8, 367.2, 426.4, 485.1, 543.9, 603],                qmax: [1355, 1981, 2596, 3203, 3804, 4400, 4994, 5598, 6176, 7352, 8527, 9702, 10878, 12060] },
  "DN100": { qmin: [112.9, 165.1, 216.3, 266.9, 317, 366.7, 416.2, 466.5, 514.7, 612.7, 710.6, 808.5, 906.5, 1005],              qmax: [2258, 3302, 4326, 5338, 6340, 7334, 8324, 9330, 10294, 12254, 14212, 16170, 18130, 20100] },
  "DN125": { qmin: [169.3, 247.7, 324.4, 400.4, 475.5, 550, 624.3, 699.8, 772, 919, 1066, 1213, 1360, 1508],                     qmax: [3387, 4953, 6489, 8007, 9510, 11001, 12486, 13995, 15441, 18381, 21318, 24255, 27195, 30150] },
  "DN150": { qmin: [225.8, 330.2, 432.6, 533.8, 634, 733.4, 832.4, 933, 1029, 1225, 1421, 1617, 1813, 2010],                      qmax: [4516, 6604, 8652, 10676, 12680, 14668, 16648, 18660, 20588, 24508, 28424, 32340, 36260, 40200] },
  "DN200": { qmin: [395.1, 577.9, 757, 934.1, 1110, 1283, 1457, 1633, 1801, 2144, 2487, 2830, 3173, 3518],                       qmax: [9032, 13208, 17304, 21352, 25360, 29336, 33296, 37320, 41176, 49016, 56848, 64680, 72520, 80400] },
  "DN250": { qmin: [564.5, 825.5, 1082, 1334, 1585, 1834, 2081, 2332, 2574, 3064, 3553, 4042, 4532, 5025],                       qmax: [13548, 19812, 25956, 32028, 38040, 44004, 49944, 55980, 61764, 73524, 85272, 97020, 108780, 120600] },
  "DN300": { qmin: [677.4, 990.6, 1298, 1601, 1902, 2200, 2497, 2799, 3088, 3676, 4264, 4851, 5439, 6030],                       qmax: [18064, 26416, 34608, 42704, 50720, 58672, 66592, 74640, 82352, 98032, 113696, 129360, 145040, 160800] },
};

export const STEAM_SIZES = Object.keys(STEAM_SIZE_TABLE); // DN15 to DN300

// Convert gauge pressure to absolute
export function gaugeToAbsolute(pressureBarGauge: number): number {
  return pressureBarGauge + 1.01325;
}

// Get saturation temperature at a given absolute pressure (°C)
// Uses linear interpolation between known steam table points
export function getSaturationTemp(pressureBarAbs: number): number | null {
  if (pressureBarAbs < 2 || pressureBarAbs > 20) return null;

  // Find bracketing points
  for (let i = 0; i < STEAM_POINTS.length - 1; i++) {
    if (pressureBarAbs >= STEAM_POINTS[i].pressureAbs && pressureBarAbs <= STEAM_POINTS[i + 1].pressureAbs) {
      const t = (pressureBarAbs - STEAM_POINTS[i].pressureAbs) /
                (STEAM_POINTS[i + 1].pressureAbs - STEAM_POINTS[i].pressureAbs);
      return STEAM_POINTS[i].tempC + t * (STEAM_POINTS[i + 1].tempC - STEAM_POINTS[i].tempC);
    }
  }
  // Exact match at endpoint
  if (Math.abs(pressureBarAbs - STEAM_POINTS[STEAM_POINTS.length - 1].pressureAbs) < 0.001) {
    return STEAM_POINTS[STEAM_POINTS.length - 1].tempC;
  }
  return null;
}

// Get saturated steam density at a given absolute pressure (kg/m³)
export function getSaturatedDensity(pressureBarAbs: number): number | null {
  if (pressureBarAbs < 2 || pressureBarAbs > 20) return null;

  for (let i = 0; i < STEAM_POINTS.length - 1; i++) {
    if (pressureBarAbs >= STEAM_POINTS[i].pressureAbs && pressureBarAbs <= STEAM_POINTS[i + 1].pressureAbs) {
      const t = (pressureBarAbs - STEAM_POINTS[i].pressureAbs) /
                (STEAM_POINTS[i + 1].pressureAbs - STEAM_POINTS[i].pressureAbs);
      return STEAM_POINTS[i].density + t * (STEAM_POINTS[i + 1].density - STEAM_POINTS[i].density);
    }
  }
  if (Math.abs(pressureBarAbs - STEAM_POINTS[STEAM_POINTS.length - 1].pressureAbs) < 0.001) {
    return STEAM_POINTS[STEAM_POINTS.length - 1].density;
  }
  return null;
}

// Calculate steam density from pressure and temperature
// Returns: { density, state: "saturated" | "superheated" | "wet" | "out_of_range" }
export function calculateSteamDensity(
  pressureBarAbs: number,
  tempC: number
): { density: number; state: "saturated" | "superheated" | "wet" | "out_of_range"; note?: string } {
  // Range check
  if (pressureBarAbs < 2 || pressureBarAbs > 20) {
    return { density: 0, state: "out_of_range", note: "Pressure must be 2-20 bar absolute (1-19 bar gauge)" };
  }

  // Get saturation temperature at this pressure
  const tSat = getSaturationTemp(pressureBarAbs);
  if (tSat === null) {
    return { density: 0, state: "out_of_range", note: "Cannot determine saturation temperature" };
  }

  const tolerance = 2.0; // °C tolerance for saturated detection

  if (Math.abs(tempC - tSat) <= tolerance) {
    // Saturated steam
    const rho = getSaturatedDensity(pressureBarAbs);
    return {
      density: rho ?? 0,
      state: "saturated",
      note: `Saturated steam at ${pressureBarAbs.toFixed(2)} bar abs, ${tSat.toFixed(1)}°C`,
    };
  } else if (tempC > tSat + tolerance) {
    // Superheated steam - use ideal gas law with compressibility correction
    // ρ = P / (Z * R_specific * T)
    // For steam: R_specific = 461.5 J/(kg·K)
    const tK = tempC + 273.15;
    const rSpecific = 461.5; // J/(kg·K)
    const pPa = pressureBarAbs * 100000;

    // Approximate compressibility factor Z for superheated steam
    // Simple correlation: Z ≈ 1 + 0.001 * (P/Pc) * (Tc/T)^3 where Pc=220.64 bar, Tc=647.1 K
    const pc = 220.64;
    const tc = 647.1;
    const reducedP = pressureBarAbs / pc;
    const reducedT = tK / tc;
    const z = 1 + 0.15 * reducedP * Math.pow(1 / reducedT, 3);

    const rho = pPa / (z * rSpecific * tK);

    return {
      density: rho,
      state: "superheated",
      note: `Superheated steam: ${tempC.toFixed(1)}°C > saturation ${tSat.toFixed(1)}°C`,
    };
  } else {
    // Wet steam (temp below saturation)
    // Calculate mixture density using quality approximation
    // For simplicity, assume quality x ≈ 0.95 (95% dry steam)
    const rhoSat = getSaturatedDensity(pressureBarAbs) ?? 0;
    // Wet steam density is approximately the vapor density (since liquid volume is negligible)
    // A better approximation: ρ_wet ≈ ρ_sat * x where x is quality
    // Using x = 0.95 as conservative estimate
    const quality = 0.95;
    const rhoWet = rhoSat * quality;

    return {
      density: rhoWet,
      state: "wet",
      note: `Wet steam: ${tempC.toFixed(1)}°C < saturation ${tSat.toFixed(1)}°C. Using ${(quality * 100).toFixed(0)}% quality estimate. Verify with dryness fraction measurement.`,
    };
  }
}

// Interpolate Qmin/Qmax for a specific size at a given absolute pressure
// Uses linear interpolation between bracketing pressure points
export function interpolateSteamFlow(
  size: string,
  pressureBarAbs: number
): { qmin: number; qmax: number } | null {
  if (pressureBarAbs < 2 || pressureBarAbs > 20) return null;

  const sizeData = STEAM_SIZE_TABLE[size];
  if (!sizeData) return null;

  // Exact match
  for (let i = 0; i < STEAM_POINTS.length; i++) {
    if (Math.abs(pressureBarAbs - STEAM_POINTS[i].pressureAbs) < 0.001) {
      return { qmin: sizeData.qmin[i], qmax: sizeData.qmax[i] };
    }
  }

  // Interpolate
  for (let i = 0; i < STEAM_POINTS.length - 1; i++) {
    if (pressureBarAbs >= STEAM_POINTS[i].pressureAbs && pressureBarAbs <= STEAM_POINTS[i + 1].pressureAbs) {
      const t = (pressureBarAbs - STEAM_POINTS[i].pressureAbs) /
                (STEAM_POINTS[i + 1].pressureAbs - STEAM_POINTS[i].pressureAbs);
      const qmin = sizeData.qmin[i] + t * (sizeData.qmin[i + 1] - sizeData.qmin[i]);
      const qmax = sizeData.qmax[i] + t * (sizeData.qmax[i + 1] - sizeData.qmax[i]);
      return { qmin, qmax };
    }
  }

  return null;
}

// Get all sizes' interpolated flows at a given pressure
export function getAllSteamFlows(pressureBarAbs: number): Array<{
  size: string;
  qmin: number;
  qmax: number;
}> {
  const results: Array<{ size: string; qmin: number; qmax: number }> = [];
  for (const size of STEAM_SIZES) {
    const flow = interpolateSteamFlow(size, pressureBarAbs);
    if (flow) {
      results.push({ size, ...flow });
    }
  }
  return results;
}
