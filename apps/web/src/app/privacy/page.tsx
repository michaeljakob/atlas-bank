import { Container } from '@/components/ui/container';
import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — Atlas' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-atlas-bg-subtle py-16">
      <Container className="max-w-2xl">
        <Link href="/" className="inline-flex items-center mb-10">
          <img src="/atlas-lockup.svg" alt="Atlas" className="h-8 w-auto" />
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight mb-8">Privacy Policy</h1>
        <div className="bg-white rounded-2xl border border-atlas-border/70 p-8 space-y-6 text-sm text-atlas-text-secondary leading-relaxed">
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">Data We Collect</h2>
            <p>We collect personal information necessary to provide banking services: your name, email, date of birth, nationality, address, and identity documents for KYC verification. We also collect transaction data, device information, and usage analytics.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">How We Use Your Data</h2>
            <p>Your data is used to operate your account, process transactions, comply with regulatory obligations (AML/KYC), improve our services, and send you important account notifications. We never sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">Data Sharing</h2>
            <p>We share data with Swan SAS (our banking partner) to operate your account, payment networks to process transactions, and regulatory authorities as required by law. All partners are bound by strict data protection agreements.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">Your Rights</h2>
            <p>Under GDPR, you have the right to access, correct, delete, or export your personal data. You can exercise these rights by contacting privacy@atlasbank.io or through your account settings.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">Data Security</h2>
            <p>We use AES-256 encryption at rest, TLS 1.3 in transit, and store data in EU-based data centers. Our infrastructure undergoes regular security audits and penetration testing.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-atlas-text-primary mb-2">Cookies</h2>
            <p>We use essential cookies for authentication and session management. Analytics cookies are only set with your explicit consent. You can manage cookie preferences in your browser settings.</p>
          </section>
          <p className="text-xs text-atlas-text-secondary/60 pt-4 border-t border-atlas-border/50">Last updated: June 1, 2026</p>
        </div>
      </Container>
    </div>
  );
}
