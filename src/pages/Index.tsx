import { SpreadsheetHeader } from "@/components/SpreadsheetHeader";
import { SpreadsheetTabs } from "@/components/SpreadsheetTabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SpreadsheetHeader />
      <SpreadsheetTabs />
    </div>
  );
};

export default Index;
