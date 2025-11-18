import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";

interface PeriodData {
  cash: string;
  accountsReceivable: string;
  inventory: string;
  otherCurrentAssets: string;
  realEstate: string;
  accumulatedDepreciation: string;
  currentLiabilities: string;
  longTermDebt: string;
}

export const BusinessBalanceSheet = () => {
  const [periods, setPeriods] = useState<PeriodData[]>([
    { 
      cash: "0", 
      accountsReceivable: "0", 
      inventory: "0", 
      otherCurrentAssets: "0",
      realEstate: "0",
      accumulatedDepreciation: "0",
      currentLiabilities: "0",
      longTermDebt: "0"
    },
    { 
      cash: "0", 
      accountsReceivable: "0", 
      inventory: "0", 
      otherCurrentAssets: "0",
      realEstate: "0",
      accumulatedDepreciation: "0",
      currentLiabilities: "0",
      longTermDebt: "0"
    },
    { 
      cash: "0", 
      accountsReceivable: "0", 
      inventory: "0", 
      otherCurrentAssets: "0",
      realEstate: "0",
      accumulatedDepreciation: "0",
      currentLiabilities: "0",
      longTermDebt: "0"
    },
    { 
      cash: "0", 
      accountsReceivable: "0", 
      inventory: "0", 
      otherCurrentAssets: "0",
      realEstate: "0",
      accumulatedDepreciation: "0",
      currentLiabilities: "0",
      longTermDebt: "0"
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

  const calculateCurrentAssets = (periodIndex: number) => {
    const period = periods[periodIndex];
    return (parseFloat(period.cash) || 0) + 
           (parseFloat(period.accountsReceivable) || 0) + 
           (parseFloat(period.inventory) || 0) + 
           (parseFloat(period.otherCurrentAssets) || 0);
  };

  const calculateNetFixedAssets = (periodIndex: number) => {
    const period = periods[periodIndex];
    return (parseFloat(period.realEstate) || 0) - (parseFloat(period.accumulatedDepreciation) || 0);
  };

  const calculateTotalAssets = (periodIndex: number) => {
    return calculateCurrentAssets(periodIndex) + calculateNetFixedAssets(periodIndex);
  };

  const calculateTotalLiabilities = (periodIndex: number) => {
    const period = periods[periodIndex];
    return (parseFloat(period.currentLiabilities) || 0) + (parseFloat(period.longTermDebt) || 0);
  };

  const calculateEquity = (periodIndex: number) => {
    return calculateTotalAssets(periodIndex) - calculateTotalLiabilities(periodIndex);
  };

  // Turnover Ratios (annualized based on period)
  const calculateARTurnover = (periodIndex: number, revenue: number) => {
    const ar = parseFloat(periods[periodIndex].accountsReceivable) || 0;
    return ar > 0 ? revenue / ar : 0;
  };

  const calculateInventoryTurnover = (periodIndex: number, cogs: number) => {
    const inventory = parseFloat(periods[periodIndex].inventory) || 0;
    return inventory > 0 ? cogs / inventory : 0;
  };

  const calculateAPTurnover = (periodIndex: number, cogs: number) => {
    const ap = parseFloat(periods[periodIndex].currentLiabilities) || 0;
    return ap > 0 ? cogs / ap : 0;
  };

  const calculateCurrentRatio = (periodIndex: number) => {
    const currentAssets = calculateCurrentAssets(periodIndex);
    const currentLiabilities = parseFloat(periods[periodIndex].currentLiabilities) || 0;
    return currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
  };

  const calculateDebtToEquity = (periodIndex: number) => {
    const totalLiabilities = calculateTotalLiabilities(periodIndex);
    const equity = calculateEquity(periodIndex);
    return equity > 0 ? totalLiabilities / equity : 0;
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Balance Sheet</CardTitle>
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
              <h4 className="text-sm font-semibold text-success">Assets</h4>
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Cash</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.cash}
                    onChange={(val) => updateField(i, "cash", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Accounts Receivable</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.accountsReceivable}
                    onChange={(val) => updateField(i, "accountsReceivable", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Inventory</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.inventory}
                    onChange={(val) => updateField(i, "inventory", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Other Current Assets</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.otherCurrentAssets}
                    onChange={(val) => updateField(i, "otherCurrentAssets", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border bg-success/10 min-w-[800px]">
              <div className="p-3 border-r border-border font-bold">Total Current Assets</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateCurrentAssets(i))}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Real Estate / Fixed Assets</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.realEstate}
                    onChange={(val) => updateField(i, "realEstate", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Accumulated Depreciation</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.accumulatedDepreciation}
                    onChange={(val) => updateField(i, "accumulatedDepreciation", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border bg-success/10 min-w-[800px]">
              <div className="p-3 border-r border-border font-bold">Net Fixed Assets</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateNetFixedAssets(i))}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b-2 border-border bg-primary/10 min-w-[800px]">
              <div className="p-3 border-r border-border font-bold text-lg">Total Assets</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold text-lg">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalAssets(i))}
                </div>
              ))}
            </div>

            <div className="mt-2 mb-2 px-3">
              <h4 className="text-sm font-semibold text-destructive">Liabilities</h4>
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Current Liabilities (A/P, etc.)</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.currentLiabilities}
                    onChange={(val) => updateField(i, "currentLiabilities", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Long-Term Debt</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.longTermDebt}
                    onChange={(val) => updateField(i, "longTermDebt", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b-2 border-border bg-destructive/10 min-w-[800px]">
              <div className="p-3 border-r border-border font-bold">Total Liabilities</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalLiabilities(i))}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 bg-accent/10 min-w-[800px]">
              <div className="p-3 border-r border-border font-bold text-lg">Equity (Net Worth)</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold text-lg">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateEquity(i))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Ratios</CardTitle>
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
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Current Ratio</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">
                  {calculateCurrentRatio(i).toFixed(2)}x
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Debt-to-Equity Ratio</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">
                  {calculateDebtToEquity(i).toFixed(2)}x
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">A/R Turnover (days)</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">
                  {(365 / calculateARTurnover(i, 1000000)).toFixed(0)} days
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Inventory Turnover (days)</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">
                  {(365 / calculateInventoryTurnover(i, 500000)).toFixed(0)} days
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">A/P Turnover (days)</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">
                  {(365 / calculateAPTurnover(i, 500000)).toFixed(0)} days
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
