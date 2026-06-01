import { Container } from '@/components/ui/container';

const points = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'EU regulated',
    description: 'Licensed by the ACPR. Your funds are safeguarded in dedicated accounts at top institutions.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: 'Bank-grade encryption',
    description: 'PSD2 Strong Customer Authentication. Biometric login. Data encrypted at rest and in transit.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: 'Fraud protection',
    description: 'Dedicated security team monitoring 24/7. Freeze your card instantly if anything looks off.',
  },
];

export function SecurityBand() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            Disappoint thieves
          </h2>
          <p className="mt-4 text-lg text-atlas-text-secondary">
            Your money is protected by the same standards as traditional banks.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {points.map((point) => (
            <div key={point.title} className="text-center p-8 rounded-2xl bg-atlas-bg-subtle border border-atlas-border">
              <div className="w-12 h-12 mx-auto rounded-xl bg-atlas-accent/20 flex items-center justify-center text-atlas-text-primary mb-4">
                {point.icon}
              </div>
              <h3 className="font-medium mb-2">{point.title}</h3>
              <p className="text-sm text-atlas-text-secondary leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>

        {/* People trust band */}
        <div className="mt-16 flex flex-col items-center">
          <div className="flex -space-x-3 mb-4">
            {[3, 7, 11, 15, 20, 25, 30, 33].map((i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/48?img=${i}`}
                alt=""
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
            ))}
          </div>
          <p className="text-sm text-atlas-text-secondary">
            Trusted by remote workers, freelancers, and founders across Europe
          </p>
        </div>
      </Container>
    </section>
  );
}
