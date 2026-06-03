import Link from 'next/link';
import type { Route } from 'next';
import type { ComponentProps } from 'react';

/**
 * Styling for MDX content (blog posts, help articles). Kept token-consistent
 * with the rest of the app since the project doesn't use @tailwindcss/typography.
 */
export const mdxComponents = {
  h1: (props: ComponentProps<'h1'>) => (
    <h1 className="mt-12 mb-4 text-3xl font-semibold tracking-tight text-auriga-text-primary" {...props} />
  ),
  h2: (props: ComponentProps<'h2'>) => (
    <h2 className="mt-10 mb-3 text-2xl font-semibold tracking-tight text-auriga-text-primary" {...props} />
  ),
  h3: (props: ComponentProps<'h3'>) => (
    <h3 className="mt-8 mb-2 text-xl font-semibold tracking-tight text-auriga-text-primary" {...props} />
  ),
  p: (props: ComponentProps<'p'>) => (
    <p className="my-4 text-[15px] leading-relaxed text-auriga-text-secondary" {...props} />
  ),
  ul: (props: ComponentProps<'ul'>) => (
    <ul className="my-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-auriga-text-secondary" {...props} />
  ),
  ol: (props: ComponentProps<'ol'>) => (
    <ol className="my-4 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-auriga-text-secondary" {...props} />
  ),
  li: (props: ComponentProps<'li'>) => <li className="pl-1" {...props} />,
  a: ({ href = '#', ...props }: ComponentProps<'a'>) => {
    const external = /^https?:\/\//.test(href);
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-auriga-text-primary underline decoration-auriga-accent decoration-2 underline-offset-2 hover:text-auriga-accent-700"
          {...props}
        />
      );
    }
    return (
      <Link
        href={href as Route}
        className="font-medium text-auriga-text-primary underline decoration-auriga-accent decoration-2 underline-offset-2 hover:text-auriga-accent-700"
        {...props}
      />
    );
  },
  blockquote: (props: ComponentProps<'blockquote'>) => (
    <blockquote className="my-6 border-l-2 border-auriga-accent pl-4 italic text-auriga-text-secondary" {...props} />
  ),
  code: (props: ComponentProps<'code'>) => (
    <code className="rounded-md bg-auriga-bg-subtle px-1.5 py-0.5 font-mono text-[13px] text-auriga-text-primary" {...props} />
  ),
  pre: (props: ComponentProps<'pre'>) => (
    <pre className="my-6 overflow-x-auto rounded-2xl bg-auriga-dark-surface p-4 text-[13px] text-white" {...props} />
  ),
  hr: (props: ComponentProps<'hr'>) => <hr className="my-10 border-auriga-border/60" {...props} />,
  strong: (props: ComponentProps<'strong'>) => (
    <strong className="font-semibold text-auriga-text-primary" {...props} />
  ),
};
