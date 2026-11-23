"use client";

import type { TrackId } from "@/content/programs";

/**
 * Tiny mutable store shared by the DOM and the 3D scene.
 * The scene READS it every frame (no React state inside useFrame);
 * DOM code WRITES it on scroll / pointer / selector change.
 */
export const sceneState = {
  /** 0 → top of page, 1 → end of the storytelling sections. */
  progress: 0,
  /** Index of the story station currently in view (0 hero … 4 first month). */
  station: 0,
  pointerX: 0,
  pointerY: 0,
  track: "growth" as TrackId,
};

type Listener = () => void;
const listeners = new Set<Listener>();

export function setTrack(track: TrackId) {
  sceneState.track = track;
  listeners.forEach((l) => l());
}

export function onSceneChange(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
