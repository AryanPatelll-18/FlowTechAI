// ============================================================
// P2: Sizing History — Save / Retrieve / Delete past calculations
// Uses localStorage for persistence across sessions
// ============================================================

import { useState, useCallback } from "react";

export interface SizingRecord {
  id: string;
  timestamp: number;
  dateStr: string;
  label: string;
  service: string;
  fluidName: string;
  flowRange: string;
  unit: string;
  bestMeter: string;
  bestSize: string;
  temperature: number;
  pressure: number;
}

const STORAGE_KEY = "flowtech_sizing_history";
const MAX_RECORDS = 20;

function loadHistory(): SizingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(records: SizingRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
  } catch {
    // localStorage full — silently fail
  }
}

export function useSizingHistory() {
  const [history, setHistory] = useState<SizingRecord[]>(loadHistory);

  const addRecord = useCallback((record: Omit<SizingRecord, "id" | "timestamp" | "dateStr">) => {
    const now = new Date();
    const newRecord: SizingRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      dateStr: now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
    };
    setHistory((prev) => {
      const next = [newRecord, ...prev].slice(0, MAX_RECORDS);
      saveHistory(next);
      return next;
    });
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, addRecord, deleteRecord, clearHistory };
}
