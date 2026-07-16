// Pure SBA math, self-contained so the MCP entry stays import-safe
// (no React/context imports). Mirrors src/utils/financialCalculations.ts.

export type SBAGuaranteeFeeTier = {
  upTo: number;
  rate: number;
  rateOver?: number;
  upToCap?: number;
};

export const SBA_GUARANTEE_FEE_TIERS: SBAGuaranteeFeeTier[] = [
  { upTo: 150_000, rate: 0.02 },
  { upTo: 700_000, rate: 0.03 },
  { upTo: 1_000_000, rate: 0.035 },
  { upTo: Infinity, rate: 0.035, rateOver: 0.0375, upToCap: 1_000_000 },
];

export function calculateSBAGuaranteeFee(loanAmount: number, guaranteePercent: number): number {
  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return 0;
  const guaranteed = loanAmount * (guaranteePercent / 100);
  const tier =
    SBA_GUARANTEE_FEE_TIERS.find((t) => loanAmount <= t.upTo) ??
    SBA_GUARANTEE_FEE_TIERS[SBA_GUARANTEE_FEE_TIERS.length - 1];
  if (tier.rateOver !== undefined && tier.upToCap !== undefined) {
    const under = Math.min(guaranteed, tier.upToCap);
    const over = Math.max(0, guaranteed - tier.upToCap);
    return under * tier.rate + over * tier.rateOver;
  }
  return guaranteed * tier.rate;
}

export function computeNewLoanAnnualPayment(
  principal: number,
  interestRatePct: number,
  termMonths: number,
): number {
  if (!Number.isFinite(interestRatePct) || interestRatePct <= 0) return 0;
  if (!Number.isFinite(termMonths) || termMonths <= 0) return 0;
  if (!Number.isFinite(principal) || principal <= 0) return 0;
  const r = interestRatePct / 100 / 12;
  const monthly = (principal * (r * Math.pow(1 + r, termMonths))) / (Math.pow(1 + r, termMonths) - 1);
  return monthly * 12;
}

export function computeSBALoanAmount(
  primaryRequest: number,
  equityInjection: number,
  guaranteePercent: number,
  financeFee: boolean,
): number {
  const gp = Number.isFinite(guaranteePercent) ? guaranteePercent : 75;
  const equity = Number.isFinite(equityInjection) ? equityInjection : 0;
  if (!financeFee) return Math.max(0, primaryRequest - equity);
  let sba = Math.max(0, primaryRequest - equity);
  for (let i = 0; i < 12; i++) {
    const fee = calculateSBAGuaranteeFee(sba, gp);
    const newSba = Math.max(0, primaryRequest + fee - equity);
    if (Math.abs(newSba - sba) < 1) {
      sba = newSba;
      break;
    }
    sba = newSba;
  }
  return sba;
}

export function computeDownPaymentAndLoan(
  primaryRequest: number,
  downPaymentPct: number,
  guaranteePercent: number,
  financeFee: boolean,
): { equity: number; loan: number; fee: number; totalProject: number } {
  const gp = Number.isFinite(guaranteePercent) ? guaranteePercent : 75;
  const pct = Math.max(0, Math.min(100, downPaymentPct || 0)) / 100;
  if (primaryRequest <= 0) return { equity: 0, loan: 0, fee: 0, totalProject: 0 };
  let equity = pct * primaryRequest;
  let loan = 0;
  let fee = 0;
  for (let i = 0; i < 20; i++) {
    loan = financeFee
      ? Math.max(0, primaryRequest + fee - equity)
      : Math.max(0, primaryRequest - equity);
    const newFee = calculateSBAGuaranteeFee(loan, gp);
    const totalProject = primaryRequest + newFee;
    const newEquity = pct * totalProject;
    if (Math.abs(newFee - fee) < 0.5 && Math.abs(newEquity - equity) < 0.5) {
      fee = newFee;
      equity = newEquity;
      loan = financeFee
        ? Math.max(0, primaryRequest + fee - equity)
        : Math.max(0, primaryRequest - equity);
      break;
    }
    fee = newFee;
    equity = newEquity;
  }
  return { equity: Math.round(equity), loan, fee, totalProject: primaryRequest + fee };
}

export function computeSBAAnnualServiceFee(sbaLoanAmount: number, guaranteePercent: number): number {
  if (!Number.isFinite(sbaLoanAmount) || sbaLoanAmount <= 0) return 0;
  const gp = Number.isFinite(guaranteePercent) ? guaranteePercent : 75;
  return sbaLoanAmount * (gp / 100) * 0.0055;
}
