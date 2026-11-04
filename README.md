# abdullah-ismail.dev

Portfolio of Abdullah Ismail, full-stack developer. Next.js 16, TypeScript, plain CSS.

The home page is a scroll-driven film of a desk: the canvas draws WebP frames from
`public/film/`, and the four beats of copy are ordinary server-rendered HTML on top.
Without JavaScript, or with reduced motion on, each beat is a normal section over its still.

## Run

```sh
npm install
npm run dev        # http://localhost:3000
npm test           # film timeline and content checks
npm run build
```

## Add a project

Add one entry to `src/content/projects.ts`. The home grid, the monitor listing, the case-study
page, previous/next links, the sitemap and the CV all read from that list. Put images in
`public/work/`. Only state what the code, the docs or the owner can back up.

## Change the film

- Beat timing and scroll lengths: `STEPS` in `src/lib/film.ts` (tests check every beat lands on its frame).
- Where copy sits on each frame: `.beat--*` rules in `src/app/globals.css`.
- Frames are cached for a year. If you re-encode them, write them to a new folder name and
  update the path in `Film.tsx` and `globals.css`.

## Regenerate the CV PDF and share image

With the site running: `node tools/export.mjs http://localhost:3000`.
Screenshots of every stop at desktop and phone size: `node tools/shots.mjs http://localhost:3000 shots`.

## Deploy

Live at https://abdullah-ismail-wine.vercel.app (Vercel project `abdullah-ismail`).
Set `NEXT_PUBLIC_SITE_URL` to the production URL so canonical links, the sitemap and
the share image resolve, and regenerate the CV with `tools/export.mjs` when the URL changes.
