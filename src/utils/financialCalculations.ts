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
  includeRentAddback?: boolean;
  affiliateCashFlow?: number; // Optional: include affiliate cash flow in consolidated DSCR
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
  annualDebtService: number;
  existingDebtPayment: number;
  personalDebtPayment: number;
  proposedDebtPayment: number;
  rentAddback?: number;
  // Enhanced breakdown fields
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
    const isFYE = months === 12 && !isInterim && !isProjection;
    
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
 * Find the last full year end period index
 */
export const findLastFYEIndex = (classifications: PeriodClassification[]): number | undefined => {
  const fyePeriods = classifications.filter(p => p.isFYE);
  if (fyePeriods.length === 0) return undefined;
  return fyePeriods.sort((a, b) => b.index - a.index)[0].index;
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
 * Calculate SBA loan annual debt service based on loan parameters
 * Updated to match 2024 SBA fee structure
 */
export const calculateLoanAnnualDebtService = (
  uses: UseOfFunds[],
  interestRate: string,
  termMonths: string,
  guaranteePercent: string
): number => {
  const primaryRequest = uses.reduce((sum, use) => sum + (parseFloat(use.amount) || 0), 0);
  const guaranteePct = parseFloat(guaranteePercent) || 75;
  const term = parseFloat(termMonths) || 1;
  
  // Calculate SBA upfront fee (2024 structure)
  let upfrontFee = 0;
  if (primaryRequest <= 150000) {
    upfrontFee = 0;
  } else if (primaryRequest <= 500000) {
    // 0% on first $150K, varies on $150K-$500K portion
    upfrontFee = (primaryRequest - 150000) * (term > 180 ? 0.0325 : 0.03);
  } else if (primaryRequest <= 1000000) {
    // Tiered for $500K-$1M
    upfrontFee = (350000 * 0.03) + ((primaryRequest - 500000) * 0.035);
  } else {
    // Loans over $1M: 3.5% on guaranteed portion over $1M
    upfrontFee = (350000 * 0.03) + (500000 * 0.035) + ((primaryRequest - 1000000) * 0.035);
  }
  
  const finalLoanAmount = primaryRequest + upfrontFee;
  const rate = (parseFloat(interestRate) || 0) / 100 / 12;
  
  if (rate === 0 || term === 0 || finalLoanAmount === 0) {
    return finalLoanAmount / (term || 1) * 12;
  }
  
  const monthlyPayment = finalLoanAmount * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
  return monthlyPayment * 12;
};

/**
 * Centralized DSCR calculation function
 * This ensures consistency across all components
 */
/**
 * Centralized DSCR calculation function
 * This ensures consistency across all components
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
    includeRentAddback = false,
    affiliateCashFlow = 0,
  } = input;

  // Get period months for annualization
  const months = parseFloat(businessPeriod.periodMonths) || 12;
  const annualizationFactor = 12 / months;

  // Calculate Business EBITDA (annualized) - excludes Officers Comp since we add it back
  const businessRevenue = (parseFloat(businessPeriod.revenue) || 0) + (parseFloat(businessPeriod.otherIncome) || 0);
  const businessExpenses = (parseFloat(businessPeriod.cogs) || 0) + 
                          (parseFloat(businessPeriod.operatingExpenses) || 0) +
                          (parseFloat(businessPeriod.rentExpense) || 0) +
                          (parseFloat(businessPeriod.otherExpenses) || 0);
  const businessEbitda = (businessRevenue - businessExpenses) * annualizationFactor;

  // Calculate Officers Compensation (annualized) - added back for SBA global DSCR
  const officersComp = (parseFloat(businessPeriod.officersComp) || 0) * annualizationFactor;

  // Add back depreciation, amortization, section 179, and other addbacks (annualized)
  const depreciationAddback = (parseFloat(businessPeriod.depreciation) || 0) * annualizationFactor;
  const amortizationAddback = (parseFloat(businessPeriod.amortization) || 0) * annualizationFactor;
  const section179Addback = (parseFloat(businessPeriod.section179) || 0) * annualizationFactor;
  const otherAddbacks = (parseFloat(businessPeriod.addbacks) || 0) * annualizationFactor;

  const businessCashFlow = businessEbitda + depreciationAddback + amortizationAddback + section179Addback + otherAddbacks;

  // Calculate Personal W-2 Income (including retirement income)
  const personalW2Income = (parseFloat(personalPeriod.salary) || 0) + 
                          (parseFloat(personalPeriod.bonuses) || 0) +
                          (parseFloat(personalPeriod.investments) || 0) +
                          (parseFloat(personalPeriod.rentalIncome) || 0) +
                          (parseFloat(personalPeriod.retirementIncome) || 0) +
                          (parseFloat(personalPeriod.otherIncome) || 0);

  // Calculate Schedule C Cash Flow
  const schedCRevenue = parseFloat(personalPeriod.schedCRevenue) || 0;
  const schedCExpenses = (parseFloat(personalPeriod.schedCCOGS) || 0) + (parseFloat(personalPeriod.schedCExpenses) || 0);
  const schedCAddbacks = (parseFloat(personalPeriod.schedCInterest) || 0) + 
                        (parseFloat(personalPeriod.schedCDepreciation) || 0) + 
                        (parseFloat(personalPeriod.schedCAmortization) || 0) +
                        (parseFloat(personalPeriod.schedCOther) || 0);
  const schedCCashFlow = (schedCRevenue - schedCExpenses) + schedCAddbacks;

  // Calculate total income available (includes affiliate if provided)
  const totalIncomeAvailable = businessCashFlow + officersComp + personalW2Income + schedCCashFlow + affiliateCashFlow;

  // Calculate personal expenses
  const personalExpenses = (parseFloat(personalPeriod.costOfLiving) || 0) + (parseFloat(personalPeriod.personalTaxes) || 0);
  
  // Estimate tax on officers compensation (30% rate)
  const estimatedTaxOnOfficersComp = officersComp * 0.30;

  // Calculate rent addback if requested
  const rentAddback = includeRentAddback ? (parseFloat(businessPeriod.rentExpense) || 0) * annualizationFactor : 0;

  // Calculate net cash available
  const netCashAvailable = totalIncomeAvailable - personalExpenses - estimatedTaxOnOfficersComp + rentAddback;

  // Calculate existing business debt payments
  const existingDebtPayment = debts.reduce((sum, debt) => {
    const payment = parseFloat(debt.payment) || 0;
    return sum + (payment * 12);
  }, 0);

  // Calculate personal debt payments
  const personalDebtPayment = 
    (parseFloat(personalLiabilitiesMonthly.creditCardsMonthly) || 0) * 12 +
    (parseFloat(personalLiabilitiesMonthly.mortgagesMonthly) || 0) * 12 +
    (parseFloat(personalLiabilitiesMonthly.vehicleLoansMonthly) || 0) * 12 +
    (parseFloat(personalLiabilitiesMonthly.otherLiabilitiesMonthly) || 0) * 12;

  // Calculate proposed loan debt service
  const proposedDebtPayment = calculateLoanAnnualDebtService(uses, interestRate, termMonths, guaranteePercent);

  // Total annual debt service
  const annualDebtService = existingDebtPayment + personalDebtPayment + proposedDebtPayment;

  // Calculate DSCR
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
