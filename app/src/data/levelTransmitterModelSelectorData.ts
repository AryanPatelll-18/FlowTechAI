// ============================================================
// Level Transmitter Model Selector Data — 5 FlowSon Models
// ============================================================

export interface LevelTransmitterModelConfig {
  id: string;
  modelName: string;
  modelCode: string;
  configurablePositions: number[];
  allConfig: boolean;
  description: string;
  highlights: string[];
  datasheetFile?: string;
}

export const LEVEL_TRANSMITTER_MODELS: LevelTransmitterModelConfig[] = [
  {
    id: "l360",
    modelName: "FlowSon L360",
    modelCode: "FMIPL-RLT-L360-xx-xx-xx-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    allConfig: true,
    description: "For simple water applications, with 4-20mA & without Diplsay",
    highlights: [
      "Temp: -10 Deg Celcius to 90 Deg Celcius | Pressure: 0.5 Bar to 4 Bar",
      "Sensor: ABS - Default",
      "Output: 4-20 mA + Bluetooth - Default",
      "Accuracy: +/- 0.25% FSD",
    ],
    datasheetFile: "/datasheets/transmitter/FlowSon_L360.pdf",
  },
  {
    id: "l600",
    modelName: "FlowSon L600",
    modelCode: "FMIPL-RLT-L600-xx-xx-xx-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    allConfig: true,
    description: "Standard Level Measurement with Remote Display Indication",
    highlights: [
      "Temp: -10 Deg Celcius to 90 Deg Celcius | Pressure: 0.5 Bar to 4 Bar",
      "Sensor: ABS - Default",
      "Output: 4-20 mA + Bluetooth - Default",
      "Accuracy: +/- 0.25% FSD",
    ],
    datasheetFile: "/datasheets/transmitter/FlowSon_L600.pdf",
  },
  {
    id: "l600ex",
    modelName: "FlowSon L600Ex",
    modelCode: "FMIPL-RLT-L600EX-xx-xx-xx-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    allConfig: true,
    description: "For simple and efficient level measurement in liquids and solids with Remote Display for Hazardous area",
    highlights: [
      "Temp: -10 Deg Celcius to 90 Deg Celcius | Pressure: 0.5 Bar to 4 Bar",
      "Sensor: ABS - Default",
      "Output: 4-20 mA + Bluetooth - Default",
      "Accuracy: +/- 0.25% FSD",
    ],
    datasheetFile: "/datasheets/transmitter/FlowSon_L600Ex.pdf",
  },
  {
    id: "l900",
    modelName: "FlowSon L900",
    modelCode: "FMIPL-RLT-L900-xx-xx-xx-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    allConfig: true,
    description: "Compact simple and efficient level measurement in liquids and solids with In-built Display",
    highlights: [
      "Temp: -10 Deg Celcius to 90 Deg Celcius | Pressure: 0.5 Bar to 4 Bar",
      "Sensor: ABS - Default",
      "Output: 4-20 mA + Bluetooth - Default",
      "Accuracy: +/- 0.25% FSD",
    ],
    datasheetFile: "/datasheets/transmitter/FlowSon_L900.pdf",
  },
  {
    id: "l930",
    modelName: "FlowSon L930",
    modelCode: "FMIPL-RLT-L930-xx-xx-xx-xx-xx-xx-NB",
    configurablePositions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    allConfig: true,
    description: "Compact and efficient level measurement of liquids and solids with In-built Display in Hazardous Area",
    highlights: [
      "Temp: -10 Deg Celcius to 90 Deg Celcius | Pressure: 0.5 Bar to 4 Bar",
      "Sensor: ABS",
      "Output: 4-20 mA + HART - Default",
      "Accuracy: +/- 0.25% FSD",
    ],
    datasheetFile: "/datasheets/transmitter/FlowSon_L930.pdf",
  }
];
