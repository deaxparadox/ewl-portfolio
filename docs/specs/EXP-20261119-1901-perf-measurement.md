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

## Findings (run 2026-11-20 09:49)
**Setup.** Original HTML and the Next.js production build (`npm run build && npm start`) both served over HTTP on localhost, the original through a small gzip server so both compress. Google Chrome (headless), Lighthouse 13.6.0 (run with `npx`, nothing installed), 12 CPU cores. 3 runs each, medians reported, raw run values kept in the scratchpad. Scroll test: a real mouse wheel through all 7 panels, 1x and 4x CPU slowdown.

**1. Page load (Lighthouse).**

| | Mobile original | Mobile Next.js | Desktop original | Desktop Next.js |
|---|---|---|---|---|
| Score | 99 | 99 | 100 | 100 |
| LCP / FCP | 1735 ms | 1618 ms | 458 ms | 422 ms |
| CLS | 0 | 0 | 0 | 0 |
| Total blocking time | 7.5 ms | **107 ms** | 34 ms | 2 ms |
| Time to interactive | 1771 ms | **2116 ms** | 538 ms | 517 ms |
| JS boot time | 20 ms | **300 ms** | 5 ms | 85 ms |
| Download size | 16.6 KB | **161 KB** | 16.6 KB | 161 KB |

The first paint is as fast or slightly faster (the page is prerendered HTML with CSS). The cost is the framework: 6 script files, about 140 KB of JavaScript, of which about 122 KB is React and the Next.js runtime (the two biggest files, 72 KB and 50 KB). The page's own code is a few KB. On a slowed mobile CPU that shows up as about 100 ms of blocking time and a slower time to interactive. No user-visible effect on layout (CLS 0).

**2. Scrolling work (the part we optimised), Next.js vs original, median of 3.**

| Chrome work during the scroll | 1x CPU | 4x CPU |
|---|---|---|
| Layouts | 165 -> 61 (**-63%**) | 165 -> 59 (-64%) |
| Layout time | 27 -> 15 ms (-44%) | 100 -> 62 ms (-38%) |
| Style recalculations | 394 -> 309 (-22%) | 395 -> 303 (-23%) |
| Style recalc time | 173 -> 105 ms (-40%) | 553 -> 414 ms (-25%) |
| Total main-thread task time | 649 -> 507 ms (**-22%**) | 2035 -> 1993 ms (-2%) |
| Script time | 46 -> 63 ms (+38%) | 154 -> 242 ms (+57%) |
| Frame time p95 / p99 / worst | unchanged | unchanged |
| Frames over 50 ms | 38 -> 26 | 35 -> 45 |

So the browser does clearly less layout and style work per scroll, as designed (no per-frame reset of all panels, progress bar on `transform`). That did **not** show up as smoother frames in this test: p95, p99 and worst frame are the same, and the median frame time and the over-50 ms counts jump around between runs. Caveat: headless Chrome here has no GPU and draws in software, which probably dominates frame time and hides the saving. A real-GPU check on a phone or laptop would be needed to confirm a visible gain. Script time is higher in the Next.js build; I did not find why (likely React/Next.js code that wraps `history.replaceState` and runs around scroll events). It is about 17 ms over a 6-second scroll at 1x.

**3. `contain` (left out of FEAT-20261119-1859).** Injected at runtime on the panels (`contain: layout style`, and `layout paint style`), 3 runs each at 1x and 4x. Layouts, style recalculations and task time are unchanged within noise (and slightly worse at 1x). **No benefit, so it stays out.**

**4. Side-discovery (logged as its own item).** The favicon is still the default Next.js logo from the project generator, requested twice per load (2.9 KB each). The original has no favicon.

## Recommendation
- The visual and behaviour work is done and the scrolling does measurably less work. Keep as built; do not add `contain`.
- The honest cost of Next.js is about 140 KB of JavaScript and about 100 ms of extra main-thread blocking on a slowed mobile CPU. That cost comes from the framework, not from our code. Options if it matters to you: (a) accept it; (b) open a separate item to check whether a lighter setup can drop part of it, for example whether the two small client components force extra hydration. I would start with (a) and only do (b) if your real-device testing shows a problem. I did not try (b) because this experiment may not change project source.
- Confirm the scrolling gain on a real GPU (a laptop or phone) before claiming it to anyone; this headless test could not show it.
- Replace or remove the default favicon (new item).
