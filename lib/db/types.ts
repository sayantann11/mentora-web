import type { LeadStatus } from "@/lib/validation";

export type ClassGroup = "3-5" | "6-8" | "9-12";
export type EnrollmentStatus = "awaiting_payment" | "payment_submitted" | "active" | "lapsed" | "cancelled";
export type PaymentStatus = "awaiting_payment" | "submitted" | "verified" | "rejected" | "refunded";
export type TrialStatus = "scheduled" | "completed" | "no_show" | "cancelled";

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  parent_name: string;
  phone_e164: string;
  email: string | null;
  child_first_name: string;
  class_group: ClassGroup;
  focus_area: string | null;
  preferred_slots: string[];
  city: string | null;
  heard_from: string | null;
  note: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
  status: LeadStatus;
  lost_reason: string | null;
  owner_notes: string | null;
  next_followup_at: string | null;
  consent_id: string | null;
  enroll_token: string;
  anonymized_at: string | null;
}

export interface Consent {
  id: string;
  lead_id: string | null;
  policy_version: string;
  purpose: string;
  text_shown: string;
  accepted_at: string;
  ip_hash: string | null;
  user_agent: string | null;
}

export interface TrialSession {
  id: string;
  created_at: string;
  lead_id: string;
  scheduled_at: string;
  mentor_name: string | null;
  status: TrialStatus;
  notes: string | null;
}

export interface Enrollment {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string;
  plan_code: string;
  amount_paise: number;
  currency: "INR";
  status: EnrollmentStatus;
  start_date: string | null;
  next_renewal_date: string | null;
  reference_code: string;
  access_token: string;
}

export interface Payment {
  id: string;
  created_at: string;
  updated_at: string;
  enrollment_id: string;
  reference_code: string;
  period_start: string | null;
  amount_paise: number;
  status: PaymentStatus;
  payer_name: string | null;
  utr: string | null;
  paid_at_claimed: string | null;
  screenshot_path: string | null;
  screenshot_deleted_at: string | null;
  submitted_at: string | null;
  verified_by: string | null;
  verified_at: string | null;
  reject_reason: string | null;
  refund_amount_paise: number | null;
  refund_note: string | null;
  refunded_at: string | null;
  receipt_number: string | null;
}

export interface SchoolEnquiry {
  id: string;
  created_at: string;
  school_name: string;
  contact_name: string;
  role: string;
  email: string;
  phone_e164: string;
  students: number;
  city: string;
  message: string | null;
  status: "new" | "contacted" | "closed";
  consent_id: string | null;
}

export interface GuideSubscriber {
  id: string;
  created_at: string;
  email: string;
  consent_id: string | null;
  unsubscribed_at: string | null;
}

export interface AuditEntry {
  id: string;
  created_at: string;
  actor: string;
  action: string;
  target: string | null;
  detail: Record<string, unknown> | null;
}

export type NewLead = Omit<Lead, "id" | "created_at" | "updated_at" | "status" | "lost_reason" | "owner_notes" | "next_followup_at" | "anonymized_at">;
