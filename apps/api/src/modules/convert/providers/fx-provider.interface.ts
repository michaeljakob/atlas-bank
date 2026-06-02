export interface FxRate {
  base: string;
  target: string;
  rate: number;
  timestamp: Date;
}

export interface FxQuote {
  from: string;
  to: string;
  rate: number;
  expiresAt: Date;
}

export interface FxProvider {
  readonly name: string;
  readonly supportedCurrencies: string[];

  fetchRates(baseCurrency: string): Promise<FxRate[]>;
  getQuote(from: string, to: string, amountCents: number): Promise<FxQuote>;
}

export const FX_PROVIDER = Symbol('FX_PROVIDER');
