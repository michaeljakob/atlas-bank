import { ConfigService } from '@nestjs/config';

/**
 * Decide whether to use in-memory mock providers instead of Swan.
 *
 * - `USE_MOCK_PROVIDERS=true|false` forces the choice explicitly.
 * - Otherwise we fall back to mocks whenever Swan credentials are missing,
 *   so local dev works out of the box without a Swan project.
 */
export function shouldUseMockProviders(config: ConfigService): boolean {
  const flag = process.env.USE_MOCK_PROVIDERS;
  if (flag === 'true') return true;
  if (flag === 'false') return false;

  const clientId = config.get<string>('swan.clientId');
  const clientSecret = config.get<string>('swan.clientSecret');
  return !clientId || !clientSecret;
}
