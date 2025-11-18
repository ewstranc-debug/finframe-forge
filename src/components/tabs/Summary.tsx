import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { EditableCell } from "../EditableCell";
import { useSpreadsheet } from "@/contexts/SpreadsheetContext";

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

  const calculateGlobalDSCR = () => {
    const latestBusinessPeriod = businessPeriods[2];
    
    const businessRevenue = (parseFloat(latestBusinessPeriod.revenue) || 0) + (parseFloat(latestBusinessPeriod.otherIncome) || 0);
    const businessExpenses = (parseFloat(latestBusinessPeriod.cogs) || 0) + 
                            (parseFloat(latestBusinessPeriod.operatingExpenses) || 0) +
                            (parseFloat(latestBusinessPeriod.rentExpense) || 0) +
                            (parseFloat(latestBusinessPeriod.otherExpenses) || 0);
    const businessEBITDA = businessRevenue - businessExpenses;
    
    const officersComp = parseFloat(latestBusinessPeriod.officersComp) || 0;
    const depreciationAddback = parseFloat(latestBusinessPeriod.depreciation) || 0;
    const amortizationAddback = parseFloat(latestBusinessPeriod.amortization) || 0;
    const section179Addback = parseFloat(latestBusinessPeriod.section179) || 0;
    const otherAddbacks = parseFloat(latestBusinessPeriod.addbacks) || 0;
    
    const businessCashFlow = businessEBITDA + depreciationAddback + amortizationAddback + section179Addback + otherAddbacks;
    
    const latestPersonalPeriod = personalPeriods[2];
    const personalW2Income = (parseFloat(latestPersonalPeriod.salary) || 0) + 
                            (parseFloat(latestPersonalPeriod.bonuses) || 0) +
                            (parseFloat(latestPersonalPeriod.investments) || 0) +
                            (parseFloat(latestPersonalPeriod.rentalIncome) || 0) +
                            (parseFloat(latestPersonalPeriod.otherIncome) || 0);
    
    const schedCRevenue = parseFloat(latestPersonalPeriod.schedCRevenue) || 0;
    const schedCExpenses = (parseFloat(latestPersonalPeriod.schedCCOGS) || 0) + (parseFloat(latestPersonalPeriod.schedCExpenses) || 0);
    const schedCAddbacks = (parseFloat(latestPersonalPeriod.schedCInterest) || 0) + 
                          (parseFloat(latestPersonalPeriod.schedCDepreciation) || 0) + 
                          (parseFloat(latestPersonalPeriod.schedCAmortization) || 0) +
                          (parseFloat(latestPersonalPeriod.schedCOther) || 0);
    const schedCCashFlow = (schedCRevenue - schedCExpenses) + schedCAddbacks;
    
    const totalIncomeAvailable = businessCashFlow + officersComp + personalW2Income + schedCCashFlow;
    
    const personalExpenses = (parseFloat(latestPersonalPeriod.costOfLiving) || 0) + (parseFloat(latestPersonalPeriod.personalTaxes) || 0);
    const estimatedTaxOnOfficersComp = officersComp * 0.30;
    
    const netCashAvailable = totalIncomeAvailable - personalExpenses - estimatedTaxOnOfficersComp;
    
    const primaryRequest = calculatePrimaryRequest();
    const fees = calculateSBAFees(primaryRequest);
    const finalLoanAmount = primaryRequest + fees.upfrontFee;
    const monthlyPayment = calculateMonthlyPayment(finalLoanAmount);
    const annualDebtService = monthlyPayment * 12;
    
    return annualDebtService > 0 ? netCashAvailable / annualDebtService : 0;
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
  const totalSources = finalLoanAmount + parseFloat(injectionEquity);
  const totalUses = primaryRequest + fees.upfrontFee;
  const globalDSCR = calculateGlobalDSCR();

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
                  <div className="p-3">${primaryRequest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="p-3 border-r border-border">SBA Guarantee Fee (Upfront)</div>
                  <div className="p-3">${fees.upfrontFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div className="grid grid-cols-2 font-bold bg-primary/20">
                  <div className="p-3 border-r border-border">Total Uses</div>
                  <div className="p-3">${totalUses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
                  <div className="p-3">${finalLoanAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
                  <div className="p-3">${totalSources.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
                type="number"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Term (months)</label>
              <EditableCell
                value={termMonths}
                onChange={setTermMonths}
                type="number"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">SBA Guarantee (%)</label>
              <EditableCell
                value={guaranteePercent}
                onChange={setGuaranteePercent}
                type="number"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">SBA Annual Fee</label>
              <div className="h-9 px-3 py-2 bg-muted rounded-md flex items-center">
                ${fees.annualFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">Annual Payment</div>
                <div className="text-2xl font-bold text-primary">
                  ${annualPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">Monthly Payment</div>
                <div className="text-2xl font-bold text-primary">
                  ${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-accent/10">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">Global DSCR</div>
                <div className={`text-2xl font-bold ${globalDSCR >= 1.25 ? 'text-green-600' : globalDSCR >= 1.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {globalDSCR.toFixed(2)}x
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Income</p>
                    <p className="text-2xl font-bold mt-1">$0</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Debts</p>
                    <p className="text-2xl font-bold mt-1">$0</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                    <p className="text-2xl font-bold mt-1">$0</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Debt Service</p>
                    <p className="text-2xl font-bold mt-1">${annualPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                  </div>
                  <PieChart className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
