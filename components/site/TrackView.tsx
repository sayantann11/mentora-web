"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** Fires a single analytics event when the page mounts (consent-gated inside `track`). */
export function TrackView({ event, params }: { event: AnalyticsEvent; params?: Record<string, string | number> }) {
  useEffect(() => {
    track(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
