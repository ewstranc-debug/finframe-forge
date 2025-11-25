import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface DSCRBreakdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLabel: string;
  businessEbitda: number;
  officersComp: number;
  personalW2Income: number;
  schedCCashFlow: number;
  personalExpenses: number;
  estimatedTaxOnOfficersComp: number;
  netCashAvailable: number;
  annualDebtService: number;
  dscr: number;
  periodMonths?: string;
  businessRevenue?: number;
  businessCOGS?: number;
  businessOpEx?: number;
  depreciation?: number;
  amortization?: number;
  section179?: number;
  addbacks?: number;
}

export const DSCRBreakdownModal = ({
  open,
  onOpenChange,
  periodLabel,
  businessEbitda,
  officersComp,
  personalW2Income,
  schedCCashFlow,
  personalExpenses,
  estimatedTaxOnOfficersComp,
  netCashAvailable,
  annualDebtService,
  dscr,
  periodMonths = "12",
  businessRevenue = 0,
  businessCOGS = 0,
  businessOpEx = 0,
  depreciation = 0,
  amortization = 0,
  section179 = 0,
  addbacks = 0,
}: DSCRBreakdownProps) => {
  const months = parseFloat(periodMonths) || 12;
  const isPartialYear = months < 12;
  const annualizationFactor = 12 / months;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Global DSCR Breakdown - {periodLabel}</DialogTitle>
          <DialogDescription>
            Detailed calculation showing how the Debt Service Coverage Ratio is computed
            {isPartialYear && ` (${months} months, annualized)`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Final DSCR Result */}
          <Card className={`${dscr >= 1.25 ? 'border-green-500 bg-green-50 dark:bg-green-950' : dscr >= 1.15 ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Global DSCR</p>
                <p className="text-4xl font-bold text-foreground">{dscr.toFixed(2)}x</p>
                <p className="text-sm mt-2 text-muted-foreground">
                  {dscr >= 1.25 ? '✓ Strong (≥1.25)' : dscr >= 1.15 ? '⚠ Acceptable (≥1.15)' : '✗ Below Threshold (<1.15)'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Formula */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-semibold mb-2">Formula:</p>
            <p className="font-mono text-sm">
              DSCR = Net Cash Available ÷ Annual Debt Service
            </p>
            <p className="font-mono text-sm mt-2">
              DSCR = ${netCashAvailable.toLocaleString()} ÷ ${annualDebtService.toLocaleString()} = {dscr.toFixed(2)}x
            </p>
          </div>

          {/* Income Sources */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Income Sources {isPartialYear && '(Annualized)'}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Business Cash Flow</p>
                  {isPartialYear && (
                    <p className="text-xs text-muted-foreground">
                      {months} months × {annualizationFactor.toFixed(2)} = annualized
                    </p>
                  )}
                </div>
                <p className="font-mono text-green-600">${businessEbitda.toLocaleString()}</p>
              </div>
              
              <div className="ml-6 space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Revenue:</span>
                  <span>${businessRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Less: COGS:</span>
                  <span>-${businessCOGS.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Less: Operating Expenses:</span>
                  <span>-${businessOpEx.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Add: Depreciation:</span>
                  <span>+${depreciation.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Add: Amortization:</span>
                  <span>+${amortization.toLocaleString()}</span>
                </div>
                {section179 > 0 && (
                  <div className="flex justify-between">
                    <span>Add: Section 179:</span>
                    <span>+${section179.toLocaleString()}</span>
                  </div>
                )}
                {addbacks > 0 && (
                  <div className="flex justify-between">
                    <span>Add: Other Addbacks:</span>
                    <span>+${addbacks.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <p className="font-medium">Officer's Compensation</p>
                <p className="font-mono text-green-600">${officersComp.toLocaleString()}</p>
              </div>

              <div className="flex justify-between items-center">
                <p className="font-medium">Personal W-2 & Other Income</p>
                <p className="font-mono text-green-600">${personalW2Income.toLocaleString()}</p>
              </div>

              <div className="flex justify-between items-center">
                <p className="font-medium">Schedule C Cash Flow</p>
                <p className="font-mono text-green-600">${schedCCashFlow.toLocaleString()}</p>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between items-center font-semibold">
                <p>Total Income Available</p>
                <p className="font-mono text-green-600">
                  ${(businessEbitda + officersComp + personalW2Income + schedCCashFlow).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Expenses</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="font-medium">Personal Expenses</p>
                <p className="font-mono text-red-600">-${personalExpenses.toLocaleString()}</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Est. Tax on Officer's Comp</p>
                  <p className="text-xs text-muted-foreground">(30% of ${officersComp.toLocaleString()})</p>
                </div>
                <p className="font-mono text-red-600">-${estimatedTaxOnOfficersComp.toLocaleString()}</p>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between items-center font-semibold">
                <p>Total Expenses</p>
                <p className="font-mono text-red-600">
                  -${(personalExpenses + estimatedTaxOnOfficersComp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Net Cash Available */}
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg">Net Cash Available for Debt Service</p>
                <p className="text-sm text-muted-foreground">
                  Total Income - Total Expenses
                </p>
              </div>
              <p className="text-2xl font-bold text-primary">
                ${netCashAvailable.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Annual Debt Service */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg">Annual Debt Service (Proposed)</p>
                <p className="text-sm text-muted-foreground">
                  Total annual loan payments
                </p>
              </div>
              <p className="text-2xl font-bold text-foreground">
                ${annualDebtService.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Interpretation */}
          <div className="bg-muted/50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Interpretation:</h3>
            <p className="text-sm text-muted-foreground">
              {dscr >= 1.25 && (
                "Excellent coverage. The business generates sufficient cash flow to comfortably cover debt obligations with a healthy margin of safety."
              )}
              {dscr >= 1.15 && dscr < 1.25 && (
                "Acceptable coverage. The business generates adequate cash flow to meet debt obligations, meeting most lender minimum requirements."
              )}
              {dscr < 1.15 && (
                "Below typical lender requirements. Consider ways to increase income, reduce expenses, or adjust loan terms to improve coverage ratio."
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              A DSCR of {dscr.toFixed(2)} means the business has ${netCashAvailable.toLocaleString()} available to cover ${annualDebtService.toLocaleString()} in annual debt payments, 
              providing {((dscr - 1) * 100).toFixed(0)}% cushion {dscr >= 1 ? 'above' : 'below'} the minimum requirement.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
