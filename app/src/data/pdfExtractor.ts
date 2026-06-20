// ============================================================
// PDF Text Extractor -- Extracts structured text from PDFs
// Uses Mozilla PDF.js with proper line-break and column detection
// ============================================================

import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface TextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
  hasEOL: boolean;
}

interface ExtractionResult {
  text: string;
  pages: number;
  isScanned: boolean;
  error?: string;
}

/**
 * Extract structured text from a PDF File.
 * Preserves line breaks and detects table columns via x-coordinates.
 */
export async function extractTextFromPDF(file: File): Promise<ExtractionResult> {
  let pdf: any = null;
  try {
    const arrayBuffer = await file.arrayBuffer();
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { text: "", pages: 0, isScanned: false, error: `Cannot open PDF: ${msg}. File may be corrupted or password-protected.` };
  }

  const totalPages = pdf.numPages;
  let fullText = "";
  let totalItems = 0;
  let itemsWithText = 0;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const items = textContent.items as TextItem[];
      totalItems += items.length;

      // Group items by line (similar y-coordinate)
      const lineMap: Map<number, TextItem[]> = new Map();
      const yThreshold = 3;

      for (const item of items) {
        if (!item.str || item.str.trim().length === 0) continue;
        itemsWithText++;

        const y = item.transform[5];
        let found = false;
        for (const [keyY, arr] of lineMap) {
          if (Math.abs(keyY - y) < yThreshold) {
            arr.push(item);
            found = true;
            break;
          }
        }
        if (!found) {
          lineMap.set(y, [item]);
        }
      }

      // Sort lines top-to-bottom (higher y = lower on page)
      const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
      for (const y of sortedYs) {
        const lineItems = lineMap.get(y)!.sort((a, b) => a.transform[4] - b.transform[4]);

        // Build line text with pipe delimiters for column gaps
        let lineText = "";
        for (let i = 0; i < lineItems.length; i++) {
          const it = lineItems[i];
          if (i > 0) {
            const prev = lineItems[i - 1];
            const prevEndX = prev.transform[4] + prev.width;
            const gap = it.transform[4] - prevEndX;
            lineText += gap > 15 ? " | " : " ";
          }
          lineText += it.str;
        }
        fullText += lineText + "\n";
      }
      fullText += "\n";
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      fullText += `\n[Error reading page ${pageNum}: ${msg}]\n`;
    }
  }

  if (totalItems > 0 && itemsWithText === 0) {
    return {
      text: "",
      pages: totalPages,
      isScanned: true,
      error: "This PDF appears to be image-based (scanned). Text cannot be extracted. Please copy-paste the text instead.",
    };
  }

  return { text: fullText.trim(), pages: totalPages, isScanned: false };
}

export function isPDF(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function isTextFile(file: File): boolean {
  const ext = file.name.toLowerCase();
  return ext.endsWith(".txt") || ext.endsWith(".csv") || file.type.startsWith("text/");
}

export async function readFileAsText(file: File): Promise<string> {
  if (isPDF(file)) {
    const result = await extractTextFromPDF(file);
    if (result.error) throw new Error(result.error);
    if (result.isScanned) throw new Error("Scanned PDF detected. Please copy-paste text instead.");
    return result.text;
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(String(e.target?.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
