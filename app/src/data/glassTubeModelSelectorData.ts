// ============================================================
// Glass Tube Rotameter Model Selector Data — 12 FlowGT Models
// ============================================================

export interface GlassTubeModelConfig {
  id: string;
  modelName: string;
  modelCode: string;
  configurablePositions: number[];
  allConfig: boolean;
  description: string;
  highlights: string[];
  datasheetFile?: string;
}

export const GLASS_TUBE_MODELS: GlassTubeModelConfig[] = [
  {
    id: "r180",
    modelName: "FlowGT R180",
    modelCode: "FMIPL-GTRM-WP-F-C-F1-FS-RS-SA1-BP-BT-NB",
    configurablePositions: [],
    allConfig: false,
    description: "Cost-Effective measurement of standard liquids & gases",
    highlights: [
      "Temp: -20 Deg to 90 Deg Celcius | Pressure: 0 to 5 Bar",
      "End Connection: MS",
      "Float: SS 316",
      "Body: MS+Powder Coated",
    ],
    datasheetFile: "/datasheets/glass/FlowGT_R180.pdf",
  },
  {
    id: "r180f",
    modelName: "FlowGT R180F",
    modelCode: "FMIPL-GTRM-WP-C-FS-RS-SA1-BP-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3],
    allConfig: true,
    description: "Effective measurement of corrosive liquids & gases for high pressure with lining",
    highlights: [
      "Temp: -20 Deg to 90 Deg Celcius | Pressure: 0 to 5 Bar",
      "End Connection: MS",
      "Float: SS 316",
      "Body: MS+Powder Coated",
    ],
    datasheetFile: "/datasheets/glass/FlowGT_R180F.pdf",
  },
  {
    id: "r180t",
    modelName: "FlowGT R180T",
    modelCode: "FMIPL-GTRM-WP-F-C-F1-FT-RT-SA1-BP-BT-NB",
    configurablePositions: [],
    allConfig: false,
    description: "Cost-Effective measurement of standard liquids & gases",
    highlights: [
      "Temp: -20 Deg to 90 Deg Celcius | Pressure: 0 to 5 Bar",
      "End Connection: MS",
      "Float: Teflon",
      "Body: MS+Powder Coated",
    ],
    datasheetFile: "/datasheets/glass/FlowGT_R180T.pdf",
  },
  {
    id: "r270",
    modelName: "FlowGT R270",
    modelCode: "FMIPL-GTRM-WP1-F-S1-F1-FS-RS-SS-BS-BT-NB",
    configurablePositions: [],
    allConfig: false,
    description: "Advance measurement of corrosive liquids & gases",
    highlights: [
      "Temp: -20 Deg to 90 Deg Celcius | Pressure: 0 to 5 Bar",
      "End Connection: SS 304",
      "Float: SS 316",
      "Body: SS 304",
    ],
    datasheetFile: "/datasheets/glass/FlowGT_R270.pdf",
  },
  {
    id: "r270f",
    modelName: "FlowGT R270F",
    modelCode: "FMIPL-GTRM-WP1-S1-FS-RS-SS-BS-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3],
    allConfig: true,
    description: "Effective measurement of corrosive liquids & gases for high pressure with lining",
    highlights: [
      "Temp: -20 Deg to 90 Deg Celcius | Pressure: 0 to 5 Bar",
      "End Connection: SS 304",
      "Float: SS 316",
      "Body: SS 304",
    ],
    datasheetFile: "/datasheets/glass/FlowGT_R270F.pdf",
  },
  {
    id: "r270t",
    modelName: "FlowGT R270T",
    modelCode: "FMIPL-GTRM-WP1-F-S1-F1-FT-RT-SS-BS-BT-NB",
    configurablePositions: [],
    allConfig: false,
    description: "Advance measurement of corrosive liquids & gases",
    highlights: [
      "Temp: -20 Deg to 90 Deg Celcius | Pressure: 0 to 5 Bar",
      "End Connection: SS 304",
      "Float: Teflon",
      "Body: SS 304",
    ],
    datasheetFile: "/datasheets/glass/FlowGT_R270T.pdf",
  },
  {
    id: "r360",
    modelName: "FlowGT R360",
    modelCode: "FMIPL-GTRM-WP2-F-S2-F1-FS-RS-SA-BS1-BT-NB",
    configurablePositions: [],
    allConfig: false,
    description: "2.0",
    highlights: [
      "Temp:  | Pressure: 0 to 5 Bar",
      "End Connection: SS 316",
      "Float: SS 316",
      "Body: SS 316",
    ],
    datasheetFile: "/datasheets/glass/FlowGT_R360.pdf",
  },
  {
    id: "r360f",
    modelName: "FlowGT R360F",
    modelCode: "FMIPL-GTRM-WP2-S2-FS-RS-SS1-BS1-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3],
    allConfig: true,
    description: "Effective measurement of corrosive liquids & gases for high pressure",
    highlights: [
      "Temp: -20 Deg to 90 Deg Celcius | Pressure: 0 to 5 Bar",
      "End Connection: SS 316",
      "Float: SS 316",
      "Body: SS 316",
    ],
    datasheetFile: "/datasheets/glass/FlowGT_R360F.pdf",
  },
  {
    id: "r360t",
    modelName: "FlowGT R360T",
    modelCode: "FMIPL-GTRM-WP2-F-S2-F1-FT-RT-SS1-BS1-BT-NB",
    configurablePositions: [],
    allConfig: false,
    description: "2.0",
    highlights: [
      "Temp:  | Pressure: 0 to 5 Bar",
      "End Connection: SS 316",
      "Float: Teflon",
      "Body: SS 316",
    ],
    datasheetFile: "/datasheets/glass/FlowGT_R360T.pdf",
  },
  {
    id: "rp180",
    modelName: "FlowGT RP180",
    modelCode: "FMIPL-GTRM-WP3-F-P1-F1-FT-RT-SA1-xx-xx-NB",
    configurablePositions: [1, 2],
    allConfig: true,
    description: "Cost-Effective measurement of corrosive liquids & gases",
    highlights: [
      "Temp: -20 Deg to 90 Deg Celcius | Pressure: 0 to 5 Bar",
      "End Connection: PP",
      "Float: Teflon",
      "Accuracy: +/-2% of FSD",
    ],
    datasheetFile: "/datasheets/glass/FlowGT_RP180.pdf",
  },
  {
    id: "rs180",
    modelName: "FlowGT RS180",
    modelCode: "",
    configurablePositions: [],
    allConfig: false,
    description: "Cost-Effective measurement of corrosive liquids & gases",
    highlights: [
      "Temp: -20 Deg to 90 Deg Celcius | Pressure: 0 to 5 Bar",
      "End Connection: SS 316",
      "Float: SS 316",
      "Body: MS+Powder Coated",
    ],
    datasheetFile: "/datasheets/glass/FlowGT_RS180.pdf",
  },
  {
    id: "rs180t",
    modelName: "FlowGT RS180T",
    modelCode: "",
    configurablePositions: [],
    allConfig: false,
    description: "Cost-Effective measurement of corrosive liquids & gases",
    highlights: [
      "Temp: -20 Deg to 90 Deg Celcius | Pressure: 0 to 5 Bar",
      "End Connection: SS 316",
      "Float: Teflon",
      "Body: MS+Powder Coated",
    ],
    datasheetFile: "/datasheets/glass/FlowGT_RS180T.pdf",
  }
];
