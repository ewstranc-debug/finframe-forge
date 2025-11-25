import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PieChart, Info } from "lucide-react";
import { EditableCell } from "../EditableCell";
import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { calculateDSCR } from "@/utils/financialCalculations";
import { useMemo } from "react";

export const Summary = () => {
  const {
    interestRate, setInterestRate,
    termMonths, setTermMonths,
    guaranteePercent, setGuaranteePercent,
    injectionEquity, setInjectionEquity,
    equityPercentage, setEquityPercentage,
    uses, setUses,
    businessPeriods,
    personalPeriods,
    interimPeriodMonths,
    debts,
    personalLiabilities,
  } = useSpreadsheet();

  const updateUse = (id: string, field: "description" | "amount", value: string) => {
    setUses(uses.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const calculatePrimaryRequest = () => {
    return uses.reduce((sum, use) => sum + (parseFloat(use.amount) || 0), 0);
  };

  const calculateSBAFees = (primaryAmount: number) => {
    const guaranteePct = parseFloat(guaranteePercent) || 75;
    const guaranteedAmount = primaryAmount * (guaranteePct / 100);
    
    let upfrontFee = 0;
    
    if (primaryAmount <= 150000) {
      upfrontFee = 0;
    } else if (primaryAmount <= 700000) {
      upfrontFee = (primaryAmount - 150000) * 0.03;
    } else {
      upfrontFee = (550000 * 0.03) + ((primaryAmount - 700000) * 0.035);
    }
    
    const annualFee = guaranteedAmount * 0.0055;
    
    return { upfrontFee, annualFee, guaranteedAmount };
  };

  const calculateMonthlyPayment = (principal: number) => {
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const term = parseFloat(termMonths) || 1;
    
    if (rate === 0) return principal / term;
    
    const payment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    return payment;
  };

  const calculateAnnualPayment = (monthlyPayment: number) => {
    return monthlyPayment * 12;
  };

  const calculateDSCRForPeriod = (businessPeriodIndex: number, personalPeriodIndex: number) => {
    const businessPeriod = businessPeriods[businessPeriodIndex];
    const personalPeriod = personalPeriods[personalPeriodIndex];
    
    if (!businessPeriod || !personalPeriod) {
      return {
        dscr: 0,
        totalIncome: 0,
        netCashFlow: 0,
        debtService: 0,
        businessCashFlow: 0,
        personalW2Income: 0,
        schedCNetIncome: 0,
        officersComp: 0,
        existingDebtPayment: 0,
        personalDebtPayment: 0,
        personalExpenses: 0,
      };
    }
    
    const result = calculateDSCR({
      businessPeriod,
      personalPeriod,
      debts,
      personalLiabilitiesMonthly: {
        creditCardsMonthly: personalLiabilities.creditCardsMonthly,
        mortgagesMonthly: personalLiabilities.mortgagesMonthly,
        vehicleLoansMonthly: personalLiabilities.vehicleLoansMonthly,
        otherLiabilitiesMonthly: personalLiabilities.otherLiabilitiesMonthly,
      },
      uses,
      interestRate,
      termMonths,
      guaranteePercent,
    });
    
    return {
      dscr: result.dscr,
      totalIncome: result.totalIncomeAvailable,
      netCashFlow: result.netCashAvailable,
      debtService: result.annualDebtService,
      businessCashFlow: result.businessEbitda,
      personalW2Income: result.personalW2Income,
      schedCNetIncome: result.schedCCashFlow,
      officersComp: result.officersComp,
      existingDebtPayment: result.existingDebtPayment,
      personalDebtPayment: result.personalDebtPayment,
      personalExpenses: result.personalExpenses,
    };
  };

  const calculateGlobalDSCR = () => {
    // Calculate DSCR for only last full year and interim period
    const period3 = calculateDSCRForPeriod(2, 2); // Last full year
    const interim = calculateDSCRForPeriod(3, 2); // Interim uses last personal period
    
    // Average only last full year and interim
    const avgDSCR = (period3.dscr + interim.dscr) / 2;
    
    return avgDSCR;
  };

  const handleEquityPercentageChange = (value: string) => {
    setEquityPercentage(value);
    const primaryRequest = calculatePrimaryRequest();
    const fees = calculateSBAFees(primaryRequest);
    const totalProjectCost = primaryRequest + fees.upfrontFee;
    const calculatedEquity = (parseFloat(value) || 0) / 100 * totalProjectCost;
    setInjectionEquity(calculatedEquity.toString());
  };

  const primaryRequest = calculatePrimaryRequest();
  const fees = calculateSBAFees(primaryRequest);
  const finalLoanAmount = primaryRequest + fees.upfrontFee;
  const monthlyPayment = calculateMonthlyPayment(finalLoanAmount);
  const annualPayment = calculateAnnualPayment(monthlyPayment);
  const totalSources = finalLoanAmount + parseFloat(injectionEquity || "0");
  const totalUses = primaryRequest + fees.upfrontFee;
  
  // Memoize DSCR calculations for performance
  const lastFullYear = useMemo(() => calculateDSCRForPeriod(2, 2), [
    businessPeriods, personalPeriods, debts, personalLiabilities, uses, interestRate, termMonths, guaranteePercent
  ]);
  
  const interimPeriod = useMemo(() => calculateDSCRForPeriod(3, 2), [
    businessPeriods, personalPeriods, debts, personalLiabilities, uses, interestRate, termMonths, guaranteePercent
  ]);
  
  const globalDSCR = useMemo(() => calculateGlobalDSCR(), [lastFullYear, interimPeriod]);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sources & Uses of Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Uses of Funds</h3>
              <div className="border border-border rounded-lg overflow-hidden mb-4">
                <div className="grid grid-cols-2 bg-muted font-medium text-sm">
                  <div className="p-3 border-r border-border">Description</div>
                  <div className="p-3">Amount</div>
                </div>
                {uses.map((use) => (
                  <div key={use.id} className="grid grid-cols-2 border-b border-border">
                    <div className="border-r border-border bg-secondary/30">
                      <EditableCell
                        value={use.description}
                        onChange={(val) => updateUse(use.id, "description", val)}
                        type="text"
                      />
                    </div>
                    <div>
                      <EditableCell
                        value={use.amount}
                        onChange={(val) => updateUse(use.id, "amount", val)}
                        type="currency"
                      />
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 font-semibold bg-primary/10">
                  <div className="p-3 border-r border-border">Primary Request</div>
                  <div className="p-3">${primaryRequest.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="p-3 border-r border-border">SBA Guarantee Fee (Upfront)</div>
                  <div className="p-3">${fees.upfrontFee.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                </div>
                <div className="grid grid-cols-2 font-bold bg-primary/20">
                  <div className="p-3 border-r border-border">Total Uses</div>
                  <div className="p-3">${totalUses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Sources of Funds</h3>
              <div className="border border-border rounded-lg overflow-hidden mb-4">
                <div className="grid grid-cols-2 bg-muted font-medium text-sm">
                  <div className="p-3 border-r border-border">Description</div>
                  <div className="p-3">Amount</div>
                </div>
                <div className="grid grid-cols-2 border-b border-border">
                  <div className="p-3 border-r border-border bg-secondary/30">SBA 7(a) Loan</div>
                  <div className="p-3">${finalLoanAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                </div>
                <div className="grid grid-cols-2 border-b border-border">
                  <div className="p-3 border-r border-border bg-secondary/30">Equity Injection</div>
                  <div>
                    <EditableCell
                      value={injectionEquity}
                      onChange={setInjectionEquity}
                      type="currency"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 border-b border-border bg-accent/20">
                  <div className="p-3 border-r border-border text-sm">Equity % of Total Project</div>
                  <div className="p-2">
                    <EditableCell
                      value={equityPercentage}
                      onChange={handleEquityPercentageChange}
                      type="number"
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 font-bold bg-primary/20">
                  <div className="p-3 border-r border-border">Total Sources</div>
                  <div className="p-3">${totalSources.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loan Terms & Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Interest Rate (%)</label>
              <EditableCell
                value={interestRate}
                onChange={setInterestRate}
                type="interestRate"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Term (months)</label>
              <EditableCell
                value={termMonths}
                onChange={setTermMonths}
                type="termMonths"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">SBA Guarantee (%)</label>
              <EditableCell
                value={guaranteePercent}
                onChange={setGuaranteePercent}
                type="percentage"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">SBA Annual Fee</label>
              <div className="h-9 px-3 py-2 bg-muted rounded-md flex items-center">
                ${fees.annualFee.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">Annual Payment</div>
                <div className="text-2xl font-bold text-primary">
                  ${annualPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">Monthly Payment</div>
                <div className="text-2xl font-bold text-primary">
                  ${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Last Full Year</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2 border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">Business EBITDA</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p className="font-semibold mb-2">EBITDA Calculation:</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between gap-4">
                                  <span>Revenue + Other Income:</span>
                                  <span className="font-mono">
                                    ${((parseFloat(businessPeriods[2].revenue) || 0) + (parseFloat(businessPeriods[2].otherIncome) || 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Less: COGS:</span>
                                  <span className="font-mono">
                                    -${(parseFloat(businessPeriods[2].cogs) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Less: Operating Expenses:</span>
                                  <span className="font-mono">
                                    -${(parseFloat(businessPeriods[2].operatingExpenses) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Less: Rent Expense:</span>
                                  <span className="font-mono">
                                    -${(parseFloat(businessPeriods[2].rentExpense) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Less: Other Expenses:</span>
                                  <span className="font-mono">
                                    -${(parseFloat(businessPeriods[2].otherExpenses) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div className="border-t border-border pt-1 mt-1 flex justify-between gap-4 font-semibold">
                                  <span>EBITDA:</span>
                                  <span className="font-mono">${lastFullYear.businessCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                              </div>
                              <p className="text-xs mt-2 text-muted-foreground">Source: Business Financials tab (annualized)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-2xl font-bold mt-1">${lastFullYear.businessCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">Debt Service</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p className="font-semibold mb-2">Debt Service Breakdown:</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between gap-4">
                                  <span>Proposed Loan Payment:</span>
                                  <span className="font-mono">${annualPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Existing Business Debts:</span>
                                  <span className="font-mono">${lastFullYear.existingDebtPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Personal Debt Payments:</span>
                                  <span className="font-mono">${lastFullYear.personalDebtPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="border-t border-border pt-1 mt-1 flex justify-between gap-4 font-semibold">
                                  <span>Total:</span>
                                  <span className="font-mono">${lastFullYear.debtService.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                              </div>
                              <p className="text-xs mt-2 text-muted-foreground">Sources: Summary + Existing Debts + Personal Financial Statement tabs</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-2xl font-bold mt-1">${lastFullYear.debtService.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <PieChart className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p className="font-semibold mb-2">Net Cash Flow Breakdown:</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between gap-4 text-green-600">
                                  <span>Total Income:</span>
                                  <span className="font-mono">${lastFullYear.totalIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between gap-4 text-red-600">
                                  <span>Total Debt Service:</span>
                                  <span className="font-mono">-${lastFullYear.debtService.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between gap-4 text-red-600">
                                  <span>Personal Expenses:</span>
                                  <span className="font-mono">-${lastFullYear.personalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="border-t border-border pt-1 mt-1 flex justify-between gap-4 font-semibold">
                                  <span>Net Cash Flow:</span>
                                  <span className="font-mono">${lastFullYear.netCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                              </div>
                              <p className="text-xs mt-2 text-muted-foreground">Sources: Total Income & Debt Service (above) + Personal Financials tab</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-2xl font-bold mt-1">${lastFullYear.netCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">DSCR</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p className="font-semibold mb-2">DSCR Calculation:</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between gap-4">
                                  <span>Net Cash Available:</span>
                                  <span className="font-mono">${lastFullYear.netCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>÷ Total Debt Service:</span>
                                  <span className="font-mono">${lastFullYear.debtService.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="border-t border-border pt-1 mt-1 flex justify-between gap-4 font-semibold">
                                  <span>DSCR Ratio:</span>
                                  <span className="font-mono">{lastFullYear.dscr.toFixed(2)}x</span>
                                </div>
                              </div>
                              <p className="text-xs mt-2">Indicates ability to cover debt. &gt;1.25 is strong, 1.0-1.25 is acceptable, &lt;1.0 is weak.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className={`text-2xl font-bold mt-1 ${lastFullYear.dscr >= 1.25 ? 'text-green-600' : lastFullYear.dscr >= 1.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {lastFullYear.dscr.toFixed(2)}x
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Interim Period</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">Business EBITDA</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p className="font-semibold mb-2">EBITDA Calculation:</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between gap-4">
                                  <span>Revenue + Other Income:</span>
                                  <span className="font-mono">
                                    ${((parseFloat(businessPeriods[3].revenue) || 0) + (parseFloat(businessPeriods[3].otherIncome) || 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Less: COGS:</span>
                                  <span className="font-mono">
                                    -${(parseFloat(businessPeriods[3].cogs) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Less: Operating Expenses:</span>
                                  <span className="font-mono">
                                    -${(parseFloat(businessPeriods[3].operatingExpenses) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Less: Rent Expense:</span>
                                  <span className="font-mono">
                                    -${(parseFloat(businessPeriods[3].rentExpense) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Less: Other Expenses:</span>
                                  <span className="font-mono">
                                    -${(parseFloat(businessPeriods[3].otherExpenses) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div className="border-t border-border pt-1 mt-1 flex justify-between gap-4 font-semibold">
                                  <span>EBITDA:</span>
                                  <span className="font-mono">${interimPeriod.businessCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                              </div>
                              <p className="text-xs mt-2 text-muted-foreground">Source: Business Financials tab (interim, annualized)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-2xl font-bold mt-1">${interimPeriod.businessCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">Debt Service</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p className="font-semibold mb-2">Debt Service Breakdown:</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between gap-4">
                                  <span>Proposed Loan Payment:</span>
                                  <span className="font-mono">${annualPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Existing Business Debts:</span>
                                  <span className="font-mono">${interimPeriod.existingDebtPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Personal Debt Payments:</span>
                                  <span className="font-mono">${interimPeriod.personalDebtPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="border-t border-border pt-1 mt-1 flex justify-between gap-4 font-semibold">
                                  <span>Total:</span>
                                  <span className="font-mono">${interimPeriod.debtService.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                              </div>
                              <p className="text-xs mt-2 text-muted-foreground">Sources: Summary + Existing Debts + Personal Financial Statement tabs</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-2xl font-bold mt-1">${interimPeriod.debtService.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <PieChart className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p className="font-semibold mb-2">Net Cash Flow Breakdown:</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between gap-4 text-green-600">
                                  <span>Total Income:</span>
                                  <span className="font-mono">${interimPeriod.totalIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between gap-4 text-red-600">
                                  <span>Total Debt Service:</span>
                                  <span className="font-mono">-${interimPeriod.debtService.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between gap-4 text-red-600">
                                  <span>Personal Expenses:</span>
                                  <span className="font-mono">-${interimPeriod.personalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="border-t border-border pt-1 mt-1 flex justify-between gap-4 font-semibold">
                                  <span>Net Cash Flow:</span>
                                  <span className="font-mono">${interimPeriod.netCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                              </div>
                              <p className="text-xs mt-2 text-muted-foreground">Sources: Total Income & Debt Service (above) + Personal Financials tab</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-2xl font-bold mt-1">${interimPeriod.netCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">DSCR</p>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p className="font-semibold mb-2">DSCR Calculation:</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between gap-4">
                                  <span>Net Cash Available:</span>
                                  <span className="font-mono">${interimPeriod.netCashFlow.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>÷ Total Debt Service:</span>
                                  <span className="font-mono">${interimPeriod.debtService.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="border-t border-border pt-1 mt-1 flex justify-between gap-4 font-semibold">
                                  <span>DSCR Ratio:</span>
                                  <span className="font-mono">{interimPeriod.dscr.toFixed(2)}x</span>
                                </div>
                              </div>
                              <p className="text-xs mt-2">Indicates ability to cover debt. &gt;1.25 is strong, 1.0-1.25 is acceptable, &lt;1.0 is weak.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className={`text-2xl font-bold mt-1 ${interimPeriod.dscr >= 1.25 ? 'text-green-600' : interimPeriod.dscr >= 1.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {interimPeriod.dscr.toFixed(2)}x
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
