"use client";

import { useEffect, useRef } from "react";

/** A ring that follows the mouse and grows over links. Fine pointers only, never with reduced motion. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const html = document.documentElement;
    const el = ring.current!;
    const p = { x: 0, y: 0, cx: 0, cy: 0, seen: false };
    let raf = 0;
    const prefersDark = matchMedia("(prefers-color-scheme: dark)");

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      p.x = e.clientX;
      p.y = e.clientY;
      if (!p.seen) {
        p.cx = p.x;
        p.cy = p.y;
        p.seen = true;
        html.classList.add("cur");
      }
    };
    const leave = () => {
      p.seen = false;
      html.classList.remove("cur");
    };
    const tick = () => {
      p.cx += (p.x - p.cx) * 0.25;
      p.cy += (p.y - p.cy) * 0.25;
      el.style.transform = `translate(${p.cx}px, ${p.cy}px)`;
      // Rechecked every frame: the film moves content under a still mouse.
      const over = p.seen ? document.elementFromPoint(p.x, p.y) : null;
      el.classList.toggle("is-link", Boolean(over?.closest("a, button")));
      // A light ring over dark surfaces: the monitor, solid buttons, and the page itself in the
      // dark theme (the film stays a white room in both themes).
      const darkPage = html.dataset.theme === "dark" || (!html.dataset.theme && prefersDark.matches);
      const onFilm = Boolean(over?.closest(".film-stage"));
      el.classList.toggle("is-dark", Boolean(over?.closest(".beat--work, .btn--solid, .film-skip")) || (darkPage && !onFilm));
      raf = requestAnimationFrame(tick);
    };

    addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      html.classList.remove("cur");
    };
  }, []);

  return <div ref={ring} className="cursor" aria-hidden="true" />;
}
