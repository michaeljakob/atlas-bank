import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export function BusinessCTA() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="relative bg-gradient-to-br from-atlas-dark-surface to-[#0a2600] rounded-[2rem] p-12 sm:p-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-atlas-accent/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-atlas-accent/5 blur-3xl" />

          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-medium text-white tracking-tight">
                Ready to take the<br />next step?
              </h2>
              <p className="mt-4 text-lg text-gray-300 max-w-md">
                Open your Atlas Business account today. No paperwork, no branch visits, no waiting.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/onboarding">Open a business account</Link>
                </Button>
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
                  Talk to sales
                </Button>
              </div>
            </div>

            <div className="hidden lg:flex justify-end">
              <div className="space-y-3">
                {['EUR IBAN', 'Team cards', 'Batch payments', 'SEPA Instant', 'Accounting sync', 'Role-based access'].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-atlas-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
