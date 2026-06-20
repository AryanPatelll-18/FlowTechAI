/**
 * EMF Model Selector Guide PDF Generator
 * Creates a professional Flowtech-branded PDF guide explaining model logic & differences
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { EMF_PRODUCT_FAMILY, EMF_MODELS } from "./emfModelData";

const RED = "#C20017";
const DARK_GREY = "#2D2D2D";
const LIGHT_GREY = "#F5F5F5";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

export function downloadSelectorGuidePdf() {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 10;

  // ─── Helper: Header Bar ─────────────────────────────────────────────────
  function drawHeaderBar(yPos: number, h: number = 12) {
    doc.setFillColor(RED);
    doc.rect(0, yPos, pageW, h, "F");
    doc.setTextColor(WHITE);
    doc.setFont("helvetica", "bold");
  }

  // ─── Helper: Footer ─────────────────────────────────────────────────────
  function drawFooter(pageNum: number) {
    doc.setFillColor(DARK_GREY);
    doc.rect(0, pageH - 8, pageW, 8, "F");
    doc.setTextColor(WHITE);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Flowtech Instruments (I) Pvt. Ltd.  |  FlowMag Electromagnetic Flowmeter Model Selector Guide", 10, pageH - 3);
    doc.text(`Page ${pageNum}`, pageW - 15, pageH - 3);
  }

  // ─── Helper: Section Title ──────────────────────────────────────────────
  function sectionTitle(text: string, yPos: number) {
    drawHeaderBar(yPos);
    doc.setFontSize(11);
    doc.text(text, 10, yPos + 8);
    return yPos + 14;
  }

  // ─── Helper: Highlighted Model Name ─────────────────────────────────────
  function drawHighlightedModel(doc2: jsPDF, baseName: string, highlight: string, x: number, yPos: number, fontSize: number = 9) {
    doc2.setFontSize(fontSize);
    doc2.setFont("helvetica", "bold");
    doc2.setTextColor(BLACK);
    const baseWidth = doc2.getTextWidth(baseName);
    doc2.text(baseName, x, yPos);
    doc2.setTextColor(RED);
    doc2.text(highlight, x + baseWidth, yPos);
    doc2.setTextColor(BLACK);
    return x + baseWidth + doc2.getTextWidth(highlight);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ═══════════════════════════════════════════════════════════════════════════

  // Red header band
  doc.setFillColor(RED);
  doc.rect(0, 0, pageW, 45, "F");
  doc.setTextColor(WHITE);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FLOWTECH", 10, 20);
  doc.setFontSize(14);
  doc.text("FlowMag Electromagnetic Flowmeter", 10, 32);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Model Selector Guide  |  Technical Reference Document", 10, 40);

  // Sub-header
  doc.setFillColor(DARK_GREY);
  doc.rect(0, 45, pageW, 6, "F");

  y = 60;

  // Product description
  doc.setTextColor(BLACK);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const desc = doc.splitTextToSize(EMF_PRODUCT_FAMILY.description, pageW - 20);
  doc.text(desc, 10, y);
  y += desc.length * 4 + 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Working Principle:", 10, y);
  doc.setFont("helvetica", "normal");
  y += 4;
  const principle = doc.splitTextToSize(EMF_PRODUCT_FAMILY.workingPrinciple, pageW - 20);
  doc.text(principle, 10, y);
  y += principle.length * 4 + 6;

  // Key parameters box
  doc.setFillColor(LIGHT_GREY);
  doc.roundedRect(10, y, pageW - 20, 28, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(RED);
  doc.text("Key Parameters", 14, y + 6);
  doc.setTextColor(BLACK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  EMF_PRODUCT_FAMILY.keyParameters.forEach((param, i) => {
    doc.text(`• ${param}`, 14, y + 12 + i * 5);
  });
  y += 36;

  // Model count summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(RED);
  doc.text(`${EMF_MODELS.length} Models  |  5 Series  |  Multiple Configurations`, 10, y);
  y += 10;

  // Series overview table
  autoTable(doc, {
    startY: y,
    head: [["Series", "Description", "Key Feature", "Models"]],
    body: [
      ["S630", "General purpose", "Standard water/process", "S630, S630B, S630F"],
      ["S660", "Water supply", "Rubber lined for water", "900-S660, S660 BP"],
      ["S90", "Corrosive service", "Full PVC/CPVC body", "S90"],
      ["S900", "Wastewater/Chemical", "Hastelloy/Tantalum electrodes", "S900, S900Ex, S900ExF, S900F"],
      ["S930", "Hygienic", "Full SS316, Tri-Clover", "S930"],
    ],
    headStyles: { fillColor: RED, textColor: WHITE, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT_GREY },
    theme: "grid",
    margin: { left: 10, right: 10 },
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 8;

  drawFooter(1);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — MODEL NAMING CONVENTION (highlighted short letters)
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  y = sectionTitle("MODEL NAMING CONVENTION — Understanding the Suffixes", 0);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Each FlowMag model has a suffix that indicates its special configuration. Understanding these short letters helps you select the right model quickly.", 10, y);
  y += 8;

  // Suffix explanation table with highlighted letters
  autoTable(doc, {
    startY: y,
    head: [["Suffix", "Full Name", "Meaning", "When to Select"]],
    body: [
      [highlightCell(doc, "(none)"), "Standard", "Base model with all standard features", "General water/process applications, safe area"],
      [highlightCell(doc, "B"), "Battery", "Battery-operated (3.6V Lithium, 3-5 year life)", "Remote locations with no external power supply"],
      [highlightCell(doc, "BP"), "Battery + Process", "Battery-operated with earthing ring & in-built electrode", "Remote water supply with earthing requirements"],
      [highlightCell(doc, "F"), "Flange-End / High Pressure", "High-pressure rated (up to 200 Kg/Cm²), threaded/flange-end option", "High-pressure applications, hydraulic systems"],
      [highlightCell(doc, "Ex"), "Explosion-Proof", "PESO-certified Flameproof (IIA, IIB, IIC)", "Hazardous areas (Zone 1/2), flammable atmospheres"],
      [highlightCell(doc, "ExF"), "Explosion-Proof + Flange-End", "Flameproof + high pressure (ASA 300/600 flanges)", "Hazardous area + high pressure combined"],
    ],
    headStyles: { fillColor: RED, textColor: WHITE, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT_GREY },
    theme: "grid",
    margin: { left: 10, right: 10 },
    columnStyles: {
      0: { fontStyle: "bold", textColor: RED, cellWidth: 18 },
    },
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 10;

  // Naming logic visual
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(RED);
  doc.text("Model Name Structure:", 10, y);
  y += 6;

  doc.setFontSize(8);
  doc.setTextColor(BLACK);
  doc.setFont("helvetica", "normal");
  doc.text("FlowMag  [Series]  [Suffix]", 10, y);
  y += 5;
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text("Example:  FlowMag S630F  =  Series S630  +  F (High Pressure)", 10, y);
  y += 5;
  doc.text("Example:  FlowMag S900Ex =  Series S900  +  Ex (Flameproof)", 10, y);
  y += 5;
  doc.text("Example:  FlowMag S660BP =  Series S660  +  BP (Battery + Process)", 10, y);
  y += 8;

  // Quick selection logic box
  doc.setFillColor(LIGHT_GREY);
  doc.roundedRect(10, y, pageW - 20, 38, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(RED);
  doc.text("Quick Selection Logic", 14, y + 6);
  doc.setTextColor(BLACK);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  const logicLines = [
    "1. Start with Series:  S630 (general)  →  S660 (water supply)  →  S900 (corrosive)  →  S930 (hygienic)",
    "2. Add 'B' suffix if NO external power is available at site",
    "3. Add 'F' suffix if pressure exceeds 15 Kg/Cm² (high pressure required)",
    "4. Add 'Ex' suffix if installed in hazardous / flammable atmosphere",
    "5. Combine 'Ex' + 'F' for hazardous area + high pressure together",
    "6. S90 (PVC) is a standalone model for highly corrosive acid/alkali only",
  ];
  logicLines.forEach((line, i) => doc.text(line, 14, y + 12 + i * 4.5));

  drawFooter(2);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — SERIES COMPARISON
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  y = sectionTitle("SERIES COMPARISON — Which Series to Choose?", 0);

  autoTable(doc, {
    startY: y,
    head: [["Parameter", "S630", "S660", "S90 (PVC)", "S900", "S930"]],
    body: [
      ["Primary Use", "General water/process", "Water supply projects", "Corrosive chemicals", "Wastewater/chemical", "Food & beverage"],
      ["Lining", "PTFE", "Rubber", "PVC body (no lining)", "PTFE", "PTFE"],
      ["Flowtube MOC", "SS 304", "SS 304", "CPVC", "SS 316", "SS 316"],
      ["Electrodes", "SS 316L", "SS 316L", "SS 316L", "Hastelloy-C / Tantalum", "SS 316L"],
      ["Max Pressure", "15 Kg/Cm²", "15 Kg/Cm²", "15 Kg/Cm²", "25 Kg/Cm² (200 with F)", "15 Kg/Cm²"],
      ["Max Temperature", "100°C", "60°C", "60°C", "100°C", "100°C"],
      ["Coil Housing", "CS", "CS", "CPVC", "SS 304", "SS 316"],
      ["Connection Std", "ASA 150#", "IS 1538", "ASA 150#", "ASA 150#", "ASA 150# / TC"],
      ["Battery Option", "Yes (S630B)", "Yes (S660BP)", "No", "No", "No"],
      ["Flameproof Option", "No", "No", "No", "Yes (S900Ex)", "No"],
      ["High Pressure", "Yes (S630F)", "No", "No", "Yes (S900F/ExF)", "No"],
      ["Hygienic", "No", "No", "No", "No", "Yes — Tri-Clover"],
    ],
    headStyles: { fillColor: RED, textColor: WHITE, fontSize: 7.5, fontStyle: "bold" },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: LIGHT_GREY },
    theme: "grid",
    margin: { left: 10, right: 10 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 32 },
    },
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 8;

  // Decision matrix
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(RED);
  doc.text("Application-to-Series Decision Matrix", 10, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Application / Requirement", "Recommended Series", "Alternative", "Avoid"]],
    body: [
      ["General water / process liquid", "S630", "S660 (if water only)", "S90, S930"],
      ["Water supply project", "S660", "S630", "S90"],
      ["Remote location (no power)", "S630B or S660BP", "—", "S90, S930"],
      ["Corrosive chemicals", "S900", "S90 (PVC)", "S630, S660"],
      ["Highly corrosive acid/alkali", "S90 (PVC)", "S900", "S630, S660"],
      ["Hazardous area", "S900Ex", "S900ExF (if also HP)", "S630, S660, S90, S930"],
      ["High pressure (>15 Kg/Cm²)", "S630F / S900F", "S900ExF (if also hazardous)", "S660, S90, S930"],
      ["Food & beverage (hygienic)", "S930", "—", "S630, S660, S90, S900"],
      ["Wastewater treatment", "S900", "S660 (if not corrosive)", "S90, S930"],
    ],
    headStyles: { fillColor: DARK_GREY, textColor: WHITE, fontSize: 7.5, fontStyle: "bold" },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: LIGHT_GREY },
    theme: "grid",
    margin: { left: 10, right: 10 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
    },
  });

  drawFooter(3);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 4 — ALL MODELS COMPARISON TABLE
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  y = sectionTitle("COMPLETE MODEL COMPARISON", 0);

  autoTable(doc, {
    startY: y,
    head: [["Model", "Pressure", "Temp", "Lining", "Electrodes", "Enclosure", "Battery", "FLP", "Key Feature"]],
    body: EMF_MODELS.map((m) => [
      m.modelName,
      m.pressureRange,
      m.tempRange,
      m.liningMaterial.join(", ").replace("(PL)", "").replace("(RL)", "").trim(),
      m.electrodeMaterial.map((e) => e.replace(/\s*\(EL\d\)/g, "")).join(", "),
      m.isFlameproof ? "Flameproof (PESO)" : "Weatherproof",
      m.isBatteryOperated ? "Yes (3.6V Li)" : "No",
      m.isFlameproof ? "Yes (IIA/IIB/IIC)" : "No",
      m.specialFeatures[0],
    ]),
    headStyles: { fillColor: RED, textColor: WHITE, fontSize: 7, fontStyle: "bold" },
    bodyStyles: { fontSize: 6.5 },
    alternateRowStyles: { fillColor: LIGHT_GREY },
    theme: "grid",
    margin: { left: 10, right: 10 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 28 },
      7: { cellWidth: 28 },
      8: { cellWidth: 40 },
    },
  });

  drawFooter(4);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 5 — INDIVIDUAL MODEL DETAILS (Part 1)
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  y = sectionTitle("MODEL DETAILS — S630 Series", 0);

  const s630Models = EMF_MODELS.filter((m) => m.id.startsWith("s630"));
  s630Models.forEach((model, idx) => {
    if (idx > 0) y += 4;
    if (y > pageH - 70) {
      drawFooter(5);
      doc.addPage();
      y = sectionTitle("MODEL DETAILS — S630 Series (cont.)", 0);
    }

    // Model header with highlighted suffix
    doc.setFillColor(RED);
    doc.roundedRect(10, y, pageW - 20, 7, 1, 1, "F");
    doc.setTextColor(WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${model.modelName}  |  ${model.modelNo.substring(0, 50)}...`, 12, y + 5);
    y += 10;

    doc.setTextColor(BLACK);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(model.shortDesc, 10, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      body: [
        ["Application", model.application.join(", ")],
        ["Accuracy", model.accuracy],
        ["Conductivity", model.conductivity],
        ["Viscosity", model.viscosity],
        ["Temperature", model.tempRange],
        ["Pressure", model.pressureRange],
        ["Flowtube MOC", model.flowtubeMoc.join(", ")],
        ["Lining", model.liningMaterial.join(", ")],
        ["Electrodes", model.electrodeMaterial.join(", ")],
        ["Process Connection", `${model.processConnectionType.join(", ")} — ${model.processConnectionStd.join(", ")}`],
        ["Output", model.output.join(", ")],
        ["Power Supply", model.powerSupply.join(", ")],
        ["Communication", model.communication.join(", ")],
        ["Special Features", model.specialFeatures.join("; ")],
        ["Limitations", model.limitations.join("; ")],
      ],
      bodyStyles: { fontSize: 6.5 },
      theme: "grid",
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 35, fillColor: LIGHT_GREY },
      },
      showHead: "never",
    });

    // @ts-ignore
    y = doc.lastAutoTable.finalY + 4;
  });

  drawFooter(5);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 6 — S660 + S90 + S930
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  y = sectionTitle("MODEL DETAILS — S660 / S90 / S930 Series", 0);

  const otherModels = EMF_MODELS.filter((m) => m.id.startsWith("s660") || m.id === "s90" || m.id === "s930");
  otherModels.forEach((model, idx) => {
    if (idx > 0) y += 4;
    if (y > pageH - 70) {
      drawFooter(6);
      doc.addPage();
      y = sectionTitle("MODEL DETAILS — S660 / S90 / S930 (cont.)", 0);
    }

    doc.setFillColor(RED);
    doc.roundedRect(10, y, pageW - 20, 7, 1, 1, "F");
    doc.setTextColor(WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${model.modelName}  |  ${model.modelNo.substring(0, 50)}...`, 12, y + 5);
    y += 10;

    doc.setTextColor(BLACK);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(model.shortDesc, 10, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      body: [
        ["Application", model.application.join(", ")],
        ["Accuracy", model.accuracy],
        ["Temperature", model.tempRange],
        ["Pressure", model.pressureRange],
        ["Flowtube MOC", model.flowtubeMoc.join(", ")],
        ["Lining", model.liningMaterial.join(", ")],
        ["Electrodes", model.electrodeMaterial.join(", ")],
        ["Output", model.output.join(", ")],
        ["Power Supply", model.powerSupply.join(", ")],
        ["Special Features", model.specialFeatures.join("; ")],
        ["Limitations", model.limitations.join("; ")],
      ],
      bodyStyles: { fontSize: 6.5 },
      theme: "grid",
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 35, fillColor: LIGHT_GREY },
      },
      showHead: "never",
    });

    // @ts-ignore
    y = doc.lastAutoTable.finalY + 4;
  });

  drawFooter(6);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 7 — S900 Series (4 models)
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  y = sectionTitle("MODEL DETAILS — S900 Series (Wastewater / Chemical)", 0);

  const s900Models = EMF_MODELS.filter((m) => m.id.startsWith("s900"));
  s900Models.forEach((model, idx) => {
    if (idx > 0) y += 4;
    if (y > pageH - 70) {
      drawFooter(7);
      doc.addPage();
      y = sectionTitle("MODEL DETAILS — S900 Series (cont.)", 0);
    }

    const suffixColor = model.isFlameproof && model.isHighPressure ? "#8B0000" : model.isFlameproof ? RED : model.isHighPressure ? "#B8860B" : DARK_GREY;
    doc.setFillColor(suffixColor);
    doc.roundedRect(10, y, pageW - 20, 7, 1, 1, "F");
    doc.setTextColor(WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    const suffixLabel = model.isFlameproof && model.isHighPressure ? " [Ex + F]" : model.isFlameproof ? " [Ex]" : model.isHighPressure ? " [F]" : "";
    doc.text(`${model.modelName}${suffixLabel}  |  ${model.modelNo.substring(0, 45)}...`, 12, y + 5);
    y += 10;

    doc.setTextColor(BLACK);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(model.shortDesc, 10, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      body: [
        ["Application", model.application.join(", ")],
        ["Accuracy", model.accuracy],
        ["Temperature", model.tempRange],
        ["Pressure", model.pressureRange],
        ["Flowtube MOC", model.flowtubeMoc.join(", ")],
        ["Lining", model.liningMaterial.join(", ")],
        ["Electrodes", model.electrodeMaterial.join(", ")],
        ["Enclosure", model.electronicsEnclosure.join(", ")],
        ["Connection", `${model.processConnectionType.join(", ")} — ${model.processConnectionStd.join(", ")}`],
        ["Output", model.output.join(", ")],
        ["Power Supply", model.powerSupply.join(", ")],
        ["Special Features", model.specialFeatures.join("; ")],
        ["Limitations", model.limitations.join("; ")],
      ],
      bodyStyles: { fontSize: 6.5 },
      theme: "grid",
      margin: { left: 10, right: 10 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 35, fillColor: LIGHT_GREY },
      },
      showHead: "never",
    });

    // @ts-ignore
    y = doc.lastAutoTable.finalY + 4;
  });

  drawFooter(7);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 8 — SELECTION DECISION TREE & NOTES
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  y = sectionTitle("SELECTION DECISION TREE", 0);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(BLACK);

  const treeLines = [
    "STEP 1: Identify the Application",
    "    ├─ Water supply / distribution  →  S660 (rubber lined)",
    "    ├─ General process liquid       →  S630 (standard PTFE)",
    "    ├─ Corrosive chemicals          →  S900 (Hastelloy electrodes)",
    "    ├─ Highly corrosive acid/alkali →  S90 (full PVC body)",
    "    └─ Food & beverage (hygienic)   →  S930 (SS316 + Tri-Clover)",
    "",
    "STEP 2: Check Power Availability",
    "    ├─ AC/DC power available        →  Standard model (no suffix)",
    "    └─ No power at site             →  Add 'B' suffix (battery operated)",
    "",
    "STEP 3: Check Pressure Requirement",
    "    ├─ Up to 15 Kg/Cm²              →  Standard flange (no F needed)",
    "    └─ Above 15 Kg/Cm²              →  Add 'F' suffix (high pressure)",
    "",
    "STEP 4: Check Area Classification",
    "    ├─ Safe / non-hazardous area    →  Weatherproof (no Ex needed)",
    "    └─ Hazardous / Zone 1-2         →  Add 'Ex' suffix (flameproof)",
    "",
    "STEP 5: Combine if needed",
    "    └─ Hazardous + High Pressure    →  Use 'ExF' suffix (both)",
  ];

  treeLines.forEach((line, i) => {
    const isStep = line.startsWith("STEP");
    doc.setFont("helvetica", isStep ? "bold" : "normal");
    doc.setTextColor(isStep ? RED : BLACK);
    doc.setFontSize(isStep ? 8 : 7);
    doc.text(line, 10, y + i * 4.5);
  });

  y += treeLines.length * 4.5 + 6;

  // Important notes
  doc.setFillColor(LIGHT_GREY);
  doc.roundedRect(10, y, pageW - 20, 30, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(RED);
  doc.text("Important Notes", 14, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(BLACK);
  const notes = [
    "• Conductivity must be ≥ 5 µS/cm for all EMF models.",
    "• Viscosity must be ≤ 3 cP. Higher viscosity requires consultation.",
    "• S90 (PVC) has no separate lining — full CPVC body acts as liner.",
    "• S900Ex and S900ExF are PESO certified (IIA, IIB, IIC) for hazardous areas.",
    "• Battery models (S630B, S660BP) use 3.6V Lithium with 3-5 year life.",
    "• S930 is the ONLY model with Tri-Clover connection for hygienic applications.",
    "• All models have RS 485 communication and 4-wire system as standard.",
  ];
  notes.forEach((note, i) => doc.text(note, 14, y + 12 + i * 4));

  drawFooter(8);

  // ─── Save ─────────────────────────────────────────────────────────────────
  doc.save("Flowtech_FlowMag_EMF_Model_Selector_Guide.pdf");
}

// Helper to create bold red suffix text for table
function highlightCell(doc2: jsPDF, text: string): string {
  return text;
}
