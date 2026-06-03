'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatIban, formatMoney, isValidIban } from '@auriga-money/shared';
import { api, type Jar } from '@/lib/api';
import { MerchantLogo } from '@/components/ui/merchant-logo';
import { CURRENCIES, currencyFlag } from '@/components/ui/currency-select';
import { Flag } from '@/components/ui/flag';
import Link from 'next/link';
import { clsx } from 'clsx';
import { toast } from 'sonner';

const JAR_EMOJIS = ['🫙', '🏖️', '🏠', '🚗', '🎁', '💍', '✈️', '🎓', '🛟', '🐷', '💻', '🎉'];

interface CurrencyAccount {
  currency: string;
  flag: string;
  balanceCents: number;
  details: Record<string, string>;
}

interface Transaction {
  id: string;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'settled' | 'scheduled';
  amountCents: number;
  currency: string;
  counterpartyName: string;
  category: string;
  reference: string;
  createdAt: string;
  paymentId?: string;
}

interface CardInfo {
  last4: string;
  spent: number;
  limit: number;
}

const COUNTRY_CODES: Record<string, string> = {
  EUR: 'eu', USD: 'us', GBP: 'gb', JPY: 'jp', CHF: 'ch',
  AUD: 'au', CAD: 'ca', HKD: 'hk', SGD: 'sg', CNY: 'cn',
};

function flagUrl(currency: string): string {
  const code = COUNTRY_CODES[currency] || 'eu';
  return `/flags/${code}.svg`;
}

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat('en', {
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(cents / 100);
}

const quickActions = [
  { label: 'Send', href: '/app/send', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /> },
  { label: 'Request', href: '/app/request', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /> },
  { label: 'Top up', href: '/app/top-up', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> },
  { label: 'Convert', href: '/app/convert', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /> },
];

const CATEGORY_COLORS: Record<string, string> = {
  subscription: 'bg-auriga-green-700',
  shopping: 'bg-auriga-green-500',
  food: 'bg-auriga-green-300',
  utilities: 'bg-auriga-heather-400',
  salary: 'bg-auriga-accent',
  freelance: 'bg-auriga-black',
  transfer: 'bg-auriga-heather-300',
  other: 'bg-auriga-heather-200',
};

function groupByDate(txs: Transaction[]): Record<string, Transaction[]> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return txs.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const d = new Date(tx.createdAt);
    let key: string;
    if (d.toDateString() === today.toDateString()) key = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) key = 'Yesterday';
    else key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    (acc[key] ||= []).push(tx);
    return acc;
  }, {});
}

function TransactionDetailPanel({ tx, onClose }: { tx: Transaction | null; onClose: () => void }) {
  if (!tx) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-auriga-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Transaction details</h2>
          <button onClick={onClose} className="p-2 -m-2 rounded-xl hover:bg-auriga-bg-subtle transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="text-center py-4">
            <div className="inline-flex"><MerchantLogo name={tx.counterpartyName} size={36} /></div>
            <p className="text-base font-semibold mt-3">{tx.counterpartyName}</p>
            <p className={clsx('text-3xl font-semibold mt-2 tabular-nums', tx.direction === 'inbound' ? 'text-auriga-success' : 'text-auriga-text-primary')}>
              {tx.direction === 'inbound' ? '+' : '−'}{formatMoney(tx.amountCents, tx.currency)}
            </p>
            <Badge variant={tx.status === 'pending' ? 'warning' : 'default'} className="mt-2">{tx.status === 'pending' ? 'Pending' : 'Completed'}</Badge>
          </div>
          <div className="bg-auriga-bg-subtle rounded-2xl p-4 space-y-3">
            {[
              { label: 'Type', value: tx.direction === 'inbound' ? 'Received' : 'Sent' },
              { label: 'Reference', value: tx.reference || '—' },
              { label: 'Category', value: (tx.category || 'Other').charAt(0).toUpperCase() + (tx.category || 'other').slice(1) },
              { label: 'Date', value: new Date(tx.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
              { label: 'Time', value: new Date(tx.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-xs text-auriga-text-secondary">{row.label}</span>
                <span className="text-sm font-medium text-auriga-text-primary">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 px-3 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-auriga-bg-subtle" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-auriga-bg-subtle rounded w-32" />
        <div className="h-2.5 bg-auriga-bg-subtle rounded w-20" />
      </div>
      <div className="text-right space-y-1">
        <div className="h-3 bg-auriga-bg-subtle rounded w-16 ml-auto" />
        <div className="h-2.5 bg-auriga-bg-subtle rounded w-10 ml-auto" />
      </div>
    </div>
  );
}

function toCents(value: string): number {
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function CreateJarModal({
  accounts,
  onClose,
  onCreated,
  adjustHubBalance,
}: {
  accounts: CurrencyAccount[];
  onClose: () => void;
  onCreated: (jar: Jar) => void;
  adjustHubBalance: (currency: string, delta: number) => void;
}) {
  const ownedCurrencies = accounts.map(a => a.currency);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(JAR_EMOJIS[0]);
  const [currency, setCurrency] = useState(ownedCurrencies[0] ?? 'EUR');
  const [target, setTarget] = useState('');
  const [deposit, setDeposit] = useState('');
  const [saving, setSaving] = useState(false);

  const available = accounts.find(a => a.currency === currency)?.balanceCents ?? 0;
  const depositCents = toCents(deposit);
  const tooMuch = depositCents > available;

  async function submit() {
    if (!name.trim() || saving) return;
    if (tooMuch) {
      toast.error('Deposit exceeds available balance');
      return;
    }
    setSaving(true);
    try {
      const jar = await api.createJar({
        name: name.trim(),
        currency,
        emoji,
        targetCents: toCents(target) || undefined,
        initialDepositCents: depositCents || undefined,
      });
      if (depositCents > 0) adjustHubBalance(currency, -depositCents);
      onCreated(jar);
      toast.success(`Jar "${jar.name}" created`);
      onClose();
    } catch (e: any) {
      toast.error(e?.message || 'Could not create jar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => !saving && onClose()} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="px-6 pt-6 pb-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">New jar</h2>
            <p className="text-sm text-auriga-text-secondary mt-0.5">Ring-fence money for a goal.</p>
          </div>
          <button onClick={() => !saving && onClose()} className="p-2 -m-2 rounded-xl hover:bg-auriga-bg-subtle transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 pt-3 space-y-5">
          {ownedCurrencies.length === 0 ? (
            <p className="text-sm text-auriga-text-secondary py-4">
              Open a currency account first — a jar needs a currency hub to draw from.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-auriga-bg-subtle flex items-center justify-center text-2xl">{emoji}</div>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="Jar name (e.g. Holiday)"
                  className="flex-1 px-3 py-2.5 rounded-xl border border-auriga-border text-sm focus:outline-none focus:border-auriga-accent transition-colors"
                  maxLength={40}
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {JAR_EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={clsx(
                      'w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors',
                      emoji === e ? 'bg-auriga-accent/15 ring-1 ring-auriga-accent/40' : 'hover:bg-auriga-bg-subtle',
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-medium text-auriga-text-secondary uppercase tracking-wider">Currency</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {ownedCurrencies.map(c => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={clsx(
                        'inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-full border text-sm font-medium transition-all',
                        currency === c ? 'border-auriga-accent bg-auriga-accent/5' : 'border-auriga-border hover:border-auriga-heather-300',
                      )}
                    >
                      <Flag code={currencyFlag(c)} className="w-5 h-5" />
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-auriga-text-secondary uppercase tracking-wider">Goal (optional)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={target}
                    onChange={e => setTarget(e.target.value)}
                    placeholder="0.00"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-auriga-border text-sm focus:outline-none focus:border-auriga-accent transition-colors tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-auriga-text-secondary uppercase tracking-wider">Initial deposit</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={deposit}
                    onChange={e => setDeposit(e.target.value)}
                    placeholder="0.00"
                    className={clsx(
                      'w-full mt-1 px-3 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors tabular-nums',
                      tooMuch ? 'border-auriga-error focus:border-auriga-error' : 'border-auriga-border focus:border-auriga-accent',
                    )}
                  />
                </div>
              </div>
              <p className="text-[11px] text-auriga-text-secondary -mt-2">
                {formatAmount(available, currency)} {currency} available in your hub
              </p>

              <Button onClick={submit} disabled={!name.trim() || saving || tooMuch} className="w-full rounded-xl font-semibold" size="lg">
                {saving ? 'Creating…' : 'Create jar'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ManageJarModal({
  jar,
  available,
  onClose,
  onChanged,
  onDeleted,
  adjustHubBalance,
}: {
  jar: Jar;
  available: number;
  onClose: () => void;
  onChanged: (jar: Jar) => void;
  onDeleted: (jarId: string, returnedCents: number, currency: string) => void;
  adjustHubBalance: (currency: string, delta: number) => void;
}) {
  const [mode, setMode] = useState<'in' | 'out'>('in');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const cents = toCents(amount);
  const max = mode === 'in' ? available : jar.balanceCents;
  const invalid = cents <= 0 || cents > max;

  async function move() {
    if (invalid || busy) return;
    setBusy(true);
    try {
      const updated = await api.moveJarFunds(jar.id, cents, mode);
      adjustHubBalance(jar.currency, mode === 'in' ? -cents : cents);
      onChanged(updated);
      toast.success(mode === 'in' ? 'Money added to jar' : 'Money returned to account');
      setAmount('');
    } catch (e: any) {
      toast.error(e?.message || 'Transfer failed');
    } finally {
      setBusy(false);
    }
  }

  async function destroy() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await api.deleteJar(jar.id);
      adjustHubBalance(jar.currency, res.returnedCents);
      onDeleted(jar.id, res.returnedCents, jar.currency);
      toast.success('Jar closed');
      onClose();
    } catch (e: any) {
      toast.error(e?.message || 'Could not close jar');
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => !busy && onClose()} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="px-6 pt-6 pb-2 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-auriga-bg-subtle flex items-center justify-center text-xl">{jar.emoji || '🫙'}</div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight truncate">{jar.name}</h2>
              <p className="text-sm text-auriga-text-secondary tabular-nums">
                {formatAmount(jar.balanceCents, jar.currency)} {jar.currency}
                {jar.targetCents ? ` of ${formatAmount(jar.targetCents, jar.currency)}` : ''}
              </p>
            </div>
          </div>
          <button onClick={() => !busy && onClose()} className="p-2 -m-2 rounded-xl hover:bg-auriga-bg-subtle transition-colors flex-shrink-0" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 pt-3 space-y-4">
          <div className="flex gap-1 p-1 bg-auriga-bg-subtle rounded-xl">
            {(['in', 'out'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setAmount(''); }}
                className={clsx(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                  mode === m ? 'bg-white text-auriga-text-primary shadow-sm' : 'text-auriga-text-secondary hover:text-auriga-text-primary',
                )}
              >
                {m === 'in' ? 'Add money' : 'Withdraw'}
              </button>
            ))}
          </div>

          <div>
            <input
              autoFocus
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && move()}
              placeholder="0.00"
              className="w-full px-3 py-3 rounded-xl border border-auriga-border text-lg font-semibold tabular-nums focus:outline-none focus:border-auriga-accent transition-colors"
            />
            <p className="text-[11px] text-auriga-text-secondary mt-1.5">
              {mode === 'in'
                ? `${formatAmount(available, jar.currency)} ${jar.currency} available in hub`
                : `${formatAmount(jar.balanceCents, jar.currency)} ${jar.currency} in this jar`}
            </p>
          </div>

          <Button onClick={move} disabled={invalid || busy} className="w-full rounded-xl font-semibold" size="lg">
            {busy ? 'Working…' : mode === 'in' ? 'Add to jar' : 'Move to account'}
          </Button>

          <div className="pt-2 border-t border-auriga-border">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button onClick={destroy} disabled={busy} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-auriga-error/10 text-auriga-error hover:bg-auriga-error/20 transition-colors">
                  Close jar & return {formatAmount(jar.balanceCents, jar.currency)}
                </button>
                <button onClick={() => setConfirmDelete(false)} disabled={busy} className="px-4 py-2.5 rounded-xl text-sm font-medium text-auriga-text-secondary hover:bg-auriga-bg-subtle transition-colors">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="text-sm text-auriga-text-secondary hover:text-auriga-error transition-colors">
                Close this jar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [expandedCurrency, setExpandedCurrency] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [txFilter, setTxFilter] = useState<'all' | 'in' | 'out'>('all');
  const [mounted, setMounted] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [accounts, setAccounts] = useState<CurrencyAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [card, setCard] = useState<CardInfo | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [openingCurrency, setOpeningCurrency] = useState<string | null>(null);
  const [jars, setJars] = useState<Jar[]>([]);
  const [showCreateJar, setShowCreateJar] = useState(false);
  const [manageJar, setManageJar] = useState<Jar | null>(null);
  const [activeTransfers, setActiveTransfers] = useState<{
    id: string;
    creditorName: string;
    amountCents: number;
    status: string;
    createdAt: string;
  }[]>([]);

  useEffect(() => {
    setMounted(true);
    loadData();
    loadActiveTransfers();
  }, []);

  function loadActiveTransfers() {
    try {
      const stored = localStorage.getItem('auriga_active_transfers');
      if (stored) setActiveTransfers(JSON.parse(stored));
    } catch {}
  }

  async function loadData() {
    try {
      const [accts, txData, cards, jarData] = await Promise.all([
        api.getAllAccounts().catch(() => null),
        api.getTransactions(undefined, 50).catch(() => null),
        api.getCards().catch(() => null),
        api.getJars().catch(() => null),
      ]);
      if (jarData) setJars(jarData);
      if (accts) {
        setAccounts(accts.map(a => ({
          currency: a.currency,
          flag: COUNTRY_CODES[a.currency] || 'xx',
          balanceCents: a.balance.amount,
          details: {
            ...(a.holderName ? { 'Account holder': a.holderName } : {}),
            ...(a.iban ? { IBAN: a.iban } : {}),
            ...(a.bic ? { BIC: a.bic } : {}),
          },
        })));
      }
      if (txData?.items) {
        setTransactions(txData.items.map((tx: any) => ({
          id: tx.id,
          direction: tx.direction,
          status: tx.status,
          amountCents: Number(tx.amountCents),
          currency: tx.currency,
          counterpartyName: tx.counterpartyName,
          category: tx.category || 'other',
          reference: tx.reference || '',
          createdAt: tx.createdAt,
        })));
      }
      if (cards && cards.length > 0) {
        const primary = cards[0];
        const limit = primary.spendingLimit?.amount ?? 0;
        setCard({ last4: primary.last4, spent: 0, limit });
      }
    } catch {
      // Leave empty states in place when the API is unavailable.
    } finally {
      setLoadingData(false);
    }
  }

  const jarsTotal = jars.reduce((sum, j) => sum + j.balanceCents, 0);
  const totalWealth = accounts.reduce((sum, acc) => sum + acc.balanceCents, 0) + jarsTotal;

  const filtered = transactions.filter(tx => {
    if (txFilter === 'in') return tx.direction === 'inbound';
    if (txFilter === 'out') return tx.direction === 'outbound';
    return true;
  });

  const grouped = groupByDate(filtered);
  const outbound = transactions.filter(tx => tx.direction === 'outbound' && tx.status === 'settled');
  const totalSpent = outbound.reduce((s, tx) => s + tx.amountCents, 0);

  const spendingCategories = Object.entries(
    outbound.reduce<Record<string, number>>((acc, tx) => {
      const cat = tx.category || 'other';
      acc[cat] = (acc[cat] || 0) + tx.amountCents;
      return acc;
    }, {})
  ).map(([cat, amount]) => ({
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    amount,
    color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.other,
  })).sort((a, b) => b.amount - a.amount);

  function copyDetail(val: string, key: string) {
    navigator.clipboard.writeText(val.replace(/\s/g, ''));
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const ownedCurrencies = new Set(accounts.map(a => a.currency));
  const availableCurrencies = CURRENCIES.filter(c => !ownedCurrencies.has(c.code));

  async function handleOpenAccount(currency: string) {
    if (openingCurrency) return;
    setOpeningCurrency(currency);
    try {
      const acct = await api.openAccount(currency);
      setAccounts(prev => [
        ...prev,
        {
          currency: acct.currency,
          flag: COUNTRY_CODES[acct.currency] || 'xx',
          balanceCents: acct.balance.amount,
          details: {
            ...(acct.holderName ? { 'Account holder': acct.holderName } : {}),
            ...(acct.iban ? { IBAN: acct.iban } : {}),
            ...(acct.bic ? { BIC: acct.bic } : {}),
          },
        },
      ]);
      toast.success(`${currency} account opened`);
      setShowAddAccount(false);
    } catch (e: any) {
      toast.error(e?.message || 'Could not open account');
    } finally {
      setOpeningCurrency(null);
    }
  }

  function upsertJar(jar: Jar) {
    setJars(prev => {
      const idx = prev.findIndex(j => j.id === jar.id);
      if (idx === -1) return [...prev, jar];
      const next = [...prev];
      next[idx] = jar;
      return next;
    });
  }

  function adjustHubBalance(currency: string, deltaCents: number) {
    setAccounts(prev =>
      prev.map(a => (a.currency === currency ? { ...a, balanceCents: a.balanceCents + deltaCents } : a)),
    );
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-auriga-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[1120px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Total Wealth + Currency Buckets */}
          <div className="bg-white rounded-2xl border border-auriga-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-6 sm:p-8">
              <p className="text-[13px] font-medium text-auriga-text-secondary uppercase tracking-wider mb-2">Total wealth</p>
              <p className="text-4xl sm:text-5xl font-semibold tracking-tight text-auriga-text-primary">
                {formatMoney(totalWealth, 'EUR')}
              </p>
              <p className="text-xs text-auriga-text-secondary mt-1">{accounts.length} currenc{accounts.length === 1 ? 'y' : 'ies'}</p>

              {/* Currency buckets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
                {accounts.map((acc, i) => {
                  const isExpanded = expandedCurrency === i;
                  return (
                    <button
                      key={acc.currency}
                      onClick={() => setExpandedCurrency(isExpanded ? null : i)}
                      className={clsx(
                        'text-left px-4 py-3 rounded-xl border transition-all duration-200 min-w-0',
                        isExpanded
                          ? 'border-auriga-accent bg-auriga-accent/5 ring-1 ring-auriga-accent/30'
                          : 'border-auriga-border hover:border-auriga-heather-300 hover:bg-auriga-heather-50'
                      )}
                    >
                      <img src={flagUrl(acc.currency)} alt={acc.currency} className="w-6 h-6 rounded-full" />
                      <p className="text-[13px] font-semibold text-auriga-text-primary mt-1 tabular-nums truncate">
                        {formatAmount(acc.balanceCents, acc.currency)}
                      </p>
                      <p className="text-[11px] text-auriga-text-secondary">{acc.currency}</p>
                    </button>
                  );
                })}

                {availableCurrencies.length > 0 && (
                  <button
                    onClick={() => setShowAddAccount(true)}
                    className="text-left px-4 py-3 rounded-xl border border-dashed border-auriga-border hover:border-auriga-accent hover:bg-auriga-accent/5 transition-all duration-200 min-w-0 flex flex-col items-start justify-center gap-1 group"
                    aria-label="Add a new currency account"
                  >
                    <span className="w-6 h-6 rounded-full bg-auriga-accent/15 group-hover:bg-auriga-accent/25 flex items-center justify-center transition-colors">
                      <svg className="w-3.5 h-3.5 text-auriga-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </span>
                    <p className="text-[13px] font-semibold text-auriga-text-primary mt-1">Add</p>
                    <p className="text-[11px] text-auriga-text-secondary">Currency</p>
                  </button>
                )}
              </div>

              {/* Expanded bank details */}
              <div className={clsx(
                'overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                expandedCurrency !== null ? 'max-h-[400px] opacity-100 mt-5' : 'max-h-0 opacity-0 mt-0'
              )}>
                {expandedCurrency !== null && (
                  <div className="bg-auriga-bg-subtle rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <img src={flagUrl(accounts[expandedCurrency].currency)} alt={accounts[expandedCurrency].currency} className="w-5 h-5 rounded-full" />
                      <p className="text-sm font-semibold text-auriga-text-primary">{accounts[expandedCurrency].currency} Account details</p>
                    </div>
                    <div className="space-y-2.5">
                      {Object.entries(accounts[expandedCurrency].details).map(([key, val]) => {
                        const displayVal = key === 'IBAN' && isValidIban(val) ? formatIban(val) : val;
                        const copyKey = `${expandedCurrency}-${key}`;
                        return (
                          <div key={key} className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-[10px] font-medium text-auriga-text-secondary uppercase tracking-wider">{key}</p>
                              <p className="font-mono text-sm text-auriga-text-primary truncate">{displayVal}</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); copyDetail(val, copyKey); }}
                              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white transition-colors"
                              title={`Copy ${key}`}
                            >
                              {copied === copyKey ? (
                                <svg className="w-3.5 h-3.5 text-auriga-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5 text-auriga-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                </svg>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="flex gap-4 mt-8">
                {quickActions.map(action => (
                  <Link key={action.label} href={action.href as any} className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 rounded-2xl bg-auriga-accent/15 flex items-center justify-center group-hover:bg-auriga-accent/30 transition-colors">
                      <svg className="w-5 h-5 text-auriga-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        {action.icon}
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-auriga-text-secondary group-hover:text-auriga-text-primary transition-colors">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Jars */}
          <div className="bg-white rounded-2xl border border-auriga-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[13px] font-medium text-auriga-text-secondary uppercase tracking-wider">Jars</p>
                <p className="text-xs text-auriga-text-secondary mt-0.5">Set money aside for your goals</p>
              </div>
              <button
                onClick={() => setShowCreateJar(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-auriga-accent-700 hover:text-auriga-accent transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New jar
              </button>
            </div>

            {jars.length === 0 ? (
              <button
                onClick={() => setShowCreateJar(true)}
                className="w-full py-8 rounded-xl border border-dashed border-auriga-border hover:border-auriga-accent hover:bg-auriga-accent/5 transition-all flex flex-col items-center gap-2 group"
              >
                <span className="text-2xl">🫙</span>
                <span className="text-sm font-medium text-auriga-text-primary">Create your first jar</span>
                <span className="text-xs text-auriga-text-secondary">Save for a holiday, a deposit, a rainy day…</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {jars.map(jar => {
                  const pct = jar.targetCents && jar.targetCents > 0
                    ? Math.min((jar.balanceCents / jar.targetCents) * 100, 100)
                    : null;
                  return (
                    <button
                      key={jar.id}
                      onClick={() => setManageJar(jar)}
                      className="text-left p-4 rounded-xl border border-auriga-border hover:border-auriga-heather-300 hover:bg-auriga-heather-50 transition-all min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg leading-none">{jar.emoji || '🫙'}</span>
                        <img src={flagUrl(jar.currency)} alt={jar.currency} className="w-4 h-4 rounded-full" />
                      </div>
                      <p className="text-sm font-medium text-auriga-text-primary truncate mt-2">{jar.name}</p>
                      <p className="text-[15px] font-semibold tabular-nums text-auriga-text-primary mt-0.5">
                        {formatAmount(jar.balanceCents, jar.currency)} <span className="text-[11px] font-normal text-auriga-text-secondary">{jar.currency}</span>
                      </p>
                      {pct !== null && (
                        <div className="mt-2">
                          <div className="h-1 bg-auriga-bg-subtle rounded-full overflow-hidden">
                            <div className="h-full bg-auriga-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-auriga-text-secondary mt-1 tabular-nums">
                            {Math.round(pct)}% of {formatAmount(jar.targetCents!, jar.currency)}
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Transfers */}
          {activeTransfers.length > 0 && (
            <div className="bg-white rounded-2xl border border-auriga-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <p className="text-[13px] font-medium text-auriga-text-secondary uppercase tracking-wider mb-4">Scheduled</p>
              <div className="space-y-3">
                {activeTransfers.map(t => (
                  <Link
                    key={t.id}
                    href={`/app/transfer/${t.id}` as any}
                    className="flex items-center gap-3 p-3 -mx-3 rounded-xl hover:bg-auriga-bg-subtle/50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-auriga-accent/15 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-auriga-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-auriga-text-primary truncate">
                          To {t.creditorName}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-auriga-accent/15 text-auriga-accent-700">
                          Scheduled
                        </span>
                      </div>
                      <p className="text-xs text-auriga-text-secondary">
                        Should arrive within seconds
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold tabular-nums text-auriga-text-primary">
                        −{formatMoney(t.amountCents)}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-auriga-text-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Transactions */}
          <div className="bg-white rounded-2xl border border-auriga-border shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="p-6 pb-0">
              <p className="text-[13px] font-medium text-auriga-text-secondary uppercase tracking-wider mb-4">Transactions</p>
              <div className="flex gap-1 p-1 bg-auriga-bg-subtle rounded-xl w-fit">
                {(['all', 'in', 'out'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setTxFilter(tab)}
                    className={clsx(
                      'px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                      txFilter === tab
                        ? 'bg-white text-auriga-text-primary shadow-sm'
                        : 'text-auriga-text-secondary hover:text-auriga-text-primary'
                    )}
                  >
                    {tab === 'all' ? 'All' : tab === 'in' ? 'In' : 'Out'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 pt-4">
              {loadingData && transactions.length === 0 && (
                <div className="space-y-0.5">
                  {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
                </div>
              )}
              {Object.entries(grouped).map(([date, txs]) => (
                <div key={date} className="mb-6 last:mb-0">
                  <p className="text-[13px] font-medium text-auriga-text-secondary uppercase tracking-wider mb-3">{date}</p>
                  <div className="space-y-0.5">
                    {txs.map(tx => (
                      <div key={tx.id} onClick={() => setSelectedTx(tx)} className="flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl hover:bg-auriga-bg-subtle/50 transition-colors cursor-pointer">
                        <MerchantLogo name={tx.counterpartyName} size={36} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-auriga-text-primary truncate">{tx.counterpartyName}</p>
                            {tx.status === 'pending' && <Badge variant="warning" className="text-[10px] py-0 px-1.5">Pending</Badge>}
                          </div>
                          <p className="text-xs text-auriga-text-secondary truncate">{tx.reference}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={clsx('text-sm font-semibold tabular-nums', tx.direction === 'inbound' ? 'text-auriga-success' : 'text-auriga-text-primary')}>
                            {tx.direction === 'inbound' ? '+' : '−'}{formatMoney(tx.amountCents, tx.currency)}
                          </p>
                          <p className="text-[10px] text-auriga-text-secondary">
                            {new Date(tx.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-sm text-auriga-text-secondary">No transactions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Card widget */}
          <div className="bg-white rounded-2xl border border-auriga-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-medium text-auriga-text-secondary uppercase tracking-wider">Card</p>
              <Link href="/app/card" className="text-xs text-auriga-text-secondary hover:text-auriga-text-primary transition-colors">Manage</Link>
            </div>
            <div className="bg-auriga-black rounded-xl p-4 aspect-[1.7/1] flex flex-col justify-between mb-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-widest text-white/60">Auriga</span>
                <svg className="w-8 h-5" viewBox="0 0 48 30" fill="none">
                  <circle cx="15" cy="15" r="15" fill="#EB001B" opacity="0.9" />
                  <circle cx="33" cy="15" r="15" fill="#F79E1B" opacity="0.9" />
                </svg>
              </div>
              <p className="font-mono text-sm tracking-widest text-white/80">•••• {card?.last4 ?? '••••'}</p>
            </div>
            {card && card.limit > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-auriga-text-secondary">Spent this month</span>
                  <span className="text-xs font-medium text-auriga-text-primary">{formatMoney(card.spent)} / {formatMoney(card.limit)}</span>
                </div>
                <div className="h-1.5 bg-auriga-bg-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-auriga-accent rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((card.spent / card.limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-auriga-text-secondary">No spending limit set</p>
            )}
          </div>

          {/* Spending insights */}
          <div className="bg-white rounded-2xl border border-auriga-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
            <p className="text-[13px] font-medium text-auriga-text-secondary uppercase tracking-wider mb-4">Spending</p>
            {spendingCategories.length === 0 && (
              <p className="text-xs text-auriga-text-secondary">No spending yet this period.</p>
            )}
            <div className="space-y-3">
              {spendingCategories.map(cat => {
                const pct = totalSpent > 0 ? (cat.amount / totalSpent) * 100 : 0;
                return (
                  <div key={cat.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-auriga-text-primary">{cat.label}</span>
                      <span className="text-xs text-auriga-text-secondary tabular-nums">{formatMoney(cat.amount)}</span>
                    </div>
                    <div className="h-1 bg-auriga-bg-subtle rounded-full overflow-hidden">
                      <div className={clsx('h-full rounded-full', cat.color)} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <TransactionDetailPanel tx={selectedTx} onClose={() => setSelectedTx(null)} />

      {showCreateJar && (
        <CreateJarModal
          accounts={accounts}
          onClose={() => setShowCreateJar(false)}
          onCreated={upsertJar}
          adjustHubBalance={adjustHubBalance}
        />
      )}

      {manageJar && (
        <ManageJarModal
          jar={jars.find(j => j.id === manageJar.id) ?? manageJar}
          available={accounts.find(a => a.currency === manageJar.currency)?.balanceCents ?? 0}
          onClose={() => setManageJar(null)}
          onChanged={upsertJar}
          onDeleted={(jarId) => {
            setJars(prev => prev.filter(j => j.id !== jarId));
            setManageJar(null);
          }}
          adjustHubBalance={adjustHubBalance}
        />
      )}

      {showAddAccount && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => !openingCurrency && setShowAddAccount(false)} />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-auriga-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">Open a new account</h2>
                  <p className="text-sm text-auriga-text-secondary mt-0.5">
                    Add a currency jar with its own balance and IBAN.
                  </p>
                </div>
                <button
                  onClick={() => !openingCurrency && setShowAddAccount(false)}
                  className="p-2 -m-2 rounded-xl hover:bg-auriga-bg-subtle transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-3 overflow-y-auto">
              {availableCurrencies.length === 0 ? (
                <p className="py-10 text-center text-sm text-auriga-text-secondary">
                  You already hold every supported currency.
                </p>
              ) : (
                <div className="space-y-1">
                  {availableCurrencies.map(c => {
                    const isOpening = openingCurrency === c.code;
                    return (
                      <button
                        key={c.code}
                        onClick={() => handleOpenAccount(c.code)}
                        disabled={!!openingCurrency}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left hover:bg-auriga-bg-subtle/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Flag code={currencyFlag(c.code)} name={c.name} className="w-9 h-9 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-auriga-text-primary">{c.code} <span className="text-auriga-text-secondary font-normal">· {c.name}</span></p>
                          <p className="text-xs text-auriga-text-secondary">No fees to open · Get a dedicated IBAN</p>
                        </div>
                        {isOpening ? (
                          <div className="w-5 h-5 border-2 border-auriga-accent border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        ) : (
                          <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-auriga-accent/15 text-auriga-accent-700">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
