/**
 * Shared Types — Cross-Module Data Flow
 * These types are used across Sizing, Documents, Projects, and Library modules
 * to enable seamless workflow integration.
 */

import type { ServiceType } from "../hooks/useCalculator";

// ═════════════════════════════════════════════════════════════════════════════
// PROJECT WORKFLOW TYPES
// ═════════════════════════════════════════════════════════════════════════════

export type ProjectStatus =
  | "draft"
  | "uploaded"
  | "extraction_completed"
  | "review_required"
  | "product_selection_checked"
  | "sizing_checked"
  | "document_mapping_completed"
  | "ready_for_report"
  | "exception_found"
  | "report_generated"
  | "closed";

export type LineItemStatus =
  | "extracted"
  | "reviewed"
  | "product_ok"
  | "product_warning"
  | "product_rejected"
  | "sizing_ok"
  | "sizing_warning"
  | "sizing_rejected"
  | "mapping_ok"
  | "mapping_incomplete"
  | "approved"
  | "hold"
  | "rejected";

export type ProductSelectionStatus =
  | "correct"
  | "warning"
  | "wrong"
  | "insufficient_data";

export type SizingVerificationStatus =
  | "correct"
  | "warning"
  | "wrong"
  | "cannot_verify";

export type DocumentMappingStatus =
  | "available"
  | "missing"
  | "not_required";

export interface ProjectMetadata {
  projectName: string;
  customerName: string;         // Contractor Name
  endClientName: string;        // End Client Name
  quoteNumber: string;           // SO / QTN Number
  poNumber: string;              // PO Number (empty string if "Not Mentioned")
  projectReferenceNumber: string;
  preparedBy: string;
  reviewedBy: string;
  revisionNumber: string;
  date: string;
  productFamily: string; // "known" or family id
  notes: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: "quote" | "so" | "inquiry" | "supporting";
  fileSize: number;
  uploadDate: number;
  uploadedBy: string;
  extractionStatus: "pending" | "processing" | "completed" | "failed";
  confidenceScore?: number;
  ocrText?: string;
}

export interface ProcessConditions {
  service: "liquid" | "gas" | "steam";
  fluidName: string;
  density: number;          // kg/m3
  viscosity: number;        // cP
  operatingTemp: number;    // C
  operatingPressure: number; // bar abs
  flowRateMin: number;
  flowRateMax: number;
  flowUnit: string;
  pipeSize: string;
  meterCategory: "inline" | "rotameter" | "both";
  // Gas-specific
  normFlowRateMin?: number;
  normFlowRateMax?: number;
  gasPressureBarAbs?: number;
  selectedGasName?: string;
  // Liquid-specific
  selectedLiquidName?: string;
  liquidPressureBarAbs?: number;
  // Steam-specific
  steamPressureBarAbs?: number;
  steamTempC?: number;
  steamState?: string;
}

export interface ExtractedLineItem {
  id: string;
  lineItemNo: string;
  tagNumber: string;
  productFamily: string;
  modelNumber: string;        // Full de-codification (e.g. FMIPL-DLS-FS2-...-1350mm)
  modelName: string;          // Model name only (e.g. FlowDLS L270FT)
  floatMoc: string;           // Float MOC for rotameters (from SO/QTN)
  size: string;
  quantity: number;
  application: string;
  processMedium: string;
  flowMin: string;
  flowMax: string;
  flowUnit: string;
  pressure: string;
  temperature: string;
  moc: string;
  processConnection: string;
  output: string;
  certification: string;
  notes: string;
  // Extracted technical specs (key-value pairs from SO, e.g. "Length": "1350 mm")
  specs: Record<string, string>;
  // ─── NEW: Full process conditions for sizing ───────────────────────
  processConditions?: ProcessConditions;
  // ─── NEW: Per-line-item sizing result ──────────────────────────────
  sizingResult?: {
    bestSize: string;
    bestProduct: string;
    qMin: number;
    qMax: number;
    qMinUnit: string;
    velocityMin?: number;
    velocityMax?: number;
    velocityStatus?: string;
    accuracy: string;
    turndown: number;
    status: string;
    reason?: string;
    waterEquivalent?: { weNorm: number; weMin: number; weMax: number; fcf: number; gcf: number };
    sizedAt: number;
    // Rotameter-specific: connection validation (tube vs connection are separate concepts)
    connectionValidation?: {
      soConnectionSize: string;
      soConnectionNb: number;
      tubeConnectionRange: string;
      tubeConnectionMin: number;
      tubeConnectionMax: number;
      isConnectionValid: boolean;
      status: "valid" | "invalid" | "na";
      message: string;
    };
    meterCategory?: "inline" | "rotameter" | "both";
  };
  // ─── NEW: Drawing Master — GA Drawing assignment ───────────────────
  gadDrawingId?: string | null;
  gadMappedAt?: number;
  // ─── NEW: Pre-generated report HTML (stored from tabs for final compilation)
  sizingReportHtml?: string;
  weReportHtml?: string;
  datasheetHtml?: string;
  // ─── NEW: Engineering validation review ────────────────────────────
  engineeringReview?: {
    reviewStatus: "ready" | "ready_with_assumptions" | "query_raised" | "hold" | "cannot_proceed";
    queries: Array<{
      fieldName: string; extractedValue: string; issue: string;
      whyConcern: string; requiredClarification: string;
      severity: "critical" | "major" | "minor" | "info";
      blocksSizing: boolean; blocksReport: boolean;
    }>;
    assumptions: Array<{
      field: string; assumedValue: string; basis: string;
      safe: boolean; needsConfirmation: boolean;
    }>;
    conversions: Array<{
      field: string; originalValue: string; convertedValue: string; conversionBasis: string;
    }>;
    missingMandatoryFields: string[];
    summary: {
      extractionStatus: string; unitReadingStatus: string;
      applicationUnitMatch: string; missingDataStatus: string;
      assumptionsUsed: number; queriesRaised: number; criticalQueries: number;
      productSelectionReady: boolean; sizingReady: boolean; reportReady: boolean;
      overallStatus: string;
    };
  };
  // ─── Custom Dimensions for Datasheet (5 rows x 2 cols, editable) ──
  customDimensions?: Array<{ label: string; value: string }>;
  // Verification
  extractionConfidence: number;
  lowConfidenceFields: string[];
  status: LineItemStatus;
}

export interface ProductSelectionCheck {
  lineItemId: string;
  instrumentId: string;
  status: ProductSelectionStatus;
  reason: string;
  ruleSource: string;
  recommendedAlternative?: string;
  confidence: number;
  checkedAt: number;
}

export interface SizingVerificationCheck {
  lineItemId: string;
  instrumentId: string;
  status: SizingVerificationStatus;
  inputData: Record<string, string>;
  calculationMethod: string;
  calculatedResult: string;
  acceptableRange: string;
  correctionRequired?: string;
  confidence: number;
  checkedAt: number;
}

export interface DocumentMappingCheck {
  lineItemId: string;
  documentType:
    | "cover_page"
    | "instrument_summary"
    | "datasheet"
    | "gad"
    | "qap"
    | "sizing_report"
    | "landscape_report"
    | "clickable_index";
  status: DocumentMappingStatus;
  fileName?: string;
  checkedAt: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// ENHANCED DOCUMENT PROJECT
// ═════════════════════════════════════════════════════════════════════════════

export interface DocumentProject {
  id: string;
  name: string;
  soNumber?: string;
  clientName?: string;
  createdAt: number;
  updatedAt: number;

  // ─── NEW: Full project metadata ────────────────────────────────────
  metadata: ProjectMetadata;
  status: ProjectStatus;
  statusHistory: { status: ProjectStatus; timestamp: number; note: string }[];

  // ─── NEW: Uploaded documents ───────────────────────────────────────
  uploadedDocuments: UploadedDocument[];

  // ─── NEW: Extracted line items ─────────────────────────────────────
  lineItems: ExtractedLineItem[];

  // ─── NEW: Verification checks ──────────────────────────────────────
  productSelectionChecks: ProductSelectionCheck[];
  sizingVerificationChecks: SizingVerificationCheck[];
  documentMappingChecks: DocumentMappingCheck[];

  // ─── NEW: Exception report ─────────────────────────────────────────
  exceptionReportHtml?: string;
  fullReportHtml?: string;
  reportGeneratedAt?: number;

  // Legacy instruments (for backward compat)
  instruments: DetectedInstrument[];

  // Sizing results for each instrument
  sizingResults: SizingResult[];
  levelResults: LevelResult[];
  pressureResults: PressureResult[];

  // Documents generated
  documents: GeneratedDocument[];
}

// ═════════════════════════════════════════════════════════════════════════════
// DETECTED INSTRUMENT (from SO/Quotation)
// ═════════════════════════════════════════════════════════════════════════════

export interface DetectedInstrument {
  id: string;
  itemNo: string;
  productFamily: string;
  productCode: string;
  description: string;
  size?: string;
  material?: string;
  specs: Record<string, string>;
  status: "detected" | "sized" | "documented" | "completed";
}

// ═════════════════════════════════════════════════════════════════════════════
// SIZING RESULT (produced by Flow/Level/Pressure sizing modules)
// ═════════════════════════════════════════════════════════════════════════════

export interface SizingResult {
  id: string;
  instrumentId: string;
  service: ServiceType;
  productName: string;
  productCode: string;
  meterCategory: "inline" | "rotameter" | "both";

  processConditions: {
    fluidName: string;
    density: number;
    viscosity: number;
    operatingTemp: number;
    operatingPressure: number;
    flowRateMin: number;
    flowRateMax: number;
    flowUnit: string;
    pipeSize: string;
  };

  bestSize: string;
  qMin: number;
  qMax: number;
  qMinUnit: string;
  velocityMin?: number;
  velocityMax?: number;
  velocityStatus?: "optimal" | "low" | "high" | "critical";
  accuracy: string;
  turndown: number;
  reynoldsMin?: number;
  reynoldsMax?: number;
  pressureDrop?: number;

  waterEquivalent?: {
    weNorm: number;
    weMin: number;
    weMax: number;
    fcf: number;
    gcf: number;
  };

  allConditionsCovered?: boolean;
  status: "optimal" | "valid" | "caution" | "rejected";
  reason?: string;
  sizedAt: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// LEVEL & PRESSURE RESULTS
// ═════════════════════════════════════════════════════════════════════════════

export interface LevelResult {
  id: string;
  instrumentId: string;
  deviceType: string;
  deviceName: string;
  processConditions: {
    c_c_distance_mm: number;
    processPressure_bar: number;
    processTemp_C: number;
    fluidDensity_kg_m3: number;
    measuringRange_mm: number;
  };
  recommendedSpecs: Record<string, string>;
  selectedAt: number;
}

export interface PressureResult {
  id: string;
  instrumentId: string;
  deviceType: string;
  deviceName: string;
  processConditions: {
    processPressure_bar: number;
    processTemp_C: number;
    ambientTemp_C: number;
    fluidType: string;
    application: string;
  };
  recommendedSpecs: Record<string, string>;
  selectedAt: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// GENERATED DOCUMENT
// ═════════════════════════════════════════════════════════════════════════════

export interface GeneratedDocument {
  id: string;
  type: "datasheet" | "qap" | "sizing_report" | "exception_report" | "full_report";
  instrumentId: string;
  title: string;
  generatedAt: number;
  downloadUrl?: string;
  status: "draft" | "final";
}

// ═════════════════════════════════════════════════════════════════════════════
// APP NAVIGATION
// ═════════════════════════════════════════════════════════════════════════════

export type MainTab =
  | "projects"
  | "sizing"
  | "documents"
  | "library"
  | "expert";

export type SizingSubTab =
  | "flow"
  | "level"
  | "pressure";

export type DocumentsSubTab = "datasheets";

export type LibrarySubTab =
  | "de_codification"
  | "model_datasheets"
  | "document_master";

export type ProjectWorkspaceTab =
  | "overview"
  | "uploaded_documents"
  | "extracted_line_items"
  | "engineering_query"
  | "product_selection"
  | "sizing_verification"
  | "datasheet_gad"
  | "document_master"
  | "qap_master"
  | "report_preview"
  | "final_reports";
