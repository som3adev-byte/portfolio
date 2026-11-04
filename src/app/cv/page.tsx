import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { education, experience, languages, site, skills } from "@/content/site";

export const metadata: Metadata = {
  title: "CV",
  description: `CV of ${site.name}, ${site.role.toLowerCase()} in ${site.location}.`,
  alternates: { canonical: "/cv" },
};

export default function CV() {
  const github = site.github.replace("https://", "");
  return (
    <article className="cv">
      <p className="no-print actions">
        <a className="btn btn--solid" href="/abdullah-ismail-cv.pdf" download>
          Download PDF
        </a>
      </p>

      <header>
        <h1>{site.name}</h1>
        <p>{site.role}</p>
        <p className="cv__contact">
          {site.location} · <a href={site.phone.href}>{site.phone.label}</a> ·{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a> · <a href={site.github}>{github}</a>
        </p>
      </header>

      <section>
        <h2>Summary</h2>
        <p>
          Full-stack developer and the only developer at a company in Al-Ula. I build its accounting and operations
          systems with Next.js, TypeScript and PostgreSQL, and I run them with the staff: I write the business rules
          with each department, moved the company off Excel, train and support the users, and handle IT and
          administration. My accounting degree shapes how I model money, payments and audit trails.
        </p>
      </section>

      <section>
        <h2>Experience</h2>
        {experience.map((e) => (
          <div key={e.role} className="cv__item">
            <div className="cv__row">
              <h3>
                {e.role}, {e.org}
              </h3>
              <span>{e.period}</span>
            </div>
            <ul>
              {e.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2>Selected projects</h2>
        {projects.map((p) => (
          <div key={p.slug} className="cv__item">
            <div className="cv__row">
              <h3>{p.title}</h3>
              <span>
                {p.kind} · {p.period}
              </span>
            </div>
            <ul>
              <li>
                {p.line}. {p.status}
              </li>
              <li>{p.stack.slice(0, 6).join(", ")}</li>
            </ul>
          </div>
        ))}
      </section>

      <section className="cv__skills">
        <h2>Skills</h2>
        {skills.map(([k, v]) => (
          <div key={k}>
            <strong>{k}</strong>
            <span>{v}</span>
          </div>
        ))}
      </section>

      <section>
        <h2>Education and training</h2>
        {education.map((e) => (
          <div key={e.title} className="cv__row cv__item">
            <h3>{e.title}</h3>
            <span>{e.period}</span>
          </div>
        ))}
      </section>

      <section>
        <h2>Languages</h2>
        <p>{languages}</p>
      </section>
    </article>
  );
}
