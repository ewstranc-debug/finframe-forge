import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { EditableCell } from "../EditableCell";

export const Summary = () => {
  const [loanAmount, setLoanAmount] = useState("0");
  const [interestRate, setInterestRate] = useState("0");
  const [termMonths, setTermMonths] = useState("120");
  const [guaranteePercent, setGuaranteePercent] = useState("75");
  const [injectionEquity, setInjectionEquity] = useState("0");
  const [closingCosts, setClosingCosts] = useState("0");
  const [workingCapital, setWorkingCapital] = useState("0");

  const calculateSBAFees = () => {
    const amount = parseFloat(loanAmount) || 0;
    const guaranteePct = parseFloat(guaranteePercent) || 75;
    const guaranteedAmount = amount * (guaranteePct / 100);
    
    let upfrontFee = 0;
    
    if (amount <= 150000) {
      upfrontFee = 0;
    } else if (amount <= 700000) {
      upfrontFee = (amount - 150000) * 0.03;
    } else {
      upfrontFee = (550000 * 0.03) + ((amount - 700000) * 0.035);
    }
    
    const annualFee = guaranteedAmount * 0.0055;
    
    return { upfrontFee, annualFee, guaranteedAmount };
  };

  const calculateMonthlyPayment = () => {
    const principal = parseFloat(loanAmount) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const term = parseFloat(termMonths) || 1;
    
    if (rate === 0) return principal / term;
    
    const payment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    return payment;
  };

  const fees = calculateSBAFees();
  const monthlyPayment = calculateMonthlyPayment();
  const totalSources = parseFloat(loanAmount) + parseFloat(injectionEquity);
  const totalUses = fees.upfrontFee + parseFloat(closingCosts) + parseFloat(workingCapital);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sources & Uses of Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sources */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-success">Sources</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">SBA 7(a) Loan</label>
                  <EditableCell
                    value={loanAmount}
                    onChange={setLoanAmount}
                    type="currency"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Equity Injection</label>
                  <EditableCell
                    value={injectionEquity}
                    onChange={setInjectionEquity}
                    type="currency"
                  />
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total Sources</span>
                    <span className="text-success">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalSources)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Uses */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Uses</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">SBA Guarantee Fee</label>
                  <div className="p-3 bg-muted/50 rounded-md font-medium text-destructive">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(fees.upfrontFee)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Closing Costs</label>
                  <EditableCell
                    value={closingCosts}
                    onChange={setClosingCosts}
                    type="currency"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Working Capital</label>
                  <EditableCell
                    value={workingCapital}
                    onChange={setWorkingCapital}
                    type="currency"
                  />
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total Uses</span>
                    <span className="text-primary">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalUses)}
                    </span>
                  </div>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Interest Rate (%)</label>
              <EditableCell
                value={interestRate}
                onChange={setInterestRate}
                type="number"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Term (months)</label>
              <EditableCell
                value={termMonths}
                onChange={setTermMonths}
                type="number"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">SBA Guarantee (%)</label>
              <EditableCell
                value={guaranteePercent}
                onChange={setGuaranteePercent}
                type="number"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Monthly Payment</label>
              <div className="p-3 bg-primary/10 rounded-md font-bold text-primary">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(monthlyPayment)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Guaranteed Amount:</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(fees.guaranteedAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Annual Servicing Fee:</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(fees.annualFee)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">Combined from all sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Debts</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">Existing + Proposed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Cash Flow</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">Income - Expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Debt-to-Income</CardTitle>
            <PieChart className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0%</div>
            <p className="text-xs text-muted-foreground mt-1">DTI Ratio</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Income Sources</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Personal Income:</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Business Income:</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Affiliate Income:</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Debt Obligations</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Existing Debts:</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Proposed Debts:</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold">$0.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
