/**
 * Project Compilation Engine — Master Document Generator
 * Phase 1: Cover Page + Clickable Index + Instrument Summary
 * 
 * Compiles all project documents into one unified Flowtech-branded HTML.
 * Reuses existing report formats from other app sections.
 */

import type { ExtractedLineItem, ProjectMetadata, UploadedDocument } from "../types/shared";
import { QAP_MASTER_MAP, QAP_PRODUCT_LABELS, hasQapMaster } from "./qapMasterData";
import type { QapMasterEntry } from "./qapMasterData";
import { FLOWTECH_LOGO_B64 } from "./flowtechLogoBase64";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CompilationInput {
  metadata: ProjectMetadata;
  lineItems: ExtractedLineItem[];
  uploadedDocs: UploadedDocument[];
  // Pre-generated reports from other sections (stored in project state)
  sizingReports: Record<string, string>; // lineItemId -> HTML
  weReports: Record<string, string>;     // lineItemId -> HTML
  datasheetReports: Record<string, string>; // lineItemId -> HTML
  gadDrawingIds: Record<string, string>; // lineItemId -> drawingId
  gadImages: Record<string, string>;     // drawingId -> base64 data URL (fetched from IndexedDB)
  // QAP mapping: productFamily -> QAP entry
  qapMapping: Record<string, { status: "mapped" | "missing"; entry?: QapMasterEntry }>;
}

export interface CompilationResult {
  html: string;
  sectionCount: number;
  lineItemCount: number;
  qapCount: number;
  sizingCount: number;
  weCount: number;
  warnings: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function esc(t: string | null | undefined): string {
  const s = (t == null) ? "" : String(t);
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function anchorId(section: string, suffix?: string): string {
  return `ft-${section}${suffix ? "-" + suffix : ""}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

/** Build a professional Flowtech-branded table */
function tbl(h: string[], r: string[][], opts?: { landscape?: boolean; compact?: boolean }): string {
  const fs = opts?.compact ? 9 : 10;
  const th = h.map((c) => `<th style="background:#f9fafb;padding:${opts?.compact ? "4px 6px" : "6px 8px"};border:1px solid #d1d5db;font-size:${fs - 1}px;font-weight:600;color:#374151;text-align:left;white-space:nowrap;word-break:keep-all;">${c}</th>`).join("");
  const tr = r.map((row) => {
    const td = row.map((c, ci) => `<td style="padding:${opts?.compact ? "4px 6px" : "5px 8px"};border:1px solid #d1d5db;font-size:${fs}px;color:#4b5563;vertical-align:top;${ci === 0 ? "font-weight:500;background:#fafafa;white-space:nowrap;" : ""}">${c}</td>`).join("");
    return `<tr>${td}</tr>`;
  }).join("");
  return `<table style="width:100%;border-collapse:collapse;margin-bottom:10px;font-family:system-ui,sans-serif;table-layout:auto;"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}

/** Build index link row */
function idxLink(sr: number, section: string, desc: string, anchor: string): string {
  return `<tr><td style="padding:5px 8px;border:1px solid #e5e7eb;font-size:10px;color:#374151;text-align:center;width:40px;">${sr}</td><td style="padding:5px 8px;border:1px solid #e5e7eb;font-size:10px;color:#374151;font-weight:600;">${esc(section)}</td><td style="padding:5px 8px;border:1px solid #e5e7eb;font-size:10px;color:#6b7280;">${esc(desc)}</td><td style="padding:5px 8px;border:1px solid #e5e7eb;font-size:10px;text-align:center;width:80px;"><a href="#${anchor}" style="color:#c20017;text-decoration:none;font-weight:600;">Click to Open</a></td></tr>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS BADGES
// ═══════════════════════════════════════════════════════════════════════════

function statusBadge(status: string): string {
  const colors: Record<string, { bg: string; fg: string }> = {
    ready: { bg: "#dcfce7", fg: "#16a34a" },
    ready_with_assumptions: { bg: "#fef3c7", fg: "#d97706" },
    query_raised: { bg: "#fee2e2", fg: "#dc2626" },
    hold: { bg: "#fee2e2", fg: "#dc2626" },
    cannot_proceed: { bg: "#fecaca", fg: "#991b1b" },
    sized: { bg: "#dcfce7", fg: "#16a34a" },
    pending: { bg: "#fef3c7", fg: "#d97706" },
    not_required: { bg: "#f3f4f6", fg: "#6b7280" },
    available: { bg: "#dcfce7", fg: "#16a34a" },
    missing: { bg: "#fee2e2", fg: "#dc2626" },
  };
  const c = colors[status] || colors.pending;
  const label = status.replace(/_/g, " ").toUpperCase();
  return `<span style="display:inline-block;padding:1px 5px;border-radius:3px;background:${c.bg};color:${c.fg};font-size:8px;font-weight:700;white-space:nowrap;">${label}</span>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// QAP LOOKUP
// ═══════════════════════════════════════════════════════════════════════════

function findQapForLineItem(li: ExtractedLineItem): { status: "mapped" | "missing"; entry?: QapMasterEntry; familyKey?: string } {
  const pfl = (li.productFamily || "").toLowerCase();
  if (!pfl) return { status: "missing" };

  // Special case: bypass rotameter
  if (pfl.includes("by-pass") || pfl.includes("by pass") || pfl.includes("bypass")) {
    if (hasQapMaster("bypass_rotameter")) {
      return { status: "mapped", entry: QAP_MASTER_MAP["bypass_rotameter"], familyKey: "bypass_rotameter" };
    }
  }

  // Find matching QAP family
  for (const [key, label] of Object.entries(QAP_PRODUCT_LABELS)) {
    const labelLower = label.toLowerCase();
    if (labelLower.includes(pfl) || pfl.includes(labelLower.split(" ")[0])) {
      if (hasQapMaster(key)) {
        return { status: "mapped", entry: QAP_MASTER_MAP[key as keyof typeof QAP_MASTER_MAP], familyKey: key };
      }
    }
  }

  return { status: "missing" };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPILATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export function compileProjectDocument(input: CompilationInput): CompilationResult {
  const { metadata, lineItems, uploadedDocs, sizingReports, weReports, datasheetReports, gadDrawingIds, gadImages, qapMapping } = input;
  const warnings: string[] = [];
  const date = new Date().toLocaleDateString("en-GB");
  let srNo = 1;
  let html = "";
  const familyQapMap = new Map<string, string>();

  try {

  const seenFamilies = new Set<string>();
  for (const li of lineItems) {
    const qapResult = findQapForLineItem(li);
    if (qapResult.familyKey && !seenFamilies.has(qapResult.familyKey)) {
      seenFamilies.add(qapResult.familyKey);
      familyQapMap.set(qapResult.familyKey, li.id);
    }
  }

  // ─── CSS — Formal Engineering Document Style (Black & White) ─────
  html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(metadata.projectName || "Flowtech Project Document")}</title>
<style>
@page { size: A4; margin: 12mm; }
@page :first { margin: 0; }
@page landscape { size: A4 landscape; margin: 12mm; }
body { font-family: Arial, Helvetica, sans-serif; color: #000; line-height: 1.4; font-size: 10px; margin: 0; padding: 0; }
.page { page-break-after: always; padding: 8mm; }
.page:last-child { page-break-after: auto; }
.landscape-page { page: landscape; page-break-before: always; padding: 8mm; }

/* Cover Page — Professional Engineering Style (Table-based for consistent alignment) */
.cover-page { width: 100%; height: 100vh; page-break-after: always; border: 3px solid #000; margin: 0; padding: 0; box-sizing: border-box; }
.cover-page table { border-collapse: collapse; width: 100%; }
.cover-header-cell { text-align: center; padding: 40px 40px 20px; border-bottom: 2px solid #000; }
.cover-header-cell .company-name { font-size: 13px; font-weight: 700; color: #000; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
.cover-header-cell .doc-title { font-size: 18px; font-weight: 700; color: #c20017; letter-spacing: 4px; text-transform: uppercase; }
.cover-body-cell { vertical-align: middle; padding: 40px 60px; }
.cover-info-table { width: 100%; max-width: 520px; margin: 0 auto; border: 1px solid #000; border-collapse: collapse; }
.cover-info-table td { padding: 10px 14px; font-size: 10px; border: 1px solid #000; vertical-align: middle; }
.cover-info-table .label-cell { width: 38%; background: #f0f0f0; font-weight: 700; color: #000; text-align: left; }
.cover-info-table .value-cell { width: 62%; font-weight: 600; color: #000; text-align: left; }
.cover-footer-cell { text-align: center; padding: 20px 40px 30px; border-top: 1px solid #000; }
.cover-footer-cell .footer-text { font-size: 8px; color: #333; font-weight: 600; letter-spacing: 0.5px; }

/* Sections */
h2 { font-size: 13px; color: #000; border-bottom: 2px solid #000; padding-bottom: 3px; margin: 14px 0 8px; font-weight: 700; text-transform: uppercase; }
h3 { font-size: 11px; color: #000; margin: 10px 0 5px; font-weight: 700; }
h4 { font-size: 10px; color: #000; margin: 6px 0 3px; font-weight: 700; }

/* Info boxes — monochrome */
.warn { border: 1px solid #000; padding: 6px 10px; margin: 6px 0; font-size: 9px; font-weight: 600; }
.info { border: 1px solid #666; padding: 6px 10px; margin: 6px 0; font-size: 9px; }
.note { border: 1px solid #999; padding: 6px 10px; margin: 6px 0; font-size: 9px; }
.success { border: 1px solid #000; padding: 6px 10px; margin: 6px 0; font-size: 9px; font-weight: 600; }

/* Tables — formal engineering */
table { max-width: 100%; overflow-wrap: break-word; word-wrap: break-word; border-collapse: collapse; }
td, th { max-width: 300px; overflow-wrap: break-word; border: 1px solid #000; }
th { background: #f5f5f5; color: #000; font-weight: 700; font-size: 8px; text-transform: uppercase; padding: 4px 6px; }
td { padding: 3px 6px; font-size: 9px; color: #000; }
tr:nth-child(even) { background: #fafafa; }

/* Footer */
.footer { text-align: center; font-size: 8px; color: #333; margin-top: 12px; padding-top: 6px; border-top: 1px solid #000; font-weight: 600; }
p, ul, li { font-size: 9px; color: #000; margin: 2px 0; }
ul { padding-left: 14px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

/* Header bar on every page */
.page-header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 12px; }
.page-header-bar .company { font-size: 9px; font-weight: 700; color: #c20017; text-transform: uppercase; letter-spacing: 0.5px; }
.page-header-bar .doc-title { font-size: 8px; font-weight: 700; color: #000; text-transform: uppercase; }
.page-header-bar .page-info { font-size: 8px; color: #333; font-weight: 600; }
</style></head><body>`;

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 1: COVER PAGE — uses shared body builder
  // ═══════════════════════════════════════════════════════════════════
  // srNo is already 1 (cover page)
  html += buildCoverPageBody(metadata);

  // ═══════════════════════════════════════════════════════════════════
  // PAGE 2: INSTRUMENT INDEX — uses shared body builder
  // ═══════════════════════════════════════════════════════════════════
  srNo++; // Instrument Index = section 2
  const idxAnchor = anchorId("index");
  html += `<div class="page" id="${idxAnchor}" style="page-break-after:always;">
    ${buildInstrumentIndexBody(metadata, lineItems)}
  </div>`;

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 2: INSTRUMENT SUMMARY (integrated into Instrument Index above)
  // ═══════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════
  // PLACEHOLDER SECTIONS (for Phase 2-5)
  // ═══════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════
  // SECTION: DATASHEET + GAD PER LINE ITEM (Phase 5)
  // Project header on every page + actual GAD image + clean tabular format
  // ═══════════════════════════════════════════════════════════════════
  for (const li of lineItems) {
    srNo++; // Each datasheet = new section
    const dsAnchor = anchorId("datasheet", li.id);

    // ════════════════════════════════════════════════════════════════════
    // Build specs table FROM li.specs — all data extracted from the SO
    // ════════════════════════════════════════════════════════════════════
    const isFlowDevice = /flowmeter|flow meter|rotameter/i.test(li.productFamily);
    const isLevelDevice = /level gauge|level indicator|level switch|level transmitter|float.*board|sight glass|radar level|hydrostatic/i.test(li.productFamily);

    const generalRows: [string, string][] = [];
    const processRows: [string, string][] = [];
    const techRows: [string, string][] = [];
    const designRows: [string, string][] = [];
    const accessoryRows: [string, string][] = [];

    const allSpecs = Object.entries(li.specs || {});

    // ── GENERAL ──
    generalRows.push(["Product Family", li.productFamily]);
    generalRows.push(["Tag Number", li.tagNumber || "--"]);
    generalRows.push(["Model Name", li.modelName || "Not Specified"]);
    generalRows.push(["De-Codification No.", li.modelNumber || "Not Specified"]);
    generalRows.push(["Application", li.application || "--"]);
    generalRows.push(["Service", li.processMedium || li.application || "--"]);
    generalRows.push(["Size", li.size || "--"]);
    generalRows.push(["Quantity", String(li.quantity || 1)]);

    // ── PROCESS / OPERATING CONDITIONS ──
    if (li.processConditions) {
      const pc = li.processConditions;
      processRows.push(["Service Type", pc.service || "--"]);
      processRows.push(["Fluid Name", pc.fluidName || "--"]);
      processRows.push(["Operating Pressure", pc.operatingPressure ? `${pc.operatingPressure} bar` : "--"]);
      processRows.push(["Operating Temperature", pc.operatingTemp ? `${pc.operatingTemp} °C` : "--"]);
      if (isFlowDevice) {
        processRows.push(["Flow Rate Min", pc.flowRateMin > 0 ? `${pc.flowRateMin} ${pc.flowUnit}` : "--"]);
        processRows.push(["Flow Rate Max", pc.flowRateMax > 0 ? `${pc.flowRateMax} ${pc.flowUnit}` : "--"]);
        processRows.push(["Density", pc.density ? `${pc.density} kg/m³` : "--"]);
        processRows.push(["Viscosity", pc.viscosity ? `${pc.viscosity} cP` : "--"]);
        processRows.push(["Pipe Size", pc.pipeSize || "--"]);
      }
      if (isLevelDevice) {
        const mounting = li.productFamily.toLowerCase().includes("side") ? "Side Mounted" :
                         li.productFamily.toLowerCase().includes("top") ? "Top Mounted" : "--";
        processRows.push(["Mounting Type", mounting]);
        const ccDist = allSpecs.find(([k]) => /c-c|center.*center|chamber.*length/i.test(k));
        if (ccDist) processRows.push(["C-C Distance", ccDist[1]]);
      }
    }

    // ── CATEGORIZE ALL SPECS FROM SO ──
    for (const [key, value] of allSpecs) {
      if (!value || !value.trim()) continue;
      const keyLower = key.toLowerCase();
      if (/rangeability|f\/f\s*ht|accuracy|branding|water\s*equivalent|body\s*range|glass\s*tube\s*od/i.test(keyLower)) {
        designRows.push([key, value]);
      } else if (/fasteners?\s*moc|gasket\b|isolation\s*valve|ball\s*valve\b|induced\s*pipe\s*moc|main\s*connection\s*size|sandwich\s*plate\s*moc|gland\s*ring/i.test(keyLower)) {
        accessoryRows.push([key, value]);
      } else {
        techRows.push([key, value]);
      }
    }

    if (li.output) techRows.push(["Output Signal", li.output]);
    if (li.certification) techRows.push(["Certifications", li.certification]);

    // Build specs HTML — full-width 2-column table for readability
    let specsHtml = "";
    const renderSection = (title: string, rows: [string, string][]) => {
      if (rows.length === 0) return;
      specsHtml += `<tr><td colspan="4" style="background:#1e3a5f;color:#fff;padding:4px 6px;font-size:6.5pt;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;border:1px solid #1e3a5f;">${esc(title)}</td></tr>`;
      for (let i = 0; i < rows.length; i += 2) {
        const r1 = rows[i];
        const r2 = rows[i + 1];
        const v1 = r1[1] && r1[1].trim() ? esc(r1[1]) : '<span style="color:#999">--</span>';
        if (r2) {
          const v2 = r2[1] && r2[1].trim() ? esc(r2[1]) : '<span style="color:#999">--</span>';
          specsHtml += `<tr><td style="width:22%;background:#f5f5f5;padding:3px 5px;border:1px solid #bbb;font-size:6pt;font-weight:600;color:#333;white-space:nowrap;">${esc(r1[0])}</td><td style="width:28%;padding:3px 5px;border:1px solid #bbb;font-size:6.5pt;color:#222;word-break:break-all;overflow:hidden;">${v1}</td><td style="width:22%;background:#f5f5f5;padding:3px 5px;border:1px solid #bbb;font-size:6pt;font-weight:600;color:#333;white-space:nowrap;">${esc(r2[0])}</td><td style="width:28%;padding:3px 5px;border:1px solid #bbb;font-size:6.5pt;color:#222;word-break:break-all;overflow:hidden;">${v2}</td></tr>`;
        } else {
          specsHtml += `<tr><td style="width:22%;background:#f5f5f5;padding:3px 5px;border:1px solid #bbb;font-size:6pt;font-weight:600;color:#333;white-space:nowrap;">${esc(r1[0])}</td><td style="width:28%;padding:3px 5px;border:1px solid #bbb;font-size:6.5pt;color:#222;word-break:break-all;overflow:hidden;">${v1}</td><td style="width:22%;background:#f5f5f5;padding:3px 5px;border:1px solid #bbb;font-size:6pt;font-weight:600;color:#333;white-space:nowrap;"></td><td style="width:28%;padding:3px 5px;border:1px solid #bbb;font-size:6.5pt;color:#222;word-break:break-all;overflow:hidden;"></td></tr>`;
        }
      }
    };

    renderSection("GENERAL", generalRows);
    renderSection("PROCESS / OPERATING CONDITIONS", processRows);
    renderSection("TECHNICAL SPECIFICATIONS", techRows);
    renderSection("DESIGN PARAMETERS", designRows);
    renderSection("ACCESORIES DATA", accessoryRows);

    const specsTable = `<table style="width:100%;border-collapse:collapse;font-size:6.5pt;table-layout:fixed;">${specsHtml}</table>`;

    // ════════════════════════════════════════════════════════════════════
    // GAD Drawing — embed ACTUAL IMAGE if available
    // ════════════════════════════════════════════════════════════════════
    const drawingId = gadDrawingIds[li.id];
    const gadImageData = drawingId ? gadImages[drawingId] : null;
    const hasGadImage = !!gadImageData && gadImageData.length > 100;

    let gadContent = "";
    if (hasGadImage) {
      // Embed the actual drawing image
      gadContent = `<div style="border:1.5px solid #444;display:flex;flex-direction:column;border-radius:2px;overflow:hidden;height:100%;">
        <div style="border-bottom:1.5px solid #444;padding:4px 6px;font-size:6.5pt;font-weight:bold;text-transform:uppercase;text-align:center;background:#1e3a5f;color:#fff;">2D GENERAL ARRANGEMENT DRAWING</div>
        <div style="flex:1;padding:8px;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;">
          <img src="${gadImageData}" style="max-width:100%;max-height:380px;height:auto;object-fit:contain;" alt="GA Drawing for ${esc(li.tagNumber)}" />
        </div>
        <div style="border-top:1.5px solid #444;padding:4px 6px;font-size:6pt;text-align:center;color:#555;background:#f0f4f8;">${esc(li.productFamily)} — ${esc(li.tagNumber)} — Drawing ID: ${esc(drawingId!)}</div>
      </div>`;
    } else if (drawingId) {
      // Drawing assigned but image not loaded — show placeholder with info
      gadContent = `<div style="border:1.5px solid #444;display:flex;flex-direction:column;border-radius:2px;overflow:hidden;height:100%;">
        <div style="border-bottom:1.5px solid #444;padding:4px 6px;font-size:6.5pt;font-weight:bold;text-transform:uppercase;text-align:center;background:#1e3a5f;color:#fff;">2D GENERAL ARRANGEMENT DRAWING</div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px dashed #ccc;margin:8px;padding:20px;text-align:center;background:#fafafa;">
          <div style="font-size:9pt;color:#16a34a;font-weight:bold;">✓ GA Drawing Assigned</div>
          <div style="font-size:7pt;color:#555;margin-top:8px;">Drawing ID: ${esc(drawingId)}</div>
          <div style="font-size:7pt;color:#555;">${esc(li.productFamily)}</div>
          <div style="font-size:7pt;color:#555;">Tag: ${esc(li.tagNumber)}</div>
          <div style="font-size:6pt;color:#d97706;margin-top:8px;">(Image not available in compiled report — view in Drawing Master)</div>
        </div>
        <div style="border-top:1.5px solid #444;padding:4px 6px;font-size:6pt;text-align:center;color:#555;background:#f0f4f8;">GA Drawing assigned but image data not loaded</div>
      </div>`;
    } else {
      // No drawing assigned
      gadContent = `<div style="border:1.5px solid #444;display:flex;flex-direction:column;border-radius:2px;overflow:hidden;height:100%;">
        <div style="border-bottom:1.5px solid #444;padding:4px 6px;font-size:6.5pt;font-weight:bold;text-transform:uppercase;text-align:center;background:#1e3a5f;color:#fff;">2D GENERAL ARRANGEMENT DRAWING</div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px dashed #ccc;margin:8px;padding:20px;text-align:center;background:#fafafa;">
          <div style="font-size:8pt;color:#aaa;line-height:1.6;">${esc(li.productFamily)}<br>Tag No: ${esc(li.tagNumber)}<br>Size: ${esc(li.size || "--")}<br><br><strong>Drawing No:</strong> FT-GAD-${esc(li.tagNumber)}-01<br><strong>Revision:</strong> Rev. 0<br><strong>Scale:</strong> As noted on drawing</div>
        </div>
        <div style="border-top:1.5px solid #444;padding:4px 6px;font-size:6pt;text-align:center;color:#555;background:#f0f4f8;">No GA Drawing mapped — assign in Drawing Master</div>
      </div>`;
    }

    // Clean tabular layout: project header + specs (left) + GAD (right)
    // NEVER embed pre-generated datasheet HTML — its CSS causes logo/ layout corruption
    html += `<div class="landscape-page" id="${dsAnchor}">
      ${buildPageHeader(metadata, li.tagNumber, "DATASHEET")}
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;"><tr>
        <td style="width:42%;vertical-align:top;padding-right:6px;overflow:hidden;">${specsTable}</td>
        <td style="width:58%;vertical-align:top;overflow:hidden;">${gadContent}</td>
      </tr></table>
      ${pageFooterDs(metadata.quoteNumber || "PROJECT")}
    </div>`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION: QAP FAMILY-WISE COMPILATION
  // ═══════════════════════════════════════════════════════════════════
  for (const [famKey, liId] of familyQapMap) {
    srNo++; // Each QAP = new section
    const qapResult = findQapForLineItem(lineItems.find((li) => li.id === liId)!);
    const label = (QAP_PRODUCT_LABELS as Record<string, string>)[famKey] || famKey;
    const qapAnchor = anchorId("qap", famKey);

    if (qapResult.entry) {
      const q = qapResult.entry;
      html += `<div class="landscape-page" id="${qapAnchor}">
        ${buildPageHeader(metadata, undefined, "QAP")}
        <h2>Quality Assurance Plan — ${esc(label)}</h2>
        <div style="display:flex;gap:16px;margin-bottom:10px;font-size:9px;color:#4b5563;">
          <span><strong>Doc No:</strong> ${esc(q.docNo)}</span>
          <span><strong>Rev:</strong> ${esc(q.revNo)}</span>
          <span><strong>Date:</strong> ${esc(q.date)}</span>
          <span><strong>Approved By:</strong> ${esc(q.approvedBy)}</span>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:7px;table-layout:auto;">
          <thead>
            <tr style="background:#c20017;color:#fff;">
              <th style="padding:3px 4px;border:1px solid #d1d5db;font-weight:600;text-align:center;white-space:nowrap;">Sr.</th>
              <th style="padding:3px 4px;border:1px solid #d1d5db;font-weight:600;text-align:left;white-space:nowrap;">Component / Stage</th>
              <th style="padding:3px 4px;border:1px solid #d1d5db;font-weight:600;text-align:left;white-space:nowrap;">Characteristics</th>
              <th style="padding:3px 4px;border:1px solid #d1d5db;font-weight:600;text-align:center;white-space:nowrap;">Cat</th>
              <th style="padding:3px 4px;border:1px solid #d1d5db;font-weight:600;text-align:left;white-space:nowrap;">Method</th>
              <th style="padding:3px 4px;border:1px solid #d1d5db;font-weight:600;text-align:left;white-space:nowrap;">Extent</th>
              <th style="padding:3px 4px;border:1px solid #d1d5db;font-weight:600;text-align:left;white-space:nowrap;">Reference</th>
              <th style="padding:3px 4px;border:1px solid #d1d5db;font-weight:600;text-align:left;white-space:nowrap;">Acceptance</th>
              <th style="padding:3px 4px;border:1px solid #d1d5db;font-weight:600;text-align:left;white-space:nowrap;">Record Format</th>
              <th style="padding:3px 4px;border:1px solid #d1d5db;font-weight:600;text-align:center;white-space:nowrap;">Flowtech</th>
              <th style="padding:3px 4px;border:1px solid #d1d5db;font-weight:600;text-align:center;white-space:nowrap;">Agency</th>
              <th style="padding:3px 4px;border:1px solid #d1d5db;font-weight:600;text-align:center;white-space:nowrap;">Client</th>
              <th style="padding:3px 4px;border:1px solid #d1d5db;font-weight:600;text-align:left;white-space:nowrap;">Remarks</th>
            </tr>
          </thead>
          <tbody>`;

      for (const row of q.rows) {
        const catColor = row.category === "CR" ? "#fee2e2;color:#dc2626;font-weight:700;" : row.category === "MA" ? "#fffbeb;color:#d97706;" : "#eff6ff;color:#3b82f6;";
        html += `<tr>
          <td style="padding:2px 4px;border:1px solid #d1d5db;text-align:center;font-weight:600;">${esc(row.srNo)}</td>
          <td style="padding:2px 4px;border:1px solid #d1d5db;color:#1f2937;">${esc(row.component)}</td>
          <td style="padding:2px 4px;border:1px solid #d1d5db;color:#4b5563;">${esc(row.characteristics)}</td>
          <td style="padding:2px 4px;border:1px solid #d1d5db;text-align:center;${catColor}">${esc(row.category)}</td>
          <td style="padding:2px 4px;border:1px solid #d1d5db;color:#4b5563;">${esc(row.method)}</td>
          <td style="padding:2px 4px;border:1px solid #d1d5db;color:#4b5563;">${esc(row.extent)}</td>
          <td style="padding:2px 4px;border:1px solid #d1d5db;color:#4b5563;">${esc(row.reference)}</td>
          <td style="padding:2px 4px;border:1px solid #d1d5db;color:#4b5563;">${esc(row.acceptance)}</td>
          <td style="padding:2px 4px;border:1px solid #d1d5db;color:#4b5563;">${esc(row.recordFormat)}</td>
          <td style="padding:2px 4px;border:1px solid #d1d5db;text-align:center;font-weight:600;">${esc(row.flowtech)}</td>
          <td style="padding:2px 4px;border:1px solid #d1d5db;text-align:center;">${esc(row.agency)}</td>
          <td style="padding:2px 4px;border:1px solid #d1d5db;text-align:center;">${esc(row.client)}</td>
          <td style="padding:2px 4px;border:1px solid #d1d5db;color:#6b7280;font-size:6px;">${esc(row.remarks)}</td>
        </tr>`;
      }

      html += `</tbody></table>`;
      if (q.remarks) {
        html += `<div class="note" style="margin-top:6px;font-size:8px;">${esc(q.remarks)}</div>`;
      }
      html += `<div class="footer">QAP Ref: ${esc(q.docNo)} · ${esc(q.title)} · Page <span class="page-num"></span></div>
      </div>`;
    } else {
      html += `<div class="landscape-page" id="${qapAnchor}">
        ${buildPageHeader(metadata, undefined, "QAP")}
        <h2>Quality Assurance Plan — ${esc(label)}</h2>
        <div class="warn">QAP not found for ${esc(label)}. Please upload the approved QAP to QAP Master.</div>
      </div>`;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // NOTE: Sizing reports and Water Equivalent reports are NOT included
  // in the compiled master document. They are available as a separate
  // standalone "Sizing Report" download in the Final Reports section.
  // ═══════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════
  // SECTION: VALIDATION & EXCEPTION REPORT (Phase 6)
  // ═══════════════════════════════════════════════════════════════════
  srNo++; // Validation = section
  const valAnchor = anchorId("validation");
  html += `<div class="page" id="${valAnchor}">
    ${buildPageHeader(metadata, undefined, "VALIDATION")}
    <h2>Document Validation & Exception Report</h2>
    <p style="font-size:9px;color:#6b7280;margin-bottom:10px;">Automated validation check of all line items against document generation requirements. Sizing is applicable only for flowmeters and rotameters.</p>`;

  /** Check if a line item requires flow sizing */
  const sizingRequired = (li: ExtractedLineItem): boolean => {
    const f = (li.productFamily || "").toLowerCase();
    return f.includes("flowmeter") || f.includes("flow meter") || f.includes("rotameter");
  };

  // Build validation rows
  const valRows: string[][] = [];
  let sizedCount = 0, gadCount = 0, dsCount = 0, qapAvailCount = 0;
  let sizingRequiredCount = 0;
  for (let i = 0; i < lineItems.length; i++) {
    const li = lineItems[i];
    const needsSizing = sizingRequired(li);
    if (needsSizing) sizingRequiredCount++;
    const isSized = !!li.sizingResult;
    const hasGad = !!gadDrawingIds[li.id];
    const hasDs = !!(datasheetReports[li.id] && datasheetReports[li.id].length > 100);
    const qapR = findQapForLineItem(li);
    const hasQap = qapR.status === "mapped";

    if (isSized || !needsSizing) sizedCount++; // Counts as "sized" if N/A
    if (hasGad) gadCount++;
    if (hasDs) dsCount++;
    if (hasQap) qapAvailCount++;

    const isComplete = (isSized || !needsSizing) && hasGad && hasDs && hasQap;
    const status = isComplete
      ? '<span style="color:#16a34a;font-weight:700;">COMPLETE</span>'
      : '<span style="color:#d97706;font-weight:700;">INCOMPLETE</span>';

    const issues: string[] = [];
    if (needsSizing && !isSized) issues.push("Not sized");
    if (!hasGad) issues.push("No GAD");
    if (!hasDs) issues.push("No DS");
    if (!hasQap) issues.push("No QAP");

    // Sizing column: green dot if sized, grey "N/A" if not required
    const sizingDisplay = isSized
      ? '<span style="color:#16a34a">●</span>'
      : !needsSizing
        ? '<span style="color:#9ca3af;font-size:7px;">N/A</span>'
        : '<span style="color:#dc2626">●</span>';

    valRows.push([
      String(i + 1),
      esc(li.lineItemNo),
      esc(li.tagNumber),
      esc(li.productFamily),
      sizingDisplay,
      hasGad ? '<span style="color:#16a34a">●</span>' : '<span style="color:#dc2626">●</span>',
      hasDs ? '<span style="color:#16a34a">●</span>' : '<span style="color:#dc2626">●</span>',
      hasQap ? '<span style="color:#16a34a">●</span>' : '<span style="color:#dc2626">●</span>',
      status,
      issues.length > 0 ? esc(issues.join(", ")) : '—',
    ]);
  }

  html += tbl(
    ["Sr.", "Line", "Tag", "Product", "Sized", "GAD", "DS", "QAP", "Status", "Issues"],
    valRows,
    { compact: true }
  );

  // Summary stats — sized counts against flow items only
  const allSized = sizingRequiredCount === 0 || lineItems.filter(sizingRequired).every((li) => !!li.sizingResult);
  const allComplete = allSized && gadCount === lineItems.length &&
                      dsCount === lineItems.length && qapAvailCount === lineItems.length;
  html += `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:12px 0;">
    <div style="padding:8px;text-align:center;border-radius:6px;background:${allSized ? '#f0fdf4' : '#fef2f2'};border:1px solid ${allSized ? '#a7f3d0' : '#fecaca'};">
      <div style="font-size:16px;font-weight:700;color:${allSized ? '#16a34a' : '#dc2626'};">${sizedCount}/${lineItems.length}</div>
      <div style="font-size:8px;color:#6b7280;">Sized (${sizingRequiredCount} applicable)</div>
    </div>
    <div style="padding:8px;text-align:center;border-radius:6px;background:${gadCount === lineItems.length ? '#f0fdf4' : '#fef2f2'};border:1px solid ${gadCount === lineItems.length ? '#a7f3d0' : '#fecaca'};">
      <div style="font-size:16px;font-weight:700;color:${gadCount === lineItems.length ? '#16a34a' : '#dc2626'};">${gadCount}/${lineItems.length}</div>
      <div style="font-size:8px;color:#6b7280;">GAD Mapped</div>
    </div>
    <div style="padding:8px;text-align:center;border-radius:6px;background:${dsCount === lineItems.length ? '#f0fdf4' : '#fef2f2'};border:1px solid ${dsCount === lineItems.length ? '#a7f3d0' : '#fecaca'};">
      <div style="font-size:16px;font-weight:700;color:${dsCount === lineItems.length ? '#16a34a' : '#dc2626'};">${dsCount}/${lineItems.length}</div>
      <div style="font-size:8px;color:#6b7280;">Datasheets</div>
    </div>
    <div style="padding:8px;text-align:center;border-radius:6px;background:${qapAvailCount === lineItems.length ? '#f0fdf4' : '#fef2f2'};border:1px solid ${qapAvailCount === lineItems.length ? '#a7f3d0' : '#fecaca'};">
      <div style="font-size:16px;font-weight:700;color:${qapAvailCount === lineItems.length ? '#16a34a' : '#dc2626'};">${qapAvailCount}/${lineItems.length}</div>
      <div style="font-size:8px;color:#6b7280;">QAP Available</div>
    </div>
    <div style="padding:8px;text-align:center;border-radius:6px;background:${allComplete ? '#f0fdf4' : '#fffbeb'};border:1px solid ${allComplete ? '#a7f3d0' : '#fcd34d'};">
      <div style="font-size:16px;font-weight:700;color:${allComplete ? '#16a34a' : '#d97706'};">${allComplete ? 'PASS' : 'PENDING'}</div>
      <div style="font-size:8px;color:#6b7280;">Overall</div>
    </div>
  </div>`;

  if (!allComplete) {
    const notSized = sizingRequiredCount > 0 ? lineItems.filter(sizingRequired).filter((li) => !li.sizingResult).length : 0;
    html += `<div class="warn">
      <strong>Document Incomplete:</strong> ${notSized} line item(s) not sized (of ${sizingRequiredCount} applicable), ${lineItems.length - gadCount} missing GAD, ${lineItems.length - dsCount} missing datasheet, ${lineItems.length - qapAvailCount} missing QAP.
      Complete all steps before final submission.
    </div>`;
  } else {
    html += `<div class="success">
      <strong>✓ All Checks Passed:</strong> All ${lineItems.length} line items have ${sizingRequiredCount > 0 ? 'sizing, ' : ''}GAD mapping, datasheet, and QAP coverage. Document is ready for final submission.
    </div>`;
  }

  // Engineering queries summary — uses SAME field as Engineering Query Panel
  const totalQueries = lineItems.reduce((sum, li) => sum + (li.engineeringReview?.queries?.length || 0), 0);
  if (totalQueries > 0) {
    html += `<h3>Unresolved Engineering Queries</h3>
    <div class="note">${totalQueries} engineering query(ies) require attention. Review the Engineering Queries tab for details.</div>`;
  }

  html += `</div>`;

  // ═══════════════════════════════════════════════════════════════════
  // FINAL FOOTER
  // ═══════════════════════════════════════════════════════════════════
  html += `<div class="page" style="page-break-before:always;">
    <h2>Document End</h2>
    <div class="footer" style="margin-top:40px;">
      <strong style="font-size:11px;color:#1f2937;">Flowtech Instruments (I) Pvt. Ltd.</strong><br/>
      <div style="font-size:9px;color:#6b7280;margin-top:6px;">
        ${esc(metadata.projectName || "Project Document")} &mdash; ${esc(metadata.customerName || "Customer")}<br/>
        Document Ref: FT-PROJ-${esc((metadata.projectName || "DOC").substring(0, 3).toUpperCase())}-001 &mdash; ${esc(metadata.revisionNumber || "Rev. 1.0")}<br/>
        Generated: ${date} &mdash; Total Sections: ${srNo} &mdash; Line Items: ${lineItems.length}<br/><br/>
        <em>This document was generated by FlowAI and contains confidential technical information.
        Distribution is restricted to authorized personnel only. Verify all critical parameters
        with Flowtech technical team before manufacturing or installation.</em>
      </div>
    </div>
  </div>`;

  html += `</body></html>`;

  } catch (e: any) {
    // CRITICAL: Catch ANY error during compilation and embed it as a visible error page
    // instead of crashing silently
    console.error("[compileProjectDocument] CRITICAL ERROR:", e?.message, e?.stack);
    warnings.push(`Compilation error: ${e?.message || String(e)}`);
    html += `<div class="page">
      <h2 style="color:#dc2626;">Document Compilation Error</h2>
      <div class="warn" style="border-color:#dc2626;">
        <strong>Error:</strong> ${esc(e?.message || String(e))}<br/>
        <strong>Stack:</strong> <pre style="font-size:8px;overflow:auto;max-height:200px;">${esc(e?.stack || "N/A")}</pre>
      </div>
      <p style="font-size:9px;color:#6b7280;margin-top:10px;">
        The document was partially generated. Please check that all line items have valid product families and required data.
        If the error persists, contact Flowtech technical support with the error details above.
      </p>
    </div></body></html>`;
  }

  return {
    html,
    sectionCount: srNo,
    lineItemCount: lineItems.length,
    qapCount: familyQapMap.size,
    sizingCount: Object.keys(sizingReports).length,
    weCount: Object.keys(weReports).length,
    warnings,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// INLINE SIZING SHEET BUILDER — generates a basic report from sizingResult
// when the stored HTML report is missing or too short
// ═══════════════════════════════════════════════════════════════════════════

function buildInlineSizingSheet(li: ExtractedLineItem): string {
  const sr = li.sizingResult;
  if (!sr) return "";
  const pc = li.processConditions;
  const f = esc;

  // Process data rows
  const processRows = [
    ["Tag Number", f(li.tagNumber)],
    ["Product Family", f(li.productFamily)],
    ["Model Name", f(li.modelName || "—")],
    ["Fluid / Service", f(pc?.fluidName || pc?.service || "—")],
    ["Flow Rate (Min)", `${pc?.flowRateMin ?? "—"} ${f(pc?.flowUnit || "m³/hr")}`],
    ["Flow Rate (Max)", `${pc?.flowRateMax ?? "—"} ${f(pc?.flowUnit || "m³/hr")}`],
    ["Operating Pressure", `${pc?.operatingPressure ?? "—"} bara`],
    ["Operating Temperature", `${pc?.operatingTemp ?? "—"} °C`],
    ["Fluid Density", `${pc?.density ?? "—"} kg/m³`],
    ["Fluid Viscosity", `${pc?.viscosity ?? "—"} cP`],
  ];

  // Sizing result rows
  const sizingRows = [
    ["Recommended Size", f(sr.bestSize || "—")],
    ["Qmin", `${(sr.qMin ?? 0).toFixed(1)} ${f(sr.qMinUnit || "m³/hr")}`],
    ["Qmax", `${(sr.qMax ?? 0).toFixed(1)} ${f(sr.qMinUnit || "m³/hr")}`],
    ["Turndown Ratio", `${(sr.turndown ?? 0).toFixed(1)}:1`],
    ["Accuracy", f(sr.accuracy || "±0.5% MV")],
    ["Status", f(sr.status || "—")],
  ];

  // Water equivalent rows
  let weRows = "";
  if (sr.waterEquivalent) {
    const we = sr.waterEquivalent;
    weRows = `
      <tr><th colspan="2" style="background:#1e3a5f;color:#fff">Water Equivalent</th></tr>
      <tr><td style="width:35%;background:#f5f5f5;font-weight:700">WE (Normal)</td><td>${(we.weNorm ?? 0).toFixed(1)} LPH</td></tr>
      <tr><td style="background:#f5f5f5;font-weight:700">WE (Min)</td><td>${(we.weMin ?? 0).toFixed(1)} LPH</td></tr>
      <tr><td style="background:#f5f5f5;font-weight:700">WE (Max)</td><td>${(we.weMax ?? 0).toFixed(1)} LPH</td></tr>
      <tr><td style="background:#f5f5f5;font-weight:700">Fluid Correction Factor</td><td>${(we.fcf ?? 0).toFixed(4)}</td></tr>
      <tr><td style="background:#f5f5f5;font-weight:700">Gas Correction Factor</td><td>${(we.gcf ?? 0).toFixed(4)}</td></tr>
    `;
  }

  // Velocity rows
  let velRow = "";
  if (sr.velocityMin && sr.velocityMax) {
    velRow = `<tr><td style="background:#f5f5f5;font-weight:700">Velocity Range</td><td>${sr.velocityMin.toFixed(2)} - ${sr.velocityMax.toFixed(2)} m/s (${f(sr.velocityStatus || "")})</td></tr>`;
  }

  const processTableHtml = processRows.map(([label, value]) =>
    `<tr><td style="width:35%;background:#f5f5f5;font-weight:700;border:1px solid #000;padding:4px 8px;font-size:8pt">${f(label)}</td><td style="border:1px solid #000;padding:4px 8px;font-size:8pt">${value}</td></tr>`
  ).join("\n");

  const sizingTableHtml = sizingRows.map(([label, value]) =>
    `<tr><td style="width:35%;background:#f5f5f5;font-weight:700;border:1px solid #000;padding:4px 8px;font-size:8pt">${f(label)}</td><td style="border:1px solid #000;padding:4px 8px;font-size:8pt">${value}</td></tr>`
  ).join("\n") + velRow;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{font-family:Arial,Helvetica,sans-serif;font-size:8pt;color:#000;line-height:1.4;padding:8mm}
    table{border-collapse:collapse;width:100%;margin-bottom:8px}
    th,td{border:1px solid #000;padding:4px 8px;font-size:8pt}
    th{background:#f0f0f0;font-weight:700;text-align:left}
    h2{font-size:11pt;border-bottom:2px solid #000;padding-bottom:3px;margin:12px 0 6px}
  </style></head><body>
  <h2>Process Data — ${f(li.tagNumber)}</h2>
  <table>${processTableHtml}</table>
  <h2>Sizing Result</h2>
  <table>${sizingTableHtml}</table>
  ${weRows ? `<table>${weRows}</table>` : ""}
  <div style="border:1px solid #000;background:#f0fdf4;padding:6px 10px;margin-top:8px;font-size:8pt">
    <strong>Status:</strong> ${f(sr.status || "—")}${sr.reason ? ` — ${f(sr.reason)}` : ""}
  </div>
  </body></html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// STANDALONE SIZING REPORT COMPILER
// Cover Page + Instrument Index + Sizing Sheets per line item
// ═══════════════════════════════════════════════════════════════════════════

export interface SizingReportCompilationInput {
  metadata: ProjectMetadata;
  lineItems: ExtractedLineItem[];
  sizingReports: Record<string, string>; // lineItemId -> HTML
}

export interface SizingReportCompilationResult {
  html: string;
  sizedCount: number;
  skippedCount: number;
}

export function compileSizingReportDocument(input: SizingReportCompilationInput): SizingReportCompilationResult {
  const { metadata, lineItems, sizingReports } = input;
  const date = new Date().toLocaleDateString("en-GB");
  const endClientDisplay = metadata.endClientName || metadata.customerName || "—";

  // Only include line items that have sizing data
  const sizedItems = lineItems.filter((li) => !!sizingReports[li.id] && sizingReports[li.id].length > 50);
  const skippedItems = lineItems.filter((li) => !sizingReports[li.id] || sizingReports[li.id].length <= 50);

  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Sizing Report — ${esc(metadata.projectName || "Flowtech")}</title>
<style>
@page { size: A4; margin: 10mm; }
@page :first { margin: 0; }
body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1f2937; line-height: 1.45; font-size: 10px; }
.page { page-break-after: always; padding: 10mm; }
.page:last-child { page-break-after: auto; }

/* Cover Page — shared with master report */
.cover-page { width: 100%; height: 100vh; page-break-after: always; border: 3px solid #000; margin: 0; padding: 0; box-sizing: border-box; }
.cover-page table { border-collapse: collapse; width: 100%; }
.cover-header-cell { text-align: center; padding: 40px 40px 20px; border-bottom: 2px solid #000; }
.cover-header-cell .company-name { font-size: 13px; font-weight: 700; color: #000; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
.cover-header-cell .doc-title { font-size: 18px; font-weight: 700; color: #c20017; letter-spacing: 4px; text-transform: uppercase; }
.cover-body-cell { vertical-align: middle; padding: 40px 60px; }
.cover-info-table { width: 100%; max-width: 520px; margin: 0 auto; border: 1px solid #000; border-collapse: collapse; }
.cover-info-table td { padding: 10px 14px; font-size: 10px; border: 1px solid #000; vertical-align: middle; }
.cover-info-table .label-cell { width: 38%; background: #f0f0f0; font-weight: 700; color: #000; text-align: left; }
.cover-info-table .value-cell { width: 62%; font-weight: 600; color: #000; text-align: left; }
.cover-footer-cell { text-align: center; padding: 20px 40px 30px; border-top: 1px solid #000; }
.cover-footer-cell .footer-text { font-size: 8px; color: #333; font-weight: 600; letter-spacing: 0.5px; }

/* Sections */
h2 { font-size: 14px; color: #c20017; border-bottom: 2px solid #c20017; padding-bottom: 3px; margin: 14px 0 8px; }
h3 { font-size: 11px; color: #374151; margin: 10px 0 5px; }

/* Info boxes */
.warn { background: #fef2f2; border-left: 3px solid #dc2626; padding: 6px 10px; margin: 6px 0; font-size: 9px; color: #7f1d1d; }
.info { background: #eff6ff; border-left: 3px solid #3b82f6; padding: 6px 10px; margin: 6px 0; font-size: 9px; color: #1e40af; }
.note { background: #fffbeb; border-left: 3px solid #d97706; padding: 6px 10px; margin: 6px 0; font-size: 9px; color: #92400e; }
.success { background: #f0fdf4; border-left: 3px solid #16a34a; padding: 6px 10px; margin: 6px 0; font-size: 9px; color: #14532d; }

/* Tables */
table { max-width: 100%; overflow-wrap: break-word; word-wrap: break-word; border-collapse: collapse; }
td, th { max-width: 300px; overflow-wrap: break-word; }

/* Footer */
.footer { text-align: center; font-size: 8px; color: #9ca3af; margin-top: 12px; padding-top: 6px; border-top: 1px solid #e5e7eb; }

/* Sizing report content container */
.sizing-content { border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; padding: 8px; }
.sizing-content table { width: 100%; border-collapse: collapse; font-size: 9px; }
.sizing-content td { padding: 4px 8px; border: 1px solid #e5e7eb; }
.sizing-content th { padding: 4px 8px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: 600; }

/* Instrument Index tables */
.ixt { width: 100%; border-collapse: collapse; font-size: 8px; }
.ixh { padding: 3px 5px; border: 1px solid #1e3a5f; background: #1e3a5f; color: #fff; font-weight: 700; font-size: 7px; text-transform: uppercase; text-align: center; }
.ix { padding: 3px 5px; border: 1px solid #e5e7eb; font-size: 7.5px; text-align: center; }
.ixl { padding: 3px 5px; border: 1px solid #e5e7eb; font-size: 7.5px; text-align: left; }
</style></head><body>`;

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 1: COVER PAGE
  // ═══════════════════════════════════════════════════════════════════
  html += `<table class="cover-page">
    <tr>
      <td class="cover-header-cell">
        <div class="company-name">Flowtech Measuring Instruments Private Limited</div>
        <div class="doc-title">SIZING REPORT</div>
      </td>
    </tr>
    <tr>
      <td class="cover-body-cell">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:20px;font-weight:700;color:#1f2937;margin-bottom:6px;">${esc(endClientDisplay)}</div>
          <div style="font-size:12px;color:#6b7280;">${esc(metadata.projectName || "")}</div>
        </div>
        <table class="cover-info-table">
          <tr><td class="label-cell">SO / QTN Number</td><td class="value-cell">${esc(metadata.quoteNumber || "—")}</td></tr>
          <tr><td class="label-cell">PO Number</td><td class="value-cell">${esc(metadata.poNumber || "Not Mentioned")}</td></tr>
          <tr><td class="label-cell">Date</td><td class="value-cell">${esc(metadata.date || date)}</td></tr>
          <tr><td class="label-cell">Total Line Items</td><td class="value-cell">${lineItems.length}</td></tr>
          <tr><td class="label-cell">Sized Items</td><td class="value-cell">${sizedItems.length}</td></tr>
          <tr><td class="label-cell">Revision</td><td class="value-cell">Rev. 0 | Initial Issue</td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="cover-footer-cell">
        <div class="footer-text">CONFIDENTIAL — FOR CLIENT TECHNICAL REVIEW ONLY</div>
      </td>
    </tr>
  </table>`;

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 2: INSTRUMENT INDEX (sized items only)
  // ═══════════════════════════════════════════════════════════════════
  html += `<div class="page" style="page-break-after:always;">
    <div style="font-size:14px;font-weight:700;color:#1e3a5f;letter-spacing:1px;text-align:center;margin-bottom:4px;">Flowtech Measuring Instruments Private Limited</div>
    <div style="font-size:16px;font-weight:700;color:#c20017;text-align:center;margin-bottom:16px;">INSTRUMENT INDEX — SIZING REPORT</div>

    <!-- Revision Table -->
    <table style="width:100%;border-collapse:collapse;font-size:8px;margin-bottom:16px;border:1.5px solid #1e3a5f;">
      <tr style="background:#1e3a5f;color:#fff;font-weight:700;font-size:8px;text-transform:uppercase;">
        <th style="padding:4px 8px;border:1px solid #1e3a5f;text-align:center;">Rev.</th>
        <th style="padding:4px 8px;border:1px solid #1e3a5f;text-align:center;">Description</th>
        <th style="padding:4px 8px;border:1px solid #1e3a5f;text-align:center;">Date</th>
        <th style="padding:4px 8px;border:1px solid #1e3a5f;text-align:center;">Prepared</th>
        <th style="padding:4px 8px;border:1px solid #1e3a5f;text-align:center;">Checked</th>
        <th style="padding:4px 8px;border:1px solid #1e3a5f;text-align:center;">Approved</th>
      </tr>
      <tr style="font-size:8px;background:#fff;">
        <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center;font-weight:600;">0</td>
        <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center;">Initial Issue — Sizing Report</td>
        <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center;">${esc(metadata.date || date)}</td>
        <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center;">FlowAI</td>
        <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center;"></td>
        <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center;"></td>
      </tr>
    </table>

    <!-- Instrument Summary — 5 columns: Sr, Product, Tag, Model, De-Cod -->
    <div style="font-size:11px;font-weight:700;color:#1e3a5f;text-transform:uppercase;margin-bottom:8px;letter-spacing:0.5px;">INSTRUMENT SUMMARY</div>
    <table class="ixt" style="margin-bottom:16px;">
      <tr>
        <th class="ixh" style="width:30px;">Sr.No.</th>
        <th class="ixh">Product Name</th>
        <th class="ixh">Tag No.</th>
        <th class="ixh">Model Name</th>
        <th class="ixh">De-Codification No.</th>
      </tr>
      ${lineItems.map((li, i) => {
        return `<tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'};">
          <td class="ix" style="font-weight:600;">${i + 1}</td>
          <td class="ixl">${esc(li.productFamily)}</td>
          <td class="ix" style="font-weight:600;">${esc(li.tagNumber)}</td>
          <td class="ixl" style="font-weight:600;">${esc(li.modelName || "—")}</td>
          <td class="ixl" style="font-family:monospace;font-size:6.5px;">${esc(li.modelNumber || "—")}</td>
        </tr>`;
      }).join("")}
    </table>

    <!-- Skipped items warning (if any) -->
    ${skippedItems.length > 0 ? `
    <div class="note" style="margin-bottom:16px;">
      <strong>Note:</strong> ${skippedItems.length} line item(s) do not have sizing data. Run sizing in the Sizing Check tab to include them.
    </div>` : ""}

    <!-- Project Details — Project Name, Client Name, Contractor Name, SO No. -->
    <div style="font-size:11px;font-weight:700;color:#1e3a5f;text-transform:uppercase;margin-bottom:8px;letter-spacing:0.5px;">PROJECT DETAILS</div>
    <table style="width:100%;border-collapse:collapse;font-size:8px;">
      <tr><td style="width:25%;padding:4px 8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Project Name</td><td style="padding:4px 8px;border:1px solid #e5e7eb;">${esc(metadata.projectName || "—")}</td></tr>
      <tr><td style="padding:4px 8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Client Name</td><td style="padding:4px 8px;border:1px solid #e5e7eb;">${esc(endClientDisplay)}</td></tr>
      <tr><td style="padding:4px 8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Contractor Name</td><td style="padding:4px 8px;border:1px solid #e5e7eb;">${esc(metadata.customerName || "—")}</td></tr>
      <tr><td style="padding:4px 8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">SO No.</td><td style="padding:4px 8px;border:1px solid #e5e7eb;">${esc(metadata.quoteNumber || "—")}</td></tr>
    </table>

    <div class="footer" style="margin-top:20px;">
      Flowtech Measuring Instruments Pvt. Ltd. — Sizing Report — ${esc(metadata.quoteNumber || "PROJECT")}
    </div>
  </div>`;

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 3+: SIZING SHEETS PER LINE ITEM
  // Each line item's report is embedded EXACTLY as generated in the
  // Line Items section — NO modification, NO wrapping, just page breaks.
  // ═══════════════════════════════════════════════════════════════════
  for (const li of lineItems) {
    let reportContent = sizingReports[li.id] || "";

    // Fallback: if stored report HTML is missing but sizing result exists,
    // generate a basic sizing sheet from the result data
    if ((!reportContent || reportContent.length <= 50) && li.sizingResult) {
      reportContent = buildInlineSizingSheet(li);
    }

    if (!reportContent || reportContent.length <= 50) continue;

    // Strip ONLY the outer <html>, <head>, <body> wrapper tags to avoid
    // nested documents, but KEEP all CSS styles and content exactly as-is.
    let cleanReport = reportContent;
    cleanReport = cleanReport.replace(/<!DOCTYPE[^>]*>/i, "");
    cleanReport = cleanReport.replace(/<\/?html[^>]*>/gi, "");
    cleanReport = cleanReport.replace(/<\/?head[^>]*>/gi, "");
    cleanReport = cleanReport.replace(/<body[^>]*>/gi, "").replace(/<\/body>/gi, "");
    cleanReport = cleanReport.trim();

    // Wrap each report in a page-break container — NO extra headers, NO
    // info bars, NO modification of the report content itself.
    html += `<div style="page-break-after:always;">${cleanReport}</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // FINAL PAGE: Document End
  // ═══════════════════════════════════════════════════════════════════
  html += `<div class="page" style="page-break-before:always;text-align:center;padding-top:40vh;">
    <div style="font-size:18px;font-weight:700;color:#1e3a5f;margin-bottom:8px;">— End of Sizing Report —</div>
    <div style="font-size:10px;color:#6b7280;">${sizedItems.length} of ${lineItems.length} line items sized</div>
    <div class="footer" style="margin-top:60px;">
      <strong style="font-size:11px;color:#1f2937;">Flowtech Instruments (I) Pvt. Ltd.</strong><br/>
      <div style="font-size:9px;color:#6b7280;margin-top:6px;">
        ${esc(metadata.projectName || "Project Document")} — Sizing Report<br/>
        Document Ref: FT-SIZ-${esc((metadata.projectName || "DOC").substring(0, 3).toUpperCase())}-001 — Rev. 0<br/>
        Generated: ${date}<br/><br/>
        <em>This sizing report was generated by FlowAI. Verify all critical parameters
        with Flowtech technical team before manufacturing or installation.</em>
      </div>
    </div>
  </div>`;

  html += `</body></html>`;

  return {
    html,
    sizedCount: sizedItems.length,
    skippedCount: skippedItems.length,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED BODY BUILDERS — used by both compileProjectDocument AND previews
// These generate ONLY body content (no <html>, <head>, <body> wrappers)
// so they can be embedded inside a compiled document or wrapped for preview.
// ═══════════════════════════════════════════════════════════════════════════

/** Build cover page body content (no wrapper). Used by both compiler and preview. */
export function buildCoverPageBody(metadata: ProjectMetadata): string {
  const date = new Date().toLocaleDateString("en-GB");
  const endClientDisplay = metadata.endClientName || metadata.customerName || "—";
  const contractorDisplay = metadata.customerName || "—";
  return `<table class="cover-page">
    <tr>
      <td class="cover-header-cell">
        <div class="company-name">Flowtech Measuring Instruments Private Limited</div>
        <div class="doc-title">Technical Datasheet</div>
      </td>
    </tr>
    <tr>
      <td class="cover-body-cell">
        <table class="cover-info-table">
          <tr><td class="label-cell">Project Name</td><td class="value-cell">${esc(metadata.projectName || "—")}</td></tr>
          <tr><td class="label-cell">End Client Name</td><td class="value-cell">${esc(endClientDisplay)}</td></tr>
          <tr><td class="label-cell">Contractor Name</td><td class="value-cell">${esc(contractorDisplay)}</td></tr>
          <tr><td class="label-cell">SO / QTN Number</td><td class="value-cell">${esc(metadata.quoteNumber || "—")}</td></tr>
          <tr><td class="label-cell">PO Number</td><td class="value-cell">${esc(metadata.poNumber || "Not Mentioned")}</td></tr>
          <tr><td class="label-cell">Date</td><td class="value-cell">${esc(metadata.date || date)}</td></tr>
          <tr><td class="label-cell">Revision</td><td class="value-cell">Rev. 0 | Initial Issue</td></tr>
          <tr><td class="label-cell">Prepared By</td><td class="value-cell">${esc(metadata.preparedBy || "Flowtech")}</td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="cover-footer-cell">
        <div class="footer-text">CONFIDENTIAL — FOR CLIENT TECHNICAL REVIEW ONLY</div>
      </td>
    </tr>
  </table>`;
}

/** Build instrument index body content (no wrapper). Used by both compiler and preview. */
export function buildInstrumentIndexBody(metadata: ProjectMetadata, lineItems: ExtractedLineItem[]): string {
  const date = new Date().toLocaleDateString("en-GB");
  const endClientDisplay = metadata.endClientName || metadata.customerName || "—";
  const contractorDisplay = metadata.customerName || "—";

  const rows = lineItems.map((li, i) => {
    return `<tr style="font-size:7.5px;background:${i % 2 === 0 ? '#fff' : '#f9fafb'};">
      <td style="padding:3px 5px;border:1px solid #e5e7eb;text-align:center;font-weight:600;">${i + 1}</td>
      <td style="padding:3px 5px;border:1px solid #e5e7eb;">${esc(li.productFamily)}</td>
      <td style="padding:3px 5px;border:1px solid #e5e7eb;font-weight:600;">${esc(li.tagNumber)}</td>
      <td style="padding:3px 5px;border:1px solid #e5e7eb;font-weight:600;">${esc(li.modelName || "—")}</td>
      <td style="padding:3px 5px;border:1px solid #e5e7eb;font-family:monospace;font-size:6.5px;">${esc(li.modelNumber || "—")}</td>
      <td style="padding:3px 5px;border:1px solid #e5e7eb;text-align:center;font-weight:600;">${li.quantity}</td>
    </tr>`;
  }).join("");

  return `<div style="font-size:14px;font-weight:700;color:#1e3a5f;letter-spacing:1px;text-align:center;margin-bottom:4px;">Flowtech Measuring Instruments Private Limited</div>
    <div style="font-size:16px;font-weight:700;color:#c20017;text-align:center;margin-bottom:16px;">INSTRUMENT INDEX</div>

    <!-- Revision Table -->
    <table style="width:100%;border-collapse:collapse;font-size:8px;margin-bottom:16px;border:1.5px solid #1e3a5f;">
      <tr style="background:#1e3a5f;color:#fff;font-weight:700;font-size:8px;text-transform:uppercase;">
        <th style="padding:4px 8px;border:1px solid #1e3a5f;text-align:center;">Rev.</th>
        <th style="padding:4px 8px;border:1px solid #1e3a5f;text-align:center;">Description</th>
        <th style="padding:4px 8px;border:1px solid #1e3a5f;text-align:center;">Date</th>
        <th style="padding:4px 8px;border:1px solid #1e3a5f;text-align:center;">Prepared</th>
        <th style="padding:4px 8px;border:1px solid #1e3a5f;text-align:center;">Checked</th>
        <th style="padding:4px 8px;border:1px solid #1e3a5f;text-align:center;">Approved</th>
      </tr>
      <tr style="font-size:8px;background:#fff;">
        <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center;font-weight:600;">0</td>
        <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center;">Initial Issue</td>
        <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center;">${esc(metadata.date || date)}</td>
        <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center;">FlowAI</td>
        <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center;"></td>
        <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:center;"></td>
      </tr>
    </table>

    <!-- Instrument Summary — 6 columns: Sr, Product, Tag, Model, De-Cod, Qty -->
    <div style="font-size:11px;font-weight:700;color:#1e3a5f;text-transform:uppercase;margin-bottom:8px;letter-spacing:0.5px;">INSTRUMENT SUMMARY</div>
    <table style="width:100%;border-collapse:collapse;font-size:7.5px;margin-bottom:16px;">
      <tr style="background:#1e3a5f;color:#fff;font-weight:700;font-size:7px;text-transform:uppercase;">
        <th style="padding:3px 5px;border:1px solid #1e3a5f;text-align:center;width:30px;">Sr.No.</th>
        <th style="padding:3px 5px;border:1px solid #1e3a5f;text-align:left;">Product Name</th>
        <th style="padding:3px 5px;border:1px solid #1e3a5f;text-align:left;">Tag No.</th>
        <th style="padding:3px 5px;border:1px solid #1e3a5f;text-align:left;">Model Name</th>
        <th style="padding:3px 5px;border:1px solid #1e3a5f;text-align:left;">De-Codification No.</th>
        <th style="padding:3px 5px;border:1px solid #1e3a5f;text-align:center;width:30px;">Qty</th>
      </tr>
      ${rows}
    </table>

    <!-- Project Details — Project Name, Client Name, Contractor Name, SO No. -->
    <div style="font-size:11px;font-weight:700;color:#1e3a5f;text-transform:uppercase;margin-bottom:8px;letter-spacing:0.5px;">PROJECT DETAILS</div>
    <table style="width:100%;border-collapse:collapse;font-size:8px;">
      <tr><td style="width:25%;padding:4px 8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Project Name</td><td style="padding:4px 8px;border:1px solid #e5e7eb;">${esc(metadata.projectName || "—")}</td></tr>
      <tr><td style="padding:4px 8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Client Name</td><td style="padding:4px 8px;border:1px solid #e5e7eb;">${esc(endClientDisplay)}</td></tr>
      <tr><td style="padding:4px 8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Contractor Name</td><td style="padding:4px 8px;border:1px solid #e5e7eb;">${esc(contractorDisplay)}</td></tr>
      <tr><td style="padding:4px 8px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">SO No.</td><td style="padding:4px 8px;border:1px solid #e5e7eb;">${esc(metadata.quoteNumber || "—")}</td></tr>
    </table>
    ${pageFooterDs(metadata.quoteNumber || "PROJECT")}`;
}

/** Shared page header — appears on every page (datasheet, QAP, sizing, WE) */
function buildPageHeader(metadata: ProjectMetadata, tagNumber?: string, pageTitle?: string): string {
  const endClientDisplay = metadata.endClientName || metadata.customerName || "—";
  return `<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding:6px 0;margin-bottom:12px;">
    <div style="display:flex;gap:10px;align-items:center;font-size:8px;color:#000;">
      <span style="font-weight:700;font-size:9px;color:#c20017;text-transform:uppercase;letter-spacing:0.5px;">Flowtech Measuring Instruments Pvt. Ltd.</span>
      <span style="color:#999;">|</span>
      <span><strong>Project:</strong> ${esc(metadata.projectName || "—")}</span>
      <span style="color:#999;">|</span>
      <span><strong>Client:</strong> ${esc(endClientDisplay)}</span>
      <span style="color:#999;">|</span>
      <span><strong>SO No.:</strong> ${esc(metadata.quoteNumber || "—")}</span>
      ${tagNumber ? `<span style="color:#999;">|</span><span><strong>Tag:</strong> ${esc(tagNumber)}</span>` : ""}
    </div>
    ${pageTitle ? `<span style="font-weight:700;font-size:8px;border:1px solid #000;padding:2px 8px;">${esc(pageTitle)}</span>` : ""}
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// PREVIEW FUNCTIONS (for UI)
// These wrap the shared body builders in full HTML documents for iframe preview.
// ═══════════════════════════════════════════════════════════════════════════

/** Cover Page Preview — wraps shared body builder in a full HTML document for iframe display */
export function generateCoverPagePreview(metadata: ProjectMetadata, _lineItemCount: number): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1f2937; font-size: 10px; margin: 0; padding: 0; }
</style></head><body>${buildCoverPageBody(metadata)}</body></html>`;
}

// ─── Shared Datasheet CSS (matches datasheetTemplate.ts exactly) ──────────
const DATASHEET_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,Helvetica,sans-serif;font-size:8.5pt;color:#222;line-height:1.3;margin:0;padding:10px;background:#fff}
.pg{width:100%;max-width:297mm;padding:6mm 10mm 10mm 10mm;position:relative;background:#fff;margin:0 auto;overflow:hidden}
.ft{display:flex;align-items:center;gap:3px;height:7mm;border-top:0.5px solid #cbd5e1;padding-top:1px;margin-top:8px}
.ft img{height:4.5mm;width:auto;flex-shrink:0;display:block}
.ft-txt{flex:1;min-width:0;line-height:1}
.ft-name{font-size:5.5pt;font-weight:700;color:#1e3a5f;letter-spacing:0.2px;line-height:1;display:block}
.ft-sub{font-size:4.5pt;color:#94a3b8;line-height:1;display:block}
.ft-doc{font-size:5pt;color:#94a3b8;text-align:right;white-space:nowrap}
.st{width:100%;border-collapse:collapse;font-size:7.5pt;margin-top:1px}
.st td{border:1px solid #bbb;padding:2px 4px;vertical-align:middle}
.st td.sl{width:22%;font-weight:600;background:#f5f5f5;font-size:7pt;color:#333;white-space:nowrap}
.st td.sv{width:28%;font-size:7.5pt;color:#222}
.st td.ssh{background:#1e3a5f;color:#fff;padding:2px 4px;font-size:7pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.3px;border:1px solid #1e3a5f}
.sx{margin-bottom:4px;border:1.5px solid #444;border-radius:2px;overflow:hidden}
.sh{background:#1e3a5f;color:#fff;border-bottom:1.5px solid #444;padding:2px 4px;font-size:7.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px}
.ib{width:100%;border-collapse:collapse;margin-bottom:6px;border:2px solid #1e3a5f}
.ib td{border:1.5px solid #1e3a5f;padding:2px 4px;vertical-align:middle}
.il{width:10%;text-align:center;vertical-align:middle;background:#f0f4f8}
.ic{width:78%;border:none;padding:0}
.it{width:100%;border-collapse:collapse;table-layout:fixed}
.it td{border:1px solid #ccc;font-size:7pt;padding:1px 3px;word-wrap:break-word;overflow-wrap:break-word;white-space:normal;color:#333}
.it td strong{color:#1e3a5f}
.ir{width:12%;text-align:center;vertical-align:middle;background:#f0f4f8}
.gad{border:1.5px solid #444;display:flex;flex-direction:column;height:100%;min-height:120px;border-radius:2px;overflow:hidden}
.gh{border-bottom:1.5px solid #444;padding:3px 5px;font-size:7.5pt;font-weight:bold;text-transform:uppercase;text-align:center;background:#f0f4f8;color:#1e3a5f}
.gp{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px dashed #ccc;margin:6px;padding:15px;text-align:center;background:#fafafa}
.gf{border-top:1.5px solid #444;padding:3px 5px;font-size:6pt;text-align:center;color:#555;background:#f0f4f8;line-height:1.3}
.rt{width:100%;border-collapse:collapse;font-size:8pt;margin-bottom:8px}
.rh{border:1.5px solid #1e3a5f;padding:3px 5px;font-size:7pt;font-weight:bold;text-align:center;background:#f0f4f5;color:#1e3a5f}
.rd{border:1px solid #ccc;padding:3px 5px;font-size:7.5pt;text-align:center;color:#333}
.ixt{width:100%;border-collapse:collapse;font-size:8pt;margin-top:2px}
.ixh{border:1.5px solid #1e3a5f;padding:3px 4px;font-size:7pt;font-weight:bold;text-align:center;background:#f0f4f8;color:#1e3a5f}
.ix{border:1px solid #ccc;padding:2px 4px;font-size:7.5pt;text-align:center;color:#333}
.ixl{border:1px solid #ccc;padding:2px 4px;font-size:7.5pt;text-align:left;color:#333}
`;

function shdr(t: string): string { return `<div class="sh">${esc(t)}</div>`; }
function r2(l1: string, v1: string, l2: string, v2: string): string {
  const d1 = v1 && v1.trim() ? esc(v1) : '<span style="color:#999">Not Specified</span>';
  const d2 = v2 && v2.trim() ? esc(v2) : '<span style="color:#999">Not Specified</span>';
  return `<tr><td class="sl">${esc(l1)}</td><td class="sv">${d1}</td><td class="sl">${esc(l2)}</td><td class="sv">${d2}</td></tr>`;
}
function pageFooterDs(docNo: string): string {
  return `<div style="margin-top:12px;display:flex;align-items:center;gap:3px;border-top:0.5px solid #cbd5e1;padding-top:4px;">
    <img src="${FLOWTECH_LOGO_B64}" alt="Flowtech" style="height:4.5mm;width:auto;max-height:17px;flex-shrink:0;">
    <div style="flex:1;min-width:0;line-height:1;">
      <div style="font-size:5.5pt;font-weight:700;color:#1e3a5f;letter-spacing:0.2px;line-height:1;display:block;">Flowtech Measuring Instruments Pvt. Ltd.</div>
      <div style="font-size:4.5pt;color:#94a3b8;line-height:1;display:block;">Precision Engineered Flow &amp; Level Measurement Solutions</div>
    </div>
    <div style="font-size:5pt;color:#94a3b8;text-align:right;white-space:nowrap;">Doc: ${esc(docNo)}</div>
  </div>`;
}

export function generateInstrumentSummaryHtml(lineItems: ExtractedLineItem[], metadata?: ProjectMetadata): string {
  if (lineItems.length === 0) {
    return `<p style="color:#9ca3af;text-align:center;padding:20px;">No line items available. Upload a document to extract line items.</p>`;
  }
  // Use the SAME body builder that compileProjectDocument uses — ensures preview == download
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1f2937; font-size: 10px; margin: 0; padding: 10mm; }
</style></head><body>
  <div style="page-break-after:always;">
    ${metadata ? buildInstrumentIndexBody(metadata, lineItems) : buildInstrumentIndexBody({} as ProjectMetadata, lineItems)}
  </div>
</body></html>`;
}
