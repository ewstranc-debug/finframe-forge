// TypeScript interfaces for financial data structures

export interface BalanceSheetItem {
  id: string;
  label: string;
  values: string[];
  type: 'asset' | 'liability';
  isSubtotal?: boolean;
  isTotal?: boolean;
}

export interface DSCRBreakdownData {
  dscr: number;
  periodLabel: string;
  periodMonths: string;
  annualDebtService: number;
  netCashAvailable: number;
  businessEbitda: number;
  officersComp: number;
  personalW2Income: number;
  schedCCashFlow: number;
  personalExpenses: number;
  estimatedTaxOnOfficersComp: number;
  existingDebtPayment: number;
  personalDebtPayment: number;
  proposedDebtPayment: number;
  rentAddback?: number;
  depreciationAddback?: number;
  amortizationAddback?: number;
  section179Addback?: number;
  otherAddbacks?: number;
  businessCashFlow?: number;
  affiliateCashFlow?: number;
  totalIncomeAvailable?: number;
}

// Period classification for dynamic DSCR calculations
export interface PeriodClassification {
  index: number;
  months: number;
  label: string;
  isInterim: boolean;
  isProjection: boolean;
  isFYE: boolean;
}

export interface FinancialPeriod {
  index: number;
  label: string;
  months: number;
  isProjection: boolean;
  isInterim: boolean;
}

export interface BusinessMetrics {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  ebitda: number;
  ebit: number;
  ebt: number;
  netIncome: number;
  netMargin: number;
  cashFlow: number;
  opEx: number;
  rentExpense: number;
  officersComp: number;
  depreciation: number;
  amortization: number;
  section179: number;
  interest: number;
  taxes: number;
  otherIncome: number;
  otherExpenses: number;
  addbacks: number;
}

export interface BalanceSheetMetrics {
  currentAssets: number;
  netFixedAssets: number;
  totalAssets: number;
  currentLiabilities: number;
  longTermDebt: number;
  totalLiabilities: number;
  equity: number;
  currentRatio: number;
  quickRatio: number;
  debtToEquity: number;
  debtToAssets: number;
}

export interface TurnoverRatios {
  arTurnover: number;
  arDays: number;
  inventoryTurnover: number;
  inventoryDays: number;
  apTurnover: number;
  apDays: number;
  cashConversionCycle: number;
}

export interface PersonalMetrics {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquidAssets: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  debtToIncome: number;
  debtToAssets: number;
  savingsRate: number;
  liquidityRatio: number;
  currentRatio: number;
}

export interface GlobalMetrics {
  consolidatedNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  totalIncome: number;
  totalExpenses: number;
  debtToAssets: number;
  liquidityRatio: number;
  currentRatio: number;
  savingsRate: number;
  dscr: number;
}

// Debt schedule with enhanced fields
export interface EnhancedDebt {
  id: string;
  creditor: string;
  balance: string;
  payment: string;
  rate: string;
  term: string;
  maturityDate?: string;
  remainingTerm?: number;
  annualDebtService?: number;
}

// Collateral tracking
export interface CollateralItem {
  id: string;
  description: string;
  value: string;
  lienPosition: string;
  appraisedDate: string;
  collateralType: 'real_estate' | 'equipment' | 'inventory' | 'accounts_receivable' | 'other';
}
