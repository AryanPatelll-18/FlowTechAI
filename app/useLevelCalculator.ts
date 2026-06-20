// ============================================================
// useLevelCalculator — Hook for Level Device Selection (Phase III)
// ============================================================

import { useState, useCallback, useMemo } from "react";
import {
  selectLevelDevices,
  validateLevelInputs,
  type LevelSelectionInput,
  type LevelDeviceRecommendation,
  type LevelValidationResult,
} from "../data/levelDeviceEngine";
import type { LevelOutputType } from "../data/levelDeviceDatabase";
import type { LiquidData } from "../data/liquids";
import { calculateDensityAtTemp, calculateViscosityAtTemp } from "../data/fluidValidation";

export interface LevelCalculatorState {
  // Process conditions
  measuringRangeMm: number;
  processPressureBar: number;
  processTempC: number;
  fluidDensityKgM3: number;
  fluidViscosityCp: number;
  // Selected liquid
  selectedLiquid: LiquidData | null;
  // Fluid property flags
  isDirty: boolean;
  isViscous: boolean;
  isCorrosive: boolean;
  isFoamy: boolean;
  isTurbulent: boolean;
  isSlurry: boolean;
  isCryogenic: boolean;
  hasFerrousParticles: boolean;
  containsHydrocarbons: boolean;
  isColored: boolean;
  // Preferences
  requiredOutput: LevelOutputType | "any";
  mountingPreference: "side" | "top" | "external" | "any";
  needsVisualIndication: boolean;
  // Results
  recommendations: LevelDeviceRecommendation[];
  validation: LevelValidationResult | null;
  calculated: boolean;
}

const INITIAL_LEVEL_STATE: LevelCalculatorState = {
  measuringRangeMm: 1500,
  processPressureBar: 10,
  processTempC: 80,
  fluidDensityKgM3: 1000,
  fluidViscosityCp: 1,
  selectedLiquid: null,
  isDirty: false,
  isViscous: false,
  isCorrosive: false,
  isFoamy: false,
  isTurbulent: false,
  isSlurry: false,
  isCryogenic: false,
  hasFerrousParticles: false,
  containsHydrocarbons: false,
  isColored: false,
  requiredOutput: "any",
  mountingPreference: "any",
  needsVisualIndication: true,
  recommendations: [],
  validation: null,
  calculated: false,
};

export function useLevelCalculator() {
  const [state, setState] = useState<LevelCalculatorState>(INITIAL_LEVEL_STATE);

  // ─── Setters ─────────────────────────────────────────────────────────
  const setMeasuringRange = useCallback((v: number) =>
    setState((p) => ({ ...p, measuringRangeMm: v, calculated: false })), []);
  const setProcessPressure = useCallback((v: number) =>
    setState((p) => ({ ...p, processPressureBar: v, calculated: false })), []);
  const setProcessTemp = useCallback((temp: number) => {
    setState((prev) => {
      let newDensity = prev.fluidDensityKgM3;
      let newViscosity = prev.fluidViscosityCp;
      if (prev.selectedLiquid) {
        const d = calculateDensityAtTemp(prev.selectedLiquid, temp);
        const v = calculateViscosityAtTemp(prev.selectedLiquid, temp);
        newDensity = d.density;
        newViscosity = v.viscosity;
      }
      return {
        ...prev,
        processTempC: temp,
        fluidDensityKgM3: newDensity,
        fluidViscosityCp: newViscosity,
        isCryogenic: temp < -40,
        calculated: false,
      };
    });
  }, []);
  const setFluidDensity = useCallback((v: number) =>
    setState((p) => ({ ...p, fluidDensityKgM3: v, calculated: false })), []);
  const setFluidViscosity = useCallback((v: number) =>
    setState((p) => ({ ...p, fluidViscosityCp: v, calculated: false })), []);
  const setSelectedLiquid = useCallback((liquid: LiquidData | null) => {
    if (!liquid) {
      setState((p) => ({ ...p, selectedLiquid: null, fluidDensityKgM3: 1000, fluidViscosityCp: 1, calculated: false }));
      return;
    }
    setState((prev) => {
      const temp = prev.processTempC;
      let density = liquid.density;
      let viscosity = liquid.viscosity;
      if (temp !== 20) {
        const d = calculateDensityAtTemp(liquid, temp);
        const v = calculateViscosityAtTemp(liquid, temp);
        density = d.density;
        viscosity = v.viscosity;
      }
      return {
        ...prev,
        selectedLiquid: liquid,
        fluidDensityKgM3: density,
        fluidViscosityCp: viscosity,
        isCryogenic: liquid.category === "Cryogenic" || temp < -40,
        containsHydrocarbons: liquid.category === "Fuel" || liquid.category === "Oil" || liquid.name.toLowerCase().includes("hydrocarbon"),
        isCorrosive: liquid.category === "Acid" || liquid.category === "Alkali",
        calculated: false,
      };
    });
  }, []);
  const setRequiredOutput = useCallback((v: LevelOutputType | "any") =>
    setState((p) => ({ ...p, requiredOutput: v, calculated: false })), []);
  const setMountingPreference = useCallback((v: "side" | "top" | "external" | "any") =>
    setState((p) => ({ ...p, mountingPreference: v, calculated: false })), []);
  const toggleFlag = useCallback((flag: keyof LevelCalculatorState) =>
    setState((p) => ({ ...p, [flag]: !p[flag], calculated: false } as LevelCalculatorState)), []);

  // ─── Calculate ───────────────────────────────────────────────────────
  const calculate = useCallback(() => {
    const input: LevelSelectionInput = {
      measuringRangeMm: state.measuringRangeMm,
      processPressureBar: state.processPressureBar,
      processTempC: state.processTempC,
      fluidDensityKgM3: state.fluidDensityKgM3,
      fluidViscosityCp: state.fluidViscosityCp,
      isDirty: state.isDirty,
      isViscous: state.isViscous,
      isCorrosive: state.isCorrosive,
      isFoamy: state.isFoamy,
      isTurbulent: state.isTurbulent,
      isSlurry: state.isSlurry,
      isCryogenic: state.isCryogenic,
      hasFerrousParticles: state.hasFerrousParticles,
      containsHydrocarbons: state.containsHydrocarbons,
      isColored: state.isColored,
      requiredOutput: state.requiredOutput,
      mountingPreference: state.mountingPreference,
      needsVisualIndication: state.needsVisualIndication,
    };

    const validation = validateLevelInputs(input);
    if (!validation.isValid) {
      setState((p) => ({ ...p, validation, calculated: true, recommendations: [] }));
      return;
    }

    const recommendations = selectLevelDevices(input);
    setState((p) => ({ ...p, validation, recommendations, calculated: true }));
  }, [state]);

  // ─── Reset ───────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setState(INITIAL_LEVEL_STATE);
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
    setMeasuringRange,
    setProcessPressure,
    setProcessTemp,
    setFluidDensity,
    setFluidViscosity,
    setSelectedLiquid,
    setRequiredOutput,
    setMountingPreference,
    toggleFlag,
    calculate,
    reset,
    bestDevices,
    suitableDevices,
    rejectedDevices,
  };
}
