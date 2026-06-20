/**
 * Tab 9: QAP Master Mapping
 * Product-family-wise QAP mapping from QAP Master.
 * Per master prompt Section 12.
 */

import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { QAP_MASTER_MAP, QAP_PRODUCT_LABELS, hasQapMaster } from "../../data/qapMasterData";

export default function QAPMasterPanel() {
  const { state, notify } = useAppContext();
  const { currentProject } = state;

  if (!currentProject) return null;

  // Group line items by product family and find QAP
  const familyGroups = useMemo(() => {
    const groups: Record<string, {
      family: string;
      label: string;
      lineItems: typeof currentProject.lineItems;
      hasQap: boolean;
      qapDocNo: string;
      qapTitle: string;
      qapRev: string;
    }> = {};

    for (const li of currentProject.lineItems) {
      // Map product family name to QAP family key
      const pfl = li.productFamily.toLowerCase();

      // Special case: By-Pass Rotameter must NOT match as Glass Tube Rotameter
      // Check for bypass keywords FIRST before general rotameter matching
      let familyKey: string | undefined;
      if (pfl.includes("by-pass") || pfl.includes("by pass") || pfl.includes("bypass")) {
        // This is a bypass rotameter — find the bypass_rotameter entry
        familyKey = Object.entries(QAP_PRODUCT_LABELS).find(
          ([key]) => key === "bypass_rotameter"
        )?.[0];
      }

      // General fuzzy matching (only if bypass didn't match)
      if (!familyKey) {
        familyKey = Object.entries(QAP_PRODUCT_LABELS).find(
          ([key, label]) => {
            // Prevent rotameter from matching bypass names
            if (key === "rotameter" && (pfl.includes("by-pass") || pfl.includes("by pass") || pfl.includes("bypass"))) {
              return false;
            }
            return label.toLowerCase().includes(pfl) || pfl.includes(label.toLowerCase().split(" ")[0]);
          }
        )?.[0];
      }

      const key = familyKey || li.productFamily;
      if (!groups[key]) {
        const hasQap = familyKey ? hasQapMaster(familyKey) : false;
        const qapEntry = hasQap && familyKey ? QAP_MASTER_MAP[familyKey as keyof typeof QAP_MASTER_MAP] : null;
        groups[key] = {
          family: key,
          label: QAP_PRODUCT_LABELS[familyKey as keyof typeof QAP_PRODUCT_LABELS] || li.productFamily,
          lineItems: [],
          hasQap,
          qapDocNo: qapEntry?.docNo || "",
          qapTitle: qapEntry?.title || "",
          qapRev: qapEntry?.revNo || "",
        };
      }
      groups[key].lineItems.push(li);
    }

    return Object.values(groups);
  }, [currentProject.lineItems]);

  const qapFound = familyGroups.filter((g) => g.hasQap).length;
  const qapMissing = familyGroups.filter((g) => !g.hasQap).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#1f2937" }}>QAP Master Mapping</h3>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
            {qapFound} product famil{qapFound !== 1 ? "ies" : "y"} mapped · {qapMissing} missing
          </p>
        </div>
      </div>

      {familyGroups.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#9ca3af", border: "1px dashed #d1d5db", borderRadius: "10px" }}>
          <div style={{ fontSize: "36px" }}>📋</div>
          <p>No line items to map QAP for</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {familyGroups.map((group) => (
            <div
              key={group.family}
              style={{
                padding: "14px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff",
                borderLeft: `3px solid ${group.hasQap ? "#16a34a" : "#dc2626"}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>{group.label}</span>
                  <span style={{ fontSize: "11px", color: "#6b7280", marginLeft: "10px" }}>
                    {group.lineItems.length} line item{group.lineItems.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {group.hasQap ? (
                  <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "8px", background: "#ecfdf5", color: "#16a34a", fontWeight: 600 }}>
                    ✓ QAP Found
                  </span>
                ) : (
                  <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "8px", background: "#fef2f2", color: "#dc2626", fontWeight: 600 }}>
                    ✗ Missing
                  </span>
                )}
              </div>

              {/* Line items in this group */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                {group.lineItems.map((li) => (
                  <span key={li.id} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: "#f3f4f6", color: "#374151" }}>
                    {li.lineItemNo} · {li.tagNumber} · {li.size}
                  </span>
                ))}
              </div>

              {group.hasQap ? (
                <div style={{ padding: "8px 12px", background: "#f9fafb", borderRadius: "4px", fontSize: "11px" }}>
                  <span style={{ color: "#6b7280" }}>QAP Doc:</span> <strong style={{ color: "#374151" }}>{group.qapDocNo}</strong>
                  <span style={{ color: "#9ca3af", margin: "0 8px" }}>·</span>
                  <span style={{ color: "#6b7280" }}>Title:</span> <strong style={{ color: "#374151" }}>{group.qapTitle}</strong>
                  <span style={{ color: "#9ca3af", margin: "0 8px" }}>·</span>
                  <span style={{ color: "#6b7280" }}>Rev:</span> <strong style={{ color: "#374151" }}>{group.qapRev}</strong>
                </div>
              ) : (
                <div style={{ padding: "8px 12px", background: "#fef2f2", borderRadius: "4px", fontSize: "11px", color: "#dc2626" }}>
                  <strong>Approved QAP not found in QAP Master for this product family.</strong>
                  <br />
                  Please upload or map an approved QAP before final report generation.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
