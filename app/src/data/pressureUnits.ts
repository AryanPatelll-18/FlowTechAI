// Pressure Unit Conversion Engine
// All internal calculations use BAR ABSOLUTE as the base unit

export type PressureUnit = "bar" | "MPa" | "Pa" | "PSI" | "kg/cm2" | "kPa";

export const PRESSURE_UNITS: PressureUnit[] = ["bar", "MPa", "Pa", "PSI", "kg/cm2", "kPa"];

export const PRESSURE_UNIT_LABELS: Record<PressureUnit, string> = {
  bar: "Bar",
  MPa: "Mega Pascal (MPa)",
  Pa: "Pascal (Pa)",
  PSI: "PSI",
  "kg/cm2": "kg/cm²",
  kPa: "kilo Pascal (kPa)",
};

// Conversion factors TO bar (multiply input value by this to get bar)
const TO_BAR: Record<PressureUnit, number> = {
  bar: 1,
  MPa: 10,
  Pa: 0.00001,
  PSI: 0.0689475729,
  "kg/cm2": 0.980665,
  kPa: 0.01,
};

// Conversion factors FROM bar (multiply bar value by this to get target unit)
const FROM_BAR: Record<PressureUnit, number> = {
  bar: 1,
  MPa: 0.1,
  Pa: 100000,
  PSI: 14.5037738,
  "kg/cm2": 1.019716,
  kPa: 100,
};

/** Convert a pressure value from any unit to bar */
export function toBar(value: number, fromUnit: PressureUnit): number {
  return value * TO_BAR[fromUnit];
}

/** Convert a pressure value from bar to any unit */
export function fromBar(valueInBar: number, toUnit: PressureUnit): number {
  return valueInBar * FROM_BAR[toUnit];
}

/** Format a pressure value with appropriate decimals for the unit */
export function formatPressure(value: number, unit: PressureUnit): string {
  switch (unit) {
    case "Pa":
      return value.toFixed(0);
    case "kPa":
      return value.toFixed(2);
    case "PSI":
      return value.toFixed(2);
    case "kg/cm2":
      return value.toFixed(4);
    case "MPa":
      return value.toFixed(4);
    case "bar":
    default:
      return value.toFixed(3);
  }
}

/** Get a display label showing the conversion for a unit */
export function getUnitHint(unit: PressureUnit): string {
  const barEq = toBar(1, unit);
  if (unit === "bar") return "1 bar = 100 kPa";
  return `1 ${unit} = ${barEq.toFixed(barEq < 0.001 ? 6 : barEq < 1 ? 4 : 3)} bar`;
}
