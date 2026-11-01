import { forwardRef, useEffect, useRef, useState } from "react";
import type { ComponentPropsWithRef, ReactNode } from "react";

type FallbackImageProps = ComponentPropsWithRef<"img"> & {
  fallbackSrc: string;
};

/**
 * An <img> that swaps to a known-good remote copy if the bundled asset is
 * ever missing, so a broken file can never leave an empty frame on the page.
 */
export const FallbackImage = forwardRef<HTMLImageElement, FallbackImageProps>(
  function FallbackImage({ fallbackSrc, onError, ...props }, ref) {
    return (
      <img
        ref={ref}
        {...props}
        onError={(event) => {
          const image = event.currentTarget;
          if (image.dataset.fallbackLoaded !== "true") {
            image.dataset.fallbackLoaded = "true";
            image.src = fallbackSrc;
          }
          onError?.(event);
        }}
      />
    );
  }
);

export function Bolt({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 30 42">
      <path d="M18 0 1 23h12l-3 19 19-27H17L18 0Z" />
    </svg>
  );
}

export function Arrow({ direction = "diagonal" }: { direction?: "diagonal" | "right" }) {
  return direction === "right" ? (
    <svg aria-hidden="true" fill="none" viewBox="0 0 26 26">
      <path d="M2 13h20m-8-8 8 8-8 8" stroke="currentColor" strokeWidth="2" />
    </svg>
  ) : (
    <svg aria-hidden="true" fill="none" viewBox="0 0 26 26">
      <path d="M5 21 21 5M7 5h14v14" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="section-label">
      <Bolt /> <span>{children}</span>
    </p>
  );
}

const GLYPHS = "アカサタナハマヤラワ0123456789#%&/*+⚡";

/**
 * Mono labels that decode from katakana noise once they scroll into view.
 * Falls back to the finished string when motion is reduced.
 */
export function Scramble({ text }: { text: string }) {
  const [output, setOutput] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      setOutput(text);
      return;
    }

    let raf = 0;
    let started = false;

    const run = () => {
      const duration = 620;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const settled = Math.floor(t * text.length * 1.35);
        setOutput(
          text
            .split("")
            .map((char, index) => {
              if (char === " " || index < settled) return char;
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            })
            .join(""),
        );
        raf = t < 1 ? requestAnimationFrame(tick) : 0;
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        observer.disconnect();
        run();
      },
      { threshold: 0.6 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [text]);

  return <span ref={ref}>{output}</span>;
}
