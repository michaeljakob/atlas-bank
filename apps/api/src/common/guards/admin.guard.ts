import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@/database/entities/user.entity';

export const ADMIN_ONLY_KEY = 'adminOnly';

/**
 * Marks a route (or controller) as admin-only. Combine with the global
 * AuthGuard (which populates `request.user`) and `AdminGuard`.
 */
export const AdminOnly = () => SetMetadata(ADMIN_ONLY_KEY, true);

/**
 * Authorizes requests to `@AdminOnly()` handlers by checking the authenticated
 * user's role. Runs after the global AuthGuard, so `request.user` is already
 * resolved (a full UserEntity in normal mode, or the dev-bypass stub).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const adminOnly = this.reflector.getAllAndOverride<boolean>(ADMIN_ONLY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!adminOnly) return true;

    const request = context.switchToHttp().getRequest();
    const role: UserRole | undefined = request.user?.role;
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
