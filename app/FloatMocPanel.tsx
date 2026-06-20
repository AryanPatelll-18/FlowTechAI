import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  findFloatMocRule,
  getValidCombinations,
  getBestRecommendation,
  FLOAT_MOCS,
  INDICATOR_TYPES,
} from "../data/floatMocSelector";
import type { FloatMOC, IndicatorType } from "../data/floatMocSelector";
import {
  Droplets,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Sparkles,
  Beaker,
} from "lucide-react";

/** Pre-defined common fluids with their SG */
const FLUID_PRESETS = [
  { name: "Gasoline", sg: 0.75 },
  { name: "Kerosene", sg: 0.81 },
  { name: "Diesel", sg: 0.85 },
  { name: "Lube Oil", sg: 0.88 },
  { name: "Acetone", sg: 0.79 },
  { name: "Methanol", sg: 0.79 },
  { name: "Ammonia (liquid)", sg: 0.77 },
  { name: "Water (20°C)", sg: 1.0 },
  { name: "Sea Water", sg: 1.025 },
  { name: "Dilute HCl (10%)", sg: 1.05 },
  { name: "Caustic Soda (20%)", sg: 1.22 },
  { name: "H2SO4 (50%)", sg: 1.40 },
  { name: "Glycerine", sg: 1.26 },
  { name: "Milk", sg: 1.03 },
  { name: "Honey", sg: 1.42 },
];

export default function FloatMocPanel() {
  const [density, setDensity] = useState<string>("1.0");
  const [selectedFluid, setSelectedFluid] = useState<string>("Water (20°C)");

  const sg = parseFloat(density) || 0;
  const rule = useMemo(() => findFloatMocRule(sg), [sg]);
  const validCombos = useMemo(() => getValidCombinations(sg), [sg]);
  const bestRec = useMemo(() => getBestRecommendation(sg), [sg]);

  const isValid = (fm: FloatMOC, ind: IndicatorType) =>
    rule?.combinations[fm][ind] ?? false;

  const handleFluidSelect = (name: string, sgValue: number) => {
    setSelectedFluid(name);
    setDensity(String(sgValue));
  };

  // Status badge color
  const statusColor = (valid: boolean) =>
    valid
      ? "bg-green-100 text-green-700 border-green-300"
      : "bg-red-100 text-red-700 border-red-300";

  const cellBg = (valid: boolean) =>
    valid ? "bg-green-50 border-green-300" : "bg-red-50 border-red-200";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Beaker className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Float MOC Selector</h2>
            <p className="text-[11px] text-blue-100">
              Application-Based Verification — Side Mounted & Top Mounted Magnetic Level Gauge ONLY
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Density Input + Presets */}
        <div className="lg:col-span-1 space-y-4">
          {/* Density Input */}
          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-600" />
                Fluid Specific Gravity (SG)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">
                  Enter SG value (0.45 — 2.0)
                </Label>
                <Input
                  type="number"
                  value={density}
                  onChange={(e) => {
                    setDensity(e.target.value);
                    setSelectedFluid("Custom");
                  }}
                  min={0.45}
                  max={2.0}
                  step={0.01}
                  className="text-lg font-bold text-blue-700"
                />
              </div>

              {sg > 0 && (
                <div className={`rounded-lg p-3 border ${
                  sg < 0.75
                    ? "bg-red-50 border-red-300"
                    : sg < 1.0
                    ? "bg-amber-50 border-amber-300"
                    : "bg-green-50 border-green-300"
                }`}>
                  <div className="flex items-center gap-2">
                    {sg < 0.75 ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-600" />
                    )}
                    <span className={`text-xs font-bold ${
                      sg < 0.75 ? "text-red-700" : "text-blue-700"
                    }`}>
                      {rule ? `Range: ${rule.densityLabel}` : sg < 0.75 ? "Below Standard Range" : "SG Valid"}
                    </span>
                  </div>
                  {sg < 0.75 && (
                    <p className="text-[10px] text-red-600 mt-1">
                      SG {sg.toFixed(2)} is below 0.75. Special low-density float required — consult Flowtech.
                    </p>
                  )}
                </div>
              )}

              {/* Best Recommendation */}
              {bestRec && (
                <div className="rounded-lg border border-green-300 bg-green-50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold text-green-700">Best Recommendation</span>
                  </div>
                  <div className="text-sm font-bold text-green-800">
                    {bestRec.floatMoc} + {bestRec.indicator}
                  </div>
                  <p className="text-[10px] text-green-600 mt-1">{bestRec.reason}</p>
                </div>
              )}

              {/* Valid Count */}
              <div className="flex items-center gap-2">
                <Badge className={validCombos.length > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {validCombos.length} of 9 combinations valid
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Fluid Presets */}
          <Card className="border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Beaker className="w-4 h-4 text-gray-600" />
                Common Fluids
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-1 gap-1">
                {FLUID_PRESETS.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => handleFluidSelect(f.name, f.sg)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors ${
                      selectedFluid === f.name
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "hover:bg-gray-50 text-gray-600 border border-transparent"
                    }`}
                  >
                    <span className="font-medium">{f.name}</span>
                    <span className="text-gray-400">SG {f.sg.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Selection Matrix */}
        <div className="lg:col-span-2 space-y-4">
          {/* Matrix Card */}
          <Card className="border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Float MOC — Indicator Type Matrix
                <span className="text-[10px] text-gray-400 font-normal ml-auto">
                  SG = {sg.toFixed(2)} — {rule?.densityLabel || "N/A"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  {/* Header Row */}
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 text-left text-gray-500 font-semibold border-b w-24">Float MOC \ Indicator</th>
                      {INDICATOR_TYPES.map((ind) => (
                        <th key={ind} className="px-3 py-2 text-center text-gray-700 font-bold border-b w-1/3">
                          {ind}
                          <div className="text-[9px] text-gray-400 font-normal">
                            {ind === "Capsule" && "Toughened Glass"}
                            {ind === "Roller" && "Aluminum Flags"}
                            {ind === "Flapper" && "SS Flags"}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FLOAT_MOCS.map((fm) => (
                      <tr key={fm} className="border-b last:border-0 hover:bg-gray-50/50">
                        <td className="px-3 py-3 font-bold text-gray-700 border-r bg-gray-50/50">
                          {fm}
                          <div className="text-[9px] text-gray-400 font-normal">
                            {fm === "SS 316" && "Standard"}
                            {fm === "Titanium" && "Premium"}
                            {fm === "PP / PTFE" && "Corrosion Resistant"}
                          </div>
                        </td>
                        {INDICATOR_TYPES.map((ind) => {
                          const valid = isValid(fm, ind);
                          const isBest = bestRec?.floatMoc === fm && bestRec?.indicator === ind;
                          return (
                            <td
                              key={`${fm}-${ind}`}
                              className={`px-3 py-3 text-center border-r last:border-r-0 ${cellBg(valid)} ${isBest ? "ring-2 ring-green-500 ring-inset" : ""}`}
                            >
                              <div className="flex flex-col items-center gap-1">
                                {valid ? (
                                  <>
                                    <CheckCircle2 className={`w-6 h-6 ${isBest ? "text-green-600" : "text-green-500"}`} />
                                    <Badge className={`text-[8px] px-1.5 py-0 ${statusColor(true)}`}>
                                      {isBest ? "BEST" : "OK"}
                                    </Badge>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-6 h-6 text-red-400" />
                                    <Badge className={`text-[8px] px-1.5 py-0 ${statusColor(false)}`}>
                                      NO
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </td>
                          );
                        })}
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 px-4 py-2 border-t bg-gray-50/50">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className="w-3 h-3 rounded-sm bg-green-50 border border-green-300 inline-block" />
                  Suitable
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className="w-3 h-3 rounded-sm bg-red-50 border border-red-200 inline-block" />
                  Not Suitable
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className="w-3 h-3 rounded-sm bg-green-50 border-2 border-green-500 inline-block" />
                  Best Recommendation
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valid Combinations List */}
          {validCombos.length > 0 && (
            <Card className="border-green-200 bg-green-50/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  All Valid Combinations ({validCombos.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {validCombos.map((combo, i) => (
                    <div
                      key={i}
                      className={`rounded-lg p-2.5 border ${
                        bestRec?.floatMoc === combo.floatMoc && bestRec?.indicator === combo.indicator
                          ? "bg-green-100 border-green-400"
                          : "bg-white border-green-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        <span className="text-xs font-bold text-gray-800">
                          {combo.floatMoc} + {combo.indicator}
                        </span>
                      </div>
                      {combo.notes && (
                        <p className="text-[9px] text-gray-500 mt-1 pl-5.5">{combo.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No valid combinations warning */}
          {validCombos.length === 0 && sg >= 0.45 && (
            <Card className="border-red-300 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-700">No Standard Float MOC Suitable</p>
                    <p className="text-xs text-red-600 mt-1">
                      For SG {sg.toFixed(2)}, none of the standard Float MOC + Indicator combinations are suitable.
                      {sg < 0.75
                        ? " A special low-density float design is required. Please contact Flowtech Engineering."
                        : " Please verify the fluid density value or contact Flowtech for custom float design."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Notes */}
          <Card className="border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Technical Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <div className="text-[11px] text-gray-600 space-y-1.5">
                <p className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0">1.</span>
                  <span>This matrix is <strong>ONLY for Side Mounted and Top Mounted Magnetic Level Gauge</strong>. Do not use for other level measurement devices.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0">2.</span>
                  <span><strong>Specific Gravity (SG)</strong> is the ratio of fluid density to water density at 4°C. For accurate float selection, always use the <em>minimum operating SG</em> (at highest process temperature).</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0">3.</span>
                  <span><strong>Capsule indicator</strong> uses toughened glass tube with magnetic capsule shuttle — ideal for chemical applications.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0">4.</span>
                  <span><strong>Roller indicator</strong> uses aluminum flags on a roller track — best for outdoor/bright environments.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0">5.</span>
                  <span><strong>Flapper indicator</strong> uses SS flags that flip 180° — most durable, visible from 50+ meters.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0">6.</span>
                  <span><strong>Titanium float</strong> is recommended for corrosive media (acids, chlorides, seawater) where SS 316 is insufficient.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0">7.</span>
                  <span><strong>PP/PTFE float</strong> requires SG ≥ 1.0 due to lower float density. For highly corrosive applications only.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0">8.</span>
                  <span>For SG below 0.75, a <strong>special low-density float</strong> must be designed — consult Flowtech Engineering with full process data.</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
