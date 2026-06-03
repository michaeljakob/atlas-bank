import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found — Auriga Money',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-auriga-text-secondary">
        Error 404
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-auriga-text-primary sm:text-5xl">
        This page took a wrong turn
      </h1>
      <p className="mt-4 max-w-md text-base text-auriga-text-secondary">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved. Let&rsquo;s get you
        back on track.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-auriga-text-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-auriga-text-primary/90"
        >
          Back to home
        </Link>
        <Link
          href="/app/dashboard"
          className="rounded-full border border-auriga-border px-6 py-3 text-sm font-medium text-auriga-text-primary transition-colors hover:bg-auriga-bg-subtle"
        >
          Go to your account
        </Link>
      </div>
    </main>
  );
}
