import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

const features = [
  {
    tag: 'IBAN in 60s',
    title: 'Get paid like a local',
    description: 'Your own EUR IBAN — ready before you finish your coffee. Receive salary, invoices, or transfers from anyone in Europe.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&crop=faces',
    color: 'from-green-50 to-atlas-bg-subtle',
    stats: [
      { label: 'Setup time', value: '<60s' },
      { label: 'SEPA Instant', value: '24/7' },
    ],
  },
  {
    tag: 'Instant card',
    title: 'Spend anywhere, instantly',
    description: 'Virtual Mastercard added to Apple Pay the moment your account opens. Tap to pay everywhere — online and IRL.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
    color: 'from-purple-50 to-atlas-bg-subtle',
    stats: [
      { label: 'Countries', value: '210+' },
      { label: 'Card fee', value: '€0' },
    ],
  },
  {
    tag: 'Send money',
    title: 'Transfer in seconds, not days',
    description: 'SEPA Instant transfers arrive in seconds, 24/7. No hidden fees, no markup. What you see is what they get.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop&crop=faces',
    color: 'from-amber-50 to-atlas-bg-subtle',
    stats: [
      { label: 'Transfer fee', value: '€0.50' },
      { label: 'Speed', value: 'Seconds' },
    ],
  },
];

export function Features() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            Everything you need.<br />
            <span className="text-atlas-text-secondary">Nothing you don&apos;t.</span>
          </h2>
        </div>

        <div className="space-y-8">
          {features.map((feature, index) => (
            <div
              key={feature.tag}
              className={`rounded-3xl overflow-hidden bg-gradient-to-br ${feature.color} border border-atlas-border`}
            >
              <div className={`grid md:grid-cols-2 gap-8 p-8 sm:p-12 items-center ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'md:col-start-2' : ''}>
                  <span className="inline-block text-xs font-medium uppercase tracking-wider text-atlas-text-secondary bg-white/80 px-3 py-1 rounded-full mb-4">
                    {feature.tag}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-medium mb-4">{feature.title}</h3>
                  <p className="text-atlas-text-secondary leading-relaxed mb-6">{feature.description}</p>
                  <div className="flex gap-6 mb-6">
                    {feature.stats.map((stat) => (
                      <div key={stat.label}>
                        <p className="text-2xl font-medium">{stat.value}</p>
                        <p className="text-xs text-atlas-text-secondary">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" asChild>
                    <Link href="/onboarding">Get started</Link>
                  </Button>
                </div>
                <div className={index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}>
                  <div className="relative rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-64 sm:h-80 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
