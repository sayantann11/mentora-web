"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { schoolSchema } from "@/lib/validation";
import { consentText } from "@/content/consent";
import { submitSchoolAction } from "@/app/actions/public";
import { track } from "@/lib/analytics";
import { Field, FormError, Honeypot, Turnstile, describe } from "./fields";

type In = z.input<typeof schoolSchema>;
type Out = z.output<typeof schoolSchema>;

export function SchoolForm() {
  const [pending, start] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<In, unknown, Out>({ resolver: zodResolver(schoolSchema), defaultValues: { website: "", turnstileToken: "", message: "" } });

  const onSubmit = (data: Out) =>
    start(async () => {
      setServerError(null);
      const res = await submitSchoolAction(data);
      if (res.ok) {
        track("submit_school_enquiry");
        setDone(true);
      } else {
        setServerError(res.error);
        for (const [k, v] of Object.entries(res.fieldErrors ?? {})) setError(k as keyof In, { message: v });
      }
    });

  if (done)
    return (
      <div role="status" className="card text-center">
        <CheckCircle2 aria-hidden size={44} className="mx-auto text-sage" />
        <h3 className="mt-3 font-display text-2xl font-medium">Thank you — we’ll be in touch</h3>
        <p className="mt-2 text-ink-soft">We usually respond to school enquiries within two working days.</p>
      </div>
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative grid gap-5">
      <Honeypot register={register as never} />
      <Field id="schoolName" label="School name" required error={errors.schoolName?.message}>
        <input className="field" autoComplete="organization" {...describe("schoolName", errors.schoolName?.message)} {...register("schoolName")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contactName" label="Your name" required error={errors.contactName?.message}>
          <input className="field" autoComplete="name" {...describe("contactName", errors.contactName?.message)} {...register("contactName")} />
        </Field>
        <Field id="role" label="Your role" required error={errors.role?.message}>
          <input className="field" placeholder="Principal, counsellor, coordinator…" autoComplete="organization-title" {...describe("role", errors.role?.message)} {...register("role")} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="semail" label="Work email" required error={errors.email?.message}>
          <input className="field" type="email" autoComplete="email" {...describe("semail", errors.email?.message)} {...register("email")} />
        </Field>
        <Field id="sphone" label="Phone" required error={errors.phone?.message}>
          <input className="field" type="tel" inputMode="tel" autoComplete="tel" {...describe("sphone", errors.phone?.message)} {...register("phone")} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="students" label="Approx. number of students" required error={errors.students?.message}>
          <input className="field" type="number" min={1} inputMode="numeric" {...describe("students", errors.students?.message)} {...register("students")} />
        </Field>
        <Field id="scity" label="City" required error={errors.city?.message}>
          <input className="field" autoComplete="address-level2" {...describe("scity", errors.city?.message)} {...register("city")} />
        </Field>
      </div>
      <Field id="message" label="What would you like to explore?" error={errors.message?.message}>
        <textarea className="field min-h-24" {...describe("message", errors.message?.message)} {...register("message")} />
      </Field>
      <div>
        <label className="flex cursor-pointer gap-3 rounded-xl border border-line bg-mist/60 p-4 text-sm text-ink-soft">
          <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#6a4ea3]" {...register("consent")} />
          <span>{consentText.school}</span>
        </label>
        {errors.consent && <p role="alert" className="field-error">{errors.consent.message}</p>}
      </div>
      <Turnstile onToken={(t) => setValue("turnstileToken", t)} />
      <FormError message={serverError} />
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-70">
        {pending && <Loader2 aria-hidden className="animate-spin" size={18} />} {pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
