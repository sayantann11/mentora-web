/**
 * Single source of truth for brand + contact details.
 * Anything marked TODO must be replaced with real, verified facts before launch.
 */
export const site = {
  name: "Mentora",
  legalName: "Mentora Student Mentorship", // TODO: replace with registered business name
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en-IN",
  tagline: "A personal mentor for your child's journey through school and life.",
  description:
    "1-on-1 online mentorship for school students in Classes 3–12 across India. Two private 30-minute video sessions a week to build confidence, habits, emotional intelligence and direction.",
  philosophy: "Listen without judging. Guide without controlling.",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@mentora.example", // TODO: real monitored inbox
  /** Digits only, with country code, e.g. 919876543210. */
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, ""),
  whatsappMessage: "Hi Mentora! I'd like to know more about 1-on-1 mentorship for my child.",
  city: "India (online)",
  /** Founding pilot batch size. Change it here only. */
  pilotSeats: 20,
  grievance: {
    name: "TODO: Grievance Officer name",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@mentora.example",
  },
  social: [] as string[], // TODO: add Instagram / LinkedIn profile URLs when they exist
} as const;

export function whatsappLink(message: string = site.whatsappMessage, number: string = site.whatsappNumber) {
  const text = encodeURIComponent(message);
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}

export const helplines = {
  teleManas: { name: "Tele-MANAS (Govt. of India, 24×7, free)", numbers: ["14416", "1-800-891-4416"] },
  emergency: { name: "National emergency number", numbers: ["112"] },
  childline: { name: "Childline (children in need of care and protection)", numbers: ["1098"] },
} as const;
