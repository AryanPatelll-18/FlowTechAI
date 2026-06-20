/**
 * Report Generation Locking Engine
 * Per master prompt Section 14 — final report only generated when all checks pass.
 */

import type { ExtractedLineItem } from "../types/shared";

/** Check if a line item requires flow sizing (flowmeters/rotameters only) */
function requiresSizing(li: ExtractedLineItem): boolean {
  const family = li.productFamily.toLowerCase();
  return family.includes("flowmeter") || family.includes("flow meter") ||
         family.includes("rotameter");
}

export interface LockCheck {
  id: string;
  label: string;
  passed: boolean;
  blocking: boolean;
  message?: string;
}

export interface LockResult {
  canGenerate: boolean;
  checks: LockCheck[];
  blockedBy: string[];
  warningCount: number;
}

/**
 * Evaluate all report generation gates.
 * Returns canGenerate=true only when ALL critical checks pass.
 */
export function evaluateReportLocks(
  lineItems: ExtractedLineItem[],
  hasUploadedDoc: boolean,
  exceptionReportHtml: string | null,
): LockResult {
  const checks: LockCheck[] = [];

  // 1. Document uploaded
  checks.push({
    id: "doc_uploaded",
    label: "SO/QTN uploaded and read",
    passed: hasUploadedDoc,
    blocking: true,
    message: hasUploadedDoc ? undefined : "Upload a document first",
  });

  // 2. Has line items
  checks.push({
    id: "has_line_items",
    label: "Line items extracted",
    passed: lineItems.length > 0,
    blocking: true,
    message: lineItems.length > 0 ? undefined : "No line items extracted from document",
  });

  // 3. No critical engineering queries
  const criticalQueries = lineItems.flatMap((li) =>
    (li.engineeringReview?.queries || []).filter((q) => q.severity === "critical")
  );
  checks.push({
    id: "no_critical_queries",
    label: "No critical engineering queries",
    passed: criticalQueries.length === 0,
    blocking: true,
    message: criticalQueries.length > 0 ? `${criticalQueries.length} critical query(s) must be resolved` : undefined,
  });

  // 4. No "After Confirmation" in sizing-critical fields (flow devices only)
  const pendingFields = lineItems.filter((li) => {
    // For flow devices: check flow-related fields
    // For non-flow devices: check only pressure, temperature, size (not flowMin/flowMax)
    const isFlow = requiresSizing(li);
    const criticalFields = isFlow
      ? [li.flowMin, li.flowMax, li.pressure, li.temperature, li.size]
      : [li.pressure, li.temperature, li.size];
    return criticalFields.some((f) => /after\s*confirmation|pending|tbd/i.test(f || ""));
  });
  checks.push({
    id: "no_pending_fields",
    label: "No unresolved 'After Confirmation' values",
    passed: pendingFields.length === 0,
    blocking: true,
    message: pendingFields.length > 0 ? `${pendingFields.length} line item(s) have pending sizing-critical values` : undefined,
  });

  // 5. Mandatory data complete per line item
  const incompleteItems = lineItems.filter((li) =>
    (li.engineeringReview?.missingMandatoryFields || []).length > 0
  );
  checks.push({
    id: "mandatory_data",
    label: "Mandatory technical data complete",
    passed: incompleteItems.length === 0,
    blocking: true,
    message: incompleteItems.length > 0 ? `${incompleteItems.length} line item(s) missing mandatory data` : undefined,
  });

  // 6. Product selection checked (no rejected items)
  const rejectedProducts = lineItems.filter((li) =>
    li.status === "product_rejected" || li.status === "rejected"
  );
  checks.push({
    id: "product_selection",
    label: "Product selection verified",
    passed: rejectedProducts.length === 0,
    blocking: true,
    message: rejectedProducts.length > 0 ? `${rejectedProducts.length} line item(s) have rejected product selection` : undefined,
  });

  // 7. Sizing completed — ONLY for flow devices (flowmeters/rotameters)
  // Level gauges, level switches, pressure transmitters, sight glasses do NOT need sizing
  const sizedFlowItems = lineItems.filter(requiresSizing);
  const unsizedFlowItems = sizedFlowItems.filter((li) => !li.sizingResult);
  checks.push({
    id: "sizing_done",
    label: "Sizing completed for flow items",
    passed: unsizedFlowItems.length === 0,
    blocking: false, // Warning only — user can override
    message: unsizedFlowItems.length > 0
      ? `${unsizedFlowItems.length} of ${sizedFlowItems.length} flow item(s) not sized yet`
      : undefined,
  });

  // 8. Sizing results acceptable (no rejected) — only for flow devices
  const rejectedSizing = sizedFlowItems.filter((li) =>
    li.sizingResult?.status === "rejected"
  );
  checks.push({
    id: "sizing_acceptable",
    label: "Sizing results acceptable",
    passed: rejectedSizing.length === 0,
    blocking: false,
    message: rejectedSizing.length > 0 ? `${rejectedSizing.length} flow item(s) have rejected sizing` : undefined,
  });

  const blockedBy = checks.filter((c) => c.blocking && !c.passed).map((c) => c.id);
  const warningCount = checks.filter((c) => !c.blocking && !c.passed).length;

  return {
    canGenerate: blockedBy.length === 0,
    checks,
    blockedBy,
    warningCount,
  };
}
