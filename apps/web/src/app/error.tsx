'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the browser console; picked up by Sentry's global handler if present.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-auriga-error/10">
        <svg className="h-8 w-8 text-auriga-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-auriga-text-primary sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-base text-auriga-text-secondary">
        We hit an unexpected error. Your money and data are safe — please try again.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-auriga-text-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-auriga-text-primary/90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-auriga-border px-6 py-3 text-sm font-medium text-auriga-text-primary transition-colors hover:bg-auriga-bg-subtle"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
