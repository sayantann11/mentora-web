import { ogCard, ogSize } from "@/lib/og";
import { getPost, posts } from "@/content/posts";

export const alt = "Mentora blog article";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  return ogCard({ title: post?.title ?? "The Mentora blog", kicker: "The Mentora blog · for parents" });
}
