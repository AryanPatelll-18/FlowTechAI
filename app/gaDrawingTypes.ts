// ============================================================
// GA Drawing Types — Document Master Section
// Stores all GA Drawings product-wise for Finished Goods
// ============================================================

export type DrawingFileType = "pdf" | "dwg" | "dxf" | "jpg" | "png";

export interface GaDrawingEntry {
  id: string;                    // Unique ID (timestamp-based)
  productFamily: string;         // e.g., "emf", "turbine", "rotameter"
  productName: string;           // Display name e.g., "Electromagnetic Flow Meter"
  drawingNo: string;             // e.g., "GAD-EMF-001"
  title: string;                 // Drawing title
  revision: string;              // Rev. 0, Rev. 1, etc.
  date: string;                  // Upload date DD/MM/YYYY
  fileName: string;              // Original uploaded file name
  fileType: DrawingFileType;     // pdf, dwg, dxf, jpg, png
  fileSize: string;              // Human readable size e.g., "1.2 MB"
  description: string;           // Optional notes
  // File content stored as base64 data URL
  fileData: string;              // data:application/pdf;base64,...
}

export interface GaDrawingFilter {
  productFamily: string | "all";  // Filter by product family
  searchQuery: string;            // Search in drawingNo/title
}

export const DRAWING_FILE_TYPES: { key: DrawingFileType; label: string }[] = [
  { key: "pdf", label: "PDF" },
  { key: "dwg", label: "AutoCAD DWG" },
  { key: "dxf", label: "DXF" },
  { key: "jpg", label: "JPEG Image" },
  { key: "png", label: "PNG Image" },
];

// ─── Generate next drawing number for a product family ─────
export function generateDrawingNo(productFamily: string, existingDrawings: GaDrawingEntry[]): string {
  const prefix = `GAD-${productFamily.toUpperCase()}`;
  const existingNumbers = existingDrawings
    .filter((d) => d.productFamily === productFamily)
    .map((d) => {
      const match = d.drawingNo.match(/-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
  const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
  const nextNum = String(maxNum + 1).padStart(3, "0");
  return `${prefix}-${nextNum}`;
}

// ─── Format file size ──────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// ─── Get file type from file name ──────────────────────────
export function getFileType(fileName: string): DrawingFileType {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "pdf": return "pdf";
    case "dwg": return "dwg";
    case "dxf": return "dxf";
    case "jpg":
    case "jpeg": return "jpg";
    case "png": return "png";
    default: return "pdf";
  }
}

// ─── Storage key for localStorage ──────────────────────────
export const GA_DRAWING_STORAGE_KEY = "flowtech_ga_drawings";
