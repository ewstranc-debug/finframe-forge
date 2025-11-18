import { createContext, useContext, useState, ReactNode } from "react";

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
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

export const SpreadsheetProvider = ({ children }: { children: ReactNode }) => {
  // Summary state
  const [interestRate, setInterestRate] = useState("0");
  const [termMonths, setTermMonths] = useState("120");
  const [guaranteePercent, setGuaranteePercent] = useState("75");
  const [injectionEquity, setInjectionEquity] = useState("0");
  const [equityPercentage, setEquityPercentage] = useState("0");
  const [uses, setUses] = useState<UseOfFunds[]>([
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
  const [personalPeriods, setPersonalPeriods] = useState<PersonalPeriodData[]>([
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
  const [personalPeriodLabels, setPersonalPeriodLabels] = useState(["12/31/2023", "12/31/2024", "12/31/2025"]);

  // Business Financials state
  const [businessPeriods, setBusinessPeriods] = useState<BusinessPeriodData[]>([
    { 
      revenue: "0", cogs: "0", operatingExpenses: "0", rentExpense: "0", officersComp: "0",
      depreciation: "0", amortization: "0", section179: "0", interest: "0",
      otherIncome: "0", otherExpenses: "0", addbacks: "0", taxes: "0",
      m1BookIncome: "0", m1FedTaxExpense: "0", m1ExcessDepr: "0", m1Other: "0"
    },
    { 
      revenue: "0", cogs: "0", operatingExpenses: "0", rentExpense: "0", officersComp: "0",
      depreciation: "0", amortization: "0", section179: "0", interest: "0",
      otherIncome: "0", otherExpenses: "0", addbacks: "0", taxes: "0",
      m1BookIncome: "0", m1FedTaxExpense: "0", m1ExcessDepr: "0", m1Other: "0"
    },
    { 
      revenue: "0", cogs: "0", operatingExpenses: "0", rentExpense: "0", officersComp: "0",
      depreciation: "0", amortization: "0", section179: "0", interest: "0",
      otherIncome: "0", otherExpenses: "0", addbacks: "0", taxes: "0",
      m1BookIncome: "0", m1FedTaxExpense: "0", m1ExcessDepr: "0", m1Other: "0"
    },
    { 
      revenue: "0", cogs: "0", operatingExpenses: "0", rentExpense: "0", officersComp: "0",
      depreciation: "0", amortization: "0", section179: "0", interest: "0",
      otherIncome: "0", otherExpenses: "0", addbacks: "0", taxes: "0",
      m1BookIncome: "0", m1FedTaxExpense: "0", m1ExcessDepr: "0", m1Other: "0"
    }
  ]);
  const [businessPeriodLabels, setBusinessPeriodLabels] = useState(["12/31/2023", "12/31/2024", "12/31/2025", "Interim"]);

  // Interim period settings
  const [interimPeriodDate, setInterimPeriodDate] = useState("");
  const [interimPeriodMonths, setInterimPeriodMonths] = useState("12");

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
