import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BusinessHero } from '@/components/business/hero';
import { TrustBar } from '@/components/business/trust-bar';
import { GetPaid } from '@/components/business/get-paid';
import { SendMoney } from '@/components/business/send-money';
import { MoreFeatures } from '@/components/business/more-features';
import { Security } from '@/components/business/security';
import { Testimonials } from '@/components/business/testimonials';
import { Solutions } from '@/components/business/solutions';
import { Pricing } from '@/components/business/pricing';
import { BusinessFAQ } from '@/components/business/faq';
import { BusinessCTA } from '@/components/business/cta';

export const metadata: Metadata = {
  title: 'Atlas Business — The business account for going global',
  description:
    'Make payments, get paid, spend and manage finances across borders. The only account your startup or scale-up needs to thrive internationally.',
};

export default function BusinessPage() {
  return (
    <>
      <Header />
      <main>
        <BusinessHero />
        <TrustBar />
        <GetPaid />
        <SendMoney />
        <MoreFeatures />
        <Security />
        <Testimonials />
        <Solutions />
        <Pricing />
        <BusinessFAQ />
        <BusinessCTA />
      </main>
      <Footer />
    </>
  );
}
