import { Container } from '@/components/ui/container';
import { REGULATORY_DISCLOSURE } from '@auriga-money/shared';
import Link from 'next/link';

export const metadata = { title: 'Legal Notice — Auriga' };

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-auriga-bg-subtle py-16">
      <Container className="max-w-2xl">
        <Link href="/" className="inline-flex items-center mb-10">
          <img src="/auriga-lockup.svg" alt="Auriga" className="h-8 w-auto" />
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight mb-8">Legal Notice</h1>
        <div className="bg-white rounded-2xl border border-auriga-border/70 p-8 space-y-6 text-sm text-auriga-text-secondary leading-relaxed">
          <section>
            <h2 className="text-base font-medium text-auriga-text-primary mb-2">Company Information</h2>
            <p>Auriga Money Technologies Pte. Ltd.<br />Singapore<br />Email: legal@aurigamoney.com</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-auriga-text-primary mb-2">Regulatory Information</h2>
            <p>{REGULATORY_DISCLOSURE}</p>
            <p className="mt-3">Your funds are safeguarded in accordance with EU e-money regulations. Auriga does not provide deposit protection under the FGDR (Fonds de Garantie des Depots et de Resolution).</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-auriga-text-primary mb-2">Data Protection Officer</h2>
            <p>For data protection inquiries: privacy@aurigamoney.com</p>
          </section>
          <p className="text-xs text-auriga-text-secondary/60 pt-4 border-t border-auriga-border/50">Last updated: June 1, 2026</p>
        </div>
      </Container>
    </div>
  );
}
