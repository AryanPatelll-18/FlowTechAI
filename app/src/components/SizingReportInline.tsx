import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, X, FileText } from "lucide-react";

interface SizingReportInlineProps {
  html: string;
  visible: boolean;
  onClose: () => void;
}

export default function SizingReportInline({ html, visible, onClose }: SizingReportInlineProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!visible || !iframeRef.current) return;
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();
    setLoaded(true);
  }, [html, visible]);

  const handlePrint = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };

  if (!visible) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 shadow-sm mt-4">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-800">
            Professional Sizing Report
          </span>
          <span className="text-xs text-gray-400 ml-1">
            -- ISO 5168 / GUM Uncertainty Analysis
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs h-8 bg-white hover:bg-gray-50 border-gray-300"
          >
            <Printer className="w-3.5 h-3.5" />
            Print to PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="gap-1.5 text-xs h-8 bg-white hover:bg-gray-50 border-gray-300"
          >
            <X className="w-3.5 h-3.5" />
            Close
          </Button>
        </div>
      </div>

      <div className="w-full" style={{ height: "800px" }}>
        {!loaded && (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            Loading report...
          </div>
        )}
        <iframe
          ref={iframeRef}
          title="Flowtech Professional Sizing Report"
          className="w-full h-full border-0"
          style={{ display: loaded ? "block" : "none" }}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-200">
        <span className="text-xs text-gray-400">
          Press Ctrl+P to save as PDF
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="gap-1.5 text-xs h-8 bg-white hover:bg-gray-50 border-gray-300"
        >
          <Printer className="w-3.5 h-3.5" />
          Print to PDF
        </Button>
      </div>
    </div>
  );
}
