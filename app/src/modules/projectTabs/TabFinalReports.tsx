/**
 * TabFinalReports — Compile and download master report and sizing report.
 * Fixed: Visible status display, buttons never hidden, clear labels.
 */
import { useState } from "react";
import type { DocumentProject } from "../../types/shared";

interface Props {
  onCompile: () => void;
  isCompiling: boolean;
  compiledHtml: string | null;
  compileStats: any;
  sizingReportHtml: string | null;
  isCompilingSizing: boolean;
  onCompileSizing: () => void;
  onDownload: (html: string, filename: string) => void;
  project: DocumentProject;
  compileResult?: { message: string; type: "success" | "error" | null } | null;
}

export default function TabFinalReports({
  onCompile, isCompiling, compiledHtml, compileStats,
  sizingReportHtml, isCompilingSizing, onCompileSizing, onDownload, project,
  compileResult,
}: Props) {
  const [activePreview, setActivePreview] = useState<"master" | "sizing" | null>(null);

  const li = project.lineItems;
  const sizedCount = li.filter((i) => i.sizingResult).length;
  const withDatasheet = li.filter((i) => i.datasheetHtml).length;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Status Summary */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>Final Reports</div>
        <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap", fontSize: 11 }}>
          <span><strong>Line Items:</strong> {li.length}</span>
          <span><strong>Sized:</strong> {sizedCount}</span>
          <span><strong>Datasheets:</strong> {withDatasheet}</span>
          {compiledHtml && <span style={{ color: "#16a34a", fontWeight: 600 }}>✓ Master compiled</span>}
          {sizingReportHtml && <span style={{ color: "#2563eb", fontWeight: 600 }}>✓ Sizing compiled</span>}
        </div>
      </div>

      {/* Master Report */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Master Technical Document</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 12 }}>Cover + Index + QAP + Datasheet + GAD</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={onCompile} disabled={isCompiling || li.length === 0}
            style={{
              padding: "8px 20px", borderRadius: 5, border: "none",
              background: isCompiling || li.length === 0 ? "#e5e7eb" : "#c20017",
              color: isCompiling || li.length === 0 ? "#9ca3af" : "#fff",
              fontSize: 12, fontWeight: 700, cursor: isCompiling || li.length === 0 ? "not-allowed" : "pointer",
            }}>
            {isCompiling ? "Compiling..." : "Compile Master Report"}
          </button>
          {compiledHtml && (
            <>
              <button onClick={() => setActivePreview(activePreview === "master" ? null : "master")}
                style={{ padding: "8px 16px", borderRadius: 5, border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontSize: 12, cursor: "pointer" }}>
                {activePreview === "master" ? "Hide Preview" : "Preview"}
              </button>
              <button onClick={() => onDownload(compiledHtml, `${project.metadata.projectName}_Master_Report.html`)}
                style={{ padding: "8px 16px", borderRadius: 5, border: "1px solid #16a34a", background: "#fff", color: "#16a34a", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Download HTML
              </button>
            </>
          )}
        </div>
        {isCompiling && <div style={{ marginTop: 8, fontSize: 10, color: "#6b7280" }}>Compiling... please wait</div>}
        {compileResult?.message && (
          <div style={{
            marginTop: 8, fontSize: 10, fontWeight: 600, padding: "6px 10px", borderRadius: 4,
            background: compileResult.type === "error" ? "#fee2e2" : compileResult.type === "success" ? "#dcfce7" : "#f9fafb",
            color: compileResult.type === "error" ? "#dc2626" : compileResult.type === "success" ? "#16a34a" : "#6b7280",
            border: `1px solid ${compileResult.type === "error" ? "#fecaca" : compileResult.type === "success" ? "#bbf7d0" : "#e5e7eb"}`,
          }}>
            {compileResult.type === "error" ? "❌ " : compileResult.type === "success" ? "✓ " : "ℹ "}
            {compileResult.message}
          </div>
        )}
        {compileStats && (
          <div style={{ marginTop: 8, fontSize: 10, color: "#6b7280", background: "#f9fafb", padding: "6px 10px", borderRadius: 4 }}>
            Last compile: {compileStats.sections} sections | {compileStats.li} items | {compileStats.qap} QAP families
          </div>
        )}
        {!compiledHtml && !isCompiling && !compileResult?.message && (
          <div style={{ marginTop: 8, fontSize: 10, color: "#9ca3af" }}>Click "Compile" to generate the master report</div>
        )}
        {activePreview === "master" && compiledHtml && (
          <div style={{ marginTop: 12 }}>
            <iframe title="master-preview" srcDoc={compiledHtml} style={{ width: "100%", height: 600, border: "1px solid #e5e7eb", borderRadius: 4 }} />
          </div>
        )}
      </div>

      {/* Sizing Report */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Standalone Sizing Report</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 12 }}>Separate sizing report per line item</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={onCompileSizing} disabled={isCompilingSizing}
            style={{
              padding: "8px 20px", borderRadius: 5, border: "none",
              background: isCompilingSizing ? "#e5e7eb" : "#2563eb",
              color: isCompilingSizing ? "#9ca3af" : "#fff",
              fontSize: 12, fontWeight: 700, cursor: isCompilingSizing ? "not-allowed" : "pointer",
            }}>
            {isCompilingSizing ? "Compiling..." : sizedCount === 0 ? "Compile (no sized items)" : "Compile Sizing Report"}
          </button>
          {sizingReportHtml && (
            <>
              <button onClick={() => setActivePreview(activePreview === "sizing" ? null : "sizing")}
                style={{ padding: "8px 16px", borderRadius: 5, border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontSize: 12, cursor: "pointer" }}>
                {activePreview === "sizing" ? "Hide Preview" : "Preview"}
              </button>
              <button onClick={() => onDownload(sizingReportHtml, `${project.metadata.projectName}_Sizing_Report.html`)}
                style={{ padding: "8px 16px", borderRadius: 5, border: "1px solid #2563eb", background: "#fff", color: "#2563eb", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Download HTML
              </button>
            </>
          )}
        </div>
        {isCompilingSizing && <div style={{ marginTop: 8, fontSize: 10, color: "#6b7280" }}>Compiling sizing report...</div>}
        {sizedCount === 0 && !isCompilingSizing && !sizingReportHtml && (
          <div style={{ marginTop: 8, fontSize: 10, color: "#d97706" }}>⚠ No flow devices sized yet. Size flow devices in Line Items tab first.</div>
        )}
        {!sizingReportHtml && sizedCount > 0 && !isCompilingSizing && (
          <div style={{ marginTop: 8, fontSize: 10, color: "#9ca3af" }}>Click "Compile" to generate the sizing report</div>
        )}
        {activePreview === "sizing" && sizingReportHtml && (
          <div style={{ marginTop: 12 }}>
            <iframe title="sizing-preview" srcDoc={sizingReportHtml} style={{ width: "100%", height: 600, border: "1px solid #e5e7eb", borderRadius: 4 }} />
          </div>
        )}
      </div>

      {/* What's Included */}
      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>What's Included</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", fontSize: 11, color: "#4b5563" }}>
          <div>✓ Cover Page (editable)</div>
          <div>✓ Instrument Index</div>
          <div>✓ Instrument Summary Table</div>
          <div>✓ QAP per Product Family</div>
          <div>✓ Datasheet per Line Item</div>
          <div>✓ GAD Drawing per Line Item</div>
          <div>✓ Sizing Report (separate)</div>
        </div>
      </div>
    </div>
  );
}
