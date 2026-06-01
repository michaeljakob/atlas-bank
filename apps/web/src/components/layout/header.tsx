'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-atlas-border">
      <Container>
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-atlas-dark-surface flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-medium text-lg text-atlas-text-primary">Atlas</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm text-atlas-text-secondary hover:text-atlas-text-primary transition-colors">
              How it works
            </Link>
            <Link href="#who-its-for" className="text-sm text-atlas-text-secondary hover:text-atlas-text-primary transition-colors">
              Who it&apos;s for
            </Link>
            <Link href="#faq" className="text-sm text-atlas-text-secondary hover:text-atlas-text-primary transition-colors">
              FAQ
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/onboarding">Open your account</Link>
            </Button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-atlas-bg-subtle"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-atlas-border pt-4 space-y-3">
            <Link href="#how-it-works" className="block text-sm text-atlas-text-secondary py-2" onClick={() => setMobileOpen(false)}>
              How it works
            </Link>
            <Link href="#who-its-for" className="block text-sm text-atlas-text-secondary py-2" onClick={() => setMobileOpen(false)}>
              Who it&apos;s for
            </Link>
            <Link href="#faq" className="block text-sm text-atlas-text-secondary py-2" onClick={() => setMobileOpen(false)}>
              FAQ
            </Link>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" size="sm" className="flex-1">
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" className="flex-1">
                <Link href="/onboarding">Open account</Link>
              </Button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
