import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthService } from '@/modules/auth/auth.service';
import { TokenService } from '@/modules/auth/token.service';
import { CacheService } from '@/common/cache/cache.service';
import { UserEntity } from '@/database/entities';
import { makeConfig } from './helpers';

describe('AuthService (OTP)', () => {
  let cache: CacheService;
  let tokens: TokenService;
  let email: { sendOtp: jest.Mock };
  let userRepo: jest.Mocked<Pick<Repository<UserEntity>, 'findOne' | 'create' | 'save'>>;
  let auth: AuthService;

  beforeEach(() => {
    cache = new CacheService();
    tokens = new TokenService(makeConfig(), cache);
    email = { sendOtp: jest.fn().mockResolvedValue(undefined) };
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn((u) => u as UserEntity),
      save: jest.fn(async (u: any) => ({ id: u.id || 'user-1', ...u })),
    } as any;
    auth = new AuthService(
      userRepo as any,
      makeConfig(),
      email as any,
      cache,
      tokens,
    );
  });

  it('sends an OTP and stores it in the cache', async () => {
    const res = await auth.sendMagicLink('a@b.com');
    expect(res.sent).toBe(true);
    expect(email.sendOtp).toHaveBeenCalledWith('a@b.com', expect.stringMatching(/^\d{6}$/));
    expect(await cache.get('otp:a@b.com')).toMatch(/^\d{6}$/);
  });

  it('verifies a correct OTP, creates a new user and issues tokens', async () => {
    userRepo.findOne.mockResolvedValue(null);
    await auth.sendMagicLink('new@user.com');
    const code = (await cache.get('otp:new@user.com'))!;

    const result = await auth.verifyOtp('new@user.com', code);

    expect(result.isNewUser).toBe(true);
    expect(result.token).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(tokens.verifyAccessToken(result.token)).toBeTruthy();
    // OTP is single-use.
    expect(await cache.get('otp:new@user.com')).toBeNull();
  });

  it('rejects an invalid OTP', async () => {
    await auth.sendMagicLink('x@y.com');
    await expect(auth.verifyOtp('x@y.com', '000000')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects when no OTP was issued', async () => {
    await expect(auth.verifyOtp('none@x.com', '123456')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refresh rotates tokens and rejects a reused refresh token', async () => {
    userRepo.findOne.mockResolvedValue(null);
    await auth.sendMagicLink('r@user.com');
    const code = (await cache.get('otp:r@user.com'))!;
    const { refreshToken } = await auth.verifyOtp('r@user.com', code);

    const refreshed = await auth.refresh(refreshToken);
    expect(refreshed.token).toBeTruthy();
    await expect(auth.refresh(refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
