// The desk film: scroll position in, frame index out. Pure, so it is tested on its own.

export type Beat = "hero" | "about" | "work" | "contact";

/** A stretch of scroll. A hold stays on one frame; a move runs from one frame to another. */
type Step = { hold: Beat; px: number } | { from: number; to: number; px: number };

export const FRAME_COUNT = 187; // every other frame of the 373-frame source
export const ANCHOR: Record<Beat, number> = { hero: 0, about: 60, work: 128, contact: 186 };

/** Frames 32-38 are a generation fault in the source clip: the desk dissolves. Never draw them. */
const BROKEN = [32, 38] as const;

// Moves run at roughly 30px of scroll per frame. Two stretches run faster: the broken one
// (stepped straight over) and the camera's pull-back past a wide view the hero already showed.
export const STEPS: Step[] = [
  { hold: "hero", px: 400 },
  { from: 0, to: 31, px: 930 },
  { from: 31, to: 39, px: 40 },
  { from: 39, to: 60, px: 630 },
  { hold: "about", px: 600 },
  { from: 60, to: 64, px: 105 },
  { from: 64, to: 76, px: 250 },
  { from: 76, to: 108, px: 570 },
  { from: 108, to: 128, px: 615 },
  { hold: "work", px: 900 },
  { from: 128, to: 186, px: 1740 },
  { hold: "contact", px: 500 },
];

export type Timeline = {
  total: number;
  holds: Record<Beat, { start: number; end: number }>;
  moves: { start: number; end: number; from: number; to: number }[];
};

export function timeline(steps: Step[] = STEPS): Timeline {
  let at = 0;
  const holds = {} as Timeline["holds"];
  const moves: Timeline["moves"] = [];
  for (const s of steps) {
    if ("hold" in s) holds[s.hold] = { start: at, end: at + s.px };
    else moves.push({ start: at, end: at + s.px, from: s.from, to: s.to });
    at += s.px;
  }
  return { total: at, holds, moves };
}

export function frameAt(t: Timeline, y: number): number {
  for (const m of t.moves) {
    if (y < m.start) return m.from;
    if (y <= m.end) return m.from + ((y - m.start) / (m.end - m.start)) * (m.to - m.from);
  }
  return t.moves.at(-1)?.to ?? 0;
}

/** The frame actually drawn for a (possibly fractional) frame position. */
export function drawable(f: number): number {
  const i = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(f)));
  if (i < BROKEN[0] || i > BROKEN[1]) return i;
  return f < (BROKEN[0] + BROKEN[1]) / 2 ? BROKEN[0] - 1 : BROKEN[1] + 1;
}

/** 1 inside a beat's hold, fading to 0 over `fade` px either side. */
export function beatOpacity(t: Timeline, beat: Beat, y: number, fade = 160): number {
  const { start, end } = t.holds[beat];
  // The first beat is fully shown at the top and the last stays shown at the end.
  const before = beat === "hero" ? 1 : (y - (start - fade)) / fade;
  const after = beat === "contact" ? 1 : (end + fade - y) / fade;
  return Math.max(0, Math.min(1, before, after));
}
