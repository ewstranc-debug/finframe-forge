import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, AlertCircle, Printer } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export const FinancialAnalysis = () => {
  const {
    personalPeriods,
    personalPeriodLabels,
    personalAssets,
    personalLiabilities,
    businessPeriods,
    affiliateEntities,
    debts,
    financialAnalysis,
    setFinancialAnalysis,
  } = useSpreadsheet();

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

  // Calculate comprehensive financial ratios
  const calculateFinancialRatios = () => {
    const totalAssets = Object.values(personalAssets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const totalLiabilities = (parseFloat(personalLiabilities.creditCards) || 0) + 
                            (parseFloat(personalLiabilities.mortgages) || 0) +
                            (parseFloat(personalLiabilities.vehicleLoans) || 0) +
                            (parseFloat(personalLiabilities.otherLiabilities) || 0) +
                            debts.reduce((sum, debt) => sum + (parseFloat(debt.balance) || 0), 0);
    const liquidAssets = parseFloat(personalAssets.liquidAssets) || 0;
    const netWorth = totalAssets - totalLiabilities;
    
    const latestPeriod = personalPeriods[2] || personalPeriods[1] || personalPeriods[0];
    const totalIncome = (parseFloat(latestPeriod?.salary) || 0) + (parseFloat(latestPeriod?.bonuses) || 0) + 
                       (parseFloat(latestPeriod?.schedCRevenue) || 0) + (parseFloat(latestPeriod?.investments) || 0);
    const totalExpenses = (parseFloat(latestPeriod?.costOfLiving) || 0) + (parseFloat(latestPeriod?.personalTaxes) || 0);
    const monthlyDebtPayment = (parseFloat(personalLiabilities.creditCardsMonthly) || 0) +
                               (parseFloat(personalLiabilities.mortgagesMonthly) || 0) +
                               (parseFloat(personalLiabilities.vehicleLoansMonthly) || 0) +
                               (parseFloat(personalLiabilities.otherLiabilitiesMonthly) || 0) +
                               debts.reduce((sum, debt) => sum + (parseFloat(debt.payment) || 0), 0);
    
    const monthlyIncome = totalIncome / 12;
    const debtToIncome = monthlyIncome > 0 ? (monthlyDebtPayment / monthlyIncome) * 100 : 0;
    const debtToAssets = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const liquidityRatio = totalLiabilities > 0 ? liquidAssets / totalLiabilities : 0;
    const currentRatio = totalLiabilities > 0 ? totalAssets / totalLiabilities : 0;
    const debtServiceCoverage = monthlyDebtPayment > 0 ? (monthlyIncome - (totalExpenses / 12)) / monthlyDebtPayment : 0;
    
    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      totalIncome,
      monthlyIncome,
      monthlyDebtPayment,
      debtToIncome,
      debtToAssets,
      savingsRate,
      liquidityRatio,
      currentRatio,
      debtServiceCoverage,
    };
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

      setFinancialAnalysis(data.analysis);
      toast.success("Financial analysis generated successfully");
    } catch (error) {
      console.error("Error generating analysis:", error);
      toast.error("Failed to generate analysis");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const ratios = calculateFinancialRatios();

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
          .print-chart {
            max-height: 300px;
            page-break-inside: avoid;
          }
          @page {
            margin: 0.75in;
            size: letter;
          }
        }
      `}</style>
      
      <div className="p-6 space-y-6 print-content">
        <div className="flex justify-between items-center mb-4 no-print">
          <h2 className="text-2xl font-bold">Financial Analysis & Insights</h2>
          <div className="flex gap-2">
            <Button 
              onClick={handlePrint}
              variant="outline"
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Report
            </Button>
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
        </div>

        <div className="print:block hidden">
          <h1 className="text-3xl font-bold mb-2">Financial Analysis Report</h1>
          <p className="text-muted-foreground mb-6">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Financial Ratios Summary */}
        <Card className="print-chart">
          <CardHeader>
            <CardTitle>Financial Ratios & Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Net Worth</p>
                <p className="text-2xl font-bold text-foreground">
                  ${ratios.netWorth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold text-foreground">
                  ${ratios.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Liabilities</p>
                <p className="text-2xl font-bold text-foreground">
                  ${ratios.totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Debt-to-Income Ratio</p>
                <p className={`text-2xl font-bold ${ratios.debtToIncome > 43 ? 'text-destructive' : ratios.debtToIncome > 36 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {ratios.debtToIncome.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Target: &lt;36%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Debt-to-Assets Ratio</p>
                <p className={`text-2xl font-bold ${ratios.debtToAssets > 50 ? 'text-destructive' : ratios.debtToAssets > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {ratios.debtToAssets.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Target: &lt;40%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Savings Rate</p>
                <p className={`text-2xl font-bold ${ratios.savingsRate < 10 ? 'text-destructive' : ratios.savingsRate < 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {ratios.savingsRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Target: &gt;20%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Liquidity Ratio</p>
                <p className={`text-2xl font-bold ${ratios.liquidityRatio < 0.5 ? 'text-destructive' : ratios.liquidityRatio < 1 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {ratios.liquidityRatio.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Target: &gt;1.0</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Ratio</p>
                <p className={`text-2xl font-bold ${ratios.currentRatio < 1 ? 'text-destructive' : ratios.currentRatio < 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {ratios.currentRatio.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Target: &gt;2.0</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">DSCR</p>
                <p className={`text-2xl font-bold ${ratios.debtServiceCoverage < 1.25 ? 'text-destructive' : ratios.debtServiceCoverage < 1.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {ratios.debtServiceCoverage.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Target: &gt;1.5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Overview */}
        <Card className="print-chart page-break">
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
      <Card className="print-chart page-break">
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
      <Card className="print-chart page-break">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 page-break">
        <Card className="print-chart">
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

        <Card className="print-chart">
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
      {financialAnalysis && (
        <Card className="border-primary/20 bg-card page-break">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              AI Financial Analysis & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-5 mb-3 text-foreground" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 text-foreground leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                  li: ({node, ...props}) => <li className="text-foreground" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-muted-foreground" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground" {...props} />,
                  code: ({node, ...props}) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
                }}
              >
                {financialAnalysis}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {!financialAnalysis && (
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
    </>
  );
};