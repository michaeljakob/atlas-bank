import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { CardChip, ContactlessIcon } from '@/components/ui/card-art';
import { Reveal } from '@/components/ui/reveal';
import { Highlight } from '@/components/ui/highlight';
import { HeroCardStack } from '@/components/landing/hero-card-stack';

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-auriga-black shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function AurigaCard() {
  return (
    <div className="relative aspect-[1.586/1] w-full rounded-2xl bg-auriga-black p-5 overflow-hidden shadow-[0_24px_60px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
      {/* soft sheen */}
      <div className="pointer-events-none absolute -inset-x-10 -top-24 h-40 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <img src="/auriga-lockup-light.svg" alt="Auriga" className="h-5 w-auto opacity-90" />
          <span className="text-[9px] font-bold tracking-widest text-white/50">DEBIT</span>
        </div>
        <div className="flex items-center gap-3">
          <CardChip className="h-7 w-9" />
          <ContactlessIcon className="h-5 w-5 text-white/55" />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="mb-2 flex gap-2 font-mono text-sm tracking-[0.12em] text-white/70">
              <span>••••</span><span>••••</span><span>••••</span><span className="text-white">4521</span>
            </div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/80">A. Müller</p>
          </div>
          <img src="/logos/mastercard.svg" alt="Mastercard" className="h-8" />
        </div>
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      {/* Big, joyful real customers — swapping like cards for delight */}
      <HeroCardStack />

      {/* The card — true ISO 1.586:1 ratio — overlapping for depth */}
      <div className="pointer-events-none absolute -bottom-7 -right-3 z-30 w-[62%] max-w-[19rem] -rotate-6 sm:-right-6">
        <AurigaCard />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center pt-4 sm:pt-10 pb-16 sm:pb-24">
          {/* Left */}
          <Reveal direction="up">
            <h1 className="text-[2.75rem] sm:text-6xl lg:text-[4.25rem] font-bold tracking-tight text-auriga-text-primary leading-[1.08]">
              Your EUR account, ready in{' '}
              <Highlight>60 seconds</Highlight>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-auriga-text-secondary leading-relaxed max-w-lg">
              Open a real EUR IBAN from anywhere in Europe. Get a virtual Mastercard
              instantly. Send and receive money via SEPA in seconds. Free to open.
            </p>

            <div className="mt-8">
              <Button size="lg" className="text-base px-8 py-4 rounded-full font-semibold" asChild>
                <Link href="/onboarding">Open your free account</Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-auriga-text-secondary">
              <span className="flex items-center gap-1.5"><CheckIcon />Free forever</span>
              <span className="flex items-center gap-1.5"><CheckIcon />No paperwork</span>
              <span className="flex items-center gap-1.5"><CheckIcon />EU regulated</span>
            </div>

            {/* Social proof — real customers */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                <img
                  src="/images/avatars/avatar-cafe.png"
                  alt="Auriga customer"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-md"
                  width={44}
                  height={44}
                  loading="eager"
                />
                <img
                  src="/images/avatars/avatar-beach.png"
                  alt="Auriga customer"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-md"
                  width={44}
                  height={44}
                  loading="eager"
                />
                <div className="w-11 h-11 rounded-full ring-2 ring-white shadow-md bg-auriga-black text-white flex items-center justify-center text-[11px] font-bold">
                  50K+
                </div>
              </div>
              <div>
                <span className="sr-only">Rated 5 out of 5 stars</span>
                <div className="flex items-center gap-0.5 text-auriga-black" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78L1.58 7.62l5.82-.85L10 1.5z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-0.5 text-sm text-auriga-text-secondary">
                  <span className="font-semibold text-auriga-text-primary">Loved by 50,000+</span> Europeans across 20+ countries
                </p>
              </div>
            </div>
          </Reveal>

          {/* Right */}
          <Reveal direction="up" delay={120} className="mx-auto w-full max-w-sm pb-8 lg:max-w-md lg:pb-0">
            <HeroVisual />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
