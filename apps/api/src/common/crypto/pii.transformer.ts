import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ValueTransformer } from 'typeorm';

/**
 * Column-level encryption for PII at rest using AES-256-GCM.
 *
 * Format stored in the DB: base64(iv).base64(authTag).base64(ciphertext)
 * prefixed with "enc:v1:" so plaintext legacy rows (and empty strings) pass
 * through untouched, enabling a gradual migration.
 *
 * The key comes from ENCRYPTION_KEY (64 hex chars = 32 bytes). When unset in
 * non-production, values are stored as plaintext so local dev/tests work; in
 * production a missing key throws.
 */
const PREFIX = 'enc:v1:';

function getKey(): Buffer | null {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY is required in production');
    }
    return null;
  }
  const key = Buffer.from(hex, 'hex');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
  }
  return key;
}

function encrypt(plaintext: string): string {
  const key = getKey();
  if (!key) return plaintext;

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('base64')}.${tag.toString('base64')}.${enc.toString('base64')}`;
}

function decrypt(stored: string): string {
  if (!stored.startsWith(PREFIX)) return stored; // legacy plaintext
  const key = getKey();
  if (!key) return stored;

  const [ivB64, tagB64, dataB64] = stored.slice(PREFIX.length).split('.');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

/** TypeORM transformer for string columns holding PII. */
export const encryptedColumn: ValueTransformer = {
  to: (value: string | null | undefined): string | null | undefined => {
    if (value === null || value === undefined || value === '') return value;
    return encrypt(value);
  },
  from: (value: string | null | undefined): string | null | undefined => {
    if (value === null || value === undefined || value === '') return value;
    return decrypt(value);
  },
};

/** Transformer for JSON columns holding PII (e.g. residence address). */
export const encryptedJsonColumn: ValueTransformer = {
  to: (value: unknown): string | null => {
    if (value === null || value === undefined) return null;
    return encrypt(JSON.stringify(value));
  },
  from: (value: string | null | undefined): unknown => {
    if (value === null || value === undefined || value === '') return value;
    try {
      return JSON.parse(decrypt(value));
    } catch {
      return value;
    }
  },
};
