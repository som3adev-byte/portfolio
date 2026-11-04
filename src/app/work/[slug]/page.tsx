import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition, type CSSProperties } from "react";
import { coverOf, getProject, neighbours, projects, type Block } from "@/content/projects";
import { site } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: p.figures?.[0] ? { images: [p.figures[0].src] } : undefined,
  };
}

/** A number that rolls up to its value (CSS only); text like "~185" keeps its prefix. */
function Num({ value }: { value: string }) {
  const m = /^(\D*)(\d+)$/.exec(value);
  if (!m) return <strong>{value}</strong>;
  return (
    <strong data-n={m[2]} data-pre={m[1]} style={{ "--to": m[2] } as CSSProperties}>
      <span className="n">{value}</span>
    </strong>
  );
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return blocks.map((b, i) => {
    if (typeof b === "string") return <p key={i}>{b}</p>;
    if ("list" in b)
      return (
        <ul key={i}>
          {b.list.map((li) => (
            <li key={li}>{li}</li>
          ))}
        </ul>
      );
    return (
      <div key={i} className="decisions">
        {b.items.map((it) => (
          <div key={it.title}>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </div>
        ))}
      </div>
    );
  });
}

export default async function WorkPage({ params }: PageProps<"/work/[slug]">) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  const { prev, next } = neighbours(p.slug);
  const cover = coverOf(p);
  const figures = p.figures?.filter((f) => f !== cover);

  return (
    <article className="case">
      <Link href="/#work" className="case__back">
        ← All work
      </Link>

      <header className="case__head">
        <p className="eyebrow">
          {p.kind} · {p.period}
        </p>
        <ViewTransition name={`title-${p.slug}`} share="morph" default="none">
          <h1>{p.title}</h1>
        </ViewTransition>
        <p className="case__summary">{p.summary}</p>
        {(p.live || p.repo) && (
          <p className="case__links">
            {p.live && (
              <a className="btn btn--solid" href={p.live}>
                Open the live site
              </a>
            )}
            {p.repo && (
              <a className="btn" href={p.repo}>
                Read the code
              </a>
            )}
          </p>
        )}
        {p.closed && <p className="case__closed">{p.closed}</p>}
      </header>

      <ViewTransition name={`cover-${p.slug}`} share="morph" default="none">
        <figure className="case__hero">
          {cover ? (
            <Image src={cover.src} alt={cover.alt} width={cover.width} height={cover.height} sizes="(max-width: 1200px) 100vw, 1150px" priority />
          ) : (
            <span className="card__mono" aria-hidden="true">
              {p.slug}
            </span>
          )}
        </figure>
      </ViewTransition>
      {cover && <p className="case__hero-caption">{cover.caption}</p>}

      <dl className="facts">
        <div>
          <dt>Role</dt>
          <dd>{p.role}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{p.status}</dd>
        </div>
        <div>
          <dt>Stack</dt>
          <dd>{p.stack.join(" · ")}</dd>
        </div>
      </dl>

      {p.numbers && (
        <ul className="numbers" aria-label="In numbers">
          {p.numbers.map(([v, l]) => (
            <li key={l}>
              <Num value={v} />
              <span>{l}</span>
            </li>
          ))}
        </ul>
      )}

      {figures && figures.length > 0 && (
        <div className="figures">
          {figures.map((f) => (
            <figure key={f.src} className={f.width > f.height * 1.2 ? "wide" : "tall"}>
              <Image
                src={f.src}
                alt={f.alt}
                width={f.width}
                height={f.height}
                sizes={f.width > f.height ? "(max-width: 1200px) 100vw, 1150px" : "352px"}
              />
              <figcaption>{f.caption}</figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className="prose">
        {p.sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            <Blocks blocks={s.blocks} />
          </section>
        ))}
      </div>

      <aside className="case__cta">
        <p>Want something like this built, or someone who can build it on your team?</p>
        <a className="btn btn--solid" href={`mailto:${site.email}?subject=${encodeURIComponent(p.title)}`}>
          Email me
        </a>
      </aside>

      {(prev || next) && (
        <nav className="case__nav" aria-label="More work">
          {prev && (
            <Link href={`/work/${prev.slug}`}>
              <span>← Previous</span>
              {prev.title}
            </Link>
          )}
          {next && (
            <Link href={`/work/${next.slug}`} className="next">
              <span>Next →</span>
              {next.title}
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
