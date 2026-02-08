

# Code Audit & Bug Fix Plan

## Audit Summary

After a comprehensive review of the financial model codebase, I identified **8 critical issues** and **5 enhancement opportunities**. The issues primarily involve inconsistent DSCR formula implementations, data flow mismatches, and UI/UX polish items.

---

## Critical Bugs Found

### Bug 1: Inconsistent DSCR Formulas Across Tabs

**Location**: `FinancialAnalysis.tsx` (lines 182-249) vs `Summary.tsx` vs `BusinessFinancials.tsx`

**Problem**: Three different DSCR formulas are used across the application:

| Tab | Formula Used | Correct? |
|-----|--------------|----------|
| Summary | `Net Cash Available / Total Debt Service` (Global DSCR) | Correct for Global |
| Financial Analysis "Business DSCR" | `EBITDA / Proposed Loan Payment` (no existing debt) | Partially Correct |
| Business P&L | Uses centralized `calculateDSCR()` (Global formula) | Incorrect for "Business DSCR" |

**Issue**: The "Business DSCR" card on Financial Analysis tab uses `existingDSCR` property which is actually set to `businessDSCR` (EBITDA / Proposed Loan). But the Business P&L tab uses the Global DSCR formula. This creates user confusion.

**Fix**: Standardize terminology and formulas:
- **Business DSCR** = `Annualized EBITDA / Proposed Loan Annual Payment` (standalone business coverage)
- **Global DSCR** = `Net Cash Available / Total Debt Service` (inclusive of all income and debts)

---

### Bug 2: SBA Fee Calculation in `calculateLoanAnnualDebtService` Uses Wrong Base

**Location**: `financialCalculations.ts` (lines 231-246)

**Problem**: The function calculates the SBA fee on `primaryRequest` (just the sum of uses), but the actual loan amount should include the fee itself (circular dependency). The Summary tab correctly handles this with an iterative solver, but `calculateLoanAnnualDebtService` does not.

```typescript
// Current (incorrect in financialCalculations.ts):
const upfrontFee = calculateSBAGuaranteeFee(primaryRequest, guaranteePct);
const finalLoanAmount = primaryRequest + upfrontFee;

// Should be: (matches Summary.tsx logic)
// Iterate to find the correct loan amount where loan = primaryRequest + fee(loan)
```

**Fix**: Refactor `calculateLoanAnnualDebtService` to use the same iterative solver pattern as `Summary.tsx` for consistency.

---

### Bug 3: Hardcoded Period Index `[3]` for Interim Tooltip

**Location**: `Summary.tsx` (lines 678-710)

**Problem**: The interim EBITDA tooltip hardcodes `businessPeriods[3]` instead of using the dynamically identified `interimIndices`.

```typescript
// Current (hardcoded):
<span>${(parseFloat(businessPeriods[3].revenue) || 0)...}

// Should use:
const latestInterimIdx = interimIndices[interimIndices.length - 1];
<span>${(parseFloat(businessPeriods[latestInterimIdx].revenue) || 0)...}
```

**Fix**: Replace hardcoded `[3]` with dynamic `interimIndices` lookup throughout the interim tooltip section.

---

### Bug 4: DSCR Color Threshold Inconsistency

**Location**: Multiple files

**Problem**: Different thresholds are used for DSCR color coding:

| File | Red Threshold | Yellow Threshold | Green Threshold |
|------|---------------|------------------|-----------------|
| Summary.tsx | <1.0 | 1.0-1.25 | ≥1.25 |
| FinancialAnalysis.tsx | <1.0 | 1.0-1.15 | ≥1.15 |
| BusinessFinancials.tsx | <1.0 | 1.0-1.25 | ≥1.25 |
| DSCRBreakdownModal | <1.15 | 1.15-1.25 | ≥1.25 |

**Fix**: Standardize to SBA requirements: **Red <1.15, Yellow 1.15-1.25, Green ≥1.25** (per memory: DSCR target threshold is 1.15).

---

### Bug 5: Schedule E/K-1 Income Not Included in Global DSCR Calculation

**Location**: `financialCalculations.ts` (lines 273-280)

**Problem**: The `calculateDSCR` function references `schedEK1Income` but the fields are accessed with explicit type casting `(personalPeriod as any)`, suggesting they were added after the TypeScript interface was defined.

```typescript
// Current calculation:
const schedEK1Income = (parseFloat((personalPeriod as any).schedENetRentalIncome) || 0) +
                       (parseFloat((personalPeriod as any).k1OrdinaryIncome) || 0) +
                       (parseFloat((personalPeriod as any).k1GuaranteedPayments) || 0);
```

**Issue**: While functionally correct, the `as any` casting bypasses type safety. The `PersonalPeriodData` interface in `SpreadsheetContext.tsx` (lines 27-31) correctly includes these fields, so the casting is unnecessary.

**Fix**: Remove the `as any` casts since the interface is already updated.

---

### Bug 6: Equity Percentage Sync Issue

**Location**: `Summary.tsx` (lines 206-210)

**Problem**: The `handleEquityPercentageChange` function calculates equity based on `totalUses`, but `totalUses` includes the SBA fee which depends on the loan amount. This creates a circular reference:

```typescript
const handleEquityPercentageChange = (value: string) => {
  setEquityPercentage(value);
  const calculatedEquity = (parseFloat(value) || 0) / 100 * totalUses;
  setInjectionEquity(calculatedEquity.toString());
};
```

**Issue**: When user enters a percentage, the equity amount is calculated. But changing equity changes the SBA loan amount, which changes the fee, which changes totalUses, which should change the equity amount... but it doesn't recalculate.

**Fix**: Apply the same iterative solver pattern to stabilize the equity percentage calculation, or clearly document that the percentage is "approximate" and uses are recalculated after.

---

### Bug 7: Missing Interest Rate Validation for 0%

**Location**: `Summary.tsx` (lines 133-140)

**Problem**: The payment calculation handles 0% interest rate correctly (`return principal / term`), but divides by `term` without checking if term is 0, which could cause division by zero (though term defaults to 1).

**Low Risk**: The `|| 1` fallback prevents crashes, but a 0-month term makes no sense financially.

**Fix**: Add validation to ensure term is at least 1 month and show a warning for unusual values.

---

### Bug 8: `ratios.dscr.fullYear` Can Be Null When Displayed

**Location**: `FinancialAnalysis.tsx` (lines 973-1027)

**Problem**: The DSCR cards attempt to access properties like `ratios.dscr.fullYear.existingDSCR` without null guards in some tooltip locations.

```typescript
// This line could throw if fullYear is null:
<p className="font-medium">Proposed Loan Annual Payment: ${(ratios.dscr.fullYear?.proposedLoanAnnualPayment || 0)...}</p>
```

**Fix**: Ensure all property accesses use optional chaining consistently.

---

## Enhancement Opportunities

### Enhancement 1: Centralize DSCR Color Logic

Create a utility function to determine DSCR status colors:

```typescript
export const getDSCRStatus = (dscr: number): { color: string; label: string } => {
  if (dscr >= 1.25) return { color: 'text-green-600', label: 'Strong' };
  if (dscr >= 1.15) return { color: 'text-yellow-600', label: 'Acceptable' };
  return { color: 'text-red-600', label: 'Below Threshold' };
};
```

---

### Enhancement 2: Add Business DSCR vs Global DSCR Distinction in UI

Clearly label and differentiate:
- **Business DSCR**: How well the business alone covers the proposed loan
- **Global DSCR**: How well all income sources cover all debt obligations

Add tooltips explaining each formula's purpose.

---

### Enhancement 3: Validate Period Months Input

Currently, period months accepts any number. Add validation to ensure:
- 1-12 months for standard periods
- Warning when >12 months (unusual)
- Auto-detection from date ranges

---

### Enhancement 4: Improve Real-time Calculation Feedback

Add visual indicators (subtle animation or highlight) when values are recalculating to give users confidence the system is updating.

---

### Enhancement 5: Add FCCR Display in Analysis Tab

The `calculateFCCR` function exists in `financialCalculations.ts` but is not displayed in the Financial Analysis tab. Add an FCCR card alongside DSCR.

---

## Implementation Plan

### Phase 1: Critical Bug Fixes (High Priority)

1. **Fix Hardcoded Period Index**
   - Update `Summary.tsx` lines 678-710 to use `interimIndices` dynamically
   - Estimated: 15 min

2. **Standardize DSCR Color Thresholds**
   - Create centralized `getDSCRStatus()` utility
   - Update all 4 files to use consistent thresholds (1.15/1.25)
   - Estimated: 30 min

3. **Remove Unnecessary Type Casts**
   - Clean up `(personalPeriod as any)` casts in `financialCalculations.ts`
   - Estimated: 5 min

4. **Fix SBA Fee Calculation Consistency**
   - Refactor `calculateLoanAnnualDebtService` to use iterative solver
   - Or accept slight discrepancy with documentation
   - Estimated: 20 min

### Phase 2: Logic Improvements (Medium Priority)

5. **Clarify Business vs Global DSCR**
   - Update tooltips and labels to clearly distinguish formulas
   - Estimated: 20 min

6. **Add Null Guards for DSCR Display**
   - Audit all `ratios.dscr.fullYear` accesses
   - Add consistent optional chaining
   - Estimated: 15 min

### Phase 3: Enhancements (Lower Priority)

7. **Add FCCR Card to Financial Analysis**
   - Display Fixed Charge Coverage Ratio alongside DSCR
   - Estimated: 30 min

8. **Improve Input Validation**
   - Add warnings for unusual values (0% interest, >12 month periods)
   - Estimated: 20 min

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/utils/financialCalculations.ts` | Remove `as any` casts, add `getDSCRStatus()`, update fee calculation |
| `src/components/tabs/Summary.tsx` | Fix hardcoded `[3]`, standardize DSCR colors |
| `src/components/tabs/FinancialAnalysis.tsx` | Standardize DSCR colors, add null guards, add FCCR card |
| `src/components/tabs/BusinessFinancials.tsx` | Standardize DSCR colors |
| `src/components/DSCRBreakdownModal.tsx` | Standardize DSCR colors |

### Testing Checklist

After implementation, verify:

- [ ] Enter a loan over $1M and confirm SBA fee matches FY2026 tiers (3.5%/$1M, 3.75% over)
- [ ] Enter interim period data (e.g., 6 months) and verify DSCR annualizes correctly
- [ ] Confirm Business DSCR = EBITDA / Proposed Loan Payment
- [ ] Confirm Global DSCR = Net Cash Available / Total Debt Service
- [ ] Verify all DSCR cards show consistent red/yellow/green thresholds
- [ ] Enter Schedule E/K-1 income and confirm it appears in Global DSCR calculation
- [ ] Test down payment warning appears when <10% on Business Acquisition
- [ ] Verify tab navigation (Tab/Enter) works smoothly across all input fields

