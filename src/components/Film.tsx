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
    // `?static` shows the stills layout, for checking it without changing OS settings.
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || slowNetwork() || location.search.includes("static")) return;
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

    const bar = film.querySelector<HTMLElement>(".film-progress")!;
    const stage = film.querySelector<HTMLElement>(".film-stage")!;
    let lastOut = -1;

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
        // Copy rises into place as its stop arrives and lifts away as it leaves.
        const inner = el.firstElementChild as HTMLElement | null;
        if (inner) inner.style.translate = o === 1 ? "" : `0 ${(1 - o) * (y < t.holds[el.dataset.beat as Beat].start ? 28 : -28)}px`;
      }
      bar.style.transform = `scaleX(${y / t.total})`;
      // The hand-off: as the film scrolls away, the room pulls back into a framed picture and
      // the work grid comes up under it, one continuous move instead of a cut.
      const out = Math.min(1, Math.max(0, (window.scrollY - film.offsetTop - t.total) / innerHeight));
      if (out !== lastOut) {
        lastOut = out;
        stage.style.transform = out ? `scale(${1 - 0.1 * out})` : "";
        stage.style.borderRadius = out ? `${out * 18}px` : "";
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

    // One gesture, one stop: a wheel notch, a swipe or an arrow key moves the camera to the
    // next stop in one eased glide. Past the last stop the page is an ordinary document again.
    const padTop = parseFloat(getComputedStyle(html).scrollPaddingTop) || 0;
    const exitY = () => (document.getElementById("work")?.offsetTop ?? film.offsetTop + film.offsetHeight) - padTop;
    const stops = () => [
      film.offsetTop,
      ...(["about", "work", "contact"] as const).map((b) => film.offsetTop + (t.holds[b].start + t.holds[b].end) / 2),
      exitY(),
    ];
    let glideRaf = 0;
    let gliding = false;
    let calmUntil = 0;
    const inside = (dir: number) => {
      const y = window.scrollY;
      const ex = exitY();
      return dir > 0 ? y < ex - 4 : y <= ex + 4 && y > film.offsetTop + 2;
    };
    function glide(to: number) {
      cancelAnimationFrame(glideRaf);
      const from = window.scrollY;
      const dur = Math.min(1400, 800 + Math.abs(to - from) * 0.2);
      const t0 = performance.now();
      gliding = true;
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        const e = p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
        window.scrollTo(0, from + (to - from) * e);
        if (p < 1) glideRaf = requestAnimationFrame(step);
        else {
          gliding = false;
          calmUntil = now + 280; // trackpads keep sending momentum after a flick
        }
      };
      glideRaf = requestAnimationFrame(step);
    }
    function stepTo(dir: number) {
      const s = stops();
      const y = window.scrollY;
      const i = dir > 0 ? s.findIndex((v) => v > y + 4) : s.findLastIndex((v) => v < y - 4);
      if (i >= 0) glide(s[i]);
    }
    const busy = () => gliding || performance.now() < calmUntil || html.classList.contains("loading");
    function onWheel(e: WheelEvent) {
      const dir = Math.sign(e.deltaY);
      if (!dir || e.ctrlKey || !inside(dir)) return;
      e.preventDefault();
      if (!busy()) stepTo(dir);
    }
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
    function onTouchMove(e: TouchEvent) {
      if (inside(touchY - e.touches[0].clientY > 0 ? 1 : -1)) e.preventDefault();
    }
    function onTouchEnd(e: TouchEvent) {
      const dy = touchY - e.changedTouches[0].clientY;
      const dir = dy > 0 ? 1 : -1;
      if (Math.abs(dy) > 24 && inside(dir) && !busy()) stepTo(dir);
    }
    function onKey(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey || (e.target as HTMLElement).closest("input, textarea, select, [contenteditable]")) return;
      const dir = ["ArrowDown", "PageDown"].includes(e.key) || (e.key === " " && !e.shiftKey) ? 1 : ["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey) ? -1 : 0;
      if (!dir || !inside(dir)) return;
      e.preventDefault();
      if (!busy()) stepTo(dir);
    }
    // A dragged scrollbar or a jump link can leave the camera between stops: settle on the nearest.
    let settle = 0;
    function onScroll() {
      clearTimeout(settle);
      settle = window.setTimeout(() => {
        const y = window.scrollY;
        if (gliding || y >= exitY() - 4) return;
        const s = stops();
        const near = s.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a));
        if (Math.abs(near - y) > 4) glide(near);
      }, 220);
    }
    addEventListener("wheel", onWheel, { passive: false });
    addEventListener("touchstart", onTouchStart, { passive: true });
    addEventListener("touchmove", onTouchMove, { passive: false });
    addEventListener("touchend", onTouchEnd);
    addEventListener("keydown", onKey);
    addEventListener("scroll", onScroll, { passive: true });

    resize();
    // `?p=0.5` opens halfway through the film.
    const jump = Number(new URLSearchParams(location.search).get("p"));
    if (jump > 0 && jump <= 1) window.scrollTo({ top: film.offsetTop + jump * t.total });
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
      clearTimeout(settle);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(glideRaf);
      removeEventListener("wheel", onWheel);
      removeEventListener("touchstart", onTouchStart);
      removeEventListener("touchmove", onTouchMove);
      removeEventListener("touchend", onTouchEnd);
      removeEventListener("keydown", onKey);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", resize);
      film.removeEventListener("focusin", onFocus);
      fetching.forEach((ac) => ac.abort());
      dropBitmaps();
      stage.style.transform = "";
      stage.style.borderRadius = "";
      html.classList.remove("film-on");
      delete html.dataset.filmSet;
    };
  }, []);

  return (
    <div ref={root} className="film">
      <span className="film-progress" aria-hidden="true" />
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
