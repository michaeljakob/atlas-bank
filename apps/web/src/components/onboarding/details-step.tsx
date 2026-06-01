'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { SUPPORTED_COUNTRIES } from '@atlas-bank/shared';

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
      onComplete(result.kycUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-atlas-border p-8 shadow-sm">
      <h1 className="text-2xl font-medium text-center mb-2">Your details</h1>
      <p className="text-atlas-text-secondary text-center mb-8">
        We need a few details to open your account.
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
          <label className="block text-sm font-medium text-atlas-text-secondary">Nationality</label>
          <select
            value={form.nationality}
            onChange={(e) => update('nationality', e.target.value)}
            className="w-full rounded-xl border border-atlas-border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-atlas-accent"
            required
          >
            <option value="">Select country</option>
            {SUPPORTED_COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-atlas-text-secondary">Country of residence</label>
          <select
            value={form.residenceCountry}
            onChange={(e) => update('residenceCountry', e.target.value)}
            className="w-full rounded-xl border border-atlas-border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-atlas-accent"
            required
          >
            <option value="">Select country</option>
            {SUPPORTED_COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="border-t border-atlas-border pt-4 mt-4">
          <p className="text-sm font-medium text-atlas-text-secondary mb-3">Residence address</p>
          <div className="space-y-3">
            <Input label="Address line 1" value={form.line1} onChange={(e) => update('line1', e.target.value)} required />
            <Input label="Address line 2 (optional)" value={form.line2} onChange={(e) => update('line2', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={form.city} onChange={(e) => update('city', e.target.value)} required />
              <Input label="Postal code" value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} required />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-atlas-error">{error}</p>}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Continue to verification
        </Button>
      </form>
    </div>
  );
}
