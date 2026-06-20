// ============================================================
// FLOWTECH PRODUCT EXPERT KNOWLEDGE BASE
// Comprehensive technical data for ALL Flowtech products
// Used by the AI Expert chat interface
// ============================================================

export interface ProductFamily {
  name: string;
  shortCode: string;
  description: string;
  measuringPrinciple: string;
  typicalApplications: string[];
  mediaTypes: string[];
  sizes: string[];
  accuracy: string;
  turndownRatio: string;
  pressureRating: string;
  temperatureRange: string;
  outputOptions: string[];
  communicationOptions: string[];
  powerSupply: string[];
  enclosureRatings: string[];
  processConnections: string[];
  mocOptions: string[];
  liningOptions?: string[];
  electrodeOptions?: string[];
  modelCodeStructure: ModelCodeField[];
  competitors: string[];
  advantages: string[];
  limitations: string[];
  sizingParameters: string[];
  faqs: Array<{q: string; a: string}>;
}

export interface ModelCodeField {
  position: string;
  code: string;
  label: string;
  options: Array<{value: string; label: string; description?: string}>;
}

// ══════════════════════════════════════════════════════════════
// 1. ELECTROMAGNETIC FLOWMETER
// ══════════════════════════════════════════════════════════════
const EMF: ProductFamily = {
  name: "Electromagnetic Flowmeter",
  shortCode: "EMF",
  description: "FMIPL-S9xx series electromagnetic flowmeters use Faraday's law of electromagnetic induction to measure conductive liquid flow. No moving parts, obstructionless design. Sizes from 15NB to 600NB.",
  measuringPrinciple: "Faraday's Law of Electromagnetic Induction — conductive liquid flowing through a magnetic field generates a voltage proportional to flow velocity.",
  typicalApplications: [
    "Water & wastewater treatment",
    "Chemical processing (acids, alkalis, solvents)",
    "Food & beverage (milk, juices, edible oils)",
    "Pharmaceutical (purified water, CIP/SIP)",
    "Pulp & paper (black liquor, stock)",
    "Mining slurries",
    "Dosing & batching systems",
  ],
  mediaTypes: ["Conductive liquids (min. 5 μS/cm)", "Water", "Acids", "Alkalis", "Slurries", "Pulp stock"],
  sizes: ["15NB", "20NB", "25NB", "32NB", "40NB", "50NB", "65NB", "80NB", "100NB", "125NB", "150NB", "200NB", "250NB", "300NB", "350NB", "400NB", "450NB", "500NB", "600NB"],
  accuracy: "±0.5% of reading (standard), ±0.2% (optional)",
  turndownRatio: "1:100",
  pressureRating: "PN10, PN16, PN25, PN40, ANSI 150#, ANSI 300#",
  temperatureRange: "-20°C to +120°C (standard), -40°C to +180°C (HT option)",
  outputOptions: ["4-20mA", "Pulse", "Frequency", "Status Output"],
  communicationOptions: ["HART", "Modbus RTU", "Modbus TCP/IP", "PROFIBUS PA", "PROFINET"],
  powerSupply: ["24V DC", "85-265V AC", "Battery powered"],
  enclosureRatings: ["IP65", "IP66/67", "IP68 (submersible)"],
  processConnections: ["Flanged (ANSI/DIN)", "Wafer", "Sanitary Tri-Clamp"],
  mocOptions: ["SS 304", "SS 316", "SS 316L", "Hastelloy C", "Titanium"],
  liningOptions: ["Hard Rubber", "Soft Rubber", "PTFE", "PFA", "Ceramic", "Neoprene", "Polyurethane"],
  electrodeOptions: ["SS 316L", "Hastelloy C", "Hastelloy B", "Titanium", "Tantalum", "Platinum-Iridium", "Tungsten Carbide"],
  modelCodeStructure: [
    { position: "1", code: "FMIPL", label: "Company Code", options: [{value: "FMIPL", label: "Flowtech Measuring Instruments Pvt. Ltd."}] },
    { position: "2", code: "S9xx", label: "Series", options: [
      {value: "S900", label: "Standard Compact EMF"},
      {value: "S900Ex", label: "Flameproof Compact (Ex-d)"},
      {value: "S900ExF", label: "Flameproof + Field Mount"},
      {value: "S900F", label: "Standard Field Mount"},
      {value: "S930", label: "Remote Electronics (IP68)"},
      {value: "S930Ex", label: "Flameproof Remote (Ex-d)"},
    ]},
    { position: "3", code: "F", label: "Connection Type", options: [
      {value: "F", label: "Flanged"},
      {value: "W", label: "Wafer"},
    ]},
    { position: "4", code: "S1-S6", label: "Process Connection MOC", options: [
      {value: "S1", label: "CS (Carbon Steel)"},
      {value: "S2", label: "SS 304"},
      {value: "S3", label: "SS 316"},
      {value: "S4", label: "SS 316L"},
      {value: "S5", label: "Hastelloy C"},
      {value: "S6", label: "Titanium"},
    ]},
    { position: "5", code: "F1-F4", label: "Flange Standard", options: [
      {value: "F1", label: "DIN PN16"},
      {value: "F2", label: "DIN PN40"},
      {value: "F3", label: "ANSI 150#"},
      {value: "F4", label: "ANSI 300#"},
    ]},
    { position: "6", code: "L1-L7", label: "Lining Material", options: [
      {value: "L1", label: "Hard Rubber"},
      {value: "L2", label: "Soft Rubber"},
      {value: "L3", label: "PTFE"},
      {value: "L4", label: "PFA"},
      {value: "L5", label: "Ceramic"},
      {value: "L6", label: "Neoprene"},
      {value: "L7", label: "Polyurethane"},
    ]},
    { position: "7", code: "E1-E7", label: "Electrode Material", options: [
      {value: "E1", label: "SS 316L"},
      {value: "E2", label: "Hastelloy C"},
      {value: "E3", label: "Hastelloy B"},
      {value: "E4", label: "Titanium"},
      {value: "E5", label: "Tantalum"},
      {value: "E6", label: "Platinum-Iridium"},
      {value: "E7", label: "Tungsten Carbide"},
    ]},
    { position: "8", code: "M", label: "Output", options: [
      {value: "M", label: "4-20mA + Pulse"},
    ]},
    { position: "9", code: "CR/CH", label: "Communication", options: [
      {value: "CR", label: "Modbus RTU"},
      {value: "CH", label: "HART"},
      {value: "CT", label: "Modbus TCP/IP"},
      {value: "CP", label: "PROFIBUS PA"},
    ]},
    { position: "10", code: "PS", label: "Power Supply", options: [
      {value: "PS1", label: "24V DC"},
      {value: "PS2", label: "85-265V AC"},
      {value: "PS3", label: "Battery"},
    ]},
    { position: "11", code: "I", label: "Mounting", options: [
      {value: "I1", label: "Integral (Compact)"},
      {value: "I2", label: "Remote (5m cable)"},
      {value: "I3", label: "Remote (10m cable)"},
      {value: "I4", label: "Remote (15m cable)"},
    ]},
    { position: "12", code: "WP", label: "Enclosure", options: [
      {value: "WP1", label: "IP65"},
      {value: "WP2", label: "IP66/67"},
      {value: "WP3", label: "IP68 (submersible)"},
    ]},
    { position: "13", code: "XXNB", label: "Line Size", options: [
      {value: "15NB", label: "15NB"},
      {value: "25NB", label: "25NB"},
      {value: "50NB", label: "50NB"},
      {value: "80NB", label: "80NB"},
      {value: "100NB", label: "100NB"},
      {value: "150NB", label: "150NB"},
      {value: "200NB", label: "200NB"},
      {value: "300NB", label: "300NB"},
      {value: "400NB", label: "400NB"},
      {value: "500NB", label: "500NB"},
      {value: "600NB", label: "600NB"},
    ]},
  ],
  competitors: ["Endress+Hauser Promag", "Krohne Optimass", "Siemens Sitrans", "ABB ProcessMaster", "Yokogawa ADMAG"],
  advantages: [
    "No moving parts — zero maintenance on sensor",
    "Obstructionless design — no pressure drop",
    "Accurate on dirty, corrosive, abrasive liquids",
    "Bi-directional flow measurement",
    "Excellent turndown (100:1)",
    "Empty pipe detection standard",
  ],
  limitations: [
    "Requires minimum conductivity (5 μS/cm)",
    "Not suitable for hydrocarbons, distilled water, non-conductive solvents",
    "Upstream/downstream straight pipe runs required (5D/3D)",
    "Heavier and larger than mechanical meters",
  ],
  sizingParameters: ["Flow rate (Qmin/Qmax)", "Line size", "Fluid conductivity", "Fluid density", "Operating pressure", "Operating temperature", "Viscosity"],
  faqs: [
    { q: "What is the minimum conductivity required?", a: "5 μS/cm for standard EMF. For low conductivity (down to 0.05 μS/cm), special capacitively-coupled electrodes are available." },
    { q: "Can EMF measure sewage/slurry?", a: "Yes — EMF is ideal for sewage and slurry. Use hard rubber or polyurethane lining with tungsten carbide electrodes for abrasive media." },
    { q: "What straight pipe lengths are needed?", a: "Minimum 5D upstream and 3D downstream. For accuracy-critical applications, 10D upstream is recommended." },
    { q: "Can EMF measure in both directions?", a: "Yes — bi-directional measurement is standard. The display shows negative flow for reverse direction." },
  ],
};

// ══════════════════════════════════════════════════════════════
// 2. TURBINE FLOWMETER
// ══════════════════════════════════════════════════════════════
const TURBINE: ProductFamily = {
  name: "Turbine Flowmeter",
  shortCode: "TURBINE",
  description: "FMIPL-TF series precision turbine flowmeters use a bladed rotor that spins proportionally to fluid velocity. Ideal for clean, low-viscosity liquids and gases. Sizes 15NB to 300NB.",
  measuringPrinciple: "Turbine rotor — fluid flow causes a precision-machined rotor to spin at a speed proportional to the volumetric flow rate. Pickup coils detect blade passage.",
  typicalApplications: [
    "Clean water & demineralized water",
    "Fuel metering (diesel, gasoline, kerosene)",
    "Lube oil & hydraulic oil",
    "Chemical dosing systems",
    "Loading/unloading systems",
    "Test rigs & calibration stands",
    "HVAC energy metering",
  ],
  mediaTypes: ["Clean liquids", "Low-viscosity oils", "Light hydrocarbons", "Water", "Chemicals", "Cryogenic liquids (LOX, LIN, LAR)"],
  sizes: ["15NB", "20NB", "25NB", "32NB", "40NB", "50NB", "65NB", "80NB", "100NB", "125NB", "150NB", "200NB", "250NB", "300NB"],
  accuracy: "±0.5% of reading (liquid), ±1.0% (gas), ±0.25% (precision grade)",
  turndownRatio: "1:10 (standard), 1:20 (extended)",
  pressureRating: "PN40, PN63, PN100, ANSI 150#, ANSI 300#, ANSI 600#",
  temperatureRange: "-196°C to +300°C (cryogenic to high-temp)",
  outputOptions: ["4-20mA", "Pulse", "Frequency", "Totalizer"],
  communicationOptions: ["HART", "Modbus RTU"],
  powerSupply: ["24V DC", "Loop-powered"],
  enclosureRatings: ["IP65", "IP66/67"],
  processConnections: ["Flanged", "Threaded (BSP/NPT)", "Wafer", "Tri-Clamp"],
  mocOptions: ["SS 304", "SS 316", "SS 316L", "Hastelloy C", "Titanium", "Duplex SS"],
  modelCodeStructure: [
    { position: "1", code: "FMIPL", label: "Company Code", options: [{value: "FMIPL", label: "Flowtech Measuring Instruments Pvt. Ltd."}] },
    { position: "2", code: "TF", label: "Product Code", options: [{value: "TF", label: "Turbine Flowmeter"}] },
    { position: "3", code: "F", label: "Connection Type", options: [
      {value: "F", label: "Flanged"},
      {value: "T", label: "Threaded"},
      {value: "W", label: "Wafer"},
    ]},
    { position: "4", code: "S1-S6", label: "Body MOC", options: [
      {value: "S1", label: "SS 304"},
      {value: "S2", label: "SS 316"},
      {value: "S3", label: "SS 316L"},
      {value: "S4", label: "Hastelloy C"},
      {value: "S5", label: "Titanium"},
      {value: "S6", label: "Duplex SS"},
    ]},
    { position: "5", code: "IR/IL", label: "Impeller Type", options: [
      {value: "IR", label: "Radial Impeller (liquid)"},
      {value: "IL", label: "Axial Impeller (low flow)"},
    ]},
    { position: "6", code: "W1-W3", label: "Wire Type", options: [
      {value: "W1", label: "Standard Coil Pickup"},
      {value: "W2", label: "High-Temp Coil"},
      {value: "W3", label: "Hall Effect Sensor"},
    ]},
    { position: "7", code: "WP", label: "Protection", options: [
      {value: "WP1", label: "IP65"},
      {value: "WP2", label: "IP66/67"},
      {value: "WP3", label: "IP68"},
    ]},
    { position: "8", code: "M", label: "Output", options: [
      {value: "M1", label: "4-20mA + Pulse"},
      {value: "M2", label: "Frequency Output"},
    ]},
    { position: "9", code: "CR/CH", label: "Communication", options: [
      {value: "CR", label: "Modbus RTU"},
      {value: "CH", label: "HART"},
    ]},
    { position: "10", code: "PS", label: "Power Supply", options: [
      {value: "PS1", label: "24V DC"},
      {value: "PS2", label: "Loop-powered"},
    ]},
    { position: "11", code: "XXNB", label: "Line Size", options: [] },
  ],
  competitors: ["Emerson Daniel", "Honeywell", "Krohne", "ABB"],
  advantages: [
    "Excellent repeatability (±0.05%)",
    "Wide pressure & temperature range",
    "Compact and lightweight",
    "Fast response time",
    "Suitable for cryogenic applications",
  ],
  limitations: [
    "Requires clean media — particles damage rotor bearings",
    "Not suitable for viscous (>20 cP) or dirty fluids",
    "Moving parts — requires periodic maintenance",
    "Need upstream filter/strainer",
  ],
  sizingParameters: ["Flow rate", "Line size", "Fluid density", "Viscosity", "Operating pressure/temperature"],
  faqs: [
    { q: "What is the maximum viscosity for turbine meters?", a: "20 cP for standard designs. Above this, consider oval gear or EMF." },
    { q: "Do I need a filter upstream?", a: "Yes — a Y-strainer (100 mesh) is mandatory to protect rotor bearings from particulate damage." },
    { q: "Can turbine meter measure gas?", a: "Yes — with axial impeller design. Accuracy is ±1.0% for gas applications." },
  ],
};

// ══════════════════════════════════════════════════════════════
// 3. VORTEX FLOWMETER
// ══════════════════════════════════════════════════════════════
const VORTEX: ProductFamily = {
  name: "Vortex Flowmeter",
  shortCode: "VORTEX",
  description: "FMIPL-VF series vortex flowmeters use the von Karman vortex street principle. A bluff body sheds vortices proportional to flow velocity. No moving parts, robust for steam, gas, and liquids. Sizes 15NB to 300NB.",
  measuringPrinciple: "Von Karman Vortex Street — a bluff body placed in the flow stream generates alternating vortices. The vortex shedding frequency is proportional to flow velocity.",
  typicalApplications: [
    "Saturated & superheated steam",
    "Compressed air & plant air",
    "Natural gas & LPG",
    "Hot water & thermal fluids",
    "Chilled water & brine",
    "Nitrogen, oxygen, argon",
    "Petrochemical feedstocks",
  ],
  mediaTypes: ["Steam", "Gases", "Liquids", "Cryogenic fluids"],
  sizes: ["15NB", "20NB", "25NB", "32NB", "40NB", "50NB", "65NB", "80NB", "100NB", "125NB", "150NB", "200NB", "250NB", "300NB"],
  accuracy: "±0.75% of reading (liquid), ±1.0% (gas/steam)",
  turndownRatio: "1:20 (standard), 1:40 (dual-sensor)",
  pressureRating: "PN16, PN25, PN40, ANSI 150#, ANSI 300#, ANSI 600#",
  temperatureRange: "-40°C to +400°C",
  outputOptions: ["4-20mA", "Pulse", "Totalizer"],
  communicationOptions: ["HART", "Modbus RTU", "FOUNDATION Fieldbus"],
  powerSupply: ["24V DC", "Loop-powered (4-20mA)"],
  enclosureRatings: ["IP65", "IP66/67"],
  processConnections: ["Flanged", "Wafer", "Tri-Clamp"],
  mocOptions: ["SS 304", "SS 316", "SS 316L", "Hastelloy C"],
  modelCodeStructure: [
    { position: "1", code: "FMIPL", label: "Company Code", options: [{value: "FMIPL", label: "Flowtech Measuring Instruments Pvt. Ltd."}] },
    { position: "2", code: "VF", label: "Product Code", options: [{value: "VF", label: "Vortex Flowmeter"}] },
    { position: "3", code: "F/W", label: "Connection", options: [
      {value: "F", label: "Flanged"},
      {value: "W", label: "Wafer"},
    ]},
    { position: "4", code: "S1-S4", label: "Body MOC", options: [
      {value: "S1", label: "SS 304"},
      {value: "S2", label: "SS 316"},
      {value: "S3", label: "SS 316L"},
      {value: "S4", label: "Hastelloy C"},
    ]},
    { position: "5", code: "F1-F4", label: "Flange Standard", options: [
      {value: "F1", label: "PN16"},
      {value: "F2", label: "PN40"},
      {value: "F3", label: "ANSI 150#"},
      {value: "F4", label: "ANSI 300#"},
    ]},
    { position: "6", code: "PS", label: "Power/Output", options: [
      {value: "PS1", label: "24V DC, 4-20mA + Pulse"},
      {value: "PS2", label: "Loop-powered, 4-20mA"},
    ]},
    { position: "7", code: "XXNB", label: "Line Size", options: [] },
  ],
  competitors: ["Yokogawa DY", "Endress+Hauser Prowirl", "ABB Swirl", "Siemens Sitrans FX"],
  advantages: [
    "No moving parts — high reliability",
    "Excellent for steam measurement",
    "Wide temperature range (-40 to +400°C)",
    "Low sensitivity to vibration (dual-sensor option)",
    "Direct mass flow for steam (with temp/pressure compensation)",
  ],
  limitations: [
    "Minimum Reynolds number required (Re > 10000)",
    "Not suitable for very low flow rates",
    "Pipe vibration can affect measurement (mitigated with dual-sensor)",
    "Need adequate straight pipe runs (15D upstream, 5D downstream)",
  ],
  sizingParameters: ["Flow rate", "Line size", "Fluid type (steam/gas/liquid)", "Density", "Operating pressure", "Operating temperature"],
  faqs: [
    { q: "What is the minimum Reynolds number?", a: "Re > 10,000 for accurate vortex shedding. Below this, measurement becomes unstable." },
    { q: "Can vortex meter measure steam directly in mass?", a: "Yes — with integrated temperature & pressure compensation, it outputs direct mass flow (kg/hr or ton/hr)." },
    { q: "How does it handle pipe vibration?", a: "Dual-sensor design with DSP filtering cancels out vibration noise. Specify this for installations near pumps, compressors, or on platforms." },
  ],
};

// ══════════════════════════════════════════════════════════════
// 4. SIDE MOUNTED MAGNETIC LEVEL INDICATOR
// ══════════════════════════════════════════════════════════════
const SMMLI: ProductFamily = {
  name: "Side Mounted Magnetic Level Indicator",
  shortCode: "SMMLI",
  description: "FMIPL-SMMLI series provides visual level indication using a magnetic float inside a bypass chamber. The float's magnetic field drives visual flippers/flags on the external scale. Sizes 15NB to 80NB process connection, scale lengths 150mm to 6000mm.",
  measuringPrinciple: "Magnetic coupling — a magnetic float inside the chamber rises and falls with the liquid level. Its magnetic field flips bi-colour flags on the external indicator column.",
  typicalApplications: [
    "Boiler drum level indication",
    "Storage tank level monitoring",
    "Reactor vessel level",
    "Separator vessel level",
    "Lube oil tank level",
    "Chemical day tank level",
    "Effluent sump level",
  ],
  mediaTypes: ["Liquids", "Interface (oil/water)", "Ammonia", "Refrigerants"],
  sizes: ["15NB", "20NB", "25NB", "32NB", "40NB", "50NB", "65NB", "80NB"],
  accuracy: "±5mm (visual), ±2mm (with transmitter)",
  turndownRatio: "N/A (visual device)",
  pressureRating: "Up to 100 bar (higher on request)",
  temperatureRange: "-196°C to +400°C",
  outputOptions: ["Visual indication only", "4-20mA (with transmitter)", " reed switch contacts"],
  communicationOptions: ["HART (with transmitter)"],
  powerSupply: ["24V DC (transmitter)"],
  enclosureRatings: ["IP65", "IP66/67"],
  processConnections: ["Flanged (ANSI/DIN)", "Threaded", "Socket weld"],
  mocOptions: ["SS 304", "SS 316", "SS 316L", "Hastelloy C", "Titanium", "PVC/PP (for corrosive)"],
  modelCodeStructure: [
    { position: "1", code: "FMIPL", label: "Company Code", options: [{value: "FMIPL", label: "Flowtech Measuring Instruments Pvt. Ltd."}] },
    { position: "2", code: "SMMLI", label: "Product Code", options: [{value: "SMMLI", label: "Side Mounted Magnetic Level Indicator"}] },
    { position: "3", code: "F", label: "Connection Type", options: [
      {value: "F", label: "Flange End"},
      {value: "S", label: "Screwed"},
      {value: "W", label: "Welded"},
    ]},
    { position: "4", code: "S1-S5", label: "Process Connection MOC", options: [
      {value: "S1", label: "SS 304"},
      {value: "S2", label: "SS 316"},
      {value: "S3", label: "SS 316L"},
      {value: "S4", label: "Hastelloy C"},
      {value: "S5", label: "Titanium"},
    ]},
    { position: "5", code: "F1-F4", label: "Flange Standard", options: [
      {value: "F1", label: "PN16"},
      {value: "F2", label: "PN40"},
      {value: "F3", label: "ANSI 150#"},
      {value: "F4", label: "ANSI 300#"},
    ]},
    { position: "6", code: "FC1-FC3", label: "Float Chamber", options: [
      {value: "FC1", label: "SS 316 Sch. 10"},
      {value: "FC2", label: "SS 316 Sch. 40"},
      {value: "FC3", label: "SS 316L Sch. 10"},
    ]},
    { position: "7", code: "FS1-FS3", label: "Float MOC", options: [
      {value: "FS1", label: "SS 316"},
      {value: "FS2", label: "SS 316L"},
      {value: "FS3", label: "Titanium"},
    ]},
    { position: "8", code: "AS", label: "Air Vent", options: [
      {value: "AS", label: "Stop Plug"},
      {value: "AV", label: "Auto Air Vent"},
    ]},
    { position: "9", code: "DS", label: "Drain", options: [
      {value: "DS", label: "Stop Plug"},
      {value: "DV", label: "Drain Valve"},
    ]},
    { position: "10", code: "JNA/J1", label: "Jacketing", options: [
      {value: "JNA", label: "Not Applicable"},
      {value: "J1", label: "Steam Jacket"},
      {value: "J2", label: "Electric Trace"},
    ]},
    { position: "11", code: "CD/RD", label: "Indicator Type", options: [
      {value: "CD", label: "Capsule Design (Toughened Glass)"},
      {value: "RD", label: "Roller Design (Aluminum Flags)"},
      {value: "SH", label: "Shuttle Design"},
    ]},
    { position: "12", code: "SD1-SD3", label: "Scale Detail", options: [
      {value: "SD1", label: "LC 5 (5mm pitch)"},
      {value: "SD2", label: "LC 10 (10mm pitch)"},
      {value: "SD3", label: "Custom engraved"},
    ]},
    { position: "13", code: "SU1-SU3", label: "Scale Unit", options: [
      {value: "SU1", label: "CM"},
      {value: "SU2", label: "MM"},
      {value: "SU3", label: "INCH"},
    ]},
    { position: "14", code: "Txx", label: "Transmitter", options: [
      {value: "TNA", label: "Not Required"},
      {value: "T1", label: "4-20mA Transmitter"},
      {value: "T2", label: "HART Transmitter"},
    ]},
    { position: "15", code: "SWxx", label: "Switch", options: [
      {value: "SNA", label: "Not Applicable"},
      {value: "SW1", label: "1 reed switch"},
      {value: "SW2", label: "2 reed switches"},
      {value: "SW3", label: "3 reed switches"},
    ]},
    { position: "16", code: "XXNB", label: "Process Connection Size", options: [] },
    { position: "17", code: "XXXXMM", label: "C/C Height", options: [] },
  ],
  competitors: ["KROHNE BM26", "KTEK (ABB) KM26", "Jogler", "Penberthy"],
  advantages: [
    "No glass to break — completely sealed indicator",
    "Bi-colour flags visible from 50+ meters",
    "No process contact with indicator — safe for hazardous media",
    "Add-on transmitter and switches without process shutdown",
    "Suitable for cryogenic to high-temperature applications",
  ],
  limitations: [
    "Requires minimum liquid specific gravity (0.6 typical, 0.45 special float)",
    "Moving float — possible to stick in dirty service",
    "Requires venting for proper operation",
    "Not suitable for media with heavy solids",
  ],
  sizingParameters: ["C/C height (center-to-center distance)", "Process connection size", "Process pressure/temperature", "Fluid density (SG)", "Chamber MOC"],
  faqs: [
    { q: "What is the minimum specific gravity?", a: "0.6 SG for standard float. For lighter fluids (down to 0.45 SG), a special low-density float is available." },
    { q: "Can I add a transmitter later?", a: "Yes — the indicator column has a standard transmitter rail. Any 4-20mA or HART transmitter can be clipped on without process shutdown." },
    { q: "What is the maximum C/C height?", a: "6000mm (6 meters) as standard. Above this, multiple sections can be coupled." },
    { q: "Does it need venting?", a: "Yes — the top connection must be vented to atmosphere or vessel vapor space. A stop plug is provided; replace with auto air vent if needed." },
  ],
};

// ══════════════════════════════════════════════════════════════
// ALL PRODUCTS DATABASE
// ══════════════════════════════════════════════════════════════
export const PRODUCT_KB: Record<string, ProductFamily> = {
  emf: EMF,
  turbine: TURBINE,
  vortex: VORTEX,
  smmli: SMMLI,
  // Additional product families can be added here
};

export const PRODUCT_ORDER = ["emf", "turbine", "vortex", "smmli"];

// ══════════════════════════════════════════════════════════════
// MODEL DECODER — De-code any FMIPL model number
// ══════════════════════════════════════════════════════════════
export interface DecodedField {
  code: string;
  label: string;
  meaning: string;
}

export function decodeModelNumber(modelCode: string): { product: string; fields: DecodedField[]; unknown: string[] } | null {
  if (!modelCode || !modelCode.startsWith("FMIPL-")) return null;

  const parts = modelCode.split("-");
  const fields: DecodedField[] = [];
  const unknown: string[] = [];

  // Identify product family
  let product = "Unknown";
  let kb: ProductFamily | null = null;
  const productCode = parts[1]?.toUpperCase();

  if (productCode?.startsWith("S9")) { product = "Electromagnetic Flowmeter"; kb = EMF; }
  else if (productCode === "TF") { product = "Turbine Flowmeter"; kb = TURBINE; }
  else if (productCode === "VF") { product = "Vortex Flowmeter"; kb = VORTEX; }
  else if (productCode === "SMMLI") { product = "Side Mounted Magnetic Level Indicator"; kb = SMMLI; }
  else if (productCode === "TMMLI") { product = "Top Mounted Magnetic Level Indicator"; kb = null; }
  else if (productCode === "DMMLI") { product = "Double Window Sight Glass Level Indicator"; kb = null; }
  else if (productCode === "ABSG") { product = "Allen Bolt Sight Glass"; kb = null; }
  else if (productCode === "FVSG") { product = "Full View Sight Glass"; kb = null; }
  else if (productCode === "OFA") { product = "Orifice Flange Assembly"; kb = null; }

  fields.push({ code: parts[0] || "", label: "Company", meaning: "Flowtech Measuring Instruments Pvt. Ltd." });

  if (!kb) {
    // Try basic decoding from known code segments
    for (let i = 1; i < parts.length; i++) {
      const p = parts[i];
      if (/^S9/.test(p)) fields.push({ code: p, label: "Series", meaning: "EMF " + p });
      else if (p === "F") fields.push({ code: p, label: "Connection", meaning: "Flanged" });
      else if (p === "W") fields.push({ code: p, label: "Connection", meaning: "Wafer" });
      else if (/^S\d$/.test(p)) fields.push({ code: p, label: "MOC", meaning: `Process Connection Material (code ${p})` });
      else if (/^F\d$/.test(p)) fields.push({ code: p, label: "Flange Standard", meaning: `Flange Standard (code ${p})` });
      else if (/^L\d$/.test(p)) fields.push({ code: p, label: "Lining", meaning: `Lining Material (code ${p})` });
      else if (/^E\d$/.test(p)) fields.push({ code: p, label: "Electrode", meaning: `Electrode Material (code ${p})` });
      else if (/^\d+NB$/i.test(p)) fields.push({ code: p, label: "Line Size", meaning: p });
      else if (/^\d+MM$/i.test(p)) fields.push({ code: p, label: "Dimension", meaning: p });
      else unknown.push(p);
    }
    return { product, fields, unknown };
  }

  // Detailed decoding using KB
  const structure = kb.modelCodeStructure;
  for (let i = 1; i < parts.length && i <= structure.length; i++) {
    const part = parts[i];
    const field = structure[i]; // structure[0] is FMIPL, structure[1] is product code
    if (!field) {
      // Check for size codes at the end
      if (/^\d+NB$/i.test(part)) {
        fields.push({ code: part, label: "Line Size", meaning: part });
      } else if (/^\d+MM$/i.test(part)) {
        fields.push({ code: part, label: "C/C Height / Dimension", meaning: part });
      } else {
        unknown.push(part);
      }
      continue;
    }
    // Find matching option
    const option = field.options.find(o => o.value.toUpperCase() === part.toUpperCase());
    if (option) {
      fields.push({ code: part, label: field.label, meaning: option.label });
    } else {
      // Partial match for size/variable fields
      if (/^\d+NB$/i.test(part) || /^\d+MM$/i.test(part)) {
        fields.push({ code: part, label: field.label, meaning: part });
      } else if (field.label === "C/C Height" || field.label === "Line Size") {
        fields.push({ code: part, label: field.label, meaning: part });
      } else {
        fields.push({ code: part, label: field.label, meaning: `Unknown code "${part}" for ${field.label}` });
        unknown.push(part);
      }
    }
  }

  return { product, fields, unknown };
}

// ══════════════════════════════════════════════════════════════
// PRODUCT COMPARISON
// ══════════════════════════════════════════════════════════════
export interface ComparisonRow {
  parameter: string;
  emf: string;
  turbine: string;
  vortex: string;
  smmli: string;
}

export const PRODUCT_COMPARISON: ComparisonRow[] = [
  { parameter: "Measuring Principle", emf: "Faraday's Law", turbine: "Rotor speed", vortex: "Vortex shedding", smmli: "Magnetic float" },
  { parameter: "Accuracy", emf: "±0.5% (opt ±0.2%)", turbine: "±0.5% (liq)", vortex: "±0.75% (liq)", smmli: "±5mm visual" },
  { parameter: "Turndown Ratio", emf: "100:1", turbine: "10:1", vortex: "20:1", smmli: "N/A" },
  { parameter: "Moving Parts", emf: "None", turbine: "Rotor + bearings", vortex: "None (bluff body)", smmli: "Float" },
  { parameter: "Min Conductivity", emf: "5 μS/cm", turbine: "N/A", vortex: "N/A", smmli: "N/A" },
  { parameter: "Max Viscosity", emf: "No limit", turbine: "20 cP", vortex: "No limit*", smmli: "N/A" },
  { parameter: "Steam", emf: "No", turbine: "No", vortex: "Yes (excellent)", smmli: "N/A" },
  { parameter: "Slurries", emf: "Excellent", turbine: "No (damages rotor)", vortex: "OK", smmli: "Caution (sticky)" },
  { parameter: "Pressure Drop", emf: "Zero", turbine: "Low", vortex: "Low", smmli: "N/A" },
  { parameter: "Bi-directional", emf: "Yes", turbine: "No", vortex: "No", smmli: "N/A" },
  { parameter: "Max Temperature", emf: "180°C (opt 400°C)", turbine: "300°C", vortex: "400°C", smmli: "400°C" },
  { parameter: "Sizes", emf: "15-600NB", turbine: "15-300NB", vortex: "15-300NB", smmli: "15-80NB" },
];

// ══════════════════════════════════════════════════════════════
// SMART Q&A ENGINE
// ══════════════════════════════════════════════════════════════
export interface ExpertAnswer {
  answer: string;
  confidence: "high" | "medium" | "low";
  source: string;
  relatedProducts?: string[];
}

export function askExpert(question: string): ExpertAnswer {
  const q = question.toLowerCase();

  // Model code decoding
  const modelMatch = question.match(/FMIPL-[A-Z0-9\-]+/i);
  if (modelMatch) {
    const decoded = decodeModelNumber(modelMatch[0]);
    if (decoded) {
      const lines = decoded.fields.map(f => `**${f.label}:** ${f.code} = ${f.meaning}`).join("\n");
      return {
        answer: `**Product:** ${decoded.product}\n\n**Model Code Breakdown:**\n${lines}${decoded.unknown.length > 0 ? "\n\n*Unrecognized segments:* " + decoded.unknown.join(", ") : ""}`,
        confidence: "high",
        source: "Flowtech Model Code Database",
        relatedProducts: [decoded.product],
      };
    }
  }

  // Product identification
  if (q.includes("emf") || q.includes("electromagnetic") || q.includes("magmeter") || q.includes("mag flow")) {
    return { answer: formatProductInfo(EMF), confidence: "high", source: "EMF Product Database", relatedProducts: ["EMF"] };
  }
  if (q.includes("turbine") && !q.includes("vortex")) {
    return { answer: formatProductInfo(TURBINE), confidence: "high", source: "Turbine Product Database", relatedProducts: ["Turbine"] };
  }
  if (q.includes("vortex")) {
    return { answer: formatProductInfo(VORTEX), confidence: "high", source: "Vortex Product Database", relatedProducts: ["Vortex"] };
  }
  if (q.includes("level indicator") || q.includes("level gauge") || q.includes("mli") || q.includes("smmli")) {
    return { answer: formatProductInfo(SMMLI), confidence: "high", source: "SMMLI Product Database", relatedProducts: ["SMMLI"] };
  }

  // Application guidance
  if (q.includes("sewage") || q.includes("wastewater") || q.includes("slurry") || q.includes("dirty")) {
    return { answer: "For sewage, wastewater, and slurry applications, **Electromagnetic Flowmeter (EMF)** is the best choice. It has no moving parts, zero pressure drop, and can handle abrasive and corrosive media. Use hard rubber or polyurethane lining with tungsten carbide electrodes.", confidence: "high", source: "Application Guide", relatedProducts: ["EMF"] };
  }
  if (q.includes("steam")) {
    return { answer: "For steam measurement, **Vortex Flowmeter** is the ideal choice. It has no moving parts, handles temperatures up to 400°C, and with integrated temperature & pressure compensation, provides direct mass flow output (kg/hr). Accuracy is ±1.0% for steam.", confidence: "high", source: "Application Guide", relatedProducts: ["Vortex"] };
  }
  if (q.includes("clean water") || q.includes("demin") || q.includes("fuel") || q.includes("diesel") || q.includes("oil")) {
    return { answer: "For clean liquids like demineralized water, fuel oils, and lube oils, **Turbine Flowmeter** offers excellent accuracy (±0.5%) and repeatability (±0.05%). Ensure a Y-strainer (100 mesh) is installed upstream to protect the rotor bearings.", confidence: "high", source: "Application Guide", relatedProducts: ["Turbine"] };
  }
  if (q.includes("level") && (q.includes("tank") || q.includes("boiler") || q.includes("drum"))) {
    return { answer: "For tank and boiler drum level indication, **Side Mounted Magnetic Level Indicator (SMMLI)** provides reliable visual indication with no glass to break. Bi-colour flags are visible from 50+ meters. Optional 4-20mA transmitter and reed switches can be added without process shutdown.", confidence: "high", source: "Application Guide", relatedProducts: ["SMMLI"] };
  }

  // Comparison
  if (q.includes("compare") || q.includes("difference") || q.includes("which") || q.includes("vs")) {
    return { answer: formatComparison(), confidence: "high", source: "Product Comparison Matrix" };
  }

  // General fallback
  return {
    answer: `I'm the Flowtech Product Expert. I can help you with:\n\n**De-code Model Numbers:** Paste any FMIPL-xxx code and I'll break it down\n**Product Info:** Ask about EMF, Turbine, Vortex, Level Indicators, etc.\n**Application Guidance:** Tell me your fluid, flow rate, and conditions\n**Compare Products:** Ask "which is better for steam?" or "EMF vs Vortex?"\n**Technical Specs:** Accuracy, sizing, MOC, outputs, communication\n\nWhat would you like to know?`,
    confidence: "low",
    source: "General",
  };
}

function formatProductInfo(p: ProductFamily): string {
  return `**${p.name}** (${p.shortCode})\n\n${p.description}\n\n**Measuring Principle:** ${p.measuringPrinciple}\n\n**Typical Applications:**\n${p.typicalApplications.map(a => "- " + a).join("\n")}\n\n**Key Specs:**\n- Accuracy: ${p.accuracy}\n- Turndown: ${p.turndownRatio}\n- Pressure: ${p.pressureRating}\n- Temperature: ${p.temperatureRange}\n- Sizes: ${p.sizes.join(", ")}\n- Outputs: ${p.outputOptions.join(", ")}\n- Communication: ${p.communicationOptions.join(", ")}`;
}

function formatComparison(): string {
  return `**Flowtech Product Comparison**\n\n${PRODUCT_COMPARISON.map(r => `| ${r.parameter} | ${r.emf} | ${r.turbine} | ${r.vortex} |`).join("\n")}\n\n**Quick Selection Guide:**\n- **Dirty/corrosive/slurry liquid → EMF** (no moving parts, zero dp)\n- **Clean liquid, high accuracy → Turbine** (±0.5%, best repeatability)\n- **Steam, gas, or hot liquid → Vortex** (no moving parts, direct mass for steam)\n- **Tank/vessel level → SMMLI** (visual + transmitter options)`;
}
