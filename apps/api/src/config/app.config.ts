import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET,
  // Short-lived access token; refreshed via the long-lived refresh token.
  accessTokenTtlSeconds: parseInt(process.env.ACCESS_TOKEN_TTL || '3600', 10),
  refreshTokenTtlSeconds: parseInt(process.env.REFRESH_TOKEN_TTL || String(60 * 60 * 24 * 30), 10),
  // 32-byte hex key used for column-level PII encryption (AES-256-GCM).
  encryptionKey: process.env.ENCRYPTION_KEY,
  cookieDomain: process.env.COOKIE_DOMAIN,
}));
