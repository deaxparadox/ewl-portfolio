import type { ReactNode } from "react";

export type NavLink = { href: string; label: string };
export type AboutNote = { label: string; body: string };
export type FocusCard = { index: string; icon: string; title: string; body: string; delay: string };
export type StackGroup = { title: string; delay: string; tags: string[] };
export type Project = {
  visual: "doc" | "gateway" | "queue";
  wide: boolean;
  delay: string;
  label: string;
  meta: string;
  title: ReactNode;
  body: string;
  tags: string[];
};
export type QueueRow = { text: string; state: string };
export type Step = { no: string; title: string; body: string; symbol: string };

// All portfolio text lives here. Replace the placeholders (name, email, links) in this file only.
export const profile = {
  name: "YOUR NAME",
  email: "hello@yourdomain.com",
  github: "https://github.com/yourusername",
  linkedin: "https://www.linkedin.com/in/yourusername/",
};

export const nav: NavLink[] = [
  { href: "#top", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#capabilities", label: "Focus" },
  { href: "#stack", label: "Stack" },
  { href: "#work", label: "Work" },
  { href: "#approach", label: "Approach" },
];
export const navCta: NavLink = { href: "#contact", label: "Let's talk ↗" };

export const ticker = [
  "Backend systems",
  "AI engineering",
  "Thoughtful architecture",
  "Reliable products",
];

export const about: { kicker: string; heading: ReactNode; asideNote: ReactNode; text: ReactNode; small: AboutNote[] } = {
  kicker: "01 / The person behind the pull request",
  heading: (
    <>
      A little logic.
      <br />A lot of <em>curiosity.</em>
    </>
  ),
  asideNote: (
    <>
      Curious by default.
      <br />
      Practical by design.
    </>
  ),
  text: (
    <>
      I’m interested in the part of software that makes everything{" "}
      <strong>hold together</strong>: clean APIs, data models, asynchronous
      workflows, system boundaries, and AI features that solve an actual
      problem.
    </>
  ),
  small: [
    {
      label: "How I think",
      body: "Start with the problem. Understand the constraints. Design the simplest system that can grow without becoming fragile.",
    },
    {
      label: "What I’m exploring",
      body: "Backend architecture, distributed systems, LLM applications, retrieval workflows, document intelligence, and performance-minded engineering.",
    },
  ],
};

export const focus: { kicker: string; heading: ReactNode; intro: string; cards: FocusCard[] } = {
  kicker: "02 / Areas of focus",
  heading: (
    <>
      The craft is in
      <br />
      the <em>connections.</em>
    </>
  ),
  intro:
    "I like working across the seams — where product thinking meets backend engineering, and where AI has to become a reliable part of a real application.",
  cards: [
    { index: "01 — BUILD", icon: "⌘", title: "Backend engineering", body: "APIs, domain logic, authentication, data modelling, integrations, and maintainable service boundaries.", delay: "" },
    { index: "02 — DESIGN", icon: "◎", title: "System architecture", body: "Clear component responsibilities, async processing, caching, queues, observability, and scaling trade-offs.", delay: " delay-1" },
    { index: "03 — EXPLORE", icon: "✳", title: "Applied AI", body: "LLM integrations, RAG pipelines, embeddings, model-provider abstractions, and useful AI workflows.", delay: " delay-2" },
    { index: "04 — IMPROVE", icon: "↗", title: "Engineering quality", body: "Testing, performance profiling, failure handling, clean code, and making systems easier to operate.", delay: "" },
    { index: "05 — CONNECT", icon: "⌁", title: "Data workflows", body: "Document ingestion, extraction, validation, background jobs, and moving information safely between systems.", delay: " delay-1" },
    { index: "06 — SHIP", icon: "↟", title: "Product thinking", body: "Turning fuzzy requirements into focused features, useful interfaces, and measurable outcomes.", delay: " delay-2" },
  ],
};

export const stack: { kicker: string; note: string; groups: StackGroup[] } = {
  kicker: "03 / Tools in the toolbox",
  note: "Tools are just tools. I choose them based on the problem, the constraints, and the people who will maintain the result.",
  groups: [
    { title: "Backend & APIs", delay: "", tags: ["Python", "Django", "FastAPI", "REST APIs", "Authentication", "Service design"] },
    { title: "Data & async", delay: " delay-1", tags: ["PostgreSQL", "Redis", "Celery", "Kafka", "Background jobs", "Caching"] },
    { title: "AI & retrieval", delay: " delay-2", tags: ["LLMs", "RAG", "Embeddings", "Vector search", "OCR", "Prompt workflows"] },
    { title: "Build & quality", delay: " delay-3", tags: ["Docker", "Git", "Linux", "Pytest", "CI / CD", "Observability"] },
  ],
};

export const work: { kicker: string; heading: ReactNode; note: string; projects: Project[]; queueRows: QueueRow[] } = {
  kicker: "04 / Selected work",
  heading: (
    <>
      Ideas, meet
      <br />
      <em>implementation.</em>
    </>
  ),
  note: "A few directions that reflect the kind of problems I enjoy solving. Replace these concept cards with your shipped projects, repositories, and real outcomes.",
  projects: [
    {
      visual: "doc",
      wide: true,
      delay: "",
      label: "01 / Document intelligence",
      meta: "01 — Data + AI",
      title: (<>DocuLens<br />Document intelligence</>),
      body: "A pipeline that turns messy financial documents into structured, reviewable data — from ingestion and OCR to extraction, validation, and human feedback.",
      tags: ["Python", "OCR", "LLM", "PostgreSQL"],
    },
    {
      visual: "gateway",
      wide: false,
      delay: " delay-1",
      label: "02 / Model infrastructure",
      meta: "02 — Architecture",
      title: (<>Model Gateway<br />One interface, many models</>),
      body: "A provider-agnostic layer that standardises requests, handles provider differences, and makes model selection configurable.",
      tags: ["Adapters", "Strategy", "LLMs"],
    },
    {
      visual: "queue",
      wide: false,
      delay: " delay-2",
      label: "03 / Async workflows",
      meta: "03 — Reliability",
      title: (<>Async Ops<br />Background job engine</>),
      body: "A resilient job-processing service with retries, task status, idempotency, observability, and clear failure paths.",
      tags: ["Celery", "Redis", "Docker"],
    },
  ],
  queueRows: [
    { text: "statement.parse()", state: "DONE" },
    { text: "report.generate()", state: "RUNNING" },
    { text: "email.dispatch()", state: "QUEUED" },
  ],
};

export const approach: { kicker: string; heading: ReactNode; note: string; steps: Step[] } = {
  kicker: "05 / How I work",
  heading: (
    <>
      Think in
      <br />
      <em>systems.</em>
    </>
  ),
  note: "Good engineering is not only about the happy path. It is about making the edge cases, trade-offs, and future changes visible.",
  steps: [
    { no: "01 / FRAME", title: "Understand the problem", body: "Clarify the user, the constraints, and what a successful outcome actually means.", symbol: "⌕" },
    { no: "02 / DESIGN", title: "Map the system", body: "Define boundaries, data flows, failure modes, and the simplest viable architecture.", symbol: "⌘" },
    { no: "03 / BUILD", title: "Make it dependable", body: "Implement in small steps, test assumptions, and handle retries, timeouts, and errors.", symbol: "✳" },
    { no: "04 / LEARN", title: "Measure and improve", body: "Observe real behaviour, find bottlenecks, and iterate without adding needless complexity.", symbol: "↗" },
  ],
};

export const contact = {
  kicker: "06 / Your turn",
  heading: (
    <>
      Have a good
      <br />
      problem? <em>Let&apos;s talk.</em>
    </>
  ),
  note: "I’m always interested in thoughtful products, interesting engineering challenges, and conversations with people who care about how things are built.",
  mailSubject: "Let's%20build%20something",
};
