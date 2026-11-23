import { requireAdmin } from "@/lib/auth";
import { listSchoolEnquiries } from "@/lib/db";
import { fmtDateTime } from "@/lib/admin";
import { AdminHeader, Badge, ContactLinks, Empty } from "@/components/admin/ui";
import { updateSchoolAction } from "../../actions";

export const metadata = { title: "School enquiries" };

export default async function SchoolsPage() {
  await requireAdmin();
  const items = await listSchoolEnquiries();
  return (
    <>
      <AdminHeader title="School enquiries" sub={`${items.length} total`} />
      {items.length === 0 ? (
        <Empty>No school enquiries yet.</Empty>
      ) : (
        <ul className="grid gap-3">
          {items.map((s) => (
            <li key={s.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{s.school_name} <span className="text-sm font-normal text-muted">· {s.city} · ~{s.students} students</span></p>
                  <p className="text-sm text-muted">{s.contact_name} ({s.role}) · {fmtDateTime(s.created_at)}</p>
                  {s.message && <p className="mt-2 max-w-2xl text-sm text-ink-soft">{s.message}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge value={s.status} />
                  <ContactLinks phone={s.phone_e164} email={s.email} message={`Hello ${s.contact_name}, thank you for your enquiry about Mentora for ${s.school_name}.`} />
                </div>
              </div>
              <form action={updateSchoolAction} className="mt-3 flex gap-1">
                <input type="hidden" name="id" value={s.id} />
                <select name="status" defaultValue={s.status} className="rounded-lg border border-line px-2 py-1 text-xs" aria-label="Status">
                  <option value="new">new</option><option value="contacted">contacted</option><option value="closed">closed</option>
                </select>
                <button className="rounded-lg bg-mist px-2 py-1 text-xs font-semibold">Save</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
