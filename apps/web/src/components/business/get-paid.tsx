import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function GetPaid() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs font-medium uppercase tracking-wider text-atlas-text-secondary bg-atlas-bg-subtle px-3 py-1 rounded-full mb-4">
              Receive payments
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4">
              Get paid in EUR — instantly
            </h2>
            <p className="text-lg text-atlas-text-secondary leading-relaxed mb-6 max-w-md">
              Accept payments from clients across Europe with your own IBAN. No hidden fees. Create invoices, share payment links, or receive SEPA transfers directly.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                'Dedicated EUR IBAN for your business',
                'SEPA Instant — receive in seconds, 24/7',
                'Create and send professional invoices',
                'Automatic payment reconciliation',
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
              <Link href="/onboarding">Open a business account</Link>
            </Button>
          </div>

          {/* Visual — multi-currency account */}
          <div className="bg-atlas-bg-subtle rounded-3xl p-8 border border-atlas-border">
            <div className="space-y-3">
              {/* EUR Balance */}
              <div className="bg-white rounded-xl p-5 border border-atlas-border shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">🇪🇺</div>
                    <div>
                      <p className="font-medium">EUR</p>
                      <p className="text-xs text-atlas-text-secondary font-mono">DE89 3704 0044 ••••</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg">€47,213.18</p>
                    <p className="text-xs text-atlas-success">+€3,200 today</p>
                  </div>
                </div>
              </div>

              {/* Incoming payments */}
              <div className="bg-white rounded-xl p-4 border border-atlas-border">
                <p className="text-xs text-atlas-text-secondary mb-3 uppercase tracking-wide">Recent incoming</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                        <svg className="w-3 h-3 text-atlas-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">TechCorp GmbH</p>
                        <p className="text-[10px] text-atlas-text-secondary">Invoice #1082</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-atlas-success">+€12,500.00</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                        <svg className="w-3 h-3 text-atlas-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">DesignStudio BV</p>
                        <p className="text-[10px] text-atlas-text-secondary">Retainer — June</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-atlas-success">+€4,800.00</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                        <svg className="w-3 h-3 text-atlas-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Startup Labs</p>
                        <p className="text-[10px] text-atlas-text-secondary">Project milestone</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-atlas-success">+€8,400.00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
