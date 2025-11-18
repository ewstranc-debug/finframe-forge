import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useSpreadsheet, type Debt } from "@/contexts/SpreadsheetContext";

export const ExistingDebts = () => {
  const { debts, setDebts } = useSpreadsheet();

  const addDebt = () => {
    const newId = (debts.length + 1).toString();
    setDebts([...debts, { 
      id: newId, 
      creditor: `Creditor ${newId}`, 
      balance: "0", 
      payment: "0",
      rate: "0",
      term: "0"
    }]);
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const calculateMonthlyPayment = (balance: number, rate: number, term: number) => {
    if (rate === 0 || term === 0) return 0;
    const monthlyRate = rate / 100 / 12;
    const payment = balance * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    return payment;
  };

  const updateDebt = (id: string, field: keyof Debt, value: string) => {
    setDebts(debts.map(d => {
      if (d.id === id) {
        const updated = { ...d, [field]: value };
        // Auto-calculate payment if balance, rate, or term changes and payment is 0 or not manually set
        if ((field === 'balance' || field === 'rate' || field === 'term')) {
          const balance = parseFloat(updated.balance) || 0;
          const rate = parseFloat(updated.rate) || 0;
          const term = parseFloat(updated.term) || 0;
          if (balance > 0 && rate > 0 && term > 0) {
            const calculatedPayment = calculateMonthlyPayment(balance, rate, term);
            updated.payment = calculatedPayment.toFixed(2);
          }
        }
        return updated;
      }
      return d;
    }));
  };

  const calculateTotalBalance = () => {
    return debts.reduce((sum, debt) => sum + (parseFloat(debt.balance) || 0), 0);
  };

  const calculateTotalPayment = () => {
    return debts.reduce((sum, debt) => sum + (parseFloat(debt.payment) || 0), 0);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Existing Debt Schedule</CardTitle>
          <Button onClick={addDebt} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Debt
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-6 bg-muted font-medium text-sm">
              <div className="p-3 border-r border-border">Creditor</div>
              <div className="p-3 border-r border-border">Balance</div>
              <div className="p-3 border-r border-border">Monthly Payment</div>
              <div className="p-3 border-r border-border">Interest Rate</div>
              <div className="p-3 border-r border-border">Term (months)</div>
              <div className="p-3">Actions</div>
            </div>

            {debts.map((debt) => (
              <div key={debt.id} className="grid grid-cols-6 border-b border-border">
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
                    type="number"
                  />
                </div>
                <div className="border-r border-border">
                  <EditableCell
                    value={debt.term}
                    onChange={(val) => updateDebt(debt.id, "term", val)}
                    type="number"
                  />
                </div>
                <div className="p-2 flex justify-center">
                  {debts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDebt(debt.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-6 bg-destructive/10">
              <div className="p-3 border-r border-border font-bold">Total</div>
              <div className="p-3 border-r border-border font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalBalance())}
              </div>
              <div className="p-3 border-r border-border font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalPayment())}
              </div>
              <div className="p-3 border-r border-border"></div>
              <div className="p-3 border-r border-border"></div>
              <div className="p-3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
