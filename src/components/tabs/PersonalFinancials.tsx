import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";

interface PersonalData {
  salary: string;
  bonuses: string;
  investments: string;
  rentalIncome: string;
  otherIncome: string;
}

export const PersonalFinancials = () => {
  const [data, setData] = useState<PersonalData>({
    salary: "0",
    bonuses: "0",
    investments: "0",
    rentalIncome: "0",
    otherIncome: "0",
  });

  const updateField = (field: keyof PersonalData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    return Object.values(data).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Financial Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 bg-muted font-medium text-sm">
              <div className="p-3 border-r border-border">Income Source</div>
              <div className="p-3 border-r border-border">Annual Amount</div>
              <div className="p-3">Monthly Amount</div>
            </div>

            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Salary/Wages</div>
              <div className="border-r border-border">
                <EditableCell
                  value={data.salary}
                  onChange={(val) => updateField("salary", val)}
                  type="currency"
                />
              </div>
              <div className="p-3 text-muted-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((parseFloat(data.salary) || 0) / 12)}
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Bonuses/Commission</div>
              <div className="border-r border-border">
                <EditableCell
                  value={data.bonuses}
                  onChange={(val) => updateField("bonuses", val)}
                  type="currency"
                />
              </div>
              <div className="p-3 text-muted-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((parseFloat(data.bonuses) || 0) / 12)}
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Investment Income</div>
              <div className="border-r border-border">
                <EditableCell
                  value={data.investments}
                  onChange={(val) => updateField("investments", val)}
                  type="currency"
                />
              </div>
              <div className="p-3 text-muted-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((parseFloat(data.investments) || 0) / 12)}
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Rental Income</div>
              <div className="border-r border-border">
                <EditableCell
                  value={data.rentalIncome}
                  onChange={(val) => updateField("rentalIncome", val)}
                  type="currency"
                />
              </div>
              <div className="p-3 text-muted-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((parseFloat(data.rentalIncome) || 0) / 12)}
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Other Income</div>
              <div className="border-r border-border">
                <EditableCell
                  value={data.otherIncome}
                  onChange={(val) => updateField("otherIncome", val)}
                  type="currency"
                />
              </div>
              <div className="p-3 text-muted-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((parseFloat(data.otherIncome) || 0) / 12)}
              </div>
            </div>

            <div className="grid grid-cols-3 bg-primary/10">
              <div className="p-3 border-r border-border font-bold">Total Income</div>
              <div className="p-3 border-r border-border font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotal())}
              </div>
              <div className="p-3 font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotal() / 12)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
