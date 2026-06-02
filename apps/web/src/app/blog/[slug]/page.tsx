import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/ui/container';
import { mdxComponents } from '@/components/mdx/mdx-components';
import { getAllPostSlugs, getPostBySlug } from '@/lib/blog';
import { SITE_URL } from '@/lib/site';

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Not found' };
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: 'Atlas Bank' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
    keywords: post.tags.join(', '),
  };

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Container className="max-w-2xl py-12 sm:py-16">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-atlas-text-secondary hover:text-atlas-text-primary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            All posts
          </Link>

          <article className="mt-8">
            <header className="mb-8 border-b border-atlas-border/60 pb-8">
              <div className="flex items-center gap-2 text-xs text-atlas-text-secondary">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span aria-hidden>·</span>
                <span>{post.readingMinutes} min read</span>
              </div>
              <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-atlas-text-primary">
                {post.title}
              </h1>
              <p className="mt-3 text-lg text-atlas-text-secondary">{post.description}</p>
            </header>

            <div>
              <MDXRemote source={post.content} components={mdxComponents} />
            </div>
          </article>

          <div className="mt-12 rounded-2xl bg-atlas-dark-surface p-8 text-center">
            <h2 className="text-xl font-semibold text-white">Open your free EUR account</h2>
            <p className="mt-2 text-sm text-white/70">A real EUR IBAN and a virtual Mastercard in about a minute.</p>
            <Link
              href="/onboarding"
              className="mt-5 inline-flex h-11 items-center rounded-full bg-atlas-accent px-6 text-sm font-semibold text-atlas-dark-surface transition-transform hover:scale-[1.02]"
            >
              Get started
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
