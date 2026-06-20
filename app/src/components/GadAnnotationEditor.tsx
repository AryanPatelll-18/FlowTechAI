// ============================================================
// GAD ANNOTATION EDITOR — Full Canvas Drawing Component
// Draw dimension highlights, arrows, circles, text on GAD images
// Integration: Document Master (A), Datasheet Inline (B), Both (C)
// ============================================================

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Pencil,
  Minus,
  ArrowRight,
  Circle,
  Square,
  Type,
  Undo2,
  Redo2,
  Trash2,
  Save,
  X,
  ZoomIn,
  ZoomOut,
  Move,
  Download,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Tool = "pen" | "line" | "arrow" | "circle" | "rect" | "text" | "move";
type LineWidth = 1 | 2 | 4;
type AnnotationColor = "#dc2626" | "#2563eb" | "#16a34a" | "#000000" | "#eab308";

interface AnnotationAction {
  tool: Tool;
  color: string;
  lineWidth: number;
  points: { x: number; y: number }[];
  text?: string;
}

interface Props {
  imageUrl: string;
  drawingNo: string;
  title: string;
  onSave: (annotatedDataUrl: string) => void;
  onCancel: () => void;
  onDownload?: (dataUrl: string) => void;
}

const COLORS: { value: AnnotationColor; label: string }[] = [
  { value: "#dc2626", label: "Red" },
  { value: "#2563eb", label: "Blue" },
  { value: "#16a34a", label: "Green" },
  { value: "#000000", label: "Black" },
  { value: "#eab308", label: "Yellow" },
];

const LINE_WIDTHS: { value: LineWidth; label: string }[] = [
  { value: 1, label: "Thin" },
  { value: 2, label: "Medium" },
  { value: 4, label: "Thick" },
];

export default function GadAnnotationEditor({
  imageUrl,
  drawingNo,
  title,
  onSave,
  onCancel,
  onDownload,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>("line");
  const [color, setColor] = useState<AnnotationColor>("#dc2626");
  const [lineWidth, setLineWidth] = useState<LineWidth>(2);
  const [zoom, setZoom] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<AnnotationAction[][]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const currentAction = useRef<AnnotationAction | null>(null);

  // Load image onto canvas
  useEffect(() => {
    setImageLoaded(false);
    setLoadError(null);
    const img = new Image();
    // crossOrigin breaks data: URLs — only set for http(s)
    if (!imageUrl.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      imageRef.current = img;
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      setImageLoaded(true);
      setLoadError(null);
    };
    img.onerror = () => {
      console.error("[GadEditor] Failed to load image:", imageUrl.slice(0, 80));
      setLoadError(
        imageUrl.startsWith("data:application/pdf")
          ? "PDF files cannot be edited directly. Please convert to JPG/PNG first."
          : "Failed to load image. The file may be corrupted."
      );
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Redraw everything from history
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and redraw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Draw all actions from history up to current step
    const actions = historyStep >= 0 ? history[historyStep] || [] : [];
    for (const action of actions) {
      drawAction(ctx, action);
    }
  }, [history, historyStep]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Draw a single action
  function drawAction(ctx: CanvasRenderingContext2D, action: AnnotationAction) {
    ctx.strokeStyle = action.color;
    ctx.fillStyle = action.color;
    ctx.lineWidth = action.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const pts = action.points;
    if (pts.length < 2 && action.tool !== "text") return;

    switch (action.tool) {
      case "pen": {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
        break;
      }
      case "line": {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
        // Arrowhead
        drawArrowhead(ctx, pts[0].x, pts[0].y, pts[pts.length - 1].x, pts[pts.length - 1].y, action.lineWidth);
        break;
      }
      case "arrow": {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
        // Arrowhead at end
        drawArrowhead(ctx, pts[pts.length - 1].x, pts[pts.length - 1].y, pts[0].x, pts[0].y, action.lineWidth);
        break;
      }
      case "circle": {
        const dx = pts[pts.length - 1].x - pts[0].x;
        const dy = pts[pts.length - 1].y - pts[0].y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case "rect": {
        const x = Math.min(pts[0].x, pts[pts.length - 1].x);
        const y = Math.min(pts[0].y, pts[pts.length - 1].y);
        const w = Math.abs(pts[pts.length - 1].x - pts[0].x);
        const h = Math.abs(pts[pts.length - 1].y - pts[0].y);
        ctx.strokeRect(x, y, w, h);
        break;
      }
      case "text": {
        if (action.text) {
          const fontSize = Math.max(12, action.lineWidth * 8);
          ctx.font = `bold ${fontSize}px sans-serif`;
          // Background
          const metrics = ctx.measureText(action.text);
          const padding = 4;
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.fillRect(pts[0].x - padding, pts[0].y - fontSize - padding, metrics.width + padding * 2, fontSize + padding * 2);
          // Text
          ctx.fillStyle = action.color;
          ctx.fillText(action.text, pts[0].x, pts[0].y);
        }
        break;
      }
    }
  }

  function drawArrowhead(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, width: number) {
    const headLen = Math.max(10, width * 5);
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(fromX - headLen * Math.cos(angle - Math.PI / 6), fromY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(fromX - headLen * Math.cos(angle + Math.PI / 6), fromY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }

  // Get canvas coordinates from mouse event
  function getCanvasPos(e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded || tool === "move") return;
    const pos = getCanvasPos(e);

    if (tool === "text") {
      setTextPos(pos);
      setTextInput("");
      return;
    }

    setIsDrawing(true);
    currentAction.current = {
      tool,
      color,
      lineWidth,
      points: [pos],
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAction.current) return;
    const pos = getCanvasPos(e);
    currentAction.current.points.push(pos);

    // Preview on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Redraw base + history
    redrawCanvas();

    // Draw current action preview
    drawAction(ctx, currentAction.current);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentAction.current) return;
    setIsDrawing(false);

    // Only save if we have meaningful points
    if (currentAction.current.points.length >= 2 || currentAction.current.tool === "text") {
      // Save to history
      const prevActions = historyStep >= 0 ? [...(history[historyStep] || [])] : [];
      const newActions = [...prevActions, currentAction.current];
      const newHistory = [...history.slice(0, historyStep + 1), newActions];
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    }

    currentAction.current = null;
  };

  // Text annotation handler
  const handleTextSubmit = () => {
    if (!textPos || !textInput.trim()) {
      setTextPos(null);
      setTextInput("");
      return;
    }

    const action: AnnotationAction = {
      tool: "text",
      color,
      lineWidth,
      points: [textPos],
      text: textInput.trim(),
    };

    const prevActions = historyStep >= 0 ? [...(history[historyStep] || [])] : [];
    const newActions = [...prevActions, action];
    const newHistory = [...history.slice(0, historyStep + 1), newActions];
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);

    setTextPos(null);
    setTextInput("");
  };

  // Undo/Redo
  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
    } else if (historyStep === 0) {
      setHistoryStep(-1);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
    }
  };

  const handleClear = () => {
    if (confirm("Clear all annotations?")) {
      setHistory([]);
      setHistoryStep(-1);
    }
  };

  // Save
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  const handleDownloadAnnotated = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    if (onDownload) {
      onDownload(dataUrl);
    } else {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${drawingNo}-annotated.png`;
      a.click();
    }
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
        <p className="text-[11px] font-semibold text-red-600">{loadError}</p>
        <p className="text-[9px] text-gray-400 mt-1">
          Drawing: {drawingNo}
        </p>
        <button
          onClick={onCancel}
          className="mt-3 text-[9px] px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!imageLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-[10px]">Loading drawing...</p>
        <p className="text-[8px] text-gray-400 mt-1">{drawingNo}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* ─── TOOLBAR ─── */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between flex-wrap gap-2">
        {/* Left: Tool selector */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold text-gray-500 mr-1">Tools:</span>
          {[
            { key: "line" as Tool, icon: Minus, label: "Line" },
            { key: "arrow" as Tool, icon: ArrowRight, label: "Arrow" },
            { key: "circle" as Tool, icon: Circle, label: "Circle" },
            { key: "rect" as Tool, icon: Square, label: "Rect" },
            { key: "text" as Tool, icon: Type, label: "Text" },
            { key: "pen" as Tool, icon: Pencil, label: "Pen" },
            { key: "move" as Tool, icon: Move, label: "Pan" },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTool(key)}
              className={`p-1.5 rounded transition-all ${
                tool === key
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-200"
              }`}
              title={label}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Center: Colors */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold text-gray-500 mr-1">Color:</span>
          {COLORS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setColor(value)}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                color === value ? "border-gray-800 scale-110" : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: value }}
              title={label}
            />
          ))}
        </div>

        {/* Right: Line width + Actions */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold text-gray-500 mr-1">Width:</span>
          {LINE_WIDTHS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setLineWidth(value)}
              className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${
                lineWidth === value
                  ? "bg-red-600 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-200"
              }`}
              title={label}
            >
              <div className="w-4" style={{ height: value, backgroundColor: color }} />
            </button>
          ))}

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Undo/Redo */}
          <button onClick={handleUndo} disabled={historyStep < 0} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30" title="Undo">
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleRedo} disabled={historyStep >= history.length - 1} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30" title="Redo">
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleClear} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Clear all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Zoom */}
          <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Zoom out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[9px] text-gray-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Zoom in">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── CANVAS AREA ─── */}
      <div ref={containerRef} className="flex-1 overflow-auto relative flex items-start justify-center p-4">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.15s ease" }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`border border-gray-300 shadow-lg bg-white ${
              tool === "text" ? "cursor-text" : tool === "move" ? "cursor-grab" : "cursor-crosshair"
            }`}
            style={{ maxWidth: "100%", display: "block" }}
          />
        </div>

        {/* Text input popup */}
        {textPos && (
          <div
            className="absolute bg-white border border-gray-300 rounded shadow-lg p-2 flex flex-col gap-1 z-50"
            style={{
              left: `${(textPos.x / naturalSize.width) * 100 * zoom}%`,
              top: `${(textPos.y / naturalSize.height) * 100 * zoom}%`,
            }}
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleTextSubmit(); if (e.key === "Escape") { setTextPos(null); setTextInput(""); } }}
              placeholder="Enter dimension text..."
              className="text-[10px] border border-gray-200 rounded px-2 py-1 w-40 focus:outline-none focus:ring-1 focus:ring-red-500"
              autoFocus
            />
            <div className="flex gap-1">
              <button onClick={handleTextSubmit} className="text-[8px] px-2 py-0.5 bg-red-600 text-white rounded flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5" /> OK
              </button>
              <button onClick={() => { setTextPos(null); setTextInput(""); }} className="text-[8px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── FOOTER ─── */}
      <div className="bg-white border-t border-gray-200 px-3 py-2 flex items-center justify-between">
        <div className="text-[9px] text-gray-500">
          <span className="font-semibold">{drawingNo}</span> — {title}
          <span className="ml-2 text-gray-400">
            {naturalSize.width} × {naturalSize.height}px | {historyStep >= 0 ? (history[historyStep]?.length || 0) : 0} annotations
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" onClick={handleDownloadAnnotated} className="text-[9px] h-7">
            <Download className="w-3 h-3 mr-1" /> Download PNG
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel} className="text-[9px] h-7">
            <X className="w-3 h-3 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="text-[9px] h-7 bg-red-600 hover:bg-red-700 text-white">
            <Save className="w-3 h-3 mr-1" /> Save as New Drawing
          </Button>
        </div>
      </div>
    </div>
  );
}
