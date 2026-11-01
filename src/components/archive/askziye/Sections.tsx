import { useMemo, useRef, useState } from "react";
import { works, type Work } from "./data/works";
import { palettes } from "./data/palettes";
import { copyText, Reveal, useToast } from "./lib";
import { cn } from "@/utils/cn";

/* ================= STYLE STUDY ================= */
const MODES = [
  { id: "value", zh: "明暗", en: "Value", filter: "grayscale(1) contrast(1.15)", note: "Strip the hue and the image still reads. ASK's silhouettes are built on value first — that's why the pieces hold up from across a room." },
  { id: "notan", zh: "黑白", en: "Notan", filter: "grayscale(1) contrast(4) brightness(1.1)", note: "Pushed to two tones, the composition reduces to clean shapes: dark hair masses against pale skin and paper." },
  { id: "warm", zh: "暖调", en: "Warm light", filter: "sepia(.55) saturate(1.4) hue-rotate(-12deg)", note: "Multiply shadows tinted warm sit under a cool rim — the 'fashion shoot' lighting studies keep pointing to." },
  { id: "line", zh: "线", en: "Edges", filter: "grayscale(1) invert(1) contrast(6) brightness(.9) invert(1)", note: "Thicker strokes at the limbs and outer contour, hairline-thin through hair and face — lines colored near the fill so they never shout." },
] as const;

export function StyleStudy() {
  const pool = works.filter((w) => !w.darkPlate);
  const [work, setWork] = useState<Work>(pool.find((w) => w.id === "sleeping-beauty")!);
  const [mode, setMode] = useState<(typeof MODES)[number]>(MODES[0]);
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const move = (x: number) => {
    const r = box.current!.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
  };

  return (
    <section id="study" className="scroll-mt-20 border-y border-ink/10 bg-paper-2/60">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-28">
        <Reveal>
          <p className="sectmark text-cinnabar">03 · 笔法研究</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Style study</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-ink-soft">
            Drag the divider to look under the paint. Pick a plate, then a lens.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div
            ref={box}
            className="relative mx-auto w-full max-w-2xl touch-none select-none overflow-hidden bg-paper-3"
            style={{ aspectRatio: `${work.w} / ${work.h}`, maxHeight: "78vh" }}
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              move(e.clientX);
            }}
            onPointerMove={(e) => e.buttons && move(e.clientX)}
          >
            <img src={work.src} alt={work.title} className="absolute inset-0 h-full w-full object-contain" draggable={false} />
            <img
              src={work.src}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-contain"
              style={{ filter: mode.filter, clipPath: `inset(0 0 0 ${pos}%)` }}
            />
            <div className="absolute inset-y-0 w-px bg-paper shadow-[0_0_0_1px_rgba(0,0,0,.15)]" style={{ left: `${pos}%` }}>
              <span className="absolute top-1/2 left-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-paper text-xs text-ink shadow-lg">
                ⇆
              </span>
            </div>
            <span className="absolute top-3 left-3 bg-paper/85 px-2 py-1 text-[10px] tracking-[0.2em] uppercase">Original</span>
            <span className="absolute top-3 right-3 bg-ink/85 px-2 py-1 text-[10px] tracking-[0.2em] text-paper uppercase">{mode.en}</span>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.28em] text-taupe uppercase">Lens</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m)}
                  className={cn(
                    "border px-4 py-3 text-left transition",
                    mode.id === m.id ? "border-cinnabar bg-cinnabar text-paper" : "border-ink/15 hover:border-cinnabar/60",
                  )}
                >
                  <span className="block font-display text-lg">{m.zh}</span>
                  <span className="text-[10px] tracking-[0.2em] uppercase opacity-70">{m.en}</span>
                </button>
              ))}
            </div>
            <p className="mt-5 min-h-24 font-display text-lg leading-relaxed text-ink-soft">{mode.note}</p>

            <p className="mt-8 text-[10px] tracking-[0.28em] text-taupe uppercase">Palette — click a chip to copy</p>
            <div className="mt-3 flex">
              {(palettes[work.id] || []).map((c) => (
                <button
                  key={c}
                  title={c}
                  onClick={async () => toast((await copyText(c)) ? `Copied ${c}` : c)}
                  className="h-14 flex-1 transition hover:-translate-y-1"
                  style={{ background: c }}
                />
              ))}
            </div>

            <p className="mt-8 text-[10px] tracking-[0.28em] text-taupe uppercase">Plate</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {pool.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWork(w)}
                  title={w.title}
                  className={cn("h-12 w-12 overflow-hidden transition", w.id === work.id ? "ring-2 ring-cinnabar" : "opacity-60 hover:opacity-100")}
                >
                  <img src={w.thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= TIMELINE ================= */
const milestones: Record<number, string> = {
  2015: "Wisteria art book at Comic Market 88. Saber Lily and Sophon plates.",
  2016: "Evangelion birthday plates begin — a yearly ritual.",
  2018: "Kanon and the Phantom Thieves. Azur Lane shipgirls follow.",
  2020: "Surtr joins Arknights. Shaohua becomes a scale figure.",
  2021: "Sleeping Beauty and Moment — Evangelion's farewell year.",
  2022: "SPY×FAMILY plates, Surtr 'Dusk' merchandise.",
  2023: "Glimmer, Oberon, Language of Flowers.",
  2024: "Meeting — Sophon returns, nine years later.",
  2026: "Plum Blossom: Miku with a flute and a hanging scroll.",
};

export function Timeline({ onOpen }: { onOpen: (w: Work, list: Work[]) => void }) {
  const byYear = useMemo(() => {
    const m = new Map<number, Work[]>();
    works.forEach((w) => m.set(w.year, [...(m.get(w.year) || []), w]));
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, []);

  return (
    <section id="timeline" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
      <Reveal>
        <p className="sectmark text-cinnabar">05 · 年表</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">A decade, plate by plate</h2>
      </Reveal>
      <ol className="relative mt-14 border-l border-ink/15 md:ml-24">
        {byYear.map(([year, ws], i) => (
          <li key={year} className="relative pb-14 pl-8 md:pl-12">
            <span className="absolute top-1.5 -left-[5px] h-[9px] w-[9px] rotate-45 bg-cinnabar" />
            <Reveal delay={i * 40}>
              <p className="font-display text-3xl md:absolute md:top-0 md:-left-28 md:text-2xl">{year}</p>
              <p className="mt-1 max-w-xl text-sm leading-7 text-ink-soft md:mt-0">{milestones[year] || ""}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {ws.map((w) => (
                  <button key={w.id} onClick={() => onOpen(w, ws)} className="group w-28 text-left">
                    <div className="h-28 w-28 overflow-hidden bg-paper-2">
                      <img src={w.thumb} alt={w.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                    </div>
                    <p className="mt-1.5 truncate font-display text-sm group-hover:text-cinnabar">{w.title}</p>
                  </button>
                ))}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ================= COMMISSION / INQUIRY ================= */
export function Inquiry() {
  const toast = useToast();
  const [f, setF] = useState({ name: "", email: "", type: "Character design", budget: "", deadline: "", msg: "" });
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });
  const valid = f.name && /\S+@\S+\.\S+/.test(f.email) && f.msg.length >= 10;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return toast("Please complete the form");
    const body = `Name: ${f.name}\nEmail: ${f.email}\nType: ${f.type}\nBudget: ${f.budget || "—"}\nDeadline: ${f.deadline || "—"}\n\n${f.msg}`;
    window.location.href = `mailto:askzy9464@gmail.com?subject=${encodeURIComponent(`[${f.type}] Inquiry from ${f.name}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
    toast("Draft opened in your mail app");
  };

  const field = "w-full border-b border-ink/20 bg-transparent py-2 text-[15px] outline-none transition focus:border-cinnabar placeholder:text-taupe";
  return (
    <form onSubmit={submit} className="grid gap-6 md:grid-cols-2">
      <label className="block">
        <span className="text-[10px] tracking-[0.24em] text-taupe uppercase">Name *</span>
        <input className={field} value={f.name} onChange={set("name")} placeholder="Your name or studio" />
      </label>
      <label className="block">
        <span className="text-[10px] tracking-[0.24em] text-taupe uppercase">Email *</span>
        <input className={field} type="email" value={f.email} onChange={set("email")} placeholder="you@studio.com" />
      </label>
      <label className="block">
        <span className="text-[10px] tracking-[0.24em] text-taupe uppercase">Project type</span>
        <select className={field} value={f.type} onChange={set("type")}>
          {["Character design", "Key illustration", "Book / cover", "Merchandise", "Collaboration", "Other"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-[10px] tracking-[0.24em] text-taupe uppercase">Budget</span>
        <input className={field} value={f.budget} onChange={set("budget")} placeholder="Optional" />
      </label>
      <label className="block md:col-span-2">
        <span className="text-[10px] tracking-[0.24em] text-taupe uppercase">Deadline</span>
        <input className={field} type="date" value={f.deadline} onChange={set("deadline")} />
      </label>
      <label className="block md:col-span-2">
        <span className="flex justify-between text-[10px] tracking-[0.24em] text-taupe uppercase">
          <span>Brief *</span>
          <span>{f.msg.length} / 1200</span>
        </span>
        <textarea
          className={cn(field, "min-h-32 resize-y")}
          maxLength={1200}
          value={f.msg}
          onChange={set("msg")}
          placeholder="Characters, usage, references, timeline…"
        />
      </label>
      <div className="flex flex-wrap items-center gap-5 md:col-span-2">
        <button
          type="submit"
          disabled={!valid}
          className="bg-ink px-7 py-3 text-[11px] tracking-[0.28em] text-paper uppercase transition enabled:hover:bg-cinnabar disabled:opacity-40"
        >
          Compose inquiry →
        </button>
        <p className="text-xs text-ink-soft">
          {sent ? "✓ Your mail app should have opened with the draft." : "Opens your mail app with everything pre-filled. Replies aren't guaranteed."}
        </p>
      </div>
    </form>
  );
}

/* ================= SHORTCUTS ================= */
export function Shortcuts({ onClose }: { onClose: () => void }) {
  const rows = [
    ["/", "Search the gallery"],
    ["?", "Toggle this panel"],
    ["N", "Day / night studio"],
    ["R", "Open a random plate"],
    ["← →", "Previous / next plate"],
    ["Space", "Slideshow"],
    ["Z", "Zoom"],
    ["F", "Save plate"],
    ["I", "Plate notes"],
    ["Esc", "Close"],
  ];
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/50 p-5 backdrop-blur-sm" onClick={onClose}>
      <div className="rise w-full max-w-sm border border-ink/10 bg-paper p-7 text-ink shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl">Shortcuts</h3>
          <button onClick={onClose} className="hover:text-cinnabar">✕</button>
        </div>
        <ul className="mt-5 divide-y divide-ink/10">
          {rows.map(([k, v]) => (
            <li key={k} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-ink-soft">{v}</span>
              <kbd className="min-w-8 border border-ink/20 px-2 py-0.5 text-center font-mono text-xs">{k}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
