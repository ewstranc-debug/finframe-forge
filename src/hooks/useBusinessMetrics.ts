import { useMemo } from 'react';
import type { BusinessPeriodData } from '@/contexts/SpreadsheetContext';
import type { BusinessMetrics, FinancialPeriod } from '@/types/financial';

interface UseBusinessMetricsOptions {
  businessPeriods: BusinessPeriodData[];
  businessPeriodLabels: string[];
}

/**
 * Calculate business metrics for a single period
 */
export const calculateBusinessMetrics = (period: BusinessPeriodData): BusinessMetrics => {
  const revenue = parseFloat(period.revenue) || 0;
  const cogs = parseFloat(period.cogs) || 0;
  const opEx = parseFloat(period.operatingExpenses) || 0;
  const rentExpense = parseFloat(period.rentExpense) || 0;
  const officersComp = parseFloat(period.officersComp) || 0;
  const depreciation = parseFloat(period.depreciation) || 0;
  const amortization = parseFloat(period.amortization) || 0;
  const section179 = parseFloat(period.section179) || 0;
  const interest = parseFloat(period.interest) || 0;
  const taxes = parseFloat(period.taxes) || 0;
  const otherIncome = parseFloat(period.otherIncome) || 0;
  const otherExpenses = parseFloat(period.otherExpenses) || 0;
  const addbacks = parseFloat(period.addbacks) || 0;

  const grossProfit = revenue - cogs;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  // EBITDA = Revenue + Other Income - COGS - OpEx - Rent - Officers Comp - Other Expenses + Addbacks
  const ebitda = (revenue + otherIncome) - cogs - opEx - rentExpense - officersComp - otherExpenses + addbacks;
  
  // EBIT = EBITDA - Depreciation - Amortization - Section 179
  const ebit = ebitda - depreciation - amortization - section179;
  
  // EBT = EBIT - Interest
  const ebt = ebit - interest;
  
  // Net Income = EBT - Taxes
  const netIncome = ebt - taxes;
  const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;

  // Cash Flow = Net Income + Non-cash addbacks
  const cashFlow = netIncome + depreciation + amortization + section179 + interest + addbacks;

  return {
    revenue,
    cogs,
    grossProfit,
    grossMargin,
    ebitda,
    ebit,
    ebt,
    netIncome,
    netMargin,
    cashFlow,
    opEx,
    rentExpense,
    officersComp,
    depreciation,
    amortization,
    section179,
    interest,
    taxes,
    otherIncome,
    otherExpenses,
    addbacks,
  };
};

/**
 * Get annualized metrics from a period
 */
export const getAnnualizedMetrics = (
  metrics: BusinessMetrics,
  periodMonths: number
): BusinessMetrics => {
  const factor = 12 / periodMonths;
  
  return {
    revenue: metrics.revenue * factor,
    cogs: metrics.cogs * factor,
    grossProfit: metrics.grossProfit * factor,
    grossMargin: metrics.grossMargin, // Margin doesn't need annualization
    ebitda: metrics.ebitda * factor,
    ebit: metrics.ebit * factor,
    ebt: metrics.ebt * factor,
    netIncome: metrics.netIncome * factor,
    netMargin: metrics.netMargin, // Margin doesn't need annualization
    cashFlow: metrics.cashFlow * factor,
    opEx: metrics.opEx * factor,
    rentExpense: metrics.rentExpense * factor,
    officersComp: metrics.officersComp * factor,
    depreciation: metrics.depreciation * factor,
    amortization: metrics.amortization * factor,
    section179: metrics.section179 * factor,
    interest: metrics.interest * factor,
    taxes: metrics.taxes * factor,
    otherIncome: metrics.otherIncome * factor,
    otherExpenses: metrics.otherExpenses * factor,
    addbacks: metrics.addbacks * factor,
  };
};

/**
 * Custom hook for memoized business metrics calculations
 */
export function useBusinessMetrics({
  businessPeriods,
  businessPeriodLabels,
}: UseBusinessMetricsOptions) {
  
  // Classify periods
  const periodInfo = useMemo((): FinancialPeriod[] => {
    return businessPeriods.map((p, i) => ({
      index: i,
      label: businessPeriodLabels[i] || `Period ${i + 1}`,
      months: parseFloat(p.periodMonths) || 0,
      isProjection: p.isProjection || false,
      isInterim: (parseFloat(p.periodMonths) || 12) < 12 || 
                 (businessPeriodLabels[i] || '').toLowerCase().includes('interim'),
    }));
  }, [businessPeriods, businessPeriodLabels]);

  // Calculate metrics for all periods
  const allMetrics = useMemo((): BusinessMetrics[] => {
    return businessPeriods.map(period => calculateBusinessMetrics(period));
  }, [businessPeriods]);

  // Annualized metrics
  const annualizedMetrics = useMemo((): BusinessMetrics[] => {
    return businessPeriods.map((period, index) => {
      const months = parseFloat(period.periodMonths) || 12;
      return getAnnualizedMetrics(allMetrics[index], months);
    });
  }, [businessPeriods, allMetrics]);

  // Find last full year end period (12 months, not interim)
  const lastFYEPeriod = useMemo(() => {
    const fullYearPeriods = periodInfo
      .filter(p => p.months === 12 && !p.isInterim && !p.isProjection)
      .sort((a, b) => b.index - a.index);
    return fullYearPeriods[0] || null;
  }, [periodInfo]);

  // Find all interim periods
  const interimPeriods = useMemo(() => {
    return periodInfo.filter(p => p.isInterim && !p.isProjection);
  }, [periodInfo]);

  // Find all projection periods
  const projectionPeriods = useMemo(() => {
    return periodInfo.filter(p => p.isProjection);
  }, [periodInfo]);

  // Get metrics for last FYE
  const lastFYEMetrics = useMemo(() => {
    if (!lastFYEPeriod) return null;
    return allMetrics[lastFYEPeriod.index];
  }, [lastFYEPeriod, allMetrics]);

  // Get annualized metrics for last FYE
  const lastFYEAnnualizedMetrics = useMemo(() => {
    if (!lastFYEPeriod) return null;
    return annualizedMetrics[lastFYEPeriod.index];
  }, [lastFYEPeriod, annualizedMetrics]);

  return {
    periodInfo,
    allMetrics,
    annualizedMetrics,
    lastFYEPeriod,
    lastFYEMetrics,
    lastFYEAnnualizedMetrics,
    interimPeriods,
    projectionPeriods,
    getMetrics: (index: number) => allMetrics[index],
    getAnnualizedMetrics: (index: number) => annualizedMetrics[index],
    getPeriodInfo: (index: number) => periodInfo[index],
  };
}

export default useBusinessMetrics;
