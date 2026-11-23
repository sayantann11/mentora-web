export const sessionFlow = [
  { from: 0, to: 5, name: "Check-in", title: "Warm check-in", body: "How is the student today? Mood, energy and the week’s highlights." },
  { from: 5, to: 10, name: "Open conversation", title: "Open conversation", body: "The student brings up whatever matters most to them right now." },
  { from: 10, to: 18, name: "Deep dive", title: "Thoughtful deep dive", body: "Open, gentle questions to find the real issue behind the stress or hesitation." },
  { from: 18, to: 23, name: "Guidance", title: "Guidance, together", body: "Thinking through options side by side — the student decides; the mentor doesn’t lecture." },
  { from: 23, to: 27, name: "One action", title: "One practical action", body: "One small, realistic step to practise before the next session." },
  { from: 27, to: 30, name: "Wrap-up", title: "Reflection & wrap-up", body: "A quick confidence rating out of 10 and a clear plan for the next follow-up." },
] as const;

export const weeklySessions = [
  {
    id: "A",
    name: "Life & Mind",
    question: "“How are you doing?”",
    body: "A safe space to unpack the week — emotions, friendships, family, confidence, school problems, habits and stress.",
    points: ["Processing feelings without fear of judgement", "Untangling unhelpful thought loops", "Self-awareness and emotional balance"],
  },
  {
    id: "B",
    name: "Growth & Direction",
    question: "“How are you growing?”",
    body: "Forward momentum — study skills, goals, communication, discipline, career exploration, decision-making and resilience.",
    points: ["One small, practical habit goal each week", "Decisions, resilience and accountability", "Career curiosity and future clarity for older students"],
  },
] as const;

export const firstMonth = [
  { week: 1, name: "Know Me", body: "Building comfort and rapport. Personality, interests, strengths, challenges and how school feels right now." },
  { week: 2, name: "My World", body: "Academics, relationships, routines, screens, sleep — and any worries sitting under the surface." },
  { week: 3, name: "My Goals", body: "Choosing 2–3 personal development goals together, each with a small weekly action." },
  { week: 4, name: "Progress Review", body: "What changed, what was difficult and what comes next — followed by the first monthly parent update." },
] as const;

export const curriculum = [
  { n: 1, theme: "Self-awareness", question: "Who am I?", body: "Strengths, interests, values and the things that drain or energise me." },
  { n: 2, theme: "Emotional intelligence", question: "How do I understand my emotions?", body: "Naming feelings, noticing triggers and choosing a response instead of reacting." },
  { n: 3, theme: "Confidence", question: "How do I believe in myself?", body: "Evidence-based self-belief built from small wins, not empty praise." },
  { n: 4, theme: "Communication", question: "How do I express myself?", body: "Saying what I think and feel clearly and kindly — at home, at school and with friends." },
  { n: 5, theme: "Relationships", question: "How do I build healthy friendships?", body: "Trust, boundaries, conflict and recognising friendships that are good for me." },
  { n: 6, theme: "Discipline", question: "How do I act even when motivation is low?", body: "Routines, systems and tiny habits that survive a bad day." },
  { n: 7, theme: "Decision-making", question: "How do I choose well?", body: "A simple structure for weighing options, consequences and what matters to me." },
  { n: 8, theme: "Resilience", question: "How do I handle failure?", body: "Treating setbacks as information and getting back up without spiralling." },
  { n: 9, theme: "Direction", question: "What do I want to do with my life?", body: "Exploring interests, streams and careers with curiosity rather than pressure." },
  { n: 10, theme: "Responsibility", question: "Who do I want to become?", body: "Owning choices, keeping commitments and contributing to the people around me." },
] as const;

export const mentorPrinciples = [
  "Listen before solving",
  "Ask open questions instead of giving lectures",
  "Use follow-up questions to uncover the real problem",
  "Help the student create solutions rather than simply telling them what to do",
  "Remember previous conversations and follow up",
  "Make the student feel understood, not judged",
] as const;

export const problemModel = {
  steps: ["Situation", "Thought", "Feeling", "Behaviour", "Consequence"],
  example: ["Exam approaching", "“I’ll fail”", "Anxiety", "Avoids studying", "Falls further behind"],
} as const;

export const supportLayers = [
  { name: "Mentoring", who: "What Mentora provides", body: "Life skills, habits, confidence, decisions and growth through a steady 1-on-1 relationship." },
  { name: "Counselling", who: "Referral when needed", body: "Support for emotional, behavioural, academic or social difficulties that go beyond everyday growth." },
  { name: "Professional mental-health care", who: "Referral to qualified professionals", body: "Clinical or high-risk needs are handled by qualified professionals — never by a mentor." },
] as const;
