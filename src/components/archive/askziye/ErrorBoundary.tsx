import { Component, type ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(err: unknown) {
    console.error("ASK 画集 failed to render:", err);
  }

  render() {
    if (this.state.failed)
      return (
        <div className="grid min-h-screen place-items-center bg-[#f3ece1] px-6 text-center text-[#2a221b]">
          <div>
            <span className="seal mx-auto grid h-14 w-14 text-sm">画</span>
            <p className="mt-6 font-display text-3xl">这页墨洇开了 — this page smudged</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#5c5146]">
              Something failed to render. Reload to re-ink the page, or find the original plates at
              ASK's accounts.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => location.reload()}
                className="border border-[#2a221b]/25 bg-[#2a221b] px-5 py-3 text-[11px] tracking-[0.2em] text-[#f3ece1] uppercase hover:bg-[#b44738]"
              >
                Reload · 重新加载
              </button>
              <a
                href="https://x.com/askziye"
                target="_blank"
                rel="noreferrer"
                className="border border-[#2a221b]/25 px-5 py-3 text-[11px] tracking-[0.2em] uppercase hover:border-[#b44738] hover:text-[#b44738]"
              >
                @askziye ↗
              </a>
            </div>
          </div>
        </div>
      );
    return this.props.children;
  }
}
