import { requireAdmin } from "@/lib/auth";
import { listAudit } from "@/lib/db";
import { fmtDateTime } from "@/lib/admin";
import { AdminHeader, Empty, td, th } from "@/components/admin/ui";

export const metadata = { title: "Audit log" };

export default async function AuditPage() {
  await requireAdmin();
  const rows = await listAudit();
  return (
    <>
      <AdminHeader title="Audit log" sub="Latest 200 admin actions: exports, screenshot views, verifications, edits." />
      {rows.length === 0 ? (
        <Empty>No admin activity yet.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-line bg-mist/60"><tr><th className={th}>When</th><th className={th}>Who</th><th className={th}>Action</th><th className={th}>Target</th><th className={th}>Detail</th></tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className={td}>{fmtDateTime(r.created_at)}</td>
                  <td className={td}>{r.actor}</td>
                  <td className={`${td} font-mono text-xs`}>{r.action}</td>
                  <td className={`${td} font-mono text-xs`}>{r.target ?? "—"}</td>
                  <td className={`${td} max-w-sm truncate font-mono text-xs`}>{r.detail ? JSON.stringify(r.detail) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
