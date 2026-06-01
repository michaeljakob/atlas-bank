import { Container } from '@/components/ui/container';

const steps = [
  {
    number: '01',
    title: 'Sign up in seconds',
    description: 'Enter your email and verify with a magic link. No passwords, no friction.',
  },
  {
    number: '02',
    title: 'Verify your identity',
    description: 'Quick ID scan and selfie. Our automated KYC clears you in under a minute.',
  },
  {
    number: '03',
    title: 'Start spending',
    description: 'Your IBAN is live and your virtual card is ready for Apple Pay or Google Pay.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-atlas-bg-subtle">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            Open your account in three steps
          </h2>
          <p className="mt-4 text-lg text-atlas-text-secondary max-w-xl mx-auto">
            No branch visits. No paperwork. No waiting days for a card in the mail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="relative bg-white rounded-2xl p-8 border border-atlas-border">
              <div className="text-xs font-medium text-atlas-accent bg-atlas-dark-surface w-8 h-8 rounded-full flex items-center justify-center mb-6">
                {step.number}
              </div>
              <h3 className="text-lg font-medium mb-3">{step.title}</h3>
              <p className="text-sm text-atlas-text-secondary leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
