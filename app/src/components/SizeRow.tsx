import { Trophy, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SizeResult } from "../hooks/useCalculator";

interface SizeRowProps {
  size: SizeResult;
  highlightInput?: boolean; // Whether to highlight the input-flow velocity
}

export default function SizeRow({ size, highlightInput = true }: SizeRowProps) {
  const isOptimal = size.status === "optimal";
  const isValid = size.status === "valid";
  const isTooLow = size.status === "too-low";
  const isTooHigh = size.status === "too-high";

  // Velocity status
  const vOptimal = size.velocityStatus === "optimal";
  const vValid = size.velocityStatus === "valid";
  const vTooLow = size.velocityStatus === "too-low";
  const vTooHigh = size.velocityStatus === "too-high";

  return (
    <tr
      className={`border-b last:border-0 ${
        isOptimal
          ? "bg-green-50"
          : isValid
          ? "bg-blue-50/50"
          : isTooLow || isTooHigh
          ? "bg-red-50/50 opacity-60"
          : ""
      }`}
    >
      {/* Size */}
      <td className="px-3 py-2 font-mono text-sm font-medium whitespace-nowrap">
        {size.size}
        {isOptimal && (
          <Trophy className="inline w-3 h-3 ml-1 text-green-600" />
        )}
      </td>

      {/* Qmin */}
      <td className="px-3 py-2 text-sm tabular-nums text-muted-foreground">
        {size.qMin.toFixed(2)}
      </td>

      {/* Qmax */}
      <td className="px-3 py-2 text-sm tabular-nums text-muted-foreground">
        {size.qMax.toFixed(2)}
      </td>

      {/* Velocity at Input Flow — HIGHLIGHTED */}
      <td
        className={`px-3 py-2 text-sm tabular-nums font-semibold whitespace-nowrap ${
          highlightInput
            ? vOptimal || vValid
              ? "bg-yellow-100 border-l-2 border-r-2 border-yellow-400 text-yellow-800"
              : "bg-red-100 border-l-2 border-r-2 border-red-400 text-red-700"
            : ""
        }`}
      >
        {size.velocityAtQmin.toFixed(2)}–{size.velocityAtQmax.toFixed(2)} m/s
        {highlightInput && (vTooLow || vTooHigh) && (
          <AlertTriangle className="inline w-3 h-3 ml-1 text-red-500" />
        )}
      </td>

      {/* Velocity Range */}
      <td className="px-3 py-2 text-sm tabular-nums text-muted-foreground whitespace-nowrap">
        {size.meterVmin.toFixed(1)}–{size.meterVmax.toFixed(1)}
      </td>

      {/* Flow Status */}
      <td className="px-3 py-2">
        {isOptimal ? (
          <Badge className="bg-green-600 text-white text-xs">Optimal</Badge>
        ) : isValid ? (
          <Badge className="bg-primary text-white text-xs">Valid</Badge>
        ) : isTooLow ? (
          <Badge variant="outline" className="text-red-500 text-xs">
            Too Low
          </Badge>
        ) : (
          <Badge variant="outline" className="text-red-500 text-xs">
            Too High
          </Badge>
        )}
      </td>

      {/* Velocity Status */}
      <td className="px-3 py-2">
        {vOptimal ? (
          <Badge className="bg-green-600 text-white text-xs">v OK</Badge>
        ) : vValid ? (
          <Badge className="bg-blue-500 text-white text-xs">v OK</Badge>
        ) : vTooLow ? (
          <Badge variant="outline" className="text-amber-500 text-xs">
            v Low
          </Badge>
        ) : (
          <Badge variant="outline" className="text-red-500 text-xs">
            v High
          </Badge>
        )}
      </td>

      {/* Flow Range Bar */}
      <td className="px-3 py-2 w-24">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isOptimal
                ? "bg-green-500"
                : isValid
                ? "bg-primary"
                : "bg-red-300"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, size.percentage))}%` }}
          />
        </div>
      </td>
    </tr>
  );
}
