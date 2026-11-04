"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { FRAME_COUNT, beatOpacity, drawable, frameAt, timeline, type Beat } from "@/lib/film";

const FETCH_AT_ONCE = 6;
const DECODE_BEHIND = 4;
const DECODE_AHEAD = 10;
const KEEP_DECODED = 24; // ± frames kept as bitmaps; each one is a full-screen image in memory
const EASE_MS = 60;

/**
 * The desk film. Children are the four beats, server-rendered and readable without it.
 * Without JavaScript or with reduced motion, the beats are ordinary sections over still frames.
 */
export function Film({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const film = root.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx || typeof createImageBitmap !== "function") return;

    const t = timeline();
    const beats = [...film.querySelectorAll<HTMLElement>("[data-beat]")];
    const shown = new Map<HTMLElement, number>();
    const portrait = matchMedia("(orientation: portrait)");
    document.documentElement.classList.add("film-on");
    film.style.setProperty("--film-scroll", `${t.total}px`);

    let aspect = "";
    let abort = new AbortController();
    let blobs = new Map<number, Blob>();
    let bitmaps = new Map<number, ImageBitmap>();
    const fetching = new Set<number>();
    const decoding = new Set<number>();
    let size = { w: 0, h: 0, dw: 0, dh: 0, dx: 0, dy: 0 };
    let target = 0;
    let current = 0;
    let drawn = -1;
    let last = performance.now();
    let raf = 0;

    const scrollY = () => Math.min(t.total, Math.max(0, window.scrollY - film.offsetTop));

    function reset() {
      abort.abort();
      abort = new AbortController();
      bitmaps.forEach((b) => b.close());
      bitmaps = new Map();
      decoding.clear();
      drawn = -1;
    }

    function resize() {
      // Phones resize the viewport as the URL bar slides; that is not worth re-decoding for.
      const sameWidth = canvas.width === Math.round(innerWidth * Math.min(devicePixelRatio || 1, 1.5));
      if (aspect && sameWidth && Math.abs(innerHeight * Math.min(devicePixelRatio || 1, 1.5) - canvas.height) < canvas.height * 0.2) return;
      const nextAspect = portrait.matches ? "9x16" : "16x9";
      if (nextAspect !== aspect) {
        reset();
        blobs = new Map();
        fetching.clear();
        aspect = nextAspect;
      } else reset();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(innerWidth * dpr);
      const h = Math.round(innerHeight * dpr);
      const [fw, fh] = aspect === "9x16" ? [1076, 1924] : [1924, 1076];
      const scale = Math.max(w / fw, h / fh);
      const dw = Math.round(fw * scale);
      const dh = Math.round(fh * scale);
      size = { w, h, dw, dh, dx: Math.round((w - dw) / 2), dy: Math.round((h - dh) / 2) };
      canvas.width = w;
      canvas.height = h;
      pump();
    }

    // Fetch the nearest missing frame to where the camera is heading, a few at a time.
    function pump() {
      const centre = Math.round(target);
      for (let d = 0; fetching.size < FETCH_AT_ONCE && d < FRAME_COUNT; d++) {
        for (const i of [centre + d, centre - d]) {
          if (i < 0 || i >= FRAME_COUNT || blobs.has(i) || fetching.has(i)) continue;
          if (fetching.size >= FETCH_AT_ONCE) break;
          fetching.add(i);
          const forAspect = aspect;
          fetch(`/film/${aspect}/${String(i).padStart(3, "0")}.webp`, { signal: abort.signal })
            .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
            .then((b) => forAspect === aspect && blobs.set(i, b))
            .catch(() => {})
            .finally(() => {
              fetching.delete(i);
              pump();
            });
        }
      }
    }

    function decodeAround(f: number) {
      for (let i = f - DECODE_BEHIND; i <= f + DECODE_AHEAD; i++) {
        const blob = blobs.get(i);
        if (!blob || bitmaps.has(i) || decoding.has(i)) continue;
        decoding.add(i);
        const { signal } = abort;
        createImageBitmap(blob, { resizeWidth: size.dw, resizeHeight: size.dh, resizeQuality: "medium" })
          .then((b) => (signal.aborted ? b.close() : bitmaps.set(i, b)))
          .catch(() => {})
          .finally(() => decoding.delete(i));
      }
      for (const [i, b] of bitmaps) {
        if (Math.abs(i - f) > KEEP_DECODED) {
          b.close();
          bitmaps.delete(i);
        }
      }
    }

    function nearestDecoded(f: number) {
      for (let d = 0; d <= KEEP_DECODED; d++) {
        if (bitmaps.has(f - d)) return f - d;
        if (bitmaps.has(f + d)) return f + d;
      }
      return -1;
    }

    function tick(now: number) {
      const dt = Math.min(50, now - last);
      last = now;
      const y = scrollY();
      const nextTarget = frameAt(t, y);
      if (Math.round(nextTarget) !== Math.round(target)) {
        target = nextTarget;
        pump();
      }
      current += (target - current) * (1 - Math.exp(-dt / EASE_MS));
      if (Math.abs(target - current) < 0.01) current = target;

      const f = drawable(current);
      decodeAround(f);
      const show = nearestDecoded(f);
      if (show !== -1 && show !== drawn) {
        ctx!.drawImage(bitmaps.get(show)!, size.dx, size.dy);
        drawn = show;
        film.dataset.painted = "";
      }

      for (const el of beats) {
        const o = Math.round(beatOpacity(t, el.dataset.beat as Beat, y) * 100) / 100;
        if (shown.get(el) === o) continue;
        shown.set(el, o);
        el.style.opacity = String(o);
        el.style.pointerEvents = o < 0.5 ? "none" : "";
      }
      raf = requestAnimationFrame(tick);
    }

    // Tabbing into a beat that is off screen scrolls the camera to it.
    function onFocus(e: FocusEvent) {
      const beat = (e.target as HTMLElement).closest<HTMLElement>("[data-beat]");
      if (!beat || shown.get(beat) === 1) return;
      window.scrollTo({ top: film.offsetTop + t.holds[beat.dataset.beat as Beat].start + 1 });
    }

    resize();
    raf = requestAnimationFrame(tick);
    addEventListener("resize", resize);
    film.addEventListener("focusin", onFocus);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      film.removeEventListener("focusin", onFocus);
      reset();
      document.documentElement.classList.remove("film-on");
    };
  }, []);

  return (
    <div ref={root} className="film">
      <div className="film-stage">
        <canvas ref={canvasRef} aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
