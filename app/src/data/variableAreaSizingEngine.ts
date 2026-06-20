/**
 * Variable Area Sizing Engine — Rotameter sizing + Water Equivalent calculation
 * 
 * This engine:
 * 1. Runs sizing on factory tables to select PG tube size
 * 2. Calculates Water Equivalent using FLOAT MOC from the SO/QTN
 * 3. Generates results and report matching the WE-B6NO format
 */

import { ROTAMETER_PRODUCTS, GLASS_TUBE_SS316 } from "./factoryTables";
import { convertFlowRate } from "./unitConversions";
import { calculateWE } from "./waterEquivalentEngine";
import type { ProcessConditions } from "../types/shared";

// ═══════════════════════════════════════════════════════════════════════════
// FLOAT MOC → FLOAT PROPERTIES
// ═══════════════════════════════════════════════════════════════════════════

export interface FloatProperties {
  material: string;
  density: number; // kg/m³
  specificGravity: number;
  displayName: string;
}

const FLOAT_MOC_MAP: Record<string, FloatProperties> = {
  "ss 316": { material: "SS 316", density: 8030, specificGravity: 8.040, displayName: "SS 316 SG 8.040 BL" },
  "ss 316l": { material: "SS 316L", density: 7980, specificGravity: 7.990, displayName: "SS 316L SG 7.990 BL" },
  "ss 304": { material: "SS 304", density: 7930, specificGravity: 7.940, displayName: "SS 304 SG 7.940 BL" },
  "ss": { material: "SS 316", density: 8030, specificGravity: 8.040, displayName: "SS 316 SG 8.040 BL" },
  "hastelloy c": { material: "Hastelloy C", density: 8890, specificGravity: 8.890, displayName: "HAST C SG 8.890 BL" },
  "hastelloy": { material: "Hastelloy C", density: 8890, specificGravity: 8.890, displayName: "HAST C SG 8.890 BL" },
  "hastalloy c": { material: "Hastelloy C", density: 8890, specificGravity: 8.890, displayName: "HAST C SG 8.890 BL" },
  "hastalloy": { material: "Hastelloy C", density: 8890, specificGravity: 8.890, displayName: "HAST C SG 8.890 BL" },
  "hast-c": { material: "Hastelloy C", density: 8890, specificGravity: 8.890, displayName: "HAST C SG 8.890 BL" },
  "titanium": { material: "Titanium", density: 4500, specificGravity: 4.500, displayName: "TITANIUM SG 4.500 BL" },
  "ti": { material: "Titanium", density: 4500, specificGravity: 4.500, displayName: "TITANIUM SG 4.500 BL" },
  "ptfe": { material: "PTFE", density: 2200, specificGravity: 2.200, displayName: "PTFE SG 2.200 BL" },
  "teflon": { material: "PTFE", density: 2200, specificGravity: 2.200, displayName: "PTFE SG 2.200 BL" },
  "pvdf": { material: "PVDF", density: 1780, specificGravity: 1.780, displayName: "PVDF SG 1.780 BL" },
  "pp": { material: "PP", density: 905, specificGravity: 0.905, displayName: "PP SG 0.905 BL" },
  "polypropylene": { material: "PP", density: 905, specificGravity: 0.905, displayName: "PP SG 0.905 BL" },
  "aluminium": { material: "Aluminium", density: 2700, specificGravity: 2.700, displayName: "ALUMINIUM SG 2.700 BL" },
  "aluminum": { material: "Aluminium", density: 2700, specificGravity: 2.700, displayName: "ALUMINIUM SG 2.700 BL" },
  "al": { material: "Aluminium", density: 2700, specificGravity: 2.700, displayName: "ALUMINIUM SG 2.700 BL" },
};

export function detectFloatMoc(productFamily: string, moc: string, floatMoc: string, specs: Record<string, string>): string {
  // Priority 1: explicit Float MOC from specs
  if (floatMoc) {
    const key = floatMoc.toLowerCase().trim();
    if (FLOAT_MOC_MAP[key]) return key;
    // Fuzzy match
    for (const [mapKey, props] of Object.entries(FLOAT_MOC_MAP)) {
      if (key.includes(mapKey) || mapKey.includes(key)) return mapKey;
    }
  }
  // Priority 2: Float MOC from specs record
  const specFloat = specs["Float MOC"] || specs["Float Moc"];
  if (specFloat) {
    const key = specFloat.toLowerCase().trim();
    for (const [mapKey] of Object.entries(FLOAT_MOC_MAP)) {
      if (key.includes(mapKey)) return mapKey;
    }
  }
  // Priority 3: Infer from general MOC
  if (moc) {
    const mocLower = moc.toLowerCase();
    for (const [mapKey] of Object.entries(FLOAT_MOC_MAP)) {
      if (mocLower.includes(mapKey)) return mapKey;
    }
  }
  // Default: SS 316
  return "ss 316";
}

export function getFloatProperties(floatMocKey: string): FloatProperties {
  return FLOAT_MOC_MAP[floatMocKey] || FLOAT_MOC_MAP["ss 316"];
}

// ═══════════════════════════════════════════════════════════════════════════
// PG TUBE SIZING
// ═══════════════════════════════════════════════════════════════════════════

export interface TubeSizeResult {
  size: string; // PG-11, PG-22, etc.
  qMin: number; // in m³/hr WE
  qMax: number; // in m³/hr WE
  scaleRangeLph: string;
  scaleRangeLpm: string;
  scaleRangeGph: string;
  scaleRangeGpm: string;
  scaleRangeM3h: string;
  median: number;
  distanceFromMedian: number;
  status: "optimal" | "valid" | "partial-low" | "partial-high" | "too-low" | "too-high";
  processConnection: string; // "15NB to 100NB"
}

const CONNECTION_RANGES: Record<string, string> = {
  "PG-11": "15NB to 100NB",
  "PG-22": "15NB to 100NB",
  "PG-33": "15NB to 150NB",
  "PG-44": "15NB to 100NB",
  "PG-55": "15NB to 100NB",
  "PG-66": "15NB to 100NB",
  "PG-77": "25NB to 150NB",
  "PG-88": "25NB to 150NB",
  "PG-99": "50NB to 200NB",
  "PG-100": "50NB to 200NB",
};

function m3hrToLph(m3hr: number): number { return m3hr * 1000; }
function m3hrToLpm(m3hr: number): number { return m3hr * 1000 / 60; }
function m3hrToGph(m3hr: number): number { return m3hr * 1000 * 0.264172; }
function m3hrToGpm(m3hr: number): number { return m3hr * 1000 * 0.264172 / 60; }

export function sizeRotameterTube(
  flowRateMin: number,
  flowRateMax: number,
  flowUnit: string,
  specificGravity: number,
  productFamily: string,
): TubeSizeResult[] {
  // Determine which product to use
  const pf = productFamily.toLowerCase();
  let product = GLASS_TUBE_SS316;
  
  // Convert flow to m³/hr WE (for water SG=1)
  // For liquid: the factory tables are calibrated for water SG=1.0
  // SG correction: actual Q = factory Q / sqrt(SG of process fluid)
  const sgCorrection = specificGravity > 0 ? 1 / Math.sqrt(specificGravity) : 1;
  
  // Convert input flow to LPH for comparison
  const unitConvMin = convertFlowRate(flowRateMin, flowUnit, "liquid", specificGravity * 1000, 1.01325, 20);
  const unitConvMax = convertFlowRate(flowRateMax, flowUnit, "liquid", specificGravity * 1000, 1.01325, 20);
  
  if (!unitConvMin.canConvert || !unitConvMax.canConvert) return [];
  
  const flowMinLph = unitConvMin.convertedValue * 1000; // m³/hr → LPH
  const flowMaxLph = unitConvMax.convertedValue * 1000;
  
  // Apply SG correction to compare against factory water-equivalent tables
  const corrMinLph = flowMinLph / sgCorrection;
  const corrMaxLph = flowMaxLph / sgCorrection;
  
  const results: TubeSizeResult[] = [];
  
  for (const sz of product.sizes) {
    const factoryMinLph = sz.qMin * 1000; // factory qMin is in m³/hr
    const factoryMaxLph = sz.qMax * 1000;
    
    const median = (factoryMinLph + factoryMaxLph) / 2;
    const processCenter = (corrMinLph + corrMaxLph) / 2;
    const distMed = Math.abs(processCenter - median) / (factoryMaxLph - factoryMinLph);
    
    let status: TubeSizeResult["status"];
    if (corrMaxLph < factoryMinLph) status = "too-low";
    else if (corrMinLph > factoryMaxLph) status = "too-high";
    else if (corrMinLph < factoryMinLph && corrMaxLph <= factoryMaxLph) status = "partial-low";
    else if (corrMaxLph > factoryMaxLph && corrMinLph >= factoryMinLph) status = "partial-high";
    else if (distMed <= 0.25) status = "optimal";
    else status = "valid";
    
    results.push({
      size: sz.size,
      qMin: factoryMinLph,
      qMax: factoryMaxLph,
      scaleRangeLph: `${Math.round(factoryMinLph)} - ${Math.round(factoryMaxLph)}`,
      scaleRangeLpm: `${Math.round(m3hrToLpm(sz.qMin))} - ${Math.round(m3hrToLpm(sz.qMax))}`,
      scaleRangeGph: `${Math.round(m3hrToGph(sz.qMin))} - ${Math.round(m3hrToGph(sz.qMax))}`,
      scaleRangeGpm: `${m3hrToGpm(sz.qMin).toFixed(1)} - ${m3hrToGpm(sz.qMax).toFixed(1)}`,
      scaleRangeM3h: `${sz.qMin.toFixed(3)} - ${sz.qMax.toFixed(3)}`,
      median,
      distanceFromMedian: distMed,
      status,
      processConnection: CONNECTION_RANGES[sz.size] || "15NB to 100NB",
    });
  }
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCALE MARKING AT 5% INCREMENTS
// ═══════════════════════════════════════════════════════════════════════════

export interface ScaleMark {
  percent: number;
  value: number; // in LPH
  displayLph: string;
  displayLpm: string;
}

export function generateScaleMarking(qMin: number, qMax: number): ScaleMark[] {
  const marks: ScaleMark[] = [];
  for (let pct = 5; pct <= 100; pct += 5) {
    const value = qMin + ((qMax - qMin) * pct) / 100;
    marks.push({
      percent: pct,
      value,
      displayLph: Math.round(value).toString(),
      displayLpm: (value / 60).toFixed(1),
    });
  }
  return marks;
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIABLE AREA SIZING REPORT — Matches WE-B6NO format
// ═══════════════════════════════════════════════════════════════════════════

export interface VariableAreaSizingInput {
  customerName: string;
  soNumber: string;
  tagNumber: string;
  productFamily: string;
  modelName: string;
  decodification: string;
  fluidName: string;
  service: "liquid" | "gas" | "steam";
  density: number;
  viscosity: number;
  operatingTemp: number;
  operatingPressure: number;
  flowRateMin: number;
  flowRateMax: number;
  flowUnit: string;
  floatMoc: string;
  specs: Record<string, string>;
  size: string; // connection size from SO
}

export interface VariableAreaResult {
  bestTube: string;
  tubeStatus: string;
  scaleRangeLph: string;
  connectionRange: string;
  soConnectionSize: string;
  connectionValid: boolean;
  weLph: number;
  weLpm: number;
  weGph: number;
  weGpm: number;
  weM3h: number;
  lsgcf: number;
  fcf: number | null;
  gcf: number;
  floatProperties: FloatProperties;
  vic: number;
  flowRegime: string;
  maxPressureDrop: string;
  reynoldsNumber: string;
  scaleMarks: ScaleMark[];
  allTubes: TubeSizeResult[];
}

export function runVariableAreaSizing(input: VariableAreaSizingInput): VariableAreaResult {
  const {
    flowRateMin, flowRateMax, flowUnit, density, viscosity,
    floatMoc, specs, size, operatingTemp,
  } = input;
  
  const specificGravity = density / 1000;
  
  // 1. Detect float properties
  const floatKey = detectFloatMoc(input.productFamily, input.specs["MOC"] || "", floatMoc, specs);
  const floatProps = getFloatProperties(floatKey);
  
  // 2. Size the tube
  const tubeResults = sizeRotameterTube(flowRateMin, flowRateMax, flowUnit, specificGravity, input.productFamily);
  
  // 3. Pick best tube (first optimal or valid)
  const bestTubeResult = tubeResults.find((t) => t.status === "optimal") ||
                         tubeResults.find((t) => t.status === "valid") ||
                         tubeResults.find((t) => t.status === "partial-low") ||
                         tubeResults[0];
  
  const bestTube = bestTubeResult?.size || "N/A";
  
  // 4. Calculate Water Equivalent using float MOC
  let weResult: { we_LPH: number; fcf?: number; correctionFactor: number } | null = null;
  try {
    const avgFlow = (flowRateMin + flowRateMax) / 2;
    // Steam rotameters are rare; treat steam like gas for WE purposes
    const serviceForWE = input.service === "steam" ? "gas" : (input.service || "liquid");
    const isGas = serviceForWE === "gas";
    weResult = calculateWE({
      service: serviceForWE as "liquid" | "gas",
      actualFlowRate: avgFlow,
      flowUnit,
      floatMaterial: floatProps.material,
      processFluidDensity: density,
      processFluidSG: specificGravity,
      processTempC: operatingTemp,
      processPressureBara: input.operatingPressure || 1.013,
      gasName: isGas ? input.fluidName : undefined,
      liquidViscosity_cP: !isGas ? viscosity : undefined,
    });
  } catch (e) {
    // WE calculation failed, use sizing-based estimate
  }
  
  const weLph = weResult?.we_LPH || bestTubeResult?.median || 0;
  const lsgcf = weResult?.correctionFactor || 1.0;
  const fcf = weResult?.fcf ?? null;
  const gcf = lsgcf;
  
  // 5. VIC (Viscosity Influence Check)
  const vic = viscosity > 0 ? (viscosity - 1.0) * 1.5 : 0;
  
  // 6. Flow Regime
  const flowRegime = viscosity > 10 ? "Laminar" : "Turbulent";
  
  // 7. Connection validation
  const connectionRange = bestTubeResult?.processConnection || "15NB to 100NB";
  const soConnectionSize = size || "--";
  const connectionValid = validateConnectionAgainstRange(soConnectionSize, connectionRange);
  
  // 8. Scale marking
  const scaleMarks = bestTubeResult ? generateScaleMarking(bestTubeResult.qMin, bestTubeResult.qMax) : [];
  
  return {
    bestTube,
    tubeStatus: bestTubeResult?.status || "no_data",
    scaleRangeLph: bestTubeResult?.scaleRangeLph || "--",
    connectionRange,
    soConnectionSize,
    connectionValid,
    weLph,
    weLpm: weLph / 60,
    weGph: weLph * 0.264172,
    weGpm: weLph * 0.264172 / 60,
    weM3h: weLph / 1000,
    lsgcf,
    fcf,
    gcf,
    floatProperties: floatProps,
    vic,
    flowRegime,
    maxPressureDrop: "2.5 bar (max)",
    reynoldsNumber: "N/A",
    scaleMarks,
    allTubes: tubeResults,
  };
}

function validateConnectionAgainstRange(soSize: string, tubeRange: string): boolean {
  const soNbMatch = soSize.match(/(\d+)/);
  if (!soNbMatch) return true; // Can't validate
  const soNb = parseInt(soNbMatch[1]);
  const rangeMatch = tubeRange.match(/(\d+)NB\s+to\s+(\d+)NB/i);
  if (!rangeMatch) return true;
  const min = parseInt(rangeMatch[1]);
  const max = parseInt(rangeMatch[2]);
  return soNb >= min && soNb <= max;
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORT RENDERER — Matches WE-B6NO format
// ═══════════════════════════════════════════════════════════════════════════

export function renderVariableAreaReportHtml(result: VariableAreaResult, input: VariableAreaSizingInput): string {
  const { floatProperties, scaleMarks } = result;
  const isGasReport = input.service === "gas";
  
  // Build tube comparison rows
  const tubeRows = result.allTubes.map((t) => {
    const isBest = t.size === result.bestTube;
    const bg = isBest ? 'background:#fff3cd;' : '';
    const statusBadge = t.status === 'optimal' ? '<span style="color:#16a34a;font-weight:700;">● OPTIMAL</span>' :
                       t.status === 'valid' ? '<span style="color:#3b82f6;">● VALID</span>' :
                       t.status === 'partial-low' ? '<span style="color:#d97706;">● PARTIAL</span>' :
                       '<span style="color:#dc2626;">● ' + t.status.toUpperCase() + '</span>';
    return `<tr style="${bg}">
      <td style="padding:4px 8px;border:1px solid #ccc;font-size:8pt;text-align:center;font-weight:${isBest?700:400};">${t.size}</td>
      <td style="padding:4px 8px;border:1px solid #ccc;font-size:8pt;text-align:center;">${t.scaleRangeLph}</td>
      <td style="padding:4px 8px;border:1px solid #ccc;font-size:8pt;text-align:center;">${t.scaleRangeLpm}</td>
      <td style="padding:4px 8px;border:1px solid #ccc;font-size:8pt;text-align:center;">${t.processConnection}</td>
      <td style="padding:4px 8px;border:1px solid #ccc;font-size:8pt;text-align:center;">${statusBadge}</td>
    </tr>`;
  }).join('');
  
  // Build scale marking rows (2 columns)
  let scaleRows = '';
  for (let i = 0; i < scaleMarks.length; i += 2) {
    const m1 = scaleMarks[i];
    const m2 = scaleMarks[i + 1];
    scaleRows += `<tr>
      <td style="padding:2px 6px;border:1px solid #ccc;font-size:7.5pt;text-align:center;background:#f0f4f8;font-weight:600;">${m1.percent}%</td>
      <td style="padding:2px 6px;border:1px solid #ccc;font-size:7.5pt;text-align:right;">${m1.displayLph}</td>
      <td style="padding:2px 6px;border:1px solid #ccc;font-size:7.5pt;text-align:right;">${m1.displayLpm}</td>
      ${m2 ? `<td style="padding:2px 6px;border:1px solid #ccc;font-size:7.5pt;text-align:center;background:#f0f4f8;font-weight:600;">${m2.percent}%</td>
      <td style="padding:2px 6px;border:1px solid #ccc;font-size:7.5pt;text-align:right;">${m2.displayLph}</td>
      <td style="padding:2px 6px;border:1px solid #ccc;font-size:7.5pt;text-align:right;">${m2.displayLpm}</td>` : '<td colspan="3"></td>'}
    </tr>`;
  }
  
  const date = new Date().toLocaleDateString('en-GB');
  
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
@page { size: A4 portrait; margin: 10mm; }
body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8.5pt; color: #222; margin: 0; padding: 10px; background: #fff; }
table { border-collapse: collapse; }
.header { text-align: center; border-bottom: 3px solid #c20017; padding-bottom: 8px; margin-bottom: 10px; }
.header h1 { font-size: 14pt; color: #1e3a5f; margin: 0; }
.header h2 { font-size: 10pt; color: #c20017; margin: 4px 0 0; }
.section-title { background: #1e3a5f; color: #fff; padding: 4px 8px; font-size: 8pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 10px; }
.info-table { width: 100%; font-size: 8pt; margin-top: 4px; }
.info-table td { padding: 3px 6px; border: 1px solid #ccc; }
.info-table .label { background: #f0f4f8; font-weight: 600; width: 25%; color: #1e3a5f; }
.info-table .value { width: 25%; }
.we-box { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8f 100%); color: #fff; padding: 12px; border-radius: 6px; text-align: center; margin: 10px 0; }
.we-box .we-value { font-size: 24pt; font-weight: 700; }
.we-box .we-unit { font-size: 10pt; opacity: 0.9; }
.float-highlight { background: #fff3cd; border: 2px solid #d97706; padding: 8px; border-radius: 4px; text-align: center; margin: 8px 0; }
.float-highlight .float-label { font-size: 7pt; color: #92400e; text-transform: uppercase; }
.float-highlight .float-value { font-size: 12pt; font-weight: 700; color: #78350f; }
.footer { text-align: center; font-size: 7pt; color: #999; margin-top: 15px; border-top: 1px solid #ddd; padding-top: 8px; }
</style></head><body>

<div class="header">
  <h1>FLOWTECH INSTRUMENTS (I) PVT. LTD.</h1>
  <h2>VARIABLE AREA FLOWMETER — SIZING & WATER EQUIVALENT REPORT</h2>
</div>

<!-- Customer & SO Info -->
<div class="section-title">Customer &amp; Project Information</div>
<table class="info-table">
  <tr><td class="label">Customer</td><td class="value">${esc(input.customerName)}</td><td class="label">SO / QTN No.</td><td class="value">${esc(input.soNumber)}</td></tr>
  <tr><td class="label">Tag Number</td><td class="value">${esc(input.tagNumber)}</td><td class="label">Date</td><td class="value">${date}</td></tr>
  <tr><td class="label">Product</td><td class="value">${esc(input.productFamily)}</td><td class="label">Model</td><td class="value">${esc(input.modelName || '--')}</td></tr>
  <tr><td class="label">De-Codification</td><td colspan="3" class="value" style="font-family:monospace;font-size:9pt;">${esc(input.decodification || '--')}</td></tr>
</table>

<!-- Water Equivalent Result -->
<div class="section-title">Water Equivalent Result</div>
<div class="we-box">
  <div class="we-value">${Math.round(result.weLph).toLocaleString()}</div>
  <div class="we-unit">LPH (Litres Per Hour)${isGasReport ? ' — GAS SERVICE' : ''}</div>
</div>
<table class="info-table">
  <tr><td class="label">WE (LPM)</td><td class="value">${result.weLpm.toFixed(1)}</td><td class="label">WE (GPH)</td><td class="value">${Math.round(result.weGph)}</td></tr>
  <tr><td class="label">WE (GPM)</td><td class="value">${result.weGpm.toFixed(2)}</td><td class="label">WE (m³/h)</td><td class="value">${result.weM3h.toFixed(3)}</td></tr>
  ${isGasReport ? `
  <tr><td class="label">FCF (Float Corr. Factor)</td><td class="value" style="font-weight:700;color:#1e3a5f;">${result.fcf?.toFixed(6) || '--'}</td><td class="label">GCF (Gas Corr. Factor)</td><td class="value" style="font-weight:700;color:#1e3a5f;">${result.gcf.toFixed(6)}</td></tr>
  ` : `
  <tr><td class="label">LSGCF</td><td class="value">${result.lsgcf.toFixed(6)}</td><td class="label">GCF</td><td class="value">${result.gcf.toFixed(6)}</td></tr>
  `}
</table>

<!-- FLOAT MOC — HIGHLIGHTED -->
<div class="float-highlight">
  <div class="float-label">Float Material of Construction (FROM SALES ORDER)</div>
  <div class="float-value">${esc(floatProperties.displayName)}</div>
  <div style="font-size:8pt;color:#78350f;margin-top:4px;">Float Density: ${floatProperties.density} kg/m³ &nbsp;|&nbsp; Float SG: ${floatProperties.specificGravity.toFixed(3)}</div>
</div>

<!-- PG Tube & Scale Range -->
<div class="section-title">Recommended PG Tube &amp; Scale Range</div>
<table class="info-table">
  <tr><td class="label">PG Tube Size</td><td class="value" style="font-size:12pt;font-weight:700;color:#16a34a;">${result.bestTube}</td><td class="label">Tube Status</td><td class="value">${result.tubeStatus.toUpperCase()}</td></tr>
  <tr><td class="label">Scale Range (LPH)</td><td class="value" style="font-weight:600;">${result.scaleRangeLph}</td><td class="label">Scale Range (LPM)</td><td class="value">${result.allTubes.find(t=>t.size===result.bestTube)?.scaleRangeLpm || '--'}</td></tr>
  <tr><td class="label">Applicable Connections</td><td class="value" style="font-weight:600;color:#1e3a5f;">${result.connectionRange}</td><td class="label">SO Connection</td><td class="value" style="color:${result.connectionValid?'#16a34a':'#dc2626'};font-weight:600;">${esc(result.soConnectionSize)} ${result.connectionValid ? '✓ VALID' : '✗ INVALID'}</td></tr>
</table>

<!-- Process Conditions -->
<div class="section-title">Process Conditions — ${(input.service || 'LIQUID').toUpperCase()} SERVICE</div>
<table class="info-table">
  <tr><td class="label">Fluid</td><td class="value">${esc(input.fluidName)}</td><td class="label">Density</td><td class="value">${input.density} kg/m³ (SG ${(input.density/1000).toFixed(3)})</td></tr>
  <tr><td class="label">Viscosity</td><td class="value">${input.viscosity} cP</td><td class="label">Temperature</td><td class="value">${input.operatingTemp} °C</td></tr>
  <tr><td class="label">Pressure</td><td class="value">${input.operatingPressure} bar ${isGasReport ? '<span style="color:#c20017;font-weight:600;">abs</span>' : ''}</td><td class="label">Flow Range</td><td class="value">${input.flowRateMin} - ${input.flowRateMax} ${input.flowUnit}</td></tr>
  ${isGasReport ? `
  <tr><td class="label" style="color:#c20017;">FCF (Float Corr. Factor)</td><td class="value" style="font-weight:700;color:#c20017;">${result.fcf?.toFixed(6) || '--'}</td><td class="label" style="color:#c20017;">GCF (Gas Corr. Factor)</td><td class="value" style="font-weight:700;color:#c20017;">${result.gcf.toFixed(6)}</td></tr>
  ` : `
  <tr><td class="label">VIC</td><td class="value">${result.vic.toFixed(2)}%</td><td class="label">Flow Regime</td><td class="value">${result.flowRegime}</td></tr>
  `}
</table>

<!-- All Tube Comparison -->
<div class="section-title">All PG Tube Comparison</div>
<table class="info-table" style="margin-bottom:10px;">
  <tr style="background:#1e3a5f;color:#fff;"><td style="padding:4px 8px;font-weight:700;">Tube</td><td style="padding:4px 8px;font-weight:700;">Scale Range (LPH)</td><td style="padding:4px 8px;font-weight:700;">Scale Range (LPM)</td><td style="padding:4px 8px;font-weight:700;">Connections</td><td style="padding:4px 8px;font-weight:700;">Status</td></tr>
  ${tubeRows}
</table>

<!-- Variable Scale Marking -->
<div class="section-title">Variable Scale Marking (5% Increments) — ${result.bestTube}</div>
<table class="info-table" style="font-size:7.5pt;">
  <tr style="background:#1e3a5f;color:#fff;"><td style="padding:3px 6px;">%</td><td style="padding:3px 6px;">LPH</td><td style="padding:3px 6px;">LPM</td><td style="padding:3px 6px;">%</td><td style="padding:3px 6px;">LPH</td><td style="padding:3px 6px;">LPM</td></tr>
  ${scaleRows}
</table>

<div class="footer">
  <strong>Flowtech Instruments (I) Pvt. Ltd.</strong> — Variable Area Sizing &amp; Water Equivalent Report<br>
  This report is generated based on process conditions provided. Verify all parameters before manufacturing.<br>
  Generated: ${date}
</div>

</body></html>`;
}

function esc(t: string): string { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
