// ============================================================
// Master GAD + QAP Library — Complete Flowtech Product Catalog
// 17 products: 6 Flow Meters + 8 Level Devices + 3 Pressure Transmitters
// ============================================================

export type MasterDocType = "gad_master" | "qap_master";

export type ProductFamily =
  | "emf" | "vortex" | "turbine" | "oval_gear" | "rotameter" | "ultrasonic" | "metal_tube_rotameter"
  | "magnetic_level" | "top_mounted_magnetic" | "reflex_level" | "transparent_level"
  | "tubular_level" | "float_board_level" | "radar_level" | "hydrostatic_level"
  | "smart_pressure" | "dp_pressure" | "miniature_pressure"
  | "double_window_sight_glass" | "full_view_sight_glass" | "allen_bolt_sight_glass"
  | "displacer_level_switch" | "side_mounted_level_switch" | "top_mounted_level_switch"
  | "orifice_flange_assembly";

export interface MasterDocument {
  id: string;
  type: MasterDocType;
  productFamily: ProductFamily;
  productName: string;
  title: string;
  description: string;
  revision: string;
  date: string;
  approvedBy: string;
  sections: MasterSection[];
}

export interface MasterSection {
  heading: string;
  fields: MasterField[];
}

export interface MasterField {
  label: string;
  value: string;
  editable: boolean;
  category?: "dimension" | "moc" | "performance" | "electrical" | "mechanical" | "general";
}

export const PRODUCT_FAMILY_LABELS: Record<ProductFamily, string> = {
  emf: "Electromagnetic Flow Meter",
  vortex: "Vortex Flow Meter",
  turbine: "Turbine Flow Meter",
  oval_gear: "Oval Gear Flow Meter",
  rotameter: "Glass Tube Rotameter",
  metal_tube_rotameter: "Metal Tube Rotameter",
  double_window_sight_glass: "Double Window Sight Glass",
  full_view_sight_glass: "Full View Sight Glass",
  allen_bolt_sight_glass: "Allen Bolt Sight Glass",
  orifice_flange_assembly: "Orifice Flange Assembly",
  displacer_level_switch: "Displacer Level Switch",
  side_mounted_level_switch: "Side Mounted Level Switch",
  top_mounted_level_switch: "Top Mounted Level Switch",
  ultrasonic: "Ultrasonic Flow Meter",
  magnetic_level: "Side Mounted Magnetic Level Gauge",
  top_mounted_magnetic: "Top Mounted Magnetic Level Gauge",
  reflex_level: "Reflex Level Gauge",
  transparent_level: "Transparent Level Gauge",
  tubular_level: "Tubular Level Indicator",
  float_board_level: "Float & Board Level Gauge",
  radar_level: "Radar Level Transmitter",
  hydrostatic_level: "Hydrostatic Level Transmitter",
  smart_pressure: "Smart Pressure Transmitter",
  dp_pressure: "Differential Pressure Transmitter",
  miniature_pressure: "Miniature Pressure Transmitter",
};

export const PRODUCT_CATEGORIES = [
  { key: "flow" as const, label: "Flow Meters", families: ["emf", "vortex", "turbine", "oval_gear", "rotameter", "ultrasonic"] as ProductFamily[] },
  { key: "level" as const, label: "Level Devices", families: ["magnetic_level", "top_mounted_magnetic", "reflex_level", "transparent_level", "tubular_level", "float_board_level", "radar_level", "hydrostatic_level"] as ProductFamily[] },
  { key: "pressure" as const, label: "Pressure Transmitters", families: ["smart_pressure", "dp_pressure", "miniature_pressure"] as ProductFamily[] },
];

// ─── Helper ──────────────────────────────────────────────────────────────
const f = (label: string, value: string, editable = true, category: MasterField["category"] = "general"): MasterField => ({
  label, value, editable, category,
});

// ═══════════════════════════════════════════════════════════════════════════
// MASTER GAD LIBRARY — 17 Products
// ═══════════════════════════════════════════════════════════════════════════
export const MASTER_GAD_LIBRARY: MasterDocument[] = [
{
    id: "GAD-EMF-001",
    type: "gad_master" as const,
    productFamily: "emf" as const,
    productName: "Electromagnetic Flow Meter",
    title: "Master GAD — Electromagnetic Flow Meter",
    description: "General Assembly Drawing for Flowtech Electromagnetic Flow Meter with flanged process connections, remote transmitter head, and grounding rings.",
    revision: "Rev.3",
    date: "2025-01-15",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "FT-EMF-2000 Series", false, "general"),
          f("Measuring Principle", "Faraday's Law of Electromagnetic Induction", false, "general"),
          f("Line Sizes", "DN15 to DN1200 (1/2\" to 48\")", true, "dimension"),
          f("Accuracy", "+-0.5% of reading (std), +-0.3% (opt)", false, "performance"),
          f("Max Pressure", "PN40 / Class 300", true, "performance"),
          f("Max Temperature", "150degC (sensor)", true, "performance"),
          f("Flow Velocity", "0.1 to 15 m/s", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Meter Tube", "SS 304 / SS 316", true, "moc"),
          f("Liner", "PTFE / PFA / Hard Rubber / Ceramic", true, "moc"),
          f("Electrodes", "SS 316L / Hastelloy C / Titanium / Tantalum", true, "moc"),
          f("Flanges", "CS IS 2062 / SS 304 / SS 316", true, "moc"),
          f("Transmitter Housing", "Aluminium die-cast (epoxy) / SS 316", true, "moc"),
          f("Gaskets", "PTFE / Viton / EPDM / CAF", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Face-to-Face", "As per ISO 13359", true, "dimension"),
          f("Overall Length", "Refer dimension table", true, "dimension"),
          f("Transmitter Head", "185 mm (std) / 280 mm (remote)", true, "dimension"),
          f("Mounting", "Flanged between pipe line (any orientation)", false, "mechanical"),
          f("Weight", "Refer weight table", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "4-20mA + HART / Pulse / RS485 Modbus", true, "electrical"),
          f("Power Supply", "18-36 VDC / 85-265 VAC (opt)", true, "electrical"),
          f("Display", "LCD backlight + totalizer", true, "electrical"),
          f("Enclosure Rating", "IP66 / IP67 / NEMA 4X", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "Flanged IS 6392 / ANSI B16.5 / DIN EN 1092-1", true, "mechanical"),
          f("Connection Rating", "PN10/16/25/40 / Class 150/300", true, "mechanical"),
          f("Explosion Protection", "Ex d IIC T6 / Ex ia IIC T6 (opt)", true, "general"),
          f("Reference Standards", "ISO 6817, ISO 9104, IEC 60529, IEC 60079", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-VOR-001",
    type: "gad_master" as const,
    productFamily: "vortex" as const,
    productName: "Vortex Flow Meter",
    title: "Master GAD — Vortex Flow Meter",
    description: "General Assembly Drawing for Flowtech Vortex Flow Meter with wafer/flanged construction, piezo-electric sensor, and integral/remote transmitter.",
    revision: "Rev.2",
    date: "2025-02-10",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "FT-VOR-3000 Series", false, "general"),
          f("Measuring Principle", "Von Karman Vortex Street (piezo-electric)", false, "general"),
          f("Line Sizes", "DN15 to DN300 (1/2\" to 12\")", true, "dimension"),
          f("Accuracy", "+-1.0% liquid/gas, +-1.5% steam", false, "performance"),
          f("Max Pressure", "PN40 / Class 300", true, "performance"),
          f("Max Temperature", "350degC (with cooling extension)", true, "performance"),
          f("Flow Velocity", "Liquid 0.3-7 m/s | Gas/Steam 2-80 m/s", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Body", "SS 304 / SS 316 / CF8M", true, "moc"),
          f("Bluff Body", "SS 316L / Hastelloy C", true, "moc"),
          f("Sensor Diaphragm", "SS 316L / Hastelloy C", true, "moc"),
          f("Transmitter Housing", "Aluminium die-cast (epoxy)", true, "moc"),
          f("Gaskets", "Spiral wound SS 316 + Graphite / PTFE", true, "moc"),
          f("O-rings", "Viton / EPDM / FFKM", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Face-to-Face (Flanged)", "ISA S75.04", true, "dimension"),
          f("Face-to-Face (Wafer)", "ISA S75.04 short pattern", true, "dimension"),
          f("Overall Height", "Refer dimension table", true, "dimension"),
          f("Mounting", "Flanged / Wafer (ANSI/DIN/IS)", false, "mechanical"),
          f("Weight", "Refer weight table", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "4-20mA + HART / Pulse / RS485 Modbus", true, "electrical"),
          f("Power Supply", "12-36 VDC (2-wire)", true, "electrical"),
          f("Display", "LCD with backlight + push buttons", true, "electrical"),
          f("Enclosure Rating", "IP66/67, NEMA 4X", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "Flanged / Wafer (ANSI/DIN/IS)", true, "mechanical"),
          f("Connection Rating", "PN16/40 / Class 150/300", true, "mechanical"),
          f("Explosion Protection", "Ex d IIC T6 / Ex ia IIC T6 (opt)", true, "general"),
          f("Reference Standards", "ISO TR 12764, IEC 60529, IEC 60079", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-TUR-001",
    type: "gad_master" as const,
    productFamily: "turbine" as const,
    productName: "Turbine Flow Meter",
    title: "Master GAD — Turbine Flow Meter",
    description: "General Assembly Drawing for Flowtech Turbine Flow Meter with precision rotor, bearings, and pickup coil for clean liquid applications.",
    revision: "Rev.2",
    date: "2025-02-20",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "FT-TUR-4000 Series", false, "general"),
          f("Measuring Principle", "Turbine rotor — velocity proportional to flow rate", false, "general"),
          f("Line Sizes", "DN10 to DN300 (3/8\" to 12\")", true, "dimension"),
          f("Accuracy", "+-0.5% of reading (std), +-0.25% (high accuracy)", false, "performance"),
          f("Max Pressure", "PN100 / Class 600", true, "performance"),
          f("Max Temperature", "150degC (std), 300degC (high temp)", true, "performance"),
          f("Turndown Ratio", "10:1 to 20:1", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Body", "SS 316 / SS 304 / Brass", true, "moc"),
          f("Rotor", "SS 430F / CD4MCU / Rilon", true, "moc"),
          f("Bearings", "Tungsten carbide / Ceramic / PTFE", true, "moc"),
          f("Shaft", "SS 17-4PH / Tungsten carbide", true, "moc"),
          f("Pickup Coil Housing", "SS 316 / Aluminium", true, "moc"),
          f("Gaskets", "PTFE / Viton / Graphoil", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Face-to-Face", "As per manufacturer standard", true, "dimension"),
          f("Overall Length", "Refer dimension table per size", true, "dimension"),
          f("End Connections", "Threaded / Flanged / Tri-clamp", true, "dimension"),
          f("Mounting", "Inline (horizontal preferred)", false, "mechanical"),
          f("Weight", "Refer weight table", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "Pulse / 4-20mA + HART / RS485", true, "electrical"),
          f("Power Supply", "12-36 VDC", true, "electrical"),
          f("Display", "LCD with rate + totalizer", true, "electrical"),
          f("Enclosure Rating", "IP66 / IP67", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "Screwed NPT/BSP / Flanged / Tri-clamp", true, "mechanical"),
          f("Connection Rating", "PN16 to PN100 / Class 150 to 600", true, "mechanical"),
          f("Explosion Protection", "Ex ia IIC T6 (opt)", true, "general"),
          f("Reference Standards", "OIML R49, ISO 4064, IEC 60529", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-OVG-001",
    type: "gad_master" as const,
    productFamily: "oval_gear" as const,
    productName: "Oval Gear Flow Meter",
    title: "Master GAD — Oval Gear Flow Meter",
    description: "General Assembly Drawing for Flowtech Oval Gear Flow Meter with precision-machined oval rotors for high-viscosity liquid measurement.",
    revision: "Rev.1",
    date: "2025-03-05",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "FT-OVG-5000 Series", false, "general"),
          f("Measuring Principle", "Positive displacement — oval gear rotation", false, "general"),
          f("Line Sizes", "DN15 to DN100 (1/2\" to 4\")", true, "dimension"),
          f("Accuracy", "+-0.2% of reading (std), +-0.1% (opt)", false, "performance"),
          f("Max Pressure", "PN100 / 100 bar", true, "performance"),
          f("Max Temperature", "200degC", true, "performance"),
          f("Viscosity Range", "0.3 to 1000 cP (up to 100000 cP opt)", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Body", "Cast iron / SS 316 / Aluminium", true, "moc"),
          f("Oval Rotors", "SS 316 / PPS / Aluminium", true, "moc"),
          f("Bearings", "Tungsten carbide / PEEK", true, "moc"),
          f("Shaft", "SS 316 / Hastelloy C", true, "moc"),
          f("Register / Counter", "Aluminium (mech) / SS (elec)", true, "moc"),
          f("O-rings", "Viton / EPDM / FFKM", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Face-to-Face", "Refer dimension table", true, "dimension"),
          f("Overall Height", "Refer dimension table", true, "dimension"),
          f("Connection Type", "Flanged / Screwed / Tri-clamp", true, "dimension"),
          f("Mounting", "Inline (any orientation)", false, "mechanical"),
          f("Weight", "Refer weight table", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "Mechanical register / Pulse / 4-20mA", true, "electrical"),
          f("Power Supply", "Self-powered (mech) / 12-24 VDC (elec)", true, "electrical"),
          f("Display", "Mechanical counter / LCD", true, "electrical"),
          f("Enclosure Rating", "IP65 / IP67", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "Flanged / Screwed BSP/NPT / Tri-clamp", true, "mechanical"),
          f("Connection Rating", "PN16 to PN100", true, "mechanical"),
          f("Explosion Protection", "Ex ia IIC T6 (opt)", true, "general"),
          f("Reference Standards", "OIML R49-1, ISO 2714, API 1104", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-ROT-001",
    type: "gad_master" as const,
    productFamily: "rotameter" as const,
    productName: "Glass Tube Rotameter",
    title: "Master GAD — Glass Tube Rotameter",
    description: "General Assembly Drawing for Flowtech Glass Tube Rotameter with borosilicate glass tube, SS float, and aluminium scale for local flow indication.",
    revision: "Rev.2",
    date: "2025-03-10",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "FT-ROT-6000 Series", false, "general"),
          f("Measuring Principle", "Variable area — float position proportional to flow", false, "general"),
          f("Tube Sizes", "15 mm to 150 mm OD", true, "dimension"),
          f("Accuracy", "+-1.0% to +-2.0% of FSD", false, "performance"),
          f("Max Pressure", "16 bar (glass) / 40 bar (metal tube opt)", true, "performance"),
          f("Max Temperature", "120degC (glass), 400degC (metal)", true, "performance"),
          f("Flow Range", "0.1 lph to 150000 lph (water)", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Tube", "Borosilicate glass / SS 316 (metal)", true, "moc"),
          f("Float", "SS 316 / SS 316L / PTFE / Titanium", true, "moc"),
          f("End Fittings", "SS 316 / CS / PP / PVC", true, "moc"),
          f("Scale Housing", "Aluminium anodized", true, "moc"),
          f("Guide Rods", "SS 316 / Hastelloy C", true, "moc"),
          f("Gaskets", "PTFE / Viton / EPDM", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Overall Length", "200 mm to 1500 mm", true, "dimension"),
          f("End Connection Size", "15NB to 150NB", true, "dimension"),
          f("Scale Length", "150 mm to 1200 mm", true, "dimension"),
          f("Mounting", "Vertical (flow upward)", false, "mechanical"),
          f("Weight", "0.5 kg to 15 kg", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "Visual indication only (opt: 4-20mA transmitter + switches)", true, "electrical"),
          f("Power Supply", "N/A (visual) / 24 VDC (transmitter opt)", true, "electrical"),
          f("Display", "Direct reading on engraved scale", true, "electrical"),
          f("Enclosure Rating", "IP54 (standard) / IP65 (opt)", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "Screwed / Flanged / Tri-clamp / Hose", true, "mechanical"),
          f("Connection Rating", "PN10/16/25/40", true, "mechanical"),
          f("Explosion Protection", "Ex d IIC T6 (opt with metal tube)", true, "general"),
          f("Reference Standards", "VDI/VDE 3513, ISO 11605, IEC 60529", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-ULT-001",
    type: "gad_master" as const,
    productFamily: "ultrasonic" as const,
    productName: "Ultrasonic Flow Meter",
    title: "Master GAD — Ultrasonic Flow Meter",
    description: "General Assembly Drawing for Flowtech Ultrasonic Flow Meter with clamp-on or inline transducers, transit-time measurement for non-invasive flow measurement.",
    revision: "Rev.1",
    date: "2025-03-15",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "FT-ULT-7000 Series", false, "general"),
          f("Measuring Principle", "Transit-time ultrasonic (clamp-on or inline)", false, "general"),
          f("Pipe Sizes", "DN15 to DN6000 (clamp-on) / DN25 to DN300 (inline)", true, "dimension"),
          f("Accuracy", "+-1.0% of reading (clamp-on), +-0.5% (inline)", false, "performance"),
          f("Max Pressure", "No limit (clamp-on) / PN40 (inline)", true, "performance"),
          f("Max Temperature", "120degC (clamp-on) / 200degC (inline)", true, "performance"),
          f("Flow Velocity", "0.01 to 25 m/s", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Transducer Body", "SS 316 / Aluminium", true, "moc"),
          f("Transducer Window", "PEI / SS 316", true, "moc"),
          f("Cable", "Coaxial with SS armour (up to 200m)", true, "moc"),
          f("Transmitter Housing", "Aluminium die-cast / SS 316", true, "moc"),
          f("Mounting Bracket", "SS 304 / CS epoxy coated", true, "moc"),
          f("Coupling Gel/Pad", "Silicone gel / PTFE pad", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Transducer Dimensions", "45 x 30 x 25 mm (std)", true, "dimension"),
          f("Transmitter Dimensions", "180 x 160 x 100 mm", true, "dimension"),
          f("Cable Length", "5m std (up to 200m optional)", true, "dimension"),
          f("Mounting", "Clamp-on (external) / Inline (spool piece)", false, "mechanical"),
          f("Weight", "0.3 kg (transducer) / 2 kg (transmitter)", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "4-20mA + HART / Pulse / RS485 / BACnet", true, "electrical"),
          f("Power Supply", "24 VDC / Battery (clamp-on portable)", true, "electrical"),
          f("Display", "LCD graphic + data logger", true, "electrical"),
          f("Enclosure Rating", "IP66 / IP67 / NEMA 4X", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "Clamp-on (any pipe) / Flanged (inline)", true, "mechanical"),
          f("Connection Rating", "N/A (clamp) / PN16/25/40 (inline)", true, "mechanical"),
          f("Explosion Protection", "Ex ia IIC T6 (opt)", true, "general"),
          f("Reference Standards", "ISO 20456, OIML R49, IEC 60529", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-SML-001",
    type: "gad_master" as const,
    productFamily: "magnetic_level" as const,
    productName: "Side Mounted Magnetic Level Gauge",
    title: "Master GAD — Side Mounted Magnetic Level Gauge",
    description: "General Assembly Drawing for Flowtech Side Mounted Magnetic Level Gauge with float chamber, magnetic float, bi-colour roller/capsule indicator, optional transmitter/switch.",
    revision: "Rev.4",
    date: "2025-03-01",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "FMIPL-SMMLI Series", false, "general"),
          f("Measuring Principle", "Magnetic coupling between float and external indicator", false, "general"),
          f("Measuring Range", "300 mm to 5000 mm", true, "dimension"),
          f("Accuracy", "+-5 mm (visual)", false, "performance"),
          f("Max Pressure", "40 bar", true, "performance"),
          f("Max Temperature", "150degC (std), 300degC (high temp)", true, "performance"),
          f("Min Fluid Density", "400 kg/m3", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Float Chamber", "SS 316 / SS 304 / PP / SS+PTFE Lined", true, "moc"),
          f("Float", "SS 316L / Titanium / PTFE Coated", true, "moc"),
          f("Indicator Housing", "Aluminium anodized / SS 304", true, "moc"),
          f("Gaskets", "PTFE / Graphoil / Viton / CAF", true, "moc"),
          f("View Window", "Borosilicate Glass tube", true, "moc"),
          f("Roller Scale", "Aluminium anodized engraved", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Chamber OD", "50NB / 65NB", true, "dimension"),
          f("Centre Distance (C-C)", "Range + 2 x 150mm dead zone", true, "dimension"),
          f("Process Connection", "25NB to 80NB Flanged/Screwed", true, "dimension"),
          f("Mounting", "Side mounted (2 connections: top + bottom)", false, "mechanical"),
          f("Weight", "8-12 kg/m (SS 316)", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "Visual (roller/capsule) + opt: 4-20mA / switches", true, "electrical"),
          f("Power Supply", "N/A (visual) / 24 VDC (transmitter)", true, "electrical"),
          f("Display", "Bi-colour red/white rollers or capsule follower", true, "electrical"),
          f("Enclosure Rating", "IP65 / IP66", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "Flanged IS 6392 / ANSI B16.5 / Screwed", true, "mechanical"),
          f("Connection Rating", "PN10/16/25/40", true, "mechanical"),
          f("Explosion Protection", "Ex d IIC T6 (switch/transmitter opt)", true, "general"),
          f("Reference Standards", "ASME B31.3, EN 837, IEC 60529, PED 2014/68/EU", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-TML-001",
    type: "gad_master" as const,
    productFamily: "top_mounted_magnetic" as const,
    productName: "Top Mounted Magnetic Level Gauge",
    title: "Master GAD — Top Mounted Magnetic Level Gauge",
    description: "General Assembly Drawing for Flowtech Top Mounted Magnetic Level Gauge for underground tanks, with float inside tank and external SS pipe with magnetic indicator.",
    revision: "Rev.2",
    date: "2025-03-08",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "FMIPL-TMMLI Series", false, "general"),
          f("Measuring Principle", "Magnetic coupling — float inside tank to external indicator", false, "general"),
          f("Measuring Range", "300 mm to 5000 mm", true, "dimension"),
          f("Accuracy", "+-10 mm (visual)", false, "performance"),
          f("Max Pressure", "16 bar", true, "performance"),
          f("Max Temperature", "120degC", true, "performance"),
          f("Min Fluid Density", "450 kg/m3", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Body / External Pipe", "SS 316 / SS 304 / PVC / PP", true, "moc"),
          f("Float", "SS 316 / SS 316L / PP / PTFE", true, "moc"),
          f("Indicator Capsule", "PVC (chemical service) / SS", true, "moc"),
          f("Gaskets", "PTFE / Viton / Silicone", true, "moc"),
          f("Guide Tube", "SS 316 / SS 304", true, "moc"),
          f("Scale", "Aluminium anodized", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Pipe Diameter", "50NB / 65NB", true, "dimension"),
          f("Overall Length", "Tank depth + 200 mm top extension", true, "dimension"),
          f("Top Connection", "Flanged 25NB to 50NB (top mount)", true, "dimension"),
          f("Mounting", "Top mounted (underground / covered tanks)", false, "mechanical"),
          f("Weight", "6-10 kg/m", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "Visual (PVC capsule / roller) + opt: transmitter/switches", true, "electrical"),
          f("Power Supply", "N/A (visual) / 24 VDC (transmitter)", true, "electrical"),
          f("Display", "Bi-colour PVC capsule or roller indicator", true, "electrical"),
          f("Enclosure Rating", "IP65", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "Flanged (top) 25NB to 50NB", true, "mechanical"),
          f("Connection Rating", "PN10/16", true, "mechanical"),
          f("Explosion Protection", "Ex d / Ex ia (opt)", true, "general"),
          f("Reference Standards", "ASME B31.3, ISO 9001", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-RLG-001",
    type: "gad_master" as const,
    productFamily: "reflex_level" as const,
    productName: "Reflex Level Gauge",
    title: "Master GAD — Reflex Level Gauge",
    description: "General Assembly Drawing for Flowtech Reflex Level Gauge with prismatic glass, IBR approved, for high pressure clear liquid applications.",
    revision: "Rev.3",
    date: "2025-02-25",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "FMIPL-RLG Series", false, "general"),
          f("Measuring Principle", "Prismatic glass — liquid dark, vapour bright (daylight readable)", false, "general"),
          f("Measuring Range", "150 mm to 2000 mm (per section)", true, "dimension"),
          f("Accuracy", "+-1.5 mm", false, "performance"),
          f("Max Pressure", "64 bar", true, "performance"),
          f("Max Temperature", "340degC", true, "performance"),
          f("Min Fluid Density", "300 kg/m3", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Body", "CS / SS 316 / SS 304", true, "moc"),
          f("Prismatic Glass", "Borosilicate / Alumino-Silicate", true, "moc"),
          f("Gaskets", "CAF / Graphoil / PTFE / Viton", true, "moc"),
          f("Bolts / Nuts", "CS Zinc plated / SS 316", true, "moc"),
          f("Shield (Steam)", "Mica (for steam service)", true, "moc"),
          f("Scale", "Integral etched on body", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Section Length", "150-340 mm per section (joined)", true, "dimension"),
          f("Visible Width", "30 mm (prismatic face)", true, "dimension"),
          f("Process Connection", "15NB to 25NB Flanged (ASME/IBR)", true, "dimension"),
          f("Mounting", "Side mounted between vessel connections", false, "mechanical"),
          f("Weight", "5-8 kg/section", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "Visual indication only (daylight readable)", true, "electrical"),
          f("Power Supply", "N/A (self-illuminating via daylight)", true, "electrical"),
          f("Display", "Prismatic — liquid dark black, vapour bright silver", true, "electrical"),
          f("Enclosure Rating", "N/A (glass to atmosphere)", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "Flanged 15NB to 25NB (ASME/IBR)", true, "mechanical"),
          f("Connection Rating", "PN16 to PN64 / Class 150 to 400", true, "mechanical"),
          f("Explosion Protection", "N/A (visual only, no electronics)", true, "general"),
          f("Reference Standards", "IBR (Indian Boiler Regulations), ASME B31.3, ISO 9001", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-TLG-001",
    type: "gad_master" as const,
    productFamily: "transparent_level" as const,
    productName: "Transparent Level Gauge",
    title: "Master GAD — Transparent Level Gauge",
    description: "General Assembly Drawing for Flowtech Transparent Level Gauge with flat glass windows on both sides, IBR approved, for colored/dark liquid applications.",
    revision: "Rev.3",
    date: "2025-02-28",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "FMIPL-TLG Series", false, "general"),
          f("Measuring Principle", "Flat transparent glass — clear view of liquid level", false, "general"),
          f("Measuring Range", "150 mm to 2000 mm (per section)", true, "dimension"),
          f("Accuracy", "+-1.5 mm", false, "performance"),
          f("Max Pressure", "64 bar", true, "performance"),
          f("Max Temperature", "340degC", true, "performance"),
          f("Min Fluid Density", "300 kg/m3", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Body", "CS / SS 316 / SS 304", true, "moc"),
          f("Flat Glass", "Borosilicate / Alumino-Silicate (toughened)", true, "moc"),
          f("Gaskets", "CAF / Graphoil / PTFE / Viton", true, "moc"),
          f("Bolts / Nuts", "CS Zinc plated / SS 316", true, "moc"),
          f("Mica Shield", "Mica (for steam/corrosive)", true, "moc"),
          f("Illumination", "Optional LED floodlight (for dark areas)", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Section Length", "150-340 mm per section (joined)", true, "dimension"),
          f("Visible Width", "30 mm (glass face both sides)", true, "dimension"),
          f("Process Connection", "15NB to 25NB Flanged (ASME/IBR)", true, "dimension"),
          f("Mounting", "Side mounted between vessel connections", false, "mechanical"),
          f("Weight", "6-9 kg/section", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "Visual indication only (colored liquids visible)", true, "electrical"),
          f("Power Supply", "N/A (visual) / 24 VDC (optional LED illumination)", true, "electrical"),
          f("Display", "Clear view through double glass windows", true, "electrical"),
          f("Enclosure Rating", "N/A", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "Flanged 15NB to 25NB (ASME/IBR)", true, "mechanical"),
          f("Connection Rating", "PN16 to PN64 / Class 150 to 400", true, "mechanical"),
          f("Explosion Protection", "N/A (visual only)", true, "general"),
          f("Reference Standards", "IBR, ASME B31.3, ISO 9001", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-TUB-001",
    type: "gad_master" as const,
    productFamily: "tubular_level" as const,
    productName: "Tubular Level Indicator",
    title: "Master GAD — Tubular Level Indicator",
    description: "General Assembly Drawing for Flowtech Tubular Level Indicator with heavy-duty glass tube, bolted gland with Teflon packing, for low-pressure applications.",
    revision: "Rev.2",
    date: "2025-03-12",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "FMIPL-TLI Series", false, "general"),
          f("Measuring Principle", "Direct reading through heavy-duty glass tube", false, "general"),
          f("Measuring Range", "100 mm to 1500 mm", true, "dimension"),
          f("Accuracy", "+-2 mm", false, "performance"),
          f("Max Pressure", "5 bar (HARD LIMIT)", true, "performance"),
          f("Max Temperature", "120degC", true, "performance"),
          f("Min Fluid Density", "300 kg/m3", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("End Fittings", "CS / SS 316 / SS 304 / Gun Metal", true, "moc"),
          f("Glass Tube", "Heavy-duty borosilicate glass", true, "moc"),
          f("Gland Packing", "PTFE (Teflon) / Viton / Neoprene", true, "moc"),
          f("Bolts", "CS Zinc plated / SS 304", true, "moc"),
          f("Scale", "Aluminium with enamel paint", true, "moc"),
          f("Protective Shield", "Polycarbonate tube guard (optional)", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Glass Tube OD", "15 mm to 25 mm", true, "dimension"),
          f("Overall Length", "Range + 50 mm end fittings", true, "dimension"),
          f("Connection Size", "15NB to 25NB Screwed / Flanged", true, "dimension"),
          f("Mounting", "Side mounted", false, "mechanical"),
          f("Weight", "0.5 kg to 5 kg", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "Visual indication only (direct liquid column)", true, "electrical"),
          f("Power Supply", "N/A", true, "electrical"),
          f("Display", "Direct liquid column through glass tube", true, "electrical"),
          f("Enclosure Rating", "N/A", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "Screwed / Flanged 15NB to 25NB", true, "mechanical"),
          f("Connection Rating", "PN6 to PN10 (MAX PN10)", true, "mechanical"),
          f("Explosion Protection", "N/A", true, "general"),
          f("Reference Standards", "ISO 9001", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-FBL-001",
    type: "gad_master" as const,
    productFamily: "float_board_level" as const,
    productName: "Float & Board Level Gauge",
    title: "Master GAD — Float & Board Level Gauge",
    description: "General Assembly Drawing for Flowtech Float & Board Level Gauge with mechanical rope and pulley system for tall non-pressurized tanks.",
    revision: "Rev.2",
    date: "2025-03-18",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "FMIPL-FBLI Series", false, "general"),
          f("Measuring Principle", "Mechanical — float follows level via rope and pulleys to pointer on scale board", false, "general"),
          f("Measuring Range", "1000 mm to 15000 mm", true, "dimension"),
          f("Accuracy", "+-20 mm", false, "performance"),
          f("Max Pressure", "ATMOSPHERIC ONLY (0.5 bar max)", true, "performance"),
          f("Max Temperature", "150degC", true, "performance"),
          f("Min Fluid Density", "350 kg/m3", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Float", "SS 304 / SS 316 / PP / PTFE", true, "moc"),
          f("Rope / Wire", "SS wire / Nylon (chemical dependent)", true, "moc"),
          f("Pulleys", "Nylon / SS 316 (sealed bearings)", true, "moc"),
          f("Scale Board", "Aluminium / MS powder coated", true, "moc"),
          f("Guide Wires", "SS 316 (for tanks >5m)", true, "moc"),
          f("Anchor Brackets", "SS 304 / Galvanized CS", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Float Diameter", "200 mm to 400 mm (SG dependent)", true, "dimension"),
          f("Scale Board Height", "Equal to measuring range", true, "dimension"),
          f("Guide Wire Spacing", "Float diameter + 50 mm", true, "dimension"),
          f("Mounting", "Top mounted (anchor at tank roof)", false, "mechanical"),
          f("Weight", "15-50 kg (depending on range)", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "Mechanical pointer on marked scale board", true, "electrical"),
          f("Power Supply", "No power required", true, "electrical"),
          f("Display", "Pointer on engraved aluminium scale", true, "electrical"),
          f("Enclosure Rating", "IP54", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "Guide wire anchors (top) / Flanged side overflow", true, "mechanical"),
          f("Connection Rating", "N/A (atmospheric)", true, "mechanical"),
          f("Explosion Protection", "N/A (mechanical, no electronics)", true, "general"),
          f("Reference Standards", "ISO 9001", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-RAD-001",
    type: "gad_master" as const,
    productFamily: "radar_level" as const,
    productName: "Radar Level Transmitter",
    title: "Master GAD — Radar Level Transmitter",
    description: "General Assembly Drawing for Flowtech Radar Level Transmitter (non-contact) with horn/threaded/parabolic antenna options, up to 70m range.",
    revision: "Rev.2",
    date: "2025-03-20",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "FMIPL-RLT Series", false, "general"),
          f("Measuring Principle", "High-frequency microwave pulse — time-of-flight measurement", false, "general"),
          f("Measuring Range", "300 mm to 70000 mm (70m)", true, "dimension"),
          f("Accuracy", "+-3 mm (liquids), +-10 mm (solids)", false, "performance"),
          f("Max Pressure", "100 bar (process seal)", true, "performance"),
          f("Max Temperature", "450degC (process)", true, "performance"),
          f("Min Dielectric", "epsilonr > 1.5 (liquids), epsilonr > 2.0 (solids)", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Housing", "SS 316 / PVDF / PP", true, "moc"),
          f("Antenna", "SS 316 / PP (horn, threaded, parabolic)", true, "moc"),
          f("Process Seal", "Viton / FFKM / Graphite", true, "moc"),
          f("Mounting Flange", "SS 316 / CS (ANSI/DIN)", true, "moc"),
          f("Cable Entry", "11/2\" NPT / 2\" NPT / M20x1.5", true, "moc"),
          f("Display Window", "Polycarbonate (shatterproof)", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Housing Diameter", "84 mm", true, "dimension"),
          f("Antenna Length (Horn)", "100 mm to 400 mm (by size)", true, "dimension"),
          f("Dead Zone (Near Blanking)", "100 mm to 300 mm (antenna dependent)", true, "dimension"),
          f("Mounting", "Top mounted (nozzle / flange)", false, "mechanical"),
          f("Weight", "2.5 kg to 8 kg (antenna dependent)", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "4-20mA / HART / RS-485 / Modbus / Foundation Fieldbus", true, "electrical"),
          f("Power Supply", "2-wire 24 VDC / 4-wire 230 VAC", true, "electrical"),
          f("Display", "LCD graphic with local configuration", true, "electrical"),
          f("Enclosure Rating", "IP66 / IP67 / NEMA 4X", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "11/2\" NPT / 2\" NPT / Flange (ANSI/DIN)", true, "mechanical"),
          f("Connection Rating", "PN16 to PN100 / Class 150 to 600", true, "mechanical"),
          f("Explosion Protection", "ATEX / IECEx (Ex d, Ex ia, Ex n)", true, "general"),
          f("Reference Standards", "SIL 2, ATEX/IECEx, IP67, IEC 60529, IEC 61508", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-HLT-001",
    type: "gad_master" as const,
    productFamily: "hydrostatic_level" as const,
    productName: "Hydrostatic Level Transmitter",
    title: "Master GAD — Hydrostatic Level Transmitter",
    description: "General Assembly Drawing for Flowtech Hydrostatic Level Transmitter with piezo-resistive sensor, submersible design, for water/wastewater applications.",
    revision: "Rev.1",
    date: "2025-03-22",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "FMIPL-HLT Series", false, "general"),
          f("Measuring Principle", "Piezo-resistive — hydrostatic pressure = liquid head", false, "general"),
          f("Measuring Range", "500 mm to 200 m WC", true, "dimension"),
          f("Accuracy", "+-0.25% F.S (std), +-0.1% (high accuracy)", false, "performance"),
          f("Max Overpressure", "2x rated (burst 900 bar)", true, "performance"),
          f("Max Media Temperature", "85degC (media) / 70degC (ambient)", true, "performance"),
          f("Min Fluid Density", "600 kg/m3", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Sensor Body", "SS 316 / SS 316L / Titanium", true, "moc"),
          f("Diaphragm", "SS 316L / Ceramic", true, "moc"),
          f("Cable", "PUR / FEP with Kevlar strain relief", true, "moc"),
          f("Housing", "SS 316 / Aluminium", true, "moc"),
          f("Seals", "Viton / EPDM / FFKM", true, "moc"),
          f("Cable Gland", "Nickel-plated brass IP68", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Sensor Diameter", "22 mm to 30 mm", true, "dimension"),
          f("Sensor Length", "120 mm to 180 mm", true, "dimension"),
          f("Cable Diameter", "7.5 mm (with vent tube)", true, "dimension"),
          f("Mounting", "Suspended (submersible) / Flanged (fixed)", false, "mechanical"),
          f("Weight", "0.5 kg (sensor) + cable weight", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "4-20mA (2-wire) / 0-5V / 0-10V / RS485", true, "electrical"),
          f("Power Supply", "12-36 VDC", true, "electrical"),
          f("Display", "4-digit LCD (optional)", true, "electrical"),
          f("Enclosure Rating", "IP68 (continuous submersion) / IP65 (fixed)", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "Suspended (cable) / Flanged / 1\" NPT", true, "mechanical"),
          f("Connection Rating", "PN10 to PN100", true, "mechanical"),
          f("Explosion Protection", "Ex ia IIC T6 (opt)", true, "general"),
          f("Reference Standards", "CE, ISO 9001, IEC 60529, IEC 60079", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-SPT-001",
    type: "gad_master" as const,
    productFamily: "smart_pressure" as const,
    productName: "Smart Pressure Transmitter",
    title: "Master GAD — Smart Pressure Transmitter",
    description: "General Assembly Drawing for Flowtech Flow-SPT Smart Pressure Transmitter with piezo-resistive/capacitive sensor, 100:1 turndown, HART communication.",
    revision: "Rev.2",
    date: "2025-01-20",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "Flow-SPT Series", false, "general"),
          f("Measuring Principle", "Piezo-resistive (silicon) / Capacitive (ceramic)", false, "general"),
          f("Pressure Range", "-1 to 1000 bar", true, "dimension"),
          f("Accuracy", "+-0.075% of calibrated span", false, "performance"),
          f("Overpressure Limit", "2x range (burst 1000 bar)", true, "performance"),
          f("Max Media Temperature", "120degC (direct) / 300degC (cooling ext.)", true, "performance"),
          f("Turndown Ratio", "100:1", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Process Diaphragm", "SS 316L / Hastelloy C / Tantalum / Ceramic", true, "moc"),
          f("Process Connection", "SS 316L / Hastelloy C", true, "moc"),
          f("Housing", "Aluminium die-cast (epoxy) / SS 316", true, "moc"),
          f("Fill Fluid", "Silicone oil / Fluorinated / Neobee", true, "moc"),
          f("O-rings", "Viton / EPDM / FFKM (Kalrez)", true, "moc"),
          f("Cable Glands", "Nickel-plated brass / SS 316", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Housing Diameter", "84 mm", true, "dimension"),
          f("Housing Height", "185 mm (without process conn.)", true, "dimension"),
          f("Process Connection", "1/2\" NPT / G1/2\" / 1/4\" NPT", true, "dimension"),
          f("Mounting", "Pipe mount (2\" pipe) / Wall mount / Direct", false, "mechanical"),
          f("Weight", "1.2 kg (Al) / 2.5 kg (SS)", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "4-20mA + HART / Foundation Fieldbus / Profibus PA", true, "electrical"),
          f("Power Supply", "12-45 VDC (4-20mA) / 9-32 VDC (Fieldbus)", true, "electrical"),
          f("Display", "LCD graphic — 5 digits + bargraph + units", true, "electrical"),
          f("Enclosure Rating", "IP66 / IP67 / NEMA 4X", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "1/2\" NPT (F) / G1/2\" / Flanged (ANSI/DIN)", true, "mechanical"),
          f("Connection Rating", "PN16 to PN400 / Class 150 to 2500", true, "mechanical"),
          f("Explosion Protection", "Ex d IIC T6 / Ex ia IIC T6 / SIL 2/3", true, "general"),
          f("Reference Standards", "ATEX, IECEx, SIL 2/3, CE, PED, IEC 60529, IEC 61508", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-DPT-001",
    type: "gad_master" as const,
    productFamily: "dp_pressure" as const,
    productName: "Differential Pressure Transmitter",
    title: "Master GAD — Differential Pressure Transmitter",
    description: "General Assembly Drawing for Flowtech Differential Pressure Transmitter with capacitive sensor for DP, flow, and level applications.",
    revision: "Rev.2",
    date: "2025-01-22",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "Flow-DPT Series", false, "general"),
          f("Measuring Principle", "Capacitive sensor — differential pressure measurement", false, "general"),
          f("DP Range", "-100 mbar to 400 mbar", true, "dimension"),
          f("Accuracy", "+-0.065% of calibrated span", false, "performance"),
          f("Static Line Pressure", "700 bar (420 bar flanged)", true, "performance"),
          f("Max Media Temperature", "120degC", true, "performance"),
          f("Overpressure Protection", "4x on either side", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Process Diaphragm", "SS 316L / Hastelloy C / Tantalum", true, "moc"),
          f("Process Connection", "SS 316L / Hastelloy C", true, "moc"),
          f("Housing", "Aluminium die-cast (epoxy) / SS 316", true, "moc"),
          f("Fill Fluid", "Silicone oil / Fluorinated oil", true, "moc"),
          f("O-rings", "Viton / EPDM", true, "moc"),
          f("Mounting Bracket", "SS 304 (pipe/wall mount)", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Housing Dimensions", "84 mm dia x 185 mm height", true, "dimension"),
          f("Process Connection", "1/4\" NPT (F) / 1/2\" NPT (F) / Flanged", true, "dimension"),
          f("Mounting Bracket", "For 2\" pipe or wall", true, "dimension"),
          f("Mounting", "Pipe/wall mount (bracket incl.) / Manifold mount", false, "mechanical"),
          f("Weight", "1.5 kg (without manifold)", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "4-20mA + HART / RS485 Modbus", true, "electrical"),
          f("Power Supply", "12-36 VDC", true, "electrical"),
          f("Display", "LCD with dual display (DP + static pressure)", true, "electrical"),
          f("Enclosure Rating", "IP66 / IP67 / NEMA 4X", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "1/4\" NPT / 1/2\" NPT / Flanged (ANSI/DIN)", true, "mechanical"),
          f("Connection Rating", "PN16 to PN420 / Class 150 to 2500", true, "mechanical"),
          f("Explosion Protection", "Ex d IIC T6 / Ex ia IIC T6 / SIL 2/3", true, "general"),
          f("Reference Standards", "ATEX, IECEx, SIL 2/3, CE, IEC 60529, IEC 61508", false, "general"),
        ],
      },
    ],
  },
{
    id: "GAD-MPT-001",
    type: "gad_master" as const,
    productFamily: "miniature_pressure" as const,
    productName: "Miniature Pressure Transmitter",
    title: "Master GAD — Miniature Pressure Transmitter",
    description: "General Assembly Drawing for Flowtech MPT-900 Miniature Pressure Transmitter, compact design for OEM and space-constrained installations.",
    revision: "Rev.1",
    date: "2025-01-25",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "1. General Specifications",
        fields: [
          f("Model Series", "Flow-MPT-900 Series", false, "general"),
          f("Measuring Principle", "Diffused silicon piezo-resistive", false, "general"),
          f("Pressure Range", "-1 to 600 bar", true, "dimension"),
          f("Accuracy", "+-0.25% F.S (std), +-0.1% (high accuracy opt)", false, "performance"),
          f("Overpressure Limit", "2x range (burst 900 bar)", true, "performance"),
          f("Max Media Temperature", "85degC", true, "performance"),
          f("Response Time", "<5 ms", false, "performance"),
        ],
      },
      {
        heading: "2. Materials of Construction",
        fields: [
          f("Process Connection / Body", "SS 316L / SS 304", true, "moc"),
          f("Diaphragm", "SS 316L / Ceramic", true, "moc"),
          f("Housing", "SS 304 / SS 316", true, "moc"),
          f("Electrical Connection", "DIN 43650 / Cable / M12", true, "moc"),
          f("Seals", "Viton / EPDM / NBR", true, "moc"),
          f("Cable (if applicable)", "PUR / Silicone", true, "moc"),
        ],
      },
      {
        heading: "3. Mechanical Dimensions",
        fields: [
          f("Body Diameter", "22 mm", true, "dimension"),
          f("Body Length", "55 mm (without connector)", true, "dimension"),
          f("Hex Size", "22 mm A/F", true, "dimension"),
          f("Mounting", "Direct thread mount (any orientation)", false, "mechanical"),
          f("Weight", "0.05 kg to 0.1 kg", true, "mechanical"),
        ],
      },
      {
        heading: "4. Electrical / Output Specifications",
        fields: [
          f("Output Signal", "4-20mA / 0-5V / 0-10V / RS485", true, "electrical"),
          f("Power Supply", "8-32 VDC (4-20mA) / 12-30 VDC (voltage)", true, "electrical"),
          f("Display", "4-digit LCD (optional)", true, "electrical"),
          f("Enclosure Rating", "IP65 / IP67", false, "electrical"),
        ],
      },
      {
        heading: "5. Process Connections & Certifications",
        fields: [
          f("Process Connection", "G1/4\" / G1/2\" / 1/4\" NPT / 1/2\" NPT / M20x1.5", true, "mechanical"),
          f("Connection Rating", "PN16 to PN400", true, "mechanical"),
          f("Explosion Protection", "Ex ia IIC T6 (opt)", true, "general"),
          f("Reference Standards", "CE, ATEX/IECEx, IP65, IEC 60529", false, "general"),
        ],
      },
    ],
  },
];


// ═══════════════════════════════════════════════════════════════════════════
// MASTER QAP LIBRARY — 3 Product Categories
// ═══════════════════════════════════════════════════════════════════════════
export const MASTER_QAP_LIBRARY: MasterDocument[] = [
  // ─── Flow Meters QAP ────────────────────────────────────────────────────
  {
    id: "QAP-FLOW-001",
    type: "qap_master" as const,
    productFamily: "emf",
    productName: "Flow Meters (All Types)",
    title: "Master QAP — Flow Meter Manufacturing",
    description: "Quality Assurance Plan for Flowtech Flow Meter manufacturing covering EMF, Vortex, Turbine, Oval Gear, Ultrasonic, and Rotameter product families.",
    revision: "Rev.5",
    date: "2025-01-10",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "Stage 1: Raw Material Inspection",
        fields: [
          f("1.1 MTC Review", "Review material test certificates for SS 316L body, liner, electrodes. Verify chemical composition, mechanical properties, and heat treatment per EN 10204 3.1/3.2. Record traceable batch numbers.", true, "general"),
          f("1.2 PMI Test", "Positive Material Identification for all wetted parts. XRF analyzer — verify SS 316L, Hastelloy C, Titanium as specified.", true, "general"),
          f("1.3 Dimensional Check", "Incoming inspection: tube ID/OD, flange PCD, face-to-face, electrode spacing. Tolerance: +-0.5 mm on critical dimensions.", true, "dimension"),
          f("1.4 Liner Inspection", "PTFE/PFA liner: check thickness uniformity (+-0.2 mm), adhesion test (peel strength >5 N/mm), pin-hole detection (15kV spark test).", true, "general"),
          f("1.5 Electrode Inspection", "Electrode surface finish Ra <0.8 um. Check runout <0.05 mm. Insulation resistance >100 MOhms (electrode to body).", true, "general"),
        ],
      },
      {
        heading: "Stage 2: In-Process Inspection",
        fields: [
          f("2.1 Welding", "TIG welding of flanges to meter tube. WPS/PQR qualified per ASME IX. Welder WPQ valid. Visual inspection per AWS D1.1. DPT on all welds.", true, "general"),
          f("2.2 Liner Moulding", "PTFE liner: compression moulding at 380degC, sintering cycle verified. PFA liner: injection moulding parameters recorded. 100% spark test at 15kV.", true, "general"),
          f("2.3 Electrode Assembly", "Electrode insertion depth +-0.2 mm. Torque: 15-20 Nm. Seal integrity: 25 bar hydrostatic test for 30 min (no leak).", true, "general"),
          f("2.4 Coil Assembly (EMF)", "Excitation coil winding: turns count, resistance, inductance within +-5%. Coil symmetry test: <0.5% imbalance. Potting: epoxy vacuum impregnation.", true, "electrical"),
          f("2.5 Electronics Assembly", "PCB visual inspection (IPC-A-610 Class 2). Component placement verification. Solder joint inspection. Functional test at board level.", true, "electrical"),
        ],
      },
      {
        heading: "Stage 3: Final Testing",
        fields: [
          f("3.1 Hydrostatic Test", "1.5 x design pressure for 15 min (min 25 bar). No leakage, no permanent deformation. Witnessed by QA. Record pressure vs time graph.", true, "performance"),
          f("3.2 Calibration & Accuracy Test", "Wet calibration on gravimetric test rig (min 5 points: 10%, 25%, 50%, 75%, 100% of range). Accuracy within +-0.5% of reading. Calibration certificate issued.", true, "performance"),
          f("3.3 Zero Flow Test", "Zero stability check: drift <0.05 m/s over 30 min. Empty pipe detection functional test.", true, "performance"),
          f("3.4 Electrical Safety Test", "Hi-pot test: 1500V AC for 1 min (isolation). Insulation resistance >100 MOhms. Ground continuity <0.1 Ohms.", true, "electrical"),
          f("3.5 Environmental Test", "Temperature cycling: -20degC to +60degC (3 cycles). Humidity: 95% RH for 48 hrs. Vibration: 2g random, 3 axes.", true, "general"),
          f("3.6 Final Visual Inspection", "Paint thickness 80-120 um. Labeling correct and legible. Serial number engraved. Packaging integrity.", true, "general"),
        ],
      },
      {
        heading: "Stage 4: Documentation",
        fields: [
          f("4.1 Calibration Certificate", "5-point calibration data, test fluid, test conditions, uncertainty calculation. Signed by calibrated technician.", true, "general"),
          f("4.2 Material Certificate", "EN 10204 3.1 material certificate for all wetted parts. PMI report. Heat treatment certificate.", true, "general"),
          f("4.3 Pressure Test Certificate", "Hydrostatic test report with pressure chart. Witness signature.", true, "general"),
          f("4.4 NDT Reports", "DPT report (all welds). RT report (if specified by customer). MPI report (if specified).", true, "general"),
          f("4.5 O&M Manual", "Operation, installation, maintenance instructions. Wiring diagram. Troubleshooting guide. Spare parts list.", true, "general"),
        ],
      },
    ],
  },

  // ─── Level Gauges QAP ───────────────────────────────────────────────────
  {
    id: "QAP-LEV-001",
    type: "qap_master" as const,
    productFamily: "magnetic_level",
    productName: "Level Gauges (All Types)",
    title: "Master QAP — Level Gauge Manufacturing",
    description: "Quality Assurance Plan for Flowtech Level Gauge manufacturing covering Magnetic (Side/Top), Reflex, Transparent, Tubular, and Float & Board types.",
    revision: "Rev.4",
    date: "2025-02-15",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "Stage 1: Raw Material Inspection",
        fields: [
          f("1.1 Tube/Bar Stock MTC", "SS 316/304 seamless tube: check OD, ID, wall thickness per ASTM A269. Bar stock for float: check diameter, straightness.", true, "general"),
          f("1.2 Glass Inspection", "Borosilicate glass: check for bubbles, scratches, chips. Prismatic groove angle 90deg +-0.5deg (reflex type). Flatness <0.1 mm (transparent type).", true, "general"),
          f("1.3 Magnet Inspection", "Float magnet: Gauss level >3000 Gauss at surface. Pole orientation verified. Temperature rating check (demagnetization <5% at max temp).", true, "general"),
          f("1.4 Gasket Inspection", "PTFE/Graphoil/Viton gaskets: check dimensions, thickness uniformity, freedom from defects.", true, "general"),
        ],
      },
      {
        heading: "Stage 2: In-Process Inspection",
        fields: [
          f("2.1 Chamber Fabrication", "Tube cutting: length +-1 mm. End machining: flange facing perpendicularity <0.2 mm. Process connection drilling: PCD +-0.5 mm.", true, "dimension"),
          f("2.2 Welding", "TIG welding of flanges/end caps. Full penetration welds. WPS/PQR per ASME IX. 100% DPT on all pressure-bearing welds.", true, "general"),
          f("2.3 Float Assembly", "Float shell forming: leak test at 10 bar submerged. Magnet insertion: polarity verified. End cap welding: full penetration, DPT.", true, "general"),
          f("2.4 Indicator Assembly", "Roller/capsule assembly: smooth rotation/movement. Magnetic coupling verified with test float. Scale marking accuracy +-0.5 mm.", true, "general"),
          f("2.5 Glass Assembly (Reflex/Transparent)", "Glass seating: mica shield installed for steam service. Gasket compression uniform. Bolts torqued to spec (cross-pattern).", true, "general"),
        ],
      },
      {
        heading: "Stage 3: Final Testing",
        fields: [
          f("3.1 Hydrostatic Test", "1.5 x design pressure for 15 min. No leakage, no weeping. All joints inspected during test.", true, "performance"),
          f("3.2 Float Operation Test", "Float travel test: smooth movement full stroke. Magnetic coupling: indicator follows float within +-3 mm. Buoyancy check at specified SG.", true, "performance"),
          f("3.3 Visual Verification", "Roller rotation: all rollers free, colour change crisp. Scale alignment: indicator matches actual level within +-5 mm.", true, "performance"),
          f("3.4 Switch Test (if fitted)", "Switch actuation point: +-2 mm of set point. Contact resistance <0.1 Ohms. Hysteresis 5-10 mm.", true, "electrical"),
          f("3.5 Transmitter Calibration (if fitted)", "4-20mA output: 5-point calibration (0%, 25%, 50%, 75%, 100%). Accuracy +-0.5% FSD. HART communication verified.", true, "electrical"),
        ],
      },
    ],
  },

  // ─── Pressure Transmitters QAP ──────────────────────────────────────────
  {
    id: "QAP-PRE-001",
    type: "qap_master" as const,
    productFamily: "smart_pressure",
    productName: "Pressure Transmitters (All Types)",
    title: "Master QAP — Pressure Transmitter Manufacturing",
    description: "Quality Assurance Plan for Flowtech Pressure Transmitter manufacturing covering Smart (Flow-SPT), Differential (Flow-DPT), and Miniature (MPT-900) transmitter families.",
    revision: "Rev.3",
    date: "2025-01-25",
    approvedBy: "Quality Manager — Flowtech",
    sections: [
      {
        heading: "Stage 1: Sensor & Raw Material Inspection",
        fields: [
          f("1.1 Sensor Wafer/Die Inspection", "Silicon sensor die: visual inspection under microscope. Check for cracks, contamination, bond pad integrity. Electrical test: bridge resistance, offset, sensitivity.", true, "electrical"),
          f("1.2 Process Connection MTC", "SS 316L/Hastelloy C bar stock: chemical composition per ASTM, hardness test, dimensional check.", true, "general"),
          f("1.3 Diaphragm Foil Inspection", "SS 316L/Hastelloy C/Ceramic diaphragm: thickness +-0.01 mm. Surface finish Ra <0.4 um. Flatness check.", true, "general"),
          f("1.4 Housing & Electronics MTC", "Aluminium die-cast housing: porosity check (X-ray). PCB: solderability test per IPC. Components: date code verification, counterfeit check.", true, "general"),
        ],
      },
      {
        heading: "Stage 2: Sensor Assembly & Testing",
        fields: [
          f("2.1 Sensor Mounting", "Die attach: epoxy or glass frit. Curing profile verified. Wire bonding: pull test >8g per wire. 100% visual inspection.", true, "electrical"),
          f("2.2 Oil Filling", "Vacuum oil filling: <5 mbar vacuum, silicone oil deaerated. Fill volume: sensor cavity 100% filled, no voids. Seal weld: helium leak test <1x10^-9 mbar*l/s.", true, "general"),
          f("2.3 Temperature Compensation", "Sensor characterized at -40degC, +25degC, +85degC. Compensation coefficients calculated. Span/offset TC compensated to <0.01% FS/degC.", true, "performance"),
          f("2.4 Electronics Assembly", "SMT reflow profile verified. ADC calibration: 24-bit resolution verified. EEPROM programming: serial number, compensation data, configuration.", true, "electrical"),
        ],
      },
      {
        heading: "Stage 3: Final Calibration & Testing",
        fields: [
          f("3.1 Pressure Calibration", "5-point calibration: 0%, 25%, 50%, 75%, 100% FS. Precision dead-weight tester (class 0.025%). Accuracy: +-0.075% (Smart), +-0.065% (DP).", true, "performance"),
          f("3.2 Temperature Cycling", "-40degC to +85degC (3 cycles). Output drift <0.1% FS. Hysteresis <0.05% FS.", true, "performance"),
          f("3.3 Overpressure Test", "2x rated pressure for 1 min. Zero return <0.05% FS. No mechanical damage.", true, "performance"),
          f("3.4 Electrical Tests", "Supply voltage reversal protection. Load variation test. EMI immunity: 10V/m (IEC 61000-4-3). Surge: 1kV (IEC 61000-4-5).", true, "electrical"),
          f("3.5 HART/Communication Test", "HART command set verification. DD/EDDL compliance. Loop test: 4mA, 20mA, variable. Burst mode test.", true, "electrical"),
          f("3.6 Final Visual & Packaging", "Label: model, range, S/N, certifications. Display: all segments functional. O-ring lubrication. Desiccant + anti-static bag.", true, "general"),
        ],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════
export function getAllMasterGADs(): MasterDocument[] {
  return MASTER_GAD_LIBRARY;
}

export function getAllMasterQAPs(): MasterDocument[] {
  return MASTER_QAP_LIBRARY;
}

export function getMastersByFamily(family: ProductFamily): { gad: MasterDocument | null; qap: MasterDocument | null } {
  return {
    gad: MASTER_GAD_LIBRARY.find((m) => m.productFamily === family) || null,
    qap: MASTER_QAP_LIBRARY.find((m) => m.productFamily === family) || null,
  };
}

export function getMastersByCategory(category: "flow" | "level" | "pressure"): { gads: MasterDocument[]; qaps: MasterDocument[] } {
  const families = PRODUCT_CATEGORIES.find((c) => c.key === category)?.families || [];
  return {
    gads: MASTER_GAD_LIBRARY.filter((m) => families.includes(m.productFamily)),
    qaps: MASTER_QAP_LIBRARY.filter((m) => families.includes(m.productFamily)),
  };
}

export function getGadCount(): number {
  return MASTER_GAD_LIBRARY.length;
}

export function getQapCount(): number {
  return MASTER_QAP_LIBRARY.length;
}

export function getTotalMasterCount(): number {
  return MASTER_GAD_LIBRARY.length + MASTER_QAP_LIBRARY.length;
}
