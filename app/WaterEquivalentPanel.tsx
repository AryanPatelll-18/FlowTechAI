import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  calculateWE,
  FLOAT_OPTIONS,
  getCorrectionExplanation,
  validateRotameterConditions,
} from "../data/waterEquivalentEngine";
import type { WEResult } from "../data/waterEquivalentEngine";
import { downloadWEReport } from "../data/weReportGenerator";
import {
  ArrowRightLeft, Calculator, Info, AlertTriangle,
  CheckCircle2, ChevronDown, ChevronUp, Download,
} from "lucide-react";

interface Props {
  actualFlowRate: number;
  flowUnit: string;
  processFluidDensity: number;
  processFluidSG: number;
  service: "liquid" | "gas";
  processTempC: number;
  processPressureBara: number;
}

export default function WaterEquivalentPanel({
  actualFlowRate, flowUnit, processFluidDensity, processFluidSG,
  service, processTempC, processPressureBara,
}: Props) {
  const [floatMaterial, setFloatMaterial] = useState("SS 316");
  const [expanded, setExpanded] = useState(true);
  const [showFormula, setShowFormula] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [scaleMin, setScaleMin] = useState(10);
  const [scaleMax, setScaleMax] = useState(100);
  const [liquidName, setLiquidName] = useState("Water");
  const [liquidViscosity, setLiquidViscosity] = useState(1.0);

  const result: WEResult | null = useMemo(() => {
    if (!actualFlowRate || actualFlowRate <= 0 || !processFluidDensity || processFluidDensity <= 0) return null;
    return calculateWE({
      service, actualFlowRate, flowUnit, floatMaterial,
      processFluidDensity, processFluidSG, processTempC, processPressureBara,
    });
  }, [actualFlowRate, flowUnit, processFluidDensity, processFluidSG, service, processTempC, processPressureBara, floatMaterial]);

  const validation = useMemo(() => validateRotameterConditions(processTempC, processPressureBara), [processTempC, processPressureBara]);
  const explanation = useMemo(() => {
    if (!result) return "";
    const qLPH = service === "liquid" ? actualFlowRate * (flowUnit === "LPH" ? 1 : flowUnit === "M³/H" ? 1000 : 1) : actualFlowRate;
    return getCorrectionExplanation(processFluidSG, result.we_LPH, qLPH);
  }, [result, processFluidSG, actualFlowRate, flowUnit, service]);

  if (!result) return null;

  const isSignificant = Math.abs(result.correctionFactor - 1.0) > 0.01;
  const unitLabels: Record<string, string> = { "LPH": "LPH", "LPM": "LPM", "GPH": "GPH", "GPM": "GPM", "m³/h": "m³/h" };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white mt-3">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800">Water Equivalent Calculator</span>
            <Badge className="text-[9px] bg-blue-100 text-blue-700 border-blue-300 px-1.5 py-0">
              {service === "liquid" ? "Liquid Service" : "Gas Service"}
            </Badge>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-blue-500" />}
        </CardTitle>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3">
          {/* Float Selector */}
          <div>
            <Label className="text-[10px] text-gray-500 mb-1.5 block">Float Material</Label>
            <div className="flex flex-wrap gap-2">
              {FLOAT_OPTIONS.map((fm) => (
                <button key={fm} onClick={() => setFloatMaterial(fm)}
                  className={`text-[10px] px-3 py-1.5 rounded-full border transition-all ${
                    floatMaterial === fm ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}>
                  {fm}
                </button>
              ))}
            </div>
          </div>

          {/* Main Result */}
          <div className="bg-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-blue-200 uppercase tracking-wide">
                {service === "liquid" ? "Water Equivalent" : "Air Equivalent"}
              </span>
              {result.willFloat ? (
                <span className="flex items-center gap-1 text-[10px] text-green-300">
                  <CheckCircle2 className="w-3 h-3" /> Float OK
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-red-300">
                  <AlertTriangle className="w-3 h-3" /> Float Issue
                </span>
              )}
            </div>
            <div className="text-3xl font-bold">{result.we_LPH.toFixed(2)} <span className="text-sm text-blue-200">LPH-water</span></div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-blue-200">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Actual: <strong className="text-white">{actualFlowRate.toFixed(2)} {flowUnit}</strong> → WE: <strong className="text-white">{result.we_LPH.toFixed(2)} LPH</strong></span>
            </div>
          </div>

          {/* All Units */}
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(result.we_allUnits).filter(([u]) => u !== "LPH").map(([unit, val]) => (
              <div key={unit} className="bg-white rounded border border-blue-100 p-2 text-center">
                <div className="text-[9px] text-gray-500">{unitLabels[unit] || unit}</div>
                <div className="text-sm font-bold text-blue-700 font-mono">{val.toFixed(3)}</div>
              </div>
            ))}
          </div>

          {/* Correction Factor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg border border-blue-100 p-3">
              <div className="text-[10px] text-gray-500 mb-1">{service === "liquid" ? "LSGCF" : "GCF"}</div>
              <div className="text-lg font-bold text-blue-700 font-mono">×{result.correctionFactor.toFixed(4)}</div>
            </div>
            {result.fcf !== undefined && (
              <div className="bg-white rounded-lg border border-blue-100 p-3">
                <div className="text-[10px] text-gray-500 mb-1">FCF</div>
                <div className="text-lg font-bold text-amber-600 font-mono">×{result.fcf.toFixed(4)}</div>
              </div>
            )}
          </div>

          {/* Explanation */}
          {explanation && (
            <div className={`rounded-lg p-3 border ${isSignificant ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isSignificant ? "text-amber-600" : "text-green-600"}`} />
                <p className={`text-[11px] leading-relaxed ${isSignificant ? "text-amber-800" : "text-green-800"}`}>{explanation}</p>
              </div>
            </div>
          )}

          {/* Formula Toggle */}
          <div>
            <button onClick={() => setShowFormula(!showFormula)}
              className="flex items-center gap-1.5 text-[10px] text-blue-600 hover:text-blue-800 transition-colors">
              {showFormula ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showFormula ? "Hide" : "Show"} Formula
            </button>
            {showFormula && (
              <div className="mt-2 space-y-2 bg-gray-50 rounded-lg border border-gray-200 p-3">
                <code className="text-[10px] text-gray-800 font-mono block bg-white px-2 py-1.5 rounded border">{result.formula}</code>
                <pre className="text-[9px] text-gray-700 font-mono whitespace-pre-wrap">{result.formulaDetail}</pre>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <span className="text-gray-500">Float SG: <strong className="font-mono">{result.floatSG}</strong></span>
                  <span className="text-gray-500">Float ρ: <strong className="font-mono">{result.floatDensity} kg/m³</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Scale Range & Report Download */}
          <div className="border-t border-blue-200 pt-4 mt-2">
            <button onClick={() => setShowReport(!showReport)}
              className="flex items-center gap-1.5 text-[10px] text-blue-700 hover:text-blue-900 transition-colors font-semibold mb-3">
              {showReport ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showReport ? "Hide" : "Show"} Scale Report Options
            </button>

            {showReport && (
              <div className="space-y-3 bg-white rounded-lg border border-blue-200 p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-[9px] text-gray-500 mb-1 block">Scale Min ({flowUnit})</Label>
                    <Input type="number" value={scaleMin} onChange={(e) => setScaleMin(parseFloat(e.target.value) || 0)}
                      className="text-xs font-mono" step={flowUnit === "m³/h" ? 0.1 : 1} />
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500 mb-1 block">Scale Max ({flowUnit})</Label>
                    <Input type="number" value={scaleMax} onChange={(e) => setScaleMax(parseFloat(e.target.value) || 0)}
                      className="text-xs font-mono" step={flowUnit === "m³/h" ? 0.1 : 1} />
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500 mb-1 block">Liquid Name</Label>
                    <Input type="text" value={liquidName} onChange={(e) => setLiquidName(e.target.value)}
                      className="text-xs" placeholder="e.g. Water" />
                  </div>
                  <div>
                    <Label className="text-[9px] text-gray-500 mb-1 block">Viscosity (cP)</Label>
                    <Input type="number" value={liquidViscosity} onChange={(e) => setLiquidViscosity(parseFloat(e.target.value) || 1)}
                      className="text-xs font-mono" step={0.001} />
                  </div>
                </div>

                <Button
                  onClick={() => {
                    downloadWEReport({
                      result,
                      customerFlowRate: actualFlowRate,
                      flowUnit,
                      scaleMin,
                      scaleMax,
                      floatMaterial,
                      floatType: "BL",
                      liquidName,
                      liquidDensity: processFluidDensity,
                      liquidViscosity,
                      temperature: processTempC,
                    });
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
                  size="sm"
                >
                  <Download className="w-4 h-4" />
                  Download Scale Report (PDF)
                </Button>
                <p className="text-[8px] text-gray-400 text-center">
                  Report includes: Variable Scale Marking, 5% Increment Calibration Table, Visual Scale Diagram, Technical Parameters, VIC Analysis
                </p>
              </div>
            )}
          </div>

          {/* Warnings */}
          {result.warning && (
            <div className="flex items-start gap-2 text-[10px] text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {result.warning}
            </div>
          )}
          {validation.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {issue}
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
