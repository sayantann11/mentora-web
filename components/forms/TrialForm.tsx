"use client";

import { useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { trialSchema } from "@/lib/validation";
import { classGroups, focusAreas } from "@/content/programs";
import { consentText } from "@/content/consent";
import { submitTrialAction } from "@/app/actions/public";
import { track } from "@/lib/analytics";
import { readAttribution } from "@/lib/attribution";
import { Field, FormError, Honeypot, Turnstile, describe } from "./fields";
import { WhatsAppLink } from "@/components/site/WhatsAppLink";

type In = z.input<typeof trialSchema>;
type Out = z.output<typeof trialSchema>;

const slots = [
  { value: "weekday_evening", label: "Weekday evenings" },
  { value: "weekend_morning", label: "Weekend mornings" },
  { value: "weekend_afternoon", label: "Weekend afternoons" },
  { value: "weekend_evening", label: "Weekend evenings" },
] as const;

export function TrialForm({ defaultClass, compact = false, readClassFromUrl = false }: { defaultClass?: string; compact?: boolean; readClassFromUrl?: boolean }) {
  return readClassFromUrl ? <TrialFormFromUrl compact={compact} /> : <TrialFormInner defaultClass={defaultClass} compact={compact} />;
}

/** Reads ?class= on the client so /book-trial stays a static page (metadata in <head>, CDN-cacheable). */
function TrialFormFromUrl({ compact }: { compact: boolean }) {
  const cls = useSearchParams().get("class") ?? undefined;
  return <TrialFormInner key={cls ?? "none"} defaultClass={cls} compact={compact} />;
}

function TrialFormInner({ defaultClass, compact }: { defaultClass?: string; compact: boolean }) {
  const [pending, start] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const started = useRef(false);
  const validClass = classGroups.some((c) => c.value === defaultClass) ? (defaultClass as In["classGroup"]) : undefined;

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(trialSchema),
    defaultValues: { classGroup: validClass, preferredSlots: [], website: "", turnstileToken: "", email: "", city: "", heardFrom: "", note: "" },
  });

  const onFirstInput = () => {
    if (!started.current) {
      started.current = true;
      track("start_trial_form");
    }
  };

  const onSubmit = (data: Out) => {
    setServerError(null);
    start(async () => {
      const res = await submitTrialAction(data, readAttribution());
      if (res.ok) {
        track("submit_trial_form", { class_group: data.classGroup, focus_area: data.focusArea });
        setDone(res.data.firstName);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setServerError(res.error);
        for (const [k, v] of Object.entries(res.fieldErrors ?? {})) setError(k as keyof In, { message: v });
      }
    });
  };

  if (done) {
    return (
      <div role="status" className="card text-center">
        <CheckCircle2 aria-hidden size={48} className="mx-auto text-sage" />
        <h2 className="mt-4 font-display text-3xl font-medium">Request received!</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Thank you. Our coordinator will message you on WhatsApp within 24 hours to schedule {done}’s free introductory session.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <WhatsAppLink location="trial_success" className="btn btn-primary">Message us now on WhatsApp</WhatsAppLink>
          <Link href="/how-it-works" className="btn btn-ghost">How sessions work</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} onInput={onFirstInput} noValidate className="relative grid gap-5" aria-describedby="trial-required">
      <p id="trial-required" className="text-sm text-muted">
        Fields marked <span className="text-status-red">*</span> are required. Please fill this in as the parent or guardian.
      </p>
      <Honeypot register={register as never} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="parentName" label="Parent / guardian name" required error={errors.parentName?.message}>
          <input className="field" autoComplete="name" {...describe("parentName", errors.parentName?.message)} {...register("parentName")} />
        </Field>
        <Field id="phone" label="WhatsApp number" required error={errors.phone?.message} hint="10-digit Indian mobile">
          <input className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" {...describe("phone", errors.phone?.message, true)} {...register("phone")} />
        </Field>
      </div>
      <Field id="email" label="Email" error={errors.email?.message} hint="Recommended — we’ll send a confirmation">
        <input className="field" type="email" autoComplete="email" {...describe("email", errors.email?.message, true)} {...register("email")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="childFirstName" label="Child’s first name" required error={errors.childFirstName?.message} hint="First name only">
          <input className="field" autoComplete="off" {...describe("childFirstName", errors.childFirstName?.message, true)} {...register("childFirstName")} />
        </Field>
        <Field id="classGroup" label="Class group" required error={errors.classGroup?.message}>
          <select className="field" defaultValue={validClass ?? ""} {...describe("classGroup", errors.classGroup?.message)} {...register("classGroup")}>
            <option value="" disabled>
              Choose…
            </option>
            {classGroups.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field id="focusArea" label="Primary focus area" required error={errors.focusArea?.message}>
        <select className="field" defaultValue="" {...describe("focusArea", errors.focusArea?.message)} {...register("focusArea")}>
          <option value="" disabled>
            Choose…
          </option>
          {focusAreas.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </Field>
      <fieldset>
        <legend className="field-label">
          Preferred times <span className="font-normal text-muted">(optional)</span>
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {slots.map((s) => (
            <label key={s.value} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 py-3 text-sm has-[:checked]:border-violet has-[:checked]:bg-lavender">
              <input type="checkbox" value={s.value} className="h-4 w-4 accent-[#6a4ea3]" {...register("preferredSlots")} />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>
      {!compact && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="city" label="City / state" error={errors.city?.message}>
              <input className="field" autoComplete="address-level2" {...describe("city", errors.city?.message)} {...register("city")} />
            </Field>
            <Field id="heardFrom" label="How did you hear about us?" error={errors.heardFrom?.message}>
              <input className="field" {...describe("heardFrom", errors.heardFrom?.message)} {...register("heardFrom")} />
            </Field>
          </div>
          <Field id="note" label="Anything you’d like us to know?" error={errors.note?.message} hint="Please don’t include medical, health or other sensitive details here — we can talk about anything important on the call.">
            <textarea className="field min-h-24" maxLength={500} {...describe("note", errors.note?.message, true)} {...register("note")} />
          </Field>
        </>
      )}
      <div>
        <label className="flex cursor-pointer gap-3 rounded-xl border border-line bg-mist/60 p-4 text-sm leading-relaxed text-ink-soft">
          <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#6a4ea3]" aria-invalid={errors.consent ? true : undefined} aria-describedby={errors.consent ? "consent-error" : undefined} {...register("consent")} />
          <span>
            {consentText.trial} <Link href="/privacy" className="link" target="_blank">Privacy policy</Link>
          </span>
        </label>
        {errors.consent && (
          <p id="consent-error" role="alert" className="field-error">
            {errors.consent.message}
          </p>
        )}
      </div>
      <Turnstile onToken={(t) => setValue("turnstileToken", t)} />
      <FormError message={serverError} />
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-70">
        {pending ? <Loader2 aria-hidden className="animate-spin" size={18} /> : null}
        {pending ? "Sending…" : "Request my free intro session"}
      </button>
      <p className="text-center text-sm text-muted">Free. No payment details needed. We’ll reply on WhatsApp within 24 hours.</p>
    </form>
  );
}
