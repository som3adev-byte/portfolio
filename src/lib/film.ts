// The desk film: scroll position in, frame index out. Pure, so it is tested on its own.
// "Source" frames are the 373-frame clip; "shipped" frames are the indices inside one set.

export type Beat = "hero" | "about" | "work" | "contact";

/** A stretch of scroll. A hold stays on one frame; a move runs from one frame to another. */
type Step = { hold: Beat; px: number } | { from: number; to: number; px: number };

export type FilmSet = {
  name: "wide" | "portrait" | "phone";
  folder: string;
  frames: number;
  width: number;
  height: number;
  anchors: Record<Beat, number>;
  /** Shipped frames never drawn: a generation fault where the desk dissolves. */
  broken?: readonly [number, number];
  steps: Step[];
  /** Frames to keep loaded ahead of / behind the camera. */
  ahead: number;
  behind: number;
};

// Desktop and tablets: every other source frame (187). Moves run at ~30px per frame; two
// stretches run faster: the broken one (stepped straight over) and the pull-back past a wide
// view the hero already showed.
const BIG_STEPS: Step[] = [
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

const BIG = { frames: 187, anchors: { hero: 0, about: 60, work: 128, contact: 186 }, broken: [32, 38] as const, steps: BIG_STEPS };

export const SETS: Record<FilmSet["name"], FilmSet> = {
  wide: { name: "wide", folder: "/film/16x9", width: 1924, height: 1076, ahead: 48, behind: 12, ...BIG },
  portrait: { name: "portrait", folder: "/film/9x16", width: 1076, height: 1924, ahead: 24, behind: 6, ...BIG },
  // Phones: 720px wide, every third source frame plus the anchors, without the broken stretch
  // (so nothing to skip), on a timeline 0.6 the length of the desktop one.
  phone: {
    name: "phone",
    folder: "/film/phone",
    frames: 121,
    width: 720,
    height: 1288,
    anchors: { hero: 0, about: 35, work: 81, contact: 120 },
    ahead: 24,
    behind: 6,
    steps: [
      { hold: "hero", px: 240 },
      { from: 0, to: 20, px: 558 },
      { from: 20, to: 21, px: 24 },
      { from: 21, to: 35, px: 378 },
      { hold: "about", px: 360 },
      { from: 35, to: 37, px: 63 },
      { from: 37, to: 46, px: 150 },
      { from: 46, to: 67, px: 342 },
      { from: 67, to: 81, px: 369 },
      { hold: "work", px: 540 },
      { from: 81, to: 120, px: 1044 },
      { hold: "contact", px: 300 },
    ],
  },
};

/** Which set a viewport gets, or null for no film (landscape phones). */
export function pickSet(width: number, height: number): FilmSet | null {
  if (width > height) return height <= 500 ? null : SETS.wide;
  return width <= 600 ? SETS.phone : SETS.portrait;
}

export type Timeline = {
  total: number;
  holds: Record<Beat, { start: number; end: number }>;
  moves: { start: number; end: number; from: number; to: number }[];
};

export function timeline(steps: Step[]): Timeline {
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
export function drawable(set: FilmSet, f: number): number {
  const i = Math.min(set.frames - 1, Math.max(0, Math.round(f)));
  if (!set.broken || i < set.broken[0] || i > set.broken[1]) return i;
  return f < (set.broken[0] + set.broken[1]) / 2 ? set.broken[0] - 1 : set.broken[1] + 1;
}

/** Shipped frames to have loaded around the camera, nearest first, in scroll direction. */
export function fetchWindow(set: FilmSet, centre: number, direction: 1 | -1): number[] {
  const c = Math.min(set.frames - 1, Math.max(0, Math.round(centre)));
  const out = [c];
  for (let d = 1; d <= Math.max(set.ahead, set.behind); d++) {
    if (d <= set.ahead) out.push(c + d * direction);
    if (d <= set.behind) out.push(c - d * direction);
  }
  return out.filter((i) => i >= 0 && i < set.frames && drawable(set, i) === i);
}

/** 1 inside a beat's hold, fading to 0 over `fade` px either side. */
export function beatOpacity(t: Timeline, beat: Beat, y: number, fade = 160): number {
  const { start, end } = t.holds[beat];
  // The first beat is fully shown at the top and the last stays shown at the end.
  const before = beat === "hero" ? 1 : (y - (start - fade)) / fade;
  const after = beat === "contact" ? 1 : (end + fade - y) / fade;
  return Math.max(0, Math.min(1, before, after));
}
