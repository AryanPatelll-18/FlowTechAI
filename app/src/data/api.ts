// ============================================================
// Unified Datasheet API
// ============================================================

import { parseSOText } from "./dataMapper";
import { generateDatasheetTemplate } from "./datasheetTemplate";
import { findGADrawing, getDrawingUrlById } from "./gaDrawingLookup";
import { runSizingCheckAll, isFlowInstrument } from "./soSizingBridge";
import type { SODatasheet } from "./dataMapper";

export type { SODatasheet, LineItem, SOHeader, SectionData } from "./dataMapper";

export async function generateFromSOText(soText: string) {
  // Step 1: Parse
  const datasheet = parseSOText(soText);

  // Step 2: Look up GA Drawings for each line item
  if (datasheet.lineItems.length > 0) {
    try {
      for (let i = 0; i < datasheet.lineItems.length; i++) {
        const li = datasheet.lineItems[i];
        const result = await findGADrawing(li.instrumentType, li.size, li.decodNo);
        if (result.best) {
          datasheet.lineItems[i].gaDrawingUrl = result.best.dataUrl;
          datasheet.lineItems[i].gaDrawingTotal = result.best.totalInFamily;
        }
      }
    } catch (e) {
      console.error("[API] GA Drawing lookup failed:", e);
    }
  }

  // Step 3: Run sizing check on flow instruments and set warnings
  try {
    const flowInstruments = datasheet.lineItems.filter((li) =>
      isFlowInstrument(li.instrumentType)
    );
    if (flowInstruments.length > 0) {
      const sizingResults = runSizingCheckAll(
        flowInstruments.map((li) => ({
          srNo: li.srNo,
          tagNo: li.tagNo,
          instrumentType: li.instrumentType,
          size: li.size,
          processData: li.processData,
        })),
        datasheet.header.soNo,
        datasheet.header.client,
        datasheet.header.project
      );
      // Apply warnings back to line items
      for (const sr of sizingResults) {
        if (sr.hasSizeMismatch && sr.warningMessage) {
          const idx = datasheet.lineItems.findIndex((li) => li.tagNo === sr.tagNo);
          if (idx >= 0) {
            datasheet.lineItems[idx].sizingWarning = sr.warningMessage;
          }
        }
      }
    }
  } catch (e) {
    console.error("[API] Sizing check failed:", e);
  }

  const html = generateDatasheetTemplate(datasheet);
  return { datasheet, html, lineItemCount: datasheet.lineItems.length };
}

/** Update a specific line item's GA Drawing and regenerate HTML */
export async function updateLineItemGADrawing(
  datasheet: SODatasheet,
  lineItemIdx: number,
  drawingId: string
): Promise<{ datasheet: SODatasheet; html: string }> {
  const dataUrl = await getDrawingUrlById(drawingId);
  if (dataUrl && datasheet.lineItems[lineItemIdx]) {
    datasheet.lineItems[lineItemIdx].gaDrawingUrl = dataUrl;
  }
  const html = generateDatasheetTemplate(datasheet);
  return { datasheet, html };
}

export function generateFromDatasheet(datasheet: SODatasheet): string {
  return generateDatasheetTemplate(datasheet);
}

export function openPrintWindow(html: string): void {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

export function downloadHtml(html: string, soNo: string): void {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Technical_Datasheet_${soNo || "SO"}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
