/**
 * TabOverview — Project dashboard showing stats, progress, and summary.
 */

import type { DocumentProject, ExtractedLineItem } from "../../types/shared";

interface Props {
  project: DocumentProject;
  lineItems: ExtractedLineItem[];
  validResults: { li: ExtractedLineItem; result: any }[];
  compiledHtml: string | null;
  sizingReportHtml: string | null;
  onDownload: (html: string, filename: string) => void;
}

export default function TabOverview({ project, lineItems, validResults, compiledHtml, sizingReportHtml, onDownload }: Props) {
  const li = lineItems;
  const total = li.length;
  const sized = li.filter((i) => i.sizingResult).length;
  const flowDevices = li.filter((i) => /flowmeter|flow meter|rotameter/i.test(i.productFamily)).length;
  const sizedFlow = li.filter((i) => /flowmeter|flow meter|rotameter/i.test(i.productFamily) && i.sizingResult).length;
  const withQueries = li.filter((i) => i.engineeringReview && i.engineeringReview.queries.length > 0).length;
  const queriesResolved = li.filter((i) => i.engineeringReview && i.engineeringReview.queries.length === 0).length;
  const withDatasheet = li.filter((i) => i.datasheetHtml).length;

  const statCard = (label: string, value: string | number, color: string) => (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Project Header */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 4 }}>{project.metadata.projectName}</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11, color: "#6b7280", marginTop: 8 }}>
          <span><strong>Client:</strong> {project.metadata.customerName}</span>
          <span><strong>SO/QTN:</strong> {project.metadata.quoteNumber || "—"}</span>
          <span><strong>Date:</strong> {project.metadata.date}</span>
          <span><strong>Status:</strong> <span style={{ textTransform: "capitalize" }}>{project.status.replace(/_/g, " ")}</span></span>
          <span><strong>Line Items:</strong> {total}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        {statCard("Line Items", total, "#374151")}
        {statCard("Sized", sized, "#16a34a")}
        {statCard("Flow Sized", `${sizedFlow}/${flowDevices}`, flowDevices > 0 && sizedFlow === flowDevices ? "#16a34a" : "#d97706")}
        {statCard("Queries", withQueries, "#dc2626")}
        {statCard("Resolved", queriesResolved, "#16a34a")}
        {statCard("Datasheets", withDatasheet, "#2563eb")}
      </div>

      {/* Progress */}
      {total > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Workflow Progress</div>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { label: "Upload", done: project.uploadedDocuments.length > 0 },
              { label: "Extract", done: total > 0 },
              { label: "Product Check", done: validResults.length > 0 },
              { label: "Queries", done: queriesResolved >= withQueries },
              { label: "Sizing", done: flowDevices === 0 || sizedFlow === flowDevices },
              { label: "Datasheet", done: withDatasheet === total },
              { label: "Compile", done: !!compiledHtml },
            ].map((step, i, arr) => (
              <div key={step.label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  width: "100%", height: 6, borderRadius: 3,
                  background: step.done ? "#16a34a" : "#e5e7eb",
                  marginBottom: 4,
                }} />
                <div style={{ fontSize: 9, color: step.done ? "#16a34a" : "#9ca3af", fontWeight: step.done ? 600 : 400 }}>{step.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Line Items */}
      {total > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Line Items Summary</div>
          <div style={{ display: "grid", gap: 6 }}>
            {li.slice(0, 10).map((item) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#f9fafb", borderRadius: 5, fontSize: 11 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontWeight: 600, color: "#1f2937", minWidth: 60 }}>{item.tagNumber || "—"}</span>
                  <span style={{ color: "#6b7280" }}>{item.productFamily}</span>
                  <span style={{ color: "#9ca3af", fontSize: 10 }}>Q{item.quantity}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {item.sizingResult ? (
                    <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#dcfce7", color: "#16a34a", fontWeight: 600 }}>SIZED</span>
                  ) : /flowmeter|flow meter|rotameter/i.test(item.productFamily) ? (
                    <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#fef3c7", color: "#d97706", fontWeight: 600 }}>PENDING</span>
                  ) : (
                    <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#f3f4f6", color: "#6b7280", fontWeight: 600 }}>N/A</span>
                  )}
                  {item.datasheetHtml && (
                    <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#dbeafe", color: "#2563eb", fontWeight: 600 }}>DS</span>
                  )}
                </div>
              </div>
            ))}
            {total > 10 && (
              <div style={{ textAlign: "center", fontSize: 10, color: "#9ca3af", padding: "4px 0" }}>+ {total - 10} more items</div>
            )}
          </div>
        </div>
      )}

      {/* Download Reports */}
      {(compiledHtml || sizingReportHtml) && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Generated Reports</div>
          <div style={{ display: "flex", gap: 8 }}>
            {compiledHtml && (
              <button onClick={() => onDownload(compiledHtml, `${project.metadata.projectName}_Master_Report.html`)}
                style={{ padding: "8px 16px", borderRadius: 5, border: "1px solid #c20017", background: "#fff", color: "#c20017", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Download Master Report
              </button>
            )}
            {sizingReportHtml && (
              <button onClick={() => onDownload(sizingReportHtml, `${project.metadata.projectName}_Sizing_Report.html`)}
                style={{ padding: "8px 16px", borderRadius: 5, border: "1px solid #2563eb", background: "#fff", color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Download Sizing Report
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
