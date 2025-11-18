import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";

interface PeriodData {
  salary: string;
  bonuses: string;
  investments: string;
  rentalIncome: string;
  otherIncome: string;
}

export const PersonalFinancials = () => {
  const [periods, setPeriods] = useState<PeriodData[]>([
    { salary: "0", bonuses: "0", investments: "0", rentalIncome: "0", otherIncome: "0" },
    { salary: "0", bonuses: "0", investments: "0", rentalIncome: "0", otherIncome: "0" },
    { salary: "0", bonuses: "0", investments: "0", rentalIncome: "0", otherIncome: "0" },
    { salary: "0", bonuses: "0", investments: "0", rentalIncome: "0", otherIncome: "0" }
  ]);

  const [periodLabels, setPeriodLabels] = useState(["Year 1", "Year 2", "Year 3", "Interim"]);

  const updateField = (periodIndex: number, field: keyof PeriodData, value: string) => {
    const newPeriods = [...periods];
    newPeriods[periodIndex] = { ...newPeriods[periodIndex], [field]: value };
    setPeriods(newPeriods);
  };

  const updatePeriodLabel = (index: number, value: string) => {
    const newLabels = [...periodLabels];
    newLabels[index] = value;
    setPeriodLabels(newLabels);
  };

  const calculateTotal = (periodIndex: number) => {
    return Object.values(periods[periodIndex]).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Financial Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
            <div className="grid grid-cols-5 bg-muted font-medium text-sm min-w-[800px]">
              <div className="p-3 border-r border-border">Income Source</div>
              {periodLabels.map((label, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={label}
                    onChange={(val) => updatePeriodLabel(i, val)}
                    type="text"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Salary/Wages</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.salary}
                    onChange={(val) => updateField(i, "salary", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Bonuses/Commission</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.bonuses}
                    onChange={(val) => updateField(i, "bonuses", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Investment Income</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.investments}
                    onChange={(val) => updateField(i, "investments", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Rental Income</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.rentalIncome}
                    onChange={(val) => updateField(i, "rentalIncome", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Other Income</div>
              {periods.map((period, i) => (
                <div key={i} className="border-r border-border last:border-r-0">
                  <EditableCell
                    value={period.otherIncome}
                    onChange={(val) => updateField(i, "otherIncome", val)}
                    type="currency"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-5 bg-primary/10 min-w-[800px]">
              <div className="p-3 border-r border-border font-bold">Total Income</div>
              {periods.map((_, i) => (
                <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotal(i))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
