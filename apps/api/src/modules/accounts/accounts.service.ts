import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountProvider } from '@atlas-bank/provider-contracts';
import { AccountEntity, TransactionEntity } from '@/database/entities';
import { ACCOUNT_PROVIDER } from '@/providers/providers.module';

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

  async getTransactions(userId: string, cursor?: string, limit = 20) {
    const account = await this.accountRepo.findOne({ where: { userId } });
    if (!account) throw new NotFoundException('No account found');

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

    const localTxs = await this.txRepo.find({
      where: { accountId: account.id },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return {
      items: localTxs,
      hasNextPage: providerTxs.hasNextPage,
      cursor: providerTxs.cursor,
    };
  }
}
