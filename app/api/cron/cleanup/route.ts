import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/env";
import { anonymizeLead, audit, db, listEnrollments, listLeads, listPayments, type Payment, type Enrollment } from "@/lib/db";
import { deleteScreenshot } from "@/lib/storage";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;

function authorized(req: NextRequest) {
  const secret = serverEnv().cronSecret;
  if (!secret) return false;
  const got = Buffer.from(req.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

/**
 * Daily retention job (Vercel Cron, see vercel.json):
 *  1. delete payment screenshots 30 days after verification/rejection
 *  2. anonymise unconverted leads older than 12 months
 *  3. mark active enrollments lapsed 7 days after an unpaid renewal date
 */
export async function GET(req: NextRequest) {
  if (!authorized(req)) return new NextResponse("Unauthorized", { status: 401 });
  const now = Date.now();
  const result = { screenshotsDeleted: 0, leadsAnonymised: 0, enrollmentsLapsed: 0, errors: 0 };

  for (const p of await listPayments()) {
    const doneAt = p.verified_at ?? (p.status === "rejected" ? p.updated_at : null);
    if (p.screenshot_path && !p.screenshot_deleted_at && doneAt && now - Date.parse(doneAt) > 30 * DAY) {
      try {
        await deleteScreenshot(p.screenshot_path);
        await db().update<Payment>("payments", p.id, { screenshot_path: null, screenshot_deleted_at: new Date().toISOString() });
        result.screenshotsDeleted++;
      } catch (e) {
        console.error("[cleanup] screenshot", p.id, e);
        result.errors++;
      }
    }
  }

  const enrollments = await listEnrollments();
  const enrolledLeads = new Set(enrollments.map((e) => e.lead_id));
  for (const l of await listLeads()) {
    if (!l.anonymized_at && !enrolledLeads.has(l.id) && now - Date.parse(l.created_at) > 365 * DAY) {
      await anonymizeLead(l.id);
      result.leadsAnonymised++;
    }
  }

  for (const e of enrollments) {
    if (e.status === "active" && e.next_renewal_date && now - Date.parse(e.next_renewal_date) > 7 * DAY) {
      await db().update<Enrollment>("enrollments", e.id, { status: "lapsed" });
      result.enrollmentsLapsed++;
    }
  }

  await audit("system:cron", "cleanup.run", null, result);
  return NextResponse.json(result);
}
