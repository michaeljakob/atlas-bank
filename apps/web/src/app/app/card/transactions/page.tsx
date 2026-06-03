'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MerchantLogo } from '@/components/ui/merchant-logo';
import { api } from '@/lib/api';
import { formatCategory } from '@/lib/merchants';
import { formatMoney } from '@auriga-money/shared';
import { clsx } from 'clsx';

interface CardTransaction {
  id: string;
  direction: 'inbound' | 'outbound';
  status: string;
  amountCents: number;
  currency: string;
  counterpartyName: string;
  reference: string;
  category: string;
  createdAt: string;
}

interface CardInfo {
  id: string;
  last4: string;
  label: string;
  type: string;
}

type Filter = 'all' | 'in' | 'out';

function groupByDate(txs: CardTransaction[]): [string, CardTransaction[]][] {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: Record<string, CardTransaction[]> = {};
  const order: string[] = [];

  for (const tx of txs) {
    const d = new Date(tx.createdAt);
    let key: string;
    if (d.toDateString() === today.toDateString()) key = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) key = 'Yesterday';
    else key = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
    if (!groups[key]) { groups[key] = []; order.push(key); }
    groups[key].push(tx);
  }

  return order.map((k) => [k, groups[k]]);
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 px-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-auriga-bg-subtle" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-auriga-bg-subtle rounded w-36" />
        <div className="h-2.5 bg-auriga-bg-subtle rounded w-20" />
      </div>
      <div className="text-right space-y-1">
        <div className="h-3 bg-auriga-bg-subtle rounded w-16 ml-auto" />
        <div className="h-2.5 bg-auriga-bg-subtle rounded w-10 ml-auto" />
      </div>
    </div>
  );
}

function CardTransactionsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardIdParam = searchParams.get('cardId');

  const [cards, setCards] = useState<CardInfo[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(cardIdParam);
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  // Load card metadata so we can show the header + a card switcher.
  useEffect(() => {
    let active = true;
    api.getCards()
      .then((apiCards) => {
        if (!active || !apiCards) return;
        const mapped: CardInfo[] = apiCards.map((c: any) => ({
          id: c.id,
          last4: c.last4,
          label: c.name || c.label || `${c.type || 'Virtual'} card`,
          type: c.type || 'virtual',
        }));
        setCards(mapped);
        if (!cardIdParam && mapped.length > 0) setActiveCardId(mapped[0].id);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [cardIdParam]);

  // Load the first page of transactions for the active card.
  useEffect(() => {
    if (!activeCardId) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    setTransactions([]);
    setCursor(undefined);
    api.getCardTransactions(activeCardId, undefined, 30)
      .then((res) => {
        if (!active || !res) return;
        setTransactions(res.items || []);
        setHasNextPage(res.hasNextPage);
        setCursor(res.cursor);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [activeCardId]);

  function loadMore() {
    if (!activeCardId || !cursor || loadingMore) return;
    setLoadingMore(true);
    api.getCardTransactions(activeCardId, cursor, 30)
      .then((res) => {
        if (!res) return;
        setTransactions((prev) => [...prev, ...(res.items || [])]);
        setHasNextPage(res.hasNextPage);
        setCursor(res.cursor);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }

  const activeCard = cards.find((c) => c.id === activeCardId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (filter === 'in' && tx.direction !== 'inbound') return false;
      if (filter === 'out' && tx.direction !== 'outbound') return false;
      if (q && !(`${tx.counterpartyName} ${tx.reference} ${tx.category}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [transactions, filter, query]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const totals = useMemo(() => {
    let inCents = 0;
    let outCents = 0;
    for (const tx of transactions) {
      if (tx.direction === 'inbound') inCents += tx.amountCents;
      else outCents += tx.amountCents;
    }
    return { inCents, outCents };
  }, [transactions]);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.push('/app/card')}
        className="flex items-center gap-1.5 text-sm text-auriga-text-secondary hover:text-auriga-text-primary transition-colors mb-5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to card
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-auriga-text-secondary mt-1">
            {activeCard ? `${activeCard.label} · •••• ${activeCard.last4}` : 'All card activity'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-auriga-text-secondary">Spent</p>
          <p className="text-lg font-semibold tabular-nums">{formatMoney(totals.outCents, 'EUR')}</p>
        </div>
      </div>

      {/* Card switcher */}
      {cards.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {cards.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCardId(c.id)}
              className={clsx(
                'flex-shrink-0 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all',
                c.id === activeCardId
                  ? 'border-auriga-text-primary/20 bg-white shadow-card text-auriga-text-primary'
                  : 'border-transparent bg-auriga-bg-subtle/60 hover:bg-auriga-bg-subtle text-auriga-text-secondary'
              )}
            >
              {c.label} · {c.last4}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex gap-1 p-1 bg-auriga-bg-subtle rounded-xl w-fit">
          {(['all', 'in', 'out'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={clsx(
                'px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                filter === tab ? 'bg-white text-auriga-text-primary shadow-sm' : 'text-auriga-text-secondary hover:text-auriga-text-primary'
              )}
            >
              {tab === 'all' ? 'All' : tab === 'in' ? 'In' : 'Out'}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-auriga-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-auriga-border text-sm focus:outline-none focus:border-auriga-accent transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-auriga-border/70 p-4 sm:p-6">
        {loading ? (
          <div className="space-y-0.5">
            {Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-auriga-bg-subtle">
              <svg className="h-7 w-7 text-auriga-text-secondary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <p className="text-sm font-medium">No transactions found</p>
            <p className="text-xs text-auriga-text-secondary mt-1">
              {query || filter !== 'all' ? 'Try adjusting your filters.' : 'Spending on this card will appear here.'}
            </p>
          </div>
        ) : (
          <>
            {grouped.map(([date, txs]) => (
              <div key={date} className="mb-6 last:mb-0">
                <p className="text-[12px] font-medium uppercase tracking-wider text-auriga-text-secondary mb-2">{date}</p>
                <div className="space-y-0.5">
                  {txs.map((tx) => {
                    const inbound = tx.direction === 'inbound';
                    return (
                      <button
                        key={tx.id}
                        onClick={() => router.push(`/app/transactions/${tx.id}` as any)}
                        className="w-full flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl hover:bg-auriga-bg-subtle/50 transition-colors text-left"
                      >
                        <MerchantLogo name={tx.counterpartyName} size={40} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-auriga-text-primary truncate">{tx.counterpartyName}</p>
                            {tx.status === 'pending' && <Badge variant="warning" className="text-[10px] py-0 px-1.5">Pending</Badge>}
                          </div>
                          <p className="text-xs text-auriga-text-secondary truncate">{tx.reference || formatCategory(tx.category)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={clsx('text-sm font-semibold tabular-nums', inbound ? 'text-auriga-success' : 'text-auriga-text-primary')}>
                            {inbound ? '+' : '−'}{formatMoney(tx.amountCents, tx.currency)}
                          </p>
                          <p className="text-[10px] text-auriga-text-secondary">
                            {new Date(tx.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-auriga-text-secondary/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {hasNextPage && (
              <div className="pt-2 flex justify-center">
                <Button variant="secondary" size="sm" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function CardTransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-auriga-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CardTransactionsView />
    </Suspense>
  );
}
