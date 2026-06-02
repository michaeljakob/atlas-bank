'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MerchantLogo } from '@/components/ui/merchant-logo';
import { api } from '@/lib/api';
import { formatCategory } from '@/lib/merchants';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ShippingAddress {
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
}

const DEFAULT_ADDRESS: ShippingAddress = {
  line1: 'Friedrichstr. 123',
  line2: '',
  city: 'Berlin',
  postalCode: '10117',
  country: 'Germany',
};

const SHIPPING_COUNTRIES = [
  'Germany',
  'Austria',
  'Belgium',
  'Croatia',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Greece',
  'Hungary',
  'Ireland',
  'Italy',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Netherlands',
  'Norway',
  'Poland',
  'Portugal',
  'Romania',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden',
  'Switzerland',
  'United Kingdom',
] as const;

type CardColor = 'black' | 'white' | 'green';

interface CardData {
  id: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  type: 'virtual' | 'physical' | 'single-use';
  status: 'active' | 'frozen';
  color: CardColor;
  label: string;
  spent: number;
  limit: number;
  onlineEnabled: boolean;
  contactlessEnabled: boolean;
  atmEnabled: boolean;
  internationalEnabled: boolean;
  createdAt: string;
}

const fallbackCards: CardData[] = [
  {
    id: '1',
    last4: '4289',
    expiryMonth: 12,
    expiryYear: 28,
    cardholderName: 'Alex Johnson',
    type: 'virtual',
    label: 'Main virtual',
    status: 'active',
    color: 'black',
    spent: 84500,
    limit: 500000,
    onlineEnabled: true,
    contactlessEnabled: true,
    atmEnabled: false,
    internationalEnabled: true,
    createdAt: '2025-11-01',
  },
  {
    id: '2',
    last4: '7831',
    expiryMonth: 6,
    expiryYear: 29,
    cardholderName: 'Alex Johnson',
    type: 'physical',
    label: 'Titanium card',
    status: 'active',
    color: 'green',
    spent: 214900,
    limit: 1000000,
    onlineEnabled: true,
    contactlessEnabled: true,
    atmEnabled: true,
    internationalEnabled: true,
    createdAt: '2026-01-15',
  },
  {
    id: '3',
    last4: '0052',
    expiryMonth: 7,
    expiryYear: 26,
    cardholderName: 'Alex Johnson',
    type: 'virtual',
    label: 'Subscriptions',
    status: 'active',
    color: 'white',
    spent: 5799,
    limit: 50000,
    onlineEnabled: true,
    contactlessEnabled: false,
    atmEnabled: false,
    internationalEnabled: true,
    createdAt: '2026-03-20',
  },
];

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

function relativeDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function MastercardMark() {
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="12" r="10" fill="#EB001B" />
      <circle cx="26" cy="12" r="10" fill="#F79E1B" />
      <path d="M20 4.8c2.4 1.8 4 4.6 4 7.8s-1.6 6-4 7.8c-2.4-1.8-4-4.6-4-7.8s1.6-6 4-7.8z" fill="#FF5F00" />
    </svg>
  );
}

function ChipSVG() {
  return (
    <svg width="46" height="34" viewBox="0 0 46 34" fill="none">
      <rect x="1" y="1" width="44" height="32" rx="5.5" fill="#B4B1AB" />
      <rect x="1" y="12" width="44" height="0.5" fill="rgba(0,0,0,0.18)" />
      <rect x="1" y="21" width="44" height="0.5" fill="rgba(0,0,0,0.18)" />
      <rect x="15" y="1" width="0.5" height="32" fill="rgba(0,0,0,0.18)" />
      <rect x="30" y="1" width="0.5" height="32" fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

function MiniCardSymbol({ card, active }: { card: CardData; active: boolean }) {
  const frozen = card.status === 'frozen';
  const isSingleUse = card.type === 'single-use';
  const theme = CARD_THEMES[card.color];
  const light = theme.light;
  const ink = light ? 'text-atlas-text-primary/60' : 'text-white/55';
  return (
    <div
      className={clsx(
        'relative w-[62px] h-[39px] rounded-[7px] overflow-hidden flex-shrink-0 transition-all duration-300 ease-out',
        light ? 'ring-1 ring-inset ring-black/10' : 'ring-1 ring-inset ring-white/10',
        active ? 'shadow-[0_10px_22px_-8px_rgba(0,0,0,0.5)]' : 'shadow-[0_3px_8px_-3px_rgba(0,0,0,0.35)]',
        active ? 'scale-[1.04] -rotate-[1.5deg]' : 'group-hover:scale-[1.02]',
      )}
    >
      {/* Base finish */}
      <div className={clsx('absolute inset-0', theme.miniBg)} />
      {/* sheen */}
      <div className={clsx(
        'pointer-events-none absolute -inset-x-6 -top-8 h-12 rotate-12 bg-gradient-to-r from-transparent to-transparent',
        light ? 'via-white/40' : 'via-white/12'
      )} />

      {/* chip */}
      <div className="absolute top-[6px] left-[7px] w-[11px] h-[8px] rounded-[2px] bg-gradient-to-br from-[#e8e2cf] via-[#c9c3ac] to-[#9a937c]" />

      {/* contactless / single-use mark */}
      {isSingleUse ? (
        <span className={clsx('absolute top-[6px] right-[7px] text-[6px] font-bold tracking-wider', ink)}>1×</span>
      ) : (
        <svg className={clsx('absolute top-[6px] right-[7px] w-[9px] h-[9px]', light ? 'text-atlas-text-primary/40' : 'text-white/35')} viewBox="0 0 24 24" fill="none">
          <path d="M8.5 16.5a7 7 0 010-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M12 14a4 4 0 010-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )}

      {/* last4 */}
      <span className={clsx('absolute bottom-[5px] left-[7px] text-[7px] font-mono tracking-[0.08em]', ink)}>
        ··{card.last4}
      </span>

      {/* mastercard */}
      <svg className="absolute bottom-[5px] right-[6px]" width="15" height="9" viewBox="0 0 40 24" fill="none">
        <circle cx="14" cy="12" r="10" fill="#EB001B" fillOpacity="0.9" />
        <circle cx="26" cy="12" r="10" fill="#F79E1B" fillOpacity="0.9" />
        <path d="M20 4.8c2.4 1.8 4 4.6 4 7.8s-1.6 6-4 7.8c-2.4-1.8-4-4.6-4-7.8s1.6-6 4-7.8z" fill="#FF5F00" />
      </svg>

      {/* frozen frost */}
      {frozen && (
        <div className="absolute inset-0 backdrop-blur-[1.5px] bg-white/25 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 7l14 10M19 7L5 17" />
          </svg>
        </div>
      )}
    </div>
  );
}

const TYPE_META: Record<CardData['type'], { label: string; color: string; dot: string }> = {
  virtual: { label: 'Virtual', color: 'bg-atlas-heather-100 text-atlas-heather-600', dot: 'bg-atlas-heather-400' },
  physical: { label: 'Physical', color: 'bg-atlas-heather-100 text-atlas-heather-600', dot: 'bg-atlas-heather-500' },
  'single-use': { label: 'Single-use', color: 'bg-atlas-heather-100 text-atlas-heather-600', dot: 'bg-atlas-heather-400' },
};

const CARD_COLORS: CardColor[] = ['black', 'white', 'green'];

const CARD_THEMES: Record<CardColor, {
  label: string;
  bg: string;
  light: boolean;
  swatch: string;
  miniBg: string;
}> = {
  black: {
    label: 'Obsidian',
    bg: 'bg-atlas-black',
    light: false,
    swatch: 'bg-atlas-black',
    miniBg: 'bg-atlas-black',
  },
  white: {
    label: 'Arctic',
    bg: 'bg-gradient-to-br from-white via-[#FBFAF7] to-[#EDEAE3]',
    light: true,
    swatch: 'bg-white ring-1 ring-inset ring-atlas-border',
    miniBg: 'bg-gradient-to-br from-white to-[#E9E6DF]',
  },
  green: {
    label: 'Atlas Neon',
    bg: 'bg-gradient-to-br from-[#DBFF4D] via-[#CCFF00] to-[#B6E200]',
    light: true,
    swatch: 'bg-gradient-to-br from-[#DBFF4D] to-[#CCFF00]',
    miniBg: 'bg-gradient-to-br from-[#DBFF4D] to-[#C2F200]',
  },
};

export default function CardPage() {
  const router = useRouter();
  const [cards, setCards] = useState<CardData[]>(fallbackCards);
  const [activeCardId, setActiveCardId] = useState(fallbackCards[0].id);
  const [txByCard, setTxByCard] = useState<Record<string, CardTransaction[]>>({});
  const [txLoading, setTxLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [physicalStep, setPhysicalStep] = useState<'select' | 'address'>('select');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(DEFAULT_ADDRESS);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getCards().then(apiCards => {
      if (apiCards && apiCards.length > 0) {
        setCards(apiCards.map((c: any) => ({
          id: c.id,
          last4: c.last4,
          expiryMonth: c.expiryMonth,
          expiryYear: c.expiryYear,
          cardholderName: c.cardholderName,
          type: c.type || 'virtual',
          label: c.name || c.label || `${c.type || 'Virtual'} card`,
          status: c.frozen ? 'frozen' : 'active',
          color: (c.color as CardColor) || 'black',
          spent: 84500,
          limit: c.spendingLimit?.amount || 500000,
          onlineEnabled: c.onlineEnabled ?? true,
          contactlessEnabled: c.contactlessEnabled ?? true,
          atmEnabled: c.atmEnabled ?? false,
          internationalEnabled: c.internationalEnabled ?? true,
          createdAt: c.createdAt || new Date().toISOString(),
        })));
        setActiveCardId(apiCards[0].id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeCardId) return;
    if (txByCard[activeCardId]) return;
    let active = true;
    setTxLoading(true);
    api.getCardTransactions(activeCardId, undefined, 25)
      .then((res) => {
        if (active && res?.items) {
          setTxByCard((prev) => ({ ...prev, [activeCardId]: res.items }));
        }
      })
      .catch(() => {})
      .finally(() => { if (active) setTxLoading(false); });
    return () => { active = false; };
  }, [activeCardId, txByCard]);

  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const activeCard = cards.find(c => c.id === activeCardId) || cards[0];
  const frozen = activeCard?.status === 'frozen';
  const activeTxs = txByCard[activeCardId] || [];
  const computedSpent = activeTxs.reduce(
    (sum, t) => sum + (t.direction === 'outbound' ? t.amountCents : -t.amountCents),
    0,
  );
  const spent = activeTxs.length > 0 ? Math.max(computedSpent, 0) : (activeCard?.spent ?? 0);
  const spentPercent = activeCard ? Math.min(Math.round((spent / activeCard.limit) * 100), 100) : 0;
  const theme = CARD_THEMES[activeCard?.color ?? 'black'];
  const isLightCard = theme.light;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = cardRef.current;
      const spot = spotlightRef.current;
      const edge = edgeRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const cx = x - 0.5;
      const cy = y - 0.5;

      el.style.transform = `rotateY(${cx * 20}deg) rotateX(${-cy * 20}deg)`;

      if (spot) {
        spot.style.left = `${x * 100}%`;
        spot.style.top = `${y * 100}%`;
        spot.style.opacity = '1';
      }

      if (edge) {
        const angle = Math.atan2(cy, cx) * (180 / Math.PI) + 180;
        edge.style.setProperty('--edge-angle', `${angle}deg`);
      }
    });
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    const el = cardRef.current;
    const spot = spotlightRef.current;
    if (el) el.style.transform = '';
    if (spot) spot.style.opacity = '';
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function toggleFreeze() {
    const wasFrozen = frozen;
    const next = wasFrozen ? 'active' : 'frozen';
    setCards(prev => prev.map(c => c.id === activeCardId ? { ...c, status: next } : c));
    toast.success(wasFrozen ? 'Card unfrozen' : 'Card frozen');

    const call = wasFrozen ? api.unfreezeCard(activeCard.id) : api.freezeCard(activeCard.id);
    call.catch(() => {
      setCards(prev => prev.map(c => c.id === activeCardId ? { ...c, status: wasFrozen ? 'frozen' : 'active' } : c));
      toast.error('Could not update card. Please try again.');
    });
  }

  function setCardColor(color: CardColor) {
    if (!activeCard || activeCard.color === color) return;
    const prevColor = activeCard.color;
    setCards(prev => prev.map(c => c.id === activeCardId ? { ...c, color } : c));
    api.updateCard(activeCardId, { color }).catch(() => {
      setCards(prev => prev.map(c => c.id === activeCardId ? { ...c, color: prevColor } : c));
      toast.error('Could not save card colour. Please try again.');
    });
  }

  function createCard(type: CardData['type']) {
    if (type === 'physical') {
      setPhysicalStep('address');
      return;
    }
    issueCard(type);
  }

  function issueCard(type: CardData['type']) {
    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    const labels: Record<CardData['type'], string> = {
      virtual: 'Virtual card',
      physical: 'Physical card',
      'single-use': 'Single-use card',
    };
    const newCard: CardData = {
      id: String(Date.now()),
      last4,
      expiryMonth: 6,
      expiryYear: 29,
      cardholderName: activeCard.cardholderName,
      type,
      label: labels[type],
      status: 'active',
      color: 'black',
      spent: 0,
      limit: type === 'single-use' ? 100000 : 500000,
      onlineEnabled: true,
      contactlessEnabled: true,
      atmEnabled: false,
      internationalEnabled: true,
      createdAt: new Date().toISOString(),
    };
    setCards(prev => [...prev, newCard]);
    setActiveCardId(newCard.id);
    setShowNewCardModal(false);
    setPhysicalStep('select');
    setShowDetails(false);
    toast.success(`${labels[type]} created`);

    if (type === 'physical') {
      api.orderPhysicalCard(shippingAddress).catch(() => {});
    }

    requestAnimationFrame(() => {
      selectorRef.current?.scrollTo({ left: selectorRef.current.scrollWidth, behavior: 'smooth' });
    });
  }

  function deleteCard(id: string) {
    const snapshot = cards;
    const remaining = cards.filter(c => c.id !== id);
    setCards(remaining);
    if (activeCardId === id) {
      setActiveCardId(remaining[0]?.id ?? '');
    }
    setShowDetails(false);
    toast.success('Card removed');

    api.deleteCard(id).catch(() => {
      setCards(snapshot);
      setActiveCardId(id);
      toast.error('Could not remove card. Please try again.');
    });
  }

  function updateCardSetting(patch: Partial<Pick<CardData, 'onlineEnabled' | 'contactlessEnabled' | 'atmEnabled' | 'internationalEnabled'>>) {
    if (!activeCard) return;
    const snapshot = activeCard;
    setCards(prev => prev.map(c => c.id === activeCardId ? { ...c, ...patch } : c));
    api.updateCard(activeCardId, patch).catch(() => {
      setCards(prev => prev.map(c => c.id === activeCardId ? snapshot : c));
      toast.error('Could not save setting. Please try again.');
    });
  }

  function adjustLimit() {
    if (!activeCard) return;
    const current = (activeCard.limit / 100).toString();
    const input = window.prompt('Set monthly spending limit (€)', current);
    if (input === null) return;
    const euros = Number(input.replace(/[^0-9.]/g, ''));
    if (!isFinite(euros) || euros <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }
    const limitCents = Math.round(euros * 100);
    const prevLimit = activeCard.limit;
    setCards(prev => prev.map(c => c.id === activeCardId ? { ...c, limit: limitCents } : c));
    toast.success(`Limit set to €${euros.toLocaleString()}`);
    api.updateCard(activeCardId, { limitCents }).catch(() => {
      setCards(prev => prev.map(c => c.id === activeCardId ? { ...c, limit: prevLimit } : c));
      toast.error('Could not save limit. Please try again.');
    });
  }

  async function addToWallet() {
    if (!activeCard) return;
    const isAppleDevice = /iPhone|iPad|Macintosh/.test(navigator.userAgent);
    const walletType: 'apple_pay' | 'google_pay' = isAppleDevice ? 'apple_pay' : 'google_pay';
    const label = isAppleDevice ? 'Apple Wallet' : 'Google Wallet';
    const toastId = toast.loading(`Adding to ${label}…`);
    try {
      await api.provisionWallet(activeCard.id, walletType);
      toast.success(`Card added to ${label}`, { id: toastId });
    } catch {
      toast.error(`Could not add to ${label}. Please try again.`, { id: toastId });
    }
  }

  function startRename(cardId: string) {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    setEditingCardId(cardId);
    setEditName(card.label);
    setTimeout(() => editInputRef.current?.select(), 0);
  }

  function commitRename() {
    if (!editingCardId) return;
    const cardId = editingCardId;
    const trimmed = editName.trim();
    const prevLabel = cards.find(c => c.id === cardId)?.label;
    if (trimmed && trimmed !== prevLabel) {
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, label: trimmed } : c));
      toast.success('Card renamed');
      api.renameCard(cardId, trimmed).catch(() => {
        setCards(prev => prev.map(c => c.id === cardId ? { ...c, label: prevLabel ?? c.label } : c));
        toast.error('Could not rename card. Please try again.');
      });
    }
    setEditingCardId(null);
  }

  const cardControls = [
    {
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
        </svg>
      ),
      label: 'Rename',
      action: () => startRename(activeCardId),
    },
    {
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={frozen
            ? "M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            : "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          } />
        </svg>
      ),
      label: frozen ? 'Unfreeze' : 'Freeze',
      action: toggleFreeze,
    },
    {
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={showDetails
            ? "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
            : "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          } />
          {!showDetails && <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
        </svg>
      ),
      label: showDetails ? 'Hide' : 'Details',
      action: () => setShowDetails(!showDetails),
    },
    {
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
      ),
      label: 'Apple Wallet',
      action: addToWallet,
    },
    {
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      ),
      label: 'Remove',
      action: () => deleteCard(activeCardId),
    },
  ];

  const recentTransactions = activeTxs.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Cards</h1>
          <p className="text-sm text-atlas-text-secondary mt-1">{cards.length} card{cards.length !== 1 ? 's' : ''} active</p>
        </div>
        <Button size="sm" onClick={() => setShowNewCardModal(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New card
        </Button>
      </div>

      {/* ── Card selector strip ── */}
      <div className="mb-8">
        <div
          ref={selectorRef}
          className="flex gap-2.5 overflow-x-auto pb-2 -mb-2 scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cards.map((c) => {
            const meta = TYPE_META[c.type];
            const isActive = c.id === activeCardId;
            const isEditing = c.id === editingCardId;
            return (
              <button
                key={c.id}
                onClick={() => { setActiveCardId(c.id); setShowDetails(false); }}
                className={clsx(
                  'group relative flex-shrink-0 flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-2xl transition-all duration-300',
                  isActive
                    ? 'bg-white shadow-card ring-1 ring-atlas-text-primary/10'
                    : 'bg-atlas-bg-subtle/50 hover:bg-atlas-bg-subtle'
                )}
              >
                {/* Active accent rail */}
                <span className={clsx(
                  'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-atlas-accent transition-all duration-300',
                  isActive ? 'h-7 opacity-100' : 'h-0 opacity-0'
                )} />

                <MiniCardSymbol card={c} active={isActive} />

                <div className="text-left">
                  {isEditing ? (
                    <input
                      ref={editInputRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename();
                        if (e.key === 'Escape') setEditingCardId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[13px] font-semibold leading-tight bg-transparent border-b border-atlas-accent outline-none w-24 py-0"
                      maxLength={40}
                      autoFocus
                    />
                  ) : (
                    <p
                      onDoubleClick={(e) => { e.stopPropagation(); startRename(c.id); }}
                      className={clsx(
                        'text-[13px] font-semibold leading-tight cursor-text whitespace-nowrap',
                        isActive ? 'text-atlas-text-primary' : 'text-atlas-text-secondary'
                      )}
                      title="Double-click to rename"
                    >
                      {c.label}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={clsx('w-1.5 h-1.5 rounded-full', c.status === 'frozen' ? 'bg-atlas-text-secondary' : meta.dot)} />
                    <span className="text-[10px] text-atlas-text-secondary capitalize whitespace-nowrap">
                      {meta.label}{c.status === 'frozen' ? ' · Frozen' : ''}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Inline add button */}
          <button
            onClick={() => setShowNewCardModal(true)}
            className="group flex-shrink-0 flex items-center gap-3 pl-3 pr-5 py-2.5 rounded-2xl border border-dashed border-atlas-border hover:border-atlas-accent/50 hover:bg-atlas-bg-subtle/40 transition-all"
          >
            <span className="relative w-[62px] h-[39px] rounded-[7px] flex items-center justify-center bg-atlas-bg-subtle border border-dashed border-atlas-border/80 group-hover:border-atlas-accent/40 transition-colors">
              <svg className="w-4 h-4 text-atlas-text-secondary group-hover:text-atlas-text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </span>
            <span className="text-[13px] font-semibold text-atlas-text-secondary group-hover:text-atlas-text-primary transition-colors whitespace-nowrap">Add card</span>
          </button>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white rounded-2xl border border-atlas-border/70">
          <div className="w-16 h-16 rounded-2xl bg-atlas-bg-subtle flex items-center justify-center mb-5">
            <svg className="w-8 h-8 text-atlas-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold tracking-tight">No cards yet</h2>
          <p className="text-sm text-atlas-text-secondary mt-1 max-w-xs">You've removed all your cards. Create a new virtual, physical, or single-use card to get started.</p>
          <Button className="mt-6" onClick={() => setShowNewCardModal(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New card
          </Button>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
        {/* Left column */}
        <div className="lg:col-span-3 space-y-8">
          {/* ===================== THE CARD ===================== */}
          <div className="flex flex-col items-center lg:items-start">
            <div
              className="card-3d w-full max-w-[420px]"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div
                ref={cardRef}
                className={clsx(
                  'card-3d-inner relative rounded-[20px] overflow-hidden aspect-[1.586/1] cursor-default select-none',
                  frozen && 'brightness-90'
                )}
                style={{
                  boxShadow: isLightCard
                    ? isHovering
                      ? '0 30px 60px -15px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)'
                      : '0 20px 40px -12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)'
                    : isHovering
                      ? '0 40px 80px -20px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.08) inset'
                      : '0 25px 60px -15px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.06) inset',
                }}
              >
                <div className={clsx('absolute inset-0', theme.bg)} />

                {/* Oversized brand mark bleeding off the corner */}
                <img
                  src="/atlas-icon.svg"
                  alt=""
                  aria-hidden="true"
                  className={clsx(
                    'pointer-events-none absolute select-none w-[125%] max-w-none -right-[34%] -bottom-[46%] rotate-[8deg]',
                    isLightCard
                      ? 'opacity-[0.05]'
                      : 'opacity-[0.10] brightness-0 invert'
                  )}
                />

                <div
                  className={clsx(
                    'absolute inset-0 mix-blend-overlay',
                    isLightCard ? 'opacity-[0.04]' : 'opacity-[0.03]'
                  )}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: '150px 150px',
                  }}
                />

                <div
                  ref={spotlightRef}
                  className={clsx(
                    'card-spotlight',
                    !isHovering && 'card-spotlight-idle left-[60%] top-[30%] opacity-30'
                  )}
                />

                <div ref={edgeRef} className="card-edge-light" />

                <div className="relative z-[3] h-full flex flex-col justify-between p-7 sm:p-9">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={isLightCard ? '/atlas-lockup.svg' : '/atlas-lockup-light.svg'}
                        alt="Atlas"
                        className={clsx('h-6 w-auto', isLightCard ? 'opacity-90' : 'opacity-[0.92]')}
                      />
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={isLightCard ? 'text-atlas-text-secondary mt-0.5' : 'text-white/20 mt-0.5'}>
                      <path d="M8.5 16.5a7 7 0 010-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M12 14a4 4 0 010-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M5 19a10 10 0 010-14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>

                  {activeCard.type !== 'single-use' && (
                    <div className="-ml-0.5">
                      <ChipSVG />
                    </div>
                  )}
                  {activeCard.type === 'single-use' && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-atlas-text-secondary/40" />
                      <span className="text-[10px] uppercase tracking-[0.15em] text-atlas-text-secondary font-medium">One-time use</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {showDetails ? (
                      <p className={clsx(
                        'font-mono text-[15px] sm:text-[17px] tracking-[0.25em] animate-fade-in',
                        isLightCard ? 'text-atlas-black' : 'text-white/80'
                      )}>
                        4532 8921 0045 {activeCard.last4}
                      </p>
                    ) : (
                      <p className={clsx(
                        'font-mono text-[15px] sm:text-[17px] tracking-[0.25em]',
                        isLightCard ? 'text-atlas-text-secondary' : 'text-white/40'
                      )}>
                        •••• •••• •••• <span className={isLightCard ? 'text-atlas-black' : 'text-white/70'}>{activeCard.last4}</span>
                      </p>
                    )}

                    <div className="flex items-end justify-between">
                      <div>
                        <p className={clsx(
                          'text-[9px] uppercase tracking-[0.2em] mb-1',
                          isLightCard ? 'text-atlas-text-secondary' : 'text-white/20'
                        )}>Cardholder</p>
                        <p className={clsx(
                          'text-[12px] sm:text-[13px] font-medium tracking-[0.06em]',
                          isLightCard ? 'text-atlas-black/80' : 'text-white/70'
                        )}>
                          {activeCard.cardholderName.toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-end gap-6">
                        <div className="text-right">
                          <p className={clsx(
                            'text-[9px] uppercase tracking-[0.2em] mb-1',
                            isLightCard ? 'text-atlas-text-secondary' : 'text-white/20'
                          )}>Expires</p>
                          <p className={clsx(
                            'text-[12px] sm:text-[13px] font-mono font-medium tabular-nums',
                            isLightCard ? 'text-atlas-black/80' : 'text-white/70'
                          )}>
                            {String(activeCard.expiryMonth).padStart(2, '0')}/{activeCard.expiryYear}
                          </p>
                        </div>
                        {showDetails && (
                          <div className="text-right animate-fade-in">
                            <p className={clsx(
                              'text-[9px] uppercase tracking-[0.2em] mb-1',
                              isLightCard ? 'text-atlas-text-secondary' : 'text-white/20'
                            )}>CVV</p>
                            <p className={clsx(
                              'text-[12px] sm:text-[13px] font-mono font-medium',
                              isLightCard ? 'text-atlas-black/80' : 'text-white/70'
                            )}>847</p>
                          </div>
                        )}
                        <MastercardMark />
                      </div>
                    </div>
                  </div>
                </div>

                {frozen && (
                  <div className="absolute inset-0 z-[6] flex items-center justify-center">
                    <div className="absolute inset-0 bg-atlas-bg-subtle/80" />
                    <div className="absolute inset-0 backdrop-blur-[2px]" />
                    <div className="relative flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-atlas-heather-100 border border-atlas-border flex items-center justify-center">
                        <svg className="w-6 h-6 text-atlas-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl rounded-full px-5 py-2 border border-atlas-border">
                        <div className="w-2 h-2 rounded-full bg-atlas-text-secondary animate-pulse" />
                        <span className="text-[12px] font-semibold text-atlas-black tracking-[0.12em] uppercase">Card Frozen</span>
                      </div>
                      <p className="text-[10px] text-atlas-text-secondary mt-0.5">Unfreeze to resume transactions</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <div className={clsx(
                'w-2 h-2 rounded-full',
                frozen ? 'bg-atlas-text-secondary' : TYPE_META[activeCard.type].dot
              )} />
              {editingCardId === activeCardId ? (
                <input
                  ref={editInputRef}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') setEditingCardId(null);
                  }}
                  className="text-xs bg-transparent border-b border-atlas-accent outline-none py-0"
                  maxLength={40}
                  autoFocus
                />
              ) : (
                <span
                  className="text-xs text-atlas-text-secondary cursor-text"
                  onDoubleClick={() => startRename(activeCardId)}
                  title="Double-click to rename"
                >
                  {activeCard.label} {frozen ? '· Frozen' : '· Active'}
                </span>
              )}
            </div>

            {/* Card colour picker */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                {CARD_COLORS.map((col) => {
                  const selected = activeCard.color === col;
                  return (
                    <button
                      key={col}
                      onClick={() => setCardColor(col)}
                      aria-label={`${CARD_THEMES[col].label} card`}
                      title={CARD_THEMES[col].label}
                      className={clsx(
                        'relative w-7 h-7 rounded-full transition-all duration-200 ease-out',
                        CARD_THEMES[col].swatch,
                        selected
                          ? 'ring-2 ring-offset-2 ring-offset-white ring-atlas-text-primary/50 scale-110 shadow-sm'
                          : 'hover:scale-110 hover:shadow-sm'
                      )}
                    >
                      {selected && (
                        <svg
                          className={clsx(
                            'absolute inset-0 m-auto w-3.5 h-3.5',
                            CARD_THEMES[col].light ? 'text-atlas-text-primary' : 'text-white'
                          )}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
              <span className="text-xs text-atlas-text-secondary">{CARD_THEMES[activeCard.color].label}</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-5 gap-3 max-w-[420px] mx-auto lg:mx-0">
            {cardControls.map((ctrl) => (
              <button
                key={ctrl.label}
                onClick={ctrl.action}
                className={clsx(
                  'group flex flex-col items-center gap-2.5 py-4 rounded-2xl transition-all duration-300',
                  'bg-atlas-bg-subtle/60 hover:bg-atlas-bg-subtle'
                )}
              >
                <div className="text-atlas-text-secondary group-hover:text-atlas-text-primary transition-colors duration-200">
                  {ctrl.icon}
                </div>
                <span className="text-[11px] font-medium text-atlas-text-secondary group-hover:text-atlas-text-primary transition-colors">
                  {ctrl.label}
                </span>
              </button>
            ))}
          </div>

          {/* Settings */}
          <div className="bg-white rounded-2xl border border-atlas-border/70 p-6">
            <h2 className="text-[13px] font-semibold mb-5 uppercase tracking-wider text-atlas-text-secondary">Settings</h2>
            <div className="space-y-5">
              <ToggleRow
                title="Online payments"
                description="Allow this card for online transactions"
                checked={activeCard.onlineEnabled}
                onChange={(v) => updateCardSetting({ onlineEnabled: v })}
              />
              <ToggleRow
                title="Contactless"
                description="Tap to pay in stores"
                checked={activeCard.contactlessEnabled}
                onChange={(v) => updateCardSetting({ contactlessEnabled: v })}
              />
              <ToggleRow
                title="ATM withdrawals"
                description="Allow cash withdrawals at ATMs"
                checked={activeCard.atmEnabled}
                onChange={(v) => updateCardSetting({ atmEnabled: v })}
              />
              <ToggleRow
                title="International"
                description="Allow payments outside your home country"
                checked={activeCard.internationalEnabled}
                onChange={(v) => updateCardSetting({ internationalEnabled: v })}
              />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spending */}
          <div className="bg-white rounded-2xl border border-atlas-border/70 p-6">
            <h3 className="text-[13px] font-semibold mb-6 uppercase tracking-wider text-atlas-text-secondary">Spending</h3>
            <div className="flex justify-center mb-5">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#E3E8DD" strokeWidth="4" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="url(#spendGrad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${spentPercent * 3.14} 314`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="spendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#DBFF4D" />
                      <stop offset="100%" stopColor="#CCFF00" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold tracking-tight tabular-nums">€{(spent / 100).toLocaleString()}</span>
                  <span className="text-[11px] text-atlas-text-secondary mt-0.5">of €{(activeCard.limit / 100).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-atlas-text-secondary">
              <span className="tabular-nums">€{(Math.max(activeCard.limit - spent, 0) / 100).toLocaleString()} remaining</span>
              <button
                onClick={adjustLimit}
                className="font-medium text-atlas-text-primary hover:text-atlas-accent transition-colors"
              >
                Adjust
              </button>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="bg-white rounded-2xl border border-atlas-border/70 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-atlas-text-secondary">Recent</h3>
              <Link
                href={`/app/card/transactions?cardId=${activeCardId}` as any}
                className="text-xs text-atlas-text-secondary hover:text-atlas-text-primary transition-colors"
              >
                View all
              </Link>
            </div>

            {txLoading && recentTransactions.length === 0 ? (
              <div className="space-y-0.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 px-2 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-atlas-bg-subtle" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-atlas-bg-subtle rounded w-28" />
                      <div className="h-2.5 bg-atlas-bg-subtle rounded w-16" />
                    </div>
                    <div className="h-3 bg-atlas-bg-subtle rounded w-12" />
                  </div>
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-atlas-text-secondary">No transactions yet</p>
                <p className="text-xs text-atlas-text-secondary/70 mt-1">Spending on this card will show up here.</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {recentTransactions.map((tx) => {
                  const inbound = tx.direction === 'inbound';
                  return (
                    <button
                      key={tx.id}
                      onClick={() => router.push(`/app/transactions/${tx.id}` as any)}
                      className="w-full flex items-center gap-3 py-3 px-2 -mx-2 rounded-xl hover:bg-atlas-bg-subtle/50 transition-colors cursor-pointer text-left"
                    >
                      <MerchantLogo name={tx.counterpartyName} size={36} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tx.counterpartyName}</p>
                        <p className="text-[11px] text-atlas-text-secondary truncate">{tx.reference || formatCategory(tx.category)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={clsx('text-sm font-medium tabular-nums', inbound ? 'text-atlas-success' : 'text-atlas-text-primary')}>
                          {inbound ? '+' : '−'}€{(tx.amountCents / 100).toFixed(2)}
                        </span>
                        <p className="text-[10px] text-atlas-text-secondary">{relativeDate(tx.createdAt)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* All cards overview */}
          <div className="bg-white rounded-2xl border border-atlas-border/70 p-6">
            <h3 className="text-[13px] font-semibold mb-4 uppercase tracking-wider text-atlas-text-secondary">All cards</h3>
            <div className="space-y-2.5">
              {cards.map((c) => {
                const meta = TYPE_META[c.type];
                return (
                  <button
                    key={c.id}
                    onClick={() => { setActiveCardId(c.id); setShowDetails(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={clsx(
                      'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                      c.id === activeCardId ? 'bg-atlas-bg-subtle' : 'hover:bg-atlas-bg-subtle/50'
                    )}
                  >
                    <div className="w-10 h-7 rounded-md flex items-center justify-center text-[7px] font-bold tracking-wider flex-shrink-0 bg-atlas-bg-subtle text-atlas-text-secondary border border-atlas-border/60">
                      <span className="opacity-60">{c.last4}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.label}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={clsx('text-[10px] font-medium px-1.5 py-0.5 rounded-md', meta.color)}>{meta.label}</span>
                        {c.status === 'frozen' && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-atlas-accent/15 text-atlas-accent-700">Frozen</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-atlas-text-secondary tabular-nums flex-shrink-0">
                      •••• {c.last4}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* New card modal */}
      {showNewCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => { setShowNewCardModal(false); setPhysicalStep('select'); }} />
          <div className="relative bg-white rounded-3xl p-8 max-w-md w-full animate-scale-in shadow-elevated">
            <button
              onClick={() => { setShowNewCardModal(false); setPhysicalStep('select'); }}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-atlas-bg-subtle transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {physicalStep === 'select' ? (
              <>
                <h2 className="text-xl font-semibold mb-1 tracking-tight">New card</h2>
                <p className="text-sm text-atlas-text-secondary mb-8">Choose your card type</p>

                <div className="space-y-4">
                  {/* Virtual Card */}
                  <button
                    onClick={() => createCard('virtual')}
                    className="group w-full rounded-2xl border border-atlas-border/60 hover:border-atlas-border transition-all duration-300 overflow-hidden text-left hover:shadow-lg hover:shadow-atlas-heather-200/40"
                  >
                    <div className="relative p-5">
                      <div className="absolute inset-0 bg-atlas-bg-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative flex items-center gap-4">
                        {/* Mini card visual */}
                        <div className="w-[72px] h-[46px] rounded-lg bg-atlas-black flex-shrink-0 relative overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300 border border-white/10">
                          <div className="absolute top-2 left-2.5">
                            <div className="w-5 h-3.5 rounded-[2px] bg-white/25 border border-white/15" />
                          </div>
                          <div className="absolute bottom-2 left-2.5 flex gap-[3px]">
                            <div className="w-1 h-1 rounded-full bg-white/30" />
                            <div className="w-1 h-1 rounded-full bg-white/30" />
                            <div className="w-1 h-1 rounded-full bg-white/30" />
                            <div className="w-1 h-1 rounded-full bg-white/30" />
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <svg width="16" height="10" viewBox="0 0 44 28" fill="none">
                              <circle cx="10" cy="14" r="8" fill="rgba(255,255,255,0.14)" />
                              <circle cx="20" cy="14" r="8" fill="rgba(255,255,255,0.1)" />
                            </svg>
                          </div>
                          <div className="absolute top-2 right-2">
                            <svg className="w-2.5 h-2.5 text-atlas-text-secondary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold group-hover:text-atlas-black transition-colors duration-300">Virtual</p>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-atlas-heather-100 text-atlas-heather-600 group-hover:bg-atlas-heather-200 group-hover:text-atlas-heather-700 transition-colors duration-300">Instant</span>
                          </div>
                          <p className="text-xs text-atlas-text-secondary group-hover:text-atlas-text-secondary transition-colors duration-300 mt-1">
                            Ready in seconds. Perfect for online payments & subscriptions.
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-atlas-text-secondary/40 group-hover:text-atlas-text-secondary group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Physical Card */}
                  <button
                    onClick={() => createCard('physical')}
                    className="group w-full rounded-2xl border border-atlas-border/60 hover:border-atlas-border transition-all duration-300 overflow-hidden text-left hover:shadow-lg hover:shadow-atlas-heather-200/40"
                  >
                    <div className="relative p-5">
                      <div className="absolute inset-0 bg-atlas-bg-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative flex items-center gap-4">
                        {/* Mini card visual */}
                        <div className="w-[72px] h-[46px] rounded-lg bg-atlas-bg-subtle flex-shrink-0 relative overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300 border border-atlas-border/60">
                          <div className="absolute top-2 left-2.5">
                            <div className="w-5 h-3.5 rounded-[2px] bg-atlas-heather-300/30 border border-atlas-heather-400/20" />
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className="text-[5px] uppercase tracking-widest text-atlas-text-secondary/60 font-bold">Metal</span>
                          </div>
                          <div className="absolute bottom-2 left-2.5 flex gap-[3px]">
                            <div className="w-1 h-1 rounded-full bg-atlas-text-secondary/30" />
                            <div className="w-1 h-1 rounded-full bg-atlas-text-secondary/30" />
                            <div className="w-1 h-1 rounded-full bg-atlas-text-secondary/30" />
                            <div className="w-1 h-1 rounded-full bg-atlas-text-secondary/30" />
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <svg width="16" height="10" viewBox="0 0 44 28" fill="none">
                              <circle cx="10" cy="14" r="8" fill="rgba(0,0,0,0.06)" />
                              <circle cx="20" cy="14" r="8" fill="rgba(0,0,0,0.04)" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold group-hover:text-atlas-black transition-colors duration-300">Physical</p>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-atlas-heather-100 text-atlas-heather-600 group-hover:bg-atlas-heather-200 group-hover:text-atlas-heather-700 transition-colors duration-300">Premium</span>
                          </div>
                          <p className="text-xs text-atlas-text-secondary group-hover:text-atlas-text-secondary transition-colors duration-300 mt-1">
                            Titanium metal card. Contactless. Ships in 3–5 business days.
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-atlas-text-secondary/40 group-hover:text-atlas-text-secondary group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Single-use Card */}
                  <button
                    onClick={() => createCard('single-use')}
                    className="group w-full rounded-2xl border border-atlas-border/60 hover:border-atlas-border transition-all duration-300 overflow-hidden text-left hover:shadow-lg hover:shadow-atlas-heather-200/40"
                  >
                    <div className="relative p-5">
                      <div className="absolute inset-0 bg-atlas-bg-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative flex items-center gap-4">
                        {/* Mini card visual */}
                        <div className="w-[72px] h-[46px] rounded-lg bg-atlas-bg-subtle flex-shrink-0 relative overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300 border border-atlas-border/60">
                          <div className="absolute top-2 left-2.5 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-atlas-text-secondary/40" />
                            <span className="text-[5px] text-atlas-text-secondary/60 uppercase tracking-wider font-medium">1x</span>
                          </div>
                          <div className="absolute bottom-2 left-2.5 flex gap-[3px]">
                            <div className="w-1 h-1 rounded-full bg-atlas-text-secondary/30" />
                            <div className="w-1 h-1 rounded-full bg-atlas-text-secondary/30" />
                            <div className="w-1 h-1 rounded-full bg-atlas-text-secondary/30" />
                            <div className="w-1 h-1 rounded-full bg-atlas-text-secondary/30" />
                          </div>
                          <div className="absolute bottom-2 right-2">
                            <svg width="16" height="10" viewBox="0 0 44 28" fill="none">
                              <circle cx="10" cy="14" r="8" fill="rgba(0,0,0,0.06)" />
                              <circle cx="20" cy="14" r="8" fill="rgba(0,0,0,0.04)" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold group-hover:text-atlas-black transition-colors duration-300">Single-use</p>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-atlas-heather-100 text-atlas-heather-600 group-hover:bg-atlas-heather-200 group-hover:text-atlas-heather-700 transition-colors duration-300">Secure</span>
                          </div>
                          <p className="text-xs text-atlas-text-secondary group-hover:text-atlas-text-secondary transition-colors duration-300 mt-1">
                            Burns after one transaction. Ideal for sketchy checkouts.
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-atlas-text-secondary/40 group-hover:text-atlas-text-secondary group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setPhysicalStep('select')}
                  className="flex items-center gap-1 text-xs text-atlas-text-secondary hover:text-atlas-text-primary transition-colors mb-4"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Back
                </button>

                <h2 className="text-xl font-semibold mb-1 tracking-tight">Shipping address</h2>
                <p className="text-sm text-atlas-text-secondary mb-6">Where should we send your physical card?</p>

                {/* Address on file */}
                <button
                  onClick={() => { setUseNewAddress(false); setShippingAddress(DEFAULT_ADDRESS); }}
                  className={clsx(
                    'w-full p-4 rounded-2xl border text-left transition-all mb-3',
                    !useNewAddress
                      ? 'border-atlas-accent bg-atlas-accent/5'
                      : 'border-atlas-border hover:border-atlas-text-secondary/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      !useNewAddress ? 'border-atlas-accent' : 'border-atlas-border'
                    )}>
                      {!useNewAddress && <div className="w-2.5 h-2.5 rounded-full bg-atlas-accent" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Address on file</p>
                      <p className="text-xs text-atlas-text-secondary mt-0.5">
                        {DEFAULT_ADDRESS.line1}{DEFAULT_ADDRESS.line2 ? `, ${DEFAULT_ADDRESS.line2}` : ''}, {DEFAULT_ADDRESS.postalCode} {DEFAULT_ADDRESS.city}, {DEFAULT_ADDRESS.country}
                      </p>
                    </div>
                  </div>
                </button>

                {/* New address option */}
                <button
                  onClick={() => setUseNewAddress(true)}
                  className={clsx(
                    'w-full p-4 rounded-2xl border text-left transition-all',
                    useNewAddress
                      ? 'border-atlas-accent bg-atlas-accent/5'
                      : 'border-atlas-border hover:border-atlas-text-secondary/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      useNewAddress ? 'border-atlas-accent' : 'border-atlas-border'
                    )}>
                      {useNewAddress && <div className="w-2.5 h-2.5 rounded-full bg-atlas-accent" />}
                    </div>
                    <p className="text-sm font-medium">Ship to a different address</p>
                  </div>
                </button>

                {/* New address form */}
                {useNewAddress && (
                  <div className="mt-4 space-y-3 animate-fade-in">
                    <div>
                      <label className="text-[11px] font-medium text-atlas-text-secondary uppercase tracking-wider">Address line 1</label>
                      <input
                        type="text"
                        value={shippingAddress.line1}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, line1: e.target.value }))}
                        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-atlas-border text-sm focus:outline-none focus:border-atlas-accent transition-colors"
                        placeholder="Street and number"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-atlas-text-secondary uppercase tracking-wider">Address line 2 (optional)</label>
                      <input
                        type="text"
                        value={shippingAddress.line2}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, line2: e.target.value }))}
                        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-atlas-border text-sm focus:outline-none focus:border-atlas-accent transition-colors"
                        placeholder="Apartment, floor, etc."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-atlas-text-secondary uppercase tracking-wider">City</label>
                        <input
                          type="text"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-atlas-border text-sm focus:outline-none focus:border-atlas-accent transition-colors"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-atlas-text-secondary uppercase tracking-wider">Postal code</label>
                        <input
                          type="text"
                          value={shippingAddress.postalCode}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-atlas-border text-sm focus:outline-none focus:border-atlas-accent transition-colors"
                          placeholder="12345"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-atlas-text-secondary uppercase tracking-wider">Country</label>
                      <div className="relative mt-1">
                        <select
                          value={shippingAddress.country}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full appearance-none px-3 py-2.5 pr-9 rounded-xl border border-atlas-border bg-white text-sm focus:outline-none focus:border-atlas-accent transition-colors cursor-pointer"
                        >
                          {SHIPPING_COUNTRIES.map((country) => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-atlas-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm button */}
                <Button
                  onClick={() => issueCard('physical')}
                  disabled={useNewAddress && (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country)}
                  className="w-full mt-6 rounded-xl font-semibold"
                  size="lg"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  Order physical card
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-[11px] text-atlas-text-secondary">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={clsx(
          'w-[44px] h-[26px] rounded-full relative transition-colors duration-300 flex-shrink-0',
          checked ? 'bg-atlas-accent' : 'bg-atlas-border'
        )}
      >
        <div className={clsx(
          'w-[22px] h-[22px] bg-white rounded-full absolute top-[2px] shadow-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          checked ? 'left-[20px]' : 'left-[2px]'
        )} />
      </button>
    </div>
  );
}
