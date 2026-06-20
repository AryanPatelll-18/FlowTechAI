// ============================================================
// De-codification Datasheet Renderer — Formal Light Grey Palette
// Single colour: light grey tones only. Clean, professional output.
// ============================================================

import {
  DECODE_MASTER_MAP,
  type DecodificationEntry,
  type DecodeProductFamily,
} from "./decodeDatasheetData";

export function renderDecodeHtml(
  entry: DecodificationEntry,
  soRef: string,
  projectName: string,
  clientName: string
): string {
  // Build order code blanks
  const codeBlanks = entry.categories
    .map(() => `<td style="border:1px solid #bbb;padding:8px;text-align:center;font-size:14px;font-weight:bold;background:#fff;color:#555;">__</td>`)
    .join("");

  const codePositions = entry.categories
    .map((cat) => `<td style="border:1px solid #bbb;padding:5px;text-align:center;font-size:9px;color:#888;background:#f5f5f5;font-weight:600;">${cat.position}</td>`)
    .join("");

  // Build de-codification tables — 2 columns side by side
  const half = Math.ceil(entry.categories.length / 2);
  const leftCategories = entry.categories.slice(0, half);
  const rightCategories = entry.categories.slice(half);

  function renderCategoryTable(cat: typeof entry.categories[0]): string {
    const rows = cat.options
      .map(
        (opt) => `
      <tr style="border-bottom:1px solid #e0e0e0;">
        <td style="padding:5px 8px;font-size:9px;font-weight:bold;color:#666;width:28%;border-right:1px solid #e0e0e0;background:#fafafa;">${opt.code}</td>
        <td style="padding:5px 8px;font-size:9px;color:#444;">${opt.description}</td>
      </tr>
    `
      )
      .join("");

    return `
      <table style="width:100%;border-collapse:collapse;border:1px solid #bbb;margin-bottom:10px;font-size:9px;background:#fff;">
        <thead>
          <tr style="background:#d5d5d5;">
            <th colspan="2" style="padding:6px 8px;font-size:9px;text-align:left;font-weight:bold;color:#333;border-bottom:1px solid #bbb;">
              <span style="color:#777;font-weight:700;">POS ${cat.position}</span> — ${cat.name}
            </th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  const leftTables = leftCategories.map(renderCategoryTable).join("");
  const rightTables = rightCategories.map(renderCategoryTable).join("");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${entry.productName} — Master Decodification Sheet</title>
<style>
  @media print {
    body { margin:0; padding:0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display:none !important; }
    .page-break { page-break-before: always; }
  }
  body { font-family: Arial, "Helvetica Neue", sans-serif; font-size: 10px; color: #444; line-height: 1.4; }
  table { border-collapse: collapse; }
</style>
</head>
<body style="background:#f0f0f0; padding: 20px;">

<div style="max-width: 1000px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.08);">

<!-- Header -->
<table style="width:100%;border-collapse:collapse;border:1px solid #999;margin-bottom:14px;">
  <tr style="background:#e0e0e0;">
    <td colspan="2" style="padding:12px 16px;text-align:center;font-size:15px;font-weight:bold;letter-spacing:0.5px;color:#333;">
      ${entry.headerTitle}
    </td>
  </tr>
  <tr>
    <td style="padding:5px 10px;font-size:9px;border:1px solid #ccc;width:50%;color:#555;">
      <b>Doc No:</b> ${entry.docNo} &nbsp;|&nbsp; <b>Rev:</b> ${entry.revision} &nbsp;|&nbsp; <b>Date:</b> ${entry.date}
    </td>
    <td style="padding:5px 10px;font-size:9px;border:1px solid #ccc;text-align:right;color:#555;">
      <b>Page:</b> 2 &nbsp;|&nbsp; <b>SO Ref:</b> ${soRef || "_____________"}
    </td>
  </tr>
  <tr>
    <td style="padding:5px 10px;font-size:9px;border:1px solid #ccc;color:#555;"><b>Project:</b> ${projectName || "_______________________________"}</td>
    <td style="padding:5px 10px;font-size:9px;border:1px solid #ccc;color:#555;"><b>Client:</b> ${clientName || "_______________________________"}</td>
  </tr>
</table>

<!-- Core Message -->
<table style="width:100%;border-collapse:collapse;border:1px solid #ccc;margin-bottom:14px;background:#f8f8f8;">
  <tr>
    <td style="padding:10px 14px;font-size:10px;color:#555;">
      <b style="font-size:11px;color:#333;">${entry.description.split("Rule:")[0].trim()}</b><br>
      <b style="color:#666;">Rule:</b> Any option marked <b style="color:#333;">CUSTOM / CU</b> must carry clear technical details.
    </td>
  </tr>
</table>

<!-- Order Code Structure -->
<table style="width:100%;border-collapse:collapse;border:1px solid #999;margin-bottom:16px;background:#fff;">
  <tr style="background:#e8e8e8;">
    <td colspan="${entry.categories.length + 1}" style="padding:8px 12px;font-size:11px;font-weight:bold;text-align:center;letter-spacing:0.5px;color:#444;">
      ORDER CODE STRUCTURE
    </td>
  </tr>
  <tr>
    <td style="border:1px solid #bbb;padding:8px 10px;font-size:13px;font-weight:bold;background:#ddd;color:#333;text-align:center;width:160px;">
      ${entry.modelPrefix}-
    </td>
    ${codeBlanks}
  </tr>
  <tr style="background:#f5f5f5;">
    <td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:8px;color:#888;font-weight:600;">MODEL PREFIX</td>
    ${codePositions}
  </tr>
</table>

<!-- Master Decode Options Header -->
<table style="width:100%;border-collapse:collapse;border:1px solid #999;margin-bottom:10px;">
  <tr style="background:#d0d0d0;">
    <td colspan="4" style="padding:8px 12px;font-size:12px;font-weight:bold;text-align:center;letter-spacing:0.5px;color:#333;">
      MASTER DECODE OPTIONS
    </td>
  </tr>
</table>

<!-- Two-column decode tables -->
<table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
  <tr>
    <td style="width:50%;vertical-align:top;padding-right:6px;">
      ${leftTables}
    </td>
    <td style="width:50%;vertical-align:top;padding-left:6px;">
      ${rightTables}
    </td>
  </tr>
</table>

<!-- Steps reminder -->
<table style="width:100%;border-collapse:collapse;border:1px solid #ccc;margin-bottom:14px;background:#f8f8f8;">
  <tr style="background:#e0e0e0;">
    <td style="padding:6px 10px;font-size:9px;text-align:center;font-weight:bold;width:25%;color:#444;border-right:1px solid #ccc;">1. Pick Model</td>
    <td style="padding:6px 10px;font-size:9px;text-align:center;font-weight:bold;width:25%;color:#444;border-right:1px solid #ccc;">2. Check Fit</td>
    <td style="padding:6px 10px;font-size:9px;text-align:center;font-weight:bold;width:25%;color:#444;border-right:1px solid #ccc;">3. Decode Extras</td>
    <td style="padding:6px 10px;font-size:9px;text-align:center;font-weight:bold;width:25%;color:#444;">4. Attach CU Details</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;font-size:8px;text-align:center;color:#777;border-right:1px solid #ddd;">Fast family selection</td>
    <td style="padding:5px 8px;font-size:8px;text-align:center;color:#777;border-right:1px solid #ddd;">Variant covers big needs</td>
    <td style="padding:5px 8px;font-size:8px;text-align:center;color:#777;border-right:1px solid #ddd;">Use ${entry.modelPrefix} code</td>
    <td style="padding:5px 8px;font-size:8px;text-align:center;color:#777;">MOC, standard, pressure, drawings</td>
  </tr>
</table>

<!-- Catalogue Reference -->
<table style="width:100%;border-collapse:collapse;border:1px solid #ccc;margin-bottom:14px;">
  <tr>
    <td style="padding:6px 10px;font-size:9px;color:#666;background:#fafafa;">
      <b>Catalogue Reference:</b> ${entry.catalogueRef}
    </td>
  </tr>
</table>

<!-- Footer -->
<table style="width:100%;border-collapse:collapse;border:1px solid #999;">
  <tr>
    <td style="padding:6px 10px;font-size:8px;border:1px solid #ccc;width:20%;color:#555;"><b>Prepared By</b></td>
    <td style="padding:6px 10px;font-size:9px;border:1px solid #ccc;width:30%;color:#555;">_______________________</td>
    <td style="padding:6px 10px;font-size:8px;border:1px solid #ccc;width:20%;color:#555;"><b>Approved By</b></td>
    <td style="padding:6px 10px;font-size:9px;border:1px solid #ccc;width:30%;color:#555;">_______________________</td>
  </tr>
</table>

<div style="margin-top:8px;font-size:7px;color:#999;text-align:center;">
  Flowtech Measuring Instruments Pvt. Ltd. | 900/2/B, GIDC, Makarpura, Vadodara - 390010, Gujarat, India | ISO 9001:2015 Certified | CONFIDENTIAL
</div>

<div style="margin-top:10px;font-size:8px;color:#aaa;text-align:center;font-style:italic;">
  Practical note: model names keep quotations simple; master decodification keeps engineered orders precise.
</div>

</div>

<script>
  // Auto-print on load for PDF generation
  // window.print();
</script>

</body>
</html>`;
}

export function generateDecodeForProduct(
  family: DecodeProductFamily,
  soRef: string,
  projectName: string = "",
  clientName: string = ""
): string | null {
  const entry = DECODE_MASTER_MAP[family];
  if (!entry) return null;
  return renderDecodeHtml(entry, soRef, projectName, clientName);
}
