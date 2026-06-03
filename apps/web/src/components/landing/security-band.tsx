import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';
import { Highlight } from '@/components/ui/highlight';

const stats = [
  { value: '30+', label: 'Countries supported' },
  { value: '24/7', label: 'Fraud monitoring' },
  { value: '€0', label: 'Hidden fees' },
];

const points = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'EU regulated',
    description:
      'Licensed and supervised by the ACPR in France. Operating under full European e-money regulations across 30+ countries.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: 'Safeguarded funds',
    description:
      'Your money is held in ring-fenced accounts at top-tier European credit institutions, completely separate from operational funds.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: 'Anti-fraud protection',
    description:
      'Real-time transaction screening. Instant card freeze from the app. PSD2 Strong Customer Authentication on every payment.',
  },
];

export function SecurityBand() {
  return (
    <section className="py-24 sm:py-36 bg-auriga-bg-subtle border-y border-auriga-border">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <Reveal direction="right">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-auriga-text-primary leading-[1.1]">
              Safe at{' '}
              <Highlight>every step</Highlight>
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-auriga-text-secondary leading-relaxed max-w-md">
              Your money is protected by EU regulation, bank-grade encryption, and dedicated anti-fraud systems. Here&apos;s how we keep every euro safe.
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl sm:text-4xl font-bold text-auriga-text-primary tracking-tight">{stat.value}</p>
                  <p className="text-sm text-auriga-text-secondary font-medium mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-auriga-text-secondary mt-10 leading-relaxed max-w-md">
              Banking services provided by Swan, an Electronic Money Institution authorised by the ACPR (Autorité de Contrôle Prudentiel et de Résolution) in France.
            </p>
          </Reveal>

          <div className="space-y-6">
            {points.map((point, i) => (
              <Reveal key={point.title} direction="left" delay={i * 100} className="bg-white rounded-2xl border border-auriga-border p-7">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-auriga-accent/15 flex items-center justify-center text-auriga-text-primary shrink-0">
                    {point.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-auriga-text-primary mb-1.5">{point.title}</h3>
                    <p className="text-base text-auriga-text-secondary leading-relaxed">{point.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
