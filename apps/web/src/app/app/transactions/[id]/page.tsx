'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MerchantLogo } from '@/components/ui/merchant-logo';
import { api } from '@/lib/api';
import { formatMoney } from '@auriga-money/shared';
import { clsx } from 'clsx';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'settled' | 'scheduled';
  amountCents: number;
  currency: string;
  counterpartyName: string;
  counterpartyIban?: string;
  category: string;
  reference: string;
  createdAt: string;
  paymentId?: string;
}

const fallbackTransactions: Transaction[] = [
  { id: 't1', direction: 'outbound', status: 'settled', amountCents: 50000, currency: 'EUR', counterpartyName: 'Sarah Miller', category: 'transfer', reference: 'Rent share', createdAt: '2026-05-30T09:00:00Z' },
  { id: 't2', direction: 'outbound', status: 'settled', amountCents: 12500, currency: 'EUR', counterpartyName: 'Sarah Miller', category: 'transfer', reference: 'Dinner split', createdAt: '2026-05-15T14:00:00Z' },
  { id: 't3', direction: 'inbound', status: 'settled', amountCents: 25000, currency: 'EUR', counterpartyName: 'Sarah Miller', category: 'transfer', reference: 'Repayment', createdAt: '2026-05-10T11:00:00Z' },
  { id: 't4', direction: 'outbound', status: 'settled', amountCents: 350000, currency: 'EUR', counterpartyName: 'Acme Corp', category: 'salary', reference: 'Invoice #1042', createdAt: '2026-06-01T09:00:00Z' },
  { id: 't5', direction: 'outbound', status: 'settled', amountCents: 350000, currency: 'EUR', counterpartyName: 'Acme Corp', category: 'salary', reference: 'Invoice #1041', createdAt: '2026-05-01T09:00:00Z' },
  { id: 't6', direction: 'outbound', status: 'settled', amountCents: 75000, currency: 'EUR', counterpartyName: 'Carlos Ruiz', category: 'transfer', reference: 'Freelance work', createdAt: '2026-05-18T16:00:00Z' },
  { id: 't7', direction: 'outbound', status: 'settled', amountCents: 15000, currency: 'EUR', counterpartyName: 'Marie Dupont', category: 'transfer', reference: 'Birthday gift', createdAt: '2026-04-22T10:00:00Z' },
  { id: 't8', direction: 'outbound', status: 'settled', amountCents: 120000, currency: 'EUR', counterpartyName: 'Tech Solutions Ltd', category: 'transfer', reference: 'SaaS license Q2', createdAt: '2026-05-05T08:00:00Z' },
];

const STATUS_LABEL: Record<Transaction['status'], string> = {
  pending: 'Pending',
  settled: 'Completed',
  scheduled: 'Scheduled',
};

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;

    async function load() {
      try {
        const data = await api.getTransactions(undefined, 100);
        const items: Transaction[] = data.items?.length ? data.items : fallbackTransactions;
        const match = items.find((t) => t.id === id) || fallbackTransactions.find((t) => t.id === id) || null;
        if (active) setTransaction(match);
      } catch {
        if (active) setTransaction(fallbackTransactions.find((t) => t.id === id) || null);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id]);

  const isOutbound = transaction?.direction === 'outbound';

  const dateLabel = useMemo(() => {
    if (!transaction) return '';
    return new Date(transaction.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [transaction]);

  const timeLabel = useMemo(() => {
    if (!transaction) return '';
    return new Date(transaction.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }, [transaction]);

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast.success('Copied');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Could not copy');
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
        <div className="w-6 h-6 border-2 border-auriga-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-auriga-bg-subtle">
          <svg className="h-7 w-7 text-auriga-text-secondary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold tracking-tight">Transaction not found</h1>
        <p className="text-sm text-auriga-text-secondary mt-1 mb-6">We couldn&apos;t find the transaction you&apos;re looking for.</p>
        <Button variant="secondary" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const detailRows = [
    { label: 'Type', value: isOutbound ? 'Sent' : 'Received' },
    { label: 'Status', value: STATUS_LABEL[transaction.status] },
    { label: 'Reference', value: transaction.reference || '—' },
    { label: 'Category', value: (transaction.category || 'Other').charAt(0).toUpperCase() + (transaction.category || 'other').slice(1) },
    { label: 'Date', value: dateLabel },
    { label: 'Time', value: timeLabel },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] px-4 py-8 sm:py-12">
      <div className="w-full max-w-xl mx-auto space-y-5">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-auriga-text-secondary hover:text-auriga-text-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-auriga-border/70 p-8 text-center">
          <div className="inline-flex">
            <MerchantLogo name={transaction.counterpartyName} size={64} className="text-xl" />
          </div>
          <p className="text-base font-semibold mt-4">{transaction.counterpartyName}</p>
          <p className={clsx(
            'text-4xl font-semibold mt-3 tabular-nums tracking-tight',
            isOutbound ? 'text-auriga-text-primary' : 'text-auriga-success',
          )}>
            {isOutbound ? '−' : '+'}{formatMoney(transaction.amountCents, transaction.currency)}
          </p>
          <span className={clsx(
            'inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-medium',
            transaction.status === 'pending'
              ? 'bg-auriga-accent/15 text-auriga-accent-700'
              : transaction.status === 'scheduled'
                ? 'bg-auriga-heather-100 text-auriga-heather-600'
                : 'bg-auriga-green-50 text-auriga-green-700',
          )}>
            <span className={clsx(
              'w-1.5 h-1.5 rounded-full',
              transaction.status === 'pending' ? 'bg-auriga-accent-600' : transaction.status === 'scheduled' ? 'bg-auriga-heather-400' : 'bg-auriga-black',
            )} />
            {STATUS_LABEL[transaction.status]}
          </span>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-auriga-border/70 p-5">
          <p className="text-[13px] font-medium uppercase tracking-wider text-auriga-text-secondary mb-2">
            Details
          </p>
          <div className="space-y-0">
            {detailRows.map((row) => (
              <div key={row.label} className="flex justify-between items-center gap-4 py-3 border-b border-auriga-border/40 last:border-0">
                <span className="text-sm text-auriga-text-secondary">{row.label}</span>
                <span className="text-sm font-medium text-auriga-text-primary text-right">{row.value}</span>
              </div>
            ))}
            {transaction.counterpartyIban && (
              <div className="flex justify-between items-center gap-4 py-3 border-t border-auriga-border/40">
                <span className="text-sm text-auriga-text-secondary">IBAN</span>
                <button
                  onClick={() => copy(transaction.counterpartyIban!, 'iban')}
                  className="text-xs font-mono font-medium text-auriga-text-primary text-right hover:text-auriga-accent-700 transition-colors"
                >
                  {copied === 'iban' ? 'Copied!' : transaction.counterpartyIban}
                </button>
              </div>
            )}
            <div className="flex justify-between items-center gap-4 py-3 border-t border-auriga-border/40">
              <span className="text-sm text-auriga-text-secondary">Transaction ID</span>
              <button
                onClick={() => copy(transaction.id, 'id')}
                className="text-xs font-mono font-medium text-auriga-text-primary text-right hover:text-auriga-accent-700 transition-colors truncate max-w-[60%]"
              >
                {copied === 'id' ? 'Copied!' : transaction.id}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {transaction.paymentId && (
            <Button variant="secondary" className="flex-1" asChild>
              <Link href={`/app/transfer/${transaction.paymentId}` as any}>Track transfer</Link>
            </Button>
          )}
          {isOutbound && (
            <Button className="flex-1" asChild>
              <Link href={`/app/send?name=${encodeURIComponent(transaction.counterpartyName)}${transaction.counterpartyIban ? `&iban=${encodeURIComponent(transaction.counterpartyIban)}` : ''}&amount=${(transaction.amountCents / 100).toFixed(2)}`}>
                Send again
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
