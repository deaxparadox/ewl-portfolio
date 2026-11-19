import { contact, profile } from "../content";
import { Year } from "./Year";

export function Contact() {
  return (
    <section className="contact panel" id="contact" aria-hidden="true">
      <div className="wrap contact-content">
        <div className="section-kicker eyebrow reveal">{contact.kicker}</div>
        <h2 className="section-heading reveal">{contact.heading}</h2>
        <div className="contact-bottom reveal">
          <p className="contact-note">{contact.note}</p>
          <div className="contact-actions">
            <a className="button" href={`mailto:${profile.email}?subject=${contact.mailSubject}`}>
              {profile.email} <span className="arrow">↗</span>
            </a>
            <a className="social-link" href={profile.github} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
            <a className="social-link" href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          </div>
        </div>
      </div>
      <footer>
        <div className="wrap footer-inner">
          <span>
            © <Year />
            {` ${profile.name} — BUILT WITH INTENTION.`}
          </span>
          <span>
            YELLOW IS A STATE OF MIND.{" "}
            <a className="back-top" href="#top" data-panel-link="">
              BACK TO TOP ↑
            </a>
          </span>
        </div>
      </footer>
    </section>
  );
}
