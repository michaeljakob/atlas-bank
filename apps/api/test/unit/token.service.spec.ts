import { TokenService } from '@/modules/auth/token.service';
import { CacheService } from '@/common/cache/cache.service';
import { makeConfig } from './helpers';

describe('TokenService', () => {
  let cache: CacheService;
  let tokens: TokenService;

  beforeEach(() => {
    cache = new CacheService(); // in-memory (no REDIS_URL)
    tokens = new TokenService(makeConfig(), cache);
  });

  it('issues and verifies an access token', () => {
    const token = tokens.generateAccessToken('user-1');
    expect(tokens.verifyAccessToken(token)).toBe('user-1');
  });

  it('rejects a tampered token', () => {
    const token = tokens.generateAccessToken('user-1');
    const tampered = token.slice(0, -2) + (token.endsWith('aa') ? 'bb' : 'aa');
    expect(tokens.verifyAccessToken(tampered)).toBeNull();
  });

  it('rejects an expired token', () => {
    const shortLived = new TokenService(makeConfig({ 'app.accessTokenTtlSeconds': -1 }), cache);
    const token = shortLived.generateAccessToken('user-1');
    expect(shortLived.verifyAccessToken(token)).toBeNull();
  });

  it('issues a single-use refresh token that rotates on consume', async () => {
    const refresh = await tokens.issueRefreshToken('user-1');
    expect(await tokens.consumeRefreshToken(refresh)).toBe('user-1');
    // Second use must fail (rotation / single-use).
    expect(await tokens.consumeRefreshToken(refresh)).toBeNull();
  });

  it('revokes a refresh token', async () => {
    const refresh = await tokens.issueRefreshToken('user-1');
    await tokens.revokeRefreshToken(refresh);
    expect(await tokens.consumeRefreshToken(refresh)).toBeNull();
  });
});
