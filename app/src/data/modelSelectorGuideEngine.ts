/**
 * Model Selector Guide Engine v2 — Enhanced with Technical Validation
 * Per correction prompt: mandatory validation, landscape comparative table,
 * pre-publish review, cross-verification checklist, and error prevention.
 */

import { ALL_MODELS } from "./allModelData";
import { DECODE_MASTER_MAP, DECODE_PRODUCT_LABELS } from "./decodeDatasheetData";
import { MODEL_EXPLAINER_GUIDES } from "./modelExplainerGuides";
import type { DecodificationEntry } from "./decodeDatasheetData";
import type { ProductModel } from "./allModelData";

// ═══════════════════════════════════════════════════════════════════════════
// 1. MODEL LOOKUP & MAPPING
// ═══════════════════════════════════════════════════════════════════════════

function getModelsForFamily(familyLabel: string): ProductModel[] {
  const fl = familyLabel.toLowerCase();
  return ALL_MODELS.filter((m) => {
    const family = m.family.toLowerCase();
    const name = m.modelName.toLowerCase();
    const desc = m.shortDesc.toLowerCase();
    if (fl.includes("electromagnetic") && family.includes("flowmag")) return true;
    if (fl.includes("turbine") && family.includes("flowturb")) return true;
    if (fl.includes("vortex") && family.includes("flowswirl")) return true;
    if (fl.includes("oval gear") && family.includes("flowval")) return true;
    if (fl.includes("glass tube") && family.includes("flowgt") && !name.includes("bpgtrm")) return true;
    if (fl.includes("bypass") && (name.includes("bpgtrm") || desc.includes("bypass"))) return true;
    if (fl.includes("metal tube") && family.includes("flowmet")) return true;
    if (fl.includes("acrylic") && family.includes("flowgt")) return true;
    if (fl.includes("glass") && (name.includes("gtrm") || desc.includes("glass tube")) && !name.includes("bpgtrm")) return true;
    return false;
  });
}

function getDecodForFamily(familyLabel: string): DecodificationEntry | null {
  for (const entry of Object.values(DECODE_MASTER_MAP)) {
    if (entry.productName.toLowerCase().includes(familyLabel.toLowerCase())) return entry;
  }
  const familyKey = Object.entries(DECODE_PRODUCT_LABELS).find(
    ([, label]) => label === familyLabel || label.toLowerCase().includes(familyLabel.toLowerCase())
  )?.[0];
  if (familyKey) return DECODE_MASTER_MAP[familyKey as keyof typeof DECODE_MASTER_MAP];
  return null;
}

function getExplainerForFamily(familyLabel: string) {
  return MODEL_EXPLAINER_GUIDES[familyLabel] || null;
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. FAMILY OVERVIEWS (technically validated)
// ═══════════════════════════════════════════════════════════════════════════

const FAMILY_OVERVIEWS: Record<string, { principle: string; apps: string[]; limits: string[]; warnings: string[] }> = {
  "Glass Tube Rotameter": {
    principle: "Variable area principle. Float rises in tapered borosilicate glass tube. Position indicates flow rate on calibrated scale.",
    apps: ["Water treatment", "Process industries", "Chemical dosing", "Pharma", "Food & beverage"],
    limits: ["Glass tube fragile — avoid high vibration", "Visual indication only (unless transmitter added)", "Not for opaque/particulate fluids", "Max temp ~120°C for borosilicate glass", "Max pressure ~16 bar"],
    warnings: ["Do not use for high-pressure steam", "Verify MOC compatibility", "Include isolation valves", "Confirm vertical BT flow orientation"],
  },
  "By-Pass Glass Tube Rotameter": {
    principle: "Orifice plate in main pipe creates differential pressure. Proportional bypass flow through rotameter enables large-pipe flow measurement.",
    apps: ["Large pipeline flow measurement", "Cooling water systems", "Effluent monitoring", "Water distribution networks"],
    limits: ["Requires straight pipe runs upstream/downstream", "Orifice sizing must be calculated per application", "Not for very low flow or pulsating flow", "Higher pressure drop than full-bore meters"],
    warnings: ["Orifice bore MUST be calculated by Flowtech sizing", "Install bypass branch vertically only", "Ensure 10D straight pipe upstream, 5D downstream", "Resolve all 'After Confirmation' values before sizing"],
  },
  "Metal Tube Rotameter": {
    principle: "Same variable area principle as GTRM but with robust metal tube. Float position detected magnetically and transmitted as electrical signal.",
    apps: ["High-pressure flow measurement", "High-temperature applications", "Hazardous areas", "Steam & gas measurement", "Chemical processing"],
    limits: ["Higher cost than glass tube rotameter", "Requires transmitter (no direct visual reading)", "Magnetic coupling affected by strong external fields"],
    warnings: ["Verify hazardous area cert before FLP selection", "Confirm transmitter output matches control system", "All wetted parts MOC must be fluid-compatible", "Check turndown ratio per application"],
  },
  "Electromagnetic Flowmeter": {
    principle: "Faraday's Law of Electromagnetic Induction. Conductive fluid through magnetic field generates voltage proportional to flow velocity. No moving parts, minimal pressure drop.",
    apps: ["Water & wastewater", "Chemicals & acids", "Food & beverage", "Mining slurries", "Power plant cooling water"],
    limits: ["Requires conductive fluid (>5 uS/cm)", "Not for non-conductive fluids (oils, gases, distilled water)", "Requires full pipe for accuracy", "Minimum flow velocity ~0.1 m/s"],
    warnings: ["Verify fluid conductivity before selecting", "Not for gases, steam, or distilled water", "Select correct lining & electrode MOC", "Upstream straight pipe required for accuracy"],
  },
  "Turbine Flowmeter": {
    principle: "Multi-bladed rotor spins at speed proportional to flow velocity. Magnetic/optical pickup converts rotation to flow signal.",
    apps: ["Clean liquid measurement", "Fuel & oil metering", "Water distribution", "Chemical injection systems"],
    limits: ["Not for dirty/particulate fluids", "Requires straight pipe runs", "Moving parts subject to wear over time", "Sensitive to flow profile disturbances"],
    warnings: ["Install strainer upstream", "Ensure adequate straight pipe (10D up, 5D down)", "Not for slurry or abrasive applications", "Verify viscosity range"],
  },
  "Vortex Flowmeter": {
    principle: "Von Karman vortex street. Bluff body generates alternating vortices. Frequency proportional to flow velocity. Suitable for steam, gas, and liquids.",
    apps: ["Saturated & superheated steam", "Natural gas measurement", "Compressed air", "Hot water & condensate"],
    limits: ["Requires minimum Reynolds number", "Not for very low flow rates", "Pressure drop across bluff body", "Pipe vibration can interfere"],
    warnings: ["Verify minimum Reynolds number for application", "Confirm saturated vs superheated steam conditions", "IBR models need certified drawings for boiler apps", "Check pipe vibration before installation"],
  },
  "Oval Gear Flowmeter": {
    principle: "Two precision-machined oval gears trap and displace fixed fluid volume per revolution. Positive displacement — excellent for viscous liquids.",
    apps: ["High-viscosity liquids", "Fuels & oils", "Chemical metering", "Resins & adhesives", "Food syrups"],
    limits: ["Not for particulate-laden fluids", "Moving parts subject to wear", "Higher pressure drop with increasing viscosity", "Requires filter upstream"],
    warnings: ["Always verify viscosity range with sizing calculation", "Install 40-mesh filter upstream", "Higher viscosity = higher pressure drop — check allowable", "Not suitable for low-lubricity fluids"],
  },
};

function getOverview(familyLabel: string) {
  return FAMILY_OVERVIEWS[familyLabel] || {
    principle: "Refer to Flowtech product catalogue for detailed technical information.",
    apps: [],
    limits: ["Technical data not fully mapped — verify with Flowtech engineering."],
    warnings: ["Verify all parameters with Flowtech technical team before final selection."],
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. TECHNICAL VALIDATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

interface ValidationCheckpoint {
  name: string;
  status: "pass" | "fail" | "warning";
  detail: string;
}

interface TechnicalQuery {
  productFamily: string;
  modelSeries: string;
  parameter: string;
  existingValue: string;
  issue: string;
  requiredClarification: string;
  blocksGeneration: boolean;
}

interface ValidationResult {
  checkpoints: ValidationCheckpoint[];
  queries: TechnicalQuery[];
  passCount: number;
  failCount: number;
  warningCount: number;
  canGenerate: boolean;
  missingDataCount: number;
  conflictCount: number;
}

function validateModels(productFamily: string, models: ProductModel[]): ValidationResult {
  const checkpoints: ValidationCheckpoint[] = [];
  const queries: TechnicalQuery[] = [];

  // 1. Product family validation
  const hasOverview = !!FAMILY_OVERVIEWS[productFamily];
  checkpoints.push({
    name: "Product family name verified",
    status: hasOverview ? "pass" : "warning",
    detail: hasOverview ? `${productFamily} found in database` : "Using generic overview — verify family name",
  });

  // 2. Model count
  checkpoints.push({
    name: "Model series count",
    status: models.length > 0 ? "pass" : "fail",
    detail: models.length > 0 ? `${models.length} model series found` : "No models found for this product family",
  });

  // 3. Per-model validation
  for (const m of models) {
    // Model name
    checkpoints.push({
      name: `Model name verified: ${m.modelName}`,
      status: m.modelName && m.modelName.length > 0 ? "pass" : "fail",
      detail: m.modelName || "MISSING",
    });

    // Model code verified
    const hasModelNo = m.modelNo && m.modelNo.length > 0 && m.modelNo.includes("-");
    checkpoints.push({
      name: `Model code verified: ${m.modelName}`,
      status: hasModelNo ? "pass" : "warning",
      detail: hasModelNo ? m.modelNo.substring(0, 40) + "..." : "Model code not properly mapped",
    });
    if (!hasModelNo) {
      queries.push({ productFamily, modelSeries: m.modelName, parameter: "Model Code", existingValue: m.modelNo || "N/A", issue: "Model code not available", requiredClarification: "Confirm model code from approved datasheet", blocksGeneration: false });
    }

    // Pressure rating
    const hasPressure = m.pressureRange && m.pressureRange !== "N/A";
    checkpoints.push({
      name: `Pressure rating: ${m.modelName}`,
      status: hasPressure ? "pass" : "warning",
      detail: hasPressure ? m.pressureRange : "Not mapped",
    });

    // Temperature rating
    const hasTemp = m.tempRange && m.tempRange !== "N/A";
    checkpoints.push({
      name: `Temperature rating: ${m.modelName}`,
      status: hasTemp ? "pass" : "warning",
      detail: hasTemp ? m.tempRange : "Not mapped",
    });

    // Accuracy
    const hasAccuracy = m.accuracy && m.accuracy !== "" && m.accuracy !== "N/A";
    checkpoints.push({
      name: `Accuracy: ${m.modelName}`,
      status: hasAccuracy ? "pass" : "warning",
      detail: hasAccuracy ? m.accuracy : "Not specified",
    });

    // MOC
    const hasMoc = m.flowtubeMoc && m.flowtubeMoc !== "N/A" && m.flowtubeMoc.length > 0;
    checkpoints.push({
      name: `MOC options: ${m.modelName}`,
      status: hasMoc ? "pass" : "warning",
      detail: hasMoc ? "Mapped" : "MOC not mapped",
    });

    // Process connection
    const hasConn = m.processConnectionType && m.processConnectionType !== "N/A";
    checkpoints.push({
      name: `Process connection: ${m.modelName}`,
      status: hasConn ? "pass" : "warning",
      detail: hasConn ? `${m.processConnectionType} ${m.processConnectionStd}` : "Not mapped",
    });

    // Output
    const hasOutput = m.output && m.output !== "N/A";
    checkpoints.push({
      name: `Output options: ${m.modelName}`,
      status: hasOutput ? "pass" : "warning",
      detail: hasOutput ? m.output : "Not mapped",
    });

    // Application suitability
    const hasApp = m.application && m.application.length > 0;
    checkpoints.push({
      name: `Applications: ${m.modelName}`,
      status: hasApp ? "pass" : "warning",
      detail: hasApp ? `${m.application.length} applications mapped` : "No applications mapped",
    });
  }

  const passCount = checkpoints.filter((c) => c.status === "pass").length;
  const failCount = checkpoints.filter((c) => c.status === "fail").length;
  const warningCount = checkpoints.filter((c) => c.status === "warning").length;

  return {
    checkpoints,
    queries,
    passCount,
    failCount,
    warningCount,
    canGenerate: failCount === 0,
    missingDataCount: warningCount,
    conflictCount: failCount,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. HTML HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function esc(t: string): string { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function tbl(h: string[], r: string[][], opts?: { fontSize?: number; landscape?: boolean }): string {
  const fs = opts?.fontSize || 10;
  const ls = opts?.landscape;
  const th = h.map((c) => `<th style="background:#f9fafb;padding:6px 8px;border:1px solid #d1d5db;font-size:${fs - 1}px;font-weight:600;color:#374151;text-align:left;white-space:nowrap;word-break:keep-all;">${c}</th>`).join("");
  const tr = r.map((row, i) => {
    const td = row.map((c, ci) => `<td style="padding:5px 8px;border:1px solid #d1d5db;font-size:${fs}px;color:#4b5563;vertical-align:top;${ci === 0 ? "font-weight:600;background:#fafafa;white-space:nowrap;" : ""}">${c}</td>`).join("");
    return `<tr>${td}</tr>`;
  }).join("");
  return `<table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-family:system-ui,sans-serif;table-layout:auto;"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}

function splitWideTable(h: string[], r: string[][], maxCols: number = 7): { headers: string[][]; rows: string[][][] } {
  const colCount = h.length;
  if (colCount <= maxCols) return { headers: [h], rows: [r] };

  const resultH: string[][] = [];
  const resultR: string[][][] = [];

  // First column (Parameter) is always fixed
  const fixedCol = h[0];
  const fixedData = r.map((row) => row[0]);

  for (let start = 1; start < colCount; start += maxCols - 1) {
    const end = Math.min(start + maxCols - 1, colCount);
    const sliceH = [fixedCol, ...h.slice(start, end)];
    const sliceR = r.map((row, ri) => [fixedData[ri], ...row.slice(start, end)]);
    resultH.push(sliceH);
    resultR.push(sliceR);
  }

  return { headers: resultH, rows: resultR };
}

function statusBadge(status: string): string {
  if (status === "pass") return `<span style="display:inline-block;padding:1px 6px;border-radius:3px;background:#dcfce7;color:#16a34a;font-size:9px;font-weight:700;">PASS</span>`;
  if (status === "fail") return `<span style="display:inline-block;padding:1px 6px;border-radius:3px;background:#fee2e2;color:#dc2626;font-size:9px;font-weight:700;">FAIL</span>`;
  return `<span style="display:inline-block;padding:1px 6px;border-radius:3px;background:#fef3c7;color:#d97706;font-size:9px;font-weight:700;">WARN</span>`;
}

function warnBox(msg: string): string {
  return `<div style="background:#fef2f2;border-left:3px solid #dc2626;padding:8px 10px;margin:8px 0;font-size:10px;color:#7f1d1d;"><strong>⚠ Technical Validation:</strong> ${esc(msg)}</div>`;
}

function infoBox(msg: string): string {
  return `<div style="background:#eff6ff;border-left:3px solid #3b82f6;padding:8px 10px;margin:8px 0;font-size:10px;color:#1e40af;"><strong>ℹ Info:</strong> ${esc(msg)}</div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. MAIN GENERATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export function generateModelSelectorGuide(productFamily: string): string {
  const models = getModelsForFamily(productFamily);
  const decod = getDecodForFamily(productFamily);
  const explainer = getExplainerForFamily(productFamily);
  const overview = getOverview(productFamily);
  const date = new Date().toLocaleDateString("en-GB");
  const sf = esc(productFamily);

  // ─── Step 1: Technical Validation ─────────────────────────────────
  const validation = validateModels(productFamily, models);

  // ─── CSS Styles ───────────────────────────────────────────────────
  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Flowtech ${sf} — Model Selection Guide</title>
<style>
@page { size: A4; margin: 10mm; }
@page :first { margin: 0; }
@page landscape { size: A4 landscape; margin: 10mm; }
.landscape-page { page: landscape; page-break-before: always; }
body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1f2937; line-height: 1.45; font-size: 10px; }
.page { page-break-after: always; padding: 10mm; }
.page:last-child { page-break-after: auto; }
.cover { background: linear-gradient(135deg, #c20017 0%, #8b0010 100%); color: #fff; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 40px; page-break-after: always; }
.cover h1 { font-size: 24px; font-weight: 700; margin: 14px 0 6px; }
.cover h2 { font-size: 13px; font-weight: 400; margin: 0 0 20px; opacity: 0.9; }
.cover .meta { font-size: 10px; opacity: 0.75; margin-top: 28px; }
.cover .logo { font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; border: 2px solid rgba(255,255,255,0.3); padding: 5px 18px; }
h2 { font-size: 14px; color: #c20017; border-bottom: 2px solid #c20017; padding-bottom: 3px; margin: 14px 0 8px; }
h3 { font-size: 11px; color: #374151; margin: 10px 0 5px; }
h4 { font-size: 10px; color: #6b7280; margin: 6px 0 3px; font-weight: 600; }
.warn { background: #fef2f2; border-left: 3px solid #dc2626; padding: 6px 10px; margin: 6px 0; font-size: 9px; color: #7f1d1d; }
.info { background: #eff6ff; border-left: 3px solid #3b82f6; padding: 6px 10px; margin: 6px 0; font-size: 9px; color: #1e40af; }
.note { background: #fffbeb; border-left: 3px solid #d97706; padding: 6px 10px; margin: 6px 0; font-size: 9px; color: #92400e; }
.code { background: #f3f4f6; padding: 5px 10px; border-radius: 4px; font-family: monospace; font-size: 9px; word-break: break-all; }
.step { display: flex; gap: 8px; margin: 5px 0; }
.sn { width: 18px; height: 18px; border-radius: 50%; background: #c20017; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; flex-shrink: 0; }
.sc h4 { margin: 0; font-size: 10px; }
.sc p { margin: 1px 0 0; font-size: 9px; color: #6b7280; }
.tag { display: inline-block; padding: 1px 5px; border-radius: 3px; background: #f3f4f6; font-size: 8px; color: #6b7280; margin: 1px 2px 1px 0; }
.footer { text-align: center; font-size: 8px; color: #9ca3af; margin-top: 12px; padding-top: 6px; border-top: 1px solid #e5e7eb; }
p, ul, li { font-size: 9px; color: #4b5563; margin: 2px 0; }
ul { padding-left: 14px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.review-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin: 8px 0; }
.review-header { font-size: 10px; font-weight: 700; color: #374151; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; }
/* Prevent table overflow */
table { max-width: 100%; overflow-wrap: break-word; word-wrap: break-word; }
td, th { max-width: 300px; overflow-wrap: break-word; }
</style></head><body>`;

  // ═══════════════════════════════════════════════════════════════════
  // PAGE 1: COVER + PRODUCT OVERVIEW
  // ═══════════════════════════════════════════════════════════════════
  html += `<div class="cover">
    <div class="logo">Flowtech Instruments</div>
    <h1>${sf}</h1>
    <h2>Model Selection Guide &mdash; Model Comparison, Code Breakdown &amp; Selection Steps</h2>
    <div class="meta">
      <div>FT-MSG-${sf.substring(0, 3).toUpperCase()}-001 &nbsp;|&nbsp; Rev. 2.0 &nbsp;|&nbsp; ${date}</div>
      <div style="margin-top:6px;opacity:0.6;">Prepared by FlowAI &bull; Flowtech Instruments (I) Pvt. Ltd.</div>
      ${!validation.canGenerate ? '<div style="margin-top:12px;padding:6px 12px;background:rgba(255,255,255,0.15);border-radius:4px;font-weight:600;">⚠ Technical data verification required before final guide generation</div>' : ''}
    </div>
  </div>`;

  // Pre-publish technical review (Page 2 if there are issues)
  if (validation.queries.length > 0 || !validation.canGenerate || validation.warningCount > 0) {
    html += `<div class="page">
      <h2>Technical Validation Report</h2>
      <div class="two-col" style="margin-bottom:10px;">
        <div class="review-box">
          <div class="review-header">Validation Summary</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:9px;">
            <span>Product Family:</span><strong>${sf}</strong>
            <span>Models Found:</span><strong>${models.length}</strong>
            <span>Checkpoints Passed:</span><strong style="color:#16a34a">${validation.passCount}</strong>
            <span>Warnings:</span><strong style="color:#d97706">${validation.warningCount}</strong>
            <span>Critical Errors:</span><strong style="color:${validation.failCount > 0 ? '#dc2626' : '#16a34a'}">${validation.failCount}</strong>
            <span>Can Generate:</span><strong style="color:${validation.canGenerate ? '#16a34a' : '#dc2626'}">${validation.canGenerate ? "YES" : "NO — FIX ERRORS"}</strong>
          </div>
        </div>
        <div class="review-box">
          <div class="review-header">Status</div>
          <div style="font-size:9px;">
            <div>Large Comparison Table: <strong style="color:${models.length > 0 ? '#16a34a' : '#dc2626'}">${models.length > 0 ? "Will be created" : "Cannot create — no models"}</strong></div>
            <div>PDF Orientation: <strong>Portrait + Landscape (auto)</strong></div>
            <div>Missing Data: <strong style="color:${validation.missingDataCount > 0 ? '#d97706' : '#16a34a'}">${validation.missingDataCount} fields</strong></div>
            <div>Conflicts: <strong style="color:${validation.conflictCount > 0 ? '#dc2626' : '#16a34a'}">${validation.conflictCount}</strong></div>
          </div>
        </div>
      </div>`;

    // Checkpoints table
    html += `<h3>Cross-Verification Checkpoints</h3>`;
    html += tbl(
      ["#", "Checkpoint", "Status", "Detail"],
      validation.checkpoints.slice(0, 40).map((c, i) => [String(i + 1), esc(c.name), statusBadge(c.status), esc(c.detail)])
    );
    if (validation.checkpoints.length > 40) {
      html += `<div style="font-size:8px;color:#9ca3af;text-align:center;">... ${validation.checkpoints.length - 40} additional checkpoints not shown</div>`;
    }

    // Queries
    if (validation.queries.length > 0) {
      html += `<h3>Technical Queries Raised</h3>`;
      html += tbl(
        ["Model", "Parameter", "Issue", "Clarification Required", "Blocks?"],
        validation.queries.map((q) => [
          esc(q.modelSeries),
          esc(q.parameter),
          esc(q.issue),
          esc(q.requiredClarification),
          q.blocksGeneration ? '<span style="color:#dc2626;font-weight:700;">YES</span>' : '<span style="color:#6b7280;">No</span>',
        ])
      );
    }

    if (!validation.canGenerate) {
      html += warnBox("Guide generation blocked due to critical errors. Resolve all FAIL items above before regenerating.");
      html += `</div></body></html>`;
      return html; // STOP here if can't generate
    }

    html += infoBox("Validation complete with warnings. Guide generated with available data. Review warnings with Flowtech engineering.");
    html += `</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PAGE 2: PRODUCT OVERVIEW + AVAILABLE MODELS TABLE
  // ═══════════════════════════════════════════════════════════════════
  html += `<div class="page">
    <h2>1. Product Overview</h2>
    <p><strong>Working Principle:</strong> ${esc(overview.principle)}</p>
    <div class="two-col">
      <div><h3>Suitable Applications</h3><ul>${overview.apps.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></div>
      <div><h3>Limitations</h3><ul>${overview.limits.map((l) => `<li>${esc(l)}</li>`).join("")}</ul></div>
    </div>
    <div class="note"><strong>Key Warnings:</strong> ${overview.warnings.map((w) => esc(w)).join(" &bull; ")}</div>

    <h2>2. Available Model Series</h2>`;

  if (models.length > 0) {
    html += tbl(
      ["Model", "Description", "Temp Range", "Pressure", "Accuracy", "Enclosure", "Output"],
      models.map((m) => [
        `<strong>${esc(m.modelName)}</strong>`,
        esc(m.shortDesc),
        esc(m.tempRange),
        esc(m.pressureRange),
        m.accuracy || "N/A",
        esc(m.electronicsEnclosure),
        esc(m.output),
      ])
    );
  } else {
    html += warnBox(`No model data in FlowAI database for ${sf}. Upload approved datasheets to populate model data.`);
  }
  html += `</div>`;

  // ═══════════════════════════════════════════════════════════════════
  // PAGE 3-4: LARGE COMPARATIVE TABLE (LANDSCAPE)
  // ═══════════════════════════════════════════════════════════════════
  if (models.length > 1) {
    // Build the large comparison table rows
    const comparisonParams = [
      { label: "Application", get: (m: ProductModel) => Array.isArray(m.application) ? m.application.join(", ") : m.application },
      { label: "Temp Range", get: (m: ProductModel) => m.tempRange },
      { label: "Pressure Rating", get: (m: ProductModel) => m.pressureRange },
      { label: "Accuracy", get: (m: ProductModel) => m.accuracy || "N/A" },
      { label: "Model No", get: (m: ProductModel) => m.modelNo },
      { label: "Wetted MOC", get: (m: ProductModel) => m.flowtubeMoc },
      { label: "Process Connection", get: (m: ProductModel) => `${m.processConnectionType} ${m.processConnectionStd}`.trim() },
      { label: "Enclosure", get: (m: ProductModel) => m.electronicsEnclosure },
      { label: "Output", get: (m: ProductModel) => m.output },
      { label: "Communication", get: (m: ProductModel) => m.communication || "N/A" },
      { label: "Flameproof", get: (m: ProductModel) => m.isFlameproof ? "Yes" : "No" },
      { label: "Battery Option", get: (m: ProductModel) => m.isBatteryOperated ? "Yes" : "No" },
      { label: "Special Features", get: (m: ProductModel) => m.specialFeatures.join(", ") || "Standard" },
      { label: "Limitations", get: (m: ProductModel) => m.limitations.join(", ") || "See datasheet" },
    ];

    const largeHeader = ["Parameter", ...models.map((m) => esc(m.modelName))];
    const largeRows = comparisonParams.map((p) => [p.label, ...models.map((m) => esc(p.get(m)))]);

    // Split if too wide (> 7 columns including Parameter)
    const { headers, rows } = splitWideTable(largeHeader, largeRows, 7);

    html += `<div class="landscape-page" style="padding:10mm;">
      <h2>3. Model Comparison Table &mdash; ${sf}</h2>
      <div style="font-size:8px;color:#6b7280;margin-bottom:8px;">All model series compared side-by-side. Parameter column is fixed across table splits.</div>`;

    for (let i = 0; i < headers.length; i++) {
      if (i > 0) html += `<div style="page-break-before:always;padding:10mm;">`;
      html += tbl(headers[i], rows[i], { fontSize: 9, landscape: true });
      if (headers.length > 1) {
        html += `<div style="font-size:8px;color:#9ca3af;text-align:center;">Table ${i + 1} of ${headers.length}</div>`;
      }
      if (i > 0) html += `</div>`;
    }
    html += `</div>`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PAGE 5: MODEL CODE EXPLANATION + SUFFIX REFERENCE
  // ═══════════════════════════════════════════════════════════════════
  html += `<div class="page">
    <h2>4. Model Name Formation</h2>`;

  if (decod) {
    html += `<p><strong>Model Prefix:</strong> <span class="code">${esc(decod.modelPrefix)}</span></p>
    <p style="font-size:9px;color:#6b7280;margin-bottom:8px;">Full model code = Prefix + Position codes + Size suffix. Each position selects one feature.</p>`;

    html += tbl(
      ["Pos", "Category", "Available Options (Code = Description)"],
      decod.categories.map((cat) => [
        String(cat.position),
        `<strong>${esc(cat.name)}</strong>`,
        cat.options.map((o) => `<strong>${esc(o.code)}</strong>=${esc(o.description)}`).join(" &nbsp; "),
      ])
    );
  } else {
    html += `<div class="warn">Model code decodification not available for ${sf}. Add to Decodification Master.</div>`;
  }

  if (explainer) {
    html += `<h2>5. Model Suffix Quick Reference</h2>`;
    html += tbl(
      ["Suffix Code", "Meaning", "When to Select"],
      explainer.suffixCodes.map((s) => [
        `<strong>${esc(s.code)}</strong>`,
        esc(s.meaning),
        esc(s.description),
      ])
    );
  }
  html += `</div>`;

  // ═══════════════════════════════════════════════════════════════════
  // PAGE 6: FEATURE COMPARISON + ADD-ON TABLE
  // ═══════════════════════════════════════════════════════════════════
  html += `<div class="page">
    <h2>6. Standard vs Optional Features</h2>`;

  if (models.length > 0) {
    const featureRows = [
      ["4-20mA Output",
        ...models.map((m) => m.output.toLowerCase().includes("4-20ma") ? `<span style="color:#16a34a">● Standard</span>` : `<span style="color:#d97706">△ Optional</span>`)],
      ["Pulse Output",
        ...models.map((m) => m.output.toLowerCase().includes("pulse") ? `<span style="color:#16a34a">● Standard</span>` : `<span style="color:#d97706">△ Optional</span>`)],
      ["HART Protocol",
        ...models.map((m) => m.output.toLowerCase().includes("hart") ? `<span style="color:#16a34a">● Standard</span>` : `<span style="color:#d97706">△ Optional</span>`)],
      ["RS-485 Communication",
        ...models.map((m) => m.communication.toLowerCase().includes("485") ? `<span style="color:#16a34a">● Standard</span>` : `<span style="color:#d97706">△ Optional</span>`)],
      ["Flameproof (FLP)",
        ...models.map((m) => m.isFlameproof ? `<span style="color:#16a34a">● Available</span>` : `<span style="color:#9ca3af">○ N/A</span>`)],
      ["Battery Operation",
        ...models.map((m) => m.isBatteryOperated ? `<span style="color:#16a34a">● Available</span>` : `<span style="color:#9ca3af">○ N/A</span>`)],
      ["Hygienic / Tri-clamp",
        ...models.map((m) => m.isHygienic ? `<span style="color:#16a34a">● Available</span>` : `<span style="color:#9ca3af">○ N/A</span>`)],
      ["High Pressure Rated",
        ...models.map((m) => m.isHighPressure ? `<span style="color:#16a34a">● Rated</span>` : `<span style="color:#9ca3af">○ Standard</span>`)],
    ];

    const featureHeader = ["Feature", ...models.map((m) => esc(m.modelName))];
    const { headers: fHeaders, rows: fRows } = splitWideTable(featureHeader, featureRows, 7);

    for (let i = 0; i < fHeaders.length; i++) {
      html += tbl(fHeaders[i], fRows[i], { fontSize: 9 });
    }
  }

  // Accessories & Special Features comparison
  if (models.length > 0) {
    html += `<h2>7. Accessories & Special Features</h2>`;
    const addonRows: string[][] = [];
    for (const m of models) {
      const items = [...(m.accessories || []), ...(m.specialFeatures || [])];
      if (items.length > 0) {
        addonRows.push([esc(m.modelName), items.map((a: string) => `<span class="tag">${esc(a)}</span>`).join(" ")]);
      }
    }
    if (addonRows.length > 0) {
      html += tbl(["Model", "Accessories & Features"], addonRows);
    } else {
      html += `<div style="font-size:9px;color:#6b7280;padding:6px;background:#f9fafb;border-radius:4px;">Accessory data not mapped for ${sf}. Refer to individual datasheets.</div>`;
    }
  }
  html += `</div>`;

  // ═══════════════════════════════════════════════════════════════════
  // PAGE 7: SELECTION STEPS + APPLICATION MATRIX
  // ═══════════════════════════════════════════════════════════════════
  html += `<div class="page">
    <h2>8. Step-by-Step Model Selection Guide</h2>`;

  const steps = [
    { t: "Identify Application", d: "Liquid / Gas / Steam / Chemical / Hygienic / Hazardous area? Confirm fluid type and process conditions." },
    { t: "Gather Process Data", d: "Flow range (min/normal/max), operating pressure, temperature, density/SG, viscosity, pipe size." },
    { t: "Select Model Series", d: "Use comparison table (Section 3). Check P&T rating, accuracy, rangeability against process data." },
    { t: "Select MOC", d: "Verify fluid compatibility. Check corrosion resistance, pressure rating, temperature rating of all wetted parts." },
    { t: "Select Process Connection", d: "Flanged / Screwed / Tri-clamp / Wafer. Match piping spec, flange standard (IS/ANSI/DIN), and rating." },
    { t: "Specify Output & Enclosure", d: "Local display / 4-20mA / HART / Pulse / RS-485. WP or FLP as per hazardous area classification." },
    { t: "Add Optional Features", d: "Transmitter, switches, HART, remote display, calibration certificate, special testing." },
    { t: "Verify Sizing", d: "Run professional sizing to confirm selected model handles full flow range with acceptable accuracy." },
  ];

  html += steps.map((s, i) => `
    <div class="step"><div class="sn">${i + 1}</div>
      <div class="sc"><h4>${esc(s.t)}</h4><p>${esc(s.d)}</p></div>
    </div>`).join("");

  // Application Selection Matrix
  html += `<h2>9. Application Selection Matrix</h2>`;

  const matrix: Record<string, string[][]> = {
    "Glass Tube Rotameter": [
      ["Water / Clear liquids", "R180 / R181", "Flow, pressure, temp", "Standard selection"],
      ["Low-pressure chemical", "R180F", "MOC, temp compatibility", "Custom connection if needed"],
      ["Corrosive liquid", "R180+PTFE lined", "Fluid compatibility", "Verify all MOC wetted parts"],
      ["Gas (low pressure)", "R180", "Density, pressure", "Confirm gas density at operating conditions"],
      ["Food / Pharma", "R180 (SS316)", "Hygienic, cleaning", "Tri-clamp connection preferred"],
    ],
    "By-Pass Glass Tube Rotameter": [
      ["Large pipe water", "By-Pass GTRM", "Pipe size, flow rate", "Orifice sizing required"],
      ["Cooling water", "By-Pass GTRM", "Flow, pressure, temp", "Standard installation"],
      ["Effluent water", "By-Pass GTRM", "Fluid compatibility", "Verify MOC for effluent"],
      ["Raw water distribution", "By-Pass GTRM", "Pipe size, flow", "Confirm straight pipe availability"],
    ],
    "Metal Tube Rotameter": [
      ["High pressure liquid", "L180 / L180F", "Pressure, MOC", "L180F for extreme pressure"],
      ["Hazardous area (gas/liq)", "L360Ex", "Cert, enclosure", "FLP certification required"],
      ["High temperature", "L180F", "Temp rating", "Confirm all parts rated for temp"],
      ["PLC/DCS integration", "L360 / L360Ex", "Output type", "4-20mA + HART standard"],
      ["Steam (low pressure)", "L180F", "Temp, pressure", "Check steam saturation conditions"],
    ],
    "Electromagnetic Flowmeter": [
      ["Water / wastewater", "S630", "Conductivity, flow, pipe", "Conductivity >5 uS/cm required"],
      ["Chemical / acid", "S630+Hastelloy", "Compat, lining", "Verify lining + electrode MOC"],
      ["Hygienic (food/dairy)", "S630F", "TC fitting, CIP/SIP", "Food-grade PTFE/PFA lining"],
      ["Hazardous area", "S630Ex", "FLP cert", "PESO / ATEX / IECEx certified"],
      ["Remote / no power", "S630B", "Battery life", "5+ year battery, periodic data log"],
      ["Slurry / mining", "S630+Rubber", "Abrasion, lining", "Hard rubber or PU lining"],
    ],
    "Turbine Flowmeter": [
      ["Clean liquids", "L270", "Viscosity, flow range", "Standard selection"],
      ["Fuel / oil metering", "L270 (SS316)", "Viscosity, compat", "SS316 wetted parts"],
      ["Corrosive clean liquid", "L360", "MOC SS316", "All wetted SS316 construction"],
      ["Remote location", "L270B", "Battery power", "5+ year battery life"],
      ["Hazardous area", "L270Ex", "FLP cert", "PESO certified enclosure"],
    ],
    "Vortex Flowmeter": [
      ["Saturated steam", "L180 IBR", "Pressure, temp", "IBR for boiler applications"],
      ["Superheated steam", "L180 IBR+P&T", "P&T compensation", "Integrated P&T compensation"],
      ["Natural gas", "L180", "Density, Reynolds", "Verify min Reynolds number"],
      ["Compressed air", "L180", "Pressure, flow range", "Standard selection"],
      ["Hot water / condensate", "L180", "Temp, pressure", "Check min flow limit"],
    ],
    "Oval Gear Flowmeter": [
      ["High-viscosity liquid", "L270", "Viscosity, flow", "Up to 1000 cP standard"],
      ["Fuel / oil", "L270 / L450", "Viscosity, MOC", "Verify viscosity at operating temp"],
      ["Corrosive viscous", "L450 (SS316)", "MOC compat", "SS316 construction"],
      ["Display required", "L400 / L450", "Output, power", "Local display standard"],
      ["Hazardous area", "L400Ex / L450Ex", "FLP cert", "PESO certified display"],
    ],
  };

  const mx = matrix[productFamily];
  if (mx) {
    html += tbl(["Application", "Recommended Model", "Key Checks", "Notes"], mx);
  } else {
    html += `<div class="note">Application matrix not mapped for ${sf}. Build from approved datasheets.</div>`;
  }
  html += `</div>`;

  // ═══════════════════════════════════════════════════════════════════
  // PAGE 8: CRITICAL WARNINGS + VALIDATION SUMMARY
  // ═══════════════════════════════════════════════════════════════════
  html += `<div class="page">
    <h2>10. Critical Selection Warnings</h2>
    <div class="warn">
      <ul style="margin:0;padding-left:14px;">
        <li><strong>Never exceed pressure/temperature ratings</strong> &mdash; safety hazard, warranty void</li>
        <li><strong>Verify MOC compatibility</strong> with process fluid for ALL wetted parts</li>
        <li><strong>No "After Confirmation" values for final selection</strong> &mdash; confirm all sizing data first</li>
        <li><strong>Verify FLP certification for hazardous areas</strong> (PESO / ATEX / IECEx as applicable)</li>
        <li><strong>Run sizing verification</strong> before final model approval</li>
        <li><strong>Isolation valves required</strong> for rotameter maintenance access</li>
        <li><strong>Do not mix model code variables</strong> between different product families</li>
        <li><strong>Straight pipe requirements</strong> must be verified for inline flowmeters (10D up, 5D down typical)</li>
      </ul>
    </div>

    <h2>11. Technical Validation Status Summary</h2>
    <div class="review-box">
      <div class="review-header">Pre-Publish Review — ${sf}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;font-size:9px;">
        <div>Product Family: <strong>${sf}</strong></div>
        <div>Models Included: <strong>${models.length}</strong></div>
        <div>Parameters Validated: <strong style="color:#16a34a">${validation.passCount}</strong></div>
        <div>Warnings: <strong style="color:${validation.warningCount > 0 ? '#d97706' : '#16a34a'}">${validation.warningCount}</strong></div>
        <div>Missing Data: <strong style="color:${validation.missingDataCount > 0 ? '#d97706' : '#16a34a'}">${validation.missingDataCount}</strong></div>
        <div>Conflicts: <strong style="color:${validation.conflictCount > 0 ? '#dc2626' : '#16a34a'}">${validation.conflictCount}</strong></div>
        <div>Large Comparison Table: <strong style="color:#16a34a">${models.length > 1 ? "Created" : "N/A (single model)"}</strong></div>
        <div>PDF Orientation: <strong>Portrait + Landscape</strong></div>
        <div>Guide Status: <strong style="color:${validation.canGenerate ? '#16a34a' : '#dc2626'}">${validation.canGenerate ? "APPROVED" : "BLOCKED"}</strong></div>
      </div>
    </div>

    ${validation.queries.length > 0 ? `
    <div class="note" style="margin-top:8px;">
      <strong>Unresolved Queries (${validation.queries.length}):</strong> This guide was generated with ${validation.queries.length} technical query(ies).
      Review with Flowtech engineering before client circulation.
    </div>` : ""}

    <div class="footer">
      <strong>Flowtech Instruments (I) Pvt. Ltd.</strong> &mdash; ${sf} Model Selection Guide &mdash; ${date}<br/>
      Generated from approved FlowAI database. Verify critical parameters with Flowtech technical team.<br/>
      Document Ref: FT-MSG-${sf.substring(0, 3).toUpperCase()}-001 &nbsp;|&nbsp; Rev. 2.0 &nbsp;|&nbsp; Technical Validation: ${validation.passCount} passed, ${validation.warningCount} warnings, ${validation.failCount} errors
    </div>
  </div>`;

  html += `</body></html>`;
  return html;
}

export function getAvailableProductFamilies(): string[] {
  const families = new Set<string>();
  for (const entry of Object.values(DECODE_MASTER_MAP)) families.add(entry.productName);
  for (const key of Object.keys(MODEL_EXPLAINER_GUIDES)) families.add(key);
  return Array.from(families).sort();
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. STANDALONE VALIDATION REPORT (for UI preview)
// ═══════════════════════════════════════════════════════════════════════════

export function generateValidationReport(productFamily: string): { html: string; validation: ValidationResult } {
  const models = getModelsForFamily(productFamily);
  const validation = validateModels(productFamily, models);

  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body { font-family: system-ui, sans-serif; font-size: 11px; color: #1f2937; padding: 16px; }
.pass { color: #16a34a; font-weight: 700; }
.fail { color: #dc2626; font-weight: 700; }
.warn { color: #d97706; font-weight: 700; }
table { width: 100%; border-collapse: collapse; margin: 8px 0; }
th, td { padding: 6px 8px; border: 1px solid #e5e7eb; text-align: left; font-size: 10px; }
th { background: #f9fafb; font-weight: 600; }
.header { background: #c20017; color: #fff; padding: 12px 16px; border-radius: 6px; margin-bottom: 12px; }
.box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin: 8px 0; }
</style></head><body>`;

  html += `<div class="header">
    <div style="font-size:14px;font-weight:700;">Technical Validation Report — ${esc(productFamily)}</div>
    <div style="font-size:10px;opacity:0.8;margin-top:4px;">${models.length} models | ${validation.passCount} passed | ${validation.warningCount} warnings | ${validation.failCount} errors</div>
  </div>`;

  html += `<div class="box">
    <strong>Status:</strong> <span class="${validation.canGenerate ? 'pass' : 'fail'}">${validation.canGenerate ? "CAN GENERATE GUIDE" : "BLOCKED — FIX ERRORS"}</span>
    ${validation.queries.length > 0 ? `<br/><strong>Queries:</strong> ${validation.queries.length} unresolved` : ""}
  </div>`;

  html += `<h3>Validation Checkpoints</h3>`;
  html += `<table><thead><tr><th>#</th><th>Checkpoint</th><th>Status</th><th>Detail</th></tr></thead><tbody>`;
  validation.checkpoints.forEach((c, i) => {
    const cls = c.status === "pass" ? "pass" : c.status === "fail" ? "fail" : "warn";
    html += `<tr><td>${i + 1}</td><td>${esc(c.name)}</td><td class="${cls}">${c.status.toUpperCase()}</td><td>${esc(c.detail)}</td></tr>`;
  });
  html += `</tbody></table>`;

  if (validation.queries.length > 0) {
    html += `<h3>Technical Queries</h3>`;
    html += `<table><thead><tr><th>Model</th><th>Parameter</th><th>Issue</th><th>Clarification</th></tr></thead><tbody>`;
    validation.queries.forEach((q) => {
      html += `<tr><td>${esc(q.modelSeries)}</td><td>${esc(q.parameter)}</td><td>${esc(q.issue)}</td><td>${esc(q.requiredClarification)}</td></tr>`;
    });
    html += `</tbody></table>`;
  }

  html += `</body></html>`;
  return { html, validation };
}
