import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { tracks } from "@/content/programs";
import { posts } from "@/content/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["/", 1, "weekly"],
    ["/how-it-works", 0.9, "monthly"],
    ["/programs", 0.9, "monthly"],
    ["/pricing", 0.9, "monthly"],
    ["/book-trial", 0.9, "monthly"],
    ["/curriculum", 0.7, "monthly"],
    ["/safety", 0.8, "monthly"],
    ["/for-parents", 0.8, "monthly"],
    ["/for-schools", 0.6, "monthly"],
    ["/about", 0.6, "monthly"],
    ["/blog", 0.7, "weekly"],
    ["/guide", 0.5, "monthly"],
    ["/guide/five-conversations", 0.5, "monthly"],
    ["/contact", 0.5, "yearly"],
    ["/privacy", 0.3, "yearly"],
    ["/terms", 0.3, "yearly"],
    ["/refund-policy", 0.3, "yearly"],
  ];
  return [
    ...staticPages.map(([path, priority, changeFrequency]) => ({ url: `${site.url}${path}`, lastModified: now, priority, changeFrequency })),
    ...tracks.map((t) => ({ url: `${site.url}/programs/${t.slug}`, lastModified: now, priority: 0.85, changeFrequency: "monthly" as const })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: new Date(p.date), priority: 0.6, changeFrequency: "yearly" as const })),
  ];
}
