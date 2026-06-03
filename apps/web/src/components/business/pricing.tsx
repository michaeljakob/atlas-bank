import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { Highlight } from '@/components/ui/highlight';
import Link from 'next/link';

export function Pricing() {
  return (
    <section className="py-24 sm:py-36 bg-white">
      <Container>
        <Reveal as="div" className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-auriga-text-primary leading-[1.1]">
            Simple, transparent{' '}
            <Highlight>pricing</Highlight>
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-auriga-text-secondary leading-relaxed">
            No monthly fees. No hidden markups. Just pay for what you use.
          </p>
        </Reveal>

        <Reveal direction="scale" className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border border-auriga-border p-8 sm:p-10 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)] text-left">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-auriga-border">
              <div>
                <h3 className="text-xl font-bold text-auriga-text-primary tracking-tight">Auriga Business</h3>
                <p className="text-sm text-auriga-text-secondary">Everything you need to operate globally</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-auriga-text-primary tracking-tight">€0</p>
                <p className="text-xs text-auriga-text-secondary">per month</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3.5 mb-8">
              {[
                'EUR business IBAN',
                'Virtual Mastercard',
                'SEPA transfers (€0.50/ea)',
                'SEPA Instant',
                'Team cards (up to 5)',
                'Batch payments',
                'Accounting integration',
                'Webhook notifications',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-sm text-auriga-text-primary">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-auriga-accent/20 shrink-0">
                    <svg className="w-3 h-3 text-auriga-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  {feature}
                </div>
              ))}
            </div>

            <Button size="lg" className="w-full rounded-full font-semibold" asChild>
              <Link href="/onboarding">Open your business account</Link>
            </Button>
            <p className="text-xs text-auriga-text-secondary text-center mt-3">
              No credit check. No minimum balance. Setup in under 5 minutes.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
