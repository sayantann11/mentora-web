import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Brand } from "@/components/ui/Brand";
import { currentAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-mist px-5">
      <div className="card w-full max-w-sm">
        <Brand href="/admin/login" />
        <h1 className="mt-6 font-display text-2xl font-medium">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted">We’ll email you a one-time sign-in link. Only approved admin emails can sign in.</p>
        {error && <p role="alert" className="field-error">That link was invalid or expired. Please request a new one.</p>}
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
