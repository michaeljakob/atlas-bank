import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';

export function BusinessCTA() {
  return (
    <section className="py-24 sm:py-36 bg-auriga-dark-surface">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal direction="right">
            <span className="text-xs font-bold text-auriga-accent uppercase tracking-widest">Auriga Business</span>
            <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Built for business too
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-auriga-heather-300 leading-relaxed max-w-md">
              A business account that actually works for freelancers, startups, and small businesses across Europe.
              Real IBAN, team cards, and instant SEPA — without the bureaucracy.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button size="lg" className="text-base px-8 rounded-full font-semibold" asChild>
                <Link href="/business">Learn more</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal direction="left" delay={80}>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <img
                src="/images/business-hero.png"
                alt="Business professionals using Auriga"
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { title: 'Dedicated business IBAN', description: 'Professional EUR IBAN in your company name.' },
                { title: 'Team expense cards', description: 'Issue cards for employees. Set limits, track in real-time.' },
                { title: 'Instant SEPA for invoices', description: 'Get paid in seconds — not days. 24/7.' },
                { title: 'No monthly fees', description: 'Free to open. No hidden charges.' },
              ].map((item) => (
                <div key={item.title} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-auriga-heather-300 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
