import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Key/value store with TTL. Backed by Redis when REDIS_URL is set, otherwise an
 * in-process Map so local development and tests run without external services.
 *
 * The in-memory fallback is process-local and must never be relied on in
 * production (OTP codes, refresh tokens and rate-limit counters would not be
 * shared across instances and would reset on restart).
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis: Redis | null;
  private readonly memory = new Map<string, { value: string; expiresAt: number | null }>();

  constructor() {
    const url = process.env.REDIS_URL;
    if (url) {
      this.redis = new Redis(url, { maxRetriesPerRequest: 3, lazyConnect: false });
      this.redis.on('error', (err) => this.logger.error(`Redis error: ${err.message}`));
      this.logger.log('CacheService using Redis');
    } else {
      this.redis = null;
      if (process.env.NODE_ENV === 'production') {
        this.logger.error('REDIS_URL is not set in production — falling back to in-memory store');
      } else {
        this.logger.warn('REDIS_URL not set — using in-memory store (dev only)');
      }
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.redis) {
      if (ttlSeconds) await this.redis.set(key, value, 'EX', ttlSeconds);
      else await this.redis.set(key, value);
      return;
    }
    this.memory.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  async get(key: string): Promise<string | null> {
    if (this.redis) return this.redis.get(key);
    const entry = this.memory.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.memory.delete(key);
      return null;
    }
    return entry.value;
  }

  async del(key: string): Promise<void> {
    if (this.redis) {
      await this.redis.del(key);
      return;
    }
    this.memory.delete(key);
  }

  /**
   * Atomically increment a counter and return the new value. Sets the TTL on
   * first increment so windows expire. Used for fixed-window rate limiting.
   */
  async increment(key: string, ttlSeconds: number): Promise<number> {
    if (this.redis) {
      const count = await this.redis.incr(key);
      if (count === 1) await this.redis.expire(key, ttlSeconds);
      return count;
    }
    const entry = this.memory.get(key);
    const now = Date.now();
    if (!entry || (entry.expiresAt !== null && now > entry.expiresAt)) {
      this.memory.set(key, { value: '1', expiresAt: now + ttlSeconds * 1000 });
      return 1;
    }
    const next = Number(entry.value) + 1;
    entry.value = String(next);
    return next;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) await this.redis.quit();
  }
}
