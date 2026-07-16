import { defineMcp } from "@lovable.dev/mcp-js";
import sbaGuaranteeFee from "./tools/sba-guarantee-fee";
import sbaLoanSizing from "./tools/sba-loan-sizing";
import loanPayment from "./tools/loan-payment";
import downPaymentSolver from "./tools/down-payment-solver";
import dscr from "./tools/dscr";

export default defineMcp({
  name: "sba-spreading-tool-mcp",
  title: "SBA Spreading Tool — Calculators",
  version: "0.1.0",
  instructions:
    "Public calculators from the SBA financial spreading tool. Stateless: no access to any user's saved spread. Use `sba_loan_sizing` for the Sources & Uses plug, `sba_guarantee_fee` for the FY2026 upfront fee tiers, `loan_payment` for amortizing P&I, `down_payment_solver` for a % of total-project-cost down payment, and `dscr` for coverage ratios (with optional interim annualization).",
  tools: [sbaLoanSizing, sbaGuaranteeFee, loanPayment, downPaymentSolver, dscr],
});
