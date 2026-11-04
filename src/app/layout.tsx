import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Archivo } from "next/font/google";
import Link from "next/link";
import { site } from "@/content/site";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Cursor } from "@/components/Cursor";
import "./globals.css";

const sans = localFont({
  src: "./fonts/ibm-plex-sans-latin-wght-normal.woff2",
  weight: "100 700",
  variable: "--font-plex-sans",
  display: "swap",
});
const mono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-mono-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
});

// Wide Archivo for the big words (self-hosted by next/font at build time).
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | ${site.role}`, template: `%s | ${site.name}` },
  description:
    "Full-stack developer in Al-Ula building accounting, HR, payroll and operations systems with Next.js, TypeScript and PostgreSQL. Open to roles and freelance projects.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: site.name, locale: "en" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#111214" },
    { media: "(prefers-color-scheme: dark)", color: "#111214" },
  ],
};

// Runs before paint so a saved theme never flashes the wrong one.
const themeScript = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

// The home loader shows only once per visit, never with reduced motion or ?noload, and
// removes itself after 4 s if the page script never runs.
// Guess before paint whether the home film will run (same rules as Film.tsx), so the first
// paint is the film's layout or the plain one, never one and then the other.
const filmScript = `try{var c=navigator.connection||{},q=location.search;if(location.pathname==="/"&&!/static/.test(q)&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&!c.saveData&&!/(^|-)2g$|^3g$/.test(c.effectiveType||"")&&!(innerWidth>innerHeight&&innerHeight<=500)&&typeof createImageBitmap==="function"){var h=document.documentElement;h.classList.add("film-on");setTimeout(function(){if(!h.dataset.filmSet)h.classList.remove("film-on")},6000)}}catch(e){}`;

const loaderScript = `try{var h=document.documentElement;if(location.pathname==="/"&&!/noload/.test(location.search)&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&sessionStorage.getItem("seen")!=="1"){h.classList.add("loading");setTimeout(function(){h.classList.remove("loading")},4000)}}catch(e){}`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  email: `mailto:${site.email}`,
  url: site.url,
  sameAs: [site.github],
  address: { "@type": "PostalAddress", addressLocality: "Al-Ula", addressCountry: "SA" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr" className={`${sans.variable} ${mono.variable} ${archivo.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: filmScript }} />
        <script dangerouslySetInnerHTML={{ __html: loaderScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="site-header">
          <Link href="/" className="site-header__name">
            {site.name}
          </Link>
          <nav aria-label="Main">
            <Link href="/#work">Work</Link>
            <Link href="/#about" data-wide>
              Experience
            </Link>
            <Link href="/cv" data-wide>
              CV
            </Link>
            <Link href="/#contact">Contact</Link>
            <ThemeToggle />
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <p>
            {site.name} · {site.location}
          </p>
          <p>
            <a href={`mailto:${site.email}`}>{site.email}</a> · <a href={site.github} rel="me">GitHub</a> · <Link href="/cv">CV</Link>
          </p>
        </footer>
        <Cursor />
      </body>
    </html>
  );
}
