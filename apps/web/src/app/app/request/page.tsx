'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CurrencySelect, CURRENCIES } from '@/components/ui/currency-select';
import { formatMoney } from '@atlas-bank/shared';
import { clsx } from 'clsx';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type Tab = 'create' | 'history';
type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF';

interface PaymentRequest {
  id: string;
  amountCents: number;
  currency: string;
  recipientEmail?: string;
  note?: string;
  status: string;
  token: string;
  expiresAt?: string;
  paidAt?: string;
  paidByName?: string;
  createdAt: string;
}

const SPRING = 'duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]';

const REQUEST_CURRENCIES = CURRENCIES.filter((c) =>
  ['EUR', 'USD', 'GBP', 'CHF'].includes(c.code),
);

const STATUS_CONFIG: Record<string, { label: string; variant: 'warning' | 'success' | 'default' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  paid: { label: 'Paid', variant: 'success' },
  expired: { label: 'Expired', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'default' },
};

export default function RequestPage() {
  const [tab, setTab] = useState<Tab>('create');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [note, setNote] = useState('');
  const [creating, setCreating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const data = await api.getPaymentRequests();
      setRequests(data);
    } catch {
      toast.error('Failed to load payment requests');
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setCreating(true);
    try {
      const result = await api.createPaymentRequest({
        amountCents,
        currency,
        recipientEmail: recipientEmail || undefined,
        note: note || undefined,
      });
      const link = `${window.location.origin}/pay/${result.token}`;
      setGeneratedLink(link);
      toast.success('Payment request created');
      fetchRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create request');
    } finally {
      setCreating(false);
    }
  }

  async function handleCancel(id: string) {
    setCancellingId(id);
    try {
      await api.cancelPaymentRequest(id);
      toast.success('Request cancelled');
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel request');
    } finally {
      setCancellingId(null);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  function handleNewRequest() {
    setAmount('');
    setRecipientEmail('');
    setNote('');
    setGeneratedLink('');
    setCopied(false);
  }

  const currencySymbol = REQUEST_CURRENCIES.find((c) => c.code === currency)?.symbol ?? '€';

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-lg mx-auto">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-8">
        Request money
      </h1>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-atlas-bg-subtle mb-6">
        {(['create', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              `flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${SPRING}`,
              tab === t
                ? 'bg-white text-atlas-text-primary shadow-sm'
                : 'text-atlas-text-secondary hover:text-atlas-text-primary',
            )}
          >
            {t === 'create' ? 'Create' : 'History'}
          </button>
        ))}
      </div>

      {/* ── Create tab ───────────────────────────────── */}
      {tab === 'create' && !generatedLink && (
        <form onSubmit={handleCreate} className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-2xl border border-atlas-border/70 p-6 space-y-5">
            {/* Amount */}
            <div>
              <label className="text-[13px] font-medium uppercase tracking-wider text-atlas-text-secondary mb-2 block">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-semibold text-atlas-text-primary/40 pointer-events-none select-none">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 text-3xl font-semibold rounded-xl border border-atlas-border/60 bg-atlas-bg-subtle/30 focus:outline-none focus:ring-2 focus:ring-atlas-accent/20 focus:border-atlas-accent/40 transition-all placeholder:text-atlas-text-secondary/20"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <p className="text-[13px] font-medium uppercase tracking-wider text-atlas-text-secondary mb-3">
                Currency
              </p>
              <CurrencySelect
                value={currency}
                onChange={(v) => setCurrency(v as Currency)}
                currencies={REQUEST_CURRENCIES}
                align="start"
              />
            </div>

            <Input
              label="Recipient email (optional)"
              type="email"
              placeholder="name@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />

            <Input
              label="Note (optional)"
              placeholder="What's it for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <Button type="submit" className="w-full" size="lg" loading={creating}>
              Create request
            </Button>
          </div>
        </form>
      )}

      {/* ── Success / link view ──────────────────────── */}
      {tab === 'create' && generatedLink && (
        <div className="bg-white rounded-2xl border border-atlas-border/70 px-6 py-10 text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-atlas-accent-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-atlas-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-1">Request created</h2>
            <p className="text-sm text-atlas-text-secondary max-w-xs mx-auto leading-relaxed">
              Share this link with anyone to receive{' '}
              <span className="font-medium text-atlas-text-primary">
                {formatMoney(Math.round(parseFloat(amount) * 100), currency)}
              </span>
            </p>
          </div>

          {/* Link display */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-atlas-bg-subtle border border-atlas-border/50">
            <p className="flex-1 text-sm font-mono text-atlas-text-secondary truncate text-left">
              {generatedLink}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopyLink}
              className="flex-shrink-0"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Share options */}
          <div className="flex gap-3 justify-center">
            <a
              href={`mailto:${recipientEmail}?subject=Payment%20request&body=Hey!%20Here%27s%20my%20payment%20link%3A%20${encodeURIComponent(generatedLink)}`}
              className={clsx(
                `inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-atlas-border/70 text-sm font-medium text-atlas-text-secondary hover:text-atlas-text-primary hover:border-atlas-text-secondary/30 transition-all ${SPRING}`,
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Email
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Here's my payment link: ${generatedLink}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                `inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-atlas-border/70 text-sm font-medium text-atlas-text-secondary hover:text-atlas-text-primary hover:border-atlas-text-secondary/30 transition-all ${SPRING}`,
              )}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>

          <Button variant="secondary" className="w-full" onClick={handleNewRequest}>
            Create another request
          </Button>
        </div>
      )}

      {/* ── History tab ──────────────────────────────── */}
      {tab === 'history' && (
        <div className="space-y-3 animate-fade-in">
          {loadingRequests && (
            <div className="bg-white rounded-2xl border border-atlas-border/70 p-12 text-center">
              <svg className="animate-spin h-6 w-6 mx-auto text-atlas-text-secondary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-atlas-text-secondary mt-3">Loading requests…</p>
            </div>
          )}

          {!loadingRequests && requests.length === 0 && (
            <div className="bg-white rounded-2xl border border-atlas-border/70 px-6 py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-atlas-bg-subtle flex items-center justify-center">
                <svg className="w-6 h-6 text-atlas-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-atlas-text-primary mb-1">No requests yet</p>
              <p className="text-sm text-atlas-text-secondary">
                Create your first payment request to get started.
              </p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => setTab('create')}>
                Create request
              </Button>
            </div>
          )}

          {!loadingRequests &&
            requests.map((req) => {
              const config = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-2xl border border-atlas-border/70 p-5 transition-all ${SPRING} hover:shadow-sm`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 mb-1">
                        <p className="text-lg font-semibold tracking-tight">
                          {formatMoney(req.amountCents, req.currency)}
                        </p>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </div>
                      {req.recipientEmail && (
                        <p className="text-sm text-atlas-text-secondary truncate">
                          To: {req.recipientEmail}
                        </p>
                      )}
                      {req.note && (
                        <p className="text-sm text-atlas-text-secondary mt-0.5 truncate">
                          &ldquo;{req.note}&rdquo;
                        </p>
                      )}
                      <p className="text-xs text-atlas-text-secondary/60 mt-2">
                        {new Date(req.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {req.paidAt && req.paidByName && (
                          <span className="text-atlas-success">
                            {' · Paid by '}
                            {req.paidByName}
                          </span>
                        )}
                      </p>
                    </div>

                    {req.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        loading={cancellingId === req.id}
                        onClick={() => handleCancel(req.id)}
                        className="flex-shrink-0 text-atlas-text-secondary hover:text-atlas-error hover:border-atlas-error/40"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
