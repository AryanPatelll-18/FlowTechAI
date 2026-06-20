/**
 * ProjectSizingRunner — Runs sizing for a single line item.
 * 
 * For ROTAMETERS: Uses Variable Area Sizing Engine with Water Equivalent calculation
 *   - Shows: WE in LPH, PG Tube Size, Scale Range, Connection Sizes, Float MOC (highlighted)
 *   - Report: Variable Area format matching WE-B6NO
 * 
 * For FLOWMETERS: Uses Direct Sizing Engine (inline sizing)
 *   - Shows: Best meter size, Qmin/Qmax, accuracy
 *   - Report: Professional sizing report with graphs
 */

import { useState, useCallback } from "react";
import {
  runDirectSizing,
  detectMeterCategory,
  validateRotameterConnection,
  type DirectSizingInput,
  type DirectSizingResult,
  type ConnectionValidationResult,
  type MeterCategory,
} from "../data/directSizingEngine";
import {
  detectFloatMoc,
  getFloatProperties,
  type VariableAreaResult,
} from "../data/variableAreaSizingEngine";
import type { ProcessConditions } from "../types/shared";
import { buildSizingReportData, buildSizingReportDataForSize } from "../data/sizingReportEngine";
import { renderSizingReportHtml } from "../data/sizingReportRenderer";
import { generateWEReport, generateFallbackRotameterReport } from "../data/weReportGenerator";
import { toBar } from "../data/pressureUnits";
import { calculateSteamDensity, getSaturationTemp } from "../data/steamTable";
import { calculateWE } from "../data/waterEquivalentEngine";

interface SizingResultPayload {
  bestSize: string;
  sizingSize: string;
  status: "matched" | "mismatch" | "no_size_found";
  reportHtml: string;
  qMin: number;
  qMax: number;
  qMinUnit: string;
  velocityStatus?: string;
  meterCategory: MeterCategory;
  connectionValidation?: ConnectionValidationResult;
  // Variable area specific
  isVariableArea?: boolean;
  weLph?: number;
  bestTube?: string;
  floatMoc?: string;
}

interface Props {
  processConditions: ProcessConditions;
  productFamily: string;
  soSpecifiedSize?: string;
  floatMoc?: string;
  moc?: string; // General MOC (for Float MOC inference Priority 3)
  specs?: Record<string, string>;
  modelName?: string;
  decodification?: string;
  customerName?: string;
  soNumber?: string;
  tagNumber?: string;
  onResult: (result: SizingResultPayload) => void;
}

export default function ProjectSizingRunner({
  processConditions,
  productFamily,
  soSpecifiedSize,
  floatMoc,
  moc,
  specs,
  modelName,
  decodification,
  customerName,
  soNumber,
  tagNumber,
  onResult,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [reportHtml, setReportHtml] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultSent, setResultSent] = useState(false);
  const [sizeMatchStatus, setSizeMatchStatus] = useState<"matched" | "mismatch" | "no_size_found" | null>(null);
  const [vaResult, setVaResult] = useState<VariableAreaResult | null>(null);
  const [isRotameter, setIsRotameter] = useState(false);
  // Counter: increments each time sizing runs — drives WE display
  const [sizingRunCount, setSizingRunCount] = useState(0);

  const isFlowDevice = productFamily.toLowerCase().includes("flowmeter") ||
    productFamily.toLowerCase().includes("rotameter") ||
    productFamily.toLowerCase().includes("flow meter");

  // ═══ Generate report HTML on-the-fly (used by View & Download buttons) ═══
  const getReportHtml = useCallback((): string => {
    const isRot = productFamily.toLowerCase().includes("rotameter");
    if (!isRot) {
      // Flowmeter: use reportHtml state set during sizing
      return reportHtml;
    }
    // Rotameter: generate fresh WE report
    const svc = processConditions.service || "liquid";
    const isGas = svc === "gas";
    const flKey = detectFloatMoc(productFamily, moc || "", floatMoc || "", specs || {});
    const flProps = getFloatProperties(flKey);
    const avgFlow = (processConditions.flowRateMin + processConditions.flowRateMax) / 2;
    const sg = (processConditions.density || 998) / 1000;

    const weRes = calculateWE({
      service: isGas ? "gas" : "liquid",
      actualFlowRate: avgFlow,
      flowUnit: processConditions.flowUnit || "m³/hr",
      floatMaterial: flProps.material,
      processFluidDensity: processConditions.density || 998,
      processFluidSG: sg,
      processTempC: processConditions.operatingTemp ?? 20,
      processPressureBara: processConditions.operatingPressure || 1.013,
      gasName: isGas ? processConditions.fluidName : undefined,
      liquidViscosity_cP: !isGas ? (processConditions.viscosity || 1) : undefined,
    });

    if (!weRes) return "<!-- WE calculation failed -->";

    return generateWEReport({
      result: weRes,
      customerFlowRate: avgFlow,
      flowUnit: processConditions.flowUnit || "m³/hr",
      scaleMin: vaResult?.allTubes && vaResult.allTubes.length > 0
        ? vaResult.allTubes[0].qMin
        : processConditions.flowRateMin,
      scaleMax: vaResult?.allTubes && vaResult.allTubes.length > 0
        ? vaResult.allTubes[vaResult.allTubes.length - 1].qMax
        : processConditions.flowRateMax,
      floatMaterial: flProps.material,
      floatType: "BL",
      liquidName: processConditions.fluidName || "Water",
      liquidDensity: processConditions.density || 998,
      liquidViscosity: processConditions.viscosity || 1,
      temperature: processConditions.operatingTemp ?? 20,
      docId: `WE-${(soNumber || "PROJECT").replace(/\//g, "")}-${(tagNumber || "TAG").replace(/-/g, "")}`.slice(0, 20),
    });
  }, [productFamily, moc, floatMoc, specs, processConditions, vaResult, soNumber, tagNumber, reportHtml]);

  // Build DirectSizingInput for flowmeters
  const buildSizingInput = useCallback((): DirectSizingInput | null => {
    const pc = processConditions;
    const meterCategory = detectMeterCategory(productFamily);
    const service = pc.service || "liquid";

    if (pc.flowRateMin <= 0 || pc.flowRateMax <= 0) {
      setError("Flow rates must be greater than 0.");
      return null;
    }

    let liquidPressureBarAbs = 1.01325;
    let gasPressureBarAbs = 1.01325;
    let steamPressureBarAbs = 6.013;
    let steamTempC = 159;
    let steamDensity = 3.17;
    let steamState = "dry";
    const opPressure = pc.operatingPressure || 0;

    if (service === "liquid") liquidPressureBarAbs = opPressure > 0 ? opPressure : 1.01325;
    else if (service === "gas") gasPressureBarAbs = opPressure > 0 ? opPressure : 1.01325;
    else if (service === "steam") {
      steamPressureBarAbs = opPressure > 0 ? toBar(opPressure, "bar") : 6.013;
      const tSat = getSaturationTemp(steamPressureBarAbs);
      steamTempC = tSat ?? 159;
      const sd = calculateSteamDensity(steamPressureBarAbs, steamTempC);
      steamDensity = sd.density;
      steamState = sd.state;
    }

    let density = pc.density, viscosity = pc.viscosity, specificGravity = pc.density > 0 ? pc.density / 1000 : 0.998;
    if (service === "liquid") {
      if (density <= 0) density = 998;
      if (viscosity <= 0) viscosity = 1.0;
      specificGravity = density / 1000;
    } else if (service === "gas") {
      if (density <= 0) density = 1.2;
      if (viscosity <= 0) viscosity = 0.018;
      specificGravity = density / 1.2;
    }

    return {
      service, meterCategory,
      flowRateMin: pc.flowRateMin, flowRateMax: pc.flowRateMax, flowUnit: pc.flowUnit || "m3/hr",
      density, viscosity, operatingTemp: pc.operatingTemp ?? 20,
      liquidPressureBarAbs, gasPressureBarAbs,
      steamPressureBarAbs, steamTempC, steamDensity, steamState,
      selectedLiquidName: pc.fluidName,
      selectedGasName: service === "gas" ? pc.fluidName : undefined,
      specificGravity,
      floatMoc: floatMoc || "",
    };
  }, [processConditions, productFamily, floatMoc]);

  // Main sizing handler — UNIFIED: uses runDirectSizing() for both flowmeters and rotameters.
  // This ensures Project Sizing matches Main Sizing 100%. Future calc changes in
  // directSizingEngine.ts automatically reflect here.
  const handleRunSizing = useCallback(() => {
    setLoading(true);
    setError(null);
    setResultSent(false);
    setSizeMatchStatus(null);
    setReportHtml("");
    setShowReport(false);
    setVaResult(null);

    try {
      const isRotameterProduct = productFamily.toLowerCase().includes("rotameter");
      setIsRotameter(isRotameterProduct);

      // Mark that sizing has run — triggers WE display in render
      if (isRotameterProduct) {
        setSizingRunCount((c) => c + 1);
      }

      const sizingInput = buildSizingInput();
      if (!sizingInput) { setLoading(false); return; }

      const result = runDirectSizing(sizingInput);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (isRotameterProduct) {
        // ═══════════════════════════════════════════════════════════
        // ROTAMETER: extract from rotameterResults
        // ═══════════════════════════════════════════════════════════
        const rotamererResult = result.rotameterResults.find((r) => r.bestSize);
        if (!rotamererResult) {
          setError("No valid rotameter sizing result.");
          setLoading(false);
          return;
        }

        const sizingSize = rotamererResult.bestSize || "N/A";
        const weInfo = rotamererResult.weInfo;

        // Build a VariableAreaResult from DirectSizingResult for the report
        const tubeResult = rotamererResult.sizes.find((s) => s.size === sizingSize);
        const vaRes: VariableAreaResult = {
          bestTube: sizingSize,
          tubeStatus: tubeResult ? (tubeResult.status === "optimal" ? "optimal" : "valid") : "no_data",
          scaleRangeLph: tubeResult ? `${Math.round(tubeResult.qMin)} - ${Math.round(tubeResult.qMax)}` : "--",
          connectionRange: tubeResult?.processConnection || "15NB to 100NB",
          soConnectionSize: soSpecifiedSize || "--",
          connectionValid: true,
          weLph: weInfo?.weNorm || tubeResult?.median || 0,
          weLpm: (weInfo?.weNorm || tubeResult?.median || 0) / 60,
          weGph: (weInfo?.weNorm || tubeResult?.median || 0) * 0.264172,
          weGpm: (weInfo?.weNorm || tubeResult?.median || 0) * 0.264172 / 60,
          weM3h: (weInfo?.weNorm || tubeResult?.median || 0) / 1000,
          lsgcf: weInfo?.gcf || 1.0,
          fcf: weInfo?.fcf ?? null,
          gcf: weInfo?.gcf || 1.0,
          floatProperties: getFloatProperties(detectFloatMoc(productFamily, "", floatMoc || "", specs || {})),
          vic: (processConditions.viscosity || 1) > 10 ? ((processConditions.viscosity || 1) - 1) * 1.5 : 0,
          flowRegime: (processConditions.viscosity || 1) > 10 ? "Laminar" : "Turbulent",
          maxPressureDrop: "2.5 bar (max)",
          reynoldsNumber: "N/A",
          scaleMarks: [],
          allTubes: rotamererResult.sizes.map((s) => ({
            size: s.size,
            qMin: s.qMin,
            qMax: s.qMax,
            scaleRangeLph: `${Math.round(s.qMin)} - ${Math.round(s.qMax)}`,
            scaleRangeLpm: "",
            scaleRangeGph: "",
            scaleRangeGpm: "",
            scaleRangeM3h: "",
            median: s.median,
            distanceFromMedian: s.distanceFromMedian,
            status: s.status as any,
            processConnection: s.processConnection || "15NB to 100NB",
          })),
        };
        setVaResult(vaRes);

        // Generate WE report using SAME generator as Main Sizing
        const svc2 = processConditions.service || "liquid";
        const isGas2 = svc2 === "gas";
        const flKey2 = detectFloatMoc(productFamily, moc || "", floatMoc || "", specs || {});
        const flProps2 = getFloatProperties(flKey2);
        const avgFlow2 = (processConditions.flowRateMin + processConditions.flowRateMax) / 2;
        const sg2 = (processConditions.density || 998) / 1000;

        const weRes2 = calculateWE({
          service: isGas2 ? "gas" : "liquid",
          actualFlowRate: avgFlow2,
          flowUnit: processConditions.flowUnit || "m³/hr",
          floatMaterial: flProps2.material,
          processFluidDensity: processConditions.density || 998,
          processFluidSG: sg2,
          processTempC: processConditions.operatingTemp ?? 20,
          processPressureBara: processConditions.operatingPressure || 1.013,
          gasName: isGas2 ? processConditions.fluidName : undefined,
          liquidViscosity_cP: !isGas2 ? (processConditions.viscosity || 1) : undefined,
        });

        let reportHtml = "";
        if (weRes2) {
          // Use SAME report generator as Main Sizing (WaterEquivalentPanel)
          reportHtml = generateWEReport({
            result: weRes2,
            customerFlowRate: avgFlow2,
            flowUnit: processConditions.flowUnit || "m³/hr",
            scaleMin: vaResult?.allTubes && vaResult.allTubes.length > 0 ? vaResult.allTubes[0].qMin : processConditions.flowRateMin,
            scaleMax: vaResult?.allTubes && vaResult.allTubes.length > 0 ? vaResult.allTubes[vaResult.allTubes.length - 1].qMax : processConditions.flowRateMax,
            floatMaterial: flProps2.material,
            floatType: "BL",
            liquidName: processConditions.fluidName || "Water",
            liquidDensity: processConditions.density || 998,
            liquidViscosity: processConditions.viscosity || 1,
            temperature: processConditions.operatingTemp ?? 20,
            docId: `WE-${(soNumber || "PROJECT").replace(/\//g, "")}-${(tagNumber || "TAG").replace(/-/g, "")}`.slice(0, 20),
          });
        } else {
          // Fallback: generate a basic sizing report from VA result when WE calc fails
          reportHtml = generateFallbackRotameterReport({
            tagNumber: tagNumber || "",
            customerName: customerName || "",
            soNumber: soNumber || "",
            productFamily,
            modelName: modelName || "",
            sizingSize,
            processConditions,
            vaResult: vaRes,
            floatMoc: flProps2.displayName,
          });
        }
        setReportHtml(reportHtml);

        // Connection validation
        let connectionValidation: ConnectionValidationResult | undefined;
        if (soSpecifiedSize) {
          connectionValidation = validateRotameterConnection(soSpecifiedSize, sizingSize, rotamererResult);
        }
        const status: "matched" | "mismatch" | "no_size_found" =
          sizingSize === "N/A" ? "no_size_found" :
          connectionValidation ? (connectionValidation.isConnectionValid ? "matched" : "mismatch") :
          "matched";
        setSizeMatchStatus(status);

        if (!resultSent) {
          onResult({
            bestSize: sizingSize,
            sizingSize,
            status,
            reportHtml,
            qMin: vaRes.weLph,
            qMax: vaRes.weLph,
            qMinUnit: "LPH",
            meterCategory: "rotameter",
            isVariableArea: true,
            weLph: vaRes.weLph,
            bestTube: sizingSize,
            floatMoc: vaRes.floatProperties.displayName,
            connectionValidation,
          });
          setResultSent(true);
        }
      } else {
        // ═══════════════════════════════════════════════════════════
        // INLINE FLOWMETER SIZING
        // ═══════════════════════════════════════════════════════════
        const inlineResult = result.inlineResults.find((r) => r.bestSize);
        const rotamererResult = result.rotameterResults.find((r) => r.bestSize);
        const targetResult = inlineResult || rotamererResult;

        if (!targetResult) {
          setError("No valid sizing result.");
          setLoading(false);
          return;
        }

        const sizingSize = targetResult.bestSize || "N/A";
        const sizesArr: any[] = (targetResult as any).sizes || [];
        const sr = sizesArr.find((s: any) => s.size === sizingSize);
        const meterCategory = sizingInput.meterCategory;

        const reportState = buildReportState(sizingInput);
        // Pass model name, SO size, and project metadata to report for display
        (reportState as any).modelName = modelName || "";
        (reportState as any).soSpecifiedSize = soSpecifiedSize || "";
        (reportState as any).pipeSize = processConditions?.pipeSize || soSpecifiedSize || "";
        (reportState as any).projectName = tagNumber || "";
        (reportState as any).clientName = customerName || "";
        (reportState as any).soRef = soNumber || "";
        const reportData = soSpecifiedSize
          ? buildSizingReportDataForSize(targetResult as any, reportState as any, soSpecifiedSize, tagNumber || "", customerName || "", soNumber || "")
          : buildSizingReportData(targetResult as any, reportState as any, tagNumber || "", customerName || "", soNumber || "");
        const html = renderSizingReportHtml(reportData);
        setReportHtml(html);
        setShowReport(true);

        let status: "matched" | "mismatch" | "no_size_found" = "no_size_found";
        let connectionValidation: ConnectionValidationResult | undefined;

        if (meterCategory === "rotameter" || (meterCategory === "both" && rotamererResult)) {
          if (rotamererResult && soSpecifiedSize) {
            connectionValidation = validateRotameterConnection(soSpecifiedSize, sizingSize, rotamererResult);
            status = sizingSize !== "N/A" ? (connectionValidation.isConnectionValid ? "matched" : "mismatch") : "no_size_found";
          } else if (sizingSize !== "N/A") { status = "matched"; }
        } else {
          if (soSpecifiedSize && sizingSize !== "N/A") { status = soSpecifiedSize === sizingSize ? "matched" : "mismatch"; }
          else if (sizingSize !== "N/A") { status = "matched"; }
        }
        setSizeMatchStatus(status);

        if (!resultSent) {
          onResult({
            bestSize: sizingSize, sizingSize, status, reportHtml: html,
            qMin: sr?.qMin || 0, qMax: sr?.qMax || 0,
            qMinUnit: sr?.unit || sizingInput.flowUnit,
            velocityStatus: sr && "velocityStatus" in sr ? (sr as any).velocityStatus : undefined,
            meterCategory, connectionValidation,
          });
          setResultSent(true);
        }
      }
    } catch (e: any) {
      setError("Sizing failed: " + (e?.message || String(e)));
    }
    setLoading(false);
  }, [buildSizingInput, onResult, resultSent, soSpecifiedSize, productFamily, processConditions, floatMoc, specs, modelName, decodification, customerName, soNumber, tagNumber]);

  // Missing data check
  const missingFields: string[] = [];
  if (processConditions.flowRateMin <= 0) missingFields.push("Flow Rate (Min)");
  if (processConditions.flowRateMax <= 0) missingFields.push("Flow Rate (Max)");
  if (!processConditions.flowUnit) missingFields.push("Flow Unit");
  if (processConditions.density <= 0) missingFields.push("Density / SG");

  const isRotameterProduct = productFamily.toLowerCase().includes("rotameter");
  const hasMissingData = missingFields.length > 0;

  // ═══ COMPUTE WE DIRECTLY IN RENDER (runs every render, displays when sizingRunCount > 0) ═══
  let weRenderResult: {
    weLph: number; weLpm: number; weGph: number; weGpm: number; weM3h: number;
    lsgcf: number; fcf: number | null; willFloat: boolean; explanation: string;
    formulaDetail: string; floatDisplayName: string; isGas: boolean;
  } | null = null;
  let weCalcError: string | null = null;

  if (isRotameterProduct) {
    try {
      const svc = processConditions.service || "liquid";
      const isGasSvc = svc === "gas";
      const floatKey = detectFloatMoc(productFamily, moc || "", floatMoc || "", specs || {});
      const flProps = getFloatProperties(floatKey);
      const avgFlow = (processConditions.flowRateMin + processConditions.flowRateMax) / 2;
      const sg = (processConditions.density || 998) / 1000;

      console.log("[WE Calc] service:", svc, "floatKey:", floatKey, "floatMaterial:", flProps.material, "avgFlow:", avgFlow, "sg:", sg);

      const weRes = calculateWE({
        service: isGasSvc ? "gas" : "liquid",
        actualFlowRate: avgFlow,
        flowUnit: processConditions.flowUnit || "m³/hr",
        floatMaterial: flProps.material,
        processFluidDensity: processConditions.density || 998,
        processFluidSG: sg,
        processTempC: processConditions.operatingTemp ?? 20,
        processPressureBara: processConditions.operatingPressure || 1.013,
        gasName: isGasSvc ? processConditions.fluidName : undefined,
        liquidViscosity_cP: !isGasSvc ? (processConditions.viscosity || 1) : undefined,
      });

      console.log("[WE Calc] result:", weRes);

      if (weRes) {
        const wLph = weRes.we_LPH;
        let expl = "";
        if (Math.abs(sg - 1.0) < 0.001) expl = `SG = 1.0 (water). No correction needed. WE equals Actual flow.`;
        else if (sg < 1.0) expl = `SG ${sg.toFixed(3)} < water. Float sinks deeper → reads HIGHER. WE (${wLph.toFixed(1)}) < Actual (${avgFlow.toFixed(1)}).`;
        else expl = `SG ${sg.toFixed(3)} > water. Float more buoyant → reads LOWER. WE (${wLph.toFixed(1)}) > Actual (${avgFlow.toFixed(1)}).`;

        weRenderResult = {
          weLph: wLph, weLpm: wLph / 60, weGph: wLph * 0.264172, weGpm: wLph * 0.264172 / 60, weM3h: wLph / 1000,
          lsgcf: weRes.correctionFactor, fcf: weRes.fcf ?? null,
          willFloat: weRes.willFloat, explanation: expl,
          formulaDetail: weRes.formulaDetail, floatDisplayName: flProps.displayName, isGas: isGasSvc,
        };
      } else {
        weCalcError = "calculateWE returned null — check float material and fluid parameters";
      }
    } catch (e: any) {
      weCalcError = e?.message || String(e);
      console.error("[WE Calc] ERROR:", e);
    }
  }

  return (
    <div style={{ padding: "16px", background: "#fafafa", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
      {/* Rotameter: Float MOC Display */}
      {isRotameterProduct && (() => {
        // Detect float MOC using 3-priority logic: explicit Float MOC → specs → general MOC
        const detectedKey = detectFloatMoc(productFamily, moc || "", floatMoc || "", specs || {});
        const floatProps = getFloatProperties(detectedKey);
        // Show warning ONLY if no MOC info exists at all (no floatMoc, no specs Float MOC, no general MOC)
        const hasExplicitFloatMoc = !!floatMoc;
        const hasSpecFloatMoc = !!(specs?.["Float MOC"] || specs?.["Float Moc"]);
        const hasGeneralMoc = !!(moc && moc.trim() && moc !== "--" && moc !== "Pending");
        const showWarning = !hasExplicitFloatMoc && !hasSpecFloatMoc && !hasGeneralMoc;
        return (
          <div style={{ background: "#fff3cd", border: "2px solid #d97706", borderRadius: "6px", padding: "10px 14px", marginBottom: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "9px", color: "#92400e", textTransform: "uppercase", fontWeight: 600 }}>Float Material of Construction (from SO)</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#78350f" }}>
              {floatProps.displayName}
            </div>
            {showWarning && (
              <div style={{ fontSize: "9px", color: "#dc2626", marginTop: "4px" }}>
                ⚠ No MOC data found in SO — defaulting to SS 316. Verify in specs.
              </div>
            )}
          </div>
        );
      })()}

      {/* Missing data warnings */}
      {hasMissingData && (
        <div style={{ background: "#fef2f2", borderLeft: "3px solid #dc2626", padding: "10px 14px", marginBottom: "12px", borderRadius: "4px", fontSize: "12px", color: "#7f1d1d" }}>
          <strong>Missing process data:</strong> {missingFields.join(", ")}
        </div>
      )}

      {/* Size match result */}
      {sizeMatchStatus && (
        <div style={{ background: sizeMatchStatus === "matched" ? "#ecfdf5" : sizeMatchStatus === "mismatch" ? "#fef2f2" : "#fffbeb", border: `1px solid ${sizeMatchStatus === "matched" ? "#a7f3d0" : sizeMatchStatus === "mismatch" ? "#fecaca" : "#fcd34d"}`, padding: "10px 14px", marginBottom: "12px", borderRadius: "6px", fontSize: "12px" }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            {isRotameterProduct && vaResult && (
              <>
                <span><strong>PG Tube:</strong> <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "14px" }}>{vaResult.bestTube}</span></span>
                <span><strong>WE:</strong> <span style={{ color: "#c20017", fontWeight: 700 }}>{Math.round(vaResult.weLph).toLocaleString()} LPH</span></span>
                <span><strong>Scale:</strong> {vaResult.scaleRangeLph} LPH</span>
                <span><strong>Connections:</strong> {vaResult.connectionRange}</span>
              </>
            )}
            {!isRotameterProduct && (
              <span><strong>Sizing:</strong> <span style={{ color: "#16a34a", fontWeight: 600 }}>{sizeMatchStatus === "no_size_found" ? "N/A" : "Sized"}</span></span>
            )}
            <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 600, background: sizeMatchStatus === "matched" ? "#ecfdf5" : sizeMatchStatus === "mismatch" ? "#fef2f2" : "#fffbeb", color: sizeMatchStatus === "matched" ? "#16a34a" : sizeMatchStatus === "mismatch" ? "#dc2626" : "#d97706" }}>
              {sizeMatchStatus === "matched" ? "✓ MATCHED" : sizeMatchStatus === "mismatch" ? "✗ MISMATCH" : "NO SIZE"}
            </span>
          </div>
        </div>
      )}

      {/* ═══ WE OUTPUT DISPLAY ═══ */}
      {isRotameterProduct && (
        <div style={{ marginBottom: "12px" }}>
          {weCalcError ? (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px", color: "#dc2626", fontSize: "11px" }}>
              <strong>WE Calculation Error:</strong> {weCalcError}
              <div style={{ marginTop: "6px", fontSize: "10px", color: "#991b1b" }}>
                Float: {getFloatProperties(detectFloatMoc(productFamily, moc || "", floatMoc || "", specs || {})).material} | 
                Flow: {(processConditions.flowRateMin + processConditions.flowRateMax) / 2} {processConditions.flowUnit} | 
                Density: {processConditions.density || 998} kg/m³
              </div>
            </div>
          ) : weRenderResult ? (
            <>
              {/* WE Blue Box */}
              <div style={{ background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)", borderRadius: "12px", padding: "16px 20px", color: "#fff", marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9 }}>Water Equivalent</span>
                  <span style={{ fontSize: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: weRenderResult.willFloat ? "#4ade80" : "#ef4444", display: "inline-block" }}></span>
                    {weRenderResult.willFloat ? "Float OK" : "Float Issue"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontSize: "28px", fontWeight: 700 }}>{weRenderResult.weLph.toFixed(2)}</span>
                  <span style={{ fontSize: "11px", opacity: 0.85 }}>LPH-water</span>
                </div>
                <div style={{ marginTop: "6px", fontSize: "10px", opacity: 0.8 }}>
                  WE: <strong>{weRenderResult.weLph.toFixed(2)} LPH</strong> | Float: <strong>{weRenderResult.floatDisplayName}</strong>
                </div>
              </div>

              {/* Unit Conversion Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "10px" }}>
                {[
                  { label: "LPM", value: weRenderResult.weLpm.toFixed(3) },
                  { label: "GPH", value: weRenderResult.weGph.toFixed(3) },
                  { label: "GPM", value: weRenderResult.weGpm.toFixed(3) },
                  { label: "m³/h", value: weRenderResult.weM3h.toFixed(3) },
                ].map((u) => (
                  <div key={u.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "9px", color: "#6b7280", textTransform: "uppercase" }}>{u.label}</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e40af" }}>{u.value}</div>
                  </div>
                ))}
              </div>

              {/* LSGCF / FCF */}
              <div style={{ display: "grid", gridTemplateColumns: weRenderResult.isGas ? "1fr 1fr" : "1fr", gap: "8px", marginBottom: "10px" }}>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px" }}>
                  <div style={{ fontSize: "9px", color: "#6b7280", textTransform: "uppercase" }}>{weRenderResult.isGas ? "GCF" : "LSGCF"}</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#1e40af", fontFamily: "monospace" }}>×{weRenderResult.lsgcf.toFixed(4)}</div>
                </div>
                {weRenderResult.isGas && weRenderResult.fcf !== null && (
                  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px" }}>
                    <div style={{ fontSize: "9px", color: "#6b7280", textTransform: "uppercase" }}>FCF</div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "#1e40af", fontFamily: "monospace" }}>×{weRenderResult.fcf.toFixed(4)}</div>
                  </div>
                )}
              </div>

              {/* Explanation */}
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#16a34a", fontSize: "14px" }}>ⓘ</span>
                <span style={{ fontSize: "11px", color: "#15803d" }}>{weRenderResult.explanation}</span>
              </div>

              {/* Formula detail */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 14px", marginTop: "8px" }}>
                <div style={{ fontSize: "9px", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Calculation Detail</div>
                <div style={{ fontSize: "10px", color: "#475569", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{weRenderResult.formulaDetail}</div>
              </div>
            </>
          ) : sizingRunCount === 0 ? (
            <div style={{ background: "#f3f4f6", borderRadius: "8px", padding: "12px", textAlign: "center", color: "#6b7280", fontSize: "12px" }}>
              Click <strong>"Run Variable Area Sizing"</strong> to calculate Water Equivalent
            </div>
          ) : null}
        </div>
      )}

      {/* End WE OUTPUT DISPLAY */}

      {/* Run button */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button onClick={handleRunSizing} disabled={loading || hasMissingData}
          style={{ padding: "8px 24px", borderRadius: "6px", border: "none", background: loading || hasMissingData ? "#e5e7eb" : "#c20017", color: loading || hasMissingData ? "#9ca3af" : "#fff", cursor: loading || hasMissingData ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>
          {loading ? "Calculating..." : hasMissingData ? "Data Missing" : isRotameterProduct ? "Run Variable Area Sizing" : "Run Professional Sizing"}
        </button>
        <button
          onClick={() => {
            const html = getReportHtml();
            if (!html || html.includes("WE calculation failed")) { alert("Run sizing first to generate the report."); return; }
            const w = window.open("", "_blank");
            if (!w) { alert("Please allow popups to view the report."); return; }
            w.document.write(html);
            w.document.close();
            setTimeout(() => { w.focus(); }, 300);
          }}
          style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", color: "#374151", cursor: "pointer", fontSize: "12px" }}>
          View Sizing Report
        </button>
        <button
          onClick={() => {
            const html = getReportHtml();
            if (!html || html.includes("WE calculation failed")) { alert("Run sizing first to generate the report."); return; }
            const w = window.open("", "_blank");
            if (!w) { alert("Please allow popups to download the report."); return; }
            w.document.write(html);
            w.document.close();
            setTimeout(() => { w.focus(); w.print(); }, 500);
          }}
          style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", color: "#374151", cursor: "pointer", fontSize: "12px" }}>
          Download Report (PDF)
        </button>
      </div>

      {error && <div style={{ marginTop: "10px", padding: "8px 12px", background: "#fef2f2", borderRadius: "4px", fontSize: "11px", color: "#dc2626" }}>{error}</div>}
    </div>
  );
}

function buildReportState(input: DirectSizingInput): Record<string, any> {
  return {
    service: input.service, meterCategory: input.meterCategory,
    flowRateMin: input.flowRateMin, flowRateMax: input.flowRateMax, flowUnit: input.flowUnit,
    density: input.density, viscosity: input.viscosity, operatingTemp: input.operatingTemp,
    liquidPressureBarAbs: input.liquidPressureBarAbs, gasPressureBarAbs: input.gasPressureBarAbs,
    steamPressureBarAbs: input.steamPressureBarAbs, steamTempC: input.steamTempC,
    steamDensity: input.steamDensity, steamState: input.steamState,
    selectedLiquid: null, selectedGas: null, gasWetness: null,
    results: [], rotameterResults: [], calculated: true,
    pipeSizeNominal: "DN80",
    normFlowRateMin: 0, normFlowRateMax: 0,
    maxFlowRateMin: 0, maxFlowRateMax: 0, useMultiCondition: false,
  };
}
