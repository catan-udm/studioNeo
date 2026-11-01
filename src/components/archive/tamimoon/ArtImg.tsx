"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/utils/cn";

type Props = {
  src: string;
  alt: string;
  tone?: string;
  pos?: string;
  label?: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  style?: CSSProperties;
  contain?: boolean;
};

/**
 * The artwork is hosted on the artist's own site (tamimoon.tokyo), so it is loaded in place.
 * While it loads (or if the network blocks it) the box keeps its painted colour
 * field and shows the title instead of collapsing.
 */
export default function ArtImg({
  src,
  alt,
  tone = "#d6d8df",
  pos = "50% 50%",
  label,
  className,
  imgClassName,
  eager,
  style,
  contain,
}: Props) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [state, setState] = useState<"load" | "ok" | "err">("load");

  useEffect(() => {
    setState("load");
    const el = ref.current;
    if (el && el.complete && el.naturalWidth > 0) setState("ok");
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ backgroundColor: tone, ...style }}>
      {state !== "err" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setState("ok")}
          onError={() => setState("err")}
          style={{ objectPosition: pos }}
          className={cn(
            "absolute inset-0 h-full w-full transition-opacity duration-700",
            contain ? "object-contain" : "object-cover",
            state === "ok" ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
      {state === "err" && (
        <div className="absolute inset-0 flex items-end p-3">
          <p className="wide-md jp text-[11px] leading-tight text-ink/60">{label ?? alt}</p>
        </div>
      )}
    </div>
  );
}
