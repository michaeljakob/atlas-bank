import { Container } from '@/components/ui/container';

const securityPoints = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
    title: '24/7 support',
    description: 'Our business support team is available by phone, email and chat — wherever you are.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285zM12 9v3.75m0 0h.008v.008H12V12.75z" />
      </svg>
    ),
    title: 'Fraud detection',
    description: 'Real-time monitoring on every transaction. Suspicious activity is flagged and blocked instantly.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    title: 'Funds safeguarded',
    description: 'Business funds are held in dedicated safeguarding accounts, separate from operational funds.',
  },
];

export function Security() {
  return (
    <section className="py-24 sm:py-32 bg-atlas-dark-surface text-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            Assured financial protection
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
            Your business funds are protected by EU regulations and bank-grade security infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {securityPoints.map((point) => (
            <div key={point.title} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 mx-auto rounded-xl bg-atlas-accent/20 flex items-center justify-center text-atlas-accent mb-4">
                {point.icon}
              </div>
              <h3 className="font-medium mb-2">{point.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
