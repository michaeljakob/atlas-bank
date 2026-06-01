import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { REGULATORY_DISCLOSURE } from '@atlas-bank/shared';

export function Footer() {
  return (
    <footer className="bg-atlas-dark-surface text-atlas-dark-text">
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-atlas-accent flex items-center justify-center">
                <span className="text-atlas-text-primary font-bold text-sm">A</span>
              </div>
              <span className="font-medium text-lg">Atlas</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your account for everywhere. Banking built for people who live and earn across borders.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-sm">Product</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
              <li><Link href="/onboarding" className="hover:text-white transition-colors">Open account</Link></li>
              <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-sm">Company</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-sm">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy policy</Link></li>
              <li><Link href="/legal" className="hover:text-white transition-colors">Legal notice</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">SEPA</span>
            <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">Mastercard</span>
            <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">Apple Pay</span>
            <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">Google Pay</span>
            <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">ACPR regulated</span>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
            {REGULATORY_DISCLOSURE}
          </p>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed max-w-3xl">
            Your funds are safeguarded in accordance with EU e-money regulations. Atlas does not provide
            deposit protection under the FGDR (Fonds de Garantie des Dépôts et de Résolution). Service
            availability is subject to eligibility and supported jurisdictions.
          </p>
          <p className="text-xs text-gray-600 mt-6">
            &copy; {new Date().getFullYear()} Atlas Financial Technologies Ltd. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
