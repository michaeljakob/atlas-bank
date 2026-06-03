'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CountrySelect } from '@/components/ui/country-select';
import { api } from '@/lib/api';
import { track, AnalyticsEvent } from '@/lib/analytics';
import { SUPPORTED_COUNTRIES } from '@auriga-money/shared';

interface Props {
  onComplete: (kycUrl: string) => void;
}

export function DetailsStep({ onComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    residenceCountry: '',
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.startOnboarding({
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        nationality: form.nationality,
        residenceCountry: form.residenceCountry,
        residenceAddress: {
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          postalCode: form.postalCode,
          country: form.residenceCountry,
        },
      });
      track(AnalyticsEvent.OnboardingDetailsSubmitted);
      track(AnalyticsEvent.KycStarted);
      onComplete(result.kycUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-auriga-border p-8 shadow-sm">
      <h1 className="text-2xl font-medium text-center mb-2">Tell us about you</h1>
      <p className="text-auriga-text-secondary text-center mb-8">
        A few quick details so your account is legally yours. This is the longest step — almost there.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First name" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
          <Input label="Last name" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required />
        </div>

        <Input
          type="date"
          label="Date of birth"
          value={form.dateOfBirth}
          onChange={(e) => update('dateOfBirth', e.target.value)}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-auriga-text-secondary">Nationality</label>
          <CountrySelect
            value={form.nationality}
            onChange={(code) => update('nationality', code)}
            options={SUPPORTED_COUNTRIES}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-auriga-text-secondary">Country of residence</label>
          <CountrySelect
            value={form.residenceCountry}
            onChange={(code) => update('residenceCountry', code)}
            options={SUPPORTED_COUNTRIES}
          />
        </div>

        <div className="border-t border-auriga-border pt-4 mt-4">
          <p className="text-sm font-medium text-auriga-text-secondary mb-3">Residence address</p>
          <div className="space-y-3">
            <Input label="Address line 1" value={form.line1} onChange={(e) => update('line1', e.target.value)} required />
            <Input label="Address line 2 (optional)" value={form.line2} onChange={(e) => update('line2', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={form.city} onChange={(e) => update('city', e.target.value)} required />
              <Input label="Postal code" value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} required />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-auriga-error">{error}</p>}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          {loading ? 'Saving your details…' : 'Continue to ID check'}
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-auriga-text-secondary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Encrypted and only used to verify your identity
        </p>
      </form>
    </div>
  );
}
