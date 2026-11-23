import { LifeBuoy } from "lucide-react";

export function SafetyDisclaimer({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  const strong = dark ? "text-white" : "text-ink";
  return (
    <div
      role="note"
      className={`flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed ${dark ? "border-white/15 bg-white/5 text-white/80" : "border-line bg-white text-ink-soft"}`}
    >
      <LifeBuoy aria-hidden size={20} className={`mt-0.5 shrink-0 ${dark ? "text-saffron" : "text-violet"}`} />
      <p className="m-0">
        <strong className={strong}>Mentora is life-skills mentorship — not therapy, diagnosis or emergency care.</strong> If a child is in
        danger or crisis, call <a href="tel:112" className={`font-semibold underline underline-offset-2 ${strong}`}>112</a> now. For free
        24×7 mental-health support, call Tele-MANAS on{" "}
        <a href="tel:14416" className="font-semibold underline underline-offset-2">14416</a> or{" "}
        <a href="tel:18008914416" className="font-semibold underline underline-offset-2">1-800-891-4416</a>. Childline (children in need of
        care and protection): <a href="tel:1098" className="font-semibold underline underline-offset-2">1098</a>.
      </p>
    </div>
  );
}
