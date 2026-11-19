import { work } from "../content";

const PAPER_LINES = ["yellow", "", "short", "", "short", "yellow", "", "short"];

function DocVisual() {
  return (
    <div className="paper-stack">
      <span className="scan-corner a"></span>
      <span className="scan-corner b"></span>
      {PAPER_LINES.map((m, i) => (
        <div key={i} className={`paper-line${m ? ` ${m}` : ""}`}></div>
      ))}
    </div>
  );
}

function GatewayVisual() {
  return (
    <div className="node-orbit">
      <div className="node-core">AI</div>
      <span className="node n1">LLM</span>
      <span className="node n2">API</span>
      <span className="node n3">RAG</span>
      <span className="node n4">ML</span>
    </div>
  );
}

function QueueVisual() {
  return (
    <div className="queue-window">
      <div className="window-bar">
        <i></i>
        <i></i>
        <i></i>
      </div>
      {work.queueRows.map((r) => (
        <div key={r.text} className="queue-row">
          <span className="queue-dot"></span>
          <span>{r.text}</span>
          <b>{r.state}</b>
        </div>
      ))}
    </div>
  );
}

const VISUALS = { doc: DocVisual, gateway: GatewayVisual, queue: QueueVisual };

export function Work() {
  return (
    <section className="projects panel" id="work" aria-hidden="true">
      <div className="wrap">
        <div className="project-top">
          <div>
            <div className="section-kicker eyebrow reveal">{work.kicker}</div>
            <h2 className="section-heading reveal">{work.heading}</h2>
          </div>
          <p className="reveal">{work.note}</p>
        </div>
        <div className="project-grid">
          {work.projects.map((p) => {
            const Visual = VISUALS[p.visual];
            return (
              <article key={p.label} className={`project-card${p.wide ? " wide" : ""} reveal${p.delay}`}>
                <div className={`project-visual visual-${p.visual}`}>
                  <span className="visual-label" style={p.visual === "gateway" ? { color: "#f5f2e9" } : undefined}>
                    {p.label}
                  </span>
                  <Visual />
                </div>
                <div className="project-content">
                  <div className="project-meta">
                    <span>{p.meta}</span>
                    <span className="concept">CONCEPT / REPLACE</span>
                  </div>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.body}</p>
                  </div>
                  <div className="project-foot">
                    <div className="project-tags">
                      {p.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                    <span className="project-arrow">↗</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
