import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WebhookEventEntity,
  OnboardingEntity,
  AccountEntity,
  TransactionEntity,
} from '@/database/entities';
import { SwanWebhookHandler, SwanWebhookPayload } from '@/providers/swan/swan-webhook.handler';

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
    private readonly swanWebhook: SwanWebhookHandler,
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

  private async handleTransactionUpdate(event: SwanWebhookPayload): Promise<void> {
    this.logger.log(`Transaction event: ${event.eventType} for ${event.resourceId}`);
  }

  private async handleAccountUpdate(event: SwanWebhookPayload): Promise<void> {
    this.logger.log(`Account event: ${event.eventType} for ${event.resourceId}`);
  }
}
