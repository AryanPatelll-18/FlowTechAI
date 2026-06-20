// ============================================================
// Metal Tube Rotameter Model Selector Data — 12 FlowMet Models
// ============================================================

export interface MetalTubeModelConfig {
  id: string;
  modelName: string;
  modelCode: string;
  configurablePositions: number[];
  allConfig: boolean;
  description: string;
  highlights: string[];
  datasheetFile?: string;
}

export const METAL_TUBE_MODELS: MetalTubeModelConfig[] = [
  {
    id: "l180",
    modelName: "FlowMet L180",
    modelCode: "FMIPL-MTRM-WP2-TS2-F-S2-F1-FS-RS-JNA-SA-NA-EA-WP-AG-VI-FF2-CG1-CS1-CGP1-NB",
    configurablePositions: [],
    allConfig: false,
    description: "For measurement of standard liquid and gas applications",
    highlights: [
      "Temp: -30 Deg Celcius to 150 Deg Celcius | Pressure: -0.9 Bar to 40 Bar",
      "Enclosure: Weatherproof",
      "Output: Analogue",
      "Float: SS 316",
    ],
    datasheetFile: "/datasheets/metal/FlowMet_L180.pdf",
  },
  {
    id: "l180f",
    modelName: "FlowMet L180F",
    modelCode: "FLIPM-MTRM-WP2-TS2-S2-FS-RS-JNA-SA-NA-EA-WP-AG-VI-FF2-CG1-CS1-CGP1-xx-xx-NB",
    configurablePositions: [1, 2],
    allConfig: true,
    description: "For high pressure measurement of standard liquid and gas applications",
    highlights: [
      "Temp: -30 Deg Celcius to 350 Deg Celcius | Pressure: -0.9 Bar to 200 Bar",
      "Enclosure: Weatherproof",
      "Output: Analogue",
      "Float: SS 316",
    ],
    datasheetFile: "/datasheets/metal/FlowMet_L180F.pdf",
  },
  {
    id: "l360",
    modelName: "FlowMet L360",
    modelCode: "FMIPL-MTRM-WP2-TS2-F-S2-F1-FS-RS-SA-NA-EA-VI-FF2-CG1-CS1-DG-WP-CGP1-NB",
    configurablePositions: [],
    allConfig: false,
    description: "For advance measurement of standard liquid and gas applications with PLC Outputs",
    highlights: [
      "Temp: -30 Deg Celcius to 150 Deg Celcius | Pressure: -0.9 Bar to 40 Bar",
      "Enclosure: Weatherproof",
      "Output: 4-20 mA + HART",
      "Float: SS 316",
    ],
    datasheetFile: "/datasheets/metal/FlowMet_L360.pdf",
  },
  {
    id: "l360ex",
    modelName: "FlowMet L360Ex",
    modelCode: "FMIPL-MTRM-WP2-TS2-F-S2-F1-FS-RS-SA-NA-EA-VI-FF2-CG1-CS1-DG-FLP-CGP2-NB",
    configurablePositions: [],
    allConfig: false,
    description: "For advance measurement of standard liquid and gas applications with PLC Outputs in Hazardous area",
    highlights: [
      "Temp: -30 Deg Celcius to 150 Deg Celcius | Pressure: -0.9 Bar to 40 Bar",
      "Enclosure: Flameproof",
      "Output: 4-20 mA + HART",
      "Float: SS 316",
    ],
    datasheetFile: "/datasheets/metal/FlowMet_L360Ex.pdf",
  },
  {
    id: "l360f",
    modelName: "FlowMet L360F",
    modelCode: "FMIPL-MTRM-WP2-TS2-S2-FS-RS-JNA-SA-NA-EA-DG-VI-FF2-CG1-CS1-WP-CGP1-xx-xx-NB",
    configurablePositions: [1, 2],
    allConfig: true,
    description: "For high pressure measurement of standard liquid and gas applications with PLC Outputs",
    highlights: [
      "Temp: -30 Deg Celcius to 350 Deg Celcius | Pressure: -0.9 Bar to 200 Bar",
      "Enclosure: Weatherproof",
      "Output: 4-20 mA + HART",
      "Float: SS 316",
    ],
    datasheetFile: "/datasheets/metal/FlowMet_L360F.pdf",
  },
  {
    id: "l600",
    modelName: "FlowMet L600",
    modelCode: "FMIPL-MTRM-TS2-F-S2-F1-FT-RT-SA-PL-EA-VI-FF2-CG1-CS1-AG-WP-CGP1-NB",
    configurablePositions: [],
    allConfig: false,
    description: "For measurement of Highly Corrosive Applications",
    highlights: [
      "Temp: -30 Deg Celcius to 150 Deg Celcius | Pressure: -0.9 Bar to 40 Bar",
      "Enclosure: Weatherproof",
      "Output: Analogue",
      "Float: SS 316 + PTFE Coating",
    ],
    datasheetFile: "/datasheets/metal/FlowMet_L600.pdf",
  },
  {
    id: "l600f",
    modelName: "FlowMet L600F",
    modelCode: "FMIPL-MTRM-TS2-S2-FT-RT-SA-PL-EA-VI-FF2-CG1-CS1-AG-WP-CGP1-xx-xx-NB",
    configurablePositions: [1, 2],
    allConfig: true,
    description: "For measurement of Highly Corrosive Applications with High Pressure",
    highlights: [
      "Temp: -30 Deg Celcius to 150 Deg Celcius | Pressure: -0.9 Bar to 400 Bar",
      "Enclosure: Weatherproof",
      "Output: Analogue",
      "Float: SS 316 + PTFE Coating",
    ],
    datasheetFile: "/datasheets/metal/FlowMet_L600F.pdf",
  },
  {
    id: "l630",
    modelName: "FlowMet L630",
    modelCode: "FMIPL-MTRM-TS2-F-S2-F1-FT-RT-SA-PL-EA-VI-FF2-CG1-CS1-DG-WP-CGP1-NB",
    configurablePositions: [],
    allConfig: false,
    description: "For measurement of Highly Corrosive Applications",
    highlights: [
      "Temp: -30 Deg Celcius to 150 Deg Celcius | Pressure: -0.9 Bar to 40 Bar",
      "Enclosure: Weatherproof",
      "Output: 4-20 mA + HART",
      "Float: SS 316 + PTFE Coating",
    ],
    datasheetFile: "/datasheets/metal/FlowMet_L630.pdf",
  },
  {
    id: "l630ex",
    modelName: "FlowMet L630Ex",
    modelCode: "FMIPL-MTRM-TS2-F-S2-F1-FT-RT-SA-PL-EA-VI-FF2-CG1-CS1-DG-FLP-CGP1-NB",
    configurablePositions: [],
    allConfig: false,
    description: "For measurement of Highly Corrosive Applications",
    highlights: [
      "Temp: -30 Deg Celcius to 150 Deg Celcius | Pressure: -0.9 Bar to 40 Bar",
      "Enclosure: Flameproof",
      "Output: 4-20 mA + HART",
      "Float: SS 316 + PTFE Coating",
    ],
    datasheetFile: "/datasheets/metal/FlowMet_L630Ex.pdf",
  },
  {
    id: "l630exf",
    modelName: "FlowMet L630ExF",
    modelCode: "FMIPL-MTRM-TS2-S2-FT-RT-SA-PL-EA-VI-FF2-CG1-CS1-DG-FLP-CGP2-xx-xx-NB",
    configurablePositions: [1, 2],
    allConfig: true,
    description: "For measurement of Highly Corrosive Applications with High Pressure for Hazardous Area",
    highlights: [
      "Temp: -30 Deg Celcius to 150 Deg Celcius | Pressure: -0.9 Bar to 400 Bar",
      "Enclosure: Flameproof",
      "Output: 4-20 mA + HART",
      "Float: SS 316 + PTFE Coating",
    ],
    datasheetFile: "/datasheets/metal/FlowMet_L630ExF.pdf",
  },
  {
    id: "l630f",
    modelName: "FlowMet L630F",
    modelCode: "FMIPL-MTRM-TS2-S2-FT-RT-SA-PL-EA-VI-FF2-CG1-CS1-DG-WP-CGP1-xx-xx-NB",
    configurablePositions: [1, 2],
    allConfig: true,
    description: "For measurement of Highly Corrosive Applications with High Pressure",
    highlights: [
      "Temp: -30 Deg Celcius to 150 Deg Celcius | Pressure: -0.9 Bar to 400 Bar",
      "Enclosure: Weatherproof",
      "Output: 4-20 mA + HART",
      "Float: SS 316 + PTFE Coating",
    ],
    datasheetFile: "/datasheets/metal/FlowMet_L630F.pdf",
  },
  {
    id: "l900",
    modelName: "FlowMet L900",
    modelCode: "FMIPL-MTRM-WP2-TS2-S2-FS-RS-SA-NA-EA-WP-VI-FF2-CG1-CS1-CGP1-xx-xx-NB",
    configurablePositions: [1, 2],
    allConfig: true,
    description: "For specialised measurement in Hygiene & Foog Grade Applications",
    highlights: [
      "Temp: -30 Deg Celcius to 150 Deg Celcius | Pressure: -0.9 Bar to 40 Bar",
      "Enclosure: Weatherproof",
      "Float: SS 316",
      "Accuracy: +/- 2% FSD",
    ],
    datasheetFile: "/datasheets/metal/FlowMet_L900.pdf",
  }
];
