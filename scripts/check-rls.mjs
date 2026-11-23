#!/usr/bin/env node
/**
 * RLS smoke test: uses the PUBLIC anon key (what any visitor's browser could have) and
 * tries to read and write every table. Every attempt must fail or return zero rows.
 *
 *   node --env-file=.env.local scripts/check-rls.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY first.");
  process.exit(2);
}
const sb = createClient(url, anon, { auth: { persistSession: false } });
const tables = ["leads", "consents", "trial_sessions", "enrollments", "payments", "school_enquiries", "guide_subscribers", "admin_audit_log"];
let failures = 0;

for (const t of tables) {
  const read = await sb.from(t).select("*").limit(1);
  const readOk = read.error || (read.data ?? []).length === 0;
  const write = await sb.from(t).insert({ id: "00000000-0000-0000-0000-000000000000" });
  const writeBlocked = Boolean(write.error);
  console.log(`${t.padEnd(18)} read: ${readOk ? "blocked ✔" : "LEAKED ✘"}   insert: ${writeBlocked ? "blocked ✔" : "ALLOWED ✘"}`);
  if (!readOk || !writeBlocked) failures++;
}

const rpc = await sb.rpc("next_receipt_number");
console.log(`rpc next_receipt_number: ${rpc.error ? "blocked ✔" : "ALLOWED ✘"}`);
if (!rpc.error) failures++;

const storage = await sb.storage.from("payment-proofs").list();
const storageOk = storage.error || (storage.data ?? []).length === 0;
console.log(`storage payment-proofs list: ${storageOk ? "blocked ✔" : "LEAKED ✘"}`);
if (!storageOk) failures++;

console.log(failures ? `\n${failures} problem(s) found — fix before launch.` : "\nAll anon access attempts were blocked.");
process.exit(failures ? 1 : 0);
