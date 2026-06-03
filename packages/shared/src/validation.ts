import { SUPPORTED_COUNTRIES } from './constants';

export function isValidIban(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  if (cleaned.length < 15 || cleaned.length > 34) return false;
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) return false;

  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) =>
    (ch.charCodeAt(0) - 55).toString()
  );

  let remainder = '';
  for (const digit of numeric) {
    remainder = String(Number(remainder + digit) % 97);
  }
  return Number(remainder) === 1;
}

export function isSupportedCountry(code: string): boolean {
  return (SUPPORTED_COUNTRIES as readonly string[]).includes(code.toUpperCase());
}

/**
 * Generates a syntactically valid IBAN (passes the mod-97 check) for the given
 * country. Used to provision additional currency accounts. Not a real,
 * bank-issued IBAN — purely for representing internal multi-currency wallets.
 */
export function generateIban(countryCode = 'DE', bbanLength = 18): string {
  const cc = countryCode.toUpperCase();
  let bban = '';
  for (let i = 0; i < bbanLength; i++) {
    bban += Math.floor(Math.random() * 10).toString();
  }

  const rearranged = `${bban}${cc}00`;
  const numeric = rearranged.replace(/[A-Z]/g, (ch) =>
    (ch.charCodeAt(0) - 55).toString()
  );

  let remainder = '';
  for (const digit of numeric) {
    remainder = String(Number(remainder + digit) % 97);
  }
  const checkDigits = String(98 - Number(remainder)).padStart(2, '0');

  return `${cc}${checkDigits}${bban}`;
}

export function formatIban(iban: string): string {
  return iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
}

export function formatMoney(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

export const HANDLE_MIN_LENGTH = 3;
export const HANDLE_MAX_LENGTH = 20;

/** Handles reserved for routes/system use and therefore not claimable. */
export const RESERVED_HANDLES = new Set([
  'auriga', 'admin', 'support', 'help', 'about', 'login', 'signup', 'onboarding',
  'app', 'api', 'pay', 'me', 'settings', 'business', 'careers', 'legal', 'terms',
  'privacy', 'blog', 'root', 'system', 'security', 'team', 'contact', 'billing',
]);

/**
 * Normalises a payment handle: strips a leading "@", lowercases, trims.
 * Does not validate — pair with isValidHandle.
 */
export function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@+/, '').toLowerCase();
}

/**
 * A handle is 3-20 chars of [a-z0-9_], must start with a letter, and is not
 * reserved. Accepts an optional leading "@".
 */
export function isValidHandle(handle: string): boolean {
  const h = normalizeHandle(handle);
  if (h.length < HANDLE_MIN_LENGTH || h.length > HANDLE_MAX_LENGTH) return false;
  if (!/^[a-z][a-z0-9_]*$/.test(h)) return false;
  if (RESERVED_HANDLES.has(h)) return false;
  return true;
}
