// ============================================================
// BACKWARD COMPATIBILITY RE-EXPORT
// All connection data now lives in connectionDimensions.ts
// ============================================================

export {
  // Main detection function
  detectConnection as detectProcessConnection,
  // Database
  FLANGE_DB as FLANGE_DATABASE,
  // Helpers
  getStandardFullName,
} from "./connectionDimensions";

export type {
  FlangeDim as FlangeDimensions,
  FlangeEntry as StandardEntry,
  DetectedConnection,
} from "./connectionDimensions";
