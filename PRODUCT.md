# Product

## Register

product

## Users

People following a live event — a Formula 1 race, a cricket match, a game — who want the crowd reaction without sitting inside Reddit's thread. They're usually on a second screen (phone or laptop next to a TV), glancing over, wanting the pulse of the room: the "WHAT JUST HAPPENED" moments as they land. Low effort, high frequency of glances, short attention per glance.

## Product Purpose

Turn a Reddit post's comment section into a live, auto-scrolling feed of reactions. Paste a thread URL, hit start, and watch new comments stream in at a readable pace. Success is a feed that feels alive and effortless to watch — you can look away and look back and instantly re-orient, and you never have to touch it once it's running.

## Brand Personality

Live, effortless, in-the-moment. Three words: **immediate, unobtrusive, alive.** The tool is a window, not a dashboard — it should feel like watching a chat scroll during a stream, not operating software. Voice is plain and human; no jargon leaks to the surface.

## Anti-references

- Developer/debug UI: exposed queue counts, "display rate 0.36 sec/comment", tuning knobs shown by default. The current state is exactly this — the thing to move away from.
- Reddit's own dense, chrome-heavy thread view.
- Generic shadcn-card-grid dashboards. This is one focused stream, not a panel of widgets.

## Design Principles

- **The feed is the product.** Everything else (URL input, rate controls) is setup that gets out of the way once the stream is running.
- **Glanceable.** A returning glance should re-orient instantly: newest at a consistent edge, clear author/time, quiet visual noise.
- **Calm motion, real information.** Motion signals "a new comment arrived," never decoration. Nothing bounces.
- **Controls are progressive.** Advanced tuning (refresh rate, display pacing) is available but tucked away, not the first thing you see.

## Accessibility & Inclusion

WCAG AA. Body text ≥4.5:1 in both themes. Full light/dark support following system preference with a manual override. Respect `prefers-reduced-motion`: new-comment entrances become an instant/crossfade appearance rather than slide/animate.
