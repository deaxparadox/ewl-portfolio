import { about } from "../content";

export function About() {
  return (
    <section className="about wrap panel" id="about" aria-hidden="true">
      <div className="section-kicker eyebrow reveal">{about.kicker}</div>
      <h2 className="section-heading reveal">{about.heading}</h2>
      <div className="about-grid">
        <aside className="about-aside reveal">
          <div className="index-number">01</div>
          <div className="aside-note">{about.asideNote}</div>
        </aside>
        <div className="reveal delay-1">
          <p className="about-text">{about.text}</p>
          <div className="about-small">
            {about.small.map((s) => (
              <p key={s.label}>
                <span className="micro-label">{s.label}</span>
                {s.body}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
