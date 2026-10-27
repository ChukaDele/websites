/* eslint-disable @next/next/no-img-element */
import { CookieSettings } from "./CookieSettings";
import { NewsletterField } from "./NewsletterField";
import { FooterMark } from "./FooterMark";

/**
 * Footer (Second Direction), after the Synthesis reference, on the brand's
 * dark green: logo, one line about the work and a contact field on the left;
 * four mono link columns on the right; a contact row; then the name set huge
 * and cropped by the page edge, with a call sticker that appears when the pointer enters it.
 *
 * Kept truthful: the reference's newsletter becomes the real contact address,
 * its office clocks are left out, and its certification badge becomes a call
 * booking sticker.
 */

type Link = [label: string, href: string];

const COLUMNS: Array<[string, Link[]]> = [
  ["Services", [
    ["Services overview", "/services"],
    ["Embedded data team", "/services/embedded-data-team"],
    ["Data projects", "/services/data-projects"],
    ["Data diagnostic", "/data-diagnostic"],
  ]],
  ["Company", [
    ["Who we are", "/how-we-work#about"],
    ["How we work", "/how-we-work"],
    ["Work", "/work"],
  ]],
  ["Learn", [
    ["Research", "/research"],
    ["Insights", "/insights"],
    ["Resources", "/resources"],
  ]],
  ["Connect", [
    ["Schedule a call", "/schedule"],
    ["Contact us", "/contact"],
  ]],
  ["Legal", [
    ["Privacy", "/privacy"],
    ["Cookies", "/cookies"],
    ["Terms", "/terms"],
  ]],
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer id="contact-footer" className="sf">
      <div className="sf-wrap">
        <div className="sf-top">
          <div className="sf-lead">
            <img className="sf-logo" src="/brand/bredge-logo.webp" alt="The Bredge" width="80" height="31" loading="lazy" decoding="async" />
            <p className="sf-about">We connect the systems you already have, reconcile the numbers, and build reporting your team stops arguing with.</p>
          </div>
          <div className="sf-contact">
            <p className="sf-ask">The monthly brief</p>
            <p className="sf-note">New guides, free tools and our data brief, written for people who run the numbers. One email a month.</p>
            <NewsletterField />
          </div>

          <nav className="sf-cols" aria-label="Footer">
            {COLUMNS.map(([heading, links]) => (
              <div key={heading} className="sf-col">
                <p>{heading}</p>
                <ul>
                  {links.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}
                  {heading === "Legal" && <li><CookieSettings /></li>}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="sf-bar">
          <p>
            <span>© {year} The Bredge</span>
            <i aria-hidden="true">·</i>
            <span>Work with us: <a href="mailto:hello@thebredge.com">hello@thebredge.com</a></span>
          </p>
        </div>
      </div>

      <FooterMark />
    </footer>
  );
}
