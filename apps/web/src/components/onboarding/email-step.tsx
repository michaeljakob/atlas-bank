'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

interface Props {
  onComplete: (email: string) => void;
}

export function EmailStep({ onComplete }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.sendOtp(email);
      onComplete(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-atlas-border p-8 shadow-sm">
      <h1 className="text-2xl font-medium text-center mb-2">Open your account</h1>
      <p className="text-atlas-text-secondary text-center mb-8">
        Enter your email to get started. No password needed.
      </p>

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
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Continue
        </Button>
      </form>

      <p className="text-xs text-atlas-text-secondary text-center mt-6">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
