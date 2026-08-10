/* eslint-disable @next/next/no-img-element */
import { CookieSettings } from "./CookieSettings";

const columns: Array<[string, Array<[string, string] | [string, string, "soon"]>]> = [
  ["Services", [
    ["Services overview", "/services"],
    ["Embedded Data Team", "/services/embedded-data-team"],
    ["Data Projects", "/services/data-projects"],
    ["Data Diagnostic", "/data-diagnostic"],
  ]],
  ["Company", [
    ["About", "/about"],
    ["How we work", "/how-we-work"],
    ["Insights", "/insights"],
    ["Resources", "/resources"],
    ["Work", "", "soon"],
  ]],
  ["Connect", [
    ["Schedule a call", "/schedule"],
    ["Contact us", "/contact"],
    ["hello@thebredge.com", "mailto:hello@thebredge.com"],
  ]],
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer id="contact-footer" className="footer-experience">
      <div className="footer-grid" aria-hidden="true">{Array.from({ length: 90 }, (_, index) => <i key={index} />)}</div>
      <div className="section-wrap footer-content">
        <p className="eyebrow light">START A CONVERSATION</p>
        <h2>Got a data problem nobody wants to own?<br /><em>Start there.</em></h2>
        <p>Conflicting numbers. Manual reporting. A dashboard nobody trusts. A pipeline that breaks at the worst possible time. Bring us the messy version.</p>
        <div className="footer-actions">
          <a className="button footer-button" href="/contact">Tell us what’s broken <span aria-hidden="true">→</span></a>
          <a className="footer-mail" href="mailto:hello@thebredge.com">hello@thebredge.com</a>
        </div>

        <div className="footer-directory">
          {columns.map(([heading, links]) => (
            <div key={heading} className="footer-col">
              <p>{heading}</p>
              <ul>
                {links.map((link) => (
                  <li key={link[0]}>
                    {link[2] === "soon"
                      ? <span className="footer-soon">{link[0]} <em>Coming soon</em></span>
                      : <a href={link[1]}>{link[0]}</a>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <img src="/brand/bredge-logo.svg" alt="The Bredge" />
          <p>Data systems for decisions people can trust.</p>
          <small>© {year} The Bredge · <a href="/privacy">Privacy</a> · <a href="/cookies">Cookies</a> · <a href="/terms">Terms</a> · <CookieSettings /></small>
        </div>
      </div>
    </footer>
  );
}
