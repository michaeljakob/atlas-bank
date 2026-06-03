'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { isValidHandle, normalizeHandle } from '@auriga-money/shared';
import { clsx } from 'clsx';
import { toast } from 'sonner';

type Status = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

interface HandleFieldProps {
  initialHandle?: string | null;
  ctaLabel?: string;
  onClaimed?: (handle: string) => void;
}

export function HandleField({ initialHandle, ctaLabel = 'Claim handle', onClaimed }: HandleFieldProps) {
  const [value, setValue] = useState(initialHandle ?? '');
  const [status, setStatus] = useState<Status>('idle');
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState<string | null>(initialHandle ?? null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalized = normalizeHandle(value);
  const unchanged = claimed !== null && normalized === claimed;

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!normalized || unchanged) {
      setStatus('idle');
      return;
    }
    if (!isValidHandle(normalized)) {
      setStatus('invalid');
      return;
    }
    setStatus('checking');
    debounce.current = setTimeout(async () => {
      try {
        const res = await api.checkHandleAvailability(normalized);
        setStatus(res.available ? 'available' : 'taken');
      } catch {
        setStatus('idle');
      }
    }, 350);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [normalized, unchanged]);

  async function claim() {
    if (!isValidHandle(normalized)) return;
    setClaiming(true);
    try {
      const res = await api.claimHandle(normalized);
      setClaimed(res.handle);
      setValue(res.handle);
      setStatus('idle');
      toast.success(`@${res.handle} is yours`);
      onClaimed?.(res.handle);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not claim handle');
    } finally {
      setClaiming(false);
    }
  }

  const hint = {
    idle: unchanged && claimed ? `@${claimed} is your handle` : 'Letters, numbers and underscores. 3-20 characters.',
    checking: 'Checking availability…',
    available: `@${normalized} is available`,
    taken: `@${normalized} is taken`,
    invalid: 'Use 3-20 lowercase letters, numbers or underscores, starting with a letter.',
  }[status];

  const hintColor =
    status === 'available' || (status === 'idle' && unchanged)
      ? 'text-auriga-success'
      : status === 'taken' || status === 'invalid'
        ? 'text-auriga-error'
        : 'text-auriga-text-secondary';

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-auriga-text-secondary/70">@</span>
          <input
            type="text"
            inputMode="text"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="yourname"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full h-11 rounded-xl border border-auriga-border/70 bg-white pl-7 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-auriga-accent/20 focus:border-auriga-accent/40"
          />
        </div>
        <Button
          type="button"
          onClick={claim}
          loading={claiming}
          disabled={status !== 'available'}
        >
          {ctaLabel}
        </Button>
      </div>
      <p className={clsx('mt-1.5 text-xs', hintColor)}>{hint}</p>
    </div>
  );
}
