'use client';

import { useEffect } from 'react';
import { initAnalytics } from '@/lib/analytics';

/** Initialises analytics once consent is granted (now or via the banner). */
export function AnalyticsProvider() {
  useEffect(() => {
    void initAnalytics();
    const onConsent = (e: Event) => {
      if ((e as CustomEvent).detail === 'accepted') void initAnalytics();
    };
    window.addEventListener('auriga:cookie-consent', onConsent);
    return () => window.removeEventListener('auriga:cookie-consent', onConsent);
  }, []);

  return null;
}
