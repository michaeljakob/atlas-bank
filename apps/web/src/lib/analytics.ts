'use client';

import { getCookieConsent } from '@/components/cookie-consent';

/**
 * Lightweight analytics wrapper. Events are only sent after the user accepts
 * cookies and when a PostHog key is configured. Safe to call anywhere; it is a
 * no-op without consent/config, so funnel instrumentation never blocks UX.
 */
type Props = Record<string, unknown>;

let posthog: any = null;
let initialized = false;

function canTrack(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!process.env.NEXT_PUBLIC_POSTHOG_KEY &&
    getCookieConsent() === 'accepted'
  );
}

export async function initAnalytics(): Promise<void> {
  if (initialized || !canTrack()) return;
  initialized = true;
  try {
    const mod = await import('posthog-js');
    posthog = mod.default;
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
      capture_pageview: true,
      persistence: 'localStorage+cookie',
    });
  } catch {
    initialized = false;
  }
}

export function track(event: string, props?: Props): void {
  if (!canTrack()) return;
  if (!initialized) {
    void initAnalytics().then(() => posthog?.capture(event, props));
    return;
  }
  posthog?.capture(event, props);
}

/** Named funnel events used across onboarding and money movement. */
export const AnalyticsEvent = {
  SignupStarted: 'signup_started',
  OtpVerified: 'otp_verified',
  OnboardingDetailsSubmitted: 'onboarding_details_submitted',
  KycStarted: 'kyc_started',
  OnboardingCompleted: 'onboarding_completed',
  TransferInitiated: 'transfer_initiated',
  TopUpViewed: 'topup_viewed',
} as const;
