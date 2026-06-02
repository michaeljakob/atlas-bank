import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { CacheService } from '@/common/cache/cache.service';

interface AccessTokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

const REFRESH_PREFIX = 'refresh:';

@Injectable()
export class TokenService {
  constructor(
    private readonly config: ConfigService,
    private readonly cache: CacheService,
  ) {}

  private get secret(): string {
    const secret = this.config.get<string>('app.jwtSecret');
    if (!secret) {
      if (this.config.get('app.env') === 'production') {
        throw new Error('JWT_SECRET must be set in production');
      }
      return 'dev-secret';
    }
    return secret;
  }

  generateAccessToken(userId: string): string {
    const ttl = this.config.get<number>('app.accessTokenTtlSeconds')!;
    const now = Math.floor(Date.now() / 1000);
    const payload: AccessTokenPayload = { sub: userId, iat: now, exp: now + ttl };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', this.secret).update(encodedPayload).digest('base64url');
    return `${encodedPayload}.${signature}`;
  }

  verifyAccessToken(token: string): string | null {
    try {
      const [encodedPayload, signature] = token.split('.');
      if (!encodedPayload || !signature) return null;

      const expectedSig = createHmac('sha256', this.secret).update(encodedPayload).digest('base64url');
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expectedSig);
      if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;

      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString()) as AccessTokenPayload;
      if (typeof payload.exp !== 'number' || Math.floor(Date.now() / 1000) >= payload.exp) {
        return null;
      }
      return payload.sub;
    } catch {
      return null;
    }
  }

  async issueRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    const ttl = this.config.get<number>('app.refreshTokenTtlSeconds')!;
    await this.cache.set(`${REFRESH_PREFIX}${token}`, userId, ttl);
    return token;
  }

  async consumeRefreshToken(token: string): Promise<string | null> {
    const key = `${REFRESH_PREFIX}${token}`;
    const userId = await this.cache.get(key);
    if (!userId) return null;
    // Rotate: a refresh token is single-use.
    await this.cache.del(key);
    return userId;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.cache.del(`${REFRESH_PREFIX}${token}`);
  }
}
