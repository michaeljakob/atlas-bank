import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';

export function BusinessCTA() {
  return (
    <section className="py-24 sm:py-36 bg-white">
      <Container>
        <Reveal direction="scale" className="relative bg-atlas-dark-surface rounded-[2.5rem] px-8 py-20 sm:px-16 sm:py-28 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <h2 className="text-4xl sm:text-6xl lg:text-7xl text-white font-heading uppercase tracking-tight leading-[0.92]">
                Open your
                <br />
                <span className="text-atlas-accent">business account.</span>
              </h2>
              <p className="mt-8 text-lg sm:text-xl text-atlas-heather-300 max-w-md leading-relaxed">
                A EUR IBAN, team cards, and instant SEPA transfers. No branch visit,
                no paperwork, no monthly fee.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                <Button size="lg" className="text-base px-8 rounded-full font-semibold" asChild>
                  <Link href="/onboarding">Open a business account</Link>
                </Button>
                <Button variant="ghost" size="lg" className="text-base px-8 rounded-full font-semibold text-white hover:bg-white/10">
                  Talk to sales
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-3">
                {['EUR IBAN', 'Team cards', 'Batch payments', 'SEPA Instant', 'Accounting sync', 'Role-based access'].map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5 rounded-2xl bg-white/5 px-4 py-3.5 ring-1 ring-white/10">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-atlas-accent/20 shrink-0">
                      <svg className="w-3 h-3 text-atlas-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <span className="text-sm font-semibold text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
