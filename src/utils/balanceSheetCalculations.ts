import type { BusinessBalanceSheetPeriodData, BusinessPeriodData } from "@/contexts/SpreadsheetContext";
import type { BalanceSheetMetrics, TurnoverRatios } from "@/types/financial";

/**
 * Calculate current assets for a balance sheet period
 */
export const calculateCurrentAssets = (period: BusinessBalanceSheetPeriodData): number => {
  return (
    (parseFloat(period.cash) || 0) +
    (parseFloat(period.accountsReceivable) || 0) +
    (parseFloat(period.inventory) || 0) +
    (parseFloat(period.otherCurrentAssets) || 0)
  );
};

/**
 * Calculate net fixed assets for a balance sheet period
 */
export const calculateNetFixedAssets = (period: BusinessBalanceSheetPeriodData): number => {
  return (parseFloat(period.realEstate) || 0) - (parseFloat(period.accumulatedDepreciation) || 0);
};

/**
 * Calculate total assets for a balance sheet period
 */
export const calculateTotalAssets = (period: BusinessBalanceSheetPeriodData): number => {
  return calculateCurrentAssets(period) + calculateNetFixedAssets(period);
};

/**
 * Calculate total liabilities for a balance sheet period
 * Now includes separate A/P, accrued expenses, and short-term debt fields
 */
export const calculateTotalLiabilities = (period: BusinessBalanceSheetPeriodData): number => {
  const accountsPayable = parseFloat(period.accountsPayable) || 0;
  const accruedExpenses = parseFloat(period.accruedExpenses) || 0;
  const shortTermDebt = parseFloat(period.shortTermDebt) || 0;
  const otherCurrentLiab = parseFloat(period.currentLiabilities) || 0;
  const longTermDebt = parseFloat(period.longTermDebt) || 0;
  
  return accountsPayable + accruedExpenses + shortTermDebt + otherCurrentLiab + longTermDebt;
};

/**
 * Calculate equity for a balance sheet period
 */
export const calculateEquity = (period: BusinessBalanceSheetPeriodData): number => {
  return calculateTotalAssets(period) - calculateTotalLiabilities(period);
};

/**
 * Calculate current ratio using total current liabilities
 */
export const calculateCurrentRatio = (period: BusinessBalanceSheetPeriodData): number => {
  const currentAssets = calculateCurrentAssets(period);
  const currentLiabilities = (parseFloat(period.accountsPayable) || 0) + 
                             (parseFloat(period.accruedExpenses) || 0) + 
                             (parseFloat(period.shortTermDebt) || 0) + 
                             (parseFloat(period.currentLiabilities) || 0);
  return currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
};

/**
 * Calculate quick ratio using total current liabilities
 */
export const calculateQuickRatio = (period: BusinessBalanceSheetPeriodData): number => {
  const currentAssets = calculateCurrentAssets(period);
  const inventory = parseFloat(period.inventory) || 0;
  const currentLiabilities = (parseFloat(period.accountsPayable) || 0) + 
                             (parseFloat(period.accruedExpenses) || 0) + 
                             (parseFloat(period.shortTermDebt) || 0) + 
                             (parseFloat(period.currentLiabilities) || 0);
  return currentLiabilities > 0 ? (currentAssets - inventory) / currentLiabilities : 0;
};

/**
 * Calculate debt-to-equity ratio
 */
export const calculateDebtToEquity = (period: BusinessBalanceSheetPeriodData): number => {
  const totalLiabilities = calculateTotalLiabilities(period);
  const equity = calculateEquity(period);
  return equity > 0 ? totalLiabilities / equity : 0;
};

/**
 * Calculate debt-to-assets ratio
 */
export const calculateDebtToAssets = (period: BusinessBalanceSheetPeriodData): number => {
  const totalLiabilities = calculateTotalLiabilities(period);
  const totalAssets = calculateTotalAssets(period);
  return totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
};

/**
 * Calculate all balance sheet metrics for a period
 * Updated to use separate liability fields for accurate ratio calculations
 */
export const calculateBalanceSheetMetrics = (period: BusinessBalanceSheetPeriodData): BalanceSheetMetrics => {
  const currentAssets = calculateCurrentAssets(period);
  const netFixedAssets = calculateNetFixedAssets(period);
  const totalAssets = currentAssets + netFixedAssets;
  
  // Calculate current liabilities from separate fields
  const accountsPayable = parseFloat(period.accountsPayable) || 0;
  const accruedExpenses = parseFloat(period.accruedExpenses) || 0;
  const shortTermDebt = parseFloat(period.shortTermDebt) || 0;
  const otherCurrentLiab = parseFloat(period.currentLiabilities) || 0;
  const currentLiabilities = accountsPayable + accruedExpenses + shortTermDebt + otherCurrentLiab;
  
  const longTermDebt = parseFloat(period.longTermDebt) || 0;
  const totalLiabilities = currentLiabilities + longTermDebt;
  const equity = totalAssets - totalLiabilities;
  const inventory = parseFloat(period.inventory) || 0;

  return {
    currentAssets,
    netFixedAssets,
    totalAssets,
    currentLiabilities,
    longTermDebt,
    totalLiabilities,
    equity,
    currentRatio: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
    quickRatio: currentLiabilities > 0 ? (currentAssets - inventory) / currentLiabilities : 0,
    debtToEquity: equity > 0 ? totalLiabilities / equity : 0,
    debtToAssets: totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0,
  };
};

/**
 * Calculate AR turnover ratio (annualized revenue / AR)
 */
export const calculateARTurnover = (
  period: BusinessBalanceSheetPeriodData,
  annualizedRevenue: number
): number => {
  const ar = parseFloat(period.accountsReceivable) || 0;
  return ar > 0 ? annualizedRevenue / ar : 0;
};

/**
 * Calculate inventory turnover ratio (annualized COGS / inventory)
 */
export const calculateInventoryTurnover = (
  period: BusinessBalanceSheetPeriodData,
  annualizedCOGS: number
): number => {
  const inventory = parseFloat(period.inventory) || 0;
  return inventory > 0 ? annualizedCOGS / inventory : 0;
};

/**
 * Calculate AP turnover ratio (annualized COGS / AP)
 * Now uses dedicated accountsPayable field for accuracy
 */
export const calculateAPTurnover = (
  period: BusinessBalanceSheetPeriodData,
  annualizedCOGS: number
): number => {
  // Use accountsPayable if available, fall back to currentLiabilities for backward compatibility
  const ap = parseFloat(period.accountsPayable) || parseFloat(period.currentLiabilities) || 0;
  return ap > 0 ? annualizedCOGS / ap : 0;
};

/**
 * Calculate Fixed Charge Coverage Ratio (FCCR)
 * FCCR = (EBITDA + Rent) / (Debt Service + Rent)
 */
export const calculateFCCR = (
  ebitda: number,
  rentExpense: number,
  debtService: number
): number => {
  const numerator = ebitda + rentExpense;
  const denominator = debtService + rentExpense;
  return denominator > 0 ? numerator / denominator : 0;
};

/**
 * Calculate year-over-year change percentage
 */
export const calculateYoYChange = (
  currentValue: number,
  previousValue: number
): { change: number; isPositive: boolean; formatted: string } => {
  if (previousValue === 0) {
    return { 
      change: currentValue > 0 ? 100 : 0, 
      isPositive: currentValue >= 0,
      formatted: currentValue > 0 ? '+∞%' : '0%'
    };
  }
  const change = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  return {
    change,
    isPositive: change >= 0,
    formatted: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
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
  const isValid = difference <= tolerance;
  
  return {
    isValid,
    difference,
    warning: isValid ? undefined : `M-1 Book Income ($${m1BookIncome.toLocaleString()}) does not tie to calculated Net Income ($${calculatedNetIncome.toLocaleString()}). Difference: $${difference.toLocaleString()}`
  };
};

/**
 * Calculate all turnover ratios for a period
 */
export const calculateTurnoverRatios = (
  period: BusinessBalanceSheetPeriodData,
  annualizedRevenue: number,
  annualizedCOGS: number
): TurnoverRatios => {
  const arTurnover = calculateARTurnover(period, annualizedRevenue);
  const inventoryTurnover = calculateInventoryTurnover(period, annualizedCOGS);
  const apTurnover = calculateAPTurnover(period, annualizedCOGS);

  const arDays = arTurnover > 0 ? 365 / arTurnover : 0;
  const inventoryDays = inventoryTurnover > 0 ? 365 / inventoryTurnover : 0;
  const apDays = apTurnover > 0 ? 365 / apTurnover : 0;

  // Cash Conversion Cycle = Days Sales Outstanding + Days Inventory Outstanding - Days Payable Outstanding
  const cashConversionCycle = arDays + inventoryDays - apDays;

  return {
    arTurnover,
    arDays,
    inventoryTurnover,
    inventoryDays,
    apTurnover,
    apDays,
    cashConversionCycle,
  };
};

/**
 * Get annualized values from P&L period
 */
export const getAnnualizedValues = (
  businessPeriod: BusinessPeriodData
): { annualizedRevenue: number; annualizedCOGS: number } => {
  const months = parseFloat(businessPeriod.periodMonths) || 12;
  const annualizationFactor = 12 / months;
  
  const revenue = parseFloat(businessPeriod.revenue) || 0;
  const cogs = parseFloat(businessPeriod.cogs) || 0;

  return {
    annualizedRevenue: revenue * annualizationFactor,
    annualizedCOGS: cogs * annualizationFactor,
  };
};

/**
 * Format currency value
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format ratio value (e.g., 1.5x)
 */
export const formatRatio = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}x`;
};

/**
 * Format days value
 */
export const formatDays = (value: number): string => {
  return `${Math.round(value)} days`;
};
