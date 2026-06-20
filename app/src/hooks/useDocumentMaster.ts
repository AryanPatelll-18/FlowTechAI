// ============================================================
// Document Master Hook — GA Drawing CRUD (IndexedDB backend)
// ============================================================

import { useState, useCallback, useEffect, useRef } from "react";
import type { GaDrawingEntry } from "../data/gaDrawingTypes";
import { formatFileSize, getFileType } from "../data/gaDrawingTypes";
import {
  storeDrawing,
  getAllDrawings,
  getFileDataUrl,
  getFileBlob,
  deleteDrawing as deleteFromDB,
  migrateFromLocalStorage,
  getDrawingCount as getIndexedDBCount,
  exportAllDrawings,
  importDrawings,
} from "../data/gaDrawingStorage";

export interface DocumentMasterState {
  drawings: GaDrawingEntry[];
  loading: boolean;
  error: string | null;
  // CRUD
  addDrawing: (drawing: Omit<GaDrawingEntry, "id" | "date" | "fileSize" | "fileType" | "fileData">, file: File) => Promise<void>;
  saveAnnotatedDrawing: (baseDrawing: GaDrawingEntry, annotatedDataUrl: string, annotationNote: string) => Promise<GaDrawingEntry | null>;
  deleteDrawing: (id: string) => void;
  getDrawingsByProduct: (productFamily: string) => GaDrawingEntry[];
  getProductFamilies: () => string[];
  getDrawingCount: (productFamily?: string) => number;
  // File access
  getFileUrl: (id: string) => Promise<string | null>;
  getFileBlob: (id: string) => Promise<Blob | null>;
  downloadFile: (drawing: GaDrawingEntry) => Promise<void>;
  // Backup & Restore
  exportDrawings: () => Promise<GaDrawingEntry[]>;
  importDrawings: (drawings: GaDrawingEntry[]) => Promise<number>;
  // Debug
  refreshDrawings: () => Promise<void>;
}

export function useDocumentMaster(): DocumentMasterState {
  const [drawings, setDrawings] = useState<GaDrawingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const urlCache = useRef<Record<string, string>>({});
  const initialized = useRef(false);

  // ─── Load on mount — with retry and migration ──────────
  const loadDrawings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try migration from old localStorage first
      try {
        const hasOldData = !!localStorage.getItem("flowtech_ga_drawings");
        if (hasOldData) {
          console.log("[DocumentMaster] Found old localStorage data, migrating...");
          const migrated = await migrateFromLocalStorage();
          console.log(`[DocumentMaster] Migrated ${migrated} drawings`);
        }
      } catch (migErr) {
        console.warn("[DocumentMaster] Migration error (non-critical):", migErr);
      }

      // Load from IndexedDB
      const data = await getAllDrawings();
      console.log(`[DocumentMaster] Loaded ${data.length} drawings from IndexedDB`);
      setDrawings(data);

      // Verify count
      const count = await getIndexedDBCount();
      console.log(`[DocumentMaster] IndexedDB count verification: ${count}`);
    } catch (e) {
      console.error("[DocumentMaster] Failed to load drawings:", e);
      setError("Failed to load drawings. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    loadDrawings();
  }, [loadDrawings]);

  // ─── Save annotated drawing from canvas data URL ──────
  const saveAnnotatedDrawing = useCallback(
    async (
      baseDrawing: GaDrawingEntry,
      annotatedDataUrl: string,
      annotationNote: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

        // Convert data URL to blob
        const res = await fetch(annotatedDataUrl);
        const blob = await res.blob();

        const newDrawing: GaDrawingEntry = {
          ...baseDrawing,
          id: `ga-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          drawingNo: `${baseDrawing.drawingNo}-ANNOTATED`,
          title: `${baseDrawing.title} (Annotated)`,
          date: dateStr,
          fileSize: formatFileSize(blob.size),
          fileType: "png",
          fileData: annotatedDataUrl,
          description: annotationNote
            ? `[Annotated ${dateStr}] ${annotationNote}`
            : `[Annotated ${dateStr}]`,
        };

        await storeDrawing(newDrawing, blob);
        console.log(`[DocumentMaster] Stored annotated drawing ${newDrawing.drawingNo}`);

        const data = await getAllDrawings();
        setDrawings(data);
        return newDrawing;
      } catch (e) {
        console.error("[DocumentMaster] Failed to save annotated drawing:", e);
        setError("Failed to save annotated drawing.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ─── Add new drawing ───────────────────────────────────
  const addDrawing = useCallback(
    async (
      drawing: Omit<GaDrawingEntry, "id" | "date" | "fileSize" | "fileType" | "fileData">,
      file: File
    ) => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

        const newDrawing: GaDrawingEntry = {
          ...drawing,
          id: `ga-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          date: dateStr,
          fileSize: formatFileSize(file.size),
          fileType: getFileType(file.name),
          fileData: "",
        };

        await storeDrawing(newDrawing, file);
        console.log(`[DocumentMaster] Stored drawing ${newDrawing.drawingNo}`);

        // Reload to confirm
        const data = await getAllDrawings();
        setDrawings(data);
      } catch (e) {
        console.error("[DocumentMaster] Failed to store drawing:", e);
        setError("Failed to store drawing. The file may be too large.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ─── Delete drawing ────────────────────────────────────
  const deleteDrawing = useCallback(async (id: string) => {
    if (urlCache.current[id]) {
      URL.revokeObjectURL(urlCache.current[id]);
      delete urlCache.current[id];
    }
    try {
      await deleteFromDB(id);
      const data = await getAllDrawings();
      setDrawings(data);
    } catch (e) {
      console.error("[DocumentMaster] Failed to delete:", e);
    }
  }, []);

  // ─── Get drawings by product family ────────────────────
  const getDrawingsByProduct = useCallback(
    (productFamily: string) => drawings.filter((d) => d.productFamily === productFamily),
    [drawings]
  );

  // ─── Get all product families that have drawings ───────
  const getProductFamilies = useCallback(() => {
    const families = new Set(drawings.map((d) => d.productFamily));
    return Array.from(families).sort();
  }, [drawings]);

  // ─── Get drawing count ─────────────────────────────────
  const getDrawingCount = useCallback(
    (productFamily?: string) => {
      if (productFamily) return drawings.filter((d) => d.productFamily === productFamily).length;
      return drawings.length;
    },
    [drawings]
  );

  // ─── Get file URL for preview ──────────────────────────
  const getFileUrl = useCallback(async (id: string): Promise<string | null> => {
    if (urlCache.current[id]) return urlCache.current[id];
    const dataUrl = await getFileDataUrl(id);
    if (dataUrl) urlCache.current[id] = dataUrl;
    return dataUrl;
  }, []);

  // ─── Download file ─────────────────────────────────────
  const downloadFile = useCallback(async (drawing: GaDrawingEntry) => {
    const blob = await getFileBlob(drawing.id);
    if (!blob) { alert("File not found in storage."); return; }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = drawing.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  // ─── Refresh drawings from DB ──────────────────────────
  const refreshDrawings = useCallback(async () => {
    await loadDrawings();
  }, [loadDrawings]);

  // ─── Export all drawings with file data ────────────────
  const exportDrawings = useCallback(async (): Promise<GaDrawingEntry[]> => {
    return await exportAllDrawings();
  }, []);

  // ─── Import drawings from backup ───────────────────────
  const importDrawingsCallback = useCallback(async (drawings: GaDrawingEntry[]): Promise<number> => {
    const count = await importDrawings(drawings);
    await loadDrawings();
    return count;
  }, [loadDrawings]);

  return {
    drawings,
    loading,
    error,
    addDrawing,
    saveAnnotatedDrawing,
    deleteDrawing,
    getDrawingsByProduct,
    getProductFamilies,
    getDrawingCount,
    getFileUrl,
    getFileBlob,
    downloadFile,
    exportDrawings,
    importDrawings: importDrawingsCallback,
    refreshDrawings,
  };
}
