import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountProvider } from '@auriga-money/provider-contracts';
import {
  WebhookEventEntity,
  OnboardingEntity,
  AccountEntity,
  TransactionEntity,
  UserEntity,
} from '@/database/entities';
import { SwanWebhookHandler, SwanWebhookPayload } from '@/providers/swan/swan-webhook.handler';
import { ACCOUNT_PROVIDER } from '@/providers/providers.module';
import { EmailService } from '@/modules/email/email.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(WebhookEventEntity)
    private readonly webhookRepo: Repository<WebhookEventEntity>,
    @InjectRepository(OnboardingEntity)
    private readonly onboardingRepo: Repository<OnboardingEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly swanWebhook: SwanWebhookHandler,
    @Inject(ACCOUNT_PROVIDER)
    private readonly accountProvider: AccountProvider,
    private readonly email: EmailService,
  ) {}

  async handleSwanWebhook(rawBody: string, signature: string): Promise<void> {
    if (!this.swanWebhook.verifySignature(rawBody, signature)) {
      this.logger.warn('Invalid webhook signature');
      throw new Error('Invalid signature');
    }

    const event = this.swanWebhook.parseEvent(rawBody);
    await this.persistAndProcess(event);
  }

  private async persistAndProcess(event: SwanWebhookPayload): Promise<void> {
    const existing = await this.webhookRepo.findOne({
      where: { providerEventId: event.eventId },
    });

    if (existing) {
      this.logger.debug(`Duplicate webhook event: ${event.eventId}`);
      return;
    }

    const entity = this.webhookRepo.create({
      providerEventId: event.eventId,
      eventType: event.eventType,
      resourceId: event.resourceId,
      rawPayload: event as unknown as Record<string, unknown>,
      processingStatus: 'processing',
    });
    await this.webhookRepo.save(entity);

    try {
      await this.routeEvent(event);
      entity.processingStatus = 'processed';
      entity.processedAt = new Date();
    } catch (err) {
      entity.processingStatus = 'failed';
      entity.errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Webhook processing failed: ${event.eventId}`, err);
    }

    await this.webhookRepo.save(entity);
  }

  private async routeEvent(event: SwanWebhookPayload): Promise<void> {
    switch (event.eventType) {
      case 'Onboarding.Updated':
        await this.handleOnboardingUpdate(event);
        break;
      case 'Transaction.Booked':
      case 'Transaction.Pending':
        await this.handleTransactionUpdate(event);
        break;
      case 'Account.Updated':
        await this.handleAccountUpdate(event);
        break;
      default:
        this.logger.debug(`Unhandled webhook event type: ${event.eventType}`);
    }
  }

  private async handleOnboardingUpdate(event: SwanWebhookPayload): Promise<void> {
    const onboarding = await this.onboardingRepo.findOne({
      where: { providerOnboardingId: event.resourceId },
    });
    if (!onboarding) return;

    const status = (event as any).status;
    if (status === 'Finalized') {
      onboarding.status = 'kyc_verified';
      onboarding.kycCompletedAt = new Date();
    } else if (status === 'Invalid') {
      onboarding.status = 'kyc_rejected';
    }

    await this.onboardingRepo.save(onboarding);
  }

  /**
   * Upserts the transaction projection and refreshes the account balance from
   * Swan (the authoritative source — we never compute balances locally).
   */
  private async handleTransactionUpdate(event: SwanWebhookPayload): Promise<void> {
    const providerTx = await this.accountProvider.getTransaction(event.resourceId);

    const account = await this.accountRepo.findOne({
      where: { providerAccountId: providerTx.accountId },
    });
    if (!account) {
      this.logger.warn(`No local account for provider account ${providerTx.accountId}`);
      return;
    }

    const existing = await this.txRepo.findOne({
      where: { providerTransactionId: providerTx.providerId },
    });

    // Capture prior settlement state so we only notify on the
    // pending/new -> settled transition (idempotent across re-deliveries).
    const wasAlreadySettled = existing?.status === 'settled';

    if (existing) {
      existing.status = providerTx.status;
      existing.amountCents = providerTx.amount.amount;
      existing.bookedAt = providerTx.bookedAt ? new Date(providerTx.bookedAt) : existing.bookedAt;
      await this.txRepo.save(existing);
    } else {
      await this.txRepo.save(
        this.txRepo.create({
          accountId: account.id,
          providerTransactionId: providerTx.providerId,
          direction: providerTx.direction,
          status: providerTx.status,
          amountCents: providerTx.amount.amount,
          currency: providerTx.amount.currency,
          counterpartyName: providerTx.counterpartyName,
          counterpartyIban: providerTx.counterpartyIban,
          reference: providerTx.reference,
          bookedAt: providerTx.bookedAt ? new Date(providerTx.bookedAt) : undefined,
        }),
      );
    }

    // Swan is authoritative for balances; refresh rather than increment locally.
    try {
      const balance = await this.accountProvider.getBalance(account.providerAccountId);
      account.balanceCents = balance.amount;
      account.lastReconciledAt = new Date();
      await this.accountRepo.save(account);
    } catch (err) {
      this.logger.error(`Failed to refresh balance for account ${account.id}`, err as Error);
    }

    // Notify the account holder the moment an incoming payment lands — sent
    // exactly once per transaction, on settlement.
    const justSettledInbound =
      event.eventType === 'Transaction.Booked' &&
      providerTx.direction === 'inbound' &&
      providerTx.status === 'settled' &&
      !wasAlreadySettled;

    if (justSettledInbound) {
      await this.notifyIncomingPayment(account, providerTx);
    }
  }

  private async notifyIncomingPayment(
    account: AccountEntity,
    providerTx: { amount: { amount: number; currency: string }; counterpartyName: string; reference?: string },
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: account.userId } });
    if (!user) {
      this.logger.warn(`No user for account ${account.id}; skipping incoming payment email`);
      return;
    }

    this.email
      .sendPaymentReceived(user.email, {
        amount: providerTx.amount.amount,
        currency: providerTx.amount.currency,
        senderName: providerTx.counterpartyName || 'a sender',
        reference: providerTx.reference,
        newBalanceCents: Number(account.balanceCents),
        appUrl: process.env.APP_URL || 'http://localhost:3000',
      })
      .catch((err) => this.logger.warn(`Incoming payment email failed: ${err.message}`));
  }

  private async handleAccountUpdate(event: SwanWebhookPayload): Promise<void> {
    const account = await this.accountRepo.findOne({
      where: { providerAccountId: event.resourceId },
    });
    if (!account) return;

    try {
      const live = await this.accountProvider.getAccount(event.resourceId);
      account.status = live.status;
      account.balanceCents = live.balance.amount;
      account.lastReconciledAt = new Date();
      await this.accountRepo.save(account);
    } catch (err) {
      this.logger.error(`Failed to refresh account ${account.id}`, err as Error);
    }
  }
}
