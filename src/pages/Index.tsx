import { SpreadsheetHeader } from "@/components/SpreadsheetHeader";
import { SpreadsheetTabs } from "@/components/SpreadsheetTabs";
import { SpreadsheetProvider } from "@/contexts/SpreadsheetContext";

const Index = () => {
  return (
    <SpreadsheetProvider>
      <div className="min-h-screen bg-background">
        <SpreadsheetHeader />
        <SpreadsheetTabs />
      </div>
    </SpreadsheetProvider>
  );
};

export default Index;
