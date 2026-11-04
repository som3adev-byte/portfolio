export const site = {
  name: "Abdullah Ismail",
  role: "Full-stack developer",
  headline: "I turn the way a company works into the software it runs on.",
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
      "Built the company's internal software end to end, alone: an accounting system for its tourism arm and an operations system for its hotels, staff and stock.",
      "Sat with each department and wrote how the work actually runs (approvals, shifts, deductions, payroll) into the specification before building.",
      "Moved the company's records and opening balances off Excel, and ran both side by side until the numbers matched.",
      "Train the staff on the systems and support them day to day, from reception to HR and accounting.",
      "Handle the company's IT and help with administration: devices, network, accounts and permissions, and reports for management.",
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

/** The work around the software, shown in "Beyond the code". Owner-confirmed, Nov 2026. */
export const beyond = [
  ["Turn the work into rules", "I sit with each department and write how the work really runs (approvals, shifts, deductions, payroll) before a line of code."],
  ["Move the company off Excel", "Records and opening balances moved into the systems, with both running side by side until the totals matched."],
  ["Train and support the staff", "Reception, HR and accounting learn the systems from me, and come to me when something goes wrong."],
  ["Keep the office running", "Devices, network, accounts and permissions, and the reports management reads."],
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
  ["AI tools", "Claude Code, Codex, custom agent skills and MCP; Kling and Higgsfield for generated media; Remotion and HyperFrames for video in code"],
] as const;
