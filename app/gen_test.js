
const fs = require('fs');

// Read the logo
const logoData = fs.readFileSync('/mnt/agents/output/app/public/flowtech-logo.png');
const logoB64 = 'data:image/png;base64,' + logoData.toString('base64');

// Replace the import in template
let template = fs.readFileSync('/mnt/agents/output/app/src/datasheet/datasheetTemplate.ts', 'utf8');

// Create a test by building the HTML directly
const header = {
  soNo: "S35750",
  poNo: "SRP/L/VI/RVN/ZLR-300C/26-27/008",
  project: "RVUNL Units #5&6 Supercritical Thermal Power Plant, Chabbra, Rajasthan",
  client: "M/s. S.R. Paryavaran Engineers Pvt. Ltd.",
  clientGovtBody: "RVUNL (Rajasthan Rajya Vidyut Utpadan Nigam Ltd.)",
  contractor: "M/s. S.R. Paryavaran Engineers Pvt. Ltd.",
  supplier: "Flowtech Measuring Instruments Pvt. Ltd.",
  date: "30/05/2026",
  rev: "0",
  revDescription: "Issued for Client Review",
  delivery: "27/06/2026 (4 Weeks)",
  totalQty: "40 Nos.",
  totalLineItems: 19,
  basicAmount: "INR 906,509.00",
  igst: "INR 163,171.62",
  grandTotal: "INR 1,069,681.00",
  grandTotalWords: "INR Ten Lakhs Sixty Nine Thousand Six Hundred Eighty One Only",
  paymentTerms: "20% Advance with PO, 60% after TPI against dispatch, Balance 20% after 60 days from arrival at site",
  transport: "Through reputed transport / door delivery at factory",
  gstNo: "24AABCF8314J1ZQ",
  panNo: "AABCF8314J",
  iecCode: "3413000900",
  banker: "State Bank of India",
  accountNo: "32073676328",
  ifsc: "SBIN0001456",
  micr: "390002010",
  swift: "SBININBB257",
  bankAddress: "Makarpura GIDC, Vadodara-390010",
  specialNotes: [
    "Approved Drawing, Approved Data Sheet / QAP, and Third Party Inspection are required for all instruments.",
    "All dimensions and specifications are subject to final engineering confirmation.",
    "Material test certificates (MTC) to be provided for all wetted parts in contact with process fluid.",
    "Calibration certificates traceable to national standards shall be provided for each instrument.",
  ]
};

const items = [
  {
    srNo: 1, tagNo: "EMF-1101", instrumentType: "Electromagnetic Flowmeter", service: "Clear Waste Water", size: "200NB", qty: 2, model: "FlowMag S630",
    type: "Electromagnetic Flowmeter", make: "Flowtech", hsn: "90261010", accuracy: "+/- 0.5% of FSD", modelCode: "FMIPL-EFM-TS1-F-C-F1-CH1-EL2-IF-PL-WP-W2-CR-CG1-CE2-CP1-M-RE-AC1-NA-200NB",
    opPressure: "0 - 6 kg/cm2", opTemperature: "Ambient", density: "1.0", flowRange: "90 - 60 m3/hr", minFlow: "33.9 m3/hr", maxFlow: "565.2 m3/hr",
    conductivity: "5 uS/cm", viscosity: "Upto 3 cP", tempRange: "-10 deg C to +100 deg C", pressRating: "0 - 15 kg/cm2", pipeMoc: "Please Specify",
    flowtube: "SS 304", electrode: "SS 316L", lining: "PTFE", coilHousing: "CS", connection: "Flanged ANSI", connMoc: "Carbon Steel", flange: "ASA 150#", earthing: "In-Built Electrode",
    enclosure: "WP Aluminium Die Cast", wiring: "4-Wire", comm: "RS 485", output: "4-20 mA + Pulse", cableGland: "SS 304", cableEntry: "PG 11", protection: "Weather-Proof", power: "230 V AC", mounting: "Remote Type", cableLength: "10 Meters",
    approvedDrawing: true, datasheetQap: true, tpi: true, branding: "Flowtech",
    gadTitle: "General Arrangement Drawing - Electromagnetic Flowmeter (Integral Type)", gadDescription: "Front, Side & Top Views with Dimension Table"
  },
  {
    srNo: 2, tagNo: "EMF-1201", instrumentType: "Electromagnetic Flowmeter", service: "Clear Waste Water", size: "200NB", qty: 1, model: "FlowMag S630",
    type: "Electromagnetic Flowmeter", make: "Flowtech", hsn: "90261010", accuracy: "+/- 0.5% of FSD", modelCode: "FMIPL-EFM-TS1-F-C-F1-CH1-EL2-IF-PL-WP-W2-CR-CG1-CE2-CP1-M-RE-AC1-NA-200NB",
    opPressure: "0 - 6 kg/cm2", opTemperature: "Ambient", density: "1.0", flowRange: "60 - 240 m3/hr", minFlow: "33.9 m3/hr", maxFlow: "565.2 m3/hr",
    conductivity: "5 uS/cm", viscosity: "Upto 3 cP", tempRange: "-10 deg C to +100 deg C", pressRating: "0 - 15 kg/cm2", pipeMoc: "Please Specify",
    flowtube: "SS 304", electrode: "SS 316L", lining: "PTFE", coilHousing: "CS", connection: "Flanged ANSI", connMoc: "Carbon Steel", flange: "ASA 150#", earthing: "In-Built Electrode",
    enclosure: "WP Aluminium Die Cast", wiring: "4-Wire", comm: "RS 485", output: "4-20 mA + Pulse", cableGland: "SS 304", cableEntry: "PG 11", protection: "Weather-Proof", power: "230 V AC", mounting: "Remote Type", cableLength: "10 Meters",
    approvedDrawing: true, datasheetQap: true, tpi: true, branding: "Flowtech",
    gadTitle: "General Arrangement Drawing - Electromagnetic Flowmeter (Integral Type)", gadDescription: "Front, Side & Top Views with Dimension Table"
  }
];

// Build HTML manually matching the template
const year = 2026;

function esc(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function twoCol(l, v) {
  return `<tr><td class="lbl">${esc(l)}</td><td class="val">${esc(v)}</td></tr>`;
}

function specSection(title, content) {
  return `<div class="spec-section"><div class="spec-header">${esc(title)}</div>${content}</div>`;
}

function gadBox(item) {
  return `<div class="gad-box"><div class="gad-title">2D GENERAL ARRANGEMENT DRAWING</div><div class="gad-placeholder-area"><div style="font-size:9pt;font-weight:bold;color:#999;margin-bottom:8px;">INSERT APPROVED G.A.D. HERE</div><div style="font-size:7.5pt;color:#aaa;line-height:1.6;">${esc(item.gadTitle)}<br>${esc(item.gadDescription)}<br><br>Drawing No: FT-GAD-${esc(item.tagNo)}-01<br>Revision: Rev. 0<br>Scale: As noted<br>Projection: Third Angle</div></div><div class="gad-footer">${esc(item.gadDescription)}</div></div>`;
}

function instPage(item, total, header) {
  const leftCol = [
    specSection("GENERAL INFORMATION", `<table class="spec-table">${twoCol("Type", item.type)}${twoCol("Make", item.make)}${twoCol("Model", item.model)}${twoCol("Size", item.size)}${twoCol("Qty", item.qty + " Nos.")}${twoCol("Service", item.service)}${twoCol("HSN", item.hsn)}${twoCol("Accuracy", item.accuracy)}<tr><td class="lbl" colspan="2" style="font-weight:bold;border-top:1.5px solid #333;">Model Code:</td></tr><tr><td class="val" colspan="2" style="font-size:7pt;word-break:break-all;">${esc(item.modelCode)}</td></tr></table>`),
    specSection("PROCESS DATA", `<table class="spec-table">${twoCol("Op.Pressure", item.opPressure)}${twoCol("Op.Temperature", item.opTemperature)}${twoCol("Density", item.density)}${twoCol("Flow Range", item.flowRange)}${twoCol("Min Flow", item.minFlow)}${twoCol("Max Flow", item.maxFlow)}${twoCol("Conductivity", item.conductivity)}${twoCol("Viscosity", item.viscosity)}${twoCol("Temp Range", item.tempRange)}${twoCol("Press Rating", item.pressRating)}${twoCol("Pipe MOC", item.pipeMoc)}</table>`),
    specSection("MATERIAL SPECIFICATIONS", `<table class="spec-table">${twoCol("Flowtube", item.flowtube)}${twoCol("Electrode", item.electrode)}${twoCol("Lining", item.lining)}${twoCol("Coil Housing", item.coilHousing)}${twoCol("Connection", item.connection)}${twoCol("Conn MOC", item.connMoc)}${twoCol("Flange", item.flange)}${twoCol("Earthing", item.earthing)}</table>`),
    specSection("ELECTRICAL SPECIFICATIONS", `<table class="spec-table">${twoCol("Enclosure", item.enclosure)}${twoCol("Wiring", item.wiring)}${twoCol("Comm", item.comm)}${twoCol("Output", item.output)}${twoCol("Cable Gland", item.cableGland)}${twoCol("Cable Entry", item.cableEntry)}${twoCol("Protection", item.protection)}${twoCol("Power", item.power)}${twoCol("Mounting", item.mounting)}${twoCol("Cable Length", item.cableLength)}</table>`),
    specSection("DOCUMENTS", `<table class="spec-table"><tr><td class="lbl">Approved Drawing</td><td class="val" style="color:green;font-weight:bold;">YES</td></tr><tr><td class="lbl">Data Sheet / QAP</td><td class="val" style="color:green;font-weight:bold;">YES</td></tr><tr><td class="lbl">TPI</td><td class="val" style="color:green;font-weight:bold;">YES</td></tr><tr><td class="lbl">Branding</td><td class="val" style="color:#1e3a5f;font-weight:bold;">${esc(item.branding)}</td></tr></table>`),
  ].join("");

  return `<div class="page"><div class="inst-tag-header">${esc(item.tagNo)}</div><table class="info-bar-table"><tr><td class="info-box-left"><div style="font-weight:bold;font-size:8pt;">INSTRUMENT DATASHEET</div><div style="font-size:7pt;color:#666;">LINE ITEM ${item.srNo} OF ${total}</div></td><td class="info-box-center"><table style="font-size:7pt;width:100%;border-collapse:collapse;"><tr><td style="border:1px solid #333;padding:1px 4px;width:30%;"><strong>Project</strong></td><td style="border:1px solid #333;padding:1px 4px;">${esc(header.project)}</td></tr><tr><td style="border:1px solid #333;padding:1px 4px;"><strong>Client / Govt Body</strong></td><td style="border:1px solid #333;padding:1px 4px;">${esc(header.clientGovtBody)}</td></tr><tr><td style="border:1px solid #333;padding:1px 4px;"><strong>Contractor</strong></td><td style="border:1px solid #333;padding:1px 4px;">${esc(header.contractor)}</td></tr><tr><td style="border:1px solid #333;padding:1px 4px;"><strong>Supplier</strong></td><td style="border:1px solid #333;padding:1px 4px;">${esc(header.supplier)}</td></tr><tr><td style="border:1px solid #333;padding:1px 4px;"><strong>SO No.</strong></td><td style="border:1px solid #333;padding:1px 4px;">${esc(header.soNo)}</td><td style="border:1px solid #333;padding:1px 4px;"><strong>PO No.</strong></td><td style="border:1px solid #333;padding:1px 4px;">${esc(header.poNo)}</td></tr></table></td><td class="info-box-right"><div style="font-size:7pt;color:#666;">TAG NO.</div><div style="font-weight:bold;font-size:10pt;color:#1e3a5f;">${esc(item.tagNo)}</div></td></tr></table><div class="two-col"><div class="col-left">${leftCol}</div><div class="col-right">${gadBox(item)}</div></div></div>`;
}

// Cover page
const coverPage = `<div class="page"><div class="cover-frame"><div class="cover-inner"><div class="cover-logo"><img src="${logoB64}" style="height:45px;width:auto;" alt="Flowtech" /></div><div class="cover-brand">F L O W T E C H</div><div class="cover-subbrand">Measuring Instruments Private Limited</div><div class="cover-hr"></div><div class="cover-title-box">INSTRUMENT DATASHEET</div><div class="cover-hr"></div><div class="cover-project">${esc(header.project)}</div><div class="cover-client">${esc(header.client)}</div><div class="cover-meta"><span><strong>Sales Order:</strong> ${esc(header.soNo)}</span><span style="margin:0 20px;">|</span><span><strong>PO:</strong> ${esc(header.poNo)}</span></div><div class="cover-bottom-meta"><span><strong>Date:</strong> ${esc(header.date)}</span><span style="margin:0 15px;">|</span><span><strong>Rev:</strong> ${esc(header.rev)}</span><span style="margin:0 15px;">|</span><span><strong>Status:</strong> ${esc(header.revDescription)}</span></div><div class="cover-confidential">CONFIDENTIAL - FOR CLIENT SUBMISSION ONLY</div></div></div></div>`;

// Index page
const rows = items.map(item => `<tr><td class="idx-td" style="width:5%">${item.srNo}</td><td class="idx-td" style="width:15%">${esc(item.tagNo)}</td><td class="idx-td" style="width:25%">${esc(item.instrumentType)}</td><td class="idx-td" style="width:20%">${esc(item.service)}</td><td class="idx-td" style="width:10%">${esc(item.size)}</td><td class="idx-td" style="width:8%">${item.qty}</td><td class="idx-td" style="width:17%">${esc(item.model)}</td></tr>`).join("");

const indexPage = `<div class="page"><div style="text-align:center;font-size:10pt;font-weight:bold;margin-bottom:4px;">INSTRUMENT INDEX</div><div style="border-top:2px solid #333;border-bottom:1px solid #333;margin-bottom:8px;"></div><div style="text-align:center;font-size:8pt;margin-bottom:8px;"><strong>Sales Order:</strong> ${esc(header.soNo)} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Client:</strong> ${esc(header.client)} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Date:</strong> ${esc(header.date)}</div><table class="rev-table" style="margin-bottom:12px;"><tr><th class="rev-th">Rev.</th><th class="rev-th">Description</th><th class="rev-th">Date</th><th class="rev-th">Prepared</th><th class="rev-th">Checked</th><th class="rev-th">Approved</th></tr><tr><td class="rev-td">${esc(header.rev)}</td><td class="rev-td">${esc(header.revDescription)}</td><td class="rev-td">${esc(header.date)}</td><td class="rev-td"></td><td class="rev-td"></td><td class="rev-td"></td></tr></table><div class="two-col"><div class="col-left" style="width:35%;">${specSection("GENERAL INFORMATION", `<table class="spec-table">${twoCol("Project", header.project)}${twoCol("Client", header.client)}${twoCol("Sales Order", header.soNo)}${twoCol("Client PO", header.poNo)}${twoCol("Supplier", header.supplier)}${twoCol("Delivery", header.delivery)}${twoCol("Total", header.totalQty)}</table>`)}</div><div class="col-right" style="width:63%;">${specSection("INSTRUMENT SUMMARY", `<table class="idx-table"><tr><th class="idx-th">Sr.</th><th class="idx-th">Tag No.</th><th class="idx-th">Instrument Type</th><th class="idx-th">Service</th><th class="idx-th">Size</th><th class="idx-th">Qty</th><th class="idx-th">Model</th></tr>${rows}</table>`)}</div></div></div>`;

// Notes page
const notesList = header.specialNotes.map((n, i) => `<div class="note-item">${i + 1}. ${esc(n)}</div>`).join("");
const notesPage = `<div class="page"><table class="info-bar-table" style="margin-bottom:10px;"><tr><td style="border:2px solid #333;padding:8px;width:15%;vertical-align:middle;"><div style="font-size:10pt;font-weight:bold;">GENERAL NOTES &amp; TERMS</div></td><td style="border:none;padding:0;width:70%;"><table style="font-size:7pt;width:100%;border-collapse:collapse;"><tr><td style="border:1px solid #333;padding:3px 6px;width:15%;"><strong>Project</strong></td><td style="border:1px solid #333;padding:3px 6px;">${esc(header.project)}</td><td style="border:1px solid #333;padding:3px 6px;width:18%;"><strong>Client / Govt Body</strong></td><td style="border:1px solid #333;padding:3px 6px;">${esc(header.clientGovtBody)}</td></tr><tr><td style="border:1px solid #333;padding:3px 6px;"><strong>Contractor</strong></td><td style="border:1px solid #333;padding:3px 6px;">${esc(header.contractor)}</td><td style="border:1px solid #333;padding:3px 6px;"><strong>Supplier</strong></td><td style="border:1px solid #333;padding:3px 6px;">${esc(header.supplier)}</td></tr><tr><td style="border:1px solid #333;padding:3px 6px;"><strong>SO No.</strong></td><td style="border:1px solid #333;padding:3px 6px;">${esc(header.soNo)}</td><td style="border:1px solid #333;padding:3px 6px;"><strong>PO No.</strong></td><td style="border:1px solid #333;padding:3px 6px;">${esc(header.poNo)}</td></tr></table></td><td style="border:2px solid #333;padding:8px;width:15%;text-align:center;vertical-align:middle;"><div style="font-size:8pt;color:#666;">Sales Order:</div><div style="font-size:11pt;font-weight:bold;">${esc(header.soNo)}</div></td></tr></table><div style="text-align:center;font-size:9pt;font-weight:bold;margin-bottom:6px;">NOTES</div><div class="two-col"><div class="col-left" style="width:48%;">${specSection("COMMERCIAL SUMMARY", `<table class="spec-table">${twoCol("Total Quantity", header.totalQty)}${twoCol("Basic Amount", header.basicAmount)}${twoCol("Sub Total", header.basicAmount)}${twoCol("IGST (18%)", header.igst)}${twoCol("Grand Total", header.grandTotal)}${twoCol("In Words", header.grandTotalWords)}</table>`)}${specSection("TERMS &amp; CONDITIONS", `<table class="spec-table">${twoCol("Delivery", header.delivery)}${twoCol("Payment", header.paymentTerms)}${twoCol("Transport", header.transport)}${twoCol("GST No.", header.gstNo)}${twoCol("PAN No.", header.panNo)}${twoCol("IEC Code", header.iecCode)}</table>`)}${specSection("BANK DETAILS", `<table class="spec-table">${twoCol("Banker", header.banker)}${twoCol("Account No.", header.accountNo)}${twoCol("IFSC", header.ifsc)}${twoCol("MICR", header.micr)}${twoCol("Swift", header.swift)}${twoCol("Address", header.bankAddress)}</table>`)}<div style="margin-top:12px;display:flex;gap:20px;"><div style="flex:1;border-top:1.5px solid #333;padding-top:4px;"><div style="font-size:7.5pt;font-weight:bold;">Prepared By</div><div style="font-size:7pt;color:#666;">${esc(header.supplier)}</div></div><div style="flex:1;border-top:1.5px solid #333;padding-top:4px;"><div style="font-size:7.5pt;font-weight:bold;">Approved By</div><div style="font-size:7pt;color:#666;">${esc(header.contractor)}</div></div></div></div><div class="col-right" style="width:50%;">${specSection("SPECIAL NOTES", `<div style="padding:6px;font-size:8pt;line-height:1.7;">${notesList}</div>`)}</div></div></div>`;

const allPages = [coverPage, indexPage, ...items.map(item => instPage(item, items.length, header)), notesPage].join("\n");

const css = `* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, Helvetica, sans-serif; font-size: 8pt; color: #000; line-height: 1.3; margin: 0; padding: 0; } .page { width: 210mm; min-height: 297mm; padding: 12mm 10mm 15mm 10mm; page-break-after: always; position: relative; } .page:last-child { page-break-after: auto; } .two-col { display: flex; gap: 10px; width: 100%; } .col-left { width: 44%; min-width: 44%; } .col-right { width: 55%; min-width: 55%; } .spec-section { margin-bottom: 6px; border: 1px solid #333; } .spec-header { background: #fff; border-bottom: 1px solid #333; padding: 3px 6px; font-size: 7.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3px; } .spec-table { width: 100%; border-collapse: collapse; font-size: 7.5pt; } .spec-table td { border: 1px solid #999; padding: 2px 5px; vertical-align: middle; } .spec-table td.lbl { width: 40%; font-weight: 600; background: #fafafa; } .spec-table td.val { width: 60%; } .inst-tag-header { text-align: center; font-size: 14pt; font-weight: bold; color: #000; margin-bottom: 6px; letter-spacing: 1px; } .info-bar-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; } .info-bar-table td { border: 1.5px solid #333; padding: 4px 6px; vertical-align: top; } .info-box-left { width: 18%; text-align: center; vertical-align: middle; } .info-box-center { width: 65%; border: none; padding: 0; } .info-box-center table { border-collapse: collapse; } .info-box-center td { border: 1px solid #333; font-size: 6.5pt; padding: 1px 4px; } .info-box-right { width: 17%; text-align: center; vertical-align: middle; } .gad-box { border: 1px solid #333; height: 100%; display: flex; flex-direction: column; } .gad-title { border-bottom: 1px solid #333; padding: 3px 6px; font-size: 7.5pt; font-weight: bold; text-transform: uppercase; text-align: center; } .gad-placeholder-area { flex: 1; min-height: 500px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #ccc; margin: 8px; padding: 20px; text-align: center; } .gad-footer { border-top: 1px solid #333; padding: 3px 6px; font-size: 6.5pt; text-align: center; color: #555; } .cover-frame { border: 3px solid #000; height: 273mm; display: flex; align-items: center; justify-content: center; } .cover-inner { width: 90%; text-align: center; } .cover-logo { margin-bottom: 12px; } .cover-brand { font-size: 22pt; font-weight: bold; letter-spacing: 8px; color: #000; margin-bottom: 2px; } .cover-subbrand { font-size: 9pt; color: #333; margin-bottom: 16px; } .cover-hr { border: none; border-top: 2px solid #000; margin: 12px auto; width: 80%; } .cover-title-box { border: 2px solid #000; display: inline-block; padding: 8px 40px; font-size: 14pt; font-weight: bold; letter-spacing: 2px; margin: 8px 0; } .cover-project { font-size: 11pt; font-weight: bold; margin: 16px 0 6px 0; line-height: 1.4; } .cover-client { font-size: 10pt; margin-bottom: 12px; } .cover-meta { font-size: 9pt; margin: 12px 0; } .cover-bottom-meta { font-size: 8pt; margin-top: 20px; color: #333; } .cover-confidential { margin-top: 30px; font-size: 7.5pt; font-weight: bold; letter-spacing: 1px; } .idx-table { width: 100%; border-collapse: collapse; font-size: 7pt; } .idx-th { border: 1px solid #333; padding: 3px 4px; font-size: 6.5pt; font-weight: bold; text-align: center; background: #f5f5f5; } .idx-td { border: 1px solid #333; padding: 2px 4px; font-size: 6.5pt; text-align: center; } .idx-td:nth-child(3), .idx-td:nth-child(4) { text-align: left; } .rev-table { width: 100%; border-collapse: collapse; font-size: 7pt; } .rev-th { border: 1px solid #333; padding: 3px 6px; font-size: 6.5pt; font-weight: bold; text-align: center; background: #f5f5f5; } .rev-td { border: 1px solid #333; padding: 2px 6px; font-size: 6.5pt; text-align: center; } .note-item { margin-bottom: 6px; padding-left: 4px; text-align: justify; }`;

const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Instrument Datasheet - ${esc(header.soNo)}</title><style>${css}</style></head><body>${allPages}</body></html>`;

fs.writeFileSync('/mnt/agents/output/test_datasheet.html', fullHtml);
console.log('Test HTML written: ' + fullHtml.length + ' chars');
