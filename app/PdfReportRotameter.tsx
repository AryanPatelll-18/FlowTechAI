import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { CalculatorState } from "../hooks/useCalculator";

interface PdfReportRotameterProps {
  state: CalculatorState;
}

// ─── Flowtech Brand Palette ──────────────────────────────────────────
const C = {
  red: "#e50019",
  redDark: "#b80014",
  redLight: "#fef2f2",
  redHover: "#dc2626",
  grey950: "#0a0a0a",
  grey900: "#171717",
  grey800: "#262626",
  grey700: "#404040",
  grey600: "#525252",
  grey500: "#737373",
  grey400: "#a3a3a3",
  grey300: "#d4d4d4",
  grey200: "#e5e5e5",
  grey100: "#f5f5f5",
  grey50: "#fafafa",
  white: "#ffffff",
  border: "#e5e5e5",
  borderLight: "#f0f0f0",
};

export default function PdfReportRotameter({ state }: PdfReportRotameterProps) {
  const [portalReady, setPortalReady] = useState(false);
  const portalRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = document.createElement("div");
    el.id = "pdf-portal-rotameter-root";
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

  const fluidName = state.selectedLiquid?.name || "Custom Liquid";
  const flowM3hr = state.unitConversion?.convertedValue
    ? state.unitConversion.convertedValue.toFixed(2)
    : state.flowUnit === "m³/hr"
    ? state.flowRateMax.toFixed(2)
    : "—";

  const [selectedSizes, setSelectedSizes] = useState<Record<string, boolean>>({});
  const toggleSize = (key: string) => setSelectedSizes((p) => ({ ...p, [key]: !p[key] }));

  const rtResults = state.rotameterResults;

  const reportContent = (
    <div id="pdf-report-rotameter">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          #root { display: none !important; }
          #pdf-portal-rotameter-root { display: block !important; }
          #pdf-report-rotameter > div > div { page-break-inside: avoid !important; }
          body { background: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @media screen { #pdf-portal-rotameter-root { display: none !important; } }
      `}</style>

      <div
        style={{
          fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
          fontSize: "9px",
          lineHeight: 1.4,
          color: C.grey800,
          width: "100%",
        }}
      >
        {/* ═══════ HEADER ═══════ */}
        <div
          style={{
            background: `linear-gradient(135deg, ${C.grey900} 0%, ${C.grey800} 100%)`,
            borderRadius: "6px",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <img
              src="/flowtech_logo.png"
              alt="Flowtech"
              style={{ height: "38px", width: "auto", objectFit: "contain" }}
            />
            <div style={{ borderLeft: `3px solid ${C.red}`, paddingLeft: "12px" }}>
              <div style={{ color: C.white, fontSize: "15px", fontWeight: 800, letterSpacing: "0.3px" }}>
                Glass Tube Rotameter Sizing Report
              </div>
              <div style={{ color: C.grey400, fontSize: "8px", marginTop: "2px" }}>
                Variable Area Flowmeter · Factory Qmin/Qmax Data
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: C.red, fontSize: "9px", fontWeight: 800, letterSpacing: "1.5px" }}>
              FLOWTECH
            </div>
            <div style={{ color: C.grey400, fontSize: "7px", marginTop: "3px" }}>{dateStr}</div>
            <div style={{ color: C.grey500, fontSize: "7px" }}>flowtech-instruments.com</div>
          </div>
        </div>

        {/* ═══════ SECTION 1: PROCESS PARAMETERS ═══════ */}
        <div
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: "5px",
            overflow: "hidden",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, ${C.red}, ${C.redDark})`,
              color: C.white,
              padding: "5px 14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                background: "rgba(255,255,255,0.2)",
                fontSize: "8px",
                fontWeight: 800,
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              1
            </span>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>
              PROCESS PARAMETERS
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "1px", background: C.border }}>
            {[
              { label: "Service", value: "Liquid" },
              { label: "Meter Type", value: "Variable Area (Rotameter)" },
              { label: "Fluid", value: fluidName, bold: true },
              { label: "Flow Range", value: `${state.flowRateMin} – ${state.flowRateMax} ${state.flowUnit}`, bold: true },
              { label: "Pressure", value: `${state.liquidPressureBarAbs.toFixed(3)} bar abs`, bold: true },
              { label: "Temperature", value: `${state.operatingTemp} °C` },
              { label: "Flow (m³/hr)", value: flowM3hr },
              { label: "Max Temp Limit", value: "93°C (borosilicate glass)" },
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  background: p.bold ? C.redLight : C.white,
                  padding: "6px 8px",
                }}
              >
                <div
                  style={{
                    fontSize: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    color: C.grey500,
                    fontWeight: 700,
                    marginBottom: "2px",
                  }}
                >
                  {p.label}
                </div>
                <div
                  style={{
                    fontSize: p.value.length > 14 ? "8px" : "9px",
                    fontWeight: p.bold ? 700 : 600,
                    color: p.bold ? C.redDark : C.grey700,
                    lineHeight: 1.2,
                  }}
                >
                  {p.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ SECTION 2: ROTAMETER SIZE SELECTION ═══════ */}
        <div
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: "5px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, ${C.grey800}, ${C.grey900})`,
              color: C.white,
              padding: "5px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  background: "rgba(255,255,255,0.15)",
                  fontSize: "8px",
                  fontWeight: 800,
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                2
              </span>
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>
                GLASS TUBE ROTAMETERS — SIZE SELECTION TABLES
              </span>
            </div>
            <span style={{ fontSize: "7px", color: C.grey400 }}>★ = Optimal · 10:1 turndown · Tick to select</span>
          </div>

          {rtResults.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: C.grey500 }}>No Rotameter Data</div>
          ) : (
            <div style={{ padding: "10px 12px" }}>
              {rtResults.map((rt, ri) => {
                const goodSizes = rt.sizes.filter((s) => s.status === "optimal" || s.status === "valid");
                const isSs316 = ri === 0;

                return (
                  <div
                    key={rt.product.name}
                    style={{
                      marginBottom: ri < rtResults.length - 1 ? "8px" : "0",
                      border: `1px solid ${C.border}`,
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Product header */}
                    <div
                      style={{
                        background: isSs316 ? C.grey100 : C.grey50,
                        padding: "6px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: `2px solid ${isSs316 ? C.grey300 : C.red}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: isSs316 ? C.grey600 : C.red,
                          }}
                        />
                        <span style={{ fontSize: "11px", fontWeight: 800, color: C.grey900 }}>
                          {rt.product.name}
                        </span>
                        <span
                          style={{
                            fontSize: "7px",
                            color: C.white,
                            background: C.red,
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontWeight: 800,
                            letterSpacing: "0.5px",
                          }}
                        >
                          {rt.product.accuracy}% FSD
                        </span>
                        <span
                          style={{
                            fontSize: "7px",
                            color: C.grey500,
                            background: C.white,
                            padding: "1px 8px",
                            borderRadius: "10px",
                            border: `1px solid ${C.border}`,
                            fontWeight: 600,
                          }}
                        >
                          Liquid
                        </span>
                      </div>
                      {rt.bestSize && (
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 800,
                            color: C.red,
                            background: C.redLight,
                            padding: "2px 10px",
                            borderRadius: "10px",
                          }}
                        >
                          ★ Recommended: {rt.bestSize}
                        </span>
                      )}
                    </div>

                    {/* Classy grey table */}
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "8px",
                      }}
                    >
                      <thead>
                        <tr style={{ background: C.grey50 }}>
                          {[
                            { label: "PG Code", align: "left", w: "10%" },
                            { label: "Process Connection", align: "left", w: "16%" },
                            { label: "Qmin", align: "right", w: "11%" },
                            { label: "Qmax", align: "right", w: "11%" },
                            { label: "Turndown", align: "center", w: "9%" },
                            { label: "ΔP (bar)", align: "right", w: "11%" },
                            { label: "Status", align: "center", w: "12%" },
                            { label: "☑", align: "center", w: "8%" },
                          ].map((h) => (
                            <th
                              key={h.label}
                              style={{
                                padding: "5px 8px",
                                fontWeight: 700,
                                color: C.grey600,
                                fontSize: "7px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                textAlign: h.align as "left" | "center" | "right",
                                borderBottom: `2px solid ${C.grey300}`,
                                background: C.grey50,
                              }}
                            >
                              {h.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(goodSizes.length > 0 ? goodSizes : rt.sizes.slice(0, 3)).map((size, idx) => {
                          const selKey = `${rt.product.name}-${size.size}`;
                          const isSelected = selectedSizes[selKey] ?? size.status === "optimal";
                          const isOptimal = size.status === "optimal";

                          return (
                            <tr
                              key={size.size}
                              style={{
                                background: isOptimal ? C.redLight : idx % 2 ? C.grey50 : C.white,
                                borderBottom: `1px solid ${C.borderLight}`,
                              }}
                            >
                              <td
                                style={{
                                  padding: "5px 8px",
                                  fontWeight: 800,
                                  fontFamily: "monospace",
                                  fontSize: "10px",
                                  color: isOptimal ? C.redDark : C.grey700,
                                }}
                              >
                                {rt.bestSize === size.size && (
                                  <span style={{ color: C.red, marginRight: "3px", fontSize: "9px" }}>▸</span>
                                )}
                                {size.size}
                                {isOptimal && <span style={{ color: C.red, marginLeft: "3px" }}>★</span>}
                              </td>
                              <td
                                style={{
                                  padding: "5px 8px",
                                  fontSize: "8px",
                                  color: C.grey500,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {size.processConnection || "—"}
                              </td>
                              <td style={num}>{size.qMin.toFixed(3)}</td>
                              <td style={num}>{size.qMax.toFixed(2)}</td>
                              <td
                                style={{
                                  padding: "5px 8px",
                                  textAlign: "center",
                                  fontWeight: 700,
                                  fontSize: "8px",
                                  color: C.grey600,
                                }}
                              >
                                10:1
                              </td>
                              <td style={{ ...num, fontSize: "8px" }}>
                                {size.dpAtInput < 0.001 ? "<0.001" : size.dpAtInput.toFixed(3)}
                              </td>
                              <td style={{ padding: "5px 8px", textAlign: "center" }}>
                                {isOptimal ? (
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "2px 8px",
                                      borderRadius: "10px",
                                      fontSize: "7px",
                                      fontWeight: 800,
                                      background: C.red,
                                      color: C.white,
                                      letterSpacing: "0.3px",
                                    }}
                                  >
                                    ★ OPTIMAL
                                  </span>
                                ) : size.status === "valid" ? (
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "2px 8px",
                                      borderRadius: "10px",
                                      fontSize: "7px",
                                      fontWeight: 700,
                                      background: C.grey200,
                                      color: C.grey600,
                                    }}
                                  >
                                    VALID
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "2px 8px",
                                      borderRadius: "10px",
                                      fontSize: "7px",
                                      fontWeight: 600,
                                      background: C.grey100,
                                      color: C.grey400,
                                    }}
                                  >
                                    {size.status.toUpperCase()}
                                  </span>
                                )}
                              </td>
                              <td
                                style={{
                                  padding: "5px 8px",
                                  textAlign: "center",
                                  borderLeft: `1px solid ${C.border}`,
                                }}
                              >
                                <div
                                  onClick={() => toggleSize(selKey)}
                                  style={{
                                    width: "14px",
                                    height: "14px",
                                    border: `1.5px solid ${isSelected ? C.red : C.grey300}`,
                                    borderRadius: "3px",
                                    margin: "0 auto",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    background: isSelected ? C.red : C.white,
                                  }}
                                >
                                  {isSelected && (
                                    <span style={{ color: C.white, fontSize: "10px", fontWeight: 800 }}>
                                      ✓
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Footer note */}
                    <div
                      style={{
                        background: C.grey50,
                        padding: "3px 10px",
                        fontSize: "6px",
                        color: C.grey500,
                        borderTop: `1px solid ${C.borderLight}`,
                      }}
                    >
                      Unit: {rt.sizes[0]?.unit || "—"} · Accuracy: ±{rt.product.accuracy}% FSD · 10:1 turndown · ΔP at input flow · Vertical installation only
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══════ FOOTER ═══════ */}
        <div
          style={{
            marginTop: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 14px",
            background: C.grey50,
            borderRadius: "4px",
            border: `1px solid ${C.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src="/flowtech_logo.png" alt="Flowtech" style={{ height: "14px", width: "auto", opacity: 0.5 }} />
            <span style={{ fontSize: "7px", color: C.grey500, fontWeight: 500 }}>
              Flowtech Instruments (I) Pvt. Ltd. · flowtech-instruments.com
            </span>
          </div>
          <span style={{ fontSize: "6px", color: C.grey400 }}>
            Glass Tube Rotameters · Variable Area · Factory Qmin/Qmax · {dateStr}
          </span>
        </div>
      </div>
    </div>
  );

  if (!portalReady || !portalRootRef.current) return null;
  return createPortal(reportContent, portalRootRef.current);
}

const num: React.CSSProperties = {
  padding: "5px 8px",
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
  color: "#525252",
  fontWeight: 600,
};
