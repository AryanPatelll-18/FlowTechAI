/**
 * fluidDefaults.ts — Shared fluid property defaults
 * Used by both main sizing section and project extraction.
 * When service is detected but density/viscosity are missing,
 * these defaults ensure sizing can still proceed.
 */

export interface FluidDefaults {
  density: number;      // kg/m³
  viscosity: number;    // cP
  specificGravity: number;
  operatingTemp: number; // °C
}

/** Default fluid properties by service type */
export const SERVICE_DEFAULTS: Record<string, FluidDefaults> = {
  liquid: { density: 998, viscosity: 1.0, specificGravity: 0.998, operatingTemp: 20 },
  gas:    { density: 1.2, viscosity: 0.018, specificGravity: 1.0, operatingTemp: 20 },
  steam:  { density: 3.17, viscosity: 0.014, specificGravity: 0.00317, operatingTemp: 159 },
};

/** Common fluid defaults by fluid name (case-insensitive) */
export const FLUID_NAME_DEFAULTS: Record<string, FluidDefaults> = {
  "water":              { density: 998,  viscosity: 1.0,  specificGravity: 0.998, operatingTemp: 20 },
  "raw water":          { density: 1000, viscosity: 1.0,  specificGravity: 1.0,   operatingTemp: 25 },
  "demineralized water":{ density: 998,  viscosity: 0.9,  specificGravity: 0.998, operatingTemp: 25 },
  "dm water":           { density: 998,  viscosity: 0.9,  specificGravity: 0.998, operatingTemp: 25 },
  "condensate":         { density: 995,  viscosity: 0.7,  specificGravity: 0.995, operatingTemp: 80 },
  "boiler feed water":  { density: 950,  viscosity: 0.3,  specificGravity: 0.95,  operatingTemp: 175 },
  "bfw":                { density: 950,  viscosity: 0.3,  specificGravity: 0.95,  operatingTemp: 175 },
  "air":                { density: 1.2,  viscosity: 0.018,specificGravity: 1.0,   operatingTemp: 20 },
  "nitrogen":           { density: 1.16, viscosity: 0.018,specificGravity: 0.97,  operatingTemp: 20 },
  "oxygen":             { density: 1.33, viscosity: 0.020,specificGravity: 1.11,  operatingTemp: 20 },
  "natural gas":        { density: 0.8,  viscosity: 0.011,specificGravity: 0.67,  operatingTemp: 20 },
  "lpg":                { density: 2.0,  viscosity: 0.010,specificGravity: 1.66,  operatingTemp: 20 },
  "steam":              { density: 3.17, viscosity: 0.014,specificGravity: 0.00317,operatingTemp: 159 },
  "saturated steam":    { density: 3.17, viscosity: 0.014,specificGravity: 0.00317,operatingTemp: 159 },
  "superheated steam":  { density: 2.5,  viscosity: 0.015,specificGravity: 0.0025, operatingTemp: 300 },
  "diesel":             { density: 820,  viscosity: 2.5,  specificGravity: 0.82,  operatingTemp: 20 },
  "fuel oil":           { density: 950,  viscosity: 100,  specificGravity: 0.95,  operatingTemp: 50 },
  "crude oil":          { density: 850,  viscosity: 50,   specificGravity: 0.85,  operatingTemp: 40 },
  "hydraulic oil":      { density: 870,  viscosity: 46,   specificGravity: 0.87,  operatingTemp: 40 },
  "lube oil":           { density: 880,  viscosity: 100,  specificGravity: 0.88,  operatingTemp: 40 },
  "kerosene":           { density: 780,  viscosity: 1.5,  specificGravity: 0.78,  operatingTemp: 20 },
  "acetone":            { density: 790,  viscosity: 0.32, specificGravity: 0.79,  operatingTemp: 20 },
  "alcohol":            { density: 789,  viscosity: 1.2,  specificGravity: 0.789, operatingTemp: 20 },
  "ethanol":            { density: 789,  viscosity: 1.2,  specificGravity: 0.789, operatingTemp: 20 },
  "methanol":           { density: 792,  viscosity: 0.59, specificGravity: 0.792, operatingTemp: 20 },
  "ammonia":            { density: 617,  viscosity: 0.15, specificGravity: 0.617, operatingTemp: -33 },
  "co2":                { density: 1.84, viscosity: 0.015,specificGravity: 1.53,  operatingTemp: 20 },
  "chlorine":           { density: 3.21, viscosity: 0.014,specificGravity: 2.49,  operatingTemp: 20 },
  "hcl":                { density: 1190, viscosity: 1.9,  specificGravity: 1.19,  operatingTemp: 20 },
  "sulphuric acid":     { density: 1840, viscosity: 25,   specificGravity: 1.84,  operatingTemp: 20 },
  "caustic soda":       { density: 1300, viscosity: 40,   specificGravity: 1.3,   operatingTemp: 20 },
  "naoh":               { density: 1300, viscosity: 40,   specificGravity: 1.3,   operatingTemp: 20 },
  "brine":              { density: 1200, viscosity: 2.0,  specificGravity: 1.2,   operatingTemp: 20 },
  "seawater":           { density: 1025, viscosity: 1.1,  specificGravity: 1.025, operatingTemp: 15 },
  "ethylene glycol":    { density: 1110, viscosity: 17,   specificGravity: 1.11,  operatingTemp: 20 },
  "glycerin":           { density: 1260, viscosity: 1400, specificGravity: 1.26,  operatingTemp: 20 },
  "hfo":                { density: 990,  viscosity: 300,  specificGravity: 0.99,  operatingTemp: 50 },
  "molasses":           { density: 1400, viscosity: 5000, specificGravity: 1.4,   operatingTemp: 40 },
  "slurry":             { density: 1200, viscosity: 50,   specificGravity: 1.2,   operatingTemp: 25 },
  "biodiesel":          { density: 880,  viscosity: 4.5,  specificGravity: 0.88,  operatingTemp: 20 },
};

/**
 * Get fluid defaults based on service type and fluid name.
 * First tries to match by fluid name, then falls back to service type defaults.
 */
export function getFluidDefaults(service: string, fluidName: string): FluidDefaults {
  const s = (service || "liquid").toLowerCase().trim();
  const f = (fluidName || "").toLowerCase().trim();

  // Try fluid name match first
  if (f) {
    // Exact match
    if (FLUID_NAME_DEFAULTS[f]) return FLUID_NAME_DEFAULTS[f];
    // Substring match (e.g., "Demineralized Water" → "demineralized water")
    for (const [key, defaults] of Object.entries(FLUID_NAME_DEFAULTS)) {
      if (f.includes(key) || key.includes(f)) return defaults;
    }
  }

  // Fall back to service type defaults
  return SERVICE_DEFAULTS[s] || SERVICE_DEFAULTS.liquid;
}

/**
 * Apply fluid defaults to extracted process conditions.
 * Only fills in values that are 0 or missing.
 */
export function applyFluidDefaults(
  service: string,
  fluidName: string,
  currentDensity: number,
  currentViscosity: number,
  currentTemp: number
): { density: number; viscosity: number; operatingTemp: number; source: string } {
  const defaults = getFluidDefaults(service, fluidName);

  const density = currentDensity > 0 ? currentDensity : defaults.density;
  const viscosity = currentViscosity > 0 ? currentViscosity : defaults.viscosity;
  const operatingTemp = currentTemp > 0 ? currentTemp : defaults.operatingTemp;

  const source = currentDensity > 0 || currentViscosity > 0
    ? "extracted"
    : `default (${fluidName || service})`;

  return { density, viscosity, operatingTemp, source };
}
