import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const HELP_DIR = path.join(process.cwd(), 'content/help');

export interface HelpArticleMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
}

export interface HelpArticle extends HelpArticleMeta {
  content: string;
}

/** Canonical category order + labels. Articles can reference these by id. */
export const HELP_CATEGORIES = [
  { id: 'getting-started', label: 'Getting started' },
  { id: 'accounts-ibans', label: 'Accounts & IBANs' },
  { id: 'payments', label: 'Payments & transfers' },
  { id: 'cards', label: 'Cards' },
  { id: 'security', label: 'Security' },
] as const;

const CATEGORY_INDEX = new Map<string, number>(HELP_CATEGORIES.map((c, i) => [c.id, i]));

function readArticleFile(slug: string): HelpArticle | null {
  const file = path.join(HELP_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ''),
    category: String(data.category ?? 'getting-started'),
    order: typeof data.order === 'number' ? data.order : 99,
    content,
  };
}

export function getAllHelpSlugs(): string[] {
  if (!fs.existsSync(HELP_DIR)) return [];
  return fs
    .readdirSync(HELP_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

export function getAllHelpArticles(): HelpArticleMeta[] {
  return getAllHelpSlugs()
    .map(readArticleFile)
    .filter((a): a is HelpArticle => a !== null)
    .sort((a, b) => {
      const ca = CATEGORY_INDEX.get(a.category) ?? 99;
      const cb = CATEGORY_INDEX.get(b.category) ?? 99;
      if (ca !== cb) return ca - cb;
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title);
    })
    .map(({ content: _content, ...meta }) => meta);
}

export function getHelpArticleBySlug(slug: string): HelpArticle | null {
  return readArticleFile(slug);
}

export function categoryLabel(id: string): string {
  return HELP_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
