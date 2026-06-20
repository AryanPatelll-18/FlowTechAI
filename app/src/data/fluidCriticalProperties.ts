// ============================================================
// Fluid Critical Properties — For Anomaly Detection
// Boiling points, freezing/melting points, flash points
// Values at 1 atm (1.013 bar) unless noted
// ============================================================

export interface FluidCriticalData {
  name: string;           // Must match name in LIQUIDS_DB
  formula?: string;
  boilingPointC: number;  // Normal boiling point at 1 atm (°C)
  freezingPointC: number; // Freezing/melting point (°C)
  flashPointC?: number;   // Flash point (°C) — undefined if non-flammable
  autoIgnitionC?: number; // Auto-ignition temperature (°C)
  vaporPressureCoeffs?: { // Antoine equation coefficients for vapor pressure
    A: number; B: number; C: number; // log10(P) = A - B/(C+T) where P in mmHg, T in °C
    tMin: number; tMax: number; // Valid temperature range
  };
  category: "water" | "acid" | "alkali" | "solvent" | "oil" | "fuel" | "chemical" | "cryogenic";
}

// Antoine equation: calculates vapor pressure in mmHg at given temperature
export function calcVaporPressureMmHg(
  coeffs: FluidCriticalData["vaporPressureCoeffs"],
  tempC: number
): number | null {
  if (!coeffs) return null;
  if (tempC < coeffs.tMin || tempC > coeffs.tMax) return null;
  const P_mmHg = Math.pow(10, coeffs.A - coeffs.B / (tempC + coeffs.C));
  return P_mmHg;
}

// Convert mmHg to bar
export function mmHgToBar(mmHg: number): number {
  return mmHg * 0.00133322;
}

// Check if fluid is boiling at given temperature and pressure
export function isFluidBoiling(
  fluid: FluidCriticalData,
  tempC: number,
  pressureBar: number
): boolean {
  // Special case: water — use accurate IAPWS correlation
  if (fluid.name === "Water" || fluid.formula === "H₂O") {
    const satTemp = waterSaturationTempC(pressureBar);
    return tempC >= satTemp;
  }

  // If pressure is atmospheric, use normal boiling point
  if (Math.abs(pressureBar - 1.013) < 0.05) {
    return tempC >= fluid.boilingPointC;
  }

  // Otherwise use Antoine equation if available and temp in range
  if (fluid.vaporPressureCoeffs) {
    const vpMmHg = calcVaporPressureMmHg(fluid.vaporPressureCoeffs, tempC);
    if (vpMmHg !== null) {
      const vpBar = mmHgToBar(vpMmHg);
      return vpBar >= pressureBar;
    }
  }

  // Fallback: use Clausius-Clapeyron approximation
  // More accurate: DHvap ≈ 40 kJ/mol for many liquids, R = 8.314 J/mol·K
  // ln(P2/P1) = -(DHvap/R) * (1/T2 - 1/T1)
  const T0 = fluid.boilingPointC + 273.15; // normal boiling point in K
  const DHvap = 40000; // J/mol — typical enthalpy of vaporization
  const R = 8.314; // J/mol·K
  const P0 = 1.013; // bar

  if (pressureBar > 0) {
    // Solve for T2: 1/T2 = 1/T0 + (R/DHvap) * ln(P0/P)
    const invT2 = 1/T0 + (R/DHvap) * Math.log(P0 / pressureBar);
    const bpAtPressure = (1 / invT2) - 273.15;
    return tempC >= bpAtPressure;
  }

  return tempC >= fluid.boilingPointC;
}

// ─── Fluid Critical Properties Database ──────────────────────────────────

export const FLUID_CRITICAL_PROPERTIES: FluidCriticalData[] = [
  // === WATER ===
  { name: "Water", formula: "H₂O", boilingPointC: 100, freezingPointC: 0,
    category: "water",
    vaporPressureCoeffs: { A: 8.07131, B: 1730.63, C: 233.426, tMin: 1, tMax: 100 } },
  { name: "Sea Water", boilingPointC: 100.7, freezingPointC: -2,
    category: "water" },
  { name: "Brackish Water", boilingPointC: 100.2, freezingPointC: -1,
    category: "water" },
  { name: "Demineralized Water", boilingPointC: 100, freezingPointC: 0,
    category: "water" },
  { name: "Distilled Water", boilingPointC: 100, freezingPointC: 0,
    category: "water" },
  { name: "Deionized Water", boilingPointC: 100, freezingPointC: 0,
    category: "water" },
  { name: "Boiler Feed Water", boilingPointC: 100, freezingPointC: 0,
    category: "water" },
  { name: "Condensate", boilingPointC: 100, freezingPointC: 0,
    category: "water" },
  { name: "Hot Water (80°C)", boilingPointC: 100, freezingPointC: 0,
    category: "water" },
  { name: "Chilled Water (5°C)", boilingPointC: 100, freezingPointC: 0,
    category: "water" },
  { name: "Waste Water", boilingPointC: 100, freezingPointC: 0,
    category: "water" },
  { name: "Raw Water", boilingPointC: 100, freezingPointC: 0,
    category: "water" },
  { name: "Process Water", boilingPointC: 100, freezingPointC: 0,
    category: "water" },

  // === ACIDS ===
  { name: "Hydrochloric Acid (30%)", formula: "HCl", boilingPointC: 85, freezingPointC: -30,
    category: "acid", flashPointC: undefined,
    vaporPressureCoeffs: { A: 7.72186, B: 1574.1, C: 236.67, tMin: 10, tMax: 85 } },
  { name: "Hydrochloric Acid (20%)", formula: "HCl", boilingPointC: 108, freezingPointC: -55,
    category: "acid" },
  { name: "Sulfuric Acid (98%)", formula: "H₂SO₄", boilingPointC: 337, freezingPointC: 10,
    category: "acid" },
  { name: "Sulfuric Acid (50%)", formula: "H₂SO₄", boilingPointC: 120, freezingPointC: -32,
    category: "acid" },
  { name: "Sulfuric Acid (20%)", formula: "H₂SO₄", boilingPointC: 104, freezingPointC: -15,
    category: "acid" },
  { name: "Nitric Acid (60%)", formula: "HNO₃", boilingPointC: 120, freezingPointC: -20,
    category: "acid", flashPointC: undefined },
  { name: "Nitric Acid (30%)", formula: "HNO₃", boilingPointC: 105, freezingPointC: -25,
    category: "acid" },
  { name: "Phosphoric Acid (85%)", formula: "H₃PO₄", boilingPointC: 158, freezingPointC: 21,
    category: "acid" },
  { name: "Phosphoric Acid (50%)", formula: "H₃PO₄", boilingPointC: 108, freezingPointC: -10,
    category: "acid" },
  { name: "Acetic Acid (100%)", formula: "CH₃COOH", boilingPointC: 118, freezingPointC: 17,
    category: "acid", flashPointC: 39, autoIgnitionC: 463 },
  { name: "Acetic Acid (50%)", formula: "CH₃COOH", boilingPointC: 102, freezingPointC: -5,
    category: "acid", flashPointC: 43 },

  // === ALKALIS ===
  { name: "Caustic Soda (50%)", formula: "NaOH", boilingPointC: 140, freezingPointC: 12,
    category: "alkali" },
  { name: "Caustic Soda (20%)", formula: "NaOH", boilingPointC: 108, freezingPointC: -10,
    category: "alkali" },
  { name: "Caustic Potash (45%)", formula: "KOH", boilingPointC: 132, freezingPointC: 5,
    category: "alkali" },
  { name: "Ammonia Solution (25%)", formula: "NH₄OH", boilingPointC: 38, freezingPointC: -58,
    category: "alkali", flashPointC: undefined },
  { name: "Soda Ash Solution (10%)", boilingPointC: 101, freezingPointC: -2,
    category: "alkali" },

  // === SOLVENTS ===
  { name: "Acetone", formula: "C₃H₆O", boilingPointC: 56, freezingPointC: -95,
    category: "solvent", flashPointC: -20, autoIgnitionC: 465,
    vaporPressureCoeffs: { A: 7.11714, B: 1210.595, C: 229.664, tMin: -30, tMax: 56 } },
  { name: "Methanol", formula: "CH₃OH", boilingPointC: 65, freezingPointC: -98,
    category: "solvent", flashPointC: 11, autoIgnitionC: 470,
    vaporPressureCoeffs: { A: 7.89750, B: 1474.08, C: 229.13, tMin: -20, tMax: 65 } },
  { name: "Ethanol", formula: "C₂H₅OH", boilingPointC: 78, freezingPointC: -114,
    category: "solvent", flashPointC: 13, autoIgnitionC: 363,
    vaporPressureCoeffs: { A: 8.11220, B: 1592.864, C: 226.184, tMin: 0, tMax: 78 } },
  { name: "Isopropyl Alcohol (IPA)", formula: "C₃H₈O", boilingPointC: 82, freezingPointC: -89,
    category: "solvent", flashPointC: 12, autoIgnitionC: 399 },
  { name: "Toluene", formula: "C₇H₈", boilingPointC: 111, freezingPointC: -95,
    category: "solvent", flashPointC: 4, autoIgnitionC: 480,
    vaporPressureCoeffs: { A: 6.95464, B: 1344.8, C: 219.482, tMin: 10, tMax: 111 } },
  { name: "Benzene", formula: "C₆H₆", boilingPointC: 80, freezingPointC: 6,
    category: "solvent", flashPointC: -11, autoIgnitionC: 498,
    vaporPressureCoeffs: { A: 6.90565, B: 1211.033, C: 220.79, tMin: 8, tMax: 80 } },
  { name: "Xylene", formula: "C₈H₁₀", boilingPointC: 138, freezingPointC: -48,
    category: "solvent", flashPointC: 25, autoIgnitionC: 464 },
  { name: "MEK (Methyl Ethyl Ketone)", formula: "C₄H₈O", boilingPointC: 80, freezingPointC: -87,
    category: "solvent", flashPointC: -9, autoIgnitionC: 404 },
  { name: "MIBK (Methyl Isobutyl Ketone)", formula: "C₆H₁₂O", boilingPointC: 117, freezingPointC: -84,
    category: "solvent", flashPointC: 14, autoIgnitionC: 448 },
  { name: "Ethylene Glycol", formula: "C₂H₆O₂", boilingPointC: 197, freezingPointC: -13,
    category: "solvent", flashPointC: 111, autoIgnitionC: 400 },
  { name: "Glycerine", formula: "C₃H₈O₃", boilingPointC: 290, freezingPointC: 18,
    category: "solvent", flashPointC: 199, autoIgnitionC: 370 },
  { name: "DMF (Dimethylformamide)", formula: "C₃H₇NO", boilingPointC: 153, freezingPointC: -61,
    category: "solvent", flashPointC: 58, autoIgnitionC: 445 },
  { name: "THF (Tetrahydrofuran)", formula: "C₄H₈O", boilingPointC: 66, freezingPointC: -108,
    category: "solvent", flashPointC: -14, autoIgnitionC: 321 },

  // === OILS ===
  { name: "Diesel", boilingPointC: 180, freezingPointC: -30,
    category: "oil", flashPointC: 55, autoIgnitionC: 210,
    vaporPressureCoeffs: { A: 6.98367, B: 1725.0, C: 205.0, tMin: 50, tMax: 180 } },
  { name: "Heavy Fuel Oil", boilingPointC: 350, freezingPointC: 10,
    category: "oil", flashPointC: 100, autoIgnitionC: 270 },
  { name: "Lube Oil", boilingPointC: 300, freezingPointC: -20,
    category: "oil", flashPointC: 180, autoIgnitionC: 280 },
  { name: "Hydraulic Oil", boilingPointC: 280, freezingPointC: -30,
    category: "oil", flashPointC: 160, autoIgnitionC: 300 },
  { name: "Transformer Oil", boilingPointC: 250, freezingPointC: -40,
    category: "oil", flashPointC: 140, autoIgnitionC: 330 },
  { name: "Crude Oil", boilingPointC: 200, freezingPointC: -40,
    category: "oil", flashPointC: -6, autoIgnitionC: 230,
    vaporPressureCoeffs: { A: 6.8, B: 1500, C: 210, tMin: 20, tMax: 200 } },
  { name: "Palm Oil", boilingPointC: 300, freezingPointC: 35,
    category: "oil", flashPointC: 270, autoIgnitionC: 340 },
  { name: "Sunflower Oil", boilingPointC: 315, freezingPointC: -17,
    category: "oil", flashPointC: 275, autoIgnitionC: 360 },
  { name: "Turpentine", boilingPointC: 154, freezingPointC: -60,
    category: "oil", flashPointC: 35, autoIgnitionC: 253 },
  { name: "Kerosene", boilingPointC: 200, freezingPointC: -47,
    category: "oil", flashPointC: 38, autoIgnitionC: 220,
    vaporPressureCoeffs: { A: 6.9, B: 1600, C: 210, tMin: 30, tMax: 200 } },

  // === FUELS ===
  { name: "Gasoline / Petrol", boilingPointC: 95, freezingPointC: -60,
    category: "fuel", flashPointC: -43, autoIgnitionC: 280,
    vaporPressureCoeffs: { A: 6.8, B: 1150, C: 225, tMin: -30, tMax: 95 } },
  { name: "LNG (Liquid)", boilingPointC: -162, freezingPointC: -182,
    category: "cryogenic", flashPointC: -188, autoIgnitionC: 540 },
  { name: "LPG (Liquid)", boilingPointC: -42, freezingPointC: -188,
    category: "cryogenic", flashPointC: -104, autoIgnitionC: 470 },

  // === CHEMICALS ===
  { name: "Chlorine (Liquid)", formula: "Cl₂", boilingPointC: -34, freezingPointC: -102,
    category: "chemical" },
  { name: "Ammonia (Liquid)", formula: "NH₃", boilingPointC: -33, freezingPointC: -78,
    category: "chemical", flashPointC: undefined, autoIgnitionC: 651 },
  { name: "Chloroform", formula: "CHCl₃", boilingPointC: 61, freezingPointC: -64,
    category: "chemical", flashPointC: undefined, autoIgnitionC: 632 },
  { name: "Carbon Tetrachloride", formula: "CCl₄", boilingPointC: 77, freezingPointC: -23,
    category: "chemical" },
  { name: "Brine (20% NaCl)", boilingPointC: 107, freezingPointC: -17,
    category: "chemical" },
  { name: "Hydrogen Peroxide (30%)", formula: "H₂O₂", boilingPointC: 108, freezingPointC: -33,
    category: "chemical" },
  { name: "Ethylene Dichloride", formula: "C₂H₄Cl₂", boilingPointC: 84, freezingPointC: -36,
    category: "chemical", flashPointC: 13, autoIgnitionC: 413 },

  // === FOOD & BEVERAGE ===
  { name: "Milk", boilingPointC: 100, freezingPointC: 0,
    category: "chemical" },
  { name: "Milk (Condensed)", boilingPointC: 102, freezingPointC: -5,
    category: "chemical" },
  { name: "Molasses", boilingPointC: 120, freezingPointC: -10,
    category: "chemical", flashPointC: 150, autoIgnitionC: 300 },
  { name: "Fruit Juice", boilingPointC: 100, freezingPointC: -2,
    category: "chemical" },
  { name: "Sugar Solution (60%)", boilingPointC: 105, freezingPointC: -5,
    category: "chemical" },
  { name: "Beer", boilingPointC: 95, freezingPointC: -3,
    category: "chemical", flashPointC: 13 },
  { name: "Wine", boilingPointC: 92, freezingPointC: -5,
    category: "chemical", flashPointC: 16 },

  // === PHARMA ===
  { name: "Liquid Paraffin", boilingPointC: 300, freezingPointC: 20,
    category: "oil", flashPointC: 185, autoIgnitionC: 290 },
  { name: "Castor Oil", boilingPointC: 313, freezingPointC: -12,
    category: "oil", flashPointC: 229, autoIgnitionC: 340 },
  { name: "Coconut Oil", boilingPointC: 295, freezingPointC: 24,
    category: "oil", flashPointC: 250, autoIgnitionC: 360 },
  { name: "Olive Oil", boilingPointC: 300, freezingPointC: -6,
    category: "oil", flashPointC: 225, autoIgnitionC: 343 },
];

// ─── Lookup Helper ───────────────────────────────────────────────────────

const FLUID_MAP: Record<string, FluidCriticalData> = Object.fromEntries(
  FLUID_CRITICAL_PROPERTIES.map((f) => [f.name, f])
);

export function getFluidCriticalData(name: string): FluidCriticalData | undefined {
  return FLUID_MAP[name];
}

// ─── Water Saturation Temperature at Pressure (bar) ──────────────────────
// IAPWS-IF97 simplified
export function waterSaturationTempC(pressureBar: number): number {
  if (pressureBar <= 0.006) return 0;
  if (pressureBar >= 220) return 374; // critical point
  // Simplified correlation for 0.01 to 100 bar
  const P_MPa = pressureBar / 10;
  const tSat = 647.096 * Math.pow(
    1 + Math.pow(1 - P_MPa / 22.064, 0.4) * 0.65,
    -1
  ) - 273.15;
  return Math.max(0, Math.min(374, tSat));
}
