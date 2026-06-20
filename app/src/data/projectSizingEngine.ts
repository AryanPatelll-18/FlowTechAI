/**
 * Project Sizing Engine - Pure function for per-line-item sizing
 */

import { ALL_PRODUCTS, ROTAMETER_PRODUCTS } from "./factoryTables";
import { calculateWE } from "./waterEquivalentEngine";
import { GASES_DB } from "./gases";
import type { ServiceType } from "../hooks/useCalculator";

export interface LineItemProcessConditions {
  service: ServiceType;
  fluidName: string;
  density: number;
  viscosity: number;
  operatingTemp: number;
  operatingPressure: number;
  flowRateMin: number;
  flowRateMax: number;
  flowUnit: string;
  pipeSize: string;
  meterCategory: "inline" | "rotameter" | "both";
  gasPressureBarAbs?: number;
  selectedGasName?: string;
  liquidPressureBarAbs?: number;
  selectedLiquidName?: string;
  steamPressureBarAbs?: number;
  steamTempC?: number;
}

export interface LineItemSizingResult {
  lineItemId: string;
  tagNumber: string;
  sizedAt: number;
  bestSize: string;
  bestProduct: string;
  qMin: number;
  qMax: number;
  qMinUnit: string;
  velocityMin?: number;
  velocityMax?: number;
  velocityStatus?: "optimal" | "low" | "high" | "critical";
  accuracy: string;
  turndown: number;
  status: "optimal" | "valid" | "caution" | "rejected" | "no_data";
  reason?: string;
  waterEquivalent?: { weNorm: number; weMin: number; weMax: number; fcf: number; gcf: number };
  productResults: ProductSizingResult[];
}

export interface ProductSizingResult {
  productName: string;
  productCode: string;
  status: "optimal" | "valid" | "caution" | "rejected";
  reason: string;
  bestSize?: string;
  qMin?: number;
  qMax?: number;
  velocityMin?: number;
  velocityMax?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function toM3hr(value: number, unit: string): number {
  const u = unit.toUpperCase().trim();
  if (u === "M3/HR" || u === "M³/HR" || u === "M3/H" || u === "M³/H") return value;
  if (u === "LPH") return value / 1000;
  if (u === "LPM") return value * 0.06;
  if (u === "LPS") return value * 3.6;
  if (u === "GPM") return value * 0.227125;
  if (u === "GPH") return value * 0.003785;
  if (u === "KG/HR") return value / 1000;
  if (u.startsWith("NM³/H") || u.startsWith("NM3/H")) {
    return value * 1.01325 * (293.15 / 273.15);
  }
  return value;
}

function calcVel(flowM3hr: number, size: string): number {
  const dMap: Record<string, number> = { "15NB": 15, "20NB": 20, "25NB": 25, "32NB": 32, "40NB": 40, "50NB": 50, "65NB": 65, "80NB": 80, "100NB": 100, "125NB": 125, "150NB": 150, "200NB": 200, "250NB": 250, "300NB": 300 };
  const d = dMap[size];
  if (!d || d <= 0) return 0;
  return (flowM3hr / 3600) / (Math.PI * Math.pow(d / 2000, 2));
}

function velStatus(vmin: number, vmax: number): "optimal" | "low" | "high" | "critical" {
  if (vmin >= 0.3 && vmax <= 10) return "optimal";
  if (vmax > 15) return "critical";
  if (vmax > 10) return "high";
  return "low";
}

// ─── Main Sizing Function ───────────────────────────────────────────────────

export function sizeLineItem(conditions: LineItemProcessConditions, lineItemId: string, tagNumber: string): LineItemSizingResult {
  const { service, density, viscosity, operatingTemp, operatingPressure, flowRateMin, flowRateMax, flowUnit, meterCategory } = conditions;

  const result: LineItemSizingResult = {
    lineItemId, tagNumber, sizedAt: Date.now(),
    bestSize: "", bestProduct: "", qMin: 0, qMax: 0, qMinUnit: "m³/hr",
    accuracy: "", turndown: 0, status: "no_data", productResults: [],
  };

  if (flowRateMin <= 0 || flowRateMax <= 0 || flowRateMin > flowRateMax) {
    result.status = "rejected";
    result.reason = "Invalid flow range: " + flowRateMin + " to " + flowRateMax;
    return result;
  }

  const cfrMin = toM3hr(flowRateMin, flowUnit);
  const cfrMax = toM3hr(flowRateMax, flowUnit);

  // ─── Inline sizing ───────────────────────────────────────────────────
  const productResults: ProductSizingResult[] = [];

  if (meterCategory !== "rotameter") {
    for (const product of ALL_PRODUCTS) {
      if (product.service !== service) continue;

      const reasons: string[] = [];
      let rejected = false;

      if (product.minViscosity !== undefined && viscosity < product.minViscosity) { rejected = true; reasons.push("Visc " + viscosity.toFixed(1) + " < min " + product.minViscosity); }
      if (product.maxViscosity !== undefined && viscosity > product.maxViscosity) { rejected = true; reasons.push("Visc " + viscosity.toFixed(1) + " > max " + product.maxViscosity); }
      if (service === "liquid" && product.minDensity && density < product.minDensity) { rejected = true; reasons.push("Dens " + density.toFixed(1) + " < min " + product.minDensity); }
      if (product.minTemp !== undefined && operatingTemp < product.minTemp) { rejected = true; reasons.push("Temp " + operatingTemp + "C < min " + product.minTemp + "C"); }
      if (product.maxTemp !== undefined && operatingTemp > product.maxTemp) { rejected = true; reasons.push("Temp " + operatingTemp + "C > max " + product.maxTemp + "C"); }
      if (product.minPressure !== undefined && operatingPressure < product.minPressure) { rejected = true; reasons.push("Press " + operatingPressure.toFixed(2) + " < min " + product.minPressure); }

      if (rejected) { productResults.push({ productName: product.name, productCode: product.name, status: "rejected", reason: reasons.join("; ") }); continue; }

      let validSizes = 0, optimalSizes = 0;
      let bestSize = "", bestQmin = 0, bestQmax = 0, bestVmin = 0, bestVmax = 0;

      for (const sz of product.sizes) {
        const median = (sz.qMin + sz.qMax) / 2;
        const center = (cfrMin + cfrMax) / 2;
        const distMed = Math.abs(center - median) / (sz.qMax - sz.qMin);

        let st: string;
        if (cfrMax < sz.qMin) st = "too-low";
        else if (cfrMin > sz.qMax) st = "too-high";
        else if (cfrMin < sz.qMin && cfrMax <= sz.qMax) { st = "partial-low"; validSizes++; }
        else if (cfrMax > sz.qMax && cfrMin >= sz.qMin) { st = "partial-high"; validSizes++; }
        else if (distMed <= 0.25) { st = "optimal"; validSizes++; optimalSizes++; }
        else { st = "valid"; validSizes++; }

        if ((st === "optimal" || st === "valid" || st.startsWith("partial")) && (!bestSize || st === "optimal")) {
          bestSize = sz.size; bestQmin = sz.qMin; bestQmax = sz.qMax;
          bestVmin = calcVel(cfrMin, sz.size); bestVmax = calcVel(cfrMax, sz.size);
        }
      }

      if (validSizes === 0) {
        productResults.push({ productName: product.name, productCode: product.name, status: "rejected", reason: "No valid sizes for " + cfrMin.toFixed(2) + "-" + cfrMax.toFixed(2) + " m3/hr" });
      } else {
        const st = optimalSizes > 0 ? "optimal" : "valid";
        productResults.push({ productName: product.name, productCode: product.name, status: st, reason: (bestSize ? "Best: " + bestSize + ", " : "") + validSizes + " sizes", bestSize, qMin: bestQmin, qMax: bestQmax, velocityMin: bestVmin, velocityMax: bestVmax });
      }
    }
  }

  // ─── Rotameter sizing (water equivalent) ────────────────────────────
  if (meterCategory !== "inline" && service === "gas") {
    const gasName = conditions.selectedGasName || conditions.fluidName || "Air";
    const gasEntry = GASES_DB.find((g: any) => g.name.toLowerCase() === gasName.toLowerCase());
    const gasSG = gasEntry?.specificGravity || 1.0;
    const floatMat = "SS-316";

    const weNormR = calculateWE({ service: "gas", actualFlowRate: (flowRateMin + flowRateMax) / 2, flowUnit, floatMaterial: floatMat, processFluidDensity: density, processFluidSG: gasSG, processTempC: operatingTemp, processPressureBara: conditions.gasPressureBarAbs || 1.01325, gasName });
    const weMinR = calculateWE({ service: "gas", actualFlowRate: flowRateMin, flowUnit, floatMaterial: floatMat, processFluidDensity: density, processFluidSG: gasSG, processTempC: operatingTemp, processPressureBara: conditions.gasPressureBarAbs || 1.01325, gasName });
    const weMaxR = calculateWE({ service: "gas", actualFlowRate: flowRateMax, flowUnit, floatMaterial: floatMat, processFluidDensity: density, processFluidSG: gasSG, processTempC: operatingTemp, processPressureBara: conditions.gasPressureBarAbs || 1.01325, gasName });

    if (weNormR && weMinR && weMaxR) {
      result.waterEquivalent = { weNorm: weNormR.we_LPH, weMin: weMinR.we_LPH, weMax: weMaxR.we_LPH, fcf: weNormR.fcf || 1.0, gcf: weNormR.correctionFactor };
      for (const rp of ROTAMETER_PRODUCTS) {
        if (rp.service !== service) continue;
        let rBest = "", rValid = 0;
        for (const sz of rp.sizes) {
          if (result.waterEquivalent.weMax >= sz.qMin && result.waterEquivalent.weMin <= sz.qMax) {
            if (!rBest) rBest = sz.size; rValid++;
          }
        }
        if (rValid > 0) {
          productResults.push({ productName: rp.name, productCode: rp.name, status: "valid", reason: "WE sizing: " + rValid + " sizes", bestSize: rBest });
          if (!result.bestSize) { result.bestSize = rBest; result.bestProduct = rp.name; result.qMinUnit = "LPH"; }
        }
      }
    }
  }

  if (meterCategory !== "inline" && service === "liquid") {
    for (const rp of ROTAMETER_PRODUCTS) {
      if (rp.service !== service) continue;
      let rBest = "", rValid = 0, rqMin = 0, rqMax = 0;
      for (const sz of rp.sizes) {
        if (cfrMax >= sz.qMin && cfrMin <= sz.qMax) {
          if (!rBest) { rBest = sz.size; rqMin = sz.qMin; rqMax = sz.qMax; }
          rValid++;
        }
      }
      if (rValid > 0) {
        productResults.push({ productName: rp.name, productCode: rp.name, status: "valid", reason: rValid + " sizes", bestSize: rBest, qMin: rqMin, qMax: rqMax });
        if (!result.bestSize) { result.bestSize = rBest; result.bestProduct = rp.name; result.qMin = rqMin; result.qMax = rqMax; }
      }
    }
  }

  // ─── Determine overall best result ──────────────────────────────────
  const optimal = productResults.find((p) => p.status === "optimal");
  const valid = productResults.filter((p) => p.status === "valid" || p.status === "optimal");
  const best = optimal || valid[0];

  if (best) {
    result.bestSize = best.bestSize || "";
    result.bestProduct = best.productName;
    result.qMin = best.qMin || 0;
    result.qMax = best.qMax || 0;
    result.velocityMin = best.velocityMin;
    result.velocityMax = best.velocityMax;
    result.velocityStatus = best.velocityMin ? velStatus(best.velocityMin, best.velocityMax || 0) : undefined;
    result.accuracy = "±0.5% MV";
    result.turndown = result.qMin > 0 ? result.qMax / result.qMin : 0;
    result.status = best.status;
    result.reason = best.reason;
  } else if (productResults.length > 0) {
    result.status = "rejected";
    result.reason = "No suitable products";
  }

  result.productResults = productResults;
  return result;
}
