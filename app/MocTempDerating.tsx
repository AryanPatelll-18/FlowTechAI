// ============================================================
// P1.2: Temperature-MOC Compatibility & Pressure Derating
// Warns when operating temperature approaches MOC limits
// ============================================================

import { Thermometer, AlertTriangle, ShieldCheck } from "lucide-react";

interface Props {
  operatingTemp: number;
  operatingPressureBar: number;
}

// Temperature limits per material (°C)
const MOC_TEMP_LIMITS: Record<string, { maxTemp: number; note?: string }> = {
  "PTFE": { maxTemp: 130, note: "Above 130°C: PTFE creeps and loses dimensional stability" },
  "PFA": { maxTemp: 180, note: "High-purity alternative to PTFE for up to 180°C" },
  "Hard Rubber": { maxTemp: 80, note: "Neoprene/Ebonite: hardens and cracks above 80°C" },
  "Ceramic": { maxTemp: 500, note: "Extreme abrasion/heat — use for slurries >180°C" },
  "Polyurethane": { maxTemp: 60, note: "Abrasion-resistant but limited temperature range" },
  "SS 304": { maxTemp: 400, note: "General purpose — chloride SCC risk >60°C with chlorides" },
  "SS 316": { maxTemp: 400, note: "Superior to 304 for corrosive service" },
  "SS 316L": { maxTemp: 400, note: "Low-carbon variant — better weld corrosion resistance" },
  "SS 410": { maxTemp: 350, note: "Martensitic — magnetic, used for turbine rotors only" },
  "Hastelloy C": { maxTemp: 400, note: "Excellent for strong acids and chlorides" },
  "Hastelloy C22": { maxTemp: 450, note: "Improved version of C — better versatility" },
  "Tantalum": { maxTemp: 200, note: "Unmatched acid resistance but limited to 200°C" },
  "Titanium": { maxTemp: 300, note: "Excellent for seawater/brine — not for >40°C strong acids" },
  "Tungsten Carbide": { maxTemp: 400, note: "For abrasive service bearings/shafts" },
  "Carbon Steel": { maxTemp: 200, note: "Water/non-corrosive only — rusts above 80°C with moisture" },
  "Carbon Graphite": { maxTemp: 200, note: "Self-lubricating bearing — not for oxidizing environments" },
  "Borosilicate Glass": { maxTemp: 93, note: "Glass tube rotameter limit — thermal shock risk" },
  "Aluminium": { maxTemp: 150, note: "Lightweight — not for caustic or acidic environments" },
  "PP": { maxTemp: 80, note: "Polypropylene — low-cost for dilute acids/alkalis" },
};

export default function MocTempDerating({ operatingTemp, operatingPressureBar: _operatingPressureBar }: Props) {
  // Check all MOC materials against operating temperature
  const warnings: { material: string; maxTemp: number; severity: "ok" | "warn" | "critical"; message: string }[] = [];

  for (const [material, data] of Object.entries(MOC_TEMP_LIMITS)) {
    const margin = data.maxTemp - operatingTemp;
    if (margin < 0) {
      warnings.push({
        material,
        maxTemp: data.maxTemp,
        severity: "critical",
        message: `${material}: Operating ${operatingTemp}°C EXCEEDS max ${data.maxTemp}°C — ${data.note || "Material will fail"}`,
      });
    } else if (margin < 20) {
      warnings.push({
        material,
        maxTemp: data.maxTemp,
        severity: "warn",
        message: `${material}: Only ${margin.toFixed(0)}°C margin to max ${data.maxTemp}°C — ${data.note || ""}`,
      });
    }
  }

  if (warnings.length === 0) {
    return (
      <div className="mt-2 bg-green-50 border border-green-200 rounded-md px-3 py-1.5 flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
        <span className="text-[10px] text-green-700">
          All MOC materials compatible at {operatingTemp}°C (≥20°C safety margin)
        </span>
      </div>
    );
  }

  const hasCritical = warnings.some((w) => w.severity === "critical");

  return (
    <div className={`mt-2 rounded-md overflow-hidden border ${hasCritical ? "bg-red-50 border-red-300" : "bg-orange-50 border-orange-300"}`}>
      <div className={`px-3 py-1.5 flex items-center gap-2 ${hasCritical ? "bg-red-100/80" : "bg-orange-100/80"}`}>
        <Thermometer className={`w-3.5 h-3.5 ${hasCritical ? "text-red-600" : "text-orange-600"}`} />
        <span className={`text-[11px] font-bold ${hasCritical ? "text-red-800" : "text-orange-800"}`}>
          Temperature-MOC Compatibility @ {operatingTemp}°C
        </span>
      </div>
      <div className="px-3 py-2 space-y-1">
        {warnings.map((w) => (
          <div key={w.material} className="flex items-start gap-1.5">
            {w.severity === "critical" ? (
              <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" />
            )}
            <span className={`text-[10px] ${w.severity === "critical" ? "text-red-700 font-semibold" : "text-orange-700"}`}>
              {w.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
