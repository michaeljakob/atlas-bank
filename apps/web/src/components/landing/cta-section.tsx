import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export function CTASection() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="relative bg-atlas-dark-surface rounded-[2rem] p-12 sm:p-20 text-center overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-atlas-accent/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-atlas-accent/5 blur-3xl" />

          <div className="relative">
            <div className="flex justify-center mb-6">
              <div className="flex -space-x-3">
                {[4, 9, 14, 18, 23, 28, 35, 40, 45, 50].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/40?img=${i}`}
                    alt=""
                    className="w-9 h-9 rounded-full border-2 border-atlas-dark-surface"
                  />
                ))}
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white tracking-tight">
              Meet money without borders
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-lg mx-auto">
              Join thousands already using Atlas for their international life. Open your account in under a minute.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/onboarding">Open your free account</Link>
              </Button>
              <p className="text-xs text-gray-500">No credit check. No minimum balance. No BS.</p>
            </div>

            {/* Scrolling benefits */}
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {['EUR IBAN', 'Virtual card', 'Apple Pay', 'SEPA Instant', 'No hidden fees', 'Local IBANs', 'Freeze card', '24/7'].map((item) => (
                <span key={item} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
