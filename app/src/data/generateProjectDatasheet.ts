/**
 * Project Datasheet Generator with GAD
 * Bridges project line items (with sizing results) to the existing
 * Datasheet + GAD system. Generates per-line-item datasheets with
 * embedded GA Drawings.
 */

import type { ExtractedLineItem, ProjectMetadata } from "../types/shared";
import { findGADrawing } from "./gaDrawingLookup";
import { generateDatasheetTemplate, generateLineItemDatasheetOnly } from "./datasheetTemplate";
import type { SODatasheet, LineItem as DatasheetLineItem, SectionData, SOHeader } from "./dataMapper";
import { detectConnection } from "./connectionDimensions";

export interface ProjectDatasheetResult {
  html: string;
  datasheet: SODatasheet;
  gadMatches: { tagNo: string; hasGad: boolean; drawingNo?: string; totalInFamily: number }[];
}

/**
 * Generate a complete Technical Datasheet with GA Drawings for a project.
 * This converts project line items to the datasheet format, looks up GAD
 * for each line item, and generates the landscape HTML.
 */
export async function generateProjectDatasheet(
  lineItems: ExtractedLineItem[],
  metadata: ProjectMetadata,
  projectRef: string
): Promise<ProjectDatasheetResult> {
  // Build SO header — STRIP all commercial/banking info.
  // Datasheets are purely technical documents. No client names,
  // bank details, or commercial references appear.
  const header: SOHeader = {
    soNo: metadata.quoteNumber || projectRef,
    poNo: "",
    project: metadata.projectName || "Project",
    client: "",          // Commercial — intentionally blank
    endUser: "",         // Commercial — intentionally blank
    contractor: "",      // Commercial — intentionally blank
    supplier: "Flowtech Instruments (I) Pvt. Ltd.",
    date: metadata.date || new Date().toISOString().split("T")[0],
    rev: metadata.revisionNumber || "0",
    revDescription: "",
    totalQty: lineItems.reduce((sum, li) => sum + (li.quantity || 1), 0).toString(),
    totalLineItems: lineItems.length,
    notes: [],
  };

  // Convert project line items to datasheet line items
  const dsLineItems: DatasheetLineItem[] = lineItems.map((li, idx) => {
    const pc = li.processConditions;
    const sr = li.sizingResult;

    // Build sections from the line item data + sizing result
    const sections: SectionData[] = [];

    // ─── General Information ────────────────────────────────────
    // CRITICAL: Model = li.modelName (Flowtech Model Name), NOT li.modelNumber (De-Codification)
    const generalRows: [string, string][] = [
      ["Instrument Type", li.productFamily],
      ["Tag Number", li.tagNumber],
      ["Model Name", li.modelName || "Not Specified"],
      ["De-Codification No.", li.modelNumber || "Not Specified"],
      ["Size", sr?.bestSize || li.size || "TBD"],
      ["Quantity", String(li.quantity || 1)],
      ["Service / Application", li.application || li.processMedium || (pc?.service || "")],
      ["Line Size", pc?.pipeSize || li.size || ""],
    ];
    sections.push({ title: "General Information", rows: generalRows });

    // ─── Process Data ──────────────────────────────────────────
    const processRows: [string, string][] = [
      ["Service Type", pc?.service || "—"],
      ["Process Fluid", pc?.fluidName || li.processMedium || "—"],
      ["Flow Rate (Min)", (pc?.flowRateMin || 0) + " " + (pc?.flowUnit || li.flowUnit || "m³/hr")],
      ["Flow Rate (Max)", (pc?.flowRateMax || 0) + " " + (pc?.flowUnit || li.flowUnit || "m³/hr")],
      ["Flow Rate (Normal)", sr ? (((sr.qMin ?? 0) + (sr.qMax ?? 0)) / 2).toFixed(1) + " " + (sr.qMinUnit || "m³/hr") : "—"],
      ["Operating Pressure", (pc?.operatingPressure || li.pressure || "—") + (pc ? " bar abs" : "")],
      ["Operating Temperature", (pc?.operatingTemp || li.temperature || "—") + (pc ? " °C" : "")],
      ["Fluid Density", pc?.density ? pc.density + " kg/m³" : "—"],
      ["Fluid Viscosity", pc?.viscosity ? pc.viscosity + " cP" : "—"],
    ];
    if (sr) {
      processRows.push(["Meter Size", sr.bestSize || "—"]);
      processRows.push(["Meter Qmin", ((sr.qMin ?? 0)).toFixed(1) + " " + (sr.qMinUnit || "m³/hr")]);
      processRows.push(["Meter Qmax", ((sr.qMax ?? 0)).toFixed(1) + " " + (sr.qMinUnit || "m³/hr")]);
      processRows.push(["Turndown", ((sr.turndown ?? 0)).toFixed(1) + ":1"]);
      processRows.push(["Accuracy", sr.accuracy || "±0.5% MV"]);
      if (sr.velocityMin && sr.velocityMax) {
        processRows.push(["Velocity Range", sr.velocityMin.toFixed(2) + " - " + sr.velocityMax.toFixed(2) + " m/s (" + (sr.velocityStatus || "") + ")]"]);
      }
    }
    if (sr?.waterEquivalent) {
      const we = sr.waterEquivalent;
      processRows.push(["Water Equivalent (Norm)", ((we.weNorm ?? 0)).toFixed(1) + " LPH"]);
      processRows.push(["Water Equivalent (Min)", ((we.weMin ?? 0)).toFixed(1) + " LPH"]);
      processRows.push(["Water Equivalent (Max)", ((we.weMax ?? 0)).toFixed(1) + " LPH"]);
      processRows.push(["Fluid Correction Factor (FCF)", ((we.fcf ?? 0)).toFixed(4)]);
      processRows.push(["Gas Correction Factor (GCF)", ((we.gcf ?? 0)).toFixed(4)]);
    }
    sections.push({ title: "Process Data", rows: processRows });

    // ════════════════════════════════════════════════════════════
    // CATEGORIZE ALL SPECS USING SO'S ORIGINAL SECTION HEADERS
    // SO sections: TECHNICAL SPECIFICATIONS | DESIGN PARAMETERS (WE) | ACCESORIES DATA
    // ════════════════════════════════════════════════════════════
    const allSpecs = Object.entries(li.specs || {});

    const techRows: [string, string][] = [];
    const designRows: [string, string][] = [];
    const accessoryRows: [string, string][] = [];

    for (const [key, value] of allSpecs) {
      if (!value || !value.trim()) continue;
      const keyLower = key.toLowerCase();
      // DESIGN PARAMETERS: rangeability, f/f, accuracy, branding, float moc, float retainer, water equivalent, body range
      if (/rangeability|f\/f\s*ht|accuracy|branding|float\s*moc|float\s*retainer|water\s*equivalent|body\s*range/i.test(keyLower)) {
        designRows.push([key, value]);
      }
      // ACCESSORIES: fasteners, gasket, isolation valve, ball valve, induced pipe, main connection, sandwich plate, gland ring
      else if (/fasteners?\s*moc|gasket\b|isolation\s*valve|ball\s*valve\b|induced\s*pipe\s*moc|main\s*connection\s*size|sandwich\s*plate\s*moc|gland\s*ring/i.test(keyLower)) {
        accessoryRows.push([key, value]);
      }
      // TECHNICAL SPECIFICATIONS: everything else (gland packing, glass tube, protection cover, scale, body, connections, etc.)
      else {
        techRows.push([key, value]);
      }
    }

    // ════════════════════════════════════════════════════════════
    // SECTION 2: TECHNICAL SPECIFICATIONS (exact SO header)
    // ════════════════════════════════════════════════════════════
    if (techRows.length > 0) {
      sections.push({ title: "TECHNICAL SPECIFICATIONS", rows: techRows });
    }

    // ════════════════════════════════════════════════════════════
    // SECTION 3: DESIGN PARAMETERS (WE) (exact SO header)
    // ════════════════════════════════════════════════════════════
    if (sr) {
      designRows.push(["Sized Meter", sr.bestSize || "—"]);
      designRows.push(["Meter Range", `${((sr.qMin ?? 0)).toFixed(1)} - ${((sr.qMax ?? 0)).toFixed(1)} ${sr.qMinUnit || "m³/hr"}`]);
      designRows.push(["Turndown Ratio", ((sr.turndown ?? 0)).toFixed(1) + ":1"]);
    }
    if (sr?.waterEquivalent) {
      const we = sr.waterEquivalent;
      designRows.push(["Water Equivalent (LPH)", ((we.weNorm ?? 0)).toFixed(2)]);
      designRows.push(["FCF", ((we.fcf ?? 0)).toFixed(6)]);
      designRows.push(["GCF", ((we.gcf ?? 0)).toFixed(6)]);
    }
    if (designRows.length > 0) {
      sections.push({ title: "DESIGN PARAMETERS (WE)", rows: designRows });
    }

    // ════════════════════════════════════════════════════════════
    // SECTION 4: ACCESORIES DATA (exact SO header)
    // ════════════════════════════════════════════════════════════
    if (accessoryRows.length > 0) {
      sections.push({ title: "ACCESORIES DATA", rows: accessoryRows });
    }

    // ════════════════════════════════════════════════════════════
    // SECTION 5: DOCUMENTS
    // ════════════════════════════════════════════════════════════
    const docRows: [string, string][] = [
      ["GA Drawing", "See attached GA Drawing"],
      ["Operation Manual", "Yes"],
    ];
    if (li.certification?.includes("Calib")) docRows.push(["Calibration Certificate", "Yes"]);
    if (li.certification?.includes("Material")) docRows.push(["Material Certificate", "Yes"]);
    if (li.certification?.includes("Inspection")) docRows.push(["Inspection Certificate", "Yes"]);
    sections.push({ title: "DOCUMENTS", rows: docRows });

    // ─── Sizing Verification ───────────────────────────────────
    if (sr) {
      sections.push({
        title: "Sizing Verification",
        rows: [
          ["Sizing Status", sr.status.toUpperCase()],
          ["Recommended Size", sr.bestSize || "N/A"],
          ["Recommended Product", sr.bestProduct || "N/A"],
          ["Sizing Reason", sr.reason || "—"],
          ["Sized At", new Date(sr.sizedAt).toLocaleString()],
        ],
      });
    }

    // Build processData for sizing check compatibility
    const processData = {
      flowRateMin: pc?.flowRateMin || null,
      flowRateMax: pc?.flowRateMax || null,
      flowRateNormal: sr ? (sr.qMin + sr.qMax) / 2 : null,
      flowUnit: pc?.flowUnit || li.flowUnit || null,
      fluidName: pc?.fluidName || li.processMedium || null,
      fluidDensity: pc?.density || null,
      fluidViscosity: pc?.viscosity || null,
      fluidSG: pc?.service === "gas" ? (pc.density / 1.2) : null,
      operatingTemp: pc?.operatingTemp || null,
      operatingPressure: pc?.operatingPressure || null,
      pressureUnit: "bar",
      lineSize: pc?.pipeSize || li.size || null,
      service: pc?.service === "gas" ? "gas" as const : pc?.service === "liquid" ? "liquid" as const : null,
    };

    // GAD note
    const gadNote = li.notes || "";

    return {
      srNo: idx + 1,
      tagNo: li.tagNumber,
      instrumentType: li.productFamily,
      service: li.application || li.processMedium || (pc?.service || ""),
      size: sr?.bestSize || li.size || "",
      qty: li.quantity || 1,
      model: li.modelName || "Not Specified",  // Model Name (from SO "MODEL NO." field)
      decodNo: li.modelNumber || "",            // De-Codification No. (FMIPL-... code)
      sections,
      gadNote,
      gaDrawingUrl: "", // Will be filled after GAD lookup
      gaDrawingTotal: 0,
      processConnection: detectConnection(li.processConnection + " " + li.specs?.["Process Connection Type"] + " " + li.specs?.["Process Connection Std"] + " " + li.specs?.["F"] + " " + li.specs?.["Connection"] + " " + li.size),
      customDimensions: li.customDimensions || [],
      processData,
      sizingWarning: sr?.reason || "",
      header,
    };
  });

  // ─── Look up GA Drawings for each line item ─────────────────
  const gadMatches: ProjectDatasheetResult["gadMatches"] = [];
  for (let i = 0; i < dsLineItems.length; i++) {
    const li = dsLineItems[i];
    try {
      const result = await findGADrawing(li.instrumentType, li.size, li.decodNo);
      if (result.best) {
        dsLineItems[i].gaDrawingUrl = result.best.dataUrl;
        dsLineItems[i].gaDrawingTotal = result.best.totalInFamily;
        gadMatches.push({
          tagNo: li.tagNo,
          hasGad: true,
          drawingNo: result.best.drawing.drawingNo,
          totalInFamily: result.best.totalInFamily,
        });
      } else {
        gadMatches.push({ tagNo: li.tagNo, hasGad: false, totalInFamily: result.allOptions.length });
      }
    } catch (e) {
      gadMatches.push({ tagNo: li.tagNo, hasGad: false, totalInFamily: 0 });
    }
  }

  // Build the SODatasheet
  const datasheet: SODatasheet = { header, lineItems: dsLineItems };

  // Generate HTML using the existing template
  const html = generateDatasheetTemplate(datasheet);

  return { html, datasheet, gadMatches };
}

/**
 * Generate a single-line-item datasheet with GAD (for individual download).
 * Returns ONLY the Datasheet + GAD page — NO cover page, NO instrument summary.
 */
export async function generateSingleLineItemDatasheet(
  lineItem: ExtractedLineItem,
  metadata: ProjectMetadata,
  projectRef: string,
  idx: number
): Promise<{ html: string; hasGad: boolean; drawingNo?: string }> {
  // Build the full project datasheet to get GAD lookup
  const result = await generateProjectDatasheet([lineItem], metadata, projectRef);
  const gadInfo = result.gadMatches[0];

  // Generate ONLY the datasheet + GAD page (no cover, no index, no standards)
  const dsLineItem = result.datasheet.lineItems[0];
  const singlePageHtml = generateLineItemDatasheetOnly(dsLineItem);

  return {
    html: singlePageHtml,
    hasGad: gadInfo?.hasGad || false,
    drawingNo: gadInfo?.drawingNo,
  };
}
