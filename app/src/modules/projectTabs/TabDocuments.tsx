/**
 * TabDocuments — Document upload and extraction.
 * This is the CRITICAL component for uploading SO/QTN PDFs.
 */

import { useState } from "react";
import type { DocumentProject } from "../../types/shared";

interface Props {
  project: DocumentProject;
  isExtracting: boolean;
  onExtract: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TabDocuments({ project, isExtracting, onExtract, onFileSelect }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const docs = project.uploadedDocuments;
  const pendingDocs = docs.filter((d) => d.extractionStatus === "pending");
  const completedDocs = docs.filter((d) => d.extractionStatus === "completed");
  const failedDocs = docs.filter((d) => d.extractionStatus === "failed");

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString("en-GB");
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const files = e.dataTransfer.files; if (files.length > 0) { const dt = new DataTransfer(); for (const f of files) dt.items.add(f); const input = document.createElement("input"); input.type = "file"; input.files = dt.files; onFileSelect({ target: input } as any); } }}
        style={{
          border: `2px dashed ${dragOver ? "#c20017" : "#d1d5db"}`,
          borderRadius: 10,
          padding: "40px 20px",
          textAlign: "center",
          background: dragOver ? "#fef2f2" : "#fafafa",
          transition: "all 0.2s",
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>📤</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
          {dragOver ? "Drop files here" : "Upload SO / QTN Documents"}
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>
          Drag & drop PDF files here, or click to browse
        </div>
        <label style={{
          display: "inline-block", padding: "8px 20px", borderRadius: 5,
          background: "#c20017", color: "#fff", fontSize: 13, fontWeight: 600,
          cursor: "pointer",
        }}>
          Choose Files
          <input
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={onFileSelect}
            style={{ display: "none" }}
          />
        </label>
        <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 10 }}>Supported: PDF files</div>
      </div>

      {/* Stats */}
      {docs.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { label: "Total", value: docs.length, color: "#374151" },
            { label: "Pending", value: pendingDocs.length, color: "#d97706" },
            { label: "Extracted", value: completedDocs.length, color: "#16a34a" },
            { label: "Failed", value: failedDocs.length, color: "#dc2626" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase" }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Document List */}
      {docs.length > 0 && (
        <div style={{ display: "grid", gap: 8 }}>
          {docs.map((doc) => {
            const statusColors: Record<string, { bg: string; fg: string }> = {
              pending: { bg: "#fef3c7", fg: "#d97706" },
              processing: { bg: "#dbeafe", fg: "#2563eb" },
              completed: { bg: "#dcfce7", fg: "#16a34a" },
              failed: { bg: "#fee2e2", fg: "#dc2626" },
            };
            const sc = statusColors[doc.extractionStatus] || statusColors.pending;
            return (
              <div key={doc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📄</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#1f2937" }}>{doc.name}</div>
                    <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{formatSize(doc.fileSize)} | {formatDate(doc.uploadDate)}</div>
                  </div>
                </div>
                <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 3, background: sc.bg, color: sc.fg, fontWeight: 600, textTransform: "uppercase" }}>
                  {doc.extractionStatus}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Extract Button */}
      {pendingDocs.length > 0 && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button
            onClick={onExtract}
            disabled={isExtracting}
            style={{
              padding: "10px 32px", borderRadius: 6, border: "none",
              background: isExtracting ? "#e5e7eb" : "#c20017",
              color: isExtracting ? "#9ca3af" : "#fff",
              fontSize: 14, fontWeight: 600, cursor: isExtracting ? "not-allowed" : "pointer",
            }}
          >
            {isExtracting ? "Extracting..." : `Extract Line Items (${pendingDocs.length} document${pendingDocs.length > 1 ? "s" : ""})`}
          </button>
        </div>
      )}

      {docs.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af", fontSize: 13 }}>
          No documents uploaded yet. Use the upload area above to add SO/QTN PDF files.
        </div>
      )}
    </div>
  );
}
