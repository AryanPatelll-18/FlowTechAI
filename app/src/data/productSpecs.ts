// ============================================================
// Product-Type-Specific Default Technical Specifications
// Each product family has its own complete spec template
// ============================================================

export interface ProductDefaults {
  type: string;
  make: string;
  accuracy: string;
  tempRange: string;
  pressRating: string;
  bodyMoc: string;
  connection: string;
  connMoc: string;
  flange: string;
  enclosure: string;
  wiring: string;
  comm: string;
  output: string;
  cableGland: string;
  cableEntry: string;
  protection: string;
  power: string;
  mounting: string;
  performance1: string; // First extra performance spec
  performance2: string;
  performance3: string;
  accessories: string[];
  standards: string[];
  notes: string[];
}

export const PRODUCT_DEFAULTS: Record<string, ProductDefaults> = {
  "Electromagnetic Flowmeter": {
    type: "Electromagnetic Flowmeter",
    make: "Flowtech",
    accuracy: "+/- 0.5% of reading",
    tempRange: "-20 deg C to +80 deg C",
    pressRating: "PN16 / Class 150#",
    bodyMoc: "SS 304 / SS 316 / Carbon Steel",
    connection: "Flanged End",
    connMoc: "SS 316 / Carbon Steel",
    flange: "ANSI B16.5 Class 150# RF / IS 6392 PN16",
    enclosure: "Aluminium Die-cast, Epoxy Coated (IP66/67)",
    wiring: "2-Wire Loop Powered",
    comm: "HART Protocol 7.0",
    output: "4-20 mA DC + HART",
    cableGland: "Nickel Plated Brass, PG 11 / M20x1.5",
    cableEntry: "2 x M20 x 1.5",
    protection: "IP66 / IP67 / NEMA 4X",
    power: "24 V DC (2-wire loop)",
    mounting: "Integral / Remote (cable length as per SO)",
    performance1: "Empty Pipe Detection: Standard",
    performance2: "Forward/Reverse Flow Measurement: Standard",
    performance3: "Low Flow Cut-off: Adjustable 0-10% of span",
    accessories: ["Earthing Rings (SS 316)", "Mounting Brackets", "Calibration Certificate (ISO 17025)", "Material Test Certificate (EN 10204 3.1)", "O&M Manual", "Test & Inspection Reports"],
    standards: ["ISO 6817", "IEC 60529 (IP66/67)", "IEC 61326 (EMC)", "IEC 61010-1 (Safety)", "ISO 9001:2015 (Quality)"],
    notes: ["Flowtube, Electrode, and Lining MOC as per client requirement.", "Process connection flange rating and standard as per piping specification.", "Cable length for remote mount as specified in SO.", "Third Party Inspection (TPI) as per client QAP if specified."],
  },

  "Turbine Flowmeter": {
    type: "Turbine Flowmeter",
    make: "Flowtech",
    accuracy: "+/- 0.5% of reading (liquids) / +/- 1.0% (gases)",
    tempRange: "-20 deg C to +120 deg C",
    pressRating: "PN25 / Class 150# / Class 300#",
    bodyMoc: "SS 316 / SS 304 / Carbon Steel",
    connection: "Flanged End / Threaded (BSP/NPT)",
    connMoc: "SS 316 / SS 304 / Carbon Steel",
    flange: "ANSI B16.5 Class 150# RF / DIN PN16 / PN25",
    enclosure: "Aluminium Die-cast, Epoxy Coated (IP66/67)",
    wiring: "3-Wire System",
    comm: "HART Protocol 7.0 (optional)",
    output: "Pulse Output + 4-20 mA",
    cableGland: "Nickel Plated Brass, PG 11 / M20x1.5",
    cableEntry: "2 x M20 x 1.5",
    protection: "IP66 / IP67 / NEMA 4X",
    power: "24 V DC / 12-36 V DC",
    mounting: "Horizontal / Vertical (flow direction as marked)",
    performance1: "Min. Measurable Velocity: 0.3 m/s (liquid)",
    performance2: "Turndown Ratio: 10:1",
    performance3: "Response Time: Less than 1 second",
    accessories: ["Strainer (if required)", "Flow Conditioning Section", "Calibration Certificate (ISO 17025)", "Material Test Certificate (EN 10204 3.1)", "O&M Manual", "Test & Inspection Reports"],
    standards: ["ISO 9951", "IEC 60529 (IP66/67)", "IEC 61326 (EMC)", "OIML R49", "ISO 9001:2015 (Quality)"],
    notes: [ "Rotor and bearings MOC as per fluid compatibility.", "Upstream straight pipe run: min 10D, Downstream: min 5D.", "Flow direction arrow must match pipeline flow direction.", "Strainer recommended for fluids with suspended particles." ],
  },

  "Vortex Flowmeter": {
    type: "Vortex Flowmeter",
    make: "Flowtech",
    accuracy: "+/- 1.0% of reading (liquid/gas) / +/- 1.5% (steam)",
    tempRange: "-40 deg C to +350 deg C",
    pressRating: "PN40 / Class 300# / Class 600#",
    bodyMoc: "SS 316 / SS 304 / Duplex SS",
    connection: "Flanged End / Wafer Type",
    connMoc: "SS 316 / SS 304 / Carbon Steel",
    flange: "ANSI B16.5 Class 150# / 300# RF / DIN PN16 / PN40",
    enclosure: "Aluminium Die-cast, Epoxy Coated (IP66/67)",
    wiring: "2-Wire Loop Powered",
    comm: "HART Protocol 7.0",
    output: "4-20 mA DC + Pulse / HART",
    cableGland: "Nickel Plated Brass, PG 11 / M20x1.5",
    cableEntry: "2 x M20 x 1.5",
    protection: "IP66 / IP67 / NEMA 4X",
    power: "24 V DC (2-wire loop)",
    mounting: "Any orientation (avoid vibration sources)",
    performance1: "Min. Measurable Velocity: 0.3 m/s (liq) / 2.5 m/s (gas)",
    performance2: "Turndown Ratio: 10:1 to 30:1",
    performance3: "Temperature Compensation: Built-in (multivariable option)",
    accessories: ["Temperature Sensor (RTD Pt100) for mass flow", "Flow Straightener / Conditioner", "Calibration Certificate (ISO 17025)", "Material Test Certificate (EN 10204 3.1)", "O&M Manual"],
    standards: ["ISO/TR 15377", "IEC 60529 (IP66/67)", "IEC 61326 (EMC)", "ASME MFC-6M", "ISO 9001:2015 (Quality)"],
    notes: [ "Bluff body and sensor MOC selected for process compatibility.", "Avoid mounting near heavy vibration sources or pipe bends.", "Min 15D upstream and 5D downstream straight pipe required.", "For steam: ensure dry saturated steam condition." ],
  },

  "By-Pass Glass Tube Rotameter": {
    type: "By-Pass Glass Tube Rotameter",
    make: "Flowtech",
    accuracy: "+/- 2% of FSD",
    tempRange: "-20 deg C to +80 deg C",
    pressRating: "PN16 / 10 kg/cm2",
    bodyMoc: "MS + Powder Coated / SS 304 / SS 316",
    connection: "Flanged End (Main Line) + Threaded (Bypass)",
    connMoc: "MS / SS 304 / SS 316",
    flange: "ANSI B16.5 Class 150# RF / IS 6392 PN16",
    enclosure: "Aluminium / MS (scale enclosure)",
    wiring: "N/A (local indication)",
    comm: "N/A (local indication only)",
    output: "Local Indication (optional: 4-20 mA transmitter)",
    cableGland: "N/A",
    cableEntry: "N/A (unless transmitter fitted)",
    protection: "IP54 (enclosure) / IP66 (optional)",
    power: "N/A (unless transmitter fitted)",
    mounting: "Vertical (inlet bottom, outlet top)",
    performance1: "Scale Length: 180 mm standard (others on request)",
    performance2: "Measuring Tube: Borosilicate Glass",
    performance3: "Float: SS 316 / PTFE / Ceramic (as per fluid)",
    accessories: ["Needle Valve for flow adjustment", "Isolation Valves (inlet/outlet)", "Scale in engineering units as specified", "Calibration Certificate", "O&M Manual"],
    standards: ["VDI/VDE 3513", "IEC 60529", "ISO 9001:2015 (Quality)"],
    notes: [ "Glass tube rotameter with bypass arrangement for main pipeline.", "Measuring tube is borosilicate glass with protective shatter shield.", "Float MOC to be selected based on fluid compatibility.", "Optional: Transmitter with 4-20 mA output for remote monitoring." ],
  },

  "Oval Gear Flowmeter": {
    type: "Oval Gear Flowmeter",
    make: "Flowtech",
    accuracy: "+/- 0.5% of reading",
    tempRange: "-10 deg C to +150 deg C",
    pressRating: "PN25 / Class 150#",
    bodyMoc: "Cast Iron / SS 316 / Aluminium",
    connection: "Threaded (BSP/NPT) / Flanged",
    connMoc: "SS 316 / Cast Iron / Aluminium",
    flange: "ANSI B16.5 Class 150# RF (if flanged)",
    enclosure: "Aluminium Die-cast (IP66)",
    wiring: "3-Wire System",
    comm: "Pulse / 4-20 mA / HART (optional)",
    output: "Pulse Output + 4-20 mA",
    cableGland: "Nickel Plated Brass, PG 11",
    cableEntry: "1 x M20 x 1.5",
    protection: "IP66 / IP67",
    power: "24 V DC / Battery Operated",
    mounting: "Horizontal / Vertical",
    performance1: "Min Flow: 0.5 LPH (small sizes)",
    performance2: "Turndown Ratio: 10:1",
    performance3: "Viscosity Range: 0.3 to 1000 cP",
    accessories: ["Strainer (recommended)", "Air Eliminator (if required)", "Pulse Counter / Totalizer", "Calibration Certificate", "O&M Manual"],
    standards: ["OIML R49", "ISO 2715", "IEC 60529 (IP66/67)", "ISO 9001:2015 (Quality)"],
    notes: [ "Ideal for viscous liquids (oils, fuels, chemicals).", "Rotor gears: hardened steel / SS 316 / PPS as per fluid.", "Requires upstream strainer for fluids with particles.", "Optional: mechanical register or electronic totalizer." ],
  },

  "Ultrasonic Flowmeter": {
    type: "Ultrasonic Flowmeter",
    make: "Flowtech",
    accuracy: "+/- 1.0% of reading",
    tempRange: "-40 deg C to +120 deg C",
    pressRating: "PN16 / Class 150#",
    bodyMoc: "SS 316 / Aluminium (sensor housing)",
    connection: "Clamp-on / Insertion / Flanged (spool piece)",
    connMoc: "SS 316 (spool piece)",
    flange: "ANSI B16.5 Class 150# RF (spool type)",
    enclosure: "Aluminium Die-cast, Epoxy Coated (IP66/67)",
    wiring: "2-Wire Loop Powered",
    comm: "HART / Modbus RS-485 / BACnet",
    output: "4-20 mA DC + Pulse",
    cableGland: "Nickel Plated Brass, PG 11 / M20x1.5",
    cableEntry: "2 x M20 x 1.5",
    protection: "IP66 / IP67 / NEMA 4X",
    power: "24 V DC / Battery (clamp-on portable)",
    mounting: "Clamp-on (external) / Inline (spool)",
    performance1: "Min. Measurable Velocity: 0.03 m/s",
    performance2: "Pipe Size Range: DN15 to DN6000",
    performance3: "No pressure drop, non-intrusive measurement",
    accessories: ["Coupling Compound (clamp-on)", "Mounting Rail/Chain (clamp-on)", "Calibration Certificate", "O&M Manual"],
    standards: ["ISO 12242", "IEC 60529 (IP66/67)", "IEC 61326 (EMC)", "ISO 9001:2015 (Quality)"],
    notes: [ "Clamp-on type: no pipe cutting required.", "Pipe surface must be clean and free of paint/rust for clamp-on.", "Min 10D upstream and 5D downstream straight pipe required.", "Fluid must be homogeneous single-phase liquid." ],
  },
};

export function detectProductType(text: string): string {
  const lower = text.toLowerCase();

  // ── 1. Tag-prefix detection (most reliable) ──
  // Look for tag number patterns that indicate product type
  const tagChecks: [RegExp, string][] = [
    [/\bEMF-\d/, "Electromagnetic Flowmeter"],        // EMF-1101
    [/\bFT-\d.*turbine/i, "Turbine Flowmeter"],        // FT-201A + turbine keyword
    [/\bFT-\d.*vortex/i, "Vortex Flowmeter"],          // FT-201A + vortex keyword
    [/\bFI-\d.*rotameter/i, "By-Pass Glass Tube Rotameter"], // FI-2404A + rotameter
    [/\bFI-\d.*bypass/i, "By-Pass Glass Tube Rotameter"],    // FI-2404A + bypass
    [/\bVG-\d/, "Vortex Flowmeter"],                   // VG-xxx
    [/\bLI-\d/, "By-Pass Glass Tube Rotameter"],       // LI-xxx (level, but could be rotameter)
  ];
  for (const [pattern, product] of tagChecks) {
    if (pattern.test(text)) return product;
  }

  // ── 2. Keyword detection ──
  const checks: [string[], string][] = [
    // Bypass rotameter (check before regular rotameter)
    [["bypass", "glass tube", "rotameter"], "By-Pass Glass Tube Rotameter"],
    [["bypass rotameter"], "By-Pass Glass Tube Rotameter"],
    // Electromagnetic
    [["electromagnetic", "magmeter", "mag meter", "emf"], "Electromagnetic Flowmeter"],
    // Turbine
    [["turbine"], "Turbine Flowmeter"],
    // Vortex
    [["vortex"], "Vortex Flowmeter"],
    // Ultrasonic
    [["ultrasonic"], "Ultrasonic Flowmeter"],
    // Oval Gear
    [["oval gear"], "Oval Gear Flowmeter"],
    // Metal tube rotameter
    [["metal tube", "rotameter"], "By-Pass Glass Tube Rotameter"],
    // Glass tube rotameter (without bypass)
    [["glass tube", "rotameter"], "By-Pass Glass Tube Rotameter"],
    [["rotameter"], "By-Pass Glass Tube Rotameter"],
  ];

  for (const [keywords, product] of checks) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return product;
    }
  }

  // ── 3. Tag-only fallback ──
  // If text contains only a tag number with no other context
  if (/\bEMF-\d/i.test(text)) return "Electromagnetic Flowmeter";
  if (/\bFI-\d/i.test(text)) return "By-Pass Glass Tube Rotameter";
  if (/\bFT-\d/i.test(text)) return "Turbine Flowmeter"; // FT most commonly = turbine
  if (/\bVG-\d/i.test(text)) return "Vortex Flowmeter";

  return "Electromagnetic Flowmeter"; // default
}

export function getProductDefaults(productType: string): ProductDefaults {
  return PRODUCT_DEFAULTS[productType] || PRODUCT_DEFAULTS["Electromagnetic Flowmeter"];
}
