import type { ReactNode } from "react";
import { useReveal } from "./hooks";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { setRef, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={setRef}
      className={`reveal ${shown ? "is-shown" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`.trim()}>
      tatamipi<span className="wordmark-dot">.</span>
    </span>
  );
}

export function ArrowUp({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18 18 6M8 6h10v10" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ArrowDown({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h16M14 6l6 6-6 6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function Close({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function SectionRow({
  n,
  title,
  aside,
}: {
  n: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="section-row">
      <h2 className="section-title" id={`${title.toLowerCase().replace(/\s+/g, "-")}-title`}>
        <span className="section-n">{n}</span>
        {title}
      </h2>
      {aside}
    </div>
  );
}
