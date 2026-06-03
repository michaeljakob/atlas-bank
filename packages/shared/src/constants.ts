export const SUPPORTED_COUNTRIES = [
  'AT', 'BE', 'DE', 'ES', 'FI', 'FR', 'IE', 'IT', 'LU', 'NL', 'PT',
] as const;

export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

export const SEPA_BIC_AURIGA = 'SWNBFR22';

export const IBAN_COUNTRY_PREFIXES = ['FR', 'DE', 'ES', 'IT', 'NL'] as const;

export const CARD_SPENDING_LIMITS = {
  daily: { min: 0, max: 50_000, default: 10_000 },
  weekly: { min: 0, max: 100_000, default: 25_000 },
  monthly: { min: 0, max: 250_000, default: 50_000 },
} as const;

export const REGULATORY_DISCLOSURE =
  'Auriga is not a bank. Banking and payment services are provided by Swan SAS, an Electronic Money Institution authorised by the ACPR (Autorité de Contrôle Prudentiel et de Résolution) in France.';

export const APP_NAME = 'Auriga Money';
export const APP_DOMAIN = 'aurigamoney.com';
