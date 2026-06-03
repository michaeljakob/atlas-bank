import Link from 'next/link';
import type { Route } from 'next';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';

const features = [
  {
    accent: 'bg-auriga-accent/10',
    iconBg: 'bg-auriga-accent/20',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
    badge: 'Your own IBAN',
    headline: 'Receive money like a local',
    description:
      'Get a dedicated EUR IBAN in your name. Receive salary, freelance payments, and invoices directly — no intermediaries. Set up direct debits for rent, insurance, and subscriptions.',
    details: [
      'Dedicated IBAN in your name',
      'Receive salary & invoices',
      'Set up direct debits',
    ],
    cta: 'Get your IBAN',
    href: '/onboarding',
  },
  {
    accent: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    badge: 'Mastercard Debit',
    headline: 'Spend anywhere, instantly',
    description:
      'Get a virtual Mastercard the second you sign up. Pay online, tap in stores, withdraw cash worldwide. Added to Apple Pay and Google Pay instantly — no waiting for plastic.',
    details: [
      'Virtual card in seconds',
      'Apple Pay & Google Pay',
      'Works in 210+ countries',
    ],
    cta: 'Get your card',
    href: '/onboarding',
  },
  {
    accent: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    badge: 'SEPA Instant',
    headline: 'Send money in seconds',
    description:
      'Send and receive money across Europe in under 10 seconds, 24/7, including weekends and holidays. No markup on the exchange rate. No transfer limits that lock you out.',
    details: [
      'Under 10 seconds, 24/7',
      '0% FX markup',
      'Free SEPA transfers',
    ],
    cta: 'Start sending',
    href: '/onboarding',
  },
];

function FeatureCheck() {
  return (
    <svg className="w-4 h-4 text-auriga-accent-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export function Features() {
  return (
    <section className="py-24 sm:py-36 bg-white">
      <Container>
        <Reveal as="div" className="max-w-3xl mb-16 sm:mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-auriga-text-primary leading-[1.1]">
            Make your money{' '}
            <span className="text-auriga-accent-700">do more</span>
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-auriga-text-secondary leading-relaxed">
            Receive, spend, and manage money across Europe as easily as you do at home. 
            One account. Everything you need.
          </p>
        </Reveal>

        <div className="space-y-6">
          {features.map((feature, i) => (
            <Reveal
              key={feature.headline}
              delay={i * 90}
              className={`${feature.accent} rounded-3xl p-8 sm:p-12 lg:p-14`}
            >
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
                <div>
                  <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center text-auriga-text-primary mb-6`}>
                    {feature.icon}
                  </div>
                  <span className="text-xs font-bold text-auriga-text-secondary uppercase tracking-widest">{feature.badge}</span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-auriga-text-primary tracking-tight mt-2 mb-4">
                    {feature.headline}
                  </h3>
                  <p className="text-base sm:text-lg text-auriga-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                  <Link
                    href={feature.href as Route}
                    className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-auriga-text-primary hover:text-auriga-accent-600 transition-colors group"
                  >
                    {feature.cta}
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
                <div>
                  <ul className="space-y-4">
                    {feature.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-3">
                        <FeatureCheck />
                        <span className="text-base font-medium text-auriga-text-primary">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
