const DOMAIN_MAP: Record<string, string> = {
  spotify: 'spotify.com',
  netflix: 'netflix.com',
  amazon: 'amazon.com',
  'apple store': 'apple.com',
  icloud: 'apple.com',
  chatgpt: 'openai.com',
  openai: 'openai.com',
  notion: 'notion.so',
  github: 'github.com',
  adobe: 'adobe.com',
  'youtube premium': 'youtube.com',
  youtube: 'youtube.com',
  uber: 'uber.com',
  'uber eats': 'ubereats.com',
  deliveroo: 'deliveroo.com',
  starbucks: 'starbucks.com',
  'whole foods market': 'wholefoodsmarket.com',
  lidl: 'lidl.com',
  ikea: 'ikea.com',
  decathlon: 'decathlon.com',
  zara: 'zara.com',
  shell: 'shell.com',
  lufthansa: 'lufthansa.com',
  'booking.com': 'booking.com',
  hertz: 'hertz.com',
  nobu: 'noburestaurants.com',
  'the ritz-carlton': 'ritzcarlton.com',
  'electric company': 'edf.fr',
  'side project llc': 'stripe.com',
  'freelance client': 'linear.app',
};

export function getMerchantDomain(name: string): string | null {
  if (!name) return null;
  const key = name.trim().toLowerCase();
  if (DOMAIN_MAP[key]) return DOMAIN_MAP[key];
  const slug = key.replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  if (!slug) return null;
  return `${slug}.com`;
}

/**
 * Logo URL routed through our own /api/logo proxy. The proxy injects the
 * Logo.dev token server-side, caches aggressively, and returns 404 when no
 * logo exists so callers can fall back to initials.
 */
export function logoUrl(name: string, size = 64): string | null {
  const domain = getMerchantDomain(name);
  if (!domain) return null;
  return `/api/logo/${encodeURIComponent(domain)}?size=${size}`;
}

export const CATEGORY_COLORS: Record<string, string> = {
  subscription: 'bg-auriga-black',
  shopping: 'bg-auriga-heather-600',
  food: 'bg-auriga-green-700',
  groceries: 'bg-auriga-green-500',
  transport: 'bg-auriga-heather-500',
  travel: 'bg-auriga-black',
  utilities: 'bg-auriga-heather-700',
  salary: 'bg-auriga-accent',
  freelance: 'bg-auriga-black',
  transfer: 'bg-auriga-green-500',
  other: 'bg-auriga-heather-400',
};

const INITIAL_COLORS = [
  'bg-auriga-heather-100 text-auriga-text-primary',
  'bg-auriga-green-50 text-auriga-green-700',
  'bg-auriga-accent-100 text-auriga-accent-700',
  'bg-auriga-heather-200 text-auriga-text-primary',
  'bg-auriga-green-100 text-auriga-green-800',
  'bg-auriga-heather-100 text-auriga-text-secondary',
];

export function hashColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return INITIAL_COLORS[Math.abs(h) % INITIAL_COLORS.length];
}

export function formatCategory(category?: string): string {
  if (!category) return 'Other';
  return category.charAt(0).toUpperCase() + category.slice(1);
}
