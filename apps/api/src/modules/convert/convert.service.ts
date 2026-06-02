import { Injectable, Inject, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExchangeRateEntity, AccountEntity, TransactionEntity } from '@/database/entities';
import { FX_PROVIDER, FxProvider } from './providers';

const SUPPORTED_CURRENCIES = [
  'EUR', 'USD', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'HKD', 'SGD', 'CNY',
] as const;

const FEE_RATE = 0.0035;

@Injectable()
export class ConvertService {
  private readonly logger = new Logger(ConvertService.name);

  constructor(
    @Inject(FX_PROVIDER)
    private readonly fxProvider: FxProvider,
    @InjectRepository(ExchangeRateEntity)
    private readonly rateRepo: Repository<ExchangeRateEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,
    private readonly dataSource: DataSource,
  ) {
    this.logger.log(`FX provider: ${this.fxProvider.name}`);
  }

  async getRates() {
    const rates = await this.rateRepo
      .createQueryBuilder('r')
      .distinctOn(['r.baseCurrency', 'r.targetCurrency'])
      .orderBy('r.baseCurrency')
      .addOrderBy('r.targetCurrency')
      .addOrderBy('r.fetchedAt', 'DESC')
      .getMany();

    if (rates.length === 0) {
      await this.refreshRates();
      return this.rateRepo.find();
    }

    return rates;
  }

  async getQuote(from: string, to: string, amountCents: number) {
    this.validateCurrencies(from, to);
    const rate = await this.getRate(from, to);
    const feeCents = Math.round(amountCents * FEE_RATE);
    const netAmountCents = amountCents - feeCents;
    const convertedCents = Math.round(netAmountCents * rate);

    return {
      from,
      to,
      amountCents,
      feeCents,
      feeRate: FEE_RATE,
      rate,
      convertedCents,
      expiresIn: 30,
    };
  }

  async convert(userId: string, from: string, to: string, amountCents: number) {
    this.validateCurrencies(from, to);

    // Atlas does not yet hold a real multi-currency settlement rail. Until one
    // is integrated (e.g. Airwallex/CurrencyCloud), we must NOT move money via a
    // synthetic local ledger — that would invent balances. Quotes/rates stay live.
    if (process.env.FX_SETTLEMENT_ENABLED !== 'true') {
      throw new BadRequestException(
        'Currency conversion is not available yet. Live quotes are shown for reference only.',
      );
    }

    const sourceAccount = await this.accountRepo.findOne({ where: { userId, currency: from } });
    if (!sourceAccount) throw new NotFoundException(`No ${from} account found`);
    if (Number(sourceAccount.balanceCents) < amountCents) {
      throw new BadRequestException('Insufficient balance');
    }

    let targetAccount = await this.accountRepo.findOne({ where: { userId, currency: to } });
    if (!targetAccount) {
      targetAccount = this.accountRepo.create({
        userId,
        providerAccountId: `local-${to.toLowerCase()}-${userId.slice(0, 8)}`,
        status: 'active',
        iban: '',
        bic: '',
        holderName: sourceAccount.holderName,
        balanceCents: 0,
        currency: to,
      });
      targetAccount = await this.accountRepo.save(targetAccount);
    }

    const quote = await this.getQuote(from, to, amountCents);

    return this.dataSource.transaction(async (manager) => {
      await manager.decrement(AccountEntity, { id: sourceAccount.id }, 'balanceCents', amountCents);
      await manager.increment(AccountEntity, { id: targetAccount!.id }, 'balanceCents', quote.convertedCents);

      const debitTx = manager.create(TransactionEntity, {
        accountId: sourceAccount.id,
        providerTransactionId: `convert-${Date.now()}-debit`,
        direction: 'outbound' as const,
        status: 'settled' as const,
        amountCents,
        currency: from,
        counterpartyName: `Convert to ${to}`,
        reference: `FX ${from}\u2192${to} @${quote.rate.toFixed(6)}`,
      });

      const creditTx = manager.create(TransactionEntity, {
        accountId: targetAccount!.id,
        providerTransactionId: `convert-${Date.now()}-credit`,
        direction: 'inbound' as const,
        status: 'settled' as const,
        amountCents: quote.convertedCents,
        currency: to,
        counterpartyName: `Convert from ${from}`,
        reference: `FX ${from}\u2192${to} @${quote.rate.toFixed(6)}`,
      });

      await manager.save([debitTx, creditTx]);

      return { ...quote, status: 'completed' };
    });
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async refreshRates() {
    try {
      const allRates: { baseCurrency: string; targetCurrency: string; rate: number }[] = [];

      for (const base of SUPPORTED_CURRENCIES) {
        const rates = await this.fxProvider.fetchRates(base);
        for (const r of rates) {
          allRates.push({
            baseCurrency: r.base,
            targetCurrency: r.target,
            rate: r.rate,
          });
        }
      }

      if (allRates.length > 0) {
        await this.rateRepo.save(allRates.map((r) => this.rateRepo.create(r)));
        this.logger.log(`Refreshed ${allRates.length} rates via ${this.fxProvider.name}`);
      }
    } catch (error) {
      this.logger.error('Failed to refresh exchange rates', error);
    }
  }

  private validateCurrencies(from: string, to: string) {
    if (from === to) throw new BadRequestException('Cannot convert to same currency');
    if (!SUPPORTED_CURRENCIES.includes(from as any)) {
      throw new BadRequestException(`Unsupported currency: ${from}`);
    }
    if (!SUPPORTED_CURRENCIES.includes(to as any)) {
      throw new BadRequestException(`Unsupported currency: ${to}`);
    }
  }

  private async getRate(from: string, to: string): Promise<number> {
    const rate = await this.rateRepo.findOne({
      where: { baseCurrency: from, targetCurrency: to },
      order: { fetchedAt: 'DESC' },
    });
    if (!rate) {
      await this.refreshRates();
      const fresh = await this.rateRepo.findOne({
        where: { baseCurrency: from, targetCurrency: to },
        order: { fetchedAt: 'DESC' },
      });
      if (!fresh) throw new BadRequestException(`No rate available for ${from}\u2192${to}`);
      return Number(fresh.rate);
    }
    return Number(rate.rate);
  }
}
