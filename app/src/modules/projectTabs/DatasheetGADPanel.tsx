/**
 * DatasheetGADPanel — Generate datasheets and link GADs per line item.
 * Fixed: Buttons clearly visible, no sizing block, visible status area.
 * Added: GAD selection dropdown from Document Master.
 */
import { useState, useCallback, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { generateSingleLineItemDatasheet } from "../../data/generateProjectDatasheet";
import { getDrawingsForFamily } from "../../data/gaDrawingLookup";
import type { GaDrawingEntry } from "../../data/gaDrawingTypes";
import type { ExtractedLineItem } from "../../types/shared";

function requiresSizing(family: string): boolean {
  const f = family.toLowerCase();
  return f.includes("flowmeter") || f.includes("flow meter") || f.includes("rotameter");
}

interface GADOption {
  drawing: GaDrawingEntry;
  dataUrl: string;
}

export default function DatasheetGADPanel() {
  const { state, dispatch, notify } = useAppContext();
  const currentProject = state.currentProject!;
  const li = currentProject.lineItems;
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [lastResult, setLastResult] = useState<{ message: string; type: "success" | "error" | null }>({ message: "", type: null });
  const [gadOptionsMap, setGadOptionsMap] = useState<Record<string, GADOption[]>>({});
  const [loadingGadMap, setLoadingGadMap] = useState<Record<string, boolean>>({});

  const generateOne = useCallback(async (lineItemId: string) => {
    setLastResult({ message: "", type: null });
    const lineItem = li.find((l) => l.id === lineItemId);
    if (!lineItem) {
      setLastResult({ message: "Line item not found", type: "error" });
      return;
    }
    setGeneratingId(lineItemId);
    try {
      console.log("[Datasheet] Generating for", lineItem.tagNumber, lineItem.productFamily);
      const result = await generateSingleLineItemDatasheet(
        lineItem,
        currentProject.metadata,
        currentProject.metadata.quoteNumber || currentProject.id,
        0
      );
      console.log("[Datasheet] Generated:", result.html.length, "chars");
      dispatch({
        type: "UPDATE_LINE_ITEM",
        item: { id: lineItemId, datasheetHtml: result.html },
      });
      setLastResult({ message: `Datasheet generated for ${lineItem.tagNumber || lineItemId}`, type: "success" });
      notify("success", `Datasheet generated`, lineItem.tagNumber);
    } catch (e: any) {
      console.error("[Datasheet] FAILED:", e);
      const msg = e?.message || String(e);
      setLastResult({ message: `Failed: ${msg}`, type: "error" });
      notify("error", "Generation failed", msg);
    }
    setGeneratingId(null);
  }, [li, currentProject, dispatch, notify]);

  const generateAll = useCallback(async () => {
    if (li.length === 0) { notify("warning", "No line items"); return; }
    setGeneratingAll(true);
    setLastResult({ message: `Generating ${li.length} datasheets...`, type: null });
    let ok = 0, fail = 0;
    for (const item of li) {
      setGeneratingId(item.id);
      try {
        const result = await generateSingleLineItemDatasheet(
          item,
          currentProject.metadata,
          currentProject.metadata.quoteNumber || currentProject.id,
          0
        );
        dispatch({ type: "UPDATE_LINE_ITEM", item: { id: item.id, datasheetHtml: result.html } });
        ok++;
      } catch (e: any) {
        console.error("[Datasheet] Failed for", item.tagNumber, e);
        fail++;
      }
    }
    setGeneratingId(null);
    setGeneratingAll(false);
    setLastResult({ message: `${ok} generated${fail > 0 ? `, ${fail} failed` : ""}`, type: fail > 0 ? "error" : "success" });
    notify("success", `${ok} datasheets generated${fail > 0 ? `, ${fail} failed` : ""}`);
  }, [li, currentProject, dispatch, notify]);

  // ─── Custom Dimensions Editor ─────────────────────────────────
  function CustomDimEditor({ item }: { item: ExtractedLineItem }) {
    const [isOpen, setIsOpen] = useState(false);
    const rows = item.customDimensions || [];
    const filledCount = rows.filter((r) => r.label || r.value).length;

    const updateRow = (index: number, field: "label" | "value", val: string) => {
      const current = item.customDimensions || [];
      const updated = [...current];
      while (updated.length < 5) updated.push({ label: "", value: "" });
      updated[index] = { ...updated[index], [field]: val };
      dispatch({ type: "UPDATE_LINE_ITEM", item: { id: item.id, customDimensions: updated } });
    };

    return (
      <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid #f3f4f6" }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            fontSize: 9, fontWeight: 600, color: filledCount > 0 ? "#16a34a" : "#6b7280",
            background: "none", border: "none", cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          {isOpen ? "▼" : "▶"} Custom Dimensions / Remarks
          {filledCount > 0 && <span style={{ fontSize: 8, color: "#16a34a", background: "#dcfce7", padding: "1px 4px", borderRadius: 3 }}>{filledCount} filled</span>}
        </button>
        {isOpen && (
          <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 8, color: "#9ca3af", fontWeight: 600 }}>
              <span>Description</span><span>Value / Dimension</span>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <input
                  type="text"
                  placeholder={`Custom dim ${i + 1}...`}
                  value={rows[i]?.label || ""}
                  onChange={(e) => updateRow(i, "label", e.target.value)}
                  style={{ fontSize: 9, padding: "4px 6px", borderRadius: 3, border: "1px solid #d1d5db" }}
                />
                <input
                  type="text"
                  placeholder="Value..."
                  value={rows[i]?.value || ""}
                  onChange={(e) => updateRow(i, "value", e.target.value)}
                  style={{ fontSize: 9, padding: "4px 6px", borderRadius: 3, border: "1px solid #d1d5db" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Load GAD options for each product family
  useEffect(() => {
    const loadGadOptions = async () => {
      for (const item of li) {
        if (gadOptionsMap[item.productFamily]) continue; // Already loaded
        setLoadingGadMap(prev => ({ ...prev, [item.productFamily]: true }));
        try {
          const options = await getDrawingsForFamily(item.productFamily);
          setGadOptionsMap(prev => ({ ...prev, [item.productFamily]: options }));
        } catch (e) {
          console.warn("[GAD] Failed to load drawings for:", item.productFamily, e);
        }
        setLoadingGadMap(prev => ({ ...prev, [item.productFamily]: false }));
      }
    };
    if (li.length > 0) loadGadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [li.map(i => i.productFamily).join(",")]);

  const handleSelectGad = useCallback((lineItemId: string, drawingId: string) => {
    dispatch({
      type: "UPDATE_LINE_ITEM",
      item: { id: lineItemId, gadDrawingId: drawingId || undefined },
    });
    setLastResult({ message: `GAD ${drawingId ? "assigned" : "cleared"}`, type: "success" });
  }, [dispatch]);

  const downloadOne = useCallback((html: string, tag: string) => {
    try {
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Datasheet_${tag || "item"}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setLastResult({ message: `Download failed: ${e.message}`, type: "error" });
    }
  }, []);

  // Visible status display
  const StatusBox = () => lastResult.message ? (
    <div style={{
      marginBottom: 16, padding: "8px 12px", borderRadius: 4, fontSize: 11, fontWeight: 600,
      background: lastResult.type === "error" ? "#fee2e2" : lastResult.type === "success" ? "#dcfce7" : "#eff6ff",
      border: `1px solid ${lastResult.type === "error" ? "#fecaca" : lastResult.type === "success" ? "#bbf7d0" : "#bfdbfe"}`,
      color: lastResult.type === "error" ? "#dc2626" : lastResult.type === "success" ? "#16a34a" : "#1e40af",
    }}>
      {lastResult.type === "error" ? "❌ " : lastResult.type === "success" ? "✓ " : "ℹ "}
      {lastResult.message}
    </div>
  ) : null;

  if (li.length === 0) {
    return <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>No line items. Upload and extract documents first.</div>;
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <StatusBox />

      {/* Generate All */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <button
          onClick={generateAll}
          disabled={generatingAll}
          style={{
            padding: "8px 20px", borderRadius: 5, border: "2px solid #c20017",
            background: generatingAll ? "#e5e7eb" : "#c20017", color: "#fff",
            fontSize: 12, fontWeight: 700, cursor: generatingAll ? "not-allowed" : "pointer",
          }}
        >
          {generatingAll ? "Generating All..." : `Generate All (${li.length})`}
        </button>
        <span style={{ fontSize: 10, color: "#6b7280" }}>
          {li.filter((l) => l.datasheetHtml).length} of {li.length} already generated
        </span>
      </div>

      {/* Line Item List */}
      <div style={{ display: "grid", gap: 6 }}>
        {li.map((item) => {
          const hasDs = !!item.datasheetHtml;
          const isGen = generatingId === item.id;
          const needsSize = requiresSizing(item.productFamily) && !item.sizingResult;
          const gadOptions = gadOptionsMap[item.productFamily] || [];
          const isLoadingGad = loadingGadMap[item.productFamily];
          const hasGad = !!item.gadDrawingId;
          return (
            <div key={item.id} style={{
              padding: "10px 12px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#1f2937" }}>{item.tagNumber || "—"}</span>
                  <span style={{ fontSize: 10, color: "#6b7280" }}>{item.productFamily}</span>
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>Q{item.quantity}</span>
                  {hasDs && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#dcfce7", color: "#16a34a", fontWeight: 600 }}>✓ DS</span>}
                  {hasGad && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#dbeafe", color: "#2563eb", fontWeight: 600 }}>✓ GAD</span>}
                  {needsSize && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#fef3c7", color: "#d97706", fontWeight: 600 }}>no sizing</span>}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {!hasDs ? (
                    <button
                      onClick={() => generateOne(item.id)}
                      disabled={isGen || generatingAll}
                      style={{
                        padding: "5px 12px", borderRadius: 4, border: "1px solid #c20017",
                        background: "#c20017", color: "#fff",
                        fontSize: 10, fontWeight: 600, cursor: (isGen || generatingAll) ? "not-allowed" : "pointer",
                        opacity: (isGen || generatingAll) ? 0.5 : 1,
                      }}
                    >
                      {isGen ? "..." : "Generate"}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => downloadOne(item.datasheetHtml!, item.tagNumber || item.id)}
                        style={{
                          padding: "5px 12px", borderRadius: 4, border: "1px solid #16a34a",
                          background: "#fff", color: "#16a34a",
                          fontSize: 10, fontWeight: 600, cursor: "pointer",
                        }}
                      >
                        Download
                      </button>
                      <button
                        onClick={() => generateOne(item.id)}
                        disabled={isGen || generatingAll}
                        style={{
                          padding: "5px 12px", borderRadius: 4, border: "1px solid #d1d5db",
                          background: "#fff", color: "#374151",
                          fontSize: 10, cursor: (isGen || generatingAll) ? "not-allowed" : "pointer",
                          opacity: (isGen || generatingAll) ? 0.5 : 1,
                        }}
                      >
                        {isGen ? "..." : "Regenerate"}
                      </button>
                    </>
                  )}
                </div>
              </div>
              {/* GAD Selection Row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 6, borderTop: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 9, color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}>GA Drawing:</span>
                {isLoadingGad ? (
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>Loading...</span>
                ) : gadOptions.length > 0 ? (
                  <select
                    value={item.gadDrawingId || ""}
                    onChange={(e) => handleSelectGad(item.id, e.target.value)}
                    style={{
                      fontSize: 9, padding: "3px 6px", borderRadius: 3, border: "1px solid #d1d5db",
                      color: item.gadDrawingId ? "#2563eb" : "#6b7280", background: "#fff",
                      maxWidth: 300, flex: 1,
                    }}
                  >
                    <option value="">-- Select GAD --</option>
                    {gadOptions.map((opt) => (
                      <option key={opt.drawing.id} value={opt.drawing.id}>
                        {opt.drawing.drawingNo} — {opt.drawing.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>
                    No GADs in Document Master
                    {item.gadDrawingId && ` (ID: ${item.gadDrawingId})`}
                  </span>
                )}
                {hasGad && (
                  <button
                    onClick={() => handleSelectGad(item.id, "")}
                    style={{
                      fontSize: 8, padding: "2px 6px", borderRadius: 3, border: "1px solid #d1d5db",
                      background: "#fff", color: "#9ca3af", cursor: "pointer",
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
              {/* Custom Dimensions Editor */}
              <CustomDimEditor item={item} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
