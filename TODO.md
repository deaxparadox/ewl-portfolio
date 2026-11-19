# TODO

- [x] FEAT-20261119-1857 — Scaffold the Next.js app (npm only, Node from `.nvmrc`) with a `(portfolio)` route group and its own layout, separate from a minimal root layout (spec: docs/specs/FEAT-20261119-1857-scaffold-route-group.md) [2026-11-19 19:05]
- [ ] FEAT-20261119-1858 — Convert the 7 HTML sections to server components, content in one data file, visuals identical to `portfolio (10).html`, no fonts loaded (spec: docs/specs/FEAT-20261119-1858-sections-server-components.md)
- [ ] FEAT-20261119-1859 — Add the scroll-stacking client component with the same look as the HTML, made fast through the implementation only (rAF + direct DOM writes, GPU layers, no re-renders). Depends on FEAT-20261119-1858 (spec: docs/specs/FEAT-20261119-1859-scroll-stack-client.md)
- [ ] FEAT-20261119-1900 — Match the HTML's accessibility, responsive behaviour (including the small mobile text) and reduced-motion handling exactly. Depends on FEAT-20261119-1859 (spec: docs/specs/FEAT-20261119-1900-a11y-responsive-motion.md)
- [ ] EXP-20261119-1901 — Measure the HTML original against the Next.js build with Lighthouse and the browser performance panel, report the numbers and a recommendation (spec: docs/specs/EXP-20261119-1901-perf-measurement.md)
