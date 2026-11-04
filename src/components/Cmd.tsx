import type { CSSProperties } from "react";

/**
 * A section heading written as a terminal command that types itself as it scrolls in.
 * Screen readers get the plain section name; the command is decoration.
 */
export function Cmd({ id, label, children }: { id: string; label: string; children: string }) {
  return (
    <h2 id={id} className="section__title section__title--cmd" aria-label={label}>
      <span className="cmd" aria-hidden="true" style={{ "--n": children.length + 2 } as CSSProperties}>
        <span className="cmd__prompt">$ </span>
        {children}
      </span>
      <span className="cmd__caret" aria-hidden="true" />
    </h2>
  );
}
