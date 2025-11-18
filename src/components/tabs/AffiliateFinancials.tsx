import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface AffiliateEntity {
  id: string;
  name: string;
  revenue: string;
  expenses: string;
}

export const AffiliateFinancials = () => {
  const [entities, setEntities] = useState<AffiliateEntity[]>([
    { id: "1", name: "Affiliate 1", revenue: "0", expenses: "0" }
  ]);

  const addEntity = () => {
    const newId = (entities.length + 1).toString();
    setEntities([...entities, { 
      id: newId, 
      name: `Affiliate ${newId}`, 
      revenue: "0", 
      expenses: "0" 
    }]);
  };

  const removeEntity = (id: string) => {
    setEntities(entities.filter(e => e.id !== id));
  };

  const updateEntity = (id: string, field: keyof AffiliateEntity, value: string) => {
    setEntities(entities.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const calculateTotalNet = () => {
    return entities.reduce((sum, entity) => {
      const revenue = parseFloat(entity.revenue) || 0;
      const expenses = parseFloat(entity.expenses) || 0;
      return sum + (revenue - expenses);
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
                  onChange={(val) => updateEntity(entity.id, "name", val)}
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

              <div className="grid grid-cols-3 bg-secondary/20 font-medium text-sm">
                <div className="p-3 border-r border-border">Line Item</div>
                <div className="p-3 border-r border-border">Annual Amount</div>
                <div className="p-3">Monthly Amount</div>
              </div>

              <div className="grid grid-cols-3 border-b border-border">
                <div className="p-3 border-r border-border font-medium">Revenue</div>
                <div className="border-r border-border">
                  <EditableCell
                    value={entity.revenue}
                    onChange={(val) => updateEntity(entity.id, "revenue", val)}
                    type="currency"
                  />
                </div>
                <div className="p-3 text-muted-foreground">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((parseFloat(entity.revenue) || 0) / 12)}
                </div>
              </div>

              <div className="grid grid-cols-3 border-b border-border">
                <div className="p-3 border-r border-border font-medium">Expenses</div>
                <div className="border-r border-border">
                  <EditableCell
                    value={entity.expenses}
                    onChange={(val) => updateEntity(entity.id, "expenses", val)}
                    type="currency"
                  />
                </div>
                <div className="p-3 text-muted-foreground">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((parseFloat(entity.expenses) || 0) / 12)}
                </div>
              </div>

              <div className="grid grid-cols-3 bg-accent/10">
                <div className="p-3 border-r border-border font-bold">Net Income</div>
                <div className="p-3 border-r border-border font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                    (parseFloat(entity.revenue) || 0) - (parseFloat(entity.expenses) || 0)
                  )}
                </div>
                <div className="p-3 font-bold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                    ((parseFloat(entity.revenue) || 0) - (parseFloat(entity.expenses) || 0)) / 12
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="border-t-2 border-primary pt-4">
            <div className="grid grid-cols-3 bg-primary/20 rounded-lg">
              <div className="p-3 font-bold text-lg">Combined Net Income</div>
              <div className="p-3 font-bold text-lg">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalNet())}
              </div>
              <div className="p-3 font-bold text-lg">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalNet() / 12)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
