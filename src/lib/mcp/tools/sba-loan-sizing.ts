import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  calculateSBAGuaranteeFee,
  computeSBAAnnualServiceFee,
  computeSBALoanAmount,
  computeNewLoanAnnualPayment,
} from "../sba-math";

export default defineTool({
  name: "sba_loan_sizing",
  title: "SBA 7(a) loan sizing (Sources & Uses plug)",
  description:
    "Given the total primary financing request (uses), an equity injection, guarantee %, and whether the upfront fee is financed, solve for the SBA 7(a) loan amount, upfront fee, annual P&I, and annual SBA service fee. Mirrors the Summary tab's Sources & Uses solver.",
  inputSchema: {
    primaryRequest: z
      .number()
      .positive()
      .describe("Sum of Uses of Funds excluding SBA guarantee fee (USD)."),
    equityInjection: z.number().min(0).describe("Borrower equity injection (USD)."),
    guaranteePercent: z.number().min(0).max(100).describe("SBA guarantee percent (e.g. 75)."),
    financeFee: z
      .boolean()
      .describe("If true, the SBA upfront fee is rolled into the loan (circular). If false, treat fee as a separate borrower injection source."),
    interestRatePct: z.number().positive().optional().describe("Optional: annual interest % for P&I."),
    termMonths: z.number().positive().optional().describe("Optional: amortization term in months for P&I."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ primaryRequest, equityInjection, guaranteePercent, financeFee, interestRatePct, termMonths }) => {
    const loan = computeSBALoanAmount(primaryRequest, equityInjection, guaranteePercent, financeFee);
    const upfrontFee = calculateSBAGuaranteeFee(loan, guaranteePercent);
    const annualServiceFee = computeSBAAnnualServiceFee(loan, guaranteePercent);
    const annualPI =
      interestRatePct && termMonths
        ? computeNewLoanAnnualPayment(loan, interestRatePct, termMonths)
        : undefined;
    const totalProject = primaryRequest + upfrontFee;

    const lines = [
      `SBA 7(a) loan amount: $${loan.toFixed(2)}`,
      `Upfront guarantee fee: $${upfrontFee.toFixed(2)} (${financeFee ? "financed into loan" : "borrower-injected"})`,
      `Annual SBA service fee (0.55% on guaranteed portion): $${annualServiceFee.toFixed(2)}`,
      `Total project cost: $${totalProject.toFixed(2)}`,
    ];
    if (annualPI !== undefined) {
      lines.push(`Annual P&I: $${annualPI.toFixed(2)} (monthly $${(annualPI / 12).toFixed(2)})`);
    }

    return {
      content: [{ type: "text", text: lines.join("\n") }],
      structuredContent: {
        sbaLoanAmount: loan,
        upfrontGuaranteeFee: upfrontFee,
        annualServiceFee,
        annualPrincipalAndInterest: annualPI,
        totalProjectCost: totalProject,
        inputs: { primaryRequest, equityInjection, guaranteePercent, financeFee, interestRatePct, termMonths },
      },
    };
  },
});
