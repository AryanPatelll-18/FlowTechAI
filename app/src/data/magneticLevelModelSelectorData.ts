// ============================================================
// Side Mounted Magnetic Level Gauge — 9 FlowSM Models
// ============================================================

export interface MagneticLevelModelConfig {
  id: string;
  modelName: string;
  modelCode: string;
  configurablePositions: number[];
  allConfig: boolean;
  description: string;
  highlights: string[];
  datasheetFile?: string;
}

export const MAGNETIC_LEVEL_MODELS: MagneticLevelModelConfig[] = [
  { id: "l180", modelName: "FlowSM L180", modelCode: "FMIPL-SM-CM1-FT1-FM1-CC-MT1-NB", configurablePositions: [4], allConfig: false, description: "Side mounted magnetic level indicator. Carbon steel chamber, SS 316 float, flange-end connection. For general liquid level measurement.", highlights: ["Chamber: Carbon Steel | Float: SS 316", "Connection: Flange ASA 150", "Display: Aluminium Flag Scale", "Suitable: Water, Oil, Diesel"], datasheetFile: "/datasheets/magnetic/FlowSM_L180__Side_Mounted_Magnetic_Level_Indicator.pdf" },
  { id: "l270", modelName: "FlowSM L270", modelCode: "FMIPL-SM-CM2-FT2-FM2-CC-MT1-NB", configurablePositions: [], allConfig: false, description: "Side mounted magnetic level indicator. SS 316 chamber, SS 316L float, flange-end connection. For corrosive liquids.", highlights: ["Chamber & Float: SS 316/SS 316L", "Connection: Flange ASA 150", "Display: Aluminium Flag Scale", "Suitable: Corrosive liquids, Chemicals"], datasheetFile: "/datasheets/magnetic/FlowSM_L270__Side_Mounted_Magnetic_Level_Indicator.pdf" },
  { id: "l270d", modelName: "FlowSM L270D", modelCode: "FMIPL-SM-CM2-FT2-FM2-CC-MT1-DT1-NB", configurablePositions: [5,6,7,8], allConfig: false, description: "Side mounted magnetic level gauge with transmitter. SS 316 chamber, SS 316L float, configurable display type and transmitter.", highlights: ["Chamber & Float: SS 316/SS 316L", "Variable: Display type & transmitter", "Display: Aluminium Flag / SS Flag Scale", "With transmitter output"], datasheetFile: "/datasheets/magnetic/FlowSM_L270D__Side_Mounted_Magnetic_Level_Gauges.pdf" },
  { id: "l270f", modelName: "FlowSM L270F", modelCode: "FMIPL-SM-FT2-FM2-CC-MT1-NB", configurablePositions: [3,4,5,6], allConfig: false, description: "Side mounted magnetic level indicator with SS 316 chamber. Variable chamber MOC, connection type, standard, and display type.", highlights: ["Float: SS 316L | Variable: Chamber, connection, display", "Connection: Flange/Wafer/Threaded", "Display: Aluminium Flag / SS Flag Scale", "Suitable: Corrosive liquids"], datasheetFile: "/datasheets/magnetic/FlowSM_L270F__Side_Mounted_Magnetic_Level_Indicator.pdf" },
  { id: "l270fd", modelName: "FlowSM L270FD", modelCode: "FMIPL-SM-FT2-FM2-CC-MT1-DT1-NB", configurablePositions: [3,4,5,6,7,8], allConfig: false, description: "Side mounted magnetic level gauge with transmitter. SS 316L float, variable chamber, connection, display, and transmitter.", highlights: ["Float: SS 316L | With Transmitter", "Variable: Chamber, connection, display, transmitter", "Display: Aluminium Flag / SS Flag Scale", "Suitable: Corrosive liquids"], datasheetFile: "/datasheets/magnetic/FlowSM_L270FD__Side_Mounted_Magnetic_Level_Gauges.pdf" },
  { id: "l360", modelName: "FlowSM L360", modelCode: "FMIPL-SM-CM2-FT3-FM3-CC-MT1-NB", configurablePositions: [], allConfig: false, description: "Side mounted magnetic level indicator for F&B. SS 316 chamber, SS 316L float, TC end connection, ASME standard.", highlights: ["Chamber: SS 316 | Float: SS 316L", "Connection: TC End | Std: ASME", "Display: Aluminium Flag Scale", "For Food & Beverage Industry"], datasheetFile: "/datasheets/magnetic/FlowSM_L360__Side_Mounted_Magnetic_Level_Indicator.pdf" },
  { id: "l360d", modelName: "FlowSM L360D", modelCode: "FMIPL-SM-CM2-FT3-FM3-CC-MT1-DT1-NB", configurablePositions: [5,6,7,8], allConfig: false, description: "Side mounted magnetic level gauge for F&B with transmitter. TC connection, SS 316 chamber, configurable display and transmitter.", highlights: ["Chamber: SS 316 | Float: SS 316L", "Connection: TC End | Std: ASME", "Variable: Display type & transmitter", "For Food & Beverage Industry"], datasheetFile: "/datasheets/magnetic/FlowSM_L360D__Side_Mounted_Magnetic_Level_Gauges.pdf" },
  { id: "l360f", modelName: "FlowSM L360F", modelCode: "FMIPL-SM-FT3-FM3-CC-MT1-NB", configurablePositions: [3,4,5,6], allConfig: false, description: "Side mounted magnetic level indicator for F&B with variable connections. TC/Flange options, SS 316L float, configurable display.", highlights: ["Float: SS 316L | Variable: Chamber, connection, display", "Connection: TC/Flange/Threaded", "Display: Aluminium Flag / SS Flag Scale", "For Food & Beverage Industry"], datasheetFile: "/datasheets/magnetic/FlowSM_L360F__Side_Mounted_Magnetic_Level_Indicator.pdf" },
  { id: "l360fd", modelName: "FlowSM L360FD", modelCode: "FMIPL-SM-FT3-FM3-CC-MT1-DT1-NB", configurablePositions: [3,4,5,6,7,8], allConfig: false, description: "Side mounted magnetic level gauge for F&B with transmitter. SS 316L float, variable chamber, connection, display, and transmitter.", highlights: ["Float: SS 316L | With Transmitter", "Variable: Chamber, connection, display, transmitter", "Connection: TC/Flange/Threaded", "For Food & Beverage Industry"], datasheetFile: "/datasheets/magnetic/FlowSM_L360FD__Side_Mounted_Magnetic_Level_Gauges.pdf" },
];

export const MAGNETIC_LEVEL_MODEL_MAP: Record<string, MagneticLevelModelConfig> = Object.fromEntries(
  MAGNETIC_LEVEL_MODELS.map((m) => [m.id, m])
);
