import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";

interface BusinessData {
  revenue: string;
  cogs: string;
  operatingExpenses: string;
  depreciation: string;
  interest: string;
  taxes: string;
}

export const BusinessFinancials = () => {
  const [data, setData] = useState<BusinessData>({
    revenue: "0",
    cogs: "0",
    operatingExpenses: "0",
    depreciation: "0",
    interest: "0",
    taxes: "0",
  });

  const updateField = (field: keyof BusinessData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const calculateNetIncome = () => {
    const revenue = parseFloat(data.revenue) || 0;
    const expenses = (parseFloat(data.cogs) || 0) + 
                     (parseFloat(data.operatingExpenses) || 0) + 
                     (parseFloat(data.depreciation) || 0) + 
                     (parseFloat(data.interest) || 0) + 
                     (parseFloat(data.taxes) || 0);
    return revenue - expenses;
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Income Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 bg-muted font-medium text-sm">
              <div className="p-3 border-r border-border">Line Item</div>
              <div className="p-3 border-r border-border">Annual Amount</div>
              <div className="p-3">Monthly Amount</div>
            </div>

            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-3 border-r border-border bg-success/10 font-medium">Total Revenue</div>
              <div className="border-r border-border">
                <EditableCell
                  value={data.revenue}
                  onChange={(val) => updateField("revenue", val)}
                  type="currency"
                />
              </div>
              <div className="p-3 text-muted-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((parseFloat(data.revenue) || 0) / 12)}
              </div>
            </div>

            <div className="mt-2 mb-2 px-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Expenses</h4>
            </div>

            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Cost of Goods Sold</div>
              <div className="border-r border-border">
                <EditableCell
                  value={data.cogs}
                  onChange={(val) => updateField("cogs", val)}
                  type="currency"
                />
              </div>
              <div className="p-3 text-muted-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((parseFloat(data.cogs) || 0) / 12)}
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Operating Expenses</div>
              <div className="border-r border-border">
                <EditableCell
                  value={data.operatingExpenses}
                  onChange={(val) => updateField("operatingExpenses", val)}
                  type="currency"
                />
              </div>
              <div className="p-3 text-muted-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((parseFloat(data.operatingExpenses) || 0) / 12)}
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Depreciation & Amortization</div>
              <div className="border-r border-border">
                <EditableCell
                  value={data.depreciation}
                  onChange={(val) => updateField("depreciation", val)}
                  type="currency"
                />
              </div>
              <div className="p-3 text-muted-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((parseFloat(data.depreciation) || 0) / 12)}
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Interest Expense</div>
              <div className="border-r border-border">
                <EditableCell
                  value={data.interest}
                  onChange={(val) => updateField("interest", val)}
                  type="currency"
                />
              </div>
              <div className="p-3 text-muted-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((parseFloat(data.interest) || 0) / 12)}
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Taxes</div>
              <div className="border-r border-border">
                <EditableCell
                  value={data.taxes}
                  onChange={(val) => updateField("taxes", val)}
                  type="currency"
                />
              </div>
              <div className="p-3 text-muted-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((parseFloat(data.taxes) || 0) / 12)}
              </div>
            </div>

            <div className="grid grid-cols-3 bg-primary/10">
              <div className="p-3 border-r border-border font-bold">Net Income</div>
              <div className="p-3 border-r border-border font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateNetIncome())}
              </div>
              <div className="p-3 font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateNetIncome() / 12)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
