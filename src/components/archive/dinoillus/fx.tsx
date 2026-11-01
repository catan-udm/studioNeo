import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

/* film grain overlay, sits above everything */
export function Grain() {
  return (
    <div
      aria-hidden
      className="grain pointer-events-none fixed -inset-[4%] z-[70]"
    />
  );
}

/* a warm pool of light that follows the cursor — the site "carves light" like Dino does */
export function CursorLight() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    if (!el) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight * 0.35;
    let tx = x;
    let ty = y;
    let raf = 0;
    const move = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.style.opacity = "1";
    };
    const loop = () => {
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      el.style.transform = `translate3d(${x - 320}px, ${y - 320}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);
  if (reduced) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[65] h-[640px] w-[640px] opacity-0 mix-blend-screen transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(closest-side, rgba(240,201,140,0.15), rgba(143,124,180,0.06) 55%, transparent 72%)",
      }}
    />
  );
}

/* scramble-decode text */
const POOL = "▓▒░█/\\<>*+=·DINO";
export function Scramble({
  text,
  className,
  delay = 0,
  speed = 22,
}: {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const [out, setOut] = useState(reduced ? text : "");
  useEffect(() => {
    if (reduced) {
      setOut(text);
      return;
    }
    let raf = 0;
    let t0: number | null = null;
    const step = (t: number) => {
      if (t0 === null) t0 = t;
      const el = t - t0 - delay;
      if (el < 0) {
        raf = requestAnimationFrame(step);
        return;
      }
      const solved = Math.floor((el / 1000) * speed);
      if (solved >= text.length) {
        setOut(text);
        return;
      }
      let s = "";
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === " ") s += " ";
        else s += i < solved ? c : POOL[(Math.random() * POOL.length) | 0];
      }
      setOut(s);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [text, reduced, delay, speed]);
  return (
    <span className={className} aria-label={text}>
      {out || "\u00A0"}
    </span>
  );
}

/* reveal on scroll */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 34,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "p" | "h1" | "h2" | "h3" | "span" | "figure" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const style = {
    "--rv-delay": `${delay}ms`,
    "--rv-y": `${y}px`,
  } as CSSProperties;
  return (
    <Tag
      ref={ref as never}
      className={`rv ${on ? "rv-on" : ""} ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}

/* ---------- custom icons ---------- */

export function XLogo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

export function Sparkle({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 1.5 14.3 9.7 22.5 12 14.3 14.3 12 22.5 9.7 14.3 1.5 12 9.7 9.7Z" />
    </svg>
  );
}

export function ArrowUpRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden
    >
      <path d="M7 17 17 7M9.5 7H17v7.5" />
    </svg>
  );
}

export function Moon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M20.6 13.4A8.9 8.9 0 0 1 10.6 3.4a9 9 0 1 0 10 10Z" />
    </svg>
  );
}
