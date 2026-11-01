type P = { className?: string; strokeWidth?: number };

const base = "shrink-0";

export function BrandMark({ className = "h-6 w-6" }: P) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={`${base} ${className}`} aria-hidden>
      <path
        d="M22.4 27.2A12.4 12.4 0 0 1 12.6 4.2a13 13 0 1 0 9.8 23Z"
        fill="currentColor"
      />
      <path
        d="M26.5 3.2 21 12.4l-2.1 3.5 3.9-.9 8.2-1.9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".85"
      />
      <circle cx="21.4" cy="20.6" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function ArrowUpRight({ className = "h-4 w-4", strokeWidth = 1.6 }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
      <path
        d="M7 17 17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowDown({ className = "h-4 w-4", strokeWidth = 1.6 }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
      <path
        d="M12 4v16m0 0-6-6m6 6 6-6"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronLeft({ className = "h-5 w-5", strokeWidth = 1.6 }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
      <path
        d="m14.5 5-7 7 7 7"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronRight({ className = "h-5 w-5", strokeWidth = 1.6 }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
      <path
        d="m9.5 5 7 7-7 7"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Close({ className = "h-5 w-5", strokeWidth = 1.6 }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Plus({ className = "h-4 w-4", strokeWidth = 1.5 }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function Hanger({ className = "h-6 w-6", strokeWidth = 1.3 }: P) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={`${base} ${className}`} aria-hidden>
      <path
        d="M16 12.5V11a2.6 2.6 0 1 1 5.2 0"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="m16 12.6 12.4 8.2c1.5 1 .8 3.2-1 3.2H4.6c-1.8 0-2.5-2.2-1-3.2L16 12.6Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Brush({ className = "h-6 w-6", strokeWidth = 1.3 }: P) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={`${base} ${className}`} aria-hidden>
      <path
        d="M27 5.4 14.9 17.5l-2.6 4.8 4.8-2.6L29.2 7.6 27 5.4Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M12.3 22.3c-1 1-1.2 2.1-2.1 3.2-1 1.2-2.6 1.3-3.9.9-1.5-.5-2.4-1.8-2.3-3.4.1-1.9 1.6-3.1 3.4-3.3 1.5-.2 2.7.1 3.9.9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Spool({ className = "h-6 w-6", strokeWidth = 1.3 }: P) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={`${base} ${className}`} aria-hidden>
      <rect x="9" y="4" width="14" height="4" stroke="currentColor" strokeWidth={strokeWidth} />
      <rect x="9" y="24" width="14" height="4" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M11 8v16M21 8v16" stroke="currentColor" strokeWidth={strokeWidth} />
      <path
        d="M11 11h10M11 14h10M11 17h10M11 20h10"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.8}
        opacity=".7"
      />
    </svg>
  );
}

export function Spotlight({ className = "h-6 w-6", strokeWidth = 1.3 }: P) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={`${base} ${className}`} aria-hidden>
      <path
        d="M11 5h10l2 7H9l2-7Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M9.6 12 4 27h24L22.4 12M16 12v15"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        opacity=".65"
      />
    </svg>
  );
}

export function Quote({ className = "h-8 w-8" }: P) {
  return (
    <svg viewBox="0 0 40 32" fill="none" className={`${base} ${className}`} aria-hidden>
      <path
        d="M0 32V18.4C0 8.6 5.2 2.2 15 0l1.8 5.2C11 7.2 8.4 10.2 8.4 14.4H16V32H0Zm23.2 0V18.4C23.2 8.6 28.4 2.2 38.2 0L40 5.2c-5.8 2-8.4 5-8.4 9.2H39.2V32H23.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function GlyphX({ className = "h-4 w-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
      <path
        d="M3.5 3.5 10.4 13 3.9 20.5h2l5.4-6.2 4.5 6.2h4.7L13.3 10.4 19.4 3.5h-2l-5 5.8L8.2 3.5H3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function GlyphInstagram({ className = "h-4 w-4", strokeWidth = 1.5 }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="17.1" cy="6.9" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function GlyphPixiv({ className = "h-4 w-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
      <rect x="2.6" y="4.4" width="18.8" height="15.2" rx="3.4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.4 16.6V8.2h3.9a2.6 2.6 0 0 1 0 5.2H7.4m6.1 3.2V8.2m2.9 0 2.2 3.4-2.2 3.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Mail({ className = "h-4 w-4", strokeWidth = 1.5 }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
      <rect x="2.8" y="5" width="18.4" height="14" rx="2" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="m3.4 6.6 8.6 6.3 8.6-6.3" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function Check({ className = "h-5 w-5", strokeWidth = 1.8 }: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className}`} aria-hidden>
      <path
        d="m4.5 12.6 4.8 4.9L19.6 6.9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const serviceIcons = [Hanger, Spool, Brush, Spotlight];
