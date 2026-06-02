import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { AccountProvider } from '@atlas-bank/provider-contracts';
import { generateIban, SEPA_BIC_ATLAS } from '@atlas-bank/shared';
import { AccountEntity, TransactionEntity } from '@/database/entities';
import { ACCOUNT_PROVIDER } from '@/providers/providers.module';

const SUPPORTED_CURRENCIES = [
  'EUR', 'USD', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'HKD', 'SGD', 'CNY',
];

/** IBAN country prefix to use per account currency. */
const CURRENCY_IBAN_COUNTRY: Record<string, string> = {
  EUR: 'DE', CHF: 'CH', GBP: 'GB',
};

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,
    @Inject(ACCOUNT_PROVIDER)
    private readonly accountProvider: AccountProvider,
  ) {}

  async getAccount(userId: string) {
    const account = await this.accountRepo.findOne({ where: { userId } });
    if (!account) throw new NotFoundException('No account found');

    return {
      id: account.id,
      status: account.status,
      iban: account.iban,
      bic: account.bic,
      holderName: account.holderName,
      balance: { amount: Number(account.balanceCents), currency: account.currency },
      lastReconciledAt: account.lastReconciledAt,
    };
  }

  async getBalance(userId: string) {
    const account = await this.accountRepo.findOne({ where: { userId } });
    if (!account) throw new NotFoundException('No account found');

    const liveBalance = await this.accountProvider.getBalance(account.providerAccountId);

    account.balanceCents = liveBalance.amount;
    account.lastReconciledAt = new Date();
    await this.accountRepo.save(account);

    return liveBalance;
  }

  async getAllAccounts(userId: string) {
    const accounts = await this.accountRepo.find({ where: { userId } });
    return accounts.map(a => ({
      id: a.id,
      status: a.status,
      iban: a.iban,
      bic: a.bic,
      holderName: a.holderName,
      currency: a.currency,
      balance: { amount: Number(a.balanceCents), currency: a.currency },
    }));
  }

  async openAccount(userId: string, currency: string) {
    const code = (currency || '').toUpperCase();
    if (!SUPPORTED_CURRENCIES.includes(code)) {
      throw new BadRequestException(`Unsupported currency: ${currency}`);
    }

    const existing = await this.accountRepo.findOne({
      where: { userId, currency: code },
    });
    if (existing) {
      throw new ConflictException(`You already hold a ${code} account`);
    }

    // Reuse the holder name from the user's primary account so all wallets
    // belong to the same verified identity.
    const primary = await this.accountRepo.findOne({ where: { userId } });
    if (!primary) {
      throw new NotFoundException('No account found to open a currency wallet against');
    }

    const account = this.accountRepo.create({
      userId,
      providerAccountId: `local-${code.toLowerCase()}-${randomUUID()}`,
      status: 'active',
      iban: generateIban(CURRENCY_IBAN_COUNTRY[code] ?? 'DE'),
      bic: SEPA_BIC_ATLAS,
      holderName: primary.holderName,
      balanceCents: 0,
      currency: code,
    });
    await this.accountRepo.save(account);

    return {
      id: account.id,
      status: account.status,
      iban: account.iban,
      bic: account.bic,
      holderName: account.holderName,
      currency: account.currency,
      balance: { amount: Number(account.balanceCents), currency: account.currency },
    };
  }

  async getTransactions(userId: string, cursor?: string, limit = 20) {
    const account = await this.accountRepo.findOne({ where: { userId } });
    if (!account) throw new NotFoundException('No account found');

    // Best-effort sync from the provider. If the provider is unavailable
    // (e.g. local dev without live Swan credentials) we still return the
    // transactions already persisted in our own database.
    let hasNextPage = false;
    let nextCursor: string | undefined;
    try {
      const providerTxs = await this.accountProvider.listTransactions({
        accountId: account.providerAccountId,
        cursor,
        limit,
      });

      for (const tx of providerTxs.items) {
        const existing = await this.txRepo.findOne({
          where: { providerTransactionId: tx.providerId },
        });

        if (!existing) {
          await this.txRepo.save(
            this.txRepo.create({
              accountId: account.id,
              providerTransactionId: tx.providerId,
              direction: tx.direction,
              status: tx.status,
              amountCents: tx.amount.amount,
              currency: tx.amount.currency,
              counterpartyName: tx.counterpartyName,
              counterpartyIban: tx.counterpartyIban,
              reference: tx.reference,
              bookedAt: tx.bookedAt ? new Date(tx.bookedAt) : undefined,
            }),
          );
        } else if (existing.status !== tx.status) {
          existing.status = tx.status;
          existing.bookedAt = tx.bookedAt ? new Date(tx.bookedAt) : existing.bookedAt;
          await this.txRepo.save(existing);
        }
      }

      hasNextPage = providerTxs.hasNextPage;
      nextCursor = providerTxs.cursor;
    } catch {
      // Provider unreachable — fall back to locally persisted transactions.
    }

    const localTxs = await this.txRepo.find({
      where: { accountId: account.id },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return {
      items: localTxs,
      hasNextPage,
      cursor: nextCursor,
    };
  }
}
