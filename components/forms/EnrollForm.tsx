"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, Lock } from "lucide-react";
import { enrollSchema } from "@/lib/validation";
import { classGroups } from "@/content/programs";
import { consentText } from "@/content/consent";
import { submitEnrollAction } from "@/app/actions/public";
import { readAttribution } from "@/lib/attribution";
import { Field, FormError, Honeypot, Turnstile, describe } from "./fields";

type In = z.input<typeof enrollSchema>;
type Out = z.output<typeof enrollSchema>;

export function EnrollForm({ prefill, leadToken, amountLabel }: { prefill?: Partial<In>; leadToken?: string; amountLabel: string }) {
  const [pending, start] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(enrollSchema),
    defaultValues: { website: "", turnstileToken: "", leadToken: leadToken ?? "", ...prefill },
  });

  const onSubmit = (data: Out) => {
    setServerError(null);
    start(async () => {
      // On success the action redirects to /pay/<token>; it only returns on error.
      const res = await submitEnrollAction(data, readAttribution());
      if (res && !res.ok) {
        setServerError(res.error);
        for (const [k, v] of Object.entries(res.fieldErrors ?? {})) setError(k as keyof In, { message: v });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative grid gap-5">
      <Honeypot register={register as never} />
      <input type="hidden" {...register("leadToken")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="parentName" label="Parent / guardian name" required error={errors.parentName?.message}>
          <input className="field" autoComplete="name" {...describe("parentName", errors.parentName?.message)} {...register("parentName")} />
        </Field>
        <Field id="phone" label="WhatsApp number" required error={errors.phone?.message}>
          <input className="field" type="tel" inputMode="tel" autoComplete="tel" {...describe("phone", errors.phone?.message)} {...register("phone")} />
        </Field>
      </div>
      <Field id="email" label="Email" required error={errors.email?.message} hint="We’ll send your payment acknowledgement and receipt here.">
        <input className="field" type="email" autoComplete="email" {...describe("email", errors.email?.message, true)} {...register("email")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="childFirstName" label="Child’s first name" required error={errors.childFirstName?.message}>
          <input className="field" autoComplete="off" {...describe("childFirstName", errors.childFirstName?.message)} {...register("childFirstName")} />
        </Field>
        <Field id="classGroup" label="Class group" required error={errors.classGroup?.message}>
          <select className="field" {...describe("classGroup", errors.classGroup?.message)} {...register("classGroup")}>
            <option value="">Choose…</option>
            {classGroups.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
      </div>
      <div>
        <label className="flex cursor-pointer gap-3 rounded-xl border border-line bg-mist/60 p-4 text-sm leading-relaxed text-ink-soft">
          <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#6a4ea3]" aria-invalid={errors.consent ? true : undefined} {...register("consent")} />
          <span>
            {consentText.enroll} <Link href="/privacy" target="_blank" className="link">Privacy</Link> ·{" "}
            <Link href="/terms" target="_blank" className="link">Terms</Link> · <Link href="/refund-policy" target="_blank" className="link">Refund policy</Link>
          </span>
        </label>
        {errors.consent && <p role="alert" className="field-error">{errors.consent.message}</p>}
      </div>
      <Turnstile onToken={(t) => setValue("turnstileToken", t)} />
      <FormError message={serverError} />
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-70">
        {pending ? <Loader2 aria-hidden className="animate-spin" size={18} /> : <Lock aria-hidden size={16} />}
        {pending ? "Preparing your payment page…" : `Continue to UPI payment (${amountLabel})`}
      </button>
      <p className="text-center text-sm text-muted">Next you’ll see a QR code and our UPI ID. Nothing is charged automatically.</p>
    </form>
  );
}
