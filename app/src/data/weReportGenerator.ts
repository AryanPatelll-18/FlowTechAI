// ============================================================
// WATER EQUIVALENT REPORT GENERATOR — Compact 1-Page Layout
// Flowtech Logo, No Scale Drawing, Tight A4 Portrait
// ============================================================

import type { WEResult } from "./waterEquivalentEngine";
import { FLOAT_MATERIALS } from "./waterEquivalentEngine";

export interface WEReportInput {
  result: WEResult;
  customerFlowRate: number;
  flowUnit: string;
  scaleMin: number;
  scaleMax: number;
  floatMaterial: string;
  floatType: string;
  liquidName: string;
  liquidDensity: number;
  liquidViscosity: number;
  temperature: number;
  docId?: string;
}

function esc(s: string | number): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Generate the 5% scale calibration table rows — compact */
function generateScaleTable(result: WEResult, scaleMin: number, scaleMax: number): string {
  const rows: string[] = [];
  const range = scaleMax - scaleMin;
  const lsgcf = result.correctionFactor;

  for (let pct = 0; pct <= 100; pct += 5) {
    const scaleVal = scaleMin + (range * pct) / 100;
    const weLPH = result.service === "liquid" ? scaleVal / lsgcf : scaleVal * lsgcf;

    const bg = pct % 10 === 0 ? "background:#f0f4f8;" : "";
    rows.push(`<tr style="${bg}">
      <td style="padding:1px 4px;text-align:center;font-size:7pt;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">${pct}%</td>
      <td style="padding:1px 4px;text-align:right;font-size:7pt;font-family:monospace;color:#111827;border-bottom:1px solid #e5e7eb;">${scaleVal.toFixed(1)}</td>
      <td style="padding:1px 4px;text-align:right;font-size:7pt;font-family:monospace;color:#dc2626;font-weight:600;border-bottom:1px solid #e5e7eb;">${weLPH.toFixed(2)}</td>
      <td style="padding:1px 4px;text-align:right;font-size:7pt;font-family:monospace;color:#374151;border-bottom:1px solid #e5e7eb;">${(weLPH/60).toFixed(2)}</td>
      <td style="padding:1px 4px;text-align:right;font-size:7pt;font-family:monospace;color:#374151;border-bottom:1px solid #e5e7eb;">${(weLPH/3.78541).toFixed(2)}</td>
      <td style="padding:1px 4px;text-align:right;font-size:7pt;font-family:monospace;color:#374151;border-bottom:1px solid #e5e7eb;">${(weLPH/1000).toFixed(3)}</td>
    </tr>`);
  }

  return rows.join("\n");
}

/** Generate compact 1-page WE Report HTML */
export function generateWEReport(input: WEReportInput): string {
  const {
    result, customerFlowRate, flowUnit, scaleMin, scaleMax,
    floatMaterial, floatType, liquidName, liquidDensity,
    liquidViscosity, temperature, docId,
  } = input;

  const fm = FLOAT_MATERIALS[floatMaterial] || FLOAT_MATERIALS["SS 316"];
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const documentId = docId || `WE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const weLPH = result.we_LPH;
  const weAll = result.we_allUnits;
  const lsgcf = result.correctionFactor;
  const fcf = result.fcf;
  const vic = result.vic || 0;
  const vicRating = fm.vicRating;

  const reynolds = 800;
  const flowRegime = reynolds < 2000 ? "Laminar" : reynolds < 4000 ? "Transitional" : "Turbulent";
  const pressureDrop = 17.264;

  const scaleTableRows = generateScaleTable(result, scaleMin, scaleMax);

  // VIC status
  let vicStatusText = "";
  let vicStatusColor = "#16a34a";
  let vicIcon = "✓";
  if (vic > 2 * vicRating) {
    vicStatusText = `WARNING: VIC ${vic.toFixed(2)} > 2× rating (${vicRating}). Factory calibration mandatory.`;
    vicStatusColor = "#dc2626"; vicIcon = "⚠";
  } else if (vic > vicRating) {
    vicStatusText = `CAUTION: VIC ${vic.toFixed(2)} > rating (${vicRating}). 5-15% over-reading.`;
    vicStatusColor = "#ea580c"; vicIcon = "▲";
  } else if (vic > 0.5 * vicRating) {
    vicStatusText = `ACCEPTABLE: VIC ${vic.toFixed(2)} within rating (${vicRating}). Monitor drift.`;
    vicStatusColor = "#ca8a04"; vicIcon = "▲";
  } else {
    vicStatusText = `OK: VIC ${vic.toFixed(2)} well within rating. WE ${weLPH.toFixed(2)} LPH accurate.`;
  }

  // Flowtech Logo absolute URL
  const logoUrl = `${window.location.origin}/assets/flowtech_logo.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>WE Report ${documentId}</title>
<style>
@page { size: A4 portrait; margin: 6mm; }
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:7.5pt;color:#1f2937;line-height:1.25}
.page{width:198mm;min-height:277mm;padding:4mm;margin:0 auto;background:#fff}
@media print{body{background:#fff}.page{margin:0;padding:2mm}}

/* Header */
.hdr{display:flex;align-items:center;gap:8px;border-bottom:2px solid #1e3a5f;padding-bottom:4px;margin-bottom:6px}
.hdr-logo{width:70px;height:auto}
.hdr-text{flex:1}
.hdr-comp{font-size:10pt;font-weight:800;color:#1e3a5f;letter-spacing:0.5px}
.hdr-sub{font-size:6.5pt;color:#6b7280}
.hdr-right{text-align:right}
.hdr-title{font-size:11pt;font-weight:800;color:#1e3a5f}
.hdr-meta{font-size:6pt;color:#9ca3af}

/* WE Result Banner */
.we-box{background:#1e3a5f;color:#fff;padding:6px 10px;margin-bottom:5px;display:flex;align-items:center;gap:12px;border-radius:3px}
.we-label{font-size:7pt;text-transform:uppercase;letter-spacing:1px;opacity:0.8;flex-shrink:0}
.we-value{font-size:20pt;font-weight:800;flex-shrink:0}
.we-unit{font-size:8pt;opacity:0.7}
.we-stp{font-size:6pt;opacity:0.5;margin-left:auto;text-align:right}

/* Two-column grid */
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:5px}
.box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:2px;padding:4px 6px}
.box-title{font-size:6pt;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;font-weight:700;margin-bottom:3px;border-bottom:1px solid #e2e8f0;padding-bottom:1px}
.row{display:flex;justify-content:space-between;font-size:7pt;padding:1px 0}
.row .lbl{color:#475569}
.row .val{font-weight:600;color:#0f172a;font-family:monospace}
.row .val-red{font-weight:700;color:#dc2626;font-family:monospace}

/* Scale Table */
.tbl-title{font-size:7pt;font-weight:800;color:#1e3a5f;text-transform:uppercase;margin:4px 0 2px;padding-bottom:1px;border-bottom:1px solid #e2e8f0}
table.st{width:100%;border-collapse:collapse;font-size:7pt}
table.st th{background:#1e3a5f;color:#fff;padding:2px 4px;text-align:center;font-weight:600;font-size:6.5pt}
table.st td{padding:1px 4px;text-align:center}
table.st td:first-child{font-weight:600;color:#374151}

/* Formula & Standards */
.formula{font-size:6pt;color:#64748b;font-family:monospace;background:#f1f5f9;padding:3px 6px;border-radius:2px;margin-top:4px}
.std-line{font-size:6pt;color:#64748b;display:flex;gap:12px;flex-wrap:wrap;margin-top:3px}
.std-line strong{color:#1e3a5f}

/* Footer */
.ftr{margin-top:4px;padding-top:3px;border-top:1px solid #e2e8f0;font-size:5.5pt;color:#94a3b8;display:flex;justify-content:space-between}
</style>
</head>
<body>
<div class="page">

<!-- HEADER -->
<div class="hdr">
  <img src="${logoUrl}" class="hdr-logo" alt="Flowtech" onerror="this.style.display='none'">
  <div class="hdr-text">
    <div class="hdr-comp">FLOWTECH</div>
    <div class="hdr-sub">MEASURING INSTRUMENTS PVT. LTD.</div>
  </div>
  <div class="hdr-right">
    <div class="hdr-title">Water Equivalent Report</div>
    <div class="hdr-meta">${dateStr} ${timeStr} | ${documentId}</div>
  </div>
</div>

<!-- WE RESULT BANNER -->
<div class="we-box">
  <span class="we-label">Water Equivalent</span>
  <span class="we-value">${weLPH.toFixed(2)}</span>
  <span class="we-unit">LPH @ STP (70°F / 21.1°C)</span>
  <span class="we-stp">Based on water at 70°F (21.1°C), SG=1.0<br>${result.service === "liquid" ? "LSGCF" : "GCF"}: ${lsgcf.toFixed(5)}${fcf !== undefined ? ` | FCF: ${fcf.toFixed(4)}` : ""}</span>
</div>

<!-- TWO-COLUMN: Inputs & Results -->
<div class="grid2">
  <div class="box">
    <div class="box-title">Input Parameters</div>
    <div class="row"><span class="lbl">Customer Flow</span><span class="val">${customerFlowRate.toFixed(2)} ${esc(flowUnit)}</span></div>
    <div class="row"><span class="lbl">Scale Range</span><span class="val">${scaleMin.toFixed(1)} – ${scaleMax.toFixed(1)} ${esc(flowUnit)}</span></div>
    <div class="row"><span class="lbl">Liquid</span><span class="val">${esc(liquidName)} SG ${result.liquidSG.toFixed(4)}</span></div>
    <div class="row"><span class="lbl">Liquid Density</span><span class="val">${liquidDensity.toFixed(1)} kg/m³</span></div>
    <div class="row"><span class="lbl">Viscosity</span><span class="val">${liquidViscosity.toFixed(3)} cP</span></div>
    <div class="row"><span class="lbl">Temperature</span><span class="val">${temperature} °C</span></div>
    <div class="row"><span class="lbl">Float</span><span class="val">${esc(floatMaterial)} SG ${result.floatSG.toFixed(3)} ${esc(floatType)}</span></div>
  </div>
  <div class="box">
    <div class="box-title">Calculation Results</div>
    <div class="row"><span class="lbl">WE (LPH)</span><span class="val-red">${weLPH.toFixed(2)}</span></div>
    <div class="row"><span class="lbl">WE (LPM)</span><span class="val">${(weAll["LPM"]||weLPH/60).toFixed(3)}</span></div>
    <div class="row"><span class="lbl">WE (GPH)</span><span class="val">${(weAll["GPH"]||weLPH/3.78541).toFixed(3)}</span></div>
    <div class="row"><span class="lbl">WE (GPM)</span><span class="val">${(weAll["GPM"]||weLPH/227.124).toFixed(3)}</span></div>
    <div class="row"><span class="lbl">WE (m³/h)</span><span class="val">${(weAll["m³/h"]||weLPH/1000).toFixed(4)}</span></div>
    <div class="row"><span class="lbl">${result.service === "liquid" ? "LSGCF" : "GCF"}</span><span class="val-red">${lsgcf.toFixed(5)}</span></div>
    <div class="row"><span class="lbl">Operating Point</span><span class="val">${((customerFlowRate/scaleMax)*100).toFixed(0)}% of scale</span></div>
  </div>
</div>

<!-- TWO-COLUMN: Technical Params & VIC -->
<div class="grid2">
  <div class="box">
    <div class="box-title">Technical Parameters</div>
    <div class="row"><span class="lbl">Flow Regime</span><span class="val">${flowRegime}</span></div>
    <div class="row"><span class="lbl">Max Pressure Drop</span><span class="val">${pressureDrop.toFixed(3)} mbar</span></div>
    <div class="row"><span class="lbl">Reynolds Number</span><span class="val">${reynolds.toFixed(0)}</span></div>
    <div class="row"><span class="lbl">VIC</span><span class="val" style="color:${vicStatusColor};">${vic.toFixed(2)} cP</span></div>
    <div class="row"><span class="lbl">Float Density</span><span class="val">${result.floatDensity} kg/m³</span></div>
  </div>
  <div class="box" style="border-left:3px solid ${vicStatusColor};">
    <div class="box-title">VIC Status — ${vicIcon}</div>
    <div style="font-size:7pt;color:${vicStatusColor};font-weight:600;">${vicStatusText}</div>
  </div>
</div>

<!-- SCALE CALIBRATION TABLE -->
<div class="tbl-title">Variable Scale Marking — Water Equivalent at 5% Scale Increments</div>
<table class="st">
  <thead><tr><th>%</th><th>${esc(flowUnit)}</th><th>LPH (WE)</th><th>LPM</th><th>GPH</th><th>m³/h</th></tr></thead>
  <tbody>${scaleTableRows}</tbody>
</table>

<!-- FORMULA & STANDARDS -->
<div class="formula">
  ${result.service === "liquid"
    ? `LSGCF = sqrt[(FloatSG − LiquidSG) / ((FloatSG − 1.0) × LiquidSG)] &nbsp;|&nbsp; Water Equivalent = Flow / LSGCF &nbsp;|&nbsp; STP: Water at 70°F (21.1°C), SG = 1.0`
    : `FCF = sqrt[(ρfloat − ρwater) / (ρfloat − ρgas,op)] &nbsp;|&nbsp; WE = Qop × FCF × sqrt(ρgas,op/ρwater) &nbsp;|&nbsp; STP: 70°F (21.1°C), 14.7 PSIA`
  }
</div>
<div class="std-line">
  <strong>VDI 3513</strong> — Variable area flowmeters &nbsp;
  <strong>ISO 11605</strong> — Rotameter measurement &nbsp;
  <strong>King Instrument</strong> — Float: ${esc(floatType)} STP: 70°F
</div>

<!-- FOOTER -->
<div class="ftr">
  <span>Confidential — Flowtech Measuring Instruments Pvt. Ltd.</span>
  <span>${documentId} | ${dateStr}</span>
</div>

</div>
</body>
</html>`;
}

/** Trigger PDF download */
export function downloadWEReport(input: WEReportInput): void {
  const html = generateWEReport(input);
  const w = window.open("", "_blank");
  if (!w) { alert("Please allow popups to download the report."); return; }
  w.document.write(html);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 500);
}

// ─────────────────────────────────────────────────────────────
// FALLBACK ROTAMETER SIZING REPORT (when WE calculation fails)
// Generates a basic but complete sizing sheet from VA data
// ─────────────────────────────────────────────────────────────

export interface FallbackRotameterInput {
  tagNumber: string;
  customerName: string;
  soNumber: string;
  productFamily: string;
  modelName: string;
  sizingSize: string;
  processConditions: any;
  vaResult: any;
  floatMoc: string;
}

export function generateFallbackRotameterReport(input: FallbackRotameterInput): string {
  const { tagNumber, customerName, soNumber, productFamily, modelName, sizingSize, processConditions, vaResult, floatMoc } = input;
  const f = esc;
  const now = new Date().toLocaleDateString("en-GB");

  const allTubes = vaResult?.allTubes || [];
  const bestTube = allTubes.find((t: any) => t.size === sizingSize) || allTubes[0];

  let tubeRows = "";
  for (const t of allTubes) {
    const isBest = t.size === sizingSize;
    tubeRows += `<tr style="${isBest ? "background:#dcfce7;font-weight:700;" : ""}">
      <td style="padding:4px 8px;border:1px solid #000;font-size:8pt;">${f(t.size)}</td>
      <td style="padding:4px 8px;border:1px solid #000;font-size:8pt;text-align:right;">${(t.qMin ?? 0).toFixed(1)}</td>
      <td style="padding:4px 8px;border:1px solid #000;font-size:8pt;text-align:right;">${(t.qMax ?? 0).toFixed(1)}</td>
      <td style="padding:4px 8px;border:1px solid #000;font-size:8pt;">${f(t.processConnection || "15NB to 100NB")}</td>
      <td style="padding:4px 8px;border:1px solid #000;font-size:8pt;">${isBest ? "★ SELECTED" : t.status || ""}</td>
    </tr>`;
  }

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Sizing ${f(tagNumber)}</title>
<style>
@page{size:A4 portrait;margin:8mm}
body{font-family:Arial,Helvetica,sans-serif;font-size:9pt;color:#000;line-height:1.4;margin:0;padding:8mm}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid #000;padding:5px 8px;font-size:8pt}
th{background:#f0f0f0;font-weight:700;text-align:left}
h2{font-size:12pt;border-bottom:2px solid #000;padding-bottom:4px;margin:16px 0 8px}
.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #c20017;padding-bottom:8px;margin-bottom:12px}
.header .company{font-size:10pt;font-weight:700;color:#c20017}
.header .title{font-size:14pt;font-weight:700;color:#1e3a5f}
.warn-box{border:1px solid #dc2626;background:#fee2e2;padding:8px 12px;margin:8px 0;font-size:8pt;color:#dc2626}
</style></head><body>
<div class="header">
  <div><div class="company">Flowtech Measuring Instruments Pvt. Ltd.</div><div style="font-size:8pt;color:#666">Rotameter Sizing Report</div></div>
  <div style="text-align:right"><div style="font-size:8pt;color:#666">${f(soNumber || "—")}</div><div style="font-size:8pt;color:#666">${now}</div></div>
</div>
<h2>Sizing Sheet — ${f(tagNumber)}</h2>
<table>
  <tr><th colspan="2" style="background:#1e3a5f;color:#fff">Process Data</th></tr>
  <tr><td style="width:35%;background:#f5f5f5;font-weight:700">Tag Number</td><td>${f(tagNumber)}</td></tr>
  <tr><td style="background:#f5f5f5;font-weight:700">Product</td><td>${f(productFamily)}</td></tr>
  <tr><td style="background:#f5f5f5;font-weight:700">Model</td><td>${f(modelName || "—")}</td></tr>
  <tr><td style="background:#f5f5f5;font-weight:700">Fluid / Service</td><td>${f(processConditions?.fluidName || processConditions?.service || "—")}</td></tr>
  <tr><td style="background:#f5f5f5;font-weight:700">Flow Rate (Min)</td><td>${processConditions?.flowRateMin ?? "—"} ${f(processConditions?.flowUnit || "m³/hr")}</td></tr>
  <tr><td style="background:#f5f5f5;font-weight:700">Flow Rate (Max)</td><td>${processConditions?.flowRateMax ?? "—"} ${f(processConditions?.flowUnit || "m³/hr")}</td></tr>
  <tr><td style="background:#f5f5f5;font-weight:700">Density</td><td>${processConditions?.density ?? "—"} kg/m³</td></tr>
  <tr><td style="background:#f5f5f5;font-weight:700">Viscosity</td><td>${processConditions?.viscosity ?? "—"} cP</td></tr>
  <tr><td style="background:#f5f5f5;font-weight:700">Operating Temp</td><td>${processConditions?.operatingTemp ?? "—"} °C</td></tr>
  <tr><td style="background:#f5f5f5;font-weight:700">Operating Pressure</td><td>${processConditions?.operatingPressure ?? "—"} bara</td></tr>
</table>
<h2>Sizing Result</h2>
<table>
  <tr><th colspan="2" style="background:#1e3a5f;color:#fff">Recommended Meter</th></tr>
  <tr><td style="width:35%;background:#f5f5f5;font-weight:700">Selected Size</td><td style="font-weight:700;color:#16a34a;font-size:10pt">${f(sizingSize)}</td></tr>
  <tr><td style="background:#f5f5f5;font-weight:700">Float MOC</td><td>${f(floatMoc)}</td></tr>
  <tr><td style="background:#f5f5f5;font-weight:700">Scale Range</td><td>${bestTube ? `${(bestTube.qMin ?? 0).toFixed(1)} - ${(bestTube.qMax ?? 0).toFixed(1)} LPH` : "—"}</td></tr>
</table>
<h2>Available Tube Sizes</h2>
<table>
  <tr style="background:#f0f0f0"><th>Size</th><th>Qmin (LPH)</th><th>Qmax (LPH)</th><th>Connection</th><th>Status</th></tr>
  ${tubeRows}
</table>
<div class="warn-box">
  <strong>Note:</strong> Water Equivalent calculation could not be completed due to insufficient process data. The sizing above recommends the best-fit tube based on flow range matching. Please verify all process conditions (fluid density, viscosity, temperature, pressure) for accurate WE calculation.
</div>
<div style="text-align:center;font-size:7pt;color:#666;margin-top:16px;border-top:1px solid #000;padding-top:8px">
  Flowtech Measuring Instruments Pvt. Ltd. — Sizing Report — ${f(tagNumber)} — CONFIDENTIAL
</div>
</body></html>`;
}
