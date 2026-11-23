/**
 * Server-authoritative pricing. Amounts are integers in paise.
 * The client NEVER supplies an amount; it is always looked up here.
 */
export type PlanCode = "pilot_monthly";

export interface Plan {
  code: PlanCode;
  name: string;
  amountPaise: number;
  currency: "INR";
  sessionsPerMonth: number;
  sessionMinutes: number;
  billingPeriodMonths: number;
}

export const PLANS: Record<PlanCode, Plan> = {
  pilot_monthly: {
    code: "pilot_monthly",
    name: "Founding pilot — monthly 1-on-1 mentorship",
    amountPaise: 200000,
    currency: "INR",
    sessionsPerMonth: 8,
    sessionMinutes: 30,
    billingPeriodMonths: 1,
  },
};

export const DEFAULT_PLAN: PlanCode = "pilot_monthly";

export function getPlan(code: string = DEFAULT_PLAN): Plan {
  const plan = PLANS[code as PlanCode];
  if (!plan) throw new Error(`Unknown plan: ${code}`);
  return plan;
}

export function perSessionPaise(plan: Plan = getPlan()): number {
  return Math.round(plan.amountPaise / plan.sessionsPerMonth);
}

/** 200000 -> "₹2,000" (whole rupees) or "₹2,000.50" if paise present. */
export function formatINR(paise: number): string {
  if (!Number.isInteger(paise) || paise < 0) throw new Error("paise must be a non-negative integer");
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/** 200000 -> "2000.00" — the exact format UPI expects in `am=`. */
export function upiAmount(paise: number): string {
  if (!Number.isInteger(paise) || paise <= 0) throw new Error("paise must be a positive integer");
  return `${Math.floor(paise / 100)}.${String(paise % 100).padStart(2, "0")}`;
}

/** Adds whole months, clamping to the last day of the target month (Jan 31 + 1 → Feb 28/29). */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return d;
}
