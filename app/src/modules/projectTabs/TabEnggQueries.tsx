/**
 * TabEnggQueries — Shows a summary of all engineering queries across line items.
 * Detailed query resolution is now inline in the Line Items tab.
 */

import type { ExtractedLineItem } from "../../types/shared";

interface Props {
  lineItems: ExtractedLineItem[];
}

export default function TabEnggQueries({ lineItems }: Props) {
  const itemsWithQueries = lineItems.filter((li) => li.engineeringReview && li.engineeringReview.queries.length > 0);
  const totalQueries = itemsWithQueries.reduce((sum, li) => sum + (li.engineeringReview?.queries.length || 0), 0);
  const criticalQueries = itemsWithQueries.reduce((sum, li) => sum + (li.engineeringReview?.queries.filter((q) => q.severity === "critical").length || 0), 0);

  if (totalQueries === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", color: "#16a34a", fontSize: 13 }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
        <div style={{ fontWeight: 600 }}>All Clear</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>No engineering queries pending. Go to Line Items tab to resolve any future queries inline.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", marginBottom: 4 }}>Engineering Queries Summary</div>
        <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
          <div><span style={{ fontSize: 18, fontWeight: 700, color: "#dc2626" }}>{totalQueries}</span> <span style={{ fontSize: 10, color: "#6b7280" }}>TOTAL QUERIES</span></div>
          <div><span style={{ fontSize: 18, fontWeight: 700, color: "#dc2626" }}>{criticalQueries}</span> <span style={{ fontSize: 10, color: "#6b7280" }}>CRITICAL</span></div>
          <div><span style={{ fontSize: 18, fontWeight: 700, color: "#d97706" }}>{itemsWithQueries.length}</span> <span style={{ fontSize: 10, color: "#6b7280" }}>LINE ITEMS AFFECTED</span></div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10, padding: "8px 12px", background: "#eff6ff", borderRadius: 6 }}>
        💡 <strong>Tip:</strong> Queries are resolved inline in the <strong>Line Items</strong> tab. Expand a line item to see and resolve its queries with input fields.
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {itemsWithQueries.map((li) => (
          <div key={li.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#1f2937" }}>{li.tagNumber || "—"}</span>
              <span style={{ fontSize: 10, color: "#6b7280" }}>{li.productFamily}</span>
              <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#fef3c7", color: "#d97706", fontWeight: 600 }}>
                {li.engineeringReview!.queries.length} query{li.engineeringReview!.queries.length > 1 ? "ies" : "y"}
              </span>
            </div>
            <div style={{ display: "grid", gap: 4 }}>
              {li.engineeringReview!.queries.map((q, i) => (
                <div key={i} style={{ padding: "6px 8px", background: "#fef2f2", borderRadius: 4, fontSize: 11 }}>
                  <strong style={{ color: "#991b1b" }}>{q.fieldName}</strong> — {q.issue}
                  <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: q.severity === "critical" ? "#fee2e2" : "#fef3c7", color: q.severity === "critical" ? "#dc2626" : "#d97706", fontWeight: 600, marginLeft: 6 }}>{q.severity}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
