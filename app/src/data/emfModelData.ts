/**
 * Flowtech FlowMag Electromagnetic Flowmeter — Model Datasheet Data
 * Extracted from FLOWMETER DATA SHEET.xlsx
 * 11 models across the FlowMag S630/S660/S90/S900/S930 families
 */

export interface EmfModel {
  id: string;
  modelName: string;
  modelNo: string;
  shortDesc: string;
  application: string[];
  tempRange: string;
  tempMinC: number;
  tempMaxC: number;
  pressureRange: string;
  pressureMaxKgCm2: number;
  viscosity: string;
  conductivity: string;
  accuracy: string;
  flowtubeMoc: string[];
  processConnectionType: string[];
  processConnectionMoc: string[];
  processConnectionStd: string[];
  coilHousingMoc: string[];
  electrodeMaterial: string[];
  earthingType: string[];
  earthingRingMoc?: string[];
  liningMaterial: string[];
  electronicsEnclosure: string[];
  wiringType: string[];
  output: string[];
  communication: string[];
  transmitterMounting: string[];
  powerSupply: string[];
  cableGlandMoc: string[];
  cableEntryStd: string[];
  cableGlandProtection: string[];
  accessories: string[];
  specialFeatures: string[];
  limitations: string[];
  certifications: string[];
  isFlameproof: boolean;
  isBatteryOperated: boolean;
  isHygienic: boolean;
  isHighPressure: boolean;
  corrosionResistance: string;
  branding: string;
  packing: string;
}

export const EMF_PRODUCT_FAMILY = {
  name: "FlowMag Electromagnetic Flowmeter",
  shortName: "EMF",
  description:
    "Flowtech FlowMag series electromagnetic flowmeters measure conductive liquids using Faraday's law of electromagnetic induction. With no moving parts, they offer maintenance-free operation, high accuracy, and excellent reliability for water, wastewater, chemicals, and process liquids.",
  workingPrinciple:
    "Faraday's Law of Electromagnetic Induction — A magnetic field applied to the conductive fluid induces a voltage proportional to the average flow velocity.",
  typicalApplications: [
    "Water supply & distribution",
    "Wastewater treatment",
    "Chemical processing",
    "Food & beverage (hygienic)",
    "Pharmaceutical",
    "Oil & gas (corrosive liquids)",
    "Power plant cooling water",
    "Irrigation",
    "Industrial process control",
  ],
  keyParameters: [
    "Conductivity ≥ 5 µS/cm",
    "Viscosity up to 3 cP",
    "Accuracy ±0.5% of FSD",
    "4-wire system",
    "RS 485 communication",
  ],
};

export const EMF_MODELS: EmfModel[] = [
  // ─── S630 SERIES ──────────────────────────────────────────────────────────
  {
    id: "s630",
    modelName: "FlowMag S630",
    modelNo: "FMIPL-EMFM-TS1-F-C-F1-CH1-EL2-IF-PL-WP-W2-CR-CG1-CP1-xx-xx-xx-xx-NB",
    shortDesc: "Standard electromagnetic flowmeter for water and process applications",
    application: ["Water flow measurement", "Process liquid measurement", "General industrial"],
    tempRange: "-10°C to +100°C",
    tempMinC: -10,
    tempMaxC: 100,
    pressureRange: "0 to 15 Kg/Cm²",
    pressureMaxKgCm2: 15,
    viscosity: "Upto 3 cP",
    conductivity: "Min. 5 µS/Cm",
    accuracy: "±0.5% of FSD",
    flowtubeMoc: ["SS 304 (TS1)"],
    processConnectionType: ["Flanged ANSI"],
    processConnectionMoc: ["Carbon Steel"],
    processConnectionStd: ["ASA 150#"],
    coilHousingMoc: ["CS (CH1)"],
    electrodeMaterial: ["SS 316L (EL2)"],
    earthingType: ["In-Built Earthing Electrode (IF)"],
    liningMaterial: ["PTFE (PL)"],
    electronicsEnclosure: ["Weather Proof Aluminium Die Cast (WP)"],
    wiringType: ["4-Wire (W2)"],
    output: ["4-20 mA + Pulse (M)", "4-20 mA + Pulse + HART (H)"],
    communication: ["RS 485 (CR)"],
    transmitterMounting: ["Integral (I)", "Remote (RE)"],
    powerSupply: ["230 V AC", "24 V DC", "110 V AC"],
    cableGlandMoc: ["SS 304 (CG1)"],
    cableEntryStd: ["PG 11 (CE2)"],
    cableGlandProtection: ["Weather-Proof (CP1)"],
    accessories: ["FRP Panel", "Matching Flanges", "Gasket & Nut Bolts"],
    specialFeatures: ["Standard model for general water/process"],
    limitations: ["Max pressure 15 Kg/Cm²", "SS 304 flowtube only"],
    certifications: ["Weather-Proof"],
    isFlameproof: false,
    isBatteryOperated: false,
    isHygienic: false,
    isHighPressure: false,
    corrosionResistance: "Standard (PTFE lined)",
    branding: "Flowtech",
    packing: "Wooden / Other",
  },
  {
    id: "s630b",
    modelName: "FlowMag S630B",
    modelNo: "FMIPL-EMFM-TS1-F-C-F1-CH1-EL2-ER-PL-WP-W2-M-CR-BT-xx-xx-CG1-CE2-CP1-NB",
    shortDesc: "Battery-operated electromagnetic flowmeter for remote locations",
    application: ["Water flow measurement", "Remote water monitoring", "No-power locations"],
    tempRange: "-10°C to +100°C",
    tempMinC: -10,
    tempMaxC: 100,
    pressureRange: "0 to 15 Kg/Cm²",
    pressureMaxKgCm2: 15,
    viscosity: "Upto 3 cP",
    conductivity: "Min. 5 µS/Cm",
    accuracy: "±0.5% of FSD",
    flowtubeMoc: ["SS 304 (TS1)"],
    processConnectionType: ["Flanged ANSI"],
    processConnectionMoc: ["Carbon Steel"],
    processConnectionStd: ["ASA 150#"],
    coilHousingMoc: ["CS (CH1)"],
    electrodeMaterial: ["SS 316L (EL2)"],
    earthingType: ["Earthing Ring (ER)"],
    liningMaterial: ["PTFE (PL)"],
    electronicsEnclosure: ["Weather Proof Aluminium Die Cast (WP)"],
    wiringType: ["4-Wire (W2)"],
    output: ["4-20 mA + Pulse (M)"],
    communication: ["RS 485 (CR)"],
    transmitterMounting: ["Integral (I)", "Remote (RE)"],
    powerSupply: ["3.6V Lithium Battery (BT) — Life: 3 to 5 Years"],
    cableGlandMoc: ["SS 304 (CG1)"],
    cableEntryStd: ["PG 11 (CE2)"],
    cableGlandProtection: ["Weather-Proof (CP1)"],
    accessories: ["FRP Panel", "Matching Flanges", "Gasket & Nut Bolts"],
    specialFeatures: ["Battery operated — no external power needed", "3-5 year battery life"],
    limitations: ["Max pressure 15 Kg/Cm²", "Only 4-20mA + Pulse output", "Battery needs replacement"],
    certifications: ["Weather-Proof"],
    isFlameproof: false,
    isBatteryOperated: true,
    isHygienic: false,
    isHighPressure: false,
    corrosionResistance: "Standard (PTFE lined)",
    branding: "Flowtech",
    packing: "Wooden / Other",
  },
  {
    id: "s630f",
    modelName: "FlowMag S630F",
    modelNo: "FMIPL-EMFM-TS1-C-EL2-IF-PL-WP-W2-CR-CG1-CE2-CP1-xx-xx-xx-xx-xx-xx-NB",
    shortDesc: "High-pressure electromagnetic flowmeter (up to 200 Kg/Cm²)",
    application: ["High-pressure water", "Process liquids", "Hydraulic systems"],
    tempRange: "-10°C to +100°C",
    tempMinC: -10,
    tempMaxC: 100,
    pressureRange: "0 to 200 Kg/Cm²",
    pressureMaxKgCm2: 200,
    viscosity: "Upto 3 cP",
    conductivity: "Min. 5 µS/Cm",
    accuracy: "±0.5% of FSD",
    flowtubeMoc: ["SS 304 (TS1)"],
    processConnectionType: ["Flange-End (F)", "Threaded (T)", "Custom (Cu)"],
    processConnectionMoc: ["Carbon Steel (C)"],
    processConnectionStd: ["ASA 300 (F2)", "NPT (TN1)", "BSP (TN2)", "Custom (Cu)"],
    coilHousingMoc: ["CS (CH1)"],
    electrodeMaterial: ["SS 316L (EL2)"],
    earthingType: ["In-Built Earthing Electrode (IF)"],
    liningMaterial: ["PTFE (PL)"],
    electronicsEnclosure: ["Weather Proof Aluminium Die Cast (WP)"],
    wiringType: ["4-Wire (W2)"],
    output: ["4-20 mA + Pulse (M)", "4-20 mA + Pulse + HART (H)"],
    communication: ["RS 485 (CR)"],
    transmitterMounting: ["Integral (I)", "Remote (RE)"],
    powerSupply: ["230 V AC", "24 V DC", "110 V AC"],
    cableGlandMoc: ["SS 304 (CG1)"],
    cableEntryStd: ["PG 11 (CE2)"],
    cableGlandProtection: ["Weather-Proof (CP1)"],
    accessories: ["FRP Panel", "Matching Flanges", "Gasket & Nut Bolts"],
    specialFeatures: ["High pressure rated up to 200 Kg/Cm²", "Threaded connection option"],
    limitations: ["Custom connections must be specified"],
    certifications: ["Weather-Proof"],
    isFlameproof: false,
    isBatteryOperated: false,
    isHygienic: false,
    isHighPressure: true,
    corrosionResistance: "Standard (PTFE lined)",
    branding: "Flowtech",
    packing: "Wooden / Other",
  },
  // ─── S660 SERIES (Water Supply) ───────────────────────────────────────────
  {
    id: "s660",
    modelName: "FlowMag 900-S660",
    modelNo: "FMIPL-EMFM-TS1-F-C-F2-CH1-EL2-IF-RL-WP-W2-CR-xx-xx-xx-xx-xx-NB",
    shortDesc: "Rubber-lined electromagnetic flowmeter for water supply projects",
    application: ["Water supply projects", "Municipal water", "Distribution networks"],
    tempRange: "-10°C to +60°C",
    tempMinC: -10,
    tempMaxC: 60,
    pressureRange: "0 to 15 Kg/Cm²",
    pressureMaxKgCm2: 15,
    viscosity: "Upto 3 cP",
    conductivity: "Min. 5 µS/Cm",
    accuracy: "±0.5% of FSD",
    flowtubeMoc: ["SS 304 (TS1)"],
    processConnectionType: ["Flanged ANSI"],
    processConnectionMoc: ["Carbon Steel"],
    processConnectionStd: ["IS 1538 (F2)"],
    coilHousingMoc: ["CS (CH1)"],
    electrodeMaterial: ["SS 316L (EL2)"],
    earthingType: ["In-Built Earthing Electrode (IF)"],
    liningMaterial: ["Rubber (RL)"],
    electronicsEnclosure: ["Weather Proof Aluminium Die Cast (WP)"],
    wiringType: ["4-Wire (W2)"],
    output: ["4-20 mA + Pulse (M)", "4-20 mA + Pulse + HART (H)"],
    communication: ["RS 485 (CR)"],
    transmitterMounting: ["Integral (I)", "Remote (RE)"],
    powerSupply: ["230 V AC", "24 V DC", "110 V AC"],
    cableGlandMoc: ["SS 304 (CG1)", "SS 316 (CG2)", "Custom (Cu)"],
    cableEntryStd: ["PG 11 (CE2)"],
    cableGlandProtection: ["Weather-Proof (CP1)"],
    accessories: ["FRP Panel", "Matching Flanges", "Gasket & Nut Bolts", "Extra Wire (WI)"],
    specialFeatures: ["Rubber lined for water applications", "IS 1538 standard flange"],
    limitations: ["Max temperature 60°C", "Max pressure 15 Kg/Cm²"],
    certifications: ["Weather-Proof"],
    isFlameproof: false,
    isBatteryOperated: false,
    isHygienic: false,
    isHighPressure: false,
    corrosionResistance: "Rubber lined — suitable for water",
    branding: "Flowtech",
    packing: "Wooden / Other",
  },
  {
    id: "s660bp",
    modelName: "FlowMag S660 BP",
    modelNo: "FMIPL-EMFM-TS1-F-C-F2-CH1-EL2-ER1-RL-WP-W2-CR-BT-xx-xx-xx-CG1-CE2-CP1-NB",
    shortDesc: "Battery-operated rubber-lined EMF for remote water supply locations",
    application: ["Remote water supply", "Water supply projects", "No-power locations"],
    tempRange: "-10°C to +60°C",
    tempMinC: -10,
    tempMaxC: 60,
    pressureRange: "0 to 15 Kg/Cm²",
    pressureMaxKgCm2: 15,
    viscosity: "Upto 3 cP",
    conductivity: "Min. 5 µS/Cm",
    accuracy: "±0.5% of FSD",
    flowtubeMoc: ["SS 304 (TS1)"],
    processConnectionType: ["Flanged ANSI"],
    processConnectionMoc: ["Carbon Steel"],
    processConnectionStd: ["IS 1538 (F2)"],
    coilHousingMoc: ["CS (CH1)"],
    electrodeMaterial: ["SS 316L (EL2)"],
    earthingType: ["Earthing Ring (ER)", "In-Built Earthing Electrode (IF)"],
    earthingRingMoc: ["SS 304 (ER1)"],
    liningMaterial: ["Rubber (RL)"],
    electronicsEnclosure: ["Weather Proof Aluminium Die Cast (WP)"],
    wiringType: ["4-Wire (W2)"],
    output: ["4-20 mA + Pulse (M)"],
    communication: ["RS 485 (CR)"],
    transmitterMounting: ["Integral (I)", "Remote (RE)"],
    powerSupply: ["3.6V Lithium Battery (BT) — Life: 3 to 5 Years"],
    cableGlandMoc: ["SS 304 (CG1)"],
    cableEntryStd: ["PG 11 (CE2)"],
    cableGlandProtection: ["Weather-Proof (CP1)"],
    accessories: ["FRP Panel", "Matching Flanges", "Gasket & Nut Bolts", "Extra Wire (WI)"],
    specialFeatures: ["Battery operated for remote locations", "Rubber lined", "Earthing ring + in-built electrode"],
    limitations: ["Max temperature 60°C", "Max pressure 15 Kg/Cm²"],
    certifications: ["Weather-Proof"],
    isFlameproof: false,
    isBatteryOperated: true,
    isHygienic: false,
    isHighPressure: false,
    corrosionResistance: "Rubber lined — suitable for water",
    branding: "Flowtech",
    packing: "Wooden / Other",
  },
  // ─── S90 PVC SERIES ───────────────────────────────────────────────────────
  {
    id: "s90",
    modelName: "FlowMag S90 (PVC)",
    modelNo: "FMIPL-EMFM-Cu-F-Cu-F1-Cu-ER-IF-WP-W2-M-CR-CG1-CP1-xx-xx-xx-NB",
    shortDesc: "PVC body electromagnetic flowmeter for corrosive liquids",
    application: ["Corrosive liquid measurement", "Chemical service", "Acid/alkali flow"],
    tempRange: "-10°C to +60°C",
    tempMinC: -10,
    tempMaxC: 60,
    pressureRange: "0 to 15 Kg/Cm²",
    pressureMaxKgCm2: 15,
    viscosity: "Upto 3 cP",
    conductivity: "Min. 5 µS/Cm",
    accuracy: "±0.5% of FSD",
    flowtubeMoc: ["CPVC (Custom)"],
    processConnectionType: ["Flanged ANSI"],
    processConnectionMoc: ["CPVC (Custom)"],
    processConnectionStd: ["ASA 150#"],
    coilHousingMoc: ["CPVC (Custom)"],
    electrodeMaterial: ["SS 316L (EL2)"],
    earthingType: ["Earthing Ring: SS 316 (ER)", "In-Built Earthing Electrode (IF)"],
    liningMaterial: ["Not Applicable (PVC body)"],
    electronicsEnclosure: ["Weather Proof Aluminium Die Cast (WP)"],
    wiringType: ["4-Wire (W2)"],
    output: ["4-20 mA + Pulse (M)"],
    communication: ["RS 485 (CR)"],
    transmitterMounting: ["Integral (I)", "Remote (RE)"],
    powerSupply: ["230 V AC (Default)"],
    cableGlandMoc: ["SS 304 (CG1)"],
    cableEntryStd: ["PG 11 (CE2)"],
    cableGlandProtection: ["Weather-Proof (CP1)"],
    accessories: ["Gasket & Nut Bolts"],
    specialFeatures: ["Full PVC/CPVC construction for corrosion resistance", "No separate lining needed"],
    limitations: ["Max temperature 60°C", "Max pressure 15 Kg/Cm²", "Only 230 V AC power", "Limited accessories"],
    certifications: ["Weather-Proof"],
    isFlameproof: false,
    isBatteryOperated: false,
    isHygienic: false,
    isHighPressure: false,
    corrosionResistance: "Excellent — full CPVC construction",
    branding: "Flowtech",
    packing: "Wooden / Other",
  },
  // ─── S900 SERIES (Wastewater/Chemical) ────────────────────────────────────
  {
    id: "s900",
    modelName: "FlowMag S900",
    modelNo: "FMIPL-EMFM-TS1-F-C-F1-CH2-ER-ER1-PL-W2-WP-CR-CG1-CE2-CP1-M-xx-xx-xx-xx-NB",
    shortDesc: "Electromagnetic flowmeter for demanding wastewater and process applications",
    application: ["Wastewater treatment", "Chemical processing", "Highly corrosive liquids"],
    tempRange: "-10°C to +100°C",
    tempMinC: -10,
    tempMaxC: 100,
    pressureRange: "0 to 25 Kg/Cm²",
    pressureMaxKgCm2: 25,
    viscosity: "Upto 3 cP",
    conductivity: "Min. 5 µS/Cm",
    accuracy: "±0.5% of FSD",
    flowtubeMoc: ["SS 316 (TS1)"],
    processConnectionType: ["Flanged ANSI"],
    processConnectionMoc: ["Carbon Steel"],
    processConnectionStd: ["ASA 150#"],
    coilHousingMoc: ["SS 304 (CH2)"],
    electrodeMaterial: ["Hastelloy-C (EL3)", "Tantalum (EL4)", "SS 316L"],
    earthingType: ["Earthing Ring (ER)"],
    earthingRingMoc: ["SS 304 (ER1)"],
    liningMaterial: ["PTFE (PL)"],
    electronicsEnclosure: ["Weather Proof Aluminium Die Cast (WP)"],
    wiringType: ["4-Wire (W2)"],
    output: ["4-20 mA + Pulse (M)", "4-20mA + HART + Pulse (H)"],
    communication: ["RS 485 (CR)"],
    transmitterMounting: ["Integral (I)", "Remote (RE)"],
    powerSupply: ["230 V AC", "24 V DC", "110 V AC"],
    cableGlandMoc: ["SS 304 (CG1)"],
    cableEntryStd: ["PG 11 (CE2)"],
    cableGlandProtection: ["Weather-Proof (CP1)"],
    accessories: ["FRP Panel", "Matching Flanges", "Gasket & Nut Bolts"],
    specialFeatures: ["Hastelloy-C and Tantalum electrode options", "SS 316 flowtube", "For highly corrosive liquids"],
    limitations: ["Max pressure 25 Kg/Cm²"],
    certifications: ["Weather-Proof"],
    isFlameproof: false,
    isBatteryOperated: false,
    isHygienic: false,
    isHighPressure: false,
    corrosionResistance: "Excellent — Hastelloy-C / Tantalum electrodes, PTFE lined",
    branding: "Flowtech",
    packing: "Wooden / Other",
  },
  {
    id: "s900ex",
    modelName: "FlowMag S900Ex",
    modelNo: "FMIPL-EMFM-TS1-F-C-F1-CH2-ER-ER1-PL-W2-FLP-CR-CG1-CE2-CP2-M-xx-xx-xx-xx-NB",
    shortDesc: "Flameproof electromagnetic flowmeter for hazardous areas — wastewater/chemicals",
    application: ["Wastewater in hazardous areas", "Chemical processing (hazardous)", "Zone 1/2 applications"],
    tempRange: "-10°C to +100°C",
    tempMinC: -10,
    tempMaxC: 100,
    pressureRange: "0 to 15 Kg/Cm²",
    pressureMaxKgCm2: 15,
    viscosity: "Upto 3 cP",
    conductivity: "Min. 5 µS/Cm",
    accuracy: "±0.5% of FSD",
    flowtubeMoc: ["SS 316 (TS1)"],
    processConnectionType: ["Flanged ANSI"],
    processConnectionMoc: ["Carbon Steel"],
    processConnectionStd: ["ASA 150#"],
    coilHousingMoc: ["SS 304 (CH2)"],
    electrodeMaterial: ["Hastelloy-C (EL3)", "Tantalum (EL4)"],
    earthingType: ["Earthing Ring (ER)"],
    earthingRingMoc: ["SS 304 (ER1)"],
    liningMaterial: ["PTFE (PL)"],
    electronicsEnclosure: ["Flame-Proof: PESO IIA IIB IIC (FLP)"],
    wiringType: ["4-Wire (W2)"],
    output: ["4-20 mA + Pulse (M)", "4-20mA + HART + Pulse (H)"],
    communication: ["RS 485 (CR)"],
    transmitterMounting: ["Integral (I)", "Remote (RE)"],
    powerSupply: ["230 V AC", "24 V DC", "110 V AC"],
    cableGlandMoc: ["SS 304 (CG1)"],
    cableEntryStd: ["PG 11 (CE2)"],
    cableGlandProtection: ["Flameproof (CP2)"],
    accessories: ["FRP Panel", "Matching Flanges", "Gasket & Nut Bolts"],
    specialFeatures: ["PESO certified Flameproof", "Hastelloy-C / Tantalum electrodes", "Suitable for hazardous areas"],
    limitations: ["Max pressure 15 Kg/Cm²"],
    certifications: ["PESO — IIA, IIB, IIC", "Flame-Proof"],
    isFlameproof: true,
    isBatteryOperated: false,
    isHygienic: false,
    isHighPressure: false,
    corrosionResistance: "Excellent — Hastelloy-C / Tantalum electrodes, PTFE lined",
    branding: "Flowtech",
    packing: "Wooden / Other",
  },
  {
    id: "s900exf",
    modelName: "FlowMag S900ExF",
    modelNo: "FMIPL-EMFM-TS1-C-CH2-ER-ER1-PL-W2-FLP-CR-CG1-CE2-CP2-M-xx-xx-xx-xxxx-xx-NB",
    shortDesc: "High-pressure flameproof EMF for highly corrosive liquids",
    application: ["High-pressure corrosive liquids", "Chemical processing (hazardous)", "Wastewater (high pressure)"],
    tempRange: "-10°C to +100°C",
    tempMinC: -10,
    tempMaxC: 100,
    pressureRange: "0 to 200 Kg/Cm²",
    pressureMaxKgCm2: 200,
    viscosity: "Upto 3 cP",
    conductivity: "Min. 5 µS/Cm",
    accuracy: "±0.5% of FSD",
    flowtubeMoc: ["SS 316 (TS1)"],
    processConnectionType: ["Flange-End (F)", "Threaded (T)", "Custom (Cu)"],
    processConnectionMoc: ["Carbon Steel (C)"],
    processConnectionStd: ["ASA 300 (F2)", "ASA 600 (F3)", "NPT (T1)", "Custom (Cu)"],
    coilHousingMoc: ["SS 304 (CH2)"],
    electrodeMaterial: ["Hastelloy-C (EL3)", "Tantalum (EL4)"],
    earthingType: ["Earthing Ring (ER)"],
    earthingRingMoc: ["SS 304 (ER1)"],
    liningMaterial: ["PTFE (PL)"],
    electronicsEnclosure: ["Flame-Proof: PESO IIA IIB IIC (FLP)"],
    wiringType: ["4-Wire (W2)"],
    output: ["4-20 mA + Pulse (M)", "4-20mA + HART + Pulse (H)"],
    communication: ["RS 485 (CR)"],
    transmitterMounting: ["Integral (I)", "Remote (RE)"],
    powerSupply: ["230 V AC", "24 V DC", "110 V AC"],
    cableGlandMoc: ["SS 304 (CG1)"],
    cableEntryStd: ["PG 11 (CE2)"],
    cableGlandProtection: ["Flameproof (CP2)"],
    accessories: ["FRP Panel", "Matching Flanges", "Gasket & Nut Bolts"],
    specialFeatures: ["High pressure + Flameproof", "ASA 300/600 flanges", "Threaded option"],
    limitations: ["Custom connections must be specified"],
    certifications: ["PESO — IIA, IIB, IIC", "Flame-Proof"],
    isFlameproof: true,
    isBatteryOperated: false,
    isHygienic: false,
    isHighPressure: true,
    corrosionResistance: "Excellent — Hastelloy-C / Tantalum electrodes, PTFE lined",
    branding: "Flowtech",
    packing: "Wooden / Other",
  },
  {
    id: "s900f",
    modelName: "FlowMag S900F",
    modelNo: "FMIPL-EMFM-TS1-C-CH2-ER-ER1-PL-W2-WP-CR-CG1-CE2-CP1-M-xx-xx-xx-xx-xx-xx-NB",
    shortDesc: "High-pressure weatherproof EMF for corrosive liquids (up to 200 Kg/Cm²)",
    application: ["High-pressure corrosive liquids", "Chemical processing", "Process control"],
    tempRange: "-10°C to +100°C",
    tempMinC: -10,
    tempMaxC: 100,
    pressureRange: "0 to 200 Kg/Cm²",
    pressureMaxKgCm2: 200,
    viscosity: "Upto 3 cP",
    conductivity: "Min. 5 µS/Cm",
    accuracy: "±0.5% of FSD",
    flowtubeMoc: ["SS 316 (TS1)"],
    processConnectionType: ["Flange-End (F)", "Threaded (T)", "Custom (Cu)"],
    processConnectionMoc: ["Carbon Steel (C)"],
    processConnectionStd: ["ASA 300 (F2)", "ASA 600 (F3)", "NPT (T1)", "Custom (Cu)"],
    coilHousingMoc: ["SS 304 (CH2)"],
    electrodeMaterial: ["Hastelloy-C (EL3)", "Tantalum (EL4)"],
    earthingType: ["Earthing Ring (ER)"],
    earthingRingMoc: ["SS 304 (ER1)"],
    liningMaterial: ["PTFE (PL)"],
    electronicsEnclosure: ["Weather Proof Aluminium Die Cast (WP)"],
    wiringType: ["4-Wire (W2)"],
    output: ["4-20 mA + Pulse (M)", "4-20mA + HART + Pulse (H)"],
    communication: ["RS 485 (CR)"],
    transmitterMounting: ["Integral (I)", "Remote (RE)"],
    powerSupply: ["230 V AC", "24 V DC", "110 V AC"],
    cableGlandMoc: ["SS 304 (CG1)"],
    cableEntryStd: ["PG 11 (CE2)"],
    cableGlandProtection: ["Weather-Proof (CP1)"],
    accessories: ["FRP Panel", "Matching Flanges", "Gasket & Nut Bolts"],
    specialFeatures: ["High pressure up to 200 Kg/Cm²", "Hastelloy-C / Tantalum electrodes", "Weatherproof"],
    limitations: ["Not flameproof — use S900ExF for hazardous areas"],
    certifications: ["Weather-Proof"],
    isFlameproof: false,
    isBatteryOperated: false,
    isHygienic: false,
    isHighPressure: true,
    corrosionResistance: "Excellent — Hastelloy-C / Tantalum electrodes, PTFE lined",
    branding: "Flowtech",
    packing: "Wooden / Other",
  },
  // ─── S930 SERIES (Hygienic) ───────────────────────────────────────────────
  {
    id: "s930",
    modelName: "FlowMag S930",
    modelNo: "FMIPL-EMFM-TS2-S2-CH3-IF-PL-W2-CR-EL2-WP-M-CG1-CE2-CP1-xx-xx-xx-xx-xx-NB",
    shortDesc: "Hygienic electromagnetic flowmeter for food & beverage applications",
    application: ["Food & beverage", "Pharmaceutical", "Dairy", "Brewery", "Hygienic processes"],
    tempRange: "-10°C to +100°C",
    tempMinC: -10,
    tempMaxC: 100,
    pressureRange: "0 to 15 Kg/Cm²",
    pressureMaxKgCm2: 15,
    viscosity: "Upto 3 cP",
    conductivity: "Min. 5 µS/Cm",
    accuracy: "±0.5% of FSD",
    flowtubeMoc: ["SS 316 (TS2)"],
    processConnectionType: ["Flanged ANSI (Default)", "Tri-Clover Connection (TC)"],
    processConnectionMoc: ["SS 316 (S2)"],
    processConnectionStd: ["ASA 150# (Flange only)", "Custom (Cu)"],
    coilHousingMoc: ["SS 316 (CH3)"],
    electrodeMaterial: ["SS 316L (EL2)"],
    earthingType: ["In-built Earthing Electrode (IF)"],
    liningMaterial: ["PTFE (PL)"],
    electronicsEnclosure: ["Weather Proof Aluminium Die Cast (WP)"],
    wiringType: ["4-Wire (W2)"],
    output: ["4-20 mA + Pulse (M)"],
    communication: ["RS 485 (CR)"],
    transmitterMounting: ["Integral (I)", "Remote (RE)"],
    powerSupply: ["230 V AC", "24 V DC", "110 V AC"],
    cableGlandMoc: ["SS 316 (CG1)"],
    cableEntryStd: ["PG 11 (CE2)"],
    cableGlandProtection: ["Weather-Proof (CP1)"],
    accessories: ["FRP Panel", "Matching Flanges", "Gasket & Nut Bolts"],
    specialFeatures: ["Full SS 316 construction", "Tri-Clover connection option", "Hygienic design for F&B"],
    limitations: ["Max pressure 15 Kg/Cm²", "No HART output option"],
    certifications: ["Weather-Proof"],
    isFlameproof: false,
    isBatteryOperated: false,
    isHygienic: true,
    isHighPressure: false,
    corrosionResistance: "Hygienic — full SS 316, PTFE lined",
    branding: "Flowtech",
    packing: "Wooden / Other",
  },
];

// ─── Selection Wizard Questions & Options ───────────────────────────────────

export interface WizardQuestion {
  id: string;
  question: string;
  type: "single" | "multi" | "number";
  options: { value: string; label: string }[];
}

export const WIZARD_QUESTIONS: WizardQuestion[] = [
  {
    id: "application",
    question: "What is your application?",
    type: "single",
    options: [
      { value: "water", label: "Water supply / distribution" },
      { value: "wastewater", label: "Wastewater treatment" },
      { value: "chemical", label: "Chemical / corrosive liquid" },
      { value: "food", label: "Food & beverage (hygienic)" },
      { value: "general", label: "General process liquid" },
      { value: "remote", label: "Remote location (no power)" },
    ],
  },
  {
    id: "pressure",
    question: "What is your operating pressure?",
    type: "single",
    options: [
      { value: "low", label: "Up to 15 Kg/Cm²" },
      { value: "medium", label: "Up to 25 Kg/Cm²" },
      { value: "high", label: "Up to 200 Kg/Cm²" },
    ],
  },
  {
    id: "temperature",
    question: "What is your operating temperature?",
    type: "single",
    options: [
      { value: "normal", label: "Up to 60°C" },
      { value: "high", label: "Up to 100°C" },
    ],
  },
  {
    id: "corrosion",
    question: "How corrosive is the process medium?",
    type: "single",
    options: [
      { value: "none", label: "Water / mildly corrosive" },
      { value: "moderate", label: "Moderately corrosive (chemicals)" },
      { value: "severe", label: "Highly corrosive (acid/alkali)" },
    ],
  },
  {
    id: "hazardous",
    question: "Is the installation in a hazardous area?",
    type: "single",
    options: [
      { value: "no", label: "No — safe area" },
      { value: "yes", label: "Yes — requires Flameproof" },
    ],
  },
  {
    id: "power",
    question: "What power supply is available?",
    type: "single",
    options: [
      { value: "ac", label: "230/110 V AC available" },
      { value: "dc", label: "24 V DC available" },
      { value: "none", label: "No power available (battery needed)" },
    ],
  },
  {
    id: "output",
    question: "What output is required?",
    type: "single",
    options: [
      { value: "basic", label: "4-20 mA + Pulse" },
      { value: "hart", label: "4-20 mA + HART + Pulse" },
    ],
  },
  {
    id: "connection",
    question: "What process connection type?",
    type: "single",
    options: [
      { value: "flange", label: "Flanged" },
      { value: "thread", label: "Threaded" },
      { value: "tri", label: "Tri-Clover (hygienic)" },
    ],
  },
];

// ─── Selection Logic ────────────────────────────────────────────────────────

export interface SelectionResult {
  model: EmfModel;
  status: "recommended" | "suitable" | "alternative" | "not-suitable";
  reasons: string[];
  warnings: string[];
  optionalAddons: string[];
}

export function evaluateModels(answers: Record<string, string>): SelectionResult[] {
  return EMF_MODELS.map((model) => {
    const reasons: string[] = [];
    const warnings: string[] = [];
    const optionalAddons: string[] = [];
    let score = 0;
    let maxScore = 0;

    // Application match
    maxScore++;
    const app = answers.application;
    if (app === "water" && model.application.some((a) => a.includes("Water"))) {
      score++;
      reasons.push("Suitable for water applications");
    } else if (app === "wastewater" && model.id.startsWith("s900")) {
      score++;
      reasons.push("Designed for wastewater/chemical applications");
    } else if (app === "chemical" && (model.id.startsWith("s900") || model.id === "s90")) {
      score++;
      reasons.push("Suitable for corrosive chemicals");
    } else if (app === "food" && model.isHygienic) {
      score++;
      reasons.push("Hygienic design for F&B");
    } else if (app === "remote" && model.isBatteryOperated) {
      score++;
      reasons.push("Battery operated for remote locations");
    } else if (app === "general") {
      score++;
      reasons.push("Suitable for general process applications");
    }

    // Pressure match
    maxScore++;
    const pressure = answers.pressure;
    if (pressure === "low" && model.pressureMaxKgCm2 >= 15) {
      score++;
    } else if (pressure === "medium" && model.pressureMaxKgCm2 >= 25) {
      score++;
    } else if (pressure === "high" && model.isHighPressure) {
      score++;
      reasons.push(`High pressure rated (${model.pressureRange})`);
    } else if (pressure === "high" && !model.isHighPressure) {
      warnings.push(`Pressure exceeds model rating (${model.pressureRange})`);
    }

    // Temperature match
    maxScore++;
    const temp = answers.temperature;
    if (temp === "normal" && model.tempMaxC >= 60) {
      score++;
    } else if (temp === "high" && model.tempMaxC >= 100) {
      score++;
    }

    // Corrosion match
    maxScore++;
    const corrosion = answers.corrosion;
    if (corrosion === "none") {
      score++;
    } else if (corrosion === "moderate" && (model.id.startsWith("s900") || model.id === "s90")) {
      score++;
      reasons.push("Corrosion resistant electrodes (Hastelloy-C / Tantalum)");
    } else if (corrosion === "severe" && (model.id === "s90" || model.id.startsWith("s900"))) {
      score++;
      reasons.push("Excellent corrosion resistance");
    } else if (corrosion === "severe" && !model.id.startsWith("s900") && model.id !== "s90") {
      warnings.push("May not withstand highly corrosive media");
    }

    // Hazardous area
    maxScore++;
    const hazardous = answers.hazardous;
    if (hazardous === "no" && !model.isFlameproof) {
      score++;
    } else if (hazardous === "yes" && model.isFlameproof) {
      score++;
      reasons.push("PESO certified Flameproof enclosure");
    } else if (hazardous === "yes" && !model.isFlameproof) {
      warnings.push("Not suitable for hazardous areas — not flameproof");
    }

    // Power supply
    maxScore++;
    const power = answers.power;
    if (power === "ac" && model.powerSupply.some((p) => p.includes("AC"))) {
      score++;
    } else if (power === "dc" && model.powerSupply.some((p) => p.includes("DC"))) {
      score++;
    } else if (power === "none" && model.isBatteryOperated) {
      score++;
      reasons.push("Battery operated — no external power needed");
    } else if (power === "none" && !model.isBatteryOperated) {
      warnings.push("Requires external power supply");
    }

    // Output
    maxScore++;
    const output = answers.output;
    if (output === "basic" && model.output.some((o) => o.includes("Pulse"))) {
      score++;
    } else if (output === "hart" && model.output.some((o) => o.includes("HART"))) {
      score++;
    } else if (output === "hart" && !model.output.some((o) => o.includes("HART"))) {
      warnings.push("HART output not available on this model");
    }

    // Determine status
    const ratio = score / maxScore;
    let status: SelectionResult["status"];
    if (warnings.length > 0 && ratio < 0.6) {
      status = "not-suitable";
    } else if (ratio >= 0.85 && warnings.length === 0) {
      status = "recommended";
    } else if (ratio >= 0.6) {
      status = "suitable";
    } else {
      status = "alternative";
    }

    return { model, status, reasons, warnings, optionalAddons };
  });
}
