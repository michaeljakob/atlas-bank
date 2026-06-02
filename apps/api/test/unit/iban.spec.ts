import { isValidIban, formatIban } from '@atlas-bank/shared';

describe('IBAN validation', () => {
  it('accepts valid IBANs (mod-97)', () => {
    expect(isValidIban('FR7630006000011234567890189')).toBe(true);
    expect(isValidIban('DE89370400440532013000')).toBe(true);
    expect(isValidIban('GB29NWBK60161331926819')).toBe(true);
  });

  it('accepts IBANs with spaces and lower case', () => {
    expect(isValidIban('de89 3704 0044 0532 0130 00')).toBe(true);
  });

  it('rejects invalid checksums and malformed input', () => {
    expect(isValidIban('DE89370400440532013001')).toBe(false);
    expect(isValidIban('XX00')).toBe(false);
    expect(isValidIban('')).toBe(false);
    expect(isValidIban('1234567890123456')).toBe(false);
  });

  it('formats IBANs in groups of four', () => {
    expect(formatIban('DE89370400440532013000')).toBe('DE89 3704 0044 0532 0130 00');
  });
});
