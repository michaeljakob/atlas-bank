import { Container } from '@/components/ui/container';

const audiences = [
  {
    title: 'Remote workers',
    description: 'Get paid from EU companies directly into your own EUR IBAN. No more intermediaries eating your salary.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    title: 'Freelancers',
    description: 'Invoice EU clients with your own IBAN. Look professional. Get paid faster. Spend with your card anywhere.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    title: 'Founders & solopreneurs',
    description: 'A personal EUR account that\'s ready before your company incorporation clears. Start operating immediately.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
];

export function WhoItsFor() {
  return (
    <section id="who-its-for" className="py-24 sm:py-32">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            Built for people who live across borders
          </h2>
          <p className="mt-4 text-lg text-atlas-text-secondary max-w-xl mx-auto">
            Traditional banks weren&apos;t designed for your life. Atlas was.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {audiences.map((audience) => (
            <div key={audience.title} className="rounded-2xl p-8 bg-atlas-bg-subtle border border-atlas-border">
              <div className="w-12 h-12 rounded-xl bg-atlas-accent/20 flex items-center justify-center text-atlas-text-primary mb-6">
                {audience.icon}
              </div>
              <h3 className="text-lg font-medium mb-3">{audience.title}</h3>
              <p className="text-sm text-atlas-text-secondary leading-relaxed">{audience.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
