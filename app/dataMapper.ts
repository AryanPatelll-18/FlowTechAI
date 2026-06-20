// ============================================================
// Data Mapper -- Uses Smart Parser to extract ACTUAL values
// from uploaded quotation/SO text section-by-section
// Each instrument carries its own parsed sections
// ============================================================

import { parseSmart, type ParsedInstrument, type SectionData, type ExtractedProcessData } from "./smartParser";
import type { DetectedConnection } from "./flangeDimensions";
export type { SectionData, ExtractedProcessData } from "./smartParser";
export type { DetectedConnection } from "./flangeDimensions";

// ─── LineItem now carries dynamic section data ───────────────
export interface LineItem {
  srNo: number;
  tagNo: string;
  instrumentType: string;
  service: string;
  size: string;
  qty: number;
  model: string;
  decodNo: string; // De-Codification No. for instrument summary
  // Dynamic sections parsed from the quotation
  sections: SectionData[];
  gadNote: string;
  // GA Drawing from Document Master (auto-fetched)
  gaDrawingUrl: string; // data URL of the GA Drawing, or "" if not found
  gaDrawingTotal: number; // how many GA Drawings exist in Document Master for this product family
  // Process connection (auto-detected for flange dimension table)
  processConnection: DetectedConnection | null;
  // Process data extracted from SO text for sizing calculations
  processData: ExtractedProcessData;
  // Header references (for per-page rendering)
  header: SOHeader;
}

export interface SOHeader {
  soNo: string; // Holds SO No. OR Quotation/QTN No. depending on document type
  poNo: string;
  project: string;
  client: string;
  endUser: string;
  contractor: string;
  supplier: string;
  date: string;
  rev: string;
  revDescription: string;
  totalQty: string;
  totalLineItems: number;
  // Standards & notes (extracted from document only)
  notes: string[];
}

export interface SODatasheet {
  header: SOHeader;
  lineItems: LineItem[];
}

// ─── Convert ParsedInstrument to LineItem ────────────────────
function toLineItem(inst: ParsedInstrument, header: SOHeader): LineItem {
  return {
    srNo: inst.srNo,
    tagNo: inst.tagNo,
    instrumentType: inst.type,
    service: inst.service,
    size: inst.size,
    qty: inst.qty,
    model: inst.model,
    decodNo: inst.decodNo,
    sections: inst.sections,
    gadNote: inst.gadNote,
    gaDrawingUrl: "", // populated by api.ts after parsing
    gaDrawingTotal: 0, // populated by api.ts after parsing
    processConnection: inst.processConnection,
    processData: inst.processData,
    header,
  };
}

// ─── Build notes list from document only ─────────────────────
function buildNotes(instruments: ParsedInstrument[]): string[] {
  const notes: string[] = [];
  const seen = new Set<string>();
  for (const inst of instruments) {
    if (inst.gadNote && !seen.has(inst.gadNote)) {
      seen.add(inst.gadNote);
      notes.push(inst.gadNote);
    }
  }
  return notes;
}

// ─── Main parse function ─────────────────────────────────────
export function parseSOText(text: string): SODatasheet {
  const parsed = parseSmart(text);

  const header: SOHeader = {
    ...parsed.header,
    notes: buildNotes(parsed.instruments),
  };

  const lineItems = parsed.instruments.map(inst => toLineItem(inst, header));

  return { header, lineItems };
}


