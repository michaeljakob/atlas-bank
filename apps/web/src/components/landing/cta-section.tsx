import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/ui/reveal';

export function CTASection() {
  return (
    <section className="py-24 sm:py-36 bg-white">
      <Container>
        <Reveal direction="scale" className="relative bg-atlas-dark-surface rounded-[2.5rem] px-8 py-24 sm:px-16 sm:py-32 overflow-hidden">
          <div className="relative max-w-4xl">
            <h2 className="text-5xl sm:text-7xl lg:text-8xl text-white font-heading uppercase tracking-tight leading-[0.9]">
              Your money,
              <br />
              <span className="text-atlas-accent">finally on your side.</span>
            </h2>
            <p className="mt-10 text-xl sm:text-2xl text-atlas-heather-300 max-w-xl leading-relaxed">
              A real EUR IBAN, a Mastercard, and instant SEPA transfers.
              No hidden fees. No branch visits. No compromises.
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-5">
              <Button size="lg" className="text-lg px-10 py-5 rounded-full font-bold" asChild>
                <Link href="/onboarding">Open your free account</Link>
              </Button>
              <span className="text-sm text-atlas-heather-400 font-bold">
                60 seconds &middot; Free forever &middot; EU regulated
              </span>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-atlas-heather-300">Or get the app</span>
              <div className="flex flex-wrap gap-3">
                {[
                  {
                    label: 'App Store',
                    sub: 'Download on the',
                    path: 'M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z',
                  },
                  {
                    label: 'Google Play',
                    sub: 'Get it on',
                    path: 'M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z',
                  },
                ].map((store) => (
                  <span
                    key={store.label}
                    className="inline-flex items-center gap-2.5 rounded-2xl bg-white/10 px-5 py-3 text-white ring-1 ring-white/15"
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d={store.path} />
                    </svg>
                    <span className="text-left leading-tight">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-atlas-heather-300">
                        {store.sub}
                      </span>
                      <span className="block text-[15px] font-bold -mt-0.5">{store.label}</span>
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
