import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ExportData {
  ratios: any;
  personalPeriods: any[];
  businessPeriods: any[];
  personalPeriodLabels: string[];
  businessPeriodLabels: string[];
  personalAssets: any;
  personalLiabilities: any;
  debts: any[];
  uses: any[];
  financialAnalysis?: string;
}

export const exportToPDF = (data: ExportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Comprehensive Financial Analysis Report', pageWidth / 2, 20, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
  
  let yPos = 40;

  const checkPageBreak = (requiredSpace = 40) => {
    if (yPos > pageHeight - requiredSpace) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  const addSectionHeader = (title: string) => {
    checkPageBreak(20);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, yPos);
    yPos += 10;
  };

  const addSubHeader = (title: string) => {
    checkPageBreak(15);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, yPos);
    yPos += 6;
  };

  // ==================== EXECUTIVE SUMMARY ====================
  addSectionHeader('Executive Summary');

  const summaryData = [
    ['Global Net Worth', `$${data.ratios.global.netWorth.toLocaleString()}`],
    ['Global Total Assets', `$${data.ratios.global.totalAssets.toLocaleString()}`],
    ['Global Total Liabilities', `$${data.ratios.global.totalLiabilities.toLocaleString()}`],
    ['Global Debt-to-Assets', `${data.ratios.global.debtToAssets.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;

  // ==================== DSCR ANALYSIS ====================
  addSectionHeader('Debt Service Coverage Ratio (DSCR) Analysis');

  const dscrData: any[] = [];
  
  // Full Year DSCR
  if (data.ratios.dscr.globalFullYear) {
    const fy = data.ratios.dscr.globalFullYear;
    dscrData.push(['Full Year - Global DSCR', `${fy.dscr.toFixed(2)}x`]);
    dscrData.push(['  Net Cash Available', `$${fy.netCashAvailable.toLocaleString()}`]);
    dscrData.push(['  Existing Debt Service', `$${fy.existingDebtPayment.toLocaleString()}`]);
    dscrData.push(['  Personal Debt Service', `$${fy.personalDebtPayment.toLocaleString()}`]);
    dscrData.push(['  Proposed Loan Payment', `$${fy.proposedDebtPayment.toLocaleString()}`]);
    dscrData.push(['  Total Annual Debt Service', `$${fy.annualDebtService.toLocaleString()}`]);
  }

  // Interim DSCR
  if (data.ratios.dscr.globalInterim) {
    const interim = data.ratios.dscr.globalInterim;
    dscrData.push(['', '']); // spacer
    dscrData.push(['Interim Period - Global DSCR', `${interim.dscr.toFixed(2)}x`]);
    dscrData.push(['  Net Cash Available (Annualized)', `$${interim.netCashAvailable.toLocaleString()}`]);
    dscrData.push(['  Existing Debt Service', `$${interim.existingDebtPayment.toLocaleString()}`]);
    dscrData.push(['  Personal Debt Service', `$${interim.personalDebtPayment.toLocaleString()}`]);
    dscrData.push(['  Proposed Loan Payment', `$${interim.proposedDebtPayment.toLocaleString()}`]);
    dscrData.push(['  Total Annual Debt Service', `$${interim.annualDebtService.toLocaleString()}`]);
  }

  if (dscrData.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [],
      body: dscrData,
      theme: 'striped',
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 12;
  }

  // ==================== PERSONAL FINANCIALS ====================
  doc.addPage();
  yPos = 20;
  addSectionHeader('Personal Financial Summary');

  const personalSummaryData = [
    ['Net Worth', `$${data.ratios.personal.netWorth.toLocaleString()}`],
    ['Total Assets', `$${data.ratios.personal.totalAssets.toLocaleString()}`],
    ['Total Liabilities', `$${data.ratios.personal.totalLiabilities.toLocaleString()}`],
    ['Liquid Assets', `$${data.ratios.personal.liquidAssets.toLocaleString()}`],
    ['Annual Income', `$${data.ratios.personal.totalIncome.toLocaleString()}`],
    ['Annual Expenses', `$${data.ratios.personal.totalExpenses.toLocaleString()}`],
    ['Debt-to-Income', `${data.ratios.personal.debtToIncome.toFixed(1)}%`],
    ['Savings Rate', `${data.ratios.personal.savingsRate.toFixed(1)}%`],
    ['Liquidity Ratio', data.ratios.personal.liquidityRatio.toFixed(2)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: personalSummaryData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;

  // Personal Income Spreads
  if (data.personalPeriods && data.personalPeriods.length > 0) {
    addSubHeader('Personal Income History');

    const personalHeaders = ['Period', 'W-2 Income', 'Business Income', 'Total Income', 'Expenses'];
    const personalRows = data.personalPeriods.map((period: any, idx: number) => {
      const w2Income = (parseFloat(period.salary) || 0) + (parseFloat(period.bonuses) || 0);
      const businessIncome = parseFloat(period.schedCRevenue) || 0;
      const totalIncome = w2Income + businessIncome + (parseFloat(period.investments) || 0) + (parseFloat(period.rentalIncome) || 0);
      const totalExpenses = (parseFloat(period.costOfLiving) || 0) + (parseFloat(period.personalTaxes) || 0);
      
      return [
        data.personalPeriodLabels[idx] || `Period ${idx + 1}`,
        `$${w2Income.toLocaleString()}`,
        `$${businessIncome.toLocaleString()}`,
        `$${totalIncome.toLocaleString()}`,
        `$${totalExpenses.toLocaleString()}`,
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [personalHeaders],
      body: personalRows,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 12;
  }

  // ==================== BUSINESS FINANCIALS ====================
  checkPageBreak(80);
  addSectionHeader('Business Financial Summary');

  const businessSummaryData = [
    ['Revenue', `$${data.ratios.business.revenue.toLocaleString()}`],
    ['COGS', `$${data.ratios.business.cogs.toLocaleString()}`],
    ['Gross Profit', `$${data.ratios.business.grossProfit.toLocaleString()}`],
    ['Gross Margin', `${data.ratios.business.grossMargin.toFixed(1)}%`],
    ['EBITDA', `$${data.ratios.business.ebitda.toLocaleString()}`],
    ['Net Income', `$${data.ratios.business.netIncome.toLocaleString()}`],
    ['Net Margin', `${data.ratios.business.netMargin.toFixed(1)}%`],
    ['Current Ratio', data.ratios.business.currentRatio.toFixed(2)],
    ['Debt-to-Equity', data.ratios.business.debtToEquity.toFixed(2)],
    ['ROA', `${data.ratios.business.roa.toFixed(1)}%`],
    ['ROE', `${data.ratios.business.roe.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: businessSummaryData,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;

  // Business Financial Spreads
  if (data.businessPeriods && data.businessPeriods.length > 0) {
    checkPageBreak(60);
    addSubHeader('Business Financial History');

    const businessHeaders = ['Period', 'Revenue', 'COGS', 'EBITDA', 'Net Income'];
    const businessRows = data.businessPeriods.map((period: any, idx: number) => {
      const revenue = parseFloat(period.revenue) || 0;
      const cogs = parseFloat(period.cogs) || 0;
      const opEx = parseFloat(period.operatingExpenses) || 0;
      const rentExpense = parseFloat(period.rentExpense) || 0;
      const officersComp = parseFloat(period.officersComp) || 0;
      const otherIncome = parseFloat(period.otherIncome) || 0;
      const otherExpenses = parseFloat(period.otherExpenses) || 0;
      const addbacks = parseFloat(period.addbacks) || 0;
      const depreciation = parseFloat(period.depreciation) || 0;
      const amortization = parseFloat(period.amortization) || 0;
      const interest = parseFloat(period.interest) || 0;
      const taxes = parseFloat(period.taxes) || 0;
      
      const ebitda = (revenue + otherIncome) - cogs - opEx - rentExpense - officersComp - otherExpenses + addbacks;
      const ebit = ebitda - depreciation - amortization;
      const netIncome = ebit - interest - taxes;
      
      return [
        data.businessPeriodLabels[idx] || `Period ${idx + 1}`,
        `$${revenue.toLocaleString()}`,
        `$${cogs.toLocaleString()}`,
        `$${ebitda.toLocaleString()}`,
        `$${netIncome.toLocaleString()}`,
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [businessHeaders],
      body: businessRows,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 12;
  }

  // ==================== LOAN REQUEST ====================
  if (data.uses && data.uses.length > 0) {
    checkPageBreak(60);
    addSectionHeader('Proposed Loan Request');

    const loanTotal = data.uses.reduce((sum: number, use: any) => sum + (parseFloat(use.amount) || 0), 0);
    const loanData = [
      ...data.uses.map((use: any) => [use.description || 'Unnamed Use', `$${(parseFloat(use.amount) || 0).toLocaleString()}`]),
      ['TOTAL LOAN REQUEST', `$${loanTotal.toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Use of Funds', 'Amount']],
      body: loanData,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 12;
  }

  // ==================== AI ANALYSIS ====================
  if (data.financialAnalysis) {
    doc.addPage();
    yPos = 20;
    addSectionHeader('AI Financial Analysis & Recommendations');

    // Strip markdown formatting for PDF
    const cleanText = data.financialAnalysis
      .replace(/[#*_~`]/g, '')
      .replace(/\n{3,}/g, '\n\n');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const splitText = doc.splitTextToSize(cleanText, pageWidth - 28);
    
    splitText.forEach((line: string) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 14, yPos);
      yPos += 5;
    });
  }

  // Save
  doc.save(`financial-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (allData: ExportData) => {
  const wb = XLSX.utils.book_new();

  // ==================== EXECUTIVE SUMMARY SHEET ====================
  const summaryData = [
    ['COMPREHENSIVE FINANCIAL ANALYSIS REPORT'],
    [`Generated: ${new Date().toLocaleDateString()}`],
    [],
    ['EXECUTIVE SUMMARY'],
    ['Global Net Worth', allData.ratios.global.netWorth],
    ['Global Total Assets', allData.ratios.global.totalAssets],
    ['Global Total Liabilities', allData.ratios.global.totalLiabilities],
    ['Global Debt-to-Assets %', allData.ratios.global.debtToAssets],
    [],
    ['DSCR METRICS'],
  ];

  if (allData.ratios.dscr.globalFullYear) {
    const fy = allData.ratios.dscr.globalFullYear;
    summaryData.push(
      ['Full Year - Global DSCR', fy.dscr],
      ['  Net Cash Available', fy.netCashAvailable],
      ['  Existing Debt Service', fy.existingDebtPayment],
      ['  Personal Debt Service', fy.personalDebtPayment],
      ['  Proposed Loan Payment', fy.proposedDebtPayment],
      ['  Total Annual Debt Service', fy.annualDebtService]
    );
  }

  if (allData.ratios.dscr.globalInterim) {
    const interim = allData.ratios.dscr.globalInterim;
    summaryData.push(
      [],
      ['Interim Period - Global DSCR', interim.dscr],
      ['  Net Cash Available (Annualized)', interim.netCashAvailable],
      ['  Existing Debt Service', interim.existingDebtPayment],
      ['  Personal Debt Service', interim.personalDebtPayment],
      ['  Proposed Loan Payment', interim.proposedDebtPayment],
      ['  Total Annual Debt Service', interim.annualDebtService]
    );
  }

  summaryData.push(
    [],
    ['PERSONAL METRICS'],
    ['Net Worth', allData.ratios.personal.netWorth],
    ['Total Assets', allData.ratios.personal.totalAssets],
    ['Total Liabilities', allData.ratios.personal.totalLiabilities],
    ['Liquid Assets', allData.ratios.personal.liquidAssets],
    ['Annual Income', allData.ratios.personal.totalIncome],
    ['Debt-to-Income %', allData.ratios.personal.debtToIncome],
    ['Savings Rate %', allData.ratios.personal.savingsRate],
    ['Liquidity Ratio', allData.ratios.personal.liquidityRatio],
    [],
    ['BUSINESS METRICS'],
    ['Revenue', allData.ratios.business.revenue],
    ['COGS', allData.ratios.business.cogs],
    ['Gross Profit', allData.ratios.business.grossProfit],
    ['Gross Margin %', allData.ratios.business.grossMargin],
    ['EBITDA', allData.ratios.business.ebitda],
    ['Net Income', allData.ratios.business.netIncome],
    ['Net Margin %', allData.ratios.business.netMargin],
    ['Current Ratio', allData.ratios.business.currentRatio],
    ['Debt-to-Equity', allData.ratios.business.debtToEquity],
    ['ROA %', allData.ratios.business.roa],
    ['ROE %', allData.ratios.business.roe],
  );

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

  // ==================== PERSONAL INCOME SPREADS ====================
  if (allData.personalPeriods && allData.personalPeriods.length > 0) {
    const personalHeaders = ['Period', 'Salary', 'Bonuses', 'Business Income', 'Investments', 'Rental Income', 'Other Income', 'Total Income', 'Cost of Living', 'Personal Taxes', 'Total Expenses', 'Net Cash Flow'];
    const personalRows = allData.personalPeriods.map((period: any, idx: number) => {
      const salary = parseFloat(period.salary) || 0;
      const bonuses = parseFloat(period.bonuses) || 0;
      const businessIncome = parseFloat(period.schedCRevenue) || 0;
      const investments = parseFloat(period.investments) || 0;
      const rentalIncome = parseFloat(period.rentalIncome) || 0;
      const otherIncome = parseFloat(period.otherIncome) || 0;
      const totalIncome = salary + bonuses + businessIncome + investments + rentalIncome + otherIncome;
      const costOfLiving = parseFloat(period.costOfLiving) || 0;
      const personalTaxes = parseFloat(period.personalTaxes) || 0;
      const totalExpenses = costOfLiving + personalTaxes;
      const netCashFlow = totalIncome - totalExpenses;

      return [
        allData.personalPeriodLabels[idx] || `Period ${idx + 1}`,
        salary,
        bonuses,
        businessIncome,
        investments,
        rentalIncome,
        otherIncome,
        totalIncome,
        costOfLiving,
        personalTaxes,
        totalExpenses,
        netCashFlow,
      ];
    });

    const wsPersonal = XLSX.utils.aoa_to_sheet([personalHeaders, ...personalRows]);
    XLSX.utils.book_append_sheet(wb, wsPersonal, 'Personal Income Spreads');
  }

  // ==================== BUSINESS FINANCIAL SPREADS ====================
  if (allData.businessPeriods && allData.businessPeriods.length > 0) {
    const businessHeaders = [
      'Period',
      'Period Months',
      'Revenue',
      'Other Income',
      'Total Revenue',
      'COGS',
      'Operating Expenses',
      'Rent Expense',
      'Officers Comp',
      'Other Expenses',
      'Addbacks',
      'EBITDA',
      'Depreciation',
      'Amortization',
      'EBIT',
      'Interest',
      'Taxes',
      'Net Income',
    ];
    
    const businessRows = allData.businessPeriods.map((period: any, idx: number) => {
      const revenue = parseFloat(period.revenue) || 0;
      const otherIncome = parseFloat(period.otherIncome) || 0;
      const cogs = parseFloat(period.cogs) || 0;
      const opEx = parseFloat(period.operatingExpenses) || 0;
      const rentExpense = parseFloat(period.rentExpense) || 0;
      const officersComp = parseFloat(period.officersComp) || 0;
      const otherExpenses = parseFloat(period.otherExpenses) || 0;
      const addbacks = parseFloat(period.addbacks) || 0;
      const depreciation = parseFloat(period.depreciation) || 0;
      const amortization = parseFloat(period.amortization) || 0;
      const interest = parseFloat(period.interest) || 0;
      const taxes = parseFloat(period.taxes) || 0;
      
      const totalRevenue = revenue + otherIncome;
      const ebitda = totalRevenue - cogs - opEx - rentExpense - officersComp - otherExpenses + addbacks;
      const ebit = ebitda - depreciation - amortization;
      const netIncome = ebit - interest - taxes;

      return [
        allData.businessPeriodLabels[idx] || `Period ${idx + 1}`,
        period.periodMonths || '12',
        revenue,
        otherIncome,
        totalRevenue,
        cogs,
        opEx,
        rentExpense,
        officersComp,
        otherExpenses,
        addbacks,
        ebitda,
        depreciation,
        amortization,
        ebit,
        interest,
        taxes,
        netIncome,
      ];
    });

    const wsBusiness = XLSX.utils.aoa_to_sheet([businessHeaders, ...businessRows]);
    XLSX.utils.book_append_sheet(wb, wsBusiness, 'Business Financial Spreads');
  }

  // ==================== ASSETS & LIABILITIES ====================
  const alData = [
    ['PERSONAL ASSETS'],
    ['Liquid Assets', parseFloat(allData.personalAssets.liquidAssets) || 0],
    ['Real Estate', parseFloat(allData.personalAssets.realEstate) || 0],
    ['Vehicles', parseFloat(allData.personalAssets.vehicles) || 0],
    ['Other Assets', parseFloat(allData.personalAssets.otherAssets) || 0],
    ['TOTAL PERSONAL ASSETS', Object.values(allData.personalAssets).reduce((sum: number, val: any) => sum + (parseFloat(val) || 0), 0)],
    [],
    ['PERSONAL LIABILITIES'],
    ['Credit Cards', parseFloat(allData.personalLiabilities.creditCards) || 0],
    ['Mortgages', parseFloat(allData.personalLiabilities.mortgages) || 0],
    ['Vehicle Loans', parseFloat(allData.personalLiabilities.vehicleLoans) || 0],
    ['Other Liabilities', parseFloat(allData.personalLiabilities.otherLiabilities) || 0],
  ];

  // Add existing business debts
  if (allData.debts && allData.debts.length > 0) {
    alData.push([], ['EXISTING BUSINESS DEBTS'], ['Creditor', 'Balance', 'Monthly Payment']);
    allData.debts.forEach((debt: any) => {
      alData.push([
        debt.creditor || 'Unknown',
        parseFloat(debt.balance) || 0,
        parseFloat(debt.payment) || 0,
      ]);
    });
  }

  const wsAL = XLSX.utils.aoa_to_sheet(alData);
  XLSX.utils.book_append_sheet(wb, wsAL, 'Assets & Liabilities');

  // ==================== LOAN REQUEST ====================
  if (allData.uses && allData.uses.length > 0) {
    const loanData = [
      ['PROPOSED LOAN REQUEST'],
      ['Use of Funds', 'Amount'],
      ...allData.uses.map((use: any) => [
        use.description || 'Unnamed Use',
        parseFloat(use.amount) || 0,
      ]),
      ['TOTAL LOAN REQUEST', allData.uses.reduce((sum: number, use: any) => sum + (parseFloat(use.amount) || 0), 0)],
    ];

    const wsLoan = XLSX.utils.aoa_to_sheet(loanData);
    XLSX.utils.book_append_sheet(wb, wsLoan, 'Loan Request');
  }

  // ==================== AI ANALYSIS ====================
  if (allData.financialAnalysis) {
    const aiData = [
      ['AI FINANCIAL ANALYSIS & RECOMMENDATIONS'],
      [],
      [allData.financialAnalysis],
    ];

    const wsAI = XLSX.utils.aoa_to_sheet(aiData);
    XLSX.utils.book_append_sheet(wb, wsAI, 'AI Analysis');
  }

  // Save
  XLSX.writeFile(wb, `financial-analysis-${new Date().toISOString().split('T')[0]}.xlsx`);
};
