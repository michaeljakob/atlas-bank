import { Container } from '@/components/ui/container';
import Link from 'next/link';

export const metadata = { title: 'About — Atlas' };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-atlas-bg-subtle py-16">
      <Container className="max-w-2xl">
        <Link href="/" className="inline-flex items-center mb-10">
          <img src="/atlas-lockup.svg" alt="Atlas" className="h-8 w-auto" />
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight mb-8">About Atlas</h1>
        <div className="bg-white rounded-2xl border border-atlas-border/70 p-8 space-y-6 text-sm text-atlas-text-secondary leading-relaxed">
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">Our Mission</h2>
            <p>Atlas is building the financial infrastructure for a borderless world. We believe that moving money across borders should be instant, transparent, and affordable for everyone.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">What We Offer</h2>
            <p>Multi-currency accounts with local bank details in EUR, USD, GBP, and CHF. Send and receive international transfers at the real exchange rate. Virtual and physical debit cards accepted worldwide. All from one beautiful, easy-to-use app.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">Regulation</h2>
            <p>Atlas is not a bank. Banking and payment services are provided by Swan SAS, an Electronic Money Institution authorised by the ACPR (Autorité de Contrôle Prudentiel et de Résolution) in France. Your funds are safeguarded in dedicated accounts at regulated European credit institutions in accordance with EU e-money regulations. As e-money, your funds are not covered by a deposit guarantee scheme such as the FGDR.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">Contact</h2>
            <p>Email: support@atlasbank.io</p>
            <p>Headquarters: Berlin, Germany</p>
          </section>
        </div>
      </Container>
    </div>
  );
}
