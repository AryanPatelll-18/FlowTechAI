// ============================================================
// Flowtech QAP Master Data — Extracted from Uploaded DOCX Files
// 9 products with real factory QAPs | 8 products pending
// Format matches Flowtech standard QAP table structure
// ============================================================

export interface QapRow {
  srNo: string;
  component: string;
  characteristics: string;
  category: string; // MA=Major, MI=Minor, CR=Critical
  method: string;
  extent: string;
  reference: string;
  acceptance: string;
  recordFormat: string;
  flowtech: string; // P=Perform, W=Witness, R=Review
  agency: string;
  client: string;
  remarks: string;
}

export interface QapMasterEntry {
  docNo: string;
  title: string;
  revNo: string;
  date: string;
  approvedBy: string;
  rows: QapRow[];
  remarks: string; // product-specific footnotes
}

// ─── Products WITH QAP (uploaded) ────────────────────────────────────────

export const QAP_OVAL_GEAR: QapMasterEntry = {
  docNo: "F/QAP/01-02",
  title: "QUALITY ASSURANCE PLAN FOR OVAL GEAR FLOW METER",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "MOC", category: "MA", method: "Chemical Analysis / Mechanical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "Material Test Certificate (MTC) / Lab Test Report", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Technical Spec & Accessories", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Visual Inspection", characteristics: "", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Calibration Test", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "5", component: "Final Inspection", characteristics: "Visual Inspection / Verification of General Finish, Model No & Serial No, Tag No.", category: "MA", method: "Visual", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "6", component: "Calibration Test", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "7", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "W", client: "W", remarks: "" },
  ],
  remarks: "(FINAL PERFORMANCE TEST WILL BE DONE FOR THE SYSTEM DURING COMMISSIONING)",
};

export const QAP_EMF: QapMasterEntry = {
  docNo: "F/QAP/01-08",
  title: "QUALITY ASSURANCE PLAN FOR ELECTROMAGNETIC FLOW METER",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Flange, Electrode, Pipe/Sheet/Tube, Sensor Housing", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "Material Test Certificate (MTC) / Lab Test Report", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Technical Spec & Accessories", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Dimension, Visual Check", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Hydro Test", characteristics: "Hydro Test at 16 Kg/cm2 For 5 Min.", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "5", component: "Calibration Test", characteristics: "Calibration Test is carried out at any 4 Points (*)", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "* Flowtech Lab Max. Flow Range Up to 500 M3/Hr" },
    { srNo: "6", component: "Final Inspection", characteristics: "Dimensional, Visual Inspection & Tag Nos.", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "7", component: "Calibration Test", characteristics: "Calibration Test is carried out at any 4 Points (*)", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "* Flowtech Lab Max. Flow Range Up to 500 M3/Hr" },
    { srNo: "8", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "R", client: "R", remarks: "" },
  ],
  remarks: "(FINAL PERFORMANCE TEST WILL BE DONE FOR THE SYSTEM DURING COMMISSIONING)",
};

export const QAP_FLOAT_BOARD: QapMasterEntry = {
  docNo: "F/QAP/01-09",
  title: "QUALITY ASSURANCE PLAN FOR FLOAT AND BOARD LEVEL GAUGE INDICATOR",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Flange, Float, Pulley Housing", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "Material Test Certificate (MTC) / Lab TC", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Dimensional Check, Visual Check & Sr.No.", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Final Inspection", characteristics: "Dimensional Check, Visual Inspection & Sr.No.", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "4", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "W", client: "W", remarks: "" },
  ],
  remarks: "",
};

export const QAP_GLASS_TUBE_ROTAMETER: QapMasterEntry = {
  docNo: "F/QAP/01-10",
  title: "QUALITY ASSURANCE PLAN FOR GLASS TUBE ROTAMETER",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Flange, Float", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "Material Test Certificate (MTC)", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Technical Spec & Accessories", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Dimension, Visual Check", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Hydro Test", characteristics: "Hydro Test at 5 Kg/cm2 For 5 Min.", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "5", component: "Calibration Test", characteristics: "Calibration Test at any 5 Points", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "6", component: "Final Inspection", characteristics: "Dimensional, Visual Inspection & Tag Nos.", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "7", component: "Calibration Test", characteristics: "Calibration Test at any 5 Points", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "8", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "W", client: "W", remarks: "" },
  ],
  remarks: "(FINAL PERFORMANCE TEST WILL BE DONE FOR THE SYSTEM DURING COMMISSIONING)",
};

export const QAP_METAL_TUBE_ROTAMETER: QapMasterEntry = {
  docNo: "F/QAP/01-13",
  title: "QUALITY ASSURANCE PLAN FOR METAL TUBE ROTAMETER",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Flange, Float", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "Material Test Certificate (MTC)", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Technical Spec & Accessories", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Dimension, Visual Check", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Hydro Test", characteristics: "Hydro Test (*)", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "* Hydro Test: PP for 3 Kg/Cm2 & MS, SS for 4 Kg/Cm2" },
    { srNo: "5", component: "Calibration Test", characteristics: "Calibration Test at 5 Points", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "6", component: "Final Inspection", characteristics: "Dimensional, Visual Inspection & Tag Nos.", category: "MA", method: "Visual & Measurement", extent: "10% Quantity", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "7", component: "Calibration Test", characteristics: "Calibration Test at 5 Points", category: "MA", method: "Visual & Measurement", extent: "10% Quantity", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "8", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "R", client: "R", remarks: "" },
  ],
  remarks: "",
};

export const QAP_ACRYLIC_BODY_ROTAMETER: QapMasterEntry = {
  docNo: "F/QAP/01-05",
  title: "QUALITY ASSURANCE PLAN FOR ACRYLIC BODY ROTAMETER",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Flange, Float", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "Material Test Certificate (MTC)", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Technical Spec & Accessories", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Dimension, Visual Check", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Hydro Test", characteristics: "Hydro Test at 5 Kg/cm2 For 5 Min.", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "5", component: "Calibration Test", characteristics: "Calibration Test at any 5 Points", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "6", component: "Final Inspection", characteristics: "Dimensional, Visual Inspection & Tag Nos.", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "7", component: "Calibration Test", characteristics: "Calibration Test at any 5 Points", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "8", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "R", client: "R", remarks: "" },
  ],
  remarks: "",
};

export const QAP_BYPASS_ROTAMETER: QapMasterEntry = {
  docNo: "F/QAP/01-01",
  title: "QUALITY ASSURANCE PLAN FOR BY PASS ROTAMETER",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Pipe, Body", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "MTC/Lab Test/Test Report", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Technical Spec & Accessories", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Dimension, Visual Check", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Hydro Test", characteristics: "", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "5", component: "Final Inspection", characteristics: "Visual Inspection & Tag No., Model No., Sr. No.", category: "MA", method: "Visual", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "6", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "W", client: "W", remarks: "" },
  ],
  remarks: "",
};

export const QAP_REFLEX_LEVEL: QapMasterEntry = {
  docNo: "F/QAP/01-18",
  title: "QUALITY ASSURANCE PLAN FOR REFLEX LEVEL GAUGE",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Flange, Cover Plate, U Bolt & Nuts", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "Material Test Certificate (MTC)", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Technical Spec & Accessories", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Dimension, Visual Check", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Hydro Test", characteristics: "Hydro Test as per PO or Data Sheet", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "5", component: "Final Inspection", characteristics: "Dimensional, Visual Inspection & Tag Nos.", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "6", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "W", client: "W", remarks: "" },
  ],
  remarks: "(FINAL PERFORMANCE TEST WILL BE DONE FOR THE SYSTEM DURING COMMISSIONING)",
};

export const QAP_MAGNETIC_LEVEL: QapMasterEntry = {
  docNo: "F/QAP/01-19",
  title: "QUALITY ASSURANCE PLAN FOR SIDE / TOP MOUNTED MAGNETIC LEVEL INDICATOR",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Flange, Float", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "Material Test Certificate (MTC)", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Technical Spec & Accessories", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Dimension, Visual Check", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Hydro Test", characteristics: "Hydro Test Of Chamber as per PO or Data Sheet", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "5", component: "Final Inspection", characteristics: "Dimensional, Visual Inspection & Tag Nos.", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "6", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "W", client: "W", remarks: "" },
  ],
  remarks: "(FINAL PERFORMANCE TEST WILL BE DONE FOR THE SYSTEM DURING COMMISSIONING)",
};

export const QAP_TRANSPARENT_LEVEL: QapMasterEntry = {
  docNo: "F/QAP/01-18A",
  title: "QUALITY ASSURANCE PLAN FOR TRANSPARENT LEVEL GAUGE",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Flange, Cover Plate, U Bolt & Nuts, Flat Glass", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "Material Test Certificate (MTC)", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Technical Spec & Accessories", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Dimension, Visual Check", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Hydro Test", characteristics: "Hydro Test as per PO or Data Sheet", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "5", component: "Final Inspection", characteristics: "Dimensional, Visual Inspection & Tag Nos.", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "6", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "W", client: "W", remarks: "" },
  ],
  remarks: "(FINAL PERFORMANCE TEST WILL BE DONE FOR THE SYSTEM DURING COMMISSIONING)",
};

export const QAP_TUBULAR_LEVEL: QapMasterEntry = {
  docNo: "F/QAP/01-20",
  title: "QUALITY ASSURANCE PLAN FOR TUBULAR LEVEL INDICATOR",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Flange", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "Material Test Certificate (MTC)", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Technical Spec & Accessories", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Dimension, Visual Check", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Hydro Test", characteristics: "Hydro Test Of Chamber at 7 Kg/cm2 For 5 Min.", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "P", agency: "R", client: "R", remarks: "" },
    { srNo: "5", component: "Final Inspection", characteristics: "Dimensional, Visual Inspection & Tag Nos.", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "R", client: "R", remarks: "" },
    { srNo: "6", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "R", client: "R", remarks: "" },
  ],
  remarks: "",
};

export const QAP_TURBINE: QapMasterEntry = {
  docNo: "F/QAP/01-21",
  title: "QUALITY ASSURANCE PLAN FOR TURBINE FLOW METER",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Flange", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "Material Test Certificate (MTC)", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Technical Spec & Accessories", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Dimension, Visual Check", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Calibration Test", characteristics: "Calibration Test is carried out at any 4 Points (*)", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "* Max. Flow Range Up to 500 M3/Hr" },
    { srNo: "5", component: "Final Inspection", characteristics: "Dimensional, Visual Inspection / Model No., Tag No.", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "6", component: "Calibration Test", characteristics: "Calibration Test is carried out at any 4 Points (*)", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "* Max. Flow Range Up to 500 M3/Hr" },
    { srNo: "7", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "W", client: "W", remarks: "" },
  ],
  remarks: "(FINAL PERFORMANCE TEST WILL BE DONE FOR THE SYSTEM DURING COMMISSIONING)",
};

// ─── Product Family to QAP Lookup ────────────────────────────────────────

export type QapProductFamily =
  | "emf" | "oval_gear" | "float_board_level" | "rotameter" | "reflex_level"
  | "magnetic_level" | "tubular_level" | "turbine" | "ultrasonic"
  | "hydrostatic_level" | "radar_level" | "transparent_level"
  | "vortex" | "smart_pressure" | "dp_pressure" | "miniature_pressure"
  | "acrylic_body_rotameter" | "bypass_rotameter" | "metal_tube_rotameter"
  | "double_window_sight_glass" | "allen_bolt_sight_glass";

export const QAP_ULTRASONIC: QapMasterEntry = {
  docNo: "F/QAP/01-27",
  title: "QUALITY ASSURANCE PLAN FOR INSERTION TYPE ULTRASONIC FLOW METER",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Sensor Housing", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing/Data Sheet", acceptance: "AS PER MTC", recordFormat: "Material Test Certificate (MTC)/ TC", flowtech: "P", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Serial No., Visual Check", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing/Data Sheet", acceptance: "Approved Drawing/Data Sheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Calibration Test is carried out at any 4 Points (*)", characteristics: "", category: "MA", method: "Visual & Measurment", extent: "100%", reference: "Approved Drawing/Data Sheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "* Max. Flow Range Up to 500 M3/Hr" },
    { srNo: "4", component: "Final Inspection", characteristics: "Dimensional Check", category: "MA", method: "Visual & Measurment", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing/Data Sheet", acceptance: "Approved Drawing/Data Sheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "5", component: "Final Inspection (Visual)", characteristics: "Verification of General Finish, Serial No., Visual Check", category: "MA", method: "Visual", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing/Data Sheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "6", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing/Data Sheet/PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "W", client: "W", remarks: "" },
  ],
  remarks: "(FINAL PERFORMANCE TEST WILL BE DONE FOR THE SYSTEM DURING COMMISSIONING)",
};

export const QAP_HYDROSTATIC_LEVEL: QapMasterEntry = {
  docNo: "F/QAP/01-11",
  title: "QUALITY ASSURANCE PLAN FOR HYDROSTATIC LEVEL TRANSMITTER",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Flange, Sensor", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "Material Test Certificate (MTC)", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Technical Spec & Accessories", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Dimension, Visual Check", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Calibration Test", characteristics: "Calibration Test at 5 Points", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "5", component: "Final Inspection", characteristics: "Dimensional, Visual Inspection & Tag Nos.", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "6", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "W", client: "W", remarks: "" },
  ],
  remarks: "(FINAL PERFORMANCE TEST WILL BE DONE FOR THE SYSTEM DURING COMMISSIONING)",
};

export const QAP_VORTEX: QapMasterEntry = {
  docNo: "F/QAP/01",
  title: "QUALITY ASSURANCE PLAN FOR VORTEX FLOW METER",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Process Connection, Body", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "MTC/Lab Test/Test Report", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Technical Spec & Accessories", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Dimension, Visual Check", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Hydro Test", characteristics: "", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "Flow Meter:- Upto 16 Kg/Cm2" },
    { srNo: "5", component: "Calibration Test (5%, 10%, 15%)", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "6", component: "Final Inspection", characteristics: "Dimensional, Visual", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "7", component: "Calibration Test (5%, 10%, 15%)", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "8", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "R", agency: "R", client: "R", remarks: "" },
  ],
  remarks: "Notes:- Please note that the internal test / calibration certificate will be issued according to our QC server format.",
};

export const QAP_SMART_PRESSURE: QapMasterEntry = {
  docNo: "F/QAP/01-16",
  title: "QUALITY ASSURANCE PLAN FOR SMART PRESSURE TRANSMITTER",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Sensor Housing Enclosure", category: "MA", method: "Chemical Analysis/Type Test", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "Material Test Certificate (MTC)/TC/Lab Test Report", flowtech: "P", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Serial No., Visual Check", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Calibration Test is carried out at any 4 Points", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Final Inspection", characteristics: "Functional Test", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "5", component: "Verification of General Finish, Serial No., Visual Check", characteristics: "", category: "MA", method: "Visual", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "6", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "R", client: "R", remarks: "" },
  ],
  remarks: "(FINAL PERFORMANCE TEST WILL BE DONE FOR THE SYSTEM DURING COMMISSIONING)",
};

export const QAP_RADAR_LEVEL: QapMasterEntry = {
  docNo: "F/QAP/01-17",
  title: "QUALITY ASSURANCE PLAN FOR RADAR TYPE LEVEL TRANSMITTER",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Flange", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "Material Test Certificate (MTC)", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Technical Spec & Accessories", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Dimension, Visual Check", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Calibration Test", characteristics: "Calibration Test at 5 Points", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "5", component: "Final Inspection", characteristics: "Dimensional, Visual Inspection & Tag Nos.", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "6", component: "Document Verification With NABL Test Report of Testing Equipment", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "W", client: "W", remarks: "" },
  ],
  remarks: "(FINAL PERFORMANCE TEST WILL BE DONE FOR THE SYSTEM DURING COMMISSIONING)",
};

export const QAP_DOUBLE_WINDOW_SIGHT_GLASS: QapMasterEntry = {
  title: "QUALITY ASSURANCE PLAN FOR DOUBLE WINDOW SIGHT GLASS",
  docNo: "F/QAP/01-26",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Flange, MOC", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "MTC / CTC", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Tag No., Range, Technical Spec & Accessories", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Dimension, Visual Check", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Hydro Test at per PO or Data Sheet", characteristics: "", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "5", component: "Final Inspection", characteristics: "Dimensional, Visual Inspection & Tag No. Sr.No., Range, Model No.", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "6", component: "Document Verification With NABL Test Report", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "W", client: "W", remarks: "" },
  ],
  remarks: "(FINAL PERFORMANCE TEST WILL BE DONE FOR THE SYSTEM DURING COMMISSIONING)",
};

export const QAP_ALLEN_BOLT_SIGHT_GLASS: QapMasterEntry = {
  title: "QUALITY ASSURANCE PLAN FOR ALLEN BOLT SIGHT GLASS",
  docNo: "F/QAP/01-29",
  revNo: "00",
  date: "01/01/2024",
  approvedBy: "NILESH SHAH",
  rows: [
    { srNo: "1", component: "Raw Material", characteristics: "Flange", category: "MA", method: "Chemical Analysis", extent: "1 No. of each size", reference: "Approved Drawing / Datasheet", acceptance: "AS PER MTC", recordFormat: "MTC / CTC", flowtech: "R", agency: "R", client: "R", remarks: "" },
    { srNo: "2", component: "Internal Inspection", characteristics: "Verification of General Finish, Model & Serial No., Tag No., Range", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "3", component: "Dimensional and Visual Check", characteristics: "", category: "MA", method: "Visual & Measurement", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "4", component: "Hydro Test at per PO or Data Sheet", characteristics: "", category: "MA", method: "Visual", extent: "100%", reference: "Approved Drawing / Datasheet", acceptance: "Test Report", recordFormat: "Test Report", flowtech: "W, P", agency: "R", client: "R", remarks: "" },
    { srNo: "5", component: "Final Inspection", characteristics: "Dimensional, Visual Inspection & Tag No. Sr.No., Range, Model No.", category: "MA", method: "Visual & Measurement", extent: "10% Quantity With Minimum of 1 Piece / Size", reference: "Approved Drawing / Datasheet", acceptance: "Approved Drawing / Datasheet", recordFormat: "Test Report", flowtech: "P", agency: "W", client: "W", remarks: "" },
    { srNo: "6", component: "Document Verification With NABL or Test Report", characteristics: "", category: "CR", method: "Review", extent: "100%", reference: "Approved Drawing / Datasheet / PO", acceptance: "Test Report & MTC", recordFormat: "Test Report & MTC", flowtech: "P", agency: "W", client: "W", remarks: "" },
  ],
  remarks: "",
};

export const QAP_MASTER_MAP: Record<QapProductFamily, QapMasterEntry> = {
  emf: QAP_EMF,
  oval_gear: QAP_OVAL_GEAR,
  float_board_level: QAP_FLOAT_BOARD,
  rotameter: QAP_GLASS_TUBE_ROTAMETER,
  reflex_level: QAP_REFLEX_LEVEL,
  magnetic_level: QAP_MAGNETIC_LEVEL,
  tubular_level: QAP_TUBULAR_LEVEL,
  turbine: QAP_TURBINE,
  ultrasonic: QAP_ULTRASONIC,
  hydrostatic_level: QAP_HYDROSTATIC_LEVEL,
  radar_level: QAP_RADAR_LEVEL,
  transparent_level: QAP_TRANSPARENT_LEVEL,
  acrylic_body_rotameter: QAP_ACRYLIC_BODY_ROTAMETER,
  bypass_rotameter: QAP_BYPASS_ROTAMETER,
  metal_tube_rotameter: QAP_METAL_TUBE_ROTAMETER,
  double_window_sight_glass: QAP_DOUBLE_WINDOW_SIGHT_GLASS,
  allen_bolt_sight_glass: QAP_ALLEN_BOLT_SIGHT_GLASS,
  vortex: QAP_VORTEX,
  smart_pressure: QAP_SMART_PRESSURE,
  dp_pressure: QAP_SMART_PRESSURE,
  miniature_pressure: QAP_SMART_PRESSURE,
};

// ─── Check if a product family has a QAP master ──────────────────────────
export function hasQapMaster(family: string): family is QapProductFamily {
  return family in QAP_MASTER_MAP;
}

export function getQapMaster(family: QapProductFamily): QapMasterEntry {
  return QAP_MASTER_MAP[family];
}

// ─── Product family labels for display ───────────────────────────────────
export const QAP_PRODUCT_LABELS: Record<QapProductFamily, string> = {
  emf: "Electromagnetic Flow Meter",
  oval_gear: "Oval Gear Flow Meter",
  float_board_level: "Float & Board Level Gauge",
  rotameter: "Glass Tube Rotameter",
  reflex_level: "Reflex Level Gauge",
  magnetic_level: "Magnetic Level Indicator (Side/Top)",
  transparent_level: "Transparent Level Gauge",
  tubular_level: "Tubular Level Indicator",
  turbine: "Turbine Flow Meter",
  ultrasonic: "Insertion Type Ultrasonic Flow Meter",
  hydrostatic_level: "Hydrostatic Level Transmitter",
  radar_level: "Radar Type Level Transmitter",
  vortex: "Vortex Flow Meter",
  smart_pressure: "Smart Pressure Transmitter",
  dp_pressure: "Differential Pressure Transmitter",
  miniature_pressure: "Miniature Pressure Transmitter",
  acrylic_body_rotameter: "Acrylic Body Rotameter",
  bypass_rotameter: "By Pass Rotameter",
  metal_tube_rotameter: "Metal Tube Rotameter",
  double_window_sight_glass: "Double Window Sight Glass",
  allen_bolt_sight_glass: "Allen Bolt Sight Glass",
};

// ─── Pending products (no QAP uploaded yet) ──────────────────────────────
export const QAP_PENDING_PRODUCTS: { family: string; label: string }[] = []; // ALL 17 products have QAPs
