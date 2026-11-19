# EXP-20261119-1901 — Measure HTML original vs Next.js build

## Question
Is the Next.js build as fast as or faster than the original HTML, and where are the remaining costs?

## Candidates
1. `portfolio (10).html` served as a static file.
2. Next.js production build (`npm run build && npm start`).

## How results are judged
- Lighthouse (mobile and desktop): LCP, CLS, TBT, total JS size.
- Browser performance panel: frame time while scrolling through all panels, dropped frames, long tasks.
- Same machine, same browser, same throttling, 3 runs each, median reported.
- Visual parity is not judged here; it belongs to the feature items.

## Scratch boundary
Measurement only. No edits to project source, dependencies, or branches. Lighthouse runs through `npx` (no global install); any helper scripts live in the scratchpad directory, not the repo. If a tool needs a project dependency, stop and ask.

## Findings
Not run yet. Runs after FEAT-20261119-1859.
