import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";

export const LoanDetails = () => {
  const [loanAmount, setLoanAmount] = useState("0");
  const [interestRate, setInterestRate] = useState("0");
  const [termMonths, setTermMonths] = useState("120");
  const [guaranteePercent, setGuaranteePercent] = useState("75");

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

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Loan Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Loan Amount</label>
              <EditableCell
                value={loanAmount}
                onChange={setLoanAmount}
                type="currency"
              />
            </div>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calculated Payment & Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Monthly Payment</span>
              <span className="font-bold text-primary">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(monthlyPayment)}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Guaranteed Amount</span>
              <span>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(fees.guaranteedAmount)}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">SBA Upfront Guarantee Fee</span>
              <span className="text-destructive font-semibold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(fees.upfrontFee)}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">SBA Annual Servicing Fee</span>
              <span className="text-muted-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(fees.annualFee)}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-bold">Total Loan Amount (with upfront fee)</span>
              <span className="font-bold text-lg">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((parseFloat(loanAmount) || 0) + fees.upfrontFee)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
