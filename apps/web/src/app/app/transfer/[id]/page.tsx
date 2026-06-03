'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatMoney } from '@auriga-money/shared';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import Link from 'next/link';

type TransferStatus = 'initiated' | 'processing' | 'in_transit' | 'delivered' | 'failed';

interface TransferDetails {
  id: string;
  status: TransferStatus;
  amountCents: number;
  currency: string;
  creditorName: string;
  creditorIban: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

const STEPS: { key: TransferStatus; label: string; sublabel: string }[] = [
  { key: 'initiated', label: 'You set up your transfer', sublabel: 'Payment order received by Auriga' },
  { key: 'processing', label: 'We\'re processing your transfer', sublabel: 'Running compliance checks' },
  { key: 'in_transit', label: 'Money is on its way', sublabel: 'Funds sent to recipient\'s bank' },
  { key: 'delivered', label: 'Your transfer\'s complete', sublabel: 'Money has arrived' },
];

function getStepIndex(status: TransferStatus): number {
  if (status === 'failed') return -1;
  const idx = STEPS.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TransferStatusPage() {
  const { id } = useParams<{ id: string }>();
  const [transfer, setTransfer] = useState<TransferDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadTransfer();
    const interval = setInterval(loadTransfer, 5000);
    return () => clearInterval(interval);
  }, [id]);

  async function loadTransfer() {
    try {
      const data = await api.getTransferDetails(id);
      setTransfer(data);
      updateLocalStorage(data);
    } catch {
      // Fallback: use localStorage data if API unavailable
      try {
        const stored = JSON.parse(localStorage.getItem('auriga_active_transfers') || '[]');
        const match = stored.find((t: any) => t.id === id);
        if (match) {
          setTransfer({
            id,
            status: match.status || 'initiated',
            amountCents: match.amountCents || 0,
            currency: 'EUR',
            creditorName: match.creditorName || '',
            creditorIban: '',
            createdAt: match.createdAt || new Date().toISOString(),
            updatedAt: match.createdAt || new Date().toISOString(),
          });
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  function updateLocalStorage(data: TransferDetails) {
    if (data.status === 'delivered' || data.status === 'failed') {
      try {
        const stored = JSON.parse(localStorage.getItem('auriga_active_transfers') || '[]');
        const filtered = stored.filter((t: any) => t.id !== id);
        localStorage.setItem('auriga_active_transfers', JSON.stringify(filtered));
      } catch {}
    }
  }

  async function handleShare() {
    const shareUrl = `${window.location.origin}/t/${id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
        <div className="w-6 h-6 border-2 border-auriga-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!transfer) return null;

  const currentStep = getStepIndex(transfer.status);
  const isFailed = transfer.status === 'failed';
  const isComplete = transfer.status === 'delivered';

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <div className="text-center">
          <p className="text-xs text-auriga-text-secondary/70 mb-3">
            {formatDate(transfer.createdAt)} at {formatTime(transfer.createdAt)}
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-auriga-text-primary">
            {isComplete
              ? 'Your transfer\'s complete'
              : isFailed
                ? 'Transfer could not be completed'
                : 'Your transfer is on its way'}
          </h1>
          {transfer.amountCents > 0 && (
            <p className="text-base text-auriga-text-secondary mt-2">
              {formatMoney(transfer.amountCents)} → {transfer.creditorName}
            </p>
          )}
        </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-auriga-border/60 p-6 sm:p-8">
        <div className="relative">
          {STEPS.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep || isComplete;
            const isPending = i > currentStep && !isComplete;

            return (
              <div key={step.key} className="flex gap-4 relative">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div
                    className={clsx(
                      'absolute left-[15px] top-[34px] w-[2px]',
                      i === STEPS.length - 2 ? 'h-[calc(100%-20px)]' : 'h-full',
                      isDone ? 'bg-auriga-success' : isActive ? 'bg-auriga-success' : 'bg-auriga-border/50',
                    )}
                  />
                )}

                {/* Circle */}
                <div className="relative z-10 flex-shrink-0 mt-1.5">
                  <div
                    className={clsx(
                      'w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all',
                      isDone && 'bg-auriga-success text-white',
                      isActive && !isFailed && 'bg-auriga-success text-white ring-4 ring-auriga-success/15',
                      isActive && isFailed && 'bg-auriga-error text-white ring-4 ring-auriga-error/15',
                      isPending && 'bg-white border-2 border-auriga-border/60',
                    )}
                  >
                    {isDone || (isActive && !isFailed) ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isActive && isFailed ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-auriga-border" />
                    )}
                  </div>
                </div>

                {/* Text */}
                <div className={clsx('pt-1.5', i === STEPS.length - 1 ? 'pb-0' : 'pb-8')}>
                  <p
                    className={clsx(
                      'text-sm font-medium leading-tight',
                      (isDone || isActive) && !isFailed && 'text-auriga-text-primary',
                      isActive && isFailed && 'text-auriga-error',
                      isPending && 'text-auriga-text-secondary/60',
                    )}
                  >
                    {step.label}
                  </p>
                  <p className={clsx(
                    'text-xs mt-0.5',
                    (isDone || isActive) ? 'text-auriga-text-secondary' : 'text-auriga-text-secondary/40',
                  )}>
                    {step.sublabel}
                  </p>
                  {(isDone || isActive) && (
                    <p className="text-[11px] text-auriga-text-secondary/60 mt-1">
                      {formatTime(i === 0 ? transfer.createdAt : transfer.updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivery estimate */}
        {!isComplete && !isFailed && (
          <div className="mt-6 pt-5 border-t border-auriga-border/40">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-auriga-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-auriga-text-secondary">
                Should arrive <span className="font-medium text-auriga-text-primary">within seconds</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="w-full flex items-center gap-3 bg-white rounded-2xl border border-auriga-border/60 px-5 py-4 text-left hover:bg-auriga-bg-subtle/30 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-auriga-bg-subtle flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-auriga-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-auriga-text-primary">
            {copied ? 'Link copied!' : 'Share this transfer'}
          </p>
          <p className="text-xs text-auriga-text-secondary">
            Anyone with the link can track the status
          </p>
        </div>
        <svg className="w-4 h-4 text-auriga-text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Repeat transfer */}
      {transfer.creditorName && (
        <Link
          href={`/app/send?name=${encodeURIComponent(transfer.creditorName)}&iban=${encodeURIComponent(transfer.creditorIban || '')}&amount=${transfer.amountCents ? (transfer.amountCents / 100).toFixed(2) : ''}`}
          className="w-full flex items-center gap-3 bg-white rounded-2xl border border-auriga-border/60 px-5 py-4 text-left hover:bg-auriga-bg-subtle/30 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-auriga-accent-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-auriga-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-auriga-text-primary">Repeat this transfer</p>
            <p className="text-xs text-auriga-text-secondary">
              Send {transfer.amountCents > 0 ? formatMoney(transfer.amountCents) : 'money'} to {transfer.creditorName} again
            </p>
          </div>
          <svg className="w-4 h-4 text-auriga-text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      )}

      {/* Bottom actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="secondary" className="flex-1" asChild>
          <Link href="/app/send">New transfer</Link>
        </Button>
        <Button variant="ghost" className="flex-1" asChild>
          <Link href="/app/dashboard">Home</Link>
        </Button>
      </div>

      </div>
    </div>
  );
}
