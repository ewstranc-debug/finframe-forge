import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";
import { useSpreadsheet, type BusinessBalanceSheetPeriodData as PeriodData } from "@/contexts/SpreadsheetContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import {
  calculateCurrentAssets,
  calculateNetFixedAssets,
  calculateTotalAssets,
  calculateTotalLiabilities,
  calculateEquity,
  calculateCurrentRatio,
  calculateDebtToEquity,
  calculateTurnoverRatios,
  getAnnualizedValues,
  formatCurrency,
  formatRatio,
  formatDays,
} from "@/utils/balanceSheetCalculations";

export const BusinessBalanceSheet = () => {
  const { 
    businessBalanceSheetPeriods: periods, 
    setBusinessBalanceSheetPeriods: setPeriods, 
    businessBalanceSheetLabels: periodLabels, 
    setBusinessBalanceSheetLabels: setPeriodLabels,
    businessPeriods, // Connect to P&L for turnover ratios
  } = useSpreadsheet();

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

  // Memoize all balance sheet calculations
  const balanceSheetMetrics = useMemo(() => {
    return periods.map((period, index) => {
      // Get annualized revenue and COGS from corresponding P&L period
      const correspondingPLPeriod = businessPeriods[index];
      const { annualizedRevenue, annualizedCOGS } = correspondingPLPeriod 
        ? getAnnualizedValues(correspondingPLPeriod)
        : { annualizedRevenue: 0, annualizedCOGS: 0 };

      const turnoverRatios = calculateTurnoverRatios(period, annualizedRevenue, annualizedCOGS);

      return {
        currentAssets: calculateCurrentAssets(period),
        netFixedAssets: calculateNetFixedAssets(period),
        totalAssets: calculateTotalAssets(period),
        totalLiabilities: calculateTotalLiabilities(period),
        equity: calculateEquity(period),
        currentRatio: calculateCurrentRatio(period),
        debtToEquity: calculateDebtToEquity(period),
        ...turnoverRatios,
      };
    });
  }, [periods, businessPeriods]);

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
              {balanceSheetMetrics.map((metrics, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                  {formatCurrency(metrics.currentAssets)}
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
              {balanceSheetMetrics.map((metrics, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                  {formatCurrency(metrics.netFixedAssets)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b-2 border-border bg-primary/10 min-w-[800px]">
              <div className="p-3 border-r border-border font-bold text-lg">Total Assets</div>
              {balanceSheetMetrics.map((metrics, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold text-lg">
                  {formatCurrency(metrics.totalAssets)}
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
              {balanceSheetMetrics.map((metrics, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                  {formatCurrency(metrics.totalLiabilities)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 bg-accent/10 min-w-[800px]">
              <div className="p-3 border-r border-border font-bold text-lg">Equity (Net Worth)</div>
              {balanceSheetMetrics.map((metrics, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold text-lg">
                  {formatCurrency(metrics.equity)}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Financial Ratios
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Turnover ratios are calculated using annualized revenue and COGS from the corresponding P&L period.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
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
              <div className="p-3 border-r border-border bg-secondary/30 font-medium flex items-center gap-2">
                Current Ratio
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current Assets ÷ Current Liabilities. Target: &gt;1.5x</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {balanceSheetMetrics.map((metrics, i) => (
                <div key={i} className={`p-3 border-r border-border last:border-r-0 ${
                  metrics.currentRatio >= 1.5 ? 'text-success' : 
                  metrics.currentRatio >= 1.0 ? 'text-warning' : 'text-destructive'
                }`}>
                  {formatRatio(metrics.currentRatio)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium flex items-center gap-2">
                Debt-to-Equity Ratio
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total Liabilities ÷ Equity. Target: &lt;2.0x</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {balanceSheetMetrics.map((metrics, i) => (
                <div key={i} className={`p-3 border-r border-border last:border-r-0 ${
                  metrics.debtToEquity <= 2.0 ? 'text-success' : 
                  metrics.debtToEquity <= 3.0 ? 'text-warning' : 'text-destructive'
                }`}>
                  {formatRatio(metrics.debtToEquity)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium flex items-center gap-2">
                A/R Turnover (DSO)
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Days Sales Outstanding = 365 ÷ (Revenue ÷ AR). Target: 30-45 days</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {balanceSheetMetrics.map((metrics, i) => (
                <div key={i} className={`p-3 border-r border-border last:border-r-0 ${
                  metrics.arDays <= 45 ? 'text-success' : 
                  metrics.arDays <= 60 ? 'text-warning' : 'text-destructive'
                }`}>
                  {metrics.arTurnover > 0 ? formatDays(metrics.arDays) : 'N/A'}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium flex items-center gap-2">
                Inventory Turnover (DIO)
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Days Inventory Outstanding = 365 ÷ (COGS ÷ Inventory). Varies by industry.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {balanceSheetMetrics.map((metrics, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">
                  {metrics.inventoryTurnover > 0 ? formatDays(metrics.inventoryDays) : 'N/A'}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium flex items-center gap-2">
                A/P Turnover (DPO)
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Days Payable Outstanding = 365 ÷ (COGS ÷ AP). Target: 30-45 days</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {balanceSheetMetrics.map((metrics, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0">
                  {metrics.apTurnover > 0 ? formatDays(metrics.apDays) : 'N/A'}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 bg-primary/5 min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium flex items-center gap-2">
                Cash Conversion Cycle
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>DSO + DIO - DPO. Measures how long cash is tied up in operations. Lower is better.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {balanceSheetMetrics.map((metrics, i) => (
                <div key={i} className={`p-3 border-r border-border last:border-r-0 font-medium ${
                  metrics.cashConversionCycle <= 30 ? 'text-success' : 
                  metrics.cashConversionCycle <= 60 ? 'text-warning' : 'text-destructive'
                }`}>
                  {(metrics.arTurnover > 0 || metrics.inventoryTurnover > 0) 
                    ? formatDays(metrics.cashConversionCycle) 
                    : 'N/A'}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
