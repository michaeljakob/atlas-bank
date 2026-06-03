'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HandleField } from '@/components/handle/handle-field';
import { formatIban } from '@auriga-money/shared';
import { track, AnalyticsEvent } from '@/lib/analytics';

interface Props {
  account: { iban: string; bic: string; holderName: string };
  card: { last4: string; type: string };
}

const CONFETTI_COLORS = ['#CCFF00', '#5AC53A', '#1C180D', '#DBFF4D', '#B4B1AB'];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: `${(i * 37 + 11) % 100}%`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: `${(i % 7) * 0.12}s`,
        duration: `${1.8 + ((i * 13) % 9) / 10}s`,
        size: 6 + (i % 4) * 2,
        round: i % 3 === 0,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 animate-confetti-fall motion-reduce:hidden"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.round ? '9999px' : '2px',
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

export function SuccessStep({ account, card }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    track(AnalyticsEvent.OnboardingCompleted);
  }, []);

  function copyIban() {
    navigator.clipboard.writeText(account.iban);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative bg-white rounded-2xl border border-auriga-border p-8 shadow-sm text-center overflow-hidden">
      <Confetti />

      <div className="relative w-20 h-20 mx-auto mb-6 rounded-full bg-auriga-accent/20 flex items-center justify-center animate-pop-in">
        <svg className="w-10 h-10 text-auriga-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-medium mb-2 animate-rise-in">Welcome to Auriga</h1>
      <p className="text-auriga-text-secondary mb-8 animate-rise-in">
        Your account is live. Your EUR IBAN can receive money right now and your virtual card is ready to spend.
      </p>

      <div className="bg-auriga-bg-subtle rounded-xl p-6 mb-6 text-left">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-auriga-text-secondary uppercase tracking-wide">Your IBAN</span>
          <button
            onClick={copyIban}
            className="text-xs text-auriga-accent-700 hover:underline font-medium"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-lg font-mono font-medium tracking-wide">{formatIban(account.iban)}</p>
        <div className="mt-3 flex gap-6 text-xs text-auriga-text-secondary">
          <div>
            <span className="uppercase tracking-wide">BIC</span>
            <p className="font-mono text-auriga-text-primary mt-0.5">{account.bic}</p>
          </div>
          <div>
            <span className="uppercase tracking-wide">Name</span>
            <p className="text-auriga-text-primary mt-0.5">{account.holderName}</p>
          </div>
        </div>
      </div>

      <div className="bg-auriga-dark-surface text-white rounded-xl p-6 mb-6 text-left">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-auriga-heather-300 uppercase tracking-wide">Virtual card</p>
            <p className="font-mono text-lg mt-1">•••• •••• •••• {card.last4}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-auriga-heather-300">Mastercard</p>
            <p className="text-xs text-auriga-accent-700 font-medium mt-1">Active</p>
          </div>
        </div>
      </div>

      <div className="bg-auriga-bg-subtle rounded-xl p-6 mb-6 text-left">
        <p className="text-sm font-medium text-auriga-text-primary">Claim your @handle</p>
        <p className="text-xs text-auriga-text-secondary mt-0.5 mb-3">
          Let friends pay you by @handle — no IBAN required. You can change it later in settings.
        </p>
        <HandleField ctaLabel="Claim" />
      </div>

      <div className="space-y-3">
        <Button size="lg" className="w-full" asChild>
          <Link href="/app/dashboard">Take me to my account</Link>
        </Button>
        <Button variant="secondary" size="lg" className="w-full" asChild>
          <Link href="/app/card">View your card</Link>
        </Button>
      </div>
    </div>
  );
}
