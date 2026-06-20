/**
 * Tab 8: Drawing Master — GA Drawing Mapping
 * Connects to the real Drawing Master (IndexedDB via useDocumentMaster hook)
 * and allows matching/assigning GA Drawings to each line item.
 */

import { useState, useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { useDocumentMaster } from "../../hooks/useDocumentMaster";
import { PRODUCT_FAMILY_LABELS } from "../../data/masterDocumentLibrary";

// ─── Product Family Mapping ────────────────────────────────────────────
// Maps extracted product family names → Drawing Master product family keys
const EXTRACTED_TO_FAMILY_KEY: Record<string, string> = {
  // Flow Meters
  "electromagnetic flowmeter": "emf",
  "electromagnetic flow meter": "emf",
  "emf": "emf",
  "vortex flowmeter": "vortex",
  "vortex flow meter": "vortex",
  "turbine flowmeter": "turbine",
  "turbine flow meter": "turbine",
  "oval gear flowmeter": "oval_gear",
  "oval gear flow meter": "oval_gear",
  "rotameter": "rotameter",
  "glass tube rotameter": "rotameter",
  "glass tube flow meter": "rotameter",
  "metal tube rotameter": "metal_tube_rotameter",
  "acrylic body rotameter": "acrylic_body_rotameter",
  "by-pass rotameter": "bypass_rotameter",
  "bypass rotameter": "bypass_rotameter",
  "ultrasonic flowmeter": "ultrasonic",
  "ultrasonic flow meter": "ultrasonic",
  // Level Devices
  "side mounted magnetic level gauge": "magnetic_level",
  "magnetic level gauge": "magnetic_level",
  "side mounted magnetic level": "magnetic_level",
  "top mounted magnetic level gauge": "top_mounted_magnetic",
  "top mounted magnetic level": "top_mounted_magnetic",
  "reflex level gauge": "reflex_level",
  "transparent level gauge": "transparent_level",
  "tubular level gauge": "tubular_level",
  "tubular level indicator": "tubular_level",
  "float & board level gauge": "float_board_level",
  "float and board level gauge": "float_board_level",
  "float board level gauge": "float_board_level",
  "radar level transmitter": "radar_level",
  "hydrostatic level transmitter": "hydrostatic_level",
  // Pressure Transmitters
  "smart pressure transmitter": "smart_pressure",
  "differential pressure transmitter": "dp_pressure",
  "dp transmitter": "dp_pressure",
  "miniature pressure transmitter": "miniature_pressure",
  // Level Switches
  "displacer level switch": "displacer_level_switch",
  "side mounted level switch": "side_mounted_level_switch",
  "top mounted level switch": "top_mounted_level_switch",
  // Sight Glasses
  "double window sight glass": "double_window_sight_glass",
  "full view sight glass": "full_view_sight_glass",
  "allen bolt sight glass": "allen_bolt_sight_glass",
  // Others
  "orifice flange assembly": "orifice_flange_assembly",
};

export function findFamilyKey(extractedName: string): string | null {
  const key = extractedName.toLowerCase().trim();
  // Direct match
  if (EXTRACTED_TO_FAMILY_KEY[key]) return EXTRACTED_TO_FAMILY_KEY[key];

  // Special case: By-Pass Rotameter must match bypass_rotameter, NOT rotameter
  // Check for bypass keywords first before general rotameter matching
  if (key.includes("by-pass") || key.includes("by pass") || key.includes("bypass")) {
    // If it's a bypass rotameter, force bypass_rotameter
    if (key.includes("rotameter")) return "bypass_rotameter";
  }

  // Partial match — find if any key is contained in the extracted name
  for (const [extracted, familyKey] of Object.entries(EXTRACTED_TO_FAMILY_KEY)) {
    // Skip rotameter match if this is a bypass-type instrument
    if (familyKey === "rotameter" && (key.includes("by-pass") || key.includes("by pass") || key.includes("bypass"))) {
      continue;
    }
    if (key.includes(extracted) || extracted.includes(key)) {
      return familyKey;
    }
  }
  return null;
}

function getFamilyLabel(key: string): string {
  return (PRODUCT_FAMILY_LABELS as Record<string, string>)[key] || key;
}

interface LineItemGadMapping {
  lineItemId: string;
  lineItemNo: string;
  tagNumber: string;
  productFamily: string;
  familyKey: string | null;
  selectedDrawingId: string | null;
  mappedAt: number;
}

export default function DocumentMasterPanel() {
  const { state, dispatch, notify } = useAppContext();
  const { currentProject } = state;
  const docMaster = useDocumentMaster();
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);

  if (!currentProject) return null;

  // Build mappings from line items
  const mappings = useMemo(() => {
    const map: Record<string, LineItemGadMapping> = {};
    for (const li of currentProject.lineItems) {
      const familyKey = findFamilyKey(li.productFamily);
      map[li.id] = {
        lineItemId: li.id,
        lineItemNo: li.lineItemNo,
        tagNumber: li.tagNumber,
        productFamily: li.productFamily,
        familyKey,
        selectedDrawingId: (li as any).gadDrawingId || null,
        mappedAt: (li as any).gadMappedAt || 0,
      };
    }
    return map;
  }, [currentProject.lineItems]);

  const selectedMapping = selectedLineItemId ? mappings[selectedLineItemId] : null;

  // Get available GA drawings for the selected line item's product family
  const availableDrawings = useMemo(() => {
    if (!selectedMapping?.familyKey) return [];
    return docMaster.getDrawingsByProduct(selectedMapping.familyKey);
  }, [selectedMapping, docMaster]);

  // Get the currently selected drawing
  const selectedDrawing = useMemo(() => {
    if (!selectedMapping?.selectedDrawingId) return null;
    return docMaster.drawings.find((d) => d.id === selectedMapping.selectedDrawingId) || null;
  }, [selectedMapping, docMaster.drawings]);

  // Handle selecting a drawing
  const handleSelectDrawing = (drawingId: string) => {
    if (!selectedLineItemId) return;
    dispatch({
      type: "UPDATE_LINE_ITEM",
      item: {
        id: selectedLineItemId,
        gadDrawingId: drawingId,
        gadMappedAt: Date.now(),
      },
    });
    const drawing = docMaster.drawings.find((d) => d.id === drawingId);
    notify("success", "GAD assigned", `Drawing ${drawing?.drawingNo || drawingId} mapped to line item`);
  };

  // Handle clearing a drawing
  const handleClearDrawing = () => {
    if (!selectedLineItemId) return;
    dispatch({
      type: "UPDATE_LINE_ITEM",
      item: {
        id: selectedLineItemId,
        gadDrawingId: null,
        gadMappedAt: Date.now(),
      },
    });
    notify("info", "GAD cleared");
  };

  // Status helpers
  function getMappingStatus(liId: string): {
    label: string;
    color: string;
    bg: string;
    hasDrawing: boolean;
  } {
    const m = mappings[liId];
    if (!m) return { label: "Unknown", color: "#6b7280", bg: "#f3f4f6", hasDrawing: false };

    const hasSelected = !!m.selectedDrawingId;
    if (!m.familyKey) {
      return { label: "No Family Match", color: "#d97706", bg: "#fffbeb", hasDrawing: false };
    }
    const familyDrawings = docMaster.getDrawingsByProduct(m.familyKey);
    if (familyDrawings.length === 0) {
      return { label: "No GAD Uploaded", color: "#dc2626", bg: "#fef2f2", hasDrawing: false };
    }
    if (hasSelected) {
      return { label: "GAD Mapped", color: "#16a34a", bg: "#ecfdf5", hasDrawing: true };
    }
    return { label: `${familyDrawings.length} Available`, color: "#3b82f6", bg: "#eff6ff", hasDrawing: false };
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#1f2937" }}>Drawing Master — GA Drawing Mapping</h3>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
            {currentProject.lineItems.filter((li) => (li as any).gadDrawingId).length}/{currentProject.lineItems.length} line items have GA Drawings assigned
            {docMaster.drawings.length > 0 && ` · ${docMaster.drawings.length} drawings in Drawing Master`}
          </p>
        </div>
      </div>

      {currentProject.lineItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#9ca3af", border: "1px dashed #d1d5db", borderRadius: "10px" }}>
          <div style={{ fontSize: "36px" }}>📁</div>
          <p>No line items yet. Upload a document to extract line items.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Left: Line Item List */}
          <div>
            <h4 style={{ margin: "0 0 10px", fontSize: "13px", color: "#374151" }}>Line Items ({currentProject.lineItems.length})</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {currentProject.lineItems.map((li) => {
                const m = mappings[li.id];
                const st = getMappingStatus(li.id);
                const isSel = selectedLineItemId === li.id;
                return (
                  <div
                    key={li.id}
                    onClick={() => setSelectedLineItemId(li.id)}
                    style={{
                      padding: "10px 12px", borderRadius: "6px",
                      border: `1px solid ${isSel ? "#c20017" : st.hasDrawing ? "#a7f3d0" : "#e5e7eb"}`,
                      background: isSel ? "#fef2f2" : st.hasDrawing ? "#f0fdf4" : "#fff",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#1f2937" }}>
                        {li.lineItemNo} · {li.tagNumber}
                      </span>
                      <span style={{
                        fontSize: "9px", padding: "2px 6px", borderRadius: "4px",
                        background: st.bg, color: st.color, fontWeight: 600,
                      }}>{st.label}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                      {li.productFamily}
                      {m?.familyKey && (
                        <span style={{ color: "#9ca3af" }}> → {getFamilyLabel(m.familyKey)}</span>
                      )}
                      {li.size && <span style={{ color: "#9ca3af" }}> · {li.size}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Drawing Selection */}
          <div>
            {!selectedMapping ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", border: "1px dashed #d1d5db", borderRadius: "8px" }}>
                Select a line item to view and assign GA Drawings
              </div>
            ) : !selectedMapping.familyKey ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#d97706", border: "1px dashed #fcd34d", borderRadius: "8px", background: "#fffbeb" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚠️</div>
                <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 500 }}>Product family not recognized</p>
                <p style={{ margin: 0, fontSize: "11px" }}>
                  "{selectedMapping.productFamily}" does not match any product in the Drawing Master.
                  <br />Upload drawings in <strong>Documents → Drawing Master</strong> for this product family.
                </p>
              </div>
            ) : availableDrawings.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#dc2626", border: "1px dashed #fecaca", borderRadius: "8px", background: "#fef2f2" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📭</div>
                <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 500 }}>No GA Drawings for {getFamilyLabel(selectedMapping.familyKey)}</p>
                <p style={{ margin: 0, fontSize: "11px" }}>
                  No GA drawings uploaded for this product family in the Drawing Master.
                  <br />Go to <strong>Documents → Drawing Master</strong> to upload GA drawings for {getFamilyLabel(selectedMapping.familyKey)}.
                </p>
              </div>
            ) : (
              <div>
                {/* Selected drawing info */}
                <h4 style={{ margin: "0 0 10px", fontSize: "13px", color: "#374151" }}>
                  GA Drawings for {getFamilyLabel(selectedMapping.familyKey)}
                </h4>

                {selectedDrawing && (
                  <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #a7f3d0", background: "#ecfdf5", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#14532d" }}>✓ Currently Assigned</span>
                      <button
                        onClick={handleClearDrawing}
                        style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer" }}
                      >
                        Remove
                      </button>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937" }}>{selectedDrawing.drawingNo}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>{selectedDrawing.title}</div>
                    <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "4px" }}>
                      Rev. {selectedDrawing.revision} · {selectedDrawing.fileName} · {selectedDrawing.date}
                    </div>
                  </div>
                )}

                {/* Available drawings list */}
                <h5 style={{ margin: "0 0 8px", fontSize: "12px", color: "#374151" }}>
                  {availableDrawings.length} drawing{availableDrawings.length !== 1 ? "s" : ""} available — select to assign:
                </h5>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {availableDrawings.map((drawing) => {
                    const isSelected = selectedMapping.selectedDrawingId === drawing.id;
                    return (
                      <div
                        key={drawing.id}
                        onClick={() => !isSelected && handleSelectDrawing(drawing.id)}
                        style={{
                          padding: "10px 12px", borderRadius: "6px",
                          border: `1px solid ${isSelected ? "#a7f3d0" : "#e5e7eb"}`,
                          background: isSelected ? "#f0fdf4" : "#fff",
                          cursor: isSelected ? "default" : "pointer",
                          transition: "all 0.15s",
                          opacity: isSelected ? 0.7 : 1,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "#1f2937" }}>{drawing.drawingNo}</span>
                          <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: "#f3f4f6", color: "#6b7280" }}>
                            Rev. {drawing.revision}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#374151", marginTop: "2px" }}>{drawing.title}</div>
                        <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "4px" }}>
                          {drawing.fileName} · {drawing.fileSize}
                          {drawing.description && <span> · {drawing.description}</span>}
                        </div>
                        {isSelected && (
                          <div style={{ marginTop: "6px", fontSize: "10px", fontWeight: 700, color: "#16a34a" }}>
                            ✓ Currently assigned to {selectedMapping.tagNumber}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
