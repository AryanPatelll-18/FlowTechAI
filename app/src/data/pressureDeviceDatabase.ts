// ============================================================
// Flowtech Pressure Measuring Device Database (Phase IV)
// Products: 3 actual Flowtech-manufactured pressure transmitters
// Source: flowtech-instruments.com product catalogues
// ============================================================

export type PressureDeviceType =
  | "smart_pressure_transmitter"
  | "differential_pressure_transmitter"
  | "miniature_pressure_transmitter";

export type PressureMeasurementType = "gauge" | "absolute" | "differential" | "sealed_gauge";

export interface PressureDeviceData {
  id: string;
  name: string;
  shortName: string;
  type: PressureDeviceType;
  measurementType: PressureMeasurementType[];
  description: string;
  // Process limits
  minPressureRange: number;     // mbar (lower limit of pressure range)
  maxPressureRange: number;     // mbar (upper limit of pressure range)
  minTemperature: number;       // °C (ambient)
  maxTemperature: number;       // °C (ambient)
  minMediaTemp: number;         // °C (process media temperature)
  maxMediaTemp: number;         // °C (process media temperature)
  overPressureLimit: number;    // % of range (overpressure protection)
  burstPressure: number;        // bar
  // Mechanical specs
  processConnection: string[];
  electricalConnection: string[];
  wettedPartsMoc: string[];
  housingMoc: string[];
  diaphragmMoc: string[];
  fillFluid: string[];          // For remote seal / DP
  // Output & accuracy
  outputSignal: string[];       // e.g., ["4-20mA", "HART", "RS485"]
  accuracy: string;             // e.g., "±0.075% of span"
  longTermStability: string;    // e.g., "±0.1% / year"
  turndownRatio: string;        // e.g., "100:1"
  responseTime: string;         // e.g., "<100ms"
  display: string;              // e.g., "LCD with backlight"
  // Certifications & features
  features: string[];
  certifications: string[];     // ATEX, IECEx, SIL, etc.
  protectionClass: string;      // IP rating
  // Application suitability
  suitableFor: {
    liquids: boolean;
    gases: boolean;
    steam: boolean;
    viscousMedia: boolean;
    corrosiveMedia: boolean;
    crystallizingMedia: boolean;
    highTemperature: boolean;
    highPressure: boolean;
    vacuum: boolean;
    pulsatingPressure: boolean;
    hazardousArea: boolean;
    sanitary: boolean;
  };
  notSuitableFor: string[];
  notes: string[];
  status: "active" | "pending";
}

// ============================================================
// 1. SMART PRESSURE TRANSMITTER (Flow-SPT Series)
// ============================================================
export const SMART_PRESSURE_TRANSMITTER: PressureDeviceData = {
  id: "FLOW-SPT",
  name: "Smart Pressure Transmitter",
  shortName: "Smart Pressure Transmitter (Flow-SPT)",
  type: "smart_pressure_transmitter",
  measurementType: ["gauge", "absolute", "differential"],
  description:
    "Flowtech Flow-SPT Series Smart Pressure Transmitter with piezo-resistive and capacitive sensors for gauge, absolute, and differential pressure measurement. 100:1 rangeability, HART communication, ATEX certified, LCD display. Ideal for refineries, petrochemicals, oil & gas, power, chemicals, food, pharma, and water treatment.",
  minPressureRange: -1000,      // -1000 mbar (vacuum capable)
  maxPressureRange: 1000000,    // 1000 bar = 1,000,000 mbar
  minTemperature: -40,
  maxTemperature: 85,           // Ambient
  minMediaTemp: -40,
  maxMediaTemp: 120,            // Process media temp
  overPressureLimit: 200,       // 2x overpressure
  burstPressure: 1000,          // bar
  processConnection: ["1/2\" NPT (F)", "1/4\" NPT (F)", "G1/2\"", "G1/4\"", "Flanged (ANSI/DIN)"],
  electricalConnection: ["1/2\" NPT", "M20x1.5", "DIN 43650", "Terminal block"],
  wettedPartsMoc: ["SS 316L", "Hastelloy C", "Monel", "Tantalum"],
  housingMoc: ["Aluminium die-cast (epoxy coated)", "SS 316"],
  diaphragmMoc: ["SS 316L", "Hastelloy C", "Monel", "Tantalum", "Ceramic"],
  fillFluid: ["Silicone oil", "Fluorinated oil (oxygen safe)", "Neobee (food grade)"],
  outputSignal: ["4-20mA (two-wire)", "HART v7.5", "Foundation Fieldbus", "Profibus PA"],
  accuracy: "±0.075% of calibrated span",
  longTermStability: "±0.1% of URL / year",
  turndownRatio: "100:1",
  responseTime: "<100 ms (adjustable via damping)",
  display: "LCD with backlight — 5-digit display + bargraph",
  features: [
    "Piezo-resistive & capacitive sensor technology",
    "100:1 turndown ratio — flexible range configuration",
    "Two-wire 4-20mA + HART communication",
    "Local LCD display with push-button configuration",
    "Zero and span adjustment via local buttons or HART",
    "Damping adjustable 0-32 seconds",
    "ATEX/IECEx certified for hazardous areas",
    "SIL 2/3 capable (IEC 61508)",
    "Modular design — sensor module replaceable",
    "Status diagnostics — NAMUR NE107",
  ],
  certifications: ["ATEX", "IECEx", "SIL 2/3", "CE", "PED", "IP66/67"],
  protectionClass: "IP66/67 (NEMA 4X)",
  suitableFor: {
    liquids: true, gases: true, steam: true,
    viscousMedia: true, corrosiveMedia: true, crystallizingMedia: true,
    highTemperature: true, highPressure: true, vacuum: true,
    pulsatingPressure: true, hazardousArea: true, sanitary: true,
  },
  notSuitableFor: [
    "Extremely high vacuum (< -1 bar absolute) without absolute pressure variant",
    "Media temperature >120°C without cooling extension or remote seal",
  ],
  notes: [
    "For media temp >120°C: use cooling extension or remote diaphragm seal",
    "For corrosive media: select Hastelloy C or Tantalum diaphragm",
    "For food/pharma: select Neobee fill fluid (food grade)",
    "For oxygen service: select fluorinated fill fluid (oxygen safe)",
    "Mounting: direct to process or via 2/3/5-valve manifold",
  ],
  status: "active",
};

// ============================================================
// 2. DIFFERENTIAL PRESSURE TRANSMITTER
// ============================================================
export const DIFFERENTIAL_PRESSURE_TRANSMITTER: PressureDeviceData = {
  id: "FLOW-DPT",
  name: "Differential Pressure Transmitter",
  shortName: "Differential Pressure Transmitter",
  type: "differential_pressure_transmitter",
  measurementType: ["differential"],
  description:
    "Flowtech Differential Pressure Transmitter for measuring pressure difference between two points. Suitable for flow measurement (orifice/venturi), level measurement (bubbler/diaphragm), and filter monitoring. Advanced technology with robust construction for harsh industrial environments.",
  minPressureRange: -100,       // -100 mbar (bi-directional)
  maxPressureRange: 40000,      // 400 mbar = 40,000 mbar max diff pressure
  minTemperature: -40,
  maxTemperature: 85,
  minMediaTemp: -40,
  maxMediaTemp: 120,
  overPressureLimit: 400,       // 4x overpressure on either side
  burstPressure: 700,           // bar (static line pressure)
  processConnection: ["1/4\" NPT (F)", "1/2\" NPT (F)", "Flanged (ANSI/DIN)"],
  electricalConnection: ["1/2\" NPT", "M20x1.5"],
  wettedPartsMoc: ["SS 316L", "Hastelloy C", "Monel"],
  housingMoc: ["Aluminium die-cast (epoxy coated)", "SS 316"],
  diaphragmMoc: ["SS 316L", "Hastelloy C", "Monel", "Tantalum"],
  fillFluid: ["Silicone oil", "Fluorinated oil (oxygen safe)"],
  outputSignal: ["4-20mA (two-wire)", "HART v7.5", "RS485/Modbus"],
  accuracy: "±0.065% of calibrated span",
  longTermStability: "±0.1% of URL / year",
  turndownRatio: "100:1",
  responseTime: "<90 ms",
  display: "LCD with backlight — dual display (DP + static pressure)",
  features: [
    "Capacitive sensor — high accuracy differential measurement",
    "Static pressure measurement alongside differential pressure",
    "Bi-directional flow measurement (negative DP capable)",
    "4-20mA + HART communication",
    "LCD display with push-button configuration",
    "Zero and span adjustment via local buttons or HART",
    "ATEX/IECEx certified",
    "SIL 2/3 capable",
    "Mounting bracket included for pipe/wall mount",
  ],
  certifications: ["ATEX", "IECEx", "SIL 2/3", "CE", "IP66/67"],
  protectionClass: "IP66/67 (NEMA 4X)",
  suitableFor: {
    liquids: true, gases: true, steam: true,
    viscousMedia: true, corrosiveMedia: true, crystallizingMedia: true,
    highTemperature: true, highPressure: true, vacuum: false,
    pulsatingPressure: true, hazardousArea: true, sanitary: false,
  },
  notSuitableFor: [
    "Gauge/absolute pressure only (this measures DIFFERENCE)",
    "Very low static line pressure (< 1 bar) — accuracy degrades",
  ],
  notes: [
    "Requires 3-valve or 5-valve manifold for installation",
    "Static line pressure max: 700 bar (up to 420 bar for flanged versions)",
    "For high static + low differential: use dual-sensor design",
    "For steam: use condensate pots + impulse lines",
    "For viscous/crystallizing media: use remote diaphragm seals",
    "Mounting position affects zero — compensate during commissioning",
  ],
  status: "active",
};

// ============================================================
// 3. MINIATURE PRESSURE TRANSMITTER (Flow MPT-900)
// ============================================================
export const MINIATURE_PRESSURE_TRANSMITTER: PressureDeviceData = {
  id: "FLOW-MPT-900",
  name: "Miniature Pressure Transmitter",
  shortName: "Miniature Pressure Transmitter (MPT-900)",
  type: "miniature_pressure_transmitter",
  measurementType: ["gauge", "absolute", "sealed_gauge"],
  description:
    "Flowtech Flow MPT-900 Miniature Pressure Transmitter with diffused silicon technology. Compact design for space-constrained installations. Output options: 4-20mA, 0-5V, 0-10V, RS485. Intrinsically safe, reverse polarity protection, digital LCD display. Economical solution for general industrial pressure measurement.",
  minPressureRange: -100,       // -100 mbar (vacuum)
  maxPressureRange: 600000,     // 600 bar = 600,000 mbar
  minTemperature: -20,
  maxTemperature: 70,
  minMediaTemp: -20,
  maxMediaTemp: 85,
  overPressureLimit: 200,       // 2x overpressure
  burstPressure: 900,           // bar
  processConnection: ["G1/4\"", "G1/2\"", "1/4\" NPT", "1/2\" NPT", "M20x1.5"],
  electricalConnection: ["DIN 43650", "Cable outlet", "M12 connector"],
  wettedPartsMoc: ["SS 316L", "SS 304"],
  housingMoc: ["SS 304", "SS 316"],
  diaphragmMoc: ["SS 316L", "Ceramic"],
  fillFluid: ["Silicone oil"],
  outputSignal: ["4-20mA (two-wire)", "0-5V", "0-10V", "RS485/Modbus"],
  accuracy: "±0.25% of full scale (standard), ±0.1% (high accuracy option)",
  longTermStability: "±0.2% of FS / year",
  turndownRatio: "5:1",
  responseTime: "<5 ms",
  display: "4-digit LCD display",
  features: [
    "Diffused silicon sensor technology",
    "Compact and lightweight design",
    "Multiple output signals: 4-20mA, 0-5V, 0-10V, RS485",
    "4-digit LCD display for local reading",
    "Intrinsically safe / explosion-proof options",
    "Reverse polarity and current limiting protection",
    "Economical — cost-effective pressure measurement",
    "CE certified",
  ],
  certifications: ["ATEX/IECEx", "CE", "IP65"],
  protectionClass: "IP65",
  suitableFor: {
    liquids: true, gases: true, steam: false,
    viscousMedia: false, corrosiveMedia: false, crystallizingMedia: false,
    highTemperature: false, highPressure: true, vacuum: true,
    pulsatingPressure: false, hazardousArea: true, sanitary: false,
  },
  notSuitableFor: [
    "Steam service (media temp limited to 85°C)",
    "Highly corrosive media (only SS 316L diaphragm)",
    "Viscous or crystallizing media (no remote seal option)",
    "Media temperature >85°C",
  ],
  notes: [
    "Compact size: ideal for OEM and panel-mounted applications",
    "For corrosive media: consider Smart Pressure Transmitter with Hastelloy diaphragm",
    "Turndown only 5:1 — less flexible than Smart (100:1)",
    "Ambient temp limit: 70°C (lower than Smart at 85°C)",
    "Standard accuracy ±0.25%; High accuracy option ±0.1% available",
  ],
  status: "active",
};

// ─── All Pressure Devices Array ───────────────────────────────────────────
export const ALL_PRESSURE_DEVICES: PressureDeviceData[] = [
  SMART_PRESSURE_TRANSMITTER,
  DIFFERENTIAL_PRESSURE_TRANSMITTER,
  MINIATURE_PRESSURE_TRANSMITTER,
];
