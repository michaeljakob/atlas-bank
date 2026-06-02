'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import { Flag } from '@/components/ui/flag';

export interface CountryOption {
  code: string;
  name: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'DE', name: 'Germany' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'DK', name: 'Denmark' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czechia' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'HR', name: 'Croatia' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'EE', name: 'Estonia' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'IS', name: 'Iceland' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'TR', name: 'Turkey' },
];

/** Decode a legacy emoji flag (two regional indicators) back to an ISO code. */
function emojiToCode(value: string): string | undefined {
  const cps = Array.from(value);
  if (cps.length !== 2) return undefined;
  const base = 0x1f1e6;
  const a = (cps[0].codePointAt(0) ?? 0) - base;
  const b = (cps[1].codePointAt(0) ?? 0) - base;
  if (a < 0 || a > 25 || b < 0 || b > 25) return undefined;
  return String.fromCharCode(65 + a) + String.fromCharCode(65 + b);
}

/** Resolves a stored value (ISO code or legacy emoji flag) to a country. */
export function getCountry(value?: string): CountryOption | undefined {
  if (!value) return undefined;
  const byCode = COUNTRIES.find((c) => c.code === value.toUpperCase());
  if (byCode) return byCode;
  const code = emojiToCode(value);
  return code ? COUNTRIES.find((c) => c.code === code) : undefined;
}

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
  /** Restrict the list to these ISO codes (defaults to all countries). */
  options?: readonly string[];
  placeholder?: string;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export function CountrySelect({
  value,
  onChange,
  options,
  placeholder = 'Select country',
  className,
  align = 'start',
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const list = React.useMemo(() => {
    if (!options) return COUNTRIES;
    const allowed = new Set(options.map((c) => c.toUpperCase()));
    return COUNTRIES.filter((c) => allowed.has(c.code));
  }, [options]);

  const filtered = React.useMemo(() => {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [list, search]);

  const selected = getCountry(value);

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
            'inline-flex w-full items-center gap-2 px-4 h-11 rounded-xl',
            'border border-atlas-border/70 bg-white',
            'text-sm cursor-pointer select-none',
            'transition-all duration-200 ease-out',
            'hover:border-atlas-accent/40 hover:bg-atlas-bg-subtle/40',
            'focus:outline-none focus:ring-2 focus:ring-atlas-accent/20 focus:border-atlas-accent/40',
            'data-[state=open]:border-atlas-accent/40 data-[state=open]:ring-2 data-[state=open]:ring-atlas-accent/20',
            className,
          )}
          aria-label="Select country"
        >
          {selected ? (
            <>
              <Flag code={selected.code} name={selected.name} className="w-5 h-5" />
              <span className="text-atlas-text-primary">{selected.name}</span>
            </>
          ) : value ? (
            <span className="text-atlas-text-primary">{value}</span>
          ) : (
            <span className="text-atlas-text-secondary/60">{placeholder}</span>
          )}
          <svg
            className={cn(
              'ml-auto w-3.5 h-3.5 text-atlas-text-secondary/70 transition-transform duration-200',
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
            'z-[60] w-[var(--radix-popover-trigger-width)] min-w-[240px] rounded-xl border border-atlas-border/70 bg-white shadow-lg shadow-black/[0.08]',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-2',
            'duration-200',
          )}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <div className="p-2 border-b border-atlas-border/50">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-atlas-text-secondary/60"
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
                placeholder="Search countries…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-atlas-bg-subtle/50 rounded-lg border-0 focus:outline-none focus:ring-0 placeholder:text-atlas-text-secondary/40"
              />
            </div>
          </div>

          <div className="max-h-[240px] overflow-y-auto overscroll-contain p-1.5">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-atlas-text-secondary">No countries found</p>
            ) : (
              filtered.map((c) => {
                const isActive = c.code === value;
                return (
                  <button
                    key={`${c.code}-${c.name}`}
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
                      'transition-colors duration-100',
                      isActive
                        ? 'bg-atlas-accent/10 text-atlas-text-primary'
                        : 'text-atlas-text-primary hover:bg-atlas-bg-subtle/80',
                    )}
                  >
                    <Flag code={c.code} name={c.name} className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 min-w-0 truncate text-sm font-medium">{c.name}</span>
                    {isActive && (
                      <svg
                        className="w-4 h-4 text-atlas-accent flex-shrink-0"
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
