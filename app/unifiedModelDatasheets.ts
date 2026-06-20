// ============================================================
// Unified Model Datasheets — ALL Flowtech Product Models
// Single source of truth for the "Model Datasheets" library view
// ============================================================

import { EMF_MODELS } from "./emfModelSelectorData";
import { TURBINE_MODELS } from "./turbineModelSelectorData";
import { VORTEX_MODELS } from "./vortexModelSelectorData";
import { OVALGEAR_MODELS } from "./ovalGearModelSelectorData";
import { TLI_MODELS } from "./tliModelSelectorData";
import { MAGNETIC_LEVEL_MODELS } from "./magneticLevelModelSelectorData";
import { RLG_MODELS } from "./rlgModelSelectorData";
import { GLASS_TUBE_MODELS } from "./glassTubeModelSelectorData";
import { METAL_TUBE_MODELS } from "./metalTubeModelSelectorData";
import { DISPLACER_MODELS } from "./displacerLevelSwitchModelSelectorData";
import { LEVEL_TRANSMITTER_MODELS } from "./levelTransmitterModelSelectorData";

export interface UnifiedModel {
  id: string;
  modelName: string;
  modelCode: string;
  description: string;
  highlights: string[];
  datasheetFile: string;
  productFamily: string;
  productGroup: string;
  allConfig: boolean;
  configurablePositions: number[];
}

export interface ModelFamilyGroup {
  family: string;
  group: string;
  models: UnifiedModel[];
}

const toUnified = (models: any[], family: string, group: string): UnifiedModel[] =>
  models.map((m) => ({
    id: `${family.toLowerCase().replace(/\s+/g, '-')}-${m.id}`,
    modelName: m.modelName,
    modelCode: m.modelCode,
    description: m.description,
    highlights: m.highlights,
    datasheetFile: m.datasheetFile || "",
    productFamily: family,
    productGroup: group,
    allConfig: m.allConfig,
    configurablePositions: m.configurablePositions,
  }));

const emfModels = toUnified(EMF_MODELS, "Electromagnetic Flowmeter", "flow");
const turbineModels = toUnified(TURBINE_MODELS, "Turbine Flowmeter", "flow");
const vortexModels = toUnified(VORTEX_MODELS, "Vortex Flowmeter", "flow");
const ovalGearModels = toUnified(OVALGEAR_MODELS, "Oval Gear Flowmeter", "flow");
const glassTubeModels = toUnified(GLASS_TUBE_MODELS, "Glass Tube Rotameter", "flow");
const metalTubeModels = toUnified(METAL_TUBE_MODELS, "Metal Tube Rotameter", "flow");
const displacerModels = toUnified(DISPLACER_MODELS, "Displacer Level Switch", "level");
const levelTransmitterModels = toUnified(LEVEL_TRANSMITTER_MODELS, "Radar Level Transmitter", "level");
const tliModels = toUnified(TLI_MODELS, "Tubular Level Indicator", "level");
const magneticModels = toUnified(MAGNETIC_LEVEL_MODELS, "Side Mounted Magnetic Level Gauge", "level");
const rlgModels = toUnified(RLG_MODELS, "Reflex Level Gauge", "level");

export const ALL_MODEL_DATASHEETS: UnifiedModel[] = [
  ...emfModels,
  ...turbineModels,
  ...vortexModels,
  ...ovalGearModels,
  ...glassTubeModels,
  ...metalTubeModels,
  ...displacerModels,
  ...levelTransmitterModels,
  ...tliModels,
  ...magneticModels,
  ...rlgModels,
];

export const MODEL_FAMILY_GROUPS: ModelFamilyGroup[] = [
  { family: "Electromagnetic Flowmeter", group: "flow", models: emfModels },
  { family: "Turbine Flowmeter", group: "flow", models: turbineModels },
  { family: "Vortex Flowmeter", group: "flow", models: vortexModels },
  { family: "Oval Gear Flowmeter", group: "flow", models: ovalGearModels },
  { family: "Glass Tube Rotameter", group: "flow", models: glassTubeModels },
  { family: "Metal Tube Rotameter", group: "flow", models: metalTubeModels },
  { family: "Displacer Level Switch", group: "level", models: displacerModels },
  { family: "Radar Level Transmitter", group: "level", models: levelTransmitterModels },
  { family: "Tubular Level Indicator", group: "level", models: tliModels },
  { family: "Side Mounted Magnetic Level Gauge", group: "level", models: magneticModels },
  { family: "Reflex Level Gauge", group: "level", models: rlgModels },
];

export const TOTAL_MODEL_COUNT = ALL_MODEL_DATASHEETS.length;
