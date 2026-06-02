import { Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwanClient } from './swan.client';
import { SwanOnboardingProvider } from './swan-onboarding.provider';
import { SwanAccountProvider } from './swan-account.provider';
import { SwanCardProvider } from './swan-card.provider';
import { SwanPaymentProvider } from './swan-payment.provider';
import { SwanWebhookHandler } from './swan-webhook.handler';
import { MockProviderStore } from '../mock/mock-store';
import { MockOnboardingProvider } from '../mock/mock-onboarding.provider';
import { MockAccountProvider } from '../mock/mock-account.provider';
import { MockCardProvider } from '../mock/mock-card.provider';
import { MockPaymentProvider } from '../mock/mock-payment.provider';
import { shouldUseMockProviders } from '../mock/use-mock';
import {
  ONBOARDING_PROVIDER,
  ACCOUNT_PROVIDER,
  CARD_PROVIDER,
  PAYMENT_PROVIDER,
} from '../provider-tokens';

const logger = new Logger('ProviderResolver');
let announced = false;

function announce(config: ConfigService) {
  if (announced) return;
  announced = true;
  if (shouldUseMockProviders(config)) {
    logger.warn(
      'Using in-memory MOCK banking providers (no Swan credentials). KYC auto-approves — development only.',
    );
  } else {
    logger.log('Using Swan banking providers.');
  }
}

@Module({
  providers: [
    SwanClient,
    SwanWebhookHandler,
    MockProviderStore,
    {
      provide: ONBOARDING_PROVIDER,
      inject: [ConfigService, SwanClient, MockProviderStore],
      useFactory: (config: ConfigService, swan: SwanClient, store: MockProviderStore) => {
        announce(config);
        return shouldUseMockProviders(config)
          ? new MockOnboardingProvider(store)
          : new SwanOnboardingProvider(swan);
      },
    },
    {
      provide: ACCOUNT_PROVIDER,
      inject: [ConfigService, SwanClient, MockProviderStore],
      useFactory: (config: ConfigService, swan: SwanClient, store: MockProviderStore) =>
        shouldUseMockProviders(config)
          ? new MockAccountProvider(store)
          : new SwanAccountProvider(swan),
    },
    {
      provide: CARD_PROVIDER,
      inject: [ConfigService, SwanClient, MockProviderStore],
      useFactory: (config: ConfigService, swan: SwanClient, store: MockProviderStore) =>
        shouldUseMockProviders(config)
          ? new MockCardProvider(store)
          : new SwanCardProvider(swan),
    },
    {
      provide: PAYMENT_PROVIDER,
      inject: [ConfigService, SwanClient],
      useFactory: (config: ConfigService, swan: SwanClient) =>
        shouldUseMockProviders(config)
          ? new MockPaymentProvider()
          : new SwanPaymentProvider(swan),
    },
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
