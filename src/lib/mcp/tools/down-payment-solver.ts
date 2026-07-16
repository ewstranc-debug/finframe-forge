import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { computeDownPaymentAndLoan } from "../sba-math";

export default defineTool({
  name: "down_payment_solver",
  title: "Down payment on total project cost",
  description:
    "Solve iteratively for the equity injection and resulting SBA 7(a) loan when the down payment is a percentage of total project cost (primary request + upfront fee).",
  inputSchema: {
    primaryRequest: z.number().positive().describe("Sum of Uses of Funds excluding fee (USD)."),
    downPaymentPct: z.number().min(0).max(100).describe("Down payment as % of total project cost."),
    guaranteePercent: z.number().min(0).max(100).describe("SBA guarantee percent (e.g. 75)."),
    financeFee: z.boolean().describe("Whether the upfront SBA fee is financed into the loan."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ primaryRequest, downPaymentPct, guaranteePercent, financeFee }) => {
    const r = computeDownPaymentAndLoan(primaryRequest, downPaymentPct, guaranteePercent, financeFee);
    const meets10 = r.totalProject > 0 && r.equity / r.totalProject >= 0.1;
    return {
      content: [
        {
          type: "text",
          text: [
            `Equity injection: $${r.equity.toFixed(2)}`,
            `SBA loan: $${r.loan.toFixed(2)}`,
            `Upfront fee: $${r.fee.toFixed(2)}`,
            `Total project cost: $${r.totalProject.toFixed(2)}`,
            `Meets 10% minimum: ${meets10 ? "yes" : "no"}`,
          ].join("\n"),
        },
      ],
      structuredContent: { ...r, meetsTenPercentMinimum: meets10 },
    };
  },
});
