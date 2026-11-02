'use client';

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LiquidGlassDefs, useLiquidRefraction } from '@/components/LiquidGlass';
import { illustrators } from '@/data/illustrators';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type RouteId = 'studio' | 'projects' | 'artist';
type ModalType = 'settings' | 'profile' | 'terms' | 'auth' | null;
type Theme = 'light' | 'dark' | 'system';
type UiScale = 'compact' | 'default' | 'comfortable';
type MotionPref = 'full' | 'interactive' | 'reduced';
type DockPosition = 'right' | 'left' | 'top';

const navigation: { id: RouteId; label: string; path: string }[] = [
  { id: 'studio', label: 'Studio', path: '/' },
  { id: 'projects', label: 'Projects', path: '/projects' },
  { id: 'artist', label: 'Artists', path: '/artist' },
];

function StudioMark() {
  return (
    <svg viewBox="0 0 1553 1375" fill="none" aria-hidden="true">
      <path
        d="M880.003 473.5C875.336 428 843.503 321.6 753.503 260C641.003 183 539.503 96.5 263.503 189.5"
        stroke="currentColor"
        strokeWidth="32"
        strokeLinecap="round"
      />
      <path
        d="M263.243 191C250.031 361.691 306.188 690.17 636.503 638.563"
        stroke="currentColor"
        strokeWidth="32"
        strokeLinecap="round"
      />
      <path
        d="M636.503 639C634.003 654.5 630.103 689.4 634.503 705"
        stroke="currentColor"
        strokeWidth="32"
        strokeLinecap="round"
      />
      <path
        d="M493.503 825C581.67 799.667 714.503 746.5 815.503 609.5C914.003 492.5 913.503 493 971.503 473C1029.5 453 1126 532.5 1126 609.5C1126 652.5 1086 685.5 1042 814.5C1035.5 962.5 1086 1179.5 972.503 1312.5C859.003 1445.5 551.003 1247 528.003 1236.5C505.003 1226 144.003 1166 16.0029 936"
        stroke="currentColor"
        strokeWidth="32"
        strokeLinecap="round"
      />
      <path
        d="M17.5029 937C67.3363 964.333 197.603 1018.2 320.003 1015C473.003 1011 521.003 1058 716.503 1212"
        stroke="currentColor"
        strokeWidth="32"
        strokeLinecap="round"
      />
      <path
        d="M934.003 608C945.003 664 925.003 786.7 757.003 829.5C711.003 839.9 637.17 872.833 606.003 888C551.503 908.333 396.003 944.5 210.003 926.5"
        stroke="currentColor"
        strokeWidth="32"
        strokeLinecap="round"
      />
      <path
        d="M873.003 172C904.207 172 929.503 197.296 929.503 228.5C929.503 259.704 904.207 285 873.003 285C841.799 285 816.503 259.704 816.503 228.5C816.503 197.296 841.799 172 873.003 172Z"
        stroke="currentColor"
        strokeWidth="32"
      />
      <path
        d="M1021.5 188C1079.31 188 1126.5 235.495 1126.5 294.5C1126.5 353.505 1079.31 401 1021.5 401C963.698 401 916.503 353.505 916.503 294.5C916.503 235.495 963.698 188 1021.5 188Z"
        stroke="currentColor"
        strokeWidth="32"
      />
      <line
        x1="1386.43"
        y1="470.266"
        x2="1492.77"
        y2="92.0719"
        stroke="currentColor"
        strokeWidth="32"
        strokeLinecap="round"
      />
      <circle cx="1502.5" cy="50" r="34" stroke="currentColor" strokeWidth="32" />
    </svg>
  );
}

function NavIcon({ id }: { id: RouteId }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };
  if (id === 'studio')
    return (
      <svg {...common}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  if (id === 'projects')
    return (
      <svg {...common}>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 3v18M17 3v18M3 12h18M3 7.5h4M3 16.5h4M17 7.5h4M17 16.5h4" />
      </svg>
    );
  if (id === 'artist')
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  return null;
}

function ArrowIcon({ size = 19 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 19 19 5M8 5h11v11" />
    </svg>
  );
}

function SettingsModal({
  theme,
  setTheme,
  uiScale,
  setUiScale,
  motion,
  setMotion,
  onClose,
  onReset,
}: {
  theme: Theme;
  setTheme: (t: Theme) => void;
  uiScale: UiScale;
  setUiScale: (s: UiScale) => void;
  motion: MotionPref;
  setMotion: (m: MotionPref) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  return (
    <div
      className="settings-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Studio Settings"
    >
      <div
        className="settings-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="settings-modal-header">
          <div className="settings-modal-title-group">
            <div className="settings-modal-title-icon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div>
              <h2 className="settings-modal-title">Studio Settings</h2>
              <span className="settings-modal-subtitle">
                Display &amp; interaction preferences
              </span>
            </div>
          </div>
          <button
            type="button"
            className="settings-modal-close-btn"
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </header>

        <div className="settings-modal-body">
          <section>
            <div className="settings-section-title">Color Theme</div>
            <div
              className="settings-pill-group"
              role="radiogroup"
              aria-label="Theme"
            >
              {(['system', 'light', 'dark'] as Theme[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`settings-pill-btn${theme === t ? ' active' : ''}`}
                  onClick={() => setTheme(t)}
                  role="radio"
                  aria-checked={theme === t}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="settings-section-title">Interface Scale</div>
            <div
              className="settings-pill-group"
              role="radiogroup"
              aria-label="Interface Scale"
            >
              {(['compact', 'default', 'comfortable'] as UiScale[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`settings-pill-btn${uiScale === s ? ' active' : ''}`}
                  onClick={() => setUiScale(s)}
                  role="radio"
                  aria-checked={uiScale === s}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="settings-section-title">Motion Physics</div>
            <div
              className="settings-pill-group"
              role="radiogroup"
              aria-label="Motion Physics"
            >
              {(['full', 'interactive', 'reduced'] as MotionPref[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`settings-pill-btn${motion === m ? ' active' : ''}`}
                  onClick={() => setMotion(m)}
                  role="radio"
                  aria-checked={motion === m}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </section>
        </div>

        <footer className="settings-modal-footer">
          <span className="settings-status-note">Saved locally</span>
          <button
            type="button"
            className="settings-reset-btn"
            onClick={onReset}
          >
            Reset Defaults
          </button>
        </footer>
      </div>
    </div>
  );
}

function ProfileModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="settings-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Profile"
    >
      <div
        className="settings-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="settings-modal-header">
          <div className="settings-modal-title-group">
            <div className="settings-modal-title-icon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h2 className="settings-modal-title">Studio Passkey Profile</h2>
              <span className="settings-modal-subtitle">
                WebAuthn Biometric Session
              </span>
            </div>
          </div>
          <button
            type="button"
            className="settings-modal-close-btn"
            onClick={onClose}
            aria-label="Close profile"
          >
            ✕
          </button>
        </header>

        <div className="settings-modal-body">
          <div className="profile-badge-card">
            <div className="profile-avatar-circle">
              <StudioMark />
            </div>
            <div className="profile-badge-meta">
              <strong>Studio Guest Patron</strong>
              <small>FIDO2 Biometric Key: Verified</small>
            </div>
            <span className="status-dot-active" />
          </div>

          <div className="profile-detail-grid">
            <div className="profile-detail-item">
              <span className="profile-detail-label">Curated Illustrators</span>
              <strong className="profile-detail-value">
                {illustrators.length} profiles
              </strong>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Session Authentication</span>
              <strong className="profile-detail-value">Passwordless</strong>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Active Directory</span>
              <strong className="profile-detail-value">Official X / Pixiv</strong>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-label">Atelier Release</span>
              <strong className="profile-detail-value">2026 Archive</strong>
            </div>
          </div>
        </div>

        <footer className="settings-modal-footer">
          <Link
            href="/gallery"
            onClick={onClose}
            className="settings-footer-link"
          >
            Explore 64 Profiles →
          </Link>
          <button
            type="button"
            className="landing-button landing-button-primary modal-action-btn"
            onClick={onClose}
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}

function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="settings-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Terms &amp; Policies"
    >
      <div
        className="settings-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="settings-modal-header">
          <div className="settings-modal-title-group">
            <div className="settings-modal-title-icon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <div>
              <h2 className="settings-modal-title">Terms &amp; Policies</h2>
              <span className="settings-modal-subtitle">
                Attribution &amp; Non-Affiliation
              </span>
            </div>
          </div>
          <button
            type="button"
            className="settings-modal-close-btn"
            onClick={onClose}
            aria-label="Close terms"
          >
            ✕
          </button>
        </header>

        <div className="settings-modal-body terms-text-body">
          <p>
            <strong>1. Official Profile Pictures:</strong> All {illustrators.length}{' '}
            illustrator profile images showcased in this directory are authentic public
            avatars retrieved from Twitter&apos;s Content Delivery Network (
            <code>pbs.twimg.com</code>). None of the images are generated by artificial
            intelligence.
          </p>
          <p>
            <strong>2. Ownership &amp; Intellectual Property:</strong> All artwork,
            characters, trademarks, and profile images remain the exclusive property of
            their respective creators and illustrators.
          </p>
          <p>
            <strong>3. Non-Affiliation:</strong> This is an independent, non-commercial
            discovery directory and curatorial study inspired by the studioNeo /
            bikko.studio aesthetic. It is not endorsed by, sponsored by, or formally
            affiliated with X Corp., Pixiv, or the individual artists.
          </p>
          <p>
            <strong>4. Direct Links:</strong> Each card and grid tile directs visitors
            straight to the creator&apos;s verified public profile so fans and clients
            can support their work directly at the source.
          </p>
        </div>

        <footer className="settings-modal-footer">
          <span className="settings-status-note">studioNeo Archive • 2026</span>
          <button
            type="button"
            className="landing-button landing-button-primary modal-action-btn"
            onClick={onClose}
          >
            Acknowledge
          </button>
        </footer>
      </div>
    </div>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);

  const simulatePasskey = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setAuthed(true);
    }, 700);
  };

  return (
    <div
      className="settings-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Account Access"
    >
      <div
        className="settings-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="settings-modal-header">
          <div className="settings-modal-title-group">
            <div className="settings-modal-title-icon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <div>
              <h2 className="settings-modal-title">WebAuthn Passkey Access</h2>
              <span className="settings-modal-subtitle">
                Zero Passwords • Biometric Identity
              </span>
            </div>
          </div>
          <button
            type="button"
            className="settings-modal-close-btn"
            onClick={onClose}
            aria-label="Close access dialog"
          >
            ✕
          </button>
        </header>

        <div className="settings-modal-body">
          {authed ? (
            <div className="auth-success-box">
              <div className="auth-success-check">✓</div>
              <h3>Biometric Passkey Verified</h3>
              <p>
                Welcome back to the studioNeo atelier. Your hardware-backed session key
                is active.
              </p>
            </div>
          ) : (
            <div className="auth-prompt-box">
              <div className="passkey-glyph" aria-hidden="true">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21 2-2 2m-1.5 1.5L16 7M2 13a6 6 0 1 0 11.2-3M2 13l7.5-7.5M10.5 7 12 8.5M13.5 10l1.5 1.5" />
                  <circle cx="7.5" cy="16.5" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <h3>Touch ID, Face ID, or Security Key</h3>
              <p>
                Sign in using your device&apos;s biometric passkey. Eliminates passwords,
                phishing, and raster delay.
              </p>
              <button
                type="button"
                className="landing-button landing-button-primary auth-submit-btn"
                onClick={simulatePasskey}
                disabled={loading}
              >
                {loading ? 'Authenticating Passkey…' : 'Authenticate with Passkey'}
              </button>
            </div>
          )}
        </div>

        <footer className="settings-modal-footer">
          <span className="settings-status-note">FIDO2 / WebAuthn Standard</span>
          <button
            type="button"
            className="settings-reset-btn"
            onClick={onClose}
          >
            {authed ? 'Close' : 'Cancel'}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default function StudioNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [indicator, setIndicator] = useState({ x: 4, y: 4, width: 0, height: 0 });
  const [modal, setModal] = useState<ModalType>(null);

  const [theme, setThemeState] = useState<Theme>('system');
  const [uiScale, setUiScaleState] = useState<UiScale>('default');
  const [motion, setMotionState] = useState<MotionPref>('full');

  // Mobile Drag Dock state (clips to 'right', 'left', or 'top')
  const [dockPosition, setDockPosition] = useState<DockPosition>('right');
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [hoverDock, setHoverDock] = useState<DockPosition | null>(null);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    pointerId: number;
    target: HTMLElement | null;
    isDragging: boolean;
    hasMoved: boolean;
  } | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const justDraggedRef = useRef(false);

  useEffect(() => {
    try {
      const savedDock = localStorage.getItem('bikko_mobile_dock') as DockPosition | null;
      if (savedDock && ['right', 'left', 'top'].includes(savedDock)) {
        setDockPosition(savedDock);
      }
    } catch {}
  }, []);

  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);

  // Only individual artist profile routes (/artist/[handle]) activate the hero glass variant;
  // the main /artist directory page retains standard docked header behavior.
  const isArtistRoute = pathname ? pathname.startsWith('/artist/') : false;

  const getRouteFromPath = useCallback((path: string): RouteId | null => {
    if (path === '/') return 'studio';
    if (path.startsWith('/projects')) return 'projects';
    if (path === '/artist' || path.startsWith('/artist')) return 'artist';
    return null;
  }, []);

  const route = getRouteFromPath(pathname);

  const glassSpecs = useLiquidRefraction({
    leftRef,
    sliderRef: navRef,
    burgerRef,
    popoverRef,
    deps: [route, scrolled, menuOpen, dockPosition],
  });

  const isMobileOrLandscape = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.innerWidth <= 780 ||
      (window.innerWidth <= 950 &&
        window.innerHeight <= 520 &&
        window.matchMedia('(orientation: landscape)').matches)
    );
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (!isMobileOrLandscape() || e.button !== 0) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    const startX = e.clientX;
    const startY = e.clientY;
    dragRef.current = {
      startX,
      startY,
      pointerId: e.pointerId,
      target: e.currentTarget,
      isDragging: false,
      hasMoved: false,
    };

    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      if (!dragRef.current) return;
      dragRef.current.isDragging = true;
      setIsDragging(true);
      setDragPos({ x: startX, y: startY });
    }, 180);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const dist = Math.hypot(dx, dy);

    if (!dragRef.current.isDragging && dist > 8) {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      dragRef.current.isDragging = true;
      setIsDragging(true);
    }

    if (dragRef.current.isDragging) {
      dragRef.current.hasMoved = true;
      const x = e.clientX;
      const y = e.clientY;
      setDragPos({ x, y });

      const W = window.innerWidth;
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const topThreshold = isLandscape ? 120 : 160;
      if (y < topThreshold) {
        setHoverDock('top');
      } else if (x < W / 2) {
        setHoverDock('left');
      } else {
        setHoverDock('right');
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (!dragRef.current) return;

    if (dragRef.current.isDragging) {
      const W = window.innerWidth;
      const x = e.clientX;
      const y = e.clientY;
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const topThreshold = isLandscape ? 120 : 160;
      let targetDock: DockPosition = 'right';
      if (y < topThreshold) {
        targetDock = 'top';
      } else if (x < W / 2) {
        targetDock = 'left';
      } else {
        targetDock = 'right';
      }

      setDockPosition(targetDock);
      try {
        localStorage.setItem('bikko_mobile_dock', targetDock);
      } catch {}

      justDraggedRef.current = true;
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 220);
    }

    try {
      dragRef.current.target?.releasePointerCapture(e.pointerId);
    } catch {}

    setIsDragging(false);
    setDragPos(null);
    setHoverDock(null);
    dragRef.current = null;
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLElement>) => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (dragRef.current) {
      try {
        dragRef.current.target?.releasePointerCapture(e.pointerId);
      } catch {}
    }
    setIsDragging(false);
    setDragPos(null);
    setHoverDock(null);
    dragRef.current = null;
  };

  // Window drag fallback: ensures releasing anywhere (e.g. top edge) safely docks the capsule
  useEffect(() => {
    if (!isDragging) return;

    const onWindowPointerMove = (e: PointerEvent) => {
      if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
      dragRef.current.hasMoved = true;
      const x = e.clientX;
      const y = e.clientY;
      setDragPos({ x, y });

      const W = window.innerWidth;
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const topThreshold = isLandscape ? 120 : 160;
      if (y < topThreshold) {
        setHoverDock('top');
      } else if (x < W / 2) {
        setHoverDock('left');
      } else {
        setHoverDock('right');
      }
    };

    const onWindowPointerUp = (e: PointerEvent) => {
      if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

      if (dragRef.current.isDragging) {
        const W = window.innerWidth;
        const x = e.clientX;
        const y = e.clientY;
        const isLandscape = window.matchMedia('(orientation: landscape)').matches;
        const topThreshold = isLandscape ? 120 : 160;
        let targetDock: DockPosition = 'right';
        if (y < topThreshold) {
          targetDock = 'top';
        } else if (x < W / 2) {
          targetDock = 'left';
        } else {
          targetDock = 'right';
        }

        setDockPosition(targetDock);
        try {
          localStorage.setItem('bikko_mobile_dock', targetDock);
        } catch {}

        justDraggedRef.current = true;
        setTimeout(() => {
          justDraggedRef.current = false;
        }, 220);
      }

      try {
        dragRef.current.target?.releasePointerCapture(e.pointerId);
      } catch {}

      setIsDragging(false);
      setDragPos(null);
      setHoverDock(null);
      dragRef.current = null;
    };

    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);
    };
  }, [isDragging]);

  // Per-pixel adaptive glyphs (black on light, white on dark, down to part of a
  // letter / part of a stroke). Each glyph (label text, logo stroke, icon) gets
  // an alpha mask of its exact shape; a sibling layer clipped by that mask runs
  // `backdrop-filter: grayscale(1) invert(1) contrast(100)` over whatever is
  // actually painted behind it (page, artwork, video, island glass).
  useEffect(() => {
    const header = headerRef.current;
    if (!header || typeof CSS === 'undefined') return;
    const ua = navigator.userAgent;
    const isBlink = /Chrome\/|Chromium\/|Edg\//.test(ua) && !/Firefox\//.test(ua);
    const supported =
      isBlink &&
      CSS.supports('backdrop-filter', 'grayscale(1) invert(1) contrast(100)') &&
      CSS.supports('mask-image', 'url("data:image/png;base64,AA==")');
    if (!supported) return;

    const root = document.documentElement;

    const textMask = (el: HTMLElement): string => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const text = el.textContent ?? '';
      if (!w || !h || !text) return '';
      const cs = getComputedStyle(el);
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(w * dpr);
      canvas.height = Math.ceil(h * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      ctx.scale(dpr, dpr);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
        cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#000';
      const m = ctx.measureText(text);
      const ascent = m.fontBoundingBoxAscent ?? parseFloat(cs.fontSize) * 0.8;
      const descent = m.fontBoundingBoxDescent ?? parseFloat(cs.fontSize) * 0.2;
      ctx.fillText(text, 0, (h - (ascent + descent)) / 2 + ascent);
      return canvas.toDataURL('image/png');
    };

    const svgMask = (svg: SVGElement): string => {
      const clone = svg.cloneNode(true) as SVGElement;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      const markup = new XMLSerializer()
        .serializeToString(clone)
        .replace(/currentColor/g, '#000');
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    };

    const apply = (el: HTMLElement, uri: string) => {
      if (!uri) return;
      el.style.setProperty('--glyph-mask', `url("${uri}")`);
      el.setAttribute('data-glyph-ready', 'true');
    };

    const buildAll = () => {
      header
        .querySelectorAll<HTMLElement>('.nav-pill-text, .popover-action-text')
        .forEach((el) => apply(el, textMask(el)));
      header
        .querySelectorAll<HTMLElement>('.studio-nav-brand-link, .nav-pill-icon, .popover-action-icon')
        .forEach((el) => {
          const svg = el.querySelector<SVGElement>('svg');
          if (svg) apply(el, svgMask(svg));
        });
    };

    buildAll();
    root.setAttribute('data-adaptive-glyphs', 'true');

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) buildAll();
    });
    const ro =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(buildAll) : null;
    header
      .querySelectorAll<HTMLElement>('.nav-pill-text, .popover-action-text')
      .forEach((el) => ro?.observe(el));
    window.addEventListener('resize', buildAll);

    return () => {
      cancelled = true;
      ro?.disconnect();
      window.removeEventListener('resize', buildAll);
    };
  }, [pathname]);

  // Sync scroll position, progress fill, and dynamic backdrop tone
  useEffect(() => {
    let ticking = false;
    const updatePosition = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        const isPastThreshold = y > 20;
        setScrolled((prev) => (prev !== isPastThreshold ? isPastThreshold : prev));

        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight;
        const p = scrollable > 0 ? Math.min(y / scrollable, 1) : 0;
        if (progressFillRef.current) {
          progressFillRef.current.style.transform = `scaleX(${p})`;
          progressFillRef.current.style.opacity = p > 0.004 ? '1' : '0';
        }
      });
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [route, pathname]);

  // Precise capsule indicator measurement with ResizeObserver & fonts.ready
  useIsomorphicLayoutEffect(() => {
    const updateIndicator = () => {
      const active = route
        ? navRef.current?.querySelector<HTMLElement>(`[data-route="${route}"]`)
        : null;
      if (active) {
        setIndicator({
          x: active.offsetLeft,
          y: active.offsetTop,
          width: active.offsetWidth,
          height: active.offsetHeight,
        });
      } else {
        setIndicator({ x: 0, y: 0, width: 0, height: 0 });
      }
    };

    updateIndicator();
    const ro =
      typeof ResizeObserver !== 'undefined' && navRef.current
        ? new ResizeObserver(() => updateIndicator())
        : null;
    if (ro && navRef.current) ro.observe(navRef.current);
    document.fonts?.ready?.then(updateIndicator);
    window.addEventListener('resize', updateIndicator);
    window.addEventListener('orientationchange', updateIndicator);

    const mql =
      typeof window !== 'undefined'
        ? window.matchMedia('(orientation: landscape)')
        : null;
    const handleMql = () => {
      requestAnimationFrame(updateIndicator);
    };
    mql?.addEventListener?.('change', handleMql);

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', updateIndicator);
      window.removeEventListener('orientationchange', updateIndicator);
      mql?.removeEventListener?.('change', handleMql);
    };
  }, [route, dockPosition]);

  // Close menus on outside click or Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  // Theme & UI preference sync
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('bikko_theme') as Theme | null;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
      const savedScale = localStorage.getItem('bikko_ui_scale') as UiScale | null;
      if (savedScale && ['compact', 'default', 'comfortable'].includes(savedScale)) {
        setUiScaleState(savedScale);
      }
      const savedMotion = localStorage.getItem('bikko_motion') as MotionPref | null;
      if (savedMotion && ['full', 'interactive', 'reduced'].includes(savedMotion)) {
        setMotionState(savedMotion);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const resolved =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;
    root.setAttribute('data-theme', resolved);
    root.setAttribute('data-resolved-theme', resolved);
    try {
      localStorage.setItem('bikko_theme', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-scale', uiScale);
    try {
      localStorage.setItem('bikko_ui_scale', uiScale);
    } catch {}
  }, [uiScale]);

  useEffect(() => {
    document.documentElement.setAttribute('data-motion', motion);
    try {
      localStorage.setItem('bikko_motion', motion);
    } catch {}
  }, [motion]);

  const handleResetSettings = () => {
    setThemeState('system');
    setUiScaleState('default');
    setMotionState('full');
  };

  const selectSection = (id: RouteId) => {
    const target = navigation.find((item) => item.id === id)?.path ?? '/';
    setMenuOpen(false);
    if (pathname === target) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push(target);
    }
  };

  return (
    <>
      <LiquidGlassDefs specs={glassSpecs} />

      {/* Top Reading Progress Bar */}
      <div className="page-top-progress-bar" aria-hidden="true">
        <div
          ref={progressFillRef}
          className="page-top-progress-fill"
        />
      </div>

      {/* Mobile Drag Dock Drop Zones */}
      {isDragging && (
        <div className="dock-drop-zones-layer" aria-hidden="true">
          <div className={`dock-drop-zone dock-drop-zone-top visible${hoverDock === 'top' ? ' active' : ''}`} />
          <div className={`dock-drop-zone dock-drop-zone-left visible${hoverDock === 'left' ? ' active' : ''}`} />
          <div className={`dock-drop-zone dock-drop-zone-right visible${hoverDock === 'right' ? ' active' : ''}`} />
        </div>
      )}

      {/* Sticky Liquid Glass Navbar */}
      <header
        ref={headerRef}
        className={`studio-nav-header${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' menu-open' : ''}`}
        data-artist-route={isArtistRoute ? 'true' : undefined}
        role="banner"
      >
        <div className="studio-nav-inner">
          {/* Island 1: Left Insignia Mark Bubble */}
          <div className="studio-nav-left bubble-island" ref={leftRef}>
            <Link
              className="studio-nav-brand-link"
              href="/"
              aria-label="Bikko Studio home"
              onClick={() => selectSection('studio')}
            >
              <StudioMark />
            </Link>
          </div>

          {/* Island 2: Center Navigation Capsule Slider */}
          <div
            className={`studio-nav-center${menuOpen ? ' nav-menu-open' : ''}${isDragging ? ' is-dragging' : ''}`}
            data-dock={dockPosition}
            style={
              isDragging && dragPos
                ? {
                    position: 'fixed',
                    left: `${dragPos.x}px`,
                    top: `${dragPos.y}px`,
                    right: 'auto',
                    bottom: 'auto',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1005,
                    transition: 'none',
                  }
                : undefined
            }
          >
            <nav
              className="studio-nav-slider bubble-island"
              aria-label="Main navigation"
              ref={navRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onDragStart={(e) => e.preventDefault()}
            >
              <span
                className="nav-slider-indicator"
                aria-hidden="true"
                style={
                  {
                    '--indicator-x': `${indicator.x}px`,
                    '--indicator-y': `${indicator.y}px`,
                    '--indicator-w': `${indicator.width}px`,
                    '--indicator-h': `${indicator.height}px`,
                    opacity: indicator.width || indicator.height ? 1 : 0,
                  } as React.CSSProperties
                }
              />
              {navigation.map((item) => (
                <Link
                  key={item.id}
                  data-route={item.id}
                  className={`nav-pill${route === item.id ? ' active' : ''}`}
                  href={item.path}
                  aria-label={item.label}
                  aria-current={route === item.id ? 'page' : undefined}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onClick={(e) => {
                    if (justDraggedRef.current || isDragging) {
                      e.preventDefault();
                      return;
                    }
                    if (pathname === item.path) {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                    setMenuOpen(false);
                  }}
                >
                  <span className="nav-pill-icon">
                    <NavIcon id={item.id} />
                  </span>
                  <span className="nav-pill-text">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Island 3: Right Quick Actions & Burger Bubble */}
          <div className="studio-nav-right" ref={menuRef}>
            {/* Static Action Buttons (slide horizontally into view on static header) */}
            <div
              className={`nav-static-actions${menuOpen && !scrolled ? ' is-open' : ''}`}
              role="menu"
              aria-label="Quick Actions"
              aria-hidden={!menuOpen || scrolled}
            >
              <div
                className="burger-menu-section burger-menu-horizontal"
                role="group"
                aria-label="Preferences and Profile"
              >
                <button
                  type="button"
                  className="burger-icon-btn"
                  aria-label="Settings"
                  title="Settings"
                  onClick={() => {
                    setModal('settings');
                    setMenuOpen(false);
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span className="burger-icon-tooltip">Settings</span>
                </button>
                <button
                  type="button"
                  className="burger-icon-btn"
                  aria-label="Profile"
                  title="Profile"
                  onClick={() => {
                    setModal('profile');
                    setMenuOpen(false);
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="burger-icon-tooltip">Profile</span>
                </button>
                <button
                  type="button"
                  className="burger-icon-btn"
                  aria-label="Terms & Policies"
                  title="Terms & Policies"
                  onClick={() => {
                    setModal('terms');
                    setMenuOpen(false);
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="10" y1="9" x2="8" y2="9" />
                  </svg>
                  <span className="burger-icon-tooltip">Terms & Policies</span>
                </button>
              </div>
              <div className="burger-menu-divider burger-divider-horizontal" />
              <div
                className="burger-menu-section burger-menu-horizontal burger-menu-auth"
                role="group"
                aria-label="Account Access"
              >
                <button
                  type="button"
                  className="burger-icon-btn"
                  aria-label="Sign In"
                  title="Sign In"
                  onClick={() => {
                    setModal('auth');
                    setMenuOpen(false);
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span className="burger-icon-tooltip">Sign In</span>
                </button>
                <button
                  type="button"
                  className="burger-icon-btn burger-signup-btn"
                  aria-label="Sign Up"
                  title="Sign Up"
                  onClick={() => {
                    setModal('auth');
                    setMenuOpen(false);
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  <span className="burger-icon-tooltip">Sign Up</span>
                </button>
              </div>
            </div>

            {/* Burger Bubble Island */}
            <div className="menu-anchor">
              <div className="nav-burger-bubble bubble-island" ref={burgerRef}>
                <button
                  type="button"
                  className={`hamburger-btn${menuOpen ? ' is-open open' : ''}`}
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={menuOpen}
                  aria-controls="studio-menu"
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <span className="hamburger-line line-1" />
                  <span className="hamburger-line line-2" />
                  <span className="hamburger-line line-3" />
                </button>
              </div>

              {/* Scrolled Floating Dynamic Island Popover */}
              <div
                className={`nav-burger-popover${menuOpen && scrolled ? ' is-open' : ''}`}
                id="studio-menu"
                aria-hidden={!menuOpen || !scrolled}
                ref={popoverRef}
              >
                <div className="popover-quick-actions">
                  <button
                    type="button"
                    className="popover-action-row"
                    onClick={() => {
                      setModal('settings');
                      setMenuOpen(false);
                    }}
                  >
                    <span className="popover-action-icon">
                      <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    </span>
                    <span className="popover-action-text">Settings</span>
                  </button>
                  <button
                    type="button"
                    className="popover-action-row"
                    onClick={() => {
                      setModal('profile');
                      setMenuOpen(false);
                    }}
                  >
                    <span className="popover-action-icon">
                      <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    </span>
                    <span className="popover-action-text">Profile</span>
                  </button>
                  <button
                    type="button"
                    className="popover-action-row"
                    onClick={() => {
                      setModal('terms');
                      setMenuOpen(false);
                    }}
                  >
                    <span className="popover-action-icon">
                      <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <line x1="10" y1="9" x2="8" y2="9" />
                    </svg>
                    </span>
                    <span className="popover-action-text">Terms & Policies</span>
                  </button>
                  <button
                    type="button"
                    className="popover-action-row popover-action-highlight"
                    onClick={() => {
                      setModal('auth');
                      setMenuOpen(false);
                    }}
                  >
                    <span className="popover-action-icon">
                      <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    </span>
                    <span className="popover-action-text">Sign In / Sign Up</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modal Dialogs */}
      {modal === 'settings' && (
        <SettingsModal
          theme={theme}
          setTheme={setThemeState}
          uiScale={uiScale}
          setUiScale={setUiScaleState}
          motion={motion}
          setMotion={setMotionState}
          onClose={() => setModal(null)}
          onReset={handleResetSettings}
        />
      )}

      {modal === 'profile' && <ProfileModal onClose={() => setModal(null)} />}
      {modal === 'terms' && <TermsModal onClose={() => setModal(null)} />}
      {modal === 'auth' && <AuthModal onClose={() => setModal(null)} />}
    </>
  );
}
