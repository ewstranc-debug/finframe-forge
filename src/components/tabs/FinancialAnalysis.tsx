import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const FinancialAnalysis = () => {
  const {
    personalPeriods,
    personalPeriodLabels,
    personalAssets,
    personalLiabilities,
    businessPeriods,
    affiliateEntities,
    debts,
  } = useSpreadsheet();

  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate income trends
  const incomeData = personalPeriods.map((period, index) => {
    const w2Income = (parseFloat(period.salary) || 0) + (parseFloat(period.bonuses) || 0);
    const businessIncome = parseFloat(period.schedCRevenue) || 0;
    const totalIncome = w2Income + businessIncome + (parseFloat(period.investments) || 0) + (parseFloat(period.rentalIncome) || 0);
    
    return {
      name: personalPeriodLabels[index] || `Period ${index + 1}`,
      w2Income,
      businessIncome,
      totalIncome,
    };
  });

  // Calculate cash flow trends
  const cashFlowData = personalPeriods.map((period, index) => {
    const totalIncome = (parseFloat(period.salary) || 0) + (parseFloat(period.bonuses) || 0) + 
                       (parseFloat(period.schedCRevenue) || 0) + (parseFloat(period.investments) || 0);
    const totalExpenses = (parseFloat(period.costOfLiving) || 0) + (parseFloat(period.personalTaxes) || 0);
    
    return {
      name: personalPeriodLabels[index] || `Period ${index + 1}`,
      income: totalIncome,
      expenses: totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
    };
  });

  // Asset allocation pie chart data
  const assetAllocationData = [
    { name: "Liquid Assets", value: parseFloat(personalAssets.liquidAssets) || 0, color: "#10b981" },
    { name: "Real Estate", value: parseFloat(personalAssets.realEstate) || 0, color: "#3b82f6" },
    { name: "Vehicles", value: parseFloat(personalAssets.vehicles) || 0, color: "#f59e0b" },
    { name: "Other Assets", value: parseFloat(personalAssets.otherAssets) || 0, color: "#8b5cf6" },
  ].filter(item => item.value > 0);

  // Debt breakdown pie chart data
  const debtData = [
    { name: "Credit Cards", value: parseFloat(personalLiabilities.creditCards) || 0, color: "#ef4444" },
    { name: "Mortgages", value: parseFloat(personalLiabilities.mortgages) || 0, color: "#f97316" },
    { name: "Vehicle Loans", value: parseFloat(personalLiabilities.vehicleLoans) || 0, color: "#f59e0b" },
    { name: "Other Liabilities", value: parseFloat(personalLiabilities.otherLiabilities) || 0, color: "#dc2626" },
    ...debts.map((debt, i) => ({
      name: debt.creditor || `Debt ${i + 1}`,
      value: parseFloat(debt.balance) || 0,
      color: `hsl(${i * 40}, 70%, 50%)`,
    })),
  ].filter(item => item.value > 0);

  // Key metrics bar chart
  const calculateMetrics = () => {
    const totalAssets = Object.values(personalAssets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const totalLiabilities = (parseFloat(personalLiabilities.creditCards) || 0) + 
                            (parseFloat(personalLiabilities.mortgages) || 0) +
                            (parseFloat(personalLiabilities.vehicleLoans) || 0) +
                            (parseFloat(personalLiabilities.otherLiabilities) || 0);
    const netWorth = totalAssets - totalLiabilities;
    
    const latestPeriod = personalPeriods[2] || personalPeriods[1] || personalPeriods[0];
    const totalIncome = (parseFloat(latestPeriod?.salary) || 0) + (parseFloat(latestPeriod?.bonuses) || 0);
    const totalExpenses = (parseFloat(latestPeriod?.costOfLiving) || 0) + (parseFloat(latestPeriod?.personalTaxes) || 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const debtToAssets = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    
    return [
      { name: "Net Worth", value: netWorth, color: netWorth >= 0 ? "#10b981" : "#ef4444" },
      { name: "Savings Rate %", value: savingsRate, color: "#3b82f6" },
      { name: "Debt/Assets %", value: debtToAssets, color: debtToAssets > 50 ? "#ef4444" : "#f59e0b" },
    ];
  };

  const generateAnalysis = async () => {
    setIsLoading(true);
    
    try {
      // Prepare comprehensive financial data for analysis
      const financialData = {
        personalPeriods,
        personalPeriodLabels,
        personalAssets,
        personalLiabilities,
        businessPeriods,
        affiliateEntities,
        debts,
        summary: {
          totalAssets: Object.values(personalAssets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0),
          totalLiabilities: (parseFloat(personalLiabilities.creditCards) || 0) + 
                           (parseFloat(personalLiabilities.mortgages) || 0) +
                           (parseFloat(personalLiabilities.vehicleLoans) || 0) +
                           (parseFloat(personalLiabilities.otherLiabilities) || 0),
        },
      };

      const { data, error } = await supabase.functions.invoke('generate-financial-analysis', {
        body: { financialData },
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast.success("Financial analysis generated successfully");
    } catch (error) {
      console.error("Error generating analysis:", error);
      toast.error("Failed to generate analysis");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Financial Analysis & Insights</h2>
        <Button 
          onClick={generateAnalysis}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate AI Analysis"
          )}
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Financial Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={calculateMetrics()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {calculateMetrics().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Income Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Income Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="w2Income" stroke="#3b82f6" name="W2 Income" strokeWidth={2} />
              <Line type="monotone" dataKey="businessIncome" stroke="#10b981" name="Business Income" strokeWidth={2} />
              <Line type="monotone" dataKey="totalIncome" stroke="#f59e0b" name="Total Income" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cash Flow Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              <Bar dataKey="netCashFlow" fill="#3b82f6" name="Net Cash Flow" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Asset & Debt Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetAllocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: $${entry.value.toLocaleString()}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debt Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={debtData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: $${entry.value.toLocaleString()}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {debtData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI-Generated Analysis Narrative */}
      {analysis && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              AI Financial Analysis & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {analysis}
            </div>
          </CardContent>
        </Card>
      )}

      {!analysis && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Analysis Generated Yet</p>
              <p className="text-sm">Click "Generate AI Analysis" to get comprehensive insights and recommendations based on your financial data.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};