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

  const focusNextCell = (currentRow: string, currentCol: number) => {
    const fields = [
      'revenue', 'cogs', 'operatingExpenses', 'rentExpense', 'officersComp', 
      'depreciation', 'amortization', 'section179', 'interest', 'taxes',
      'otherIncome', 'otherExpenses', 'addbacks',
      'm1BookIncome', 'm1FedTaxExpense', 'm1ExcessDepr', 'm1Other'
    ];
    const currentIndex = fields.indexOf(currentRow);
    if (currentIndex < fields.length - 1) {
      const nextField = fields[currentIndex + 1];
      const nextInput = document.querySelector(`input[data-field="${nextField}-${currentCol}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const focusRightCell = (currentRow: string, currentCol: number) => {
    if (currentCol < businessPeriods.length - 1) {
      const nextInput = document.querySelector(`input[data-field="${currentRow}-${currentCol + 1}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
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

  const calculateGrossProfit = (periodIndex: number) => {
    const period = businessPeriods[periodIndex];
    const revenue = parseFloat(period.revenue) || 0;
    const cogs = parseFloat(period.cogs) || 0;
    return revenue - cogs;
  };

  const calculateEBITDA = (periodIndex: number) => {
    const period = businessPeriods[periodIndex];
    const revenue = (parseFloat(period.revenue) || 0) + (parseFloat(period.otherIncome) || 0);
    const expenses = (parseFloat(period.cogs) || 0) + 
                     (parseFloat(period.operatingExpenses) || 0) +
                     (parseFloat(period.rentExpense) || 0) +
                     (parseFloat(period.officersComp) || 0) +
                     (parseFloat(period.otherExpenses) || 0);
    return revenue - expenses;
  };

  const calculateEBIT = (periodIndex: number) => {
    const ebitda = calculateEBITDA(periodIndex);
    const period = businessPeriods[periodIndex];
    const depr = parseFloat(period.depreciation) || 0;
    const amort = parseFloat(period.amortization) || 0;
    return ebitda - depr - amort;
  };

  const calculateNetIncome = (periodIndex: number) => {
    const ebit = calculateEBIT(periodIndex);
    const period = businessPeriods[periodIndex];
    const interest = parseFloat(period.interest) || 0;
    const taxes = parseFloat(period.taxes) || 0;
    return ebit - interest - taxes;
  };

  const calculateCashFlow = (periodIndex: number) => {
    const netIncome = calculateNetIncome(periodIndex);
    const period = businessPeriods[periodIndex];
    const addbacksTotal = (parseFloat(period.depreciation) || 0) + 
                          (parseFloat(period.amortization) || 0) +
                          (parseFloat(period.section179) || 0) +
                          (parseFloat(period.interest) || 0) +
                          (parseFloat(period.addbacks) || 0);
    return netIncome + addbacksTotal;
  };

  const calculateEBT = (periodIndex: number) => {
    const ebit = calculateEBIT(periodIndex);
    const period = businessPeriods[periodIndex];
    const otherIncome = parseFloat(period.otherIncome) || 0;
    const otherExpenses = parseFloat(period.otherExpenses) || 0;
    const interest = parseFloat(period.interest) || 0;
    return ebit + otherIncome - otherExpenses - interest;
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
                {/* Income Section */}
                <tr className="bg-muted/50">
                  <td colSpan={5} className="border border-border p-2 font-semibold sticky left-0">Income</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">1. Gross Receipts or Sales</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].revenue}
                        onChange={(val) => updateField(i, "revenue", val)}
                        type="currency"
                        onEnter={() => focusNextCell('revenue', i)}
                        onTab={() => focusRightCell('revenue', i)}
                        dataField={`revenue-${i}`}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">2. Cost of Goods Sold</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].cogs}
                        onChange={(val) => updateField(i, "cogs", val)}
                        type="currency"
                        onEnter={() => focusNextCell('cogs', i)}
                        onTab={() => focusRightCell('cogs', i)}
                        dataField={`cogs-${i}`}
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-secondary/30 font-semibold">
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-secondary/30">3. Gross Profit (Line 1 less Line 2)</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4">
                      ${calculateGrossProfit(i).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">4. Other Income</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].otherIncome}
                        onChange={(val) => updateField(i, "otherIncome", val)}
                        type="currency"
                        onEnter={() => focusNextCell('otherIncome', i)}
                        onTab={() => focusRightCell('otherIncome', i)}
                        dataField={`otherIncome-${i}`}
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-secondary/30 font-semibold">
                  <td className="border border-border p-2 sticky left-0 bg-secondary/30">5. Total Income (Line 3 plus Line 4)</td>
                  {businessPeriods.map((_, i) => {
                    const totalIncome = calculateGrossProfit(i) + (parseFloat(businessPeriods[i].otherIncome) || 0);
                    return (
                      <td key={i} className="border border-border p-2 text-right pr-4">
                        ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    );
                  })}
                </tr>

                {/* Deductions Section */}
                <tr className="bg-muted/50">
                  <td colSpan={5} className="border border-border p-2 font-semibold sticky left-0">Deductions</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">6. Compensation of Officers</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].officersComp}
                        onChange={(val) => updateField(i, "officersComp", val)}
                        type="currency"
                        onEnter={() => focusNextCell('officersComp', i)}
                        onTab={() => focusRightCell('officersComp', i)}
                        dataField={`officersComp-${i}`}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">7. Rents</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].rentExpense}
                        onChange={(val) => updateField(i, "rentExpense", val)}
                        type="currency"
                        onEnter={() => focusNextCell('rentExpense', i)}
                        onTab={() => focusRightCell('rentExpense', i)}
                        dataField={`rentExpense-${i}`}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">8. Interest Expense</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].interest}
                        onChange={(val) => updateField(i, "interest", val)}
                        type="currency"
                        onEnter={() => focusNextCell('interest', i)}
                        onTab={() => focusRightCell('interest', i)}
                        dataField={`interest-${i}`}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">9. Depreciation</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].depreciation}
                        onChange={(val) => updateField(i, "depreciation", val)}
                        type="currency"
                        onEnter={() => focusNextCell('depreciation', i)}
                        onTab={() => focusRightCell('depreciation', i)}
                        dataField={`depreciation-${i}`}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">10. Amortization</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].amortization}
                        onChange={(val) => updateField(i, "amortization", val)}
                        type="currency"
                        onEnter={() => focusNextCell('amortization', i)}
                        onTab={() => focusRightCell('amortization', i)}
                        dataField={`amortization-${i}`}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">11. Section 179 Deduction</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].section179}
                        onChange={(val) => updateField(i, "section179", val)}
                        type="currency"
                        onEnter={() => focusNextCell('section179', i)}
                        onTab={() => focusRightCell('section179', i)}
                        dataField={`section179-${i}`}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">12. Other Operating Expenses</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].operatingExpenses}
                        onChange={(val) => updateField(i, "operatingExpenses", val)}
                        type="currency"
                        onEnter={() => focusNextCell('operatingExpenses', i)}
                        onTab={() => focusRightCell('operatingExpenses', i)}
                        dataField={`operatingExpenses-${i}`}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">13. Other Deductions</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].otherExpenses}
                        onChange={(val) => updateField(i, "otherExpenses", val)}
                        type="currency"
                        onEnter={() => focusNextCell('otherExpenses', i)}
                        onTab={() => focusRightCell('otherExpenses', i)}
                        dataField={`otherExpenses-${i}`}
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-secondary/30 font-semibold">
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-secondary/30">14. Total Deductions (Lines 6-13)</td>
                  {businessPeriods.map((_, i) => {
                    const totalDeductions = (
                      (parseFloat(businessPeriods[i].officersComp) || 0) +
                      (parseFloat(businessPeriods[i].rentExpense) || 0) +
                      (parseFloat(businessPeriods[i].interest) || 0) +
                      (parseFloat(businessPeriods[i].depreciation) || 0) +
                      (parseFloat(businessPeriods[i].amortization) || 0) +
                      (parseFloat(businessPeriods[i].section179) || 0) +
                      (parseFloat(businessPeriods[i].operatingExpenses) || 0) +
                      (parseFloat(businessPeriods[i].otherExpenses) || 0)
                    );
                    return (
                      <td key={i} className="border border-border p-2 text-right pr-4">
                        ${totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    );
                  })}
                </tr>
                <tr className="bg-secondary/30 font-semibold">
                  <td className="border border-border p-2 sticky left-0 bg-secondary/30">15. Income Before Taxes (Line 5 less Line 14)</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4">
                      ${calculateEBT(i).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">16. Taxes</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].taxes}
                        onChange={(val) => updateField(i, "taxes", val)}
                        type="currency"
                        onEnter={() => focusNextCell('taxes', i)}
                        onTab={() => focusRightCell('taxes', i)}
                        dataField={`taxes-${i}`}
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-primary/20 font-bold">
                  <td className="border border-border p-2 sticky left-0 bg-primary/20">17. Net Income (Line 15 less Line 16)</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4 font-bold">
                      ${calculateNetIncome(i).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>

                {/* Cash Flow Analysis Section */}
                <tr className="bg-muted/50">
                  <td colSpan={5} className="border border-border p-2 font-semibold sticky left-0">Cash Flow Analysis (for DSCR)</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Add Back: Depreciation</td>
                  {businessPeriods.map((_, i) => {
                    const amount = parseFloat(businessPeriods[i].depreciation) || 0;
                    return (
                      <td key={i} className="border border-border p-2 text-right pr-4 text-muted-foreground">
                        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Add Back: Amortization</td>
                  {businessPeriods.map((_, i) => {
                    const amount = parseFloat(businessPeriods[i].amortization) || 0;
                    return (
                      <td key={i} className="border border-border p-2 text-right pr-4 text-muted-foreground">
                        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Add Back: Section 179</td>
                  {businessPeriods.map((_, i) => {
                    const amount = parseFloat(businessPeriods[i].section179) || 0;
                    return (
                      <td key={i} className="border border-border p-2 text-right pr-4 text-muted-foreground">
                        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Add Back: Interest Expense</td>
                  {businessPeriods.map((_, i) => {
                    const amount = parseFloat(businessPeriods[i].interest) || 0;
                    return (
                      <td key={i} className="border border-border p-2 text-right pr-4 text-muted-foreground">
                        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Other Addbacks</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].addbacks}
                        onChange={(val) => updateField(i, "addbacks", val)}
                        type="currency"
                        onEnter={() => focusNextCell('addbacks', i)}
                        onTab={() => focusRightCell('addbacks', i)}
                        dataField={`addbacks-${i}`}
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-primary/20 font-bold">
                  <td className="border border-border p-2 sticky left-0 bg-primary/20">18. Cash Flow (for DSCR)</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4 font-bold">
                      ${calculateCashFlow(i).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>

                {/* M1 Reconciliation */}
                <tr className="bg-muted/50">
                  <td colSpan={5} className="border border-border p-2 font-semibold sticky left-0">Schedule M-1: Reconciliation of Income</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Book Income (Per Return)</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].m1BookIncome}
                        onChange={(val) => updateField(i, "m1BookIncome", val)}
                        type="currency"
                        onEnter={() => focusNextCell('m1BookIncome', i)}
                        onTab={() => focusRightCell('m1BookIncome', i)}
                        dataField={`m1BookIncome-${i}`}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Federal Tax Expense</td>
                  {businessPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={businessPeriods[i].m1FedTaxExpense}
                        onChange={(val) => updateField(i, "m1FedTaxExpense", val)}
                        type="currency"
                        onEnter={() => focusNextCell('m1FedTaxExpense', i)}
                        onTab={() => focusRightCell('m1FedTaxExpense', i)}
                        dataField={`m1FedTaxExpense-${i}`}
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
                        onEnter={() => focusNextCell('m1ExcessDepr', i)}
                        onTab={() => focusRightCell('m1ExcessDepr', i)}
                        dataField={`m1ExcessDepr-${i}`}
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
                        onEnter={() => focusNextCell('m1Other', i)}
                        onTab={() => focusRightCell('m1Other', i)}
                        dataField={`m1Other-${i}`}
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

                {/* DSCR Analysis */}
                <tr className="bg-muted/50">
                  <td colSpan={5} className="border border-border p-2 font-semibold sticky left-0">Debt Service Coverage Ratio (DSCR)</td>
                </tr>
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
                  <td className="border border-border p-2 font-semibold sticky left-0 bg-accent/20">DSCR with Rent Addback</td>
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
