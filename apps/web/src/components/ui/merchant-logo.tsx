'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { logoUrl, hashColor } from '@/lib/merchants';

interface MerchantLogoProps {
  name: string;
  size?: number;
  className?: string;
}

export function MerchantLogo({ name, size = 36, className }: MerchantLogoProps) {
  const [failed, setFailed] = useState(false);
  const src = logoUrl(name, size * 2);
  const dimension = { width: size, height: size };

  if (failed || !src) {
    return (
      <div
        className={clsx(
          'rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
          hashColor(name),
          className,
        )}
        style={dimension}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className={clsx('rounded-full overflow-hidden flex-shrink-0 bg-auriga-bg-subtle', className)}
      style={dimension}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
