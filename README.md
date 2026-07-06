# Reddit Live Comments

Watch a Reddit thread's comment section stream in as a live, auto-scrolling feed — paste a thread URL, hit Start, and reactions arrive one at a time at a readable pace. Built for second-screen viewing during live events (a race, a match, a game).

## Features

- **Live paced feed** — new comments reveal one at a time instead of dumping all at once.
- **Expandable reply threads** — comments with responses show a "N replies" toggle.
- **Light / dark mode** — follows system preference with a manual toggle.
- **Adjustable** — tune the poll refresh rate and the display pace.
- **No backend** — fetches directly from Reddit in the browser; ships as a static site.

## How it works

Reddit's comment JSON is behind CORS, so the app requests it via a JSONP `<script>` tag against `old.reddit.com` (the only host that still serves the callback-wrapped response). Comments are polled on an interval, de-duplicated, queued, and revealed at the chosen pace. There's no server — the whole thing is a static export.

> **Note:** Reddit rate-limits and can block client-side requests. When that happens the app shows a "Can't reach Reddit" state and keeps retrying.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Build the static site:

```bash
npm run build    # outputs to ./out
```

Requires Node 20 (see `.nvmrc`).

## Tech

Next.js 15 (App Router, static export) · React 19 · TypeScript · Tailwind CSS · shadcn/ui · next-themes
