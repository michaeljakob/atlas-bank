import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';
import { Highlight } from '@/components/ui/highlight';

export function Testimonials() {
  return (
    <section className="py-24 sm:py-36 bg-white">
      <Container>
        <Reveal as="div" className="max-w-2xl mx-auto text-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-atlas-text-secondary">
            Early access
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-atlas-text-primary leading-[1.1]">
            We&apos;re onboarding our{' '}
            <Highlight>first businesses</Highlight>{' '}
            now
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-atlas-text-secondary leading-relaxed max-w-lg mx-auto">
            Atlas Business is in early access. If you run a startup, agency, or
            freelance practice across Europe, apply for priority access.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
