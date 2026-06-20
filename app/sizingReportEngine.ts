// ============================================================
// Sizing Report Engine — Professional MNC-Quality with
// ISO 5168 Measurement Uncertainty Analysis
// ============================================================

import { PIPE_DIMENSIONS } from "./pipeDimensions";

// ─── Flow Unit Conversion ────────────────────────────────────────────────
function toM3hr(flowRate: number, unit: string, density?: number): number {
  if (!flowRate || flowRate <= 0) return 0;
  switch (unit) {
    case "m³/hr": return flowRate;
    case "lph": return flowRate / 1000;
    case "lpm": return flowRate * 0.06;
    case "kg/hr": return density && density > 0 ? flowRate / density : 0;
    case "CFM": return flowRate * 1.699;
    case "Nm³/hr": return density && density > 0 ? (flowRate * 1.205) / density : flowRate;
    default: return flowRate;
  }
}

// Safe formatters — prevent NaN/Infinity
function sf(n: number, d: number = 1): string { return isFinite(n) && !isNaN(n) ? n.toFixed(d) : "0"; }
function sf2(n: number): string { return isFinite(n) && !isNaN(n) ? n.toFixed(2) : "0.00"; }
function sf3(n: number): string { return isFinite(n) && !isNaN(n) ? n.toFixed(3) : "0.000"; }

// ─── ISO 5168 Uncertainty Budget Calculation ────────────────────────────
// Uncertainty per GUM — Type B evaluation with rectangular distribution
// ui = stated_uncertainty / √3
// Combined: uc = √(Σui²)
// Expanded (k=2, 95%): U = 2 × uc

export interface UncertaintyBudgetItem {
  source: string;           // e.g. "Base Accuracy"
  symbol: string;           // e.g. "u₁"
  type: "A" | "B";          // Type A (statistical) or B (non-statistical)
  statedValue: string;      // e.g. "±0.5%"
  distribution: string;     // e.g. "Normal" or "Rectangular"
  divisor: number;          // √3 for rectangular, 2 for normal (95%), 1 for direct
  standardUncertainty: number; // % value
  sensitivity: number;      // sensitivity coefficient (usually 1.0)
  contribution: number;     // (sensitivity × ui)²
}

export function calculateUncertaintyBudget(
  meterAccuracyPct: number,
  meterRepeatabilityPct: number,
  flowRatio: number,        // Q/Qmax (0 to 1)
  zeroStabilityPct: number   // Zero stability as % of span
): UncertaintyBudgetItem[] {
  // At low flow, zero stability dominates (fixed error becomes large % of reading)
  const zeroErrorPct = zeroStabilityPct / Math.max(flowRatio, 0.01);

  const items: UncertaintyBudgetItem[] = [
    {
      source: "Base Accuracy (of rate)",
      symbol: "u₁",
      type: "B",
      statedValue: `±${meterAccuracyPct}%`,
      distribution: "Rectangular",
      divisor: Math.sqrt(3),
      standardUncertainty: meterAccuracyPct / Math.sqrt(3),
      sensitivity: 1.0,
      contribution: Math.pow(meterAccuracyPct / Math.sqrt(3), 2),
    },
    {
      source: "Factory Calibration",
      symbol: "u₂",
      type: "B",
      statedValue: `±0.1%`,
      distribution: "Normal (k=2)",
      divisor: 2,
      standardUncertainty: 0.1 / 2,
      sensitivity: 1.0,
      contribution: Math.pow(0.1 / 2, 2),
    },
    {
      source: "Repeatability",
      symbol: "u₃",
      type: "A",
      statedValue: `±${meterRepeatabilityPct}%`,
      distribution: "Normal (k=2)",
      divisor: 2,
      standardUncertainty: meterRepeatabilityPct / 2,
      sensitivity: 1.0,
      contribution: Math.pow(meterRepeatabilityPct / 2, 2),
    },
    {
      source: "Installation Effect",
      symbol: "u₄",
      type: "B",
      statedValue: `±0.3%`,
      distribution: "Rectangular",
      divisor: Math.sqrt(3),
      standardUncertainty: 0.3 / Math.sqrt(3),
      sensitivity: 1.0,
      contribution: Math.pow(0.3 / Math.sqrt(3), 2),
    },
    {
      source: "Temperature Effect",
      symbol: "u₅",
      type: "B",
      statedValue: `±0.1%/10°C`,
      distribution: "Rectangular",
      divisor: Math.sqrt(3),
      standardUncertainty: 0.1 / Math.sqrt(3),
      sensitivity: 1.0,
      contribution: Math.pow(0.1 / Math.sqrt(3), 2),
    },
    {
      source: "Pressure Effect",
      symbol: "u₆",
      type: "B",
      statedValue: `±0.05%`,
      distribution: "Rectangular",
      divisor: Math.sqrt(3),
      standardUncertainty: 0.05 / Math.sqrt(3),
      sensitivity: 1.0,
      contribution: Math.pow(0.05 / Math.sqrt(3), 2),
    },
    {
      source: "Zero Stability (of span)",
      symbol: "u₇",
      type: "B",
      statedValue: `±${zeroStabilityPct}% of span`,
      distribution: "Rectangular",
      divisor: Math.sqrt(3),
      standardUncertainty: zeroErrorPct / Math.sqrt(3),
      sensitivity: 1.0,
      contribution: Math.pow(zeroErrorPct / Math.sqrt(3), 2),
    },
  ];

  return items;
}

export function getCombinedUncertainty(budget: UncertaintyBudgetItem[]): number {
  const sumSq = budget.reduce((sum, item) => sum + item.contribution, 0);
  return Math.sqrt(sumSq);
}

export function getExpandedUncertainty(budget: UncertaintyBudgetItem[], k: number = 2): number {
  return k * getCombinedUncertainty(budget);
}

// ─── Report Data Interface ──────────────────────────────────────────────

export interface SizingReportData {
  projectName: string;
  clientName: string;
  soRef: string;
  date: string;
  preparedBy: string;
  service: "liquid" | "gas" | "steam";
  fluidName: string;
  fluidDensity: number;
  fluidViscosity: number;
  operatingTemp: number;
  operatingPressure: number;
  pipeSizeNominal: string;
  qMin: number;
  qMax: number;
  qNormal: number;
  flowUnit: string;
  velocityMin: number;
  velocityMax: number;
  velocityNormal: number;
  reynoldsMin: number;
  reynoldsMax: number;
  turndownRatio: number;
  meterName: string;
  meterModel: string;
  meterSize: string;
  meterAccuracy: string;
  meterRepeatability: string;
  qMinMeter: number;
  qMaxMeter: number;
  pressureDropAtQmax: number;
  pressureDropUnit: string;
  sizingStatus: "optimal" | "valid" | "marginal" | "rejected";
  sizingNotes: string[];
  uncertaintyBudget: UncertaintyBudgetItem[];
  combinedUncertainty: number;
  expandedUncertainty: number;
}

// ─── SVG Chart Generators ───────────────────────────────────────────────

function svgHeader(w: number, h: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="300" style="font-family:Arial,sans-serif;">`;
}
function errorSvg(name: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 80" width="100%" height="80"><rect width="700" height="80" fill="#f8f8f8" stroke="#ddd"/><text x="350" y="45" text-anchor="middle" font-size="12" fill="#999">${name} — Insufficient data</text></svg>`;
}

// 1. FLOW RANGE CHART
export function generateFlowRangeChart(data: SizingReportData): string {
  try {
    const W = 700, H = 260;
    const m = { t: 30, r: 30, b: 50, l: 70 };
    const cw = W - m.l - m.r, ch = H - m.t - m.b;
    const qMinM = Math.max(data.qMinMeter, 0.001);
    const qMaxM = Math.max(data.qMaxMeter, qMinM * 1.1);
    const xMax = qMaxM * 1.15;
    const toX = (q: number) => m.l + (Math.max(q, 0) / xMax) * cw;
    const zones = { unusable: "#fce8e6", marginal: "#fef3cd", optimal: "#e8f5e9", overload: "#fce8e6" };

    let svg = svgHeader(W, H);
    svg += `<rect x="${toX(0)}" y="${m.t}" width="${Math.max(toX(qMinM)-toX(0),0)}" height="${ch}" fill="${zones.unusable}"/>`;
    svg += `<rect x="${toX(qMinM)}" y="${m.t}" width="${Math.max(toX(qMaxM*0.3)-toX(qMinM),0)}" height="${ch}" fill="${zones.marginal}"/>`;
    svg += `<rect x="${toX(qMaxM*0.3)}" y="${m.t}" width="${Math.max(toX(qMaxM)-toX(qMaxM*0.3),0)}" height="${ch}" fill="${zones.optimal}"/>`;
    svg += `<rect x="${toX(qMaxM)}" y="${m.t}" width="${Math.max(toX(xMax)-toX(qMaxM),0)}" height="${ch}" fill="${zones.overload}"/>`;
    for (let i = 0; i <= 5; i++) { const y = m.t + (i/5)*ch; svg += `<line x1="${m.l}" y1="${y}" x2="${W-m.r}" y2="${y}" stroke="#e0e0e0" stroke-width="0.5"/><text x="${m.l-8}" y="${y+3}" text-anchor="end" font-size="9" fill="#888">${100-i*20}%</text>`; }
    svg += `<line x1="${m.l}" y1="${H-m.b}" x2="${W-m.r}" y2="${H-m.b}" stroke="#333" stroke-width="1"/>`;
    svg += `<text x="${W/2}" y="${H-10}" text-anchor="middle" font-size="10" fill="#333" font-weight="bold">Flow Rate (${data.flowUnit})</text>`;
    [0, qMinM, (qMinM+qMaxM)/2, qMaxM].forEach((t, i) => { const x = toX(t); const labels = ["0", `Qmin ${sf(t)}`, `Qnorm ${sf((data.qMin+data.qMax)/2)}`, `Qmax ${sf(t)}`]; svg += `<line x1="${x}" y1="${H-m.b}" x2="${x}" y2="${H-m.b+4}" stroke="#333" stroke-width="1"/><text x="${x}" y="${H-m.b+16}" text-anchor="middle" font-size="8" fill="#555">${labels[i]}</text>`; });
    svg += `<line x1="${toX(qMinM)}" y1="${m.t}" x2="${toX(qMinM)}" y2="${H-m.b}" stroke="#c5221f" stroke-width="1.5" stroke-dasharray="4,2"/>`;
    svg += `<line x1="${toX(qMaxM)}" y1="${m.t}" x2="${toX(qMaxM)}" y2="${H-m.b}" stroke="#c5221f" stroke-width="1.5" stroke-dasharray="4,2"/>`;
    const barY = m.t + ch * 0.4, barH = 18;
    const ux1 = toX(Math.max(data.qMin, 0)), ux2 = toX(Math.min(data.qMax, xMax));
    if (ux2 > ux1) { svg += `<rect x="${ux1}" y="${barY}" width="${ux2-ux1}" height="${barH}" fill="#1e8e3e" rx="3" opacity="0.85"/><text x="${(ux1+ux2)/2}" y="${barY+barH/2+4}" text-anchor="middle" font-size="9" fill="white" font-weight="bold">YOUR RANGE: ${sf(data.qMin)} – ${sf(data.qMax)} ${data.flowUnit}</text>`; }
    const qNorm = (data.qMin + data.qMax) / 2;
    svg += `<line x1="${toX(qNorm)}" y1="${barY-8}" x2="${toX(qNorm)}" y2="${barY+barH+8}" stroke="#1a73e8" stroke-width="2"/><polygon points="${toX(qNorm)-4},${barY-8} ${toX(qNorm)+4},${barY-8} ${toX(qNorm)},${barY-3}" fill="#1a73e8"/><text x="${toX(qNorm)}" y="${barY-12}" text-anchor="middle" font-size="8" fill="#1a73e8" font-weight="bold">Normal: ${sf(qNorm)}</text>`;
    const lx = W - m.r - 150, ly = m.t + 5;
    svg += `<rect x="${lx}" y="${ly}" width="150" height="55" fill="white" stroke="#ccc" stroke-width="0.5" rx="2"/>`;
    svg += `<rect x="${lx+5}" y="${ly+6}" width="12" height="8" fill="${zones.unusable}" stroke="#ccc" stroke-width="0.3"/><text x="${lx+20}" y="${ly+13}" font-size="7" fill="#555">Below Qmin (unusable)</text>`;
    svg += `<rect x="${lx+5}" y="${ly+18}" width="12" height="8" fill="${zones.marginal}" stroke="#ccc" stroke-width="0.3"/><text x="${lx+20}" y="${ly+25}" font-size="7" fill="#555">Marginal (poor accuracy)</text>`;
    svg += `<rect x="${lx+5}" y="${ly+30}" width="12" height="8" fill="${zones.optimal}" stroke="#ccc" stroke-width="0.3"/><text x="${lx+20}" y="${ly+37}" font-size="7" fill="#555">Optimal (best accuracy)</text>`;
    svg += `<rect x="${lx+5}" y="${ly+42}" width="12" height="8" fill="${zones.overload}" stroke="#ccc" stroke-width="0.3"/><text x="${lx+20}" y="${ly+49}" font-size="7" fill="#555">Above Qmax (overload)</text>`;
    svg += `<text x="${m.l}" y="20" font-size="12" fill="#333" font-weight="bold">Flow Range Analysis — ${data.meterName} (${data.meterSize})</text>`;
    svg += `</svg>`;
    return svg;
  } catch (e) { return errorSvg("Flow Range Chart"); }
}

// 2. MEASUREMENT UNCERTAINTY vs FLOW RATE — ISO 5168
export function generateUncertaintyChart(data: SizingReportData): string {
  try {
    const W = 700, H = 300;
    const m = { t: 30, r: 30, b: 50, l: 60 };
    const cw = W - m.l - m.r, ch = H - m.t - m.b;
    const qMinM = Math.max(data.qMinMeter, 0.001);
    const qMaxM = Math.max(data.qMaxMeter, qMinM * 1.1);

    // Generate uncertainty curve at multiple flow ratios
    const points: { q: number; uc: number; ue: number }[] = [];
    const steps = 60;
    const accPct = parseAccuracy(data.meterAccuracy);
    const repPct = parseAccuracy(data.meterRepeatability);
    const zeroPct = accPct * 0.2; // zero stability = 20% of accuracy spec

    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const q = qMinM + ratio * (qMaxM - qMinM);
      const budget = calculateUncertaintyBudget(accPct, repPct, Math.max(ratio, 0.01), zeroPct);
      const uc = getCombinedUncertainty(budget);
      const ue = getExpandedUncertainty(budget, 2);
      points.push({ q, uc, ue });
    }

    const yMax = Math.max(...points.map(p => p.ue), 1) * 1.2;
    const toX = (q: number) => m.l + ((q - qMinM) / (qMaxM - qMinM)) * cw;
    const toY = (v: number) => m.t + ch - (v / yMax) * ch;

    let svg = svgHeader(W, H);

    // Grid
    for (let i = 0; i <= 6; i++) {
      const y = m.t + (i/6)*ch;
      const val = yMax * (1 - i/6);
      svg += `<line x1="${m.l}" y1="${y}" x2="${W-m.r}" y2="${y}" stroke="#e8e8e8" stroke-width="0.5"/>`;
      svg += `<text x="${m.l-6}" y="${y+3}" text-anchor="end" font-size="8" fill="#888">±${sf(val)}%</text>`;
    }

    // Expanded uncertainty band (k=2, 95%)
    let bandD = `M${toX(points[0].q)},${toY(points[0].ue)}`;
    points.forEach(p => { bandD += ` L${toX(p.q)},${toY(p.ue)}`; });
    for (let i = points.length - 1; i >= 0; i--) { bandD += ` L${toX(points[i].q)},${toY(points[i].uc)}`; }
    bandD += " Z";
    svg += `<path d="${bandD}" fill="#fce8e6" stroke="none" opacity="0.6"/>`;

    // Expanded uncertainty curve (k=2)
    let ueD = `M${toX(points[0].q)},${toY(points[0].ue)}`;
    points.forEach(p => { ueD += ` L${toX(p.q)},${toY(p.ue)}`; });
    svg += `<path d="${ueD}" fill="none" stroke="#c5221f" stroke-width="2.5"/>`;

    // Combined uncertainty curve (k=1)
    let ucD = `M${toX(points[0].q)},${toY(points[0].uc)}`;
    points.forEach(p => { ucD += ` L${toX(p.q)},${toY(p.uc)}`; });
    svg += `<path d="${ucD}" fill="none" stroke="#f9a825" stroke-width="1.5"/>`;

    // Specified accuracy line
    const specY = toY(accPct);
    svg += `<line x1="${m.l}" y1="${specY}" x2="${W-m.r}" y2="${specY}" stroke="#5f6368" stroke-width="1" stroke-dasharray="6,3"/>`;
    svg += `<text x="${W-m.r+2}" y="${specY+3}" font-size="8" fill="#5f6368">Meter Spec: ±${sf(accPct)}%</text>`;

    // User range shading
    if (data.qMax > data.qMin) {
      svg += `<rect x="${toX(Math.max(data.qMin, qMinM))}" y="${m.t}" width="${Math.min(toX(data.qMax), toX(qMaxM))-toX(Math.max(data.qMin, qMinM))}" height="${ch}" fill="#1a73e8" opacity="0.05"/>`;
    }

    // Axes
    svg += `<line x1="${m.l}" y1="${H-m.b}" x2="${W-m.r}" y2="${H-m.b}" stroke="#333" stroke-width="1"/>`;
    svg += `<text x="${W/2}" y="${H-10}" text-anchor="middle" font-size="10" fill="#333" font-weight="bold">Flow Rate (${data.flowUnit})</text>`;
    svg += `<text x="${m.l}" y="20" font-size="12" fill="#333" font-weight="bold">Measurement Uncertainty — ISO 5168 / GUM Method</text>`;
    svg += `<text x="15" y="${H/2}" text-anchor="middle" font-size="9" fill="#666" transform="rotate(-90,15,${H/2})">Uncertainty (% of reading)</text>`;

    // Legend
    const lx = m.l + 10, ly = m.t + 5;
    svg += `<rect x="${lx}" y="${ly}" width="200" height="52" fill="white" stroke="#ccc" stroke-width="0.5" rx="2" opacity="0.9"/>`;
    svg += `<line x1="${lx+5}" y1="${ly+10}" x2="${lx+25}" y2="${ly+10}" stroke="#c5221f" stroke-width="2.5"/><text x="${lx+28}" y="${ly+13}" font-size="8" fill="#555">Expanded Uncertainty U (k=2, 95%)</text>`;
    svg += `<line x1="${lx+5}" y1="${ly+22}" x2="${lx+25}" y2="${ly+22}" stroke="#f9a825" stroke-width="1.5"/><text x="${lx+28}" y="${ly+25}" font-size="8" fill="#555">Combined Uncertainty u<sub>c</sub></text>`;
    svg += `<rect x="${lx+5}" y="${ly+32}" width="20" height="8" fill="#fce8e6" opacity="0.6"/><text x="${lx+28}" y="${ly+39}" font-size="8" fill="#555">Confidence Interval (k=2)</text>`;

    [qMinM, (qMinM+qMaxM)/2, qMaxM].forEach(t => {
      svg += `<line x1="${toX(t)}" y1="${H-m.b}" x2="${toX(t)}" y2="${H-m.b+4}" stroke="#333" stroke-width="1"/>`;
      svg += `<text x="${toX(t)}" y="${H-m.b+16}" text-anchor="middle" font-size="8" fill="#555">${sf(t)}</text>`;
    });

    svg += `</svg>`;
    return svg;
  } catch (e) { return errorSvg("Measurement Uncertainty Chart"); }
}

// 3. UNCERTAINTY BUDGET BAR CHART — ISO 5168
export function generateUncertaintyBudgetChart(data: SizingReportData): string {
  try {
    const W = 700, H = 280;
    const m = { t: 30, r: 40, b: 80, l: 220 };
    const cw = W - m.l - m.r, ch = H - m.t - m.b;

    const budget = data.uncertaintyBudget;
    const maxVal = Math.max(...budget.map(b => b.standardUncertainty), 0.01) * 1.3;

    let svg = svgHeader(W, H);

    const barH = ch / budget.length * 0.7;
    const gap = ch / budget.length * 0.3;

    budget.forEach((item, i) => {
      const y = m.t + i * (barH + gap) + gap/2;
      const bw = (item.standardUncertainty / maxVal) * cw;
      const color = item.type === "A" ? "#1a73e8" : "#5f6368";

      // Bar
      svg += `<rect x="${m.l}" y="${y}" width="${bw}" height="${barH}" fill="${color}" opacity="0.75" rx="2"/>`;

      // Label (source name)
      svg += `<text x="${m.l-6}" y="${y+barH/2+3}" text-anchor="end" font-size="8" fill="#444">${item.symbol} ${item.source}</text>`;

      // Type badge
      svg += `<text x="${m.l-180}" y="${y+barH/2+3}" text-anchor="middle" font-size="7" fill="${item.type === 'A' ? '#1a73e8' : '#5f6368'}" font-weight="bold">${item.type}</text>`;

      // Stated value
      svg += `<text x="${m.l-140}" y="${y+barH/2+3}" text-anchor="middle" font-size="7" fill="#666">${item.statedValue}</text>`;

      // Distribution
      svg += `<text x="${m.l-60}" y="${y+barH/2+3}" text-anchor="middle" font-size="7" fill="#888">${item.distribution}</text>`;

      // Standard uncertainty value
      svg += `<text x="${m.l+bw+4}" y="${y+barH/2+3}" font-size="8" fill="#333" font-weight="bold">${sf3(item.standardUncertainty)}%</text>`;
    });

    // Column headers
    svg += `<text x="${m.l-180}" y="${H-m.b+18}" text-anchor="middle" font-size="8" fill="#333" font-weight="bold">Type</text>`;
    svg += `<text x="${m.l-140}" y="${H-m.b+18}" text-anchor="middle" font-size="8" fill="#333" font-weight="bold">Stated</text>`;
    svg += `<text x="${m.l-60}" y="${H-m.b+18}" text-anchor="middle" font-size="8" fill="#333" font-weight="bold">Distribution</text>`;
    svg += `<text x="${m.l+40}" y="${H-m.b+18}" text-anchor="middle" font-size="8" fill="#333" font-weight="bold">Standard Uncertainty uᵢ (%)</text>`;

    // Summary box
    svg += `<rect x="${m.l}" y="${H-m.b+35}" width="${cw}" height="30" fill="#f8f9fa" stroke="#dadce0" rx="2"/>`;
    svg += `<text x="${m.l+8}" y="${H-m.b+47}" font-size="9" fill="#333" font-weight="bold">Combined u<sub>c</sub> = ${sf3(data.combinedUncertainty)}% &nbsp;|&nbsp; Expanded U (k=2, 95%) = ${sf3(data.expandedUncertainty)}%</text>`;
    svg += `<text x="${m.l+8}" y="${H-m.b+59}" font-size="7" fill="#666">Per ISO 5168:2005 / GUM — Type A: Statistical, Type B: Non-statistical (rectangular distribution, divisor = √3)</text>`;

    svg += `<text x="${m.l}" y="20" font-size="12" fill="#333" font-weight="bold">Uncertainty Budget — ${data.meterName} @ Normal Flow</text>`;
    svg += `</svg>`;
    return svg;
  } catch (e) { return errorSvg("Uncertainty Budget Chart"); }
}

// 4. PRESSURE DROP CHART
export function generatePressureDropChart(data: SizingReportData): string {
  try {
    const W = 700, H = 260;
    const m = { t: 30, r: 40, b: 50, l: 60 };
    const cw = W - m.l - m.r, ch = H - m.t - m.b;
    const dpMax = Math.max(data.pressureDropAtQmax, 0.0001);
    const qMaxM = Math.max(data.qMaxMeter, 0.001);

    const points: { q: number; dp: number }[] = [];
    for (let i = 0; i <= 40; i++) {
      const ratio = i / 40;
      const q = ratio * qMaxM;
      points.push({ q, dp: dpMax * ratio * ratio });
    }

    const toX = (q: number) => m.l + (q / qMaxM) * cw;
    const yMax = dpMax * 1.2;
    const toY = (dp: number) => m.t + ch - (dp / yMax) * ch;

    let svg = svgHeader(W, H);
    for (let i = 0; i <= 5; i++) { const y = m.t + (i/5)*ch; const val = yMax*(1-i/5); svg += `<line x1="${m.l}" y1="${y}" x2="${W-m.r}" y2="${y}" stroke="#e8e8e8" stroke-width="0.5"/><text x="${m.l-6}" y="${y+3}" text-anchor="end" font-size="8" fill="#888">${val<0.01?val.toExponential(1):sf2(val)}</text>`; }
    let curveD = `M${toX(points[0].q)},${toY(points[0].dp)}`; points.forEach(p => { curveD += ` L${toX(p.q)},${toY(p.dp)}`; });
    svg += `<path d="${curveD}" fill="none" stroke="#5f6368" stroke-width="2.5"/>`;
    svg += `<path d="${curveD} L${toX(points[points.length-1].q)},${toY(0)} L${toX(points[0].q)},${toY(0)} Z" fill="#5f6368" opacity="0.08"/>`;
    if (data.qMax > data.qMin) { svg += `<rect x="${toX(Math.max(data.qMin,0))}" y="${m.t}" width="${Math.min(toX(data.qMax),toX(qMaxM))-toX(Math.max(data.qMin,0))}" height="${ch}" fill="#1a73e8" opacity="0.05"/>`; }
    const dpAtQmax = dpMax * Math.pow(Math.min(data.qMax/qMaxM,1),2);
    svg += `<circle cx="${toX(Math.min(data.qMax,qMaxM))}" cy="${toY(dpAtQmax)}" r="5" fill="#c5221f" stroke="white" stroke-width="1.5"/>`;
    svg += `<text x="${toX(Math.min(data.qMax,qMaxM))+8}" y="${toY(dpAtQmax)+3}" font-size="8" fill="#c5221f" font-weight="bold">${sf3(dpAtQmax)} ${data.pressureDropUnit} @ Qmax</text>`;
    const dpAtNorm = dpMax * Math.pow(Math.min(data.qNormal/qMaxM,1),2);
    svg += `<circle cx="${toX(Math.min(data.qNormal,qMaxM))}" cy="${toY(dpAtNorm)}" r="4" fill="#1a73e8" stroke="white" stroke-width="1.5"/>`;
    svg += `<text x="${toX(Math.min(data.qNormal,qMaxM))+8}" y="${toY(dpAtNorm)+3}" font-size="8" fill="#1a73e8">${sf3(dpAtNorm)} ${data.pressureDropUnit} @ Qnorm</text>`;
    svg += `<line x1="${m.l}" y1="${H-m.b}" x2="${W-m.r}" y2="${H-m.b}" stroke="#333" stroke-width="1"/>`;
    svg += `<text x="${W/2}" y="${H-10}" text-anchor="middle" font-size="10" fill="#333" font-weight="bold">Flow Rate (${data.flowUnit})</text>`;
    svg += `<text x="${m.l}" y="20" font-size="12" fill="#333" font-weight="bold">Pressure Drop — ${data.meterName} (${data.meterSize})</text>`;
    svg += `<text x="15" y="${H/2}" text-anchor="middle" font-size="9" fill="#666" transform="rotate(-90,15,${H/2})">Pressure Drop (${data.pressureDropUnit})</text>`;
    [0, qMaxM*0.5, qMaxM].forEach(t => { svg += `<line x1="${toX(t)}" y1="${H-m.b}" x2="${toX(t)}" y2="${H-m.b+4}" stroke="#333" stroke-width="1"/><text x="${toX(t)}" y="${H-m.b+16}" text-anchor="middle" font-size="8" fill="#555">${sf(t)}</text>`; });
    svg += `</svg>`;
    return svg;
  } catch (e) { return errorSvg("Pressure Drop Chart"); }
}

// 5. VELOCITY PROFILE CHART
export function generateVelocityChart(data: SizingReportData): string {
  try {
    const W = 700, H = 260;
    const m = { t: 30, r: 30, b: 50, l: 60 };
    const cw = W - m.l - m.r, ch = H - m.t - m.b;
    const pipe = PIPE_DIMENSIONS[data.pipeSizeNominal] || PIPE_DIMENSIONS["DN80"];
    const idMm = pipe ? pipe.innerDiameterMm : 80;
    const areaM2 = Math.PI * Math.pow(idMm/2000, 2);
    if (areaM2 <= 0) return errorSvg("Velocity Chart — Invalid Pipe");
    const vLimit = data.service === "gas" ? 40 : data.service === "steam" ? 60 : 10;
    const vMinRec = data.service === "liquid" ? 0.3 : 2;
    const qMaxM = Math.max(data.qMaxMeter, 0.001);

    const points: { q: number; v: number }[] = [];
    for (let i = 0; i <= 40; i++) { const ratio = i/40; const q = ratio * qMaxM; points.push({ q, v: (q/3600)/areaM2 }); }

    const toX = (q: number) => m.l + (q / qMaxM) * cw;
    const yMax = Math.max(vLimit * 1.3, data.velocityMax, data.velocityNormal, 0.1) * 1.2;
    const toY = (v: number) => m.t + ch - (v / yMax) * ch;

    let svg = svgHeader(W, H);
    svg += `<rect x="${m.l}" y="${toY(yMax)}" width="${cw}" height="${Math.max(toY(vLimit)-toY(yMax),1)}" fill="#fce8e6" opacity="0.4"/>`;
    svg += `<rect x="${m.l}" y="${toY(vLimit)}" width="${cw}" height="${Math.max(toY(vMinRec)-toY(vLimit),1)}" fill="#e8f5e9" opacity="0.4"/>`;
    svg += `<rect x="${m.l}" y="${toY(vMinRec)}" width="${cw}" height="${Math.max(toY(0)-toY(vMinRec),1)}" fill="#fef3cd" opacity="0.4"/>`;
    for (let i = 0; i <= 5; i++) { const y = m.t + (i/5)*ch; const val = yMax*(1-i/5); svg += `<line x1="${m.l}" y1="${y}" x2="${W-m.r}" y2="${y}" stroke="#e8e8e8" stroke-width="0.5"/><text x="${m.l-6}" y="${y+3}" text-anchor="end" font-size="8" fill="#888">${sf(val)}</text>`; }
    let curveD = `M${toX(points[0].q)},${toY(points[0].v)}`; points.forEach(p => { curveD += ` L${toX(p.q)},${toY(p.v)}`; });
    svg += `<path d="${curveD}" fill="none" stroke="#5f6368" stroke-width="2.5"/>`;
    svg += `<path d="${curveD} L${toX(points[points.length-1].q)},${toY(0)} L${toX(points[0].q)},${toY(0)} Z" fill="#5f6368" opacity="0.08"/>`;
    svg += `<line x1="${m.l}" y1="${toY(vLimit)}" x2="${W-m.r}" y2="${toY(vLimit)}" stroke="#c5221f" stroke-width="1" stroke-dasharray="6,3"/>`;
    svg += `<text x="${W-m.r}" y="${toY(vLimit)-4}" text-anchor="end" font-size="8" fill="#c5221f">Max: ${vLimit} m/s</text>`;
    svg += `<line x1="${m.l}" y1="${toY(vMinRec)}" x2="${W-m.r}" y2="${toY(vMinRec)}" stroke="#f9a825" stroke-width="1" stroke-dasharray="6,3"/>`;
    svg += `<text x="${W-m.r}" y="${toY(vMinRec)+10}" text-anchor="end" font-size="8" fill="#b38600">Min: ${vMinRec} m/s</text>`;
    if (data.qMax > data.qMin) { svg += `<rect x="${toX(Math.max(data.qMin,0))}" y="${m.t}" width="${Math.min(toX(data.qMax),toX(qMaxM))-toX(Math.max(data.qMin,0))}" height="${ch}" fill="#1a73e8" opacity="0.05"/>`; }
    if (data.velocityMax > 0) { svg += `<circle cx="${toX(Math.min(data.qMax,qMaxM))}" cy="${toY(data.velocityMax)}" r="5" fill="#c5221f" stroke="white" stroke-width="1.5"/><text x="${toX(Math.min(data.qMax,qMaxM))+8}" y="${toY(data.velocityMax)+3}" font-size="8" fill="#c5221f" font-weight="bold">Vmax: ${sf3(data.velocityMax)} m/s</text>`; }
    if (data.velocityNormal > 0) { svg += `<circle cx="${toX(Math.min(data.qNormal,qMaxM))}" cy="${toY(data.velocityNormal)}" r="4" fill="#1a73e8" stroke="white" stroke-width="1.5"/><text x="${toX(Math.min(data.qNormal,qMaxM))+8}" y="${toY(data.velocityNormal)+3}" font-size="8" fill="#1a73e8">Vnorm: ${sf3(data.velocityNormal)} m/s</text>`; }
    svg += `<line x1="${m.l}" y1="${H-m.b}" x2="${W-m.r}" y2="${H-m.b}" stroke="#333" stroke-width="1"/>`;
    svg += `<text x="${W/2}" y="${H-10}" text-anchor="middle" font-size="10" fill="#333" font-weight="bold">Flow Rate (${data.flowUnit})</text>`;
    svg += `<text x="${m.l}" y="20" font-size="12" fill="#333" font-weight="bold">Velocity Profile — ${data.pipeSizeNominal} (${idMm}mm ID)</text>`;
    svg += `<text x="15" y="${H/2}" text-anchor="middle" font-size="9" fill="#666" transform="rotate(-90,15,${H/2})">Velocity (m/s)</text>`;
    [0, qMaxM*0.5, qMaxM].forEach(t => { svg += `<line x1="${toX(t)}" y1="${H-m.b}" x2="${toX(t)}" y2="${H-m.b+4}" stroke="#333" stroke-width="1"/><text x="${toX(t)}" y="${H-m.b+16}" text-anchor="middle" font-size="8" fill="#555">${sf(t)}</text>`; });
    svg += `</svg>`;
    return svg;
  } catch (e) { return errorSvg("Velocity Chart"); }
}

function parseAccuracy(s: any): number {
  if (!s) return 0.5;
  const str = String(s);
  const m = str.match(/([0-9.]+)/);
  return m ? parseFloat(m[1]) : 0.5;
}

// ─── Build Report Data ──────────────────────────────────────────────────

export function buildSizingReportData(
  result: any, state: any, projectName: string = "", clientName: string = "", soRef: string = ""
): SizingReportData {
  const s = state || {};
  const r = result || {};
  const product = r.product || {};

  const pipeKey = s.pipeSizeNominal || "DN80";
  const pipe = PIPE_DIMENSIONS[pipeKey] || PIPE_DIMENSIONS["DN80"];
  const areaM2 = pipe ? pipe.crossSectionalAreaM2 : 0.00477;

  const flowMin = s.flowRateMin || 0;
  const flowMax = s.flowRateMax || 0;
  const qNorm = (flowMin + flowMax) / 2;
  const flowUnit = s.flowUnit || "m³/hr";
  const density = s.density || 1000;

  const qMinM3hr = toM3hr(flowMin, flowUnit, density);
  const qMaxM3hr = toM3hr(flowMax, flowUnit, density);
  const qNormM3hr = toM3hr(qNorm, flowUnit, density);

  const velMin = areaM2 > 0 ? (qMinM3hr / 3600) / areaM2 : 0;
  const velMax = areaM2 > 0 ? (qMaxM3hr / 3600) / areaM2 : 0;
  const velNorm = areaM2 > 0 ? (qNormM3hr / 3600) / areaM2 : 0;

  const service = s.service || "liquid";
  const isLiquid = service === "liquid";
  const visc = s.viscosity || 1;
  const idMm = pipe ? pipe.innerDiameterMm : 80;
  const reMin = isLiquid && visc > 0 ? (velMin * (idMm/1000) * density) / (visc/1000) : 0;
  const reMax = isLiquid && visc > 0 ? (velMax * (idMm/1000) * density) / (visc/1000) : 0;

  // CORRECTED: SizeResult uses qMin/qMax (NOT qMinRange/qMaxRange)
  const sizes = r.sizes || [];
  const firstSize = sizes.length > 0 ? sizes[0] : null;
  const qMinMeter = firstSize && typeof firstSize.qMin === "number" ? firstSize.qMin : flowMin * 0.7;
  const qMaxMeter = firstSize && typeof firstSize.qMax === "number" ? firstSize.qMax : flowMax * 1.3;

  const dpUnit = service === "gas" ? "mbar" : "bar";
  const dpMax = service === "gas"
    ? velMax * velMax * 0.5 * density * 0.01
    : velMax * velMax * 0.5 * density * 0.00001;

  const opPressure = service === "liquid" ? (s.liquidPressureBarAbs || 1.013)
    : service === "gas" ? (s.gasPressureBarAbs || 1.013)
    : (s.steamPressureBarAbs || 6.0);

  const sizingNotes: string[] = [];
  if (r.reason) sizingNotes.push(r.reason);
  if (r.status) sizingNotes.push(`Sizing Status: ${r.status}`);
  if (!firstSize) sizingNotes.push("No size data available — using estimated ranges");

  // Uncertainty budget at normal flow
  const accPct = parseAccuracy(product.accuracy || "±0.5% of rate");
  const repPct = parseAccuracy(product.repeatability || "±0.1% of rate");
  const flowRatio = qNorm / Math.max(qMaxMeter, 0.001);
  const zeroPct = accPct * 0.2;
  const uncertaintyBudget = calculateUncertaintyBudget(accPct, repPct, flowRatio, zeroPct);
  const combinedUncertainty = getCombinedUncertainty(uncertaintyBudget);
  const expandedUncertainty = getExpandedUncertainty(uncertaintyBudget, 2);

  return {
    projectName: projectName || "—",
    clientName: clientName || "—",
    soRef: soRef || "—",
    date: new Date().toLocaleDateString("en-GB"),
    preparedBy: "Flowtech AI Sizing Tool",
    service, fluidName: (s.selectedLiquid && s.selectedLiquid.name) || (s.selectedGas && s.selectedGas.name) || service,
    fluidDensity: density, fluidViscosity: visc,
    operatingTemp: s.operatingTemp || 20,
    operatingPressure: opPressure,
    pipeSizeNominal: pipeKey,
    qMin: flowMin, qMax: flowMax, qNormal: qNorm, flowUnit,
    velocityMin: velMin, velocityMax: velMax, velocityNormal: velNorm,
    reynoldsMin: reMin, reynoldsMax: reMax,
    turndownRatio: flowMax / Math.max(flowMin, 0.001),
    meterName: product.name || "Flow Meter",
    meterModel: product.model || "—",
    meterSize: r.bestSize || (firstSize ? firstSize.size : "—"),
    meterAccuracy: product.accuracy || "±0.5% of rate",
    meterRepeatability: product.repeatability || "±0.1% of rate",
    qMinMeter: Math.max(qMinMeter, 0.001),
    qMaxMeter: Math.max(qMaxMeter, qMinMeter * 1.1),
    pressureDropAtQmax: Math.max(dpMax, 0.0001),
    pressureDropUnit: dpUnit,
    sizingStatus: (r.status === "best" ? "optimal" : r.status === "valid" ? "valid" : r.status === "marginal" ? "marginal" : "rejected") as any,
    sizingNotes,
    uncertaintyBudget,
    combinedUncertainty,
    expandedUncertainty,
  };
}

// ─── Build Report Data for ONE Specific Size ────────────────────────────
// Generates a sizing report scoped to ONE meter type + ONE specific size

export function buildSizingReportDataForSize(
  result: any, state: any, size: any, projectName: string = "", clientName: string = "", soRef: string = ""
): SizingReportData {
  const s = state || {};
  const r = result || {};
  const product = r.product || {};
  const sz = size || {};

  const pipeKey = s.pipeSizeNominal || "DN80";
  const pipe = PIPE_DIMENSIONS[pipeKey] || PIPE_DIMENSIONS["DN80"];
  const areaM2 = pipe ? pipe.crossSectionalAreaM2 : 0.00477;

  const flowMin = s.flowRateMin || 0;
  const flowMax = s.flowRateMax || 0;
  const qNorm = (flowMin + flowMax) / 2;
  const flowUnit = s.flowUnit || "m³/hr";
  const density = s.density || 1000;

  const service = s.service || "liquid";
  const isLiquid = service === "liquid";
  const visc = s.viscosity || 1;

  const velMin = areaM2 > 0 ? sz.velocityAtQmin || 0 : 0;
  const velMax = areaM2 > 0 ? sz.velocityAtQmax || 0 : 0;
  const velNorm = areaM2 > 0 ? ((toM3hr(qNorm, flowUnit, density) / 3600) / areaM2) : 0;

  const idMm = pipe ? pipe.innerDiameterMm : 80;
  const reMin = isLiquid && visc > 0 && velMin > 0 ? (velMin * (idMm/1000) * density) / (visc/1000) : 0;
  const reMax = isLiquid && visc > 0 && velMax > 0 ? (velMax * (idMm/1000) * density) / (visc/1000) : 0;

  const qMinMeter = typeof sz.qMin === "number" ? sz.qMin : flowMin * 0.7;
  const qMaxMeter = typeof sz.qMax === "number" ? sz.qMax : flowMax * 1.3;

  const dpUnit = service === "gas" ? "mbar" : "bar";
  const dpMax = sz.dpMax || (service === "gas"
    ? velMax * velMax * 0.5 * density * 0.01
    : velMax * velMax * 0.5 * density * 0.00001);

  const opPressure = service === "liquid" ? (s.liquidPressureBarAbs || 1.013)
    : service === "gas" ? (s.gasPressureBarAbs || 1.013)
    : (s.steamPressureBarAbs || 6.0);

  const sizingNotes: string[] = [];
  sizingNotes.push(`${product.name || "Flow Meter"} — Size: ${sz.size || "—"}`);
  if (r.reason) sizingNotes.push(r.reason);
  if (sz.status) sizingNotes.push(`Size Status: ${sz.status}`);
  if (sz.isOddSize) sizingNotes.push("Odd Size — non-standard, check availability");
  if (result.bestSize === sz.size) sizingNotes.push("BEST MATCH — recommended size");

  // Uncertainty budget at normal flow for THIS specific size
  const accPct = parseAccuracy(product.accuracy || "±0.5% of rate");
  const repPct = parseAccuracy(product.repeatability || "±0.1% of rate");
  const flowRatio = qNorm / Math.max(qMaxMeter, 0.001);
  const zeroPct = accPct * 0.2;
  const uncertaintyBudget = calculateUncertaintyBudget(accPct, repPct, flowRatio, zeroPct);
  const combinedUncertainty = getCombinedUncertainty(uncertaintyBudget);
  const expandedUncertainty = getExpandedUncertainty(uncertaintyBudget, 2);

  return {
    projectName: projectName || "—",
    clientName: clientName || "—",
    soRef: soRef || "—",
    date: new Date().toLocaleDateString("en-GB"),
    preparedBy: "Flowtech AI Sizing Tool",
    service,
    fluidName: (s.selectedLiquid && s.selectedLiquid.name) || (s.selectedGas && s.selectedGas.name) || service,
    fluidDensity: density,
    fluidViscosity: visc,
    operatingTemp: s.operatingTemp || 20,
    operatingPressure: opPressure,
    pipeSizeNominal: pipeKey,
    qMin: flowMin, qMax: flowMax, qNormal: qNorm, flowUnit,
    velocityMin: velMin, velocityMax: velMax, velocityNormal: velNorm,
    reynoldsMin: reMin, reynoldsMax: reMax,
    turndownRatio: flowMax / Math.max(flowMin, 0.001),
    meterName: product.name || "Flow Meter",
    meterModel: product.model || "—",
    meterSize: sz.size || "—",
    meterAccuracy: product.accuracy || "±0.5% of rate",
    meterRepeatability: product.repeatability || "±0.1% of rate",
    qMinMeter: Math.max(qMinMeter, 0.001),
    qMaxMeter: Math.max(qMaxMeter, qMinMeter * 1.1),
    pressureDropAtQmax: Math.max(dpMax, 0.0001),
    pressureDropUnit: dpUnit,
    sizingStatus: (sz.status === "optimal" ? "optimal" : sz.status === "valid" ? "valid" : sz.status === "marginal" ? "marginal" : "valid") as any,
    sizingNotes,
    uncertaintyBudget,
    combinedUncertainty,
    expandedUncertainty,
  };
}
