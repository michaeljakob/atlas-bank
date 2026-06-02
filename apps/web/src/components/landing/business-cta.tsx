import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';

export function BusinessCTA() {
  return (
    <section className="py-24 sm:py-36 bg-atlas-dark-surface">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal direction="right">
            <span className="text-xs font-bold text-atlas-accent uppercase tracking-widest">Atlas Business</span>
            <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Built for business too
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-atlas-heather-300 leading-relaxed max-w-md">
              A business account that actually works for freelancers, startups, and small businesses across Europe.
              Real IBAN, team cards, and instant SEPA — without the bureaucracy.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button size="lg" className="text-base px-8 rounded-full font-semibold" asChild>
                <Link href="/business">Learn more</Link>
              </Button>
            </div>
          </Reveal>

          <div className="space-y-4">
            {[
              { title: 'Dedicated business IBAN', description: 'Receive client payments and pay suppliers with a professional EUR IBAN in your company name.' },
              { title: 'Team expense cards', description: 'Issue virtual and physical cards for employees. Set limits, track spending in real-time.' },
              { title: 'Instant SEPA for invoices', description: 'Get paid in seconds — not days. Issue invoices and receive SEPA Instant transfers 24/7.' },
              { title: 'No monthly fees', description: 'Free to open. No hidden charges. Scale your business without worrying about banking costs.' },
            ].map((item, i) => (
              <Reveal key={item.title} direction="left" delay={i * 80} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
                <p className="text-sm text-atlas-heather-300 leading-relaxed">{item.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
