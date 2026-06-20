/**
 * ProjectsPanel.tsx — Main project workspace
 * Integrated workflow: Upload → Extract → Line Items (Queries + Sizing inline) → Datasheet
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import type { ExtractedLineItem, ProjectMetadata, DocumentProject } from "../types/shared";
import { parseSmart } from "../data/smartParser";
import { readFileAsText } from "../data/pdfExtractor";
import { validateEngineering } from "../data/engineeringValidator";
import { compileProjectDocument, compileSizingReportDocument } from "../data/projectCompilationEngine";
import type { CompilationInput, SizingReportCompilationInput } from "../data/projectCompilationEngine";
import { validateAllProducts } from "../data/productValidationEngine";
import DatasheetGADPanel from "./projectTabs/DatasheetGADPanel";
import QAPMasterPanel from "./projectTabs/QAPMasterPanel";
import ProjectSelector from "./projectTabs/ProjectSelector";
import TabOverview from "./projectTabs/TabOverview";
import TabDocuments from "./projectTabs/TabDocuments";
import TabLineItems from "./projectTabs/TabLineItems";
import TabEnggQueries from "./projectTabs/TabEnggQueries";
import TabPreview from "./projectTabs/TabPreview";
import TabFinalReports from "./projectTabs/TabFinalReports";

/** Safe ID generator with fallback for environments where crypto.randomUUID fails */
function safeId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch { /* ignore */ }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const TABS = [
  { id: "overview", label: "Overview", icon: "📋" },
  { id: "uploaded_documents", label: "Documents", icon: "📤" },
  { id: "extracted_line_items", label: "Line Items", icon: "📑" },
  { id: "datasheet_gad", label: "Datasheet + GAD", icon: "📄" },
  { id: "qap_master", label: "QAP Master", icon: "📋" },
  { id: "report_preview", label: "Preview", icon: "👁" },
  { id: "final_reports", label: "Final Reports", icon: "📊" },
];

/** Map query field to ExtractedLineItem property for saving */
function buildResolvedUpdate(li: ExtractedLineItem, fieldName: string, value: string): Partial<ExtractedLineItem> {
  const fn = fieldName.toLowerCase();
  const numVal = parseFloat(value);
  const isStr = isNaN(numVal);
  const update: Partial<ExtractedLineItem> = {};
  const pc = li.processConditions || { service: "liquid" as const, fluidName: "", density: 0, viscosity: 0, operatingTemp: 0, operatingPressure: 0, flowRateMin: 0, flowRateMax: 0, flowUnit: "m³/hr", pipeSize: "", meterCategory: "inline" as const };
  if (fn.includes("(min)") || fn.includes("minimum") || fn.includes("flow rate min") || fn.includes("flow min")) { update.processConditions = { ...pc, flowRateMin: isStr ? 0 : numVal }; update.flowMin = value; return update; }
  if (fn.includes("(max)") || fn.includes("maximum") || fn.includes("flow rate max") || fn.includes("flow max") || fn.includes("flow range")) { update.processConditions = { ...pc, flowRateMax: isStr ? 0 : numVal }; update.flowMax = value; return update; }
  if (fn.includes("flow unit")) { update.processConditions = { ...pc, flowUnit: value }; update.flowUnit = value; return update; }
  if (fn.includes("pressure")) { update.processConditions = { ...pc, operatingPressure: isStr ? 0 : numVal }; update.pressure = value; return update; }
  if (fn.includes("temperature")) { update.processConditions = { ...pc, operatingTemp: isStr ? 0 : numVal }; update.temperature = value; return update; }
  if (fn.includes("density") || fn.includes("specific gravity")) { update.processConditions = { ...pc, density: isStr ? 0 : numVal }; return update; }
  if (fn.includes("viscosity")) { update.processConditions = { ...pc, viscosity: isStr ? 0 : numVal }; return update; }
  if (fn.includes("pipe") || fn.includes("line size")) { update.processConditions = { ...pc, pipeSize: value }; update.size = value; return update; }
  if (fn.includes("fluid") || fn.includes("service") || fn.includes("gas name")) { update.processConditions = { ...pc, fluidName: value }; update.processMedium = value; return update; }
  if (fn.includes("moc") || fn.includes("material")) { update.moc = value; return update; }
  if (fn.includes("mounting")) { update.specs = { ...li.specs, "Mounting Type": value }; update.application = value; return update; }
  if (fn.includes("c-c") || fn.includes("level range") || fn.includes("probe length")) { update.specs = { ...li.specs, "C-C Distance": value }; update.size = value; return update; }
  update.specs = { ...li.specs, [fieldName]: value }; return update;
}

/** Pending SO data stored in ref (not state) to avoid extra re-renders */
interface PendingSOData {
  base64: string;
  fileName: string;
  fileSize: number;
  lineItems: ExtractedLineItem[];
}

export default function ProjectsPanel() {
  const { state, dispatch, notify, createProject, setCurrentProject } = useAppContext();
  const { currentProject, projectWorkspaceTab } = state;
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledHtml, setCompiledHtml] = useState<string | null>(null);
  const [compileStats, setCompileStats] = useState<any>(null);
  const [sizingReportHtml, setSizingReportHtml] = useState<string | null>(null);
  const [isCompilingSizing, setIsCompilingSizing] = useState(false);
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);
  const [editingLineItem, setEditingLineItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ExtractedLineItem>>({});
  const [coverForm, setCoverForm] = useState({ projectName: "", contractorName: "", endClientName: "" });
  const [isSavingCover, setIsSavingCover] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [lastCompileResult, setLastCompileResult] = useState<{ message: string; type: "success" | "error" | null }>({ message: "", type: null });

  // Pending SO data stored in ref to avoid state-driven re-render cycles
  const pendingSORef = useRef<PendingSOData | null>(null);

  // ── Process pending SO data when currentProject becomes available ──
  useEffect(() => {
    if (!currentProject) return;
    const pending = pendingSORef.current;
    if (!pending) return;

    // Clear ref IMMEDIATELY to prevent double-processing
    pendingSORef.current = null;

    console.log("[ProjectsPanel] Processing pending SO for project:", currentProject.id);

    try {
      // 1. Add uploaded document
      dispatch({
        type: "ADD_UPLOADED_DOCUMENT",
        doc: {
          id: safeId(),
          name: pending.fileName,
          type: "so" as const,
          fileSize: pending.fileSize,
          uploadDate: Date.now(),
          uploadedBy: "user",
          extractionStatus: "completed" as const,
          ocrText: pending.base64,
        },
      });

      // 2. Set line items if any
      if (pending.lineItems.length > 0) {
        dispatch({ type: "SET_LINE_ITEMS", items: pending.lineItems });
        notify("success", `${pending.fileName}: ${pending.lineItems.length} items extracted`);
      }

      // 3. Switch to Documents tab
      dispatch({ type: "SET_PROJECT_WORKSPACE_TAB", tab: "uploaded_documents" as any });
    } catch (err: any) {
      console.error("[ProjectsPanel] Error processing pending SO:", err);
      notify("error", "Failed to process SO data", err?.message || String(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.id]);

  // ── PROJECT CREATION ──
  const makeFullMetadata = useCallback((partial: { projectName: string; customerName: string; quoteNumber: string; endClientName?: string; poNumber?: string }): ProjectMetadata => ({
    projectName: partial.projectName.trim(),
    customerName: partial.customerName.trim(),
    quoteNumber: partial.quoteNumber.trim(),
    poNumber: (partial.poNumber || "").trim(),
    endClientName: (partial.endClientName || partial.customerName).trim(),
    date: new Date().toLocaleDateString("en-GB"),
    revisionNumber: "Rev. 1.0",
    projectReferenceNumber: partial.quoteNumber.trim(),
    preparedBy: "FlowAI",
    reviewedBy: "",
    productFamily: "known",
    notes: "",
  }), []);

  const handleCreateProject = useCallback((meta: { projectName: string; customerName: string; quoteNumber: string; endClientName?: string }) => {
    if (!meta.projectName.trim() || !meta.customerName.trim()) { notify("warning", "Required", "Project Name and Customer Name required"); return; }
    const project = createProject(makeFullMetadata(meta));
    setCurrentProject(project.id);
    notify("success", "Project created", meta.projectName);
    return project;
  }, [createProject, makeFullMetadata, notify, setCurrentProject]);

  // ── SO Upload callback from ProjectSelector ──
  const handleSOUpload = useCallback((data: { file: File; base64: string; soMeta: Record<string, string>; lineItems: ExtractedLineItem[] }) => {
    try {
      const sm = data.soMeta;
      const projectName = sm.projectName || sm.client || data.file.name.replace(/\.pdf$/i, "");
      const customerName = sm.client || "Extracted from SO";
      const quoteNumber = sm.soNo || "SO-" + Date.now();
      const poNumber = sm.poNo || "";
      const endClientName = sm.endUser || customerName;

      // 1. Create project
      const project = createProject(makeFullMetadata({
        projectName: projectName.trim(),
        customerName: customerName.trim(),
        quoteNumber: quoteNumber.trim(),
        poNumber: poNumber.trim(),
        endClientName: endClientName.trim(),
      }));

      // 2. Store pending data in ref (NOT state) — useEffect will pick it up
      pendingSORef.current = {
        base64: data.base64,
        fileName: data.file.name,
        fileSize: data.file.size,
        lineItems: data.lineItems,
      };

      // 3. Open the project — this triggers the useEffect
      setCurrentProject(project.id);

      console.log("[ProjectsPanel] SO upload: project created, pending queued", project.id);
    } catch (err: any) {
      console.error("[ProjectsPanel] SO upload error:", err);
      notify("error", "SO upload failed", err?.message || String(err));
    }
  }, [createProject, makeFullMetadata, notify, setCurrentProject]);

  // ── DOCUMENT UPLOAD (inside project workspace) ──
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentProject) return;
    for (const file of Array.from(files)) {
      try {
        notify("info", `Uploading ${file.name}...`);
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        const base64 = btoa(binary);
        dispatch({ type: "ADD_UPLOADED_DOCUMENT", doc: { id: safeId(), name: file.name, type: "so", fileSize: file.size, uploadDate: Date.now(), uploadedBy: "user", extractionStatus: "pending", ocrText: base64 } });
        notify("success", `${file.name} uploaded`);
      } catch (err: any) { notify("error", `Upload failed: ${file.name}`, err.message); }
    }
    e.target.value = "";
  }, [currentProject, dispatch, notify]);

  // ── LINE ITEM EXTRACTION ──
  // Uses readFileAsText from pdfExtractor.ts — EXACT same extraction as Documents section
  const extractFromDocs = useCallback(async () => {
    if (!currentProject) return;
    const docs = currentProject.uploadedDocuments.filter((d) => d.extractionStatus === "pending" || d.extractionStatus === "failed");
    if (docs.length === 0) { notify("warning", "No documents", "Upload documents first"); return; }
    setIsExtracting(true);
    for (const doc of docs) {
      try {
        notify("info", `Processing ${doc.name}...`);
        dispatch({ type: "UPDATE_DOCUMENT_EXTRACTION", docId: doc.id, status: "processing" });

        const base64 = doc.ocrText || "";
        if (!base64) { notify("warning", "No file data", doc.name); dispatch({ type: "UPDATE_DOCUMENT_EXTRACTION", docId: doc.id, status: "failed" }); continue; }

        // Convert base64 back to File for readFileAsText
        let extractedText = "";
        try {
          const binaryStr = atob(base64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
          const file = new File([bytes], doc.name, { type: "application/pdf" });
          extractedText = await readFileAsText(file);
        } catch (pdfErr: any) {
          // Fallback: try as raw text
          try { extractedText = atob(base64); } catch { extractedText = base64; }
        }

        if (!extractedText || extractedText.length < 50) { notify("warning", "No text extracted", doc.name); dispatch({ type: "UPDATE_DOCUMENT_EXTRACTION", docId: doc.id, status: "failed" }); continue; }

        const parsed = parseSmart(extractedText);
        dispatch({ type: "UPDATE_DOCUMENT_EXTRACTION", docId: doc.id, status: "completed" });

        if (parsed.instruments.length > 0) {
          const items = parsed.instruments.map((inst: any) => ({
            ...inst,
            id: safeId(),
            projectId: currentProject.id,
            extractionTimestamp: Date.now(),
            status: "extracted",
            specs: inst.specs || {},
            processConditions: inst.processConditions || undefined,
          }));
          dispatch({ type: "SET_LINE_ITEMS", items: [...currentProject.lineItems, ...items] as ExtractedLineItem[] });
          notify("success", `${doc.name}: ${parsed.instruments.length} items extracted`);
        } else {
          notify("warning", "No instruments found", `${doc.name} — check if PDF contains extractable text`);
        }
      } catch (e: any) { dispatch({ type: "UPDATE_DOCUMENT_EXTRACTION", docId: doc.id, status: "failed" }); notify("error", `Extraction failed: ${doc.name}`, e.message || String(e)); }
    }
    setIsExtracting(false);
  }, [currentProject, dispatch, notify]);

  // ── EDIT LINE ITEM ──
  const handleStartEdit = (li: ExtractedLineItem) => { setEditingLineItem(li.id); setEditForm({ ...li }); };
  const saveEditLineItem = useCallback(() => {
    if (!editingLineItem || !currentProject) return;
    const originalLi = currentProject.lineItems.find((l) => l.id === editingLineItem);
    if (!originalLi) return;
    const updatedLi: ExtractedLineItem = { ...originalLi, ...editForm, id: editingLineItem };
    const pc = updatedLi.processConditions || { service: "liquid" as const, fluidName: "", density: 0, viscosity: 0, operatingTemp: 0, operatingPressure: 0, flowRateMin: 0, flowRateMax: 0, flowUnit: "m³/hr", pipeSize: "", meterCategory: "inline" as const };
    const num = (v: string | undefined) => { const n = parseFloat(v || "0"); return isNaN(n) ? 0 : n; };
    updatedLi.processConditions = { ...pc, fluidName: updatedLi.processMedium || pc.fluidName, flowRateMin: num(updatedLi.flowMin) || pc.flowRateMin, flowRateMax: num(updatedLi.flowMax) || pc.flowRateMax, flowUnit: updatedLi.flowUnit || pc.flowUnit, operatingPressure: num(updatedLi.pressure) || pc.operatingPressure, operatingTemp: num(updatedLi.temperature) || pc.operatingTemp, density: pc.density, viscosity: pc.viscosity, pipeSize: updatedLi.size || pc.pipeSize, meterCategory: pc.meterCategory };
    const vr = validateEngineering(updatedLi);
    dispatch({ type: "UPDATE_LINE_ITEM", item: { id: editingLineItem, ...editForm, processConditions: updatedLi.processConditions, engineeringReview: { reviewStatus: vr.reviewStatus, queries: vr.queries.map((vq) => ({ fieldName: vq.fieldName, extractedValue: vq.extractedValue, issue: vq.issue, whyConcern: vq.whyConcern, requiredClarification: vq.requiredClarification, severity: vq.severity, blocksSizing: vq.blocksSizing, blocksReport: vq.blocksReport })), assumptions: vr.assumptions.map((va) => ({ field: va.field, assumedValue: va.assumedValue, basis: va.basis, safe: va.safe, needsConfirmation: va.needsConfirmation })), conversions: vr.conversions, missingMandatoryFields: vr.missingMandatoryFields, summary: vr.reviewSummary } } });
    setEditingLineItem(null); setEditForm({}); notify("success", "Line item updated");
  }, [editingLineItem, editForm, dispatch, notify, currentProject]);

  // ── COMPILE REPORTS ──
  const handleCompile = useCallback(async () => {
    setIsCompiling(true);
    setLastCompileResult({ message: "Starting compilation...", type: null });
    console.log("[Compile] Starting compilation...");
    try {
      const project = currentProject!;
      if (!project.lineItems || project.lineItems.length === 0) {
        throw new Error("No line items to compile. Upload and extract documents first.");
      }

      const sizingReports: Record<string, string> = {};
      const weReports: Record<string, string> = {};
      const datasheetReports: Record<string, string> = {};
      const gadDrawingIds: Record<string, string> = {};

      for (const li of project.lineItems) {
        if (li.sizingReportHtml) sizingReports[li.id] = li.sizingReportHtml;
        else if (li.sizingResult) sizingReports[li.id] = JSON.stringify(li.sizingResult);
        if (li.weReportHtml) weReports[li.id] = li.weReportHtml;
        if (li.datasheetHtml) datasheetReports[li.id] = li.datasheetHtml;
        if (li.gadDrawingId) gadDrawingIds[li.id] = li.gadDrawingId;
      }

      console.log("[Compile] Items:", project.lineItems.length, "Sized:", Object.keys(sizingReports).length, "Datasheets:", Object.keys(datasheetReports).length);

      // Build compilation input with safe metadata
      const meta = {
        ...project.metadata,
        projectName: coverForm.projectName || project.metadata.projectName || "Project",
        customerName: coverForm.contractorName || project.metadata.customerName || "",
        endClientName: coverForm.endClientName || project.metadata.endClientName || project.metadata.customerName || "",
      };

      // Load GAD images from IndexedDB if drawings are assigned
      const gadImages: Record<string, string> = {};
      for (const [liId, drawingId] of Object.entries(gadDrawingIds)) {
        try {
          const { getFileDataUrl } = await import("../data/gaDrawingStorage");
          const dataUrl = await getFileDataUrl(drawingId);
          if (dataUrl) gadImages[drawingId] = dataUrl;
        } catch (e) {
          console.warn("[Compile] Could not load GAD image for drawing:", drawingId, e);
        }
      }
      console.log("[Compile] Loaded GAD images:", Object.keys(gadImages).length);

      const input: CompilationInput = {
        metadata: meta,
        lineItems: project.lineItems,
        uploadedDocs: project.uploadedDocuments,
        sizingReports,
        weReports,
        datasheetReports,
        gadDrawingIds,
        gadImages,
        qapMapping: {}
      };

      console.log("[Compile] Calling compileProjectDocument...");
      const result = compileProjectDocument(input);
      console.log("[Compile] Success:", result.sectionCount, "sections");
      setCompiledHtml(result.html);
      setCompileStats({ sections: result.sectionCount, li: result.lineItemCount, qap: result.qapCount, sizing: result.sizingCount, we: result.weCount });
      dispatch({ type: "SET_FULL_REPORT", html: result.html });
      setLastCompileResult({ message: `Compiled: ${result.sectionCount} sections, ${result.lineItemCount} items`, type: "success" });
      notify("success", "Document compiled", `${result.sectionCount} sections, ${result.lineItemCount} items`);
    } catch (e: any) {
      console.error("[Compile] FAILED:", e?.message, e?.stack);
      setLastCompileResult({ message: `Compilation failed: ${e?.message || String(e)}`, type: "error" });
      notify("error", "Compilation failed", e?.message || String(e));
    }
    setIsCompiling(false);
  }, [currentProject, coverForm, dispatch, notify]);

  const handleCompileSizingReport = useCallback(async () => {
    setIsCompilingSizing(true);
    try {
      const sizingReports: Record<string, string> = {};
      for (const li of currentProject!.lineItems) { if (li.sizingReportHtml) sizingReports[li.id] = li.sizingReportHtml; }
      const input: SizingReportCompilationInput = { metadata: currentProject!.metadata, lineItems: currentProject!.lineItems, sizingReports };
      const result = compileSizingReportDocument(input);
      setSizingReportHtml(result.html);
      notify("success", "Sizing report compiled");
    } catch (e: any) { notify("error", "Sizing report failed", e?.message || String(e)); }
    setIsCompilingSizing(false);
  }, [currentProject, notify]);

  const handleSaveCover = useCallback(() => {
    setIsSavingCover(true);
    dispatch({ type: "UPDATE_PROJECT", project: { ...currentProject!, metadata: { ...currentProject!.metadata, projectName: coverForm.projectName || currentProject!.metadata.projectName, customerName: coverForm.contractorName || currentProject!.metadata.customerName, endClientName: coverForm.endClientName || currentProject!.metadata.endClientName } } });
    notify("success", "Cover page saved");
    setIsSavingCover(false);
  }, [currentProject, coverForm, dispatch, notify]);

  const downloadHtml = useCallback((html: string, filename: string) => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const tabBtn = (id: string, label: string, icon: string) => (
    <button key={id} onClick={() => dispatch({ type: "SET_PROJECT_WORKSPACE_TAB", tab: id as any })} style={{ padding: "8px 14px", borderRadius: "6px", border: "none", background: projectWorkspaceTab === id ? "#c20017" : "transparent", color: projectWorkspaceTab === id ? "#fff" : "#374151", cursor: "pointer", fontSize: "12px", fontWeight: projectWorkspaceTab === id ? 600 : 400, display: "flex", alignItems: "center", gap: "4px" }}>{icon} {label}</button>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER with error boundary
  // ═══════════════════════════════════════════════════════════════
  try {
    // ── NO PROJECT: Show selector ──
    if (!currentProject) {
      return (
        <ProjectSelector
          projects={state.projects}
          onCreate={handleCreateProject}
          onOpen={setCurrentProject}
          onSOUpload={handleSOUpload}
        />
      );
    }

    // ── PROJECT WORKSPACE ──
    const li = currentProject.lineItems;
    let validResults: { li: ExtractedLineItem; result: any }[] = [];
    try {
      const validResultsMap = validateAllProducts(li);
      validResults = li.map((l) => ({ li: l, result: validResultsMap[l.id] }));
    } catch (e) { console.error("validateAllProducts error:", e); }

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Tab Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: "4px", flex: 1 }}>
            {TABS.map((t) => tabBtn(t.id, t.label, t.icon))}
          </div>
          {/* Close Project button */}
          <button
            onClick={() => {
              if (window.confirm("Close this project? You can reopen it from the project list or upload a new SO.")) {
                setCurrentProject(null);
              }
            }}
            title="Close project and return to project list"
            style={{
              padding: "6px 12px", borderRadius: 5, border: "1px solid #d1d5db",
              background: "#fff", color: "#6b7280", fontSize: 11, cursor: "pointer",
              whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px",
            }}
          >
            ✕ Close Project
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
          {projectWorkspaceTab === "overview" && <TabOverview project={currentProject} lineItems={li} validResults={validResults} compiledHtml={compiledHtml} sizingReportHtml={sizingReportHtml} onDownload={downloadHtml} />}
          {projectWorkspaceTab === "uploaded_documents" && <TabDocuments project={currentProject} isExtracting={isExtracting} onExtract={extractFromDocs} onFileSelect={handleFileSelect} />}
          {projectWorkspaceTab === "extracted_line_items" && <TabLineItems lineItems={li} isExtracting={isExtracting} selectedLineItemId={selectedLineItemId} onSelectLineItem={setSelectedLineItemId} onEdit={handleStartEdit} editingLineItem={editingLineItem} editForm={editForm} setEditForm={setEditForm} onSaveEdit={saveEditLineItem} onCancelEdit={() => { setEditingLineItem(null); setEditForm({}); }} currentProject={currentProject} />}
          {/* Engg Queries tab removed — all query resolution happens inline in Line Items */}
          {projectWorkspaceTab === "datasheet_gad" && <DatasheetGADPanel />}
          {projectWorkspaceTab === "qap_master" && <QAPMasterPanel />}
          {projectWorkspaceTab === "report_preview" && <TabPreview metadata={currentProject.metadata} lineItems={li} coverForm={coverForm} setCoverForm={setCoverForm} isSavingCover={isSavingCover} onSaveCover={handleSaveCover} />}
          {projectWorkspaceTab === "final_reports" && <TabFinalReports onCompile={handleCompile} isCompiling={isCompiling} compiledHtml={compiledHtml} compileStats={compileStats} sizingReportHtml={sizingReportHtml} isCompilingSizing={isCompilingSizing} onCompileSizing={handleCompileSizingReport} onDownload={downloadHtml} project={currentProject} compileResult={lastCompileResult} />}
        </div>
      </div>
    );
  } catch (err: any) {
    console.error("[ProjectsPanel] Render error:", err);
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#dc2626", marginBottom: 12 }}>Something went wrong</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>{err?.message || String(err)}</div>
        <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", borderRadius: 5, background: "#c20017", color: "#fff", border: "none", cursor: "pointer" }}>Reload Page</button>
      </div>
    );
  }
}
