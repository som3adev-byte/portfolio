"use client";

import { useEffect, useRef } from "react";

const GLYPHS = ["{ }", ">_", "</>", "$", ";", "=>", "#", "[ ]", "&&"];
const DURATION_MS = 900;
const FONTS_CAP_MS = 1200;

/**
 * A short loader that plays once per visit, on the home page only. It is only shown when the
 * inline script in layout.tsx adds `loading` to <html>, so without JavaScript it never covers
 * anything, and that script removes it after 4 s if this component never runs.
 */
export function Loader() {
  const glyph = useRef<HTMLSpanElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("loading")) return;
    const spin = setInterval(() => {
      glyph.current!.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }, 110);
    const t0 = performance.now();
    let raf = 0;
    const counted = new Promise<void>((done) => {
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / DURATION_MS);
        const e = 1 - (1 - p) ** 3;
        count.current!.textContent = String(Math.round(e * 100)).padStart(3, "0");
        bar.current!.style.transform = `scaleX(${e})`;
        if (p < 1) raf = requestAnimationFrame(tick);
        else done();
      };
      raf = requestAnimationFrame(tick);
    });
    const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, FONTS_CAP_MS))]);
    let gone = 0;
    Promise.all([counted, fonts]).then(() => {
      clearInterval(spin);
      glyph.current!.textContent = ">_";
      box.current!.classList.add("done");
      html.classList.remove("loading");
      try {
        sessionStorage.setItem("seen", "1");
      } catch {}
      gone = window.setTimeout(() => box.current?.remove(), 400);
    });
    return () => {
      clearInterval(spin);
      cancelAnimationFrame(raf);
      clearTimeout(gone);
    };
  }, []);

  return (
    <div ref={box} className="loader" aria-hidden="true">
      <span ref={glyph} className="loader__glyph">
        {">_"}
      </span>
      <span className="loader__foot">
        <span>Abdullah Ismail</span>
        <span ref={count}>000</span>
      </span>
      <span ref={bar} className="loader__bar" />
    </div>
  );
}
