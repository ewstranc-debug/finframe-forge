import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";

interface PeriodData {
  revenue: string;
  cogs: string;
  operatingExpenses: string;
  depreciation: string;
  interest: string;
  taxes: string;
}

export const BusinessFinancials = () => {
  const [periods, setPeriods] = useState<PeriodData[]>([
    { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", interest: "0", taxes: "0" },
    { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", interest: "0", taxes: "0" },
    { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", interest: "0", taxes: "0" },
    { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", interest: "0", taxes: "0" }
  ]);

  const periodLabels = ["Year 1", "Year 2", "Year 3", "Interim"];

  const updateField = (periodIndex: number, field: keyof PeriodData, value: string) => {
    const newPeriods = [...periods];
    newPeriods[periodIndex] = { ...newPeriods[periodIndex], [field]: value };
    setPeriods(newPeriods);
  };

  const calculateNetIncome = (periodIndex: number) => {
    const period = periods[periodIndex];
    const revenue = parseFloat(period.revenue) || 0;
    const expenses = (parseFloat(period.cogs) || 0) + 
                     (parseFloat(period.operatingExpenses) || 0) + 
                     (parseFloat(period.depreciation) || 0) + 
                     (parseFloat(period.interest) || 0) + 
                     (parseFloat(period.taxes) || 0);
    return revenue - expenses;
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Income Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
            <div className="grid grid-cols-5 bg-muted font-medium text-sm min-w-[800px]">
              <div className="p-3 border-r border-border">Line Item</div>
              {periodLabels.map((label, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">{label}</div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-success/10 font-medium">Total Revenue</div>
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

            <div className="mt-2 mb-2 px-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Expenses</h4>
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
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Depreciation & Amortization</div>
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

            <div className="grid grid-cols-5 bg-primary/10 min-w-[800px]">
              <div className="p-3 border-r border-border font-bold">Net Income</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateNetIncome(i))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
