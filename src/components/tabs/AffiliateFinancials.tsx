import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface PeriodData {
  revenue: string;
  expenses: string;
}

interface AffiliateEntity {
  id: string;
  name: string;
  periods: PeriodData[];
}

export const AffiliateFinancials = () => {
  const [periodLabels, setPeriodLabels] = useState(["12/31/2023", "12/31/2024", "12/31/2025", "Interim"]);
  
  const [entities, setEntities] = useState<AffiliateEntity[]>([
    { 
      id: "1", 
      name: "Affiliate 1", 
      periods: [
        { revenue: "0", expenses: "0" },
        { revenue: "0", expenses: "0" },
        { revenue: "0", expenses: "0" },
        { revenue: "0", expenses: "0" }
      ]
    }
  ]);

  const addEntity = () => {
    const newId = (entities.length + 1).toString();
    setEntities([...entities, { 
      id: newId, 
      name: `Affiliate ${newId}`, 
      periods: [
        { revenue: "0", expenses: "0" },
        { revenue: "0", expenses: "0" },
        { revenue: "0", expenses: "0" },
        { revenue: "0", expenses: "0" }
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

  const updateEntityPeriod = (id: string, periodIndex: number, field: keyof PeriodData, value: string) => {
    setEntities(entities.map(e => {
      if (e.id === id) {
        const newPeriods = [...e.periods];
        newPeriods[periodIndex] = { ...newPeriods[periodIndex], [field]: value };
        return { ...e, periods: newPeriods };
      }
      return e;
    }));
  };

  const updatePeriodLabel = (index: number, value: string) => {
    const newLabels = [...periodLabels];
    newLabels[index] = value;
    setPeriodLabels(newLabels);
  };

  const calculateEntityNet = (entity: AffiliateEntity, periodIndex: number) => {
    const period = entity.periods[periodIndex];
    return (parseFloat(period.revenue) || 0) - (parseFloat(period.expenses) || 0);
  };

  const calculateTotalNet = (periodIndex: number) => {
    return entities.reduce((sum, entity) => {
      return sum + calculateEntityNet(entity, periodIndex);
    }, 0);
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
        <CardContent className="space-y-4">
          {entities.map((entity) => (
            <div key={entity.id} className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted p-3 flex justify-between items-center">
                <EditableCell
                  value={entity.name}
                  onChange={(val) => updateEntityName(entity.id, val)}
                  type="text"
                  className="font-medium"
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

              <div className="overflow-x-auto">
                <div className="grid grid-cols-5 bg-secondary/20 font-medium text-sm min-w-[800px]">
                  <div className="p-3 border-r border-border">Line Item</div>
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
                  <div className="p-3 border-r border-border font-medium bg-success/10">Revenue</div>
                  {entity.periods.map((period, i) => (
                    <div key={i} className="border-r border-border last:border-r-0">
                      <EditableCell
                        value={period.revenue}
                        onChange={(val) => updateEntityPeriod(entity.id, i, "revenue", val)}
                        type="currency"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-5 border-b border-border min-w-[800px]">
                  <div className="p-3 border-r border-border font-medium bg-destructive/10">Expenses</div>
                  {entity.periods.map((period, i) => (
                    <div key={i} className="border-r border-border last:border-r-0">
                      <EditableCell
                        value={period.expenses}
                        onChange={(val) => updateEntityPeriod(entity.id, i, "expenses", val)}
                        type="currency"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-5 bg-accent/10 min-w-[800px]">
                  <div className="p-3 border-r border-border font-bold">Net Income</div>
                  {entity.periods.map((_, i) => (
                    <div key={i} className="p-3 border-r border-border last:border-r-0 font-bold">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateEntityNet(entity, i))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="border-t-2 border-primary pt-4 overflow-x-auto">
            <div className="grid grid-cols-5 bg-primary/20 rounded-lg min-w-[800px]">
              <div className="p-3 font-bold text-lg">Combined Net Income</div>
              {periodLabels.map((_, i) => (
                <div key={i} className="p-3 font-bold text-lg">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalNet(i))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
