import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { computeNewLoanAnnualPayment } from "../sba-math";

export default defineTool({
  name: "loan_payment",
  title: "Amortizing loan payment",
  description:
    "Compute the monthly and annual principal & interest payment for a fully-amortizing loan.",
  inputSchema: {
    principal: z.number().positive().describe("Loan principal in USD."),
    interestRatePct: z.number().positive().describe("Annual interest rate as a percent, e.g. 9.5"),
    termMonths: z.number().positive().describe("Amortization term in months, e.g. 120"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ principal, interestRatePct, termMonths }) => {
    const annual = computeNewLoanAnnualPayment(principal, interestRatePct, termMonths);
    const monthly = annual / 12;
    return {
      content: [
        {
          type: "text",
          text: `Monthly P&I: $${monthly.toFixed(2)} — Annual debt service: $${annual.toFixed(2)}`,
        },
      ],
      structuredContent: { monthlyPayment: monthly, annualDebtService: annual, principal, interestRatePct, termMonths },
    };
  },
});
