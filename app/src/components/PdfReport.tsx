import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { CalculatorState, CalculationResult } from "../hooks/useCalculator";

interface PdfReportProps {
  state: CalculatorState;
  validResults: CalculationResult[];
  rejectedResults: CalculationResult[];
}

// ─── Professional Grey + Red Only Palette ────────────────────────────
const C = {
  red: "#e50019",
  redDark: "#b80014",
  redLight: "#fef2f2",
  g900: "#111827",
  g800: "#1f2937",
  g700: "#374151",
  g600: "#4b5563",
  g500: "#6b7280",
  g400: "#9ca3af",
  g300: "#d1d5db",
  g200: "#e5e7eb",
  g150: "#f0f1f3",
  g100: "#f3f4f6",
  g50: "#f9fafb",
  white: "#ffffff",
  amber: "#d97706",
  amberLight: "#fef3c7",
};

// Product themes — all grey shades, no color
const PRODUCT_THEMES = [
  { bg: "#f9fafb", headBg: "#f3f4f6", border: "#d1d5db", text: "#374151", accent: "#6b7280" },
  { bg: "#f0f1f3", headBg: "#e5e7eb", border: "#9ca3af", text: "#4b5563", accent: "#6b7280" },
  { bg: "#faf9f7", headBg: "#f0eeea", border: "#d4d0c8", text: "#5c5648", accent: "#8b8474" },
  { bg: "#f5f5f5", headBg: "#ebebeb", border: "#c4c4c4", text: "#525252", accent: "#757575" },
  { bg: "#f8f7fa", headBg: "#eeecf2", border: "#c8c4d4", text: "#544f5e", accent: "#7a7485" },
  { bg: "#f7f8fa", headBg: "#eceef2", border: "#c2c8d4", text: "#4d5563", accent: "#727d8e" },
];

export default function PdfReport({ state, validResults, rejectedResults }: PdfReportProps) {
  const [portalReady, setPortalReady] = useState(false);
  const portalRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = document.createElement("div");
    el.id = "pdf-portal-root";
    document.body.appendChild(el);
    portalRootRef.current = el;
    setPortalReady(true);
    return () => {
      if (document.body.contains(el)) document.body.removeChild(el);
      portalRootRef.current = null;
    };
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const serviceLabel = state.service === "liquid" ? "Liquid" : state.service === "gas" ? "Gas" : "Steam";
  const fluidName =
    state.service === "liquid"
      ? state.selectedLiquid?.name || "Custom Liquid"
      : state.service === "gas"
      ? state.selectedGas?.name || "Custom Gas"
      : "Saturated Steam";

  const pressureDisplay =
    state.service === "liquid"
      ? `${state.liquidPressureBarAbs.toFixed(3)} bar abs`
      : state.service === "gas"
      ? `${state.gasPressureBarAbs.toFixed(3)} bar abs`
      : `${state.steamPressureBarAbs.toFixed(3)} bar abs`;

  const goodResults = validResults.filter((r) =>
    r.sizes.some((s) => s.status === "optimal" || s.status === "valid")
  );

  const [selectedSizes, setSelectedSizes] = useState<Record<string, boolean>>({});
  const toggleSize = (key: string) => setSelectedSizes((p) => ({ ...p, [key]: !p[key] }));

  // ─── Compact calc helpers ──────────────────────────
  const flowM3hr = state.unitConversion?.convertedValue
    ? state.unitConversion.convertedValue.toFixed(1)
    : state.flowUnit === "m³/hr"
    ? state.flowRateMax.toFixed(1)
    : "—";

  const reynolds = (() => {
    const v = state.unitConversion?.convertedValue || (state.flowUnit === "m³/hr" ? state.flowRateMax : 0);
    const D = 0.1;
    const A = (Math.PI * D * D) / 4;
    const vel = A > 0 ? v / 3600 / A : 0;
    const Re = state.density * vel * D / (state.viscosity / 1000);
    return Re > 0 ? Re.toExponential(1) : "—";
  })();

  const fluidState =
    state.service === "steam"
      ? state.steamState || "—"
      : state.selectedLiquid?.nonNewtonian
      ? "Non-Newtonian"
      : state.selectedLiquid?.conductivity === true
      ? "Conductive"
      : state.selectedLiquid?.conductivity === false
      ? "Non-Conductive"
      : "—";

  const reportContent = (
    <div id="pdf-report">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 6mm; }
          #root { display: none !important; }
          #pdf-portal-root { display: block !important; }
          #pdf-report > div > div { page-break-inside: avoid !important; }
          body { background: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @media screen { #pdf-portal-root { display: none !important; } }
      `}</style>

      <div
        style={{
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          fontSize: "9px",
          lineHeight: 1.35,
          color: C.g900,
          width: "100%",
        }}
      >
        {/* ═══════ COMPACT HEADER ═══════ */}
        <div
          style={{
            background: C.g900,
            borderRadius: "6px",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/flowtech_logo.png" alt="Flowtech" style={{ height: "36px", width: "auto" }} />
            <div style={{ borderLeft: "2px solid " + C.red, paddingLeft: "10px" }}>
              <div style={{ color: C.white, fontSize: "14px", fontWeight: 800 }}>
                Flow Meter Sizing Report
              </div>
              <div style={{ color: C.g400, fontSize: "8px", marginTop: "1px" }}>
                AI Flow Sizing Calculator v4 · Factory Qmin/Qmax
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: C.red, fontSize: "9px", fontWeight: 800, letterSpacing: "1px" }}>
              FLOWTECH
            </div>
            <div style={{ color: C.g500, fontSize: "7px", marginTop: "2px" }}>{dateStr}</div>
            <div style={{ color: C.g500, fontSize: "7px" }}>flowtech-instruments.com</div>
          </div>
        </div>

        {/* ═══════ PROCESS PARAMS — INLINE COMPACT ═══════ */}
        <div
          style={{
            border: `1.5px solid ${C.g200}`,
            borderRadius: "6px",
            overflow: "hidden",
            marginBottom: "6px",
          }}
        >
          {/* Title */}
          <div
            style={{
              background: C.g100,
              padding: "4px 12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderBottom: `1px solid ${C.g200}`,
            }}
          >
            <span
              style={{
                background: C.red,
                color: C.white,
                fontSize: "8px",
                fontWeight: 800,
                width: "16px",
                height: "16px",
                borderRadius: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              1
            </span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: C.g700 }}>PROCESS PARAMETERS</span>
          </div>

          {/* Params — all in one row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(10, 1fr)",
              gap: "1px",
              background: C.g200,
            }}
          >
            {[
              { label: "Service", value: serviceLabel, bold: true },
              { label: "Fluid", value: fluidName, bold: true },
              { label: "Flow Range", value: `${state.flowRateMin} – ${state.flowRateMax} ${state.flowUnit}`, bold: true },
              { label: "Pressure", value: pressureDisplay, bold: true },
              { label: "Density", value: `${state.density.toFixed(1)} kg/m³` },
              { label: "Viscosity", value: `${state.viscosity.toFixed(3)} cP` },
              { label: "Temp", value: `${state.operatingTemp} °C` },
              { label: "Flow (m³/hr)", value: flowM3hr },
              { label: "State", value: fluidState },
              { label: "Reynolds", value: reynolds },
            ].map((p, i) => (
              <div key={i} style={{ background: C.white, padding: "5px 7px" }}>
                <div
                  style={{
                    fontSize: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: C.g500,
                    fontWeight: 700,
                    marginBottom: "1px",
                  }}
                >
                  {p.label}
                </div>
                <div
                  style={{
                    fontSize: p.value.length > 14 ? "8px" : "9px",
                    fontWeight: p.bold ? 800 : 600,
                    color: p.bold ? C.red : C.g700,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ RECOMMENDED FLOW METERS ═══════ */}
        <div
          style={{
            border: `1.5px solid ${C.g200}`,
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          {/* Title */}
          <div
            style={{
              background: C.g800,
              color: C.white,
              padding: "4px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  background: "rgba(255,255,255,0.15)",
                  fontSize: "8px",
                  fontWeight: 800,
                  width: "16px",
                  height: "16px",
                  borderRadius: "3px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                2
              </span>
              <span style={{ fontSize: "10px", fontWeight: 700 }}>RECOMMENDED FLOW METERS</span>
            </div>
            <span style={{ fontSize: "7px", color: C.g400 }}>★ = Optimal · Tick to select</span>
          </div>

          {/* Tables */}
          {goodResults.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: C.g500, fontSize: "11px" }}>
              No Suitable Sizes Found
            </div>
          ) : (
            <div style={{ padding: "6px 8px" }}>
              {goodResults.map((result, ri) => {
                const theme = PRODUCT_THEMES[ri % PRODUCT_THEMES.length];
                const goodSizes = result.sizes.filter(
                  (s) => s.status === "optimal" || s.status === "valid"
                );
                if (goodSizes.length === 0) return null;

                return (
                  <div
                    key={result.product.name}
                    style={{
                      marginBottom: ri < goodResults.length - 1 ? "6px" : "0",
                      border: `1px solid ${theme.border}`,
                      borderRadius: "5px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Product header */}
                    <div
                      style={{
                        background: theme.headBg,
                        padding: "4px 10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: `1px solid ${theme.border}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: theme.accent,
                          }}
                        />
                        <StatusPill status={result.status} />
                        <span style={{ fontSize: "10px", fontWeight: 800, color: C.g900 }}>
                          {result.product.name}
                        </span>
                        {result.product.accuracy && (
                          <span
                            style={{
                              fontSize: "7px",
                              color: C.white,
                              background: C.g700,
                              padding: "1px 7px",
                              borderRadius: "8px",
                              fontWeight: 700,
                            }}
                          >
                            {result.product.accuracy}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: "7px",
                            color: C.g500,
                            background: C.white,
                            padding: "1px 6px",
                            borderRadius: "8px",
                            border: `1px solid ${C.g300}`,
                          }}
                        >
                          {result.product.service}
                        </span>
                      </div>
                      {result.bestSize && (
                        <span
                          style={{
                            fontSize: "8px",
                            fontWeight: 700,
                            color: theme.text,
                            background: theme.bg,
                            padding: "2px 8px",
                            borderRadius: "8px",
                          }}
                        >
                          ★ Best: {result.bestSize}
                        </span>
                      )}
                    </div>

                    {/* Compact table */}
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "8px",
                      }}
                    >
                      <thead>
                        <tr style={{ background: theme.bg }}>
                          {[
                          { label: "Size", align: "left" },
                          { label: "Qmin", align: "right" },
                          { label: "Qmax", align: "right" },
                          { label: "v @ Qmin–Qmax (m/s)", align: "right", hl: true },
                          { label: "Meter Rated (m/s)", align: "right" },
                          { label: "Median", align: "right" },
                          { label: "From Median", align: "center" },
                          { label: "ΔP (bar)", align: "right" },
                          { label: "v Status", align: "center" },
                          { label: "Status", align: "center" },
                          { label: "☑", align: "center" },
                        ].map((h) => (
                          <th
                            key={h.label}
                            style={{
                              padding: "3px 6px",
                              fontWeight: 700,
                              color: theme.text,
                              fontSize: "7px",
                              textTransform: "uppercase",
                              letterSpacing: "0.4px",
                              textAlign: h.align as "left" | "center" | "right",
                              borderBottom: `1px solid ${theme.border}`,
                              background: h.hl ? "#fffbeb" : theme.bg,
                            }}
                          >
                            {h.label}
                          </th>
                        ))}
                        </tr>
                      </thead>
                      <tbody>
                        {goodSizes.map((size, idx) => {
                          const selKey = `${result.product.name}-${size.size}`;
                          const isSelected = selectedSizes[selKey] ?? size.status === "optimal";
                          return (
                            <tr
                              key={size.size}
                              style={{
                                background:
                                  size.status === "optimal" ? theme.bg : idx % 2 ? C.g50 : C.white,
                                borderBottom: `1px solid ${C.g100}`,
                              }}
                            >
                              <td
                                style={{
                                  padding: "3px 6px",
                                  fontWeight: 700,
                                  fontFamily: "monospace",
                                  fontSize: "9px",
                                  color: theme.text,
                                }}
                              >
                                {result.bestSize === size.size && (
                                  <span style={{ color: C.g900, marginRight: "2px", fontSize: "8px" }}>▸</span>
                                )}
                                {size.size}
                                {size.isOddSize && (
                                  <span
                                    style={{
                                      fontSize: "6px",
                                      fontWeight: 700,
                                      color: "#b45309",
                                      background: "#fef3c7",
                                      padding: "1px 4px",
                                      borderRadius: "4px",
                                      marginLeft: "3px",
                                      verticalAlign: "middle",
                                    }}
                                  >
                                    ODD
                                  </span>
                                )}
                                {size.status === "optimal" && (
                                  <span style={{ color: C.g900, marginLeft: "2px" }}>★</span>
                                )}
                              </td>
                              <td style={num}>{size.qMin.toFixed(1)}</td>
                              <td style={num}>{size.qMax.toFixed(1)}</td>
                              <td
                                style={{
                                  ...num,
                                  background: "#fffbeb",
                                  fontWeight: 800,
                                  fontSize: "9px",
                                  color: C.amber,
                                }}
                              >
                                {size.velocityAtQmin.toFixed(2)}–{size.velocityAtQmax.toFixed(2)}
                              </td>
                              <td style={{ ...num, fontSize: "7px", color: C.g500 }}>
                                {size.meterVmin.toFixed(1)}–{size.meterVmax.toFixed(1)}
                              </td>
                              <td style={num}>{size.median.toFixed(1)}</td>
                              <td style={{ padding: "3px 6px", textAlign: "center" }}>
                                <AccuracyBar distance={size.distanceFromMedian} />
                              </td>
                              <td style={{ ...num, fontSize: "8px" }}>
                                {size.dpAtInput < 0.001 ? "<0.001" : size.dpAtInput.toFixed(3)}
                              </td>
                              <td style={{ padding: "3px 6px", textAlign: "center" }}>
                                <VelocityTag status={size.velocityStatus} />
                              </td>
                              <td style={{ padding: "3px 6px", textAlign: "center" }}>
                                <SizeTag status={size.status} best={result.bestSize === size.size} />
                              </td>
                              <td
                                style={{
                                  padding: "3px 6px",
                                  textAlign: "center",
                                  borderLeft: `1px solid ${C.g200}`,
                                }}
                              >
                                <div
                                  onClick={() => toggleSize(selKey)}
                                  style={{
                                    width: "13px",
                                    height: "13px",
                                    border: `1.5px solid ${isSelected ? C.g700 : C.g300}`,
                                    borderRadius: "2px",
                                    margin: "0 auto",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    background: isSelected ? C.g700 : C.white,
                                  }}
                                >
                                  {isSelected && (
                                    <span style={{ color: C.white, fontSize: "9px" }}>✓</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Mini footer */}
                    <div
                      style={{
                        background: theme.bg,
                        padding: "2px 8px",
                        fontSize: "6px",
                        color: C.g500,
                      }}
                    >
                      Unit: {goodSizes[0]?.unit || "—"} · Acc: {goodSizes[0]?.accuracy || "—"} · ΔP at input flow · Yellow = velocity · Bar = closeness to median
                    </div>
                  </div>
                );
              })}

              {/* Rejected */}
              {rejectedResults.length > 0 && (
                <div
                  style={{
                    marginTop: "4px",
                    padding: "3px 10px",
                    background: C.redLight,
                    borderRadius: "4px",
                    fontSize: "8px",
                    color: C.redDark,
                    fontWeight: 600,
                    borderLeft: "2px solid " + C.red,
                  }}
                >
                  Not Recommended: {rejectedResults.map((r) => r.product.name).join(", ")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════ P1.3: AUDIT TRAIL ═══════ */}
        <div
          style={{
            marginTop: "6px",
            border: `1.5px solid ${C.g200}`,
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: C.g100,
              padding: "4px 12px",
              borderBottom: `1px solid ${C.g200}`,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                background: C.red,
                color: C.white,
                fontSize: "8px",
                fontWeight: 800,
                width: "16px",
                height: "16px",
                borderRadius: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ∞
            </span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: C.g700 }}>
              AUDIT TRAIL & TRACEABILITY
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1px",
              background: C.g200,
            }}
          >
            {[
              { label: "Report Generated", value: new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC", bold: true },
              { label: "App Version", value: "FlowAI v4.0 (P0+P1 Release)", bold: true },
              { label: "Database Version", value: "Flowtech Factory Tables 2026", bold: true },
              { label: "Fluid Source", value: state.selectedLiquid?.name ? "Flowtech Master Database (306 fluids)" : "Manual Entry", bold: !!state.selectedLiquid?.name },
              { label: "Sizing Method", value: "Median-Closeness Accuracy · Range-Based Qmin/Qmax Validation" },
              { label: "Standards", value: "ISO 6817 · ISO 9951 · ISO/TR 15377 · ISO 20456 · VDI/VDE 3513" },
              { label: "Temperature Correction", value: state.operatingTemp !== 20 ? "Vogel-Cameron + Andrade Fallback" : "None (at 20°C reference)" },
              { label: "Viscosity Model", value: state.selectedLiquid?.viscosity ? "Database @ 20°C → Auto-corrected to Op. Temp" : "Manual Entry" },
              { label: "MOC Engine", value: "Flowtech Catalogue-Aligned (Phase II v3)" },
            ].map((p, i) => (
              <div key={i} style={{ background: C.white, padding: "4px 8px" }}>
                <div
                  style={{
                    fontSize: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: C.g500,
                    fontWeight: 700,
                    marginBottom: "1px",
                  }}
                >
                  {p.label}
                </div>
                <div
                  style={{
                    fontSize: "8px",
                    fontWeight: p.bold ? 800 : 600,
                    color: p.bold ? C.g800 : C.g600,
                    lineHeight: 1.3,
                  }}
                >
                  {p.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ COMPACT FOOTER ═══════ */}
        <div
          style={{
            marginTop: "5px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px 12px",
            background: C.g50,
            borderRadius: "4px",
            border: `1px solid ${C.g200}`,
          }}
        >
          <span style={{ fontSize: "7px", color: C.g500, fontWeight: 500 }}>
            Flowtech Instruments (I) Pvt. Ltd. · flowtech-instruments.com
          </span>
          <span style={{ fontSize: "6px", color: C.g400 }}>
            220+ liquids · 80+ gases · Factory Qmin/Qmax · Uncertainty Calculation · Standards Compliant · {dateStr}
          </span>
        </div>
      </div>
    </div>
  );

  if (!portalReady || !portalRootRef.current) return null;
  return createPortal(reportContent, portalRootRef.current);
}

/* ═══════════════════ Helpers ═══════════════════ */

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; label: string }> = {
    best: { bg: C.g900, label: "BEST" },
    suitable: { bg: C.g600, label: "SUITABLE" },
    caution: { bg: C.g500, label: "CAUTION" },
    rejected: { bg: C.red, label: "REJECTED" },
  };
  const s = map[status] || map.suitable;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 7px",
        borderRadius: "8px",
        fontSize: "7px",
        fontWeight: 800,
        letterSpacing: "0.4px",
        background: s.bg,
        color: C.white,
      }}
    >
      {s.label}
    </span>
  );
}

function VelocityTag({ status }: { status: string }) {
  const map: Record<string, { dot: string; label: string }> = {
    "too-low": { dot: "#2563eb", label: "Low" },
    optimal: { dot: "#059669", label: "Opt" },
    valid: { dot: "#d97706", label: "OK" },
    "too-high": { dot: "#dc2626", label: "High" },
  };
  const v = map[status] || map.valid;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        fontSize: "7px",
        fontWeight: 700,
        color: C.g600,
        background: C.g100,
        padding: "1px 5px",
        borderRadius: "6px",
      }}
    >
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: v.dot }} />
      {v.label}
    </span>
  );
}

function AccuracyBar({ distance }: { distance: number }) {
  const pct = Math.round((1 - Math.min(1, distance)) * 100);
  const bg =
    distance <= 0.15 ? C.g700 :
    distance <= 0.3 ? "#6b7280" :
    distance <= 0.5 ? "#9ca3af" : "#d1d5db";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "7px", color: C.g500 }}>
      <span style={{ display: "inline-block", width: "24px", height: "4px", background: C.g200, borderRadius: "2px", overflow: "hidden" }}>
        <span style={{ display: "block", width: `${pct}%`, height: "100%", background: bg, borderRadius: "2px" }} />
      </span>
      {pct}%
    </span>
  );
}

function SizeTag({ status, best }: { status: string; best?: boolean }) {
  if (status === "optimal") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "3px",
          padding: "1px 6px",
          borderRadius: "6px",
          fontSize: "7px",
          fontWeight: 800,
          background: C.g900,
          color: C.white,
        }}
      >
        {best && "▸ "}★ OPTIMAL
      </span>
    );
  }
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 6px",
        borderRadius: "6px",
        fontSize: "7px",
        fontWeight: 700,
        background: C.g100,
        color: C.g600,
      }}
    >
      {best ? "▸ VALID" : "VALID"}
    </span>
  );
}

const num: React.CSSProperties = {
  padding: "3px 6px",
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
  color: C.g600,
  fontWeight: 600,
};
