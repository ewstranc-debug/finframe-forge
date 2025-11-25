import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToPDF = (data: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Analysis Report', pageWidth / 2, 20, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
  
  let yPos = 40;

  const checkPageBreak = () => {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // Personal Metrics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Personal Financial Metrics', 14, yPos);
  yPos += 8;

  const personalData = [
    ['Net Worth', `$${data.personal.netWorth.toLocaleString()}`],
    ['Total Assets', `$${data.personal.totalAssets.toLocaleString()}`],
    ['Total Liabilities', `$${data.personal.totalLiabilities.toLocaleString()}`],
    ['Annual Income', `$${data.personal.totalIncome.toLocaleString()}`],
    ['Debt-to-Income', `${data.personal.debtToIncome.toFixed(1)}%`],
    ['Savings Rate', `${data.personal.savingsRate.toFixed(1)}%`],
    ['Liquidity Ratio', data.personal.liquidityRatio.toFixed(2)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: personalData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;
  checkPageBreak();

  // Business Metrics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Business Financial Metrics', 14, yPos);
  yPos += 8;

  const businessData = [
    ['Revenue', `$${data.business.revenue.toLocaleString()}`],
    ['Gross Profit', `$${data.business.grossProfit.toLocaleString()}`],
    ['Gross Margin', `${data.business.grossMargin.toFixed(1)}%`],
    ['EBITDA', `$${data.business.ebitda.toLocaleString()}`],
    ['Net Income', `$${data.business.netIncome.toLocaleString()}`],
    ['Net Margin', `${data.business.netMargin.toFixed(1)}%`],
    ['Current Ratio', data.business.currentRatio.toFixed(2)],
    ['Debt-to-Equity', data.business.debtToEquity.toFixed(2)],
    ['ROA', `${data.business.roa.toFixed(1)}%`],
    ['ROE', `${data.business.roe.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: businessData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;
  checkPageBreak();

  // DSCR Metrics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Debt Service Coverage Ratios', 14, yPos);
  yPos += 8;

  const dscrData = [
    ['Business DSCR - FYE (Existing)', data.dscr.fullYear ? `${data.dscr.fullYear.existingDSCR.toFixed(2)}x` : 'N/A'],
    ['Business DSCR - FYE (Proposed)', data.dscr.fullYear ? `${data.dscr.fullYear.proposedDSCR.toFixed(2)}x` : 'N/A'],
    ['Business DSCR - Interim (Existing)', data.dscr.interim ? `${data.dscr.interim.existingDSCR.toFixed(2)}x` : 'N/A'],
    ['Business DSCR - Interim (Proposed)', data.dscr.interim ? `${data.dscr.interim.proposedDSCR.toFixed(2)}x` : 'N/A'],
    ['Global DSCR - FYE', data.dscr.globalFullYear ? `${data.dscr.globalFullYear.dscr.toFixed(2)}x` : 'N/A'],
    ['Global DSCR - Interim', data.dscr.globalInterim ? `${data.dscr.globalInterim.dscr.toFixed(2)}x` : 'N/A'],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: dscrData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;
  checkPageBreak();

  // Global Metrics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Global / Consolidated Position', 14, yPos);
  yPos += 8;

  const globalData = [
    ['Total Net Worth', `$${data.global.netWorth.toLocaleString()}`],
    ['Total Assets', `$${data.global.totalAssets.toLocaleString()}`],
    ['Total Liabilities', `$${data.global.totalLiabilities.toLocaleString()}`],
    ['Total Income', `$${data.global.totalIncome.toLocaleString()}`],
    ['Global Debt-to-Assets', `${data.global.debtToAssets.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: globalData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  // Save
  doc.save(`financial-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (allData: any) => {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['Financial Analysis Report'],
    [`Generated: ${new Date().toLocaleDateString()}`],
    [],
    ['Personal Metrics'],
    ['Net Worth', allData.ratios.personal.netWorth],
    ['Total Assets', allData.ratios.personal.totalAssets],
    ['Total Liabilities', allData.ratios.personal.totalLiabilities],
    ['Annual Income', allData.ratios.personal.totalIncome],
    ['Debt-to-Income %', allData.ratios.personal.debtToIncome],
    ['Savings Rate %', allData.ratios.personal.savingsRate],
    ['Liquidity Ratio', allData.ratios.personal.liquidityRatio],
    [],
    ['Business Metrics'],
    ['Revenue', allData.ratios.business.revenue],
    ['Gross Profit', allData.ratios.business.grossProfit],
    ['Gross Margin %', allData.ratios.business.grossMargin],
    ['EBITDA', allData.ratios.business.ebitda],
    ['Net Income', allData.ratios.business.netIncome],
    ['Net Margin %', allData.ratios.business.netMargin],
    ['Current Ratio', allData.ratios.business.currentRatio],
    ['Debt-to-Equity', allData.ratios.business.debtToEquity],
    ['ROA %', allData.ratios.business.roa],
    ['ROE %', allData.ratios.business.roe],
    [],
    ['Global Metrics'],
    ['Total Net Worth', allData.ratios.global.netWorth],
    ['Total Assets', allData.ratios.global.totalAssets],
    ['Total Liabilities', allData.ratios.global.totalLiabilities],
    ['Total Income', allData.ratios.global.totalIncome],
    ['Global Debt-to-Assets %', allData.ratios.global.debtToAssets],
    [],
    ['DSCR Metrics'],
    ['Business DSCR - FYE (Proposed)', allData.ratios.dscr.fullYear?.proposedDSCR || 'N/A'],
    ['Business DSCR - Interim (Proposed)', allData.ratios.dscr.interim?.proposedDSCR || 'N/A'],
    ['Global DSCR - FYE', allData.ratios.dscr.globalFullYear?.dscr || 'N/A'],
    ['Global DSCR - Interim', allData.ratios.dscr.globalInterim?.dscr || 'N/A'],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Personal Periods Sheet
  if (allData.personalPeriods && allData.personalPeriods.length > 0) {
    const personalHeaders = ['Period', 'Salary', 'Bonuses', 'Investments', 'Rental Income', 'Other Income', 'Cost of Living', 'Personal Taxes'];
    const personalRows = allData.personalPeriods.map((period: any, idx: number) => [
      allData.personalPeriodLabels[idx] || `Period ${idx + 1}`,
      parseFloat(period.salary) || 0,
      parseFloat(period.bonuses) || 0,
      parseFloat(period.investments) || 0,
      parseFloat(period.rentalIncome) || 0,
      parseFloat(period.otherIncome) || 0,
      parseFloat(period.costOfLiving) || 0,
      parseFloat(period.personalTaxes) || 0,
    ]);
    
    const wsPersonal = XLSX.utils.aoa_to_sheet([personalHeaders, ...personalRows]);
    XLSX.utils.book_append_sheet(wb, wsPersonal, 'Personal Financials');
  }

  // Business Periods Sheet
  if (allData.businessPeriods && allData.businessPeriods.length > 0) {
    const businessHeaders = ['Period', 'Period Months', 'Revenue', 'COGS', 'Operating Expenses', 'Officers Comp', 'EBITDA', 'Net Income'];
    const businessRows = allData.businessPeriods.map((period: any, idx: number) => {
      const revenue = parseFloat(period.revenue) || 0;
      const cogs = parseFloat(period.cogs) || 0;
      const opEx = parseFloat(period.operatingExpenses) || 0;
      const officersComp = parseFloat(period.officersComp) || 0;
      const ebitda = revenue - cogs - opEx - officersComp;
      const netIncome = ebitda - (parseFloat(period.interest) || 0) - (parseFloat(period.taxes) || 0);
      
      return [
        allData.businessPeriodLabels[idx] || `Period ${idx + 1}`,
        period.periodMonths || '12',
        revenue,
        cogs,
        opEx,
        officersComp,
        ebitda,
        netIncome,
      ];
    });
    
    const wsBusiness = XLSX.utils.aoa_to_sheet([businessHeaders, ...businessRows]);
    XLSX.utils.book_append_sheet(wb, wsBusiness, 'Business Financials');
  }

  // Assets & Liabilities Sheet
  const alData = [
    ['Personal Assets'],
    ['Liquid Assets', parseFloat(allData.personalAssets.liquidAssets) || 0],
    ['Real Estate', parseFloat(allData.personalAssets.realEstate) || 0],
    ['Vehicles', parseFloat(allData.personalAssets.vehicles) || 0],
    ['Other Assets', parseFloat(allData.personalAssets.otherAssets) || 0],
    [],
    ['Personal Liabilities'],
    ['Credit Cards', parseFloat(allData.personalLiabilities.creditCards) || 0],
    ['Mortgages', parseFloat(allData.personalLiabilities.mortgages) || 0],
    ['Vehicle Loans', parseFloat(allData.personalLiabilities.vehicleLoans) || 0],
    ['Other Liabilities', parseFloat(allData.personalLiabilities.otherLiabilities) || 0],
  ];

  // Add existing business debts if available
  if (allData.debts && allData.debts.length > 0) {
    alData.push([], ['Business Debts']);
    allData.debts.forEach((debt: any) => {
      alData.push([
        debt.creditor || 'Unknown',
        parseFloat(debt.balance) || 0,
        `Monthly Payment: ${parseFloat(debt.payment) || 0}`,
      ]);
    });
  }

  const wsAL = XLSX.utils.aoa_to_sheet(alData);
  XLSX.utils.book_append_sheet(wb, wsAL, 'Assets & Liabilities');

  // Loan Details Sheet (if uses are provided)
  if (allData.uses && allData.uses.length > 0) {
    const loanData = [
      ['Loan Request Details'],
      [],
      ['Uses of Funds'],
      ...allData.uses.map((use: any) => [use.description, parseFloat(use.amount) || 0]),
    ];
    
    const wsLoan = XLSX.utils.aoa_to_sheet(loanData);
    XLSX.utils.book_append_sheet(wb, wsLoan, 'Loan Details');
  }

  // Save
  XLSX.writeFile(wb, `financial-analysis-${new Date().toISOString().split('T')[0]}.xlsx`);
};
