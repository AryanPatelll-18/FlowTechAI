// ============================================================
// Flowtech Master Datasheet Database
// Technical datasheets for all manufactured products
// ============================================================

export type DatasheetProductFamily =
  | "emf" | "vortex" | "turbine" | "oval_gear" | "ultrasonic"
  | "glass_tube_rotameter" | "metal_tube_rotameter" | "acrylic_body_rotameter" | "bypass_rotameter"
  | "magnetic_level" | "top_mounted_magnetic" | "reflex_level" | "transparent_level"
  | "tubular_level" | "float_board_level" | "radar_level" | "hydrostatic_level"
  | "smart_pressure" | "dp_pressure" | "miniature_pressure";

export interface DatasheetSection {
  heading: string;
  fields: { label: string; value: string }[];
}

export interface DatasheetMasterEntry {
  docNo: string;
  productFamily: DatasheetProductFamily;
  productName: string;
  modelSeries: string;
  revision: string;
  date: string;
  description: string;
  sections: DatasheetSection[];
  orderingInfo: { code: string; description: string }[];
  certifications: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOW METERS
// ═══════════════════════════════════════════════════════════════════════════

export const DS_EMF: DatasheetMasterEntry = {
  docNo: "FT-DS-EMF-001",
  productFamily: "emf",
  productName: "Electromagnetic Flow Meter",
  modelSeries: "FT-EMF-2000",
  revision: "Rev.3",
  date: "01/01/2024",
  description: "Flowtech Electromagnetic Flow Meter for conductive liquids with empty pipe detection, bi-directional flow measurement, and multiple output options.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Faraday's Law of Electromagnetic Induction" },
        { label: "Line Sizes", value: "DN15 to DN1200 (1/2\" to 48\")" },
        { label: "Flow Velocity Range", value: "0.1 to 15 m/s" },
        { label: "Accuracy", value: "+/-0.5% of reading (standard), +/-0.3% (optional)" },
        { label: "Repeatability", value: "+/-0.1% of reading" },
        { label: "Turndown Ratio", value: "1000:1" },
        { label: "Conductivity Required", value: "Minimum 5 uS/cm" },
        { label: "Direction of Flow", value: "Bi-directional" },
      ],
    },
    {
      heading: "Performance Specifications",
      fields: [
        { label: "Response Time", value: "Less than 100 ms (adjustable damping 0-100s)" },
        { label: "Empty Pipe Detection", value: "Standard feature" },
        { label: "Electrode Cleaning", value: "Pulse DC excitation (automatic)" },
        { label: "Span Adjustment", value: "Zero: +/-50% / Span: +/-50%" },
        { label: "Output Signal", value: "4-20mA (active/passive) / Pulse / Frequency / RS485 Modbus / HART" },
        { label: "Power Supply", value: "85-265 VAC / 18-36 VDC / Battery (optional)" },
        { label: "Display", value: "LCD 2-line x 16 character with backlight + 7-digit totalizer" },
        { label: "Communication", value: "HART / Modbus RTU / Profibus DP / Foundation Fieldbus" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Meter Tube", value: "SS 304 / SS 316" },
        { label: "Liner", value: "PTFE / PFA / Hard Rubber / Soft Rubber / Neoprene / Ceramic" },
        { label: "Electrodes", value: "SS 316L / Hastelloy C / Titanium / Tantalum / Platinum / Carbide" },
        { label: "Flanges", value: "CS IS 2062 / SS 304 / SS 316" },
        { label: "Grounding Rings", value: "SS 316L / Hastelloy C (2 nos. standard)" },
        { label: "Transmitter Housing", value: "Aluminium die-cast (epoxy coated) / SS 316" },
        { label: "Gaskets", value: "PTFE / Viton / EPDM / CAF" },
        { label: "Terminal Block", value: "Moulded terminal block with terminal cover" },
      ],
    },
    {
      heading: "Electrical Specifications",
      fields: [
        { label: "Analog Output", value: "4-20mA DC, isolated, active or passive, load resistance 0-750 Ohms" },
        { label: "Pulse Output", value: "Open collector, 24V DC max, 100mA max, pulse width 0.1-2000ms" },
        { label: "Frequency Output", value: "0-5000 Hz, 50% duty cycle" },
        { label: "Digital Output", value: "RS485 Modbus RTU / HART 7.0" },
        { label: "Cable Entry", value: "2 x M20 x 1.5 (standard) / 1/2\" NPT (optional)" },
        { label: "Enclosure Rating", value: "IP66 / IP67 / NEMA 4X" },
        { label: "Ambient Temperature", value: "Transmitter: -20 to +60 degC / Sensor: -40 to +80 degC" },
        { label: "Storage Temperature", value: "-40 to +85 degC" },
      ],
    },
    {
      heading: "Process Connections",
      fields: [
        { label: "Flange Standard", value: "IS 6392 / ANSI B16.5 / DIN EN 1092-1 / JIS B2220" },
        { label: "Flange Rating", value: "PN10 / PN16 / PN25 / PN40 / Class 150 / Class 300" },
        { label: "End Connection", value: "Flanged (standard) / Wafer / Screwed (optional)" },
        { label: "Grounding", value: "Integral grounding electrodes + external grounding rings" },
        { label: "Max Process Pressure", value: "PN40 (40 bar) standard, higher on request" },
        { label: "Max Process Temperature", value: "150 degC (PTFE/PFA liner) / 80 degC (Rubber liner) / 200 degC (Ceramic)" },
      ],
    },
    {
      heading: "Mechanical Specifications",
      fields: [
        { label: "Face-to-Face", value: "As per ISO 13359 / Manufacturer standard" },
        { label: "Mounting", value: "Flanged between pipe line (horizontal/vertical/any orientation)" },
        { label: "Overall Length", value: "Refer dimension table per line size" },
        { label: "Weight", value: "Refer weight table per line size (approx. 5-200 kg)" },
        { label: "Cable Glands", value: "2 x M20 x 1.5" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Line Size: DN15 to DN1200" },
    { code: "B", description: "Liner: T=PTFE, F=PFA, H=Hard Rubber, S=Soft Rubber, C=Ceramic" },
    { code: "C", description: "Electrode: S=SS316L, H=Hastelloy C, T=Titanium, A=Tantalum, P=Platinum" },
    { code: "D", description: "Flange: C=CS, S=SS304, M=SS316" },
    { code: "E", description: "Flange Rating: P10=PN10, P16=PN16, P25=PN25, P40=PN40, C15=Class150, C30=Class300" },
    { code: "F", description: "Output: A=4-20mA, P=Pulse, H=HART, M=Modbus" },
    { code: "G", description: "Transmitter Housing: A=Aluminium, S=SS316" },
    { code: "H", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015", "ISO 6817", "ISO 9104", "IEC 60529", "IEC 60079 (optional)", "PED 2014/68/EU"],
};

export const DS_VORTEX: DatasheetMasterEntry = {
  docNo: "FT-DS-VOR-001",
  productFamily: "vortex",
  productName: "Vortex Flow Meter",
  modelSeries: "FT-VOR-3000",
  revision: "Rev.2",
  date: "01/01/2024",
  description: "Flowtech Vortex Flow Meter for liquids, gases, and steam with built-in temperature sensor for mass flow calculation.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Von Karman Vortex Street (piezo-electric sensor)" },
        { label: "Line Sizes", value: "DN15 to DN300 (1/2\" to 12\")" },
        { label: "Flow Velocity Range (Liquid)", value: "0.3 to 7 m/s" },
        { label: "Flow Velocity Range (Gas/Steam)", value: "2 to 80 m/s" },
        { label: "Accuracy (Liquid/Gas)", value: "+/-1.0% of reading" },
        { label: "Accuracy (Steam)", value: "+/-1.5% of reading" },
        { label: "Turndown Ratio", value: "30:1" },
        { label: "Repeatability", value: "+/-0.2% of reading" },
      ],
    },
    {
      heading: "Performance Specifications",
      fields: [
        { label: "Response Time", value: "Less than 1 second" },
        { label: "Temperature Compensation", value: "Built-in PT100 for mass flow of steam" },
        { label: "Low Flow Cut-off", value: "Adjustable 0-10% of full scale" },
        { label: "Output Signal", value: "4-20mA / Pulse / HART / RS485 Modbus" },
        { label: "Power Supply", value: "12-36 VDC (2-wire loop powered) / 85-265 VAC" },
        { label: "Display", value: "LCD with backlight + push buttons for configuration" },
        { label: "Communication", value: "HART / Modbus RTU" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Body", value: "SS 304 / SS 316 / CF8M" },
        { label: "Bluff Body (Vortex Shedder)", value: "SS 316L / Hastelloy C" },
        { label: "Sensor Diaphragm", value: "SS 316L / Hastelloy C" },
        { label: "Transmitter Housing", value: "Aluminium die-cast (epoxy coated)" },
        { label: "Gaskets", value: "Spiral wound SS 316 + Graphite / PTFE" },
        { label: "O-rings", value: "Viton / EPDM / FFKM" },
      ],
    },
    {
      heading: "Process & Environmental",
      fields: [
        { label: "End Connection", value: "Flanged / Wafer (ANSI/DIN/IS)" },
        { label: "Flange Rating", value: "PN16 / PN40 / Class 150 / Class 300" },
        { label: "Max Process Pressure", value: "PN40 (40 bar)" },
        { label: "Max Process Temperature", value: "350 degC (with cooling extension)" },
        { label: "Ambient Temperature", value: "-40 to +85 degC" },
        { label: "Enclosure Rating", value: "IP66/67, NEMA 4X" },
        { label: "Mounting", value: "Flanged/Wafer (horizontal/vertical)" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Line Size: DN15 to DN300" },
    { code: "B", description: "Body: S=SS304, M=SS316, C=CF8M" },
    { code: "C", description: "Bluff Body: S=SS316L, H=Hastelloy C" },
    { code: "D", description: "Connection: F=Flanged, W=Wafer" },
    { code: "E", description: "Output: A=4-20mA, P=Pulse, H=HART" },
    { code: "F", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015", "ISO TR 12764", "IEC 60529", "IEC 60079 (optional)"],
};

export const DS_TURBINE: DatasheetMasterEntry = {
  docNo: "FT-DS-TUR-001",
  productFamily: "turbine",
  productName: "Turbine Flow Meter",
  modelSeries: "FT-TUR-4000",
  revision: "Rev.2",
  date: "01/01/2024",
  description: "Flowtech Turbine Flow Meter with precision rotor and ceramic bearings for clean liquid applications. High accuracy and excellent repeatability.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Turbine rotor - velocity proportional to flow rate" },
        { label: "Line Sizes", value: "DN10 to DN300 (3/8\" to 12\")" },
        { label: "Turndown Ratio", value: "10:1 to 20:1" },
        { label: "Accuracy", value: "+/-0.5% of reading (standard), +/-0.25% (high accuracy)" },
        { label: "Repeatability", value: "+/-0.05% of reading" },
        { label: "Viscosity Range", value: "0.8 to 30 cSt (optimal)" },
        { label: "Min Filter Size", value: "75 micron (recommended)" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Body", value: "SS 316 / SS 304 / Brass" },
        { label: "Rotor", value: "SS 430F / CD4MCU / Rilon" },
        { label: "Bearings", value: "Tungsten carbide / Ceramic / PTFE" },
        { label: "Shaft", value: "SS 17-4PH / Tungsten carbide" },
        { label: "Pickup Coil Housing", value: "SS 316 / Aluminium" },
        { label: "Gaskets", value: "PTFE / Viton / Graphoil" },
      ],
    },
    {
      heading: "Process & Electrical",
      fields: [
        { label: "End Connection", value: "Threaded / Flanged / Tri-clamp" },
        { label: "Max Process Pressure", value: "PN100 (100 bar)" },
        { label: "Max Process Temperature", value: "150 degC (standard), 300 degC (high temp)" },
        { label: "Output", value: "Pulse / 4-20mA + HART / RS485" },
        { label: "Power Supply", value: "12-36 VDC / 85-265 VAC" },
        { label: "Display", value: "LCD with rate + totalizer" },
        { label: "Enclosure", value: "IP66 / IP67" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Line Size: DN10 to DN300" },
    { code: "B", description: "Body: S=SS316, F=SS304, B=Brass" },
    { code: "C", description: "Connection: T=Threaded, F=Flanged, C=Tri-clamp" },
    { code: "D", description: "Output: P=Pulse, A=4-20mA" },
    { code: "E", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015", "OIML R49", "ISO 4064"],
};

export const DS_OVAL_GEAR: DatasheetMasterEntry = {
  docNo: "FT-DS-OVG-001",
  productFamily: "oval_gear",
  productName: "Oval Gear Flow Meter",
  modelSeries: "FT-OVG-5000",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Flowtech Oval Gear Flow Meter with precision-machined oval rotors for high-viscosity liquid measurement. Positive displacement technology.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Positive displacement - oval gear rotation" },
        { label: "Line Sizes", value: "DN15 to DN100 (1/2\" to 4\")" },
        { label: "Turndown Ratio", value: "10:1" },
        { label: "Accuracy", value: "+/-0.2% of reading (standard), +/-0.1% (optional)" },
        { label: "Repeatability", value: "+/-0.05% of reading" },
        { label: "Viscosity Range", value: "0.3 to 1000 cP (up to 100000 cP optional)" },
        { label: "Max Flow Rate", value: "Refer to flow range table per size" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Body", value: "Cast iron / SS 316 / Aluminium" },
        { label: "Oval Rotors", value: "SS 316 / PPS / Aluminium" },
        { label: "Bearings", value: "Tungsten carbide / PEEK" },
        { label: "Shaft", value: "SS 316 / Hastelloy C" },
        { label: "Register/Counter", value: "Aluminium (mechanical) / SS (electronic)" },
        { label: "O-rings", value: "Viton / EPDM / FFKM" },
      ],
    },
    {
      heading: "Process & Electrical",
      fields: [
        { label: "End Connection", value: "Flanged / Screwed / Tri-clamp" },
        { label: "Max Process Pressure", value: "PN100 (100 bar)" },
        { label: "Max Process Temperature", value: "200 degC" },
        { label: "Output", value: "Mechanical register / Pulse / 4-20mA" },
        { label: "Power Supply", value: "Self-powered (mech) / 12-24 VDC (electronic)" },
        { label: "Display", value: "Mechanical counter / LCD" },
        { label: "Enclosure", value: "IP65 / IP67" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Line Size: DN15 to DN100" },
    { code: "B", description: "Body: I=Cast Iron, S=SS316, A=Aluminium" },
    { code: "C", description: "Connection: F=Flanged, S=Screwed, T=Tri-clamp" },
    { code: "D", description: "Output: M=Mechanical, P=Pulse, A=4-20mA" },
    { code: "E", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015", "OIML R49-1", "ISO 2714"],
};

export const DS_ULTRASONIC: DatasheetMasterEntry = {
  docNo: "FT-DS-ULT-001",
  productFamily: "ultrasonic",
  productName: "Insertion Type Ultrasonic Flow Meter",
  modelSeries: "FT-ULT-7000",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Flowtech Insertion Type Ultrasonic Flow Meter with clamp-on or inline transducers. Non-invasive flow measurement for conductive and non-conductive liquids.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Transit-time ultrasonic (clamp-on or inline)" },
        { label: "Pipe Sizes (Clamp-on)", value: "DN15 to DN6000" },
        { label: "Pipe Sizes (Inline)", value: "DN25 to DN300" },
        { label: "Flow Velocity Range", value: "0.01 to 25 m/s" },
        { label: "Accuracy (Clamp-on)", value: "+/-1.0% of reading" },
        { label: "Accuracy (Inline)", value: "+/-0.5% of reading" },
        { label: "Turndown Ratio", value: "100:1" },
        { label: "Repeatability", value: "+/-0.2% of reading" },
      ],
    },
    {
      heading: "Process & Electrical",
      fields: [
        { label: "Max Process Temperature (Clamp-on)", value: "120 degC" },
        { label: "Max Process Temperature (Inline)", value: "200 degC" },
        { label: "Max Process Pressure (Inline)", value: "PN40" },
        { label: "Output", value: "4-20mA + HART / Pulse / RS485 / BACnet" },
        { label: "Power Supply", value: "24 VDC / Battery (portable)" },
        { label: "Display", value: "LCD graphic + data logger" },
        { label: "Enclosure", value: "IP66 / IP67 / NEMA 4X" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Type: C=Clamp-on, I=Inline" },
    { code: "B", description: "Pipe Size: DN15 to DN6000" },
    { code: "C", description: "Output: A=4-20mA, H=HART, M=Modbus" },
    { code: "D", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015", "ISO 20456"],
};

// ═══════════════════════════════════════════════════════════════════════════
// ROTAMETERS (Variable Area Flowmeters)
// ═══════════════════════════════════════════════════════════════════════════

export const DS_GLASS_TUBE_ROTAMETER: DatasheetMasterEntry = {
  docNo: "FT-DS-GTR-001",
  productFamily: "glass_tube_rotameter",
  productName: "Glass Tube Rotameter",
  modelSeries: "FT-ROT-6000",
  revision: "Rev.2",
  date: "01/01/2024",
  description: "Flowtech Glass Tube Rotameter with borosilicate glass tube, precision float, and direct reading scale for low-pressure liquid and gas flow measurement.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Variable area - float position proportional to flow" },
        { label: "Tube Sizes", value: "15 mm to 150 mm OD" },
        { label: "Flow Range (Water)", value: "0.1 lph to 150000 lph" },
        { label: "Flow Range (Air)", value: "1 lph to 300000 lph at STP" },
        { label: "Accuracy", value: "+/-1.0% to +/-2.0% of FSD" },
        { label: "Turndown Ratio", value: "10:1" },
        { label: "Repeatability", value: "+/-0.5% of FSD" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Tube", value: "Borosilicate glass (standard) / SS 316 (metal optional)" },
        { label: "Float", value: "SS 316 / SS 316L / PTFE / Titanium / Sapphire" },
        { label: "End Fittings", value: "SS 316 / CS / PP / PVC" },
        { label: "Scale Housing", value: "Aluminium anodized" },
        { label: "Guide Rods", value: "SS 316 / Hastelloy C" },
        { label: "Gaskets", value: "PTFE / Viton / EPDM" },
        { label: "Protective Shield", value: "Polycarbonate tube guard (optional)" },
      ],
    },
    {
      heading: "Process & Mechanical",
      fields: [
        { label: "End Connection", value: "Screwed / Flanged / Tri-clamp / Hose nipple" },
        { label: "Connection Size", value: "15NB to 150NB" },
        { label: "Max Process Pressure", value: "16 bar (glass) / 40 bar (metal tube optional)" },
        { label: "Max Process Temperature", value: "120 degC (glass) / 400 degC (metal tube)" },
        { label: "Mounting", value: "Vertical only (flow upward)" },
        { label: "Overall Length", value: "200 mm to 1500 mm" },
        { label: "Scale Length", value: "150 mm to 1200 mm" },
        { label: "Weight", value: "0.5 kg to 15 kg" },
        { label: "Enclosure", value: "IP54 (standard) / IP65 (optional)" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Tube Size: 15mm to 150mm" },
    { code: "B", description: "Tube: G=Glass, M=Metal" },
    { code: "C", description: "Float: S=SS316, T=SS316L, P=PTFE, I=Titanium" },
    { code: "D", description: "Connection: S=Screwed, F=Flanged, C=Tri-clamp" },
    { code: "E", description: "End Fitting: S=SS316, C=CS, P=PP" },
    { code: "F", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015", "VDI/VDE 3513"],
};

export const DS_METAL_TUBE_ROTAMETER: DatasheetMasterEntry = {
  docNo: "FT-DS-MTR-001",
  productFamily: "metal_tube_rotameter",
  productName: "Metal Tube Rotameter",
  modelSeries: "FT-MTR-6000",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Flowtech Metal Tube Rotameter with magnetic float and external transmitter for high-pressure, high-temperature applications where glass tubes are unsuitable.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Variable area - magnetic float with external indicator" },
        { label: "Line Sizes", value: "DN15 to DN150 (1/2\" to 6\")" },
        { label: "Flow Range (Water)", value: "Refer to flow table per size" },
        { label: "Accuracy", value: "+/-1.5% of FSD (local), +/-1.0% (with transmitter)" },
        { label: "Turndown Ratio", value: "10:1" },
        { label: "Repeatability", value: "+/-0.5% of FSD" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Tube", value: "SS 316 / SS 304 / Hastelloy C" },
        { label: "Float", value: "SS 316L / PTFE coated / Titanium" },
        { label: "End Fittings", value: "SS 316 / CS / Hastelloy C" },
        { label: "Indicator Housing", value: "Aluminium anodized / SS 316" },
        { label: "Gaskets", value: "PTFE / Graphoil / Viton" },
      ],
    },
    {
      heading: "Process & Electrical",
      fields: [
        { label: "End Connection", value: "Flanged / Screwed (ANSI/DIN/IS)" },
        { label: "Max Process Pressure", value: "100 bar" },
        { label: "Max Process Temperature", value: "400 degC" },
        { label: "Output", value: "Local indication / 4-20mA transmitter / Switches" },
        { label: "Power Supply", value: "24 VDC (transmitter)" },
        { label: "Display", value: "Local mechanical indicator + optional LCD" },
        { label: "Enclosure", value: "IP66 / IP67" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Line Size: DN15 to DN150" },
    { code: "B", description: "Tube: S=SS316, H=Hastelloy C" },
    { code: "C", description: "Connection: F=Flanged, S=Screwed" },
    { code: "D", description: "Output: L=Local, T=Transmitter, S=Switches" },
    { code: "E", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015", "VDI/VDE 3513"],
};

export const DS_ACRYLIC_BODY_ROTAMETER: DatasheetMasterEntry = {
  docNo: "FT-DS-ABR-001",
  productFamily: "acrylic_body_rotameter",
  productName: "Acrylic Body Rotameter",
  modelSeries: "FT-ABR-6000",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Flowtech Acrylic Body Rotameter with moulded acrylic body for water treatment, chemical dosing, and low-pressure applications. Economical and lightweight.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Variable area - float position proportional to flow" },
        { label: "Body Sizes", value: "15 mm to 100 mm" },
        { label: "Flow Range (Water)", value: "0.5 lph to 50000 lph" },
        { label: "Accuracy", value: "+/-2.0% of FSD" },
        { label: "Turndown Ratio", value: "10:1" },
        { label: "Scale", value: "Direct reading on acrylic body" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Body", value: "Moulded acrylic (transparent)" },
        { label: "Float", value: "SS 316 / PTFE / Sapphire" },
        { label: "End Fittings", value: "PP / PVC / SS 316" },
        { label: "Guide Rods", value: "SS 316 / Ceramic" },
        { label: "O-rings", value: "Viton / EPDM / Silicone" },
      ],
    },
    {
      heading: "Process & Mechanical",
      fields: [
        { label: "End Connection", value: "Screwed (BSP/NPT) / Hose barb / Flanged (small)" },
        { label: "Max Process Pressure", value: "10 bar" },
        { label: "Max Process Temperature", value: "60 degC" },
        { label: "Mounting", value: "Vertical only (flow upward)" },
        { label: "Overall Length", value: "150 mm to 600 mm" },
        { label: "Weight", value: "0.2 kg to 3 kg" },
        { label: "Enclosure", value: "IP54" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Body Size: 15mm to 100mm" },
    { code: "B", description: "Float: S=SS316, P=PTFE" },
    { code: "C", description: "Connection: S=Screwed, H=Hose, F=Flanged" },
    { code: "D", description: "End Fitting: P=PP, V=PVC, S=SS316" },
    { code: "E", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015"],
};

export const DS_BYPASS_ROTAMETER: DatasheetMasterEntry = {
  docNo: "FT-DS-BPR-001",
  productFamily: "bypass_rotameter",
  productName: "By Pass Rotameter",
  modelSeries: "FT-BPR-6000",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Flowtech By Pass Rotameter with orifice plate and side-mounted rotameter for large pipeline flow measurement. Cost-effective solution for high flow rates.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "By-pass variable area - orifice plate creates differential pressure" },
        { label: "Main Line Sizes", value: "DN50 to DN600 (2\" to 24\")" },
        { label: "By-pass Meter Size", value: "DN15 to DN50" },
        { label: "Flow Range (Water)", value: "Refer to sizing table" },
        { label: "Accuracy", value: "+/-2.0% to +/-3.0% of FSD" },
        { label: "Turndown Ratio", value: "10:1" },
        { label: "Repeatability", value: "+/-1.0% of FSD" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Orifice Plate", value: "SS 316 / SS 304 / Hastelloy C" },
        { label: "By-pass Meter Tube", value: "Borosilicate glass / SS 316" },
        { label: "Float", value: "SS 316 / PTFE" },
        { label: "Piping", value: "SS 316 / CS (schedule 40/80)" },
        { label: "Flanges", value: "CS / SS 316" },
        { label: "Valves", value: "Needle valves SS 316 (2 nos.)" },
      ],
    },
    {
      heading: "Process & Mechanical",
      fields: [
        { label: "Main Line Connection", value: "Flanged (ANSI/DIN/IS)" },
        { label: "Flange Rating", value: "PN16 / PN25 / PN40 / Class 150" },
        { label: "Max Process Pressure", value: "40 bar" },
        { label: "Max Process Temperature", value: "120 degC (glass) / 200 degC (metal)" },
        { label: "Mounting", value: "Horizontal/Vertical (bypass line vertical)" },
        { label: "Enclosure", value: "IP54 / IP65" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Main Line: DN50 to DN600" },
    { code: "B", description: "Bypass Meter: G=Glass, M=Metal" },
    { code: "C", description: "Flange: C=CS, S=SS316" },
    { code: "D", description: "Rating: P16=PN16, P25=PN25, P40=PN40" },
    { code: "E", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015"],
};

// ═══════════════════════════════════════════════════════════════════════════
// LEVEL DEVICES
// ═══════════════════════════════════════════════════════════════════════════

export const DS_MAGNETIC_LEVEL: DatasheetMasterEntry = {
  docNo: "FT-DS-MLI-001",
  productFamily: "magnetic_level",
  productName: "Side Mounted Magnetic Level Indicator",
  modelSeries: "FT-MLI-8000",
  revision: "Rev.2",
  date: "01/01/2024",
  description: "Flowtech Side Mounted Magnetic Level Indicator with float chamber, magnetic float, and external bi-colour flapper/roller indication for tank level monitoring. Suitable for boilers, vessels, and storage tanks.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Magnetic coupling - float with internal magnets drives external visual indicator" },
        { label: "Indicator Type", value: "Bi-colour flapper (red/green) / roller type / capsule type" },
        { label: "Visibility", value: "Visible from 50+ meters distance" },
        { label: "Accuracy", value: "+/-5 mm visual, +/-2 mm with transmitter" },
        { label: "Repeatability", value: "+/-2 mm" },
        { label: "Max Measuring Range", value: "50 mm to 6000 mm (custom up to 10000 mm)" },
        { label: "Operating Principle", value: "Magnetic float rises/falls with liquid level" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Chamber Tube", value: "SS 304 / SS 316 / SS 316L" },
        { label: "Float", value: "SS 316L / Titanium (seamless welded)" },
        { label: "Flapper Assembly", value: "ABS / Aluminium anodized / SS 316" },
        { label: "End Covers", value: "SS 304 / SS 316 / CS (machined)" },
        { label: "Process Connections", value: "SS 304 / SS 316 / CS" },
        { label: "Gaskets", value: "CAF / PTFE / Graphoil / Spiral wound SS316+Graphite" },
        { label: "Bolts & Nuts", value: "SS 304 / SS 316 / CS zinc plated (8.8 grade)" },
        { label: "Drain/Vent Valves", value: "SS 316 needle valves (1/2\" NPT)" },
        { label: "Scale", value: "Aluminium anodized with etched markings (mm/inches)" },
      ],
    },
    {
      heading: "Process Specifications",
      fields: [
        { label: "Process Connection", value: "Flanged / Screwed / Tri-clamp (side mounted)" },
        { label: "Connection Size", value: "25NB to 80NB" },
        { label: "Flange Standard", value: "IS 6392 / ANSI B16.5 / DIN EN 1092-1 / JIS B2220" },
        { label: "Flange Rating", value: "PN10 / PN16 / PN25 / PN40 / Class 150 / Class 300" },
        { label: "Max Process Pressure", value: "64 bar (standard) / 100 bar (high pressure)" },
        { label: "Max Process Temperature", value: "400 degC (with insulation/high temp design)" },
        { label: "Min Fluid Density", value: "400 kg/m3" },
        { label: "Mounting", value: "Side mounted to vessel (2 process connections)" },
      ],
    },
    {
      heading: "Optional Features",
      fields: [
        { label: "Level Transmitter", value: "Magnetostrictive (4-20mA + HART) - accuracy +/-0.5mm" },
        { label: "Level Switches", value: "Reed switch (SPDT/DPDT) - max 4 nos." },
        { label: "Heating Jacket", value: "Steam/electrical tracing for viscous fluids" },
        { label: "Insulation", value: "Insulation jacket for cryogenic applications" },
        { label: "Switch Housing", value: "Weatherproof IP65 / Flameproof Ex-d" },
        { label: "Transmitter Housing", value: "Aluminium die-cast IP66 / SS 316" },
        { label: "Cable Entry", value: "2 x M20 x 1.5 (switch/transmitter)" },
      ],
    },
    {
      heading: "Mechanical Specifications",
      fields: [
        { label: "Centre to Centre Distance", value: "As per user requirement (custom)" },
        { label: "Overall Length", value: "C/C + 200 mm (top/bottom extension)" },
        { label: "Weight", value: "5 kg/meter (approx., varies with size)" },
        { label: "Mounting Brackets", value: "Adjustable wall/stand mounting brackets" },
        { label: "Transport Protection", value: "Wooden box with polythene wrapping" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "C/C Distance: 50mm to 6000mm" },
    { code: "B", description: "Chamber: S=SS304, M=SS316, L=SS316L" },
    { code: "C", description: "Float: M=SS316L, T=Titanium" },
    { code: "D", description: "Indicator: F=Flapper, R=Roller, C=Capsule" },
    { code: "E", description: "Connection: F=Flanged, S=Screwed" },
    { code: "F", description: "Flange Rating: P10=PN10, P16=PN16, P25=PN25, P40=PN40" },
    { code: "G", description: "Options: T=Transmitter, W=Switches, J=Jacket, I=Insulation" },
    { code: "H", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015", "ISO 9001:2015", "PED 2014/68/EU", "SIL 2 (optional)"],
};

export const DS_TOP_MOUNTED_MAGNETIC: DatasheetMasterEntry = {
  docNo: "FT-DS-TML-001",
  productFamily: "top_mounted_magnetic",
  productName: "Top Mounted Magnetic Level Indicator",
  modelSeries: "FT-TML-8000",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Flowtech Top Mounted Magnetic Level Indicator with top-entry float for underground tanks, sumps, and vessels where side mounting is not possible. Bi-colour visual indication with optional transmitter and switches.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Magnetic coupling - top-entry float with internal magnets" },
        { label: "Indicator Type", value: "Bi-colour flapper (red/green) / roller type" },
        { label: "Mounting Type", value: "Top mounted (single process connection)" },
        { label: "Accuracy", value: "+/-5 mm visual, +/-2 mm with transmitter" },
        { label: "Max Measuring Range", value: "200 mm to 3000 mm" },
        { label: "Max Insertion Depth", value: "3000 mm (standard) / 6000 mm (custom)" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Guide Tube", value: "SS 304 / SS 316 / SS 316L" },
        { label: "Float", value: "SS 316L / Titanium" },
        { label: "Flapper Assembly", value: "ABS / Aluminium anodized" },
        { label: "Top Flange", value: "SS 304 / SS 316 / CS" },
        { label: "Gaskets", value: "CAF / PTFE / Graphoil" },
        { label: "Bolts & Nuts", value: "SS 304 / SS 316 / CS 8.8 grade" },
        { label: "Scale", value: "Aluminium anodized (mm/inches)" },
      ],
    },
    {
      heading: "Process Specifications",
      fields: [
        { label: "Process Connection", value: "Flanged (top entry)" },
        { label: "Connection Size", value: "80NB to 150NB" },
        { label: "Flange Standard", value: "IS 6392 / ANSI B16.5 / DIN" },
        { label: "Flange Rating", value: "PN10 / PN16 / PN25 / PN40 / Class 150" },
        { label: "Max Process Pressure", value: "40 bar" },
        { label: "Max Process Temperature", value: "350 degC" },
        { label: "Min Fluid Density", value: "500 kg/m3" },
      ],
    },
    {
      heading: "Optional Features",
      fields: [
        { label: "Level Transmitter", value: "Magnetostrictive (4-20mA + HART)" },
        { label: "Level Switches", value: "Reed switch SPDT/DPDT - max 4 nos." },
        { label: "Heating Jacket", value: "Steam/electrical tracing" },
        { label: "Cable Entry", value: "2 x M20 x 1.5" },
        { label: "Switch Housing", value: "IP65 / Ex-d" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Insert Length: 200mm to 3000mm" },
    { code: "B", description: "Guide Tube: S=SS304, M=SS316, L=SS316L" },
    { code: "C", description: "Float: M=SS316L, T=Titanium" },
    { code: "D", description: "Indicator: F=Flapper, R=Roller" },
    { code: "E", description: "Flange Rating: P10=PN10, P16=PN16, P25=PN25, P40=PN40" },
    { code: "F", description: "Options: T=Transmitter, W=Switches" },
    { code: "G", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015"],
};

export const DS_REFLEX_LEVEL: DatasheetMasterEntry = {
  docNo: "FT-DS-RLG-001",
  productFamily: "reflex_level",
  productName: "Reflex Level Gauge",
  modelSeries: "FT-RLG-8100",
  revision: "Rev.2",
  date: "01/01/2024",
  description: "Flowtech Reflex Level Gauge with prismatic glass and reflex grooves for clear liquid level indication. Light entering the grooves reflects differently when covered by liquid vs vapour, creating a sharp visible distinction.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Reflex glass - prismatic grooves reflect light differently for liquid/vapour" },
        { label: "Glass Type", value: "Toughened borosilicate (prismatic reflex)" },
        { label: "Visibility", value: "Clear distinction between liquid (dark) and vapour (silver/bright)" },
        { label: "Max Measuring Range", value: "150 mm to 2000 mm (single section)" },
        { label: "Section Length", value: "150 / 200 / 250 / 300 / 340 / 400 / 500 mm per section" },
        { label: "Accuracy", value: "+/-3 mm per section joint" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Body/Frame", value: "CS IS 2062 / SS 304 / SS 316" },
        { label: "Cover Plate", value: "CS / SS 304 / SS 316 (machined)" },
        { label: "Glass", value: "Toughened borosilicate prismatic glass (reflex type)" },
        { label: "Gaskets", value: "CAF / PTFE / Graphoil / Klinger C-4400" },
        { label: "Bolts & Nuts", value: "SS 304 / SS 316 / CS zinc plated (8.8 grade)" },
        { label: "Wiper Assembly", value: "SS 316 with neoprene wiper (optional)" },
        { label: "Illuminator", value: "LED illuminator (optional, Ex-proof)" },
        { label: "Scale", value: "Aluminium anodized with etched markings" },
      ],
    },
    {
      heading: "Process Specifications",
      fields: [
        { label: "Process Connection", value: "Flanged (side/side or side/bottom)" },
        { label: "Connection Size", value: "15NB to 50NB" },
        { label: "Flange Standard", value: "IS 6392 / ANSI B16.5 / DIN EN 1092-1" },
        { label: "Flange Rating", value: "PN10 / PN16 / PN25 / PN40 / PN64 / Class 150 / Class 300" },
        { label: "Max Process Pressure", value: "64 bar (standard) / 100 bar (HP design)" },
        { label: "Max Process Temperature", value: "400 degC (standard) / 500 degC (high temp)" },
        { label: "Min Visible Width", value: "20 mm (standard)" },
        { label: "Mounting", value: "Side mounted to vessel (2 process connections)" },
      ],
    },
    {
      heading: "Optional Features",
      fields: [
        { label: "Heating Jacket", value: "Steam/electrical jacket for solidifying fluids" },
        { label: "Illuminator", value: "LED light source for dark environments" },
        { label: "Mica Shield", value: "Mica protection for steam/high temperature" },
        { label: "Wiper System", value: "Internal/external wiper for dirty applications" },
        { label: "Auto-Close Valves", value: "Spring-loaded ball check valves (safety)" },
        { label: "Drain/Vent", value: "1/2\" NPT drain/vent plugs" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Visible Length: 150mm to 2000mm" },
    { code: "B", description: "Body: C=CS, S=SS304, M=SS316" },
    { code: "C", description: "Connection: F=Flanged, S=Screwed" },
    { code: "D", description: "Flange Rating: P10=PN10, P16=PN16, P25=PN25, P40=PN40" },
    { code: "E", description: "Section Length: 150/200/250/300/340/400/500 mm" },
    { code: "F", description: "Options: J=Jacket, I=Illuminator, M=Mica, W=Wiper" },
    { code: "G", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015", "ASME B40.200", "DIN 7079"],
};

export const DS_TRANSPARENT_LEVEL: DatasheetMasterEntry = {
  docNo: "FT-DS-TLG-001",
  productFamily: "transparent_level",
  productName: "Transparent Level Gauge",
  modelSeries: "FT-TLG-8200",
  revision: "Rev.2",
  date: "01/01/2024",
  description: "Flowtech Transparent Level Gauge with flat glass windows on both sides for viewing liquid colour, clarity, interface. Two flat glasses with liquid column between them - ideal for coloured liquids, interface detection.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Transparent glass - liquid column visible through two flat glasses" },
        { label: "Glass Type", value: "Toughened borosilicate (flat glass)" },
        { label: "Visibility", value: "Full visibility of liquid colour, clarity, and interface" },
        { label: "Max Measuring Range", value: "150 mm to 2000 mm (single section)" },
        { label: "Section Length", value: "150 / 200 / 250 / 300 / 340 / 400 / 500 mm per section" },
        { label: "Accuracy", value: "+/-3 mm per section joint" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Body/Frame", value: "CS IS 2062 / SS 304 / SS 316" },
        { label: "Cover Plate", value: "CS / SS 304 / SS 316 (machined)" },
        { label: "Glass", value: "Toughened borosilicate flat glass (transparent type)" },
        { label: "Gaskets", value: "CAF / PTFE / Graphoil / Klinger C-4400" },
        { label: "Bolts & Nuts", value: "SS 304 / SS 316 / CS zinc plated (8.8 grade)" },
        { label: "Illuminator", value: "LED illuminator (optional, Ex-proof)" },
        { label: "Scale", value: "Aluminium anodized with etched markings" },
      ],
    },
    {
      heading: "Process Specifications",
      fields: [
        { label: "Process Connection", value: "Flanged (side/side or side/bottom)" },
        { label: "Connection Size", value: "15NB to 50NB" },
        { label: "Flange Standard", value: "IS 6392 / ANSI B16.5 / DIN EN 1092-1" },
        { label: "Flange Rating", value: "PN10 / PN16 / PN25 / PN40 / PN64 / Class 150 / Class 300" },
        { label: "Max Process Pressure", value: "64 bar (standard) / 100 bar (HP design)" },
        { label: "Max Process Temperature", value: "400 degC (standard) / 500 degC (high temp)" },
        { label: "Min Visible Width", value: "20 mm (standard)" },
        { label: "Mounting", value: "Side mounted to vessel (2 process connections)" },
      ],
    },
    {
      heading: "Optional Features",
      fields: [
        { label: "Heating Jacket", value: "Steam/electrical jacket for solidifying fluids" },
        { label: "Illuminator", value: "LED light source (back-lighting)" },
        { label: "Mica Shield", value: "Mica protection for steam/high temperature" },
        { label: "Wiper System", value: "Internal/external wiper for dirty applications" },
        { label: "Auto-Close Valves", value: "Spring-loaded ball check valves (safety)" },
        { label: "Drain/Vent", value: "1/2\" NPT drain/vent plugs" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Visible Length: 150mm to 2000mm" },
    { code: "B", description: "Body: C=CS, S=SS304, M=SS316" },
    { code: "C", description: "Connection: F=Flanged, S=Screwed" },
    { code: "D", description: "Flange Rating: P10=PN10, P16=PN16, P25=PN25, P40=PN40" },
    { code: "E", description: "Section Length: 150/200/250/300/340/400/500 mm" },
    { code: "F", description: "Options: J=Jacket, I=Illuminator, M=Mica, W=Wiper" },
    { code: "G", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015", "ASME B40.200", "DIN 7079"],
};

export const DS_TUBULAR_LEVEL: DatasheetMasterEntry = {
  docNo: "FT-DS-TUG-001",
  productFamily: "tubular_level",
  productName: "Tubular Level Gauge",
  modelSeries: "FT-TUG-8300",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Flowtech Tubular Level Gauge with single glass tube for low-pressure tanks and vessels. Simple, economical design for water, diesel, and non-hazardous liquids. Direct reading with end block fittings.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Direct reading - liquid rises in glass tube to actual level" },
        { label: "Glass Type", value: "Borosilicate glass tube (plain)" },
        { label: "Visibility", value: "Direct visual of liquid level in transparent tube" },
        { label: "Max Measuring Range", value: "150 mm to 2000 mm" },
        { label: "Tube Diameter", value: "15 mm OD / 20 mm OD / 25 mm OD" },
        { label: "Accuracy", value: "+/-3 mm" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "End Blocks", value: "CS / SS 304 / SS 316 / Gunmetal / PP" },
        { label: "Glass Tube", value: "Borosilicate glass (plain, toughened)" },
        { label: "Gaskets", value: "Rubber / CAF / PTFE / EPDM" },
        { label: "Nuts", value: "MS zinc plated / SS 304" },
        { label: "Protective Cover", value: "SS 304 channel (U-shaped) or polycarbonate" },
        { label: "Scale", value: "Aluminium anodized (mm/inches)" },
      ],
    },
    {
      heading: "Process Specifications",
      fields: [
        { label: "Process Connection", value: "Screwed (BSP/NPT) / Flanged (small)" },
        { label: "Connection Size", value: "15NB to 25NB" },
        { label: "Max Process Pressure", value: "10 bar" },
        { label: "Max Process Temperature", value: "120 degC (standard) / 200 degC (high temp gasket)" },
        { label: "Mounting", value: "Side mounted to tank (2 process connections)" },
        { label: "Applicable Fluids", value: "Water, diesel, non-hazardous, non-corrosive liquids" },
      ],
    },
    {
      heading: "Optional Features",
      fields: [
        { label: "Ball Check Valves", value: "Automatic shut-off ball valves (safety)" },
        { label: "Drain Cock", value: "1/2\" drain cock at bottom" },
        { label: "Vent Plug", value: "1/2\" vent at top" },
        { label: "Protective Channel", value: "SS 304 U-channel with polycarbonate cover" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Visible Length: 150mm to 2000mm" },
    { code: "B", description: "Tube OD: 15mm / 20mm / 25mm" },
    { code: "C", description: "End Block: C=CS, S=SS304, M=SS316, G=Gunmetal, P=PP" },
    { code: "D", description: "Connection: S=Screwed, F=Flanged" },
    { code: "E", description: "Options: B=Ball check valves, D=Drain cock" },
    { code: "F", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015"],
};

export const DS_FLOAT_BOARD_LEVEL: DatasheetMasterEntry = {
  docNo: "FT-DS-FBL-001",
  productFamily: "float_board_level",
  productName: "Float & Board Level Indicator",
  modelSeries: "FT-FBL-8400",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Flowtech Float & Board Level Indicator for large storage tanks, water reservoirs, and effluent tanks. Float follows liquid level, indicator board visible on tank top. Simple, maintenance-free design.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Mechanical float with pulley/counterweight and indicator board" },
        { label: "Indicator Type", value: "Moving pointer on calibrated scale board" },
        { label: "Scale Board", value: "Aluminium anodized / GI powder coated (weatherproof)" },
        { label: "Max Measuring Range", value: "500 mm to 15000 mm" },
        { label: "Accuracy", value: "+/-10 mm" },
        { label: "Repeatability", value: "+/-5 mm" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Float", value: "SS 304 / SS 316 / PP (hollow, sealed)" },
        { label: "Float Diameter", value: "150 mm / 200 mm / 250 mm / 300 mm" },
        { label: "Guide Wire/Rope", value: "SS 316 wire rope with nylon coating" },
        { label: "Pulley", value: "Nylon / Aluminium / SS 316" },
        { label: "Counter Weight", value: "Lead encapsulated in SS 304 / coated iron" },
        { label: "Scale Board", value: "Aluminium anodized with engraved markings" },
        { label: "Mounting Bracket", value: "MS angle / channel (galvanized/painted)" },
        { label: "Anchor", value: "SS 316 eye bolt (bottom anchor)" },
      ],
    },
    {
      heading: "Process Specifications",
      fields: [
        { label: "Process Connection", value: "Top of tank (no process connection required)" },
        { label: "Max Process Pressure", value: "Atmospheric / up to 2 bar (vented)" },
        { label: "Max Process Temperature", value: "80 degC" },
        { label: "Applicable Fluids", value: "Water, diesel, non-corrosive liquids" },
        { label: "Min Fluid Density", value: "600 kg/m3" },
        { label: "Mounting", value: "Top of tank (roof mounted scale board)" },
      ],
    },
    {
      heading: "Optional Features",
      fields: [
        { label: "Level Transmitter", value: "Potentiometer / encoder type (4-20mA output)" },
        { label: "High/Low Level Switches", value: "Micro-switch / reed switch (2-4 nos.)" },
        { label: "Guide Pipe", value: "SS 304 perforated pipe (for turbulent surfaces)" },
        { label: "Anti-Surge Baffle", value: "SS 304 stilling well" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Range: 500mm to 15000mm" },
    { code: "B", description: "Float: S=SS304, M=SS316, P=PP" },
    { code: "C", description: "Float Dia: 150/200/250/300 mm" },
    { code: "D", description: "Scale Board: A=Aluminium, G=GI" },
    { code: "E", description: "Options: T=Transmitter, W=Switches" },
    { code: "F", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015"],
};

export const DS_RADAR_LEVEL: DatasheetMasterEntry = {
  docNo: "FT-DS-RDL-001",
  productFamily: "radar_level",
  productName: "Radar Level Transmitter",
  modelSeries: "FT-RDL-9000",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Flowtech Radar Level Transmitter with FMCW or pulse radar technology for non-contact level measurement of liquids and solids. Suitable for challenging applications with foam, vapour, and turbulence.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "FMCW (Frequency Modulated Continuous Wave) radar" },
        { label: "Frequency Band", value: "76-81 GHz (W-band) / 26 GHz (K-band)" },
        { label: "Measuring Range", value: "0.1 m to 120 m (depending on antenna)" },
        { label: "Accuracy", value: "+/-1 mm (W-band) / +/-3 mm (K-band)" },
        { label: "Repeatability", value: "+/-0.5 mm" },
        { label: "Resolution", value: "1 mm" },
        { label: "Update Time", value: "Less than 1 second" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Housing", value: "Aluminium die-cast (epoxy coated) / SS 316" },
        { label: "Antenna", value: "PP / PTFE / SS 316 (lens/horn/planar)" },
        { label: "Process Connection", value: "Threaded / Flanged / Tri-clamp" },
        { label: "Window", value: "PP / PTFE (antenna protection)" },
        { label: "Gaskets", value: "FKM / EPDM / FFKM" },
        { label: "Cable Gland", value: "M20 x 1.5 (2 nos.)" },
      ],
    },
    {
      heading: "Process Specifications",
      fields: [
        { label: "Process Temperature", value: "-40 to +200 degC (antenna dependent)" },
        { label: "Process Pressure", value: "-1 to 40 bar" },
        { label: "Dielectric Constant", value: "Er >= 1.5 (liquids), Er >= 3 (solids)" },
        { label: "Connection Size", value: "1.5\" to 6\" (threaded/flanged)" },
        { label: "Flange Rating", value: "PN16 / PN40 / Class 150" },
        { label: "Beam Angle", value: "3 deg (W-band) / 8 deg (K-band)" },
      ],
    },
    {
      heading: "Electrical Specifications",
      fields: [
        { label: "Output", value: "4-20mA (HART) / RS485 Modbus / Profibus PA / Foundation Fieldbus" },
        { label: "Power Supply", value: "2-wire: 12-36 VDC / 4-wire: 24 VDC / 90-250 VAC" },
        { label: "Display", value: "LCD graphic display with 4-button keypad" },
        { label: "Cable Entry", value: "2 x M20 x 1.5" },
        { label: "Enclosure Rating", value: "IP66 / IP67 / IP68" },
        { label: "Ambient Temperature", value: "-40 to +80 degC" },
      ],
    },
    {
      heading: "Features",
      fields: [
        { label: "Signal Processing", value: "Advanced echo tracking and false echo suppression" },
        { label: "Configuration", value: "Via display, HART hand-held, or PC software" },
        { label: "Diagnostics", value: "Echo curve, signal quality, device status" },
        { label: "Safety", value: "SIL 2 certified (optional)" },
        { label: "Approvals", value: "Ex-d / Ex-ia (ATEX/IECEx)" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Range: Up to 120m" },
    { code: "B", description: "Frequency: W=W-band(76-81GHz), K=K-band(26GHz)" },
    { code: "C", description: "Antenna: P=PP, T=PTFE, S=SS316" },
    { code: "D", description: "Connection: T=Threaded, F=Flanged" },
    { code: "E", description: "Output: A=4-20mA+HART, M=Modbus, P=Profibus" },
    { code: "F", description: "Housing: A=Aluminium, S=SS316" },
    { code: "G", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015", "SIL 2 (optional)", "ATEX / IECEx", "IP68"],
};

export const DS_HYDROSTATIC_LEVEL: DatasheetMasterEntry = {
  docNo: "FT-DS-HYL-001",
  productFamily: "hydrostatic_level",
  productName: "Hydrostatic Level Transmitter",
  modelSeries: "FT-HYL-9100",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Flowtech Hydrostatic Level Transmitter with ceramic/capacitive sensor for hydrostatic pressure-based level measurement. Suitable for open tanks, wells, sumps, and sewage applications.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Hydrostatic pressure - P = rho x g x h" },
        { label: "Sensor Type", value: "Ceramic capacitive / Piezoresistive silicon / Diffused silicon" },
        { label: "Measuring Range", value: "0.1 mH2O to 200 mH2O" },
        { label: "Accuracy", value: "+/-0.1% FSD (ceramic) / +/-0.25% FSD (piezo)" },
        { label: "Repeatability", value: "+/-0.05% FSD" },
        { label: "Stability", value: "+/-0.1% FSD per year" },
        { label: "Over-range Protection", value: "2x rated pressure (safe)" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Sensor Diaphragm", value: "Alumina ceramic (99.9% pure) / SS 316L" },
        { label: "Housing", value: "SS 316 / PVC / PP" },
        { label: "Cable", value: "PUR / FEP / PE vented cable" },
        { label: "Cable Length", value: "Up to 500 m (standard 10 m)" },
        { label: "Gaskets", value: "FKM / EPDM / FFKM" },
        { label: "Connection Fitting", value: "1/2\" NPT / M20x1.5 / Flanged" },
      ],
    },
    {
      heading: "Process Specifications",
      fields: [
        { label: "Process Temperature", value: "-20 to +100 degC" },
        { label: "Process Pressure", value: "Up to 200 mH2O (20 bar)" },
        { label: "Media Compatibility", value: "Water, sewage, chemicals, oils" },
        { label: "Mounting", value: "Submersible (tank bottom) / Screw-in / Flanged" },
        { label: "Cable Entry", value: "Vented cable with desiccant filter" },
      ],
    },
    {
      heading: "Electrical Specifications",
      fields: [
        { label: "Output", value: "4-20mA (2-wire) / 0-10V (3-wire) / RS485 Modbus" },
        { label: "Power Supply", value: "12-36 VDC (4-20mA) / 15-36 VDC (0-10V)" },
        { label: "Load Resistance", value: "0-750 Ohms (4-20mA)" },
        { label: "Enclosure Rating", value: "IP68 (submersible)" },
        { label: "Ambient Temperature", value: "-20 to +60 degC" },
      ],
    },
    {
      heading: "Optional Features",
      fields: [
        { label: "Cable Extension", value: "Custom cable lengths up to 500m" },
        { label: "Surge Protection", value: "Built-in lightning/surge protector" },
        { label: "Display", value: "Local LCD display (available on selected models)" },
        { label: "HART Protocol", value: "Available with 4-20mA output" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Range: 0.1m to 200m H2O" },
    { code: "B", description: "Sensor: C=Ceramic, P=Piezoresistive" },
    { code: "C", description: "Housing: S=SS316, V=PVC, P=PP" },
    { code: "D", description: "Output: A=4-20mA, V=0-10V, M=Modbus" },
    { code: "E", description: "Cable: P=PUR, F=FEP, E=PE" },
    { code: "F", description: "Cable Length: 5m/10m/20m/50m/100m" },
    { code: "G", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015", "IP68", "CE"],
};

// ═══════════════════════════════════════════════════════════════════════════
// PRESSURE TRANSMITTERS
// ═══════════════════════════════════════════════════════════════════════════

export const DS_SMART_PRESSURE: DatasheetMasterEntry = {
  docNo: "FT-DS-SPT-001",
  productFamily: "smart_pressure",
  productName: "Smart Pressure Transmitter",
  modelSeries: "FT-SPT-1000",
  revision: "Rev.2",
  date: "01/01/2024",
  description: "Flowtech Smart Pressure Transmitter with piezoresistive silicon sensor for gauge, absolute, and sealed gauge pressure measurement. HART communication, 4-20mA output, LCD display with push-button configuration.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Piezoresistive silicon sensor with oil-filled capsule" },
        { label: "Pressure Types", value: "Gauge / Absolute / Sealed Gauge" },
        { label: "Measuring Range", value: "0-0.1 bar to 0-600 bar" },
        { label: "Accuracy", value: "+/-0.1% of span (standard), +/-0.075% (high accuracy)" },
        { label: "Stability", value: "+/-0.1% URL per year" },
        { label: "Turndown Ratio", value: "100:1" },
        { label: "Response Time", value: "Less than 100 ms" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Sensor Body", value: "SS 316L" },
        { label: "Process Diaphragm", value: "SS 316L / Hastelloy C / Tantalum / Monel" },
        { label: "Fill Fluid", value: "Silicone oil / Fluorolube (oxygen service)" },
        { label: "Housing", value: "Aluminium die-cast (epoxy coated) / SS 316" },
        { label: "Terminal Block", value: "Nylon glass-filled with screw terminals" },
        { label: "O-rings", value: "Viton / EPDM / FFKM" },
        { label: "Cover Glass", value: "Polycarbonate (display window)" },
      ],
    },
    {
      heading: "Process Specifications",
      fields: [
        { label: "Process Connection", value: "1/2\" NPT (male/female) / G1/2\" BSP / M20x1.5" },
        { label: "Process Temperature", value: "-40 to +120 degC (direct)" },
        { label: "Ambient Temperature", value: "-40 to +85 degC" },
        { label: "Storage Temperature", value: "-50 to +100 degC" },
        { label: "Over-pressure Limit", value: "2x rated pressure (safe)" },
        { label: "Burst Pressure", value: "3x rated pressure" },
      ],
    },
    {
      heading: "Electrical Specifications",
      fields: [
        { label: "Output Signal", value: "4-20mA + HART 7.0 / Profibus PA / Foundation Fieldbus" },
        { label: "Power Supply", value: "12-45 VDC (4-20mA/HART) / 9-32 VDC (bus)" },
        { label: "Load Resistance", value: "0-1450 Ohms (depending on supply voltage)" },
        { label: "Display", value: "LCD 5-digit with bargraph and units" },
        { label: "Cable Entry", value: "1/2\" NPT / M20 x 1.5 (2 nos.)" },
        { label: "Enclosure Rating", value: "IP66 / IP67 / NEMA 4X" },
      ],
    },
    {
      heading: "Features",
      fields: [
        { label: "Local Configuration", value: "3 push buttons on display (zero/span/config)" },
        { label: "Zero/Span Adjustment", value: "Local buttons or HART communicator" },
        { label: "Diagnostics", value: "Loop test, sensor trim, output trim, status" },
        { label: "Damping", value: "Adjustable 0 to 32 seconds" },
        { label: "Safety", value: "SIL 2 certified (optional)" },
        { label: "Approvals", value: "Ex-d / Ex-ia (ATEX/IECEx) / FM / CSA" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Range: 0-0.1bar to 0-600bar" },
    { code: "B", description: "Pressure Type: G=Gauge, A=Absolute, S=Sealed Gauge" },
    { code: "C", description: "Diaphragm: S=SS316L, H=Hastelloy C, T=Tantalum, M=Monel" },
    { code: "D", description: "Connection: N=1/2\"NPT, B=G1/2\"BSP, M=M20x1.5" },
    { code: "E", description: "Output: A=4-20mA+HART, P=Profibus, F=FF" },
    { code: "F", description: "Housing: A=Aluminium, S=SS316" },
    { code: "G", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015", "SIL 2 (optional)", "ATEX / IECEx", "CE", "PED"],
};

export const DS_DP_PRESSURE: DatasheetMasterEntry = {
  docNo: "FT-DS-DPT-001",
  productFamily: "dp_pressure",
  productName: "Differential Pressure Transmitter",
  modelSeries: "FT-DPT-2000",
  revision: "Rev.2",
  date: "01/01/2024",
  description: "Flowtech Differential Pressure Transmitter with capacitive or piezoresistive sensor for DP, flow, and level applications. Suitable for use with orifice plates, pitot tubes, and closed tank level measurement.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Capacitive sensor / Piezoresistive silicon" },
        { label: "Pressure Types", value: "Differential / Gauge / Absolute" },
        { label: "DP Range", value: "0-1 mbar to 0-40 bar" },
        { label: "Static Pressure", value: "Up to 420 bar (depending on model)" },
        { label: "Accuracy", value: "+/-0.075% of span (standard)" },
        { label: "Stability", value: "+/-0.1% URL per year" },
        { label: "Turndown Ratio", value: "100:1" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Sensor Body", value: "SS 316L / Duplex SS / Hastelloy C" },
        { label: "Process Diaphragm", value: "SS 316L / Hastelloy C / Tantalum / Monel" },
        { label: "Fill Fluid", value: "Silicone oil / Fluorolube / Neobee" },
        { label: "Process Flanges", value: "SS 316 / Hastelloy C / Monel" },
        { label: "Bolts & Nuts", value: "SS 316 / SS 304 / B7M (NACE)" },
        { label: "Vent/Drain Valves", value: "SS 316 (integral)" },
        { label: "Housing", value: "Aluminium die-cast (epoxy coated) / SS 316" },
      ],
    },
    {
      heading: "Process Specifications",
      fields: [
        { label: "Process Connection", value: "1/4\" NPT (female) on 54mm centres (standard)" },
        { label: "Process Temperature", value: "-40 to +120 degC (direct) / up to 400 degC (with remote seals)" },
        { label: "Ambient Temperature", value: "-40 to +85 degC" },
        { label: "Over-pressure Limit", value: "Safe to max static pressure rating" },
        { label: "Mounting", value: "Pipe/Bracket/Wall mountable" },
      ],
    },
    {
      heading: "Electrical Specifications",
      fields: [
        { label: "Output Signal", value: "4-20mA + HART 7.0 / Profibus PA / Foundation Fieldbus" },
        { label: "Power Supply", value: "12-45 VDC (4-20mA/HART)" },
        { label: "Display", value: "LCD 5-digit with bargraph" },
        { label: "Cable Entry", value: "1/2\" NPT / M20 x 1.5" },
        { label: "Enclosure Rating", value: "IP66 / IP67 / NEMA 4X" },
      ],
    },
    {
      heading: "Features",
      fields: [
        { label: "Local Configuration", value: "3 push buttons + LCD display" },
        { label: "Applications", value: "Flow (with orifice), Level (closed tank), DP, Density" },
        { label: "Remote Seals", value: "Available with capillary for high temp/corrosive" },
        { label: "Manifold Compatibility", value: "3-valve / 5-valve manifold mountable" },
        { label: "Safety", value: "SIL 2 certified (optional)" },
        { label: "Approvals", value: "Ex-d / Ex-ia (ATEX/IECEx) / FM / CSA" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "DP Range: 0-1mbar to 0-40bar" },
    { code: "B", description: "Static Pressure: Standard / High (up to 420bar)" },
    { code: "C", description: "Diaphragm: S=SS316L, H=Hastelloy C, T=Tantalum" },
    { code: "D", description: "Fill Fluid: S=Silicone, F=Fluorolube, N=Neobee" },
    { code: "E", description: "Output: A=4-20mA+HART, P=Profibus, F=FF" },
    { code: "F", description: "Housing: A=Aluminium, S=SS316" },
    { code: "G", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015", "SIL 2 (optional)", "ATEX / IECEx", "CE", "PED"],
};

export const DS_MINIATURE_PRESSURE: DatasheetMasterEntry = {
  docNo: "FT-DS-MPT-001",
  productFamily: "miniature_pressure",
  productName: "Miniature Pressure Transmitter",
  modelSeries: "FT-MPT-3000",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Flowtech Miniature Pressure Transmitter with compact design for OEM applications, hydraulic systems, and space-constrained installations. Same accuracy as full-size transmitters in a miniature package.",
  sections: [
    {
      heading: "General Specifications",
      fields: [
        { label: "Measuring Principle", value: "Piezoresistive silicon MEMS sensor" },
        { label: "Pressure Types", value: "Gauge / Absolute / Sealed Gauge" },
        { label: "Measuring Range", value: "0-0.5 bar to 0-400 bar" },
        { label: "Accuracy", value: "+/-0.25% of span (standard), +/-0.1% (optional)" },
        { label: "Stability", value: "+/-0.2% URL per year" },
        { label: "Turndown Ratio", value: "50:1" },
        { label: "Response Time", value: "Less than 5 ms" },
      ],
    },
    {
      heading: "Materials of Construction",
      fields: [
        { label: "Sensor Body", value: "SS 316L / Brass nickel plated" },
        { label: "Process Connection", value: "G1/4\" BSP / 1/4\" NPT / M12x1" },
        { label: "Housing", value: "SS 316 / Aluminium anodized" },
        { label: "Electrical Connection", value: "M12 connector / Cable outlet / DIN 43650" },
        { label: "O-rings", value: "Viton / EPDM / NBR" },
      ],
    },
    {
      heading: "Process & Electrical",
      fields: [
        { label: "Process Temperature", value: "-40 to +100 degC" },
        { label: "Ambient Temperature", value: "-40 to +85 degC" },
        { label: "Output", value: "4-20mA / 0-10V / 0-5V / ratiometric mV" },
        { label: "Power Supply", value: "8-32 VDC (4-20mA) / 12-30 VDC (0-10V)" },
        { label: "Enclosure Rating", value: "IP65 / IP67" },
        { label: "Shock/Vibration", value: "100g shock / 20g vibration (IEC 60068-2)" },
      ],
    },
    {
      heading: "Features",
      fields: [
        { label: "Compact Size", value: "Dia 22mm x 50mm length (miniature)" },
        { label: "Weight", value: "Approx. 50-80 grams" },
        { label: "OEM Ready", value: "Bulk packaging, custom branding available" },
        { label: "Electrical Protection", value: "Reverse polarity, over-voltage, short circuit" },
      ],
    },
  ],
  orderingInfo: [
    { code: "A", description: "Range: 0-0.5bar to 0-400bar" },
    { code: "B", description: "Pressure Type: G=Gauge, A=Absolute, S=Sealed" },
    { code: "C", description: "Connection: G=G1/4\"BSP, N=1/4\"NPT, M=M12x1" },
    { code: "D", description: "Output: A=4-20mA, V=0-10V, R=ratiometric" },
    { code: "E", description: "Electrical: M=M12, C=Cable, D=DIN43650" },
    { code: "F", description: "Special: XX=Standard" },
  ],
  certifications: ["ISO 9001:2015", "CE", "RoHS"],
};

// ═══════════════════════════════════════════════════════════════════════════
// LOOKUP MAPS
// ═══════════════════════════════════════════════════════════════════════════

export const DATASHEET_MASTER_MAP: Record<DatasheetProductFamily, DatasheetMasterEntry> = {
  emf: DS_EMF,
  vortex: DS_VORTEX,
  turbine: DS_TURBINE,
  oval_gear: DS_OVAL_GEAR,
  ultrasonic: DS_ULTRASONIC,
  glass_tube_rotameter: DS_GLASS_TUBE_ROTAMETER,
  metal_tube_rotameter: DS_METAL_TUBE_ROTAMETER,
  acrylic_body_rotameter: DS_ACRYLIC_BODY_ROTAMETER,
  bypass_rotameter: DS_BYPASS_ROTAMETER,
  magnetic_level: DS_MAGNETIC_LEVEL,
  top_mounted_magnetic: DS_TOP_MOUNTED_MAGNETIC,
  reflex_level: DS_REFLEX_LEVEL,
  transparent_level: DS_TRANSPARENT_LEVEL,
  tubular_level: DS_TUBULAR_LEVEL,
  float_board_level: DS_FLOAT_BOARD_LEVEL,
  radar_level: DS_RADAR_LEVEL,
  hydrostatic_level: DS_HYDROSTATIC_LEVEL,
  smart_pressure: DS_SMART_PRESSURE,
  dp_pressure: DS_DP_PRESSURE,
  miniature_pressure: DS_MINIATURE_PRESSURE,
};

export const DATASHEET_PRODUCT_LABELS: Record<DatasheetProductFamily, string> = {
  emf: "Electromagnetic Flow Meter",
  vortex: "Vortex Flow Meter",
  turbine: "Turbine Flow Meter",
  oval_gear: "Oval Gear Flow Meter",
  ultrasonic: "Ultrasonic Flow Meter",
  glass_tube_rotameter: "Glass Tube Rotameter",
  metal_tube_rotameter: "Metal Tube Rotameter",
  acrylic_body_rotameter: "Acrylic Body Rotameter",
  bypass_rotameter: "By Pass Rotameter",
  magnetic_level: "Side Mounted Magnetic Level Indicator",
  top_mounted_magnetic: "Top Mounted Magnetic Level Indicator",
  reflex_level: "Reflex Level Gauge",
  transparent_level: "Transparent Level Gauge",
  tubular_level: "Tubular Level Gauge",
  float_board_level: "Float & Board Level Indicator",
  radar_level: "Radar Level Transmitter",
  hydrostatic_level: "Hydrostatic Level Transmitter",
  smart_pressure: "Smart Pressure Transmitter",
  dp_pressure: "Differential Pressure Transmitter",
  miniature_pressure: "Miniature Pressure Transmitter",
};

export const ALL_DATASHEETS: DatasheetMasterEntry[] = [
  DS_EMF, DS_VORTEX, DS_TURBINE, DS_OVAL_GEAR, DS_ULTRASONIC,
  DS_GLASS_TUBE_ROTAMETER, DS_METAL_TUBE_ROTAMETER, DS_ACRYLIC_BODY_ROTAMETER, DS_BYPASS_ROTAMETER,
  DS_MAGNETIC_LEVEL, DS_TOP_MOUNTED_MAGNETIC, DS_REFLEX_LEVEL, DS_TRANSPARENT_LEVEL,
  DS_TUBULAR_LEVEL, DS_FLOAT_BOARD_LEVEL, DS_RADAR_LEVEL, DS_HYDROSTATIC_LEVEL,
  DS_SMART_PRESSURE, DS_DP_PRESSURE, DS_MINIATURE_PRESSURE,
];
