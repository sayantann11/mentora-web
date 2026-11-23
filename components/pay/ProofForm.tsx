"use client";

import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, Upload } from "lucide-react";
import { proofSchema } from "@/lib/validation";
import { submitProofAction } from "@/app/actions/public";
import { MAX_SCREENSHOT_BYTES } from "@/lib/fileSignature";
import { Field, FormError, describe } from "@/components/forms/fields";

type In = z.input<typeof proofSchema>;
type Out = z.output<typeof proofSchema>;

function localNow() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function ProofForm({ token }: { token: string }) {
  const [pending, start] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<In, unknown, Out>({ resolver: zodResolver(proofSchema), defaultValues: { paidAt: localNow() } });

  const onFile = (f: File | undefined) => {
    setFileError(null);
    setFileName(f?.name ?? null);
    if (!f) return;
    if (f.size > MAX_SCREENSHOT_BYTES) setFileError("The screenshot must be 3 MB or smaller.");
    else if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) setFileError("Please choose a JPG, PNG or WebP image.");
  };

  const onSubmit = (data: Out) => {
    if (fileError) return;
    setServerError(null);
    const fd = new FormData();
    fd.set("payerName", data.payerName);
    fd.set("utr", data.utr);
    fd.set("paidAt", new Date(data.paidAt).toISOString());
    const f = fileRef.current?.files?.[0];
    if (f) fd.set("screenshot", f);
    start(async () => {
      const res = await submitProofAction(token, fd); // redirects on success
      if (res && !res.ok) {
        setServerError(res.error);
        for (const [k, v] of Object.entries(res.fieldErrors ?? {})) {
          if (k === "screenshot") setFileError(v);
          else setError(k as keyof In, { message: v });
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
      <Field id="payerName" label="Payer’s name (as shown in your UPI app)" required error={errors.payerName?.message}>
        <input className="field" autoComplete="name" {...describe("payerName", errors.payerName?.message)} {...register("payerName")} />
      </Field>
      <Field
        id="utr"
        label="UPI transaction ID / UTR"
        required
        error={errors.utr?.message}
        hint="12 digits. In GPay it’s the “UPI transaction ID”; in PhonePe, “UTR”; in Paytm, “UPI Ref No.”"
      >
        <input className="field font-mono tracking-wider" inputMode="numeric" autoComplete="off" maxLength={14} placeholder="e.g. 412345678901" {...describe("utr", errors.utr?.message, true)} {...register("utr")} />
      </Field>
      <Field id="paidAt" label="When did you pay?" required error={errors.paidAt?.message}>
        <input className="field" type="datetime-local" {...describe("paidAt", errors.paidAt?.message)} {...register("paidAt")} />
      </Field>
      <div>
        <p className="field-label">
          Payment screenshot <span className="font-normal text-muted">(optional)</span>
        </p>
        <label htmlFor="screenshot" className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-lilac bg-mist/60 px-4 py-4 text-sm text-ink-soft hover:bg-mist">
          <Upload aria-hidden size={18} className="text-violet" />
          <span>{fileName ?? "Choose an image (JPG, PNG or WebP, up to 3 MB)"}</span>
        </label>
        <input
          ref={fileRef}
          id="screenshot"
          name="screenshot"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-describedby={fileError ? "screenshot-error" : undefined}
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        {fileError && <p id="screenshot-error" role="alert" className="field-error">{fileError}</p>}
        <p className="field-hint">Stored privately and deleted 30 days after verification.</p>
      </div>
      <FormError message={serverError} />
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-70">
        {pending && <Loader2 aria-hidden className="animate-spin" size={18} />} {pending ? "Submitting…" : "I’ve paid — submit details"}
      </button>
    </form>
  );
}
