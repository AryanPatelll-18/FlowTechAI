// ============================================================
// DocumentViewer — Inline HTML document renderer with print
// Replaces popup windows that get blocked by browsers
// ============================================================

import { useState, useRef, useEffect } from "react";
import { X, Printer, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  htmlContent: string;
  title: string;
  onClose: () => void;
}

export default function DocumentViewer({ htmlContent, title, onClose }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
@page { size: A4; margin: 6mm; }
body {
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 10px;
  line-height: 1.4;
  color: #222;
  margin: 0;
  padding: 6mm;
  background: #fff;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; vertical-align: top; }
th { background: #f0f0f0; font-weight: 600; }
div { page-break-inside: avoid; }
img { max-width: 100%; height: auto; }
</style>
</head>
<body>${htmlContent}</body>
</html>`);
        doc.close();
        setTimeout(() => setLoaded(true), 300);
      }
    }
  }, [htmlContent, title]);

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDownload = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
@page { size: A4; margin: 6mm; }
body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; line-height: 1.4; color: #222; margin: 0; padding: 6mm; background: #fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; vertical-align: top; }
th { background: #f0f0f0; font-weight: 600; }
div { page-break-inside: avoid; }
</style>
</head>
<body>${htmlContent}</body>
</html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white rounded-t-lg shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-bold truncate">{title}</span>
            {!loaded && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handlePrint}
              size="sm"
              className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              <Printer className="w-3.5 h-3.5 mr-1" /> Print to PDF
            </Button>
            <Button
              onClick={handleDownload}
              size="sm"
              variant="outline"
              className="h-7 text-xs border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Download HTML
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Iframe */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title={title}
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}
