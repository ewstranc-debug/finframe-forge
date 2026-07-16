import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "dscr",
  title: "Debt Service Coverage Ratio",
  description:
    "Compute DSCR = cash flow available for debt service / total annual debt service. Optionally annualizes interim cash flow by period months.",
  inputSchema: {
    cashFlow: z
      .number()
      .describe("Cash flow available for debt service for the period (USD). Business CFADS, global net cash, etc."),
    annualDebtService: z.number().positive().describe("Total annual debt service (USD)."),
    periodMonths: z
      .number()
      .positive()
      .max(24)
      .optional()
      .describe("If the cash flow is for a partial period, months in that period. Cash flow will be annualized as cashFlow × 12 / periodMonths."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ cashFlow, annualDebtService, periodMonths }) => {
    const annualized =
      periodMonths && periodMonths > 0 && periodMonths < 12 ? (cashFlow * 12) / periodMonths : cashFlow;
    const dscr = annualDebtService > 0 ? annualized / annualDebtService : 0;
    const flag =
      dscr >= 1.25 ? "meets 1.25x SBA benchmark" : dscr >= 1.0 ? "covers but below 1.25x" : "does NOT cover debt service";
    return {
      content: [
        {
          type: "text",
          text: `DSCR: ${dscr.toFixed(2)}x — ${flag}. (Annualized CFADS $${annualized.toFixed(2)} / Annual DS $${annualDebtService.toFixed(2)})`,
        },
      ],
      structuredContent: { dscr, annualizedCashFlow: annualized, annualDebtService, periodMonths: periodMonths ?? 12 },
    };
  },
});
