import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { calculateSBAGuaranteeFee } from "../sba-math";

export default defineTool({
  name: "sba_guarantee_fee",
  title: "SBA 7(a) upfront guarantee fee",
  description:
    "Calculate the SBA 7(a) upfront guarantee fee for a given loan amount and guarantee percentage using the FY2026 tier table.",
  inputSchema: {
    loanAmount: z.number().positive().describe("Total SBA 7(a) loan amount in USD."),
    guaranteePercent: z
      .number()
      .min(0)
      .max(100)
      .describe("SBA guarantee percentage (e.g. 75 or 85)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ loanAmount, guaranteePercent }) => {
    const fee = calculateSBAGuaranteeFee(loanAmount, guaranteePercent);
    const guaranteed = loanAmount * (guaranteePercent / 100);
    return {
      content: [
        {
          type: "text",
          text: `SBA upfront guarantee fee: $${fee.toFixed(2)} (guaranteed portion: $${guaranteed.toFixed(2)})`,
        },
      ],
      structuredContent: { fee, guaranteedPortion: guaranteed, loanAmount, guaranteePercent },
    };
  },
});
