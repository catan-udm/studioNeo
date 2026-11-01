"use client";

import { works } from "@/tamimoonData";
import { Reveal, useCountUp } from "@/lib/tamimoonMotion";
import ArtImg from "./ArtImg";
import { Fringe, Ink } from "./Ink";

function Stat({ to, suffix, label, jp }: { to: number; suffix?: string; label: string; jp: string }) {
  const { ref, value } = useCountUp(to, 1600);
  return (
    <div className="border-t-[3px] border-ink pt-3">
      <p className="wide text-[clamp(2.6rem,6vw,5rem)] leading-[0.9] tabular-nums">
        <span ref={ref}>{to >= 1900 ? to : value}</span>
        {suffix && <span className="text-vermil">{suffix}</span>}
      </p>
      <p className="tracked-b mt-3 text-[10px] text-ink/70">{label}</p>
      <p className="jp text-[11px] text-ink/45">{jp}</p>
    </div>
  );
}

const strip = [...works.filter((x) => x.h >= x.w * 0.9).slice(0, 14)];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-paper">
      <Fringe className="h-20 text-ink sm:h-32" />

      <div className="relative mx-auto max-w-[1680px] px-4 pt-32 pb-20 sm:px-8 sm:pt-44 sm:pb-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="tracked text-[11px] text-ink/60">01 — About / 紹介</p>
            <h2 className="wide mt-5 text-[clamp(2.4rem,6.4vw,6rem)] leading-[0.88]">
              <span className="line-mask">
                <span>No face.</span>
              </span>
              <span className="line-mask">
                <span style={{ ["--d" as string]: "120ms" }}>
                  Only{" "}
                  <span className="relative inline-block">
                    gaze
                    <Ink kind="underline" className="absolute -bottom-2 left-0 h-3 w-full text-vermil" stroke={4} />
                  </span>
                  .
                </span>
              </span>
            </h2>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal delay={100}>
              <p className="wide-md text-[clamp(1.25rem,2.4vw,2.1rem)] leading-[1.18]">
                tamimoon doesn’t reveal a face or a private life. What exists is the work: women in
                real, specific clothes who look back at you with{" "}
                <span className="bg-lav px-1.5">an appealing gaze</span>.
              </p>
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Reveal delay={160}>
                <p className="text-[14.5px] leading-[1.85] text-ink/70">
                  She started posting in 2020 and was quickly known for fashion-led portraits —
                  fetish-edged styling, soft painted skin, an expression that is half indifference
                  and half invitation. Her audience passed 400,000 across platforms within two
                  years.
                </p>
              </Reveal>
              <Reveal delay={220}>
                <p className="text-[14.5px] leading-[1.85] text-ink/70">
                  In February 2022 she founded an illustration model agency, tamimoon., where the
                  women she draws are given ages, birthdays and favourite things — and brands book
                  them. The same month, KADOKAWA published her first art book, IDENTITY.
                </p>
              </Reveal>
            </div>

            <Reveal delay={120} className="mt-10">
              <blockquote className="border-l-[6px] border-vermil pl-5">
                <p className="tracked text-[clamp(0.8rem,1.25vw,1.05rem)] leading-[2.1]">
                  They are there. Their presence cannot be denied; it can be captured visually. An
                  appealing gaze. Limbs that evoke the future and the past. These women transcend
                  the real world to speak for the message.
                </p>
                <footer className="tracked-b mt-3 text-[10px] text-ink/50">
                  — About, tamimoon.tokyo
                </footer>
              </blockquote>
            </Reveal>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          <Reveal>
            <Stat to={260} suffix="K+" label="Followers on X" jp="@tami_moon02" />
          </Reveal>
          <Reveal delay={80}>
            <Stat to={400} suffix="K+" label="Across platforms" jp="SNS総フォロワー" />
          </Reveal>
          <Reveal delay={160}>
            <Stat to={2020} label="Starts posting" jp="活動開始" />
          </Reveal>
          <Reveal delay={240}>
            <Stat to={112} suffix="p" label="IDENTITY, KADOKAWA" jp="初作品集" />
          </Reveal>
        </div>
      </div>

      {/* filmstrip of real work */}
      <div className="group relative overflow-hidden border-y-[3px] border-ink bg-ink py-3">
        <div className="animate-marquee flex w-max gap-3 group-hover:[animation-play-state:paused]">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex gap-3" aria-hidden={dup === 1}>
              {strip.map((x) => (
                <ArtImg
                  key={`${dup}-${x.id}`}
                  src={x.src}
                  alt={dup === 0 ? x.title : ""}
                  label={x.title}
                  tone={x.tone}
                  className="h-[34svh] shrink-0 sm:h-[40svh]"
                  style={{ aspectRatio: `${x.w} / ${x.h}` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
