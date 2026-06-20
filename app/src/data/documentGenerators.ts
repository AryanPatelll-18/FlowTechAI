// ============================================================
// Document Generators — Phase V
// Generate QAP and GAD+Datasheet HTML for print-to-PDF
// ============================================================

const FLOWTECH_LOGO = `/flowtech_logo_white.png`;

function docHeader(title: string, soRef: string): string {
  return `
    <div style="background:#2d2d2d; color:white; padding:12px 20px; display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
      <div style="display:flex; align-items:center; gap:15px;">
        <img src="${FLOWTECH_LOGO}" style="height:40px; width:auto;" />
        <div>
          <div style="font-size:14px; font-weight:bold;">Flowtech Measuring Instruments Pvt. Ltd.</div>
          <div style="font-size:9px; color:#aaa;">900/2/B, GIDC, Makarpura, Vadodara - 390010, Gujarat, India</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:12px; font-weight:bold;">${title}</div>
        <div style="font-size:9px; color:#aaa;">Ref: ${soRef}</div>
      </div>
    </div>
  `;
}

function docFooter(pageNum: number): string {
  return `
    <div style="border-top:1px solid #ccc; padding-top:8px; margin-top:20px; display:flex; justify-content:space-between; font-size:8px; color:#666;">
      <span>Flowtech Measuring Instruments Pvt. Ltd. — ISO 9001:2015 Certified</span>
      <span>Page ${pageNum} — CONFIDENTIAL</span>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// QAP — Return raw HTML string (for inline viewer)
// ═══════════════════════════════════════════════════════════════════════════

export function generateQAPHtml(soRef: string, productName: string): string {
  return `${docHeader("QUALITY ASSURANCE PLAN (QAP)", soRef)}

<h1>1. General Information</h1>
<table>
  <tr><th width="30%">Item</th><th width="70%">Details</th></tr>
  <tr><td>Customer PO / SO Reference</td><td>${soRef}</td></tr>
  <tr><td>Product Description</td><td>${productName || "To be filled"}</td></tr>
  <tr><td>Manufacturer</td><td>Flowtech Measuring Instruments Pvt. Ltd., Vadodara, India</td></tr>
  <tr><td>QAP Reference</td><td>FT-QAP-${soRef}-${new Date().getFullYear()}</td></tr>
  <tr><td>QAP Issue Date</td><td>${new Date().toLocaleDateString("en-IN")}</td></tr>
  <tr><td>Quality System</td><td>ISO 9001:2015 Certified</td></tr>
  <tr><td>Applicable Standards</td><td>ISO 9001:2015, ASME B31.3, PED 2014/68/EU, IEC 61508 (where applicable)</td></tr>
</table>

<h1>2. Quality Assurance Organization</h1>
<table>
  <tr><th>Role</th><th>Name</th><th>Designation</th><th>Responsibility</th></tr>
  <tr><td>Quality Head</td><td>_________________</td><td>Manager — QA</td><td>Overall QAP implementation, customer liaison</td></tr>
  <tr><td>Inspection Engineer</td><td>_________________</td><td>Senior Engineer</td><td>In-process inspection, witness tests</td></tr>
  <tr><td>Production Head</td><td>_________________</td><td>Manager — Production</td><td>Manufacturing as per approved drawings</td></tr>
  <tr><td>NDT Inspector</td><td>_________________</td><td>Level-II Certified</td><td>Radiography, DPT, MPI as applicable</td></tr>
</table>

<h1>3. Inspection & Test Plan (ITP)</h1>
<h2>Stage 1: Raw Material Inspection</h2>
<table>
  <tr><th>Sr.</th><th>Inspection Activity</th><th>Reference Standard</th><th>Flowtech</th><th>Customer Hold</th><th>Record</th></tr>
  <tr><td>1.1</td><td>Material test certificate review (MTC)</td><td>EN 10204 3.1 / 3.2</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>&#9675;</td><td>MTC Log</td></tr>
  <tr><td>1.2</td><td>Incoming dimensional verification</td><td>ISO 2768-m</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>&#9675;</td><td>Incoming Report</td></tr>
  <tr><td>1.3</td><td>Positive material identification (PMI)</td><td>ASTM E1476</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>PMI Report</td></tr>
  <tr><td>1.4</td><td>Visual inspection for defects</td><td>ASTM A802</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>&#9675;</td><td>Visual Report</td></tr>
</table>

<h2>Stage 2: In-Process Inspection</h2>
<table>
  <tr><th>Sr.</th><th>Inspection Activity</th><th>Reference Standard</th><th>Flowtech</th><th>Customer Hold</th><th>Record</th></tr>
  <tr><td>2.1</td><td>Welding procedure qualification (WPQ / WPS / PQR)</td><td>ASME IX / EN ISO 15614</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>WPS/PQR</td></tr>
  <tr><td>2.2</td><td>Welder qualification</td><td>ASME IX</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>&#9675;</td><td>WPQ Cards</td></tr>
  <tr><td>2.3</td><td>Weld visual inspection</td><td>AWS D1.1 / EN ISO 17637</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>&#9675;</td><td>VI Report</td></tr>
  <tr><td>2.4</td><td>Dye penetrant testing (DPT)</td><td>ASTM E165 / EN 571-1</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>DPT Report</td></tr>
  <tr><td>2.5</td><td>Radiographic testing (RT) — if applicable</td><td>ASTM E94 / EN ISO 17636</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>RT Films + Report</td></tr>
  <tr><td>2.6</td><td>Hydrostatic pressure test</td><td>ASME B31.3 / PED</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>Hydro Test Cert</td></tr>
  <tr><td>2.7</td><td>Calibration of measuring instruments</td><td>ISO/IEC 17025</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>&#9675;</td><td>Calibration Cert</td></tr>
</table>

<h2>Stage 3: Final Inspection & Testing</h2>
<table>
  <tr><th>Sr.</th><th>Inspection Activity</th><th>Reference Standard</th><th>Flowtech</th><th>Customer Hold</th><th>Record</th></tr>
  <tr><td>3.1</td><td>Final dimensional inspection</td><td>Approved Drawing</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>Final Dim. Report</td></tr>
  <tr><td>3.2</td><td>Functional / performance test</td><td>API / ISO / Factory Standard</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>Test Certificate</td></tr>
  <tr><td>3.3</td><td>Paint / coating thickness check</td><td>SSPC / ISO 19840</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>&#9675;</td><td>Paint Report</td></tr>
  <tr><td>3.4</td><td>Final visual inspection & marking check</td><td>Flowtech WI-QA-07</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>&#9675;</td><td>FVI Report</td></tr>
  <tr><td>3.5</td><td>Documentation review & compilation</td><td>ISO 9001:2015 Cl 8.6</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>&#9675;</td><td>Doc Checklist</td></tr>
  <tr><td>3.6</td><td>Packing inspection</td><td>Flowtech WI-PKG-01</td><td style="color:#16a34a; font-weight:bold;">&#9679;</td><td>&#9675;</td><td>Packing List</td></tr>
</table>

<h1>4. Document Submission Schedule</h1>
<table>
  <tr><th>Sr.</th><th>Document</th><th>Soft Copy</th><th>Hard Copy</th><th>Schedule</th></tr>
  <tr><td>1</td><td>Inspection & Test Plan (ITP)</td><td>PDF</td><td>2 sets</td><td>Within 1 week of PO</td></tr>
  <tr><td>2</td><td>Raw Material Test Certificates (MTC)</td><td>PDF</td><td>1 set</td><td>With inspection call</td></tr>
  <tr><td>3</td><td>WPS / PQR / WPQ</td><td>PDF</td><td>1 set</td><td>Before start of welding</td></tr>
  <tr><td>4</td><td>NDT Reports (DPT / RT / MPI / UT)</td><td>PDF</td><td>1 set</td><td>Within 3 days of test</td></tr>
  <tr><td>5</td><td>Hydrostatic Test Certificate</td><td>PDF</td><td>2 sets</td><td>Within 3 days of test</td></tr>
  <tr><td>6</td><td>Final Inspection Report</td><td>PDF</td><td>2 sets</td><td>Within 3 days of FVI</td></tr>
  <tr><td>7</td><td>Calibration Certificates</td><td>PDF</td><td>1 set</td><td>With despatch</td></tr>
  <tr><td>8</td><td>Operation & Maintenance Manual</td><td>PDF</td><td>2 sets</td><td>With despatch</td></tr>
  <tr><td>9</td><td>GAD / Datasheet</td><td>PDF + DWG</td><td>2 sets</td><td>Within 2 weeks of PO</td></tr>
  <tr><td>10</td><td>Packing List / Commercial Invoice</td><td>PDF</td><td>2 sets</td><td>With despatch</td></tr>
</table>

<h1>5. Non-Conformance & Deviation Control</h1>
<table>
  <tr><th>Sr.</th><th>Activity</th><th>Procedure</th></tr>
  <tr><td>1</td><td>NCR (Non-Conformance Report) raised</td><td>Flowtech WI-QA-03 — All NCRs logged with root cause, corrective action, and preventive action</td></tr>
  <tr><td>2</td><td>Customer notification for major NCR</td><td>Within 24 hours of identification for customer hold point items</td></tr>
  <tr><td>3</td><td>Rework / Repair approval</td><td>Repair procedure to be approved by customer before execution (for hold point items)</td></tr>
  <tr><td>4</td><td>Deviation request</td><td>Formal deviation request with technical justification for customer approval</td></tr>
</table>

<h1>6. Signatures</h1>
<div style="display:flex; gap:30px; margin-top:20px;">
  <div style="flex:1; border-top:1px solid #333; padding-top:4px; font-size:8px;">
    <strong>Prepared by:</strong> Quality Assurance Engineer<br>Date: _______________
  </div>
  <div style="flex:1; border-top:1px solid #333; padding-top:4px; font-size:8px;">
    <strong>Reviewed by:</strong> Quality Manager<br>Date: _______________
  </div>
  <div style="flex:1; border-top:1px solid #333; padding-top:4px; font-size:8px;">
    <strong>Customer Approval:</strong><br>Name: _______________ &nbsp; Date: _______________ &nbsp; Stamp:
  </div>
</div>

${docFooter(1)}`;
}

// QAP Blob (backward compat)
export function generateQAPDocument(soRef: string, productName: string): Blob {
  return new Blob([generateQAPHtml(soRef, productName)], { type: "text/html" });
}

// ═══════════════════════════════════════════════════════════════════════════
// GAD + Datasheet — Return raw HTML string (for inline viewer)
// ═══════════════════════════════════════════════════════════════════════════

export function generateGADHtml(soRef: string, productName: string): string {
  return `${docHeader("GENERAL ASSEMBLY DRAWING + TECHNICAL DATASHEET", soRef)}

<h1>1. General Assembly Drawing (GAD)</h1>
<table>
  <tr><th width="18%">Drawing No.</th><td width="32%">FT-GAD-${soRef}-01</td><th width="18%">Revision</th><td width="32%">Rev. 0</td></tr>
  <tr><th>Title</th><td colspan="3">General Assembly — ${productName || "Flowtech Instrument"}</td></tr>
  <tr><th>Scale</th><td>As noted</td><th>Projection</th><td>Third Angle</td></tr>
  <tr><th>Drawn by</th><td>_______________</td><th>Checked by</th><td>_______________</td></tr>
  <tr><th>Approved by</th><td>_______________</td><th>Date</th><td>${new Date().toLocaleDateString("en-IN")}</td></tr>
</table>

<div style="border: 2px solid #333; padding: 60px; margin: 15px 0; text-align: center; display: flex; align-items: center; justify-content: center; min-height: 200px;">
  <span style="color: #999; font-size: 14px; border: 1px dashed #ccc; padding: 30px;">G.A. Drawing — Insert approved AutoCAD drawing here</span>
</div>

<h1>2. Technical Datasheet</h1>

<h2>2.1 General Specifications</h2>
<table>
  <tr><th width="25%">Parameter</th><th width="25%">Specification</th><th width="25%">Parameter</th><th width="25%">Specification</th></tr>
  <tr><td>Manufacturer</td><td>Flowtech Measuring Instruments Pvt. Ltd., India</td><td>Model / Type</td><td>${productName || "_________________"}</td></tr>
  <tr><td>Tag Number</td><td>_________________</td><td>Line / Equipment No.</td><td>_________________</td></tr>
  <tr><td>Service / Fluid</td><td>_________________</td><td>Operating Pressure</td><td>_________________ bar</td></tr>
  <tr><td>Operating Temperature</td><td>_________________ °C</td><td>Design Pressure</td><td>_________________ bar</td></tr>
  <tr><td>Design Temperature</td><td>_________________ °C</td><td>Process Connection</td><td>_________________</td></tr>
  <tr><td>Line Size / Rating</td><td>_________________</td><td>Quantity</td><td>_________________ Nos.</td></tr>
</table>

<h2>2.2 Performance Specifications</h2>
<table>
  <tr><th width="30%">Parameter</th><th width="35%">Specification</th><th width="35%">Remarks</th></tr>
  <tr><td>Measuring Principle</td><td>_________________</td><td>EMF / Vortex / Ultrasonic / DP / etc.</td></tr>
  <tr><td>Measuring Range</td><td>_________________</td><td>Min to Max</td></tr>
  <tr><td>Accuracy</td><td>_________________</td><td>% of rate / % of span</td></tr>
  <tr><td>Repeatability</td><td>_________________</td><td></td></tr>
  <tr><td>Turndown Ratio</td><td>_________________</td><td></td></tr>
  <tr><td>Response Time</td><td>_________________</td><td>Seconds</td></tr>
  <tr><td>Output Signal</td><td>_________________</td><td>4-20mA / HART / Pulse / etc.</td></tr>
  <tr><td>Power Supply</td><td>_________________</td><td>VDC / VAC</td></tr>
  <tr><td>Load Resistance</td><td>_________________</td><td>Ohms</td></tr>
  <tr><td>Display</td><td>_________________</td><td>LCD / LED / None</td></tr>
  <tr><td>Communication</td><td>_________________</td><td>HART / Modbus / Foundation Fieldbus</td></tr>
</table>

<h2>2.3 Materials of Construction (MOC)</h2>
<table>
  <tr style="background:#c20017; color:white;"><th>Part</th><th>Material</th><th>Part</th><th>Material</th></tr>
  <tr><td>Body / Housing</td><td>_________________</td><td>Flange</td><td>_________________</td></tr>
  <tr><td>Measuring Tube</td><td>_________________</td><td>Electrodes (EMF)</td><td>_________________</td></tr>
  <tr><td>Liner (EMF)</td><td>_________________</td><td>Bluff Body (Vortex)</td><td>_________________</td></tr>
  <tr><td>Sensor / Transducer</td><td>_________________</td><td>Gaskets</td><td>_________________</td></tr>
  <tr><td>Bolts / Nuts</td><td>_________________</td><td>Paint / Coating</td><td>_________________</td></tr>
  <tr><td>Terminal Housing</td><td>_________________</td><td>Cable Glands</td><td>_________________</td></tr>
</table>

<h2>2.4 Electrical Specifications</h2>
<table>
  <tr><th width="25%">Parameter</th><th width="25%">Specification</th><th width="25%">Parameter</th><th width="25%">Specification</th></tr>
  <tr><td>Supply Voltage</td><td>24 VDC (two-wire)</td><td>Output</td><td>4-20mA + HART</td></tr>
  <tr><td>Load Resistance</td><td>0–600 Ohms</td><td>Cable Entry</td><td>1/2" NPT / M20x1.5</td></tr>
  <tr><td>Enclosure Rating</td><td>IP66 / IP67 / NEMA 4X</td><td>Explosion Proof</td><td>Ex d IIC T6 (optional)</td></tr>
  <tr><td>Intrinsic Safety</td><td>Ex ia IIC T6 (optional)</td><td>EMC</td><td>IEC 61326</td></tr>
</table>

<h2>2.5 Mechanical Specifications</h2>
<table>
  <tr><th width="25%">Parameter</th><th width="25%">Specification</th><th width="25%">Parameter</th><th width="25%">Specification</th></tr>
  <tr><td>Mounting</td><td>_________________</td><td>Orientation</td><td>_________________</td></tr>
  <tr><td>Overall Length</td><td>_________________ mm</td><td>Face-to-Face</td><td>_________________ mm</td></tr>
  <tr><td>Weight (approx.)</td><td>_________________ kg</td><td>Shipping Volume</td><td>_________________ m³</td></tr>
  <tr><td>End Connection</td><td>_________________</td><td>Drain / Vent</td><td>_________________</td></tr>
</table>

<h2>2.6 Environmental Specifications</h2>
<table>
  <tr><th width="25%">Parameter</th><th width="25%">Value</th><th width="25%">Parameter</th><th width="25%">Value</th></tr>
  <tr><td>Ambient Temperature</td><td>-40°C to +85°C</td><td>Storage Temperature</td><td>-40°C to +85°C</td></tr>
  <tr><td>Ambient Humidity</td><td>0–100% RH (condensing)</td><td>Vibration</td><td>2g per IEC 60068-2-6</td></tr>
  <tr><td>Shock</td><td>15g per IEC 60068-2-27</td><td>Altitude</td><td>Up to 2000m</td></tr>
</table>

<h2>2.7 Accessories & Options</h2>
<table>
  <tr><th width="5%">Sr.</th><th width="40%">Accessory / Option</th><th width="10%">Qty</th><th width="45%">Specification</th></tr>
  <tr><td>1</td><td>2-valve / 3-valve / 5-valve Manifold</td><td>___</td><td>SS 316, NPT/Flanged, rated to process pressure</td></tr>
  <tr><td>2</td><td>Mounting Bracket (Pipe/Wall)</td><td>___</td><td>SS 304 / CS epoxy coated</td></tr>
  <tr><td>3</td><td>Remote Diaphragm Seal</td><td>___</td><td>SS 316L / Hastelloy C, capillary filled</td></tr>
  <tr><td>4</td><td>Sun Shade / Weather Protection</td><td>___</td><td>SS 304, IP66</td></tr>
  <tr><td>5</td><td>Cable Glands</td><td>___</td><td>Ex d / Ex e certified, Nickel-plated brass</td></tr>
  <tr><td>6</td><td>Commissioning Spares</td><td>___</td><td>As per Flowtech standard list</td></tr>
  <tr><td>7</td><td>2-year Recommended Spares</td><td>___</td><td>As per Flowtech standard list</td></tr>
</table>

<h2>2.8 Reference Standards</h2>
<table>
  <tr><td>Pressure Equipment Directive</td><td>PED 2014/68/EU — Module H (Full Quality Assurance)</td></tr>
  <tr><td>Electromagnetic Compatibility</td><td>IEC 61326-1</td></tr>
  <tr><td>Electrical Safety</td><td>IEC 61010-1</td></tr>
  <tr><td>Explosion Protection</td><td>IEC 60079-0, IEC 60079-1, IEC 60079-11</td></tr>
  <tr><td>Functional Safety</td><td>IEC 61508 (SIL 2/3 capable)</td></tr>
  <tr><td>Environmental Testing</td><td>IEC 60068-2 (temperature, humidity, vibration, shock)</td></tr>
  <tr><td>Quality Management</td><td>ISO 9001:2015</td></tr>
</table>

<h2>2.9 Signatures</h2>
<div style="display:flex; gap:30px; margin-top:15px;">
  <div style="flex:1; border-top:1px solid #333; padding-top:4px; font-size:8px;">
    <strong>Prepared by:</strong> Design Engineer<br>Date: _______________
  </div>
  <div style="flex:1; border-top:1px solid #333; padding-top:4px; font-size:8px;">
    <strong>Checked by:</strong> Project Manager<br>Date: _______________
  </div>
  <div style="flex:1; border-top:1px solid #333; padding-top:4px; font-size:8px;">
    <strong>Approved by:</strong> Customer<br>Name: _______________ Date: _______________
  </div>
</div>

${docFooter(1)}`;
}

// GAD Blob (backward compat)
export function generateGADDatasheet(soRef: string, productName: string): Blob {
  return new Blob([generateGADHtml(soRef, productName)], { type: "text/html" });
}
