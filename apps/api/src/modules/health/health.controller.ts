import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from '@/common/guards/auth.guard';
import { CacheService } from '@/common/cache/cache.service';

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cache: CacheService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  liveness() {
    return { status: 'ok', uptime: process.uptime() };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe — checks DB and cache' })
  async readiness() {
    const checks: Record<string, 'ok' | 'error'> = {};
    try {
      await this.dataSource.query('SELECT 1');
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
    }
    try {
      await this.cache.set('health:ping', '1', 5);
      checks.cache = (await this.cache.get('health:ping')) === '1' ? 'ok' : 'error';
    } catch {
      checks.cache = 'error';
    }
    const healthy = Object.values(checks).every((v) => v === 'ok');
    return { status: healthy ? 'ok' : 'degraded', checks };
  }
}
