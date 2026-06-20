// ============================================================
// usePressureCalculator — Hook for Pressure Device Selection (Phase IV)
// ============================================================

import { useState, useCallback, useMemo } from "react";
import {
  selectPressureDevices,
  validatePressureInputs,
  type PressureSelectionInput,
  type PressureDeviceRecommendation,
  type PressureValidationResult,
} from "../data/pressureDeviceEngine";
import type { PressureMeasurementType } from "../data/pressureDeviceDatabase";

export interface PressureCalculatorState {
  // Process conditions
  processPressureBar: number;
  processPressureType: PressureMeasurementType;
  processTempC: number;
  ambientTempC: number;
  fluidType: "liquid" | "gas" | "steam";
  // Fluid property flags
  isCorrosive: boolean;
  isViscous: boolean;
  isCrystallizing: boolean;
  isPulsating: boolean;
  isHazardousArea: boolean;
  // Application
  application: "pressure" | "flow_dp" | "level_dp" | "filter_monitoring" | "general";
  // Preferences
  requiredAccuracy: "standard" | "high" | "very_high";
  outputPreference: "4_20mA" | "hart" | "fieldbus" | "any";
  needsDisplay: boolean;
  // Results
  recommendations: PressureDeviceRecommendation[];
  validation: PressureValidationResult | null;
  calculated: boolean;
}

const INITIAL_PRESSURE_STATE: PressureCalculatorState = {
  processPressureBar: 10,
  processPressureType: "gauge",
  processTempC: 60,
  ambientTempC: 40,
  fluidType: "liquid",
  isCorrosive: false,
  isViscous: false,
  isCrystallizing: false,
  isPulsating: false,
  isHazardousArea: false,
  application: "pressure",
  requiredAccuracy: "standard",
  outputPreference: "any",
  needsDisplay: true,
  recommendations: [],
  validation: null,
  calculated: false,
};

export function usePressureCalculator() {
  const [state, setState] = useState<PressureCalculatorState>(INITIAL_PRESSURE_STATE);

  // ─── Setters ─────────────────────────────────────────────────────────
  const setProcessPressure = useCallback((v: number) =>
    setState((p) => ({ ...p, processPressureBar: v, calculated: false })), []);
  const setProcessPressureType = useCallback((v: PressureMeasurementType) =>
    setState((p) => ({ ...p, processPressureType: v, calculated: false })), []);
  const setProcessTemp = useCallback((v: number) =>
    setState((p) => ({ ...p, processTempC: v, calculated: false })), []);
  const setAmbientTemp = useCallback((v: number) =>
    setState((p) => ({ ...p, ambientTempC: v, calculated: false })), []);
  const setFluidType = useCallback((v: "liquid" | "gas" | "steam") =>
    setState((p) => ({ ...p, fluidType: v, calculated: false })), []);
  const setApplication = useCallback((v: PressureCalculatorState["application"]) =>
    setState((p) => ({ ...p, application: v, calculated: false })), []);
  const setRequiredAccuracy = useCallback((v: PressureCalculatorState["requiredAccuracy"]) =>
    setState((p) => ({ ...p, requiredAccuracy: v, calculated: false })), []);
  const setOutputPreference = useCallback((v: PressureCalculatorState["outputPreference"]) =>
    setState((p) => ({ ...p, outputPreference: v, calculated: false })), []);
  const toggleFlag = useCallback((flag: keyof PressureCalculatorState) =>
    setState((p) => ({ ...p, [flag]: !p[flag], calculated: false } as PressureCalculatorState)), []);

  // ─── Calculate ───────────────────────────────────────────────────────
  const calculate = useCallback(() => {
    const input: PressureSelectionInput = {
      processPressureBar: state.processPressureBar,
      processPressureType: state.processPressureType,
      processTempC: state.processTempC,
      ambientTempC: state.ambientTempC,
      fluidType: state.fluidType,
      isCorrosive: state.isCorrosive,
      isViscous: state.isViscous,
      isCrystallizing: state.isCrystallizing,
      isPulsating: state.isPulsating,
      isHazardousArea: state.isHazardousArea,
      application: state.application,
      requiredAccuracy: state.requiredAccuracy,
      outputPreference: state.outputPreference,
      needsDisplay: state.needsDisplay,
    };

    const validation = validatePressureInputs(input);
    if (!validation.isValid) {
      setState((p) => ({ ...p, validation, calculated: true, recommendations: [] }));
      return;
    }

    const recommendations = selectPressureDevices(input);
    setState((p) => ({ ...p, validation, recommendations, calculated: true }));
  }, [state]);

  // ─── Reset ───────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setState(INITIAL_PRESSURE_STATE);
  }, []);

  // ─── Computed ────────────────────────────────────────────────────────
  const bestDevices = useMemo(
    () => state.recommendations.filter((r) => r.status === "best"),
    [state.recommendations]
  );
  const suitableDevices = useMemo(
    () => state.recommendations.filter((r) => r.status === "suitable"),
    [state.recommendations]
  );
  const rejectedDevices = useMemo(
    () => state.recommendations.filter((r) => r.status === "rejected"),
    [state.recommendations]
  );

  return {
    state,
    setProcessPressure,
    setProcessPressureType,
    setProcessTemp,
    setAmbientTemp,
    setFluidType,
    setApplication,
    setRequiredAccuracy,
    setOutputPreference,
    toggleFlag,
    calculate,
    reset,
    bestDevices,
    suitableDevices,
    rejectedDevices,
  };
}
