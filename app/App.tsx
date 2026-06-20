import { useState, useRef, useEffect } from "react";
import { useSizingHistory } from "./hooks/useSizingHistory";
import { detectFlowSizingAnomalies, type ProcessAnomaly } from "./data/anomalyDetector";
import { buildSizingReportData, buildSizingReportDataForSize } from "./data/sizingReportEngine";
import { renderSizingReportHtml } from "./data/sizingReportRenderer";
import { useLevelCalculator } from "./hooks/useLevelCalculator";
import { usePressureCalculator } from "./hooks/usePressureCalculator";
import LevelDevicePanel from "./components/LevelDevicePanel";
import PressureDevicePanel from "./components/PressureDevicePanel";
import DocumentPanel from "./components/DocumentPanel";
import ProductExpertPanel from "./components/ProductExpertPanel";
import {
  Droplets,
  Wind,
  Flame,
  Search,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  BarChart3,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Trophy,
  Gauge,
  LogOut,
  Ruler,
  Activity,
  FileText,
  Info,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCalculator } from "./hooks/useCalculator";
import type { ServiceType } from "./hooks/useCalculator";
import { searchLiquids } from "./data/liquids";
import type { LiquidData } from "./data/liquids";
import { searchGases, GASES_DB, calculateGasDensity } from "./data/gases";
import type { GasData } from "./data/gases";
import { getUnitsForService } from "./data/unitConversions";
import { PRESSURE_UNITS, fromBar } from "./data/pressureUnits";
import type { PressureUnit } from "./data/pressureUnits";
import PasswordGate from "./components/PasswordGate";
// Removed old PdfReport components — replaced by new Professional Sizing Report
import SizingReportInline from "./components/SizingReportInline";
import ProductMocInline from "./components/ProductMocInline";
import ProductSpecsInline from "./components/ProductSpecsInline";
import RotameterResults from "./components/RotameterResults";

// ─── Flow Anomaly Panel ──────────────────────────────────────────────────

function FlowAnomalyPanel({ anomalies }: { anomalies: ProcessAnomaly[] }) {
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
          <Activity className={`w-4 h-4 ${critical.length > 0 ? "text-red-600" : warning.length > 0 ? "text-amber-600" : "text-blue-600"}`} />
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

function AccuracyBar({ distance }: { distance: number }) {
  // distance: 0 = exactly at median (best accuracy), 1 = at edge (worst)
  // Convert to percentage for display
  const pct = Math.round((1 - Math.min(1, distance)) * 100);
  const color =
    distance <= 0.15 ? "bg-green-500" :
    distance <= 0.3 ? "bg-emerald-400" :
    distance <= 0.5 ? "bg-yellow-400" : "bg-orange-400";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground">{pct}%</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "best":
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white gap-1">
          <Trophy className="w-3 h-3" /> Best Match
        </Badge>
      );
    case "suitable":
      return (
        <Badge className="bg-primary hover:bg-[#c20017] text-white gap-1">
          <CheckCircle className="w-3 h-3" /> Suitable
        </Badge>
      );
    case "caution":
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1">
          <AlertTriangle className="w-3 h-3" /> Caution
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" /> Rejected
        </Badge>
      );
    default:
      return null;
  }
}

// Map sizing result product name → MOC product key
function mocKeyFromProduct(name: string): string | null {
  if (name.includes("Electromagnetic")) return "emf";
  if (name.includes("Turbine")) return "turbine";
  if (name.includes("Vortex")) return "vortex";
  if (name.includes("Oval Gear")) return "ovalGear";
  if (name.includes("Glass Tube") || name.includes("Rotameter")) return "rotameter";
  if (name.includes("Ultrasonic")) return "ultrasonic";
  return null;
}

export default function App() {
  const calc = useCalculator();
  const sizingHistory = useSizingHistory();
  const levelCalc = useLevelCalculator();
  const pressureCalc = usePressureCalculator();
  const [activeTab, setActiveTab] = useState<"flow" | "level" | "pressure" | "documents" | "expert">("flow");
  const {
    state,
    setService,
    setMeterCategory,
    setSelectedLiquid,
    setDensity,
    setViscosity,
    setOperatingTemp,
    setLiquidPressure,
    setSteamPressure,
    setSteamTempC,
    setSelectedGas,
    setGasPressure,
    setFlowRateMin,
    setFlowRateMax,
    setFlowUnit,
    setPipeSize,
    calculate,
    reset,
    logout,
    validResults,
    rejectedResults,
    toDisplayUnit,
  } = calc;

  // ─── Inline Sizing Report State ──────────────────────────────────────────
  const [showSizingReport, setShowSizingReport] = useState(false);
  const [sizingReportHtml, setSizingReportHtml] = useState("");

  function openInlineSizingReport(result?: any, size?: any) {
    try {
      const targetResult = result || validResults[0];
      if (!targetResult) { alert("No valid sizing result. Run calculation first."); return; }
      const reportData = size
        ? buildSizingReportDataForSize(targetResult, state, size, "", "", "")
        : buildSizingReportData(targetResult, state, "", "", "");
      const html = renderSizingReportHtml(reportData);
      setSizingReportHtml(html);
      setShowSizingReport(true);
      setTimeout(() => {
        const el = document.getElementById("sizing-report-inline");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: any) {
      alert("Failed: " + (err?.message || String(err)));
    }
  }

  // P2: Save sizing to history after successful calculation
  useEffect(() => {
    if (state.calculated && validResults.length > 0) {
      const best = validResults[0];
      sizingHistory.addRecord({
        label: `${best.product.name} · ${best.bestSize || "—"}`,
        service: state.service,
        fluidName: state.selectedLiquid?.name || state.selectedGas?.name || `Steam @ ${state.steamPressureBarAbs} bar`,
        flowRange: `${state.flowRateMin} – ${state.flowRateMax}`,
        unit: state.flowUnit,
        bestMeter: best.product.name,
        bestSize: best.bestSize || "—",
        temperature: state.operatingTemp,
        pressure: state.liquidPressureBarAbs,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.calculated]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [gasSearchQuery, setGasSearchQuery] = useState("");
  const [showGasDropdown, setShowGasDropdown] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );
  const [flowAnomalies, setFlowAnomalies] = useState<ProcessAnomaly[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const gasSearchRef = useRef<HTMLDivElement>(null);

  // Flow sizing anomaly detection — runs for ALL services (liquid, gas, steam)
  useEffect(() => {
    if (state.operatingTemp === 0) { setFlowAnomalies([]); return; }

    // Determine correct pressure for the active service
    let pressureBar = 1.013;
    if (state.service === "liquid") pressureBar = state.liquidPressureBarAbs;
    else if (state.service === "gas") pressureBar = state.gasPressureBarAbs;
    else if (state.service === "steam") pressureBar = state.steamPressureBarAbs;

    const input: import("./data/anomalyDetector").FlowSizingAnomalyInput = {
      service: state.service,
      fluidName: state.selectedLiquid?.name || state.selectedGas?.name || undefined,
      processTempC: state.operatingTemp,
      processPressureBar: pressureBar,
      fluidDensityKgM3: state.density,
      fluidViscosityCp: state.viscosity,
      flowRate: state.flowRateMax,
      flowUnit: state.flowUnit, // CRITICAL: needed for velocity unit conversion
      pipeSizeNominal: state.pipeSizeNominal || undefined,
      qMin: state.flowRateMin,
      qMax: state.flowRateMax,
      meterType: state.meterCategory === "inline" ? "emf" : undefined,
      selectedGasName: state.selectedGas?.name,
      steamState: state.steamState,
    };

    const detected = detectFlowSizingAnomalies(input);
    setFlowAnomalies(detected);
  }, [
    state.service, state.selectedLiquid, state.selectedGas, state.operatingTemp,
    state.liquidPressureBarAbs, state.gasPressureBarAbs, state.steamPressureBarAbs,
    state.density, state.viscosity,
    state.flowRateMin, state.flowRateMax, state.meterCategory,
    state.pipeSizeNominal, state.steamState,
  ]);

  // Close search dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (gasSearchRef.current && !gasSearchRef.current.contains(e.target as Node)) {
        setShowGasDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = searchQuery.length > 0 ? searchLiquids(searchQuery) : [];
  const gasSearchResults = gasSearchQuery.length > 0 ? searchGases(gasSearchQuery) : [];

  const handleSelectLiquid = (liquid: LiquidData) => {
    setSelectedLiquid(liquid);
    setSearchQuery(liquid.name);
    setShowDropdown(false);
  };

  const handleSelectGas = (gas: GasData) => {
    setSelectedGas(gas);
    setGasSearchQuery(gas.name);
    setShowGasDropdown(false);
  };

  const toggleProduct = (name: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Auto-expand best match
  useEffect(() => {
    if (state.calculated && validResults.length > 0) {
      const best = validResults[0];
      if (best.status === "best" || best.status === "suitable") {
        setExpandedProducts((prev) => {
          const next = new Set(prev);
          next.add(best.product.name);
          return next;
        });
      }
    }
  }, [state.calculated, validResults]);

  return (
    <PasswordGate>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#2d2d2d] text-white py-3">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/flowtech_logo_white.png"
                alt="Flowtech Instruments"
                className="h-12 sm:h-14 w-auto object-contain"
              />
              <div className="border-l border-gray-600 pl-4">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  AI Flow Sizing Calculator
                </h1>
                <p className="text-xs text-gray-400">
                  220+ fluids · 80+ gases · Steam tables · Factory Qmin/Qmax
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-md hover:bg-white/5"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* ═══ Flow / Level / Pressure / Documents Tabs ═══════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2">
          <button
            onClick={() => setActiveTab("flow")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === "flow"
                ? "bg-red-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Gauge className="w-4 h-4" />
            Flow Sizing
          </button>
          <button
            onClick={() => setActiveTab("level")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === "level"
                ? "bg-red-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Ruler className="w-4 h-4" />
            Level Device
          </button>
          <button
            onClick={() => setActiveTab("pressure")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === "pressure"
                ? "bg-red-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Activity className="w-4 h-4" />
            Pressure
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === "documents"
                ? "bg-red-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            Documents
          </button>
          <button
            onClick={() => setActiveTab("expert")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === "expert"
                ? "bg-red-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            AI Expert
          </button>
        </div>

        {activeTab === "level" ? (
          <LevelDevicePanel
            state={levelCalc.state}
            bestDevices={levelCalc.bestDevices}
            suitableDevices={levelCalc.suitableDevices}
            rejectedDevices={levelCalc.rejectedDevices}
            setMeasuringRange={levelCalc.setMeasuringRange}
            setProcessPressure={levelCalc.setProcessPressure}
            setProcessTemp={levelCalc.setProcessTemp}
            setFluidDensity={levelCalc.setFluidDensity}
            setFluidViscosity={levelCalc.setFluidViscosity}
            setSelectedLiquid={levelCalc.setSelectedLiquid}
            setRequiredOutput={levelCalc.setRequiredOutput}
            setMountingPreference={levelCalc.setMountingPreference}
            toggleFlag={levelCalc.toggleFlag}
            calculate={levelCalc.calculate}
            reset={levelCalc.reset}
          />
        ) : activeTab === "pressure" ? (
          <PressureDevicePanel
            state={pressureCalc.state}
            bestDevices={pressureCalc.bestDevices}
            suitableDevices={pressureCalc.suitableDevices}
            rejectedDevices={pressureCalc.rejectedDevices}
            setProcessPressure={pressureCalc.setProcessPressure}
            setProcessPressureType={pressureCalc.setProcessPressureType}
            setProcessTemp={pressureCalc.setProcessTemp}
            setAmbientTemp={pressureCalc.setAmbientTemp}
            setFluidType={pressureCalc.setFluidType}
            setApplication={pressureCalc.setApplication}
            setRequiredAccuracy={pressureCalc.setRequiredAccuracy}
            setOutputPreference={pressureCalc.setOutputPreference}
            toggleFlag={pressureCalc.toggleFlag}
            calculate={pressureCalc.calculate}
            reset={pressureCalc.reset}
          />
        ) : activeTab === "documents" ? (
          <DocumentPanel />
        ) : activeTab === "expert" ? (
          <ProductExpertPanel />
        ) : (
          <>
        {/* Service Tabs */}
        <Card>
          <CardContent className="pt-6">
            <Tabs
              value={state.service}
              onValueChange={(v) => setService(v as ServiceType)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="liquid" className="gap-2">
                  <Droplets className="w-4 h-4" />
                  Liquids
                </TabsTrigger>
                <TabsTrigger value="gas" className="gap-2">
                  <Wind className="w-4 h-4" />
                  Gas
                </TabsTrigger>
                <TabsTrigger value="steam" className="gap-2">
                  <Flame className="w-4 h-4" />
                  Steam
                </TabsTrigger>
              </TabsList>

              {/* ========== LIQUID TAB ========== */}
              <TabsContent value="liquid" className="space-y-4 mt-4">
                {/* Fluid Search */}
                <div className="relative" ref={searchRef}>
                  <Label className="text-sm font-medium mb-1.5 block">
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
                          onClick={() => handleSelectLiquid(liquid)}
                        >
                          <div>
                            <div className="font-medium text-sm flex items-center gap-2">
                              {liquid.name}
                              {liquid.conductivity === true && (
                                <Zap className="w-3 h-3 text-yellow-500" />
                              )}
                              {liquid.conductivity === false && (
                                <span className="text-muted-foreground">⛔</span>
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

                {/* MOC Recommendation moved to after sizing results */}

                {/* Properties Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Pressure
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={fromBar(state.liquidPressureBarAbs, state.liquidPressureUnit)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setLiquidPressure(val, state.liquidPressureUnit);
                        }}
                        min={0.001}
                        step={0.01}
                        className="flex-1"
                      />
                      <Select
                        value={state.liquidPressureUnit}
                        onValueChange={(u) => {
                          setLiquidPressure(fromBar(state.liquidPressureBarAbs, u as PressureUnit), u as PressureUnit);
                        }}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRESSURE_UNITS.map((u) => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {state.liquidPressureBarAbs.toFixed(3)} bar abs · Vortex rejected if &lt; 1.0 bar abs
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Density (kg/m³)
                      {state.autoCorrectedDensity && state.operatingTemp !== 20 && (
                        <Badge className="ml-2 bg-primary text-white text-[10px] px-1">auto-corrected</Badge>
                      )}
                    </Label>
                    <Input
                      type="number"
                      value={state.density}
                      onChange={(e) => setDensity(parseFloat(e.target.value) || 0)}
                      min={0}
                      step={1}
                      className={state.fluidValidation?.warnings.some(w => w.includes("density")) ? "border-amber-400" : ""}
                    />
                    {state.selectedLiquid && state.operatingTemp === 20 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Reference: {state.selectedLiquid.name} at 20°C = {state.selectedLiquid.density} kg/m³
                      </p>
                    )}
                    {state.autoCorrectedDensity && state.operatingTemp !== 20 && (
                      <p className="text-xs text-red-600 mt-1">
                        Vogel-Cameron + thermal expansion model applied for {state.operatingTemp}°C
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Specific Gravity</Label>
                    <div className="flex items-center h-9 px-3 rounded-md border bg-muted/50 text-sm font-medium">
                      SG = {state.specificGravity.toFixed(3)}
                      <span className="text-muted-foreground text-xs ml-1.5">
                        {state.service === "gas" ? "(air=1)" : "(water=1)"}
                      </span>
                    </div>
                    {state.meterCategory !== "inline" && state.service === "liquid" && (
                      <p className="text-xs text-blue-600 mt-1">
                        Rotameter correction: ÷√{state.specificGravity.toFixed(3)} = {(1/Math.sqrt(state.specificGravity)).toFixed(3)}x
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Viscosity (cP)
                      {state.autoCorrectedViscosity && state.operatingTemp !== 20 && (
                        <Badge className="ml-2 bg-primary text-white text-[10px] px-1">auto-corrected</Badge>
                      )}
                    </Label>
                    <Input
                      type="number"
                      value={state.viscosity}
                      onChange={(e) =>
                        setViscosity(parseFloat(e.target.value) || 0)
                      }
                      min={0}
                      step={0.01}
                      className={state.fluidValidation?.warnings.some(w => w.includes("viscosity")) ? "border-amber-400" : ""}
                    />
                    {state.selectedLiquid?.nonNewtonian && (
                      <p className="text-xs text-amber-600 mt-1 font-medium">
                        ⚠ Non-Newtonian — shear-rate dependent
                      </p>
                    )}
                    {state.selectedLiquid?.concentration && (
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        ℹ Concentration-dependent — verify on-site
                      </p>
                    )}
                    {state.autoCorrectedViscosity && state.operatingTemp !== 20 && (
                      <p className="text-xs text-red-600 mt-1">
                        Temperature-corrected from {state.selectedLiquid?.viscosity} cP at 20°C
                      </p>
                    )}
                    {/* ─── Viscosity Impact Warnings ─────────────────────────── */}
                    {/* Show IMMEDIATE warning when viscosity falls outside any product's limits */}
                    {state.viscosityImpactWarnings.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {state.viscosityImpactWarnings.map((w, i) => (
                          <div key={i} className="flex items-start gap-1.5 bg-red-50 border border-red-200 rounded px-2 py-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                            <span className="text-[11px] text-red-700 font-medium leading-tight">{w.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Operating Temp (°C)
                    </Label>
                    <Input
                      type="number"
                      value={state.operatingTemp}
                      onChange={(e) =>
                        setOperatingTemp(parseFloat(e.target.value) || 0)
                      }
                      step={1}
                    />
                    {state.selectedLiquid && state.operatingTemp !== 20 && (
                      <p className="text-xs text-amber-600 mt-1">
                        ℹ Adjust viscosity if temp differs from 20°C reference
                      </p>
                    )}
                    {/* ─── Temperature Impact Warnings ───────────────────────── */}
                    {state.temperatureImpactWarnings.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {state.temperatureImpactWarnings.map((w, i) => (
                          <div key={i} className="flex items-start gap-1.5 bg-orange-50 border border-orange-300 rounded px-2 py-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-orange-600 mt-0.5 shrink-0" />
                            <span className="text-[11px] text-orange-800 font-medium leading-tight">{w.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Fluid Validation Results */}
                {state.selectedLiquid && (
                  <div className="space-y-2">
                    {/* Auto-correction buttons */}
                    {(state.autoCorrectedDensity || state.autoCorrectedViscosity) && state.operatingTemp !== 20 && (
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-muted-foreground">Temperature-corrected values available:</span>
                        {state.autoCorrectedDensity && state.autoCorrectedDensity !== state.density && (
                          <button
                            onClick={() => setDensity(state.autoCorrectedDensity!)}
                            className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200 hover:bg-red-100"
                          >
                            Apply ρ = {state.autoCorrectedDensity} kg/m³
                          </button>
                        )}
                        {state.autoCorrectedViscosity && state.autoCorrectedViscosity !== state.viscosity && (
                          <button
                            onClick={() => setViscosity(state.autoCorrectedViscosity!)}
                            className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200 hover:bg-red-100"
                          >
                            Apply μ = {state.autoCorrectedViscosity} cP
                          </button>
                        )}
                      </div>
                    )}

                    {/* Validation Panel */}
                    {state.fluidValidation && (
                      <div className={`rounded-md p-3 space-y-2 ${
                        state.fluidValidation.errors.length > 0
                          ? "bg-red-50 border border-red-200"
                          : state.fluidValidation.warnings.length > 0
                          ? "bg-amber-50 border border-amber-200"
                          : "bg-green-50 border border-green-200"
                      }`}>
                        <h4 className="text-xs font-semibold uppercase flex items-center gap-2">
                          {state.fluidValidation.errors.length > 0 ? (
                            <><XCircle className="w-3.5 h-3.5 text-red-600" /> <span className="text-red-700">Fluid Validation Errors</span></>
                          ) : state.fluidValidation.warnings.length > 0 ? (
                            <><AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> <span className="text-amber-700">Fluid Validation Warnings</span></>
                          ) : (
                            <><CheckCircle className="w-3.5 h-3.5 text-green-600" /> <span className="text-green-700">Fluid Properties Valid</span></>
                          )}
                          <Badge variant="outline" className="text-[10px] ml-auto">
                            {state.fluidValidation.confidence} confidence
                          </Badge>
                        </h4>

                        {state.fluidValidation.errors.map((err, i) => (
                          <p key={`e${i}`} className="text-xs text-red-700 flex items-start gap-1">
                            <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                            {err}
                          </p>
                        ))}
                        {state.fluidValidation.warnings.map((warn, i) => (
                          <p key={`w${i}`} className="text-xs text-amber-700 flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                            {warn}
                          </p>
                        ))}
                        {state.fluidValidation.info.map((info, i) => (
                          <p key={`i${i}`} className="text-xs text-red-700 flex items-start gap-1">
                            <span className="text-red-500">ℹ</span>
                            {info}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Flow Rate + Pipe Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Lower Flow Rate (Qmin)
                    </Label>
                    <Input
                      type="number"
                      value={state.flowRateMin}
                      onChange={(e) =>
                        setFlowRateMin(parseFloat(e.target.value) || 0)
                      }
                      min={0}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Higher Flow Rate (Qmax)
                    </Label>
                    <Input
                      type="number"
                      value={state.flowRateMax}
                      onChange={(e) =>
                        setFlowRateMax(parseFloat(e.target.value) || 0)
                      }
                      min={0}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Unit
                    </Label>
                    <Select
                      value={state.flowUnit}
                      onValueChange={(v) => {
                        setFlowUnit(v);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getUnitsForService("liquid").map((u) => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Pipe Size — enables velocity checks in anomaly detector */}
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Pipe Size <span className="text-[10px] font-normal text-gray-400">(for velocity check)</span>
                    </Label>
                    <Select
                      value={state.pipeSizeNominal}
                      onValueChange={(v) => setPipeSize(v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["DN15","DN20","DN25","DN32","DN40","DN50","DN65","DN80","DN100","DN125","DN150","DN200","DN250","DN300"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                

                {/* === P2: Multi-Condition Sizing Toggle (MIN / NORM / MAX) === */}
                <div className="flex items-center gap-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-md">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.useMultiCondition}
                      onChange={(e) => calc.setUseMultiCondition(e.target.checked)}
                      className="w-4 h-4 accent-red-600"
                    />
                    <span className="text-xs font-bold text-slate-700">Multi-Condition Sizing (MIN / NORM / MAX)</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Check if one meter must cover all operating conditions</span>
                </div>

                {/* P2: NORM and MAX flow inputs */}
                {state.useMultiCondition && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 border border-blue-200 rounded-md">
                      <div className="col-span-2 text-[10px] font-bold text-blue-700 uppercase tracking-wide">Normal Operating Condition</div>
                      <div>
                        <Label className="text-xs font-medium mb-1 block text-blue-700">NORM Low Flow</Label>
                        <Input type="number" value={state.normFlowRateMin} onChange={(e) => calc.setNormFlowRateMin(parseFloat(e.target.value) || 0)} className="bg-white" min={0} step={0.1} />
                      </div>
                      <div>
                        <Label className="text-xs font-medium mb-1 block text-blue-700">NORM High Flow</Label>
                        <Input type="number" value={state.normFlowRateMax} onChange={(e) => calc.setNormFlowRateMax(parseFloat(e.target.value) || 0)} className="bg-white" min={0} step={0.1} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-3 bg-red-50/50 border border-red-200 rounded-md">
                      <div className="col-span-2 text-[10px] font-bold text-red-700 uppercase tracking-wide">Maximum (Upset) Condition</div>
                      <div>
                        <Label className="text-xs font-medium mb-1 block text-red-700">MAX Low Flow</Label>
                        <Input type="number" value={state.maxFlowRateMin} onChange={(e) => calc.setMaxFlowRateMin(parseFloat(e.target.value) || 0)} className="bg-white" min={0} step={0.1} />
                      </div>
                      <div>
                        <Label className="text-xs font-medium mb-1 block text-red-700">MAX High Flow</Label>
                        <Input type="number" value={state.maxFlowRateMax} onChange={(e) => calc.setMaxFlowRateMax(parseFloat(e.target.value) || 0)} className="bg-white" min={0} step={0.1} />
                      </div>
                    </div>
                  </div>
                )}
{/* Unit Conversion Warnings */}
                {state.unitConversion && state.unitConversion.warnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    {state.unitConversion.warnings.map((w, i) => (
                      <p key={i} className="text-xs text-amber-700 flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                        {w}
                      </p>
                    ))}
                  </div>
                )}

                {/* Missing Parameter Highlight */}
                {state.unitConversion && state.unitConversion.missingParams.includes("density") && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-xs text-red-700 font-medium">
                      <XCircle className="w-3 h-3 inline mr-1" />
                      Unit &quot;{state.flowUnit}&quot; requires density. Please enter a valid density (&gt; 0 kg/m³) above.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* ========== GAS TAB ========== */}
              <TabsContent value="gas" className="space-y-4 mt-4">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <Wind className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Gas Service</h3>
                      <p className="text-sm text-red-700 mt-1">
                        Select a gas from the {GASES_DB.length}-gas database.
                        Density and viscosity auto-calculate from P and T.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gas Name Search */}
                <div className="relative" ref={gasSearchRef}>
                  <Label className="text-sm font-medium mb-1.5 block">
                    Name of Gas ({GASES_DB.length} gases)
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Type gas name, formula, or category..."
                      value={gasSearchQuery}
                      onChange={(e) => {
                        setGasSearchQuery(e.target.value);
                        setShowGasDropdown(true);
                        if (e.target.value === "") setSelectedGas(null);
                      }}
                      onFocus={() => gasSearchQuery.length > 0 && setShowGasDropdown(true)}
                      className="pl-9"
                    />
                  </div>
                  {showGasDropdown && gasSearchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-72 overflow-auto">
                      {gasSearchResults.map((gas, idx) => (
                        <button
                          key={idx}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-0 flex items-center justify-between"
                          onClick={() => handleSelectGas(gas)}
                        >
                          <div>
                            <div className="font-medium text-sm flex items-center gap-2">
                              {gas.name}
                              {gas.notes?.includes("Toxic") && (
                                <Badge variant="destructive" className="text-[10px] px-1 py-0">TOXIC</Badge>
                              )}
                              {gas.notes?.includes("flammable") && (
                                <Badge className="bg-amber-500 text-[10px] px-1 py-0">FLAM</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {gas.formula} · {gas.category}
                              {gas.typicalPressure && ` · ${gas.typicalPressure}`}
                            </div>
                          </div>
                          <div className="text-xs text-right text-muted-foreground">
                            <div>ρ: {gas.density} kg/m³ · SG(air): {gas.specificGravity}</div>
                            <div>MW: {gas.molecularWeight} g/mol</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* MOC Recommendation moved to after sizing results */}

                {/* Gas Properties Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Operating Pressure
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={fromBar(state.gasPressureBarAbs, state.gasPressureUnit)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setGasPressure(val, state.gasPressureUnit);
                        }}
                        min={0.001}
                        step={0.01}
                        className="flex-1"
                      />
                      <Select
                        value={state.gasPressureUnit}
                        onValueChange={(u) => {
                          setGasPressure(fromBar(state.gasPressureBarAbs, u as PressureUnit), u as PressureUnit);
                        }}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRESSURE_UNITS.map((u) => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {state.gasPressureBarAbs.toFixed(3)} bar abs
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Operating Temp (°C)
                    </Label>
                    <Input
                      type="number"
                      value={state.operatingTemp}
                      onChange={(e) => {
                        const temp = parseFloat(e.target.value) || 0;
                        setOperatingTemp(temp);
                        // Recalculate density with new temp using selected gas
                        if (state.selectedGas) {
                          const rho = calculateGasDensity(state.selectedGas, state.gasPressureBarAbs, temp);
                          setDensity(rho);
                        } else {
                          const tK = temp + 273.15;
                          const rho = (state.gasPressureBarAbs * 100000 * 0.02897) / (8.314 * tK);
                          setDensity(parseFloat(rho.toFixed(3)));
                        }
                      }}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Density (kg/m³)
                    </Label>
                    <Input
                      type="number"
                      value={state.density}
                      onChange={(e) => setDensity(parseFloat(e.target.value) || 0)}
                      min={0}
                      step={0.0001}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {state.selectedGas
                        ? `Auto from ${state.selectedGas.name}`
                        : "Auto from P,T for air"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Specific Gravity</Label>
                    <div className="flex items-center h-9 px-3 rounded-md border bg-muted/50 text-sm font-medium">
                      SG(air=1) = {state.specificGravity.toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Viscosity (cP)
                    </Label>
                    <Input
                      type="number"
                      value={state.viscosity}
                      onChange={(e) =>
                        setViscosity(parseFloat(e.target.value) || 0)
                      }
                      min={0}
                      step={0.0001}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {state.selectedGas
                        ? `Auto from ${state.selectedGas.name}`
                        : "Default: 0.018 cP"}
                    </p>
                  </div>
                </div>

                {/* Selected Gas Info */}
                {state.selectedGas && (
                  <div className="bg-gray-50 border rounded-md p-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      Selected Gas Properties
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="bg-white rounded-md px-3 py-2">
                        <div className="text-xs text-muted-foreground">Formula</div>
                        <div className="font-semibold text-sm">{state.selectedGas.formula}</div>
                      </div>
                      <div className="bg-white rounded-md px-3 py-2">
                        <div className="text-xs text-muted-foreground">Mol. Weight</div>
                        <div className="font-semibold text-sm">{state.selectedGas.molecularWeight} g/mol</div>
                      </div>
                      <div className="bg-white rounded-md px-3 py-2">
                        <div className="text-xs text-muted-foreground">Density (STP)</div>
                        <div className="font-semibold text-sm">{state.selectedGas.density} kg/m³</div>
                      </div>
                      <div className="bg-white rounded-md px-3 py-2">
                        <div className="text-xs text-muted-foreground">Viscosity (STP)</div>
                        <div className="font-semibold text-sm">{state.selectedGas.viscosity} cP</div>
                      </div>
                      <div className="bg-white rounded-md px-3 py-2">
                        <div className="text-xs text-muted-foreground">Gamma (Cp/Cv)</div>
                        <div className="font-semibold text-sm">{state.selectedGas.gamma}</div>
                      </div>
                    </div>
                    {state.selectedGas.notes && (
                      <p className="text-xs text-amber-600 mt-2">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {state.selectedGas.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* ─── Gas Wetness / Dew Point Warning ─── */}
                {state.calculated && state.gasWetness && (
                  <div
                    className={`border-2 rounded-md p-3 flex items-start gap-3 ${
                      state.gasWetness.isWet
                        ? "bg-red-50 border-red-500"
                        : state.gasWetness.marginC && state.gasWetness.marginC < 15
                        ? "bg-amber-50 border-amber-500"
                        : "bg-green-50 border-green-500"
                    }`}
                  >
                    {state.gasWetness.isWet ? (
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    ) : state.gasWetness.marginC && state.gasWetness.marginC < 15 ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div
                        className={`text-sm font-bold uppercase tracking-wider ${
                          state.gasWetness.isWet
                            ? "text-red-700"
                            : state.gasWetness.marginC && state.gasWetness.marginC < 15
                            ? "text-amber-700"
                            : "text-green-700"
                        }`}
                      >
                        {state.gasWetness.isWet
                          ? "WET GAS — Condensation Risk"
                          : state.gasWetness.marginC && state.gasWetness.marginC < 15
                          ? "Near Dew Point — Caution"
                          : "Dry Gas — Safe"}
                      </div>
                      <div
                        className={`text-xs mt-1 leading-relaxed ${
                          state.gasWetness.isWet
                            ? "text-red-800"
                            : state.gasWetness.marginC && state.gasWetness.marginC < 15
                            ? "text-amber-800"
                            : "text-green-800"
                        }`}
                      >
                        {state.gasWetness.message}
                        {state.gasWetness.isWet && (
                          <span className="text-red-900 font-bold">
                            {" "}
                            Vortex Flowmeter will NOT be recommended.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Flow Rate + Pipe Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Lower Flow Rate (Qmin)
                    </Label>
                    <Input
                      type="number"
                      value={state.flowRateMin}
                      onChange={(e) =>
                        setFlowRateMin(parseFloat(e.target.value) || 0)
                      }
                      min={0}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Higher Flow Rate (Qmax)
                    </Label>
                    <Input
                      type="number"
                      value={state.flowRateMax}
                      onChange={(e) =>
                        setFlowRateMax(parseFloat(e.target.value) || 0)
                      }
                      min={0}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Unit
                    </Label>
                    <Select
                      value={state.flowUnit}
                      onValueChange={setFlowUnit}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getUnitsForService("gas").map((u) => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Pipe Size — enables velocity checks in anomaly detector */}
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Pipe Size <span className="text-[10px] font-normal text-gray-400">(for velocity check)</span>
                    </Label>
                    <Select
                      value={state.pipeSizeNominal}
                      onValueChange={(v) => setPipeSize(v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["DN15","DN20","DN25","DN32","DN40","DN50","DN65","DN80","DN100","DN125","DN150","DN200","DN250","DN300"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Unit Conversion Warnings */}
                {state.unitConversion && state.unitConversion.warnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    {state.unitConversion.warnings.map((w, i) => (
                      <p key={i} className="text-xs text-amber-700 flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                        {w}
                      </p>
                    ))}
                  </div>
                )}

                {/* Missing Parameter Highlights */}
                {state.unitConversion && state.unitConversion.missingParams.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    {state.unitConversion.missingParams.includes("density") && (
                      <p className="text-xs text-red-700 font-medium">
                        <XCircle className="w-3 h-3 inline mr-1" />
                        Unit &quot;{state.flowUnit}&quot; requires gas density. Select a gas above.
                      </p>
                    )}
                    {state.unitConversion.missingParams.includes("pressure") && (
                      <p className="text-xs text-red-700 font-medium">
                        <XCircle className="w-3 h-3 inline mr-1" />
                        Unit &quot;{state.flowUnit}&quot; requires absolute pressure. Enter pressure above.
                      </p>
                    )}
                    {state.unitConversion.missingParams.includes("temperature") && (
                      <p className="text-xs text-red-700 font-medium">
                        <XCircle className="w-3 h-3 inline mr-1" />
                        Unit &quot;{state.flowUnit}&quot; requires temperature. Enter temperature above.
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* ========== STEAM TAB ========== */}
              <TabsContent value="steam" className="space-y-4 mt-4">
                <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <Flame className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-900">
                        Steam Measurement
                      </h3>
                      <p className="text-sm text-orange-700 mt-1">
                        Enter Pressure and Temperature to calculate Density.
                        Qmin/Qmax are interpolated from Flowtech factory tables (2-20 bar abs).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pressure + Temperature Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Pressure *
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={fromBar(state.steamPressureBarAbs, state.steamPressureUnit)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSteamPressure(val, state.steamPressureUnit);
                        }}
                        min={0.001}
                        step={0.01}
                        className="flex-1"
                      />
                      <Select
                        value={state.steamPressureUnit}
                        onValueChange={(u) => {
                          setSteamPressure(fromBar(state.steamPressureBarAbs, u as PressureUnit), u as PressureUnit);
                        }}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRESSURE_UNITS.map((u) => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {state.steamPressureBarAbs.toFixed(3)} bar abs (Range: 2-20 bar abs)
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Temperature (°C) *
                    </Label>
                    <Input
                      type="number"
                      value={state.steamTempC}
                      onChange={(e) =>
                        setSteamTempC(parseFloat(e.target.value) || 0)
                      }
                      min={120}
                      max={220}
                      step={0.1}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {state.steamState === "saturated" && (
                        <span className="text-green-600 font-medium">
                          Saturated steam detected
                        </span>
                      )}
                      {state.steamState === "superheated" && (
                        <span className="text-green-600 font-bold">
                          <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                          Superheated steam detected
                        </span>
                      )}
                      {state.steamState === "wet" && (
                        <span className="text-red-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          WET STEAM — Vortex Flowmeter will NOT be recommended
                        </span>
                      )}
                      {state.steamState === "" && (
                        <span>Enter P and T to calculate</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Calculated Properties */}
                <div className="bg-gray-50 border rounded-md p-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Calculated Steam Properties
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-white rounded-md px-3 py-2">
                      <div className="text-xs text-muted-foreground">Density</div>
                      <div className="font-semibold text-sm">
                        {state.steamDensity > 0 ? state.steamDensity.toFixed(3) : "--"} kg/m³
                      </div>
                    </div>
                    <div className="bg-white rounded-md px-3 py-2">
                      <div className="text-xs text-muted-foreground">Specific Gravity</div>
                      <div className="font-semibold text-sm">
                        {state.steamDensity > 0 ? (state.steamDensity / 1000).toFixed(5) : "--"}
                      </div>
                    </div>
                    <div className="bg-white rounded-md px-3 py-2">
                      <div className="text-xs text-muted-foreground">Pressure (abs)</div>
                      <div className="font-semibold text-sm">
                        {state.steamPressureBarAbs.toFixed(3)} bar
                      </div>
                    </div>
                    <div className="bg-white rounded-md px-3 py-2">
                      <div className="text-xs text-muted-foreground">Temperature</div>
                      <div className="font-semibold text-sm">
                        {state.steamTempC.toFixed(1)}°C
                      </div>
                    </div>
                    <div className="bg-white rounded-md px-3 py-2">
                      <div className="text-xs text-muted-foreground">State</div>
                      <div className="font-semibold text-sm capitalize">
                        {state.steamState || "--"}
                      </div>
                    </div>
                  </div>
                  {state.steamNote && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {state.steamNote}
                    </p>
                  )}
                </div>

                {/* MOC Recommendation moved to after sizing results */}

                {/* Wet Steam Warning Banner */}
                {state.steamState === "wet" && (
                  <div className="bg-red-950/80 border border-red-500 rounded-md p-3 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-red-400 uppercase tracking-wider">
                        Wet Steam — Vortex Flowmeter Excluded
                      </div>
                      <div className="text-xs text-red-300/80 mt-1 leading-relaxed">
                        Wet steam is a two-phase mixture (liquid water droplets + gaseous steam).
                        Vortex shedding is erratic in two-phase flow, causing large measurement errors.
                        <strong className="text-red-200"> Vortex Flowmeter will NOT be recommended.</strong>
                        {" "}Use only with <strong className="text-red-200">dry saturated</strong> or{" "}
                        <strong className="text-red-200">superheated steam</strong>.
                      </div>
                    </div>
                  </div>
                )}

                {/* Flow Rate + Pipe Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Lower Flow Rate (Qmin)
                    </Label>
                    <Input
                      type="number"
                      value={state.flowRateMin}
                      onChange={(e) =>
                        setFlowRateMin(parseFloat(e.target.value) || 0)
                      }
                      min={0}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Higher Flow Rate (Qmax)
                    </Label>
                    <Input
                      type="number"
                      value={state.flowRateMax}
                      onChange={(e) =>
                        setFlowRateMax(parseFloat(e.target.value) || 0)
                      }
                      min={0}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Unit
                    </Label>
                    <Select
                      value={state.flowUnit}
                      onValueChange={setFlowUnit}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getUnitsForService("steam").map((u) => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Pipe Size — enables velocity checks in anomaly detector */}
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">
                      Pipe Size <span className="text-[10px] font-normal text-gray-400">(for velocity check)</span>
                    </Label>
                    <Select
                      value={state.pipeSizeNominal}
                      onValueChange={(v) => setPipeSize(v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["DN15","DN20","DN25","DN32","DN40","DN50","DN65","DN80","DN100","DN125","DN150","DN200","DN250","DN300"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Unit Conversion Warnings */}
                {state.unitConversion && state.unitConversion.warnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    {state.unitConversion.warnings.map((w, i) => (
                      <p key={i} className="text-xs text-amber-700 flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                        {w}
                      </p>
                    ))}
                  </div>
                )}

                {/* Missing Parameter Highlight */}
                {state.unitConversion && state.unitConversion.missingParams.includes("density") && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-xs text-red-700 font-medium">
                      <XCircle className="w-3 h-3 inline mr-1" />
                      Unit &quot;{state.flowUnit}&quot; requires steam density. Enter pressure &amp; temperature above to auto-calculate.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Calculate Button */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={calculate}
                className="flex-1 bg-primary hover:bg-[#c20017] text-white gap-2"
                size="lg"
              >
                <BarChart3 className="w-5 h-5" />
                Calculate Sizes
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ─── METER CATEGORY SELECTOR ─────────────────────────────── */}
        {/* User selects Inline vs Variable Area BEFORE entering process params */}
        <Card className="border-primary/30">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <Label className="text-sm font-bold uppercase tracking-wider text-primary">
                Select Flowmeter Category
              </Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setMeterCategory("inline")}
                className={`border-2 rounded-lg p-3 text-left transition-all ${
                  state.meterCategory === "inline"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    state.meterCategory === "inline" ? "border-primary" : "border-gray-300"
                  }`}>
                    {state.meterCategory === "inline" && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${state.meterCategory === "inline" ? "text-primary" : "text-gray-700"}`}>
                      Inline Flowmeters
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                      EMF · TFM · VFM · Ultrasonic · Oval Gear
                    </div>
                  </div>
                </div>
              </button>

              {state.service === "liquid" && (
                <button
                  onClick={() => setMeterCategory("rotameter")}
                  className={`border-2 rounded-lg p-3 text-left transition-all ${
                    state.meterCategory === "rotameter"
                      ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      state.meterCategory === "rotameter" ? "border-amber-500" : "border-gray-300"
                    }`}>
                      {state.meterCategory === "rotameter" && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${state.meterCategory === "rotameter" ? "text-amber-700" : "text-gray-700"}`}>
                        Variable Area
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                        Glass Tube Rotameters (SS316 / PTFE)
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {state.service === "liquid" && (
                <button
                  onClick={() => setMeterCategory("both")}
                  className={`border-2 rounded-lg p-3 text-left transition-all ${
                    state.meterCategory === "both"
                      ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      state.meterCategory === "both" ? "border-green-600" : "border-gray-300"
                    }`}>
                      {state.meterCategory === "both" && <div className="w-2 h-2 rounded-full bg-green-600" />}
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${state.meterCategory === "both" ? "text-green-700" : "text-gray-700"}`}>
                        Both Categories
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                        Inline + Variable Area sizing
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {state.service !== "liquid" && (
                <div className="col-span-2 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-3">
                  <span className="text-xs text-muted-foreground">
                    Rotameters available for <strong>Liquid</strong> service only
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Flow Sizing Anomaly Panel — ALL SERVICES */}
        {(state.service === "liquid" || state.service === "gas" || state.service === "steam") && flowAnomalies.length > 0 && (
          <FlowAnomalyPanel anomalies={flowAnomalies} />
        )}

        {/* Results Section */}
        {state.calculated && (
          <>
            {/* ─── CRITICAL ANOMALY BLOCKER ─── */}
            {/* When critical anomalies exist, block ALL product recommendations */}
            {flowAnomalies.some((a) => a.severity === "critical") && (
              <Card className="border-red-400 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-red-800">
                    <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                    <span>CALCULATION BLOCKED — Critical Process Anomalies Detected</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-red-700">
                    The process conditions contain critical issues that make flow measurement impossible or dangerous with standard flowmeters. No product can be recommended until these issues are resolved.
                  </p>
                  <div className="space-y-2">
                    {flowAnomalies
                      .filter((a) => a.severity === "critical")
                      .map((a, i) => (
                        <div key={i} className="bg-white border border-red-300 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                            <span className="text-sm font-bold text-red-800">{a.title}</span>
                            <Badge className="text-[9px] px-1.5 py-0 bg-red-200 text-red-800 font-bold">CRITICAL</Badge>
                          </div>
                          <p className="text-xs text-red-700">{a.message}</p>
                          {a.suggestion && (
                            <p className="text-xs text-red-600 mt-1 italic">
                              <b>Fix:</b> {a.suggestion}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                  <p className="text-xs text-red-500 mt-2">
                    Please correct the process conditions and click <b>Calculate Sizes</b> again. If you believe these conditions are correct, contact Flowtech engineering for a custom solution.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* ─── INLINE FLOWMETER RESULTS ─── */}
            {/* Only show results if NO critical anomalies */}
            {state.meterCategory !== "rotameter" && !flowAnomalies.some((a) => a.severity === "critical") && (
            <>
            {/* FLOW RATE vs PIPE SIZE EXPLAINER */}
            {/* Always show this reminder — meter is sized by flow rate, not pipe size */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-blue-800">Meter sizing is based on FLOW RATE, not pipe size.</span>
                <span className="text-xs text-blue-700 ml-1">The recommended meter size may differ from your pipe size — this is correct engineering. Use reducers/expanders as needed.</span>
                {flowAnomalies.some((a) => a.code.startsWith("VELOCITY_")) && (
                  <span className="text-xs text-amber-700 block mt-0.5">⚠ Velocity warning detected in your pipe — see anomaly panel above. The meter recommendation below is NOT affected.</span>
                )}
              </div>
            </div>

            {/* AI Recommendations - Clean Compact View */}
            <Card className="print:shadow-none print:border-2">
              <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <span className="text-base sm:text-lg">Recommended Sizes</span>
                </CardTitle>
                {/* Sizing Report — opens inline panel with all charts */}
                <Button
                  variant="outline"
                  onClick={openInlineSizingReport}
                  className="gap-2 text-sm print:hidden w-full sm:w-auto min-h-[44px] bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 active:bg-red-800"
                >
                  <FileText className="w-4 h-4" />
                  Sizing Report
                </Button>
              </CardHeader>
              {/* P2: Multi-Condition All-Covered Banner */}
              {state.useMultiCondition && validResults.some((r) => r.allConditionsCovered) && (
                <div className="mx-2 sm:mx-6 mb-2 bg-green-100 border border-green-400 rounded-md px-3 sm:px-4 py-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-xs font-bold text-green-800">
                    ✓ ONE meter covers MIN + NORM + MAX — optimal
                  </span>
                </div>
              )}
              {state.useMultiCondition && !validResults.some((r) => r.allConditionsCovered) && (
                <div className="mx-2 sm:mx-6 mb-2 bg-amber-100 border border-amber-400 rounded-md px-3 sm:px-4 py-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-amber-800">
                    ⚠ No single meter covers all three conditions — consider dual-meter
                  </span>
                </div>
              )}
              <CardContent className="space-y-4">
                {/* Service summary for print */}
                <div className="text-xs text-muted-foreground bg-gray-50 rounded-md px-3 py-2 print:bg-white print:border">
                  <strong>Service:</strong> {state.service === "liquid" ? "Liquids" : state.service === "gas" ? "Gas" : "Steam"}
                  {" · "}<strong>Flow Range:</strong> {state.flowRateMin} – {state.flowRateMax} {state.flowUnit}
                  {" · "}<strong>Density:</strong> {state.density} kg/m³
                  {" · "}<strong>Viscosity:</strong> {state.viscosity} cP
                  {" · "}<strong>Temp:</strong> {state.operatingTemp}°C
                  {state.service === "liquid" && (
                    <> · <strong>Pressure:</strong> {state.liquidPressureBarAbs.toFixed(2)} bar abs</>
                  )}
                  {state.service === "gas" && (
                    <> · <strong>Pressure:</strong> {state.gasPressureBarAbs.toFixed(2)} bar abs</>
                  )}
                  {state.service === "steam" && (
                    <> · <strong>Pressure:</strong> {state.steamPressureBarAbs.toFixed(2)} bar abs</>
                  )}
                </div>

                {/* Rejected summary - compact */}
                {rejectedResults.length > 0 && (
                  <div className="text-xs text-red-600 bg-red-50 rounded-md px-3 py-2">
                    <XCircle className="w-3 h-3 inline mr-1" />
                    <strong>Rejected:</strong>{" "}
                    {rejectedResults.map((r) => r.product.name).join(", ")}
                    {" — "}{rejectedResults[0]?.reason}
                  </div>
                )}

                {/* Results */}
                {validResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-amber-500" />
                    <p>No suitable sizes found. Check your input parameters.</p>
                  </div>
                ) : (
                  validResults.map((result) => {
                    const goodSizes = result.sizes.filter(
                      (s) => s.status === "optimal" || s.status === "valid" || s.status === "partial-low" || s.status === "partial-high"
                    );
                    const allSizes = result.sizes;
                    // For products with no valid sizes, find the nearest size to guide user
                    const nearestSize = allSizes.length > 0 && goodSizes.length === 0
                      ? allSizes.reduce((prev, curr) => {
                          const prevDiff = Math.abs(prev.percentage - 50);
                          const currDiff = Math.abs(curr.percentage - 50);
                          return currDiff < prevDiff ? curr : prev;
                        })
                      : null;

                    return (
                      <div
                        key={result.product.name}
                        className={`border rounded-lg overflow-hidden ${
                          result.status === "best"
                            ? "border-green-400 ring-1 ring-green-400"
                            : "border-blue-300"
                        }`}
                      >
                        {/* Product Header */}
                        <button
                          className={`w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 text-left transition-colors gap-1 sm:gap-0 ${
                            result.status === "best"
                              ? "bg-green-50 hover:bg-green-100"
                              : "bg-blue-50 hover:bg-blue-100"
                          }`}
                          onClick={() => toggleProduct(result.product.name)}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={result.status} />
                            <div>
                              <h3 className="font-semibold text-sm">
                                {result.product.name}
                                {result.product.accuracy && (
                                  <Badge className="ml-2 text-[10px] bg-gray-800 text-white px-1.5 py-0">
                                    ±{result.product.accuracy}% MV
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {goodSizes.length > 0
                                  ? `${goodSizes.length} matching size${goodSizes.length > 1 ? "s" : ""} · Best: ${result.bestSize}`
                                  : nearestSize
                                  ? `Flow outside range · Range: ${toDisplayUnit(allSizes[0]?.qMin).toFixed(2)}–${toDisplayUnit(allSizes[allSizes.length - 1]?.qMax).toFixed(1)} ${state.flowUnit}`
                                  : "No sizes available"
                                }
                                {goodSizes[0]?.accuracy && (
                                  <span className="ml-1 text-primary font-medium">
                                    · Highest accuracy at median
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                            {expandedProducts.has(result.product.name) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>

                        {/* Size Details - valid/optimal sizes, or nearest size if none match */}
                        {expandedProducts.has(result.product.name) && (
                          <div className="p-3 bg-white">
                            {/* No matching sizes — show helpful message */}
                            {goodSizes.length === 0 && nearestSize && (
                              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
                                <p className="text-xs text-amber-700 flex items-start gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                  <span>
                                    Your flow rate is outside this product range.
                                    {allSizes[0] && state.unitConversion?.convertedValue && state.unitConversion.convertedValue < allSizes[0].qMin
                                      ? ` Minimum flow for this product is ${toDisplayUnit(allSizes[0].qMin).toFixed(3)} ${state.flowUnit}.`
                                      : allSizes[allSizes.length - 1] && state.unitConversion?.convertedValue && state.unitConversion.convertedValue > allSizes[allSizes.length - 1].qMax
                                      ? ` Maximum flow for this product is ${toDisplayUnit(allSizes[allSizes.length - 1].qMax).toFixed(1)} ${state.flowUnit}.`
                                      : ""}
                                  </span>
                                </p>
                              </div>
                            )}
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b text-muted-foreground text-xs uppercase">
                                    <th className="text-left px-2 py-1.5">Size</th>
                                    <th className="text-right px-2 py-1.5">Qmin ({state.flowUnit})</th>
                                    <th className="text-right px-2 py-1.5">Qmax ({state.flowUnit})</th>
                                    <th className="text-right px-2 py-1.5 bg-yellow-50 border-x border-yellow-200">
                                      <Gauge className="w-3 h-3 inline mr-1" />
                                      v @ Qmin–Qmax (m/s)
                                    </th>
                                    <th className="text-right px-2 py-1.5">Meter Rated (m/s)</th>
                                    <th className="text-right px-2 py-1.5">Median ({state.flowUnit})</th>
                                    <th className="text-right px-2 py-1.5">From Median</th>
                                    <th className="text-right px-2 py-1.5 bg-blue-50 border-x border-blue-200">
                                      ±Uncertainty
                                    </th>
                                    <th className="text-right px-2 py-1.5">ΔP (bar)</th>
                                    {state.useMultiCondition && result.multiConditionCoverage && (
                                      <th className="text-center px-2 py-1.5 bg-green-50 border-x border-green-200 text-[9px]">
                                        MIN·NORM·MAX
                                      </th>
                                    )}
                                    <th className="text-left px-2 py-1.5">Status</th>
                                    <th className="text-center px-2 py-1.5">Report</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(goodSizes.length > 0 ? goodSizes : nearestSize ? [nearestSize] : []).map((size) => (
                                    <tr
                                      key={size.size}
                                      className={`border-b last:border-0 ${
                                        size.status === "optimal"
                                          ? "bg-green-50"
                                          : ""
                                      }`}
                                    >
                                      <td className="px-2 py-1.5 font-mono text-xs font-medium">
                                        {size.size}
                                        {size.isOddSize && (
                                          <Badge className="ml-1 text-[8px] bg-amber-100 text-amber-700 border-amber-300 px-1 py-0">Odd Size</Badge>
                                        )}
                                        {size.status === "optimal" && (
                                          <Trophy className="inline w-3 h-3 ml-1 text-green-600" />
                                        )}
                                        {result.bestSize === size.size && (
                                          <Badge className="ml-1 text-[9px] bg-gray-800 text-white px-1 py-0">BEST</Badge>
                                        )}
                                      </td>
                                      <td className="px-2 py-1.5 text-xs tabular-nums text-right text-muted-foreground">
                                        {toDisplayUnit(size.qMin).toFixed(1)}
                                      </td>
                                      <td className="px-2 py-1.5 text-xs tabular-nums text-right text-muted-foreground">
                                        {toDisplayUnit(size.qMax).toFixed(1)}
                                      </td>
                                      <td className="px-2 py-1.5 text-xs tabular-nums text-right font-semibold bg-yellow-50 border-x border-yellow-100">
                                        {size.velocityAtQmin.toFixed(2)}–{size.velocityAtQmax.toFixed(2)}
                                      </td>
                                      <td className="px-2 py-1.5 text-xs tabular-nums text-right text-muted-foreground">
                                        {size.meterVmin.toFixed(1)}–{size.meterVmax.toFixed(1)}
                                      </td>
                                      <td className="px-2 py-1.5 text-xs tabular-nums text-right text-muted-foreground">
                                        {toDisplayUnit(size.median).toFixed(1)}
                                      </td>
                                      <td className="px-2 py-1.5 text-xs text-right">
                                        <AccuracyBar distance={size.distanceFromMedian} />
                                      </td>
                                      <td className="px-2 py-1.5 text-xs tabular-nums text-right font-medium bg-blue-50 border-x border-blue-100">
                                        ±{size.uncertaintyPercent.toFixed(2)}%
                                      </td>
                                      <td className="px-2 py-1.5 text-xs tabular-nums text-right text-muted-foreground">
                                        {size.dpAtInput < 0.001 ? "<0.001" : size.dpAtInput.toFixed(3)}
                                      </td>
                                      {/* P2: Multi-condition coverage dots */}
                                      {state.useMultiCondition && result.multiConditionCoverage && (
                                        <td className="px-2 py-1.5 text-center bg-green-50 border-x border-green-100">
                                          {(() => {
                                            const cov = result.multiConditionCoverage![size.size];
                                            if (!cov) return <span className="text-[10px] text-gray-400">—</span>;
                                            return (
                                              <div className="flex items-center justify-center gap-1">
                                                <span className={`w-2.5 h-2.5 rounded-full ${cov.minCovers ? "bg-green-500" : "bg-gray-300"}`} title={`MIN: ${cov.minCovers ? "Covered" : "Not covered"}`} />
                                                <span className={`w-2.5 h-2.5 rounded-full ${cov.normCovers ? "bg-blue-500" : "bg-gray-300"}`} title={`NORM: ${cov.normCovers ? "Covered" : "Not covered"}`} />
                                                <span className={`w-2.5 h-2.5 rounded-full ${cov.maxCovers ? "bg-red-500" : "bg-gray-300"}`} title={`MAX: ${cov.maxCovers ? "Covered" : "Not covered"}`} />
                                                {cov.allCovered && <span className="text-[8px] font-bold text-green-700 ml-0.5">✓</span>}
                                              </div>
                                            );
                                          })()}
                                        </td>
                                      )}
                                      <td className="px-2 py-1.5">
                                        {size.status === "optimal" ? (
                                          <Badge className="bg-green-600 text-white text-[10px] px-1.5 py-0">Optimal</Badge>
                                        ) : size.status === "valid" ? (
                                          <Badge className="bg-primary text-white text-[10px] px-1.5 py-0">Valid</Badge>
                                        ) : (
                                          <Badge className="bg-gray-500 text-white text-[10px] px-1.5 py-0">{size.status}</Badge>
                                        )}
                                      </td>
                                      <td className="px-2 py-1.5 text-center">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => openInlineSizingReport(result, size)}
                                          className="h-6 px-2 py-0 text-[10px] gap-1 bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                                        >
                                          <FileText className="w-3 h-3" />
                                          Report
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2">
                              Display unit: {state.flowUnit} (sized in {goodSizes[0]?.unit || ""}) · Accuracy: {goodSizes[0]?.accuracy || "—"} · ΔP = pressure loss at input flow · Yellow = velocity · Green bar = closeness to median (higher = more accurate)
                            </p>

                            {/* ─── AI MOC Recommendation (per-product, inline) ─── */}
                            {state.mocRecommendation && (
                              <ProductMocInline
                                moc={state.mocRecommendation}
                                productKey={mocKeyFromProduct(result.product.name) || ""}
                                operatingTemp={state.operatingTemp}
                                operatingPressureBar={state.liquidPressureBarAbs}
                              />
                            )}

                            {/* ─── P0: Standards + Installation + Safety Margin ─── */}
                            <ProductSpecsInline
                              product={result.product}
                              bestSize={goodSizes.find((s) => s.size === result.bestSize)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* ═══ INLINE PROFESSIONAL SIZING REPORT ════════════════════════ */}
            <div id="sizing-report-inline">
              <SizingReportInline
                html={sizingReportHtml}
                visible={showSizingReport}
                onClose={() => setShowSizingReport(false)}
              />
            </div>

            {/* Fluid Notes */}
            {state.selectedLiquid && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Fluid Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-md p-2">
                      <div className="text-xs text-muted-foreground">
                        Fluid
                      </div>
                      <div className="font-medium">
                        {state.selectedLiquid.name}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-md p-2">
                      <div className="text-xs text-muted-foreground">
                        Category
                      </div>
                      <div className="font-medium">
                        {state.selectedLiquid.category}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-md p-2">
                      <div className="text-xs text-muted-foreground">
                        Density
                      </div>
                      <div className="font-medium">
                        {state.selectedLiquid.density} kg/m³
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-md p-2">
                      <div className="text-xs text-muted-foreground">
                        Viscosity
                      </div>
                      <div className="font-medium">
                        {state.selectedLiquid.viscosity} cP
                      </div>
                    </div>
                  </div>
                  {state.selectedLiquid.conductivity === true && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Conductive fluid - Electromagnetic flowmeter suitable
                    </p>
                  )}
                  {state.selectedLiquid.conductivity === false && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Non-conductive fluid - Electromagnetic NOT suitable
                    </p>
                  )}
                  {state.selectedLiquid.nonNewtonian && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Non-Newtonian - accuracy may be limited for some
                      technologies
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            </>
            )} {/* end inline results */}

            {/* ─── ROTAMETER (VARIABLE AREA) RESULTS ─── */}
            {state.meterCategory !== "inline" && state.calculated && state.service === "liquid" && !flowAnomalies.some((a) => a.severity === "critical") && state.rotameterResults.length > 0 && (
              <RotameterResults
                rotameterResults={state.rotameterResults}
                flowUnit={state.flowUnit}
                operatingTemp={state.operatingTemp}
                density={state.density}
                specificGravity={state.specificGravity}
                flowRateMax={state.flowRateMax}
              />
            )}


          </>
        )} {/* end state.calculated */}
      </>
    )}
      </main>

      {/* ═══ P2: Sizing History Panel (Flow tab only) ═══════════════════ */}
      {activeTab === "flow" && sizingHistory.history.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-bold text-gray-800">Sizing History ({sizingHistory.history.length} saved)</span>
              </div>
              <button
                onClick={sizingHistory.clearHistory}
                className="text-[10px] text-red-600 hover:text-red-800 underline"
              >
                Clear All
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {sizingHistory.history.map((record) => (
                <div key={record.id} className="px-3 sm:px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 transition-colors gap-1 sm:gap-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 mt-0.5 sm:mt-0 ${
                      record.service === "liquid" ? "bg-blue-500" :
                      record.service === "gas" ? "bg-green-500" : "bg-orange-500"
                    }`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-800 truncate">{record.label}</div>
                      <div className="text-[10px] text-gray-500">
                        {record.fluidName} · {record.flowRange} {record.unit} · {record.temperature}°C · {record.pressure.toFixed(1)} bar
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-5 sm:ml-0">
                    <span className="text-[10px] text-gray-400">{record.dateStr}</span>
                    <button
                      onClick={() => sizingHistory.deleteRecord(record.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
        <div className="text-center text-xs text-muted-foreground py-4 space-y-1">
          <p>
            Flowtech AI Instrument Selection v5 · Flow · Level · Pressure
          </p>
          <p>
            220+ liquids · 80+ gases · 8 Level Devices · 3 Pressure Transmitters · Factory data
          </p>
        </div>

       </div>
    </PasswordGate>
  );
}
