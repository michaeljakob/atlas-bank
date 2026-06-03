'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CountrySelect, getCountry } from '@/components/ui/country-select';
import { Flag } from '@/components/ui/flag';
import { api } from '@/lib/api';
import { isValidIban, formatIban, formatMoney } from '@auriga-money/shared';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import Link from 'next/link';

const SPRING = 'duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]';

interface Recipient {
  id: string;
  name: string;
  iban: string;
  bank: string;
  bic: string;
  country: string;
  email: string;
  phone: string;
  notes: string;
  lastTransfer: string;
  isFavorite: boolean;
  createdAt: string;
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

const fallbackRecipients: Recipient[] = [
  { id: '1', name: 'Sarah Miller', iban: 'DE89370400440532013000', bank: 'Deutsche Bank', bic: '', country: 'DE', email: '', phone: '', notes: '', lastTransfer: '2 days ago', isFavorite: true, createdAt: '2026-01-15T10:00:00Z' },
  { id: '2', name: 'Acme Corp', iban: 'GB29NWBK60161331926819', bank: 'NatWest', bic: '', country: 'GB', email: '', phone: '', notes: '', lastTransfer: '1 week ago', isFavorite: true, createdAt: '2025-11-01T10:00:00Z' },
  { id: '3', name: 'Carlos Ruiz', iban: 'ES9121000418450200051332', bank: 'CaixaBank', bic: '', country: 'ES', email: '', phone: '', notes: '', lastTransfer: '2 weeks ago', isFavorite: false, createdAt: '2026-02-20T10:00:00Z' },
  { id: '4', name: 'Marie Dupont', iban: 'FR7630006000011234567890189', bank: 'BNP Paribas', bic: '', country: 'FR', email: '', phone: '', notes: '', lastTransfer: '1 month ago', isFavorite: false, createdAt: '2025-12-10T10:00:00Z' },
  { id: '5', name: 'Tech Solutions Ltd', iban: 'NL91ABNA0417164300', bank: 'ABN AMRO', bic: '', country: 'NL', email: '', phone: '', notes: '', lastTransfer: '3 weeks ago', isFavorite: false, createdAt: '2026-03-05T10:00:00Z' },
];

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

const AVATAR_COLORS = [
  { bg: 'bg-auriga-green-50', text: 'text-auriga-green-700' },
  { bg: 'bg-auriga-accent-50', text: 'text-auriga-accent-700' },
  { bg: 'bg-auriga-heather-100', text: 'text-auriga-heather-600' },
  { bg: 'bg-auriga-green-100', text: 'text-auriga-green-800' },
  { bg: 'bg-auriga-heather-200', text: 'text-auriga-text-primary' },
  { bg: 'bg-auriga-green-50', text: 'text-auriga-black' },
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export default function RecipientsPage() {
  const [search, setSearch] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>(fallbackRecipients);
  const [transactions, setTransactions] = useState<Transaction[]>(fallbackTransactions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [addForm, setAddForm] = useState({ name: '', iban: '', country: '', bank: '', bic: '', email: '', phone: '', notes: '' });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    api.getRecipients().then(data => {
      if (data.length > 0) {
        setRecipients(data.map(r => ({
          id: r.id,
          name: r.name,
          iban: r.iban,
          bank: r.bank || '',
          bic: r.bic || '',
          country: r.country || '',
          email: r.email || '',
          phone: r.phone || '',
          notes: r.notes || '',
          lastTransfer: formatRelative(r.createdAt),
          isFavorite: r.isFavorite,
          createdAt: r.createdAt,
        })));
      }
    }).catch(() => {});

    api.getTransactions(undefined, 50).then(data => {
      if (data.items?.length > 0) setTransactions(data.items);
    }).catch(() => {});
  }, []);

  const selected = useMemo(() => recipients.find(r => r.id === selectedId), [recipients, selectedId]);

  const recipientTransactions = useMemo(() => {
    if (!selected) return [];
    return transactions
      .filter(t => t.counterpartyName.toLowerCase() === selected.name.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [selected, transactions]);

  const totalSent = useMemo(() => {
    return recipientTransactions
      .filter(t => t.direction === 'outbound' && t.status === 'settled')
      .reduce((sum, t) => sum + t.amountCents, 0);
  }, [recipientTransactions]);

  const totalReceived = useMemo(() => {
    return recipientTransactions
      .filter(t => t.direction === 'inbound' && t.status === 'settled')
      .reduce((sum, t) => sum + t.amountCents, 0);
  }, [recipientTransactions]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidIban(addForm.iban)) {
      toast.error('Invalid IBAN');
      return;
    }
    setAddLoading(true);
    try {
      const r = await api.createRecipient(addForm);
      const now = new Date().toISOString();
      setRecipients(prev => [...prev, { ...addForm, id: r.id, lastTransfer: 'Just now', isFavorite: false, createdAt: now }]);
      setShowAddModal(false);
      setAddForm({ name: '', iban: '', country: '', bank: '', bic: '', email: '', phone: '', notes: '' });
      toast.success('Recipient added');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add recipient');
    } finally {
      setAddLoading(false);
    }
  }

  async function handleToggleFavorite(id: string, current: boolean) {
    try {
      await api.updateRecipient(id, { isFavorite: !current });
      setRecipients(prev => prev.map(r => r.id === id ? { ...r, isFavorite: !current } : r));
    } catch {
      setRecipients(prev => prev.map(r => r.id === id ? { ...r, isFavorite: !current } : r));
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteRecipient(id);
      setRecipients(prev => prev.filter(r => r.id !== id));
      if (selectedId === id) setSelectedId(null);
      toast.success('Recipient removed');
    } catch {
      setRecipients(prev => prev.filter(r => r.id !== id));
      if (selectedId === id) setSelectedId(null);
    }
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRecipient) return;
    try {
      await api.updateRecipient(editingRecipient.id, {
        name: editingRecipient.name,
        country: editingRecipient.country,
        bank: editingRecipient.bank,
        bic: editingRecipient.bic,
        email: editingRecipient.email,
        phone: editingRecipient.phone,
        notes: editingRecipient.notes,
      });
      setRecipients(prev => prev.map(r => r.id === editingRecipient.id ? editingRecipient : r));
      setEditingRecipient(null);
      toast.success('Recipient updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    }
  }

  const query = search.toLowerCase();
  const filtered = recipients.filter(
    (r) => r.name.toLowerCase().includes(query) || r.bank.toLowerCase().includes(query) || r.iban.toLowerCase().includes(query)
  );
  const favorites = filtered.filter((r) => r.isFavorite);
  const all = filtered.filter((r) => !r.isFavorite);

  return (
    <div className="flex h-[calc(100vh-5rem)] md:h-screen overflow-hidden">
      {/* List panel */}
      <div className={clsx(
        'flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 transition-all',
        selected && 'hidden md:block md:max-w-md lg:max-w-lg md:border-r md:border-auriga-border/50',
      )}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Recipients</h1>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-auriga-text-secondary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, bank, or IBAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-auriga-border/70 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-auriga-text-secondary/40 focus:border-auriga-border focus:outline-none transition-colors"
          />
        </div>

        {/* Recipient list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-auriga-bg-subtle">
              <svg className="h-7 w-7 text-auriga-text-secondary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="text-sm text-auriga-text-secondary">No recipients found</p>
          </div>
        ) : (
          <div className="space-y-5">
            {favorites.length > 0 && (
              <section>
                <h2 className="mb-2 px-1 text-[13px] font-medium uppercase tracking-wider text-auriga-text-secondary">
                  Favorites
                </h2>
                <div className="overflow-hidden rounded-2xl border border-auriga-border/70 bg-white">
                  {favorites.map((r, i) => (
                    <RecipientRow
                      key={r.id}
                      recipient={r}
                      isLast={i === favorites.length - 1}
                      isSelected={selectedId === r.id}
                      onSelect={() => setSelectedId(r.id)}
                    />
                  ))}
                </div>
              </section>
            )}
            {all.length > 0 && (
              <section>
                <h2 className="mb-2 px-1 text-[13px] font-medium uppercase tracking-wider text-auriga-text-secondary">
                  All recipients
                </h2>
                <div className="overflow-hidden rounded-2xl border border-auriga-border/70 bg-white">
                  {all.map((r, i) => (
                    <RecipientRow
                      key={r.id}
                      recipient={r}
                      isLast={i === all.length - 1}
                      isSelected={selectedId === r.id}
                      onSelect={() => setSelectedId(r.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="flex-1 overflow-y-auto bg-white md:bg-auriga-bg-subtle/30 animate-fade-in">
          <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto">
            {/* Back (mobile) */}
            <button
              onClick={() => setSelectedId(null)}
              className="md:hidden flex items-center gap-1.5 text-sm text-auriga-text-secondary mb-4 hover:text-auriga-text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back
            </button>

            {/* Profile header */}
            <div className="bg-white rounded-2xl border border-auriga-border/70 p-6 mb-5">
              <div className="flex items-center gap-4 mb-5">
                <div className={clsx(
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold',
                  getAvatarColor(selected.name).bg,
                  getAvatarColor(selected.name).text,
                )}>
                  {getInitials(selected.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight truncate">{selected.name}</h2>
                    {getCountry(selected.country) && (
                      <Flag code={getCountry(selected.country)!.code} name={getCountry(selected.country)!.name} className="w-5 h-5" />
                    )}
                  </div>
                  {selected.bank && (
                    <p className="text-sm text-auriga-text-secondary">{selected.bank}</p>
                  )}
                </div>
                <button
                  onClick={() => handleToggleFavorite(selected.id, selected.isFavorite)}
                  className={clsx('p-2 rounded-xl transition-colors', selected.isFavorite ? 'bg-auriga-green-50' : 'hover:bg-auriga-bg-subtle')}
                >
                  <svg className={clsx('w-5 h-5', selected.isFavorite ? 'text-auriga-black fill-auriga-black' : 'text-auriga-text-secondary')} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} fill={selected.isFavorite ? 'currentColor' : 'none'}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link href={`/app/send?name=${encodeURIComponent(selected.name)}&iban=${encodeURIComponent(selected.iban)}`} className="flex-1">
                  <Button className="w-full" size="lg">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    Send
                  </Button>
                </Link>
                <Button variant="secondary" onClick={() => setEditingRecipient({ ...selected })}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </Button>
                <Button variant="secondary" onClick={() => handleDelete(selected.id)} className="text-auriga-error hover:bg-auriga-error/10 hover:border-auriga-error/30">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Account details */}
            <div className="bg-white rounded-2xl border border-auriga-border/70 p-5 mb-5">
              <p className="text-[13px] font-medium uppercase tracking-wider text-auriga-text-secondary mb-4">
                Account details
              </p>
              <div className="space-y-0">
                <DetailRow label="IBAN" value={formatIban(selected.iban)} mono />
                {selected.bic && <DetailRow label="BIC / SWIFT" value={selected.bic} mono />}
                {selected.bank && <DetailRow label="Bank" value={selected.bank} />}
                {selected.country && (() => {
                  const country = getCountry(selected.country);
                  return (
                    <div className="flex justify-between items-center py-3 border-b border-auriga-border/40 last:border-0">
                      <span className="text-sm text-auriga-text-secondary">Country</span>
                      <span className="flex items-center gap-2 text-sm font-medium text-auriga-text-primary text-right">
                        {country && <Flag code={country.code} name={country.name} className="w-4 h-4" />}
                        {country ? country.name : selected.country}
                      </span>
                    </div>
                  );
                })()}
                <DetailRow label="Added" value={formatDate(selected.createdAt)} />
              </div>
            </div>

            {/* Contact */}
            {(selected.email || selected.phone) && (
              <div className="bg-white rounded-2xl border border-auriga-border/70 p-5 mb-5">
                <p className="text-[13px] font-medium uppercase tracking-wider text-auriga-text-secondary mb-4">
                  Contact
                </p>
                <div className="space-y-0">
                  {selected.email && (
                    <div className="flex justify-between items-center gap-4 py-3 border-b border-auriga-border/40 last:border-0">
                      <span className="text-sm text-auriga-text-secondary">Email</span>
                      <a href={`mailto:${selected.email}`} className="text-sm font-medium text-auriga-accent-700 hover:underline text-right truncate">{selected.email}</a>
                    </div>
                  )}
                  {selected.phone && (
                    <div className="flex justify-between items-center gap-4 py-3 border-b border-auriga-border/40 last:border-0">
                      <span className="text-sm text-auriga-text-secondary">Phone</span>
                      <a href={`tel:${selected.phone}`} className="text-sm font-medium text-auriga-accent-700 hover:underline text-right">{selected.phone}</a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {selected.notes && (
              <div className="bg-white rounded-2xl border border-auriga-border/70 p-5 mb-5">
                <p className="text-[13px] font-medium uppercase tracking-wider text-auriga-text-secondary mb-3">
                  Notes
                </p>
                <p className="text-sm text-auriga-text-primary whitespace-pre-wrap leading-relaxed">
                  {selected.notes}
                </p>
              </div>
            )}

            {/* Stats */}
            {recipientTransactions.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white rounded-2xl border border-auriga-border/70 p-4">
                  <p className="text-xs text-auriga-text-secondary mb-1">Total sent</p>
                  <p className="text-lg font-semibold text-auriga-text-primary">{formatMoney(totalSent)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-auriga-border/70 p-4">
                  <p className="text-xs text-auriga-text-secondary mb-1">Total received</p>
                  <p className="text-lg font-semibold text-auriga-success">{formatMoney(totalReceived)}</p>
                </div>
              </div>
            )}

            {/* Transaction history */}
            <div className="bg-white rounded-2xl border border-auriga-border/70 overflow-hidden">
              <div className="p-5 pb-3">
                <p className="text-[13px] font-medium uppercase tracking-wider text-auriga-text-secondary">
                  Transfer history
                </p>
              </div>
              {recipientTransactions.length === 0 ? (
                <div className="px-5 pb-6 text-center">
                  <p className="text-sm text-auriga-text-secondary py-6">No transfers yet</p>
                  <Link href={`/app/send?name=${encodeURIComponent(selected.name)}&iban=${encodeURIComponent(selected.iban)}`}>
                    <Button variant="secondary" size="sm">Send first transfer</Button>
                  </Link>
                </div>
              ) : (
                <div>
                  {recipientTransactions.map((tx, i) => (
                    <TransactionRow key={tx.id} transaction={tx} isLast={i === recipientTransactions.length - 1} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-3xl p-8 max-w-md w-full animate-scale-in shadow-elevated">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-auriga-bg-subtle transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold mb-1 tracking-tight">Add recipient</h2>
            <p className="text-sm text-auriga-text-secondary mb-6">Enter their bank details.</p>
            <form onSubmit={handleAdd} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 -mr-1">
              <Input label="Name" placeholder="John Doe" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} required />
              <Input label="IBAN" placeholder="DE89 3704 0044 0532 0130 00" value={addForm.iban} onChange={e => setAddForm(f => ({ ...f, iban: e.target.value }))} required />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-auriga-text-secondary">Country (optional)</label>
                <CountrySelect value={addForm.country} onChange={(code) => setAddForm(f => ({ ...f, country: code }))} />
              </div>
              <Input label="Bank (optional)" placeholder="Deutsche Bank" value={addForm.bank} onChange={e => setAddForm(f => ({ ...f, bank: e.target.value }))} />
              <Input label="BIC / SWIFT (optional)" placeholder="DEUTDEFF" value={addForm.bic} onChange={e => setAddForm(f => ({ ...f, bic: e.target.value.toUpperCase() }))} />
              <Input label="Email (optional)" type="email" placeholder="john@example.com" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} />
              <Input label="Phone (optional)" type="tel" placeholder="+49 170 1234567" value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} />
              <div className="space-y-1.5">
                <label htmlFor="add-notes" className="block text-sm font-medium text-auriga-text-secondary">Notes (optional)</label>
                <textarea
                  id="add-notes"
                  rows={3}
                  placeholder="Add a note about this recipient…"
                  value={addForm.notes}
                  onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))}
                  className="flex w-full rounded-xl border border-auriga-border bg-white px-4 py-3 text-sm text-auriga-text-primary ring-offset-background transition-colors placeholder:text-auriga-text-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 resize-none"
                />
              </div>
              <Button type="submit" className="w-full" loading={addLoading}>Add recipient</Button>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setEditingRecipient(null)} />
          <div className="relative bg-white rounded-3xl p-8 max-w-md w-full animate-scale-in shadow-elevated">
            <button onClick={() => setEditingRecipient(null)} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-auriga-bg-subtle transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold mb-1 tracking-tight">Edit recipient</h2>
            <p className="text-sm text-auriga-text-secondary mb-6">Update their details.</p>
            <form onSubmit={handleEditSave} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 -mr-1">
              <Input label="Name" value={editingRecipient.name} onChange={e => setEditingRecipient(r => r ? { ...r, name: e.target.value } : null)} required />
              <div>
                <label className="text-sm font-medium text-auriga-text-secondary mb-1.5 block">IBAN</label>
                <p className="text-sm font-mono text-auriga-text-primary bg-auriga-bg-subtle/50 rounded-xl px-4 py-3">{formatIban(editingRecipient.iban)}</p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-auriga-text-secondary">Country</label>
                <CountrySelect value={editingRecipient.country} onChange={(code) => setEditingRecipient(r => r ? { ...r, country: code } : null)} />
              </div>
              <Input label="Bank" value={editingRecipient.bank} onChange={e => setEditingRecipient(r => r ? { ...r, bank: e.target.value } : null)} />
              <Input label="BIC / SWIFT" placeholder="DEUTDEFF" value={editingRecipient.bic} onChange={e => setEditingRecipient(r => r ? { ...r, bic: e.target.value.toUpperCase() } : null)} />
              <Input label="Email" type="email" placeholder="john@example.com" value={editingRecipient.email} onChange={e => setEditingRecipient(r => r ? { ...r, email: e.target.value } : null)} />
              <Input label="Phone" type="tel" placeholder="+49 170 1234567" value={editingRecipient.phone} onChange={e => setEditingRecipient(r => r ? { ...r, phone: e.target.value } : null)} />
              <div className="space-y-1.5">
                <label htmlFor="edit-notes" className="block text-sm font-medium text-auriga-text-secondary">Notes</label>
                <textarea
                  id="edit-notes"
                  rows={3}
                  placeholder="Add a note about this recipient…"
                  value={editingRecipient.notes}
                  onChange={e => setEditingRecipient(r => r ? { ...r, notes: e.target.value } : null)}
                  className="flex w-full rounded-xl border border-auriga-border bg-white px-4 py-3 text-sm text-auriga-text-primary ring-offset-background transition-colors placeholder:text-auriga-text-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 resize-none"
                />
              </div>
              <Button type="submit" className="w-full">Save changes</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RecipientRow({ recipient, isLast, isSelected, onSelect }: {
  recipient: Recipient;
  isLast: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const color = getAvatarColor(recipient.name);
  return (
    <button
      onClick={onSelect}
      className={clsx(
        'w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors',
        isSelected ? 'bg-auriga-accent/5' : 'hover:bg-auriga-bg-subtle/30',
        !isLast && 'border-b border-auriga-border/50',
      )}
    >
      <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold', color.bg, color.text)}>
        {getInitials(recipient.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{recipient.name}</span>
          {getCountry(recipient.country) && (
            <Flag code={getCountry(recipient.country)!.code} name={getCountry(recipient.country)!.name} className="w-4 h-4 flex-shrink-0" />
          )}
          {recipient.isFavorite && (
            <svg className="w-3 h-3 text-auriga-black fill-auriga-black flex-shrink-0" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-auriga-text-secondary">
          {recipient.bank ? `${recipient.bank} · ` : ''}{recipient.lastTransfer}
        </p>
      </div>
      <svg className="w-4 h-4 text-auriga-text-secondary/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  );
}

function TransactionRow({ transaction, isLast }: { transaction: Transaction; isLast: boolean }) {
  const isOutbound = transaction.direction === 'outbound';
  return (
    <Link
      href={`/app/transactions/${transaction.id}`}
      className={clsx(
        'group flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-auriga-bg-subtle/40',
        !isLast && 'border-b border-auriga-border/40',
      )}
    >
      <div className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isOutbound ? 'bg-auriga-error/10' : 'bg-auriga-green-50',
      )}>
        <svg className={clsx('w-3.5 h-3.5', isOutbound ? 'text-auriga-error rotate-45' : 'text-auriga-black -rotate-[135deg]')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{transaction.reference || (isOutbound ? 'Sent' : 'Received')}</p>
        <p className="text-xs text-auriga-text-secondary mt-0.5">{formatRelative(transaction.createdAt)}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={clsx('text-sm font-medium tabular-nums', isOutbound ? 'text-auriga-text-primary' : 'text-auriga-success')}>
          {isOutbound ? '-' : '+'}{formatMoney(transaction.amountCents, transaction.currency)}
        </p>
        <p className={clsx('text-[11px] mt-0.5 capitalize', transaction.status === 'pending' ? 'text-auriga-accent-700' : 'text-auriga-text-secondary')}>
          {transaction.status}
        </p>
      </div>
      <svg className="w-4 h-4 text-auriga-text-secondary/30 flex-shrink-0 transition-colors group-hover:text-auriga-text-secondary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-auriga-border/40 last:border-0">
      <span className="text-sm text-auriga-text-secondary">{label}</span>
      <span className={clsx('text-sm font-medium text-auriga-text-primary text-right', mono && 'font-mono text-xs tracking-wide')}>{value}</span>
    </div>
  );
}
