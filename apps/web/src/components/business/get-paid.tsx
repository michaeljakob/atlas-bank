import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { Highlight } from '@/components/ui/highlight';
import Link from 'next/link';

const incoming = [
  { name: 'TechCorp GmbH', note: 'Invoice #1082', amount: '+€12,500.00' },
  { name: 'DesignStudio BV', note: 'Retainer — June', amount: '+€4,800.00' },
  { name: 'Startup Labs', note: 'Project milestone', amount: '+€8,400.00' },
];

export function GetPaid() {
  return (
    <section className="py-24 sm:py-36 bg-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal direction="right">
            <span className="text-[11px] font-bold uppercase tracking-widest text-auriga-text-secondary">
              Receive payments
            </span>
            <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-auriga-text-primary leading-[1.1]">
              Get paid in EUR —{' '}
              <Highlight>instantly</Highlight>
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-auriga-text-secondary leading-relaxed max-w-md">
              Accept payments from clients across Europe with your own IBAN. No hidden
              fees. Create invoices, share payment links, or receive SEPA transfers directly.
            </p>

            <ul className="mt-8 space-y-3.5">
              {[
                'Dedicated EUR IBAN for your business',
                'SEPA Instant — receive in seconds, 24/7',
                'Create and send professional invoices',
                'Automatic payment reconciliation',
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
                <Link href="/onboarding">Open a business account</Link>
              </Button>
            </div>
          </Reveal>

          {/* Visual — account & incoming payments */}
          <Reveal direction="left" delay={120}>
            <div className="rounded-3xl bg-auriga-bg-subtle border border-auriga-border p-6 sm:p-8">
              <div className="space-y-3">
                <div className="bg-white rounded-2xl p-5 border border-auriga-border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-auriga-accent/20 flex items-center justify-center text-xs font-bold text-auriga-text-primary">EUR</div>
                      <div>
                        <p className="text-sm font-semibold text-auriga-text-primary">EUR balance</p>
                        <p className="text-xs text-auriga-text-secondary font-mono">DE89 3704 0044 ••••</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-auriga-text-primary tracking-tight">€47,213.18</p>
                      <p className="text-xs font-semibold text-auriga-green-700">+€3,200 today</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-auriga-border">
                  <p className="text-[11px] font-bold text-auriga-text-secondary mb-3.5 uppercase tracking-widest">Recent incoming</p>
                  <div className="space-y-3.5">
                    {incoming.map((tx) => (
                      <div key={tx.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-auriga-green-50 flex items-center justify-center">
                            <svg className="w-3 h-3 text-auriga-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-auriga-text-primary">{tx.name}</p>
                            <p className="text-[11px] text-auriga-text-secondary">{tx.note}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-auriga-green-700">{tx.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
