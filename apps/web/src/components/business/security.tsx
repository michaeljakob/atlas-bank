import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';
import { Highlight } from '@/components/ui/highlight';

const stats = [
  { value: '24/7', label: 'Fraud monitoring' },
  { value: '30+', label: 'Countries supported' },
  { value: '€0', label: 'Hidden fees' },
];

const points = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
    title: 'Dedicated support',
    description:
      'Our business support team is available by phone, email, and chat — wherever you are, whenever you need them.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Real-time fraud detection',
    description:
      'Every transaction is screened in real time. Suspicious activity is flagged and blocked instantly, before it reaches your account.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: 'Funds safeguarded',
    description:
      'Business funds are held in ring-fenced safeguarding accounts at top-tier credit institutions, separate from operational funds.',
  },
];

export function Security() {
  return (
    <section className="py-24 sm:py-36 bg-auriga-bg-subtle border-y border-auriga-border">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <Reveal direction="right">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-auriga-text-primary leading-[1.1]">
              Assured financial{' '}
              <Highlight>protection</Highlight>
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-auriga-text-secondary leading-relaxed max-w-md">
              Your business funds are protected by EU regulation, bank-grade encryption,
              and dedicated anti-fraud systems. Here&apos;s how we keep every euro safe.
            </p>

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
