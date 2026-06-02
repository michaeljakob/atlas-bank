import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomInt } from 'crypto';
import { UserEntity } from '@/database/entities';
import { EmailService } from '@/modules/email/email.service';
import { CacheService } from '@/common/cache/cache.service';
import { TokenService } from './token.service';

const OTP_PREFIX = 'otp:';
const OTP_TTL_SECONDS = 10 * 60;

export interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly config: ConfigService,
    private readonly email: EmailService,
    private readonly cache: CacheService,
    private readonly tokens: TokenService,
  ) {}

  async sendMagicLink(email: string): Promise<{ sent: boolean }> {
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    await this.cache.set(`${OTP_PREFIX}${email}`, code, OTP_TTL_SECONDS);

    await this.email.sendOtp(email, code);
    // Never log the OTP outside development.
    if (this.config.get('app.env') !== 'production') {
      this.logger.debug(`OTP for ${email}: ${code}`);
    }

    return { sent: true };
  }

  async verifyOtp(
    email: string,
    code: string,
  ): Promise<AuthTokens & { isNewUser: boolean }> {
    const key = `${OTP_PREFIX}${email}`;
    const stored = await this.cache.get(key);
    if (!stored || stored !== code) {
      throw new UnauthorizedException('Invalid or expired code');
    }
    await this.cache.del(key);

    let user = await this.userRepo.findOne({ where: { email } });
    const isNewUser = !user;

    if (!user) {
      user = this.userRepo.create({
        email,
        emailVerified: true,
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: '',
        residenceCountry: '',
      });
      user = await this.userRepo.save(user);
    } else {
      user.emailVerified = true;
      user.lastLoginAt = new Date();
      await this.userRepo.save(user);
    }

    const tokens = await this.issueTokens(user.id);
    return { ...tokens, isNewUser };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const userId = await this.tokens.consumeRefreshToken(refreshToken);
    if (!userId) throw new UnauthorizedException('Invalid or expired refresh token');
    return this.issueTokens(userId);
  }

  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) await this.tokens.revokeRefreshToken(refreshToken);
  }

  async getUserFromToken(token: string): Promise<UserEntity | null> {
    const userId = this.tokens.verifyAccessToken(token);
    if (!userId) return null;
    return this.userRepo.findOne({ where: { id: userId } });
  }

  private async issueTokens(userId: string): Promise<AuthTokens> {
    const token = this.tokens.generateAccessToken(userId);
    const refreshToken = await this.tokens.issueRefreshToken(userId);
    return {
      token,
      refreshToken,
      expiresIn: this.config.get<number>('app.accessTokenTtlSeconds')!,
    };
  }
}
