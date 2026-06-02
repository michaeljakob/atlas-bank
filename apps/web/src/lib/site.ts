/**
 * Canonical, absolute site origin used for metadata, OG tags, sitemap and
 * robots. Prefer an explicit production URL; fall back to the public app URL
 * (local dev) and finally the production domain.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://atlasbank.io'
).replace(/\/$/, '');

/** Public, indexable marketing routes. App routes are auth-gated and excluded. */
export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/business',
  '/careers',
  '/legal',
  '/privacy',
  '/terms',
  '/login',
  '/onboarding',
] as const;
