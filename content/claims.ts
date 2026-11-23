/**
 * Trust claims. A claim is only rendered when its flag is `true`.
 * Flip a flag ONLY when the statement is literally true and you can prove it.
 * Every `false` flag falls back to the softer, honest wording.
 */
export const claims = {
  /** Every mentor has completed a police / background verification. */
  mentorsBackgroundChecked: false,
  /** Parents are alerted immediately (same day) about any safety concern. */
  immediateParentAlerts: false,
  /** A qualified counsellor / psychologist supervises mentors. */
  clinicalSupervisor: false,
  /** Mentors hold a formal counselling / psychology qualification. */
  mentorsQualifiedCounsellors: false,
  /** Sessions are recorded for safeguarding review. */
  sessionsRecorded: false,
} as const;

export const claimCopy = {
  mentors: claims.mentorsBackgroundChecked
    ? "Background-checked, vetted and trained mentors"
    : "Mentors are selected and trained; our vetting process is described on the Safety page",
  mentorsShort: claims.mentorsBackgroundChecked ? "Background-checked mentors" : "Selected & trained mentors",
  alerts: claims.immediateParentAlerts
    ? "Immediate parent alerts if a safety concern arises"
    : "Safety concerns follow a written escalation protocol, which includes informing parents",
  supervision: claims.clinicalSupervisor
    ? "Mentors are supervised by a qualified counsellor"
    : "Mentors follow a structured framework and regular case reviews",
} as const;
