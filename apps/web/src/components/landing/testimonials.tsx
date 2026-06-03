import { Container } from '@/components/ui/container';
import { Flag } from '@/components/ui/flag';
import { Reveal } from '@/components/ui/reveal';
import { Highlight } from '@/components/ui/highlight';

const testimonials = [
  {
    quote: 'I switched from N26 after three years. Auriga gave me a real IBAN in 60 seconds — no Anmeldung, no delays. It\'s not even close.',
    name: 'Lukas M.',
    location: 'Berlin, Germany',
    code: 'DE',
  },
  {
    quote: 'Wise was fine for transfers, but Auriga is a full account. IBAN, card, instant SEPA — all in one. I closed my Wise account.',
    name: 'Carlos V.',
    location: 'Barcelona, Spain',
    code: 'ES',
  },
  {
    quote: 'Revolut kept freezing my account for "verification." Auriga has never done that. Transparent, fast, and it just works.',
    name: 'Sophie R.',
    location: 'Paris, France',
    code: 'FR',
  },
  {
    quote: 'SEPA Instant changed my freelance business. Invoices get paid in seconds, not days. No other fintech does this as well.',
    name: 'Anna K.',
    location: 'Amsterdam, Netherlands',
    code: 'NL',
  },
  {
    quote: 'Opened my account from a café in Lisbon. Had my IBAN and virtual card within a minute. Received my first payment the same day.',
    name: 'Tomás F.',
    location: 'Lisbon, Portugal',
    code: 'PT',
  },
  {
    quote: 'As an expat, getting a bank account was impossible. Auriga made it trivial. No residency proof, no appointment, no nonsense.',
    name: 'Elena D.',
    location: 'Milan, Italy',
    code: 'IT',
  },
];

function Stars() {
  return (
    <div className="mb-4">
      <span className="sr-only">Rated 5 out of 5 stars</span>
      <div className="flex gap-0.5 text-auriga-black" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-24 sm:py-36 bg-white">
      <Container>
        <Reveal as="div" className="max-w-3xl mb-14 sm:mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-auriga-text-primary leading-[1.1]">
            Loved by{' '}
            <Highlight>50,000+ Europeans</Highlight>
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-auriga-text-secondary leading-relaxed">
            Real accounts, real reviews — across 20+ countries, and counting.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <Reveal
              key={t.name}
              delay={(i % 3) * 90}
              className="bg-auriga-bg-subtle rounded-2xl p-7 border border-auriga-border flex flex-col"
            >
              <Stars />
              <p className="text-base text-auriga-text-primary leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-auriga-border">
                <Flag code={t.code} name={t.location} className="w-8 h-8" />
                <div>
                  <p className="text-sm font-semibold text-auriga-text-primary">{t.name}</p>
                  <p className="text-xs text-auriga-text-secondary">{t.location}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
