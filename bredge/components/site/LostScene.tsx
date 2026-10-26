import type { ReactNode } from "react";
import { ParticleField } from "../landing/ParticleField";

/**
 * The secondary-page hero (404, errors): the homepage's dark field with the
 * data-line stream behind it, a big status code, a headline with one accent
 * phrase, a light-hearted lede and a short list of places people usually meant
 * to go. Styles: app/secondary.css (`ls-`).
 */
export type LostLink = { href: string; label: string; note: string };

export function LostScene({ code, eyebrow, title, accent, lede, actions, links, children }: {
  code: string;
  eyebrow: string;
  title: string;
  accent: string;
  lede: string;
  actions: ReactNode;
  links?: LostLink[];
  children?: ReactNode;
}) {
  return (
    <section className="ls" aria-labelledby="ls-title">
      <div className="ls-field" aria-hidden="true"><ParticleField className="ls-canvas" /></div>
      <div className="ls-wrap">
        <div className="ls-copy">
          <p className="ls-eyebrow">{eyebrow}</p>
          <p className="ls-code" aria-hidden="true">{code}</p>
          <h1 id="ls-title">{title} <span className="ls-accent">{accent}</span></h1>
          <p className="ls-lede">{lede}</p>
          {children}
          <div className="ls-actions">{actions}</div>
        </div>
        {links && links.length > 0 && (
          <nav className="ls-links" aria-label="Popular pages">
            <p>Where people usually meant to go</p>
            <ul>
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href}><b>{l.label}</b><span>{l.note}</span><i aria-hidden="true">↗</i></a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
  );
}
