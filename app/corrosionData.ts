// Corrosion Database for Liquids and Gases
// Sources: CalPacLab SS316 & Carbon Steel Compatibility Charts,
// Parr Inst SS316 Corrosion Data, Hayata Corrosion Charts,
// BSSA Chlorine Guidelines, Alleima Corrosion Tables

// Corrosion levels:
// "highly-corrosive" = corrodes SS 316 (D rating / severe effect)
// "corrosive-ms" = corrodes Mild Steel / Carbon Steel (D or C rating for CS)
// Both can be true simultaneously

export interface CorrosionData {
  ss316: boolean;       // true = highly corrosive to SS 316
  mildSteel: boolean;   // true = corrosive to MS
  notes?: string;       // Optional corrosion note
}

// Map liquid names to corrosion data
export const LIQUID_CORROSION: Record<string, CorrosionData> = {
  // ===== ACIDS =====
  // Hydrochloric Acid - D for SS316, D for MS
  "Hydrochloric Acid (30%)": { ss316: true, mildSteel: true, notes: "Severe corrosion to SS316 and MS. Use Hastelloy C or Titanium." },
  "Hydrochloric Acid (20%)": { ss316: true, mildSteel: true, notes: "Severe corrosion to SS316 and MS. Use Hastelloy C or Titanium." },
  "Pickling Acid": { ss316: true, mildSteel: true, notes: "HCl-based. Severe corrosion to both SS316 and MS." },
  "Aqua Regia": { ss316: true, mildSteel: true, notes: "HNO₃+HCl mixture. Destroys SS316 passivation layer." },
  // Hydrofluoric Acid - D for SS316, D for MS
  "Hydrofluoric Acid (40%)": { ss316: true, mildSteel: true, notes: "Attacks SS316 oxide layer. Use Monel or Nickel alloys." },
  // Sulfuric Acid - concentration dependent
  "Sulfuric Acid (98%)": { ss316: false, mildSteel: true, notes: "Concentrated H₂SO₄ OK for SS316 at RT. Corrodes MS." },
  "Sulfuric Acid (50%)": { ss316: false, mildSteel: true, notes: "Moderate for SS316. Corrodes MS." },
  "Sulfuric Acid (20%)": { ss316: false, mildSteel: true, notes: "Dilute - OK for SS316 at RT. Corrodes MS." },
  "Battery Acid": { ss316: false, mildSteel: true, notes: "~37% H₂SO₄. Corrodes MS. SS316 OK at RT." },
  // Phosphoric Acid
  "Phosphoric Acid (85%)": { ss316: true, mildSteel: true, notes: ">40% concentration corrodes SS316. Use 316L or higher alloys." },
  "Phosphoric Acid (50%)": { ss316: false, mildSteel: true, notes: "≤40% OK for SS316. Corrodes MS." },
  // Chromic Acid - strong oxidizer, OK for SS316
  "Chromic Acid": { ss316: false, mildSteel: true, notes: "Strong oxidizer. Passivates SS316. Corrodes MS." },
  // Acetic Acid - OK for SS316
  "Acetic Acid (100%)": { ss316: false, mildSteel: true, notes: "Glacial - OK for SS316. Corrodes MS." },
  "Acetic Acid (50%)": { ss316: false, mildSteel: true, notes: "OK for SS316. Corrodes MS." },
  "Vinegar": { ss316: false, mildSteel: true, notes: "Dilute acetic acid. Corrodes MS over time." },
  // Other acids
  "Nitric Acid (60%)": { ss316: false, mildSteel: true, notes: "Strong oxidizer. Passivates SS316. Corrodes MS." },
  "Nitric Acid (30%)": { ss316: false, mildSteel: true, notes: "OK for SS316. Corrodes MS." },
  "Citric Acid (50%)": { ss316: false, mildSteel: true, notes: "OK for SS316. Mild corrosion of MS." },
  "Formic Acid (85%)": { ss316: false, mildSteel: true, notes: "Reducing acid. Moderate for SS316. Corrodes MS." },
  "Phenol (Carbolic Acid)": { ss316: false, mildSteel: true, notes: "OK for SS316 at RT. Corrodes MS." },
  "Cresol": { ss316: false, mildSteel: true, notes: "OK for SS316. Corrodes MS." },
  "Oxalic Acid (10%)": { ss316: false, mildSteel: true, notes: "OK for SS316 cold. Corrodes MS." },
  "Tartaric Acid (20%)": { ss316: false, mildSteel: true, notes: "OK for SS316. Corrodes MS." },
  "Oleic Acid": { ss316: false, mildSteel: false, notes: "Fatty acid. Generally safe for both at RT." },
  "Stearic Acid (Melted)": { ss316: false, mildSteel: false, notes: "Fatty acid. Generally safe for both." },

  // ===== ALKALIS =====
  "Caustic Soda (50%)": { ss316: false, mildSteel: true, notes: "NaOH corrodes MS. SS316 OK up to 50°C." },
  "Caustic Soda (30%)": { ss316: false, mildSteel: true, notes: "NaOH corrodes MS. SS316 OK at RT." },
  "Caustic Soda (20%)": { ss316: false, mildSteel: true, notes: "NaOH corrodes MS. SS316 OK." },
  "Caustic Soda (15%)": { ss316: false, mildSteel: true, notes: "NaOH corrodes MS. SS316 OK." },
  "Caustic Potash (50%)": { ss316: false, mildSteel: true, notes: "KOH corrodes MS. SS316 OK." },
  "Caustic Potash (45%)": { ss316: false, mildSteel: true, notes: "KOH corrodes MS. SS316 OK." },
  "Caustic Potash (20%)": { ss316: false, mildSteel: true, notes: "KOH corrodes MS. SS316 OK." },
  "Ammonia Solution (25%)": { ss316: false, mildSteel: true, notes: "NH₄OH. Corrodes MS. SS316 OK." },
  "Lime Water (Saturated)": { ss316: false, mildSteel: true, notes: "Ca(OH)₂. Corrodes MS (D rating). SS316 OK." },
  "Soda Ash Solution (20%)": { ss316: false, mildSteel: true, notes: "Na₂CO₃. Mild alkali. Corrodes MS slowly." },
  "Magnesium Hydroxide Slurry": { ss316: false, mildSteel: false, notes: "Mild alkali. Generally OK for both." },
  "Aluminum Hydroxide Slurry": { ss316: false, mildSteel: false, notes: "Generally OK for both SS316 and MS." },

  // ===== SALT SOLUTIONS / BRINES =====
  "Sodium Chloride (Brine 26%)": { ss316: false, mildSteel: true, notes: "NaCl brine corrodes MS (rusting). SS316 OK." },
  "Calcium Chloride (Brine 30%)": { ss316: false, mildSteel: true, notes: "CaCl₂ corrodes MS. Risk of pitting for SS316 at high T." },
  "Ferric Chloride (40%)": { ss316: true, mildSteel: true, notes: "D-Severe for SS316! Extremely aggressive. Use Titanium." },
  "Aluminum Sulfate (50%)": { ss316: false, mildSteel: true, notes: "Corrodes MS. SS316 OK." },
  "Sodium Hypochlorite (15%)": { ss316: true, mildSteel: true, notes: "Strong bleach. Corrodes SS316 and MS. Use Titanium." },
  "Sodium Hypochlorite (5%)": { ss316: false, mildSteel: true, notes: "Dilute bleach. Corrodes MS. Monitor SS316 for pitting." },
  "Urea Solution (50%)": { ss316: false, mildSteel: true, notes: "Corrodes MS slowly. SS316 OK." },
  "Hydrogen Peroxide (30%)": { ss316: false, mildSteel: true, notes: "Oxidizer. Corrodes MS. SS316 OK." },
  "Alum Solution (10%)": { ss316: false, mildSteel: true, notes: "KAl(SO₄)₂. Corrodes MS. SS316 OK." },
  "Lithium Chloride": { ss316: false, mildSteel: true, notes: "Chloride salt. Corrodes MS. Monitor SS316." },
  "Magnesium Chloride": { ss316: true, mildSteel: true, notes: "D-Severe for SS316! Corrodes MS." },
  "Zinc Chloride": { ss316: false, mildSteel: true, notes: "Corrodes MS. OK for SS316." },

  // ===== CHLORINATED SOLVENTS =====
  "Carbon Tetrachloride": { ss316: false, mildSteel: false, notes: "Generally safe for both at RT." },
  "Chloroform": { ss316: false, mildSteel: false, notes: "Generally safe for both at RT." },
  "Methylene Chloride": { ss316: false, mildSteel: false, notes: "Generally safe for both at RT." },
  "Chlorobenzene": { ss316: false, mildSteel: false, notes: "Generally safe for both." },
  "Chlorine": { ss316: true, mildSteel: true, notes: "Wet Cl₂ extremely corrosive to both. Dry is manageable." },

  // ===== DEFAULTS FOR REMAINING LIQUIDS =====
  // Most food items, oils, water variants are OK for SS316 but may affect MS
};

// Map gas names to corrosion data
export const GAS_CORROSION: Record<string, CorrosionData> = {
  // ===== HIGHLY CORROSIVE GASES =====
  "Chlorine": { ss316: true, mildSteel: true, notes: "Wet Cl₂ → HCl + HOCl, extremely corrosive to ALL metals. Only Ti, Hastelloy C, PTFE, PVDF resist. Dry Cl₂ OK for carbon steel and Monel." },
  "Hydrogen Chloride": { ss316: true, mildSteel: false, notes: "Wet HCl corrodes SS316. Dry HCl OK for MS up to 250°C." },
  "Fluorine": { ss316: true, mildSteel: true, notes: "EXTREMELY reactive! Use Monel or Nickel alloys." },
  "Chlorine Dioxide": { ss316: true, mildSteel: true, notes: "Toxic, explosive! Very corrosive to both SS316 and MS." },
  "Ozone": { ss316: false, mildSteel: true, notes: "Strong oxidizer. Corrodes MS. SS316 OK." },
  "Sulfur Dioxide": { ss316: false, mildSteel: true, notes: "Wet SO₂ forms sulfurous acid. Corrodes MS. SS316 OK." },
  "Hydrogen Sulfide": { ss316: false, mildSteel: true, notes: "Wet H₂S corrodes MS. SS316 generally OK." },
  "Ammonia": { ss316: false, mildSteel: true, notes: "NEVER use Cu, brass, bronze — stress corrosion cracking! Carbon steel OK for anhydrous NH₃. SS316 OK. Wet NH₃ + O₂ corrodes MS." },
  "Diborane": { ss316: true, mildSteel: true, notes: "Pyrophoric, toxic! Use Nickel alloys." },

  // ===== GENERALLY SAFE GASES =====
  "Air": { ss316: false, mildSteel: false },
  "Compressed Air": { ss316: false, mildSteel: false },
  "Instrument Air": { ss316: false, mildSteel: false },
  "Nitrogen": { ss316: false, mildSteel: false },
  "Oxygen": { ss316: false, mildSteel: false, notes: "Avoid oil contamination. Fire hazard with organics." },
  "Hydrogen": { ss316: false, mildSteel: false, notes: "Hydrogen embrittlement risk for some steels at high P/T." },
  "Helium": { ss316: false, mildSteel: false },
  "Argon": { ss316: false, mildSteel: false },
  "Neon": { ss316: false, mildSteel: false },
  "Krypton": { ss316: false, mildSteel: false },
  "Xenon": { ss316: false, mildSteel: false },
  "Carbon Dioxide": { ss316: false, mildSteel: true, notes: "Wet CO₂ forms carbonic acid. Corrodes MS slowly." },
  "Methane": { ss316: false, mildSteel: false, notes: "Non-corrosive in both gas and liquid phases. Use 9% Ni steel or SS304/316 for cryogenic liquid service." },
  "LNG": { ss316: false, mildSteel: false, notes: "Non-corrosive. Use 9% Ni steel, SS304/316, or Al 5083 for cryogenic service. Normal CS brittle at -162°C." },
  "Natural Gas": { ss316: false, mildSteel: false, notes: "Non-corrosive. Watch for H₂S content (sour gas). Heavy hydrocarbon dew point can cause condensate issues." },
  "Propane": { ss316: false, mildSteel: false },
  "Butane": { ss316: false, mildSteel: false },
  "Acetylene": { ss316: false, mildSteel: false, notes: "Can form copper acetylide." },
};

// Get corrosion data for a liquid by name
export function getLiquidCorrosion(name: string): CorrosionData | null {
  if (LIQUID_CORROSION[name]) return LIQUID_CORROSION[name];
  // Check partial matches
  const key = Object.keys(LIQUID_CORROSION).find((k) => name.includes(k.replace(/ \(.*\)/, "")));
  if (key) return LIQUID_CORROSION[key];
  return null;
}

// Get corrosion data for a gas by name
export function getGasCorrosion(name: string): CorrosionData | null {
  if (GAS_CORROSION[name]) return GAS_CORROSION[name];
  const key = Object.keys(GAS_CORROSION).find((k) => name.includes(k));
  if (key) return GAS_CORROSION[key];
  return null;
}

// Category-based default corrosion (fallback)
export function getDefaultCorrosionForCategory(
  category: string
): CorrosionData {
  switch (category) {
    case "Acid":
      return { ss316: false, mildSteel: true, notes: "Acids generally corrode MS. SS316 resistance varies by acid type and concentration." };
    case "Alkali":
      return { ss316: false, mildSteel: true, notes: "Alkalis generally corrode MS. SS316 is usually resistant." };
    case "Water":
      return { ss316: false, mildSteel: true, notes: "Water causes rust on MS over time. SS316 is corrosion-resistant." };
    case "Chemical":
      return { ss316: false, mildSteel: true, notes: "Chemical solutions may corrode MS. Check specific chemical compatibility." };
    case "Slurry":
      return { ss316: false, mildSteel: true, notes: "Abrasive slurries cause erosion-corrosion on MS." };
    case "Solvent":
      return { ss316: false, mildSteel: false, notes: "Most organic solvents are non-corrosive to metals." };
    case "Oil":
      return { ss316: false, mildSteel: false, notes: "Oils are generally non-corrosive to both SS316 and MS." };
    case "Fuel":
      return { ss316: false, mildSteel: false, notes: "Hydrocarbon fuels are generally non-corrosive." };
    case "Food & Beverage":
      return { ss316: false, mildSteel: true, notes: "Food products corrode MS. Use SS316 for hygienic applications." };
    case "Pharmaceutical":
      return { ss316: false, mildSteel: true, notes: "Pharma fluids corrode MS. SS316 required for hygienic standards." };
    case "Gas (Liquid state)":
      return { ss316: false, mildSteel: false };
    case "Cryogenic":
      return { ss316: false, mildSteel: false };
    default:
      return { ss316: false, mildSteel: false };
  }
}
