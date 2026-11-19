import { profile, ticker } from "../content";

function TickerGroup({ hidden }: { hidden?: boolean }) {
  return (
    <div className="ticker-group" aria-hidden={hidden ? "true" : undefined}>
      {ticker.map((t) => (
        <span key={t} style={{ display: "contents" }}>
          <span>{t}</span>
          <span className="ticker-star">✳</span>
        </span>
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <header className="hero panel is-active" id="top" aria-label="Home" aria-hidden="false">
      <div className="hero-inner wrap">
        <div className="hero-copy">
          <div className="availability">
            <span></span> Open to interesting problems
          </div>
          <h1>
            BUILDING
            <br />
            <span className="line-two">
              <span className="outline-word">BEYOND</span> THE
            </span>
            <br />
            OBVIOUS.
          </h1>
          <p className="hero-intro">
            Hey, I’m <strong>{profile.name}</strong> — a backend &amp; AI engineer who enjoys turning complex ideas into
            dependable, useful software.
          </p>
          <div className="hero-actions">
            <a className="button" href="#work">
              Explore my work <span className="arrow">↗</span>
            </a>
            <a className="button outline" href="#about">
              A little about me <span className="arrow">↓</span>
            </a>
          </div>
        </div>
        <div className="hero-art" aria-label="Abstract orbit illustration">
          <div className="orbit">
            <span className="orbit-dot"></span>
          </div>
          <div className="sun-card">
            <div className="card-code">
              SYSTEM / THINKING
              <br />
              MODE: ON
            </div>
            <div className="card-caption">
              <div>
                Curiosity, engineered<strong>Make it work. Make it matter.</strong>
              </div>
              <span>✳ 01</span>
            </div>
          </div>
          <div className="sticker">
            <div>
              <b>∞</b>Ideas into
              <br />
              systems
            </div>
          </div>
        </div>
      </div>

      <div className="ticker" aria-label="Areas of focus">
        <div className="ticker-track">
          <TickerGroup />
          <TickerGroup hidden />
        </div>
      </div>
      <div className="hero-index">SCROLL / SWIPE TO EXPLORE — 2026</div>
    </header>
  );
}
