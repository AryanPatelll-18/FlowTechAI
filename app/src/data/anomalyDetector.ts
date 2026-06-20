// ============================================================
// Process Condition Anomaly Detector — UNIVERSAL (All Services)
// Covers: Liquids, Gas, Steam, Pressure, Level Devices
// Physics-based validation that flags impossible/dangerous conditions
// ============================================================

import { getFluidCriticalData, isFluidBoiling, waterSaturationTempC } from "./fluidCriticalProperties";
import { LIQUIDS_DB } from "./liquids";
import { type LevelDeviceData } from "./levelDeviceDatabase";
import { checkGasWetness } from "./gasCondensation";
import { getSaturationTemp } from "./steamTable";
import { PIPE_DIMENSIONS } from "./pipeDimensions";

// ─── Flow Unit Conversion Helper ─────────────────────────────────────────
// Converts user flow rate to m³/hr for correct velocity calculation
function toM3hr(flowRate: number, unit: string, density?: number): number {
  switch (unit) {
    case "m³/hr": return flowRate;
    case "lph": return flowRate / 1000;
    case "lpm": return flowRate * 0.06;
    case "kg/hr": return density && density > 0 ? flowRate / density : 0;
    case "CFM": return flowRate * 1.699;
    case "Nm³/hr": return density && density > 0 ? (flowRate * 1.205) / density : flowRate;
    default: return flowRate;
  }
}

export type AnomalySeverity = "critical" | "warning" | "info";

export interface ProcessAnomaly {
  severity: AnomalySeverity;
  code: string;
  title: string;
  message: string;
  affectedDevices?: string[];
  suggestion?: string;
}

// ─── UNIVERSAL FLOW ANOMALIES (Liquid + Gas + Steam) ────────────────────

export interface FlowSizingAnomalyInput {
  service: "liquid" | "gas" | "steam";
  fluidName?: string;
  processTempC: number;
  processPressureBar: number;
  fluidDensityKgM3: number;
  fluidViscosityCp: number;
  flowRate: number;
  flowUnit: string; // e.g. "m³/hr", "GPM", "kg/hr" — required for velocity conversion
  pipeSizeNominal?: string; // e.g. "DN80" — enables velocity checks
  qMin: number;
  qMax: number;
  meterType?: string;
  // Gas-specific
  selectedGasName?: string;
  // Steam-specific
  steamState?: string;
}

export function detectFlowSizingAnomalies(input: FlowSizingAnomalyInput): ProcessAnomaly[] {
  const anomalies: ProcessAnomaly[] = [];
  const fluid = input.fluidName ? getFluidCriticalData(input.fluidName) : undefined;

  // ─── SERVICE-AGNOSTIC CHECKS ─────────────────────────────────

  // 1. Qmax < Qmin
  if (input.qMax <= input.qMin) {
    anomalies.push({
      severity: "critical", code: "QMAX_LT_QMIN",
      title: "Flow Range Invalid: Qmax ≤ Qmin",
      message: `Maximum flow (${input.qMax}) must be GREATER than minimum flow (${input.qMin}). This is physically impossible.`,
      suggestion: `Swap the values: Qmin should be the normal low flow, Qmax should be the normal high flow. Qmax must be at least 1.5× Qmin for meter turndown.`,
    });
  }

  // 2b. Qmax exactly equal to Qmin — add specific note about turndown
  // Note: When qMax == qMin, QMAX_LT_QMIN already fires. We only add this
  // additional detail when qMax is strictly equal (not just close).
  if (input.qMax === input.qMin && input.qMax > 0) {
    anomalies.push({
      severity: "warning", code: "QMAX_EQ_QMIN",
      title: "Qmax Equals Qmin — No Turndown",
      message: `Maximum flow (${input.qMax}) exactly equals minimum flow (${input.qMin}). A flow meter requires a turndown ratio of at least 5:1.`,
      suggestion: `Specify a range: Qmin at normal low flow (e.g., 30% of max) and Qmax at peak flow (e.g., 100-120% of normal). Typical turndown: 10:1.`,
    });
  }

  // 3. Velocity checks (if pipe size provided)
  // CRITICAL FIX: Convert flow rate to m³/hr before velocity calculation
  // Previous code assumed qMax was always in m³/hr — wrong for GPM, kg/hr, L/hr, etc.
  if (input.pipeSizeNominal && input.qMax > 0 && input.fluidDensityKgM3 > 0) {
    const pipe = PIPE_DIMENSIONS[input.pipeSizeNominal];
    if (pipe) {
      const areaM2 = pipe.crossSectionalAreaM2;
      const qMaxM3hr = toM3hr(input.qMax, input.flowUnit, input.fluidDensityKgM3);
      const velocityMs = (qMaxM3hr / 3600) / areaM2;

      // ─── VELOCITY CHECKS (ADVISORY ONLY — NEVER BLOCKING) ───────────
      // The flowmeter sizing is based on FLOW RATE (Qmin/Qmax), NOT pipe size.
      // The client's pipe size is used ONLY for velocity reference. Even if the
      // pipe velocity is too high or too low, the correct meter size is determined
      // by the flow range. The recommended meter size may differ from the pipe size.
      if (velocityMs > 25) {
        anomalies.push({
          severity: "warning", code: "VELOCITY_EXTREME",
          title: `High Pipe Velocity: ${velocityMs.toFixed(1)} m/s`,
          message: `Flow velocity in client's ${input.pipeSizeNominal} pipe (${pipe.innerDiameterMm}mm ID) is ${velocityMs.toFixed(1)} m/s — exceeds recommended 25 m/s. This does NOT affect the flowmeter sizing — the meter is sized based on flow rate, not pipe size. The recommended meter size may differ from the pipe size.`,
          suggestion: `The recommended meter size is based on your flow range (${input.qMin}–${input.qMax} ${input.flowUnit}), not the pipe size. If the meter size differs from your pipe, use reducers/expanders. Consider pipe resizing for long-term operation.`,
        });
      } else if (velocityMs > 10) {
        anomalies.push({
          severity: "warning", code: "VELOCITY_HIGH",
          title: `Elevated Pipe Velocity: ${velocityMs.toFixed(1)} m/s`,
          message: `Flow velocity in client's ${input.pipeSizeNominal} pipe is ${velocityMs.toFixed(1)} m/s — above recommended 10 m/s. The flowmeter recommendation is based on flow rate only and is NOT affected by pipe velocity.`,
          suggestion: `The meter is sized for your flow range (${input.qMin}–${input.qMax} ${input.flowUnit}). The recommended meter size may differ from your pipe size — this is normal. Use reducers/expanders as needed.`,
        });
      } else if (velocityMs < 0.3) {
        anomalies.push({
          severity: "warning", code: "VELOCITY_LOW",
          title: `Low Pipe Velocity: ${velocityMs.toFixed(2)} m/s`,
          message: `Flow velocity in client's ${input.pipeSizeNominal} pipe is only ${velocityMs.toFixed(2)} m/s — below 0.3 m/s. The flowmeter sizing is based on your flow range, NOT the pipe velocity. The meter will still measure accurately.`,
          suggestion: `The meter is sized for your flow range (${input.qMin}–${input.qMax} ${input.flowUnit}), not the pipe size. The recommended meter size may be smaller than your pipe — this is correct sizing. Use reducers if needed.`,
        });
      }

      // Reynolds number check (uses already-converted velocityMs)
      if (input.fluidViscosityCp > 0 && input.service === "liquid") {
        const re = (velocityMs * (pipe.innerDiameterMm / 1000) * input.fluidDensityKgM3) / (input.fluidViscosityCp / 1000);
        if (re < 2300) {
          anomalies.push({
            severity: "warning", code: "LAMINAR_FLOW",
            title: `Laminar Flow (Re = ${Math.round(re)})`,
            message: `Reynolds number is ${Math.round(re)} — flow is LAMINAR (Re < 2300). Turbine and Vortex require turbulent flow (Re > 10000). EMF and Coriolis work in laminar flow.`,
            suggestion: `For turbulent flow: increase velocity (reduce pipe size) or reduce viscosity (heat the fluid). Or select EMF which works in both laminar and turbulent flow.`,
          });
        } else if (re < 10000) {
          anomalies.push({
            severity: "info", code: "TRANSITIONAL_FLOW",
            title: `Transitional Flow (Re = ${Math.round(re)})`,
            message: `Reynolds number ${Math.round(re)} is in transitional regime (2300–10000). Some meter types (especially Vortex) may have reduced accuracy.`,
            suggestion: `EMF and Coriolis meters are unaffected by flow regime. For Vortex/Turbine, ensure calibration covers the transitional range.`,
          });
        }
      }
    }
  }

  // ─── LIQUID-SPECIFIC CHECKS ──────────────────────────────────

  if (input.service === "liquid") {
    // 4. Non-conductive fluid — INFO advisory only
    // This affects ONLY EMF meter selection. Turbine, Vortex, Ultrasonic,
    // Oval Gear, and Rotameter do NOT require conductive fluid.
    // The sizing engine already rejects EMF for non-conductive fluids.
    // This anomaly is informational — user should simply avoid EMF.
    const liquid = LIQUIDS_DB.find((l) => l.name === input.fluidName);
    if (liquid && liquid.conductivity === false) {
      anomalies.push({
        severity: "info", code: "EMF_NON_CONDUCTIVE",
        title: `Non-Conductive Fluid — EMF Not Suitable`,
        message: `${input.fluidName} has very low electrical conductivity. EMF requires ≥5 μS/cm — EMF will be rejected by the sizing engine.`,
        suggestion: `Use Turbine, Vortex, Ultrasonic, Oval Gear, or Rotameter instead. These technologies do NOT require conductive fluid. Turbine is ideal for clean, low-viscosity fuels like ${input.fluidName}.`,
      });
    }
    if (liquid && liquid.conductivity === undefined && input.fluidName) {
      anomalies.push({
        severity: "info", code: "EMF_CONDUCTIVITY_UNKNOWN",
        title: `Conductivity Unknown — EMF May Not Work`,
        message: `Electrical conductivity of ${input.fluidName} is not in the database. EMF requires ≥5 μS/cm.`,
        suggestion: `If fluid conductivity is <5 μS/cm, use Turbine, Vortex, or Ultrasonic instead of EMF.`,
      });
    }

    // 5. Water density/temperature mismatch
    if ((input.fluidName === "Water" || input.fluidName === "Process Water" || input.fluidName === "Raw Water") &&
        input.processTempC > 30 && input.processTempC < 100) {
      const expectedDensity = 1000 - 0.6 * (input.processTempC - 20);
      const densityDiff = Math.abs(input.fluidDensityKgM3 - expectedDensity);
      if (densityDiff > 30) {
        anomalies.push({
          severity: "warning", code: "DENSITY_TEMP_MISMATCH",
          title: `Density/Temperature Mismatch for Water`,
          message: `Water at ${input.processTempC}°C should have density ~${Math.round(expectedDensity)} kg/m³, but ${input.fluidDensityKgM3} kg/m³ entered. Difference: ${Math.round(densityDiff)} kg/m³.`,
          suggestion: `Check if the fluid is actually water, or if dissolved solids are present. For pure water at ${input.processTempC}°C, use ~${Math.round(expectedDensity)} kg/m³.`,
        });
      }
    }

    // 6. Fluid boiling check
    if (fluid) {
      const isBoiling = isFluidBoiling(fluid, input.processTempC, input.processPressureBar);
      if (isBoiling) {
        anomalies.push({
          severity: "critical", code: "FLOW_FLUID_BOILING",
          title: "Fluid is Boiling — Flow Measurement Invalid",
          message: `${fluid.name} at ${input.processTempC}°C and ${input.processPressureBar} bar is ABOVE its boiling point. Two-phase flow (liquid + vapor) will give erratic and inaccurate flow readings.`,
          suggestion: `For two-phase flow: use Coriolis mass flow meter. Or install separator upstream. DO NOT use standard volumetric flow meters.`,
        });
      }
    }

    // 7. High viscosity for turbine/vortex
    if ((input.meterType === "turbine" || input.meterType === "vortex") && input.fluidViscosityCp > 50) {
      anomalies.push({
        severity: "warning", code: "HIGH_VISC_METER",
        title: `High Viscosity for ${input.meterType?.toUpperCase()} Meter`,
        message: `Fluid viscosity ${input.fluidViscosityCp} cP is high for ${input.meterType} meter. Viscous drag reduces accuracy and extends response time.`,
        suggestion: `For viscous fluids (>50 cP), use EMF or Oval Gear. Avoid Vortex and Turbine in viscous service.`,
      });
    }
  }

  // ─── GAS-SPECIFIC CHECKS ─────────────────────────────────────

  if (input.service === "gas" && input.selectedGasName) {
    // 8. Gas wetness / condensation check
    const wetness = checkGasWetness(input.selectedGasName, input.processTempC, input.processPressureBar);
    if (wetness.isWet) {
      anomalies.push({
        severity: "critical", code: "GAS_CONDENSATION",
        title: "Gas Condensation — Two-Phase Flow",
        message: `${wetness.message} Condensed liquid will cause severe measurement errors and potential damage to flowmeters.`,
        suggestion: `Increase temperature to at least ${Math.round((wetness.satTempC || 0) + 15)}°C (15°C margin above dew point). Or use a Coriolis meter that handles two-phase flow. Install knock-out drum upstream.`,
      });
    } else if (wetness.satTempC && wetness.marginC !== null && wetness.marginC < 15) {
      anomalies.push({
        severity: "warning", code: "GAS_NEAR_DEWPOINT",
        title: "Near Dew Point — Condensation Risk",
        message: `${input.selectedGasName} at ${input.processTempC}°C is only ${wetness.marginC.toFixed(1)}°C above its dew point (${wetness.satTempC.toFixed(1)}°C at ${input.processPressureBar} bar). Process upset could cause condensation.`,
        suggestion: `Maintain at least 15°C margin above dew point. Install temperature monitoring. Consider superheating the gas stream.`,
      });
    }

    // 9. Flammable gas temperature check — SAFETY ADVISORY only
    // These affect ENCLOSURE SELECTION, not measurement feasibility.
    // Vortex, Ultrasonic, Coriolis, Thermal mass can all measure flammable gases.
    const flammableGas = FLAMMABLE_GAS_DATA[input.selectedGasName];
    if (flammableGas) {
      if (input.processTempC >= flammableGas.autoIgnitionC) {
        anomalies.push({
          severity: "warning", code: "GAS_AUTO_IGNITION",
          title: `Above Auto-Ignition — Flameproof Required`,
          message: `${input.selectedGasName} AIT: ${flammableGas.autoIgnitionC}°C. Process ${input.processTempC}°C exceeds AIT. Auto-ignition possible without spark source.`,
          suggestion: `MANDATORY: Flameproof (Ex d) enclosure. Reduce temperature if possible. Verify ATEX/IECEx zone classification.`,
        });
      } else if (input.processTempC >= flammableGas.autoIgnitionC * 0.7) {
        anomalies.push({
          severity: "info", code: "GAS_NEAR_AUTO_IGNITION",
          title: `Approaching Auto-Ignition Temperature`,
          message: `${input.selectedGasName} AIT: ${flammableGas.autoIgnitionC}°C. Process ${input.processTempC}°C is ${Math.round(input.processTempC / flammableGas.autoIgnitionC * 100)}% of AIT.`,
          suggestion: `Flameproof-rated equipment required. Monitor for hot spots.`,
        });
      }

      // Flash point for gases that can liquefy
      if (flammableGas.flashPointC && input.processTempC >= flammableGas.flashPointC) {
        anomalies.push({
          severity: "warning", code: "GAS_ABOVE_FLASH",
          title: `Above Flash Point — Flameproof Required`,
          message: `${input.selectedGasName} flash point: ${flammableGas.flashPointC}°C. Process ${input.processTempC}°C exceeds this. Flammable vapor can ignite from any spark.`,
          suggestion: `Use Flameproof (Ex d) or Intrinsically Safe (Ex ia) enclosure. Ground all equipment. Check ATEX/IECEx zone rating.`,
        });
      }
    }

    // 10. Gas velocity warning (much higher than liquid)
    // CRITICAL FIX: Convert flow rate to m³/hr before velocity calculation
    if (input.pipeSizeNominal) {
      const pipe = PIPE_DIMENSIONS[input.pipeSizeNominal];
      if (pipe) {
        const qMaxM3hr = toM3hr(input.qMax, input.flowUnit, input.fluidDensityKgM3);
        const velMs = (qMaxM3hr / 3600) / pipe.crossSectionalAreaM2;
        // For gas, velocities can be much higher — Mach 0.3 ≈ 100 m/s for typical conditions
        // ADVISORY ONLY — gas velocity does NOT block flowmeter sizing
        if (velMs > 80) {
          anomalies.push({
            severity: "warning", code: "GAS_VELOCITY_EXTREME",
            title: `High Gas Velocity: ${velMs.toFixed(1)} m/s`,
            message: `Gas velocity in client's ${input.pipeSizeNominal} pipe is ${velMs.toFixed(1)} m/s — very high. The flowmeter sizing is based on flow rate (${input.qMin}–${input.qMax} ${input.flowUnit}), NOT pipe velocity.`,
            suggestion: `The meter is sized for your flow range. The recommended meter size may differ from your pipe — use reducers/expanders. For gas flow, consult factory if velocity exceeds 60 m/s.`,
          });
        } else if (velMs > 40) {
          anomalies.push({
            severity: "warning", code: "GAS_VELOCITY_HIGH",
            title: `Elevated Gas Velocity: ${velMs.toFixed(1)} m/s`,
            message: `Gas velocity in client's ${input.pipeSizeNominal} pipe is ${velMs.toFixed(1)} m/s — above typical 40 m/s. The flowmeter recommendation is based on flow rate only.`,
            suggestion: `The meter is sized for your flow range. Vortex tolerates higher gas velocities. Use reducers/expanders if meter size differs from pipe.`,
          });
        }
      }
    }
  }

  // ─── STEAM-SPECIFIC CHECKS ───────────────────────────────────

  if (input.service === "steam") {
    // 11. Steam table range check
    const satTemp = getSaturationTemp(input.processPressureBar);
    if (satTemp === null) {
      anomalies.push({
        severity: "critical", code: "STEAM_OUT_OF_RANGE",
        title: "Steam Pressure Out of Table Range",
        message: `Steam pressure ${input.processPressureBar} bar abs is outside the valid range of our steam tables (2–20 bar abs). Flow sizing cannot be performed.`,
        suggestion: `For pressures below 2 bar: consult factory for extended low-pressure steam data. For pressures above 20 bar: contact Flowtech engineering for high-pressure steam sizing.`,
      });
    } else {
      // 12. Wet steam check (temp below saturation at pressure)
      if (input.processTempC < satTemp - 2) {
        anomalies.push({
          severity: "critical", code: "STEAM_WET",
          title: "WET STEAM — Meter Damage Risk",
          message: `Steam temperature ${input.processTempC}°C is BELOW saturation temperature ${satTemp.toFixed(1)}°C at ${input.processPressureBar} bar. This is WET STEAM (contains liquid droplets).`,
          suggestion: `Wet steam destroys Vortex piezo sensors and erodes Turbine blades. MANDATORY: Install steam separator/trap upstream. Or increase temperature to at least ${Math.round(satTemp + 15)}°C for dry steam.`,
        });
      } else if (input.processTempC < satTemp + 10) {
        // 13. Marginally superheated — risk of condensation
        const superheat = input.processTempC - satTemp;
        anomalies.push({
          severity: "warning", code: "STEAM_LOW_SUPERHEAT",
          title: `Low Superheat: Only ${superheat.toFixed(1)}°C`,
          message: `Steam is only ${superheat.toFixed(1)}°C above saturation. Any pressure drop or heat loss will cause condensation (wet steam).`,
          suggestion: `Ensure at least 15°C superheat for reliable measurement. Install steam trap. Insulate pipework. Monitor for condensate formation.`,
        });
      }

      // 14. Very high superheat — check against Vortex limits
      if (input.processTempC > 400) {
        anomalies.push({
          severity: "warning", code: "STEAM_TEMP_EXTREME",
          title: `Extreme Steam Temperature: ${input.processTempC}°C`,
          message: `Steam temperature ${input.processTempC}°C exceeds the 400°C maximum rating for Vortex Flowmeter. Sensor damage and accuracy degradation will occur.`,
          suggestion: `Select a meter rated for high-temperature steam. Or install desuperheater to reduce temperature. Contact Flowtech for custom high-temp solution.`,
        });
      }
    }
  }

  return anomalies;
}

// ─── LEVEL DEVICE ANOMALY DETECTION ──────────────────────────────────────

export interface LevelAnomalyInput {
  measuringRangeMm: number;
  processPressureBar: number;
  processTempC: number;
  fluidDensityKgM3: number;
  fluidViscosityCp: number;
  fluidName?: string;
  isDirty: boolean;
  isViscous: boolean;
  isCorrosive: boolean;
  isFoamy: boolean;
  isTurbulent: boolean;
  isSlurry: boolean;
  isCryogenic: boolean;
  hasFerrousParticles: boolean;
}

export function detectLevelAnomalies(
  input: LevelAnomalyInput,
  devices: LevelDeviceData[]
): ProcessAnomaly[] {
  const anomalies: ProcessAnomaly[] = [];
  const fluid = input.fluidName ? getFluidCriticalData(input.fluidName) : undefined;

  // FLUID STATE ANOMALIES
  if (fluid) {
    const isBoiling = isFluidBoiling(fluid, input.processTempC, input.processPressureBar);
    if (isBoiling) {
      anomalies.push({
        severity: "critical", code: "FLUID_BOILING",
        title: "Fluid is Boiling / Vapor",
        message: `${fluid.name} at ${input.processTempC}°C and ${input.processPressureBar} bar is ABOVE its boiling point (${fluid.boilingPointC}°C at 1 atm). The fluid exists as VAPOR/GAS, not liquid.`,
        suggestion: `Reduce temperature below ${Math.round(fluid.boilingPointC)}°C or increase system pressure.`,
      });
    }
    if (!isBoiling && fluid.boilingPointC - input.processTempC < 10) {
      const satTemp = input.processPressureBar > 0 ? waterSaturationTempC(input.processPressureBar) : fluid.boilingPointC;
      anomalies.push({
        severity: "warning", code: "NEAR_BOILING",
        title: "Near Boiling Point — Flashing Risk",
        message: `${fluid.name} is within ${Math.round(fluid.boilingPointC - input.processTempC)}°C of its boiling point. At ${input.processPressureBar} bar, saturation is ~${Math.round(satTemp)}°C.`,
        suggestion: `Ensure no pressure drops exist. Add safety margin of 15°C below boiling point.`,
      });
    }
    if (input.processTempC <= fluid.freezingPointC) {
      anomalies.push({
        severity: "critical", code: "FLUID_FROZEN",
        title: "Fluid is Frozen / Solid",
        message: `${fluid.name} at ${input.processTempC}°C is at or below freezing point (${fluid.freezingPointC}°C).`,
        suggestion: `Increase temperature above ${Math.round(fluid.freezingPointC + 5)}°C or add trace heating.`,
      });
    }
    if (input.processTempC > fluid.freezingPointC && input.processTempC - fluid.freezingPointC < 5) {
      anomalies.push({
        severity: "warning", code: "NEAR_FREEZING",
        title: "Near Freezing Point",
        message: `${fluid.name} is within ${Math.round(input.processTempC - fluid.freezingPointC)}°C of freezing point (${fluid.freezingPointC}°C).`,
        suggestion: `Add trace heating or insulation.`,
      });
    }
    // Flash point check: Above flash point = flammable vapor can form
    // This is a SAFETY/ENCLOSURE advisory, NOT a measurement blocker.
    // Turbine, Vortex, EMF, Ultrasonic can all measure flammable fluids.
    // The requirement is Flameproof (Ex d) or Intrinsically Safe (Ex ia) enclosure.
    if (fluid.flashPointC !== undefined && input.processTempC >= fluid.flashPointC) {
      anomalies.push({
        severity: "warning", code: "ABOVE_FLASH_POINT",
        title: `Above Flash Point — Flameproof Enclosure Required`,
        message: `${fluid.name} flash point: ${fluid.flashPointC}°C. Process ${input.processTempC}°C is above flash point. Flammable vapor may be present. `,
        suggestion: `MANDATORY: Select Flameproof (Ex d) or Intrinsically Safe (Ex ia) enclosure. Standard weather-proof (WP) is NOT sufficient. Verify ATEX/IECEx zone classification with client.`,
      });
    }
    if (fluid.flashPointC !== undefined && input.processTempC < fluid.flashPointC && fluid.flashPointC - input.processTempC < 15) {
      anomalies.push({
        severity: "info", code: "NEAR_FLASH_POINT",
        title: `Approaching Flash Point`,
        message: `${fluid.name} flash point: ${fluid.flashPointC}°C. Process ${input.processTempC}°C is ${Math.round(fluid.flashPointC - input.processTempC)}°C below flash point.`,
        suggestion: `Flameproof enclosure recommended for safety margin. Check site explosion protection requirements.`,
      });
    }
    if (fluid.autoIgnitionC !== undefined && input.processTempC >= fluid.autoIgnitionC * 0.7) {
      anomalies.push({
        severity: "info", code: "NEAR_AUTO_IGNITION",
        title: `Approaching Auto-Ignition Temperature`,
        message: `${fluid.name} AIT: ${fluid.autoIgnitionC}°C. Process ${input.processTempC}°C is ${Math.round(input.processTempC / fluid.autoIgnitionC * 100)}% of AIT.`,
        suggestion: `Ensure all equipment rated for process temperature. Keep hot surfaces away from vapor space.`,
      });
    }
  }

  // Water at >100°C at atmospheric pressure
  if ((input.fluidName?.toLowerCase().includes("water") || !input.fluidName) &&
      input.processTempC > 100 && input.processPressureBar <= 1.1) {
    anomalies.push({
      severity: "critical", code: "WATER_STEAM",
      title: "Water is Steam at This Pressure",
      message: `Water at ${input.processTempC}°C and ${input.processPressureBar} bar is SUPERHEATED STEAM, not liquid.`,
      suggestion: `Reduce temperature below 100°C OR increase pressure. Use Steam Flow Meter for steam service.`,
    });
  }

  // C-C DISTANCE ANOMALIES
  for (const device of devices) {
    if (input.measuringRangeMm < device.minCCDistance) {
      anomalies.push({
        severity: "critical", code: "CC_BELOW_MINIMUM",
        title: `C-C Distance Too Small — ${device.shortName}`,
        message: `C-C distance ${input.measuringRangeMm}mm is below minimum ${device.minCCDistance}mm for ${device.shortName}.`,
        affectedDevices: [device.id],
        suggestion: `Increase C-C distance to at least ${device.minCCDistance}mm.`,
      });
    }
  }

  // DENSITY ANOMALIES
  const floatDeviceIds = devices.filter((d) => d.floatMoc && d.floatMoc.length > 0).map((d) => d.id);
  if (input.fluidDensityKgM3 < 400 && floatDeviceIds.length > 0) {
    anomalies.push({
      severity: "critical", code: "DENSITY_TOO_LOW_FLOAT",
      title: "Fluid Density Too Low for Float Devices",
      message: `Density ${input.fluidDensityKgM3} kg/m³ is below 400 kg/m³ — SS 316 float (~8000 kg/m³) will sink.`,
      affectedDevices: floatDeviceIds,
      suggestion: `Use non-contact devices (Radar, Ultrasonic).`,
    });
  } else if (input.fluidDensityKgM3 < 600 && floatDeviceIds.length > 0) {
    anomalies.push({
      severity: "warning", code: "DENSITY_LOW_FLOAT",
      title: "Low Density — Special Float Required",
      message: `Density ${input.fluidDensityKgM3} kg/m³ is below 600 kg/m³. Standard float may not provide sufficient buoyancy.`,
      affectedDevices: floatDeviceIds,
      suggestion: `Specify Titanium or PTFE-coated float.`,
    });
  }

  // COMBINATION ANOMALIES
  if (input.isSlurry) {
    const glassDeviceIds = devices.filter((d) => d.windowMoc && d.type !== "side_mounted_magnetic" && d.type !== "top_mounted_magnetic").map((d) => d.id);
    if (glassDeviceIds.length > 0) {
      anomalies.push({
        severity: "critical", code: "SLURRY_GLASS",
        title: "Slurry Will Destroy Glass Windows",
        message: `Slurry abrasive particles WILL scratch glass windows, making them unreadable within weeks.`,
        affectedDevices: glassDeviceIds,
        suggestion: `Use Magnetic Level Gauge or Radar Transmitter.`,
      });
    }
  }
  if (input.hasFerrousParticles) {
    const magneticDeviceIds = devices.filter((d) => d.type === "side_mounted_magnetic" || d.type === "top_mounted_magnetic").map((d) => d.id);
    if (magneticDeviceIds.length > 0) {
      anomalies.push({
        severity: "critical", code: "FERROUS_MAGNETIC",
        title: "Ferrous Particles Interfere with Magnetic Gauges",
        message: `Ferrous particles will be attracted to the magnetic field and cause FALSE readings.`,
        affectedDevices: magneticDeviceIds,
        suggestion: `Use Radar Transmitter or install magnetic strainer upstream.`,
      });
    }
  }
  if (input.isCorrosive && input.processTempC > 120 && input.processPressureBar > 25) {
    anomalies.push({
      severity: "warning", code: "EXTREME_CORROSIVE",
      title: "Extreme Corrosive Conditions",
      message: `Corrosive + high temp (${input.processTempC}°C) + high pressure (${input.processPressureBar} bar) = extremely aggressive.`,
      suggestion: `Consult Flowtech factory for special MOC. Consider Hastelloy C or Titanium.`,
    });
  }
  if (input.processPressureBar < 0) {
    anomalies.push({
      severity: "warning", code: "VACUUM_CONDITION",
      title: "Vacuum Condition",
      message: `Process pressure is ${input.processPressureBar} bar (vacuum). Gasket sealing issues likely.`,
      suggestion: `Verify vacuum-rated gaskets. Check fluid does not boil under vacuum.`,
    });
  }
  if (input.isCryogenic && fluid && fluid.boilingPointC > -50) {
    anomalies.push({
      severity: "info", code: "NOT_CRYOGENIC",
      title: "Fluid is Not Cryogenic",
      message: `${fluid.name} (BP: ${fluid.boilingPointC}°C) is NOT cryogenic. Standard devices are sufficient.`,
      suggestion: `Uncheck "Cryogenic" flag.`,
    });
  }
  if (!input.isCryogenic && fluid && fluid.boilingPointC < -50 && input.processTempC < fluid.boilingPointC + 10) {
    anomalies.push({
      severity: "critical", code: "CRYOGENIC_NOT_FLAGGED",
      title: "CRYOGENIC Fluid Detected",
      message: `${fluid.name} is CRYOGENIC (BP: ${fluid.boilingPointC}°C). Standard devices will FAIL.`,
      suggestion: `Check "Cryogenic" flag. Consult factory for special materials.`,
    });
  }

  return anomalies;
}

// ─── PRESSURE DEVICE ANOMALY DETECTION ──────────────────────────────────

export interface PressureAnomalyInput {
  processPressureBar: number;
  processTempC: number;
  fluidName?: string;
  isCorrosive: boolean;
  isHighViscosity: boolean;
  hasPulsation: boolean;
  hasVibration: boolean;
  diaphragmMaterial?: string;
  // Transmitter-specific
  transmitterType: "smart" | "differential" | "miniature" | "diaphragm_seal";
  maxPressureRating?: number; // bar
  minPressureRange?: number; // bar
}

export function detectPressureAnomalies(input: PressureAnomalyInput): ProcessAnomaly[] {
  const anomalies: ProcessAnomaly[] = [];

  // 1. Process pressure exceeds transmitter rating
  if (input.maxPressureRating && input.processPressureBar > input.maxPressureRating * 0.9) {
    if (input.processPressureBar > input.maxPressureRating) {
      anomalies.push({
        severity: "critical", code: "PRESSURE_EXCEEDS_RATING",
        title: "Process Pressure Exceeds Transmitter Rating",
        message: `Process pressure ${input.processPressureBar} bar EXCEEDS transmitter maximum rating of ${input.maxPressureRating} bar. Transmitter will be DESTROYED.`,
        suggestion: `Select a transmitter with higher pressure rating (at least 1.5× process pressure = ${Math.ceil(input.processPressureBar * 1.5)} bar). Or install a pressure snubber/rupture disc for overpressure protection.`,
      });
    } else {
      anomalies.push({
        severity: "warning", code: "PRESSURE_NEAR_RATING",
        title: "Process Pressure Near Transmitter Rating",
        message: `Process pressure ${input.processPressureBar} bar is at ${Math.round(input.processPressureBar / input.maxPressureRating * 100)}% of transmitter rating (${input.maxPressureRating} bar). No safety margin for pressure surges.`,
        suggestion: `Select next higher pressure rating for safety margin. Install pressure snubber to protect from water hammer / pressure spikes.`,
      });
    }
  }

  // 2. Process pressure below transmitter minimum range
  if (input.minPressureRange && input.processPressureBar < input.minPressureRange * 0.05) {
    anomalies.push({
      severity: "warning", code: "PRESSURE_TOO_LOW_FOR_RANGE",
      title: "Process Pressure Too Low for Selected Range",
      message: `Process pressure ${input.processPressureBar} bar is below 5% of transmitter minimum range (${input.minPressureRange} bar). Accuracy will be severely degraded.`,
      suggestion: `Select a transmitter with lower pressure range. Or use a different measurement principle (e.g., hydrostatic level instead of pressure transmitter for very low pressures).`,
    });
  }

  // 3. Extreme temperature for standard transmitter
  if (input.processTempC > 120) {
    anomalies.push({
      severity: "warning", code: "PRESSURE_TEMP_HIGH",
      title: `High Process Temperature: ${input.processTempC}°C`,
      message: `Process temperature ${input.processTempC}°C exceeds the 120°C typical limit for standard pressure transmitters. Electronics and sensor drift will occur.`,
      suggestion: `Use diaphragm seal with capillary filled with high-temperature fill fluid (e.g., silicone oil rated to 300°C). Or mount transmitter remotely with cooling element.`,
    });
  }
  if (input.processTempC > 200) {
    anomalies.push({
      severity: "critical", code: "PRESSURE_TEMP_EXTREME",
      title: `EXTREME Process Temperature: ${input.processTempC}°C`,
      message: `Process temperature ${input.processTempC}°C is EXTREME. Standard pressure transmitter electronics will fail. Sensor element may deform permanently.`,
      suggestion: `MANDATORY: Use diaphragm seal with remote mount. Select fill fluid rated for process temperature (e.g., Neobee M-20 to 220°C, Syltherm 800 to 400°C). Contact Flowtech for high-temp design review.`,
    });
  }
  if (input.processTempC < -40) {
    anomalies.push({
      severity: "warning", code: "PRESSURE_TEMP_CRYO",
      title: `Cryogenic Process Temperature: ${input.processTempC}°C`,
      message: `Process temperature ${input.processTempC}°C is below -40°C. Standard fill fluids will gel or crystallize. Electronics may fail.`,
      suggestion: `Use cryogenic-rated fill fluid (e.g., silicone oil DC200 for -40°C, or special low-temp fill for LNG applications). Remote mount transmitter in ambient environment.`,
    });
  }

  // 4. Corrosive process without proper diaphragm
  if (input.isCorrosive && !input.diaphragmMaterial) {
    anomalies.push({
      severity: "critical", code: "CORROSIVE_NO_DIAPHRAGM",
      title: "Corrosive Process — Diaphragm Material Not Specified",
      message: `Corrosive process fluid but no diaphragm material specified. Standard 316L SS wetted parts will CORRODE and fail.`,
      suggestion: `MANDATORY: Specify diaphragm material compatible with process fluid. Options: SS 316L (mild), Hastelloy C (strong acids), Monel (chlorides), Tantalum (HCl/HF), Titanium (seawater), Gold-plated (H₂S). Contact Flowtech for MOC selection chart.`,
    });
  }

  // 5. Pulsating pressure warning
  if (input.hasPulsation) {
    anomalies.push({
      severity: "warning", code: "PRESSURE_PULSATION",
      title: "Pulsating Pressure — Measurement Instability",
      message: `Pulsating pressure (pumps, compressors, reciprocating equipment) causes unstable readings and accelerates sensor wear.`,
      suggestion: `Install pressure snubber / pulsation damper upstream. Select transmitter with fast damping (adjustable response time). Use diaphragm seal with viscous fill fluid for natural damping.`,
    });
  }

  // 6. Vibration warning
  if (input.hasVibration) {
    anomalies.push({
      severity: "warning", code: "PRESSURE_VIBRATION",
      title: "High Vibration Environment — Sensor Fatigue",
      message: `High vibration can cause micro-cracks in sensor diaphragm, loose electrical connections, and erratic output signals.`,
      suggestion: `Use remote diaphragm seal to isolate transmitter from vibration. Ensure proper pipe support. Select transmitter with vibration-resistant design (solid-state piezo-resistive sensors preferred).`,
    });
  }

  // 7. Vacuum measurement warning
  if (input.processPressureBar < 0.1) {
    anomalies.push({
      severity: "info", code: "PRESSURE_VACUUM",
      title: "Vacuum / Very Low Pressure Measurement",
      message: `Process pressure ${input.processPressureBar} bar is near vacuum. Standard gauge pressure transmitters have poor accuracy in vacuum range.`,
      suggestion: `Consider absolute pressure transmitter instead of gauge pressure. Ensure diaphragm seal designed for vacuum (no fill fluid outgassing).`,
    });
  }

  return anomalies;
}

// ─── FLAMMABLE GAS DATA ─────────────────────────────────────────────────

interface FlammableGasData {
  autoIgnitionC: number;
  flashPointC?: number;
  lowerExplosiveLimit: number; // % vol in air
  upperExplosiveLimit: number;
}

const FLAMMABLE_GAS_DATA: Record<string, FlammableGasData> = {
  "Methane": { autoIgnitionC: 540, flashPointC: -188, lowerExplosiveLimit: 5.0, upperExplosiveLimit: 15.0 },
  "Methane (LNG)": { autoIgnitionC: 540, flashPointC: -188, lowerExplosiveLimit: 5.0, upperExplosiveLimit: 15.0 },
  "Natural Gas": { autoIgnitionC: 540, flashPointC: -188, lowerExplosiveLimit: 5.0, upperExplosiveLimit: 15.0 },
  "Liquefied Natural Gas": { autoIgnitionC: 540, flashPointC: -188, lowerExplosiveLimit: 5.0, upperExplosiveLimit: 15.0 },
  "Propane": { autoIgnitionC: 470, flashPointC: -104, lowerExplosiveLimit: 2.1, upperExplosiveLimit: 9.5 },
  "Butane": { autoIgnitionC: 405, flashPointC: -60, lowerExplosiveLimit: 1.8, upperExplosiveLimit: 8.4 },
  "Hydrogen": { autoIgnitionC: 520, flashPointC: undefined, lowerExplosiveLimit: 4.0, upperExplosiveLimit: 75.0 },
  "Hydrogen (H2)": { autoIgnitionC: 520, flashPointC: undefined, lowerExplosiveLimit: 4.0, upperExplosiveLimit: 75.0 },
  "Ammonia": { autoIgnitionC: 651, flashPointC: undefined, lowerExplosiveLimit: 15.0, upperExplosiveLimit: 28.0 },
  "Ammonia (NH3)": { autoIgnitionC: 651, flashPointC: undefined, lowerExplosiveLimit: 15.0, upperExplosiveLimit: 28.0 },
  "Ethylene": { autoIgnitionC: 450, flashPointC: -136, lowerExplosiveLimit: 2.7, upperExplosiveLimit: 36.0 },
  "Acetylene": { autoIgnitionC: 305, flashPointC: undefined, lowerExplosiveLimit: 2.5, upperExplosiveLimit: 100.0 },
  "Carbon Monoxide": { autoIgnitionC: 609, flashPointC: -191, lowerExplosiveLimit: 12.5, upperExplosiveLimit: 74.0 },
  "Hydrogen Sulfide": { autoIgnitionC: 260, flashPointC: -82, lowerExplosiveLimit: 4.3, upperExplosiveLimit: 45.5 },
};

// ─── UTILITY FUNCTIONS ───────────────────────────────────────────────────

export function filterAnomaliesBySeverity(
  anomalies: ProcessAnomaly[],
  minSeverity: AnomalySeverity
): ProcessAnomaly[] {
  const order: Record<AnomalySeverity, number> = { critical: 3, warning: 2, info: 1 };
  return anomalies.filter((a) => order[a.severity] >= order[minSeverity]);
}

export function getCriticalAnomalies(anomalies: ProcessAnomaly[]): ProcessAnomaly[] {
  return anomalies.filter((a) => a.severity === "critical");
}

export function hasBlockingAnomalies(anomalies: ProcessAnomaly[]): boolean {
  return anomalies.some((a) => a.severity === "critical");
}
