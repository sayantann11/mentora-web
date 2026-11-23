import { NextResponse, type NextRequest } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/env";
import { readLocalScreenshot } from "@/lib/storage";
import { detectImage } from "@/lib/fileSignature";

/** Dev-only: serves screenshots from .data/uploads to signed-in admins. In production Supabase signed URLs are used. */
export async function GET(req: NextRequest) {
  if (supabaseConfigured()) return new NextResponse("Not found", { status: 404 });
  if (!(await currentAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const p = req.nextUrl.searchParams.get("path") ?? "";
  if (!/^[a-zA-Z0-9/_\-.]+$/.test(p) || p.includes("..")) return new NextResponse("Bad request", { status: 400 });
  const buf = await readLocalScreenshot(p);
  if (!buf) return new NextResponse("Not found", { status: 404 });
  const kind = detectImage(new Uint8Array(buf));
  if (!kind) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": kind.mime, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
