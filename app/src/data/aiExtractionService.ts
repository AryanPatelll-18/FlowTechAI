/**
 * AI Extraction Service — GPT-4o with Structured Output
 * Falls back to Enhanced Regex Extractor v3 (target: ~90% accuracy)
 */

import type { ExtractedLineItem, ProcessConditions } from "../types/shared";
import { extractWithEnhancedRegex, postProcessExtraction } from "./enhancedRegexExtractor";
import { validateEngineering } from "./engineeringValidator";
import { parseSmart } from "./smartParser";

// ─── AI Settings (stored in localStorage) ─────────────────────────────────
export interface AISettings {
  openaiApiKey: string;
  model: string; // gpt-4o, gpt-4o-mini
  enableAiExtraction: boolean;
  extractionMode: "auto" | "ai_only" | "regex_fallback"; // auto = AI if key available, regex otherwise
}

const DEFAULT_SETTINGS: AISettings = {
  openaiApiKey: "",
  model: "gpt-4o",
  enableAiExtraction: true,
  extractionMode: "auto",
};

const STORAGE_KEY = "flowai_ai_settings";

export function getAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

export function saveAISettings(settings: Partial<AISettings>) {
  const current = getAISettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function hasApiKey(): boolean {
  return !!getAISettings().openaiApiKey;
}

// ─── GPT-4o Structured Extraction ─────────────────────────────────────────

const EXTRACTION_PROMPT = `You are an expert industrial instrumentation document processor for Flowtech Instruments (I) Pvt. Ltd.
Extract structured data from this Sales Order / Quotation document.

INSTRUCTIONS:
- Extract ALL line items (instruments) listed in the document
- For each line item, extract complete process conditions needed for sizing
- Convert all flow rates to m3/hr where possible
- For Nm3/hr values, extract the normal conditions stated (temperature and pressure)
- Identify service type: "liquid", "gas", or "steam" from the fluid description
- Extract design calculations if present (orifice sizing, differential pressure, etc.)
- Flag any missing or unclear data
- Provide confidence score (0.0 to 1.0) for each extracted field

OUTPUT FORMAT — Strict JSON matching the provided schema exactly.`;

const RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    project_metadata: {
      type: "object" as const,
      properties: {
        customer_name: { type: "string" as const },
        so_number: { type: "string" as const },
        qtn_number: { type: "string" as const },
        project_name: { type: "string" as const },
        date: { type: "string" as const },
        revision: { type: "string" as const },
        reference: { type: "string" as const },
      },
      required: ["customer_name", "so_number", "qtn_number", "project_name", "date", "revision", "reference"],
      additionalProperties: false,
    },
    line_items: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          line_number: { type: "string" as const },
          tag_number: { type: "string" as const },
          instrument_type: { type: "string" as const },
          model_code: { type: "string" as const },
          description: { type: "string" as const },
          size: { type: "string" as const },
          quantity: { type: "number" as const },
          process_conditions: {
            type: "object" as const,
            properties: {
              service: { type: "string" as const, enum: ["liquid", "gas", "steam"] },
              fluid_name: { type: "string" as const },
              operating_temperature_c: { type: "number" as const },
              operating_pressure_bar: { type: "number" as const },
              density_kg_m3: { type: "number" as const },
              viscosity_cp: { type: "number" as const },
              flow_rate_min: { type: "number" as const },
              flow_rate_max: { type: "number" as const },
              flow_rate_normal: { type: "number" as const },
              flow_unit: { type: "string" as const },
              normal_temperature_c: { type: "number" as const },
              normal_pressure_bar: { type: "number" as const },
              pipe_size: { type: "string" as const },
              specific_gravity: { type: "number" as const },
              compressibility_factor: { type: "number" as const },
            },
            required: ["service", "fluid_name", "flow_unit"],
            additionalProperties: false,
          },
          specifications: {
            type: "object" as const,
            properties: {
              moc: { type: "string" as const },
              process_connection: { type: "string" as const },
              connection_standard: { type: "string" as const },
              enclosure: { type: "string" as const },
              output_signal: { type: "string" as const },
              communication: { type: "string" as const },
              power_supply: { type: "string" as const },
              protection_class: { type: "string" as const },
              certifications: { type: "array" as const, items: { type: "string" as const } },
              special_requirements: { type: "string" as const },
            },
            required: [],
            additionalProperties: false,
          },
          design_calculations: {
            type: "object" as const,
            properties: {
              orifice_size: { type: "string" as const },
              differential_pressure: { type: "string" as const },
              permanent_pressure_loss: { type: "string" as const },
              beta_ratio: { type: "string" as const },
            },
            required: [],
            additionalProperties: false,
          },
          extraction_confidence: { type: "number" as const },
          notes: { type: "string" as const },
        },
        required: ["line_number", "tag_number", "instrument_type", "quantity", "process_conditions", "extraction_confidence"],
        additionalProperties: false,
      },
    },
  },
  required: ["project_metadata", "line_items"],
  additionalProperties: false,
};

interface AIExtractionResult {
  project_metadata: {
    customer_name: string | null;
    so_number: string | null;
    qtn_number: string | null;
    project_name: string | null;
    date: string | null;
    revision: string | null;
    reference: string | null;
  };
  line_items: Array<{
    line_number: string;
    tag_number: string | null;
    instrument_type: string;
    model_code: string | null;
    description: string;
    size: string | null;
    quantity: number;
    process_conditions: {
      service: "liquid" | "gas" | "steam";
      fluid_name: string;
      operating_temperature_c: number | null;
      operating_pressure_bar: number | null;
      density_kg_m3: number | null;
      viscosity_cp: number | null;
      flow_rate_min: number | null;
      flow_rate_max: number | null;
      flow_rate_normal: number | null;
      flow_unit: string;
      normal_temperature_c: number | null;
      normal_pressure_bar: number | null;
      pipe_size: string | null;
      specific_gravity: number | null;
      compressibility_factor: number | null;
    };
    specifications: {
      moc: string | null;
      process_connection: string | null;
      connection_standard: string | null;
      enclosure: string | null;
      output_signal: string | null;
      communication: string | null;
      power_supply: string | null;
      protection_class: string | null;
      certifications: string[];
      special_requirements: string | null;
    };
    design_calculations: {
      orifice_size: string | null;
      differential_pressure: string | null;
      permanent_pressure_loss: string | null;
      beta_ratio: string | null;
    };
    extraction_confidence: number;
    notes: string | null;
  }>;
}

/**
 * Main extraction function. Calls GPT-4o if API key is configured,
 * otherwise falls back to enhanced regex extraction v3.
 */
export async function extractWithAI(
  pdfText: string,
  fileName: string
): Promise<{ items: ExtractedLineItem[]; metadata: any; mode: "ai" | "regex" }> {
  const settings = getAISettings();

  if (settings.enableAiExtraction && settings.openaiApiKey && settings.openaiApiKey.length > 20) {
    try {
      return await callGPT4o(pdfText, fileName, settings);
    } catch (e: any) {
      console.warn("AI extraction failed, falling back to regex v3:", e?.message);
      return await extractWithRegexFallback(pdfText, fileName);
    }
  }

  return await extractWithRegexFallback(pdfText, fileName);
}

/**
 * Call GPT-4o API with structured output.
 */
async function callGPT4o(
  pdfText: string,
  fileName: string,
  settings: AISettings
): Promise<{ items: ExtractedLineItem[]; metadata: any; mode: "ai" | "regex" }> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + settings.openaiApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        {
          role: "system",
          content: EXTRACTION_PROMPT,
        },
        {
          role: "user",
          content:
            "Extract all instrument line items from this Sales Order / Quotation document.\n\n" +
            "DOCUMENT TEXT:\n---\n" +
            pdfText.slice(0, 12000) + // GPT-4o context limit
            "\n---\n\n" +
            "File name: " + fileName + "\n" +
            "Return valid JSON only, matching the specified schema exactly.",
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "so_extraction",
          strict: true,
          schema: RESPONSE_SCHEMA,
        },
      },
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error("OpenAI API error: " + response.status + " " + err);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in response");

  let parsed: AIExtractionResult;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Sometimes content is wrapped in markdown code blocks
    const cleaned = content.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    parsed = JSON.parse(cleaned);
  }

  // Convert AI extraction result to ExtractedLineItem[]
  const items: ExtractedLineItem[] = parsed.line_items.map((li, idx) => {
    const pc = li.process_conditions;
    const svc = pc.service;

    const processConditions: ProcessConditions = {
      service: svc,
      fluidName: pc.fluid_name,
      density: pc.density_kg_m3 ?? (svc === "liquid" ? 998 : svc === "gas" ? 1.2 : 0.6),
      viscosity: pc.viscosity_cp ?? (svc === "liquid" ? 1.0 : svc === "gas" ? 0.018 : 0.015),
      operatingTemp: pc.operating_temperature_c ?? 20,
      operatingPressure: pc.operating_pressure_bar ?? 1.013,
      flowRateMin: pc.flow_rate_min ?? 0,
      flowRateMax: pc.flow_rate_max ?? 0,
      flowUnit: pc.flow_unit || "m3/hr",
      pipeSize: pc.pipe_size || "50NB",
      meterCategory: "both",
    };

    if (svc === "gas") {
      processConditions.gasPressureBarAbs = pc.operating_pressure_bar ?? 1.013;
      processConditions.selectedGasName = pc.fluid_name;
    } else if (svc === "liquid") {
      processConditions.liquidPressureBarAbs = pc.operating_pressure_bar ?? 1.013;
      processConditions.selectedLiquidName = pc.fluid_name;
    } else if (svc === "steam") {
      processConditions.steamPressureBarAbs = pc.operating_pressure_bar ?? 1.013;
      processConditions.steamTempC = pc.operating_temperature_c ?? 150;
    }

    // Build specs from AI extraction for rotameter float MOC detection
    const aiSpecs = li.specifications as any;
    const specs: Record<string, string> = {};
    if (aiSpecs?.moc) specs["MOC"] = aiSpecs.moc;
    if (aiSpecs?.process_connection) specs["Connection"] = aiSpecs.process_connection;
    if (aiSpecs?.float_moc) specs["Float MOC"] = aiSpecs.float_moc;

    return {
      id: "li-" + Date.now() + "-" + idx,
      lineItemNo: li.line_number || String(idx + 1),
      tagNumber: li.tag_number || "TAG-" + (idx + 1),
      productFamily: li.instrument_type,
      modelNumber: li.model_code || "",
      modelName: (li as any).model_name || "",
      floatMoc: aiSpecs?.float_moc || "",
      size: li.size || pc.pipe_size || "",
      quantity: li.quantity || 1,
      application: li.specifications?.special_requirements || "",
      processMedium: pc.fluid_name,
      flowMin: String(pc.flow_rate_min ?? ""),
      flowMax: String(pc.flow_rate_max ?? ""),
      flowUnit: pc.flow_unit || "m3/hr",
      pressure: String(pc.operating_pressure_bar ?? ""),
      temperature: String(pc.operating_temperature_c ?? ""),
      moc: li.specifications?.moc || "",
      processConnection: li.specifications?.process_connection || "",
      output: li.specifications?.output_signal || "",
      certification: li.specifications?.certifications?.join(", ") || "",
      notes: li.notes || "",
      specs,
      processConditions,
      extractionConfidence: Math.round((li.extraction_confidence ?? 0.8) * 100),
      lowConfidenceFields: li.extraction_confidence < 0.8
        ? ["low_overall_confidence"]
        : [],
      status: "extracted",
    };
  });

  // Run engineering validation on each extracted item
  for (const item of items) {
    const review = validateEngineering(item);
    item.engineeringReview = {
      reviewStatus: review.reviewStatus,
      queries: review.queries.map((q) => ({
        fieldName: q.fieldName, extractedValue: q.extractedValue,
        issue: q.issue, whyConcern: q.whyConcern,
        requiredClarification: q.requiredClarification,
        severity: q.severity, blocksSizing: q.blocksSizing, blocksReport: q.blocksReport,
      })),
      assumptions: review.assumptions,
      conversions: review.conversions,
      missingMandatoryFields: review.missingMandatoryFields,
      summary: review.reviewSummary,
    };
  }

  return {
    items,
    metadata: parsed.project_metadata,
    mode: "ai",
  };
}

/**
 * Regex fallback — uses the proven smartParser (parseSmart) as the primary
 * extraction engine. smartParser handles Flowtech SO Acknowledgement format
 * with pipe-delimited tables, multi-line model codes, and qualifier
 * preservation. Falls back to enhanced regex v3 only if smartParser
 * returns no instruments.
 */
async function extractWithRegexFallback(
  pdfText: string,
  fileName: string
): Promise<{ items: ExtractedLineItem[]; metadata: any; mode: "ai" | "regex" }> {
  // ═══════════════════════════════════════════════════════════════════
  // PRIMARY: Use smartParser (proven SO/QTN parser)
  // ═══════════════════════════════════════════════════════════════════
  const parsed = parseSmart(pdfText);

  let items: ExtractedLineItem[];

  if (parsed.instruments && parsed.instruments.length > 0) {
    // ═══════════════════════════════════════════════════════════════════
    // TEXT-AWARE CONVERSION: Read BOTH numeric processData AND text
    // sections to handle values like "Atmospheric", "Ambient", "10 KG/CM2"
    // ═══════════════════════════════════════════════════════════════════
    items = parsed.instruments.map((inst, idx): ExtractedLineItem => {
      const pd = inst.processData;

      // ── Read text values from sections (PROCESS DATA) ──
      const textValues: Record<string, string> = {};
      for (const sec of inst.sections) {
        for (const [label, value] of sec.rows) {
          const key = label.toUpperCase().replace(/[.\s]/g, "");
          textValues[key] = value;
        }
      }

      // Helper: parse text pressure to bara
      function parseTextPressure(val: string): number | null {
        if (!val) return null;
        const v = val.toLowerCase();
        if (v.includes("atmospheric") || v.includes("atm")) return 1.013; // atmospheric ≈ 1.013 bara
        // Extract number + unit
        const m = val.match(/([\d.]+)\s*(kg\/cm2|kg\/cm²|bara|barg|bar|psi|mpa|mmwc)/i);
        if (m) {
          const num = parseFloat(m[1]);
          const unit = m[2].toLowerCase();
          if (unit.includes("kg/cm")) return num * 0.980665 + 1.013; // kg/cm2 → bara
          if (unit.includes("barg")) return num + 1.013;
          if (unit.includes("bara")) return num;
          if (unit.includes("bar")) return num; // assume bara
          if (unit.includes("psi")) return num * 0.0689476;
          if (unit.includes("mpa")) return num * 10;
        }
        const numOnly = parseFloat(val);
        return isNaN(numOnly) ? null : numOnly;
      }

      // Helper: parse text temperature to °C
      function parseTextTemperature(val: string): number | null {
        if (!val) return null;
        const v = val.toLowerCase();
        if (v.includes("ambient") || v.includes("room")) return 30; // ambient ≈ 30°C
        const m = val.match(/([\d.]+)\s*(?:°?\s*([cf]))?/i);
        if (m) {
          const num = parseFloat(m[1]);
          const unit = (m[2] || "").toUpperCase();
          if (unit === "F") return (num - 32) * 5 / 9;
          return num; // assume °C
        }
        return null;
      }

      // Helper: parse text flow range "0.5 - 5 m3/hr"
      function parseTextFlowRange(val: string): { min: number | null; max: number | null; unit: string } {
        const result = { min: null as number | null, max: null as number | null, unit: "m3/hr" };
        if (!val) return result;
        // Match "0.5 - 5 m3/hr" or "3.5 To 35 m3/hr" or "500 - 5000 LPH"
        const m = val.match(/([\d.]+)\s*(?:to|[-~])\s*([\d.]+)\s*([a-z0-9/³²°.%]+)?/i);
        if (m) {
          result.min = parseFloat(m[1]);
          result.max = parseFloat(m[2]);
          if (m[3]) {
            const u = m[3].toUpperCase();
            if (u.includes("M3/HR") || u.includes("M³/HR")) result.unit = "m3/hr";
            else if (u.includes("LPH")) result.unit = "LPH";
            else if (u.includes("NM3/HR")) result.unit = "Nm3/hr";
            else if (u.includes("KG/HR")) result.unit = "kg/hr";
            else if (u.includes("GPM")) result.unit = "GPM";
            else result.unit = m[3];
          }
        } else {
          // Single flow value
          const s = val.match(/([\d.]+)\s*([a-z0-9/³²°.%]+)?/i);
          if (s) {
            result.min = parseFloat(s[1]);
            result.max = result.min * 5; // typical turndown
            if (s[2]) result.unit = s[2];
          }
        }
        return result;
      }

      // ── Resolve pressure: text first, then numeric, then default ──
      const textPressVal = textValues["OPPRESSURE"] || textValues["OPPRESS"] || textValues["OPERATINGPRESSURE"] || textValues["PRESSURE"];
      const parsedTextPress = parseTextPressure(textPressVal || "");
      const resolvedPressure = parsedTextPress ?? pd.operatingPressure ?? 1.013;
      const pressureDisplay = textPressVal || (pd.operatingPressure !== null ? String(pd.operatingPressure) : "1.013");

      // ── Resolve temperature: text first, then numeric, then default ──
      const textTempVal = textValues["OPTEMPERATURE"] || textValues["OPTEMP"] || textValues["OPERATINGTEMPERATURE"] || textValues["TEMPERATURE"];
      const parsedTextTemp = parseTextTemperature(textTempVal || "");
      const resolvedTemp = parsedTextTemp ?? pd.operatingTemp ?? 30;
      const tempDisplay = textTempVal || (pd.operatingTemp !== null ? String(pd.operatingTemp) : "30");

      // ── Resolve flow: text range first, then numeric ──
      const textFlowVal = textValues["FLOWRANGE"] || textValues["CLIENTFLOWRANGE"] || textValues["MINFLOW"] || textValues["MAXFLOW"];
      const parsedFlow = parseTextFlowRange(textFlowVal || "");
      const flowMin = parsedFlow.min ?? pd.flowRateMin ?? 0;
      const flowMax = parsedFlow.max ?? pd.flowRateMax ?? 0;
      const flowUnit = parsedFlow.unit || pd.flowUnit || "m3/hr";

      // ── Resolve density ──
      const textDensityVal = textValues["DENSITY"] || textValues["SPGRAVITY"] || textValues["SPGR"] || textValues["SPECIFICGRAVITY"];
      let resolvedDensity = pd.fluidDensity;
      let resolvedSG = pd.fluidSG;
      if (!resolvedDensity && !resolvedSG && textDensityVal) {
        const dNum = parseFloat(textDensityVal);
        if (!isNaN(dNum)) {
          if (dNum < 5) { resolvedSG = dNum; resolvedDensity = dNum * 1000; }
          else { resolvedDensity = dNum; }
        }
      }

      // ── Build ProcessConditions ──
      const service: "liquid" | "gas" | "steam" =
        pd.service === "gas" ? "gas" :
        pd.service === "liquid" ? "liquid" : "liquid";

      const processConditions: ProcessConditions = {
        service,
        fluidName: pd.fluidName || inst.service || (service === "gas" ? "Air" : "Water"),
        density: resolvedDensity || (service === "liquid" ? 998 : 1.2),
        viscosity: pd.fluidViscosity || (service === "liquid" ? 1.0 : 0.018),
        operatingTemp: resolvedTemp,
        operatingPressure: resolvedPressure,
        flowRateMin: flowMin,
        flowRateMax: flowMax,
        flowUnit: flowUnit,
        pipeSize: pd.lineSize || inst.size || "50NB",
        meterCategory: "both",
      };

      if (service === "gas") {
        processConditions.gasPressureBarAbs = resolvedPressure;
        processConditions.selectedGasName = pd.fluidName || "Air";
      } else {
        processConditions.liquidPressureBarAbs = resolvedPressure;
        processConditions.selectedLiquidName = pd.fluidName || "Water";
      }

      // Extract MOC and connection from sections
      let moc = "";
      let connection = "";
      let output = "";
      let certification = "";
      for (const sec of inst.sections) {
        for (const [label, value] of sec.rows) {
          const lu = label.toUpperCase();
          if (lu.includes("MOC") || lu.includes("MATERIAL")) moc = value;
          if (lu.includes("CONNECTION") && !connection) connection = value;
          if (lu.includes("OUTPUT")) output = value;
          if (lu.includes("CERTIF")) certification = value;
        }
      }

      // Calculate confidence based on data completeness (text + numeric)
      let confidence = 70;
      const hasFlow = (flowMin > 0 && flowMax > 0) || (pd.flowRateMin && pd.flowRateMax);
      const hasPress = !!textPressVal || pd.operatingPressure !== null;
      const hasTemp = !!textTempVal || pd.operatingTemp !== null;
      const hasDensity = !!textDensityVal || pd.fluidDensity || pd.fluidSG;
      if (hasFlow) confidence += 10;
      if (hasPress) confidence += 10;
      if (hasTemp) confidence += 5;
      if (hasDensity) confidence += 5;
      if (pd.fluidName || textValues["SERVICE"]) confidence += 5;
      if (inst.model) confidence += 5;

      // Track which values came from text parsing (may need user confirmation)
      const assumptions: Array<{ field: string; assumedValue: string; basis: string; safe: boolean; needsConfirmation: boolean }> = [];
      if (textPressVal?.toLowerCase().includes("atmospheric")) {
        assumptions.push({ field: "Operating Pressure", assumedValue: "1.013 bara (Atmospheric)", basis: "Atmospheric pressure treated as 0 barg ≈ 1.013 bara for preliminary verification", safe: true, needsConfirmation: true });
      }
      if (textTempVal?.toLowerCase().includes("ambient")) {
        assumptions.push({ field: "Operating Temperature", assumedValue: "30°C (Ambient)", basis: "Ambient temperature treated as 30°C for preliminary verification", safe: true, needsConfirmation: true });
      }

      // Build specs record from all section rows for validator access
      const specs: Record<string, string> = {};
      for (const section of inst.sections || []) {
        for (const [label, value] of section.rows || []) {
          if (label && value && value !== "Pending" && value !== "--") {
            specs[label] = value;
          }
        }
      }
      // Also add direct extracted values
      if (inst.size) specs["Size"] = inst.size;
      if (inst.processConnection) specs["Connection"] = typeof inst.processConnection === "string" ? inst.processConnection : String(inst.processConnection.size);

      // ═══ CRITICAL: modelNumber = De-Codification No. (FMIPL-...), modelName = Flowtech Model Name
      // inst.model = raw "MODEL NO." text (can be either model name OR FMIPL code)
      // inst.decodNo = explicit DE-CODIFICATION extraction (always the FMIPL code)
      // inst.modelName = derived Flowtech model name from lookup table
      const isModelFMIPL = inst.model && inst.model.startsWith("FMIPL-");
      const decodNo = inst.decodNo || (isModelFMIPL ? inst.model : "");
      const modelName = inst.modelName || (!isModelFMIPL ? inst.model : "") || "";

      return {
        id: "li-" + Date.now() + "-" + idx,
        lineItemNo: String(inst.srNo),
        tagNumber: inst.tagNo || "TAG-" + (idx + 1),
        productFamily: inst.type,
        modelNumber: decodNo,     // ← De-Codification No. (FMIPL-GTRM-...)
        modelName: modelName,     // ← Flowtech Model Name (FlowGT RS180)
        floatMoc: specs["Float MOC"] || specs["Float Moc"] || "",
        size: inst.size,
        quantity: inst.qty,
        application: inst.service,
        processMedium: pd.fluidName || inst.service || "",
        flowMin: String(flowMin),
        flowMax: String(flowMax),
        flowUnit: flowUnit,
        pressure: pressureDisplay,
        temperature: tempDisplay,
        moc: moc,
        processConnection: connection,
        output: output,
        certification: certification,
        notes: textFlowVal ? "" : "",
        specs,
        processConditions,
        extractionConfidence: Math.min(100, confidence),
        lowConfidenceFields: confidence < 85 ? ["check_text_parsed_values"] : [],
        status: "extracted",
      };
    });
  } else {
    // ═══════════════════════════════════════════════════════════════════
    // FALLBACK: Use enhanced regex v3 if smartParser finds nothing
    // ═══════════════════════════════════════════════════════════════════
    const result = extractWithEnhancedRegex(pdfText, fileName);
    items = postProcessExtraction(result.items);
  }

  // Build metadata from parsed header
  const metadata = {
    customer_name: parsed.header?.client || parsed.header?.endUser || null,
    so_number: parsed.header?.soNo || null,
    qtn_number: null,
    project_name: fileName.replace(/\.[^.]+$/, ""),
    date: parsed.header?.date || new Date().toISOString().split("T")[0],
    revision: "1",
    reference: parsed.header?.poNo || "",
  };

  // Run engineering validation on each extracted item
  for (const item of items) {
    const review = validateEngineering(item);
    item.engineeringReview = {
      reviewStatus: review.reviewStatus,
      queries: review.queries.map((q) => ({
        fieldName: q.fieldName, extractedValue: q.extractedValue,
        issue: q.issue, whyConcern: q.whyConcern,
        requiredClarification: q.requiredClarification,
        severity: q.severity, blocksSizing: q.blocksSizing, blocksReport: q.blocksReport,
      })),
      assumptions: review.assumptions,
      conversions: review.conversions,
      missingMandatoryFields: review.missingMandatoryFields,
      summary: review.reviewSummary,
    };
  }

  return { items, metadata, mode: "regex" };
}
