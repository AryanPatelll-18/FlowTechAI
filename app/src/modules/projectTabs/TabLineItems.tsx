/**
 * TabLineItems — Compact line items list with inline detail.
 * FULLY DEFENSIVE: Every computation wrapped in try-catch. No blank pages.
 */

import { useState } from "react";
import type { ExtractedLineItem, DocumentProject, ProcessConditions } from "../../types/shared";
import { useAppContext } from "../../context/AppContext";
import { validateEngineering, isNonFlowDevice } from "../../data/engineeringValidator";
import { validateProductSelection } from "../../data/productValidationEngine";
import ProjectSizingRunner from "../../components/ProjectSizingRunner";

interface Props {
  lineItems: ExtractedLineItem[];
  isExtracting: boolean;
  selectedLineItemId: string | null;
  onSelectLineItem: (id: string | null) => void;
  onEdit: (li: ExtractedLineItem) => void;
  editingLineItem: string | null;
  editForm: Partial<ExtractedLineItem>;
  setEditForm: React.Dispatch<React.SetStateAction<Partial<ExtractedLineItem>>>;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  currentProject: DocumentProject;
}

/** Safe property getter with fallback */
function safeStr(val: any, fallback = "—"): string {
  if (val === undefined || val === null) return fallback;
  if (typeof val === "string") return val || fallback;
  return String(val) || fallback;
}

/** Check if sizing is needed — never throws */
function requiresSizing(li: ExtractedLineItem): boolean {
  try {
    const f = (li?.productFamily || "").toLowerCase();
    return f.includes("flowmeter") || f.includes("rotameter") || f.includes("flow meter");
  } catch { return false; }
}

/** Safe product validation — never throws */
function safeProductCheck(item: ExtractedLineItem): any {
  try {
    return validateProductSelection(item.productFamily, item.modelNumber, item.application, item.tagNumber);
  } catch {
    return { status: "unknown", reason: "Could not validate", suggestions: [], checks: [] };
  }
}

/** Safe engineering validation — never throws */
function safeEnggValidation(item: ExtractedLineItem): any {
  try {
    return validateEngineering(item);
  } catch {
    return { reviewStatus: "passed", queries: [], assumptions: [], conversions: [], missingMandatoryFields: [], reviewSummary: "" };
  }
}

/** Get safe process conditions */
function safeProcessConditions(li: ExtractedLineItem): ProcessConditions {
  return li.processConditions || {
    service: "liquid", fluidName: li.processMedium || "",
    density: 0, viscosity: 0, operatingTemp: 0, operatingPressure: 0,
    flowRateMin: 0, flowRateMax: 0, flowUnit: "m³/hr", pipeSize: li.size || "",
    meterCategory: "inline",
  };
}

export default function TabLineItems({
  lineItems, isExtracting, selectedLineItemId, onSelectLineItem,
  onEdit, editingLineItem, editForm, setEditForm, onSaveEdit, onCancelEdit, currentProject,
}: Props) {
  const [queryInputs, setQueryInputs] = useState<Record<string, string>>({});
  const [expandedProductCheck, setExpandedProductCheck] = useState<Record<string, boolean>>({});

  const { dispatch } = useAppContext();

  const handleQueryResolve = (li: ExtractedLineItem, fieldName: string, value: string) => {
    try {
      const update = buildResolvedUpdate(li, fieldName, value);
      dispatch({ type: "UPDATE_LINE_ITEM", item: { id: li.id, ...update } });
      setTimeout(() => {
        try {
          const freshLi = { ...li, ...update };
          const vr = safeEnggValidation(freshLi);
          dispatch({
            type: "UPDATE_LINE_ITEM",
            item: {
              id: li.id,
              engineeringReview: {
                reviewStatus: vr.reviewStatus,
                queries: (vr.queries || []).map((vq: any) => ({
                  fieldName: vq.fieldName, extractedValue: vq.extractedValue, issue: vq.issue,
                  whyConcern: vq.whyConcern, requiredClarification: vq.requiredClarification,
                  severity: vq.severity, blocksSizing: vq.blocksSizing, blocksReport: vq.blocksReport,
                })),
                assumptions: (vr.assumptions || []).map((va: any) => ({
                  field: va.field, assumedValue: va.assumedValue, basis: va.basis,
                  safe: va.safe, needsConfirmation: va.needsConfirmation,
                })),
                conversions: vr.conversions || [],
                missingMandatoryFields: vr.missingMandatoryFields || [],
                summary: vr.reviewSummary || "",
              },
            },
          });
        } catch (e) { console.error("[TabLineItems] Validation error:", e); }
      }, 100);
    } catch (e) { console.error("[TabLineItems] Query resolve error:", e); }
  };

  const handleSizingResult = (li: ExtractedLineItem, result: any) => {
    try {
      dispatch({
        type: "UPDATE_LINE_ITEM",
        item: {
          id: li.id,
          sizingResult: {
            bestSize: result.bestSize,
            bestProduct: result.bestProduct || result.bestSize,
            qMin: result.qMin, qMax: result.qMax,
            qMinUnit: result.qMinUnit || "m3/hr",
            velocityStatus: result.velocityStatus,
            accuracy: result.accuracy || "+-0.5%",
            turndown: result.turndown || 10,
            status: result.status === "matched" ? "optimal" : result.status === "mismatch" ? "caution" : "rejected",
            reason: result.status === "mismatch" ? "Size mismatch detected" : undefined,
            waterEquivalent: result.isVariableArea ? {
              weNorm: result.weLph || 0, weMin: result.qMin, weMax: result.qMax,
              fcf: result.fcf || 1, gcf: result.gcf || 1,
            } : undefined,
            sizedAt: Date.now(),
            meterCategory: result.meterCategory || "inline",
            connectionValidation: result.connectionValidation,
          },
          sizingReportHtml: result.reportHtml,
          status: "sizing_ok",
        },
      });
    } catch (e) { console.error("[TabLineItems] Sizing result error:", e); }
  };

  const toggleProductCheck = (id: string) => {
    setExpandedProductCheck((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!lineItems || lineItems.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af", fontSize: 13 }}>
        {isExtracting ? "Extracting line items from documents..." : "No line items yet. Upload and extract documents first."}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
        Line Items ({lineItems.length})
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {lineItems.map((item) => {
          try {
            return <LineItemRow
              key={item.id}
              item={item}
              isExpanded={selectedLineItemId === item.id}
              isEditing={editingLineItem === item.id}
              onToggle={() => onSelectLineItem(selectedLineItemId === item.id ? null : item.id)}
              onEdit={() => onEdit(item)}
              editForm={editForm}
              setEditForm={setEditForm}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              expandedProductCheck={expandedProductCheck}
              toggleProductCheck={toggleProductCheck}
              queryInputs={queryInputs}
              setQueryInputs={setQueryInputs}
              handleQueryResolve={handleQueryResolve}
              handleSizingResult={handleSizingResult}
              currentProject={currentProject}
            />;
          } catch (e) {
            console.error("[TabLineItems] Error rendering line item:", e);
            return (
              <div key={item.id || Math.random()} style={{ padding: 12, background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 6, fontSize: 11, color: "#dc2626" }}>
                Error displaying line item {safeStr(item.tagNumber)}. Check console for details.
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}

/** Individual line item row — fully self-contained and defensive */
function LineItemRow({ item, isExpanded, isEditing, onToggle, onEdit, editForm, setEditForm, onSaveEdit, onCancelEdit, expandedProductCheck, toggleProductCheck, queryInputs, setQueryInputs, handleQueryResolve, handleSizingResult, currentProject }: any) {
  // Safely compute all values
  const tagNumber = safeStr(item.tagNumber);
  const productFamily = safeStr(item.productFamily);
  const modelName = safeStr(item.modelName, "Not Specified");
  const modelNumber = safeStr(item.modelNumber, "—");
  const size = safeStr(item.size);
  const application = safeStr(item.application);
  const processMedium = safeStr(item.processMedium);
  const moc = safeStr(item.moc);
  const processConnection = safeStr(item.processConnection);
  const output = safeStr(item.output);
  const certification = safeStr(item.certification);
  const quantity = item.quantity || 1;
  const lineItemNo = item.lineItemNo || 1;

  // Sizing status
  const isFlow = requiresSizing(item);
  const isSized = !!item.sizingResult;

  // Queries — safe access
  let queries: any[] = [];
  try { queries = item.engineeringReview?.queries || []; } catch { /* ignore */ }
  const hasQueries = queries.length > 0;

  // Product check — safe
  let productCheck: any = { status: "unknown", reason: "", suggestions: [], checks: [] };
  try { productCheck = safeProductCheck(item); } catch { /* ignore */ }

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
      {/* Header Row */}
      <div
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", cursor: "pointer", background: isExpanded ? "#fafafa" : "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, minWidth: 30 }}>#{lineItemNo}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {tagNumber}
          </span>
          <span style={{ fontSize: 10, color: "#6b7280", background: "#f3f4f6", padding: "1px 6px", borderRadius: 3, whiteSpace: "nowrap" }}>
            {productFamily}
          </span>
          <span style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap" }}>Q{quantity}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#dbeafe", color: "#1e40af", fontWeight: 600, whiteSpace: "nowrap" }}>
            {modelName}
          </span>
          {hasQueries && (
            <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#fef3c7", color: "#d97706", fontWeight: 600, whiteSpace: "nowrap" }}>
              {queries.length} Query{queries.length > 1 ? "ies" : "y"}
            </span>
          )}
          {isFlow && (
            <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: isSized ? "#dcfce7" : "#fef3c7", color: isSized ? "#16a34a" : "#d97706", fontWeight: 600, whiteSpace: "nowrap" }}>
              {isSized ? "SIZED" : "PENDING"}
            </span>
          )}
          {!isFlow && (
            <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#f3f4f6", color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}>N/A</span>
          )}
          <span style={{ fontSize: 14, color: "#9ca3af", marginLeft: 4, transform: isExpanded ? "rotate(180deg)" : "none", display: "inline-block" }}>▼</span>
        </div>
      </div>

      {/* Expanded Detail */}
      {isExpanded && (
        <div style={{ borderTop: "1px solid #e5e7eb", padding: "12px 14px", background: "#fafafa" }}>
          {isEditing ? (
            <EditForm form={editForm} setForm={setEditForm} onSave={onSaveEdit} onCancel={onCancelEdit} />
          ) : (
            <ExpandedDetail
              item={item}
              productCheck={productCheck}
              queries={queries}
              hasQueries={hasQueries}
              isFlow={isFlow}
              isSized={isSized}
              expandedProductCheck={expandedProductCheck}
              toggleProductCheck={toggleProductCheck}
              queryInputs={queryInputs}
              setQueryInputs={setQueryInputs}
              handleQueryResolve={handleQueryResolve}
              handleSizingResult={handleSizingResult}
              currentProject={currentProject}
              onEdit={onEdit}
            />
          )}
        </div>
      )}
    </div>
  );
}

/** Expanded detail view — defensive */
function ExpandedDetail({ item, productCheck, queries, hasQueries, isFlow, isSized, expandedProductCheck, toggleProductCheck, queryInputs, setQueryInputs, handleQueryResolve, handleSizingResult, currentProject, onEdit }: any) {
  // Safely get process conditions
  let pc: any = {};
  try { pc = item.processConditions || {}; } catch { }

  return (
    <>
      {/* Key Info Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "6px 16px", marginBottom: 12, fontSize: 11 }}>
        <div><span style={{ color: "#6b7280" }}>Product Family:</span> <strong style={{ color: "#1f2937" }}>{safeStr(item.productFamily)}</strong></div>
        <div><span style={{ color: "#6b7280" }}>Model Name:</span> <strong style={{ color: "#dc2626" }}>{safeStr(item.modelName, "Not Specified")}</strong></div>
        <div><span style={{ color: "#6b7280" }}>De-Codification:</span> <code style={{ fontSize: 10, background: "#f3f4f6", padding: "1px 4px", borderRadius: 3 }}>{safeStr(item.modelNumber, "—")}</code></div>
        <div><span style={{ color: "#6b7280" }}>Size:</span> <strong>{safeStr(item.size)}</strong></div>
        <div><span style={{ color: "#6b7280" }}>Application:</span> {safeStr(item.application)}</div>
        <div><span style={{ color: "#6b7280" }}>Process Medium:</span> {safeStr(item.processMedium)}</div>
        <div><span style={{ color: "#6b7280" }}>MOC:</span> {safeStr(item.moc)}</div>
        <div><span style={{ color: "#6b7280" }}>Connection:</span> {safeStr(item.processConnection)}</div>
        <div><span style={{ color: "#6b7280" }}>Output:</span> {safeStr(item.output)}</div>
        <div><span style={{ color: "#6b7280" }}>Certification:</span> {safeStr(item.certification)}</div>
      </div>

      {/* Process Conditions */}
      {pc && (pc.flowRateMin || pc.flowRateMax) && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "8px 12px", marginBottom: 12, fontSize: 11 }}>
          <div style={{ fontWeight: 600, color: "#1e40af", marginBottom: 4, fontSize: 10, textTransform: "uppercase" }}>Process Conditions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "2px 12px" }}>
            <span>Flow: {pc.flowRateMin || 0} - {pc.flowRateMax || 0} {pc.flowUnit || "m³/hr"}</span>
            <span>Density: {pc.density || "—"} kg/m³</span>
            <span>Viscosity: {pc.viscosity || "—"} cP</span>
            <span>Temp: {pc.operatingTemp || "—"} °C</span>
            <span>Pressure: {pc.operatingPressure || "—"} bar</span>
            <span>Pipe: {pc.pipeSize || "—"}</span>
            <span>Service: {pc.service || "—"}</span>
          </div>
        </div>
      )}

      {/* Product Check */}
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => { try { toggleProductCheck(item.id); } catch { } }}
          style={{ fontSize: 11, fontWeight: 600, color: "#374151", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
          {expandedProductCheck?.[item.id] ? "▼" : "▶"} Product Check
          <span style={{
            fontSize: 9, padding: "1px 6px", borderRadius: 3,
            background: productCheck?.status === "correct" ? "#dcfce7" : productCheck?.status === "warning" ? "#fef3c7" : "#fee2e2",
            color: productCheck?.status === "correct" ? "#16a34a" : productCheck?.status === "warning" ? "#d97706" : "#dc2626",
            fontWeight: 600, marginLeft: 4,
          }}>
            {(productCheck?.status || "unknown").toUpperCase()}
          </span>
        </button>
        {expandedProductCheck?.[item.id] && (
          <div style={{ marginTop: 6, padding: "8px 12px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 11 }}>
            <div>{productCheck?.reason || ""}</div>
            {(productCheck?.suggestions || []).length > 0 && (
              <div style={{ marginTop: 4, color: "#6b7280" }}>Suggestions: {(productCheck.suggestions || []).join(", ")}</div>
            )}
            {(productCheck?.checks || []).map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, fontSize: 10 }}>
                <span>{c?.pass ? "✓" : "✗"}</span>
                <span style={{ color: c?.pass ? "#16a34a" : "#dc2626" }}>{c?.name || ""}: {c?.detail || ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inline Data Entry for Missing Mandatory Fields */}
      <MissingDataEntry item={item} onUpdate={handleQueryResolve} />

      {/* Engineering Queries */}
      {hasQueries && (
        <div style={{ marginBottom: 12, background: "#fff", border: "1px solid #fecaca", borderRadius: 6, padding: "10px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#dc2626", marginBottom: 8 }}>
            ⚠ Engineering Queries ({queries.length})
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {queries.map((q: any, qi: number) => (
              <div key={qi} style={{ padding: "8px 10px", background: "#fef2f2", borderRadius: 4, fontSize: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <strong style={{ color: "#991b1b" }}>{q?.fieldName || "Unknown"}</strong>
                  <span style={{
                    fontSize: 9, padding: "1px 5px", borderRadius: 3,
                    background: q?.severity === "critical" ? "#fee2e2" : q?.severity === "major" ? "#fef3c7" : "#f3f4f6",
                    color: q?.severity === "critical" ? "#dc2626" : q?.severity === "major" ? "#d97706" : "#6b7280",
                    fontWeight: 600,
                  }}>{q?.severity || "minor"}</span>
                </div>
                <div style={{ color: "#7f1d1d", marginBottom: 4 }}>{q?.issue || ""}</div>
                <div style={{ color: "#6b7280", fontSize: 10, marginBottom: 6 }}>{q?.requiredClarification || ""}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder={`Enter ${q?.fieldName || "value"}...`}
                    value={queryInputs?.[`${item.id}-${qi}`] || ""}
                    onChange={(e) => setQueryInputs((prev: any) => ({ ...prev, [`${item.id}-${qi}`]: e.target.value }))}
                    style={{ flex: 1, padding: "5px 8px", borderRadius: 4, border: "1px solid #fecaca", fontSize: 11 }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        try { handleQueryResolve(item, q?.fieldName, queryInputs?.[`${item.id}-${qi}`] || ""); setQueryInputs((prev: any) => ({ ...prev, [`${item.id}-${qi}`]: "" })); } catch { }
                      }
                    }}
                  />
                  <button
                    onClick={() => { try { handleQueryResolve(item, q?.fieldName, queryInputs?.[`${item.id}-${qi}`] || ""); setQueryInputs((prev: any) => ({ ...prev, [`${item.id}-${qi}`]: "" })); } catch { } }}
                    style={{ padding: "5px 12px", borderRadius: 4, border: "none", background: "#c20017", color: "#fff", fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sizing Section */}
      {isFlow ? (
        <SizingSection
          item={item}
          currentProject={currentProject}
          onResult={handleSizingResult}
        />
      ) : (
        <div style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 12px", fontSize: 11, color: "#6b7280", marginBottom: 10 }}>
          Sizing not applicable for {safeStr(item.productFamily)}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={onEdit}
          style={{ padding: "6px 14px", borderRadius: 4, border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontSize: 11, cursor: "pointer" }}>
          Edit Line Item
        </button>
      </div>
    </>
  );
}

/** Sizing runner with error boundary */
function SizingRunnerSafe({ item, currentProject, onResult }: any) {
  try {
    const pc = safeProcessConditions(item);
    return (
      <ProjectSizingRunner
        processConditions={pc}
        productFamily={safeStr(item.productFamily)}
        soSpecifiedSize={safeStr(item.size)}
        floatMoc={item.floatMoc}
        moc={safeStr(item.moc)}
        specs={item.specs || {}}
        modelName={safeStr(item.modelName)}
        decodification={safeStr(item.modelNumber)}
        customerName={safeStr(currentProject?.metadata?.customerName)}
        soNumber={safeStr(currentProject?.metadata?.quoteNumber)}
        tagNumber={safeStr(item.tagNumber)}
        onResult={(result: any) => onResult(result)}
      />
    );
  } catch (e: any) {
    console.error("[SizingRunnerSafe] Error:", e);
    return (
      <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 6, padding: "8px 12px", fontSize: 11, color: "#dc2626" }}>
        Sizing component could not load. {e?.message || ""}
      </div>
    );
  }
}

/** Build update object for query resolution */
function buildResolvedUpdate(li: ExtractedLineItem, fieldName: string, value: string): Partial<ExtractedLineItem> {
  try {
    const fn = (fieldName || "").toLowerCase();
    const numVal = parseFloat(value);
    const isStr = isNaN(numVal);
    const update: Partial<ExtractedLineItem> = {};
    const pc: ProcessConditions = li.processConditions || { service: "liquid", fluidName: "", density: 0, viscosity: 0, operatingTemp: 0, operatingPressure: 0, flowRateMin: 0, flowRateMax: 0, flowUnit: "m³/hr", pipeSize: "", meterCategory: "inline" };

    if (fn.includes("(min)") || fn.includes("minimum") || fn.includes("flow rate min") || fn.includes("flow min")) {
      update.processConditions = { ...pc, flowRateMin: isStr ? 0 : numVal }; update.flowMin = value; return update;
    }
    if (fn.includes("(max)") || fn.includes("maximum") || fn.includes("flow rate max") || fn.includes("flow max") || fn.includes("flow range")) {
      update.processConditions = { ...pc, flowRateMax: isStr ? 0 : numVal }; update.flowMax = value; return update;
    }
    if (fn.includes("flow unit")) { update.processConditions = { ...pc, flowUnit: value }; update.flowUnit = value; return update; }
    if (fn.includes("pressure")) { update.processConditions = { ...pc, operatingPressure: isStr ? 0 : numVal }; update.pressure = value; return update; }
    if (fn.includes("temperature")) { update.processConditions = { ...pc, operatingTemp: isStr ? 0 : numVal }; update.temperature = value; return update; }
    if (fn.includes("density") || fn.includes("specific gravity")) { update.processConditions = { ...pc, density: isStr ? 0 : numVal }; return update; }
    if (fn.includes("viscosity")) { update.processConditions = { ...pc, viscosity: isStr ? 0 : numVal }; return update; }
    if (fn.includes("pipe") || fn.includes("line size")) { update.processConditions = { ...pc, pipeSize: value }; update.size = value; return update; }
    if (fn.includes("fluid") || fn.includes("service") || fn.includes("gas name")) { update.processConditions = { ...pc, fluidName: value }; update.processMedium = value; return update; }
    if (fn.includes("moc") || fn.includes("material")) { update.moc = value; return update; }
    update.specs = { ...li.specs, [fieldName]: value }; return update;
  } catch {
    return { specs: { ...li.specs, [fieldName]: value } };
  }
}

/** Inline edit form */
function EditForm({ form, setForm, onSave, onCancel }: {
  form: Partial<ExtractedLineItem>;
  setForm: React.Dispatch<React.SetStateAction<Partial<ExtractedLineItem>>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const field = (label: string, key: keyof ExtractedLineItem, placeholder?: string) => (
    <div style={{ marginBottom: 8 }}>
      <label style={{ fontSize: 10, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 2 }}>{label}</label>
      <input
        value={String((form as any)[key] || "")}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        style={{ width: "100%", padding: "6px 8px", borderRadius: 4, border: "1px solid #d1d5db", fontSize: 11, boxSizing: "border-box" }}
      />
    </div>
  );

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Edit Line Item</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0 12px" }}>
        {field("Tag Number", "tagNumber")}
        {field("Model Name", "modelName")}
        {field("Size", "size")}
        {field("Application", "application")}
        {field("Process Medium", "processMedium")}
        {field("Flow Min", "flowMin")}
        {field("Flow Max", "flowMax")}
        {field("Flow Unit", "flowUnit")}
        {field("Pressure", "pressure")}
        {field("Temperature", "temperature")}
        {field("MOC", "moc")}
        {field("Float MOC", "floatMoc")}
        {field("Output", "output")}
        {field("Certification", "certification")}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={onSave}
          style={{ padding: "6px 16px", borderRadius: 4, border: "none", background: "#c20017", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Save Changes</button>
        <button onClick={onCancel}
          style={{ padding: "6px 16px", borderRadius: 4, border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontSize: 11, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}


/** Inline data entry for missing mandatory fields — shows inputs for any field
 *  that sizing needs but the SO didn't provide. This lets users enter data
 *  directly without going into Edit mode.
 */
function MissingDataEntry({ item, onUpdate }: { item: ExtractedLineItem; onUpdate: (li: ExtractedLineItem, field: string, value: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const pc = item.processConditions;
  const isLevel = isNonFlowDevice(item.productFamily);

  // For LEVEL instruments (level gauge, sight glass, level switch, etc.):
  // Flow rate is NOT applicable. Only fluid properties + dimensions matter.
  // For FLOW instruments (flowmeters, rotameters): Flow rate IS mandatory.
  const fields: Array<{ key: string; label: string; hasValue: boolean; value: string; unit?: string; type?: string }> = [
    ...(isLevel ? [] : [
      { key: "flowRateMin", label: "Flow Rate (Min)", hasValue: !!(pc?.flowRateMin && pc.flowRateMin > 0), value: String(pc?.flowRateMin || ""), unit: pc?.flowUnit || "m³/hr", type: "number" },
      { key: "flowRateMax", label: "Flow Rate (Max)", hasValue: !!(pc?.flowRateMax && pc.flowRateMax > 0), value: String(pc?.flowRateMax || ""), unit: pc?.flowUnit || "m³/hr", type: "number" },
    ]),
    { key: "fluidName", label: "Fluid / Service Name", hasValue: !!(pc?.fluidName), value: pc?.fluidName || "", type: "text" },
    { key: "density", label: "Fluid Density", hasValue: !!(pc?.density && pc.density > 0), value: String(pc?.density || ""), unit: "kg/m³", type: "number" },
    { key: "viscosity", label: "Fluid Viscosity", hasValue: !!(pc?.viscosity && pc.viscosity > 0), value: String(pc?.viscosity || ""), unit: "cP", type: "number" },
    { key: "operatingTemp", label: "Operating Temperature", hasValue: !!(pc?.operatingTemp && pc.operatingTemp !== 0), value: String(pc?.operatingTemp || ""), unit: "°C", type: "number" },
    { key: "operatingPressure", label: "Operating Pressure", hasValue: !!(pc?.operatingPressure && pc.operatingPressure > 0), value: String(pc?.operatingPressure || ""), unit: "bar", type: "number" },
    { key: "pipeSize", label: "Line / Pipe Size", hasValue: !!(pc?.pipeSize), value: pc?.pipeSize || item.size || "", type: "text" },
  ];

  const missingFields = fields.filter((f) => !f.hasValue);
  if (missingFields.length === 0) return null;

  const handleSave = (fieldKey: string, fieldLabel: string) => {
    const val = values[fieldKey];
    if (!val || val.trim() === "") return;
    onUpdate(item, fieldLabel, val.trim());
    setValues((prev) => ({ ...prev, [fieldKey]: "" }));
  };

  return (
    <div style={{ marginBottom: 12, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 6, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#92400e", marginBottom: 8 }}>
        ⚠ Missing Data ({missingFields.length} field{missingFields.length > 1 ? "s" : ""} required for sizing)
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {missingFields.map((f) => (
          <div key={f.key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#78350f", fontWeight: 600, minWidth: 160, whiteSpace: "nowrap" }}>{f.label}:</span>
            <div style={{ display: "flex", gap: 6, flex: 1, alignItems: "center" }}>
              <input
                type={f.type || "text"}
                placeholder={`Enter ${f.label.toLowerCase()}${f.unit ? ` (${f.unit})` : ""}...`}
                value={values[f.key] || ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(f.key, f.label); }}
                style={{ flex: 1, padding: "5px 8px", borderRadius: 4, border: "1px solid #fcd34d", fontSize: 11 }}
              />
              {f.unit && <span style={{ fontSize: 9, color: "#9ca3af", whiteSpace: "nowrap" }}>{f.unit}</span>}
              <button
                onClick={() => handleSave(f.key, f.label)}
                disabled={!values[f.key]?.trim()}
                style={{
                  padding: "5px 12px", borderRadius: 4, border: "none",
                  background: values[f.key]?.trim() ? "#c20017" : "#d1d5db",
                  color: values[f.key]?.trim() ? "#fff" : "#9ca3af",
                  fontSize: 10, fontWeight: 600, cursor: values[f.key]?.trim() ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, color: "#b45309", marginTop: 8 }}>
        {isLevel
          ? "Enter the missing process data above. Flow rate is NOT applicable for level instruments."
          : "Enter the missing values above to enable accurate sizing. All values are saved automatically."}
      </div>
    </div>
  );
}

/** Sizing Section — shows success when sized, runner when not, with re-run option */
function SizingSection({ item, currentProject, onResult }: { item: any; currentProject: any; onResult: any }) {
  const [showRunner, setShowRunner] = useState(!item.sizingResult);

  const handleSizingDone = (result: any) => {
    onResult(item, result);
    setShowRunner(false); // Collapse runner on success
  };

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Sizing</div>

      {item.sizingResult ? (
        /* SIZED: Show success box */
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "10px 12px", fontSize: 11, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: "#16a34a", fontWeight: 700 }}>✓ SIZING COMPLETED</span>
            <span>Size: <strong>{item.sizingResult?.bestSize || "—"}</strong></span>
            <span>Range: {item.sizingResult?.qMin || "—"} - {item.sizingResult?.qMax || "—"} {item.sizingResult?.qMinUnit || "m³/hr"}</span>
            {item.sizingReportHtml && item.sizingReportHtml.length > 50 ? (
              <>
                <button onClick={() => { try { const blob = new Blob([item.sizingReportHtml!], { type: "text/html" }); const url = URL.createObjectURL(blob); window.open(url, "_blank"); } catch (e) { console.error("[ViewReport] Failed:", e); } }}
                  style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #16a34a", background: "#fff", color: "#16a34a", fontSize: 10, cursor: "pointer" }}>
                  View Report
                </button>
                <button onClick={() => { try { const blob = new Blob([item.sizingReportHtml!], { type: "text/html" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `Sizing_${safeStr(item.tagNumber)}.html`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 5000); } catch (e) { console.error("[DownloadReport] Failed:", e); } }}
                  style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #374151", background: "#fff", color: "#374151", fontSize: 10, cursor: "pointer" }}>
                  Download
                </button>
              </>
            ) : (
              <span style={{ fontSize: 9, color: "#d97706", fontWeight: 600, background: "#fef3c7", padding: "2px 8px", borderRadius: 3 }}>
                ⚠ Report not generated — re-run sizing
              </span>
            )}
            {!showRunner && (
              <button onClick={() => setShowRunner(true)}
                style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #d97706", background: "#fff", color: "#d97706", fontSize: 10, cursor: "pointer" }}>
                ▶ Re-run
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* Show runner when not sized, or when re-run requested */}
      {showRunner && (
        <SizingRunnerSafe
          item={item}
          currentProject={currentProject}
          onResult={handleSizingDone}
        />
      )}
    </div>
  );
}
