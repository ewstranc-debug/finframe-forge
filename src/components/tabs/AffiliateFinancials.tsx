import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useSpreadsheet, type AffiliateIncomeData as IncomeData, type AffiliateBalanceSheetData as BalanceSheetData, type AffiliateEntity } from "@/contexts/SpreadsheetContext";

export const AffiliateFinancials = () => {
  const { affiliateEntities: entities, setAffiliateEntities: setEntities, affiliatePeriodLabels: periodLabels, setAffiliatePeriodLabels: setPeriodLabels } = useSpreadsheet();

  const addEntity = () => {
    const newId = (entities.length + 1).toString();
    const defaultIncomePeriod: IncomeData = { 
      revenue: "0", cogs: "0", officersComp: "0", rentExpense: "0", operatingExpenses: "0", 
      depreciation: "0", amortization: "0", section179: "0", interest: "0", 
      otherIncome: "0", otherExpenses: "0", addbacks: "0", taxes: "0", 
      periodDate: "", periodMonths: "12" 
    };
    const defaultBalancePeriod: BalanceSheetData = { 
      cash: "0", accountsReceivable: "0", inventory: "0", realEstate: "0", 
      accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" 
    };
    setEntities([...entities, { 
      id: newId, 
      name: `Affiliate ${newId}`, 
      incomePeriods: Array(periodLabels.length).fill(null).map(() => ({...defaultIncomePeriod})),
      balancePeriods: Array(periodLabels.length).fill(null).map(() => ({...defaultBalancePeriod}))
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

  const addProjectionColumn = () => {
    const defaultIncomePeriod: IncomeData = { 
      revenue: "0", cogs: "0", officersComp: "0", rentExpense: "0", operatingExpenses: "0", 
      depreciation: "0", amortization: "0", section179: "0", interest: "0", 
      otherIncome: "0", otherExpenses: "0", addbacks: "0", taxes: "0", 
      periodDate: "", periodMonths: "12", isProjection: true 
    };
    const defaultBalancePeriod: BalanceSheetData = { 
      cash: "0", accountsReceivable: "0", inventory: "0", realEstate: "0", 
      accumulatedDepreciation: "0", currentLiabilities: "0", longTermDebt: "0" 
    };
    
    // Add column to all entities
    setEntities(entities.map(e => ({
      ...e,
      incomePeriods: [...e.incomePeriods, defaultIncomePeriod],
      balancePeriods: [...e.balancePeriods, defaultBalancePeriod]
    })));
    
    setPeriodLabels([...periodLabels, `Projection ${periodLabels.filter(l => l.includes('Projection')).length + 1}`]);
  };

  const removePeriodColumn = (periodIndex: number) => {
    if (periodLabels.length <= 1) return;
    
    // Remove column from all entities
    setEntities(entities.map(e => ({
      ...e,
      incomePeriods: e.incomePeriods.filter((_, i) => i !== periodIndex),
      balancePeriods: e.balancePeriods.filter((_, i) => i !== periodIndex)
    })));
    
    setPeriodLabels(periodLabels.filter((_, i) => i !== periodIndex));
  };

  // Calculation functions to match Business P&L format
  const calculateGrossProfit = (entity: AffiliateEntity, periodIndex: number) => {
    const period = entity.incomePeriods[periodIndex];
    if (!period) return 0;
    const revenue = parseFloat(period.revenue) || 0;
    const cogs = parseFloat(period.cogs) || 0;
    return revenue - cogs;
  };

  const calculateTotalIncome = (entity: AffiliateEntity, periodIndex: number) => {
    const grossProfit = calculateGrossProfit(entity, periodIndex);
    const period = entity.incomePeriods[periodIndex];
    if (!period) return grossProfit;
    const otherIncome = parseFloat(period.otherIncome) || 0;
    return grossProfit + otherIncome;
  };

  const calculateTotalDeductions = (entity: AffiliateEntity, periodIndex: number) => {
    const period = entity.incomePeriods[periodIndex];
    if (!period) return 0;
    return (parseFloat(period.officersComp) || 0) +
           (parseFloat(period.rentExpense) || 0) +
           (parseFloat(period.operatingExpenses) || 0) +
           (parseFloat(period.depreciation) || 0) +
           (parseFloat(period.amortization) || 0) +
           (parseFloat(period.section179) || 0) +
           (parseFloat(period.interest) || 0) +
           (parseFloat(period.otherExpenses) || 0);
  };

  const calculateEBITDA = (entity: AffiliateEntity, periodIndex: number) => {
    const period = entity.incomePeriods[periodIndex];
    if (!period) return 0;
    const totalIncome = calculateTotalIncome(entity, periodIndex);
    const operatingDeductions = (parseFloat(period.officersComp) || 0) +
                                 (parseFloat(period.rentExpense) || 0) +
                                 (parseFloat(period.operatingExpenses) || 0);
    return totalIncome - operatingDeductions;
  };

  const calculateEBIT = (entity: AffiliateEntity, periodIndex: number) => {
    const period = entity.incomePeriods[periodIndex];
    if (!period) return 0;
    const ebitda = calculateEBITDA(entity, periodIndex);
    const depreciation = parseFloat(period.depreciation) || 0;
    const amortization = parseFloat(period.amortization) || 0;
    const section179 = parseFloat(period.section179) || 0;
    return ebitda - depreciation - amortization - section179;
  };

  const calculateEBT = (entity: AffiliateEntity, periodIndex: number) => {
    const totalIncome = calculateTotalIncome(entity, periodIndex);
    const totalDeductions = calculateTotalDeductions(entity, periodIndex);
    return totalIncome - totalDeductions;
  };

  const calculateNetIncome = (entity: AffiliateEntity, periodIndex: number) => {
    const period = entity.incomePeriods[periodIndex];
    if (!period) return 0;
    const ebt = calculateEBT(entity, periodIndex);
    const taxes = parseFloat(period.taxes) || 0;
    return ebt - taxes;
  };

  const calculateCashFlow = (entity: AffiliateEntity, periodIndex: number) => {
    const period = entity.incomePeriods[periodIndex];
    if (!period) return 0;
    const netIncome = calculateNetIncome(entity, periodIndex);
    const depreciation = parseFloat(period.depreciation) || 0;
    const amortization = parseFloat(period.amortization) || 0;
    const section179 = parseFloat(period.section179) || 0;
    const addbacks = parseFloat(period.addbacks) || 0;
    return netIncome + depreciation + amortization + section179 + addbacks;
  };

  const calculateTotalAssets = (entity: AffiliateEntity, periodIndex: number) => {
    const period = entity.balancePeriods[periodIndex];
    if (!period) return 0;
    const currentAssets = (parseFloat(period.cash) || 0) + 
                         (parseFloat(period.accountsReceivable) || 0) +
                         (parseFloat(period.inventory) || 0);
    const netFixedAssets = (parseFloat(period.realEstate) || 0) - (parseFloat(period.accumulatedDepreciation) || 0);
    return currentAssets + netFixedAssets;
  };

  const calculateTotalLiabilities = (entity: AffiliateEntity, periodIndex: number) => {
    const period = entity.balancePeriods[periodIndex];
    if (!period) return 0;
    return (parseFloat(period.currentLiabilities) || 0) + (parseFloat(period.longTermDebt) || 0);
  };

  const calculateEquity = (entity: AffiliateEntity, periodIndex: number) => {
    return calculateTotalAssets(entity, periodIndex) - calculateTotalLiabilities(entity, periodIndex);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  };

  // Dynamic grid columns for flexible period count
  const gridStyle = { gridTemplateColumns: `minmax(200px, 1fr) repeat(${periodLabels.length}, minmax(150px, 1fr))` };
  const minWidth = `${200 + periodLabels.length * 150}px`;

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Affiliate Financial Statements</CardTitle>
          <div className="flex gap-2">
            <Button onClick={addProjectionColumn} variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Projection Column
            </Button>
            <Button onClick={addEntity} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Affiliate
            </Button>
          </div>
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

              {/* Income Statement - Business P&L Format */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Income Statement (P&L)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
                    {/* Header Row with Period Labels */}
                    <div className="grid bg-muted font-medium text-sm" style={{...gridStyle, minWidth}}>
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
                                value={entity.incomePeriods[i]?.periodDate || ""}
                                onChange={(val) => {
                                  setEntities(entities.map(e => {
                                    if (e.id === entity.id) {
                                      const newPeriods = [...e.incomePeriods];
                                      if (!newPeriods[i]) return e;
                                      newPeriods[i] = { ...newPeriods[i], periodDate: val };
                                      if (val && i > 0 && e.incomePeriods[i-1]?.periodDate) {
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
                                value={entity.incomePeriods[i]?.periodMonths || "12"}
                                onChange={(val) => {
                                  setEntities(entities.map(e => {
                                    if (e.id === entity.id) {
                                      const newPeriods = [...e.incomePeriods];
                                      if (!newPeriods[i]) return e;
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
                            {entity.incomePeriods[i]?.isProjection && periodLabels.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePeriodColumn(i)}
                                className="text-destructive hover:text-destructive text-xs h-6 px-2"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* INCOME SECTION */}
                    <div className="bg-success/20 p-2 px-3 font-semibold text-sm" style={{minWidth}}>INCOME</div>

                    {/* Line 1: Revenue */}
                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">1. Revenue</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.revenue || "0"}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "revenue", val)}
                            type="currency"
                            dataField={`${entity.id}-revenue-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Line 2: COGS */}
                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">2. Cost of Goods Sold</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.cogs || "0"}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "cogs", val)}
                            type="currency"
                            dataField={`${entity.id}-cogs-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Line 3: Gross Profit (calculated) */}
                    <div className="grid border-b border-border bg-muted/50" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border font-semibold">3. Gross Profit</div>
                      {entity.incomePeriods.map((_, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0 font-semibold">
                          {formatCurrency(calculateGrossProfit(entity, i))}
                        </div>
                      ))}
                    </div>

                    {/* Line 4: Other Income */}
                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">4. Other Income</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.otherIncome || "0"}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "otherIncome", val)}
                            type="currency"
                            dataField={`${entity.id}-otherIncome-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Line 5: Total Income (calculated) */}
                    <div className="grid border-b-2 border-border bg-success/10" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border font-bold">5. Total Income</div>
                      {entity.incomePeriods.map((_, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                          {formatCurrency(calculateTotalIncome(entity, i))}
                        </div>
                      ))}
                    </div>

                    {/* DEDUCTIONS SECTION */}
                    <div className="bg-destructive/20 p-2 px-3 font-semibold text-sm" style={{minWidth}}>DEDUCTIONS</div>

                    {/* Line 6: Officers Compensation */}
                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">6. Officers Compensation</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.officersComp || "0"}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "officersComp", val)}
                            type="currency"
                            dataField={`${entity.id}-officersComp-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Line 7: Rent Expense */}
                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">7. Rent Expense</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.rentExpense || "0"}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "rentExpense", val)}
                            type="currency"
                            dataField={`${entity.id}-rentExpense-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Line 8: Other Operating Expenses */}
                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">8. Other Operating Expenses</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.operatingExpenses || "0"}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "operatingExpenses", val)}
                            type="currency"
                            dataField={`${entity.id}-operatingExpenses-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* EBITDA (calculated) */}
                    <div className="grid border-b border-border bg-accent/10" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border font-semibold">EBITDA</div>
                      {entity.incomePeriods.map((_, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0 font-semibold">
                          {formatCurrency(calculateEBITDA(entity, i))}
                        </div>
                      ))}
                    </div>

                    {/* Line 9: Depreciation */}
                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">9. Depreciation</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.depreciation || "0"}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "depreciation", val)}
                            type="currency"
                            dataField={`${entity.id}-depreciation-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Line 10: Amortization */}
                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">10. Amortization</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.amortization || "0"}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "amortization", val)}
                            type="currency"
                            dataField={`${entity.id}-amortization-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Line 11: Section 179 */}
                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">11. Section 179 Deduction</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.section179 || "0"}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "section179", val)}
                            type="currency"
                            dataField={`${entity.id}-section179-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* EBIT (calculated) */}
                    <div className="grid border-b border-border bg-accent/10" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border font-semibold">EBIT</div>
                      {entity.incomePeriods.map((_, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0 font-semibold">
                          {formatCurrency(calculateEBIT(entity, i))}
                        </div>
                      ))}
                    </div>

                    {/* Line 12: Interest */}
                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">12. Interest Expense</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.interest || "0"}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "interest", val)}
                            type="currency"
                            dataField={`${entity.id}-interest-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Line 13: Other Expenses */}
                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">13. Other Deductions</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.otherExpenses || "0"}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "otherExpenses", val)}
                            type="currency"
                            dataField={`${entity.id}-otherExpenses-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Line 14: Total Deductions (calculated) */}
                    <div className="grid border-b border-border bg-destructive/10" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border font-bold">14. Total Deductions</div>
                      {entity.incomePeriods.map((_, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                          {formatCurrency(calculateTotalDeductions(entity, i))}
                        </div>
                      ))}
                    </div>

                    {/* Line 15: Income Before Taxes (EBT) */}
                    <div className="grid border-b border-border bg-muted/50" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border font-semibold">15. Income Before Taxes (EBT)</div>
                      {entity.incomePeriods.map((_, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0 font-semibold">
                          {formatCurrency(calculateEBT(entity, i))}
                        </div>
                      ))}
                    </div>

                    {/* Line 16: Taxes */}
                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">16. Provision for Taxes</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.taxes || "0"}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "taxes", val)}
                            type="currency"
                            dataField={`${entity.id}-taxes-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Line 17: Net Income (calculated) */}
                    <div className="grid border-b-2 border-border bg-primary/10" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border font-bold">17. Net Income</div>
                      {entity.incomePeriods.map((_, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                          {formatCurrency(calculateNetIncome(entity, i))}
                        </div>
                      ))}
                    </div>

                    {/* CASH FLOW ADDBACKS SECTION */}
                    <div className="bg-accent/20 p-2 px-3 font-semibold text-sm" style={{minWidth}}>CASH FLOW ADDBACKS</div>

                    {/* Addbacks */}
                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Other Addbacks</div>
                      {entity.incomePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.addbacks || "0"}
                            onChange={(val) => updateIncomePeriod(entity.id, i, "addbacks", val)}
                            type="currency"
                            dataField={`${entity.id}-addbacks-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Cash Flow for DSCR (calculated) */}
                    <div className="grid bg-accent/10" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border font-bold">Cash Flow for DSCR</div>
                      {entity.incomePeriods.map((_, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                          {formatCurrency(calculateCashFlow(entity, i))}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Balance Sheet */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Balance Sheet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
                    <div className="grid bg-muted font-medium text-sm" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border">Line Item</div>
                      {periodLabels.map((label, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0">{label}</div>
                      ))}
                    </div>

                    <div className="bg-success/20 p-2 px-3 font-semibold text-sm" style={{minWidth}}>ASSETS</div>

                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Cash</div>
                      {entity.balancePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.cash || "0"}
                            onChange={(val) => updateBalancePeriod(entity.id, i, "cash", val)}
                            type="currency"
                            dataField={`${entity.id}-cash-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Accounts Receivable</div>
                      {entity.balancePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.accountsReceivable || "0"}
                            onChange={(val) => updateBalancePeriod(entity.id, i, "accountsReceivable", val)}
                            type="currency"
                            dataField={`${entity.id}-accountsReceivable-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Inventory</div>
                      {entity.balancePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.inventory || "0"}
                            onChange={(val) => updateBalancePeriod(entity.id, i, "inventory", val)}
                            type="currency"
                            dataField={`${entity.id}-inventory-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Real Estate/Fixed Assets</div>
                      {entity.balancePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.realEstate || "0"}
                            onChange={(val) => updateBalancePeriod(entity.id, i, "realEstate", val)}
                            type="currency"
                            dataField={`${entity.id}-realEstate-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Accumulated Depreciation</div>
                      {entity.balancePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.accumulatedDepreciation || "0"}
                            onChange={(val) => updateBalancePeriod(entity.id, i, "accumulatedDepreciation", val)}
                            type="currency"
                            dataField={`${entity.id}-accumulatedDepreciation-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid border-b-2 border-border bg-success/10" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border font-bold">Total Assets</div>
                      {entity.balancePeriods.map((_, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                          {formatCurrency(calculateTotalAssets(entity, i))}
                        </div>
                      ))}
                    </div>

                    <div className="bg-destructive/20 p-2 px-3 font-semibold text-sm" style={{minWidth}}>LIABILITIES</div>

                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Current Liabilities</div>
                      {entity.balancePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.currentLiabilities || "0"}
                            onChange={(val) => updateBalancePeriod(entity.id, i, "currentLiabilities", val)}
                            type="currency"
                            dataField={`${entity.id}-currentLiabilities-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid border-b border-border" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border bg-secondary/30 font-medium">Long-Term Debt</div>
                      {entity.balancePeriods.map((period, i) => (
                        <div key={i} className="border-r border-border last:border-r-0">
                          <EditableCell
                            value={period?.longTermDebt || "0"}
                            onChange={(val) => updateBalancePeriod(entity.id, i, "longTermDebt", val)}
                            type="currency"
                            dataField={`${entity.id}-longTermDebt-${i}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid border-b-2 border-border bg-destructive/10" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border font-bold">Total Liabilities</div>
                      {entity.balancePeriods.map((_, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                          {formatCurrency(calculateTotalLiabilities(entity, i))}
                        </div>
                      ))}
                    </div>

                    <div className="grid bg-accent/10" style={{...gridStyle, minWidth}}>
                      <div className="p-3 border-r border-border font-bold">Equity</div>
                      {entity.balancePeriods.map((_, i) => (
                        <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                          {formatCurrency(calculateEquity(entity, i))}
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
