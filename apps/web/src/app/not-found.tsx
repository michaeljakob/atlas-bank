import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found — Atlas Bank',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-atlas-text-secondary">
        Error 404
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-atlas-text-primary sm:text-5xl">
        This page took a wrong turn
      </h1>
      <p className="mt-4 max-w-md text-base text-atlas-text-secondary">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved. Let&rsquo;s get you
        back on track.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-atlas-text-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-atlas-text-primary/90"
        >
          Back to home
        </Link>
        <Link
          href="/app/dashboard"
          className="rounded-full border border-atlas-border px-6 py-3 text-sm font-medium text-atlas-text-primary transition-colors hover:bg-atlas-bg-subtle"
        >
          Go to your account
        </Link>
      </div>
    </main>
  );
}
