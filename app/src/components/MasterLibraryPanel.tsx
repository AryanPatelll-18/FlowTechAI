// ============================================================
// MasterLibraryPanel — Browse Master GAD + QAP + Datasheet templates
// ============================================================

import { useState } from "react";
import {
  ChevronDown, ChevronUp, FileSpreadsheet,
  ShieldCheck, ClipboardCheck, CheckCircle, Clock,
  Factory, Layers, Activity, BookOpen, FileText,
  HelpCircle, Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  MASTER_GAD_LIBRARY,
  PRODUCT_CATEGORIES,
  PRODUCT_FAMILY_LABELS,
  type MasterDocument,
} from "../data/masterDocumentLibrary";
import {
  QAP_MASTER_MAP,
  QAP_PRODUCT_LABELS,
  QAP_PENDING_PRODUCTS,
  type QapProductFamily,
} from "../data/qapMasterData";
import { renderQapHtml } from "../data/qapRenderer";
import {
  ALL_DECODE_ENTRIES,
  DECODE_PRODUCT_LABELS,
  NON_DECODIFICATION_PRODUCTS,
  type DecodificationEntry,
} from "../data/decodeDatasheetData";
import { renderDecodeHtml } from "../data/decodeRenderer";
import {
  MODEL_FAMILY_GROUPS,
  TOTAL_MODEL_COUNT,
} from "../data/unifiedModelDatasheets";
import { getExplainerGuide, type ModelExplainerGuide } from "../data/modelExplainerGuides";
type MasterTab = "gad" | "qap" | "datasheet" | "model_datasheets";
type FilterCategory = "all" | "flow" | "level" | "pressure";

// ─── QAP Viewer overlay ──────────────────────────────────────────────────
function QapInlineViewer({ html, title, onClose }: { html: string; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white rounded-t-lg shrink-0">
          <span className="text-sm font-bold truncate">{title}</span>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => window.print()} className="text-[10px] bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Print to PDF</button>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">✕</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-white p-2">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}

// ─── GAD Card ────────────────────────────────────────────────────────────
function GadCard({ doc, isExpanded, onToggle }: { doc: MasterDocument; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <button className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 text-left gap-2 sm:gap-0 hover:bg-gray-50" onClick={onToggle}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{doc.title}</div>
            <div className="text-[10px] text-gray-500 flex items-center gap-2 flex-wrap">
              <span>{PRODUCT_FAMILY_LABELS[doc.productFamily]}</span>
              <Badge className="text-[8px] px-1 py-0 bg-gray-100 text-gray-600 border-gray-200">{doc.revision}</Badge>
              <span>· {doc.date}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-gray-400">{doc.sections.length} sections</span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>
      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50 space-y-3">
          <p className="text-xs text-gray-600">{doc.description}</p>
          {doc.sections.map((section, si) => (
            <div key={si} className="bg-white rounded-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                <ClipboardCheck className="w-3 h-3 text-gray-500" />{section.heading}
              </div>
              <table className="w-full text-[10px]">
                <tbody>{section.fields.map((field, fi) => (
                  <tr key={fi} className={`border-b border-gray-50 last:border-0 ${fi % 2 === 1 ? "bg-gray-50/30" : ""}`}>
                    <td className="px-3 py-1.5 text-gray-600 w-1/3 align-top">{field.label}</td>
                    <td className="px-3 py-1.5 text-gray-800 font-medium align-top">{field.value}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── QAP Available Card ──────────────────────────────────────────────────
function QapAvailableCard({ family, entry, onView }: { family: QapProductFamily; entry: typeof QAP_MASTER_MAP[QapProductFamily]; onView: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-green-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <button className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 text-left gap-2 sm:gap-0 hover:bg-green-50/50" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">{QAP_PRODUCT_LABELS[family]}</div>
            <div className="text-[10px] text-gray-500 flex items-center gap-2 flex-wrap">
              <Badge className="text-[8px] px-1 py-0 bg-green-100 text-green-700 border-green-200 font-bold">AVAILABLE</Badge>
              <span>{entry.docNo}</span>
              <span>· Rev {entry.revNo}</span>
              <span>· {entry.date}</span>
              <span>· {entry.rows.length} inspection points</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="text-[10px] bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded font-medium"
          >
            Preview QAP
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-green-100 px-4 py-3 bg-green-50/30 space-y-2">
          <div className="text-[10px] text-gray-500 mb-2">
            <span className="font-semibold">Approved by:</span> {entry.approvedBy}
            {entry.remarks && <span className="italic text-amber-700 block mt-1">{entry.remarks}</span>}
          </div>
          <table className="w-full text-[9px] border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left border">Sr</th>
                <th className="px-2 py-1 text-left border">Component / Operation</th>
                <th className="px-2 py-1 text-left border">Characteristics</th>
                <th className="px-2 py-1 text-center border">Cat</th>
                <th className="px-2 py-1 text-left border">Method</th>
                <th className="px-2 py-1 text-center border">FT</th>
                <th className="px-2 py-1 text-left border">Remarks</th>
              </tr>
            </thead>
            <tbody>{entry.rows.map((r, i) => (
              <tr key={i} className={`${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                <td className="px-2 py-1 border text-center font-bold">{r.srNo}</td>
                <td className="px-2 py-1 border font-medium">{r.component}</td>
                <td className="px-2 py-1 border text-gray-600">{r.characteristics}</td>
                <td className="px-2 py-1 border text-center font-bold" style={{color: r.category==='CR'?'#dc2626':r.category==='MA'?'#c20017':'#666'}}>{r.category}</td>
                <td className="px-2 py-1 border text-gray-600">{r.method}</td>
                <td className="px-2 py-1 border text-center font-bold text-red-700">{r.flowtech}</td>
                <td className="px-2 py-1 border text-gray-500">{r.remarks}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── QAP Pending Card ────────────────────────────────────────────────────
function QapPendingCard({ label }: { label: string }) {
  return (
    <div className="border border-amber-200 rounded-lg bg-amber-50/30 p-3 flex items-center gap-3 opacity-70">
      <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
        <Clock className="w-4 h-4 text-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-500">{label}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge className="text-[8px] px-1 py-0 bg-amber-100 text-amber-700 border-amber-200 font-bold">PENDING</Badge>
          <span className="text-[10px] text-amber-600">QAP not yet uploaded</span>
        </div>
      </div>
    </div>
  );
}

// ─── De-codification Datasheet Card ──────────────────────────────────────
function DecodeCard({ entry, isExpanded, onToggle, onPreview }: { entry: DecodificationEntry; isExpanded: boolean; onToggle: () => void; onPreview: () => void }) {
  return (
    <div className="border border-indigo-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <button className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 text-left gap-2 sm:gap-0 hover:bg-indigo-50/30" onClick={onToggle}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{entry.productName}</div>
            <div className="text-[10px] text-gray-500 flex items-center gap-2 flex-wrap">
              <span>{DECODE_PRODUCT_LABELS[entry.productFamily]}</span>
              <Badge className="text-[8px] px-1 py-0 bg-indigo-100 text-indigo-700 border-indigo-200">{entry.docNo}</Badge>
              <span>· {entry.revision}</span>
              <span>· {entry.categories.length} positions</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            className="text-[10px] bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded font-medium"
          >
            Preview DS
          </button>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>
      {isExpanded && (
        <div className="border-t border-indigo-100 px-4 py-3 bg-indigo-50/20 space-y-3">
          <p className="text-xs text-gray-600">{entry.description}</p>
          {/* Order Code Header */}
          <div className="bg-gray-900 text-white px-3 py-2 rounded-md text-center">
            <div className="text-[10px] opacity-70">ORDER CODE STRUCTURE</div>
            <div className="text-sm font-bold tracking-wider">{entry.modelPrefix}- [{entry.categories.map((c) => c.position).join("] [")}]</div>
          </div>
          {/* Decode Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {entry.categories.map((cat) => (
              <div key={cat.position} className="bg-white rounded-md border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-3 py-1.5 text-[10px] font-bold text-gray-800 flex items-center gap-1.5">
                  <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[8px]">POS {cat.position}</span>
                  {cat.name}
                </div>
                <table className="w-full text-[9px]">
                  <tbody>{cat.options.map((opt, oi) => (
                    <tr key={oi} className={`border-b border-gray-50 last:border-0 ${oi % 2 === 1 ? "bg-gray-50/30" : ""}`}>
                      <td className="px-3 py-1 font-bold text-indigo-700 w-12 align-top">{opt.code}</td>
                      <td className="px-3 py-1 text-gray-700 align-top">{opt.description}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Model Explainer Guide ───────────────────────────────────────────────
function ModelExplainer({ guide }: { guide: ModelExplainerGuide }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50/40 mb-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-blue-50/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-[11px] font-bold text-blue-800">Model Naming Guide — How to Read {guide.family} Model Codes</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className="text-[7px] px-1 py-0 bg-blue-100 text-blue-700 border-blue-200">{guide.suffixCodes.length} codes</Badge>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-blue-500" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-500" />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-blue-100 px-3 py-3 space-y-3">
          {/* Overview */}
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-800 leading-relaxed">{guide.overview}</p>
          </div>

          {/* Suffix Codes Table */}
          <div className="bg-white rounded-md border border-blue-100 overflow-hidden">
            <div className="bg-blue-100 px-3 py-1.5 text-[9px] font-bold text-blue-800 uppercase tracking-wide">
              Model Suffix Code Reference
            </div>
            <table className="w-full text-[9px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left border-b border-gray-100 w-[18%]">Suffix</th>
                  <th className="px-2 py-1 text-left border-b border-gray-100 w-[22%]">Meaning</th>
                  <th className="px-2 py-1 text-left border-b border-gray-100">Description</th>
                </tr>
              </thead>
              <tbody>
                {guide.suffixCodes.map((item, i) => (
                  <tr key={i} className={`${i % 2 === 1 ? "bg-blue-50/20" : ""} border-b border-gray-50 last:border-0`}>
                    <td className="px-2 py-1.5 font-bold text-blue-700 align-top">{item.code}</td>
                    <td className="px-2 py-1.5 font-semibold text-gray-700 align-top">{item.meaning}</td>
                    <td className="px-2 py-1.5 text-gray-600 align-top">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <div className="text-[9px] font-bold text-blue-700 uppercase tracking-wide">Important Notes</div>
            {guide.notes.map((note, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[9px] text-blue-800">
                <span className="text-blue-400 shrink-0 mt-0.5">&#8226;</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Awaiting De-codification Upload Card ────────────────────────────────
function AwaitingDecodeCard({ productName }: { productName: string }) {
  return (
    <div className="border border-amber-200 rounded-lg bg-amber-50/30 p-3 flex items-center gap-3 opacity-70">
      <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
        <Clock className="w-4 h-4 text-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-500">{productName}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge className="text-[8px] px-1 py-0 bg-amber-100 text-amber-700 border-amber-200 font-bold">AWAITING UPLOAD</Badge>
          <span className="text-[10px] text-amber-600">De-codification sheet not yet uploaded</span>
        </div>
      </div>
    </div>
  );
}

export default function MasterLibraryPanel() {
  const [activeTab, setActiveTab] = useState<MasterTab>("gad");
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [qapViewer, setQapViewer] = useState<{ open: boolean; html: string; title: string }>({ open: false, html: "", title: "" });

  // GAD filtering
  const gadFiltered = MASTER_GAD_LIBRARY.filter((d) => {
    const matchesCategory = filterCategory === "all" ||
      PRODUCT_CATEGORIES.some((c) => c.key === filterCategory && c.families.includes(d.productFamily));
    const matchesSearch = !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.productName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Categorize QAP products by flow/level/pressure
  const availableQaps = Object.entries(QAP_MASTER_MAP) as [QapProductFamily, typeof QAP_MASTER_MAP[QapProductFamily]][];
  const pendingQaps = QAP_PENDING_PRODUCTS;

  const qapFlowAvailable = availableQaps.filter(([f]) => ["emf", "turbine", "oval_gear", "rotameter", "ultrasonic", "vortex", "acrylic_body_rotameter", "bypass_rotameter"].includes(f));
  const qapLevelAvailable = availableQaps.filter(([f]) => ["magnetic_level", "reflex_level", "transparent_level", "tubular_level", "float_board_level", "radar_level", "hydrostatic_level"].includes(f));
  const qapPressureAvailable = availableQaps.filter(([f]) => ["smart_pressure", "dp_pressure", "miniature_pressure"].includes(f));

  const qapFlowPending = pendingQaps.filter(() => false); // All flow QAPs available
  const qapLevelPending = pendingQaps.filter(() => false); // All level QAPs now available
  const qapPressurePending = pendingQaps.filter(() => false); // All pressure QAPs available

  const totalQapAvailable = availableQaps.length;
  const totalQapPending = pendingQaps.length;

  // De-codification datasheet filtering (only products WITH de-codification)
  const dsFiltered = ALL_DECODE_ENTRIES.filter((d) => {
    const matchesCategory = filterCategory === "all" ||
      (filterCategory === "flow" && ["emf", "vortex", "oval_gear", "turbine", "bypass_rotameter", "metal_tube_rotameter", "glass_tube_rotameter"].includes(d.productFamily)) ||
      (filterCategory === "level" && ["magnetic_level", "top_mounted_magnetic", "reflex_level", "transparent_level", "tubular_level", "ultrasonic_level", "radar_level", "float_board_level", "hydrostatic_level"].includes(d.productFamily)) ||
      (filterCategory === "pressure" && ["miniature_pressure", "smart_pressure", "dp_pressure_simple", "dp_pressure_high_precision"].includes(d.productFamily));
    const matchesSearch = !searchQuery || d.productName.toLowerCase().includes(searchQuery.toLowerCase()) || DECODE_PRODUCT_LABELS[d.productFamily].toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const dsFlow = dsFiltered.filter((d) => ["emf", "vortex", "oval_gear", "turbine", "bypass_rotameter", "metal_tube_rotameter", "glass_tube_rotameter"].includes(d.productFamily));
  const dsLevel = dsFiltered.filter((d) => ["magnetic_level", "top_mounted_magnetic", "reflex_level", "transparent_level", "tubular_level", "ultrasonic_level", "radar_level", "float_board_level", "hydrostatic_level"].includes(d.productFamily));
  const dsPressure = dsFiltered.filter((d) => ["miniature_pressure", "smart_pressure", "dp_pressure_simple", "dp_pressure_high_precision"].includes(d.productFamily));

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="grid grid-cols-4 gap-3">
        <button onClick={() => setActiveTab("gad")} className={`rounded-lg p-3 text-center border-2 transition-all ${activeTab === "gad" ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
          <FileSpreadsheet className={`w-6 h-6 mx-auto mb-1 ${activeTab === "gad" ? "text-blue-600" : "text-gray-400"}`} />
          <div className={`text-lg font-bold ${activeTab === "gad" ? "text-blue-700" : "text-gray-600"}`}>{MASTER_GAD_LIBRARY.length}</div>
          <div className="text-[10px] font-medium text-gray-500">Master GADs</div>
        </button>
        <button onClick={() => setActiveTab("qap")} className={`rounded-lg p-3 text-center border-2 transition-all ${activeTab === "qap" ? "border-green-400 bg-green-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
          <ShieldCheck className={`w-6 h-6 mx-auto mb-1 ${activeTab === "qap" ? "text-green-600" : "text-gray-400"}`} />
          <div className={`text-lg font-bold ${activeTab === "qap" ? "text-green-700" : "text-gray-600"}`}>{totalQapAvailable}</div>
          <div className="text-[10px] font-medium text-gray-500">QAPs Available</div>
          <div className="text-[9px] text-amber-600 mt-0.5">{totalQapPending} pending upload</div>
        </button>
        <button onClick={() => setActiveTab("datasheet")} className={`rounded-lg p-3 text-center border-2 transition-all ${activeTab === "datasheet" ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
          <BookOpen className={`w-6 h-6 mx-auto mb-1 ${activeTab === "datasheet" ? "text-indigo-600" : "text-gray-400"}`} />
          <div className={`text-lg font-bold ${activeTab === "datasheet" ? "text-indigo-700" : "text-gray-600"}`}>{ALL_DECODE_ENTRIES.length}</div>
          <div className="text-[10px] font-medium text-gray-500">De-Code DS</div>
          <div className="text-[9px] text-gray-400 mt-0.5">{NON_DECODIFICATION_PRODUCTS.length} without</div>
        </button>
        <button onClick={() => setActiveTab("model_datasheets")} className={`rounded-lg p-3 text-center border-2 transition-all ${activeTab === "model_datasheets" ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
          <FileText className={`w-6 h-6 mx-auto mb-1 ${activeTab === "model_datasheets" ? "text-amber-600" : "text-gray-400"}`} />
          <div className={`text-lg font-bold ${activeTab === "model_datasheets" ? "text-amber-700" : "text-gray-600"}`}>{TOTAL_MODEL_COUNT}</div>
          <div className="text-[10px] font-medium text-gray-500">Model Datasheets</div>
          <div className="text-[9px] text-gray-400 mt-0.5">All Products</div>
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input type="text" placeholder={`Search ${activeTab.toUpperCase()} masters...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-9 px-3 text-xs border border-gray-300 rounded-md bg-white" />
        </div>
        <div className="flex gap-1">
          {(["all", "flow", "level", "pressure"] as FilterCategory[]).map((cat) => (
            <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${filterCategory === cat ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── GAD VIEW ─────────────────────────────────────────── */}
      {activeTab === "gad" && (
        <div className="space-y-2">
          {gadFiltered.map((doc) => (
            <GadCard key={doc.id} doc={doc} isExpanded={expandedDoc === doc.id} onToggle={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)} />
          ))}
        </div>
      )}

      {/* ─── QAP VIEW ─────────────────────────────────────────── */}
      {activeTab === "qap" && (
        <div className="space-y-4">
          {/* Summary Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-green-800">{totalQapAvailable} QAPs Available — Factory Verified</div>
              <div className="text-[10px] text-green-600">Extracted from uploaded Flowtech DOCX files. Pending products cannot generate QAP until uploaded.</div>
            </div>
          </div>

          {/* FLOW METERS */}
          {(filterCategory === "all" || filterCategory === "flow") && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <Factory className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-gray-800">Flow Meters</h3>
                <Badge className="text-[8px] bg-green-100 text-green-700 border-green-200">{qapFlowAvailable.length} available</Badge>
                {qapFlowPending.length > 0 && <Badge className="text-[8px] bg-amber-100 text-amber-700 border-amber-200">{qapFlowPending.length} pending</Badge>}
              </div>
              <div className="space-y-2">
                {qapFlowAvailable.map(([family, entry]) => (
                  <QapAvailableCard key={family} family={family} entry={entry} onView={() => setQapViewer({ open: true, html: renderQapHtml(entry, "PREVIEW", "Preview", ""), title: entry.title })} />
                ))}
                {qapFlowPending.map((p) => <QapPendingCard key={p.family} label={p.label} />)}
              </div>
            </div>
          )}

          {/* LEVEL DEVICES */}
          {(filterCategory === "all" || filterCategory === "level") && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <Layers className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-gray-800">Level Devices</h3>
                <Badge className="text-[8px] bg-green-100 text-green-700 border-green-200">{qapLevelAvailable.length} available</Badge>
                {qapLevelPending.length > 0 && <Badge className="text-[8px] bg-amber-100 text-amber-700 border-amber-200">{qapLevelPending.length} pending</Badge>}
              </div>
              <div className="space-y-2">
                {qapLevelAvailable.map(([family, entry]) => (
                  <QapAvailableCard key={family} family={family} entry={entry} onView={() => setQapViewer({ open: true, html: renderQapHtml(entry, "PREVIEW", "Preview", ""), title: entry.title })} />
                ))}
                {qapLevelPending.map((p) => <QapPendingCard key={p.family} label={p.label} />)}
              </div>
            </div>
          )}

          {/* PRESSURE TRANSMITTERS */}
          {(filterCategory === "all" || filterCategory === "pressure") && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <Activity className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs font-bold text-gray-800">Pressure Transmitters</h3>
                <Badge className="text-[8px] bg-green-100 text-green-700 border-green-200">{qapPressureAvailable.length} available</Badge>
                {qapPressurePending.length > 0 && <Badge className="text-[8px] bg-amber-100 text-amber-700 border-amber-200">{qapPressurePending.length} pending</Badge>}
              </div>
              <div className="space-y-2">
                {qapPressureAvailable.map(([family, entry]) => (
                  <QapAvailableCard key={family} family={family} entry={entry} onView={() => setQapViewer({ open: true, html: renderQapHtml(entry, "PREVIEW", "Preview", ""), title: entry.title })} />
                ))}
                {qapPressurePending.map((p) => <QapPendingCard key={p.family} label={p.label} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── DATASHEET VIEW (De-codification) ─────────────────── */}
      {activeTab === "datasheet" && (
        <div className="space-y-4">
          {/* Summary Banner */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-indigo-800">{ALL_DECODE_ENTRIES.length} De-Codification Datasheets — Master Decode Format</div>
              <div className="text-[10px] text-indigo-600">Order code structure with position-by-position decodification. Products with simple model codes do not have de-codification datasheets.</div>
            </div>
          </div>

          {/* FLOW METERS + ROTAMETERS */}
          {(filterCategory === "all" || filterCategory === "flow") && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <Factory className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-gray-800">Flow Meters & Rotameters</h3>
                <Badge className="text-[8px] bg-indigo-100 text-indigo-700 border-indigo-200">{dsFlow.length} uploaded, 1 awaiting</Badge>
              </div>
              <div className="space-y-2">
                {dsFlow.map((ds) => (
                  <DecodeCard
                    key={ds.productFamily}
                    entry={ds}
                    isExpanded={expandedDoc === ds.productFamily}
                    onToggle={() => setExpandedDoc(expandedDoc === ds.productFamily ? null : ds.productFamily)}
                    onPreview={() => setQapViewer({ open: true, html: renderDecodeHtml(ds, "PREVIEW", "Preview", ""), title: ds.headerTitle })}
                  />
                ))}
                {/* Products AWAITING de-codification upload */}
                {filterCategory === "all" && (
                  <>
                    <AwaitingDecodeCard productName="Ultrasonic Flow Meter (Flow)" />
                    <AwaitingDecodeCard productName="Acrylic Body Rotameter" />
                  </>
                )}
              </div>
            </div>
          )}

          {/* LEVEL DEVICES */}
          {(filterCategory === "all" || filterCategory === "level") && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <Layers className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-gray-800">Level Devices</h3>
                <Badge className="text-[8px] bg-indigo-100 text-indigo-700 border-indigo-200">{dsLevel.length} uploaded</Badge>
              </div>
              <div className="space-y-2">
                {dsLevel.map((ds) => (
                  <DecodeCard
                    key={ds.productFamily}
                    entry={ds}
                    isExpanded={expandedDoc === ds.productFamily}
                    onToggle={() => setExpandedDoc(expandedDoc === ds.productFamily ? null : ds.productFamily)}
                    onPreview={() => setQapViewer({ open: true, html: renderDecodeHtml(ds, "PREVIEW", "Preview", ""), title: ds.headerTitle })}
                  />
                ))}
                {/* All level devices now have de-codification data */}
              </div>
            </div>
          )}

          {/* PRESSURE TRANSMITTERS */}
          {(filterCategory === "all" || filterCategory === "pressure") && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <Activity className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs font-bold text-gray-800">Pressure Transmitters</h3>
                <Badge className="text-[8px] bg-indigo-100 text-indigo-700 border-indigo-200">{dsPressure.length} uploaded</Badge>
              </div>
              <div className="space-y-2">
                {dsPressure.map((ds) => (
                  <DecodeCard
                    key={ds.productFamily}
                    entry={ds}
                    isExpanded={expandedDoc === ds.productFamily}
                    onToggle={() => setExpandedDoc(expandedDoc === ds.productFamily ? null : ds.productFamily)}
                    onPreview={() => setQapViewer({ open: true, html: renderDecodeHtml(ds, "PREVIEW", "Preview", ""), title: ds.headerTitle })}
                  />
                ))}
                {/* All pressure transmitters now have de-codification data */}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── UNIFIED MODEL DATASHEETS VIEW ───────────────────── */}
      {activeTab === "model_datasheets" && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
            <FileText className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-800">{TOTAL_MODEL_COUNT} Model Datasheets — All Flowtech Products</div>
              <div className="text-[10px] text-amber-600">Professional 1-page datasheets with Process Range, Fixed Specs, and Variable Specs for each model. Click "View Professional Datasheet" to open.</div>
            </div>
          </div>

          {/* Group by Product Family */}
          {MODEL_FAMILY_GROUPS.map((group) => {
            const explainer = getExplainerGuide(group.family);
            return (
            <div key={group.family} className="space-y-3">
              {/* Family Header */}
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <h3 className="text-sm font-bold text-gray-800">{group.family}</h3>
                <Badge className="text-[8px] bg-amber-100 text-amber-700 border-amber-200">{group.models.length} models</Badge>
              </div>

              {/* Model Explainer Guide */}
              {explainer && <ModelExplainer guide={explainer} />}

              {/* Model Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.models.map((model) => (
                  <div key={model.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                    {/* Model Header */}
                    <div className={`px-3 py-2 ${model.allConfig ? "bg-amber-100" : "bg-gray-100"}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-gray-900">{model.modelName}</div>
                        {model.allConfig ? (
                          <Badge className="text-[7px] px-1 py-0 bg-amber-200 text-amber-800 border-amber-300 font-bold">FULL CONFIG</Badge>
                        ) : (
                          <Badge className="text-[7px] px-1 py-0 bg-gray-200 text-gray-700 border-gray-300">{model.configurablePositions.length} config</Badge>
                        )}
                      </div>
                    </div>
                    {/* Model Body */}
                    <div className="px-3 py-2 space-y-1.5">
                      <p className="text-[9px] text-gray-600 leading-relaxed line-clamp-3">{model.description}</p>
                      {/* Highlights */}
                      <div className="space-y-0.5">
                        {model.highlights.slice(0, 2).map((h, i) => (
                          <div key={i} className="text-[8px] text-gray-500 flex items-start gap-1">
                            <CheckCircle className="w-2.5 h-2.5 text-green-500 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                      {/* Code snippet */}
                      <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[8px] font-mono text-gray-500 truncate">
                        {model.modelCode}
                      </div>
                      {/* Datasheet Button */}
                      {model.datasheetFile && (
                        <button
                          onClick={() => window.open(model.datasheetFile, "_blank")}
                          className="w-full text-[10px] border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1.5 rounded font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> View Professional Datasheet
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )})}
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h4 className="text-[10px] font-bold text-gray-700 mb-1.5">Master Library Overview</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[10px] text-gray-600">
          <div><span className="font-semibold text-blue-700">{MASTER_GAD_LIBRARY.length} Master GADs</span> — General Assembly Drawings with dimensional data, MOC, electrical & mechanical specs.</div>
          <div><span className="font-semibold text-green-700">{totalQapAvailable} QAPs Available</span> — Real factory QAP data extracted from uploaded Flowtech DOCX files.</div>
          <div><span className="font-semibold text-indigo-700">{ALL_DECODE_ENTRIES.length} De-Code Datasheets</span> — Master decodification format (order code structure with position options).</div>
          <div><span className="font-semibold text-amber-700">{TOTAL_MODEL_COUNT} Model Datasheets</span> — All Flowtech product models with professional 1-page datasheets (EMF + Turbine).</div>
          <div><span className="font-semibold text-gray-500">{NON_DECODIFICATION_PRODUCTS.length} Simple Model Code</span> — Glass Tube, Acrylic Body, Level Gauges, Float & Board (no de-codification needed).</div>
        </div>
      </div>

      {/* QAP Inline Viewer */}
      {qapViewer.open && <QapInlineViewer html={qapViewer.html} title={qapViewer.title} onClose={() => setQapViewer({ open: false, html: "", title: "" })} />}
    </div>
  );
}
