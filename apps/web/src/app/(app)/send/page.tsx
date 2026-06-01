'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isValidIban, formatMoney } from '@atlas-bank/shared';

type SendStep = 'form' | 'confirm' | 'success';

export default function SendPage() {
  const [step, setStep] = useState<SendStep>('form');
  const [form, setForm] = useState({
    creditorIban: '',
    creditorName: '',
    amount: '',
    reference: '',
    instant: false,
  });
  const [error, setError] = useState('');

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!isValidIban(form.creditorIban)) {
      setError('Please enter a valid IBAN');
      return;
    }

    const amountCents = Math.round(parseFloat(form.amount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setStep('confirm');
  }

  function handleSend() {
    setStep('success');
  }

  const amountCents = Math.round(parseFloat(form.amount || '0') * 100);

  return (
    <div className="p-6 sm:p-10 max-w-lg">
      <h1 className="text-2xl font-medium mb-8">Send money</h1>

      {step === 'form' && (
        <form onSubmit={handleReview} className="bg-white rounded-2xl border border-atlas-border p-6 space-y-4">
          <Input
            label="Recipient IBAN"
            placeholder="DE89 3704 0044 0532 0130 00"
            value={form.creditorIban}
            onChange={(e) => update('creditorIban', e.target.value)}
            required
          />
          <Input
            label="Recipient name"
            placeholder="John Doe"
            value={form.creditorName}
            onChange={(e) => update('creditorName', e.target.value)}
            required
          />
          <Input
            type="number"
            label="Amount (EUR)"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) => update('amount', e.target.value)}
            required
          />
          <Input
            label="Reference (optional)"
            placeholder="Invoice #1234"
            value={form.reference}
            onChange={(e) => update('reference', e.target.value)}
          />

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="instant"
              checked={form.instant}
              onChange={(e) => update('instant', e.target.checked)}
              className="w-4 h-4 rounded border-atlas-border text-atlas-accent focus:ring-atlas-accent"
            />
            <label htmlFor="instant" className="text-sm text-atlas-text-secondary">
              Send as SEPA Instant (arrives in seconds)
            </label>
          </div>

          {error && <p className="text-sm text-atlas-error">{error}</p>}

          <Button type="submit" className="w-full" size="lg">
            Review transfer
          </Button>
        </form>
      )}

      {step === 'confirm' && (
        <div className="bg-white rounded-2xl border border-atlas-border p-6">
          <h2 className="text-lg font-medium mb-6">Confirm transfer</h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-2 border-b border-atlas-border">
              <span className="text-sm text-atlas-text-secondary">To</span>
              <span className="text-sm font-medium">{form.creditorName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-atlas-border">
              <span className="text-sm text-atlas-text-secondary">IBAN</span>
              <span className="text-sm font-mono">{form.creditorIban.slice(0, 4)}...{form.creditorIban.slice(-4)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-atlas-border">
              <span className="text-sm text-atlas-text-secondary">Amount</span>
              <span className="text-sm font-medium">{formatMoney(amountCents)}</span>
            </div>
            {form.reference && (
              <div className="flex justify-between py-2 border-b border-atlas-border">
                <span className="text-sm text-atlas-text-secondary">Reference</span>
                <span className="text-sm">{form.reference}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-sm text-atlas-text-secondary">Speed</span>
              <span className="text-sm">{form.instant ? 'Instant (seconds)' : 'Standard (1 business day)'}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setStep('form')}>
              Edit
            </Button>
            <Button className="flex-1" onClick={handleSend}>
              Send {formatMoney(amountCents)}
            </Button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="bg-white rounded-2xl border border-atlas-border p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-atlas-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">Transfer initiated</h2>
          <p className="text-sm text-atlas-text-secondary mb-6">
            {formatMoney(amountCents)} is on its way to {form.creditorName}.
            {form.instant ? ' It should arrive within seconds.' : ' It should arrive within 1 business day.'}
          </p>
          <Button variant="secondary" onClick={() => { setStep('form'); setForm({ creditorIban: '', creditorName: '', amount: '', reference: '', instant: false }); }}>
            Send another
          </Button>
        </div>
      )}
    </div>
  );
}
