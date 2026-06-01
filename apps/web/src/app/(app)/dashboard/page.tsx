'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatIban, formatMoney } from '@atlas-bank/shared';
import Link from 'next/link';

interface Account {
  id: string;
  iban: string;
  bic: string;
  holderName: string;
  balance: { amount: number; currency: string };
}

interface Transaction {
  id: string;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'settled' | 'rejected' | 'cancelled';
  amountCents: number;
  currency: string;
  counterpartyName: string;
  reference?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Mock data for development
    setAccount({
      id: '1',
      iban: 'FR7630006000011234567890189',
      bic: 'SWNBFR22',
      holderName: 'Alex Johnson',
      balance: { amount: 245000, currency: 'EUR' },
    });
    setTransactions([
      { id: '1', direction: 'inbound', status: 'settled', amountCents: 350000, currency: 'EUR', counterpartyName: 'Acme Corp', reference: 'Invoice #1234', createdAt: '2026-05-30T10:00:00Z' },
      { id: '2', direction: 'outbound', status: 'settled', amountCents: 4500, currency: 'EUR', counterpartyName: 'Netflix', reference: 'Monthly subscription', createdAt: '2026-05-29T08:00:00Z' },
      { id: '3', direction: 'inbound', status: 'pending', amountCents: 120000, currency: 'EUR', counterpartyName: 'Freelance Client', reference: 'May work', createdAt: '2026-05-28T14:00:00Z' },
    ]);
  }, []);

  function copyIban() {
    if (account) {
      navigator.clipboard.writeText(account.iban);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!account) return null;

  return (
    <div className="p-6 sm:p-10 max-w-4xl">
      <h1 className="text-2xl font-medium mb-8">Home</h1>

      {/* Balance card */}
      <div className="bg-white rounded-2xl border border-atlas-border p-6 mb-6">
        <p className="text-sm text-atlas-text-secondary mb-1">Available balance</p>
        <p className="text-4xl font-medium tracking-tight">
          {formatMoney(account.balance.amount, account.balance.currency)}
        </p>
        <div className="flex gap-3 mt-6">
          <Button size="sm" asChild>
            <Link href="/send">Send money</Link>
          </Button>
          <Button variant="secondary" size="sm" onClick={copyIban}>
            {copied ? 'Copied!' : 'Share IBAN'}
          </Button>
        </div>
      </div>

      {/* Account details */}
      <div className="bg-white rounded-2xl border border-atlas-border p-6 mb-6">
        <h2 className="text-sm font-medium text-atlas-text-secondary mb-4">Account details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-atlas-text-secondary uppercase tracking-wide">IBAN</p>
            <p className="font-mono text-sm mt-1">{formatIban(account.iban)}</p>
          </div>
          <div>
            <p className="text-xs text-atlas-text-secondary uppercase tracking-wide">BIC</p>
            <p className="font-mono text-sm mt-1">{account.bic}</p>
          </div>
          <div>
            <p className="text-xs text-atlas-text-secondary uppercase tracking-wide">Account holder</p>
            <p className="text-sm mt-1">{account.holderName}</p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-atlas-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-atlas-text-secondary">Recent transactions</h2>
        </div>

        {transactions.length === 0 ? (
          <p className="text-sm text-atlas-text-secondary py-8 text-center">
            No transactions yet. Share your IBAN to receive your first payment.
          </p>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-atlas-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.direction === 'inbound' ? 'bg-green-50' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-4 h-4 ${tx.direction === 'inbound' ? 'text-atlas-success rotate-180' : 'text-atlas-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.counterpartyName}</p>
                    <p className="text-xs text-atlas-text-secondary">{tx.reference || 'No reference'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${tx.direction === 'inbound' ? 'text-atlas-success' : ''}`}>
                    {tx.direction === 'inbound' ? '+' : '-'}{formatMoney(tx.amountCents)}
                  </p>
                  {tx.status === 'pending' && <Badge variant="warning">Pending</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
