// ============================================================
// QAP HTML Renderer — Formal Light Grey Palette
// Single colour: light grey tones only. Clean, professional output.
// ============================================================

import { type QapMasterEntry, type QapProductFamily, getQapMaster } from "./qapMasterData";

export function renderQapHtml(entry: QapMasterEntry, soRef: string, projectName: string, clientName: string): string {
  // Category styling — subtle grey distinctions instead of colours
  const categoryBg = (cat: string) => {
    switch (cat) {
      case "CR": return "background:#e0e0e0;";
      case "MA": return "background:#e8e8e8;";
      case "MI": return "background:#f0f0f0;";
      default: return "background:#f8f8f8;";
    }
  };

  const categoryWeight = (cat: string) => {
    switch (cat) {
      case "CR": return "font-weight:800;";
      case "MA": return "font-weight:700;";
      default: return "font-weight:600;";
    }
  };

  const rows = entry.rows.map((r, idx) => `
    <tr style="${idx % 2 === 1 ? "background:#fafafa;" : "background:#fff;"}">
      <td style="border:1px solid #bbb;padding:4px 5px;text-align:center;font-size:8px;color:#555;${categoryBg(r.category)}${categoryWeight(r.category)}">${r.srNo}</td>
      <td style="border:1px solid #bbb;padding:4px 6px;font-size:8px;font-weight:700;color:#333;">${r.component}</td>
      <td style="border:1px solid #bbb;padding:4px 6px;font-size:8px;color:#444;line-height:1.4;">${r.characteristics}</td>
      <td style="border:1px solid #bbb;padding:4px 5px;text-align:center;font-size:8px;color:#444;${categoryBg(r.category)}${categoryWeight(r.category)}">${r.category}</td>
      <td style="border:1px solid #bbb;padding:4px 6px;font-size:8px;color:#444;">${r.method}</td>
      <td style="border:1px solid #bbb;padding:4px 5px;font-size:8px;text-align:center;color:#555;">${r.extent}</td>
      <td style="border:1px solid #bbb;padding:4px 6px;font-size:8px;color:#555;">${r.reference}</td>
      <td style="border:1px solid #bbb;padding:4px 6px;font-size:8px;color:#444;">${r.acceptance}</td>
      <td style="border:1px solid #bbb;padding:4px 6px;font-size:8px;color:#555;">${r.recordFormat}</td>
      <td style="border:1px solid #bbb;padding:4px 5px;text-align:center;font-size:9px;font-weight:800;color:#333;background:#e0e0e0;">${r.flowtech}</td>
      <td style="border:1px solid #bbb;padding:4px 5px;text-align:center;font-size:8px;color:#666;">${r.agency}</td>
      <td style="border:1px solid #bbb;padding:4px 5px;text-align:center;font-size:8px;color:#666;">${r.client}</td>
      <td style="border:1px solid #bbb;padding:4px 5px;font-size:7px;color:#888;line-height:1.3;">${r.remarks}</td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${entry.title}</title>
<style>
  @media print {
    body { margin:0; padding:0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display:none !important; }
  }
  body { font-family: Arial, "Helvetica Neue", sans-serif; font-size: 10px; color: #444; line-height: 1.4; }
  table { border-collapse: collapse; }
</style>
</head>
<body style="background:#f0f0f0; padding: 16px;">

<div style="max-width: 1200px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.08);">

<!-- Header -->
<table style="width:100%;border-collapse:collapse;border:1px solid #999;margin-bottom:12px;">
  <tr style="background:#d0d0d0;">
    <td colspan="13" style="padding:10px 14px;text-align:center;font-size:14px;font-weight:bold;letter-spacing:0.5px;color:#333;">
      ${entry.title}
    </td>
  </tr>
  <tr style="background:#e8e8e8;">
    <td colspan="8" style="padding:4px 8px;font-size:8px;border:1px solid #bbb;color:#555;">
      <b style="color:#333;">Doc No:</b> ${entry.docNo} &nbsp;|&nbsp; <b style="color:#333;">Rev No:</b> ${entry.revNo} &nbsp;|&nbsp; <b style="color:#333;">Date:</b> ${entry.date}
    </td>
    <td colspan="5" style="padding:4px 8px;font-size:8px;border:1px solid #bbb;text-align:right;color:#555;">
      <b style="color:#333;">QAP NO:</b> _____________ &nbsp; <b style="color:#333;">DATE:</b> _____________
    </td>
  </tr>
  <tr>
    <td colspan="8" style="padding:4px 8px;font-size:8px;border:1px solid #ccc;background:#f8f8f8;color:#555;"><b style="color:#333;">PROJECT NAME:</b> ${projectName || "_______________________________"}</td>
    <td colspan="5" style="padding:4px 8px;font-size:8px;border:1px solid #ccc;background:#f8f8f8;color:#555;"><b style="color:#333;">PO NO:</b> ${soRef || "_________________"} &nbsp; <b style="color:#333;">PO DATE:</b> _____________</td>
  </tr>
  <tr>
    <td colspan="8" style="padding:4px 8px;font-size:8px;border:1px solid #ccc;background:#f8f8f8;color:#555;"><b style="color:#333;">CLIENT NAME:</b> ${clientName || "_______________________________"}</td>
    <td colspan="5" style="padding:4px 8px;font-size:8px;border:1px solid #ccc;background:#f8f8f8;color:#555;"><b style="color:#333;">CONTRACTOR NAME:</b> _______________________________</td>
  </tr>
</table>

<!-- QAP Inspection Table -->
<table style="width:100%;border-collapse:collapse;border:1px solid #999;">
  <thead>
    <tr style="background:#e0e0e0;">
      <th style="border:1px solid #bbb;padding:5px 3px;font-size:7px;width:3%;color:#333;font-weight:800;">SR.<br>NO.</th>
      <th style="border:1px solid #bbb;padding:5px 4px;font-size:7px;width:12%;color:#333;font-weight:800;">COMPONENT /<br>OPERATION</th>
      <th style="border:1px solid #bbb;padding:5px 4px;font-size:7px;width:14%;color:#333;font-weight:800;">CHARACTERISTICS</th>
      <th style="border:1px solid #bbb;padding:5px 3px;font-size:7px;width:5%;color:#333;font-weight:800;">CATEGORY<br>/ CLASS</th>
      <th style="border:1px solid #bbb;padding:5px 4px;font-size:7px;width:10%;color:#333;font-weight:800;">TYPE / METHOD<br>OF CHECK</th>
      <th style="border:1px solid #bbb;padding:5px 3px;font-size:7px;width:7%;color:#333;font-weight:800;">EXTENT OF<br>CHECK</th>
      <th style="border:1px solid #bbb;padding:5px 4px;font-size:7px;width:10%;color:#333;font-weight:800;">REFERENCE<br>DOCUMENT</th>
      <th style="border:1px solid #bbb;padding:5px 4px;font-size:7px;width:10%;color:#333;font-weight:800;">ACCEPTANCE<br>NORM</th>
      <th style="border:1px solid #bbb;padding:5px 4px;font-size:7px;width:9%;color:#333;font-weight:800;">FORMAT OF<br>RECORD</th>
      <th style="border:1px solid #bbb;padding:5px 3px;font-size:7px;width:5%;color:#333;font-weight:800;background:#d0d0d0;">FLOWTECH</th>
      <th style="border:1px solid #bbb;padding:5px 3px;font-size:7px;width:4%;color:#333;font-weight:800;">AGENCY</th>
      <th style="border:1px solid #bbb;padding:5px 3px;font-size:7px;width:4%;color:#333;font-weight:800;">CLIENT</th>
      <th style="border:1px solid #bbb;padding:5px 3px;font-size:7px;width:7%;color:#333;font-weight:800;">REMARKS</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>

<!-- Footer / Sign-off -->
<table style="width:100%;border-collapse:collapse;border:1px solid #999;border-top:none;margin-top:0;">
  <tr style="background:#e8e8e8;">
    <td style="padding:5px 8px;font-size:8px;border:1px solid #bbb;width:12%;color:#333;font-weight:bold;">PREPARED BY</td>
    <td style="padding:5px 8px;font-size:9px;border:1px solid #bbb;width:22%;color:#333;font-weight:bold;">${entry.approvedBy}</td>
    <td colspan="11" rowspan="2" style="padding:6px 8px;font-size:7px;border:1px solid #bbb;color:#666;background:#f8f8f8;line-height:1.5;">
      <b style="color:#444;">Legends:</b> M-Manufacturer &nbsp;|&nbsp; Co-Contractor &nbsp;|&nbsp; T-TPI &nbsp;|&nbsp; C-Client &nbsp;|&nbsp; P-Perform &nbsp;|&nbsp; W-Witness &nbsp;|&nbsp; R-Review &nbsp;|&nbsp; RW-Random Witness<br>
      <b style="color:#444;">Category:</b> MA-Major &nbsp;|&nbsp; MI-Minor &nbsp;|&nbsp; CR-Critical<br>
      <span style="font-style:italic;color:#888;">${entry.remarks}</span>
    </td>
  </tr>
  <tr style="background:#f5f5f5;">
    <td style="padding:5px 8px;font-size:8px;border:1px solid #bbb;color:#333;font-weight:bold;">SIGNATURE</td>
    <td style="padding:5px 8px;font-size:9px;border:1px solid #bbb;color:#aaa;">_______________________</td>
  </tr>
</table>

<!-- Summary Note -->
<table style="width:100%;border-collapse:collapse;border:1px solid #ccc;margin-top:10px;background:#f8f8f8;">
  <tr>
    <td style="padding:6px 10px;font-size:8px;color:#666;text-align:center;">
      This Quality Assurance Plan defines the inspection and testing requirements for <b style="color:#444;">${entry.title.replace("QUALITY ASSURANCE PLAN - ", "")}</b>.
      All inspection points marked <b style="color:#444;">CR</b> (Critical) are mandatory hold points. Category <b style="color:#444;">MA</b> (Major) requires documented evidence.
      Category <b style="color:#444;">MI</b> (Minor) follows standard in-process checks.
    </td>
  </tr>
</table>

<!-- Company Footer -->
<div style="margin-top:8px;font-size:7px;color:#999;text-align:center;">
  Flowtech Measuring Instruments Pvt. Ltd. | 900/2/B, GIDC, Makarpura, Vadodara - 390010, Gujarat, India | ISO 9001:2015 Certified | CONFIDENTIAL
</div>

</div>

</body>
</html>`;
}

export function generateQapForProduct(
  family: QapProductFamily,
  soRef: string,
  projectName: string = "",
  clientName: string = ""
): string {
  const entry = getQapMaster(family);
  return renderQapHtml(entry, soRef, projectName, clientName);
}
