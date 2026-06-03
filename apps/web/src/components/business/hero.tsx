import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { CardChip, ContactlessIcon } from '@/components/ui/card-art';
import { Reveal } from '@/components/ui/reveal';
import { Highlight } from '@/components/ui/highlight';

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-auriga-black shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function BusinessCard() {
  return (
    <div className="relative aspect-[1.586/1] w-full rounded-2xl bg-auriga-black p-6 overflow-hidden shadow-[0_24px_60px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
      <div className="pointer-events-none absolute -inset-x-10 -top-24 h-40 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <img src="/auriga-lockup-light.svg" alt="Auriga" className="h-5 w-auto opacity-90" />
          <span className="text-[9px] font-bold tracking-widest text-white/50">BUSINESS</span>
        </div>
        <div className="flex items-center gap-3">
          <CardChip className="h-7 w-9" />
          <ContactlessIcon className="h-5 w-5 text-white/55" />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="mb-2 flex gap-2 font-mono text-sm tracking-[0.12em] text-white/70">
              <span>••••</span><span>••••</span><span>••••</span><span className="text-white">7842</span>
            </div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/80">Your Company Name</p>
          </div>
          <img src="/logos/mastercard.svg" alt="Mastercard" className="h-8" />
        </div>
      </div>
    </div>
  );
}

export function BusinessHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center pt-4 sm:pt-10 pb-16 sm:pb-24">
          {/* Left */}
          <Reveal direction="up">
            <p className="text-[11px] font-bold uppercase tracking-widest text-auriga-text-secondary mb-5">
              Auriga Business
            </p>

            <h1 className="text-[2.75rem] sm:text-6xl lg:text-[4.25rem] font-bold tracking-tight text-auriga-text-primary leading-[1.08]">
              The business account for{' '}
              <Highlight>going global</Highlight>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-auriga-text-secondary leading-relaxed max-w-lg">
              Make payments, get paid, and manage finances in EUR. One account for
              your startup, agency, or freelance practice — without the bureaucracy.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
              <Button size="lg" className="text-base px-8 py-4 rounded-full font-semibold" asChild>
                <Link href="/onboarding">Open a business account</Link>
              </Button>
              <Button variant="secondary" size="lg" className="text-base px-8 py-4 rounded-full font-semibold">
                Contact sales
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-auriga-text-secondary">
              <span className="flex items-center gap-1.5"><CheckIcon />No monthly fee</span>
              <span className="flex items-center gap-1.5"><CheckIcon />Team cards</span>
              <span className="flex items-center gap-1.5"><CheckIcon />EU regulated</span>
            </div>
          </Reveal>

          {/* Right */}
          <Reveal direction="up" delay={120} className="mx-auto w-full max-w-sm pb-8 lg:max-w-md lg:pb-0">
            <div className="relative">
              <div className="-rotate-3">
                <BusinessCard />
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
