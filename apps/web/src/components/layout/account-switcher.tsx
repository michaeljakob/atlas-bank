'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface Account {
  id: string;
  name: string;
  type: 'personal' | 'business';
  role?: string;
}

const MOCK_ACCOUNTS: Account[] = [
  { id: '1', name: 'Michael Jakob', type: 'personal' },
  { id: '2', name: 'Auriga Technologies GmbH', type: 'business', role: 'Admin' },
  { id: '3', name: 'Nordic Ventures AB', type: 'business', role: 'Member' },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function AccountSwitcher() {
  const [activeAccount, setActiveAccount] = React.useState<Account>(MOCK_ACCOUNTS[0]);
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left',
            'transition-all duration-150 cursor-pointer select-none',
            'hover:bg-auriga-bg-subtle/80 focus:outline-none',
            open && 'bg-auriga-bg-subtle',
          )}
          aria-label="Switch account"
        >
          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-auriga-accent text-auriga-black flex items-center justify-center text-[11px] font-semibold">
            {getInitials(activeAccount.name)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-auriga-text-primary truncate">
              {activeAccount.name}
            </p>
            <p className="text-[11px] text-auriga-text-secondary capitalize">
              {activeAccount.type}
            </p>
          </div>
          <svg
            className={cn(
              'w-3.5 h-3.5 text-auriga-text-secondary/60 flex-shrink-0 transition-transform duration-200',
              open && 'rotate-180',
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-[224px]">
        <DropdownMenuLabel>Accounts</DropdownMenuLabel>
        {MOCK_ACCOUNTS.map((account) => {
          const isActive = account.id === activeAccount.id;
          return (
            <DropdownMenuItem
              key={account.id}
              onSelect={() => setActiveAccount(account)}
              className={cn('gap-2.5', isActive && 'bg-auriga-bg-subtle')}
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-md bg-auriga-accent/90 text-auriga-black flex items-center justify-center text-[10px] font-semibold">
                {getInitials(account.name)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium truncate">{account.name}</p>
                {account.role && (
                  <p className="text-[10px] text-auriga-text-secondary">{account.role}</p>
                )}
              </div>
              {isActive && (
                <svg
                  className="w-3.5 h-3.5 text-auriga-accent flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="text-auriga-text-secondary">
          <Link href="/app/settings">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-auriga-text-secondary">
          <Link href="/app/support">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            Support
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
