import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '@/modules/auth/auth.service';
import { ACCESS_COOKIE } from '@/modules/auth/auth.controller';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * SKIP_AUTH is a development convenience only. It is hard-gated so it can never
 * take effect in a production build, regardless of the runtime env var.
 */
export function isAuthBypassEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.SKIP_AUTH === 'true';
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    if (isAuthBypassEnabled()) {
      request.user = { id: 'dev-user', email: 'dev@auriga-money.local', role: 'admin' };
      return true;
    }

    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    const user = await this.auth.getUserFromToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = user;
    return true;
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    return request.cookies?.[ACCESS_COOKIE] || null;
  }
}
