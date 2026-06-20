// ============================================================
// Datasheet Renderer — Render datasheet entries as printable HTML
// ============================================================

import {
  DATASHEET_PRODUCT_LABELS,
  type DatasheetMasterEntry,
  type DatasheetProductFamily,
} from "./datasheetMasterData";

export function renderDatasheetHtml(
  entry: DatasheetMasterEntry,
  soRef: string,
  projectName: string,
  clientName: string
): string {
  const title = entry.productName;
  const productLabel = DATASHEET_PRODUCT_LABELS[entry.productFamily];

  const sectionsHtml = entry.sections
    .map(
      (section) => `
    <div style="margin-bottom:16px; border:1px solid #e5e7eb; border-radius:6px; overflow:hidden;">
      <div style="background:#1e3a5f; color:#fff; padding:8px 12px; font-size:11px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px;">
        ${section.heading}
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:10px;">
        <tbody>
          ${section.fields
            .map(
              (field, idx) => `
            <tr style="background:${idx % 2 === 1 ? "#f9fafb" : "#fff"}; border-bottom:1px solid #f3f4f6;">
              <td style="padding:6px 10px; width:35%; color:#4b5563; font-weight:600; border-right:1px solid #e5e7eb; vertical-align:top;">${field.label}</td>
              <td style="padding:6px 10px; color:#111827; font-weight:500; vertical-align:top;">${field.value}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `
    )
    .join("");

  const orderingHtml = entry.orderingInfo
    .map(
      (item) => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:5px 10px; font-weight:bold; color:#1e3a5f; width:40px;">${item.code}</td>
      <td style="padding:5px 10px; color:#374151;">${item.description}</td>
    </tr>
  `
    )
    .join("");

  const certificationsHtml = entry.certifications
    .map((cert) => `<span style="display:inline-block; background:#ecfdf5; color:#065f46; padding:3px 8px; border-radius:4px; font-size:9px; font-weight:600; margin:2px; border:1px solid #a7f3d0;">${cert}</span>`)
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title} — Datasheet</title>
<style>
  @media print {
    body { margin:0; padding:0; }
    .no-print { display:none; }
  }
  body { font-family:'Segoe UI',Arial,sans-serif; font-size:10px; color:#374151; line-height:1.5; }
  table { border-collapse:collapse; }
</style>
</head>
<body style="background:#f3f4f6; padding:20px;">
<div style="max-width:900px; margin:0 auto; background:#fff; padding:24px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">

  <!-- Header -->
  <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #1e3a5f; padding-bottom:12px; margin-bottom:16px;">
    <div>
      <div style="font-size:18px; font-weight:bold; color:#1e3a5f; letter-spacing:-0.5px;">FLOWTECH MEASURING INSTRUMENTS PVT. LTD.</div>
      <div style="font-size:9px; color:#6b7280; margin-top:2px;">Vadodara, Gujarat, India · www.flowtechinstruments.com</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px; font-weight:bold; color:#1e3a5f;">TECHNICAL DATASHEET</div>
      <div style="font-size:9px; color:#6b7280; margin-top:2px;">${entry.docNo} · ${entry.revision}</div>
    </div>
  </div>

  <!-- Document Info -->
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; font-size:10px;">
    <div style="background:#f9fafb; padding:10px; border-radius:6px; border:1px solid #e5e7eb;">
      <div style="font-weight:bold; color:#1e3a5f; margin-bottom:4px;">SO / PO Reference</div>
      <div style="color:#374151;">${soRef || "—"}</div>
    </div>
    <div style="background:#f9fafb; padding:10px; border-radius:6px; border:1px solid #e5e7eb;">
      <div style="font-weight:bold; color:#1e3a5f; margin-bottom:4px;">Project</div>
      <div style="color:#374151;">${projectName || "—"}</div>
    </div>
    <div style="background:#f9fafb; padding:10px; border-radius:6px; border:1px solid #e5e7eb;">
      <div style="font-weight:bold; color:#1e3a5f; margin-bottom:4px;">Client</div>
      <div style="color:#374151;">${clientName || "—"}</div>
    </div>
    <div style="background:#f9fafb; padding:10px; border-radius:6px; border:1px solid #e5e7eb;">
      <div style="font-weight:bold; color:#1e3a5f; margin-bottom:4px;">Date</div>
      <div style="color:#374151;">${entry.date}</div>
    </div>
  </div>

  <!-- Product Title -->
  <div style="background:linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color:#fff; padding:14px 16px; border-radius:6px; margin-bottom:16px;">
    <div style="font-size:14px; font-weight:bold;">${title}</div>
    <div style="font-size:10px; opacity:0.9; margin-top:2px;">Model Series: ${entry.modelSeries} · ${productLabel}</div>
  </div>

  <!-- Description -->
  <div style="background:#fef3c7; border:1px solid #fcd34d; border-radius:6px; padding:10px 12px; margin-bottom:16px; font-size:10px; color:#92400e;">
    <strong>Description:</strong> ${entry.description}
  </div>

  <!-- Sections -->
  ${sectionsHtml}

  <!-- Ordering Information -->
  <div style="margin-top:20px; margin-bottom:16px; border:1px solid #e5e7eb; border-radius:6px; overflow:hidden;">
    <div style="background:#7c3aed; color:#fff; padding:8px 12px; font-size:11px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px;">
      Ordering Information
    </div>
    <table style="width:100%; border-collapse:collapse; font-size:10px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:6px 10px; text-align:left; border-bottom:1px solid #e5e7eb; width:50px;">Code</th>
          <th style="padding:6px 10px; text-align:left; border-bottom:1px solid #e5e7eb;">Description</th>
        </tr>
      </thead>
      <tbody>${orderingHtml}</tbody>
    </table>
  </div>

  <!-- Certifications -->
  <div style="margin-bottom:16px;">
    <div style="font-size:10px; font-weight:bold; color:#1e3a5f; margin-bottom:6px;">Certifications & Standards</div>
    <div>${certificationsHtml}</div>
  </div>

  <!-- Footer -->
  <div style="border-top:2px solid #e5e7eb; padding-top:12px; margin-top:20px; text-align:center; font-size:8px; color:#9ca3af;">
    <div>Flowtech Measuring Instruments Pvt. Ltd. · Technical Datasheet · ${entry.docNo} · ${entry.revision}</div>
    <div style="margin-top:2px;">This document contains proprietary information. Reproduction without written permission is prohibited.</div>
  </div>

</div>
</body>
</html>`;
}

import { DATASHEET_MASTER_MAP } from "./datasheetMasterData";

export function generateDatasheetForProduct(
  family: DatasheetProductFamily,
  soRef: string,
  projectName: string,
  clientName: string
): string | null {
  const entry = DATASHEET_MASTER_MAP[family];
  if (!entry) return null;
  return renderDatasheetHtml(entry, soRef, projectName, clientName);
}
