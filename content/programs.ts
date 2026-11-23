export type TrackId = "foundation" | "growth" | "direction";

export interface Track {
  id: TrackId;
  slug: "classes-3-5" | "classes-6-8" | "classes-9-12";
  classGroup: "3-5" | "6-8" | "9-12";
  classes: string;
  name: string;
  ages: string;
  headline: string;
  summary: string;
  seoTitle: string;
  seoDescription: string;
  focus: string[];
  topics: { title: string; body: string }[];
  sampleConversations: { prompt: string; approach: string }[];
  parentConcerns: { q: string; a: string }[];
  /** Colours used by the 3D scene and accents for this track. */
  palette: { a: string; b: string; c: string; glow: string };
}

export const tracks: Track[] = [
  {
    id: "foundation",
    slug: "classes-3-5",
    classGroup: "3-5",
    classes: "Classes 3–5",
    name: "Foundation",
    ages: "Ages 8–11",
    headline: "Confidence, feelings and good little habits",
    summary:
      "At this age children are learning to name their feelings, handle small setbacks and build everyday routines. Mentors use stories, gentle questions and playful habit challenges — never lectures.",
    seoTitle: "Mentoring for Classes 3–5: Confidence & Habits",
    seoDescription:
      "1-on-1 online mentoring for children in Classes 3–5. Build confidence, express feelings calmly, make friends and form healthy habits — two 30-minute sessions a week.",
    focus: ["Confidence", "Communication", "Emotions", "Friendships", "Habits"],
    topics: [
      { title: "Dealing with losing", body: "What to do with the big feeling when you lose a game, a race or a quiz — and how to try again." },
      { title: "Making friends", body: "How to join in, how to be a good friend, and what to do when you feel left out at school." },
      { title: "Expressing anger calmly", body: "Naming the feeling, noticing it in the body, and finding words instead of shouting or sulking." },
      { title: "Keeping promises", body: "Small commitments — to a friend, a parent, or yourself — and how it feels to keep them." },
      { title: "Speaking up", body: "Raising a hand in class, asking for help, saying “no” politely. Confidence grows in tiny steps." },
      { title: "Little routines", body: "Getting ready for school, homework time, screen time and sleep — routines a child helps design." },
    ],
    sampleConversations: [
      {
        prompt: "“What do we do when we lose a game or feel left out at school?”",
        approach:
          "The mentor listens to what happened first. Together they name the feeling, think of one calming trick that works for this child, and plan what they might say or do next time.",
      },
      {
        prompt: "“My brother always gets to choose. It’s not fair.”",
        approach:
          "Instead of deciding who is right, the mentor helps the child explain how it feels and practise one sentence they can say at home — calmly — to ask for a turn.",
      },
    ],
    parentConcerns: [
      { q: "Isn’t my child too young for mentoring?", a: "Not at all. Sessions for Classes 3–5 are shorter in attention span and full of stories, drawing and simple games. The goal is a safe adult to talk to and small, fun habits — not serious “therapy-style” conversations." },
      { q: "Will they actually talk on a video call?", a: "Many children are shy at first. Week 1 is entirely about getting comfortable: favourite things, pets, games and school. Mentors never force a topic." },
      { q: "Do I need to sit with my child?", a: "Please stay nearby for the first session to help with the setup. After that, the child talks to the mentor privately in a quiet room at home, with the door open if you prefer." },
    ],
    palette: { a: "#f3b562", b: "#f6d9b7", c: "#e98a6b", glow: "#ffe2b0" },
  },
  {
    id: "growth",
    slug: "classes-6-8",
    classGroup: "6-8",
    classes: "Classes 6–8",
    name: "Growth",
    ages: "Ages 11–14",
    headline: "Self-esteem, peer pressure and screen discipline",
    summary:
      "Middle school brings a jump in academics, constant comparison and a lot of screen time. A mentor acts as a trusted older guide who listens without lecturing and helps the child build their own rules.",
    seoTitle: "Mentoring for Classes 6–8: Peer Pressure & Screens",
    seoDescription:
      "1-on-1 online mentoring for Classes 6–8. Help your child handle peer pressure, comparison and screen time, and build self-esteem and focus. Free intro session.",
    focus: ["Peer pressure", "Self-esteem", "Screen habits", "Academic pressure", "Communication"],
    topics: [
      { title: "Comparison", body: "Marks, looks, followers, friends. Learning to measure yourself against yesterday’s you, not your classmates." },
      { title: "Peer pressure", body: "Saying no without losing friends, and noticing when a group is not good for you." },
      { title: "Exclusion", body: "Group chats, lunch tables and being left out — how to cope, and who to talk to." },
      { title: "Screen time", body: "Spotting what scrolling helps you avoid, and designing a phone-free study block that actually sticks." },
      { title: "Confidence", body: "Trying new things, speaking in class, and handling mistakes without shutting down." },
      { title: "Talking to parents", body: "How to say what you feel at home honestly — and how to listen back." },
    ],
    sampleConversations: [
      {
        prompt: "“Why do I keep scrolling even when I know I have homework?”",
        approach:
          "The mentor helps the student notice the pattern — homework feels hard, the phone feels easy — and co-creates a realistic evening routine with one 30-minute phone-free block to try this week.",
      },
      {
        prompt: "“Everyone in my group got invited except me.”",
        approach:
          "No quick fixes. The mentor listens, helps the child separate what happened from what they are telling themselves about it, and explores friendships where they feel valued.",
      },
    ],
    parentConcerns: [
      { q: "My child won’t talk to me anymore. Will they talk to a mentor?", a: "Pre-teens often find it easier to open up to a trusted adult who isn’t a parent or teacher. The mentor doesn’t replace you — the monthly update gives you themes and practical ideas to reconnect at home." },
      { q: "Will the mentor take away their phone?", a: "No. Mentors don’t enforce rules. They help children understand their own habits and set their own small goals, which tend to last longer than rules imposed from outside." },
      { q: "Is this a replacement for tuition?", a: "No. Mentora does not teach school subjects. We work on study habits, focus and the stress around studies." },
    ],
    palette: { a: "#8f6fd0", b: "#c9b6ee", c: "#5fb3a6", glow: "#e6dbff" },
  },
  {
    id: "direction",
    slug: "classes-9-12",
    classGroup: "9-12",
    classes: "Classes 9–12",
    name: "Direction",
    ages: "Ages 14–18",
    headline: "Exam resilience, career clarity and big decisions",
    summary:
      "Board exams, stream selection and career expectations create real pressure. Mentors help teenagers manage stress, build self-discipline and work out who they want to become — on their own terms.",
    seoTitle: "Mentoring for Classes 9–12: Exams & Career Clarity",
    seoDescription:
      "1-on-1 online mentoring for Classes 9–12. Manage board exam stress, choose a stream with clarity, build discipline and make big decisions with confidence.",
    focus: ["Exams", "Career exploration", "Decision-making", "Productivity", "Independence"],
    topics: [
      { title: "Career choices", body: "Mapping strengths, interests and values before choosing a stream, a course or a path." },
      { title: "Academic pressure", body: "Board exams, entrance tests and the weight of expectations — and a plan for the week that feels doable." },
      { title: "Failure", body: "A bad result is information, not identity. Learning to bounce back without spiralling." },
      { title: "Independence", body: "Managing your own time, money and choices, and talking to parents as a young adult." },
      { title: "Major decisions", body: "A simple structure for thinking through big choices instead of being stuck or rushed." },
      { title: "Discipline when motivation is low", body: "Systems over willpower: small, consistent actions that survive a bad day." },
    ],
    sampleConversations: [
      {
        prompt: "“Everyone has an opinion on my career — how do I figure out what fits me?”",
        approach:
          "Through structured self-discovery exercises the student maps their strengths, interests and values, then picks one small research step for the week — like talking to someone in a field they’re curious about.",
      },
      {
        prompt: "“I studied all week and still did badly in the pre-board.”",
        approach:
          "The mentor walks through Situation → Thought → Feeling → Behaviour → Consequence to separate the result from the story (“I’m stupid”), then reviews how the week was actually spent and adjusts one thing.",
      },
    ],
    parentConcerns: [
      { q: "Is this career counselling?", a: "Career exploration is one part of the Direction track, but Mentora is broader: it is a steady relationship that also covers stress, discipline, decisions and independence. We don’t run aptitude tests or make admission promises." },
      { q: "My teenager is very private. What will I hear?", a: "You receive a monthly high-level update: themes worked on, positive developments and practical suggestions, plus a Green/Yellow/Red safety status. You don’t receive transcripts — that privacy is what lets teenagers be honest." },
      { q: "Board exams are close. Is it too late to start?", a: "No. Many students benefit most in the months before exams, when a calm weekly check-in helps them plan, rest and keep perspective." },
    ],
    palette: { a: "#4f3a86", b: "#9a86d6", c: "#e7a64a", glow: "#d9ccff" },
  },
];

export function getTrack(slug: string) {
  return tracks.find((t) => t.slug === slug);
}

export const focusAreas = [
  { value: "confidence", label: "Building confidence & self-esteem" },
  { value: "study_screens", label: "Study habits & screen discipline" },
  { value: "exam_stress", label: "Exam stress & emotional balance" },
  { value: "peers_communication", label: "Peer pressure & communication" },
  { value: "career", label: "Career & future direction" },
] as const;

export const classGroups = [
  { value: "3-5", label: "Classes 3–5 (Foundation)" },
  { value: "6-8", label: "Classes 6–8 (Growth)" },
  { value: "9-12", label: "Classes 9–12 (Direction)" },
] as const;
