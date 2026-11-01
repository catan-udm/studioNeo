'use client';

import { useId, useLayoutEffect, useEffect, useRef, useState } from "react";
import { createGlassLensMap, type GlassLensMap } from "@/utils/glassLens";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type SurfaceLens = GlassLensMap & { id: string; element: HTMLElement };

export default function GlassRefraction() {
  const rawId = useId();
  const prefix = `glass-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [lenses, setLenses] = useState<SurfaceLens[]>([]);
  const definitions = useRef<SVGSVGElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    // SVG backdrop filters work in Chromium. Other engines keep the CSS glass
    // fallback rather than displaying a missing or partially supported filter.
    const supported =
      /Chrome\/|Chromium\/|Edg\//.test(navigator.userAgent) &&
      CSS.supports("backdrop-filter", 'url("#glass-probe")');
    if (!supported) return;

    const surfaces = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".studio-nav-header .bubble-island, .studio-nav-header .nav-burger-popover",
      ),
    );
    const cache = new Map<HTMLElement, { key: string; lens: SurfaceLens }>();
    let frame = 0;
    let disposed = false;

    const measure = () => {
      frame = 0;
      let changed = false;
      for (const [index, element] of surfaces.entries()) {
        const style = getComputedStyle(element);
        if (style.display === "none") continue;
        const insetX = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
        const insetY = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        const width = parseFloat(style.width) - insetX;
        const height = parseFloat(style.height) - insetY;
        if (!(width > 2 && height > 2)) continue;

        const radius = Math.max(0, Math.min(parseFloat(style.borderTopLeftRadius), width / 2, height / 2));
        const key = `${width.toFixed(2)}:${height.toFixed(2)}:${radius}:${window.devicePixelRatio}`;
        if (cache.get(element)?.key === key) continue;
        try {
          const lens = { ...createGlassLensMap(width, height, radius), id: `${prefix}-${index}`, element };
          cache.set(element, { key, lens });
          changed = true;
        } catch {
          // Leave the frosted fallback intact if canvas access is restricted.
        }
      }
      if (changed && !disposed) setLenses(Array.from(cache.values(), ({ lens }) => lens));
    };

    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    surfaces.forEach((element) => observer.observe(element));
    window.addEventListener("resize", schedule);
    document.fonts?.ready?.then(schedule);
    measure();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      for (const element of surfaces) {
        element.style.removeProperty("--glass-refraction");
        element.removeAttribute("data-glass-lens");
      }
    };
  }, [prefix]);

  useIsomorphicLayoutEffect(() => {
    if (!definitions.current) return;
    for (const lens of lenses) {
      lens.element.style.setProperty("--glass-refraction", `url("#${lens.id}")`);
      lens.element.dataset.glassLens = "ready";
    }
  }, [lenses]);

  return (
    <svg
      ref={definitions}
      className="glass-filter-defs"
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
    >
      <defs>
        {lenses.map((lens) => (
          <filter
            key={lens.id}
            id={lens.id}
            filterUnits="userSpaceOnUse"
            primitiveUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={lens.width}
            height={lens.height}
            colorInterpolationFilters="sRGB"
          >
            {/* Pixel dimensions are essential: percentages can misalign feImage
                in a backdrop filter and shift the entire pane instead. */}
            <feImage
              href={lens.url}
              xlinkHref={lens.url}
              x="0"
              y="0"
              width={lens.width}
              height={lens.height}
              preserveAspectRatio="none"
              result="lens-map"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="lens-map"
              scale={lens.scale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="refracted"
            />
            <feMerge><feMergeNode in="refracted" /></feMerge>
          </filter>
        ))}
      </defs>
    </svg>
  );
}
