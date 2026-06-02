import { Container } from '@/components/ui/container';

const partners = [
  { src: '/logos/mastercard.svg', alt: 'Mastercard', className: 'h-7' },
  { src: '/logos/apple-pay.svg', alt: 'Apple Pay', className: 'h-6' },
  { src: '/logos/google-pay.svg', alt: 'Google Pay', className: 'h-6' },
  { src: '/logos/sepa.svg', alt: 'SEPA', className: 'h-5' },
];

export function TrustStrip() {
  return (
    <section className="py-10 sm:py-12 bg-atlas-bg-subtle border-y border-atlas-border">
      <Container>
        <div className="flex flex-col items-center gap-7 text-center">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-atlas-text-secondary">
            EU-regulated · 50,000+ customers · 30+ countries
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-14 gap-y-5">
            {partners.map((p) => (
              <img
                key={p.alt}
                src={p.src}
                alt={p.alt}
                className={`${p.className} w-auto grayscale opacity-50 transition-opacity hover:opacity-80`}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
