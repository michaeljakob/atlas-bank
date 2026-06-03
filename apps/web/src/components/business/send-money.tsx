import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { Highlight } from '@/components/ui/highlight';
import Link from 'next/link';

export function SendMoney() {
  return (
    <section className="py-24 sm:py-36 bg-auriga-bg-subtle border-y border-auriga-border">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Transfer calculator visual */}
          <Reveal direction="right" className="order-2 lg:order-1">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-auriga-border shadow-sm max-w-sm mx-auto lg:mx-0">
              <p className="text-sm font-semibold text-auriga-text-primary mb-4">Send SEPA transfer</p>

              <div className="space-y-3 mb-5">
                <div className="bg-auriga-bg-subtle rounded-2xl p-4">
                  <p className="text-[11px] text-auriga-text-secondary mb-1">You send</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold tracking-tight text-auriga-text-primary">10,000.00</p>
                    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-auriga-border">
                      <span className="text-sm font-semibold">EUR</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-auriga-accent/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-auriga-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>

                <div className="bg-auriga-bg-subtle rounded-2xl p-4">
                  <p className="text-[11px] text-auriga-text-secondary mb-1">Recipient gets</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold tracking-tight text-auriga-text-primary">10,000.00</p>
                    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-auriga-border">
                      <span className="text-sm font-semibold">EUR</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-auriga-text-secondary">Transfer fee</span>
                  <span className="font-semibold text-auriga-text-primary">€0.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-auriga-text-secondary">Arrives</span>
                  <span className="font-semibold text-auriga-green-700">Seconds (SEPA Instant)</span>
                </div>
              </div>

              <Button className="w-full rounded-full font-semibold">Send money</Button>
            </div>
          </Reveal>

          {/* Copy */}
          <Reveal direction="left" delay={120} className="order-1 lg:order-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-auriga-text-secondary">
              Send payments
            </span>
            <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-auriga-text-primary leading-[1.1]">
              Pay suppliers and teams in{' '}
              <Highlight>seconds</Highlight>
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-auriga-text-secondary leading-relaxed max-w-md">
              Fast SEPA transfers that arrive in seconds, not days. Pay invoices,
              contractors, and partners across Europe with transparent, low fees.
            </p>

            <ul className="mt-8 space-y-3.5">
              {[
                'SEPA Instant — 95% of transfers arrive in under 20 seconds',
                'Batch payments — pay up to 100 recipients at once',
                'Schedule recurring payments for rent, salaries, subscriptions',
                'Full audit trail for every transaction',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-base text-auriga-text-primary">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-auriga-accent/20 shrink-0">
                    <svg className="w-3 h-3 text-auriga-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button size="lg" className="text-base px-8 rounded-full font-semibold" asChild>
                <Link href="/onboarding">Start sending</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
