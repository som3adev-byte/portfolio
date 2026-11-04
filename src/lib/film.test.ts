import { describe, expect, it } from "vitest";
import { ANCHOR, FRAME_COUNT, STEPS, beatOpacity, drawable, frameAt, timeline } from "./film";
import { projects } from "@/content/projects";

const t = timeline();

describe("film timeline", () => {
  it("lands every beat on its anchor frame", () => {
    for (const [beat, frame] of Object.entries(ANCHOR)) {
      const h = t.holds[beat as keyof typeof ANCHOR];
      expect(frameAt(t, h.start)).toBeCloseTo(frame);
      expect(frameAt(t, (h.start + h.end) / 2)).toBeCloseTo(frame);
    }
  });

  it("moves are continuous and only go forward", () => {
    let last = -1;
    for (let y = 0; y <= t.total; y += 7) {
      const f = frameAt(t, y);
      expect(f).toBeGreaterThanOrEqual(last);
      last = f;
    }
    expect(last).toBe(FRAME_COUNT - 1);
  });

  it("totals the step lengths", () => {
    expect(t.total).toBe(STEPS.reduce((n, s) => n + s.px, 0));
  });

  it("never draws the broken frames", () => {
    for (let f = 0; f < FRAME_COUNT; f += 0.25) {
      const d = drawable(f);
      expect(d < 32 || d > 38).toBe(true);
    }
    expect(drawable(-5)).toBe(0);
    expect(drawable(999)).toBe(FRAME_COUNT - 1);
  });

  it("shows text only around its hold", () => {
    expect(beatOpacity(t, "hero", 0)).toBe(1);
    expect(beatOpacity(t, "about", t.holds.about.start + 10)).toBe(1);
    expect(beatOpacity(t, "about", 0)).toBe(0);
    expect(beatOpacity(t, "contact", t.total + 500)).toBe(1);
  });
});

describe("projects content", () => {
  it("has unique slugs and complete entries", () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
    for (const p of projects) {
      expect(p.title && p.summary && p.line && p.sections.length).toBeTruthy();
      // Private work shows no repo link; public work needs one.
      expect(Boolean(p.repo) !== Boolean(p.closed)).toBe(true);
    }
  });
});
