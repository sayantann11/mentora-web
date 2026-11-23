import type { TrackId } from "./programs";

export interface PostMeta {
  slug: string;
  title: string;
  /** ≤ 50 chars so "| Mentora" fits in 60. */
  seoTitle: string;
  description: string;
  date: string; // ISO
  readMinutes: number;
  tracks: TrackId[];
  tag: string;
}

/** Blog registry. Body lives in content/blog/<slug>.mdx. Newest first. */
export const posts: PostMeta[] = [
  {
    slug: "exam-stress-class-9-to-12",
    seoTitle: "Exam Stress in Class 9–12: A Parent’s Guide",
    title: "Exam stress in Classes 9–12: what helps (and what quietly makes it worse)",
    description: "A practical guide for parents of board-exam students: spotting stress early, the conversations that help, and how to build a calm study week.",
    date: "2026-11-18",
    readMinutes: 7,
    tracks: ["direction"],
    tag: "Exams",
  },
  {
    slug: "talk-to-a-child-who-wont-open-up",
    seoTitle: "How to Talk to a Child Who Won’t Open Up",
    title: "How to talk to a child who won’t open up",
    description: "Why “How was school?” gets a shrug, and seven small changes that make children more likely to talk — for every age from Class 3 to Class 12.",
    date: "2026-11-14",
    readMinutes: 6,
    tracks: ["foundation", "growth", "direction"],
    tag: "Communication",
  },
  {
    slug: "screen-time-habits-classes-6-8",
    seoTitle: "Screen Time for Classes 6–8: Rules That Stick",
    title: "Screen-time habits for Classes 6–8: building rules your child actually keeps",
    description: "Why bans backfire for pre-teens, what the phone is often helping them avoid, and a step-by-step way to co-create a screen plan.",
    date: "2026-11-10",
    readMinutes: 7,
    tracks: ["growth"],
    tag: "Habits",
  },
  {
    slug: "mentor-vs-tutor-vs-counsellor",
    seoTitle: "Mentor vs Tutor vs Counsellor: What to Choose",
    title: "Mentor, tutor or counsellor? What your child actually needs",
    description: "A plain-language comparison of tutors, mentors, counsellors and psychologists — what each does, what each doesn’t, and how to choose.",
    date: "2026-11-06",
    readMinutes: 6,
    tracks: ["foundation", "growth", "direction"],
    tag: "Guides",
  },
  {
    slug: "choosing-a-stream-after-class-10",
    seoTitle: "Choosing a Stream After Class 10, Calmly",
    title: "Helping your Class 10 child choose a stream without the pressure",
    description: "Science, Commerce or Humanities? A calm, step-by-step process for parents and teens to make the stream decision together.",
    date: "2026-11-02",
    readMinutes: 7,
    tracks: ["direction"],
    tag: "Career",
  },
  {
    slug: "building-confidence-classes-3-5",
    seoTitle: "Building Confidence in Classes 3–5",
    title: "Building real confidence in Classes 3–5",
    description: "Confidence isn’t built by praise alone. Everyday ways to help younger children speak up, handle losing and believe in themselves.",
    date: "2026-10-29",
    readMinutes: 6,
    tracks: ["foundation"],
    tag: "Confidence",
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}
