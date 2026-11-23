import "server-only";

export type Table =
  | "leads"
  | "consents"
  | "trial_sessions"
  | "enrollments"
  | "payments"
  | "school_enquiries"
  | "guide_subscribers"
  | "admin_audit_log";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = { id: string } & Record<string, any>;
export type Entity = { id: string };

export interface ListOptions {
  eq?: Record<string, string | number | null>;
  in?: { field: string; values: (string | number)[] };
  order?: { field: string; ascending?: boolean };
  limit?: number;
}

/** Raised when a unique constraint is violated (e.g. a UTR already claimed). */
export class UniqueViolationError extends Error {
  constructor(public field: string) {
    super(`Unique constraint violated on ${field}`);
    this.name = "UniqueViolationError";
  }
}

/** Minimal storage-agnostic table API. Domain logic lives in lib/db/index.ts. */
export interface DbAdapter {
  kind: "supabase" | "local";
  insert<T extends Entity>(table: Table, row: Omit<T, "id" | "created_at"> & Partial<Pick<T, "id">>): Promise<T>;
  update<T extends Entity>(table: Table, id: string, patch: Partial<T>): Promise<T>;
  /** Conditional update: only applies if the row currently matches `where`. Returns null if it didn't. */
  updateWhere<T extends Entity>(table: Table, id: string, where: Record<string, string | null>, patch: Partial<T>): Promise<T | null>;
  get<T extends Entity>(table: Table, id: string): Promise<T | null>;
  findOne<T extends Entity>(table: Table, field: string, value: string): Promise<T | null>;
  list<T extends Entity>(table: Table, opts?: ListOptions): Promise<T[]>;
  remove(table: Table, id: string): Promise<void>;
  nextReceiptNumber(): Promise<string>;
}
