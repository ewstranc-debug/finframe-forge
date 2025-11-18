import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";

interface PeriodData {
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

export const PersonalFinancials = () => {
  const [periods, setPeriods] = useState<PeriodData[]>([
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

  const [periodLabels, setPeriodLabels] = useState(["12/31/2023", "12/31/2024", "12/31/2025"]);

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

  const calculateW2Income = (periodIndex: number) => {
    const period = periods[periodIndex];
    return (parseFloat(period.salary) || 0) + (parseFloat(period.bonuses) || 0) +
           (parseFloat(period.investments) || 0) + (parseFloat(period.rentalIncome) || 0) +
           (parseFloat(period.otherIncome) || 0);
  };

  const calculateSchedCNetIncome = (periodIndex: number) => {
    const period = periods[periodIndex];
    const revenue = parseFloat(period.schedCRevenue) || 0;
    const expenses = (parseFloat(period.schedCCOGS) || 0) + (parseFloat(period.schedCExpenses) || 0);
    return revenue - expenses;
  };

  const calculateSchedCCashFlow = (periodIndex: number) => {
    const netIncome = calculateSchedCNetIncome(periodIndex);
    const period = periods[periodIndex];
    const addbacks = (parseFloat(period.schedCInterest) || 0) + 
                     (parseFloat(period.schedCDepreciation) || 0) + 
                     (parseFloat(period.schedCAmortization) || 0) +
                     (parseFloat(period.schedCOther) || 0);
    return netIncome + addbacks;
  };

  const calculateTotalIncome = (periodIndex: number) => {
    return calculateW2Income(periodIndex) + calculateSchedCCashFlow(periodIndex);
  };

  const calculateTotalExpenses = (periodIndex: number) => {
    const period = periods[periodIndex];
    return (parseFloat(period.costOfLiving) || 0) + (parseFloat(period.personalTaxes) || 0);
  };

  const calculateNetCashFlow = (periodIndex: number) => {
    return calculateTotalIncome(periodIndex) - calculateTotalExpenses(periodIndex);
  };

  const calculateSavingsRate = (periodIndex: number) => {
    const totalIncome = calculateTotalIncome(periodIndex);
    const netCashFlow = calculateNetCashFlow(periodIndex);
    return totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;
  };

  const calculateExpenseRatio = (periodIndex: number) => {
    const totalIncome = calculateTotalIncome(periodIndex);
    const totalExpenses = calculateTotalExpenses(periodIndex);
    return totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Income Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
            <div className="grid grid-cols-4 bg-muted font-medium text-sm min-w-[600px]">
              <div className="p-3 border-r border-border">Income Source</div>
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
              <h4 className="text-sm font-semibold text-success">W-2 Income</h4>
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Salary/Wages</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.salary}
                    onChange={(val) => updateField(i, "salary", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Bonuses/Commission</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.bonuses}
                    onChange={(val) => updateField(i, "bonuses", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Investment Income</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.investments}
                    onChange={(val) => updateField(i, "investments", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Rental Income</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.rentalIncome}
                    onChange={(val) => updateField(i, "rentalIncome", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
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
              <h4 className="text-sm font-semibold text-success">Schedule C Business Income</h4>
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Gross Revenue</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.schedCRevenue}
                    onChange={(val) => updateField(i, "schedCRevenue", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Cost of Goods Sold</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.schedCCOGS}
                    onChange={(val) => updateField(i, "schedCCOGS", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Operating Expenses</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.schedCExpenses}
                    onChange={(val) => updateField(i, "schedCExpenses", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-border bg-muted min-w-[600px]">
              <div className="p-3 border-r border-border font-medium">Schedule C Net Income</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-medium">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateSchedCNetIncome(i))}
                </div>
              ))}
            </div>

            <div className="mt-2 mb-2 px-3">
              <h4 className="text-sm font-semibold text-accent">Add-backs (Schedule C)</h4>
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Interest</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.schedCInterest}
                    onChange={(val) => updateField(i, "schedCInterest", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Depreciation</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.schedCDepreciation}
                    onChange={(val) => updateField(i, "schedCDepreciation", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Amortization</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.schedCAmortization}
                    onChange={(val) => updateField(i, "schedCAmortization", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Other Add-backs</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.schedCOther}
                    onChange={(val) => updateField(i, "schedCOther", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-border bg-accent/10 min-w-[600px]">
              <div className="p-3 border-r border-border font-bold">Schedule C Cash Flow</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateSchedCCashFlow(i))}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b-2 border-border bg-success/10 min-w-[600px]">
              <div className="p-3 border-r border-border font-bold text-lg">Total Income</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold text-lg">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalIncome(i))}
                </div>
              ))}
            </div>

            <div className="mt-2 mb-2 px-3">
              <h4 className="text-sm font-semibold text-destructive">Expenses</h4>
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Cost of Living</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.costOfLiving}
                    onChange={(val) => updateField(i, "costOfLiving", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Personal Taxes</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.personalTaxes}
                    onChange={(val) => updateField(i, "personalTaxes", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b-2 border-border bg-destructive/10 min-w-[600px]">
              <div className="p-3 border-r border-border font-bold">Total Expenses</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalExpenses(i))}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 bg-primary/10 min-w-[600px]">
              <div className="p-3 border-r border-border font-bold text-lg">Net Cash Flow</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold text-lg">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateNetCashFlow(i))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Financial Ratios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-4 bg-muted font-medium text-sm min-w-[600px]">
              <div className="p-3 border-r border-border">Ratio</div>
              {periodLabels.map((label, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">{label}</div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Savings Rate</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">
                  {calculateSavingsRate(i).toFixed(1)}%
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-border min-w-[600px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Expense Ratio</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">
                  {calculateExpenseRatio(i).toFixed(1)}%
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
