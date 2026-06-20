// ============================================================
// ROTAMETER RESULTS — Safely rendered with error boundaries
// Prevents blank page crashes from type mismatches or bad data
// ============================================================

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Droplets, AlertTriangle, ChevronDown, ChevronUp,
} from "lucide-react";
import type { RotameterResult, RotameterSizeResult } from "../hooks/useCalculator";
import ProductSpecsInline from "./ProductSpecsInline";
import WaterEquivalentPanel from "./WaterEquivalentPanel";

interface Props {
  rotameterResults: RotameterResult[];
  flowUnit: string;
  operatingTemp: number;
  density: number;
  specificGravity: number;
  flowRateMax: number;
  service?: "liquid" | "gas" | "steam";
}

/** Simple unit display — no conversion for rotameters (already in display unit) */
function displayValue(val: number | undefined | null): string {
  if (val === undefined || val === null || Number.isNaN(val)) return "—";
  return val.toFixed(3);
}

/** Single rotameter product card */
function RotameterProductCard({
  rt,
  flowUnit,
}: {
  rt: RotameterResult;
  flowUnit: string;
}) {
  const [expanded, setExpanded] = useState(true);

  // Defensive: ensure sizes is an array
  const allSizes = Array.isArray(rt.sizes) ? rt.sizes : [];
  const goodSizes = allSizes.filter(
    (s) => s.status === "optimal" || s.status === "valid" || s.status === "partial-low" || s.status === "partial-high"
  );
  const displaySizes = goodSizes.length > 0 ? goodSizes : allSizes.slice(0, 3);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Product Header */}
      <div
        className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-amber-50 gap-1 sm:gap-0 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <div>
            <h3 className="font-semibold text-sm">
              {rt.product?.name || "Unknown Rotameter"}
              {rt.product?.accuracy && (
                <Badge className="ml-2 text-[10px] bg-gray-800 text-white px-1.5 py-0">
                  ±{rt.product.accuracy}% FSD
                </Badge>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              {goodSizes.length > 0
                ? `${goodSizes.length} matching size${goodSizes.length > 1 ? "s" : ""} · Best: ${rt.bestSize || "—"}`
                : allSizes.length > 0
                  ? `Flow outside range · Range: ${displayValue(allSizes[0]?.qMin)}–${displayValue(allSizes[allSizes.length - 1]?.qMax)} ${flowUnit}`
                  : "No sizes available"
              }
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-amber-500" /> : <ChevronDown className="w-4 h-4 text-amber-500" />}
      </div>

      {expanded && (
        <div className="p-3 bg-white">
          {/* No matching sizes message */}
          {goodSizes.length === 0 && allSizes.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
              <p className="text-xs text-amber-700 flex items-start gap-1">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Your flow rate is outside this rotameter range.</span>
              </p>
            </div>
          )}

          {/* Size Table */}
          {displaySizes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs uppercase">
                    <th className="text-left px-2 py-1.5">PG Code</th>
                    <th className="text-left px-2 py-1.5">Connection</th>
                    <th className="text-right px-2 py-1.5">Qmin ({flowUnit})</th>
                    <th className="text-right px-2 py-1.5">Qmax ({flowUnit})</th>
                    <th className="text-right px-2 py-1.5">Range</th>
                    <th className="text-right px-2 py-1.5 bg-blue-50 border-x border-blue-200">±Uncert. (%FSD)</th>
                    <th className="text-right px-2 py-1.5">ΔP (bar)</th>
                    <th className="text-left px-2 py-1.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displaySizes.map((size) => (
                    <tr
                      key={String(size.size)}
                      className={`border-b last:border-0 ${size.status === "optimal" ? "bg-green-50" : ""} ${goodSizes.length === 0 ? "opacity-50" : ""}`}
                    >
                      <td className="px-2 py-1.5 font-mono text-xs font-bold text-amber-700">
                        {rt.bestSize === size.size && <span className="text-gray-900 mr-1">▸</span>}
                        {size.size}
                        {size.status === "optimal" && <span className="text-green-600 ml-1">★</span>}
                      </td>
                      <td className="px-2 py-1.5 text-[10px] text-muted-foreground whitespace-nowrap">
                        {(size as RotameterSizeResult).processConnection || "—"}
                      </td>
                      <td className="px-2 py-1.5 text-xs tabular-nums text-right text-muted-foreground">
                        {displayValue(size.qMin)}
                      </td>
                      <td className="px-2 py-1.5 text-xs tabular-nums text-right text-muted-foreground">
                        {displayValue(size.qMax)}
                      </td>
                      <td className="px-2 py-1.5 text-xs tabular-nums text-right font-medium text-amber-700">10:1</td>
                      <td className="px-2 py-1.5 text-xs tabular-nums text-right font-medium bg-blue-50 border-x border-blue-100">
                        ±{displayValue((size as any).uncertaintyPercent)}%
                      </td>
                      <td className="px-2 py-1.5 text-xs tabular-nums text-right text-muted-foreground">
                        {size.dpAtInput < 0.001 ? "<0.001" : displayValue(size.dpAtInput)}
                      </td>
                      <td className="px-2 py-1.5">
                        {size.status === "optimal" ? (
                          <Badge className="bg-green-600 text-white text-[10px] px-1.5 py-0">Optimal</Badge>
                        ) : size.status === "valid" ? (
                          <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">Valid</Badge>
                        ) : (
                          <Badge className="bg-gray-300 text-gray-600 text-[10px] px-1.5 py-0">{size.status}</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-500">No size data available for this rotameter.</p>
          )}

          {allSizes.length > 0 && (
            <p className="text-[10px] text-muted-foreground mt-2">
              Display unit: {flowUnit} · 10:1 turndown ratio · ΔP at input flow
            </p>
          )}

          {/* Product Specs */}
          {rt.product && (
            <ProductSpecsInline product={rt.product} bestSize={null} />
          )}
        </div>
      )}
    </div>
  );
}

/** Main exported component with error boundary */
export default function RotameterResults({
  rotameterResults,
  flowUnit,
  operatingTemp,
  density,
  specificGravity,
  flowRateMax,
  service = "liquid",
}: Props) {
  const [hasError, setHasError] = useState(false);

  // Runtime error boundary
  if (hasError) {
    return (
      <Card className="border-red-300">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 text-red-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-bold">Rotameter Display Error</p>
              <p className="text-xs text-red-600 mt-1">
                An error occurred while rendering rotameter results. The sizing calculation completed successfully.
                Please try refreshing the page or contact support.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  try {
    // Defensive: ensure we have valid results
    if (!Array.isArray(rotameterResults) || rotameterResults.length === 0) {
      return null;
    }

    return (
      <Card className="border-amber-300">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Droplets className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="text-base sm:text-lg">
                Glass Tube Rotameters (Variable Area)
                {service === "gas" && " — Gas Service (WE Based)"}
              </span>
              <Badge className="ml-2 text-[10px] bg-amber-100 text-amber-700 border-amber-300 px-1.5 py-0">
                {service === "gas" ? "Water Equivalent Sizing" : "Separate Sizing"}
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {service === "gas"
                ? "Variable Area flowmeters for gas — sized via Water Equivalent (WE). Factory water-calibrated tables matched against calculated WE. Max 120°C."
                : "Variable Area flowmeters — sized by float/tube (PG code), NOT by pipe velocity. Visual indication. Max 120°C. For clean, non-turbulent liquids."}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rotameterResults.map((rt, idx) => (
            <RotameterProductCard
              key={rt.product?.name || `rt-${idx}`}
              rt={rt}
              flowUnit={flowUnit}
            />
          ))}

          {/* Water Equivalent Calculator */}
          {flowRateMax > 0 && (
            <WaterEquivalentPanel
              actualFlowRate={parseFloat(String(flowRateMax)) || 0}
              flowUnit={flowUnit}
              processFluidDensity={density}
              processFluidSG={specificGravity}
              service={service === "gas" ? "gas" : "liquid"}
              processTempC={operatingTemp}
              processPressureBara={service === "gas" ? 2.0 : 1.013}
            />
          )}

          {/* Gas WE Info Summary */}
          {service === "gas" && rotameterResults[0]?.weInfo && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-[11px] font-bold text-blue-800 flex items-center gap-1.5 mb-2">
                <Droplets className="w-3.5 h-3.5" /> Water Equivalent (WE) — Sizing Basis
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded p-2 text-center border border-blue-100">
                  <div className="text-[8px] text-gray-500 uppercase">WE (Norm)</div>
                  <div className="text-[13px] font-bold text-blue-700">{rotameterResults[0].weInfo!.weNorm.toFixed(1)}</div>
                  <div className="text-[7px] text-gray-400">LPH</div>
                </div>
                <div className="bg-white rounded p-2 text-center border border-blue-100">
                  <div className="text-[8px] text-gray-500 uppercase">FCF</div>
                  <div className="text-[11px] font-bold text-indigo-600">{rotameterResults[0].weInfo!.fcf.toFixed(4)}</div>
                  <div className="text-[7px] text-gray-400">Float Corr.</div>
                </div>
                <div className="bg-white rounded p-2 text-center border border-blue-100">
                  <div className="text-[8px] text-gray-500 uppercase">GCF</div>
                  <div className="text-[11px] font-bold text-indigo-600">{rotameterResults[0].weInfo!.gcf.toFixed(6)}</div>
                  <div className="text-[7px] text-gray-400">Gas Corr.</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  } catch (err) {
    console.error("RotameterResults render error:", err);
    setHasError(true);
    return null;
  }
}
