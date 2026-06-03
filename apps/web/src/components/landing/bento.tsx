import Link from 'next/link';
import type { Route } from 'next';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';
import { Highlight } from '@/components/ui/highlight';
import { Flag } from '@/components/ui/flag';
import { CardChip, ContactlessIcon } from '@/components/ui/card-art';

/** App-icon style square used inside the accent pill CTA (à la bento references). */
function AppGlyph() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-auriga-accent">
      <span className="grid grid-cols-3 gap-[2px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="h-[3px] w-[3px] rounded-[1px] bg-auriga-black/80"
          />
        ))}
      </span>
    </span>
  );
}

function PillCTA({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href as Route}
      className={`group inline-flex items-center gap-2.5 rounded-full bg-auriga-black py-1.5 pl-1.5 pr-5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 ${className ?? ''}`}
    >
      <AppGlyph />
      {label}
    </Link>
  );
}

function Badge({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className={`text-[11px] font-bold uppercase tracking-widest ${
        light ? 'text-white/50' : 'text-auriga-text-secondary'
      }`}
    >
      {children}
    </span>
  );
}

const flagCluster = ['DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'AT', 'IE'];

export function Bento() {
  return (
    <section className="py-24 sm:py-36 bg-auriga-bg-subtle">
      <Container>
        <Reveal as="div" className="max-w-3xl mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-auriga-text-primary leading-[1.1]">
            One account.{' '}
            <Highlight>Everything you need.</Highlight>
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-auriga-text-secondary leading-relaxed">
            A real EUR IBAN, an instant Mastercard, lightning-fast SEPA, and
            bank-grade security — all in one beautifully simple app.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 auto-rows-[minmax(176px,auto)]">
          {/* A — Card showcase (dark, tall) */}
          <Reveal
            className="md:col-span-2 lg:col-span-4 lg:row-span-2 relative overflow-hidden rounded-3xl bg-auriga-black p-7 sm:p-8 flex flex-col"
          >
            <div className="relative">
              <Badge light>Mastercard Debit</Badge>
              <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Spend anywhere, instantly
              </h3>
              <p className="mt-3 text-[15px] text-auriga-heather-300 leading-relaxed max-w-xs">
                A virtual Mastercard the second you sign up. Add it to Apple Pay
                &amp; Google Pay and tap to pay in 210+ countries.
              </p>
            </div>

            {/* Mini card visual */}
            <div className="relative mt-8 mb-8 flex-1 flex items-center">
              <div className="relative w-full max-w-[300px] mx-auto aspect-[1.586/1] rounded-2xl bg-auriga-black p-5 overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
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
                        <span>••••</span><span>••••</span><span className="text-white">4521</span>
                      </div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-white/80">A. Müller</p>
                    </div>
                    <img src="/logos/mastercard.svg" alt="Mastercard" className="h-8" />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <PillCTA href="/onboarding" label="Get your card" />
            </div>
          </Reveal>

          {/* B — IBAN (white) */}
          <Reveal
            delay={80}
            className="lg:col-span-4 relative overflow-hidden rounded-3xl bg-white border border-auriga-border/70 p-7 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <Badge>Your own IBAN</Badge>
              <h3 className="mt-3 text-xl sm:text-2xl font-bold text-auriga-text-primary tracking-tight">
                A real IBAN, in your name
              </h3>
              <p className="mt-2 text-[15px] text-auriga-text-secondary leading-relaxed">
                Receive salary and invoices, set up direct debits — like a local.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-auriga-bg-subtle px-4 py-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-auriga-accent/20 text-xs font-bold text-auriga-text-primary">
                €
              </span>
              <span className="font-mono text-sm tracking-wide text-auriga-text-primary">
                DE89 3704 0044 •••• •••• 00
              </span>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-auriga-green-700 bg-auriga-green-50 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
          </Reveal>

          {/* C — Security (dark) */}
          <Reveal
            delay={160}
            className="md:col-span-1 lg:col-span-4 relative overflow-hidden rounded-3xl bg-auriga-black p-7 sm:p-8 flex flex-col justify-between"
          >
            <div className="relative">
              <Badge light>Security</Badge>
              <h3 className="mt-3 text-xl sm:text-2xl font-bold text-white tracking-tight">
                Protected by design
              </h3>
              <p className="mt-2 text-[15px] text-auriga-heather-300 leading-relaxed">
                EU-regulated, funds safeguarded, real-time fraud monitoring.
              </p>
            </div>
            <div className="relative mt-6 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.96 11.96 0 013.6 6 12 12 0 003 9.75c0 5.59 3.82 10.29 9 11.62 5.18-1.33 9-6.03 9-11.62 0-1.31-.21-2.57-.6-3.75h-.15a11.96 11.96 0 01-8.25-3.29z" />
                </svg>
              </span>
              <div className="text-sm">
                <p className="font-semibold text-white">ACPR regulated</p>
                <p className="text-auriga-heather-300">PSD2 · 3-D Secure · 24/7 monitoring</p>
              </div>
            </div>
          </Reveal>

          {/* D — SEPA Instant (white) */}
          <Reveal
            delay={120}
            className="lg:col-span-4 relative overflow-hidden rounded-3xl bg-white border border-auriga-border/70 p-7 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <Badge>SEPA Instant</Badge>
              <h3 className="mt-3 text-xl sm:text-2xl font-bold text-auriga-text-primary tracking-tight">
                Send money in seconds
              </h3>
              <p className="mt-2 text-[15px] text-auriga-text-secondary leading-relaxed">
                Transfers land in under 10 seconds, 24/7. Zero FX markup.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { v: '< 10s', l: 'Arrival' },
                { v: '24/7', l: 'Always on' },
                { v: '0%', l: 'FX markup' },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-auriga-bg-subtle px-3 py-3 text-center">
                  <p className="text-lg font-bold tracking-tight text-auriga-text-primary">{s.v}</p>
                  <p className="text-[11px] font-medium text-auriga-text-secondary">{s.l}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* E — Countries (white) */}
          <Reveal
            delay={200}
            className="lg:col-span-4 relative overflow-hidden rounded-3xl bg-white border border-auriga-border/70 p-7 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <Badge>30+ countries</Badge>
              <h3 className="mt-3 text-xl sm:text-2xl font-bold text-auriga-text-primary tracking-tight">
                Borderless by default
              </h3>
              <p className="mt-2 text-[15px] text-auriga-text-secondary leading-relaxed">
                Open from anywhere in the EEA. No local address required.
              </p>
            </div>
            <div className="mt-6 flex items-center">
              <div className="flex -space-x-2">
                {flagCluster.map((code) => (
                  <Flag key={code} code={code} className="h-8 w-8 ring-2 ring-white" />
                ))}
              </div>
              <span className="ml-3 text-sm font-semibold text-auriga-text-secondary">+22 more</span>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
