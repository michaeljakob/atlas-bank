import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';
import { Highlight } from '@/components/ui/highlight';

const solutions = [
  {
    badge: 'Startups',
    title: 'For startups',
    description: 'Get a business IBAN and issue team cards from day one. Accept investment and pay suppliers without waiting for legacy bank approval.',
  },
  {
    badge: 'Freelancers',
    title: 'For freelancers',
    description: 'A professional EUR IBAN for invoicing European clients. Get paid fast, spend with your card, keep business and personal separate.',
  },
  {
    badge: 'Agencies',
    title: 'For agencies',
    description: 'Manage client payments, issue cards per team member, and keep project finances organised with role-based access.',
  },
];

export function Solutions() {
  return (
    <section className="py-24 sm:py-36 bg-atlas-bg-subtle border-y border-atlas-border">
      <Container>
        <Reveal as="div" className="max-w-3xl mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-atlas-text-primary leading-[1.1]">
            Built for{' '}
            <Highlight>how you work</Highlight>
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-atlas-text-secondary leading-relaxed">
            Whether you&apos;re raising your first round or running a team across
            borders, Atlas Business adapts to the way you operate.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
          {solutions.map((solution, i) => (
            <Reveal
              key={solution.title}
              delay={i * 90}
              className="rounded-3xl bg-white border border-atlas-border/70 p-7 sm:p-8 flex flex-col"
            >
              <span className="text-[11px] font-bold uppercase tracking-widest text-atlas-text-secondary">
                {solution.badge}
              </span>
              <h3 className="mt-3 text-xl font-bold text-atlas-text-primary tracking-tight">{solution.title}</h3>
              <p className="mt-2 text-[15px] text-atlas-text-secondary leading-relaxed">{solution.description}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
