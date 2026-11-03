'use client';

import React, { useEffect, useLayoutEffect, useState } from "react";
import { LiquidGlass } from "simple-liquid-glass";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type GlassFilterSpec = {
  id: string;
  width: number;
  height: number;
  radius: number;
  bezel: number;
  scale: number;
  blur: number;
  href: string;
  /**
   * Filter-space resolution factor. Chromium resolves `backdrop-filter: url()`
   * userSpaceOnUse lengths in device pixels, so the filter region, feImage and
   * displacement scale are multiplied by devicePixelRatio there. 1 elsewhere.
   */
  res?: number;
};

const mapCache = new Map<string, string>();

/** Interior magnification strength (fraction of max displacement) for elongated pills. */
const FILL_MAGNIFY = 0.35;

/** Pills at least this wide-to-tall get the full-surface lens (desktop studioNav). */
const FILL_ASPECT = 4;

export const NEUTRAL_REFRACTION_MAP =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='rgb(128,128,128)'/%3E%3C/svg%3E";

/**
 * Generates an 8-bit sRGB displacement map for a single floating island
 * (rounded capsule or rounded card) in its own local coordinates (0..width, 0..height)
 * using its exact Signed Distance Function (SDF) and outward unit normal.
 *
 * - Flat central plateau (`distIn >= bezel`): zero displacement (`R=128, G=128`)
 *   so text and icons inside the island remain crisp and undistorted.
 * - Curved meniscus bevel (`0 <= distIn < bezel`): smoothstep lens profile
 *   pulls backdrop pixels inward (`-normal`) around all four edges and corners.
 */
export function buildRefractionMapDataUri(
  rawWidth: number,
  rawHeight: number,
  rawRadius: number,
  rawBezel: number,
  fill = false,
): string {
  const width = Math.max(16, Math.round(rawWidth));
  const height = Math.max(16, Math.round(rawHeight));
  const maxR = Math.min(width / 2, height / 2);
  const radius = Math.max(2, Math.min(rawRadius, maxR));
  const bezel = Math.max(4, Math.min(rawBezel, maxR * 0.85));

  const cacheKey = `${width}x${height}r${radius.toFixed(1)}b${bezel.toFixed(1)}${fill ? "f" : ""}`;
  const cached = mapCache.get(cacheKey);
  if (cached) return cached;

  if (typeof document === "undefined") return NEUTRAL_REFRACTION_MAP;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return NEUTRAL_REFRACTION_MAP;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const halfW = width / 2;
  const halfH = height / 2;
  const boxX = halfW - radius;
  const boxY = halfH - radius;

  for (let y = 0; y < height; y++) {
    const py = y + 0.5 - halfH;
    const qy = Math.abs(py) - boxY;
    const oy = qy > 0 ? qy : 0;
    const signY = py < 0 ? -1 : 1;

    for (let x = 0; x < width; x++) {
      const px = x + 0.5 - halfW;
      const qx = Math.abs(px) - boxX;
      const ox = qx > 0 ? qx : 0;
      const signX = px < 0 ? -1 : 1;

      const outLen = Math.hypot(ox, oy);
      const inDist = Math.min(Math.max(qx, qy), 0);
      const sdf = outLen + inDist - radius;

      let dx = 0;
      let dy = 0;

      // Analytical subpixel boundary anti-aliasing:
      // Over a 1.5px boundary zone around sdf = 0, fade displacement smoothly to 0
      const edgeCoverage = Math.max(0, Math.min(1, (0.5 - sdf) / 1.5));
      const aa = edgeCoverage * edgeCoverage * (3 - 2 * edgeCoverage);

      if (aa > 0.001) {
        const distIn = Math.max(0, -sdf);

        if (distIn < bezel) {
          let nx = 0;
          let ny = 0;
          if (outLen > 1e-5) {
            nx = signX * (ox / outLen);
            ny = signY * (oy / outLen);
          } else if (qx > qy) {
            nx = signX;
          } else {
            ny = signY;
          }

          // Toroidal lens meniscus:
          // Displacement starts at 0 at the outer boundary (distIn = 0),
          // reaches peak refraction in the center of the rim,
          // and smoothly flattens back to 0 at the flat center plateau (distIn = bezel).
          const t = distIn / bezel;
          const lensProfile = Math.sin(t * Math.PI);
          const refract = lensProfile * aa;

          // Sample inward (-n) so background bends around the convex lens rim
          dx = -nx * refract;
          dy = -ny * refract;
        }

        // Elongated islands (desktop studioNav): the rim alone leaves the long
        // flat run looking untouched. Add a gentle convex-lens magnification
        // across the whole surface so the lens fills the element end to end.
        if (fill) {
          dx += (-px / halfW) * FILL_MAGNIFY * aa;
          dy += (-py / halfH) * FILL_MAGNIFY * aa;
        }
      }

      const idx = (y * width + x) * 4;
      data[idx] = Math.max(0, Math.min(255, Math.round(127.5 + dx * 127.5)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(127.5 + dy * 127.5)));
      data[idx + 2] = 128;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const uri = canvas.toDataURL("image/png");
  mapCache.set(cacheKey, uri);
  return uri;
}

function makeCapsuleSpec(id: string, width: number, height: number): GlassFilterSpec {
  const w = Math.max(24, Math.ceil(width));
  const h = Math.max(24, Math.ceil(height));
  const radius = Math.min(w, h) / 2;
  const fill = w / h >= FILL_ASPECT;
  // Compact islands keep the bezel in the outer rim (~12-13px). Elongated pills
  // widen it to span the full half-thickness so the lens fills the element.
  const bezel = fill
    ? Math.round(radius * 0.85)
    : Math.min(14, Math.max(9, Math.round(Math.min(w, h) * 0.28)));
  const scale = 24;
  return {
    id,
    width: w,
    height: h,
    radius,
    bezel,
    scale,
    blur: 0,
    href: buildRefractionMapDataUri(w, h, radius, bezel, fill),
  };
}

function makePopoverSpec(id: string, width: number, height: number): GlassFilterSpec {
  const w = Math.max(160, Math.round(width));
  const h = Math.max(160, Math.round(height));
  const radius = 18;
  const bezel = 16;
  const scale = 26;
  return {
    id,
    width: w,
    height: h,
    radius,
    bezel,
    scale,
    blur: 0,
    href: buildRefractionMapDataUri(w, h, radius, bezel),
  };
}

/**
 * SSR-safe initial specs. The first client render must match the server HTML
 * byte-for-byte, so the real canvas-generated refraction maps are only applied
 * after hydration (see `syncSpecs`). Using the neutral map here guarantees React
 * later patches every `<feImage href>` in the DOM, including islands whose
 * measured size equals the default size (left bubble, burger bubble).
 */
function makeInitialSpecs(): GlassFilterSpec[] {
  const neutral = (spec: GlassFilterSpec): GlassFilterSpec => ({
    ...spec,
    href: NEUTRAL_REFRACTION_MAP,
  });
  return [
    neutral(makeCapsuleSpec("liquid-glass-left", 46, 46)),
    neutral(makeCapsuleSpec("liquid-glass-slider", 258, 46)),
    neutral(makeCapsuleSpec("liquid-glass-burger", 42, 42)),
    neutral(makePopoverSpec("liquid-glass-popover", 238, 326)),
  ];
}

export function isWebKitEngine(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isMacSafari =
    /Safari\//.test(ua) &&
    !/Chrome\/|Chromium\/|Edg\//.test(ua) &&
    !/Firefox\//.test(ua);
  return isIOS || isMacSafari;
}

/**
 * Per-island liquid glass refraction hook.
 * - Measures each floating island (`.studio-nav-left`, `.studio-nav-slider`,
 *   `.nav-burger-bubble`, `.nav-burger-popover`) in its own local coordinates
 *   so the warp applies ONLY to the individual floating islands and never to
 *   the whole navigation bar.
 * - Also syncs `--moz-lens-x` and `--moz-lens-y` on each island so Firefox's
 *   `-moz-element(#main-content)` per-island lens stays pixel-locked to the
 *   live page during scroll and transitions.
 */
export function useLiquidRefraction(refs: {
  leftRef: React.RefObject<HTMLElement | null>;
  sliderRef: React.RefObject<HTMLElement | null>;
  burgerRef: React.RefObject<HTMLElement | null>;
  popoverRef: React.RefObject<HTMLElement | null>;
  deps?: ReadonlyArray<unknown>;
}): GlassFilterSpec[] {
  const [specs, setSpecs] = useState<GlassFilterSpec[]>(makeInitialSpecs);

  useEffect(() => {
    if (typeof window === "undefined" || typeof CSS === "undefined") return;
    const ua = navigator.userAgent;
    const isBlink =
      ("chrome" in window || /Chrome\/|Chromium\/|Edg\//.test(ua)) &&
      !/Firefox\//.test(ua);
    const cssOk = CSS.supports("backdrop-filter", "url(#liquid-glass-slider)");
    if (isBlink && cssOk) {
      document.documentElement.setAttribute("data-liquid-refraction", "true");
    } else {
      document.documentElement.removeAttribute("data-liquid-refraction");
    }

    if (isWebKitEngine()) {
      document.documentElement.setAttribute("data-webkit-liquid", "true");
    } else {
      document.documentElement.removeAttribute("data-webkit-liquid");
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    const isMozSupported =
      typeof CSS !== "undefined" &&
      CSS.supports("background-image", "-moz-element(#main-content)");

    let offsetTicking = false;
    const syncOffsets = () => {
      if (!isMozSupported) return;
      if (offsetTicking) return;
      offsetTicking = true;
      requestAnimationFrame(() => {
        offsetTicking = false;
        const mainEl = document.getElementById("main-content");
        if (!mainEl) return;
        const mainRect = mainEl.getBoundingClientRect();
        const islands = [
          refs.leftRef.current,
          refs.sliderRef.current,
          refs.burgerRef.current,
          refs.popoverRef.current,
        ];
        for (const el of islands) {
          if (!el) continue;
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          const bLeft = parseFloat(cs.borderLeftWidth) || 0;
          const bTop = parseFloat(cs.borderTopWidth) || 0;
          el.style.setProperty("--moz-lens-x", `${(mainRect.left - (r.left + bLeft)).toFixed(2)}px`);
          el.style.setProperty("--moz-lens-y", `${(mainRect.top - (r.top + bTop)).toFixed(2)}px`);
        }
      });
    };

    const syncSpecs = () => {
      const leftRect = refs.leftRef.current?.getBoundingClientRect();
      const sliderRect = refs.sliderRef.current?.getBoundingClientRect();
      const burgerRect = refs.burgerRef.current?.getBoundingClientRect();
      const popEl = refs.popoverRef.current;
      const popW = popEl ? popEl.offsetWidth || 238 : 238;
      const popH = popEl ? popEl.offsetHeight || 326 : 326;

      // Firefox applies the filter via `filter:` on ::before (CSS px space).
      // Chromium's backdrop-filter path resolves the filter in device pixels on
      // real hardware (desktop and phones alike), so scale by devicePixelRatio.
      const res = isMozSupported ? 1 : window.devicePixelRatio || 1;
      const next: GlassFilterSpec[] = [
        makeCapsuleSpec("liquid-glass-left", leftRect?.width || 46, leftRect?.height || 46),
        makeCapsuleSpec("liquid-glass-slider", sliderRect?.width || 258, sliderRect?.height || 46),
        makeCapsuleSpec("liquid-glass-burger", burgerRect?.width || 42, burgerRect?.height || 42),
        makePopoverSpec("liquid-glass-popover", popW, popH),
      ].map((spec) => ({ ...spec, res }));

      setSpecs((prev) => {
        const unchanged =
          prev.length === next.length &&
          prev.every(
            (p, idx) =>
              (p.res ?? 1) === (next[idx].res ?? 1) &&
              Math.abs(p.width - next[idx].width) < 1 &&
              Math.abs(p.height - next[idx].height) < 1 &&
              p.href === next[idx].href &&
              p.href !== "" &&
              p.href !== NEUTRAL_REFRACTION_MAP,
          );
        return unchanged ? prev : next;
      });
      syncOffsets();
    };

    syncSpecs();
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        syncSpecs();
      });
    }
    const rafSync = requestAnimationFrame(syncSpecs);
    const tSync1 = setTimeout(syncSpecs, 60);
    const tSync2 = setTimeout(syncSpecs, 180);
    const tSync3 = setTimeout(syncSpecs, 440);

    // Keep Firefox -moz-element offsets locked during the 480ms detach transition (Firefox only)
    let animFrame = 0;
    if (isMozSupported) {
      const startTime = performance.now();
      const tickTransition = () => {
        syncOffsets();
        if (performance.now() - startTime < 540) {
          animFrame = requestAnimationFrame(tickTransition);
        }
      };
      animFrame = requestAnimationFrame(tickTransition);
    }

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => syncSpecs())
        : null;

    if (ro) {
      if (refs.leftRef.current) ro.observe(refs.leftRef.current);
      if (refs.sliderRef.current) ro.observe(refs.sliderRef.current);
      if (refs.burgerRef.current) ro.observe(refs.burgerRef.current);
      if (refs.popoverRef.current) ro.observe(refs.popoverRef.current);
    }

    if (isMozSupported) {
      window.addEventListener("scroll", syncOffsets, { passive: true });
    }
    window.addEventListener("resize", syncSpecs);
    // Re-sync whenever devicePixelRatio changes (zoom, moving between screens).
    let dprMql: MediaQueryList | null = null;
    const watchDpr = () => {
      dprMql?.removeEventListener("change", onDprChange);
      dprMql = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      dprMql.addEventListener("change", onDprChange);
    };
    function onDprChange() {
      syncSpecs();
      watchDpr();
    }
    watchDpr();
    return () => {
      cancelAnimationFrame(rafSync);
      clearTimeout(tSync1);
      clearTimeout(tSync2);
      clearTimeout(tSync3);
      if (animFrame) cancelAnimationFrame(animFrame);
      ro?.disconnect();
      if (isMozSupported) {
        window.removeEventListener("scroll", syncOffsets);
      }
      window.removeEventListener("resize", syncSpecs);
      dprMql?.removeEventListener("change", onDprChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs.deps ?? []);

  return specs;
}

export function LiquidGlassDefs({ specs }: { specs: GlassFilterSpec[] }) {
  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (!root.hasAttribute("data-liquid-refraction")) return;

    // Invalidate Chromium's cached PaintFilter keyframe animation bindings
    // whenever specs change (e.g. after hydration, viewport resize, or font load).
    root.removeAttribute("data-liquid-refraction");
    const queried = document.querySelectorAll<HTMLElement>(
      ".studio-nav-left, .studio-nav-slider, .nav-burger-bubble, .nav-burger-popover"
    );
    queried.forEach((el) => {
      void window.getComputedStyle(el, "::before").backdropFilter;
    });
    root.setAttribute("data-liquid-refraction", "true");
    queried.forEach((el) => {
      void window.getComputedStyle(el, "::before").backdropFilter;
    });
  }, [specs]);

  return (
    <svg
      className="liquid-glass-svg-defs"
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {specs.map((spec) => {
          const res = spec.res ?? 1;
          const w = Math.ceil(spec.width * res);
          const h = Math.ceil(spec.height * res);
          return (
            <filter
              key={`${spec.id}-${w}x${h}`}
              id={spec.id}
              x="0"
              y="0"
              width={w}
              height={h}
              filterUnits="userSpaceOnUse"
              primitiveUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feImage
                suppressHydrationWarning
                href={spec.href}
                xlinkHref={spec.href}
                x="0"
                y="0"
                width={w}
                height={h}
                preserveAspectRatio="none"
                result="refractMap"
              />
              {/* Single-pass displacement: all channels move together, so saturated
                  backdrop colors stay intact at the rim with no RGB separation. */}
              <feDisplacementMap
                in="SourceGraphic"
                in2="refractMap"
                scale={spec.scale * res}
                xChannelSelector="R"
                yChannelSelector="G"
                result="refracted"
              />
            </filter>
          );
        })}
      </defs>
    </svg>
  );
}

/**
 * Optical WebGL refraction underlay lens for WebKit/iOS devices.
 * Sits at z-index: 0 beneath the island content with pointer-events: none.
 * On Chromium and Firefox, it returns null to preserve native high-fps filter pipelines.
 * On iOS/iPadOS/macOS WebKit, it mounts a hardware-accelerated WebGL refraction canvas
 * that dynamically samples #main-content and renders true optical distortion.
 */
export function LiquidGlassLens({
  radius = 23,
  scale = 24,
  className = '',
}: {
  radius?: number;
  scale?: number;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [isWebKit, setIsWebKit] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsWebKit(isWebKitEngine());
  }, []);

  if (!mounted || !isWebKit) return null;

  return (
    <LiquidGlass
      className={`liquid-glass-optical-lens ${className}`}
      radius={radius}
      material="clear"
      blur={0.5}
      iosMinBlur={0.5}
      iosBlurMode="off"
      displacementScale={scale}
      frost={0}
      saturation={115}
      aberrationIntensity={0.08}
      glassColor="rgba(255, 255, 255, 0.05)"
      borderColor="rgba(255, 255, 255, 0.4)"
      backdropSelector="#main-content"
      renderer="webgl"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        borderRadius: 'inherit',
        overflow: 'hidden',
      }}
    />
  );
}

