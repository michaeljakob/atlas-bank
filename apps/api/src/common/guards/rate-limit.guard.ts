import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CacheService } from '@/common/cache/cache.service';

export interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
}

export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * Per-route fixed-window rate limit. Key is scoped by route + client IP (and
 * the request body email for auth endpoints, to throttle per-account abuse).
 */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions | undefined>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) return true;

    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.socket?.remoteAddress || 'unknown';
    const route = `${request.method}:${request.routerPath || request.url}`;
    const subject = request.body?.email ? `:${request.body.email}` : '';
    const key = `ratelimit:${route}:${ip}${subject}`;

    const count = await this.cache.increment(key, options.windowSeconds);

    if (count > options.limit) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
