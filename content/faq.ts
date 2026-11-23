import { claimCopy } from "./claims";
import { site } from "./site";

export interface Faq {
  q: string;
  a: string;
}

export const coreFaqs: Faq[] = [
  {
    q: "Is Mentora tuition or therapy?",
    a: "Neither. Mentora is structured life-skills and personal-development mentorship. Unlike tuition, we don’t teach school subjects. Unlike therapy, we don’t diagnose or treat anything — we focus on everyday growth: confidence, habits, communication, exam mindset and direction. If a student needs specialised support, we help the family find a qualified professional.",
  },
  {
    q: "What if my child is shy and doesn’t open up easily?",
    a: "That’s completely normal, and many children start out quiet. Mentors are trained never to force or interrogate. Week 1 (“Know Me”) is about light, familiar topics — interests, games, school — until your child feels comfortable.",
  },
  {
    q: "Will I know what my child discusses in sessions?",
    a: `Private conversation details stay between the mentor and the student — that is what makes honesty possible. You receive a monthly high-level update covering themes worked on, positive developments, the next focus and practical ways to help at home, with a Green/Yellow/Red safety status. ${claimCopy.alerts}.`,
  },
  {
    q: "How are sessions scheduled?",
    a: "Two 30-minute video sessions a week, usually on weekday evenings or weekends, planned around school and tuition. We agree fixed slots after the free intro session so the routine stays predictable.",
  },
  {
    q: "What does it cost, and is there a lock-in?",
    a: `During the founding pilot it’s ₹2,000 a month for 8 private sessions — ₹250 per session. You pay month to month by UPI. There’s no lock-in and no auto-debit; if it isn’t working for your child, simply don’t renew.`,
  },
  {
    q: "Who are the mentors?",
    a: `${claimCopy.mentors}. Mentors follow a structured session framework, a code of conduct and a safeguarding protocol. You can meet your child’s mentor in the free intro session before deciding.`,
  },
  {
    q: "What do we need for a session?",
    a: "A phone, tablet or laptop with a stable internet connection, a quiet space and headphones if possible. We send the video link before each session.",
  },
  {
    q: `Why is the pilot limited to ${site.pilotSeats} students?`,
    a: "We are deliberately starting small so every family gets careful mentor matching and personal attention while we refine the programme. We’d rather do this well for a few students than average for many.",
  },
];

export const pricingFaqs: Faq[] = [
  {
    q: "How do I pay?",
    a: "By UPI, using any app (Google Pay, PhonePe, Paytm, BHIM or your bank app). After the free intro session we send you a personal payment link that shows a QR code, our UPI ID, the amount and your reference code. After paying, you enter the UPI transaction ID (UTR) on the same page and we confirm within a few hours.",
  },
  {
    q: "Is there auto-debit?",
    a: "No. Each month you pay manually when we send the renewal reminder. That means you are always in control, and you can stop at any time.",
  },
  {
    q: "What happens if we miss a session?",
    a: "Let us know at least 12 hours in advance and we will try to reschedule within the same week. Sessions missed without notice may not be rescheduled. The full rescheduling and refund rules are on the refund policy page.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes, under our refund policy. For example, if you decide to stop after the first paid session in your first month, we refund the unused sessions back to the UPI account you paid from. Refunds are sent within 7 working days.",
  },
  {
    q: "What is NOT included?",
    a: "Mentora is not tuition, homework help, therapy, diagnosis or emergency support. We don’t run psychometric tests or guarantee marks or admissions.",
  },
];
