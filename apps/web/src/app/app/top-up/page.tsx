'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CurrencySelect, currencyFlag } from '@/components/ui/currency-select';
import { Flag } from '@/components/ui/flag';
import { formatMoney, formatIban } from '@auriga-money/shared';
import { clsx } from 'clsx';
import { api } from '@/lib/api';
import { track, AnalyticsEvent } from '@/lib/analytics';
import { toast } from 'sonner';

const SPRING = 'duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]';

interface AccountDetails {
  label: string;
  value: string;
  mono?: boolean;
}

interface CurrencyConfig {
  currency: string;
  details: AccountDetails[];
  available: boolean;
}

interface PendingTx {
  id: string;
  amountCents: number;
  currency: string;
  counterpartyName: string;
  reference: string;
  createdAt: string;
}

// Currencies we display in the selector. Real account details (IBAN/BIC) are
// always loaded live from the API — we never show placeholder bank details, as
// a user could mistakenly send real money to a fake IBAN.
const CURRENCY_OPTIONS: { currency: string }[] = [
  { currency: 'EUR' },
  { currency: 'USD' },
  { currency: 'GBP' },
  { currency: 'CHF' },
];

const emptyAccounts: CurrencyConfig[] = CURRENCY_OPTIONS.map((c) => ({
  currency: c.currency,
  available: false,
  details: [],
}));

const steps = [
  { num: 1, title: 'Log into your bank', desc: 'Open your bank\'s app or website' },
  { num: 2, title: 'Create a new transfer', desc: 'Start a bank transfer or wire' },
  { num: 3, title: 'Enter the account details', desc: 'Use the IBAN and BIC shown above' },
  { num: 4, title: 'Add the amount', desc: 'Enter how much you want to top up' },
  { num: 5, title: 'Confirm and send', desc: 'Review and submit the transfer' },
];

function formatDetailValue(label: string, value: string): string {
  const key = label.toLowerCase();
  if (key === 'iban') return formatIban(value);
  return value;
}

export default function TopUpPage() {
  const [activeCurrency, setActiveCurrency] = useState(0);
  const [accounts, setAccounts] = useState<CurrencyConfig[]>(emptyAccounts);
  const [pendingTxs, setPendingTxs] = useState<PendingTx[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    track(AnalyticsEvent.TopUpViewed);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [accs, txData] = await Promise.all([
          api.getAllAccounts(),
          api.getTransactions(undefined, 50).catch(() => ({ items: [] as any[] })),
        ]);

        if (cancelled) return;

        const mapped: CurrencyConfig[] = CURRENCY_OPTIONS.map((opt) => {
          const match = accs.find((a) => a.currency === opt.currency);
          const details: AccountDetails[] = [];
          if (match?.iban) details.push({ label: 'IBAN', value: match.iban, mono: true });
          if (match?.bic) details.push({ label: 'BIC / SWIFT', value: match.bic, mono: true });
          if (match?.holderName) details.push({ label: 'Account holder', value: match.holderName });

          return {
            currency: opt.currency,
            available: details.length > 0,
            details,
          };
        });
        setAccounts(mapped);

        const pending = (txData.items || []).filter(
          (tx: any) => tx.direction === 'inbound' && tx.status === 'pending',
        );
        setPendingTxs(pending);
      } catch {
        // API unavailable — show currencies as not-yet-available rather than fake details.
        if (!cancelled) setAccounts(emptyAccounts);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  function copyToClipboard(label: string, value: string) {
    const raw = value.replace(/\s/g, '');
    navigator.clipboard.writeText(raw).then(() => {
      setCopiedField(label);
      toast.success(`${label} copied`);
      setTimeout(() => setCopiedField(null), 2000);
    });
  }

  const active = accounts[activeCurrency];

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-auriga-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[720px] mx-auto">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-auriga-text-primary mb-1">
        Top up your account
      </h1>
      <p className="text-sm text-auriga-text-secondary mb-8">
        Transfer money from your bank to Auriga
      </p>

      {/* Currency selector */}
      <div className="mb-6">
        <CurrencySelect
          value={active.currency}
          onChange={(code) => {
            const idx = accounts.findIndex((a) => a.currency === code);
            if (idx >= 0) { setActiveCurrency(idx); setCopiedField(null); }
          }}
          currencies={accounts.map((a) => ({ code: a.currency, name: a.currency }))}
          align="start"
        />
      </div>

      {active.available ? (
        <div className="space-y-6">
          {/* Account details card */}
          <div className="bg-white rounded-2xl border border-auriga-border/70 overflow-hidden">
            <div className="px-6 pt-6 pb-2">
              <p className="text-[13px] font-medium uppercase tracking-wider text-auriga-text-secondary mb-4">
                Your {active.currency} account details
              </p>
            </div>

            <div className="px-6 pb-6 space-y-0">
              {active.details.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between py-3.5 border-b border-auriga-border/40 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-auriga-text-secondary uppercase tracking-wider mb-0.5">
                      {d.label}
                    </p>
                    <p className={clsx(
                      'text-sm text-auriga-text-primary',
                      d.mono && 'font-mono tracking-wide',
                    )}>
                      {formatDetailValue(d.label, d.value)}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(d.label, d.value)}
                    className={clsx(
                      `ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${SPRING}`,
                      copiedField === d.label
                        ? 'bg-auriga-accent/10 text-auriga-accent'
                        : 'bg-auriga-bg-subtle text-auriga-text-secondary hover:text-auriga-text-primary hover:bg-auriga-bg-subtle/80',
                    )}
                  >
                    {copiedField === d.label ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Steps card */}
          <div className="bg-white rounded-2xl border border-auriga-border/70 p-6">
            <p className="text-[13px] font-medium uppercase tracking-wider text-auriga-text-secondary mb-5">
              How to top up
            </p>
            <div className="space-y-4">
              {steps.map((s) => (
                <div key={s.num} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-auriga-bg-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-auriga-text-secondary">{s.num}</span>
                  </div>
                  <div className="min-w-0 flex-1 pb-4 border-b border-auriga-border/30 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-auriga-text-primary">{s.title}</p>
                    <p className="text-xs text-auriga-text-secondary mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Processing time */}
          <div className="bg-white rounded-2xl border border-auriga-border/70 p-6">
            <p className="text-[13px] font-medium uppercase tracking-wider text-auriga-text-secondary mb-4">
              Processing time
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`p-4 rounded-xl border border-auriga-border/50 transition-all ${SPRING}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <svg className="w-4 h-4 text-auriga-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-auriga-text-primary">Standard SEPA</p>
                </div>
                <p className="text-xs text-auriga-text-secondary">1 business day</p>
                <p className="text-xs font-medium text-auriga-success mt-2">Free</p>
              </div>
              <div className={`p-4 rounded-xl border border-auriga-border/50 transition-all ${SPRING}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <svg className="w-4 h-4 text-auriga-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  <p className="text-sm font-medium text-auriga-text-primary">Instant SEPA</p>
                </div>
                <p className="text-xs text-auriga-text-secondary">Within seconds</p>
                <p className="text-xs font-medium text-auriga-text-primary mt-2">Depends on your bank</p>
              </div>
            </div>
          </div>

          {/* Pending top-ups */}
          <div className="bg-white rounded-2xl border border-auriga-border/70 overflow-hidden">
            <div className="px-6 pt-6 pb-2">
              <p className="text-[13px] font-medium uppercase tracking-wider text-auriga-text-secondary">
                Pending top-ups
              </p>
            </div>
            <div className="px-6 pb-6">
              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="w-5 h-5 border-2 border-auriga-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : pendingTxs.length > 0 ? (
                <div className="space-y-0.5 mt-2">
                  {pendingTxs.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl hover:bg-auriga-bg-subtle/50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-auriga-accent/15 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-auriga-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-auriga-text-primary truncate">
                            {tx.counterpartyName}
                          </p>
                          <Badge variant="warning" className="text-[10px] py-0 px-1.5">Pending</Badge>
                        </div>
                        <p className="text-xs text-auriga-text-secondary truncate">{tx.reference}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold tabular-nums text-auriga-success">
                          +{formatMoney(tx.amountCents, tx.currency)}
                        </p>
                        <p className="text-[10px] text-auriga-text-secondary">
                          {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="w-10 h-10 rounded-full bg-auriga-bg-subtle flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-auriga-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-auriga-text-primary">No pending top-ups</p>
                  <p className="text-xs text-auriga-text-secondary mt-1">
                    Transfers will appear here once initiated
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Currency not available */
        <div className="bg-white rounded-2xl border border-auriga-border/70 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-auriga-bg-subtle flex items-center justify-center mx-auto mb-4">
            <Flag code={currencyFlag(active.currency)} name={active.currency} className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-semibold text-auriga-text-primary mb-1">
            {active.currency} account coming soon
          </h2>
          <p className="text-sm text-auriga-text-secondary max-w-sm mx-auto mb-6 leading-relaxed">
            We're working on adding {active.currency} account support. You'll be notified when it's available.
          </p>
          <Button variant="outline" size="sm" disabled>
            Notify me
          </Button>
        </div>
      )}
    </div>
  );
}
