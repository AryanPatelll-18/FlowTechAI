// ============================================================
// LevelDevicePanel — Main UI for Level Device Selection (Phase III)
// ============================================================

import { useState, useRef, useEffect } from "react";
import {
  Ruler, Gauge, Thermometer, FlaskConical, AlertTriangle,
  CheckCircle, XCircle, ShieldCheck, ChevronDown, ChevronUp,
  Droplets, Factory, Settings2, Search, Zap, Beaker,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { LevelCalculatorState } from "../hooks/useLevelCalculator";
import type { LevelDeviceRecommendation } from "../data/levelDeviceEngine";
import type { LevelOutputType } from "../data/levelDeviceDatabase";
import type { LiquidData } from "../data/liquids";
import { searchLiquids } from "../data/liquids";
import { detectLevelAnomalies, type ProcessAnomaly } from "../data/anomalyDetector";
import { ALL_LEVEL_DEVICES } from "../data/levelDeviceDatabase";
import FloatMocPanel from "./FloatMocPanel";

interface Props {
  state: LevelCalculatorState;
  bestDevices: LevelDeviceRecommendation[];
  suitableDevices: LevelDeviceRecommendation[];
  rejectedDevices: LevelDeviceRecommendation[];
  setMeasuringRange: (v: number) => void;
  setProcessPressure: (v: number) => void;
  setProcessTemp: (v: number) => void;
  setFluidDensity: (v: number) => void;
  setFluidViscosity: (v: number) => void;
  setSelectedLiquid: (liquid: LiquidData | null) => void;
  setRequiredOutput: (v: LevelOutputType | "any") => void;
  setMountingPreference: (v: "side" | "top" | "external" | "any") => void;
  toggleFlag: (flag: keyof LevelCalculatorState) => void;
  calculate: () => void;
  reset: () => void;
}

const STATUS_COLORS = {
  best: "bg-green-50 border-green-300",
  suitable: "bg-blue-50 border-blue-300",
  marginal: "bg-amber-50 border-amber-300",
  rejected: "bg-gray-100 border-gray-300 opacity-60",
};

const STATUS_BADGE = {
  best: "bg-green-600 text-white",
  suitable: "bg-blue-600 text-white",
  marginal: "bg-amber-500 text-white",
  rejected: "bg-gray-400 text-white",
};

// ─── Anomaly Panel Component ─────────────────────────────────────────────

function AnomalyPanel({ anomalies }: { anomalies: ProcessAnomaly[] }) {
  if (anomalies.length === 0) return null;

  const critical = anomalies.filter((a) => a.severity === "critical");
  const warning = anomalies.filter((a) => a.severity === "warning");
  const info = anomalies.filter((a) => a.severity === "info");

  const severityIcon = (s: ProcessAnomaly["severity"]) => {
    if (s === "critical") return <XCircle className="w-4 h-4 text-red-600 shrink-0" />;
    if (s === "warning") return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
    return <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />;
  };

  const severityBorder = (s: ProcessAnomaly["severity"]) => {
    if (s === "critical") return "border-red-300 bg-red-50";
    if (s === "warning") return "border-amber-300 bg-amber-50";
    return "border-blue-300 bg-blue-50";
  };

  const severityTitle = (s: ProcessAnomaly["severity"]) => {
    if (s === "critical") return "text-red-800";
    if (s === "warning") return "text-amber-800";
    return "text-blue-800";
  };

  const severityBadge = (s: ProcessAnomaly["severity"]) => {
    if (s === "critical") return "bg-red-200 text-red-800";
    if (s === "warning") return "bg-amber-200 text-amber-800";
    return "bg-blue-200 text-blue-800";
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className={`px-4 py-2.5 flex items-center justify-between ${critical.length > 0 ? "bg-red-100" : warning.length > 0 ? "bg-amber-100" : "bg-blue-100"}`}>
        <div className="flex items-center gap-2">
          <Factory className={`w-4 h-4 ${critical.length > 0 ? "text-red-600" : warning.length > 0 ? "text-amber-600" : "text-blue-600"}`} />
          <span className={`text-xs font-bold ${critical.length > 0 ? "text-red-800" : warning.length > 0 ? "text-amber-800" : "text-blue-800"}`}>
            Process Anomaly Detector — {anomalies.length} issue{anomalies.length > 1 ? "s" : ""} detected
          </span>
        </div>
        <div className="flex gap-1.5">
          {critical.length > 0 && (
            <Badge className="text-[9px] px-1.5 py-0 bg-red-200 text-red-800 font-bold border-red-300">{critical.length} Critical</Badge>
          )}
          {warning.length > 0 && (
            <Badge className="text-[9px] px-1.5 py-0 bg-amber-200 text-amber-800 font-bold border-amber-300">{warning.length} Warning</Badge>
          )}
          {info.length > 0 && (
            <Badge className="text-[9px] px-1.5 py-0 bg-blue-200 text-blue-800 font-bold border-blue-300">{info.length} Info</Badge>
          )}
        </div>
      </div>

      {/* Anomaly List */}
      <div className="divide-y divide-gray-200">
        {anomalies.map((a, i) => (
          <div key={i} className={`px-4 py-2.5 ${severityBorder(a.severity)}`}>
            <div className="flex items-start gap-2">
              {severityIcon(a.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[11px] font-bold ${severityTitle(a.severity)}`}>{a.title}</span>
                  <Badge className={`text-[7px] px-1 py-0 ${severityBadge(a.severity)}`}>{a.severity.toUpperCase()}</Badge>
                  {a.affectedDevices && a.affectedDevices.length > 0 && (
                    <Badge className="text-[7px] px-1 py-0 bg-gray-200 text-gray-700">Affects: {a.affectedDevices.length} device(s)</Badge>
                  )}
                </div>
                <p className="text-[10px] text-gray-700 leading-relaxed">{a.message}</p>
                {a.suggestion && (
                  <p className="text-[9px] text-gray-500 mt-1 italic">
                    <b>Suggestion:</b> {a.suggestion}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? "bg-green-500" : score >= 60 ? "bg-blue-500" : score >= 30 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[10px] font-bold text-gray-600 w-8 text-right">{score}%</span>
    </div>
  );
}

export default function LevelDevicePanel({
  state, bestDevices, suitableDevices, rejectedDevices,
  setMeasuringRange, setProcessPressure, setProcessTemp,
  setFluidDensity, setFluidViscosity, setSelectedLiquid,
  setRequiredOutput, setMountingPreference, toggleFlag, calculate, reset,
}: Props) {
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);
  const [showRejected, setShowRejected] = useState(false);
  const [showFloatMoc, setShowFloatMoc] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [anomalies, setAnomalies] = useState<ProcessAnomaly[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Re-run anomaly detection when key inputs change
  // Inlined to prevent stale closure issues with buildAnomalyInput
  useEffect(() => {
    // Need both fluid selected and non-zero temperature to run
    if (state.processTempC === 0) return;

    const input: import("../data/anomalyDetector").LevelAnomalyInput = {
      measuringRangeMm: state.measuringRangeMm,
      processPressureBar: state.processPressureBar,
      processTempC: state.processTempC,
      fluidDensityKgM3: state.fluidDensityKgM3,
      fluidViscosityCp: state.fluidViscosityCp,
      fluidName: state.selectedLiquid?.name || undefined,
      isDirty: state.isDirty,
      isViscous: state.isViscous,
      isCorrosive: state.isCorrosive,
      isFoamy: state.isFoamy,
      isTurbulent: state.isTurbulent,
      isSlurry: state.isSlurry,
      isCryogenic: state.isCryogenic,
      hasFerrousParticles: state.hasFerrousParticles,
    };

    const detected = detectLevelAnomalies(input, ALL_LEVEL_DEVICES);
    setAnomalies(detected);
  }, [
    state.measuringRangeMm, state.processPressureBar, state.processTempC,
    state.fluidDensityKgM3, state.fluidViscosityCp,
    state.selectedLiquid, state.selectedLiquid?.name,
    state.isDirty, state.isViscous, state.isCorrosive, state.isFoamy,
    state.isSlurry, state.isCryogenic, state.hasFerrousParticles,
  ]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allRecommended = [...bestDevices, ...suitableDevices];
  const searchResults = searchQuery.length > 0 ? searchLiquids(searchQuery) : [];

  return (
    <div className="space-y-6">
      {/* ─── INPUT SECTION ─────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="w-5 h-5 text-red-600" />
          <h2 className="text-sm font-bold text-gray-900">Process Conditions</h2>
        </div>

        {/* Fluid Search */}
        <div className="relative mb-4" ref={searchRef}>
          <Label className="text-xs font-medium mb-1.5 block">
            Search Fluid (220+ liquids database)
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Type fluid name, formula, or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
                if (e.target.value === "") setSelectedLiquid(null);
              }}
              onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
              className="pl-9"
            />
          </div>
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-72 overflow-auto">
              {searchResults.map((liquid, idx) => (
                <button
                  key={idx}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-0 flex items-center justify-between"
                  onClick={() => {
                    setSelectedLiquid(liquid);
                    setSearchQuery(liquid.name);
                    setShowDropdown(false);
                  }}
                >
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      {liquid.name}
                      {liquid.conductivity === true && (
                        <Zap className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {liquid.category}
                      {liquid.formula && ` · ${liquid.formula}`}
                    </div>
                  </div>
                  <div className="text-xs text-right text-muted-foreground">
                    <div>ρ: {liquid.density} kg/m³ · SG: {liquid.specificGravity}</div>
                    <div>μ: {liquid.viscosity} cP</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <Label className="text-xs font-medium mb-1 flex items-center gap-1">
              <Ruler className="w-3 h-3" /> C-C Distance (mm)
            </Label>
            <Input type="number" value={state.measuringRangeMm} onChange={(e) => setMeasuringRange(parseFloat(e.target.value) || 0)} min={100} max={15000} step={50} />
            <p className="text-[10px] text-gray-500 mt-0.5">Centre-to-centre / tank height</p>
            {/* Min C-C distance reference */}
            <div className="text-[9px] text-gray-400 mt-1 space-y-0.5">
              <div>Min C-C: Float & Board ≥1000 | Reflex/Transparent/Magnetic ≥250 | Transmitters ≥500</div>
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium mb-1 flex items-center gap-1">
              <Gauge className="w-3 h-3" /> Process Pressure (bar)
            </Label>
            <Input type="number" value={state.processPressureBar} onChange={(e) => setProcessPressure(parseFloat(e.target.value) || 0)} min={0} max={100} step={0.1} />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1 flex items-center gap-1">
              <Thermometer className="w-3 h-3" /> Process Temp (°C)
            </Label>
            <Input type="number" value={state.processTempC} onChange={(e) => setProcessTemp(parseFloat(e.target.value) || 0)} min={-200} max={500} step={1} />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1 flex items-center gap-1">
              <FlaskConical className="w-3 h-3" /> Fluid Density (kg/m³)
            </Label>
            <Input type="number" value={state.fluidDensityKgM3} onChange={(e) => setFluidDensity(parseFloat(e.target.value) || 0)} min={300} max={3000} step={10} />
            <p className="text-[10px] text-gray-500 mt-0.5">For float buoyancy</p>
          </div>
        </div>

        {/* Selected liquid info */}
        {state.selectedLiquid && (
          <div className="mb-4 space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-gray-700">Selected:</span>
              <span className="text-gray-900">{state.selectedLiquid.name}</span>
              <span className="text-gray-500">({state.selectedLiquid.category})</span>
              <span className="text-gray-500">ρ = {state.selectedLiquid.density} kg/m³, μ = {state.selectedLiquid.viscosity} cP at 20°C</span>
            </div>
            {state.processTempC !== 20 && (
              <p className="text-[10px] text-green-600">
                Auto-corrected to {state.processTempC}°C — ρ = {state.fluidDensityKgM3} kg/m³, μ = {state.fluidViscosityCp} cP
              </p>
            )}
            {state.selectedLiquid.nonNewtonian && (
              <p className="text-xs text-amber-600 font-medium">⚠ Non-Newtonian — shear-rate dependent</p>
            )}
            {state.selectedLiquid.concentration && (
              <p className="text-xs text-red-600 font-medium">ℹ Concentration-dependent — verify on-site</p>
            )}
          </div>
        )}

        {/* Secondary inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <Label className="text-xs font-medium mb-1">Viscosity (cP)</Label>
            <Input type="number" value={state.fluidViscosityCp} onChange={(e) => setFluidViscosity(parseFloat(e.target.value) || 0)} min={0} max={5000} step={0.1} />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1">Required Output</Label>
            <select
              value={state.requiredOutput}
              onChange={(e) => setRequiredOutput(e.target.value as LevelOutputType | "any")}
              className="w-full h-9 px-2 text-xs border border-gray-300 rounded-md bg-white"
            >
              <option value="any">Any Output</option>
              <option value="visual">Visual Indication Only</option>
              <option value="transmitter_4_20mA">4-20mA Transmitter Only</option>
              <option value="visual_and_transmitter">Visual + 4-20mA</option>
            </select>
          </div>
          <div>
            <Label className="text-xs font-medium mb-1">Mounting Type</Label>
            <select
              value={state.mountingPreference}
              onChange={(e) => setMountingPreference(e.target.value as "side" | "top" | "external" | "any")}
              className="w-full h-9 px-2 text-xs border border-gray-300 rounded-md bg-white"
            >
              <option value="any">Any Mounting</option>
              <option value="side">Side Mounted</option>
              <option value="top">Top Mounted</option>
              <option value="external">External / Non-contact</option>
            </select>
          </div>
        </div>

        {/* Fluid property toggles */}
        <div className="mb-4">
          <Label className="text-xs font-medium mb-2 block">Fluid Properties (check all that apply)</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "isDirty", label: "Dirty / Particulate", icon: Droplets },
              { key: "isViscous", label: "Viscous (>50 cP)", icon: FlaskConical },
              { key: "isCorrosive", label: "Corrosive", icon: AlertTriangle },
              { key: "isFoamy", label: "Foamy Surface", icon: Droplets },
              { key: "isTurbulent", label: "Turbulent / Agitated", icon: Factory },
              { key: "isSlurry", label: "Slurry", icon: FlaskConical },
              { key: "isCryogenic", label: "Cryogenic (<-40°C)", icon: Thermometer },
              { key: "hasFerrousParticles", label: "Ferrous Particles", icon: Factory },
              { key: "containsHydrocarbons", label: "Hydrocarbons / Solvents", icon: FlaskConical },
              { key: "isColored", label: "Colored / Dark Liquid", icon: FlaskConical },
            ].map(({ key, label, icon: Icon }) => (
              <label
                key={key}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border cursor-pointer text-[11px] font-medium transition-colors ${
                  (state as any)[key]
                    ? "bg-red-50 border-red-300 text-red-800"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={(state as any)[key]}
                  onChange={() => toggleFlag(key as keyof LevelCalculatorState)}
                  className="w-3.5 h-3.5 accent-red-600"
                />
                <Icon className="w-3 h-3" />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button onClick={calculate} className="bg-red-600 hover:bg-red-700 text-white text-sm px-6">
            Select Level Device
          </Button>
          <Button onClick={reset} variant="outline" className="text-sm">
            Reset
          </Button>
        </div>
      </div>

      {/* ─── ANOMALY PANEL ────────────────────────────────────────── */}
      {anomalies.length > 0 && <AnomalyPanel anomalies={anomalies} />}

      {/* ─── RESULTS SECTION ─────────────────────────────────────────── */}
      {state.calculated && state.validation && !state.validation.isValid && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-800">Input Validation Error</p>
            <p className="text-xs text-red-700">{state.validation.message}</p>
          </div>
        </div>
      )}

      {state.calculated && allRecommended.length > 0 && (
        <div className="space-y-3">
          {/* Best/Suitable header */}
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-sm font-bold text-gray-900">
              Recommended Level Devices ({allRecommended.length})
            </h2>
          </div>

          {allRecommended.map((rec) => (
            <div
              key={rec.device.id}
              className={`rounded-lg border-2 overflow-hidden shadow-sm ${STATUS_COLORS[rec.status]}`}
            >
              {/* Header */}
              <button
                className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 gap-1 sm:gap-0 text-left"
                onClick={() => setExpandedDevice(expandedDevice === rec.device.id ? null : rec.device.id)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${STATUS_BADGE[rec.status]} text-[10px] px-1.5 py-0`}>
                    {rec.status === "best" ? "BEST" : "SUITABLE"}
                  </Badge>
                  <span className="font-semibold text-sm">{rec.device.shortName}</span>
                  <Badge className="bg-gray-800 text-white text-[10px] px-1.5 py-0">
                    {rec.device.output === "visual" ? "Visual" : rec.device.output === "switch" ? "Switch" : "4-20mA"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <ScoreBar score={rec.score} />
                  {expandedDevice === rec.device.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded details */}
              {expandedDevice === rec.device.id && (
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-xs text-gray-600">{rec.reason}</p>

                  {/* Specs table */}
                  <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                    <div className="bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-gray-800">Device Specifications</div>
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-gray-100"><td className="px-3 py-1.5 text-gray-600 w-40">Measuring Range</td><td className="px-3 py-1.5 font-medium">{rec.device.minMeasuringRange} – {rec.device.maxMeasuringRange} mm</td></tr>
                        <tr className="border-b border-gray-100 bg-gray-50/30"><td className="px-3 py-1.5 text-gray-600">Min C-C Distance</td><td className="px-3 py-1.5 font-medium">{rec.device.minCCDistance} mm <span className="text-[9px] text-gray-400">(hard limit — below this product will not work)</span></td></tr>
                        <tr className="border-b border-gray-100"><td className="px-3 py-1.5 text-gray-600">Pressure Rating</td><td className="px-3 py-1.5 font-medium">{rec.device.minPressure} – {rec.device.maxPressure} bar</td></tr>
                        <tr className="border-b border-gray-100"><td className="px-3 py-1.5 text-gray-600">Temperature</td><td className="px-3 py-1.5 font-medium">{rec.device.minTemperature} – {rec.device.maxTemperature}°C</td></tr>
                        <tr className="border-b border-gray-100 bg-gray-50/30"><td className="px-3 py-1.5 text-gray-600">Min Density</td><td className="px-3 py-1.5 font-medium">{rec.device.minDensity} kg/m³</td></tr>
                        <tr className="border-b border-gray-100"><td className="px-3 py-1.5 text-gray-600">Accuracy</td><td className="px-3 py-1.5 font-medium">{rec.device.accuracy}</td></tr>
                        <tr className="border-b border-gray-100 bg-gray-50/30"><td className="px-3 py-1.5 text-gray-600">Process Conn.</td><td className="px-3 py-1.5 font-medium">{rec.device.processConnection.join(", ")}</td></tr>
                        <tr className="border-b border-gray-100"><td className="px-3 py-1.5 text-gray-600">Mounting</td><td className="px-3 py-1.5 font-medium capitalize">{rec.device.mountingType}</td></tr>
                        <tr className=""><td className="px-3 py-1.5 text-gray-600">Model Code</td><td className="px-3 py-1.5 font-mono text-[10px]">{rec.device.id}</td></tr>
                      </tbody>
                    </table>
                  </div>

                  {/* MOC Recommendation */}
                  <div className="bg-red-50/60 border border-red-200 rounded-md overflow-hidden">
                    <div className="bg-red-100/80 px-3 py-1.5 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                      <span className="text-[11px] font-bold text-red-800">MOC Recommendation</span>
                    </div>
                    <div className="px-3 py-2 grid grid-cols-3 gap-2">
                      <div className="bg-white rounded px-2 py-1.5 border border-red-100">
                        <div className="text-[9px] text-gray-500 uppercase">Body MOC</div>
                        <div className="text-[11px] font-bold text-gray-800">{rec.mocRecommendation.bodyMoc}</div>
                      </div>
                      <div className="bg-white rounded px-2 py-1.5 border border-red-100">
                        <div className="text-[9px] text-gray-500 uppercase">Float MOC</div>
                        <div className="text-[11px] font-bold text-gray-800">{rec.mocRecommendation.floatMoc}</div>
                      </div>
                      <div className="bg-white rounded px-2 py-1.5 border border-red-100">
                        <div className="text-[9px] text-gray-500 uppercase">Gasket</div>
                        <div className="text-[11px] font-bold text-gray-800">{rec.mocRecommendation.gasketMoc}</div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                    <div className="bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-gray-800">Key Features</div>
                    <div className="px-3 py-2 space-y-0.5">
                      {rec.device.features.map((f, i) => (
                        <p key={i} className="text-[10px] text-gray-700 flex items-start gap-1">
                          <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                          <span>{f}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Standards */}
                  <div className="flex flex-wrap gap-1">
                    {rec.device.standards.map((s) => (
                      <span key={s} className="text-[9px] px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-700 font-medium">{s}</span>
                    ))}
                  </div>

                  {/* Warnings */}
                  {rec.warnings.length > 0 && (
                    <div className="space-y-1">
                      {rec.warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                          <span className="text-[10px] text-amber-800">{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {rec.device.notes.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 space-y-0.5">
                      {rec.device.notes.map((n, i) => (
                        <p key={i} className="text-[10px] text-blue-800 flex items-start gap-1">
                          <span className="text-blue-500 mt-0.5 shrink-0">ℹ</span>
                          <span>{n}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Not suitable for */}
                  {rec.device.notSuitableFor.length > 0 && (
                    <div className="text-[10px] text-gray-500">
                      <span className="font-semibold">Not suitable for:</span>{" "}
                      {rec.device.notSuitableFor.join("; ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejected devices toggle */}
      {state.calculated && rejectedDevices.length > 0 && (
        <div>
          <button
            onClick={() => setShowRejected(!showRejected)}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700"
          >
            {showRejected ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {rejectedDevices.length} device(s) rejected (click to view)
          </button>
          {showRejected && (
            <div className="mt-2 space-y-2">
              {rejectedDevices.map((rec) => (
                <div key={rec.device.id} className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2 opacity-60">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">{rec.device.shortName}</span>
                    <span className="text-[10px] text-gray-500">— {rec.rejectionReasons[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ FLOAT MOC SELECTOR — Side & Top Mounted Level Gauge ONLY ═══ */}
      <div>
        <button
          onClick={() => setShowFloatMoc(!showFloatMoc)}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg transition-all w-full ${
            showFloatMoc
              ? "bg-blue-600 text-white shadow-md"
              : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
          }`}
        >
          <Beaker className="w-4 h-4" />
          Float MOC Selector — Application-Based Verification
          <span className="ml-auto text-[10px] font-normal opacity-70">
            Side & Top Mounted Magnetic Level Gauge ONLY
          </span>
          {showFloatMoc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showFloatMoc && (
          <div className="mt-3">
            <FloatMocPanel />
          </div>
        )}
      </div>
    </div>
  );
}
