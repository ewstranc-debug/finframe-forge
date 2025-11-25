import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToPDF = (data: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Analysis Report', pageWidth / 2, 20, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
  
  let yPos = 40;

  // Executive Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 14, yPos);
  yPos += 10;

  // Personal Metrics
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Personal Financial Metrics', 14, yPos);
  yPos += 6;

  const personalData = [
    ['Net Worth', `$${data.personal.netWorth.toLocaleString()}`],
    ['Total Assets', `$${data.personal.totalAssets.toLocaleString()}`],
    ['Total Liabilities', `$${data.personal.totalLiabilities.toLocaleString()}`],
    ['Annual Income', `$${data.personal.totalIncome.toLocaleString()}`],
    ['Debt-to-Income', `${data.personal.debtToIncome.toFixed(1)}%`],
    ['Savings Rate', `${data.personal.savingsRate.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: personalData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Business Metrics
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Business Financial Metrics', 14, yPos);
  yPos += 6;

  const businessData = [
    ['Revenue', `$${data.business.revenue.toLocaleString()}`],
    ['Gross Profit', `$${data.business.grossProfit.toLocaleString()}`],
    ['Gross Margin', `${data.business.grossMargin.toFixed(1)}%`],
    ['EBITDA', `$${data.business.ebitda.toLocaleString()}`],
    ['Net Income', `$${data.business.netIncome.toLocaleString()}`],
    ['Current Ratio', data.business.currentRatio.toFixed(2)],
    ['Debt-to-Equity', data.business.debtToEquity.toFixed(2)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: businessData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // DSCR Metrics
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Debt Service Coverage Ratios', 14, yPos);
  yPos += 6;

  const dscrData = [
    ['Business DSCR - FYE', data.dscr.fullYear ? `${data.dscr.fullYear.proposedDSCR.toFixed(2)}x` : 'N/A'],
    ['Business DSCR - Interim', data.dscr.interim ? `${data.dscr.interim.proposedDSCR.toFixed(2)}x` : 'N/A'],
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
    [],
    ['Business Metrics'],
    ['Revenue', allData.ratios.business.revenue],
    ['Gross Profit', allData.ratios.business.grossProfit],
    ['Gross Margin %', allData.ratios.business.grossMargin],
    ['EBITDA', allData.ratios.business.ebitda],
    ['Net Income', allData.ratios.business.netIncome],
    ['Current Ratio', allData.ratios.business.currentRatio],
    ['Debt-to-Equity', allData.ratios.business.debtToEquity],
    [],
    ['Global Metrics'],
    ['Total Net Worth', allData.ratios.global.netWorth],
    ['Total Assets', allData.ratios.global.totalAssets],
    ['Total Liabilities', allData.ratios.global.totalLiabilities],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Personal Periods Sheet
  if (allData.personalPeriods && allData.personalPeriods.length > 0) {
    const personalHeaders = ['Period', 'Salary', 'Bonuses', 'Investments', 'Rental Income', 'Cost of Living', 'Personal Taxes'];
    const personalRows = allData.personalPeriods.map((period: any, idx: number) => [
      allData.personalPeriodLabels[idx] || `Period ${idx + 1}`,
      parseFloat(period.salary) || 0,
      parseFloat(period.bonuses) || 0,
      parseFloat(period.investments) || 0,
      parseFloat(period.rentalIncome) || 0,
      parseFloat(period.costOfLiving) || 0,
      parseFloat(period.personalTaxes) || 0,
    ]);
    
    const wsPersonal = XLSX.utils.aoa_to_sheet([personalHeaders, ...personalRows]);
    XLSX.utils.book_append_sheet(wb, wsPersonal, 'Personal Financials');
  }

  // Business Periods Sheet
  if (allData.businessPeriods && allData.businessPeriods.length > 0) {
    const businessHeaders = ['Period', 'Revenue', 'COGS', 'Operating Expenses', 'EBITDA', 'Net Income'];
    const businessRows = allData.businessPeriods.map((period: any, idx: number) => {
      const revenue = parseFloat(period.revenue) || 0;
      const cogs = parseFloat(period.cogs) || 0;
      const opEx = parseFloat(period.operatingExpenses) || 0;
      const ebitda = revenue - cogs - opEx;
      const netIncome = ebitda - (parseFloat(period.interest) || 0) - (parseFloat(period.taxes) || 0);
      
      return [
        allData.businessPeriodLabels[idx] || `Period ${idx + 1}`,
        revenue,
        cogs,
        opEx,
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

  const wsAL = XLSX.utils.aoa_to_sheet(alData);
  XLSX.utils.book_append_sheet(wb, wsAL, 'Assets & Liabilities');

  // Save
  XLSX.writeFile(wb, `financial-analysis-${new Date().toISOString().split('T')[0]}.xlsx`);
};
