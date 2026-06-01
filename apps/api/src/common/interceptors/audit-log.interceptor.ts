import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { DataSource } from 'typeorm';
import { AuditLogEntity } from '@/database/entities';

const SENSITIVE_ACTIONS = ['POST', 'PUT', 'PATCH', 'DELETE'];

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (!SENSITIVE_ACTIONS.includes(method)) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const repo = this.dataSource.getRepository(AuditLogEntity);
        repo.save({
          userId: request.user?.id,
          action: `${method} ${request.url}`,
          resourceType: this.extractResourceType(request.url),
          metadata: {
            statusCode: context.switchToHttp().getResponse().statusCode,
            durationMs: Date.now() - startTime,
          },
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        }).catch(() => {});
      }),
    );
  }

  private extractResourceType(url: string): string {
    const parts = url.split('/').filter(Boolean);
    return parts[2] || 'unknown';
  }
}
