"use client";

import { useState } from "react";
import { email, links, slides } from "@/tamimoonData";
import { Reveal } from "@/lib/tamimoonMotion";
import { cn } from "@/utils/cn";
import ArtImg from "./ArtImg";
import { ArrowUpRight, Check, Mail } from "./Icons";
import { Ink } from "./Ink";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const art = slides[4]; // Chiyono Anne — lavender ground

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      /* clipboard unavailable — still show feedback */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-pink text-white">
      <div className="mx-auto max-w-[1680px] px-4 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="tracked text-[11px] text-white/80">08 — Contact / 連絡</p>
              <h2 className="wide mt-5 text-[clamp(2.8rem,8.4vw,8.2rem)] leading-[0.86]">
                <span className="line-mask">
                  <span>Let her</span>
                </span>
                <span className="line-mask">
                  <span style={{ ["--d" as string]: "110ms" }}>
                    <span className="relative inline-block">
                      look
                      <Ink kind="underline" className="absolute -bottom-2 left-0 h-4 w-full text-white" stroke={5} />
                    </span>{" "}
                    at it.
                  </span>
                </span>
              </h2>
            </Reveal>

            <Reveal delay={100} className="mt-8 max-w-[52ch]">
              <p className="text-[15px] leading-[1.85] text-white/85">
                For commissions, editorial, brand collaborations and the agency’s models, write to
                the studio. Say what it is, where it will be seen, and when it needs to exist.
              </p>
            </Reveal>

            <Reveal delay={160} className="mt-10">
              <div className="border-y-[3px] border-white py-5">
                <p className="tracked-b text-[10px] text-white/75">Enquiries</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <a
                    href={`mailto:${email}?subject=${encodeURIComponent("Enquiry for tamimoon")}`}
                    className="wide-md group flex items-center gap-3 text-[clamp(1.6rem,4.4vw,3.6rem)] leading-none tracking-tight normal-case"
                  >
                    <Mail className="h-7 w-7 shrink-0 sm:h-9 sm:w-9" />
                    <span className="link-line">{email}</span>
                  </a>
                  <button
                    onClick={copy}
                    className={cn(
                      "tracked-b flex items-center gap-2 rounded-full border-2 border-white px-4 py-2.5 text-[10.5px] transition-all duration-300",
                      copied ? "bg-white text-pink" : "hover:bg-white hover:text-pink",
                    )}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" /> Copied
                      </>
                    ) : (
                      "Copy address"
                    )}
                  </button>
                </div>
              </div>
            </Reveal>

            <Reveal delay={220} className="mt-10">
              <ul className="grid gap-x-10 sm:grid-cols-2">
                {links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group flex items-baseline gap-3 border-b border-white/35 py-3.5 transition-all duration-300 hover:border-white hover:pl-1.5"
                    >
                      <span className="tracked-b text-[10.5px]">{l.label}</span>
                      <span className="text-[13px] text-white/70">{l.handle}</span>
                      <ArrowUpRight className="ml-auto h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal dir="right" delay={120} className="lg:col-span-5">
            <div className="relative mx-auto max-w-[460px] lg:ml-auto">
              <span className="hand-frame pointer-events-none absolute -inset-3 z-20 border-[3px] border-white" aria-hidden />
              <div className="bob [--r:1.2deg]">
                <ArtImg
                  src={art.src}
                  alt={art.alt}
                  pos={art.pos}
                  tone={art.field}
                  label="Chiyono Anne × tamimoon"
                  className="aspect-[4/5] w-full"
                />
              </div>
              <p className="tracked-b mt-5 text-[10px] text-white/80">Chiyono Anne × tamimoon</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
