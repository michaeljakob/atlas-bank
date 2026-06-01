'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface Props {
  kycUrl: string;
  onComplete: (
    account: { iban: string; bic: string; holderName: string },
    card: { last4: string; type: string }
  ) => void;
}

export function KycStep({ kycUrl, onComplete }: Props) {
  const [status, setStatus] = useState<'verifying' | 'verified' | 'failed'>('verifying');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await api.getOnboardingStatus();
        if (result.status === 'kyc_verified') {
          setStatus('verified');
          clearInterval(interval);
        } else if (result.status === 'kyc_rejected') {
          setStatus('failed');
          clearInterval(interval);
        }
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  async function handleComplete() {
    setLoading(true);
    try {
      const result = await api.completeOnboarding();
      onComplete(result.account, result.card);
    } catch {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === 'verified') {
      handleComplete();
    }
  }, [status]);

  return (
    <div className="bg-white rounded-2xl border border-atlas-border p-8 shadow-sm text-center">
      <h1 className="text-2xl font-medium mb-2">Verify your identity</h1>

      {status === 'verifying' && (
        <>
          <p className="text-atlas-text-secondary mb-8">
            Complete the identity verification to activate your account.
          </p>

          <div className="mb-8 p-6 bg-atlas-bg-subtle rounded-xl">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-atlas-accent/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-atlas-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-atlas-text-secondary">
              You&apos;ll need your ID document (passport or national ID) and to take a quick selfie.
            </p>
          </div>

          <Button size="lg" className="w-full mb-4" onClick={() => window.open(kycUrl, '_blank')}>
            Start verification
          </Button>

          <div className="flex items-center gap-2 justify-center text-xs text-atlas-text-secondary">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Waiting for verification to complete...
          </div>
        </>
      )}

      {status === 'verified' && (
        <>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-atlas-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-atlas-text-secondary mb-4">Identity verified! Setting up your account...</p>
          {loading && (
            <div className="flex items-center gap-2 justify-center text-sm text-atlas-text-secondary">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating your IBAN and card...
            </div>
          )}
        </>
      )}

      {status === 'failed' && (
        <>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-atlas-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-atlas-text-secondary">
            Verification was not successful. Please contact support for assistance.
          </p>
        </>
      )}
    </div>
  );
}
