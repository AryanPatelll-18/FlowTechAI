// ============================================================
// Flowtech Level Measuring Device Database (Phase III)
// Products: 8 actual Flowtech-manufactured level devices
// Source: flowtech-instruments.com product catalogues
// ============================================================

export type LevelDeviceType =
  | "side_mounted_magnetic"
  | "top_mounted_magnetic"
  | "reflex_gauge"
  | "transparent_gauge"
  | "tubular_indicator"
  | "float_board_gauge"
  | "hydrostatic_transmitter"
  | "radar_transmitter";

export type LevelOutputType =
  | "visual"           // Visual indication only
  | "switch"           // On/off level switch
  | "transmitter_4_20mA"  // Continuous 4-20mA output
  | "visual_and_switch"
  | "visual_and_transmitter";

export interface LevelDeviceData {
  id: string;
  name: string;
  shortName: string;
  type: LevelDeviceType;
  category: "level_gauge" | "level_transmitter";
  output: LevelOutputType;
  description: string;
  // Process limits
  minMeasuringRange: number;   // mm
  maxMeasuringRange: number;   // mm
  minCCDistance: number;       // mm — minimum centre-to-centre distance (hard reject below)
  minPressure: number;         // bar
  maxPressure: number;         // bar
  minTemperature: number;      // °C
  maxTemperature: number;      // °C
  minDensity: number;          // kg/m³ (for float-based devices)
  maxViscosity?: number;       // cP
  // Mechanical specs
  processConnection: string[];
  mountingType: "side" | "top" | "external";
  bodyMoc: string[];
  floatMoc?: string[];         // Only for float-based devices
  windowMoc?: string;          // Only for glass-based devices
  gasketMoc: string[];
  scaleMoc?: string;
  // Accuracy & features
  accuracy: string;
  repeatability?: string;
  features: string[];
  standards: string[];
  // Application suitability flags
  suitableFor: {
    cleanLiquids: boolean;
    dirtyLiquids: boolean;
    viscousLiquids: boolean;
    corrosiveLiquids: boolean;
    highTemperature: boolean;
    highPressure: boolean;
    foamyLiquids: boolean;
    turbulentLiquids: boolean;
    slurries: boolean;
    cryogenic: boolean;
    coloredLiquids: boolean;     // Can read colored/dark liquids
    solids: boolean;             // Can measure solids/powders
  };
  notSuitableFor: string[];
  notes: string[];
  status: "active" | "pending";
}

// ============================================================
// 1. SIDE MOUNTED MAGNETIC LEVEL GAUGE
// ============================================================
export const SIDE_MOUNTED_MAGNETIC: LevelDeviceData = {
  id: "FMIPL-SMMLI",
  name: "Side Mounted Magnetic Level Gauge",
  shortName: "Side Mounted Magnetic Level Gauge",
  type: "side_mounted_magnetic",
  category: "level_gauge",
  output: "visual_and_transmitter",
  description:
    "Flowtech magnetic level gauge with bi-colour roller or capsule indicator, mounted on the side of the tank. Reliable alternative to glass level gauges. Optional level switches (high/low) and 4-20mA transmitter available. Suitable for aggressive, combustible, toxic, high-pressure and high-temperature liquid storage tanks.",
  minMeasuringRange: 300,
  maxMeasuringRange: 5000,
  minCCDistance: 250,
  minPressure: 0,
  maxPressure: 40,
  minTemperature: -50,
  maxTemperature: 150,
  minDensity: 400,
  maxViscosity: 500,
  processConnection: ["25NB", "40NB", "50NB", "80NB", "Flanged"],
  mountingType: "side",
  bodyMoc: ["SS 316", "SS 304", "Polypropylene", "SS 316 with PTFE lining"],
  floatMoc: ["SS 316", "SS 316L", "Titanium", "PTFE coated"],
  windowMoc: "Borosilicate Glass",
  gasketMoc: ["PTFE", "Viton", "Graphoil"],
  scaleMoc: "Aluminium anodized",
  accuracy: "±5 mm",
  features: [
    "Bi-colour roller or capsule indicator — red (liquid) / white (vapour)",
    "Magnetic field coupling — float to external indicators",
    "No glass in direct contact with process",
    "Optional level switches (SPDT/DPDT, weatherproof/flameproof)",
    "Optional 4-20mA transmitter (magnetostrictive)",
    "Lengths up to 5 meters",
    "Visible from 50+ metres",
  ],
  standards: ["ASME B31.3", "ISO 9001"],
  suitableFor: {
    cleanLiquids: true, dirtyLiquids: true, viscousLiquids: true,
    corrosiveLiquids: true, highTemperature: true, highPressure: true,
    foamyLiquids: false, turbulentLiquids: true, slurries: true,
    cryogenic: true, coloredLiquids: true, solids: false,
  },
  notSuitableFor: [
    "Fluids with high ferrous particle content (magnetic interference)",
    "Extremely low density fluids (<400 kg/m³)",
  ],
  notes: [
    "MOC: SS 316 / SS 304 / PP / SS+PTFE lined",
    "For steam service: use Graphoil gasket + insulation jacket",
    "Centre distance = measuring range + dead zones (150mm)",
    "Optional drain/vent valves, steam jackets, insulation",
  ],
  status: "active",
};

// ============================================================
// 2. TOP MOUNTED MAGNETIC LEVEL GAUGE
// ============================================================
export const TOP_MOUNTED_MAGNETIC: LevelDeviceData = {
  id: "FMIPL-TMMLI",
  name: "Top Mounted Magnetic Level Gauge",
  shortName: "Top Mounted Magnetic Level Gauge",
  type: "top_mounted_magnetic",
  category: "level_gauge",
  output: "visual_and_transmitter",
  description:
    "Flowtech top mounted magnetic level indicator designed for underground tanks. Handles corrosive acids and solvents (sulfuric acid, nitric acid, acetic acid, benzene, acetone, toluene). Float inside tank coupled to external SS pipe with permanent magnet. Bi-color PVC capsule follower provides external indication. Optional level switches and transmitter available.",
  minMeasuringRange: 300,
  maxMeasuringRange: 5000,
  minCCDistance: 250,
  minPressure: 0,
  maxPressure: 16,
  minTemperature: -20,
  maxTemperature: 120,
  minDensity: 450,
  maxViscosity: 300,
  processConnection: ["25NB", "40NB", "50NB", "Flanged (top)"],
  mountingType: "top",
  bodyMoc: ["SS 316", "SS 304", "PVC", "PP"],
  floatMoc: ["SS 316", "SS 316L", "PP", "PTFE"],
  windowMoc: "Borosilicate Glass tube / PVC capsule",
  gasketMoc: ["PTFE", "Viton", "Silicone"],
  scaleMoc: "Aluminium anodized",
  accuracy: "±10 mm",
  features: [
    "Designed for underground tanks",
    "Handles corrosive acids and solvents",
    "Float inside tank + external SS pipe with magnet",
    "Bi-color PVC capsule or roller indicator",
    "Optional level transmitter (weatherproof/flameproof)",
    "Optional high/low level switches",
    "No process contact with indicator system",
  ],
  standards: ["ASME B31.3", "ISO 9001"],
  suitableFor: {
    cleanLiquids: true, dirtyLiquids: false, viscousLiquids: false,
    corrosiveLiquids: true, highTemperature: false, highPressure: false,
    foamyLiquids: false, turbulentLiquids: false, slurries: false,
    cryogenic: false, coloredLiquids: true, solids: false,
  },
  notSuitableFor: [
    "High pressure applications (>16 bar)",
    "High temperature (>120°C)",
    "Dirty or viscous fluids (>300 cP)",
    "Slurries or solids-laden fluids",
    "Turbulent/agitated tanks — float oscillation",
  ],
  notes: [
    "Ideal for underground/covered tanks with top access only",
    "PVC capsule indicator for chemical service",
    "For sulfuric acid, nitric acid, acetic acid service: use PTFE float",
  ],
  status: "active",
};

// ============================================================
// 3. REFLEX LEVEL GAUGE
// ============================================================
export const REFLEX_GAUGE: LevelDeviceData = {
  id: "FMIPL-RLG",
  name: "Reflex Level Gauge",
  shortName: "Reflex Level Gauge",
  type: "reflex_gauge",
  category: "level_gauge",
  output: "visual",
  description:
    "Flowtech Reflex Level Gauge (IBR approved). Uses prismatic glass with 90° grooves — liquid-filled prisms appear dark, vapour-filled prisms reflect light and appear bright/silver. Ideal for high-pressure and high-temperature liquid storage tanks. Suitable for petrochemicals, fertilizers, pharmaceuticals, and chemical industries.",
  minMeasuringRange: 150,
  maxMeasuringRange: 2000,
  minCCDistance: 250,
  minPressure: 0,
  maxPressure: 64,
  minTemperature: -50,
  maxTemperature: 340,
  minDensity: 300,
  maxViscosity: 10000,
  processConnection: ["15NB", "20NB", "25NB", "Flanged (ASME/IBR)"],
  mountingType: "side",
  bodyMoc: ["CS", "SS 316", "SS 304"],
  floatMoc: undefined,
  windowMoc: "Borosilicate / Alumino-Silicate Glass (prismatic)",
  gasketMoc: ["CAF", "Graphoil", "PTFE", "Viton"],
  scaleMoc: "Integral etched on body",
  accuracy: "±1.5 mm",
  features: [
    "Prismatic glass with 90° grooves — natural daylight readable",
    "Liquid appears dark black, vapour appears bright silver",
    "IBR approved for boiler applications",
    "Minimal moving parts — highly reliable",
    "Suitable for high pressure and high temperature",
    "No illumination required (natural daylight sufficient)",
  ],
  standards: ["IBR (Indian Boiler Regulations)", "ASME B31.3", "ISO 9001"],
  suitableFor: {
    cleanLiquids: true, dirtyLiquids: false, viscousLiquids: true,
    corrosiveLiquids: false, highTemperature: true, highPressure: true,
    foamyLiquids: false, turbulentLiquids: true, slurries: false,
    cryogenic: true, coloredLiquids: false, solids: false,
  },
  notSuitableFor: [
    "Colored or dark liquids (reflex effect hidden)",
    "Dirty fluids that coat glass surface",
    "Fluids with suspended solids (blocks prismatic grooves)",
    "Applications requiring electronic output (visual only)",
  ],
  notes: [
    "For COLORED fluids: use Transparent Level Gauge instead",
    "IBR approved — suitable for boiler drum level",
    "Section length: typically 150-340mm per section (joined for longer range)",
    "Natural daylight sufficient; artificial light for night operation",
    "Glass protection: mica shields for steam applications",
  ],
  status: "active",
};

// ============================================================
// 4. TRANSPARENT LEVEL GAUGE
// ============================================================
export const TRANSPARENT_GAUGE: LevelDeviceData = {
  id: "FMIPL-TLG",
  name: "Transparent Level Gauge",
  shortName: "Transparent Level Gauge",
  type: "transparent_gauge",
  category: "level_gauge",
  output: "visual",
  description:
    "Flowtech Transparent Level Gauge (IBR approved). Uses flat transparent glass windows on both sides of chamber — liquid level visible through glass. Suitable for colored fluids, fluids where reflex gauges don't work, and applications requiring external illumination. For high-pressure and high-temperature liquid storage tanks.",
  minMeasuringRange: 150,
  maxMeasuringRange: 2000,
  minCCDistance: 250,
  minPressure: 0,
  maxPressure: 64,
  minTemperature: -50,
  maxTemperature: 340,
  minDensity: 300,
  maxViscosity: 10000,
  processConnection: ["15NB", "20NB", "25NB", "Flanged (ASME/IBR)"],
  mountingType: "side",
  bodyMoc: ["CS", "SS 316", "SS 304"],
  floatMoc: undefined,
  windowMoc: "Borosilicate / Alumino-Silicate Glass (flat)",
  gasketMoc: ["CAF", "Graphoil", "PTFE", "Viton"],
  scaleMoc: "Integral etched on body",
  accuracy: "±1.5 mm",
  features: [
    "Flat transparent glass — clear view of liquid level",
    "Suitable for colored and dark liquids",
    "IBR approved for boiler applications",
    "External illumination can be added for low-light areas",
    "Double-window design for clear visibility",
    "Minimal moving parts — highly reliable",
  ],
  standards: ["IBR (Indian Boiler Regulations)", "ASME B31.3", "ISO 9001"],
  suitableFor: {
    cleanLiquids: true, dirtyLiquids: false, viscousLiquids: true,
    corrosiveLiquids: false, highTemperature: true, highPressure: true,
    foamyLiquids: false, turbulentLiquids: true, slurries: false,
    cryogenic: true, coloredLiquids: true, solids: false,
  },
  notSuitableFor: [
    "Dirty fluids that coat glass surface",
    "Fluids with suspended solids (reduces visibility)",
    "Applications requiring electronic output (visual only)",
  ],
  notes: [
    "For COLORLESS fluids: Reflex Level Gauge is more economical",
    "IBR approved — suitable for boiler drum level",
    "Requires illumination for dark environments (not self-illuminating)",
    "Section length: typically 150-340mm per section (joined for longer range)",
    "Glass protection: mica shields for steam/corrosive applications",
  ],
  status: "active",
};

// ============================================================
// 5. TUBULAR LEVEL INDICATOR
// ============================================================
export const TUBULAR_INDICATOR: LevelDeviceData = {
  id: "FMIPL-TLI",
  name: "Tubular Level Indicator",
  shortName: "Tubular Level Indicator",
  type: "tubular_indicator",
  category: "level_gauge",
  output: "visual",
  description:
    "Flowtech heavy-duty tubular liquid level indicator. Simple, reliable device for direct reading of liquid levels in atmospheric and pressurized tanks (pressures below 5 Kg/cm²). Features bolted gland with Teflon packing for positive leak tightness. Suitable for full vacuum to 5 Kg/cm².",
  minMeasuringRange: 100,
  maxMeasuringRange: 1500,
  minCCDistance: 100,
  minPressure: -1,   // Full vacuum
  maxPressure: 5,    // 5 Kg/cm² standard (hard limit)
  minTemperature: -20,
  maxTemperature: 120,
  minDensity: 300,
  maxViscosity: 5000,
  processConnection: ["15NB", "20NB", "25NB", "Screwed / Flanged"],
  mountingType: "side",
  bodyMoc: ["CS", "SS 316", "SS 304", "Gun Metal"],
  floatMoc: undefined,
  windowMoc: "Borosilicate Glass tube (heavy-duty)",
  gasketMoc: ["PTFE (Teflon)", "Viton", "Neoprene"],
  scaleMoc: "Aluminium with enamel paint",
  accuracy: "±2 mm",
  features: [
    "Direct reading through glass tube",
    "Heavy-duty bolted gland with Teflon packing",
    "Positive leak tightness — full vacuum to 5 Kg/cm²",
    "Simple design — no moving parts",
    "Economical for low-pressure applications",
    "Visible liquid column through full-height glass tube",
  ],
  standards: ["ISO 9001"],
  suitableFor: {
    cleanLiquids: true, dirtyLiquids: true, viscousLiquids: true,
    corrosiveLiquids: false, highTemperature: false, highPressure: false,
    foamyLiquids: true, turbulentLiquids: true, slurries: false,
    cryogenic: false, coloredLiquids: true, solids: false,
  },
  notSuitableFor: [
    "Pressure >5 bar (hard limit)",
    "Temperature >120°C (glass tube limit)",
    "Strongly corrosive fluids (use Magnetic or Reflex instead)",
    "Applications requiring electronic output (visual only)",
  ],
  notes: [
    "HARD LIMIT: Maximum pressure 5 Kg/cm² — cannot be exceeded",
    "Glass tube can be protected with polycarbonate shield",
    "For corrosive fluids: use SS 316 body + PTFE gasket",
    "Replaceable glass tube — easy maintenance",
  ],
  status: "active",
};

// ============================================================
// 6. FLOAT & BOARD LEVEL GAUGE
// ============================================================
export const FLOAT_BOARD_GAUGE: LevelDeviceData = {
  id: "FMIPL-FBLI",
  name: "Float & Board Level Gauge",
  shortName: "Float & Board Level Gauge",
  type: "float_board_gauge",
  category: "level_gauge",
  output: "visual",
  description:
    "Flowtech Float & Board Type Level Indicator. Mechanical level gauge for tall and overhead non-pressurized storage tanks (cone roof, float roof, underground). Large self-centered float connected via rope and pulleys to pointer on marked board. Float available in SS 304, SS 316, PP, PTFE.",
  minMeasuringRange: 1000,
  maxMeasuringRange: 15000,
  minCCDistance: 1000,
  minPressure: 0,     // Non-pressurized
  maxPressure: 2,     // Slightly pressurized max
  minTemperature: -20,
  maxTemperature: 150,
  minDensity: 350,
  maxViscosity: 10000,
  processConnection: ["Guide wire anchor (top)", "Flanged (side overflow)"],
  mountingType: "top",
  bodyMoc: ["SS 304", "SS 316", "PP", "PTFE"],
  floatMoc: ["SS 304", "SS 316", "PP", "PTFE"],
  windowMoc: undefined,
  gasketMoc: ["N/A"],
  scaleMoc: "Aluminium / MS powder coated marked board",
  accuracy: "±20 mm",
  features: [
    "Mechanical indication — no power required",
    "Large float follows liquid level via rope and pulleys",
    "Marked board with pointer for level reading",
    "Suitable for very tall tanks (up to 15m)",
    "Float materials: SS 304, SS 316, PP, PTFE",
    "Two guide wires for tanks >5m height",
  ],
  standards: ["ISO 9001"],
  suitableFor: {
    cleanLiquids: true, dirtyLiquids: true, viscousLiquids: true,
    corrosiveLiquids: true, highTemperature: false, highPressure: false,
    foamyLiquids: true, turbulentLiquids: true, slurries: true,
    cryogenic: false, coloredLiquids: true, solids: false,
  },
  notSuitableFor: [
    "Pressurized tanks (>2 bar)",
    "Hazardous/toxic fluids (open to atmosphere)",
    "Cryogenic applications",
    "Turbulent/agitated tanks without guide wires",
  ],
  notes: [
    "For NON-PRESSURIZED tanks only",
    "Float size designed for specific gravity of liquid",
    "Guide wires recommended for tanks >5m height",
    "Rope: SS wire or nylon depending on chemical compatibility",
    "Pointer board mounted parallel to tank wall",
  ],
  status: "active",
};

// ============================================================
// 7. HYDROSTATIC LEVEL TRANSMITTER
// ============================================================
export const HYDROSTATIC_TRANSMITTER: LevelDeviceData = {
  id: "FMIPL-HLT",
  name: "Hydrostatic Level Transmitter",
  shortName: "Hydrostatic Level Transmitter",
  type: "hydrostatic_transmitter",
  category: "level_transmitter",
  output: "transmitter_4_20mA",
  description:
    "Flowtech hydrostatic level transmitter measures liquid level via static pressure using piezo-resistive pressure sensor in SS housing. Converts static pressure to 4-20mA output. Suitable for water, diesel, gasoline, and mild corrosive liquids. Submersible and fixed installation options.",
  minMeasuringRange: 500,
  maxMeasuringRange: 200000,
  minCCDistance: 500,
  minPressure: 0,
  maxPressure: 100,
  minTemperature: -20,
  maxTemperature: 85,
  minDensity: 600,
  maxViscosity: 10000,
  processConnection: ["Suspended (cable type)", "Flanged", "1\" NPT"],
  mountingType: "external",
  bodyMoc: ["SS 316", "SS 304"],
  floatMoc: undefined,
  windowMoc: undefined,
  gasketMoc: ["N/A"],
  scaleMoc: undefined,
  accuracy: "±0.25% F.S (standard), ±0.1% F.S (high accuracy)",
  repeatability: "±0.1%",
  features: [
    "Piezo-resistive pressure sensor in SS housing",
    "Output: 4-20mA (two-wire), 0-5V, 0-10V",
    "Submersible and fixed installation",
    "Vented cable for atmospheric reference",
    "Intrinsically safe and explosion proof options",
    "CE certified, electromagnetic interference proof",
  ],
  standards: ["CE", "ISO 9001", "Explosion Proof Certificate"],
  suitableFor: {
    cleanLiquids: true, dirtyLiquids: true, viscousLiquids: true,
    corrosiveLiquids: false, highTemperature: false, highPressure: false,
    foamyLiquids: false, turbulentLiquids: true, slurries: false,
    cryogenic: false, coloredLiquids: true, solids: false,
  },
  notSuitableFor: [
    "Open tanks without vented cable arrangement",
    "Liquids with rapidly varying density",
    "Pressurized closed tanks without differential pressure setup",
    "Foaming liquids (pressure reading affected)",
    "Cryogenic temperatures (<-20°C)",
  ],
  notes: [
    "Sensor sits at bottom of tank — measures hydrostatic head",
    "Density must be programmed for accurate level reading",
    "Vented cable provides atmospheric pressure reference",
    "For open tanks: vented cable must not be blocked",
    "For sealed tanks: use differential pressure variant",
  ],
  status: "active",
};

// ============================================================
// 8. RADAR LEVEL TRANSMITTER (NON-CONTACT TYPE)
// ============================================================
export const RADAR_TRANSMITTER: LevelDeviceData = {
  id: "FMIPL-RLT",
  name: "Radar Level Transmitter — Non Contact Type",
  shortName: "Radar Level Transmitter — Non Contact Type",
  type: "radar_transmitter",
  category: "level_transmitter",
  output: "transmitter_4_20mA",
  description:
    "Flowtech Radar Level Transmitter — high-frequency non-contact measuring instrument. Emits narrow microwave pulses that reflect off medium surface and converts to level reading. Measuring range up to 70 meters. Unaffected by temperature, pressure, foam, or vapor. Suitable for liquids and solids in harsh environments.",
  minMeasuringRange: 300,
  maxMeasuringRange: 70000,
  minCCDistance: 500,
  minPressure: -1,
  maxPressure: 100,
  minTemperature: -40,
  maxTemperature: 450,
  minDensity: 100,
  maxViscosity: 10000,
  processConnection: ["1½\" NPT", "2\" NPT", "Flange (ANSI/DIN)"],
  mountingType: "external",
  bodyMoc: ["SS 316", "PVDF", "PP"],
  floatMoc: undefined,
  windowMoc: undefined,
  gasketMoc: ["Viton", "EPDM"],
  scaleMoc: undefined,
  accuracy: "±3 mm (liquids), ±10 mm (solids)",
  repeatability: "±1 mm",
  features: [
    "Non-contact measurement — no wear, no maintenance",
    "Measuring range up to 70 meters",
    "Output: 4-20mA / HART / RS-485 / Modbus",
    "Local LCD display with push-button configuration",
    " Unaffected by temperature, pressure, foam, vapor",
    "Corrosion resistant — suitable for aggressive media",
    "Optimized antenna for inclined solid surfaces",
    "Small measuring blind spot",
  ],
  standards: ["SIL 2", "ATEX/IECEx", "IP67", "CE"],
  suitableFor: {
    cleanLiquids: true, dirtyLiquids: true, viscousLiquids: true,
    corrosiveLiquids: true, highTemperature: true, highPressure: true,
    foamyLiquids: true, turbulentLiquids: true, slurries: true,
    cryogenic: true, coloredLiquids: true, solids: true,
  },
  notSuitableFor: [
    "Very low dielectric constant materials (εr < 1.5)",
    "Internal obstructions blocking beam path",
    "Applications with heavy dust coating antenna",
  ],
  notes: [
    "Antenna type: horn/threaded/parabolic depending on application",
    "Beam angle depends on antenna size (smaller antenna = wider beam)",
    "Dead zone near antenna: typically 100-300mm",
    "For foam: use dynamic echo processing",
    "For solids: use parabolic antenna for best reflection",
    "HART protocol allows remote configuration",
  ],
  status: "active",
};

// ─── All Level Devices Array ──────────────────────────────────────────────
export const ALL_LEVEL_DEVICES: LevelDeviceData[] = [
  SIDE_MOUNTED_MAGNETIC,
  TOP_MOUNTED_MAGNETIC,
  REFLEX_GAUGE,
  TRANSPARENT_GAUGE,
  TUBULAR_INDICATOR,
  FLOAT_BOARD_GAUGE,
  HYDROSTATIC_TRANSMITTER,
  RADAR_TRANSMITTER,
];

// ─── Device Categories for UI ─────────────────────────────────────────────
export const LEVEL_DEVICE_CATEGORIES = [
  { key: "all", label: "All Level Devices" },
  { key: "level_gauge", label: "Level Gauges (Visual)" },
  { key: "level_transmitter", label: "Level Transmitters (4-20mA)" },
  { key: "high_pressure", label: "High Pressure (>40 bar)" },
  { key: "high_temperature", label: "High Temperature (>150°C)" },
  { key: "corrosive", label: "Corrosive Service" },
] as const;
