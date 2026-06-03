'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

// Persists across client-side navigations (resets on full page reload) so the
// slide-in only plays once per session, not every time the navbar remounts.
let navHasAnimated = false;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [animateNav] = useState(() => !navHasAnimated);
  const pathname = usePathname();

  const isPersonal = pathname === '/';
  const isBusiness = pathname?.startsWith('/business') ?? false;

  useEffect(() => {
    navHasAnimated = true;
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-3 sm:top-4 z-50 px-4">
        <div className={`${animateNav ? 'animate-nav-slide-in ' : ''}mx-auto w-full max-w-3xl`}>
          <nav
            className={`relative flex items-center justify-between gap-3 rounded-full pl-5 pr-2 h-14 border border-white/10 bg-auriga-black transition-[box-shadow] duration-300 ${
              scrolled
                ? 'shadow-[0_8px_30px_rgb(0_0_0/0.30)]'
                : 'shadow-[0_8px_30px_rgb(0_0_0/0.18)]'
            }`}
          >
            <Link href="/" className="flex items-center shrink-0" onClick={closeMobile}>
              <img src="/auriga-lockup-light.svg" alt="Auriga" className="h-7 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              <Link
                href="/"
                aria-current={isPersonal ? 'page' : undefined}
                className={`px-3.5 py-2 text-sm font-semibold rounded-full hover:bg-white/10 hover:text-white transition-colors ${
                  isPersonal ? 'text-white' : 'text-white/60'
                }`}
              >
                Personal
              </Link>
              <Link
                href="/business"
                aria-current={isBusiness ? 'page' : undefined}
                className={`px-3.5 py-2 text-sm font-semibold rounded-full hover:bg-white/10 hover:text-white transition-colors ${
                  isBusiness ? 'text-white' : 'text-white/60'
                }`}
              >
                Business
              </Link>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex text-sm font-medium rounded-full text-white/90 hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                size="sm"
                className="h-10 text-sm font-semibold px-5 rounded-full bg-white text-auriga-black hover:bg-white/90"
                asChild
              >
                <Link href="/onboarding">Open account</Link>
              </Button>

              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                <span className="sr-only">Menu</span>
                <span
                  className={`absolute h-[1.5px] w-4 bg-white rounded-full transition-all duration-300 ${
                    mobileOpen ? 'rotate-45 translate-y-0' : '-translate-y-[5px]'
                  }`}
                />
                <span
                  className={`absolute h-[1.5px] w-4 bg-white rounded-full transition-all duration-300 ${
                    mobileOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute h-[1.5px] w-4 bg-white rounded-full transition-all duration-300 ${
                    mobileOpen ? '-rotate-45 translate-y-0' : 'translate-y-[5px]'
                  }`}
                />
              </button>
            </div>
          </nav>

          {/* Mobile slide-in panel */}
          <div
            className={`md:hidden origin-top transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              mobileOpen
                ? 'mt-2 opacity-100 translate-y-0 scale-100 pointer-events-auto'
                : '-translate-y-2 opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <div className="rounded-3xl border border-white/10 bg-auriga-black shadow-[0_8px_30px_rgb(0_0_0/0.30)] p-3 space-y-1">
              <Link
                href="/"
                aria-current={isPersonal ? 'page' : undefined}
                className={`block px-4 py-3 text-[15px] font-semibold rounded-2xl hover:bg-white/10 hover:text-white transition-colors ${
                  isPersonal ? 'text-white' : 'text-white/60'
                }`}
                onClick={closeMobile}
              >
                Personal
              </Link>
              <Link
                href="/business"
                aria-current={isBusiness ? 'page' : undefined}
                className={`block px-4 py-3 text-[15px] font-semibold rounded-2xl hover:bg-white/10 hover:text-white transition-colors ${
                  isBusiness ? 'text-white' : 'text-white/60'
                }`}
                onClick={closeMobile}
              >
                Business
              </Link>
              <div className="flex gap-2.5 pt-2 px-1 pb-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-11 font-medium rounded-full text-sm text-white border border-white/20 hover:bg-white/10"
                  asChild
                >
                  <Link href="/login" onClick={closeMobile}>
                    Log in
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-11 font-semibold rounded-full text-sm bg-white text-auriga-black hover:bg-white/90"
                  asChild
                >
                  <Link href="/onboarding" onClick={closeMobile}>
                    Open account
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to offset the fixed floating navbar */}
      <div aria-hidden className="h-20 sm:h-24" />
    </>
  );
}
