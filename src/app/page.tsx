import Image from "next/image";
import Link from "next/link";
import { ViewTransition, type CSSProperties } from "react";
import { Cmd } from "@/components/Cmd";
import { Film } from "@/components/Film";
import { Loader } from "@/components/Loader";
import { coverOf, projects } from "@/content/projects";
import { beyond, education, experience, site, skills } from "@/content/site";

const pad = Math.max(...projects.map((p) => p.slug.length)) + 2;

// One path for a reader in a hurry: who, what, proof, how he works, more, history, contact.
// Every piece of information appears once.
export default function Home() {
  return (
    <>
      <Loader />
      <Film>
        <section data-beat="hero" className="beat beat--hero" aria-labelledby="hero-title">
          <div className="beat__in">
            <p className="hero__status">
              <span className="hero__dot" aria-hidden="true" /> Open to roles &amp; projects
              <span className="hero__where"> · {site.location}</span>
            </p>
            <h1 id="hero-title" className="hero__name" aria-label={site.name}>
              {site.name.split(" ").map((word, w) => (
                <span key={word} className="line" aria-hidden="true">
                  {[...word].map((ch, i) => (
                    <span key={i} className="ch" style={{ "--i": w * 8 + i } as CSSProperties}>
                      {ch}
                    </span>
                  ))}
                </span>
              ))}
            </h1>
            <p className="eyebrow">{site.role}</p>
            <p className="hero__claim">
              I turn <em>the way a company works</em> into the software it runs on.
            </p>
            <p className="actions">
              <Link className="btn btn--solid" href="/#work">
                See the work
              </Link>
              <a className="btn" href="/abdullah-ismail-cv.pdf">
                Download CV
              </a>
            </p>
            <ul className="hero__proof">
              <li>
                <strong>In daily use</strong>
                <span>Ashar accounting, since May 2026</span>
              </li>
              <li>
                <strong>103 tests</strong>
                <span>Mizan, open source</span>
              </li>
              <li>
                <strong>Built alone</strong>
                <span>from the rules to the deploy</span>
              </li>
            </ul>
          </div>
          <p className="hero__cue" aria-hidden="true">
            Scroll
          </p>
          {/* Shown only when the film is not running: the hero's picture, drawn in type. */}
          <div className="hero__term" aria-hidden="true">
            <p className="hero__cmd">$ whoami</p>
            <dl>
              <div>
                <dt>name</dt>
                <dd>{site.name}</dd>
              </div>
              <div>
                <dt>role</dt>
                <dd>{site.role}</dd>
              </div>
              <div>
                <dt>based</dt>
                <dd>{site.location}</dd>
              </div>
              <div>
                <dt>now</dt>
                <dd>Ashar Company, built end to end, alone</dd>
              </div>
              <div>
                <dt>builds</dt>
                <dd>accounting · payroll · HR · stock</dd>
              </div>
              <div>
                <dt>status</dt>
                <dd className="hero__ok">open to roles and projects</dd>
              </div>
            </dl>
            <p className="hero__cmd">
              $ <span className="hero__caret" />
            </p>
          </div>
        </section>

        <section data-beat="about" className="beat beat--about" aria-labelledby="about-title">
          <div className="beat__in">
            <h2 id="about-title" className="statement">
              Developer and operator: I build the systems, then run them with the people who use them.
            </h2>
            <dl className="ledger">
              <div>
                <dt>Now</dt>
                <dd>Ashar Company since Jan 2025, built end to end, alone</dd>
              </div>
              <div>
                <dt>Builds</dt>
                <dd>Accounting · payroll · HR · bookings · stock</dd>
              </div>
              <div>
                <dt>Also</dt>
                <dd>Process · training · Excel to systems · IT</dd>
              </div>
              <div>
                <dt>Degree</dt>
                <dd>Bachelor of Commerce, Accounting</dd>
              </div>
            </dl>
          </div>
        </section>

        <section data-beat="work" className="beat beat--work" aria-labelledby="ls-title">
          <div className="beat__in">
            <h2 id="ls-title" className="term">
              <span aria-hidden="true">$ </span>ls work/
            </h2>
            <ul className="ls">
              {projects.map((p) => (
                <li key={p.slug}>
                  <Link href={`/work/${p.slug}`}>
                    <ViewTransition name={`title-${p.slug}`} share="morph" default="none">
                      <span className="ls__slug">{p.slug.padEnd(pad, " ")}</span>
                    </ViewTransition>
                    <span className="ls__line">{p.line}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section data-beat="contact" className="beat beat--contact" aria-labelledby="hire-title">
          <div className="beat__in">
            <h2 id="hire-title" className="term">
              <span aria-hidden="true">$ </span>sudo hire-me
            </h2>
            <p>Hiring, or need a system built? Keep scrolling for the work, or write now.</p>
            <p className="contact__email">
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          </div>
        </section>
      </Film>

      <section id="work" className="section" aria-labelledby="work-title">
        <Cmd id="work-title" label="Work">
          ls ~/work
        </Cmd>
        <p className="section__lede">
          A company&rsquo;s accounting system in daily use, its new operations system, and an independent compliance
          platform first; then a client&rsquo;s three-app product and the sites that show off the front end.
        </p>
        <ul className="cards cards--main">
          {projects.map((p) => {
            const img = coverOf(p);
            return (
              <li key={p.slug} className="card">
                <Link href={`/work/${p.slug}`} className="card__link">
                  <ViewTransition name={`cover-${p.slug}`} share="morph" default="none">
                    <div className="card__media">
                      {img ? (
                        <Image src={img.src} unoptimized={img.src.endsWith(".svg")} alt="" width={img.width} height={img.height} sizes="(max-width: 768px) 100vw, 33vw" />
                      ) : (
                        <span className="card__mono" aria-hidden="true">
                          {p.slug}
                        </span>
                      )}
                    </div>
                  </ViewTransition>
                  <p className="card__kind">
                    {p.kind} · {p.period}
                  </p>
                  <h3>{p.title}</h3>
                  <p>{p.line}.</p>
                  <p className="card__status">{p.status}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="beyond" className="section" aria-labelledby="beyond-title">
        <Cmd id="beyond-title" label="Beyond the code">
          cat beyond-the-code.md
        </Cmd>
        <p className="section__lede">
          Software only works if the people using it do. At Ashar I am also the one who turns the work into rules,
          moves it off spreadsheets, and keeps the office running.
        </p>
        <ol className="beyond">
          {beyond.map(([title, text], i) => (
            <li key={title}>
              <span className="beyond__n" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="about" className="section" aria-labelledby="exp-title">
        <Cmd id="exp-title" label="Experience">
          cat experience.log
        </Cmd>
        <div className="about">
          <ol className="timeline">
            {experience.map((e) => (
              <li key={e.role}>
                <p className="timeline__period">{e.period}</p>
                <h3>{e.role}</h3>
                <p className="timeline__org">{e.org}</p>
              </li>
            ))}
            {education.map((e) => (
              <li key={e.title}>
                <p className="timeline__period">{e.period}</p>
                <h3>{e.title}</h3>
              </li>
            ))}
          </ol>
          <div className="about__side">
            <dl className="skills">
              {skills.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="actions">
              <a className="btn btn--solid" href="/abdullah-ismail-cv.pdf">
                Download CV
              </a>
              <Link className="btn" href="/cv">
                Read it here
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="section section--contact" aria-labelledby="contact-title">
        <Cmd id="contact-title" label="Contact">
          ./contact --hire
        </Cmd>
        <p className="contact__big">
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <ul className="contact__list">
          <li>
            <a href={site.phone.href}>{site.phone.label}</a>
          </li>
          <li>
            <a href={site.github} rel="me">
              GitHub
            </a>
          </li>
          <li>
            <a href={site.linkedin} rel="me">
              LinkedIn
            </a>
          </li>
          <li>
            Video and ads go through my agency, <a href="https://codecutclick.com">Code Cut Click</a>
          </li>
        </ul>
      </section>
    </>
  );
}
