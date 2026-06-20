// ============================================================
// EMF Model Selector Data — 12 FlowMag Models
// Each model has a pre-configured de-codification code.
// Positions marked "xx" are customer-configurable.
// Models with allConfig=true use the full master de-codification.
// ============================================================

export interface EmfModelConfig {
  id: string;
  modelName: string;
  modelCode: string;        // Full code with hyphens, "xx" = configurable
  configurablePositions: number[]; // Which category positions are "xx"
  allConfig: boolean;       // true = all positions are configurable (full master)
  description: string;      // What makes this model unique
  highlights: string[];     // Key specs / differentiators
  datasheetFile?: string;   // Path to professional PDF datasheet
}

export const EMF_MODELS: EmfModelConfig[] = [
  {
    id: "s630",
    modelName: "FlowMag S630",
    modelCode: "FMIPL-EMFM-TS1-F-C-F1-CH1-EL2-IF-PL-WP-W2-CR-CG1-CP1-xx-xx-xx-xx-NB",
    configurablePositions: [14, 15, 16, 17],
    allConfig: false,
    description: "Standard SS 304 electromagnetic flow meter with PTFE lining, SS 316L electrodes, integral transmitter, and weather-proof enclosure. Ideal for general industrial water and mild chemical applications.",
    highlights: [
      "Flowtube: SS 304 | Lining: PTFE",
      "Electrode: SS 316L | Earthing: In-built",
      "Enclosure: Weather Proof | Output: 4-20 mA + Pulse",
      "Communication: RS 485 | Wiring: 4-Wire",
    ],
    datasheetFile: "/datasheets/emf/FlowMag_S630.pdf",
  },
  {
    id: "s630b",
    modelName: "FlowMag S630B",
    modelCode: "FMIPL-EMFM-TS1-F-C-F1-CH1-EL2-ER-PL-WP-W2-M-CR-BT-xx-xx-CG1-CE2-CP1-NB",
    configurablePositions: [14, 15],
    allConfig: false,
    description: "Battery-operated variant of S630 with earthing ring and 4-20 mA + Pulse output. Designed for remote locations without mains power supply.",
    highlights: [
      "Power: 3.6V Lithium Battery (5+ years life)",
      "Earthing: Ring type | Output: 4-20 mA + Pulse",
      "Enclosure: Weather Proof | Communication: RS 485",
      "No external power required",
    ],
    datasheetFile: "/datasheets/emf/FlowMag_S630B.pdf",
  },
  {
    id: "s630f",
    modelName: "FlowMag S630F",
    modelCode: "FMIPL-EMFM-TS1-C-EL2-IF-PL-WP-W2-CR-CG1-CE2-CP1-xx-xx-xx-xx-xx-NB",
    configurablePositions: [14, 15, 16, 17, 18],
    allConfig: false,
    description: "Food-grade EMF with Tri-Clover process connection, PTFE lining, and SS 316L electrodes. Designed for sanitary/hygienic applications in dairy, beverage, and pharmaceutical industries.",
    highlights: [
      "Connection: Tri-Clover (Sanitary)",
      "Flowtube: SS 304 | Lining: PTFE",
      "Electrode: SS 316L | Earthing: In-built",
      "Hygienic design for CIP/SIP applications",
    ],
    datasheetFile: "/datasheets/emf/FlowMag_S630F.pdf",
  },
  {
    id: "900-s660",
    modelName: "FlowMag 900-S660",
    modelCode: "FMIPL-EMFM-TS1-F-C-F2-CH1-EL2-IF-RL-WP-W2-CR-xx-xx-xx-xx-xx-NB",
    configurablePositions: [14, 15, 16, 17],
    allConfig: false,
    description: "Rubber-lined EMF with IS 1583 flange standard for water and wastewater applications. Robust construction with hard rubber/neoprene lining options.",
    highlights: [
      "Lining: Rubber (RL) | Flange: IS 1583",
      "Flowtube: SS 304 | Electrode: SS 316L",
      "Earthing: In-built | Enclosure: Weather Proof",
      "Ideal for raw water, sewage, effluent",
    ],
    datasheetFile: "/datasheets/emf/FlowMag_900-S660.pdf",
  },
  {
    id: "s660-bp",
    modelName: "FlowMag S660 BP",
    modelCode: "FMIPL-EMFM-TS1-F-C-F2-CH1-EL2-ER1-RL-WP-W2-CR-BT-xx-xx-CG1-CE2-CP1-NB",
    configurablePositions: [14, 15],
    allConfig: false,
    description: "Battery-operated rubber-lined EMF with earthing ring (SS 304) and IS 1583 flanges. Purpose-built for water distribution and remote metering applications.",
    highlights: [
      "Power: Battery Operated (3.6V Lithium)",
      "Lining: Rubber | Flange: IS 1583",
      "Earthing Ring: SS 304 | Enclosure: Weather Proof",
      "Long battery life for unmanned installations",
    ],
    datasheetFile: "/datasheets/emf/FlowMag_S660_BP.pdf",
  },
  {
    id: "s90-pvc",
    modelName: "FlowMag S90 PVC",
    modelCode: "FMIPL-EMFM-Cu-F-Cu-F1-Cu-ER-IF-WP-W2-M-CR-CG1-CP1-xx-xx-xx-NB",
    configurablePositions: [14, 15, 16],
    allConfig: false,
    description: "Full custom PVC/CPVC construction EMF for highly corrosive chemical applications. All wetted parts in custom material with in-built earthing electrode.",
    highlights: [
      "Construction: Full Custom PVC/CPVC",
      "Connection: Flanged ASA 150# (Custom MOC)",
      "Earthing: In-built Electrode",
      "Designed for acids, alkalis, corrosive chemicals",
    ],
    datasheetFile: "/datasheets/emf/FlowMag_S90__PVC.pdf",
  },
  // --- Right table models ---
  {
    id: "s900",
    modelName: "FlowMag S900",
    modelCode: "FMIPL-EMFM-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx",
    configurablePositions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    allConfig: true,
    description: "Fully configurable standard electromagnetic flow meter. Use the master de-codification to specify every parameter. Suitable for any general industrial application requiring full specification control.",
    highlights: [
      "Fully configurable — all positions open",
      "Flowtube: SS 304 / SS 316 / Custom",
      "Lining: PTFE / Rubber / PFA / Neoprene",
      "Enclosure: WP / Flameproof / PESO / ATEX",
    ],
    datasheetFile: "/datasheets/emf/FlowMag_S900.pdf",
  },
  {
    id: "s900ex",
    modelName: "FlowMag S900Ex",
    modelCode: "FMIPL-EMFM-TS1-F-C-F1-CH2-ER-ER1-PL-W2-FLP-CR-CG1-CE2-CP2-M-xx-xx-xx-xx-NB",
    configurablePositions: [14, 15, 16, 17],
    allConfig: false,
    description: "Flameproof EMF with PESO certification (IIA, IIB, IIC), SS 304 coil housing, earthing ring with SS 304 MOC, PTFE lining, and 4-Wire HART output. Built for hazardous area installations.",
    highlights: [
      "Certification: Flameproof PESO: IIA IIB IIC",
      "Coil Housing: SS 304 | Earthing: Ring (SS 304)",
      "Enclosure: Flameproof | Output: 4-20 mA + HART + Pulse",
      "Cable Gland: SS 304 | Entry: PG 11 | Protection: Flameproof",
    ],
    datasheetFile: "/datasheets/emf/FlowMag_S900Ex.pdf",
  },
  {
    id: "s900exf",
    modelName: "FlowMag S900ExF",
    modelCode: "FMIPL-EMFM-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx",
    configurablePositions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    allConfig: true,
    description: "Fully configurable flameproof electromagnetic flow meter with PESO certification. All positions are customer-specified for hazardous area applications requiring complete custom engineering.",
    highlights: [
      "Fully configurable flameproof model",
      "Certification: PESO: IIA IIB IIC",
      "All wetted parts, lining, and output custom-specified",
      "For hazardous area critical process control",
    ],
    datasheetFile: "/datasheets/emf/FlowMag_S900ExF.pdf",
  },
  {
    id: "s900f",
    modelName: "FlowMag S900F",
    modelCode: "FMIPL-EMFM-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx-xx",
    configurablePositions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    allConfig: true,
    description: "Fully configurable electromagnetic flow meter for specialised applications. Complete customer control over all specifications for unique process requirements.",
    highlights: [
      "Fully configurable — all positions open",
      "For specialised / non-standard applications",
      "Complete material, lining, and output flexibility",
      "Engineered to order with full technical review",
    ],
    datasheetFile: "/datasheets/emf/FlowMag_S900F.pdf",
  },
  {
    id: "s930",
    modelName: "FlowMag S930",
    modelCode: "FMIPL-EMFM-TS2-S2-CH3-IF-PL-W2-CR-EL2-WP-M-CG1-CE2-CP1-xx-xx-xx-xx-xx-NB",
    configurablePositions: [14, 15, 16, 17, 18],
    allConfig: false,
    description: "SS 316 construction sanitary EMF with Hastelloy 'C' electrodes, PTFE lining, and 4-20 mA + Pulse output. Designed for pharmaceutical, food, and biotechnology applications requiring highest corrosion resistance.",
    highlights: [
      "Flowtube: SS 316 | Coil Housing: SS 316",
      "Electrode: Hastelloy 'C' | Lining: PTFE",
      "Output: 4-20 mA + Pulse | Communication: RS 485",
      "Earthing: In-built | Enclosure: Weather Proof",
    ],
    datasheetFile: "/datasheets/emf/FlowMag_S930.pdf",
  },
  {
    id: "s930ex",
    modelName: "FlowMag S930Ex",
    modelCode: "FMIPL-EMFM-TS2-S2-CH3-IF-PL-W2-CR-EL2-FLP-M-CG1-CE2-CP2-xx-xx-xx-xx-xx-NB",
    configurablePositions: [14, 15, 16, 17, 18],
    allConfig: false,
    description: "Flameproof sanitary EMF with SS 316 construction, Hastelloy 'C' electrodes, PTFE lining, and PESO-certified flameproof enclosure. For hazardous area sanitary applications in pharma and fine chemicals.",
    highlights: [
      "Certification: Flameproof PESO: IIA IIB IIC",
      "Flowtube: SS 316 | Electrode: Hastelloy 'C'",
      "Lining: PTFE | Enclosure: Flameproof",
      "Output: 4-20 mA + Pulse + HART",
    ],
    datasheetFile: "/datasheets/emf/FlowMag_S930Ex.pdf",
  },
];

export const EMF_MODEL_MAP: Record<string, EmfModelConfig> = Object.fromEntries(
  EMF_MODELS.map((m) => [m.id, m])
);

export function getEmfModelById(id: string): EmfModelConfig | undefined {
  return EMF_MODEL_MAP[id];
}
