import Link from 'next/link';
import type { Route } from 'next';
import { Container } from '@/components/ui/container';
import { REGULATORY_DISCLOSURE } from '@atlas-bank/shared';

type FooterLink = { label: string; href: Route | string };

const FOOTER_SECTIONS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Open account', href: '/onboarding' },
      { label: 'Blog', href: '/blog' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Help center', href: '/help' },
      { label: 'Support', href: '/app/support' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of service', href: '/terms' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Legal notice', href: '/legal' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-atlas-neon text-atlas-black">
      <Container className="pt-20 pb-0">
        <div className="grid grid-cols-2 gap-y-12 gap-x-8 md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="inline-flex items-center">
              <img src="/atlas-lockup.svg" alt="Atlas" className="h-9 w-auto" />
            </Link>
            <p className="mt-5 max-w-xs text-sm font-medium leading-relaxed text-atlas-black/70">
              EUR accounts, cards, and transfers for people and businesses across Europe.
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <nav key={section.title} aria-label={section.title} className="md:col-span-2">
              <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-atlas-black">
                {section.title}
              </h2>
              <ul className="mt-5 space-y-3 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href as Route}
                      className="font-medium text-atlas-black/70 transition-colors hover:text-atlas-black"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 space-y-3 md:col-span-2 md:text-right">
            <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-atlas-black">
              Get started
            </h2>
            <Link
              href="/onboarding"
              className="inline-flex items-center rounded-full bg-atlas-black px-5 py-2.5 text-sm font-bold text-atlas-neon transition-transform hover:scale-[1.03]"
            >
              Open account
            </Link>
          </div>
        </div>

        <div className="mt-16 border-t border-atlas-black/15 pt-10">
          <p className="max-w-3xl text-xs leading-relaxed text-atlas-black/65">
            {REGULATORY_DISCLOSURE}
          </p>
          <p className="mt-3 max-w-3xl text-xs leading-relaxed text-atlas-black/65">
            Your funds are safeguarded in accordance with EU e-money regulations. Atlas does not provide
            deposit protection under the FGDR (Fonds de Garantie des Dépôts et de Résolution). Service
            availability is subject to eligibility and supported jurisdictions.
          </p>
          <p className="mt-8 text-xs font-bold uppercase tracking-wider text-atlas-black/55">
            &copy; {new Date().getFullYear()} Atlas Financial Technologies Ltd. All rights reserved.
          </p>
        </div>
      </Container>

      <div
        aria-hidden="true"
        className="pointer-events-none mt-10 select-none px-[2vw] md:mt-6"
      >
        <span className="block whitespace-nowrap text-center font-heading font-normal leading-[0.78] tracking-[-0.02em] text-atlas-black translate-y-[8%] text-[40vw] md:text-[34vw]">
          Atlas
        </span>
      </div>
    </footer>
  );
}
