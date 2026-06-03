'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import { Flag } from '@/components/ui/flag';

export interface CurrencyOption {
  code: string;
  name: string;
  symbol?: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

const CURRENCY_FLAG: Record<string, string> = {
  EUR: 'eu', USD: 'us', GBP: 'gb', JPY: 'jp', CHF: 'ch',
  AUD: 'au', CAD: 'ca', HKD: 'hk', SGD: 'sg', CNY: 'cn',
};

/** Maps a currency code to the ISO country code used for its flag asset. */
export function currencyFlag(code: string): string {
  return CURRENCY_FLAG[code] ?? code.slice(0, 2).toLowerCase();
}

export function getCurrency(code: string): CurrencyOption | undefined {
  return CURRENCIES.find((c) => c.code === code);
}

interface CurrencySelectProps {
  value: string;
  onChange: (code: string) => void;
  currencies?: CurrencyOption[];
  exclude?: string;
  placeholder?: string;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export function CurrencySelect({
  value,
  onChange,
  currencies = CURRENCIES,
  exclude,
  placeholder = 'Select currency',
  className,
  align = 'end',
}: CurrencySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    const items = exclude ? currencies.filter((c) => c.code !== exclude) : currencies;
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q),
    );
  }, [currencies, exclude, search]);

  const selected = getCurrency(value);

  function handleSelect(code: string) {
    onChange(code);
    setOpen(false);
    setSearch('');
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-xl',
            'border border-auriga-border/70 bg-white',
            'text-sm font-medium cursor-pointer select-none',
            'transition-all duration-200 ease-out',
            'hover:border-auriga-accent/40 hover:bg-auriga-bg-subtle/40',
            'focus:outline-none focus:ring-2 focus:ring-auriga-accent/20 focus:border-auriga-accent/40',
            'data-[state=open]:border-auriga-accent/40 data-[state=open]:ring-2 data-[state=open]:ring-auriga-accent/20',
            className,
          )}
          aria-label="Select currency"
        >
          {selected ? (
            <>
              <Flag code={currencyFlag(selected.code)} name={selected.name} className="w-5 h-5" />
              <span className="text-auriga-text-primary">{selected.code}</span>
            </>
          ) : (
            <span className="text-auriga-text-secondary">{placeholder}</span>
          )}
          <svg
            className={cn(
              'w-3.5 h-3.5 text-auriga-text-secondary/70 transition-transform duration-200',
              open && 'rotate-180',
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align={align}
          sideOffset={6}
          className={cn(
            'z-50 w-[240px] rounded-xl border border-auriga-border/70 bg-white shadow-lg shadow-black/[0.08]',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-2',
            'duration-200',
          )}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          {/* Search */}
          <div className="p-2 border-b border-auriga-border/50">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-auriga-text-secondary/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-auriga-bg-subtle/50 rounded-lg border-0 focus:outline-none focus:ring-0 placeholder:text-auriga-text-secondary/40"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-[240px] overflow-y-auto overscroll-contain p-1.5">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-auriga-text-secondary">
                No currencies found
              </p>
            ) : (
              filtered.map((c) => {
                const isActive = c.code === value;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
                      'transition-colors duration-100',
                      isActive
                        ? 'bg-auriga-accent/10 text-auriga-text-primary'
                        : 'text-auriga-text-primary hover:bg-auriga-bg-subtle/80',
                    )}
                  >
                    <Flag code={currencyFlag(c.code)} name={c.name} className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{c.code}</span>
                      <span className="text-xs text-auriga-text-secondary ml-2">{c.name}</span>
                    </div>
                    {isActive && (
                      <svg
                        className="w-4 h-4 text-auriga-accent-700 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
