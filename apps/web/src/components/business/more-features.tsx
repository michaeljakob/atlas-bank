import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';
import { Highlight } from '@/components/ui/highlight';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: 'Team debit cards',
    description: 'Issue physical and virtual cards for your team. Set individual spending limits and get real-time notifications.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: 'Accounting sync',
    description: 'Connect to Xero, QuickBooks, or your preferred accounting software. Automatic categorisation and reconciliation.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: 'Team controls',
    description: 'Set custom permissions for every team member. Approve payments, control card access, and manage budgets.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Business analytics',
    description: 'Real-time cashflow insights. See where your money goes, track spending by category, and export reports.',
  },
];

export function MoreFeatures() {
  return (
    <section className="py-24 sm:py-36 bg-white">
      <Container>
        <Reveal as="div" className="max-w-3xl mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-atlas-text-primary leading-[1.1]">
            Everything else your{' '}
            <Highlight>business needs</Highlight>
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-atlas-text-secondary leading-relaxed">
            From team cards to accounting sync — the tools to run your finances,
            built into one beautifully simple account.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {features.map((feature, i) => (
            <Reveal
              key={feature.title}
              delay={(i % 2) * 90}
              className="rounded-3xl border border-atlas-border/70 bg-white p-7 sm:p-8"
            >
              <div className="w-12 h-12 rounded-2xl bg-atlas-accent/15 flex items-center justify-center text-atlas-text-primary mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-atlas-text-primary tracking-tight mb-2">{feature.title}</h3>
              <p className="text-[15px] text-atlas-text-secondary leading-relaxed">{feature.description}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
