import { Calculator } from "lucide-react";

export const SpreadsheetHeader = () => {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary rounded-lg p-2">
          <Calculator className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Spreading Tool</h1>
          <p className="text-sm text-muted-foreground">Analyze personal, business, and affiliate financials</p>
        </div>
      </div>
    </header>
  );
};
