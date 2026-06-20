// ============================================================
// SIZING CHECK PANEL
// Runs sizing validation on all flow instruments from uploaded SO,
// displays results table, allows individual report downloads.
// ============================================================

import { useState, useCallback } from "react";
import {
  Calculator,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Gauge,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  runSizingCheckAll,
  downloadSizingReport,
  downloadCombinedSizingReport,
  isFlowInstrument,
  type SizingCheckResult,
} from "../data/soSizingBridge";
import type { ExtractedProcessData } from "../data/smartParser";

interface InstrumentInput {
  srNo: number;
  tagNo: string;
  instrumentType: string;
  size: string;
  processData: ExtractedProcessData;
}

interface SizingCheckPanelProps {
  instruments: InstrumentInput[];
  soNo?: string;
  clientName?: string;
  projectName?: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  optimal:   { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  valid:     { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  marginal:  { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  rejected:  { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200" },
  unknown:   { bg: "bg-gray-50",   text: "text-gray-600",   border: "border-gray-200" },
  skipped:   { bg: "bg-gray-50",   text: "text-gray-400",   border: "border-gray-200" },
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "optimal": return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "valid":   return <CheckCircle className="w-4 h-4 text-blue-600" />;
    case "marginal":return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    case "rejected":return <XCircle className="w-4 h-4 text-red-600" />;
    default:        return <HelpCircle className="w-4 h-4 text-gray-400" />;
  }
}

export default function SizingCheckPanel({
  instruments,
  soNo = "",
  clientName = "",
  projectName = "",
}: SizingCheckPanelProps) {
  const [results, setResults] = useState<SizingCheckResult[] | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const flowInstruments = instruments.filter((i) => isFlowInstrument(i.instrumentType));
  const nonFlowCount = instruments.length - flowInstruments.length;

  const handleRunCheck = useCallback(() => {
    setRunning(true);
    // Run asynchronously to not block UI
    setTimeout(() => {
      const sizingResults = runSizingCheckAll(
        flowInstruments,
        soNo,
        clientName,
        projectName,
      );
      setResults(sizingResults);
      setRunning(false);
    }, 100);
  }, [flowInstruments, soNo, clientName, projectName]);

  const handleDownload = useCallback((result: SizingCheckResult) => {
    downloadSizingReport(result, soNo);
  }, [soNo]);

  const handlePreview = useCallback((result: SizingCheckResult) => {
    if (result.reportHtml) {
      setPreviewHtml(result.reportHtml);
    }
  }, []);

  const statusCounts = results
    ? flowInstruments.reduce(
        (acc, _inst, idx) => {
          const r = results[idx];
          if (r) acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      )
    : {};

  const mismatchCount = results?.filter((r) => r.hasSizeMismatch).length ?? 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-red-600" />
          <h3 className="text-sm font-bold text-gray-800">Sizing Verification Check</h3>
        </div>
        <Button
          size="sm"
          onClick={handleRunCheck}
          disabled={running || flowInstruments.length === 0}
          className="text-[10px] h-7 bg-red-600 hover:bg-red-700 text-white"
        >
          <Calculator className="w-3 h-3 mr-1" />
          {running ? "Running..." : results ? "Re-Run Check" : "Run Sizing Check"}
        </Button>
      </div>

      {/* Info */}
      <div className="text-[10px] text-gray-500">
        {flowInstruments.length} flow instrument{flowInstruments.length !== 1 ? "s" : ""} found
        {nonFlowCount > 0 && ` (${nonFlowCount} non-flow instrument${nonFlowCount !== 1 ? "s" : ""} skipped)`}
        {results && (
          <span className="ml-2">
            | {statusCounts["optimal"] || 0} Optimal | {statusCounts["valid"] || 0} Valid |{" "}
            {statusCounts["marginal"] || 0} Marginal | {statusCounts["rejected"] || 0} Rejected
            {mismatchCount > 0 && (
              <span className="ml-2 font-bold text-red-600">
                | {mismatchCount} size mismatch{mismatchCount > 1 ? "es" : ""} detected
              </span>
            )}
          </span>
        )}
      </div>

      {/* Combined Report Download */}
      {results && results.length > 0 && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
          <span className="text-[10px] font-bold text-gray-700">Sizing Results ({results.length} instruments)</span>
          <Button size="sm" variant="outline" onClick={() => downloadCombinedSizingReport(results, soNo, clientName, projectName)} className="text-[9px] h-7">
            <FileDown className="w-3 h-3 mr-1" /> Combined Report
          </Button>
        </div>
      )}

      {/* Results Table */}
      {results && results.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-[9px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-2 py-1.5 text-left font-bold text-gray-600">Sr.</th>
                <th className="px-2 py-1.5 text-left font-bold text-gray-600">Tag No.</th>
                <th className="px-2 py-1.5 text-left font-bold text-gray-600">Type</th>
                <th className="px-2 py-1.5 text-center font-bold text-gray-600">SO Size</th>
                <th className="px-2 py-1.5 text-center font-bold text-gray-600">Status</th>
                <th className="px-2 py-1.5 text-center font-bold text-gray-600">SO Flow Range</th>
                <th className="px-2 py-1.5 text-center font-bold text-gray-600">Meter Range</th>
                <th className="px-2 py-1.5 text-center font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => {
                const colors = STATUS_COLORS[r.status] || STATUS_COLORS.unknown;
                const isExpanded = expandedRow === idx;
                return (
                  <>
                    <tr
                      key={idx}
                      className={`border-b border-gray-100 ${isExpanded ? colors.bg : ""} ${
                        r.hasSizeMismatch ? "bg-yellow-50/50" : ""
                      } hover:bg-gray-50 transition-colors`}
                    >
                      <td className="px-2 py-1.5 text-gray-600">{r.srNo}</td>
                      <td className="px-2 py-1.5 font-semibold text-gray-800">{r.tagNo}</td>
                      <td className="px-2 py-1.5 text-gray-600">{r.instrumentType}</td>
                      <td className="px-2 py-1.5 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            r.hasSizeMismatch
                              ? "bg-yellow-100 text-yellow-700 line-through"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {r.soSize}
                        </span>
                        {r.hasSizeMismatch && (
                          <span className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-green-100 text-green-700">
                            → {r.recommendedSize}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          <StatusIcon status={r.status} />
                          {r.statusLabel}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-center text-gray-600">
                        {r.soQMin > 0 || r.soQMax > 0
                          ? `${r.soQMin}-${r.soQMax} ${r.flowUnit}`
                          : "—"}
                      </td>
                      <td className="px-2 py-1.5 text-center text-gray-600">
                        {r.meterQMin > 0 || r.meterQMax > 0
                          ? `${r.meterQMin}-${r.meterQMax} ${r.flowUnit}`
                          : "—"}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handlePreview(r)}
                            className="p-0.5 rounded hover:bg-gray-200 text-gray-500"
                            title="Preview Report"
                          >
                            <FileText className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDownload(r)}
                            className="p-0.5 rounded hover:bg-gray-200 text-gray-500"
                            title="Download Report"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setExpandedRow(isExpanded ? null : idx)}
                            className="p-0.5 rounded hover:bg-gray-200 text-gray-500"
                            title="Details"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                          <div className="space-y-2">
                            {/* Missing data warnings */}
                            {r.missingFields.length > 0 && (
                              <div className="space-y-0.5">
                                <div className="text-[9px] font-bold text-amber-700 uppercase">Data from SO / Assumed</div>
                                {r.missingFields.map((mf, mi) => (
                                  <div key={mi} className={`text-[8px] flex items-start gap-1 ${mf.critical ? "text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5" : "text-amber-600"}`}>
                                    {mf.critical ? <XCircle className="w-2.5 h-2.5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-2.5 h-2.5 shrink-0 mt-0.5" />}
                                    <span><strong>{mf.label}:</strong> {mf.source === "SO" ? "✓ From SO" : `⚠ Assumed = ${mf.assumedValue}`}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Sizing calculations */}
                            {(r.velocityMax > 0 || r.reynoldsMax > 0) && (
                              <div className="grid grid-cols-3 gap-2 text-[8px] text-gray-600 bg-white border border-gray-200 rounded p-2">
                                <div><strong>Velocity:</strong><br/>{r.velocityMin.toFixed(2)} - {r.velocityMax.toFixed(2)} m/s</div>
                                <div><strong>Reynolds:</strong><br/>{r.reynoldsMin > 0 ? r.reynoldsMin.toLocaleString() : "—"} - {r.reynoldsMax > 0 ? r.reynoldsMax.toLocaleString() : "—"}</div>
                                <div><strong>Turndown:</strong><br/>{r.turndownRatio > 0 ? r.turndownRatio.toFixed(1) + ":1" : "—"}</div>
                                <div><strong>Pipe ID:</strong><br/>{r.pipeIdMm.toFixed(1)} mm</div>
                                <div><strong>Press. Drop:</strong><br/>{r.pressureDrop.toFixed(4)} bar</div>
                                <div><strong>Uncert. (k=2):</strong><br/>±{(r.status !== "skipped" && r.status !== "cannot_size" ? 0.52 : 0).toFixed(2)}%</div>
                              </div>
                            )}

                            {/* Warning message */}
                            {r.warningMessage && (
                              <div className="flex items-start gap-1.5 text-[9px] text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                                <span className="font-semibold">{r.warningMessage}</span>
                              </div>
                            )}

                            {/* Sizing notes */}
                            <div className="space-y-0.5">
                              {r.sizingNotes.map((note, ni) => (
                                <div key={ni} className="text-[8px] text-gray-500 flex items-start gap-1">
                                  <span className="text-gray-400 mt-0.5">•</span>
                                  {note}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Panel */}
      {previewHtml && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-200 flex items-center justify-between">
            <span className="text-[9px] font-bold text-gray-500 uppercase">
              Sizing Report Preview
            </span>
            <button
              onClick={() => setPreviewHtml(null)}
              className="text-[8px] text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>
          <iframe
            srcDoc={previewHtml}
            title="Sizing Report Preview"
            className="w-full bg-white"
            style={{ height: "700px" }}
          />
        </div>
      )}

      {/* Empty state */}
      {results && results.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <Gauge className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
          <div className="text-[10px] text-gray-500">No flow instruments to check</div>
        </div>
      )}
    </div>
  );
}
