/**
 * Complete Flowtech Product Model Data — All 6 Families, 62 Models
 * Extracted from FLOWMETER DATA SHEET(3).xlsx (62 sheets)
 */

export interface ProductFamily {
  id: string; name: string; shortName: string; description: string;
  workingPrinciple: string; typicalApplications: string[]; keyParameters: string[];
}

export interface ProductModel {
  id: string; family: string; modelName: string; modelNo: string; shortDesc: string;
  application: string[]; tempRange: string; tempMinC: number; tempMaxC: number;
  pressureRange: string; pressureMaxBar: number; viscosity: string;
  viscosityMinCp: number; viscosityMaxCp: number; accuracy: string;
  conductivity?: string; flowtubeMoc: string; processConnectionType: string;
  processConnectionMoc: string; processConnectionStd: string;
  coilHousingMoc?: string; electrodeMaterial?: string; earthingType?: string;
  liningMaterial?: string; impellerType?: string; ptCompensation?: string;
  ibrType?: string; electronicsEnclosure: string; wiringType: string;
  output: string; communication: string; transmitterMounting: string;
  powerSupply: string; protectionType: string; cableGlandMoc?: string;
  cableEntryStd?: string; cableGlandProtection?: string; accessories: string[];
  specialFeatures: string[]; limitations: string[]; certifications: string[];
  isFlameproof: boolean; isBatteryOperated: boolean; isHygienic: boolean;
  isHighPressure: boolean; isHazardous: boolean; corrosionResistance: string;
  branding: string; packing: string;
  // FlowVal extras
  rotorMoc?: string; shaftMoc?: string; displayDetails?: string; readings?: string; screen?: string;
  // FlowGT extras
  bodyMoc?: string; floatMoc?: string; scaleMoc?: string; scaleLength?: string;
  glandPacking?: string; bottomTop?: string; f2fHeight?: string; protectionCover?: string;
  // FlowMet extras
  tubeMoc?: string; enclosureMoc?: string; guideRodMoc?: string; jacketing?: string;
  lining?: string; installation?: string; outputType?: string;
}

export const PRODUCT_FAMILIES: Record<string, ProductFamily> = {
  flowmag: { id: "flowmag", name: "FlowMag Electromagnetic Flowmeter", shortName: "EMF", description: "Electromagnetic flowmeters for conductive liquids using Faraday's law. No moving parts, high accuracy, maintenance-free operation.", workingPrinciple: "Faraday's Law — magnetic field induces voltage proportional to flow velocity.", typicalApplications: ["Water supply", "Wastewater", "Chemicals", "Food & beverage", "Process liquids"], keyParameters: ["Conductivity >=5 uS/cm", "Viscosity <=3 cP", "Accuracy +/-0.5% FSD", "4-wire system"] },
  flowturb: { id: "flowturb", name: "FlowTurb Turbine Flowmeter", shortName: "TFM", description: "Turbine flowmeters for simple liquids with low or no conductivity. Mechanical impeller design with reliable performance.", workingPrinciple: "Turbine principle — fluid rotates impeller, generating pulses proportional to flow rate.", typicalApplications: ["Clean liquids", "Low conductivity fluids", "Demineralized water", "Oil", "Solvents"], keyParameters: ["Viscosity 0-10 cP", "Accuracy +/-1% MV", "SS 316 construction", "Relay outputs"] },
  flowswirl: { id: "flowswirl", name: "FlowSwirl Vortex Flowmeter", shortName: "VFM", description: "Vortex flowmeters for liquids, gases, and steam. No moving parts, suitable for wide range of applications.", workingPrinciple: "Vortex shedding — bluff body creates alternating vortices, frequency proportional to velocity.", typicalApplications: ["Liquids & gases", "Steam", "Process fluids", "Hygienic TC", "High pressure"], keyParameters: ["Viscosity <=10 cP", "Accuracy +/-1% MV", "HART + Pulse output", "24VDC power"] },
  flowval: { id: "flowval", name: "FlowVal Oval Gear Flowmeter", shortName: "OGFM", description: "Oval gear positive displacement flowmeters for high viscosity liquids. Direct volume measurement with high accuracy.", workingPrinciple: "Positive displacement — interlocking oval gears trap known volume per revolution.", typicalApplications: ["High viscosity liquids", "Oil", "Fuels", "Chemicals", "Food products"], keyParameters: ["Viscosity 10-300 cP", "Accuracy +/-0.5-1% MV", "Integral mounting", "RS 485"] },
  flowgt: { id: "flowgt", name: "FlowGT Glass Tube Rotameter", shortName: "GTR", description: "Glass tube variable area flowmeters with visible flow indication. Simple, reliable, cost-effective for clean fluids.", workingPrinciple: "Variable area — float rises in tapered tube, position proportional to flow rate.", typicalApplications: ["Clean water", "Air", "Gas", "Non-corrosive liquids", "Process indication"], keyParameters: ["Low pressure 0-5 Bar", "Temp -20 to 90 C", "Accuracy +/-2% FSD", "Visual indication"] },
  flowmet: { id: "flowmet", name: "FlowMet Metal Tube Rotameter", shortName: "MTR", description: "Metal tube variable area flowmeters for industrial applications. Rugged metal construction with transmitter options.", workingPrinciple: "Variable area — magnetic float in tapered metal tube, detected by magnetic followers.", typicalApplications: ["Industrial process", "Harsh environments", "Opaque fluids", "High temp/pressure"], keyParameters: ["Pressure up to 400 Bar", "Temp -30 to 350 C", "Accuracy +/-2% FSD", "SS 316 construction"] },
};

// Helper to create model entries compactly
function m(id: string, family: string, modelName: string, modelNo: string, shortDesc: string, application: string[], tempRange: string, tempMinC: number, tempMaxC: number, pressureRange: string, pressureMaxBar: number, viscosity: string, viscosityMinCp: number, viscosityMaxCp: number, accuracy: string, flowtubeMoc: string, processConnectionType: string, processConnectionMoc: string, processConnectionStd: string, electronicsEnclosure: string, wiringType: string, output: string, communication: string, transmitterMounting: string, powerSupply: string, protectionType: string, accessories: string[], specialFeatures: string[], limitations: string[], certifications: string[], isFlameproof: boolean, isBatteryOperated: boolean, isHygienic: boolean, isHighPressure: boolean, isHazardous: boolean, corrosionResistance: string, extra: Partial<ProductModel> = {}): ProductModel {
  return { id, family, modelName, modelNo, shortDesc, application, tempRange, tempMinC, tempMaxC, pressureRange, pressureMaxBar, viscosity, viscosityMinCp, viscosityMaxCp, accuracy, flowtubeMoc, processConnectionType, processConnectionMoc, processConnectionStd, electronicsEnclosure, wiringType, output, communication, transmitterMounting, powerSupply, protectionType, accessories, specialFeatures, limitations, certifications, isFlameproof, isBatteryOperated, isHygienic, isHighPressure, isHazardous, corrosionResistance, branding: "Flowtech", packing: "Wooden", ...extra };
}

// ═════════════════════════════════════════════════════════════════════════════
// ALL 62 MODELS
// ═════════════════════════════════════════════════════════════════════════════
export const ALL_MODELS: ProductModel[] = [
  // ─── FLOWMAG — 12 models ─────────────────────────────────────────────────
  m("s630","flowmag","FlowMag S630","FMIPL-EMFM-TS1-F-C-F1-CH1-EL2-IF-PL-WP-W2-CR-CG1-CP1-NB","Standard EMF for water/process",["Water flow","Process liquid","General industrial"],"-10 to +100 C",-10,100,"0 to 15 Kg/cm2",15,"Upto 3 cP",0,3,"+/-0.5% FSD","SS 304","Flange End","Carbon Steel","ASA 150#","Weatherproof Alu Die Cast","4-Wire","4-20mA + Pulse","RS 485","Integral/Remote","230VAC/24VDC/110VAC","IP67 Weatherproof",["Gasket & Nut Bolts"],["Standard model"],["Max 15 Kg/cm2"],["Weatherproof"],false,false,false,false,false,"Standard PTFE",{conductivity:"Min 5 uS/cm",coilHousingMoc:"CS",electrodeMaterial:"SS 316L",earthingType:"In-Built Electrode",liningMaterial:"PTFE",cableGlandMoc:"SS 304",cableEntryStd:"PG 11",cableGlandProtection:"Weatherproof"}),
  m("s630b","flowmag","FlowMag S630B","FMIPL-EMFM-TS1-F-S2-F1-CH1-EL2-ER-PL-WP-W2-M-CR-BT-NB","Battery EMF for remote locations",["Remote water","No-power sites"],"-10 to +100 C",-10,100,"0 to 15 Kg/cm2",15,"Upto 3 cP",0,3,"+/-0.5% FSD","SS 304","Flange End","SS 316","ASA 150#","Weatherproof Alu Die Cast","4-Wire","4-20mA + Pulse","RS 485","Integral/Remote","3.6V Lithium (3-5yr)","IP67 Weatherproof",["Gasket & Nut Bolts"],["Battery 3-5yr"],["Max 15 Kg/cm2"],["Weatherproof"],false,true,false,false,false,"Standard PTFE",{conductivity:"Min 5 uS/cm",coilHousingMoc:"CS",electrodeMaterial:"SS 316L",earthingType:"Earthing Ring",liningMaterial:"PTFE",cableGlandMoc:"SS 304",cableEntryStd:"PG 11",cableGlandProtection:"Weatherproof"}),
  m("s630f","flowmag","FlowMag S630F","FMIPL-EMFM-TS1-C-CH1-EL2-IF-PL-WP-W2-CR-CG1-CE2-CP1-NB","High-pressure EMF (200 Kg/cm2)",["High-pressure water","Hydraulic"],"-10 to +100 C",-10,100,"0 to 200 Kg/cm2",200,"Upto 3 cP",0,3,"+/-0.5% FSD","SS 304","Flange/Threaded","Carbon Steel","ASA 300/Custom","Weatherproof Alu Die Cast","4-Wire","4-20mA + Pulse/HART","RS 485","Integral/Remote","230VAC/24VDC/110VAC","IP67 Weatherproof",["Gasket & Nut Bolts"],["High pressure 200","Threaded option"],["Custom connections"],["Weatherproof"],false,false,false,true,false,"Standard PTFE",{conductivity:"Min 5 uS/cm",coilHousingMoc:"CS",electrodeMaterial:"SS 316L",earthingType:"In-Built Electrode",liningMaterial:"PTFE",cableGlandMoc:"SS 304",cableEntryStd:"PG 11",cableGlandProtection:"Weatherproof"}),
  m("s660","flowmag","FlowMag 900-S660","FMIPL-EMFM-TS1-F-C-F2-CH1-EL2-IF-RL-WP-W2-CR-NB","Rubber-lined EMF for water supply",["Water supply","Municipal water"],"-10 to +60 C",-10,60,"0 to 15 Kg/cm2",15,"Upto 3 cP",0,3,"+/-0.5% FSD","SS 304","Flange End","Carbon Steel","IS 1538","Weatherproof Alu Die Cast","4-Wire","4-20mA + Pulse/HART","RS 485","Integral/Remote","230VAC/24VDC/110VAC","IP67 Weatherproof",["Gasket & Nut Bolts","Extra Wire"],["Rubber lined for water"],["Max 60 C"],["Weatherproof"],false,false,false,false,false,"Rubber lined",{conductivity:"Min 5 uS/cm",coilHousingMoc:"CS",electrodeMaterial:"SS 316L",earthingType:"In-Built Electrode",liningMaterial:"Rubber",cableGlandMoc:"SS 304",cableEntryStd:"PG 11",cableGlandProtection:"Weatherproof"}),
  m("s660bp","flowmag","FlowMag S660 BP","FMIPL-EMFM-TS1-F-C-F2-CH1-EL2-ER1-RL-WP-W2-CR-BT-NB","Battery + rubber-lined for remote water",["Remote water supply"],"-10 to +60 C",-10,60,"0 to 15 Kg/cm2",15,"Upto 3 cP",0,3,"+/-0.5% FSD","SS 304","Flange End","Carbon Steel","IS 1538","Weatherproof Alu Die Cast","4-Wire","4-20mA + Pulse","RS 485","Integral/Remote","3.6V Lithium (3-5yr)","IP67 Weatherproof",["Gasket & Nut Bolts","Extra Wire"],["Battery + rubber lined"],["Max 60 C"],["Weatherproof"],false,true,false,false,false,"Rubber lined",{conductivity:"Min 5 uS/cm",coilHousingMoc:"CS",electrodeMaterial:"SS 316L",earthingType:"Earthing Ring + In-Built",liningMaterial:"Rubber",cableGlandMoc:"SS 304",cableEntryStd:"PG 11",cableGlandProtection:"Weatherproof"}),
  m("s90","flowmag","FlowMag S90 (PVC)","FMIPL-EMFM-Cu-F-Cu-F1-Cu-ER-IF-WP-W2-M-CR-CG1-CP1-NB","Full PVC body EMF for corrosive liquids",["Corrosive liquids","Acid/alkali"],"-10 to +60 C",-10,60,"0 to 15 Kg/cm2",15,"Upto 3 cP",0,3,"+/-0.5% FSD","CPVC","Flange End","CPVC","ASA 150#","Weatherproof Alu Die Cast","4-Wire","4-20mA + Pulse","RS 485","Integral/Remote","230VAC","IP67 Weatherproof",["Gasket & Nut Bolts"],["Full CPVC construction"],["Max 60 C","230VAC only"],["Weatherproof"],false,false,false,false,false,"Excellent CPVC",{conductivity:"Min 5 uS/cm",coilHousingMoc:"CPVC",electrodeMaterial:"SS 316L",earthingType:"Earthing Ring + In-Built",liningMaterial:"N/A (PVC body)",cableGlandMoc:"SS 304",cableEntryStd:"PG 11",cableGlandProtection:"Weatherproof"}),
  m("s900","flowmag","FlowMag S900","FMIPL-EMFM-TS1-F-C-F1-CH2-ER-ER1-PL-W2-WP-CR-CG1-CE2-CP1-M-NB","EMF for wastewater/corrosive liquids",["Wastewater","Chemical processing"],"-10 to +100 C",-10,100,"0 to 25 Kg/cm2",25,"Upto 3 cP",0,3,"+/-0.5% FSD","SS 316","Flange End","Carbon Steel","ASA 150#","Weatherproof Alu Die Cast","4-Wire","4-20mA + Pulse/HART","RS 485","Integral/Remote","230VAC/24VDC/110VAC","IP67 Weatherproof",["Gasket & Nut Bolts"],["Hastelloy/Tantalum electrodes"],["Max 25 Kg/cm2"],["Weatherproof"],false,false,false,false,false,"Excellent Hastelloy/PTFE",{conductivity:"Min 5 uS/cm",coilHousingMoc:"SS 304",electrodeMaterial:"Hastelloy-C / Tantalum",earthingType:"Earthing Ring",liningMaterial:"PTFE",cableGlandMoc:"SS 304",cableEntryStd:"PG 11",cableGlandProtection:"Weatherproof"}),
  m("s900ex","flowmag","FlowMag S900Ex","FMIPL-EMFM-TS1-F-C-F1-CH2-ER-ER1-PL-W2-FLP-CR-CG1-CE2-CP2-M-NB","Flameproof EMF for hazardous areas",["Hazardous areas","Zone 1/2"],"-10 to +100 C",-10,100,"0 to 15 Kg/cm2",15,"Upto 3 cP",0,3,"+/-0.5% FSD","SS 316","Flange End","Carbon Steel","ASA 150#","Flameproof PESO IIA IIB IIC","4-Wire","4-20mA + Pulse/HART","RS 485","Integral/Remote","230VAC/24VDC/110VAC","Flameproof",["Gasket & Nut Bolts"],["PESO Flameproof"],["Max 15 Kg/cm2"],["PESO IIA IIB IIC"],true,false,false,false,true,"Excellent Hastelloy/PTFE",{conductivity:"Min 5 uS/cm",coilHousingMoc:"SS 304",electrodeMaterial:"Hastelloy-C / Tantalum",earthingType:"Earthing Ring",liningMaterial:"PTFE",cableGlandMoc:"SS 304",cableEntryStd:"PG 11",cableGlandProtection:"Flameproof"}),
  m("s900exf","flowmag","FlowMag S900ExF","FMIPL-EMFM-TS1-C-CH2-ER-ER1-PL-W2-FLP-CR-CG1-CE2-CP2-M-NB","Flameproof + high pressure EMF",["Hazardous + high pressure"],"-10 to +100 C",-10,100,"0 to 200 Kg/cm2",200,"Upto 3 cP",0,3,"+/-0.5% FSD","SS 316","Flange-End/Threaded","Carbon Steel","ASA 300/600/Custom","Flameproof PESO IIA IIB IIC","4-Wire","4-20mA + Pulse/HART","RS 485","Integral/Remote","230VAC/24VDC/110VAC","Flameproof",["Gasket & Nut Bolts"],["Flameproof + High pressure"],["Custom connections"],["PESO IIA IIB IIC"],true,false,false,true,true,"Excellent Hastelloy/PTFE",{conductivity:"Min 5 uS/cm",coilHousingMoc:"SS 304",electrodeMaterial:"Hastelloy-C / Tantalum",earthingType:"Earthing Ring",liningMaterial:"PTFE",cableGlandMoc:"SS 304",cableEntryStd:"PG 11",cableGlandProtection:"Flameproof"}),
  m("s900f","flowmag","FlowMag S900F","FMIPL-EMFM-TS1-C-CH2-ER-ER1-PL-W2-WP-CR-CG1-CE2-CP1-M-NB","High-pressure weatherproof EMF",["High-pressure corrosive"],"-10 to +100 C",-10,100,"0 to 200 Kg/cm2",200,"Upto 3 cP",0,3,"+/-0.5% FSD","SS 316","Flange-End/Threaded","Carbon Steel","ASA 300/600/Custom","Weatherproof Alu Die Cast","4-Wire","4-20mA + Pulse/HART","RS 485","Integral/Remote","230VAC/24VDC/110VAC","IP67 Weatherproof",["Gasket & Nut Bolts"],["High pressure 200"],["Not flameproof"],["Weatherproof"],false,false,false,true,false,"Excellent Hastelloy/PTFE",{conductivity:"Min 5 uS/cm",coilHousingMoc:"SS 304",electrodeMaterial:"Hastelloy-C / Tantalum",earthingType:"Earthing Ring",liningMaterial:"PTFE",cableGlandMoc:"SS 304",cableEntryStd:"PG 11",cableGlandProtection:"Weatherproof"}),
  m("s930","flowmag","FlowMag S930","FMIPL-EMFM-TS2-S2-CH3-IF-PL-W2-CR-EL2-WP-M-CG1-CE2-CP1-NB","Hygienic EMF for F&B",["Food & beverage","Pharma","Dairy"],"-10 to +100 C",-10,100,"0 to 15 Kg/cm2",15,"Upto 3 cP",0,3,"+/-0.5% FSD","SS 316","Flange/Tri-Clover","SS 316","ASA 150#/TC","Weatherproof Alu Die Cast","4-Wire","4-20mA + Pulse","RS 485","Integral/Remote","230VAC/24VDC/110VAC","IP67 Weatherproof",["Gasket & Nut Bolts"],["Full SS316","Tri-Clover option"],["Max 15 Kg/cm2","No HART"],["Weatherproof"],false,false,true,false,false,"Hygienic SS316/PTFE",{conductivity:"Min 5 uS/cm",coilHousingMoc:"SS 316",electrodeMaterial:"SS 316L",earthingType:"In-Built Electrode",liningMaterial:"PTFE",cableGlandMoc:"SS 316",cableEntryStd:"PG 11",cableGlandProtection:"Weatherproof"}),
  m("s930ex","flowmag","FlowMag S930Ex","FMIPL-EMFM-TS2-S2-CH3-IF-PL-W2-FLP-EL2-M-CG1-CE2-CP2-NB","Flameproof hygienic EMF",["Hygienic hazardous","F&B Zone 1/2"],"-10 to +100 C",-10,100,"0 to 15 Kg/cm2",15,"Upto 3 cP",0,3,"+/-0.5% FSD","SS 316","Flange/Tri-Clover","SS 316","ASA 150#/TC","Flameproof PESO IIA IIB IIC","4-Wire","4-20mA + Pulse","RS 485","Integral/Remote","230VAC/24VDC/110VAC","Flameproof",["Gasket & Nut Bolts"],["Flameproof + Hygienic"],["Max 15 Kg/cm2"],["PESO IIA IIB IIC"],true,false,true,false,true,"Hygienic SS316/PTFE",{conductivity:"Min 5 uS/cm",coilHousingMoc:"SS 316",electrodeMaterial:"SS 316L",earthingType:"In-Built Electrode",liningMaterial:"PTFE",cableGlandMoc:"SS 316",cableEntryStd:"PG 11",cableGlandProtection:"Flameproof"}),

  // ─── FLOWTURB — 8 models ─────────────────────────────────────────────────
  m("turb-l270","flowturb","FlowTurb L270","FMIPL-TFM-FT2-F-S2-F1IR-W2-WP-M-CR-NB","Standard turbine for clean liquids",["Clean liquids","Low conductivity fluids"],"-20 to +150 C",-20,150,"-0.9 to 25 Bar",25,"0 to 10 cP",0,10,"+/-1% MV","SS 316","Flange End","SS 316","ASA 150# RF","Weatherproof Alu Die Cast","4-Wire","4-20mA + Pulse + 2 Relay","RS 485","Integral/Remote","230VAC/24VDC","IP67 Weatherproof",["Gasket & Nut Bolts","Extra Wire"],["Standard turbine","2 relay outputs"],["Viscosity max 10 cP"],["Weatherproof"],false,false,false,false,false,"Standard SS316",{impellerType:"Regular (SS 410)"}),
  m("turb-l270b","flowturb","FlowTurb L270B","FMIPL-TFM-FT2-F-S2-F1IR-W2-WP-M-CR-BT-NB","Battery turbine for remote locations",["Remote locations","No-power sites"],"-20 to +150 C",-20,150,"-0.9 to 25 Bar",25,"0 to 10 cP",0,10,"+/-1% MV","SS 316","Flange End","SS 316","ASA 150# RF","Weatherproof Alu Die Cast","4-Wire","4-20mA + Pulse + 2 Relay","RS 485","Integral/Remote","3.6V Lithium (up to 5yr)","IP67 Weatherproof",["Gasket & Nut Bolts","Extra Wire"],["Battery up to 5yr"],["24VDC needed for output"],["Weatherproof"],false,true,false,false,false,"Standard SS316",{impellerType:"Regular (SS 410)"}),
  m("turb-l270ex","flowturb","FlowTurb L270 Ex","FMIPL-TFM-FT2-F-S2-F1-IR-W2-FLP-M-CR-NB","Flameproof turbine for hazardous areas",["Hazardous areas","Zone 1/2"],"-20 to +150 C",-20,150,"-0.9 to 25 Bar",25,"0 to 5 cP",0,5,"+/-1% MV","SS 316","Flange End","SS 316","ASA 150# RF","Flameproof PESO IIA IIB IIC","4-Wire","4-20mA + Pulse + 2 Relay","RS 485","Integral/Remote","230VAC/24VDC","Flameproof",["Gasket & Nut Bolts","Extra Wire"],["PESO Flameproof"],["Viscosity max 5 cP"],["PESO IIA IIB IIC"],true,false,false,false,true,"Standard SS316",{impellerType:"Regular (SS 410)"}),
  m("turb-l270exf","flowturb","FlowTurb L270 ExF","FMIPL-TFM-FT2-S2-IR-W2-FLP-M-CR-NB","Flameproof + high pressure turbine",["Hazardous + high pressure"],"-20 to +150 C",-20,150,"-0.9 to 25 Bar",25,"0 to 5 cP",0,5,"+/-1% MV","SS 316","Flange-End/Threaded","SS 316","ASA 150/Custom","Flameproof PESO IIA IIB IIC","4-Wire","4-20mA + Pulse + 2 Relay","RS 485","Integral/Remote","230VAC/24VDC","Flameproof",["Gasket & Nut Bolts","Extra Wire"],["Flameproof + threaded"],["Viscosity max 5 cP"],["PESO IIA IIB IIC"],true,false,false,false,true,"Standard SS316",{impellerType:"Regular (SS 410)"}),
  m("turb-l270f","flowturb","FlowTurb L270F","FMIPL-TFM-FT2-S2-IR-W2-WP-M-CR-NB","Turbine with flange-end/threaded",["General process","Threaded connections"],"-20 to +150 C",-20,150,"-0.9 to 25 Bar",25,"0 to 5 cP",0,5,"+/-1% MV","SS 316","Flange-End/Threaded","SS 316","ASA 150/Custom","Weatherproof Alu Die Cast","4-Wire","4-20mA + Pulse + 2 Relay","RS 485","Integral/Remote","230VAC/24VDC","IP67 Weatherproof",["Gasket & Nut Bolts","Extra Wire"],["Threaded connection option"],["Viscosity max 5 cP"],["Weatherproof"],false,false,false,false,false,"Standard SS316",{impellerType:"Regular (SS 410)"}),
  m("turb-l630","flowturb","FlowTurb L630","FMIPL-TFM-FT2-T1-S2-CU-IR-W2-WP-M-CR-NB","TC connection turbine for hygienic",["Hygienic process","Food & beverage","Pharma"],"-20 to +150 C",-20,150,"-0.9 to 25 Bar",25,"0 to 5 cP",0,5,"+/-1% MV","SS 316","TC Connection","SS 316","ASME","Weatherproof Alu Die Cast","4-Wire","4-20mA + Pulse + 2 Relay","RS 485","Integral/Remote","230VAC/24VDC","IP67 Weatherproof",["Gasket & Nut Bolts","Extra Wire"],["Tri-Clover connection"],["Viscosity max 5 cP"],["Weatherproof"],false,false,true,false,false,"Hygienic SS316",{impellerType:"Regular (SS 410)"}),
  m("turb-l900","flowturb","FlowTurb L900","FMIPL-TFM-FT2-F-S2-F1-IR-W2-WP-M-WO-DC-NB","Pickup sensor turbine, no display",["OEM integration","Sensor-only"],"-20 to +150 C",-20,150,"-0.9 to 25 Bar",25,"0 to 5 cP",0,5,"+/-1% MV","SS 316","Flange End","SS 316","ASA 150# RF","Weatherproof Alu Die Cast","3-Wire","Pickup Sensor Output","N/A","Integral","8-24 VDC","IP67 Weatherproof",["Gasket & Nut Bolts","Extra Wire"],["Pickup sensor","No display"],["No display/controller"],["Weatherproof"],false,false,false,false,false,"Standard SS316",{impellerType:"Regular (SS 410)"}),
  m("turb-l900f","flowturb","FlowTurb L900 F","FMIPL-TFM-FT2-S2-IR-W2-WO-M-NB","Pickup sensor + flange/threaded",["OEM integration","Threaded"],"-20 to +150 C",-20,150,"-0.9 to 25 Bar",25,"0 to 5 cP",0,5,"+/-1% MV","SS 316","Flange-End/Threaded","SS 316","ASA 150/Custom","Weatherproof Alu Die Cast","2-Wire","Pickup Sensor + 4-20mA","N/A","Integral","8-28 VDC","IP67 Weatherproof",["Gasket & Nut Bolts","Extra Wire"],["Pickup + 4-20mA","Threaded"],["No display"],["Weatherproof"],false,false,false,false,false,"Standard SS316",{impellerType:"Regular (SS 410)"}),

  // ─── FLOWSWIRL — 7 models ────────────────────────────────────────────────
  m("swirl-l360","flowswirl","FlowSwirl L360","FMIPL-VFM-IT1-PCT2-FT2-PC1-PCM2-PCS1-MT1-EPT1-O2-CO1-WT2-PS1-NB","Standard vortex without P&T compensation",["Liquids & gases","Volumetric"],"-25 to +180 C",-25,180,"-0.9 to 30 Bar",30,"<=10 cP",0,10,"+/-1% MV","SS 316","Flange-End","SS 316","ASA 150","Weatherproof Alu Die Cast","3-Wire + RS 485","4-20mA + HART + Pulse","RS 485","Integral","24 VDC","IP67 Weatherproof",["Controller: NA","Mating Flanges: NA"],["HART output","Without P&T comp"],["No P&T compensation"],["Weatherproof"],false,false,false,false,false,"Standard SS316",{ptCompensation:"Without",ibrType:"Non-IBR"}),
  m("swirl-l360f","flowswirl","FlowSwirl L360F","FMIPL-VFM-IT1-PCT2-FT2-PCM2-MT1-EPT1-O2-CO1-WT2-PS1-NB","High pressure vortex (150 Bar) no P&T",["High pressure liquids/gases"],"-25 to +180 C",-25,180,"-0.9 to 150 Bar",150,"<=10 cP",0,10,"+/-1% MV","SS 316","Flange/Wafer/Threaded","SS 316","ASA 150/300/Custom","Weatherproof Alu Die Cast","3-Wire + RS 485","4-20mA + HART + Pulse","RS 485","Integral","24 VDC","IP67 Weatherproof",["Controller: NA","Mating Flanges: NA"],["High pressure 150 Bar","Multi connection"],["No P&T compensation"],["Weatherproof"],false,false,false,true,false,"Standard SS316",{ptCompensation:"Without",ibrType:"Non-IBR"}),
  m("swirl-l360s","flowswirl","FlowSwirl L360S","FMIPL-VFM-IT1-PCT2-FT2-PC3-PCM2-PCS1-MT1-EPT1-O2-CO1-WT2-PS1-NB","TC connection vortex hygienic no P&T",["Food & beverage","Pharma","Hygienic"],"-25 to +180 C",-25,180,"-0.9 to 30 Bar",30,"<=10 cP",0,10,"+/-1% MV","SS 316","TC End Connection","SS 316","ASME","Weatherproof Alu Die Cast","3-Wire + RS 485","4-20mA + HART + Pulse","RS 485","Integral","24 VDC","IP67 Weatherproof",["Controller: NA","Mating Flanges: NA"],["Tri-Clover hygienic"],["No P&T compensation"],["Weatherproof"],false,false,true,false,false,"Hygienic SS316",{ptCompensation:"Without",ibrType:"Non-IBR"}),
  m("swirl-l600","flowswirl","FlowSwirl L600","FMIPL-VFM-IT1-PCT1-FT2-PC1-PCM2-PCS1-MT1-EPT1-O2-CO1-WT2-PS1-NB","Vortex with P&T compensation",["Steam","Mass flow","Energy metering"],"-25 to +180 C",-25,180,"-0.9 to 30 Bar",30,"<=10 cP",0,10,"+/-1% MV","SS 316","Flange-End","SS 316","ASA 150","Weatherproof Alu Die Cast","3-Wire + RS 485","4-20mA + HART + Pulse","RS 485","Integral","24 VDC","IP67 Weatherproof",["Controller: NA","Mating Flanges: NA"],["P&T Compensation","Mass flow"],["24VDC only"],["Weatherproof"],false,false,false,false,false,"Standard SS316",{ptCompensation:"With",ibrType:"Non-IBR"}),
  m("swirl-l600f","flowswirl","FlowSwirl L600 F","FMIPL-VFM-IT1-PCT1-FT2-PCM2-MT1-EPT1-O2-CO1-WT2-PS1-NB","High pressure vortex with P&T (150 Bar)",["High pressure steam","Energy"],"-25 to +180 C",-25,180,"-0.9 to 150 Bar",150,"<=10 cP",0,10,"+/-1% MV","SS 316","Flange/Wafer/Threaded","SS 316","ASA 150/300/Custom","Weatherproof Alu Die Cast","3-Wire + RS 485","4-20mA + HART + Pulse","RS 485","Integral","24 VDC","IP67 Weatherproof",["Controller: NA","Mating Flanges: NA"],["P&T + High pressure 150"],["24VDC only"],["Weatherproof"],false,false,false,true,false,"Standard SS316",{ptCompensation:"With",ibrType:"Non-IBR"}),
  m("swirl-l600s","flowswirl","FlowSwirl L600S","FMIPL-VFM-IT1-PCT1-FT2-PC3-PCM2-PCS1-MT1-EPT1-O2-CO1-WT2-PS1-NB","TC vortex with P&T hygienic",["Hygienic steam","F&B energy"],"-25 to +180 C",-25,180,"-0.9 to 30 Bar",30,"<=10 cP",0,10,"+/-1% MV","SS 316","TC End Connection","SS 316","ASME","Weatherproof Alu Die Cast","3-Wire + RS 485","4-20mA + HART + Pulse","RS 485","Integral","24 VDC","IP67 Weatherproof",["Controller: NA","Mating Flanges: NA"],["P&T + Tri-Clover"],["24VDC only"],["Weatherproof"],false,false,true,false,false,"Hygienic SS316",{ptCompensation:"With",ibrType:"Non-IBR"}),
  m("swirl-l900","flowswirl","FlowSwirl L900","FMIPL-VFM-IT1-PCT1-FT2-PC1-PCM2-PCS1-MT1-EPT1-O2-CO1-WT2-PS1-NB","High-temp vortex for steam (350 C)",["High temp steam","Superheated steam"],"-25 to +350 C",-25,350,"-0.9 to 30 Bar",30,"<=10 cP",0,10,"+/-1% MV","SS 316","Flange-End","SS 316","ASA 150","Weatherproof Alu Die Cast","3-Wire + RS 485","4-20mA + HART + Pulse","RS 485","Integral","24 VDC","IP67 Weatherproof",["Controller: NA","Mating Flanges: NA"],["High temp 350 C"],["24VDC only"],["Weatherproof"],false,false,false,false,false,"High temp SS316",{ptCompensation:"With",ibrType:"Non-IBR"}),

  // ─── FLOWVAL — 10 models (Oval Gear) ─────────────────────────────────────
  m("val-l270","flowval","FlowVal L270","FMIPL-DOGFM-PC2-PCM4-PCS2-RM1-SM1-O1","Cost-effective high viscosity measurement",["High viscosity liquids","Oil","Fuels"],"-10 to +100 C",-10,100,"-0.9 to 30 Bar",30,"10 to 300 cP",10,300,"+/-0.5 to 1% MV","Aluminium Anodized","Threaded","Aluminium Anodized","1/4\" BSP (F)","N/A (no display)","2-Wire","4-20mA","N/A","Integral","24VDC","N/A",[],["Cost-effective","Direct pulse output"],["No display","24VDC only"],[],false,false,false,false,false,"Anodized Aluminium",{rotorMoc:"Aluminium Anodized",shaftMoc:"SS 316",displayDetails:"Without Display. Direct Pulse Output from Mounting"}),
  m("val-l360","flowval","FlowVal L360","FMIPL-DOGFM-PC2-PCM3-PCS2-RM2-SM1-O1","SS316 high viscosity measurement",["High viscosity liquids","Chemicals","Food products"],"-10 to +100 C",-10,100,"-0.9 to 30 Bar",30,"10 to 300 cP",10,300,"+/-0.5 to 1% MV","SS 316","Threaded","SS 316","1/4\" BSP (F)","N/A (no display)","2-Wire","4-20mA","N/A","Integral","24VDC","N/A",[],["SS316 construction","Direct pulse output"],["No display","24VDC only"],[],false,false,false,false,false,"SS316",{rotorMoc:"SS 316",shaftMoc:"SS 316",displayDetails:"Without Display. Direct Pulse Output from Mounting"}),
  m("val-l400","flowval","FlowVal L400","FMIPL-DOGFM-PC2-PCM4-PCS2-RM1-SM1-O1-MT1/MT2-DD2","Weatherproof oval gear with display",["High viscosity liquids","Oil","Fuels","Chemicals"],"-10 to +100 C",-10,100,"-0.9 to 30 Bar",30,"10 to 300 cP",10,300,"+/-0.5 to 1% MV","Aluminium Anodized","Threaded","Aluminium Anodized","1/4\" BSP (F)","Weatherproof Alu Die Cast","3-Wire","4-20mA","RS 485","Integral/Remote","230VAC & 24VDC","IP67 Weatherproof",[],["LCD with backlight","Flow rate & totalizer"],["Viscosity 10-300 cP"],["Weatherproof"],false,false,false,false,false,"Anodized Aluminium",{rotorMoc:"Aluminium Anodized",shaftMoc:"SS 316",displayDetails:"LCD With Backlight",readings:"Flow Rate & Flow Totalizer",screen:"LCD With Backlight"}),
  m("val-l400ex","flowval","FlowVal L400Ex","FMIPL-DOGFM-PC2-PCM4-PCS2-RM1-SM1-O1-MT1/MT2-DD3","Flameproof oval gear with display",["Hazardous area high viscosity","Zone 1/2"],"-10 to +100 C",-10,100,"-0.9 to 30 Bar",30,"10 to 300 cP",10,300,"+/-0.5 to 1% MV","Aluminium Anodized","Threaded","Aluminium Anodized","1/4\" BSP (F)","Flameproof PESO IIA IIB IIC","3-Wire","4-20mA","RS 485","Integral/Remote","230VAC & 24VDC","Flameproof",[],["PESO Flameproof","LCD with backlight"],["Viscosity 10-300 cP"],["PESO IIA IIB IIC"],true,false,false,false,true,"Anodized Aluminium",{rotorMoc:"Aluminium Anodized",shaftMoc:"SS 316",displayDetails:"LCD With Backlight",readings:"Flow Rate & Flow Totalizer",screen:"LCD With Backlight"}),
  m("val-lf400exf","flowval","FlowVal LF400ExF","FMIPL-DOGFM-PC1/PC3-PCM4-PCS1-RM1-SM1-O1-MT1/MT2-DD3","Flameproof + flange/TC high pressure",["Hazardous high viscosity","High pressure"],"-10 to +100 C",-10,100,"-0.9 to 30 Bar",30,"10 to 300 cP",10,300,"+/-0.5 to 1% MV","Aluminium Anodized","Flange/TC Connection","Aluminium Anodized","ASA 150 Class","Flameproof PESO IIA IIB IIC","3-Wire","4-20mA","RS 485","Integral/Remote","230VAC & 24VDC","Flameproof",[],["Flameproof + Flange/TC","LCD with backlight"],["Viscosity 10-300 cP"],["PESO IIA IIB IIC"],true,false,false,false,true,"Anodized Aluminium",{rotorMoc:"Aluminium Anodized",shaftMoc:"SS 316",displayDetails:"LCD With Backlight",readings:"Flow Rate & Flow Totalizer",screen:"LCD With Backlight"}),
  m("val-l400f","flowval","FlowVal L400F","FMIPL-DOGFM-PC1/PC3-PCM4-PCS1-RM1-SM1-O1-MT1/MT2-DD2","Weatherproof + flange/TC connection",["High viscosity flange applications"],"-10 to +100 C",-10,100,"-0.9 to 30 Bar",30,"10 to 300 cP",10,300,"+/-0.5 to 1% MV","Aluminium Anodized","Flange/TC Connection","Aluminium Anodized","ASA 150 Class","Weatherproof Alu Die Cast","3-Wire","4-20mA","RS 485","Integral/Remote","230VAC & 24VDC","IP67 Weatherproof",[],["Flange/TC option","LCD with backlight"],["Viscosity 10-300 cP"],["Weatherproof"],false,false,false,false,false,"Anodized Aluminium",{rotorMoc:"Aluminium Anodized",shaftMoc:"SS 316",displayDetails:"LCD With Backlight",readings:"Flow Rate & Flow Totalizer",screen:"LCD With Backlight"}),
  m("val-l450","flowval","FlowVal L450","FMIPL-DOGFM-PC2-PCM3-PCS2-RM1-SM1-O1-MT1/MT2-DD2","All SS316 weatherproof oval gear",["High viscosity hygienic","SS316 required"],"-10 to +100 C",-10,100,"-0.9 to 30 Bar",30,"10 to 300 cP",10,300,"+/-0.5 to 1% MV","SS 316","Threaded","SS 316","1/4\" BSP (F)","Weatherproof Alu Die Cast","3-Wire","4-20mA","RS 485","Integral/Remote","230VAC & 24VDC","IP67 Weatherproof",[],["Full SS316","LCD with backlight"],["Viscosity 10-300 cP"],["Weatherproof"],false,false,false,false,false,"SS316",{rotorMoc:"SS 316",shaftMoc:"SS 316",displayDetails:"LCD With Backlight",readings:"Flow Rate & Flow Totalizer",screen:"LCD With Backlight"}),
  m("val-l450ex","flowval","FlowVal L450Ex","FMIPL-DOGFM-PC2-PCM3-PCS2-RM1-SM1-O1-MT1/MT2-DD3","All SS316 flameproof oval gear",["Hazardous SS316 required"],"-10 to +100 C",-10,100,"-0.9 to 30 Bar",30,"10 to 300 cP",10,300,"+/-0.5 to 1% MV","SS 316","Threaded","SS 316","1/4\" BSP (F)","Flameproof PESO IIA IIB IIC","3-Wire","4-20mA","RS 485","Integral/Remote","230VAC & 24VDC","Flameproof",[],["Full SS316","PESO Flameproof"],["Viscosity 10-300 cP"],["PESO IIA IIB IIC"],true,false,false,false,true,"SS316",{rotorMoc:"SS 316",shaftMoc:"SS 316",displayDetails:"LCD With Backlight",readings:"Flow Rate & Flow Totalizer",screen:"LCD With Backlight"}),
  m("val-l450exf","flowval","FlowVal L450ExF","FMIPL-DOGFM-PC1/PC3-PCM3-PCS1-RM2-SM1-O1-MT1/MT2-DD3","SS316 flameproof + flange/TC (300 Bar)",["High pressure SS316 hazardous"],"-10 to +100 C",-10,100,"-0.9 to 300 Bar",300,"10 to 300 cP",10,300,"+/-0.5 to 1% MV","SS 316","Flange/TC Connection","SS 316","ASA 150 Class","Flameproof PESO IIA IIB IIC","3-Wire","4-20mA","RS 485","Integral/Remote","230VAC & 24VDC","Flameproof",[],["Full SS316","Flameproof + High pressure 300"],["Viscosity 10-300 cP"],["PESO IIA IIB IIC"],true,false,false,true,true,"SS316",{rotorMoc:"SS 316",shaftMoc:"SS 316",displayDetails:"LCD With Backlight",readings:"Flow Rate & Flow Totalizer",screen:"LCD With Backlight"}),
  m("val-l450f","flowval","FlowVal L450F","FMIPL-DOGFM-PC1/PC3-PCM3-PCS1-RM2-SM1-O1-MT1/MT2-DD2","SS316 weatherproof + flange/TC (300 Bar)",["High pressure SS316"],"-10 to +100 C",-10,100,"-0.9 to 300 Bar",300,"10 to 300 cP",10,300,"+/-0.5 to 1% MV","SS 316","Flange/TC Connection","SS 316","ASA 150 Class","Weatherproof Alu Die Cast","3-Wire","4-20mA","RS 485","Integral/Remote","230VAC & 24VDC","IP67 Weatherproof",[],["Full SS316","High pressure 300"],["Viscosity 10-300 cP"],["Weatherproof"],false,false,false,true,false,"SS316",{rotorMoc:"SS 316",shaftMoc:"SS 316",displayDetails:"LCD With Backlight",readings:"Flow Rate & Flow Totalizer",screen:"LCD With Backlight"}),

  // ─── FLOWGT — 12 models (Glass Tube Rotameter) ───────────────────────────
  m("gt-r180","flowgt","FlowGT R180","FMIPL-GTRM-WP-F-C-F1-FS-RS-SA1-BP-BT-NB","Standard glass tube rotameter MS body",["Clean water","Air","Gas","Non-corrosive liquids"],"-20 to +90 C",-20,90,"0 to 5 Bar",5,"N/A",0,0,"+/-2% FSD","Borosilicate Glass","Flange End","MS","ASA 150# RF","N/A (no electronics)","N/A","Visual indication","N/A","Integral","N/A","N/A",[],["MS body","Visible flow","180-200mm scale"],["Max 5 Bar","Max 90 C","Glass tube fragile"],[],false,false,false,false,false,"MS Powder Coated",{bodyMoc:"MS",floatMoc:"SS 316",scaleMoc:"Acrylic",protectionCover:"Transparent Acrylic",scaleLength:"180-200 mm",glandPacking:"PTFE + Neoprene",bottomTop:"Bottom/Top",f2fHeight:"500+/-5 mm"}),
  m("gt-r180f","flowgt","FlowGT R180F","FMIPL-GTRM-WP-C-FS-RS-SA1-BP-BT-NB","Glass tube with threaded/flange options",["Clean water","Air","Gas"],"-20 to +90 C",-20,90,"0 to 5 Bar",5,"N/A",0,0,"+/-2% FSD","Borosilicate Glass","Flange/Threaded","MS","ASA 150/300/NPT/BSP","N/A (no electronics)","N/A","Visual indication","N/A","Integral","N/A","N/A",[],["Flange or Threaded","MS body"],["Max 5 Bar","Glass tube fragile"],[],false,false,false,false,false,"MS Powder Coated",{bodyMoc:"MS",floatMoc:"SS 316",scaleMoc:"Acrylic",protectionCover:"Transparent Acrylic",scaleLength:"180-200 mm",glandPacking:"PTFE + Neoprene",bottomTop:"Bottom/Top",f2fHeight:"500+/-5 mm"}),
  m("gt-r180t","flowgt","FlowGT R180T","FMIPL-GTRM-WP-F-C-F1-FT-RT-SA1-BP-BT-NB","Teflon-lined glass tube for corrosive fluids",["Corrosive liquids","Acid/alkali","Chemical"],"-20 to +90 C",-20,90,"0 to 5 Bar",5,"N/A",0,0,"+/-2% FSD","Borosilicate Glass + Teflon","Flange End","MS","ASA 150# RF","N/A (no electronics)","N/A","Visual indication","N/A","Integral","N/A","N/A",[],["Teflon lined","Corrosion resistant"],["Max 5 Bar","Glass tube fragile"],[],false,false,false,false,false,"Teflon Lined",{bodyMoc:"MS",floatMoc:"Teflon",scaleMoc:"Acrylic",protectionCover:"Transparent Acrylic",scaleLength:"180-200 mm",glandPacking:"PTFE + Neoprene",bottomTop:"Bottom/Top",f2fHeight:"500+/-5 mm"}),
  m("gt-r270","flowgt","FlowGT R270","FMIPL-GTRM-WP1-F-S1-F1-FS-RS-SS-BS-BT-NB","SS304 body glass tube rotameter",["Clean water","Air","Gas","Food & beverage"],"-20 to +90 C",-20,90,"0 to 5 Bar",5,"N/A",0,0,"+/-2% FSD","Borosilicate Glass","Flange End","SS 304","ASA 150# RF","N/A (no electronics)","N/A","Visual indication","N/A","Integral","N/A","N/A",[],["Full SS304 construction","180-200mm scale"],["Max 5 Bar","Glass tube fragile"],[],false,false,false,false,false,"SS304",{bodyMoc:"SS 304",floatMoc:"SS 316",scaleMoc:"SS 304",protectionCover:"Transparent Acrylic",scaleLength:"180-200 mm",glandPacking:"PTFE + Neoprene",bottomTop:"Bottom/Top",f2fHeight:"500+/-5 mm"}),
  m("gt-r270f","flowgt","FlowGT R270F","FMIPL-GTRM-WP1-S1-FS-RS-SS-BS-BT-NB","SS304 with threaded/flange options",["Clean water","Air","Gas","Hygienic"],"-20 to +90 C",-20,90,"0 to 5 Bar",5,"N/A",0,0,"+/-2% FSD","Borosilicate Glass","Flange/Threaded","SS 304","ASA 150/300/NPT/BSP","N/A (no electronics)","N/A","Visual indication","N/A","Integral","N/A","N/A",[],["Full SS304","Flange or Threaded"],["Max 5 Bar","Glass tube fragile"],[],false,false,false,false,false,"SS304",{bodyMoc:"SS 304",floatMoc:"SS 316",scaleMoc:"SS 304",protectionCover:"Transparent Acrylic",scaleLength:"180-200 mm",glandPacking:"PTFE + Neoprene",bottomTop:"Bottom/Top",f2fHeight:"500+/-5 mm"}),
  m("gt-r270t","flowgt","FlowGT R270T","FMIPL-GTRM-WP1-F-S1-F1-FT-RT-SS-BS-BT-NB","SS304 Teflon-lined for corrosive fluids",["Corrosive liquids","Chemical","F&B"],"-20 to +90 C",-20,90,"0 to 5 Bar",5,"N/A",0,0,"+/-2% FSD","Borosilicate Glass + Teflon","Flange End","SS 304","ASA 150# RF","N/A (no electronics)","N/A","Visual indication","N/A","Integral","N/A","N/A",[],["SS304 + Teflon lined","Corrosion resistant"],["Max 5 Bar","Glass tube fragile"],[],false,false,false,false,false,"Teflon Lined SS304",{bodyMoc:"SS 304",floatMoc:"Teflon",scaleMoc:"SS 304",protectionCover:"Transparent Acrylic",scaleLength:"180-200 mm",glandPacking:"PTFE + Neoprene",bottomTop:"Bottom/Top",f2fHeight:"500+/-5 mm"}),
  m("gt-r360","flowgt","FlowGT R360","FMIPL-GTRM-WP2-F-S2-F1-FS-RS-SS-BS-BT-NB","SS316 body glass tube rotameter",["Clean water","Air","Gas","Pharma"],"-20 to +90 C",-20,90,"0 to 5 Bar",5,"N/A",0,0,"+/-2% FSD","Borosilicate Glass","Flange End","SS 316","ASA 150# RF","N/A (no electronics)","N/A","Visual indication","N/A","Integral","N/A","N/A",[],["Full SS316 construction","180-200mm scale"],["Max 5 Bar","Glass tube fragile"],[],false,false,false,false,false,"SS316",{bodyMoc:"SS 316",floatMoc:"SS 316",scaleMoc:"SS 316",protectionCover:"Transparent Acrylic",scaleLength:"180-200 mm",glandPacking:"PTFE + Neoprene",bottomTop:"Bottom/Top",f2fHeight:"500+/-5 mm"}),
  m("gt-r360f","flowgt","FlowGT R360F","FMIPL-GTRM-WP2-S2-FS-RS-SS-BS-BT-NB","SS316 with threaded/flange options",["Clean water","Air","Gas","Pharma"],"-20 to +90 C",-20,90,"0 to 5 Bar",5,"N/A",0,0,"+/-2% FSD","Borosilicate Glass","Flange/Threaded","SS 316","ASA 150/300/NPT/BSP","N/A (no electronics)","N/A","Visual indication","N/A","Integral","N/A","N/A",[],["Full SS316","Flange or Threaded"],["Max 5 Bar","Glass tube fragile"],[],false,false,false,false,false,"SS316",{bodyMoc:"SS 316",floatMoc:"SS 316",scaleMoc:"SS 316",protectionCover:"Transparent Acrylic",scaleLength:"180-200 mm",glandPacking:"PTFE + Neoprene",bottomTop:"Bottom/Top",f2fHeight:"500+/-5 mm"}),
  m("gt-r360t","flowgt","FlowGT R360T","FMIPL-GTRM-WP2-F-S2-F1-FT-RT-SS-BS-BT-NB","SS316 Teflon-lined for corrosive fluids",["Corrosive liquids","Pharma","Chemical"],"-20 to +90 C",-20,90,"0 to 5 Bar",5,"N/A",0,0,"+/-2% FSD","Borosilicate Glass + Teflon","Flange End","SS 316","ASA 150# RF","N/A (no electronics)","N/A","Visual indication","N/A","Integral","N/A","N/A",[],["SS316 + Teflon lined","Corrosion resistant"],["Max 5 Bar","Glass tube fragile"],[],false,false,false,false,false,"Teflon Lined SS316",{bodyMoc:"SS 316",floatMoc:"Teflon",scaleMoc:"SS 316",protectionCover:"Transparent Acrylic",scaleLength:"180-200 mm",glandPacking:"PTFE + Neoprene",bottomTop:"Bottom/Top",f2fHeight:"500+/-5 mm"}),
  m("gt-rp180","flowgt","FlowGT RP180","FMIPL-GTRM-WP-F-C-F1-FS-PS-PP-BP-BT-NB","Panel-mounted glass tube rotameter",["Panel mounting","Clean water","Air"],"-20 to +90 C",-20,90,"0 to 5 Bar",5,"N/A",0,0,"+/-2% FSD","Borosilicate Glass","Flange End","MS","ASA 150# RF","N/A (no electronics)","N/A","Visual indication","N/A","Integral","N/A","N/A",[],["Panel mount design","MS body"],["Max 5 Bar","Glass tube fragile"],[],false,false,false,false,false,"MS Powder Coated",{bodyMoc:"MS",floatMoc:"SS 316",scaleMoc:"Polypropylene",protectionCover:"Transparent Acrylic",scaleLength:"180-200 mm",glandPacking:"PTFE + Neoprene",bottomTop:"Bottom/Top",f2fHeight:"500+/-5 mm"}),
  m("gt-rs180","flowgt","FlowGT RS180","FMIPL-GTRM-WP-F-C-F1-FS-RS-SS-BP-BT-NB","SS wetted parts glass tube rotameter",["Clean water","Air","Gas","General industrial"],"-20 to +90 C",-20,90,"0 to 5 Bar",5,"N/A",0,0,"+/-2% FSD","Borosilicate Glass","Flange End","MS","ASA 150# RF","N/A (no electronics)","N/A","Visual indication","N/A","Integral","N/A","N/A",[],["SS wetted parts","MS body"],["Max 5 Bar","Glass tube fragile"],[],false,false,false,false,false,"SS wetted parts",{bodyMoc:"MS",floatMoc:"SS 316",scaleMoc:"SS 304",protectionCover:"Transparent Acrylic",scaleLength:"180-200 mm",glandPacking:"PTFE + Neoprene",bottomTop:"Bottom/Top",f2fHeight:"500+/-5 mm"}),
  m("gt-rs180t","flowgt","FlowGT RS180T","FMIPL-GTRM-WP-F-C-F1-FT-RT-SS-BP-BT-NB","SS wetted Teflon-lined for corrosive",["Corrosive liquids","Chemical"],"-20 to +90 C",-20,90,"0 to 5 Bar",5,"N/A",0,0,"+/-2% FSD","Borosilicate Glass + Teflon","Flange End","MS","ASA 150# RF","N/A (no electronics)","N/A","Visual indication","N/A","Integral","N/A","N/A",[],["SS + Teflon lined","Corrosion resistant"],["Max 5 Bar","Glass tube fragile"],[],false,false,false,false,false,"Teflon Lined",{bodyMoc:"MS",floatMoc:"Teflon",scaleMoc:"SS 304",protectionCover:"Transparent Acrylic",scaleLength:"180-200 mm",glandPacking:"PTFE + Neoprene",bottomTop:"Bottom/Top",f2fHeight:"500+/-5 mm"}),

  // ─── FLOWMET — 13 models (Metal Tube Rotameter) ──────────────────────────
  m("met-l180","flowmet","FlowMet L180","FMIPL-MTRM-WP2-TS2-F-S2-F1-FS-RS-JNA-SA-NA-EA-WP-AG-VI-FF2-CG1-CS1-CGP1-NB","Analogue metal tube 40 Bar weatherproof",["Industrial process","Opaque fluids","General"],"-30 to +150 C",-30,150,"-0.9 to 40 Bar",40,"N/A",0,0,"+/-2% FSD","SS 316","Flange End","SS 316","ASA 150# RF","Weatherproof Alu Die Cast","2-Wire","Analogue (local indicator)","N/A","Integral","N/A","IP67 Weatherproof",[],["SS316 construction","Analogue indicator","1:10 turndown"],["No 4-20mA output"],["Weatherproof"],false,false,false,false,false,"SS316",{tubeMoc:"SS 316",floatMoc:"SS 316",scaleMoc:"Aluminium",enclosureMoc:"Aluminium",guideRodMoc:"SS 316",jacketing:"Not Applicable",protectionCover:"Transparent Acrylic/Glass",f2fHeight:"250+/-10 mm",installation:"Vertical",outputType:"Analogue"}),
  m("met-l180f","flowmet","FlowMet L180F","FLIPM-MTRM-WP2-TS2-S2-FS-RS-JNA-SA-NA-EA-WP-AG-VI-FF2-CG1-CS1-CGP1-NB","Analogue metal tube 200 Bar threaded",["High pressure industrial"],"-30 to +350 C",-30,350,"-0.9 to 200 Bar",200,"N/A",0,0,"+/-2% FSD","SS 316","Threaded","SS 316","BSP (M)","Weatherproof Alu Die Cast","2-Wire","Analogue (local indicator)","N/A","Integral","N/A","IP67 Weatherproof",[],["High pressure 200 Bar","Analogue indicator","Threaded"],["No 4-20mA output"],["Weatherproof"],false,false,false,true,false,"SS316",{tubeMoc:"SS 316",floatMoc:"SS 316",scaleMoc:"Aluminium",enclosureMoc:"Aluminium",guideRodMoc:"SS 316",jacketing:"Not Applicable",protectionCover:"Transparent Acrylic/Glass",f2fHeight:"250+/-10 mm",installation:"Vertical",outputType:"Analogue"}),
  m("met-l360","flowmet","FlowMet L360","FMIPL-MTRM-WP2-TS2-F-S2-F1-FS-RS-SA-NA-EA-VI-FF2-CG1-CS1-DG-WP-CGP1-NB","Digital+HART metal tube 40 Bar flange",["Industrial process","Digital output"],"-30 to +150 C",-30,150,"-0.9 to 40 Bar",40,"N/A",0,0,"+/-2% FSD","SS 316","Flange End","SS 316","ASA 150# RF","Weatherproof Alu Die Cast","3-Wire","4-20mA + HART","N/A","Integral","24VDC","IP67 Weatherproof",[],["Digital HART output","SS316","1:10 turndown"],["24VDC required"],["Weatherproof"],false,false,false,false,false,"SS316",{tubeMoc:"SS 316",floatMoc:"SS 316",scaleMoc:"Aluminium",enclosureMoc:"Aluminium",guideRodMoc:"SS 316",jacketing:"N/A",protectionCover:"Transparent Acrylic/Glass",f2fHeight:"250+/-10 mm",installation:"Vertical",outputType:"Digital 4-20mA+HART"}),
  m("met-l360ex","flowmet","FlowMet L360Ex","FMIPL-MTRM-WP2-TS2-F-S2-F1-FS-RS-SA-NA-EA-VI-FF2-CG1-CS1-DG-FLP-CGP2-NB","Flameproof digital+HART 40 Bar flange",["Hazardous areas","Zone 1/2"],"-30 to +150 C",-30,150,"-0.9 to 40 Bar",40,"N/A",0,0,"+/-2% FSD","SS 316","Flange End","SS 316","ASA 150# RF","Flameproof PESO IIA IIB IIC","3-Wire","4-20mA + HART","N/A","Integral","24VDC","Flameproof",[],["Flameproof PESO","Digital HART"],["24VDC required"],["PESO IIA IIB IIC"],true,false,false,false,true,"SS316",{tubeMoc:"SS 316",floatMoc:"SS 316",scaleMoc:"Aluminium",enclosureMoc:"Aluminium",guideRodMoc:"SS 316",jacketing:"N/A",protectionCover:"Transparent Acrylic/Glass",f2fHeight:"250+/-10 mm",installation:"Vertical",outputType:"Digital 4-20mA+HART"}),
  m("met-l360exf","flowmet","FlowMet L360ExF","FMIPL-MTRM-WP2-TS2-S2-FS-RS-JNA-SA-NA-EA-DG-VI-FF2-CG1-CS1-FLP-CGP2-NB","Flameproof digital+HART 200 Bar threaded",["Hazardous high pressure"],"-30 to +350 C",-30,350,"-0.9 to 200 Bar",200,"N/A",0,0,"+/-2% FSD","SS 316","Threaded","SS 316","BSP (M)","Flameproof PESO IIA IIB IIC","3-Wire","4-20mA + HART","N/A","Integral","24VDC","Flameproof",[],["Flameproof + High pressure 200","Digital HART"],["24VDC required"],["PESO IIA IIB IIC"],true,false,false,true,true,"SS316",{tubeMoc:"SS 316",floatMoc:"SS 316",scaleMoc:"Aluminium",enclosureMoc:"Aluminium",guideRodMoc:"SS 316",jacketing:"Not Applicable",protectionCover:"Transparent Acrylic/Glass",f2fHeight:"250+/-10 mm",installation:"Vertical",outputType:"Digital 4-20mA+HART"}),
  m("met-l360f","flowmet","FlowMet L360F","FMIPL-MTRM-WP2-TS2-S2-FS-RS-JNA-SA-NA-EA-DG-VI-FF2-CG1-CS1-WP-CGP1-NB","Digital+HART weatherproof 200 Bar threaded",["High pressure digital output"],"-30 to +350 C",-30,350,"-0.9 to 200 Bar",200,"N/A",0,0,"+/-2% FSD","SS 316","Threaded","SS 316","BSP (M)","Weatherproof Alu Die Cast","3-Wire","4-20mA + HART","N/A","Integral","24VDC","IP67 Weatherproof",[],["High pressure 200","Digital HART"],["24VDC required"],["Weatherproof"],false,false,false,true,false,"SS316",{tubeMoc:"SS 316",floatMoc:"SS 316",scaleMoc:"Aluminium",enclosureMoc:"Aluminium",guideRodMoc:"SS 316",jacketing:"Not Applicable",protectionCover:"Transparent Acrylic/Glass",f2fHeight:"250+/-10 mm",installation:"Vertical",outputType:"Digital 4-20mA+HART"}),
  m("met-l600","flowmet","FlowMet L600","FMIPL-MTRM-TS2-F-S2-F1-FT-RT-SA-PL-EA-VI-FF2-CG1-CS1-AG-WP-CGP1-NB","PTFE-lined analogue 40 Bar flange",["Corrosive liquids","Acid/alkali"],"-30 to +150 C",-30,150,"-0.9 to 40 Bar",40,"N/A",0,0,"+/-2% FSD","SS 316 + PTFE Coating","Flange End","SS 316","ASA 150# RF","Weatherproof Alu Die Cast","2-Wire","Analogue (local indicator)","N/A","Integral","N/A","IP67 Weatherproof",[],["PTFE lined","Corrosion resistant","Analogue"],["No 4-20mA output"],["Weatherproof"],false,false,false,false,false,"PTFE Coated SS316",{tubeMoc:"SS 316 + PTFE",floatMoc:"SS 316 + PTFE",scaleMoc:"Aluminium",enclosureMoc:"Aluminium",guideRodMoc:"Teflon",jacketing:"N/A",lining:"PTFE",protectionCover:"Transparent Acrylic/Glass",f2fHeight:"250+/-10 mm",installation:"Vertical",outputType:"Analogue"}),
  m("met-l600f","flowmet","FlowMet L600F","FMIPL-MTRM-TS2-S2-FT-RT-SA-PL-EA-VI-FF2-CG1-CS1-AG-WP-CGP1-NB","PTFE-lined analogue 400 Bar threaded/flange",["High pressure corrosive"],"-30 to +150 C",-30,150,"-0.9 to 400 Bar",400,"N/A",0,0,"+/-2% FSD","SS 316 + PTFE Coating","Threaded/Flange","SS 316","BSP/NPT/ASA 300/600","Weatherproof Alu Die Cast","2-Wire","Analogue (local indicator)","N/A","Integral","N/A","IP67 Weatherproof",[],["PTFE lined","Ultra high pressure 400"],["No 4-20mA output"],["Weatherproof"],false,false,false,true,false,"PTFE Coated SS316",{tubeMoc:"SS 316 + PTFE",floatMoc:"SS 316 + PTFE",scaleMoc:"Aluminium",enclosureMoc:"Aluminium",guideRodMoc:"Teflon",jacketing:"N/A",lining:"PTFE",protectionCover:"Transparent Acrylic/Glass",f2fHeight:"250+/-10 mm",installation:"Vertical",outputType:"Analogue"}),
  m("met-l630","flowmet","FlowMet L630","FMIPL-MTRM-TS2-F-S2-F1-FT-RT-SA-PL-EA-VI-FF2-CG1-CS1-DG-WP-CGP1-NB","PTFE-lined digital+HART 40 Bar flange",["Corrosive liquids digital output"],"-30 to +150 C",-30,150,"-0.9 to 40 Bar",40,"N/A",0,0,"+/-2% FSD","SS 316 + PTFE Coating","Flange End","SS 316","ASA 150# RF","Weatherproof Alu Die Cast","3-Wire","4-20mA + HART","N/A","Integral","24VDC","IP67 Weatherproof",[],["PTFE lined","Digital HART","Corrosion resistant"],["24VDC required"],["Weatherproof"],false,false,false,false,false,"PTFE Coated SS316",{tubeMoc:"SS 316 + PTFE",floatMoc:"SS 316 + PTFE",scaleMoc:"Aluminium",enclosureMoc:"Aluminium",guideRodMoc:"Teflon",jacketing:"N/A",lining:"PTFE",protectionCover:"Transparent Acrylic/Glass",f2fHeight:"250+/-10 mm",installation:"Vertical",outputType:"Digital 4-20mA+HART"}),
  m("met-l630ex","flowmet","FlowMet L630Ex","FMIPL-MTRM-TS2-F-S2-F1-FT-RT-SA-PL-EA-VI-FF2-CG1-CS1-DG-FLP-CGP1-NB","PTFE-lined flameproof digital+HART 40 Bar",["Hazardous corrosive liquids"],"-30 to +150 C",-30,150,"-0.9 to 40 Bar",40,"N/A",0,0,"+/-2% FSD","SS 316 + PTFE Coating","Flange End","SS 316","ASA 150# RF","Flameproof PESO IIA IIB IIC","3-Wire","4-20mA + HART","N/A","Integral","24VDC","Flameproof",[],["PTFE lined","Flameproof PESO","Digital HART"],["24VDC required"],["PESO IIA IIB IIC"],true,false,false,false,true,"PTFE Coated SS316",{tubeMoc:"SS 316 + PTFE",floatMoc:"SS 316 + PTFE",scaleMoc:"Aluminium",enclosureMoc:"Aluminium",guideRodMoc:"Teflon",jacketing:"N/A",lining:"PTFE",protectionCover:"Transparent Acrylic/Glass",f2fHeight:"250+/-10 mm",installation:"Vertical",outputType:"Digital 4-20mA+HART"}),
  m("met-l630exf","flowmet","FlowMet L630ExF","FMIPL-MTRM-TS2-S2-FT-RT-SA-PL-EA-VI-FF2-CG1-CS1-DG-FLP-CGP2-NB","PTFE-lined flameproof 400 Bar threaded/flange",["Hazardous ultra high pressure corrosive"],"-30 to +150 C",-30,150,"-0.9 to 400 Bar",400,"N/A",0,0,"+/-2% FSD","SS 316 + PTFE Coating","Threaded/Flange","SS 316","BSP/NPT/ASA 300/600","Flameproof PESO IIA IIB IIC","3-Wire","4-20mA + HART","N/A","Integral","24VDC","Flameproof",[],["PTFE lined","Flameproof + Ultra high 400"],["24VDC required"],["PESO IIA IIB IIC"],true,false,false,true,true,"PTFE Coated SS316",{tubeMoc:"SS 316 + PTFE",floatMoc:"SS 316 + PTFE",scaleMoc:"Aluminium",enclosureMoc:"Aluminium",guideRodMoc:"Teflon",jacketing:"N/A",lining:"PTFE",protectionCover:"Transparent Acrylic/Glass",f2fHeight:"250+/-10 mm",installation:"Vertical",outputType:"Digital 4-20mA+HART"}),
  m("met-l630f","flowmet","FlowMet L630F","FMIPL-MTRM-TS2-S2-FT-RT-SA-PL-EA-VI-FF2-CG1-CS1-DG-WP-CGP1-NB","PTFE-lined digital+HART 400 Bar threaded/flange",["Ultra high pressure corrosive digital"],"-30 to +150 C",-30,150,"-0.9 to 400 Bar",400,"N/A",0,0,"+/-2% FSD","SS 316 + PTFE Coating","Threaded/Flange","SS 316","BSP/NPT/ASA 300/600","Weatherproof Alu Die Cast","3-Wire","4-20mA + HART","N/A","Integral","24VDC","IP67 Weatherproof",[],["PTFE lined","Ultra high 400","Digital HART"],["24VDC required"],["Weatherproof"],false,false,false,true,false,"PTFE Coated SS316",{tubeMoc:"SS 316 + PTFE",floatMoc:"SS 316 + PTFE",scaleMoc:"Aluminium",enclosureMoc:"Aluminium",guideRodMoc:"Teflon",jacketing:"N/A",lining:"PTFE",protectionCover:"Transparent Acrylic/Glass",f2fHeight:"250+/-10 mm",installation:"Vertical",outputType:"Digital 4-20mA+HART"}),
  m("met-l900","flowmet","FlowMet L900","FMIPL-MTRM-WP2-TS2-S2-FS-RS-SA-NA-EA-WP-VI-FF2-CG1-CS1-CGP1-NB","Dual analogue+digital SS316 40 Bar TC/flange",["Hygienic industrial","F&B"],"-30 to +150 C",-30,150,"-0.9 to 40 Bar",40,"N/A",0,0,"+/-2% FSD","SS 316","Flange/TC Connection","SS 316","ASA 150#/TC","Weatherproof Alu Die Cast","3-Wire","Analogue + Digital 4-20mA+HART","N/A","Integral","24VDC","IP67 Weatherproof",[],["Dual output (Ana+Dig)","SS316","TC option"],["24VDC required"],["Weatherproof"],false,false,true,false,false,"SS316",{tubeMoc:"SS 316",floatMoc:"SS 316",scaleMoc:"Aluminium",enclosureMoc:"SS 304",guideRodMoc:"SS 316",jacketing:"N/A",protectionCover:"Transparent Acrylic/Glass",f2fHeight:"250+/-10 mm",installation:"Vertical",outputType:"Analogue + Digital"}),
];

// ═════════════════════════════════════════════════════════════════════════════
// FAMILY-SPECIFIC EXTRA TYPE DEFINITIONS
// ═════════════════════════════════════════════════════════════════════════════
export interface FlowValExtra {
  rotorMoc?: string; shaftMoc?: string; displayDetails?: string; readings?: string; screen?: string;
}
export interface FlowGTExtra {
  bodyMoc?: string; floatMoc?: string; scaleMoc?: string; scaleLength?: string;
  glandPacking?: string; bottomTop?: string; f2fHeight?: string; protectionCover?: string;
}
export interface FlowMetExtra {
  tubeMoc?: string; floatMoc?: string; scaleMoc?: string; enclosureMoc?: string;
  guideRodMoc?: string; jacketing?: string; lining?: string; protectionCover?: string;
  f2fHeight?: string; installation?: string; outputType?: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// WIZARD QUESTIONS PER FAMILY
// ═════════════════════════════════════════════════════════════════════════════
export interface WizardQuestion {
  id: string; question: string; type: "single" | "multi" | "number" | "boolean";
  options?: { value: string; label: string; exclude?: string[] }[];
  condition?: (answers: Record<string, any>) => boolean;
}

export const FAMILY_WIZARD_QUESTIONS: Record<string, WizardQuestion[]> = {
  flowmag: [
    { id: "fluid_type", question: "What type of fluid are you measuring?", type: "single", options: [{ value: "water", label: "Clean Water / Process Water" }, { value: "corrosive", label: "Corrosive / Wastewater" }, { value: "food", label: "Food & Beverage / Dairy" }] },
    { id: "conductivity", question: "What is the fluid conductivity?", type: "single", options: [{ value: "high", label: ">= 5 uS/cm (Conductive)" }, { value: "low", label: "< 5 uS/cm (Non-conductive) — EMF NOT SUITABLE" }] },
    { id: "hazardous", question: "Is the installation in a hazardous area?", type: "single", options: [{ value: "no", label: "No — Safe Area" }, { value: "yes", label: "Yes — Zone 1/2" }] },
    { id: "pressure", question: "What is the operating pressure?", type: "single", options: [{ value: "low", label: "0-15 Kg/cm2 (Standard)" }, { value: "medium", label: "15-25 Kg/cm2 (Medium)" }, { value: "high", label: ">25 Kg/cm2 (High Pressure)" }] },
    { id: "temp", question: "What is the operating temperature?", type: "single", options: [{ value: "normal", label: "-10 to +60 C" }, { value: "high", label: "+60 to +100 C" }] },
    { id: "power", question: "What power supply is available?", type: "single", options: [{ value: "ac", label: "230 VAC" }, { value: "dc", label: "24 VDC" }, { value: "battery", label: "Battery Only (Remote)" }] },
    { id: "hygienic", question: "Do you need hygienic/Tri-Clover connections?", type: "single", options: [{ value: "no", label: "No — Standard Flange" }, { value: "yes", label: "Yes — Tri-Clover / Sanitary" }] },
    { id: "lining", question: "Preferred lining material?", type: "single", options: [{ value: "ptfe", label: "PTFE (Standard, Chemical Resistant)" }, { value: "rubber", label: "Rubber (Water, Abrasion Resistant)" }] },
    { id: "pvc", question: "Do you need full PVC/CPVC construction?", type: "single", options: [{ value: "no", label: "No — Metal Construction" }, { value: "yes", label: "Yes — Full CPVC (Acid/Alkali)" }] },
  ],
  flowturb: [
    { id: "fluid_type", question: "What type of fluid are you measuring?", type: "single", options: [{ value: "clean", label: "Clean Liquids" }, { value: "hygienic", label: "Food & Beverage (Hygienic)" }, { value: "oem", label: "OEM/Sensor Only (No Display)" }] },
    { id: "conductivity", question: "Fluid conductivity?", type: "single", options: [{ value: "low", label: "Low/No Conductivity — Turbine Suitable" }, { value: "high", label: "High Conductivity — Consider EMF" }] },
    { id: "viscosity", question: "What is the fluid viscosity?", type: "single", options: [{ value: "low", label: "0-5 cP" }, { value: "medium", label: "5-10 cP" }] },
    { id: "hazardous", question: "Is the installation in a hazardous area?", type: "single", options: [{ value: "no", label: "No — Safe Area" }, { value: "yes", label: "Yes — Zone 1/2" }] },
    { id: "display", question: "Do you need a local display?", type: "single", options: [{ value: "yes", label: "Yes — With Display" }, { value: "no", label: "No — Sensor/Pickup Only" }] },
    { id: "connection", question: "Connection type?", type: "single", options: [{ value: "flange", label: "Flange End" }, { value: "threaded", label: "Threaded" }, { value: "tc", label: "Tri-Clover (Hygienic)" }] },
    { id: "power", question: "Power supply?", type: "single", options: [{ value: "ac", label: "230 VAC" }, { value: "dc", label: "24 VDC" }, { value: "battery", label: "Battery (Remote)" }] },
  ],
  flowswirl: [
    { id: "fluid_type", question: "What type of fluid?", type: "single", options: [{ value: "liquid_gas", label: "Liquids / Gases" }, { value: "steam", label: "Steam / High Temp" }] },
    { id: "pt_comp", question: "Do you need P&T compensation for mass flow?", type: "single", options: [{ value: "no", label: "No — Volumetric Only" }, { value: "yes", label: "Yes — Mass Flow / Energy Metering" }] },
    { id: "temp", question: "Operating temperature?", type: "single", options: [{ value: "normal", label: "-25 to +180 C" }, { value: "high", label: "+180 to +350 C (Superheated Steam)" }] },
    { id: "pressure", question: "Operating pressure?", type: "single", options: [{ value: "low", label: "0-30 Bar" }, { value: "high", label: ">30 Bar (Up to 150 Bar)" }] },
    { id: "hygienic", question: "Do you need hygienic/TC connections?", type: "single", options: [{ value: "no", label: "No — Standard Flange" }, { value: "yes", label: "Yes — Tri-Clover" }] },
    { id: "connection", question: "Connection type?", type: "single", options: [{ value: "flange", label: "Flange End" }, { value: "wafer", label: "Wafer" }, { value: "threaded", label: "Threaded" }] },
  ],
  flowval: [
    { id: "viscosity", question: "What is the fluid viscosity?", type: "single", options: [{ value: "high", label: "10-300 cP (High Viscosity)" }, { value: "low", label: "<10 cP — Consider Turbine/Vortex" }] },
    { id: "hazardous", question: "Is the installation in a hazardous area?", type: "single", options: [{ value: "no", label: "No — Safe Area" }, { value: "yes", label: "Yes — Zone 1/2" }] },
    { id: "pressure", question: "Operating pressure?", type: "single", options: [{ value: "normal", label: "0-30 Bar" }, { value: "high", label: ">30 Bar (Up to 300 Bar)" }] },
    { id: "display", question: "Do you need a local display?", type: "single", options: [{ value: "no", label: "No — Direct Pulse Output Only" }, { value: "yes", label: "Yes — LCD with Totalizer" }] },
    { id: "connection", question: "Connection type?", type: "single", options: [{ value: "threaded", label: "Threaded (1/4\" BSP)" }, { value: "flange", label: "Flange End / TC Connection" }] },
    { id: "moc", question: "Preferred material of construction?", type: "single", options: [{ value: "al", label: "Aluminium Anodized (Cost-effective)" }, { value: "ss316", label: "SS 316 (Corrosion Resistant)" }] },
    { id: "mounting", question: "Transmitter mounting?", type: "single", options: [{ value: "integral", label: "Integral" }, { value: "remote", label: "Remote" }] },
  ],
  flowgt: [
    { id: "fluid_type", question: "What type of fluid?", type: "single", options: [{ value: "clean", label: "Clean Water / Air / Gas" }, { value: "corrosive", label: "Corrosive / Acid / Alkali" }] },
    { id: "body_moc", question: "Body material preference?", type: "single", options: [{ value: "ms", label: "MS Powder Coated (Economical)" }, { value: "ss304", label: "SS 304" }, { value: "ss316", label: "SS 316 (Pharma/Corrosion)" }] },
    { id: "lining", question: "Do you need Teflon lining?", type: "single", options: [{ value: "no", label: "No — Standard" }, { value: "yes", label: "Yes — Teflon Lined (Corrosive)" }] },
    { id: "connection", question: "Connection type?", type: "single", options: [{ value: "flange", label: "Flange End" }, { value: "threaded", label: "Threaded (BSP/NPT)" }] },
    { id: "panel", question: "Is this for panel mounting?", type: "single", options: [{ value: "no", label: "No — Inline/Pipe Mount" }, { value: "yes", label: "Yes — Panel Mount (RP180)" }] },
  ],
  flowmet: [
    { id: "output", question: "What type of output do you need?", type: "single", options: [{ value: "analogue", label: "Analogue (Local Indicator Only)" }, { value: "digital", label: "Digital (4-20mA + HART)" }] },
    { id: "hazardous", question: "Is the installation in a hazardous area?", type: "single", options: [{ value: "no", label: "No — Safe Area" }, { value: "yes", label: "Yes — Zone 1/2" }] },
    { id: "pressure", question: "Operating pressure?", type: "single", options: [{ value: "low", label: "0-40 Bar" }, { value: "medium", label: "40-200 Bar" }, { value: "ultra", label: ">200 Bar (Up to 400 Bar)" }] },
    { id: "temp", question: "Operating temperature?", type: "single", options: [{ value: "normal", label: "-30 to +150 C" }, { value: "high", label: "+150 to +350 C" }] },
    { id: "lining", question: "Do you need PTFE lining for corrosion?", type: "single", options: [{ value: "no", label: "No — SS316 Standard" }, { value: "yes", label: "Yes — PTFE Lined" }] },
    { id: "connection", question: "Connection type?", type: "single", options: [{ value: "flange", label: "Flange End (ASA 150)" }, { value: "threaded", label: "Threaded (BSP)" }, { value: "tc", label: "TC Connection (Hygienic)" }] },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// SELECTION SCORING ENGINE
// ═════════════════════════════════════════════════════════════════════════════
export type Suitability = "recommended" | "suitable" | "alternative" | "not-suitable";

export interface ModelScore {
  model: ProductModel; score: number; suitability: Suitability; reasons: string[];
}

export function scoreModelsForFamily(familyId: string, answers: Record<string, any>): ModelScore[] {
  const models = ALL_MODELS.filter(m => m.family === familyId);
  const scores: ModelScore[] = [];

  for (const model of models) {
    let score = 50;
    const reasons: string[] = [];

    switch (familyId) {
      case "flowmag": {
        // Fluid type
        if (answers.fluid_type === "water" && model.id === "s660") { score += 20; reasons.push("Rubber-lined for water"); }
        else if (answers.fluid_type === "corrosive" && (model.id.startsWith("s900") || model.id === "s90")) { score += 20; reasons.push("Hastelloy/PTFE for corrosive"); }
        else if (answers.fluid_type === "food" && model.id.startsWith("s930")) { score += 20; reasons.push("Hygienic SS316 for F&B"); }
        // Hazardous
        if (answers.hazardous === "yes" && model.isFlameproof) { score += 20; reasons.push("Flameproof certified"); }
        else if (answers.hazardous === "no" && !model.isFlameproof) { score += 5; }
        // Pressure
        if (answers.pressure === "high" && model.isHighPressure) { score += 15; reasons.push("High pressure rated"); }
        else if (answers.pressure === "low" && !model.isHighPressure) { score += 5; }
        // Power
        if (answers.power === "battery" && model.isBatteryOperated) { score += 20; reasons.push("Battery operated"); }
        else if (answers.power !== "battery" && !model.isBatteryOperated) { score += 5; }
        // Hygienic
        if (answers.hygienic === "yes" && model.isHygienic) { score += 15; reasons.push("Hygienic connections"); }
        // PVC
        if (answers.pvc === "yes" && model.id === "s90") { score += 25; reasons.push("Full CPVC construction"); }
        // Lining
        if (answers.lining === "rubber" && model.liningMaterial?.includes("Rubber")) { score += 15; reasons.push("Rubber lined"); }
        else if (answers.lining === "ptfe" && model.liningMaterial?.includes("PTFE")) { score += 5; }
        break;
      }
      case "flowturb": {
        if (answers.hazardous === "yes" && model.isFlameproof) { score += 20; reasons.push("Flameproof certified"); }
        if (answers.display === "no" && model.id.startsWith("turb-l900")) { score += 20; reasons.push("Pickup sensor, no display"); }
        else if (answers.display === "yes" && !model.id.startsWith("turb-l900")) { score += 5; }
        if (answers.connection === "tc" && model.isHygienic) { score += 20; reasons.push("Tri-Clover connection"); }
        if (answers.power === "battery" && model.isBatteryOperated) { score += 20; reasons.push("Battery operated"); }
        if (answers.fluid_type === "hygienic" && model.isHygienic) { score += 15; reasons.push("Hygienic design"); }
        if (answers.connection === "threaded" && model.processConnectionType.includes("Threaded")) { score += 10; reasons.push("Threaded option"); }
        break;
      }
      case "flowswirl": {
        if (answers.pt_comp === "yes" && model.ptCompensation === "With") { score += 20; reasons.push("P&T compensation built-in"); }
        else if (answers.pt_comp === "no" && model.ptCompensation === "Without") { score += 5; }
        if (answers.temp === "high" && model.tempMaxC >= 350) { score += 20; reasons.push("High temp 350C rated"); }
        if (answers.pressure === "high" && model.isHighPressure) { score += 15; reasons.push("High pressure 150 Bar"); }
        if (answers.hygienic === "yes" && model.isHygienic) { score += 15; reasons.push("Tri-Clover hygienic"); }
        if (answers.connection === "wafer" && model.processConnectionType.includes("Wafer")) { score += 10; reasons.push("Wafer connection"); }
        break;
      }
      case "flowval": {
        if (answers.hazardous === "yes" && model.isFlameproof) { score += 20; reasons.push("Flameproof certified"); }
        if (answers.display === "no" && (model.id === "val-l270" || model.id === "val-l360")) { score += 15; reasons.push("Direct pulse, cost-effective"); }
        else if (answers.display === "yes" && model.id !== "val-l270" && model.id !== "val-l360") { score += 5; }
        if (answers.moc === "ss316" && model.processConnectionMoc === "SS 316") { score += 15; reasons.push("Full SS316 construction"); }
        else if (answers.moc === "al" && model.processConnectionMoc === "Aluminium Anodized") { score += 10; reasons.push("Aluminium cost-effective"); }
        if (answers.pressure === "high" && model.isHighPressure) { score += 15; reasons.push("High pressure 300 Bar"); }
        if (answers.connection === "flange" && model.processConnectionType.includes("Flange")) { score += 10; reasons.push("Flange connection"); }
        break;
      }
      case "flowgt": {
        if (answers.body_moc === "ms" && model.corrosionResistance.includes("MS")) { score += 10; reasons.push("MS body"); }
        else if (answers.body_moc === "ss304" && model.corrosionResistance.includes("SS304")) { score += 10; reasons.push("SS304 body"); }
        else if (answers.body_moc === "ss316" && model.corrosionResistance.includes("SS316")) { score += 10; reasons.push("SS316 body"); }
        if (answers.lining === "yes" && model.corrosionResistance.includes("Teflon")) { score += 20; reasons.push("Teflon lined for corrosion"); }
        else if (answers.lining === "no" && !model.corrosionResistance.includes("Teflon")) { score += 5; }
        if (answers.panel === "yes" && model.id === "gt-rp180") { score += 25; reasons.push("Panel mount design"); }
        else if (answers.panel === "no" && model.id !== "gt-rp180") { score += 5; }
        if (answers.connection === "threaded" && model.processConnectionType.includes("Threaded")) { score += 10; reasons.push("Threaded option"); }
        break;
      }
      case "flowmet": {
        if (answers.output === "analogue" && (model.id === "met-l180" || model.id === "met-l180f" || model.id === "met-l600" || model.id === "met-l600f")) { score += 15; reasons.push("Analogue output"); }
        else if (answers.output === "digital" && (model.id.includes("l360") || model.id.includes("l630") || model.id === "met-l900")) { score += 15; reasons.push("Digital 4-20mA+HART"); }
        if (answers.hazardous === "yes" && model.isFlameproof) { score += 20; reasons.push("Flameproof certified"); }
        if (answers.pressure === "ultra" && model.pressureMaxBar >= 400) { score += 20; reasons.push("Ultra high pressure 400 Bar"); }
        else if (answers.pressure === "medium" && model.pressureMaxBar >= 200 && model.pressureMaxBar < 400) { score += 10; reasons.push("High pressure 200 Bar"); }
        if (answers.temp === "high" && model.tempMaxC >= 350) { score += 15; reasons.push("High temp 350C rated"); }
        if (answers.lining === "yes" && model.corrosionResistance.includes("PTFE")) { score += 15; reasons.push("PTFE lined for corrosion"); }
        if (answers.connection === "tc" && model.processConnectionType.includes("TC")) { score += 10; reasons.push("TC connection"); }
        break;
      }
    }

    // Determine suitability
    let suitability: Suitability = "not-suitable";
    if (score >= 80) suitability = "recommended";
    else if (score >= 60) suitability = "suitable";
    else if (score >= 40) suitability = "alternative";

    scores.push({ model, score, suitability, reasons });
  }

  return scores.sort((a, b) => b.score - a.score);
}

// ═════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════
export function getModelsByFamily(familyId: string): ProductModel[] {
  return ALL_MODELS.filter(m => m.family === familyId);
}

export function getModelById(id: string): ProductModel | undefined {
  return ALL_MODELS.find(m => m.id === id);
}

export function getFamilies(): ProductFamily[] {
  return Object.values(PRODUCT_FAMILIES);
}

export function getFamilyById(id: string): ProductFamily | undefined {
  return PRODUCT_FAMILIES[id];
}

export function getSuitabilityColor(s: Suitability): string {
  switch (s) {
    case "recommended": return "#16a34a"; // green-600
    case "suitable": return "#2563eb"; // blue-600
    case "alternative": return "#d97706"; // amber-600
    case "not-suitable": return "#dc2626"; // red-600
  }
}

export function getSuitabilityBg(s: Suitability): string {
  switch (s) {
    case "recommended": return "#dcfce7"; // green-100
    case "suitable": return "#dbeafe"; // blue-100
    case "alternative": return "#fef3c7"; // amber-100
    case "not-suitable": return "#fee2e2"; // red-100
  }
}

export function getSuitabilityLabel(s: Suitability): string {
  switch (s) {
    case "recommended": return "RECOMMENDED";
    case "suitable": return "SUITABLE";
    case "alternative": return "ALTERNATIVE";
    case "not-suitable": return "NOT SUITABLE";
  }
}
