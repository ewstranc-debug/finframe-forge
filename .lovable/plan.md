
# Comprehensive Financial Model Audit and Remediation Plan

## Executive Summary

After thorough review of the entire financial spreading application, I have identified **23 critical issues** across calculation accuracy, data flow integrity, credit analysis best practices, and UI/UX for tax return spreading. This plan addresses each issue systematically.

---

## ✅ Phase 1 Implementation Complete (2025-01-28)

### Completed Fixes:

1. **Issue 1.1/1.2 FIXED**: Added centralized EBITDA/EBIT/EBT/Net Income/Cash Flow calculation functions in `financialCalculations.ts`:
   - `calculateBusinessEBITDA()` - Standardized EBITDA calculation
   - `calculateBusinessEBIT()` - EBITDA less D&A
   - `calculateBusinessEBT()` - EBIT less Interest
   - `calculateBusinessNetIncome()` - EBT less Taxes
   - `calculateBusinessCashFlow()` - Net Income plus addbacks

2. **Issue 1.3 FIXED**: Officers Comp is now properly added back in DSCR calculation (already was in `financialCalculations.ts`, confirmed consistent)

3. **Issue 1.6 FIXED**: Added dynamic period identification utilities:
   - `classifyPeriods()` - Classifies periods as FYE, interim, or projection
   - `findLastFYEIndex()` - Finds the most recent full year-end period
   - `findInterimIndices()` - Finds all interim periods
   - Updated `Summary.tsx` to use dynamic identification instead of hardcoded indices

4. **Issue 1.7 FIXED**: Added `affiliateCashFlow` parameter to DSCR calculation for consolidated analysis
   - Added `calculateAffiliateCashFlow()` utility function

5. **Issue 2.1 FIXED**: Added `getPersonalPeriodIndex()` function for dynamic period mapping

6. **Issue 2.3 FIXED**: `BusinessFinancials.tsx` now uses centralized `calculateDSCR` from `financialCalculations.ts`, ensuring existing debts + personal debts + proposed loan are all included

7. **Issue 3.5 FIXED**: Updated SBA fee calculation with 2024 fee structure, including maturity-based tiers for loans over $500K

---

## ✅ Phase 2 Implementation Complete (2025-02-06)

### Completed Fixes:

1. **Issue 1.5 FIXED**: Added separate `accountsPayable`, `accruedExpenses`, `shortTermDebt` fields to `BusinessBalanceSheetPeriodData`:
   - Updated `SpreadsheetContext.tsx` with new interface fields
   - Updated `balanceSheetCalculations.ts` to use specific `accountsPayable` for AP Turnover
   - Updated `BusinessBalanceSheet.tsx` to display all separate liability fields

2. **Issue 2.2 FIXED**: Enhanced liability breakdown in Balance Sheet:
   - Total Current Liabilities now properly calculated from all components
   - Current Ratio and Quick Ratio use proper current liabilities total

---

## ✅ Phase 3 Implementation Complete (2025-02-06)

### Completed Fixes:

1. **Issue 3.2 FIXED**: Added M-1 Tie-Out Validation:
   - Added `validateM1TieOut()` function in `financialCalculations.ts` and `balanceSheetCalculations.ts`
   - Added validation row in `BusinessFinancials.tsx` after M-1 Taxable Income
   - Shows ✓ Tied or ✗ with difference amount

2. **Issue 3.3 FIXED**: Added FCCR (Fixed Charge Coverage Ratio) calculation:
   - Added `calculateFCCR()` to both `financialCalculations.ts` and `balanceSheetCalculations.ts`
   - Formula: (EBITDA + Rent) / (Debt Service + Rent)

3. **Issue 3.4 FIXED**: Added YoY Trend Analysis Indicators:
   - Added `calculateYoYChange()` utility functions
   - Updated Financial Ratios section in `BusinessFinancials.tsx` with:
     - Revenue with YoY % change and trend icons
     - EBITDA with YoY % change and trend icons
     - Net Income with YoY % change and trend icons
   - Green for positive trends, Red for negative trends

---

## Part 1: Critical Calculation Errors

### Issue 1.1: EBITDA Calculation Inconsistency (HIGH PRIORITY)
**Location:** `BusinessFinancials.tsx` lines 144-153 vs `financialCalculations.ts` lines 85-95

**Problem:** EBITDA is calculated differently in different places:
- In `BusinessFinancials.tsx`: Excludes Officers Comp from expenses (correct for cash flow analysis)
- In `financialCalculations.ts`: Same approach but missing addbacks in business cash flow

**Credit Analysis Impact:** EBITDA should be consistent. For SBA lending, the standard is:
```text
Net Income + Interest + Taxes + Depreciation + Amortization = EBITDA
```

**Fix Required:**
- Standardize EBITDA calculation across all files
- Add toggle for "EBITDA before Officers Comp" vs "EBITDA after Officers Comp" for different lender requirements

---

### Issue 1.2: EBT Calculation Mismatch (HIGH PRIORITY)
**Location:** `BusinessFinancials.tsx` lines 182-201

**Problem:** The `calculateEBT` function calculates Income Before Taxes using Total Income - Total Deductions, but `calculateNetIncome` uses EBIT - Interest - Taxes. These should produce the same result but the flow is confusing.

**Current Flow in calculateNetIncome:**
```text
EBITDA -> EBIT (subtract D&A) -> Net Income (subtract Interest and Taxes)
```

**But EBT should be:**
```text
EBIT - Interest = EBT, then EBT - Taxes = Net Income
```

**Fix Required:**
- Refactor to: EBITDA -> EBIT -> EBT -> Net Income (proper waterfall)
- Currently Interest is subtracted AFTER calculating EBIT, but Interest should be subtracted from EBIT to get EBT

---

### Issue 1.3: Cash Flow for DSCR Missing Officers Comp Addback (HIGH PRIORITY)
**Location:** `BusinessFinancials.tsx` lines 171-180

**Problem:** Cash Flow calculation adds back depreciation, amortization, section 179, interest, and other addbacks to Net Income, but for SBA lending, Officers Compensation should also be added back when calculating global DSCR since it flows through to the guarantor.

**Current calculation:**
```text
Cash Flow = Net Income + Depreciation + Amortization + Section 179 + Interest + Other Addbacks
```

**Correct calculation for SBA:**
```text
Cash Flow (for DSCR) = Net Income + D&A + Section 179 + Interest + Officers Comp + Other Addbacks
```

**Fix Required:**
- Add Officers Comp to cash flow addbacks in DSCR calculation
- This is already done in `financialCalculations.ts` but not in `BusinessFinancials.tsx` display

---

### Issue 1.4: Interest Addback Logic Error
**Location:** `BusinessFinancials.tsx` lines 767-775

**Problem:** Interest is being added back to calculate Cash Flow, but it was never subtracted from Net Income in the current flow. The calculation shows:
- EBIT = EBITDA - Depreciation - Amortization (NO Interest subtraction)
- Net Income = EBIT - Interest - Taxes

So Interest IS subtracted from Net Income, making the addback correct. However, the display is confusing because EBIT should technically be called "EBITDA less D&A" if interest hasn't been considered yet.

**Fix Required:**
- Clarify calculation labels
- Consider renaming rows for clarity: "EBITDA", "EBIT", "EBT", "Net Income"

---

### Issue 1.5: AP Turnover Using Wrong Data (MEDIUM PRIORITY)
**Location:** `balanceSheetCalculations.ts` lines 134-140

**Problem:** AP Turnover is calculated using Current Liabilities, not specifically Accounts Payable:
```typescript
const ap = parseFloat(period.currentLiabilities) || 0;
return ap > 0 ? annualizedCOGS / ap : 0;
```

Current Liabilities includes accrued expenses, short-term debt, etc. - not just A/P.

**Fix Required:**
- Add a specific `accountsPayable` field to `BusinessBalanceSheetPeriodData`
- Use that field for A/P Turnover calculation

---

### Issue 1.6: Personal DSCR in Summary Uses Hardcoded Period Indices
**Location:** `Summary.tsx` lines 140-147, 167-173

**Problem:** The code hardcodes period indices (2 for last full year, 3 for interim):
```typescript
const lastFullYear = useMemo(() => calculateDSCRForPeriod(2, 2), [...]);
const interimPeriod = useMemo(() => calculateDSCRForPeriod(3, 2), [...]);
```

This breaks when users add/remove periods or when periods are in different positions.

**Fix Required:**
- Dynamically identify last full year (12 months) and interim periods
- Use period labels and months to classify, not hardcoded indices

---

### Issue 1.7: Affiliate Financials Not Included in Global DSCR
**Location:** `financialCalculations.ts`

**Problem:** Affiliate EBITDA and cash flow are completely ignored in DSCR calculations. For consolidated analysis, affiliate cash flow should be included.

**Fix Required:**
- Add parameter to include/exclude affiliate cash flow in global DSCR
- Sum affiliate EBITDA when calculating consolidated metrics

---

## Part 2: Data Flow Issues

### Issue 2.1: Personal Period Mapping Incorrect
**Location:** `BusinessFinancials.tsx` lines 263-265

**Problem:** Personal periods are mapped to business periods using:
```typescript
const personalPeriodIndex = businessPeriodIndex < 3 ? businessPeriodIndex : 2;
```

This assumes:
- 3 personal periods exist
- Business periods align with personal periods

But users can have different numbers of periods.

**Fix Required:**
- Match periods by date/label, not by index
- Or explicitly link personal periods to business periods

---

### Issue 2.2: Balance Sheet Not Linked to Correct P&L Periods
**Location:** `BusinessBalanceSheet.tsx` lines 47-50

**Problem:** Balance sheet periods are linked to P&L periods by index:
```typescript
const correspondingPLPeriod = businessPeriods[index];
```

But balance sheet may have 4 periods while P&L has 5 (with projection column).

**Fix Required:**
- Sync period counts between Balance Sheet and P&L
- Or link by date/label rather than index

---

### Issue 2.3: Existing Debts Not Properly Included in Business DSCR
**Location:** `BusinessFinancials.tsx` lines 262-309

**Problem:** The `calculateDSCR` function in BusinessFinancials.tsx calculates debt service differently than `financialCalculations.ts`. It calls `calculateAnnualDebtService()` which only includes the proposed loan, not existing business debts.

**Fix Required:**
- Use the centralized `calculateDSCR` from `financialCalculations.ts` in BusinessFinancials.tsx
- Ensure existing debts are included in all DSCR displays

---

## Part 3: Credit Analysis Best Practice Issues

### Issue 3.1: Missing Tax Return Line References
**Location:** `BusinessFinancials.tsx`

**Problem:** For spreading business tax returns (BTRs), analysts need to know which IRS form lines correspond to each field. Current labels are:
- "1. Gross Receipts or Sales" (correct - Form 1120 Line 1a)
- "6. Compensation of Officers" (correct - Form 1120 Line 12)

But missing explicit line references for:
- Interest Expense (Line 18)
- Depreciation (Line 20)
- Other Deductions (Line 26)

**Fix Required:**
- Add IRS form line references in labels or tooltips
- Support Form 1120 (C-Corp), Form 1065 (Partnership), Form 1120-S (S-Corp)

---

### Issue 3.2: Missing Schedule M-1 Tie-Out Validation
**Location:** `BusinessFinancials.tsx` lines 804-887

**Problem:** Schedule M-1 reconciliation exists but there's no validation that Book Income ties to the calculated Net Income. Analysts need this tie-out.

**Fix Required:**
- Add validation that M-1 Book Income equals calculated Net Income
- Highlight discrepancies with warning indicator

---

### Issue 3.3: Missing Key Credit Ratios
**Location:** Various files

**Problem:** Several critical SBA lending ratios are missing:
- Fixed Charge Coverage Ratio (FCCR)
- Working Capital to Revenue Ratio
- Debt Service to Cash Flow Ratio
- Interest Coverage Ratio
- Leverage Ratio (Total Debt / EBITDA)

**Fix Required:**
- Add FCCR calculation: (EBITDA + Rent + Lease) / (Debt Service + Rent + Lease)
- Add other missing ratios with industry benchmarks

---

### Issue 3.4: No Trend Analysis Indicators
**Location:** All financial tabs

**Problem:** Analysts need to see period-over-period changes (YoY growth rates). Currently only raw numbers are shown.

**Fix Required:**
- Add % change columns for key metrics (Revenue, Gross Profit, EBITDA, Net Income)
- Color code: Green for growth, Red for decline

---

### Issue 3.5: SBA Fee Calculation Error for Large Loans
**Location:** `Summary.tsx` lines 54-66, `financialCalculations.ts` lines 39-49

**Problem:** SBA guarantee fee calculation may be incorrect for loans over $1M:
```typescript
upfrontFee = (550000 * 0.03) + ((primaryRequest - 700000) * 0.035);
```

Current SBA 7(a) fee structure (as of 2024):
- Loans up to $500,000 with maturity > 15 years: 0% (first $150K) + 2.50% on portion $150K-$500K
- Loans > $1,000,000: 3.50% on guaranteed portion > $1M

**Fix Required:**
- Update fee calculation to match current SBA guidelines
- Add maturity-based fee tier logic

---

### Issue 3.6: Missing Collateral Coverage Analysis
**Location:** Not implemented

**Problem:** SBA lending requires collateral analysis but there's no collateral tab.

**Fix Required:**
- Add Collateral tab with:
  - Real estate (address, value, lien position, LTV)
  - Equipment (description, value, condition)
  - Inventory/AR (eligible %, advance rate)
  - Calculate total collateral coverage ratio

---

### Issue 3.7: No Guarantor Injection Tracking
**Location:** `Summary.tsx`

**Problem:** Equity injection is tracked but not linked to guarantor net worth analysis. SBA requires showing source of equity injection.

**Fix Required:**
- Add source of equity injection field (savings, real estate, gift, etc.)
- Link to PFS liquid assets to validate

---

## Part 4: BTR/PTR Spreading Format Issues

### Issue 4.1: Missing Form 1040 Schedule E
**Location:** `PersonalFinancials.tsx`

**Problem:** Personal income spreading has Schedule C but lacks Schedule E (Rental Income, Partnership/S-Corp Income). Rental income exists but K-1 income is not properly broken out.

**Fix Required:**
- Add Schedule E section with:
  - Rental properties (by property)
  - K-1 Income from partnerships/S-Corps
  - Passive vs Active income distinction

---

### Issue 4.2: Missing Tax Return Type Selector
**Location:** `BusinessFinancials.tsx`

**Problem:** The P&L format is generic but tax return formats vary:
- Form 1120 (C-Corp): Has Lines 1-30
- Form 1120-S (S-Corp): Has Lines 1-21, plus K items
- Form 1065 (Partnership): Has Lines 1-22, plus Schedule K

**Fix Required:**
- Add entity type selector: C-Corp, S-Corp, Partnership, Sole Prop
- Dynamically show relevant line items

---

### Issue 4.3: Company-Prepared Financials Mode
**Location:** Not implemented

**Problem:** Company-prepared financials don't follow tax return format. Need ability to enter:
- Standard income statement format
- Management-prepared P&L with different expense categories

**Fix Required:**
- Add toggle: "Tax Return" vs "Company Prepared"
- Show different input format based on selection

---

### Issue 4.4: Missing K-1 Analysis for S-Corps and Partnerships
**Location:** Not implemented

**Problem:** For S-Corps and Partnerships, K-1 distributions and ordinary income need to be analyzed separately.

**Fix Required:**
- Add K-1 income section to personal tax return spreading
- Link K-1 to corresponding business entity

---

### Issue 4.5: Depreciation Schedule Missing
**Location:** `BusinessFinancials.tsx`

**Problem:** Only shows depreciation total, but analysts need to see:
- Current year depreciation
- Section 179
- Bonus depreciation
- Regular depreciation
- Accumulated depreciation

**Fix Required:**
- Add expandable depreciation schedule section
- Track depreciation by asset category

---

## Part 5: Proposed Implementation Priority

### Phase 1: Critical Calculation Fixes (Week 1)
1. Fix EBITDA/EBT/Net Income calculation waterfall
2. Add Officers Comp to cash flow addbacks
3. Fix period index hardcoding in Summary.tsx
4. Add existing debts to BusinessFinancials DSCR display
5. Centralize DSCR calculation usage across all components

### Phase 2: Data Flow Corrections (Week 2)
1. Link periods by date/label, not index
2. Sync Balance Sheet and P&L period counts
3. Add affiliate cash flow to consolidated DSCR (optional toggle)
4. Add separate Accounts Payable field

### Phase 3: Credit Analysis Enhancements (Week 3)
1. Add FCCR and other missing ratios
2. Add YoY trend analysis indicators
3. Update SBA fee calculation
4. Add M-1 tie-out validation

### Phase 4: BTR/PTR Format Improvements (Week 4)
1. Add entity type selector (1120, 1120-S, 1065)
2. Add IRS form line references
3. Add Schedule E section
4. Add K-1 analysis section

### Phase 5: New Features (Week 5+)
1. Add Collateral analysis tab
2. Add Company-Prepared financials mode
3. Add depreciation schedule
4. Add equity injection source tracking

---

## Detailed Technical Specifications

### Fix 1.1: Standardize EBITDA Calculation

Create centralized calculation in `financialCalculations.ts`:

```typescript
export const calculateEBITDA = (period: BusinessPeriodData): number => {
  const revenue = parseFloat(period.revenue) || 0;
  const otherIncome = parseFloat(period.otherIncome) || 0;
  const cogs = parseFloat(period.cogs) || 0;
  const opEx = parseFloat(period.operatingExpenses) || 0;
  const rent = parseFloat(period.rentExpense) || 0;
  const otherExpenses = parseFloat(period.otherExpenses) || 0;
  // Note: Officers Comp NOT included - added back separately for global DSCR
  
  return (revenue + otherIncome) - cogs - opEx - rent - otherExpenses;
};
```

### Fix 1.6: Dynamic Period Identification

Replace hardcoded indices with:

```typescript
const identifyPeriods = (periods: BusinessPeriodData[], labels: string[]) => {
  return periods.map((p, i) => ({
    index: i,
    months: parseFloat(p.periodMonths) || 0,
    isInterim: (parseFloat(p.periodMonths) || 12) < 12 || 
               labels[i]?.toLowerCase().includes('interim'),
    isProjection: p.isProjection || false,
    isFYE: (parseFloat(p.periodMonths) || 0) === 12 && 
           !labels[i]?.toLowerCase().includes('interim'),
  }));
};

const lastFYEIndex = periods
  .filter(p => p.isFYE && !p.isProjection)
  .sort((a, b) => b.index - a.index)[0]?.index;
```

### Fix 3.3: Add FCCR Calculation

```typescript
export const calculateFCCR = (
  ebitda: number,
  rentExpense: number,
  debtService: number
): number => {
  const numerator = ebitda + rentExpense;
  const denominator = debtService + rentExpense;
  return denominator > 0 ? numerator / denominator : 0;
};
```

---

## New Data Structures Required

### Balance Sheet Enhancement
```typescript
interface BusinessBalanceSheetPeriodData {
  // Existing fields...
  accountsPayable: string;  // NEW: Separate from currentLiabilities
  accruedExpenses: string;  // NEW
  shortTermDebt: string;    // NEW
  deferredRevenue: string;  // NEW
}
```

### K-1 Income Structure
```typescript
interface K1Income {
  entityName: string;
  entityType: 'partnership' | 's-corp';
  ordinaryIncome: string;
  guaranteedPayments: string;
  rentalIncome: string;
  interestIncome: string;
  dividends: string;
  capitalGains: string;
  section179: string;
  charitableContributions: string;
}
```

### Collateral Structure
```typescript
interface CollateralItem {
  id: string;
  type: 'real_estate' | 'equipment' | 'inventory' | 'ar' | 'other';
  description: string;
  grossValue: string;
  lienPosition: '1st' | '2nd' | '3rd' | 'none';
  existingLienAmount: string;
  advanceRate: string;  // % for eligible collateral value
  netCollateralValue: number;  // Calculated
}
```

---

## Testing Checklist

After implementing fixes, verify:

1. DSCR on Summary tab matches DSCR on Financial Analysis tab
2. DSCR on Business P&L tab matches Financial Analysis tab
3. Total debt service includes: Proposed loan + Existing debts + Personal debts
4. Cash flow includes all appropriate addbacks
5. Interim periods are correctly annualized (12 / months factor)
6. Balance sheet ratios use correct P&L data
7. A/P Turnover uses Accounts Payable, not all Current Liabilities
8. SBA fees calculate correctly at all loan amount tiers
9. M-1 reconciliation ties to calculated Net Income
10. All financial data persists correctly in localStorage
