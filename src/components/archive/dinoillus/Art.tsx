import { useState, type CSSProperties } from "react";

/**
 * Resilient image loader for hotlinked tweet media.
 *
 * pbs.twimg.com answers 403 to any request that carries a foreign Referer
 * header, so every image must load with `referrerPolicy="no-referrer"`
 * (a matching <meta name="referrer"> also sits in index.html as a backstop).
 * On top of that we walk a chain of size variants, so if one rendition is
 * missing or rate-limited the next one takes over, and if the whole chain
 * fails we show a designed placeholder that still links to the source post.
 */

function candidates(src: string): string[] {
  if (src.startsWith('/')) return [src, "https://pbs.twimg.com/media/G53r4JzWMAAEtnS.jpg?name=large"];
  const [base] = src.split("?");
  if (base === src) return [src];
  return [src, `${base}?name=medium`, `${base}?name=small`, base];
}

export function Art({
  src,
  alt,
  className = "",
  imgClassName = "",
  eager = false,
  style,
  label,
  href,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  style?: CSSProperties;
  label?: string;
  href?: string;
}) {
  const chain = candidates(src);
  const [i, setI] = useState(0);
  const [loaded, setLoaded] = useState(eager);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`${
        /\b(absolute|fixed|sticky|static)\b/.test(className) ? "" : "relative"
      } overflow-hidden ${loaded || failed ? "" : "img-shim bg-ink-800"} ${className}`}
      style={style}
    >
      {!failed && (
        <img
          src={chain[i]}
          alt={alt}
          width={1200}
          decoding="async"
          loading={eager ? "eager" : "lazy"}
          referrerPolicy="no-referrer"
          fetchPriority={eager ? "high" : "auto"}
          onError={() => {
            if (i < chain.length - 1) setI(i + 1);
            else setFailed(true);
          }}
          onLoad={() => setLoaded(true)}
          className={`transition-opacity duration-[900ms] [transition-timing-function:var(--ease-soft)] ${
            loaded ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      )}

      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 px-4 text-center">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-ember-400/70"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 1.5 14.3 9.7 22.5 12 14.3 14.3 12 22.5 9.7 14.3 1.5 12 9.7 9.7Z" />
          </svg>
          {label && (
            <p className="font-display text-xl italic text-bone-100">{label}</p>
          )}
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-ash-500">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-ember-300"
              >
                view on X →
              </a>
            ) : (
              "image temporarily unavailable"
            )}
          </p>
        </div>
      )}

      {!loaded && !failed && (
        <span className="pointer-events-none absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-[0.3em] text-ash-500">
          loading
        </span>
      )}
    </div>
  );
}
