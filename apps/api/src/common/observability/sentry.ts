import { Logger } from '@nestjs/common';

const logger = new Logger('Sentry');

let sentry: any = null;

/**
 * Initialise Sentry if SENTRY_DSN is configured. Loaded dynamically so the
 * dependency is optional — the app runs fine without @sentry/node installed.
 */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    sentry = require('@sentry/node');
    sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1,
    });
    logger.log('Sentry initialised');
  } catch {
    logger.warn('SENTRY_DSN set but @sentry/node is not installed');
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!sentry) return;
  try {
    sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    // never let error reporting throw
  }
}
