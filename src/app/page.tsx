import Image from "next/image";
import Link from "next/link";
import { Film } from "@/components/Film";
import { Loader } from "@/components/Loader";
import { projects } from "@/content/projects";
import { education, experience, site, skills } from "@/content/site";

const pad = Math.max(...projects.map((p) => p.slug.length)) + 2;

export default function Home() {
  return (
    <>
      <Loader />
      <Film>
        <section data-beat="hero" className="beat beat--hero" aria-labelledby="hero-title">
          <div className="beat__in">
            <h1 id="hero-title">{site.name}</h1>
            <p className="eyebrow">{site.role}</p>
            <p className="hero__claim">{site.headline}</p>
            <p className="hero__meta">
              {site.location}
              <br />
              {site.availability}
            </p>
            <p className="actions">
              <Link className="btn btn--solid" href="/#work">
                See the work
              </Link>
              <a className="btn" href={`mailto:${site.email}`}>
                Email me
              </a>
            </p>
          </div>
        </section>

        <section data-beat="about" className="beat beat--about" aria-labelledby="about-title">
          <div className="beat__in">
            <h2 id="about-title" className="statement">
              The accounting is in the engineering: exact money, changes you can trace, and workflows that hold together.
            </h2>
            <dl className="ledger">
              <div>
                <dt>Now</dt>
                <dd>Sole developer at Ashar Company since Jan 2025</dd>
              </div>
              <div>
                <dt>Degree</dt>
                <dd>Bachelor of Commerce, Accounting</dd>
              </div>
              <div>
                <dt>Builds</dt>
                <dd>Accounting · payroll · HR · bookings · inventory</dd>
              </div>
              <div>
                <dt>Core</dt>
                <dd>Next.js · TypeScript · PostgreSQL · Prisma</dd>
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
                    <span className="ls__slug">{p.slug.padEnd(pad, " ")}</span>
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
            <p>Hiring, or need a system built? Write to me.</p>
            <p className="contact__email">
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          </div>
        </section>
      </Film>

      <section id="work" className="section" aria-labelledby="work-title">
        <h2 id="work-title" className="section__title">
          Work
        </h2>
        <p className="section__lede">
          Two systems a company runs on every day, an independent compliance platform, a client&rsquo;s three-app
          product, and the sites that show off the front end.
        </p>
        <ul className="cards">
          {projects.map((p) => {
            const img = p.figures?.find((f) => f.width > f.height) ?? p.figures?.[0];
            return (
              <li key={p.slug} className="card">
                <Link href={`/work/${p.slug}`} className="card__link">
                  <div className="card__media">
                    {img ? (
                      <Image src={img.src} alt="" width={img.width} height={img.height} sizes="(max-width: 768px) 100vw, 33vw" />
                    ) : (
                      <span className="card__mono" aria-hidden="true">
                        {p.slug}
                      </span>
                    )}
                  </div>
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

      <section id="services" className="section" aria-labelledby="services-title">
        <h2 id="services-title" className="section__title">
          For clients
        </h2>
        <ul className="services">
          <li>
            <h3>Business systems</h3>
            <p>Accounting, payroll, HR, bookings and inventory, modelled the way the business actually works, in Arabic and right-to-left first.</p>
          </li>
          <li>
            <h3>Websites that hold attention</h3>
            <p>Fast marketing sites, including scroll-driven films like the one at the top of this page.</p>
          </li>
          <li>
            <h3>Mobile apps</h3>
            <p>iOS and Android apps with Expo, sharing their rules with the web dashboard behind them.</p>
          </li>
        </ul>
        <p className="section__note">
          Video editing and ads go through my agency, <a href="https://codecutclick.com">Code Cut Click</a>.
        </p>
      </section>

      <section id="about" className="section" aria-labelledby="exp-title">
        <h2 id="exp-title" className="section__title">
          About
        </h2>
        <div className="about">
          <div>
            <p className="section__lede">
              I studied accounting and spent two years recording sales and chasing invoices before I wrote software
              for that kind of work. Today I am the only developer at a company in Al-Ula, so I own everything from
              the database schema to the phone in a receptionist&rsquo;s hand.
            </p>
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
          </div>
          <dl className="skills">
            {skills.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="contact" className="section section--contact" aria-labelledby="contact-title">
        <h2 id="contact-title" className="section__title">
          Contact
        </h2>
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
            <Link href="/cv">CV</Link> (<a href="/abdullah-ismail-cv.pdf">PDF</a>)
          </li>
        </ul>
      </section>
    </>
  );
}
