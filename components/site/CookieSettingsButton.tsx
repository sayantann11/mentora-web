"use client";

export function CookieSettingsButton() {
  return (
    <button type="button" className="text-left hover:text-white" onClick={() => window.dispatchEvent(new Event("mentora:open-consent"))}>
      Cookie settings
    </button>
  );
}
