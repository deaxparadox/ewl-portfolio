import { stack } from "../content";

export function Stack() {
  return (
    <section className="stack wrap panel" id="stack" aria-hidden="true">
      <div className="stack-head">
        <div>
          <div className="section-kicker eyebrow reveal">{stack.kicker}</div>
          <h2 className="section-heading reveal">
            My <em>stack.</em>
          </h2>
        </div>
        <p className="reveal">{stack.note}</p>
      </div>
      <div className="stack-board">
        {stack.groups.map((g) => (
          <article key={g.title} className={`stack-group reveal${g.delay}`}>
            <h3>{g.title}</h3>
            <div className="tags">
              {g.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
