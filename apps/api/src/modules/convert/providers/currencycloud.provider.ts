import { Injectable, Logger } from '@nestjs/common';
import { FxProvider, FxRate, FxQuote } from './fx-provider.interface';

const SUPPORTED = [
  'EUR', 'USD', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'HKD', 'SGD', 'CNY',
] as const;

/**
 * CurrencyCloud provider stub.
 * Replace the placeholder credentials and API calls with real
 * CurrencyCloud SDK calls when ready to go live.
 *
 * ENV required:
 *   CURRENCYCLOUD_LOGIN_ID
 *   CURRENCYCLOUD_API_KEY
 *   CURRENCYCLOUD_ENV=demo|production
 */
@Injectable()
export class CurrencyCloudProvider implements FxProvider {
  readonly name = 'currencycloud';
  readonly supportedCurrencies = [...SUPPORTED];

  private readonly logger = new Logger(CurrencyCloudProvider.name);
  private readonly loginId = process.env.CURRENCYCLOUD_LOGIN_ID ?? '';
  private readonly apiKey = process.env.CURRENCYCLOUD_API_KEY ?? '';
  private readonly env = process.env.CURRENCYCLOUD_ENV ?? 'demo';

  private get baseUrl(): string {
    return this.env === 'production'
      ? 'https://api.currencycloud.com/v2'
      : 'https://devapi.currencycloud.com/v2';
  }

  private authToken: string | null = null;
  private tokenExpiresAt = 0;

  private async authenticate(): Promise<string> {
    if (this.authToken && Date.now() < this.tokenExpiresAt) {
      return this.authToken;
    }

    // TODO: Replace with real CurrencyCloud auth
    // POST /v2/authenticate/api
    // body: { login_id, api_key }
    this.logger.warn('CurrencyCloud auth stub — using mock token');
    this.authToken = 'mock-token';
    this.tokenExpiresAt = Date.now() + 25 * 60 * 1000; // 25 min
    return this.authToken;

    /* Real implementation:
    const res = await fetch(`${this.baseUrl}/authenticate/api`, {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: new URLSearchParams({
        login_id: this.loginId,
        api_key: this.apiKey,
      }),
    });
    const data = await res.json();
    this.authToken = data.auth_token;
    this.tokenExpiresAt = Date.now() + 25 * 60 * 1000;
    return this.authToken!;
    */
  }

  async fetchRates(baseCurrency: string): Promise<FxRate[]> {
    await this.authenticate();
    const targets = this.supportedCurrencies.filter((c) => c !== baseCurrency);

    // TODO: Replace with real CurrencyCloud rates endpoint
    // GET /v2/rates/find?currency_pair=EURUSD,EURGBP,...
    this.logger.warn('CurrencyCloud fetchRates stub — falling back to Frankfurter');

    const fallback = await fetch(
      `https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targets.join(',')}`,
    );
    const data = await fallback.json();
    const now = new Date();

    return targets.map((target) => ({
      base: baseCurrency,
      target,
      rate: data.rates[target] ?? 0,
      timestamp: now,
    }));

    /* Real implementation:
    const pairs = targets.map((t) => `${baseCurrency}${t}`).join(',');
    const res = await fetch(
      `${this.baseUrl}/rates/find?currency_pair=${pairs}`,
      { headers: { 'X-Auth-Token': this.authToken! } },
    );
    const data = await res.json();
    return data.rates.map((r: any) => ({
      base: r.currency_pair.slice(0, 3),
      target: r.currency_pair.slice(3),
      rate: parseFloat(r.client_rate),
      timestamp: new Date(r.settlement_cut_off_time),
    }));
    */
  }

  async getQuote(from: string, to: string, amountCents: number): Promise<FxQuote> {
    await this.authenticate();

    // TODO: Replace with real CurrencyCloud quote
    // POST /v2/rates/detailed
    // body: { buy_currency, sell_currency, fixed_side: 'sell', amount }
    this.logger.warn('CurrencyCloud getQuote stub — falling back to Frankfurter');

    const fallback = await fetch(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`,
    );
    const data = await fallback.json();
    const rate = data.rates[to];
    if (!rate) throw new Error(`No rate for ${from}->${to}`);

    return {
      from,
      to,
      rate,
      expiresAt: new Date(Date.now() + 30_000),
    };

    /* Real implementation:
    const res = await fetch(`${this.baseUrl}/rates/detailed`, {
      method: 'POST',
      headers: {
        'X-Auth-Token': this.authToken!,
        'Content-Type': 'multipart/form-data',
      },
      body: new URLSearchParams({
        buy_currency: to,
        sell_currency: from,
        fixed_side: 'sell',
        amount: (amountCents / 100).toFixed(2),
      }),
    });
    const data = await res.json();
    return {
      from,
      to,
      rate: parseFloat(data.client_rate),
      expiresAt: new Date(data.settlement_cut_off_time),
    };
    */
  }
}
