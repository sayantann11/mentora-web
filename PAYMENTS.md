# Payments — direct UPI (QR + UPI ID), manual verification

## Flow

```
Free intro session (lead) ──► coordinator sends /enroll?lead=<token> on WhatsApp
      │
      ▼
/enroll  → confirms details + consent → creates enrollment (awaiting_payment) + payment row
      │                                   reference MNT-YYMM-XXXX, secret access_token
      ▼
/pay/<access_token>  → server-generated UPI QR (amount + reference pre-filled), UPI ID + copy,
      │                payee name, "Pay with any UPI app" deep links, static-QR fallback
      ▼
"I've paid" form → payer name, 12-digit UTR, time, optional screenshot (≤3 MB, magic-byte checked,
      │            private bucket) → payment = submitted, enrollment = payment_submitted
      │            → parent "received, under verification" email + admin alert email
      ▼
/admin/payments → you check your bank/UPI statement → Verify (or Reject with reason)
      │   Verify: payment verified + receipt number, enrollment active, start date, renewal = +1 month,
      │           lead = enrolled, confirmation email with receipt link, WhatsApp template link
      │   Reject: UTR freed, enrollment back to awaiting_payment, polite email with the pay link
      ▼
Renewals: /admin/enrollments lists renewals due in 7 days → "Create next month + email" adds a new
payment row on the SAME /pay link → same verify loop.  Refunds: done in your UPI app, recorded in admin.
```

## Guarantees in code

- **Amount is server-side only** (`lib/pricing.ts`, paise). Nothing the browser sends can change it (tested).
- **UPI link:** `upi://pay?pa=<UPI_ID>&pn=<PAYEE>&am=2000.00&cu=INR&tn=<ref>&tr=<ref>` (`lib/payments/upi.ts`, tested). VPA format validated; all params percent-encoded.
- **A UTR can be claimed once** — DB unique constraint + pre-check; duplicate gives a friendly field error (tested).
- **No double-processing:** proof submission and verification are conditional updates on the current status; verifying twice is a no-op (tested).
- **No browsing other parents' pages:** `/pay/<token>` and `/receipt/<token>?p=<payment id>` need a 256-bit random token; the readable reference never unlocks anything; wrong tokens → 404 (tested and checked in the browser).
- **Screenshots:** validated by file signature (JPEG/PNG/WebP), stored in a private bucket, shown to admins only via 2-minute signed URLs (each view audited), deleted 30 days after verification by the cron job.
- **Rate limits:** proof submissions 8/hour/IP, uploads 6/hour/IP.
- **Analytics:** `submit_payment_proof` fires on the "submitted" page with value 2000 INR; no purchase event is sent from the browser.

## Honest limits

- **No webhook, no automatic confirmation.** Every payment must be checked by a human against the bank/UPI statement. Fine for a 10–20 student pilot; it won't scale.
- **No auto-debit.** Each month needs a new manual payment, so renewal reminders matter. Use the "Renewals due" list every few days.
- **Screenshots can be faked.** The admin UI forces a checkbox: *"I have seen ₹2,000 with UTR … credited in my bank/UPI statement."* Never verify from a screenshot alone.
- **Personal vs business UPI ID.** Banks and UPI apps can limit personal VPAs used for business collections. Use a business/merchant VPA if you can, and show the exact payee name. Some apps reject the `tr=` parameter on personal VPAs — if test payments fail, set `UPI_INCLUDE_TR=false`.
- **iOS deep links** (`upi://`) don't always open an app. The page explains this and offers copy-to-clipboard and the QR. Test on real Android and iPhone devices before launch.
- **Tax:** receipts are payment acknowledgements. Check GST registration and invoicing with an accountant; export the ledger from `/admin/payments` → *Export ledger (CSV)*.

## Adding a gateway later (e.g. Razorpay + UPI Autopay)

`lib/payments/provider.ts` defines `PaymentProvider` (`getInstructions`, `confirmation: "manual" | "webhook"`). A gateway implementation would:

1. Create an order/subscription server-side for `payment.amount_paise` and return a checkout URL or order id.
2. Add `app/api/webhooks/razorpay/route.ts` that verifies the HMAC signature, then calls the same domain transition as `verifyPayment` (idempotent on the gateway payment id — add a unique `gateway_payment_id` column).
3. Switch `paymentProvider()` to return the gateway provider; the `/pay` page renders a "Pay now" button instead of the QR block.

Enrollments, payments, receipts, renewals and the admin views stay the same.
