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
 * Tier is selected based on the TOTAL loan amount, then the fee % is applied to
 * the guaranteed portion. Loans with maturities > 12 months:
 *   ≤ $150,000            → 2.00%
 *   $150,001 – $1,000,000 → 3.00%
 *   > $1,000,000          → 3.50% on guaranteed ≤ $1M + 3.75% on guaranteed > $1M
 */
export const calculateSBAGuaranteeFee = (
  loanAmount: number,
  guaranteePercent: number
): number => {
  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return 0;
  const guaranteed = loanAmount * (guaranteePercent / 100);
  if (loanAmount <= 150000) return guaranteed * 0.02;
  if (loanAmount <= 1000000) return guaranteed * 0.03;
  const guaranteedUpToCap = Math.min(guaranteed, 1000000);
  const guaranteedOver = Math.max(0, guaranteed - 1000000);
  return guaranteedUpToCap * 0.035 + guaranteedOver * 0.0375;
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
 *   SBA Loan = Primary Request + SBA Upfront Fee(SBA Loan) - Equity Injection
 */
export const computeSBALoanAmount = (
  uses: UseOfFunds[],
  equityInjection: number,
  guaranteePercent: number
): number => {
  const primaryRequest = uses.reduce((sum, u) => sum + (parseFloat(u.amount) || 0), 0);
  const gp = Number.isFinite(guaranteePercent) ? guaranteePercent : 75;
  const equity = Number.isFinite(equityInjection) ? equityInjection : 0;
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
  equityInjection: string = "0"
): number => {
  const equity = parseFloat(equityInjection) || 0;
  const guaranteePct = parseFloat(guaranteePercent) || 75;
  const sbaLoan = computeSBALoanAmount(uses, equity, guaranteePct);
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
  const businessEbitda = (businessRevenue - businessExpenses) * annualizationFactor;

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

  // Existing business debt (annual P&I from Existing Debts tab)
  const existingDebtPayment = debts.reduce((sum, debt) => {
    const payment = parseFloat(debt.payment) || 0;
    return sum + (payment * 12);
  }, 0);

  // Personal debt service — subtracted from net cash (not in the denominator)
  const personalDebtPayment =
    (parseFloat(personalLiabilitiesMonthly.creditCardsMonthly) || 0) * 12 +
    (parseFloat(personalLiabilitiesMonthly.mortgagesMonthly) || 0) * 12 +
    (parseFloat(personalLiabilitiesMonthly.vehicleLoansMonthly) || 0) * 12 +
    (parseFloat(personalLiabilitiesMonthly.otherLiabilitiesMonthly) || 0) * 12;

  // Net cash available for debt service
  const netCashAvailable = totalIncomeAvailable - personalExpenses - estimatedTaxOnOfficersComp + rentAddback - personalDebtPayment;

  // Proposed-loan principal = SBA Loan plug (the same figure shown on Summary)
  const equity = parseFloat(equityInjection) || 0;
  const guaranteePct = parseFloat(guaranteePercent) || 75;
  const sbaLoanAmount = computeSBALoanAmount(uses, equity, guaranteePct);
  const proposedDebtPayment = computeNewLoanAnnualPayment(sbaLoanAmount, interestRate, termMonths);
  const sbaAnnualServiceFee = computeSBAAnnualServiceFee(sbaLoanAmount, guaranteePct);

  // DSCR denominator: 3 auditable line items
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
