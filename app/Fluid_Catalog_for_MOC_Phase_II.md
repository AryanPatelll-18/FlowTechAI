# Flowtech AI Flow Sizing Calculator
## Complete Fluid Catalog for Phase II — Material of Construction (MOC) AI Module

---

**Prepared for:** Flowtech Instruments (I) Pvt. Ltd.  
**Date:** May 2026  
**Total Fluids:** 292+ with complete property data  
**Scope:** Phase II — AI-driven MOC selection for contact parts

---

## Executive Summary

This catalog documents all 292+ fluids (228 liquids + 64 gases + saturated steam tables) currently integrated into the Flowtech AI Flow Sizing Calculator. Each fluid entry includes density, viscosity, temperature/pressure limits, conductivity, corrosion data, and saturation properties — forming the foundation for the Phase II MOC AI module that will automatically recommend the optimal material of construction (SS316, Hastelloy C, Titanium, PTFE-lined, etc.) based on fluid chemistry and operating conditions.

### Contact Parts Requiring MOC Selection

| Component | Materials to Evaluate | Selection Criteria |
|-----------|----------------------|-------------------|
| **Flow Tube (EMF)** | SS316L, Hastelloy C, Titanium, Tantalum, Platinum | Conductivity + corrosion |
| **Float (Rotameter)** | SS316, PTFE, Aluminium, Ceramic | Density + corrosion |
| **Bluff Body (Vortex)** | SS316, Hastelloy C, Titanium | Erosion + corrosion |
| **Rotor (Turbine)** | SS316, Tungsten Carbide, Ceramic | Wear + corrosion |
| **Liner (EMF)** | PTFE, PFA, Neoprene, Ceramic | Chemical resistance |
| **Oval Gear** | SS316, Hastelloy C | Wear + corrosion |
| **Transducer (Ultrasonic)** | SS316, Titanium | Transducer compatibility |
| **Gaskets/O-rings** | Viton, EPDM, PTFE, Kalrez | Temperature + chemical |

---

## SECTION 1: LIQUIDS (228 Entries, 12 Categories)

### 1.1 Water & Aqueous Solutions (6 entries)

| # | Fluid Name | Formula | Conductivity | Max Temp | Key MOC Concern |
|---|-----------|---------|-------------|----------|-----------------|
| 1 | Water (H₂O) | H₂O | Yes | 100°C | General — SS316 OK |
| 2 | Deionized Water | H₂O | No | 100°C | Low conductivity → EMF may fail |
| 3 | Seawater | H₂O + salts | Yes | 80°C | Chloride → SS316 pitting risk |
| 4 | Brine (NaCl solution) | NaCl + H₂O | Yes | 100°C | High chloride → Ti or HC |
| 5 | Caustic Soda (NaOH, 50%) | NaOH | Yes | 80°C | Concentrated alkali — SS316 OK |
| 6 | Potassium Hydroxide (KOH, 50%) | KOH | Yes | 80°C | Strong alkali — SS316 OK |

### 1.2 Acids (22 entries)

| # | Fluid Name | Formula | Max Temp | Key MOC Concern |
|---|-----------|---------|----------|-----------------|
| 7 | Hydrochloric Acid (HCl, 37%) | HCl | 50°C | Wet HCl → Ti, HC, PTFE only |
| 8 | Sulfuric Acid (H₂SO₄, 98%) | H₂SO₄ | 100°C | Concentrated → SS316; dilute → HC |
| 9 | Sulfuric Acid (H₂SO₄, 50%) | H₂SO₄ | 80°C | Dilute → Hastelloy C or PTFE |
| 10 | Nitric Acid (HNO₃, 68%) | HNO₃ | 60°C | Oxidizing → SS316 OK |
| 11 | Phosphoric Acid (H₃PO₄, 85%) | H₃PO₄ | 80°C | SS316 OK at concentration |
| 12 | Acetic Acid (glacial) | CH₃COOH | 80°C | Organic acid → SS316 OK |
| 13 | Citric Acid (solution) | C₆H₈O₇ | 80°C | Organic acid → SS316 OK |
| 14 | Formic Acid (90%) | HCOOH | 60°C | Reducing acid → HC for concentrated |
| 15 | Hydrofluoric Acid (HF, 40%) | HF | 40°C | Fluoride attacks SS316 → Monel or PTFE |
| 16 | Chromic Acid | H₂CrO₄ | 60°C | Strong oxidizer → SS316 OK |
| 17 | Boric Acid | H₃BO₃ | 80°C | Weak acid → SS316 OK |
| 18 | Oxalic Acid | C₂H₂O₄ | 80°C | Organic acid → SS316 OK |
| 19 | Tartaric Acid | C₄H₆O₆ | 80°C | Organic acid → SS316 OK |
| 20 | Lactic Acid | C₃H₆O₃ | 80°C | Organic acid → SS316 OK |
| 21 | Aqua Regia | HCl + HNO₃ | 40°C | Extreme corrosion → Ti or PTFE |
| 22 | Fluosilicic Acid | H₂SiF₆ | 50°C | Fluoride content → PTFE-lined |
| 23 | Perchloric Acid | HClO₄ | 60°C | Strong oxidizer → SS316 OK |
| 24 | Hydrobromic Acid (HBr, 48%) | HBr | 50°C | Halide → Ti or HC |
| 25 | Picric Acid | C₆H₃N₃O₇ | 60°C | SS316 OK |
| 26 | Muriatic Acid | HCl (dilute) | 50°C | Dilute HCl → HC or Ti |
| 27 | Battery Acid | H₂SO₄ (dilute) | 60°C | Dilute → HC or PTFE |
| 28 | Pickling Acid | HCl + HNO₃ | 60°C | Mixed acid → HC or Ti |

### 1.3 Alkalis / Bases (8 entries)

| # | Fluid Name | Formula | Max Temp | Key MOC Concern |
|---|-----------|---------|----------|-----------------|
| 29 | Caustic Soda (NaOH, 30%) | NaOH | 80°C | SS316 OK |
| 30 | Caustic Soda (NaOH, 50%) | NaOH | 80°C | SS316 OK |
| 31 | Liquid Caustic Soda | NaOH | 80°C | SS316 OK |
| 32 | Sodium Carbonate (Soda Ash) | Na₂CO₃ | 80°C | SS316 OK |
| 33 | Sodium Bicarbonate | NaHCO₃ | 80°C | SS316 OK |
| 34 | Sodium Silicate | Na₂SiO₃ | 80°C | SS316 OK |
| 35 | Ammonium Hydroxide (NH₄OH) | NH₄OH | 60°C | Avoid Cu alloys → SS316 OK |
| 36 | Lime Slurry (Ca(OH)₂) | Ca(OH)₂ | 80°C | Abrasive + alkaline → SS316 or HC |

### 1.4 Organic Solvents (42 entries)

| # | Fluid Name | Formula | Max Temp | Key MOC Concern |
|---|-----------|---------|----------|-----------------|
| 37 | Acetone | C₃H₆O | 60°C | Ketone → SS316 OK |
| 38 | Methanol | CH₃OH | 65°C | Alcohol → SS316 OK |
| 39 | Ethanol (Ethyl Alcohol) | C₂H₅OH | 78°C | Alcohol → SS316 OK |
| 40 | Isopropyl Alcohol (IPA) | C₃H₈O | 82°C | Alcohol → SS316 OK |
| 41 | Butanol | C₄H₁₀O | 117°C | Alcohol → SS316 OK |
| 42 | Ethylene Glycol | C₂H₆O₂ | 150°C | Glycol → SS316 OK |
| 43 | Propylene Glycol | C₃H₈O₂ | 188°C | Glycol → SS316 OK |
| 44 | Diethylene Glycol | C₄H₁₀O₃ | 245°C | Glycol → SS316 OK |
| 45 | Triethylene Glycol | C₆H₁₄O₄ | 285°C | Glycol → SS316 OK |
| 46 | Glycerine (Glycerol) | C₃H₈O₃ | 290°C | Viscous → SS316 OK |
| 47 | Toluene | C₇H₈ | 110°C | Aromatic → SS316 OK |
| 48 | Xylene | C₈H₁₀ | 138°C | Aromatic → SS316 OK |
| 49 | Benzene | C₆H₆ | 80°C | Aromatic → SS316 OK |
| 50 | n-Hexane | C₆H₁₄ | 69°C | Aliphatic → SS316 OK |
| 51 | n-Heptane | C₇H₁₆ | 98°C | Aliphatic → SS316 OK |
| 52 | Cyclohexane | C₆H₁₂ | 81°C | Cyclic → SS316 OK |
| 53 | Methyl Ethyl Ketone (MEK) | C₄H₈O | 80°C | Ketone → SS316 OK |
| 54 | Methyl Isobutyl Ketone (MIBK) | C₆H₁₂O | 116°C | Ketone → SS316 OK |
| 55 | Diethyl Ether | C₄H₁₀O | 35°C | Ether → SS316 OK |
| 56 | Dimethyl Sulfoxide (DMSO) | C₂H₆OS | 189°C | SS316 OK |
| 57 | Tetrahydrofuran (THF) | C₄H₈O | 66°C | Ether → SS316 OK |
| 58 | Ethyl Acetate | C₄H₈O₂ | 77°C | Ester → SS316 OK |
| 59 | Butyl Acetate | C₆H₁₂O₂ | 126°C | Ester → SS316 OK |
| 60 | Acetonitrile | C₂H₃N | 82°C | Nitrile → SS316 OK |
| 61 | Carbon Tetrachloride | CCl₄ | 77°C | Halogenated → SS316 OK |
| 62 | Chloroform | CHCl₃ | 61°C | Halogenated → SS316 OK |
| 63 | Methylene Chloride | CH₂Cl₂ | 40°C | Halogenated → SS316 OK |
| 64 | Perchloroethylene | C₂Cl₄ | 121°C | Halogenated → SS316 OK |
| 65 | Trichloroethylene | C₂HCl₃ | 87°C | Halogenated → SS316 OK |
| 66 | 1,4-Dioxane | C₄H₈O₂ | 101°C | Ether → SS316 OK |
| 67 | N-Methyl-2-Pyrrolidone (NMP) | C₅H₉NO | 202°C | SS316 OK |
| 68 | Dimethylformamide (DMF) | C₃H₇NO | 153°C | Amide → SS316 OK |
| 69 | Formamide | CH₃NO | 210°C | Amide → SS316 OK |
| 70 | Phenol | C₆H₆O | 182°C | Acidic → SS316 OK |
| 71 | Aniline | C₆H₇N | 184°C | Aromatic amine → SS316 OK |
| 72 | Pyridine | C₅H₅N | 115°C | Heterocyclic → SS316 OK |
| 73 | Furfural | C₅H₄O₂ | 162°C | Aldehyde → SS316 OK |
| 74 | Cresol | C₇H₈O | 202°C | Phenolic → SS316 OK |
| 75 | Cyclohexanol | C₆H₁₂O | 161°C | Alcohol → SS316 OK |
| 76 | Cyclohexanone | C₆H₁₀O | 155°C | Ketone → SS316 OK |
| 77 | Formaldehyde (37%) | CH₂O | 60°C | Aldehyde → SS316 OK |
| 78 | Acetaldehyde | C₂H₄O | 20°C | Volatile aldehyde → SS316 OK |

### 1.5 Oils & Petroleum Products (28 entries)

| # | Fluid Name | Max Temp | Key MOC Concern |
|---|-----------|----------|-----------------|
| 79 | Crude Oil (Light) | 120°C | SS316 OK |
| 80 | Crude Oil (Heavy) | 150°C | SS316 OK; sand → erosion |
| 81 | Diesel | 120°C | SS316 OK |
| 82 | Gasoline / Petrol | 80°C | SS316 OK |
| 83 | Kerosene | 150°C | SS316 OK |
| 84 | Jet Fuel (ATF) | 120°C | SS316 OK |
| 85 | Fuel Oil #2 | 120°C | SS316 OK |
| 86 | Fuel Oil #6 (Bunker C) | 150°C | Viscous → SS316 OK |
| 87 | Lubricating Oil | 120°C | SS316 OK |
| 88 | Hydraulic Oil (Mineral) | 80°C | SS316 OK |
| 89 | Hydraulic Oil (Synthetic) | 100°C | SS316 OK |
| 90 | Transformer Oil | 100°C | SS316 OK |
| 91 | Turbine Oil | 100°C | SS316 OK |
| 92 | Gear Oil | 100°C | SS316 OK |
| 93 | Engine Oil (SAE 30) | 120°C | SS316 OK |
| 94 | Engine Oil (SAE 40) | 120°C | SS316 OK |
| 95 | Mineral Oil | 120°C | SS316 OK |
| 96 | Paraffin Oil | 150°C | SS316 OK |
| 97 | White Oil | 120°C | SS316 OK |
| 98 | Naptha | 80°C | SS316 OK |
| 99 | Gas Oil | 120°C | SS316 OK |
| 100 | Bitumen / Asphalt | 200°C | High temp → SS316 or HC |
| 101 | Tar | 200°C | High temp → SS316 or HC |
| 102 | Pitch | 250°C | High temp → SS316 or HC |
| 103 | Residual Oil | 200°C | High temp → SS316 or HC |
| 104 | Condensate (Oil Field) | 80°C | May contain H₂S → HC |
| 105 | Offshore Produced Water | 80°C | Chloride + H₂S → Ti or HC |
| 106 | Drilling Mud | 80°C | Abrasive → SS316 with liners |

### 1.6 Chemicals & Process Fluids (36 entries)

| # | Fluid Name | Formula | Max Temp | Key MOC Concern |
|---|-----------|---------|----------|-----------------|
| 107 | Hydrogen Peroxide (H₂O₂, 50%) | H₂O₂ | 60°C | Strong oxidizer → SS316 OK |
| 108 | Sodium Hypochlorite (NaOCl, 12%) | NaOCl | 50°C | Hypochlorite → Ti or HC |
| 109 | Sodium Chlorate | NaClO₃ | 80°C | SS316 OK |
| 110 | Sodium Sulfate | Na₂SO₄ | 80°C | SS316 OK |
| 111 | Sodium Sulfite | Na₂SO₃ | 80°C | SS316 OK |
| 112 | Sodium Thiosulfate | Na₂S₂O₃ | 80°C | SS316 OK |
| 113 | Sodium Phosphate | Na₃PO₄ | 80°C | SS316 OK |
| 114 | Ammonium Nitrate | NH₄NO₃ | 80°C | SS316 OK |
| 115 | Ammonium Sulfate | (NH₄)₂SO₄ | 80°C | SS316 OK |
| 116 | Ammonium Chloride | NH₄Cl | 80°C | Chloride → SS316 OK; high conc → HC |
| 117 | Calcium Chloride | CaCl₂ | 80°C | Chloride → SS316 OK |
| 118 | Magnesium Chloride | MgCl₂ | 80°C | Chloride → SS316 OK |
| 119 | Ferric Chloride | FeCl₃ | 60°C | Highly corrosive → HC or Ti |
| 120 | Cupric Chloride | CuCl₂ | 60°C | Copper salt → SS316 OK |
| 121 | Zinc Chloride | ZnCl₂ | 80°C | SS316 OK |
| 122 | Aluminum Chloride | AlCl₃ | 80°C | Hydrolyzes → acid → HC |
| 123 | Urea (solution, 50%) | CO(NH₂)₂ | 100°C | SS316 OK |
| 124 | Urea Ammonium Nitrate | — | 80°C | SS316 OK |
| 125 | Formaldehyde (37%) | CH₂O | 60°C | SS316 OK |
| 126 | Acetic Anhydride | C₄H₆O₃ | 140°C | SS316 OK |
| 127 | Phosgene | COCl₂ | 20°C | Highly toxic → SS316 OK |
| 128 | Carbon Disulfide | CS₂ | 46°C | SS316 OK |
| 129 | Mercaptans | R-SH | 80°C | Sulfur compound → SS316 or HC |
| 130 | Diethanolamine (DEA) | C₄H₁₁NO₂ | 150°C | Amine → SS316 OK |
| 131 | Monoethanolamine (MEA) | C₂H₇NO | 120°C | Amine → SS316 OK |
| 132 | Methyldiethanolamine (MDEA) | C₅H₁₃NO₂ | 150°C | Amine → SS316 OK |
| 133 | Sulfolane | C₄H₈O₂S | 285°C | SS316 OK |
| 134 | Molten Sulfur | S | 160°C | Sulfur → SS316 OK |
| 135 | Liquid SO₂ | SO₂ | 20°C | Wet SO₂ corrosive → SS316 OK dry |
| 136 | Chlorine Water | Cl₂ + H₂O | 40°C | Wet Cl₂ → Ti, HC, PTFE only |
| 137 | Hydrazine | N₂H₄ | 80°C | Reducing → SS316 OK |
| 138 | Silicone Oil | — | 200°C | SS316 OK |
| 139 | Heat Transfer Oil | — | 350°C | High temp → SS316 or HC |
| 140 | Thermal Fluid (Dowtherm) | — | 400°C | High temp → SS316 or HC |
| 141 | Therminol | — | 350°C | High temp → SS316 or HC |
| 142 | Molten Salt | — | 600°C | Extreme temp → SS316 or Ti |

### 1.7 Food & Beverage (12 entries)

| # | Fluid Name | Max Temp | Key MOC Concern |
|---|-----------|----------|-----------------|
| 143 | Milk | 80°C | Sanitary → SS316L |
| 144 | Condensed Milk | 80°C | Viscous → SS316L |
| 145 | Cream | 80°C | Viscous → SS316L |
| 146 | Whey | 80°C | Protein → SS316L |
| 147 | Fruit Juice | 80°C | Acidic → SS316L |
| 148 | Vegetable Oil (edible) | 150°C | SS316L |
| 149 | Palm Oil | 150°C | SS316L |
| 150 | Coconut Oil | 150°C | SS316L |
| 151 | Sunflower Oil | 150°C | SS316L |
| 152 | Sugar Syrup | 100°C | Viscous → SS316L |
| 153 | Molasses | 80°C | Very viscous → SS316L |
| 154 | Beer / Wort | 80°C | SS316L |

### 1.8 Pharmaceutical (10 entries)

| # | Fluid Name | Max Temp | Key MOC Concern |
|---|-----------|----------|-----------------|
| 155 | Purified Water (PW) | 80°C | Low conductivity → EMF may fail |
| 156 | Water for Injection (WFI) | 80°C | Low conductivity → EMF may fail |
| 157 | CIP Solution (Caustic) | 80°C | SS316L |
| 158 | SIP Condensate | 120°C | SS316L |
| 159 | Dextrose Solution | 80°C | SS316L |
| 160 | Saline (NaCl, 0.9%) | 80°C | SS316L |
| 161 | Ringer's Solution | 80°C | SS316L |
| 162 | Ethanol (Pharma grade) | 78°C | SS316L |
| 163 | Isopropyl Alcohol (Pharma) | 82°C | SS316L |
| 164 | Liquid Paraffin | 150°C | SS316L |

### 1.9 Slurries & Suspensions (8 entries)

| # | Fluid Name | Max Temp | Key MOC Concern |
|---|-----------|----------|-----------------|
| 165 | Lime Slurry (Ca(OH)₂) | 80°C | Abrasive → SS316 with liners |
| 166 | Cement Slurry | 60°C | Highly abrasive → HC or ceramic lining |
| 167 | Clay Slurry | 60°C | Abrasive → SS316 |
| 168 | Coal Slurry | 60°C | Abrasive → SS316 |
| 169 | Kaolin Slurry | 60°C | Abrasive → SS316 |
| 170 | Titanium Dioxide Slurry | 60°C | Abrasive → SS316 |
| 171 | Paper Stock (Pulp) | 60°C | Fibrous → SS316 |
| 172 | Sand Slurry | 60°C | Highly abrasive → HC or ceramic |

### 1.10 Cryogenic Liquids (12 entries)

| # | Fluid Name | Formula | Boiling Point | Key MOC Concern |
|---|-----------|---------|--------------|-----------------|
| 173 | Liquid Nitrogen | N₂ | -196°C | 9% Ni steel or SS304/316 |
| 174 | Liquid Oxygen | O₂ | -183°C | 9% Ni steel (oxygen clean) |
| 175 | Liquid Argon | Ar | -186°C | 9% Ni steel or SS304/316 |
| 176 | Liquid Helium | He | -269°C | SS316 or aluminium |
| 177 | Liquid Hydrogen | H₂ | -253°C | SS316 or aluminium |
| 178 | Liquid Methane (LNG) | CH₄ | -162°C | 9% Ni steel or SS304/316 |
| 179 | Liquid Ethane | C₂H₆ | -89°C | 9% Ni steel |
| 180 | Liquid Propane | C₃H₈ | -42°C | SS316 or carbon steel |
| 181 | Liquid Butane | C₄H₁₀ | -1°C | SS316 or carbon steel |
| 182 | Liquid Ethylene | C₂H₄ | -104°C | 9% Ni steel |
| 183 | Liquid Propylene | C₃H₆ | -48°C | SS316 |
| 184 | Liquid Ammonia | NH₃ | -33°C | Carbon steel (NO Cu alloys) |

### 1.11 Vegetable Oils & Fats (10 entries)

| # | Fluid Name | Max Temp | Key MOC Concern |
|---|-----------|----------|-----------------|
| 185 | Soybean Oil | 150°C | SS316 OK |
| 186 | Canola Oil / Rapeseed Oil | 150°C | SS316 OK |
| 187 | Corn Oil (Maize Oil) | 150°C | SS316 OK |
| 188 | Olive Oil | 150°C | SS316 OK |
| 189 | Peanut Oil (Groundnut Oil) | 150°C | SS316 OK |
| 190 | Cottonseed Oil | 150°C | SS316 OK |
| 191 | Sesame Oil | 150°C | SS316 OK |
| 192 | Castor Oil | 200°C | SS316 OK |
| 193 | Linseed Oil | 150°C | SS316 OK |
| 194 | Tall Oil | 150°C | SS316 OK |

### 1.12 Glycols & Polyols (8 entries)

| # | Fluid Name | Formula | Max Temp | Key MOC Concern |
|---|-----------|---------|----------|-----------------|
| 195 | Ethylene Glycol (MEG) | C₂H₆O₂ | 150°C | SS316 OK |
| 196 | Propylene Glycol (MPG) | C₃H₈O₂ | 188°C | SS316 OK |
| 197 | Diethylene Glycol (DEG) | C₄H₁₀O₃ | 245°C | SS316 OK |
| 198 | Triethylene Glycol (TEG) | C₆H₁₄O₄ | 285°C | SS316 OK |
| 199 | Tetraethylene Glycol | C₈H₁₈O₅ | 320°C | SS316 OK |
| 200 | Hexylene Glycol | C₆H₁₄O₂ | 198°C | SS316 OK |
| 201 | Polyethylene Glycol (PEG 400) | — | 150°C | SS316 OK |
| 202 | Neopentyl Glycol | C₅H₁₂O₂ | 130°C | SS316 OK |

### 1.13 Industrial Solvents & Specialty (12 entries)

| # | Fluid Name | Formula | Max Temp | Key MOC Concern |
|---|-----------|---------|----------|-----------------|
| 203 | Acetone | C₃H₆O | 56°C | SS316 OK |
| 204 | MEK (Methyl Ethyl Ketone) | C₄H₈O | 80°C | SS316 OK |
| 205 | MIBK (Methyl Isobutyl Ketone) | C₆H₁₂O | 116°C | SS316 OK |
| 206 | IPA (Isopropyl Alcohol) | C₃H₈O | 82°C | SS316 OK |
| 207 | Butyl Cellosolve | C₆H₁₄O₂ | 171°C | SS316 OK |
| 208 | Cellosolve (Ethoxyethanol) | C₄H₁₀O₂ | 135°C | SS316 OK |
| 209 | Butyl Carbitol | C₈H₁₈O₃ | 230°C | SS316 OK |
| 210 | Carbitol | C₆H₁₄O₃ | 196°C | SS316 OK |
| 211 | Texanol | C₁₂H₂₄O₃ | 250°C | SS316 OK |
| 212 | Pine Oil | — | 200°C | SS316 OK |
| 213 | Turpentine | C₁₀H₁₆ | 154°C | SS316 OK |
| 214 | Kerosene (Deodorized) | — | 150°C | SS316 OK |

### 1.14 Miscellaneous / Special (14 entries)

| # | Fluid Name | Max Temp | Key MOC Concern |
|---|-----------|----------|-----------------|
| 215 | Chlorinated Water | 60°C | Hypochlorite → Ti or HC |
| 216 | Ozone Water | 40°C | Strong oxidizer → SS316 OK |
| 217 | Boiler Feed Water | 150°C | Deaerated → SS316 OK |
| 218 | Cooling Tower Water | 50°C | Treated → SS316 OK |
| 219 | Demineralized Water | 80°C | Low conductivity → EMF may fail |
| 220 | Reverse Osmosis Permeate | 40°C | Low conductivity → EMF may fail |
| 221 | Wastewater (Municipal) | 40°C | May contain solids → SS316 |
| 222 | Wastewater (Industrial) | 60°C | Chemical content → SS316 or HC |
| 223 | Effluent (Treated) | 60°C | SS316 OK |
| 224 | Grey Water | 40°C | SS316 OK |
| 225 | Black Liquor (Pulp) | 80°C | Alkaline + organics → SS316 or HC |
| 226 | Green Liquor (Pulp) | 80°C | Alkaline + sulfide → SS316 or HC |
| 227 | White Liquor (Pulp) | 80°C | NaOH + Na₂S → SS316 or HC |
| 228 | Spent Sulfuric Acid | 80°C | Dilute + contaminants → HC |

---

## SECTION 2: GASES (64 Entries, 6 Categories)

### 2.1 Atmospheric & Common Gases (12 entries)

| # | Gas | Formula | MW | Category | Corrosion Risk | MOC Note |
|---|-----|---------|-----|----------|---------------|----------|
| 1 | Air (dry) | N₂+O₂ | 28.97 | Atmospheric | None | SS316 OK |
| 2 | Air (compressed) | N₂+O₂ | 28.97 | Atmospheric | None | SS316 OK |
| 3 | Nitrogen | N₂ | 28.01 | Inert Gas | None | SS316 OK |
| 4 | Oxygen | O₂ | 32.00 | Atmospheric | None | SS316 OK (oxygen clean) |
| 5 | Argon | Ar | 39.95 | Inert Gas | None | SS316 OK |
| 6 | Carbon Dioxide | CO₂ | 44.01 | Atmospheric | Low (wet) | Wet CO₂ → SS316 OK |
| 7 | Carbon Monoxide | CO | 28.01 | Fuel Gas | None | SS316 OK |
| 8 | Helium | He | 4.00 | Inert Gas | None | SS316 OK |
| 9 | Hydrogen | H₂ | 2.02 | Fuel Gas | None | SS316 OK |
| 10 | Steam | H₂O | 18.02 | Process Gas | None (dry) | SS316 OK |
| 11 | Water Vapor | H₂O | 18.02 | Process Gas | None | SS316 OK |
| 12 | Compressed Natural Gas | CH₄+ | 19.5 | Fuel Gas | Low | SS316 OK |

### 2.2 Fuel Gases (10 entries)

| # | Gas | Formula | MW | Corrosion Risk | MOC Note |
|---|-----|---------|-----|---------------|----------|
| 13 | Methane | CH₄ | 16.04 | None | SS316 OK |
| 14 | Natural Gas | CH₄+ | 19.5 | Low (H₂S) | SS316 OK; sour gas → HC |
| 15 | LPG (Liquefied Petroleum Gas) | C₃H₈+C₄H₁₀ | 44 | None | SS316 OK |
| 16 | LNG (Liquefied Natural Gas) | CH₄ | 16.04 | None | 9% Ni steel or SS304/316 |
| 17 | Propane | C₃H₈ | 44.10 | None | SS316 OK |
| 18 | Butane | C₄H₁₀ | 58.12 | None | SS316 OK |
| 19 | Ethane | C₂H₆ | 30.07 | None | SS316 OK |
| 20 | Ethylene | C₂H₄ | 28.05 | None | SS316 OK |
| 21 | Propylene | C₃H₆ | 42.08 | None | SS316 OK |
| 22 | Syngas (Synthesis Gas) | CO+H₂ | 12-16 | Low | SS316 OK |

### 2.3 Inert Gases (6 entries)

| # | Gas | Formula | MW | MOC Note |
|---|-----|---------|-----|----------|
| 23 | Nitrogen (N₂) | N₂ | 28.01 | SS316 OK |
| 24 | Argon (Ar) | Ar | 39.95 | SS316 OK |
| 25 | Helium (He) | He | 4.00 | SS316 OK |
| 26 | Neon (Ne) | Ne | 20.18 | SS316 OK |
| 27 | Krypton (Kr) | Kr | 83.80 | SS316 OK |
| 28 | Xenon (Xe) | Xe | 131.29 | SS316 OK |

### 2.4 Process & Industrial Gases (20 entries)

| # | Gas | Formula | MW | Corrosion Risk | MOC Note |
|---|-----|---------|-----|---------------|----------|
| 29 | Chlorine (Cl₂) | Cl₂ | 70.91 | **HIGH** (wet) | Wet → Ti, HC, PTFE only |
| 30 | Ammonia (NH₃) | NH₃ | 17.03 | **HIGH** (Cu alloys) | **NEVER Cu/Brass/Bronze** |
| 31 | Sulfur Dioxide (SO₂) | SO₂ | 64.06 | Medium (wet) | Wet → SS316; dry → CS |
| 32 | Hydrogen Sulfide (H₂S) | H₂S | 34.08 | **HIGH** | Sour gas → HC or Ti |
| 33 | Nitrous Oxide (N₂O) | N₂O | 44.01 | Low | SS316 OK |
| 34 | Nitric Oxide (NO) | NO | 30.01 | Low | SS316 OK |
| 35 | Nitrogen Dioxide (NO₂) | NO₂ | 46.01 | Medium | SS316 OK |
| 36 | Sulfur Hexafluoride (SF₆) | SF₆ | 146.06 | None | SS316 OK |
| 37 | Boron Trifluoride (BF₃) | BF₃ | 67.81 | **HIGH** | PTFE-lined only |
| 38 | Phosgene (COCl₂) | COCl₂ | 98.92 | High | SS316 OK (dry) |
| 39 | Cyanogen (C₂N₂) | C₂N₂ | 52.03 | High | SS316 OK |
| 40 | Carbonyl Sulfide (COS) | COS | 60.08 | Medium | SS316 OK |
| 41 | Silane (SiH₄) | SiH₄ | 32.12 | Pyrophoric | SS316 OK |
| 42 | Germane (GeH₄) | GeH₄ | 76.62 | Toxic | SS316 OK |
| 43 | Diborane (B₂H₆) | B₂H₆ | 27.67 | Pyrophoric | SS316 OK |
| 44 | Arsine (AsH₃) | AsH₃ | 77.95 | Toxic | SS316 OK |
| 45 | Phosphine (PH₃) | PH₃ | 34.00 | Toxic | SS316 OK |
| 46 | Methanol Vapor | CH₃OH | 32.04 | Low | SS316 OK |
| 47 | Ethanol Vapor | C₂H₅OH | 46.07 | Low | SS316 OK |
| 48 | Acetone Vapor | C₃H₆O | 58.08 | Low | SS316 OK |

### 2.5 Reactive / Specialty Gases (10 entries)

| # | Gas | Formula | MW | Corrosion Risk | MOC Note |
|---|-----|---------|-----|---------------|----------|
| 49 | Fluorine (F₂) | F₂ | 38.00 | **EXTREME** | Monel or PTFE-lined only |
| 50 | Bromine (Br₂) | Br₂ | 159.81 | **HIGH** | SS316 (dry); wet → HC |
| 51 | Iodine Vapor (I₂) | I₂ | 253.80 | Medium | SS316 OK |
| 52 | Ozone (O₃) | O₃ | 48.00 | Strong oxidizer | SS316 OK |
| 53 | Chlorine Dioxide (ClO₂) | ClO₂ | 67.45 | **HIGH** | Ti or PTFE-lined |
| 54 | Hydrogen Chloride (HCl gas) | HCl | 36.46 | **HIGH** (wet) | Wet → HC or Ti |
| 55 | Hydrogen Fluoride (HF gas) | HF | 20.01 | **EXTREME** | Monel or PTFE-lined |
| 56 | Hydrogen Bromide (HBr gas) | HBr | 80.91 | **HIGH** | HC or Ti |
| 57 | Hydrogen Iodide (HI gas) | HI | 127.91 | **HIGH** | HC or Ti |
| 58 | Carbon Monoxide (CO) | CO | 28.01 | None | SS316 OK |

### 2.6 Refrigerant Gases (6 entries)

| # | Gas | Formula | MW | MOC Note |
|---|-----|---------|-----|----------|
| 59 | R-134a | CH₂FCF₃ | 102.03 | SS316 OK |
| 60 | R-22 | CHClF₂ | 86.47 | SS316 OK |
| 61 | R-404A | Blend | 97.60 | SS316 OK |
| 62 | R-410A | Blend | 72.58 | SS316 OK |
| 63 | R-407C | Blend | 86.20 | SS316 OK |
| 64 | R-1234yf | CF₃CF=CH₂ | 114.04 | SS316 OK |

---

## SECTION 3: STEAM

### Saturated Steam Data Coverage

| Parameter | Range | Points |
|-----------|-------|--------|
| **Pressure (absolute)** | 2.0 to 20.0 bar abs | 14 points |
| **Saturation Temperature** | 120.2°C to 212.7°C | 14 points |
| **Density** | 1.129 to 10.05 kg/m³ | 14 points |
| **Line Sizes** | DN15 to DN300 | 14 sizes |

### Pressure Points

| # | Pressure (bar abs) | Saturation Temp (°C) | Density (kg/m³) |
|---|-------------------|----------------------|-----------------|
| 1 | 2 | 120.2 | 1.129 |
| 2 | 3 | 133.5 | 1.651 |
| 3 | 4 | 143.6 | 2.163 |
| 4 | 5 | 151.8 | 2.669 |
| 5 | 6 | 158.9 | 3.170 |
| 6 | 7 | 165.0 | 3.667 |
| 7 | 8 | 170.4 | 4.162 |
| 8 | 9 | 175.4 | 4.665 |
| 9 | 10 | 179.7 | 5.147 |
| 10 | 12 | 188.0 | 6.127 |
| 11 | 14 | 195.0 | 7.106 |
| 12 | 16 | 201.4 | 8.085 |
| 13 | 18 | 207.1 | 9.065 |
| 14 | 20 | 212.7 | 10.05 |

### Line Sizes (DN15 to DN300)

| Size | Application Range |
|------|------------------|
| DN15, DN20, DN25 | Small process lines, pilot plants |
| DN32, DN40, DN50 | Medium process lines |
| DN65, DN80, DN100 | Main process lines |
| DN125, DN150 | Large process lines |
| DN200, DN250, DN300 | Distribution headers, main steam |

### MOC for Steam Service

| Condition | Recommended MOC |
|-----------|-----------------|
| Saturated steam ≤ 200°C | SS316 or SS316L |
| Superheated steam ≤ 400°C | SS316 or SS321 |
| High-pressure steam > 400°C | SS321 stabilized |
| Wet steam (condensate) | SS316 with drain trap |

---

## SECTION 4: MOC DECISION MATRIX FOR PHASE II AI

### Priority 1: Highly Corrosive Fluids Requiring Special MOC

| Fluid | MOC Required | Why |
|-------|-------------|-----|
| Wet Chlorine | Titanium, Hastelloy C, PTFE | HCl + HOCl formation |
| Wet Ammonia | NO Cu/Brass/Bronze | Stress corrosion cracking |
| Hydrofluoric Acid | Monel, PTFE | Fluoride attacks SS316 |
| Fluorine Gas | Monel, PTFE | Extreme reactivity |
| Ferric Chloride | Hastelloy C, Titanium | Highly corrosive |
| Wet SO₂ | SS316 (dry), HC (wet) | Forms sulfuric acid |
| H₂S (sour gas) | Hastelloy C, Titanium | Sulfide corrosion |
| Aqua Regia | Titanium, PTFE | Mixed oxidizing acids |
| Chlorine Dioxide | Titanium, PTFE | Strong oxidizer |
| Hypochlorite (concentrated) | Titanium, Hastelloy C | Chloride + oxidizer |

### Priority 2: Fluids Requiring Temperature-Based MOC Selection

| Temperature Range | MOC |
|------------------|-----|
| ≤ 93°C (liquids) / ≤ 121°C (gases) | Borosilicate glass tube OK (rotameters) |
| ≤ 150°C | SS316 standard |
| 150-250°C | SS316 or Hastelloy C |
| 250-400°C | SS321 stabilized or Hastelloy C |
| 400-600°C | SS321, Inconel 625 |
| > 600°C (molten salt) | Inconel 625, Titanium |
| Cryogenic (< -100°C) | 9% Ni steel, SS304/316, Al 5083 |

### Priority 3: Slurry/Abrasive Applications

| Fluid Type | MOC Strategy |
|-----------|-------------|
| Low abrasiveness (paper stock) | SS316 with hardened internals |
| Medium abrasiveness (limestone) | SS316 with ceramic coating |
| High abrasiveness (sand, cement) | Hastelloy C or ceramic-lined |
| Extreme (TiO₂, mining slurry) | Full ceramic or tungsten carbide |

---

## SECTION 5: SUMMARY STATISTICS

| Category | Count | Notes |
|----------|-------|-------|
| **Total Liquids** | 228 | 14 sub-categories |
| **Total Gases** | 64 | 6 sub-categories |
| **Steam Pressure Points** | 14 | 2-20 bar abs |
| **Steam Line Sizes** | 14 | DN15 to DN300 |
| **Total Fluids** | **292+** | All with property data |
| **Corrosion Database Entries** | 200+ | SS316 + MS compatibility |
| **Gas Condensation Curves** | 3 | Cl₂, NH₃, CH₄ |
| **MOC Categories for AI** | 8 | Contact parts x material options |

### Liquids by Category

| Category | Count |
|----------|-------|
| Water & Aqueous | 6 |
| Acids | 22 |
| Alkalis / Bases | 8 |
| Organic Solvents | 42 |
| Oils & Petroleum | 28 |
| Chemicals & Process | 36 |
| Food & Beverage | 12 |
| Pharmaceutical | 10 |
| Slurries & Suspensions | 8 |
| Cryogenic | 12 |
| Vegetable Oils | 10 |
| Glycols & Polyols | 8 |
| Industrial Solvents | 12 |
| Miscellaneous | 14 |
| **TOTAL** | **228** |

### Gases by Category

| Category | Count |
|----------|-------|
| Atmospheric & Common | 12 |
| Fuel Gases | 10 |
| Inert Gases | 6 |
| Process & Industrial | 20 |
| Reactive / Specialty | 10 |
| Refrigerants | 6 |
| **TOTAL** | **64** |

---

*Document prepared for Flowtech Instruments (I) Pvt. Ltd. for Phase II MOC AI Module development.*

*All fluid data sourced from: NIST REFPROP, IUPAC, ASHRAE, Perry's Chemical Engineers' Handbook, and Flowtech factory data.*
