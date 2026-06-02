'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'atlas_cookie_consent';

type Consent = 'accepted' | 'rejected';

export function setCookieConsent(value: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {}
}

export function getCookieConsent(): Consent | null {
  try {
    return localStorage.getItem(STORAGE_KEY) as Consent | null;
  } catch {
    return null;
  }
}

/**
 * GDPR/ePrivacy cookie consent banner. Non-essential analytics must only load
 * after explicit consent (see analytics.tsx, which reads this value).
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) setVisible(true);
  }, []);

  function choose(value: Consent) {
    setCookieConsent(value);
    setVisible(false);
    // Let analytics react to a fresh acceptance without a reload.
    window.dispatchEvent(new CustomEvent('atlas:cookie-consent', { detail: value }));
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 inset-x-4 z-[100] sm:left-auto sm:right-4 sm:max-w-md rounded-2xl border border-atlas-border bg-white shadow-lg p-5"
    >
      <p className="text-sm font-medium text-atlas-text-primary mb-1">We value your privacy</p>
      <p className="text-xs text-atlas-text-secondary leading-relaxed mb-4">
        We use essential cookies to run Atlas and, with your consent, analytics cookies to improve
        the product. Read our{' '}
        <Link href="/privacy" className="underline text-atlas-text-primary">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => choose('rejected')}
          className="flex-1 px-4 py-2 rounded-xl text-sm font-medium border border-atlas-border text-atlas-text-secondary hover:text-atlas-text-primary transition-colors"
        >
          Reject non-essential
        </button>
        <button
          onClick={() => choose('accepted')}
          className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-atlas-accent text-atlas-black hover:opacity-90 transition-opacity"
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
