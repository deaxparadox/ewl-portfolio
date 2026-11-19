import { nav, navCta, profile } from "../content";

export function Nav() {
  return (
    <>
      <div className="progress" id="progress" />
      <div className="nav-shell">
        <nav className="wrap" aria-label="Main navigation">
          <div className="brand" aria-label="Portfolio">
            <span className="brand-mark">✳</span>
            <span>
              {profile.name}
              <span style={{ fontWeight: 400, opacity: 0.55 }}> / PORTFOLIO</span>
            </span>
          </div>
          <button className="menu-toggle" id="menuToggle" aria-label="Toggle navigation" aria-expanded="false">
            ☰
          </button>
          <div className="nav-links" id="navLinks">
            {nav.map((n) => (
              <a key={n.href} href={n.href} data-panel-link="">
                {n.label}
              </a>
            ))}
            <a className="nav-cta" href={navCta.href} data-panel-link="">
              {navCta.label}
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
