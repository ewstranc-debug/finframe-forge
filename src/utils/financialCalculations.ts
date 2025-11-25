import { BusinessPeriodData, PersonalPeriodData, Debt, UseOfFunds } from "@/contexts/SpreadsheetContext";

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
}

/**
 * Calculate SBA loan annual debt service based on loan parameters
 */
export const calculateLoanAnnualDebtService = (
  uses: UseOfFunds[],
  interestRate: string,
  termMonths: string,
  guaranteePercent: string
): number => {
  const primaryRequest = uses.reduce((sum, use) => sum + (parseFloat(use.amount) || 0), 0);
  const guaranteePct = parseFloat(guaranteePercent) || 75;
  
  // Calculate SBA upfront fee
  let upfrontFee = 0;
  if (primaryRequest <= 150000) {
    upfrontFee = 0;
  } else if (primaryRequest <= 700000) {
    upfrontFee = (primaryRequest - 150000) * 0.03;
  } else {
    upfrontFee = (550000 * 0.03) + ((primaryRequest - 700000) * 0.035);
  }
  
  const finalLoanAmount = primaryRequest + upfrontFee;
  const rate = (parseFloat(interestRate) || 0) / 100 / 12;
  const term = parseFloat(termMonths) || 1;
  
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
  } = input;

  // Get period months for annualization
  const months = parseFloat(businessPeriod.periodMonths) || 12;
  const annualizationFactor = 12 / months;

  // Calculate Business EBITDA (annualized)
  const businessRevenue = (parseFloat(businessPeriod.revenue) || 0) + (parseFloat(businessPeriod.otherIncome) || 0);
  const businessExpenses = (parseFloat(businessPeriod.cogs) || 0) + 
                          (parseFloat(businessPeriod.operatingExpenses) || 0) +
                          (parseFloat(businessPeriod.rentExpense) || 0) +
                          (parseFloat(businessPeriod.otherExpenses) || 0);
  const businessEbitda = (businessRevenue - businessExpenses) * annualizationFactor;

  // Calculate Officers Compensation (annualized)
  const officersComp = (parseFloat(businessPeriod.officersComp) || 0) * annualizationFactor;

  // Add back depreciation, amortization, section 179, and other addbacks
  const depreciationAddback = (parseFloat(businessPeriod.depreciation) || 0) * annualizationFactor;
  const amortizationAddback = (parseFloat(businessPeriod.amortization) || 0) * annualizationFactor;
  const section179Addback = (parseFloat(businessPeriod.section179) || 0) * annualizationFactor;
  const otherAddbacks = (parseFloat(businessPeriod.addbacks) || 0) * annualizationFactor;

  const businessCashFlow = businessEbitda + depreciationAddback + amortizationAddback + section179Addback + otherAddbacks;

  // Calculate Personal W-2 Income
  const personalW2Income = (parseFloat(personalPeriod.salary) || 0) + 
                          (parseFloat(personalPeriod.bonuses) || 0) +
                          (parseFloat(personalPeriod.investments) || 0) +
                          (parseFloat(personalPeriod.rentalIncome) || 0) +
                          (parseFloat(personalPeriod.otherIncome) || 0);

  // Calculate Schedule C Cash Flow
  const schedCRevenue = parseFloat(personalPeriod.schedCRevenue) || 0;
  const schedCExpenses = (parseFloat(personalPeriod.schedCCOGS) || 0) + (parseFloat(personalPeriod.schedCExpenses) || 0);
  const schedCAddbacks = (parseFloat(personalPeriod.schedCInterest) || 0) + 
                        (parseFloat(personalPeriod.schedCDepreciation) || 0) + 
                        (parseFloat(personalPeriod.schedCAmortization) || 0) +
                        (parseFloat(personalPeriod.schedCOther) || 0);
  const schedCCashFlow = (schedCRevenue - schedCExpenses) + schedCAddbacks;

  // Calculate total income available
  const totalIncomeAvailable = businessCashFlow + officersComp + personalW2Income + schedCCashFlow;

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
