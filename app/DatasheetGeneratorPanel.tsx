// ============================================================
// Datasheet Generator Panel -- Section-based editing
// Renders actual sections from uploaded quotation
// For client technical review -- NO commercial content
// ============================================================

import { useState, useRef, useCallback, useEffect } from "react";
import { FileText, Upload, Printer, Download, Sparkles, Eraser, Eye, Table, Crosshair, AlertCircle, CheckCircle, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateFromSOText, generateFromDatasheet, openPrintWindow, downloadHtml, type SODatasheet } from "../datasheet/api";
import { readFileAsText } from "../datasheet/pdfExtractor";
import { getDrawingsForFamily, getDrawingUrlById } from "../datasheet/gaDrawingLookup";
import type { GaDrawingEntry } from "../data/gaDrawingTypes";

type ViewMode = "input" | "edit" | "preview";

interface ParseLog {
  fileName: string;
  fileType: string;
  charsExtracted: number;
  linesFound: number;
  instrumentsDetected: number;
  productTypes: string[];
  errors: string[];
}

interface Props {
  onDatasheetChange?: (ds: SODatasheet | null, html: string | null) => void;
}

export default function DatasheetGeneratorPanel({ onDatasheetChange }: Props = {}) {
  const [soText, setSoText] = useState("");
  const [ds, setDs] = useState<SODatasheet | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("input");
  const [dragOver, setDragOver] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseLog, setParseLog] = useState<ParseLog | null>(null);
  const [availableDrawings, setAvailableDrawings] = useState<Array<{ drawing: GaDrawingEntry; dataUrl: string }>>([]);
  const [drawingSelectorOpen, setDrawingSelectorOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Notify parent when datasheet or html changes
  useEffect(() => {
    onDatasheetChange?.(ds, html);
  }, [ds, html, onDatasheetChange]);

  const handleParse = useCallback(async () => {
    if (!soText.trim()) return;
    setParseLog(null); setEditingIdx(null);
    try {
      const r = await generateFromSOText(soText);
      setDs(r.datasheet); setHtml(r.html);
      const pts = [...new Set(r.datasheet.lineItems.map(i => i.instrumentType))];
      setParseLog({ fileName: "Pasted Text", fileType: "text", charsExtracted: soText.length, linesFound: soText.split(/\n/).length, instrumentsDetected: r.datasheet.lineItems.length, productTypes: pts, errors: r.datasheet.lineItems.length === 0 ? ["No instruments detected. Try pasting more detailed SO content with tag numbers."] : [] });
      setView("edit");
    } catch (e) {
      console.error("Parse error:", e);
      setParseLog({ fileName: "Pasted Text", fileType: "text", charsExtracted: soText.length, linesFound: soText.split(/\n/).length, instrumentsDetected: 0, productTypes: [], errors: ["Failed to parse. Please check the input format."] });
    }
  }, [soText]);



  const handleClear = useCallback(() => {
    setSoText(""); setDs(null); setHtml(null); setView("input"); setEditingIdx(null); setParseLog(null);
    setAvailableDrawings([]); setDrawingSelectorOpen(false);
  }, []);

  // Load all available GA Drawings for the current editing item's product family
  const loadAvailableDrawings = useCallback(async (lineItemIdx: number) => {
    if (!ds?.lineItems[lineItemIdx]) return;
    const item = ds.lineItems[lineItemIdx];
    const drawings = await getDrawingsForFamily(item.instrumentType);
    setAvailableDrawings(drawings);
    setDrawingSelectorOpen(true);
  }, [ds]);

  // Select a specific GA Drawing for a line item
  const selectDrawingForItem = useCallback(async (lineItemIdx: number, drawingId: string) => {
    if (!ds) return;
    const dataUrl = await getDrawingUrlById(drawingId);
    if (!dataUrl) return;
    const updated = { ...ds, lineItems: [...ds.lineItems] };
    updated.lineItems[lineItemIdx] = { ...updated.lineItems[lineItemIdx], gaDrawingUrl: dataUrl };
    setDs(updated);
    setHtml(generateFromDatasheet(updated));
    setDrawingSelectorOpen(false);
  }, [ds]);

  const handleFile = useCallback(async (files: FileList | null) => {
    if (!files?.[0]) return;
    const file = files[0];
    setParsing(true); setParseLog(null); setEditingIdx(null);
    try {
      setDs(null); setHtml(null);
      const text = await readFileAsText(file);
      setSoText(text);
      const r = await generateFromSOText(text);
      setDs(r.datasheet); setHtml(r.html);
      const pts = [...new Set(r.datasheet.lineItems.map(i => i.instrumentType))];
      const errors: string[] = [];
      if (r.datasheet.lineItems.length === 0) errors.push("No instruments detected. Ensure the document contains tag numbers (e.g., EMF-1101, FI-2404A).");
      if (text.length < 50) errors.push("Extracted text is very short. The PDF may be image-based (scanned). Try copy-pasting text instead.");
      setParseLog({ fileName: file.name, fileType: file.type || "unknown", charsExtracted: text.length, linesFound: text.split(/\n/).length, instrumentsDetected: r.datasheet.lineItems.length, productTypes: pts, errors });
      setView("edit");
    } catch (err) {
      setParseLog({ fileName: file.name, fileType: "unknown", charsExtracted: 0, linesFound: 0, instrumentsDetected: 0, productTypes: [], errors: [`Failed: ${err instanceof Error ? err.message : String(err)}`] });
    } finally {
      setParsing(false); setDragOver(false);
    }
  }, []);

  const updateHeader = useCallback((field: keyof SODatasheet["header"], value: string) => {
    setDs(prev => { if (!prev) return prev; const next = { ...prev, header: { ...prev.header, [field]: value } }; setHtml(generateFromDatasheet(next)); return next; });
  }, []);

  const updateSectionValue = useCallback((itemIdx: number, secIdx: number, rowIdx: number, newValue: string) => {
    setDs(prev => {
      if (!prev) return prev;
      const items = prev.lineItems.map((item, ii) => {
        if (ii !== itemIdx) return item;
        const sections = item.sections.map((sec, si) => {
          if (si !== secIdx) return sec;
          const rows = sec.rows.map((row, ri) => ri === rowIdx ? [row[0], newValue] as [string, string] : row);
          return { ...sec, rows };
        });
        return { ...item, sections };
      });
      const next = { ...prev, lineItems: items };
      setHtml(generateFromDatasheet(next));
      return next;
    });
  }, []);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2"><FileText className="w-4 h-4 text-red-600" />SO Datasheet Generator</h2>
          <p className="text-[10px] text-gray-500 mt-0.5">Pure Technical Datasheet for Client Review -- GA Drawing placeholders included</p>
        </div>
        <div className="flex items-center gap-2">
          {ds && <Button variant="outline" size="sm" onClick={() => setView(view === "preview" ? "edit" : "preview")} className="text-[10px] h-7">{view === "preview" ? <Table className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}{view === "preview" ? "Edit" : "Preview"}</Button>}
          {ds && <Button variant="ghost" size="sm" onClick={handleClear} className="text-[10px] h-7 text-gray-400 hover:text-red-600"><Eraser className="w-3 h-3 mr-1" />Clear</Button>}
        </div>
      </div>

      {/* GA Drawing workflow info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <FolderOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-bold text-blue-800">GA Drawing Auto-Insertion</div>
            <div className="text-[10px] text-blue-700 mt-0.5">
              Upload GA Drawings in <strong>Documents &rarr; Document Master</strong> first. When you generate a datasheet here, the system will automatically insert the matching GA Drawing for each line item.
            </div>
          </div>
          <button
            onClick={() => { const btn = document.querySelector('[data-tab="documents"]') as HTMLElement; btn?.click(); setTimeout(() => { const masterBtn = document.querySelector('[data-subtab="master"]') as HTMLElement; masterBtn?.click(); }, 100); }}
            className="text-[10px] px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            Open Document Master
          </button>
        </div>
      </div>

      {/* STEP 1: INPUT */}
      {view === "input" && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-red-600 text-white text-[8px]">Step 1</Badge>
            <span className="text-[11px] font-bold text-gray-700">Upload or Paste SO / Quotation</span>
          </div>
          <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files); }} onClick={() => fileRef.current?.click()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all relative ${dragOver ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}>
            {parsing && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg"><div className="text-[10px] font-bold text-red-600 animate-pulse">Reading document...</div></div>}
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <div className="text-[10px] text-gray-500 font-medium">Drop SO/QTN file here, or click to browse</div>
            <div className="text-[8px] text-gray-400 mt-1">.pdf, .txt, .csv</div>
            <input ref={fileRef} type="file" accept=".pdf,.txt,.csv,.doc,.docx" className="hidden" onChange={e => handleFile(e.target.files)} />
          </div>
          <div className="relative">
            <textarea value={soText} onChange={e => setSoText(e.target.value)} placeholder={`Paste SO / Quotation text here... (or upload a PDF above)

The parser will auto-detect:
- Instrument Type (EMF / Turbine / Vortex / Rotameter etc.)
- Tag Numbers, Service, Size, Qty
- All technical sections (General, Process, Material, Electrical, Documents)

Example:
SO/QTN No: S35890
Project: NTPC Lara Power Plant
Client: BHEL

GENERAL INFORMATION
Type: Electromagnetic Flowmeter | Make: Flowtech
Model: FlowMag S630 | Size: 50NB
Qty: 2 Nos. | Service: Diesel

PROCESS DATA
Op. Pressure: 0-6 kg/cm2 | Op. Temperature: Ambient
Flow Range: 10-100 m3/hr`} className="w-full h-36 text-[10px] px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-red-400 font-mono leading-relaxed" />
            <button onClick={handleParse} disabled={!soText.trim()} className={"absolute bottom-2 right-2 text-white text-[9px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1 transition-all " + (soText.trim() ? "bg-red-600 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed")}><Sparkles className="w-3 h-3" />Auto-Parse</button>
          </div>
        </div>
      )}

      {/* STEP 2: EDIT */}
      {view === "edit" && ds && (
        <div className="space-y-3">
          {/* Parse Log */}
          {parseLog && (
            <div className={`rounded-lg px-3 py-2 border ${parseLog.errors.length > 0 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                {parseLog.errors.length > 0 ? <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> : <CheckCircle className="w-3.5 h-3.5 text-green-600" />}
                <span className="text-[10px] font-bold text-gray-700">Extracted: {parseLog.fileName}</span>
                <span className="text-[8px] text-gray-400 ml-auto">{parseLog.charsExtracted.toLocaleString()} chars | {parseLog.linesFound} lines</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] text-gray-500">Detected:</span>
                {parseLog.productTypes.map((pt, i) => <Badge key={i} className="bg-blue-600 text-white text-[9px]">{pt}</Badge>)}
                <span className="text-[9px] text-gray-500 ml-auto">{parseLog.instrumentsDetected} instrument(s)</span>
              </div>
              {parseLog.errors.map((err, i) => <div key={i} className="text-[9px] text-amber-700 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err}</div>)}
            </div>
          )}

          {/* Instrument list */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-[11px] font-bold text-gray-700 mb-2 flex items-center gap-2"><Table className="w-3.5 h-3.5" />Instruments Found</div>
            <div className="flex flex-wrap gap-1.5">
              {ds.lineItems.map((it, idx) => (
                <button key={idx} onClick={() => { setEditingIdx(editingIdx === idx ? null : idx); setDrawingSelectorOpen(false); setAvailableDrawings([]); }} className={`text-[9px] px-2 py-1 rounded border transition-all ${editingIdx === idx ? "bg-red-600 text-white border-red-600" : "bg-gray-50 border-gray-200 hover:border-red-300"}`}>
                  {it.srNo}. {it.tagNo} <span className="opacity-70">({it.instrumentType})</span>
                </button>
              ))}
            </div>
          </div>

          {/* SO Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-amber-600 text-white text-[8px]">Header</Badge>
              <span className="text-[11px] font-bold text-gray-700">SO/QTN Information</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([ ["soNo", "SO/QTN No"], ["poNo", "PO No"], ["date", "Date"], ["project", "Project"], ["client", "Client"], ["endUser", "End User"], ["contractor", "Contractor"], ["rev", "Rev"], ["revDescription", "Rev Desc"], ["totalQty", "Total Qty"] ] as [keyof SODatasheet["header"], string][]).map(([f, l]) => (
                <div key={f} className="flex items-center gap-1.5"><label className="text-[9px] font-semibold text-gray-600 shrink-0 text-right" style={{width:"35%"}}>{l}</label><input type="text" value={ds.header[f] as string} onChange={e => updateHeader(f, e.target.value)} className="flex-1 text-[9px] px-1.5 py-0.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-red-400" /></div>
              ))}
            </div>
          </div>

          {/* Section Editor */}
          {editingIdx !== null && ds.lineItems[editingIdx] && (
            <div className="bg-white border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] font-bold text-red-700 flex items-center gap-2">
                  <Crosshair className="w-3.5 h-3.5" />
                  Editing: {ds.lineItems[editingIdx].tagNo} — {ds.lineItems[editingIdx].instrumentType}
                </div>
                <span className="text-[8px] text-gray-400">{ds.lineItems[editingIdx].sections.length} sections parsed from quotation</span>
              </div>
              <div className="space-y-2">
                {ds.lineItems[editingIdx].sections.map((sec, si) => (
                  <div key={si} className="border border-gray-200 rounded overflow-hidden">
                    <div className="bg-gray-50 px-2.5 py-1 text-[9px] font-bold text-gray-700 uppercase tracking-wide">{sec.title}</div>
                    <div className="divide-y divide-gray-100">
                      {sec.rows.map(([label, value], ri) => (
                        <div key={ri} className="flex items-center gap-1 px-2 py-0.5 hover:bg-gray-50">
                          <span className="text-[8px] font-semibold text-gray-600 w-[35%] shrink-0">{label}</span>
                          <input type="text" value={value} onChange={e => updateSectionValue(editingIdx, si, ri, e.target.value)} className="flex-1 text-[8px] px-1 py-0.5 border border-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-red-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {ds.lineItems[editingIdx].gadNote && (
                <div className="mt-2 text-[8px] text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
                  <strong>GA Note:</strong> {ds.lineItems[editingIdx].gadNote}
                </div>
              )}

              {/* GA Drawing Selector */}
              <div className="mt-3 border border-blue-200 rounded-lg overflow-hidden">
                <div className="bg-blue-50 px-3 py-2 flex items-center justify-between">
                  <div className="text-[10px] font-bold text-blue-800 flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5" /> GA Drawing
                    {ds.lineItems[editingIdx].gaDrawingUrl ? (
                      <Badge className="bg-green-600 text-white text-[7px] px-1 py-0">Selected</Badge>
                    ) : (
                      <Badge className="bg-gray-400 text-white text-[7px] px-1 py-0">None</Badge>
                    )}
                  </div>
                  <button
                    onClick={() => loadAvailableDrawings(editingIdx)}
                    className="text-[8px] px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {availableDrawings.length > 0 && drawingSelectorOpen ? "Hide Options" : "Change Drawing"}
                  </button>
                </div>

                {/* Selected drawing info */}
                {ds.lineItems[editingIdx].gaDrawingUrl && !drawingSelectorOpen && (
                  <div className="p-2 text-[8px] text-gray-600 bg-white">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>Auto-selected from Document Master</span>
                    </div>
                    {ds.lineItems[editingIdx].gaDrawingTotal > 1 && (
                      <div className="text-amber-600 mt-0.5">
                        <strong>{ds.lineItems[editingIdx].gaDrawingTotal} drawings</strong> available — click "Change Drawing" to verify
                      </div>
                    )}
                  </div>
                )}

                {/* Drawing options list */}
                {drawingSelectorOpen && availableDrawings.length > 0 && (
                  <div className="p-2 space-y-1.5 bg-white max-h-[200px] overflow-y-auto">
                    <div className="text-[8px] text-gray-500 font-semibold mb-1">Click to select the correct GA Drawing:</div>
                    {availableDrawings.map((opt, oi) => {
                      const isSelected = ds.lineItems[editingIdx].gaDrawingUrl === opt.dataUrl;
                      return (
                        <div
                          key={oi}
                          onClick={() => selectDrawingForItem(editingIdx, opt.drawing.id)}
                          className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${
                            isSelected
                              ? "border-green-400 bg-green-50"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          <div className="w-12 h-12 border border-gray-200 rounded overflow-hidden flex-shrink-0 bg-gray-50">
                            {opt.drawing.fileType === "pdf" ? (
                              <iframe src={opt.dataUrl} className="w-full h-full" title={opt.drawing.drawingNo} />
                            ) : (
                              <img src={opt.dataUrl} className="w-full h-full object-contain" alt={opt.drawing.drawingNo} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-bold text-gray-800 truncate">{opt.drawing.drawingNo}</div>
                            <div className="text-[8px] text-gray-600 truncate">{opt.drawing.title}</div>
                            <div className="text-[7px] text-gray-400">
                              {opt.drawing.fileName} | Rev. {opt.drawing.revision} | {opt.drawing.date}
                            </div>
                          </div>
                          {isSelected && <Badge className="bg-green-600 text-white text-[7px] px-1 py-0">Current</Badge>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {drawingSelectorOpen && availableDrawings.length === 0 && (
                  <div className="p-3 text-[9px] text-gray-500 text-center">
                    No GA Drawings found for "{ds.lineItems[editingIdx].instrumentType}" in Document Master.
                    <br />
                    <span className="text-blue-600">Go to Documents &rarr; Document Master to upload drawings.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setView("preview")} className="text-[10px] h-7"><Eye className="w-3 h-3 mr-1" />Preview</Button>
            <Button variant="outline" size="sm" onClick={() => html && downloadHtml(html, ds.header.soNo)} className="text-[10px] h-7"><Download className="w-3 h-3 mr-1" />Download HTML</Button>
            <Button size="sm" onClick={() => html && openPrintWindow(html)} className="text-[10px] h-7 bg-red-600 hover:bg-red-700 text-white"><Printer className="w-3 h-3 mr-1" />Print / Save PDF</Button>
          </div>
        </div>
      )}

      {/* PREVIEW */}
      {view === "preview" && ds && html && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600 text-white text-[8px]">Preview</Badge>
              <span className="text-[11px] font-bold text-gray-700">{ds.header.soNo} — {ds.lineItems.length} instruments, {ds.lineItems.length + 3} pages</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setView("edit")} className="text-[10px] h-7"><Table className="w-3 h-3 mr-1" />Edit</Button>
              <Button variant="outline" size="sm" onClick={() => downloadHtml(html, ds.header.soNo)} className="text-[10px] h-7"><Download className="w-3 h-3 mr-1" />Download</Button>
              <Button size="sm" onClick={() => openPrintWindow(html)} className="text-[10px] h-7 bg-red-600 hover:bg-red-700 text-white"><Printer className="w-3 h-3 mr-1" />Print PDF</Button>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-200 flex items-center justify-between">
              <span className="text-[9px] font-bold text-gray-500 uppercase">Technical Datasheet Preview (A4 Landscape)</span>
              <span className="text-[8px] text-gray-400">Cover + Index + {ds.lineItems.length} Instrument pages + Standards</span>
            </div>
            <iframe srcDoc={html} title="Preview" className="w-full bg-white" style={{ height: "600px" }} />
          </div>
        </div>
      )}
    </div>
  );
}
