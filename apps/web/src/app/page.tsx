import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/landing/hero';
import { TrustStrip } from '@/components/landing/trust-strip';
import { PricingComparison } from '@/components/landing/pricing-comparison';
import { Bento } from '@/components/landing/bento';
import { Delight } from '@/components/landing/delight';
import { SecurityBand } from '@/components/landing/security-band';
import { Testimonials } from '@/components/landing/testimonials';
import { BusinessCTA } from '@/components/landing/business-cta';
import { FlagsBand } from '@/components/landing/flags-band';
import { FAQ } from '@/components/landing/faq';
import { CTASection } from '@/components/landing/cta-section';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <PricingComparison />
        <Bento />
        <Delight />
        <SecurityBand />
        <Testimonials />
        <BusinessCTA />
        <FAQ />
        <FlagsBand />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
