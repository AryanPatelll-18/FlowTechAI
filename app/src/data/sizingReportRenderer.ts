// ============================================================
// Sizing Report Renderer — Professional MNC-Quality HTML
// With ISO 5168 Measurement Uncertainty & Flowtech Branding
// ============================================================

import {
  type SizingReportData,
  generateFlowRangeChart,
  generateUncertaintyChart,
  generateUncertaintyBudgetChart,
  generatePressureDropChart,
  generateVelocityChart,
} from "./sizingReportEngine";
import { FLOWTECH_LOGO_B64 } from "./flowtechLogoBase64";

export function renderSizingReportHtml(data: SizingReportData): string {
  const statusColor = data.sizingStatus === "optimal" ? "#1e8e3e" : data.sizingStatus === "valid" ? "#1a73e8" : data.sizingStatus === "marginal" ? "#f9a825" : "#c5221f";
  const statusLabel = data.sizingStatus === "optimal" ? "OPTIMAL" : data.sizingStatus === "valid" ? "VALID" : data.sizingStatus === "marginal" ? "MARGINAL" : "REJECTED";

  const charts = {
    flowRange: generateFlowRangeChart(data),
    uncertainty: generateUncertaintyChart(data),
    budget: generateUncertaintyBudgetChart(data),
    pressureDrop: generatePressureDropChart(data),
    velocity: generateVelocityChart(data),
  };

  // Uncertainty budget table rows
  const budgetRows = data.uncertaintyBudget.map(item => `
    <tr style="border-bottom:1px solid #e0e0e0;">
      <td style="padding:4px 8px;font-size:8px;color:#555;font-weight:600;">${item.symbol}</td>
      <td style="padding:4px 8px;font-size:8px;color:#444;">${item.source}</td>
      <td style="padding:4px 8px;font-size:8px;color:#666;text-align:center;">${item.type}</td>
      <td style="padding:4px 8px;font-size:8px;color:#444;text-align:center;">${item.statedValue}</td>
      <td style="padding:4px 8px;font-size:8px;color:#888;text-align:center;">${item.distribution}</td>
      <td style="padding:4px 8px;font-size:8px;color:#555;text-align:center;">${item.divisor.toFixed(3)}</td>
      <td style="padding:4px 8px;font-size:8px;color:#333;font-weight:700;text-align:right;background:#f5f5f5;">${item.standardUncertainty.toFixed(4)}%</td>
      <td style="padding:4px 8px;font-size:8px;color:#666;text-align:center;">${item.sensitivity.toFixed(1)}</td>
      <td style="padding:4px 8px;font-size:8px;color:#333;font-weight:600;text-align:right;background:#fafafa;">${item.contribution.toFixed(6)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Flow Meter Sizing Report — ${data.meterName} ${data.meterSize}</title>
<style>
  @media print {
    body { margin:0; padding:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .page-break { page-break-before:always; }
  }
  body { font-family:Arial,"Helvetica Neue",sans-serif; font-size:10px; color:#444; line-height:1.5; }
  table { border-collapse:collapse; width:100%; }
  h1 { font-size:16px; color:#333; letter-spacing:0.5px; margin:0; }
  h2 { font-size:12px; color:#333; letter-spacing:0.3px; margin:14px 0 6px; padding-bottom:3px; border-bottom:2px solid #d0d0d0; }
</style>
</head>
<body style="background:#e8e8e8; padding:12px;">

<div style="max-width:900px; margin:0 auto; background:#fff; padding:24px; border-radius:1px; box-shadow:0 1px 4px rgba(0,0,0,0.12);">

<!-- ═══ HEADER WITH FLOWTECH LOGO ═══════════════════════════════ -->
<table style="width:100%; border-collapse:collapse; margin-bottom:12px;">
  <tr>
    <td style="vertical-align:middle; width:200px;">
      <img src="${FLOWTECH_LOGO_B64}" style="max-height:50px; max-width:200px; width:auto; height:auto; object-fit:contain;" alt="Flowtech Logo" onerror="this.style.display='none';this.nextElementSibling.style.display='block';">
      <div style="display:none; font-size:20px; font-weight:bold; color:#c41e3a; letter-spacing:2px;">FLOWTECH</div>
      <div style="font-size:8px; color:#888; letter-spacing:1.5px; margin-top:1px;">MEASURING INSTRUMENTS PVT. LTD.</div>
    </td>
    <td style="text-align:right; vertical-align:middle;">
      <div style="font-size:7px; color:#999; line-height:1.5;">
        900/2/B, GIDC, Makarpura, Vadodara - 390010, Gujarat, India<br>
        Phone: +91-265-2640466 | ISO 9001:2015 Certified<br>
        www.flowtech-instruments.com | info@flowtechmipl.com
      </div>
    </td>
  </tr>
</table>

<!-- ═══ TITLE BANNER ════════════════════════════════════════════ -->
<table style="width:100%; border-collapse:collapse; border:1px solid #999; margin-bottom:12px; background:#d0d0d0;">
  <tr>
    <td style="padding:10px 16px; text-align:center;">
      <h1>FLOW METER SIZING CALCULATION REPORT</h1>
      <div style="font-size:8px; color:#666; margin-top:3px;">Per ISO 5168:2005 / IEC 60534 — Measurement Uncertainty in Fluid Flow</div>
    </td>
  </tr>
</table>

<!-- ═══ PROJECT INFO ════════════════════════════════════════════ -->
<table style="width:100%; border-collapse:collapse; border:1px solid #bbb; margin-bottom:12px;">
  <tr style="background:#e8e8e8;">
    <td colspan="4" style="padding:5px 10px; font-size:9px; font-weight:bold; color:#333;">PROJECT INFORMATION</td>
  </tr>
  <tr>
    <td style="padding:4px 10px; border:1px solid #ddd; width:18%; font-size:8px; color:#666; background:#fafafa;">Project</td>
    <td style="padding:4px 10px; border:1px solid #ddd; width:32%; font-size:8px; color:#333; font-weight:600;">${data.projectName}</td>
    <td style="padding:4px 10px; border:1px solid #ddd; width:18%; font-size:8px; color:#666; background:#fafafa;">SO Reference</td>
    <td style="padding:4px 10px; border:1px solid #ddd; width:32%; font-size:8px; color:#333;">${data.soRef}</td>
  </tr>
  <tr>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Client</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333; font-weight:600;">${data.clientName}</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Date</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333;">${data.date}</td>
  </tr>
  <tr>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Prepared By</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333;">${data.preparedBy}</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Doc No</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333;">FT-SR-${Date.now().toString().slice(-6)}</td>
  </tr>
</table>

<!-- ═══ SIZING STATUS ═══════════════════════════════════════════ -->
<table style="width:100%; border-collapse:collapse; border:2px solid ${statusColor}; margin-bottom:12px; background:${statusColor}08;">
  <tr>
    <td style="padding:8px 12px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <div style="width:12px; height:12px; border-radius:50%; background:${statusColor}; flex-shrink:0;"></div>
        <div>
          <div style="font-size:11px; font-weight:bold; color:${statusColor};">SIZING STATUS: ${statusLabel}</div>
          <div style="font-size:8px; color:#666; margin-top:1px;">${data.sizingNotes.join(" | ")}</div>
        </div>
      </div>
    </td>
  </tr>
</table>

<!-- ═══ 1. APPLICATION DATA ═════════════════════════════════════ -->
<h2>1. APPLICATION DATA</h2>
<table style="width:100%; border-collapse:collapse; border:1px solid #bbb; margin-bottom:12px;">
  <tr style="background:#e8e8e8;">
    <td colspan="4" style="padding:4px 10px; font-size:8px; font-weight:bold; color:#333;">PROCESS CONDITIONS</td>
  </tr>
  <tr>
    <td style="padding:4px 10px; border:1px solid #ddd; width:25%; font-size:8px; color:#666; background:#fafafa;">Service</td>
    <td style="padding:4px 10px; border:1px solid #ddd; width:25%; font-size:8px; color:#333; font-weight:600;">${data.service.toUpperCase()}</td>
    <td style="padding:4px 10px; border:1px solid #ddd; width:25%; font-size:8px; color:#666; background:#fafafa;">Fluid Name</td>
    <td style="padding:4px 10px; border:1px solid #ddd; width:25%; font-size:8px; color:#333; font-weight:600;">${data.fluidName}</td>
  </tr>
  <tr>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Operating Temperature</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333; font-weight:600;">${data.operatingTemp} °C</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Operating Pressure</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333; font-weight:600;">${data.operatingPressure.toFixed(3)} bar abs</td>
  </tr>
  <tr>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Fluid Density</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333; font-weight:600;">${data.fluidDensity.toFixed(2)} kg/m³</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Fluid Viscosity</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333; font-weight:600;">${data.fluidViscosity.toFixed(3)} cP</td>
  </tr>
  <tr>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Pipe Size</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333; font-weight:600;">${(data as any).soSpecifiedSize || data.pipeSizeNominal}</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Specific Gravity</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333; font-weight:600;">${(data.fluidDensity / 1000).toFixed(4)}</td>
  </tr>
</table>

<table style="width:100%; border-collapse:collapse; border:1px solid #bbb; margin-bottom:12px;">
  <tr style="background:#e8e8e8;">
    <td colspan="4" style="padding:4px 10px; font-size:8px; font-weight:bold; color:#333;">FLOW CONDITIONS</td>
  </tr>
  <tr>
    <td style="padding:4px 10px; border:1px solid #ddd; width:25%; font-size:8px; color:#666; background:#fafafa;">Qmin</td>
    <td style="padding:4px 10px; border:1px solid #ddd; width:25%; font-size:8px; color:#333; font-weight:600;">${data.qMin.toFixed(2)} ${data.flowUnit}</td>
    <td style="padding:4px 10px; border:1px solid #ddd; width:25%; font-size:8px; color:#666; background:#fafafa;">Qmax</td>
    <td style="padding:4px 10px; border:1px solid #ddd; width:25%; font-size:8px; color:#333; font-weight:600;">${data.qMax.toFixed(2)} ${data.flowUnit}</td>
  </tr>
  <tr>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Qnormal</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#1a73e8; font-weight:700;">${data.qNormal.toFixed(2)} ${data.flowUnit}</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Turndown Ratio</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333; font-weight:600;">${data.turndownRatio.toFixed(1)}:1</td>
  </tr>
  <tr>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Velocity @ Qmin</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333; font-weight:600;">${data.velocityMin.toFixed(3)} m/s</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Velocity @ Qmax</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333; font-weight:600;">${data.velocityMax.toFixed(3)} m/s</td>
  </tr>
  <tr>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Velocity @ Qnorm</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#1a73e8; font-weight:700;">${data.velocityNormal.toFixed(3)} m/s</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Reynolds @ Qmax</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333; font-weight:600;">${data.reynoldsMax > 0 ? data.reynoldsMax.toExponential(2) : "N/A"}</td>
  </tr>
</table>

<!-- ═══ 2. SELECTED FLOW METER ══════════════════════════════════ -->
<h2>2. SELECTED FLOW METER</h2>
<table style="width:100%; border-collapse:collapse; border:1px solid #999; margin-bottom:10px; background:#f8f8f8;">
  <tr>
    <td style="padding:10px 14px;">
      <div style="font-size:13px; font-weight:bold; color:#333;">${data.meterName}</div>
      <div style="font-size:9px; color:#666; margin-top:2px;">Model: ${data.meterModel} &nbsp;|&nbsp; Size: <b>${data.meterSize}</b> &nbsp;|&nbsp; Accuracy: <b>${data.meterAccuracy}</b> &nbsp;|&nbsp; Repeatability: ${data.meterRepeatability}</div>
    </td>
  </tr>
</table>

<table style="width:100%; border-collapse:collapse; border:1px solid #bbb; margin-bottom:12px;">
  <tr style="background:#e8e8e8;">
    <td colspan="4" style="padding:4px 10px; font-size:8px; font-weight:bold; color:#333;">METER FLOW RANGE</td>
  </tr>
  <tr>
    <td style="padding:4px 10px; border:1px solid #ddd; width:25%; font-size:8px; color:#666; background:#fafafa;">Meter Qmin</td>
    <td style="padding:4px 10px; border:1px solid #ddd; width:25%; font-size:8px; color:#333; font-weight:600;">${data.qMinMeter.toFixed(2)} ${data.flowUnit}</td>
    <td style="padding:4px 10px; border:1px solid #ddd; width:25%; font-size:8px; color:#666; background:#fafafa;">Meter Qmax</td>
    <td style="padding:4px 10px; border:1px solid #ddd; width:25%; font-size:8px; color:#333; font-weight:600;">${data.qMaxMeter.toFixed(2)} ${data.flowUnit}</td>
  </tr>
  <tr>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Pressure Drop @ Qmax</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333; font-weight:600;">${data.pressureDropAtQmax.toFixed(4)} ${data.pressureDropUnit}</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#666; background:#fafafa;">Turndown Available</td>
    <td style="padding:4px 10px; border:1px solid #ddd; font-size:8px; color:#333; font-weight:600;">${(data.qMaxMeter / Math.max(data.qMinMeter, 0.001)).toFixed(0)}:1</td>
  </tr>
</table>

<!-- ═══ 3. SIZING VERIFICATION ══════════════════════════════════ -->
<h2>3. SIZING VERIFICATION</h2>
<table style="width:100%; border-collapse:collapse; border:1px solid #bbb; margin-bottom:12px;">
  <thead style="background:#e8e8e8;">
    <tr>
      <th style="padding:4px 8px; font-size:8px; font-weight:bold; color:#333; text-align:left;">CHECK</th>
      <th style="padding:4px 8px; font-size:8px; font-weight:bold; color:#333;">REQUIREMENT</th>
      <th style="padding:4px 8px; font-size:8px; font-weight:bold; color:#333;">ACTUAL</th>
      <th style="padding:4px 8px; font-size:8px; font-weight:bold; color:#333;">STATUS</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;">Qmax ≤ Meter Qmax</td><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;color:#666;">≤ ${data.qMaxMeter.toFixed(1)}</td><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;font-weight:600;">${data.qMax.toFixed(2)}</td><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;color:${data.qMax <= data.qMaxMeter ? '#1e8e3e' : '#c5221f'};font-weight:bold;">${data.qMax <= data.qMaxMeter ? '✓ PASS' : '✗ FAIL'}</td></tr>
    <tr><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;">Qmin ≥ Meter Qmin</td><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;color:#666;">≥ ${data.qMinMeter.toFixed(1)}</td><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;font-weight:600;">${data.qMin.toFixed(2)}</td><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;color:${data.qMin >= data.qMinMeter ? '#1e8e3e' : '#c5221f'};font-weight:bold;">${data.qMin >= data.qMinMeter ? '✓ PASS' : '✗ FAIL'}</td></tr>
    <tr><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;">Velocity @ Qmax</td><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;color:#666;">≤ ${data.service === 'gas' ? 60 : 10} m/s</td><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;font-weight:600;">${data.velocityMax.toFixed(3)} m/s</td><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;color:${data.velocityMax <= (data.service === 'gas' ? 60 : 10) ? '#1e8e3e' : '#c5221f'};font-weight:bold;">${data.velocityMax <= (data.service === 'gas' ? 60 : 10) ? '✓ PASS' : '✗ FAIL'}</td></tr>
    <tr><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;">Turndown Ratio</td><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;color:#666;">≥ 5:1</td><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;font-weight:600;">${data.turndownRatio.toFixed(1)}:1</td><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;color:${data.turndownRatio >= 5 ? '#1e8e3e' : '#f9a825'};font-weight:bold;">${data.turndownRatio >= 5 ? '✓ PASS' : '⚠ LOW'}</td></tr>
    <tr><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;">Reynolds (liquid)</td><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;color:#666;">≥ 4000</td><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;font-weight:600;">${data.reynoldsMax > 0 ? data.reynoldsMax.toExponential(2) : 'N/A'}</td><td style="padding:4px 8px;border:1px solid #ddd;font-size:8px;color:${data.reynoldsMax >= 4000 || data.reynoldsMax === 0 ? '#1e8e3e' : '#f9a825'};font-weight:bold;">${data.reynoldsMax >= 4000 || data.reynoldsMax === 0 ? '✓ PASS' : '⚠ CHECK'}</td></tr>
  </tbody>
</table>

<!-- ═══ 4. FLOW RANGE CHART ═════════════════════════════════════ -->
<h2>4. FLOW RANGE ANALYSIS</h2>
<div style="margin-bottom:12px; border:1px solid #ddd; padding:6px; background:#fafafa;">${charts.flowRange}</div>

<!-- ═══ 5. MEASUREMENT UNCERTAINTY (ISO 5168) ══════════════════ -->
<h2>5. MEASUREMENT UNCERTAINTY ANALYSIS — ISO 5168 / GUM</h2>

<!-- Uncertainty Summary Box -->
<table style="width:100%; border-collapse:collapse; border:1px solid #999; margin-bottom:10px; background:#f8f9fa;">
  <tr>
    <td style="padding:8px 12px; text-align:center;">
      <div style="font-size:11px; color:#333; font-weight:bold;">Measurement Uncertainty @ Normal Flow (${data.qNormal.toFixed(2)} ${data.flowUnit})</div>
      <div style="margin-top:4px;">
        <span style="font-size:9px; color:#555;">Combined u<sub>c</sub> = <b style="color:#333;">${data.combinedUncertainty.toFixed(4)}%</b></span>
        <span style="font-size:9px; color:#999;"> &nbsp;|&nbsp; </span>
        <span style="font-size:9px; color:#c5221f; font-weight:bold;">Expanded U (k=2, 95%) = ${data.expandedUncertainty.toFixed(4)}%</span>
        <span style="font-size:9px; color:#999;"> &nbsp;|&nbsp; </span>
        <span style="font-size:9px; color:#555;">Coverage Factor k = 2.00</span>
      </div>
    </td>
  </tr>
</table>

<!-- Uncertainty vs Flow Rate Chart -->
<div style="margin-bottom:12px; border:1px solid #ddd; padding:6px; background:#fafafa;">${charts.uncertainty}</div>

<!-- Uncertainty Budget Bar Chart -->
<div style="margin-bottom:12px; border:1px solid #ddd; padding:6px; background:#fafafa;">${charts.budget}</div>

<!-- Uncertainty Budget Table -->
<table style="width:100%; border-collapse:collapse; border:1px solid #bbb; margin-bottom:12px; font-size:8px;">
  <thead style="background:#e8e8e8;">
    <tr>
      <th style="padding:4px 6px; font-size:7px; font-weight:bold; color:#333;">Sym</th>
      <th style="padding:4px 6px; font-size:7px; font-weight:bold; color:#333;">Uncertainty Source</th>
      <th style="padding:4px 6px; font-size:7px; font-weight:bold; color:#333; text-align:center;">Type</th>
      <th style="padding:4px 6px; font-size:7px; font-weight:bold; color:#333; text-align:center;">Stated</th>
      <th style="padding:4px 6px; font-size:7px; font-weight:bold; color:#333; text-align:center;">Distribution</th>
      <th style="padding:4px 6px; font-size:7px; font-weight:bold; color:#333; text-align:center;">Divisor</th>
      <th style="padding:4px 6px; font-size:7px; font-weight:bold; color:#333; text-align:right;">u<sub>i</sub> (%)</th>
      <th style="padding:4px 6px; font-size:7px; font-weight:bold; color:#333; text-align:center;">c<sub>i</sub></th>
      <th style="padding:4px 6px; font-size:7px; font-weight:bold; color:#333; text-align:right;">(c<sub>i</sub>·u<sub>i</sub>)²</th>
    </tr>
  </thead>
  <tbody>${budgetRows}</tbody>
</table>

<div style="font-size:7px; color:#888; margin-bottom:12px; line-height:1.4;">
  <b>Methodology:</b> Uncertainty evaluation per ISO/IEC Guide 98-3 (GUM) and ISO 5168:2005. Type A uncertainties evaluated by statistical methods (divisor = k = 2 for 95% confidence). Type B uncertainties evaluated by non-statistical methods — rectangular distribution assumed (divisor = √3 ≈ 1.732). Combined standard uncertainty: u<sub>c</sub> = √Σ(c<sub>i</sub>·u<sub>i</sub>)². Expanded uncertainty: U = k·u<sub>c</sub> with coverage factor k = 2 for approximately 95% confidence level (normal distribution assumed).
</div>

<div class="page-break"></div>

<!-- ═══ 6. PRESSURE DROP ANALYSIS ═══════════════════════════════ -->
<h2>6. PRESSURE DROP ANALYSIS</h2>
<div style="margin-bottom:12px; border:1px solid #ddd; padding:6px; background:#fafafa;">${charts.pressureDrop}</div>

<!-- ═══ 7. VELOCITY PROFILE ═════════════════════════════════════ -->
<h2>7. VELOCITY PROFILE</h2>
<div style="margin-bottom:12px; border:1px solid #ddd; padding:6px; background:#fafafa;">${charts.velocity}</div>

<!-- ═══ 8. SIZING NOTES ═════════════════════════════════════════ -->
<h2>8. SIZING NOTES & RECOMMENDATIONS</h2>
<table style="width:100%; border-collapse:collapse; border:1px solid #bbb; margin-bottom:12px;">
  ${data.sizingNotes.map((note, i) => `<tr><td style="padding:3px 10px;border:1px solid #ddd;width:4%;font-size:8px;color:#666;text-align:center;background:#fafafa;">${i+1}</td><td style="padding:3px 10px;border:1px solid #ddd;font-size:8px;color:#444;">${note}</td></tr>`).join('')}
</table>

<!-- ═══ SIGN-OFF ════════════════════════════════════════════════ -->
<table style="width:100%; border-collapse:collapse; border:1px solid #999;">
  <tr style="background:#e8e8e8;">
    <td style="padding:5px 10px; font-size:7px; font-weight:bold; color:#333; width:25%;">Prepared By</td>
    <td style="padding:5px 10px; font-size:8px; color:#333; width:25%;">_______________________</td>
    <td style="padding:5px 10px; font-size:7px; font-weight:bold; color:#333; width:25%;">Checked By</td>
    <td style="padding:5px 10px; font-size:8px; color:#333; width:25%;">_______________________</td>
  </tr>
  <tr>
    <td style="padding:5px 10px; font-size:7px; color:#333; font-weight:bold;">Approved By</td>
    <td style="padding:5px 10px; font-size:8px; color:#333;">_______________________</td>
    <td style="padding:5px 10px; font-size:7px; color:#333; font-weight:bold;">Date</td>
    <td style="padding:5px 10px; font-size:8px; color:#333;">_______________________</td>
  </tr>
</table>

<div style="margin-top:8px; font-size:6px; color:#aaa; text-align:center; line-height:1.5;">
  <b>Flowtech Measuring Instruments Pvt. Ltd.</b> | 900/2/B, GIDC, Makarpura, Vadodara - 390010, Gujarat, India<br>
  ISO 9001:2015 Certified | <b>Engineered for Reliability</b><br>
  This report is generated by the Flowtech AI Sizing Tool for quotation purposes. For final sizing confirmation,<br>
  consult Flowtech engineering with complete P&ID and process data sheets. All calculations per ISO 5168:2005.
</div>

</div>
</body>
</html>`;
}
