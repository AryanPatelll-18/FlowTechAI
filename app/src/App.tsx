import { useState, useRef, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { useSizingHistory } from "./hooks/useSizingHistory";
import { detectFlowSizingAnomalies, type ProcessAnomaly } from "./data/anomalyDetector";
import { buildSizingReportData, buildSizingReportDataForSize } from "./data/sizingReportEngine";
import { renderSizingReportHtml } from "./data/sizingReportRenderer";
import { useLevelCalculator } from "./hooks/useLevelCalculator";
import { usePressureCalculator } from "./hooks/usePressureCalculator";
import LevelDevicePanel from "./components/LevelDevicePanel";
import PressureDevicePanel from "./components/PressureDevicePanel";
import ProductExpertPanel from "./components/ProductExpertPanel";
import GasWeTubeSizing from "./components/GasWeTubeSizing";
import {
  Droplets, Wind, Flame, Search, AlertTriangle, CheckCircle,
  XCircle, BarChart3, RotateCcw, Trophy, Gauge, LogOut,
  Ruler, Activity, FileText, Info, MessageCircle, BookOpen,
  FolderOpen, ChevronRight, ClipboardList, Wrench,
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
import { searchGases } from "./data/gases";
import type { GasData } from "./data/gases";
import { getUnitsForService } from "./data/unitConversions";
import { PRESSURE_UNITS, fromBar } from "./data/pressureUnits";
import type { PressureUnit } from "./data/pressureUnits";
import PasswordGate from "./components/PasswordGate";
import SizingReportInline from "./components/SizingReportInline";
import RotameterResults from "./components/RotameterResults";

// ─── NEW: AppContext for cross-module workflow ──────────────────────────────
import { AppProvider, useAppContext } from "./context/AppContext";
import type { MainTab, SizingSubTab } from "./types/shared";

// ─── Sub-module panels ──────────────────────────────────────────────────────
import ProjectsPanel from "./modules/ProjectsPanel";
import DocumentsModule from "./modules/documents/DocumentsModule";
import LibraryModule from "./modules/library/LibraryModule";

// ─── Flow Sizing Components ─────────────────────────────────────────────────

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
          <div key={i} className={`px-4 py-2.5 ${severityBorder(a.severity)}`}>
            <div className="flex items-start gap-2">
              {severityIcon(a.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[11px] font-bold ${severityTitle(a.severity)}`}>{a.title}</span>
                  <Badge className={`text-[7px] px-1 py-0 ${severityBadge(a.severity)}`}>{a.severity.toUpperCase()}</Badge>
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

function AccuracyBar({ distance }: { distance: number }) {
  const pct = Math.round((1 - Math.min(1, distance)) * 100);
  const color = distance <= 0.15 ? "bg-green-500" : distance <= 0.3 ? "bg-emerald-400" : distance <= 0.5 ? "bg-yellow-400" : "bg-orange-400";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>
      <span className="text-[10px] text-muted-foreground">{pct}%</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "best": return <Badge className="bg-green-600 hover:bg-green-700 text-white gap-1"><Trophy className="w-3 h-3" /> Best Match</Badge>;
    case "suitable": return <Badge className="bg-primary hover:bg-[#c20017] text-white gap-1"><CheckCircle className="w-3 h-3" /> Suitable</Badge>;
    case "caution": return <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1"><AlertTriangle className="w-3 h-3" /> Caution</Badge>;
    case "rejected": return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
    default: return null;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP CONTENT — wrapped by AppProvider + PasswordGate
// ══════════════════════════════════════════════════════════════════════════════

function AppContent() {
  const { state: appState, dispatch, navigateTo, navigateToSizing } = useAppContext();
  const calc = useCalculator();
  const sizingHistory = useSizingHistory();
  const levelCalc = useLevelCalculator();
  const pressureCalc = usePressureCalculator();

  // ─── Calculator state & actions ─────────────────────────────────────────
  const { state, logout, validResults, setSelectedLiquid, setSelectedGas } = calc;

  // ─── Inline sizing report ────────────────────────────────────────────────
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
      setTimeout(() => { const el = document.getElementById("sizing-report-inline"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
    } catch (err: any) { alert("Failed: " + (err?.message || String(err))); }
  }

  // ─── Dispatch sizing results to global context ───────────────────────────
  useEffect(() => {
    if (state.calculated && validResults.length > 0) {
      const best = validResults[0];
      const serviceFluid = state.service === "liquid" ? state.selectedLiquid?.name
        : state.service === "gas" ? state.selectedGas?.name
        : `Steam @ ${state.steamPressureBarAbs} bar`;

      sizingHistory.addRecord({
        label: `${best.product.name} \u00b7 ${best.bestSize || "\u2014"}`,
        service: state.service,
        fluidName: serviceFluid || "Unknown",
        flowRange: `${state.flowRateMin} \u2013 ${state.flowRateMax}`,
        unit: state.flowUnit,
        bestMeter: best.product.name,
        bestSize: best.bestSize || "\u2014",
        temperature: state.operatingTemp,
        pressure: state.service === "liquid" ? state.liquidPressureBarAbs
          : state.service === "gas" ? state.gasPressureBarAbs : state.steamPressureBarAbs,
      });

      // Also dispatch to global context for cross-module use
      dispatch({
        type: "ADD_SIZING_RESULT",
        result: {
          id: `sizing-${Date.now()}`,
          instrumentId: appState.selectedInstrumentId || `inst-${Date.now()}`,
          service: state.service,
          productName: best.product.name,
          productCode: (best.product as any).modelCode || best.product.name || "",
          meterCategory: state.meterCategory as "inline" | "rotameter" | "both",
          processConditions: {
            fluidName: serviceFluid || "Unknown",
            density: state.density,
            viscosity: state.viscosity,
            operatingTemp: state.operatingTemp,
            operatingPressure: state.service === "liquid" ? state.liquidPressureBarAbs
              : state.service === "gas" ? state.gasPressureBarAbs : state.steamPressureBarAbs,
            flowRateMin: state.flowRateMin,
            flowRateMax: state.flowRateMax,
            flowUnit: state.flowUnit,
            pipeSize: state.pipeSizeNominal,
          },
          bestSize: best.bestSize || "",
          qMin: best.sizes.find((s: any) => s.status === "optimal" || s.status === "valid")?.qMin || 0,
          qMax: best.sizes.find((s: any) => s.status === "optimal" || s.status === "valid")?.qMax || 0,
          qMinUnit: state.flowUnit,
          accuracy: best.product.accuracy ? `\u00b1${best.product.accuracy}% MV` : "\u2014",
          turndown: best.sizes[0]?.qMax && best.sizes[0]?.qMin ? best.sizes[0].qMax / best.sizes[0].qMin : 0,
          status: best.status as any,
          reason: best.reason,
          sizedAt: Date.now(),
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.calculated]);

  // ─── Local UI state ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [gasSearchQuery, setGasSearchQuery] = useState("");
  const [showGasDropdown, setShowGasDropdown] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [flowAnomalies, setFlowAnomalies] = useState<ProcessAnomaly[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const gasSearchRef = useRef<HTMLDivElement>(null);

  // ─── Anomaly detection ───────────────────────────────────────────────────
  useEffect(() => {
    if (state.operatingTemp === 0) { setFlowAnomalies([]); return; }
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
      flowUnit: state.flowUnit,
      pipeSizeNominal: state.pipeSizeNominal || undefined,
      qMin: state.flowRateMin,
      qMax: state.flowRateMax,
      meterType: state.meterCategory === "inline" ? "emf" : undefined,
      selectedGasName: state.selectedGas?.name,
      steamState: state.steamState,
    };
    setFlowAnomalies(detectFlowSizingAnomalies(input));
  }, [
    state.service, state.selectedLiquid, state.selectedGas, state.operatingTemp,
    state.liquidPressureBarAbs, state.gasPressureBarAbs, state.steamPressureBarAbs,
    state.density, state.viscosity, state.flowRateMin, state.flowRateMax,
    state.meterCategory, state.pipeSizeNominal, state.steamState,
  ]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false);
      if (gasSearchRef.current && !gasSearchRef.current.contains(e.target as Node)) setShowGasDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = searchQuery.length > 0 ? searchLiquids(searchQuery) : [];
  const gasSearchResults = gasSearchQuery.length > 0 ? searchGases(gasSearchQuery) : [];

  const handleSelectLiquid = (liquid: LiquidData) => { setSelectedLiquid(liquid); setSearchQuery(liquid.name); setShowDropdown(false); };
  const handleSelectGas = (gas: GasData) => { setSelectedGas(gas); setGasSearchQuery(gas.name); setShowGasDropdown(false); };
  const toggleProduct = (name: string) => { setExpandedProducts((prev) => { const next = new Set(prev); if (next.has(name)) next.delete(name); else next.add(name); return next; }); };

  useEffect(() => {
    if (state.calculated && validResults.length > 0) {
      const best = validResults[0];
      if (best.status === "best" || best.status === "suitable") {
        setExpandedProducts((prev) => { const next = new Set(prev); next.add(best.product.name); return next; });
      }
    }
  }, [state.calculated, validResults]);

  // ─── Main Tab Navigation ─────────────────────────────────────────────────
  const mainTabs: { key: MainTab; label: string; icon: React.ReactNode }[] = [
    { key: "projects", label: "Projects", icon: <FolderOpen className="w-4 h-4" /> },
    { key: "sizing", label: "Sizing", icon: <Wrench className="w-4 h-4" /> },
    { key: "documents", label: "Documents", icon: <ClipboardList className="w-4 h-4" /> },
    { key: "library", label: "Library", icon: <BookOpen className="w-4 h-4" /> },
    { key: "expert", label: "AI Expert", icon: <MessageCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#2d2d2d] text-white py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/flowtech_logo_white.png" alt="Flowtech Instruments" className="h-12 sm:h-14 w-auto object-contain" />
              <div className="border-l border-gray-600 pl-4">
                <h1 className="text-lg font-bold tracking-tight text-white">AI Flow Sizing Calculator</h1>
                <p className="text-xs text-gray-400">220+ fluids &middot; 80+ gases &middot; Steam tables &middot; Factory Qmin/Qmax</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-md hover:bg-white/5" title="Logout">
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* ═══ MAIN TAB NAVIGATION ═══ */}
        <nav className="grid grid-cols-5 gap-2">
          {mainTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => navigateTo(t.key)}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-sm font-bold transition-all ${
                appState.activeTab === t.key
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: PROJECTS — SO Upload, detected instruments, workflow        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {appState.activeTab === "projects" && (
          <ProjectsPanel />
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: SIZING — Flow + Level + Pressure sub-tabs                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {appState.activeTab === "sizing" && (
          <div className="space-y-4">
            {/* Sizing Sub-Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              {[
                { key: "flow" as SizingSubTab, label: "Flow Sizing", icon: <Gauge className="w-4 h-4" /> },
                { key: "level" as SizingSubTab, label: "Level Device", icon: <Ruler className="w-4 h-4" /> },
                { key: "pressure" as SizingSubTab, label: "Pressure", icon: <Activity className="w-4 h-4" /> },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => dispatch({ type: "SET_SIZING_SUB_TAB", tab: t.key })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    appState.sizingSubTab === t.key
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {/* ─── FLOW SIZING PANEL ─── */}
            {appState.sizingSubTab === "flow" && (
              <FlowSizingPanel
                calc={calc}
                flowAnomalies={flowAnomalies}
                openInlineSizingReport={openInlineSizingReport}
                showSizingReport={showSizingReport}
                sizingReportHtml={sizingReportHtml}
                setShowSizingReport={setShowSizingReport}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
                searchRef={searchRef}
                searchResults={searchResults}
                handleSelectLiquid={handleSelectLiquid}
                gasSearchQuery={gasSearchQuery}
                setGasSearchQuery={setGasSearchQuery}
                showGasDropdown={showGasDropdown}
                setShowGasDropdown={setShowGasDropdown}
                gasSearchRef={gasSearchRef}
                gasSearchResults={gasSearchResults}
                handleSelectGas={handleSelectGas}
                toggleProduct={toggleProduct}
                expandedProducts={expandedProducts}
                sizingHistory={sizingHistory}
              />
            )}

            {/* ─── LEVEL SIZING PANEL ─── */}
            {appState.sizingSubTab === "level" && (
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
            )}

            {/* ─── PRESSURE SIZING PANEL ─── */}
            {appState.sizingSubTab === "pressure" && (
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
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: DOCUMENTS — Datasheets + QAP + Master Report                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {appState.activeTab === "documents" && <DocumentsModule />}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: LIBRARY — De-Codification + Model Datasheets + Doc Master    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {appState.activeTab === "library" && <LibraryModule />}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: AI EXPERT                                                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {appState.activeTab === "expert" && <ProductExpertPanel />}
      </main>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-4 space-y-1">
        <p>Flowtech AI Instrument Selection v5 &middot; Flow &middot; Level &middot; Pressure</p>
        <p>220+ liquids &middot; 80+ gases &middot; 8 Level Devices &middot; 3 Pressure Transmitters &middot; Factory data</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FLOW SIZING PANEL — extracted from monolithic App.tsx
// ══════════════════════════════════════════════════════════════════════════════

interface FlowSizingPanelProps {
  calc: ReturnType<typeof useCalculator>;
  flowAnomalies: ProcessAnomaly[];
  openInlineSizingReport: (result?: any, size?: any) => void;
  showSizingReport: boolean;
  sizingReportHtml: string;
  setShowSizingReport: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  showDropdown: boolean;
  setShowDropdown: (v: boolean) => void;
  searchRef: React.RefObject<HTMLDivElement | null>;
  searchResults: LiquidData[];
  handleSelectLiquid: (liquid: LiquidData) => void;
  gasSearchQuery: string;
  setGasSearchQuery: (v: string) => void;
  showGasDropdown: boolean;
  setShowGasDropdown: (v: boolean) => void;
  gasSearchRef: React.RefObject<HTMLDivElement | null>;
  gasSearchResults: GasData[];
  handleSelectGas: (gas: GasData) => void;
  toggleProduct: (name: string) => void;
  expandedProducts: Set<string>;
  sizingHistory: ReturnType<typeof useSizingHistory>;
}

function FlowSizingPanel(props: FlowSizingPanelProps) {
  const {
    calc, flowAnomalies, openInlineSizingReport, showSizingReport, sizingReportHtml,
    setShowSizingReport, searchQuery, setSearchQuery, showDropdown, setShowDropdown,
    searchRef, searchResults, handleSelectLiquid, gasSearchQuery, setGasSearchQuery,
    showGasDropdown, setShowGasDropdown, gasSearchRef, gasSearchResults, handleSelectGas,
    toggleProduct, expandedProducts, sizingHistory,
  } = props;

  const { state, setService, setMeterCategory, setSelectedLiquid, setDensity, setViscosity,
    setOperatingTemp, setLiquidPressure, setSteamPressure, setSteamTempC, setSelectedGas,
    setGasPressure, setFlowRateMin, setFlowRateMax, setFlowUnit, setPipeSize, calculate,
    reset, validResults, rejectedResults, toDisplayUnit } = calc;

  // Inline report scroll ref
  const reportRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-4">
      {/* Sizing Report Inline Panel */}
      {showSizingReport && (
        <div id="sizing-report-inline" ref={reportRef}>
          <SizingReportInline html={sizingReportHtml} visible={showSizingReport} onClose={() => setShowSizingReport(false)} />
        </div>
      )}

      {/* Input Card */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={state.service} onValueChange={(v) => setService(v as ServiceType)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="liquid" className="gap-2"><Droplets className="w-4 h-4" /> Liquids</TabsTrigger>
              <TabsTrigger value="gas" className="gap-2"><Wind className="w-4 h-4" /> Gas</TabsTrigger>
              <TabsTrigger value="steam" className="gap-2"><Flame className="w-4 h-4" /> Steam</TabsTrigger>
            </TabsList>

            {/* ─── LIQUID TAB ─── */}
            <TabsContent value="liquid" className="space-y-4 mt-4">
              {/* Liquid search, inputs, etc — kept inline for now */}
              <div className="relative" ref={searchRef}>
                <Label className="text-sm font-medium mb-1.5 block">Search Fluid (220+ liquids database)</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Type fluid name, formula, or category..." value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                    onFocus={() => searchQuery.length > 0 && setShowDropdown(true)} className="pl-9" />
                </div>
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((liquid) => (
                      <button key={liquid.name} onClick={() => handleSelectLiquid(liquid)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center justify-between">
                        <span>{liquid.name}</span>
                        <span className="text-xs text-gray-400">{liquid.density} kg/m&sup3; &middot; {liquid.viscosity} cP</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Pressure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Pressure</Label>
                  <div className="flex gap-2">
                    <Input type="number" value={fromBar(state.liquidPressureBarAbs, state.liquidPressureUnit as PressureUnit)}
                      onChange={(e) => setLiquidPressure(parseFloat(e.target.value) || 0, state.liquidPressureUnit as PressureUnit)}
                      min={0} step={0.01} className="flex-1" />
                    <Select value={state.liquidPressureUnit}
                      onValueChange={(u) => setLiquidPressure(fromBar(state.liquidPressureBarAbs, u as PressureUnit), u as PressureUnit)}>
                      <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{PRESSURE_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{state.liquidPressureBarAbs.toFixed(3)} bar abs</p>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Operating Temp (&deg;C)</Label>
                  <Input type="number" value={state.operatingTemp} onChange={(e) => setOperatingTemp(parseFloat(e.target.value) || 0)} step={0.1} />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Density (kg/m&sup3;)</Label>
                  <Input type="number" value={state.density} onChange={(e) => setDensity(parseFloat(e.target.value) || 0)} min={0} step={0.1} />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Viscosity (cP)</Label>
                  <Input type="number" value={state.viscosity} onChange={(e) => setViscosity(parseFloat(e.target.value) || 0)} min={0} step={0.001} />
                </div>
              </div>
              {/* Flow Rate + Pipe Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label className="text-sm font-medium mb-1.5 block">Lower Flow Rate (Qmin)</Label>
                  <Input type="number" value={state.flowRateMin} onChange={(e) => setFlowRateMin(parseFloat(e.target.value) || 0)} min={0} step={0.1} /></div>
                <div><Label className="text-sm font-medium mb-1.5 block">Higher Flow Rate (Qmax)</Label>
                  <Input type="number" value={state.flowRateMax} onChange={(e) => setFlowRateMax(parseFloat(e.target.value) || 0)} min={0} step={0.1} /></div>
                <div><Label className="text-sm font-medium mb-1.5 block">Unit</Label>
                  <Select value={state.flowUnit} onValueChange={setFlowUnit}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{getUnitsForService("liquid").map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select></div>
                <div><Label className="text-sm font-medium mb-1.5 block">Pipe Size <span className="text-[10px] font-normal text-gray-400">(for velocity check)</span></Label>
                  <Select value={state.pipeSizeNominal} onValueChange={(v) => setPipeSize(v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{["DN15","DN20","DN25","DN32","DN40","DN50","DN65","DN80","DN100","DN125","DN150","DN200","DN250","DN300"].map((s) =>
                      <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select></div>
              </div>
            </TabsContent>

            {/* ─── GAS TAB ─── */}
            <TabsContent value="gas" className="space-y-4 mt-4">
              {/* Gas search */}
              <div className="relative" ref={gasSearchRef}>
                <Label className="text-sm font-medium mb-1.5 block">Name of Gas (64 gases)</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search gas (e.g., Air, Nitrogen, Hydrogen...)" value={gasSearchQuery}
                    onChange={(e) => { setGasSearchQuery(e.target.value); setShowGasDropdown(true); }}
                    onFocus={() => gasSearchQuery.length > 0 && setShowGasDropdown(true)} className="pl-9" />
                </div>
                {showGasDropdown && gasSearchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {gasSearchResults.map((gas) => (
                      <button key={gas.name} onClick={() => handleSelectGas(gas)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center justify-between">
                        <span>{gas.name}</span>
                        <span className="text-xs text-gray-400">&rho;: {gas.density} kg/m&sup3; &middot; SG: {gas.specificGravity}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Gas properties */}
              {state.selectedGas && (
                <div className="bg-gray-50 border rounded-md p-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Selected Gas Properties</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-md px-3 py-2"><div className="text-xs text-muted-foreground">Formula</div><div className="font-semibold text-sm">{state.selectedGas.formula}</div></div>
                    <div className="bg-white rounded-md px-3 py-2"><div className="text-xs text-muted-foreground">Mol. Weight</div><div className="font-semibold text-sm">{state.selectedGas.molecularWeight} g/mol</div></div>
                    <div className="bg-white rounded-md px-3 py-2"><div className="text-xs text-muted-foreground">Density (STP)</div><div className="font-semibold text-sm">{state.selectedGas.density} kg/m&sup3;</div></div>
                    <div className="bg-white rounded-md px-3 py-2"><div className="text-xs text-muted-foreground">Viscosity (STP)</div><div className="font-semibold text-sm">{state.selectedGas.viscosity} cP</div></div>
                  </div>
                </div>
              )}
              {/* Gas pressure + temp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Operating Pressure</Label>
                  <div className="flex gap-2">
                    <Input type="number" value={fromBar(state.gasPressureBarAbs, state.gasPressureUnit as PressureUnit)}
                      onChange={(e) => setGasPressure(parseFloat(e.target.value) || 0, state.gasPressureUnit as PressureUnit)}
                      min={0} step={0.01} className="flex-1" />
                    <Select value={state.gasPressureUnit}
                      onValueChange={(u) => setGasPressure(fromBar(state.gasPressureBarAbs, u as PressureUnit), u as PressureUnit)}>
                      <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{PRESSURE_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{state.gasPressureBarAbs.toFixed(3)} bar abs</p>
                </div>
                <div><Label className="text-sm font-medium mb-1.5 block">Operating Temp (&deg;C)</Label>
                  <Input type="number" value={state.operatingTemp} onChange={(e) => setOperatingTemp(parseFloat(e.target.value) || 0)} step={0.1} /></div>
                <div><Label className="text-sm font-medium mb-1.5 block">Density (kg/m&sup3;)</Label>
                  <Input type="number" value={state.density} onChange={(e) => setDensity(parseFloat(e.target.value) || 0)} readOnly className="bg-gray-50" /></div>
                <div><Label className="text-sm font-medium mb-1.5 block">Viscosity (cP)</Label>
                  <Input type="number" value={state.viscosity} onChange={(e) => setViscosity(parseFloat(e.target.value) || 0)} step={0.001} /></div>
              </div>
              {/* Gas Wetness Warning */}
              {state.calculated && state.gasWetness && (
                <div className={`border-2 rounded-md p-3 flex items-start gap-3 ${state.gasWetness.isWet ? "bg-red-50 border-red-500" : state.gasWetness.marginC && state.gasWetness.marginC < 15 ? "bg-amber-50 border-amber-500" : "bg-green-50 border-green-500"}`}>
                  {state.gasWetness.isWet ? <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" /> :
                    state.gasWetness.marginC && state.gasWetness.marginC < 15 ? <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" /> :
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />}
                  <div>
                    <div className={`text-sm font-bold uppercase tracking-wider ${state.gasWetness.isWet ? "text-red-700" : state.gasWetness.marginC && state.gasWetness.marginC < 15 ? "text-amber-700" : "text-green-700"}`}>
                      {state.gasWetness.isWet ? "WET GAS \u2014 Condensation Risk" : state.gasWetness.marginC && state.gasWetness.marginC < 15 ? "Near Dew Point \u2014 Caution" : "Dry Gas \u2014 Safe"}
                    </div>
                    <div className={`text-xs mt-1 leading-relaxed ${state.gasWetness.isWet ? "text-red-800" : state.gasWetness.marginC && state.gasWetness.marginC < 15 ? "text-amber-800" : "text-green-800"}`}>
                      {state.gasWetness.message}
                      {state.gasWetness.isWet && <span className="text-red-900 font-bold"> Vortex Flowmeter will NOT be recommended.</span>}
                    </div>
                  </div>
                </div>
              )}
              {/* Flow Rate + Pipe Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label className="text-sm font-medium mb-1.5 block">Lower Flow Rate (Qmin)</Label>
                  <Input type="number" value={state.flowRateMin} onChange={(e) => setFlowRateMin(parseFloat(e.target.value) || 0)} min={0} step={0.1} /></div>
                <div><Label className="text-sm font-medium mb-1.5 block">Higher Flow Rate (Qmax)</Label>
                  <Input type="number" value={state.flowRateMax} onChange={(e) => setFlowRateMax(parseFloat(e.target.value) || 0)} min={0} step={0.1} /></div>
                <div><Label className="text-sm font-medium mb-1.5 block">Unit</Label>
                  <Select value={state.flowUnit} onValueChange={setFlowUnit}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{getUnitsForService("gas").map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select></div>
                <div><Label className="text-sm font-medium mb-1.5 block">Pipe Size <span className="text-[10px] font-normal text-gray-400">(for velocity check)</span></Label>
                  <Select value={state.pipeSizeNominal} onValueChange={(v) => setPipeSize(v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{["DN15","DN20","DN25","DN32","DN40","DN50","DN65","DN80","DN100","DN125","DN150","DN200","DN250","DN300"].map((s) =>
                      <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select></div>
              </div>
              {/* Gas WE — only after Calculate Sizes */}
              {state.selectedGas && state.meterCategory !== "inline" && state.calculated && (
                <GasWeTubeSizing
                  gas={state.selectedGas}
                  gasPressureBara={state.gasPressureBarAbs}
                  operatingTempC={state.operatingTemp}
                  gasDensity={state.density}
                  flowRateMin={state.flowRateMin}
                  flowRateMax={state.flowRateMax}
                  flowRateNormal={(state.flowRateMin + state.flowRateMax) / 2}
                  flowUnit={state.flowUnit}
                  pipeSize={state.pipeSizeNominal}
                />
              )}
            </TabsContent>

            {/* ─── STEAM TAB ─── */}
            <TabsContent value="steam" className="space-y-4 mt-4">
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <Flame className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-900">Steam Measurement</h3>
                    <p className="text-sm text-orange-700 mt-1">Enter Pressure and Temperature to calculate Density. Qmin/Qmax are interpolated from Flowtech factory tables (2-20 bar abs).</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Pressure *</Label>
                  <div className="flex gap-2">
                    <Input type="number" value={fromBar(state.steamPressureBarAbs, state.steamPressureUnit as PressureUnit)}
                      onChange={(e) => setSteamPressure(parseFloat(e.target.value) || 0, state.steamPressureUnit as PressureUnit)}
                      min={0.001} step={0.01} className="flex-1" />
                    <Select value={state.steamPressureUnit}
                      onValueChange={(u) => setSteamPressure(fromBar(state.steamPressureBarAbs, u as PressureUnit), u as PressureUnit)}>
                      <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{PRESSURE_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{state.steamPressureBarAbs.toFixed(3)} bar abs (Range: 2-20 bar abs)</p>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Temperature (&deg;C) *</Label>
                  <Input type="number" value={state.steamTempC} onChange={(e) => setSteamTempC(parseFloat(e.target.value) || 0)} min={120} max={220} step={0.1} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {state.steamState === "saturated" && <span className="text-green-600 font-medium">Saturated steam detected</span>}
                    {state.steamState === "superheated" && <span className="text-green-600 font-bold"><CheckCircle className="w-3.5 h-3.5 inline mr-1" />Superheated steam detected</span>}
                    {state.steamState === "wet" && <span className="text-red-600 font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />WET STEAM &mdash; Vortex Flowmeter will NOT be recommended</span>}
                    {state.steamState === "" && <span>Enter P and T to calculate</span>}
                  </p>
                </div>
              </div>
              {/* Calculated Properties */}
              <div className="bg-gray-50 border rounded-md p-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Calculated Steam Properties</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-white rounded-md px-3 py-2"><div className="text-xs text-muted-foreground">Density</div><div className="font-semibold text-sm">{state.steamDensity > 0 ? state.steamDensity.toFixed(3) : "--"} kg/m&sup3;</div></div>
                  <div className="bg-white rounded-md px-3 py-2"><div className="text-xs text-muted-foreground">Specific Gravity</div><div className="font-semibold text-sm">{state.steamDensity > 0 ? (state.steamDensity / 1000).toFixed(5) : "--"}</div></div>
                  <div className="bg-white rounded-md px-3 py-2"><div className="text-xs text-muted-foreground">Pressure (abs)</div><div className="font-semibold text-sm">{state.steamPressureBarAbs.toFixed(3)} bar</div></div>
                  <div className="bg-white rounded-md px-3 py-2"><div className="text-xs text-muted-foreground">Temperature</div><div className="font-semibold text-sm">{state.steamTempC.toFixed(1)}&deg;C</div></div>
                  <div className="bg-white rounded-md px-3 py-2"><div className="text-xs text-muted-foreground">State</div><div className="font-semibold text-sm capitalize">{state.steamState || "--"}</div></div>
                </div>
                {state.steamNote && <p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{state.steamNote}</p>}
              </div>
              {state.steamState === "wet" && (
                <div className="bg-red-950/80 border border-red-500 rounded-md p-3 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-red-400 uppercase tracking-wider">Wet Steam &mdash; Vortex Flowmeter Excluded</div>
                    <div className="text-xs text-red-300/80 mt-1 leading-relaxed">Wet steam is a two-phase mixture. Vortex shedding is erratic in two-phase flow.<strong className="text-red-200"> Vortex Flowmeter will NOT be recommended.</strong></div>
                  </div>
                </div>
              )}
              {/* Flow Rate + Pipe Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><Label className="text-sm font-medium mb-1.5 block">Lower Flow Rate (Qmin)</Label>
                  <Input type="number" value={state.flowRateMin} onChange={(e) => setFlowRateMin(parseFloat(e.target.value) || 0)} min={0} step={0.1} /></div>
                <div><Label className="text-sm font-medium mb-1.5 block">Higher Flow Rate (Qmax)</Label>
                  <Input type="number" value={state.flowRateMax} onChange={(e) => setFlowRateMax(parseFloat(e.target.value) || 0)} min={0} step={0.1} /></div>
                <div><Label className="text-sm font-medium mb-1.5 block">Unit</Label>
                  <Select value={state.flowUnit} onValueChange={setFlowUnit}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{getUnitsForService("steam").map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select></div>
                <div><Label className="text-sm font-medium mb-1.5 block">Pipe Size <span className="text-[10px] font-normal text-gray-400">(for velocity check)</span></Label>
                  <Select value={state.pipeSizeNominal} onValueChange={(v) => setPipeSize(v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{["DN15","DN20","DN25","DN32","DN40","DN50","DN65","DN80","DN100","DN125","DN150","DN200","DN250","DN300"].map((s) =>
                      <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select></div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Calculate + Reset Buttons */}
          <div className="flex gap-3 mt-6">
            <Button onClick={calculate} className="flex-1 bg-primary hover:bg-[#c20017] text-white gap-2" size="lg">
              <BarChart3 className="w-5 h-5" /> Calculate Sizes
            </Button>
            <Button onClick={reset} variant="outline" size="lg" className="gap-2"><RotateCcw className="w-4 h-4" /> Reset</Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── METER CATEGORY SELECTOR ─── */}
      <Card className="border-primary/30">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-xs font-bold text-primary">1</span></div>
            <Label className="text-sm font-bold uppercase tracking-wider text-primary">Select Flowmeter Category</Label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={() => setMeterCategory("inline")}
              className={`border-2 rounded-lg p-3 text-left transition-all ${state.meterCategory === "inline" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${state.meterCategory === "inline" ? "border-primary" : "border-gray-300"}`}>
                  {state.meterCategory === "inline" && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <div>
                  <div className={`text-sm font-bold ${state.meterCategory === "inline" ? "text-primary" : "text-gray-700"}`}>Inline Flowmeters</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">EMF &middot; TFM &middot; VFM &middot; Ultrasonic &middot; Oval Gear</div>
                </div>
              </div>
            </button>
            {(state.service === "liquid" || state.service === "gas") && (
              <button onClick={() => setMeterCategory("rotameter")}
                className={`border-2 rounded-lg p-3 text-left transition-all ${state.meterCategory === "rotameter" ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${state.meterCategory === "rotameter" ? "border-amber-500" : "border-gray-300"}`}>
                    {state.meterCategory === "rotameter" && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${state.meterCategory === "rotameter" ? "text-amber-700" : "text-gray-700"}`}>Variable Area</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                      {state.service === "liquid" ? "Glass Tube Rotameters (SS316 / PTFE)" : "Glass Tube Rotameters \u2014 Gas via Water Equivalent"}
                    </div>
                  </div>
                </div>
              </button>
            )}
            {(state.service === "liquid" || state.service === "gas") && (
              <button onClick={() => setMeterCategory("both")}
                className={`border-2 rounded-lg p-3 text-left transition-all ${state.meterCategory === "both" ? "border-green-600 bg-green-50 ring-1 ring-green-600" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${state.meterCategory === "both" ? "border-green-600" : "border-gray-300"}`}>
                    {state.meterCategory === "both" && <div className="w-2 h-2 rounded-full bg-green-600" />}
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${state.meterCategory === "both" ? "text-green-700" : "text-gray-700"}`}>Both Categories</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Inline + Variable Area sizing</div>
                  </div>
                </div>
              </button>
            )}
            {state.service === "steam" && (
              <div className="col-span-2 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-3">
                <span className="text-xs text-muted-foreground">Rotameters available for <strong>Liquid &amp; Gas</strong> service only</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── ANOMALY PANEL ─── */}
      {(state.service === "liquid" || state.service === "gas" || state.service === "steam") && flowAnomalies.length > 0 && (
        <FlowAnomalyPanel anomalies={flowAnomalies} />
      )}

      {/* ─── RESULTS ─── */}
      {state.calculated && (
        <>
          {/* Critical blocker */}
          {flowAnomalies.some((a) => a.severity === "critical") && (
            <Card className="border-red-400 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-red-800"><XCircle className="w-6 h-6 text-red-600 shrink-0" /><span>CALCULATION BLOCKED</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-red-700">Critical process issues detected. No product can be recommended.</p>
              </CardContent>
            </Card>
          )}

          {/* Inline Results */}
          {state.meterCategory !== "rotameter" && !flowAnomalies.some((a) => a.severity === "critical") && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-blue-800">Meter sizing is based on FLOW RATE, not pipe size.</span>
                  <span className="text-xs text-blue-700 ml-1">Use reducers/expanders as needed.</span>
                </div>
              </div>
              <Card className="print:shadow-none print:border-2">
                <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg"><CheckCircle className="w-5 h-5 text-green-600 shrink-0" /><span className="text-base sm:text-lg">Recommended Sizes</span></CardTitle>
                  <Button variant="outline" onClick={() => openInlineSizingReport()} className="gap-2 text-sm print:hidden w-full sm:w-auto min-h-[44px] bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700">
                    <FileText className="w-4 h-4" />Sizing Report
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs text-muted-foreground bg-gray-50 rounded-md px-3 py-2 print:bg-white print:border">
                    <strong>Service:</strong> {state.service === "liquid" ? "Liquids" : state.service === "gas" ? "Gas" : "Steam"}
                    {" \u00b7 "}<strong>Flow Range:</strong> {state.flowRateMin} &ndash; {state.flowRateMax} {state.flowUnit}
                    {" \u00b7 "}<strong>Density:</strong> {state.density} kg/m&sup3;
                    {" \u00b7 "}<strong>Viscosity:</strong> {state.viscosity} cP
                    {" \u00b7 "}<strong>Temp:</strong> {state.operatingTemp}&deg;C
                  </div>
                  {rejectedResults.length > 0 && (
                    <div className="text-xs text-red-600 bg-red-50 rounded-md px-3 py-2">
                      <XCircle className="w-3 h-3 inline mr-1" /><strong>Rejected:</strong> {rejectedResults.map((r) => r.product.name).join(", ")}
                    </div>
                  )}
                  {validResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground"><AlertTriangle className="w-10 h-10 mx-auto mb-2 text-amber-500" /><p>No suitable sizes found.</p></div>
                  ) : (
                    validResults.map((result) => {
                      const goodSizes = result.sizes.filter((s: any) => s.status === "optimal" || s.status === "valid" || s.status === "partial-low" || s.status === "partial-high");
                      const isExpanded = expandedProducts.has(result.product.name);
                      return (
                        <div key={result.product.name} className={`border rounded-lg overflow-hidden ${result.status === "best" ? "border-green-400 ring-1 ring-green-400" : "border-blue-300"}`}>
                          <button className={`w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 text-left transition-colors gap-1 sm:gap-0 ${result.status === "best" ? "bg-green-50 hover:bg-green-100" : "bg-blue-50 hover:bg-blue-100"}`}
                            onClick={() => toggleProduct(result.product.name)}>
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge status={result.status} />
                              <span className="text-sm font-bold">{result.product.name}</span>
                              <span className="text-[10px] text-muted-foreground">{result.product.accuracy ? `\u00b1${result.product.accuracy}%` : ""} &middot; {goodSizes.length} size{goodSizes.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {result.bestSize && <span className="text-xs font-semibold text-primary">Best: {result.bestSize}</span>}
                              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="p-3 space-y-2 bg-white">
                              {result.sizes.map((size: any) => (
                                <div key={size.size} className={`border rounded-md p-2.5 ${size.status === "optimal" ? "border-green-300 bg-green-50" : size.status === "valid" || size.status === "partial-low" || size.status === "partial-high" ? "border-blue-200" : "border-gray-200 bg-gray-50 opacity-60"}`}>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                    <div className="font-bold text-sm w-16 shrink-0">{size.size}</div>
                                    <div className="text-xs text-muted-foreground flex-1">
                                      {size.qMin.toFixed(1)} &ndash; {size.qMax.toFixed(1)} {size.unit}
                                      <span className="mx-1">&middot;</span>Turn {size.turndown?.toFixed(1) || (size.qMax / size.qMin).toFixed(1)}:1
                                    </div>
                                    <AccuracyBar distance={size.distanceFromMedian} />
                                    <Button variant="outline" size="sm" className="text-xs h-7"
                                      onClick={() => openInlineSizingReport(result, size)}>Report</Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Rotameter Results */}
          {state.meterCategory !== "inline" && (state.service === "liquid" || state.service === "gas") && !flowAnomalies.some((a) => a.severity === "critical") && state.rotameterResults.length > 0 && (
            <RotameterResults
              rotameterResults={state.rotameterResults}
              flowUnit={state.flowUnit}
              operatingTemp={state.operatingTemp}
              density={state.density}
              specificGravity={state.specificGravity}
              flowRateMax={state.flowRateMax}
              service={state.service}
            />
          )}
        </>
      )}

      {/* Sizing History */}
      {sizingHistory.history.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-bold text-gray-800">Sizing History ({sizingHistory.history.length} saved)</span>
            </div>
            <button onClick={sizingHistory.clearHistory} className="text-[10px] text-red-600 hover:text-red-800 underline">Clear All</button>
          </div>
          <div className="divide-y divide-gray-100">
            {sizingHistory.history.map((record) => (
              <div key={record.id} className="px-3 sm:px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 transition-colors gap-1 sm:gap-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 mt-0.5 sm:mt-0 ${record.service === "liquid" ? "bg-blue-500" : record.service === "gas" ? "bg-green-500" : "bg-orange-500"}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{record.label}</div>
                    <div className="text-[10px] text-gray-500">{record.fluidName} &middot; {record.flowRange} {record.unit} &middot; {record.temperature}&deg;C &middot; {record.pressure.toFixed(1)} bar</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-5 sm:ml-0">
                  <span className="text-[10px] text-gray-400">{record.dateStr}</span>
                  <button onClick={() => sizingHistory.deleteRecord(record.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete"><XCircle className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP EXPORT — wraps AppContent with AppProvider + PasswordGate
// ══════════════════════════════════════════════════════════════════════════════

export default function App() {
  return (
    <ErrorBoundary>
      <PasswordGate>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </PasswordGate>
    </ErrorBoundary>
  );
}
