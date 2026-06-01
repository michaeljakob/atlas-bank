import { Module } from '@nestjs/common';
import { SwanClient } from './swan.client';
import { SwanOnboardingProvider } from './swan-onboarding.provider';
import { SwanAccountProvider } from './swan-account.provider';
import { SwanCardProvider } from './swan-card.provider';
import { SwanPaymentProvider } from './swan-payment.provider';
import { SwanWebhookHandler } from './swan-webhook.handler';
import {
  ONBOARDING_PROVIDER,
  ACCOUNT_PROVIDER,
  CARD_PROVIDER,
  PAYMENT_PROVIDER,
} from '../providers.module';

@Module({
  providers: [
    SwanClient,
    SwanWebhookHandler,
    { provide: ONBOARDING_PROVIDER, useClass: SwanOnboardingProvider },
    { provide: ACCOUNT_PROVIDER, useClass: SwanAccountProvider },
    { provide: CARD_PROVIDER, useClass: SwanCardProvider },
    { provide: PAYMENT_PROVIDER, useClass: SwanPaymentProvider },
  ],
  exports: [
    SwanClient,
    SwanWebhookHandler,
    ONBOARDING_PROVIDER,
    ACCOUNT_PROVIDER,
    CARD_PROVIDER,
    PAYMENT_PROVIDER,
  ],
})
export class SwanModule {}
