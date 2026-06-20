// ============================================================
// MASTER DECODIFICATION PANEL
// Browse all product families and view/print their
// Product-wise Master De-Codification Sheets
// ============================================================

import { useState, useMemo } from "react";
import { BookOpen, Printer, Download, FileText, Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DECODE_MASTER_MAP,
  DECODE_PRODUCT_LABELS,
  type DecodeProductFamily,
} from "../data/decodeDatasheetData";
import { generateDecodeForProduct } from "../data/decodeRenderer";

const FLOW_FAMILIES: DecodeProductFamily[] = [
  "emf", "turbine", "vortex", "oval_gear",
  "glass_tube_rotameter", "metal_tube_rotameter", "bypass_rotameter",
];
const LEVEL_FAMILIES: DecodeProductFamily[] = [
  "magnetic_level", "top_mounted_magnetic", "reflex_level",
  "transparent_level", "tubular_level", "float_board_level",
  "radar_level", "hydrostatic_level", "ultrasonic_level",
];
const PRESSURE_FAMILIES: DecodeProductFamily[] = [
  "smart_pressure", "dp_pressure_simple", "dp_pressure_high_precision", "miniature_pressure",
];

export default function MasterDecodificationPanel() {
  const [selectedFamily, setSelectedFamily] = useState<DecodeProductFamily | null>(null);
  const [soRef, setSoRef] = useState("");
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const allFamilies = useMemo(() => {
    const groups = [
      { label: "Flow Meters", families: FLOW_FAMILIES },
      { label: "Level Devices", families: LEVEL_FAMILIES },
      { label: "Pressure Transmitters", families: PRESSURE_FAMILIES },
    ];
    return groups;
  }, []);

  const filteredFamilies = useMemo(() => {
    if (!searchTerm.trim()) return allFamilies;
    const term = searchTerm.toLowerCase();
    return allFamilies.map(g => ({
      ...g,
      families: g.families.filter(f =>
        DECODE_PRODUCT_LABELS[f].toLowerCase().includes(term)
      ),
    })).filter(g => g.families.length > 0);
  }, [searchTerm, allFamilies]);

  const handleSelectFamily = (family: DecodeProductFamily) => {
    setSelectedFamily(family);
    const html = generateDecodeForProduct(family, soRef, projectName, clientName);
    setPreviewHtml(html);
  };

  const handleRefreshPreview = () => {
    if (!selectedFamily) return;
    const html = generateDecodeForProduct(selectedFamily, soRef, projectName, clientName);
    setPreviewHtml(html);
  };

  const handlePrint = () => {
    if (!previewHtml) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(previewHtml);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const handleDownload = () => {
    if (!previewHtml || !selectedFamily) return;
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Master_Decodification_${selectedFamily}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedEntry = selectedFamily ? DECODE_MASTER_MAP[selectedFamily] : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-red-600" />
            Product-wise Master De-Codification Sheets
          </h2>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {Object.keys(DECODE_MASTER_MAP).length} product families — Select a product to view its master de-codification sheet
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <Input
          placeholder="Search product family..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 text-xs h-8"
        />
      </div>

      {/* Product Family Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        {filteredFamilies.map((group) => (
          <div key={group.label}>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">
              {group.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.families.map((family) => {
                const isSelected = selectedFamily === family;
                const entry = DECODE_MASTER_MAP[family];
                return (
                  <button
                    key={family}
                    onClick={() => handleSelectFamily(family)}
                    className={`text-[10px] px-2.5 py-1.5 rounded border transition-all font-medium ${
                      isSelected
                        ? "bg-red-600 text-white border-red-600 shadow-sm"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50"
                    }`}
                    title={entry?.description?.slice(0, 120) + "..." || ""}
                  >
                    {DECODE_PRODUCT_LABELS[family]}
                    {entry && (
                      <span className="ml-1 opacity-70">({entry.modelPrefix})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {filteredFamilies.length === 0 && (
          <div className="text-[11px] text-gray-500 text-center py-4">No product families match your search.</div>
        )}
      </div>

      {/* SO / Project / Client Reference */}
      {selectedFamily && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-bold text-gray-600">Document Reference (optional — appears on sheet)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9px] font-semibold text-gray-600 block mb-0.5">SO/PO Ref</label>
              <Input value={soRef} onChange={(e) => setSoRef(e.target.value)} placeholder="e.g. S35885" className="text-[10px] h-7" />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-gray-600 block mb-0.5">Project</label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project name" className="text-[10px] h-7" />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-gray-600 block mb-0.5">Client</label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client name" className="text-[10px] h-7" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleRefreshPreview} className="text-[10px] h-7">
              <FileText className="w-3 h-3 mr-1" /> Refresh Preview
            </Button>
            <Button size="sm" variant="outline" onClick={handlePrint} className="text-[10px] h-7">
              <Printer className="w-3 h-3 mr-1" /> Print
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload} className="text-[10px] h-7">
              <Download className="w-3 h-3 mr-1" /> Download HTML
            </Button>
          </div>
        </div>
      )}

      {/* Selected Product Info */}
      {selectedEntry && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-blue-600 text-white text-[9px]">{DECODE_PRODUCT_LABELS[selectedFamily!]}</Badge>
            <span className="text-[9px] text-gray-600"><strong>Model Prefix:</strong> {selectedEntry.modelPrefix}</span>
            <span className="text-[9px] text-gray-600"><strong>Doc No:</strong> {selectedEntry.docNo}</span>
            <span className="text-[9px] text-gray-600"><strong>Categories:</strong> {selectedEntry.categories.length} positions</span>
          </div>
        </div>
      )}

      {/* Preview */}
      {previewHtml && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-200 flex items-center justify-between">
            <span className="text-[9px] font-bold text-gray-500 uppercase">
              Master De-Codification Preview
            </span>
            <span className="text-[8px] text-gray-400">
              {selectedEntry?.categories.length || 0} de-codification positions
            </span>
          </div>
          <iframe
            srcDoc={previewHtml}
            title="De-Codification Preview"
            className="w-full bg-white"
            style={{ height: "700px" }}
          />
        </div>
      )}

      {!selectedFamily && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <div className="text-[11px] text-gray-500 font-medium">
            Select a product family above to view its Master De-Codification Sheet
          </div>
          <div className="text-[9px] text-gray-400 mt-1">
            Each sheet shows the complete order code structure with all position options
          </div>
        </div>
      )}
    </div>
  );
}
