import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { EnrollForm } from "@/components/forms/EnrollForm";
import { getLeadByEnrollToken } from "@/lib/db";
import { formatINR, getPlan, perSessionPaise } from "@/lib/pricing";
import { NOINDEX } from "@/lib/seo";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Enroll", robots: NOINDEX };
export const dynamic = "force-dynamic";

export default async function EnrollPage({ searchParams }: { searchParams: Promise<{ lead?: string }> }) {
  const { lead: token } = await searchParams;
  const lead = token ? await getLeadByEnrollToken(token).catch(() => null) : null;
  const usable = lead && !lead.anonymized_at ? lead : null;
  const plan = getPlan();

  return (
    <section className="section">
      <div className="container-x grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <p className="eyebrow">Enroll · step 1 of 2</p>
          <h1 className="display-lg mt-4">
            {usable ? (
              <>
                Welcome back, <span className="accent">{usable.parent_name.split(" ")[0]}.</span>
              </>
            ) : (
              <>
                Confirm your details, <span className="accent">then pay by UPI.</span>
              </>
            )}
          </h1>
          <p className="lede mt-5">
            {usable
              ? `Please check the details below for ${usable.child_first_name}. Next you’ll see the UPI payment page.`
              : "If you haven’t had a free intro session yet, we recommend booking one first — it’s the best way to know whether your child connects with a mentor."}
          </p>
          {!usable && (
            <p className="mt-4">
              <Link href="/book-trial" className="link">Book a free intro session instead →</Link>
            </p>
          )}
          <div className="card mt-8">
            <EnrollForm
              leadToken={usable ? token : undefined}
              amountLabel={formatINR(plan.amountPaise)}
              prefill={
                usable
                  ? {
                      parentName: usable.parent_name,
                      phone: usable.phone_e164.replace(/^\+91/, ""),
                      email: usable.email ?? "",
                      childFirstName: usable.child_first_name,
                      classGroup: usable.class_group,
                    }
                  : undefined
              }
            />
          </div>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Order summary</p>
            <p className="mt-2 font-display text-2xl font-medium">Monthly 1-on-1 mentorship</p>
            <p className="mt-1 text-sm text-muted">Founding pilot batch · limited to {site.pilotSeats} students</p>
            <ul className="mt-5 grid gap-2.5 text-ink-soft">
              {[`${plan.sessionsPerMonth} private ${plan.sessionMinutes}-min sessions`, "Dedicated mentor", "Goals & progress tracking", "Monthly parent update"].map((i) => (
                <li key={i} className="flex gap-2.5">
                  <Check aria-hidden size={18} className="mt-1 shrink-0 text-sage" /> {i}
                </li>
              ))}
            </ul>
            <dl className="mt-6 grid gap-2 border-t border-line pt-5">
              <div className="flex justify-between text-ink-soft"><dt>Per session</dt><dd>{formatINR(perSessionPaise(plan))}</dd></div>
              <div className="flex justify-between text-lg font-semibold text-ink"><dt>Total for 1 month</dt><dd>{formatINR(plan.amountPaise)}</dd></div>
            </dl>
            <p className="mt-4 text-sm text-muted">Month to month. No auto-debit. <Link className="link" href="/refund-policy">Refund policy</Link>.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
