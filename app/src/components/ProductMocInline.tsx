// ============================================================
// ProductMocInline — Displays MOC contact parts for ONE product
// Embedded inside each product's sizing result card
// ============================================================

import { FlaskConical } from "lucide-react";
import type { MocRecommendation } from "../data/mocEngine";
import MocTempDerating from "./MocTempDerating";

interface Props {
  moc: MocRecommendation;
  productKey: string; // "emf" | "vortex" | "turbine" | "rotameter" | "ovalGear" | "ultrasonic"
  operatingTemp?: number;
  operatingPressureBar?: number;
}

// ── Contact parts per product (ONLY the specified contact parts) ──
const PRODUCT_PARTS: Record<string, { label: string; parts: string[] }> = {
  emf: {
    label: "Electromagnetic Flowmeter — Materials of Construction",
    parts: ["emfLiner", "emfElectrode"],
  },
  vortex: {
    label: "Vortex Flowmeter — Materials of Construction",
    parts: ["vortexBodyMoc", "vortexShredder"],
  },
  turbine: {
    label: "Turbine Flowmeter — Materials of Construction",
    parts: ["turbineFlowpipeMoc", "turbineRotor", "turbineStopper"],
  },
  rotameter: {
    label: "Glass Tube Rotameter — Materials of Construction",
    parts: ["rotameterFloat", "rotameterFloatRetainer", "rotameterEndFitting"],
  },
  ovalGear: {
    label: "Digital Oval Gear Flowmeter — Materials of Construction",
    parts: ["ovalGearRotor", "ovalGearShaft"],
  },
  ultrasonic: {
    label: "Ultrasonic Flowmeter — Materials of Construction",
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
};

function detectSpecialAlloy(value: string): boolean {
  return (
    value.includes("Hastelloy") ||
    value.includes("Tantalum") ||
    value.includes("Titanium") ||
    value.includes("Ceramic") ||
    value.includes("PTFE") ||
    value.includes("Teflon")
  );
}

export default function ProductMocInline({ moc, productKey, operatingTemp, operatingPressureBar }: Props) {
  const config = PRODUCT_PARTS[productKey];
  if (!config) return null;

  const mocAny = moc as unknown as Record<string, string[]>;
  const parts = config.parts.filter(
    (pk) => pk in moc && Array.isArray(mocAny[pk]) && mocAny[pk].length > 0
  );
  if (parts.length === 0) return null;

  return (
    <div className="mt-3 bg-red-50/60 border border-red-200 rounded-md overflow-hidden">
      {/* Header */}
      <div className="bg-red-100/80 px-3 py-1.5 flex items-center gap-2">
        <FlaskConical className="w-3.5 h-3.5 text-red-600" />
        <span className="text-[11px] font-bold text-red-800">
          AI MOC Recommendation — Contact Parts
        </span>
      </div>

      {/* Contact parts table */}
      <table className="w-full text-sm">
        <tbody>
          {parts.map((partKey, idx) => {
            const values = mocAny[partKey];
            return (
              <tr
                key={partKey}
                className={`border-b border-red-100 last:border-0 ${
                  idx % 2 === 0 ? "bg-white/60" : "bg-red-50/30"
                }`}
              >
                <td className="px-3 py-1.5 text-[11px] text-gray-600 font-medium w-40 shrink-0">
                  {PART_LABELS[partKey]}
                </td>
                <td className="px-3 py-1.5">
                  <div className="flex flex-wrap gap-1">
                    {values.map((v, i) => {
                      const isPrimary = i === 0;
                      const isSpecial = detectSpecialAlloy(v);
                      return (
                        <span
                          key={i}
                          className={`text-[11px] px-2 py-0.5 rounded border ${
                            isPrimary
                              ? "bg-red-50 text-red-800 font-semibold border-red-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          } ${isSpecial ? "ring-1 ring-purple-300" : ""}`}
                        >
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

      {/* P1.2: Temperature-MOC Compatibility Check */}
      {operatingTemp !== undefined && (
        <MocTempDerating
          operatingTemp={operatingTemp}
          operatingPressureBar={operatingPressureBar || 1.013}
        />
      )}
    </div>
  );
}
