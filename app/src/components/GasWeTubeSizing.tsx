// ============================================================
// GAS WATER EQUIVALENT + TUBE SIZE RECOMMENDATION
// For Flow Sizing — Gas Section
// Calculates WE from gas data, then recommends rotameter tube size
// ============================================================

import { useState, useMemo } from "react";
import { Calculator, Droplets, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { calculateWE } from "../data/waterEquivalentEngine";
import { ROTAMETER_PRODUCTS } from "../data/factoryTables";
import type { GasData } from "../data/gases";

interface Props {
  gas: GasData | null;
  gasPressureBara: number;
  operatingTempC: number;
  gasDensity: number;
  flowRateMin: number;
  flowRateMax: number;
  flowRateNormal: number;
  flowUnit: string;
  pipeSize: string;
}

export default function GasWeTubeSizing({
  gas,
  gasPressureBara,
  operatingTempC,
  gasDensity,
  flowRateMin,
  flowRateMax,
  flowRateNormal,
  flowUnit,
  pipeSize,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate WE for normal, min, max flow using the master engine
  const weResults = useMemo(() => {
    if (!gas || !flowRateNormal || flowRateNormal <= 0 || !gasDensity) return null;

    try {
      const normResult = calculateWE({
        service: "gas",
        actualFlowRate: flowRateNormal,
        flowUnit,
        floatMaterial: "SS 316",
        processFluidDensity: gasDensity,
        processFluidSG: gasDensity / 1000,
        processTempC: operatingTempC,
        processPressureBara: gasPressureBara,
        gasName: gas.name,
      });

      let minResult = normResult;
      if (flowRateMin > 0 && flowRateMin !== flowRateNormal) {
        minResult = calculateWE({
          service: "gas",
          actualFlowRate: flowRateMin,
          flowUnit,
          floatMaterial: "SS 316",
          processFluidDensity: gasDensity,
          processFluidSG: gasDensity / 1000,
          processTempC: operatingTempC,
          processPressureBara: gasPressureBara,
          gasName: gas.name,
        });
      }

      let maxResult = normResult;
      if (flowRateMax > 0 && flowRateMax !== flowRateNormal) {
        maxResult = calculateWE({
          service: "gas",
          actualFlowRate: flowRateMax,
          flowUnit,
          floatMaterial: "SS 316",
          processFluidDensity: gasDensity,
          processFluidSG: gasDensity / 1000,
          processTempC: operatingTempC,
          processPressureBara: gasPressureBara,
          gasName: gas.name,
        });
      }

      if (!normResult || !minResult || !maxResult) return null;

      return {
        weNorm: normResult.we_LPH,
        weMin: minResult.we_LPH,
        weMax: maxResult.we_LPH,
        gcf: normResult.correctionFactor,
        fcf: normResult.fcf ?? 0,
        floatDensity: normResult.floatDensity,
        formula: normResult.formula,
        formulaDetail: normResult.formulaDetail,
        note: normResult.note,
        warning: normResult.warning,
      };
    } catch (e) {
      console.error("[GasWE] Calculation error:", e);
      return null;
    }
  }, [gas, gasDensity, flowRateNormal, flowRateMin, flowRateMax, flowUnit, gasPressureBara, operatingTempC]);

  // Find matching tube size from factory tables
  const tubeRecs = useMemo(() => {
    if (!weResults) return [];

    const glassTubeProduct = ROTAMETER_PRODUCTS[0]; // GLASS_TUBE_SS316
    if (!glassTubeProduct) return [];

    return glassTubeProduct.sizes.map((size) => {
      // Factory tables store qMin/qMax in m³/hr — convert to LPH for WE comparison
      const qMin = size.qMin * 1000;
      const qMax = size.qMax * 1000;
      const center = (qMin + qMax) / 2;
      const fromCenter = Math.abs(weResults.weNorm - center) / (qMax - qMin);

      let status: "optimal" | "valid" | "marginal" | "rejected" = "rejected";

      if (weResults.weMin >= qMin - (qMax - qMin) * 0.05 && weResults.weMax <= qMax + (qMax - qMin) * 0.05) {
        if (fromCenter < 0.4) {
          status = "optimal";
        } else {
          status = "valid";
        }
      } else if (weResults.weMax > qMax) {
        status = "marginal";
      } else if (weResults.weMin < qMin) {
        status = "marginal";
      }

      return { size: size.size, qMin, qMax, dpMax: size.dpMax, status, fromCenter };
    }).sort((a, b) => {
      const score = (s: typeof a) =>
        (s.status === "optimal" ? 100 : s.status === "valid" ? 50 : s.status === "marginal" ? 10 : 0) -
        s.fromCenter * 10;
      return score(b) - score(a);
    });
  }, [weResults]);

  const bestTube = tubeRecs.find((r) => r.status === "optimal" || r.status === "valid");
  const hasOptimal = tubeRecs.some((r) => r.status === "optimal");

  if (!gas) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[10px] text-amber-700 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        Select a gas from the Gas Database above to calculate Water Equivalent and tube size recommendation.
      </div>
    );
  }

  if (!weResults) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[10px] text-gray-500 flex items-center gap-2">
        <Droplets className="w-4 h-4 shrink-0" />
        Enter a flow rate to calculate Water Equivalent and tube size recommendation.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ─── WE Summary Card ─── */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-bold text-blue-800 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5" /> Water Equivalent (WE) — Tube Sizing Basis
          </h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[9px] text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
          >
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showDetails ? "Hide" : "Details"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-white rounded p-2 text-center border border-blue-100">
            <div className="text-[8px] text-gray-500 uppercase">WE (Norm)</div>
            <div className="text-[13px] font-bold text-blue-700">{weResults.weNorm.toFixed(1)}</div>
            <div className="text-[7px] text-gray-400">LPH</div>
          </div>
          <div className="bg-white rounded p-2 text-center border border-blue-100">
            <div className="text-[8px] text-gray-500 uppercase">WE Range</div>
            <div className="text-[11px] font-bold text-blue-600">
              {weResults.weMin.toFixed(0)} — {weResults.weMax.toFixed(0)}
            </div>
            <div className="text-[7px] text-gray-400">LPH</div>
          </div>
          <div className="bg-white rounded p-2 text-center border border-blue-100">
            <div className="text-[8px] text-gray-500 uppercase">FCF</div>
            <div className="text-[11px] font-bold text-indigo-600">{weResults.fcf.toFixed(4)}</div>
            <div className="text-[7px] text-gray-400">Float Corr.</div>
          </div>
          <div className="bg-white rounded p-2 text-center border border-blue-100">
            <div className="text-[8px] text-gray-500 uppercase">GCF</div>
            <div className="text-[11px] font-bold text-indigo-600">{weResults.gcf.toFixed(6)}</div>
            <div className="text-[7px] text-gray-400">Gas Corr.</div>
          </div>
        </div>

        {showDetails && (
          <div className="mt-2 bg-white rounded p-2 border border-blue-100 text-[8px] text-gray-600 space-y-1">
            <div><strong>Formula:</strong> {weResults.formula}</div>
            <div>{weResults.formulaDetail}</div>
            <div>{weResults.note}</div>
          </div>
        )}

        {weResults.warning && (
          <div className="mt-2 text-[8px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-1.5">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            {weResults.warning}
          </div>
        )}
      </div>

      {/* ─── Tube Size Recommendation ─── */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-gray-700 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-red-600" /> Tube Size Recommendation (Based on WE)
          </h3>
          {bestTube && (
            <span
              className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                hasOptimal ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
              }`}
            >
              {hasOptimal ? "★ Optimal" : "✓ Valid"} — {bestTube.size}
            </span>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {tubeRecs.slice(0, 6).map((rec) => {
            const isBest = bestTube?.size === rec.size;
            const statusColors: Record<string, string> = {
              optimal: "border-l-4 border-green-500 bg-green-50/50",
              valid: "border-l-4 border-blue-400 bg-blue-50/30",
              marginal: "border-l-4 border-yellow-400 bg-yellow-50/30",
              rejected: "border-l-4 border-gray-300 opacity-60",
            };
            return (
              <div
                key={rec.size}
                className={`px-3 py-2 flex items-center justify-between ${statusColors[rec.status]} ${isBest ? "ring-1 ring-green-300" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-800 w-12">{rec.size}</span>
                  <span className="text-[8px] text-gray-500">
                    {rec.qMin}-{rec.qMax} LPH
                  </span>
                  {rec.dpMax > 0 && <span className="text-[7px] text-gray-400">ΔP: {rec.dpMax.toFixed(3)} bar</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[8px] font-bold ${
                      rec.status === "optimal"
                        ? "text-green-700"
                        : rec.status === "valid"
                          ? "text-blue-600"
                          : rec.status === "marginal"
                            ? "text-yellow-700"
                            : "text-gray-400"
                    }`}
                  >
                    {rec.status === "optimal"
                      ? "★ OPTIMAL"
                      : rec.status === "valid"
                        ? "✓ VALID"
                        : rec.status === "marginal"
                          ? "⚠ MARGINAL"
                          : "✗"}
                  </span>
                  {isBest && <CheckCircle className="w-3.5 h-3.5 text-green-600" />}
                </div>
              </div>
            );
          })}
        </div>

        {!bestTube && (
          <div className="p-3 text-center text-[9px] text-red-600 bg-red-50">
            <AlertTriangle className="w-4 h-4 mx-auto mb-1" />
            No suitable tube size found for WE {weResults.weNorm.toFixed(1)} LPH.
            <br />
            Check your flow rate and gas density inputs.
          </div>
        )}
      </div>

      {/* ─── Recommendation Note ─── */}
      {bestTube && (
        <div
          className={`rounded-lg p-2.5 text-[9px] ${
            hasOptimal
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-blue-50 border border-blue-200 text-blue-800"
          }`}
        >
          <strong>Recommendation:</strong> Use <strong>{bestTube.size} Glass Tube Rotameter</strong> for{" "}
          {gas.name} at {weResults.weNorm.toFixed(1)} LPH WE
          {bestTube.status === "marginal" && " — verify with factory for marginal conditions"}.
          {pipeSize && pipeSize !== bestTube.size && (
            <span className="block mt-1 text-amber-700">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              Note: Line size is {pipeSize} — recommended tube is {bestTube.size}. Use reducers if needed.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
