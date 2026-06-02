'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CurrencySelect, currencyFlag } from '@/components/ui/currency-select';
import { Flag } from '@/components/ui/flag';
import { formatMoney } from '@atlas-bank/shared';
import { clsx } from 'clsx';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type ConvertStep = 'form' | 'confirm' | 'success';

const SPRING = 'duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]';

type Quote = {
  from: string;
  to: string;
  amountCents: number;
  feeCents: number;
  feeRate: number;
  rate: number;
  convertedCents: number;
  expiresIn: number;
};

type Account = {
  id: string;
  status: string;
  iban: string;
  bic: string;
  holderName: string;
  currency: string;
  balance: { amount: number; currency: string };
};

export default function ConvertPage() {
  const [step, setStep] = useState<ConvertStep>('form');
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [result, setResult] = useState<{ convertedCents: number; rate: number } | null>(null);

  useEffect(() => {
    api.getAllAccounts().then(setAccounts).catch(() => {});
  }, []);

  const sourceBalance = accounts.find((a) => a.currency === fromCurrency)?.balance.amount ?? 0;

  const fetchQuote = useCallback(
    async (amountCents: number) => {
      if (amountCents <= 0 || fromCurrency === toCurrency) {
        setQuote(null);
        return;
      }
      setLoading(true);
      try {
        const q = await api.getConversionQuote(fromCurrency, toCurrency, amountCents);
        setQuote(q);
      } catch {
        toast.error('Unable to fetch live rate. Please try again.');
        setQuote(null);
      } finally {
        setLoading(false);
      }
    },
    [fromCurrency, toCurrency],
  );

  useEffect(() => {
    const amountCents = Math.round(parseFloat(amount || '0') * 100);
    if (amountCents <= 0 || fromCurrency === toCurrency) {
      setQuote(null);
      return;
    }
    const timer = setTimeout(() => fetchQuote(amountCents), 400);
    return () => clearTimeout(timer);
  }, [amount, fromCurrency, toCurrency, fetchQuote]);

  useEffect(() => {
    if (step !== 'confirm') return;
    setCountdown(quote?.expiresIn ?? 30);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          toast.error('Rate expired. Please review again.');
          setStep('form');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, quote?.expiresIn]);

  function handleSwap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  function handleReview() {
    if (!quote) return;
    setStep('confirm');
  }

  async function handleConfirm() {
    if (!quote) return;
    setExecuting(true);
    try {
      const res = await api.executeConversion({
        from: fromCurrency,
        to: toCurrency,
        amountCents: quote.amountCents,
      });
      setResult({ convertedCents: res.convertedCents, rate: res.rate });
      setStep('success');
    } catch {
      toast.error('Conversion failed. Please try again.');
    } finally {
      setExecuting(false);
    }
  }

  function handleReset() {
    setStep('form');
    setAmount('');
    setQuote(null);
    setResult(null);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-lg mx-auto">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-8">
        Convert
      </h1>

      {step === 'form' && (
        <div className="space-y-5 animate-fade-in">
          {/* You send */}
          <div className="bg-white rounded-2xl border border-atlas-border/70 p-5">
            <p className="text-[13px] font-medium uppercase tracking-wider text-atlas-text-secondary mb-3">
              You send
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 text-3xl font-semibold bg-transparent focus:outline-none placeholder:text-atlas-text-secondary/20 min-w-0"
              />
              <CurrencySelect
                value={fromCurrency}
                onChange={setFromCurrency}
                exclude={toCurrency}
              />
            </div>
            <p className="text-xs text-atlas-text-secondary mt-3">
              Available: {formatMoney(sourceBalance, fromCurrency)}
            </p>
          </div>

          {/* Rate + Swap */}
          <div className="flex items-center justify-center gap-3 -my-1">
            <div className="h-px flex-1 bg-atlas-border/50" />
            <button
              onClick={handleSwap}
              className={clsx(
                'w-10 h-10 rounded-full border border-atlas-border/70 bg-white flex items-center justify-center',
                `hover:border-atlas-accent hover:bg-atlas-accent/5 transition-all ${SPRING} hover:scale-110 active:scale-95`,
              )}
              aria-label="Swap currencies"
            >
              <svg className="w-4 h-4 text-atlas-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
            {quote && (
              <span className="text-xs text-atlas-text-secondary font-medium">
                1 {fromCurrency} = {quote.rate.toFixed(4)} {toCurrency}
              </span>
            )}
            <div className="h-px flex-1 bg-atlas-border/50" />
          </div>

          {/* They receive */}
          <div className="bg-white rounded-2xl border border-atlas-border/70 p-5">
            <p className="text-[13px] font-medium uppercase tracking-wider text-atlas-text-secondary mb-3">
              They receive
            </p>
            <div className="flex items-center gap-3">
              <span className={clsx(
                'flex-1 text-3xl font-semibold min-w-0 truncate',
                loading && 'opacity-50 animate-pulse',
              )}>
                {quote ? formatMoney(quote.convertedCents, toCurrency) : '0.00'}
              </span>
              <CurrencySelect
                value={toCurrency}
                onChange={setToCurrency}
                exclude={fromCurrency}
              />
            </div>
          </div>

          {/* Fee breakdown */}
          {quote && (
            <div className={`bg-atlas-bg-subtle/50 rounded-xl px-5 py-4 space-y-2 transition-all ${SPRING}`}>
              <div className="flex justify-between text-sm">
                <span className="text-atlas-text-secondary">Fee</span>
                <span className="font-medium">
                  {formatMoney(quote.feeCents, fromCurrency)}{' '}
                  <span className="text-atlas-text-secondary font-normal">
                    ({(quote.feeRate * 100).toFixed(2)}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-atlas-text-secondary">Rate</span>
                <span className="font-medium">
                  1 {fromCurrency} = {quote.rate.toFixed(4)} {toCurrency}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-atlas-text-secondary">You&apos;ll convert</span>
                <span className="font-medium">
                  {formatMoney(quote.amountCents - quote.feeCents, fromCurrency)}
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={handleReview}
            disabled={!quote || loading}
            loading={loading}
            className="w-full"
            size="lg"
          >
            Review conversion
          </Button>
        </div>
      )}

      {step === 'confirm' && quote && (
        <div className="bg-white rounded-2xl border border-atlas-border/70 overflow-hidden animate-fade-in">
          <div className="px-8 py-10 text-center">
            <p className="text-sm text-atlas-text-secondary mb-1">Converting</p>
            <p className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {formatMoney(quote.amountCents, fromCurrency)}
            </p>
            <p className="flex items-center justify-center gap-2 text-lg text-atlas-text-secondary mt-2">
              <Flag code={currencyFlag(fromCurrency)} name={fromCurrency} className="w-5 h-5" />
              {fromCurrency}
              <span className="mx-1">→</span>
              <Flag code={currencyFlag(toCurrency)} name={toCurrency} className="w-5 h-5" />
              {toCurrency}
            </p>
          </div>

          <div className="mx-6 border-t border-atlas-border/50" />

          <div className="px-6 py-5 space-y-0">
            <ConfirmRow label="You send" value={formatMoney(quote.amountCents, fromCurrency)} />
            <ConfirmRow label="Fee" value={`${formatMoney(quote.feeCents, fromCurrency)} (${(quote.feeRate * 100).toFixed(2)}%)`} />
            <ConfirmRow label="Exchange rate" value={`1 ${fromCurrency} = ${quote.rate.toFixed(4)} ${toCurrency}`} />
            <ConfirmRow label="They receive" value={formatMoney(quote.convertedCents, toCurrency)} highlight />
          </div>

          <div className="mx-6 border-t border-atlas-border/50" />

          {/* Countdown */}
          <div className="px-6 py-4 flex items-center justify-center gap-2">
            <div className="relative w-5 h-5">
              <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" className="text-atlas-border/30" />
                <circle
                  cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2"
                  className="text-atlas-accent"
                  strokeDasharray={2 * Math.PI * 8}
                  strokeDashoffset={2 * Math.PI * 8 * (1 - countdown / 30)}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className={clsx(
              'text-sm font-medium',
              countdown <= 10 ? 'text-atlas-error' : 'text-atlas-text-secondary',
            )}>
              Rate locked for {countdown}s
            </span>
          </div>

          <div className="p-6 pt-2 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setStep('form')}>
              Edit
            </Button>
            <Button className="flex-1" onClick={handleConfirm} loading={executing}>
              Confirm conversion
            </Button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="bg-white rounded-2xl border border-atlas-border/70 px-8 py-12 text-center animate-scale-in">
          <div className={`w-16 h-16 mx-auto mb-5 rounded-full bg-atlas-accent-50 flex items-center justify-center transition-transform ${SPRING}`}>
            <svg className="w-8 h-8 text-atlas-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-1">Conversion complete</h2>
          <p className="text-sm text-atlas-text-secondary mb-6 max-w-xs mx-auto leading-relaxed">
            You converted {formatMoney(quote?.amountCents ?? 0, fromCurrency)} to{' '}
            {formatMoney(result?.convertedCents ?? quote?.convertedCents ?? 0, toCurrency)}
          </p>

          <div className="bg-atlas-bg-subtle/50 rounded-xl px-5 py-4 space-y-2 mb-8 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-atlas-text-secondary">Sent</span>
              <span className="font-medium">{formatMoney(quote?.amountCents ?? 0, fromCurrency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-atlas-text-secondary">Received</span>
              <span className="font-medium text-atlas-success">
                {formatMoney(result?.convertedCents ?? quote?.convertedCents ?? 0, toCurrency)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-atlas-text-secondary">Rate</span>
              <span className="font-medium">
                1 {fromCurrency} = {(result?.rate ?? quote?.rate ?? 0).toFixed(4)} {toCurrency}
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={handleReset}>
              Convert again
            </Button>
            <Button variant="ghost" asChild>
              <a href="/app/dashboard">Back to home</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-atlas-border/40 last:border-0">
      <span className="text-sm text-atlas-text-secondary">{label}</span>
      <span className={clsx('text-sm font-medium', highlight && 'text-atlas-success')}>
        {value}
      </span>
    </div>
  );
}
