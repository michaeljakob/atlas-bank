'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { HelpArticleMeta } from '@/lib/help';

interface HelpSearchProps {
  articles: HelpArticleMeta[];
  categories: readonly { id: string; label: string }[];
}

export function HelpSearch({ articles, categories }: HelpSearchProps) {
  const [query, setQuery] = useState('');

  const normalized = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalized) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(normalized) ||
        a.description.toLowerCase().includes(normalized),
    );
  }, [articles, normalized]);

  const grouped = useMemo(() => {
    return categories
      .map((cat) => ({
        ...cat,
        items: filtered.filter((a) => a.category === cat.id),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, filtered]);

  return (
    <div>
      <div className="relative mb-10">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-auriga-text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help articles…"
          aria-label="Search help articles"
          className="h-14 w-full rounded-2xl border border-auriga-border/70 bg-white pl-12 pr-4 text-base text-auriga-text-primary placeholder:text-auriga-text-secondary/60 focus:border-auriga-accent/40 focus:outline-none focus:ring-2 focus:ring-auriga-accent/20"
        />
      </div>

      {grouped.length === 0 ? (
        <p className="py-12 text-center text-sm text-auriga-text-secondary">
          No articles match “{query}”. Try a different search.
        </p>
      ) : (
        <div className="space-y-10">
          {grouped.map((cat) => (
            <section key={cat.id}>
              <h2 className="mb-3 text-[13px] font-medium uppercase tracking-wider text-auriga-text-secondary">
                {cat.label}
              </h2>
              <div className="space-y-2">
                {cat.items.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/help/${article.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-auriga-border/70 bg-white px-5 py-4 transition-all hover:border-auriga-accent/40 hover:shadow-sm"
                  >
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-auriga-text-primary">{article.title}</h3>
                      <p className="mt-0.5 truncate text-xs text-auriga-text-secondary">{article.description}</p>
                    </div>
                    <svg className="ml-4 h-4 w-4 shrink-0 text-auriga-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
