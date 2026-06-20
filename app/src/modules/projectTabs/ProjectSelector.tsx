/**
 * ProjectSelector — Landing page for Projects section.
 * PRIMARY FLOW: Upload SO/QTN PDF → auto-extract metadata → callback to parent for project creation.
 */

import { useState } from "react";
import type { DocumentProject, ExtractedLineItem } from "../../types/shared";
import { readFileAsText } from "../../data/pdfExtractor";
import { generateFromSOText } from "../../data/api";
import { applyFluidDefaults } from "../../data/fluidDefaults";

interface ExtractedSOData {
  file: File;
  base64: string;
  soMeta: Record<string, string>;
  lineItems: ExtractedLineItem[];
}

interface Props {
  projects: DocumentProject[];
  onCreate: (meta: { projectName: string; customerName: string; quoteNumber: string; endClientName?: string }) => DocumentProject | void;
  onOpen: (projectId: string) => void;
  onSOUpload: (data: ExtractedSOData) => void;
}

/** Safe ID generator */
function safeId(): string {
  try { if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID(); } catch { /* ignore */ }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Extract SO metadata from text */
function extractSOMetadata(text: string) {
  const meta: Record<string, string> = {};
  // SO / QTN / PO Number
  // Handles pipe-delimited format: | Sales Order Ackn No. | :   | S35899 |
  const soPatterns = [
    /(?:SO\s*(?:No\.?|Number|#)|Sales\s+Order\s+(?:Ackn\s+)?No\.?|Order\s+(?:No\.?|Ackn\s*No\.?))\s*[\|\s]*[:\-]?\s*[\|]?\s*([A-Z0-9\-/]+)/i,
    /(?:QTN\s*(?:No\.?|Number|#)|Quotation\s*(?:No\.?|Ref\.?))\s*[\|\s]*[:\-]?\s*[\|]?\s*([A-Z0-9\-/]+)/i,
    /(?:PO\s*(?:No\.?|Number|#)|Purchase\s+Order|P\.O\.?)\s*[\|\s]*[:\-]?\s*[\|]?\s*([A-Z0-9\-/]+)/i,
  ];
  for (const p of soPatterns) { const m = text.match(p); if (m) { meta.soNo = m[1].trim(); break; } }
  // PO number extraction
  const poPatterns = [
    /(?:Cust\.?\s*)?PO\s*(?:No\.?|Number|#)?\s*[\|\s]*[:\-]?\s*[\|]?\s*([A-Z0-9\-/]+)/i,
    /(?:Purchase\s+Order\s*(?:No\.?|Number)?)\s*[\|\s]*[:\-]?\s*[\|]?\s*([A-Z0-9\-/]+)/i,
  ];
  for (const p of poPatterns) { const m = text.match(p); if (m) { meta.poNo = m[1].trim(); break; } }
  // Client
  const clientP = [/(?:Client|Customer|Buyer|Consignee|Bill\s*To)\s*[:\-]?\s*\|?\s*([A-Z][A-Za-z0-9\s&.,()/-]{3,80})/i, /(?:M\/s|Ms|Messrs)\s*[:\-]?\s*([A-Z][A-Za-z0-9\s&.,()/-]{3,80})/i];
  for (const p of clientP) { const m = text.match(p); if (m) { meta.client = m[1].trim().split(/\n|\|/)[0].trim(); break; } }
  // End User
  const mEnd = text.match(/(?:End\s*(?:User|Client)|Final\s*(?:User|Client))\s*[:\-]?\s*\|?\s*([A-Z][A-Za-z0-9\s&.,()/-]{3,80})/i);
  if (mEnd) meta.endUser = mEnd[1].trim().split(/\n|\|/)[0].trim();
  // Project Name
  const projP = [/(?:Project\s*(?:Name|Title)|Project)\s*[:\-]?\s*([A-Z][A-Za-z0-9\s&.,()/_-]{3,100})/i, /(?:Subject|Regarding|Re:)\s*[:\-]?\s*([A-Z][A-Za-z0-9\s&.,()/_-]{3,100})/i];
  for (const p of projP) { const m = text.match(p); if (m) { meta.projectName = m[1].trim().split(/\n|\|/)[0].trim(); break; } }
  // Line-by-line fallback
  for (const line of text.split("\n")) {
    if (!meta.soNo && /so\s*(?:no|number|#)/i.test(line)) { const m = line.match(/[:\-]?\s*([A-Z0-9\-/]{3,})/i); if (m) meta.soNo = m[1].trim(); }
    if (!meta.client && (line.toLowerCase().includes("client") || line.toLowerCase().includes("customer")) && line.includes(":")) { meta.client = line.split(":").slice(1).join(":").trim().split(/\||\n/)[0].trim(); }
  }
  return meta;
}

export default function ProjectSelector({ projects, onCreate, onOpen, onSOUpload }: Props) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [form, setForm] = useState({ projectName: "", customerName: "", quoteNumber: "" });
  const [status, setStatus] = useState<{ message: string; type: "info" | "success" | "error" | "warning" } | null>(null);

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString("en-GB");

  /** Handle file upload — EXACT same approach as Documents section */
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      setIsExtracting(true);
      setStatus({ message: `Reading ${file.name}...`, type: "info" });

      try {
        // Step 1: Extract text using EXACT same function as Documents section
        const text = await readFileAsText(file);
        console.log("[SO Upload] Extracted:", text.length, "chars");

        if (!text || text.length < 50) {
          setStatus({ message: "Could not extract text from PDF. It may be a scanned image.", type: "error" });
          setIsExtracting(false);
          continue;
        }

        // Step 2: Parse using EXACT same function as Documents section
        setStatus({ message: `Text extracted: ${text.length} chars. Parsing instruments...`, type: "info" });
        const result = await generateFromSOText(text);
        console.log("[SO Upload] Instruments:", result.lineItemCount);

        if (result.lineItemCount === 0) {
          setStatus({ message: `No instruments found in ${file.name}. Try the Documents tab → SO Datasheet Generator instead.`, type: "warning" });
          setIsExtracting(false);
          continue;
        }

        setStatus({ message: `Found ${result.lineItemCount} instruments! Creating project...`, type: "success" });

        // Step 3: Convert instruments to ExtractedLineItem format
        const soMeta = extractSOMetadata(text);

        // Convert file to base64 for storage
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        const base64 = btoa(binary);

        // Map SODatasheet line items to ExtractedLineItem format
        const lineItems: ExtractedLineItem[] = result.datasheet.lineItems.map((li: any) => {
          const pd = li.processData || {};
          const flowMin = pd.flowRateMin || 0;
          const flowMax = pd.flowRateMax || 0;
          const flowNormal = pd.flowRateNormal || 0;
          const flowUnit = pd.flowUnit || "m³/hr";
          const pressure = pd.operatingPressure || 0;
          const temperature = pd.operatingTemp || 0;
          const rawDensity = pd.fluidDensity || (pd.fluidSG ? pd.fluidSG * 1000 : 0);
          const rawViscosity = pd.fluidViscosity || 0;
          const service = pd.service || "liquid";
          const fluidName = pd.fluidName || li.service || "";
          const pipeSize = pd.lineSize || li.size || "";

          // Apply fluid defaults when density/viscosity are missing (same as main sizing section)
          const fluidDefaults = applyFluidDefaults(service, fluidName, rawDensity, rawViscosity, temperature);

          return {
            id: safeId(),
            lineItemNo: li.srNo || 1,
            tagNumber: li.tagNo || "",
            productFamily: li.instrumentType || "",
            modelName: li.model || "",
            modelNumber: li.decodNo || "",
            size: li.size || "",
            application: fluidName || li.service || "",
            processMedium: fluidName || li.service || "",
            moc: "",
            processConnection: li.processConnection?.size || li.size || "",
            output: "",
            certification: "",
            quantity: li.qty || 1,
            floatMoc: "",
            specs: li.sections ? Object.fromEntries(li.sections.flatMap((s: any) => s.rows || [])) : {},
            processConditions: {
              service,
              fluidName,
              density: fluidDefaults.density,
              viscosity: fluidDefaults.viscosity,
              operatingTemp: fluidDefaults.operatingTemp,
              operatingPressure: pressure,
              flowRateMin: flowMin,
              flowRateMax: flowMax,
              flowUnit,
              pipeSize,
              meterCategory: "inline",
            },
            flowMin: flowMin ? String(flowMin) : flowNormal ? String(flowNormal) : "",
            flowMax: flowMax ? String(flowMax) : flowNormal ? String(flowNormal) : "",
            flowUnit,
            pressure: pressure ? String(pressure) : "",
            temperature: fluidDefaults.operatingTemp ? String(fluidDefaults.operatingTemp) : "",
            extractionTimestamp: Date.now(),
            status: "extracted" as const,
            notes: `SO Extraction | Service: ${service} | Fluid: ${fluidName || service} | Density: ${fluidDefaults.density} kg/m³ (${fluidDefaults.source}) | Viscosity: ${fluidDefaults.viscosity} cP (${fluidDefaults.source})`,
            extractionConfidence: 0.9,
            lowConfidenceFields: [],
            gadDrawingId: li.gaDrawingUrl || undefined,
          };
        });

        onSOUpload({ file, base64, soMeta, lineItems });
        setStatus(null);
      } catch (err: any) {
        console.error("[SO Upload] Failed:", err);
        setStatus({ message: `Error: ${err?.message || String(err)}`, type: "error" });
      }
      setIsExtracting(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#1f2937", marginBottom: 4 }}>Project Workspace</div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>Upload an SO/QTN to auto-create a project with extracted details</div>
      </div>

      {/* PRIMARY: Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        style={{
          border: `2px dashed ${dragOver ? "#c20017" : "#d1d5db"}`,
          borderRadius: 10, padding: "48px 24px", textAlign: "center",
          background: dragOver ? "#fef2f2" : "#fafafa",
          transition: "all 0.2s", marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
          {isExtracting ? (status?.message || "Processing...") : (dragOver ? "Drop files here" : "Upload SO / QTN Document")}
        </div>
        {!isExtracting && (
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 16 }}>Drag & drop PDF files here, or click to browse</div>
        )}
        <label style={{
          display: "inline-block", padding: "10px 28px", borderRadius: 6,
          background: isExtracting ? "#e5e7eb" : "#c20017", color: isExtracting ? "#9ca3af" : "#fff",
          fontSize: 14, fontWeight: 600, cursor: isExtracting ? "not-allowed" : "pointer",
        }}>
          {isExtracting ? "Processing..." : "Choose Files"}
          <input type="file" accept=".pdf,application/pdf" multiple onChange={(e) => handleFiles(e.target.files)}
            disabled={isExtracting} style={{ display: "none" }} />
        </label>
        <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 12 }}>Supported: PDF files</div>

        {/* Status Message */}
        {status && (
          <div style={{
            marginTop: 16, textAlign: "left", padding: "10px 14px", borderRadius: 6, fontSize: 11,
            background: status.type === "error" ? "#fef2f2" : status.type === "success" ? "#f0fdf4" : status.type === "warning" ? "#fef3c7" : "#eff6ff",
            border: `1px solid ${status.type === "error" ? "#fecaca" : status.type === "success" ? "#bbf7d0" : status.type === "warning" ? "#fde68a" : "#bfdbfe"}`,
            color: status.type === "error" ? "#dc2626" : status.type === "success" ? "#16a34a" : status.type === "warning" ? "#d97706" : "#1e40af",
          }}>
            {status.type === "error" ? "❌ " : status.type === "success" ? "✓ " : status.type === "warning" ? "⚠ " : "ℹ "}
            {status.message}
          </div>
        )}
      </div>

      {/* Existing Projects */}
      {projects.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Existing Projects ({projects.length})</div>
          <div style={{ display: "grid", gap: 8 }}>
            {projects.map((proj) => (
              <button key={proj.id} onClick={() => onOpen(proj.id)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", textAlign: "left", width: "100%" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#c20017"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb"; }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>{proj.metadata.projectName}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                    {proj.metadata.customerName} {proj.metadata.quoteNumber ? `| ${proj.metadata.quoteNumber}` : ""} | {proj.lineItems.length} line items
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "#c20017", fontWeight: 600 }}>Open &rarr;</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual Creation */}
      {!showManual ? (
        <div style={{ textAlign: "center" }}>
          <button onClick={() => setShowManual(true)}
            style={{ fontSize: 12, color: "#6b7280", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
            Or create project manually
          </button>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1f2937", marginBottom: 12 }}>Create New Project</div>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 3 }}>Project Name *</label>
              <input value={form.projectName} onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
                placeholder="e.g. NTPC Flow Measurement System" style={{ width: "100%", padding: "8px 10px", borderRadius: 5, border: "1px solid #d1d5db", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 3 }}>Customer / Client Name *</label>
              <input value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                placeholder="e.g. NTPC Limited" style={{ width: "100%", padding: "8px 10px", borderRadius: 5, border: "1px solid #d1d5db", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 3 }}>SO / QTN Number</label>
              <input value={form.quoteNumber} onChange={(e) => setForm((f) => ({ ...f, quoteNumber: e.target.value }))}
                placeholder="e.g. QTN-2024-001" style={{ width: "100%", padding: "8px 10px", borderRadius: 5, border: "1px solid #d1d5db", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={() => {
                if (!form.projectName.trim() || !form.customerName.trim()) return;
                onCreate({ projectName: form.projectName.trim(), customerName: form.customerName.trim(), quoteNumber: form.quoteNumber.trim(), endClientName: form.customerName.trim() });
                setShowManual(false); setForm({ projectName: "", customerName: "", quoteNumber: "" });
              }} style={{ padding: "8px 20px", borderRadius: 5, border: "none", background: "#c20017", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Create Project</button>
              <button onClick={() => setShowManual(false)} style={{ padding: "8px 20px", borderRadius: 5, border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
