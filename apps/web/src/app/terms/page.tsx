import { Container } from '@/components/ui/container';
import Link from 'next/link';

export const metadata = { title: 'Terms of Service — Atlas' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-atlas-bg-subtle py-16">
      <Container className="max-w-2xl">
        <Link href="/" className="inline-flex items-center mb-10">
          <img src="/atlas-lockup.svg" alt="Atlas" className="h-8 w-auto" />
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight mb-8">Terms of Service</h1>
        <div className="bg-white rounded-2xl border border-atlas-border/70 p-8 space-y-6 text-sm text-atlas-text-secondary leading-relaxed">
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">1. About Atlas</h2>
            <p>Atlas is not a bank. Banking and payment services are provided by Swan SAS, an Electronic Money Institution authorised by the ACPR (Autorité de Contrôle Prudentiel et de Résolution) in France. Your funds are safeguarded in dedicated accounts at regulated European credit institutions in accordance with EU e-money regulations. As e-money, your funds are not covered by a deposit guarantee scheme such as the FGDR.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">2. Eligibility</h2>
            <p>You must be at least 18 years old and a resident of a supported European Economic Area (EEA) country to open an Atlas account. By registering, you confirm that all information provided is accurate and complete.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">3. Account Usage</h2>
            <p>Your Atlas account may be used for lawful personal or business purposes. You agree not to use the service for any illegal activities, money laundering, or financing of terrorism.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">4. Fees</h2>
            <p>Atlas charges transparent fees for certain services. Currency conversion uses the mid-market rate plus a 0.35% markup. Instant SEPA transfers incur a €0.50 fee. Standard SEPA transfers are free. Full fee details are available in your account settings.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">5. Security</h2>
            <p>You are responsible for maintaining the security of your account credentials. Atlas uses industry-standard encryption and multi-factor authentication to protect your account. Report any unauthorized access immediately.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">6. Limitation of Liability</h2>
            <p>Atlas shall not be liable for any indirect, incidental, or consequential damages. Our total liability is limited to the amount of fees paid by you in the twelve months preceding the claim.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">7. Governing Law</h2>
            <p>These terms are governed by the laws of Germany. Any disputes shall be resolved in the courts of Berlin, Germany.</p>
          </section>
          <p className="text-xs text-atlas-text-secondary/60 pt-4 border-t border-atlas-border/50">Last updated: June 1, 2026</p>
        </div>
      </Container>
    </div>
  );
}
