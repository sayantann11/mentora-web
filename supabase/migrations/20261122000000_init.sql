-- Mentora — initial schema
-- Every table has RLS enabled and NO policies for anon/authenticated, plus explicit REVOKEs.
-- All reads/writes happen on the server with the service-role key (which bypasses RLS).

create extension if not exists pgcrypto;

-- ───────────── helpers ─────────────
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ───────────── enums ─────────────
do $$ begin
  create type lead_status as enum ('new','contacted','trial_scheduled','trial_done','enrolled','lost');
  create type class_group as enum ('3-5','6-8','9-12');
  create type trial_status as enum ('scheduled','completed','no_show','cancelled');
  create type enrollment_status as enum ('awaiting_payment','payment_submitted','active','lapsed','cancelled');
  create type payment_status as enum ('awaiting_payment','submitted','verified','rejected','refunded');
  create type enquiry_status as enum ('new','contacted','closed');
exception when duplicate_object then null; end $$;

-- ───────────── consents ─────────────
create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid,
  policy_version text not null,
  purpose text not null,
  text_shown text not null,
  accepted_at timestamptz not null default now(),
  ip_hash text,               -- SHA-256(ip + secret salt); never the raw IP
  user_agent text
);

-- ───────────── leads ─────────────
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  parent_name text not null check (char_length(parent_name) between 1 and 80),
  phone_e164 text not null check (phone_e164 ~ '^\+91[6-9][0-9]{9}$' or phone_e164 = 'redacted'),
  email text check (email is null or char_length(email) <= 120),
  child_first_name text not null check (char_length(child_first_name) between 1 and 40),
  class_group class_group not null,
  focus_area text,
  preferred_slots jsonb not null default '[]'::jsonb,
  city text,
  heard_from text,
  note text check (note is null or char_length(note) <= 500),
  utm_source text, utm_medium text, utm_campaign text, utm_term text, utm_content text,
  referrer text,
  landing_page text,
  status lead_status not null default 'new',
  lost_reason text,
  owner_notes text,
  next_followup_at timestamptz,
  consent_id uuid references public.consents(id) on delete set null,
  enroll_token text not null unique,
  anonymized_at timestamptz
);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_followup_idx on public.leads (next_followup_at) where next_followup_at is not null;
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_phone_idx on public.leads (phone_e164);
create trigger leads_updated_at before update on public.leads for each row execute function public.set_updated_at();

alter table public.consents
  add constraint consents_lead_fk foreign key (lead_id) references public.leads(id) on delete cascade not valid;

-- ───────────── trial sessions ─────────────
create table if not exists public.trial_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  scheduled_at timestamptz not null,
  mentor_name text,
  status trial_status not null default 'scheduled',
  notes text
);
create index if not exists trial_sessions_lead_idx on public.trial_sessions (lead_id);
create index if not exists trial_sessions_sched_idx on public.trial_sessions (scheduled_at);

-- ───────────── enrollments ─────────────
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_id uuid not null references public.leads(id) on delete restrict,
  plan_code text not null,
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  status enrollment_status not null default 'awaiting_payment',
  start_date date,
  next_renewal_date date,
  reference_code text not null unique,
  access_token text not null unique check (char_length(access_token) >= 32)
);
create index if not exists enrollments_status_idx on public.enrollments (status);
create index if not exists enrollments_renewal_idx on public.enrollments (next_renewal_date);
create index if not exists enrollments_lead_idx on public.enrollments (lead_id);
create trigger enrollments_updated_at before update on public.enrollments for each row execute function public.set_updated_at();

-- ───────────── payments ─────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  enrollment_id uuid not null references public.enrollments(id) on delete restrict,
  reference_code text not null,
  period_start date,
  amount_paise integer not null check (amount_paise > 0),
  status payment_status not null default 'awaiting_payment',
  payer_name text,
  utr text unique check (utr is null or utr ~ '^[0-9]{12}$'),   -- a UTR can only ever be claimed once
  paid_at_claimed timestamptz,
  screenshot_path text,
  screenshot_deleted_at timestamptz,
  submitted_at timestamptz,
  verified_by text,
  verified_at timestamptz,
  reject_reason text,
  refund_amount_paise integer check (refund_amount_paise is null or refund_amount_paise > 0),
  refund_note text,
  refunded_at timestamptz,
  receipt_number text unique
);
create index if not exists payments_status_idx on public.payments (status);
create index if not exists payments_enrollment_idx on public.payments (enrollment_id);
create index if not exists payments_verified_idx on public.payments (verified_at) where screenshot_path is not null;
create trigger payments_updated_at before update on public.payments for each row execute function public.set_updated_at();

-- ───────────── school enquiries ─────────────
create table if not exists public.school_enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  school_name text not null,
  contact_name text not null,
  role text not null,
  email text not null,
  phone_e164 text not null,
  students integer not null check (students > 0),
  city text not null,
  message text,
  status enquiry_status not null default 'new',
  consent_id uuid references public.consents(id) on delete set null
);

-- ───────────── guide subscribers ─────────────
create table if not exists public.guide_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  consent_id uuid references public.consents(id) on delete set null,
  unsubscribed_at timestamptz
);

-- ───────────── admin audit log ─────────────
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,
  action text not null,
  target text,
  detail jsonb
);
create index if not exists audit_created_idx on public.admin_audit_log (created_at desc);

-- ───────────── receipt numbers ─────────────
create sequence if not exists public.receipt_seq start 1;
create or replace function public.next_receipt_number() returns text
language sql as $$
  select 'MNT-R-' || to_char(now() at time zone 'Asia/Kolkata', 'YYYY') || '-' || lpad(nextval('public.receipt_seq')::text, 5, '0');
$$;

-- ───────────── lock it down ─────────────
do $$
declare t text;
begin
  foreach t in array array['consents','leads','trial_sessions','enrollments','payments','school_enquiries','guide_subscribers','admin_audit_log']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
  end loop;
end $$;
revoke all on sequence public.receipt_seq from anon, authenticated;
revoke execute on function public.next_receipt_number() from anon, authenticated, public;
grant execute on function public.next_receipt_number() to service_role;
