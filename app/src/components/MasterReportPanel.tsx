import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ClipboardCheck,
  Calculator,
  Download,
  ChevronDown,
  ChevronUp,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Printer,
  Ban,
} from "lucide-react";
import type { SODatasheet } from "../data/dataMapper";
import {
  generateReportConfig,
  isFlowMeterProduct,
  groupByQapFamily,
  detectMissingSizingParams,
  hasEnoughProcessData,
  type ItemReportConfig,
  type SizingParameters,
} from "../data/masterReportEngine";
import { hasQapMaster, getQapMaster } from "../data/qapMasterData";
import type { QapProductFamily } from "../data/qapMasterData";
import { FLOWTECH_LOGO_B64 } from "../data/flowtechLogoBase64";

interface Props {
  datasheet: SODatasheet | null;
  datasheetHtml: string;
}

export default function MasterReportPanel({ datasheet, datasheetHtml }: Props) {
  const [includeDatasheet, setIncludeDatasheet] = useState(true);
  const [includeQap, setIncludeQap] = useState(true);
  const [includeSizing, setIncludeSizing] = useState(true);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [configs, setConfigs] = useState<ItemReportConfig[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  // Initialize configs when datasheet changes
  useMemo(() => {
    if (datasheet) {
      setConfigs(generateReportConfig(datasheet));
    }
  }, [datasheet]);

  if (!datasheet || configs.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-8 text-center">
          <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Upload an SO or QTN to generate the Master Report.</p>
          <p className="text-xs text-gray-400 mt-1">The Master Report combines Datasheet + QAP + Sizing into one document.</p>
        </CardContent>
      </Card>
    );
  }

  function updateSizingParam(idx: number, field: keyof SizingParameters, value: unknown) {
    setConfigs((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        sizingParams: { ...next[idx].sizingParams, [field]: value },
      };
      return next;
    });
  }

  function generateReport() {
    const qapSection = buildQapSection();
    const sizingSection = buildSizingSection();
    const indexSection = buildIndexSection();

    const html = buildMasterHtml(datasheetHtml, indexSection, qapSection, sizingSection);
    setPreviewHtml(html);
    setShowPreview(true);
  }

  function downloadReport() {
    if (!previewHtml) generateReport();
    const htmlToPrint = previewHtml || buildMasterHtml("", "", "", "");
    const w = window.open("", "_blank");
    if (!w) { alert("Please allow popups."); return; }
    w.document.write(htmlToPrint);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 500);
  }

  // ─── Index / Table of Contents ──────────────────────────────
  function buildIndexSection(): string {
    const qapGroups = groupByQapFamily(configs);
    const sizingItems = configs.filter((c) => c.selection.sizing);

    let pageNo = 1;
    const rows: string[] = [];

    if (includeDatasheet) {
      rows.push(indexRow(pageNo++, "Cover Page", "SO / QTN Header & Project Details"));
      rows.push(indexRow(pageNo++, "Instrument Index", "Tag-wise summary of all line items"));
      configs.forEach((c) => {
        rows.push(indexRow(pageNo++, `Instrument — ${esc(c.item.tagNo)}`, esc(c.item.instrumentType)));
      });
      rows.push(indexRow(pageNo++, "Technical Standards", "Applicable standards & specifications"));
    }

    rows.push(`<tr style="background:#f0f4f8;">
      <td style="border:1px solid #94a3b8;padding:3px 6px;font-size:7.5pt;font-weight:bold;color:#1e3a5f;text-align:center;">—</td>
      <td style="border:1px solid #94a3b8;padding:3px 6px;font-size:7.5pt;font-weight:bold;color:#1e3a5f;">Master Report Index</td>
      <td style="border:1px solid #94a3b8;padding:3px 6px;font-size:7.5pt;color:#1e3a5f;">This page — consolidated navigation</td>
    </tr>`);

    if (includeQap && qapGroups.size > 0) {
      qapGroups.forEach((group) => {
        const tags = group.items.map((g) => esc(g.item.tagNo)).join(", ");
        rows.push(indexRow(pageNo++, `QAP — ${esc(group.label)}`, `${group.items.length} item(s): ${tags}`));
      });
    }

    if (includeSizing && sizingItems.length > 0) {
      sizingItems.forEach((c) => {
        rows.push(indexRow(pageNo++, `Sizing — ${esc(c.item.tagNo)}`, `${esc(c.item.instrumentType)} | ${esc(c.sizingParams.fluidName)}`));
      });
    }

    return `<div class="section-title" style="margin-top:0;">Master Report Index</div>
    <table style="width:100%;border-collapse:collapse;font-size:7.5pt;margin-bottom:8px;">
      <tr style="background:#1e3a5f;color:#fff;">
        <th style="padding:4px 6px;font-size:7pt;width:8%">Page</th>
        <th style="padding:4px 6px;font-size:7pt;width:35%">Section</th>
        <th style="padding:4px 6px;font-size:7pt;width:57%">Description</th>
      </tr>
      ${rows.join("\n")}
    </table>`;
  }

  // ─── QAP — grouped by product family (ONE per family) ───────
  function buildQapSection(): string {
    if (!includeQap) return "";
    const qapGroups = groupByQapFamily(configs);
    if (qapGroups.size === 0) return "";

    let html = `<div class="section-title">Section 2 — Quality Assurance Plan (QAP)</div>`;
    qapGroups.forEach((group, family) => {
      const tagList = group.items.map((g) => esc(g.item.tagNo)).join(", ");
      html += `<div style="border:1px solid #cbd5e1;padding:6px;margin-bottom:6px;">
        <div style="background:#f0f4f8;border:1px solid #cbd5e1;padding:4px 8px;font-size:8pt;font-weight:700;color:#1e3a5f;margin-bottom:4px;">
          ${esc(group.label)}
          <div style="font-size:6.5pt;color:#64748b;font-weight:400;margin-top:1px;">Applicable Items: ${tagList}</div>
        </div>
        ${getQapTableHtml(family)}
      </div>`;
    });
    return html;
  }

  // ─── Sizing — flowmeters & rotameters ONLY ──────────────────
  function buildSizingSection(): string {
    if (!includeSizing) return "";
    const items = configs.filter((c) => c.selection.sizing);
    if (items.length === 0) return "";

    let html = `<div class="section-title">Section 3 — Sizing Calculations</div>`;
    items.forEach((c) => {
      const sp = c.sizingParams;
      const missing = detectMissingSizingParams(c.item);
      const hasData = missing.length === 0;

      html += `<div style="border:1px solid ${hasData ? '#cbd5e1' : '#fca5a5'};padding:6px;margin-bottom:6px;">
        <div style="display:flex;gap:12px;font-size:7.5pt;font-weight:700;color:#1e3a5f;padding-bottom:3px;border-bottom:1px solid #e2e8f0;margin-bottom:4px;">
          <span>${esc(c.item.tagNo)}</span><span>${esc(c.item.instrumentType)}</span><span>${esc(c.item.size)}</span>
          ${!hasData ? `<span style="color:#dc2626;font-size:6.5pt;background:#fee2e2;padding:1px 6px;border-radius:2px;margin-left:auto;">MISSING DATA</span>` : ""}
        </div>`;

      if (hasData) {
        html += `<div style="font-size:7pt;color:#475569;margin-bottom:4px;">
          <strong>Extracted Inputs:</strong> ${esc(sp.fluidName)} SG ${sp.fluidSG.toFixed(3)} |
          ${sp.flowRateMin}-${sp.flowRateMax} ${sp.flowUnit} |
          ${sp.operatingTemp}°C | ${sp.operatingPressure.toFixed(2)} bara | ${esc(sp.lineSize)}
        </div>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:4px 8px;font-size:7pt;color:#166534;">
          Sizing calculation results will appear here after running the sizing module for this item.
          Go to Flow Sizing tab, enter these parameters, and run sizing, then paste the sizing result here.
        </div>`;
      } else {
        html += `<div style="background:#fef2f2;border:1px solid #fecaca;padding:6px 8px;font-size:7pt;color:#991b1b;margin-bottom:4px;">
          <strong>Cannot generate sizing report — the following process data is missing from the uploaded document:</strong>
          <ul style="margin:3px 0;padding-left:16px;">
            ${missing.map((m) => `<li>${esc(m.label)} ${m.unit ? `(${esc(m.unit)})` : ""}</li>`).join("")}
          </ul>
          <span style="font-size:6.5pt;color:#64748b;">Please provide a document that includes these parameters (e.g., process data sheet, P&ID, or instrument specification).</span>
        </div>`;
      }
      html += `</div>`;
    });
    return html;
  }

  function buildMasterHtml(dsHtml: string, indexHtml: string, qapHtml: string, sizingHtml: string): string {
    const h = datasheet?.header;
    const css = `
      @page { size: A4 landscape; margin: 0; }
      body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8pt; margin: 0; padding: 0; background: #f0f0f0; }
      .mpg { width: 297mm; min-height: 210mm; padding: 6mm 10mm 8mm 10mm; page-break-after: always; position: relative; background: #fff; margin: 0 auto; }
      .mpg:last-child { page-break-after: auto; }
      .mhdr { display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #1e3a5f; padding-bottom: 4px; margin-bottom: 8px; }
      .mhdr img { height: 28px; width: auto; }
      .mhdr-txt { flex: 1; }
      .mhdr-comp { font-size: 10pt; font-weight: 800; color: #1e3a5f; }
      .mhdr-sub { font-size: 6.5pt; color: #64748b; }
      .mhdr-right { text-align: right; }
      .mhdr-title { font-size: 11pt; font-weight: 800; color: #1e3a5f; }
      .mhdr-meta { font-size: 6pt; color: #94a3b8; }
      .section-title { background: #1e3a5f; color: #fff; padding: 3px 8px; font-size: 8pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin: 8px 0 4px; }
      .ft { position: absolute; bottom: 2mm; left: 10mm; right: 10mm; display: flex; align-items: center; gap: 3px; height: 6mm; border-top: 0.5px solid #cbd5e1; padding-top: 1px; }
      .ft img { height: 4.5mm; width: auto; flex-shrink: 0; display: block; }
      .ft-txt { flex: 1; min-width: 0; line-height: 1; }
      .ft-name { font-size: 5.5pt; font-weight: 700; color: #1e3a5f; letter-spacing: 0.2px; line-height: 1; display: block; }
      .ft-sub { font-size: 4.5pt; color: #94a3b8; line-height: 1; display: block; }
      @media print { body { background: #fff; } .mpg { margin: 0; } }
    `;

    const dsWithLogo = dsHtml.replace(/FLOWTECH_LOGO_B64/g, FLOWTECH_LOGO_B64);

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Master Report — ${h ? esc(h.soNo) : ""}</title><style>${css}</style></head>
<body>
  ${includeDatasheet ? dsWithLogo : ""}
  ${(includeQap || includeSizing) ? `
  <div class="mpg">
    <div class="mhdr">
      <img src="data:image/png;base64,${FLOWTECH_LOGO_B64}" alt="Flowtech">
      <div class="mhdr-txt">
        <div class="mhdr-comp">FLOWTECH</div>
        <div class="mhdr-sub">MEASURING INSTRUMENTS PVT. LTD.</div>
      </div>
      <div class="mhdr-right">
        <div class="mhdr-title">Master Technical Report</div>
        <div class="mhdr-meta">${configs.length} Items | ${includeDatasheet ? "Datasheet" : ""}${includeQap ? " + QAP" : ""}${includeSizing ? " + Sizing" : ""}${h ? " | " + esc(h.soNo) : ""}</div>
      </div>
    </div>
    ${indexHtml}
    ${qapHtml}
    ${sizingHtml}
    <div class="ft">
      <img src="data:image/png;base64,${FLOWTECH_LOGO_B64}" alt="Flowtech">
      <div class="ft-txt">
        <div class="ft-name">Flowtech Measuring Instruments Pvt. Ltd.</div>
      </div>
    </div>
  </div>` : ""}
</body>
</html>`;
  }

  return (
    <div className="space-y-4">
      {/* Master Report Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-white" />
          <div>
            <h2 className="text-lg font-bold">Master Technical Report</h2>
            <p className="text-[11px] text-blue-100">
              Combine SO Datasheet + QAP + Sizing into one unified document
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Report Selection */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-blue-600" />
            Report Sections — Select what to include
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <label className="flex items-center gap-2 p-3 rounded-lg border border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors">
              <Checkbox checked={includeDatasheet} onCheckedChange={(v) => setIncludeDatasheet(!!v)} />
              <div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-800">
                  <FileText className="w-3.5 h-3.5" /> SO Datasheet
                </div>
                <div className="text-[10px] text-blue-600">{configs.length} line items</div>
              </div>
            </label>
            <label className="flex items-center gap-2 p-3 rounded-lg border border-green-200 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors">
              <Checkbox checked={includeQap} onCheckedChange={(v) => setIncludeQap(!!v)} />
              <div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-green-800">
                  <ClipboardCheck className="w-3.5 h-3.5" /> QAP
                </div>
                <div className="text-[10px] text-green-600">{new Set(configs.filter((c) => c.qapFamily).map((c) => c.qapFamily)).size} product families</div>
              </div>
            </label>
            <label className="flex items-center gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 cursor-pointer hover:bg-amber-100 transition-colors">
              <Checkbox checked={includeSizing} onCheckedChange={(v) => setIncludeSizing(!!v)} />
              <div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-800">
                  <Calculator className="w-3.5 h-3.5" /> Sizing
                </div>
                <div className="text-[10px] text-amber-600">{configs.filter((c) => c.selection.sizing).length} flowmeter items</div>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Item-by-Item Configuration */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-600" />
            Line Item Configuration — {configs.length} items from {datasheet?.header.soNo}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {configs.map((c, idx) => {
            const isFlow = isFlowMeterProduct(c.item.instrumentType);
            return (
              <div key={idx} className="border rounded-lg overflow-hidden">
                {/* Item Header Row */}
                <div
                  className="flex items-center gap-3 p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setExpandedItem(expandedItem === idx ? null : idx)}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                    {c.item.srNo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-800">{c.item.tagNo}</span>
                      <span className="text-xs text-gray-600">{c.item.instrumentType}</span>
                      <Badge className="text-[9px] px-1.5 py-0 bg-gray-100 text-gray-600">{c.item.size}</Badge>
                    </div>
                  </div>
                  {/* Report checkboxes */}
                  <div className="flex items-center gap-4 text-[10px] shrink-0">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-blue-500" /> DS</span>
                    {c.qapFamily ? (
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> QAP</span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-300">—</span>
                    )}
                    {isFlow ? (
                      hasEnoughProcessData(c.item) ? (
                        <span className="flex items-center gap-1 text-green-600" title="Process data extracted from document"><Settings2 className="w-3 h-3" /> Size</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500" title="Missing process data for sizing"><AlertCircle className="w-3 h-3" /> Missing</span>
                      )
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400" title="Sizing not applicable for level devices"><Ban className="w-3 h-3" /> N/A</span>
                    )}
                  </div>
                  {expandedItem === idx ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>

                {/* Expanded: Sizing Parameters — FLOWMETERS ONLY */}
                {expandedItem === idx && isFlow && includeSizing && (
                  <div className="p-4 bg-white border-t space-y-3">
                    {/* Missing process data warning */}
                    {(() => {
                      const missing = detectMissingSizingParams(c.item);
                      if (missing.length === 0) return null;
                      return (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-[10px] font-bold text-red-700">Missing Process Data — Cannot Generate Sizing Report</p>
                              <p className="text-[9px] text-red-600 mt-1">The following parameters were not found in the uploaded document:</p>
                              <ul className="text-[9px] text-red-600 mt-1 list-disc list-inside">
                                {missing.map((m, mi) => (
                                  <li key={mi}>{m.label} {m.unit && `(${m.unit})`}</li>
                                ))}
                              </ul>
                              <p className="text-[8px] text-red-400 mt-1">Please provide a process data sheet, P&ID, or instrument spec with these details.</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    {/* Extracted data summary */}
                    {(() => {
                      const missing = detectMissingSizingParams(c.item);
                      if (missing.length > 0) return null;
                      const pd = c.item.processData;
                      return (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-[10px] font-bold text-green-700">Process Data Extracted from Document</p>
                              <p className="text-[9px] text-green-600 mt-1">
                                {pd.fluidName} @ {pd.operatingTemp}°C, {pd.operatingPressure?.toFixed(2)} bara | 
                                Flow: {pd.flowRateMin || pd.flowRateNormal}-{pd.flowRateMax} {pd.flowUnit} | 
                                SG: {pd.fluidSG}, Line: {pd.lineSize}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    <p className="text-[10px] text-gray-500 font-medium">Sizing Parameters — Configure and run sizing for this item</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-[9px] text-gray-500">Service</Label>
                        <Select value={c.sizingParams.service} onValueChange={(v) => updateSizingParam(idx, "service", v)}>
                          <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="liquid">Liquid</SelectItem>
                            <SelectItem value="gas">Gas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[9px] text-gray-500">Flow Min ({c.sizingParams.flowUnit})</Label>
                        <Input type="number" value={c.sizingParams.flowRateMin} onChange={(e) => updateSizingParam(idx, "flowRateMin", parseFloat(e.target.value) || 0)} className="text-xs h-8 font-mono" />
                      </div>
                      <div>
                        <Label className="text-[9px] text-gray-500">Flow Max ({c.sizingParams.flowUnit})</Label>
                        <Input type="number" value={c.sizingParams.flowRateMax} onChange={(e) => updateSizingParam(idx, "flowRateMax", parseFloat(e.target.value) || 0)} className="text-xs h-8 font-mono" />
                      </div>
                      <div>
                        <Label className="text-[9px] text-gray-500">Flow Unit</Label>
                        <Select value={c.sizingParams.flowUnit} onValueChange={(v) => updateSizingParam(idx, "flowUnit", v)}>
                          <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LPH">LPH</SelectItem>
                            <SelectItem value="m³/h">m³/h</SelectItem>
                            <SelectItem value="GPM">GPM</SelectItem>
                            <SelectItem value="SCFH">SCFH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[9px] text-gray-500">Fluid Name</Label>
                        <Input value={c.sizingParams.fluidName} onChange={(e) => updateSizingParam(idx, "fluidName", e.target.value)} className="text-xs h-8" />
                      </div>
                      <div>
                        <Label className="text-[9px] text-gray-500">Fluid Density (kg/m³)</Label>
                        <Input type="number" value={c.sizingParams.fluidDensity} onChange={(e) => updateSizingParam(idx, "fluidDensity", parseFloat(e.target.value) || 0)} className="text-xs h-8 font-mono" />
                      </div>
                      <div>
                        <Label className="text-[9px] text-gray-500">Fluid Viscosity (cP)</Label>
                        <Input type="number" step={0.001} value={c.sizingParams.fluidViscosity} onChange={(e) => updateSizingParam(idx, "fluidViscosity", parseFloat(e.target.value) || 0)} className="text-xs h-8 font-mono" />
                      </div>
                      <div>
                        <Label className="text-[9px] text-gray-500">Fluid SG</Label>
                        <Input type="number" step={0.001} value={c.sizingParams.fluidSG} onChange={(e) => updateSizingParam(idx, "fluidSG", parseFloat(e.target.value) || 0)} className="text-xs h-8 font-mono" />
                      </div>
                      <div>
                        <Label className="text-[9px] text-gray-500">Temperature (°C)</Label>
                        <Input type="number" value={c.sizingParams.operatingTemp} onChange={(e) => updateSizingParam(idx, "operatingTemp", parseFloat(e.target.value) || 0)} className="text-xs h-8 font-mono" />
                      </div>
                      <div>
                        <Label className="text-[9px] text-gray-500">Pressure (bara)</Label>
                        <Input type="number" step={0.01} value={c.sizingParams.operatingPressure} onChange={(e) => updateSizingParam(idx, "operatingPressure", parseFloat(e.target.value) || 0)} className="text-xs h-8 font-mono" />
                      </div>
                      <div>
                        <Label className="text-[9px] text-gray-500">Line Size</Label>
                        <Input value={c.sizingParams.lineSize} onChange={(e) => updateSizingParam(idx, "lineSize", e.target.value)} className="text-xs h-8 font-mono" />
                      </div>
                      <div>
                        <Label className="text-[9px] text-gray-500">Meter Type</Label>
                        <Select value={c.sizingParams.meterCategory} onValueChange={(v) => updateSizingParam(idx, "meterCategory", v)}>
                          <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inline">Inline</SelectItem>
                            <SelectItem value="variable_area">Variable Area</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-[9px] text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      To get sizing results: Go to <strong>Flow Sizing</strong> tab, enter these parameters, run sizing, then paste the result here.
                    </p>
                  </div>
                )}

                {/* Expanded: Non-flow message */}
                {expandedItem === idx && !isFlow && (
                  <div className="p-4 bg-gray-50 border-t">
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Ban className="w-3 h-3 text-gray-400" />
                      Sizing calculations are not applicable for <strong>{c.item.instrumentType}</strong>. Sizing is only available for flowmeters and rotameters.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={generateReport} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-1">
          <Printer className="w-4 h-4" />
          Preview Master Report
        </Button>
        <Button onClick={downloadReport} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Preview */}
      {showPreview && previewHtml && (
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              srcDoc={previewHtml}
              style={{ width: "100%", height: "600px", border: "1px solid #e5e7eb", borderRadius: "4px" }}
              title="Master Report Preview"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function indexRow(page: number, section: string, desc: string): string {
  return `<tr>
    <td style="border:1px solid #94a3b8;padding:3px 6px;font-size:7.5pt;text-align:center;font-weight:bold;color:#1e3a5f;">${page}</td>
    <td style="border:1px solid #94a3b8;padding:3px 6px;font-size:7.5pt;font-weight:600;color:#334155;">${section}</td>
    <td style="border:1px solid #94a3b8;padding:3px 6px;font-size:7pt;color:#475569;">${desc}</td>
  </tr>`;
}

function getQapTableHtml(family: QapProductFamily): string {
  const qap = hasQapMaster(family) ? getQapMaster(family) : null;
  if (!qap) return "<p style='font-size:7pt;color:#94a3b8;'>No QAP data.</p>";

  const rows = qap.rows.map((r, i) => {
    const bg = i % 2 === 0 ? "background:#f8fafc;" : "";
    return `<tr style="${bg}">
      <td style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;text-align:center;">${r.srNo}</td>
      <td style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">${esc(r.component)}</td>
      <td style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">${esc(r.characteristics)}</td>
      <td style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;text-align:center;">${esc(r.category)}</td>
      <td style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">${esc(r.method)}</td>
      <td style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">${esc(r.extent)}</td>
      <td style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">${esc(r.reference)}</td>
      <td style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">${esc(r.acceptance)}</td>
      <td style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;">${esc(r.recordFormat)}</td>
      <td style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;text-align:center;">${esc(r.flowtech)}</td>
      <td style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;text-align:center;">${esc(r.agency)}</td>
      <td style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;text-align:center;">${esc(r.client)}</td>
      <td style="border:1px solid #94a3b8;padding:2px 4px;font-size:6pt;color:#64748b;">${esc(r.remarks)}</td>
    </tr>`;
  }).join("\n");

  return `<table style="width:100%;border-collapse:collapse;font-size:6.5pt;">
    <tr style="background:#1e3a5f;color:#fff;">
      <th style="padding:2px 3px;font-size:6pt;width:3%">Sr.</th>
      <th style="padding:2px 3px;font-size:6pt;width:12%">Component</th>
      <th style="padding:2px 3px;font-size:6pt;width:11%">Characteristics</th>
      <th style="padding:2px 3px;font-size:6pt;width:4%">Cat.</th>
      <th style="padding:2px 3px;font-size:6pt;width:9%">Method</th>
      <th style="padding:2px 3px;font-size:6pt;width:9%">Extent</th>
      <th style="padding:2px 3px;font-size:6pt;width:9%">Reference</th>
      <th style="padding:2px 3px;font-size:6pt;width:9%">Acceptance</th>
      <th style="padding:2px 3px;font-size:6pt;width:9%">Record</th>
      <th style="padding:2px 3px;font-size:6pt;width:4%">Flow</th>
      <th style="padding:2px 3px;font-size:6pt;width:4%">Agy</th>
      <th style="padding:2px 3px;font-size:6pt;width:4%">Client</th>
      <th style="padding:2px 3px;font-size:6pt;width:7%">Remarks</th>
    </tr>
    ${rows}
  </table>`;
}
