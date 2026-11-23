import Link from "next/link";
import type { ReactNode } from "react";
import { MessageCircle, Phone, Mail } from "lucide-react";
import { waTo } from "@/lib/admin";

const tone: Record<string, string> = {
  new: "bg-lavender text-violet",
  contacted: "bg-sand text-saffron-ink",
  trial_scheduled: "bg-[#e3eefb] text-[#1d4f8a]",
  trial_done: "bg-[#e3eefb] text-[#1d4f8a]",
  enrolled: "bg-mint text-status-green",
  lost: "bg-[#f1eef3] text-muted",
  awaiting_payment: "bg-sand text-saffron-ink",
  payment_submitted: "bg-lavender text-violet",
  submitted: "bg-lavender text-violet",
  verified: "bg-mint text-status-green",
  active: "bg-mint text-status-green",
  rejected: "bg-[#fbe9e7] text-status-red",
  refunded: "bg-[#f1eef3] text-muted",
  lapsed: "bg-[#fbe9e7] text-status-red",
  cancelled: "bg-[#f1eef3] text-muted",
  scheduled: "bg-[#e3eefb] text-[#1d4f8a]",
  completed: "bg-mint text-status-green",
  no_show: "bg-[#fbe9e7] text-status-red",
  closed: "bg-[#f1eef3] text-muted",
};

export function Badge({ value }: { value: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${tone[value] ?? "bg-mist text-ink-soft"}`}>{value.replace(/_/g, " ")}</span>;
}

export function AdminHeader({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-medium">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Panel({ title, children, action }: { title?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-lg font-medium">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function ContactLinks({ phone, email, message }: { phone: string; email: string | null; message: string }) {
  if (phone === "redacted") return <span className="text-xs text-muted">redacted</span>;
  return (
    <span className="inline-flex gap-1">
      <a href={waTo(phone, message)} target="_blank" rel="noopener noreferrer" className="grid h-8 w-8 place-items-center rounded-lg bg-[#e7f5ec] text-[#1a7f45]" aria-label="WhatsApp" title="WhatsApp with pre-filled message">
        <MessageCircle size={15} aria-hidden />
      </a>
      <a href={`tel:${phone}`} className="grid h-8 w-8 place-items-center rounded-lg bg-mist text-violet" aria-label="Call" title={phone}>
        <Phone size={15} aria-hidden />
      </a>
      {email && (
        <a href={`mailto:${email}`} className="grid h-8 w-8 place-items-center rounded-lg bg-mist text-violet" aria-label="Email" title={email}>
          <Mail size={15} aria-hidden />
        </a>
      )}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-mist px-4 py-6 text-center text-sm text-muted">{children}</p>;
}

export const th = "px-3 py-2 text-left text-xs font-semibold tracking-wide text-muted uppercase";
export const td = "px-3 py-2.5 align-top text-sm";

export function NavLink({ href, children, count }: { href: string; children: ReactNode; count?: number }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white">
      {children}
      {count ? <span className="rounded-full bg-saffron px-2 text-xs font-bold text-ink">{count}</span> : null}
    </Link>
  );
}
