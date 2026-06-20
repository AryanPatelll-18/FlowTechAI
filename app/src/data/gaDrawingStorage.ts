// ============================================================
// GA Drawing Storage — IndexedDB (handles large files)
// Replaces localStorage which has ~5-10MB limit
// ============================================================

import type { GaDrawingEntry } from "./gaDrawingTypes";

const DB_NAME = "FlowtechGADatabase";
const DB_VERSION = 1;
const STORE_DRAWINGS = "ga_drawings";
const STORE_FILES = "ga_files";

// ─── Open DB with validation and retry ─────────────────────
let dbInstance: IDBDatabase | null = null;
let dbOpening = false;

async function openDBInternal(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DRAWINGS)) {
        db.createObjectStore(STORE_DRAWINGS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: "id" });
      }
    };
  });
}

export async function openDB(): Promise<IDBDatabase> {
  // If we have a valid connection, return it
  if (dbInstance) {
    try {
      // Test if connection is still alive
      dbInstance.transaction([STORE_DRAWINGS], "readonly");
      return dbInstance;
    } catch {
      // Connection is dead, reset and reopen
      dbInstance = null;
    }
  }
  if (dbOpening) {
    // Another call is opening, wait and retry
    await new Promise((r) => setTimeout(r, 100));
    return openDB();
  }
  dbOpening = true;
  try {
    dbInstance = await openDBInternal();
    // Auto-close handler — reset so next call reopens
    dbInstance.onclose = () => { dbInstance = null; };
    return dbInstance;
  } finally {
    dbOpening = false;
  }
}

// ─── Store drawing metadata + file blob ────────────────────
export async function storeDrawing(entry: GaDrawingEntry, fileBlob: Blob): Promise<void> {
  const db = await openDB();

  // Store metadata (without fileData)
  const meta = { ...entry, fileData: "" };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_DRAWINGS], "readwrite");
    const store = tx.objectStore(STORE_DRAWINGS);
    const req = store.put(meta);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  // Store file blob separately
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_FILES], "readwrite");
    const store = tx.objectStore(STORE_FILES);
    const req = store.put({ id: entry.id, blob: fileBlob });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ─── Get all drawing metadata ──────────────────────────────
export async function getAllDrawings(): Promise<GaDrawingEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_DRAWINGS], "readonly");
    const store = tx.objectStore(STORE_DRAWINGS);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as GaDrawingEntry[]);
    req.onerror = () => reject(req.error);
  });
}

// ─── Get file blob for a drawing ───────────────────────────
export async function getFileBlob(id: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_FILES], "readonly");
    const store = tx.objectStore(STORE_FILES);
    const req = store.get(id);
    req.onsuccess = () => {
      const result = req.result;
      resolve(result ? result.blob : null);
    };
    req.onerror = () => reject(req.error);
  });
}

// ─── Get file as data URL (for preview) ────────────────────
export async function getFileDataUrl(id: string): Promise<string | null> {
  const blob = await getFileBlob(id);
  if (!blob) return null;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Delete a drawing and its file ─────────────────────────
export async function deleteDrawing(id: string): Promise<void> {
  const db = await openDB();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_DRAWINGS], "readwrite");
    const store = tx.objectStore(STORE_DRAWINGS);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_FILES], "readwrite");
    const store = tx.objectStore(STORE_FILES);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ─── Count total drawings ──────────────────────────────────
export async function getDrawingCount(): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_DRAWINGS], "readonly");
      const store = tx.objectStore(STORE_DRAWINGS);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return 0;
  }
}

// ─── Robust base64 data URL to Blob converter ──────────────
function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const commaIdx = dataUrl.indexOf(",");
    if (commaIdx === -1) return null;
    const base64 = dataUrl.substring(commaIdx + 1);
    const mimeMatch = dataUrl.match(/data:([^;]+);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";

    const byteChars = atob(base64);
    const byteNums = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNums[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNums);
    return new Blob([byteArray], { type: mimeType });
  } catch {
    return null;
  }
}

// ─── Migrate old localStorage data to IndexedDB ────────────
export async function migrateFromLocalStorage(): Promise<number> {
  let migratedCount = 0;
  try {
    const raw = localStorage.getItem("flowtech_ga_drawings");
    if (!raw) return 0;
    const oldDrawings: GaDrawingEntry[] = JSON.parse(raw);
    if (!Array.isArray(oldDrawings) || oldDrawings.length === 0) return 0;

    const db = await openDB();
    for (const d of oldDrawings) {
      // Check if this drawing already exists in IndexedDB
      const exists = await new Promise<boolean>((resolve) => {
        const tx = db.transaction([STORE_DRAWINGS], "readonly");
        const req = tx.objectStore(STORE_DRAWINGS).get(d.id);
        req.onsuccess = () => resolve(!!req.result);
        req.onerror = () => resolve(false);
      });
      if (exists) { migratedCount++; continue; }

      if (!d.fileData || d.fileData.length < 100) {
        // Metadata-only entry
        try {
          const meta = { ...d, fileData: "" };
          await new Promise<void>((r, reject) => {
            const tx = db.transaction([STORE_DRAWINGS], "readwrite");
            tx.objectStore(STORE_DRAWINGS).put(meta).onsuccess = () => r();
            tx.onerror = () => reject(tx.error);
          });
          migratedCount++;
        } catch { /* skip */ }
        continue;
      }
      try {
        const blob = dataUrlToBlob(d.fileData);
        if (!blob) continue;
        const meta = { ...d, fileData: "" };
        await new Promise<void>((r, reject) => {
          const tx = db.transaction([STORE_DRAWINGS], "readwrite");
          tx.objectStore(STORE_DRAWINGS).put(meta).onsuccess = () => r();
          tx.onerror = () => reject(tx.error);
        });
        await new Promise<void>((r, reject) => {
          const tx = db.transaction([STORE_FILES], "readwrite");
          tx.objectStore(STORE_FILES).put({ id: d.id, blob }).onsuccess = () => r();
          tx.onerror = () => reject(tx.error);
        });
        migratedCount++;
      } catch {
        // skip failed individual entries
      }
    }
    // Only clear localStorage if all entries were migrated
    if (migratedCount >= oldDrawings.length) {
      localStorage.removeItem("flowtech_ga_drawings");
    }
    return migratedCount;
  } catch {
    return migratedCount;
  }
}

// ─── Export all drawings as a serializable JSON object ─────
export async function exportAllDrawings(): Promise<GaDrawingEntry[]> {
  const drawings = await getAllDrawings();
  // Attach fileData back from blobs for export
  const result: GaDrawingEntry[] = [];
  for (const d of drawings) {
    const blob = await getFileBlob(d.id);
    if (blob) {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      result.push({ ...d, fileData: dataUrl });
    } else {
      result.push(d);
    }
  }
  return result;
}

// ─── Import drawings from JSON array ───────────────────────
export async function importDrawings(drawings: GaDrawingEntry[]): Promise<number> {
  let importedCount = 0;
  const db = await openDB();
  for (const d of drawings) {
    try {
      // Check if already exists
      const exists = await new Promise<boolean>((resolve) => {
        const tx = db.transaction([STORE_DRAWINGS], "readonly");
        const req = tx.objectStore(STORE_DRAWINGS).get(d.id);
        req.onsuccess = () => resolve(!!req.result);
        req.onerror = () => resolve(false);
      });
      if (exists) continue;

      const meta = { ...d, fileData: "" };
      await new Promise<void>((r, reject) => {
        const tx = db.transaction([STORE_DRAWINGS], "readwrite");
        tx.objectStore(STORE_DRAWINGS).put(meta).onsuccess = () => r();
        tx.onerror = () => reject(tx.error);
      });

      // Restore blob from fileData if available
      if (d.fileData && d.fileData.length > 100) {
        const commaIdx = d.fileData.indexOf(",");
        if (commaIdx > 0) {
          const base64 = d.fileData.substring(commaIdx + 1);
          const mimeMatch = d.fileData.match(/data:([^;]+);base64/);
          const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
          try {
            const byteChars = atob(base64);
            const byteNums = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
              byteNums[i] = byteChars.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNums);
            const blob = new Blob([byteArray], { type: mimeType });
            await new Promise<void>((r, reject) => {
              const tx = db.transaction([STORE_FILES], "readwrite");
              tx.objectStore(STORE_FILES).put({ id: d.id, blob }).onsuccess = () => r();
              tx.onerror = () => reject(tx.error);
            });
          } catch { /* skip blob restore */ }
        }
      }
      importedCount++;
    } catch { /* skip failed entry */ }
  }
  return importedCount;
}
