import { ConfigService } from '@nestjs/config';

/** Minimal ConfigService stub backed by the app config keys used in tests. */
export function makeConfig(overrides: Record<string, unknown> = {}): ConfigService {
  const values: Record<string, unknown> = {
    'app.env': 'test',
    'app.jwtSecret': 'test-secret',
    'app.accessTokenTtlSeconds': 3600,
    'app.refreshTokenTtlSeconds': 2592000,
    'app.cookieDomain': undefined,
    ...overrides,
  };
  return {
    get: (key: string) => values[key],
  } as unknown as ConfigService;
}
