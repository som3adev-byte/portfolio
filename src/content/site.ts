export const site = {
  name: "Abdullah Ismail",
  role: "Full-stack developer",
  headline: "I build the software a business runs on: money, people, stock and the rules between them.",
  location: "Al-Ula, Saudi Arabia",
  email: "abdullah.ismail.pro@gmail.com",
  phone: { href: "tel:+966510042472", label: "+966 51 004 2472" },
  github: "https://github.com/som3adev-byte",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  availability: "Open to full-time roles and to freelance projects.",
} as const;

export const experience = [
  {
    role: "IT Specialist & Web Developer",
    org: "Ashar Company, Al-Ula, Saudi Arabia",
    period: "Jan 2025 – Present",
    points: [
      "Sole developer of the company's internal software: an accounting system for its tourism arm and an operations system for its hotels, staff and stock.",
      "Own the whole chain: data model, application, exports, deployment and the people using it every day.",
    ],
  },
  {
    role: "Freelance Wholesale Digital Products Coordinator",
    org: "Self-employed",
    period: "2022 – 2024",
    points: ["Recorded sales, tracked invoices and followed up on payments."],
  },
  {
    role: "Military Service",
    org: "Egypt",
    period: "2020 – Dec 2021",
    points: ["Mandatory service."],
  },
] as const;

export const education = [
  { title: "Bachelor of Commerce, Accounting", period: "May 2020" },
  {
    // Training, not a certification. Never list it under "Certifications".
    title: "Penetration testing training, 120 hours",
    period: "Sep 2024 – Apr 2025",
  },
] as const;

export const languages = "Arabic (native), English (B2–C1)";

export const skills = [
  ["Web", "Next.js, React, TypeScript, Tailwind CSS"],
  ["Back end", "PostgreSQL, Prisma, Drizzle, NestJS, Zod, row-level security"],
  ["Mobile", "Expo, React Native"],
  ["Quality", "Vitest, Playwright, GitHub Actions"],
  ["Hosting", "Vercel, Neon, Docker"],
] as const;
