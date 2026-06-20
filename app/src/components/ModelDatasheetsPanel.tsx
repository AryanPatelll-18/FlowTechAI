/**
 * Model Datasheets Panel — Multi-Family Model Selector
 * Supports all 6 Flowtech product families with wizard, comparison, and PDF download
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Search, Filter, ChevronRight, ChevronLeft, CheckCircle2,
  XCircle, AlertTriangle, Download, FileText, ArrowLeft, Sparkles,
  Thermometer, Gauge, Droplets, Zap, Shield, Wrench, Beaker,
  Package, Layers, Star, Check, X, FileDown, BeakerIcon, BookText
} from "lucide-react";
import { generateModelSelectorGuide } from "../data/modelSelectorGuideEngine";
import {
  PRODUCT_FAMILIES, ALL_MODELS, FAMILY_WIZARD_QUESTIONS,
  scoreModelsForFamily, getModelsByFamily, getFamilyById,
  getSuitabilityColor, getSuitabilityBg, getSuitabilityLabel,
} from "../data/allModelData";
import type { ProductModel, ProductFamily, Suitability, ModelScore } from "../data/allModelData";

type ViewMode = "family-select" | "overview" | "wizard" | "results" | "detail" | "comparison";

const FAMILY_ICONS: Record<string, React.ReactNode> = {
  flowmag: <Gauge className="w-6 h-6" />,
  flowturb: <Zap className="w-6 h-6" />,
  flowswirl: <Droplets className="w-6 h-6" />,
  flowval: <Beaker className="w-6 h-6" />,
  flowgt: <Thermometer className="w-6 h-6" />,
  flowmet: <Shield className="w-6 h-6" />,
};

const FAMILY_COLORS: Record<string, { bg: string; border: string; text: string; gradient: string; button: string; badge: string }> = {
  flowmag:  { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", gradient: "from-red-50 to-white", button: "bg-red-600 hover:bg-red-700", badge: "bg-red-600" },
  flowturb: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", gradient: "from-blue-50 to-white", button: "bg-blue-600 hover:bg-blue-700", badge: "bg-blue-600" },
  flowswirl:{ bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", gradient: "from-cyan-50 to-white", button: "bg-cyan-600 hover:bg-cyan-700", badge: "bg-cyan-600" },
  flowval:  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", gradient: "from-amber-50 to-white", button: "bg-amber-600 hover:bg-amber-700", badge: "bg-amber-600" },
  flowgt:   { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", gradient: "from-green-50 to-white", button: "bg-green-600 hover:bg-green-700", badge: "bg-green-600" },
  flowmet:  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", gradient: "from-purple-50 to-white", button: "bg-purple-600 hover:bg-purple-700", badge: "bg-purple-600" },
};

export default function ModelDatasheetsPanel() {
  const [view, setView] = useState<ViewMode>("family-select");
  const [activeFamily, setActiveFamily] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectionResults, setSelectionResults] = useState<ModelScore[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const family = useMemo(() => activeFamily ? getFamilyById(activeFamily) || null : null, [activeFamily]);
  const models = useMemo(() => activeFamily ? getModelsByFamily(activeFamily) : [], [activeFamily]);
  const colors = useMemo(() => activeFamily ? FAMILY_COLORS[activeFamily] : FAMILY_COLORS.flowmag, [activeFamily]);
  const wizardQuestions = useMemo(() => activeFamily ? FAMILY_WIZARD_QUESTIONS[activeFamily] || [] : [], [activeFamily]);

  const selectedModel = useMemo(() =>
    ALL_MODELS.find((m) => m.id === selectedModelId) || null
  , [selectedModelId]);

  const filteredModels = useMemo(() => {
    let result = models;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) =>
        m.modelName.toLowerCase().includes(q) ||
        m.shortDesc.toLowerCase().includes(q) ||
        m.application.some((a) => a.toLowerCase().includes(q)) ||
        m.flowtubeMoc.toLowerCase().includes(q)
      );
    }
    if (activeFilter !== "all") {
      result = result.filter((m) => {
        if (activeFilter === "flameproof") return m.isFlameproof;
        if (activeFilter === "battery") return m.isBatteryOperated;
        if (activeFilter === "hygienic") return m.isHygienic;
        if (activeFilter === "high-pressure") return m.isHighPressure;
        return true;
      });
    }
    return result;
  }, [models, searchQuery, activeFilter]);

  const selectFamily = (fid: string) => {
    setActiveFamily(fid);
    setView("overview");
    setSearchQuery("");
    setActiveFilter("all");
    setCompareList([]);
    setAnswers({});
    setWizardStep(0);
  };

  const handleDownloadGuide = (e: React.MouseEvent, familyName: string) => {
    e.stopPropagation();
    try {
      const html = generateModelSelectorGuide(familyName);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Flowtech_${familyName.replace(/\s+/g, "_")}_Model_Selection_Guide.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Guide generation failed:", err);
    }
  };

  // Map family ID to product family name for guide generation
  const FAMILY_GUIDE_NAMES: Record<string, string> = {
    flowmag: "Electromagnetic Flowmeter",
    flowturb: "Turbine Flowmeter",
    flowswirl: "Vortex Flowmeter",
    flowval: "Oval Gear Flowmeter",
    flowgt: "Glass Tube Rotameter",
    flowmet: "Metal Tube Rotameter",
  };

  const handleWizardNext = () => {
    if (wizardStep < wizardQuestions.length - 1) {
      setWizardStep(wizardStep + 1);
    } else {
      const results = scoreModelsForFamily(activeFamily, answers);
      setSelectionResults(results);
      setView("results");
    }
  };

  const handleWizardPrev = () => {
    if (wizardStep > 0) setWizardStep(wizardStep - 1);
  };

  const currentQuestion = wizardQuestions[wizardStep];

  const toggleCompare = (id: string) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  // ─── PDF Generation ───────────────────────────────────────────────────────
  const generatePdfHtml = (model: ProductModel): string => {
    const c = FAMILY_COLORS[model.family];
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${model.modelName} Datasheet</title>
<style>
body{font-family:Arial,sans-serif;margin:40px;color:#333;line-height:1.6}
.header{display:flex;align-items:center;border-bottom:3px solid #c20017;padding-bottom:15px;margin-bottom:25px}
.logo{font-size:24px;font-weight:bold;color:#c20017;margin-right:20px}
.title h1{font-size:20px;margin:0;color:#2d2d2d}
.title p{font-size:12px;color:#666;margin:4px 0 0}
.section{margin-bottom:20px}
.section h2{font-size:14px;color:#c20017;border-bottom:1px solid #ddd;padding-bottom:5px;margin-bottom:10px}
table{width:100%;border-collapse:collapse;font-size:11px}
td,th{padding:6px 10px;border:1px solid #ddd;text-align:left}
th{background:#f5f5f5;font-weight:bold;width:35%}
.badge{display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;font-weight:bold;margin:2px}
.bg-red{background:#c20017;color:white}
.bg-grey{background:#f0f0f0;color:#333}
.footer{margin-top:30px;padding-top:15px;border-top:2px solid #c20017;font-size:10px;color:#666;text-align:center}
</style></head><body>
<div class="header"><div class="logo">FLOWTECH</div><div class="title">
<h1>${model.modelName}</h1><p>${model.shortDesc}</p></div></div>
<div class="section"><h2>General Specifications</h2><table>
<tr><th>Model No.</th><td>${model.modelNo}</td></tr>
<tr><th>Application</th><td>${model.application.join(", ")}</td></tr>
<tr><th>Accuracy</th><td>${model.accuracy}</td></tr>
${model.conductivity ? `<tr><th>Conductivity</th><td>${model.conductivity}</td></tr>` : ""}
<tr><th>Viscosity</th><td>${model.viscosity}</td></tr>
<tr><th>Temperature Range</th><td>${model.tempRange}</td></tr>
<tr><th>Pressure Range</th><td>${model.pressureRange}</td></tr>
<tr><th>Corrosion Resistance</th><td>${model.corrosionResistance}</td></tr>
</table></div>
<div class="section"><h2>Material of Construction</h2><table>
<tr><th>Flowtube MOC</th><td>${model.flowtubeMoc}</td></tr>
<tr><th>Process Connection MOC</th><td>${model.processConnectionMoc}</td></tr>
${model.coilHousingMoc ? `<tr><th>Coil Housing MOC</th><td>${model.coilHousingMoc}</td></tr>` : ""}
${model.electrodeMaterial ? `<tr><th>Electrode Material</th><td>${model.electrodeMaterial}</td></tr>` : ""}
${model.liningMaterial ? `<tr><th>Lining Material</th><td>${model.liningMaterial}</td></tr>` : ""}
<tr><th>Electronics Enclosure</th><td>${model.electronicsEnclosure}</td></tr>
</table></div>
<div class="section"><h2>Process Connection</h2><table>
<tr><th>Connection Type</th><td>${model.processConnectionType}</td></tr>
<tr><th>Connection Standard</th><td>${model.processConnectionStd}</td></tr>
${model.earthingType ? `<tr><th>Earthing Type</th><td>${model.earthingType}</td></tr>` : ""}
</table></div>
<div class="section"><h2>Electrical Specifications</h2><table>
<tr><th>Output</th><td>${model.output}</td></tr>
<tr><th>Communication</th><td>${model.communication}</td></tr>
<tr><th>Power Supply</th><td>${model.powerSupply}</td></tr>
<tr><th>Wiring Type</th><td>${model.wiringType}</td></tr>
<tr><th>Transmitter Mounting</th><td>${model.transmitterMounting}</td></tr>
</table></div>
${model.cableGlandMoc ? `<div class="section"><h2>Cable &amp; Protection</h2><table>
<tr><th>Cable Gland MOC</th><td>${model.cableGlandMoc}</td></tr>
${model.cableEntryStd ? `<tr><th>Cable Entry Standard</th><td>${model.cableEntryStd}</td></tr>` : ""}
${model.cableGlandProtection ? `<tr><th>Cable Gland Protection</th><td>${model.cableGlandProtection}</td></tr>` : ""}
</table></div>` : ""}
<div class="section"><h2>Accessories &amp; Features</h2><table>
<tr><th>Accessories</th><td>${model.accessories.join(", ")}</td></tr>
<tr><th>Special Features</th><td>${model.specialFeatures.join("; ")}</td></tr>
<tr><th>Limitations</th><td>${model.limitations.join("; ")}</td></tr>
<tr><th>Certifications</th><td>${model.certifications.join(", ")}</td></tr>
</table></div>
<div class="footer">Flowtech Instruments (I) Pvt. Ltd. &mdash; Technical Datasheet &mdash; ${model.modelName}<br/>
This datasheet is generated from uploaded technical data. Please verify critical specifications with Flowtech technical team.</div>
</body></html>`;
  };

  const downloadPdf = (model: ProductModel) => {
    const html = generatePdfHtml(model);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: FAMILY SELECTOR
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === "family-select") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Flowtech Model Selector</h2>
          <p className="text-sm text-muted-foreground">Select a product family to explore models, specifications, and find the right instrument for your application.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.values(PRODUCT_FAMILIES).map((fam) => {
            const c = FAMILY_COLORS[fam.id];
            const count = getModelsByFamily(fam.id).length;
            const guideName = FAMILY_GUIDE_NAMES[fam.id];
            return (
              <div
                key={fam.id}
                onClick={() => selectFamily(fam.id)}
                className={`text-left p-5 rounded-xl border-2 ${c.border} ${c.bg} hover:shadow-md transition-all group cursor-pointer relative`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${c.button} flex items-center justify-center shrink-0`}>
                    <div className="text-white">{FAMILY_ICONS[fam.id]}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-black">{fam.name}</h3>
                    <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">{fam.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[9px]">{count} Models</Badge>
                      <Badge variant="outline" className="text-[9px]">{fam.shortName}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {fam.keyParameters.slice(0, 2).map((kp) => (
                        <span key={kp} className="text-[9px] text-gray-500 bg-white/60 px-1.5 py-0.5 rounded">{kp}</span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${c.text} mt-1 opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                {/* Selector Guide Download */}
                {guideName && (
                  <div
                    className="mt-3 pt-3 border-t border-dashed border-gray-200"
                    onClick={(e) => handleDownloadGuide(e, guideName)}
                  >
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${c.text} hover:underline cursor-pointer`}>
                      <BookText className="w-3 h-3" /> Download Selection Guide
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: OVERVIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === "overview" && family) {
    return (
      <div className="space-y-6">
        {/* Family Header */}
        <div className={`bg-gradient-to-r ${colors.gradient} border ${colors.border} rounded-xl p-6`}>
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl ${colors.button} flex items-center justify-center shrink-0`}>
              {FAMILY_ICONS[family.id]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{family.name}</h2>
                <Badge variant="outline" className="text-[10px]">{models.length} Models</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">{family.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {family.typicalApplications.map((app) => (
                  <Badge key={app} variant="outline" className="text-[10px] bg-white">{app}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Package className="w-5 h-5" />, label: "Models", value: models.length },
            { icon: <Shield className="w-5 h-5" />, label: "Flameproof", value: models.filter((m) => m.isFlameproof).length },
            { icon: <Zap className="w-5 h-5" />, label: "Battery", value: models.filter((m) => m.isBatteryOperated).length },
            { icon: <Beaker className="w-5 h-5" />, label: "Hygienic", value: models.filter((m) => m.isHygienic).length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border rounded-lg p-3 text-center">
              <div className={`${colors.text} flex justify-center mb-1`}>{stat.icon}</div>
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => { setView("wizard"); setWizardStep(0); setAnswers({}); }}
            className={`${colors.button} gap-2 text-white`}>
            <Sparkles className="w-4 h-4" /> Model Selection Wizard
          </Button>
          {compareList.length >= 2 && (
            <Button variant="outline" onClick={() => setView("comparison")} className="gap-2">
              <Layers className="w-4 h-4" /> Compare ({compareList.length})
            </Button>
          )}
          <Button variant="ghost" onClick={() => setView("family-select")} className="gap-2 ml-auto">
            <ArrowLeft className="w-4 h-4" /> All Families
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search models, applications, materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="all">All Models</option>
            <option value="flameproof">Flameproof Only</option>
            <option value="battery">Battery Operated</option>
            <option value="hygienic">Hygienic</option>
            <option value="high-pressure">High Pressure</option>
          </select>
        </div>

        {/* Model Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              colors={colors}
              isComparing={compareList.includes(model.id)}
              onToggleCompare={() => toggleCompare(model.id)}
              onViewDetail={() => { setSelectedModelId(model.id); setView("detail"); }}
              onDownload={() => downloadPdf(model)}
            />
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: WIZARD
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === "wizard" && family && currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setView("overview")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className={`w-5 h-5 ${colors.text}`} />
                Model Selection Wizard
              </CardTitle>
              <Badge variant="outline">Step {wizardStep + 1} of {wizardQuestions.length}</Badge>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${colors.badge} transition-all`} style={{ width: `${((wizardStep + 1) / wizardQuestions.length) * 100}%` }} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-bold">{currentQuestion.question}</h3>
            <div className="space-y-2">
              {currentQuestion.options?.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: opt.value }))}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    answers[currentQuestion.id] === opt.value
                      ? `${colors.border} ${colors.bg}`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion.id] === opt.value ? colors.border.replace("border-", "border-") : "border-gray-300"
                    }`}>
                      {answers[currentQuestion.id] === opt.value && <div className={`w-2 h-2 rounded-full ${colors.badge}`} />}
                    </div>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleWizardPrev} disabled={wizardStep === 0}>
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <Button
                onClick={handleWizardNext}
                disabled={!answers[currentQuestion.id]}
                className={`${colors.button} text-white`}
              >
                {wizardStep === wizardQuestions.length - 1 ? "Get Recommendation" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: RESULTS
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === "results" && family) {
    const recommended = selectionResults.filter((r) => r.suitability === "recommended");
    const suitable = selectionResults.filter((r) => r.suitability === "suitable");
    const alternative = selectionResults.filter((r) => r.suitability === "alternative");
    const notSuitable = selectionResults.filter((r) => r.suitability === "not-suitable");

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setView("overview")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </Button>

        <div className="text-center">
          <h2 className="text-xl font-bold">Selection Results</h2>
          <p className="text-sm text-muted-foreground">Based on your requirements for {family.shortName}</p>
        </div>

        {recommended.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Recommended ({recommended.length})
            </h3>
            {recommended.map((r) => (
              <ResultCard key={r.model.id} result={r} colors={colors}
                onViewDetail={() => { setSelectedModelId(r.model.id); setView("detail"); }}
                onDownload={() => downloadPdf(r.model)} />
            ))}
          </div>
        )}

        {suitable.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2">
              <Check className="w-5 h-5" /> Suitable ({suitable.length})
            </h3>
            {suitable.map((r) => (
              <ResultCard key={r.model.id} result={r} colors={colors}
                onViewDetail={() => { setSelectedModelId(r.model.id); setView("detail"); }}
                onDownload={() => downloadPdf(r.model)} />
            ))}
          </div>
        )}

        {alternative.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-amber-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Alternative ({alternative.length})
            </h3>
            {alternative.map((r) => (
              <ResultCard key={r.model.id} result={r} colors={colors}
                onViewDetail={() => { setSelectedModelId(r.model.id); setView("detail"); }}
                onDownload={() => downloadPdf(r.model)} />
            ))}
          </div>
        )}

        {notSuitable.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Not Suitable ({notSuitable.length})
            </h3>
            {notSuitable.map((r) => (
              <ResultCard key={r.model.id} result={r} colors={colors}
                onViewDetail={() => { setSelectedModelId(r.model.id); setView("detail"); }}
                onDownload={() => downloadPdf(r.model)} />
            ))}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => { setWizardStep(0); setAnswers({}); setView("wizard"); }}>
            <Sparkles className="w-4 h-4 mr-2" /> Restart Wizard
          </Button>
          <Button variant="ghost" onClick={() => setView("family-select")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> All Families
          </Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: DETAIL
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === "detail" && selectedModel) {
    return <ModelDetailView model={selectedModel} colors={FAMILY_COLORS[selectedModel.family]} onBack={() => setView("overview")} onDownload={() => downloadPdf(selectedModel)} />;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: COMPARISON
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === "comparison" && family) {
    const compareModels = models.filter((m) => compareList.includes(m.id));
    const rows: [string, (m: ProductModel) => string][] = [
      ["Application", (m) => m.application.join(", ")],
      ["Pressure Range", (m) => m.pressureRange],
      ["Temperature Range", (m) => m.tempRange],
      ["Flowtube MOC", (m) => m.flowtubeMoc],
      ["Connection Type", (m) => m.processConnectionType],
      ["Connection Std", (m) => m.processConnectionStd],
      ["Enclosure", (m) => m.electronicsEnclosure],
      ["Output", (m) => m.output],
      ["Power Supply", (m) => m.powerSupply],
      ["Accuracy", (m) => m.accuracy],
      ["Flameproof", (m) => m.isFlameproof ? "Yes" : "No"],
      ["Battery", (m) => m.isBatteryOperated ? "Yes" : "No"],
      ["Hygienic", (m) => m.isHygienic ? "Yes" : "No"],
      ["High Pressure", (m) => m.isHighPressure ? "Yes" : "No"],
    ];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setView("overview")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCompareList([])}>Clear All</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 border text-left font-bold sticky left-0 bg-gray-50 z-10 min-w-[140px]">Parameter</th>
                {compareModels.map((m) => (
                  <th key={m.id} className="p-3 border text-left font-bold min-w-[180px]">{m.modelName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, fn]) => (
                <tr key={label} className="hover:bg-gray-50">
                  <td className="p-3 border font-medium sticky left-0 bg-white z-10">{label}</td>
                  {compareModels.map((m) => (
                    <td key={m.id} className="p-3 border">{fn(m)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Model Card ─────────────────────────────────────────────────────────────
function ModelCard({
  model, colors, isComparing, onToggleCompare, onViewDetail, onDownload,
}: {
  model: ProductModel; colors: any; isComparing: boolean;
  onToggleCompare: () => void; onViewDetail: () => void; onDownload: () => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-sm">{model.modelName}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">{model.shortDesc}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            {model.isFlameproof && <Badge className="text-[8px] bg-red-100 text-red-700 border-red-300 px-1">FLP</Badge>}
            {model.isBatteryOperated && <Badge className="text-[8px] bg-blue-100 text-blue-700 border-blue-300 px-1">BAT</Badge>}
            {model.isHygienic && <Badge className="text-[8px] bg-green-100 text-green-700 border-green-300 px-1">HYG</Badge>}
            {model.isHighPressure && <Badge className="text-[8px] bg-amber-100 text-amber-700 border-amber-300 px-1">HP</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1"><Gauge className="w-3 h-3 text-gray-400" />{model.pressureRange}</div>
          <div className="flex items-center gap-1"><Thermometer className="w-3 h-3 text-gray-400" />{model.tempRange}</div>
          <div className="flex items-center gap-1"><Droplets className="w-3 h-3 text-gray-400" />{model.flowtubeMoc}</div>
          <div className="flex items-center gap-1"><Wrench className="w-3 h-3 text-gray-400" />{model.processConnectionType}</div>
        </div>

        <div className="flex flex-wrap gap-1">
          {model.specialFeatures.slice(0, 2).map((f) => (
            <Badge key={f} variant="outline" className="text-[8px] px-1 py-0">{f}</Badge>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" className="text-xs h-8 flex-1" onClick={onViewDetail}>
            <FileText className="w-3 h-3 mr-1" />Details
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-8 flex-1" onClick={onDownload}>
            <Download className="w-3 h-3 mr-1" />PDF
          </Button>
          <Button
            size="sm"
            variant={isComparing ? "default" : "outline"}
            className={`text-xs h-8 px-2 ${isComparing ? colors.button : ""}`}
            onClick={onToggleCompare}
          >
            {isComparing ? <Check className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Result Card ────────────────────────────────────────────────────────────
function ResultCard({
  result, colors, onViewDetail, onDownload,
}: {
  result: ModelScore; colors: any;
  onViewDetail: () => void; onDownload: () => void;
}) {
  const statusConfig: Record<Suitability, { border: string; bg: string; opacity: string }> = {
    recommended:  { border: "border-green-400", bg: "bg-green-50", opacity: "" },
    suitable:     { border: "border-blue-300", bg: "bg-blue-50", opacity: "" },
    alternative:  { border: "border-amber-300", bg: "bg-amber-50", opacity: "" },
    "not-suitable": { border: "border-red-300", bg: "bg-red-50", opacity: "opacity-70" },
  };
  const cfg = statusConfig[result.suitability];
  const col = getSuitabilityColor(result.suitability);
  const lbl = getSuitabilityLabel(result.suitability);

  return (
    <div className={`border-2 rounded-lg p-4 ${cfg.border} ${cfg.bg} ${cfg.opacity}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Badge style={{ backgroundColor: col, color: "white" }} className="text-[10px]">{lbl}</Badge>
          <h4 className="font-bold text-sm">{result.model.modelName}</h4>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={onViewDetail}>
            <FileText className="w-3 h-3 mr-1" />View
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7" onClick={onDownload}>
            <Download className="w-3 h-3 mr-1" />PDF
          </Button>
        </div>
      </div>

      {result.reasons.length > 0 && (
        <div className="space-y-0.5 mb-2">
          {result.reasons.map((r, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-green-700">
              <CheckCircle2 className="w-3 h-3 shrink-0" />{r}
            </div>
          ))}
        </div>
      )}

      <div className="text-[10px] text-muted-foreground">Score: {result.score}/100</div>
    </div>
  );
}

// ─── Model Detail View ──────────────────────────────────────────────────────
function ModelDetailView({
  model, colors, onBack, onDownload,
}: {
  model: ProductModel; colors: any; onBack: () => void; onDownload: () => void;
}) {
  const extraRows: [string, string][] = [];
  if (model.conductivity) extraRows.push(["Conductivity", model.conductivity]);
  if (model.coilHousingMoc) extraRows.push(["Coil Housing MOC", model.coilHousingMoc]);
  if (model.electrodeMaterial) extraRows.push(["Electrode Material", model.electrodeMaterial]);
  if (model.earthingType) extraRows.push(["Earthing Type", model.earthingType]);
  if (model.liningMaterial) extraRows.push(["Lining Material", model.liningMaterial]);
  if (model.impellerType) extraRows.push(["Impeller Type", model.impellerType]);
  if (model.ptCompensation) extraRows.push(["P&T Compensation", model.ptCompensation]);

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Models
      </Button>

      <div className={`bg-gradient-to-r ${colors.button} text-white rounded-xl p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{model.modelName}</h2>
            <p className="text-white/80 text-sm mt-1">{model.shortDesc}</p>
            <p className="text-white/60 text-[10px] mt-1 font-mono">{model.modelNo}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {model.isFlameproof && <Badge className="bg-white/20 text-white border-white/30">Flameproof</Badge>}
            {model.isBatteryOperated && <Badge className="bg-white/20 text-white border-white/30">Battery</Badge>}
            {model.isHygienic && <Badge className="bg-white/20 text-white border-white/30">Hygienic</Badge>}
            {model.isHighPressure && <Badge className="bg-white/20 text-white border-white/30">High Pressure</Badge>}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onDownload} className={`${colors.button} text-white gap-2`}>
          <Download className="w-4 h-4" /> Download Datasheet PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpecTable title="General Specifications" icon={<Gauge className="w-4 h-4" />} color={colors.text}
          rows={[
            ["Accuracy", model.accuracy],
            ["Viscosity", model.viscosity],
            ["Temperature Range", model.tempRange],
            ["Pressure Range", model.pressureRange],
            ["Corrosion Resistance", model.corrosionResistance],
            ...extraRows,
          ]} />
        <SpecTable title="Material of Construction" icon={<Wrench className="w-4 h-4" />} color={colors.text}
          rows={[
            ["Flowtube MOC", model.flowtubeMoc],
            ["Process Connection MOC", model.processConnectionMoc],
            ["Electronics Enclosure", model.electronicsEnclosure],
          ]} />
        <SpecTable title="Process Connection" icon={<Droplets className="w-4 h-4" />} color={colors.text}
          rows={[
            ["Connection Type", model.processConnectionType],
            ["Connection Standard", model.processConnectionStd],
          ]} />
        <SpecTable title="Electrical Specifications" icon={<Zap className="w-4 h-4" />} color={colors.text}
          rows={[
            ["Output", model.output],
            ["Communication", model.communication],
            ["Power Supply", model.powerSupply],
            ["Wiring Type", model.wiringType],
            ["Transmitter Mounting", model.transmitterMounting],
          ]} />
        {model.cableGlandMoc && (
          <SpecTable title="Cable & Protection" icon={<Shield className="w-4 h-4" />} color={colors.text}
            rows={[
              ["Cable Gland MOC", model.cableGlandMoc],
              ["Cable Entry Standard", model.cableEntryStd || "N/A"],
              ["Cable Gland Protection", model.cableGlandProtection || "N/A"],
              ["Certifications", model.certifications.join(", ")],
            ]} />
        )}
        <SpecTable title="Accessories & Features" icon={<Star className="w-4 h-4" />} color={colors.text}
          rows={[
            ["Accessories", model.accessories.join(", ")],
            ["Special Features", model.specialFeatures.join("; ")],
            ["Limitations", model.limitations.join("; ")],
          ]} />
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2" style={{ color: colors.text.replace("text-", "") }}>
          <Beaker className="w-4 h-4" style={{ color: "inherit" }} />Application Suitability
        </CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {model.application.map((a) => (
              <Badge key={a} variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>{a}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Spec Table Helper ──────────────────────────────────────────────────────
function SpecTable({ title, icon, color, rows }: { title: string; icon: React.ReactNode; color: string; rows: [string, string][] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm flex items-center gap-2 ${color}`}>{icon}{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <table className="w-full text-[11px]">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} className="border-b last:border-0">
                <td className="py-1.5 pr-3 text-muted-foreground w-[40%]">{label}</td>
                <td className="py-1.5 font-medium">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
