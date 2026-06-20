/**
 * Model Selector Guide Panel
 * Generates professional, client-ready Model Selection Guide PDFs per product family.
 * Master Prompt Sections 1-22.
 */

import { useState, useRef } from "react";
import { generateModelSelectorGuide, getAvailableProductFamilies } from "../data/modelSelectorGuideEngine";

const FAMILIES = getAvailableProductFamilies();

export default function ModelSelectorGuidePanel() {
  const [selectedFamily, setSelectedFamily] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleGenerate = () => {
    if (!selectedFamily) return;
    setIsGenerating(true);

    // Small delay to show loading state
    setTimeout(() => {
      try {
        const html = generateModelSelectorGuide(selectedFamily);
        setPreviewHtml(html);
      } catch (e) {
        console.error("Guide generation failed:", e);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  const handleDownload = () => {
    if (!previewHtml || !selectedFamily) return;
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Flowtech_${selectedFamily.replace(/\s+/g, "_")}_Model_Selection_Guide.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.print();
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: 700, color: "#1f2937" }}>
          Model Selector Guide Generator
        </h2>
        <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
          Generate professional, client-ready model selection guides from approved Flowtech data.
          Suitable for circulation to clients, dealers, distributors, and internal teams.
        </p>
      </div>

      {/* Family Selection */}
      <div style={{
        background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb",
        padding: "20px", marginBottom: "20px",
      }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "250px" }}>
            <label style={{ fontSize: "12px", color: "#6b7280", display: "block", marginBottom: "6px", fontWeight: 500 }}>
              Select Product Family
            </label>
            <select
              value={selectedFamily}
              onChange={(e) => { setSelectedFamily(e.target.value); setPreviewHtml(null); }}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #d1d5db",
                fontSize: "14px", color: "#1f2937", background: "#fff",
              }}
            >
              <option value="">-- Choose a product family --</option>
              {FAMILIES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!selectedFamily || isGenerating}
            style={{
              padding: "10px 28px", borderRadius: "6px", border: "none",
              background: !selectedFamily || isGenerating ? "#e5e7eb" : "#c20017",
              color: !selectedFamily || isGenerating ? "#9ca3af" : "#fff",
              cursor: !selectedFamily || isGenerating ? "not-allowed" : "pointer",
              fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap",
            }}
          >
            {isGenerating ? "⏳ Generating..." : "Generate Guide"}
          </button>
        </div>

        {/* Available families list */}
        <div style={{ marginTop: "14px" }}>
          <span style={{ fontSize: "11px", color: "#9ca3af" }}>
            {FAMILIES.length} product families available:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
            {FAMILIES.map((f) => (
              <button
                key={f}
                onClick={() => { setSelectedFamily(f); setPreviewHtml(null); }}
                style={{
                  padding: "4px 10px", borderRadius: "4px", border: `1px solid ${selectedFamily === f ? "#c20017" : "#e5e7eb"}`,
                  background: selectedFamily === f ? "#fef2f2" : "#fff", color: selectedFamily === f ? "#c20017" : "#374151",
                  cursor: "pointer", fontSize: "11px",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Actions */}
      {previewHtml && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "12px", gap: "10px", flexWrap: "wrap",
        }}>
          <div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>
              {selectedFamily}
            </span>
            <span style={{ fontSize: "12px", color: "#6b7280", marginLeft: "10px" }}>
              Model Selection Guide
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handlePrint}
              style={{
                padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db",
                background: "#fff", color: "#374151", cursor: "pointer", fontSize: "12px",
              }}
            >
              🖨 Print / Save as PDF
            </button>
            <button
              onClick={handleDownload}
              style={{
                padding: "8px 16px", borderRadius: "6px", border: "none",
                background: "#c20017", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: 600,
              }}
            >
              ⬇ Download HTML
            </button>
          </div>
        </div>
      )}

      {/* Preview Iframe */}
      {previewHtml && (
        <div style={{
          border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden",
          background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <iframe
            ref={iframeRef}
            srcDoc={previewHtml}
            style={{ width: "100%", height: "800px", border: "none" }}
            title="Model Selector Guide Preview"
          />
        </div>
      )}

      {/* Empty state */}
      {!previewHtml && !isGenerating && (
        <div style={{
          textAlign: "center", padding: "80px 20px", color: "#9ca3af",
          border: "1px dashed #d1d5db", borderRadius: "10px", background: "#fafafa",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📘</div>
          <p style={{ fontSize: "15px", margin: "0 0 8px" }}>Select a product family to generate the guide</p>
          <p style={{ fontSize: "12px", margin: 0 }}>
            The guide includes: cover page, product overview, model comparison,
            code explanation, selection matrix, step-by-step guide, and model-wise pages.
          </p>
        </div>
      )}
    </div>
  );
}
