// Standard Pipe Inner Diameters (Schedule 40 / ISO 4200)
// Used for velocity calculation: v = Q / A = 4Q / (π × D²)
// Sources: ISO 4200, ASME B36.10M Schedule 40, Engineering Toolbox

export interface PipeDimension {
  nominalSize: string;     // e.g. "DN15", "15NB"
  dn: number;              // DN number (mm)
  outerDiameterMm: number; // OD in mm
  wallThicknessMm: number; // Wall thickness in mm (Schedule 40)
  innerDiameterMm: number; // ID in mm
  crossSectionalAreaM2: number; // A = π × (ID/2)² in m²
}

// Schedule 40 pipe dimensions for DN15-DN300
// Inner Diameter = OD - 2 × Wall Thickness
export const PIPE_DIMENSIONS: Record<string, PipeDimension> = {
  "DN15":  { nominalSize: "DN15",  dn: 15,  outerDiameterMm: 21.3,  wallThicknessMm: 2.77, innerDiameterMm: 15.76,  crossSectionalAreaM2: 0.0001951 },
  "DN20":  { nominalSize: "DN20",  dn: 20,  outerDiameterMm: 26.7,  wallThicknessMm: 2.87, innerDiameterMm: 20.96,  crossSectionalAreaM2: 0.0003449 },
  "DN25":  { nominalSize: "DN25",  dn: 25,  outerDiameterMm: 33.4,  wallThicknessMm: 3.38, innerDiameterMm: 26.64,  crossSectionalAreaM2: 0.0005574 },
  "DN32":  { nominalSize: "DN32",  dn: 32,  outerDiameterMm: 42.2,  wallThicknessMm: 3.56, innerDiameterMm: 35.08,  crossSectionalAreaM2: 0.0009664 },
  "DN40":  { nominalSize: "DN40",  dn: 40,  outerDiameterMm: 48.3,  wallThicknessMm: 3.68, innerDiameterMm: 40.94,  crossSectionalAreaM2: 0.0013163 },
  "DN50":  { nominalSize: "DN50",  dn: 50,  outerDiameterMm: 60.3,  wallThicknessMm: 3.91, innerDiameterMm: 52.48,  crossSectionalAreaM2: 0.0021644 },
  "DN65":  { nominalSize: "DN65",  dn: 65,  outerDiameterMm: 73.0,  wallThicknessMm: 5.16, innerDiameterMm: 62.68,  crossSectionalAreaM2: 0.0030862 },
  "DN80":  { nominalSize: "DN80",  dn: 80,  outerDiameterMm: 88.9,  wallThicknessMm: 5.49, innerDiameterMm: 77.92,  crossSectionalAreaM2: 0.0047706 },
  "DN100": { nominalSize: "DN100", dn: 100, outerDiameterMm: 114.3, wallThicknessMm: 6.02, innerDiameterMm: 102.26, crossSectionalAreaM2: 0.0082136 },
  "DN125": { nominalSize: "DN125", dn: 125, outerDiameterMm: 141.3, wallThicknessMm: 6.55, innerDiameterMm: 128.20, crossSectionalAreaM2: 0.0129033 },
  "DN150": { nominalSize: "DN150", dn: 150, outerDiameterMm: 168.3, wallThicknessMm: 7.11, innerDiameterMm: 154.08, crossSectionalAreaM2: 0.0186453 },
  "DN200": { nominalSize: "DN200", dn: 200, outerDiameterMm: 219.1, wallThicknessMm: 8.18, innerDiameterMm: 202.74, crossSectionalAreaM2: 0.0322766 },
  "DN250": { nominalSize: "DN250", dn: 250, outerDiameterMm: 273.1, wallThicknessMm: 9.27, innerDiameterMm: 254.56, crossSectionalAreaM2: 0.0508935 },
  "DN300": { nominalSize: "DN300", dn: 300, outerDiameterMm: 323.9, wallThicknessMm: 10.31, innerDiameterMm: 303.28, crossSectionalAreaM2: 0.0722222 },
  // Extended sizes for Electromagnetic (DN350-DN2000)
  "DN350": { nominalSize: "DN350", dn: 350, outerDiameterMm: 355.6, wallThicknessMm: 11.13, innerDiameterMm: 333.34, crossSectionalAreaM2: 0.0872971 },
  "DN400": { nominalSize: "DN400", dn: 400, outerDiameterMm: 406.4, wallThicknessMm: 12.70, innerDiameterMm: 381.00, crossSectionalAreaM2: 0.1140000 },
  "DN450": { nominalSize: "DN450", dn: 450, outerDiameterMm: 457.0, wallThicknessMm: 14.27, innerDiameterMm: 428.46, crossSectionalAreaM2: 0.1441000 },
  "DN500": { nominalSize: "DN500", dn: 500, outerDiameterMm: 508.0, wallThicknessMm: 15.09, innerDiameterMm: 477.82, crossSectionalAreaM2: 0.1792000 },
  "DN600": { nominalSize: "DN600", dn: 600, outerDiameterMm: 610.0, wallThicknessMm: 17.48, innerDiameterMm: 575.04, crossSectionalAreaM2: 0.2595000 },
  "DN700": { nominalSize: "DN700", dn: 700, outerDiameterMm: 711.0, wallThicknessMm: 18.00, innerDiameterMm: 675.00, crossSectionalAreaM2: 0.3578000 },
  "DN800": { nominalSize: "DN800", dn: 800, outerDiameterMm: 813.0, wallThicknessMm: 19.00, innerDiameterMm: 775.00, crossSectionalAreaM2: 0.4716000 },
  "DN900": { nominalSize: "DN900", dn: 900, outerDiameterMm: 914.0, wallThicknessMm: 20.00, innerDiameterMm: 874.00, crossSectionalAreaM2: 0.5999000 },
  "DN1000": { nominalSize: "DN1000", dn: 1000, outerDiameterMm: 1016.0, wallThicknessMm: 21.00, innerDiameterMm: 974.00, crossSectionalAreaM2: 0.7449000 },
  "DN1200": { nominalSize: "DN1200", dn: 1200, outerDiameterMm: 1220.0, wallThicknessMm: 25.00, innerDiameterMm: 1170.00, crossSectionalAreaM2: 1.0752000 },
  "DN1400": { nominalSize: "DN1400", dn: 1400, outerDiameterMm: 1420.0, wallThicknessMm: 28.00, innerDiameterMm: 1364.00, crossSectionalAreaM2: 1.4609000 },
  "DN1600": { nominalSize: "DN1600", dn: 1600, outerDiameterMm: 1620.0, wallThicknessMm: 32.00, innerDiameterMm: 1556.00, crossSectionalAreaM2: 1.9015000 },
  "DN1800": { nominalSize: "DN1800", dn: 1800, outerDiameterMm: 1820.0, wallThicknessMm: 36.00, innerDiameterMm: 1748.00, crossSectionalAreaM2: 2.3995000 },
  "DN2000": { nominalSize: "DN2000", dn: 2000, outerDiameterMm: 2020.0, wallThicknessMm: 40.00, innerDiameterMm: 1940.00, crossSectionalAreaM2: 2.9567000 },

  // ─── Glass Tube Rotameter PG Codes (Body DIA from Flowtech table) ───
  // Body DIA = glass tube outer diameter, approximate ID ≈ Body DIA - 6mm wall
  "PG-1":  { nominalSize: "PG-1",  dn: 24, outerDiameterMm: 30.0, wallThicknessMm: 3.0, innerDiameterMm: 24.00,  crossSectionalAreaM2: 0.0004524 },
  "PG-2":  { nominalSize: "PG-2",  dn: 24, outerDiameterMm: 30.0, wallThicknessMm: 3.0, innerDiameterMm: 24.00,  crossSectionalAreaM2: 0.0004524 },
  "PG-3":  { nominalSize: "PG-3",  dn: 24, outerDiameterMm: 30.0, wallThicknessMm: 3.0, innerDiameterMm: 24.00,  crossSectionalAreaM2: 0.0004524 },
  "PG-4":  { nominalSize: "PG-4",  dn: 32, outerDiameterMm: 38.0, wallThicknessMm: 3.0, innerDiameterMm: 32.00,  crossSectionalAreaM2: 0.0008042 },
  "PG-5":  { nominalSize: "PG-5",  dn: 32, outerDiameterMm: 38.0, wallThicknessMm: 3.0, innerDiameterMm: 32.00,  crossSectionalAreaM2: 0.0008042 },
  "PG-6":  { nominalSize: "PG-6",  dn: 32, outerDiameterMm: 38.0, wallThicknessMm: 3.0, innerDiameterMm: 32.00,  crossSectionalAreaM2: 0.0008042 },
  "PG-7":  { nominalSize: "PG-7",  dn: 37, outerDiameterMm: 43.0, wallThicknessMm: 3.0, innerDiameterMm: 37.00,  crossSectionalAreaM2: 0.0010749 },
  "PG-8":  { nominalSize: "PG-8",  dn: 37, outerDiameterMm: 43.0, wallThicknessMm: 3.0, innerDiameterMm: 37.00,  crossSectionalAreaM2: 0.0010749 },
  "PG-9":  { nominalSize: "PG-9",  dn: 51, outerDiameterMm: 57.0, wallThicknessMm: 3.0, innerDiameterMm: 51.00,  crossSectionalAreaM2: 0.0020428 },
  "PG-10": { nominalSize: "PG-10", dn: 51, outerDiameterMm: 57.0, wallThicknessMm: 3.0, innerDiameterMm: 51.00,  crossSectionalAreaM2: 0.0020428 },
  "PG-11": { nominalSize: "PG-11", dn: 66, outerDiameterMm: 72.0, wallThicknessMm: 3.0, innerDiameterMm: 66.00,  crossSectionalAreaM2: 0.0034191 },
  "PG-14": { nominalSize: "PG-14", dn: 66, outerDiameterMm: 72.0, wallThicknessMm: 3.0, innerDiameterMm: 66.00,  crossSectionalAreaM2: 0.0034191 },
  "PG-16": { nominalSize: "PG-16", dn: 88, outerDiameterMm: 94.0, wallThicknessMm: 3.0, innerDiameterMm: 88.00,  crossSectionalAreaM2: 0.0060821 },
  "PG-17": { nominalSize: "PG-17", dn: 96, outerDiameterMm: 102.0, wallThicknessMm: 3.0, innerDiameterMm: 96.00, crossSectionalAreaM2: 0.0072382 },
  "PG-87": { nominalSize: "PG-87", dn: 96, outerDiameterMm: 102.0, wallThicknessMm: 3.0, innerDiameterMm: 96.00, crossSectionalAreaM2: 0.0072382 },
};

// NB to DN mapping (Flowtech uses "NB" in tables, we map to DN)
// e.g. "15NB" -> "DN15"
export function nbToDn(size: string): string {
  if (size.startsWith("DN")) return size;
  const match = size.match(/(\d+)NB/);
  if (match) return `DN${match[1]}`;
  return size;
}

// Calculate velocity (m/s) for a given volumetric flow rate (m³/hr) and pipe size
export function calculateVelocity(
  flowM3hr: number,     // Flow rate in m³/hr
  sizeKey: string       // e.g. "DN15" or "15NB"
): number {
  const dn = nbToDn(sizeKey);
  const pipe = PIPE_DIMENSIONS[dn];
  if (!pipe) return 0;

  const flowM3s = flowM3hr / 3600; // Convert to m³/s
  const velocity = flowM3s / pipe.crossSectionalAreaM2; // v = Q/A
  return parseFloat(velocity.toFixed(2));
}

// Get velocity status relative to product limits
export function getVelocityStatus(
  velocity: number,
  vMin: number,
  vMax: number
): "too-low" | "optimal" | "valid" | "too-high" {
  if (velocity < vMin) return "too-low";
  if (velocity > vMax) return "too-high";
  const percentage = ((velocity - vMin) / (vMax - vMin)) * 100;
  if (percentage >= 25 && percentage <= 75) return "optimal";
  return "valid";
}
