import { credits, works, type Work } from "./data/works";
import { image, thumbnail } from "./assets";
import { toneOf } from "./lib";
import { Inquiry } from "./Sections";
import { InkStroke, StudioCat } from "./Atmosphere";

const stageWorks = works.filter((w) => w.darkPlate);

/* ---------- the cover: her plate, full-bleed, titled the way she titles prints ---------- */
export function Hero() {
  const tone = toneOf("shaohua");
  return (
    <section id="top" data-live-tone={tone} className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0" aria-hidden>
        <img
          src={image("shaohua")}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="kenburns h-full w-full object-cover object-[62%_18%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-paper/80 via-paper/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-paper" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-5 pb-8 pt-6 md:px-8">
        <div className="rise flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="seal seal-stamp h-11 w-11 text-[10px]">画</span>
            <div>
              <p className="font-display text-sm tracking-[0.3em]">ASK 画集</p>
              <p className="mt-0.5 text-[9px] tracking-[0.34em] text-ink-soft uppercase">
                Illustration book · @askziye
              </p>
            </div>
          </div>
          <p className="text-right text-[10px] leading-5 tracking-[0.28em] text-ink-soft uppercase">
            图版 一 / 二二
            <br />
            <span className="live-text">@askziye</span>
          </p>
        </div>

        <div className="rise flex items-end justify-between" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-end gap-5">
            <div className="border-y border-ink/20 bg-paper/75 px-3 py-6 backdrop-blur-[2px]">
              <p className="vertical-rl font-display text-4xl tracking-[0.5em] md:text-5xl">韶华</p>
            </div>
            <div className="vertical-rl pb-2 text-[10px] tracking-[0.5em] text-ink-soft">
              SHAOHUA · 初音ミク · 二〇二〇
            </div>
          </div>
          <div className="hidden pb-2 text-right md:block">
            <p className="font-script text-4xl text-cinnabar">Ask.</p>
            <p className="mt-1 text-[9px] tracking-[0.3em] text-ink-soft uppercase">signed, as always</p>
          </div>
        </div>

        <div className="rise flex items-end justify-between" style={{ animationDelay: "0.35s" }}>
          <div>
            <p className="font-display text-2xl md:text-3xl">第一画 · the cover plate</p>
            <p className="mt-1 text-[10px] tracking-[0.26em] text-ink-soft uppercase">
              偶尔画画的猫爱好者 — occasionally draws
            </p>
          </div>
          <a
            href="#contents"
            className="group flex flex-col items-center gap-2 text-[10px] tracking-[0.4em] text-ink-soft uppercase"
          >
            往下翻 · turn the page
            <span className="h-9 w-px animate-pulse bg-ink/40 transition group-hover:bg-cinnabar" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- contents page, like the 目录 of an art book ---------- */
const toc = [
  { n: "一", zh: "画室", en: "The hand", href: "#intro", thumb: thumbnail("sophon") },
  { n: "二", zh: "图版", en: "Plates", href: "#works", thumb: thumbnail("kanon"), extra: "22 plates" },
  { n: "三", zh: "笔法", en: "Style study", href: "#study", thumb: thumbnail("sleeping-beauty") },
  { n: "四", zh: "角色", en: "Character design", href: "#stage", thumb: thumbnail("surtr-e2"), extra: "4 series" },
  { n: "五", zh: "年表", en: "A decade", href: "#timeline", thumb: thumbnail("bride") },
  { n: "六", zh: "履历", en: "Atelier notes", href: "#about", thumb: thumbnail("sunset") },
  { n: "七", zh: "联系", en: "Write to the studio", href: "#contact", thumb: thumbnail("dusk-to-dawn") },
];

export function Toc() {
  return (
    <section id="contents" className="mx-auto max-w-3xl px-5 py-20 md:py-28">
      <div className="mb-10 flex items-end gap-4">
        <span className="seal h-9 w-9 text-[9px]">目</span>
        <div>
          <h2 className="font-display text-3xl md:text-4xl">目录</h2>
          <p className="text-[10px] tracking-[0.34em] text-ink-soft uppercase">Contents</p>
        </div>
        <InkStroke className="mb-3 w-40" />
      </div>
      <ul>
        {toc.map((r) => (
          <li key={r.href}>
            <a href={r.href} className="group flex items-center gap-4 py-4 md:gap-6">
              <span className="font-script w-7 text-2xl text-gold">{r.n}</span>
              <span className="flex items-baseline gap-3 whitespace-nowrap">
                <span className="toc-zh font-display text-xl transition md:text-2xl">{r.zh}</span>
                <span className="text-[10px] tracking-[0.24em] text-ink-soft uppercase">{r.en}</span>
              </span>
              <span className="toc-dots mx-2 h-px flex-1" />
              {r.extra && <span className="hidden text-[10px] tracking-[0.2em] text-taupe uppercase sm:block">{r.extra}</span>}
              <img
                src={r.thumb}
                alt=""
                loading="lazy"
                className="h-11 w-11 shrink-0 object-cover opacity-55 grayscale transition duration-500 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Intro() {
  return (
    <section id="intro" className="relative mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 bottom-0 font-display text-[16rem] leading-none text-ink/[0.045] select-none md:text-[24rem]"
      >
        画
      </span>
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <p className="sectmark text-cinnabar md:col-span-3">01 · 画室</p>
        <div className="md:col-span-8">
          <h2 className="font-display text-3xl leading-snug md:text-5xl md:leading-[1.25]">
            Line that melts into the fill.
            <br />
            Light that behaves like fabric.
          </h2>
          <InkStroke className="mt-4 w-56 md:w-80" />
          <div className="mt-8 max-w-2xl space-y-4 text-[15px] leading-8 text-ink-soft">
            <p>
              ASK paints with a handful of layers and almost no tricks — a hard pressure
              brush, multiply shadow, and lineart tinted to the local color so the contour
              never shouts. Hair is a weather system. Hands are quiet. The page is treated
              like paper, not a screen.
            </p>
            <p>
              The result is illustration that reads from across a room: clear silhouettes,
              fashion-editorial posing, and a palette of cream, cinnabar, sage, and gold
              that feels both classical and contemporary.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Spotlight({ onOpen }: { onOpen: (w: Work) => void }) {
  const w = works.find((x) => x.id === "meihua")!;
  return (
    <section data-live-tone={toneOf("meihua")} className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
      <div className="grid items-end gap-10 md:grid-cols-12">
        <button
          onClick={() => onOpen(w)}
          className="group md:col-span-7"
        >
          <div className="frame-scroll relative">
            <div className="rod" aria-hidden />
            <div className="frame-scroll-body bg-[#f6f0e5] px-3 pb-5 pt-3 shadow-lg ring-1 ring-ink/10">
              <div className="relative overflow-hidden">
                <img
                  src={image("meihua")}
                  alt="梅花三弄 — Hatsune Miku by ASK"
                  className="w-full transition duration-700 group-hover:brightness-105"
                />
              </div>
              <span className="seal-seal absolute bottom-8 right-6 h-8 w-8 rotate-[-6deg] text-[7px]">梅</span>
            </div>
            <div className="tassel" aria-hidden />
          </div>
        </button>
        <div className="md:col-span-5 md:pb-10">
          <p className="font-script text-3xl text-cinnabar">latest plate</p>
          <h3 className="mt-2 font-display text-4xl">梅花三弄</h3>
          <p className="mt-2 text-[11px] tracking-[0.22em] text-ink-soft uppercase">
            Three Variations of Plum Blossom · Miku · 2026
          </p>
          <InkStroke className="mt-4 w-40" />
          <p className="mt-6 text-sm leading-7 text-ink-soft">
            A flute, a hanging scroll, camellia in the hair. ASK&apos;s Miku pieces are
            where the studio&apos;s Chinese-paper sensibility is most complete — ribbons
            as calligraphy, negative space as silence.
          </p>
          <button
            onClick={() => onOpen(w)}
            className="mt-8 text-[11px] tracking-[0.24em] text-cinnabar uppercase underline decoration-cinnabar/40 underline-offset-8"
          >
            Open plate
          </button>
        </div>
      </div>
    </section>
  );
}

export function Stage({ onOpen }: { onOpen: (w: Work) => void }) {
  return (
    <section id="stage" data-live-tone={toneOf("surtr-e2")} className="scroll-mt-16 bg-stage text-paper">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="sectmark text-gold">04 · 角色设计</p>
            <h2 className="mt-5 font-display text-4xl md:text-5xl">On the stage</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-paper/65">
              Official character illustration — the same hand, a darker room. Surtr of
              Rhodes Island remains ASK&apos;s most recognized game design: lava, black
              dress, and a smile that never quite apologizes.
            </p>
          </div>
          <p className="font-script text-4xl text-cinnabar">Surtr</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {stageWorks.map((w, i) => (
            <button key={w.id} onClick={() => onOpen(w)} className="group text-left">
              <div className={i % 2 === 0 ? "rotate-[-0.7deg]" : "rotate-[0.7deg]"}>
                <div className="overflow-hidden bg-black ring-1 ring-gold/25">
                  <img
                    src={w.thumb}
                    alt={w.title}
                    className="w-full transition duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mx-8 -mt-[3px] h-[7px] rounded-b-sm bg-gradient-to-b from-[#5c4a37] to-[#332821]" aria-hidden />
              </div>
              <p className="mt-3 font-display text-lg group-hover:text-gold">{w.title}</p>
              <p className="text-[10px] tracking-[0.2em] text-paper/50 uppercase">
                {w.titleEn} · {w.year}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-16 grid gap-8 border-t border-paper/10 pt-12 md:grid-cols-4">
          {credits.map((c) => (
            <div key={c.title}>
              <p className="text-[10px] tracking-[0.28em] text-gold uppercase">{c.role}</p>
              <h3 className="mt-2 font-display text-2xl">{c.title}</h3>
              <p className="mt-1 text-xs text-paper/45">{c.zh}</p>
              <ul className="mt-4 space-y-1 text-sm text-paper/75">
                {c.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-10 vertical-rl font-display text-[10rem] leading-none text-ink/[0.045] select-none md:text-[14rem]"
      >
        绘师
      </span>
      <div className="grid items-start gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="sectmark text-cinnabar">06 · 履历</p>
          <h2 className="mt-5 font-display text-4xl md:text-5xl">Atelier</h2>
          <InkStroke className="mt-4 w-40" />
          <div className="mt-8 flex items-center gap-4">
            <img
              src={image("avatar")}
              alt="ASK"
              className="h-16 w-16 rounded-full object-cover ring-1 ring-ink/10"
            />
            <div>
              <p className="font-display text-xl">ASK</p>
              <p className="text-[11px] tracking-[0.18em] text-ink-soft">
                ASKZY · Asukaziye · @askziye
              </p>
            </div>
          </div>
        </div>
        <div className="md:col-span-7 md:col-start-6">
          <p className="font-display text-2xl leading-relaxed text-ink md:text-3xl">
            A Chinese illustrator who treats digital painting like gouache on warm paper.
          </p>
          <div className="mt-8 space-y-4 text-[15px] leading-8 text-ink-soft">
            <p>
              Also known as ASKZY and Asukaziye. ASK spent time at miHoYo on character
              portraits for Honkai Impact, then became a defining brush for shipgirls and
              operators across Yostar and Hypergryph titles. The work is done mostly in
              Paint Tool SAI — basic brushes, few layers, no smudge — so every edge still
              feels handmade.
            </p>
            <p>
              Off-commission, the same hand turns toward Vocaloid, Fate, Evangelion, and
              original fairy-tale plates: Miku in cheongsam among plum blossoms, a sleeping
              princess in a wicker moon, a string quartet in a dark gymnasium.
            </p>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 text-sm">
            {[
              ["Also known as", "ASKZY / Asukaziye"],
              ["Tool", "Paint Tool SAI"],
              ["Based", "China"],
              ["Loves", "Cats, and drawing sometimes"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] tracking-[0.22em] text-taupe uppercase">{k}</dt>
                <dd className="mt-1 font-display text-lg">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const links = [
    { label: "X / Twitter", href: "https://x.com/askziye", handle: "@askziye" },
    { label: "Pixiv", href: "https://www.pixiv.net/users/1980643", handle: "ASK" },
    { label: "Weibo", href: "https://weibo.com/askzy", handle: "askzy" },
    { label: "Email", href: "mailto:askzy9464@gmail.com", handle: "askzy9464@gmail.com" },
  ];
  return (
    <section id="contact" className="border-t border-ink/10">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-28">
        <p className="sectmark text-cinnabar">07 · 联系</p>
        <h2 className="mt-5 font-display text-4xl md:text-6xl">Write to the studio.</h2>
        <InkStroke className="mt-4 w-52 md:w-72" />
        <p className="mt-5 max-w-lg text-sm leading-7 text-ink-soft">
          Work inquiries by mail. The rest of the sketchbook lives on Pixiv and X.
        </p>
        <div className="mt-12 grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <ul className="divide-y divide-ink/10 border-y border-ink/10 self-start">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group flex items-baseline justify-between gap-4 py-5"
                >
                  <span className="text-[11px] tracking-[0.28em] text-taupe uppercase">
                    {l.label}
                  </span>
                  <span className="font-display text-xl group-hover:text-cinnabar md:text-2xl">
                    {l.handle}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div>
            <p className="mb-6 text-[10px] tracking-[0.28em] text-cinnabar uppercase">Project inquiry</p>
            <Inquiry />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="px-5 pb-12 pt-8 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 md:flex-row md:justify-between">
        <div className="flex items-center gap-3">
          <span className="seal h-7 w-7 text-[8px]">ASK</span>
          <p className="text-[11px] tracking-[0.18em] text-ink-soft">
            All illustrations © ASK · 作品著作权归绘师所有
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="font-script text-4xl text-cinnabar">Ask.</p>
          <span className="seal h-8 w-8 text-[8px]">画</span>
        </div>
        <StudioCat />
      </div>
      <p className="mt-10 text-center text-[9px] tracking-[0.3em] text-taupe uppercase">
        ASK 画集 · set in Shippori Mincho, Cormorant Garamond & Great Vibes · 二〇二六
      </p>
    </footer>
  );
}
