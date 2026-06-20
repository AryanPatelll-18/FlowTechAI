/**
 * Documents Module — Datasheet Generator
 * Generates datasheets + GAD for sized instruments.
 * QAP and Final Reports are now exclusively in the Project Workflow.
 */
import { useAppContext } from "../../context/AppContext";
import DocumentPanel from "../../components/DocumentPanel";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, AlertTriangle } from "lucide-react";

export default function DocumentsModule() {
  const { state } = useAppContext();

  const sizingCount = state.sizingResults.length;
  const docCount = state.generatedDocuments.length;

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 text-sm">
          <FileSpreadsheet className="w-4 h-4 text-primary" />
          <span className="font-medium">Datasheet Generator</span>
        </div>
        <div className="flex gap-3 text-xs">
          <Badge variant="outline">{sizingCount} sized</Badge>
          <Badge variant="outline">{docCount} generated</Badge>
        </div>
        {sizingCount === 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-700">
            <AlertTriangle className="w-3 h-3" />
            No sizing data. Go to <strong>Sizing &rarr; Flow</strong> to size instruments first.
          </div>
        )}
      </div>

      {/* Datasheet Panel */}
      <DocumentPanel sizingResults={state.sizingResults} />
    </div>
  );
}
