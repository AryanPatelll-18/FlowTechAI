// Flowtech Factory Qmin/Qmax Tables - Exact data from Flowtech PDF
export interface SizeData {
  size: string;       // e.g. "DN15", "15NB"
  qMin: number;       // Minimum flow rate
  qMax: number;       // Maximum flow rate
  vMin: number;       // Minimum velocity (m/s) - for reference only
  vMax: number;       // Maximum velocity (m/s) - for reference only
  unit: string;       // m³/hr or kg/hr or Nm³/hr
  dpMax: number;      // Pressure loss at Qmax (bar) — used to calculate ΔP at any flow rate
  processConnection?: string;  // Process connection sizes (for rotameters) e.g. "15NB to 100NB"
}

export interface InstallationRequirements {
  straightRunUpstream: string;    // e.g. "10D" (10 pipe diameters)
  straightRunDownstream: string;  // e.g. "5D"
  orientation: string;            // e.g. "Any", "Vertical only", "Horizontal preferred"
  upstreamFilter?: string;        // e.g. "200μm filter REQUIRED", "Recommended"
  bypassRequired?: boolean;       // Bypass valve needed for maintenance
  grounding?: string;             // e.g. "Earthing electrode + ground ring REQUIRED"
  notes?: string[];               // Additional installation notes
}

export interface ProductData {
  name: string;
  service: "liquid" | "gas" | "steam";
  sizes: SizeData[];
  // Accuracy spec: +/- X% of Measured Value (MV)
  // e.g. accuracy: 0.5 means +/- 0.5% MV
  accuracy?: number;
  // Hard limits for product-level validation (independent of size)
  minViscosity?: number;      // cP - reject if BELOW (e.g. Oval Gear min 8 cP)
  maxViscosity?: number;      // cP - reject if ABOVE (e.g. Turbine max 10 cP)
  minDensity?: number;        // kg/m³ - reject if below (LIQUIDS ONLY)
  maxDensity?: number;        // kg/m³
  minPressure?: number;       // bar abs - reject if below (e.g. Vortex min 1 bar)
  minTemp?: number;           // °C
  maxTemp?: number;           // °C
  requiresConductivity?: boolean;  // EM only
  notes?: string;
  status?: "active" | "pending" | "rd";
  // P0: Standards compliance references
  standards?: string[];       // e.g. ["ISO 6817", "IEC 60534"]
  // P0: Installation requirements for reliable measurement
  installation?: InstallationRequirements;
  // P0: Recommended operating envelope for highest reliability
  recommendedTurndown?: number;  // e.g. 10:1, 20:1
  safeOperatingMargin?: number;  // Keep flow within X% of center (e.g. 0.2 = 20-80%)
}

// ===================== ELECTROMAGNETIC FLOWMETER =====================
// Page 3 - Exact Qmin/Qmax at 0.3-5.0 m/s
// HARD LIMITS: Conductive liquids only | Viscosity ≤200 cP (practical) | Density ≥500 kg/m³ | Temp -10 to +100°C (strict)
// Note: The 0.3-5.0 m/s table is calibrated at ≤6 cP reference. For viscosities >6 cP, the Qmin may be slightly
// higher than tabulated. However, EM remains the BEST choice for conductive corrosive fluids (acids, caustic, brines)
// regardless of viscosity because there is no moving part and conductivity is the only requirement.
export const ELECTROMAGNETIC: ProductData = {
  name: "Electromagnetic Flowmeter",
  service: "liquid",
  accuracy: 0.5,  // +/- 0.5% MV — highest accuracy
  requiresConductivity: true,
  maxViscosity: 200,  // Practical limit: all conductive liquids in database are ≤200 cP
  minDensity: 500,
  minTemp: -10,
  maxTemp: 100,  // STRICT: Must be below 100°C
  status: "active",
  standards: ["ISO 6817", "IEC 60534"],
  installation: {
    straightRunUpstream: "5D",
    straightRunDownstream: "3D",
    orientation: "Any (horizontal, vertical, or inclined)",
    grounding: "Earthing electrode + ground ring REQUIRED for non-metallic pipes",
    notes: [
      "Pipe must run FULL — no air pockets above electrodes",
      "For vertical pipes: flow direction should be upward",
      "Avoid installing near strong electromagnetic sources (>25 mT)",
      "Remote transmitter option available for high-temp applications",
    ],
  },
  recommendedTurndown: 20,
  safeOperatingMargin: 0.2,
  sizes: [
    // EMF: negligible ΔP — essentially same as empty pipe (0.001 bar placeholder)
    { size: "15NB", qMin: 0.13, qMax: 2.12, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "20NB", qMin: 0.23, qMax: 3.77, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "25NB", qMin: 0.35, qMax: 5.89, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "32NB", qMin: 0.58, qMax: 9.65, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "40NB", qMin: 0.90, qMax: 15.08, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "50NB", qMin: 1.41, qMax: 23.56, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "65NB", qMin: 2.39, qMax: 39.76, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "80NB", qMin: 3.62, qMax: 60.32, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "100NB", qMin: 5.65, qMax: 94.25, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "125NB", qMin: 8.84, qMax: 147.26, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "150NB", qMin: 12.72, qMax: 212.06, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "200NB", qMin: 22.62, qMax: 377.00, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "250NB", qMin: 35.34, qMax: 589.05, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "300NB", qMin: 50.89, qMax: 848.23, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "350NB", qMin: 69.27, qMax: 1154.50, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "400NB", qMin: 90.48, qMax: 1507.96, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "450NB", qMin: 114.51, qMax: 1908.52, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "500NB", qMin: 141.37, qMax: 2356.19, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "600NB", qMin: 203.58, qMax: 3392.92, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "700NB", qMin: 277.09, qMax: 4618.14, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "800NB", qMin: 361.91, qMax: 6031.86, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "900NB", qMin: 458.04, qMax: 7634.07, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "1000NB", qMin: 565.49, qMax: 9424.78, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "1200NB", qMin: 814.30, qMax: 13571.68, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "1400NB", qMin: 1108.35, qMax: 18472.56, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "1600NB", qMin: 1447.65, qMax: 24127.43, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "1800NB", qMin: 1832.18, qMax: 30536.28, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
    { size: "2000NB", qMin: 2261.95, qMax: 37699.11, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.001 },
  ],
};

// ===================== TURBINE FLOWMETER =====================
// Page 2 - Exact Qmin/Qmax from R&D update
// HARD LIMITS: LIQUIDS ONLY | Viscosity < 10 cP (strict) | Density ≥600 kg/m³
export const TURBINE: ProductData = {
  name: "Turbine Flowmeter",
  service: "liquid",
  accuracy: 1.0,  // +/- 1.0% MV
  maxViscosity: 10,  // STRICT: Must be BELOW 10 cP
  minDensity: 600,
  minTemp: -20,
  maxTemp: 150,
  status: "active",
  standards: ["ISO 9951", "OIML R49"],
  installation: {
    straightRunUpstream: "10D",
    straightRunDownstream: "5D",
    orientation: "Horizontal preferred (avoid vertical-down)",
    upstreamFilter: "200μm filter REQUIRED — rotor damage from particulates",
    bypassRequired: true,
    notes: [
      "NEVER operate without upstream filter — rotor is sensitive to debris",
      "Avoid two-phase flow (gas bubbles) — causes erratic readings",
      "Horizontal: electrodes at 3 & 9 o'clock position",
      "Vertical-up: ensures pipe stays full",
    ],
  },
  recommendedTurndown: 10,
  safeOperatingMargin: 0.2,
  sizes: [
    // Turbine: moderate ΔP, 0.05–0.5 bar at Qmax (rotor drag)
    { size: "15NB (Low)", qMin: 0.30, qMax: 1.80, vMin: 0.5, vMax: 3.0, unit: "m³/hr", dpMax: 0.50 },
    { size: "15NB (High)", qMin: 0.60, qMax: 3.00, vMin: 1.0, vMax: 5.0, unit: "m³/hr", dpMax: 0.50 },
    { size: "20NB", qMin: 0.60, qMax: 4.80, vMin: 0.5, vMax: 4.0, unit: "m³/hr", dpMax: 0.45 },
    { size: "25NB", qMin: 1.00, qMax: 7.50, vMin: 0.5, vMax: 3.8, unit: "m³/hr", dpMax: 0.40 },
    { size: "40NB", qMin: 2.50, qMax: 18.00, vMin: 0.55, vMax: 4.0, unit: "m³/hr", dpMax: 0.35 },
    { size: "50NB", qMin: 4.00, qMax: 30.00, vMin: 0.55, vMax: 4.2, unit: "m³/hr", dpMax: 0.30 },
    { size: "80NB", qMin: 10.00, qMax: 80.00, vMin: 0.55, vMax: 4.4, unit: "m³/hr", dpMax: 0.25 },
    { size: "100NB", qMin: 15.00, qMax: 120.00, vMin: 0.5, vMax: 4.2, unit: "m³/hr", dpMax: 0.22 },
    { size: "150NB", qMin: 30.00, qMax: 300.00, vMin: 0.45, vMax: 4.5, unit: "m³/hr", dpMax: 0.18 },
    { size: "200NB", qMin: 60.00, qMax: 500.00, vMin: 0.5, vMax: 4.2, unit: "m³/hr", dpMax: 0.15 },
    { size: "250NB", qMin: 100.00, qMax: 800.00, vMin: 0.55, vMax: 4.4, unit: "m³/hr", dpMax: 0.12 },
    { size: "300NB", qMin: 150.00, qMax: 1200.00, vMin: 0.55, vMax: 4.7, unit: "m³/hr", dpMax: 0.10 },
  ],
};

// ===================== VORTEX FLOWMETER - LIQUIDS =====================
// Source: Flowtech Vortex Manual Page 6 — Water Measuring Range Table
// Unit: m³/hr (volumetric flow of water at reference conditions)
// HARD LIMITS: Pressure ≥ 1 bar abs (strict) | Viscosity ≤10 cP | Density ≥400 kg/m³
// NOTE: These are calibrated water ranges. For other liquids, Reynolds correction applies.
export const VORTEX_LIQUID: ProductData = {
  name: "Vortex Flowmeter (Liquid)",
  service: "liquid",
  accuracy: 1.0,  // +/- 1.0% MV
  minPressure: 1.0,  // STRICT: Must be ≥ 1.0 bar absolute
  maxViscosity: 10,
  minDensity: 400,
  minTemp: -40,
  maxTemp: 400,
  status: "active",
  standards: ["ISO/TR 15377", "IEC 60534"],
  installation: {
    straightRunUpstream: "15D",
    straightRunDownstream: "5D",
    orientation: "Any (avoid strong vibration sources)",
    notes: [
      "CRITICAL: No pulsating flow — vortex shredding requires stable velocity profile",
      "No mechanical vibration at vortex shedding frequency (can cause false readings)",
      "Minimum pressure 1 bar abs REQUIRED — cavitation below this causes sensor damage",
      "Avoid installation downstream of control valves, pumps, or elbows without adequate straight run",
      "For steam/condensate: ensure pipe is fully dry — wet steam damages piezo sensor",
    ],
  },
  recommendedTurndown: 10,
  safeOperatingMargin: 0.2,
  sizes: [
    // Flowtech Vortex Manual Page 6 — Water Measurement Range (m³/h)
    // vMin/vMax calculated from Qmin/Qmax using pipe inner diameter
    { size: "15NB",  qMin: 0.36,  qMax: 5.07,   vMin: 0.51, vMax: 7.18, unit: "m³/hr", dpMax: 0.80 },
    { size: "20NB",  qMin: 0.81,  qMax: 11.4,   vMin: 0.66, vMax: 9.23, unit: "m³/hr", dpMax: 0.75 },
    { size: "25NB",  qMin: 1.5,   qMax: 12.0,   vMin: 0.75, vMax: 6.00, unit: "m³/hr", dpMax: 0.70 },
    { size: "32NB",  qMin: 1.8,   qMax: 20.0,   vMin: 0.52, vMax: 5.74, unit: "m³/hr", dpMax: 0.65 },
    { size: "40NB",  qMin: 2.04,  qMax: 28.58,  vMin: 0.43, vMax: 6.04, unit: "m³/hr", dpMax: 0.60 },
    { size: "50NB",  qMin: 3.53,  qMax: 49.48,  vMin: 0.45, vMax: 6.35, unit: "m³/hr", dpMax: 0.55 },
    { size: "65NB",  qMin: 5.96,  qMax: 83.6,   vMin: 0.54, vMax: 7.52, unit: "m³/hr", dpMax: 0.50 },
    { size: "80NB",  qMin: 7.74,  qMax: 108.38, vMin: 0.45, vMax: 6.32, unit: "m³/hr", dpMax: 0.45 },
    { size: "100NB", qMin: 13.3,  qMax: 186.22, vMin: 0.45, vMax: 6.29, unit: "m³/hr", dpMax: 0.40 },
    { size: "125NB", qMin: 18.8,  qMax: 333.5,  vMin: 0.40, vMax: 7.18, unit: "m³/hr", dpMax: 0.35 },
    { size: "150NB", qMin: 30.13, qMax: 421.89, vMin: 0.45, vMax: 6.28, unit: "m³/hr", dpMax: 0.30 },
    { size: "200NB", qMin: 52.66, qMax: 737.23, vMin: 0.45, vMax: 6.35, unit: "m³/hr", dpMax: 0.25 },
    { size: "250NB", qMin: 81.43, qMax: 1140.0, vMin: 0.44, vMax: 6.22, unit: "m³/hr", dpMax: 0.20 },
    { size: "300NB", qMin: 114.83,qMax: 1607.6, vMin: 0.44, vMax: 6.18, unit: "m³/hr", dpMax: 0.18 },
  ],
};

// ===================== VORTEX FLOWMETER - GASES =====================
// Source: Flowtech Vortex Manual Page 6 — Air Measuring Range Table
// Unit: Nm³/hr (Normal cubic meters per hour — air at 0°C, 1.01325 bar)
// HARD LIMITS: Pressure ≥ 1 bar abs (strict)
// NOTE: Manual gives Air range in m³/h at reference ≈ Nm³/hr. For other gases,
//       density correction applies: q_gas = q_air × √(ρ_air / ρ_gas_normal).
export const VORTEX_GAS: ProductData = {
  name: "Vortex Flowmeter (Gas)",
  service: "gas",
  accuracy: 1.0,  // +/- 1.0% MV
  minPressure: 1.0,  // STRICT: Must be ≥ 1.0 bar absolute
  minTemp: -40,
  maxTemp: 350,
  status: "active",
  standards: ["ISO/TR 15377", "IEC 60534"],
  installation: {
    straightRunUpstream: "15D",
    straightRunDownstream: "5D",
    orientation: "Any (avoid strong vibration sources)",
    notes: [
      "CRITICAL: Single-phase gas only — liquid droplets or condensation destroys measurement",
      "Install upstream of pressure reducing valves (not downstream)",
      "For wet gases: install demister/mist extractor upstream",
      "No mechanical vibration at vortex shedding frequency",
    ],
  },
  recommendedTurndown: 10,
  safeOperatingMargin: 0.2,
  sizes: [
    // Flowtech Vortex Manual Page 6 — Air Measurement Range (converted to Nm³/hr)
    // vMin/vMax calculated from Qmin/Qmax using pipe inner diameter
    { size: "15NB",  qMin: 4.34,   qMax: 57.91,    vMin: 6.15, vMax: 82.04, unit: "Nm³/hr", dpMax: 0.30 },
    { size: "20NB",  qMin: 6.0,    qMax: 30.0,     vMin: 4.86, vMax: 24.29, unit: "Nm³/hr", dpMax: 0.28 },
    { size: "25NB",  qMin: 9.77,   qMax: 130.29,   vMin: 4.88, vMax: 65.13, unit: "Nm³/hr", dpMax: 0.25 },
    { size: "32NB",  qMin: 10.0,   qMax: 120.0,    vMin: 2.87, vMax: 34.45, unit: "Nm³/hr", dpMax: 0.22 },
    { size: "40NB",  qMin: 24.5,   qMax: 326.63,   vMin: 5.18, vMax: 69.06, unit: "Nm³/hr", dpMax: 0.20 },
    { size: "50NB",  qMin: 42.41,  qMax: 565.49,   vMin: 5.44, vMax: 72.56, unit: "Nm³/hr", dpMax: 0.18 },
    { size: "65NB",  qMin: 61.2,   qMax: 852.2,    vMin: 5.51, vMax: 76.67, unit: "Nm³/hr", dpMax: 0.15 },
    { size: "80NB",  qMin: 92.9,   qMax: 1238.64,  vMin: 5.41, vMax: 72.19, unit: "Nm³/hr", dpMax: 0.13 },
    { size: "100NB", qMin: 159.62, qMax: 2128.3,   vMin: 5.39, vMax: 71.93, unit: "Nm³/hr", dpMax: 0.11 },
    { size: "125NB", qMin: 165.5,  qMax: 2451.2,   vMin: 3.56, vMax: 52.75, unit: "Nm³/hr", dpMax: 0.09 },
    { size: "150NB", qMin: 361.62, qMax: 4821.6,   vMin: 5.39, vMax: 71.81, unit: "Nm³/hr", dpMax: 0.08 },
    { size: "200NB", qMin: 631.9,  qMax: 8425.53,  vMin: 5.44, vMax: 72.53, unit: "Nm³/hr", dpMax: 0.06 },
    { size: "250NB", qMin: 977.16, qMax: 13028.8,  vMin: 5.34, vMax: 71.14, unit: "Nm³/hr", dpMax: 0.05 },
    { size: "300NB", qMin: 1377.9, qMax: 18372.66, vMin: 5.30, vMax: 70.68, unit: "Nm³/hr", dpMax: 0.04 },
  ],
};

// ===================== VORTEX FLOWMETER - STEAM =====================
// Source: Flowtech Vortex Manual Pages 7-8 — Saturated Steam Mass Flow Range Table
// Unit: kg/hr at various absolute pressures (2-20 bar abs)
// Steam uses pressure-dependent interpolation. Page 9 has superheated steam density reference.
// HARD LIMITS: Pressure ≥ 1 bar abs (strict)
export const VORTEX_STEAM: ProductData = {
  name: "Vortex Flowmeter (Steam)",
  service: "steam",
  accuracy: 1.0,  // +/- 1.0% MV
  minPressure: 1.0,  // STRICT: Must be ≥ 1.0 bar absolute
  minTemp: -40,
  maxTemp: 400,
  status: "active",
  notes: "Pressure-dependent sizing. Enter pressure for auto-density lookup.",
  standards: ["ISO/TR 15377", "IEC 60534"],
  installation: {
    straightRunUpstream: "15D",
    straightRunDownstream: "5D",
    orientation: "Horizontal preferred (avoids condensate pooling on sensor)",
    notes: [
      "CRITICAL: Steam must be dry saturated or superheated — wet steam damages piezo sensor",
      "Install steam trap upstream to remove condensate before meter",
      "For superheated steam: ensure temp <400°C (sensor limit)",
      "Horizontal installation: sensor at top of pipe (12 o'clock) to avoid condensate contact",
      "Install insulation around meter body to prevent heat loss and premature condensate formation",
    ],
  },
  recommendedTurndown: 10,
  safeOperatingMargin: 0.2,
  sizes: [
    // Vortex Steam: moderate ΔP, 0.05–0.5 bar at Qmax
    { size: "15NB", qMin: 2.5, qMax: 25.0, vMin: 2.0, vMax: 20.0, unit: "kg/hr", dpMax: 0.50 },
    { size: "20NB", qMin: 4.5, qMax: 45.0, vMin: 2.0, vMax: 20.0, unit: "kg/hr", dpMax: 0.48 },
    { size: "25NB", qMin: 7.0, qMax: 70.0, vMin: 2.0, vMax: 20.0, unit: "kg/hr", dpMax: 0.45 },
    { size: "32NB", qMin: 11.5, qMax: 115.0, vMin: 2.0, vMax: 20.0, unit: "kg/hr", dpMax: 0.42 },
    { size: "40NB", qMin: 18.0, qMax: 180.0, vMin: 2.0, vMax: 20.0, unit: "kg/hr", dpMax: 0.38 },
    { size: "50NB", qMin: 28.0, qMax: 280.0, vMin: 2.0, vMax: 20.0, unit: "kg/hr", dpMax: 0.34 },
    { size: "65NB", qMin: 47.0, qMax: 470.0, vMin: 2.0, vMax: 20.0, unit: "kg/hr", dpMax: 0.30 },
    { size: "80NB", qMin: 72.0, qMax: 720.0, vMin: 2.0, vMax: 20.0, unit: "kg/hr", dpMax: 0.26 },
    { size: "100NB", qMin: 112.0, qMax: 1120.0, vMin: 2.0, vMax: 20.0, unit: "kg/hr", dpMax: 0.22 },
    { size: "125NB", qMin: 175.0, qMax: 1750.0, vMin: 2.0, vMax: 20.0, unit: "kg/hr", dpMax: 0.19 },
    { size: "150NB", qMin: 252.0, qMax: 2520.0, vMin: 2.0, vMax: 20.0, unit: "kg/hr", dpMax: 0.16 },
    { size: "200NB", qMin: 448.0, qMax: 4480.0, vMin: 2.0, vMax: 20.0, unit: "kg/hr", dpMax: 0.13 },
    { size: "250NB", qMin: 700.0, qMax: 7000.0, vMin: 2.0, vMax: 20.0, unit: "kg/hr", dpMax: 0.10 },
    { size: "300NB", qMin: 1008.0, qMax: 10080.0, vMin: 2.0, vMax: 20.0, unit: "kg/hr", dpMax: 0.08 },
  ],
};

// ===================== ULTRASONIC FLOWMETER =====================
export const ULTRASONIC: ProductData = {
  name: "Ultrasonic Flowmeter",
  service: "liquid",
  maxViscosity: 500,
  minDensity: 200,
  minTemp: -40,
  maxTemp: 200,
  status: "pending",
  notes: "Data Pending - awaiting exact Flowtech factory table",
  standards: ["ISO 20456", "ASTM E3131"],
  installation: {
    straightRunUpstream: "10D",
    straightRunDownstream: "5D",
    orientation: "Any (sensors mounted externally on pipe wall)",
    notes: [
      "Pipe wall must be clean and smooth at sensor mounting point",
      "Requires pipe OD and wall thickness for accurate transducer spacing",
      "Avoid pipes with loose liners or heavy corrosion on inner wall",
      "Air bubbles >2% by volume cause signal scatter",
    ],
  },
  recommendedTurndown: 20,
  safeOperatingMargin: 0.2,
  sizes: [
    // Ultrasonic: zero ΔP (no obstruction in flow path)
    { size: "25NB", qMin: 0.5, qMax: 10.0, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.0 },
    { size: "50NB", qMin: 2.0, qMax: 40.0, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.0 },
    { size: "100NB", qMin: 8.0, qMax: 160.0, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.0 },
    { size: "200NB", qMin: 30.0, qMax: 600.0, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.0 },
    { size: "300NB", qMin: 70.0, qMax: 1400.0, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.0 },
    { size: "600NB", qMin: 250.0, qMax: 5000.0, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.0 },
    { size: "1000NB", qMin: 700.0, qMax: 14000.0, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.0 },
  ],
};

// ===================== DIGITAL OVAL GEAR FLOWMETER =====================
// Source: Flowtech Oval Gear Flowmeter Master Sizing Table (DOGFM)
// Sizes: 6NB to 80NB · 8 sizes
// Unit: m³/hr (primary), LPM, LPH also shown
// Accuracy: ±0.5% FSD · Repeatability: ±0.1%
// HARD LIMITS: Viscosity ≥ 9 cP (STRICT — will NOT work below 9 cP) | Density ≥300 kg/m³ | Temp -10 to +150°C
// Service: LIQUIDS ONLY — Oval Gear will NOT work in Gases or Steam
// Pressure Loss: 0.1–0.5 bar at Qmax (gear meshing resistance)
// Best for: Viscous liquids (oils, fuels, chemicals), batching, precise measurement
export const OVAL_GEAR: ProductData = {
  name: "Digital Oval Gear Flowmeter",
  service: "liquid",
  accuracy: 0.5,  // ±0.5% FSD — high accuracy for positive displacement
  minViscosity: 9,   // STRICT: Must be ≥ 9 cP — WILL NOT WORK below 9 cP
  maxViscosity: 1000,
  minDensity: 300,
  minTemp: -10,
  maxTemp: 150,
  status: "active",
  notes: "Positive displacement flowmeter. LIQUIDS ONLY — will NOT work in Gases or Steam. ±0.5% FSD accuracy. REQUIRES viscosity ≥ 9 cP (will NOT work below 9 cP). Best for viscous liquids (oils, fuels, chemicals). Pulsating flow tolerant. No straight pipe runs required. Digital pulse output with display.",
  standards: ["OIML R49", "ISO 4064"],
  installation: {
    straightRunUpstream: "0D",
    straightRunDownstream: "0D",
    orientation: "Any (most accurate when gears are fully wetted)",
    upstreamFilter: "100-200μm filter STRONGLY RECOMMENDED",
    bypassRequired: true,
    notes: [
      "No straight run required — positive displacement is insensitive to flow profile",
      "CRITICAL: Viscosity must be ≥9 cP — water-like liquids cause gear slippage",
      "High-viscosity fluids (>100 cP) may require heated jacket",
      "Install filter upstream to protect precision-machined gears",
      "Bypass valve required for maintenance without process shutdown",
    ],
  },
  recommendedTurndown: 10,
  safeOperatingMargin: 0.2,
  sizes: [
    // Exact Qmin/Qmax from Flowtech Oval Gear Master Table (DOGFM)
    // Pressure loss: 0.1–0.5 bar at Qmax (gear meshing resistance)
    { size: "6NB",  qMin: 0.005, qMax: 0.150, vMin: 0.1, vMax: 1.5, unit: "m³/hr", dpMax: 0.50 },
    { size: "9NB",  qMin: 0.015, qMax: 0.300, vMin: 0.1, vMax: 1.5, unit: "m³/hr", dpMax: 0.48 },
    { size: "15NB", qMin: 0.050, qMax: 1.200, vMin: 0.2, vMax: 2.5, unit: "m³/hr", dpMax: 0.45 },
    { size: "20NB", qMin: 0.150, qMax: 2.000, vMin: 0.2, vMax: 2.5, unit: "m³/hr", dpMax: 0.40 },
    { size: "25NB", qMin: 0.200, qMax: 4.000, vMin: 0.2, vMax: 3.0, unit: "m³/hr", dpMax: 0.35 },
    { size: "40NB", qMin: 0.400, qMax: 10.00, vMin: 0.2, vMax: 3.5, unit: "m³/hr", dpMax: 0.30 },
    { size: "50NB", qMin: 0.600, qMax: 20.00, vMin: 0.2, vMax: 4.0, unit: "m³/hr", dpMax: 0.25 },
    { size: "80NB", qMin: 1.000, qMax: 50.00, vMin: 0.3, vMax: 5.0, unit: "m³/hr", dpMax: 0.20 },
  ],
};

// ===================== GLASS TUBE ROTAMETER — SS 316 FLOAT (LIQUID) =====================
// Source: Flowtech Flow Sizing Master Metal Table (Page 4)
// Principle: Variable Area — float in tapered borosilicate glass tube
// Accuracy: ±2% FSD · Turndown: 10:1 · Max Pressure: 10 bar (PN10)
// Max Temp: 93°C (liquids) / 121°C (gases) · Scale Length: 180-200 mm
// Installation: Vertical only · Flow direction: Bottom to top
// Best practice: Operate at 60-80% of full scale for optimal accuracy
export const GLASS_TUBE_SS316: ProductData = {
  name: "Glass Tube Rotameter (SS316 Float)",
  service: "liquid",
  accuracy: 2.0,  // ±2.0% FSD (Full Scale Deflection) — Flowtech spec
  minTemp: -20,
  maxTemp: 93,    // 93°C max for liquids (borosilicate glass limit)
  notes: "Variable area flowmeter. SS316 float — widest range. For clean, non-turbulent, non-pulsating liquids ONLY. Vertical installation required (bottom-to-top flow). Operate at 60-80% of full scale for best accuracy. 10:1 turndown. Max 10 bar (PN10). Connections: Flanged, Screwed BSP, Triclover, Hose Nipple.",
  status: "active",
  standards: ["VDI/VDE 3513", "ISO 11605"],
  installation: {
    straightRunUpstream: "0D",
    straightRunDownstream: "0D",
    orientation: "VERTICAL ONLY — flow direction bottom-to-top",
    notes: [
      "CRITICAL: Must be installed vertically with flow entering BOTTOM and exiting TOP",
      "Best accuracy at 60-80% of full scale — avoid operating below 10% of scale",
      " pulsating flow causes float oscillation and reading instability",
      "Not suitable for opaque fluids or fluids with suspended solids",
      "For steam/condensate: use metal tube rotameter instead (glass will shatter)",
      "Use needle valve downstream for flow control (never throttle upstream)",
    ],
  },
  recommendedTurndown: 10,
  safeOperatingMargin: 0.3,
  sizes: [
    // Body DIA 30 — Connections 15NB to 100NB
    { size: "PG-1", qMin: 0.005, qMax: 0.050, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.05, processConnection: "15NB to 100NB" },
    { size: "PG-2", qMin: 0.009, qMax: 0.090, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.05, processConnection: "15NB to 100NB" },
    { size: "PG-3", qMin: 0.012, qMax: 0.120, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.04, processConnection: "15NB to 100NB" },
    // Body DIA 38 — Connections 15NB to 100NB
    { size: "PG-4", qMin: 0.030, qMax: 0.300, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.04, processConnection: "15NB to 100NB" },
    { size: "PG-5", qMin: 0.040, qMax: 0.400, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.04, processConnection: "15NB to 100NB" },
    { size: "PG-6", qMin: 0.050, qMax: 0.500, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.04, processConnection: "15NB to 100NB" },
    // Body DIA 43 — Connections 15NB to 100NB
    { size: "PG-7", qMin: 0.070, qMax: 0.700, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.03, processConnection: "15NB to 100NB" },
    { size: "PG-8", qMin: 0.100, qMax: 1.000, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.03, processConnection: "15NB to 100NB" },
    // Body DIA 57 — Connections 15NB to 100NB
    { size: "PG-9", qMin: 0.150, qMax: 1.500, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.03, processConnection: "15NB to 100NB" },
    { size: "PG-10", qMin: 0.220, qMax: 2.200, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.03, processConnection: "15NB to 100NB" },
    // Body DIA 72 — Connections 15NB to 100NB
    { size: "PG-11", qMin: 0.280, qMax: 2.800, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.02, processConnection: "15NB to 100NB" },
    { size: "PG-14", qMin: 0.600, qMax: 6.000, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.02, processConnection: "15NB to 100NB" },
    // Body DIA 94 — Connections 25NB to 100NB
    { size: "PG-16", qMin: 0.900, qMax: 9.000, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.02, processConnection: "25NB to 100NB" },
    // Body DIA 102 — Connections 25NB to 100NB
    { size: "PG-17", qMin: 1.600, qMax: 16.000, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.02, processConnection: "25NB to 100NB" },
    { size: "PG-87", qMin: 3.200, qMax: 32.000, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.015, processConnection: "25NB to 100NB" },
  ],
};

// ===================== GLASS TUBE ROTAMETER — PTFE FLOAT (LIQUID) =====================
// Source: Flowtech Flow Sizing Master Metal Table (Page 4)
// PTFE float for corrosive liquids — chemically inert
// Same body/tube dimensions as SS316, but lighter float → narrower flow range (~40%)
export const GLASS_TUBE_PTFE: ProductData = {
  name: "Glass Tube Rotameter (PTFE Float)",
  service: "liquid",
  accuracy: 2.0,  // ±2.0% FSD (Full Scale Deflection) — Flowtech spec
  minTemp: -20,
  maxTemp: 93,    // 93°C max for liquids (borosilicate glass limit)
  notes: "Variable area flowmeter. PTFE float for corrosive liquids — chemically inert. NARROWER range than SS316 (~40%). For clean, non-turbulent, non-pulsating liquids ONLY. Vertical installation required. Operate at 60-80% of full scale. 10:1 turndown. Max 10 bar (PN10). Connections: Flanged, Screwed BSP, Triclover, Hose Nipple. Ideal for acids, alkalis.",
  status: "active",
  standards: ["VDI/VDE 3513", "ISO 11605"],
  installation: {
    straightRunUpstream: "0D",
    straightRunDownstream: "0D",
    orientation: "VERTICAL ONLY — flow direction bottom-to-top",
    notes: [
      "CRITICAL: Must be installed vertically with flow entering BOTTOM and exiting TOP",
      "Best accuracy at 60-80% of full scale — avoid operating below 10% of scale",
      "PTFE float has ~40% reduced range vs SS316 float — verify sizing covers full flow range",
      "Not suitable for HF or fluorinated acids — PTFE is NOT chemically resistant to these",
      "Use needle valve downstream for flow control",
    ],
  },
  recommendedTurndown: 10,
  safeOperatingMargin: 0.3,
  sizes: [
    // Body DIA 30 — Connections 15NB to 100NB
    { size: "PG-1", qMin: 0.002, qMax: 0.020, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.04, processConnection: "15NB to 100NB" },
    { size: "PG-2", qMin: 0.004, qMax: 0.040, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.04, processConnection: "15NB to 100NB" },
    { size: "PG-3", qMin: 0.006, qMax: 0.060, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.04, processConnection: "15NB to 100NB" },
    // Body DIA 38 — Connections 15NB to 100NB
    { size: "PG-4", qMin: 0.008, qMax: 0.080, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.035, processConnection: "15NB to 100NB" },
    { size: "PG-5", qMin: 0.012, qMax: 0.120, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.035, processConnection: "15NB to 100NB" },
    { size: "PG-6", qMin: 0.020, qMax: 0.200, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.035, processConnection: "15NB to 100NB" },
    // Body DIA 43 — Connections 15NB to 100NB
    { size: "PG-7", qMin: 0.028, qMax: 0.280, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.03, processConnection: "15NB to 100NB" },
    { size: "PG-8", qMin: 0.040, qMax: 0.400, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.03, processConnection: "15NB to 100NB" },
    // Body DIA 57 — Connections 15NB to 100NB
    { size: "PG-9", qMin: 0.060, qMax: 0.600, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.025, processConnection: "15NB to 100NB" },
    { size: "PG-10", qMin: 0.080, qMax: 0.800, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.025, processConnection: "15NB to 100NB" },
    // Body DIA 72 — Connections 15NB to 100NB
    { size: "PG-11", qMin: 0.120, qMax: 1.200, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.02, processConnection: "15NB to 100NB" },
    { size: "PG-14", qMin: 0.250, qMax: 2.500, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.02, processConnection: "15NB to 100NB" },
    // Body DIA 94 — Connections 25NB to 100NB
    { size: "PG-16", qMin: 0.350, qMax: 3.500, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.018, processConnection: "25NB to 100NB" },
    // Body DIA 102 — Connections 25NB to 100NB
    { size: "PG-17", qMin: 0.700, qMax: 7.000, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.015, processConnection: "25NB to 100NB" },
    { size: "PG-87", qMin: 1.400, qMax: 14.000, vMin: 0, vMax: 0, unit: "m³/hr", dpMax: 0.012, processConnection: "25NB to 100NB" },
  ],
};

export const ALL_PRODUCTS: ProductData[] = [
  ELECTROMAGNETIC,
  TURBINE,
  VORTEX_LIQUID,
  VORTEX_GAS,
  VORTEX_STEAM,
  ULTRASONIC,
  OVAL_GEAR,
  // NOTE: Glass Tube Rotameters are NOT in ALL_PRODUCTS — they have their own
  // dedicated sizing section in the Liquid tab (Variable Area, velocity-independent)
];

// Glass Tube Rotameters — separate from normal products (Variable Area, not velocity-based)
export const ROTAMETER_PRODUCTS: ProductData[] = [
  GLASS_TUBE_SS316,
  GLASS_TUBE_PTFE,
];

// Get products for a specific service type
export function getProductsForService(service: "liquid" | "gas" | "steam"): ProductData[] {
  return ALL_PRODUCTS.filter((p) => p.service === service);
}
