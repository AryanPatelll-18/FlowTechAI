// ============================================================
// Document Panel — QAP Generator + SO Datasheet Generator
// ============================================================

import { useState, useCallback, useMemo } from "react";
import { FileCheck, BookOpen, Download, FolderOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DatasheetGeneratorPanel from "./DatasheetGeneratorPanel";
import DocumentMasterPanel from "./DocumentMasterPanel";
import MasterReportPanel from "./MasterReportPanel";
import type { SODatasheet } from "../datasheet/dataMapper";
import { useDocumentMaster } from "../hooks/useDocumentMaster";
import { PRODUCT_FAMILY_LABELS } from "../data/masterDocumentLibrary";
import type { ProductFamily } from "../data/masterDocumentLibrary";
import { detectProductFamily } from "../datasheet/productMatchers";

// ─── Sub-tab type ────────────────────────────────────────────
type DocSubTab = "datasheet" | "qap" | "master" | "masterreport";

// ─── QAP Generator Panel ─────────────────────────────────────
import { QAP_MASTER_MAP, type QapProductFamily } from "../data/qapMasterData";

function QapGeneratorPanel() {
  const [selectedFamily, setSelectedFamily] = useState<QapProductFamily | "">("");
  const [qapHtml, setQapHtml] = useState<string | null>(null);

  // Map product families to QAP entries
  const qapFamilies = Object.keys(QAP_MASTER_MAP) as QapProductFamily[];
  const flowFamilies = qapFamilies.filter(f =>
    ["emf", "vortex", "turbine", "oval_gear", "rotameter", "ultrasonic", "bypass_rotameter", "acrylic_body_rotameter", "metal_tube_rotameter"].includes(f)
  );
  const levelFamilies = qapFamilies.filter(f =>
    ["magnetic_level", "reflex_level", "transparent_level", "tubular_level", "float_board_level", "radar_level", "hydrostatic_level"].includes(f)
  );
  const pressureFamilies = qapFamilies.filter(f =>
    ["smart_pressure", "dp_pressure", "miniature_pressure"].includes(f)
  );
  const sightGlassFamilies = qapFamilies.filter(f =>
    ["double_window_sight_glass", "allen_bolt_sight_glass"].includes(f)
  );
  const levelSwitchFamilies = qapFamilies.filter(f =>
    ["displacer_level_switch", "side_mounted_level_switch", "top_mounted_level_switch"].includes(f)
  );
  const otherQapFamilies = qapFamilies.filter(f =>
    ["orifice_flange_assembly"].includes(f)
  );

  const handleGenerate = () => {
    if (!selectedFamily) return;
    const qapEntry = QAP_MASTER_MAP[selectedFamily];
    if (!qapEntry) return;
    const html = generateQapHtml(qapEntry);
    setQapHtml(html);
  };

  const openPrint = () => {
    if (!qapHtml) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(qapHtml);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const downloadQap = () => {
    if (!qapHtml) return;
    const blob = new Blob([qapHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QAP_${selectedFamily}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderFamilyButtons = (families: QapProductFamily[]) => (
    <div className="flex flex-wrap gap-2">
      {families.map((fam) => (
        <button
          key={fam}
          onClick={() => setSelectedFamily(fam)}
          className={`text-xs px-4 py-2 rounded-lg border transition-all font-medium ${
            selectedFamily === fam
              ? "bg-red-600 text-white border-red-600 shadow-sm"
              : "bg-gray-50 border-gray-300 text-gray-700 hover:border-red-400 hover:bg-red-50"
          }`}
        >
          {PRODUCT_FAMILY_LABELS[fam as ProductFamily]}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Product Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-red-600" /> Select Product Family
        </div>
        <div className="space-y-5">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Flow Meters</div>
            {renderFamilyButtons(flowFamilies)}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Level Devices</div>
            {renderFamilyButtons(levelFamilies)}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Pressure Transmitters</div>
            {renderFamilyButtons(pressureFamilies)}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Sight Glasses</div>
            {renderFamilyButtons(sightGlassFamilies)}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Level Switches</div>
            {renderFamilyButtons(levelSwitchFamilies)}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Others</div>
            {renderFamilyButtons(otherQapFamilies)}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button
            size="default"
            onClick={handleGenerate}
            disabled={!selectedFamily}
            className="bg-red-600 hover:bg-red-700 text-white text-sm h-10 px-5"
          >
            <FileCheck className="w-4 h-4 mr-2" />Generate QAP
          </Button>
          {qapHtml && (
            <>
              <Button variant="outline" size="default" onClick={openPrint} className="text-sm h-10 px-4">
                <BookOpen className="w-4 h-4 mr-2" />Print
              </Button>
              <Button variant="outline" size="default" onClick={downloadQap} className="text-sm h-10 px-4">
                <Download className="w-4 h-4 mr-2" />Download
              </Button>
            </>
          )}
        </div>
        {selectedFamily && (
          <div className="mt-3 text-sm text-gray-600">
            Selected: <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5">{PRODUCT_FAMILY_LABELS[selectedFamily as ProductFamily]}</Badge>
          </div>
        )}
      </div>

      {/* QAP Preview */}
      {qapHtml && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-red-600" /> QAP Preview
          </div>
          <iframe
            srcDoc={qapHtml}
            className="w-full h-[700px] border border-gray-200 rounded-lg"
            title="QAP Preview"
          />
        </div>
      )}
    </div>
  );
}

// ─── Generate QAP HTML — Standard Flowtech QAP Table Format ──
import type { QapMasterEntry } from "../data/qapMasterData";

function generateQapHtml(qap: QapMasterEntry): string {
  const esc = (s: string) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const rows = qap.rows.map((r) =>
    `<tr>
      <td style="border:1px solid #999;padding:3px 4px;font-size:7pt;text-align:center">${esc(r.srNo)}</td>
      <td style="border:1px solid #999;padding:3px 4px;font-size:7pt">${esc(r.component)}</td>
      <td style="border:1px solid #999;padding:3px 4px;font-size:7pt">${esc(r.characteristics)}</td>
      <td style="border:1px solid #999;padding:3px 4px;font-size:7pt;text-align:center">${esc(r.category)}</td>
      <td style="border:1px solid #999;padding:3px 4px;font-size:7pt">${esc(r.method)}</td>
      <td style="border:1px solid #999;padding:3px 4px;font-size:7pt">${esc(r.extent)}</td>
      <td style="border:1px solid #999;padding:3px 4px;font-size:7pt">${esc(r.reference)}</td>
      <td style="border:1px solid #999;padding:3px 4px;font-size:7pt">${esc(r.acceptance)}</td>
      <td style="border:1px solid #999;padding:3px 4px;font-size:7pt">${esc(r.recordFormat)}</td>
      <td style="border:1px solid #999;padding:3px 4px;font-size:7pt;text-align:center">${esc(r.flowtech)}</td>
      <td style="border:1px solid #999;padding:3px 4px;font-size:7pt;text-align:center">${esc(r.agency)}</td>
      <td style="border:1px solid #999;padding:3px 4px;font-size:7pt;text-align:center">${esc(r.client)}</td>
      <td style="border:1px solid #999;padding:3px 4px;font-size:6.5pt;color:#555">${esc(r.remarks)}</td>
    </tr>`
  ).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(qap.title)}</title><style>
body{font-family:Arial,sans-serif;font-size:8pt;margin:0;padding:8mm}
h1{font-size:13pt;text-align:center;margin-bottom:2px;color:#1e3a5f}
h2{font-size:10pt;text-align:center;margin-bottom:6px;color:#333;font-weight:bold}
.meta{display:flex;justify-content:space-between;font-size:7.5pt;margin-bottom:10px;border-bottom:2px solid #1e3a5f;padding-bottom:6px}
table{width:100%;border-collapse:collapse;font-size:7pt}
th{background:#1e3a5f;color:#fff;padding:4px 3px;font-size:6.5pt;text-align:center;font-weight:bold;border:1px solid #1e3a5f}
.remarks{font-size:7pt;margin-top:8px;padding:4px;background:#f5f5f5;border:1px solid #ddd}
.footer{display:flex;justify-content:space-between;font-size:7pt;margin-top:12px;border-top:1px solid #333;padding-top:6px}
@media print{body{padding:0}}
</style></head><body>
<h1>FLOWTECH MEASURING INSTRUMENTS PVT. LTD.</h1>
<h2>${esc(qap.title)}</h2>
<div class="meta">
  <span><strong>Doc No:</strong> ${esc(qap.docNo)}</span>
  <span><strong>Rev:</strong> ${esc(qap.revNo)}</span>
  <span><strong>Date:</strong> ${esc(qap.date)}</span>
  <span><strong>Approved By:</strong> ${esc(qap.approvedBy)}</span>
</div>
<table>
<tr>
  <th style="width:4%">Sr.<br>No.</th>
  <th style="width:14%">Component</th>
  <th style="width:12%">Characteristics</th>
  <th style="width:5%">Cat.</th>
  <th style="width:10%">Method</th>
  <th style="width:10%">Extent</th>
  <th style="width:10%">Reference</th>
  <th style="width:10%">Acceptance</th>
  <th style="width:10%">Record Format</th>
  <th style="width:5%">Flowtech</th>
  <th style="width:5%">Agency</th>
  <th style="width:5%">Client</th>
  <th style="width:8%">Remarks</th>
</tr>
${rows}
</table>
${qap.remarks ? `<div class="remarks"><strong>Remarks:</strong> ${esc(qap.remarks)}</div>` : ""}
<div class="footer">
  <span><strong>P</strong> = Perform &nbsp; <strong>W</strong> = Witness &nbsp; <strong>R</strong> = Review</span>
  <span>MA = Major &nbsp; MI = Minor &nbsp; CR = Critical</span>
</div>
</body></html>`;
}

// ══════════════════════════════════════════════════════════════
// MAIN DOCUMENT PANEL
// ══════════════════════════════════════════════════════════════
export default function DocumentPanel() {
  const [subTab, setSubTab] = useState<DocSubTab>("datasheet");
  const [sharedDs, setSharedDs] = useState<SODatasheet | null>(null);
  const [sharedHtml, setSharedHtml] = useState<string>("");
  const docMaster = useDocumentMaster();

  const handleDatasheetChange = useCallback((ds: SODatasheet | null, html: string | null) => {
    setSharedDs(ds);
    setSharedHtml(html || "");
  }, []);

  // Extract unique product families from the current SO for Document Master filtering
  const relevantFamilies = useMemo(() => {
    if (!sharedDs || !sharedDs.lineItems) return undefined;
    const families = new Set<string>();
    sharedDs.lineItems.forEach((item) => {
      const fam = detectProductFamily(item.instrumentType + " " + item.size);
      if (fam) families.add(fam);
    });
    return families.size > 0 ? Array.from(families) : undefined;
  }, [sharedDs]);

  return (
    <div className="space-y-4">
      {/* Sub-tab navigation */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setSubTab("datasheet")}
          className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 rounded-t-lg transition-all ${
            subTab === "datasheet"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> SO Datasheet Generator
        </button>
        <button
          onClick={() => setSubTab("qap")}
          className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 rounded-t-lg transition-all ${
            subTab === "qap"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" /> QAP Generator
        </button>
        <button
          onClick={() => setSubTab("master")}
          className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 rounded-t-lg transition-all ${
            subTab === "master"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" /> Document Master
          {docMaster.drawings.length > 0 && (
            <span className={`ml-0.5 text-[9px] font-bold px-1.5 py-0 rounded-full ${
              subTab === "master" ? "bg-white text-red-600" : "bg-gray-300 text-gray-700"
            }`}>
              {docMaster.drawings.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setSubTab("masterreport")}
          className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 rounded-t-lg transition-all ${
            subTab === "masterreport"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Master Report
          {sharedDs && (
            <span className={`ml-0.5 text-[9px] font-bold px-1.5 py-0 rounded-full ${
              subTab === "masterreport" ? "bg-white text-red-600" : "bg-gray-300 text-gray-700"
            }`}>
              {sharedDs.lineItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {subTab === "datasheet" ? (
        <DatasheetGeneratorPanel onDatasheetChange={handleDatasheetChange} />
      ) : subTab === "qap" ? (
        <QapGeneratorPanel />
      ) : subTab === "master" ? (
        <DocumentMasterPanel master={docMaster} relevantFamilies={relevantFamilies} soNo={sharedDs?.header.soNo} />
      ) : (
        <MasterReportPanel datasheet={sharedDs} datasheetHtml={sharedHtml} />
      )}
    </div>
  );
}
