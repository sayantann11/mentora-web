"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { BookHeart, Loader2 } from "lucide-react";
import { guideSchema } from "@/lib/validation";
import { consentText } from "@/content/consent";
import { subscribeGuideAction } from "@/app/actions/public";
import { track } from "@/lib/analytics";
import { Honeypot } from "./fields";

type In = z.input<typeof guideSchema>;
type Out = z.output<typeof guideSchema>;

export function GuideSignup() {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<In, unknown, Out>({ resolver: zodResolver(guideSchema), defaultValues: { website: "" } });

  const onSubmit = (data: Out) =>
    start(async () => {
      setErr(null);
      const res = await subscribeGuideAction(data);
      if (res.ok) {
        track("subscribe_guide");
        setDone(true);
      } else setErr(res.fieldErrors?.email ?? res.error);
    });

  return (
    <section aria-labelledby="guide-title" className="relative overflow-hidden rounded-[2rem] bg-sand p-7 sm:p-10">
      <div aria-hidden className="absolute -right-16 -bottom-20 h-64 w-64 rounded-full bg-peach blur-2xl" />
      <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <BookHeart aria-hidden className="text-saffron-ink" size={32} />
          <h2 id="guide-title" className="mt-4 font-display text-3xl font-medium">Free guide: 5 conversations to have with your child this week</h2>
          <p className="mt-3 text-ink-soft">Short, practical conversation starters for Classes 3–12 — with what to say, what to avoid, and how to listen.</p>
        </div>
        {done ? (
          <p role="status" className="rounded-2xl bg-white p-6 text-ink">
            <strong>Check your inbox!</strong> We’ve emailed you the guide. You can also <a className="link" href="/guide/five-conversations">read it here</a>.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative grid gap-3">
            <Honeypot register={register as never} />
            <label htmlFor="guide-email" className="sr-only">Email address</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input id="guide-email" type="email" autoComplete="email" placeholder="Your email address" className="field flex-1" aria-invalid={errors.email || err ? true : undefined} {...register("email")} />
              <button type="submit" disabled={pending} className="btn btn-primary shrink-0">
                {pending && <Loader2 aria-hidden className="animate-spin" size={16} />} Send me the guide
              </button>
            </div>
            <label className="flex cursor-pointer gap-2.5 text-sm text-ink-soft">
              <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[#6a4ea3]" {...register("consent")} />
              <span>{consentText.guide}</span>
            </label>
            {(errors.email || errors.consent || err) && (
              <p role="alert" className="field-error">{errors.email?.message ?? errors.consent?.message ?? err}</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
