/**
 * TabPreview — Cover page and instrument index preview.
 * Uses shared body builders to ensure preview matches compiled output.
 */

import { useState } from "react";
import type { ProjectMetadata, ExtractedLineItem } from "../../types/shared";
import { buildCoverPageBody, buildInstrumentIndexBody } from "../../data/projectCompilationEngine";

interface Props {
  metadata: ProjectMetadata;
  lineItems: ExtractedLineItem[];
  coverForm: { projectName: string; contractorName: string; endClientName: string };
  setCoverForm: React.Dispatch<React.SetStateAction<{ projectName: string; contractorName: string; endClientName: string }>>;
  isSavingCover: boolean;
  onSaveCover: () => void;
}

export default function TabPreview({ metadata, lineItems, coverForm, setCoverForm, isSavingCover, onSaveCover }: Props) {
  const [activePreview, setActivePreview] = useState<"cover" | "index">("cover");

  const previewMetadata = {
    ...metadata,
    projectName: coverForm.projectName || metadata.projectName,
    customerName: coverForm.contractorName || metadata.customerName,
    endClientName: coverForm.endClientName || metadata.endClientName,
  };

  const coverHtml = buildCoverPageBody(previewMetadata);
  const indexHtml = buildInstrumentIndexBody(previewMetadata, lineItems);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Editable Cover Fields */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Cover Page Details (Editable)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px 16px" }}>
          <div>
            <label style={{ fontSize: 10, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 2 }}>Project Name</label>
            <input
              value={coverForm.projectName}
              onChange={(e) => setCoverForm((f) => ({ ...f, projectName: e.target.value }))}
              placeholder={metadata.projectName}
              style={{ width: "100%", padding: "6px 8px", borderRadius: 4, border: "1px solid #d1d5db", fontSize: 11, boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 2 }}>Contractor Name</label>
            <input
              value={coverForm.contractorName}
              onChange={(e) => setCoverForm((f) => ({ ...f, contractorName: e.target.value }))}
              placeholder={metadata.customerName}
              style={{ width: "100%", padding: "6px 8px", borderRadius: 4, border: "1px solid #d1d5db", fontSize: 11, boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 2 }}>End Client Name</label>
            <input
              value={coverForm.endClientName}
              onChange={(e) => setCoverForm((f) => ({ ...f, endClientName: e.target.value }))}
              placeholder={metadata.endClientName}
              style={{ width: "100%", padding: "6px 8px", borderRadius: 4, border: "1px solid #d1d5db", fontSize: 11, boxSizing: "border-box" }}
            />
          </div>
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button onClick={onSaveCover} disabled={isSavingCover}
            style={{ padding: "6px 16px", borderRadius: 4, border: "none", background: "#c20017", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            {isSavingCover ? "Saving..." : "Save to Project"}
          </button>
        </div>
      </div>

      {/* Preview Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, borderBottom: "1px solid #e5e7eb" }}>
        {(["cover", "index"] as const).map((t) => (
          <button key={t} onClick={() => setActivePreview(t)}
            style={{
              padding: "8px 16px", borderRadius: "4px 4px 0 0", border: "none",
              background: activePreview === t ? "#c20017" : "transparent",
              color: activePreview === t ? "#fff" : "#6b7280",
              fontSize: 12, fontWeight: activePreview === t ? 600 : 400,
              cursor: "pointer",
            }}>
            {t === "cover" ? "Cover Page" : "Instrument Index"}
          </button>
        ))}
      </div>

      {/* Preview Frame */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
        <iframe
          title={`preview-${activePreview}`}
          srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
            @page { size: A4; margin: 10mm; }
            body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1f2937; font-size: 10px; line-height: 1.45; }
            .page { padding: 10mm; }
            .cover { background: #fff; height: 100vh; display: flex; flex-direction: column; justify-content: space-between; padding: 0; border: 8px solid #c20017; }
            .cover-top { text-align: center; padding: 40px 40px 0; }
            .cover-top img { max-height: 70px; margin-bottom: 8px; }
            .cover-top .brand { font-size: 11px; color: #6b7280; letter-spacing: 2px; font-weight: 600; }
            .cover-center { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 20px 60px; }
            .cover-center .doc-title { font-size: 13px; color: #c20017; letter-spacing: 3px; text-transform: uppercase; font-weight: 600; margin-bottom: 12px; }
            .cover-center h1 { font-size: 26px; font-weight: 700; color: #1f2937; margin: 0 0 8px; line-height: 1.3; }
            .cover-center .subtitle { font-size: 13px; color: #6b7280; font-weight: 400; margin-bottom: 30px; }
            .cover-center .meta-box { border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 16px 40px; width: 100%; max-width: 500px; }
            .cover-center .meta-box .row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 10px; border-bottom: 1px solid #f3f4f6; }
            .cover-center .meta-box .row:last-child { border-bottom: none; }
            .cover-center .meta-box .label { color: #9ca3af; font-weight: 500; }
            .cover-center .meta-box .value { color: #374151; font-weight: 600; }
            .cover-bottom { text-align: center; padding: 0 40px 30px; }
            .cover-bottom .footer-line { border-top: 2px solid #c20017; padding-top: 12px; }
            .cover-bottom .footer-text { font-size: 8px; color: #9ca3af; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            th, td { padding: 5px 8px; border: 1px solid #d1d5db; font-size: 10px; text-align: left; }
            th { background: #f9fafb; font-weight: 600; color: #374151; }
            h2 { font-size: 14px; color: #c20017; border-bottom: 2px solid #c20017; padding-bottom: 3px; margin: 14px 0 8px; }
            h3 { font-size: 11px; color: #374151; margin: 10px 0 5px; }
            .footer { text-align: center; font-size: 8px; color: #9ca3af; margin-top: 12px; padding-top: 6px; border-top: 1px solid #e5e7eb; }
          </style></head><body>${activePreview === "cover" ? coverHtml : `<div class="page">${indexHtml}</div>`}</body></html>`}
          style={{ width: "100%", height: 700, border: "none" }}
        />
      </div>
    </div>
  );
}
