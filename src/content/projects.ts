// Every claim here traces to the project's own code, docs or the owner's interview answers.
// Add a project by adding an entry. Nothing else needs to change.

export type Block = string | { list: string[] } | { items: { title: string; text: string }[] };

export type Figure = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

export type Project = {
  slug: string;
  title: string;
  /** One line for cards and the monitor listing. */
  line: string;
  kind: "Employer" | "Client" | "Independent";
  period: string;
  status: string;
  summary: string;
  role: string;
  stack: string[];
  live?: string;
  repo?: string;
  /** Shown instead of a repo link for work that can't be public. */
  closed?: string;
  numbers?: [value: string, label: string][];
  /** One of the three projects shown first and on the monitor. */
  main?: true;
  figures?: Figure[];
  sections: { heading: string; blocks: Block[] }[];
};

const rtl =
  "The interface is Arabic and right-to-left, shown as it really is. Numbers stay Latin and tabular so columns of money line up.";

export const projects: Project[] = [
  {
    slug: "ashar-operations",
    main: true,
    title: "Ashar operations system",
    line: "Staff, attendance, payroll, bookings, stock and invoices for a hotel and trading company",
    kind: "Employer",
    period: "Oct 2026 – present",
    status: "Built and tested. Preparing to replace the old system.",
    summary:
      "One system for a hotel and trading company in Al-Ula: employees, GPS-verified attendance, leave, payroll, hotel bookings, housekeeping, inventory, purchasing, tax invoices and maintenance. Arabic-first, and built for the phone, because most of the people using it are at a reception desk or walking a corridor.",
    role: "Sole developer, and the person who runs it with the staff: specification, data model, application, tests, deployment, training and daily support.",
    stack: ["Next.js 16", "React 19", "TypeScript", "Prisma 7", "PostgreSQL", "Zod 4", "decimal.js", "Upstash Redis", "Web Push", "Vitest", "Playwright"],
    closed: "Internal company system. The code is private; screenshots use seeded demo data.",
    numbers: [
      ["222", "commits in three weeks"],
      ["94", "database models"],
      ["~185", "unit and integration tests"],
      ["7", "interface languages"],
    ],
    figures: [
      { src: "/work/ashar-home.jpg", width: 390, height: 780, alt: "Home screen of the Ashar app in Arabic", caption: "Home for a manager on a phone: today's occupancy, arrivals, staff on shift, and a list of what needs action. " + rtl },
      { src: "/work/ashar-bookings.jpg", width: 390, height: 780, alt: "Room bookings list in Arabic", caption: "Bookings by room, with stay dates, amount and state (occupied, overdue, needs maintenance, unpaid) on one line each." },
      { src: "/work/ashar-attendance.jpg", width: 390, height: 780, alt: "Attendance screen in Arabic", caption: "Attendance by day, hotel and department. Check-ins are verified by GPS against each site's radius." },
      { src: "/work/ashar-payroll-design.jpg", width: 1188, height: 804, alt: "Payroll period design in Arabic", caption: "The payroll design the screens were built from: a period awaiting the general manager's approval, with every deduction traced to the attendance rule that caused it." },
    ],
    sections: [
      {
        heading: "The problem",
        blocks: [
          "The company already ran on a hotel system I had shipped in 2025. It worked, but it had grown one request at a time, and changing a shift, a role or a deduction rule meant changing code.",
          "The rebuild had two goals written into its specification: correct, consistent numbers everywhere, and every setting the business needs editable from a screen, so running the company never depends on someone editing code.",
        ],
      },
      {
        heading: "Beyond the code",
        blocks: [
          "The specification came first: I sat with each department and wrote down how approvals, shifts, deductions and payroll really work, so the rules in the system are the company's own. I train the staff on it and I am the person they call when something does not add up.",
        ],
      },
      {
        heading: "Decisions worth looking at",
        blocks: [
          {
            items: [
              { title: "One permission path, deny by default", text: "Every write goes through one route wrapper: session, then permission, then Zod validation, then the handler, then the audit entry. Roles are data edited in settings. A new role sees nothing until it is granted something." },
              { title: "Money operations that cannot run twice", text: "Payroll approval, purchase receipts, bookings and invoices run as single transactions with a version column. If two managers approve at the same moment, the second gets a 409 and the effect happens once." },
              { title: "One clock", text: "Every time is stored in UTC. \"Today\" is computed in Riyadh time in one library, ESLint blocks local-time date methods everywhere else, and the database connection is pinned to UTC." },
              { title: "An audit log nobody can edit", text: "A database trigger rejects UPDATE, DELETE and TRUNCATE on the audit table. It records before and after values, sign-ins, exports and every view of salary data." },
              { title: "Languages as a build check", text: "The staff speak Arabic, Urdu, Bengali, Hindi, Filipino and more. The Arabic text is the translation key, and the check script fails on a missing translation, a lost variable, or an Egyptian-dialect word in Saudi-facing text." },
              { title: "Saudi specifics", text: "ZATCA phase-1 QR codes on tax invoices, GPS attendance with random location checks, money held as Decimal end to end, and an installable PWA with push notifications." },
            ],
          },
        ],
      },
      {
        heading: "How it is verified",
        blocks: [
          "About 185 unit and integration tests in 41 files run against a real PostgreSQL test database, including row-level security and clock tests. Five Playwright suites cover invoices, operations and QR attendance end to end. One command gates types, lint, dialect, translations and tests.",
        ],
      },
      {
        heading: "What is still open",
        blocks: [
          {
            list: [
              "Cut-over is not done yet. Daily backups with one tested restore, a rollback rule for the switch day, and a hosting plan upgrade come first.",
              "Translations beyond Arabic were drafted with tooling and still need a native speaker of each language.",
              "Checks run locally. There is no hosted CI yet.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "tourism-accounting",
    main: true,
    title: "Ashar accounting",
    line: "Replaced the spreadsheets behind a tourism company's accounts",
    kind: "Employer",
    period: "2026",
    status: "In production and in daily use since May 2026.",
    summary:
      "A tourism company ran its accounts in Excel. The numbers did not reconcile between files, and every month the reports were rebuilt by hand. This system replaced that: expenses, revenue, payables, receivables, client and supplier payments, and reports that export to Arabic PDF and Excel.",
    role: "Sole developer: data model, application, exports and authentication, and the move off Excel.",
    stack: ["Next.js 16", "TypeScript", "Prisma 7", "PostgreSQL (Neon)", "Zod", "Tailwind", "jsPDF", "SheetJS"],
    closed: "Internal company system. The code is private, and its screens show the company's real figures, so the money flow is drawn here instead.",
    figures: [
      { src: "/work/erp-flow.svg", width: 1440, height: 760, alt: "Diagram of an invoice, its payments, the balance and the reports", caption: "How money moves: a 10,000 invoice paid 4,000 keeps one invoice, gains one payment row and carries a 6,000 balance marked PARTIAL. Opening balances from Excel are loaded once and kept apart in every report." },
    ],
    numbers: [
      ["4", "kinds of user: accountant, finance manager, owner, data entry"],
      ["1", "month reconciled against the old spreadsheets"],
    ],
    sections: [
      {
        heading: "The problem",
        blocks: [
          "Both complaints had the same root: a spreadsheet has no idea what an invoice is. It stores values, not relationships, so nothing stops two files from disagreeing and nothing accumulates into a report on its own.",
        ],
      },
      {
        heading: "The decision that mattered: model money the way accounting works",
        blocks: [
          "The obvious design is one transactions table with a type column and a paid flag. It demos well and breaks the first time a client pays half an invoice. I have an accounting degree, so I separated things in the schema before writing features:",
          {
            list: [
              "Payables and receivables are different models, not one table with a sign flipped. Money you owe and money owed to you have different lifecycles and different people chasing them.",
              "Every payment is its own record linked to its invoice. A 10,000 invoice paid 4,000 keeps one invoice, gains one payment, carries a 6,000 balance and moves from UNPAID to PARTIAL.",
              "All money is Decimal, never a float.",
              "Financial relations restrict deletion. A client, supplier or user with records attached cannot be removed.",
            ],
          },
          "The detail I am most glad about is opening balances. When a business leaves Excel, every client already carries a balance from before the system existed. Without somewhere to put it, the totals are wrong forever, which was the exact complaint. So invoices carry an isOpening flag, the old balances were loaded as starting positions, and reports can tell them apart from real invoices.",
        ],
      },
      {
        heading: "The hardest technical problem: Arabic PDFs",
        blocks: [
          "jsPDF does no contextual glyph shaping and no bidirectional reordering, so the first Arabic export came out with the letters disconnected and reversed.",
          "The fix is three steps: shape the text, reverse it so left-to-right drawing produces right-to-left output, then restore the digit runs. That last step matters most in an accounting document, because reversing Arabic also reverses every number, and 1,250.00 silently becomes 00.052,1. Non-Arabic text skips the pipeline, and the 314 KB Arabic font loads through a dynamic import so it never enters the main bundle.",
        ],
      },
      {
        heading: "Proof, and what is missing",
        blocks: [
          "Validation was a parallel run: the accountant reconciled a full month against the old spreadsheets and the totals agreed.",
          "There are no automated tests; verification was manual, by the person who knows the numbers. There are no month-over-month comparison reports yet. If I started again, tests around the balance calculations would come first. My later projects start that way.",
        ],
      },
    ],
  },
  {
    slug: "mizan",
    main: true,
    title: "Mizan",
    line: "Compliance platform for the Saudi ECC-2:2024 cybersecurity controls",
    kind: "Independent",
    period: "2026",
    status: "Feature-complete for a first release. Not yet adopted by an entity.",
    summary:
      "Saudi government entities must comply with the National Cybersecurity Authority's Essential Cybersecurity Controls and prove it to an auditor. The status usually lives in spreadsheets, where gaps and expired evidence go unnoticed. Mizan tracks all 200 controls and subcontrols, their owners, evidence and remediation, and raises what needs attention on its own. An independent project, not affiliated with the Authority.",
    role: "Sole developer: product, design system, API, database and tests.",
    stack: ["Next.js 16", "NestJS 12", "PostgreSQL 17", "Prisma 7", "next-intl", "Tailwind 4", "Vitest", "Docker", "GitHub Actions"],
    live: "https://mizan-eight-red.vercel.app",
    repo: "https://github.com/som3adev-byte/mizan",
    numbers: [
      ["103", "automated tests (22 unit, 81 end-to-end)"],
      ["200", "controls transcribed from the official text"],
      ["4", "roles: admin, owner, executive, auditor"],
    ],
    figures: [
      { src: "/work/mizan-dashboard.jpg", width: 1440, height: 1000, alt: "Mizan compliance dashboard in Arabic", caption: "The locked visual direction, built as a prototype with sample data: overall score, results per domain, and a map of all 108 main controls by state. " + rtl },
    ],
    sections: [
      {
        heading: "Decisions worth looking at",
        blocks: [
          {
            items: [
              { title: "Tenant isolation enforced by the database", text: "Each entity's data is isolated with PostgreSQL row-level security. The API connects as a NOSUPERUSER NOBYPASSRLS role, and every request sets the entity in a transaction-local setting the policies key on. A query that forgets its WHERE clause returns nothing from another entity. The tests fail if RLS is switched off." },
              { title: "Authentication for a government context", text: "scrypt password hashing, sessions stored only as SHA-256 hashes, mandatory TOTP two-step for everyone with replay protection, MFA secrets encrypted with AES-256-GCM, lockout, identical errors for unknown email and wrong password, and accounts by invitation only." },
              { title: "History that cannot be rewritten", text: "The audit table rejects UPDATE, DELETE and TRUNCATE through database triggers. Not even the superuser can edit it." },
              { title: "Alerts derived from state", text: "Overdue controls, gaps, expiring evidence and the next auditor visit are computed from the current data, so an alert disappears the moment its cause is fixed." },
            ],
          },
        ],
      },
      {
        heading: "How it is verified",
        blocks: [
          "GitHub Actions runs on every pull request: a real PostgreSQL 17 service, the same database roles as production, then the API tests and the web typecheck, lint and build. Tenant isolation, authentication, every feature's permissions and content-checked uploads are covered.",
        ],
      },
      {
        heading: "What is still open",
        blocks: [{ list: ["Hosting inside the Kingdom, which a real government deployment would require.", "Single sign-on through Nafath.", "The live demo opens on the sign-in screen; there is no public demo account yet."] }],
      },
    ],
  },
  {
    slug: "laundry-pickup",
    title: "Laundry pickup and delivery",
    line: "Dashboard, driver app and customer app for a Saudi laundry",
    kind: "Client",
    period: "Oct – Nov 2026",
    status: "Built. Waiting on the business for launch details.",
    summary:
      "A laundry in Saudi Arabia takes orders over WhatsApp and the phone, and they get mixed up as it grows. This system covers clothes, shoes, bedding and carpets, and car washing at the customer's home: a customer app with upfront prices, a field app for drivers and technicians, and a dashboard that is also the API.",
    role: "Sole developer across all three apps and the shared domain package.",
    stack: ["Next.js 16", "Drizzle ORM", "PostgreSQL", "Expo 58", "React Native", "TypeScript", "Turborepo", "Vitest", "GitHub Actions"],
    closed: "Client project. The code is private; screenshots use the seeded demo data.",
    numbers: [["3", "apps sharing one domain package"], ["76", "tests across 8 files"]],
    figures: [
      { src: "/work/laundry-dashboard.jpg", width: 1440, height: 900, alt: "Dispatch screen of the laundry dashboard", caption: "Dispatch for one day: pickups, deliveries and car washes in their time slots, with the stops still waiting for a driver highlighted. Customer names and addresses stay in Arabic, as the business enters them." },
      { src: "/work/laundry-orders.jpg", width: 1440, height: 900, alt: "Order detail with tagged items and price", caption: "One order: every item carries its own tag through custody, the price is itemised with delivery and 15% VAT, and the visits show what is done and what is scheduled." },
      { src: "/work/laundry-staff.jpg", width: 780, height: 1688, alt: "Driver app pickup screen", caption: "The driver's pickup job: who, where, a call and a map button, the booked items, and the two outcomes that matter at the door." },
    ],
    sections: [
      {
        heading: "Decisions worth looking at",
        blocks: [
          {
            items: [
              { title: "Custody as a state machine", text: "Every item is scanned at every hand-over, from pickup to the shop to delivery. The custody rules live in a shared package used by the dashboard and both apps, with their own tests." },
              { title: "Row-level security again", text: "Orders and customer data are protected by PostgreSQL policies, tested directly." },
              { title: "A sign-in per kind of user", text: "Customers sign in with a one-time code to their Saudi mobile number, staff with a password, admins with TOTP two-step. Sessions live on the server." },
              { title: "Built for the field", text: "The driver app queues photos and pickups while offline. Drivers hand over cash at the end of the day through a recorded hand-over, and walk-in customers are booked in at the counter." },
            ],
          },
        ],
      },
      {
        heading: "What is still open",
        blocks: [{ list: ["The business still has to confirm its city, service areas and capacity.", "A manual pickup rehearsal comes before any real customer.", "There are no end-to-end or on-device tests yet."] }],
      },
    ],
  },
  {
    slug: "f6-media",
    title: "F6 Media",
    line: "Scroll-film website for a real-estate video studio",
    kind: "Client",
    period: "Oct 2026",
    status: "Live.",
    summary:
      "A website for F6 Media, a real-estate video editing studio in Cairo. Scrolling moves one camera through one continuous shot of a house, and the studio's story sits at the places the camera stops. At one stop a TV inside the scene plays the studio's real reels.",
    role: "Design, footage pipeline and build.",
    stack: ["HTML", "CSS", "JavaScript", "Canvas", "Kling (footage)", "Vercel"],
    live: "https://f6-media.vercel.app",
    closed: "Repository is private.",
    numbers: [["925", "frames in the film"], ["54", "commits"]],
    figures: [
      { src: "/work/f6-tv.jpg", width: 1440, height: 723, alt: "F6 Media site, the TV stop", caption: "The TV stop: the studio's four edit styles play on the TV inside the scene, one per scroll step." },
    ],
    sections: [
      {
        heading: "Decisions worth looking at",
        blocks: [
          {
            items: [
              { title: "A film, not a video", text: "Video seeking on scroll is unreliable on iOS Safari, so the footage is cut into WebP frames drawn on a canvas. The canvas only ever draws the nearest frame that has loaded, so a slow connection shows a slower camera, never a blank one." },
              { title: "One gesture, one stop", text: "A wheel notch, a swipe or an arrow key moves exactly one stop. Free scrolling with momentum felt stuck on phones, so it was removed." },
              { title: "Ship only what the page loads", text: "The project folder is about 190 MB of clips and stills. An allow-list ignore file sends only the frames and assets the page actually requests." },
              { title: "Reduced motion", text: "With reduced motion on, the site becomes a still page with normal scrolling." },
            ],
          },
        ],
      },
      { heading: "What is still open", blocks: ["The package prices and results on the live site are placeholders until the studio confirms them, and the booking form is not connected yet."] },
    ],
  },
  {
    slug: "code-cut-click",
    title: "Code Cut Click",
    line: "Agency site for software, video and ads, three teams with three different films",
    kind: "Independent",
    period: "Oct 2026 – present",
    status: "Live, content in progress.",
    summary:
      "The site for my agency: Code builds websites, apps and business systems, Cut edits reels and films, Click runs ads. Each team has its own page with its own palette and its own scroll film, instead of one template with three colours.",
    role: "Design and build.",
    stack: ["HTML", "CSS", "JavaScript", "Vercel"],
    live: "https://codecutclick.com",
    closed: "Repository is private.",
    figures: [
      { src: "/work/ccc-home.jpg", width: 1440, height: 900, alt: "Code Cut Click home page", caption: "Home: three full-height curtains, one per team. The whole curtain is the link." },
      { src: "/work/ccc-code.jpg", width: 1440, height: 900, alt: "Code Cut Click, Code page", caption: "The Code page: an x-ray lens over a live product, then a stack that comes apart into its layers as you scroll." },
    ],
    sections: [
      {
        heading: "Decisions worth looking at",
        blocks: [
          {
            items: [
              { title: "An x-ray, not a mock-up", text: "On the Code page the cursor is a lens that shows the code under each region of a live page, and the page then separates into seven layers, from interface to server." },
              { title: "Real work inside the page", text: "The Cut page plays the studio's real reels inside a phone frame instead of mock footage." },
            ],
          },
        ],
      },
      { heading: "What is still open", blocks: ["Prices, sample brands and numbers on the pages are placeholders until final figures are set."] },
    ],
  },
  {
    slug: "gesture-3d",
    title: "Gesture-controlled 3D experience",
    line: "Hands, face and gestures read live through the camera drive a 3D scene in the browser",
    kind: "Independent",
    period: "2026",
    status: "Live. Built as a personal piece, shown here for the engineering.",
    summary:
      "An interactive web experience in several 3D scenes, with music, a small game and an animated finale. Instead of a mouse or a touch screen, the visitor's hands, face and gestures, read live through the camera, move the story along. All of the recognition runs on the visitor's own device; no video leaves the browser.",
    role: "Idea, design and build.",
    stack: ["Next.js", "React Three Fiber", "Three.js", "MediaPipe Tasks Vision", "Zustand", "Playwright"],
    closed: "Personal project: the repository and the live link stay private.",
    figures: [
      { src: "/work/vision-scene.jpg", width: 1440, height: 740, alt: "A 3D two-tier cake on a gold plate with floating particles", caption: "The finale, a 3D scene built with React Three Fiber. With a camera allowed, face detection drives it; without one it falls back to this stage." },
    ],
    sections: [
      {
        heading: "Decisions worth looking at",
        blocks: [
          {
            items: [
              { title: "Three kinds of vision input at once", text: "MediaPipe's face, hand and gesture models run side by side in the browser, so the scene can respond to the face, the hands and recognised gestures separately." },
              { title: "Private by design", text: "The camera stream is read and discarded frame by frame on the device. Nothing is uploaded, which is the only way a camera-driven page can be shared without a privacy question." },
              { title: "3D that stays a web page", text: "The scenes are React Three Fiber components, with Zustand for the state the scenes share, so the 3D lives inside an ordinary Next.js app." },
              { title: "Tested like a product", text: "It has Playwright tests, even though it began as a personal piece." },
            ],
          },
        ],
      },
    ],
  },
];

/** The image a project is shown with on its card and at the top of its page. */
export function coverOf(p: Project) {
  return p.figures?.find((f) => f.width > f.height) ?? p.figures?.[0];
}

export const mainProjects = projects.filter((p) => p.main);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function neighbours(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return { prev: projects[i - 1], next: projects[i + 1] };
}
