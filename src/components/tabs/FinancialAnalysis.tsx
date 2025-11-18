import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSpreadsheet } from "@/contexts/SpreadsheetContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, AlertCircle, Printer } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const FinancialAnalysis = () => {
  const {
    personalPeriods,
    personalPeriodLabels,
    personalAssets,
    personalLiabilities,
    businessPeriods,
    businessPeriodLabels,
    businessBalanceSheetPeriods,
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

  // Calculate comprehensive financial ratios for Personal, Business, and Global
  const calculateFinancialRatios = () => {
    // PERSONAL METRICS
    const totalPersonalAssets = Object.values(personalAssets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const totalPersonalLiabilities = (parseFloat(personalLiabilities.creditCards) || 0) + 
                            (parseFloat(personalLiabilities.mortgages) || 0) +
                            (parseFloat(personalLiabilities.vehicleLoans) || 0) +
                            (parseFloat(personalLiabilities.otherLiabilities) || 0) +
                            debts.reduce((sum, debt) => sum + (parseFloat(debt.balance) || 0), 0);
    const liquidAssets = parseFloat(personalAssets.liquidAssets) || 0;
    const personalNetWorth = totalPersonalAssets - totalPersonalLiabilities;
    
    const latestPersonalPeriod = personalPeriods[2] || personalPeriods[1] || personalPeriods[0];
    const personalIncome = (parseFloat(latestPersonalPeriod?.salary) || 0) + 
                          (parseFloat(latestPersonalPeriod?.bonuses) || 0) + 
                          (parseFloat(latestPersonalPeriod?.investments) || 0) +
                          (parseFloat(latestPersonalPeriod?.rentalIncome) || 0);
    const personalExpenses = (parseFloat(latestPersonalPeriod?.costOfLiving) || 0) + 
                            (parseFloat(latestPersonalPeriod?.personalTaxes) || 0);
    
    // Calculate total annual debt service
    const monthlyDebtPayment = (parseFloat(personalLiabilities.creditCardsMonthly) || 0) +
                               (parseFloat(personalLiabilities.mortgagesMonthly) || 0) +
                               (parseFloat(personalLiabilities.vehicleLoansMonthly) || 0) +
                               (parseFloat(personalLiabilities.otherLiabilitiesMonthly) || 0) +
                               debts.reduce((sum, debt) => sum + (parseFloat(debt.payment) || 0), 0);
    const annualDebtService = monthlyDebtPayment * 12;
    
    const monthlyPersonalIncome = personalIncome / 12;
    const personalDebtToIncome = monthlyPersonalIncome > 0 ? (monthlyDebtPayment / monthlyPersonalIncome) * 100 : 0;
    const personalDebtToAssets = totalPersonalAssets > 0 ? (totalPersonalLiabilities / totalPersonalAssets) * 100 : 0;
    const personalSavingsRate = personalIncome > 0 ? ((personalIncome - personalExpenses) / personalIncome) * 100 : 0;
    const personalLiquidityRatio = totalPersonalLiabilities > 0 ? liquidAssets / totalPersonalLiabilities : 0;
    const personalCurrentRatio = totalPersonalLiabilities > 0 ? totalPersonalAssets / totalPersonalLiabilities : 0;
    
    // BUSINESS METRICS - Calculate for each period
    // Period 0: Full Year 1 (oldest)
    const calcBusinessMetrics = (periodIndex: number) => {
      const period = businessPeriods[periodIndex];
      if (!period) return null;
      
      const revenue = parseFloat(period.revenue) || 0;
      const cogs = parseFloat(period.cogs) || 0;
      const opEx = parseFloat(period.operatingExpenses) || 0;
      const rentExpense = parseFloat(period.rentExpense) || 0;
      const officersComp = parseFloat(period.officersComp) || 0;
      const depreciation = parseFloat(period.depreciation) || 0;
      const amortization = parseFloat(period.amortization) || 0;
      const interest = parseFloat(period.interest) || 0;
      const taxes = parseFloat(period.taxes) || 0;
      const otherIncome = parseFloat(period.otherIncome) || 0;
      const otherExpenses = parseFloat(period.otherExpenses) || 0;
      const addbacks = parseFloat(period.addbacks) || 0;
      
      const grossProfit = revenue - cogs;
      const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
      
      // EBITDA = Revenue + Other Income - COGS - OpEx - Rent - Officers Comp - Other Expenses
      const ebitda = (revenue + otherIncome) - cogs - opEx - rentExpense - officersComp - otherExpenses + addbacks;
      const ebit = ebitda - depreciation - amortization;
      const netIncome = ebit - interest - taxes;
      const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;
      
      // DSCR = EBITDA / Annual Debt Service
      const dscr = annualDebtService > 0 ? ebitda / annualDebtService : 0;
      
      return {
        revenue,
        cogs,
        grossProfit,
        grossMargin,
        ebitda,
        netIncome,
        netMargin,
        dscr,
        opEx,
        rentExpense,
        officersComp,
        depreciation,
        amortization,
        interest,
        taxes,
        otherIncome,
        otherExpenses,
        addbacks,
      };
    };
    
    const fullYearMetrics = calcBusinessMetrics(1) || calcBusinessMetrics(0); // Most recent full year
    const interimMetrics = calcBusinessMetrics(2); // Interim period
    
    // Use latest business period for overall business metrics
    const latestBusinessPeriod = businessPeriods[2] || businessPeriods[1] || businessPeriods[0];
    const businessRevenue = parseFloat(latestBusinessPeriod?.revenue) || 0;
    const businessCOGS = parseFloat(latestBusinessPeriod?.cogs) || 0;
    const businessOpEx = parseFloat(latestBusinessPeriod?.operatingExpenses) || 0;
    const businessRentExpense = parseFloat(latestBusinessPeriod?.rentExpense) || 0;
    const businessOfficersComp = parseFloat(latestBusinessPeriod?.officersComp) || 0;
    const businessInterest = parseFloat(latestBusinessPeriod?.interest) || 0;
    const businessDepreciation = parseFloat(latestBusinessPeriod?.depreciation) || 0;
    const businessAmortization = parseFloat(latestBusinessPeriod?.amortization) || 0;
    const businessTaxes = parseFloat(latestBusinessPeriod?.taxes) || 0;
    const businessOtherIncome = parseFloat(latestBusinessPeriod?.otherIncome) || 0;
    const businessOtherExpenses = parseFloat(latestBusinessPeriod?.otherExpenses) || 0;
    const businessAddbacks = parseFloat(latestBusinessPeriod?.addbacks) || 0;
    
    const businessGrossProfit = businessRevenue - businessCOGS;
    const businessGrossMargin = businessRevenue > 0 ? (businessGrossProfit / businessRevenue) * 100 : 0;
    const businessEBITDA = (businessRevenue + businessOtherIncome) - businessCOGS - businessOpEx - businessRentExpense - businessOfficersComp - businessOtherExpenses + businessAddbacks;
    const businessEBIT = businessEBITDA - businessDepreciation - businessAmortization;
    const businessNetIncome = businessEBIT - businessInterest - businessTaxes;
    const businessNetMargin = businessRevenue > 0 ? (businessNetIncome / businessRevenue) * 100 : 0;
    
    const latestBalanceSheet = businessBalanceSheetPeriods[2] || businessBalanceSheetPeriods[1] || businessBalanceSheetPeriods[0];
    const businessCash = parseFloat(latestBalanceSheet?.cash) || 0;
    const businessAR = parseFloat(latestBalanceSheet?.accountsReceivable) || 0;
    const businessInventory = parseFloat(latestBalanceSheet?.inventory) || 0;
    const businessCurrentAssets = businessCash + businessAR + businessInventory + (parseFloat(latestBalanceSheet?.otherCurrentAssets) || 0);
    const businessRealEstate = parseFloat(latestBalanceSheet?.realEstate) || 0;
    const businessAccumDepr = parseFloat(latestBalanceSheet?.accumulatedDepreciation) || 0;
    const businessTotalAssets = businessCurrentAssets + businessRealEstate - businessAccumDepr;
    const businessCurrentLiabilities = parseFloat(latestBalanceSheet?.currentLiabilities) || 0;
    const businessLongTermDebt = parseFloat(latestBalanceSheet?.longTermDebt) || 0;
    const businessTotalLiabilities = businessCurrentLiabilities + businessLongTermDebt;
    const businessEquity = businessTotalAssets - businessTotalLiabilities;
    
    const businessCurrentRatio = businessCurrentLiabilities > 0 ? businessCurrentAssets / businessCurrentLiabilities : 0;
    const businessQuickRatio = businessCurrentLiabilities > 0 ? (businessCurrentAssets - businessInventory) / businessCurrentLiabilities : 0;
    const businessDebtToEquity = businessEquity > 0 ? businessTotalLiabilities / businessEquity : 0;
    const businessDebtToAssets = businessTotalAssets > 0 ? (businessTotalLiabilities / businessTotalAssets) * 100 : 0;
    const businessROA = businessTotalAssets > 0 ? (businessNetIncome / businessTotalAssets) * 100 : 0;
    const businessROE = businessEquity > 0 ? (businessNetIncome / businessEquity) * 100 : 0;
    const businessAssetTurnover = businessTotalAssets > 0 ? businessRevenue / businessTotalAssets : 0;
    const businessWorkingCapital = businessCurrentAssets - businessCurrentLiabilities;
    
    // GLOBAL/CONSOLIDATED METRICS
    const globalTotalAssets = totalPersonalAssets + businessTotalAssets;
    const globalTotalLiabilities = totalPersonalLiabilities + businessTotalLiabilities;
    const globalNetWorth = globalTotalAssets - globalTotalLiabilities;
    const globalTotalIncome = personalIncome + businessNetIncome;
    const globalTotalExpenses = personalExpenses;
    const globalDebtToAssets = globalTotalAssets > 0 ? (globalTotalLiabilities / globalTotalAssets) * 100 : 0;
    const globalLiquidityRatio = globalTotalLiabilities > 0 ? (liquidAssets + businessCash) / globalTotalLiabilities : 0;
    const globalCurrentRatio = globalTotalLiabilities > 0 ? globalTotalAssets / globalTotalLiabilities : 0;
    const globalSavingsRate = globalTotalIncome > 0 ? ((globalTotalIncome - globalTotalExpenses) / globalTotalIncome) * 100 : 0;
    
    // Global DSCR using combined EBITDA
    const globalDSCR = annualDebtService > 0 ? businessEBITDA / annualDebtService : 0;
    
    return {
      personal: {
        netWorth: personalNetWorth,
        totalAssets: totalPersonalAssets,
        totalLiabilities: totalPersonalLiabilities,
        liquidAssets,
        totalIncome: personalIncome,
        totalExpenses: personalExpenses,
        monthlyIncome: monthlyPersonalIncome,
        monthlyDebtPayment,
        annualDebtService,
        debtToIncome: personalDebtToIncome,
        debtToAssets: personalDebtToAssets,
        savingsRate: personalSavingsRate,
        liquidityRatio: personalLiquidityRatio,
        currentRatio: personalCurrentRatio,
      },
      business: {
        revenue: businessRevenue,
        cogs: businessCOGS,
        grossProfit: businessGrossProfit,
        grossMargin: businessGrossMargin,
        ebitda: businessEBITDA,
        netIncome: businessNetIncome,
        netMargin: businessNetMargin,
        totalAssets: businessTotalAssets,
        currentAssets: businessCurrentAssets,
        totalLiabilities: businessTotalLiabilities,
        currentLiabilities: businessCurrentLiabilities,
        equity: businessEquity,
        workingCapital: businessWorkingCapital,
        currentRatio: businessCurrentRatio,
        quickRatio: businessQuickRatio,
        debtToEquity: businessDebtToEquity,
        debtToAssets: businessDebtToAssets,
        roa: businessROA,
        roe: businessROE,
        assetTurnover: businessAssetTurnover,
        // Detailed business components for tooltips
        opEx: businessOpEx,
        rentExpense: businessRentExpense,
        officersComp: businessOfficersComp,
        depreciation: businessDepreciation,
        amortization: businessAmortization,
        interest: businessInterest,
        taxes: businessTaxes,
        otherIncome: businessOtherIncome,
        otherExpenses: businessOtherExpenses,
        addbacks: businessAddbacks,
      },
      dscr: {
        fullYear: fullYearMetrics,
        interim: interimMetrics,
        annualDebtService,
      },
      global: {
        totalAssets: globalTotalAssets,
        totalLiabilities: globalTotalLiabilities,
        netWorth: globalNetWorth,
        totalIncome: globalTotalIncome,
        totalExpenses: globalTotalExpenses,
        debtToAssets: globalDebtToAssets,
        liquidityRatio: globalLiquidityRatio,
        currentRatio: globalCurrentRatio,
        savingsRate: globalSavingsRate,
        dscr: globalDSCR,
      }
    };
  };

  const generateAnalysis = async () => {
    setIsLoading(true);
    
    try {
      // Calculate comprehensive metrics for analysis
      const totalPersonalAssets = Object.values(personalAssets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      const totalPersonalLiabilities = (parseFloat(personalLiabilities.creditCards) || 0) + 
                                       (parseFloat(personalLiabilities.mortgages) || 0) +
                                       (parseFloat(personalLiabilities.vehicleLoans) || 0) +
                                       (parseFloat(personalLiabilities.otherLiabilities) || 0) +
                                       debts.reduce((sum, debt) => sum + (parseFloat(debt.balance) || 0), 0);
      
      // Calculate business metrics
      const latestBusinessPeriod = businessPeriods[2] || businessPeriods[1] || businessPeriods[0];
      const businessRevenue = parseFloat(latestBusinessPeriod?.revenue) || 0;
      const businessCOGS = parseFloat(latestBusinessPeriod?.cogs) || 0;
      const businessOpEx = parseFloat(latestBusinessPeriod?.operatingExpenses) || 0;
      const businessNetIncome = businessRevenue - businessCOGS - businessOpEx;
      
      // Calculate business balance sheet metrics
      const latestBalanceSheet = businessBalanceSheetPeriods[2] || businessBalanceSheetPeriods[1] || businessBalanceSheetPeriods[0];
      const businessCurrentAssets = (parseFloat(latestBalanceSheet?.cash) || 0) + 
                                   (parseFloat(latestBalanceSheet?.accountsReceivable) || 0) +
                                   (parseFloat(latestBalanceSheet?.inventory) || 0);
      const businessTotalAssets = businessCurrentAssets + 
                                 (parseFloat(latestBalanceSheet?.realEstate) || 0) -
                                 (parseFloat(latestBalanceSheet?.accumulatedDepreciation) || 0);
      const businessCurrentLiabilities = parseFloat(latestBalanceSheet?.currentLiabilities) || 0;
      const businessTotalLiabilities = businessCurrentLiabilities + (parseFloat(latestBalanceSheet?.longTermDebt) || 0);
      
      // Prepare comprehensive financial data for analysis
      const financialData = {
        personalPeriods,
        personalPeriodLabels,
        personalAssets,
        personalLiabilities,
        businessPeriods,
        businessPeriodLabels,
        businessBalanceSheetPeriods,
        affiliateEntities,
        debts,
        calculatedMetrics: {
          personal: {
            totalAssets: totalPersonalAssets,
            totalLiabilities: totalPersonalLiabilities,
            netWorth: totalPersonalAssets - totalPersonalLiabilities,
            liquidAssets: parseFloat(personalAssets.liquidAssets) || 0,
            debtToAssets: totalPersonalAssets > 0 ? (totalPersonalLiabilities / totalPersonalAssets) * 100 : 0,
            liquidityRatio: totalPersonalLiabilities > 0 ? (parseFloat(personalAssets.liquidAssets) || 0) / totalPersonalLiabilities : 0,
          },
          business: {
            revenue: businessRevenue,
            grossProfit: businessRevenue - businessCOGS,
            grossMargin: businessRevenue > 0 ? ((businessRevenue - businessCOGS) / businessRevenue) * 100 : 0,
            netIncome: businessNetIncome,
            netMargin: businessRevenue > 0 ? (businessNetIncome / businessRevenue) * 100 : 0,
            totalAssets: businessTotalAssets,
            totalLiabilities: businessTotalLiabilities,
            currentRatio: businessCurrentLiabilities > 0 ? businessCurrentAssets / businessCurrentLiabilities : 0,
            debtToEquity: (businessTotalAssets - businessTotalLiabilities) > 0 ? 
                         businessTotalLiabilities / (businessTotalAssets - businessTotalLiabilities) : 0,
          },
          combined: {
            totalAssets: totalPersonalAssets + businessTotalAssets,
            totalLiabilities: totalPersonalLiabilities + businessTotalLiabilities,
            totalNetWorth: (totalPersonalAssets + businessTotalAssets) - (totalPersonalLiabilities + businessTotalLiabilities),
          }
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

        {/* Financial Ratios Summary - Personal, Business, Global */}
        <Card className="print-chart">
          <CardHeader>
            <CardTitle>Financial Ratios & Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              {/* PERSONAL METRICS */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-primary">Personal Financial Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Personal Net Worth</p>
                        <p className="text-xl font-bold text-foreground">
                          ${ratios.personal.netWorth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Calculation:</p>
                        <p>Personal Assets: ${ratios.personal.totalAssets.toLocaleString()}</p>
                        <p>Personal Liabilities: ${ratios.personal.totalLiabilities.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Net Worth = Assets - Liabilities</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Annual Income</p>
                        <p className="text-xl font-bold text-foreground">
                          ${ratios.personal.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total personal income from salary, bonuses, investments, and rental income</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Liquid Assets</p>
                        <p className="text-xl font-bold text-foreground">
                          ${ratios.personal.liquidAssets.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cash and easily convertible assets available for immediate use</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Debt-to-Income</p>
                        <p className={`text-xl font-bold ${ratios.personal.debtToIncome > 43 ? 'text-destructive' : ratios.personal.debtToIncome > 36 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.personal.debtToIncome.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &lt;36%</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Personal DTI Calculation:</p>
                        <p>Monthly Debt: ${ratios.personal.monthlyDebtPayment.toLocaleString()}</p>
                        <p>Monthly Income: ${ratios.personal.monthlyIncome.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">DTI = (Monthly Debt / Monthly Income) × 100</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Debt-to-Assets</p>
                        <p className={`text-xl font-bold ${ratios.personal.debtToAssets > 50 ? 'text-destructive' : ratios.personal.debtToAssets > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.personal.debtToAssets.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &lt;40%</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Personal DTA Calculation:</p>
                        <p>Total Liabilities: ${ratios.personal.totalLiabilities.toLocaleString()}</p>
                        <p>Total Assets: ${ratios.personal.totalAssets.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">DTA = (Liabilities / Assets) × 100</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Savings Rate</p>
                        <p className={`text-xl font-bold ${ratios.personal.savingsRate < 10 ? 'text-destructive' : ratios.personal.savingsRate < 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.personal.savingsRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &gt;20%</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Personal Savings Rate:</p>
                        <p>Annual Income: ${ratios.personal.totalIncome.toLocaleString()}</p>
                        <p>Annual Expenses: ${ratios.personal.totalExpenses.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Savings = ((Income - Expenses) / Income) × 100</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Liquidity Ratio</p>
                        <p className={`text-xl font-bold ${ratios.personal.liquidityRatio < 0.5 ? 'text-destructive' : ratios.personal.liquidityRatio < 1 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.personal.liquidityRatio.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &gt;1.0</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Personal Liquidity:</p>
                        <p>Liquid Assets: ${ratios.personal.liquidAssets.toLocaleString()}</p>
                        <p>Total Liabilities: ${ratios.personal.totalLiabilities.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Liquidity = Liquid Assets / Total Liabilities</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Current Ratio</p>
                        <p className={`text-xl font-bold ${ratios.personal.currentRatio < 1 ? 'text-destructive' : ratios.personal.currentRatio < 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.personal.currentRatio.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &gt;2.0</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Personal Current Ratio:</p>
                        <p>Total Assets: ${ratios.personal.totalAssets.toLocaleString()}</p>
                        <p>Total Liabilities: ${ratios.personal.totalLiabilities.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Current Ratio = Assets / Liabilities</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* BUSINESS METRICS */}
              <div className="mb-8 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4 text-primary">Business Financial Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* FULL YEAR DSCR - PROMINENT */}
                  {ratios.dscr.fullYear && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-1 cursor-help col-span-2 md:col-span-2 bg-primary/5 p-3 rounded-lg border-2 border-primary/20">
                          <p className="text-sm text-muted-foreground font-semibold">DSCR - Full Year</p>
                          <p className={`text-2xl font-bold ${ratios.dscr.fullYear.dscr < 1.25 ? 'text-destructive' : ratios.dscr.fullYear.dscr < 1.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {ratios.dscr.fullYear.dscr.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">Target: &gt;1.5 | {businessPeriodLabels[1] || businessPeriodLabels[0]}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2">
                          <p className="font-semibold">Full Year DSCR Calculation:</p>
                          <div className="space-y-1 text-sm">
                            <p className="font-medium">EBITDA Components:</p>
                            <p>Revenue: ${ratios.dscr.fullYear.revenue.toLocaleString()}</p>
                            <p>+ Other Income: ${ratios.dscr.fullYear.otherIncome.toLocaleString()}</p>
                            <p>- COGS: ${ratios.dscr.fullYear.cogs.toLocaleString()}</p>
                            <p>- Operating Expenses: ${ratios.dscr.fullYear.opEx.toLocaleString()}</p>
                            <p>- Rent: ${ratios.dscr.fullYear.rentExpense.toLocaleString()}</p>
                            <p>- Officers Comp: ${ratios.dscr.fullYear.officersComp.toLocaleString()}</p>
                            <p>- Other Expenses: ${ratios.dscr.fullYear.otherExpenses.toLocaleString()}</p>
                            <p>+ Addbacks: ${ratios.dscr.fullYear.addbacks.toLocaleString()}</p>
                            <p className="font-semibold border-t pt-1 mt-1">= EBITDA: ${ratios.dscr.fullYear.ebitda.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1 text-sm border-t pt-2">
                            <p className="font-medium">Annual Debt Service: ${ratios.dscr.annualDebtService.toLocaleString()}</p>
                          </div>
                          <p className="font-semibold border-t pt-2 mt-2">DSCR = EBITDA / Annual Debt Service = {ratios.dscr.fullYear.dscr.toFixed(2)}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* INTERIM DSCR - PROMINENT */}
                  {ratios.dscr.interim && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-1 cursor-help col-span-2 md:col-span-2 bg-primary/5 p-3 rounded-lg border-2 border-primary/20">
                          <p className="text-sm text-muted-foreground font-semibold">DSCR - Interim</p>
                          <p className={`text-2xl font-bold ${ratios.dscr.interim.dscr < 1.25 ? 'text-destructive' : ratios.dscr.interim.dscr < 1.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {ratios.dscr.interim.dscr.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">Target: &gt;1.5 | {businessPeriodLabels[2]}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2">
                          <p className="font-semibold">Interim DSCR Calculation:</p>
                          <div className="space-y-1 text-sm">
                            <p className="font-medium">EBITDA Components:</p>
                            <p>Revenue: ${ratios.dscr.interim.revenue.toLocaleString()}</p>
                            <p>+ Other Income: ${ratios.dscr.interim.otherIncome.toLocaleString()}</p>
                            <p>- COGS: ${ratios.dscr.interim.cogs.toLocaleString()}</p>
                            <p>- Operating Expenses: ${ratios.dscr.interim.opEx.toLocaleString()}</p>
                            <p>- Rent: ${ratios.dscr.interim.rentExpense.toLocaleString()}</p>
                            <p>- Officers Comp: ${ratios.dscr.interim.officersComp.toLocaleString()}</p>
                            <p>- Other Expenses: ${ratios.dscr.interim.otherExpenses.toLocaleString()}</p>
                            <p>+ Addbacks: ${ratios.dscr.interim.addbacks.toLocaleString()}</p>
                            <p className="font-semibold border-t pt-1 mt-1">= EBITDA: ${ratios.dscr.interim.ebitda.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1 text-sm border-t pt-2">
                            <p className="font-medium">Annual Debt Service: ${ratios.dscr.annualDebtService.toLocaleString()}</p>
                          </div>
                          <p className="font-semibold border-t pt-2 mt-2">DSCR = EBITDA / Annual Debt Service = {ratios.dscr.interim.dscr.toFixed(2)}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="text-xl font-bold text-foreground">
                          ${ratios.business.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total business revenue for the latest period</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Gross Profit</p>
                        <p className="text-xl font-bold text-foreground">
                          ${ratios.business.grossProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Calculation:</p>
                        <p>Revenue: ${ratios.business.revenue.toLocaleString()}</p>
                        <p>COGS: ${ratios.business.cogs.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Gross Profit = Revenue - COGS</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Net Income</p>
                        <p className={`text-xl font-bold ${ratios.business.netIncome < 0 ? 'text-destructive' : 'text-green-600'}`}>
                          ${ratios.business.netIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Net income after all expenses, interest, and taxes</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">EBITDA</p>
                        <p className="text-xl font-bold text-foreground">
                          ${ratios.business.ebitda.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Earnings before interest, taxes, depreciation, and amortization</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Gross Margin</p>
                        <p className={`text-xl font-bold ${ratios.business.grossMargin < 20 ? 'text-destructive' : ratios.business.grossMargin < 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.business.grossMargin.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &gt;40%</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Gross Margin:</p>
                        <p>Gross Profit: ${ratios.business.grossProfit.toLocaleString()}</p>
                        <p>Revenue: ${ratios.business.revenue.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Gross Margin = (Gross Profit / Revenue) × 100</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Net Margin</p>
                        <p className={`text-xl font-bold ${ratios.business.netMargin < 5 ? 'text-destructive' : ratios.business.netMargin < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.business.netMargin.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &gt;10%</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Net Profit Margin:</p>
                        <p>Net Income: ${ratios.business.netIncome.toLocaleString()}</p>
                        <p>Revenue: ${ratios.business.revenue.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Net Margin = (Net Income / Revenue) × 100</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Current Ratio</p>
                        <p className={`text-xl font-bold ${ratios.business.currentRatio < 1 ? 'text-destructive' : ratios.business.currentRatio < 1.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.business.currentRatio.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &gt;1.5</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Business Current Ratio:</p>
                        <p>Current Assets: ${ratios.business.currentAssets.toLocaleString()}</p>
                        <p>Current Liabilities: ${ratios.business.currentLiabilities.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Current Ratio = Current Assets / Current Liabilities</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Quick Ratio</p>
                        <p className={`text-xl font-bold ${ratios.business.quickRatio < 0.5 ? 'text-destructive' : ratios.business.quickRatio < 1 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.business.quickRatio.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &gt;1.0</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Quick Ratio (Acid Test):</p>
                        <p>Current Assets (ex. inventory): ${(ratios.business.currentAssets - ((ratios.business.currentAssets * 0.3) || 0)).toLocaleString()}</p>
                        <p>Current Liabilities: ${ratios.business.currentLiabilities.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Quick Ratio = (Current Assets - Inventory) / Current Liabilities</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Debt-to-Equity</p>
                        <p className={`text-xl font-bold ${ratios.business.debtToEquity > 2 ? 'text-destructive' : ratios.business.debtToEquity > 1 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.business.debtToEquity.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &lt;1.0</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Debt-to-Equity Ratio:</p>
                        <p>Total Debt: ${ratios.business.totalLiabilities.toLocaleString()}</p>
                        <p>Equity: ${ratios.business.equity.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">D/E = Total Debt / Equity</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">ROA</p>
                        <p className={`text-xl font-bold ${ratios.business.roa < 5 ? 'text-destructive' : ratios.business.roa < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.business.roa.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &gt;10%</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Return on Assets:</p>
                        <p>Net Income: ${ratios.business.netIncome.toLocaleString()}</p>
                        <p>Total Assets: ${ratios.business.totalAssets.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">ROA = (Net Income / Total Assets) × 100</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">ROE</p>
                        <p className={`text-xl font-bold ${ratios.business.roe < 10 ? 'text-destructive' : ratios.business.roe < 15 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.business.roe.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &gt;15%</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Return on Equity:</p>
                        <p>Net Income: ${ratios.business.netIncome.toLocaleString()}</p>
                        <p>Equity: ${ratios.business.equity.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">ROE = (Net Income / Equity) × 100</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Asset Turnover</p>
                        <p className="text-xl font-bold text-foreground">
                          {ratios.business.assetTurnover.toFixed(2)}x
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Asset Turnover Ratio:</p>
                        <p>Revenue: ${ratios.business.revenue.toLocaleString()}</p>
                        <p>Total Assets: ${ratios.business.totalAssets.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Asset Turnover = Revenue / Total Assets</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Working Capital</p>
                        <p className={`text-xl font-bold ${ratios.business.workingCapital < 0 ? 'text-destructive' : 'text-green-600'}`}>
                          ${ratios.business.workingCapital.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Working Capital:</p>
                        <p>Current Assets: ${ratios.business.currentAssets.toLocaleString()}</p>
                        <p>Current Liabilities: ${ratios.business.currentLiabilities.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Working Capital = Current Assets - Current Liabilities</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Business Equity</p>
                        <p className="text-xl font-bold text-foreground">
                          ${ratios.business.equity.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Owner's Equity:</p>
                        <p>Total Assets: ${ratios.business.totalAssets.toLocaleString()}</p>
                        <p>Total Liabilities: ${ratios.business.totalLiabilities.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Equity = Assets - Liabilities</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Debt-to-Assets</p>
                        <p className={`text-xl font-bold ${ratios.business.debtToAssets > 60 ? 'text-destructive' : ratios.business.debtToAssets > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.business.debtToAssets.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &lt;40%</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Business Debt-to-Assets:</p>
                        <p>Total Debt: ${ratios.business.totalLiabilities.toLocaleString()}</p>
                        <p>Total Assets: ${ratios.business.totalAssets.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Debt/Assets = (Total Debt / Total Assets) × 100</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* GLOBAL/CONSOLIDATED METRICS */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4 text-primary">Global / Consolidated Position</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Total Net Worth</p>
                        <p className="text-xl font-bold text-foreground">
                          ${ratios.global.netWorth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Consolidated Net Worth:</p>
                        <p>Total Assets: ${ratios.global.totalAssets.toLocaleString()}</p>
                        <p>Total Liabilities: ${ratios.global.totalLiabilities.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Net Worth = All Assets - All Liabilities</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Total Assets</p>
                        <p className="text-xl font-bold text-foreground">
                          ${ratios.global.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Combined Assets:</p>
                        <p>Personal Assets: ${ratios.personal.totalAssets.toLocaleString()}</p>
                        <p>Business Assets: ${ratios.business.totalAssets.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Total = Personal + Business Assets</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Total Liabilities</p>
                        <p className="text-xl font-bold text-foreground">
                          ${ratios.global.totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Combined Liabilities:</p>
                        <p>Personal Liabilities: ${ratios.personal.totalLiabilities.toLocaleString()}</p>
                        <p>Business Liabilities: ${ratios.business.totalLiabilities.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Total = Personal + Business Liabilities</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Total Income</p>
                        <p className="text-xl font-bold text-foreground">
                          ${ratios.global.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Combined Income:</p>
                        <p>Personal Income: ${ratios.personal.totalIncome.toLocaleString()}</p>
                        <p>Business Net Income: ${ratios.business.netIncome.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Total = Personal + Business Net Income</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Global Debt-to-Assets</p>
                        <p className={`text-xl font-bold ${ratios.global.debtToAssets > 50 ? 'text-destructive' : ratios.global.debtToAssets > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.global.debtToAssets.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &lt;40%</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Global Leverage:</p>
                        <p>Total Liabilities: ${ratios.global.totalLiabilities.toLocaleString()}</p>
                        <p>Total Assets: ${ratios.global.totalAssets.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Global DTA = (Total Liabilities / Total Assets) × 100</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Global Liquidity</p>
                        <p className={`text-xl font-bold ${ratios.global.liquidityRatio < 0.5 ? 'text-destructive' : ratios.global.liquidityRatio < 1 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.global.liquidityRatio.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &gt;1.0</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Combined Liquidity:</p>
                        <p>Liquid Assets (Personal + Business Cash)</p>
                        <p>Total Liabilities: ${ratios.global.totalLiabilities.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Liquidity = Liquid Assets / Total Liabilities</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Global Current Ratio</p>
                        <p className={`text-xl font-bold ${ratios.global.currentRatio < 1 ? 'text-destructive' : ratios.global.currentRatio < 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.global.currentRatio.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &gt;2.0</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Global Current Ratio:</p>
                        <p>Total Assets: ${ratios.global.totalAssets.toLocaleString()}</p>
                        <p>Total Liabilities: ${ratios.global.totalLiabilities.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">Current Ratio = Total Assets / Total Liabilities</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <p className="text-sm text-muted-foreground">Global DSCR</p>
                        <p className={`text-xl font-bold ${ratios.global.dscr < 1.25 ? 'text-destructive' : ratios.global.dscr < 1.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ratios.global.dscr.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &gt;1.5</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Debt Service Coverage Ratio:</p>
                        <p>Combined EBITDA: ${ratios.business.ebitda.toLocaleString()}</p>
                        <p>Annual Debt Service: ${ratios.personal.annualDebtService.toLocaleString()}</p>
                        <p className="border-t pt-1 mt-1">DSCR = EBITDA / Annual Debt Payments</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              {/* DSCR ANALYSIS - Full Year vs Interim */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4 text-primary">Debt Service Coverage Ratio (DSCR) Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ratios.dscr.fullYear && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-1 cursor-help p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Full Year DSCR</p>
                          <p className={`text-2xl font-bold ${ratios.dscr.fullYear.dscr < 1.25 ? 'text-destructive' : ratios.dscr.fullYear.dscr < 1.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {ratios.dscr.fullYear.dscr.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">Target: &gt;1.5 | Period: {businessPeriodLabels[1] || businessPeriodLabels[0]}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2">
                          <p className="font-semibold">Full Year DSCR Calculation:</p>
                          <div className="space-y-1 text-sm">
                            <p className="font-medium">EBITDA Components:</p>
                            <p>Revenue: ${ratios.dscr.fullYear.revenue.toLocaleString()}</p>
                            <p>+ Other Income: ${ratios.dscr.fullYear.otherIncome.toLocaleString()}</p>
                            <p>- COGS: ${ratios.dscr.fullYear.cogs.toLocaleString()}</p>
                            <p>- Operating Expenses: ${ratios.dscr.fullYear.opEx.toLocaleString()}</p>
                            <p>- Rent: ${ratios.dscr.fullYear.rentExpense.toLocaleString()}</p>
                            <p>- Officers Comp: ${ratios.dscr.fullYear.officersComp.toLocaleString()}</p>
                            <p>- Other Expenses: ${ratios.dscr.fullYear.otherExpenses.toLocaleString()}</p>
                            <p>+ Addbacks: ${ratios.dscr.fullYear.addbacks.toLocaleString()}</p>
                            <p className="font-semibold border-t pt-1 mt-1">= EBITDA: ${ratios.dscr.fullYear.ebitda.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1 text-sm border-t pt-2">
                            <p className="font-medium">Annual Debt Service:</p>
                            <p>Monthly Debt: ${ratios.personal.monthlyDebtPayment.toLocaleString()}</p>
                            <p className="font-semibold">Annual Total: ${ratios.dscr.annualDebtService.toLocaleString()}</p>
                          </div>
                          <p className="font-semibold border-t pt-2 mt-2">DSCR = EBITDA / Annual Debt Service = {ratios.dscr.fullYear.dscr.toFixed(2)}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  
                  {ratios.dscr.interim && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-1 cursor-help p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Interim Period DSCR</p>
                          <p className={`text-2xl font-bold ${ratios.dscr.interim.dscr < 1.25 ? 'text-destructive' : ratios.dscr.interim.dscr < 1.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {ratios.dscr.interim.dscr.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">Target: &gt;1.5 | Period: {businessPeriodLabels[2]}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2">
                          <p className="font-semibold">Interim DSCR Calculation:</p>
                          <div className="space-y-1 text-sm">
                            <p className="font-medium">EBITDA Components:</p>
                            <p>Revenue: ${ratios.dscr.interim.revenue.toLocaleString()}</p>
                            <p>+ Other Income: ${ratios.dscr.interim.otherIncome.toLocaleString()}</p>
                            <p>- COGS: ${ratios.dscr.interim.cogs.toLocaleString()}</p>
                            <p>- Operating Expenses: ${ratios.dscr.interim.opEx.toLocaleString()}</p>
                            <p>- Rent: ${ratios.dscr.interim.rentExpense.toLocaleString()}</p>
                            <p>- Officers Comp: ${ratios.dscr.interim.officersComp.toLocaleString()}</p>
                            <p>- Other Expenses: ${ratios.dscr.interim.otherExpenses.toLocaleString()}</p>
                            <p>+ Addbacks: ${ratios.dscr.interim.addbacks.toLocaleString()}</p>
                            <p className="font-semibold border-t pt-1 mt-1">= EBITDA: ${ratios.dscr.interim.ebitda.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1 text-sm border-t pt-2">
                            <p className="font-medium">Annual Debt Service:</p>
                            <p>Monthly Debt: ${ratios.personal.monthlyDebtPayment.toLocaleString()}</p>
                            <p className="font-semibold">Annual Total: ${ratios.dscr.annualDebtService.toLocaleString()}</p>
                          </div>
                          <p className="font-semibold border-t pt-2 mt-2">DSCR = EBITDA / Annual Debt Service = {ratios.dscr.interim.dscr.toFixed(2)}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </TooltipProvider>
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
              <RechartsTooltip />
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
              <RechartsTooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
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
              <RechartsTooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
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
                <RechartsTooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
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
                <RechartsTooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
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