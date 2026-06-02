'use client';

import { useEffect } from 'react';

// Catches errors thrown in the root layout itself. Must render its own
// <html>/<body> because it replaces the root layout when it triggers.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          padding: '0 1.5rem',
          color: '#1C180D',
        }}
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ marginTop: '0.75rem', color: '#8A8783', maxWidth: '28rem' }}>
          We hit an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '2rem',
            borderRadius: '9999px',
            background: '#1C180D',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
