import { encryptedColumn, encryptedJsonColumn } from '@/common/crypto/pii.transformer';

describe('PII transformer (AES-256-GCM)', () => {
  it('round-trips a string value', () => {
    const stored = encryptedColumn.to('Jane Doe') as string;
    expect(stored).toMatch(/^enc:v1:/);
    expect(stored).not.toContain('Jane Doe');
    expect(encryptedColumn.from(stored)).toBe('Jane Doe');
  });

  it('produces a different ciphertext each time (random IV)', () => {
    const a = encryptedColumn.to('same') as string;
    const b = encryptedColumn.to('same') as string;
    expect(a).not.toBe(b);
    expect(encryptedColumn.from(a)).toBe('same');
    expect(encryptedColumn.from(b)).toBe('same');
  });

  it('passes through empty/null/undefined untouched', () => {
    expect(encryptedColumn.to('')).toBe('');
    expect(encryptedColumn.to(null)).toBeNull();
    expect(encryptedColumn.to(undefined)).toBeUndefined();
    expect(encryptedColumn.from('')).toBe('');
  });

  it('reads legacy plaintext (no prefix) without throwing', () => {
    expect(encryptedColumn.from('legacy-plaintext')).toBe('legacy-plaintext');
  });

  it('round-trips JSON values', () => {
    const address = { line1: '1 Main St', city: 'Berlin', postalCode: '10117', country: 'DE' };
    const stored = encryptedJsonColumn.to(address) as string;
    expect(stored).toMatch(/^enc:v1:/);
    expect(encryptedJsonColumn.from(stored)).toEqual(address);
  });
});
