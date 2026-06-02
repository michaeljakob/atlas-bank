'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleDevLogin() {
    // In dev with SKIP_AUTH the middleware allows /app/* without a session.
    router.push('/app/dashboard');
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.sendOtp(email);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.verifyOtp(email, code);
      const params = new URLSearchParams(window.location.search);
      router.push((params.get('redirect') || '/app/dashboard') as Route);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-atlas-bg-subtle flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[26rem]">
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="flex items-center">
            <img src="/atlas-lockup.svg" alt="Atlas" className="h-10 w-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-atlas-border p-8 sm:p-10 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.18)]">
          {step === 'email' ? (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-center text-atlas-text-primary">Welcome back</h1>
              <p className="text-base text-atlas-text-secondary text-center mt-3 mb-8">
                Enter your email and we&apos;ll send you a secure login code.
              </p>
              <form onSubmit={handleSendOtp} className="space-y-5">
                <Input
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 text-base rounded-2xl"
                  required
                  autoFocus
                />
                {error && <p className="text-sm text-atlas-error">{error}</p>}
                <Button type="submit" className="w-full h-14 text-base rounded-full" size="lg" loading={loading}>
                  Continue
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-center text-atlas-text-primary">Enter your code</h1>
              <p className="text-base text-atlas-text-secondary text-center mt-3 mb-8">
                We sent a 6-digit code to <span className="font-semibold text-atlas-text-primary">{email}</span>
              </p>
              <form onSubmit={handleVerify} className="space-y-5">
                <Input
                  label="Verification code"
                  inputMode="numeric"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-14 text-center text-2xl font-bold tracking-[0.4em] rounded-2xl"
                  maxLength={6}
                  required
                  autoFocus
                />
                {error && <p className="text-sm text-atlas-error">{error}</p>}
                <Button type="submit" className="w-full h-14 text-base rounded-full" size="lg" loading={loading}>
                  Log in
                </Button>
              </form>
              <button
                onClick={() => setStep('email')}
                className="text-sm font-medium text-atlas-text-secondary hover:text-atlas-text-primary mt-6 block mx-auto"
              >
                Use a different email
              </button>
            </>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={handleDevLogin}
            className="mt-4 w-full py-3.5 text-sm font-medium text-atlas-text-secondary border border-dashed border-atlas-heather-200 rounded-2xl hover:bg-white hover:text-atlas-text-primary transition-colors"
          >
            Dev mode: skip login
          </button>
        )}

        <p className="text-center text-sm text-atlas-text-secondary mt-8">
          Don&apos;t have an account?{' '}
          <Link href="/onboarding" className="text-atlas-text-primary font-semibold hover:underline">
            Open one now
          </Link>
        </p>
      </div>
    </div>
  );
}
