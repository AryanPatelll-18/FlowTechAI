// ============================================================
// PressureDevicePanel — Main UI for Pressure Device Selection (Phase IV)
// ============================================================

import { useState, useEffect } from "react";
import {
  Gauge, Thermometer, FlaskConical, AlertTriangle,
  CheckCircle, XCircle, ShieldCheck, ChevronDown, ChevronUp,
  Droplets, Factory, Settings2, Activity, Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { PressureCalculatorState } from "../hooks/usePressureCalculator";
import type { PressureDeviceRecommendation } from "../data/pressureDeviceEngine";
import type { PressureMeasurementType } from "../data/pressureDeviceDatabase";
import { detectPressureAnomalies, type ProcessAnomaly } from "../data/anomalyDetector";

interface Props {
  state: PressureCalculatorState;
  bestDevices: PressureDeviceRecommendation[];
  suitableDevices: PressureDeviceRecommendation[];
  rejectedDevices: PressureDeviceRecommendation[];
  setProcessPressure: (v: number) => void;
  setProcessPressureType: (v: PressureMeasurementType) => void;
  setProcessTemp: (v: number) => void;
  setAmbientTemp: (v: number) => void;
  setFluidType: (v: "liquid" | "gas" | "steam") => void;
  setApplication: (v: PressureCalculatorState["application"]) => void;
  setRequiredAccuracy: (v: PressureCalculatorState["requiredAccuracy"]) => void;
  setOutputPreference: (v: PressureCalculatorState["outputPreference"]) => void;
  toggleFlag: (flag: keyof PressureCalculatorState) => void;
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

// ─── Pressure Anomaly Panel ──────────────────────────────────────────────

function PressureAnomalyPanel({ anomalies }: { anomalies: ProcessAnomaly[] }) {
  if (anomalies.length === 0) return null;

  const critical = anomalies.filter((a) => a.severity === "critical");
  const warning = anomalies.filter((a) => a.severity === "warning");
  const info = anomalies.filter((a) => a.severity === "info");

  const sevIcon = (s: ProcessAnomaly["severity"]) => {
    if (s === "critical") return <XCircle className="w-4 h-4 text-red-600 shrink-0" />;
    if (s === "warning") return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
    return <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />;
  };
  const sevBorder = (s: ProcessAnomaly["severity"]) => {
    if (s === "critical") return "border-red-300 bg-red-50";
    if (s === "warning") return "border-amber-300 bg-amber-50";
    return "border-blue-300 bg-blue-50";
  };
  const sevTitle = (s: ProcessAnomaly["severity"]) => {
    if (s === "critical") return "text-red-800";
    if (s === "warning") return "text-amber-800";
    return "text-blue-800";
  };
  const sevBadge = (s: ProcessAnomaly["severity"]) => {
    if (s === "critical") return "bg-red-200 text-red-800";
    if (s === "warning") return "bg-amber-200 text-amber-800";
    return "bg-blue-200 text-blue-800";
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className={`px-4 py-2.5 flex items-center justify-between ${critical.length > 0 ? "bg-red-100" : warning.length > 0 ? "bg-amber-100" : "bg-blue-100"}`}>
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${critical.length > 0 ? "text-red-600" : warning.length > 0 ? "text-amber-600" : "text-blue-600"}`} />
          <span className={`text-xs font-bold ${critical.length > 0 ? "text-red-800" : warning.length > 0 ? "text-amber-800" : "text-blue-800"}`}>
            Process Anomaly Detector — {anomalies.length} issue{anomalies.length > 1 ? "s" : ""} detected
          </span>
        </div>
        <div className="flex gap-1.5">
          {critical.length > 0 && <Badge className="text-[9px] px-1.5 py-0 bg-red-200 text-red-800 font-bold border-red-300">{critical.length} Critical</Badge>}
          {warning.length > 0 && <Badge className="text-[9px] px-1.5 py-0 bg-amber-200 text-amber-800 font-bold border-amber-300">{warning.length} Warning</Badge>}
          {info.length > 0 && <Badge className="text-[9px] px-1.5 py-0 bg-blue-200 text-blue-800 font-bold border-blue-300">{info.length} Info</Badge>}
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {anomalies.map((a, i) => (
          <div key={i} className={`px-4 py-2.5 ${sevBorder(a.severity)}`}>
            <div className="flex items-start gap-2">
              {sevIcon(a.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[11px] font-bold ${sevTitle(a.severity)}`}>{a.title}</span>
                  <Badge className={`text-[7px] px-1 py-0 ${sevBadge(a.severity)}`}>{a.severity.toUpperCase()}</Badge>
                </div>
                <p className="text-[10px] text-gray-700 leading-relaxed">{a.message}</p>
                {a.suggestion && <p className="text-[9px] text-gray-500 mt-1 italic"><b>Suggestion:</b> {a.suggestion}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PressureDevicePanel({
  state, bestDevices, suitableDevices, rejectedDevices,
  setProcessPressure, setProcessPressureType, setProcessTemp, setAmbientTemp,
  setFluidType, setApplication, setRequiredAccuracy, setOutputPreference,
  toggleFlag, calculate, reset,
}: Props) {
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);
  const [showRejected, setShowRejected] = useState(false);
  const [pressureAnomalies, setPressureAnomalies] = useState<ProcessAnomaly[]>([]);

  // Pressure anomaly detection — runs when key inputs change
  useEffect(() => {
    if (state.processTempC === 0 && state.processPressureBar === 0) {
      setPressureAnomalies([]); return;
    }

    const input: import("../data/anomalyDetector").PressureAnomalyInput = {
      processPressureBar: state.processPressureBar,
      processTempC: state.processTempC,
      fluidName: undefined,
      isCorrosive: state.isCorrosive,
      isHighViscosity: state.isViscous,
      hasPulsation: state.isPulsating,
      hasVibration: false, // not in current state, default false
      diaphragmMaterial: undefined,
      transmitterType: state.application === "flow_dp" || state.application === "level_dp" ? "differential" : "smart",
      // Use realistic Flowtech transmitter ratings based on process pressure
      // Smart Pressure: 0-400 bar | Differential: 0-100 bar | Miniature: 0-40 bar
      maxPressureRating: state.application === "flow_dp" || state.application === "level_dp"
        ? (state.processPressureBar > 60 ? 100 : state.processPressureBar > 10 ? 40 : 10)
        : state.processPressureBar > 25
          ? 400
          : state.processPressureBar > 6
            ? 100
            : 40,
      minPressureRange: state.processPressureBar < 0.01 ? 0.01 : state.processPressureBar < 0.1 ? 0.1 : state.processPressureBar < 1 ? 1 : undefined,
    };

    const detected = detectPressureAnomalies(input);
    setPressureAnomalies(detected);
  }, [
    state.processPressureBar, state.processTempC,
    state.isCorrosive, state.isViscous, state.isPulsating,
    state.application,
  ]);

  const allRecommended = [...bestDevices, ...suitableDevices];

  return (
    <div className="space-y-6">
      {/* ─── INPUT SECTION ─────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="w-5 h-5 text-red-600" />
          <h2 className="text-sm font-bold text-gray-900">Process Conditions</h2>
        </div>

        {/* Primary inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <Label className="text-xs font-medium mb-1 flex items-center gap-1">
              <Gauge className="w-3 h-3" /> Process Pressure (bar)
            </Label>
            <Input type="number" value={state.processPressureBar} onChange={(e) => setProcessPressure(parseFloat(e.target.value) || 0)} min={-1} max={1000} step={0.1} />
            <p className="text-[10px] text-gray-500 mt-0.5">Operating pressure</p>
          </div>
          <div>
            <Label className="text-xs font-medium mb-1 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Pressure Type
            </Label>
            <select
              value={state.processPressureType}
              onChange={(e) => setProcessPressureType(e.target.value as PressureMeasurementType)}
              className="w-full h-9 px-2 text-xs border border-gray-300 rounded-md bg-white"
            >
              <option value="gauge">Gauge Pressure</option>
              <option value="absolute">Absolute Pressure</option>
              <option value="differential">Differential Pressure</option>
              <option value="sealed_gauge">Sealed Gauge</option>
            </select>
          </div>
          <div>
            <Label className="text-xs font-medium mb-1 flex items-center gap-1">
              <Thermometer className="w-3 h-3" /> Process Temp (°C)
            </Label>
            <Input type="number" value={state.processTempC} onChange={(e) => setProcessTemp(parseFloat(e.target.value) || 0)} min={-200} max={500} step={1} />
            <p className="text-[10px] text-gray-500 mt-0.5">Media temperature</p>
          </div>
          <div>
            <Label className="text-xs font-medium mb-1 flex items-center gap-1">
              <Thermometer className="w-3 h-3" /> Ambient Temp (°C)
            </Label>
            <Input type="number" value={state.ambientTempC} onChange={(e) => setAmbientTemp(parseFloat(e.target.value) || 0)} min={-50} max={100} step={1} />
            <p className="text-[10px] text-gray-500 mt-0.5">Surrounding air temp</p>
          </div>
        </div>

        {/* Secondary inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <Label className="text-xs font-medium mb-1">Fluid Type</Label>
            <select
              value={state.fluidType}
              onChange={(e) => setFluidType(e.target.value as "liquid" | "gas" | "steam")}
              className="w-full h-9 px-2 text-xs border border-gray-300 rounded-md bg-white"
            >
              <option value="liquid">Liquid</option>
              <option value="gas">Gas / Vapour</option>
              <option value="steam">Steam</option>
            </select>
          </div>
          <div>
            <Label className="text-xs font-medium mb-1">Application</Label>
            <select
              value={state.application}
              onChange={(e) => setApplication(e.target.value as PressureCalculatorState["application"])}
              className="w-full h-9 px-2 text-xs border border-gray-300 rounded-md bg-white"
            >
              <option value="pressure">Pressure Measurement</option>
              <option value="flow_dp">Flow via Differential Pressure</option>
              <option value="level_dp">Level via Differential Pressure</option>
              <option value="filter_monitoring">Filter Monitoring</option>
              <option value="general">General Industrial</option>
            </select>
          </div>
          <div>
            <Label className="text-xs font-medium mb-1">Required Accuracy</Label>
            <select
              value={state.requiredAccuracy}
              onChange={(e) => setRequiredAccuracy(e.target.value as PressureCalculatorState["requiredAccuracy"])}
              className="w-full h-9 px-2 text-xs border border-gray-300 rounded-md bg-white"
            >
              <option value="standard">Standard (±0.25%)</option>
              <option value="high">High (±0.1%)</option>
              <option value="very_high">Very High (±0.075%)</option>
            </select>
          </div>
        </div>

        {/* Output preference + display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-xs font-medium mb-1">Output Signal Preference</Label>
            <select
              value={state.outputPreference}
              onChange={(e) => setOutputPreference(e.target.value as PressureCalculatorState["outputPreference"])}
              className="w-full h-9 px-2 text-xs border border-gray-300 rounded-md bg-white"
            >
              <option value="any">Any Output</option>
              <option value="4_20mA">4-20mA Only</option>
              <option value="hart">HART Protocol</option>
              <option value="fieldbus">Fieldbus (Foundation/Profibus)</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.needsDisplay}
                onChange={() => toggleFlag("needsDisplay")}
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-xs font-medium text-gray-700">Local LCD Display Required</span>
            </label>
          </div>
        </div>

        {/* Fluid property toggles */}
        <div className="mb-4">
          <Label className="text-xs font-medium mb-2 block">Process Conditions (check all that apply)</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "isCorrosive", label: "Corrosive Media", icon: FlaskConical },
              { key: "isViscous", label: "Viscous Media", icon: Droplets },
              { key: "isCrystallizing", label: "Crystallizing Media", icon: Factory },
              { key: "isPulsating", label: "Pulsating Pressure", icon: Activity },
              { key: "isHazardousArea", label: "Hazardous Area (Ex)", icon: Zap },
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
                  onChange={() => toggleFlag(key as keyof PressureCalculatorState)}
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
            Select Pressure Device
          </Button>
          <Button onClick={reset} variant="outline" className="text-sm">
            Reset
          </Button>
        </div>
      </div>

      {/* ─── ANOMALY PANEL ────────────────────────────────────────── */}
      {pressureAnomalies.length > 0 && <PressureAnomalyPanel anomalies={pressureAnomalies} />}

      {/* ─── CRITICAL ANOMALY BLOCKER ───────────────────────────────── */}
      {state.calculated && pressureAnomalies.some((a) => a.severity === "critical") && (
        <div className="bg-red-50 border border-red-400 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-bold text-red-800">CALCULATION BLOCKED — Critical Process Anomalies Detected</h3>
          </div>
          <p className="text-xs text-red-700 mb-2">
            The process conditions contain critical issues that make pressure measurement impossible or dangerous. No device can be recommended until these issues are resolved.
          </p>
          <div className="space-y-1.5">
            {pressureAnomalies
              .filter((a) => a.severity === "critical")
              .map((a, i) => (
                <div key={i} className="bg-white border border-red-300 rounded-md p-2.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-xs font-bold text-red-800">{a.title}</span>
                    <Badge className="text-[7px] px-1 py-0 bg-red-200 text-red-800">CRITICAL</Badge>
                  </div>
                  <p className="text-[10px] text-red-700">{a.message}</p>
                  {a.suggestion && <p className="text-[9px] text-red-600 mt-0.5 italic"><b>Fix:</b> {a.suggestion}</p>}
                </div>
              ))}
          </div>
        </div>
      )}

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

      {state.calculated && allRecommended.length > 0 && !pressureAnomalies.some((a) => a.severity === "critical") && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-sm font-bold text-gray-900">
              Recommended Pressure Devices ({allRecommended.length})
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
                    ±{rec.device.accuracy.split("±")[1]?.split(" ")[0] || rec.device.accuracy}
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
                  <p className="text-xs text-gray-700 leading-relaxed">{rec.device.description}</p>

                  {/* Specs table */}
                  <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                    <div className="bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-gray-800">Device Specifications</div>
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-gray-100"><td className="px-3 py-1.5 text-gray-600 w-40">Pressure Range</td><td className="px-3 py-1.5 font-medium">{rec.device.minPressureRange / 1000} bar to {rec.device.maxPressureRange / 1000} bar</td></tr>
                        <tr className="border-b border-gray-100 bg-gray-50/30"><td className="px-3 py-1.5 text-gray-600">Media Temperature</td><td className="px-3 py-1.5 font-medium">{rec.device.minMediaTemp}°C to {rec.device.maxMediaTemp}°C</td></tr>
                        <tr className="border-b border-gray-100"><td className="px-3 py-1.5 text-gray-600">Ambient Temperature</td><td className="px-3 py-1.5 font-medium">{rec.device.minTemperature}°C to {rec.device.maxTemperature}°C</td></tr>
                        <tr className="border-b border-gray-100 bg-gray-50/30"><td className="px-3 py-1.5 text-gray-600">Overpressure Limit</td><td className="px-3 py-1.5 font-medium">{rec.device.overPressureLimit}% of range</td></tr>
                        <tr className="border-b border-gray-100"><td className="px-3 py-1.5 text-gray-600">Accuracy</td><td className="px-3 py-1.5 font-medium">{rec.device.accuracy}</td></tr>
                        <tr className="border-b border-gray-100 bg-gray-50/30"><td className="px-3 py-1.5 text-gray-600">Turndown Ratio</td><td className="px-3 py-1.5 font-medium">{rec.device.turndownRatio}</td></tr>
                        <tr className="border-b border-gray-100"><td className="px-3 py-1.5 text-gray-600">Response Time</td><td className="px-3 py-1.5 font-medium">{rec.device.responseTime}</td></tr>
                        <tr className="border-b border-gray-100 bg-gray-50/30"><td className="px-3 py-1.5 text-gray-600">Display</td><td className="px-3 py-1.5 font-medium">{rec.device.display}</td></tr>
                        <tr className="border-b border-gray-100"><td className="px-3 py-1.5 text-gray-600">Output Signals</td><td className="px-3 py-1.5 font-medium">{rec.device.outputSignal.join(", ")}</td></tr>
                        <tr className="border-b border-gray-100 bg-gray-50/30"><td className="px-3 py-1.5 text-gray-600">Protection Class</td><td className="px-3 py-1.5 font-medium">{rec.device.protectionClass}</td></tr>
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
                        <div className="text-[9px] text-gray-500 uppercase">Body / Wetted Parts</div>
                        <div className="text-[11px] font-bold text-gray-800">{rec.mocRecommendation.bodyMoc}</div>
                      </div>
                      <div className="bg-white rounded px-2 py-1.5 border border-red-100">
                        <div className="text-[9px] text-gray-500 uppercase">Diaphragm</div>
                        <div className="text-[11px] font-bold text-gray-800">{rec.mocRecommendation.diaphragmMoc}</div>
                      </div>
                      <div className="bg-white rounded px-2 py-1.5 border border-red-100">
                        <div className="text-[9px] text-gray-500 uppercase">Fill Fluid</div>
                        <div className="text-[11px] font-bold text-gray-800">{rec.mocRecommendation.fillFluid}</div>
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

                  {/* Certifications */}
                  <div className="flex flex-wrap gap-1">
                    {rec.device.certifications.map((c) => (
                      <span key={c} className="text-[9px] px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-700 font-medium">{c}</span>
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
    </div>
  );
}
