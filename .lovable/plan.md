
# SBA Spreading Tool — 9 Corrections

Scope touches roughly every calculation surface. Storage keys and shapes are preserved; only new optional fields are added.

## 1. FYE-based DSCR (Business + Global)
- Add `findLastHistoricalFYEIndex` helper (mirrors `findLastFYEIndex` but excludes `isProjection`). Use it everywhere the "Business DSCR" and "Global DSCR" cards resolve their period.
- FinancialAnalysis: rewire the FYE Business DSCR and Global DSCR cards to read the last historical FYE, not the highest-index FYE (which is currently the projection).
- Global DSCR numerator: business CFADS + guarantor W-2/other cash income − personal expenses − personal taxes, with K-1 from the subject business excluded (add optional `k1FromSubjectBusiness` field on personal period; default 0 = current behavior). Denominator: business proposed debt service + personal debt service.
- DSCRBreakdownModal + AI payload + PDF/Excel exports follow suit.

## 2. Remove FCCR
- Delete the FCCR card, `calculateFCCR`, and any FCCR references in export/AI payloads. No replacement.

## 3. Down payment on total project cost
- Summary tab: change equity-injection recalculation to solve `equity = pct × (primaryRequest + fee(loan))` where `loan = primaryRequest + fee − equity`. Iterative solver (12 iterations, $1 tolerance) analogous to `computeSBALoanAmount`.
- 10% minimum check uses the same total-project basis.
- When fee-financing toggle is OFF, total project = primary request + fee (still); down payment basis unchanged conceptually.

## 4. Single set of loan terms everywhere
- Sweep FinancialAnalysis' DSCR analysis section (bottom): remove any local P&I recomputation; route through `calculateLoanAnnualDebtService` / `computeNewLoanAnnualPayment` using context Loan Terms.
- Same for P&L DSCR row, charts, Summary — verify all read from `SpreadsheetContext` `interestRate`, `termMonths`, `guaranteePercent`, `equityInjection`, `financeGuaranteeFee`.

## 5. Business P&L DSCR row
- Per-period DSCR = period CFADS (annualized if interim) / total proposed debt service (constant across columns).
- Remove the "DSCR with Rent Addback" row.

## 6. Balance Sheet: Intangibles & Other Assets
- Add optional `intangiblesOtherAssets` field to balance sheet row type (default "0" — existing rows unaffected).
- Add input row on BusinessBalanceSheet tab.
- Include in total assets, debt-to-assets, equity. Exclude from current assets, working capital, current ratio, quick ratio.

## 7. Working capital & liquidity fix
- `balanceSheetCalculations.ts`: ensure current assets = cash + A/R + inventory + otherCurrentAssets; current liabilities = A/P + accrued + shortTermDebt + otherCurrentLiabilities; WC = CA − CL; current = CA/CL; quick = (CA − inventory)/CL. Fix any zero-division and any place currently reading total assets or omitting CL.

## 8. Ratio cleanup
- Remove cards: ROA, ROE, Asset Turnover, Debt-to-Equity, personal Current Ratio, personal Liquidity Ratio, Global Liquidity, Global Current Ratio.
- Add cards:
  - Funded Debt / EBITDA = (existing funded business debt balances + proposed SBA loan) / business EBITDA (FYE)
  - EBITDA margin = EBITDA / revenue
  - Interest coverage = EBITDA / interest expense
  - Cash flow cushion % = (CFADS − proposed debt service) / proposed debt service
  - Personal liquidity coverage = liquid assets / monthly proposed P&I (months)
  - Guarantee coverage = personal net worth / SBA loan amount

## 9. No card defaults to Projections
- Introduce `useReportingPeriod` helper returning `{ fyeIndex, interimIndex, hasFYE }` selecting last historical FYE (excludes projections).
- Sweep every metric card, EBITDA chart, income/cash flow trend chart, Summary "Financial Overview" to use it.
- Add period label ("FYE " + date) under each card's title.
- Projections column feeds ONLY elements explicitly labeled Projections, and only when non-empty.

## Technical Details

New/changed files:
- `src/utils/financialCalculations.ts` — add `findLastHistoricalFYEIndex`, remove `calculateFCCR`, extend `DSCRCalculationInput` with optional `excludeK1FromSubjectBusiness`.
- `src/utils/balanceSheetCalculations.ts` — corrected CA/CL/WC/current/quick; add intangibles to total assets only.
- `src/contexts/SpreadsheetContext.tsx` — add optional `intangiblesOtherAssets` to balance sheet row type; optional `k1FromSubjectBusiness` on personal period. No key/shape renames.
- `src/components/tabs/BusinessBalanceSheet.tsx` — new intangibles row.
- `src/components/tabs/BusinessFinancials.tsx` — DSCR row rewrite; remove rent-addback row.
- `src/components/tabs/Summary.tsx` — total-project-cost down payment solver; Financial Overview reads last historical FYE.
- `src/components/tabs/FinancialAnalysis.tsx` — biggest change: FYE-based DSCR wiring, remove FCCR, remove listed cards, add new cards, unify loan-payment source, add period labels, chart sourcing.
- `src/components/DSCRBreakdownModal.tsx` — updated global DSCR breakdown.
- `src/utils/exportUtils.ts` — remove FCCR, update DSCR basis, add new ratios, add intangibles line.
- `supabase/functions/generate-financial-analysis/index.ts` — payload cleanup (remove FCCR, add new ratios).

Verification pass at the end using the provided test case (Business Acquisition $2.3M, 9.5%/120mo, FY2025 P&L, 5-mo interim), reporting each expected value.
