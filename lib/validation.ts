import { z } from "zod";

// Our CSP forbids 'unsafe-eval'. Zod 4 otherwise probes `new Function()` for its JIT fast path,
// which the browser blocks and reports as a CSP violation.
z.config({ jitless: true });

/**
 * Shared zod schemas — used by react-hook-form on the client AND re-validated on the server.
 * Never trust the client copy.
 */

/** Normalise an Indian mobile number to E.164 (+91XXXXXXXXXX). Returns null if invalid. */
export function normaliseIndianPhone(input: string): string | null {
  let d = input.replace(/[\s\-().]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  d = d.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  if (!/^[6-9]\d{9}$/.test(d)) return null;
  return `+91${d}`;
}

const trimmed = (max: number) => z.string().trim().max(max);

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Please enter a WhatsApp number")
  .refine((v) => normaliseIndianPhone(v) !== null, "Enter a valid 10-digit Indian mobile number");

const nameSchema = trimmed(80)
  .min(2, "Please enter a name")
  .regex(/^[\p{L}\p{M}.' -]+$/u, "Please use letters only");

export const childFirstNameSchema = trimmed(40)
  .min(1, "Please enter your child’s first name")
  .regex(/^[\p{L}\p{M}'-]+$/u, "First name only, please (no spaces or surnames)");

export const classGroupSchema = z.enum(["3-5", "6-8", "9-12"], { message: "Please choose a class group" });
export const focusAreaSchema = z.enum(["confidence", "study_screens", "exam_stress", "peers_communication", "career"], {
  message: "Please choose a focus area",
});
export const slotSchema = z.enum(["weekday_evening", "weekend_morning", "weekend_afternoon", "weekend_evening"]);

const optionalEmail = z
  .string()
  .trim()
  .max(120)
  .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address")
  .optional()
  .default("");

export const consentSchema = z.literal(true, { message: "Please confirm consent to continue" });

export const trialSchema = z.object({
  parentName: nameSchema,
  phone: phoneSchema,
  email: optionalEmail,
  childFirstName: childFirstNameSchema,
  classGroup: classGroupSchema,
  focusArea: focusAreaSchema,
  preferredSlots: z.array(slotSchema).max(4).default([]),
  city: trimmed(80).optional().default(""),
  heardFrom: trimmed(80).optional().default(""),
  note: trimmed(500).optional().default(""),
  consent: consentSchema,
  // honeypot: must stay empty
  website: z.string().max(0, "Spam check failed").optional().default(""),
  turnstileToken: z.string().optional().default(""),
});
export type TrialInput = z.input<typeof trialSchema>;

export const enrollSchema = z.object({
  leadToken: z.string().max(80).optional().default(""),
  parentName: nameSchema,
  phone: phoneSchema,
  email: z.email("Enter a valid email address — we send your receipt here").max(120),
  childFirstName: childFirstNameSchema,
  classGroup: classGroupSchema,
  consent: consentSchema,
  website: z.string().max(0).optional().default(""),
  turnstileToken: z.string().optional().default(""),
});
export type EnrollInput = z.input<typeof enrollSchema>;

/** UPI UTR / RRN: 12 digits. */
export const utrSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/\s/g, ""))
  .pipe(z.string().regex(/^\d{12}$/, "The UPI transaction ID (UTR) is 12 digits"));

export const proofSchema = z.object({
  payerName: nameSchema,
  utr: utrSchema,
  paidAt: z
    .string()
    .trim()
    .min(1, "Please enter when you paid")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date and time")
    .refine((v) => Date.parse(v) <= Date.now() + 10 * 60_000, "Payment time can’t be in the future")
    .refine((v) => Date.parse(v) >= Date.now() - 45 * 86_400_000, "That date is too far in the past — please contact us"),
});
export type ProofInput = z.input<typeof proofSchema>;

export const schoolSchema = z.object({
  schoolName: trimmed(120).min(2, "Please enter the school name"),
  contactName: nameSchema,
  role: trimmed(80).min(2, "Please enter your role"),
  email: z.email("Enter a valid email address").max(120),
  phone: phoneSchema,
  students: z.coerce.number({ message: "Enter a number" }).int().min(1, "At least 1").max(20000),
  city: trimmed(80).min(2, "Please enter the city"),
  message: trimmed(1000).optional().default(""),
  consent: consentSchema,
  website: z.string().max(0).optional().default(""),
  turnstileToken: z.string().optional().default(""),
});
export type SchoolInput = z.input<typeof schoolSchema>;

export const guideSchema = z.object({
  email: z.email("Enter a valid email address").max(120),
  consent: consentSchema,
  website: z.string().max(0).optional().default(""),
});
export type GuideInput = z.input<typeof guideSchema>;

export const leadStatuses = ["new", "contacted", "trial_scheduled", "trial_done", "enrolled", "lost"] as const;
export type LeadStatus = (typeof leadStatuses)[number];
