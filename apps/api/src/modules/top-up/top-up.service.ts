import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AccountEntity, TransactionEntity } from '@/database/entities';
import { isAuthBypassEnabled } from '@/common/guards/auth.guard';

export interface TopUpInstructions {
  currency: string;
  iban: string;
  bic: string;
  holderName: string;
  reference: string;
  methods: { name: string; processingTime: string; cost: string }[];
}

@Injectable()
export class TopUpService {
  private readonly logger = new Logger(TopUpService.name);

  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Funding for an EMI account is done by an inbound bank transfer to the
   * account's own IBAN. We return the real account details so the user can
   * push funds from their external bank. We never expose placeholder IBANs.
   */
  async getInstructions(userId: string): Promise<TopUpInstructions[]> {
    const accounts = await this.accountRepo.find({ where: { userId } });
    if (accounts.length === 0) throw new NotFoundException('No account found');

    return accounts
      .filter((a) => a.iban)
      .map((a) => ({
        currency: a.currency,
        iban: a.iban,
        bic: a.bic,
        holderName: a.holderName,
        reference: `AURIGA-${a.id.slice(0, 8).toUpperCase()}`,
        methods: [
          { name: 'Standard SEPA', processingTime: '1 business day', cost: 'Free' },
          { name: 'Instant SEPA', processingTime: 'Within seconds', cost: 'Depends on your bank' },
        ],
      }));
  }

  /**
   * Sandbox-only helper to credit an account so the fund → send happy path can
   * be tested end-to-end. Hard-gated: never runs in production. In a real
   * environment, credits arrive via Swan webhooks (Transaction.Booked).
   */
  async simulateCredit(userId: string, amountCents: number, currency = 'EUR') {
    const sandbox = isAuthBypassEnabled() || process.env.SWAN_SANDBOX === 'true';
    if (process.env.NODE_ENV === 'production' || !sandbox) {
      throw new ForbiddenException('Simulated top-ups are only available in sandbox');
    }
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      throw new BadRequestException('Amount must be a positive integer (cents)');
    }

    const account = await this.accountRepo.findOne({ where: { userId, currency } });
    if (!account) throw new NotFoundException(`No ${currency} account found`);

    return this.dataSource.transaction(async (manager) => {
      await manager.increment(AccountEntity, { id: account.id }, 'balanceCents', amountCents);
      const tx = manager.create(TransactionEntity, {
        accountId: account.id,
        providerTransactionId: `sandbox-topup-${Date.now()}`,
        direction: 'inbound' as const,
        status: 'settled' as const,
        amountCents,
        currency,
        counterpartyName: 'Sandbox top-up',
        reference: 'Simulated incoming transfer',
        category: 'transfer',
        bookedAt: new Date(),
      });
      await manager.save(tx);
      this.logger.warn(`Sandbox credit of ${amountCents} ${currency} to account ${account.id}`);
      return { credited: amountCents, currency, transactionId: tx.id };
    });
  }
}
