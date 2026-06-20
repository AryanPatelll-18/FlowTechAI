// ============================================================
// ProductSpecsInline — P0: Standards + Installation Requirements
// Displays inline with each product's sizing result
// ============================================================

import { BookOpen, Wrench, Ruler, AlertTriangle, ShieldCheck } from "lucide-react";
import type { ProductData } from "../data/factoryTables";
import type { SizeResult } from "../hooks/useCalculator";

interface Props {
  product: ProductData;
  bestSize?: SizeResult | null;
}

/** Calculate safety margin warning based on process flow position within meter range */
function getSafetyMarginWarning(
  bestSize: SizeResult | null,
  _safeMargin: number = 0.2
): { severity: "ok" | "warn" | "critical"; message: string } | null {
  if (!bestSize) return null;
  const range = bestSize.qMax - bestSize.qMin;
  if (range <= 0) return null;

  if (bestSize.distanceFromMedian > 0.4) {
    return {
      severity: "critical",
      message: `Flow is near the EDGE of meter range — consider next size for better reliability`,
    };
  }
  if (bestSize.distanceFromMedian > 0.25) {
    return {
      severity: "warn",
      message: `Flow is off-center — meter will work but accuracy is reduced`,
    };
  }
  return {
    severity: "ok",
    message: `Flow is well-centered within meter range — optimal accuracy`,
  };
}

export default function ProductSpecsInline({ product, bestSize }: Props) {
  const install = product.installation;
  const standards = product.standards;
  const turndown = product.recommendedTurndown;
  const margin = product.safeOperatingMargin ?? 0.2;
  const safety = getSafetyMarginWarning(bestSize || null, margin);

  if (!install && !standards) return null;

  return (
    <div className="mt-3 space-y-2">
      {/* Standards Compliance */}
      {standards && standards.length > 0 && (
        <div className="bg-blue-50/60 border border-blue-200 rounded-md overflow-hidden">
          <div className="bg-blue-100/80 px-3 py-1.5 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-bold text-blue-800">Standards Compliance</span>
          </div>
          <div className="px-3 py-1.5 flex flex-wrap gap-1.5">
            {standards.map((s) => (
              <span key={s} className="text-[10px] px-2 py-0.5 bg-white border border-blue-200 rounded text-blue-700 font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Installation Requirements */}
      {install && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-md overflow-hidden">
          <div className="bg-amber-100/80 px-3 py-1.5 flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-bold text-amber-800">Installation Requirements</span>
          </div>
          <div className="px-3 py-2 space-y-1.5">
            {/* Key specs grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center gap-1.5">
                <Ruler className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="text-[10px] text-gray-600">Upstream straight:</span>
                <span className="text-[10px] font-semibold text-gray-800">{install.straightRunUpstream}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Ruler className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="text-[10px] text-gray-600">Downstream straight:</span>
                <span className="text-[10px] font-semibold text-gray-800">{install.straightRunDownstream}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <span className="text-[10px] text-gray-600">Orientation:</span>
                <span className="text-[10px] font-semibold text-gray-800">{install.orientation}</span>
              </div>
              {install.upstreamFilter && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="text-[10px] font-medium text-amber-700">{install.upstreamFilter}</span>
                </div>
              )}
              {install.bypassRequired && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <ShieldCheck className="w-3 h-3 text-green-600 shrink-0" />
                  <span className="text-[10px] font-medium text-green-700">Bypass valve REQUIRED for maintenance</span>
                </div>
              )}
              {install.grounding && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                  <span className="text-[10px] font-medium text-red-700">{install.grounding}</span>
                </div>
              )}
            </div>
            {/* Additional notes */}
            {install.notes && install.notes.length > 0 && (
              <div className="space-y-0.5 pt-1 border-t border-amber-200">
                {install.notes.map((note, i) => (
                  <p key={i} className="text-[10px] text-amber-800 flex items-start gap-1">
                    <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                    <span>{note}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Safety Margin / Turndown Warning */}
      {(turndown || safety) && (
        <div className={`rounded-md overflow-hidden border ${
          safety?.severity === "critical" ? "bg-red-50 border-red-300" :
          safety?.severity === "warn" ? "bg-orange-50 border-orange-300" :
          "bg-green-50 border-green-300"
        }`}>
          <div className={`px-3 py-1.5 flex items-center gap-2 ${
            safety?.severity === "critical" ? "bg-red-100/80" :
            safety?.severity === "warn" ? "bg-orange-100/80" :
            "bg-green-100/80"
          }`}>
            <ShieldCheck className={`w-3.5 h-3.5 ${
              safety?.severity === "critical" ? "text-red-600" :
              safety?.severity === "warn" ? "text-orange-600" :
              "text-green-600"
            }`} />
            <span className={`text-[11px] font-bold ${
              safety?.severity === "critical" ? "text-red-800" :
              safety?.severity === "warn" ? "text-orange-800" :
              "text-green-800"
            }`}>
              Reliability Assessment
            </span>
          </div>
          <div className="px-3 py-2 space-y-1">
            {turndown && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600">Rated turndown:</span>
                <span className="text-[10px] font-semibold text-gray-800">{turndown}:1</span>
              </div>
            )}
            {safety && (
              <div className="flex items-start gap-1.5">
                {safety.severity === "critical" ? (
                  <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                ) : safety.severity === "warn" ? (
                  <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" />
                ) : (
                  <ShieldCheck className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
                )}
                <span className={`text-[10px] font-medium ${
                  safety.severity === "critical" ? "text-red-700" :
                  safety.severity === "warn" ? "text-orange-700" :
                  "text-green-700"
                }`}>{safety.message}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
