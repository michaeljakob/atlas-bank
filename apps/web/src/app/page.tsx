import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/landing/hero';
import { FlagsBand } from '@/components/landing/flags-band';
import { SocialProof } from '@/components/landing/social-proof';
import { Features } from '@/components/landing/features';
import { ComparisonTable } from '@/components/landing/comparison-table';
import { SecurityBand } from '@/components/landing/security-band';
import { AppDownload } from '@/components/landing/app-download';
import { FAQ } from '@/components/landing/faq';
import { CTASection } from '@/components/landing/cta-section';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <FlagsBand />
        <Features />
        <ComparisonTable />
        <SecurityBand />
        <AppDownload />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
