# Flowtech AI Flow Sizing Calculator — Comprehensive Audit Report

**Build Status:** Compiles Successfully
**Date:** 2026-05-24
**Files Audited:** 11 source files

---

## FINDING 1: LIQUIDS DATABASE — Duplicate Entry

**Severity:** Medium
**File:** `src/data/liquids.ts`

**Issue:** "Diethyl Ether" appears **twice** in the Solvents section (lines 255 and 265 of the expanded list). Same properties (density: 714, viscosity: 0.24/0.22 cP). Both entries have the same formula "(C₂H₅)₂O".

**Impact:** When user searches for "Diethyl Ether", the dropdown shows two identical entries, confusing the selection. The auto-property fill will work either way but it's a data quality issue.

**Fix:** Remove one duplicate entry.

---

## FINDING 2: VORTEX GAS QMIN/QMAX TABLE — DN25 qMin/qMax Mismatch

**Severity:** High
**File:** `src/data/factoryTables.ts`

**Issue:** For DN25 in the VORTEX_GAS table, the qMax is listed as `135.5` Nm³/hr — this appears to be exactly **half** of what it should be compared to the pattern of other sizes. Looking at the Vortex Liquid table, DN25 qMax is `5.89` m³/hr which at ~5 m/s would be proportional. For gas at ~28 m/s velocity range, DN25 should have qMax closer to `100` Nm³/hr based on the cross-sectional area ratio.

**Verification needed:** Cross-check with original Flowtech PDF page 7 data.

**Impact:** If the value is wrong, DN25 gas sizing will show "too-high" for flows that should actually be valid, potentially causing undersizing.

---

## FINDING 3: ELECTROMAGNETIC DN25 — qMax Pattern Anomaly

**Severity:** Medium
**File:** `src/data/factoryTables.ts`

**Issue:** In ELECTROMAGNETIC table, DN25 qMax is `5.89` m³/hr. But the pattern suggests it should be checked:
- DN15: 2.12, DN20: 3.77, **DN25: 5.89**, DN32: 9.65
- Area ratio DN25/DN20 = (26.64/20.96)² = 1.62 → expected qMax = 3.77 × 1.62 = **6.11** 
- The value 5.89 is close enough (velocity-based vs area-based), so this may be correct per factory table. Minor flag only.

---

## FINDING 4: VELOCITY CALCULATION — Unit Inconsistency for Steam

**Severity:** Medium
**File:** `src/data/pipeDimensions.ts` + `src/hooks/useCalculator.ts`

**Issue:** The `calculateVelocity()` function always expects flow in **m³/hr**. But for steam service, the native flow unit is **kg/hr**. The steam density (kg/m³) must be used to convert kg/hr → m³/hr before velocity calculation.

**Current code in calculator:**
```typescript
const vInput = calculateVelocity(convertedFlowRate, size);
```

For steam, `convertedFlowRate` is in kg/hr, NOT m³/hr. So velocity is computed with wrong units → velocity values for steam are meaningless (much too high).

**Impact:** Steam velocity column shows incorrect values. Users cannot trust steam velocity data.

**Fix:** For steam service, divide by steam density before calling `calculateVelocity()`:
```typescript
const vInput = calculateVelocity(convertedFlowRate / density, size.size);
```

---

## FINDING 5: VORTEX VELOCITY LIMITS — Hardcoded vMin=2.0, vMax=20.0

**Severity:** Medium
**File:** `src/data/factoryTables.ts`

**Issue:** VORTEX_STEAM has `vMin: 2.0, vMax: 20.0` for ALL sizes. These are placeholder values from a template — the actual Flowtech Vortex steam velocity limits should be specific per size and based on the factory tables (pages 9-10). The vMin/vMax should be derived from the Qmin/Qmax data at each pressure point.

**Impact:** Velocity status for steam will be incorrect. Steam sizes may show "v High" or "v Low" when they should be OK.

**Fix:** Calculate actual vMin/vMax per size from the factory Qmin/Qmax table at reference pressure.

---

## FINDING 6: STEAM DENSITY CONVERSION — kg/hr to m³/hr for Velocity

**Severity:** Medium
**File:** `src/hooks/useCalculator.ts`

**Issue:** In the steam section of `calculate()`, `convertedFlowRate` is already in kg/hr (native steam unit). But when comparing against `product.sizes` (which use the `unit: "kg/hr"`), the flow comparison is correct. However, the velocity calculation uses this kg/hr value directly without converting to volumetric flow rate.

**Related to Finding 4** — the same underlying issue.

---

## FINDING 7: GAS DENSITY AUTO-CALCULATION — Air Hardcoded

**Severity:** Low
**File:** `src/hooks/useCalculator.ts`

**Issue:** When a user changes temperature for gas without selecting a specific gas, the fallback calculation always uses M=28.97 g/mol (air). This is correct as a default, but there's no indication to the user that the density is being calculated for air specifically. If they intended a different gas, they won't know the density is wrong.

**Impact:** Low — user can see the density value and correct it. But could cause confusion.

---

## FINDING 8: CORROSION DATA — Incomplete Coverage

**Severity:** Medium
**File:** `src/data/corrosionData.ts`

**Issue:** The `LIQUID_CORROSION` map has ~40 explicit entries but the database has 220+ liquids. Most of the newly added 80+ liquids (vegetable oils, additional glycols, solvents, food items, pastes) do NOT have explicit corrosion entries. The fallback uses `getDefaultCorrosionForCategory()` which returns generic messages — these may be inaccurate for specific chemicals.

**Examples of missing entries:**
- Corn Oil, Soya Bean Oil (no entry → Food & Beverage default: "corrodes MS")
- Cyclohexane, Diethyl Ether (no entry → Solvent default: "non-corrosive")
- Motor Oil SAE 10-50 (no entry → Oil default: "non-corrosive")
- Diethylene Glycol, Triethylene Glycol (no entry → Chemical default: "corrodes MS")

**Impact:** Corrosion warnings may be misleading for many of the 220+ liquids. The category defaults are reasonable but not precise.

---

## FINDING 9: NON-NEWTONIAN FLUIDS — No Shear Rate Data

**Severity:** Low (known limitation)

**Issue:** Non-Newtonian fluids (ketchup, molasses, toothpaste, cement slurry, etc.) have a single viscosity value in the database. The app warns "shear-rate dependent" but doesn't allow the user to input the actual operating shear rate. For accurate sizing of non-Newtonian fluids, the viscosity at the operating shear rate is critical.

**Impact:** Sizing for non-Newtonian fluids will be approximate at best. This is a fundamental limitation acknowledged in the app.

---

## FINDING 10: ULTRASONIC AND OVAL GEAR — No Qmin/Qmax Data

**Severity:** Low (documented)

**Issue:** Ultrasonic Flowmeter has `status: "pending"` with placeholder data. Oval Gear has `status: "rd"` with estimated data. Both are clearly labeled in the UI. This is expected but noted for completeness.

---

## FINDING 11: PASSWORD — Client-Side Only

**Severity:** Low (acceptable for this use case)

**Issue:** The password is hardcoded in the client-side JavaScript (`ACCESS_PASSWORD = "Flowtech2026"`). A determined user could find it by inspecting the bundled JS. However, this is acceptable for an internal company tool where the goal is casual protection, not bank-grade security.

---

## SUMMARY — Priority Ranking

| # | Finding | Severity | File(s) |
|---|---------|----------|---------|
| 1 | Duplicate Diethyl Ether | Medium | `liquids.ts` |
| 2 | Vortex Gas DN25 qMax may be wrong | High | `factoryTables.ts` |
| 4 | Steam velocity uses kg/hr not m³/hr | Medium | `pipeDimensions.ts`, `useCalculator.ts` |
| 5 | Vortex Steam vMin/vMax are placeholders | Medium | `factoryTables.ts` |
| 8 | Corrosion data incomplete for 220+ liquids | Medium | `corrosionData.ts` |
| 3 | EM DN25 qMax pattern check | Low | `factoryTables.ts` |
| 6 | Steam density→volume conversion missing | Low | `useCalculator.ts` |
| 7 | Gas density defaults to air without warning | Low | `useCalculator.ts` |
| 9 | Non-Newtonian no shear rate input | Low (known) | `useCalculator.ts` |
| 10 | Ultrasonic/Oval Gear no factory data | Low (documented) | `factoryTables.ts` |
| 11 | Password client-side only | Low (acceptable) | `PasswordGate.tsx` |

---

## RECOMMENDED FIXES (in order of priority)

1. **Fix #4 (Steam Velocity):** Convert kg/hr → m³/hr before velocity calculation
2. **Fix #2 (Vortex Gas DN25):** Verify qMax value against Flowtech PDF
3. **Fix #1 (Duplicate):** Remove duplicate Diethyl Ether
4. **Fix #5 (Steam vMin/vMax):** Calculate from factory tables
5. **Fix #8 (Corrosion):** Add explicit corrosion entries for top 50 most-used liquids

**Awaiting your approval before making any changes.**
