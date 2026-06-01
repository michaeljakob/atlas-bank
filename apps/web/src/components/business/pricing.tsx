import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Pricing() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-atlas-text-secondary mb-8">
            No monthly fees for the MVP. Just pay for what you use.
          </p>

          <div className="bg-white rounded-2xl border border-atlas-border p-8 shadow-sm text-left">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-atlas-border">
              <div>
                <h3 className="text-xl font-medium">Atlas Business</h3>
                <p className="text-sm text-atlas-text-secondary">Everything you need to operate globally</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-medium">€0</p>
                <p className="text-xs text-atlas-text-secondary">per month</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
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
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-atlas-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>

            <Button size="lg" className="w-full" asChild>
              <Link href="/onboarding">Open your business account</Link>
            </Button>
            <p className="text-xs text-atlas-text-secondary text-center mt-3">
              No credit check. No minimum balance. Setup in under 5 minutes.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
