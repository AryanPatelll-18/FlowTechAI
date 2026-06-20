// ============================================================
// De-codification Datasheet Database
// Each product has its own unique order code structure
// Products WITHOUT uploaded de-codification sheets = NO download/preview
// ============================================================

export interface DecodeOption {
  code: string;
  description: string;
}

export interface DecodeCategory {
  position: number;
  name: string;
  options: DecodeOption[];
}

export interface DecodificationEntry {
  modelPrefix: string;
  productFamily: DecodeProductFamily;
  productName: string;
  docNo: string;
  revision: string;
  date: string;
  description: string;
  headerTitle: string;
  catalogueRef: string;
  categories: DecodeCategory[];
  hasDecodification: true;
}

export type DecodeProductFamily =
  | "emf"
  | "oval_gear"
  | "vortex"
  | "turbine"
  | "reflex_level"
  | "transparent_level"
  | "magnetic_level"
  | "top_mounted_magnetic"
  | "tubular_level"
  | "ultrasonic_level"
  | "radar_level"
  | "float_board_level"
  | "bypass_rotameter"
  | "metal_tube_rotameter"
  | "glass_tube_rotameter"
  | "hydrostatic_level"
  | "miniature_pressure"
  | "smart_pressure"
  | "dp_pressure_simple"
  | "dp_pressure_high_precision";

// ═══════════════════════════════════════════════════════════════════════════
// 1. ELECTROMAGNETIC FLOW METER — FMIPL-EMFM
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_EMF: DecodificationEntry = {
  modelPrefix: "FMIPL-EMFM",
  productFamily: "emf",
  productName: "Electromagnetic Flow Meter",
  docNo: "FT-DS-EMF-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master Decodification Sheet for FlowMag Electromagnetic Flow Meter. When customer needs detailed choices — flowtube MOC, process connection, lining, electrode, earthing, enclosure, output, communication, cable glands or accessories — complete the FMIPL-EMFM master decodification code from the catalogue.",
  headerTitle: "MASTER DECODIFICATION SHEET — ELECTROMAGNETIC FLOW METER",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Electromagnetic Flowmeter",
  categories: [
    { position: 1, name: "FLOWTUBE MOC", options: [{ code: "TS1", description: "SS 304" }, { code: "TS2", description: "SS 316" }, { code: "CU", description: "CUSTOM" }] },
    { position: 2, name: "PROCESS CONNECTION TYPE", options: [{ code: "F", description: "FLANGED ANSI" }, { code: "W", description: "WAFER" }, { code: "TC", description: "TRI-CLOVER" }, { code: "T", description: "THREADED" }, { code: "CU", description: "CUSTOM" }] },
    { position: 3, name: "PROCESS CONNECTION MOC", options: [{ code: "C", description: "CARBON STEEL" }, { code: "S1", description: "SS 304" }, { code: "S2", description: "SS 316" }, { code: "CU", description: "CUSTOM" }] },
    { position: 4, name: "PROCESS CONNECTION STD", options: [{ code: "F1", description: "ASA 150#" }, { code: "F2", description: "IS 1583" }, { code: "TN1", description: "NPT" }, { code: "TB1", description: "BSP" }, { code: "CU", description: "CUSTOM" }] },
    { position: 5, name: "COIL HOUSING MOC", options: [{ code: "CH1", description: "CS" }, { code: "CH2", description: "SS 304" }, { code: "CH3", description: "SS 316" }, { code: "CU", description: "CUSTOM" }] },
    { position: 6, name: "ELECTRODE MATERIAL", options: [{ code: "EL2", description: "SS 316L" }, { code: "EL3", description: "HASTELLOY 'C'" }, { code: "EL4", description: "TANTALUM" }, { code: "EL5", description: "TITANIUM" }, { code: "EL6", description: "PLATINUM" }, { code: "CU", description: "CUSTOM" }] },
    { position: 7, name: "EARTHING TYPE", options: [{ code: "ER", description: "EARTHING RING" }, { code: "IE", description: "IN-BUILT EARTHING ELECTRODE" }] },
    { position: 8, name: "EARTHING MOC", options: [{ code: "ER1", description: "SS 304" }, { code: "ER2", description: "SS 316" }, { code: "ER3", description: "SS 316L" }, { code: "CU", description: "CUSTOM" }] },
    { position: 9, name: "LINING MATERIAL", options: [{ code: "RL", description: "RUBBER" }, { code: "PL", description: "PTFE" }, { code: "PA", description: "PFA" }, { code: "HR", description: "HARD RUBBER" }, { code: "NR", description: "NEOPRENE" }, { code: "CU", description: "CUSTOM" }] },
    { position: 10, name: "ELECTRONICS ENCLOSURE", options: [{ code: "WP", description: "WEATHER PROOF ALUMINIUM DIE CAST" }, { code: "FLP", description: "FLAMEPROOF IIA, IIB, IIC" }, { code: "FLP(P)", description: "PESO CERTIFIED" }, { code: "FLP(AT)", description: "ATEX CERTIFIED" }] },
    { position: 11, name: "TRANSMITTER MOUNTING", options: [{ code: "I", description: "INTEGRAL TYPE" }, { code: "RE", description: "REMOTE TYPE" }] },
    { position: 12, name: "WIRING TYPE", options: [{ code: "W1", description: "2-WIRE" }, { code: "W2", description: "4-WIRE — DEFAULT" }] },
    { position: 13, name: "POWER SUPPLY", options: [{ code: "AC1", description: "230 V AC" }, { code: "AC2", description: "110 V AC" }, { code: "DC", description: "24 V DC" }, { code: "BT", description: "BATTERY OPERATED (3.6V LITHIUM BATTERY)" }, { code: "CU", description: "CUSTOM" }] },
    { position: 14, name: "OUTPUT", options: [{ code: "M", description: "4-20 mA + PULSE" }, { code: "H", description: "4-20 mA + HART + PULSE" }, { code: "CU", description: "CUSTOM" }] },
    { position: 15, name: "COMMUNICATION", options: [{ code: "CR", description: "RS 485" }, { code: "MB", description: "MODBUS RTU" }, { code: "PB", description: "PROFIBUS DP" }, { code: "FF", description: "FOUNDATION FIELDBUS" }, { code: "CU", description: "CUSTOM" }] },
    { position: 16, name: "ACCESSORIES", options: [{ code: "FP", description: "FRP PANEL" }, { code: "MF", description: "MATCHING FLANGES" }, { code: "GN", description: "GASKET & NUT BOLTS" }, { code: "NA", description: "NOT APPLICABLE" }, { code: "WI", description: "EXTRA WIRE" }, { code: "NB", description: "PROCESS CONNECTION SIZE" }] },
    { position: 17, name: "CABLE GLAND MOC", options: [{ code: "CG1", description: "SS 304" }, { code: "CG2", description: "SS 316" }, { code: "CU", description: "CUSTOM (MENTION MOC)" }] },
    { position: 18, name: "CABLE ENTRY STANDARD", options: [{ code: "CE1", description: "PG 9" }, { code: "CE2", description: "PG 11 — DEFAULT" }, { code: "CE3", description: "M20 x 1.5" }] },
    { position: 19, name: "CABLE GLAND PROTECTION", options: [{ code: "CP1", description: "WEATHER-PROOF" }, { code: "CP2", description: "FLAMEPROOF" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. OVAL GEAR FLOW METER — FMIPL-DOGFM
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_OVAL_GEAR: DecodificationEntry = {
  modelPrefix: "FMIPL-DOGFM",
  productFamily: "oval_gear",
  productName: "Digital Oval Gear Flow Meter",
  docNo: "FT-DS-OVG-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master Decodification Sheet for Digital Oval Gear Flow Meter. When customer needs detailed choices — process connection, MOC, rotor, shaft, output, display, mounting, power supply — complete the FMIPL-DOGFM master decodification code from the catalogue. Rule: Any option marked CUSTOM / CU must carry clear technical details.",
  headerTitle: "MASTER DECODIFICATION SHEET — DIGITAL OVAL GEAR FLOW METER",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Digital Oval Gear Flow Meter",
  categories: [
    { position: 1, name: "OUTPUT", options: [{ code: "01", description: "4-20mA" }, { code: "02", description: "4-20mA + HART" }, { code: "C01", description: "RS 485" }, { code: "CU", description: "CUSTOM" }] },
    { position: 2, name: "COMMUNICATION OUTPUT", options: [{ code: "SM1", description: "4-20mA" }, { code: "SM2", description: "4-20mA + OUTPUT" }, { code: "C01", description: "RS 485" }, { code: "CU", description: "CUSTOM" }] },
    { position: 3, name: "DISPLAY", options: [{ code: "DD1", description: "NOT APPLICABLE - WITHOUT" }, { code: "DD2", description: "WEATHER-PROOF" }, { code: "DD3", description: "FLAME-PROOF" }] },
    { position: 4, name: "PROCESS CONNECTION TYPE", options: [{ code: "PC1", description: "FLANGE-END" }, { code: "PC2", description: "THREADED" }, { code: "PC3", description: "TC-CONNECTION" }, { code: "CU", description: "CUSTOM" }] },
    { position: 5, name: "PROCESS CONNECTION MOC", options: [{ code: "PCM1", description: "SS 304" }, { code: "PCM2", description: "SS 316" }, { code: "PCM3", description: "SS 316L" }, { code: "PCM4", description: "ALUMINIUM ANODIZED" }, { code: "CU", description: "CUSTOM" }] },
    { position: 6, name: "PROCESS CONNECTION STD", options: [{ code: "PCS1", description: "ASA 150 CLASS" }, { code: "PCS2", description: "1/4\" BSP (F)" }, { code: "CU", description: "CUSTOM" }] },
    { position: 7, name: "ROTOR MOC", options: [{ code: "RM1", description: "ALUMINIUM ANODIZED — DEFAULT" }, { code: "RM2", description: "SS 316" }, { code: "RM3", description: "SS 316L" }, { code: "CU", description: "CUSTOM" }] },
    { position: 8, name: "SHAFT MOC", options: [{ code: "SM1", description: "SS 316" }, { code: "SM2", description: "SS 316L" }, { code: "CU", description: "CUSTOM" }] },
    { position: 9, name: "MOUNTING TYPE", options: [{ code: "MT1", description: "INTEGRAL MOUNTING" }, { code: "MT2", description: "REMOTE MOUNTING — MTRS" }] },
    { position: 10, name: "POWER SUPPLY", options: [{ code: "PS1", description: "230 VAC" }, { code: "PS2", description: "24 VDC" }, { code: "CU", description: "CUSTOM" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. VORTEX FLOWMETER — FMIPL-VRFM
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_VORTEX: DecodificationEntry = {
  modelPrefix: "FMIPL-VRFM",
  productFamily: "vortex",
  productName: "Vortex Flowmeter",
  docNo: "FT-DS-VOR-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for Vortex Flowmeter. When customer needs detailed choices — IBR type, pressure & temperature compensation, flow tube MOC, process connection, mounting, output, communication, wiring or power supply — complete the FMIPL-VRFM master de-codification code from the catalogue. Rule: Any option marked CUSTOM / CUSTOMISED / CU must carry clear technical details.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — VORTEX FLOWMETER",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Vortex Flowmeter",
  categories: [
    { position: 1, name: "IBR TYPE", options: [{ code: "IT1", description: "NON-IBR CERTIFIED — DEFAULT" }, { code: "IT2", description: "IBR APPROVED & CERTIFIED" }] },
    { position: 2, name: "P&T COMPENSATION TYPE", options: [{ code: "PTC1", description: "WITH PRESSURE & TEMPERATURE COMPENSATION" }, { code: "PTC2", description: "WITHOUT PRESSURE & TEMPERATURE COMPENSATION" }] },
    { position: 3, name: "FLOW TUBE MOC", options: [{ code: "FT1", description: "SS 304 — DEFAULT" }, { code: "FT2", description: "SS 316" }, { code: "FT3", description: "SS 316L" }, { code: "CU", description: "CUSTOM" }] },
    { position: 4, name: "PROCESS CONNECTION TYPE", options: [{ code: "PC1", description: "FLANGE-END" }, { code: "PC2", description: "WAFER CONNECTION — DEFAULT" }, { code: "PC3", description: "TC - JOINT" }, { code: "PC4", description: "THREADED" }, { code: "CU", description: "CUSTOM" }] },
    { position: 5, name: "PROCESS CONNECTION MOC", options: [{ code: "PCM1", description: "SS 304 — DEFAULT" }, { code: "PCM2", description: "SS 316" }, { code: "PCM3", description: "SS 316L" }, { code: "CU", description: "CUSTOMISED" }] },
    { position: 6, name: "PROCESS CONNECTION STD", options: [{ code: "PCS1", description: "ASA 150 CLASS" }, { code: "PCS2", description: "PN 16 — DEFAULT*" }, { code: "PCS3", description: "NPT" }, { code: "PCS4", description: "BSP" }, { code: "CU", description: "CUSTOMISED" }] },
    { position: 7, name: "MOUNTING TYPE", options: [{ code: "MT1", description: "INTEGRAL" }, { code: "MT2", description: "REMOTE TYPE — WIRE LENGTH (IN MTRS ONLY)" }] },
    { position: 8, name: "ENCLOSURE PROTECTION TYPE", options: [{ code: "EPT1", description: "WEATHER-PROOF : ALUMINIUM DIE CAST — DEFAULT" }, { code: "EPT2", description: "FLAME-PROOF : ALUMINIUM DIE CAST" }, { code: "EPT3", description: "ATEX PROOF : ALUMINIUM DIE CAST" }] },
    { position: 9, name: "OUTPUT", options: [{ code: "01", description: "4-20mA + PULSE — DEFAULT" }, { code: "02", description: "4-20mA + HART + PULSE" }, { code: "CU", description: "CUSTOMISED" }] },
    { position: 10, name: "COMMUNICATION OUTPUT", options: [{ code: "C01", description: "RS 485" }, { code: "NA", description: "NOT APPLICABLE" }, { code: "CU", description: "CUSTOM" }] },
    { position: 11, name: "WIRING TYPE", options: [{ code: "WT1", description: "2 WIRE — WITHOUT RS 485" }, { code: "WT2", description: "3 WIRE — WITH RS 485" }] },
    { position: 12, name: "POWER SUPPLY TYPE", options: [{ code: "PS1", description: "24 VDC — DEFAULT" }, { code: "PS2", description: "230 VAC" }, { code: "PS3", description: "BATTERY OPERATED — 3.6V LITHIUM ION" }, { code: "CU", description: "CUSTOMISED" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 4. TURBINE FLOW METER — FMIPL-TFM
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_TURBINE: DecodificationEntry = {
  modelPrefix: "FMIPL-TFM",
  productFamily: "turbine",
  productName: "Turbine Flow Meter",
  docNo: "FT-DS-TUR-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for Turbine Flow Meter. When detailed choices are needed — flow tube MOC, process connection, impeller type, mounting, wire type, protection, output, communication, power supply, relay output, or accessories — complete the FMIPL-TFM master de-codification code from the catalogue. In case of custom, mention the technical details.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — TURBINE FLOW METER",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Turbine Flowmeter",
  categories: [
    { position: 1, name: "FLOW TUBE MOC", options: [{ code: "FT1", description: "SS 304" }, { code: "FT 2", description: "SS 316" }, { code: "CU", description: "CUSTOM" }] },
    { position: 2, name: "PROCESS CONNECTION TYPE", options: [{ code: "F", description: "FLANGE END" }, { code: "T", description: "THREADED" }, { code: "T1", description: "TC END" }, { code: "CU", description: "CUSTOM" }] },
    { position: 3, name: "PROCESS CONNECTION MOC", options: [{ code: "S1", description: "SS 304" }, { code: "S2", description: "SS 316" }, { code: "CU", description: "CUSTOM" }] },
    { position: 4, name: "PROCESS CONNECTION STD", options: [{ code: "F1", description: "ASA 150 # RF" }, { code: "CU", description: "CUSTOM" }] },
    { position: 5, name: "IMPELLER TYPE", options: [{ code: "IR", description: "REGULAR" }, { code: "IH", description: "HELICAL" }] },
    { position: 6, name: "MOUNTING", options: [{ code: "I", description: "INTEGRAL TYPE" }, { code: "RE", description: "REMOTE TYPE" }, { code: "WO", description: "PICKUP SENSOR WITH OUTPUT" }] },
    { position: 7, name: "WIRE TYPE", options: [{ code: "W1", description: "2-WIRE" }, { code: "W2", description: "4-WIRE" }] },
    { position: 8, name: "PROTECTION TYPE (IP 67 Protection)", options: [{ code: "WP", description: "WEATHERPROOF" }, { code: "FLP", description: "FLAMEPROOF - PESO APPROVED - (IIA, IIB AND IIC)" }, { code: "ATX", description: "ATEX APPROVED" }] },
    { position: 9, name: "OUTPUT", options: [{ code: "M", description: "4-20MA + PULSE + 2 RELAY" }, { code: "H", description: "4-20MA+HART+ PULSE + 2 RELAY" }, { code: "CU", description: "CUSTOM" }] },
    { position: 10, name: "COMMUNICATION", options: [{ code: "CR", description: "RS 485" }, { code: "CU", description: "CUSTOM" }] },
    { position: 11, name: "POWER SUPPLY", options: [{ code: "AC", description: "230 V AC" }, { code: "DC", description: "24 V DC" }, { code: "BT", description: "BATTERY OPERATED" }, { code: "CU", description: "CUSTOM" }] },
    { position: 12, name: "RELAY OUTPUT", options: [{ code: "RO1", description: "NOT APPLICABLE (Applicable only in remote type Controllers)" }, { code: "RO2", description: "2 Relay Outputs - 5 Amp" }] },
    { position: 13, name: "ACCESSORIES", options: [{ code: "GN", description: "GASKET & NUT BOLTS" }, { code: "WI", description: "EXTRA WIRE" }, { code: "NA", description: "NOT APPLICABLE" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 5. REFLEX LEVEL GAUGE — FMIPL-RLG
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_REFLEX_LEVEL: DecodificationEntry = {
  modelPrefix: "FMIPL-RLG",
  productFamily: "reflex_level",
  productName: "Reflex Level Gauge",
  docNo: "FT-DS-RLG-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master Decodification Sheet for Reflex Level Gauge. When detailed choices are needed — main chamber MOC, chamber size, cover plate MOC, process connection, isolation valve, valve details, U-bolts, scale MOC, glass details — complete the FMIPL-RLG master decodification code. Any option marked CUSTOM / CU must carry clear technical details.",
  headerTitle: "MASTER DECODIFICATION SHEET — REFLEX LEVEL GAUGE",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Reflex Level Gauge",
  categories: [
    { position: 1, name: "MAIN CHAMBER MOC", options: [{ code: "MC", description: "CS" }, { code: "MC1", description: "SS 304" }, { code: "MC2", description: "SS 316" }, { code: "MC3", description: "SS 316L" }, { code: "MC4", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 2, name: "MAIN CHAMBER SIZE", options: [{ code: "38", description: "38 x 38" }, { code: "45", description: "45 x 45" }] },
    { position: 3, name: "COVER PLATE MOC", options: [{ code: "CP", description: "CS" }, { code: "CP2", description: "SS 304" }, { code: "CP3", description: "SS 316" }, { code: "CP4", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 4, name: "PROCESS CONNECTION TYPE", options: [{ code: "F", description: "FLANGE END" }, { code: "T", description: "THREADED" }, { code: "CU", description: "CUST." }] },
    { position: 5, name: "PROCESS CONNECTION MOC", options: [{ code: "C", description: "CS" }, { code: "S1", description: "SS 304" }, { code: "S2", description: "SS 316" }, { code: "P", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 6, name: "PROCESS CONNECTION STD", options: [{ code: "F1", description: "ASA 150 # RF" }, { code: "F2", description: "ASA 300 # RF" }, { code: "F3", description: "ASA 600 # RF" }, { code: "TB", description: "1/2\" TO 2\" BSP" }, { code: "TN", description: "1/2\" TO 2\" NPT" }, { code: "CU", description: "CUST." }] },
    { position: 7, name: "ISOLATION VALVE", options: [{ code: "W", description: "WITH" }, { code: "W0", description: "WITHOUT" }] },
    { position: 8, name: "VALVE DETAILS", options: [{ code: "VT1", description: "1\" BUILT HORIZONTAL NEEDLE VALVE — DEFAULT INDIAN MAKE" }, { code: "VT2", description: "INTEGRAL AUTO SHUT-OFF BALL CHECK VALVES" }] },
    { position: 9, name: "VALVE MOC", options: [{ code: "VM1", description: "CS" }, { code: "VM2", description: "SS 304" }, { code: "VM3", description: "SS 316" }, { code: "VM4", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 10, name: "VALVE TRIM MOC", options: [{ code: "VT1", description: "CS" }, { code: "VT2", description: "SS 304" }, { code: "VT3", description: "SS 316" }, { code: "VT4", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 11, name: "U-BOLTS & NUTS MOC", options: [{ code: "UN1", description: "CS" }, { code: "UN2", description: "SS 304" }, { code: "UN3", description: "SS 316" }, { code: "UN4", description: "ALUMINIUM" }, { code: "CU", description: "CUST." }] },
    { position: 12, name: "SCALE MOC", options: [{ code: "AL", description: "ALUMINIUM" }, { code: "SS1", description: "SS 304" }, { code: "SS", description: "SS 316" }] },
    { position: 13, name: "GLASS DETAILS", options: [{ code: "GD1", description: "BOROSILICATE TOUGHENED GLASS" }, { code: "GD2", description: "KLINGER MAKE — IMPORTED GLASS" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 4b. TOP MOUNTED MAGNETIC LEVEL INDICATOR — FMIPL-TMMLI
// (Same de-codification as Side Mounted)
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_TOP_MOUNTED_MAGNETIC: DecodificationEntry = {
  modelPrefix: "FMIPL-TMMLI",
  productFamily: "top_mounted_magnetic",
  productName: "Top Mounted Magnetic Level Indicator",
  docNo: "FT-DS-TML-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for Top Mounted Magnetic Level Indicator. Same de-codification as Side Mounted Magnetic Level Indicator. When detailed choices are needed — process connection, float chamber, float, indicator, scale, transmitter, switches, jacketing — complete the FMIPL-TMMLI master de-codification code from the catalogue. Any custom / CU option must carry clear technical details.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — TOP MOUNTED MAGNETIC LEVEL INDICATOR",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Top Mounted Magnetic Level Indicator",
  categories: [
    { position: 1, name: "PROCESS CONNECTION TYPE", options: [{ code: "F", description: "FLANGE END" }, { code: "T", description: "THREADED" }, { code: "CU", description: "CUST." }] },
    { position: 2, name: "PROCESS CONNECTION MOC", options: [{ code: "S1", description: "SS 304" }, { code: "S2", description: "SS 316" }, { code: "S3", description: "TITANIUM" }, { code: "PP", description: "PP" }, { code: "P", description: "PVDF / FP2" }, { code: "CU", description: "CUST." }] },
    { position: 3, name: "PROCESS CONNECTION STD", options: [{ code: "F1", description: "ASA 150 # RF" }, { code: "CU", description: "CUST." }] },
    { position: 4, name: "FLOAT CHAMBER", options: [{ code: "FC1", description: "SS 316 SCHD. 40" }, { code: "CU", description: "CUST." }] },
    { position: 5, name: "FLOAT MOC", options: [{ code: "FS", description: "SS 304" }, { code: "FS1", description: "SS 316" }, { code: "FS2", description: "SS 316L" }, { code: "FS3", description: "TITANIUM (BELOW 0.9 DENSITY)" }, { code: "FP", description: "PP" }, { code: "FP1", description: "PTFE LINING" }] },
    { position: 6, name: "AIR VENT TYPE", options: [{ code: "AS", description: "1/2\" STOP PLUG" }, { code: "AB", description: "1/2\" BALL VALVE" }] },
    { position: 7, name: "DRAIN TYPE", options: [{ code: "DS", description: "1/2\" STOP PLUG" }, { code: "DB", description: "1/2\" BALL VALVE" }] },
    { position: 8, name: "JACKETING MOC", options: [{ code: "JNA", description: "JACKETING NOT APPLICABLE" }, { code: "J1", description: "SS 304" }, { code: "J2", description: "SS 316" }, { code: "CU", description: "CUSTOM" }] },
    { position: 9, name: "INDICATOR TYPE", options: [{ code: "FD", description: "FLAPPER DESIGN INDICATOR (TOUGHEND GLASS TUBE 25 NB OD)" }, { code: "RD", description: "ROLLER DESIGN INDICATOR" }, { code: "CD", description: "CAPSULE DESIGN INDICATOR" }] },
    { position: 10, name: "SCALE DETAILS", options: [{ code: "LC5", description: "LC 5" }, { code: "LC10", description: "LC 10" }, { code: "CU", description: "CUST." }] },
    { position: 11, name: "SCALE UNIT DETAILS", options: [{ code: "SU1", description: "CM — DEFAULT" }, { code: "SU2", description: "PERCENTAGE" }, { code: "SU3", description: "METER" }, { code: "CU", description: "CUST." }] },
    { position: 12, name: "LEVEL TRANSMITTER DETAILS", options: [{ code: "LR", description: "TRANSMITTER REQUIRED" }, { code: "LNR", description: "TRANSMITTER NOT REQUIRED" }] },
    { position: 13, name: "TRANSMITTER LENGTH", options: [{ code: "CC", description: "SAME AS C-C HEIGHT" }, { code: "CU", description: "CUSTOM" }] },
    { position: 14, name: "STEM MOC", options: [{ code: "SS", description: "SS 304 — 12.7MM" }, { code: "CU", description: "CUSTOM" }] },
    { position: 15, name: "OUTPUT DETAILS", options: [{ code: "01", description: "4-20mA" }, { code: "02", description: "4-20mA + HART" }, { code: "CU", description: "CUST." }] },
    { position: 16, name: "WIRING TYPE", options: [{ code: "W1", description: "2-WIRE" }, { code: "W2", description: "4-WIRE" }, { code: "CU", description: "CUSTOM" }] },
    { position: 17, name: "SWITCH DETAILS", options: [{ code: "SW", description: "REQUIRED" }, { code: "SNA", description: "NOT APPLICABLE" }] },
    { position: 18, name: "SWITCH TYPE", options: [{ code: "L", description: "L Type Switch" }, { code: "HL", description: "Hold On Type Switch" }] },
    { position: 19, name: "ENCLOSURE PROTECTION", options: [{ code: "WP", description: "Weather-Proof Aluminium Die Cast MOC" }, { code: "FLP", description: "Flameproof Aluminium Die Cast MOC" }] },
    { position: 20, name: "POWER SUPPLY", options: [{ code: "PS1", description: "230 VAC" }, { code: "PS2", description: "24 VDC" }, { code: "CU", description: "CUSTOM" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 4c. TRANSPARENT LEVEL GAUGE — FMIPL-TLG
// (Same de-codification as Reflex Level Gauge)
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_TRANSPARENT_LEVEL: DecodificationEntry = {
  modelPrefix: "FMIPL-TLG",
  productFamily: "transparent_level",
  productName: "Transparent Level Gauge",
  docNo: "FT-DS-TLG-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for Transparent Level Gauge. Same de-codification as Reflex Level Gauge. When detailed choices are needed — main chamber MOC, chamber size, cover plate MOC, process connection, isolation valve, valve details, U-bolts, scale MOC, glass details — complete the FMIPL-TLG master de-codification code from the catalogue. Any option marked CUSTOM / CU must carry clear technical details.",
  headerTitle: "MASTER DECODIFICATION SHEET — TRANSPARENT LEVEL GAUGE",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Transparent Level Gauge",
  categories: [
    { position: 1, name: "MAIN CHAMBER MOC", options: [{ code: "MC", description: "CS" }, { code: "MC1", description: "SS 304" }, { code: "MC2", description: "SS 316" }, { code: "MC3", description: "SS 316L" }, { code: "MC4", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 2, name: "MAIN CHAMBER SIZE", options: [{ code: "38", description: "38 x 38" }, { code: "45", description: "45 x 45" }] },
    { position: 3, name: "COVER PLATE MOC", options: [{ code: "CP", description: "CS" }, { code: "CP2", description: "SS 304" }, { code: "CP3", description: "SS 316" }, { code: "CP4", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 4, name: "PROCESS CONNECTION TYPE", options: [{ code: "F", description: "FLANGE END" }, { code: "T", description: "THREADED" }, { code: "CU", description: "CUST." }] },
    { position: 5, name: "PROCESS CONNECTION MOC", options: [{ code: "C", description: "CS" }, { code: "S1", description: "SS 304" }, { code: "S2", description: "SS 316" }, { code: "P", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 6, name: "PROCESS CONNECTION STD", options: [{ code: "F1", description: "ASA 150 # RF" }, { code: "F2", description: "ASA 300 # RF" }, { code: "F3", description: "ASA 600 # RF" }, { code: "TB", description: "1/2\" TO 2\" BSP" }, { code: "TN", description: "1/2\" TO 2\" NPT" }, { code: "CU", description: "CUST." }] },
    { position: 7, name: "ISOLATION VALVE", options: [{ code: "W", description: "WITH" }, { code: "W0", description: "WITHOUT" }] },
    { position: 8, name: "VALVE DETAILS", options: [{ code: "VT1", description: "1\" BUILT HORIZONTAL NEEDLE VALVE — DEFAULT INDIAN MAKE" }, { code: "VT2", description: "INTEGRAL AUTO SHUT-OFF BALL CHECK VALVES" }] },
    { position: 9, name: "VALVE MOC", options: [{ code: "VM1", description: "CS" }, { code: "VM2", description: "SS 304" }, { code: "VM3", description: "SS 316" }, { code: "VM4", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 10, name: "VALVE TRIM MOC", options: [{ code: "VT1", description: "CS" }, { code: "VT2", description: "SS 304" }, { code: "VT3", description: "SS 316" }, { code: "VT4", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 11, name: "U-BOLTS & NUTS MOC", options: [{ code: "UN1", description: "CS" }, { code: "UN2", description: "SS 304" }, { code: "UN3", description: "SS 316" }, { code: "UN4", description: "ALUMINIUM" }, { code: "CU", description: "CUST." }] },
    { position: 12, name: "SCALE MOC", options: [{ code: "AL", description: "ALUMINIUM" }, { code: "SS1", description: "SS 304" }, { code: "SS", description: "SS 316" }] },
    { position: 13, name: "GLASS DETAILS", options: [{ code: "GD1", description: "BOROSILICATE TOUGHENED GLASS" }, { code: "GD2", description: "KLINGER MAKE — IMPORTED GLASS" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 7f. RADAR LEVEL TRANSMITTER — FMIPL-RALT
// (Same de-codification as Ultrasonic Level Transmitter)
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_RADAR_LEVEL: DecodificationEntry = {
  modelPrefix: "FMIPL-RALT",
  productFamily: "radar_level",
  productName: "Radar Level Transmitter",
  docNo: "FT-DS-RDL-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for Radar Level Transmitter. Same de-codification as Ultrasonic Level Transmitter. Order Code for Radar Level Transmitter — complete the FMIPL-RALT master de-codification code from the catalogue. In case of custom, mention the technical details.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — RADAR LEVEL TRANSMITTER",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Radar Level Transmitter",
  categories: [
    { position: 1, name: "SENSOR MOC", options: [{ code: "SM1", description: "ABS — DEFAULT" }, { code: "SM2", description: "PTFE" }, { code: "CU", description: "CUSTOM" }] },
    { position: 2, name: "DISPLAY MOUNTING", options: [{ code: "DNA", description: "DISPLAY NOT REQUIRED" }, { code: "DI", description: "INTEGRAL MOUNTING" }, { code: "DR", description: "REMOTE MOUNTING — METERS" }] },
    { position: 3, name: "DISPLAY ENCLOSURE TYPE", options: [{ code: "DE1", description: "ALUMINIUM DIE-CAST — WEATHERPROOF" }, { code: "DE2", description: "ALUMINIUM DIE-CAST — FLAMEPROOF" }, { code: "DE3", description: "ABS — DEFAULT" }] },
    { position: 4, name: "PROCESS CONNECTION TYPE", options: [{ code: "PN1", description: "THREADED" }, { code: "PN2", description: "FLANGE-END" }, { code: "CU", description: "CUSTOM" }] },
    { position: 5, name: "OUTPUT", options: [{ code: "01", description: "4-20 mA" }, { code: "02", description: "4-20 mA + HART" }] },
    { position: 6, name: "COMMUNICATION OUTPUT", options: [{ code: "CO1", description: "RS 485" }, { code: "NA", description: "NOT APPLICABLE" }, { code: "CU", description: "CUSTOM" }] },
    { position: 7, name: "POWER SUPPLY", options: [{ code: "PS1", description: "24 VDC" }, { code: "PS2", description: "230 VAC" }, { code: "CU", description: "CUSTOM" }] },
    { position: 8, name: "WIRING TYPE", options: [{ code: "WT1", description: "2-WIRE" }, { code: "WT2", description: "4-WIRE" }] },
    { position: 9, name: "SENSOR RANGE", options: [{ code: "SR1", description: "0-6 MTRS" }, { code: "SR2", description: "0-8 MTRS" }, { code: "SR3", description: "0-10 MTRS" }, { code: "SR4", description: "0-15 MTRS" }] },
    { position: 10, name: "CABLE GLAND MOC", options: [{ code: "CG1", description: "PVC — DEFAULT" }, { code: "CG2", description: "SS 304" }, { code: "CG3", description: "SS 316" }, { code: "CU", description: "CUSTOM" }] },
    { position: 11, name: "CABLE ENTRY STANDARD", options: [{ code: "CE1", description: "PG 9" }, { code: "CE2", description: "PG 11" }, { code: "CE3", description: "M20 x 1.5" }, { code: "CU", description: "CUSTOM" }] },
    { position: 12, name: "CABLE GLAND PROTECTION", options: [{ code: "NA", description: "NOT APPLICABLE" }, { code: "CP1", description: "WEATHERPROOF" }, { code: "CP2", description: "FLAMEPROOF" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 5. SIDE MOUNTED MAGNETIC LEVEL INDICATOR — FMIPL-SMMLI
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_MAGNETIC_LEVEL: DecodificationEntry = {
  modelPrefix: "FMIPL-SMMLI",
  productFamily: "magnetic_level",
  productName: "Side Mounted Magnetic Level Indicator",
  docNo: "FT-DS-MLI-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for Side Mounted Magnetic Level Indicator. When detailed choices are needed — process connection, float chamber, float, indicator, scale, transmitter, switches, jacketing — complete the FMIPL-SMMLI master de-codification code. Any custom / CU option must carry clear technical details.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — SIDE MOUNTED MAGNETIC LEVEL INDICATOR",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Side Mounted Magnetic Level Indicator",
  categories: [
    { position: 1, name: "PROCESS CONNECTION TYPE", options: [{ code: "F", description: "FLANGE END" }, { code: "T", description: "THREADED" }, { code: "CU", description: "CUST." }] },
    { position: 2, name: "PROCESS CONNECTION MOC", options: [{ code: "S1", description: "SS 304" }, { code: "S2", description: "SS 316" }, { code: "S3", description: "TITANIUM" }, { code: "PP", description: "PP" }, { code: "P", description: "PVDF / FP2" }, { code: "CU", description: "CUST." }] },
    { position: 3, name: "PROCESS CONNECTION STD", options: [{ code: "F1", description: "ASA 150 # RF" }, { code: "CU", description: "CUST." }] },
    { position: 4, name: "FLOAT CHAMBER", options: [{ code: "FC1", description: "SS 316 SCHD. 40" }, { code: "CU", description: "CUST." }] },
    { position: 5, name: "FLOAT MOC", options: [{ code: "FS", description: "SS 304" }, { code: "FS1", description: "SS 316" }, { code: "FS2", description: "SS 316L" }, { code: "FS3", description: "TITANIUM (BELOW 0.9 DENSITY)" }, { code: "FP", description: "PP" }, { code: "FP1", description: "PTFE LINING" }] },
    { position: 6, name: "AIR VENT TYPE", options: [{ code: "AS", description: "1/2\" STOP PLUG" }, { code: "AB", description: "1/2\" BALL VALVE" }] },
    { position: 7, name: "DRAIN TYPE", options: [{ code: "DS", description: "1/2\" STOP PLUG" }, { code: "DB", description: "1/2\" BALL VALVE" }] },
    { position: 8, name: "JACKETING MOC", options: [{ code: "JNA", description: "JACKETING NOT APPLICABLE" }, { code: "J1", description: "SS 304" }, { code: "J2", description: "SS 316" }, { code: "CU", description: "CUSTOM" }] },
    { position: 9, name: "INDICATOR TYPE", options: [{ code: "FD", description: "FLAPPER DESIGN INDICATOR (TOUGHEND GLASS TUBE 25 NB OD)" }, { code: "RD", description: "ROLLER DESIGN INDICATOR" }, { code: "CD", description: "CAPSULE DESIGN INDICATOR" }] },
    { position: 10, name: "SCALE DETAILS", options: [{ code: "LC5", description: "LC 5" }, { code: "LC10", description: "LC 10" }, { code: "CU", description: "CUST." }] },
    { position: 11, name: "SCALE UNIT DETAILS", options: [{ code: "SU1", description: "CM — DEFAULT" }, { code: "SU2", description: "PERCENTAGE" }, { code: "SU3", description: "METER" }, { code: "CU", description: "CUST." }] },
    { position: 12, name: "LEVEL TRANSMITTER DETAILS", options: [{ code: "LR", description: "TRANSMITTER REQUIRED" }, { code: "LNR", description: "TRANSMITTER NOT REQUIRED" }] },
    { position: 13, name: "TRANSMITTER LENGTH", options: [{ code: "CC", description: "SAME AS C-C HEIGHT" }, { code: "CU", description: "CUSTOM" }] },
    { position: 14, name: "STEM MOC", options: [{ code: "SS", description: "SS 304 — 12.7MM" }, { code: "CU", description: "CUSTOM" }] },
    { position: 15, name: "OUTPUT DETAILS", options: [{ code: "01", description: "4-20mA" }, { code: "02", description: "4-20mA + HART" }, { code: "CU", description: "CUST." }] },
    { position: 16, name: "WIRING TYPE", options: [{ code: "W1", description: "2-WIRE" }, { code: "W2", description: "4-WIRE" }, { code: "CU", description: "CUSTOM" }] },
    { position: 17, name: "SWITCH DETAILS", options: [{ code: "SW", description: "REQUIRED" }, { code: "SNA", description: "NOT APPLICABLE" }] },
    { position: 18, name: "SWITCH TYPE", options: [{ code: "L", description: "L Type Switch" }, { code: "HL", description: "Hold On Type Switch" }] },
    { position: 19, name: "ENCLOSURE PROTECTION", options: [{ code: "WP", description: "Weather-Proof Aluminium Die Cast MOC" }, { code: "FLP", description: "Flameproof Aluminium Die Cast MOC" }] },
    { position: 20, name: "POWER SUPPLY", options: [{ code: "PS1", description: "230 VAC" }, { code: "PS2", description: "24 VDC" }, { code: "CU", description: "CUSTOM" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 6. TUBULAR LEVEL INDICATOR — FMIPL-TLI
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_TUBULAR_LEVEL: DecodificationEntry = {
  modelPrefix: "FMIPL-TLI",
  productFamily: "tubular_level",
  productName: "Tubular Level Indicator",
  docNo: "FT-DS-TUG-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for Tubular Level Indicator. Use the FMIPL-TLI master de-codification code from the catalogue. In case of custom, mention the technical details.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — TUBULAR LEVEL INDICATOR",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Tubular Level Indicator",
  categories: [
    { position: 1, name: "WETTED PARTS MOC", options: [{ code: "WP", description: "MS" }, { code: "WP1", description: "SS 304" }, { code: "WP2", description: "SS 316" }, { code: "WP3", description: "SS 316L" }, { code: "WP4", description: "PP" }, { code: "WP6", description: "SS 304 + PTFE LINING" }, { code: "WP7", description: "SS 316 + PTFE LINING" }, { code: "CU", description: "CUST." }] },
    { position: 2, name: "PROCESS CONNECTION TYPE", options: [{ code: "F", description: "FLANGE END" }, { code: "T", description: "THREADED" }, { code: "T1", description: "TC JOINT" }, { code: "CU", description: "CUST." }] },
    { position: 3, name: "PROCESS CONNECTION STD", options: [{ code: "F1", description: "ASA 150 # RF" }, { code: "F2", description: "ASA 300 # RF" }, { code: "TB1", description: "BSP (M)" }, { code: "TB2", description: "BSP (F)" }, { code: "TN1", description: "NPT (M)" }, { code: "TN2", description: "NPT (F)" }, { code: "TC", description: "TC JOINT" }, { code: "CU", description: "CUST." }] },
    { position: 4, name: "PROCESS CONNECTION MOC", options: [{ code: "C", description: "MS" }, { code: "S1", description: "SS 304" }, { code: "S2", description: "SS 316" }, { code: "S3", description: "SS 316L" }, { code: "P", description: "PP" }, { code: "P1", description: "MS + PTFE LINING" }, { code: "P2", description: "SS 304 + PTFE LINING" }, { code: "P3", description: "SS 316 + PTFE LINING" }, { code: "CU", description: "CUST." }] },
    { position: 5, name: "CAGING TYPE", options: [{ code: "TR", description: "TIE ROD" }, { code: "CC", description: "C-CHANNEL (DEFAULT)" }] },
    { position: 6, name: "CAGE MOC", options: [{ code: "SA", description: "ALUMINIUM" }, { code: "SA1", description: "ACRYLIC" }] },
    { position: 7, name: "SCALE MOC", options: [{ code: "DR", description: "DIRECT ENGRAVED ON CASING" }, { code: "SO", description: "SLIP-ON" }, { code: "CU", description: "CUST." }] },
    { position: 8, name: "GLAND MOC", options: [{ code: "GM", description: "MS" }, { code: "GS", description: "SS 304" }, { code: "GS1", description: "SS 316" }, { code: "GS2", description: "SS 316L" }, { code: "GP", description: "PVC" }, { code: "GF", description: "FRP" }] },
    { position: 9, name: "FLANGE TYPE", options: [{ code: "FS", description: "FLAT — SINGLE" }, { code: "FD", description: "FLAT — DOUBLE" }, { code: "W", description: "WELDED" }] },
    { position: 10, name: "VALVE BODY MOC", options: [{ code: "VM", description: "MS" }, { code: "VS1", description: "SS 304" }, { code: "VS2", description: "SS 316" }, { code: "VS3", description: "SS 316L" }, { code: "VP", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 11, name: "VALVE TRIM MOC", options: [{ code: "VT1", description: "SS 304" }, { code: "VT2", description: "SS 316" }, { code: "VT3", description: "SS 316L" }, { code: "VT4", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 12, name: "VALVE TYPE", options: [{ code: "NA", description: "NOT APPLICABLE" }, { code: "CU", description: "CUST." }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 7a. FLOAT & BOARD LEVEL GAUGE — FMIPL-FBLG
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_FLOAT_BOARD: DecodificationEntry = {
  modelPrefix: "FMIPL-FBLG",
  productFamily: "float_board_level",
  productName: "Float & Board Level Gauge",
  docNo: "FT-DS-FBL-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for Float & Board Level Gauge. When detailed choices are needed — F&B type, installation type, process connection, float size & MOC, inter connecting pipe, pulley & housing, scale, pointer, bracket, fasteners, anchor assembly — complete the FMIPL-FBLG master de-codification code from the catalogue. In case of custom, mention the technical details.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — FLOAT & BOARD LEVEL GAUGE",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Float & Board Level Gauge",
  categories: [
    { position: 1, name: "F&B TYPE", options: [{ code: "S", description: "SIMPLE" }, { code: "V", description: "VAPOR SEAL" }, { code: "SG", description: "SIMPLE WITH GUIDED FLOAT" }, { code: "VG", description: "VAPOR SEAL WITH GUIDED FLOAT" }] },
    { position: 2, name: "INSTALLATION TYPE", options: [{ code: "GL", description: "GROUND LEVEL TANK" }, { code: "UG", description: "UNDER GROUND LEVEL TANK" }, { code: "PT", description: "PARTIALLY U/G TANK" }, { code: "OH", description: "OVER HEAD TANK" }] },
    { position: 3, name: "PROCESS CONNECTION SIZE", options: [{ code: "1", description: "1\"" }, { code: "1.5", description: "1.5\"" }, { code: "2", description: "2\"" }, { code: "CU", description: "CUST." }] },
    { position: 4, name: "PROCESS CONNECTION MOC", options: [{ code: "CF", description: "CS" }, { code: "SF", description: "SS 304" }, { code: "SF1", description: "SS 316" }, { code: "PF", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 5, name: "FLOAT SIZE", options: [{ code: "10", description: "10\" DIA" }, { code: "12", description: "12\" DIA" }, { code: "14", description: "14\" DIA" }, { code: "CU", description: "CUST." }] },
    { position: 6, name: "FLOAT MOC", options: [{ code: "S1", description: "SS 304" }, { code: "S2", description: "SS 316" }, { code: "P1", description: "POLY PROPELENE" }, { code: "SP", description: "SS 304 WITH PTFE COATING" }, { code: "CP", description: "COPPER" }, { code: "CU", description: "CUST." }] },
    { position: 7, name: "INTER CONNECTING PIPE MOC", options: [{ code: "IC", description: "CS" }, { code: "IS1", description: "SS 304" }, { code: "IS2", description: "SS 316" }, { code: "IP", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 8, name: "PULLEY & PULLEY PIN MOC", options: [{ code: "SC", description: "SS 304" }, { code: "SC1", description: "SS 316" }, { code: "PC", description: "POLY PROPELENE" }, { code: "CU", description: "CUST." }] },
    { position: 9, name: "PULLEY HOUSING MOC", options: [{ code: "PH", description: "ALUMINIUM" }, { code: "PH1", description: "SS 304" }, { code: "PH2", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 10, name: "SCALE MOC", options: [{ code: "SA", description: "ALUMINIUM" }, { code: "SS", description: "SS 304" }, { code: "SF", description: "FRP" }, { code: "CU", description: "CUST." }] },
    { position: 11, name: "SCALE MARKING", options: [{ code: "C1", description: "CM" }, { code: "M", description: "CUBIC METER (M3)" }, { code: "L", description: "LTR." }, { code: "CU", description: "CUST." }] },
    { position: 12, name: "POINTER MOC", options: [{ code: "PC", description: "CS WITH PP ROLLER" }, { code: "PS", description: "SS 304 WITH PP ROLLER" }, { code: "CU", description: "CUST." }] },
    { position: 13, name: "BRACKET (T) MOC", options: [{ code: "BC", description: "CS" }, { code: "BS", description: "SS 304" }, { code: "CU", description: "CUST." }] },
    { position: 14, name: "FASTENERS MOC", options: [{ code: "FG", description: "GI PLATED" }, { code: "FS", description: "SS 304" }, { code: "CU", description: "CUST." }] },
    { position: 15, name: "ANCHOR ASSEMBLY", options: [{ code: "W", description: "WITH" }, { code: "WO", description: "WITHOUT" }] },
    { position: 16, name: "ANCHOR TYPE", options: [{ code: "AT1", description: "WELDED" }, { code: "AT2", description: "WEIGHTED" }] },
    { position: 17, name: "ANCHOR PLATE", options: [{ code: "AP", description: "CS" }, { code: "AP1", description: "SS 304" }, { code: "AP2", description: "SS 316" }, { code: "CU", description: "CUST." }] },
    { position: 18, name: "ANCHOR HOUSING", options: [{ code: "AH", description: "CS" }, { code: "AH1", description: "SS 304" }, { code: "AH2", description: "SS 316" }, { code: "AH3", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 19, name: "ANCHOR SPRING", options: [{ code: "AS", description: "CS" }, { code: "AS1", description: "SS 304" }, { code: "AS2", description: "SS 316" }, { code: "CU", description: "CUST." }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 7b. ULTRASONIC LEVEL TRANSMITTER — FMIPL-ULT
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_ULTRASONIC_LEVEL: DecodificationEntry = {
  modelPrefix: "FMIPL-ULT",
  productFamily: "ultrasonic_level",
  productName: "Ultrasonic Level Transmitter",
  docNo: "FT-DS-ULT-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for Ultrasonic Level Transmitter. Order Code for Ultrasonic Level Transmitter — complete the FMIPL-ULT master de-codification code from the catalogue. In case of custom, mention the technical details.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — ULTRASONIC LEVEL TRANSMITTER",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Ultrasonic Level Transmitter",
  categories: [
    { position: 1, name: "SENSOR MOC", options: [{ code: "SM1", description: "ABS — DEFAULT" }, { code: "SM2", description: "PTFE" }, { code: "CU", description: "CUSTOM" }] },
    { position: 2, name: "DISPLAY MOUNTING", options: [{ code: "DNA", description: "DISPLAY NOT REQUIRED" }, { code: "DI", description: "INTEGRAL MOUNTING" }, { code: "DR", description: "REMOTE MOUNTING — METERS" }] },
    { position: 3, name: "DISPLAY ENCLOSURE TYPE", options: [{ code: "DE1", description: "ALUMINIUM DIE-CAST — WEATHERPROOF" }, { code: "DE2", description: "ALUMINIUM DIE-CAST — FLAMEPROOF" }, { code: "DE3", description: "ABS — DEFAULT" }] },
    { position: 4, name: "PROCESS CONNECTION TYPE", options: [{ code: "PN1", description: "THREADED" }, { code: "PN2", description: "FLANGE-END" }, { code: "CU", description: "CUSTOM" }] },
    { position: 5, name: "OUTPUT", options: [{ code: "01", description: "4-20 mA" }, { code: "02", description: "4-20 mA + HART" }] },
    { position: 6, name: "COMMUNICATION OUTPUT", options: [{ code: "CO1", description: "RS 485" }, { code: "NA", description: "NOT APPLICABLE" }, { code: "CU", description: "CUSTOM" }] },
    { position: 7, name: "POWER SUPPLY", options: [{ code: "PS1", description: "24 VDC" }, { code: "PS2", description: "230 VAC" }, { code: "CU", description: "CUSTOM" }] },
    { position: 8, name: "WIRING TYPE", options: [{ code: "WT1", description: "2-WIRE" }, { code: "WT2", description: "4-WIRE" }] },
    { position: 9, name: "SENSOR RANGE", options: [{ code: "SR1", description: "0-6 MTRS" }, { code: "SR2", description: "0-8 MTRS" }, { code: "SR3", description: "0-10 MTRS" }, { code: "SR4", description: "0-15 MTRS" }] },
    { position: 10, name: "CABLE GLAND MOC", options: [{ code: "CG1", description: "PVC — DEFAULT" }, { code: "CG2", description: "SS 304" }, { code: "CG3", description: "SS 316" }, { code: "CU", description: "CUSTOM" }] },
    { position: 11, name: "CABLE ENTRY STANDARD", options: [{ code: "CE1", description: "PG 9" }, { code: "CE2", description: "PG 11" }, { code: "CE3", description: "M20 x 1.5" }, { code: "CU", description: "CUSTOM" }] },
    { position: 12, name: "CABLE GLAND PROTECTION", options: [{ code: "NA", description: "NOT APPLICABLE" }, { code: "CP1", description: "WEATHERPROOF" }, { code: "CP2", description: "FLAMEPROOF" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 7b. BY-PASS GLASS TUBE ROTAMETERS — FMIPL-BPGTR
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_BYPASS_ROTAMETER: DecodificationEntry = {
  modelPrefix: "FMIPL-BPGTR",
  productFamily: "bypass_rotameter",
  productName: "By-Pass Glass Tube Rotameter",
  docNo: "FT-DS-BPR-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for By-Pass Glass Tube Rotameter. When detailed choices are needed — wetted parts MOC, process connection, float MOC, scale, body, rangeability, orifice plate, carrier ring, flow direction, main connection, induced pipe, isolation valve — complete the FMIPL-BPGTR master de-codification code from the catalogue. In case of custom, mention the technical details.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — BY-PASS GLASS TUBE ROTAMETERS",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for By-Pass Glass Tube Rotameters",
  categories: [
    { position: 1, name: "WETTED PARTS MOC", options: [{ code: "WP", description: "MS" }, { code: "WP1", description: "SS 304" }, { code: "WP2", description: "SS 316" }, { code: "WP3", description: "PP" }, { code: "WP4", description: "MS+PTFE" }, { code: "WP5", description: "SS 304+PTFE" }, { code: "WP6", description: "SS 316+PTFE" }, { code: "CU", description: "CUST." }] },
    { position: 2, name: "PROCESS CONNECTION TYPE", options: [{ code: "F", description: "FLANGE END" }, { code: "T", description: "THREADED" }, { code: "T1", description: "TC JOINT" }, { code: "CU", description: "CUST." }] },
    { position: 3, name: "PROCESS CONNECTION MOC", options: [{ code: "C", description: "MS" }, { code: "S1", description: "SS 304" }, { code: "S2", description: "SS 316" }, { code: "S3", description: "SS 316L" }, { code: "CU", description: "CUST." }] },
    { position: 4, name: "PROCESS CONNECTION STD", options: [{ code: "F1", description: "ASA 150 # RF" }, { code: "F2", description: "ASA 300 # RF" }, { code: "F3", description: "BS TABLE 'F'" }, { code: "F4", description: "BS 10 TABLE 'F'" }, { code: "F5", description: "TABLE 'D'" }, { code: "TB1", description: "BSP (M)" }, { code: "TB2", description: "BSP (F)" }, { code: "TN1", description: "NPT (M)" }, { code: "TN2", description: "NPT (F)" }, { code: "TC", description: "TC JOINT" }, { code: "CU", description: "CUST." }] },
    { position: 5, name: "FLOAT MOC", options: [{ code: "FS", description: "SS 316" }, { code: "FT", description: "TEFLON" }, { code: "FP", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 6, name: "FLOAT RETAINER", options: [{ code: "RS", description: "SS 316" }, { code: "RT", description: "TEFLON" }, { code: "RP", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 7, name: "SCALE MOC", options: [{ code: "SA", description: "ALUMINIUM" }, { code: "SA1", description: "ACRYLIC" }, { code: "SS", description: "SS 304" }, { code: "SS1", description: "SS 316" }, { code: "CU", description: "CUST." }] },
    { position: 8, name: "BODY MOC", options: [{ code: "BS", description: "SS 304" }, { code: "BS1", description: "SS 316" }, { code: "BP", description: "MS+POWDER" }, { code: "B2", description: "MS+FRP" }, { code: "CU", description: "CUST." }] },
    { position: 9, name: "RANGEABILITY", options: [{ code: "F/F HT", description: "500 +/- 5 MM" }] },
    { position: 10, name: "ORIFICE PLATE MOC", options: [{ code: "OP1", description: "SS 316" }, { code: "OP2", description: "TEFLON" }, { code: "CU", description: "CUST." }] },
    { position: 11, name: "CARRIER RING", options: [{ code: "CR1", description: "CS" }, { code: "CR2", description: "SS 304" }, { code: "CR3", description: "SS 316" }, { code: "CR4", description: "SS 316L" }, { code: "CR5", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 12, name: "FLOW DIRECTION", options: [{ code: "BT", description: "BOTTOM/TOP" }, { code: "TB", description: "TOP/BOTTOM" }, { code: "LR", description: "LEFT/RIGHT" }, { code: "RL", description: "RIGHT/LEFT" }, { code: "CU", description: "CUST." }] },
    { position: 13, name: "MAIN CONNECTION STD", options: [{ code: "MC1", description: "ASA 150 # RF" }, { code: "MC2", description: "ASA 300 # RF" }, { code: "MC3", description: "ASA 600 # RF" }, { code: "CU", description: "CUST." }] },
    { position: 14, name: "INDUCED PIPE MOC", options: [{ code: "IP1", description: "CS" }, { code: "IP2", description: "SS 304" }, { code: "IP3", description: "SS 316" }, { code: "IP4", description: "SS 316L" }, { code: "IP5", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 15, name: "ISOLATION VALVE MOC", options: [{ code: "VM1", description: "CS" }, { code: "VM2", description: "SS 304" }, { code: "VM3", description: "SS 316" }, { code: "VM4", description: "SS 316L" }, { code: "VM5", description: "PP" }, { code: "CU", description: "CUST." }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 7c. METAL TUBE ROTAMETER — FMIPL-MTRM
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_METAL_TUBE: DecodificationEntry = {
  modelPrefix: "FMIPL-MTRM",
  productFamily: "metal_tube_rotameter",
  productName: "Metal Tube Rotameter",
  docNo: "FT-DS-MTR-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for Metal Tube Rotameter. When detailed choices are needed — wetted parts MOC, flow tube MOC, process connection, float MOC, jacketing, scale, liner, enclosure, output, power supply, installation, F/F length, cable gland — complete the FMIPL-MTRM master de-codification code from the catalogue. In case of custom, mention the technical details.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — METAL TUBE ROTAMETER",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Metal Tube Rotameter",
  categories: [
    { position: 1, name: "WETTED PARTS MOC", options: [{ code: "WP1", description: "SS 304" }, { code: "WP2", description: "SS 316" }, { code: "WP3", description: "SS 316L" }, { code: "CU", description: "CUST." }] },
    { position: 2, name: "FLOW TUBE MOC", options: [{ code: "TS1", description: "SS 304" }, { code: "TS2", description: "SS 316" }, { code: "TS3", description: "SS 316L" }, { code: "CU", description: "CUST." }] },
    { position: 3, name: "PROCESS CONNECTION TYPE", options: [{ code: "F", description: "FLANGE END" }, { code: "T", description: "THREADED" }, { code: "T1", description: "TC JOINT" }, { code: "CU", description: "CUST." }] },
    { position: 4, name: "PROCESS CONNECTION MOC", options: [{ code: "S1", description: "SS 304" }, { code: "S2", description: "SS 316" }, { code: "S3", description: "SS 316L" }, { code: "CU", description: "CUST." }] },
    { position: 5, name: "PROCESS CONNECTION STD", options: [{ code: "F1", description: "ASA 150 # RF" }, { code: "TB1", description: "BSP (M)" }, { code: "TB2", description: "BSP (F)" }, { code: "TN1", description: "NPT (M)" }, { code: "TN2", description: "NPT (F)" }, { code: "TC", description: "TC JOINT" }, { code: "CU", description: "CUST." }] },
    { position: 6, name: "FLOAT MOC", options: [{ code: "FS", description: "SS 316" }, { code: "FT", description: "TEFLON" }, { code: "CU", description: "CUST." }] },
    { position: 7, name: "FLOAT RETAINER", options: [{ code: "RS", description: "SS 316" }, { code: "RT", description: "TEFLON" }, { code: "CU", description: "CUST." }] },
    { position: 8, name: "JACKETING MOC", options: [{ code: "JNA", description: "JACKETING NOT APPLICABLE" }, { code: "JC1", description: "SS 304" }, { code: "JC2", description: "SS 316" }, { code: "CU", description: "CUST." }] },
    { position: 9, name: "SCALE MOC", options: [{ code: "SA", description: "ALUMINIUM" }, { code: "SS", description: "SS 304" }, { code: "SS1", description: "SS 316" }, { code: "CU", description: "CUST." }] },
    { position: 10, name: "LINER MOC", options: [{ code: "NA", description: "NOT APPLICABLE" }, { code: "PL", description: "PTFE" }, { code: "CU", description: "CUST." }] },
    { position: 11, name: "ENCLOSURE MOC", options: [{ code: "EA", description: "ALUMINIUM" }, { code: "ES", description: "SS 304" }] },
    { position: 12, name: "ENCLOSURE PROTECTION", options: [{ code: "WP", description: "WEATHERPROOF" }, { code: "FLP", description: "FLAMEPROOF - IIA, IIB AND IIC" }, { code: "FPE", description: "PESO CERTIFIED" }, { code: "FATX", description: "ATEX APPROVED" }] },
    { position: 13, name: "DIGITAL/ANALOGUE", options: [{ code: "DG", description: "DIGITAL" }, { code: "AG", description: "ANALOGUE" }] },
    { position: 14, name: "OUTPUT", options: [{ code: "M", description: "4-20MA" }, { code: "H", description: "4-20MA+HART" }, { code: "CU", description: "CUST." }] },
    { position: 15, name: "POWER SUPPLY", options: [{ code: "AC", description: "230 V AC" }, { code: "DC", description: "24 V DC" }, { code: "CU", description: "CUST." }] },
    { position: 16, name: "INSTALLATION", options: [{ code: "VI", description: "VERTICAL INSTALLATION" }, { code: "HT", description: "HORIZONTAL" }, { code: "CU", description: "CUST." }] },
    { position: 17, name: "F/F LENGTH", options: [{ code: "FF1", description: "350 MM (+/- 10 MM)" }, { code: "FF2", description: "250 MM (+/- 10MM)" }, { code: "CU", description: "CUSTOM" }] },
    { position: 18, name: "CABLE GLAND MOC", options: [{ code: "CG1", description: "SS 304" }, { code: "CG2", description: "SS 316" }, { code: "CG3", description: "BRASS NICKEL PLATED" }, { code: "CU", description: "CUST." }] },
    { position: 19, name: "CABLE GLAND STD.", options: [{ code: "CS1", description: "PG 9" }, { code: "CS2", description: "PG 11" }, { code: "CS3", description: "M20*15" }, { code: "CU", description: "CUST." }] },
    { position: 20, name: "CABLE GLAND PROTECTION STD", options: [{ code: "CGP1", description: "WEATHER-PROOF" }, { code: "CGP2", description: "FLAME-PROOF" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 7d. HYDROSTATIC LEVEL TRANSMITTER — FMIPL-HYLT
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_HYDROSTATIC_LEVEL: DecodificationEntry = {
  modelPrefix: "FMIPL-HYLT",
  productFamily: "hydrostatic_level",
  productName: "Hydrostatic Level Transmitter",
  docNo: "FT-DS-HYL-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for Hydrostatic Level Transmitter. When detailed choices are needed — installation type, connection type, connection MOC, probe MOC, communication output, cable entry, terminal type, display type, enclosure MOC, or accessories — complete the FMIPL-HYLT master de-codification code from the catalogue. In case of custom, mention the technical details.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — HYDROSTATIC LEVEL TRANSMITTER",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Hydrostatic Level Transmitter Decodification",
  categories: [
    { position: 1, name: "INSTALLATION TYPE", options: [{ code: "N", description: "SUBMERSIBLE" }, { code: "S", description: "NON-SUBMERSIBLE" }] },
    { position: 2, name: "CONNECTION TYPE", options: [{ code: "S1", description: "SUBMERSIBLE - W/O ENCLOSURE" }, { code: "S2", description: "SUBMERSIBLE - WITH IP65 ENCLOSURE" }, { code: "N1", description: "NON-SUBMERSIBLE - SCREWED + PLUG IN CONNECTOR" }, { code: "S2", description: "NON-SUBMERSIBLE - SCREWED + 1 MTR CABLE" }, { code: "N3", description: "NON-SUBMERSIBLE - FLANGED + PLUG-IN CONNECTOR" }, { code: "N4", description: "NON-SUBMERSIBLE - FLANGED + 1 MTR CABLE" }] },
    { position: 3, name: "CONNECTION MOC", options: [{ code: "NA", description: "NOT APPLICABLE" }, { code: "1", description: "SS 304" }, { code: "2", description: "SS 316" }, { code: "OT", description: "OTHERS" }] },
    { position: 4, name: "PROBE MOC", options: [{ code: "NA", description: "SS 304" }, { code: "1", description: "SS 316" }, { code: "2", description: "SS 316L" }, { code: "OT", description: "HASTALLOY-C" }, { code: "CU", description: "OTHERS" }] },
    { position: 5, name: "COMMUNICATION OUTPUT", options: [{ code: "1", description: "4-20mA (2 WIRE)" }, { code: "2", description: "RS 485" }, { code: "3", description: "HART V7.6" }] },
    { position: 6, name: "CABLE ENTRY", options: [{ code: "M", description: "M20" }, { code: "N", description: "1/2 NPT" }] },
    { position: 7, name: "TERMINAL TYPE", options: [{ code: "T1", description: "WITH INTEGRAL DISPLAY" }, { code: "T2", description: "WITHOUT TERMINAL" }, { code: "T3", description: "WITH RTD HEAD & FLANGE" }] },
    { position: 8, name: "DISPLAY TYPE", options: [{ code: "W", description: "WITHOUT DISPLAY" }, { code: "I", description: "INTEGRAL DISPLAY" }, { code: "RE", description: "REMOTE DISPLAY" }] },
    { position: 9, name: "ENCLOSURE MOC", options: [{ code: "WP", description: "AL. DIE CAST WEATHERPROOF" }, { code: "FLP", description: "FLAMEPROOF (ZONE IIA, IIb & IIC)" }, { code: "ABS", description: "ABS PLASTIC" }] },
    { position: 10, name: "ACCESSORIES", options: [{ code: "A1", description: "JUNCTION BOX - FRP/ABS" }, { code: "A2", description: "BALLAST WITH ROPE" }, { code: "A3", description: "GUIDE PIPE" }, { code: "A4", description: "ISOLATION VALVE" }, { code: "NA", description: "NOT APPLICABLE" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 7e. GLASS TUBE ROTAMETER — FMIPL-GTRM
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_GLASS_TUBE: DecodificationEntry = {
  modelPrefix: "FMIPL-GTRM",
  productFamily: "glass_tube_rotameter",
  productName: "Glass Tube Rotameter",
  docNo: "FT-DS-GTR-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for Glass Tube Rotameter. When detailed choices are needed — wetted parts MOC, process connection, float MOC, float retainer, scale MOC, body MOC, inlet/outlet — complete the FMIPL-GTRM master de-codification code from the catalogue. In case of custom, mention the technical details.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — GLASS TUBE ROTAMETER",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Glass Tube Rotameter",
  categories: [
    { position: 1, name: "WETTED PARTS MOC", options: [{ code: "WP", description: "MS" }, { code: "WP1", description: "SS 304" }, { code: "WP2", description: "SS 316" }, { code: "WP3", description: "PP" }, { code: "WP4", description: "MS+PTFE" }, { code: "WP5", description: "SS 304+PTFE" }, { code: "WP6", description: "SS 316+PTFE" }, { code: "WP7", description: "SS 316L" }, { code: "CU", description: "CUST." }] },
    { position: 2, name: "PROCESS CONNECTION TYPE", options: [{ code: "F", description: "FLANGE END" }, { code: "T", description: "THREADED" }, { code: "T1", description: "TC JOINT" }, { code: "CU", description: "CUST." }] },
    { position: 3, name: "PROCESS CONNECTION MOC", options: [{ code: "C", description: "MS" }, { code: "S1", description: "SS 304" }, { code: "S2", description: "SS 316" }, { code: "S3", description: "SS 316L" }, { code: "P1", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 4, name: "PROCESS CONNECTION STD", options: [{ code: "F1", description: "ASA 150 # RF" }, { code: "F2", description: "ASA 300 # RF" }, { code: "F3", description: "BS TABLE 'F'" }, { code: "F4", description: "BS 10 TABLE 'F'" }, { code: "F5", description: "TABLE 'D'" }, { code: "TB1", description: "BSP (M)" }, { code: "TB2", description: "BSP (F)" }, { code: "TN1", description: "NPT (M)" }, { code: "TN2", description: "NPT (F)" }, { code: "TC", description: "TC JOINT" }, { code: "CU", description: "CUST." }] },
    { position: 5, name: "FLOAT MOC", options: [{ code: "FS", description: "SS 316" }, { code: "FT", description: "TEFLON" }, { code: "FP", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 6, name: "FLOAT RETAINER", options: [{ code: "RS", description: "SS 316" }, { code: "RT", description: "TEFLON" }, { code: "RP", description: "PP" }, { code: "CU", description: "CUST." }] },
    { position: 7, name: "SCALE MOC", options: [{ code: "SA", description: "ALUMINIUM" }, { code: "SA1", description: "ACRYLIC" }, { code: "SS", description: "SS 304" }, { code: "SS1", description: "SS 316" }, { code: "CU", description: "CUST." }] },
    { position: 8, name: "BODY MOC", options: [{ code: "BS", description: "SS 304" }, { code: "BS1", description: "SS 316" }, { code: "BP", description: "MS+POWDER" }, { code: "BF", description: "MS+FRP" }, { code: "CU", description: "CUST." }] },
    { position: 9, name: "INLET/OUTLET", options: [{ code: "BT", description: "BOTTOM/TOP" }, { code: "CU", description: "CUST." }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 8a. SMART PRESSURE TRANSMITTER — FMIPL-SMT
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_SMART_PRESSURE: DecodificationEntry = {
  modelPrefix: "FMIPL-SMT",
  productFamily: "smart_pressure",
  productName: "Smart Pressure Transmitter",
  docNo: "FT-DS-SPT-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for Smart Pressure Transmitter. When detailed choices are needed — measuring type, pressure range, wetted parts housing MOC, process connection type, process connection MOC, process connection STD, diaphragm MOC, enclosure type, output, power supply, communication, wiring type, mounting bracket, cable gland MOC, cable entry standard, or cable gland protection — complete the FMIPL-SMT master de-codification code from the catalogue. In case of custom, mention the technical details.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — SMART PRESSURE TRANSMITTER",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Smart Pressure Transmitter",
  categories: [
    { position: 1, name: "MEASURING TYPE", options: [{ code: "AP", description: "ABSOLUTE PRESSURE" }, { code: "GP", description: "GAUGE PRESSURE — DEFAULT" }] },
    { position: 2, name: "PRESSURE RANGE TYPE", options: [{ code: "PR0", description: "0 TO 10 BAR" }, { code: "PR1", description: "0 TO 20 BAR" }, { code: "PR2", description: "0 TO 50 BAR" }, { code: "PR3", description: "0 TO 100 BAR" }, { code: "PR4", description: "0 TO 250 BAR" }, { code: "PR5", description: "0 TO 400 BAR" }, { code: "CU", description: "CUSTOM" }] },
    { position: 3, name: "WETTED PARTS HOUSING MOC", options: [{ code: "BH1", description: "SS 304" }, { code: "BH2", description: "SS 316" }, { code: "CU", description: "CUST." }] },
    { position: 4, name: "PROCESS CONNECTION TYPE", options: [{ code: "PCF", description: "FLANGE END" }, { code: "PCT", description: "THREADED" }, { code: "PCFL", description: "FLUSH TYPE" }, { code: "CU", description: "CUST." }] },
    { position: 5, name: "PROCESS CONNECTION MOC", options: [{ code: "S1", description: "SS 304" }, { code: "S2", description: "SS 316" }, { code: "CU", description: "CUST." }] },
    { position: 6, name: "PROCESS CONNECTION STD", options: [{ code: "F1", description: "ASA 150 # RF" }, { code: "TB1", description: "1/4\" BSP (M)" }, { code: "TB2", description: "1/2\" BSP (M)" }, { code: "TB3", description: "1/4\" BSP (F)" }, { code: "TB4", description: "1/2\" BSP (F)" }, { code: "TN1", description: "1/4\" NPT (M)" }, { code: "TN2", description: "1/2\" NPT (M)" }, { code: "TN3", description: "1/4\" NPT (F)" }, { code: "TN4", description: "1/2\" NPT (F)" }, { code: "M20", description: "M20*1.5" }, { code: "FD1", description: "FLUSH DIAPHGRAM (TRICLOVER)" }, { code: "FD2", description: "FLUSH DIAPHGRAM (SCREWED CONNECTION)" }, { code: "D1", description: "DIAPHGRAM (SEAL)" }, { code: "D2", description: "5 MTR. CAPILLARY" }, { code: "CU", description: "CUST." }] },
    { position: 7, name: "DIAPHRAGM MOC", options: [{ code: "DP1", description: "SS 316" }, { code: "DP2", description: "SS 316L" }, { code: "DP3", description: "HASTALLOY-C" }, { code: "CU", description: "CUST." }] },
    { position: 8, name: "ENCLOSURE TYPE", options: [{ code: "WP", description: "WEATHERPROOF DIE CAST ALUMINIUM" }, { code: "FPL", description: "FLAMEPROOF — ALUMINIUM DIE CAST" }, { code: "ATX", description: "ATEX — ALUMINIUM DIE CAST" }] },
    { position: 9, name: "OUTPUT", options: [{ code: "M", description: "4-20mA" }, { code: "H", description: "4-20mA+HART" }] },
    { position: 10, name: "POWER SUPPLY", options: [{ code: "AC", description: "230 V AC" }, { code: "DC", description: "24 V DC — DEFAULT" }, { code: "CU", description: "CUST." }] },
    { position: 11, name: "COMMUNICATION", options: [{ code: "CR", description: "RS 485" }, { code: "NA", description: "NOT APPLICABLE" }] },
    { position: 12, name: "WIRING TYPE", options: [{ code: "W1", description: "2-WIRE" }, { code: "W2", description: "4-WIRE" }] },
    { position: 13, name: "MOUNTING BRACKET DETAILS", options: [{ code: "MBA", description: "MOUNTING BRACKET REQUIRED" }, { code: "NA", description: "NOT APPLICABLE" }] },
    { position: 14, name: "CABLE GLAND MOC", options: [{ code: "CG1", description: "PVC — DEFAULT" }, { code: "CG2", description: "SS 304" }, { code: "CG3", description: "SS 316" }, { code: "CG4", description: "BRASS NICKEL PLATED" }, { code: "CU", description: "CUSTOM" }] },
    { position: 15, name: "CABLE ENTRY STANDARD", options: [{ code: "CE1", description: "PG 9" }, { code: "CE2", description: "PG 11" }, { code: "CE3", description: "M20*1.5" }, { code: "CU", description: "CUST." }] },
    { position: 16, name: "CABLE GLAND PROTECTION TYPE", options: [{ code: "CP1", description: "WEATHER-PROOF" }, { code: "CP2", description: "FLAMEPROOF — PESO CERTIFIED" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 8b. MINIATURE PRESSURE TRANSMITTER — FMIPL-MPTM
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_MINIATURE_PRESSURE: DecodificationEntry = {
  modelPrefix: "FMIPL-MPTM",
  productFamily: "miniature_pressure",
  productName: "Miniature Pressure Transmitter",
  docNo: "FT-DS-MPT-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for Miniature Pressure Transmitter. When detailed choices are needed — measurement type, pressure range, output, diaphragm MOC, fill fluid, process connection, power supply, or display — complete the FMIPL-MPTM master de-codification code from the catalogue. In case of custom, mention the technical details. Note: Absolute Pressure Min.: 0.35 Bar; Max.: 30 Bar. Gauge Pressure Min.: 0.1 Bar; Max.: 1000 Bar.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — MINIATURE PRESSURE TRANSMITTER",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Pressure Transmitter Decodification",
  categories: [
    { position: 1, name: "MEASUREMENT TYPE", options: [{ code: "AP", description: "ABSOLUTE PRESSURE" }, { code: "GP", description: "GAUGE PRESSURE" }] },
    { position: 2, name: "PRESSURE RANGE TYPE", options: [{ code: "PR 1", description: "-1 TO 0 BAR" }, { code: "PR 2", description: "-0.35 TO 0 BAR" }, { code: "PR 3", description: "-0.2 TO 0 BAR" }, { code: "PR 4", description: "0 TO 0.1 BAR" }, { code: "PR 5", description: "0 TO 0.35 BAR" }, { code: "PR 6", description: "0 TO 0.7 BAR" }, { code: "PR 7", description: "0 TO 1 BAR" }, { code: "PR 8", description: "0 TO 1.6 BAR" }, { code: "PR 9", description: "0 TO 2.5 BAR" }, { code: "PR 10", description: "0 TO 4 BAR" }, { code: "PR 11", description: "0 TO 6 BAR" }, { code: "PR 12", description: "0 TO 10 BAR" }, { code: "PR 13", description: "0 TO 16 BAR" }, { code: "PR 14", description: "0 TO 20 BAR" }, { code: "PR 15", description: "0 TO 25 BAR" }, { code: "PR 16", description: "0 TO 60 BAR" }, { code: "PR 17", description: "0 TO 100 BAR" }, { code: "OTH", description: "CUSTOMIZED RANGE (MENTION RANGE)" }] },
    { position: 3, name: "OUTPUT", options: [{ code: "O 1", description: "4-20mA" }, { code: "O 2", description: "RS 485" }] },
    { position: 4, name: "DIAPHRAGM MOC", options: [{ code: "D 1", description: "SS 316L" }, { code: "D 2", description: "HASTALLOY-C" }, { code: "OT", description: "OTHERS" }] },
    { position: 5, name: "FILL FLUID", options: [{ code: "O 1", description: "SILICON" }, { code: "CT", description: "CUSTOMIZED" }] },
    { position: 6, name: "PROCESS CONNECTION TYPE", options: [{ code: "P 1", description: "1/4\" NPT M" }, { code: "P 2", description: "1/2\" NPT M" }, { code: "P 3", description: "1/4\" BSP M" }, { code: "P 4", description: "1/2\" BSP M" }, { code: "P 5", description: "1/2\" NPT F" }, { code: "P 6", description: "1/4\" NPT F" }, { code: "P 7", description: "1/4\" BSP F" }, { code: "P 8", description: "1/2\" BSP F" }, { code: "P 9", description: "M20*1.5" }, { code: "P 10", description: "FLUSH DIAPHRAGM (TRICLOVER)" }, { code: "P 11", description: "FLUSH DIAPHRAGM (SCREWED CONNECTION)" }, { code: "P 12", description: "DIAPHRAGM (SEAL)" }, { code: "OTH", description: "OTHERS" }] },
    { position: 7, name: "POWER SUPPLY", options: [{ code: "P 1", description: "24 VDC" }, { code: "P 2", description: "230 VAC" }, { code: "P 3", description: "CUSTOMIZED" }] },
    { position: 8, name: "DISPLAY DETAILS", options: [{ code: "WD", description: "WITH DISPLAY" }, { code: "WID", description: "WITHOUT DISPLAY" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 8c. SIMPLE DIFFERENTIAL PRESSURE TRANSMITTER — FMIPL-SDPT (QYB16X)
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_DP_SIMPLE: DecodificationEntry = {
  modelPrefix: "FMIPL-SDPT",
  productFamily: "dp_pressure_simple",
  productName: "Simple Differential Pressure Transmitter",
  docNo: "FT-DS-SDPT-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for Simple Differential Pressure Transmitter (QYB16X). When detailed choices are needed — display type, output, measuring range, accuracy, thread, or wetted material — complete the FMIPL-SDPT master de-codification code from the catalogue.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — SIMPLE DIFFERENTIAL PRESSURE TRANSMITTER",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for Simple Differential Pressure Transmitter",
  categories: [
    { position: 1, name: "DISPLAY TYPE", options: [{ code: "X0", description: "NON-DISPLAY" }, { code: "X2", description: "LED/LCD (2088 SHELL)" }, { code: "X4", description: "LED (STAINLESS STEEL SHELL)" }] },
    { position: 2, name: "OUTPUT", options: [{ code: "I", description: "4-20mA" }, { code: "R", description: "RS485" }, { code: "V5", description: "0-5V" }, { code: "V10", description: "0-10V" }] },
    { position: 3, name: "MEASURING RANGE", options: [{ code: "MR", description: "(0-X)MPa — X = ACTUAL REQUIRED RANGE" }] },
    { position: 4, name: "ACCURACY", options: [{ code: "S", description: "0.5%F.S" }] },
    { position: 5, name: "THREAD", options: [{ code: "G14", description: "G1/4" }, { code: "NPT14", description: "NPT1/4" }, { code: "G12", description: "G1/2" }, { code: "NPT12", description: "NPT1/2" }, { code: "G38", description: "G3/8" }, { code: "CU", description: "CUSTOMIZED" }] },
    { position: 6, name: "WETTED MATERIAL", options: [{ code: "S4", description: "SS304" }, { code: "S6", description: "SS316L" }, { code: "SP", description: "PTFE" }, { code: "SM", description: "SPECIAL MATERIALS" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// 8d. HIGH PRECISION DIFFERENTIAL PRESSURE TRANSMITTER — FMIPL-HPDPT (QYB401)
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_DP_HIGH_PRECISION: DecodificationEntry = {
  modelPrefix: "FMIPL-HPDPT",
  productFamily: "dp_pressure_high_precision",
  productName: "High Precision Differential Pressure Transmitter",
  docNo: "FT-DS-HPDPT-002",
  revision: "Rev.1",
  date: "01/01/2024",
  description: "Master De-codification Sheet for High Precision Differential Pressure Transmitter (QYB401). When detailed choices are needed — connection type, fixed work stress, range, output, electrical interface, isolation diaphragm, sensor filling fluid, explosion-proof certification, mounting brackets, or thread — complete the FMIPL-HPDPT master de-codification code from the catalogue.",
  headerTitle: "MASTER DE-CODIFICATION SHEET — HIGH PRECISION DIFFERENTIAL PRESSURE TRANSMITTER",
  catalogueRef: "Catalogue reference: Product Ordering Information / Order Code for High Precision Differential Pressure Transmitter",
  categories: [
    { position: 1, name: "CONNECTION TYPE", options: [{ code: "DP", description: "INTELLIGENT DIFFERENTIAL PRESSURE TRANSMITTER" }, { code: "DL", description: "SINGLE FLANGE LEVEL TRANSMITTER (DN25-DN150)" }, { code: "DF", description: "SINGLE FLANGE REMOTE DIFFERENTIAL PRESSURE TRANSMITTER (DN25-DN150)" }, { code: "DWF", description: "DOUBLE FLANGE REMOTE TRANSMISSION DIFFERENTIAL PRESSURE TRANSMITTER (DN25-DN150)" }] },
    { position: 2, name: "FIXED WORK STRESS", options: [{ code: "P2", description: "16MPa" }, { code: "P3", description: "25MPa" }, { code: "P4", description: "42MPa" }] },
    { position: 3, name: "RANGE", options: [{ code: "0B", description: "(0~0.6)KPa~6KPa" }, { code: "0C", description: "(0~2)KPa~40KPa" }, { code: "0E", description: "(0~2.5)KPa~250KPa" }, { code: "0F", description: "(0~10)KPa~1MPa" }, { code: "0G", description: "(0~3.0)KPa~3MPa" }] },
    { position: 4, name: "OUTPUT", options: [{ code: "E", description: "4-20mA+HART" }, { code: "R", description: "RS485" }] },
    { position: 5, name: "ELECTRICAL INTERFACE SELECTION", options: [{ code: "L1", description: "ALUMINUM ALLOY SHELL, ELECTRICAL INTERFACE M20*1.5" }, { code: "L2", description: "ALUMINUM ALLOY SHELL, ELECTRICAL INTERFACE NPT1/2" }, { code: "G1", description: "STAINLESS STEEL 316L SHELL, ELECTRICAL INTERFACE M20*1.5" }, { code: "G2", description: "STAINLESS STEEL 316L HOUSING, ELECTRICAL INTERFACE NPT1/2" }] },
    { position: 6, name: "ISOLATION DIAPHRAGM", options: [{ code: "S", description: "SS316L (RELATED WETTED PARTS SS304)" }, { code: "H", description: "SS316L (RELATED WETTED PARTS SS316)" }, { code: "C", description: "HC-276 (RELATED WETTED PARTS SS316)" }, { code: "T", description: "TANTALUM (RELATED WETTED PARTS SS316)" }, { code: "I", description: "TITANIUM (RELATED WETTED PARTS SS316)" }, { code: "G", description: "SS316L GOLD PLATED (RELATED WETTED PARTS SS316)" }] },
    { position: 7, name: "SENSOR FILLING FLUID", options: [{ code: "G", description: "SILICONE OIL" }, { code: "F", description: "FLUORINE OIL" }, { code: "S", description: "EDIBLE OIL" }] },
    { position: 8, name: "EXPLOSION-PROOF CERTIFICATION", options: [{ code: "E0", description: "NON-EXPLOSION PROOF" }, { code: "E1", description: "Exia II BT6Ga" }, { code: "E2", description: "Exdb II CT6Gb" }, { code: "E3", description: "Extd A21IP67 T85°C" }] },
    { position: 9, name: "MOUNTING BRACKETS", options: [{ code: "W", description: "NO MOUNTING BRACKET" }, { code: "P", description: "TABLET MOUNTING BRACKET" }, { code: "Z", description: "RIGHT ANGLE MOUNTING BRACKET" }] },
    { position: 10, name: "THREAD", options: [{ code: "T0", description: "1/4 NPT(F)" }, { code: "T1", description: "1/4NPT-M20*1.5(M)-φ14 PRESSURE TUBE (1 SET)" }, { code: "T2", description: "1/4NPT-M20*1.5(M) T-TYPE JOINT-φ14 PRESSURE TUBE (1 SET)" }, { code: "T3", description: "1/4NPT-1/2NPT(F) WAIST CONNECTOR" }, { code: "T4", description: "1/4NPT-G1/2(F) WAIST CONNECTOR" }, { code: "T5", description: "THREE VALVES MANIFOLD" }] },
  ],
  hasDecodification: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// LOOKUP MAPS
// ═══════════════════════════════════════════════════════════════════════════

export const DECODE_MASTER_MAP: Record<DecodeProductFamily, DecodificationEntry> = {
  emf: DECODE_EMF,
  oval_gear: DECODE_OVAL_GEAR,
  vortex: DECODE_VORTEX,
  turbine: DECODE_TURBINE,
  reflex_level: DECODE_REFLEX_LEVEL,
  transparent_level: DECODE_TRANSPARENT_LEVEL,
  magnetic_level: DECODE_MAGNETIC_LEVEL,
  top_mounted_magnetic: DECODE_TOP_MOUNTED_MAGNETIC,
  tubular_level: DECODE_TUBULAR_LEVEL,
  ultrasonic_level: DECODE_ULTRASONIC_LEVEL,
  radar_level: DECODE_RADAR_LEVEL,
  float_board_level: DECODE_FLOAT_BOARD,
  bypass_rotameter: DECODE_BYPASS_ROTAMETER,
  metal_tube_rotameter: DECODE_METAL_TUBE,
  glass_tube_rotameter: DECODE_GLASS_TUBE,
  hydrostatic_level: DECODE_HYDROSTATIC_LEVEL,
  miniature_pressure: DECODE_MINIATURE_PRESSURE,
  smart_pressure: DECODE_SMART_PRESSURE,
  dp_pressure_simple: DECODE_DP_SIMPLE,
  dp_pressure_high_precision: DECODE_DP_HIGH_PRECISION,
};

export const ALL_DECODE_ENTRIES: DecodificationEntry[] = [
  DECODE_EMF,
  DECODE_OVAL_GEAR,
  DECODE_VORTEX,
  DECODE_TURBINE,
  DECODE_REFLEX_LEVEL,
  DECODE_TRANSPARENT_LEVEL,
  DECODE_MAGNETIC_LEVEL,
  DECODE_TOP_MOUNTED_MAGNETIC,
  DECODE_TUBULAR_LEVEL,
  DECODE_ULTRASONIC_LEVEL,
  DECODE_RADAR_LEVEL,
  DECODE_FLOAT_BOARD,
  DECODE_BYPASS_ROTAMETER,
  DECODE_METAL_TUBE,
  DECODE_GLASS_TUBE,
  DECODE_HYDROSTATIC_LEVEL,
  DECODE_MINIATURE_PRESSURE,
  DECODE_SMART_PRESSURE,
  DECODE_DP_SIMPLE,
  DECODE_DP_HIGH_PRECISION,
];

export const DECODE_PRODUCT_LABELS: Record<DecodeProductFamily, string> = {
  emf: "Electromagnetic Flow Meter",
  oval_gear: "Digital Oval Gear Flow Meter",
  vortex: "Vortex Flowmeter",
  turbine: "Turbine Flow Meter",
  reflex_level: "Reflex Level Gauge",
  transparent_level: "Transparent Level Gauge",
  magnetic_level: "Side Mounted Magnetic Level Indicator",
  top_mounted_magnetic: "Top Mounted Magnetic Level Indicator",
  tubular_level: "Tubular Level Indicator",
  ultrasonic_level: "Ultrasonic Level Transmitter",
  radar_level: "Radar Level Transmitter",
  float_board_level: "Float & Board Level Gauge",
  bypass_rotameter: "By-Pass Glass Tube Rotameter",
  metal_tube_rotameter: "Metal Tube Rotameter",
  glass_tube_rotameter: "Glass Tube Rotameter",
  hydrostatic_level: "Hydrostatic Level Transmitter",
  miniature_pressure: "Miniature Pressure Transmitter",
  smart_pressure: "Smart Pressure Transmitter",
  dp_pressure_simple: "Simple Differential Pressure Transmitter (QYB16X)",
  dp_pressure_high_precision: "High Precision Differential Pressure Transmitter (QYB401)",
};

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTS AWAITING de-codification upload
// ═══════════════════════════════════════════════════════════════════════════

export const NON_DECODIFICATION_PRODUCTS: string[] = [
  // Flow Meters
  "ultrasonic", // Ultrasonic Flow Meter (different from Ultrasonic Level Transmitter)
  // Rotameters
  "acrylic_body_rotameter",
  // Level Devices
  // (none remaining - all level devices now have de-codification)
  // Pressure Transmitters
  // (none remaining - all pressure transmitters now have de-codification)
];
