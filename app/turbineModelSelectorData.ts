// ============================================================
// Turbine Flowmeter Model Selector Data — 9 FlowTurb Models
// ============================================================

export interface TurbineModelConfig {
  id: string;
  modelName: string;
  modelCode: string;
  configurablePositions: number[];
  allConfig: boolean;
  description: string;
  highlights: string[];
  datasheetFile?: string;
}

export const TURBINE_MODELS: TurbineModelConfig[] = [
  {
    id: "l270",
    modelName: "FlowTurb L270",
    modelCode: "FMIPL-TFM-FT2-F-S2-F1IR-W2-WP-M-CR-xx-xx-NB",
    configurablePositions: [14, 15],
    allConfig: false,
    description: "Standard turbine flow meter for simple liquids with low or no conductivity. SS 316 flowtube, flanged connection, regular impeller, and weatherproof enclosure.",
    highlights: ["Flowtube: SS 316 | Impeller: SS 410", "Connection: Flange ASA 150# RF", "Output: 4-20mA + Pulse + 2 Relay", "Protection: Weatherproof IP67"],
    datasheetFile: "/datasheets/turbine/FlowTurb_L270_.pdf",
  },
  {
    id: "l270b",
    modelName: "FlowTurb L270B",
    modelCode: "FMIPL-TFM-FT2-F-S2-F1IR-W2-WP-M-CR-xx-xx-NB",
    configurablePositions: [14, 15],
    allConfig: false,
    description: "Battery-operated turbine flow meter with 3.6V Lithium battery (up to 5 years life). For remote locations without mains power. Same specifications as L270 with battery power supply.",
    highlights: ["Power: 3.6V Lithium Battery (5+ years)", "Flowtube: SS 316 | Impeller: SS 410", "Output: 4-20mA + Pulse + 2 Relay", "Note: 24VDC needed for output signal"],
    datasheetFile: "/datasheets/turbine/FlowTurb_L270B.pdf",
  },
  {
    id: "l270ex",
    modelName: "FlowTurb L270 Ex",
    modelCode: "FMIPL-TFM-FT2-F-S2-F1-IR-W2-FLP-M-CR-xx-xx-xx-NB",
    configurablePositions: [14, 15, 16],
    allConfig: false,
    description: "Flameproof turbine flow meter with PESO certification (IIA, IIB, IIC). For hazardous area measurement of low conductive liquids. SS 316 construction with flameproof enclosure.",
    highlights: ["Certification: Flameproof PESO IIA IIB IIC", "Flowtube: SS 316 | Impeller: SS 410", "Enclosure: Flameproof | Wire: 4-Wire", "Viscosity: Max. 5 cP"],
    datasheetFile: "/datasheets/turbine/FlowTurb_L270Ex.pdf",
  },
  {
    id: "l270exf",
    modelName: "FlowTurb L270 ExF",
    modelCode: "FMIPL-TFM-FT2-S2-IR-W2-FLP-M-CR-xx-xx-xx-xx-NB",
    configurablePositions: [14, 15, 16, 17],
    allConfig: false,
    description: "Flameproof turbine flow meter with screwed connection. PESO certified for hazardous areas. SS 316 flowtube with SS 410 impeller. For low conductive liquids in explosion-proof environments.",
    highlights: ["Certification: Flameproof PESO IIA IIB IIC", "Connection: Screwed SS 316", "Flowtube: SS 316 | Impeller: SS 410", "Mounting: Integral or Remote"],
    datasheetFile: "/datasheets/turbine/FlowTurb_L270_ExF.pdf",
  },
  {
    id: "l270f",
    modelName: "FlowTurb L270F",
    modelCode: "FMIPL-TFM-FT2-S2-IR-W2-WP-M-CR-xx-xx-xx-xx-NB",
    configurablePositions: [14, 15, 16, 17],
    allConfig: false,
    description: "Turbine flow meter with screwed connection and weatherproof enclosure. SS 316 construction for low conductive liquids. Configurable process connection type and standard.",
    highlights: ["Connection: Screwed SS 316 (default)", "Flowtube: SS 316 | Impeller: SS 410", "Enclosure: Weatherproof IP67", "Output: 4-20mA + Pulse + 2 Relay"],
    datasheetFile: "/datasheets/turbine/FlowTurb_L270F.pdf",
  },
  {
    id: "l630",
    modelName: "FlowTurb L630",
    modelCode: "FMIPL-TFM-FT2-T1-S2-CU-IR-W2-WP-M-CR-xx-xx-xx-xx-NB",
    configurablePositions: [14, 15, 16, 17],
    allConfig: false,
    description: "Sanitary turbine flow meter for food grade applications. TC connection with SS 316 flowtube and SS 410 impeller. Designed for hygienic measurement of low conductive liquids.",
    highlights: ["Connection: TC (Tri-Clover) | Std: ASME", "Flowtube: SS 316 | Impeller: SS 410", "For Food Grade / Hygienic Applications", "Output: 4-20mA + Pulse + 2 Relay"],
    datasheetFile: "/datasheets/turbine/FlowTurb_L360.pdf",
  },
  {
    id: "l630ex",
    modelName: "FlowTurb L630 Ex",
    modelCode: "FMIPL-TFM-FT2-T1-S2-CU-IR-W2-WP-M-CR-xx-xx-xx-xx-NB",
    configurablePositions: [14, 15, 16, 17],
    allConfig: false,
    description: "Flameproof sanitary turbine flow meter for food grade applications in hazardous areas. TC connection, SS 316 construction, PESO certified flameproof enclosure.",
    highlights: ["Certification: Flameproof PESO IIA IIB IIC", "Connection: TC | Std: ASME", "Flowtube: SS 316 | Impeller: SS 410", "For F&B Hazardous Area Applications"],
    datasheetFile: "/datasheets/turbine/FlowTurb_L360Ex.pdf",
  },
  {
    id: "l900",
    modelName: "FlowTurb L900",
    modelCode: "FMIPL-TFM-FT2-F-S2-F1-IR-W2-WP-M-WO-DC-xx-NB",
    configurablePositions: [14],
    allConfig: false,
    description: "Cost-effective turbine flow meter with pickup sensor output (no display/controller). 3-wire design powered by 8-24 VDC. For budget-conscious low conductive liquid measurement.",
    highlights: ["Cost-effective pickup sensor design", "Mounting: WO (No Display/Controller)", "Power: 8-24 VDC | Wire: 3-Wire", "Output: 4-20mA + Pulse + 2 Relay"],
    datasheetFile: "/datasheets/turbine/FlowTurb_L900.pdf",
  },
  {
    id: "l900f",
    modelName: "FlowTurb L900 F",
    modelCode: "FMIPL-TFM-FT2-S2-IR-W2-WO-M-xx-xx-xx-NB",
    configurablePositions: [14, 15, 16],
    allConfig: false,
    description: "Cost-effective flameproof turbine flow meter with pickup sensor. 2-wire design, 8-28 VDC powered. Screwed SS 316 connection for hazardous area low conductive liquid measurement.",
    highlights: ["Cost-effective Flameproof design", "Connection: Screwed SS 316", "Mounting: WO (Pickup Sensor Only)", "Power: 8-28 VDC | Wire: 2-Wire"],
    datasheetFile: "/datasheets/turbine/FlowTurb_L900F.pdf",
  },
];

export const TURBINE_MODEL_MAP: Record<string, TurbineModelConfig> = Object.fromEntries(
  TURBINE_MODELS.map((m) => [m.id, m])
);
