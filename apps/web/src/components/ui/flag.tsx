'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type FlagProps = {
  code: string;
  name?: string;
  className?: string;
};

/**
 * Renders a real round country flag (vendored circle SVGs in /public/flags).
 * Served locally for zero external requests and no layout shift. If the asset
 * ever fails to load, it gracefully falls back to a neutral coloured disc with
 * the ISO code instead of a broken-image icon.
 */
export function Flag({ code, name, className }: FlagProps) {
  const iso = code.toLowerCase();
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <span
        role="img"
        aria-label={name ? `${name} flag` : `${code} flag`}
        title={code.toUpperCase()}
        className={cn(
          'inline-flex items-center justify-center shrink-0 rounded-full',
          'bg-auriga-bg-subtle text-auriga-text-secondary ring-1 ring-black/5 shadow-sm',
          'text-[8px] font-semibold uppercase leading-none',
          className,
        )}
      >
        {iso.slice(0, 2)}
      </span>
    );
  }

  return (
    <img
      src={`/flags/${iso}.svg`}
      alt={name ? `${name} flag` : `${code} flag`}
      width={24}
      height={24}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      className={cn(
        'inline-block shrink-0 rounded-full object-cover ring-1 ring-black/5 shadow-sm',
        className
      )}
    />
  );
}
