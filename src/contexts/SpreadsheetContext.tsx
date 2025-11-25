import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Types for all data structures
export interface UseOfFunds {
  id: string;
  description: string;
  amount: string;
}

export interface PersonalPeriodData {
  salary: string;
  bonuses: string;
  investments: string;
  rentalIncome: string;
  otherIncome: string;
  costOfLiving: string;
  personalTaxes: string;
  schedCRevenue: string;
  schedCCOGS: string;
  schedCExpenses: string;
  schedCInterest: string;
  schedCDepreciation: string;
  schedCAmortization: string;
  schedCOther: string;
}

export interface BusinessPeriodData {
  revenue: string;
  cogs: string;
  operatingExpenses: string;
  rentExpense: string;
  officersComp: string;
  depreciation: string;
  amortization: string;
  section179: string;
  interest: string;
  otherIncome: string;
  otherExpenses: string;
  addbacks: string;
  taxes: string;
  m1BookIncome: string;
  m1FedTaxExpense: string;
  m1ExcessDepr: string;
  m1Other: string;
  periodDate: string;
  periodMonths: string;
}

export interface AssetData {
  liquidAssets: string;
  realEstate: string;
  vehicles: string;
  accountsReceivable: string;
  otherAssets: string;
}

export interface LiabilityData {
  creditCards: string;
  creditCardsMonthly: string;
  mortgages: string;
  mortgagesMonthly: string;
  vehicleLoans: string;
  vehicleLoansMonthly: string;
  otherLiabilities: string;
  otherLiabilitiesMonthly: string;
}

export interface Debt {
  id: string;
  creditor: string;
  balance: string;
  payment: string;
  rate: string;
  term: string;
}

export interface AffiliateIncomeData {
  revenue: string;
  cogs: string;
  operatingExpenses: string;
  depreciation: string;
  amortization: string;
  interest: string;
  taxes: string;
  periodDate: string;
  periodMonths: string;
}

export interface AffiliateBalanceSheetData {
  cash: string;
  accountsReceivable: string;
  inventory: string;
  realEstate: string;
  accumulatedDepreciation: string;
  currentLiabilities: string;
  longTermDebt: string;
}

export interface AffiliateEntity {
  id: string;
  name: string;
  incomePeriods: AffiliateIncomeData[];
  balancePeriods: AffiliateBalanceSheetData[];
}

export interface BusinessBalanceSheetPeriodData {
  cash: string;
  accountsReceivable: string;
  inventory: string;
  otherCurrentAssets: string;
  realEstate: string;
  accumulatedDepreciation: string;
  currentLiabilities: string;
  longTermDebt: string;
}

interface SpreadsheetContextType {
  // Summary state
  interestRate: string;
  setInterestRate: (val: string) => void;
  termMonths: string;
  setTermMonths: (val: string) => void;
  guaranteePercent: string;
  setGuaranteePercent: (val: string) => void;
  injectionEquity: string;
  setInjectionEquity: (val: string) => void;
  equityPercentage: string;
  setEquityPercentage: (val: string) => void;
  uses: UseOfFunds[];
  setUses: (uses: UseOfFunds[]) => void;
  
  // Personal Financials state
  personalPeriods: PersonalPeriodData[];
  setPersonalPeriods: (periods: PersonalPeriodData[]) => void;
  personalPeriodLabels: string[];
  setPersonalPeriodLabels: (labels: string[]) => void;
  
  // Business Financials state
  businessPeriods: BusinessPeriodData[];
  setBusinessPeriods: (periods: BusinessPeriodData[]) => void;
  businessPeriodLabels: string[];
  setBusinessPeriodLabels: (labels: string[]) => void;
  
  // Interim period settings
  interimPeriodDate: string;
  setInterimPeriodDate: (val: string) => void;
  interimPeriodMonths: string;
  setInterimPeriodMonths: (val: string) => void;
  
  // Personal Financial Statement state
  personalAssets: AssetData;
  setPersonalAssets: (assets: AssetData) => void;
  personalLiabilities: LiabilityData;
  setPersonalLiabilities: (liabilities: LiabilityData) => void;
  
  // Existing Debts state
  debts: Debt[];
  setDebts: (debts: Debt[]) => void;
  
  // Affiliate Financials state
  affiliateEntities: AffiliateEntity[];
  setAffiliateEntities: (entities: AffiliateEntity[]) => void;
  affiliatePeriodLabels: string[];
  setAffiliatePeriodLabels: (labels: string[]) => void;
  
  // Business Balance Sheet state
  businessBalanceSheetPeriods: BusinessBalanceSheetPeriodData[];
  setBusinessBalanceSheetPeriods: (periods: BusinessBalanceSheetPeriodData[]) => void;
  businessBalanceSheetLabels: string[];
  setBusinessBalanceSheetLabels: (labels: string[]) => void;
  
  // Financial Analysis state
  financialAnalysis: string;
  setFinancialAnalysis: (analysis: string) => void;
  
  // Save status
  saveStatus: 'saved' | 'saving' | 'error';
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

export const SpreadsheetProvider = ({ children }: { children: ReactNode }) => {
  // Use localStorage for all state with auto-save
  const [interestRate, setInterestRate, interestRateStatus] = useLocalStorage("financialTool_interestRate", "0");
  const [termMonths, setTermMonths, termMonthsStatus] = useLocalStorage("financialTool_termMonths", "120");
  const [guaranteePercent, setGuaranteePercent, guaranteePercentStatus] = useLocalStorage("financialTool_guaranteePercent", "75");
  const [injectionEquity, setInjectionEquity, injectionEquityStatus] = useLocalStorage("financialTool_injectionEquity", "0");
  const [equityPercentage, setEquityPercentage, equityPercentageStatus] = useLocalStorage("financialTool_equityPercentage", "0");
  const [uses, setUses, usesStatus] = useLocalStorage<UseOfFunds[]>("financialTool_uses", [
    { id: "1", description: "RE Purchase", amount: "0" },
    { id: "2", description: "Refinance", amount: "0" },
    { id: "3", description: "Working Capital", amount: "0" },
    { id: "4", description: "Inventory", amount: "0" },
    { id: "5", description: "Business Acquisition", amount: "0" },
    { id: "6", description: "Construction", amount: "0" },
    { id: "7", description: "Contingency", amount: "0" },
    { id: "8", description: "Interest Reserve", amount: "0" },
  ]);

  // Personal Financials state
  const [personalPeriods, setPersonalPeriods, personalPeriodsStatus] = useLocalStorage<PersonalPeriodData[]>("financialTool_personalPeriods", [
    { 
      salary: "0", bonuses: "0", investments: "0", rentalIncome: "0", otherIncome: "0",
      costOfLiving: "0", personalTaxes: "0",
      schedCRevenue: "0", schedCCOGS: "0", schedCExpenses: "0", 
      schedCInterest: "0", schedCDepreciation: "0", schedCAmortization: "0", schedCOther: "0"
    },
    { 
      salary: "0", bonuses: "0", investments: "0", rentalIncome: "0", otherIncome: "0",
      costOfLiving: "0", personalTaxes: "0",
      schedCRevenue: "0", schedCCOGS: "0", schedCExpenses: "0", 
      schedCInterest: "0", schedCDepreciation: "0", schedCAmortization: "0", schedCOther: "0"
    },
    { 
      salary: "0", bonuses: "0", investments: "0", rentalIncome: "0", otherIncome: "0",
      costOfLiving: "0", personalTaxes: "0",
      schedCRevenue: "0", schedCCOGS: "0", schedCExpenses: "0", 
      schedCInterest: "0", schedCDepreciation: "0", schedCAmortization: "0", schedCOther: "0"
    }
  ]);
  const [personalPeriodLabels, setPersonalPeriodLabels, personalPeriodLabelsStatus] = useLocalStorage("financialTool_personalPeriodLabels", ["12/31/2023", "12/31/2024", "12/31/2025"]);

  // Business Financials state
  const [businessPeriods, setBusinessPeriods, businessPeriodsStatus] = useLocalStorage<BusinessPeriodData[]>("financialTool_businessPeriods", [
    { 
      revenue: "0", cogs: "0", operatingExpenses: "0", rentExpense: "0", officersComp: "0",
      depreciation: "0", amortization: "0", section179: "0", interest: "0",
      otherIncome: "0", otherExpenses: "0", addbacks: "0", taxes: "0",
      m1BookIncome: "0", m1FedTaxExpense: "0", m1ExcessDepr: "0", m1Other: "0",
      periodDate: "", periodMonths: "12"
    },
    { 
      revenue: "0", cogs: "0", operatingExpenses: "0", rentExpense: "0", officersComp: "0",
      depreciation: "0", amortization: "0", section179: "0", interest: "0",
      otherIncome: "0", otherExpenses: "0", addbacks: "0", taxes: "0",
      m1BookIncome: "0", m1FedTaxExpense: "0", m1ExcessDepr: "0", m1Other: "0",
      periodDate: "", periodMonths: "12"
    },
    { 
      revenue: "0", cogs: "0", operatingExpenses: "0", rentExpense: "0", officersComp: "0",
      depreciation: "0", amortization: "0", section179: "0", interest: "0",
      otherIncome: "0", otherExpenses: "0", addbacks: "0", taxes: "0",
      m1BookIncome: "0", m1FedTaxExpense: "0", m1ExcessDepr: "0", m1Other: "0",
      periodDate: "", periodMonths: "12"
    },
    { 
      revenue: "0", cogs: "0", operatingExpenses: "0", rentExpense: "0", officersComp: "0",
      depreciation: "0", amortization: "0", section179: "0", interest: "0",
      otherIncome: "0", otherExpenses: "0", addbacks: "0", taxes: "0",
      m1BookIncome: "0", m1FedTaxExpense: "0", m1ExcessDepr: "0", m1Other: "0",
      periodDate: "", periodMonths: "12"
    }
  ]);
  const [businessPeriodLabels, setBusinessPeriodLabels, businessPeriodLabelsStatus] = useLocalStorage("financialTool_businessPeriodLabels", ["12/31/2023", "12/31/2024", "12/31/2025", "Interim"]);

  // Interim period settings (kept for backward compatibility but now handled per-period)
  const [interimPeriodDate, setInterimPeriodDate, interimPeriodDateStatus] = useLocalStorage("financialTool_interimPeriodDate", "");
  const [interimPeriodMonths, setInterimPeriodMonths, interimPeriodMonthsStatus] = useLocalStorage("financialTool_interimPeriodMonths", "12");

  // Personal Financial Statement state
  const [personalAssets, setPersonalAssets, personalAssetsStatus] = useLocalStorage<AssetData>("financialTool_personalAssets", {
    liquidAssets: "0",
    realEstate: "0",
    vehicles: "0",
    accountsReceivable: "0",
    otherAssets: "0"
  });

  const [personalLiabilities, setPersonalLiabilities, personalLiabilitiesStatus] = useLocalStorage<LiabilityData>("financialTool_personalLiabilities", {
    creditCards: "0",
    creditCardsMonthly: "0",
    mortgages: "0",
    mortgagesMonthly: "0",
    vehicleLoans: "0",
    vehicleLoansMonthly: "0",
    otherLiabilities: "0",
    otherLiabilitiesMonthly: "0"
  });

  // Existing Debts state
  const [debts, setDebts, debtsStatus] = useLocalStorage<Debt[]>("financialTool_debts", [
    { id: "1", creditor: "Creditor 1", balance: "0", payment: "0", rate: "0", term: "0" }
  ]);

  // Affiliate Financials state
  const [affiliateEntities, setAffiliateEntities, affiliateEntitiesStatus] = useLocalStorage<AffiliateEntity[]>("financialTool_affiliateEntities", [
    { 
      id: "1", 
      name: "Affiliate 1", 
      incomePeriods: [
        { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", amortization: "0", interest: "0", taxes: "0", periodDate: "", periodMonths: "12" },
        { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", amortization: "0", interest: "0", taxes: "0", periodDate: "", periodMonths: "12" },
        { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", amortization: "0", interest: "0", taxes: "0", periodDate: "", periodMonths: "12" },
        { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", amortization: "0", interest: "0", taxes: "0", periodDate: "", periodMonths: "12" }
      ],
      balancePeriods: [
        { cash: "0", accountsReceivable: "0", inventory: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" },
        { cash: "0", accountsReceivable: "0", inventory: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" },
        { cash: "0", accountsReceivable: "0", inventory: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" },
        { cash: "0", accountsReceivable: "0", inventory: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" }
      ]
    }
  ]);
  const [affiliatePeriodLabels, setAffiliatePeriodLabels, affiliatePeriodLabelsStatus] = useLocalStorage("financialTool_affiliatePeriodLabels", ["12/31/2023", "12/31/2024", "12/31/2025", "Interim"]);

  // Business Balance Sheet state
  const [businessBalanceSheetPeriods, setBusinessBalanceSheetPeriods, businessBalanceSheetPeriodsStatus] = useLocalStorage<BusinessBalanceSheetPeriodData[]>("financialTool_businessBalanceSheetPeriods", [
    { cash: "0", accountsReceivable: "0", inventory: "0", otherCurrentAssets: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" },
    { cash: "0", accountsReceivable: "0", inventory: "0", otherCurrentAssets: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" },
    { cash: "0", accountsReceivable: "0", inventory: "0", otherCurrentAssets: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" },
    { cash: "0", accountsReceivable: "0", inventory: "0", otherCurrentAssets: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" }
  ]);
  const [businessBalanceSheetLabels, setBusinessBalanceSheetLabels, businessBalanceSheetLabelsStatus] = useLocalStorage("financialTool_businessBalanceSheetLabels", ["12/31/2023", "12/31/2024", "12/31/2025", "Interim"]);

  // Financial Analysis state
  const [financialAnalysis, setFinancialAnalysis, financialAnalysisStatus] = useLocalStorage("financialTool_financialAnalysis", "");
  
  // Calculate overall save status
  const allStatuses = [
    interestRateStatus, termMonthsStatus, guaranteePercentStatus, injectionEquityStatus, 
    equityPercentageStatus, usesStatus, personalPeriodsStatus, personalPeriodLabelsStatus,
    businessPeriodsStatus, businessPeriodLabelsStatus, interimPeriodDateStatus, interimPeriodMonthsStatus,
    personalAssetsStatus, personalLiabilitiesStatus, debtsStatus, affiliateEntitiesStatus,
    affiliatePeriodLabelsStatus, businessBalanceSheetPeriodsStatus, businessBalanceSheetLabelsStatus,
    financialAnalysisStatus
  ];
  
  const saveStatus: 'saved' | 'saving' | 'error' = 
    allStatuses.some(s => s === 'error') ? 'error' :
    allStatuses.some(s => s === 'saving') ? 'saving' : 'saved';

  return (
    <SpreadsheetContext.Provider value={{
      interestRate, setInterestRate,
      termMonths, setTermMonths,
      guaranteePercent, setGuaranteePercent,
      injectionEquity, setInjectionEquity,
      equityPercentage, setEquityPercentage,
      uses, setUses,
      personalPeriods, setPersonalPeriods,
      personalPeriodLabels, setPersonalPeriodLabels,
      businessPeriods, setBusinessPeriods,
      businessPeriodLabels, setBusinessPeriodLabels,
      interimPeriodDate, setInterimPeriodDate,
      interimPeriodMonths, setInterimPeriodMonths,
      personalAssets, setPersonalAssets,
      personalLiabilities, setPersonalLiabilities,
      debts, setDebts,
      affiliateEntities, setAffiliateEntities,
      affiliatePeriodLabels, setAffiliatePeriodLabels,
      businessBalanceSheetPeriods, setBusinessBalanceSheetPeriods,
      businessBalanceSheetLabels, setBusinessBalanceSheetLabels,
      financialAnalysis, setFinancialAnalysis,
      saveStatus,
    }}>
      {children}
    </SpreadsheetContext.Provider>
  );
};

export const useSpreadsheet = () => {
  const context = useContext(SpreadsheetContext);
  if (!context) {
    throw new Error("useSpreadsheet must be used within SpreadsheetProvider");
  }
  return context;
};
