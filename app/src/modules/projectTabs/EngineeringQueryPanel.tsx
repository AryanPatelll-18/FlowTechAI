/**
 * Tab 4: Engineering Query Panel
 * Shows technical queries with editable input fields to resolve them.
 * Resolved values are saved back to the line item's processConditions or specs.
 */

import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import type { ExtractedLineItem } from "../../types/shared";
import { validateEngineering } from "../../data/engineeringValidator";

type FilterSeverity = "all" | "critical" | "major" | "minor" | "info";

const SEVERITY_COLORS: Record<string, { bg: string; color: string }> = {
  critical: { bg: "#fef2f2", color: "#dc2626" },
  major: { bg: "#fffbeb", color: "#d97706" },
  minor: { bg: "#eff6ff", color: "#3b82f6" },
  info: { bg: "#f3f4f6", color: "#6b7280" },
};

/**
 * Map a query field name to where the value should be saved.
 * The validator reads DIRECT properties on ExtractedLineItem (flowMin, flowMax, pressure, etc.)
 * AND processConditions (flowRateMin, flowRateMax, operatingPressure, etc.)
 * We save to BOTH so sizing engine and validator both see the data.
 */
function buildResolvedUpdate(li: ExtractedLineItem, fieldName: string, value: string): Partial<ExtractedLineItem> {
  const fn = fieldName.toLowerCase();
  const numVal = parseFloat(value);
  const isString = isNaN(numVal);

  const update: Partial<ExtractedLineItem> = {};
  const pc = li.processConditions || {
    service: "liquid" as const, fluidName: "", density: 0, viscosity: 0,
    operatingTemp: 0, operatingPressure: 0, flowRateMin: 0, flowRateMax: 0,
    flowUnit: "m³/hr", pipeSize: "", meterCategory: "inline" as const,
  };

  // ── FLOW MIN (must check BEFORE max to avoid "range" substring match) ──
  if (fn.includes("(min)") || fn.includes("minimum") || fn.includes("flow rate min") || fn.includes("flow min")) {
    update.processConditions = { ...pc, flowRateMin: isString ? 0 : numVal };
    update.flowMin = value; // validator reads this directly
    return update;
  }

  // ── FLOW MAX ──
  if (fn.includes("(max)") || fn.includes("maximum") || fn.includes("flow rate max") || fn.includes("flow max") || fn.includes("flow range")) {
    update.processConditions = { ...pc, flowRateMax: isString ? 0 : numVal };
    update.flowMax = value; // validator reads this directly
    return update;
  }

  // ── FLOW UNIT ──
  if (fn.includes("flow unit") || fn.includes("unit of flow")) {
    update.processConditions = { ...pc, flowUnit: value };
    update.flowUnit = value; // validator reads this directly
    return update;
  }

  // ── OPERATING PRESSURE ──
  if (fn.includes("operating pressure") || fn.includes("pressure")) {
    update.processConditions = { ...pc, operatingPressure: isString ? 0 : numVal };
    update.pressure = value; // validator reads this directly
    return update;
  }

  // ── OPERATING TEMPERATURE ──
  if (fn.includes("operating temperature") || fn.includes("temperature")) {
    update.processConditions = { ...pc, operatingTemp: isString ? 0 : numVal };
    update.temperature = value; // validator reads this directly
    return update;
  }

  // ── DENSITY / SPECIFIC GRAVITY ──
  if (fn.includes("density") || fn.includes("specific gravity")) {
    update.processConditions = { ...pc, density: isString ? 0 : numVal };
    return update;
  }

  // ── VISCOSITY ──
  if (fn.includes("viscosity")) {
    update.processConditions = { ...pc, viscosity: isString ? 0 : numVal };
    return update;
  }

  // ── PIPE / LINE SIZE ──
  if (fn.includes("pipe size") || fn.includes("line size")) {
    update.processConditions = { ...pc, pipeSize: value };
    update.size = value; // validator reads this directly
    return update;
  }

  // ── FLUID / SERVICE / GAS NAME / STEAM TYPE ──
  if (fn.includes("fluid") || fn.includes("service") || fn.includes("gas name") || fn.includes("steam type")) {
    update.processConditions = { ...pc, fluidName: value };
    update.processMedium = value; // validator reads this directly
    return update;
  }

  // ── MOC ──
  if (fn.includes("moc") || fn.includes("material")) {
    update.moc = value;
    return update;
  }

  // ── PROCESS CONNECTION ──
  if (fn.includes("process connection") || fn.includes("connection")) {
    update.processConnection = value;
    return update;
  }

  // ── MOUNTING TYPE ──
  if (fn.includes("mounting")) {
    update.specs = { ...li.specs, "Mounting Type": value };
    update.application = value; // validator reads this for mounting
    return update;
  }

  // ── C-C DISTANCE / LEVEL RANGE / PROBE LENGTH ──
  if (fn.includes("c-c") || fn.includes("level range") || fn.includes("probe length") || fn.includes("insertion length")) {
    update.specs = { ...li.specs, "C-C Distance": value };
    update.size = value;
    return update;
  }

  // ── GENERIC: save to specs ──
  update.specs = { ...li.specs, [fieldName]: value };
  return update;
}

export default function EngineeringQueryPanel() {
  const { state, dispatch, notify } = useAppContext();
  const { currentProject } = state;
  const [filter, setFilter] = useState<FilterSeverity>("all");
  // Local state for input values: queryKey -> inputValue
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  // Track which queries have been resolved in this session
  const [resolvedKeys, setResolvedKeys] = useState<Set<string>>(new Set());

  if (!currentProject) return null;

  // Collect all queries across all line items
  const allQueries = currentProject.lineItems.flatMap((li) =>
    (li.engineeringReview?.queries || []).map((q, qIdx) => ({
      ...q,
      _liId: li.id,
      _qIdx: qIdx,
      _queryKey: `${li.id}-${qIdx}`,
      lineItemNo: li.lineItemNo,
      tagNumber: li.tagNumber,
      productName: li.productFamily,
    }))
  );

  const allAssumptions = currentProject.lineItems.flatMap((li) =>
    (li.engineeringReview?.assumptions || []).map((a) => ({ ...a, lineItemNo: li.lineItemNo, tagNumber: li.tagNumber }))
  );

  const allConversions = currentProject.lineItems.flatMap((li) =>
    (li.engineeringReview?.conversions || []).map((c) => ({ ...c, lineItemNo: li.lineItemNo, tagNumber: li.tagNumber }))
  );

  const filteredQueries = filter === "all" ? allQueries : allQueries.filter((q) => q.severity === filter);
  const unresolvedQueries = filteredQueries.filter((q) => !resolvedKeys.has(q._queryKey));

  const criticalCount = allQueries.filter((q) => q.severity === "critical" && !resolvedKeys.has(q._queryKey)).length;
  const majorCount = allQueries.filter((q) => q.severity === "major" && !resolvedKeys.has(q._queryKey)).length;
  const minorCount = allQueries.filter((q) => q.severity === "minor" && !resolvedKeys.has(q._queryKey)).length;

  // Overall project readiness
  const itemsReady = currentProject.lineItems.filter((li) => li.engineeringReview?.reviewStatus === "ready").length;
  const itemsBlocked = currentProject.lineItems.filter((li) => li.engineeringReview?.reviewStatus === "cannot_proceed").length;

  const handleResolve = (q: typeof allQueries[0]) => {
    const value = inputValues[q._queryKey]?.trim();
    if (!value) {
      notify("warning", "Enter a value", "Please type the missing/corrected data before resolving.");
      return;
    }

    const li = currentProject.lineItems.find((l) => l.id === q._liId);
    if (!li) return;

    const update = buildResolvedUpdate(li, q.fieldName, value);
    if (Object.keys(update).length <= 1) {
      notify("error", "Cannot save", `Don't know where to save "${q.fieldName}". Contact support.`);
      return;
    }

    // Build the UPDATED line item with the new value
    const updatedLineItem: ExtractedLineItem = {
      ...li,
      ...update,
      id: q._liId,
    };

    // RE-RUN the engineering validator with the updated data
    // This regenerates queries based on the new values — resolved queries naturally disappear
    const validationResult = validateEngineering(updatedLineItem);

    // Save BOTH the data value AND the refreshed engineeringReview
    dispatch({
      type: "UPDATE_LINE_ITEM",
      item: {
        id: q._liId,
        ...update,
        engineeringReview: {
          reviewStatus: validationResult.reviewStatus,
          queries: validationResult.queries.map((vq) => ({
            fieldName: vq.fieldName,
            extractedValue: vq.extractedValue,
            issue: vq.issue,
            whyConcern: vq.whyConcern,
            requiredClarification: vq.requiredClarification,
            severity: vq.severity,
            blocksSizing: vq.blocksSizing,
            blocksReport: vq.blocksReport,
          })),
          assumptions: validationResult.assumptions.map((va) => ({
            field: va.field,
            assumedValue: va.assumedValue,
            basis: va.basis,
            safe: va.safe,
            needsConfirmation: va.needsConfirmation,
          })),
          conversions: validationResult.conversions,
          missingMandatoryFields: validationResult.missingMandatoryFields,
          summary: validationResult.reviewSummary,
        },
      },
    });

    setResolvedKeys((prev) => new Set(prev).add(q._queryKey));

    // Show appropriate message based on whether query was actually resolved
    const stillHasQuery = validationResult.queries.some(
      (vq) => vq.fieldName === q.fieldName
    );
    if (stillHasQuery) {
      notify("warning", `${q.fieldName} needs more data`, `Value "${value}" saved, but the validator still needs additional info. Check updated queries.`);
    } else {
      notify("success", `${q.fieldName} resolved`, `Saved "${value}". Query cleared. Sizing is now unlocked for this field.`);
    }
  };

  const handleResolveAll = () => {
    // Group unresolved queries by line item so we can apply ALL updates
    // and re-run the validator ONCE per line item
    const queriesByLi = new Map<string, typeof unresolvedQueries>();
    for (const q of unresolvedQueries) {
      if (!inputValues[q._queryKey]?.trim()) continue;
      const arr = queriesByLi.get(q._liId) || [];
      arr.push(q);
      queriesByLi.set(q._liId, arr);
    }

    let resolved = 0;
    for (const [liId, queries] of queriesByLi) {
      const li = currentProject.lineItems.find((l) => l.id === liId);
      if (!li) continue;

      // Apply ALL updates for this line item
      let workingLi: ExtractedLineItem = { ...li };
      for (const q of queries) {
        const value = inputValues[q._queryKey]?.trim();
        if (!value) continue;
        const update = buildResolvedUpdate(workingLi, q.fieldName, value);
        if (Object.keys(update).length > 1) {
          workingLi = { ...workingLi, ...update, id: liId };
          setResolvedKeys((prev) => new Set(prev).add(q._queryKey));
          resolved++;
        }
      }

      // Re-run validator ONCE with all updates applied
      const validationResult = validateEngineering(workingLi);
      dispatch({
        type: "UPDATE_LINE_ITEM",
        item: {
          id: liId,
          processConditions: workingLi.processConditions,
          specs: workingLi.specs,
          engineeringReview: {
            reviewStatus: validationResult.reviewStatus,
            queries: validationResult.queries.map((vq) => ({
              fieldName: vq.fieldName,
              extractedValue: vq.extractedValue,
              issue: vq.issue,
              whyConcern: vq.whyConcern,
              requiredClarification: vq.requiredClarification,
              severity: vq.severity,
              blocksSizing: vq.blocksSizing,
              blocksReport: vq.blocksReport,
            })),
            assumptions: validationResult.assumptions.map((va) => ({
              field: va.field,
              assumedValue: va.assumedValue,
              basis: va.basis,
              safe: va.safe,
              needsConfirmation: va.needsConfirmation,
            })),
            conversions: validationResult.conversions,
            missingMandatoryFields: validationResult.missingMandatoryFields,
            summary: validationResult.reviewSummary,
          },
        },
      });
    }
    notify("success", `${resolved} queries resolved`, "Engineering review refreshed. Check Sizing Check tab to proceed.");
  };

  /** Re-run the engineering validator for ALL line items using current data.
   *  Use this after manually editing data in other tabs to refresh queries. */
  const handleRefreshAll = () => {
    let refreshed = 0;
    for (const li of currentProject.lineItems) {
      const validationResult = validateEngineering(li);
      dispatch({
        type: "UPDATE_LINE_ITEM",
        item: {
          id: li.id,
          engineeringReview: {
            reviewStatus: validationResult.reviewStatus,
            queries: validationResult.queries.map((vq) => ({
              fieldName: vq.fieldName,
              extractedValue: vq.extractedValue,
              issue: vq.issue,
              whyConcern: vq.whyConcern,
              requiredClarification: vq.requiredClarification,
              severity: vq.severity,
              blocksSizing: vq.blocksSizing,
              blocksReport: vq.blocksReport,
            })),
            assumptions: validationResult.assumptions.map((va) => ({
              field: va.field,
              assumedValue: va.assumedValue,
              basis: va.basis,
              safe: va.safe,
              needsConfirmation: va.needsConfirmation,
            })),
            conversions: validationResult.conversions,
            missingMandatoryFields: validationResult.missingMandatoryFields,
            summary: validationResult.reviewSummary,
          },
        },
      });
      refreshed++;
    }
    notify("success", `Refreshed ${refreshed} line items`, "Engineering queries re-evaluated against current data.");
  };

  return (
    <div>
      {/* Summary Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#1f2937" }}>Engineering Query Panel</h3>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
            {unresolvedQueries.length} unresolved · {criticalCount} critical · {allAssumptions.length} assumptions
          </p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {(["all", "critical", "major", "minor", "info"] as FilterSeverity[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "4px 10px", borderRadius: "4px", border: `1px solid ${filter === s ? "#c20017" : "#d1d5db"}`,
                background: filter === s ? "#fef2f2" : "#fff", color: filter === s ? "#c20017" : "#374151",
                cursor: "pointer", fontSize: "11px", textTransform: "capitalize",
              }}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Project Readiness Banner */}
      <div style={{
        padding: "12px 16px", borderRadius: "8px", marginBottom: "16px",
        background: itemsBlocked > 0 ? "#fef2f2" : unresolvedQueries.length === 0 ? "#ecfdf5" : "#fffbeb",
        border: `1px solid ${itemsBlocked > 0 ? "#fecaca" : unresolvedQueries.length === 0 ? "#a7f3d0" : "#fcd34d"}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: "13px", color: itemsBlocked > 0 ? "#dc2626" : unresolvedQueries.length === 0 ? "#16a34a" : "#d97706" }}>
            {itemsBlocked > 0 ? `${itemsBlocked} line item(s) blocked` : unresolvedQueries.length === 0 ? "All queries resolved" : `${unresolvedQueries.length} query(s) pending`}
          </span>
          <span style={{ fontSize: "12px", color: "#6b7280", marginLeft: "10px" }}>
            Sizing: {itemsBlocked === 0 && unresolvedQueries.filter((q) => q.blocksSizing).length === 0 ? "Unlocked" : "Locked"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {criticalCount > 0 && <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "8px", background: "#fef2f2", color: "#dc2626", fontWeight: 600 }}>{criticalCount} Critical</span>}
          {majorCount > 0 && <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "8px", background: "#fffbeb", color: "#d97706", fontWeight: 600 }}>{majorCount} Major</span>}
          {minorCount > 0 && <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "8px", background: "#eff6ff", color: "#3b82f6", fontWeight: 600 }}>{minorCount} Minor</span>}
        </div>
      </div>

      {/* Resolve All + Refresh buttons */}
      <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={handleRefreshAll}
          style={{
            padding: "6px 16px", borderRadius: "6px", border: "1px solid #3b82f6",
            background: "#eff6ff", color: "#3b82f6", cursor: "pointer",
            fontSize: "12px", fontWeight: 600,
          }}
        >
          Refresh All Reviews
        </button>
        {unresolvedQueries.length > 0 && (
          <div>
            <button
              onClick={handleResolveAll}
              style={{
                padding: "6px 16px", borderRadius: "6px", border: "none",
                background: "#16a34a", color: "#fff", cursor: "pointer",
                fontSize: "12px", fontWeight: 600,
              }}
            >
              Resolve All With Values
            </button>
            <span style={{ fontSize: "10px", color: "#9ca3af", marginLeft: "8px" }}>
              Saves all queries that have input values entered
            </span>
          </div>
        )}
      </div>

      {/* Technical Queries — now with editable input fields */}
      <div style={{ marginBottom: "24px" }}>
        <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#374151" }}>
          Technical Queries ({unresolvedQueries.length})
        </h4>
        {unresolvedQueries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px", color: "#9ca3af", border: "1px dashed #d1d5db", borderRadius: "8px" }}>
            {allQueries.length === 0 ? "No queries raised" : "All queries have been resolved"}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {unresolvedQueries.map((q) => {
              const sc = SEVERITY_COLORS[q.severity] || SEVERITY_COLORS.info;
              return (
                <div key={q._queryKey} style={{
                  padding: "12px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff",
                  borderLeft: `3px solid ${sc.color}`,
                }}>
                  {/* Query header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{
                        fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase",
                        background: sc.bg, color: sc.color,
                      }}>{q.severity}</span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#1f2937" }}>{q.fieldName}</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#6b7280" }}>
                      {q.lineItemNo} · {q.tagNumber}
                    </span>
                  </div>

                  {/* Issue description */}
                  <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#374151" }}>{q.issue}</p>
                  <p style={{ margin: "0 0 6px", fontSize: "11px", color: "#6b7280" }}>{q.whyConcern}</p>

                  {/* Extracted value + blocks sizing */}
                  <div style={{ display: "flex", gap: "12px", fontSize: "10px", color: "#9ca3af", marginBottom: "8px" }}>
                    <span>Extracted: <strong style={{ color: "#374151" }}>{q.extractedValue || "—"}</strong></span>
                    {q.blocksSizing && <span style={{ color: "#dc2626" }}>Blocks sizing</span>}
                    {q.blocksReport && <span style={{ color: "#dc2626" }}>Blocks report</span>}
                  </div>

                  {/* Required clarification */}
                  <div style={{ marginBottom: "8px", padding: "6px 10px", background: "#fafafa", borderRadius: "4px", fontSize: "11px", color: "#92400e" }}>
                    <strong>Required:</strong> {q.requiredClarification}
                  </div>

                  {/* RESOLUTION INPUT */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "10px", color: "#6b7280", display: "block", marginBottom: "2px" }}>
                        Enter {q.fieldName}
                      </label>
                      <input
                        type="text"
                        value={inputValues[q._queryKey] || ""}
                        onChange={(e) => setInputValues((prev) => ({ ...prev, [q._queryKey]: e.target.value }))}
                        placeholder={`e.g. 50 m³/hr, 10 bar, SS316...`}
                        style={{
                          width: "100%", padding: "6px 10px", borderRadius: "4px", border: "1px solid #d1d5db",
                          fontSize: "12px", boxSizing: "border-box",
                        }}
                        onKeyDown={(e) => { if (e.key === "Enter") handleResolve(q); }}
                      />
                    </div>
                    <button
                      onClick={() => handleResolve(q)}
                      style={{
                        padding: "6px 14px", borderRadius: "4px", border: "none",
                        background: "#16a34a", color: "#fff", cursor: "pointer",
                        fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap", marginTop: "14px",
                      }}
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved queries (collapsed) */}
      {resolvedKeys.size > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#16a34a" }}>
            Resolved ({resolvedKeys.size})
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {allQueries.filter((q) => resolvedKeys.has(q._queryKey)).map((q) => (
              <div key={q._queryKey} style={{
                padding: "8px 12px", borderRadius: "6px", border: "1px solid #a7f3d0", background: "#f0fdf4",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#14532d" }}>{q.fieldName}</span>
                  <span style={{ fontSize: "10px", color: "#6b7280", marginLeft: "8px" }}>
                    {q.tagNumber} — Saved: <strong>{inputValues[q._queryKey]}</strong>
                  </span>
                </div>
                <span style={{ fontSize: "10px", color: "#16a34a", fontWeight: 600 }}>Resolved</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assumptions */}
      {allAssumptions.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#374151" }}>
            Engineering Assumptions ({allAssumptions.length})
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {allAssumptions.map((a, idx) => (
              <div key={idx} style={{ padding: "10px 14px", borderRadius: "6px", border: "1px solid #fcd34d", background: "#fffbeb" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", fontWeight: 500, color: "#1f2937" }}>
                    <strong>{a.field}</strong>: Assumed <strong>{a.assumedValue}</strong>
                  </span>
                  <span style={{ fontSize: "10px", color: "#6b7280" }}>{a.lineItemNo} · {a.tagNumber}</span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#92400e" }}>{a.basis}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unit Conversions */}
      {allConversions.length > 0 && (
        <div>
          <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#374151" }}>
            Unit Conversions ({allConversions.length})
          </h4>
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "6px 10px", border: "1px solid #e5e7eb", textAlign: "left" }}>Line Item</th>
                  <th style={{ padding: "6px 10px", border: "1px solid #e5e7eb", textAlign: "left" }}>Field</th>
                  <th style={{ padding: "6px 10px", border: "1px solid #e5e7eb", textAlign: "left" }}>Original (SO/QTN)</th>
                  <th style={{ padding: "6px 10px", border: "1px solid #e5e7eb", textAlign: "left" }}>Converted</th>
                  <th style={{ padding: "6px 10px", border: "1px solid #e5e7eb", textAlign: "left" }}>Basis</th>
                </tr>
              </thead>
              <tbody>
                {allConversions.map((c, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb", fontSize: "11px" }}>{c.lineItemNo} · {c.tagNumber}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>{c.field}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb", fontWeight: 500 }}>{c.originalValue}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb", color: "#c20017", fontWeight: 500 }}>{c.convertedValue}</td>
                    <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb", fontSize: "11px", color: "#6b7280" }}>{c.conversionBasis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
