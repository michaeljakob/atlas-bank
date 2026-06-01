import { registerAs } from '@nestjs/config';

export default registerAs('swan', () => ({
  apiUrl: process.env.SWAN_API_URL || 'https://api.swan.io',
  oauthUrl: process.env.SWAN_OAUTH_URL || 'https://oauth.swan.io',
  clientId: process.env.SWAN_CLIENT_ID,
  clientSecret: process.env.SWAN_CLIENT_SECRET,
  projectId: process.env.SWAN_PROJECT_ID,
  webhookSecret: process.env.SWAN_WEBHOOK_SECRET,
  sandboxMode: process.env.SWAN_SANDBOX === 'true',
}));
