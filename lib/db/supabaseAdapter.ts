import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { UniqueViolationError, type DbAdapter, type ListOptions, type Row, type Table } from "./adapter";
import { serverEnv } from "@/lib/env";

let client: SupabaseClient | null = null;

/** Service-role client. Server-only: bypasses RLS, so never import this from client code. */
export function serviceClient(): SupabaseClient {
  if (!client) {
    const { supabaseUrl, supabaseServiceRoleKey } = serverEnv();
    if (!supabaseUrl || !supabaseServiceRoleKey) throw new Error("Supabase is not configured");
    client = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "x-client-info": "mentora-server" } },
    });
  }
  return client;
}

function raise(error: { code?: string; message: string; details?: string | null }): never {
  if (error.code === "23505") {
    const m = /\((\w+)\)=/.exec(error.details ?? "") ?? /"\w+_(\w+)_key"/.exec(error.message);
    throw new UniqueViolationError(m?.[1] ?? "unknown");
  }
  throw new Error(`Database error: ${error.message}`);
}

export const supabaseAdapter: DbAdapter = {
  kind: "supabase",
  async insert(table, row) {
    const { data, error } = await serviceClient().from(table).insert(row).select().single();
    if (error) raise(error);
    return data as never;
  },
  async update(table, id, patch) {
    const { data, error } = await serviceClient().from(table).update(patch as never).eq("id", id).select().single();
    if (error) raise(error);
    return data as never;
  },
  async updateWhere(table, id, where, patch) {
    let q = serviceClient().from(table).update(patch as never).eq("id", id);
    for (const [k, v] of Object.entries(where)) q = v === null ? q.is(k, null) : q.eq(k, v);
    const { data, error } = await q.select();
    if (error) raise(error);
    return ((data as Row[])[0] ?? null) as never;
  },
  async get(table, id) {
    const { data, error } = await serviceClient().from(table).select().eq("id", id).maybeSingle();
    if (error) raise(error);
    return data as never;
  },
  async findOne(table, field, value) {
    const { data, error } = await serviceClient().from(table).select().eq(field, value).limit(1).maybeSingle();
    if (error) raise(error);
    return data as never;
  },
  async list(table: Table, opts: ListOptions = {}) {
    let q = serviceClient().from(table).select();
    for (const [k, v] of Object.entries(opts.eq ?? {})) q = v === null ? q.is(k, null) : q.eq(k, v);
    if (opts.in) q = q.in(opts.in.field, opts.in.values);
    if (opts.order) q = q.order(opts.order.field, { ascending: opts.order.ascending ?? false });
    q = q.limit(opts.limit ?? 1000);
    const { data, error } = await q;
    if (error) raise(error);
    return data as never;
  },
  async remove(table, id) {
    const { error } = await serviceClient().from(table).delete().eq("id", id);
    if (error) raise(error);
  },
  async nextReceiptNumber() {
    const { data, error } = await serviceClient().rpc("next_receipt_number");
    if (error) raise(error);
    return data as string;
  },
};
