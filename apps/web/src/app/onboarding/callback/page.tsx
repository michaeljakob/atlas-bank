'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { SuccessStep } from '@/components/onboarding/success-step';
import { api } from '@/lib/api';

type Phase = 'checking' | 'verifying' | 'completing' | 'done' | 'failed' | 'no-session';

interface Result {
  account: { iban: string; bic: string; holderName: string };
  card: { last4: string; type: string };
}

/**
 * Swan redirects identity-verification completions to this route. We resume the
 * funnel by polling onboarding status; once KYC is verified we provision the
 * account/card and show the success step (with @handle claim) inline, so the
 * in-memory wizard state being lost on redirect doesn't strand the user.
 */
export default function OnboardingCallbackPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('checking');
  const [result, setResult] = useState<Result | null>(null);
  const completing = useRef(false);

  useEffect(() => {
    let active = true;

    async function complete() {
      if (completing.current) return;
      completing.current = true;
      setPhase('completing');
      try {
        const res = await api.completeOnboarding();
        if (!active) return;
        setResult(res);
        setPhase('done');
      } catch {
        if (active) setPhase('verifying');
        completing.current = false;
      }
    }

    async function poll() {
      try {
        const status = await api.getOnboardingStatus();
        if (!active) return;
        switch (status.status) {
          case 'kyc_verified':
            await complete();
            break;
          case 'completed':
            router.replace('/app/dashboard');
            break;
          case 'kyc_rejected':
            setPhase('failed');
            break;
          default:
            setPhase('verifying');
        }
      } catch {
        if (active) setPhase('no-session');
      }
    }

    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [router]);

  if (phase === 'done' && result) {
    return (
      <div className="min-h-screen bg-atlas-bg-subtle">
        <Container className="py-12 sm:py-20 max-w-lg">
          <div className="flex items-center justify-center mb-10">
            <img src="/atlas-lockup.svg" alt="Atlas" className="h-9 w-auto" />
          </div>
          <SuccessStep account={result.account} card={result.card} />
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-atlas-bg-subtle flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-atlas-border p-8 shadow-sm text-center max-w-md w-full">
        <div className="flex items-center justify-center mb-8">
          <img src="/atlas-lockup.svg" alt="Atlas" className="h-8 w-auto" />
        </div>

        {(phase === 'checking' || phase === 'verifying' || phase === 'completing') && (
          <>
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-atlas-accent/15 flex items-center justify-center">
              <svg className="w-6 h-6 animate-spin text-atlas-text-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold mb-2">
              {phase === 'completing' ? 'Setting up your account' : 'Finishing verification'}
            </h1>
            <p className="text-sm text-atlas-text-secondary">
              {phase === 'completing'
                ? 'Creating your IBAN and virtual card…'
                : 'This usually takes a few moments. You can keep this page open.'}
            </p>
          </>
        )}

        {phase === 'failed' && (
          <>
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-atlas-error/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-atlas-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold mb-2">Verification unsuccessful</h1>
            <p className="text-sm text-atlas-text-secondary mb-6">
              We couldn&apos;t verify your identity. Please contact support and we&apos;ll help you finish setting up.
            </p>
            <Button variant="secondary" asChild>
              <Link href="/app/support">Contact support</Link>
            </Button>
          </>
        )}

        {phase === 'no-session' && (
          <>
            <h1 className="text-xl font-semibold mb-2">Pick up where you left off</h1>
            <p className="text-sm text-atlas-text-secondary mb-6">
              Log in to continue setting up your account.
            </p>
            <Button asChild>
              <Link href="/login?redirect=/onboarding/callback">Log in</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
