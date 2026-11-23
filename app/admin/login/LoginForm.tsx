"use client";

import { useActionState } from "react";
import { sendMagicLink } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(sendMagicLink, null as null | { message: string });
  return (
    <form action={action} className="grid gap-3">
      <label htmlFor="email" className="field-label">Email</label>
      <input id="email" name="email" type="email" required autoComplete="email" className="field" />
      <button type="submit" disabled={pending} className="btn btn-primary w-full">{pending ? "Sending…" : "Email me a sign-in link"}</button>
      {state && <p role="status" className="text-sm text-ink-soft">{state.message}</p>}
    </form>
  );
}
