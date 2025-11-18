import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface ProposedDebt {
  id: string;
  purpose: string;
  amount: string;
  payment: string;
  rate: string;
  term: string;
}

export const ProposedDebts = () => {
  const [debts, setDebts] = useState<ProposedDebt[]>([
    { id: "1", purpose: "Loan Purpose 1", amount: "0", payment: "0", rate: "0", term: "0" }
  ]);

  const addDebt = () => {
    const newId = (debts.length + 1).toString();
    setDebts([...debts, { 
      id: newId, 
      purpose: `Loan Purpose ${newId}`, 
      amount: "0", 
      payment: "0",
      rate: "0",
      term: "0"
    }]);
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const updateDebt = (id: string, field: keyof ProposedDebt, value: string) => {
    setDebts(debts.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const calculateTotalAmount = () => {
    return debts.reduce((sum, debt) => sum + (parseFloat(debt.amount) || 0), 0);
  };

  const calculateTotalPayment = () => {
    return debts.reduce((sum, debt) => sum + (parseFloat(debt.payment) || 0), 0);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Proposed Debt Schedule</CardTitle>
          <Button onClick={addDebt} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Proposed Debt
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-6 bg-muted font-medium text-sm">
              <div className="p-3 border-r border-border">Loan Purpose</div>
              <div className="p-3 border-r border-border">Loan Amount</div>
              <div className="p-3 border-r border-border">Monthly Payment</div>
              <div className="p-3 border-r border-border">Interest Rate</div>
              <div className="p-3 border-r border-border">Term (months)</div>
              <div className="p-3">Actions</div>
            </div>

            {debts.map((debt) => (
              <div key={debt.id} className="grid grid-cols-6 border-b border-border">
                <div className="border-r border-border bg-secondary/30">
                  <EditableCell
                    value={debt.purpose}
                    onChange={(val) => updateDebt(debt.id, "purpose", val)}
                    type="text"
                  />
                </div>
                <div className="border-r border-border">
                  <EditableCell
                    value={debt.amount}
                    onChange={(val) => updateDebt(debt.id, "amount", val)}
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

            <div className="grid grid-cols-6 bg-warning/10">
              <div className="p-3 border-r border-border font-bold">Total</div>
              <div className="p-3 border-r border-border font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalAmount())}
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
