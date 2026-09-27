import type { Metadata, Viewport } from 'next';
import { Poppins, Montserrat } from 'next/font/google';
import './globals.css';
import './nav.css';
import StudioNav from './components/StudioNav';
import { PageTransitionProvider, PageTransitionContent } from './components/PageTransition';
import { SettingsProvider } from './components/SettingsProvider';
import SettingsModal from './components/SettingsModal';
import ServiceWorkerRegister from './components/ServiceWorkerRegister';

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://bikko.studio'),
  title: {
    default: 'bikko.studio • Creative Code, Kinetic Motion & Next-Gen Identity',
    template: '%s • bikko.studio',
  },
  description:
    'Creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey authentication.',
  keywords: [
    'creative code',
    'algorithmic art',
    'kinetic motion',
    'generative cels',
    'SVG vector stems',
    'passkeys',
    'WebAuthn',
    'bikko studio',
    'FIDO2 authentication',
  ],
  authors: [{ name: 'studioNeo Atelier', url: 'https://bikko.studio/about' }],
  creator: 'bikko.studio',
  publisher: 'bikko.studio',
  category: 'Design & Technology',
  classification: 'Creative Technology & Digital Art',
  alternates: {
    canonical: 'https://bikko.studio',
    languages: {
      'en-US': 'https://bikko.studio',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bikko.studio',
    siteName: 'bikko.studio',
    title: 'bikko.studio • Creative Code & Kinetic Archive',
    description:
      'Algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkeys.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'bikko.studio • Creative Code & Kinetic Archive',
    description:
      'Algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkeys.',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
};

// Global Schema.org Structured Data (ISO 8601 timestamps, ISO 639-1 language, ISO 3166-1 country code)
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://bikko.studio/#organization',
      name: 'bikko.studio',
      alternateName: 'studioNeo Atelier',
      url: 'https://bikko.studio',
      logo: 'https://bikko.studio/icon.svg',
      description:
        'Creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey authentication.',
      foundingDate: '2026-01-01',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Shibuya',
        addressRegion: 'Tokyo',
        addressCountry: 'JP',
      },
      sameAs: [
        'https://github.com/bikkostudio',
        'https://twitter.com/bikkostudio',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://bikko.studio/#website',
      url: 'https://bikko.studio',
      name: 'bikko.studio',
      inLanguage: 'en-US',
      publisher: {
        '@id': 'https://bikko.studio/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://bikko.studio/gallery?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${montserrat.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('bikko_theme') || 'system';
                  var oledPref = localStorage.getItem('bikko_oled_mode') || 'auto';
                  var scale = localStorage.getItem('bikko_ui_scale');
                  var motion = localStorage.getItem('bikko_motion');
                  var root = document.documentElement;

                  var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  var resolved = isDark ? 'dark' : 'light';

                  var isHdr = window.matchMedia && window.matchMedia('(dynamic-range: high)').matches;
                  var isP3 = window.matchMedia && window.matchMedia('(color-gamut: p3)').matches;
                  var isOledDetected = !!(isHdr || isP3);
                  var isOled = oledPref === 'oled' || (oledPref === 'auto' && isOledDetected);

                  root.setAttribute('data-theme', resolved);
                  root.setAttribute('data-theme-setting', theme);
                  root.setAttribute('data-resolved-theme', resolved);
                  root.setAttribute('data-oled', isOled ? 'true' : 'false');
                  root.setAttribute('data-display', isOled ? 'oled' : 'neutral');

                  if (scale) root.setAttribute('data-scale', scale);
                  if (motion) root.setAttribute('data-motion', motion);
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://bikkostudio.blob.core.windows.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://bikkostudio.blob.core.windows.net" />
      </head>
      <body>
        {/* ISO/IEC 40500 / WCAG 2.4.1 Skip Link */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ServiceWorkerRegister />
        <SettingsProvider>
          <PageTransitionProvider>
            <StudioNav />
            <SettingsModal />
            <PageTransitionContent>
              <div className="page-wrapper">{children}</div>
            </PageTransitionContent>
          </PageTransitionProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
