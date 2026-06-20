// ============================================================
// Document Master Panel — GA Drawing Storage & Management
// Product-wise GA Drawing repository for all Finished Goods
// ============================================================

import { useState, useRef, useMemo } from "react";
import {
  FolderOpen,
  Upload,
  Trash2,
  Eye,
  FileText,
  X,
  Search,
  Image,
  FileImage,
  AlertCircle,
  RefreshCw,
  Archive,
  UploadCloud,
  Pencil,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import GadAnnotationEditor from "./GadAnnotationEditor";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { GaDrawingEntry } from "../data/gaDrawingTypes";
import { generateDrawingNo } from "../data/gaDrawingTypes";
import type { DocumentMasterState } from "../hooks/useDocumentMaster";

type ViewMode = "list" | "upload" | "preview" | "annotate";

// ─── All product families for GA Drawing storage ─────────────
const GA_PRODUCT_FAMILIES: { key: string; label: string; category: string }[] = [
  // Flow Meters
  { key: "emf", label: "Electromagnetic Flow Meter", category: "Flow Meters" },
  { key: "turbine", label: "Turbine Flow Meter", category: "Flow Meters" },
  { key: "vortex", label: "Vortex Flow Meter", category: "Flow Meters" },
  { key: "rotameter", label: "Glass Tube Rotameter", category: "Flow Meters" },
  { key: "metal_tube_rotameter", label: "Metal Tube Rotameter", category: "Flow Meters" },
  { key: "acrylic_body_rotameter", label: "Acrylic Body Rotameter", category: "Flow Meters" },
  { key: "bypass_rotameter", label: "By-Pass Rotameter", category: "Flow Meters" },
  { key: "oval_gear", label: "Oval Gear Flow Meter", category: "Flow Meters" },
  { key: "ultrasonic", label: "Ultrasonic Flow Meter", category: "Flow Meters" },
  // Level Devices
  { key: "magnetic_level", label: "Side Mounted Magnetic Level Gauge", category: "Level Devices" },
  { key: "top_mounted_magnetic", label: "Top Mounted Magnetic Level Gauge", category: "Level Devices" },
  { key: "reflex_level", label: "Reflex Level Gauge", category: "Level Devices" },
  { key: "transparent_level", label: "Transparent Level Gauge", category: "Level Devices" },
  { key: "tubular_level", label: "Tubular Level Gauge", category: "Level Devices" },
  { key: "float_board_level", label: "Float & Board Level Gauge", category: "Level Devices" },
  { key: "radar_level", label: "Radar Level Transmitter", category: "Level Devices" },
  { key: "hydrostatic_level", label: "Hydrostatic Level Transmitter", category: "Level Devices" },
  // Pressure Transmitters
  { key: "smart_pressure", label: "Smart Pressure Transmitter", category: "Pressure Transmitters" },
  { key: "dp_pressure", label: "Differential Pressure Transmitter", category: "Pressure Transmitters" },
  { key: "miniature_pressure", label: "Miniature Pressure Transmitter", category: "Pressure Transmitters" },
  // Level Switches
  { key: "displacer_level_switch", label: "Displacer Level Switch", category: "Level Switches" },
  { key: "side_mounted_level_switch", label: "Side Mounted Level Switch", category: "Level Switches" },
  { key: "top_mounted_level_switch", label: "Top Mounted Level Switch", category: "Level Switches" },
  // Sight Glasses
  { key: "double_window_sight_glass", label: "Double Window Sight Glass", category: "Sight Glasses" },
  { key: "full_view_sight_glass", label: "Full View Sight Glass", category: "Sight Glasses" },
  { key: "allen_bolt_sight_glass", label: "Allen Bolt Sight Glass", category: "Sight Glasses" },
  // Others
  { key: "orifice_flange_assembly", label: "Orifice Flange Assembly", category: "Others" },
];

// ─── Group families by category ──────────────────────────────
const CATEGORY_GROUPS = GA_PRODUCT_FAMILIES.reduce(
  (acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  },
  {} as Record<string, typeof GA_PRODUCT_FAMILIES>
);

// ══════════════════════════════════════════════════════════════
// MAIN PANEL
// ══════════════════════════════════════════════════════════════
interface Props {
  master: DocumentMasterState;
  /** Product family keys from the current SO — when provided, only these families are shown */
  relevantFamilies?: string[];
  /** SO number for display */
  soNo?: string;
}

export default function DocumentMasterPanel({ master, relevantFamilies, soNo }: Props) {
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [previewDrawing, setPreviewDrawing] = useState<GaDrawingEntry | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [annotateDrawing, setAnnotateDrawing] = useState<GaDrawingEntry | null>(null);
  const [annotateUrl, setAnnotateUrl] = useState<string | null>(null);
  const [annotateLoading, setAnnotateLoading] = useState(false);
  const [annotateError, setAnnotateError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter categories by relevant families (from current SO)
  // When relevantFamilies is provided (SO uploaded), ALWAYS filter — ignore any toggle
  const [forceShowAll, setForceShowAll] = useState(false);

  const filteredCategoryGroups = useMemo(() => {
    const hasRelevant = relevantFamilies && relevantFamilies.length > 0;
    // If we have relevant families from an SO: filter ALWAYS applies
    if (hasRelevant && !forceShowAll) {
      const relevantSet = new Set(relevantFamilies);
      const filtered: Record<string, typeof GA_PRODUCT_FAMILIES> = {};
      for (const [category, families] of Object.entries(CATEGORY_GROUPS)) {
        const relevant = families.filter((f) => relevantSet.has(f.key));
        if (relevant.length > 0) filtered[category] = relevant;
      }
      return filtered;
    }
    // No SO uploaded + not forcing show all = empty
    if (!hasRelevant && !forceShowAll) return {} as Record<string, typeof GA_PRODUCT_FAMILIES>;
    // Show all (either forced or no relevant families but toggle is on)
    return CATEGORY_GROUPS;
  }, [relevantFamilies, forceShowAll]);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    drawingNo: "",
    title: "",
    revision: "0",
    description: "",
    selectedFile: null as File | null,
  });

  // Filtered drawings for selected family
  const familyDrawings = useMemo(() => {
    if (!selectedFamily) return [];
    let list = master.getDrawingsByProduct(selectedFamily);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.drawingNo.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q) ||
          d.fileName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedFamily, master, searchQuery]);

  // All drawings count per family
  const familyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of master.drawings) {
      counts[d.productFamily] = (counts[d.productFamily] || 0) + 1;
    }
    return counts;
  }, [master.drawings]);

  // Total drawings
  const totalDrawings = master.drawings.length;

  // ─── Start upload ──────────────────────────────────────
  const handleStartUpload = () => {
    if (!selectedFamily) return;
    const nextNo = generateDrawingNo(selectedFamily, master.drawings);
    setUploadForm({
      drawingNo: nextNo,
      title: "",
      revision: "0",
      description: "",
      selectedFile: null,
    });
    setViewMode("upload");
  };

  // ─── Submit upload ─────────────────────────────────────
  const handleSubmitUpload = async () => {
    if (!uploadForm.selectedFile || !selectedFamily) return;
    const familyInfo = GA_PRODUCT_FAMILIES.find((f) => f.key === selectedFamily);
    await master.addDrawing(
      {
        productFamily: selectedFamily,
        productName: familyInfo?.label || selectedFamily,
        drawingNo: uploadForm.drawingNo,
        title: uploadForm.title,
        revision: uploadForm.revision,
        fileName: uploadForm.selectedFile.name,
        description: uploadForm.description,
      },
      uploadForm.selectedFile
    );
    setViewMode("list");
    setUploadForm({ drawingNo: "", title: "", revision: "0", description: "", selectedFile: null });
  };

  // ─── Preview drawing ───────────────────────────────────
  const handlePreview = async (drawing: GaDrawingEntry) => {
    setPreviewDrawing(drawing);
    setPreviewUrl(null);
    setPreviewLoading(true);
    setViewMode("preview");
    try {
      const url = await master.getFileUrl(drawing.id);
      setPreviewUrl(url);
    } catch (e) {
      console.error("Preview failed:", e);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ─── Download drawing ──────────────────────────────────
  const handleDownload = async (drawing: GaDrawingEntry) => {
    await master.downloadFile(drawing);
  };

  // ─── Convert PDF data URL to image data URL via pdf.js ─
  async function pdfDataUrlToImage(pdfDataUrl: string, scale = 2): Promise<string> {
    // Extract base64 from data URL
    const commaIdx = pdfDataUrl.indexOf(",");
    const base64 = pdfDataUrl.substring(commaIdx + 1);
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);

    const pdf = await pdfjsLib.getDocument({ data: array.buffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL("image/png");
  }

  // ─── Annotate drawing ──────────────────────────────────
  // Uses drawing.fileData DIRECTLY — no async IndexedDB lookup needed
  const handleAnnotate = async (drawing: GaDrawingEntry) => {
    console.log("[DocMaster] Opening annotation for:", drawing.drawingNo, "type:", drawing.fileType, "fileData length:", drawing.fileData?.length || 0);
    setAnnotateDrawing(drawing);
    setAnnotateUrl(null);
    setAnnotateLoading(true);
    setAnnotateError(null);
    setViewMode("annotate");

    try {
      let url: string | null = null;

      // Use fileData directly from the drawing entry — no IndexedDB lookup needed
      if (!drawing.fileData || drawing.fileData.length < 100) {
        throw new Error("Drawing file data not available. Try re-uploading the file.");
      }

      if (drawing.fileType === "jpg" || drawing.fileType === "png") {
        url = drawing.fileData; // Direct data URL — use immediately
      } else if (drawing.fileType === "pdf") {
        // Convert PDF data URL to PNG image via pdf.js
        console.log("[DocMaster] Converting PDF to image...");
        url = await pdfDataUrlToImage(drawing.fileData, 2);
        console.log("[DocMaster] PDF converted, image length:", url.length);
      } else {
        throw new Error("Only JPG, PNG, and PDF files can be annotated. Got: " + drawing.fileType);
      }

      setAnnotateUrl(url);
      setAnnotateLoading(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      console.error("[DocMaster] Annotation failed:", e);
      setAnnotateError(msg);
      setAnnotateLoading(false);
    }
  };

  const handleSaveAnnotated = async (dataUrl: string) => {
    if (!annotateDrawing) return;
    await master.saveAnnotatedDrawing(annotateDrawing, dataUrl, "Dimension annotations added");
    setAnnotateDrawing(null);
    setAnnotateUrl(null);
    setViewMode("list");
  };

  // ─── Export all drawings as JSON backup ────────────────
  const handleExportBackup = async () => {
    try {
      const data = await master.exportDrawings();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      a.href = url;
      a.download = `flowtech_ga_backup_${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
      alert("Export failed. Please try again.");
    }
  };

  // ─── Import drawings from JSON backup ──────────────────
  const handleImportBackup = async (file: File) => {
    try {
      const text = await file.text();
      const drawings = JSON.parse(text) as GaDrawingEntry[];
      if (!Array.isArray(drawings)) {
        alert("Invalid backup file format.");
        return;
      }
      const count = await master.importDrawings(drawings);
      alert(`Successfully restored ${count} drawings.`);
    } catch (e) {
      console.error("Import failed:", e);
      alert("Import failed. Please check the file format.");
    }
  };

  // ─── File icon based on type ───────────────────────────
  const FileIcon = ({ type }: { type: string }) => {
    if (type === "pdf") return <FileText className="w-4 h-4 text-red-500" />;
    if (type === "jpg" || type === "png") return <Image className="w-4 h-4 text-blue-500" />;
    return <FileImage className="w-4 h-4 text-gray-500" />;
  };

  // ════════════════════════════════════════════════════════
  return (
    <div className="flex gap-3 h-[calc(100vh-140px)]">
      {/* ─── LEFT SIDEBAR: Product Family List ─────────── */}
      <div className="w-[260px] flex-shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5" /> Product Families
          </div>
          {soNo && relevantFamilies && relevantFamilies.length > 0 && !forceShowAll && (
            <div className="mt-0.5">
              <div className="text-[9px] text-blue-600 font-medium bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 flex items-center justify-between gap-1">
                <span>Filtered for SO {soNo}: {relevantFamilies.length} famil{relevantFamilies.length !== 1 ? "ies" : "y"}</span>
                <button onClick={() => setForceShowAll(true)} className="text-blue-700 underline hover:text-blue-900 font-bold">Show All</button>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {relevantFamilies.map((famKey) => {
                  const famLabel = GA_PRODUCT_FAMILIES.find((f) => f.key === famKey)?.label || famKey;
                  return (
                    <span key={famKey} className="text-[8px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded border border-green-200 font-medium">
                      {famLabel}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {forceShowAll && (
            <div className="text-[9px] text-amber-600 mt-0.5 font-medium bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 flex items-center justify-between gap-1">
              <span>Showing all product families</span>
              {relevantFamilies && relevantFamilies.length > 0 && (
                <button onClick={() => setForceShowAll(false)} className="text-amber-700 underline hover:text-amber-900 font-bold">Show Relevant Only</button>
              )}
            </div>
          )}
          <div className="text-[9px] text-gray-500 mt-0.5">
            {totalDrawings} drawing{totalDrawings !== 1 ? "s" : ""} total
          </div>
          {/* Backup & Restore */}
          <div className="flex gap-1 mt-2">
            <button
              onClick={handleExportBackup}
              disabled={totalDrawings === 0}
              className="flex items-center gap-1 text-[8px] px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Export all drawings as backup file"
            >
              <Archive className="w-2.5 h-2.5" /> Export Backup
            </button>
            <label className="flex items-center gap-1 text-[8px] px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer transition-colors">
              <UploadCloud className="w-2.5 h-2.5" /> Import Backup
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportBackup(file);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {Object.keys(filteredCategoryGroups).length === 0 && (
            <div className="text-center py-8 px-3">
              <FolderOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-[10px] text-gray-500 font-medium">No product families to show</p>
              <p className="text-[9px] text-gray-400 mt-1">
                {relevantFamilies && relevantFamilies.length === 0
                  ? "The uploaded SO does not contain any recognizable instrument families."
                  : "Upload an SO/QTN on the Datasheet tab to see relevant families, or click Show All below."}
              </p>
              <button
                onClick={() => setForceShowAll(true)}
                className="mt-3 text-[9px] px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
              >
                Show All Product Families
              </button>
            </div>
          )}
          {Object.entries(filteredCategoryGroups).map(([category, families]) => (
            <div key={category}>
              <div className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1">
                {category}
              </div>
              <div className="space-y-0.5">
                {families.map((fam) => {
                  const count = familyCounts[fam.key] || 0;
                  const isSelected = selectedFamily === fam.key;
                  return (
                    <button
                      key={fam.key}
                      onClick={() => {
                        setSelectedFamily(fam.key);
                        setViewMode("list");
                        setSearchQuery("");
                      }}
                      className={`w-full flex items-center justify-between text-[10px] px-2 py-1.5 rounded transition-all ${
                        isSelected
                          ? "bg-red-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span className="truncate text-left flex-1">{fam.label}</span>
                      {count > 0 && (
                        <Badge
                          className={`ml-1 text-[8px] px-1 py-0 h-4 min-w-[18px] flex items-center justify-center ${
                            isSelected
                              ? "bg-white text-red-600"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── RIGHT PANEL: Drawing List / Upload / Preview ── */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        {viewMode === "list" && (
          <>
            {/* Header */}
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <h3 className="text-[12px] font-bold text-gray-800">
                    {selectedFamily
                      ? GA_PRODUCT_FAMILIES.find((f) => f.key === selectedFamily)?.label
                      : "Select a Product Family"}
                  </h3>
                  {selectedFamily && (
                    <Badge className="bg-blue-600 text-white text-[8px]">
                      {familyDrawings.length} drawing{familyDrawings.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => master.refreshDrawings()}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"
                    title="Refresh list"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  {selectedFamily && (
                    <Button
                      size="sm"
                      onClick={handleStartUpload}
                      className="bg-red-600 hover:bg-red-700 text-white text-[10px] h-7 px-2"
                    >
                      <Upload className="w-3 h-3 mr-1" /> Upload GA Drawing
                    </Button>
                  )}
                </div>
              </div>
              {master.error && (
                <div className="flex items-center gap-1.5 text-[9px] text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 mt-1.5">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {master.error}
                </div>
              )}
            </div>

            {/* Search bar */}
            {selectedFamily && (
              <div className="px-3 py-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by drawing no., title, or file name..."
                    className="pl-6 h-7 text-[10px]"
                  />
                </div>
              </div>
            )}

            {/* Drawing list */}
            <div className="flex-1 overflow-y-auto p-3">
              {!selectedFamily ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <FolderOpen className="w-10 h-10 mb-2" />
                  <p className="text-[10px]">Select a product family from the sidebar</p>
                </div>
              ) : familyDrawings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p className="text-[10px]">
                    {searchQuery
                      ? "No drawings match your search"
                      : "No GA Drawings uploaded yet"}
                  </p>
                  {!searchQuery && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleStartUpload}
                      className="mt-2 text-[10px] h-7"
                    >
                      <Upload className="w-3 h-3 mr-1" /> Upload First Drawing
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {familyDrawings.map((drawing) => (
                    <div
                      key={drawing.id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-red-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="mt-0.5">
                            <FileIcon type={drawing.fileType} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-gray-800">
                                {drawing.drawingNo}
                              </span>
                              <Badge className="bg-gray-100 text-gray-600 text-[7px] px-1 py-0 h-3.5">
                                Rev. {drawing.revision}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-gray-700 mt-0.5">
                              {drawing.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[8px] text-gray-500">
                              <span>{drawing.fileName}</span>
                              <span>|</span>
                              <span>{drawing.fileSize}</span>
                              <span>|</span>
                              <span>Uploaded: {drawing.date}</span>
                            </div>
                            {drawing.description && (
                              <p className="text-[8px] text-gray-400 mt-0.5 italic">
                                {drawing.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => handlePreview(drawing)}
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {(drawing.fileType === "jpg" || drawing.fileType === "png" || drawing.fileType === "pdf") && (
                            <button
                              onClick={() => handleAnnotate(drawing)}
                              className="p-1.5 rounded hover:bg-purple-50 text-purple-600 transition-colors"
                              title="Annotate / Add dimensions"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => { handleDownload(drawing); }}
                            className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors"
                            title="Download"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this drawing?")) master.deleteDrawing(drawing.id);
                            }}
                            className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── UPLOAD MODE ─────────────────────────────── */}
        {viewMode === "upload" && selectedFamily && (
          <>
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-[12px] font-bold text-gray-800 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Upload GA Drawing
              </h3>
              <button
                onClick={() => setViewMode("list")}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-lg space-y-4">
                {/* Product Name (read-only) */}
                <div>
                  <label className="text-[9px] font-semibold text-gray-600 uppercase">Product Family</label>
                  <Input
                    value={GA_PRODUCT_FAMILIES.find((f) => f.key === selectedFamily)?.label || ""}
                    disabled
                    className="h-8 text-[10px] bg-gray-50 mt-0.5"
                  />
                </div>

                {/* Drawing No. */}
                <div>
                  <label className="text-[9px] font-semibold text-gray-600 uppercase">Drawing No.</label>
                  <Input
                    value={uploadForm.drawingNo}
                    onChange={(e) =>
                      setUploadForm((p) => ({ ...p, drawingNo: e.target.value }))
                    }
                    className="h-8 text-[10px] mt-0.5"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="text-[9px] font-semibold text-gray-600 uppercase">
                    Drawing Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g., GA Drawing for Electromagnetic Flow Meter"
                    className="h-8 text-[10px] mt-0.5"
                  />
                </div>

                {/* Revision */}
                <div>
                  <label className="text-[9px] font-semibold text-gray-600 uppercase">Revision</label>
                  <Input
                    value={uploadForm.revision}
                    onChange={(e) =>
                      setUploadForm((p) => ({ ...p, revision: e.target.value }))
                    }
                    className="h-8 text-[10px] mt-0.5 w-20"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[9px] font-semibold text-gray-600 uppercase">Description / Notes</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) =>
                      setUploadForm((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Optional notes about this drawing..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-[10px] mt-0.5 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="text-[9px] font-semibold text-gray-600 uppercase">
                    Drawing File <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-0.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setUploadForm((p) => ({ ...p, selectedFile: file }));
                      }}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        uploadForm.selectedFile
                          ? "border-green-400 bg-green-50"
                          : "border-gray-300 hover:border-red-400 hover:bg-red-50"
                      }`}
                    >
                      {uploadForm.selectedFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-[10px] text-green-700 font-medium">
                            {uploadForm.selectedFile.name}
                          </span>
                          <span className="text-[8px] text-gray-500">
                            ({(uploadForm.selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                          <p className="text-[9px] text-gray-500">Click to select file</p>
                          <p className="text-[8px] text-gray-400 mt-0.5">
                            PDF, DWG, DXF, JPG, PNG
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitUpload}
                    disabled={!uploadForm.title || !uploadForm.selectedFile || master.loading}
                    className="bg-red-600 hover:bg-red-700 text-white text-[10px] h-8"
                  >
                    {master.loading ? "Uploading..." : "Save Drawing"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewMode("list")}
                    className="text-[10px] h-8"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── ANNOTATE MODE ───────────────────────────── */}
        {viewMode === "annotate" && annotateDrawing && (
          <>
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-[12px] font-bold text-gray-800 flex items-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5 text-purple-600" /> Annotate Drawing
                </h3>
                <Badge className="bg-purple-600 text-white text-[8px]">
                  {annotateDrawing.drawingNo}
                </Badge>
              </div>
              <button
                onClick={() => { setViewMode("list"); setAnnotateDrawing(null); setAnnotateUrl(null); setAnnotateError(null); }}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {annotateLoading && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-[10px]">Loading drawing for annotation...</p>
                  <p className="text-[8px] text-gray-400 mt-1">{annotateDrawing.drawingNo} — {annotateDrawing.fileType.toUpperCase()}</p>
                </div>
              )}
              {annotateError && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                  <p className="text-[11px] font-semibold text-red-600">{annotateError}</p>
                  <p className="text-[9px] text-gray-400 mt-1">{annotateDrawing.drawingNo}</p>
                  <button
                    onClick={() => handleAnnotate(annotateDrawing)}
                    className="mt-3 text-[9px] px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              )}
              {!annotateLoading && !annotateError && annotateUrl && (
                <GadAnnotationEditor
                  imageUrl={annotateUrl}
                  drawingNo={annotateDrawing.drawingNo}
                  title={annotateDrawing.title}
                  onSave={handleSaveAnnotated}
                  onCancel={() => { setViewMode("list"); setAnnotateDrawing(null); setAnnotateUrl(null); setAnnotateError(null); }}
                />
              )}
            </div>
          </>
        )}

        {/* ─── PREVIEW MODE ────────────────────────────── */}
        {viewMode === "preview" && previewDrawing && (
          <>
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-[12px] font-bold text-gray-800">Preview</h3>
                <Badge className="bg-blue-600 text-white text-[8px]">
                  {previewDrawing.drawingNo}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { handleDownload(previewDrawing); }}
                  className="text-[10px] h-7 px-2"
                >
                  <FileText className="w-3 h-3 mr-1" /> Download
                </Button>
                <button
                  onClick={() => setViewMode("list")}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-3 overflow-hidden">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-[10px]">Loading preview...</p>
                </div>
              ) : !previewUrl ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <FileImage className="w-12 h-12 mb-2" />
                  <p className="text-[10px]">{previewDrawing.fileName}</p>
                  <p className="text-[9px] text-gray-400 mt-1">
                    Could not load preview. Try downloading the file.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(previewDrawing)}
                    className="mt-3 text-[10px] h-7"
                  >
                    <FileText className="w-3 h-3 mr-1" /> Download File
                  </Button>
                </div>
              ) : previewDrawing.fileType === "pdf" ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border border-gray-200 rounded"
                  title={previewDrawing.drawingNo}
                />
              ) : previewDrawing.fileType === "jpg" || previewDrawing.fileType === "png" ? (
                <img
                  src={previewUrl}
                  alt={previewDrawing.drawingNo}
                  className="max-w-full max-h-full object-contain mx-auto border border-gray-200 rounded"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <FileImage className="w-12 h-12 mb-2" />
                  <p className="text-[10px]">{previewDrawing.fileName}</p>
                  <p className="text-[9px] text-gray-400 mt-1">
                    Preview not available for {previewDrawing.fileType.toUpperCase()} files
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(previewDrawing)}
                    className="mt-3 text-[10px] h-7"
                  >
                    <FileText className="w-3 h-3 mr-1" /> Download File
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
