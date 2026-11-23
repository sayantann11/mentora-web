import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { supabaseConfigured } from "./env";
import { serviceClient } from "./db/supabaseAdapter";

const BUCKET = "payment-proofs";
const LOCAL_DIR = path.join(process.cwd(), ".data", "uploads");

/** Uploads a validated screenshot to the PRIVATE bucket. Returns the storage path. */
export async function uploadScreenshot(objectPath: string, bytes: Uint8Array, contentType: string): Promise<string> {
  if (!/^[a-zA-Z0-9/_\-.]+$/.test(objectPath) || objectPath.includes("..")) throw new Error("Invalid object path");
  if (supabaseConfigured()) {
    const { error } = await serviceClient().storage.from(BUCKET).upload(objectPath, bytes, { contentType, upsert: false });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    return objectPath;
  }
  const full = path.join(LOCAL_DIR, objectPath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, bytes);
  return objectPath;
}

/** Short-lived URL for admins only (Supabase signed URL, or an admin-guarded local route in dev). */
export async function screenshotUrl(objectPath: string, expiresInSec = 120): Promise<string | null> {
  if (supabaseConfigured()) {
    const { data, error } = await serviceClient().storage.from(BUCKET).createSignedUrl(objectPath, expiresInSec);
    if (error) return null;
    return data.signedUrl;
  }
  return `/admin/api/screenshot?path=${encodeURIComponent(objectPath)}`;
}

export async function readLocalScreenshot(objectPath: string): Promise<Buffer | null> {
  if (objectPath.includes("..")) return null;
  try {
    return await fs.readFile(path.join(LOCAL_DIR, objectPath));
  } catch {
    return null;
  }
}

export async function deleteScreenshot(objectPath: string): Promise<void> {
  if (supabaseConfigured()) {
    const { error } = await serviceClient().storage.from(BUCKET).remove([objectPath]);
    if (error) throw new Error(`Delete failed: ${error.message}`);
    return;
  }
  await fs.rm(path.join(LOCAL_DIR, objectPath), { force: true });
}
