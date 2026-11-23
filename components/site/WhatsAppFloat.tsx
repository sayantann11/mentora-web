import { WhatsAppIcon, WhatsAppLink } from "./WhatsAppLink";

export function WhatsAppFloat() {
  return (
    <WhatsAppLink
      location="floating"
      ariaLabel="Chat with Mentora on WhatsApp (opens in a new tab)"
      className="fixed right-4 bottom-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#1a7f45] text-white shadow-[0_12px_30px_-8px_rgb(31_143_78/0.6)] transition hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon size={28} />
    </WhatsAppLink>
  );
}
