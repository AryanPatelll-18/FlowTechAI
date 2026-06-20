// ============================================================
// SO SIZING BRIDGE — Phase 1 & 2
// Missing data detection + Enhanced sizing calculations
// Velocity, Reynolds number, pressure drop, turndown analysis
// ============================================================

import {
  ALL_PRODUCTS,
  ROTAMETER_PRODUCTS,
  type ProductData,
  type SizeData,
} from "./factoryTables";
import type { ExtractedProcessData } from "./smartParser";
import { renderSizingReportHtml } from "./sizingReportRenderer";
import { PIPE_DIMENSIONS } from "./pipeDimensions";

// ─── Product type → factory product mapping ──────────────────
const TYPE_TO_PRODUCT: Record<string, ProductData> = {};
for (const p of ALL_PRODUCTS) TYPE_TO_PRODUCT[p.name.toLowerCase()] = p;
function registerAlias(alias: string, product: ProductData) {
  TYPE_TO_PRODUCT[alias.toLowerCase()] = product;
}

const EMF = ALL_PRODUCTS.find((p) => p.name === "Electromagnetic Flowmeter");
const TURBINE = ALL_PRODUCTS.find((p) => p.name === "Turbine Flowmeter");
const VORTEX_L = ALL_PRODUCTS.find((p) => p.name === "Vortex Flowmeter (Liquid)");
const OVAL = ALL_PRODUCTS.find((p) => p.name === "Oval Gear Flowmeter");
const ULTRA = ALL_PRODUCTS.find((p) => p.name === "Ultrasonic Flowmeter");
const GLASS_TUBE = ROTAMETER_PRODUCTS[0];
const METAL_TUBE = ALL_PRODUCTS.find((p) => p.name === "Metal Tube Rotameter") || ROTAMETER_PRODUCTS[0];

if (EMF) { registerAlias("Electromagnetic Flow Meter", EMF); registerAlias("Electromagnetic Flowmeter", EMF); }
if (TURBINE) { registerAlias("Turbine Flow Meter", TURBINE); registerAlias("Turbine Flowmeter", TURBINE); }
if (VORTEX_L) { registerAlias("Vortex Flowmeter", VORTEX_L); registerAlias("Vortex Flow Meter", VORTEX_L); }
if (OVAL) { registerAlias("Oval Gear Flow Meter", OVAL); registerAlias("Digital Oval Gear Flow Meter", OVAL); registerAlias("Oval Gear Flowmeter", OVAL); }
if (ULTRA) { registerAlias("Ultrasonic Flow Meter", ULTRA); registerAlias("Ultrasonic Flowmeter", ULTRA); }
if (GLASS_TUBE) { registerAlias("Glass Tube Rotameter", GLASS_TUBE); registerAlias("Glass Tube Rotameters", GLASS_TUBE); }
if (METAL_TUBE) registerAlias("Metal Tube Rotameter", METAL_TUBE);
if (GLASS_TUBE) {
  registerAlias("By-Pass Glass Tube Rotameter", GLASS_TUBE);
  registerAlias("By-Pass Rotameter", GLASS_TUBE);
  registerAlias("Bypass Rotameter", GLASS_TUBE);
  registerAlias("By Pass Rotameter", GLASS_TUBE);
}

// ─── Standard defaults for missing data ──────────────────────
const FLUID_DEFAULTS: Record<string, { density: number; viscosity: number }> = {
  water: { density: 1000, viscosity: 1.0 },
  potable_water: { density: 1000, viscosity: 1.0 },
  distilled_water: { density: 998, viscosity: 1.0 },
  diesel: { density: 850, viscosity: 3.5 },
  oil: { density: 900, viscosity: 50 },
  crude_oil: { density: 870, viscosity: 200 },
  lpg: { density: 510, viscosity: 0.15 },
  natural_gas: { density: 0.7, viscosity: 0.011 },
  air: { density: 1.2, viscosity: 0.018 },
  steam: { density: 0.6, viscosity: 0.013 },
};

function getFluidDefaults(fluidName: string): { density: number; viscosity: number } | null {
  const key = fluidName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  for (const [name, defaults] of Object.entries(FLUID_DEFAULTS)) {
    if (key.includes(name) || name.includes(key)) return defaults;
  }
  return null;
}

// ─── Missing data field info ─────────────────────────────────
export interface MissingField {
  field: string;
  label: string;
  critical: boolean;       // true = sizing cannot proceed without
  assumedValue: string;    // what default was used
  source: "SO" | "assumed";
}

// ─── Enhanced sizing result ──────────────────────────────────
export interface SizingCheckResult {
  srNo: number;
  tagNo: string;
  instrumentType: string;
  soSize: string;
  productName: string;
  status: "optimal" | "valid" | "marginal" | "rejected" | "unknown" | "skipped" | "cannot_size";
  statusLabel: string;
  // Process data (with missing field tracking)
  soQMin: number;
  soQMax: number;
  qNormal: number;
  flowUnit: string;
  fluidName: string;
  density: number;
  viscosity: number;
  opTemp: number;
  opPressure: number;
  missingFields: MissingField[];
  hasMissingCritical: boolean;
  // Sizing calculations
  pipeIdMm: number;
  pipeAreaM2: number;
  velocityMin: number;
  velocityMax: number;
  velocityNormal: number;
  reynoldsMin: number;
  reynoldsMax: number;
  turndownRatio: number;
  meterQMin: number;
  meterQMax: number;
  pressureDrop: number;
  // Status & recommendations
  recommendedSize: string;
  sizingNotes: string[];
  hasSizeMismatch: boolean;
  warningMessage: string;
  // Report
  reportHtml?: string;
}

// ─── Helpers ─────────────────────────────────────────────────
function sizeToPipeKey(size: string): string {
  const m = size.match(/(\d+)/);
  if (!m) return "DN80";
  const num = parseInt(m[1]);
  const dnMap: Record<number, string> = {
    15: "DN15", 20: "DN20", 25: "DN25", 32: "DN32", 40: "DN40",
    50: "DN50", 65: "DN65", 80: "DN80", 100: "DN100", 125: "DN125",
    150: "DN150", 200: "DN200", 250: "DN250", 300: "DN300",
  };
  return dnMap[num] || `DN${num}`;
}

function findSizeData(product: ProductData, sizeStr: string): SizeData | null {
  let sd = product.sizes.find((s) => s.size === sizeStr);
  if (sd) return sd;
  sd = product.sizes.find((s) => s.size === sizeStr.replace(/\s/g, ""));
  if (sd) return sd;
  const numMatch = sizeStr.match(/(\d+)/);
  if (numMatch) {
    sd = product.sizes.find((s) => s.size.includes(numMatch[1]));
    if (sd) return sd;
  }
  return null;
}

export function isFlowInstrument(type: string): boolean {
  const lower = type.toLowerCase();
  return lower.includes("rotameter") || lower.includes("flow meter") ||
    lower.includes("flowmeter") || lower.includes("electromagnetic") ||
    lower.includes("turbine") || lower.includes("vortex") ||
    lower.includes("oval gear") || lower.includes("ultrasonic");
}

// ══════════════════════════════════════════════════════════════
// PHASE 1: Missing Data Detection + Phase 2: Enhanced Sizing
// ══════════════════════════════════════════════════════════════

export function runSizingCheck(params: {
  srNo: number;
  tagNo: string;
  instrumentType: string;
  soSize: string;
  processData: ExtractedProcessData;
  soNo?: string;
  clientName?: string;
  projectName?: string;
}): SizingCheckResult {
  const { srNo, tagNo, instrumentType, soSize, processData, soNo = "", clientName = "", projectName = "" } = params;
  const missingFields: MissingField[] = [];

  // ── Check for missing data ────────────────────────────────
  // CRITICAL: Flow Rate
  const hasFlowMin = processData.flowRateMin != null && processData.flowRateMin > 0;
  const hasFlowMax = processData.flowRateMax != null && processData.flowRateMax > 0;
  const hasFlowNormal = processData.flowRateNormal != null && processData.flowRateNormal > 0;

  if (!hasFlowMin && !hasFlowMax && !hasFlowNormal) {
    missingFields.push({ field: "flowRate", label: "Flow Rate (Min/Max)", critical: true, assumedValue: "—", source: "assumed" });
  } else {
    if (!hasFlowMin) missingFields.push({ field: "flowRateMin", label: "Min Flow Rate", critical: false, assumedValue: String(hasFlowNormal ? processData.flowRateNormal! * 0.1 : 0), source: "assumed" });
    if (!hasFlowMax) missingFields.push({ field: "flowRateMax", label: "Max Flow Rate", critical: false, assumedValue: String(hasFlowNormal ? processData.flowRateNormal! * 2 : 0), source: "assumed" });
  }

  // CRITICAL: Line Size
  if (!soSize || soSize === "—") {
    missingFields.push({ field: "lineSize", label: "Line Size", critical: true, assumedValue: "—", source: "assumed" });
  }

  // Fluid Name
  let fluidName = processData.fluidName || "Unknown";
  if (!processData.fluidName) {
    missingFields.push({ field: "fluidName", label: "Fluid Name", critical: false, assumedValue: "Water", source: "assumed" });
    fluidName = "Water";
  }

  // Density — check if missing and try fluid lookup
  let density = processData.fluidDensity;
  if (density == null || density <= 0) {
    const defaults = getFluidDefaults(fluidName);
    density = defaults?.density ?? 1000;
    missingFields.push({ field: "fluidDensity", label: "Fluid Density", critical: false, assumedValue: `${density} kg/m³ (${fluidName})`, source: "assumed" });
  }

  // Viscosity
  let viscosity = processData.fluidViscosity;
  if (viscosity == null || viscosity <= 0) {
    const defaults = getFluidDefaults(fluidName);
    viscosity = defaults?.viscosity ?? 1.0;
    missingFields.push({ field: "fluidViscosity", label: "Fluid Viscosity", critical: false, assumedValue: `${viscosity} cP (${fluidName})`, source: "assumed" });
  }

  // Operating Temperature
  let opTemp = processData.operatingTemp;
  if (opTemp == null) {
    opTemp = 20;
    missingFields.push({ field: "operatingTemp", label: "Operating Temperature", critical: false, assumedValue: "20°C (Ambient)", source: "assumed" });
  }

  // Operating Pressure
  let opPressure = processData.operatingPressure;
  if (opPressure == null || opPressure <= 0) {
    opPressure = 1.013; // 1 atm in bara
    missingFields.push({ field: "operatingPressure", label: "Operating Pressure", critical: false, assumedValue: "1.013 bara (Atmospheric)", source: "assumed" });
  }

  const hasMissingCritical = missingFields.some((f) => f.critical);

  // ── Extract flow data with fallbacks ──────────────────────
  const qMin = processData.flowRateMin ?? (hasFlowNormal ? processData.flowRateNormal! * 0.1 : 0);
  const qMax = processData.flowRateMax ?? processData.flowRateNormal ?? 0;
  const qNormal = processData.flowRateNormal ?? (qMin + qMax) / 2;
  const flowUnit = processData.flowUnit || "m³/hr";

  // ── Find factory product ──────────────────────────────────
  const product = TYPE_TO_PRODUCT[instrumentType.toLowerCase()];

  // Default result for non-flow or unknown
  const baseResult = (): SizingCheckResult => ({
    srNo, tagNo, instrumentType, soSize, productName: product?.name || instrumentType,
    status: "skipped", statusLabel: isFlowInstrument(instrumentType) ? "Unknown Product" : "Non-Flow",
    soQMin: qMin, soQMax: qMax, qNormal, flowUnit, fluidName, density, viscosity, opTemp, opPressure,
    missingFields, hasMissingCritical,
    pipeIdMm: 0, pipeAreaM2: 0, velocityMin: 0, velocityMax: 0, velocityNormal: 0,
    reynoldsMin: 0, reynoldsMax: 0, turndownRatio: 0, meterQMin: 0, meterQMax: 0, pressureDrop: 0,
    recommendedSize: soSize, sizingNotes: [], hasSizeMismatch: false, warningMessage: "",
  });

  if (!isFlowInstrument(instrumentType)) return baseResult();
  if (!product) {
    return { ...baseResult(), status: "unknown", statusLabel: "Unknown Product", sizingNotes: [`No factory data for "${instrumentType}"`] };
  }

  // ── Cannot size without critical data ─────────────────────
  if (hasMissingCritical || qMax <= 0) {
    const notes: string[] = [];
    if (qMax <= 0) notes.push("❌ No flow rate data — sizing impossible");
    if (!soSize || soSize === "—") notes.push("❌ No line size specified — cannot match to factory table");
    return {
      ...baseResult(), productName: product.name,
      status: "cannot_size", statusLabel: "Cannot Size",
      sizingNotes: notes,
    };
  }

  // ── Find size in factory tables ───────────────────────────
  const sizeData = findSizeData(product, soSize);
  const pipeKey = sizeToPipeKey(soSize);
  const pipe = PIPE_DIMENSIONS[pipeKey];
  const pipeIdMm = pipe ? pipe.innerDiameterMm : 80;
  const pipeAreaM2 = pipe ? pipe.crossSectionalAreaM2 : 0.00477;

  // ── Phase 2: Enhanced sizing calculations ─────────────────
  const velocityMin = pipeAreaM2 > 0 ? (qMin / 3600) / pipeAreaM2 : 0;
  const velocityMax = pipeAreaM2 > 0 ? (qMax / 3600) / pipeAreaM2 : 0;
  const velocityNormal = (velocityMin + velocityMax) / 2;
  const reynoldsMin = viscosity > 0 ? (velocityMin * (pipeIdMm / 1000) * density) / (viscosity / 1000) : 0;
  const reynoldsMax = viscosity > 0 ? (velocityMax * (pipeIdMm / 1000) * density) / (viscosity / 1000) : 0;
  const turndownRatio = qMin > 0 ? qMax / qMin : 0;

  // ── Sizing status determination ───────────────────────────
  let status: SizingCheckResult["status"] = "valid";
  const sizingNotes: string[] = [];
  let recommendedSize = soSize;
  let hasSizeMismatch = false;
  let warningMessage = "";

  const meterQMin = sizeData?.qMin ?? qMin * 0.8;
  const meterQMax = sizeData?.qMax ?? qMax * 1.2;
  const pressureDrop = sizeData?.dpMax ?? 0.001;

  if (sizeData) {
    const margin = (meterQMax - meterQMin) * 0.05;
    const minOK = qMin >= meterQMin - margin;
    const maxOK = qMax <= meterQMax + margin;
    const center = (meterQMin + meterQMax) / 2;
    const fromCenter = Math.abs(qNormal - center) / (meterQMax - meterQMin);

    // Sizing status based on flow range position
    if (minOK && maxOK && fromCenter < 0.4) {
      status = "optimal";
      sizingNotes.push(`✅ Flow ${qMin}-${qMax} ${flowUnit} optimally centered in ${soSize} range (${meterQMin}-${meterQMax} ${flowUnit})`);
    } else if (minOK && maxOK) {
      status = "valid";
      sizingNotes.push(`✓ Flow ${qMin}-${qMax} ${flowUnit} within ${soSize} range (${meterQMin}-${meterQMax} ${flowUnit})`);
    } else if (!maxOK && qMax > meterQMax) {
      status = "marginal";
      hasSizeMismatch = true;
      sizingNotes.push(`⚠️ Max flow ${qMax} ${flowUnit} EXCEEDS ${soSize} max ${meterQMax} ${flowUnit} — oversize required`);
      const rec = [...product.sizes].sort((a, b) => a.qMax - b.qMax).find((s) => s.qMax >= qMax * 1.1);
      if (rec) { recommendedSize = rec.size; warningMessage = `SO specifies ${soSize} — sizing recommends ${rec.size} for ${qMax} ${flowUnit} max flow`; }
    } else if (!minOK && qMin < meterQMin) {
      status = "marginal";
      sizingNotes.push(`⚠️ Min flow ${qMin} ${flowUnit} below ${soSize} min ${meterQMin} ${flowUnit} — low-flow accuracy risk`);
    } else {
      status = "rejected";
      sizingNotes.push(`❌ Flow ${qMin}-${qMax} ${flowUnit} outside ${soSize} range (${meterQMin}-${meterQMax} ${flowUnit})`);
    }

    // Velocity checks
    if (velocityMax > 10) { sizingNotes.push(`⚠️ Max velocity ${velocityMax.toFixed(2)} m/s is high — check for erosion/cavitation`); if (status === "optimal") status = "valid"; }
    if (velocityMin > 0 && velocityMin < 0.3) { sizingNotes.push(`⚠️ Min velocity ${velocityMin.toFixed(2)} m/s very low — potential measurement issues`); if (status === "optimal") status = "valid"; }

    // Reynolds checks
    if (reynoldsMax > 0 && reynoldsMax < 4000) { sizingNotes.push(`⚠️ Reynolds ${reynoldsMax.toFixed(0)} < 4000 — transitional flow, accuracy may degrade`); if (status === "optimal" || status === "valid") status = "marginal"; }
    if (reynoldsMin > 0 && reynoldsMin < 2300) { sizingNotes.push(`⚠️ Reynolds ${reynoldsMin.toFixed(0)} < 2300 — laminar flow, meter may not perform`); if (status !== "rejected") status = "marginal"; }

    // Turndown check
    const ratedTD = product.recommendedTurndown ?? 10;
    if (turndownRatio > ratedTD) sizingNotes.push(`⚠️ Turndown ${turndownRatio.toFixed(1)}:1 exceeds rated ${ratedTD}:1 — accuracy degrades at extremes`);

    // Temperature checks
    if (product.minTemp && opTemp < product.minTemp) { sizingNotes.push(`⚠️ Temp ${opTemp}°C below product min ${product.minTemp}°C`); if (status === "optimal" || status === "valid") status = "marginal"; }
    if (product.maxTemp && opTemp > product.maxTemp) { sizingNotes.push(`⚠️ Temp ${opTemp}°C exceeds product max ${product.maxTemp}°C`); if (status === "optimal" || status === "valid") status = "marginal"; }

    // Viscosity check
    if (product.maxViscosity && viscosity > product.maxViscosity) { sizingNotes.push(`⚠️ Viscosity ${viscosity} cP exceeds product max ${product.maxViscosity} cP`); if (status === "optimal" || status === "valid") status = "marginal"; }

    // Add missing field warnings
    for (const mf of missingFields) {
      if (mf.critical) {
        sizingNotes.push(`❌ CRITICAL MISSING: ${mf.label} — ${mf.assumedValue}`);
      } else {
        sizingNotes.push(`⚠️ ASSUMED: ${mf.label} = ${mf.assumedValue} (not in SO)`);
      }
    }
  } else {
    status = "unknown";
    sizingNotes.push(`Size "${soSize}" not found in factory tables for ${product.name}`);
  }

  // ── Status labels ─────────────────────────────────────────
  const statusLabels: Record<string, string> = {
    optimal: "✓ Optimal", valid: "✓ Valid", marginal: "⚠ Marginal",
    rejected: "✗ Rejected", unknown: "? Unknown", skipped: "— Skipped", cannot_size: "❌ Cannot Size",
  };

  // ── Generate report HTML ──────────────────────────────────
  const sizingStatusMap: Record<string, string> = {
    optimal: "optimal", valid: "valid", marginal: "marginal", rejected: "rejected", cannot_size: "rejected",
  };

  // Build uncertainty budget (simplified)
  const calibrationUnc = 0.10;
  const installationUnc = 0.20;
  const repeatabilityUnc = 0.10;
  const combinedUnc = Math.sqrt(calibrationUnc ** 2 + installationUnc ** 2 + repeatabilityUnc ** 2);
  const expandedUnc = combinedUnc * 2; // k=2, 95% confidence

  const reportData = {
    projectName: projectName || "—", clientName: clientName || "—", soRef: soNo || "—",
    date: new Date().toLocaleDateString("en-GB"), preparedBy: "Flowtech AI Sizing Tool",
    service: processData.service || "liquid", fluidName,
    fluidDensity: density, fluidViscosity: viscosity, operatingTemp: opTemp, operatingPressure: opPressure,
    pipeSizeNominal: pipeKey,
    qMin, qMax, qNormal, flowUnit,
    velocityMin, velocityMax, velocityNormal,
    reynoldsMin, reynoldsMax,
    turndownRatio,
    meterName: product.name, meterModel: "—", meterSize: soSize,
    meterAccuracy: product.accuracy ? `±${product.accuracy}% of rate` : "±0.5% of rate",
    meterRepeatability: "±0.1% of rate",
    qMinMeter: meterQMin, qMaxMeter: meterQMax,
    pressureDropAtQmax: pressureDrop, pressureDropUnit: "bar",
    sizingStatus: sizingStatusMap[status] || "valid",
    sizingNotes,
    uncertaintyBudget: [
      { source: "Calibration", type: "B" as const, uncertaintyPercent: calibrationUnc },
      { source: "Installation", type: "B" as const, uncertaintyPercent: installationUnc },
      { source: "Repeatability", type: "A" as const, uncertaintyPercent: repeatabilityUnc },
    ],
    combinedUncertainty: combinedUnc,
    expandedUncertainty: expandedUnc,
  };

  return {
    srNo, tagNo, instrumentType, soSize,
    productName: product.name,
    status,
    statusLabel: statusLabels[status] || status,
    soQMin: qMin, soQMax: qMax, qNormal, flowUnit, fluidName, density, viscosity, opTemp, opPressure,
    missingFields, hasMissingCritical,
    pipeIdMm, pipeAreaM2, velocityMin, velocityMax, velocityNormal,
    reynoldsMin, reynoldsMax, turndownRatio,
    meterQMin, meterQMax, pressureDrop,
    recommendedSize, sizingNotes, hasSizeMismatch, warningMessage,
    reportHtml: renderSizingReportHtml(reportData as any),
  };
}

// ─── Run sizing on all instruments ───────────────────────────
export function runSizingCheckAll(
  instruments: Array<{ srNo: number; tagNo: string; instrumentType: string; size: string; processData: ExtractedProcessData }>,
  soNo?: string, clientName?: string, projectName?: string,
): SizingCheckResult[] {
  return instruments.map((inst) => runSizingCheck({ srNo: inst.srNo, tagNo: inst.tagNo, instrumentType: inst.instrumentType, soSize: inst.size, processData: inst.processData, soNo, clientName, projectName }));
}

// ─── Download single report ──────────────────────────────────
export function downloadSizingReport(result: SizingCheckResult, soNo?: string) {
  if (!result.reportHtml) return;
  const blob = new Blob([result.reportHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `FT-SR-${soNo || "XXXX"}-${result.tagNo.replace(/[^a-zA-Z0-9_-]/g, "_")}.html`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Download combined report for ALL instruments ────────────
export function downloadCombinedSizingReport(
  results: SizingCheckResult[],
  soNo?: string,
  clientName?: string,
  projectName?: string,
) {
  const flowResults = results.filter((r) => r.status !== "skipped");
  const date = new Date().toLocaleDateString("en-GB");

  // Count statuses
  const counts: Record<string, number> = { optimal: 0, valid: 0, marginal: 0, rejected: 0, unknown: 0, cannot_size: 0, skipped: 0 };
  for (const r of flowResults) counts[r.status] = (counts[r.status] || 0) + 1;

  // Build summary table rows
  const tableRows = flowResults.map((r) => {
    const statusColor = r.status === "optimal" ? "#16a34a" : r.status === "valid" ? "#2563eb" : r.status === "marginal" ? "#d97706" : "#dc2626";
    const missingTag = r.missingFields.length > 0
      ? `<span style="color:#d97706;font-size:7pt;">⚠ ${r.missingFields.length} assumed</span>`
      : `<span style="color:#16a34a;font-size:7pt;">✓ Complete</span>`;
    return `<tr>
      <td style="border:1px solid #ddd;padding:4px 6px;font-size:8pt;">${r.srNo}</td>
      <td style="border:1px solid #ddd;padding:4px 6px;font-size:8pt;font-weight:600;">${r.tagNo}</td>
      <td style="border:1px solid #ddd;padding:4px 6px;font-size:8pt;">${r.instrumentType}</td>
      <td style="border:1px solid #ddd;padding:4px 6px;font-size:8pt;text-align:center;">${r.soSize}</td>
      <td style="border:1px solid #ddd;padding:4px 6px;font-size:8pt;text-align:center;color:${statusColor};font-weight:700;">${r.statusLabel}</td>
      <td style="border:1px solid #ddd;padding:4px 6px;font-size:8pt;text-align:center;">${r.soQMin > 0 ? r.soQMin + "-" + r.soQMax : "—"} ${r.flowUnit}</td>
      <td style="border:1px solid #ddd;padding:4px 6px;font-size:8pt;text-align:center;">${r.velocityMax > 0 ? r.velocityMin.toFixed(2) + "-" + r.velocityMax.toFixed(2) : "—"}</td>
      <td style="border:1px solid #ddd;padding:4px 6px;font-size:8pt;text-align:center;">${r.missingFields.length > 0 ? r.missingFields.map((f) => f.label).join(", ") : "—"}</td>
      <td style="border:1px solid #ddd;padding:4px 6px;font-size:8pt;text-align:center;">${missingTag}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Combined Sizing Report ${soNo || ""}</title>
<style>
  body{font-family:Arial,sans-serif;margin:20px;color:#333}
  h1{font-size:14pt;color:#1a1a1a;border-bottom:2px solid #dc2626;padding-bottom:8px}
  h2{font-size:11pt;color:#444;margin-top:20px}
  .summary{display:flex;gap:12px;margin:12px 0;flex-wrap:wrap}
  .summary-box{background:#f8f9fa;border:1px solid #e5e7eb;border-radius:6px;padding:8px 14px;text-align:center;min-width:80px}
  .summary-box .count{font-size:16pt;font-weight:700}
  .summary-box .label{font-size:7pt;color:#666;text-transform:uppercase}
  .optimal{color:#16a34a} .valid{color:#2563eb} .marginal{color:#d97706}
  .rejected{color:#dc2626} .cannot{color:#dc2626}
  table{border-collapse:collapse;width:100%;margin-top:8px}
  th{background:#f3f4f6;font-size:8pt;font-weight:700;padding:6px}
  .footer{margin-top:20px;padding-top:10px;border-top:1px solid #ddd;font-size:7pt;color:#666;text-align:center}
</style></head><body>
  <h1>📊 COMBINED SIZING REPORT — ${soNo || "N/A"}</h1>
  <div style="font-size:9pt;color:#666;margin-bottom:16px;">
    <strong>Client:</strong> ${clientName || "—"} | <strong>Project:</strong> ${projectName || "—"} | <strong>Date:</strong> ${date}
  </div>

  <h2>Summary</h2>
  <div class="summary">
    <div class="summary-box"><div class="count optimal">${counts.optimal}</div><div class="label">Optimal</div></div>
    <div class="summary-box"><div class="count valid">${counts.valid}</div><div class="label">Valid</div></div>
    <div class="summary-box"><div class="count marginal">${counts.marginal}</div><div class="label">Marginal</div></div>
    <div class="summary-box"><div class="count rejected">${counts.rejected + counts.cannot_size}</div><div class="label">Rejected</div></div>
    <div class="summary-box"><div class="count" style="color:#666">${flowResults.length}</div><div class="label">Total</div></div>
  </div>

  <h2>Instrument Sizing Details</h2>
  <table>
    <thead><tr>
      <th>Sr.</th><th>Tag No.</th><th>Type</th><th>Size</th><th>Status</th>
      <th>Flow Range</th><th>Velocity (m/s)</th><th>Missing Data</th><th>Data Quality</th>
    </tr></thead>
    <tbody>${tableRows}</tbody>
  </table>

  <div class="footer">
    Generated by Flowtech AI Sizing Tool | ${date}<br>
    For individual detailed reports with full calculations, download per-instrument reports from the Sizing Check panel.
  </div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `FT-SR-COMBINED-${soNo || "XXXX"}.html`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
