// ============================================================
// Vortex Flowmeter Model Selector Data — 7 FlowSwirl Models
// ============================================================

export interface VortexModelConfig {
  id: string;
  modelName: string;
  modelCode: string;
  configurablePositions: number[];
  allConfig: boolean;
  description: string;
  highlights: string[];
  datasheetFile?: string;
}

export const VORTEX_MODELS: VortexModelConfig[] = [
  {
    id: "l360",
    modelName: "FlowSwirl L360",
    modelCode: "FMIPL-VFM-IT1-PCT2-FT2-PC1-PCM2-PCS1-MT1-EPT1-O2-CO1-WT2-PS1-NB",
    configurablePositions: [],
    allConfig: false,
    description: "Standard vortex flowmeter for volumetric measurement of liquids & gases. SS 316 flowtube, flange-end connection, 4-20mA+HART+Pulse output with integral mounting.",
    highlights: ["Pressure: -0.9 to 30 Bar | Temp: -25 to 180°C", "Flowtube: SS 316 | Connection: Flange ASA 150", "Output: 4-20mA + HART + Pulse | Comm: RS 485", "P&T Compensation: Without"],
    datasheetFile: "/datasheets/vortex/FlowSwirl_L360.pdf",
  },
  {
    id: "l360f",
    modelName: "FlowSwirl L360F",
    modelCode: "FMIPL-VFM-IT1-PCT2-FT2-PCM2-MT1-EPT1-O2-CO1-WT2-PS1-xx-xx-NB",
    configurablePositions: [14, 15],
    allConfig: false,
    description: "High pressure vortex flowmeter for liquids & gases. SS 316 flowtube with configurable connection type (Flange/Wafer/Threaded) and standard (ASA 150/300/Custom).",
    highlights: ["Pressure: -0.9 to 150 Bar | Temp: -25 to 180°C", "Flowtube: SS 316 | Variable: Connection type & std", "Output: 4-20mA + HART + Pulse", "P&T Compensation: Without"],
    datasheetFile: "/datasheets/vortex/FlowSwirl_L360F.pdf",
  },
  {
    id: "l360s",
    modelName: "FlowSwirl L360S",
    modelCode: "FMIPL-VFM-IT1-PCT2-FT2-PC3-PCM2-PCS1-MT1-EPT1-O2-CO1-WT2-PS1-NB",
    configurablePositions: [],
    allConfig: false,
    description: "Sanitary vortex flowmeter for Food & Beverage applications. TC end connection with SS 316 flowtube, ASME standard. 4-20mA+HART+Pulse output.",
    highlights: ["Connection: TC End | Std: ASME", "Flowtube: SS 316 | Temp: -25 to 180°C", "Output: 4-20mA + HART + Pulse", "For F&B hygienic applications"],
    datasheetFile: "/datasheets/vortex/FlowSwirl_L360S.pdf",
  },
  {
    id: "l600",
    modelName: "FlowSwirl L600",
    modelCode: "FMIPL-VFM-IT1-PCT1-FT2-PC1-PCM2-PCS1-MT1-EPT1-O2-CO1-WT2-PS1-NB",
    configurablePositions: [],
    allConfig: false,
    description: "Vortex flowmeter with Pressure & Temperature Compensation for liquids & gases. SS 316 flowtube, flanged connection, integral mounting with weatherproof enclosure.",
    highlights: ["P&T Compensation: With", "Pressure: -0.9 to 30 Bar | Temp: -25 to 180°C", "Output: 4-20mA + HART + Pulse", "Flowtube: SS 316 | Flange: ASA 150"],
    datasheetFile: "/datasheets/vortex/FlowSwirl_L600.pdf",
  },
  {
    id: "l600f",
    modelName: "FlowSwirl L600 F",
    modelCode: "FMIPL-VFM-IT1-PCT2-FT2-PCM2-MT1-EPT1-O2-CO1-WT2-PS1-xx-xx-NB",
    configurablePositions: [14, 15],
    allConfig: false,
    description: "High pressure vortex flowmeter with P&T Compensation. Configurable connection type and standard. SS 316 flowtube for demanding liquid & gas applications.",
    highlights: ["Pressure: -0.9 to 150 Bar | P&T Compensation: With", "Variable: Connection type (Flange/Wafer/Threaded)", "Output: 4-20mA + HART + Pulse", "Flowtube: SS 316"],
    datasheetFile: "/datasheets/vortex/FlowSwirl_L600_F.pdf",
  },
  {
    id: "l600s",
    modelName: "FlowSwirl L600S",
    modelCode: "FMIPL-VFM-IT1-PCT2-FT2-PC3-PCM2-PCS1-MT1-EPT1-O2-CO1-WT2-PS1-NB",
    configurablePositions: [],
    allConfig: false,
    description: "Sanitary vortex flowmeter with P&T Compensation for F&B industry. TC connection, SS 316, ASME standard. 4-20mA+HART+Pulse output.",
    highlights: ["P&T Compensation: With | Connection: TC", "For F&B Industry applications", "Flowtube: SS 316 | Std: ASME", "Output: 4-20mA + HART + Pulse"],
    datasheetFile: "/datasheets/vortex/FlowSwirl_L600S.pdf",
  },
  {
    id: "l900",
    modelName: "FlowSwirl L900",
    modelCode: "FMIPL-VFM-IT2-PCT1-FT2-PC1-PCM2-PCS1-MT1-EPT1-O1-CO1-WT1-PS1-NB",
    configurablePositions: [],
    allConfig: false,
    description: "IBR approved & certified vortex flowmeter with P&T Compensation. IBR approved drawings, IBR inspection. 4-20mA+Pulse output, 2-wire without RS 485.",
    highlights: ["IBR Approved & Certified", "P&T Compensation: With", "Output: 4-20mA + Pulse | Wire: 2-Wire", "Connection Std: ASA 300/600 WNRF + Custom"],
    datasheetFile: "/datasheets/vortex/FlowSwirl_L900__IBR_Vortex_Flow.pdf",
  },
];

export const VORTEX_MODEL_MAP: Record<string, VortexModelConfig> = Object.fromEntries(
  VORTEX_MODELS.map((m) => [m.id, m])
);
