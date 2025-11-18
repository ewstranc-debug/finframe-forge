import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCell } from "../EditableCell";

interface AssetData {
  liquidAssets: string;
  realEstate: string;
  vehicles: string;
  accountsReceivable: string;
  otherAssets: string;
}

interface LiabilityData {
  creditCards: string;
  creditCardsMonthly: string;
  mortgages: string;
  mortgagesMonthly: string;
  vehicleLoans: string;
  vehicleLoansMonthly: string;
  otherLiabilities: string;
  otherLiabilitiesMonthly: string;
}

export const PersonalFinancialStatement = () => {
  const [assets, setAssets] = useState<AssetData>({
    liquidAssets: "0",
    realEstate: "0",
    vehicles: "0",
    accountsReceivable: "0",
    otherAssets: "0"
  });

  const [liabilities, setLiabilities] = useState<LiabilityData>({
    creditCards: "0",
    creditCardsMonthly: "0",
    mortgages: "0",
    mortgagesMonthly: "0",
    vehicleLoans: "0",
    vehicleLoansMonthly: "0",
    otherLiabilities: "0",
    otherLiabilitiesMonthly: "0"
  });

  const updateAsset = (field: keyof AssetData, value: string) => {
    setAssets({ ...assets, [field]: value });
  };

  const updateLiability = (field: keyof LiabilityData, value: string) => {
    setLiabilities({ ...liabilities, [field]: value });
  };

  const calculateTotalAssets = () => {
    return Object.values(assets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  };

  const calculateTotalLiabilities = () => {
    return (parseFloat(liabilities.creditCards) || 0) + 
           (parseFloat(liabilities.mortgages) || 0) + 
           (parseFloat(liabilities.vehicleLoans) || 0) + 
           (parseFloat(liabilities.otherLiabilities) || 0);
  };

  const calculateTotalMonthlyDebt = () => {
    return (parseFloat(liabilities.creditCardsMonthly) || 0) + 
           (parseFloat(liabilities.mortgagesMonthly) || 0) + 
           (parseFloat(liabilities.vehicleLoansMonthly) || 0) + 
           (parseFloat(liabilities.otherLiabilitiesMonthly) || 0);
  };

  const calculateNetWorth = () => {
    return calculateTotalAssets() - calculateTotalLiabilities();
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
            <div className="grid grid-cols-2 bg-muted font-medium text-sm">
              <div className="p-3 border-r border-border">Asset Type</div>
              <div className="p-3">Value</div>
            </div>

            <div className="grid grid-cols-2 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Liquid Assets (Cash, Savings, Stocks)</div>
              <div>
                <EditableCell
                  value={assets.liquidAssets}
                  onChange={(val) => updateAsset("liquidAssets", val)}
                  type="currency"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Real Estate</div>
              <div>
                <EditableCell
                  value={assets.realEstate}
                  onChange={(val) => updateAsset("realEstate", val)}
                  type="currency"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Vehicles</div>
              <div>
                <EditableCell
                  value={assets.vehicles}
                  onChange={(val) => updateAsset("vehicles", val)}
                  type="currency"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Accounts Receivable</div>
              <div>
                <EditableCell
                  value={assets.accountsReceivable}
                  onChange={(val) => updateAsset("accountsReceivable", val)}
                  type="currency"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Other Assets</div>
              <div>
                <EditableCell
                  value={assets.otherAssets}
                  onChange={(val) => updateAsset("otherAssets", val)}
                  type="currency"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 bg-success/10">
              <div className="p-3 border-r border-border font-bold">Total Assets</div>
              <div className="p-3 font-bold text-success">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalAssets())}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
            <div className="grid grid-cols-3 bg-muted font-medium text-sm">
              <div className="p-3 border-r border-border">Liability Type</div>
              <div className="p-3 border-r border-border">Total Balance</div>
              <div className="p-3">Monthly Payment</div>
            </div>

            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Credit Cards</div>
              <div className="border-r border-border">
                <EditableCell
                  value={liabilities.creditCards}
                  onChange={(val) => updateLiability("creditCards", val)}
                  type="currency"
                />
              </div>
              <div>
                <EditableCell
                  value={liabilities.creditCardsMonthly}
                  onChange={(val) => updateLiability("creditCardsMonthly", val)}
                  type="currency"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Mortgages</div>
              <div className="border-r border-border">
                <EditableCell
                  value={liabilities.mortgages}
                  onChange={(val) => updateLiability("mortgages", val)}
                  type="currency"
                />
              </div>
              <div>
                <EditableCell
                  value={liabilities.mortgagesMonthly}
                  onChange={(val) => updateLiability("mortgagesMonthly", val)}
                  type="currency"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Vehicle Loans</div>
              <div className="border-r border-border">
                <EditableCell
                  value={liabilities.vehicleLoans}
                  onChange={(val) => updateLiability("vehicleLoans", val)}
                  type="currency"
                />
              </div>
              <div>
                <EditableCell
                  value={liabilities.vehicleLoansMonthly}
                  onChange={(val) => updateLiability("vehicleLoansMonthly", val)}
                  type="currency"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-3 border-r border-border bg-secondary/30 font-medium">Other Liabilities</div>
              <div className="border-r border-border">
                <EditableCell
                  value={liabilities.otherLiabilities}
                  onChange={(val) => updateLiability("otherLiabilities", val)}
                  type="currency"
                />
              </div>
              <div>
                <EditableCell
                  value={liabilities.otherLiabilitiesMonthly}
                  onChange={(val) => updateLiability("otherLiabilitiesMonthly", val)}
                  type="currency"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 bg-destructive/10">
              <div className="p-3 border-r border-border font-bold">Total Liabilities</div>
              <div className="p-3 border-r border-border font-bold text-destructive">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalLiabilities())}
              </div>
              <div className="p-3 font-bold text-destructive">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalMonthlyDebt())}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Net Worth Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span className="font-medium">Total Assets:</span>
              <span className="font-bold text-success">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalAssets())}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-medium">Total Liabilities:</span>
              <span className="font-bold text-destructive">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalLiabilities())}
              </span>
            </div>
            <div className="flex justify-between text-lg border-t pt-3">
              <span className="font-bold">Monthly Debt Service:</span>
              <span className="font-bold text-primary">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotalMonthlyDebt())}
              </span>
            </div>
            <div className="flex justify-between text-xl border-t-2 border-border pt-3">
              <span className="font-bold">Net Worth:</span>
              <span className={`font-bold ${calculateNetWorth() >= 0 ? 'text-success' : 'text-destructive'}`}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateNetWorth())}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
