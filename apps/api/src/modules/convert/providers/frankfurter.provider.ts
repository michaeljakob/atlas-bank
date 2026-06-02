import { Injectable, Logger } from '@nestjs/common';
import { FxProvider, FxRate, FxQuote } from './fx-provider.interface';

const SUPPORTED = [
  'EUR', 'USD', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'HKD', 'SGD', 'CNY',
] as const;

@Injectable()
export class FrankfurterProvider implements FxProvider {
  readonly name = 'frankfurter';
  readonly supportedCurrencies = [...SUPPORTED];

  private readonly logger = new Logger(FrankfurterProvider.name);
  private readonly baseUrl = 'https://api.frankfurter.app';

  async fetchRates(baseCurrency: string): Promise<FxRate[]> {
    const targets = this.supportedCurrencies.filter((c) => c !== baseCurrency);
    const url = `${this.baseUrl}/latest?from=${baseCurrency}&to=${targets.join(',')}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Frankfurter API returned ${res.status}`);
    }

    const data = await res.json();
    const now = new Date();

    return targets.map((target) => ({
      base: baseCurrency,
      target,
      rate: data.rates[target] ?? 0,
      timestamp: now,
    }));
  }

  async getQuote(from: string, to: string, _amountCents: number): Promise<FxQuote> {
    const url = `${this.baseUrl}/latest?from=${from}&to=${to}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Frankfurter API returned ${res.status}`);
    }

    const data = await res.json();
    const rate = data.rates[to];
    if (!rate) throw new Error(`No rate for ${from}->${to}`);

    return {
      from,
      to,
      rate,
      expiresAt: new Date(Date.now() + 30_000),
    };
  }
}
