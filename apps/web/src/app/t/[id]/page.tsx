'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { formatMoney } from '@auriga-money/shared';
import { clsx } from 'clsx';

type TransferStatus = 'initiated' | 'processing' | 'in_transit' | 'delivered' | 'failed';

interface PublicTransfer {
  id: string;
  status: TransferStatus;
  amountCents: number;
  currency: string;
  creditorName: string;
  senderName: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

const STEPS: { key: TransferStatus; label: string; sublabel: string }[] = [
  { key: 'initiated', label: 'Transfer set up', sublabel: 'Payment order received' },
  { key: 'processing', label: 'Processing', sublabel: 'Running compliance checks' },
  { key: 'in_transit', label: 'Money sent', sublabel: 'On the way to recipient\'s bank' },
  { key: 'delivered', label: 'Transfer complete', sublabel: 'Money has arrived' },
];

function getStepIndex(status: TransferStatus): number {
  if (status === 'failed') return -1;
  return STEPS.findIndex(s => s.key === status);
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export default function PublicTransferPage() {
  const { id } = useParams<{ id: string }>();
  const [transfer, setTransfer] = useState<PublicTransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadTransfer();
    const interval = setInterval(loadTransfer, 8000);
    return () => clearInterval(interval);
  }, [id]);

  async function loadTransfer() {
    try {
      const res = await fetch(`${API_BASE}/payments/${id}/public`);
      if (!res.ok) throw new Error();
      setTransfer(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-auriga-bg-subtle flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-auriga-heather-200 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="min-h-screen bg-auriga-bg-subtle flex items-center justify-center p-4">
        <div className="text-center max-w-xs">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-auriga-heather-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-auriga-heather-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-base font-semibold text-auriga-text-primary mb-1">Transfer not found</h1>
          <p className="text-sm text-auriga-text-secondary">This link may be invalid or the transfer has expired.</p>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(transfer.status);
  const isComplete = transfer.status === 'delivered';
  const isFailed = transfer.status === 'failed';

  return (
    <div className="min-h-screen bg-auriga-bg-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-auriga-text-primary">
            {isComplete
              ? 'Transfer complete'
              : isFailed
                ? 'Transfer failed'
                : 'Transfer in progress'}
          </h1>
          {transfer.amountCents > 0 && (
            <p className="text-3xl font-bold text-auriga-text-primary mt-3 tabular-nums">
              {formatMoney(transfer.amountCents)}
            </p>
          )}
          <p className="text-sm text-auriga-text-secondary mt-2">
            {transfer.senderName} → {transfer.creditorName}
          </p>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-auriga-border p-6 shadow-sm">
          <div className="relative">
            {STEPS.map((step, i) => {
              const isActive = i === currentStep;
              const isDone = i < currentStep || isComplete;
              const isPending = i > currentStep && !isComplete;

              return (
                <div key={step.key} className="flex gap-4 relative">
                  {i < STEPS.length - 1 && (
                    <div
                      className={clsx(
                        'absolute left-[15px] top-[34px] w-[2px] h-[calc(100%-14px)]',
                        isDone ? 'bg-auriga-accent-400' : isActive ? 'bg-auriga-accent-400' : 'bg-auriga-heather-200',
                      )}
                    />
                  )}

                  <div className="relative z-10 flex-shrink-0 mt-1.5">
                    <div
                      className={clsx(
                        'w-[32px] h-[32px] rounded-full flex items-center justify-center',
                        isDone && 'bg-auriga-accent text-white',
                        isActive && !isFailed && 'bg-auriga-accent text-white ring-4 ring-auriga-accent-50',
                        isActive && isFailed && 'bg-auriga-error text-white ring-4 ring-auriga-error/10',
                        isPending && 'bg-white border-2 border-auriga-border',
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
                        <div className="w-2 h-2 rounded-full bg-auriga-heather-300" />
                      )}
                    </div>
                  </div>

                  <div className={clsx('pt-1.5', i === STEPS.length - 1 ? 'pb-0' : 'pb-7')}>
                    <p className={clsx(
                      'text-sm font-medium',
                      (isDone || isActive) && !isFailed && 'text-auriga-text-primary',
                      isActive && isFailed && 'text-auriga-error',
                      isPending && 'text-auriga-heather-400',
                    )}>
                      {step.label}
                    </p>
                    <p className={clsx(
                      'text-xs mt-0.5',
                      (isDone || isActive) ? 'text-auriga-text-secondary' : 'text-auriga-heather-300',
                    )}>
                      {step.sublabel}
                    </p>
                    {(isDone || isActive) && (
                      <p className="text-[11px] text-auriga-heather-400 mt-0.5">
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
            <div className="mt-5 pt-4 border-t border-auriga-border flex items-center gap-2">
              <svg className="w-4 h-4 text-auriga-heather-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-auriga-text-secondary">
                Should arrive <span className="font-medium text-auriga-text-primary">within seconds</span>
              </p>
            </div>
          )}
        </div>

        {/* Reference */}
        {transfer.reference && (
          <div className="mt-3 bg-white rounded-xl border border-auriga-border px-4 py-3 shadow-sm">
            <p className="text-[11px] text-auriga-heather-400 uppercase tracking-wider mb-0.5">Reference</p>
            <p className="text-sm text-auriga-text-primary">{transfer.reference}</p>
          </div>
        )}

        {/* Branding */}
        <div className="text-center mt-8">
          <p className="text-xs text-auriga-heather-400">
            Tracked by <span className="font-semibold text-auriga-text-secondary">Auriga</span>
          </p>
          <p className="text-[11px] text-auriga-heather-300 mt-1">Instant transfers, zero fees</p>
        </div>
      </div>
    </div>
  );
}
