import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";

interface PeriodData {
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

export const BusinessFinancials = () => {
  const [periods, setPeriods] = useState<PeriodData[]>([
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

  const [periodLabels, setPeriodLabels] = useState(["12/31/2023", "12/31/2024", "12/31/2025", "Interim"]);

  const updateField = (periodIndex: number, field: keyof PeriodData, value: string) => {
    const newPeriods = [...periods];
    newPeriods[periodIndex] = { ...newPeriods[periodIndex], [field]: value };
    setPeriods(newPeriods);
  };

  const updatePeriodLabel = (index: number, value: string) => {
    const newLabels = [...periodLabels];
    newLabels[index] = value;
    setPeriodLabels(newLabels);
  };

  const calculateEBITDA = (periodIndex: number) => {
    const period = periods[periodIndex];
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
    const period = periods[periodIndex];
    return ebitda - (parseFloat(period.depreciation) || 0) - (parseFloat(period.amortization) || 0);
  };

  const calculateNetIncome = (periodIndex: number) => {
    const ebit = calculateEBIT(periodIndex);
    const period = periods[periodIndex];
    return ebit - (parseFloat(period.interest) || 0) - (parseFloat(period.taxes) || 0);
  };

  const calculateCashFlow = (periodIndex: number) => {
    const netIncome = calculateNetIncome(periodIndex);
    const period = periods[periodIndex];
    const addbacksTotal = (parseFloat(period.depreciation) || 0) + 
                          (parseFloat(period.amortization) || 0) +
                          (parseFloat(period.interest) || 0) +
                          (parseFloat(period.addbacks) || 0);
    return netIncome + addbacksTotal;
  };

  const calculateAdjustedCashFlowSection179 = (periodIndex: number) => {
    const cashFlow = calculateCashFlow(periodIndex);
    const period = periods[periodIndex];
    return cashFlow + (parseFloat(period.section179) || 0);
  };

  const calculateM1Reconciliation = (periodIndex: number) => {
    const period = periods[periodIndex];
    const bookIncome = parseFloat(period.m1BookIncome) || 0;
    const adjustments = (parseFloat(period.m1FedTaxExpense) || 0) + 
                       (parseFloat(period.m1ExcessDepr) || 0) +
                       (parseFloat(period.m1Other) || 0);
    return bookIncome + adjustments;
  };

  // Financial Ratios
  const calculateDSCR = (periodIndex: number, annualDebtService: number) => {
    const cashFlow = calculateCashFlow(periodIndex);
    return annualDebtService > 0 ? cashFlow / annualDebtService : 0;
  };

  const calculateDSCRWithRent = (periodIndex: number, annualDebtService: number) => {
    const cashFlow = calculateCashFlow(periodIndex);
    const period = periods[periodIndex];
    const rent = parseFloat(period.rentExpense) || 0;
    return (annualDebtService + rent) > 0 ? (cashFlow + rent) / (annualDebtService + rent) : 0;
  };

  const calculateProfitMargin = (periodIndex: number) => {
    const period = periods[periodIndex];
    const revenue = (parseFloat(period.revenue) || 0) + (parseFloat(period.otherIncome) || 0);
    const netIncome = calculateNetIncome(periodIndex);
    return revenue > 0 ? (netIncome / revenue) * 100 : 0;
  };

  const calculateEBITDAMargin = (periodIndex: number) => {
    const period = periods[periodIndex];
    const revenue = (parseFloat(period.revenue) || 0) + (parseFloat(period.otherIncome) || 0);
    const ebitda = calculateEBITDA(periodIndex);
    return revenue > 0 ? (ebitda / revenue) * 100 : 0;
  };

  // Placeholder for debt service (could be connected to Summary or Existing Debts)
  const annualDebtService = 50000; // This should ideally come from props or context

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Income Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
            <div className="grid grid-cols-5 bg-muted font-medium text-sm min-w-[800px]">
              <div className="p-3 border-r border-border">Line Item</div>
              {periodLabels.map((label, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={label}
                    onChange={(val) => updatePeriodLabel(i, val)}
                    type="text"
                  />
                </div>
              ))}
            </div>

            <div className="mt-2 mb-2 px-3">
              <h4 className="text-sm font-semibold text-success">Revenue</h4>
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Total Revenue</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.revenue}
                    onChange={(val) => updateField(i, "revenue", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Other Income</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.otherIncome}
                    onChange={(val) => updateField(i, "otherIncome", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="mt-2 mb-2 px-3">
              <h4 className="text-sm font-semibold text-destructive">Expenses</h4>
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Cost of Goods Sold</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.cogs}
                    onChange={(val) => updateField(i, "cogs", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Operating Expenses</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.operatingExpenses}
                    onChange={(val) => updateField(i, "operatingExpenses", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Rent Expense</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.rentExpense}
                    onChange={(val) => updateField(i, "rentExpense", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Officers Compensation</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.officersComp}
                    onChange={(val) => updateField(i, "officersComp", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Other Expenses</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.otherExpenses}
                    onChange={(val) => updateField(i, "otherExpenses", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border bg-success/10 min-w-[800px]">
              <div className="p-3 border-r border-border font-bold">EBITDA</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateEBITDA(i))}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Depreciation</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.depreciation}
                    onChange={(val) => updateField(i, "depreciation", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Amortization</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.amortization}
                    onChange={(val) => updateField(i, "amortization", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border bg-muted min-w-[800px]">
              <div className="p-3 border-r border-border font-bold">EBIT</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateEBIT(i))}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Interest Expense</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.interest}
                    onChange={(val) => updateField(i, "interest", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Taxes</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.taxes}
                    onChange={(val) => updateField(i, "taxes", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b-2 border-border bg-primary/10 min-w-[800px]">
              <div className="p-3 border-r border-border font-bold text-lg">Net Income</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold text-lg">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateNetIncome(i))}
                </div>
              ))}
            </div>

            <div className="mt-2 mb-2 px-3">
              <h4 className="text-sm font-semibold text-accent">Credit Analysis Adjustments</h4>
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Section 179 Expense</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.section179}
                    onChange={(val) => updateField(i, "section179", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Other Add-backs</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.addbacks}
                    onChange={(val) => updateField(i, "addbacks", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border bg-accent/10 min-w-[800px]">
              <div className="p-3 border-r border-border font-bold">Cash Flow (for DSCR)</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateCashFlow(i))}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 bg-success/10 min-w-[800px]">
              <div className="p-3 border-r border-border font-bold">Adjusted Cash Flow (w/ Sec 179)</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateAdjustedCashFlowSection179(i))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>M-1 Reconciliation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
            <div className="grid grid-cols-5 bg-muted font-medium text-sm min-w-[800px]">
              <div className="p-3 border-r border-border">Item</div>
              {periodLabels.map((label, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">{label}</div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Book Income</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.m1BookIncome}
                    onChange={(val) => updateField(i, "m1BookIncome", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Federal Tax Expense</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.m1FedTaxExpense}
                    onChange={(val) => updateField(i, "m1FedTaxExpense", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Excess Book Depreciation</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.m1ExcessDepr}
                    onChange={(val) => updateField(i, "m1ExcessDepr", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Other Adjustments</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.m1Other}
                    onChange={(val) => updateField(i, "m1Other", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 bg-primary/10 min-w-[800px]">
              <div className="p-3 border-r border-border font-bold">Taxable Income</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateM1Reconciliation(i))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Ratios & Credit Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-5 bg-muted font-medium text-sm min-w-[800px]">
              <div className="p-3 border-r border-border">Ratio</div>
              {periodLabels.map((label, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">{label}</div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">DSCR (Standard)</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">
                  {calculateDSCR(i, annualDebtService).toFixed(2)}x
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">DSCR (with Rent)</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">
                  {calculateDSCRWithRent(i, annualDebtService).toFixed(2)}x
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Net Profit Margin</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">
                  {calculateProfitMargin(i).toFixed(1)}%
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">EBITDA Margin</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">
                  {calculateEBITDAMargin(i).toFixed(1)}%
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-md">
            <h4 className="font-semibold mb-2">Credit Analysis Notes:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• DSCR &gt; 1.25x is typically required for SBA loans</li>
              <li>• Section 179 is added back for debt service coverage analysis</li>
              <li>• Rent-adjusted DSCR accounts for business real estate occupancy costs</li>
              <li>• EBITDA margin shows operational efficiency before financing costs</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
