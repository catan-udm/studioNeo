import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

/* ---------- localStorage state ---------- */
export function useStored<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  }, [key, v]);
  return [v, setV] as const;
}

/* ---------- toast ---------- */
type ToastCtx = (msg: string) => void;
const Ctx = createContext<ToastCtx>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([]);
  const push = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, msg }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 2400);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[120] flex -translate-x-1/2 flex-col items-center gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="rise flex items-center gap-3 border border-cinnabar/40 bg-ink px-5 py-3 text-[11px] tracking-[0.18em] text-paper uppercase shadow-xl"
          >
            <span className="seal h-5 w-5 border-paper/60 text-[6px] text-paper">印</span>
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

/* ---------- reveal on scroll ---------- */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-1000 ease-out",
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ---------- scroll progress + back to top ---------- */
export function ScrollChrome() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? window.scrollY / h : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent">
        <div className="scroll-progress h-full origin-left" style={{ transform: `scaleX(${p})` }} />
      </div>
      <button
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
        className={cn(
          "fixed bottom-6 right-6 z-[55] grid h-12 w-12 place-items-center rounded-full border border-ink/15 bg-paper text-ink shadow-lg transition-all duration-500 hover:border-cinnabar hover:text-cinnabar",
          p > 0.08 ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
          <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="1.5" />
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="var(--color-cinnabar)"
            strokeWidth="1.5"
            strokeDasharray={138.2}
            strokeDashoffset={138.2 * (1 - p)}
          />
        </svg>
        ↑
      </button>
    </>
  );
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* ---------- re-ink: the page takes the ink of the piece being viewed ---------- */
import { palettes } from "./data/palettes";

function hexHsl(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0;
  const l = (mx + mn) / 2;
  const s = mx === mn ? 0 : (l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn));
  if (mx !== mn) {
    if (mx === r) h = (g - b) / (mx - mn) + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / (mx - mn) + 2;
    else h = (r - g) / (mx - mn) + 4;
    h /= 6;
  }
  return { h, s, l };
}

function mixHex(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return (
    "#" +
    pa
      .map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function toneOf(id: string) {
  const p = palettes[id];
  if (!p) return "#b44738";
  let best: string | null = null;
  let bs = -1;
  for (const hex of p) {
    const { s, l } = hexHsl(hex);
    if (l < 0.1 || l > 0.88) continue;
    const score = s * (1 - Math.abs(l - 0.5) * 0.9);
    if (score > bs) {
      bs = score;
      best = hex;
    }
  }
  return best && bs > 0.09 ? best : "#b44738";
}

export function setLive(hex: string) {
  const el = document.documentElement;
  el.style.setProperty("--live", hex);
  el.style.setProperty("--live-deep", mixHex(hex, "#141009", 0.74));
}

/* Chinese numerals for plate numbering */
const CJK_D = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
export function cjkNum(n: number) {
  if (n < 10) return CJK_D[n];
  if (n < 20) return "十" + (n % 10 ? CJK_D[n % 10] : "");
  if (n < 30) return CJK_D[Math.floor(n / 10)] + "十" + (n % 10 ? CJK_D[n % 10] : "");
  return String(n);
}
