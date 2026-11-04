"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function read(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
  listeners.add(fn);
  const mq = matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", fn);
  return () => {
    listeners.delete(fn);
    mq.removeEventListener("change", fn);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => null);
  if (!theme) return <span className="theme-toggle" aria-hidden="true" />;
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${next} theme`}
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("theme", next);
        } catch {}
        listeners.forEach((fn) => fn());
      }}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
