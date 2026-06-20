// ============================================================
// UNIFIED CONNECTION DIMENSION DATABASE -- MM Only
// Covers ALL connection types: Flanged, Threaded, Clamp, Wafer, etc.
// Auto-detected from SO/Quotation process connection specs
// ============================================================

// ══════════════════════════════════════════════════════════════
// FLANGE DIMENSIONS (from existing flangeDimensions.ts data)
// ══════════════════════════════════════════════════════════════

export interface FlangeDim {
  od: number; thickness: number; pcd: number;
  boltHoles: number; boltHoleDia: number; boltSize: string;
  raisedFaceDia?: number; weight?: number;
}

export interface FlangeEntry {
  standard: string; fullName: string;
  dimensions: Record<number, FlangeDim>;
}

const ANSI_150: Record<number, FlangeDim> = {
  15:  { od: 89,  thickness: 11, pcd: 60,  boltHoles: 4,  boltHoleDia: 16, boltSize: "M14", raisedFaceDia: 35,  weight: 0.4 },
  20:  { od: 99,  thickness: 13, pcd: 70,  boltHoles: 4,  boltHoleDia: 16, boltSize: "M14", raisedFaceDia: 43,  weight: 0.6 },
  25:  { od: 108, thickness: 14, pcd: 79,  boltHoles: 4,  boltHoleDia: 16, boltSize: "M14", raisedFaceDia: 51,  weight: 0.8 },
  32:  { od: 117, thickness: 16, pcd: 89,  boltHoles: 4,  boltHoleDia: 16, boltSize: "M14", raisedFaceDia: 64,  weight: 1.1 },
  40:  { od: 127, thickness: 18, pcd: 99,  boltHoles: 4,  boltHoleDia: 16, boltSize: "M14", raisedFaceDia: 73,  weight: 1.4 },
  50:  { od: 152, thickness: 19, pcd: 121, boltHoles: 4,  boltHoleDia: 19, boltSize: "M16", raisedFaceDia: 92,  weight: 2.2 },
  65:  { od: 178, thickness: 22, pcd: 140, boltHoles: 4,  boltHoleDia: 19, boltSize: "M16", raisedFaceDia: 105, weight: 3.3 },
  80:  { od: 191, thickness: 24, pcd: 152, boltHoles: 4,  boltHoleDia: 19, boltSize: "M16", raisedFaceDia: 127, weight: 4.1 },
  90:  { od: 216, thickness: 24, pcd: 178, boltHoles: 8,  boltHoleDia: 19, boltSize: "M16", raisedFaceDia: 140, weight: 5.2 },
  100: { od: 229, thickness: 24, pcd: 191, boltHoles: 8,  boltHoleDia: 19, boltSize: "M16", raisedFaceDia: 157, weight: 5.9 },
  125: { od: 254, thickness: 24, pcd: 216, boltHoles: 8,  boltHoleDia: 22, boltSize: "M20", raisedFaceDia: 186, weight: 7.8 },
  150: { od: 279, thickness: 25, pcd: 241, boltHoles: 8,  boltHoleDia: 22, boltSize: "M20", raisedFaceDia: 216, weight: 10.0 },
  200: { od: 343, thickness: 29, pcd: 298, boltHoles: 8,  boltHoleDia: 22, boltSize: "M20", raisedFaceDia: 270, weight: 17.0 },
  250: { od: 406, thickness: 30, pcd: 362, boltHoles: 12, boltHoleDia: 25, boltSize: "M22", raisedFaceDia: 324, weight: 24.5 },
  300: { od: 483, thickness: 32, pcd: 432, boltHoles: 12, boltHoleDia: 25, boltSize: "M22", raisedFaceDia: 381, weight: 36.0 },
};

const ANSI_300: Record<number, FlangeDim> = {
  15:  { od: 95,  thickness: 14, pcd: 67,  boltHoles: 4,  boltHoleDia: 16, boltSize: "M14", raisedFaceDia: 35,  weight: 0.6 },
  20:  { od: 117, thickness: 16, pcd: 83,  boltHoles: 4,  boltHoleDia: 19, boltSize: "M16", raisedFaceDia: 43,  weight: 0.9 },
  25:  { od: 124, thickness: 18, pcd: 89,  boltHoles: 4,  boltHoleDia: 19, boltSize: "M16", raisedFaceDia: 51,  weight: 1.1 },
  32:  { od: 133, thickness: 21, pcd: 98,  boltHoles: 4,  boltHoleDia: 19, boltSize: "M16", raisedFaceDia: 64,  weight: 1.6 },
  40:  { od: 156, thickness: 22, pcd: 114, boltHoles: 4,  boltHoleDia: 22, boltSize: "M20", raisedFaceDia: 73,  weight: 2.4 },
  50:  { od: 165, thickness: 25, pcd: 127, boltHoles: 8,  boltHoleDia: 19, boltSize: "M16", raisedFaceDia: 92,  weight: 3.1 },
  65:  { od: 191, thickness: 29, pcd: 149, boltHoles: 8,  boltHoleDia: 22, boltSize: "M20", raisedFaceDia: 105, weight: 4.5 },
  80:  { od: 210, thickness: 32, pcd: 168, boltHoles: 8,  boltHoleDia: 22, boltSize: "M20", raisedFaceDia: 127, weight: 5.9 },
  90:  { od: 229, thickness: 32, pcd: 184, boltHoles: 8,  boltHoleDia: 22, boltSize: "M20", raisedFaceDia: 140, weight: 7.0 },
  100: { od: 254, thickness: 35, pcd: 200, boltHoles: 8,  boltHoleDia: 22, boltSize: "M20", raisedFaceDia: 157, weight: 9.2 },
  125: { od: 279, thickness: 38, pcd: 235, boltHoles: 8,  boltHoleDia: 22, boltSize: "M20", raisedFaceDia: 186, weight: 12.0 },
  150: { od: 318, thickness: 41, pcd: 270, boltHoles: 12, boltHoleDia: 22, boltSize: "M20", raisedFaceDia: 216, weight: 17.0 },
  200: { od: 381, thickness: 48, pcd: 330, boltHoles: 12, boltHoleDia: 25, boltSize: "M22", raisedFaceDia: 270, weight: 28.0 },
  250: { od: 445, thickness: 54, pcd: 387, boltHoles: 16, boltHoleDia: 29, boltSize: "M27", raisedFaceDia: 324, weight: 44.0 },
  300: { od: 521, thickness: 57, pcd: 451, boltHoles: 16, boltHoleDia: 32, boltSize: "M30", raisedFaceDia: 381, weight: 64.0 },
};

const DIN_PN16: Record<number, FlangeDim> = {
  15:  { od: 95,  thickness: 14, pcd: 65,  boltHoles: 4,  boltHoleDia: 14, boltSize: "M12", raisedFaceDia: 45,  weight: 0.67 },
  20:  { od: 105, thickness: 16, pcd: 75,  boltHoles: 4,  boltHoleDia: 14, boltSize: "M12", raisedFaceDia: 58,  weight: 0.93 },
  25:  { od: 115, thickness: 16, pcd: 85,  boltHoles: 4,  boltHoleDia: 14, boltSize: "M12", raisedFaceDia: 68,  weight: 1.11 },
  32:  { od: 140, thickness: 16, pcd: 100, boltHoles: 4,  boltHoleDia: 18, boltSize: "M16", raisedFaceDia: 78,  weight: 1.62 },
  40:  { od: 150, thickness: 16, pcd: 110, boltHoles: 4,  boltHoleDia: 18, boltSize: "M16", raisedFaceDia: 88,  weight: 1.85 },
  50:  { od: 165, thickness: 18, pcd: 125, boltHoles: 4,  boltHoleDia: 18, boltSize: "M16", raisedFaceDia: 102, weight: 2.46 },
  65:  { od: 185, thickness: 18, pcd: 145, boltHoles: 4,  boltHoleDia: 18, boltSize: "M16", raisedFaceDia: 122, weight: 2.99 },
  80:  { od: 200, thickness: 20, pcd: 160, boltHoles: 8,  boltHoleDia: 18, boltSize: "M16", raisedFaceDia: 138, weight: 3.61 },
  100: { od: 220, thickness: 20, pcd: 180, boltHoles: 8,  boltHoleDia: 18, boltSize: "M16", raisedFaceDia: 158, weight: 3.99 },
  125: { od: 250, thickness: 22, pcd: 210, boltHoles: 8,  boltHoleDia: 18, boltSize: "M16", raisedFaceDia: 188, weight: 5.41 },
  150: { od: 285, thickness: 22, pcd: 240, boltHoles: 8,  boltHoleDia: 22, boltSize: "M20", raisedFaceDia: 212, weight: 6.55 },
  200: { od: 340, thickness: 24, pcd: 295, boltHoles: 12, boltHoleDia: 22, boltSize: "M20", raisedFaceDia: 268, weight: 8.97 },
  250: { od: 405, thickness: 26, pcd: 355, boltHoles: 12, boltHoleDia: 26, boltSize: "M24", raisedFaceDia: 320, weight: 12.76 },
  300: { od: 460, thickness: 28, pcd: 410, boltHoles: 12, boltHoleDia: 26, boltSize: "M24", raisedFaceDia: 378, weight: 16.60 },
};

const DIN_PN40: Record<number, FlangeDim> = {
  15:  { od: 95,  thickness: 16, pcd: 65,  boltHoles: 4,  boltHoleDia: 14, boltSize: "M12", raisedFaceDia: 45,  weight: 0.8 },
  20:  { od: 105, thickness: 18, pcd: 75,  boltHoles: 4,  boltHoleDia: 14, boltSize: "M12", raisedFaceDia: 58,  weight: 1.1 },
  25:  { od: 115, thickness: 18, pcd: 85,  boltHoles: 4,  boltHoleDia: 14, boltSize: "M12", raisedFaceDia: 68,  weight: 1.3 },
  32:  { od: 140, thickness: 18, pcd: 100, boltHoles: 4,  boltHoleDia: 18, boltSize: "M16", raisedFaceDia: 78,  weight: 1.9 },
  40:  { od: 150, thickness: 18, pcd: 110, boltHoles: 4,  boltHoleDia: 18, boltSize: "M16", raisedFaceDia: 88,  weight: 2.1 },
  50:  { od: 165, thickness: 20, pcd: 125, boltHoles: 4,  boltHoleDia: 18, boltSize: "M16", raisedFaceDia: 102, weight: 2.9 },
  65:  { od: 185, thickness: 22, pcd: 145, boltHoles: 8,  boltHoleDia: 18, boltSize: "M16", raisedFaceDia: 122, weight: 3.6 },
  80:  { od: 200, thickness: 24, pcd: 160, boltHoles: 8,  boltHoleDia: 18, boltSize: "M16", raisedFaceDia: 138, weight: 4.5 },
  100: { od: 235, thickness: 24, pcd: 190, boltHoles: 8,  boltHoleDia: 22, boltSize: "M20", raisedFaceDia: 162, weight: 5.8 },
  125: { od: 270, thickness: 26, pcd: 220, boltHoles: 8,  boltHoleDia: 26, boltSize: "M24", raisedFaceDia: 188, weight: 8.5 },
  150: { od: 300, thickness: 28, pcd: 250, boltHoles: 8,  boltHoleDia: 26, boltSize: "M24", raisedFaceDia: 218, weight: 11.0 },
  200: { od: 375, thickness: 34, pcd: 320, boltHoles: 12, boltHoleDia: 30, boltSize: "M27", raisedFaceDia: 285, weight: 19.5 },
  250: { od: 450, thickness: 38, pcd: 385, boltHoles: 12, boltHoleDia: 33, boltSize: "M30", raisedFaceDia: 345, weight: 31.0 },
  300: { od: 515, thickness: 42, pcd: 450, boltHoles: 16, boltHoleDia: 33, boltSize: "M30", raisedFaceDia: 410, weight: 45.0 },
};

export const FLANGE_DB: Record<string, FlangeEntry> = {
  "ANSI 150#": { standard: "ANSI 150#", fullName: "ANSI B16.5 Class 150", dimensions: ANSI_150 },
  "ANSI 300#": { standard: "ANSI 300#", fullName: "ANSI B16.5 Class 300", dimensions: ANSI_300 },
  "ANSI 600#": { standard: "ANSI 600#", fullName: "ANSI B16.5 Class 600", dimensions: ANSI_300 },
  "DIN PN16":  { standard: "DIN PN16",  fullName: "DIN 2501 PN16",        dimensions: DIN_PN16 },
  "DIN PN40":  { standard: "DIN PN40",  fullName: "DIN 2501 PN40",        dimensions: DIN_PN40 },
  "DIN PN25":  { standard: "DIN PN25",  fullName: "DIN 2501 PN25",        dimensions: DIN_PN40 },
  "PN16":      { standard: "DIN PN16",  fullName: "DIN 2501 PN16",        dimensions: DIN_PN16 },
  "PN40":      { standard: "DIN PN40",  fullName: "DIN 2501 PN40",        dimensions: DIN_PN40 },
  "PN25":      { standard: "DIN PN25",  fullName: "DIN 2501 PN25",        dimensions: DIN_PN40 },
};

// ══════════════════════════════════════════════════════════════
// BSP THREADED DIMENSIONS (ISO 228 / BS 2779)
// ══════════════════════════════════════════════════════════════
export interface BspDim {
  nominalSize: string;  // "1/2", "1/4", "3/4", "1", etc.
  threadOD: number;     // Thread major diameter (mm)
  pitch: number;        // Thread pitch (mm)
  tpi: number;          // Threads per inch
  threadLength: number; // Effective thread length (mm)
  hexSize: number;      // Wrench flat size (mm)
  drillDia: number;     // Tapping drill diameter (mm)
}

const BSP_DATA: Record<string, BspDim> = {
  "1/8":  { nominalSize: "1/8",  threadOD: 9.73,  pitch: 0.907, tpi: 28, threadLength: 7,  hexSize: 14, drillDia: 8.6 },
  "1/4":  { nominalSize: "1/4",  threadOD: 13.16, pitch: 1.337, tpi: 19, threadLength: 9,  hexSize: 17, drillDia: 11.5 },
  "3/8":  { nominalSize: "3/8",  threadOD: 16.66, pitch: 1.337, tpi: 19, threadLength: 10, hexSize: 22, drillDia: 15.0 },
  "1/2":  { nominalSize: "1/2",  threadOD: 20.96, pitch: 1.814, tpi: 14, threadLength: 13, hexSize: 27, drillDia: 18.5 },
  "3/4":  { nominalSize: "3/4",  threadOD: 26.44, pitch: 1.814, tpi: 14, threadLength: 14, hexSize: 32, drillDia: 24.0 },
  "1":    { nominalSize: "1",    threadOD: 33.25, pitch: 2.309, tpi: 11, threadLength: 17, hexSize: 41, drillDia: 30.5 },
  "1-1/4":{ nominalSize: "1-1/4",threadOD: 41.91, pitch: 2.309, tpi: 11, threadLength: 19, hexSize: 50, drillDia: 39.0 },
  "1-1/2":{ nominalSize: "1-1/2",threadOD: 47.80, pitch: 2.309, tpi: 11, threadLength: 22, hexSize: 55, drillDia: 45.0 },
  "2":    { nominalSize: "2",    threadOD: 59.61, pitch: 2.309, tpi: 11, threadLength: 25, hexSize: 70, drillDia: 57.0 },
  "2-1/2":{ nominalSize: "2-1/2",threadOD: 75.18, pitch: 2.309, tpi: 11, threadLength: 26, hexSize: 85, drillDia: 72.0 },
  "3":    { nominalSize: "3",    threadOD: 87.88, pitch: 2.309, tpi: 11, threadLength: 30, hexSize: 100, drillDia: 85.0 },
  "4":    { nominalSize: "4",    threadOD: 113.03,pitch: 2.309, tpi: 11, threadLength: 35, hexSize: 130, drillDia: 110.0 },
};

// ══════════════════════════════════════════════════════════════
// NPT THREADED DIMENSIONS (ANSI/ASME B1.20.1)
// ══════════════════════════════════════════════════════════════
export interface NptDim {
  nominalSize: string;  // "1/8", "1/4", "1/2", etc.
  threadOD: number;     // Thread OD at gauge plane (mm)
  tpi: number;          // Threads per inch
  taper: string;        // Taper ratio
  threadLength: number; // Engagement length (mm)
  hexSize: number;      // Wrench flat size (mm)
  drillDia: number;     // Tapping drill (mm)
}

const NPT_DATA: Record<string, NptDim> = {
  "1/8":  { nominalSize: "1/8",  threadOD: 10.27, tpi: 27, taper: "1:16", threadLength: 7,  hexSize: 14, drillDia: 8.7 },
  "1/4":  { nominalSize: "1/4",  threadOD: 13.72, tpi: 18, taper: "1:16", threadLength: 10, hexSize: 17, drillDia: 11.2 },
  "3/8":  { nominalSize: "3/8",  threadOD: 17.15, tpi: 18, taper: "1:16", threadLength: 10, hexSize: 22, drillDia: 14.5 },
  "1/2":  { nominalSize: "1/2",  threadOD: 21.34, tpi: 14, taper: "1:16", threadLength: 14, hexSize: 27, drillDia: 18.0 },
  "3/4":  { nominalSize: "3/4",  threadOD: 26.67, tpi: 14, taper: "1:16", threadLength: 14, hexSize: 32, drillDia: 23.5 },
  "1":    { nominalSize: "1",    threadOD: 33.40, tpi: 11.5, taper: "1:16", threadLength: 17, hexSize: 41, drillDia: 29.5 },
  "1-1/4":{ nominalSize: "1-1/4",threadOD: 42.16, tpi: 11.5, taper: "1:16", threadLength: 19, hexSize: 50, drillDia: 38.0 },
  "1-1/2":{ nominalSize: "1-1/2",threadOD: 48.26, tpi: 11.5, taper: "1:16", threadLength: 22, hexSize: 55, drillDia: 44.0 },
  "2":    { nominalSize: "2",    threadOD: 60.33, tpi: 11.5, taper: "1:16", threadLength: 25, hexSize: 70, drillDia: 56.0 },
  "2-1/2":{ nominalSize: "2-1/2",threadOD: 73.03, tpi: 8,  taper: "1:16", threadLength: 26, hexSize: 85, drillDia: 68.5 },
};

// ══════════════════════════════════════════════════════════════
// TRI-CLAMP / SMS DIMENSIONS (DIN 32676 / ISO 2852)
// ══════════════════════════════════════════════════════════════
export interface TriClampDim {
  clampSize: string;     // "1/2", "3/4", "1", "2", etc.
  ferruleOD: number;     // Ferrule outer diameter (mm)
  tubeOD: number;        // Tube outer diameter (mm)
  gasketID: number;      // Gasket inner diameter (mm)
  gasketOD: number;      // Gasket outer diameter (mm)
  wingNutSize: number;   // Wing nut hex size (mm)
}

const TRI_CLAMP_DATA: Record<string, TriClampDim> = {
  "1/2":  { clampSize: "1/2",  ferruleOD: 25.0, tubeOD: 12.7,  gasketID: 15.5, gasketOD: 21.5, wingNutSize: 34 },
  "3/4":  { clampSize: "3/4",  ferruleOD: 25.0, tubeOD: 19.05, gasketID: 15.5, gasketOD: 21.5, wingNutSize: 34 },
  "1":    { clampSize: "1",    ferruleOD: 50.5, tubeOD: 25.4,  gasketID: 34.0, gasketOD: 43.5, wingNutSize: 54 },
  "1-1/2":{ clampSize: "1-1/2",ferruleOD: 50.5, tubeOD: 38.1,  gasketID: 34.0, gasketOD: 43.5, wingNutSize: 54 },
  "2":    { clampSize: "2",    ferruleOD: 64.0, tubeOD: 50.8,  gasketID: 47.5, gasketOD: 56.5, wingNutSize: 68 },
  "2-1/2":{ clampSize: "2-1/2",ferruleOD: 77.5, tubeOD: 63.5,  gasketID: 60.5, gasketOD: 70.5, wingNutSize: 82 },
  "3":    { clampSize: "3",    ferruleOD: 91.0, tubeOD: 76.2,  gasketID: 72.5, gasketOD: 83.5, wingNutSize: 95 },
  "4":    { clampSize: "4",    ferruleOD: 119.0,tubeOD: 101.6, gasketID: 97.0, gasketOD: 110.0,wingNutSize: 123 },
};

// ══════════════════════════════════════════════════════════════
// WAFER CONNECTION DIMENSIONS (for EMF, Orifice Plates)
// ══════════════════════════════════════════════════════════════
export interface WaferDim {
  sizeNB: number;        // Nominal bore (mm)
  faceToFace: number;    // Face-to-face dimension (mm)
  bodyOD: number;        // Body outer diameter (mm)
  boltCircle: number;    // Bolt circle diameter (mm)
  boltHoles: number;     // Number of bolt holes
  boltSize: string;      // Bolt size
  weight: number;        // Approx weight (kg)
}

// Face-to-face per ISO 5752 / API 609 Short Pattern
const WAFER_DATA: Record<number, WaferDim> = {
  15:  { sizeNB: 15,  faceToFace: 40,  bodyOD: 45,  boltCircle: 60,  boltHoles: 4, boltSize: "M12", weight: 0.3 },
  20:  { sizeNB: 20,  faceToFace: 45,  bodyOD: 55,  boltCircle: 70,  boltHoles: 4, boltSize: "M12", weight: 0.4 },
  25:  { sizeNB: 25,  faceToFace: 50,  bodyOD: 65,  boltCircle: 79,  boltHoles: 4, boltSize: "M12", weight: 0.5 },
  32:  { sizeNB: 32,  faceToFace: 55,  bodyOD: 75,  boltCircle: 89,  boltHoles: 4, boltSize: "M14", weight: 0.7 },
  40:  { sizeNB: 40,  faceToFace: 60,  bodyOD: 85,  boltCircle: 99,  boltHoles: 4, boltSize: "M14", weight: 0.9 },
  50:  { sizeNB: 50,  faceToFace: 65,  bodyOD: 105, boltCircle: 121, boltHoles: 4, boltSize: "M16", weight: 1.2 },
  65:  { sizeNB: 65,  faceToFace: 70,  bodyOD: 120, boltCircle: 140, boltHoles: 4, boltSize: "M16", weight: 1.8 },
  80:  { sizeNB: 80,  faceToFace: 75,  bodyOD: 135, boltCircle: 152, boltHoles: 4, boltSize: "M16", weight: 2.3 },
  100: { sizeNB: 100, faceToFace: 85,  bodyOD: 160, boltCircle: 191, boltHoles: 8, boltSize: "M16", weight: 3.5 },
  125: { sizeNB: 125, faceToFace: 95,  bodyOD: 185, boltCircle: 216, boltHoles: 8, boltSize: "M20", weight: 4.8 },
  150: { sizeNB: 150, faceToFace: 105, bodyOD: 215, boltCircle: 241, boltHoles: 8, boltSize: "M20", weight: 6.5 },
  200: { sizeNB: 200, faceToFace: 130, bodyOD: 270, boltCircle: 298, boltHoles: 8, boltSize: "M20", weight: 11.0 },
  250: { sizeNB: 250, faceToFace: 150, bodyOD: 325, boltCircle: 362, boltHoles: 12,boltSize: "M22", weight: 17.0 },
  300: { sizeNB: 300, faceToFace: 175, bodyOD: 380, boltCircle: 432, boltHoles: 12,boltSize: "M22", weight: 25.0 },
};

// ══════════════════════════════════════════════════════════════
// COMPRESSION FITTING DIMENSIONS (Swagelok-style)
// ══════════════════════════════════════════════════════════════
export interface CompressionDim {
  tubeOD: number;        // Tube outer diameter (mm)
  fittingType: string;   // "Single Ferrule" / "Double Ferrule"
  bodyHex: number;       // Body hex size (mm)
  nutHex: number;        // Nut hex size (mm)
  threadType: string;    // "BSP" / "NPT" / "Metric"
}

const COMPRESSION_DATA: Record<string, CompressionDim> = {
  "6":  { tubeOD: 6,  fittingType: "Double Ferrule", bodyHex: 12, nutHex: 12, threadType: "M12x1" },
  "8":  { tubeOD: 8,  fittingType: "Double Ferrule", bodyHex: 14, nutHex: 14, threadType: "M14x1" },
  "10": { tubeOD: 10, fittingType: "Double Ferrule", bodyHex: 17, nutHex: 17, threadType: "M16x1" },
  "12": { tubeOD: 12, fittingType: "Double Ferrule", bodyHex: 19, nutHex: 19, threadType: "M18x1.5" },
  "16": { tubeOD: 16, fittingType: "Double Ferrule", bodyHex: 24, nutHex: 24, threadType: "M22x1.5" },
  "18": { tubeOD: 18, fittingType: "Double Ferrule", bodyHex: 27, nutHex: 27, threadType: "M26x1.5" },
  "20": { tubeOD: 20, fittingType: "Double Ferrule", bodyHex: 30, nutHex: 30, threadType: "M30x2" },
  "25": { tubeOD: 25, fittingType: "Double Ferrule", bodyHex: 36, nutHex: 36, threadType: "M36x2" },
};

// ══════════════════════════════════════════════════════════════
// SOCKET WELD DIMENSIONS
// ══════════════════════════════════════════════════════════════
export interface SocketWeldDim {
  sizeNB: number;        // Nominal bore (mm)
  socketOD: number;      // Socket outer diameter (mm)
  socketID: number;      // Socket inner diameter (mm)
  socketDepth: number;   // Socket depth (mm)
  wallThickness: number; // Wall thickness (mm)
  counterBore: number;   // Counterbore diameter (mm)
}

const SOCKET_WELD_DATA: Record<number, SocketWeldDim> = {
  8:   { sizeNB: 8,   socketOD: 16.0, socketID: 11.8, socketDepth: 10, wallThickness: 2.1, counterBore: 12.5 },
  10:  { sizeNB: 10,  socketOD: 20.0, socketID: 15.6, socketDepth: 10, wallThickness: 2.2, counterBore: 16.5 },
  15:  { sizeNB: 15,  socketOD: 22.0, socketID: 17.6, socketDepth: 10, wallThickness: 2.2, counterBore: 18.5 },
  20:  { sizeNB: 20,  socketOD: 27.0, socketID: 22.3, socketDepth: 13, wallThickness: 2.3, counterBore: 23.5 },
  25:  { sizeNB: 25,  socketOD: 34.0, socketID: 28.0, socketDepth: 13, wallThickness: 3.0, counterBore: 29.5 },
  32:  { sizeNB: 32,  socketOD: 42.0, socketID: 35.5, socketDepth: 13, wallThickness: 3.2, counterBore: 37.0 },
  40:  { sizeNB: 40,  socketOD: 48.0, socketID: 41.2, socketDepth: 13, wallThickness: 3.4, counterBore: 43.0 },
  50:  { sizeNB: 50,  socketOD: 60.0, socketID: 52.1, socketDepth: 16, wallThickness: 3.9, counterBore: 54.0 },
  65:  { sizeNB: 65,  socketOD: 76.0, socketID: 66.1, socketDepth: 16, wallThickness: 4.9, counterBore: 68.0 },
  80:  { sizeNB: 80,  socketOD: 89.0, socketID: 78.0, socketDepth: 16, wallThickness: 5.5, counterBore: 80.5 },
};

// ══════════════════════════════════════════════════════════════
// UNIFIED DETECTED CONNECTION TYPE
// ══════════════════════════════════════════════════════════════

export type ConnectionCategory =
  | "flange"
  | "bsp"
  | "npt"
  | "tri-clamp"
  | "wafer"
  | "compression"
  | "socket-weld";

export interface DetectedConnection {
  category: ConnectionCategory;
  size: number;              // NB size in mm (e.g. 25, 50)
  sizeStr: string;           // Original size text (e.g. "25NB", "1/2 inch")
  standard: string;          // Matched standard key
  standardStr: string;       // Original standard text found
  // Type-specific data
  flangeData?: FlangeDim;
  bspData?: BspDim;
  nptData?: NptDim;
  triClampData?: TriClampDim;
  waferData?: WaferDim;
  compressionData?: CompressionDim;
  socketWeldData?: SocketWeldDim;
}

// ══════════════════════════════════════════════════════════════
// SIZE EXTRACTION (unified)
// ══════════════════════════════════════════════════════════════

function extractSize(text: string): { size: number; sizeStr: string } | null {
  const patterns = [
    { r: /\b(\d{1,3})\s*(?:NB|DN)\b/i,           get: (m: RegExpMatchArray) => parseInt(m[1]) },
    { r: /\bDN\s*(\d{1,3})\b/i,                   get: (m: RegExpMatchArray) => parseInt(m[1]) },
    { r: /\b(\d+(?:\/\d+)?)\s*["\u201D\u201C]\b/, get: (m: RegExpMatchArray) => inchToMm(m[1]) },
    { r: /\b(\d+(?:\/\d+)?)\s*(?:INCH|IN)\b/i,  get: (m: RegExpMatchArray) => inchToMm(m[1]) },
    { r: /\b(\d+(?:\.\d+)?)\s*MM\s*(?:OD|ID)?\b/i,get: (m: RegExpMatchArray) => {
      const v = parseFloat(m[1]);
      return v >= 6 && v <= 300 ? Math.round(v) : 0;
    }},
  ];

  for (const p of patterns) {
    const m = text.match(p.r);
    if (m) {
      const size = p.get(m);
      if (size && size >= 6 && size <= 300) return { size, sizeStr: m[0] };
    }
  }
  return null;
}

function inchToMm(inchStr: string): number {
  const map: Record<string, number> = {
    "1/8": 8, "1/4": 10, "3/8": 15, "1/2": 15,
    "3/4": 20, "1": 25, "1 1/4": 32, "1-1/4": 32, "1.25": 32,
    "1 1/2": 40, "1-1/2": 40, "1.5": 40, "2": 50,
    "2 1/2": 65, "2-1/2": 65, "2.5": 65, "3": 80,
    "3 1/2": 90, "3-1/2": 90, "3.5": 90, "4": 100,
    "5": 125, "6": 150, "8": 200, "10": 250, "12": 300,
  };
  return map[inchStr.trim()] || parseInt(inchStr) * 25 || 0;
}

function extractInchSize(text: string): string | null {
  const m = text.match(/\b(\d+(?:\/\d+)?)\s*(?:"|\u201D|\u201C|INCH|IN)\b/i);
  if (m) return m[1];
  return null;
}

// ══════════════════════════════════════════════════════════════
// CATEGORY + STANDARD DETECTION
// ══════════════════════════════════════════════════════════════

interface CategoryMatch {
  category: ConnectionCategory;
  standard: string;
  standardStr: string;
}

function detectCategory(text: string): CategoryMatch | null {
  const t = text.toUpperCase();

  // ── FLANGED ──
  if (/\bFLANGE|\bRF\b|\bFF\b|\bRTJ\b/.test(t)) {
    const std = detectFlangeStandard(text);
    if (std) return { category: "flange", ...std };
  }

  // ── BSP THREADED ──
  if (/\bBSP\b|\bBSPT\b|\bBSPP\b|\bG\s*THREAD/.test(t)) {
    return { category: "bsp", standard: "BSP", standardStr: "BSP (ISO 228)" };
  }

  // ── NPT THREADED ──
  if (/\bNPT\b|\bMNPT\b|\bFNPT\b|\bAMERICAN\s*THREAD/.test(t)) {
    return { category: "npt", standard: "NPT", standardStr: "NPT (ANSI B1.20.1)" };
  }

  // ── TRI-CLAMP ──
  if (/\bTRI[\s\-]?CLAMP\b|\bTC\b|\bSMS\b|\bCLAMP\b|\bCLAMP\s*TYPE|\bFER_RULE/.test(t)) {
    return { category: "tri-clamp", standard: "TC", standardStr: "Tri-Clamp (DIN 32676)" };
  }

  // ── WAFER ──
  if (/\bWAFER\b|\bWAFER\s*TYPE/.test(t)) {
    return { category: "wafer", standard: "WAFER", standardStr: "Wafer (ISO 5752)" };
  }

  // ── COMPRESSION ──
  if (/\bCOMPRESSION\b|\bSWAGELOK\b|\bFER_RULE\s*FIT/.test(t)) {
    return { category: "compression", standard: "COMP", standardStr: "Compression (Double Ferrule)" };
  }

  // ── SOCKET WELD ──
  if (/\bSOCKET\s*WELD|\bSW\b|\bSW\s*ENDS/.test(t)) {
    return { category: "socket-weld", standard: "SW", standardStr: "Socket Weld" };
  }

  // ── Fallback: detect standard without explicit category keyword ──
  // If a flange standard is mentioned but no "flange" keyword, still treat as flange
  const flangeStd = detectFlangeStandard(text);
  if (flangeStd) return { category: "flange", ...flangeStd };

  return null;
}

function detectFlangeStandard(text: string): { standard: string; standardStr: string } | null {
  const standards = [
    // ASA (American Standards Association) = ANSI predecessor, still widely used in India
    { r: /\bASA\s*(?:B16\.5\s*)?(?:CLASS\s*)?300\b/i, key: "ANSI 300#", str: "ASA/ANSI Class 300" },
    { r: /\bASA\s*(?:B16\.5\s*)?(?:CLASS\s*)?600\b/i, key: "ANSI 600#", str: "ASA/ANSI Class 600" },
    { r: /\bASA\s*(?:B16\.5\s*)?(?:CLASS\s*)?150\b/i, key: "ANSI 150#", str: "ASA/ANSI Class 150" },
    { r: /\bASA\s*150\b/i, key: "ANSI 150#", str: "ASA 150#" },
    { r: /\bASA\s*300\b/i, key: "ANSI 300#", str: "ASA 300#" },
    // ANSI patterns
    { r: /\bANSI\s*(?:B16\.5\s*)?(?:CLASS\s*)?300\b/i, key: "ANSI 300#", str: "ANSI Class 300" },
    { r: /\bANSI\s*(?:B16\.5\s*)?(?:CLASS\s*)?600\b/i, key: "ANSI 600#", str: "ANSI Class 600" },
    { r: /\bANSI\s*(?:B16\.5\s*)?(?:CLASS\s*)?150\b/i, key: "ANSI 150#", str: "ANSI Class 150" },
    { r: /\bCLASS\s*300\b/i, key: "ANSI 300#", str: "Class 300" },
    { r: /\bCLASS\s*600\b/i, key: "ANSI 600#", str: "Class 600" },
    { r: /\bCLASS\s*150\b/i, key: "ANSI 150#", str: "Class 150" },
    { r: /\b150\s*#\s*(?:LB|LBS|CLASS|RF|RAISED)?\b/i, key: "ANSI 150#", str: "150#" },
    { r: /\b300\s*#\s*(?:LB|LBS|CLASS|RF|RAISED)?\b/i, key: "ANSI 300#", str: "300#" },
    { r: /\b600\s*#\s*(?:LB|LBS|CLASS|RF|RAISED)?\b/i, key: "ANSI 600#", str: "600#" },
    { r: /\bDIN\s*(?:2501\s*)?PN40\b/i, key: "DIN PN40", str: "DIN PN40" },
    { r: /\bDIN\s*(?:2501\s*)?PN25\b/i, key: "DIN PN25", str: "DIN PN25" },
    { r: /\bDIN\s*(?:2501\s*)?PN16\b/i, key: "DIN PN16", str: "DIN PN16" },
    { r: /\bPN40\b/i, key: "DIN PN40", str: "PN40" },
    { r: /\bPN25\b/i, key: "DIN PN25", str: "PN25" },
    { r: /\bPN16\b/i, key: "DIN PN16", str: "PN16" },
    { r: /\bJIS\s*(?:B2220\s*)?20K\b/i, key: "ANSI 300#", str: "JIS 20K" },
    { r: /\bJIS\s*(?:B2220\s*)?10K\b/i, key: "ANSI 150#", str: "JIS 10K" },
    { r: /\bTABLE\s*H\b/i, key: "ANSI 300#", str: "Table H" },
    { r: /\bTABLE\s*E\b/i, key: "ANSI 150#", str: "Table E" },
  ];

  for (const s of standards) {
    const m = text.match(s.r);
    if (m) return { standard: s.key, standardStr: s.str };
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
// MAIN DETECTION FUNCTION (exported)
// ══════════════════════════════════════════════════════════════

export function detectConnection(text: string): DetectedConnection | null {
  const sizeInfo = extractSize(text);
  if (!sizeInfo) return null;

  const cat = detectCategory(text);
  if (!cat) return null;

  const result: DetectedConnection = {
    category: cat.category,
    size: sizeInfo.size,
    sizeStr: sizeInfo.sizeStr,
    standard: cat.standard,
    standardStr: cat.standardStr,
  };

  // Attach type-specific data
  switch (cat.category) {
    case "flange": {
      const entry = FLANGE_DB[cat.standard];
      if (entry) result.flangeData = entry.dimensions[sizeInfo.size];
      break;
    }
    case "bsp": {
      const inchStr = extractInchSize(text) || sizeToInch(sizeInfo.size);
      if (inchStr && BSP_DATA[inchStr]) result.bspData = BSP_DATA[inchStr];
      break;
    }
    case "npt": {
      const inchStr = extractInchSize(text) || sizeToInch(sizeInfo.size);
      if (inchStr && NPT_DATA[inchStr]) result.nptData = NPT_DATA[inchStr];
      break;
    }
    case "tri-clamp": {
      const inchStr = extractInchSize(text) || sizeToInch(sizeInfo.size);
      if (inchStr && TRI_CLAMP_DATA[inchStr]) result.triClampData = TRI_CLAMP_DATA[inchStr];
      break;
    }
    case "wafer": {
      result.waferData = WAFER_DATA[sizeInfo.size] || undefined;
      break;
    }
    case "compression": {
      const key = String(sizeInfo.size);
      if (COMPRESSION_DATA[key]) result.compressionData = COMPRESSION_DATA[key];
      break;
    }
    case "socket-weld": {
      result.socketWeldData = SOCKET_WELD_DATA[sizeInfo.size] || undefined;
      break;
    }
  }

  return result;
}

/** Convert NB size to nearest inch string for lookup */
function sizeToInch(nb: number): string | null {
  const map: Record<number, string> = {
    8: "1/4", 10: "3/8", 15: "1/2", 20: "3/4", 25: "1",
    32: "1-1/4", 40: "1-1/2", 50: "2", 65: "2-1/2",
    80: "3", 90: "3-1/2", 100: "4", 125: "5", 150: "6",
  };
  return map[nb] || null;
}

export function getStandardFullName(standardKey: string): string {
  return FLANGE_DB[standardKey]?.fullName || standardKey;
}

// ══════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY: re-export for flangeDimensions.ts
// ══════════════════════════════════════════════════════════════
export { FLANGE_DB as FLANGE_DATABASE };
export type { FlangeDim as FlangeDimensions };
export { detectConnection as detectProcessConnection };
