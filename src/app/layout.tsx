import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'bikko.studio',
  description: 'bikko.studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="page-wrapper">{children}</div>
      </body>
    </html>
  );
}
