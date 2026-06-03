import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { getAllPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Guides and explainers on borderless banking — EUR IBANs, SEPA Instant, multi-currency accounts, and getting paid across borders.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Auriga Blog',
    description: 'Guides and explainers on borderless banking.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogIndexPage() {
  const posts = getAllPosts();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Auriga Blog',
    url: `${SITE_URL}/blog`,
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      url: `${SITE_URL}/blog/${p.slug}`,
    })),
  };

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Container className="max-w-3xl py-12 sm:py-16">
          <header className="mb-10 sm:mb-14">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-auriga-text-primary">Blog</h1>
            <p className="mt-3 text-lg text-auriga-text-secondary">
              Guides and explainers on borderless banking.
            </p>
          </header>

          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block rounded-2xl border border-auriga-border/70 bg-white p-6 transition-all hover:border-auriga-accent/40 hover:shadow-sm"
              >
                <div className="flex items-center gap-2 text-xs text-auriga-text-secondary">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span aria-hidden>·</span>
                  <span>{post.readingMinutes} min read</span>
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-auriga-text-primary">{post.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-auriga-text-secondary">{post.description}</p>
                {post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-auriga-bg-subtle px-2.5 py-1 text-[11px] font-medium text-auriga-text-secondary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
