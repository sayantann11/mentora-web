import { site } from "./site";

/**
 * Consent notices shown next to every form. The exact text shown is stored with each consent record.
 * DRAFT — have a qualified lawyer review this wording (DPDP Act 2023 / DPDP Rules 2025) before launch.
 * Bump POLICY_VERSION whenever the text or the privacy policy changes materially.
 */
export const POLICY_VERSION = "2026-11-22.v1";

export const consentText = {
  trial: `I am the parent or legal guardian of this child, and I consent to ${site.name} collecting the details in this form — my name, contact details, my child’s first name and class group, and the preferences I’ve shared — to arrange a free introductory session and contact me about it on WhatsApp, phone or email. I understand that my data will not be sold or used for advertising, that unconverted enquiries are deleted after 12 months, and that I can withdraw consent or ask for my data to be deleted at any time by writing to ${site.grievance.email}.`,
  enroll: `I am the parent or legal guardian of this child, and I consent to ${site.name} processing my details and my child’s first name and class group to provide 1-on-1 mentorship, process payments, send me monthly progress updates, and follow its safeguarding protocol (which may include contacting me if there is a concern about my child’s safety). I have read the Privacy Policy, Terms and Refund Policy. I can withdraw consent at any time by writing to ${site.grievance.email}.`,
  school: `I consent to ${site.name} using these details to respond to this enquiry on behalf of my school. No student data is collected through this form.`,
  guide: `Send me the free guide and occasional parenting articles from ${site.name} by email. I can unsubscribe at any time.`,
} as const;

export type ConsentPurpose = keyof typeof consentText;
