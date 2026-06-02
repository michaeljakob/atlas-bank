import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AccountProvider } from '@atlas-bank/provider-contracts';
import {
  UserEntity,
  AccountEntity,
  CardEntity,
  TransactionEntity,
  RecipientEntity,
  PaymentRequestEntity,
  OnboardingEntity,
  NotificationEntity,
} from '@/database/entities';
import { ACCOUNT_PROVIDER } from '@/providers/providers.module';

@Injectable()
export class GdprService {
  private readonly logger = new Logger(GdprService.name);

  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(AccountEntity) private readonly accountRepo: Repository<AccountEntity>,
    @InjectRepository(TransactionEntity) private readonly txRepo: Repository<TransactionEntity>,
    @InjectRepository(RecipientEntity) private readonly recipientRepo: Repository<RecipientEntity>,
    @InjectRepository(PaymentRequestEntity) private readonly paymentRequestRepo: Repository<PaymentRequestEntity>,
    @Inject(ACCOUNT_PROVIDER) private readonly accountProvider: AccountProvider,
    private readonly dataSource: DataSource,
  ) {}

  /** GDPR Art. 20 — return a machine-readable copy of the user's data. */
  async exportData(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const accounts = await this.accountRepo.find({ where: { userId } });
    const accountIds = accounts.map((a) => a.id);
    const transactions = accountIds.length
      ? await this.txRepo
          .createQueryBuilder('t')
          .where('t.accountId IN (:...ids)', { ids: accountIds })
          .orderBy('t.createdAt', 'DESC')
          .getMany()
      : [];
    const recipients = await this.recipientRepo.find({ where: { userId } });
    const paymentRequests = await this.paymentRequestRepo.find({ where: { userId } });

    return {
      exportedAt: new Date().toISOString(),
      profile: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        nationality: user.nationality,
        residenceCountry: user.residenceCountry,
        residenceAddress: user.residenceAddress,
        createdAt: user.createdAt,
      },
      accounts: accounts.map((a) => ({
        id: a.id,
        iban: a.iban,
        bic: a.bic,
        currency: a.currency,
        status: a.status,
        balanceCents: Number(a.balanceCents),
      })),
      transactions: transactions.map((t) => ({
        id: t.id,
        direction: t.direction,
        status: t.status,
        amountCents: Number(t.amountCents),
        currency: t.currency,
        counterpartyName: t.counterpartyName,
        reference: t.reference,
        createdAt: t.createdAt,
      })),
      recipients,
      paymentRequests,
    };
  }

  /**
   * GDPR Art. 17 — account closure + erasure. Closes provider accounts, then
   * removes related rows and anonymises the user record. Note: some data must
   * be retained for AML/regulatory periods; in production this should soft-delete
   * and schedule purge after the legal retention window.
   */
  async deleteAccount(userId: string): Promise<{ deleted: true }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const accounts = await this.accountRepo.find({ where: { userId } });
    for (const account of accounts) {
      try {
        await this.accountProvider.closeAccount(account.providerAccountId);
      } catch (err) {
        this.logger.error(`Failed to close provider account ${account.providerAccountId}`, err as Error);
      }
    }

    await this.dataSource.transaction(async (manager) => {
      const accountIds = accounts.map((a) => a.id);
      if (accountIds.length) {
        await manager
          .createQueryBuilder()
          .delete()
          .from(TransactionEntity)
          .where('accountId IN (:...ids)', { ids: accountIds })
          .execute();
        await manager
          .createQueryBuilder()
          .delete()
          .from(CardEntity)
          .where('accountId IN (:...ids)', { ids: accountIds })
          .execute();
      }
      await manager.delete(AccountEntity, { userId });
      await manager.delete(RecipientEntity, { userId });
      await manager.delete(PaymentRequestEntity, { userId });
      await manager.delete(NotificationEntity, { userId });
      await manager.delete(OnboardingEntity, { userId });
      await manager.delete(UserEntity, { id: userId });
    });

    this.logger.warn(`User ${userId} erased (GDPR deletion)`);
    return { deleted: true };
  }
}
