'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/container';
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
      const { token } = await api.verifyOtp(email, code);
      api.setToken(token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-atlas-bg-subtle flex items-center justify-center">
      <Container className="max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-atlas-dark-surface flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-medium text-lg">Atlas</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-atlas-border p-8 shadow-sm">
          {step === 'email' ? (
            <>
              <h1 className="text-2xl font-medium text-center mb-2">Welcome back</h1>
              <p className="text-atlas-text-secondary text-center mb-6">Enter your email to log in.</p>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <Input
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                {error && <p className="text-sm text-atlas-error">{error}</p>}
                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Continue
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-medium text-center mb-2">Enter code</h1>
              <p className="text-atlas-text-secondary text-center mb-6">
                We sent a code to {email}
              </p>
              <form onSubmit={handleVerify} className="space-y-4">
                <Input
                  label="Verification code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  required
                  autoFocus
                />
                {error && <p className="text-sm text-atlas-error">{error}</p>}
                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Log in
                </Button>
              </form>
              <button
                onClick={() => setStep('email')}
                className="text-sm text-atlas-text-secondary hover:text-atlas-text-primary mt-4 block mx-auto"
              >
                Use a different email
              </button>
            </>
          )}
        </div>

        <p className="text-center text-sm text-atlas-text-secondary mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/onboarding" className="text-atlas-text-primary font-medium hover:underline">
            Open one now
          </Link>
        </p>
      </Container>
    </div>
  );
}
