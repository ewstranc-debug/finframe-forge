import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { EditableCell } from "../EditableCell";

interface UseOfFunds {
  id: string;
  description: string;
  amount: string;
}

export const Summary = () => {
  const [interestRate, setInterestRate] = useState("0");
  const [termMonths, setTermMonths] = useState("120");
  const [guaranteePercent, setGuaranteePercent] = useState("75");
  const [injectionEquity, setInjectionEquity] = useState("0");
  
  const [uses, setUses] = useState<UseOfFunds[]>([
    { id: "1", description: "RE Purchase", amount: "0" },
    { id: "2", description: "Refinance", amount: "0" },
    { id: "3", description: "Working Capital", amount: "0" },
    { id: "4", description: "Inventory", amount: "0" },
    { id: "5", description: "Business Acquisition", amount: "0" },
    { id: "6", description: "Construction", amount: "0" },
    { id: "7", description: "Contingency", amount: "0" },
    { id: "8", description: "Interest Reserve", amount: "0" },
  ]);

  const updateUse = (id: string, field: keyof UseOfFunds, value: string) => {
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

  const primaryRequest = calculatePrimaryRequest();
  const fees = calculateSBAFees(primaryRequest);
  const finalLoanAmount = primaryRequest + fees.upfrontFee;
  const monthlyPayment = calculateMonthlyPayment(finalLoanAmount);
  const totalSources = finalLoanAmount + parseFloat(injectionEquity);
  const totalUses = primaryRequest + fees.upfrontFee;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sources & Uses of Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Uses */}
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
                <div className="grid grid-cols-2 bg-primary/10">
                  <div className="p-3 border-r border-border font-bold">Primary Request</div>
                  <div className="p-3 font-bold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(primaryRequest)}
                  </div>
                </div>
                <div className="grid grid-cols-2 bg-destructive/10">
                  <div className="p-3 border-r border-border font-medium">SBA Guarantee Fee</div>
                  <div className="p-3 font-medium text-destructive">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(fees.upfrontFee)}
                  </div>
                </div>
                <div className="grid grid-cols-2 bg-success/10">
                  <div className="p-3 border-r border-border font-bold text-lg">Final Loan Amount</div>
                  <div className="p-3 font-bold text-lg text-success">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(finalLoanAmount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Sources */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-success">Sources of Funds</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">SBA 7(a) Loan</label>
                  <div className="p-3 bg-success/10 rounded-md font-bold text-success">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(finalLoanAmount)}
                  </div>
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
