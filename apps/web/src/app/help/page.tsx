import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { HelpSearch } from '@/components/help/help-search';
import { getAllHelpArticles, HELP_CATEGORIES } from '@/lib/help';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Help Center',
  description:
    'Answers to common questions about Atlas — opening an account, funding, payments, cards, payment @handles, and security.',
  alternates: { canonical: '/help' },
  openGraph: {
    title: 'Atlas Help Center',
    description: 'Answers to common questions about Atlas.',
    url: `${SITE_URL}/help`,
    type: 'website',
  },
};

export default function HelpPage() {
  const articles = getAllHelpArticles();

  return (
    <>
      <Header />
      <main>
        <Container className="max-w-3xl py-12 sm:py-16">
          <header className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-atlas-text-primary">
              How can we help?
            </h1>
            <p className="mt-3 text-lg text-atlas-text-secondary">
              Search our guides, or browse by topic below.
            </p>
          </header>

          <HelpSearch articles={articles} categories={HELP_CATEGORIES} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
