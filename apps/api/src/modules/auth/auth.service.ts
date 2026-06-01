import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, createHmac } from 'crypto';
import { UserEntity } from '@/database/entities';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpStore = new Map<string, { code: string; expiresAt: number }>();

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly config: ConfigService,
  ) {}

  async sendMagicLink(email: string): Promise<{ sent: boolean }> {
    const code = randomBytes(3).toString('hex').toUpperCase();
    this.otpStore.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

    // In production: send email via SendGrid/Resend/etc.
    this.logger.log(`OTP for ${email}: ${code}`);

    return { sent: true };
  }

  async verifyOtp(email: string, code: string): Promise<{ token: string; isNewUser: boolean }> {
    const stored = this.otpStore.get(email);
    if (!stored || stored.code !== code || Date.now() > stored.expiresAt) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    this.otpStore.delete(email);

    let user = await this.userRepo.findOne({ where: { email } });
    const isNewUser = !user;

    if (!user) {
      user = this.userRepo.create({ email, emailVerified: true, firstName: '', lastName: '', dateOfBirth: '', nationality: '', residenceCountry: '' });
      user = await this.userRepo.save(user);
    } else {
      user.emailVerified = true;
      user.lastLoginAt = new Date();
      await this.userRepo.save(user);
    }

    const token = this.generateToken(user.id);
    return { token, isNewUser };
  }

  async getUserFromToken(token: string): Promise<UserEntity | null> {
    const userId = this.verifyToken(token);
    if (!userId) return null;
    return this.userRepo.findOne({ where: { id: userId } });
  }

  private generateToken(userId: string): string {
    const secret = this.config.get<string>('app.jwtSecret') || 'dev-secret';
    const payload = JSON.stringify({ sub: userId, iat: Date.now() });
    const signature = createHmac('sha256', secret).update(payload).digest('base64url');
    const encodedPayload = Buffer.from(payload).toString('base64url');
    return `${encodedPayload}.${signature}`;
  }

  private verifyToken(token: string): string | null {
    try {
      const [encodedPayload, signature] = token.split('.');
      const secret = this.config.get<string>('app.jwtSecret') || 'dev-secret';
      const expectedSig = createHmac('sha256', secret).update(Buffer.from(encodedPayload, 'base64url').toString()).digest('base64url');

      if (signature !== expectedSig) return null;

      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
      return payload.sub;
    } catch {
      return null;
    }
  }
}
