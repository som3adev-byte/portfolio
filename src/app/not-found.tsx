import Link from "next/link";

export default function NotFound() {
  return (
    <article className="case">
      <div className="case__head">
        <p className="eyebrow">404</p>
        <h1>Nothing here.</h1>
        <p className="case__summary">That page does not exist. The work is all on the home page.</p>
        <p className="actions">
          <Link className="btn btn--solid" href="/#work">
            See the work
          </Link>
        </p>
      </div>
    </article>
  );
}
