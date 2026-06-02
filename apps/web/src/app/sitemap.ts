import type { MetadataRoute } from 'next';
import { SITE_URL, PUBLIC_ROUTES } from '@/lib/site';
import { getAllPosts } from '@/lib/blog';
import { getAllHelpArticles } from '@/lib/help';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route === '/' ? '' : route}`,
    lastModified,
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.7,
  }));

  const blogIndex: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const blogPosts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const helpIndex: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/help`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const helpArticles: MetadataRoute.Sitemap = getAllHelpArticles().map((article) => ({
    url: `${SITE_URL}/help/${article.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogIndex, ...blogPosts, ...helpIndex, ...helpArticles];
}
