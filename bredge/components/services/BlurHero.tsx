import "@fontsource/anton/400.css";

/**
 * Service hero after the motion-poster reference: a full-screen photo turned
 * black and white, motion-blurred and blown out, with lime only in the
 * highlights (pre-processed: /media/services/dp-hero-*.webp) under film
 * grain. Top left a meta line; mid left a short text and a full-width
 * button; an optional handwritten line on the right; the headline huge in a
 * condensed face across the foot, fitted to the width.
 *
 * Motion: the photo drifts slowly sideways (it reads as movement); the copy
 * rises in. Reduced motion: still. Styles: app/services.css (`bh-`).
 */
export function BlurHero({ eyebrow, title, script, text, cta, image }: {
  eyebrow: string;
  /** The big condensed line across the foot. */
  title: string;
  /** Optional handwritten line on the right. */
  script?: string;
  text: string;
  cta: { label: string; href: string };
  image: { src: string; srcSet: string };
}) {
  const d = (i: number) => ({ "--i": i } as React.CSSProperties);
  return (
    <section className="bh" aria-labelledby="bh-title">
      <div className="bh-photo" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} srcSet={image.srcSet} sizes="100vw" alt="" fetchPriority="high" />
      </div>
      <span className="bh-grain" aria-hidden="true" />

      <div className="bh-inner">
        <p className="bh-meta bh-rise" style={d(0)}>{eyebrow}</p>

        <div className="bh-mid">
          <div className="bh-lead bh-rise" style={d(1)}>
            <p>{text}</p>
            <a className="bh-btn" href={cta.href}>{cta.label}</a>
          </div>
          {script && <p className="bh-script bh-rise" style={d(2)} aria-hidden="true">{script}</p>}
        </div>

        <h1 id="bh-title" className="bh-h1 bh-rise" style={d(3)}>
          {title}
          {script && <span className="sr-only"> {script}</span>}
        </h1>
      </div>
    </section>
  );
}
