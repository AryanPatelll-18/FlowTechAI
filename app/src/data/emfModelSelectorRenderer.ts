// ============================================================
// EMF Model Selector Renderer — Formal Light Grey Palette
// Shows pre-configured model code with xx positions as blanks.
// ============================================================

import {
  DECODE_EMF,
  type DecodeCategory,
} from "./decodeDatasheetData";
import {
  type EmfModelConfig,
} from "./emfModelSelectorData";

export function renderEmfModelSelectorHtml(
  model: EmfModelConfig,
  soRef: string,
  projectName: string,
  clientName: string
): string {
  const entry = DECODE_EMF;

  // Split the model code into segments after the prefix
  const codeSegments = model.modelCode.replace("FMIPL-EMFM-", "").split("-");

  // Build order code display: pre-filled for fixed, blank for xx
  const codeCells = codeSegments
    .map((seg) => {
      if (seg === "xx") {
        return `<td style="border:1px solid #999;padding:7px 5px;text-align:center;font-size:12px;font-weight:bold;background:#fff;color:#fff;min-width:32px;">__</td>`;
      }
      return `<td style="border:1px solid #bbb;padding:7px 5px;text-align:center;font-size:11px;font-weight:bold;background:#e8e8e8;color:#333;min-width:32px;">${seg}</td>`;
    })
    .join("");

  // Position numbers under each cell
  const allPositions = entry.categories.map((c) => c.position);
  let posIdx = 0;
  const positionCells = codeSegments
    .map((seg) => {
      if (seg === "xx" && posIdx < allPositions.length) {
        const pos = allPositions[posIdx++];
        return `<td style="border:1px solid #999;padding:4px;text-align:center;font-size:8px;color:#fff;background:#888;font-weight:700;">${pos}</td>`;
      }
      if (posIdx < allPositions.length) {
        const pos = allPositions[posIdx++];
        return `<td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:8px;color:#888;background:#f0f0f0;font-weight:600;">${pos}</td>`;
      }
      return `<td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:8px;color:#888;background:#f0f0f0;">-</td>`;
    })
    .join("");

  // Build configurable positions legend
  const configCategories = entry.categories.filter((c) =>
    model.configurablePositions.includes(c.position)
  );

  const configLegendRows = configCategories
    .map((cat) => {
      const optionsHtml = cat.options
        .map(
          (opt) =>
            `<span style="display:inline-block;margin:2px 4px 2px 0;padding:2px 6px;background:#f0f0f0;border:1px solid #d0d0d0;border-radius:2px;font-size:8px;color:#555;"><b>${opt.code}</b> = ${opt.description}</span>`
        )
        .join("");
      return `
        <tr style="border-bottom:1px solid #e0e0e0;">
          <td style="padding:5px 8px;font-size:9px;font-weight:bold;color:#444;width:22%;border-right:1px solid #e0e0e0;background:#fafafa;vertical-align:top;">
            POS ${cat.position}<br><span style="font-size:8px;color:#777;font-weight:400;">${cat.name}</span>
          </td>
          <td style="padding:5px 8px;font-size:9px;color:#444;">${optionsHtml}</td>
        </tr>
      `;
    })
    .join("");

  // Fixed specs summary table
  const fixedCategories = entry.categories.filter(
    (c) => !model.configurablePositions.includes(c.position)
  );

  const fixedSpecsRows = fixedCategories
    .map((cat) => {
      // Find which code segment corresponds to this position
      let currentPos = 0;
      let foundSeg = "xx";
      for (const seg of codeSegments) {
        currentPos++;
        if (currentPos === cat.position) {
          foundSeg = seg;
          break;
        }
      }
      const option = cat.options.find((o) => o.code === foundSeg);
      return `
        <tr style="border-bottom:1px solid #e8e8e8;">
          <td style="padding:4px 8px;font-size:8px;color:#666;width:8%;border-right:1px solid #e0e0e0;text-align:center;font-weight:bold;">${cat.position}</td>
          <td style="padding:4px 8px;font-size:8px;color:#555;width:28%;border-right:1px solid #e0e0e0;">${cat.name}</td>
          <td style="padding:4px 8px;font-size:8px;font-weight:bold;color:#444;width:15%;border-right:1px solid #e0e0e0;background:#f5f5f5;">${foundSeg}</td>
          <td style="padding:4px 8px;font-size:8px;color:#444;">${option?.description || "—"}</td>
        </tr>
      `;
    })
    .join("");

  // Highlights pills
  const highlightsHtml = model.highlights
    .map(
      (h) =>
        `<span style="display:inline-block;margin:2px 4px 2px 0;padding:3px 8px;background:#e8e8e8;border:1px solid #ccc;border-radius:2px;font-size:9px;color:#444;">${h}</span>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${model.modelName} — Model Selector Datasheet</title>
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
      MODEL SELECTOR — ELECTROMAGNETIC FLOW METER
    </td>
  </tr>
  <tr>
    <td style="padding:5px 10px;font-size:9px;border:1px solid #ccc;width:50%;color:#555;">
      <b>Doc No:</b> FT-DS-EMF-MS-001 &nbsp;|&nbsp; <b>Rev:</b> Rev.1 &nbsp;|&nbsp; <b>Date:</b> 01/01/2024
    </td>
    <td style="padding:5px 10px;font-size:9px;border:1px solid #ccc;text-align:right;color:#555;">
      <b>Page:</b> 1 &nbsp;|&nbsp; <b>SO Ref:</b> ${soRef || "_____________"}
    </td>
  </tr>
  <tr>
    <td style="padding:5px 10px;font-size:9px;border:1px solid #ccc;color:#555;"><b>Project:</b> ${projectName || "_______________________________"}</td>
    <td style="padding:5px 10px;font-size:9px;border:1px solid #ccc;color:#555;"><b>Client:</b> ${clientName || "_______________________________"}</td>
  </tr>
</table>

<!-- Model Identity Banner -->
<table style="width:100%;border-collapse:collapse;border:1px solid #999;margin-bottom:14px;background:#e8e8e8;">
  <tr>
    <td style="padding:14px 16px;text-align:center;">
      <div style="font-size:20px;font-weight:bold;color:#333;letter-spacing:1px;margin-bottom:4px;">${model.modelName}</div>
      <div style="font-size:10px;color:#666;">Pre-configured Model Code — Fill in the <b style="color:#fff;background:#888;padding:1px 6px;border-radius:2px;">__</b> positions to complete the order</div>
    </td>
  </tr>
</table>

<!-- Model Description + Highlights -->
<table style="width:100%;border-collapse:collapse;border:1px solid #ccc;margin-bottom:14px;background:#f8f8f8;">
  <tr>
    <td style="padding:10px 14px;font-size:10px;color:#555;">
      <b style="font-size:11px;color:#333;">${model.description}</b><br>
      <div style="margin-top:6px;">${highlightsHtml}</div>
    </td>
  </tr>
</table>

<!-- Order Code Structure -->
<table style="width:100%;border-collapse:collapse;border:1px solid #999;margin-bottom:16px;background:#fff;">
  <tr style="background:#e8e8e8;">
    <td colspan="${codeSegments.length + 1}" style="padding:8px 12px;font-size:11px;font-weight:bold;text-align:center;letter-spacing:0.5px;color:#444;">
      ORDER CODE — ${model.modelName.toUpperCase()}
    </td>
  </tr>
  <tr>
    <td style="border:1px solid #bbb;padding:8px 10px;font-size:13px;font-weight:bold;background:#ddd;color:#333;text-align:center;width:140px;">
      FMIPL-EMFM-
    </td>
    ${codeCells}
  </tr>
  <tr style="background:#f5f5f5;">
    <td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:8px;color:#888;font-weight:600;">MODEL PREFIX</td>
    ${positionCells}
  </tr>
</table>

${model.allConfig ? `
<!-- Full Config Note -->
<table style="width:100%;border-collapse:collapse;border:1px solid #ccc;margin-bottom:14px;background:#f8f8f8;">
  <tr>
    <td style="padding:10px 14px;font-size:10px;color:#555;text-align:center;">
      <b style="font-size:11px;color:#333;">This is a fully configurable model.</b> All positions must be specified using the master de-codification table below.<br>
      Refer to the <b>Master Decode Options</b> table to select the appropriate code for each position.
    </td>
  </tr>
</table>
` : ""}

<!-- Two-column layout: Fixed Specs | Configurable Options -->
<table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
  <tr>
    <!-- Left: Fixed Specifications -->
    <td style="width:48%;vertical-align:top;padding-right:8px;">
      <table style="width:100%;border-collapse:collapse;border:1px solid #999;">
        <tr style="background:#d5d5d5;">
          <td colspan="4" style="padding:8px 10px;font-size:11px;font-weight:bold;text-align:center;color:#333;">
            FIXED SPECIFICATIONS
          </td>
        </tr>
        <tr style="background:#e0e0e0;">
          <td style="padding:4px 8px;font-size:8px;font-weight:bold;color:#555;width:8%;border-right:1px solid #ccc;">POS</td>
          <td style="padding:4px 8px;font-size:8px;font-weight:bold;color:#555;width:28%;border-right:1px solid #ccc;">PARAMETER</td>
          <td style="padding:4px 8px;font-size:8px;font-weight:bold;color:#555;width:15%;border-right:1px solid #ccc;">CODE</td>
          <td style="padding:4px 8px;font-size:8px;font-weight:bold;color:#555;">DESCRIPTION</td>
        </tr>
        ${fixedSpecsRows}
      </table>
    </td>
    <!-- Spacer -->
    <td style="width:4%;"></td>
    <!-- Right: Configurable Positions -->
    <td style="width:48%;vertical-align:top;padding-left:8px;">
      <table style="width:100%;border-collapse:collapse;border:1px solid #999;">
        <tr style="background:#888;">
          <td colspan="2" style="padding:8px 10px;font-size:11px;font-weight:bold;text-align:center;color:#fff;">
            CONFIGURABLE POSITIONS — SELECT OPTIONS
          </td>
        </tr>
        ${configLegendRows}
      </table>
    </td>
  </tr>
</table>

<!-- Master Decode Options Header -->
<table style="width:100%;border-collapse:collapse;border:1px solid #999;margin-bottom:10px;">
  <tr style="background:#d0d0d0;">
    <td colspan="4" style="padding:8px 12px;font-size:12px;font-weight:bold;text-align:center;letter-spacing:0.5px;color:#333;">
      MASTER DECODE OPTIONS — FOR REFERENCE
    </td>
  </tr>
</table>

<!-- Master decode tables (2-column) -->
${renderMasterDecodeTables(entry)}

<!-- Steps reminder -->
<table style="width:100%;border-collapse:collapse;border:1px solid #ccc;margin-bottom:14px;background:#f8f8f8;">
  <tr style="background:#e0e0e0;">
    <td style="padding:6px 10px;font-size:9px;text-align:center;font-weight:bold;width:25%;color:#444;border-right:1px solid #ccc;">1. Select Model</td>
    <td style="padding:6px 10px;font-size:9px;text-align:center;font-weight:bold;width:25%;color:#444;border-right:1px solid #ccc;">2. Review Fixed Specs</td>
    <td style="padding:6px 10px;font-size:9px;text-align:center;font-weight:bold;width:25%;color:#444;border-right:1px solid #ccc;">3. Fill Configurable</td>
    <td style="padding:6px 10px;font-size:9px;text-align:center;font-weight:bold;width:25%;color:#444;">4. Attach CU Details</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;font-size:8px;text-align:center;color:#777;border-right:1px solid #ddd;">Choose FlowMag model</td>
    <td style="padding:5px 8px;font-size:8px;text-align:center;color:#777;border-right:1px solid #ddd;">Check pre-set parameters</td>
    <td style="padding:5px 8px;font-size:8px;text-align:center;color:#777;border-right:1px solid #ddd;">Pick codes for __ positions</td>
    <td style="padding:5px 8px;font-size:8px;text-align:center;color:#777;">MOC, standard, pressure, drawings</td>
  </tr>
</table>

<!-- Catalogue Reference -->
<table style="width:100%;border-collapse:collapse;border:1px solid #ccc;margin-bottom:14px;">
  <tr>
    <td style="padding:6px 10px;font-size:9px;color:#666;background:#fafafa;">
      <b>Catalogue Reference:</b> ${entry.catalogueRef} | Model Selector Guide: FlowMag Series
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
  Model selector simplifies quotation — pre-configured models cover 80% of applications; full master de-codification covers the rest.
</div>

</div>

</body>
</html>`;
}

function renderMasterDecodeTables(entry: typeof DECODE_EMF): string {
  const half = Math.ceil(entry.categories.length / 2);
  const leftCategories = entry.categories.slice(0, half);
  const rightCategories = entry.categories.slice(half);

  function renderCategoryTable(cat: DecodeCategory): string {
    const rows = cat.options
      .map(
        (opt) => `
      <tr style="border-bottom:1px solid #e0e0e0;">
        <td style="padding:4px 6px;font-size:8px;font-weight:bold;color:#666;width:28%;border-right:1px solid #e0e0e0;background:#fafafa;">${opt.code}</td>
        <td style="padding:4px 6px;font-size:8px;color:#444;">${opt.description}</td>
      </tr>
    `
      )
      .join("");

    return `
      <table style="width:100%;border-collapse:collapse;border:1px solid #bbb;margin-bottom:8px;font-size:8px;background:#fff;">
        <thead>
          <tr style="background:#d5d5d5;">
            <th colspan="2" style="padding:5px 6px;font-size:8px;text-align:left;font-weight:bold;color:#333;border-bottom:1px solid #bbb;">
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
`;
}
