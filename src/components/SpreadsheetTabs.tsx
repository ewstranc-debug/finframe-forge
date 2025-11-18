import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PersonalFinancials } from "./tabs/PersonalFinancials";
import { BusinessFinancials } from "./tabs/BusinessFinancials";
import { AffiliateFinancials } from "./tabs/AffiliateFinancials";
import { ExistingDebts } from "./tabs/ExistingDebts";
import { ProposedDebts } from "./tabs/ProposedDebts";
import { Summary } from "./tabs/Summary";

export const SpreadsheetTabs = () => {
  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
        <TabsTrigger 
          value="summary" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Summary
        </TabsTrigger>
        <TabsTrigger 
          value="personal" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Personal
        </TabsTrigger>
        <TabsTrigger 
          value="business" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Business
        </TabsTrigger>
        <TabsTrigger 
          value="affiliate" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Affiliate
        </TabsTrigger>
        <TabsTrigger 
          value="existing" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Existing Debts
        </TabsTrigger>
        <TabsTrigger 
          value="proposed" 
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Proposed Debts
        </TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="mt-0">
        <Summary />
      </TabsContent>
      <TabsContent value="personal" className="mt-0">
        <PersonalFinancials />
      </TabsContent>
      <TabsContent value="business" className="mt-0">
        <BusinessFinancials />
      </TabsContent>
      <TabsContent value="affiliate" className="mt-0">
        <AffiliateFinancials />
      </TabsContent>
      <TabsContent value="existing" className="mt-0">
        <ExistingDebts />
      </TabsContent>
      <TabsContent value="proposed" className="mt-0">
        <ProposedDebts />
      </TabsContent>
    </Tabs>
  );
};
