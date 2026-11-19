import { approach } from "../content";

export function Approach() {
  return (
    <section className="approach wrap panel" id="approach" aria-hidden="true">
      <div className="approach-intro">
        <div>
          <div className="section-kicker eyebrow reveal">{approach.kicker}</div>
          <h2 className="section-heading reveal">{approach.heading}</h2>
        </div>
        <p className="reveal">{approach.note}</p>
      </div>
      <div className="steps">
        {approach.steps.map((s) => (
          <article key={s.no} className="step reveal">
            <span className="step-no">{s.no}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            <span className="step-symbol">{s.symbol}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
