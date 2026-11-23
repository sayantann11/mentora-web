import { ogCard, ogSize } from "@/lib/og";

export const alt = "Mentora — a personal mentor for your child’s journey through school and life";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogCard({ title: "A personal mentor for your child’s journey through school and life." });
}
