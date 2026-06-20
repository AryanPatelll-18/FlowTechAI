// ============================================================
// Phase II: Flowtech-Aligned MOC Recommendation Panel (V4)
// Displays ONLY the specified contact parts per meter type:
// 1. EMF: Liner + Electrode
// 2. Turbine: Flow Pipe + Impeller (SS410) + Stopper
// 3. Vortex: Flow Pipe + Shredder
// 4. Rotameter: Float + Float Retainer + Process Connection
// ============================================================

import { useState } from "react";
import { Shield, AlertTriangle, ChevronDown, ChevronUp, Info, FlaskConical, CheckCircle, Tag, Sparkles, AlertOctagon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MocRecommendation } from "../data/mocEngine";
import type { CalculationResult, RotameterResult } from "../hooks/useCalculator";

interface MocPanelProps {
  moc: MocRecommendation | null;
  fluidName: string;
  fluidFormula?: string;
  results: CalculationResult[];
  rotameterResults?: RotameterResult[];
}

const CORROSION_COLORS = {
  Low: { bg: "bg-green-50", border: "border-green-300", badge: "bg-green-100 text-green-800" },
  Medium: { bg: "bg-amber-50", border: "border-amber-300", badge: "bg-amber-100 text-amber-800" },
  High: { bg: "bg-orange-50", border: "border-orange-400", badge: "bg-orange-100 text-orange-800" },
  Extreme: { bg: "bg-red-100", border: "border-red-500", badge: "bg-red-200 text-red-900" },
};

// Product detection: map sizing result names to MOC product keys
function detectMocProduct(resultName: string): string | null {
  if (resultName.includes("Electromagnetic")) return "emf";
  if (resultName.includes("Vortex")) return "vortex";
  if (resultName.includes("Turbine")) return "turbine";
  if (resultName.includes("Oval Gear")) return "ovalGear";
  if (resultName.includes("Glass Tube") || resultName.includes("Rotameter")) return "rotameter";
  if (resultName.includes("Ultrasonic")) return "ultrasonic";
  return null;
}

// Product configurations — ONLY the contact parts specified by user
const PRODUCT_CONFIG: Record<string, { label: string; parts: string[] }> = {
  emf: {
    label: "Electromagnetic Flowmeter",
    // Liner MOC: PTFE or Rubber
    // Electrode MOC: SS 316L, Hastelloy-C22, Tantalum
    parts: ["emfLiner", "emfElectrode"],
  },
  vortex: {
    label: "Vortex Flowmeter",
    // Flow Pipe MOC: SS 316 or Higher
    // Shredder Part MOC: SS 316
    parts: ["vortexBodyMoc", "vortexShredder"],
  },
  turbine: {
    label: "Turbine Flowmeter",
    // Flow Pipe MOC: SS316 or Higher (non-magnetic)
    // Impeller MOC: SS 410 (Only Option)
    // Stopper MOC: SS 316 or Higher (non-magnetic)
    parts: ["turbineFlowpipeMoc", "turbineRotor", "turbineStopper"],
  },
  rotameter: {
    label: "Glass Tube Rotameter",
    // Float MOC: Teflon, SS 316, SS 316L
    // Float Retainer MOC: Teflon, SS 316, SS 316L
    // Process Connection MOC: PP, CS, SS 304, SS 316, SS 316L
    parts: ["rotameterFloat", "rotameterFloatRetainer", "rotameterEndFitting"],
  },
  ovalGear: {
    label: "Digital Oval Gear Flowmeter",
    parts: ["ovalGearRotor", "ovalGearShaft"],
  },
  ultrasonic: {
    label: "Ultrasonic Flowmeter",
    parts: ["ultrasonicHousing", "ultrasonicWettedParts"],
  },
};

const PART_LABELS: Record<string, string> = {
  // EMF
  emfLiner: "Liner MOC",
  emfElectrode: "Electrode MOC",
  // Turbine
  turbineFlowpipeMoc: "Flow Pipe MOC",
  turbineRotor: "Impeller MOC",
  turbineStopper: "Stopper MOC",
  // Vortex
  vortexBodyMoc: "Flow Pipe MOC",
  vortexShredder: "Shredder Part MOC",
  // Rotameter
  rotameterFloat: "Float MOC",
  rotameterFloatRetainer: "Float Retainer MOC",
  rotameterEndFitting: "Process Connection MOC",
  // Oval Gear
  ovalGearRotor: "Gear Rotor MOC",
  ovalGearShaft: "Gear Shaft MOC",
  // Ultrasonic
  ultrasonicHousing: "Sensor Housing",
  ultrasonicWettedParts: "Wetted Parts",
  // Common
  gaskets: "Gaskets / O-rings",
};

// Check if a material value contains a special alloy
function detectSpecialAlloy(value: string): string | null {
  if (value.includes("Hastelloy")) return "hastelloy";
  if (value.includes("Tantalum")) return "tantalum";
  if (value.includes("Titanium")) return "titanium";
  if (value.includes("Ceramic")) return "ceramic";
  if (value.includes("PTFE") || value.includes("Teflon")) return "ptfeLined";
  return null;
}

export default function MocPanel({ moc, fluidName, fluidFormula, results, rotameterResults }: MocPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showModelCodes, setShowModelCodes] = useState(false);

  if (!moc) return null;

  // Find which products were recommended by the sizing engine
  const activeProductKeys = new Set<string>();

  results
    .filter(r => r.status === "best" || r.status === "suitable" || r.status === "caution")
    .forEach(r => {
      const key = detectMocProduct(r.product.name);
      if (key) activeProductKeys.add(key);
    });

  if (rotameterResults && rotameterResults.length > 0) {
    rotameterResults.forEach(rr => {
      if (rr.bestSize) {
        const key = detectMocProduct(rr.product.name);
        if (key) activeProductKeys.add(key);
      }
    });
  }

  if (activeProductKeys.size === 0) return null;

  const colors = CORROSION_COLORS[moc.corrosionLevel];
  const hasWarnings = moc.warnings.length > 0;

  // Collect special alloy badges
  const alloyBadges: { key: string; label: string; color: string }[] = [];
  if (moc.specialAlloys.hastelloy) alloyBadges.push({ key: "hast", label: "Hastelloy 'C'", color: "bg-purple-100 text-purple-800 border-purple-300" });
  if (moc.specialAlloys.tantalum) alloyBadges.push({ key: "tant", label: "Tantalum", color: "bg-indigo-100 text-indigo-800 border-indigo-300" });
  if (moc.specialAlloys.titanium) alloyBadges.push({ key: "titan", label: "Titanium", color: "bg-sky-100 text-sky-800 border-sky-300" });
  if (moc.specialAlloys.ptfeLined) alloyBadges.push({ key: "ptfe", label: "PTFE/Teflon", color: "bg-teal-100 text-teal-800 border-teal-300" });
  if (moc.specialAlloys.ceramic) alloyBadges.push({ key: "cer", label: "Ceramic", color: "bg-stone-100 text-stone-800 border-stone-300" });

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} overflow-hidden shadow-sm`}>
      {/* Header */}
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between px-4 py-3 hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-3 flex-wrap">
          <Shield className="w-5 h-5 text-red-600 shrink-0" />
          <div className="text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900">Flowtech AI MOC Recommendation</span>
              <Badge className={`${colors.badge} text-xs font-bold`}>{moc.corrosionLevel} Corrosion Risk</Badge>
              {hasWarnings && (
                <Badge className="bg-red-100 text-red-700 text-xs border border-red-300">
                  <AlertTriangle className="w-3 h-3 mr-1" />{moc.warnings.length} Warning{moc.warnings.length > 1 ? "s" : ""}
                </Badge>
              )}
              {alloyBadges.length > 0 && (
                <Badge className="bg-purple-100 text-purple-700 text-xs border border-purple-300">
                  <Sparkles className="w-3 h-3 mr-1" />{alloyBadges.length} Special Alloy
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-2 flex-wrap">
              <FlaskConical className="w-3 h-3 inline" />
              {fluidName} {fluidFormula && `(${fluidFormula})`}
              <button
                onClick={(e) => { e.stopPropagation(); setShowModelCodes(!showModelCodes); }}
                className="text-blue-600 hover:text-blue-800 underline ml-1"
              >
                <Tag className="w-3 h-3 inline mr-0.5" />
                {showModelCodes ? "Hide" : "Show"} Model Codes
              </button>
            </div>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Special Alloy Badges */}
          {alloyBadges.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              <span className="text-xs font-semibold text-gray-700 mr-1">Special Alloys Required:</span>
              {alloyBadges.map(b => (
                <Badge key={b.key} className={`${b.color} text-xs font-bold`}>
                  <Sparkles className="w-3 h-3 mr-1" />{b.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Model Codes Display */}
          {showModelCodes && Object.keys(moc.modelCodes).length > 0 && (
            <div className="mb-3 bg-white rounded-md border border-blue-200 overflow-hidden">
              <div className="bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                Flowtech Ordering Model Codes
              </div>
              <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(moc.modelCodes).map(([key, code]) => (
                  <div key={key} className="bg-gray-50 rounded px-2 py-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-xs font-mono font-bold text-gray-800">{code}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {hasWarnings && (
            <div className="mb-3 space-y-2">
              {moc.warnings.map((w, i) => (
                <div key={i} className={`flex items-start gap-2 rounded-md px-3 py-2 border ${w.includes("CRITICAL") || w.includes("NEVER") ? "bg-red-100 border-red-400" : "bg-red-50 border-red-200"}`}>
                  {w.includes("CRITICAL") || w.includes("NEVER") ? (
                    <AlertOctagon className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  )}
                  <span className={`text-xs font-medium ${w.includes("CRITICAL") || w.includes("NEVER") ? "text-red-900" : "text-red-800"}`}>{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Per-product MOC tables — ONLY specified contact parts */}
          {Array.from(activeProductKeys).map(key => {
            const config = PRODUCT_CONFIG[key];
            if (!config) return null;
            const parts = config.parts.filter(pk => pk in moc && Array.isArray((moc as any)[pk]) && (moc as any)[pk].length > 0);
            if (parts.length === 0) return null;
            return (
              <div key={key} className="mb-3 bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gray-100 px-3 py-2 text-xs font-bold text-gray-800 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  {config.label}
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {parts.map((partKey, idx) => {
                      const values = (moc as any)[partKey] as string[];
                      return (
                        <tr key={partKey} className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                          <td className="px-3 py-2 text-xs text-gray-600 font-medium w-44 shrink-0">{PART_LABELS[partKey]}</td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1">
                              {values.map((v, i) => {
                                const alloy = detectSpecialAlloy(v);
                                const isPrimary = i === 0;
                                return (
                                  <span key={i} className={`text-xs px-2 py-0.5 rounded border ${isPrimary ? "bg-red-50 text-red-800 font-semibold border-red-200" : "bg-gray-100 text-gray-700 border-gray-200"} ${alloy ? "ring-1 ring-purple-300" : ""}`}>
                                    {v}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}

          {/* Common: Gaskets */}
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden mb-3 shadow-sm">
            <div className="bg-gray-100 px-3 py-2 text-xs font-bold text-gray-800">Common — All Products</div>
            <table className="w-full text-sm">
              <tbody>
                <tr className="bg-white">
                  <td className="px-3 py-2 text-xs text-gray-600 font-medium w-44">Gaskets / O-rings</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {moc.gaskets.map((v, i) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded border ${i === 0 ? "bg-red-50 text-red-800 font-semibold border-red-200" : "bg-gray-100 text-gray-700 border-gray-200"}`}>{v}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Special Notes */}
          {moc.specialNotes && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span className="text-xs text-blue-800">{moc.specialNotes}</span>
            </div>
          )}

          <div className="mt-2 text-[10px] text-gray-500 text-center leading-relaxed">
            AI-generated MOC aligned with Flowtech product catalogues. Red-highlighted = primary recommendation. Purple ring = special alloy.
            <br />Final MOC must be verified by a qualified corrosion engineer before ordering.
          </div>
        </div>
      )}
    </div>
  );
}
