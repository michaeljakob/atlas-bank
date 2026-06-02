/**
 * Atlas Branding Kit — single source of truth for the official palette.
 *
 * These are the canonical brand colors. The same values are mirrored into the
 * Tailwind config (`tailwind.config.ts`) and CSS variables (`globals.css`).
 * When changing a brand color, update it here and keep the others in sync.
 *
 * Visual reference: /brand
 */

export interface BrandColor {
  /** Human-readable name from the brand guide. */
  name: string;
  /** Hex value, e.g. "#CCFF00". */
  hex: string;
  /** RGB triplet. */
  rgb: [number, number, number];
  /** Pantone Matching System reference, where defined. */
  pms?: string;
  /** Where this color should be used. */
  usage: string;
}

/** The five official Atlas brand colors. */
export const BRAND = {
  neon: {
    name: 'Robin Neon',
    hex: '#CCFF00',
    rgb: [204, 255, 0],
    pms: 'PMS 380 C',
    usage: 'Primary brand color. CTAs, highlights, key accents.',
  },
  black: {
    name: 'Robin Black',
    hex: '#1C180D',
    rgb: [28, 24, 13],
    pms: 'PMS Black 2 C',
    usage: 'Primary text and dark surfaces (nav, dark cards, footers).',
  },
  green: {
    name: 'UI Green',
    hex: '#5AC53A',
    rgb: [90, 197, 58],
    usage: 'Positive states, success, charts, money-in.',
  },
  heather1: {
    name: 'Heather #1',
    hex: '#8A8783',
    rgb: [138, 135, 131],
    pms: 'PMS Warm Gray 8 C',
    usage: 'Icons, captions, muted UI.',
  },
  heather2: {
    name: 'Heather #2',
    hex: '#B4B1AB',
    rgb: [180, 177, 171],
    pms: 'PMS Warm Gray 4 C',
    usage: 'Borders, dividers, disabled states.',
  },
  heather3: {
    name: 'Heather #3',
    hex: '#D4D0C9',
    rgb: [212, 208, 201],
    pms: 'PMS Warm Gray 1 C/U',
    usage: 'Subtle backgrounds, surfaces, fills.',
  },
} as const satisfies Record<string, BrandColor>;

/** Tints/shades derived from the brand colors, used across the UI. */
export const BRAND_SCALES = {
  /** Robin Neon (#CCFF00) accent scale. */
  accent: {
    50: '#FAFFE5',
    100: '#F2FFB3',
    200: '#E8FF80',
    400: '#DBFF4D',
    500: '#CCFF00',
    600: '#8FB300',
    700: '#6E8A00',
  },
  /** UI Green (#5AC53A) scale. */
  green: {
    50: '#F2FAEF',
    100: '#E5F6E0',
    200: '#C4EAB8',
    300: '#9FDD8D',
    400: '#7BD161',
    500: '#5AC53A',
    600: '#4CA531',
    700: '#2F8A26',
    800: '#2F661E',
  },
  /** Heather warm-gray scale (Heather #3 → #1). */
  heather: {
    50: '#F5F3F0',
    100: '#ECEAE5',
    200: '#D4D0C9',
    300: '#B4B1AB',
    400: '#8A8783',
    500: '#6F6C68',
    600: '#54514D',
    700: '#3D3B38',
  },
} as const;

/** Semantic mapping from brand colors to UI roles. */
export const BRAND_SEMANTICS = {
  background: '#FFFFFF',
  backgroundSubtle: BRAND_SCALES.heather[50],
  textPrimary: BRAND.black.hex,
  textSecondary: BRAND_SCALES.heather[500],
  border: '#E4E1DB',
  accent: BRAND.neon.hex,
  success: BRAND.green.hex,
  darkSurface: BRAND.black.hex,
} as const;

export const BRAND_LIST: BrandColor[] = Object.values(BRAND);
