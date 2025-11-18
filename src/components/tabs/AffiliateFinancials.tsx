import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface IncomeData {
  revenue: string;
  cogs: string;
  operatingExpenses: string;
  depreciation: string;
  amortization: string;
  interest: string;
  taxes: string;
  periodDate: string;
  periodMonths: string;
}

interface BalanceSheetData {
  cash: string;
  accountsReceivable: string;
  inventory: string;
  realEstate: string;
  accumulatedDepreciation: string;
  currentLiabilities: string;
  longTermDebt: string;
}

interface AffiliateEntity {
  id: string;
  name: string;
  incomePeriods: IncomeData[];
  balancePeriods: BalanceSheetData[];
}

export const AffiliateFinancials = () => {
  const [periodLabels, setPeriodLabels] = useState(["12/31/2023", "12/31/2024", "12/31/2025", "Interim"]);

  const focusNextCell = (entityId: string, currentRow: string, currentCol: number) => {
    const incomeFields = ['revenue', 'cogs', 'operatingExpenses', 'depreciation', 'amortization', 'interest', 'taxes'];
    const balanceFields = ['cash', 'accountsReceivable', 'inventory', 'realEstate', 'accumulatedDepreciation', 'currentLiabilities', 'longTermDebt'];
    
    const isIncomeField = incomeFields.includes(currentRow);
    const fields = isIncomeField ? incomeFields : balanceFields;
    const currentIndex = fields.indexOf(currentRow);
    
    if (currentIndex < fields.length - 1) {
      const nextField = fields[currentIndex + 1];
      const nextInput = document.querySelector(`input[data-field="${entityId}-${nextField}-${currentCol}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const focusRightCell = (entityId: string, currentRow: string, currentCol: number) => {
    if (currentCol < 3) {
      const nextInput = document.querySelector(`input[data-field="${entityId}-${currentRow}-${currentCol + 1}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };
  
  const [entities, setEntities] = useState<AffiliateEntity[]>([
    { 
      id: "1", 
      name: "Affiliate 1", 
      incomePeriods: [
        { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", amortization: "0", interest: "0", taxes: "0", periodDate: "", periodMonths: "12" },
        { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", amortization: "0", interest: "0", taxes: "0", periodDate: "", periodMonths: "12" },
        { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", amortization: "0", interest: "0", taxes: "0", periodDate: "", periodMonths: "12" },
        { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", amortization: "0", interest: "0", taxes: "0", periodDate: "", periodMonths: "12" }
      ],
      balancePeriods: [
        { cash: "0", accountsReceivable: "0", inventory: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" },
        { cash: "0", accountsReceivable: "0", inventory: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" },
        { cash: "0", accountsReceivable: "0", inventory: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" },
        { cash: "0", accountsReceivable: "0", inventory: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" }
      ]
    }
  ]);

  const addEntity = () => {
    const newId = (entities.length + 1).toString();
    setEntities([...entities, { 
      id: newId, 
      name: `Affiliate ${newId}`, 
      incomePeriods: [
        { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", amortization: "0", interest: "0", taxes: "0", periodDate: "", periodMonths: "12" },
        { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", amortization: "0", interest: "0", taxes: "0", periodDate: "", periodMonths: "12" },
        { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", amortization: "0", interest: "0", taxes: "0", periodDate: "", periodMonths: "12" },
        { revenue: "0", cogs: "0", operatingExpenses: "0", depreciation: "0", amortization: "0", interest: "0", taxes: "0", periodDate: "", periodMonths: "12" }
      ],
      balancePeriods: [
        { cash: "0", accountsReceivable: "0", inventory: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" },
        { cash: "0", accountsReceivable: "0", inventory: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" },
        { cash: "0", accountsReceivable: "0", inventory: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" },
        { cash: "0", accountsReceivable: "0", inventory: "0", realEstate: "0", accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" }
      ]
    }]);
  };

  const removeEntity = (id: string) => {
    setEntities(entities.filter(e => e.id !== id));
  };

  const updateEntityName = (id: string, value: string) => {
    setEntities(entities.map(e => 
      e.id === id ? { ...e, name: value } : e
    ));
  };

  const updateIncomePeriod = (id: string, periodIndex: number, field: keyof IncomeData, value: string) => {
    setEntities(entities.map(e => {
      if (e.id === id) {
        const newPeriods = [...e.incomePeriods];
        newPeriods[periodIndex] = { ...newPeriods[periodIndex], [field]: value };
        return { ...e, incomePeriods: newPeriods };
      }
      return e;
    }));
  };

  const updateBalancePeriod = (id: string, periodIndex: number, field: keyof BalanceSheetData, value: string) => {
    setEntities(entities.map(e => {
      if (e.id === id) {
        const newPeriods = [...e.balancePeriods];
        newPeriods[periodIndex] = { ...newPeriods[periodIndex], [field]: value };
        return { ...e, balancePeriods: newPeriods };
      }
      return e;
    }));
  };

  const updatePeriodLabel = (index: number, value: string) => {
    const newLabels = [...periodLabels];
    newLabels[index] = value;
    setPeriodLabels(newLabels);
  };

  const calculateNetIncome = (entity: AffiliateEntity, periodIndex: number) => {
    const period = entity.incomePeriods[periodIndex];
    
    const revenue = parseFloat(period.revenue) || 0;
    const expenses = (parseFloat(period.cogs) || 0) +
                     (parseFloat(period.operatingExpenses) || 0) +
                     (parseFloat(period.depreciation) || 0) +
                     (parseFloat(period.amortization) || 0) +
                     (parseFloat(period.interest) || 0) +
                     (parseFloat(period.taxes) || 0);
    return revenue - expenses;
  };

  const calculateTotalAssets = (entity: AffiliateEntity, periodIndex: number) => {
    const period = entity.balancePeriods[periodIndex];
    const currentAssets = (parseFloat(period.cash) || 0) + 
                         (parseFloat(period.accountsReceivable) || 0) +
                         (parseFloat(period.inventory) || 0);
    const netFixedAssets = (parseFloat(period.realEstate) || 0) - (parseFloat(period.accumulatedDepreciation) || 0);
    return currentAssets + netFixedAssets;
  };

  const calculateTotalLiabilities = (entity: AffiliateEntity, periodIndex: number) => {
    const period = entity.balancePeriods[periodIndex];
    return (parseFloat(period.currentLiabilities) || 0) + (parseFloat(period.longTermDebt) || 0);
  };

  const calculateEquity = (entity: AffiliateEntity, periodIndex: number) => {
    return calculateTotalAssets(entity, periodIndex) - calculateTotalLiabilities(entity, periodIndex);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Affiliate Financial Statements</CardTitle>
          <Button onClick={addEntity} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Affiliate
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {entities.map((entity) => (
            <div key={entity.id} className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <EditableCell
                  value={entity.name}
                  onChange={(val) => updateEntityName(entity.id, val)}
                  type="text"
                  className="font-medium text-lg"
                />
                {entities.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEntity(entity.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Income Statement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
                    <div className="grid grid-cols-5 bg-muted font-medium text-sm min-w-[800px]">
                      <div className="p-3 border-r border-border">Line Item</div>
                      {periodLabels.map((label, i) => (
                        <div key={i} className="border-r border-border last:border-r-0 p-2">
                          <div className="space-y-1">
                            <EditableCell
                              value={label}
                              onChange={(val) => updatePeriodLabel(i, val)}
                              type="text"
                              className="text-center font-semibold"
                            />
                            <div className="text-xs text-muted-foreground">
                              <EditableCell
                                value={entity.incomePeriods[i].periodDate}
                                onChange={(val) => {
                                  setEntities(entities.map(e => {
                                    if (e.id === entity.id) {
                                      const newPeriods = [...e.incomePeriods];
                                      newPeriods[i] = { ...newPeriods[i], periodDate: val };
                                      // Auto-calculate months if we have a previous date
                                      if (val && i > 0 && e.incomePeriods[i-1].periodDate) {
                                        const prevDate = new Date(e.incomePeriods[i-1].periodDate);
                                        const currDate = new Date(val);
                                        const monthsDiff = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
                                        if (monthsDiff > 0) {
                                          newPeriods[i] = { ...newPeriods[i], periodMonths: monthsDiff.toString() };
                                        }
                                      }
                                      return { ...e, incomePeriods: newPeriods };
                                    }
                                    return e;
                                  }));
                                }}
                                type="text"
                                className="text-center text-xs"
                              />
                            </div>
                            <div className="flex items-center justify-center gap-1 text-xs">
                              <span>Months:</span>
                              <EditableCell
                                value={entity.incomePeriods[i].periodMonths}
                                onChange={(val) => {
                                  setEntities(entities.map(e => {
                                    if (e.id === entity.id) {
                                      const newPeriods = [...e.incomePeriods];
                                      newPeriods[i] = { ...newPeriods[i], periodMonths: val };
                                      return { ...e, incomePeriods: newPeriods };
                                    }
                                    return e;
                                  }));
                                }}
                                type="number"
                                className="text-center text-xs w-12"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Revenue</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period.revenue}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "revenue", val)}
                            type="currency"
                            onEnter={() => focusNextCell(entity.id, 'revenue', i)}
                            onTab={() => focusRightCell(entity.id, 'revenue', i)}
                            dataField={`${entity.id}-revenue-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">COGS</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period.cogs}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "cogs", val)}
                            type="currency"
                            onEnter={() => focusNextCell(entity.id, 'cogs', i)}
                            onTab={() => focusRightCell(entity.id, 'cogs', i)}
                            dataField={`${entity.id}-cogs-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Operating Expenses</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period.operatingExpenses}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "operatingExpenses", val)}
                            type="currency"
                            onEnter={() => focusNextCell(entity.id, 'operatingExpenses', i)}
                            onTab={() => focusRightCell(entity.id, 'operatingExpenses', i)}
                            dataField={`${entity.id}-operatingExpenses-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Depreciation</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period.depreciation}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "depreciation", val)}
                            type="currency"
                            onEnter={() => focusNextCell(entity.id, 'depreciation', i)}
                            onTab={() => focusRightCell(entity.id, 'depreciation', i)}
                            dataField={`${entity.id}-depreciation-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Amortization</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period.amortization}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "amortization", val)}
                            type="currency"
                            onEnter={() => focusNextCell(entity.id, 'amortization', i)}
                            onTab={() => focusRightCell(entity.id, 'amortization', i)}
                            dataField={`${entity.id}-amortization-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Interest</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period.interest}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "interest", val)}
                            type="currency"
                            onEnter={() => focusNextCell(entity.id, 'interest', i)}
                            onTab={() => focusRightCell(entity.id, 'interest', i)}
                            dataField={`${entity.id}-interest-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Taxes</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period.taxes}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "taxes", val)}
                            type="currency"
                            onEnter={() => focusNextCell(entity.id, 'taxes', i)}
                            onTab={() => focusRightCell(entity.id, 'taxes', i)}
                            dataField={`${entity.id}-taxes-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 bg-primary/10 min-w-[800px]">
                      <div className="p-3 border-r border-border font-bold">Net Income</div>
                      {entity.incomePeriods.map((_, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateNetIncome(entity, i))}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Balance Sheet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
                    <div className="grid grid-cols-5 bg-muted font-medium text-sm min-w-[800px]">
                      <div className="p-3 border-r border-border">Line Item</div>
                      {periodLabels.map((label, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0">{label}</div>
                      ))}
                    </div>

                    <div className="mt-2 mb-2 px-3">
                      <h4 className="text-sm font-semibold text-success">Assets</h4>
                    </div>

                    <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Cash</div>
                      {entity.balancePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period.cash}
                            onChange={(val) => updateBalancePeriod(entity.id, i, "cash", val)}
                            type="currency"
                            onEnter={() => focusNextCell(entity.id, 'cash', i)}
                            onTab={() => focusRightCell(entity.id, 'cash', i)}
                            dataField={`${entity.id}-cash-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">A/R</div>
                      {entity.balancePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period.accountsReceivable}
                            onChange={(val) => updateBalancePeriod(entity.id, i, "accountsReceivable", val)}
                            type="currency"
                            onEnter={() => focusNextCell(entity.id, 'accountsReceivable', i)}
                            onTab={() => focusRightCell(entity.id, 'accountsReceivable', i)}
                            dataField={`${entity.id}-accountsReceivable-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Inventory</div>
                      {entity.balancePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period.inventory}
                            onChange={(val) => updateBalancePeriod(entity.id, i, "inventory", val)}
                            type="currency"
                            onEnter={() => focusNextCell(entity.id, 'inventory', i)}
                            onTab={() => focusRightCell(entity.id, 'inventory', i)}
                            dataField={`${entity.id}-inventory-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Real Estate/Fixed Assets</div>
                      {entity.balancePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period.realEstate}
                            onChange={(val) => updateBalancePeriod(entity.id, i, "realEstate", val)}
                            type="currency"
                            onEnter={() => focusNextCell(entity.id, 'realEstate', i)}
                            onTab={() => focusRightCell(entity.id, 'realEstate', i)}
                            dataField={`${entity.id}-realEstate-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Accum. Depreciation</div>
                      {entity.balancePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period.accumulatedDepreciation}
                            onChange={(val) => updateBalancePeriod(entity.id, i, "accumulatedDepreciation", val)}
                            type="currency"
                            onEnter={() => focusNextCell(entity.id, 'accumulatedDepreciation', i)}
                            onTab={() => focusRightCell(entity.id, 'accumulatedDepreciation', i)}
                            dataField={`${entity.id}-accumulatedDepreciation-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 border-b-2 border-border bg-success/10 min-w-[800px]">
                      <div className="p-3 border-r border-border font-bold">Total Assets</div>
                      {entity.balancePeriods.map((_, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalAssets(entity, i))}
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 mb-2 px-3">
                      <h4 className="text-sm font-semibold text-destructive">Liabilities</h4>
                    </div>

                    <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Current Liabilities</div>
                      {entity.balancePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period.currentLiabilities}
                            onChange={(val) => updateBalancePeriod(entity.id, i, "currentLiabilities", val)}
                            type="currency"
                            onEnter={() => focusNextCell(entity.id, 'currentLiabilities', i)}
                            onTab={() => focusRightCell(entity.id, 'currentLiabilities', i)}
                            dataField={`${entity.id}-currentLiabilities-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Long-Term Debt</div>
                      {entity.balancePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period.longTermDebt}
                            onChange={(val) => updateBalancePeriod(entity.id, i, "longTermDebt", val)}
                            type="currency"
                            onEnter={() => focusNextCell(entity.id, 'longTermDebt', i)}
                            onTab={() => focusRightCell(entity.id, 'longTermDebt', i)}
                            dataField={`${entity.id}-longTermDebt-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 border-b-2 border-border bg-destructive/10 min-w-[800px]">
                      <div className="p-3 border-r border-border font-bold">Total Liabilities</div>
                      {entity.balancePeriods.map((_, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalLiabilities(entity, i))}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 bg-accent/10 min-w-[800px]">
                      <div className="p-3 border-r border-border font-bold">Equity</div>
                      {entity.balancePeriods.map((_, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateEquity(entity, i))}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
