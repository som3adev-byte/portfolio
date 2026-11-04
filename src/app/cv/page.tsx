import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "CV",
  description: `CV of ${site.name}, ${site.role.toLowerCase()} in ${site.location}.`,
  alternates: { canonical: "/cv" },
};

const short = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

// One A4 page, written for a hiring manager's first 30 seconds: who, the impact, proof with
// numbers, and a reason to open the portfolio. Every claim is on the site with its evidence.
export default function CV() {
  const work = projects.filter((p) => p.cv);
  const more = projects.filter((p) => !p.cv);
  return (
    <article className="cv">
      <p className="no-print actions">
        <a className="btn btn--solid" href="/abdullah-ismail-cv.pdf" download>
          Download PDF
        </a>
      </p>

      <header className="cv__head">
        <div>
          <h1>{site.name}</h1>
          <p className="cv__title">Full-stack developer · business systems</p>
        </div>
        <p className="cv__contact">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={site.phone.href}>{site.phone.label}</a>
          <span>{site.location}</span>
          <a href={site.github}>{short(site.github)}</a>
        </p>
      </header>

      <p className="cv__portfolio">
        <strong>Portfolio</strong> <a href={site.url}>{short(site.url)}</a>
        <span> · case studies, screenshots and code for every project below</span>
      </p>

      <section>
        <p className="cv__summary">
          I build the systems a business runs on, then run them with the people who use them. At Ashar Company in
          Al-Ula I built the accounting and operations systems end to end, alone, wrote their rules with each
          department, and moved the company off Excel. An accounting degree shapes how I model money.
        </p>
      </section>

      <section>
        <h2>Experience</h2>
        <div className="cv__item">
          <div className="cv__row">
            <h3>IT Specialist &amp; Web Developer, Ashar Company, Al-Ula</h3>
            <span>Jan 2025 – Present</span>
          </div>
          <ul>
            <li>
              Built the company&rsquo;s two systems end to end, alone: accounting for the tourism arm, in daily use
              since May 2026, and a new operations system for the hotels, staff and stock (HR, GPS attendance,
              payroll, bookings, invoices), built and tested and preparing to go live.
            </li>
            <li>
              Wrote the business rules with each department before building, then moved the records and opening
              balances off Excel and ran both side by side until the totals matched.
            </li>
            <li>
              Train and support the staff from reception to HR and accounting; run the company&rsquo;s IT, accounts
              and permissions, and management reports.
            </li>
          </ul>
        </div>
        <p className="cv__earlier">
          <strong>Earlier:</strong> freelance digital products coordinator: sales records, invoices and payment
          follow-up (2022 – 2024) · military service, Egypt (2020 – 2021)
        </p>
      </section>

      <section>
        <h2>Selected work</h2>
        {work.map((p) => (
          <div key={p.slug} className="cv__item cv__work">
            <div className="cv__row">
              <h3>
                {p.title} <span className="cv__kind">{p.kind}</span>
              </h3>
              <a href={`${site.url}/work/${p.slug}`}>case study →</a>
            </div>
            <p>{p.cv}</p>
            <p className="cv__stack">{p.stack.slice(0, 5).join(" · ")}</p>
          </div>
        ))}
        <p className="cv__more">Also on the portfolio: {more.map((p) => p.title).join(", ")}.</p>
      </section>

      <section className="cv__grid">
        <div>
          <h2>Skills</h2>
          <p>
            Next.js, React, TypeScript · PostgreSQL, Prisma, Drizzle, NestJS · row-level security, 2FA · Expo, React
            Native · Vitest, Playwright, GitHub Actions · Vercel, Docker
          </p>
        </div>
        <div>
          <h2>Education</h2>
          <p>Bachelor of Commerce, Accounting (2020) · Penetration testing training, 120 hours (2024 – 2025)</p>
          <h2 className="cv__h2-gap">Languages</h2>
          <p>Arabic (native) · English (B2–C1)</p>
        </div>
      </section>
    </article>
  );
}
