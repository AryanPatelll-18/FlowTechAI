/**
 * Project Report HTML Generators
 * Pure functions to generate exception and full project report HTML.
 */

export interface ReportProject {
  metadata: {
    projectName: string; customerName: string; quoteNumber: string;
    projectReferenceNumber: string; preparedBy: string; reviewedBy: string;
    revisionNumber: string; date: string;
  };
  status: string;
  lineItems: Array<{
    id: string; lineItemNo: string; tagNumber: string; productFamily: string;
    modelNumber: string; size: string; quantity: number; status: string;
    application: string; processMedium: string; flowMin: string; flowMax: string;
    flowUnit: string; pressure: string; temperature: string; moc: string;
    processConnection: string; output: string; certification: string;
  }>;
  productSelectionChecks: Array<{
    lineItemId: string; status: string; reason: string; ruleSource: string;
    recommendedAlternative?: string;
  }>;
  sizingVerificationChecks: Array<{
    lineItemId: string; status: string; calculatedResult: string;
    calculationMethod: string; acceptableRange: string; correctionRequired?: string;
  }>;
  documentMappingChecks: Array<{
    lineItemId: string; documentType: string; status: string;
  }>;
}

export interface SizingResultRef {
  instrumentId: string; bestSize: string; qMin: number; qMax: number;
  qMinUnit: string; velocityStatus?: string;
}

const STYLE = "body{font-family:Arial,sans-serif;margin:40px;color:#333}" +
  ".header{display:flex;align-items:center;border-bottom:3px solid #c20017;padding-bottom:15px;margin-bottom:25px}" +
  ".logo{font-size:24px;font-weight:bold;color:#c20017}" +
  "table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:20px}" +
  "td,th{padding:6px 10px;border:1px solid #ddd;text-align:left}" +
  "th{background:#f5f5f5;font-weight:bold}" +
  ".status-warn{color:#d97706}.status-err{color:#dc2626}.status-ok{color:#16a34a}" +
  ".toc{background:#fafafa;padding:15px;border:1px solid #ddd;margin-bottom:20px}" +
  ".toc a{color:#c20017;text-decoration:none}" +
  ".section{margin-bottom:30px;border-top:2px solid #c20017;padding-top:15px}" +
  ".footer{margin-top:30px;padding-top:15px;border-top:2px solid #c20017;font-size:10px;color:#666;text-align:center}";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function generateExceptionReportHtml(project: ReportProject): string {
  const prodIssues = project.productSelectionChecks.filter((c) => c.status === "warning" || c.status === "wrong");
  const sizingIssues = project.sizingVerificationChecks.filter((c) => c.status === "warning" || c.status === "wrong");
  const mappingIssues = project.documentMappingChecks.filter((c) => c.status === "missing");
  const meta = project.metadata;

  let prodRows = "";
  if (prodIssues.length === 0) {
    prodRows = "<tr><td colspan=4>No product selection issues</td></tr>";
  } else {
    for (const i of prodIssues) {
      const li = project.lineItems.find((l) => l.id === i.lineItemId);
      const cls = i.status === "warning" ? "warn" : "err";
      prodRows += "<tr><td>" + esc(li?.tagNumber || i.lineItemId) + "</td><td class=\"status-" + cls + "\">" + i.status.toUpperCase() + "</td><td>" + esc(i.reason) + "</td><td>" + esc(i.ruleSource) + "</td></tr>";
    }
  }

  let sizeRows = "";
  if (sizingIssues.length === 0) {
    sizeRows = "<tr><td colspan=4>No sizing issues</td></tr>";
  } else {
    for (const i of sizingIssues) {
      const li = project.lineItems.find((l) => l.id === i.lineItemId);
      const cls = i.status === "warning" ? "warn" : "err";
      sizeRows += "<tr><td>" + esc(li?.tagNumber || i.lineItemId) + "</td><td class=\"status-" + cls + "\">" + i.status.toUpperCase() + "</td><td>" + esc(i.calculatedResult) + "</td><td>" + esc(i.correctionRequired || "N/A") + "</td></tr>";
    }
  }

  let mapRows = "";
  if (mappingIssues.length === 0) {
    mapRows = "<tr><td colspan=3>No document mapping issues</td></tr>";
  } else {
    for (const i of mappingIssues) {
      const li = project.lineItems.find((l) => l.id === i.lineItemId);
      mapRows += "<tr><td>" + esc(li?.tagNumber || i.lineItemId) + "</td><td>" + esc(i.documentType) + "</td><td class=\"status-err\">MISSING</td></tr>";
    }
  }

  const now = new Date().toLocaleString();
  return "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Exception Report</title><style>" + STYLE + "</style></head><body>" +
    "<div class=\"header\"><div class=\"logo\">FLOWTECH</div><div style=\"margin-left:20px\"><h1>Exception Report</h1><p>" + esc(meta.projectName) + " | " + esc(meta.customerName) + " | " + esc(meta.quoteNumber) + "</p></div></div>" +
    "<h2>Product Selection Issues (" + prodIssues.length + ")</h2><table><tr><th>Line Item</th><th>Status</th><th>Reason</th><th>Rule Source</th></tr>" + prodRows + "</table>" +
    "<h2>Sizing Issues (" + sizingIssues.length + ")</h2><table><tr><th>Line Item</th><th>Status</th><th>Calculated Result</th><th>Correction Required</th></tr>" + sizeRows + "</table>" +
    "<h2>Document Mapping Issues (" + mappingIssues.length + ")</h2><table><tr><th>Line Item</th><th>Document Type</th><th>Status</th></tr>" + mapRows + "</table>" +
    "<div class=\"footer\">Flowtech Instruments (I) Pvt. Ltd. &mdash; Exception Report &mdash; Generated " + now + "</div></body></html>";
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft", uploaded: "Uploaded", extraction_completed: "Extraction Done",
  review_required: "Review Required", product_selection_checked: "Product Checked",
  sizing_checked: "Sizing Checked", document_mapping_completed: "Mapping Done",
  ready_for_report: "Ready for Report", exception_found: "Exception Found",
  report_generated: "Report Generated", closed: "Closed",
};

const LI_STATUS_LABELS: Record<string, string> = {
  extracted: "Extracted", reviewed: "Reviewed", product_ok: "Product OK",
  product_warning: "Product Warn", product_rejected: "Product Rejected",
  sizing_ok: "Sizing OK", sizing_warning: "Sizing Warn", sizing_rejected: "Sizing Rejected",
  mapping_ok: "Mapping OK", mapping_incomplete: "Incomplete", approved: "Approved",
  hold: "On Hold", rejected: "Rejected",
};

export function generateFullReportHtml(project: ReportProject, sizingResults: SizingResultRef[]): string {
  const meta = project.metadata;
  const stLabel = STATUS_LABELS[project.status] || project.status;

  let instrRows = "";
  for (const li of project.lineItems) {
    const lbl = LI_STATUS_LABELS[li.status] || li.status;
    instrRows += "<tr><td>" + li.lineItemNo + "</td><td>" + esc(li.tagNumber) + "</td><td>" + esc(li.productFamily) + "</td><td>" + esc(li.modelNumber) + "</td><td>" + esc(li.size) + "</td><td>" + li.quantity + "</td><td>" + lbl + "</td></tr>";
  }

  let dsRows = "";
  for (const li of project.lineItems) {
    dsRows += "<h3>" + esc(li.tagNumber) + " &mdash; " + esc(li.modelNumber) + "</h3><table>" +
      "<tr><th>Application</th><td>" + esc(li.application) + "</td></tr>" +
      "<tr><th>Process Medium</th><td>" + esc(li.processMedium) + "</td></tr>" +
      "<tr><th>Flow Rate</th><td>" + esc(li.flowMin) + " - " + esc(li.flowMax) + " " + esc(li.flowUnit) + "</td></tr>" +
      "<tr><th>Pressure</th><td>" + esc(li.pressure) + "</td></tr>" +
      "<tr><th>Temperature</th><td>" + esc(li.temperature) + "</td></tr>" +
      "<tr><th>MOC</th><td>" + esc(li.moc) + "</td></tr>" +
      "<tr><th>Process Connection</th><td>" + esc(li.processConnection) + "</td></tr>" +
      "<tr><th>Output</th><td>" + esc(li.output) + "</td></tr>" +
      "<tr><th>Certification</th><td>" + esc(li.certification) + "</td></tr></table>";
  }

  let sizeRows = "";
  for (const li of project.lineItems) {
    const sr = sizingResults.find((r) => r.instrumentId === li.id);
    sizeRows += "<tr><td>" + esc(li.tagNumber) + "</td><td>" + (sr?.bestSize || "N/A") + "</td><td>" +
      (sr ? sr.qMin.toFixed(1) : "N/A") + "</td><td>" +
      (sr ? sr.qMax.toFixed(1) : "N/A") + "</td><td>" +
      (sr?.velocityStatus || "N/A") + "</td></tr>";
  }

  const now = new Date().toLocaleString();
  return "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Full Project Report</title><style>" + STYLE + "</style></head><body>" +
    "<div class=\"header\"><div class=\"logo\">FLOWTECH</div><div style=\"margin-left:20px\"><h1>Full Project Report</h1><p>" + esc(meta.projectName) + " | " + esc(meta.customerName) + " | Quote: " + esc(meta.quoteNumber) + "</p></div></div>" +
    "<div class=\"toc\"><h3>Clickable Index</h3>" +
    "<a href=\"#sec1\">1. Cover Page</a><br>" +
    "<a href=\"#sec2\">2. Instrument Summary</a><br>" +
    "<a href=\"#sec3\">3. Line Item Datasheets</a><br>" +
    "<a href=\"#sec4\">4. QAP</a><br>" +
    "<a href=\"#sec5\">5. Sizing Report</a><br></div>" +
    "<div id=\"sec1\" class=\"section\"><h2>1. Cover Page</h2><table>" +
    "<tr><th>Project Name</th><td>" + esc(meta.projectName) + "</td></tr>" +
    "<tr><th>Customer</th><td>" + esc(meta.customerName) + "</td></tr>" +
    "<tr><th>Quote/SO Number</th><td>" + esc(meta.quoteNumber) + "</td></tr>" +
    "<tr><th>Reference</th><td>" + esc(meta.projectReferenceNumber) + "</td></tr>" +
    "<tr><th>Prepared By</th><td>" + esc(meta.preparedBy) + "</td></tr>" +
    "<tr><th>Reviewed By</th><td>" + esc(meta.reviewedBy) + "</td></tr>" +
    "<tr><th>Revision</th><td>" + esc(meta.revisionNumber) + "</td></tr>" +
    "<tr><th>Date</th><td>" + esc(meta.date) + "</td></tr>" +
    "<tr><th>Status</th><td>" + stLabel + "</td></tr>" +
    "<tr><th>Total Line Items</th><td>" + project.lineItems.length + "</td></tr></table></div>" +
    "<div id=\"sec2\" class=\"section\"><h2>2. Instrument Summary</h2><table><tr><th>Line#</th><th>Tag</th><th>Product Family</th><th>Model</th><th>Size</th><th>Qty</th><th>Status</th></tr>" + instrRows + "</table></div>" +
    "<div id=\"sec3\" class=\"section\"><h2>3. Line Item Datasheets</h2>" + dsRows + "</div>" +
    "<div id=\"sec4\" class=\"section\"><h2>4. QAP</h2><p>Quality Assurance Plan for each product family is attached as per Flowtech approved templates.</p></div>" +
    "<div id=\"sec5\" class=\"section\"><h2>5. Sizing Report</h2><table><tr><th>Line Item</th><th>Size</th><th>Qmin</th><th>Qmax</th><th>Velocity Status</th></tr>" + sizeRows + "</table></div>" +
    "<div class=\"footer\">Flowtech Instruments (I) Pvt. Ltd. &mdash; Full Project Report &mdash; Generated " + now + "</div></body></html>";
}
