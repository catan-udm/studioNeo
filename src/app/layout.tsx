import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Azure Cloud Studio - Auth & Asset Management',
  description: 'Enterprise passwordless authentication and secure Azure Blob Storage asset delivery.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <nav className="container nav-container" aria-label="Main Navigation">
            <a href="/" className="brand-logo">
              Cloud<span>Studio</span>
            </a>
            <ul className="nav-links">
              <li>
                <a href="/">Dashboard</a>
              </li>
              <li>
                <a href="/login">Login</a>
              </li>
              <li>
                <a href="/register" className="btn btn-secondary">
                  Register
                </a>
              </li>
            </ul>
          </nav>
        </header>
        <div className="page-wrapper">{children}</div>
      </body>
    </html>
  );
}
