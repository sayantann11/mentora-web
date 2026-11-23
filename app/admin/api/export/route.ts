import { NextResponse, type NextRequest } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { audit, listEnrollments, listLeads, listPayments } from "@/lib/db";
import { istDate, toCsv } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await currentAdmin();
  if (!admin) return new NextResponse("Unauthorized", { status: 401 });
  const type = req.nextUrl.searchParams.get("type");
  let csv: string;
  let count = 0;

  if (type === "leads") {
    const sp = req.nextUrl.searchParams;
    const leads = (await listLeads()).filter(
      (l) =>
        (!sp.get("status") || l.status === sp.get("status")) &&
        (!sp.get("class") || l.class_group === sp.get("class")) &&
        (!sp.get("source") || (l.utm_source ?? "direct") === sp.get("source")) &&
        (!sp.get("from") || istDate(l.created_at) >= sp.get("from")!) &&
        (!sp.get("to") || istDate(l.created_at) <= sp.get("to")!),
    );
    count = leads.length;
    csv = toCsv(leads as never, [
      "created_at", "parent_name", "phone_e164", "email", "child_first_name", "class_group", "focus_area", "city", "status", "lost_reason",
      "next_followup_at", "utm_source", "utm_medium", "utm_campaign", "referrer", "landing_page", "owner_notes",
    ]);
  } else if (type === "payments") {
    const [payments, enrollments, leads] = await Promise.all([listPayments(), listEnrollments(), listLeads()]);
    const enr = new Map(enrollments.map((e) => [e.id, e]));
    const lead = new Map(leads.map((l) => [l.id, l]));
    const rows = payments.map((p) => {
      const l = lead.get(enr.get(p.enrollment_id)?.lead_id ?? "");
      return {
        receipt_number: p.receipt_number,
        reference_code: p.reference_code,
        parent_name: l?.parent_name,
        period_start: p.period_start,
        amount_inr: (p.amount_paise / 100).toFixed(2),
        status: p.status,
        method: "UPI (direct)",
        utr: p.utr,
        payer_name: p.payer_name,
        paid_at_claimed: p.paid_at_claimed,
        verified_at: p.verified_at,
        verified_by: p.verified_by,
        refund_inr: p.refund_amount_paise ? (p.refund_amount_paise / 100).toFixed(2) : "",
        refunded_at: p.refunded_at,
        refund_note: p.refund_note,
      };
    });
    count = rows.length;
    csv = toCsv(rows, Object.keys(rows[0] ?? { receipt_number: 1 }));
  } else {
    return new NextResponse("Unknown export type", { status: 400 });
  }

  await audit(admin, "export.csv", type, { rows: count, filters: Object.fromEntries(req.nextUrl.searchParams) });
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mentora-${type}-${istDate()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
