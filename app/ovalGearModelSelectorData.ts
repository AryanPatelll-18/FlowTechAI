// ============================================================
// Oval Gear Flowmeter Model Selector Data — 12 FlowVal Models
// ============================================================

export interface OvalGearModelConfig {
  id: string;
  modelName: string;
  modelCode: string;
  configurablePositions: number[];
  allConfig: boolean;
  description: string;
  highlights: string[];
  datasheetFile?: string;
}

export const OVALGEAR_MODELS: OvalGearModelConfig[] = [
  {
    id: "l270",
    modelName: "FlowVal L270",
    modelCode: "FMIPL-DOGFM-PC2-PCM4-PCS2-RM1-SM1-O1-24VDC-NB",
    configurablePositions: [],
    allConfig: false,
    description: "Cost-effective oval gear flowmeter for high viscous liquids. Threaded connection, aluminium anodized rotor, SS 316 shaft. Direct pulse output without display.",
    highlights: ["Viscosity: 10 to 300 cP | Accuracy: +/-0.5-1% MV", "Rotor: Aluminium Anodized | Shaft: SS 316", "Connection: 1/4\" BSP(F) Threaded", "Output: 4-20mA | Power: 24VDC"],
    datasheetFile: "/datasheets/oval/FlowVal_L270.pdf",
  },
  {
    id: "l270f",
    modelName: "FlowVal L270F",
    modelCode: "FMIPL-DOGFM-PCM4-RM1-SM1-O1-24VDC-NB",
    configurablePositions: [8, 9, 10],
    allConfig: false,
    description: "Oval gear flowmeter with customised process connection. Flange-end or TC connection options, ASA 150 class. Aluminium rotor, SS 316 shaft, LCD with backlight.",
    highlights: ["Viscosity: 10 to 300 cP | Accuracy: +/-0.5% MV", "Variable: Connection type & standard", "Display: LCD with Backlight | Readings: Rate + Totalizer", "Output: 4-20mA | Power: 24VDC"],
    datasheetFile: "/datasheets/oval/FlowVal_L270F.pdf",
  },
  {
    id: "l360",
    modelName: "FlowVal L360",
    modelCode: "FMIPL-DOGFM-PC2-PCM3-PCS2-RM2-SM1-O1-24VDC-NB",
    configurablePositions: [],
    allConfig: false,
    description: "Cost-effective oval gear flowmeter for viscous & corrosive liquids. SS 316 rotor and process connection, threaded 1/4\" BSP(F). Direct pulse output.",
    highlights: ["Viscosity: 10 to 300 cP | Accuracy: +/-0.5-1% MV", "Rotor & Connection: SS 316", "Connection: 1/4\" BSP(F) Threaded", "Output: 4-20mA | Power: 24VDC"],
    datasheetFile: "/datasheets/oval/FlowVal_L360.pdf",
  },
  {
    id: "l360f",
    modelName: "FlowVal L360F",
    modelCode: "FMIPL-DOGFM-PCM3-RM2-SM1-O1-24VDC-NB",
    configurablePositions: [8, 9, 10],
    allConfig: false,
    description: "Oval gear flowmeter with customised connection for viscous & corrosive liquids. SS 316 rotor and connection. LCD display, flange-end or TC options.",
    highlights: ["Viscosity: 10 to 300 cP | Accuracy: +/-0.5% MV", "Rotor & Connection MOC: SS 316", "Variable: Connection type & standard", "LCD with Backlight | Rate + Totalizer"],
    datasheetFile: "/datasheets/oval/FlowVal_L360F.pdf",
  },
  {
    id: "l400",
    modelName: "FlowVal L400",
    modelCode: "FMIPL-DOGFM-PC2-PCM4-PCS2-RM1-SM1-DD2-O1-CO1-230VAC24VDC-NB",
    configurablePositions: [12, 13],
    allConfig: false,
    description: "Standard oval gear flowmeter for high viscous liquids. Threaded connection, aluminium rotor, SS 316 shaft. Weatherproof display with LCD backlight. Dual power supply.",
    highlights: ["Viscosity: 10 to 300 cP | Accuracy: +/-0.5-1% MV", "Display: Weatherproof | LCD Backlight", "Power: 230VAC & 24VDC | Comm: RS 485", "Variable: Mounting type (Integral/Remote)"],
    datasheetFile: "/datasheets/oval/FlowVal_L400.pdf",
  },
  {
    id: "l400ex",
    modelName: "FlowVal L400Ex",
    modelCode: "FMIPL-DOGFM-PC2-PCM4-PCS2-RM1-SM1-DD3-O1-CO1-230VAC24VDC-NB",
    configurablePositions: [12, 13],
    allConfig: false,
    description: "Flameproof oval gear flowmeter for hazardous areas. PESO certified IIA IIB IIC. Threaded connection, aluminium rotor, SS 316 shaft. Flameproof LCD display.",
    highlights: ["Certification: Flameproof PESO IIA IIB IIC", "Display: Flameproof LCD | Power: 230VAC & 24VDC", "Viscosity: 10 to 300 cP", "Variable: Mounting type (Integral/Remote)"],
    datasheetFile: "/datasheets/oval/FlowVal_L400Ex.pdf",
  },
  {
    id: "l400exf",
    modelName: "FlowVal L400ExF",
    modelCode: "FMIPL-DOGFM-PCM4-RM1-SM1-DD3-O1-CO1-230VAC24VDC-NB",
    configurablePositions: [8, 9, 10, 12, 13],
    allConfig: false,
    description: "Flameproof oval gear flowmeter with customised connection. PESO IIA IIB IIC. Variable connection type (Flange/TC/Custom) and standard. Aluminium rotor, SS 316 shaft.",
    highlights: ["Flameproof: PESO IIA IIB IIC", "Variable: Connection type, std, mounting", "Display: Flameproof LCD | Comm: RS 485", "Power: 230VAC & 24VDC"],
    datasheetFile: "/datasheets/oval/FlowVal_LF400ExF.pdf",
  },
  {
    id: "l400f",
    modelName: "FlowVal L400F",
    modelCode: "FMIPL-DOGFM-PCM4-RM1-SM1-DD2-O1-CO1-230VAC24VDC-NB",
    configurablePositions: [8, 9, 10, 12, 13],
    allConfig: false,
    description: "Oval gear flowmeter with customised process connection. Weatherproof display. Variable connection (Flange/TC/Custom) and mounting (Integral/Remote).",
    highlights: ["Variable: Connection type, std, mounting", "Display: Weatherproof LCD | Comm: RS 485", "Rotor: Aluminium | Shaft: SS 316", "Power: 230VAC & 24VDC"],
    datasheetFile: "/datasheets/oval/FlowVal_L400F.pdf",
  },
  {
    id: "l450",
    modelName: "FlowVal L450",
    modelCode: "FMIPL-DOGFM-PC2-PCM4-PCS2-RM1-SM1-DD2-O1-CO1-230VAC24VDC-NB",
    configurablePositions: [12, 13],
    allConfig: false,
    description: "Oval gear flowmeter for highly corrosive & viscous liquids. Threaded connection, SS 316 rotor, weatherproof display with LCD. RS 485 communication.",
    highlights: ["Viscosity: 10 to 300 cP | Corrosive liquids", "Rotor: SS 316 | Shaft: SS 316", "Display: Weatherproof LCD | Comm: RS 485", "Variable: Mounting type (Integral/Remote)"],
    datasheetFile: "/datasheets/oval/FlowVal_L450.pdf",
  },
  {
    id: "l450ex",
    modelName: "FlowVal L450Ex",
    modelCode: "FMIPL-DOGFM-PC2-PCM4-PCS2-RM1-SM1-DD3-O1-CO1-230VAC24VDC-NB",
    configurablePositions: [12, 13],
    allConfig: false,
    description: "Flameproof oval gear flowmeter for corrosive viscous liquids in hazardous areas. PESO certified. SS 316 rotor, flameproof display.",
    highlights: ["Certification: Flameproof PESO IIA IIB IIC", "Rotor: SS 316 | For corrosive liquids", "Display: Flameproof LCD | Comm: RS 485", "Variable: Mounting type (Integral/Remote)"],
    datasheetFile: "/datasheets/oval/FlowVal_L450Ex.pdf",
  },
  {
    id: "l450exf",
    modelName: "FlowVal L450ExF",
    modelCode: "FMIPL-DOGFM-PCM3-RM2-SM1-DD3-O1-CO1-230VAC24VDC-NB",
    configurablePositions: [8, 9, 10, 12, 13],
    allConfig: false,
    description: "Flameproof oval gear flowmeter for corrosive viscous liquids with customised connection. PESO certified. SS 316 rotor and connection. High pressure up to 300 Bar.",
    highlights: ["Pressure: -0.9 to 300 Bar | Flameproof: PESO", "Rotor & Connection: SS 316", "Variable: Connection, std, mounting", "Display: Flameproof LCD | Power: 230VAC & 24VDC"],
    datasheetFile: "/datasheets/oval/FlowVal_L450ExF.pdf",
  },
  {
    id: "l450f",
    modelName: "FlowVal L450F",
    modelCode: "FMIPL-DOGFM-PCM3-RM2-SM1-DD2-O1-CO1-230VAC24VDC-NB",
    configurablePositions: [8, 9, 10, 12, 13],
    allConfig: false,
    description: "Oval gear flowmeter for corrosive viscous liquids with customised connection. SS 316 rotor and connection. Weatherproof display. High pressure up to 300 Bar.",
    highlights: ["Pressure: -0.9 to 300 Bar", "Rotor & Connection: SS 316", "Variable: Connection, std, mounting", "Display: Weatherproof LCD | Power: 230VAC & 24VDC"],
    datasheetFile: "/datasheets/oval/FlowVal_L450F.pdf",
  },
];

export const OVALGEAR_MODEL_MAP: Record<string, OvalGearModelConfig> = Object.fromEntries(
  OVALGEAR_MODELS.map((m) => [m.id, m])
);
