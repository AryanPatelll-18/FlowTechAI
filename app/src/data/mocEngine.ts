// ============================================================
// Flowtech AI MOC Selection Engine — Phase II (V3 REFINED)
// FULLY ALIGNED with Flowtech Product Catalogues
// Sources: EMF, Vortex, Turbine, Oval Gear, Glass/Metal Tube
// Rotameter, Ultrasonic — all from flowtech-instruments.com
// ============================================================

export interface MocRecommendation {
  // ── Electromagnetic Flowmeter ──
  // Liner MOC: PTFE or Rubber
  emfLiner: string[];
  // Electrode MOC: SS 316L, Hastelloy-C22, Tantalum
  emfElectrode: string[];

  // ── Turbine Flowmeter ──
  // Flow Pipe MOC: SS316 or Higher (non-magnetic)
  turbineFlowpipeMoc: string[];
  // Impeller MOC: SS 410 (Only Option)
  turbineRotor: string[];
  // Stopper MOC: SS 316 or Higher (non-magnetic)
  turbineStopper: string[];

  // ── Vortex Flowmeter ──
  // Flow Pipe MOC: SS 316 or Higher
  vortexBodyMoc: string[];
  // Shredder Part MOC: SS 316
  vortexShredder: string[];

  // ── Glass Tube Rotameter ──
  // Float MOC: Teflon, SS 316, SS 316L
  rotameterFloat: string[];
  // Float Retainer MOC: Teflon, SS 316, SS 316L
  rotameterFloatRetainer: string[];
  // Process Connection MOC: PP, CS, SS 304, SS 316, SS 316L
  rotameterEndFitting: string[];

  // ── Oval Gear (kept for completeness) ──
  ovalGearRotor: string[];
  ovalGearShaft: string[];

  // ── Ultrasonic (kept for completeness) ──
  ultrasonicHousing: string[];
  ultrasonicWettedParts: string[];

  // ── Common ──
  gaskets: string[];
  // Flowtech model codes for ordering — populated based on selections
  modelCodes: Record<string, string>;
  // Special alloy flags — true when non-standard material is REQUIRED
  specialAlloys: {
    hastelloy: boolean;
    tantalum: boolean;
    titanium: boolean;
    ptfeLined: boolean;
    ceramic: boolean;
    tungstenCarbide: boolean;
  };
  corrosionLevel: "Low" | "Medium" | "High" | "Extreme";
  specialNotes: string;
  warnings: string[];
}

export type FluidService = "liquid" | "gas" | "steam";

export interface FluidInfo {
  name: string;
  formula: string;
  category: string;
  conductivity?: boolean;
  notes?: string;
  service: FluidService;
}

// ============================================================
// FLOWTECH PRODUCT OPTION CONSTANTS
// ============================================================

const FT_ELECTRODE = {
  ss316l: { name: "SS 316L", code: "EL 2", for: "General purpose, water, mild chemicals" },
  hastelloyC: { name: "Hastelloy 'C'", code: "EL 3", for: "Strong acids, chlorides, oxidizing environments" },
  tantalum: { name: "Tantalum", code: "EL 4", for: "Hot concentrated acids (HCl, H₂SO₄, HNO₃)" },
  titanium: { name: "Titanium", code: "EL 5", for: "Seawater, chlorides, wet chlorine" },
  platinum: { name: "Platinum-Iridium", code: "EL 6", for: "High temp oxidizing, food/pharma" },
};

const FT_LINER = {
  rubber: { name: "Hard Rubber (Neoprene/Ebonite)", code: "RL", for: "Water, wastewater, mild chemicals (<80°C)" },
  ptfe: { name: "PTFE", code: "PL", for: "Corrosive chemicals, acids, alkalis (<130°C)" },
  pfa: { name: "PFA", code: "PA", for: "High purity, aggressive chemicals (<180°C)" },
  ceramic: { name: "Ceramic", code: "CE", for: "Extreme abrasion, slurries, high temp" },
  pu: { name: "Polyurethane (PU)", code: "PU", for: "Abrasive slurries, mining" },
};

// (Tube MOC constant removed — not part of specified EMF contact parts)

// NOTE: Flowtech Turbine Rotor is FIXED to SS 410 (martensitic, magnetic for pickup coil detection)
const FT_ROTOR_TURBINE = {
  ss410: { name: "SS 410 (Fixed)", code: "RM1", for: "All services — fixed manufacturing spec" },
};

// (Shaft and Bearing constants removed — not part of specified contact parts)

const FT_FLOAT = {
  ss316: { name: "SS 316", code: "FM1", for: "Water, oils, general chemicals" },
  ss316l: { name: "SS 316L", code: "FM2", for: "Corrosive liquids, food/pharma" },
  ss304: { name: "SS 304", code: "FM3", for: "Non-corrosive, water" },
  hastelloyC: { name: "Hastelloy 'C'", code: "FM4", for: "Strong acids, chlorides" },
  titanium: { name: "Titanium", code: "FM5", for: "Seawater, chlorides, wet chlorine" },
  tantalum: { name: "Tantalum", code: "FM9", for: "Hot concentrated acids" },
  ptfe: { name: "PTFE", code: "FM6", for: "HF, extreme chemicals, non-stick" },
  aluminium: { name: "Aluminium", code: "FM7", for: "Non-corrosive, lightweight, H₂O₂" },
  pp: { name: "P.P. (Polypropylene)", code: "FM8", for: "Dilute acids, alkalis, low cost" },
};

const FT_VORTEX_BODY = {
  ss304: { name: "SS 304", code: "FT1", for: "General service — default" },
  ss316: { name: "SS 316", code: "FT2", for: "Corrosive service" },
  ss316l: { name: "SS 316L", code: "FT3", for: "High chloride, marine" },
};

// (Vortex connection constant removed — not part of specified contact parts)

// ============================================================
// HELPER: Build model code string from selections
// ============================================================
function buildModelCodes(r: MocRecommendation): Record<string, string> {
  return {
    emfLiner: r.emfLiner[0]?.match(/\(([^)]+)\)/)?.[1] || "RL",
    emfElectrode: r.emfElectrode[0]?.match(/\(([^)]+)\)/)?.[1] || "EL 2",
    vortexBody: r.vortexBodyMoc[0]?.match(/\(([^)]+)\)/)?.[1] || "FT2",
    vortexShredder: r.vortexShredder[0]?.match(/\(([^)]+)\)/)?.[1] || "SH1",
    turbineRotor: "RM1",
    turbineFlowpipe: r.turbineFlowpipeMoc[0]?.match(/\(([^)]+)\)/)?.[1] || "SM1",
    turbineStopper: r.turbineStopper[0]?.match(/\(([^)]+)\)/)?.[1] || "ST1",
    ovalGearRotor: r.ovalGearRotor[0]?.match(/\(([^)]+)\)/)?.[1] || "RM1",
    rotameterFloat: r.rotameterFloat[0]?.match(/\(([^)]+)\)/)?.[1] || "FM1",
    rotameterFloatRetainer: r.rotameterFloatRetainer[0]?.match(/\(([^)]+)\)/)?.[1] || "FR1",
    rotameterConn: r.rotameterEndFitting[0]?.match(/\(([^)]+)\)/)?.[1] || "EF4",
  };
}

// ============================================================
// MAIN DECISION ENGINE
// ============================================================
export function getMocRecommendation(fluid: FluidInfo): MocRecommendation {
  const n = fluid.name.toLowerCase();
  const f = (fluid.formula || "").toLowerCase();
  const nl = (fluid.notes || "").toLowerCase();
  const cat = fluid.category;
  const svc = fluid.service;

  const r: MocRecommendation = {
    // ── Electromagnetic Flowmeter ──
    emfLiner: [`${FT_LINER.rubber.name} (${FT_LINER.rubber.code} — Default)`, `${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`, `${FT_LINER.pfa.name} (${FT_LINER.pfa.code})`],
    emfElectrode: [`${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code} — Default)`],

    // ── Turbine Flowmeter ──
    turbineFlowpipeMoc: ["SS 316 (SM1 — Default)", "SS 316L (SM2)", "SS 304 (SM0)"],
    turbineRotor: [`${FT_ROTOR_TURBINE.ss410.name} (${FT_ROTOR_TURBINE.ss410.code} — Fixed)`],
    turbineStopper: ["SS 316 (ST1 — Default)", "SS 316L (ST2)", "SS 304 (ST0)"],

    // ── Vortex Flowmeter ──
    vortexBodyMoc: [`${FT_VORTEX_BODY.ss316.name} (${FT_VORTEX_BODY.ss316.code} — Default)`, `${FT_VORTEX_BODY.ss304.name} (${FT_VORTEX_BODY.ss304.code})`, `${FT_VORTEX_BODY.ss316l.name} (${FT_VORTEX_BODY.ss316l.code})`],
    vortexShredder: ["SS 316 (SH1 — Default)", "SS 316L (SH2)", "SS 304 (SH0)"],

    // ── Glass Tube Rotameter ──
    rotameterFloat: [`${FT_FLOAT.ss316.name} (${FT_FLOAT.ss316.code} — Default)`, `${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code})`, `${FT_FLOAT.ptfe.name} (${FT_FLOAT.ptfe.code} — Teflon)`],
    rotameterFloatRetainer: ["SS 316 (FR1 — Default)", "SS 316L (FR2)", "PTFE (FR6 — Teflon)"],
    rotameterEndFitting: ["SS 316 (EF4 — Default)", "SS 304 (EF3)", "CS (EF1)", "PP (EF6)", "SS 316L (EF5)"],

    // ── Oval Gear ──
    ovalGearRotor: ["Aluminium Anodized (RM1 — Default)", "SS 316 (RM2)", "SS 316L (RM3)"],
    ovalGearShaft: ["SS 316 (SM1 — Default)", "SS 316L (SM2)"],

    // ── Ultrasonic ──
    ultrasonicHousing: ["SS 316 (Standard)", "Aluminium (Lightweight)"],
    ultrasonicWettedParts: ["SS 316", "SS 316L", "Titanium"],

    // ── Common ──
    gaskets: ["Nitrile (NBR)", "PTFE", "Viton (FKM)", "Graphite", "Spiral Wound SS 316"],
    modelCodes: {},
    specialAlloys: { hastelloy: false, tantalum: false, titanium: false, ptfeLined: false, ceramic: false, tungstenCarbide: false },
    corrosionLevel: "Low",
    specialNotes: "",
    warnings: [],
  };

  if (svc === "liquid") handleLiquid(n, f, nl, cat, r);
  else if (svc === "gas") handleGas(n, f, nl, cat, r);
  else if (svc === "steam") handleSteam(r);

  // Populate model codes based on final selections
  r.modelCodes = buildModelCodes(r);

  return r;
}

// ============================================================
// LIQUID HANDLER — COMPREHENSIVE FLUID-SPECIFIC FLOWTECH MOC
// ============================================================
function handleLiquid(n: string, f: string, nl: string, cat: string, r: MocRecommendation) {
  // ── Detection flags ──
  const hasCl = f.includes("cl") || ["chloride", "chlorine", "hydrochloric", "sodium hypochlorite", "ferric chloride", "brine", "seawater", "salt water"].some(w => n.includes(w));
  const hasH2so4 = f.includes("h₂so₄") || f.includes("h2so4") || n.includes("sulfuric");
  const hasHno3 = f.includes("hno₃") || f.includes("hno3") || n.includes("nitric");
  const hasHf = f.includes("hf") || n.includes("hydrofluoric");
  const hasH3po4 = f.includes("h₃po₄") || f.includes("h3po4") || n.includes("phosphoric");
  const hasHcl = hasCl || n.includes("hydrochloric") || n.includes("pickling");
  const hasCaustic = ["caustic soda", "caustic potash", "sodium hydroxide", "potassium hydroxide", "lye"].some(w => n.includes(w));
  const hasAmmonia = f.includes("nh₃") || f.includes("nh4") || (n.includes("ammonia") && !n.includes("liquid ammonia"));
  const isStrongAcid = hasHcl || hasH2so4 || hasHno3 || hasHf || hasH3po4 || n.includes("aqua regia") || n.includes("chromic") || n.includes("mixed acid");
  const isWeakAcid = n.includes("acetic") || n.includes("citric") || n.includes("formic") || n.includes("carbonic") || n.includes("tannic");
  const isSlurry = n.includes("slurry") || n.includes("sludge") || n.includes("pulp") || n.includes("mud");
  const isBrine = n.includes("brine") || (hasCl && n.includes("solution"));
  const isCryo = cat === "Cryogenic" || n.includes("liquid nitrogen") || n.includes("liquid oxygen") || n.includes("liquid argon");
  const isFood = cat === "Food & Beverage" || cat === "Pharmaceutical";
  const isOil = cat === "Oil" || cat === "Fuel" || ["diesel", "petrol", "kerosene", "gasoline", "fuel", "lube oil", "lubricating", "turbine oil", "hydraulic oil", "transformer oil", "cutting oil"].some(w => n.includes(w));
  const isHeavyOil = n.includes("heavy fuel") || n.includes("bitumen") || n.includes("bunker") || n.includes("asphalt") || n.includes("residual oil");
  const isH2o2 = n.includes("hydrogen peroxide");
  const isSolvent = cat === "Solvent" || ["acetone", "methanol", "ethanol", "isopropyl", "toluene", "benzene", "xylene", "ethyl acetate", "methyl ethyl ketone", "mek", "thinner"].some(w => n.includes(w));
  const isRefrigerant = cat === "Refrigerant" || n.includes("freon") || n.includes("r-");
  const isSugar = n.includes("sugar") || n.includes("syrup") || n.includes("molasses") || n.includes("honey") || n.includes("glucose") || n.includes("fructose");
  const isPaint = n.includes("paint") || n.includes("ink") || n.includes("resin") || n.includes("varnish") || n.includes("lacquer") || n.includes("coating");
  const isAlcohol = n.includes("methanol") || n.includes("ethanol") || n.includes("isopropyl") || n.includes("butanol") || n.includes("glycol") || n.includes("glycerol") || n.includes("glycerine");

  // ===== WATER =====
  if (cat === "Water") {
    handleWater(n, f, r);
  }
  // ===== STRONG ACIDS =====
  else if (isStrongAcid) {
    handleStrongAcid(n, f, hasHf, hasHcl, hasH2so4, hasHno3, hasH3po4, r);
  }
  // ===== WEAK ACIDS =====
  else if (isWeakAcid) {
    handleWeakAcid(n, r);
  }
  // ===== ALKALIS =====
  else if (hasCaustic || cat === "Alkali") {
    handleAlkali(n, hasAmmonia, r);
  }
  else if (hasAmmonia) {
    applyAmmoniaMoc(r);
  }
  // ===== BRINES & SEAWATER =====
  else if (isBrine || (hasCl && cat === "Inorganic Salt")) {
    handleBrine(n, r);
  }
  // ===== SLURRIES =====
  else if (isSlurry) {
    handleSlurry(n, r);
  }
  // ===== CRYOGENIC =====
  else if (isCryo) {
    handleCryogenic(r);
  }
  // ===== FOOD & PHARMA =====
  else if (isFood) {
    handleFoodPharma(r);
  }
  // ===== OILS & FUELS =====
  else if (isOil) {
    handleOil(n, isHeavyOil, r);
  }
  // ===== SOLVENTS =====
  else if (isSolvent) {
    handleSolvent(n, isAlcohol, r);
  }
  // ===== REFRIGERANTS =====
  else if (isRefrigerant) {
    handleRefrigerant(r);
  }
  // ===== SUGAR SOLUTIONS =====
  else if (isSugar) {
    handleSugar(r);
  }
  // ===== PAINT / INK / COATING =====
  else if (isPaint) {
    handlePaint(r);
  }
  // ===== H₂O₂ =====
  else if (isH2o2) {
    handleH2O2(r);
  }

  // ── Temperature-based overrides ──
  // High temperature affects liner and gasket selection
  if (nl.includes("temp") || nl.includes("temperature")) {
    // Already have temp info from notes
  }

  // General rotameter float guidance based on fluid category
  setRotameterDefaults(r, n, isStrongAcid, hasCl, isFood, isOil, isSolvent);
}

// ===== WATER HANDLER =====
function handleWater(n: string, _f: string, r: MocRecommendation) {
  if (["demineralized", "distilled", "deionized", "ro permeate"].some(w => n.includes(w))) {
    r.emfLiner = [`${FT_LINER.rubber.name} (${FT_LINER.rubber.code})`];
    r.specialNotes = "Low conductivity — EMF signal may be reduced. PTFE liner (PL) recommended for better performance.";
  } else if (n.includes("sea water") || n.includes("brackish") || n.includes("sea-water")) {
    r.emfElectrode = [`${FT_ELECTRODE.titanium.name} (${FT_ELECTRODE.titanium.code})`, `${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`];
    r.emfLiner = [`${FT_LINER.rubber.name} (${FT_LINER.rubber.code})`, `${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`];
    r.rotameterFloat = [`${FT_FLOAT.titanium.name} (${FT_FLOAT.titanium.code})`, `${FT_FLOAT.hastelloyC.name} (${FT_FLOAT.hastelloyC.code})`];
    r.vortexBodyMoc = [`${FT_VORTEX_BODY.ss316.name} (${FT_VORTEX_BODY.ss316.code})`, `${FT_VORTEX_BODY.ss316l.name} (${FT_VORTEX_BODY.ss316l.code})`];
    r.vortexShredder = ["SS 316L (SH2)"];
    r.corrosionLevel = "Medium";
    r.specialAlloys.titanium = true;
    r.warnings.push("Chloride content — Flowtech Titanium electrode (EL 5) or Hastelloy 'C' (EL 3) required");
  } else if (["boiler", "condensate", "hot water", "feed water"].some(w => n.includes(w))) {
    r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code} — max 130°C)", "${FT_LINER.pfa.name} (${FT_LINER.pfa.code} — max 180°C)`];
    r.gaskets = ["Graphite", "Spiral Wound SS 316"];
    r.specialNotes = "High temperature — select PFA liner (PA) for >130°C. Graphite or spiral wound gaskets required.";
  } else {
    // General water — standard defaults
    r.gaskets = ["Nitrile (NBR — Default)", "EPDM"];
  }
}

// ===== STRONG ACID HANDLER =====
function handleStrongAcid(n: string, _f: string, hasHf: boolean, hasHcl: boolean, hasH2so4: boolean, hasHno3: boolean, hasH3po4: boolean, r: MocRecommendation) {
  r.corrosionLevel = "High";
  r.gaskets = ["PTFE (PK2)"];
  r.specialAlloys.ptfeLined = true;

  if (hasHf) {
    // HF attacks glass, ceramics, and most metals
    r.emfElectrode = [`${FT_ELECTRODE.tantalum.name} (${FT_ELECTRODE.tantalum.code})`];
    r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`, `${FT_LINER.pfa.name} (${FT_LINER.pfa.code})`];
    r.rotameterFloat = [`${FT_FLOAT.ptfe.name} (${FT_FLOAT.ptfe.code})`];
    r.rotameterFloatRetainer = ["PTFE (FR6 — HF Service)", "SS 316L (FR2)"];
    r.vortexBodyMoc = [`${FT_VORTEX_BODY.ss316.name} (${FT_VORTEX_BODY.ss316.code})`];
    r.turbineFlowpipeMoc = ["SS 316L (SM2 — HF Service)", "SS 316 (SM1)"];
    r.turbineStopper = ["SS 316L (ST2 — HF Service)", "SS 316 (ST1)"];
    r.corrosionLevel = "Extreme";
    r.specialAlloys.tantalum = true;
    r.specialAlloys.ptfeLined = true;
    r.warnings.push("HF attacks glass/ceramics — Flowtech PTFE liner (PL) + PTFE float (FM6) REQUIRED");
    r.warnings.push("HF: NEVER use glass rotameter — use metal tube only");
    r.warnings.push("Tantalum electrode (EL 4) only — SS316L (EL 2) will fail");
  } else if (hasHcl || n.includes("pickling")) {
    const isConc = n.includes("30%") || n.includes("37%") || n.includes("concentrated");
    r.emfElectrode = isConc
      ? [`${FT_ELECTRODE.tantalum.name} (${FT_ELECTRODE.tantalum.code})`, `${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`]
      : [`${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`, `${FT_ELECTRODE.tantalum.name} (${FT_ELECTRODE.tantalum.code})`];
    r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`, `${FT_LINER.pfa.name} (${FT_LINER.pfa.code})`];
    r.rotameterFloat = [`${FT_FLOAT.hastelloyC.name} (${FT_FLOAT.hastelloyC.code})`, `${FT_FLOAT.titanium.name} (${FT_FLOAT.titanium.code})`, `${FT_FLOAT.tantalum.name} (${FT_FLOAT.tantalum.code})`];
    r.vortexBodyMoc = [`${FT_VORTEX_BODY.ss316.name} (${FT_VORTEX_BODY.ss316.code})`, `${FT_VORTEX_BODY.ss316l.name} (${FT_VORTEX_BODY.ss316l.code})`];
    r.specialAlloys.hastelloy = true;
    r.specialAlloys.tantalum = isConc;
    r.warnings.push("HCl — Flowtech Hastelloy 'C' electrode (EL 3) or Tantalum (EL 4) required");
    if (isConc) {
      r.corrosionLevel = "Extreme";
      r.warnings.push("Concentrated HCl — Tantalum electrode (EL 4) strongly recommended");
    }
  } else if (hasH2so4) {
    const isConc98 = n.includes("98%") || n.includes("95%") || n.includes("concentrated");
    const isConc85 = n.includes("85%") || n.includes("80%");
    if (isConc98 || isConc85) {
      r.emfElectrode = [`${FT_ELECTRODE.tantalum.name} (${FT_ELECTRODE.tantalum.code})`, `${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`];
      r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`, `${FT_LINER.pfa.name} (${FT_LINER.pfa.code})`];
      r.rotameterFloat = [`${FT_FLOAT.tantalum.name} (${FT_FLOAT.tantalum.code})`, `${FT_FLOAT.hastelloyC.name} (${FT_FLOAT.hastelloyC.code})`];
      r.specialAlloys.tantalum = true;
      r.warnings.push("Concentrated H₂SO₄ — Tantalum electrode (EL 4) or Hastelloy 'C' (EL 3) required");
    } else if (n.includes("50%") || n.includes("dilute")) {
      r.emfElectrode = [`${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`];
      r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`];
      r.rotameterFloat = [`${FT_FLOAT.hastelloyC.name} (${FT_FLOAT.hastelloyC.code})`, `${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code})`];
      r.specialAlloys.hastelloy = true;
    } else {
      r.emfElectrode = [`${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`, `${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code})`];
      r.corrosionLevel = "Medium";
    }
  } else if (hasHno3) {
    const isConc60 = n.includes("60%") || n.includes("65%") || n.includes("concentrated");
    r.emfElectrode = isConc60
      ? [`${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`, `${FT_ELECTRODE.tantalum.name} (${FT_ELECTRODE.tantalum.code})`]
      : [`${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code})`, `${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`];
    r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`, `${FT_LINER.pfa.name} (${FT_LINER.pfa.code})`];
    if (isConc60) {
      r.warnings.push("Concentrated HNO₃ — SS316L (EL 2) may suffer intergranular attack; Hastelloy 'C' (EL 3) recommended");
      r.specialAlloys.hastelloy = true;
    }
  } else if (hasH3po4) {
    r.emfElectrode = [`${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`, `${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code})`];
    r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`];
    r.rotameterFloat = [`${FT_FLOAT.hastelloyC.name} (${FT_FLOAT.hastelloyC.code})`, `${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code})`];
    r.specialAlloys.hastelloy = true;
    r.warnings.push("Phosphoric acid — Hastelloy 'C' electrode (EL 3) recommended for concentrations >30%");
  } else if (n.includes("aqua regia")) {
    r.emfElectrode = [`${FT_ELECTRODE.tantalum.name} (${FT_ELECTRODE.tantalum.code})`];
    r.emfLiner = [`${FT_LINER.pfa.name} (${FT_LINER.pfa.code})`];
    r.rotameterFloat = [`${FT_FLOAT.tantalum.name} (${FT_FLOAT.tantalum.code})`, `${FT_FLOAT.ptfe.name} (${FT_FLOAT.ptfe.code})`];
    r.rotameterFloatRetainer = ["PTFE (FR6 — Aqua Regia)", "Tantalum (FR9)"];
    r.corrosionLevel = "Extreme";
    r.specialAlloys.tantalum = true;
    r.specialAlloys.ptfeLined = true;
    r.warnings.push("Aqua regia dissolves gold — Tantalum electrode (EL 4) REQUIRED");
    r.warnings.push("Aqua regia: NEVER use glass rotameter — use metal tube only");
  } else if (n.includes("chromic")) {
    r.emfElectrode = [`${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`];
    r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`];
    r.specialAlloys.hastelloy = true;
  }
}

// ===== WEAK ACID HANDLER =====
function handleWeakAcid(n: string, r: MocRecommendation) {
  if (n.includes("acetic") && (n.includes("glacial") || n.includes("concentrated"))) {
    // Glacial acetic acid is fairly aggressive
    r.emfElectrode = [`${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`, `${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code})`];
    r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`];
    r.rotameterFloat = [`${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code})`, `${FT_FLOAT.hastelloyC.name} (${FT_FLOAT.hastelloyC.code})`];
    r.gaskets = ["PTFE (PK2)"];
    r.corrosionLevel = "Medium";
    r.warnings.push("Glacial acetic acid — Hastelloy 'C' electrode (EL 3) recommended");
  } else {
    // Dilute organic acids
    r.emfElectrode = [`${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code})`];
    r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`, `${FT_LINER.rubber.name} (${FT_LINER.rubber.code})`];
    r.rotameterFloat = [`${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code})`];
    r.gaskets = ["PTFE (PK2)", "EPDM"];
    r.corrosionLevel = "Low";
  }
}

// ===== ALKALI HANDLER =====
function handleAlkali(n: string, hasAmmonia: boolean, r: MocRecommendation) {
  r.corrosionLevel = "High";
  r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`, `${FT_LINER.pfa.name} (${FT_LINER.pfa.code})`];

  if (n.includes("50%") || n.includes("concentrated")) {
    r.emfElectrode = [`${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`, `${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code})`];
    r.warnings.push("50% caustic — Hastelloy 'C' electrode (EL 3) recommended over SS316L (EL 2)");
    r.specialAlloys.hastelloy = true;
  } else if (n.includes("30%")) {
    r.emfElectrode = [`${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code})`, `${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`];
  } else {
    r.emfElectrode = [`${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code})`];
  }

  r.rotameterFloat = [`${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code})`, `${FT_FLOAT.pp.name} (${FT_FLOAT.pp.code})`];
  r.gaskets = ["PTFE (PK2)", "Graphite"];

  if (hasAmmonia) applyAmmoniaMoc(r);
}

// ===== BRINE HANDLER =====
function handleBrine(_n: string, r: MocRecommendation) {
  r.corrosionLevel = "High";
  r.emfElectrode = [`${FT_ELECTRODE.titanium.name} (${FT_ELECTRODE.titanium.code})`, `${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`];
  r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`, `${FT_LINER.rubber.name} (${FT_LINER.rubber.code})`];
  r.vortexBodyMoc = [`${FT_VORTEX_BODY.ss316l.name} (${FT_VORTEX_BODY.ss316l.code})`];
  r.vortexShredder = ["SS 316L (SH2 — Chloride)"];
  r.rotameterFloat = [`${FT_FLOAT.titanium.name} (${FT_FLOAT.titanium.code})`, `${FT_FLOAT.hastelloyC.name} (${FT_FLOAT.hastelloyC.code})`];
  r.rotameterFloatRetainer = ["SS 316L (FR2 — Chloride)", "Titanium (FR5)"];
  r.turbineFlowpipeMoc = ["SS 316L (SM2 — Chloride)", "SS 316 (SM1)"];
  r.turbineStopper = ["SS 316L (ST2 — Chloride)", "SS 316 (ST1)"];
  r.gaskets = ["PTFE (PK2)", "Viton (PK4)"];
  r.specialAlloys.titanium = true;
  r.warnings.push("Chloride brine — Flowtech Titanium electrode (EL 5) or Hastelloy 'C' (EL 3) required");
  r.warnings.push("SS 316L (EL 2) may suffer pitting in chloride brine at elevated temperature");
}

// ===== SLURRY HANDLER =====
function handleSlurry(n: string, r: MocRecommendation) {
  r.corrosionLevel = "High";
  r.emfLiner = [`${FT_LINER.ceramic.name} (${FT_LINER.ceramic.code})`, `${FT_LINER.pu.name} (${FT_LINER.pu.code})`];
  r.emfElectrode = [`${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code} — coated)`];
  r.ovalGearRotor = ["SS 316 (RM2 — Abrasion Resistant)", "SS 316L (RM3)"];
  r.rotameterFloat = [`${FT_FLOAT.hastelloyC.name} (${FT_FLOAT.hastelloyC.code})`];
  r.rotameterFloatRetainer = ["SS 316L (FR2 — Abrasion)", "Hastelloy 'C' (FR4)"];
  r.specialAlloys.ceramic = true;
  r.warnings.push("Abrasive slurry — Flowtech Ceramic liner (CE) or PU liner recommended");

  if (n.includes("sand") || n.includes("cement") || n.includes("mining")) {
    r.corrosionLevel = "Extreme";
    r.emfLiner = [`${FT_LINER.ceramic.name} (${FT_LINER.ceramic.code} — Extreme Abrasion)`];
    r.warnings.push("Sand/cement slurry — Ceramic liner (CE) MANDATORY. Rubber liner will fail within days.");
  }
}

// ===== CRYOGENIC HANDLER =====
function handleCryogenic(r: MocRecommendation) {
  r.corrosionLevel = "Medium";
  r.gaskets = ["PTFE (PK2 — Cryo grade)", "Indium (Cryogenic)"];
  r.vortexBodyMoc = [`${FT_VORTEX_BODY.ss316.name} (${FT_VORTEX_BODY.ss316.code})`, `${FT_VORTEX_BODY.ss316l.name} (${FT_VORTEX_BODY.ss316l.code})`];
  r.turbineFlowpipeMoc = ["SS 316L (SM2 — Cryo)", "SS 316 (SM1)"];
  r.turbineStopper = ["SS 316L (ST2 — Cryo)", "SS 316 (ST1)"];
  r.specialNotes = "Cryogenic service — materials must retain ductility below -45°C. SS 316/316L required. Avoid carbon steel.";
}

// ===== FOOD & PHARMA HANDLER =====
function handleFoodPharma(r: MocRecommendation) {
  r.emfElectrode = [`${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code} — Food Grade)`];
  r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code} — FDA)", "PFA (${FT_LINER.pfa.code} — High Purity)`];
  r.rotameterFloat = [`${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code} — Food Grade)`];
  r.rotameterFloatRetainer = ["SS 316L (FR2 — Food Grade)", "SS 316 (FR1)"];
  r.gaskets = ["FDA PTFE", "EPDM (Food Grade)"];
  r.specialNotes = "Food/pharma — select sanitary Tri-Clover (TC) connections. FDA compliance required.";
}

// ===== OIL HANDLER =====
function handleOil(n: string, isHeavyOil: boolean, r: MocRecommendation) {
  r.emfLiner = [`${FT_LINER.rubber.name} (${FT_LINER.rubber.code})`];
  r.gaskets = ["Nitrile (NBR)", "Viton (PK4)"];
  r.rotameterFloat = [`${FT_FLOAT.ss316.name} (${FT_FLOAT.ss316.code})`];
  r.rotameterFloatRetainer = ["SS 316 (FR1)", "SS 316L (FR2)"];
  r.specialNotes = "Oil service — Viton gaskets recommended for aromatic hydrocarbons. Nitrile for paraffinic oils.";

  if (isHeavyOil) {
    r.specialNotes += " Heavy fuel/bitumen — high-temp gaskets required.";
  }

  if (n.includes("gasoline") || n.includes("petrol") || n.includes("naphtha") || n.includes("benzene")) {
    r.gaskets = ["Viton (PK4 — Aromatic Resistant)"];
    r.warnings.push("Aromatic hydrocarbons — Nitrile gaskets will swell. Viton (FKM) REQUIRED.");
  }
}

// ===== SOLVENT HANDLER =====
function handleSolvent(n: string, isAlcohol: boolean, r: MocRecommendation) {
  r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`];
  r.gaskets = ["PTFE (PK2)", "Viton (PK4)"];

  if (isAlcohol) {
    r.emfElectrode = [`${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code})`];
    r.rotameterFloat = [`${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code})`];
  } else if (n.includes("acetone") || n.includes("mek") || n.includes("methyl ethyl ketone")) {
    r.emfElectrode = [`${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code})`];
    r.rotameterFloat = [`${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code})`, `${FT_FLOAT.aluminium.name} (${FT_FLOAT.aluminium.code})`];
    r.gaskets = ["Viton (PK4)", "PTFE (PK2)"];
    r.warnings.push("Ketones — check Viton compatibility at elevated temperature");
  } else if (n.includes("toluene") || n.includes("benzene") || n.includes("xylene")) {
    r.gaskets = ["Viton (PK4 — Aromatic Resistant)"];
    r.rotameterFloat = [`${FT_FLOAT.ss316.name} (${FT_FLOAT.ss316.code})`];
    r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`, `${FT_LINER.pfa.name} (${FT_LINER.pfa.code})`];
  }

  r.specialNotes = "Solvent service — PTFE liner recommended. Verify gasket compatibility with specific solvent at operating temperature.";
}

// ===== REFRIGERANT HANDLER =====
function handleRefrigerant(r: MocRecommendation) {
  r.vortexBodyMoc = [`${FT_VORTEX_BODY.ss316.name} (${FT_VORTEX_BODY.ss316.code})`, `${FT_VORTEX_BODY.ss316l.name} (${FT_VORTEX_BODY.ss316l.code})`];
  r.turbineFlowpipeMoc = ["SS 316L (SM2 — Low Temp)", "SS 316 (SM1)"];
  r.gaskets = ["PTFE (PK2)", "Viton (PK4 — Low Temp)"];
  r.specialNotes = "Refrigerant service — low temperature gaskets required. Verify compatibility with specific refrigerant gas.";
}

// ===== SUGAR HANDLER =====
function handleSugar(r: MocRecommendation) {
  r.emfLiner = [`${FT_LINER.rubber.name} (${FT_LINER.rubber.code})`];
  r.emfElectrode = [`${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code} — Food Grade)`];
  r.rotameterFloat = [`${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code} — Food Grade)`];
  r.rotameterFloatRetainer = ["SS 316L (FR2 — Food Grade)", "SS 316 (FR1)"];
  r.gaskets = ["EPDM (Food Grade)", "Nitrile (NBR)"];
  r.specialNotes = "Sugar service — hygienic design required. CIP/SIP compatible materials. EPDM gaskets for hot wash cycles.";
}

// ===== PAINT / INK HANDLER =====
function handlePaint(r: MocRecommendation) {
  r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`];
  r.rotameterFloat = [`${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code})`, `${FT_FLOAT.hastelloyC.name} (${FT_FLOAT.hastelloyC.code})`];
  r.rotameterFloatRetainer = ["SS 316L (FR2 — Solvent)", "Hastelloy 'C' (FR4)"];
  r.gaskets = ["Viton (PK4 — Solvent Resistant)"];
  r.specialNotes = "Paint/ink — solvent-containing. Viton gaskets required for aromatic thinners. PTFE liner for easy cleaning.";
}

// ===== H₂O₂ HANDLER =====
function handleH2O2(r: MocRecommendation) {
  r.emfElectrode = [`${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code} — Passivated)`];
  r.rotameterFloat = [`${FT_FLOAT.aluminium.name} (${FT_FLOAT.aluminium.code})`, `${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code})`];
  r.rotameterFloatRetainer = ["Aluminium (FR7)", "SS 316L (FR2 — Passivated)"];
  r.corrosionLevel = "High";
  r.warnings.push("H₂O₂ decomposes on catalytic metal surfaces — Aluminium float (FM7) preferred for rotameter");
  r.warnings.push("Passivated SS 316L electrode (EL 2) required for EMF");
  r.specialNotes = "Hydrogen peroxide — avoid contaminants (Cu, Fe, Cr). Aluminium or passivated SS only.";
}

// ===== GAS HANDLER =====
function handleGas(n: string, f: string, nl: string, cat: string, r: MocRecommendation) {
  const hasAmmonia = n.includes("ammonia");
  const hasChlorine = n.includes("chlorine") && !n.includes("hydrogen chloride");
  const hasHcl = n.includes("hydrogen chloride") || f === "hcl";
  const hasH2s = n.includes("hydrogen sulfide") || f === "h₂s";
  const hasSo2 = n.includes("sulfur dioxide") || f === "so₂";
  const isFuel = cat === "Fuel Gas";
  const isAcidGas = hasHcl || hasH2s || hasSo2 || hasChlorine;
  const isWet = nl.includes("wet") || nl.includes("saturated");

  // General gas service defaults
  r.gaskets = ["Nitrile (NBR)", "Viton (PK4)", "Graphite (High Temp)"];

  if (hasChlorine) {
    r.emfElectrode = [`${FT_ELECTRODE.tantalum.name} (${FT_ELECTRODE.tantalum.code})`, `${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`];
    r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`, `${FT_LINER.pfa.name} (${FT_LINER.pfa.code})`];
    r.vortexBodyMoc = [`${FT_VORTEX_BODY.ss316.name} (${FT_VORTEX_BODY.ss316.code})`, `${FT_VORTEX_BODY.ss316l.name} (${FT_VORTEX_BODY.ss316l.code})`];
    r.vortexShredder = ["SS 316L (SH2 — Chlorine)", "SS 316 (SH1)"];
    r.gaskets = ["PTFE (PK2)"];
    r.corrosionLevel = "Extreme";
    r.specialAlloys.tantalum = true;
    r.specialAlloys.ptfeLined = true;
    r.warnings.push("Wet Cl₂ — Flowtech Tantalum electrode (EL 4) or Hastelloy 'C' (EL 3) REQUIRED");
    r.warnings.push("Dry Cl₂ is less corrosive — SS316L (EL 2) acceptable for dry gas only");
    if (isWet) {
      r.warnings.push("WET chlorine — use Tantalum (EL 4) ONLY. Hastelloy may not be sufficient.");
    }
  } else if (hasHcl) {
    r.emfElectrode = [`${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`, `${FT_ELECTRODE.tantalum.name} (${FT_ELECTRODE.tantalum.code})`];
    r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`];
    r.vortexBodyMoc = [`${FT_VORTEX_BODY.ss316l.name} (${FT_VORTEX_BODY.ss316l.code})`];
    r.gaskets = ["PTFE (PK2)"];
    r.corrosionLevel = "High";
    r.specialAlloys.hastelloy = true;
    r.warnings.push("HCl gas — Hastelloy 'C' electrode (EL 3) recommended. Moist HCl is highly corrosive.");
  } else if (hasH2s) {
    r.emfElectrode = [`${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code})`, `${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`];
    r.gaskets = ["Viton (PK4)", "Graphite"];
    r.corrosionLevel = "High";
    r.specialAlloys.hastelloy = true;
    r.warnings.push("H₂S — use NACE MR0175/ISO 15156 compliant materials");
    r.warnings.push("Wet H₂S causes sulfide stress cracking — avoid high hardness materials");
  } else if (hasSo2) {
    r.emfElectrode = [`${FT_ELECTRODE.hastelloyC.name} (${FT_ELECTRODE.hastelloyC.code})`, `${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code})`];
    r.gaskets = ["PTFE (PK2)", "Viton (PK4)"];
    r.corrosionLevel = "Medium";
  } else if (hasAmmonia) {
    r.emfElectrode = [`${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code})`];
    r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`];
    r.gaskets = ["PTFE (PK2)"];
    r.corrosionLevel = "High";
    r.warnings.push("CRITICAL: NEVER use Cu/Brass/Bronze with Ammonia — stress corrosion cracking!");
    r.warnings.push("Ammonia: SS 316L electrode (EL 2) only. PTFE gaskets required.");
  } else if (isFuel && n.includes("hydrogen")) {
    r.corrosionLevel = "Medium";
    r.warnings.push("Hydrogen embrittlement risk — SS 316 required minimum. Avoid high-strength steels.");
  } else if (isAcidGas) {
    r.gaskets = ["PTFE (PK2)", "Viton (PK4)"];
    r.corrosionLevel = "High";
  }

  // Temperature-based gas overrides
  if (n.includes("flue") || n.includes("exhaust") || n.includes("stack")) {
    r.gaskets = ["Graphite (High Temp)", "Ceramic Fiber"];
    r.specialNotes = "Flue gas — high temperature gaskets required. Check SO₂ dewpoint corrosion.";
  }
}

// ===== STEAM HANDLER =====
function handleSteam(r: MocRecommendation) {
  r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code} — max 130°C)", "${FT_LINER.pfa.name} (${FT_LINER.pfa.code} — max 180°C)`];
  r.emfElectrode = [`${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code} — High Temp)`];
  r.gaskets = ["Graphite (High Temp)", "Spiral Wound SS 316"];
  r.vortexBodyMoc = [`${FT_VORTEX_BODY.ss304.name} (${FT_VORTEX_BODY.ss304.code})`, `${FT_VORTEX_BODY.ss316.name} (${FT_VORTEX_BODY.ss316.code})`];
  r.turbineFlowpipeMoc = ["SS 316 (SM1 — High Temp)", "SS 316L (SM2)"];
  r.turbineStopper = ["SS 316 (ST1 — High Temp)", "SS 316L (ST2)"];
  r.corrosionLevel = "Medium";
  r.specialNotes = "Steam service — high-temp gaskets required. PTFE liner max 130°C, PFA max 180°C. For superheated steam >180°C, consult factory.";
}

// ===== ROTAMETER DEFAULTS =====
function setRotameterDefaults(
  r: MocRecommendation,
  n: string,
  isStrongAcid: boolean,
  hasCl: boolean,
  isFood: boolean,
  isOil: boolean,
  isSolvent: boolean
) {
  // Override default float selection based on fluid properties
  if (isStrongAcid || n.includes("hydrofluoric")) {
    // Corrosive: lead with PTFE
    r.rotameterFloat = [
      `${FT_FLOAT.ptfe.name} (${FT_FLOAT.ptfe.code} — Corrosive)`,
      `${FT_FLOAT.hastelloyC.name} (${FT_FLOAT.hastelloyC.code})`,
      `${FT_FLOAT.tantalum.name} (${FT_FLOAT.tantalum.code})`,
      `${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code})`,
    ];
    r.rotameterFloatRetainer = ["PTFE (FR6 — Corrosive)", "SS 316L (FR2)", "Hastelloy 'C' (FR4)"];
  } else if (hasCl || n.includes("sea water") || n.includes("brine")) {
    // Chloride: lead with Titanium
    r.rotameterFloat = [
      `${FT_FLOAT.titanium.name} (${FT_FLOAT.titanium.code} — Chloride)`,
      `${FT_FLOAT.hastelloyC.name} (${FT_FLOAT.hastelloyC.code})`,
      `${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code})`,
      `${FT_FLOAT.tantalum.name} (${FT_FLOAT.tantalum.code})`,
    ];
  } else if (isFood) {
    r.rotameterFloat = [
      `${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code} — Food Grade)`,
      `${FT_FLOAT.ss316.name} (${FT_FLOAT.ss316.code})`,
    ];
  } else if (isOil) {
    r.rotameterFloat = [
      `${FT_FLOAT.ss316.name} (${FT_FLOAT.ss316.code} — Oil)`,
      `${FT_FLOAT.hastelloyC.name} (${FT_FLOAT.hastelloyC.code})`,
    ];
  } else if (isSolvent) {
    r.rotameterFloat = [
      `${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code} — Solvent)`,
      `${FT_FLOAT.hastelloyC.name} (${FT_FLOAT.hastelloyC.code})`,
    ];
  }
  // else: keep default SS 316 (FM1) which is fine for general water
}

// ===== AMMONIA HELPER =====
function applyAmmoniaMoc(r: MocRecommendation) {
  r.emfElectrode = [`${FT_ELECTRODE.ss316l.name} (${FT_ELECTRODE.ss316l.code} — NO Cu Alloys)`];
  r.emfLiner = [`${FT_LINER.ptfe.name} (${FT_LINER.ptfe.code})`];
  r.rotameterFloat = [`${FT_FLOAT.ss316.name} (${FT_FLOAT.ss316.code})`, `${FT_FLOAT.ss316l.name} (${FT_FLOAT.ss316l.code})`, `${FT_FLOAT.aluminium.name} (${FT_FLOAT.aluminium.code})`];
  r.rotameterFloatRetainer = ["SS 316 (FR1)", "SS 316L (FR2)", "PTFE (FR6 — NH₃)"];
  r.gaskets = ["PTFE (PK2)", "Viton (PK4)"];
  r.warnings.push("CRITICAL: NEVER use Copper, Brass, or Bronze with Ammonia!");
  r.warnings.push("Ammonia causes stress corrosion cracking in ALL copper alloys");
  r.corrosionLevel = "High";
  r.specialNotes = "Ammonia: SS 316L electrode (EL 2) only. PTFE gaskets. NEVER Cu/Brass/Bronze.";
}
