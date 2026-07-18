# Sable website

Experimental marketing site for Sable, a freight-invoice audit service for
mid-market transportation shippers.

Public preview: `https://jelwoodiii.github.io/freight-audit-website/`

## Run locally

Requires Node.js 22.13+ and pnpm.

```bash
pnpm install
pnpm run dev
```

Open `http://localhost:3000`.

## Verify

```bash
pnpm run build
pnpm test
```

`pnpm run build:pages` creates the static GitHub Pages artifact in
`.pages-dist/`.

The primary implementation lives in `app/page.tsx` and `app/globals.css`.
The scroll-driven split-S opening respects `prefers-reduced-motion` and adapts
through tablet and mobile breakpoints.

Before publishing, replace the experimental contact address in `app/page.tsx`
with the production Sable inbox.
