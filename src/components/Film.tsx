"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { beatOpacity, drawable, fetchWindow, frameAt, pickSet, timeline, type Beat } from "@/lib/film";

const FETCH_AT_ONCE = 6;
const DECODE_BEHIND = 4;
const DECODE_AHEAD = 10;
const KEEP_DECODED = 24; // ± frames kept as bitmaps; each one is a full-screen image in memory
const EASE_MS = 60;
const IDLE_PREFETCH_MS = 1500;
const IDLE_PREFETCH_FRAMES = 8;

type Connection = { saveData?: boolean; effectiveType?: string };

/** Data saver or a slow link: show the stills instead. Chromium only; other browsers rely on the windowed loader. */
function slowNetwork() {
  const c = (navigator as Navigator & { connection?: Connection }).connection;
  return Boolean(c?.saveData || /(^|-)2g$|^3g$/.test(c?.effectiveType ?? ""));
}

/**
 * The desk film. Children are the four beats, server-rendered and readable without it.
 * Without JavaScript, with reduced motion, on a slow link or a landscape phone, the beats are
 * ordinary sections over still frames.
 */
export function Film({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || slowNetwork()) return;
    // The set is chosen once at load; rotating mid-visit keeps it and just redraws to fit.
    const set = pickSet(innerWidth, innerHeight);
    const film = root.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!set || !ctx || typeof createImageBitmap !== "function") return;

    const t = timeline(set.steps);
    const beats = [...film.querySelectorAll<HTMLElement>("[data-beat]")];
    const shown = new Map<HTMLElement, number>();
    const html = document.documentElement;
    html.classList.add("film-on");
    html.dataset.filmSet = set.name;
    film.style.setProperty("--film-scroll", `${t.total}px`);

    const blobs = new Map<number, Blob>();
    const fetching = new Map<number, AbortController>();
    let bitmaps = new Map<number, ImageBitmap>();
    const decoding = new Set<number>();
    let decodeAbort = new AbortController();
    let size = { w: 0, h: 0, dw: 0, dh: 0, dx: 0, dy: 0 };
    let wanted: number[] = [0];
    let scrolled = false;
    let target = 0;
    let current = 0;
    let lastY = 0;
    let direction: 1 | -1 = 1;
    let drawn = -1;
    let past = false;
    let last = performance.now();
    let raf = 0;

    const scrollY = () => Math.min(t.total, Math.max(0, window.scrollY - film.offsetTop));
    const url = (i: number) => `${set.folder}/${String(i).padStart(3, "0")}.webp`;

    function dropBitmaps() {
      decodeAbort.abort();
      decodeAbort = new AbortController();
      bitmaps.forEach((b) => b.close());
      bitmaps = new Map();
      decoding.clear();
      drawn = -1;
    }

    function resize() {
      // Phones resize the viewport as the URL bar slides; that is not worth re-decoding for.
      // Canvas resolution: up to 1.5 dpr, but never more pixels than the frame has, so a
      // frame is only ever scaled down on the canvas.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5, Math.min(set!.width / innerWidth, set!.height / innerHeight));
      const w = Math.round(innerWidth * dpr);
      const h = Math.round(innerHeight * dpr);
      if (size.w === w && Math.abs(h - size.h) < size.h * 0.2) return;
      dropBitmaps();
      const cover = Math.max(w / set!.width, h / set!.height);
      const dw = Math.round(set!.width * cover);
      const dh = Math.round(set!.height * cover);
      size = { w, h, dw, dh, dx: Math.round((w - dw) / 2), dy: Math.round((h - dh) / 2) };
      canvas.width = w;
      canvas.height = h;
    }

    // Keep only the window around the camera in flight; anything outside it is aborted.
    function pump() {
      const keep = new Set(wanted);
      for (const [i, ac] of fetching) if (!keep.has(i)) ac.abort();
      for (const i of wanted) {
        if (fetching.size >= FETCH_AT_ONCE) break;
        if (blobs.has(i) || fetching.has(i)) continue;
        const ac = new AbortController();
        fetching.set(i, ac);
        fetch(url(i), { signal: ac.signal })
          .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
          .then((b) => blobs.set(i, b))
          .catch(() => {})
          .finally(() => {
            if (fetching.get(i) === ac) fetching.delete(i);
            pump();
          });
      }
    }

    function decodeAround(f: number) {
      for (let i = f - DECODE_BEHIND; i <= f + DECODE_AHEAD; i++) {
        const blob = blobs.get(i);
        if (!blob || bitmaps.has(i) || decoding.has(i)) continue;
        decoding.add(i);
        const { signal } = decodeAbort;
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
      if (y !== lastY) {
        direction = y > lastY ? 1 : -1;
        lastY = y;
        scrolled = true;
      }
      const nextTarget = frameAt(t, y);
      if (scrolled && Math.round(nextTarget) !== Math.round(target)) {
        target = nextTarget;
        wanted = fetchWindow(set!, target, direction);
        pump();
      }
      current += (target - current) * (1 - Math.exp(-dt / EASE_MS));
      if (Math.abs(target - current) < 0.01) current = target;

      const f = drawable(set!, current);
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
      const nowPast = window.scrollY - film.offsetTop >= t.total;
      if (nowPast !== past) {
        past = nowPast;
        film.toggleAttribute("data-past", past);
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
    pump(); // frame 0 only: it is the poster, already cached
    // A visitor who reads the hero for a moment gets the first few frames, nothing more.
    const idle = setTimeout(() => {
      if (scrolled) return;
      wanted = Array.from({ length: IDLE_PREFETCH_FRAMES + 1 }, (_, i) => i);
      pump();
    }, IDLE_PREFETCH_MS);
    raf = requestAnimationFrame(tick);
    addEventListener("resize", resize);
    film.addEventListener("focusin", onFocus);
    return () => {
      clearTimeout(idle);
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      film.removeEventListener("focusin", onFocus);
      fetching.forEach((ac) => ac.abort());
      dropBitmaps();
      html.classList.remove("film-on");
      delete html.dataset.filmSet;
    };
  }, []);

  return (
    <div ref={root} className="film">
      <a className="film-skip" href="#work">
        Skip to work ↓
      </a>
      <div className="film-stage">
        <canvas ref={canvasRef} aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
