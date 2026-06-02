'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isValidIban, formatMoney } from '@atlas-bank/shared';
import { api } from '@/lib/api';
import { track, AnalyticsEvent } from '@/lib/analytics';
import { toast } from 'sonner';
import { clsx } from 'clsx';

type SendStep = 'form' | 'confirm';

const SPRING = 'duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]';

const AVATAR_COLORS = [
  'bg-atlas-green-50 text-atlas-green-700',
  'bg-atlas-accent-50 text-atlas-accent-700',
  'bg-atlas-heather-100 text-atlas-heather-600',
  'bg-atlas-green-100 text-atlas-green-800',
  'bg-atlas-heather-200 text-atlas-text-primary',
  'bg-atlas-green-50 text-atlas-black',
];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function getColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const fallbackRecipients = [
  { id: '1', name: 'Sarah Miller', iban: 'DE89370400440532013000' },
  { id: '2', name: 'Acme Corp', iban: 'GB29NWBK60161331926819' },
  { id: '3', name: 'Carlos R.', iban: 'ES9121000418450200051332' },
  { id: '4', name: 'Marie D.', iban: 'FR7630006000011234567890189' },
];

export default function SendPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<SendStep>('form');
  const [form, setForm] = useState({
    creditorIban: searchParams.get('iban') || '',
    creditorName: searchParams.get('name') || '',
    amount: searchParams.get('amount') || '',
    reference: '',
    instant: true,
  });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [recentRecipients, setRecentRecipients] = useState(fallbackRecipients);
  const [balance, setBalance] = useState(245000);
  const [handle, setHandle] = useState('');
  const [resolvingHandle, setResolvingHandle] = useState(false);
  const [resolvedHandle, setResolvedHandle] = useState<string | null>(null);

  useEffect(() => {
    api.getRecipients().then(r => {
      if (r.length > 0) setRecentRecipients(r.slice(0, 4));
    }).catch(() => {});
    api.getAccount().then(a => {
      setBalance(a.balance.amount);
    }).catch(() => {});
  }, []);

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function resolveByHandle() {
    const h = handle.trim().replace(/^@+/, '');
    if (!h) return;
    setResolvingHandle(true);
    setError('');
    try {
      const r = await api.resolveHandle(h);
      setForm((f) => ({ ...f, creditorName: r.name, creditorIban: r.iban }));
      setResolvedHandle(r.handle);
      toast.success(`Found @${r.handle}`);
    } catch (err) {
      setResolvedHandle(null);
      toast.error(err instanceof Error ? err.message : 'Handle not found');
    } finally {
      setResolvingHandle(false);
    }
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

  async function handleSend() {
    setSending(true);
    try {
      const amountCents = Math.round(parseFloat(form.amount) * 100);
      const result = await api.initiateTransfer({
        creditorIban: form.creditorIban,
        creditorName: form.creditorName,
        amountCents,
        reference: form.reference || undefined,
        instant: form.instant,
      });
      track(AnalyticsEvent.TransferInitiated, { instant: form.instant });
      api.createRecipient({ name: form.creditorName, iban: form.creditorIban }).catch(() => {});

      const activeTransfers = JSON.parse(localStorage.getItem('atlas_active_transfers') || '[]');
      activeTransfers.unshift({
        id: result.paymentId,
        creditorName: form.creditorName,
        amountCents,
        status: 'initiated',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('atlas_active_transfers', JSON.stringify(activeTransfers.slice(0, 10)));

      router.push(`/app/transfer/${result.paymentId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Transfer failed');
      setSending(false);
    }
  }

  const amountCents = Math.round(parseFloat(form.amount || '0') * 100);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-lg mx-auto">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-8">
        Send money
      </h1>

      {step === 'form' && (
        <form onSubmit={handleReview} className="space-y-5 animate-fade-in">
          {/* Amount card */}
          <div className="bg-white rounded-2xl border border-atlas-border/70 p-5">
            <p className="text-[13px] font-medium uppercase tracking-wider text-atlas-text-secondary mb-3">
              Amount
            </p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-semibold text-atlas-text-primary/25 select-none">€</span>
              <input
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => update('amount', e.target.value)}
                required
                className="flex-1 text-3xl font-semibold bg-transparent focus:outline-none placeholder:text-atlas-text-secondary/20 min-w-0"
              />
            </div>
            <p className="text-xs text-atlas-text-secondary mt-3">
              Available: {formatMoney(balance)}
            </p>
          </div>

          {/* Recent recipients */}
          <div className="flex items-center gap-4 overflow-x-auto pb-1 -mx-1 px-1">
            {recentRecipients.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => { update('creditorName', r.name); if ('iban' in r && r.iban) update('creditorIban', r.iban); }}
                className="flex flex-col items-center gap-1.5 group flex-shrink-0"
              >
                <div
                  className={clsx(
                    `w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-semibold transition-transform ${SPRING} group-hover:scale-110`,
                    getColor(r.name),
                  )}
                >
                  {getInitials(r.name)}
                </div>
                <span className={`text-[11px] text-atlas-text-secondary group-hover:text-atlas-text-primary transition-colors ${SPRING} whitespace-nowrap`}>
                  {r.name.split(' ')[0]}
                </span>
              </button>
            ))}
            <button type="button" className="flex flex-col items-center gap-1.5 group flex-shrink-0">
              <div className={`w-10 h-10 rounded-full border-[1.5px] border-dashed border-atlas-border flex items-center justify-center group-hover:border-atlas-accent transition-colors ${SPRING}`}>
                <svg className={`w-3.5 h-3.5 text-atlas-text-secondary group-hover:text-atlas-accent transition-colors ${SPRING}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-[11px] text-atlas-text-secondary whitespace-nowrap">New</span>
            </button>
          </div>

          {/* Recipient card */}
          <div className="bg-white rounded-2xl border border-atlas-border/70 p-5">
            <p className="text-[13px] font-medium uppercase tracking-wider text-atlas-text-secondary mb-4">
              Recipient
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-atlas-text-secondary mb-1.5">
                  Pay an Atlas user by @handle
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-atlas-text-secondary/70">@</span>
                    <input
                      type="text"
                      placeholder="handle"
                      value={handle}
                      onChange={(e) => { setHandle(e.target.value); setResolvedHandle(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); resolveByHandle(); } }}
                      className="w-full h-11 rounded-xl border border-atlas-border/70 bg-white pl-7 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-atlas-accent/20 focus:border-atlas-accent/40"
                    />
                  </div>
                  <Button type="button" variant="secondary" onClick={resolveByHandle} loading={resolvingHandle} disabled={!handle.trim()}>
                    Look up
                  </Button>
                </div>
                {resolvedHandle && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-atlas-success">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Sending to @{resolvedHandle} — details filled in below
                  </p>
                )}
              </div>
              <Input
                label="Name"
                placeholder="John Doe"
                value={form.creditorName}
                onChange={(e) => update('creditorName', e.target.value)}
                required
              />
              <Input
                label="IBAN"
                placeholder="DE89 3704 0044 0532 0130 00"
                value={form.creditorIban}
                onChange={(e) => update('creditorIban', e.target.value)}
                required
              />
              <Input
                label="Reference (optional)"
                placeholder="What's it for?"
                value={form.reference}
                onChange={(e) => update('reference', e.target.value)}
              />
            </div>
          </div>

          {/* Transfer info */}
          <div className={`bg-atlas-bg-subtle/50 rounded-xl px-5 py-4 space-y-2 transition-all ${SPRING}`}>
            <div className="flex justify-between text-sm">
              <span className="text-atlas-text-secondary">Speed</span>
              <span className="font-medium flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-atlas-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                Instant
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-atlas-text-secondary">Fee</span>
              <span className="font-medium text-atlas-success">Free</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-atlas-error/10 text-atlas-error">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* CTA */}
          <Button type="submit" className="w-full" size="lg">
            Review transfer
          </Button>
        </form>
      )}

      {step === 'confirm' && (
        <div className="bg-white rounded-2xl border border-atlas-border/70 overflow-hidden animate-fade-in">
          <div className="px-8 py-10 text-center">
            <p className="text-sm text-atlas-text-secondary mb-1">Sending</p>
            <p className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {formatMoney(amountCents)}
            </p>
            <p className="text-lg text-atlas-text-secondary mt-2">
              to {form.creditorName}
            </p>
          </div>

          <div className="mx-6 border-t border-atlas-border/50" />

          <div className="px-6 py-5 space-y-0">
            <ConfirmRow label="Recipient" value={form.creditorName} />
            <ConfirmRow label="IBAN" value={form.creditorIban} mono />
            <ConfirmRow label="Amount" value={formatMoney(amountCents)} />
            {form.reference && <ConfirmRow label="Reference" value={form.reference} />}
            <ConfirmRow label="Speed" value="Instant" />
            <ConfirmRow label="Fee" value="Free" highlight />
          </div>

          <div className="mx-6 border-t border-atlas-border/50" />

          <div className="p-6 pt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setStep('form')}>
              Edit
            </Button>
            <Button className="flex-1" onClick={handleSend} loading={sending}>
              Send {formatMoney(amountCents)}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-atlas-border/40 last:border-0">
      <span className="text-sm text-atlas-text-secondary">{label}</span>
      <span className={clsx(
        'text-sm font-medium',
        highlight && 'text-atlas-success',
        mono && 'font-mono text-xs tracking-wide',
        !highlight && !mono && 'text-atlas-text-primary',
      )}>{value}</span>
    </div>
  );
}
