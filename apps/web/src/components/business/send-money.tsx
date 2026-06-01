import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function SendMoney() {
  return (
    <section className="py-24 sm:py-32 bg-atlas-bg-subtle">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Transfer calculator visual */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl p-6 border border-atlas-border shadow-sm max-w-sm mx-auto lg:mx-0">
              <p className="text-sm font-medium mb-4">Send SEPA transfer</p>

              <div className="space-y-3 mb-4">
                <div className="bg-atlas-bg-subtle rounded-xl p-4">
                  <p className="text-[10px] text-atlas-text-secondary mb-1">You send</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-medium">10,000.00</p>
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-atlas-border">
                      <span className="text-sm">🇪🇺</span>
                      <span className="text-sm font-medium">EUR</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-atlas-accent/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-atlas-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>

                <div className="bg-atlas-bg-subtle rounded-xl p-4">
                  <p className="text-[10px] text-atlas-text-secondary mb-1">Recipient gets</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-medium">10,000.00</p>
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-atlas-border">
                      <span className="text-sm">🇪🇺</span>
                      <span className="text-sm font-medium">EUR</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-atlas-text-secondary">Transfer fee</span>
                  <span className="font-medium">€0.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-atlas-text-secondary">Arrives</span>
                  <span className="font-medium text-atlas-success">Seconds (SEPA Instant)</span>
                </div>
              </div>

              <Button className="w-full">Send money</Button>
            </div>
          </div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <span className="inline-block text-xs font-medium uppercase tracking-wider text-atlas-text-secondary bg-white px-3 py-1 rounded-full mb-4">
              Send payments
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4">
              Pay suppliers and teams in seconds
            </h2>
            <p className="text-lg text-atlas-text-secondary leading-relaxed mb-6 max-w-md">
              Fast SEPA transfers that arrive in seconds, not days. Pay invoices, contractors, and partners across Europe with transparent, low fees.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                'SEPA Instant — 95% of transfers arrive in under 20 seconds',
                'Batch payments — pay up to 100 recipients at once',
                'Schedule recurring payments for rent, salaries, subscriptions',
                'Full audit trail for every transaction',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-atlas-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <Button asChild>
              <Link href="/onboarding">Start sending</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
