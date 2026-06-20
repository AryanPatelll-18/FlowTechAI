// ============================================================
// MASTER REPORT ENGINE — Combines 3 Reports into 1
// 1. SO Datasheet | 2. QAP (grouped by family) | 3. Sizing (flowmeters only)
// ============================================================

import type { SODatasheet, LineItem } from "./dataMapper";
import { hasQapMaster, getQapMaster, QAP_PRODUCT_LABELS } from "../data/qapMasterData";
import type { QapProductFamily } from "../data/qapMasterData";

/** Report section selection */
export interface ReportSelection {
  datasheet: boolean;
  qap: boolean;
  sizing: boolean;
}

/** Sizing parameters for a single SO line item */
export interface SizingParameters {
  service: "liquid" | "gas";
  flowRateMin: number;
  flowRateMax: number;
  flowUnit: string;
  fluidName: string;
  fluidDensity: number;     // kg/m³
  fluidViscosity: number;   // cP
  fluidSG: number;
  operatingTemp: number;    // °C
  operatingPressure: number;// bara
  lineSize: string;
  meterCategory: "inline" | "variable_area";
  calculated: boolean;
  sizingResult?: string;    // HTML from sizing
}

/** Per-item report configuration */
export interface ItemReportConfig {
  item: LineItem;
  selection: ReportSelection;
  sizingParams: SizingParameters;
  qapFamily: QapProductFamily | null;
  qapLabel: string;
}

/** Product types eligible for sizing (flowmeters & rotameters only) */
const FLOWMETER_KEYWORDS = [
  "electromagnetic", "emf", "mag flow", "turbine", "vortex",
  "ultrasonic", "oval gear", "rotameter", "bypass",
];

/** Check if a product type is a flowmeter/rotameter (eligible for sizing) */
export function isFlowMeterProduct(type: string): boolean {
  const t = type.toLowerCase();
  return FLOWMETER_KEYWORDS.some((kw) => t.includes(kw));
}

/** Map SO product type to QAP product family */
export function mapToQapFamily(type: string): QapProductFamily | null {
  const t = type.toLowerCase();

  if (t.includes("electromagnetic") || t.includes("emf") || t.includes("mag flow")) return "emf";
  if (t.includes("turbine")) return "turbine";
  if (t.includes("vortex")) return "vortex";
  if (t.includes("ultrasonic")) return "ultrasonic";
  if (t.includes("oval gear")) return "oval_gear";
  if (t.includes("glass tube") || (t.includes("rotameter") && !t.includes("metal") && !t.includes("acrylic") && !t.includes("bypass"))) return "rotameter";
  if (t.includes("metal tube") || (t.includes("rotameter") && t.includes("metal"))) return "metal_tube_rotameter";
  if (t.includes("acrylic") && t.includes("rotameter")) return "acrylic_body_rotameter";
  if (t.includes("bypass") && t.includes("rotameter")) return "bypass_rotameter";
  if (t.includes("magnetic level") || t.includes("mli") || t.includes("magnetic gauge")) return "magnetic_level";
  if (t.includes("reflex") || t.includes("sight glass")) return "reflex_level";
  if (t.includes("transparent") || t.includes("tubular")) return "transparent_level";
  if (t.includes("tubular")) return "tubular_level";
  if (t.includes("float board") || t.includes("float & board")) return "float_board_level";
  if (t.includes("hydrostatic")) return "hydrostatic_level";
  if (t.includes("radar")) return "radar_level";
  if (t.includes("pressure") || t.includes("transmitter")) return "smart_pressure";
  if (t.includes("sight glass") && t.includes("double window")) return "double_window_sight_glass";
  if (t.includes("sight glass") && t.includes("allen")) return "allen_bolt_sight_glass";
  if (t.includes("sight glass")) return "reflex_level";

  return null;
}

/** Create sizing parameters from extracted process data (or defaults) */
export function createDefaultSizingParams(item: LineItem): SizingParameters {
  const pd = item.processData;
  const sizeMatch = item.size.match(/(\d+)/);
  const sizeNum = sizeMatch ? parseInt(sizeMatch[1]) : 50;

  // Determine flow rates
  let flowMin = pd.flowRateMin ?? 0;
  let flowMax = pd.flowRateMax ?? 0;
  if (!flowMin && !flowMax && pd.flowRateNormal) {
    // Only normal flow given → estimate min/max
    flowMin = Math.round(pd.flowRateNormal * 0.1 * 10) / 10;
    flowMax = pd.flowRateNormal;
  }
  // If only max given, estimate min
  if (!flowMin && flowMax) flowMin = Math.round(flowMax * 0.1 * 10) / 10;
  // If only min given, estimate max
  if (flowMin && !flowMax) flowMax = flowMin * 10;

  return {
    service: pd.service ?? "liquid",
    flowRateMin: flowMin,
    flowRateMax: flowMax,
    flowUnit: pd.flowUnit ?? "LPH",
    fluidName: pd.fluidName ?? item.service ?? "Water",
    fluidDensity: pd.fluidDensity ?? 1000,
    fluidViscosity: pd.fluidViscosity ?? 1.0,
    fluidSG: pd.fluidSG ?? (pd.fluidDensity ? pd.fluidDensity / 1000 : 1.0),
    operatingTemp: pd.operatingTemp ?? 25,
    operatingPressure: pd.operatingPressure ?? 1.013,
    lineSize: pd.lineSize ?? `${sizeNum}NB`,
    meterCategory: "inline",
    calculated: false,
  };
}

/** Parameters required for a valid sizing calculation */
export const REQUIRED_SIZING_FIELDS = [
  { key: "flowRateMax", label: "Flow Rate (Max)", unit: "" },
  { key: "fluidName", label: "Fluid Name", unit: "" },
  { key: "fluidSG", label: "Fluid Specific Gravity", unit: "" },
  { key: "operatingTemp", label: "Operating Temperature", unit: "°C" },
  { key: "operatingPressure", label: "Operating Pressure", unit: "bara" },
  { key: "lineSize", label: "Line Size", unit: "" },
] as const;

/** Check which sizing parameters are missing for an item */
export function detectMissingSizingParams(item: LineItem): { field: string; label: string; unit: string }[] {
  const pd = item.processData;
  const missing: { field: string; label: string; unit: string }[] = [];

  if (!pd.flowRateMax && !pd.flowRateNormal) missing.push({ field: "flowRateMax", label: "Flow Rate (Max/Normal)", unit: "LPH / m³/h" });
  if (!pd.fluidName && !item.service) missing.push({ field: "fluidName", label: "Fluid Name / Service", unit: "" });
  if (!pd.fluidSG && !pd.fluidDensity) missing.push({ field: "fluidSG", label: "Fluid SG or Density", unit: "" });
  if (!pd.operatingTemp) missing.push({ field: "operatingTemp", label: "Operating Temperature", unit: "°C" });
  if (!pd.operatingPressure) missing.push({ field: "operatingPressure", label: "Operating Pressure", unit: "bara" });
  if (!pd.lineSize) missing.push({ field: "lineSize", label: "Line Size", unit: "NB" });

  return missing;
}

/** Check if enough process data was extracted to attempt sizing */
export function hasEnoughProcessData(item: LineItem): boolean {
  return detectMissingSizingParams(item).length === 0;
}

/** Generate report configuration from parsed SO */
export function generateReportConfig(ds: SODatasheet): ItemReportConfig[] {
  return ds.lineItems.map((item) => {
    const qapFamily = mapToQapFamily(item.instrumentType);
    const hasQap = qapFamily !== null && hasQapMaster(qapFamily);
    const isFlow = isFlowMeterProduct(item.instrumentType);

    return {
      item,
      selection: {
        datasheet: true,
        qap: hasQap,
        sizing: isFlow,           // Only flowmeters get sizing
      },
      sizingParams: createDefaultSizingParams(item),
      qapFamily: hasQap ? qapFamily : null,
      qapLabel: hasQap && qapFamily ? QAP_PRODUCT_LABELS[qapFamily] : "No QAP Available",
    };
  });
}

/** Group configs by QAP family for consolidated QAP display */
export function groupByQapFamily(configs: ItemReportConfig[]): Map<QapProductFamily, { label: string; items: ItemReportConfig[] }> {
  const map = new Map<QapProductFamily, { label: string; items: ItemReportConfig[] }>();
  configs.forEach((c) => {
    if (!c.qapFamily) return;
    const existing = map.get(c.qapFamily);
    if (existing) {
      existing.items.push(c);
    } else {
      map.set(c.qapFamily, { label: c.qapLabel, items: [c] });
    }
  });
  return map;
}

/** Check if at least one item has a section selected */
export function hasAnySection(configs: ItemReportConfig[], section: keyof ReportSelection): boolean {
  return configs.some((c) => c.selection[section]);
}

/** Get QAP HTML for a product family */
export function getQapHtml(family: QapProductFamily): string {
  const qap = getQapMaster(family);
  if (!qap) return "<p>No QAP available.</p>";

  const rows = qap.rows.map((r, i) => {
    const cells = [
      r.srNo, r.component, r.characteristics, r.category, r.method, r.extent, r.reference, r.acceptance, r.recordFormat, r.flowtech, r.agency, r.client, r.remarks
    ].map((c) => `<td style="border:1px solid #94a3b8;padding:2px 4px;font-size:6.5pt;">${esc(String(c || ""))}</td>`).join("");
    const bg = i % 2 === 0 ? "background:#f8fafc;" : "";
    return `<tr style="${bg}">${cells}</tr>`;
  }).join("\n");

  return `<div style="margin-bottom:8px;">
    <div style="background:#1e3a5f;color:#fff;padding:3px 6px;font-size:7pt;font-weight:bold;">${esc(qap.title)} — QAP MASTER</div>
    <table style="width:100%;border-collapse:collapse;font-size:6.5pt;">
      <tr style="background:#e2e8f0;">
        <th style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">Sr.</th>
        <th style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">Component</th>
        <th style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">Characteristics</th>
        <th style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">Cat.</th>
        <th style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">Method</th>
        <th style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">Extent</th>
        <th style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">Reference</th>
        <th style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">Acceptance</th>
        <th style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">Record</th>
        <th style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">Flow</th>
        <th style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">Agy</th>
        <th style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">Client</th>
        <th style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">Remarks</th>
      </tr>
      ${rows}
    </table>
  </div>`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Build the Index / Table of Contents page */
function buildIndexPage(
  configs: ItemReportConfig[],
  includeDatasheet: boolean,
  includeQap: boolean,
  includeSizing: boolean,
): string {
  const qapGroups = groupByQapFamily(configs);
  const sizingItems = configs.filter((c) => c.selection.sizing);

  let pageNo = 1;
  const rows: string[] = [];

  // Datasheet section pages
  if (includeDatasheet) {
    rows.push(indexRow(pageNo, "Cover Page", "SO / QTN Header & Project Details"));
    pageNo++;
    rows.push(indexRow(pageNo, "Instrument Index", "Tag-wise summary of all line items"));
    pageNo++;
    configs.forEach((c) => {
      rows.push(indexRow(pageNo, `Instrument Sheet — ${esc(c.item.tagNo)}`, esc(c.item.instrumentType)));
      pageNo++;
    });
    rows.push(indexRow(pageNo, "Technical Standards", "Applicable standards & specifications"));
    pageNo++;
  }

  // Master Report Index page itself
  rows.push(`<tr style="background:#f0f4f8;">
    <td style="border:1px solid #94a3b8;padding:3px 6px;font-size:7.5pt;font-weight:bold;color:#1e3a5f;text-align:center;">—</td>
    <td style="border:1px solid #94a3b8;padding:3px 6px;font-size:7.5pt;font-weight:bold;color:#1e3a5f;">Master Report Index</td>
    <td style="border:1px solid #94a3b8;padding:3px 6px;font-size:7.5pt;color:#1e3a5f;">This page — consolidated navigation</td>
  </tr>`);

  // QAP pages (one per family)
  if (includeQap && qapGroups.size > 0) {
    qapGroups.forEach((group) => {
      rows.push(indexRow(pageNo, `QAP — ${esc(group.label)}`, `${group.items.length} item(s): ${group.items.map((g) => esc(g.item.tagNo)).join(", ")}`));
      pageNo++;
    });
  }

  // Sizing pages (one per flowmeter item)
  if (includeSizing && sizingItems.length > 0) {
    sizingItems.forEach((c) => {
      rows.push(indexRow(pageNo, `Sizing — ${esc(c.item.tagNo)}`, `${esc(c.item.instrumentType)} | ${esc(c.sizingParams.fluidName)} @ ${c.sizingParams.operatingTemp}°C`));
      pageNo++;
    });
  }

  return `<div class="section-title" style="margin-top:0;">Master Report Index</div>
  <table style="width:100%;border-collapse:collapse;font-size:7.5pt;margin-bottom:8px;">
    <tr style="background:#1e3a5f;color:#fff;">
      <th style="padding:4px 6px;font-size:7pt;width:8%">Page</th>
      <th style="padding:4px 6px;font-size:7pt;width:35%">Section</th>
      <th style="padding:4px 6px;font-size:7pt;width:57%">Description</th>
    </tr>
    ${rows.join("\n")}
  </table>`;
}

function indexRow(page: number, section: string, desc: string): string {
  return `<tr>
    <td style="border:1px solid #94a3b8;padding:3px 6px;font-size:7.5pt;text-align:center;font-weight:bold;color:#1e3a5f;">${page}</td>
    <td style="border:1px solid #94a3b8;padding:3px 6px;font-size:7.5pt;font-weight:600;color:#334155;">${section}</td>
    <td style="border:1px solid #94a3b8;padding:3px 6px;font-size:7pt;color:#475569;">${desc}</td>
  </tr>`;
}

/** Assemble the master report HTML */
export function assembleMasterReport(
  configs: ItemReportConfig[],
  datasheetHtml: string,
  includeDatasheet: boolean,
  includeQap: boolean,
  includeSizing: boolean,
): string {
  const css = `
    @page { size: A4 landscape; margin: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8pt; margin: 0; padding: 0; }
    .mpg { width: 297mm; min-height: 210mm; padding: 6mm 10mm 8mm 10mm; page-break-after: always; position: relative; background: #fff; }
    .mpg:last-child { page-break-after: auto; }
    .mhdr { display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #1e3a5f; padding-bottom: 4px; margin-bottom: 8px; }
    .mhdr img { height: 28px; width: auto; }
    .mhdr-txt { flex: 1; }
    .mhdr-comp { font-size: 10pt; font-weight: 800; color: #1e3a5f; }
    .mhdr-sub { font-size: 6.5pt; color: #64748b; }
    .mhdr-right { text-align: right; }
    .mhdr-title { font-size: 11pt; font-weight: 800; color: #1e3a5f; }
    .mhdr-meta { font-size: 6pt; color: #94a3b8; }
    .section-title { background: #1e3a5f; color: #fff; padding: 3px 8px; font-size: 8pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin: 6px 0 4px; }
    .item-box { border: 1px solid #cbd5e1; border-radius: 2px; padding: 6px; margin-bottom: 6px; }
    .item-header { display: flex; gap: 12px; font-size: 7.5pt; margin-bottom: 4px; padding-bottom: 2px; border-bottom: 1px solid #e2e8f0; }
    .item-tag { font-weight: 700; color: #1e3a5f; font-family: monospace; }
    .item-type { color: #475569; }
    .item-size { color: #64748b; }
    .sizing-result-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 4px 8px; font-size: 7pt; }
    .no-data { color: #94a3b8; font-style: italic; font-size: 7pt; padding: 4px; }
    .family-header { background: #f0f4f8; border: 1px solid #cbd5e1; padding: 4px 8px; font-size: 8pt; font-weight: 700; color: #1e3a5f; margin-bottom: 4px; }
    .family-tags { font-size: 6.5pt; color: #64748b; font-weight: 400; margin-top: 1px; }
    /* Footer */
    .ft { position: absolute; bottom: 2mm; left: 10mm; right: 10mm; display: flex; align-items: center; gap: 3px; height: 6mm; border-top: 0.5px solid #cbd5e1; padding-top: 1px; }
    .ft img { height: 4.5mm; width: auto; flex-shrink: 0; display: block; }
    .ft-txt { flex: 1; min-width: 0; line-height: 1; }
    .ft-name { font-size: 5.5pt; font-weight: 700; color: #1e3a5f; letter-spacing: 0.2px; line-height: 1; display: block; }
    .ft-sub { font-size: 4.5pt; color: #94a3b8; line-height: 1; display: block; }
    @media print { body { background: #fff; } }
  `;

  // Build sections
  const indexPage = buildIndexPage(configs, includeDatasheet, includeQap, includeSizing);

  // QAP — grouped by family (ONE QAP per family)
  let qapSection = "";
  if (includeQap) {
    const qapGroups = groupByQapFamily(configs);
    if (qapGroups.size > 0) {
      qapSection = `<div class="section-title">Section 2 — Quality Assurance Plan (QAP)</div>`;
      qapGroups.forEach((group, family) => {
        const tagList = group.items.map((g) => esc(g.item.tagNo)).join(", ");
        qapSection += `<div class="item-box">
          <div class="family-header">
            ${esc(group.label)}
            <div class="family-tags">Applicable Items: ${tagList}</div>
          </div>
          ${getQapHtml(family)}
        </div>`;
      });
    }
  }

  // Sizing — only flowmeters
  let sizingSection = "";
  if (includeSizing) {
    const sizingItems = configs.filter((c) => c.selection.sizing);
    if (sizingItems.length > 0) {
      sizingSection = `<div class="section-title">Section 3 — Sizing Calculations</div>`;
      sizingItems.forEach((c) => {
        sizingSection += `<div class="item-box">
          <div class="item-header">
            <span class="item-tag">${esc(c.item.tagNo)}</span>
            <span class="item-type">${esc(c.item.instrumentType)}</span>
            <span class="item-size">${esc(c.item.size)}</span>
            <span style="margin-left:auto;color:#64748b;">${esc(c.sizingParams.fluidName)} @ ${c.sizingParams.operatingTemp}°C</span>
          </div>
          ${c.sizingParams.calculated && c.sizingParams.sizingResult
            ? `<div class="sizing-result-box">${c.sizingParams.sizingResult}</div>`
            : `<div class="no-data">Sizing not yet calculated. Configure parameters and run sizing.</div>`
          }
        </div>`;
      });
    }
  }

  const headerText = configs.length > 0
    ? `<div class="mhdr-right"><div class="mhdr-title">Master Technical Report</div><div class="mhdr-meta">${configs.length} Line Items | SO: ${esc(configs[0].item.header.soNo)}</div></div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Master Report</title><style>${css}</style></head>
<body>
  <!-- Section 1: SO Datasheet -->
  ${includeDatasheet ? datasheetHtml.replace(/<body>/, `<body>`).replace(/<\/body>/, "") : ""}

  <!-- Master Report Section -->
  <div class="mpg">
    <div class="mhdr">
      <img src="data:image/png;base64,${getLogoPlaceholder()}" alt="Flowtech">
      <div class="mhdr-txt">
        <div class="mhdr-comp">FLOWTECH</div>
        <div class="mhdr-sub">MEASURING INSTRUMENTS PVT. LTD.</div>
      </div>
      ${headerText}
    </div>

    ${indexPage}

    ${includeQap && qapSection ? qapSection : ""}
    ${includeSizing && sizingSection ? sizingSection : ""}

    ${(!includeQap && !includeSizing) ? `<div style="text-align:center;color:#94a3b8;padding:40px;font-size:10pt;">Select at least one report section (QAP or Sizing) to generate.</div>` : ""}

    <div class="ft">
      <img src="data:image/png;base64,${getLogoPlaceholder()}" alt="Flowtech">
      <div class="ft-txt">
        <div class="ft-name">Flowtech Measuring Instruments Pvt. Ltd.</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Logo placeholder
function getLogoPlaceholder(): string {
  return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
}

/** Inject real logo into report HTML */
export function injectLogo(html: string, logoBase64: string): string {
  return html.replace(new RegExp(getLogoPlaceholder(), "g"), logoBase64);
}
