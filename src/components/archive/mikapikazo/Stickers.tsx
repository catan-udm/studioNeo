"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { Hand, RotateCcw, Shuffle } from "lucide-react";
import { Starburst } from "./ui";

type Sticker = {
  id: string;
  kind: "art" | "badge" | "jp" | "star";
  src?: string;
  text?: string;
  x: number;
  y: number;
  rot: number;
  size: number;
  round?: boolean;
  tone?: string;
  onTone?: string;
};

const START: Sticker[] = [
  { id: "s1", kind: "art", src: "/images/mikapikazo/artist-icon.webp", x: 16, y: 26, rot: -8, size: 132, round: true },
  { id: "s2", kind: "art", src: "/images/mikapikazo/laugh.webp", x: 42, y: 20, rot: 6, size: 124 },
  { id: "s3", kind: "badge", text: "100% POP", x: 68, y: 27, rot: -12, size: 108, tone: "var(--pop)", onTone: "var(--on-pop)" },
  { id: "s4", kind: "art", src: "/images/mikapikazo/sports.webp", x: 85, y: 55, rot: 9, size: 116 },
  { id: "s5", kind: "jp", text: "ピカゾ", x: 27, y: 68, rot: -5, size: 112, tone: "var(--pop2)", onTone: "var(--on-pop2)" },
  { id: "s6", kind: "star", text: "NEW", x: 55, y: 62, rot: 14, size: 118, tone: "var(--pop3)", onTone: "var(--on-pop3)" },
  { id: "s7", kind: "art", src: "/images/mikapikazo/birth.webp", x: 70, y: 79, rot: -7, size: 108, round: true },
  { id: "s8", kind: "badge", text: "TOKYO", x: 12, y: 82, rot: 7, size: 96, tone: "var(--color-ink)", onTone: "var(--color-paper)" },
];

const KEY = "mpz-stickers";
const clamp = (n: number) => Math.min(94, Math.max(6, n));

function load(): Sticker[] {
  if (typeof window === "undefined") return START;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return START;
    const saved = JSON.parse(raw) as { id: string; x: number; y: number; rot: number }[];
    return START.map((s) => {
      const hit = saved.find((v) => v.id === s.id);
      return hit ? { ...s, x: clamp(hit.x), y: clamp(hit.y), rot: hit.rot } : s;
    });
  } catch {
    return START;
  }
}

export default function Stickers() {
  const [items, setItems] = useState<Sticker[]>(START);
  const [dragId, setDragId] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>(START.map((s) => s.id));
  const [touched, setTouched] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const grab = useRef({ dx: 0, dy: 0 });

  useEffect(() => setItems(load()), []);

  useEffect(() => {
    if (!touched || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        KEY,
        JSON.stringify(items.map(({ id, x, y, rot }) => ({ id, x, y, rot }))),
      );
    } catch {
      /* storage unavailable */
    }
  }, [items, touched]);

  const bringToFront = useCallback((id: string) => {
    setOrder((prev) => [...prev.filter((v) => v !== id), id]);
  }, []);

  const onPointerDown = (event: PointerEvent, sticker: Sticker) => {
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * 100;
    const py = ((event.clientY - rect.top) / rect.height) * 100;
    grab.current = { dx: px - sticker.x, dy: py - sticker.y };
    setDragId(sticker.id);
    bringToFront(sticker.id);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent, id: string) => {
    if (dragId !== id) return;
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100 - grab.current.dx);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100 - grab.current.dy);
    setTouched(true);
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
  };

  const endDrag = (event: PointerEvent) => {
    setDragId(null);
    const el = event.currentTarget as HTMLElement;
    if (el.hasPointerCapture?.(event.pointerId)) el.releasePointerCapture(event.pointerId);
  };

  const randomize = () => {
    setTouched(true);
    setItems((prev) =>
      prev.map((s) => ({
        ...s,
        x: clamp(12 + Math.random() * 76),
        y: clamp(16 + Math.random() * 68),
        rot: Math.round(-18 + Math.random() * 36),
      })),
    );
  };

  const reset = () => {
    setTouched(true);
    setItems(START);
    setOrder(START.map((s) => s.id));
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="relative overflow-hidden border-b-[5px] border-ink bg-pop px-5 py-16 text-on-pop md:px-10 md:py-24">
      <div className="relative mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
          <div className="reveal">
            <p className="mb-4 inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-3 py-1 font-body text-[11px] font-bold tracking-[0.2em] text-ink">
              <Hand className="h-3.5 w-3.5" aria-hidden="true" /> 04 — STICKER SHEET
            </p>
            <h2 className="font-display text-[clamp(46px,8.5vw,120px)] leading-[0.94] tracking-tight">
              PEEL &amp; <span className="text-paper stroke-ink">STICK.</span>
            </h2>
          </div>
          <div className="reveal flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={randomize}
              className="inline-flex items-center gap-2 border-[3px] border-ink bg-pop2 px-4 py-2.5 font-body text-[11px] font-bold tracking-[0.16em] text-on-pop2 shadow-[4px_4px_0_var(--color-ink)] transition-transform duration-150 hover:-translate-y-0.5"
            >
              <Shuffle className="h-4 w-4" aria-hidden="true" /> SCATTER
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-4 py-2.5 font-body text-[11px] font-bold tracking-[0.16em] text-ink shadow-[4px_4px_0_var(--color-ink)] transition-transform duration-150 hover:-translate-y-0.5"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> RESET SHEET
            </button>
          </div>
        </div>

        {/* the magnetic board */}
        <div
          ref={boardRef}
          aria-label="Interactive sticker board. Drag any sticker to reposition it."
          className="relative h-[440px] overflow-hidden border-[5px] border-ink bg-paper shadow-[14px_14px_0_var(--color-ink)] md:h-[560px]"
        >
          <div className="checker pointer-events-none absolute inset-0 text-ink/10" aria-hidden="true" />
          <span className="tape -top-4 left-16 rotate-3" aria-hidden="true" />
          <span className="tape -top-4 right-20 -rotate-6" aria-hidden="true" />

          {items.map((s) => {
            const zIndex = 10 + order.indexOf(s.id);
            const isDragging = dragId === s.id;
            return (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                aria-label={`Sticker: ${s.text ?? s.id}. Drag to move.`}
                onPointerDown={(e) => onPointerDown(e, s)}
                onPointerMove={(e) => onPointerMove(e, s.id)}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  transform: `translate(-50%, -50%) rotate(${s.rot}deg) ${isDragging ? "scale(1.08)" : "scale(1)"}`,
                  zIndex: isDragging ? 50 : zIndex,
                }}
                className={`sticker select-none ${isDragging ? "dragging" : ""}`}
              >
                {s.kind === "art" && s.src && (
                  <div
                    style={{ width: s.size, height: s.size }}
                    className={`chroma overflow-hidden border-[4px] border-ink bg-paper shadow-[7px_7px_0_var(--color-ink)] ${
                      s.round ? "rounded-full" : ""
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.src} alt="" draggable={false} className="h-full w-full object-cover pointer-events-none" />
                  </div>
                )}

                {s.kind === "badge" && (
                  <div
                    style={{ background: s.tone, color: s.onTone }}
                    className="border-[4px] border-ink px-4 py-3 font-display text-2xl tracking-wide shadow-[7px_7px_0_var(--color-ink)]"
                  >
                    {s.text}
                  </div>
                )}

                {s.kind === "jp" && (
                  <div
                    style={{ background: s.tone, color: s.onTone }}
                    className="border-[4px] border-ink px-4 py-2 font-jp text-3xl font-bold tracking-wider shadow-[7px_7px_0_var(--color-ink)]"
                  >
                    {s.text}
                  </div>
                )}

                {s.kind === "star" && (
                  <div className="relative grid place-items-center" style={{ width: s.size, height: s.size }}>
                    <Starburst className="h-full w-full text-ink drop-shadow-[6px_6px_0_var(--color-ink)]" points={16} inner={36} />
                    <span
                      style={{ color: s.onTone }}
                      className="absolute font-display text-xl leading-none tracking-wider"
                    >
                      {s.text}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          <span className="pointer-events-none absolute bottom-3 right-4 font-body text-[10px] font-bold tracking-[0.2em] text-ink/40">
            DRAG ANYWHERE · STICKERS PERSIST
          </span>
        </div>
      </div>
    </section>
  );
}
