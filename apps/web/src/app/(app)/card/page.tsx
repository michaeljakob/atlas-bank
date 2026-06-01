'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function CardPage() {
  const [frozen, setFrozen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const card = {
    last4: '4289',
    expiryMonth: 12,
    expiryYear: 28,
    cardholderName: 'Alex Johnson',
    type: 'virtual' as const,
    status: frozen ? 'frozen' : 'active',
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl">
      <h1 className="text-2xl font-medium mb-8">Card</h1>

      {/* Card visual */}
      <div className="bg-atlas-dark-surface rounded-2xl p-8 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-atlas-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center justify-between mb-12">
            <span className="text-sm text-gray-400 uppercase tracking-wide">Virtual card</span>
            <span className="text-sm font-medium">Mastercard</span>
          </div>
          <p className="font-mono text-2xl tracking-widest mb-6">
            •••• •••• •••• {card.last4}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Cardholder</p>
              <p className="text-sm">{card.cardholderName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Expires</p>
              <p className="text-sm">{String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <p className={`text-sm ${frozen ? 'text-amber-400' : 'text-atlas-accent'}`}>
                {frozen ? 'Frozen' : 'Active'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Button
          variant="secondary"
          size="sm"
          className="flex-col gap-1 h-auto py-4"
          onClick={() => setFrozen(!frozen)}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={frozen
              ? "M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              : "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            } />
          </svg>
          <span className="text-xs">{frozen ? 'Unfreeze' : 'Freeze'}</span>
        </Button>

        <Button variant="secondary" size="sm" className="flex-col gap-1 h-auto py-4" onClick={() => setShowDetails(!showDetails)}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs">Show PIN</span>
        </Button>

        <Button variant="secondary" size="sm" className="flex-col gap-1 h-auto py-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
          <span className="text-xs">Add to wallet</span>
        </Button>

        <Button variant="secondary" size="sm" className="flex-col gap-1 h-auto py-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs">Limits</span>
        </Button>
      </div>

      {/* Card settings */}
      <div className="bg-white rounded-2xl border border-atlas-border p-6">
        <h2 className="text-sm font-medium text-atlas-text-secondary mb-4">Card controls</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Online payments</p>
              <p className="text-xs text-atlas-text-secondary">Allow card for online transactions</p>
            </div>
            <button className="w-11 h-6 bg-atlas-accent rounded-full relative transition-colors">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Contactless payments</p>
              <p className="text-xs text-atlas-text-secondary">Tap to pay in stores</p>
            </div>
            <button className="w-11 h-6 bg-atlas-accent rounded-full relative transition-colors">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm" />
            </button>
          </div>
        </div>

        <div className="border-t border-atlas-border mt-6 pt-6">
          <Button variant="secondary" size="sm">
            Order physical card
          </Button>
        </div>
      </div>
    </div>
  );
}
