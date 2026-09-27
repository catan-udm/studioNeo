import React from 'react';
import Link from 'next/link';
import BikkoMark from './components/BikkoMark';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        backgroundColor: '#fafafa',
        fontFamily: "var(--font-body), 'Montserrat', sans-serif",
      }}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <BikkoMark width={60} height={52} color="#000000" />
      </div>

      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(0, 0, 0, 0.45)',
          marginBottom: '0.75rem',
        }}
      >
        INDEX ERROR 404 • UNRESOLVED COORDINATE
      </span>

      <h1
        style={{
          fontFamily: "var(--font-heading), 'Poppins', sans-serif",
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 700,
          letterSpacing: '-1px',
          margin: '0 0 1rem',
          color: '#000000',
        }}
      >
        Archive Cel Not Found
      </h1>

      <p
        style={{
          fontSize: '1.05rem',
          lineHeight: 1.6,
          color: 'rgba(0, 0, 0, 0.6)',
          maxWidth: '520px',
          margin: '0 auto 2.5rem',
        }}
      >
        The requested digital cel or catalog coordinate does not exist in the studioNeo archive. It may have been archived into a private vault or decommissioned.
      </p>

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#000000',
            color: '#ffffff',
            padding: '10px 24px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Return to Studio
        </Link>
        <Link
          href="/gallery"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '1px solid rgba(0, 0, 0, 0.15)',
            padding: '10px 24px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Explore Gallery (128 Works)
        </Link>
        <Link
          href="/projects"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '1px solid rgba(0, 0, 0, 0.15)',
            padding: '10px 24px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          View Projects
        </Link>
      </div>
    </main>
  );
}
