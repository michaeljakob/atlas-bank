import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { mdxComponents } from '@/components/mdx/mdx-components';
import { categoryLabel, getAllHelpSlugs, getHelpArticleBySlug } from '@/lib/help';
import { SITE_URL } from '@/lib/site';

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllHelpSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = getHelpArticleBySlug(slug);
  if (!article) return { title: 'Not found' };
  return {
    title: `${article.title} — Help`,
    description: article.description,
    alternates: { canonical: `/help/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${SITE_URL}/help/${article.slug}`,
      type: 'article',
    },
  };
}

export default async function HelpArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = getHelpArticleBySlug(slug);
  if (!article) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.description,
    articleSection: categoryLabel(article.category),
    publisher: { '@type': 'Organization', name: 'Auriga Money' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/help/${article.slug}` },
  };

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Container className="max-w-2xl py-12 sm:py-16">
          <nav className="flex items-center gap-1.5 text-sm text-auriga-text-secondary" aria-label="Breadcrumb">
            <Link href="/help" className="hover:text-auriga-text-primary">Help</Link>
            <span aria-hidden>/</span>
            <span className="text-auriga-text-primary">{categoryLabel(article.category)}</span>
          </nav>

          <article className="mt-6">
            <header className="mb-8 border-b border-auriga-border/60 pb-8">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-auriga-text-primary">
                {article.title}
              </h1>
              <p className="mt-3 text-lg text-auriga-text-secondary">{article.description}</p>
            </header>

            <div>
              <MDXRemote source={article.content} components={mdxComponents} />
            </div>
          </article>

          <div className="mt-12 rounded-2xl border border-auriga-border/70 bg-auriga-bg-subtle p-6 text-center">
            <p className="text-sm font-medium text-auriga-text-primary">Still need help?</p>
            <p className="mt-1 text-sm text-auriga-text-secondary">
              Our team is available 24/7 from the in-app Support page.
            </p>
            <Link
              href="/app/support"
              className="mt-4 inline-flex h-10 items-center rounded-full bg-auriga-text-primary px-5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              Contact support
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
