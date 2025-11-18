import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";
import { useSpreadsheet, BusinessPeriodData } from "@/contexts/SpreadsheetContext";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const BusinessFinancials = () => {
  const {
    businessPeriods,
    setBusinessPeriods,
    businessPeriodLabels,
    setBusinessPeriodLabels,
    personalPeriods,
    interestRate,
    termMonths,
    guaranteePercent,
    uses,
    interimPeriodDate,
    setInterimPeriodDate,
    interimPeriodMonths,
    setInterimPeriodMonths,
  } = useSpreadsheet();

  const updateField = (periodIndex: number, field: keyof BusinessPeriodData, value: string) => {
    const newPeriods = [...businessPeriods];
    newPeriods[periodIndex] = { ...newPeriods[periodIndex], [field]: value };
    setBusinessPeriods(newPeriods);
  };

  const updatePeriodLabel = (index: number, value: string) => {
    const newLabels = [...businessPeriodLabels];
    newLabels[index] = value;
    setBusinessPeriodLabels(newLabels);
  };

  const clearColumn = (periodIndex: number) => {
    const clearedPeriod: BusinessPeriodData = {
      revenue: "0", cogs: "0", operatingExpenses: "0", rentExpense: "0", officersComp: "0",
      depreciation: "0", amortization: "0", section179: "0", interest: "0",
      otherIncome: "0", otherExpenses: "0", addbacks: "0", taxes: "0",
      m1BookIncome: "0", m1FedTaxExpense: "0", m1ExcessDepr: "0", m1Other: "0",
      periodDate: businessPeriods[periodIndex].periodDate,
      periodMonths: businessPeriods[periodIndex].periodMonths
    };
    const newPeriods = [...businessPeriods];
    newPeriods[periodIndex] = clearedPeriod;
    setBusinessPeriods(newPeriods);
  };

  const calculateEBITDA = (periodIndex: number) => {
    const period = businessPeriods[periodIndex];
    const revenue = (parseFloat(period.revenue) || 0) + (parseFloat(period.otherIncome) || 0);
    const expenses = (parseFloat(period.cogs) || 0) + 
                     (parseFloat(period.operatingExpenses) || 0) +
                     (parseFloat(period.rentExpense) || 0) +
                     (parseFloat(period.officersComp) || 0) +
                     (parseFloat(period.otherExpenses) || 0);
    const result = revenue - expenses;
    // Annualize based on period months
    const months = parseFloat(period.periodMonths) || 12;
    return result * (12 / months);
  };

  const calculateEBIT = (periodIndex: number) => {
    const ebitda = calculateEBITDA(periodIndex);
    const period = businessPeriods[periodIndex];
    const depr = parseFloat(period.depreciation) || 0;
    const amort = parseFloat(period.amortization) || 0;
    // Annualize based on period months
    const months = parseFloat(period.periodMonths) || 12;
    return ebitda - (depr * (12 / months)) - (amort * (12 / months));
  };

  const calculateNetIncome = (periodIndex: number) => {
    const ebit = calculateEBIT(periodIndex);
    const period = businessPeriods[periodIndex];
    const interest = parseFloat(period.interest) || 0;
    const taxes = parseFloat(period.taxes) || 0;
    // Annualize based on period months
    const months = parseFloat(period.periodMonths) || 12;
    return ebit - (interest * (12 / months)) - (taxes * (12 / months));
  };

  const calculateCashFlow = (periodIndex: number) => {
    const netIncome = calculateNetIncome(periodIndex);
    const period = businessPeriods[periodIndex];
    const addbacksTotal = (parseFloat(period.depreciation) || 0) + 
                          (parseFloat(period.amortization) || 0) +
                          (parseFloat(period.section179) || 0) +
                          (parseFloat(period.interest) || 0) +
                          (parseFloat(period.addbacks) || 0);
    // Annualize based on period months
    const months = parseFloat(period.periodMonths) || 12;
    return netIncome + (addbacksTotal * (12 / months));
  };

  const calculateGrossMargin = (periodIndex: number) => {
    const period = businessPeriods[periodIndex];
    const revenue = parseFloat(period.revenue) || 0;
    const cogs = parseFloat(period.cogs) || 0;
    return revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0;
  };

  const calculateEBITDAMargin = (periodIndex: number) => {
    const period = businessPeriods[periodIndex];
    const revenue = parseFloat(period.revenue) || 0;
    const ebitda = calculateEBITDA(periodIndex);
    return revenue > 0 ? (ebitda / revenue) * 100 : 0;
  };

  const calculateNetMargin = (periodIndex: number) => {
    const period = businessPeriods[periodIndex];
    const revenue = parseFloat(period.revenue) || 0;
    const netIncome = calculateNetIncome(periodIndex);
    return revenue > 0 ? (netIncome / revenue) * 100 : 0;
  };

  const calculateM1TaxableIncome = (periodIndex: number) => {
    const period = businessPeriods[periodIndex];
    const bookIncome = parseFloat(period.m1BookIncome) || 0;
    const fedTaxExpense = parseFloat(period.m1FedTaxExpense) || 0;
    const excessDepr = parseFloat(period.m1ExcessDepr) || 0;
    const other = parseFloat(period.m1Other) || 0;
    return bookIncome + fedTaxExpense - excessDepr + other;
  };

  // Calculate annual debt service for DSCR
  const calculateAnnualDebtService = () => {
    const primaryRequest = uses.reduce((sum, use) => sum + (parseFloat(use.amount) || 0), 0);
    const guaranteePct = parseFloat(guaranteePercent) || 75;
    const guaranteedAmount = primaryRequest * (guaranteePct / 100);
    
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
    
    let monthlyPayment;
    if (rate === 0) {
      monthlyPayment = finalLoanAmount / term;
    } else {
      monthlyPayment = finalLoanAmount * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    }
    
    return monthlyPayment * 12;
  };

  const calculateDSCR = (businessPeriodIndex: number) => {
    const personalPeriodIndex = businessPeriodIndex < 3 ? businessPeriodIndex : 2;
    const businessPeriod = businessPeriods[businessPeriodIndex];
    const personalPeriod = personalPeriods[personalPeriodIndex];
    
    const months = parseFloat(businessPeriod.periodMonths) || 12;
    const annualizationFactor = 12 / months;
    
    const businessRevenue = (parseFloat(businessPeriod.revenue) || 0) + (parseFloat(businessPeriod.otherIncome) || 0);
    const businessExpenses = (parseFloat(businessPeriod.cogs) || 0) + 
                            (parseFloat(businessPeriod.operatingExpenses) || 0) +
                            (parseFloat(businessPeriod.rentExpense) || 0) +
                            (parseFloat(businessPeriod.otherExpenses) || 0);
    const businessEBITDA = (businessRevenue - businessExpenses) * annualizationFactor;
    
    const officersComp = (parseFloat(businessPeriod.officersComp) || 0) * annualizationFactor;
    const depreciationAddback = (parseFloat(businessPeriod.depreciation) || 0) * annualizationFactor;
    const amortizationAddback = (parseFloat(businessPeriod.amortization) || 0) * annualizationFactor;
    const section179Addback = (parseFloat(businessPeriod.section179) || 0) * annualizationFactor;
    const otherAddbacks = (parseFloat(businessPeriod.addbacks) || 0) * annualizationFactor;
    
    const businessCashFlow = businessEBITDA + depreciationAddback + amortizationAddback + section179Addback + otherAddbacks;
    
    const personalW2Income = (parseFloat(personalPeriod.salary) || 0) + 
                            (parseFloat(personalPeriod.bonuses) || 0) +
                            (parseFloat(personalPeriod.investments) || 0) +
                            (parseFloat(personalPeriod.rentalIncome) || 0) +
                            (parseFloat(personalPeriod.otherIncome) || 0);
    
    const schedCRevenue = parseFloat(personalPeriod.schedCRevenue) || 0;
    const schedCExpenses = (parseFloat(personalPeriod.schedCCOGS) || 0) + (parseFloat(personalPeriod.schedCExpenses) || 0);
    const schedCAddbacks = (parseFloat(personalPeriod.schedCInterest) || 0) + 
                          (parseFloat(personalPeriod.schedCDepreciation) || 0) + 
                          (parseFloat(personalPeriod.schedCAmortization) || 0) +
                          (parseFloat(personalPeriod.schedCOther) || 0);
    const schedCCashFlow = (schedCRevenue - schedCExpenses) + schedCAddbacks;
    
    const totalIncomeAvailable = businessCashFlow + officersComp + personalW2Income + schedCCashFlow;
    
    const personalExpenses = (parseFloat(personalPeriod.costOfLiving) || 0) + (parseFloat(personalPeriod.personalTaxes) || 0);
    const estimatedTaxOnOfficersComp = officersComp * 0.30;
    
    const netCashAvailable = totalIncomeAvailable - personalExpenses - estimatedTaxOnOfficersComp;
    
    const annualDebtService = calculateAnnualDebtService();
    
    return annualDebtService > 0 ? netCashAvailable / annualDebtService : 0;
  };

  // Calculate DSCR with Rent addback
  const calculateDSCRWithRent = (businessPeriodIndex: number) => {
    const personalPeriodIndex = businessPeriodIndex < 3 ? businessPeriodIndex : 2;
    const businessPeriod = businessPeriods[businessPeriodIndex];
    const personalPeriod = personalPeriods[personalPeriodIndex];
    
    const months = parseFloat(businessPeriod.periodMonths) || 12;
    const annualizationFactor = 12 / months;
    const rentExpense = (parseFloat(businessPeriods[businessPeriodIndex].rentExpense) || 0) * annualizationFactor;
    
    const businessRevenue = (parseFloat(businessPeriod.revenue) || 0) + (parseFloat(businessPeriod.otherIncome) || 0);
    const businessExpenses = (parseFloat(businessPeriod.cogs) || 0) + 
                            (parseFloat(businessPeriod.operatingExpenses) || 0) +
                            (parseFloat(businessPeriod.rentExpense) || 0) +
                            (parseFloat(businessPeriod.otherExpenses) || 0);
    const businessEBITDA = (businessRevenue - businessExpenses) * annualizationFactor;
    
    const officersComp = (parseFloat(businessPeriod.officersComp) || 0) * annualizationFactor;
    const depreciationAddback = (parseFloat(businessPeriod.depreciation) || 0) * annualizationFactor;
    const amortizationAddback = (parseFloat(businessPeriod.amortization) || 0) * annualizationFactor;
    const section179Addback = (parseFloat(businessPeriod.section179) || 0) * annualizationFactor;
    const otherAddbacks = (parseFloat(businessPeriod.addbacks) || 0) * annualizationFactor;
    
    const businessCashFlow = businessEBITDA + depreciationAddback + amortizationAddback + section179Addback + otherAddbacks;
    
    const personalW2Income = (parseFloat(personalPeriod.salary) || 0) + 
                            (parseFloat(personalPeriod.bonuses) || 0) +
                            (parseFloat(personalPeriod.investments) || 0) +
                            (parseFloat(personalPeriod.rentalIncome) || 0) +
                            (parseFloat(personalPeriod.otherIncome) || 0);
    
    const schedCRevenue = parseFloat(personalPeriod.schedCRevenue) || 0;
    const schedCExpenses = (parseFloat(personalPeriod.schedCCOGS) || 0) + (parseFloat(personalPeriod.schedCExpenses) || 0);
    const schedCAddbacks = (parseFloat(personalPeriod.schedCInterest) || 0) + 
                          (parseFloat(personalPeriod.schedCDepreciation) || 0) + 
                          (parseFloat(personalPeriod.schedCAmortization) || 0) +
                          (parseFloat(personalPeriod.schedCOther) || 0);
    const schedCCashFlow = (schedCRevenue - schedCExpenses) + schedCAddbacks;
    
    const totalIncomeAvailable = businessCashFlow + officersComp + personalW2Income + schedCCashFlow;
    
    const personalExpenses = (parseFloat(personalPeriod.costOfLiving) || 0) + (parseFloat(personalPeriod.personalTaxes) || 0);
    const estimatedTaxOnOfficersComp = officersComp * 0.30;
    
    const netCashAvailable = totalIncomeAvailable - personalExpenses - estimatedTaxOnOfficersComp + rentExpense;
    
    const annualDebtService = calculateAnnualDebtService();
    
    return annualDebtService > 0 ? netCashAvailable / annualDebtService : 0;
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Income Statement (P&L)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left font-semibold sticky left-0 bg-muted z-10">Item</th>
                  {businessPeriodLabels.map((label, i) => (
                    <th key={i} className="border border-border p-3 text-center min-w-[180px]">
                      <div className="space-y-2">
                        <EditableCell
                          value={label}
                          onChange={(val) => updatePeriodLabel(i, val)}
                          type="text"
                          className="text-center font-semibold"
                        />
                        <div className="text-xs text-muted-foreground">
                          <EditableCell
                            value={businessPeriods[i].periodDate}
                            onChange={(val) => {
                              const newPeriods = [...businessPeriods];
                              newPeriods[i] = { ...newPeriods[i], periodDate: val };
                              // Auto-calculate months if we have a previous date
                              if (val && i > 0 && businessPeriods[i-1].periodDate) {
                                const prevDate = new Date(businessPeriods[i-1].periodDate);
                                const currDate = new Date(val);
                                const monthsDiff = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
                                if (monthsDiff > 0) {
                                  newPeriods[i] = { ...newPeriods[i], periodMonths: monthsDiff.toString() };
                                }
                              }
                              setBusinessPeriods(newPeriods);
                            }}
                            type="text"
                            className="text-center text-xs"
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <span>Months:</span>
                          <EditableCell
                            value={businessPeriods[i].periodMonths}
                            onChange={(val) => {
                              const newPeriods = [...businessPeriods];
                              newPeriods[i] = { ...newPeriods[i], periodMonths: val };
                              setBusinessPeriods(newPeriods);
                            }}
                            type="number"
                            className="text-center text-xs w-16"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearColumn(i)}
                          className="w-full text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Clear Column
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Revenue */}
                <tr className="bg-primary/10">
                  <td className="border border-border p-2 font-semibold sticky left-0">Revenue</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].revenue}
                        onChange={(val) => updateField(i, "revenue", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>

                {/* Expenses */}
                <tr className="bg-primary/10">
                  <td colSpan={5} className="border border-border p-2 font-semibold sticky left-0">Operating Expenses</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">COGS</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].cogs}
                        onChange={(val) => updateField(i, "cogs", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Operating Expenses</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].operatingExpenses}
                        onChange={(val) => updateField(i, "operatingExpenses", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Rent Expense</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].rentExpense}
                        onChange={(val) => updateField(i, "rentExpense", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Officers Compensation</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].officersComp}
                        onChange={(val) => updateField(i, "officersComp", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Depreciation</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].depreciation}
                        onChange={(val) => updateField(i, "depreciation", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Amortization</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].amortization}
                        onChange={(val) => updateField(i, "amortization", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Section 179</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].section179}
                        onChange={(val) => updateField(i, "section179", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Interest Expense</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].interest}
                        onChange={(val) => updateField(i, "interest", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Taxes</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].taxes}
                        onChange={(val) => updateField(i, "taxes", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>

                {/* Other Income/Expenses */}
                <tr className="bg-primary/10">
                  <td className="border border-border p-2 font-semibold sticky left-0">Other Income</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].otherIncome}
                        onChange={(val) => updateField(i, "otherIncome", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-primary/10">
                  <td className="border border-border p-2 font-semibold sticky left-0">Other Expenses</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].otherExpenses}
                        onChange={(val) => updateField(i, "otherExpenses", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-primary/10">
                  <td className="border border-border p-2 font-semibold sticky left-0">Other Addbacks</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].addbacks}
                        onChange={(val) => updateField(i, "addbacks", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>

                {/* Calculated Metrics */}
                <tr className="bg-secondary/20 font-semibold">
                  <td className="border border-border p-2 sticky left-0 bg-secondary/20">EBITDA</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4">
                      ${calculateEBITDA(i).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr className="bg-secondary/20 font-semibold">
                  <td className="border border-border p-2 sticky left-0 bg-secondary/20">EBIT</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4">
                      ${calculateEBIT(i).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr className="bg-primary/20 font-bold">
                  <td className="border border-border p-2 sticky left-0 bg-primary/20">Net Income</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4">
                      ${calculateNetIncome(i).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr className="bg-accent/20 font-bold">
                  <td className="border border-border p-2 sticky left-0 bg-accent/20">Cash Flow (for DSCR)</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4">
                      ${calculateCashFlow(i).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>

                {/* M1 Reconciliation */}
                <tr className="bg-primary/10">
                  <td colSpan={5} className="border border-border p-2 font-semibold sticky left-0">M1 Reconciliation</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Book Income (Per Return)</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].m1BookIncome}
                        onChange={(val) => updateField(i, "m1BookIncome", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Fed Tax Expense</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].m1FedTaxExpense}
                        onChange={(val) => updateField(i, "m1FedTaxExpense", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Excess Depreciation</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].m1ExcessDepr}
                        onChange={(val) => updateField(i, "m1ExcessDepr", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Other M1 Adjustments</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].m1Other}
                        onChange={(val) => updateField(i, "m1Other", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-secondary/20 font-semibold">
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-secondary/20">Taxable Income</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4">
                      ${calculateM1TaxableIncome(i).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>

                {/* DSCR Calculations */}
                <tr className="bg-accent/20">
                  <td className="border border-border p-2 font-semibold sticky left-0 bg-accent/20">DSCR</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className={`border border-border p-2 text-center font-semibold ${
                      calculateDSCR(i) >= 1.25 ? 'text-green-600' : 
                      calculateDSCR(i) >= 1.0 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {calculateDSCR(i).toFixed(2)}x
                    </td>
                  ))}
                </tr>
                <tr className="bg-accent/20">
                  <td className="border border-border p-2 font-semibold sticky left-0 bg-accent/20">DSCR with Rent</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className={`border border-border p-2 text-center font-semibold ${
                      calculateDSCRWithRent(i) >= 1.25 ? 'text-green-600' : 
                      calculateDSCRWithRent(i) >= 1.0 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {calculateDSCRWithRent(i).toFixed(2)}x
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Ratios */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Ratios & Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left font-semibold">Ratio</th>
                  {businessPeriodLabels.map((label, i) => (
                    <th key={i} className="border border-border p-3 text-center min-w-[150px]">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-2 font-medium">Gross Margin</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-center">
                      {calculateGrossMargin(i).toFixed(2)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">EBITDA Margin</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-center">
                      {calculateEBITDAMargin(i).toFixed(2)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 font-medium">Net Margin</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-center">
                      {calculateNetMargin(i).toFixed(2)}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
