'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { track, AnalyticsEvent } from '@/lib/analytics';

interface Props {
  onComplete: (email: string) => void;
}

export function EmailStep({ onComplete }: Props) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!consent) {
      setError('Please accept the Terms and Privacy Policy to continue.');
      return;
    }
    setLoading(true);

    try {
      await api.sendOtp(email);
      track(AnalyticsEvent.SignupStarted);
      onComplete(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-auriga-border p-8 shadow-sm">
      <h1 className="text-2xl font-medium text-center mb-2">Open your free account</h1>
      <p className="text-auriga-text-secondary text-center mb-6">
        Just your email to start — your EUR account and card are ready in about 2 minutes.
      </p>

      <div className="flex items-center justify-center gap-2 mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-auriga-bg-subtle px-3 py-1.5 text-xs font-medium text-auriga-text-secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          No password to create or forget — we email you a code
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email address"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          required
          autoFocus
        />
        <label className="flex items-start gap-2.5 text-left cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-auriga-border text-auriga-accent focus:ring-auriga-accent"
          />
          <span className="text-xs text-auriga-text-secondary leading-relaxed">
            I agree to the{' '}
            <Link href="/terms" target="_blank" className="text-auriga-text-primary font-medium underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" target="_blank" className="text-auriga-text-primary font-medium underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        <Button type="submit" className="w-full" size="lg" loading={loading} disabled={!consent}>
          {loading ? 'Sending your code…' : 'Email me a code'}
        </Button>
        <p className="text-center text-xs text-auriga-text-secondary">
          Free to open · No monthly fees · Cancel anytime
        </p>
      </form>
    </div>
  );
}
