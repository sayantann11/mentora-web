import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

/** Shared branded Open Graph card (system fonts → no network fetch at build time). */
export function ogCard({ title, kicker = "1-on-1 mentorship · Classes 3–12" }: { title: string; kicker?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #f4eefb 0%, #fbf8f3 55%, #f6d9b7 100%)",
          color: "#221a30",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "#3f2d63", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 40 }}>m</div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
            mentora<span style={{ color: "#e9a23b" }}>.</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: title.length > 60 ? 58 : 70, lineHeight: 1.08, letterSpacing: -1.5, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#4a4157", fontFamily: "sans-serif" }}>
          <span>{kicker}</span>
          <span style={{ color: "#6a4ea3" }}>Listen without judging. Guide without controlling.</span>
        </div>
        <div style={{ position: "absolute", right: -80, top: -80, width: 380, height: 380, borderRadius: 999, background: "rgba(185,163,221,0.45)", display: "flex" }} />
      </div>
    ),
    ogSize,
  );
}
