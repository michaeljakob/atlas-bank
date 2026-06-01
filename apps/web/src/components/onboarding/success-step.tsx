'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatIban } from '@atlas-bank/shared';

interface Props {
  account: { iban: string; bic: string; holderName: string };
  card: { last4: string; type: string };
}

export function SuccessStep({ account, card }: Props) {
  const [copied, setCopied] = useState(false);

  function copyIban() {
    navigator.clipboard.writeText(account.iban);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-atlas-border p-8 shadow-sm text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-atlas-accent/20 flex items-center justify-center">
        <svg className="w-10 h-10 text-atlas-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-medium mb-2">Your account is live</h1>
      <p className="text-atlas-text-secondary mb-8">
        Your EUR IBAN is ready to receive money and your virtual card is active.
      </p>

      <div className="bg-atlas-bg-subtle rounded-xl p-6 mb-6 text-left">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-atlas-text-secondary uppercase tracking-wide">Your IBAN</span>
          <button
            onClick={copyIban}
            className="text-xs text-atlas-accent hover:underline font-medium"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-lg font-mono font-medium tracking-wide">{formatIban(account.iban)}</p>
        <div className="mt-3 flex gap-6 text-xs text-atlas-text-secondary">
          <div>
            <span className="uppercase tracking-wide">BIC</span>
            <p className="font-mono text-atlas-text-primary mt-0.5">{account.bic}</p>
          </div>
          <div>
            <span className="uppercase tracking-wide">Name</span>
            <p className="text-atlas-text-primary mt-0.5">{account.holderName}</p>
          </div>
        </div>
      </div>

      <div className="bg-atlas-dark-surface text-white rounded-xl p-6 mb-6 text-left">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Virtual card</p>
            <p className="font-mono text-lg mt-1">•••• •••• •••• {card.last4}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Mastercard</p>
            <p className="text-xs text-atlas-accent font-medium mt-1">Active</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button size="lg" className="w-full">
          Add to Apple Pay
        </Button>
        <Button variant="secondary" size="lg" className="w-full" asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
