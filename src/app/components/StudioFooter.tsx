import React from 'react';
import Link from 'next/link';

interface StudioFooterProps {
  className: string;
  showBrandBlock?: boolean;
  contactLabel?: string;
}

export default function StudioFooter({
  className,
  showBrandBlock = false,
  contactLabel = 'Contact Studio',
}: StudioFooterProps) {
  return (
    <footer className={className}>
      {showBrandBlock && (
        <div className="footer-top-row">
          <div className="footer-brand-block">
            <h2>studioNeo DIGITAL HERITAGE LAB</h2>
            <p>Kinetic artifice, architectural minimalism, and preserved animation cels.</p>
          </div>
          <div className="footer-coordinates">
            35.6764° N, 139.6500° E TOKYO / DISTRIBUTED
          </div>
        </div>
      )}

      <div className="footer-links-row">
        <Link href="/gallery" className="footer-link">Archive Index</Link>
        <Link href="/collection" className="footer-link">Saved Collection</Link>
        <Link href="/about" className="footer-link">Curatorial Statement</Link>
        <Link href="/licensing" className="footer-link">Content Rights</Link>
        <Link href="/projects" className="footer-link">Projects &amp; Cuts</Link>
        <Link href="/terms" className="footer-link">Terms of Service</Link>
        <Link href="/privacy" className="footer-link">Privacy Policy</Link>
        <Link href="/contact" className="footer-link">{contactLabel}</Link>
      </div>

      <div className="footer-bottom-copy">
        <span>&copy; <time dateTime="2026">2026</time> studioNeo Archive. All curation rights preserved.</span>
        <span>studioNeo visual engineering</span>
      </div>
    </footer>
  );
}
