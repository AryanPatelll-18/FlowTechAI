// ============================================================
// Model Explainer Guides — Naming Convention Documentation
// Each product family has a guide explaining model suffix codes
// ============================================================

export interface ExplainerItem {
  code: string;
  meaning: string;
  description: string;
}

export interface ModelExplainerGuide {
  family: string;
  overview: string;
  suffixCodes: ExplainerItem[];
  notes: string[];
}

export const MODEL_EXPLAINER_GUIDES: Record<string, ModelExplainerGuide> = {
  "Electromagnetic Flowmeter": {
    family: "Electromagnetic Flowmeter",
    overview: "FlowMag models follow a structured naming system where each suffix indicates a specific feature, material, or certification. The base model (e.g., S630) represents the standard configuration, while suffixes modify key components.",
    suffixCodes: [
      { code: "Base (S630)", meaning: "Standard Configuration", description: "SS 304 flowtube, PTFE lining, SS 316L electrodes, integral transmitter, weatherproof enclosure. General industrial water and mild chemical applications." },
      { code: "B", meaning: "Battery Operated", description: "3.6V Lithium battery-powered variant (5+ years life). For remote locations without mains power. Includes earthing ring." },
      { code: "F", meaning: "Food Grade / Sanitary", description: "Tri-Clover (TC) process connection for hygienic applications. Designed for dairy, beverage, and pharmaceutical industries with CIP/SIP capability." },
      { code: "Ex", meaning: "Flameproof", description: "PESO-certified flameproof enclosure (IIA, IIB, IIC groups). For hazardous area installations with intrinsically safe requirements." },
      { code: "ExF", meaning: "Flameproof + Full Config", description: "Fully configurable flameproof model. All positions are customer-specified for hazardous area applications requiring complete custom engineering." },
      { code: "900-", meaning: "High Specification Series", description: "Premium series with enhanced specifications. Includes upgraded coil housing, electrode options, and communication protocols." },
      { code: "PVC", meaning: "PVC / CPVC Construction", description: "Full custom PVC or CPVC construction for highly corrosive chemical applications. All wetted parts in corrosion-resistant thermoplastic." },
      { code: "30 / 60 / 90", meaning: "Pressure Class", description: "Numerical suffix indicates flange pressure rating and body specification level. Higher numbers = higher pressure capability." },
    ],
    notes: [
      "All EMF models use the de-codification format: FMIPL-EMFM-[Position1]-[Position2]-...-[PositionN]-NB",
      "Positions marked 'xx' are customer-configurable at order time.",
      "Flameproof (Ex) models require PESO certification and are marked with FLP enclosure protection.",
      "Battery models (B suffix) do not require external power supply — ideal for remote installations.",
    ],
  },

  "Turbine Flowmeter": {
    family: "Turbine Flowmeter",
    overview: "FlowTurb models use suffixes to indicate power source, enclosure type, and process connection options. The base model provides the core measurement capability with SS 316 construction.",
    suffixCodes: [
      { code: "Base (L270)", meaning: "Standard Configuration", description: "SS 316 flowtube, flanged connection, regular impeller (SS 410), weatherproof enclosure. For simple liquids with low or no conductivity." },
      { code: "B", meaning: "Battery Operated", description: "3.6V Lithium battery-powered variant (up to 5 years life). Same specifications as base model with battery power for remote locations." },
      { code: "Ex", meaning: "Flameproof", description: "PESO-certified flameproof enclosure (IIA, IIB, IIC). For hazardous area measurement of low-conductivity liquids." },
      { code: "F", meaning: "Full Configurable", description: "Fully configurable model where all specification positions are open for customer selection." },
      { code: "L360", meaning: "SS 316 All Wetted Parts", description: "Upgraded model with all wetted parts in SS 316 for improved corrosion resistance compared to L270." },
    ],
    notes: [
      "Turbine flowmeters are ideal for low-conductivity liquids where EMF cannot work.",
      "All models include weatherproof (WP) enclosure as standard.",
      "Battery models are maintenance-free for 5+ years in remote applications.",
    ],
  },

  "Vortex Flowmeter": {
    family: "Vortex Flowmeter",
    overview: "FlowVor models are designated by body material, connection type, and application-specific features. The suffix system indicates P&T compensation, IBR certification, and special construction options.",
    suffixCodes: [
      { code: "Base (L180)", meaning: "Standard Vortex", description: "Standard vortex flowmeter with flanged connection, integral transmitter, and weatherproof enclosure. For steam, gas, and liquid applications." },
      { code: "Ex", meaning: "Flameproof", description: "PESO-certified flameproof enclosure (IIA, IIB, IIC) for hazardous area installations." },
      { code: "F", meaning: "Full Configurable", description: "Fully configurable model with all specification positions open for customer selection." },
      { code: "SS", meaning: "SS 316 Body", description: "Full SS 316 body construction for corrosive media applications." },
      { code: "IBR", meaning: "IBR Approved", description: "Indian Boiler Regulation approved with P&T compensation. IBR approved drawings and inspection included." },
    ],
    notes: [
      "Vortex flowmeters are ideal for steam and gas applications where EMF is not suitable.",
      "IBR-approved models include P&T (Pressure & Temperature) compensation as standard.",
      "All vortex models use the de-codification format with position-by-position configuration.",
    ],
  },

  "Oval Gear Flowmeter": {
    family: "Oval Gear Flowmeter",
    overview: "FlowVal models indicate the body and rotor material, connection type, and enclosure protection. Higher model numbers (L400, L450) indicate more advanced features.",
    suffixCodes: [
      { code: "L270", meaning: "Standard Oval Gear", description: "Cost-effective model for high viscous liquids. Threaded connection, aluminium anodized rotor, SS 316 shaft. Direct pulse output without display." },
      { code: "L270F", meaning: "Custom Connection", description: "Same as L270 with customised process connection — flange-end or TC connection options available." },
      { code: "L360", meaning: "SS 316 Construction", description: "All wetted parts in SS 316 for corrosive and viscous liquids. Threaded connection with direct pulse output." },
      { code: "L360F", meaning: "SS 316 + Custom Connection", description: "SS 316 construction with customised flange or TC connection for corrosive viscous liquids." },
      { code: "L400", meaning: "Weatherproof Display", description: "Weatherproof display with LCD backlight. Dual power supply (230VAC & 24VDC). Aluminium rotor for viscous liquids." },
      { code: "L400Ex", meaning: "Flameproof Display", description: "Flameproof LCD display with PESO certification (IIA, IIB, IIC). For hazardous areas with viscous liquids." },
      { code: "L450", meaning: "Corrosive + Weatherproof", description: "SS 316 rotor and shaft for highly corrosive viscous liquids. Weatherproof display with RS 485 communication." },
      { code: "L450Ex", meaning: "Corrosive + Flameproof", description: "SS 316 rotor with flameproof display. PESO certified for hazardous areas with corrosive viscous liquids." },
    ],
    notes: [
      "Oval gear flowmeters excel at measuring high-viscosity liquids (10 to 300 cP).",
      "Accuracy of +/-0.5% to +/-1% of measured value (MV) depending on viscosity.",
      "Higher model numbers (L450 vs L270) indicate improved corrosion resistance and display features.",
    ],
  },

  "Glass Tube Rotameter": {
    family: "Glass Tube Rotameter",
    overview: "FlowGT models use a letter-number suffix system where 'R' indicates Glass Tube Rotameter, the number indicates the body specification level, and trailing letters indicate special features or materials.",
    suffixCodes: [
      { code: "R180", meaning: "MS Body — Standard", description: "Cost-effective measurement of standard liquids and gases. Mild steel (MS) end connections, MS powder-coated body. Borosilicate glass tube. Flange connection (ASA 150#)." },
      { code: "R180F", meaning: "MS Body — Custom Connection", description: "Same as R180 but with variable/customised process connection type and standard. Customer can specify flange, threaded, or TC connection." },
      { code: "R180T", meaning: "MS Body — Teflon Float", description: "Same as R180 but with Teflon (PTFE) float and retainer for corrosive liquid/gas applications at standard pressure." },
      { code: "R270", meaning: "SS 304 Body", description: "Advanced measurement with all SS 304 construction (end connections, body, scale). For corrosive liquids and gases. ASA 150# flange." },
      { code: "R270F", meaning: "SS 304 — Custom Connection", description: "SS 304 construction with variable/customised process connection. Higher pressure capability with lining." },
      { code: "R270T", meaning: "SS 304 — Teflon Float", description: "SS 304 construction with Teflon float and retainer. For corrosive media at standard pressure." },
      { code: "R360", meaning: "SS 316 Body", description: "Premium SS 316 construction for highly corrosive liquids and gases. ASA 150# flange with SS 316 wetted parts throughout." },
      { code: "R360F", meaning: "SS 316 — Custom Connection", description: "SS 316 construction with variable/customised process connection. For high-pressure corrosive applications." },
      { code: "R360T", meaning: "SS 316 — Teflon Float", description: "SS 316 body with Teflon float and retainer. Maximum corrosion resistance combination." },
      { code: "RP180", meaning: "PP Body (Polypropylene)", description: "Polypropylene end connections and float for aggressive chemical applications. Custom body MOC option (powder-coated MS or FRP)." },
      { code: "RS180", meaning: "SS 316 Body — Acrylic Scale", description: "SS 316 end connections with acrylic scale. Variable inlet/outlet configuration. Cost-effective SS construction." },
      { code: "RS180T", meaning: "SS 316 — Acrylic Scale + Teflon", description: "SS 316 construction with acrylic scale and Teflon float. For corrosive applications with acrylic scale visibility." },
    ],
    notes: [
      "All glass tube rotameters have borosilicate glass measuring tube and transparent acrylic protection cover.",
      "Scale length is 180-200 mm approx. for all models.",
      "Accuracy: +/-2% of FSD (Full Scale Deflection) across all models.",
      "F/F Height: 500 +/- 5 mm standard for all models.",
      "Temperature: -20 to 90°C | Pressure: 0 to 5 Bar standard.",
      "'F' suffix = Custom/variable process connection | 'T' suffix = Teflon float variant",
    ],
  },

  "Metal Tube Rotameter": {
    family: "Metal Tube Rotameter",
    overview: "FlowMet models use an L-number system where the number indicates the specification level. Suffix letters indicate special features like digital output, flameproof enclosure, or high-pressure capability.",
    suffixCodes: [
      { code: "L180", meaning: "Standard — Analogue", description: "Standard measurement for liquid and gas applications. SS 316 wetted parts, analogue output, weatherproof enclosure. ASA 150# flange." },
      { code: "L180F", meaning: "Standard — Custom Connection", description: "Same as L180 with variable/customised process connection type and standard. Higher pressure rating (up to 200 Bar)." },
      { code: "L360", meaning: "Digital + HART", description: "Advanced model with 4-20 mA + HART digital output. SS 316 wetted parts. For PLC-compatible applications requiring digital communication." },
      { code: "L360Ex", meaning: "Digital + Flameproof", description: "Same as L360 with PESO-certified flameproof enclosure (IIA, IIB, IIC). For hazardous areas with PLC integration." },
      { code: "L360F", meaning: "Digital — Custom + High Pressure", description: "Digital output with variable connection and high-pressure capability (up to 200 Bar). For demanding process conditions." },
      { code: "L600", meaning: "PTFE Lined — Corrosive", description: "For highly corrosive applications. SS 316 flowtube with PTFE lining. Teflon float. Analogue output. Weatherproof enclosure." },
      { code: "L600F", meaning: "PTFE Lined — High Pressure", description: "PTFE-lined model with high-pressure capability (up to 400 Bar). Variable process connection. For corrosive high-pressure media." },
      { code: "L630", meaning: "PTFE Lined + Digital", description: "PTFE-lined model with 4-20 mA + HART digital output. For corrosive applications requiring PLC integration." },
      { code: "L630Ex", meaning: "PTFE Lined + Digital + Flameproof", description: "PTFE-lined with digital output and flameproof enclosure. For hazardous areas with corrosive media." },
      { code: "L630F", meaning: "PTFE Lined + Digital + High Pressure", description: "PTFE-lined, digital output, high pressure (up to 400 Bar). Variable connection. Most versatile corrosive model." },
      { code: "L630ExF", meaning: "PTFE + Digital + Flameproof + High Pressure", description: "Full-featured model: PTFE lining, digital output, flameproof enclosure, and high pressure. For the most demanding applications." },
      { code: "L900", meaning: "Sanitary / Food Grade", description: "Designed for hygienic and food-grade applications. Special connections for CIP/SIP. Sanitary construction throughout." },
    ],
    notes: [
      "All metal tube rotameters have SS 316 wetted parts as standard unless specified otherwise.",
      "Turndown ratio: 1:10 | Accuracy: +/-2% FSD across all models.",
      "F/F Length: 250 mm (+/- 10 mm) standard.",
      "Installation: Vertical only.",
      "'Ex' suffix = Flameproof | 'F' suffix = Custom connection + high pressure | No suffix = Standard flange",
    ],
  },

  "Displacer Level Switch": {
    family: "Displacer Level Switch",
    overview: "FlowDLS models use an L-number system where the number indicates the body and float material specification. Suffix letters indicate special features like flameproof protection, custom connections, or Teflon coating.",
    suffixCodes: [
      { code: "L180", meaning: "PP Float + PP Spring Pipe", description: "Standard displacer level switch with PP (polypropylene) float, PP spring pipe, and SS 316 PTFE-coated spring. Flameproof enclosure. 52MM float dia x 100MM length." },
      { code: "L180F", meaning: "PP + Variable Contact", description: "Same as L180 with variable potential-free contact options (1 SPDT or 2 SPDT/DPDT)." },
      { code: "L270", meaning: "SS 316 Float + Hastelloy C Spring", description: "Upgraded model with SS 316 float and Hastelloy C spring. For higher temperature and more corrosive applications." },
      { code: "L270F", meaning: "SS 316 + Variable Connection", description: "SS 316 float with Hastelloy C spring and variable/customised process connection." },
      { code: "L270FT", meaning: "Teflon Float + Variable Connection", description: "Teflon (PTFE) float with Hastelloy C spring and variable connection. For highly corrosive media." },
      { code: "L270T", meaning: "Teflon Float + Hastelloy Spring", description: "Teflon float with Hastelloy C spring. Maximum corrosion resistance with standard connection." },
      { code: "L360", meaning: "SS 316 + PTFE Coating", description: "SS 316 float with PTFE coating on spring pipe. Hastelloy C spring. Enhanced corrosion protection." },
      { code: "L360F", meaning: "SS 316 PTFE + Variable", description: "SS 316 float with PTFE coating and variable process connection." },
      { code: "L360FT", meaning: "Teflon + Variable", description: "Teflon float with variable connection and PTFE-coated spring pipe." },
      { code: "L360T", meaning: "Teflon + PTFE Coating", description: "Teflon float with PTFE-coated spring pipe and Hastelloy C spring. Maximum chemical resistance." },
    ],
    notes: [
      "All displacer level switches have adjustable float lengths.",
      "Switch: Micro switch rated 230 VAC, 5 Amp.",
      "IP Rating: IP 67 | Hydro Test: Max. 10 Kg/Cm2.",
      "Temperature: -20 to 100°C standard.",
      "Protection: Flameproof (FLP) as standard across all models.",
    ],
  },

  "Radar Level Transmitter": {
    family: "Radar Level Transmitter",
    overview: "FlowSon models use an L-number system where the number indicates the sensor specification and application type. These are non-contact radar level transmitters for liquid and solid level measurement.",
    suffixCodes: [
      { code: "L360", meaning: "Basic — Water Applications", description: "For simple water applications. ABS sensor, 4-20 mA + Bluetooth output, 2-wire, 24 VDC. Without display. IP 68 sensor, IP 67 enclosure. Accuracy: +/-0.25% FSD." },
      { code: "L600", meaning: "Ultrasonic — PP Sensor", description: "Ultrasonic level transmitter with PP (polypropylene) sensor. 4-20 mA + HART output. For corrosive liquid applications. Weatherproof enclosure." },
      { code: "L600Ex", meaning: "Ultrasonic — Flameproof", description: "Same as L600 with flameproof enclosure. PESO certified for hazardous area applications with corrosive liquids." },
      { code: "L900", meaning: "Sanitary / Food Grade", description: "Designed for hygienic and food-grade applications. Special sensor construction for CIP/SIP processes." },
      { code: "L930", meaning: "High Temp / High Pressure", description: "For demanding applications with high temperature and high pressure. SS 316 sensor construction. 4-20 mA + HART output." },
    ],
    notes: [
      "All radar level transmitters use non-contact measurement principle.",
      "Sensor IP Grade: IP 68 | Enclosure IP Grade: IP 67.",
      "Output options: 4-20 mA, Bluetooth, HART protocol.",
      "Power supply: 24 VDC standard.",
      "Wiring: 2-wire as standard.",
    ],
  },

  "Tubular Level Indicator": {
    family: "Tubular Level Indicator",
    overview: "FlowTub models indicate the process connection type, body material, and glass specification. The numbering system reflects the construction material and pressure capability.",
    suffixCodes: [
      { code: "L180", meaning: "Standard — Flanged", description: "Standard tubular level indicator with flanged process connection (ASA 150#). Borosilicate glass tube. MS or CS body." },
      { code: "L180T", meaning: "Standard — Threaded", description: "Same as L180 with threaded (BSP/NPT) process connection for smaller pipe sizes." },
      { code: "L270", meaning: "SS 304 Construction", description: "All SS 304 construction including process connections and body. For corrosive liquid applications." },
      { code: "L360", meaning: "SS 316 Construction", description: "All SS 316 construction for highly corrosive liquid applications. Maximum corrosion resistance." },
      { code: "L360Ex", meaning: "SS 316 + Flameproof", description: "SS 316 construction with flameproof enclosure for hazardous area level indication." },
      { code: "L360ExF", meaning: "SS 316 + Flameproof + Custom", description: "Fully configurable SS 316 flameproof model with custom process connection options." },
      { code: "L360F", meaning: "SS 316 + Custom Connection", description: "SS 316 construction with variable/customised process connection type and standard." },
    ],
    notes: [
      "Tubular level indicators provide direct visual level indication.",
      "All models use borosilicate glass tubes for thermal shock resistance.",
      "Optional: Illuminator, heating jacket, and scale markers.",
      "Temperature: Up to 200°C | Pressure: Up to 16 Bar standard.",
    ],
  },

  "Side Mounted Magnetic Level Gauge": {
    family: "Side Mounted Magnetic Level Gauge",
    overview: "FlowMag-Level models indicate the chamber material, float material, and display type. The numbering reflects the specification level for different process conditions.",
    suffixCodes: [
      { code: "L180", meaning: "Standard — MS Chamber", description: "Standard side-mounted magnetic level gauge with MS (mild steel) chamber. SS 316 float. Flapper-type local display." },
      { code: "L180T", meaning: "Standard — Threaded", description: "Same as L180 with threaded process connection (BSP/NPT)." },
      { code: "L270", meaning: "SS 304 Chamber", description: "SS 304 chamber with SS 316 float. For corrosive liquid applications." },
      { code: "L270T", meaning: "SS 304 — Threaded", description: "SS 304 chamber with threaded process connection." },
      { code: "L360", meaning: "SS 316 Chamber", description: "SS 316 chamber and float for highly corrosive applications." },
      { code: "L360Ex", meaning: "SS 316 + Flameproof", description: "SS 316 construction with flameproof enclosure and PESO certification for hazardous areas." },
      { code: "L360F", meaning: "SS 316 + Custom Connection", description: "SS 316 construction with variable/customised process connection." },
      { code: "L360T", meaning: "SS 316 — Threaded", description: "SS 316 chamber with threaded process connection." },
      { code: "L450", meaning: "PTFE Lined", description: "PTFE-lined chamber for highly corrosive chemical applications." },
    ],
    notes: [
      "Magnetic level gauges use a magnetic float inside a chamber to drive an external visual indicator.",
      "Optional: Transmitter (4-20 mA), switches (SPDT/DPDT), and heating jacket.",
      "Temperature: Up to 400°C | Pressure: Up to 100 Bar.",
      "Visible indication without process contact — safe for hazardous media.",
    ],
  },

  "Reflex Level Gauge": {
    family: "Reflex Level Gauge",
    overview: "FlowRef models use an R-number system for reflex level gauges. The number indicates the body specification and material, with suffixes for special features like heating jackets or custom connections.",
    suffixCodes: [
      { code: "R180", meaning: "Standard — MS Body", description: "Standard reflex level gauge with MS (mild steel) body. Borosilicate reflex glass. ASA 150# flange connection." },
      { code: "R270", meaning: "SS 304 Body", description: "SS 304 body construction for corrosive liquid applications." },
      { code: "R360", meaning: "SS 316 Body", description: "SS 316 body for highly corrosive liquid applications." },
      { code: "R360Ex", meaning: "SS 316 + Flameproof", description: "SS 316 construction with flameproof features for hazardous areas." },
      { code: "R450", meaning: "PTFE Lined", description: "PTFE-lined body for highly corrosive chemical applications." },
      { code: "RH", meaning: "Heating Jacket", description: "With steam/heating jacket for crystallising or solidifying liquids." },
    ],
    notes: [
      "Reflex level gauges use prismatic glass to show liquid level as a dark band against a light background.",
      "Not suitable for transparent liquids (use Transparent Level Gauge instead).",
      "Temperature: Up to 400°C | Pressure: Up to 100 Bar.",
      "Optional: Illuminator, heating jacket, and drain/vent valves.",
    ],
  },
};

export function getExplainerGuide(family: string): ModelExplainerGuide | undefined {
  return MODEL_EXPLAINER_GUIDES[family];
}
