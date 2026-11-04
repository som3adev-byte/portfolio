import { describe, expect, it } from "vitest";
import { SETS, beatOpacity, drawable, fetchWindow, frameAt, pickSet, timeline, type Beat } from "./film";
import { projects } from "@/content/projects";
import { existsSync } from "node:fs";

for (const set of Object.values(SETS)) {
  describe(`film set: ${set.name}`, () => {
    const t = timeline(set.steps);

    it("lands every beat on its anchor frame, and anchors are real files", () => {
      for (const [beat, frame] of Object.entries(set.anchors)) {
        const h = t.holds[beat as Beat];
        expect(frameAt(t, (h.start + h.end) / 2)).toBeCloseTo(frame);
        expect(drawable(set, frame)).toBe(frame);
        expect(existsSync(`public${set.folder}/${String(frame).padStart(3, "0")}.webp`)).toBe(true);
      }
      expect(existsSync(`public${set.folder}/${String(set.frames - 1).padStart(3, "0")}.webp`)).toBe(true);
    });

    it("moves only forward and ends on the last frame", () => {
      let last = -1;
      for (let y = 0; y <= t.total; y += 7) {
        const f = frameAt(t, y);
        expect(f).toBeGreaterThanOrEqual(last);
        last = f;
      }
      expect(last).toBe(set.frames - 1);
    });

    it("keeps the fetch window small, inside the set, and off broken frames", () => {
      for (const c of [0, 5, set.frames / 2, set.frames - 1]) {
        for (const dir of [1, -1] as const) {
          const w = fetchWindow(set, c, dir);
          expect(w.length).toBeLessThanOrEqual(set.ahead + set.behind + 1);
          expect(new Set(w).size).toBe(w.length);
          for (const i of w) {
            expect(i).toBeGreaterThanOrEqual(0);
            expect(i).toBeLessThan(set.frames);
            expect(drawable(set, i)).toBe(i);
          }
        }
      }
      expect(fetchWindow(set, 10, 1)[0]).toBe(10); // nearest first
    });
  });
}

describe("film shared rules", () => {
  it("never draws the broken frames of the big sets", () => {
    for (let f = 0; f < 187; f += 0.25) {
      const d = drawable(SETS.wide, f);
      expect(d < 32 || d > 38).toBe(true);
    }
  });

  it("picks a set per viewport", () => {
    expect(pickSet(1440, 900)?.name).toBe("wide");
    expect(pickSet(390, 844)?.name).toBe("phone");
    expect(pickSet(820, 1180)?.name).toBe("portrait");
    expect(pickSet(844, 390)).toBeNull(); // landscape phone: stills, no film
  });

  it("is ~0.6 as long on phones as on desktop", () => {
    const ratio = timeline(SETS.phone.steps).total / timeline(SETS.wide.steps).total;
    expect(ratio).toBeGreaterThan(0.55);
    expect(ratio).toBeLessThan(0.65);
  });

  it("shows text only around its hold", () => {
    const t = timeline(SETS.wide.steps);
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
