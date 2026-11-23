import "server-only";
import { Resend } from "resend";
import { serverEnv } from "./env";
import { site, whatsappLink } from "@/content/site";
import { formatINR } from "./pricing";

let resend: Resend | null = null;

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

interface Mail {
  to: string;
  subject: string;
  /** Plain paragraphs; each is HTML-escaped. Use {link:{href,label}} for a button. */
  body: (string | { link: { href: string; label: string } })[];
  replyTo?: string;
}

function render(body: Mail["body"]) {
  const html = body
    .map((b) =>
      typeof b === "string"
        ? `<p style="margin:0 0 14px;line-height:1.6;color:#4a4157">${escapeHtml(b).replace(/\n/g, "<br/>")}</p>`
        : `<p style="margin:22px 0"><a href="${escapeHtml(b.link.href)}" style="background:#3f2d63;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">${escapeHtml(b.link.label)}</a></p>`,
    )
    .join("");
  const text = body.map((b) => (typeof b === "string" ? b : `${b.link.label}: ${b.link.href}`)).join("\n\n");
  return {
    html: `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px"><p style="font:700 22px Georgia,serif;color:#221a30;margin:0 0 20px">mentora<span style="color:#e9a23b">.</span></p>${html}<hr style="border:none;border-top:1px solid #e6dfec;margin:24px 0"/><p style="font-size:12px;color:#675f73;line-height:1.5">${escapeHtml(site.legalName)} · ${escapeHtml(site.url)}<br/>Mentora is life-skills mentorship, not therapy or emergency care. In an emergency call 112. Tele-MANAS (24×7, free): 14416.</p></div>`,
    text,
  };
}

/** Sends an email via Resend. Without an API key (local dev) it logs instead of sending. Never throws. */
export async function sendEmail(mail: Mail): Promise<boolean> {
  const { resendApiKey, emailFrom } = serverEnv();
  const { html, text } = render(mail.body);
  if (!resendApiKey) {
    console.info(`[email:dev] to=${mail.to} subject="${mail.subject}"\n${text}\n`);
    return true;
  }
  try {
    resend ??= new Resend(resendApiKey);
    const { error } = await resend.emails.send({ from: emailFrom, to: mail.to, subject: mail.subject, html, text, replyTo: mail.replyTo ?? site.email });
    if (error) {
      console.error("[email] send failed", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] send threw", e);
    return false;
  }
}

async function notifyAdmin(subject: string, body: Mail["body"]) {
  const { adminNotifyEmail } = serverEnv();
  if (!adminNotifyEmail) return;
  await sendEmail({ to: adminNotifyEmail, subject: `[Mentora] ${subject}`, body });
}

// ───────────── templates ─────────────

export const emails = {
  trialConfirmation: (to: string, parentName: string, childFirstName: string) =>
    sendEmail({
      to,
      subject: "We’ve received your request for a free intro session",
      body: [
        `Hi ${parentName},`,
        `Thank you for reaching out to Mentora. We’ve received your request for a free introductory session for ${childFirstName}.`,
        "Our coordinator will message you on WhatsApp within 24 hours to find a time that suits you. The session is free and there’s no obligation to continue.",
        "If you have any questions in the meantime, just reply to this email.",
        { link: { href: whatsappLink(), label: "Chat with us on WhatsApp" } },
        "Warmly,\nThe Mentora team",
      ],
    }),

  newLeadAlert: (lead: { parent_name: string; phone_e164: string; class_group: string; focus_area: string | null; utm_source: string | null }, adminUrl: string) =>
    notifyAdmin(`New intro request — Classes ${lead.class_group}`, [
      `Parent: ${lead.parent_name}`,
      `WhatsApp: ${lead.phone_e164}`,
      `Class group: ${lead.class_group} · Focus: ${lead.focus_area ?? "—"} · Source: ${lead.utm_source ?? "direct"}`,
      { link: { href: adminUrl, label: "Open in admin" } },
    ]),

  proofReceived: (to: string, parentName: string, reference: string, amountPaise: number) =>
    sendEmail({
      to,
      subject: `Payment details received — ${reference}`,
      body: [
        `Hi ${parentName},`,
        `We’ve received your payment details for reference ${reference} (${formatINR(amountPaise)}). Your payment is now under verification.`,
        "We check every payment against our UPI statement, usually within a few hours during the day. You’ll get a confirmation email as soon as it’s verified.",
        "Please don’t pay again for this reference. If anything looks wrong, reply to this email or message us on WhatsApp.",
        "The Mentora team",
      ],
    }),

  proofAlert: (reference: string, utr: string, amountPaise: number, adminUrl: string) =>
    notifyAdmin(`Payment to verify — ${reference}`, [
      `Reference: ${reference}`,
      `UTR: ${utr}`,
      `Amount expected: ${formatINR(amountPaise)}`,
      "Check your bank / UPI statement before verifying.",
      { link: { href: adminUrl, label: "Open the verification queue" } },
    ]),

  paymentVerified: (to: string, parentName: string, reference: string, amountPaise: number, receiptUrl: string, startDate: string, renewalDate: string) =>
    sendEmail({
      to,
      subject: `Payment confirmed — welcome to Mentora (${reference})`,
      body: [
        `Hi ${parentName},`,
        `We’ve verified your UPI payment of ${formatINR(amountPaise)} for reference ${reference}. Thank you!`,
        `Your current month runs from ${startDate}. Your next renewal is due on ${renewalDate} — we’ll send a reminder a few days before. There’s no auto-debit.`,
        "Our coordinator will confirm your child’s session slots and mentor on WhatsApp.",
        { link: { href: receiptUrl, label: "View / print your receipt" } },
        "The Mentora team",
      ],
    }),

  paymentRejected: (to: string, parentName: string, reference: string, reason: string, payUrl: string) =>
    sendEmail({
      to,
      subject: `We couldn’t confirm your payment — ${reference}`,
      body: [
        `Hi ${parentName},`,
        `We weren’t able to match your payment for reference ${reference} with our UPI statement.`,
        `Reason: ${reason}`,
        "This is often a typo in the transaction ID. Please double-check the 12-digit UTR in your UPI app and submit it again, or reply to this email and we’ll sort it out together.",
        { link: { href: payUrl, label: "Re-check payment details" } },
        "The Mentora team",
      ],
    }),

  renewalReminder: (to: string, parentName: string, childFirstName: string, renewalDate: string, payUrl: string, amountPaise: number) =>
    sendEmail({
      to,
      subject: `Mentora renewal for ${childFirstName} — due ${renewalDate}`,
      body: [
        `Hi ${parentName},`,
        `${childFirstName}’s current mentorship month ends on ${renewalDate}. To continue without a break, please pay ${formatINR(amountPaise)} by UPI using your personal link below.`,
        "If you’d prefer to pause or stop, simply reply to this email — there’s no lock-in.",
        { link: { href: payUrl, label: "Pay for next month" } },
        "The Mentora team",
      ],
    }),

  schoolAlert: (school: string, city: string, students: number) =>
    notifyAdmin(`School enquiry — ${school}, ${city}`, [`${school} (${city}) is enquiring about ~${students} students.`, "Open the admin dashboard to respond."]),

  guide: (to: string, guideUrl: string) =>
    sendEmail({
      to,
      subject: "Your free guide: 5 conversations to have with your child this week",
      body: [
        "Hi,",
        "Thank you for downloading our free guide. It’s short, practical, and designed to be used this week.",
        { link: { href: guideUrl, label: "Read the guide" } },
        "If you ever want to talk about mentoring for your child, just reply to this email.",
        "The Mentora team",
      ],
    }),
};
