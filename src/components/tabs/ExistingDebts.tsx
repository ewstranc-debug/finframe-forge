import { useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, HelpCircle } from "lucide-react";
import { useSpreadsheet, type Debt } from "@/contexts/SpreadsheetContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFinancialList } from "@/hooks/useFinancialList";


export const ExistingDebts = () => {
  const { debts, setDebts } = useSpreadsheet();

  const defaultDebt: Omit<Debt, 'id'> = {
    creditor: "New Creditor",
    balance: "0",
    payment: "0",
    rate: "0",
    term: "0",
    includeInDSCR: true,
  };


  const { addItem, removeItem, canRemove } = useFinancialList({
    items: debts,
    setItems: setDebts,
    generateId: () => Date.now().toString(),
    defaultItem: defaultDebt,
  });

  const calculateMonthlyPayment = useCallback((balance: number, rate: number, term: number) => {
    if (rate === 0 || term === 0) return 0;
    const monthlyRate = rate / 100 / 12;
    const payment = balance * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    return payment;
  }, []);

  const updateDebt = useCallback((id: string, field: keyof Debt, value: string) => {
    setDebts(debts.map(d => {
      if (d.id === id) {
        const updated = { ...d, [field]: value };
        // Auto-calculate payment only when payment is zero (preserve user-entered values)
        if ((field === 'balance' || field === 'rate' || field === 'term')) {
          const balance = parseFloat(updated.balance) || 0;
          const rate = parseFloat(updated.rate) || 0;
          const term = parseFloat(updated.term) || 0;
          const currentPayment = parseFloat(updated.payment) || 0;
          if (balance > 0 && rate > 0 && term > 0 && currentPayment === 0) {
            const calculatedPayment = calculateMonthlyPayment(balance, rate, term);
            updated.payment = calculatedPayment.toFixed(2);
          }
        }
        return updated;
      }
      return d;
    }));
  }, [debts, setDebts, calculateMonthlyPayment]);

  const setDebtInclude = useCallback((id: string, include: boolean) => {
    setDebts(debts.map(d => d.id === id ? { ...d, includeInDSCR: include } : d));
  }, [debts, setDebts]);


  // Calculate maturity date and remaining term for each debt
  const debtMetrics = useMemo(() => {
    return debts.map(debt => {
      const term = parseFloat(debt.term) || 0;
      const balance = parseFloat(debt.balance) || 0;
      const payment = parseFloat(debt.payment) || 0;
      const rate = parseFloat(debt.rate) || 0;

      // Calculate remaining term based on balance and payment
      let remainingTerm = 0;
      if (payment > 0 && balance > 0) {
        if (rate > 0) {
          const monthlyRate = rate / 100 / 12;
          const numerator = balance * monthlyRate / payment;
          if (numerator < 1) {
            remainingTerm = Math.ceil(-Math.log(1 - numerator) / Math.log(1 + monthlyRate));
          } else {
            remainingTerm = term;
          }
        } else {
          remainingTerm = Math.ceil(balance / payment);
        }
        // Cap remaining term at original term
        if (term > 0) {
          remainingTerm = Math.min(remainingTerm, term);
        }
      }

      // Calculate maturity date
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + remainingTerm);

      // Annual debt service
      const annualDebtService = payment * 12;

      return {
        remainingTerm,
        maturityDate: remainingTerm > 0 ? maturityDate.toLocaleDateString('en-US', { 
          month: '2-digit', 
          year: 'numeric' 
        }) : 'N/A',
        annualDebtService,
      };
    });
  }, [debts]);

  // Memoize totals — total balance covers ALL debts, but DSCR-eligible annual
  // debt service EXCLUDES debts where includeInDSCR === false.
  const totals = useMemo(() => {
    const totalBalance = debts.reduce((sum, debt) => sum + (parseFloat(debt.balance) || 0), 0);
    const totalMonthlyPayment = debts.reduce((sum, debt) => sum + (parseFloat(debt.payment) || 0), 0);
    const dscrMonthlyPayment = debts.reduce((sum, debt) => {
      if (debt.includeInDSCR === false) return sum;
      return sum + (parseFloat(debt.payment) || 0);
    }, 0);
    const dscrAnnualDebtService = dscrMonthlyPayment * 12;
    const excludedCount = debts.filter((d) => d.includeInDSCR === false).length;
    const weightedAvgRate = totalBalance > 0 
      ? debts.reduce((sum, debt) => {
          const balance = parseFloat(debt.balance) || 0;
          const rate = parseFloat(debt.rate) || 0;
          return sum + (balance * rate);
        }, 0) / totalBalance
      : 0;

    return {
      totalBalance,
      totalMonthlyPayment,
      dscrAnnualDebtService,
      excludedCount,
      weightedAvgRate,
    };
  }, [debts]);


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Existing Debt Schedule
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Enter existing business debts. Remaining term and maturity date are calculated automatically based on balance and payment.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <Button onClick={addItem} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Debt
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
            <div className="grid grid-cols-9 bg-muted font-medium text-sm min-w-[980px]">
              <div className="p-3 border-r border-border">Creditor</div>
              <div className="p-3 border-r border-border">Balance</div>
              <div className="p-3 border-r border-border">Monthly Pmt</div>
              <div className="p-3 border-r border-border">Rate (%)</div>
              <div className="p-3 border-r border-border">
                <div className="flex items-center gap-1">
                  Orig. Term
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Original term in months</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="p-3 border-r border-border">
                <div className="flex items-center gap-1">
                  Rem. Term
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Calculated remaining term based on current balance</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="p-3 border-r border-border">Maturity</div>
              <div className="p-3 border-r border-border">
                <div className="flex items-center gap-1 justify-center">
                  In DSCR?
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      When unchecked, this debt's payment is EXCLUDED from Existing Annual Debt Service, Business/Global DSCR, FCCR, and the DSCR build-up. Balance still counts in totals and Contingent Liabilities.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="p-3">Actions</div>
            </div>

            {debts.map((debt, index) => {
              const included = debt.includeInDSCR !== false;
              return (
                <div
                  key={debt.id}
                  className={`grid grid-cols-9 border-b border-border min-w-[980px] ${included ? '' : 'opacity-70'}`}
                >
                  <div className="border-r border-border bg-secondary/30">
                    <EditableCell
                      value={debt.creditor}
                      onChange={(val) => updateDebt(debt.id, "creditor", val)}
                      type="text"
                    />
                  </div>
                  <div className="border-r border-border">
                    <EditableCell
                      value={debt.balance}
                      onChange={(val) => updateDebt(debt.id, "balance", val)}
                      type="currency"
                    />
                  </div>
                  <div className="border-r border-border">
                    <EditableCell
                      value={debt.payment}
                      onChange={(val) => updateDebt(debt.id, "payment", val)}
                      type="currency"
                    />
                  </div>
                  <div className="border-r border-border">
                    <EditableCell
                      value={debt.rate}
                      onChange={(val) => updateDebt(debt.id, "rate", val)}
                      type="percentage"
                    />
                  </div>
                  <div className="border-r border-border">
                    <EditableCell
                      value={debt.term}
                      onChange={(val) => updateDebt(debt.id, "term", val)}
                      type="number"
                    />
                  </div>
                  <div className="p-3 border-r border-border text-muted-foreground text-center">
                    {debtMetrics[index]?.remainingTerm > 0
                      ? `${debtMetrics[index].remainingTerm} mo`
                      : '-'}
                  </div>
                  <div className="p-3 border-r border-border text-muted-foreground text-center">
                    {debtMetrics[index]?.maturityDate}
                  </div>
                  <div className="p-3 border-r border-border flex items-center justify-center">
                    <Checkbox
                      checked={included}
                      onCheckedChange={(v) => setDebtInclude(debt.id, v === true)}
                      aria-label="Include in DSCR"
                    />
                  </div>
                  <div className="p-2 flex justify-center">
                    {canRemove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(debt.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="grid grid-cols-9 bg-destructive/10 min-w-[980px]">
              <div className="p-3 border-r border-border font-bold">Total</div>
              <div className="p-3 border-r border-border font-bold">
                {formatCurrency(totals.totalBalance)}
              </div>
              <div className="p-3 border-r border-border font-bold">
                {formatCurrency(totals.totalMonthlyPayment)}
              </div>
              <div className="p-3 border-r border-border text-muted-foreground text-sm">
                Wtd Avg: {totals.weightedAvgRate.toFixed(2)}%
              </div>
              <div className="p-3 border-r border-border"></div>
              <div className="p-3 border-r border-border"></div>
              <div className="p-3 border-r border-border"></div>
              <div className="p-3 border-r border-border"></div>
              <div className="p-3"></div>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Balance (all rows):</span>
                <span className="text-lg font-bold">
                  {formatCurrency(totals.totalBalance)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Included in Contingent Liabilities regardless of DSCR flag.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Annual Debt Service (DSCR rows only):</span>
                <span className="text-lg font-bold text-destructive">
                  {formatCurrency(totals.dscrAnnualDebtService)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Monthly payment × 12, DSCR-flagged rows only.
                {totals.excludedCount > 0 && (
                  <> {totals.excludedCount} of {debts.length} row{debts.length === 1 ? '' : 's'} excluded from DSCR.</>
                )}
              </p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};
