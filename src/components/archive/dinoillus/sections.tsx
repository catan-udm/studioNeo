import { useEffect, useRef, useState } from "react";
import {
  artworks,
  avatar,
  heroImg,
  lightSteps,
  lightStudyQuote,
  lightStudyTweet,
  links,
  stats,
  tickerItems,
} from "./data/artworks";
import { Art } from "./Art";
import {
  ArrowUpRight,
  Moon,
  Reveal,
  Scramble,
  Sparkle,
  XLogo,
} from "./fx";

/* ------------------------------------------------ hero */

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-svh flex-col justify-end overflow-hidden">
      <div className="absolute inset-0">
        <Art
          src={heroImg}
          alt="31-A — official Heaven Burns Red illustration by Dino"
          label="where light ends"
          href={links.x}
          eager
          className="h-full w-full"
          imgClassName="kenburns h-full w-full object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/70 to-ink-950/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/70" />
      </div>

      <div className="relative z-10 px-5 pb-10 pt-40 md:px-12">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-ember-300/90">
            Illustrator — @Dino_illus · X
          </p>
        </Reveal>

        <h1 className="mt-4 font-display text-[clamp(5.5rem,23vw,21rem)] font-semibold leading-[0.82] tracking-[-0.02em] text-bone-50">
          DINO
        </h1>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <Reveal delay={250}>
            <span className="font-display text-2xl italic text-bone-300/75 md:text-4xl">
              where light ends
            </span>
          </Reveal>
          <span className="hidden h-px w-24 bg-ember-400/50 sm:block" />
        </div>

        <div className="mt-8">
          <Scramble
            text="SOLO EXHIBITION · WHERE LIGHT ENDS — ARTBOOK XXXIX"
            speed={20}
            delay={500}
            className="font-mono text-[11px] tracking-[0.28em] text-bone-100/85 md:text-xs"
          />
        </div>

        <Reveal delay={350} className="mt-12">
          <div className="grid max-w-4xl grid-cols-2 gap-x-6 gap-y-8 border-t border-bone-100/15 pt-6 md:grid-cols-4">
            {[
              [stats.followers, "followers on X"],
              [stats.posts, "posts since 2022"],
              ["XXXIX", "first artbook"],
              ["3.13–15", "solo show · 2026"],
            ].map(([k, v]) => (
              <div key={v}>
                <p className="font-display text-3xl font-medium text-bone-50 md:text-4xl">
                  {k}
                </p>
                <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.26em] text-ash-400">
                  {v}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 flex items-center gap-4 md:mt-14">
          <span className="relative block h-14 w-px overflow-hidden bg-bone-100/15">
            <span className="scroll-hint absolute inset-0 bg-ember-400" />
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-ash-500">
            scroll into the light
          </span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ ticker */

export function Ticker() {
  const Row = ({ id }: { id: string }) => (
    <div key={id} className="flex shrink-0 items-center">
      {tickerItems.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap px-7 font-display text-2xl italic text-bone-300/70 md:px-10 md:text-3xl">
            {t}
          </span>
          <Sparkle className="h-3.5 w-3.5 shrink-0 text-ember-400/70" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee relative overflow-hidden border-y border-bone-100/10 bg-ink-900/50 py-4">
      <div className="marquee-track flex w-max">
        <Row id="a" />
        <Row id="b" />
      </div>
    </div>
  );
}

/* ------------------------------------------------ works */

export function Works() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting)
            setActive(Number((e.target as HTMLElement).dataset.idx));
        }),
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);

  const current = artworks[active];

  return (
    <section id="works" className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-[340px_1fr] lg:gap-20">
          {/* sticky rail */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ember-400">
                01 · Selected works
              </p>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-5 font-display text-4xl font-medium leading-[1.04] text-bone-50 md:text-5xl">
                Carved from{" "}
                <span className="italic text-ember-300">darkness</span>, one
                stroke at a time.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-ash-300">
                Official work and fan art from the artist's own posts. Titles
                are his captions word for word, and every piece links back to
                its original on X.
              </p>
            </Reveal>

            <div className="mt-12 hidden lg:block">
              <div className="flex items-end gap-3">
                <span className="font-outline font-display text-[7rem] font-semibold leading-[0.75]">
                  {String(active + 1).padStart(2, "0")}
                </span>
                <span className="pb-2 font-mono text-xs tracking-[0.25em] text-ash-500">
                  / {String(artworks.length).padStart(2, "0")}
                </span>
              </div>
              <div className="hairline my-6" />
              <p className="font-display text-2xl italic text-bone-100">
                {current.title}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ash-400">
                {current.subject} · {current.year}
              </p>
              <div className="mt-7 h-px w-full bg-bone-100/10">
                <div
                  className="h-full bg-ember-400 transition-all duration-700 [transition-timing-function:var(--ease-soft)]"
                  style={{
                    width: `${((active + 1) / artworks.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* artwork stack */}
          <div className="flex flex-col gap-16 md:gap-24">
            {artworks.map((w, i) => (
              <figure
                key={w.id}
                data-idx={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className="group"
              >
                <Reveal className="relative overflow-hidden border border-bone-100/10 bg-ink-900">
                  <div className={`relative overflow-hidden ${w.aspect}`}>
                    <Art
                      src={w.img}
                      alt={`${w.title} by Dino (@Dino_illus)`}
                      label={w.title}
                      href={w.tweet}
                      eager={i === 0}
                      className="absolute inset-0"
                      imgClassName="h-full w-full object-cover transition-transform duration-[1400ms] [transition-timing-function:var(--ease-soft)] group-hover:scale-[1.045]"
                    />
                    <div className="sweep" />
                    <span className="absolute left-4 top-4 z-10 border border-bone-100/20 bg-ink-950/60 px-2.5 py-1 font-mono text-[9px] tracking-[0.25em] text-bone-300">
                      {w.tag}
                    </span>
                  </div>
                </Reveal>
                <Reveal
                  delay={120}
                  className="mt-5 flex items-start justify-between gap-6"
                >
                  <div>
                    <h3 className="font-display text-3xl italic text-bone-50 md:text-4xl">
                      {w.title}
                    </h3>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ash-400">
                      {w.subject} · {w.year}
                    </p>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-ash-300">
                      {w.caption}
                    </p>
                  </div>
                  <a
                    href={w.tweet}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View ${w.title} on X`}
                    className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center border border-bone-100/15 text-bone-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-ember-400/70 hover:text-ember-300"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Reveal>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ light study */

export function LightStudy() {
  const [step, setStep] = useState(0);
  return (
    <section id="light" className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ember-400">
                03 · Light study
              </p>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-5 font-display text-4xl font-medium leading-[1.02] text-bone-50 md:text-5xl">
                How the glow <span className="italic text-ember-300">gets made</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={150} className="max-w-xs">
            <p className="text-sm leading-relaxed text-ash-300">
              In September 2022 Dino posted his lighting method in four
              annotated frames: “{lightStudyQuote}.” Step through them below.
              The handwriting in each frame is his.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <Reveal>
            <div className="relative aspect-[9/8] overflow-hidden border border-bone-100/10 bg-ink-900">
              {lightSteps.map((s, i) => (
                <Art
                  key={s.n}
                  src={s.img}
                  alt={`${s.label} — step in Dino's light technique`}
                  label={s.label}
                  href={lightStudyTweet}
                  eager={i === 0}
                  className="absolute inset-0 transition-all duration-700 [transition-timing-function:var(--ease-soft)]"
                  style={{
                    opacity: i === step ? 1 : 0,
                    transform: i === step ? "scale(1)" : "scale(1.035)",
                    pointerEvents: i === step ? "auto" : "none",
                  }}
                  imgClassName="h-full w-full object-cover"
                />
              ))}
              <span className="absolute left-4 top-4 border border-bone-100/20 bg-ink-950/60 px-2.5 py-1 font-mono text-[9px] tracking-[0.25em] text-bone-300">
                {lightSteps[step].n} / 04
              </span>
            </div>
          </Reveal>

          <div className="flex flex-col">
            {lightSteps.map((s, i) => (
              <button
                key={s.n}
                onClick={() => setStep(i)}
                aria-pressed={i === step}
                className={`group border-t border-bone-100/10 px-1 py-5 text-left transition-colors duration-300 last:border-b ${
                  i === step ? "bg-bone-50/[0.03]" : "hover:bg-bone-50/[0.015]"
                }`}
              >
                <span className="flex items-center gap-4">
                  <span
                    className={`font-mono text-[10px] tracking-[0.25em] ${
                      i === step ? "text-ember-300" : "text-ash-500"
                    }`}
                  >
                    {s.n}
                  </span>
                  <span
                    className={`font-display text-2xl transition-colors duration-300 md:text-[1.7rem] ${
                      i === step
                        ? "italic text-bone-50"
                        : "text-ash-300 group-hover:text-bone-100"
                    }`}
                  >
                    {s.label}
                  </span>
                  <span
                    className={`ml-auto h-px flex-1 transition-all duration-500 ${
                      i === step ? "w-14 bg-ember-400" : "w-6 bg-bone-100/20"
                    }`}
                  />
                </span>
                <span
                  className={`grid transition-[grid-template-rows] duration-500 [transition-timing-function:var(--ease-soft)] ${
                    i === step ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <span className="block overflow-hidden">
                    <span className="block pl-9 pr-2 pt-3 text-[13px] leading-relaxed text-ash-300">
                      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-ember-300/90">
                        his note: “{s.handwritten}”
                      </span>
                      {s.note}
                    </span>
                  </span>
                </span>
              </button>
            ))}
            <a
              href={lightStudyTweet}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ember-300/90 transition-colors hover:text-ember-200"
            >
              The original post <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ about */

export function About() {
  const rowLinks = [
    { label: "X / Twitter", href: links.x, icon: <XLogo className="h-3.5 w-3.5" /> },
    { label: "Pixiv", href: links.pixiv, icon: <Sparkle className="h-3.5 w-3.5" /> },
    { label: "Weibo", href: links.weibo, icon: <Moon className="h-3.5 w-3.5" /> },
    { label: "dinohu0019@gmail.com", href: links.email, icon: <span className="text-ember-400">✳</span> },
  ];
  return (
    <section
      id="about"
      className="border-t border-bone-100/10 px-5 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[280px_1fr] lg:gap-20">
        <Reveal>
          <div className="relative w-fit">
            <div className="absolute -inset-3 border border-ember-400/25" />
            <Art
              src={avatar}
              alt="Dino's avatar"
              eager
              className="relative h-40 w-40 md:h-48 md:w-48"
              imgClassName="h-full w-full object-cover"
            />
            <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center bg-ink-800 text-ember-300">
              <XLogo className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-7 font-display text-4xl text-bone-50">Dino</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.24em] text-ash-400">
            @Dino_illus
          </p>
          <p className="mt-4 font-display text-xl italic text-bone-300/80">
            “drawing”
          </p>
        </Reveal>

        <div>
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ember-400">
              06 · About
            </p>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-5 max-w-xl font-display text-4xl font-medium leading-[1.05] text-bone-50 md:text-5xl">
              The light is <span className="italic text-ember-300">the point.</span>
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-7 max-w-2xl text-[15px] leading-relaxed text-ash-300">
              Behind{" "}
              <span className="text-bone-100">@Dino_illus</span> is an illustrator
              with more than 870,000 followers on X. His work is easy to spot:
              figures held in deep, cold shadow and answered by a single warm
              light. As his own tutorial shows, that light isn't painted on top.
              A cold multiply shadow goes down first, and the light is cut back
              out of it with color dodge.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ash-300">
              Official work for Heaven Burns Red sits alongside fan art from
              Arcane, Wuthering Waves, Reverse: 1999 and Frieren. In March 2026
              came his first solo exhibition, Where Light Ends, and his first
              artbook, XXXIX. Personal commissions are closed; business inquiries
              go to the working email below.
            </p>
          </Reveal>

          <Reveal delay={280} className="mt-10">
            <div className="grid grid-cols-2 gap-px border border-bone-100/10 bg-bone-100/10 md:grid-cols-4">
              {[
                [stats.followers, "followers on X"],
                [stats.posts, "posts since Jan 2022"],
                ["XXXIX", "first artbook · 2026"],
                ["WLE", "solo show · Mar 2026"],
              ].map(([k, v]) => (
                <div key={v} className="bg-ink-950 p-5">
                  <p className="font-display text-3xl font-medium text-bone-50">
                    {k}
                  </p>
                  <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.24em] text-ash-400">
                    {v}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={340} className="mt-10">
            <div className="flex items-center gap-3">
              <Moon className="h-4 w-4 text-dusk-300" />
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ash-300">
                personal commissions — closed
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {rowLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="flex items-center gap-2.5 border border-bone-100/15 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-ember-400/60 hover:text-ember-300"
                >
                  {l.icon}
                  {l.label}
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------ footer */

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-bone-100/10 px-5 pb-10 pt-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="max-w-5xl font-display text-[8.5vw] italic leading-[1.02] text-bone-50/90 md:text-[6vw]">
            where light ends,{" "}
            <span className="font-outline-ember not-italic">the work</span>{" "}
            begins.
          </p>
        </Reveal>

        <div className="mt-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <p className="max-w-md font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-ash-500">
            All artwork belongs to Dino (@Dino_illus). An unofficial tribute
            profile: every image and video loads directly from the artist's
            public posts on X, and every piece links to its original.
          </p>
          <div className="flex flex-wrap gap-x-7 gap-y-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ash-400">
            {[
              ["works", "#works"],
              ["exhibition", "#exhibition"],
              ["light study", "#light"],
              ["process", "#process"],
              ["archive", "#archive"],
              ["about", "#about"],
            ].map(([l, h]) => (
              <a
                key={h}
                href={h}
                className="transition-colors hover:text-ember-300"
              >
                {l}
              </a>
            ))}
          </div>
        </div>

        <div className="hairline mt-10" />
        <p className="mt-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-ash-500">
          <span>© {new Date().getFullYear()} — dino_illus</span>
          <span className="flex items-center gap-2 text-ember-400/70">
            <Sparkle className="ember-pulse h-3 w-3" /> where light ends
          </span>
        </p>
      </div>
    </footer>
  );
}
