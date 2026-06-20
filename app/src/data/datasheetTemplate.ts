// ============================================================
// Technical Datasheet Template -- LANDSCAPE A4
// Renders sections DYNAMICALLY from parsed quotation data
// Each instrument gets its exact sections as found in the SO
// Pure Technical -- for client technical review
// ============================================================

import type { SODatasheet, LineItem } from "./dataMapper";
import { FLOWTECH_LOGO_B64 } from "../data/flowtechLogoBase64";
import { getStandardFullName } from "./connectionDimensions";
import type { DetectedConnection } from "./connectionDimensions";

function esc(text: string | number): string {
  const s = String(text ?? "");
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── Render ALL sections as ONE compact 2-column table ───────
function renderCompactSpecs(item: LineItem): string {
  // Flatten all rows from all sections into a single list
  const allRows: Array<{ section: string; label: string; value: string }> = [];
  for (const sec of item.sections) {
    for (const [label, value] of sec.rows) {
      allRows.push({ section: sec.title, label, value });
    }
  }

  if (allRows.length === 0) {
    return `<table class="st">${r2("Type", item.instrumentType, "Tag No.", item.tagNo)}${r2("Service", item.service, "Size", item.size)}${r2("Model", item.model, "Qty", String(item.qty))}</table>`;
  }

  // Group rows by section
  const sectionGroups: Record<string, typeof allRows> = {};
  for (const row of allRows) {
    if (!sectionGroups[row.section]) sectionGroups[row.section] = [];
    sectionGroups[row.section].push(row);
  }

  let html = "";
  for (const [secTitle, rows] of Object.entries(sectionGroups)) {
    // Section sub-header row
    html += `<tr><td colspan="4" class="ssh">${esc(secTitle)}</td></tr>`;
    // 2-column rows: pair up rows
    for (let i = 0; i < rows.length; i += 2) {
      const r1 = rows[i];
      const r2row = rows[i + 1];
      if (r2row) {
        const v1 = r1.value && r1.value.trim() ? esc(r1.value) : '<span style="color:#999">--</span>';
        const v2 = r2row.value && r2row.value.trim() ? esc(r2row.value) : '<span style="color:#999">--</span>';
        html += `<tr><td class="sl">${esc(r1.label)}</td><td class="sv">${v1}</td><td class="sl">${esc(r2row.label)}</td><td class="sv">${v2}</td></tr>`;
      } else {
        const v1 = r1.value && r1.value.trim() ? esc(r1.value) : '<span style="color:#999">--</span>';
        html += `<tr><td class="sl">${esc(r1.label)}</td><td class="sv">${v1}</td><td class="sl"></td><td class="sv"></td></tr>`;
      }
    }
  }

  return `<table class="st">${html}</table>`;
}

// ─── Find De-Codification No. from item sections ─────────────
function findDecodNo(item: LineItem): string {
  // First check the dedicated decodNo field (extracted by parser)
  if (item.decodNo && item.decodNo.trim()) return item.decodNo.trim();
  // Fallback: search through sections
  for (const sec of item.sections) {
    for (const [label, value] of sec.rows) {
      if (/De-Codification|Decodification|Model Code/i.test(label) && value?.trim()) {
        return value.trim();
      }
    }
  }
  return "";
}

// ─── Render Connection Dimension Table (FUN element!) ────────
// Handles ALL connection types: Flanged, BSP, NPT, Tri-Clamp, Wafer, Compression, Socket-Weld
function renderConnectionTable(item: LineItem): string {
  const pc = item.processConnection;
  if (!pc) return "";

  switch (pc.category) {
    case "flange": return renderFlangeConnection(pc);
    case "bsp":    return renderBspConnection(pc);
    case "npt":    return renderNptConnection(pc);
    case "tri-clamp": return renderTriClampConnection(pc);
    case "wafer":  return renderWaferConnection(pc);
    case "compression": return renderCompressionConnection(pc);
    case "socket-weld": return renderSocketWeldConnection(pc);
    default: return "";
  }
}

function connHeader(title: string, subtitle: string): string {
  return `<div style="background:#2e7d32;color:#fff;padding:2px 6px;font-size:7pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;display:flex;justify-content:space-between;align-items:center;">
    <span>${esc(title)}</span>
    <span style="font-size:6.5pt;font-weight:normal;">${esc(subtitle)}</span>
  </div>`;
}

function connLabelCell(label: string): string {
  return `<td style="border:1px solid #a5d6a7;padding:2px 4px;background:#e8f5e9;font-weight:600;font-size:7pt;">${esc(label)}</td>`;
}
function connValueCell(value: string | number): string {
  return `<td style="border:1px solid #a5d6a7;padding:2px 4px;text-align:center;font-weight:bold;color:#1b5e20;font-size:7pt;">${esc(String(value))}</td>`;
}

function connWrapper(content: string): string {
  return `<div style="margin-top:6px;border:1.5px solid #2e7d32;border-radius:3px;overflow:hidden;background:#f1f8e9;">${content}</div>`;
}

// ─── FLANGED ───
function renderFlangeConnection(pc: DetectedConnection): string {
  const d = pc.flangeData;
  if (!d) return "";
  const stdName = getStandardFullName(pc.standard);
  return connWrapper(
    connHeader("FLANGED CONNECTION DIMENSIONS (MM ONLY)", `${stdName} \u2014 ${pc.sizeStr}`) +
    `<table style="width:100%;border-collapse:collapse;font-size:7pt;">
      <tr>${connLabelCell("OD (mm)")}${connValueCell(d.od)}${connLabelCell("Thickness (mm)")}${connValueCell(d.thickness)}${connLabelCell("PCD (mm)")}${connValueCell(d.pcd)}</tr>
      <tr>${connLabelCell("Bolt Holes")}${connValueCell(d.boltHoles + " Nos.")}${connLabelCell("Hole Dia (mm)")}${connValueCell(d.boltHoleDia)}${connLabelCell("Bolt Size")}${connValueCell(d.boltSize)}</tr>
      ${d.raisedFaceDia ? `<tr>${connLabelCell("R.F. Dia (mm)")}${connValueCell(d.raisedFaceDia)}${connLabelCell("Size")}${connValueCell(pc.sizeStr)}${connLabelCell("Approx Wt (kg)")}${connValueCell(d.weight ?? "-")}</tr>` : ""}
    </table>`
  );
}

// ─── BSP THREADED ───
function renderBspConnection(pc: DetectedConnection): string {
  const d = pc.bspData;
  if (!d) return "";
  return connWrapper(
    connHeader("BSP THREADED CONNECTION DIMENSIONS (MM ONLY)", `ISO 228 \u2014 ${pc.sizeStr}`) +
    `<table style="width:100%;border-collapse:collapse;font-size:7pt;">
      <tr>${connLabelCell("Thread Major OD (mm)")}${connValueCell(d.threadOD)}${connLabelCell("Pitch (mm)")}${connValueCell(d.pitch)}${connLabelCell("TPI")}${connValueCell(d.tpi)}</tr>
      <tr>${connLabelCell("Thread Length (mm)")}${connValueCell(d.threadLength)}${connLabelCell("Hex Size (mm)")}${connValueCell(d.hexSize)}${connLabelCell("Drill Dia (mm)")}${connValueCell(d.drillDia)}</tr>
    </table>`
  );
}

// ─── NPT THREADED ───
function renderNptConnection(pc: DetectedConnection): string {
  const d = pc.nptData;
  if (!d) return "";
  return connWrapper(
    connHeader("NPT THREADED CONNECTION DIMENSIONS (MM ONLY)", `ANSI B1.20.1 \u2014 ${pc.sizeStr}`) +
    `<table style="width:100%;border-collapse:collapse;font-size:7pt;">
      <tr>${connLabelCell("Thread OD (mm)")}${connValueCell(d.threadOD)}${connLabelCell("TPI")}${connValueCell(d.tpi)}${connLabelCell("Taper")}${connValueCell(d.taper)}</tr>
      <tr>${connLabelCell("Engagement Length (mm)")}${connValueCell(d.threadLength)}${connLabelCell("Hex Size (mm)")}${connValueCell(d.hexSize)}${connLabelCell("Drill Dia (mm)")}${connValueCell(d.drillDia)}</tr>
    </table>`
  );
}

// ─── TRI-CLAMP ───
function renderTriClampConnection(pc: DetectedConnection): string {
  const d = pc.triClampData;
  if (!d) return "";
  return connWrapper(
    connHeader("TRI-CLAMP CONNECTION DIMENSIONS (MM ONLY)", `DIN 32676 \u2014 ${pc.sizeStr}`) +
    `<table style="width:100%;border-collapse:collapse;font-size:7pt;">
      <tr>${connLabelCell("Ferrule OD (mm)")}${connValueCell(d.ferruleOD)}${connLabelCell("Tube OD (mm)")}${connValueCell(d.tubeOD)}${connLabelCell("Clamp Size")}${connValueCell(d.clampSize)}</tr>
      <tr>${connLabelCell("Gasket ID (mm)")}${connValueCell(d.gasketID)}${connLabelCell("Gasket OD (mm)")}${connValueCell(d.gasketOD)}${connLabelCell("Wing Nut Hex (mm)")}${connValueCell(d.wingNutSize)}</tr>
    </table>`
  );
}

// ─── WAFER ───
function renderWaferConnection(pc: DetectedConnection): string {
  const d = pc.waferData;
  if (!d) return "";
  return connWrapper(
    connHeader("WAFER CONNECTION DIMENSIONS (MM ONLY)", `ISO 5752 Short \u2014 ${pc.sizeStr}`) +
    `<table style="width:100%;border-collapse:collapse;font-size:7pt;">
      <tr>${connLabelCell("Face-to-Face (mm)")}${connValueCell(d.faceToFace)}${connLabelCell("Body OD (mm)")}${connValueCell(d.bodyOD)}${connLabelCell("Bolt Circle (mm)")}${connValueCell(d.boltCircle)}</tr>
      <tr>${connLabelCell("Bolt Holes")}${connValueCell(d.boltHoles + " Nos.")}${connLabelCell("Bolt Size")}${connValueCell(d.boltSize)}${connLabelCell("Approx Wt (kg)")}${connValueCell(d.weight)}</tr>
    </table>`
  );
}

// ─── COMPRESSION ───
function renderCompressionConnection(pc: DetectedConnection): string {
  const d = pc.compressionData;
  if (!d) return "";
  return connWrapper(
    connHeader("COMPRESSION FITTING DIMENSIONS (MM ONLY)", `Double Ferrule \u2014 ${pc.sizeStr}`) +
    `<table style="width:100%;border-collapse:collapse;font-size:7pt;">
      <tr>${connLabelCell("Tube OD (mm)")}${connValueCell(d.tubeOD)}${connLabelCell("Fitting Type")}${connValueCell(d.fittingType)}${connLabelCell("Body Hex (mm)")}${connValueCell(d.bodyHex)}</tr>
      <tr>${connLabelCell("Nut Hex (mm)")}${connValueCell(d.nutHex)}${connLabelCell("Thread")}${connValueCell(d.threadType)}${connLabelCell("")}${connValueCell("")}</tr>
    </table>`
  );
}

// ─── SOCKET WELD ───
function renderSocketWeldConnection(pc: DetectedConnection): string {
  const d = pc.socketWeldData;
  if (!d) return "";
  return connWrapper(
    connHeader("SOCKET WELD DIMENSIONS (MM ONLY)", `ANSI B16.11 \u2014 ${pc.sizeStr}`) +
    `<table style="width:100%;border-collapse:collapse;font-size:7pt;">
      <tr>${connLabelCell("Socket OD (mm)")}${connValueCell(d.socketOD)}${connLabelCell("Socket ID (mm)")}${connValueCell(d.socketID)}${connLabelCell("Socket Depth (mm)")}${connValueCell(d.socketDepth)}</tr>
      <tr>${connLabelCell("Wall Thickness (mm)")}${connValueCell(d.wallThickness)}${connLabelCell("Counterbore (mm)")}${connValueCell(d.counterBore)}${connLabelCell("")}${connValueCell("")}</tr>
    </table>`
  );
}

// ─── CUSTOM DIMENSIONS / REMARKS ───────────────────────────
// Renders 5 blank rows x 2 columns for client-specific dimensions.
// If values are entered in the UI, they display; otherwise blank editable-looking rows.
function renderCustomDimensions(item: LineItem): string {
  const cd = item.customDimensions || [];
  // Build 5 rows: use entered data where available, blank otherwise
  let rows = "";
  for (let i = 0; i < 5; i++) {
    const hasData = i < cd.length && (cd[i].label || cd[i].value);
    if (hasData) {
      rows += `<tr><td style="border:1px solid #bbb;padding:3px 6px;font-size:7pt;color:#222;">${esc(cd[i].label)}</td><td style="border:1px solid #bbb;padding:3px 6px;font-size:7pt;color:#222;">${esc(cd[i].value)}</td></tr>`;
    } else {
      rows += `<tr><td style="border:1px dashed #ccc;padding:3px 6px;font-size:7pt;color:#fff;">&nbsp;</td><td style="border:1px dashed #ccc;padding:3px 6px;font-size:7pt;color:#fff;">&nbsp;</td></tr>`;
    }
  }
  return connWrapper(
    connHeader("CUSTOM DIMENSIONS / REMARKS", "Client-Specific Requirements") +
    `<table style="width:100%;border-collapse:collapse;font-size:7pt;"><tr><td style="border:1px solid #a5d6a7;padding:2px 4px;background:#e8f5e9;font-weight:600;font-size:7pt;width:35%;">Description</td><td style="border:1px solid #a5d6a7;padding:2px 4px;background:#e8f5e9;font-weight:600;font-size:7pt;width:65%;">Value / Dimension</td></tr>${rows}</table>`
  );
}

// ─── Single page per instrument: compact 2-col + GAD ─────────
function renderInstrumentPage(item: LineItem, seqNo: number, total: number): string {
  const h = item.header;
  const decodNo = findDecodNo(item);

  // Compact info bar — includes De-Codification No. if available
  const decodRow = decodNo ? `<tr><td class="itd" style="width:12%"><strong>De-Cod. No.</strong></td><td class="itd" colspan="3" style="font-weight:bold;color:#1e3a5f;">${esc(decodNo)}</td></tr>` : "";

  // Model Name row (from item.model, NOT de-codification)
  const modelRow = item.model ? `<tr><td class="itd" style="width:12%"><strong>Model</strong></td><td class="itd" colspan="3" style="font-weight:bold;color:#c20017;">${esc(item.model)}</td></tr>` : "";

  // Only show commercial rows when data is present — datasheets are purely technical
  const clientRow = h.client ? `<tr><td class="itd" style="width:12%"><strong>Client</strong></td><td class="itd" style="width:30%">${esc(h.client)}</td><td class="itd" style="width:14%"><strong>End User</strong></td><td class="itd">${esc(h.endUser)}</td></tr>` : "";
  const soRow = h.soNo ? `<tr><td class="itd"><strong>SO/QTN No.</strong></td><td class="itd">${esc(h.soNo)}</td><td class="itd"><strong>PO No.</strong></td><td class="itd">${esc(h.poNo)}</td></tr>` : "";

  const infoBar = `<table class="ib"><tr><td class="il" style="width:10%;"><div style="font-weight:bold;font-size:7pt;">INSTRUMENT<br>DATASHEET</div><div style="font-size:6pt;color:#555;">ITEM ${seqNo} OF ${total}</div></td><td class="ic" style="width:78%;"><table class="it">${decodRow}${modelRow}<tr><td class="itd" style="width:12%"><strong>Project</strong></td><td class="itd" colspan="3">${esc(h.project)}</td></tr>${clientRow}${soRow}<tr><td class="itd"><strong>Date</strong></td><td class="itd">${esc(h.date)}</td><td class="itd"><strong>Rev.</strong></td><td class="itd">${esc(h.rev)}</td></tr></table></td><td class="ir" style="width:12%;"><div style="font-size:6.5pt;color:#555;">TAG NO.</div><div style="font-weight:bold;font-size:10pt;color:#1e3a5f;">${esc(item.tagNo)}</div></td></tr></table>`;

  // Compact 2-column specs table (all sections flattened)
  const specsTable = renderCompactSpecs(item);

  // GA Drawing box - render actual drawing from Document Master if available
  const hasDrawing = item.gaDrawingUrl && item.gaDrawingUrl.trim().length > 0;
  const drawingContent = hasDrawing
    ? (item.gaDrawingUrl.startsWith("data:image")
        ? `<img src="${item.gaDrawingUrl}" style="max-width:100%;max-height:155mm;object-fit:contain;" alt="GA Drawing ${esc(item.tagNo)}" />`
        : `<iframe src="${item.gaDrawingUrl}" style="width:100%;height:155mm;border:none;" title="GA Drawing ${esc(item.tagNo)}"></iframe>`)
    : `<div style="font-size:10pt;font-weight:bold;color:#888;margin-bottom:10px;">[ INSERT APPROVED G.A.D. HERE ]</div>`;

  // ═══ SIZING WARNING BANNER (when SO size differs from calculated optimal) ═══
  const sizingWarningBanner = item.sizingWarning
    ? `<div style="background:#fff3cd;border:1.5px solid #ff9800;padding:3px 6px;font-size:7.5pt;color:#e65100;text-align:center;margin-bottom:4px;font-weight:600;"><span style="font-size:8pt;">⚠</span> SIZING WARNING: ${esc(item.sizingWarning)}</div>`
    : "";

  // Warning banner when multiple drawings exist for this product family
  const multiWarning = (hasDrawing && item.gaDrawingTotal > 1)
    ? `<div style="background:#fff3cd;border:1px solid #ffc107;padding:2px 4px;font-size:7pt;color:#856404;text-align:center;"><strong>${item.gaDrawingTotal} drawings</strong> found for ${esc(item.instrumentType)} — verify this is the correct one</div>`
    : "";

  const gadBox = `<div class="gad"><div class="gh">2D GENERAL ARRANGEMENT DRAWING</div>${multiWarning}<div class="gp" style="${hasDrawing ? 'padding:4px;background:#fff;border:1px solid #ddd;' : ''}">${drawingContent}${!hasDrawing ? `<div style="font-size:8pt;color:#aaa;line-height:1.6;">${esc(item.instrumentType)}<br>Tag No: ${esc(item.tagNo)}<br>Size: ${esc(item.size)}<br>${decodNo ? `<strong>De-Cod. No.:</strong> ${esc(decodNo)}<br>` : `Model: ${esc(item.model)}<br>`}<br><strong>Drawing No:</strong> FT-GAD-${esc(item.tagNo)}-01<br><strong>Revision:</strong> Rev. 0<br><strong>Scale:</strong> As noted on drawing</div>` : ""}</div>${item.gadNote ? `<div class="gf">${esc(item.gadNote)}</div>` : ""}</div>`;

  // Connection dimension table (auto-detected from SO process connection specs)
  const connTable = renderConnectionTable(item);
  // Custom dimensions / remarks area (5 blank rows x 2 cols, editable)
  const customDimTable = renderCustomDimensions(item);

  // Single page: info bar on top, sizing warning, specs on left, GAD on right
  return `<div class="pg">${infoBar}${sizingWarningBanner}<table style="width:100%;border-collapse:collapse;"><tr><td style="width:54%;vertical-align:top;padding-right:6px;">${specsTable}${connTable}${customDimTable}</td><td style="width:46%;vertical-align:top;">${gadBox}</td></tr></table>${pageFooter(item.header.soNo)}</div>`;
}

// ─── Cover page ──────────────────────────────────────────────
function coverPage(h: SODatasheet["header"]): string {
  // Only show commercial fields if present — datasheets are purely technical
  const clientLine = h.client ? `<div style="font-size:10pt;margin-bottom:10px;">${esc(h.client)}</div>` : "";
  const soLine = h.soNo ? `<div style="font-size:9pt;margin:10px 0;"><strong>SO/QTN:</strong> ${esc(h.soNo)} &nbsp;|&nbsp; <strong>PO:</strong> ${esc(h.poNo)} &nbsp;|&nbsp; <strong>Date:</strong> ${esc(h.date)}</div>` : `<div style="font-size:9pt;margin:10px 0;"><strong>Date:</strong> ${esc(h.date)}</div>`;
  return `<div class="pg" style="padding:10mm 12mm;"><div class="cf" style="height:190mm;"><div class="ci" style="width:85%;"><div style="margin-bottom:12px;"><img src="${FLOWTECH_LOGO_B64}" style="height:45px;width:auto;" alt="Flowtech" /></div><div style="font-size:10pt;color:#333;margin-bottom:18px;">Measuring Instruments Private Limited</div><div style="border-top:2px solid #000;margin:12px auto;width:70%;"></div><div style="border:2px solid #000;display:inline-block;padding:10px 60px;font-size:15pt;font-weight:bold;letter-spacing:2px;margin:10px 0;">TECHNICAL DATASHEET</div><div style="border-top:2px solid #000;margin:12px auto;width:70%;"></div><div style="font-size:12pt;font-weight:bold;margin:16px 0 6px 0;line-height:1.4;">${esc(h.project)}</div>${clientLine}${soLine}<div style="font-size:8pt;margin-top:16px;color:#333;"><strong>Rev. ${esc(h.rev)}</strong> &nbsp;|&nbsp; ${esc(h.revDescription)}</div><div style="margin-top:30px;font-size:7.5pt;font-weight:bold;letter-spacing:1px;color:#555;">CONFIDENTIAL - FOR CLIENT TECHNICAL REVIEW ONLY</div></div></div>${pageFooter(h.soNo)}</div>`;
}

// ─── Index page ──────────────────────────────────────────────
function indexPage(h: SODatasheet["header"], items: LineItem[]): string {
  const rows = items.map(it => {
    const decodDisplay = it.decodNo && it.decodNo.trim() ? esc(it.decodNo) : '<span style="color:#999">--</span>';
    return `<tr><td class="ix">${it.srNo}</td><td class="ix">${esc(it.tagNo)}</td><td class="ixl">${esc(it.instrumentType)}</td><td class="ixl">${esc(it.service)}</td><td class="ix">${esc(it.size)}</td><td class="ix">${it.qty}</td><td class="ixl" style="font-size:7pt;">${decodDisplay}</td><td class="ixl">${esc(it.model)}</td></tr>`;
  }).join("");

  // Only include rows that have actual values — strip empty commercial fields
  const infoRows: string[] = [];
  infoRows.push(r2("Project", h.project, "Supplier", h.supplier));
  if (h.client) infoRows.push(r2("Client", h.client, "End User", h.endUser));
  if (h.soNo) infoRows.push(r2("SO/QTN No.", h.soNo, "PO No.", h.poNo));
  if (h.contractor) infoRows.push(r2("Contractor", h.contractor, "", ""));
  infoRows.push(r2("Date", h.date, "Rev.", h.rev + " - " + h.revDescription));
  infoRows.push(r2("Total Instruments", h.totalQty, "", ""));
  const infoTbl = `<table class="st">${infoRows.join("")}</table>`;

  return `<div class="pg" style="padding:10mm 12mm;"><div style="text-align:center;font-size:11pt;font-weight:bold;margin-bottom:4px;">INSTRUMENT INDEX</div><div style="border-top:2px solid #333;border-bottom:1px solid #333;margin-bottom:8px;"></div><table class="rt"><tr><th class="rh">Rev.</th><th class="rh">Description</th><th class="rh">Date</th><th class="rh">Prepared</th><th class="rh">Checked</th><th class="rh">Approved</th></tr><tr><td class="rd">${esc(h.rev)}</td><td class="rd">${esc(h.revDescription)}</td><td class="rd">${esc(h.date)}</td><td class="rd"></td><td class="rd"></td><td class="rd"></td></tr></table>
  <!-- Row 1: Instrument Summary (full width) -->
  <div class="sx" style="margin-top:10px;">${shdr("INSTRUMENT SUMMARY")}<table class="ixt"><tr><th class="ixh">Sr.</th><th class="ixh">Tag No.</th><th class="ixh">Type</th><th class="ixh">Service</th><th class="ixh">Size</th><th class="ixh">Qty</th><th class="ixh" style="min-width:80px;">De-Cod. No.</th><th class="ixh">Model</th></tr>${rows}</table></div>
  <!-- Row 2: SO Information (full width, below) -->
  <div class="sx" style="margin-top:10px;">${shdr("SO/QTN INFORMATION")}${infoTbl}</div>
  ${pageFooter(h.soNo)}</div>`;
}

function r2(l1: string, v1: string, l2: string, v2: string): string {
  const d1 = v1 && v1.trim() ? esc(v1) : '<span style="color:#999">Not Specified</span>';
  const d2 = v2 && v2.trim() ? esc(v2) : '<span style="color:#999">Not Specified</span>';
  return `<tr><td class="sl">${esc(l1)}</td><td class="sv">${d1}</td><td class="sl">${esc(l2)}</td><td class="sv">${d2}</td></tr>`;
}

function shdr(t: string): string { return `<div class="sh">${esc(t)}</div>`; }

// ─── Standards page ──────────────────────────────────────────
function standardsPage(h: SODatasheet["header"], items: LineItem[]): string {
  // Extract standards ONLY from instruments' sections (not auto-generated)
  const docStandards = new Set<string>();
  items.forEach(it => {
    it.sections.forEach(sec => {
      if (sec.title.includes("STANDARD") || sec.title.includes("REFERENCE")) {
        sec.rows.forEach(([_label, value]) => {
          if (value && value.trim()) docStandards.add(value.trim());
        });
      }
      // Also check if any row label mentions standards
      sec.rows.forEach(([label, value]) => {
        if (label.toLowerCase().includes("standard") && value && value.trim()) {
          docStandards.add(value.trim());
        }
      });
    });
  });

  const stdRows = docStandards.size > 0
    ? Array.from(docStandards).map(s => `<tr><td class="sv" style="padding:3px 6px;font-size:7.5pt;">&bull; ${esc(s)}</td></tr>`).join("")
    : `<tr><td class="sv" style="padding:3px 6px;font-size:7.5pt;color:#999;">Not Specified</td></tr>`;

  const notesRows = h.notes.length > 0
    ? h.notes.map((n, i) => `<tr><td class="sv" style="padding:3px 6px;font-size:7.5pt;">${i + 1}. ${esc(n)}</td></tr>`).join("")
    : `<tr><td class="sv" style="padding:3px 6px;font-size:7.5pt;color:#999;">Not Specified</td></tr>`;

  const signOff = `<div style="margin-top:20px;display:flex;gap:30px;">`
    + `<div style="flex:1;border-top:1.5px solid #333;padding-top:4px;">`
    + `<div style="font-size:7.5pt;font-weight:bold;">Prepared By</div>`
    + `<div style="font-size:7pt;color:#555;">${esc(h.supplier)}</div></div>`
    + `<div style="flex:1;border-top:1.5px solid #333;padding-top:4px;">`
    + `<div style="font-size:7.5pt;font-weight:bold;">Checked By</div>`
    + `<div style="font-size:7pt;color:#555;">${esc(h.contractor)}</div></div>`
    + `<div style="flex:1;border-top:1.5px solid #333;padding-top:4px;">`
    + `<div style="font-size:7.5pt;font-weight:bold;">Approved By</div>`
    + `<div style="font-size:7pt;color:#555;">Client / Consultant</div></div></div>`;

  const headerTbl = `<table class="ib"><tr>`
    + `<td class="il" style="width:12%;">`
    + `<div style="font-weight:bold;font-size:8pt;">TECHNICAL<br>DATASHEET</div>`
    + `<div style="font-size:6.5pt;color:#555;">${esc(h.soNo)}</div></td>`
    + `<td class="ic" style="width:76%;">`
    + `<table class="it">`
    + `<tr><td class="itd" style="width:12%"><strong>Project</strong></td>`
    + `<td class="itd">${esc(h.project)}</td>`
    + `<td class="itd" style="width:12%"><strong>Client</strong></td>`
    + `<td class="itd">${esc(h.client)}</td></tr>`
    + `<tr><td class="itd"><strong>SO/QTN No.</strong></td>`
    + `<td class="itd">${esc(h.soNo)}</td>`
    + `<td class="itd"><strong>Date</strong></td>`
    + `<td class="itd">${esc(h.date)}</td></tr>`
    + `</table></td>`
    + `<td class="ir" style="width:12%;">`
    + `<div style="font-size:7pt;color:#555;">SO/QTN No.</div>`
    + `<div style="font-weight:bold;font-size:10pt;color:#1e3a5f;">${esc(h.soNo)}</div></td>`
    + `</tr></table>`;

  const stdTbl = `<table style="width:100%;border-collapse:collapse;margin-top:10px;"><tr>`
    + `<td style="width:48%;vertical-align:top;padding-right:10px;">`
    + `<div class="sx">${shdr("APPLICABLE STANDARDS")}<table class="st">${stdRows}</table></div></td>`
    + `<td style="width:52%;vertical-align:top;">`
    + `<div class="sx">${shdr("TECHNICAL NOTES")}<table class="st">${notesRows}</table></div></td>`
    + `</tr></table>`;

  return `<div class="pg" style="padding:10mm 12mm;">`
    + `<div style="text-align:center;font-size:10pt;font-weight:bold;margin-bottom:4px;">REFERENCE STANDARDS &amp; TECHNICAL NOTES</div>`
    + `<div style="border-top:2px solid #333;border-bottom:1px solid #333;margin-bottom:8px;"></div>`
    + headerTbl + stdTbl + signOff + pageFooter(h.soNo) + `</div>`;
}

// ─── Footer with Flowtech Logo + Company Name ──────────────
function pageFooter(docNo: string): string {
  return `<div class="ft">
    <img src="${FLOWTECH_LOGO_B64}" alt="Flowtech">
    <div class="ft-txt">
      <div class="ft-name">Flowtech Measuring Instruments Pvt. Ltd.</div>
      <div class="ft-sub">Precision Engineered Flow &amp; Level Measurement Solutions</div>
    </div>
    <div class="ft-doc">Doc: ${esc(docNo)}</div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
export function generateDatasheetTemplate(ds: SODatasheet): string {
  const { header, lineItems } = ds;
  const pages = [
    coverPage(header),
    indexPage(header, lineItems),
    ...lineItems.map((it, idx) => renderInstrumentPage(it, idx + 1, lineItems.length)),
    standardsPage(header, lineItems),
  ].join("\n");

  const css = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,Helvetica,sans-serif;font-size:8.5pt;color:#222;line-height:1.3;margin:0;padding:0;background:#f0f0f0}
/* LANDSCAPE A4: 297mm x 210mm */
.pg{width:297mm;height:210mm;padding:6mm 10mm 10mm 10mm;page-break-after:always;position:relative;background:#fff;margin:0 auto;overflow:hidden}
.pg:last-child{page-break-after:auto}
/* Footer — absolute positioned at bottom of page, overlays padding area */
.ft{position:absolute;bottom:2mm;left:10mm;right:10mm;display:flex;align-items:center;gap:3px;height:7mm;border-top:0.5px solid #cbd5e1;padding-top:1px}
.ft img{height:4.5mm;width:auto;flex-shrink:0;display:block}
.ft-txt{flex:1;min-width:0;line-height:1}
.ft-name{font-size:5.5pt;font-weight:700;color:#1e3a5f;letter-spacing:0.2px;line-height:1;display:block}
.ft-sub{font-size:4.5pt;color:#94a3b8;line-height:1;display:block}
.ft-doc{font-size:5pt;color:#94a3b8;text-align:right;white-space:nowrap}
/* Tables - COMPACT 2-COLUMN */
.st{width:100%;border-collapse:collapse;font-size:7.5pt;margin-top:1px}
.st td{border:1px solid #bbb;padding:2px 4px;vertical-align:middle}
.st td.sl{width:22%;font-weight:600;background:#f5f5f5;font-size:7pt;color:#333;white-space:nowrap;word-break:break-all;overflow-wrap:break-word}
.st td.sv{width:28%;font-size:7.5pt;color:#222;word-break:break-all;overflow-wrap:break-word}
/* Section sub-header within compact table */
.st td.ssh{background:#1e3a5f;color:#fff;padding:2px 4px;font-size:7pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.3px;border:1px solid #1e3a5f}
/* Section boxes (fallback) */
.sx{margin-bottom:4px;border:1.5px solid #444;border-radius:2px;overflow:hidden}
.sh{background:#1e3a5f;color:#fff;border-bottom:1.5px solid #444;padding:2px 4px;font-size:7.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px}
/* Info bar */
.ib{width:100%;border-collapse:collapse;margin-bottom:6px;border:2px solid #1e3a5f}
.ib td{border:1.5px solid #1e3a5f;padding:2px 4px;vertical-align:middle}
.il{width:10%;text-align:center;vertical-align:middle;background:#f0f4f8}
.ic{width:78%;border:none;padding:0}
.it{width:100%;border-collapse:collapse;table-layout:fixed}
.it td{border:1px solid #ccc;font-size:7pt;padding:1px 3px;word-wrap:break-word;overflow-wrap:break-word;white-space:normal;color:#333}
.it td strong{color:#1e3a5f}
.ir{width:12%;text-align:center;vertical-align:middle;background:#f0f4f8}
/* GA Drawing box */
.gad{border:1.5px solid #444;display:flex;flex-direction:column;height:100%;min-height:168mm;border-radius:2px;overflow:hidden}
.gh{border-bottom:1.5px solid #444;padding:3px 5px;font-size:7.5pt;font-weight:bold;text-transform:uppercase;text-align:center;background:#f0f4f8;color:#1e3a5f}
.gp{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px dashed #ccc;margin:6px;padding:15px;text-align:center;background:#fafafa}
.gf{border-top:1.5px solid #444;padding:3px 5px;font-size:7pt;text-align:center;color:#555;background:#f0f4f8;line-height:1.3}
/* Cover */
.cf{border:3px solid #1e3a5f;height:188mm;display:flex;align-items:center;justify-content:center;border-radius:3px}
.ci{width:85%;text-align:center}
.rt{width:100%;border-collapse:collapse;font-size:8pt;margin-bottom:8px}
.rh{border:1.5px solid #1e3a5f;padding:3px 5px;font-size:7pt;font-weight:bold;text-align:center;background:#f0f4f5;color:#1e3a5f}
.rd{border:1px solid #ccc;padding:3px 5px;font-size:7.5pt;text-align:center;color:#333}
/* Index table */
.ixt{width:100%;border-collapse:collapse;font-size:8pt;margin-top:2px}
.ixh{border:1.5px solid #1e3a5f;padding:3px 4px;font-size:7pt;font-weight:bold;text-align:center;background:#f0f4f8;color:#1e3a5f}
.ix{border:1px solid #ccc;padding:2px 4px;font-size:7.5pt;text-align:center;color:#333}
.ixl{border:1px solid #ccc;padding:2px 4px;font-size:7.5pt;text-align:left;color:#333}
/* Print */
@page{size:A4 landscape;margin:0}
@media print{body{background:#fff}.pg{margin:0}}
`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">`
    + `<meta name="viewport" content="width=1200">`
    + `<title>Technical Datasheet - ${esc(header.soNo)}</title>`
    + `<style>${css}</style></head><body>${pages}</body></html>`;
}

/**
 * Generate ONLY Datasheet + GAD for a single line item (NO cover page, NO instrument summary).
 * Used in Project → Datasheet+GAD section for per-line-item download.
 */
export function generateLineItemDatasheetOnly(item: LineItem): string {
  const css = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,Helvetica,sans-serif;font-size:8.5pt;color:#222;line-height:1.3;margin:0;padding:0;background:#f0f0f0}
.pg{width:297mm;height:210mm;padding:6mm 10mm 10mm 10mm;page-break-after:always;position:relative;background:#fff;margin:0 auto;overflow:hidden}
.pg:last-child{page-break-after:auto}
.ft{position:absolute;bottom:2mm;left:10mm;right:10mm;display:flex;align-items:center;gap:3px;height:7mm;border-top:0.5px solid #cbd5e1;padding-top:1px}
.ft img{height:4.5mm;width:auto;flex-shrink:0;display:block}
.ft-txt{flex:1;min-width:0;line-height:1}
.ft-name{font-size:5.5pt;font-weight:700;color:#1e3a5f;letter-spacing:0.2px;line-height:1;display:block}
.ft-sub{font-size:4.5pt;color:#94a3b8;line-height:1;display:block}
.ft-doc{font-size:5pt;color:#94a3b8;text-align:right;white-space:nowrap}
.st{width:100%;border-collapse:collapse;font-size:7.5pt;margin-top:1px}
.st td{border:1px solid #bbb;padding:2px 4px;vertical-align:middle}
.st td.sl{width:22%;font-weight:600;background:#f5f5f5;font-size:7pt;color:#333;white-space:nowrap;word-break:break-all;overflow-wrap:break-word}
.st td.sv{width:28%;font-size:7.5pt;color:#222;word-break:break-all;overflow-wrap:break-word}
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
.gad{border:1.5px solid #444;display:flex;flex-direction:column;height:100%;min-height:168mm;border-radius:2px;overflow:hidden}
.gh{border-bottom:1.5px solid #444;padding:3px 5px;font-size:7.5pt;font-weight:bold;text-transform:uppercase;text-align:center;background:#f0f4f8;color:#1e3a5f}
.gp{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px dashed #ccc;margin:6px;padding:15px;text-align:center;background:#fafafa}
.gf{border-top:1.5px solid #444;padding:3px 5px;font-size:7pt;text-align:center;color:#555;background:#f0f4f8;line-height:1.3}
@page{size:A4 landscape;margin:0}
@media print{body{background:#fff}.pg{margin:0}}
`;

  const page = renderInstrumentPage(item, 1, 1);

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">`
    + `<meta name="viewport" content="width=1200">`
    + `<title>Datasheet + GAD - ${esc(item.tagNo)}</title>`
    + `<style>${css}</style></head><body>${page}</body></html>`;
}
