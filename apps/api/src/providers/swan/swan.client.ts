import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLClient } from 'graphql-request';

@Injectable()
export class SwanClient {
  private readonly logger = new Logger(SwanClient.name);
  private client: GraphQLClient;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(private readonly config: ConfigService) {
    const apiUrl = this.config.get<string>('swan.apiUrl')!;
    this.client = new GraphQLClient(`${apiUrl}/graphql`);
  }

  async getClient(): Promise<GraphQLClient> {
    await this.ensureAuthenticated();
    return this.client;
  }

  private async ensureAuthenticated(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60_000) {
      return;
    }
    await this.refreshToken();
  }

  private async refreshToken(): Promise<void> {
    const oauthUrl = this.config.get<string>('swan.oauthUrl')!;
    const clientId = this.config.get<string>('swan.clientId')!;
    const clientSecret = this.config.get<string>('swan.clientSecret')!;

    const response = await fetch(`${oauthUrl}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'openid',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Swan OAuth token refresh failed: ${error}`);
      throw new Error('Failed to authenticate with Swan');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
    this.client = new GraphQLClient(
      `${this.config.get<string>('swan.apiUrl')}/graphql`,
      { headers: { Authorization: `Bearer ${this.accessToken}` } },
    );

    this.logger.log('Swan OAuth token refreshed');
  }

  async query<T>(document: string, variables?: Record<string, unknown>): Promise<T> {
    const client = await this.getClient();
    return client.request<T>(document, variables);
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = this.config.get<string>('swan.webhookSecret');
    if (!secret || !signature) return false;

    const crypto = require('crypto');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    // timingSafeEqual throws on length mismatch — guard first.
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  }
}
