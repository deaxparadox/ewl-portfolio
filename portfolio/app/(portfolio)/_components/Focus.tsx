import { focus } from "../content";

export function Focus() {
  return (
    <section className="capabilities panel" id="capabilities" aria-hidden="true">
      <div className="wrap">
        <div className="section-kicker eyebrow reveal">{focus.kicker}</div>
        <h2 className="section-heading reveal">{focus.heading}</h2>
        <p className="cap-intro reveal">{focus.intro}</p>
        <div className="cap-grid">
          {focus.cards.map((c) => (
            <article key={c.index} className={`cap-card reveal${c.delay}`}>
              <span className="cap-index">{c.index}</span>
              <span className="cap-icon">{c.icon}</span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
