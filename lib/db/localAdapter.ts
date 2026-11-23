import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { UniqueViolationError, type DbAdapter, type ListOptions, type Row, type Table } from "./adapter";

/**
 * DEVELOPMENT-ONLY JSON-file database (.data/db.json) so the full flow can be run
 * locally without a Supabase project. Mirrors the unique constraints in the SQL migration.
 * Refuses to run on Vercel.
 */
const FILE = path.join(process.cwd(), ".data", "db.json");
const UNIQUE: Partial<Record<Table, string[]>> = {
  leads: ["enroll_token"],
  enrollments: ["reference_code", "access_token"],
  payments: ["utr", "receipt_number"],
  guide_subscribers: ["email"],
};

const HAS_UPDATED_AT = new Set<Table>(["leads", "enrollments", "payments"]);

type Db = Record<Table, Row[]> & { _receiptSeq: number };
const empty = (): Db => ({
  leads: [],
  consents: [],
  trial_sessions: [],
  enrollments: [],
  payments: [],
  school_enquiries: [],
  guide_subscribers: [],
  admin_audit_log: [],
  _receiptSeq: 0,
});

let queue: Promise<unknown> = Promise.resolve();
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function load(): Promise<Db> {
  try {
    return { ...empty(), ...JSON.parse(await fs.readFile(FILE, "utf8")) };
  } catch {
    return empty();
  }
}
async function save(db: Db) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, FILE);
}

function checkUnique(db: Db, table: Table, row: Row) {
  for (const f of UNIQUE[table] ?? []) {
    const v = row[f];
    if (v === null || v === undefined) continue;
    if (db[table].some((r) => r.id !== row.id && r[f] === v)) throw new UniqueViolationError(f);
  }
}

const now = () => new Date().toISOString();
const clone = <T>(x: T): T => (x === undefined ? x : JSON.parse(JSON.stringify(x)));

export const localAdapter: DbAdapter = {
  kind: "local",
  insert: (table, row) =>
    locked(async () => {
      const db = await load();
      const ts = now();
      const full = { id: randomUUID(), created_at: ts, ...(HAS_UPDATED_AT.has(table) ? { updated_at: ts } : {}), ...row } as Row;
      checkUnique(db, table, full);
      db[table].push(full);
      await save(db);
      return clone(full) as never;
    }),
  update: (table, id, patch) =>
    locked(async () => {
      const db = await load();
      const i = db[table].findIndex((r) => r.id === id);
      if (i < 0) throw new Error(`Not found: ${table}/${id}`);
      const next = { ...db[table][i], ...patch, updated_at: now() } as Row;
      checkUnique(db, table, next);
      db[table][i] = next;
      await save(db);
      return clone(next) as never;
    }),
  updateWhere: (table, id, where, patch) =>
    locked(async () => {
      const db = await load();
      const i = db[table].findIndex((r) => r.id === id && Object.entries(where).every(([k, v]) => (r[k] ?? null) === v));
      if (i < 0) return null;
      const next = { ...db[table][i], ...patch, updated_at: now() } as Row;
      checkUnique(db, table, next);
      db[table][i] = next;
      await save(db);
      return clone(next) as never;
    }),
  async get(table, id) {
    const db = await load();
    return (clone(db[table].find((r) => r.id === id)) ?? null) as never;
  },
  async findOne(table, field, value) {
    const db = await load();
    return (clone(db[table].find((r) => r[field] === value)) ?? null) as never;
  },
  async list(table, opts: ListOptions = {}) {
    const db = await load();
    let rows = db[table].filter((r) => Object.entries(opts.eq ?? {}).every(([k, v]) => (r[k] ?? null) === v));
    if (opts.in) rows = rows.filter((r) => opts.in!.values.includes(r[opts.in!.field] as string));
    if (opts.order) {
      const { field, ascending = false } = opts.order;
      rows = [...rows].sort((a, b) => {
        const x = String(a[field] ?? ""), y = String(b[field] ?? "");
        return ascending ? x.localeCompare(y) : y.localeCompare(x);
      });
    }
    return clone(rows.slice(0, opts.limit ?? 1000)) as never;
  },
  remove: (table, id) =>
    locked(async () => {
      const db = await load();
      db[table] = db[table].filter((r) => r.id !== id);
      await save(db);
    }),
  nextReceiptNumber: () =>
    locked(async () => {
      const db = await load();
      db._receiptSeq += 1;
      await save(db);
      return `MNT-R-${new Date().getFullYear()}-${String(db._receiptSeq).padStart(5, "0")}`;
    }),
};
