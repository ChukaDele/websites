/* eslint-disable @next/next/no-img-element */
import { ArrowRight, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { DISCLAIMER, LOGOS, ROW_A, ROW_B } from "../site/experience-marks";
import { Globe } from "./Globe";

/**
 * How we work hero (after the Meska reference): a lime-green framed panel
 * split by fine rules. Left: a chip, the two-line headline, a dark and a
 * light pill, then the lede and, at the foot, where the team has worked.
 * Right: a large glossy globe, cropped by the panel's edge (Globe).
 *
 * Motion: copy rises in, the globe fades up and turns. Reduced motion: still.
 * Styles: app/pages.css (`gh2-`).
 */
export function GlobeHero({ title, lede, chip, primary, secondary }: {
  title: [string, string];
  lede: string;
  chip: { tag: string; text: string; href: string };
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}) {
  const d = (i: number) => ({ "--i": i } as React.CSSProperties);
  const marks = [...ROW_A, ...ROW_B];

  return (
    <section className="gh2" aria-labelledby="gh2-title">
      <div className="gh2-panel">
        <div className="gh2-left">
          <div className="gh2-top">
            <a className="gh2-chip gh2-rise" style={d(0)} href={chip.href}>
              <b>{chip.tag}</b>{chip.text}<CaretRight size={11} weight="bold" aria-hidden="true" />
            </a>
            <h1 id="gh2-title" className="gh2-h1 gh2-rise" style={d(1)}>
              <span>{title[0]}</span> <span>{title[1]}</span>
            </h1>
            <div className="gh2-actions gh2-rise" style={d(2)}>
              <a className="gh2-btn is-dark" href={primary.href}>{primary.label} <CaretRight size={12} weight="bold" aria-hidden="true" /></a>
              <a className="gh2-btn" href={secondary.href}>{secondary.label} <ArrowRight size={12} weight="bold" aria-hidden="true" /></a>
            </div>
          </div>

          <div className="gh2-mid gh2-rise" style={d(3)}>
            <span className="gh2-dots" aria-hidden="true"><i /><i /></span>
            <p className="gh2-lede">{lede}</p>
          </div>

          <div className="gh2-marks gh2-rise" style={d(4)}>
            <p className="gh2-k">Our team has built data at</p>
            <ul aria-label={DISCLAIMER}>
              {marks.map((name) => {
                const logo = LOGOS[name];
                return (
                  <li key={name} className={logo ? "is-logo" : undefined}>
                    {logo ? <img src={logo.src} alt={name} width={logo.w} height={logo.h} loading="lazy" decoding="async" style={{ "--ar": logo.w / logo.h } as React.CSSProperties} /> : name}
                  </li>
                );
              })}
            </ul>
            <p className="gh2-note">{DISCLAIMER}</p>
          </div>
        </div>

        <div className="gh2-right" aria-hidden="true">
          <Globe className="gh2-globe" />
        </div>
      </div>
    </section>
  );
}
