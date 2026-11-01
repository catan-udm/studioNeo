import { useEffect, useRef, useState } from "react";
import { Arrow } from "./ui";

const railSections = [
  { id: "top", label: "TOP" },
  { id: "works", label: "WORKS" },
  { id: "practice", label: "PRACTICE" },
  { id: "profile", label: "PROFILE" },
  { id: "color", label: "COLOUR" },
  { id: "artbook", label: "BOOK" },
  { id: "years", label: "YEARS" },
  { id: "exhibition", label: "SHOW" },
  { id: "contact", label: "CONTACT" },
];

/** Fixed right-hand navigator: section dots, a scroll ring, and back-to-top. */
export function SectionRail() {
  const [active, setActive] = useState("top");
  const [ring, setRing] = useState(0);
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    railSections.forEach(({ id }) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      setRing(ratio);
      setLifted(window.scrollY > 620);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <nav aria-label="Section navigator" className={`rail${lifted ? " is-lifted" : ""}`}>
      <ul className="rail__dots">
        {railSections.map(({ id, label }) => (
          <li key={id}>
            <a aria-current={active === id ? "true" : undefined} href={`#${id}`}>
              <span className="rail__label">{label}</span>
              <span aria-hidden="true" className="rail__dot" />
            </a>
          </li>
        ))}
      </ul>

      <a aria-label="Back to top" className="rail__top" href="#top">
        <svg aria-hidden="true" viewBox="0 0 44 44">
          <circle className="rail__track" cx="22" cy="22" r="19" />
          <circle
            className="rail__ring"
            cx="22"
            cy="22"
            r="19"
            style={{ strokeDashoffset: `${119.4 * (1 - ring)}` }}
          />
        </svg>
        <Arrow />
      </a>
    </nav>
  );
}

/**
 * A lagging bolt reticle that swells over anything clickable.
 * Fine pointers only, and never when reduced motion is requested.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const node = ref.current;
    const dot = dotRef.current;
    if (!node || !dot) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;
    let raf = 0;

    const loop = () => {
      x += (targetX - x) * 0.16;
      y += (targetY - y) * 0.16;
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      raf =
        Math.abs(targetX - x) > 0.3 || Math.abs(targetY - y) > 0.3
          ? requestAnimationFrame(loop)
          : 0;
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      node.classList.add("is-live");
      const target = event.target as HTMLElement | null;
      const hot = Boolean(target?.closest("a, button, [data-cursor-hot]"));
      node.classList.toggle("is-hot", hot);
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onLeave = () => node.classList.remove("is-live");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div aria-hidden="true" className="reticle" ref={ref}>
        <span className="reticle__ring" />
        <span className="reticle__bolt">
          <svg fill="currentColor" viewBox="0 0 30 42">
            <path d="M18 0 1 23h12l-3 19 19-27H17L18 0Z" />
          </svg>
        </span>
      </div>
      <div aria-hidden="true" className="reticle-point" ref={dotRef} />
    </>
  );
}
