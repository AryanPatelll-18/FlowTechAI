// ============================================================
// Displacer Level Switch Model Selector Data — 10 FlowDLS Models
// ============================================================

export interface DisplacerModelConfig {
  id: string;
  modelName: string;
  modelCode: string;
  configurablePositions: number[];
  allConfig: boolean;
  description: string;
  highlights: string[];
  datasheetFile?: string;
}

export const DISPLACER_MODELS: DisplacerModelConfig[] = [
  {
    id: "l180",
    modelName: "FlowDLS L180",
    modelCode: "FMIPL-DLS-L180-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3],
    allConfig: true,
    description: "2",
    highlights: [
      "Temp: ",
      "Float: 52MM Dia x 100MM",
      "Switch: Micro switch 230VAC 5A",
      "Protection: Flameproof",
    ],
    datasheetFile: "/datasheets/displacer/FlowDLS_L180.pdf",
  },
  {
    id: "l180f",
    modelName: "FlowDLS L180F",
    modelCode: "FMIPL-DLS-L180F-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    allConfig: true,
    description: "2",
    highlights: [
      "Temp: ",
      "Float: 52MM Dia x 100MM",
      "Switch: Micro switch 230VAC 5A",
      "Protection: Flameproof",
    ],
    datasheetFile: "/datasheets/displacer/FlowDLS_L180F.pdf",
  },
  {
    id: "l270",
    modelName: "FlowDLS L270",
    modelCode: "FMIPL-DLS-L270-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3],
    allConfig: true,
    description: "2",
    highlights: [
      "Temp: ",
      "Float: 52MM Dia x 100MM",
      "Switch: Micro switch 230VAC 5A",
      "Protection: Flameproof",
    ],
    datasheetFile: "/datasheets/displacer/FlowDLS_L270.pdf",
  },
  {
    id: "l270f",
    modelName: "FlowDLS L270F",
    modelCode: "FMIPL-DLS-L270F-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    allConfig: true,
    description: "2",
    highlights: [
      "Temp: ",
      "Float: 52MM Dia x 100MM",
      "Switch: Micro switch 230VAC 5A",
      "Protection: Flameproof",
    ],
    datasheetFile: "/datasheets/displacer/FlowDLS_L270F.pdf",
  },
  {
    id: "l270ft",
    modelName: "FlowDLS L270FT",
    modelCode: "FMIPL-DLS-L270FT-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    allConfig: true,
    description: "2",
    highlights: [
      "Temp: ",
      "Float: 52MM Dia x 100MM",
      "Switch: Micro switch 230VAC 5A",
      "Protection: Flameproof",
    ],
    datasheetFile: "/datasheets/displacer/FlowDLS_L270FT.pdf",
  },
  {
    id: "l270t",
    modelName: "FlowDLS L270T",
    modelCode: "FMIPL-DLS-L270T-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3],
    allConfig: true,
    description: "2",
    highlights: [
      "Temp: ",
      "Float: 52MM Dia x 100MM",
      "Switch: Micro switch 230VAC 5A",
      "Protection: Flameproof",
    ],
    datasheetFile: "/datasheets/displacer/FlowDLS_L270T.pdf",
  },
  {
    id: "l360",
    modelName: "FlowDLS L360",
    modelCode: "FMIPL-DLS-L360-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3],
    allConfig: true,
    description: "2",
    highlights: [
      "Temp: ",
      "Float: 52MM Dia x 100MM",
      "Switch: Micro switch 230VAC 5A",
      "Protection: Flameproof",
    ],
    datasheetFile: "/datasheets/displacer/FlowDLS_L360.pdf",
  },
  {
    id: "l360f",
    modelName: "FlowDLS L360F",
    modelCode: "FMIPL-DLS-L360F-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    allConfig: true,
    description: "2",
    highlights: [
      "Temp: ",
      "Float: 52MM Dia x 100MM",
      "Switch: Micro switch 230VAC 5A",
      "Protection: Flameproof",
    ],
    datasheetFile: "/datasheets/displacer/FlowDLS_L360F.pdf",
  },
  {
    id: "l360ft",
    modelName: "FlowDLS L360FT",
    modelCode: "FMIPL-DLS-L360FT-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    allConfig: true,
    description: "2",
    highlights: [
      "Temp: ",
      "Float: 52MM Dia x 100MM",
      "Switch: Micro switch 230VAC 5A",
      "Protection: Flameproof",
    ],
    datasheetFile: "/datasheets/displacer/FlowDLS_L360FT.pdf",
  },
  {
    id: "l360t",
    modelName: "FlowDLS L360T",
    modelCode: "FMIPL-DLS-L360T-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3],
    allConfig: true,
    description: "2",
    highlights: [
      "Temp: ",
      "Float: 52MM Dia x 100MM",
      "Switch: Micro switch 230VAC 5A",
      "Protection: Flameproof",
    ],
    datasheetFile: "/datasheets/displacer/FlowDLS_L360T.pdf",
  }
];
