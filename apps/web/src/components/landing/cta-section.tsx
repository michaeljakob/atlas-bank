import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export function CTASection() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="bg-atlas-dark-surface rounded-3xl p-12 sm:p-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-medium text-white tracking-tight">
            Ready to open your account?
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-xl mx-auto">
            EUR IBAN in under a minute. Virtual Mastercard instantly. No branch visits, no paperwork.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/onboarding">Open your account</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
