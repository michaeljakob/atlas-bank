import { Controller, Post, Body, HttpCode, Res, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService, AuthTokens } from './auth.service';
import { Public } from '@/common/guards/auth.guard';
import { RateLimit, RateLimitGuard } from '@/common/guards/rate-limit.guard';

class SendOtpDto {
  @IsEmail()
  email: string;
}

class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

export const ACCESS_COOKIE = 'atlas_token';
export const REFRESH_COOKIE = 'atlas_refresh';

@ApiTags('auth')
@Public()
@UseGuards(RateLimitGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('otp/send')
  @HttpCode(200)
  @RateLimit({ limit: 5, windowSeconds: 60 })
  @ApiOperation({ summary: 'Send passwordless OTP to email' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendMagicLink(dto.email);
  }

  @Post('otp/verify')
  @HttpCode(200)
  @RateLimit({ limit: 10, windowSeconds: 60 })
  @ApiOperation({ summary: 'Verify OTP and receive session token' })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const result = await this.auth.verifyOtp(dto.email, dto.code);
    this.setAuthCookies(res, result);
    return { token: result.token, isNewUser: result.isNewUser, expiresIn: result.expiresIn };
  }

  @Post('refresh')
  @HttpCode(200)
  @RateLimit({ limit: 30, windowSeconds: 60 })
  @ApiOperation({ summary: 'Exchange refresh token for a new access token' })
  async refresh(
    @Req() req: FastifyRequest,
    @Body() body: { refreshToken?: string },
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const refreshToken = (req as any).cookies?.[REFRESH_COOKIE] || body?.refreshToken;
    const result = await this.auth.refresh(refreshToken);
    this.setAuthCookies(res, result);
    return { token: result.token, expiresIn: result.expiresIn };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Revoke session and clear auth cookies' })
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const refreshToken = (req as any).cookies?.[REFRESH_COOKIE];
    await this.auth.logout(refreshToken);
    res.clearCookie(ACCESS_COOKIE, { path: '/' });
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    return { ok: true };
  }

  private setAuthCookies(res: FastifyReply, tokens: AuthTokens) {
    const isProd = this.config.get('app.env') === 'production';
    const domain = this.config.get<string>('app.cookieDomain');
    const base = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
      ...(domain ? { domain } : {}),
    };
    res.setCookie(ACCESS_COOKIE, tokens.token, {
      ...base,
      maxAge: tokens.expiresIn,
    });
    res.setCookie(REFRESH_COOKIE, tokens.refreshToken, {
      ...base,
      maxAge: this.config.get<number>('app.refreshTokenTtlSeconds')!,
    });
  }
}
