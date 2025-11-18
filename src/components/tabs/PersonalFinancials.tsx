import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";
import { useSpreadsheet, PersonalPeriodData } from "@/contexts/SpreadsheetContext";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const PersonalFinancials = () => {
  const {
    personalPeriods,
    setPersonalPeriods,
    personalPeriodLabels,
    setPersonalPeriodLabels,
  } = useSpreadsheet();

  const clearAllData = () => {
    const clearedPeriod: PersonalPeriodData = {
      salary: "0", bonuses: "0", investments: "0", rentalIncome: "0", otherIncome: "0",
      costOfLiving: "0", personalTaxes: "0",
      schedCRevenue: "0", schedCCOGS: "0", schedCExpenses: "0",
      schedCInterest: "0", schedCDepreciation: "0", schedCAmortization: "0", schedCOther: "0"
    };
    setPersonalPeriods(personalPeriods.map(() => ({ ...clearedPeriod })));
  };

  const updateField = (periodIndex: number, field: keyof PersonalPeriodData, value: string) => {
    const newPeriods = [...personalPeriods];
    newPeriods[periodIndex] = { ...newPeriods[periodIndex], [field]: value };
    setPersonalPeriods(newPeriods);
  };

  const updatePeriodLabel = (index: number, value: string) => {
    const newLabels = [...personalPeriodLabels];
    newLabels[index] = value;
    setPersonalPeriodLabels(newLabels);
  };

  const clearColumn = (periodIndex: number) => {
    const clearedPeriod: PersonalPeriodData = {
      salary: "0", bonuses: "0", investments: "0", rentalIncome: "0", otherIncome: "0",
      costOfLiving: "0", personalTaxes: "0",
      schedCRevenue: "0", schedCCOGS: "0", schedCExpenses: "0",
      schedCInterest: "0", schedCDepreciation: "0", schedCAmortization: "0", schedCOther: "0"
    };
    const newPeriods = [...personalPeriods];
    newPeriods[periodIndex] = clearedPeriod;
    setPersonalPeriods(newPeriods);
  };

  const calculateW2Income = (periodIndex: number) => {
    const period = personalPeriods[periodIndex];
    return (parseFloat(period.salary) || 0) + (parseFloat(period.bonuses) || 0) +
           (parseFloat(period.investments) || 0) + (parseFloat(period.rentalIncome) || 0) +
           (parseFloat(period.otherIncome) || 0);
  };

  const calculateSchedCNetIncome = (periodIndex: number) => {
    const period = personalPeriods[periodIndex];
    const revenue = parseFloat(period.schedCRevenue) || 0;
    const expenses = (parseFloat(period.schedCCOGS) || 0) + (parseFloat(period.schedCExpenses) || 0);
    return revenue - expenses;
  };

  const calculateSchedCCashFlow = (periodIndex: number) => {
    const netIncome = calculateSchedCNetIncome(periodIndex);
    const period = personalPeriods[periodIndex];
    const addbacks = (parseFloat(period.schedCInterest) || 0) + 
                     (parseFloat(period.schedCDepreciation) || 0) + 
                     (parseFloat(period.schedCAmortization) || 0) +
                     (parseFloat(period.schedCOther) || 0);
    return netIncome + addbacks;
  };

  const calculateTotalIncome = (periodIndex: number) => {
    return calculateW2Income(periodIndex) + calculateSchedCCashFlow(periodIndex);
  };

  const calculateTotalExpenses = (periodIndex: number) => {
    const period = personalPeriods[periodIndex];
    return (parseFloat(period.costOfLiving) || 0) + (parseFloat(period.personalTaxes) || 0);
  };

  const calculateNetCashFlow = (periodIndex: number) => {
    return calculateTotalIncome(periodIndex) - calculateTotalExpenses(periodIndex);
  };

  const calculateSavingsRate = (periodIndex: number) => {
    const totalIncome = calculateTotalIncome(periodIndex);
    const netCashFlow = calculateNetCashFlow(periodIndex);
    return totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;
  };

  const calculateExpenseRatio = (periodIndex: number) => {
    const totalIncome = calculateTotalIncome(periodIndex);
    const totalExpenses = calculateTotalExpenses(periodIndex);
    return totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Personal Income Statement</h2>
        <Button
          variant="destructive"
          size="sm"
          onClick={clearAllData}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Income & Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left font-semibold sticky left-0 bg-muted z-10">Item</th>
                  {personalPeriodLabels.map((label, i) => (
                    <th key={i} className="border border-border p-3 text-center min-w-[180px]">
                      <div className="space-y-2">
                        <EditableCell
                          value={label}
                          onChange={(val) => updatePeriodLabel(i, val)}
                          type="text"
                          className="text-center font-semibold"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearColumn(i)}
                          className="w-full text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Clear Column
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* W2 Income Section */}
                <tr className="bg-primary/10">
                  <td colSpan={4} className="border border-border p-2 font-semibold sticky left-0">W2 / Salary Income</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Salary/Wages</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={personalPeriods[i].salary}
                        onChange={(val) => updateField(i, "salary", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Bonuses</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={personalPeriods[i].bonuses}
                        onChange={(val) => updateField(i, "bonuses", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Investments</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={personalPeriods[i].investments}
                        onChange={(val) => updateField(i, "investments", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Rental Income</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={personalPeriods[i].rentalIncome}
                        onChange={(val) => updateField(i, "rentalIncome", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Other Income</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={personalPeriods[i].otherIncome}
                        onChange={(val) => updateField(i, "otherIncome", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-secondary/20 font-semibold">
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-secondary/20">Total W2 Income</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4">
                      ${calculateW2Income(i).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                  ))}
                </tr>

                {/* Schedule C Section */}
                <tr className="bg-primary/10">
                  <td colSpan={4} className="border border-border p-2 font-semibold sticky left-0">Schedule C Business Income</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Revenue</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={personalPeriods[i].schedCRevenue}
                        onChange={(val) => updateField(i, "schedCRevenue", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">COGS</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={personalPeriods[i].schedCCOGS}
                        onChange={(val) => updateField(i, "schedCCOGS", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Operating Expenses</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={personalPeriods[i].schedCExpenses}
                        onChange={(val) => updateField(i, "schedCExpenses", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-secondary/20">
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-secondary/20">Schedule C Net Income</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4">
                      ${calculateSchedCNetIncome(i).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                  ))}
                </tr>

                {/* Addbacks */}
                <tr className="bg-accent/10">
                  <td colSpan={4} className="border border-border p-2 pl-6 font-medium sticky left-0">Schedule C Addbacks</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-8 sticky left-0 bg-background">Interest</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={personalPeriods[i].schedCInterest}
                        onChange={(val) => updateField(i, "schedCInterest", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-8 sticky left-0 bg-background">Depreciation</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={personalPeriods[i].schedCDepreciation}
                        onChange={(val) => updateField(i, "schedCDepreciation", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-8 sticky left-0 bg-background">Amortization</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={personalPeriods[i].schedCAmortization}
                        onChange={(val) => updateField(i, "schedCAmortization", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-8 sticky left-0 bg-background">Other Addbacks</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={personalPeriods[i].schedCOther}
                        onChange={(val) => updateField(i, "schedCOther", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-secondary/20 font-semibold">
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-secondary/20">Schedule C Cash Flow</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4">
                      ${calculateSchedCCashFlow(i).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                  ))}
                </tr>

                {/* Expenses */}
                <tr className="bg-primary/10">
                  <td colSpan={4} className="border border-border p-2 font-semibold sticky left-0">Personal Expenses</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Cost of Living</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={personalPeriods[i].costOfLiving}
                        onChange={(val) => updateField(i, "costOfLiving", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Personal Taxes</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border">
                      <EditableCell
                        value={personalPeriods[i].personalTaxes}
                        onChange={(val) => updateField(i, "personalTaxes", val)}
                        type="currency"
                      />
                    </td>
                  ))}
                </tr>

                {/* Totals */}
                <tr className="bg-primary/20 font-bold">
                  <td className="border border-border p-2 sticky left-0 bg-primary/20">Total Income</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4">
                      ${calculateTotalIncome(i).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                  ))}
                </tr>
                <tr className="bg-primary/20 font-bold">
                  <td className="border border-border p-2 sticky left-0 bg-primary/20">Total Expenses</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4">
                      ${calculateTotalExpenses(i).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                  ))}
                </tr>
                <tr className="bg-accent/20 font-bold">
                  <td className="border border-border p-2 sticky left-0 bg-accent/20">Net Cash Flow</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4">
                      ${calculateNetCashFlow(i).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                  ))}
                </tr>

                {/* Financial Ratios */}
                <tr className="bg-primary/10">
                  <td colSpan={4} className="border border-border p-2 font-semibold sticky left-0">Financial Ratios</td>
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Savings Rate</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4">
                      {calculateSavingsRate(i).toFixed(2)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-border p-2 pl-6 sticky left-0 bg-background">Expense Ratio</td>
                  {personalPeriods.map((_, i) => (
                    <td key={i} className="border border-border p-2 text-right pr-4">
                      {calculateExpenseRatio(i).toFixed(2)}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
