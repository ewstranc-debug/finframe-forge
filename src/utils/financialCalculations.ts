import { BusinessPeriodData, PersonalPeriodData, Debt, UseOfFunds, AffiliateIncomeData } from "@/contexts/SpreadsheetContext";

export interface DSCRCalculationInput {
  businessPeriod: BusinessPeriodData;
  personalPeriod: PersonalPeriodData;
  debts: Debt[];
  personalLiabilitiesMonthly: {
    creditCardsMonthly: string;
    mortgagesMonthly: string;
    vehicleLoansMonthly: string;
    otherLiabilitiesMonthly: string;
  };
  uses: UseOfFunds[];
  interestRate: string;
  termMonths: string;
  guaranteePercent: string;
  /** Equity injection ($) so SBA loan principal matches the Summary plug. */
  equityInjection?: string;
  /** Whether the SBA guarantee fee is financed into the loan (default true). */
  financeGuaranteeFee?: boolean;
  includeRentAddback?: boolean;
  affiliateCashFlow?: number;
}

export interface DSCRCalculationResult {
  dscr: number;
  businessEbitda: number;
  officersComp: number;
  personalW2Income: number;
  schedCCashFlow: number;
  totalIncomeAvailable: number;
  personalExpenses: number;
  estimatedTaxOnOfficersComp: number;
  netCashAvailable: number;
  /** = existingDebtPayment + proposedDebtPayment + sbaAnnualServiceFee */
  annualDebtService: number;
  existingDebtPayment: number;
  personalDebtPayment: number;
  proposedDebtPayment: number;
  sbaAnnualServiceFee: number;
  sbaLoanAmount: number;
  rentAddback?: number;
  depreciationAddback: number;
  amortizationAddback: number;
  section179Addback: number;
  otherAddbacks: number;
  businessCashFlow: number;
  affiliateCashFlow?: number;
}

/**
 * Identify period types for dynamic DSCR calculations
 * Replaces hardcoded period indices
 */
export interface PeriodClassification {
  index: number;
  months: number;
  label: string;
  isInterim: boolean;
  isProjection: boolean;
  isFYE: boolean; // Full Year End (12 months, not interim, not projection)
}

export const classifyPeriods = (
  periods: BusinessPeriodData[],
  labels: string[]
): PeriodClassification[] => {
  return periods.map((p, i) => {
    const months = parseFloat(p.periodMonths) || 0;
    const label = (labels[i] || "").toLowerCase();
    const isProjection = p.isProjection || label.includes("projection");
    const isInterim = months > 0 && months < 12 || label.includes("interim");
    // FYE includes projections with 12 months - they are valid for DSCR calculations
    const isFYE = months === 12 && !isInterim;
    
    return {
      index: i,
      months,
      label: labels[i] || `Period ${i + 1}`,
      isInterim,
      isProjection,
      isFYE,
    };
  });
};

/**
 * Find the last full year end period index (includes projections with 12 months)
 * Prioritizes the most recent period by index
 */
export const findLastFYEIndex = (classifications: PeriodClassification[]): number | undefined => {
  const fyePeriods = classifications.filter(p => p.isFYE);
  if (fyePeriods.length === 0) return undefined;
  return fyePeriods.sort((a, b) => b.index - a.index)[0].index;
};

/**
 * Find the last HISTORICAL full year end (12-mo, not projection, not interim).
 * This is what all "Business/Global DSCR" and metric cards should key off — the
 * Projections column must never drive underwriting cards.
 */
export const findLastHistoricalFYEIndex = (classifications: PeriodClassification[]): number | undefined => {
  const fyePeriods = classifications.filter(p => p.isFYE && !p.isProjection);
  if (fyePeriods.length === 0) return undefined;
  return fyePeriods.sort((a, b) => b.index - a.index)[0].index;
};

/**
 * Check if the last FYE period is a projection
 */
export const isLastFYEProjection = (classifications: PeriodClassification[]): boolean => {
  const lastFYEIdx = findLastFYEIndex(classifications);
  if (lastFYEIdx === undefined) return false;
  return classifications[lastFYEIdx]?.isProjection || false;
};

/**
 * Find interim period indices
 */
export const findInterimIndices = (classifications: PeriodClassification[]): number[] => {
  return classifications.filter(p => p.isInterim && !p.isProjection).map(p => p.index);
};

/**
 * Calculate EBITDA for a business period (standardized calculation)
 * Note: Officers Comp is included in expenses for EBITDA, but added back for DSCR
 */
export const calculateBusinessEBITDA = (period: BusinessPeriodData, annualize: boolean = false): number => {
  const months = parseFloat(period.periodMonths) || 12;
  const factor = annualize ? (12 / months) : 1;
  
  const revenue = (parseFloat(period.revenue) || 0) + (parseFloat(period.otherIncome) || 0);
  const expenses = (parseFloat(period.cogs) || 0) + 
                   (parseFloat(period.operatingExpenses) || 0) +
                   (parseFloat(period.rentExpense) || 0) +
                   (parseFloat(period.officersComp) || 0) +
                   (parseFloat(period.otherExpenses) || 0);
  return (revenue - expenses) * factor;
};

/**
 * Non-recurring adjustment (annualized when annualize=true). Positive value
 * ADDS to EBITDA/CFADS (removes one-time expense); negative value SUBTRACTS
 * (removes one-time income). Does NOT affect Net Income per books, Gross
 * Profit, or CCC.
 */
export const getNonRecurringAdjustment = (period: BusinessPeriodData, annualize: boolean = false): number => {
  const months = parseFloat(period.periodMonths) || 12;
  const factor = annualize ? (12 / months) : 1;
  return (parseFloat(period.nonRecurringAdjustment || "0") || 0) * factor;
};

/**
 * Adjusted EBITDA = EBITDA + Non-recurring adjustment. Used for DSCR/FCCR/CFADS.
 */
export const calculateAdjustedBusinessEBITDA = (period: BusinessPeriodData, annualize: boolean = false): number => {
  return calculateBusinessEBITDA(period, annualize) + getNonRecurringAdjustment(period, annualize);
};



/**
 * Calculate EBIT (EBITDA less D&A)
 */
export const calculateBusinessEBIT = (period: BusinessPeriodData, annualize: boolean = false): number => {
  const months = parseFloat(period.periodMonths) || 12;
  const factor = annualize ? (12 / months) : 1;
  
  const ebitda = calculateBusinessEBITDA(period, false);
  const depreciation = parseFloat(period.depreciation) || 0;
  const amortization = parseFloat(period.amortization) || 0;
  
  return (ebitda - depreciation - amortization) * factor;
};

/**
 * Calculate EBT (EBIT less Interest)
 */
export const calculateBusinessEBT = (period: BusinessPeriodData, annualize: boolean = false): number => {
  const months = parseFloat(period.periodMonths) || 12;
  const factor = annualize ? (12 / months) : 1;
  
  const ebit = calculateBusinessEBIT(period, false);
  const interest = parseFloat(period.interest) || 0;
  
  return (ebit - interest) * factor;
};

/**
 * Calculate Net Income (EBT less Taxes)
 */
export const calculateBusinessNetIncome = (period: BusinessPeriodData, annualize: boolean = false): number => {
  const months = parseFloat(period.periodMonths) || 12;
  const factor = annualize ? (12 / months) : 1;
  
  const ebt = calculateBusinessEBT(period, false);
  const taxes = parseFloat(period.taxes) || 0;
  
  return (ebt - taxes) * factor;
};

/**
 * Calculate Cash Flow (Net Income + Addbacks)
 * For DSCR purposes, includes D&A, Section 179, Interest, and Other Addbacks
 */
export const calculateBusinessCashFlow = (period: BusinessPeriodData, annualize: boolean = false): number => {
  const months = parseFloat(period.periodMonths) || 12;
  const factor = annualize ? (12 / months) : 1;
  
  const netIncome = calculateBusinessNetIncome(period, false);
  const depreciation = parseFloat(period.depreciation) || 0;
  const amortization = parseFloat(period.amortization) || 0;
  const section179 = parseFloat(period.section179) || 0;
  const interest = parseFloat(period.interest) || 0;
  const addbacks = parseFloat(period.addbacks) || 0;
  
  return (netIncome + depreciation + amortization + section179 + interest + addbacks) * factor;
};

/**
 * Calculate affiliate cash flow for consolidated DSCR
 */
export const calculateAffiliateCashFlow = (period: AffiliateIncomeData, annualize: boolean = false): number => {
  const months = parseFloat(period.periodMonths) || 12;
  const factor = annualize ? (12 / months) : 1;
  
  const revenue = (parseFloat(period.revenue) || 0) + (parseFloat(period.otherIncome) || 0);
  const expenses = (parseFloat(period.cogs) || 0) + 
                   (parseFloat(period.operatingExpenses) || 0) +
                   (parseFloat(period.rentExpense) || 0) +
                   (parseFloat(period.officersComp) || 0) +
                   (parseFloat(period.otherExpenses) || 0);
  const ebitda = revenue - expenses;
  
  const depreciation = parseFloat(period.depreciation) || 0;
  const amortization = parseFloat(period.amortization) || 0;
  const section179 = parseFloat(period.section179) || 0;
  const interest = parseFloat(period.interest) || 0;
  const taxes = parseFloat(period.taxes) || 0;
  const addbacks = parseFloat(period.addbacks) || 0;
  
  // Net Income + Addbacks
  const ebit = ebitda - depreciation - amortization;
  const ebt = ebit - interest;
  const netIncome = ebt - taxes;
  
  return (netIncome + depreciation + amortization + section179 + interest + addbacks) * factor;
};

/**
 * SBA 7(a) Upfront Guaranty Fee — FY 2026 tiered structure.
 *
 * Tier is selected by TOTAL loan amount; the fee % applies to the GUARANTEED
 * portion. Loans with maturities > 12 months. Tier table is exported so the
 * SBA's annual revisions are a one-line change.
 *
 *   ≤ $150,000             → 2.00% × guaranteed
 *   $150,001 – $700,000    → 3.00% × guaranteed
 *   $700,001 – $1,000,000  → 3.50% × guaranteed
 *   > $1,000,000           → 3.50% × guaranteed up to $1M
 *                          + 3.75% × guaranteed above $1M
 */
export interface SBAGuaranteeFeeTier {
  /** Inclusive upper bound on TOTAL loan amount; Infinity = top tier. */
  upTo: number;
  /** Fee % applied to guaranteed portion at or below upToCap. */
  rate: number;
  /** Fee % applied to guaranteed portion above upToCap (top tier only). */
  rateOver?: number;
  /** Cap (on guaranteed portion) where `rate` ends and `rateOver` begins. */
  upToCap?: number;
}

export const SBA_GUARANTEE_FEE_TIERS: SBAGuaranteeFeeTier[] = [
  { upTo: 150_000, rate: 0.02 },
  { upTo: 700_000, rate: 0.03 },
  { upTo: 1_000_000, rate: 0.035 },
  { upTo: Infinity, rate: 0.035, rateOver: 0.0375, upToCap: 1_000_000 },
];

export const calculateSBAGuaranteeFee = (
  loanAmount: number,
  guaranteePercent: number
): number => {
  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return 0;
  const guaranteed = loanAmount * (guaranteePercent / 100);
  const tier = SBA_GUARANTEE_FEE_TIERS.find((t) => loanAmount <= t.upTo)
    ?? SBA_GUARANTEE_FEE_TIERS[SBA_GUARANTEE_FEE_TIERS.length - 1];
  if (tier.rateOver !== undefined && tier.upToCap !== undefined) {
    const under = Math.min(guaranteed, tier.upToCap);
    const over = Math.max(0, guaranteed - tier.upToCap);
    return under * tier.rate + over * tier.rateOver;
  }
  return guaranteed * tier.rate;
};

/**
 * SINGLE SOURCE OF TRUTH for the new SBA loan's annual P&I payment.
 * Principal MUST be the SBA 7(a) Loan amount (the plug from Sources & Uses),
 * NOT the primary request or total uses. Returns 0 when any input is missing
 * or invalid so empty states can render as "N/A".
 */
export const computeNewLoanAnnualPayment = (
  principal: number,
  interestRate: string | number,
  termMonths: string | number
): number => {
  const ratePct = parseFloat(String(interestRate ?? ""));
  const term = parseFloat(String(termMonths ?? ""));
  if (!Number.isFinite(ratePct) || ratePct <= 0) return 0;
  if (!Number.isFinite(term) || term <= 0) return 0;
  if (!Number.isFinite(principal) || principal <= 0) return 0;
  const r = ratePct / 100 / 12;
  const monthly = principal * (r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1);
  return monthly * 12;
};

/**
 * Iteratively compute the SBA 7(a) Loan amount (the "plug") consistent with the
 * Summary tab's Sources & Uses logic:
 *   financeFee = true  → SBA Loan = Primary Request + SBA Upfront Fee(SBA Loan) - Equity Injection
 *   financeFee = false → SBA Loan = max(0, Primary Request - Equity Injection)
 *                        (Fee is funded by a separate borrower injection source)
 */
export const computeSBALoanAmount = (
  uses: UseOfFunds[],
  equityInjection: number,
  guaranteePercent: number,
  financeFee: boolean = true
): number => {
  const primaryRequest = uses.reduce((sum, u) => sum + (parseFloat(u.amount) || 0), 0);
  const gp = Number.isFinite(guaranteePercent) ? guaranteePercent : 75;
  const equity = Number.isFinite(equityInjection) ? equityInjection : 0;
  if (!financeFee) {
    return Math.max(0, primaryRequest - equity);
  }
  let sba = Math.max(0, primaryRequest - equity);
  for (let i = 0; i < 12; i++) {
    const fee = calculateSBAGuaranteeFee(sba, gp);
    const newSba = Math.max(0, primaryRequest + fee - equity);
    if (Math.abs(newSba - sba) < 1) {
      sba = newSba;
      break;
    }
    sba = newSba;
  }
  return sba;
};

/**
 * Iteratively solve for down-payment ($) and resulting SBA loan given a
 * "% of total project cost" target. Total project cost = primaryRequest + fee
 * (when fee is financed) OR primaryRequest (when not financed but fee is a
 * separate injection — total project still includes it, so we always use
 * primaryRequest + fee for the % basis, matching how the Summary displays it).
 *   equity = pct × (primaryRequest + fee(loan))
 *   loan   = primaryRequest + fee(loan) − equity   (if financeFee)
 *          = primaryRequest − equity               (if !financeFee)
 * Fee tier is piecewise, so we iterate to convergence.
 */
export const computeDownPaymentAndLoan = (
  uses: UseOfFunds[],
  downPaymentPct: number,
  guaranteePercent: number,
  financeFee: boolean = true
): { equity: number; loan: number; fee: number; totalProject: number } => {
  const primaryRequest = uses.reduce((sum, u) => sum + (parseFloat(u.amount) || 0), 0);
  const gp = Number.isFinite(guaranteePercent) ? guaranteePercent : 75;
  const pct = Math.max(0, Math.min(100, downPaymentPct || 0)) / 100;
  if (primaryRequest <= 0) return { equity: 0, loan: 0, fee: 0, totalProject: 0 };
  let equity = pct * primaryRequest;
  let loan = 0;
  let fee = 0;
  for (let i = 0; i < 20; i++) {
    loan = financeFee
      ? Math.max(0, primaryRequest + fee - equity)
      : Math.max(0, primaryRequest - equity);
    const newFee = calculateSBAGuaranteeFee(loan, gp);
    const totalProject = primaryRequest + newFee;
    const newEquity = pct * totalProject;
    if (Math.abs(newFee - fee) < 0.5 && Math.abs(newEquity - equity) < 0.5) {
      fee = newFee;
      equity = newEquity;
      loan = financeFee ? Math.max(0, primaryRequest + fee - equity) : Math.max(0, primaryRequest - equity);
      break;
    }
    fee = newFee;
    equity = newEquity;
  }
  return { equity: Math.round(equity), loan, fee, totalProject: primaryRequest + fee };
};


/**
 * SBA annual service fee on the guaranteed portion (0.55%).
 */
export const computeSBAAnnualServiceFee = (
  sbaLoanAmount: number,
  guaranteePercent: number
): number => {
  if (!Number.isFinite(sbaLoanAmount) || sbaLoanAmount <= 0) return 0;
  const gp = Number.isFinite(guaranteePercent) ? guaranteePercent : 75;
  return sbaLoanAmount * (gp / 100) * 0.0055;
};

/**
 * Annual P&I on the proposed loan, computed from the SBA Loan amount (plug).
 * Every component must call this — or the lower-level computeNewLoanAnnualPayment —
 * so the same dollar figure shows up everywhere.
 */
export const calculateLoanAnnualDebtService = (
  uses: UseOfFunds[],
  interestRate: string,
  termMonths: string,
  guaranteePercent: string,
  equityInjection: string = "0",
  financeFee: boolean = true
): number => {
  const equity = parseFloat(equityInjection) || 0;
  const guaranteePct = parseFloat(guaranteePercent) || 75;
  const sbaLoan = computeSBALoanAmount(uses, equity, guaranteePct, financeFee);
  return computeNewLoanAnnualPayment(sbaLoan, interestRate, termMonths);
};

/**
 * Centralized DSCR calculation function
 * This ensures consistency across all components
 * 
 * IMPORTANT: For interim periods, the function annualizes the cash flow
 * by dividing by period months and multiplying by 12 to compare against
 * annual debt service properly.
 */
export const calculateDSCR = (input: DSCRCalculationInput): DSCRCalculationResult => {
  const {
    businessPeriod,
    personalPeriod,
    debts,
    personalLiabilitiesMonthly,
    uses,
    interestRate,
    termMonths,
    guaranteePercent,
    equityInjection = "0",
    financeGuaranteeFee = true,
    includeRentAddback = false,
    affiliateCashFlow = 0,
  } = input;

  const months = parseFloat(businessPeriod.periodMonths) || 12;
  const annualizationFactor = 12 / months;

  // EBITDA (annualized) — excludes Officers Comp (added back below)
  const businessRevenue = (parseFloat(businessPeriod.revenue) || 0) + (parseFloat(businessPeriod.otherIncome) || 0);
  const businessExpenses = (parseFloat(businessPeriod.cogs) || 0) +
                          (parseFloat(businessPeriod.operatingExpenses) || 0) +
                          (parseFloat(businessPeriod.rentExpense) || 0) +
                          (parseFloat(businessPeriod.otherExpenses) || 0);
  // Non-recurring adjustment (positive removes one-time expense, negative
  // removes one-time income). Flows into EBITDA/CFADS/DSCR/FCCR only.
  const nonRecurringAdj = (parseFloat(businessPeriod.nonRecurringAdjustment || "0") || 0) * annualizationFactor;
  const businessEbitda = (businessRevenue - businessExpenses) * annualizationFactor + nonRecurringAdj;

  const officersComp = (parseFloat(businessPeriod.officersComp) || 0) * annualizationFactor;
  const depreciationAddback = (parseFloat(businessPeriod.depreciation) || 0) * annualizationFactor;
  const amortizationAddback = (parseFloat(businessPeriod.amortization) || 0) * annualizationFactor;
  const section179Addback = (parseFloat(businessPeriod.section179) || 0) * annualizationFactor;
  const otherAddbacks = (parseFloat(businessPeriod.addbacks) || 0) * annualizationFactor;

  const businessCashFlow = businessEbitda + depreciationAddback + amortizationAddback + section179Addback + otherAddbacks;

  const personalW2Income = (parseFloat(personalPeriod.salary) || 0) +
                          (parseFloat(personalPeriod.bonuses) || 0) +
                          (parseFloat(personalPeriod.investments) || 0) +
                          (parseFloat(personalPeriod.rentalIncome) || 0) +
                          (parseFloat(personalPeriod.retirementIncome) || 0) +
                          (parseFloat(personalPeriod.otherIncome) || 0);

  const schedCRevenue = parseFloat(personalPeriod.schedCRevenue) || 0;
  const schedCExpenses = (parseFloat(personalPeriod.schedCCOGS) || 0) + (parseFloat(personalPeriod.schedCExpenses) || 0);
  const schedCAddbacks = (parseFloat(personalPeriod.schedCInterest) || 0) +
                        (parseFloat(personalPeriod.schedCDepreciation) || 0) +
                        (parseFloat(personalPeriod.schedCAmortization) || 0) +
                        (parseFloat(personalPeriod.schedCOther) || 0);
  const schedCCashFlow = (schedCRevenue - schedCExpenses) + schedCAddbacks;

  const schedEK1Income = (parseFloat(personalPeriod.schedENetRentalIncome) || 0) +
                         (parseFloat(personalPeriod.k1OrdinaryIncome) || 0) +
                         (parseFloat(personalPeriod.k1GuaranteedPayments) || 0);

  const totalIncomeAvailable = businessCashFlow + officersComp + personalW2Income + schedCCashFlow + schedEK1Income + affiliateCashFlow;

  const personalExpenses = (parseFloat(personalPeriod.costOfLiving) || 0) + (parseFloat(personalPeriod.personalTaxes) || 0);
  const estimatedTaxOnOfficersComp = officersComp * 0.30;
  const rentAddback = includeRentAddback ? (parseFloat(businessPeriod.rentExpense) || 0) * annualizationFactor : 0;

  // Existing business debt (annual P&I) — only debts flagged includeInDSCR (undefined defaults to true).
  const existingDebtPayment = debts.reduce((sum, debt) => {
    if (debt.includeInDSCR === false) return sum;
    const payment = parseFloat(debt.payment) || 0;
    return sum + (payment * 12);
  }, 0);

  const personalDebtPayment =
    (parseFloat(personalLiabilitiesMonthly.creditCardsMonthly) || 0) * 12 +
    (parseFloat(personalLiabilitiesMonthly.mortgagesMonthly) || 0) * 12 +
    (parseFloat(personalLiabilitiesMonthly.vehicleLoansMonthly) || 0) * 12 +
    (parseFloat(personalLiabilitiesMonthly.otherLiabilitiesMonthly) || 0) * 12;

  const netCashAvailable = totalIncomeAvailable - personalExpenses - estimatedTaxOnOfficersComp + rentAddback - personalDebtPayment;

  const equity = parseFloat(equityInjection) || 0;
  const guaranteePct = parseFloat(guaranteePercent) || 75;
  const sbaLoanAmount = computeSBALoanAmount(uses, equity, guaranteePct, financeGuaranteeFee);
  const proposedDebtPayment = computeNewLoanAnnualPayment(sbaLoanAmount, interestRate, termMonths);
  const sbaAnnualServiceFee = computeSBAAnnualServiceFee(sbaLoanAmount, guaranteePct);

  const annualDebtService = existingDebtPayment + proposedDebtPayment + sbaAnnualServiceFee;

  const dscr = annualDebtService > 0 ? netCashAvailable / annualDebtService : 0;

  return {
    dscr,
    businessEbitda,
    officersComp,
    personalW2Income,
    schedCCashFlow,
    totalIncomeAvailable,
    personalExpenses,
    estimatedTaxOnOfficersComp,
    netCashAvailable,
    annualDebtService,
    existingDebtPayment,
    personalDebtPayment,
    proposedDebtPayment,
    sbaAnnualServiceFee,
    sbaLoanAmount,
    rentAddback,
    depreciationAddback,
    amortizationAddback,
    section179Addback,
    otherAddbacks,
    businessCashFlow,
    affiliateCashFlow,
  };
};

/**
 * Calculate Fixed Charge Coverage Ratio (FCCR)
 * FCCR = (EBITDA + Rent + Lease Payments) / (Debt Service + Rent + Lease Payments)
 * This is a key SBA lending metric
 */
export const calculateFCCR = (
  ebitda: number,
  rentExpense: number,
  debtService: number
): { fccr: number; numerator: number; denominator: number } => {
  const numerator = ebitda + rentExpense;
  const denominator = debtService + rentExpense;
  return {
    fccr: denominator > 0 ? numerator / denominator : 0,
    numerator,
    denominator,
  };
};

/**
 * Calculate year-over-year change for a metric
 */
export const calculateYoYChange = (
  currentValue: number,
  previousValue: number
): { change: number; percentage: number; isPositive: boolean; formatted: string } => {
  if (previousValue === 0) {
    return { 
      change: currentValue,
      percentage: currentValue > 0 ? 100 : 0, 
      isPositive: currentValue >= 0,
      formatted: currentValue > 0 ? '+∞%' : '0%'
    };
  }
  const change = currentValue - previousValue;
  const percentage = (change / Math.abs(previousValue)) * 100;
  return {
    change,
    percentage,
    isPositive: change >= 0,
    formatted: `${change >= 0 ? '+' : ''}${percentage.toFixed(1)}%`
  };
};

/**
 * Validate M-1 Book Income ties to calculated Net Income
 */
export const validateM1TieOut = (
  calculatedNetIncome: number,
  m1BookIncome: number,
  tolerance: number = 1 // $1 tolerance for rounding
): { isValid: boolean; difference: number; warning?: string } => {
  const difference = Math.abs(calculatedNetIncome - m1BookIncome);
  const isValid = difference <= tolerance || m1BookIncome === 0; // Skip validation if M-1 not entered
  
  return {
    isValid,
    difference,
    warning: isValid ? undefined : `M-1 Book Income ($${m1BookIncome.toLocaleString()}) does not tie to calculated Net Income ($${calculatedNetIncome.toLocaleString()}). Difference: $${difference.toLocaleString()}`
  };
};

/**
 * Validate critical financial fields
 */
export const validateFinancialField = (
  value: string,
  fieldType: 'interestRate' | 'termMonths' | 'periodMonths' | 'percentage' | 'amount'
): { isValid: boolean; error?: string } => {
  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return { isValid: false, error: 'Must be a valid number' };
  }

  switch (fieldType) {
    case 'interestRate':
      if (numValue < 0 || numValue > 100) {
        return { isValid: false, error: 'Interest rate must be between 0% and 100%' };
      }
      break;
    case 'termMonths':
      if (numValue < 1 || numValue > 600) {
        return { isValid: false, error: 'Term must be between 1 and 600 months' };
      }
      break;
    case 'periodMonths':
      if (numValue < 1 || numValue > 12) {
        return { isValid: false, error: 'Period months must be between 1 and 12' };
      }
      break;
    case 'percentage':
      if (numValue < 0 || numValue > 100) {
        return { isValid: false, error: 'Percentage must be between 0% and 100%' };
      }
      break;
    case 'amount':
      if (numValue < 0) {
        return { isValid: false, error: 'Amount cannot be negative' };
      }
      break;
  }

  return { isValid: true };
};
